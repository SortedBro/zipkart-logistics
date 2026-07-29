import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const DOC_LABELS = {
  rcDocument: 'RC Document',
  insuranceDocument: 'Insurance Document',
  panCardDocument: 'PAN Card',
  fitnessDocument: 'Fitness Certificate',
  permitDocument: 'Permit Document',
  taxDocument: 'Tax Document',
  otherDocument: 'Other Document',
};

export default function TruckShow() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ category: 'fuel', amount: '', expense_date: new Date().toISOString().slice(0, 10), note: '' });
  const [busy, setBusy] = useState(false);

  function load() {
    api.get(`/trucks/${id}`).then(setData).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function handleExpense(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await api.post(`/trucks/${id}/expenses`, form);
      setSuccess('Expense recorded.');
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

  const { truck, pl, expenses, bilties } = data;
  const docs = truck.documents || {};
  const hasDocuments = Object.values(docs).some((v) => Boolean(v));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{truck.number}</h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold uppercase tracking-wider">
              {truck.ownerType === 'market' ? 'Market Truck' : 'My Truck'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {truck.type || 'Type not specified'} {truck.vehicleLength ? `(${truck.vehicleLength})` : ''} · Owner: {truck.ownerName || 'N/A'} ({truck.ownerPhone || 'N/A'})
          </p>
        </div>
        <div className="flex items-center gap-4 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
            <div className="text-xs text-slate-500">Income</div>
            <div className="font-bold text-green-600">₹{money(pl.income)}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
            <div className="text-xs text-slate-500">Expense</div>
            <div className="font-bold text-red-600">₹{money(pl.expense)}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
            <div className="text-xs text-slate-500">Net Profit</div>
            <div className={`font-bold ${pl.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{money(pl.profit)}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Reminders Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
              Vehicle &amp; Reminder Details
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Driver Name</span>
                <span className="font-semibold text-slate-700">{truck.driverName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Driver Phone</span>
                <span className="font-semibold text-slate-700">{truck.driverPhone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tyre Number</span>
                <span className="font-semibold text-slate-700">{truck.tyreNumber || '-'}</span>
              </div>

              <div>
                <span className="text-slate-400 block">RC Expiry</span>
                <span className="font-semibold text-slate-700">{truck.rcExpiryDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Insurance Expiry</span>
                <span className="font-semibold text-slate-700">{truck.insuranceExpiryDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Permit Expiry</span>
                <span className="font-semibold text-slate-700">{truck.permitExpiryDate || '-'}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Fitness Expiry</span>
                <span className="font-semibold text-slate-700">{truck.fitnessExpiryDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">PUC Expiry</span>
                <span className="font-semibold text-slate-700">{truck.pucExpiryDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tax Paid Till</span>
                <span className="font-semibold text-slate-700">{truck.taxPaidTill || '-'}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Current Odometer</span>
                <span className="font-semibold text-slate-700">{truck.currentOdometer ? `${truck.currentOdometer} KM` : '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Last Service Date</span>
                <span className="font-semibold text-slate-700">{truck.lastServiceDate || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Next Service Due</span>
                <span className="font-semibold text-slate-700">{truck.nextServiceDueKm ? `${truck.nextServiceDueKm} KM` : '-'}</span>
              </div>
            </div>

            {truck.remarks && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 block">Remarks</span>
                <p className="text-slate-700 font-medium mt-0.5">{truck.remarks}</p>
              </div>
            )}
          </div>

          {/* Truck Documents Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
              Truck Documents
            </h2>

            {!hasDocuments ? (
              <p className="text-sm text-slate-400 py-2">No documents uploaded for this truck.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(DOC_LABELS).map(([key, label]) => {
                  const val = docs[key];
                  if (!val) return null;
                  const isPdf = val.startsWith('data:application/pdf');

                  return (
                    <div key={key} className="border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-between text-center bg-slate-50">
                      <span className="text-xs font-semibold text-slate-700 mb-2">{label}</span>
                      {isPdf ? (
                        <div className="my-2 flex flex-col items-center">
                          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] text-slate-500 mt-1">PDF File</span>
                        </div>
                      ) : (
                        <img src={val} alt={label} className="h-20 object-contain my-1 rounded border border-slate-100" />
                      )}
                      <a
                        href={val}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                      >
                        View Document
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bilty on this Truck */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-semibold mb-4 text-slate-800">Bilty on this Truck</h2>
            {!bilties.length && <p className="text-sm text-slate-400">Is truck par koi bilty nahi hai.</p>}
            <div className="space-y-2">
              {bilties.map((b) => (
                <Link key={b._id} to={`/bilties/${b._id}`} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0 hover:text-blue-600">
                  <div className="font-medium">{b.lrNumber}</div>
                  <div className="font-semibold">₹{money(b.freight)}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-semibold mb-4 text-slate-800">Expenses</h2>
            {!expenses.length && <p className="text-sm text-slate-400">Abhi tak koi expense record nahi hai.</p>}
            <div className="space-y-2">
              {expenses.map((e) => (
                <div key={e._id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                  <div>
                    <div className="font-medium capitalize text-slate-700">{e.category.replace('_', ' ')}</div>
                    <div className="text-xs text-slate-400">{e.expenseDate} {e.note ? `· ${e.note}` : ''}</div>
                  </div>
                  <div className="font-semibold text-red-600">₹{money(e.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Add Expense */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit shadow-sm">
          <h2 className="font-semibold mb-4 text-slate-800">Add Expense</h2>
          <Alert error={error} success={success} />
          <form onSubmit={handleExpense} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-600">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700">
                <option value="fuel">Fuel</option>
                <option value="driver_salary">Driver Salary</option>
                <option value="maintenance">Maintenance</option>
                <option value="toll">Toll / FASTag</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-600">Amount (₹)</label>
              <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-600">Date</label>
              <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-600">Note</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm shadow transition">
              {busy ? 'Saving…' : 'Save Expense'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
