import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function DriversList() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/drivers');
      setDrivers(data.drivers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (driver) => {
    if (!window.confirm(`Delete driver "${driver.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/drivers/${driver._id}`);
      setDrivers(prev => prev.filter(d => d._id !== driver._id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                          d.mobile.includes(search) || 
                          (d.licenseNumber && d.licenseNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || d.dutyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Drivers Management</h1>
            <p className="text-sm text-slate-500">Track driver licenses, assigned vehicles, duty status, and payroll.</p>
          </div>
          <Link
            to="/drivers/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Add New Driver
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by driver name, mobile or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Duty Statuses</option>
            <option value="On Duty">On Duty</option>
            <option value="Off Duty">Off Duty</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading drivers...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No drivers found. Click "Add New Driver" to create one.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Driver Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Assigned Truck</th>
                    <th className="px-4 py-3">License No</th>
                    <th className="px-4 py-3">Monthly Salary</th>
                    <th className="px-4 py-3">Duty Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{d.name}</td>
                      <td className="px-4 py-3">{d.mobile}</td>
                      <td className="px-4 py-3">
                        {d.assignedVehicle ? (
                          <span className="font-semibold text-slate-800">{d.assignedVehicle.number}</span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{d.licenseNumber || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium">₹{d.monthlySalary?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          d.dutyStatus === 'On Duty' ? 'bg-emerald-100 text-emerald-800' :
                          d.dutyStatus === 'On Leave' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {d.dutyStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(d)}
                          className="text-rose-600 hover:text-rose-800 font-medium text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
}
