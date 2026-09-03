import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Radio,
  Send,
  Camera,
  Shield,
  HeartPulse,
  Flame,
  RotateCw,
  X,
  ExternalLink,
  MessageSquare,
  Mic,
  Navigation,
  VolumeX,
  Smartphone,
  WifiOff,
  Lock,
  MessageCircle,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyEvent, LocationQuality } from '../../types';
import { emergencyAudioService } from '../../services/emergencyAudioService';
import { LiveAudioConsole } from '../common/LiveAudioConsole';
import { LiveLocationMapTracker } from '../common/LiveLocationMapTracker';
import { EmergencyMessageChannel } from '../common/EmergencyMessageChannel';

interface ClientActiveEmergencyViewProps {
  emergency: EmergencyEvent;
}

export const ClientActiveEmergencyView: React.FC<ClientActiveEmergencyViewProps> = ({ emergency }) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const {
    updateClientLocation,
    addClientInfo,
    recordFalseAlarm,
    resolveEmergency,
    settings,
  } = useData();

  // Active sub-tab for client tools
  const [activeClientTab, setActiveClientTab] = useState<'ACTIONS' | 'AUDIO_LOCATION' | 'MESSAGES'>('ACTIONS');

  // Elapsed timer state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    return Math.floor((Date.now() - new Date(emergency.startTime).getTime()) / 1000);
  });

  // 1-minute automatic GPS location broadcasting countdown & heartbeat ticker
  const [nextLocationUpdateIn, setNextLocationUpdateIn] = useState<number>(60);
  const [lastLocationUpdateTime, setLastLocationUpdateTime] = useState<string>(
    emergency.location.timestamp || new Date().toISOString()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - new Date(emergency.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [emergency.startTime]);

  // Auto-start and keep microphone capture alive during active emergency
  useEffect(() => {
    if (
      emergency.status === 'SAFE' ||
      emergency.status === 'FALSE_ALARM' ||
      emergency.status === 'CLOSED'
    ) {
      return;
    }

    if (emergency.audioSession?.status === 'ACTIVE' && !emergencyAudioService.getIsTransmitting()) {
      emergencyAudioService.startMicrophoneCapture(emergency.id);
    }
  }, [emergency.id, emergency.status, emergency.audioSession?.status]);

  // Immediate high-accuracy GPS fix & continuous live position watch
  useEffect(() => {
    if (
      emergency.status === 'SAFE' ||
      emergency.status === 'FALSE_ALARM' ||
      emergency.status === 'CLOSED'
    ) {
      return;
    }

    let watchId: number | null = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      // 1. Instant fix attempt
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateClientLocation(emergency.id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 10),
            quality: 'CURRENT_GPS',
            notes: 'Onmiddellike foon GPS fix',
          });
          setLastLocationUpdateTime(new Date().toISOString());
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );

      // 2. Continuous real-time movement watch
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            updateClientLocation(emergency.id, {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy || 10),
              quality: 'CURRENT_GPS',
              notes: 'Foon lewendige GPS spoor',
            });
            setLastLocationUpdateTime(new Date().toISOString());
          },
          () => {},
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
        );
      } catch {
        // ignore
      }
    }

    // 3. Countdown timer for next periodic location transmission
    const countdownInterval = setInterval(() => {
      setNextLocationUpdateIn((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    // 4. Periodic 30-second heartbeat location sync
    const locationInterval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await updateClientLocation(emergency.id, {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy || 10),
              quality: 'CURRENT_GPS',
              notes: 'Periodieke nood GPS uitsending',
            });
            setLastLocationUpdateTime(new Date().toISOString());
            setNextLocationUpdateIn(60);
          },
          async () => {
            // Keep fresh timestamp alive if stationary
            await updateClientLocation(emergency.id, {
              latitude: emergency.location.latitude,
              longitude: emergency.location.longitude,
              accuracy: emergency.location.accuracy || 10,
              quality: 'CURRENT_GPS',
              notes: 'Periodieke nood GPS hartklop',
            });
            setLastLocationUpdateTime(new Date().toISOString());
            setNextLocationUpdateIn(60);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
      }
    }, 30000);

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(countdownInterval);
      clearInterval(locationInterval);
    };
  }, [emergency.id, emergency.status, emergency.location.latitude, emergency.location.longitude, updateClientLocation]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Modals state
  const [isAddInfoOpen, setIsAddInfoOpen] = useState(false);
  const [infoText, setInfoText] = useState('');
  const [isFalseAlarmOpen, setIsFalseAlarmOpen] = useState(false);
  const [falseAlarmReason, setFalseAlarmReason] = useState('');
  const [isSafeConfirmOpen, setIsSafeConfirmOpen] = useState(false);
  const [safeNotes, setSafeNotes] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const handleAddInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoText.trim()) return;
    await addClientInfo(emergency.id, infoText.trim());
    setInfoText('');
    setIsAddInfoOpen(false);
    setStatusFeedback(t.emergency.infoAddedMsg);
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleFalseAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordFalseAlarm(emergency.id, falseAlarmReason || 'Client marked false alarm');
    setIsFalseAlarmOpen(false);
  };

  const handleSafeConfirm = () => {
    resolveEmergency(emergency.id, {
      notes: safeNotes || 'Client confirmed safe from active emergency view',
      policeInvolved: false,
      ambulanceInvolved: false,
      reactionForceInvolved: false,
      caseCreated: false,
      followUpRequired: false,
    });
    setIsSafeConfirmOpen(false);
  };

  const isAcknowledged = emergency.status !== 'TRIGGERED' && emergency.status !== 'CONTROL_ROOM_NOTIFIED';

  return (
    <div className="max-w-xl mx-auto px-3.5 py-4 space-y-4 text-white">
      {/* 1. DOMINANT ACTIVE EMERGENCY BANNER */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-rose-700 rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-red-400 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
            <span className="text-xs font-black tracking-widest uppercase bg-black/30 px-2.5 py-0.5 rounded-full">
              {t.emergency.activeEmergencyTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-black text-sm bg-black/40 px-3 py-1 rounded-xl">
            <Clock className="w-4 h-4 text-red-200" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
            {t.emergency.types[emergency.emergencyType] || emergency.emergencyType}
          </h1>
          <p className="text-xs text-red-100 font-semibold mt-0.5">
            {emergency.farmName} • {emergency.sector}
          </p>
        </div>

        {/* ACKNOWLEDGEMENT STATUS (Requirement 10) */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
            isAcknowledged
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100'
              : 'bg-black/30 border-red-300/40 text-red-100 animate-pulse'
          }`}
        >
          {isAcknowledged ? (
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-black flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-black flex-shrink-0">
              <Radio className="w-5 h-5 animate-spin" />
            </div>
          )}

          <div>
            <span className="text-xs font-black uppercase block tracking-wide">
              {isAcknowledged
                ? t.emergency.crAcknowledgedHeader
                : t.emergency.crWaitingHeader}
            </span>
            <span className="text-[11px] opacity-90 block mt-0.5">
              {isAcknowledged && emergency.acknowledgedBy
                ? `${t.emergency.acknowledgedAt} ${new Date(
                    emergency.acknowledgedBy.timestamp
                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Control Room operators have been alerted and dispatched to this event.'}
            </span>
          </div>
        </div>

        {/* BACKGROUND & LOCK-SCREEN CONTINUOUS TRACKING ACTIVE BADGE */}
        <div className="bg-slate-950/90 border border-emerald-500/50 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-emerald-300 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Agtergrond- en Sluitskerm Noodsein Aktief
              </span>
              <p className="text-[10px] text-slate-300">
                U kan u foon toesluit of in u sak sit — GPS &amp; mikrofoon stroom ononderbroke voort.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-700/50 shrink-0">
            WAKELOCK
          </span>
        </div>

        {/* LIVE 1-MINUTE AUTOMATIC LOCATION BROADCAST BANNER */}
        <div className="bg-slate-950/80 border-2 border-emerald-400/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-slate-950 flex items-center justify-center font-black shadow flex-shrink-0">
              <Navigation className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <span className="font-black uppercase tracking-wider text-emerald-300 text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                1-Min GPS Location Broadcast Active
              </span>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                Next transmission in <strong className="text-white font-mono">{nextLocationUpdateIn}s</strong> • Live on Operations Map
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveClientTab('AUDIO_LOCATION')}
            className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400 text-emerald-200 text-[10px] font-bold rounded-xl whitespace-nowrap transition"
          >
            Track Trail
          </button>
        </div>

        {/* LIVE MICROPHONE ACTIVE STATUS BANNER */}
        {emergency.audioSession?.status === 'ACTIVE' && (
          <div className="bg-slate-950/80 border-2 border-red-400/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow flex-shrink-0">
                <Mic className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="font-black uppercase tracking-wider text-red-200 text-[11px] block">
                  Live Microphone Streaming to Control Room
                </span>
                <span className="text-[10px] text-slate-300 block">
                  Surroundings audio is transmitting live • Level: {emergency.audioSession.audioLevel || 35}%
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveClientTab('AUDIO_LOCATION')}
              className="px-3 py-1.5 bg-red-600/40 hover:bg-red-600/60 border border-red-400 text-white text-[10px] font-bold rounded-xl whitespace-nowrap transition"
            >
              View Feed &amp; Map
            </button>
          </div>
        )}
      </div>

      {/* Status Feedback Toast */}
      {statusFeedback && (
        <div className="bg-emerald-600 border border-emerald-400 text-white text-xs font-bold p-3 rounded-2xl text-center shadow-lg animate-bounce">
          {statusFeedback}
        </div>
      )}

      {/* Navigation tabs for Emergency Tools */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveClientTab('ACTIONS')}
          className={`py-2 rounded-xl text-xs font-bold uppercase transition ${
            activeClientTab === 'ACTIONS'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Direct Help
        </button>

        <button
          onClick={() => setActiveClientTab('AUDIO_LOCATION')}
          className={`py-2 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1 transition ${
            activeClientTab === 'AUDIO_LOCATION'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Audio &amp; Map</span>
        </button>

        <button
          onClick={() => setActiveClientTab('MESSAGES')}
          className={`py-2 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1 transition ${
            activeClientTab === 'MESSAGES'
              ? 'bg-red-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Silent / Msg</span>
        </button>
      </div>

      {/* TAB 1: DIRECT ACTIONS */}
      {activeClientTab === 'ACTIONS' && (
        <div className="space-y-3">
          {/* Action 1: CALL CONTROL ROOM */}
          <a
            href={`tel:${settings.emergencyHotlinePhone.replace(/[^0-9+]/g, '')}`}
            className="w-full bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border-2 border-slate-700 hover:border-slate-600 text-white rounded-2xl p-4 flex items-center justify-between font-bold text-xs shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm uppercase block font-black">{t.emergency.callControlRoomBtn}</span>
                <span className="text-[11px] text-slate-400 font-normal">{settings.emergencyHotlinePhone}</span>
              </div>
            </div>
            <span className="text-[11px] text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800">
              Direct Line
            </span>
          </a>

          {/* Action 2: I CAN'T SPEAK / SILENT EMERGENCY */}
          <button
            onClick={() => setActiveClientTab('MESSAGES')}
            className="w-full bg-gradient-to-r from-purple-950/80 to-slate-900 hover:from-purple-900 border-2 border-purple-500/50 text-white rounded-2xl p-4 flex items-center justify-between font-bold text-xs shadow-md transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-400/40 flex items-center justify-center">
                <VolumeX className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm uppercase block font-black text-purple-200">
                  I Can't Speak / Silent Mode
                </span>
                <span className="text-[11px] text-slate-300 font-normal">
                  One-tap preset alerts (Intruders inside, Shots fired, Family hiding)
                </span>
              </div>
            </div>
          </button>

          {/* Action 3: ZERO COVERAGE DIRECT SMS BACKUP (Works without mobile data) */}
          <a
            href={`sms:${settings.emergencyHotlinePhone}?body=${encodeURIComponent(
              `NOODSEIN! Plaas: ${emergency.farmName}, Nood: ${emergency.emergencyType}, GPS: ${emergency.location.latitude.toFixed(5)},${emergency.location.longitude.toFixed(5)} (${emergency.clientName})`
            )}`}
            className="w-full bg-gradient-to-r from-amber-950/80 to-slate-900 hover:from-amber-900 border border-amber-500/50 text-white rounded-2xl p-3.5 flex items-center justify-between font-bold text-xs shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs uppercase block font-black text-amber-200">
                  Stuur Direkte Nood-SMS (Sonder Data / 0-Dekking)
                </span>
                <span className="text-[10px] text-slate-300 font-normal">
                  Stuur GPS-koördinate per sellulêre SMS direk na beheerkamer
                </span>
              </div>
            </div>
            <span className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-700/50 shrink-0">
              SMS
            </span>
          </a>

          {/* Action 3 & 4: I AM SAFE / FALSE ALARM */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => setIsSafeConfirmOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl p-4 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-lg transition"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="uppercase font-black">{t.emergency.iAmSafeBtn}</span>
            </button>

            <button
              onClick={() => setIsFalseAlarmOpen(true)}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-2xl p-4 font-bold text-xs flex flex-col items-center justify-center gap-1 border border-slate-700 transition"
            >
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span className="uppercase font-black">{t.emergency.falseAlarmBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE AUDIO & LOCATION STREAM */}
      {activeClientTab === 'AUDIO_LOCATION' && (
        <div className="space-y-4">
          <LiveAudioConsole emergency={emergency} isClientView={true} />
          <LiveLocationMapTracker emergency={emergency} isClientView={true} />
        </div>
      )}

      {/* TAB 3: SILENT PRESETS & MESSAGING */}
      {activeClientTab === 'MESSAGES' && (
        <div className="space-y-4">
          <EmergencyMessageChannel emergency={emergency} isClientView={true} />
        </div>
      )}

      {/* MODAL: FALSE ALARM (Requirement 21) */}
      {isFalseAlarmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleFalseAlarmSubmit}
            className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-sm">{t.emergency.falseAlarmTitle}</h3>
              <button
                type="button"
                onClick={() => setIsFalseAlarmOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              Please provide a short reason for standing down. The emergency log is safely archived for audit compliance.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason for cancellation:</label>
              <input
                type="text"
                required
                value={falseAlarmReason}
                onChange={(e) => setFalseAlarmReason(e.target.value)}
                placeholder={t.emergency.falseAlarmReasonPlaceholder}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsFalseAlarmOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg"
              >
                Confirm False Alarm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: SAFE CONFIRMATION (Requirement 22) */}
      {isSafeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-emerald-400 text-sm">Confirm Safety & Close Event</h3>
              <button
                type="button"
                onClick={() => setIsSafeConfirmOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              Are you and all family members safe? This will mark the active emergency resolved and notify the Control Room.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Closing notes (Optional):</label>
              <input
                type="text"
                value={safeNotes}
                onChange={(e) => setSafeNotes(e.target.value)}
                placeholder="e.g. Threat cleared, all family members accounted for..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSafeConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSafeConfirm}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
              >
                Confirm I Am Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

