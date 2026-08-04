import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function LoansList() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await api.get('/loans');
      setLoans(data.loans || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayEmi = async (loanId) => {
    try {
      await api.post(`/loans/${loanId}/pay-emi`, {});
      fetchLoans();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Vehicle Loans & EMI Tracker</h1>
            <p className="text-sm text-slate-500">Track truck financing, EMI schedules, bank accounts, and active balances.</p>
          </div>
          <Link
            to="/loans/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Add Vehicle Loan
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No active vehicle loans. Click "Add Vehicle Loan" to track financing.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Bank</th>
                    <th className="px-4 py-3">Loan Amount</th>
                    <th className="px-4 py-3">Monthly EMI</th>
                    <th className="px-4 py-3">Installments</th>
                    <th className="px-4 py-3">Pending Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{loan.truck ? loan.truck.number : 'N/A'}</td>
                      <td className="px-4 py-3">{loan.bankName}</td>
                      <td className="px-4 py-3 font-semibold">₹{loan.loanAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-extrabold text-brand-700">₹{loan.emiAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3">{loan.installmentsPaid} / {loan.installmentsMonths} mos</td>
                      <td className="px-4 py-3 font-extrabold text-rose-700">₹{loan.pendingBalance?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          loan.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {loan.status === 'Active' && (
                          <button
                            onClick={() => handlePayEmi(loan._id)}
                            className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1 rounded text-xs font-bold border border-brand-200"
                          >
                            + Pay EMI
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
