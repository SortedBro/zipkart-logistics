import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StaffList() {
  const { user } = useAuth();
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState('');
  
  // Modal state for editing permissions
  const [editUser, setEditUser] = useState(null);
  const [editPerms, setEditPerms] = useState({});
  const [savingPerms, setSavingPerms] = useState(false);

  function load() {
    api.get('/staff').then((d) => setStaff(d.staff)).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function toggle(id) {
    try {
      await api.patch(`/staff/${id}/toggle`, {});
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function openEditModal(staffUser) {
    const defaultPerms = {
      dashboard: true,
      bilties: true,
      parties: true,
      trucks: true,
      trips: true,
      tracking: true,
    };
    setEditUser(staffUser);
    setEditPerms(staffUser.permissions || defaultPerms);
  }

  async function handleSavePermissions() {
    if (!editUser) return;
    setSavingPerms(true);
    try {
      await api.patch(`/staff/${editUser._id}/permissions`, { permissions: editPerms });
      setEditUser(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPerms(false);
    }
  }

  const modules = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'bilties',   label: 'Bilty',     icon: '📄' },
    { key: 'parties',   label: 'Parties',   icon: '🏢' },
    { key: 'trucks',    label: 'Trucks',    icon: '🚛' },
    { key: 'trips',     label: 'Trips',     icon: '🛣️' },
    { key: 'tracking',  label: 'Tracking',  icon: '📡' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Staff &amp; Role Access</h1>
          <p className="text-sm text-slate-500 mt-1">Manage staff accounts and customize module-level access permissions</p>
        </div>
        <Link to="/staff/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
          + Add Staff
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Module Permissions</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff?.map((s) => {
              const perms = s.permissions || { dashboard: true, bilties: true, parties: true, trucks: true, trips: true, tracking: true };
              return (
                <tr key={s._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.role === 'owner' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'}`}>
                      {s.role === 'owner' ? 'Owner (Admin)' : 'Staff'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.role === 'owner' ? (
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                        Full Unrestricted Access
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {modules.map((m) => {
                          const has = perms[m.key] !== false;
                          return (
                            <span
                              key={m.key}
                              className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                has
                                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                                  : 'bg-slate-100 text-slate-400 line-through opacity-60'
                              }`}
                            >
                              {m.icon} {m.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {s.role === 'staff' && (
                        <button
                          onClick={() => openEditModal(s)}
                          className="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-md font-medium"
                        >
                          Edit Access
                        </button>
                      )}
                      {s._id !== user?.id ? (
                        <button
                          onClick={() => toggle(s._id)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                        >
                          {s.active ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Current User</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Edit Permissions Modal ── */}
      {editUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Edit Permissions</h2>
                <p className="text-xs text-slate-500">Managing access for <span className="font-semibold text-brand-700">{editUser.name}</span> ({editUser.email})</p>
              </div>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Module Access Controls</p>
              <div className="grid grid-cols-2 gap-2.5">
                {modules.map((m) => {
                  const isChecked = editPerms[m.key] !== false;
                  return (
                    <label
                      key={m.key}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                        isChecked ? 'border-brand-300 bg-brand-50/50 text-brand-900' : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => setEditPerms((prev) => ({ ...prev, [m.key]: !prev[m.key] }))}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 mr-2.5"
                      />
                      <span>{m.icon} {m.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={savingPerms}
                onClick={handleSavePermissions}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-60"
              >
                {savingPerms ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
