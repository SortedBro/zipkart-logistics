import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

export default function StaffNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Staff</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Alert error={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="staff">Staff (limited access)</option>
              <option value="owner">Owner (full access)</option>
            </select>
          </div>
          <button disabled={busy} className="bg-brand-700 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg px-5 py-2.5 text-sm">
            {busy ? 'Saving…' : 'Save Staff'}
          </button>
        </form>
      </div>
    </div>
  );
}
