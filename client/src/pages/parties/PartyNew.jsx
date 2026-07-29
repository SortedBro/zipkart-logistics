import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

export default function PartyNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', type: 'customer', phone: '', gstin: '', address: '', opening_balance: 0 });
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
      await api.post('/parties', form);
      navigate('/parties');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Party</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Alert error={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GSTIN</label>
              <input value={form.gstin} onChange={(e) => update('gstin', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opening Balance (₹)</label>
            <input type="number" step="0.01" value={form.opening_balance} onChange={(e) => update('opening_balance', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <p className="text-xs text-slate-400 mt-1">Positive = party owes you, negative = you owe party.</p>
          </div>
          <button disabled={busy} className="bg-brand-700 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg px-5 py-2.5 text-sm">
            {busy ? 'Saving…' : 'Save Party'}
          </button>
        </form>
      </div>
    </div>
  );
}
