import { useEffect, useState } from 'react';
import { api } from '../../api';
import LiveGpsMap from '../../components/LiveGpsMap.jsx';

// ─── Stage config ──────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'loading_in',    label: 'Loading In',     sub: 'Truck arriving at pickup',     icon: '📦' },
  { key: 'loading_out',   label: 'Loading Out',    sub: 'Goods loaded, departing',       icon: '🚛' },
  { key: 'in_transit',    label: 'In Transit',     sub: 'On the way to destination',     icon: '🛣️' },
  { key: 'unloading_in',  label: 'Unloading In',   sub: 'Arrived at destination',        icon: '📍' },
  { key: 'unloading_out', label: 'Unloading Out',  sub: 'Goods being unloaded',          icon: '⬇️' },
  { key: 'delivered',     label: 'Delivered',      sub: 'Shipment delivered & closed',   icon: '✅' },
];

const STAGE_ORDER = STAGES.map((s) => s.key);

// Sidebar items matching exact screenshot specification
const SIDEBAR_STAGES = [
  { key: 'all',           label: 'Active Tracking', sub: 'Trips needing stage updates', icon: '📡' },
  { key: 'loading_in',    label: 'Loading In',      sub: 'Pickup arrival pending',      icon: '📦' },
  { key: 'loading_out',   label: 'Loading Out',     sub: 'Pickup departure pending',    icon: '🚛' },
  { key: 'in_transit',    label: 'In Transit',      sub: 'Location update pending',      icon: '🛣️' },
  { key: 'unloading_in',  label: 'Unloading In',    sub: 'Destination arrival pending', icon: '📍' },
  { key: 'unloading_out', label: 'Unloading Out',   sub: 'Destination departure pending',icon: '⬇️' },
];

function stageBadge(status) {
  const map = {
    loading_in:    'bg-amber-100 text-amber-700 border-amber-200',
    loading_out:   'bg-orange-100 text-orange-700 border-orange-200',
    in_transit:    'bg-blue-100 text-blue-700 border-blue-200',
    unloading_in:  'bg-purple-100 text-purple-700 border-purple-200',
    unloading_out: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    delivered:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const label = STAGES.find((s) => s.key === status)?.label || status;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  );
}

