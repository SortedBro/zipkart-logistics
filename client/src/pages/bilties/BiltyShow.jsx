import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function BiltyShow() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending');

  function load() {
    api.get(`/bilties/${id}`).then((d) => {
      setData(d);
      setStatus(d.bilty.status);
    }).catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function updateStatus(e) {
    e.preventDefault();
    try {
      await api.patch(`/bilties/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !data) return <p className="text-red-600 text-sm">{error}</p>;
  if (!data) return <p className="text-slate-400 text-sm">Loading…</p>;

  const { bilty, balance } = data;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 print-hidden">
        <h1 className="text-2xl font-bold">Bilty {bilty.lrNumber}</h1>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-slate-100 hover:bg-slate-200 text-sm font-semibold px-4 py-2 rounded-lg">Print</button>
          <form onSubmit={updateStatus} className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-2 text-sm">
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="paid">Paid</option>
            </select>
            <button className="bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">Update</button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-slate-800 p-8">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
          <div>
            <div className="font-extrabold text-xl">{user?.companyName}</div>
            <div className="text-xs text-slate-500">Consignment Note / Bilty</div>
          </div>
          <div className="text-right">
            <div className="font-bold">{bilty.lrNumber}</div>
            <div className="text-xs text-slate-500">{bilty.biltyDate}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6 text-sm">
          <Field label="Consignor" value={bilty.consignor} />
          <Field label="Consignee" value={bilty.consignee} />
          <Field label="From" value={bilty.fromCity} />
          <Field label="To" value={bilty.toCity} />
          <Field label="Party (Billed To)" value={bilty.party?.name} />
          <Field label="Truck" value={bilty.truck ? `${bilty.truck.number}${bilty.truck.driverName ? ' · ' + bilty.truck.driverName : ''}` : '—'} />
          <Field label="Material" value={bilty.material} />
          <Field label="Weight" value={bilty.weight ? `${bilty.weight} kg` : '—'} />
        </div>

        <table className="w-full text-sm border-t border-slate-200 pt-4">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Freight</td>
              <td className="py-2 text-right font-medium">₹{money(bilty.freight)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Other Charges</td>
              <td className="py-2 text-right font-medium">₹{money(bilty.otherCharges)}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-500">Advance Paid</td>
              <td className="py-2 text-right font-medium">- ₹{money(bilty.advance)}</td>
            </tr>
            <tr>
              <td className="py-2 font-bold">Balance Due</td>
              <td className="py-2 text-right font-bold text-lg">₹{money(balance)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-400 uppercase mb-1">{label}</div>
      <div className="font-medium">{value || '—'}</div>
    </div>
  );
}
