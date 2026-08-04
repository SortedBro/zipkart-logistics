import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function VendorNew() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    mobile: '',
    email: '',
    city: '',
    gstNumber: '',
    address: '',
    commissionType: 'Percentage',
    commissionValue: '5',
    openingBalance: '0',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile) {
      setError('Vendor name and mobile are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/vendors', form);
      navigate('/vendors');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Add New Vendor</h1>
          <Link to="/vendors" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Vendors
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Vendor Name *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Mahavir Transport Agency"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                placeholder="Suresh Singh"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
              <input
                type="text"
                name="mobile"
                required
                value={form.mobile}
                onChange={handleChange}
                placeholder="9812345678"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Jaipur"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                placeholder="08AAAAA0000A1Z5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Commission Value</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="commissionValue"
                  value={form.commissionValue}
                  onChange={handleChange}
                  placeholder="5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <select
                  name="commissionType"
                  value={form.commissionType}
                  onChange={handleChange}
                  className="px-2 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Percentage">%</option>
                  <option value="Fixed">Fixed ₹</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/vendors" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
