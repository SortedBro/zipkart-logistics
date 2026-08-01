import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, isPdfDoc } from '../../api';
import Alert from '../../components/Alert.jsx';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-slate-400 block text-[11px]">{label}</span>
      <span className="font-semibold text-slate-700 text-sm break-words">{value}</span>
    </div>
  );
}

function DocPreview({ label, value }) {
  if (!value) return null;
  return (
    <a href={value} target="_blank" rel="noreferrer" className="border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition">
      {isPdfDoc(value) ? (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
      ) : (
        <img src={value} alt={label} className="h-14 object-contain" />
      )}
      <span className="text-[11px] font-medium text-slate-600 mt-1">{label}</span>
    </a>
  );
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
          {(() => {
            const acc = party.account || {};
            const docs = party.documents || {};
            const hasDetails =
              party.email || party.address || party.gstin || party.panNumber || party.aadhaarNumber ||
              party.category || party.managerName || party.managerNumber ||
              acc.accountName || acc.accountNumber || acc.ifsc || acc.upiId;
            const hasDocs = docs.gst || docs.panCard || docs.visitingCard || docs.aadhaar;
            if (!hasDetails && !hasDocs) return null;
            return (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h2 className="font-semibold border-b border-slate-100 pb-2">Details &amp; Documents</h2>
                {hasDetails && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Field label="Email" value={party.email} />
                    <Field label="Category" value={party.category} />
                    <Field label="GST Number" value={party.gstin} />
                    <Field label="PAN Number" value={party.panNumber} />
                    <Field label="Aadhaar Number" value={party.aadhaarNumber} />
                    <Field label="Opening Date" value={party.openingDate} />
                    <Field label="Manager" value={party.managerName} />
                    <Field label="Manager Number" value={party.managerNumber} />
                    <Field label="Address" value={party.address} />
                    <Field label="Account Name" value={acc.accountName} />
                    <Field label="Account Number" value={acc.accountNumber} />
                    <Field label="IFSC" value={acc.ifsc} />
                    <Field label="UPI ID" value={acc.upiId} />
                  </div>
                )}
                {hasDocs && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                    <DocPreview label="GST" value={docs.gst} />
                    <DocPreview label="PAN Card" value={docs.panCard} />
                    <DocPreview label="Visiting Card" value={docs.visitingCard} />
                    <DocPreview label="Aadhaar" value={docs.aadhaar} />
                  </div>
                )}
              </div>
            );
          })()}

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
