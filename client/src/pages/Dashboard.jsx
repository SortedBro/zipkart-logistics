import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (!data) return <p className="text-slate-400 text-sm">Loading…</p>;

  const { stats, recentBilties, recentTrips } = data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/bilties/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + New Bilty
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Bilty" value={stats.totalBilties} />
        <Stat label="Trucks" value={stats.totalTrucks} />
        <Stat label="Active Trips" value={stats.activeTrips} />
        <Stat label="Parties" value={stats.totalParties} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-brand-900 text-white rounded-xl p-5">
          <div className="text-xs text-white/70">Total Freight Billed</div>
          <div className="text-xl font-bold mt-1">₹{money(stats.freightTotal)}</div>
        </div>
        <div className={`rounded-xl p-5 text-white ${stats.outstanding >= 0 ? 'bg-amber-500' : 'bg-green-600'}`}>
          <div className="text-xs text-white/80">Outstanding Balance</div>
          <div className="text-xl font-bold mt-1">₹{money(Math.abs(stats.outstanding))}</div>
        </div>
        <div className={`rounded-xl p-5 text-white ${stats.profit >= 0 ? 'bg-green-600' : 'bg-red-500'}`}>
          <div className="text-xs text-white/80">Freight − Truck Expenses</div>
          <div className="text-xl font-bold mt-1">₹{money(stats.profit)}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Bilty</h2>
            <Link to="/bilties" className="text-sm text-brand-700 font-medium">View all</Link>
          </div>
          {!recentBilties.length && <p className="text-sm text-slate-400">Abhi tak koi bilty nahi bani.</p>}
          <div className="space-y-3">
            {recentBilties.map((b) => (
              <Link key={b._id} to={`/bilties/${b._id}`} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{b.lrNumber}</div>
                  <div className="text-slate-400 text-xs">{b.party?.name || '—'} · {b.fromCity || '?'} → {b.toCity || '?'}</div>
                </div>
                <div className="font-semibold">₹{money(b.freight)}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Trips</h2>
            <Link to="/trips" className="text-sm text-brand-700 font-medium">View all</Link>
          </div>
          {!recentTrips.length && <p className="text-sm text-slate-400">Abhi tak koi trip nahi bani.</p>}
          <div className="space-y-3">
            {recentTrips.map((t) => (
              <div key={t._id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{t.truck?.number || '—'}</div>
                  <div className="text-slate-400 text-xs">{t.fromCity || '?'} → {t.toCity || '?'}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    delivered: 'bg-green-100 text-green-700',
    'in-transit': 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}
