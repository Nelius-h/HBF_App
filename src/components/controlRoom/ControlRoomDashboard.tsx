import React, { useState, useEffect } from 'react';
import {
  Radio,
  AlertOctagon,
  AlertTriangle,
  FolderLock,
  Flame,
  Car,
  Clock,
  Plus,
  Shield,
  Search,
  Eye,
  CheckCircle2,
  Phone,
  PhoneCall,
  Lock,
  ChevronRight,
  RefreshCw,
  Users,
  Image as ImageIcon,
  Mic,
  Building,
  Map as MapIcon,
  MessageSquare,
  Volume2,
  VolumeX,
  BellRing,
  Crosshair,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyEvent, Case } from '../../types';
import { EmergencyDetailModal } from './EmergencyDetailModal';
import { OperationsMap } from './OperationsMap';
import { DispatchReactionForceWhatsAppModal } from './DispatchReactionForceWhatsAppModal';
import { ShiftChangeModal } from './ShiftChangeModal';
import { startSosContinuousAlarm, stopSosContinuousAlarm } from '../../services/soundEffects';

interface ControlRoomDashboardProps {
  onOpenSituationModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const ControlRoomDashboard: React.FC<ControlRoomDashboardProps> = ({
  onOpenSituationModal,
  onNavigateTab,
}) => {
  const { t } = useI18n();
  const { currentUser, allUsers } = useAuth();
  const {
    emergencies,
    cases,
    situationReports,
    bolos,
    auditLogs,
    emergencyContacts,
    areaGroups,
    resolveEmergency,
    resolveAllActiveEmergencies,
    recordFalseAlarm,
  } = useData();

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [dispatchReactionEmergencyId, setDispatchReactionEmergencyId] = useState<string | null>(null);
  const [showEmbeddedMap, setShowEmbeddedMap] = useState(true);
  const [isShiftChangeOpen, setIsShiftChangeOpen] = useState(false);

  // Dynamically resolve active emergency object from real-time context
  const selectedEmergency = emergencies.find((e) => e.id === selectedEmergencyId) || null;
  const dispatchReactionEmergency = emergencies.find((e) => e.id === dispatchReactionEmergencyId) || null;

  // Track which emergency consoles have been opened for the first time
  const [openedEmergencyIds, setOpenedEmergencyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sa_opened_emergency_consoles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAlarmSilenced, setIsAlarmSilenced] = useState(false);
  const [lastEmergenciesCount, setLastEmergenciesCount] = useState(0);

  // Total contacts
  const totalContactsCount = allUsers.length + emergencyContacts.length;

  // Active emergencies sorted: Unacknowledged first, oldest active next (Requirement 7)
  const activeEmergenciesList = emergencies
    .filter(
      (e) =>
        e.status !== 'SAFE' &&
        e.status !== 'FALSE_ALARM' &&
        e.status !== 'CLOSED'
    )
    .sort((a, b) => {
      const aUnack = a.status === 'TRIGGERED' || a.status === 'CONTROL_ROOM_NOTIFIED';
      const bUnack = b.status === 'TRIGGERED' || b.status === 'CONTROL_ROOM_NOTIFIED';
      if (aUnack && !bUnack) return -1;
      if (!aUnack && bUnack) return 1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

  // Reset silence when a new active emergency is detected
  useEffect(() => {
    if (activeEmergenciesList.length > lastEmergenciesCount) {
      setIsAlarmSilenced(false);
    }
    setLastEmergenciesCount(activeEmergenciesList.length);
  }, [activeEmergenciesList.length, lastEmergenciesCount]);

  // SOS Alarm Tone Logic:
  // Continuous alarm tone runs until console is opened for the first time. After that it's quiet.
  useEffect(() => {
    // Check if there are any active emergencies that have NOT been opened yet in the console
    const hasUnopenedActiveSos = activeEmergenciesList.some(
      (emg) => !openedEmergencyIds.includes(emg.id)
    );

    if (hasUnopenedActiveSos && !isAlarmSilenced && !selectedEmergency) {
      startSosContinuousAlarm();
    } else {
      stopSosContinuousAlarm();
    }

    return () => {
      stopSosContinuousAlarm();
    };
  }, [activeEmergenciesList, openedEmergencyIds, isAlarmSilenced, selectedEmergency]);

  const handleOpenEmergencyConsole = (emg: EmergencyEvent) => {
    // Mark this emergency as opened so alarm is quieted permanently for it
    if (!openedEmergencyIds.includes(emg.id)) {
      const updated = [...openedEmergencyIds, emg.id];
      setOpenedEmergencyIds(updated);
      try {
        localStorage.setItem('sa_opened_emergency_consoles', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    stopSosContinuousAlarm();
    setSelectedEmergencyId(emg.id);
  };

  const handleSilenceAlarm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAlarmSilenced(true);
    stopSosContinuousAlarm();
  };

  const openCases = cases.filter((c) => c.status !== 'closed');
  const activeBolos = bolos.filter((b) => b.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-3.5 py-4 space-y-4">
      {/* 1. DOMINANT ACTIVE EMERGENCY BANNER / CARDS (Requirement 7) */}
      {activeEmergenciesList.length > 0 && (
        <div className="space-y-3">
          <div className="bg-red-950/90 border border-red-500/60 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xl">
            <div className="flex items-center gap-2 text-red-200 text-xs font-bold">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span>
                {activeEmergenciesList.length} Active {activeEmergenciesList.length === 1 ? 'Emergency' : 'Emergencies'} Active Across Network
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Clear and stand down ALL active emergencies across all connected devices and consoles?')) {
                  resolveAllActiveEmergencies('Operator initiated system-wide all-clear');
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
              title="Clear all active alarms on all devices"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Stand Down All Alarms (All Devices)</span>
            </button>
          </div>

          {activeEmergenciesList.map((emg) => {
            const isUnack = emg.status === 'TRIGGERED' || emg.status === 'CONTROL_ROOM_NOTIFIED';
            const isUnopened = !openedEmergencyIds.includes(emg.id);
            return (
              <div
                key={emg.id}
                onClick={() => handleOpenEmergencyConsole(emg)}
                className={`text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                  isUnack
                    ? 'bg-gradient-to-r from-red-700 via-red-600 to-rose-700 border-red-300 animate-pulse'
                    : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-amber-500/70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-lg flex-shrink-0 ${
                      isUnack ? 'bg-white text-red-600 animate-bounce' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    <AlertOctagon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black uppercase ${
                          isUnack ? 'bg-black/40 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {isUnack ? 'UNACKNOWLEDGED EMERGENCY' : emg.status}
                      </span>
                      {isUnopened && isUnack && !isAlarmSilenced && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-black uppercase bg-red-950 text-red-200 border border-red-400 flex items-center gap-1 animate-pulse">
                          <BellRing className="w-3 h-3 text-red-400 animate-spin" />
                          <span>ALARM TONE ACTIVE</span>
                        </span>
                      )}
                      {emg.audioSession?.status === 'ACTIVE' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-black uppercase bg-red-950/90 text-red-200 border border-red-400 flex items-center gap-1 animate-pulse">
                          <Mic className="w-3 h-3 text-red-400" />
                          <span>Live Client Audio</span>
                        </span>
                      )}
                      <span className="text-xs text-red-100 font-semibold font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-red-300" />
                        <span>Activated: {new Date(emg.startTime).toLocaleDateString('en-ZA')} {new Date(emg.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </span>
                      {!isUnack && emg.acknowledgedBy && (
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-500/50 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Erken deur: {emg.acknowledgedBy.operatorName} ({new Date(emg.acknowledgedBy.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black uppercase mt-0.5">
                      {emg.farmName} — {emg.clientName} ({t.emergency.types[emg.emergencyType] || emg.emergencyType})
                    </h3>
                    <p className="text-xs text-slate-300">
                      Gate Code: <strong className="text-amber-400 font-mono text-sm">{emg.propertySnapshot.mainGateCode || 'None'}</strong> • Phone: <strong className="text-white font-mono">{emg.clientPhone}</strong> • Quality: <strong className="text-emerald-400 font-mono">{emg.location.quality}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {isUnopened && !isAlarmSilenced && (
                    <button
                      onClick={handleSilenceAlarm}
                      title="Silence alarm tone"
                      className="font-bold px-3 py-3 rounded-2xl text-xs uppercase bg-black/40 hover:bg-black/60 text-white border border-white/20 shadow-md transition flex items-center gap-1.5"
                    >
                      <VolumeX className="w-4 h-4 text-red-300" />
                      <span className="hidden sm:inline">Silence Alarm</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDispatchReactionEmergencyId(emg.id);
                    }}
                    className="w-full sm:w-auto font-black px-4 py-3 rounded-2xl text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>WhatsApp Reaction</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEmergencyConsole(emg);
                    }}
                    className={`w-full sm:w-auto font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition ${
                      isUnack
                        ? 'bg-white text-red-700 hover:bg-red-50'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    Open Dispatch Console
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Mark emergency for ${emg.clientName} as Safe & Resolved on client's behalf?`)) {
                        resolveEmergency(emg.id, {
                          notes: 'Resolved and marked safe directly by Control Room operator',
                          policeInvolved: false,
                          ambulanceInvolved: false,
                          reactionForceInvolved: true,
                          caseCreated: false,
                          followUpRequired: false,
                        });
                      }
                    }}
                    className="w-full sm:w-auto font-black px-4 py-3 rounded-2xl text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg transition flex items-center justify-center gap-1.5"
                    title="Quick Mark Safe / Resolve Emergency"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Safe</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Control Room Quick Operations Bar */}
      <div id="bar-cr-ops-actions" className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 id="hdr-cr-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{t.controlRoom.title}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Sector Operations • Logged in: <strong className="text-white">{currentUser.name} {currentUser.surname}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-cr-shift-change"
            data-ui-code="BTN-CR-SHIFT-CHANGE"
            onClick={() => setIsShiftChangeOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition relative"
            title="Wissel Beheerkamer Skof / Handover Shift to incoming operator"
          >
            <UserCheck className="w-4 h-4" />
            <span>Wissel Skof / Shift Change</span>
          </button>

          <button
            id="btn-cr-ops-map"
            data-ui-code="BTN-CR-OPS-MAP"
            onClick={() => onNavigateTab('MAP')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition relative"
          >
            <MapIcon className="w-4 h-4" />
            <span>Operations Map</span>
          </button>

          <button
            id="btn-cr-phonebook"
            data-ui-code="BTN-CR-PHONEBOOK"
            onClick={() => onNavigateTab('PHONEBOOK')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition relative"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Phone Book ({totalContactsCount})</span>
          </button>

          <a
            id="btn-cr-whatsapp-web"
            data-ui-code="BTN-CR-WHATSAPP-WEB"
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition relative"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Web</span>
          </a>

          <button
            id="btn-cr-cases"
            data-ui-code="BTN-CR-CASES"
            onClick={() => onNavigateTab('CASES')}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition active:scale-95 relative"
            title="Open Case & Investigation Tracker"
          >
            <FolderLock className="w-4 h-4" />
            <span>Case Tracker ({openCases.length})</span>
          </button>

          <button
            id="btn-cr-new-situation"
            data-ui-code="BTN-CR-NEW-SITUATION"
            onClick={onOpenSituationModal}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition relative"
          >
            <Plus className="w-4 h-4" />
            <span>{t.controlRoom.newSituationBtn}</span>
          </button>

          <button
            id="btn-cr-bolo"
            data-ui-code="BTN-CR-BOLO"
            onClick={() => onNavigateTab('BOLO')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition relative"
          >
            <Radio className="w-4 h-4" />
            <span>BOLO ({activeBolos.length})</span>
          </button>

          <button
            id="btn-cr-intelligence"
            data-ui-code="BTN-CR-INTELLIGENCE"
            onClick={() => onNavigateTab('INTELLIGENCE')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition border border-slate-700 relative"
          >
            <Lock className="w-4 h-4" />
            <span>Intelligence</span>
          </button>
        </div>
      </div>

      {/* Situational Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm ${
              activeEmergenciesList.length > 0
                ? 'bg-red-600/30 text-red-400 border-red-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {activeEmergenciesList.length}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.controlRoom.activeEmergencies}</span>
            <span className="text-sm font-bold text-white">
              {activeEmergenciesList.length === 0 ? 'Normal / Clear' : `${activeEmergenciesList.length} Active!`}
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('CASES')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm">
            {openCases.length}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">{t.controlRoom.openCases}</span>
            <span className="text-sm font-bold text-amber-300">{openCases.length} Active Track &gt;</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-sm">
            {activeBolos.length}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active BOLOs</span>
            <span className="text-sm font-bold text-white">{activeBolos.length} Lookouts</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('CASES')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
            {situationReports.length}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Situation Logs</span>
            <span className="text-sm font-bold text-white">{situationReports.length} Recorded (View All)</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('PHONEBOOK')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Book</span>
            <span className="text-sm font-bold text-emerald-400">{totalContactsCount} Contacts</span>
          </div>
        </div>
      </div>

      {/* Embedded Live Tactical Operations Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <MapIcon className="w-4 h-4 text-cyan-400" />
            <span>Live Sector Operations Map & Tactical GIS</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmbeddedMap(!showEmbeddedMap)}
              className="text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition"
            >
              {showEmbeddedMap ? 'Collapse Map' : 'Expand Map'}
            </button>
            <button
              onClick={() => onNavigateTab('MAP')}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <span>Full Screen View</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {showEmbeddedMap && (
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <OperationsMap />
          </div>
        )}
      </div>

      {/* Main Dashboard Two-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Live Open Cases & Incidents */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FolderLock className="w-4 h-4 text-blue-400" />
              <span>Priority Cases & Reports ({openCases.length})</span>
            </h3>
            <button
              onClick={() => onNavigateTab('CASES')}
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
            >
              <span>{t.common.all}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {openCases.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                No open cases currently logged.
              </div>
            ) : (
              openCases.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigateTab('CASES')}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 shadow-sm text-xs cursor-pointer transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">{c.caseNumber}</span>
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                        {t.incidents.categories[c.category] || c.category}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'open'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {t.cases.statusLabels[c.status]}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm line-clamp-1">{c.title}</h4>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{c.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1.5">
                      <span>{c.locationName}</span>
                      {((c.photos && c.photos.length > 0) || (c.evidence && c.evidence.length > 0)) && (
                        <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded flex items-center gap-1 font-semibold">
                          <ImageIcon className="w-2.5 h-2.5" />
                          <span>{(c.photos || c.evidence || []).length} photo{((c.photos || c.evidence || []).length === 1 ? '' : 's')}</span>
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('en-ZA')} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Immutable System Audit & Operator Activity */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{t.controlRoom.recentActivity}</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">UID Tracked</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 max-h-[420px] overflow-y-auto">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="text-xs border-b border-slate-800/80 pb-2 last:border-0 last:pb-0 space-y-0.5">
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="font-bold text-slate-200 truncate max-w-[150px]">{log.actorName}</span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 flex-shrink-0">
                    <Calendar className="w-2.5 h-2.5 text-slate-500" />
                    <span>{new Date(log.timestamp).toLocaleDateString('en-ZA')} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-300">
                    {log.action}
                  </span>
                  <span className="text-slate-400">• {log.recordType}</span>
                  {log.description && (
                    <span className="text-slate-500 text-[10px] truncate max-w-[140px] ml-auto">
                      {log.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Detail Modal Console */}
      {selectedEmergency && (
        <EmergencyDetailModal
          emergency={selectedEmergency}
          isOpen={!!selectedEmergency}
          onClose={() => setSelectedEmergencyId(null)}
        />
      )}

      {/* Reaction Force WhatsApp Dispatch Modal */}
      {dispatchReactionEmergency && (
        <DispatchReactionForceWhatsAppModal
          emergency={dispatchReactionEmergency}
          isOpen={!!dispatchReactionEmergency}
          onClose={() => setDispatchReactionEmergencyId(null)}
        />
      )}

      {/* Control Room Shift Change / Handover Modal */}
      <ShiftChangeModal
        isOpen={isShiftChangeOpen}
        onClose={() => setIsShiftChangeOpen(false)}
      />
    </div>
  );
};
