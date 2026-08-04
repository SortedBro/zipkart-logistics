import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FileUploadBox from '../../components/FileUploadBox.jsx';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function DocumentNew() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    documentType: 'RC',
    expiryDate: '',
    truck: '',
    driver: '',
    fileUrl: '',
    notes: '',
  });

  useEffect(() => {
    api.get('/trucks').then(res => setTrucks(res.trucks || [])).catch(() => {});
    api.get('/drivers').then(res => setDrivers(res.drivers || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.documentType || !form.fileUrl) {
      setError('Title, document type, and uploaded file are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/documents', form);
      navigate('/documents');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Upload Document</h1>
          <Link to="/documents" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Vault
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Title *</label>
              <input
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Truck RC Copy DL01AB1234"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Type *</label>
              <select
                name="documentType"
                value={form.documentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="RC">RC (Registration Certificate)</option>
                <option value="Insurance">Insurance Policy</option>
                <option value="PUC">PUC Certificate</option>
                <option value="Permit">National/State Permit</option>
                <option value="Fitness">Fitness Certificate</option>
                <option value="Driving License">Driving License</option>
                <option value="Aadhar">Aadhar Card</option>
                <option value="Contract">Client Contract</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Link to Truck</label>
              <select
                name="truck"
                value={form.truck}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">None</option>
                {trucks.map(t => (
                  <option key={t._id} value={t._id}>{t.number}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Link to Driver</label>
              <select
                name="driver"
                value={form.driver}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">None</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Upload File *</label>
              <FileUploadBox
                value={form.fileUrl}
                onChange={(url) => setForm(prev => ({ ...prev, fileUrl: url }))}
                label="Upload document scan or PDF"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/documents" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </div>
  );
}
