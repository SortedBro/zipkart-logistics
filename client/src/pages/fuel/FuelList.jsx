import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function FuelList() {
  const [fuelEntries, setFuelEntries] = useState([]);
  const [stats, setStats] = useState({ totalLiters: 0, totalSpent: 0, avgRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFuel();
  }, []);

  const fetchFuel = async () => {
    try {
      setLoading(true);
      const data = await api.get('/fuel');
      setFuelEntries(data.fuelEntries || []);
      setStats(data.stats || { totalLiters: 0, totalSpent: 0, avgRate: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Fuel Management</h1>
            <p className="text-sm text-slate-500">Track fuel fillings, rates per liter, odometer readings, and fuel pump vendors.</p>
          </div>
          <Link
            to="/fuel/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Add Fuel Entry
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Total Liters Filled</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalLiters?.toLocaleString()} L</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-rose-600">Total Fuel Cost</div>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">₹{stats.totalSpent?.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-brand-600">Avg Diesel Rate</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{stats.avgRate} / L</div>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading fuel records...</div>
        ) : fuelEntries.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No fuel filling logs recorded yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Truck Number</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Rate / L</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Odometer</th>
                    <th className="px-4 py-3">Fuel Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fuelEntries.map((fe) => (
                    <tr key={fe._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{new Date(fe.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{fe.truck ? fe.truck.number : 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold">{fe.quantityLiters} Liters</td>
                      <td className="px-4 py-3">₹{fe.ratePerLiter}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">₹{fe.totalAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3">{fe.odometerReading?.toLocaleString()} KM</td>
                      <td className="px-4 py-3 text-slate-500">{fe.fuelStationVendor || 'N/A'}</td>
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
