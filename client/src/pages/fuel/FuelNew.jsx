import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function FuelNew() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    truck: '',
    driver: '',
    date: new Date().toISOString().slice(0, 10),
    quantityLiters: '',
    ratePerLiter: '90',
    totalAmount: '',
    odometerReading: '',
    fuelStationVendor: '',
    notes: '',
  });

  useEffect(() => {
    api.get('/trucks').then(res => setTrucks(res.trucks || [])).catch(() => {});
    api.get('/drivers').then(res => setDrivers(res.drivers || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === 'quantityLiters' || e.target.name === 'ratePerLiter') {
      const q = Number(e.target.name === 'quantityLiters' ? e.target.value : form.quantityLiters) || 0;
      const r = Number(e.target.name === 'ratePerLiter' ? e.target.value : form.ratePerLiter) || 0;
      updated.totalAmount = q * r ? String(Math.round(q * r)) : '';
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.truck || !form.quantityLiters || !form.ratePerLiter || !form.odometerReading) {
      setError('Truck, quantity in liters, rate per liter, and odometer reading are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/fuel', form);
      navigate('/fuel');
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
          <h1 className="text-2xl font-extrabold text-slate-900">Add Fuel Log</h1>
          <Link to="/fuel" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Fuel Logs
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
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Driver (Optional)</label>
              <select
                name="driver"
                value={form.driver}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Select Driver</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity (Liters) *</label>
              <input
                type="number"
                name="quantityLiters"
                required
                value={form.quantityLiters}
                onChange={handleChange}
                placeholder="120"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rate per Liter (₹) *</label>
              <input
                type="number"
                name="ratePerLiter"
                required
                value={form.ratePerLiter}
                onChange={handleChange}
                placeholder="90"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Amount (₹)</label>
              <input
                type="number"
                name="totalAmount"
                value={form.totalAmount}
                onChange={handleChange}
                placeholder="10800"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Odometer Reading (KM) *</label>
              <input
                type="number"
                name="odometerReading"
                required
                value={form.odometerReading}
                onChange={handleChange}
                placeholder="45200"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fuel Station Vendor Name</label>
              <input
                type="text"
                name="fuelStationVendor"
                value={form.fuelStationVendor}
                onChange={handleChange}
                placeholder="e.g. HP Petrol Pump NH-44"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/fuel" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Fuel Log'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
