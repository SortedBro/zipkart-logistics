import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

const today = new Date().toISOString().slice(0, 10);
const RATE_TYPES = ['FIXED', 'PER_TON', 'PER_KM', 'PER_KG'];
const PAYMENT_TYPES = ['To Be Billed', 'Paid', 'To Pay'];
const GST_PAID_BY = ['Transporter', 'Consignor', 'Consignee'];

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export default function BiltyNew() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [hideFreight, setHideFreight] = useState(false);

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
    weightQuantityUnit: '',
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
        setParties(partiesRes.parties || []);
        setTrucks(trucksRes.trucks || []);
        setForm((f) => ({ ...f, lr_number: lrRes.lrNumber }));
      })
      .catch((e) => setError(e.message));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const num = (v) => parseFloat(v) || 0;

  const freight = num(form.freight);
  const otherCharges = num(form.other_charges);
  const cgst = num(form.cgstPercent);
  const sgst = num(form.sgstPercent);
  const igst = num(form.igstPercent);
  const tax = num(form.tax);
  const gstAmount = (freight * (cgst + sgst + igst)) / 100;
  const biltyAmount = freight + otherCharges + gstAmount + tax;
  const finalPayable = biltyAmount - num(form.advance);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
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
    <div className="max-w-[1400px] mx-auto space-y-5 pb-16">
      {/* Header bar matching TransportKhata */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-slate-800">Create Bilty</h1>
          <Link
            to="/bilties"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition"
          >
            <span>← Go Back</span>
          </Link>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-lg px-5 py-2 text-sm shadow-md transition flex items-center gap-1.5"
        >
          <span>💾</span>
          <span>{busy ? 'Saving…' : 'SAVE'}</span>
        </button>
      </div>

      <Alert error={error} />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-5 items-start">
        {/* ─── COLUMN 1: Bilty Details & Consignor/Consignee Details ─── */}
        <div className="space-y-5">
          {/* Card 1: Bilty Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Bilty Details
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Bilty Number*</label>
                <input
                  required
                  value={form.lr_number}
                  onChange={(e) => update('lr_number', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Date*</label>
                <input
                  type="date"
                  required
                  value={form.bilty_date}
                  onChange={(e) => update('bilty_date', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>From*</label>
                <input
                  required
                  value={form.from_city}
                  onChange={(e) => update('from_city', e.target.value)}
                  placeholder="Origin City"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>To*</label>
                <input
                  required
                  value={form.to_city}
                  onChange={(e) => update('to_city', e.target.value)}
                  placeholder="Destination City"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Truck Number</label>
                <Link to="/trucks/new" className="text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700">
                  + Add
                </Link>
              </div>
              <select
                value={form.truck_id}
                onChange={(e) => update('truck_id', e.target.value)}
                className={inputCls}
              >
                <option value="">Select Vehicle</option>
                {trucks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.number}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Shipment Mode*</label>
                <input
                  required
                  value={form.shipmentMode}
                  onChange={(e) => update('shipmentMode', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Vehicle Size</label>
                <input
                  value={form.vehicleSize}
                  onChange={(e) => update('vehicleSize', e.target.value)}
                  placeholder="e.g. 32 Ft MXL"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Driver</label>
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt('Enter driver name:');
                    if (name) update('driverName', name);
                  }}
                  className="text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
                >
                  + Add
                </button>
              </div>
              <input
                value={form.driverName}
                onChange={(e) => update('driverName', e.target.value)}
                placeholder="Select / Enter Driver"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>E-way Bill No.</label>
                <input
                  value={form.ewayBillNo}
                  onChange={(e) => update('ewayBillNo', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Container No.</label>
                <input
                  value={form.containerNo}
                  onChange={(e) => update('containerNo', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>E-way Bill Expiry Date</label>
              <input
                type="date"
                value={form.ewayBillExpiry}
                onChange={(e) => update('ewayBillExpiry', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Card 2: Consignor & Consignee Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Consignor &amp; Consignee Details
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Consignor</label>
                <div className="flex gap-1">
                  <Link to="/parties/new" className="text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700">
                    + Add
                  </Link>
                  <button type="button" onClick={() => update('consignor', '')} className="text-[11px] font-semibold border border-slate-300 text-slate-600 px-2 py-0.5 rounded hover:bg-slate-50">
                    ✏️ Edit
                  </button>
                </div>
              </div>
              <input
                value={form.consignor}
                onChange={(e) => update('consignor', e.target.value)}
                placeholder="Select / Enter Consignor"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Consignee</label>
                <div className="flex gap-1">
                  <Link to="/parties/new" className="text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700">
                    + Add
                  </Link>
                  <button type="button" onClick={() => update('consignee', '')} className="text-[11px] font-semibold border border-slate-300 text-slate-600 px-2 py-0.5 rounded hover:bg-slate-50">
                    ✏️ Edit
                  </button>
                </div>
              </div>
              <input
                value={form.consignee}
                onChange={(e) => update('consignee', e.target.value)}
                placeholder="Select / Enter Consignee"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Paid By</label>
                <Link to="/parties/new" className="text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700">
                  + Add
                </Link>
              </div>
              <select
                value={form.party_id}
                onChange={(e) => {
                  update('party_id', e.target.value);
                  const p = parties.find((item) => item._id === e.target.value);
                  if (p) update('paidBy', p.name);
                }}
                className={inputCls}
              >
                <option value="">Select Party</option>
                {parties.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── COLUMN 2: Material Details & Insurance Details ─── */}
        <div className="space-y-5">
          {/* Card 3: Material Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Material Details
            </h2>

            <div>
              <label className={labelCls}>Material Name</label>
              <input
                value={form.material}
                onChange={(e) => update('material', e.target.value)}
                placeholder="e.g. FMCG Goods / Electronics"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Packing Type</label>
                <input
                  value={form.packingType}
                  onChange={(e) => update('packingType', e.target.value)}
                  placeholder="e.g. Boxes / Bags"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => update('quantity', e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Weight/Quantity</label>
                <input
                  value={form.weightQuantityUnit}
                  onChange={(e) => update('weightQuantityUnit', e.target.value)}
                  placeholder="Unit (e.g. MT, Ton, Kg)"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Weight</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.weight}
                  onChange={(e) => update('weight', e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Invoice Number</label>
                <input
                  value={form.invoiceNumber}
                  onChange={(e) => update('invoiceNumber', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Invoice Date</label>
                <input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => update('invoiceDate', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>HSN Code</label>
                <input
                  value={form.hsnCode}
                  onChange={(e) => update('hsnCode', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Value of Goods</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valueOfGoods}
                  onChange={(e) => update('valueOfGoods', e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Private Mark</label>
              <input
                value={form.privateMark}
                onChange={(e) => update('privateMark', e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              type="button"
              onClick={() => alert('Additional material line items can be entered in description.')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition shadow-sm"
            >
              + Add Items
            </button>
          </div>

          {/* Card 4: Insurance Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Insurance Details
            </h2>

            <div className="flex items-center gap-6 text-sm font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="insured"
                  checked={!form.insured}
                  onChange={() => update('insured', false)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Not Insured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="insured"
                  checked={form.insured}
                  onChange={() => update('insured', true)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Insured</span>
              </label>
            </div>
          </div>
        </div>

        {/* ─── COLUMN 3: Freight Details ─── */}
        <div className="space-y-5">
          {/* Card 5: Freight Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">Freight Details</h2>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <span>Hide</span>
                <button
                  type="button"
                  onClick={() => setHideFreight(!hideFreight)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    hideFreight ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      hideFreight ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {!hideFreight && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Actual Weight</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.actualWeight}
                      onChange={(e) => update('actualWeight', e.target.value)}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Charged Weight</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.chargedWeight}
                      onChange={(e) => update('chargedWeight', e.target.value)}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Rate Type*</label>
                  <select
                    value={form.rateType}
                    onChange={(e) => update('rateType', e.target.value)}
                    className={inputCls}
                  >
                    {RATE_TYPES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Freight Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.freight}
                    onChange={(e) => update('freight', e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>CGST %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.cgstPercent}
                      onChange={(e) => update('cgstPercent', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>SGST %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.sgstPercent}
                      onChange={(e) => update('sgstPercent', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>IGST %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.igstPercent}
                      onChange={(e) => update('igstPercent', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>TAX</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.tax}
                      onChange={(e) => update('tax', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Bilty Amount</label>
                  <input
                    type="text"
                    readOnly
                    value={money(biltyAmount)}
                    className={`${inputCls} bg-slate-50 font-bold text-slate-800`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const extra = prompt('Enter additional charge amount (₹):');
                    if (extra) update('other_charges', num(form.other_charges) + num(extra));
                  }}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs border border-blue-200 transition"
                >
                  + Add Charge
                </button>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Total Charges</span>
                    <span>{money(otherCharges)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                    <span>Final Bilty Payable</span>
                    <span className="text-blue-700">₹{money(finalPayable)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Payment Type*</label>
                    <select
                      value={form.paymentType}
                      onChange={(e) => update('paymentType', e.target.value)}
                      className={inputCls}
                    >
                      {PAYMENT_TYPES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>GST Paid By*</label>
                    <select
                      value={form.gstPaidBy}
                      onChange={(e) => update('gstPaidBy', e.target.value)}
                      className={inputCls}
                    >
                      {GST_PAID_BY.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
