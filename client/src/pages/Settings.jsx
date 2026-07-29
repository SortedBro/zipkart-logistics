import { useEffect, useState } from 'react';
import { api } from '../api';
import Alert from '../components/Alert.jsx';

const FIELDS = [
  { key: 'name', label: 'Company Name', required: true, colSpan: 2 },
  { key: 'gstin', label: 'GSTIN' },
  { key: 'phone', label: 'Contact Phone' },
  { key: 'email', label: 'Contact Email', type: 'email' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'pincode', label: 'PIN Code' },
  { key: 'address', label: 'Address', textarea: true, colSpan: 2 },
];

const EMPTY = { name: '', logo: '', gstin: '', address: '', city: '', state: '', pincode: '', phone: '', email: '' };

export default function Settings() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/settings');
        setForm({ ...EMPTY, ...data.company });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleLogo(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('Logo must be under 1 MB.');
      return;
    }
    setError('');
    // Prefer object storage (stores a URL); fall back to inline base64 when not configured.
    try {
      if (await api.uploadEnabled()) {
        const { url } = await api.upload('/uploads', file, { type: 'logo' });
        update('logo', url);
        return;
      }
    } catch (err) {
      setError(err.message);
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => update('logo', evt.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.put('/settings', form);
      setForm({ ...EMPTY, ...data.company });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="text-slate-400 py-12 text-center">Loading settings…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">Company Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          These details appear on bilties, print-outs, and across the portal.
        </p>
      </div>

      <Alert error={error} />
      {saved && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5">
          Settings saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Company Logo</h2>
          <div className="flex items-center gap-5">
            <div className="w-28 h-28 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
              {form.logo ? (
                <img src={form.logo} alt="Company logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400">No logo</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="cursor-pointer inline-block text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
              {form.logo && (
                <button
                  type="button"
                  onClick={() => update('logo', '')}
                  className="block text-xs text-red-600 hover:underline"
                >
                  Remove logo
                </button>
              )}
              <p className="text-xs text-slate-400">PNG or JPG, up to 1 MB.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Business Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.colSpan === 2 ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {f.label}
                  {f.required && <span className="text-red-500"> *</span>}
                </label>
                {f.textarea ? (
                  <textarea
                    rows={2}
                    value={form[f.key] || ''}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <input
                    type={f.type || 'text'}
                    required={f.required}
                    value={form[f.key] || ''}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-8 py-2.5 text-sm shadow transition"
          >
            {busy ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
