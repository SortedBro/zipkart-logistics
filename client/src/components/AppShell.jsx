import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ZipkartLogo from './ZipkartLogo.jsx';

const Icon = ({ path, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={path} />
  </svg>
);

const I = {
  dashboard: 'M4 13h6V4H4v9zM4 20h6v-4H4v4zM14 20h6v-9h-6v9zM14 4v4h6V4h-6z',
  trucks: 'M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 100-4 2 2 0 000 4zm11 0a2 2 0 100-4 2 2 0 000 4z',
  drivers: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  trips: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  bilties: 'M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V18a2 2 0 01-2 2z',
  parties: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.65',
  tracking: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
  invoices: 'M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  expenses: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  loans: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
  transactions: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  fuel: 'M13 10V3L4 14h7v7l9-11h-7z',
  vendors: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  inventory: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  attendance: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  salaries: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  documents: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z',
  reports: 'M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  staff: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu: 'M4 6h16M4 12h16M4 18h16',
};

const GROUPS = [
  {
    title: 'Fleet & Operations',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: I.dashboard },
      { to: '/trucks', label: 'Trucks', icon: I.trucks },
      { to: '/drivers', label: 'Drivers', icon: I.drivers },
      { to: '/trips', label: 'Trips', icon: I.trips },
      { to: '/bilties', label: 'LR / Bilties', icon: I.bilties },
      { to: '/parties', label: 'Parties', icon: I.parties },
      { to: '/tracking', label: 'Live Tracking', icon: I.tracking },
    ]
  },
  {
    title: 'Finance & Accounting',
    items: [
      { to: '/invoices', label: 'Invoices', icon: I.invoices },
      { to: '/expenses', label: 'Expenses', icon: I.expenses },
      { to: '/loans', label: 'Loans / EMI', icon: I.loans },
      { to: '/transactions', label: 'Cash / Bank', icon: I.transactions },
    ]
  },
  {
    title: 'Resources',
    items: [
      { to: '/fuel', label: 'Fuel Logs', icon: I.fuel },
      { to: '/vendors', label: 'Vendors', icon: I.vendors },
      { to: '/inventory', label: 'Inventory', icon: I.inventory },
    ]
  },
  {
    title: 'HR & Payroll',
    items: [
      { to: '/attendance', label: 'Attendance', icon: I.attendance },
      { to: '/salaries', label: 'Payroll', icon: I.salaries },
      { to: '/staff', label: 'Staff & Roles', icon: I.staff },
    ]
  },
  {
    title: 'System & Vault',
    items: [
      { to: '/documents', label: 'Documents Vault', icon: I.documents },
      { to: '/reports', label: 'Analytics Hub', icon: I.reports },
      { to: '/settings', label: 'Settings', icon: I.settings },
    ]
  }
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel = user?.role ? user.role.toUpperCase() : 'USER';

  const SidebarInner = ({ onNavigate }) => (
    <div className="flex flex-col h-full bg-brand-900 text-white">
      <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0">
        <Link to="/dashboard" onClick={onNavigate}>
          <ZipkartLogo className="h-8" variant="dark" showTagline={false} />
        </Link>
      </div>
      <div className="py-4 flex-1 flex flex-col min-h-0 overflow-y-auto px-3 space-y-4">
        {GROUPS.map((grp) => (
          <div key={grp.title}>
            <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white/40">
              {grp.title}
            </div>
            <div className="space-y-0.5">
              {grp.items.map((n) => {
                const isActive = location.pathname === n.to || location.pathname.startsWith(n.to + '/');
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive ? 'bg-white/15 text-white shadow-sm font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon path={n.icon} className={isActive ? 'text-accent-400 w-4 h-4' : 'w-4 h-4'} />
                    {n.label}
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-white/10 shrink-0 bg-brand-950/40">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center font-bold text-xs shrink-0">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate">{user?.name}</div>
            <div className="text-[10px] text-white/50 truncate font-mono">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          <Icon path={I.logout} className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-30">
        <SidebarInner />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">
            <SidebarInner onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 sm:px-6 shadow-sm">
          <button
            className="lg:hidden text-slate-600 hover:text-slate-900 p-1"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Icon path={I.menu} className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Zipkart TMS Pro</h2>
          </div>
          <Link
            to="/track"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-lg transition"
          >
            <Icon path={I.tracking} className="w-3.5 h-3.5" /> Public Track
          </Link>
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{roleLabel}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
