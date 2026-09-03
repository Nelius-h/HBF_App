import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Activity,
  Zap,
  Clock,
  RotateCw,
  ExternalLink,
  Shield,
  Layers,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData, calculateHaversineDistanceKm } from '../../context/DataContext';
import { EmergencyEvent, LocationMode } from '../../types';

interface LiveLocationMapTrackerProps {
  emergency: EmergencyEvent;
  isClientView?: boolean;
}

export const LiveLocationMapTracker: React.FC<LiveLocationMapTrackerProps> = ({
  emergency,
  isClientView = false,
}) => {
  const { activeRole } = useAuth();
  const {
    startLiveLocationSession,
    changeLocationMode,
    stopLiveLocationSession,
    updateClientLocation,
    mapLayers,
  } = useData();

  const [showTacticalGis, setShowTacticalGis] = useState(true);

  const session = emergency.locationSession;
  const isLive = !!session?.isActive;
  const history = session?.history || [];
  const currentFix = emergency.location;

  const [isUpdatingManual, setIsUpdatingManual] = useState(false);

  // Check if position fix is stale (more than 60s)
  const isStale =
    isLive &&
    session?.lastUpdate &&
    Date.now() - new Date(session.lastUpdate).getTime() > 60000;

  const handleToggleLive = async () => {
    if (isLive) {
      stopLiveLocationSession(emergency.id);
    } else {
      await startLiveLocationSession(emergency.id, 'STANDARD');
    }
  };

  const handleModeChange = (mode: LocationMode) => {
    if (!isLive) return;
    changeLocationMode(emergency.id, mode);
  };

  const handleManualGPSFix = () => {
    setIsUpdatingManual(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await updateClientLocation(emergency.id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            quality: 'CURRENT_GPS',
          });
          setIsUpdatingManual(false);
        },
        async (err) => {
          console.warn('[GPSFix] Geolocation fix failed:', err.message);
          setIsUpdatingManual(false);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      setIsUpdatingManual(false);
    }
  };

  // Generate a mini SVG grid & route trail for vector visualization
  // Scale coordinates to SVG viewBox (0 0 300 160)
  const minLat = Math.min(...(history.length > 0 ? history.map((h) => h.latitude) : [currentFix.latitude]));
  const maxLat = Math.max(...(history.length > 0 ? history.map((h) => h.latitude) : [currentFix.latitude]));
  const minLng = Math.min(...(history.length > 0 ? history.map((h) => h.longitude) : [currentFix.longitude]));
  const maxLng = Math.max(...(history.length > 0 ? history.map((h) => h.longitude) : [currentFix.longitude]));

  const latRange = Math.max(0.002, maxLat - minLat);
  const lngRange = Math.max(0.002, maxLng - minLng);

  const getSvgX = (lng: number) => {
    return 30 + ((lng - minLng) / lngRange) * 240;
  };
  const getSvgY = (lat: number) => {
    return 130 - ((lat - minLat) / latRange) * 100;
  };

  const polylinePoints = history
    .map((pt) => `${getSvgX(pt.longitude)},${getSvgY(pt.latitude)}`)
    .join(' ');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black ${
              isLive
                ? isStale
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Navigation className={`w-5 h-5 ${isLive ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                Live Location Tracking
              </h3>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isLive
                    ? isStale
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isLive ? (isStale ? 'STALE FIX' : 'LIVE STREAM') : 'FIXED GPS'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Temporary emergency path sharing with Control Room dispatch
            </p>
          </div>
        </div>

        {/* Live sharing switch */}
        <div className="flex items-center gap-2">
          {isClientView ? (
            <button
              onClick={handleToggleLive}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition ${
                isLive
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isLive ? 'Stop Live Track' : 'Share Live Track'}</span>
            </button>
          ) : (
            <button
              onClick={handleManualGPSFix}
              disabled={isUpdatingManual}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isUpdatingManual ? 'animate-spin' : ''}`} />
              <span>Request Fix</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector (When Live) */}
      {isLive && (
        <div className="bg-slate-950/70 p-2 rounded-2xl border border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 pl-2">Update Interval Mode:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleModeChange('STANDARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                session?.locationMode === 'STANDARD'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Standard (20s)</span>
            </button>
            <button
              onClick={() => handleModeChange('HIGH_PRIORITY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                session?.locationMode === 'HIGH_PRIORITY'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>High Priority (5s)</span>
            </button>
          </div>
        </div>
      )}

      {/* MAP & BREADCRUMB DISPLAY */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        {/* SVG Radar / Vector Map Background */}
        <div className="h-44 w-full relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          <svg className="w-full h-full" viewBox="0 0 300 160">
            {/* Grid concentric circles */}
            <circle cx="150" cy="80" r="35" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
            <circle cx="150" cy="80" r="70" fill="none" stroke="#1e293b" strokeWidth="1" />

            {/* Path polyline */}
            {history.length > 1 && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
                points={polylinePoints}
              />
            )}

            {/* Breadcrumb points */}
            {history.map((pt, idx) => {
              const x = getSvgX(pt.longitude);
              const y = getSvgY(pt.latitude);
              const isLast = idx === history.length - 1;
              return (
                <g key={pt.id ? `${pt.id}-${idx}` : `loc-pt-${idx}`}>
                  {isLast ? (
                    <>
                      <circle cx={x} cy={y} r="12" fill="rgba(16, 185, 129, 0.2)" className="animate-ping" />
                      <circle cx={x} cy={y} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    </>
                  ) : (
                    <circle cx={x} cy={y} r="3" fill="#64748b" />
                  )}
                </g>
              );
            })}

            {/* If no history yet, draw single current point */}
            {history.length === 0 && (
              <g>
                <circle cx="150" cy="80" r="14" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                <circle cx="150" cy="80" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* Current coordinates overlay card */}
          <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-200">
            <span className="text-emerald-400 font-bold block">
              {currentFix.latitude.toFixed(5)}, {currentFix.longitude.toFixed(5)}
            </span>
            <span className="text-[9px] text-slate-400">
              Accuracy: ±{currentFix.accuracy || 10}m • {emergency.farmName}
            </span>
          </div>

          {/* Google Maps link */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${currentFix.latitude},${currentFix.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] text-emerald-400 font-bold flex items-center gap-1 shadow"
          >
            <span>Satellite Map</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Stale warning banner */}
          {isStale && (
            <div className="absolute top-2 right-2 bg-amber-600/90 text-slate-950 font-black px-2.5 py-1 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 animate-bounce shadow">
              <Clock className="w-3 h-3" />
              <span>Location Stale (&gt;60s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Info & Privacy Notice */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Temporary location stream (auto-purged when emergency closes)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTacticalGis(!showTacticalGis)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showTacticalGis ? 'Hide GIS Overlay' : 'Show Tactical GIS'}</span>
          </button>
          <span className="font-mono text-slate-500">
            {history.length} pt{history.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* TACTICAL GIS / KML PROXIMITY OVERLAY */}
      {showTacticalGis && !isClientView && (
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Tactical GIS Proximity (Active KML Layers)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Hartbeesfontein Grid</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Water Points */}
            {(() => {
              const waterLayer = mapLayers.find((l) => l.isActive && l.category === 'WATER_POINTS');
              const waterFeatures = waterLayer?.features || [];
              const sorted = waterFeatures
                .map((f) => {
                  const c = f.coordinates as [number, number];
                  const dist = calculateHaversineDistanceKm(currentFix.latitude, currentFix.longitude, c[0], c[1]);
                  return { ...f, dist };
                })
                .sort((a, b) => a.dist - b.dist);
              const nearest = sorted[0];

              return (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Nearest Fire Dam / Water
                  </span>
                  {nearest ? (
                    <div>
                      <p className="font-bold text-white text-[11px] truncate">{nearest.name}</p>
                      <p className="text-[10px] text-cyan-300 font-mono">~{nearest.dist.toFixed(1)} km direct</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No water layers active</p>
                  )}
                </div>
              );
            })()}

            {/* VHF Repeater */}
            {(() => {
              const radLayer = mapLayers.find((l) => l.isActive && l.category === 'RADIO_REPEATERS');
              const radFeatures = radLayer?.features || [];
              const sorted = radFeatures
                .map((f) => {
                  const c = f.coordinates as [number, number];
                  const dist = calculateHaversineDistanceKm(currentFix.latitude, currentFix.longitude, c[0], c[1]);
                  return { ...f, dist };
                })
                .sort((a, b) => a.dist - b.dist);
              const nearest = sorted[0];

              return (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Optimal VHF High-Site
                  </span>
                  {nearest ? (
                    <div>
                      <p className="font-bold text-white text-[11px] truncate">{nearest.name}</p>
                      <p className="text-[10px] text-purple-300 font-mono">~{nearest.dist.toFixed(1)} km line-of-sight</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No radio layers active</p>
                  )}
                </div>
              );
            })()}

            {/* Staging / LZ Point */}
            {(() => {
              const stgLayer = mapLayers.find((l) => l.isActive && l.category === 'STAGING_POINTS');
              const stgFeatures = stgLayer?.features || [];
              const sorted = stgFeatures
                .map((f) => {
                  const c = f.coordinates as [number, number];
                  const dist = calculateHaversineDistanceKm(currentFix.latitude, currentFix.longitude, c[0], c[1]);
                  return { ...f, dist };
                })
                .sort((a, b) => a.dist - b.dist);
              const nearest = sorted[0];

              return (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Medical LZ / Staging Point
                  </span>
                  {nearest ? (
                    <div>
                      <p className="font-bold text-white text-[11px] truncate">{nearest.name}</p>
                      <p className="text-[10px] text-emerald-300 font-mono">~{nearest.dist.toFixed(1)} km</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No staging layers active</p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
