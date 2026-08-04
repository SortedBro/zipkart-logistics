import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Button, Card, PageHeader, StatCard, Badge, Table, THead, Th, Tr, Td, Spinner, EmptyState } from '../components/ui.jsx';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const ICON = {
  bilty: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V18a2 2 0 01-2 2z" />,
  truck: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />,
  trip: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l6-3 5.553 2.276A1 1 0 0121 7.618v10.764a1 1 0 01-1.447.894L15 17l-6 3z" />,
  party: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" />,
};
const Ic = (d) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{d}</svg>;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50 text-red-700 text-sm">{error}</Card>
    );
  }
  if (!data) return <Spinner label="Loading dashboard…" />;

  const { stats, recentBilties, recentTrips } = data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your transport operations"
        actions={
          <>
            <Button as={Link} to="/trips/new" variant="outline">+ New Trip</Button>
            <Button as={Link} to="/bilties/new">+ New Bilty</Button>
          </>
        }
      />

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Bilties" value={stats.totalBilties} icon={Ic(ICON.bilty)} tone="default" />
        <StatCard label="Trucks" value={stats.totalTrucks} icon={Ic(ICON.truck)} tone="slate" />
        <StatCard label="Active Trips" value={stats.activeTrips} icon={Ic(ICON.trip)} tone="amber" />
        <StatCard label="Parties" value={stats.totalParties} icon={Ic(ICON.party)} tone="green" />
      </div>

      {/* Financial summary */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-5 bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-sm">
          <div className="text-xs text-white/70 font-medium">Total Freight Billed</div>
          <div className="text-2xl font-bold mt-1">₹{money(stats.freightTotal)}</div>
        </div>
        <div className="rounded-xl p-5 bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Outstanding Balance</div>
          <div className={`text-2xl font-bold mt-1 ${stats.outstanding >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            ₹{money(Math.abs(stats.outstanding))}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{stats.outstanding >= 0 ? 'Receivable' : 'Advance / credit'}</div>
        </div>
        <div className="rounded-xl p-5 bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Freight − Truck Expenses</div>
          <div className={`text-2xl font-bold mt-1 ${stats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ₹{money(stats.profit)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Net operating margin</div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Recent Bilties</h2>
            <Link to="/bilties" className="text-sm text-brand-600 font-semibold hover:text-brand-800">View all →</Link>
          </div>
          {!recentBilties.length ? (
            <EmptyState icon="📄" title="No bilties yet" subtitle="Create your first bilty to see it here."
              action={<Button as={Link} to="/bilties/new" size="sm">+ New Bilty</Button>} />
          ) : (
            <Table>
              <THead><Th>LR No.</Th><Th>Party / Route</Th><Th className="text-right">Freight</Th></THead>
              <tbody>
                {recentBilties.map((b) => (
                  <Tr key={b._id} className="cursor-pointer" onClick={() => (window.location.href = `/bilties/${b._id}`)}>
                    <Td className="font-semibold text-brand-700">{b.lrNumber}</Td>
                    <Td>
                      <div className="font-medium text-slate-700">{b.party?.name || '—'}</div>
                      <div className="text-xs text-slate-400">{b.fromCity || '?'} → {b.toCity || '?'}</div>
                    </Td>
                    <Td className="text-right font-semibold">₹{money(b.freight)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Recent Trips</h2>
            <Link to="/trips" className="text-sm text-brand-600 font-semibold hover:text-brand-800">View all →</Link>
          </div>
          {!recentTrips.length ? (
            <EmptyState icon="🚚" title="No trips yet" subtitle="Start a trip to track it here."
              action={<Button as={Link} to="/trips/new" size="sm">+ New Trip</Button>} />
          ) : (
            <Table>
              <THead><Th>Truck</Th><Th>Route</Th><Th className="text-right">Status</Th></THead>
              <tbody>
                {recentTrips.map((t) => (
                  <Tr key={t._id}>
                    <Td className="font-semibold text-slate-700">{t.truck?.number || '—'}</Td>
                    <Td className="text-slate-500">{t.fromCity || '?'} → {t.toCity || '?'}</Td>
                    <Td className="text-right"><StatusBadge status={t.status} /></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    delivered: 'green',
    paid: 'green',
    'in-transit': 'amber',
    in_transit: 'amber',
    loading: 'blue',
    loading_in: 'blue',
    loading_out: 'blue',
    unloading_in: 'amber',
    unloading_out: 'amber',
    pending: 'slate',
  };
  const label = String(status || '').replace(/_/g, ' ');
  return <Badge tone={map[status] || 'slate'} className="capitalize">{label}</Badge>;
}
