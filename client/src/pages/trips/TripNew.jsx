import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

const today = new Date().toISOString().slice(0, 10);

function genTripId() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}${mm}${d.getFullYear()}${String(d.getSeconds()).padStart(2, '0')}`;
}

const RATE_TYPES = ['FIXED', 'PER_TON', 'PER_KM', 'PER_KG'];

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function TripNew() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [bilties, setBilties] = useState([]);
  const [parties, setParties] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [addGst, setAddGst] = useState(false);
  const [form, setForm] = useState({
    tripId: genTripId(),
    truck_id: '',
    bilty_id: '',
    party_id: '',
    from_city: '',
    to_city: '',
    routeDistance: '',
    vehicleCapacity: '',
    shipmentItem: '',
    driverName: '',
    start_date: today,
    rateType: 'FIXED',
    gstPercent: '',
    customerAmount: 0,
  });

  useEffect(() => {
    Promise.all([api.get('/trucks'), api.get('/bilties'), api.get('/parties')])
      .then(([t, b, p]) => {
        setTrucks(t.trucks);
        setBilties(b.bilties);
        setParties(p.parties);
      })
      .catch((e) => setError(e.message));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/trips', { ...form, gstPercent: addGst ? form.gstPercent : 0 });
      navigate('/trips');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Add Trip</h1>
          <Link to="/trips" className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm">
            &larr; Go Back
          </Link>
        </div>
        <button type="button" onClick={handleSubmit} disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2 text-sm shadow transition">
          {busy ? 'Saving…' : 'SAVE'}
        </button>
      </div>

      <Alert error={error} />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-6">
        {/* Left: Trip Details */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Trip Details</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Trip ID *</label>
              <input required value={form.tripId} onChange={(e) => update('tripId', e.target.value)} className={inputCls} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Source *</label>
                <input required value={form.from_city} onChange={(e) => update('from_city', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Destination *</label>
                <input required value={form.to_city} onChange={(e) => update('to_city', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Route Distance</label>
                <input value={form.routeDistance} onChange={(e) => update('routeDistance', e.target.value)} placeholder="e.g. 450 km" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
                <input type="date" required value={form.start_date} onChange={(e) => update('start_date', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle Capacity</label>
                <input value={form.vehicleCapacity} onChange={(e) => update('vehicleCapacity', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Shipment Item</label>
                <input value={form.shipmentItem} onChange={(e) => update('shipmentItem', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle Number *</label>
              <select required value={form.truck_id} onChange={(e) => update('truck_id', e.target.value)} className={inputCls}>
                <option value="">Select Vehicle</option>
                {trucks.map((t) => <option key={t._id} value={t._id}>{t.number}</option>)}
              </select>
              {!trucks.length && <p className="text-xs text-amber-600 mt-1">Add a truck first.</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Driver</label>
              <input value={form.driverName} onChange={(e) => update('driverName', e.target.value)} className={inputCls} />
              <p className="text-[11px] text-slate-400 mt-1">Status is managed from the Tracking pipeline after the trip is created.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Linked Bilty (optional)</label>
              <select value={form.bilty_id} onChange={(e) => update('bilty_id', e.target.value)} className={inputCls}>
                <option value="">Select bilty</option>
                {bilties.map((b) => <option key={b._id} value={b._id}>{b.lrNumber}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Party & Billing */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Party Details</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Party</label>
              <select value={form.party_id} onChange={(e) => update('party_id', e.target.value)} className={inputCls}>
                <option value="">Select Party</option>
                {parties.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Rate Type *</label>
              <select value={form.rateType} onChange={(e) => update('rateType', e.target.value)} className={inputCls}>
                {RATE_TYPES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>

            {addGst ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">GST %</label>
                <input type="number" step="0.01" value={form.gstPercent} onChange={(e) => update('gstPercent', e.target.value)} className={inputCls} />
                <button type="button" onClick={() => setAddGst(false)} className="text-xs text-red-600 hover:underline mt-1">Remove GST</button>
              </div>
            ) : (
              <button type="button" onClick={() => setAddGst(true)} className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded">
                + Add GST
              </button>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Amount (Inclusive GST) *</label>
              <input type="number" step="0.01" value={form.customerAmount} onChange={(e) => update('customerAmount', e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 flex justify-end gap-3 pt-2 border-t border-slate-200">
          <Link to="/trips" className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition">
            Cancel
          </Link>
          <button type="submit" disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-8 py-2.5 text-sm shadow transition">
            {busy ? 'Saving…' : 'Save Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
