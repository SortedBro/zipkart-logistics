import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StaffList() {
  const { user } = useAuth();
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Staff &amp; Roles</h1>
        <Link to="/staff/new" className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          + Add Staff
        </Link>
      </div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {staff?.map((s) => (
              <tr key={s._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-slate-500">{s.email}</td>
                <td className="px-4 py-3 capitalize">{s.role}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {s._id !== user?.id ? (
                    <button onClick={() => toggle(s._id)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md font-medium">
                      {s.active ? 'Deactivate' : 'Activate'}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">You</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
