import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ZipkartLogo from './ZipkartLogo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/bilties', label: 'Bilty' },
    { to: '/parties', label: 'Parties' },
    { to: '/trucks', label: 'Trucks' },
    { to: '/trips', label: 'Trips' },
  ];
  if (user?.role === 'owner') links.push({ to: '/staff', label: 'Staff' });

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
              <div className="text-white/60">{user?.companyName} · {user?.role}</div>
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
