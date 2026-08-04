import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function InventoryNew() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    itemName: '',
    category: 'Tyres & Tubes',
    skuModel: '',
    quantity: '0',
    unit: 'Pcs',
    lowStockAlertLevel: '5',
    description: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.category) {
      setError('Item name and category are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/inventory', form);
      navigate('/inventory');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Add Spare Part / Item</h1>
          <Link to="/inventory" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Inventory
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Item Name *</label>
              <input
                type="text"
                name="itemName"
                required
                value={form.itemName}
                onChange={handleChange}
                placeholder="e.g. Radial Tyre 295/80 R22.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Tyres & Tubes">Tyres & Tubes</option>
                <option value="Lubricants & Engine Oil">Lubricants & Engine Oil</option>
                <option value="Brake Pads & Liners">Brake Pads & Liners</option>
                <option value="Batteries">Batteries</option>
                <option value="Filters & Belts">Filters & Belts</option>
                <option value="General Hardware">General Hardware</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SKU / Model Number</label>
              <input
                type="text"
                name="skuModel"
                value={form.skuModel}
                onChange={handleChange}
                placeholder="MRF-295-R22"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Stock Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit</label>
              <input
                type="text"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="Pcs, Liters, Boxes"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Low Stock Alert Level</label>
              <input
                type="number"
                name="lowStockAlertLevel"
                value={form.lowStockAlertLevel}
                onChange={handleChange}
                placeholder="5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/inventory" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
