import { useState } from 'react';
import { api, isPdfDoc } from '../api';

// Single-file upload box: uploads to object storage when configured, else falls back to
// an inline base64 data URL. Value is the stored URL/data-URL string; onChange('') clears it.
export default function FileUploadBox({
  label,
  value,
  onChange,
  accept = 'image/*,application/pdf',
  maxMB = 5,
  className = '',
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`File exceeds the ${maxMB}MB limit.`);
      return;
    }
    setError('');
    setBusy(true);
    try {
      if (await api.uploadEnabled()) {
        const { url } = await api.upload('/uploads', file);
        onChange(url);
      } else {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        onChange(dataUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isPdf = isPdfDoc(value);

  return (
    <div className={className}>
      {label && <span className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</span>}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition">
        {value ? (
          <div className="relative flex flex-col items-center justify-center h-28 bg-white border border-slate-200 rounded-lg">
            {isPdf ? (
              <div className="flex flex-col items-center text-red-500">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-[11px] text-slate-600 mt-1">PDF Document</span>
              </div>
            ) : (
              <img src={value} alt={label || 'document'} className="max-h-24 object-contain rounded" />
            )}
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] px-2 py-0.5 rounded shadow"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center h-28 text-slate-500">
            {busy ? (
              <span className="text-xs font-medium">Uploading…</span>
            ) : (
              <>
                <svg className="w-6 h-6 text-blue-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-xs font-medium">Upload File</span>
              </>
            )}
            <input type="file" accept={accept} onChange={handleFile} className="hidden" disabled={busy} />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
