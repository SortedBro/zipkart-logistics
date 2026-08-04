import { useState, useEffect } from 'react';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function AttendanceManager() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [drivers, setDrivers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/attendance?date=${date}`);
      setDrivers(res.drivers || []);
      setStaff(res.staff || []);

      const map = {};
      (res.records || []).forEach(r => {
        const key = r.driver || r.user || r.personName;
        map[key] = r.status;
      });
      setAttendanceMap(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (key, status) => {
    setAttendanceMap(prev => ({ ...prev, [key]: status }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg('');
      setError('');

      const records = [];
      drivers.forEach(d => {
        records.push({
          personType: 'Driver',
          driverId: d._id,
          personName: d.name,
          status: attendanceMap[d._id] || 'Present',
        });
      });
      staff.forEach(s => {
        records.push({
          personType: 'Staff',
          userId: s._id,
          personName: s.name,
          status: attendanceMap[s._id] || 'Present',
        });
      });

      await api.post('/attendance', { date, records });
      setMsg('Daily attendance saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Daily Attendance Log</h1>
            <p className="text-sm text-slate-500">Mark daily attendance for drivers and operational staff.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {msg && <Alert type="success" message={msg} />}
        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading daily roster...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drivers Roster */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Drivers Roster ({drivers.length})
              </h2>
              {drivers.length === 0 ? (
                <div className="text-sm text-slate-400">No drivers configured.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {drivers.map(d => (
                    <div key={d._id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{d.name}</div>
                        <div className="text-xs text-slate-400">{d.mobile}</div>
                      </div>
                      <div className="flex gap-1">
                        {['Present', 'Absent', 'Leave'].map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(d._id, st)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                              (attendanceMap[d._id] || 'Present') === st
                                ? st === 'Present' ? 'bg-emerald-600 text-white'
                                  : st === 'Leave' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Roster */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Office Staff Roster ({staff.length})
              </h2>
              {staff.length === 0 ? (
                <div className="text-sm text-slate-400">No office staff users.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {staff.map(s => (
                    <div key={s._id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.role} · {s.email}</div>
                      </div>
                      <div className="flex gap-1">
                        {['Present', 'Absent', 'Leave'].map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(s._id, st)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                              (attendanceMap[s._id] || 'Present') === st
                                ? st === 'Present' ? 'bg-emerald-600 text-white'
                                  : st === 'Leave' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
