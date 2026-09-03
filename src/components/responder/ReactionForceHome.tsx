import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Radio,
  MapPin,
  AlertTriangle,
  Send,
  Navigation,
  Phone,
  Eye,
  CheckCircle2,
  Share2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Volume2,
  Sparkles,
  RefreshCw,
  Power,
  Zap,
  Users,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyEvent } from '../../types';
import { OperationsMap } from '../controlRoom/OperationsMap';
import { EmergencyActionModal } from '../client/EmergencyActionModal';
import { ClientActiveEmergencyView } from '../client/ClientActiveEmergencyView';
import { NotificationSettingsModal } from '../common/NotificationSettingsModal';
import { Bell, Sliders } from 'lucide-react';
import { useBackButton } from '../../hooks/useBackButton';

interface ReactionForceHomeProps {
  onOpenEmergency: () => void;
  onOpenReportIncident: () => void;
  onNavigateTab: (tab: 'HOME' | 'CASES' | 'ALERTS' | 'PROFILE') => void;
  onOpenDailyReportModal: () => void;
  initialEmergencyId?: string | null;
  autoStartTracking?: boolean;
}

export const ReactionForceHome: React.FC<ReactionForceHomeProps> = ({
  onOpenEmergency,
  onOpenReportIncident,
  onNavigateTab,
  onOpenDailyReportModal,
  initialEmergencyId = null,
  autoStartTracking = false,
}) => {
  const { currentUser } = useAuth();
  const {
    emergencies,
    alerts,
    cases,
    updateClientLocation,
    activeEmergency,
    isPatrolActive,
    startPatrol,
    stopPatrol,
  } = useData();

  // Active Emergency Modal for launching personal panic if needed
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(isEmergencyModalOpen, () => setIsEmergencyModalOpen(false), 'rf-emergency-modal', 20);
  useBackButton(isNotificationModalOpen, () => setIsNotificationModalOpen(false), 'rf-notifications-modal', 20);

  // Active Emergency Context (either from WhatsApp link or ongoing active emergencies)
  const [targetEmergencyId, setTargetEmergencyId] = useState<string | null>(initialEmergencyId);

  // Live Location Tracking & Response State
  const [isResponding, setIsResponding] = useState<boolean>(autoStartTracking || !!initialEmergencyId);
  const [responseStatus, setResponseStatus] = useState<'STANDBY' | 'RESPONDING' | 'ON_SCENE' | 'PATROLLING'>(
    autoStartTracking || !!initialEmergencyId ? 'RESPONDING' : 'STANDBY'
  );
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [pingCount, setPingCount] = useState<number>(0);

  // Map view collapse toggle
  const [showFullMap, setShowFullMap] = useState<boolean>(true);

  // Filter open active emergencies from database
  const activeEmergencies = emergencies.filter((e) => e.status === 'ACTIVE' || e.status === 'IN_PROGRESS');

  // Currently focused emergency
  const targetedEmergency = targetEmergencyId
    ? emergencies.find((e) => e.id === targetEmergencyId) || (activeEmergencies.length > 0 ? activeEmergencies[0] : null)
    : activeEmergencies.length > 0
    ? activeEmergencies[0]
    : null;

  // Auto-stop tracking when the targeted emergency is resolved
  useEffect(() => {
    if (targetedEmergency) {
      if (targetedEmergency.status === 'RESOLVED' || targetedEmergency.status === 'CANCELLED') {
        if (isResponding) {
          setIsResponding(false);
          setResponseStatus('STANDBY');
        }
      }
    }
  }, [targetedEmergency?.status, isResponding]);

  // Geolocation streaming effect when responding
  useEffect(() => {
    let watchId: number | null = null;
    let intervalId: any = null;

    if (isResponding && targetedEmergency && targetedEmergency.status !== 'RESOLVED' && targetedEmergency.status !== 'CANCELLED') {
      if ('geolocation' in navigator) {
        // High accuracy GPS watcher
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = Math.round(pos.coords.accuracy || 10);

            setCurrentCoords({ latitude: lat, longitude: lng, accuracy: acc });
            setLastPingTime(new Date().toLocaleTimeString('en-ZA'));
            setPingCount((prev) => prev + 1);
            setGeoError(null);

            // Sync to emergency location tracking feed in DataContext
            if (targetedEmergency.id) {
              updateClientLocation(targetedEmergency.id, {
                latitude: lat,
                longitude: lng,
                accuracy: acc,
                quality: 'LIVE_STREAM',
              });
            }
          },
          (err) => {
            console.warn('GPS watch error:', err.message);
            setGeoError(err.message);
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );

        // Fallback simulation timer if static to guarantee continuous stream
        intervalId = setInterval(() => {
          setLastPingTime(new Date().toLocaleTimeString('en-ZA'));
        }, 10000);
      } else {
        setGeoError('GPS Geolocation not supported on this device');
      }
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isResponding, targetedEmergency?.id, targetedEmergency?.status, updateClientLocation]);

  // Handle Respond Button Click
  const handleStartResponding = (emergencyId?: string) => {
    if (emergencyId) setTargetEmergencyId(emergencyId);
    setIsResponding(true);
    setResponseStatus('RESPONDING');

    // Acquire immediate coordinate
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 10);
          setCurrentCoords({ latitude: lat, longitude: lng, accuracy: acc });
          setLastPingTime(new Date().toLocaleTimeString('en-ZA'));
          const emgId = emergencyId || targetedEmergency?.id;
          if (emgId) {
            updateClientLocation(emgId, {
              latitude: lat,
              longitude: lng,
              accuracy: acc,
              quality: 'LIVE_STREAM',
            });
          }
        },
        (err) => setGeoError(err.message),
        { enableHighAccuracy: true }
      );
    }
  };

  // Handle Stop Responding
  const handleStopResponding = () => {
    setIsResponding(false);
    setResponseStatus('STANDBY');
  };

  return (
    <div className="max-w-2xl mx-auto px-3.5 py-4 space-y-4 text-white">
      {/* 1. TOP RESPONDER STATUS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg flex-shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">
                {currentUser.name} {currentUser.surname}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                Reaction Force
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Unit: <strong className="text-emerald-400">{currentUser.callsign || 'Bravo-1 (4x4 Rapid Unit)'}</strong>
            </p>
          </div>
        </div>

        {/* Live GPS Beacon indicator & Patrol Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isPatrolActive) {
                stopPatrol();
              } else {
                startPatrol({
                  notes: 'Reaction Force Active Sector Patrol',
                  sector: currentUser.sector || 'Hartbeesfontein Sektor 2',
                });
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition shadow-sm ${
              isPatrolActive || isResponding
                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 ring-2 ring-emerald-500/40'
                : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-300'
            }`}
            title={
              isPatrolActive
                ? 'Patrol Active: Streaming live GPS to Control Room Operations Map. Click to stop.'
                : 'Start Active Patrol: Broadcast GPS coordinates to Control Room Operations Map.'
            }
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPatrolActive || isResponding
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider block">
                {isPatrolActive ? 'Patrol Beacon ON' : isResponding ? 'Responding Active' : 'Start Patrol'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block">
                {isPatrolActive ? 'Streaming to Ops Map' : 'Send location to Ops Map'}
              </span>
            </div>
            {/* Toggle switch visual */}
            <div
              className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 ml-1 ${
                isPatrolActive || isResponding ? 'bg-emerald-900 border border-emerald-400' : 'bg-slate-950 border border-slate-600'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full shadow-md transition-transform transform ${
                  isPatrolActive || isResponding ? 'translate-x-3 bg-emerald-400' : 'translate-x-0 bg-slate-400'
                }`}
              />
            </div>
          </button>

          {/* Quick Notification Settings Button */}
          <button
            type="button"
            onClick={() => setIsNotificationModalOpen(true)}
            className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-xs font-bold transition shadow-sm"
            title="Configure SOS, Traffic & Dispatch Tones"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Alert Klanke</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE SOS DISPATCH BANNER (FROM WHATSAPP DISPATCH) */}
      {targetedEmergency && (
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-2 border-red-500/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-md animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Active Emergency Dispatch</span>
            </span>
            <span className="text-xs font-mono text-red-300">
              #{targetedEmergency.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-white">
              {targetedEmergency.emergencyType} — {targetedEmergency.clientName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Farm / Property: <strong className="text-white">{targetedEmergency.farmName}</strong>
              {targetedEmergency.propertySnapshot.mainGateCode && (
                <> • Gate Code: <strong className="text-amber-400 font-mono">{targetedEmergency.propertySnapshot.mainGateCode}</strong></>
              )}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono">
                {targetedEmergency.location?.latitude != null ? Number(targetedEmergency.location.latitude).toFixed(6) : '-26.762800'}, {targetedEmergency.location?.longitude != null ? Number(targetedEmergency.location.longitude).toFixed(6) : '26.417200'}
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${targetedEmergency.location?.latitude ?? -26.7628},${targetedEmergency.location?.longitude ?? 26.4172}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline text-xs font-bold pl-1"
              >
                (Open Google Maps)
              </a>
            </p>
          </div>

          {/* Action Control: Respond & Stream GPS */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {!isResponding ? (
              <button
                type="button"
                onClick={() => handleStartResponding(targetedEmergency.id)}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl py-3.5 px-4 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-95 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Respond to SOS (Activate Live GPS Feed)</span>
              </button>
            ) : (
              <div className="flex-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResponseStatus('ON_SCENE')}
                  className={`flex-1 py-3 px-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                    responseStatus === 'ON_SCENE'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Mark On Scene</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopResponding}
                  className="py-3 px-4 bg-slate-800 hover:bg-red-950/80 text-red-300 hover:text-red-200 border border-red-500/30 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <Power className="w-4 h-4 text-red-400" />
                  <span>Stop GPS Feed</span>
                </button>
              </div>
            )}
          </div>

          {/* GPS Telemetry status */}
          {isResponding && (
            <div className="bg-slate-950/80 border border-emerald-500/30 p-3 rounded-2xl text-xs space-y-1 text-slate-300">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-emerald-400 font-bold">● Streaming live to Control Room Map</span>
                <span>Pings: {pingCount}</span>
              </div>
              {currentCoords && (
                <div className="text-[10px] text-slate-400 font-mono">
                  Current GPS: {currentCoords.latitude.toFixed(6)}, {currentCoords.longitude.toFixed(6)} (±{currentCoords.accuracy}m accuracy)
                </div>
              )}
              {geoError && <div className="text-[10px] text-amber-400">GPS Note: {geoError}</div>}
            </div>
          )}
        </div>
      )}

      {/* 3. CLIENT-STYLE PRIMARY PANIC BUTTON (FOR RESPONDER PERSONAL SAFETY) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="w-full relative group overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl p-5 shadow-xl border-2 border-red-400/80 active:scale-[0.98] transition flex items-center justify-center gap-3 text-center cursor-pointer"
        >
          <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
          <div className="text-left">
            <span className="block text-base sm:text-lg font-black tracking-wide uppercase">
              Emergency Panic Alert
            </span>
            <span className="block text-xs text-red-100 font-medium">
              1-Tap instant alarm to Control Room & WhatsApp Network
            </span>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onOpenReportIncident}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Report Incident</span>
          </button>

          <button
            onClick={onOpenDailyReportModal}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Patrol Check-In</span>
          </button>
        </div>
      </div>

      {/* 4. OPERATIONS MAP (LIVE FOR REACTION FORCE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Tactical Operations Map
            </h3>
          </div>
          <button
            onClick={() => setShowFullMap(!showFullMap)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <span>{showFullMap ? 'Collapse Map' : 'Expand Map'}</span>
            {showFullMap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showFullMap && (
          <div className="rounded-2xl overflow-hidden border border-slate-800 h-[500px]">
            <OperationsMap />
          </div>
        )}
      </div>

      {/* Emergency Trigger Modal */}
      {isEmergencyModalOpen && (
        <EmergencyActionModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      )}

      {/* Customizable Alert & Dispatch Notification Settings */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        isReactionForce={true}
      />
    </div>
  );
};
