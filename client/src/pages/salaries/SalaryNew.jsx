import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function SalaryNew() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    personType: 'Driver',
    selectedId: '',
    personName: '',
    month: 'August',
    year: '2026',
    basicSalary: '',
    allowances: '0',
    incentives: '0',
    advanceDeductions: '0',
    finesDeductions: '0',
    paymentMode: 'Bank Transfer',
    notes: '',
  });

  useEffect(() => {
    api.get('/drivers').then(res => setDrivers(res.drivers || [])).catch(() => {});
    api.get('/staff').then(res => setStaff(res.users || [])).catch(() => {});
  }, []);

  const handlePersonSelect = (e) => {
    const id = e.target.value;
    if (form.personType === 'Driver') {
      const d = drivers.find(drv => drv._id === id);
      setForm(prev => ({
        ...prev,
        selectedId: id,
        personName: d?.name || '',
        basicSalary: d?.monthlySalary ? String(d.monthlySalary) : prev.basicSalary,
      }));
    } else {
      const s = staff.find(st => st._id === id);
      setForm(prev => ({
        ...prev,
        selectedId: id,
        personName: s?.name || '',
      }));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const basic = Number(form.basicSalary) || 0;
  const allow = Number(form.allowances) || 0;
  const inc = Number(form.incentives) || 0;
  const adv = Number(form.advanceDeductions) || 0;
  const fines = Number(form.finesDeductions) || 0;
  const netPayable = Math.max(0, basic + allow + inc - adv - fines);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.personName || form.basicSalary === '') {
      setError('Person name and basic salary are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...form,
        driverId: form.personType === 'Driver' ? form.selectedId : null,
        userId: form.personType === 'Staff' ? form.selectedId : null,
      };
      await api.post('/salaries', payload);
      navigate('/salaries');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Generate Salary Slip</h1>
          <Link to="/salaries" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Payroll
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Employee Selection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type</label>
                <select
                  name="personType"
                  value={form.personType}
                  onChange={(e) => {
                    setForm({ ...form, personType: e.target.value, selectedId: '', personName: '' });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Driver">Driver</option>
                  <option value="Staff">Office Staff</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select {form.personType} *</label>
                <select
                  value={form.selectedId}
                  onChange={handlePersonSelect}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">Select Person</option>
                  {form.personType === 'Driver' ? (
                    drivers.map(d => <option key={d._id} value={d._id}>{d.name} (Salary: ₹{d.monthlySalary})</option>)
                  ) : (
                    staff.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)
                  )}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Pay Period & Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Month</label>
                <select
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Year</label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Basic Salary (₹) *</label>
                <input
                  type="number"
                  name="basicSalary"
                  required
                  value={form.basicSalary}
                  onChange={handleChange}
                  placeholder="25000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Allowances / TA (₹)</label>
                <input
                  type="number"
                  name="allowances"
                  value={form.allowances}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Incentives / Bonus (₹)</label>
                <input
                  type="number"
                  name="incentives"
                  value={form.incentives}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Advance Deductions (₹)</label>
                <input
                  type="number"
                  name="advanceDeductions"
                  value={form.advanceDeductions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center text-sm font-semibold">
              <span>Net Salary Payable:</span>
              <strong className="text-xl font-extrabold text-emerald-800">₹{netPayable.toLocaleString()}</strong>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/salaries" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Generating...' : 'Generate & Save Slip'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
