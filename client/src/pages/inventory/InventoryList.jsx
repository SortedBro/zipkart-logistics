import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function InventoryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await api.get('/inventory');
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async (id, adjustment) => {
    try {
      await api.patch(`/inventory/${id}/adjust`, { adjustment });
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Spare Parts & Inventory</h1>
            <p className="text-sm text-slate-500">Track vehicle spares, stock levels, lubricants, and low-stock alerts.</p>
          </div>
          <Link
            to="/inventory/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Add Inventory Item
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading inventory items...</div>
        ) : items.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No inventory items registered. Click "Add Inventory Item" to start tracking spare parts.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">SKU / Model</th>
                    <th className="px-4 py-3">In Stock</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Stock Level</th>
                    <th className="px-4 py-3 text-right">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item) => {
                    const isLow = item.quantity <= (item.lowStockAlertLevel || 5);
                    return (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{item.itemName}</td>
                        <td className="px-4 py-3 text-slate-600">{item.category}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.skuModel || 'N/A'}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isLow ? 'Low Stock Alert' : 'Sufficient'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => handleAdjust(item._id, 1)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded border border-emerald-200 text-xs"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjust(item._id, -1)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded border border-rose-200 text-xs"
                          >
                            -1
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
