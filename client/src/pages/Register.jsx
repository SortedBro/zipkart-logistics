import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: '',
    city: '',
    name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
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
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-brand-900">
            <span className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center text-white">Z</span>
            Zipkart <span className="text-accent-600">Logistics</span>
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-xl font-bold mb-1">Apna account banao</h1>
          <p className="text-sm text-slate-500 mb-6">10 minute mein company setup ho jayega.</p>
          <Alert error={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company name</label>
                <input required value={form.company_name} onChange={(e) => update('company_name', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input value={form.city} onChange={(e) => update('city', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your name</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" required value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm password</label>
                <input type="password" required value={form.confirm_password} onChange={(e) => update('confirm_password', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <button disabled={busy} className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm">
              {busy ? 'Creating…' : 'Free Account Banao'}
            </button>
          </form>
          <p className="text-sm text-slate-500 mt-6 text-center">
            Pehle se account hai? <Link to="/login" className="text-brand-700 font-semibold">Login karo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
