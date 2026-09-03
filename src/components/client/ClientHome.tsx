import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  AlertTriangle,
  FolderLock,
  FileText,
  Bell,
  User,
  Radio,
  ChevronRight,
  Info,
  Car,
  Clock,
  Sparkles,
  MapPin,
  Maximize2,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { EmergencyActionModal } from './EmergencyActionModal';
import { ClientActiveEmergencyView } from './ClientActiveEmergencyView';
import { ClientSitrepModal } from './ClientSitrepModal';
import { SituationReport } from '../../types';
import { useBackButton } from '../../hooks/useBackButton';

interface ClientHomeProps {
  onOpenEmergency: () => void;
  onOpenReportIncident: () => void;
  onNavigateTab: (tab: 'HOME' | 'CASES' | 'ALERTS' | 'PROFILE') => void;
  onOpenDailyReportModal: () => void;
  onOpenOperationsMap?: () => void;
}

export const ClientHome: React.FC<ClientHomeProps> = ({
  onOpenEmergency,
  onOpenReportIncident,
  onNavigateTab,
  onOpenDailyReportModal,
  onOpenOperationsMap,
}) => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const {
    alerts,
    cases,
    settings,
    activeEmergency,
    isPatrolActive,
    startPatrol,
    stopPatrol,
    situationReports,
  } = useData();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isStartingPatrol, setIsStartingPatrol] = useState(false);
  const [selectedSitrep, setSelectedSitrep] = useState<SituationReport | null>(null);

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(isEmergencyModalOpen, () => setIsEmergencyModalOpen(false), 'home-emergency-modal', 20);
  useBackButton(!!selectedSitrep, () => setSelectedSitrep(null), 'home-sitrep-modal', 20);

  const handleTogglePatrol = async () => {
    if (isPatrolActive) {
      stopPatrol();
    } else {
      setIsStartingPatrol(true);
      try {
        await startPatrol({
          notes: activeRole === 'REACTION_FORCE' ? 'Reaction Force Tactical Unit Patrol' : 'Member Area Patrol & Farm Watch Beacon',
          sector: currentUser.sector || 'Hartbeesfontein Sektor 2',
        });
      } finally {
        setIsStartingPatrol(false);
      }
    }
  };

  // If client has an active emergency, replace normal home with dominant EMERGENCY ACTIVE screen (Requirement 23)
  if (activeEmergency) {
    return <ClientActiveEmergencyView emergency={activeEmergency} />;
  }

  // Active non-private Situation Reports
  const publicSitreps = (situationReports || []).filter(
    (s) => !s.isPrivate && s.status !== 'archived'
  );

  // Unified community notice item structure
  interface CommunityNoticeItem {
    id: string;
    kind: 'SITREP' | 'ALERT';
    title: string;
    description: string;
    timestamp: string;
    location: string;
    category?: string;
    alertType?: string;
    priority?: string;
    sitrep?: SituationReport;
  }

  const allCommunityNotices: CommunityNoticeItem[] = [
    // Non-private SITREPs (Highest priority community intel)
    ...publicSitreps.map((s) => ({
      id: s.id,
      kind: 'SITREP' as const,
      title: `SITREP [${s.reportNumber}]`,
      description: s.description,
      timestamp: s.timestamp || s.createdAt,
      location: s.location,
      category: s.category,
      sitrep: s,
    })),
    // Critical, High & Active Alert Notifications
    ...alerts
      .filter(
        (a) =>
          !a.isClosed &&
          (a.priority === 'critical' ||
            a.priority === 'high' ||
            a.priority === 'medium' ||
            a.type === 'EMERGENCY' ||
            a.type === 'BOLO' ||
            a.type === 'FIRE' ||
            a.type === 'TRAFFIC' ||
            a.type === 'SECURITY_ALERT' ||
            a.type === 'COMMUNITY_NOTICE')
      )
      // Prevent duplicate if an alert was generated from the same sitrep ID
      .filter((a) => !publicSitreps.some((s) => a.id === `ALT-SIT-${s.id}` || a.alertNumber === `ALT-${s.reportNumber}`))
      .map((a) => ({
        id: a.id,
        kind: 'ALERT' as const,
        title: a.title,
        description: a.shortDescription,
        timestamp: a.publishedAt,
        location: a.location,
        alertType: a.type,
        priority: a.priority,
      })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const displayedNotices = allCommunityNotices.slice(0, 5);

  const openCasesCount = cases.filter(
    (c) =>
      (c.reportedByUid === currentUser.uid ||
        c.victimUid === currentUser.uid ||
        (c.assignedMemberUids && c.assignedMemberUids.includes(currentUser.uid)) ||
        (c.victimPhone && currentUser.primaryPhone && c.victimPhone.replace(/\D/g, '') === currentUser.primaryPhone.replace(/\D/g, ''))) &&
      c.status !== 'closed' &&
      c.status !== 'resolved'
  ).length;

  return (
    <div className="max-w-xl mx-auto px-3.5 py-4 space-y-4">
      {/* 1. DOMINANT PRIMARY EMERGENCY BUTTON */}
      <div className="pt-1">
        <button
          id="btn-client-sos"
          data-ui-code="BTN-CLIENT-SOS"
          onClick={() => setIsEmergencyModalOpen(true)}
          className="w-full relative group overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-red-400/80 active:scale-[0.98] transition duration-150 flex flex-col items-center justify-center text-center gap-2"
        >
          {/* Animated glow rings */}
          <span className="absolute -inset-1 rounded-3xl bg-red-500/30 blur-xl group-hover:bg-red-500/50 transition opacity-75 animate-pulse" />

          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center shadow-inner">
            <AlertOctagon className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-bounce" />
          </div>

          <div className="relative z-10">
            <span className="text-3xl sm:text-4xl font-black tracking-wider uppercase block drop-shadow-md">
              {t.emergency.emergencyButton}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-red-100 uppercase tracking-widest mt-1 block">
              {t.emergency.notifyControlRoom} / SAPS / EMS
            </span>
          </div>
        </button>
      </div>

      {/* Sector Status & Quick Farm Badge */}
      <div id="card-client-farm-info" className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-300 shadow-sm relative">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <span className="font-semibold text-white">{currentUser.farmName || 'Hartbeesfontein Plaas'}</span>
            <span className="text-slate-400 block text-[11px]">{currentUser.sector || 'Sektor 2 - Noord'}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-emerald-400 font-bold text-[11px] block">
            {settings.emergencyHotlinePhone}
          </span>
          <span className="text-[10px] text-slate-400">24/7 Beheerkamer</span>
        </div>
      </div>

      {/* REACTION FORCE / TACTICAL OPERATIONS MAP LINK BANNER */}
      {onOpenOperationsMap && (
        <div id="card-client-ops-map-banner" className="rounded-2xl p-4 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border border-cyan-500/50 ring-2 ring-cyan-500/20 shadow-xl relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 shadow-inner">
                <MapPin className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm tracking-wide uppercase">
                    Operations Map (GIS)
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Volskerm
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Reaksie-eenhede, DJI Matrice hommeltuig & intydse noodgevalle.
                </p>
              </div>
            </div>

            <button
              id="btn-client-ops-map"
              data-ui-code="BTN-CLIENT-OPS-MAP"
              type="button"
              onClick={onOpenOperationsMap}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition duration-150 cursor-pointer relative"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Maak Oop</span>
            </button>
          </div>
        </div>
      )}

      {/* MEMBER AREA PATROL TOGGLE CARD */}
      <div
        id="card-client-patrol-beacon"
        className={`rounded-2xl p-4 border transition-all duration-200 shadow-md relative ${
          isPatrolActive
            ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border-emerald-500 ring-2 ring-emerald-500/30'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                isPatrolActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-inner'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Radio className={`w-5 h-5 ${isPatrolActive ? 'animate-pulse text-emerald-400' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-sm">
                  {isPatrolActive ? 'Area Patrol Active' : 'Area Patrol Mode'}
                </span>
                {isPatrolActive && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Live Beacon ON
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isPatrolActive
                  ? 'Your live location is streaming to the Control Room Operations Map.'
                  : 'Toggle ON when doing neighborhood or farm watch patrols in your sector.'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            id="btn-client-patrol-toggle"
            data-ui-code="BTN-CLIENT-PATROL-TOGGLE"
            type="button"
            onClick={handleTogglePatrol}
            disabled={isStartingPatrol}
            className={`flex-shrink-0 relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isPatrolActive ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
            aria-label="Toggle patrol location feed"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                isPatrolActive ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. CLEAR ACTION CARDS / BUTTONS */}
      <div className="grid grid-cols-2 gap-3">
        {/* OPERATIONS MAP ACTION CARD FOR REACTION FORCE */}
        {onOpenOperationsMap && (
          <button
            id="btn-client-ops-map-card"
            data-ui-code="BTN-CLIENT-OPS-MAP-CARD"
            onClick={onOpenOperationsMap}
            className="bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-4 text-left shadow-md flex flex-col justify-between h-32 transition group relative"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight group-hover:text-cyan-400 transition">
                Operations Map
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                Volskerm taktiese GIS & drone
              </div>
            </div>
          </button>
        )}

        {/* REPORT INCIDENT */}
        <button
          id="btn-client-report-incident"
          data-ui-code="BTN-CLIENT-REPORT-INCIDENT"
          onClick={onOpenReportIncident}
          className="bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-700 hover:border-red-500/50 rounded-2xl p-4 text-left shadow-md flex flex-col justify-between h-32 transition group relative"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight group-hover:text-red-400 transition">
              {t.clientHome.reportIncident}
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              {t.clientHome.reportIncidentDesc}
            </div>
          </div>
        </button>

        {/* MY CASES */}
        <button
          id="btn-client-my-cases"
          data-ui-code="BTN-CLIENT-MY-CASES"
          onClick={() => onNavigateTab('CASES')}
          className="bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-4 text-left shadow-md flex flex-col justify-between h-32 transition group relative"
        >
          {openCasesCount > 0 && (
            <span className="absolute top-3 right-3 bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              {openCasesCount} Open
            </span>
          )}
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight group-hover:text-blue-400 transition">
              {t.clientHome.myCases}
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              {t.clientHome.myCasesDesc}
            </div>
          </div>
        </button>

        {/* DAILY REPORT */}
        <button
          id="btn-client-daily-report"
          data-ui-code="BTN-CLIENT-DAILY-REPORT"
          onClick={onOpenDailyReportModal}
          className="bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-2xl p-4 text-left shadow-md flex flex-col justify-between h-32 transition group relative"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight group-hover:text-emerald-400 transition">
              {t.clientHome.dailyReport}
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              {t.clientHome.dailyReportDesc}
            </div>
          </div>
        </button>

        {/* CURRENT ALERTS */}
        <button
          id="btn-client-alerts"
          data-ui-code="BTN-CLIENT-ALERTS"
          onClick={() => onNavigateTab('ALERTS')}
          className="bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-700 hover:border-rose-500/50 rounded-2xl p-4 text-left shadow-md flex flex-col justify-between h-32 transition group relative"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center group-hover:scale-105 transition">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight group-hover:text-rose-400 transition">
              {t.clientHome.currentAlerts}
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              {alerts.length} Active bulletins
            </div>
          </div>
        </button>

        {/* PROFILE */}
        <button
          id="btn-client-profile"
          data-ui-code="BTN-CLIENT-PROFILE"
          onClick={() => onNavigateTab('PROFILE')}
          className="bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-4 text-left shadow-md flex flex-col justify-between h-32 transition group relative"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight group-hover:text-purple-400 transition">
              {t.clientHome.myProfile}
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              {t.clientHome.myProfileDesc}
            </div>
          </div>
        </button>
      </div>

      {/* 3. ACTIVE COMMUNITY NOTICES */}
      <div className="space-y-2 pt-2">
        <div id="hdr-client-notices-bar" className="flex items-center justify-between px-1 relative">
          <h3 id="hdr-client-notices" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.clientHome.activeNotices}</span>
          </h3>
          <button
            id="btn-client-notices-all"
            data-ui-code="BTN-CLIENT-NOTICES-ALL"
            onClick={() => onNavigateTab('ALERTS')}
            className="text-[11px] text-emerald-400 font-semibold hover:underline flex items-center gap-0.5 relative"
          >
            <span>{t.common.all} ({allCommunityNotices.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {displayedNotices.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400">
            {t.clientHome.noActiveNotices}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedNotices.map((item) => {
              if (item.kind === 'SITREP' && item.sitrep) {
                const isFire = item.category === 'fire';
                const isTraffic =
                  item.category === 'road_incident' ||
                  item.category === 'traffic_alert' ||
                  item.category === 'traffic' ||
                  item.description?.toLowerCase().includes('verkeer') ||
                  item.description?.toLowerCase().includes('padversperring') ||
                  item.description?.toLowerCase().includes('mvo');
                const isTheft = item.category === 'theft' || item.category === 'stock_theft';
                
                return (
                  <div
                    key={`sitrep-${item.id}`}
                    id={`notice-sitrep-${item.id}`}
                    onClick={() => setSelectedSitrep(item.sitrep!)}
                    className={`bg-slate-900 rounded-2xl p-3.5 shadow-sm text-xs cursor-pointer transition flex items-start gap-3 relative group ${
                      isTraffic
                        ? 'border border-amber-500/40 hover:border-amber-400'
                        : isFire
                        ? 'border border-rose-500/40 hover:border-rose-400'
                        : 'border border-emerald-900/40 hover:border-emerald-500/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isFire
                          ? 'bg-rose-600 text-white'
                          : isTraffic
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : isTheft
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isFire && <Flame className="w-4 h-4" />}
                      {isTraffic && <Car className="w-4 h-4 text-slate-950" />}
                      {isTheft && <ShieldAlert className="w-4 h-4" />}
                      {!isFire && !isTraffic && !isTheft && <FileText className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${
                              isTraffic
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            SITREP
                          </span>
                          <span className="font-bold text-white text-xs truncate">
                            {item.location}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                        <span className="font-mono text-emerald-400/90">{item.sitrep.reportNumber}</span>
                        <span>•</span>
                        <span className="truncate text-amber-400/90">
                          {isTraffic ? 'Verkeer & Padversperring' : item.category?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Alert item
              return (
                <div
                  key={`alert-${item.id}`}
                  id={`notice-alert-${item.id}`}
                  onClick={() => onNavigateTab('ALERTS')}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 shadow-sm text-xs cursor-pointer transition flex items-start gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.alertType === 'EMERGENCY'
                        ? 'bg-red-600 text-white'
                        : item.alertType === 'BOLO'
                        ? 'bg-purple-600 text-white'
                        : item.alertType === 'FIRE'
                        ? 'bg-rose-600 text-white'
                        : item.alertType === 'SECURITY_ALERT'
                        ? 'bg-red-600 text-white'
                        : item.alertType === 'TRAFFIC'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {item.alertType === 'EMERGENCY' && <AlertOctagon className="w-4 h-4" />}
                    {item.alertType === 'BOLO' && <Radio className="w-4 h-4" />}
                    {item.alertType === 'FIRE' && <Flame className="w-4 h-4" />}
                    {item.alertType === 'SECURITY_ALERT' && <ShieldAlert className="w-4 h-4" />}
                    {item.alertType === 'TRAFFIC' && <Car className="w-4 h-4 text-slate-950" />}
                    {item.alertType !== 'EMERGENCY' &&
                      item.alertType !== 'BOLO' &&
                      item.alertType !== 'FIRE' &&
                      item.alertType !== 'SECURITY_ALERT' &&
                      item.alertType !== 'TRAFFIC' && <AlertTriangle className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white text-xs truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sitrep Details Modal for Clients */}
      <ClientSitrepModal
        isOpen={Boolean(selectedSitrep)}
        sitrep={selectedSitrep}
        onClose={() => setSelectedSitrep(null)}
        onSelectCase={(caseId) => {
          setSelectedSitrep(null);
          onNavigateTab('CASES');
        }}
      />

      {/* Emergency Action Trigger Modal */}
      <EmergencyActionModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};

