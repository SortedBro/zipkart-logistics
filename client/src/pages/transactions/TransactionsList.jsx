import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalCredit: 0, totalDebit: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountFilter, setAccountFilter] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [accountFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const query = accountFilter ? `?account=${accountFilter}` : '';
      const data = await api.get(`/transactions${query}`);
      setTransactions(data.transactions || []);
      setStats(data.stats || { totalCredit: 0, totalDebit: 0, netBalance: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Cash & Bank Ledger</h1>
            <p className="text-sm text-slate-500">Record cash receipts, bank deposits, withdrawals, and ledger balances.</p>
          </div>
          <Link
            to="/transactions/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Add Transaction
          </Link>
        </div>

        {/* Balance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-emerald-600">Total Credits (Inflow)</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹{stats.totalCredit?.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-rose-600">Total Debits (Outflow)</div>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">₹{stats.totalDebit?.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-brand-600">Net Ledger Balance</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{stats.netBalance?.toLocaleString()}</div>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Accounts</option>
            <option value="Cash in Hand">Cash in Hand</option>
            <option value="Bank Account">Bank Account</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No transactions found.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Ref #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{tx.description}</td>
                      <td className="px-4 py-3 font-medium">{tx.account}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.type === 'Credit' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-extrabold ${tx.type === 'Credit' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{tx.referenceNumber || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
}
