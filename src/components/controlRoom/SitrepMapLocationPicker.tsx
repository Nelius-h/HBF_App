import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  X,
  Crosshair,
  Satellite,
  Compass,
  Check,
  Search,
  Navigation,
  Layers,
  Map as MapIcon,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';
import { calculateHaversineDistanceKm } from '../../context/DataContext';

interface SitrepMapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocationName?: string;
  initialCoordinates?: { latitude: number; longitude: number };
  onSelectLocation: (result: {
    locationName: string;
    coordinates: { latitude: number; longitude: number };
  }) => void;
}

// Known Hartbeesfontein operational landmarks and sectors for fast snapping & proximity detection
const SECTOR_LANDMARKS = [
  { name: 'Hartbeesfontein Ops HQ', sector: 'Sektor 2', lat: -26.7635, lng: 26.4168, description: 'Ops Room & Town Hub' },
  { name: 'Brakspruit (R503)', sector: 'Sektor 1', lat: -26.7320, lng: 26.4680, description: 'R503 Arterial & Silos' },
  { name: 'Tigane / Geduld', sector: 'Sektor 3', lat: -26.7820, lng: 26.3980, description: 'Geduld & Western Sector' },
  { name: 'Dominionville (N12)', sector: 'Sektor 4', lat: -26.8340, lng: 26.3680, description: 'N12 Corridor & Rail Crossing' },
  { name: 'Wolwerand (N12)', sector: 'Sektor 4', lat: -26.8620, lng: 26.4350, description: 'N12 South Highway' },
  { name: 'Schoemansfontein (R503)', sector: 'Sektor 1', lat: -26.7620, lng: 26.4620, description: 'R503 East towards Klerksdorp' },
  { name: 'Syferlaagte', sector: 'Sektor 2', lat: -26.7150, lng: 26.3850, description: 'North-West Farming Zone' },
  { name: 'Palmietfontein (R30)', sector: 'Sektor 1', lat: -26.7450, lng: 26.4850, description: 'R30 Ventersdorp Junction' },
  { name: 'Leeuwfontein / Ottosdal Rd', sector: 'Sektor 3', lat: -26.7920, lng: 26.3520, description: 'West Farming Road' },
  { name: 'Tierfontein', sector: 'Sektor 2', lat: -26.7480, lng: 26.3720, description: 'North Agricultural Valleys' },
  { name: 'Klerksdorp Dam Area', sector: 'Sektor 1', lat: -26.7820, lng: 26.5410, description: 'South-East Border' },
];

