import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function ExpensesList() {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const query = categoryFilter ? `?category=${categoryFilter}` : '';
      const data = await api.get(`/expenses${query}`);
      setExpenses(data.expenses || []);
      setTotalAmount(data.totalAmount || 0);
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
            <h1 className="text-2xl font-extrabold text-slate-900">Expenses & Outflow</h1>
            <p className="text-sm text-slate-500">Track fuel, tolls, vehicle maintenance, driver salaries, and office costs.</p>
          </div>
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Log Expense
          </Link>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-rose-600">Total Logged Expense</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalAmount.toLocaleString()}</div>
          </div>
          <div className="text-xs text-slate-400 font-semibold">{expenses.length} Records</div>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Fuel">Fuel</option>
            <option value="Toll">Toll</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Driver Salary">Driver Salary</option>
            <option value="Staff Salary">Staff Salary</option>
            <option value="Office">Office</option>
            <option value="Vendor Payment">Vendor Payment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No expense records found.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Expense Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Payment Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{exp.title}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-extrabold text-rose-700">₹{exp.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3">{exp.truck ? exp.truck.number : 'N/A'}</td>
                      <td className="px-4 py-3">{exp.paymentMode || 'Cash'}</td>
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
