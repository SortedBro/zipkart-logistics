import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ZipkartLogo from '../../components/ZipkartLogo.jsx';
import LiveGpsMap from '../../components/LiveGpsMap.jsx';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API_URL}/api`;

// ─── Stage config ──────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'loading_in',    label: 'Loading In',     desc: 'Truck arrived at pickup point',    icon: '📦', color: 'amber'  },
  { key: 'loading_out',   label: 'Loading Out',    desc: 'Goods loaded, truck departed',      icon: '🚛', color: 'orange' },
  { key: 'in_transit',    label: 'In Transit',     desc: 'En route to destination',           icon: '🛣️', color: 'blue'   },
  { key: 'unloading_in',  label: 'Arrived',        desc: 'Truck arrived at destination',      icon: '📍', color: 'purple' },
  { key: 'unloading_out', label: 'Unloading',      desc: 'Goods being unloaded',              icon: '⬇️', color: 'indigo' },
  { key: 'delivered',     label: 'Delivered',      desc: 'Shipment successfully delivered',   icon: '✅', color: 'emerald'},
];
const STAGE_ORDER = STAGES.map((s) => s.key);

function fmt(isoDate) {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function TrackPublic() {
  const { lrNumber: urlLr } = useParams();
  const navigate = useNavigate();

  const [lr,          setLr]          = useState(urlLr || '');
  const [loading,     setLoading]     = useState(!!urlLr);
  const [error,       setError]       = useState('');
  const [shipment,    setShipment]    = useState(null);
  const [simulating, setSimulating]  = useState(false);
  const [simMessage,  setSimMessage]  = useState('');

  // Auto-fetch if lrNumber is in the URL
  useState(() => {
    if (urlLr) fetchTracking(urlLr);
  });

  async function fetchTracking(lrNum) {
    if (!lrNum?.trim()) return;
    setLoading(true);
    setError('');
    setShipment(null);
    try {
      const res  = await fetch(`${BASE}/trips/public/track/${encodeURIComponent(lrNum.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Not found');
      setShipment(data.shipment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!lr.trim()) return;
    navigate(`/track/${lr.trim().toUpperCase()}`);
    fetchTracking(lr.trim());
  }

  // Level 4: Live GPS Ping Simulator (For testing real-time movement)
  async function simulateGpsPing() {
    if (!shipment) return;
    setSimulating(true);
    setSimMessage('');

    // Generate slight random GPS delta near current or default route
    const baseLat = shipment.currentGps?.lat || 21.1458;
    const baseLng = shipment.currentGps?.lng || 79.0882;
    const newLat = baseLat + (Math.random() - 0.5) * 0.05;
    const newLng = baseLng + (Math.random() - 0.5) * 0.05;
    const speed  = Math.floor(45 + Math.random() * 25);

    try {
      const res = await fetch(`${BASE}/trips/public/gps-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lrNumber: shipment.lrNumber,
          lat: newLat,
          lng: newLng,
          speed,
          locationName: `${shipment.fromCity || 'Hub'} to ${shipment.toCity || 'Hub'} Highway Checkpoint`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimMessage(`🛰️ Live GPS update received! Speed: ${speed} km/h`);
        fetchTracking(shipment.lrNumber);
      }
    } catch (err) {
      setSimMessage('GPS ping simulation error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  }

  // Level 3: WhatsApp Share helper
  function shareWhatsApp() {
    if (!shipment) return;
    const trackUrl = `${window.location.origin}/track/${shipment.lrNumber}`;
    const text = `🚚 *Zipkart Live Tracking Update*\n\nLR Number: *${shipment.lrNumber}*\nStatus: *${STAGES.find(s => s.key === shipment.status)?.label || shipment.status}*\nRoute: ${shipment.fromCity} ➔ ${shipment.toCity}\n\nTrack Live GPS & Progress here:\n👉 ${trackUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  const currentIdx = shipment ? STAGE_ORDER.indexOf(shipment.status) : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Top bar */}
      <header className="border-b border-white/10 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <ZipkartLogo className="h-9" variant="dark" showTagline={false} />
          </a>
          <span className="text-xs text-white/50 font-semibold uppercase tracking-widest">Shipment Tracking</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Track Your Shipment</h1>
          <p className="text-slate-400 text-sm">Enter your LR Number / Bilty Number for real-time status & Live GPS</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={lr}
            onChange={(e) => setLr(e.target.value.toUpperCase())}
            placeholder="Enter LR Number e.g. LR2024001"
            className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg hover:shadow-orange-500/30 transition disabled:opacity-50"
          >
            {loading ? '…' : 'Track →'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-2xl px-5 py-4 text-red-300 text-sm flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-200">{error}</p>
              <p className="text-xs mt-1 text-red-300/70">Please check your LR number and try again, or contact your transporter.</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-white/50">
            <div className="text-4xl mb-2 animate-bounce">🔍</div>
            <p className="text-sm">Fetching shipment & GPS details…</p>
          </div>
        )}

        {/* Shipment Result */}
        {shipment && !loading && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease]">
            {/* Info Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-orange-400 font-mono font-bold text-lg">LR# {shipment.lrNumber}</p>
                  <p className="text-white/60 text-xs mt-0.5">{shipment.biltyDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Level 3: WhatsApp Share */}
                  <button
                    onClick={shareWhatsApp}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 transition flex items-center gap-1.5"
                  >
                    <span>💬 Share WhatsApp</span>
                  </button>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                    shipment.status === 'delivered'
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-blue-500/20 border-blue-400/40 text-blue-300'
                  }`}>
                    {STAGES.find(s => s.key === shipment.status)?.icon}{' '}
                    {STAGES.find(s => s.key === shipment.status)?.label || shipment.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {[
                  { label: 'From',       val: shipment.fromCity },
                  { label: 'To',         val: shipment.toCity },
                  { label: 'Truck',      val: shipment.truck },
                  { label: 'Consignor',  val: shipment.consignor },
                  { label: 'Consignee',  val: shipment.consignee },
                  { label: 'Material',   val: shipment.material },
                  { label: 'Weight',     val: shipment.weight ? `${shipment.weight} kg` : null },
                  { label: 'Quantity',   val: shipment.quantity },
                  { label: 'Driver',     val: shipment.driverName },
                ].filter(f => f.val).map(f => (
                  <div key={f.label} className="bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                    <p className="text-white/40 text-xs uppercase font-semibold">{f.label}</p>
                    <p className="text-white font-semibold mt-0.5 truncate">{f.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 4: Live GPS Map Section */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <span>🛰️ Live GPS Telematics Map</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">Real-time truck location & highway tracking</p>
                </div>
                {/* Level 4: GPS Simulator Trigger */}
                <button
                  onClick={simulateGpsPing}
                  disabled={simulating}
                  className="px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-semibold hover:bg-orange-500/30 transition disabled:opacity-50"
                >
                  {simulating ? 'Pinging…' : '📡 Simulate Driver GPS Ping'}
                </button>
              </div>

              {simMessage && (
                <div className="bg-orange-500/20 border border-orange-400/40 rounded-xl px-3.5 py-2 text-orange-200 text-xs font-semibold">
                  {simMessage}
                </div>
              )}

              <LiveGpsMap
                fromCity={shipment.fromCity}
                toCity={shipment.toCity}
                currentGps={shipment.currentGps}
                gpsPings={shipment.gpsPings}
                truckNumber={shipment.truck}
              />
            </div>

            {/* Timeline */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-white text-base">📍 Tracking Timeline</h2>

              {/* Progress Steps */}
              <div className="flex items-center gap-0 mb-6">
                {STAGES.map((s, i) => {
                  const done   = i <= currentIdx;
                  const active = i === currentIdx;
                  const isLast = i === STAGES.length - 1;
                  return (
                    <div key={s.key} className="flex items-center flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 transition-all
                        ${active ? 'bg-orange-500 border-orange-400 ring-2 ring-orange-400/40' :
                          done   ? 'bg-emerald-500 border-emerald-400' :
                                   'bg-white/10 border-white/20 text-white/30'}`}>
                        {done && !active ? '✓' : s.icon}
                      </div>
                      {!isLast && (
                        <div className={`h-1 flex-1 mx-0.5 rounded-full transition-all ${i < currentIdx ? 'bg-emerald-500' : 'bg-white/10'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Event Log */}
              {shipment.trackingEvents?.length > 0 ? (
                <div className="space-y-3">
                  {[...shipment.trackingEvents].reverse().map((ev, i) => {
                    const stageInfo = STAGES.find(s => s.key === ev.stage);
                    const isLatest  = i === 0;
                    return (
                      <div
                        key={ev._id || i}
                        className={`flex gap-3 p-3 rounded-xl border transition-all ${
                          isLatest
                            ? 'bg-orange-500/10 border-orange-400/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="text-xl shrink-0 mt-0.5">{stageInfo?.icon || '📌'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className={`font-semibold text-sm ${isLatest ? 'text-orange-300' : 'text-white/90'}`}>
                              {stageInfo?.label || ev.stage}
                              {isLatest && <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">Latest</span>}
                            </p>
                            <p className="text-xs text-white/40 font-mono shrink-0">{fmt(ev.timestamp)}</p>
                          </div>
                          {ev.location && <p className="text-xs text-white/60 mt-0.5">📍 {ev.location}</p>}
                          {ev.remark   && <p className="text-xs text-white/50 mt-0.5 italic">"{ev.remark}"</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/40 text-sm text-center py-4">No tracking updates yet.</p>
              )}
            </div>

            {/* Contact */}
            {shipment.company?.phone && (
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="text-white/50 text-xs uppercase font-semibold">Need Help?</p>
                  <p className="font-semibold text-white mt-0.5">{shipment.company.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={shareWhatsApp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition"
                  >
                    💬 WhatsApp
                  </button>
                  <a href={`tel:${shipment.company.phone}`}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition">
                    📞 Call
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-white/20 text-xs">
        Powered by Zipkart Logistics · Connecting India, Delivering Trust
      </footer>
    </div>
  );
}
