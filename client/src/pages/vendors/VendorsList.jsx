import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function VendorsList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await api.get('/vendors');
      setVendors(data.vendors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Vendors Directory</h1>
            <p className="text-sm text-slate-500">Manage transport suppliers, broker commissions, GST numbers, and opening balances.</p>
          </div>
          <Link
            to="/vendors/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Add Vendor
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No vendors registered yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Vendor Name</th>
                    <th className="px-4 py-3">Contact Person</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Linked Trucks</th>
                    <th className="px-4 py-3">Commission</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {vendors.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <Link to={`/vendors/${v._id}`} className="hover:text-brand-600">
                          {v.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{v.contactPerson || 'N/A'}</td>
                      <td className="px-4 py-3">{v.mobile}</td>
                      <td className="px-4 py-3">{v.city || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          🚚 {v.linkedTrucksCount || 0} Trucks
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {v.commissionValue ? `${v.commissionValue}${v.commissionType === 'Percentage' ? '%' : ' ₹'}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">₹{v.currentBalance?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/vendors/${v._id}`} className="text-xs font-bold text-brand-600 hover:text-brand-800">
                          View Fleet & Ledger →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
