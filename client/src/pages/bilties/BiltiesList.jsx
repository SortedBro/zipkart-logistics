import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { StatusBadge } from '../Dashboard.jsx';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function BiltiesList() {
  const [bilties, setBilties] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bilties').then((d) => setBilties(d.bilties)).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bilty / LR</h1>
        <Link to="/bilties/new" className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + New Bilty
        </Link>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">LR No.</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Party</th>
              <th className="text-left px-4 py-3">Route</th>
              <th className="text-left px-4 py-3">Truck</th>
              <th className="text-right px-4 py-3">Freight</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bilties && bilties.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Abhi tak koi bilty nahi bani.</td></tr>
            )}
            {bilties?.map((b) => (
              <tr key={b._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/bilties/${b._id}`} className="font-medium text-brand-700">{b.lrNumber}</Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{b.biltyDate}</td>
                <td className="px-4 py-3">{b.party?.name || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{b.fromCity || '?'} → {b.toCity || '?'}</td>
                <td className="px-4 py-3 text-slate-500">{b.truck?.number || '—'}</td>
                <td className="px-4 py-3 text-right font-semibold">₹{money(b.freight)}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
