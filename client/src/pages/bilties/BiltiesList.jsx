import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

const SHIPPING_STATUSES = [
  { key: 'Generated', label: 'Generated', bg: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { key: 'Picked Up', label: 'Picked Up', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  { key: 'In Transit', label: 'In Transit', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { key: 'Out for Delivery', label: 'Out for Delivery', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
  { key: 'Delivered', label: 'Delivered', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { key: 'Paid', label: 'Paid', bg: 'bg-green-100 text-green-800 border-green-300' },
  { key: 'Cancelled', label: 'Cancelled', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
];

function money(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function BiltiesList() {
  const [bilties, setBilties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit modal state
  const [editingBilty, setEditingBilty] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchBilties();
  }, []);

  const fetchBilties = async () => {
    try {
      setLoading(true);
      const data = await api.get('/bilties');
      setBilties(data.bilties || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.patch(`/bilties/${id}/status`, { status: newStatus });
      if (res.bilty) {
        setBilties(prev => prev.map(b => (b._id === id ? { ...b, status: newStatus } : b)));
        setSuccess(`Status updated to "${newStatus}" for LR #${res.bilty.lrNumber}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (bilty) => {
    if (!window.confirm(`Are you sure you want to delete Bilty / LR #${bilty.lrNumber}?`)) return;
    try {
      await api.delete(`/bilties/${bilty._id}`);
      setBilties(prev => prev.filter(b => b._id !== bilty._id));
      setSuccess(`Bilty LR #${bilty.lrNumber} deleted successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (bilty) => {
    setEditingBilty(bilty);
    setEditForm({
      consignor: bilty.consignor || '',
      consignee: bilty.consignee || '',
      fromCity: bilty.fromCity || '',
      toCity: bilty.toCity || '',
      material: bilty.material || '',
      freight: bilty.freight || 0,
      advance: bilty.advance || 0,
      status: bilty.status || 'Generated',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.put(`/bilties/${editingBilty._id}`, editForm);
      if (res.bilty) {
        setBilties(prev => prev.map(b => (b._id === editingBilty._id ? { ...b, ...res.bilty } : b)));
        setEditingBilty(null);
        setSuccess(`Bilty LR #${res.bilty.lrNumber} updated successfully.`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePrint = (biltyId) => {
    window.open(`/bilties/${biltyId}`, '_blank');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Bilty / LR Management</h1>
            <p className="text-sm text-slate-500">Manage bilties, print LR invoices, update live shipping status, and track freight.</p>
          </div>
          <Link
            to="/bilties/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            + New Bilty
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading bilties...</div>
        ) : bilties.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No bilties found. Click "+ New Bilty" to create your first LR.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">LR No. & Date</th>
                    <th className="px-4 py-3">Consignor → Consignee</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Truck</th>
                    <th className="px-4 py-3 text-right">Freight</th>
                    <th className="px-4 py-3 min-w-[170px]">Shipping Status</th>
                    <th className="px-4 py-3 text-center min-w-[160px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bilties.map((b) => {
                    const statusObj = SHIPPING_STATUSES.find(s => s.key === b.status) || SHIPPING_STATUSES[0];

                    return (
                      <tr key={b._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">
                          <Link to={`/bilties/${b._id}`} className="font-extrabold text-brand-700 hover:underline">
                            {b.lrNumber}
                          </Link>
                          <div className="text-xs text-slate-400">{b.biltyDate}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{b.consignor || b.party?.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">To: {b.consignee || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {b.fromCity || '?'} → {b.toCity || '?'}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                          {b.truck?.number || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                          ₹{money(b.freight)}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={b.status || 'Generated'}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            className={`w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${statusObj.bg}`}
                          >
                            {SHIPPING_STATUSES.map(s => (
                              <option key={s.key} value={s.key} className="bg-white text-slate-800">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => openEditModal(b)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Bilty"
                            >
                              ✏️
                            </button>

                            {/* Print Action */}
                            <button
                              type="button"
                              onClick={() => handlePrint(b._id)}
                              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              title="Print Bilty / LR Invoice"
                            >
                              🖨️
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleDelete(b)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Bilty"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inline Edit Bilty Modal */}
        {editingBilty && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">✏️ Edit Bilty LR #{editingBilty.lrNumber}</h3>
                <button
                  onClick={() => setEditingBilty(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={saveEdit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600">Consignor (Sender)</label>
                    <input
                      type="text"
                      value={editForm.consignor}
                      onChange={(e) => setEditForm({ ...editForm, consignor: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600">Consignee (Receiver)</label>
                    <input
                      type="text"
                      value={editForm.consignee}
                      onChange={(e) => setEditForm({ ...editForm, consignee: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600">From City</label>
                    <input
                      type="text"
                      value={editForm.fromCity}
                      onChange={(e) => setEditForm({ ...editForm, fromCity: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600">To City</label>
                    <input
                      type="text"
                      value={editForm.toCity}
                      onChange={(e) => setEditForm({ ...editForm, toCity: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600">Freight Amount (₹)</label>
                    <input
                      type="number"
                      value={editForm.freight}
                      onChange={(e) => setEditForm({ ...editForm, freight: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600">Advance Paid (₹)</label>
                    <input
                      type="number"
                      value={editForm.advance}
                      onChange={(e) => setEditForm({ ...editForm, advance: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600">Shipping Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 mt-1 font-semibold focus:ring-2 focus:ring-brand-500"
                  >
                    {SHIPPING_STATUSES.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingBilty(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50"
                  >
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
