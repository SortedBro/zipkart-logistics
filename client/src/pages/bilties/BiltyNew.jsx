import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

const today = new Date().toISOString().slice(0, 10);
const RATE_TYPES = ['FIXED', 'PER_TON', 'PER_KM', 'PER_KG'];
const PAYMENT_TYPES = ['To Be Billed', 'Paid', 'To Pay'];
const GST_PAID_BY = ['Transporter', 'Consignor', 'Consignee'];

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export default function BiltyNew() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    lr_number: '',
    bilty_date: today,
    party_id: '',
    truck_id: '',
    consignor: '',
    consignee: '',
    paidBy: '',
    from_city: '',
    to_city: '',
    shipmentMode: 'Road',
    vehicleSize: '',
    driverName: '',
    ewayBillNo: '',
    ewayBillExpiry: '',
    containerNo: '',
    material: '',
    packingType: '',
    quantity: '',
    weight: '',
    invoiceNumber: '',
    invoiceDate: '',
    hsnCode: '',
    valueOfGoods: '',
    privateMark: '',
    insured: false,
    freight: 0,
    advance: 0,
    other_charges: 0,
    actualWeight: '',
    chargedWeight: '',
    rateType: 'FIXED',
    cgstPercent: 0,
    sgstPercent: 0,
    igstPercent: 0,
    tax: 0,
    paymentType: 'To Be Billed',
    gstPaidBy: 'Transporter',
  });

  useEffect(() => {
    Promise.all([api.get('/parties'), api.get('/trucks'), api.get('/bilties/next-lr')])
      .then(([partiesRes, trucksRes, lrRes]) => {
        setParties(partiesRes.parties);
        setTrucks(trucksRes.trucks);
        setForm((f) => ({ ...f, lr_number: lrRes.lrNumber }));
      })
      .catch((e) => setError(e.message));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const num = (v) => parseFloat(v) || 0;

  const freight = num(form.freight);
  const otherCharges = num(form.other_charges);
  const gstAmount = (freight * (num(form.cgstPercent) + num(form.sgstPercent) + num(form.igstPercent))) / 100;
  const biltyAmount = freight + otherCharges + gstAmount + num(form.tax);
  const finalPayable = biltyAmount - num(form.advance);

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
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Create Bilty</h1>
          <Link to="/bilties" className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm">
            &larr; Go Back
          </Link>
        </div>
        <button type="button" onClick={handleSubmit} disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2 text-sm shadow transition">
          {busy ? 'Saving…' : 'SAVE'}
        </button>
      </div>

      <Alert error={error} />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Card 1 — Bilty Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Bilty Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Bilty Number *</label>
              <input required value={form.lr_number} onChange={(e) => update('lr_number', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date *</label>
              <input type="date" required value={form.bilty_date} onChange={(e) => update('bilty_date', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>From *</label>
              <input required value={form.from_city} onChange={(e) => update('from_city', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>To *</label>
              <input required value={form.to_city} onChange={(e) => update('to_city', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Party *</label>
            <select required value={form.party_id} onChange={(e) => update('party_id', e.target.value)} className={inputCls}>
              <option value="">Select party</option>
              {parties.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {!parties.length && <p className="text-xs text-amber-600 mt-1">Add a party first.</p>}
          </div>

          <div>
            <label className={labelCls}>Truck Number</label>
            <select value={form.truck_id} onChange={(e) => update('truck_id', e.target.value)} className={inputCls}>
              <option value="">Select Vehicle</option>
              {trucks.map((t) => <option key={t._id} value={t._id}>{t.number}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Shipment Mode *</label>
              <input value={form.shipmentMode} onChange={(e) => update('shipmentMode', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Vehicle Size</label>
              <input value={form.vehicleSize} onChange={(e) => update('vehicleSize', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Driver</label>
            <input value={form.driverName} onChange={(e) => update('driverName', e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>E-way Bill No.</label>
              <input value={form.ewayBillNo} onChange={(e) => update('ewayBillNo', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Container No.</label>
              <input value={form.containerNo} onChange={(e) => update('containerNo', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>E-way Bill Expiry Date</label>
            <input type="date" value={form.ewayBillExpiry} onChange={(e) => update('ewayBillExpiry', e.target.value)} className={inputCls} />
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Consignor &amp; Consignee</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Consignor</label>
                <input value={form.consignor} onChange={(e) => update('consignor', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Consignee</label>
                <input value={form.consignee} onChange={(e) => update('consignee', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Paid By</label>
                <input value={form.paidBy} onChange={(e) => update('paidBy', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 — Material Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Material Details</h2>

          <div>
            <label className={labelCls}>Material Name</label>
            <input value={form.material} onChange={(e) => update('material', e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Packing Type</label>
              <input value={form.packingType} onChange={(e) => update('packingType', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Quantity</label>
              <input type="number" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Weight (kg)</label>
            <input type="number" step="0.01" value={form.weight} onChange={(e) => update('weight', e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Invoice Number</label>
              <input value={form.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Invoice Date</label>
              <input type="date" value={form.invoiceDate} onChange={(e) => update('invoiceDate', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>HSN Code</label>
              <input value={form.hsnCode} onChange={(e) => update('hsnCode', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Value of Goods (₹)</label>
              <input type="number" step="0.01" value={form.valueOfGoods} onChange={(e) => update('valueOfGoods', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Private Mark</label>
            <input value={form.privateMark} onChange={(e) => update('privateMark', e.target.value)} className={inputCls} />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className={labelCls}>Insurance</span>
            <div className="flex items-center gap-6 text-sm text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="insured" checked={!form.insured} onChange={() => update('insured', false)} className="w-4 h-4 text-blue-600" />
                Not Insured
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="insured" checked={form.insured} onChange={() => update('insured', true)} className="w-4 h-4 text-blue-600" />
                Insured
              </label>
            </div>
          </div>
        </div>

        {/* Card 3 — Freight Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Freight Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Actual Weight</label>
              <input type="number" step="0.01" value={form.actualWeight} onChange={(e) => update('actualWeight', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Charged Weight</label>
              <input type="number" step="0.01" value={form.chargedWeight} onChange={(e) => update('chargedWeight', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Rate Type *</label>
            <select value={form.rateType} onChange={(e) => update('rateType', e.target.value)} className={inputCls}>
              {RATE_TYPES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Freight Amount (₹)</label>
              <input type="number" step="0.01" value={form.freight} onChange={(e) => update('freight', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Advance (₹)</label>
              <input type="number" step="0.01" value={form.advance} onChange={(e) => update('advance', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Other Charges (₹)</label>
            <input type="number" step="0.01" value={form.other_charges} onChange={(e) => update('other_charges', e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>CGST %</label>
              <input type="number" step="0.01" value={form.cgstPercent} onChange={(e) => update('cgstPercent', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>SGST %</label>
              <input type="number" step="0.01" value={form.sgstPercent} onChange={(e) => update('sgstPercent', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>IGST %</label>
              <input type="number" step="0.01" value={form.igstPercent} onChange={(e) => update('igstPercent', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>TAX (₹)</label>
              <input type="number" step="0.01" value={form.tax} onChange={(e) => update('tax', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Computed totals */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">GST Amount</span><span className="font-semibold">₹{money(gstAmount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Bilty Amount</span><span className="font-semibold">₹{money(biltyAmount)}</span></div>
            <div className="flex justify-between text-base pt-1.5 border-t border-slate-200">
              <span className="font-bold text-slate-700">Final Bilty Payable</span>
              <span className="font-bold text-blue-700">₹{money(finalPayable)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Payment Type *</label>
              <select value={form.paymentType} onChange={(e) => update('paymentType', e.target.value)} className={inputCls}>
                {PAYMENT_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>GST Paid By *</label>
              <select value={form.gstPaidBy} onChange={(e) => update('gstPaidBy', e.target.value)} className={inputCls}>
                {GST_PAID_BY.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-end gap-3 pt-2 border-t border-slate-200">
          <Link to="/bilties" className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition">
            Cancel
          </Link>
          <button type="submit" disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-8 py-2.5 text-sm shadow transition">
            {busy ? 'Saving…' : 'Save Bilty'}
          </button>
        </div>
      </form>
    </div>
  );
}
