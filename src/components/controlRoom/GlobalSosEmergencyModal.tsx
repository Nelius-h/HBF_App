import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Phone,
  PhoneCall,
  MapPin,
  Clock,
  Radio,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  Shield,
  MessageSquare,
  ExternalLink,
  Flame,
  AlertTriangle,
  User,
  X,
  Navigation,
  Mic,
  Activity,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyEvent } from '../../types';
import { EmergencyDetailModal } from './EmergencyDetailModal';
import { DispatchReactionForceWhatsAppModal } from './DispatchReactionForceWhatsAppModal';
import {
  startSosContinuousAlarm,
  stopSosContinuousAlarm,
} from '../../services/soundEffects';

interface GlobalSosEmergencyModalProps {
  onNavigateTab?: (role: string, tab: string) => void;
}

export const GlobalSosEmergencyModal: React.FC<GlobalSosEmergencyModalProps> = ({
  onNavigateTab,
}) => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const {
    emergencies,
    allActiveEmergencies,
    acknowledgeEmergency,
    settings,
  } = useData();

  const [selectedEmergencyForDetail, setSelectedEmergencyForDetail] = useState<EmergencyEvent | null>(null);
  const [dispatchWhatsAppEmergency, setDispatchWhatsAppEmergency] = useState<EmergencyEvent | null>(null);
  const [isAlarmSilenced, setIsAlarmSilenced] = useState(false);
  const [lastTopEmergencyId, setLastTopEmergencyId] = useState<string | null>(null);
  const [dismissedEmergencyIds, setDismissedEmergencyIds] = useState<string[]>([]);

  // Field responders, management, reaction force, and maintenance staff receive global floating emergency popups.
  // Control Room operators manage emergencies directly from their dashboard with audible alarms and the dedicated dispatch console.
  const isEligibleForGlobalPopup =
    activeRole === 'MANAGEMENT' ||
    activeRole === 'REACTION_FORCE' ||
    activeRole === 'MAINTENANCE_CREW';

  // Find all active emergencies that have not been dismissed from the floating overlay
  const activeEmergencies = allActiveEmergencies.filter(
    (e) => !dismissedEmergencyIds.includes(e.id)
  );

  // Highest priority unacknowledged or active emergency
  const topEmergency = activeEmergencies[0] || null;

  // Unsilence alarm if a brand new emergency ID arrives
  useEffect(() => {
    if (topEmergency?.id && topEmergency.id !== lastTopEmergencyId) {
      setLastTopEmergencyId(topEmergency.id);
      setIsAlarmSilenced(false);
    }
  }, [topEmergency?.id, lastTopEmergencyId]);

  // SOS Continuous Alarm sound effect for field/management roles
  useEffect(() => {
    if (!isEligibleForGlobalPopup) {
      return;
    }

    const hasUnacknowledged = activeEmergencies.some(
      (e) => e.status === 'TRIGGERED' || e.status === 'CONTROL_ROOM_NOTIFIED'
    );

    if (hasUnacknowledged && !isAlarmSilenced && !selectedEmergencyForDetail) {
      startSosContinuousAlarm(0.85);
    } else {
      stopSosContinuousAlarm();
    }

    return () => {
      stopSosContinuousAlarm();
    };
  }, [activeEmergencies, isEligibleForGlobalPopup, isAlarmSilenced, selectedEmergencyForDetail]);

  if (!isEligibleForGlobalPopup || !topEmergency) {
    return (
      <>
        {selectedEmergencyForDetail && (
          <EmergencyDetailModal
            emergency={selectedEmergencyForDetail}
            isOpen={!!selectedEmergencyForDetail}
            onClose={() => setSelectedEmergencyForDetail(null)}
          />
        )}
        {dispatchWhatsAppEmergency && (
          <DispatchReactionForceWhatsAppModal
            emergency={dispatchWhatsAppEmergency}
            isOpen={!!dispatchWhatsAppEmergency}
            onClose={() => setDispatchWhatsAppEmergency(null)}
          />
        )}
      </>
    );
  }

  const isUnacknowledged =
    topEmergency.status === 'TRIGGERED' ||
    topEmergency.status === 'CONTROL_ROOM_NOTIFIED';

  const elapsedSec = Math.floor(
    (Date.now() - new Date(topEmergency.startTime).getTime()) / 1000
  );
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;
  const elapsedFormatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const handleAcknowledge = (e: React.MouseEvent) => {
    e.stopPropagation();
    acknowledgeEmergency(topEmergency.id);
    setIsAlarmSilenced(true);
    stopSosContinuousAlarm();
  };

  const handleOpenDetailModal = (emg: EmergencyEvent) => {
    setIsAlarmSilenced(true);
    stopSosContinuousAlarm();
    setSelectedEmergencyForDetail(emg);
  };

  const handleMuteAlarm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAlarmSilenced(true);
    stopSosContinuousAlarm();
  };

  const handleDismissOverlay = (e: React.MouseEvent, emgId: string) => {
    e.stopPropagation();
    setDismissedEmergencyIds((prev) => [...prev, emgId]);
    stopSosContinuousAlarm();
  };

  const emergencyTypeColors: Record<string, { bg: string; text: string; border: string; labelAf: string }> = {
    FARM_ATTACK: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500', labelAf: 'PLAASAANVAL' },
    MEDICAL: { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-500', labelAf: 'MEDIESE NOODGEVAL' },
    FIRE: { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-500', labelAf: 'VELDBRAND / VUUR' },
    SUSPICIOUS_ACTIVITY: { bg: 'bg-amber-500', text: 'text-slate-950', border: 'border-amber-400', labelAf: 'VERDAGTE AKTIWITEIT' },
    ROBBERY: { bg: 'bg-red-700', text: 'text-white', border: 'border-red-600', labelAf: 'ROOF / INBRAAK' },
    ACCIDENT: { bg: 'bg-orange-600', text: 'text-white', border: 'border-orange-500', labelAf: 'VOERTUIG ONGELUK' },
    GENERAL_PANIC: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500', labelAf: 'ALGEMENE PANIEK' },
  };

  const typeConfig = emergencyTypeColors[topEmergency.emergencyType] || {
    bg: 'bg-red-600',
    text: 'text-white',
    border: 'border-red-500',
    labelAf: topEmergency.emergencyType,
  };

  return (
    <>
      {/* High-priority Global Floating Emergency Modal for Control Room & Responders */}
      <div
        id="global-sos-emergency-popup"
        role="alertdialog"
        aria-live="assertive"
        className="fixed inset-x-2 sm:inset-x-auto sm:right-4 top-20 z-[100] sm:max-w-xl w-auto pointer-events-auto transition-all animate-bounce-short"
      >
        <div className="bg-slate-900/98 backdrop-blur-xl border-2 border-red-500/90 rounded-2xl shadow-2xl shadow-red-950/80 ring-4 ring-red-500/30 overflow-hidden text-slate-100">
          {/* Top Urgency Header */}
          <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 px-4 py-2.5 flex items-center justify-between text-white shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <AlertOctagon className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
                    🚨 NOODWAARSKUWING (SOS ALARM)
                  </span>
                  <span className="text-[10px] font-mono bg-black/40 text-red-200 px-2 py-0.5 rounded-full border border-white/20">
                    {elapsedFormatted}
                  </span>
                </div>
                <p className="text-[11px] text-red-100 font-medium">
                  {topEmergency.farmName} — {topEmergency.clientName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleMuteAlarm}
                className={`p-1.5 rounded-lg border transition text-xs flex items-center gap-1 font-bold ${
                  isAlarmSilenced
                    ? 'bg-slate-900/60 border-slate-700 text-slate-400'
                    : 'bg-white/20 border-white/40 text-white hover:bg-white/30'
                }`}
                title={isAlarmSilenced ? 'Sirene Gedemp' : 'Demp Sirene'}
              >
                {isAlarmSilenced ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                <span className="hidden xs:inline text-[10px]">
                  {isAlarmSilenced ? 'Gedemp' : 'Demp'}
                </span>
              </button>

              <button
                type="button"
                onClick={(e) => handleDismissOverlay(e, topEmergency.id)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/20 transition"
                title="Minimaliseer Waarskuwing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Information Card */}
          <div className="p-4 space-y-3.5 bg-slate-900/95">
            {/* Status & Type Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm flex items-center gap-1.5 ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{typeConfig.labelAf}</span>
              </span>

              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border font-mono ${
                  isUnacknowledged
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}
              >
                {isUnacknowledged ? '⚠️ WAG VIR ERKENNING' : `STATUS: ${topEmergency.status}`}
              </span>
            </div>

            {/* Client & Farm Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase">Lid / Kliënt:</span>
                </div>
                <p className="font-bold text-white text-sm">
                  {topEmergency.clientName}
                </p>
                <a
                  href={`tel:${topEmergency.clientPhone}`}
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{topEmergency.clientPhone}</span>
                </a>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-bold uppercase">Plaas / Ligging:</span>
                </div>
                <p className="font-bold text-white text-sm">
                  {topEmergency.farmName}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {topEmergency.sector || 'Hartbeesfontein Sektor'}
                </p>
              </div>
            </div>

            {/* GPS Coordinates & Accuracy */}
            <div className="flex items-center justify-between text-[11px] bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800/80 font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
                <span>
                  {topEmergency.location.latitude.toFixed(5)}, {topEmergency.location.longitude.toFixed(5)}
                </span>
              </div>
              <span className="text-slate-400 text-[10px]">
                Akkuraatheid: ±{topEmergency.location.accuracy || 10}m
              </span>
            </div>

            {/* Active Live Feeds Indicators */}
            <div className="flex items-center gap-2 text-[10px]">
              {topEmergency.audioSession?.status === 'ACTIVE' && (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold animate-pulse">
                  <Mic className="w-3 h-3 text-rose-400" />
                  <span>Lewendige Mikrofoon Aktief</span>
                </span>
              )}
              {topEmergency.locationSession?.isActive && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Lewendige GPS Spoor</span>
                </span>
              )}
            </div>

            {/* Action Buttons Toolbar */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {/* 1-Click Acknowledge */}
              {isUnacknowledged ? (
                <button
                  type="button"
                  id="btn-ack-sos-quick"
                  onClick={handleAcknowledge}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 transition active:scale-95 border border-emerald-400/50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aanvaar (1-Klik)</span>
                </button>
              ) : (
                <div className="w-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Erken deur Operateur</span>
                </div>
              )}

              {/* Open Full Emergency CAD Console */}
              <button
                type="button"
                id="btn-open-sos-console"
                onClick={() => handleOpenDetailModal(topEmergency)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50 transition active:scale-95 border border-red-400/50"
              >
                <Radio className="w-4 h-4" />
                <span>Beheerkamer Konsole</span>
              </button>

              {/* WhatsApp Dispatch */}
              <button
                type="button"
                id="btn-wa-sos-dispatch"
                onClick={() => setDispatchWhatsAppEmergency(topEmergency)}
                className="w-full xs:col-span-2 sm:col-span-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-green-950/50 transition active:scale-95 border border-green-400/50"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Reaksie</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedEmergencyForDetail && (
        <EmergencyDetailModal
          emergency={selectedEmergencyForDetail}
          isOpen={!!selectedEmergencyForDetail}
          onClose={() => setSelectedEmergencyForDetail(null)}
        />
      )}

      {dispatchWhatsAppEmergency && (
        <DispatchReactionForceWhatsAppModal
          emergency={dispatchWhatsAppEmergency}
          isOpen={!!dispatchWhatsAppEmergency}
          onClose={() => setDispatchWhatsAppEmergency(null)}
        />
      )}
    </>
  );
};
