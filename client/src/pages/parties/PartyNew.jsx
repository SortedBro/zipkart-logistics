import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';
import FileUploadBox from '../../components/FileUploadBox.jsx';

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  name: '',
  type: 'customer',
  phone: '',
  email: '',
  address: '',
  opening_balance: 0,
  openingDate: today,
  aadhaarNumber: '',
  panNumber: '',
  gstin: '',
  category: '',
  managerName: '',
  managerNumber: '',
  account: { accountName: '', accountNumber: '', ifsc: '', upiId: '' },
  documents: { gst: '', panCard: '', visitingCard: '', aadhaar: '' },
};

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function PartyNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateAccount = (key, value) => setForm((f) => ({ ...f, account: { ...f.account, [key]: value } }));
  const updateDoc = (key, value) => setForm((f) => ({ ...f, documents: { ...f.documents, [key]: value } }));

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

  const isSupplier = form.type === 'supplier';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Add Party</h1>
          <Link to="/parties" className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm">
            &larr; Go Back
          </Link>
        </div>
        <button type="button" onClick={handleSubmit} disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2 text-sm shadow transition">
          {busy ? 'Saving…' : 'SAVE'}
        </button>
      </div>

      <Alert error={error} />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-6">
        {/* Left: Party Details */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Party Details</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Party Name *</label>
                <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Party Number</label>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                <select value={form.type} onChange={(e) => update('type', e.target.value)} className={inputCls}>
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Party Address</label>
              <textarea rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} className={inputCls} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Opening Balance (₹)</label>
                <input type="number" step="0.01" value={form.opening_balance} onChange={(e) => update('opening_balance', e.target.value)} className={inputCls} />
                <p className="text-[11px] text-slate-400 mt-1">Positive = party owes you, negative = you owe party.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Opening Date</label>
                <input type="date" value={form.openingDate} onChange={(e) => update('openingDate', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Aadhaar Number</label>
                <input value={form.aadhaarNumber} onChange={(e) => update('aadhaarNumber', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">PAN Number</label>
                <input value={form.panNumber} onChange={(e) => update('panNumber', e.target.value.toUpperCase())} className={inputCls} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">GST Number</label>
                <input value={form.gstin} onChange={(e) => update('gstin', e.target.value.toUpperCase())} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="e.g. Transporter, Broker" className={inputCls} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Manager Name</label>
                <input value={form.managerName} onChange={(e) => update('managerName', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Manager Number</label>
                <input value={form.managerNumber} onChange={(e) => update('managerNumber', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Account Details + Documents */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Account Details {isSupplier ? '' : <span className="text-xs font-normal text-slate-400">(optional)</span>}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Account Name</label>
                <input value={form.account.accountName} onChange={(e) => updateAccount('accountName', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Account Number</label>
                <input value={form.account.accountNumber} onChange={(e) => updateAccount('accountNumber', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">IFSC Code</label>
                <input value={form.account.ifsc} onChange={(e) => updateAccount('ifsc', e.target.value.toUpperCase())} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">UPI ID</label>
                <input value={form.account.upiId} onChange={(e) => updateAccount('upiId', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Documents</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <FileUploadBox label="GST" value={form.documents.gst} onChange={(v) => updateDoc('gst', v)} />
              <FileUploadBox label="PAN Card" value={form.documents.panCard} onChange={(v) => updateDoc('panCard', v)} />
              <FileUploadBox label="Visiting Card" value={form.documents.visitingCard} onChange={(v) => updateDoc('visitingCard', v)} />
              <FileUploadBox label="Aadhaar Card" value={form.documents.aadhaar} onChange={(v) => updateDoc('aadhaar', v)} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 flex justify-end gap-3 pt-2 border-t border-slate-200">
          <Link to="/parties" className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition">
            Cancel
          </Link>
          <button type="submit" disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-8 py-2.5 text-sm shadow transition">
            {busy ? 'Saving…' : 'Save Party'}
          </button>
        </div>
      </form>
    </div>
  );
}
