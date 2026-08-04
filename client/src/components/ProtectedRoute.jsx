import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from './AppShell.jsx';
import { EmptyState } from './ui.jsx';

export default function ProtectedRoute({ children, ownerOnly = false, permission = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 gap-3 text-sm">
        <span className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin" />
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (ownerOnly && user.role !== 'owner') return <Navigate to="/dashboard" replace />;

  if (permission && user.role !== 'owner') {
    const perms = user.permissions || { dashboard: true, bilties: true, parties: true, trucks: true, trips: true, tracking: true };
    if (perms[permission] === false) {
      return (
        <AppShell>
          <EmptyState
            icon="🔒"
            title="Access Restricted"
            subtitle={`You don't have permission to access the ${permission} section. Please contact your administrator to request access.`}
          />
        </AppShell>
      );
    }
  }

  return <AppShell>{children}</AppShell>;
}
