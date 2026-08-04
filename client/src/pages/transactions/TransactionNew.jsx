import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function TransactionNew() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    account: 'Cash in Hand',
    type: 'Credit',
    referenceNumber: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) {
      setError('Description and amount are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/transactions', form);
      navigate('/transactions');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Add Transaction</h1>
          <Link to="/transactions" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Ledger
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
              <input
                type="text"
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Received Cash Advance from Party"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Credit">Credit (Income / Inflow)</option>
                <option value="Debit">Debit (Expense / Outflow)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                required
                value={form.amount}
                onChange={handleChange}
                placeholder="15000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account</label>
              <select
                name="account"
                value={form.account}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Cash in Hand">Cash in Hand</option>
                <option value="Bank Account">Bank Account</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reference / UTR #</label>
              <input
                type="text"
                name="referenceNumber"
                value={form.referenceNumber}
                onChange={handleChange}
                placeholder="TXN98765432"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/transactions" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