// ─── Stage Update Modal ────────────────────────────────────────────────────────
function StageModal({ trip, onClose, onUpdated }) {
  const currentIdx = STAGE_ORDER.indexOf(trip.status);
  const nextStages = STAGES.slice(currentIdx + 1);

  const [stage,    setStage]    = useState(nextStages[0]?.key || '');
  const [location, setLocation] = useState('');
  const [remark,   setRemark]   = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/trips/${trip._id}/stage`, { stage, location, remark });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">Update Tracking Stage</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 text-sm">
          <span className="text-slate-500 font-medium">Trip: </span>
          <span className="font-semibold">{trip.bilty?.lrNumber || trip.tripId || trip._id.slice(-6)}</span>
          <span className="text-slate-400 mx-2">·</span>
          <span className="text-slate-500">{trip.fromCity} → {trip.toCity}</span>
        </div>

        {nextStages.length === 0 ? (
          <p className="text-emerald-600 font-semibold text-center py-4">✅ This trip is already delivered.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Next Stage *</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {nextStages.map((s) => (
                  <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Current Location / City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nagpur, Maharashtra"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Remark (optional)</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={2}
                placeholder="Any notes for this stage update..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50">
                {saving ? 'Updating…' : 'Update Stage'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Level 4: Live GPS Update Modal ───────────────────────────────────────────
function GpsModal({ trip, onClose, onUpdated }) {
  const [lat,          setLat]          = useState(trip.currentGps?.lat || '');
  const [lng,          setLng]          = useState(trip.currentGps?.lng || '');
  const [speed,        setSpeed]        = useState(trip.currentGps?.speed || 55);
  const [locationName, setLocationName] = useState(trip.currentGps?.locationName || '');
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  function detectDeviceGps() {
    if (!navigator.geolocation) {
      setError('Browser Geolocation is not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        if (pos.coords.speed) setSpeed(Math.round(pos.coords.speed * 3.6));
      },
      (err) => setError('Geolocation error: ' + err.message)
    );
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/trips/${trip._id}/gps`, { lat, lng, speed, locationName });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span>🛰️ Live GPS Telematics Update</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
        </div>

        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 text-xs">
          <span className="text-slate-600 font-medium">Vehicle: <b>{trip.truck?.number || 'Fleet'}</b></span>
          <button
            type="button"
            onClick={detectDeviceGps}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            📍 Use Current Device GPS
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude *</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="21.1458"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude *</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="79.0882"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Speed (km/h)</label>
            <input
              type="number"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              placeholder="55"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location Name / Toll Plaza</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. NH44 Nagpur Bypass Toll"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-50">
              {saving ? 'Updating…' : 'Push GPS Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────
function TripCard({ trip, onUpdateClick, onGpsClick }) {
  const currentIdx = STAGE_ORDER.indexOf(trip.status);
  const [showMap, setShowMap] = useState(false);

  function sendWhatsAppAlert() {
    const trackUrl = `${window.location.origin}/track/${trip.bilty?.lrNumber || ''}`;
    const text = `🚚 *Zipkart Shipment Update*\n\nLR Number: *${trip.bilty?.lrNumber || trip.tripId || 'N/A'}*\nStatus: *${STAGES.find(s => s.key === trip.status)?.label || trip.status}*\nTruck: ${trip.truck?.number || 'N/A'}\nRoute: ${trip.fromCity} ➔ ${trip.toCity}\n\nTrack Live GPS & Progress:\n👉 ${trackUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-800 text-base">
            {trip.bilty?.lrNumber ? (
              <span className="text-blue-700">LR# {trip.bilty.lrNumber}</span>
            ) : (
              <span className="text-slate-600">Trip #{(trip.tripId || trip._id.slice(-6)).toUpperCase()}</span>
            )}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {trip.truck?.number || '—'} &nbsp;·&nbsp; {trip.fromCity || '?'} → {trip.toCity || '?'}
          </p>
          {trip.driverName && (
            <p className="text-xs text-slate-400 mt-0.5">Driver: {trip.driverName}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {stageBadge(trip.status)}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onGpsClick(trip)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-semibold border border-slate-300 transition flex items-center gap-1"
            >
              <span>🛰️ GPS</span>
            </button>
            {trip.status !== 'delivered' && (
              <button
                onClick={() => onUpdateClick(trip)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition"
              >
                Update Stage →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center gap-0">
          {STAGES.map((s, i) => {
            const done    = i <= currentIdx;
            const active  = i === currentIdx;
            const isLast  = i === STAGES.length - 1;
            return (
              <div key={s.key} className="flex items-center flex-1 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all
                  ${active  ? 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-200' :
                    done    ? 'bg-emerald-500 border-emerald-500 text-white' :
                              'bg-white border-slate-300 text-slate-400'}`}>
                  {done && !active ? '✓' : i + 1}
                </div>
                {!isLast && (
                  <div className={`h-1 flex-1 mx-0.5 rounded-full ${i < currentIdx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex-1 text-center">
              <span className={`text-[9px] font-medium leading-tight block ${i <= currentIdx ? 'text-slate-600' : 'text-slate-400'}`}>
                {s.label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Map Toggle */}
      <div>
        <button
          onClick={() => setShowMap(!showMap)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>{showMap ? '🗺️ Hide Live GPS Map' : '🗺️ Show Live GPS Telematics Map'}</span>
        </button>
        {showMap && (
          <div className="mt-2">
            <LiveGpsMap
              fromCity={trip.fromCity}
              toCity={trip.toCity}
              currentGps={trip.currentGps}
              gpsPings={trip.gpsPings}
              truckNumber={trip.truck?.number}
            />
          </div>
        )}
      </div>

      {/* Last event */}
      {trip.trackingEvents?.length > 0 && (() => {
        const last = trip.trackingEvents[trip.trackingEvents.length - 1];
        return (
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Last update:</span>{' '}
            {last.location && <span>{last.location} · </span>}
            {last.remark   && <span>{last.remark} · </span>}
            <span>{new Date(last.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      })()}

      {/* WhatsApp Share & Link bar */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100 pt-2 flex-wrap">
        <button
          onClick={sendWhatsAppAlert}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          <span>💬 Send WhatsApp Alert</span>
        </button>
        {trip.bilty?.lrNumber && (
          <div className="flex items-center gap-1.5 ml-auto">
            <a
              href={`/track/${trip.bilty.lrNumber}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-mono truncate max-w-[140px]"
            >
              /track/{trip.bilty.lrNumber}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/track/${trip.bilty.lrNumber}`)}
              className="text-slate-400 hover:text-slate-700 text-xs border border-slate-200 rounded px-2 py-0.5"
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Tracking Page ────────────────────────────────────────────────────────
export default function Tracking() {
  const [trips,       setTrips]       = useState(null);
  const [activeStage, setActiveStage] = useState('all');
  const [search,      setSearch]      = useState('');
  const [error,       setError]       = useState('');
  const [modalTrip,   setModalTrip]   = useState(null);
  const [gpsTrip,     setGpsTrip]     = useState(null);

  function load() {
    const qs = activeStage !== 'all' ? `?stage=${activeStage}` : '';
    api.get(`/trips${qs}`)
      .then((d) => setTrips(d.trips))
      .catch((e) => setError(e.message));
  }

  useEffect(load, [activeStage]);

  const filtered = (trips || []).filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.bilty?.lrNumber?.toLowerCase().includes(q) ||
      t.fromCity?.toLowerCase().includes(q) ||
      t.toCity?.toLowerCase().includes(q) ||
      t.truck?.number?.toLowerCase().includes(q) ||
      t.driverName?.toLowerCase().includes(q) ||
      t.tripId?.toLowerCase().includes(q)
    );
  });

  const allTrips = trips || [];

  // Stage counts for badges
  const stageCounts = SIDEBAR_STAGES.reduce((acc, item) => {
    if (item.key === 'all') {
      acc[item.key] = allTrips.length;
    } else {
      acc[item.key] = allTrips.filter((t) => t.status === item.key).length;
    }
    return acc;
  }, {});

  const currentActiveItem = SIDEBAR_STAGES.find((s) => s.key === activeStage) || SIDEBAR_STAGES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📡 Shipment Tracking</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live status, stage progression, GPS map &amp; WhatsApp alerts</p>
        </div>
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search LR, truck, city…"
            className="pl-8 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

      {/* Two Column Layout: Left Sidebar Stages & Right Trips List */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tracking Stages Vertical Card List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-bold text-slate-700 text-sm px-1 uppercase tracking-wider">Tracking Stages</h3>
          <div className="space-y-2.5">
            {SIDEBAR_STAGES.map((item) => {
              const isSelected = activeStage === item.key;
              const count = stageCounts[item.key] || 0;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveStage(item.key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {item.sub}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Stage Details & Trips List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <span>{currentActiveItem.label}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                {filtered.length} trips
              </span>
            </h2>
          </div>

          {trips === null ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3 animate-spin">⚙️</div>
              <p>Loading live trips…</p>
            </div>
          ) : filtered.length === 0 ? (
            /* Exact TransportKhata style Empty State Box */
            <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-sky-100/80 flex items-center justify-center text-3xl text-sky-700">
                🛣️
              </div>
              <h3 className="text-xl font-bold text-sky-950">No Trips Found !</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onUpdateClick={setModalTrip}
                  onGpsClick={setGpsTrip}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stage Update Modal */}
      {modalTrip && (
        <StageModal
          trip={modalTrip}
          onClose={() => setModalTrip(null)}
          onUpdated={load}
        />
      )}

      {/* GPS Telematics Update Modal */}
      {gpsTrip && (
        <GpsModal
          trip={gpsTrip}
          onClose={() => setGpsTrip(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}
