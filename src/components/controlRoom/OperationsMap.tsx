import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Map as MapIcon,
  Layers,
  Users,
  Radio,
  Camera,
  Flame,
  Shield,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Crosshair,
  Navigation,
  Activity,
  Car,
  AlertTriangle,
  Sliders,
  Sparkles,
  Phone,
  MessageSquare,
  MessageCircle,
  X,
  Satellite,
  AlertOctagon,
  Clock,
  Zap,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  Video,
  Plane,
  Thermometer,
  Mic,
  MicOff,
  Volume2,
  RadioTower,
  Headphones,
} from 'lucide-react';
import L from 'leaflet';
import { useData, calculateHaversineDistanceKm } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { KmlMapLayer, EmergencyEvent } from '../../types';
import { convertRawLogsToSituationReports } from '../../data/actualIncidentLogData';
import { DispatchReactionForceWhatsAppModal } from './DispatchReactionForceWhatsAppModal';
import { ResponderWhatsAppModal } from './ResponderWhatsAppModal';
import { OperationsMapLayerEditorModal } from './OperationsMapLayerEditorModal';
import { DroneVideoFeedModal } from './drone/DroneVideoFeedModal';
import { LiveAudioConsole } from '../common/LiveAudioConsole';
import { droneTelemetryService, DroneTelemetryData } from '../../services/droneTelemetryService';
import { generateManualWhatsAppUrl } from '../../services/whatsappService';

interface OperationsMapProps {
  onClose?: () => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  hideSettingsTab?: boolean;
  isFullScreenMode?: boolean;
}

// Hartbeesfontein Operations HQ coordinates
const OPS_HQ = { lat: -26.7635, lng: 26.4168, name: 'Hartbeesfontein Ops Beheerkamer' };

// Sectors for quick navigation
const QUICK_SECTORS = [
  { name: 'Ops HQ', lat: -26.7635, lng: 26.4168, zoom: 14 },
  { name: 'Brakspruit', lat: -26.7320, lng: 26.4680, zoom: 13 },
  { name: 'Tigane', lat: -26.7820, lng: 26.3980, zoom: 13 },
  { name: 'Dominionville', lat: -26.8340, lng: 26.3680, zoom: 13 },
  { name: 'Wolwerand N12', lat: -26.8620, lng: 26.4350, zoom: 13 },
  { name: 'Schoemansfontein R503', lat: -26.7620, lng: 26.4620, zoom: 13 },
  { name: 'Syferlaagte', lat: -26.7150, lng: 26.3850, zoom: 13 },
  { name: 'Palmietfontein R30', lat: -26.7450, lng: 26.4850, zoom: 13 },
];

