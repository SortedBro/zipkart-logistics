import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api';
import Alert from '../../components/Alert.jsx';

const TRUCK_TYPES = [
  'Open Body',
  'Container',
  'Trailer',
  'Tanker',
  'Tipper',
  '22ft Container',
  '32ft MXL Container',
  '32ft SXL Container',
  'LCV / Pickup',
  'Other',
];

const VEHICLE_LENGTHS = [
  '14 ft',
  '17 ft',
  '19 ft',
  '20 ft',
  '22 ft',
  '24 ft',
  '28 ft',
  '32 ft',
  '40 ft',
];

const DOC_DEFINITIONS = [
  { key: 'rcDocument', label: 'RC Document' },
  { key: 'insuranceDocument', label: 'Insurance Document' },
  { key: 'panCardDocument', label: 'PAN Card' },
  { key: 'fitnessDocument', label: 'Fitness certificate' },
  { key: 'permitDocument', label: 'Permit Document' },
  { key: 'taxDocument', label: 'Tax Document' },
  { key: 'otherDocument', label: 'Other Document', fullWidth: true },
];

export default function TruckNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    number: '',
    type: '',
    vehicleLength: '',
    ownerType: 'own',
    ownerName: '',
    ownerPhone: '',
    driverName: '',
    driverPhone: '',

    rcExpiryDate: '',
    insuranceExpiryDate: '',
    permitExpiryDate: '',
    fitnessExpiryDate: '',
    pucExpiryDate: '',
    taxPaidTill: '',

    currentOdometer: '',
    lastServiceDate: '',
    nextServiceDueKm: '',
    tyreNumber: '',
    remarks: '',

    documents: {
      rcDocument: '',
      insuranceDocument: '',
      panCardDocument: '',
      fitnessDocument: '',
      permitDocument: '',
      taxDocument: '',
      otherDocument: '',
    },
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFileChange(docKey, e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(`File size of ${file.name} exceeds 5MB limit.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setForm((f) => ({
        ...f,
        documents: {
          ...f.documents,
          [docKey]: evt.target.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  }

  function removeDocument(docKey) {
    setForm((f) => ({
      ...f,
      documents: {
        ...f.documents,
        [docKey]: '',
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      await api.post('/trucks', form);
      navigate('/trucks');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Add Truck</h1>
            <Link
              to="/trucks"
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
            >
              &larr; Go Back
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2 text-sm shadow transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {busy ? 'Saving...' : 'SAVE'}
        </button>
      </div>

      <Alert error={error} />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-6">
        {/* Left Column - Details & Reminders */}
        <div className="lg:col-span-6 space-y-6">
          {/* Truck Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Truck Details
            </h2>

            <div>
              <input
                required
                type="text"
                placeholder="Truck Number*"
                value={form.number}
                onChange={(e) => update('number', e.target.value.toUpperCase())}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium uppercase tracking-wider"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  list="truck-types-list"
                  placeholder="Truck Type"
                  value={form.type}
                  onChange={(e) => update('type', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <datalist id="truck-types-list">
                  {TRUCK_TYPES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <select
                  value={form.vehicleLength}
                  onChange={(e) => update('vehicleLength', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Vehicle Length</option>
                  {VEHICLE_LENGTHS.map((vl) => (
                    <option key={vl} value={vl}>
                      {vl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ownership Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Ownership*
              </label>
              <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ownerType"
                    value="market"
                    checked={form.ownerType === 'market'}
                    onChange={(e) => update('ownerType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  Market Truck
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ownerType"
                    value="own"
                    checked={form.ownerType === 'own'}
                    onChange={(e) => update('ownerType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  My Truck
                </label>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Owner Name"
                  value={form.ownerName}
                  onChange={(e) => update('ownerName', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Owner Number"
                  value={form.ownerPhone}
                  onChange={(e) => update('ownerPhone', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Driver Name</label>
                <input
                  type="text"
                  placeholder="Driver Name"
                  value={form.driverName}
                  onChange={(e) => update('driverName', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Driver Phone</label>
                <input
                  type="text"
                  placeholder="Driver Phone"
                  value={form.driverPhone}
                  onChange={(e) => update('driverPhone', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Reminder Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Reminder
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">RC Expiry Date</label>
                <input
                  type="date"
                  value={form.rcExpiryDate}
                  onChange={(e) => update('rcExpiryDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Insurance Expiry Date</label>
                <input
                  type="date"
                  value={form.insuranceExpiryDate}
                  onChange={(e) => update('insuranceExpiryDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Permit Expiry Date</label>
                <input
                  type="date"
                  value={form.permitExpiryDate}
                  onChange={(e) => update('permitExpiryDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Fitness Expiry Date</label>
                <input
                  type="date"
                  value={form.fitnessExpiryDate}
                  onChange={(e) => update('fitnessExpiryDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">PUC Expiry Date</label>
                <input
                  type="date"
                  value={form.pucExpiryDate}
                  onChange={(e) => update('pucExpiryDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Tax Paid Till</label>
                <input
                  type="date"
                  value={form.taxPaidTill}
                  onChange={(e) => update('taxPaidTill', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Current Odometer Reading</label>
                <input
                  type="number"
                  placeholder="Current Odometer Reading"
                  value={form.currentOdometer}
                  onChange={(e) => update('currentOdometer', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Last Service Date</label>
                <input
                  type="date"
                  value={form.lastServiceDate}
                  onChange={(e) => update('lastServiceDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Next Service Due At KM</label>
                <input
                  type="number"
                  placeholder="Next Service Due At KM"
                  value={form.nextServiceDueKm}
                  onChange={(e) => update('nextServiceDueKm', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Tyre Number</label>
                <input
                  type="text"
                  placeholder="Tyre Number"
                  value={form.tyreNumber}
                  onChange={(e) => update('tyreNumber', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Remarks</label>
              <textarea
                rows={2}
                placeholder="Remarks"
                value={form.remarks}
                onChange={(e) => update('remarks', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Truck Documents */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Truck Documents
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOC_DEFINITIONS.map((doc) => {
                const docValue = form.documents[doc.key];
                const isPdf = docValue?.startsWith('data:application/pdf');

                return (
                  <div
                    key={doc.key}
                    className={`${
                      doc.fullWidth ? 'sm:col-span-2' : ''
                    } border-2 border-dashed border-purple-200 rounded-xl p-4 flex flex-col justify-between bg-slate-50/50 hover:bg-slate-50 transition relative group`}
                  >
                    <span className="text-xs font-semibold text-slate-700 mb-2">
                      {doc.label}
                    </span>

                    {docValue ? (
                      <div className="relative flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg text-center h-32">
                        {isPdf ? (
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-slate-600">PDF Document</span>
                          </div>
                        ) : (
                          <img
                            src={docValue}
                            alt={doc.label}
                            className="h-full max-h-24 object-contain rounded"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => removeDocument(doc.key)}
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded shadow hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-32 border border-dashed border-slate-300 rounded-lg hover:border-blue-400 bg-white transition">
                        <svg className="w-7 h-7 text-blue-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-xs text-slate-500 font-medium">Upload</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange(doc.key, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="lg:col-span-12 flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            to="/trucks"
            className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg text-sm transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg px-8 py-2.5 text-sm shadow transition"
          >
            {busy ? 'Saving...' : 'Save Truck'}
          </button>
        </div>
      </form>
    </div>
  );
}
