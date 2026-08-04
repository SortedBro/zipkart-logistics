import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function LoanNew() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    truck: '',
    bankName: '',
    accountNumber: '',
    loanAmount: '',
    downPayment: '0',
    interestRate: '9.5',
    interestType: 'Fixed',
    installmentsMonths: '36',
    emiAmount: '',
    emiDeductionDay: '5',
    notes: '',
  });

  useEffect(() => {
    api.get('/trucks').then(res => setTrucks(res.trucks || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.truck || !form.bankName || !form.loanAmount || !form.emiAmount) {
      setError('Truck, bank name, loan amount, and monthly EMI amount are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/loans', form);
      navigate('/loans');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Add Vehicle Loan</h1>
          <Link to="/loans" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Loans
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Truck *</label>
              <select
                name="truck"
                required
                value={form.truck}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Select Truck</option>
                {trucks.map(t => (
                  <option key={t._id} value={t._id}>{t.number} ({t.type || 'Truck'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bank Name *</label>
              <input
                type="text"
                name="bankName"
                required
                value={form.bankName}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loan Account #</label>
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                placeholder="LN987654321"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Loan Amount (₹) *</label>
              <input
                type="number"
                name="loanAmount"
                required
                value={form.loanAmount}
                onChange={handleChange}
                placeholder="1500000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monthly EMI Amount (₹) *</label>
              <input
                type="number"
                name="emiAmount"
                required
                value={form.emiAmount}
                onChange={handleChange}
                placeholder="42000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tenure (Months) *</label>
              <input
                type="number"
                name="installmentsMonths"
                required
                value={form.installmentsMonths}
                onChange={handleChange}
                placeholder="36"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/loans" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Loan'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
