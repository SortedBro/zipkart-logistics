import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function PartyShow() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ direction: 'in', amount: '', payment_date: new Date().toISOString().slice(0, 10), note: '' });
  const [busy, setBusy] = useState(false);

  function load() {
    api.get(`/parties/${id}`).then(setData).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function handlePayment(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await api.post(`/parties/${id}/payments`, form);
      setSuccess('Payment recorded.');
      setForm({ ...form, amount: '', note: '' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) return <p className="text-red-600 text-sm">{error}</p>;
  if (!data) return <p className="text-slate-400 text-sm">Loading…</p>;

  const { party, balance, bilties, payments } = data;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{party.name}</h1>
          <p className="text-sm text-slate-500 capitalize">{party.type} · {party.phone || 'no phone'}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Current Balance</div>
          <div className={`text-xl font-bold ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : ''}`}>
            ₹{money(Math.abs(balance))} {balance > 0 ? 'due' : balance < 0 ? 'advance' : ''}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold mb-4">Bilty History</h2>
            {!bilties.length && <p className="text-sm text-slate-400">Is party ke liye koi bilty nahi hai.</p>}
            <div className="space-y-2">
              {bilties.map((b) => (
                <div key={b._id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                  <div>
                    <div className="font-medium">{b.lrNumber}</div>
                    <div className="text-xs text-slate-400">{b.biltyDate} · {b.fromCity || '?'} → {b.toCity || '?'}</div>
                  </div>
                  <div className="font-semibold">₹{money(b.freight + b.otherCharges - b.advance)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold mb-4">Payment History</h2>
            {!payments.length && <p className="text-sm text-slate-400">Abhi tak koi payment record nahi hai.</p>}
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                  <div>
                    <div className="font-medium">{p.direction === 'in' ? 'Received' : 'Paid'}</div>
                    <div className="text-xs text-slate-400">{p.paymentDate} {p.note ? `· ${p.note}` : ''}</div>
                  </div>
                  <div className={`font-semibold ${p.direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>₹{money(p.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
          <h2 className="font-semibold mb-4">Record Payment</h2>
          <Alert error={error} success={success} />
          <form onSubmit={handlePayment} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Direction</label>
              <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="in">Received from party</option>
                <option value="out">Paid to party</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Amount (₹)</label>
              <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Note</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button disabled={busy} className="w-full bg-brand-700 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm">
              {busy ? 'Saving…' : 'Save Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
