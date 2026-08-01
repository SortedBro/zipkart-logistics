import { useEffect, useRef, useState } from 'react';

// City GPS Coordinates lookup for major Indian Logistics Hubs
const CITY_COORDS = {
  DELHI: [28.6139, 77.2090],
  MUMBAI: [19.0760, 72.8777],
  BENGALURU: [12.9716, 77.5946],
  BANGALORE: [12.9716, 77.5946],
  KOLKATA: [22.5726, 88.3639],
  CHENNAI: [13.0827, 80.2707],
  HYDERABAD: [17.3850, 78.4867],
  AHMEDABAD: [23.0225, 72.5714],
  PUNE: [18.5204, 73.8567],
  JAIPUR: [26.9124, 75.7873],
  NAGPUR: [21.1458, 79.0882],
  SURAT: [21.1702, 72.8311],
  LUCKNOW: [26.8467, 80.9462],
  INDORE: [22.7196, 75.8577],
  PATNA: [25.5941, 85.1376],
  RAIPUR: [21.2514, 81.6296],
  BHOPAL: [23.2599, 77.4126],
  CHANDIGARH: [30.7333, 76.7794],
  GUWAHATI: [26.1445, 91.7362],
  VISAKHAPATNAM: [17.6868, 83.2185],
  LUDHIANA: [30.9010, 75.8573],
  AGRA: [27.1767, 78.0081],
  VADODARA: [22.3072, 73.1812],
};

function getCityCoord(cityName, defaultCoord) {
  if (!cityName) return defaultCoord;
  const clean = cityName.trim().toUpperCase().split(/[\s,-]+/)[0];
  return CITY_COORDS[clean] || defaultCoord;
}

export default function LiveGpsMap({ fromCity, toCity, currentGps, gpsPings = [], truckNumber }) {
  const mapRef = useRef(null);
  const leafletInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Leaflet dynamically via CDN
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = window.L;
    if (!L) return;

    // Clean up previous map instance
    if (leafletInstanceRef.current) {
      leafletInstanceRef.current.remove();
      leafletInstanceRef.current = null;
    }

    // Determine coordinates
    const startCoord = getCityCoord(fromCity, [28.6139, 77.2090]); // Delhi fallback
    const endCoord   = getCityCoord(toCity,   [19.0760, 72.8777]); // Mumbai fallback

    let truckCoord = null;
    if (currentGps?.lat && currentGps?.lng) {
      truckCoord = [currentGps.lat, currentGps.lng];
    } else {
      // Interpolate mid-point if no live GPS yet
      truckCoord = [
        (startCoord[0] + endCoord[0]) / 2,
        (startCoord[1] + endCoord[1]) / 2,
      ];
    }

    // Initialize Map
    const map = L.map(mapRef.current, {
      center: truckCoord,
      zoom: 6,
      zoomControl: true,
    });
    leafletInstanceRef.current = map;

    // Dark styled tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Custom Icon helper
    const createMarkerIcon = (emoji, bgClass) => L.divIcon({
      html: `<div class="w-8 h-8 rounded-full ${bgClass} shadow-lg border-2 border-white flex items-center justify-center text-sm">${emoji}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Start & End City Markers
    L.marker(startCoord, { icon: createMarkerIcon('📍', 'bg-blue-600 text-white') })
      .addTo(map)
      .bindPopup(`<b>Origin:</b> ${fromCity || 'Start Hub'}`);

    L.marker(endCoord, { icon: createMarkerIcon('🏁', 'bg-emerald-600 text-white') })
      .addTo(map)
      .bindPopup(`<b>Destination:</b> ${toCity || 'End Hub'}`);

    // Live Truck Marker with pulse ring
    const truckIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-orange-400 opacity-75"></span>
          <div class="relative w-10 h-10 rounded-full bg-orange-500 text-white shadow-xl border-2 border-white flex items-center justify-center text-lg font-bold">
            🚛
          </div>
        </div>
      `,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const truckMarker = L.marker(truckCoord, { icon: truckIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px;">
          <b style="color: #ea580c;">🚛 ${truckNumber || 'Truck Fleet'}</b><br/>
          <b>Location:</b> ${currentGps?.locationName || 'In Transit'}<br/>
          <b>Speed:</b> ${currentGps?.speed || 0} km/h<br/>
          <small style="color: #64748b;">Updated: ${currentGps?.lastUpdated ? new Date(currentGps.lastUpdated).toLocaleTimeString() : 'Just now'}</small>
        </div>
      `);

    if (currentGps?.lat) {
      truckMarker.openPopup();
    }

    // Polyline Route
    const routePoints = [startCoord];
    if (gpsPings && gpsPings.length > 0) {
      gpsPings.forEach(p => {
        if (p.lat && p.lng) routePoints.push([p.lat, p.lng]);
      });
    } else if (truckCoord) {
      routePoints.push(truckCoord);
    }
    routePoints.push(endCoord);

    const polyline = L.polyline(routePoints, {
      color: '#f97316',
      weight: 4,
      dashArray: '8, 8',
      lineCap: 'round',
    }).addTo(map);

    // Fit bounds to fit route nicely
    const bounds = L.latLngBounds(routePoints);
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }
    };
  }, [mapLoaded, fromCity, toCity, currentGps, gpsPings, truckNumber]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-white text-sm font-semibold z-10">
          <span className="animate-spin mr-2">🧭</span> Loading GPS Map Engine…
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-0" />
      {currentGps?.lat && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow text-xs font-semibold text-slate-700 z-10 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE GPS: {currentGps.lat.toFixed(4)}, {currentGps.lng.toFixed(4)} ({currentGps.speed || 0} km/h)</span>
        </div>
      )}
    </div>
  );
}