export const SitrepMapLocationPicker: React.FC<SitrepMapLocationPickerProps> = ({
  isOpen,
  onClose,
  initialLocationName = '',
  initialCoordinates,
  onSelectLocation,
}) => {
  // Default start center is Hartbeesfontein Ops HQ
  const defaultLat = initialCoordinates?.latitude ?? -26.7635;
  const defaultLng = initialCoordinates?.longitude ?? 26.4168;

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultLat,
    lng: defaultLng,
  });

  const [customLocationText, setCustomLocationText] = useState(initialLocationName);
  const [mapType, setMapType] = useState<'hybrid' | 'satellite' | 'roadmap' | 'tactical'>('hybrid');
  const [nearestLandmark, setNearestLandmark] = useState<{
    name: string;
    sector: string;
    distanceKm: number;
    description: string;
  } | null>(null);
  const [manualInputLat, setManualInputLat] = useState(defaultLat.toFixed(5));
  const [manualInputLng, setManualInputLng] = useState(defaultLng.toFixed(5));
  const [isLocatingDevice, setIsLocatingDevice] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const baseTileLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Compute nearest landmark whenever coordinates change
  useEffect(() => {
    let closest = SECTOR_LANDMARKS[0];
    let minDistance = calculateHaversineDistanceKm(
      selectedCoords.lat,
      selectedCoords.lng,
      closest.lat,
      closest.lng
    );

    SECTOR_LANDMARKS.forEach((lm) => {
      const d = calculateHaversineDistanceKm(
        selectedCoords.lat,
        selectedCoords.lng,
        lm.lat,
        lm.lng
      );
      if (d < minDistance) {
        minDistance = d;
        closest = lm;
      }
    });

    setNearestLandmark({
      name: closest.name,
      sector: closest.sector,
      distanceKm: minDistance,
      description: closest.description,
    });

    setManualInputLat(selectedCoords.lat.toFixed(5));
    setManualInputLng(selectedCoords.lng.toFixed(5));
  }, [selectedCoords]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing instance if any
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const startLat = selectedCoords.lat;
    const startLng = selectedCoords.lng;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseGroup = L.layerGroup().addTo(map);
    baseTileLayerGroupRef.current = baseGroup;
    leafletMapRef.current = map;

    // Create high-visibility draggable tactical marker icon
    const createMarkerIcon = () =>
      L.divIcon({
        className: 'custom-sitrep-pin',
        html: `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing">
            <span class="absolute -top-1 w-12 h-12 rounded-full bg-red-500 animate-ping opacity-50 pointer-events-none"></span>
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white border-2 border-white shadow-2xl flex items-center justify-center font-black animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="w-2.5 h-2.5 bg-red-600 rotate-45 -mt-1.5 border-r border-b border-white shadow-md"></div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      });

    const marker = L.marker([startLat, startLng], {
      icon: createMarkerIcon(),
      draggable: true,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindTooltip('📍 Selected SITREP Location (Drag to adjust)', {
      permanent: false,
      direction: 'top',
      className: 'bg-slate-900 text-white font-bold text-xs px-2.5 py-1 rounded shadow-lg border border-red-500/50',
    });

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setSelectedCoords({ lat: pos.lat, lng: pos.lng });
    });

    markerRef.current = marker;

    // Click anywhere on map to reposition marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords({ lat, lng });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    });

    // Add visual sector landmark dots on map for guidance
    SECTOR_LANDMARKS.forEach((lm) => {
      const lmIcon = L.divIcon({
        className: 'custom-lm-dot',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
            <div class="w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-md"></div>
          </div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const lmMarker = L.marker([lm.lat, lm.lng], { icon: lmIcon }).addTo(map);
      lmMarker.bindTooltip(`${lm.name} (${lm.sector})`, {
        direction: 'top',
        className: 'bg-slate-900 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/40',
      });
      lmMarker.on('click', () => {
        setSelectedCoords({ lat: lm.lat, lng: lm.lng });
        if (markerRef.current) {
          markerRef.current.setLatLng([lm.lat, lm.lng]);
        }
        map.flyTo([lm.lat, lm.lng], 14, { duration: 0.6 });
      });
    });

    // Timeout to invalidate map size once DOM renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      leafletMapRef.current = null;
    };
  }, [isOpen]);

  // Handle tile switching
  useEffect(() => {
    if (!baseTileLayerGroupRef.current || !leafletMapRef.current) return;

    const baseGroup = baseTileLayerGroupRef.current;
    baseGroup.clearLayers();

    if (mapType === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Esri Satellite' }
      );
      baseGroup.addLayer(satLayer);
    } else if (mapType === 'hybrid') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      const refLayer = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      baseGroup.addLayer(satLayer);
      baseGroup.addLayer(refLayer);
    } else if (mapType === 'tactical') {
      const darkLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19, attribution: 'CartoDB Dark Matter' }
      );
      baseGroup.addLayer(darkLayer);
    } else {
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap',
      });
      baseGroup.addLayer(osmLayer);
    }
  }, [mapType, isOpen]);

  // Pan map and marker to specific coordinates
  const jumpToCoords = (lat: number, lng: number, zoom: number = 14) => {
    setSelectedCoords({ lat, lng });
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  };

  // Device GPS Location Hook
  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    setIsLocatingDevice(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingDevice(false);
        const { latitude, longitude } = pos.coords;
        jumpToCoords(latitude, longitude, 15);
      },
      (err) => {
        setIsLocatingDevice(false);
        console.warn('Geolocation error:', err.message);
        // Fallback to Ops HQ if denied
        jumpToCoords(-26.7635, 26.4168, 14);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Manual Coordinates Apply
  const handleApplyManualInput = () => {
    const lat = parseFloat(manualInputLat);
    const lng = parseFloat(manualInputLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      jumpToCoords(lat, lng, 14);
    }
  };

  // Auto-generate suggested location name based on nearest landmark and coordinates
  const getSuggestedLocationName = () => {
    if (!nearestLandmark) return `Hartbeesfontein Sector [${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)}]`;
    if (nearestLandmark.distanceKm < 0.3) {
      return `${nearestLandmark.name} (${nearestLandmark.sector})`;
    }
    return `${nearestLandmark.name} (${nearestLandmark.distanceKm} km away, ${nearestLandmark.sector})`;
  };

  const handleApplySelection = () => {
    const finalLocationName = customLocationText.trim()
      ? customLocationText.trim()
      : getSuggestedLocationName();

    onSelectLocation({
      locationName: finalLocationName,
      coordinates: {
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="sitrep-map-picker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col text-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Choose Incident Location on Map</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono uppercase">
                  SITREP GPS Pin
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Click anywhere on the map or drag the pin to set precise incident coordinates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Control Bar: Quick Sectors & Layer Switcher */}
        <div className="bg-slate-900/95 px-3 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
          {/* Quick Sector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              Sectors:
            </span>
            {SECTOR_LANDMARKS.slice(0, 7).map((lm) => (
              <button
                key={lm.name}
                type="button"
                onClick={() => jumpToCoords(lm.lat, lm.lng, 14)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-cyan-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium whitespace-nowrap transition flex-shrink-0"
              >
                {lm.name.replace('Hartbeesfontein ', '').replace(' Area', '')}
              </button>
            ))}
          </div>

          {/* Map Layer Mode Switcher & Device GPS */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setMapType('hybrid')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                  mapType === 'hybrid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hybrid
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                  mapType === 'satellite' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapType('tactical')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                  mapType === 'tactical' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Night
              </button>
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                  mapType === 'roadmap' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Street
              </button>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentGps}
              disabled={isLocatingDevice}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50"
              title="Locate my browser GPS coordinates"
            >
              <Navigation className={`w-3 h-3 ${isLocatingDevice ? 'animate-spin' : ''}`} />
              <span>{isLocatingDevice ? 'Locating...' : 'My GPS'}</span>
            </button>
          </div>
        </div>

        {/* Map Container Area */}
        <div className="relative flex-1 min-h-[340px] sm:min-h-[420px] bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '340px' }} />

          {/* Floating Instructions Pill */}
          <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] text-slate-200 shadow-xl flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>Click map or drag pin to position</span>
          </div>

          {/* Floating Live Coordinates HUD */}
          <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-xl text-xs text-white shadow-xl flex flex-col gap-1 max-w-[280px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live Pin:</span>
              <span className="font-mono text-emerald-400 font-bold text-[11px]">
                {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
              </span>
            </div>
            {nearestLandmark && (
              <div className="text-[10px] text-slate-300 flex items-center gap-1">
                <span className="text-cyan-400 font-bold">Near:</span>
                <span className="truncate">{nearestLandmark.name}</span>
                <span className="text-slate-400 font-mono">({nearestLandmark.distanceKm}km)</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Location Input & Action Confirmation */}
        <div className="bg-slate-850 p-3.5 sm:p-4 border-t border-slate-800 flex-shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Location Description Input */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-300">
                  Location Text (For SITREP Form & WhatsApp):
                </label>
                {nearestLandmark && (
                  <button
                    type="button"
                    onClick={() => setCustomLocationText(getSuggestedLocationName())}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Use Suggested: {nearestLandmark.name}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={customLocationText}
                onChange={(e) => setCustomLocationText(e.target.value)}
                placeholder={getSuggestedLocationName()}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-red-500 font-medium"
              />
            </div>

            {/* Manual Coordinates Editor */}
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Manual Coordinates (Lat, Lng):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={manualInputLat}
                  onChange={(e) => setManualInputLat(e.target.value)}
                  placeholder="Latitude"
                  className="w-1/2 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs font-mono outline-none"
                />
                <input
                  type="text"
                  value={manualInputLng}
                  onChange={(e) => setManualInputLng(e.target.value)}
                  placeholder="Longitude"
                  className="w-1/2 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyManualInput}
                  className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 text-xs font-bold"
                  title="Jump to manual coordinates"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplySelection}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location on Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
