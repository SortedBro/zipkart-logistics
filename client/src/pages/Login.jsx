import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-brand-900">
            <span className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center text-white">Z</span>
            Zipkart <span className="text-accent-600">Logistics</span>
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-xl font-bold mb-1">Login karo</h1>
          <p className="text-sm text-slate-500 mb-6">Apne account mein wapas aao.</p>
          <Alert error={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button disabled={busy} className="w-full bg-brand-700 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm">
              {busy ? 'Logging in…' : 'Login'}
            </button>
          </form>
          <p className="text-sm text-slate-500 mt-6 text-center">
            Account nahi hai? <Link to="/register" className="text-brand-700 font-semibold">Register karo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
