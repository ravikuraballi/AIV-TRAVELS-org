import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  RotateCcw, 
  Crosshair, 
  Loader2, 
  Compass, 
  Languages 
} from 'lucide-react';
import { 
  resolveCoordinates, 
  reverseGeocode, 
  calculateDistanceBetweenCoords,
  translateToKannada 
} from '../services/geocoding';

interface RouteMapProps {
  pickupLocation: string;
  dropLocation: string;
  estimatedKm?: number;
  estimatedHours?: number;
  trackingStatus?: string;
  driverName?: string;
  carRegistration?: string;
  interactiveSelect?: boolean;
  onSelectPickup?: (locationName: string) => void;
  onSelectDrop?: (locationName: string) => void;
  heightClass?: string;
}

// Generate smooth route waypoints with natural highway curvature
function generateRoutePoints(start: [number, number], end: [number, number]): [number, number][] {
  const points: [number, number][] = [];
  const steps = 18;
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;

  // Gentle arc depending on distance
  const dist = Math.sqrt(Math.pow(start[0] - end[0], 2) + Math.pow(start[1] - end[1], 2));
  const offset = Math.min(0.05, dist * 0.08);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier curve interpolation
    const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * (midLat + offset) + t * t * end[0];
    const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * (midLng - offset) + t * t * end[1];
    points.push([lat, lng]);
  }
  return points;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  pickupLocation,
  dropLocation,
  estimatedKm,
  estimatedHours,
  trackingStatus,
  driverName,
  carRegistration,
  interactiveSelect = false,
  onSelectPickup,
  onSelectDrop,
  heightClass = 'h-72 sm:h-80',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectMode, setSelectMode] = useState<'pickup' | 'drop'>('pickup');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  // Kannada map language mode - default true for Karnataka users!
  const [isKannada, setIsKannada] = useState<boolean>(true);

  const defaultCenter: [number, number] = [12.9716, 77.5946]; // Bengaluru
  const pickupCoords = resolveCoordinates(pickupLocation, [12.9784, 77.6408]);
  const dropCoords = resolveCoordinates(
    dropLocation, 
    pickupLocation.toLowerCase().includes('airport') ? [12.9716, 77.5946] : [13.1986, 77.7066]
  );

  const computedDistance = estimatedKm || calculateDistanceBetweenCoords(pickupCoords, dropCoords);
  const computedHours = estimatedHours || Math.max(1, Math.round(computedDistance / 35));

  // Kannada Display Strings
  const knPickup = translateToKannada(pickupLocation);
  const knDrop = translateToKannada(dropLocation);

  // Initialize Leaflet Map with 100% Free OpenStreetMap Tiles (No API key needed)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      // OpenStreetMap standard high-definition tiles - 100% reliable, zero API key required
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      routeLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map clicks in interactive mode
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setIsReverseGeocoding(true);
        try {
          const readableAddress = await reverseGeocode(lat, lng);
          if (selectMode === 'pickup' && onSelectPickup) {
            onSelectPickup(readableAddress);
          } else if (selectMode === 'drop' && onSelectDrop) {
            onSelectDrop(readableAddress);
          }
        } catch {
          const fallbackName = `Pinned Spot (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
          if (selectMode === 'pickup' && onSelectPickup) onSelectPickup(fallbackName);
          if (selectMode === 'drop' && onSelectDrop) onSelectDrop(fallbackName);
        } finally {
          setIsReverseGeocoding(false);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = routeLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const pickupLabel = isKannada ? (knPickup ? `ಪಿಕಪ್: ${knPickup.split(',')[0].slice(0, 18)}` : 'ಪಿಕಪ್ ಸ್ಥಳ') : `Pickup: ${pickupLocation ? pickupLocation.split(',')[0].slice(0, 18) : 'Origin'}`;
    const dropLabel = isKannada ? (knDrop ? `ಡ್ರಾಪ್: ${knDrop.split(',')[0].slice(0, 18)}` : 'ತಲುಪುವ ಸ್ಥಳ') : `Drop: ${dropLocation ? dropLocation.split(',')[0].slice(0, 18) : 'Destination'}`;

    // 1. Pickup Marker (Emerald)
    const pickupIcon = L.divIcon({
      className: 'custom-map-marker-pickup',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background:#0F172A; color:#10B981; border:2px solid #10B981; border-radius:8px; padding:4px 8px; font-size:11px; font-weight:700; white-space:nowrap; box-shadow:0 4px 6px -1px rgba(0,0,0,0.3); display:flex; align-items:center; gap:4px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10B981;"></span>
            <span>${pickupLabel}</span>
          </div>
          <div style="width:2px; height:8px; background:#10B981;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const pMarker = L.marker(pickupCoords, { icon: pickupIcon }).addTo(layer);
    pMarker.bindPopup(`<b>${isKannada ? 'ಪಿಕಪ್ ಸ್ಥಳ / Pickup Location' : 'Pickup Location'}</b><br/>${isKannada ? knPickup : (pickupLocation || 'Pickup Point')}`);

    // 2. Drop-off Marker (Amber)
    const dropIcon = L.divIcon({
      className: 'custom-map-marker-drop',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background:#0F172A; color:#F59E0B; border:2px solid #F59E0B; border-radius:8px; padding:4px 8px; font-size:11px; font-weight:700; white-space:nowrap; box-shadow:0 4px 6px -1px rgba(0,0,0,0.3); display:flex; align-items:center; gap:4px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#F59E0B;"></span>
            <span>${dropLabel}</span>
          </div>
          <div style="width:2px; height:8px; background:#F59E0B;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const dMarker = L.marker(dropCoords, { icon: dropIcon }).addTo(layer);
    dMarker.bindPopup(`<b>${isKannada ? 'ತಲುಪುವ ಸ್ಥಳ / Destination' : 'Destination'}</b><br/>${isKannada ? knDrop : (dropLocation || 'Destination')}`);

    // 3. Realistic Route Polyline
    const routePoints = generateRoutePoints(pickupCoords, dropCoords);
    
    // Road shadow casing
    L.polyline(routePoints, {
      color: '#0F172A',
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
    }).addTo(layer);

    // Active route highlight
    L.polyline(routePoints, {
      color: '#F59E0B',
      weight: 3.5,
      dashArray: trackingStatus === 'In Progress' ? '6, 8' : undefined,
      lineCap: 'round',
    }).addTo(layer);

    // 4. Vehicle Marker if tracking mode
    if (trackingStatus && trackingStatus !== 'Pending' && trackingStatus !== 'Cancelled') {
      const cabIdx = trackingStatus === 'In Progress' ? 10 : 4;
      const cabPos = routePoints[cabIdx] || routePoints[Math.floor(routePoints.length / 2)];

      const cabIcon = L.divIcon({
        className: 'custom-cab-marker',
        html: `
          <div style="background:#0F172A; color:#fff; border:2px solid #38BDF8; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(56,189,248,0.7); transform: translate(-50%, -50%);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.3V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
        `,
        iconSize: [0, 0],
      });

      const cabMarker = L.marker(cabPos, { icon: cabIcon }).addTo(layer);
      cabMarker.bindPopup(`
        <div style="font-size:12px; line-height:1.4;">
          <b>${isKannada ? 'ಚಾಲಕ' : 'Chauffeur'}:</b> ${driverName || 'Assigned Driver'}<br/>
          <b>${isKannada ? 'ವಾಹನ ಸಂಖ್ಯೆ' : 'Plate'}:</b> ${carRegistration || 'KA Commercial'}<br/>
          <b>${isKannada ? 'ಸ್ಥಿತಿ' : 'Status'}:</b> ${trackingStatus}
        </div>
      `);
    }

    // Fit map bounds with nice margins
    const bounds = L.latLngBounds([pickupCoords, dropCoords]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [pickupLocation, dropLocation, trackingStatus, driverName, carRegistration, isKannada, knPickup, knDrop]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([pickupCoords, dropCoords]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  };

  // Locate user GPS position and center map
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 14);
        }
        if (onSelectPickup) {
          const name = await reverseGeocode(latitude, longitude);
          onSelectPickup(name);
        }
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
      {/* Map Header Overlay Bar with Kannada / English Toggle */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-slate-700/80 pointer-events-auto flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">
            {isKannada ? 'ನೇರ ಮಾರ್ಗ:' : 'Live Route:'}
          </span>
          <span className="text-amber-300 font-mono font-bold">
            ~{computedDistance} {isKannada ? 'ಕಿ.ಮೀ' : 'km'}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300">
            ~{computedHours} {isKannada ? 'ಗಂಟೆ ಪ್ರಯಾಣ' : (computedHours === 1 ? 'hr drive' : 'hrs drive')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Kannada / English Toggle Button */}
          <button
            type="button"
            onClick={() => setIsKannada(!isKannada)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-xl shadow-md border border-amber-400 transition-colors flex items-center gap-1 text-[11px]"
            title="ಕನ್ನಡ / English ಭಾಷೆ ಬದಲಾಯಿಸಿ"
          >
            <Languages className="w-3.5 h-3.5 text-slate-950" />
            <span>{isKannada ? 'English' : 'ಕನ್ನಡ'}</span>
          </button>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 p-2 rounded-xl shadow-md border border-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
            title={isKannada ? 'ನನ್ನ ಸ್ಥಳ (GPS)' : 'Locate my position on map'}
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="hidden sm:inline">
              {isKannada ? 'ನನ್ನ ಸ್ಥಳ' : 'My Location'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            className="bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 p-2 rounded-xl shadow-md border border-slate-200 transition-colors"
            title={isKannada ? 'ಮರುಹೊಂದಿಸಿ' : 'Fit Route to Screen'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Pin-Selector Toggle if enabled */}
      {interactiveSelect && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
          <span className="px-1.5 text-slate-500">
            {isKannada ? 'ನಕ್ಷೆಯಲ್ಲಿ ಆಯ್ಕೆ:' : 'Tap map to pick:'}
          </span>
          <button
            type="button"
            onClick={() => setSelectMode('pickup')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              selectMode === 'pickup'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            <span>{isKannada ? 'ಪಿಕಪ್' : 'Pickup'}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectMode('drop')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              selectMode === 'drop'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            <span>{isKannada ? 'ಡ್ರಾಪ್' : 'Drop-off'}</span>
          </button>
          {isReverseGeocoding && (
            <span className="text-[10px] text-amber-600 flex items-center gap-1 pl-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{isKannada ? 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...' : 'Finding address...'}</span>
            </span>
          )}
        </div>
      )}

      {/* Map DOM viewport */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

      {/* Footer Info Strip */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
        <div className="flex items-center gap-2 truncate text-slate-300 max-w-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="truncate">{isKannada && knPickup ? knPickup : (pickupLocation || 'Pickup location')}</span>
          <span className="text-slate-500">➔</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="truncate">{isKannada && knDrop ? knDrop : (dropLocation || 'Drop-off destination')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0">
          <Compass className="w-3 h-3 text-emerald-400" />
          <span>{isKannada ? 'ಲೈವ್ ಓಪನ್‌ಸ್ಟ್ರೀಟ್‌ಮ್ಯಾಪ್ ನಕ್ಷೆ (ಕರ್ನಾಟಕ & ದಕ್ಷಿಣ ಭಾರತ)' : 'OpenStreetMap Live Real-Time Coordinates'}</span>
        </div>
      </div>
    </div>
  );
};