export const OperationsMap: React.FC<OperationsMapProps> = ({
  initialCenter = OPS_HQ,
  initialZoom = 13,
  onClose,
  hideSettingsTab = false,
  isFullScreenMode = false,
}) => {
  const {
    mapLayers,
    toggleMapLayerActive,
    addMapLayer,
    updateMapLayer,
    deleteMapLayer,
    emergencies,
    responders = [],
    activePatrolUnits = [],
    situationReports = []
  } = useData();
  const { allUsers, activeRole } = useAuth();

  const shouldHideSettings = hideSettingsTab || activeRole === 'REACTION_FORCE';

  // Layer Creation / Edit / Delete Modal State
  const [isLayerEditorOpen, setIsLayerEditorOpen] = useState(false);
  const [editingLayer, setEditingLayer] = useState<KmlMapLayer | null>(null);

  // Active emergencies (automatically excludes SAFE, FALSE_ALARM, CLOSED)
  const activeEmergencies = useMemo(() => {
    return emergencies.filter((e) => e.status !== 'SAFE' && e.status !== 'FALSE_ALARM' && (e.status as string) !== 'CLOSED');
  }, [emergencies]);

  // Real-time clock for dynamic perimeter and escape range animation
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Map view configuration
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [mapType, setMapType] = useState<'hybrid' | 'satellite' | 'roadmap' | 'tactical'>('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Layer visibility toggles
  const [showEmergencies, setShowEmergencies] = useState(true);
  const [showSuspectRadius, setShowSuspectRadius] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [showKmlLayers, setShowKmlLayers] = useState(true);
  const [showDrone, setShowDrone] = useState(true);

  // DJI Matrice Live Drone Telemetry & Video Feed State
  const [droneTelemetry, setDroneTelemetry] = useState<DroneTelemetryData>(droneTelemetryService.getTelemetry());
  const [isDroneVideoOpen, setIsDroneVideoOpen] = useState(false);
  const [isDronePip, setIsDronePip] = useState(false);

  useEffect(() => {
    const unsub = droneTelemetryService.subscribe((data) => {
      setDroneTelemetry(data);
    });
    return () => unsub();
  }, []);

  // Configurable Suspect Escape Speeds (in km/h)
  const [footSpeedKmH, setFootSpeedKmH] = useState<number>(() => {
    const saved = localStorage.getItem('ops_escape_foot_speed');
    return saved ? Math.max(1, Number(saved)) : 8;
  });
  const [vehicleSpeedKmH, setVehicleSpeedKmH] = useState<number>(() => {
    const saved = localStorage.getItem('ops_escape_vehicle_speed');
    return saved ? Math.max(5, Number(saved)) : 140;
  });
  const [isSpeedConfigOpen, setIsSpeedConfigOpen] = useState<boolean>(false);

  const updateFootSpeed = (val: number) => {
    const speed = Math.max(1, Math.min(60, val));
    setFootSpeedKmH(speed);
    localStorage.setItem('ops_escape_foot_speed', speed.toString());
  };

  const updateVehicleSpeed = (val: number) => {
    const speed = Math.max(5, Math.min(300, val));
    setVehicleSpeedKmH(speed);
    localStorage.setItem('ops_escape_vehicle_speed', speed.toString());
  };

  // Live timer tick to smoothly expand suspect escape circles in real time while an SOS is active
  useEffect(() => {
    if (activeEmergencies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1500);
    return () => clearInterval(interval);
  }, [activeEmergencies.length]);

  // Selected item modal/drawer
  const [selectedItem, setSelectedItem] = useState<{
    type: 'responder' | 'camera' | 'incident' | 'emergency' | 'layer' | 'drone';
    data: any;
  } | null>(null);

  // Reaction Force WhatsApp Modal on Map
  const [dispatchWhatsAppEmergency, setDispatchWhatsAppEmergency] = useState<EmergencyEvent | null>(null);

  // Live Audio Modal on Map
  const [activeAudioModalEmergency, setActiveAudioModalEmergency] = useState<EmergencyEvent | null>(null);

  // Direct Responder WhatsApp Dispatch Modal on Map
  const [activeWhatsAppResponder, setActiveWhatsAppResponder] = useState<any | null>(null);
  const [callNotice, setCallNotice] = useState<{ phone: string; name: string } | null>(null);

  // Sidebar tab
  const [activeSidebarTab, setActiveSidebarTab] = useState<'emergencies' | 'layers' | 'responders' | 'incidents' | 'cameras'>(() => {
    return activeEmergencies.length > 0 ? 'emergencies' : 'layers';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto switch to emergencies tab if a new emergency is active
  useEffect(() => {
    if (activeEmergencies.length > 0 && activeSidebarTab === 'layers') {
      setActiveSidebarTab('emergencies');
    }
  }, [activeEmergencies.length]);

  // Filter incident category
  const [selectedIncidentCategory, setSelectedIncidentCategory] = useState<string>('ALL');

  // Dynamic responders & active patrol units (real live units only)
  const activeRespondersList = useMemo(() => {
    // Only real active dynamic patrol units with live tracking enabled
    const liveDynamicUnits = activePatrolUnits
      .filter((u) => u.status !== 'OFF_DUTY' && u.latitude != null && u.longitude != null && !isNaN(u.latitude) && !isNaN(u.longitude))
      .map((u) => ({
        id: u.id,
        name: u.name,
        callsign: u.callsign,
        role: u.role,
        lat: u.latitude,
        lng: u.longitude,
        accuracy: u.accuracy || 15,
        speed: u.speed || '0 km/h',
        heading: u.heading || 0,
        status: u.status,
        battery: u.battery || '95%',
        vehicle: u.vehicle || 'Patrol Unit',
        radioChannel: u.radioChannel || 'CH 01 Ops Prime',
        lastUpdate: 'Just now',
        phone: u.phone || '082 000 0000',
        isLiveUserBeacon: true,
        trailHistory: u.trailHistory || [],
      }));

    return liveDynamicUnits;
  }, [activePatrolUnits]);

  // Operational Camera Mast Network
  const CAMERA_MASTS = useMemo(() => [
    { id: 'H2', name: 'H2 Geduld / Tigane', lat: -26.7690, lng: 26.4020, type: 'LPR & Overview', status: 'ONLINE', pings: '38ms', batt: '13.8V' },
    { id: 'H3', name: 'H3 Treinspoor / Stasie', lat: -26.7580, lng: 26.4150, type: 'Overview Dome', status: 'ONLINE', pings: '42ms', batt: '13.6V' },
    { id: 'H4', name: 'H4 Leeuwfontein Ottosdal', lat: -26.7920, lng: 26.3520, type: 'LPR Dual', status: 'ONLINE', pings: '55ms', batt: '13.9V' },
    { id: 'H6', name: 'H6 Dominionville N12', lat: -26.8410, lng: 26.3650, type: 'LPR Highway', status: 'ONLINE', pings: '49ms', batt: '14.1V' },
    { id: 'H11', name: 'H11 Geduld Leeufontein', lat: -26.7450, lng: 26.3920, type: 'LPR & PTZ', status: 'ONLINE', pings: '44ms', batt: '13.7V' },
    { id: 'H28', name: 'H28 Wolwerand N12', lat: -26.8620, lng: 26.4350, type: 'LPR & Overview', status: 'ONLINE', pings: '51ms', batt: '13.8V' },
    { id: 'H32', name: 'H32 Fred\'s Pub R503', lat: -26.7550, lng: 26.4710, type: 'LPR Arterial', status: 'ONLINE', pings: '39ms', batt: '13.5V' },
    { id: 'H37', name: 'H37 Opraap Brakspruit', lat: -26.7210, lng: 26.4790, type: 'Thermal & LPR', status: 'ONLINE', pings: '62ms', batt: '13.9V' },
    { id: 'H47', name: 'H47 Klerksdorp Dam', lat: -26.7820, lng: 26.5410, type: 'Overview & LPR', status: 'ONLINE', pings: '48ms', batt: '13.8V' },
    { id: 'H48', name: 'H48 Jakkalsfontein N12', lat: -26.8750, lng: 26.4890, type: 'LPR & Night IR', status: 'ONLINE', pings: '67ms', batt: '13.6V' },
    { id: 'PTZ-SYF', name: 'Syferlaagte Thermal PTZ', lat: -26.7150, lng: 26.3850, type: 'Long-Range Thermal', status: 'ONLINE', pings: '45ms', batt: '14.2V' },
    { id: 'PTZ-RHEN', name: 'Renosterhoek Thermal 360', lat: -26.8120, lng: 26.3550, type: 'Thermal AI Radar', status: 'ONLINE', pings: '41ms', batt: '14.0V' },
    { id: 'TWR-SEN', name: 'Sentech 1 & 2 Mast Hub', lat: -26.7510, lng: 26.4110, type: 'High-Site Repeater & PTZ', status: 'ONLINE', pings: '18ms', batt: '24.0V' },
  ], []);

  // Actual incident situation reports (combined live SITREPs + historic log entries)
  const incidentReports = useMemo(() => {
    const rawReports = convertRawLogsToSituationReports();
    // Prioritize live situation reports from state
    const liveIds = new Set(situationReports.map(s => s.id));
    const dedupedRaw = rawReports.filter(r => !liveIds.has(r.id));
    return [...situationReports, ...dedupedRaw];
  }, [situationReports]);

  const filteredIncidents = useMemo(() => {
    return incidentReports.filter(inc => {
      if (selectedIncidentCategory === 'ALL') return true;
      if (selectedIncidentCategory === 'STOCK_THEFT') return inc.category === 'stock_theft';
      if (selectedIncidentCategory === 'FIRE') return inc.category === 'fire';
      if (selectedIncidentCategory === 'SUSPICIOUS') return inc.category === 'suspicious_activity' || inc.category === 'suspicious_vehicle';
      if (selectedIncidentCategory === 'THEFT') return inc.category === 'theft';
      if (selectedIncidentCategory === 'MVA') return inc.category === 'road_incident';
      return true;
    });
  }, [incidentReports, selectedIncidentCategory]);

  // Leaflet map instance and container ref
  const mapElementRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const baseTileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapElementRef.current || leafletMapRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    // Add custom zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseGroup = L.layerGroup().addTo(map);
    const overlayGroup = L.layerGroup().addTo(map);

    baseTileLayerGroupRef.current = baseGroup;
    overlayLayerGroupRef.current = overlayGroup;
    leafletMapRef.current = map;

    // Track move/zoom events
    map.on('moveend', () => {
      const center = map.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
      setZoom(map.getZoom());
    });

    // Timeout to invalidate map size once DOM paints
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Attach ResizeObserver to keep viewport perfectly sized
    let resizeObserver: ResizeObserver | null = null;
    if (mapElementRef.current && typeof window.ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapElementRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Trigger invalidateSize whenever layout / sidebar / fullscreen toggles
  useEffect(() => {
    const t = setTimeout(() => {
      leafletMapRef.current?.invalidateSize();
    }, 120);
    return () => clearTimeout(t);
  }, [isSidebarOpen, isFullscreen, isFullScreenMode]);

  // Handle map type / tile layer switching (Satellite, Hybrid, Tactical, Roadmap)
  useEffect(() => {
    if (!baseTileLayerGroupRef.current || !leafletMapRef.current) return;

    const baseGroup = baseTileLayerGroupRef.current;
    baseGroup.clearLayers();

    if (mapType === 'satellite') {
      // High-resolution ESRI World Imagery
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri World Imagery'
        }
      );
      baseGroup.addLayer(satLayer);
    } else if (mapType === 'hybrid') {
      // ESRI Satellite with boundary and place names overlay
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
      // CartoDB Dark Matter for low-light night operations
      const darkLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution: 'CartoDB Dark Matter'
        }
      );
      baseGroup.addLayer(darkLayer);
    } else {
      // Standard Roadmap (OpenStreetMap)
      const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      baseGroup.addLayer(osmLayer);
    }
  }, [mapType]);

  // Render Overlays (Active Emergencies, Cameras, Responders, Incidents, Drone Perimeter, KMLs)
  useEffect(() => {
    if (!overlayLayerGroupRef.current || !leafletMapRef.current) return;
    const overlayGroup = overlayLayerGroupRef.current;
    overlayGroup.clearLayers();

    // 0. Active SOS Emergencies & 1-Minute Live GPS Trails
    if (showEmergencies) {
      activeEmergencies.forEach((emg) => {
        const lat = emg.location.latitude;
        const lng = emg.location.longitude;
        const history = emg.locationSession?.history || [];

        // Render breadcrumb movement trail polyline if multiple 1-min location updates exist
        if (history.length > 1) {
          const latLngs = history.map((pt) => [pt.latitude, pt.longitude] as [number, number]);
          const trailPolyline = L.polyline(latLngs, {
            color: '#ef4444',
            weight: 4,
            dashArray: '6, 6',
            opacity: 0.9,
          });
          trailPolyline.bindTooltip(`SOS Movement Trail: ${emg.clientName} (${history.length} Fixes @ 1-min intervals)`, { sticky: true });
          overlayGroup.addLayer(trailPolyline);

          // Small waypoint markers for historical 1-minute ticks
          history.slice(0, -1).forEach((pt, idx) => {
            const dotIcon = L.divIcon({
              className: 'custom-trail-dot',
              html: `
                <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                  <div class="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white shadow-md"></div>
                </div>
              `,
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            });
            const dotMarker = L.marker([pt.latitude, pt.longitude], { icon: dotIcon });
            const timeStr = new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            dotMarker.bindTooltip(`GPS Update #${idx + 1}: ${timeStr} (Acc: ${pt.accuracy || 10}m)`, { sticky: true });
            overlayGroup.addLayer(dotMarker);
          });
        }

        // Animated Radar Ping Circle around active SOS
        const radarCircle = L.circle([lat, lng], {
          radius: Math.max(100, (emg.location.accuracy || 20) * 2),
          color: '#ef4444',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.2,
        });
        overlayGroup.addLayer(radarCircle);

        // Dynamic Growing Suspect Escape Radius Circles (Configurable Foot & Vehicle speeds)
        // Automatically removed when SOS is resolved (filtered out of activeEmergencies)
        if (showSuspectRadius) {
          const startTs = emg.startTime ? new Date(emg.startTime).getTime() : Date.now() - 60000;
          const elapsedSeconds = Math.max(5, Math.floor((currentTime - startTs) / 1000));
          const elapsedMins = Math.floor(elapsedSeconds / 60);
          const elapsedSecs = elapsedSeconds % 60;
          const timeElapsedStr = `${elapsedMins}m ${elapsedSecs}s`;

          // Foot escape radius in meters ((footSpeedKmH * 1000) / 3600) * elapsedSeconds
          const footSpeedMps = (footSpeedKmH * 1000) / 3600;
          const footRadiusMeters = Math.max(40, elapsedSeconds * footSpeedMps);
          const footKm = (footRadiusMeters / 1000).toFixed(2);

          // Vehicle escape radius in meters ((vehicleSpeedKmH * 1000) / 3600) * elapsedSeconds
          const vehicleSpeedMps = (vehicleSpeedKmH * 1000) / 3600;
          const carRadiusMeters = Math.max(150, elapsedSeconds * vehicleSpeedMps);
          const carKm = (carRadiusMeters / 1000).toFixed(2);

          // 1. Vehicle Escape Envelope Circle - Indigo/Violet tactical ring
          const carEscapeCircle = L.circle([lat, lng], {
            radius: carRadiusMeters,
            color: '#6366f1',
            weight: 2.5,
            dashArray: '8, 8',
            fillColor: '#6366f1',
            fillOpacity: 0.07,
          });
          carEscapeCircle.bindTooltip(
            `<div class="p-1.5 font-sans min-w-[210px]">
              <div class="font-bold text-indigo-300 flex items-center justify-between">
                <span>🚗 Suspect Vehicle Escape Range</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">${vehicleSpeedKmH} km/h</span>
              </div>
              <div class="text-xs text-white font-mono mt-1">Radius: <b class="text-indigo-200">${carKm} km</b> (${Math.round(carRadiusMeters).toLocaleString()}m)</div>
              <div class="text-[10px] text-slate-300 mt-0.5">Elapsed: <b>${timeElapsedStr}</b> since SOS</div>
              <div class="text-[9px] text-indigo-400 mt-1 border-t border-indigo-500/20 pt-1 flex items-center justify-between">
                <span>Origin: ${emg.farmName || emg.clientName}</span>
                <span class="italic text-[8px]">Auto-clears on SOS resolve</span>
              </div>
            </div>`,
            { sticky: true, opacity: 0.95 }
          );
          overlayGroup.addLayer(carEscapeCircle);

          // 2. Foot Escape Envelope Circle - Amber/Orange tactical ring
          const footEscapeCircle = L.circle([lat, lng], {
            radius: footRadiusMeters,
            color: '#f59e0b',
            weight: 2.5,
            dashArray: '5, 5',
            fillColor: '#f59e0b',
            fillOpacity: 0.15,
          });
          footEscapeCircle.bindTooltip(
            `<div class="p-1.5 font-sans min-w-[210px]">
              <div class="font-bold text-amber-300 flex items-center justify-between">
                <span>🚶 Suspect Foot Escape Range</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">${footSpeedKmH} km/h</span>
              </div>
              <div class="text-xs text-white font-mono mt-1">Radius: <b class="text-amber-200">${footKm} km</b> (${Math.round(footRadiusMeters).toLocaleString()}m)</div>
              <div class="text-[10px] text-slate-300 mt-0.5">Elapsed: <b>${timeElapsedStr}</b> since SOS</div>
              <div class="text-[9px] text-amber-400 mt-1 border-t border-amber-500/20 pt-1 flex items-center justify-between">
                <span>Origin: ${emg.farmName || emg.clientName}</span>
                <span class="italic text-[8px]">Auto-clears on SOS resolve</span>
              </div>
            </div>`,
            { sticky: true, opacity: 0.95 }
          );
          overlayGroup.addLayer(footEscapeCircle);
        }

        // High-Visibility Pulsing SOS Emergency Pin with Live Audio & GPS Status
        const isMicActive = emg.audioSession?.status === 'ACTIVE';
        const micLevel = emg.audioSession?.audioLevel || (isMicActive ? 35 : 0);

        const sosIcon = L.divIcon({
          className: 'custom-sos-marker',
          html: `
            <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <!-- Pulsing Radar Glow -->
              <span class="absolute -top-2 w-16 h-16 rounded-full bg-red-600 animate-ping opacity-60 pointer-events-none"></span>
              
              <!-- Core Marker Box -->
              <div class="relative w-11 h-11 rounded-2xl bg-red-600 text-white border-2 border-white shadow-2xl flex items-center justify-center font-black ${isMicActive ? 'ring-4 ring-rose-400/80 animate-pulse' : 'animate-bounce'}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
                  <line x1="12" x2="12" y1="8" y2="12"/>
                  <line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
              </div>

              <!-- Live Microphone Indicator Badge if mic feed active -->
              ${isMicActive ? `
                <div class="mt-0.5 px-2 py-0.5 rounded-full bg-rose-600 border border-white text-[9px] font-black text-white shadow-xl flex items-center gap-1 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                  <span>MIC LIVE ${micLevel}%</span>
                </div>
              ` : ''}

              <!-- Label Badge -->
              <div class="mt-1 px-2.5 py-0.5 rounded-lg bg-red-950/95 border border-red-500 text-[10px] font-black text-red-200 shadow-xl whitespace-nowrap flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                <span>🚨 ${emg.farmName || emg.clientName}</span>
              </div>
            </div>
          `,
          iconSize: [48, isMicActive ? 72 : 54],
          iconAnchor: [24, isMicActive ? 36 : 27],
        });

        const marker = L.marker([lat, lng], { icon: sosIcon, zIndexOffset: 2000 });
        marker.bindTooltip(
          `<div class="p-2 font-sans min-w-[220px]">
            <div class="flex items-center justify-between gap-2 border-b border-red-500/40 pb-1">
              <span class="font-black text-red-300 text-xs">🚨 ${emg.emergencyType || emg.type} SOS</span>
              <span class="text-[9px] font-mono px-1.5 py-0.5 bg-red-950 text-red-200 rounded font-bold">${emg.status}</span>
            </div>
            <div class="mt-1 text-xs font-bold text-white">${emg.farmName || emg.clientName}</div>
            <div class="text-[11px] text-slate-300">${emg.clientName} • ${emg.clientPhone}</div>
            <div class="mt-1.5 p-1.5 rounded bg-slate-950/80 border border-slate-700 text-[10px] space-y-0.5 font-mono">
              <div class="text-cyan-300">📍 ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}</div>
              <div class="text-emerald-400">Akkuraatheid: ±${emg.location.accuracy || 10}m (${emg.location.quality || 'GPS'})</div>
              <div class="${isMicActive ? 'text-red-400 font-bold' : 'text-slate-400'}">
                🎤 Mic Toevoer: ${isMicActive ? `AKTIEF (${micLevel}%)` : 'Gereed'}
              </div>
              <div class="text-slate-400">📡 Spoor: ${history.length || 1} GPS regstellings</div>
            </div>
            <div class="mt-1 text-[9px] text-cyan-400 font-semibold text-center">Klik om oudiokonsole & beheer oop te maak</div>
          </div>`,
          { sticky: true, opacity: 0.95 }
        );
        marker.on('click', () => {
          setSelectedItem({ type: 'emergency', data: emg });
        });
        overlayGroup.addLayer(marker);
      });
    }

    // 1. Responders & Active Patrol Beacons
    if (showResponders) {
      activeRespondersList.forEach((resp) => {
        // Draw GPS trail history if available
        if (resp.trailHistory && resp.trailHistory.length > 1) {
          const latLngs = resp.trailHistory.map(p => [p.latitude, p.longitude] as [number, number]);
          const trailLine = L.polyline(latLngs, {
            color: '#10b981',
            weight: 3,
            opacity: 0.6,
            dashArray: '4, 6',
          });
          overlayGroup.addLayer(trailLine);
        }

        const respIcon = L.divIcon({
          className: 'custom-resp-marker',
          html: `
            <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <div class="absolute -top-1 -left-1 w-10 h-10 rounded-full bg-emerald-500/30 animate-ping pointer-events-none"></div>
              <div class="relative p-2 rounded-full bg-emerald-500 text-slate-950 border-2 border-white shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
              </div>
              <div class="mt-1 px-2 py-0.5 rounded-md bg-slate-950/95 border border-emerald-400/80 text-[10px] font-black text-emerald-300 shadow-2xl whitespace-nowrap flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>${resp.callsign}</span>
                <span class="text-[9px] text-slate-400 font-mono">(${resp.speed || '0 km/h'})</span>
              </div>
            </div>
          `,
          iconSize: [36, 44],
          iconAnchor: [18, 22]
        });

        const marker = L.marker([resp.lat, resp.lng], { icon: respIcon });
        marker.on('click', () => {
          setSelectedItem({ type: 'responder', data: resp });
        });
        overlayGroup.addLayer(marker);
      });
    }

    // 2. Active KML Layers & Geometries
    if (showKmlLayers) {
      mapLayers.filter(l => l.isActive).forEach((layer, idx) => {
        const color = layer.colorHex || layer.color || ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'][idx % 6];
        const strokeW = layer.strokeWidth || 3;
        const opacityVal = layer.opacity ?? 0.8;
        
        if (layer.features && layer.features.length > 0) {
          layer.features.forEach((feat) => {
            if (feat.featureType === 'Polygon' && Array.isArray(feat.coordinates)) {
              const latLngs = (feat.coordinates as any[]).map(c => [c[0], c[1]] as [number, number]);
              const polygon = L.polygon(latLngs, {
                color: color,
                weight: strokeW,
                fillColor: color,
                fillOpacity: opacityVal * 0.25
              });
              polygon.bindTooltip(`<b>${layer.name}</b><br/>${feat.name}`, { sticky: true });
              polygon.on('click', () => setSelectedItem({ type: 'layer', data: layer }));
              overlayGroup.addLayer(polygon);
            } else if (feat.featureType === 'LineString' && Array.isArray(feat.coordinates)) {
              const latLngs = (feat.coordinates as any[]).map(c => [c[0], c[1]] as [number, number]);
              const polyline = L.polyline(latLngs, {
                color: color,
                weight: strokeW,
                opacity: opacityVal
              });
              polyline.bindTooltip(`<b>${layer.name}</b><br/>${feat.name}`, { sticky: true });
              polyline.on('click', () => setSelectedItem({ type: 'layer', data: layer }));
              overlayGroup.addLayer(polyline);
            } else if (feat.featureType === 'Point' && Array.isArray(feat.coordinates)) {
              const coords = typeof feat.coordinates[0] === 'number' ? (feat.coordinates as [number, number]) : (feat.coordinates[0] as [number, number]);
              if (coords && coords.length >= 2) {
                const marker = L.circleMarker([coords[0], coords[1]], {
                  radius: 7,
                  color: color,
                  weight: 2,
                  fillColor: color,
                  fillOpacity: opacityVal
                });
                marker.bindTooltip(`<b>${layer.name}:</b> ${feat.name}${feat.description ? `<br/><span class="text-xs text-slate-300">${feat.description}</span>` : ''}`, { direction: 'top', offset: [0, -6] });
                marker.on('click', () => setSelectedItem({ type: 'layer', data: layer }));
                overlayGroup.addLayer(marker);
              }
            }
          });
        }
      });
    }

    // 3. DJI Matrice T4 Live GPS Location & Tactical Overlays (Appears only when drone is online with valid GPS)
    if (showDrone && droneTelemetry.isOnline && droneTelemetry.flightState !== 'OFFLINE' && droneTelemetry.position.latitude !== 0 && droneTelemetry.position.longitude !== 0) {
      const droneLat = droneTelemetry.position.latitude;
      const droneLng = droneTelemetry.position.longitude;
      const droneHeading = droneTelemetry.position.heading || 0;
      const droneAgl = droneTelemetry.position.heightAglMeters;
      const battPct = droneTelemetry.battery.percentage.toFixed(0);
      const isLowBatt = droneTelemetry.battery.percentage < 25;

      // 3A. Flight Breadcrumb Track Trail
      if (droneTelemetry.flightLog?.breadcrumbs && droneTelemetry.flightLog.breadcrumbs.length > 1) {
        const trailCoords: [number, number][] = droneTelemetry.flightLog.breadcrumbs.map((b) => [b.latitude, b.longitude]);
        trailCoords.push([droneLat, droneLng]);
        const trailPolyline = L.polyline(trailCoords, {
          color: '#06b6d4',
          weight: 2.5,
          dashArray: '4, 6',
          opacity: 0.65,
        });
        overlayGroup.addLayer(trailPolyline);
      }

      // 3B. Camera FOV / Optical-Thermal View Cone on Ground
      const fovAngle = (droneTelemetry.gimbal?.fovAngleDeg || 38) * (Math.PI / 180);
      const gimbalYawRad = ((droneTelemetry.gimbal?.yaw || droneHeading) * Math.PI) / 180;
      const coneDistMeters = 380; // ground footprint reach
      
      const leftAngle = gimbalYawRad - fovAngle / 2;
      const rightAngle = gimbalYawRad + fovAngle / 2;
      
      const leftLat = droneLat + (coneDistMeters * Math.cos(leftAngle)) / 111000;
      const leftLng = droneLng + (coneDistMeters * Math.sin(leftAngle)) / (111000 * Math.cos((droneLat * Math.PI) / 180));
      const rightLat = droneLat + (coneDistMeters * Math.cos(rightAngle)) / 111000;
      const rightLng = droneLng + (coneDistMeters * Math.sin(rightAngle)) / (111000 * Math.cos((droneLat * Math.PI) / 180));

      const fovPolygon = L.polygon([[droneLat, droneLng], [leftLat, leftLng], [rightLat, rightLng]], {
        color: '#06b6d4',
        weight: 1.5,
        fillColor: '#06b6d4',
        fillOpacity: 0.12,
        dashArray: '3, 3',
      });
      fovPolygon.bindTooltip('<b>DJI Matrice T4 FLIR Kamera Sigveld</b>', { sticky: true });
      overlayGroup.addLayer(fovPolygon);

      // 3C. Laser Rangefinder (LRF) PinPoint / Target Crosshair Marker
      if (droneTelemetry.laserRangefinder?.active && droneTelemetry.laserRangefinder?.targetCoords) {
        const tLat = droneTelemetry.laserRangefinder.targetCoords.latitude;
        const tLng = droneTelemetry.laserRangefinder.targetCoords.longitude;
        const spotTemp = droneTelemetry.gimbal.thermalSpotTempC;
        const targetDist = droneTelemetry.laserRangefinder.targetDistanceMeters || 380;

        const targetIcon = L.divIcon({
          className: 'custom-lrf-target-marker',
          html: `
            <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <div class="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center animate-ping absolute inset-0 opacity-40 bg-red-500/20"></div>
              <div class="w-7 h-7 rounded-full bg-red-950/90 border-2 border-red-400 text-red-300 shadow-2xl flex items-center justify-center z-10 transition-transform group-hover:scale-125">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
              </div>
              <div class="mt-1 px-2 py-0.5 rounded-lg bg-red-950/95 border border-red-500 text-[10px] font-black text-red-200 shadow-xl whitespace-nowrap z-10 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>🎯 LRF Teiken (${targetDist}m • ${spotTemp.toFixed(1)}°C)</span>
              </div>
            </div>
          `,
          iconSize: [40, 50],
          iconAnchor: [20, 25],
        });

        const targetMarker = L.marker([tLat, tLng], { icon: targetIcon, zIndexOffset: 2500 });
        targetMarker.on('click', () => {
          setIsDroneVideoOpen(true);
        });
        overlayGroup.addLayer(targetMarker);
      }

      // 3D. Live DJI Matrice Drone Quadcopter Aircraft Marker
      const droneIcon = L.divIcon({
        className: 'custom-dji-drone-marker',
        html: `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
            <!-- Pulsing Active Range Ring -->
            <div class="w-12 h-12 rounded-full border border-cyan-400/60 bg-cyan-500/10 animate-ping absolute inset-0 -m-1"></div>
            
            <!-- Drone Vehicle Body & Rotating Heading -->
            <div class="relative w-10 h-10 rounded-2xl bg-slate-950 border-2 border-cyan-400 text-cyan-300 shadow-2xl flex items-center justify-center transition-transform hover:scale-125 z-10">
              <div style="transform: rotate(${droneHeading}deg); transition: transform 0.8s ease-out;" class="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17"/>
                  <circle cx="12" cy="12" r="3" fill="#06b6d4"/>
                </svg>
              </div>
              <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full ${isLowBatt ? 'bg-rose-500' : 'bg-emerald-400'} border-2 border-slate-950 animate-pulse"></span>
            </div>

            <!-- Live Telemetry Tag -->
            <div class="mt-1 px-2.5 py-0.5 rounded-lg bg-slate-950/95 border border-cyan-500/80 text-[10px] font-black text-cyan-200 shadow-2xl whitespace-nowrap flex items-center gap-1.5 z-10 backdrop-blur-sm">
              <span class="text-white">🚁 Matrice T4</span>
              <span class="text-slate-400">•</span>
              <span class="text-emerald-400">${droneAgl}m</span>
              <span class="text-slate-400">•</span>
              <span class="${isLowBatt ? 'text-rose-400' : 'text-amber-300'} font-mono">${battPct}%</span>
            </div>
          </div>
        `,
        iconSize: [48, 60],
        iconAnchor: [24, 30],
      });

      const droneMarker = L.marker([droneLat, droneLng], { icon: droneIcon, zIndexOffset: 3000 });
      droneMarker.on('click', () => {
        setSelectedItem({ type: 'drone', data: droneTelemetry });
      });
      overlayGroup.addLayer(droneMarker);
    }
  }, [
    showEmergencies,
    showSuspectRadius,
    activeEmergencies,
    currentTime,
    footSpeedKmH,
    vehicleSpeedKmH,
    showResponders,
    showKmlLayers,
    showDrone,
    droneTelemetry,
    mapLayers,
    activeRespondersList,
  ]);

  // Pan to center when changed
  const panTo = (lat: number, lng: number, zoomLevel?: number) => {
    setMapCenter({ lat, lng });
    if (zoomLevel) setZoom(zoomLevel);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoomLevel || leafletMapRef.current.getZoom(), { duration: 1.2 });
    }
  };

  // Helper to focus on layer geometry
  const focusOnLayer = (layer: KmlMapLayer) => {
    if (!layer.features || layer.features.length === 0) return;
    const firstFeat = layer.features[0];
    if (Array.isArray(firstFeat.coordinates)) {
      if (typeof firstFeat.coordinates[0] === 'number') {
        panTo(firstFeat.coordinates[0] as number, firstFeat.coordinates[1] as number, 15);
      } else if (Array.isArray(firstFeat.coordinates[0])) {
        const firstCoord = firstFeat.coordinates[0] as [number, number];
        panTo(firstCoord[0], firstCoord[1], 14);
      }
    }
  };

  // Handle Layer Save from Modal (Create or Edit)
  const handleSaveLayer = async (layerData: Omit<KmlMapLayer, 'id' | 'uploadedAt' | 'uploadedByUid' | 'uploadedByName'> & { id?: string }) => {
    if (layerData.id) {
      updateMapLayer(layerData.id, layerData);
      if (selectedItem?.type === 'layer' && selectedItem.data.id === layerData.id) {
        setSelectedItem({ type: 'layer', data: { ...selectedItem.data, ...layerData } });
      }
    } else {
      const newId = await addMapLayer(layerData);
      const createdLayer = { ...layerData, id: newId, isActive: true };
      focusOnLayer(createdLayer as KmlMapLayer);
    }
  };

  // Handle Layer Delete
  const handleDeleteLayer = (layerId: string) => {
    deleteMapLayer(layerId);
    if (selectedItem?.type === 'layer' && selectedItem.data.id === layerId) {
      setSelectedItem(null);
    }
  };

  return (
    <div className={`relative flex flex-col w-full bg-slate-950 text-slate-100 overflow-hidden border-slate-800 shadow-2xl ${isFullScreenMode || isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen border-0' : 'h-[750px] rounded-2xl border'}`}>
      {/* Tactical Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer shadow-sm"
              title="Sluit Operasionele Kaart"
            >
              <X className="w-4 h-4 text-slate-300" />
              <span>Sluit Kaart</span>
            </button>
          )}

          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-wide text-white uppercase">Operations Map (Tactical GIS)</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Satellite Live
              </span>
            </div>
            <p className="text-xs text-slate-400">Hartbeesfontein Control Room • High-Res Satellite & Tactical Layers</p>
          </div>
        </div>

        {/* Quick Sector Nav Buttons */}
        <div className="hidden xl:flex items-center gap-1.5 overflow-x-auto py-1 max-w-xl">
          {QUICK_SECTORS.map((sec) => (
            <button
              key={sec.name}
              onClick={() => panTo(sec.lat, sec.lng, sec.zoom)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition whitespace-nowrap"
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* Map View & Tool Controls */}
        <div className="flex items-center gap-2">
          {/* Map Layer Mode - Real Satellite Switching */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700">
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${mapType === 'satellite' ? 'bg-cyan-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${mapType === 'hybrid' ? 'bg-cyan-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setMapType('tactical')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${mapType === 'tactical' ? 'bg-cyan-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Tactical Dark
            </button>
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${mapType === 'roadmap' ? 'bg-cyan-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Roads
            </button>
          </div>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border transition ${isSidebarOpen ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
            title="Toggle Sidebar Control Panel"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Reset Center */}
          <button
            onClick={() => panTo(OPS_HQ.lat, OPS_HQ.lng, 13)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
            title="Center on Ops HQ"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          {!isFullScreenMode && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Map & Sidebar Layout */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Map Viewport Area */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden select-none">
          {/* Leaflet Map DOM Container */}
          <div ref={mapElementRef} className="w-full h-full z-0" />

          {/* Map Layer Legend / Quick Filter Bar Overlay */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl max-w-3xl">
            <button
              onClick={() => setShowEmergencies(!showEmergencies)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${showEmergencies ? 'bg-red-600/30 text-red-300 border border-red-500/60 shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
              <AlertOctagon className={`w-3.5 h-3.5 ${activeEmergencies.length > 0 ? 'text-red-400 animate-bounce' : ''}`} />
              <span>SOS Emergencies ({activeEmergencies.length})</span>
            </button>

            <div className="relative flex items-center">
              <button
                onClick={() => setShowSuspectRadius(!showSuspectRadius)}
                className={`px-2.5 py-1 ${shouldHideSettings ? 'rounded-xl' : 'rounded-l-xl'} text-xs font-semibold flex items-center gap-1.5 transition ${
                  showSuspectRadius && activeEmergencies.length > 0
                    ? 'bg-amber-500/25 text-amber-300 border border-r-0 border-amber-500/60 shadow-lg'
                    : showSuspectRadius
                    ? 'bg-slate-800/90 text-amber-300 border border-r-0 border-slate-700'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-r-0 border-slate-700'
                }`}
                title={`Toggle Live Suspect Escape Range (${footSpeedKmH} km/h Foot & ${vehicleSpeedKmH} km/h Vehicle)`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Escape Radius ({footSpeedKmH} & {vehicleSpeedKmH} km/h)</span>
                {activeEmergencies.length > 0 && showSuspectRadius && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              {!shouldHideSettings && (
                <button
                  onClick={() => setIsSpeedConfigOpen(!isSpeedConfigOpen)}
                  className={`px-2 py-1 rounded-r-xl text-xs font-semibold transition border border-l-0 ${
                    isSpeedConfigOpen
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : showSuspectRadius
                      ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Edit Suspect Escape Speeds (Foot & Vehicle)"
                >
                  <Sliders className="w-3 h-3" />
                </button>
              )}

              {/* Escape Speed Configuration Popover */}
              {!shouldHideSettings && isSpeedConfigOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-slate-900/98 backdrop-blur-md rounded-xl border border-amber-500/50 shadow-2xl p-3 text-xs space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      Suspect Escape Speeds
                    </span>
                    <button
                      onClick={() => setIsSpeedConfigOpen(false)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Foot Speed Controls */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-200 font-medium flex items-center gap-1">
                        🚶 Foot Escape Speed:
                      </span>
                      <span className="font-mono font-bold text-white bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        {footSpeedKmH} km/h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="2"
                        max="30"
                        step="1"
                        value={footSpeedKmH}
                        onChange={(e) => updateFootSpeed(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {[5, 8, 12, 15, 20].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => updateFootSpeed(spd)}
                          className={`flex-1 py-0.5 text-[10px] rounded font-mono transition ${
                            footSpeedKmH === spd
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Speed Controls */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-200 font-medium flex items-center gap-1">
                        🚗 Vehicle Escape Speed:
                      </span>
                      <span className="font-mono font-bold text-white bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/30">
                        {vehicleSpeedKmH} km/h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="20"
                        max="220"
                        step="5"
                        value={vehicleSpeedKmH}
                        onChange={(e) => updateVehicleSpeed(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {[60, 90, 120, 140, 160, 180].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => updateVehicleSpeed(spd)}
                          className={`flex-1 py-0.5 text-[10px] rounded font-mono transition ${
                            vehicleSpeedKmH === spd
                              ? 'bg-indigo-500 text-white font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset & Quick Note */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 italic">Auto-saved to session</span>
                    <button
                      onClick={() => {
                        updateFootSpeed(8);
                        updateVehicleSpeed(140);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-medium underline cursor-pointer"
                    >
                      Reset Defaults (8 / 140)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowResponders(!showResponders)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${showResponders ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Responders ({activeRespondersList.length})</span>
            </button>

            <button
              onClick={() => setShowKmlLayers(!showKmlLayers)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${showKmlLayers ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>KML ({mapLayers.filter(l => l.isActive).length})</span>
            </button>

            {/* DJI Matrice T4 Drone Layer & Quick Video Launcher */}
            <div className="flex items-center">
              <button
                onClick={() => setShowDrone(!showDrone)}
                className={`px-2.5 py-1 rounded-l-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  showDrone && droneTelemetry.isOnline && droneTelemetry.stream.isStreaming
                    ? 'bg-cyan-500/20 text-cyan-300 border border-r-0 border-cyan-500/50 shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-r-0 border-slate-700'
                }`}
                title="Wys / Versteek DJI Matrice Drone op Kaart"
              >
                <Plane className={`w-3.5 h-3.5 ${droneTelemetry.isOnline && droneTelemetry.stream.isStreaming ? 'text-cyan-400' : 'text-rose-400'}`} />
                <span>
                  DJI Matrice T4 {droneTelemetry.isOnline && droneTelemetry.stream.isStreaming ? `(${droneTelemetry.battery.percentage.toFixed(0)}%)` : '(AFLYN)'}
                </span>
              </button>
              <button
                onClick={() => setIsDroneVideoOpen(true)}
                className={`px-2 py-1 rounded-r-xl text-xs font-bold flex items-center gap-1 transition shadow border border-l-0 ${
                  droneTelemetry.isOnline && droneTelemetry.stream.isStreaming
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700'
                }`}
                title="Maak Videostroom Oop"
              >
                <Video className="w-3 h-3" />
                <span>{droneTelemetry.isOnline && droneTelemetry.stream.isStreaming ? 'Video' : 'Aflyn'}</span>
              </button>
            </div>
          </div>

          {/* Active SOS Emergencies Floating Command Banner */}
          {activeEmergencies.length > 0 && (
            <div className="absolute top-3 left-16 md:left-20 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100%-140px)]">
              {activeEmergencies.map((emg) => {
                const isMicActive = emg.audioSession?.status === 'ACTIVE';
                const micLevel = emg.audioSession?.audioLevel || (isMicActive ? 35 : 0);
                const fixesCount = emg.locationSession?.history?.length || 1;
                const emgLat = Number(emg.location?.latitude);
                const emgLng = Number(emg.location?.longitude);

                return (
                  <div
                    key={emg.id}
                    className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-red-950/95 backdrop-blur-md border-2 border-red-500 shadow-2xl animate-in fade-in slide-in-from-top-2"
                  >
                    <button
                      onClick={() => {
                        setSelectedItem({ type: 'emergency', data: emg });
                        if (!isNaN(emgLat) && !isNaN(emgLng)) {
                          panTo(emgLat, emgLng, 16);
                        }
                      }}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-red-900/60 hover:bg-red-900 text-xs font-mono text-white transition group cursor-pointer"
                      title="Fokus op SOS GPS Posisie"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping flex-shrink-0" />
                      <span className="font-black text-white group-hover:text-red-200">
                        🚨 {emg.farmName || emg.clientName}
                      </span>
                      <span className="text-red-400">|</span>
                      <span className="text-cyan-300 text-[11px]">
                        📍 {!isNaN(emgLat) ? emgLat.toFixed(4) : '-26.7628'}, {!isNaN(emgLng) ? emgLng.toFixed(4) : '26.4172'}
                      </span>
                      <span className="text-red-400 hidden sm:inline">|</span>
                      <span className="text-emerald-300 font-bold text-[10px] hidden sm:inline">
                        📡 {fixesCount} Fixes
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveAudioModalEmergency(emg)}
                      className={`px-3 py-1 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer ${
                        isMicActive
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white animate-pulse'
                          : 'bg-slate-850 hover:bg-slate-750 text-slate-200 border border-slate-700'
                      }`}
                      title="Maak Regstreekse Mikrofoon Oudiokonsole Oop"
                    >
                      <Mic className={`w-3.5 h-3.5 ${isMicActive ? 'text-white animate-bounce' : 'text-slate-400'}`} />
                      <span>{isMicActive ? `Luister Mic (${micLevel}%)` : 'Oudiokonsole'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* DJI Matrice Live Drone Status Floating Banner */}
          {droneTelemetry.isOnline && droneTelemetry.stream.isStreaming ? (
            <div className="absolute top-3 right-16 z-10 hidden sm:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/60 shadow-2xl animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  setSelectedItem({ type: 'drone', data: droneTelemetry });
                  panTo(droneTelemetry.position.latitude, droneTelemetry.position.longitude, 16);
                }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-850 text-xs font-mono text-cyan-300 transition group"
                title="Fokus op Drone Posisie"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white group-hover:text-cyan-300">MATRICE T4</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">{droneTelemetry.position.heightAglMeters}m AGL</span>
                <span className="text-slate-500">|</span>
                <span className="text-amber-300 font-bold">{droneTelemetry.battery.percentage.toFixed(0)}% ⚡</span>
              </button>

              <button
                onClick={() => setIsDroneVideoOpen(true)}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 transition active:scale-95 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 animate-pulse text-cyan-200" />
                <span>Regstreekse Video</span>
              </button>
            </div>
          ) : (
            <div className="absolute top-3 right-16 z-10 hidden sm:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-rose-500/40 shadow-xl">
              <button
                onClick={() => setIsDroneVideoOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-850 text-xs font-mono text-rose-300 transition"
                title="Drone is aflyn - klik om te koppel"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold text-slate-200">DRONE AFLYN</span>
                <span className="text-slate-500">|</span>
                <span className="text-rose-400 text-[11px]">Geen Toevoer</span>
              </button>
            </div>
          )}

          {/* Selected Item Floating Detail Drawer */}
          {selectedItem && (
            <div className="absolute bottom-4 left-4 z-20 w-80 md:w-96 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-cyan-500/50 shadow-2xl p-4 text-xs animate-in slide-in-from-bottom-5 duration-200">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl border ${selectedItem.type === 'emergency' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : selectedItem.type === 'drone' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-lg' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'}`}>
                    {selectedItem.type === 'emergency' && <AlertOctagon className="w-4 h-4 text-red-400" />}
                    {selectedItem.type === 'drone' && <Plane className="w-4 h-4 text-cyan-400" />}
                    {selectedItem.type === 'responder' && <Shield className="w-4 h-4" />}
                    {selectedItem.type === 'camera' && <Camera className="w-4 h-4" />}
                    {selectedItem.type === 'incident' && <AlertTriangle className="w-4 h-4" />}
                    {selectedItem.type === 'layer' && <Layers className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white capitalize">
                      {selectedItem.type === 'emergency' && `🚨 ${selectedItem.data.farmName || selectedItem.data.clientName}`}
                      {selectedItem.type === 'drone' && `🚁 ${selectedItem.data.droneModel || 'DJI Matrice T4'}`}
                      {selectedItem.type === 'responder' && selectedItem.data.callsign}
                      {selectedItem.type === 'camera' && `${selectedItem.data.id}: ${selectedItem.data.name}`}
                      {selectedItem.type === 'incident' && selectedItem.data.reportNumber}
                      {selectedItem.type === 'layer' && selectedItem.data.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedItem.type === 'emergency' && `${selectedItem.data.type} SOS • ${selectedItem.data.clientName}`}
                      {selectedItem.type === 'drone' && `${selectedItem.data.flightMode} • ${selectedItem.data.pilot?.name || 'André Greeff'}`}
                      {selectedItem.type === 'responder' && selectedItem.data.name}
                      {selectedItem.type === 'camera' && selectedItem.data.type}
                      {selectedItem.type === 'incident' && selectedItem.data.category}
                      {selectedItem.type === 'layer' && `${selectedItem.data.featureCount || 10} geometric features`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {selectedItem.type === 'emergency' && (
                  <>
                    {/* Live Audio / Microphone Feed Panel */}
                    <div className={`p-3 rounded-xl border space-y-2 ${
                      selectedItem.data.audioSession?.status === 'ACTIVE'
                        ? 'bg-rose-950/70 border-rose-500 shadow-lg animate-in fade-in'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Mic className={`w-4 h-4 ${
                            selectedItem.data.audioSession?.status === 'ACTIVE'
                              ? 'text-rose-400 animate-pulse'
                              : 'text-slate-500'
                          }`} />
                          <span className={selectedItem.data.audioSession?.status === 'ACTIVE' ? 'text-rose-200' : 'text-slate-400'}>
                            Regstreekse Mikrofoon Toevoer
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          selectedItem.data.audioSession?.status === 'ACTIVE'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {selectedItem.data.audioSession?.status === 'ACTIVE' ? 'AKTIEF' : selectedItem.data.audioSession?.status || 'GEREED'}
                        </span>
                      </div>

                      {selectedItem.data.audioSession?.status === 'ACTIVE' ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-rose-300">
                            <span>Klankvlak (Decibels)</span>
                            <span className="font-mono font-bold text-white">
                              {selectedItem.data.audioSession?.audioLevel || 35}%
                            </span>
                          </div>
                          {/* Animated Audio Equalizer Bars */}
                          <div className="flex items-end gap-1 h-6 bg-slate-950/80 p-1 rounded-lg border border-rose-500/30">
                            {[40, 75, 55, 90, 65, 80, 45, 70, 85, 60, 50, 95, 65, 45].map((val, i) => {
                              const dynamicHeight = Math.min(100, Math.max(15, (selectedItem.data.audioSession?.audioLevel || 35) * (val / 50)));
                              return (
                                <div
                                  key={i}
                                  className="flex-1 bg-gradient-to-t from-rose-600 to-rose-400 rounded-sm transition-all duration-150"
                                  style={{ height: `${dynamicHeight}%` }}
                                />
                              );
                            })}
                          </div>
                          <button
                            onClick={() => setActiveAudioModalEmergency(selectedItem.data)}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer"
                          >
                            <Headphones className="w-4 h-4" />
                            <span>Maak Volledige Oudiokonsole Oop</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400">Geen aktiewe klankstroom</span>
                          <button
                            onClick={() => setActiveAudioModalEmergency(selectedItem.data)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Mic className="w-3 h-3" />
                            <span>Versoek Klank</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-red-950/40 p-2.5 rounded-xl border border-red-500/40 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Emergency Type:</span>
                        <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 font-bold uppercase">
                          {selectedItem.data.emergencyType || selectedItem.data.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">GPS Coordinates:</span>
                        <span className="font-mono text-cyan-300 text-[11px] font-bold">
                          {selectedItem.data.location?.latitude != null ? Number(selectedItem.data.location.latitude).toFixed(5) : '-26.76280'}, {selectedItem.data.location?.longitude != null ? Number(selectedItem.data.location.longitude).toFixed(5) : '26.41720'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">GPS Akkuraatheid:</span>
                        <span className="font-mono text-emerald-400 text-[11px] font-bold">
                          ±{selectedItem.data.location?.accuracy || 10}m ({selectedItem.data.location?.quality || 'GPS'})
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">1-Min Updates:</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          {selectedItem.data.locationSession?.history?.length || 1} Fixes Broadcasted
                        </span>
                      </div>
                      
                      {/* Live Suspect Escape Range Status */}
                      {(() => {
                        const startTs = selectedItem.data.startTime ? new Date(selectedItem.data.startTime).getTime() : Date.now() - 60000;
                        const elapsedSecs = Math.max(5, Math.floor((currentTime - startTs) / 1000));
                        const elapsedMin = Math.floor(elapsedSecs / 60);
                        const elapsedSecRem = elapsedSecs % 60;
                        const footSpeedMps = (footSpeedKmH * 1000) / 3600;
                        const carSpeedMps = (vehicleSpeedKmH * 1000) / 3600;
                        const footKm = ((Math.max(40, elapsedSecs * footSpeedMps)) / 1000).toFixed(2);
                        const carKm = ((Math.max(150, elapsedSecs * carSpeedMps)) / 1000).toFixed(2);

                        return (
                          <div className="bg-slate-900/90 p-2 rounded-lg border border-amber-500/40 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-amber-300 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Suspect Escape Envelope
                              </span>
                              <span className="text-slate-400 font-mono">T+{elapsedMin}m {elapsedSecRem}s</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                              <div className="bg-amber-950/40 p-1.5 rounded border border-amber-500/30">
                                <div className="text-amber-400 font-bold">🚶 Foot ({footSpeedKmH} km/h)</div>
                                <div className="text-white font-mono font-bold text-xs">{footKm} km</div>
                              </div>
                              <div className="bg-indigo-950/40 p-1.5 rounded border border-indigo-500/30">
                                <div className="text-indigo-400 font-bold">🚗 Car ({vehicleSpeedKmH} km/h)</div>
                                <div className="text-white font-mono font-bold text-xs">{carKm} km</div>
                              </div>
                            </div>
                            <div className="text-[9px] text-slate-400 italic">
                              * Growing layers clear automatically when SOS status is set to Safe/Closed.
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Last GPS Timestamp:</span>
                        <span className="font-mono text-cyan-300 text-[11px]">
                          {selectedItem.data.location?.timestamp ? new Date(selectedItem.data.location.timestamp).toLocaleTimeString('en-ZA') : 'Just now'}
                        </span>
                      </div>
                      {selectedItem.data.propertyDetails?.address && (
                        <div>
                          <span className="text-slate-400">Physical Address:</span>
                          <div className="text-slate-200 text-[11px] mt-0.5">{selectedItem.data.propertyDetails.address}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setDispatchWhatsAppEmergency(selectedItem.data)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition shadow-lg text-xs"
                      >
                        <Radio className="w-3.5 h-3.5" /> Dispatch Reaction WhatsApp
                      </button>
                      <a
                        href={`tel:${selectedItem.data.clientPhone}`}
                        className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-1.5 transition shadow-lg text-xs"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Client
                      </a>
                      <button
                        onClick={() => panTo(Number(selectedItem.data.location?.latitude || -26.7628), Number(selectedItem.data.location?.longitude || 26.4172), 16)}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center justify-center gap-1 border border-slate-700 transition text-xs"
                        title="Center and Zoom to SOS Coordinates"
                      >
                        <Crosshair className="w-3.5 h-3.5" /> Focus
                      </button>
                    </div>
                  </>
                )}
                {selectedItem.type === 'responder' && (
                  <>
                    <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Status</span>
                        <span className="font-bold text-emerald-400">{selectedItem.data.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Speed & Heading</span>
                        <span className="font-bold text-white">{selectedItem.data.speed} ({selectedItem.data.heading}°)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Vehicle</span>
                        <span className="font-medium text-white">{selectedItem.data.vehicle}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Radio Channel</span>
                        <span className="font-medium text-cyan-300">{selectedItem.data.radioChannel}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const phone = selectedItem.data.phone;
                          if (!phone) return;
                          setCallNotice({ phone, name: `${selectedItem.data.callsign} (${selectedItem.data.name})` });
                          window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-md"
                        title={`Call unit ${selectedItem.data.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Unit
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveWhatsAppResponder(selectedItem.data)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-md border border-emerald-500/50"
                        title="Send WhatsApp message to responder unit"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => panTo(selectedItem.data.lat, selectedItem.data.lng, 15)}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center justify-center gap-1 border border-slate-700 transition text-xs"
                        title="Center and Zoom to Unit"
                      >
                        <Crosshair className="w-3.5 h-3.5" /> Focus
                      </button>
                    </div>
                  </>
                )}

                {selectedItem.type === 'drone' && (
                  <>
                    {!selectedItem.data.isOnline ? (
                      <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-500/50 space-y-2">
                        <div className="flex items-center gap-2 text-rose-300 font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span>DRONE IS AFLYN (GEEN TOEVOER)</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Geen aktiewe videotoevoer of O3 Pro telemetrie word tans vanaf die DJI Matrice ontvang nie.
                        </p>
                      </div>
                    ) : null}

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-cyan-500/40 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Vlugmodus & Vlugtyd</span>
                          <span className="font-bold text-cyan-300">{selectedItem.data.flightMode || selectedItem.data.flightState || 'STANDBY'} • {selectedItem.data.battery?.estimatedMinutesRemaining || selectedItem.data.battery?.estimatedFlightTimeMinutes || 0}m</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Hoogte bo Grond (AGL)</span>
                          <span className="font-bold text-emerald-400">{selectedItem.data.position.heightAglMeters}m ({selectedItem.data.position.altitudeMslMeters}m MSL)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Spoed & Rigting</span>
                          <span className="font-bold text-white">{selectedItem.data.position.horizontalSpeedKmh} km/h • {selectedItem.data.position.heading}°</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">TB30 Dubbel Battery</span>
                          <span className="font-bold text-amber-300">{selectedItem.data.battery.percentage.toFixed(0)}% • {selectedItem.data.battery.voltage.toFixed(1)}V</span>
                        </div>
                      </div>

                      {/* FLIR Thermal & Optical Telemetry */}
                      <div className="pt-2 border-t border-slate-700/80 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
                          <span className="text-slate-400 block">FLIR Termiese Spot:</span>
                          <span className="text-rose-400 font-mono font-bold">{selectedItem.data.gimbal.thermalSpotTempC.toFixed(1)}°C ({selectedItem.data.gimbal.thermalPalette})</span>
                        </div>
                        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
                          <span className="text-slate-400 block">Laser Afstand (LRF):</span>
                          <span className="text-cyan-400 font-mono font-bold">
                            {selectedItem.data.laserRangefinder.active ? `${selectedItem.data.laserRangefinder.targetDistanceMeters}m Teiken` : 'Gereed'}
                          </span>
                        </div>
                      </div>

                      {/* GPS & Loods Inligting */}
                      <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono">
                          GPS: {selectedItem.data.position.latitude.toFixed(5)}, {selectedItem.data.position.longitude.toFixed(5)}
                        </span>
                        <span className="text-slate-300 font-medium">
                          🎮 {selectedItem.data.pilot?.smartControllerModel || 'Smart Controller'} ({selectedItem.data.rcLink.rssiPercent}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDroneVideoOpen(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-950/60 text-xs cursor-pointer"
                      >
                        <Video className="w-4 h-4 text-cyan-200 animate-pulse" />
                        <span>Kyk Regstreekse Videostroom (HUD & FLIR)</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            droneTelemetryService.dropLaserPinPoint();
                            setDroneTelemetry(droneTelemetryService.getTelemetry());
                          }}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/50 font-bold flex items-center justify-center gap-1.5 transition text-[11px]"
                          title="Vuur Laser Rangefinder en plaas teiken op kaart"
                        >
                          <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                          <span>Laser Merk Teiken</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => panTo(selectedItem.data.position.latitude, selectedItem.data.position.longitude, 16)}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center justify-center gap-1 border border-slate-700 transition text-[11px]"
                          title="Fokus kaart op DJI Matrice posisie"
                        >
                          <Crosshair className="w-3.5 h-3.5" /> Fokus
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {selectedItem.type === 'camera' && (
                  <>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Stream Type:</span>
                        <span className="font-medium text-white">{selectedItem.data.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Link Telemetry:</span>
                        <span className="font-medium text-emerald-400">{selectedItem.data.pings} • {selectedItem.data.batt}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => panTo(selectedItem.data.lat, selectedItem.data.lng, 16)}
                      className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Crosshair className="w-3.5 h-3.5" /> Center & Zoom Camera Mast
                    </button>
                  </>
                )}

                {selectedItem.type === 'incident' && (
                  <>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Date & Time:</span>
                        <span className="font-bold text-white">{new Date(selectedItem.data.timestamp).toLocaleString('en-ZA')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Category:</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">{selectedItem.data.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Location:</span>
                        <div className="font-medium text-cyan-200">{selectedItem.data.location}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Details:</span>
                        <div className="text-slate-200 text-xs mt-1 leading-relaxed max-h-32 overflow-y-auto pr-1">
                          {selectedItem.data.description}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedItem.type === 'layer' && (
                  <>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Layer Name:</span>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedItem.data.colorHex || selectedItem.data.color || '#06b6d4' }}
                          />
                          <span className="font-bold text-white">{selectedItem.data.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Category:</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold capitalize text-[10px]">
                          {selectedItem.data.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Features Count:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {selectedItem.data.placemarkCount || selectedItem.data.features?.length || selectedItem.data.featureCount || 0} features
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Description:</span>
                        <div className="text-slate-300 text-xs mt-1 leading-relaxed">
                          {selectedItem.data.description || 'Tactical operational GIS layer.'}
                        </div>
                      </div>
                    </div>

                    <div className={`grid ${shouldHideSettings ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                      {!shouldHideSettings && (
                        <button
                          onClick={() => {
                            setEditingLayer(selectedItem.data);
                            setIsLayerEditorOpen(true);
                          }}
                          className="py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white transition text-xs shadow"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Wysig Laag</span>
                        </button>
                      )}

                      <button
                        onClick={() => focusOnLayer(selectedItem.data)}
                        className="py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs border border-slate-700"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Fokus Kaart</span>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleMapLayerActive(selectedItem.data.id)}
                      className={`w-full py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-xs ${
                        selectedItem.data.isActive
                          ? 'bg-amber-600/80 hover:bg-amber-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {selectedItem.data.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {selectedItem.data.isActive ? 'Versteek Laag op Kaart' : 'Wys Laag op Kaart'}
                    </button>

                    {!shouldHideSettings && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Is u seker u wil die laag "${selectedItem.data.name}" permanent uitvee?`)) {
                            handleDeleteLayer(selectedItem.data.id);
                          }
                        }}
                        className="w-full py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 bg-red-950/50 hover:bg-red-900 text-red-300 border border-red-800/60 transition text-[11px]"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                        <span>Vee Laag Uit (Delete)</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Tactical Sidebar Control Panel */}
        {isSidebarOpen && (
          <div className="w-84 md:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20">
            {/* Sidebar Tabs */}
            <div className="grid grid-cols-5 p-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px]">
              <button
                onClick={() => setActiveSidebarTab('emergencies')}
                className={`py-1.5 px-0.5 font-bold rounded-lg text-center transition flex flex-col items-center justify-center gap-0.5 ${
                  activeSidebarTab === 'emergencies'
                    ? 'bg-red-600 text-white shadow-lg'
                    : activeEmergencies.length > 0
                    ? 'bg-red-950/70 border border-red-500/60 text-red-300 animate-pulse'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>SOS</span>
                <span className="text-[10px] opacity-80">({activeEmergencies.length})</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('layers')}
                className={`py-1.5 px-0.5 font-semibold rounded-lg text-center transition ${activeSidebarTab === 'layers' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <span>Layers</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('responders')}
                className={`py-1.5 px-0.5 font-semibold rounded-lg text-center transition ${activeSidebarTab === 'responders' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <span>Units</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('incidents')}
                className={`py-1.5 px-0.5 font-semibold rounded-lg text-center transition ${activeSidebarTab === 'incidents' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <span>Logs</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('cameras')}
                className={`py-1.5 px-0.5 font-semibold rounded-lg text-center transition ${activeSidebarTab === 'cameras' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <span>Cams</span>
              </button>
            </div>

            {/* Sidebar Tab Contents */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* EMERGENCIES TAB */}
              {activeSidebarTab === 'emergencies' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
                      <span>Active SOS ({activeEmergencies.length})</span>
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      1-Min GPS Active
                    </span>
                  </div>

                  {activeEmergencies.length === 0 ? (
                    <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                      <p className="font-semibold text-slate-400">All Sectors Clear</p>
                      <p className="text-[11px] mt-1 text-slate-500">No active SOS emergencies in progress.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeEmergencies.map((emg) => {
                        const distKm = calculateHaversineDistanceKm(
                          OPS_HQ.lat,
                          OPS_HQ.lng,
                          emg.location.latitude,
                          emg.location.longitude
                        );
                        const updatesCount = emg.locationSession?.history?.length || 1;

                        return (
                          <div
                            key={emg.id}
                            onClick={() => {
                              setSelectedItem({ type: 'emergency', data: emg });
                              panTo(emg.location.latitude, emg.location.longitude, 15);
                            }}
                            className="p-3 rounded-xl bg-red-950/30 hover:bg-red-950/50 border-2 border-red-500/60 cursor-pointer transition space-y-2 shadow-lg group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                  <span className="font-black text-xs text-white group-hover:text-red-300 transition">
                                    {emg.farmName || emg.clientName}
                                  </span>
                                </div>
                                <span className="text-[11px] text-red-200 block font-medium mt-0.5">
                                  {emg.clientName} • {emg.clientPhone}
                                </span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-black uppercase tracking-wider">
                                {emg.emergencyType || emg.type}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2 rounded-lg border border-red-500/30 text-[11px]">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Distance to Ops HQ</span>
                                <span className="font-mono font-bold text-cyan-300">{distKm.toFixed(1)} km</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">1-Min GPS Fixes</span>
                                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  {updatesCount} received
                                </span>
                              </div>
                            </div>

                            {/* Live Microphone Status Banner */}
                            <div className="flex items-center justify-between p-2 bg-slate-950/80 rounded-lg border border-rose-500/40 text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <Mic className={`w-3.5 h-3.5 ${emg.audioSession?.status === 'ACTIVE' ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                                <span className="font-bold text-slate-300">
                                  {emg.audioSession?.status === 'ACTIVE' ? (
                                    <span className="text-rose-300 font-mono">LIVE MIC ({emg.audioSession.audioLevel || 35}%)</span>
                                  ) : (
                                    <span className="text-slate-400">Mic Toevoer Gereed</span>
                                  )}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAudioModalEmergency(emg);
                                }}
                                className={`px-2 py-0.5 rounded font-black text-[10px] flex items-center gap-1 shadow transition cursor-pointer ${
                                  emg.audioSession?.status === 'ACTIVE'
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                                }`}
                              >
                                <Headphones className="w-3 h-3" />
                                <span>{emg.audioSession?.status === 'ACTIVE' ? 'Luister' : 'Oudio'}</span>
                              </button>
                            </div>

                            {/* Live Growing Suspect Escape Range Readout */}
                            {(() => {
                              const startTs = emg.startTime ? new Date(emg.startTime).getTime() : Date.now() - 60000;
                              const elapsedSecs = Math.max(5, Math.floor((currentTime - startTs) / 1000));
                              const footSpeedMps = (footSpeedKmH * 1000) / 3600;
                              const carSpeedMps = (vehicleSpeedKmH * 1000) / 3600;
                              const footKm = ((Math.max(40, elapsedSecs * footSpeedMps)) / 1000).toFixed(2);
                              const carKm = ((Math.max(150, elapsedSecs * carSpeedMps)) / 1000).toFixed(2);

                              return (
                                <div className="p-2 bg-slate-950/70 rounded-lg border border-amber-500/30 text-[10px] space-y-1">
                                  <div className="flex items-center justify-between text-amber-300 font-bold">
                                    <span className="flex items-center gap-1">
                                      <Activity className="w-3 h-3 text-amber-400" /> Suspect Escape Envelope
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                                    <div className="text-slate-300">
                                      🚶 Foot ({footSpeedKmH}km/h): <b className="text-amber-300 font-mono">{footKm}km</b>
                                    </div>
                                    <div className="text-slate-300">
                                      🚗 Car ({vehicleSpeedKmH}km/h): <b className="text-indigo-300 font-mono">{carKm}km</b>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="flex items-center justify-between pt-1 border-t border-red-500/30 text-[10px]">
                              <span className="text-slate-400">
                                Last Fix: {emg.location.timestamp ? new Date(emg.location.timestamp).toLocaleTimeString('en-ZA') : 'Just now'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDispatchWhatsAppEmergency(emg);
                                  }}
                                  className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded font-bold transition flex items-center gap-1 shadow"
                                >
                                  <Radio className="w-3 h-3" /> WhatsApp
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem({ type: 'emergency', data: emg });
                                    panTo(emg.location.latitude, emg.location.longitude, 16);
                                  }}
                                  className="px-2 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded font-bold transition flex items-center gap-1"
                                >
                                  <Crosshair className="w-3 h-3" /> Focus
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {/* KML LAYERS & TACTICAL RADIUS TAB */}
              {activeSidebarTab === 'layers' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active KML Tactical Layers</h4>
                    <span className="text-xs text-cyan-400 font-semibold">{mapLayers.filter(l => l.isActive).length} / {mapLayers.length} Active</span>
                  </div>

                  {/* Suspect Escape Speed Tactical Settings Card (Hidden in Reaction Force / Restricted mode) */}
                  {!shouldHideSettings && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-amber-400" />
                          Escape Radius Speeds
                        </span>
                        <button
                          onClick={() => setShowSuspectRadius(!showSuspectRadius)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold transition border ${
                            showSuspectRadius
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {showSuspectRadius ? 'Layer Visible' : 'Layer Hidden'}
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* Foot speed setting */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-300">🚶 Foot Speed:</span>
                            <span className="font-mono font-bold text-amber-400">{footSpeedKmH} km/h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="2"
                              max="30"
                              step="1"
                              value={footSpeedKmH}
                              onChange={(e) => updateFootSpeed(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                            />
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[5, 8, 12, 15, 20].map((spd) => (
                              <button
                                key={spd}
                                onClick={() => updateFootSpeed(spd)}
                                className={`flex-1 py-0.5 text-[9px] rounded font-mono transition ${
                                  footSpeedKmH === spd
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {spd}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Vehicle speed setting */}
                        <div className="pt-1.5 border-t border-slate-800">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-300">🚗 Vehicle Speed:</span>
                            <span className="font-mono font-bold text-indigo-400">{vehicleSpeedKmH} km/h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="20"
                              max="220"
                              step="5"
                              value={vehicleSpeedKmH}
                              onChange={(e) => updateVehicleSpeed(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                            />
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[60, 90, 120, 140, 160, 180].map((spd) => (
                              <button
                                key={spd}
                                onClick={() => updateVehicleSpeed(spd)}
                                className={`flex-1 py-0.5 text-[9px] rounded font-mono transition ${
                                  vehicleSpeedKmH === spd
                                    ? 'bg-indigo-500 text-white font-bold'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {spd}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Tactical GIS Layers</h4>
                      <div className="text-[10px] text-slate-400">
                        {mapLayers.filter(l => l.isActive).length} van {mapLayers.length} aktief
                      </div>
                    </div>
                    {!shouldHideSettings && (
                      <button
                        onClick={() => {
                          setEditingLayer(null);
                          setIsLayerEditorOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nuwe Laag</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {mapLayers.map((layer) => {
                      const layerColor = layer.colorHex || layer.color || '#06b6d4';
                      const count = layer.placemarkCount || layer.features?.length || layer.featureCount || 0;
                      return (
                        <div
                          key={layer.id}
                          className={`p-2.5 rounded-xl border transition ${
                            layer.isActive
                              ? 'bg-slate-800/90 border-cyan-500/50 text-white shadow-sm'
                              : 'bg-slate-950/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              onClick={() => {
                                setSelectedItem({ type: 'layer', data: layer });
                                focusOnLayer(layer);
                              }}
                              className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0"
                            >
                              <span 
                                className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 shadow" 
                                style={{ backgroundColor: layerColor }}
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-white truncate hover:text-cyan-300 transition">
                                  {layer.name}
                                </div>
                                <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1.5 mt-0.5">
                                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                                    {layer.category}
                                  </span>
                                  <span>•</span>
                                  <span>{count} features</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons Toolbar */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => focusOnLayer(layer)}
                                className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition"
                                title="Fokus op kaart"
                              >
                                <Crosshair className="w-3 h-3" />
                              </button>

                              {!shouldHideSettings && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingLayer(layer);
                                      setIsLayerEditorOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition"
                                    title="Wysig Laag (Edit)"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Is u seker u wil die laag "${layer.name}" verwyder?`)) {
                                        handleDeleteLayer(layer.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700/60 transition"
                                    title="Vee Laag Uit (Delete)"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => toggleMapLayerActive(layer.id)}
                                className={`p-1.5 rounded-lg border transition ${
                                  layer.isActive
                                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                                }`}
                                title={layer.isActive ? 'Versteek Laag' : 'Wys Laag'}
                              >
                                {layer.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RESPONDERS TAB */}
              {activeSidebarTab === 'responders' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Units in Field</h4>
                    <span className="text-xs text-emerald-400 font-semibold">{activeRespondersList.length} Connected</span>
                  </div>

                  <div className="space-y-2">
                    {activeRespondersList.map((resp) => (
                      <div
                        key={resp.id}
                        onClick={() => {
                          setSelectedItem({ type: 'responder', data: resp });
                          panTo(resp.lat, resp.lng, 14);
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-bold text-xs text-white">{resp.callsign}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">{resp.status}</span>
                        </div>
                        <div className="text-xs text-slate-300">{resp.name}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                          <span>{resp.vehicle}</span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                const phone = resp.phone;
                                if (!phone) return;
                                setCallNotice({ phone, name: `${resp.callsign} (${resp.name})` });
                                window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
                              }}
                              className="p-1 px-1.5 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold transition flex items-center gap-1 text-[10px]"
                              title={`Call ${resp.phone}`}
                            >
                              <Phone className="w-2.5 h-2.5" /> Call
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveWhatsAppResponder(resp)}
                              className="p-1 px-1.5 rounded bg-emerald-700/40 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold transition flex items-center gap-1 text-[10px]"
                              title="Send WhatsApp message"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> WA
                            </button>
                            <span className="font-mono text-cyan-300 pl-1">{resp.speed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INCIDENTS TAB */}
              {activeSidebarTab === 'incidents' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Actual Log Reports ({filteredIncidents.length})</h4>
                  </div>

                  {/* Incident Category Filter Pill Selector */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'STOCK_THEFT', label: 'Vee' },
                      { id: 'FIRE', label: 'Brand' },
                      { id: 'SUSPICIOUS', label: 'Verdag' },
                      { id: 'THEFT', label: 'Kabel/Dief' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedIncidentCategory(cat.id)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition ${selectedIncidentCategory === cat.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {filteredIncidents.slice(0, 25).map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => {
                          setSelectedItem({ type: 'incident', data: inc });
                          const coords = (inc as any).customCoordinates;
                          if (coords) panTo(coords.lat, coords.lng, 14);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-300">{inc.reportNumber}</span>
                          <span className="text-[10px] text-slate-400">{new Date(inc.timestamp).toLocaleDateString('en-ZA')}</span>
                        </div>
                        <div className="text-xs font-medium text-white line-clamp-1">{inc.location}</div>
                        <div className="text-[11px] text-slate-300 line-clamp-2 leading-tight">{inc.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CAMERAS TAB */}
              {activeSidebarTab === 'cameras' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Camera Mast Fleet ({CAMERA_MASTS.length})</h4>
                  </div>

                  <div className="space-y-2">
                    {CAMERA_MASTS.map((cam) => (
                      <div
                        key={cam.id}
                        onClick={() => {
                          setSelectedItem({ type: 'camera', data: cam });
                          panTo(cam.lat, cam.lng, 15);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{cam.id}: {cam.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{cam.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{cam.type}</span>
                          <span className="font-mono text-cyan-400">{cam.pings}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Reaction Force WhatsApp Modal */}
      {dispatchWhatsAppEmergency && (
        <DispatchReactionForceWhatsAppModal
          isOpen={!!dispatchWhatsAppEmergency}
          onClose={() => setDispatchWhatsAppEmergency(null)}
          emergency={dispatchWhatsAppEmergency}
        />
      )}

      {/* Direct Responder WhatsApp Modal */}
      {activeWhatsAppResponder && (
        <ResponderWhatsAppModal
          isOpen={!!activeWhatsAppResponder}
          onClose={() => setActiveWhatsAppResponder(null)}
          responder={activeWhatsAppResponder}
        />
      )}

      {/* DJI Matrice T4 Live Video & Tactical HUD Window Modal */}
      {isDroneVideoOpen && (
        <DroneVideoFeedModal
          isOpen={isDroneVideoOpen}
          onClose={() => setIsDroneVideoOpen(false)}
        />
      )}

      {/* Tactical Map Layer Editor / Creator Modal */}
      {isLayerEditorOpen && (
        <OperationsMapLayerEditorModal
          isOpen={isLayerEditorOpen}
          onClose={() => {
            setIsLayerEditorOpen(false);
            setEditingLayer(null);
          }}
          layer={editingLayer}
          onSave={handleSaveLayer}
          onDelete={handleDeleteLayer}
        />
      )}

      {/* Live Audio / Emergency Microphone Console Modal */}
      {activeAudioModalEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-red-500/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border-b border-red-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Regstreekse Nood-Oudiokonsole</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600 text-white uppercase font-bold">
                      {activeAudioModalEmergency.emergencyType || activeAudioModalEmergency.type} SOS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    {activeAudioModalEmergency.farmName || activeAudioModalEmergency.clientName} • {activeAudioModalEmergency.clientName} ({activeAudioModalEmergency.clientPhone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveAudioModalEmergency(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/90">
              <LiveAudioConsole emergency={activeAudioModalEmergency} isClientView={false} />
            </div>
          </div>
        </div>
      )}

      {/* Dialing / Call Fallback Toast Notice */}
      {callNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl flex items-center gap-3 text-xs max-w-sm animate-in slide-in-from-bottom-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Phone className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white text-sm">Calling Unit...</div>
            <div className="text-slate-300">{callNotice.name}</div>
            <div className="font-mono text-emerald-400 font-bold text-xs mt-0.5">{callNotice.phone}</div>
          </div>
          <button
            onClick={() => setCallNotice(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OperationsMap;
