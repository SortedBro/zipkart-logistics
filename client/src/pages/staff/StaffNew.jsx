import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

export default function StaffNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    permissions: {
      dashboard: true,
      bilties: true,
      parties: true,
      trucks: true,
      trips: true,
      tracking: true,
    },
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function togglePerm(permKey) {
    setForm((f) => ({
      ...f,
      permissions: {
        ...f.permissions,
        [permKey]: !f.permissions[permKey],
      },
    }));
  }

  function applyPreset(preset) {
    if (preset === 'full') {
      setForm((f) => ({
        ...f,
        permissions: { dashboard: true, bilties: true, parties: true, trucks: true, trips: true, tracking: true },
      }));
    } else if (preset === 'operations') {
      setForm((f) => ({
        ...f,
        permissions: { dashboard: true, bilties: true, parties: false, trucks: true, trips: true, tracking: true },
      }));
    } else if (preset === 'accounts') {
      setForm((f) => ({
        ...f,
        permissions: { dashboard: true, bilties: true, parties: true, trucks: false, trips: false, tracking: false },
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/staff', form);
      navigate('/staff');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const moduleItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊', desc: 'Main overview, metrics & key stats' },
    { key: 'bilties',   label: 'Bilty (LR)',   icon: '📄', desc: 'Create, view & print consignment notes' },
    { key: 'parties',   label: 'Parties',      icon: '🏢', desc: 'Manage customer accounts & ledgers' },
    { key: 'trucks',    label: 'Trucks',       icon: '🚛', desc: 'Vehicle directory & driver details' },
    { key: 'trips',     label: 'Trips',        icon: '🛣️', desc: 'Trip dispatch, expenses & stage updates' },
    { key: 'tracking',  label: 'Live Tracking', icon: '📡', desc: 'Real-time GPS vehicle tracking' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Staff Member</h1>
        <button onClick={() => navigate('/staff')} className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to Staff
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Alert error={error} />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2">
              User Details
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                required
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="rahul@company.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="staff">Staff (Custom module access)</option>
                <option value="owner">Owner / Admin (Full unrestricted access)</option>
              </select>
            </div>
          </div>

          {form.role === 'staff' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-base font-semibold text-slate-800">
                  Module Access &amp; Permissions
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('full')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium"
                  >
                    Full Staff Access
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('operations')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium"
                  >
                    Operations
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('accounts')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium"
                  >
                    Accounts
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {moduleItems.map((mod) => {
                  const isChecked = form.permissions[mod.key];
                  return (
                    <label
                      key={mod.key}
                      className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-brand-300 bg-brand-50/40 text-slate-900'
                          : 'border-slate-200 bg-slate-50/50 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePerm(mod.key)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-semibold flex items-center gap-1.5">
                          <span>{mod.icon}</span>
                          <span>{mod.label}</span>
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              disabled={busy}
              className="bg-brand-700 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2.5 text-sm"
            >
              {busy ? 'Saving…' : 'Save Staff Member'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/staff')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg px-5 py-2.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
