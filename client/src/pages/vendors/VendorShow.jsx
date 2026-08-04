import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function VendorShow() {
  const { id } = useParams();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/vendors/${id}`);
      setVendorData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="p-8 text-center text-slate-500">Loading vendor fleet & ledger...</div>
    );
  }

  if (error || !vendorData) {
    return (
      <div className="space-y-4">
        <Alert type="error" message={error || 'Vendor not found.'} />
        <Link to="/vendors" className="text-sm font-bold text-brand-600">← Back to Vendors</Link>
      </div>
    );
  }

  const { vendor, linkedTrucks = [], trips = [], stats = {} } = vendorData;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900">{vendor.name}</h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                🚚 {stats.totalTrucks} Linked Trucks
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Contact: {vendor.contactPerson || 'N/A'} · Mobile: {vendor.mobile} · City: {vendor.city || 'N/A'}
            </p>
          </div>
          <Link to="/vendors" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Directory
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Total Linked Vehicles</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalTrucks} Trucks</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-brand-600">Total Trips Executed</div>
            <div className="text-2xl font-extrabold text-brand-700 mt-1">{stats.totalTrips} Trips</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-emerald-600">Total Freight Volume</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹{stats.totalFreight?.toLocaleString()}</div>
          </div>
        </div>

        {/* Linked Vehicles Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>🚚 Linked Fleet / Market Vehicles</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                {linkedTrucks.length} Trucks
              </span>
            </h2>
            <Link
              to="/trucks/new"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
            >
              + Link Another Truck
            </Link>
          </div>

          {linkedTrucks.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              No trucks currently linked to {vendor.name}. Go to "Trucks ➔ Add Truck" and select this vendor under Market Truck.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkedTrucks.map((truck) => (
                <div key={truck._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">{truck.number}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {truck.type || 'Market Truck'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>Length: {truck.vehicleLength || 'Standard'}</div>
                    <div>Driver: {truck.driverName || 'N/A'} ({truck.driverPhone || 'N/A'})</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-right">
                    <Link to={`/trucks/${truck._id}`} className="text-xs font-bold text-brand-600 hover:underline">
                      View Truck Details & P&L →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trips History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Vendor Trips & Freight History ({trips.length})
          </h2>
          {trips.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">No trips recorded for this vendor's fleet yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Trip Route</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">Freight Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {trips.map(t => (
                    <tr key={t._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{t.route || `${t.fromCity} → ${t.toCity}`}</td>
                      <td className="px-4 py-3 font-semibold">{t.truck?.number || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-500">{t.startDate || 'N/A'}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-700">₹{(t.freight || t.customerAmount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 capitalize">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}
