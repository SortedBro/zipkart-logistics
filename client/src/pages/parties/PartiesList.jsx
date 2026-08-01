import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function PartiesList() {
  const [parties, setParties] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/parties').then((d) => setParties(d.parties)).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Parties</h1>
        <Link to="/parties/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Add Party
        </Link>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-right px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {parties && parties.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Abhi tak koi party add nahi hui.</td></tr>
            )}
            {parties?.map((p) => (
              <tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/parties/${p._id}`} className="font-medium text-brand-700">{p.name}</Link>
                </td>
                <td className="px-4 py-3 capitalize text-slate-500">{p.type}</td>
                <td className="px-4 py-3 text-slate-500">{p.phone || '—'}</td>
                <td className={`px-4 py-3 text-right font-semibold ${p.balance > 0 ? 'text-red-600' : p.balance < 0 ? 'text-green-600' : 'text-slate-500'}`}>
                  ₹{money(Math.abs(p.balance))} {p.balance > 0 ? 'due' : p.balance < 0 ? 'advance' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
