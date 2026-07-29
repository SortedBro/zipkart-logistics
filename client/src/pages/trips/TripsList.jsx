import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { StatusBadge } from '../Dashboard.jsx';

export default function TripsList() {
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');

  function load() {
    api.get('/trips').then((d) => setTrips(d.trips)).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function updateStatus(tripId, status) {
    try {
      await api.patch(`/trips/${tripId}/status`, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trips</h1>
        <Link to="/trips/new" className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + New Trip
        </Link>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Truck</th>
              <th className="text-left px-4 py-3">Bilty</th>
              <th className="text-left px-4 py-3">Route</th>
              <th className="text-left px-4 py-3">Start</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {trips && trips.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Abhi tak koi trip nahi bani.</td></tr>
            )}
            {trips?.map((t) => (
              <tr key={t._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{t.truck?.number || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{t.bilty?.lrNumber || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{t.fromCity || '?'} → {t.toCity || '?'}</td>
                <td className="px-4 py-3 text-slate-500">{t.startDate || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3 text-right">
                  <select
                    defaultValue={t.status}
                    onChange={(e) => updateStatus(t._id, e.target.value)}
                    className="border border-slate-300 rounded-md text-xs px-1 py-1"
                  >
                    <option value="loading">Loading</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
