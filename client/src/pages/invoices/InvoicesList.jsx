import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ totalBilled: 0, totalCollected: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.get('/invoices');
      setInvoices(data.invoices || []);
      setStats(data.stats || { totalBilled: 0, totalCollected: 0, totalPending: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Billing & Invoices</h1>
            <p className="text-sm text-slate-500">Create GST-ready customer invoices, collect payments, and manage balances.</p>
          </div>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Create New Invoice
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Total Billed</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{stats.totalBilled?.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-emerald-600">Total Collected</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹{stats.totalCollected?.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-amber-600">Pending Amount</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">₹{stats.totalPending?.toLocaleString()}</div>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No invoices found. Click "Create New Invoice" to generate one.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Grand Total</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Pending</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-brand-600">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{inv.customerName}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">₹{inv.grandTotal?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">₹{(inv.paidAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-amber-700 font-semibold">₹{(inv.pendingAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
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
