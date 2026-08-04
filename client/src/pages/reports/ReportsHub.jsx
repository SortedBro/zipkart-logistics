import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';

export default function ReportsHub() {
  const [profitData, setProfitData] = useState({ income: 0, expense: 0, profit: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/profit'),
      api.get('/reports/expenses'),
    ]).then(([p, e]) => {
      setProfitData(p || { income: 0, expense: 0, profit: 0 });
      setCategories(e.categories || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Analytics & Reports Hub</h1>
          <p className="text-sm text-slate-500">Fleet profitability, expense distribution, and operational performance.</p>
        </div>

        {/* P&L Header Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-emerald-600">Total Income</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹{profitData.income?.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-rose-600">Total Expenses</div>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">₹{profitData.expense?.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase text-brand-600">Net Profit</div>
            <div className={`text-2xl font-extrabold mt-1 ${profitData.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              ₹{profitData.profit?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Category Expense Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            Expense Breakdown by Category
          </h2>
          {loading ? (
            <div className="text-sm text-slate-400">Loading expense metrics...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-slate-400">No expense records found.</div>
          ) : (
            <div className="space-y-3">
              {categories.map(c => {
                const totalExp = profitData.expense || 1;
                const pct = Math.min(100, Math.round((c.totalAmount / totalExp) * 100));
                return (
                  <div key={c._id} className="space-y-1">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-slate-800">{c._id} ({c.count} transactions)</span>
                      <span className="text-slate-900">₹{c.totalAmount?.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
