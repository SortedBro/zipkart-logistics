import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function SalariesList() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const data = await api.get('/salaries');
      setSalaries(data.salaries || []);
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
            <h1 className="text-2xl font-extrabold text-slate-900">Payroll & Driver Salaries</h1>
            <p className="text-sm text-slate-500">Generate monthly salary slips, process basic pay, incentives, advance deductions, and net payouts.</p>
          </div>
          <Link
            to="/salaries/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Generate Salary Slip
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading payroll history...</div>
        ) : salaries.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No salary records created. Click "Generate Salary Slip" to process driver/staff payroll.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Employee / Driver</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Month / Year</th>
                    <th className="px-4 py-3">Basic Pay</th>
                    <th className="px-4 py-3">Deductions</th>
                    <th className="px-4 py-3">Net Payable</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {salaries.map((sal) => (
                    <tr key={sal._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{sal.personName}</td>
                      <td className="px-4 py-3 text-slate-500">{sal.personType}</td>
                      <td className="px-4 py-3 font-semibold">{sal.month} {sal.year}</td>
                      <td className="px-4 py-3">₹{sal.basicSalary?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-rose-600">₹{((sal.advanceDeductions || 0) + (sal.finesDeductions || 0)).toLocaleString()}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-700">₹{sal.netSalary?.toLocaleString()}</td>
                      <td className="px-4 py-3">{sal.paymentMode}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {sal.paymentStatus}
                        </span>
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
