import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

export default function TripNew() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [bilties, setBilties] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    truck_id: '',
    bilty_id: '',
    from_city: '',
    to_city: '',
    start_date: new Date().toISOString().slice(0, 10),
    status: 'loading',
  });

  useEffect(() => {
    Promise.all([api.get('/trucks'), api.get('/bilties')]).then(([t, b]) => {
      setTrucks(t.trucks);
      setBilties(b.bilties);
    });
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/trips', form);
      navigate('/trips');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Trip</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Alert error={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Truck</label>
            <select required value={form.truck_id} onChange={(e) => update('truck_id', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select truck</option>
              {trucks.map((t) => <option key={t._id} value={t._id}>{t.number}</option>)}
            </select>
            {!trucks.length && <p className="text-xs text-amber-600 mt-1">Pehle ek truck add karo.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Linked Bilty (optional)</label>
            <select value={form.bilty_id} onChange={(e) => update('bilty_id', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select bilty</option>
              {bilties.map((b) => <option key={b._id} value={b._id}>{b.lrNumber}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From City</label>
              <input value={form.from_city} onChange={(e) => update('from_city', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To City</label>
              <input value={form.to_city} onChange={(e) => update('to_city', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="loading">Loading</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
          <button disabled={busy} className="bg-brand-700 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg px-5 py-2.5 text-sm">
            {busy ? 'Saving…' : 'Save Trip'}
          </button>
        </form>
      </div>
    </div>
  );
}
