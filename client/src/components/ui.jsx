// Shared UI design-system primitives. Import from here so every screen looks consistent.
// Usage: import { Button, Card, PageHeader, StatCard, Badge, Table, THead, Th, Tr, Td, Spinner, EmptyState } from '../components/ui.jsx';

export function Button({ as: Comp = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-brand-500/40';
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-sm px-6 py-3',
  };
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white shadow-sm',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  };
  return (
    <Comp className={`${base} ${sizes[size]} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </Comp>
  );
}

export function Card({ className = '', children, ...p }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`} {...p}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        {breadcrumb && <div className="text-xs font-medium text-slate-400 mb-1">{breadcrumb}</div>}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

const STAT_TONES = {
  default: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
};

export function StatCard({ label, value, icon, hint, tone = 'default' }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      {icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${STAT_TONES[tone] || STAT_TONES.default}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xs text-slate-500 font-medium truncate">{label}</div>
        <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
        {hint && <div className="text-xs text-slate-400 mt-0.5 truncate">{hint}</div>}
      </div>
    </Card>
  );
}

const BADGE_TONES = {
  slate: 'bg-slate-100 text-slate-600',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE_TONES[tone] || BADGE_TONES.slate} ${className}`}>
      {children}
    </span>
  );
}

// Data table primitives — consistent, horizontally scrollable on small screens.
export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}
export function THead({ children }) {
  return (
    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
      <tr>{children}</tr>
    </thead>
  );
}
export function Th({ children, className = '' }) {
  return <th className={`text-left font-semibold px-4 py-3 whitespace-nowrap ${className}`}>{children}</th>;
}
export function Tr({ children, className = '', ...p }) {
  return (
    <tr className={`border-t border-slate-100 hover:bg-slate-50/70 transition ${className}`} {...p}>
      {children}
    </tr>
  );
}
export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-slate-400 text-sm ${className}`}>
      <span className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', subtitle, action }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-700">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
