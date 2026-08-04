import { io } from 'socket.io-client';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API_URL}/api`;

const STAGES = [
  { key: 'loading_in',    label: 'Order Placed',      desc: 'Shipment registered & manifest generated' },
  { key: 'loading_out',   label: 'Picked Up',         desc: 'Loaded on truck at origin hub' },
  { key: 'in_transit',    label: 'On the Way',        desc: 'In transit via national highway route' },
  { key: 'unloading_in',  label: 'Arrived at Facility', desc: 'Arrived at destination hub' },
  { key: 'unloading_out', label: 'Out for Delivery',  desc: 'Dispatched for final unloading' },
  { key: 'delivered',     label: 'Delivered',         desc: 'Shipment delivered successfully' },
];
const STAGE_ORDER = STAGES.map((s) => s.key);

function fmtTime(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function TrackPublic() {
  const { lrNumber: urlLr } = useParams();
  const navigate = useNavigate();

  const [lr, setLr] = useState(urlLr || '');
  const [loading, setLoading] = useState(!!urlLr);
  const [error, setError] = useState('');
  const [shipment, setShipment] = useState(null);
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking' | 'order'
  const [copiedKey, setCopiedKey] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  const [isRealtime, setIsRealtime] = useState(false);

  useEffect(() => {
    if (!urlLr) return;
    fetchTracking(urlLr, true);

    // Setup Socket.IO connection
    const targetUrl = API_URL || window.location.origin;
    const socket = io(targetUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      setIsRealtime(true);
      socket.emit('join_room', urlLr.trim().toUpperCase());
    });

    socket.on('gps_update', (data) => {
      setShipment((prev) => prev ? { ...prev, currentGps: data.currentGps, gpsPings: data.gpsPings || prev.gpsPings } : prev);
      setSimMessage('🛰️ Live GPS Ping Received!');
      setTimeout(() => setSimMessage(''), 3000);
    });

    // Fallback polling interval every 6 seconds
    const interval = setInterval(() => {
      fetchTracking(urlLr, false);
    }, 6000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [urlLr]);

  const fetchTracking = async (lrNum, showSpinner = true) => {
    if (!lrNum?.trim()) return;
    if (showSpinner) setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/trips/public/track/${encodeURIComponent(lrNum.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tracking details not found for this LR number.');
      setShipment(data.shipment);
    } catch (err) {
      if (showSpinner) setError(err.message);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!lr.trim()) return;
    navigate(`/track/${lr.trim().toUpperCase()}`);
    fetchTracking(lr.trim());
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const simulateGpsPing = async () => {
    if (!shipment) return;
    setSimulating(true);
    setSimMessage('');
    const baseLat = shipment.currentGps?.lat || 21.1458;
    const baseLng = shipment.currentGps?.lng || 79.0882;
    const newLat = baseLat + (Math.random() - 0.5) * 0.04;
    const newLng = baseLng + (Math.random() - 0.5) * 0.04;
    const speed = Math.floor(50 + Math.random() * 20);

    try {
      const res = await fetch(`${BASE}/trips/public/gps-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lrNumber: shipment.lrNumber,
          lat: newLat,
          lng: newLng,
          speed,
          locationName: `Facility near ${shipment.toCity || 'Destination'} Highway`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimMessage(`🛰️ Live GPS update received! Speed: ${speed} km/h`);
        fetchTracking(shipment.lrNumber);
      }
    } catch (err) {
      setSimMessage('GPS update error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const currentIdx = shipment ? STAGE_ORDER.indexOf(shipment.status) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Top Security Banner */}
      <div className="bg-rose-100 text-rose-800 text-[11px] font-semibold py-1.5 px-4 text-center border-b border-rose-200">
        🔒 Never require OTP or credentials for address confirmation for your delivery
      </div>

      {/* Main Header / Brand Bar */}
      <header className="bg-black text-white py-3.5 px-6 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZipkartLogo className="h-8" variant="dark" showTagline={false} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-400">Zipkart B-TRANS</span>
          </div>
          <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-white/80 font-mono">Live Tracking</span>
        </div>
      </header>

      {/* Content Body */}
      <main className="max-w-md mx-auto w-full px-4 py-6 flex-1 space-y-5">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <input
            type="text"
            value={lr}
            onChange={(e) => setLr(e.target.value.toUpperCase())}
            placeholder="Enter LR / Bilty Number (e.g. LR2024001)"
            className="flex-1 px-3 py-2 text-sm font-semibold uppercase text-slate-800 placeholder-slate-400 border-none focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-black text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {loading ? '...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        {/* If no shipment searched yet */}
        {!shipment && !loading && !error && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <div className="text-4xl">🚚</div>
            <h3 className="font-extrabold text-slate-900 text-base">Enter Your LR Number</h3>
            <p className="text-xs text-slate-500">Track expected delivery date, real-time stage progress, and live vehicle location.</p>
          </div>
        )}

        {/* Shipment Results Card */}
        {shipment && (
          <div className="space-y-4">
            {/* Card 1: Expected Delivery Card (Matching User Screenshot) */}
            <div className="bg-white rounded-3xl p-5 border-2 border-rose-200/70 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expected Delivery Date</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {shipment.expectedDelivery || '31 Jul - 05 Aug'}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">AWB #</span>
                  <div className="flex items-center gap-1 font-bold text-slate-800 font-mono">
                    <span>{shipment.awbNumber || '20019610366391'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(shipment.awbNumber || '20019610366391', 'awb')}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Copy AWB"
                    >
                      {copiedKey === 'awb' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">LR Number</span>
                  <div className="flex items-center gap-1 font-bold text-amber-600 font-mono">
                    <span>#{shipment.lrNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(shipment.lrNumber, 'lr')}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Copy LR"
                    >
                      {copiedKey === 'lr' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Switcher (Matching User Screenshot) */}
            <div className="bg-slate-200/70 p-1 rounded-full flex text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setActiveTab('tracking')}
                className={`flex-1 py-2.5 rounded-full text-center transition ${
                  activeTab === 'tracking' ? 'bg-black text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tracking
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('order')}
                className={`flex-1 py-2.5 rounded-full text-center transition ${
                  activeTab === 'order' ? 'bg-black text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Order Details
              </button>
            </div>

            {/* Tab 1: Vertical Progress Timeline (Matching User Screenshot) */}
            {activeTab === 'tracking' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
                  {STAGES.map((s, idx) => {
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    const stageEvent = (shipment.trackingEvents || []).find(e => e.stage === s.key);
                    const timestamp = stageEvent ? fmtTime(stageEvent.timestamp) : '';

                    return (
                      <div key={s.key} className="relative">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 transition-all ${
                            isDone ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-extrabold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                              {s.label}
                            </h4>
                            {timestamp && (
                              <span className="text-[11px] text-slate-400 italic">| {timestamp}</span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${isCurrent ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                            {stageEvent?.remark || s.desc}
                          </p>
                          {stageEvent?.location && (
                            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                              📍 {stageEvent.location}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Map Toggle & GPS Telematics */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">🛰️ Live GPS Location</span>
                    <button
                      type="button"
                      onClick={simulateGpsPing}
                      disabled={simulating}
                      className="text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200 disabled:opacity-50"
                    >
                      {simulating ? 'Updating...' : 'Ping GPS'}
                    </button>
                  </div>
                  {simMessage && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
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
              </div>
            )}

            {/* Tab 2: Order Details */}
            {activeTab === 'order' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Shipment Specification</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold uppercase">Consignor (Sender)</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{shipment.consignor || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold uppercase">Consignee (Receiver)</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{shipment.consignee || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold uppercase">Route</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{shipment.fromCity} → {shipment.toCity}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold uppercase">Assigned Truck</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{shipment.truck || 'Unassigned'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold uppercase">Goods Description</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{shipment.material || 'General Freight'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold uppercase">Total Weight</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action CTA (Matching User Screenshot) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm text-center space-y-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Get Tracking Details</h4>
                <p className="text-xs text-slate-400 mt-0.5">Access complete tracking & manage shipment alerts</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const msg = `Hi, I am checking tracking for LR# ${shipment.lrNumber}. Please update me on delivery.`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full bg-black hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-full transition shadow-md"
              >
                Login with phone number / Support
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
        Zipkart Integrated Logistics · Enterprise Tracking System
      </footer>
    </div>
  );
}
