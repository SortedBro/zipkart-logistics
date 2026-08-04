import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function InvoiceNew() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerMobile: '',
    customerAddress: '',
    trip: '',
    subtotal: '',
    taxPercent: '18',
    discount: '0',
    paidAmount: '0',
    paymentMode: 'Cash',
    notes: '',
  });

  useEffect(() => {
    api.get('/trips').then(res => setTrips(res.trips || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTripSelect = (e) => {
    const tripId = e.target.value;
    const selected = trips.find(t => t._id === tripId);
    if (selected) {
      setForm(prev => ({
        ...prev,
        trip: tripId,
        customerName: selected.customerName || prev.customerName,
        customerMobile: selected.customerPhone || prev.customerMobile,
        subtotal: selected.freight ? String(selected.freight) : prev.subtotal,
      }));
    } else {
      setForm(prev => ({ ...prev, trip: tripId }));
    }
  };

  const sub = Number(form.subtotal) || 0;
  const taxP = Number(form.taxPercent) || 0;
  const disc = Number(form.discount) || 0;
  const taxAmt = Math.round((sub * taxP) / 100);
  const grandTotal = Math.max(0, sub + taxAmt - disc);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || form.subtotal === '') {
      setError('Customer name and subtotal freight amount are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/invoices', form);
      navigate('/invoices');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Create New Invoice</h1>
          <Link to="/invoices" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Invoices
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Customer & Trip Linking</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Link to Trip (Optional)</label>
                <select
                  name="trip"
                  value={form.trip}
                  onChange={handleTripSelect}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">Select Trip (auto-fills freight & customer info)</option>
                  {trips.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.route || `${t.origin || 'Source'} → ${t.destination || 'Dest'}`} (Freight: ₹{t.freight})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Trading Co"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Mobile</label>
                <input
                  type="text"
                  name="customerMobile"
                  value={form.customerMobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Billing & Taxes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Freight Subtotal (₹) *</label>
                <input
                  type="number"
                  name="subtotal"
                  required
                  value={form.subtotal}
                  onChange={handleChange}
                  placeholder="45000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tax (%)</label>
                <input
                  type="number"
                  name="taxPercent"
                  value={form.taxPercent}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount (₹)</label>
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated summary card */}
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap justify-between items-center text-sm font-semibold">
              <span>Tax Amount: <strong className="text-slate-900">₹{taxAmt.toLocaleString()}</strong></span>
              <span>Grand Total: <strong className="text-xl font-extrabold text-brand-700">₹{grandTotal.toLocaleString()}</strong></span>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Payment Collection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={form.paidAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Mode</label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/invoices" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
