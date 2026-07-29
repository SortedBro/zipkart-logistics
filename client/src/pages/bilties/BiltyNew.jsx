import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

export default function BiltyNew() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    lr_number: '',
    bilty_date: new Date().toISOString().slice(0, 10),
    party_id: '',
    truck_id: '',
    consignor: '',
    consignee: '',
    from_city: '',
    to_city: '',
    material: '',
    weight: '',
    freight: 0,
    advance: 0,
    other_charges: 0,
  });

  useEffect(() => {
    Promise.all([api.get('/parties'), api.get('/trucks'), api.get('/bilties/next-lr')]).then(
      ([partiesRes, trucksRes, lrRes]) => {
        setParties(partiesRes.parties);
        setTrucks(trucksRes.trucks);
        setForm((f) => ({ ...f, lr_number: lrRes.lrNumber }));
      }
    );
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/bilties', form);
      navigate(`/bilties/${res.bilty._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Bilty</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Alert error={error} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">LR Number</label>
              <input value={form.lr_number} onChange={(e) => update('lr_number', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" required value={form.bilty_date} onChange={(e) => update('bilty_date', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Party</label>
              <select required value={form.party_id} onChange={(e) => update('party_id', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select party</option>
                {parties.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              {!parties.length && <p className="text-xs text-amber-600 mt-1">Pehle ek party add karo.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Truck (optional)</label>
              <select value={form.truck_id} onChange={(e) => update('truck_id', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select truck</option>
                {trucks.map((t) => <option key={t._id} value={t._id}>{t.number}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Consignor</label>
              <input value={form.consignor} onChange={(e) => update('consignor', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Consignee</label>
              <input value={form.consignee} onChange={(e) => update('consignee', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
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
              <label className="block text-sm font-medium mb-1">Material</label>
              <input value={form.material} onChange={(e) => update('material', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input type="number" step="0.01" value={form.weight} onChange={(e) => update('weight', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Freight (₹)</label>
              <input type="number" step="0.01" value={form.freight} onChange={(e) => update('freight', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Advance (₹)</label>
              <input type="number" step="0.01" value={form.advance} onChange={(e) => update('advance', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other Charges (₹)</label>
              <input type="number" step="0.01" value={form.other_charges} onChange={(e) => update('other_charges', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <button disabled={busy} className="bg-brand-700 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg px-5 py-2.5 text-sm">
            {busy ? 'Saving…' : 'Save Bilty'}
          </button>
        </form>
      </div>
    </div>
  );
}
