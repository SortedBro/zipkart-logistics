import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function TrucksList() {
  const [trucks, setTrucks] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/trucks').then((d) => setTrucks(d.trucks)).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trucks</h1>
        <Link to="/trucks/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Add Truck
        </Link>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trucks && trucks.length === 0 && <p className="text-sm text-slate-400 col-span-full text-center py-8">Abhi tak koi truck add nahi hui.</p>}
        {trucks?.map((t) => (
          <Link key={t._id} to={`/trucks/${t._id}`} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition block">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg">{t.number}</div>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">{t.ownerType}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t.driverName || 'Driver not set'} {t.driverPhone ? `· ${t.driverPhone}` : ''}</p>
            <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-500">P&amp;L</span>
              <span className={`font-semibold ${t.pl.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{money(t.pl.profit)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
