import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ZipkartLogo from './ZipkartLogo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const perms = user?.permissions || { dashboard: true, bilties: true, parties: true, trucks: true, trips: true, tracking: true };

  const allLinks = [
    { to: '/dashboard', label: 'Dashboard', key: 'dashboard' },
    { to: '/bilties',   label: 'Bilty',     key: 'bilties' },
    { to: '/parties',   label: 'Parties',   key: 'parties' },
    { to: '/trucks',    label: 'Trucks',    key: 'trucks' },
    { to: '/trips',     label: 'Trips',     key: 'trips' },
    { to: '/tracking',  label: '📡 Tracking', key: 'tracking' },
  ];

  const links = allLinks.filter(l => user?.role === 'owner' || perms[l.key] !== false);

  if (user?.role === 'owner') {
    links.push({ to: '/staff', label: 'Staff', key: 'staff' });
    links.push({ to: '/settings', label: 'Settings', key: 'settings' });
  }

  const roleLabel = user?.role === 'owner' ? 'Admin' : 'Employee';

  return (
    <header className="bg-brand-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <ZipkartLogo className="h-9" variant="dark" showTagline={false} />
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-md hover:bg-white/10 ${location.pathname.startsWith(l.to) ? 'bg-white/10' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right text-xs leading-tight">
              <div className="font-semibold">{user?.name}</div>
              <div className="text-white/60">{user?.companyName} · {roleLabel}</div>
            </div>
            <button onClick={logout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md">
              Logout
            </button>
          </div>
        </div>
        <nav className="md:hidden flex flex-wrap gap-1 pb-3 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="px-3 py-1.5 rounded-md bg-white/10">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
