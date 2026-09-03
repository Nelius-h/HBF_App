import React, { useState } from 'react';
import {
  Bell,
  AlertOctagon,
  ShieldAlert,
  Radio,
  Flame,
  Car,
  FileText,
  CheckCircle2,
  MapPin,
  Clock,
  Eye,
  HandMetal,
  Check,
  Navigation,
  ShieldCheck,
  Send,
  X,
  Plus,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AlertType, AlertNotification, ResponderStatus, SituationReport } from '../../types';
import { ClientSitrepModal } from './ClientSitrepModal';
import { NotificationSettingsModal } from '../common/NotificationSettingsModal';
import { Sliders, Volume2 } from 'lucide-react';
import { useBackButton } from '../../hooks/useBackButton';

interface ClientAlertsProps {
  onSelectCase?: (caseId: string) => void;
}

export const ClientAlerts: React.FC<ClientAlertsProps> = ({ onSelectCase }) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const {
    alerts,
    acknowledgeAlert,
    communityAssistanceRequests,
    acknowledgeAssistanceRequest,
    submitBoloSighting,
    bolos,
    situationReports,
  } = useData();

  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSitrep, setSelectedSitrep] = useState<SituationReport | null>(null);

  // Sighting Modal State
  const [sightingModalBoloId, setSightingModalBoloId] = useState<string | null>(null);
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingDirection, setSightingDirection] = useState('');
  const [sightingDescription, setSightingDescription] = useState('');
  const [sightingPlate, setSightingPlate] = useState('');
  const [sightingSubmitting, setSightingSubmitting] = useState(false);
  const [sightingSuccess, setSightingSuccess] = useState(false);

  // Quick responder note state per request
  const [responderNotes, setResponderNotes] = useState<Record<string, string>>({});
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(!!selectedSitrep, () => setSelectedSitrep(null), 'alerts-sitrep-modal', 20);
  useBackButton(!!sightingModalBoloId, () => setSightingModalBoloId(null), 'alerts-sighting-modal', 20);
  useBackButton(isNotificationSettingsOpen, () => setIsNotificationSettingsOpen(false), 'alerts-notification-settings', 20);

  const publicSitreps = (situationReports || []).filter(
    (s) => !s.isPrivate && s.status !== 'archived'
  );

  const filteredAlerts =
    selectedType === 'ALL'
      ? alerts
      : selectedType === 'SITREP'
      ? []
      : alerts.filter((a) => a.type === selectedType);

  const filteredSitreps =
    selectedType === 'ALL' || selectedType === 'SITREP'
      ? publicSitreps
      : selectedType === 'FIRE'
      ? publicSitreps.filter((s) => s.category === 'fire')
      : selectedType === 'TRAFFIC'
      ? publicSitreps.filter((s) => s.category === 'road_incident' || s.category === 'traffic_alert')
      : [];

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'EMERGENCY':
        return <AlertOctagon className="w-5 h-5 text-white" />;
      case 'SECURITY_ALERT':
        return <ShieldAlert className="w-5 h-5 text-white" />;
      case 'BOLO':
        return <Radio className="w-5 h-5 text-white" />;
      case 'FIRE':
        return <Flame className="w-5 h-5 text-white" />;
      case 'TRAFFIC':
        return <Car className="w-5 h-5 text-slate-950" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const getAlertBadgeColor = (type: AlertType, priority: string) => {
    if (type === 'EMERGENCY' || priority === 'critical') return 'bg-red-600';
    if (type === 'BOLO') return 'bg-purple-600';
    if (type === 'FIRE') return 'bg-rose-600';
    if (type === 'TRAFFIC') return 'bg-amber-500';
    if (type === 'SECURITY_ALERT') return 'bg-blue-600';
    return 'bg-emerald-600';
  };

  const handleSightingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sightingModalBoloId) return;

    setSightingSubmitting(true);
    const targetBolo = bolos.find((b) => b.id === sightingModalBoloId);
    await submitBoloSighting({
      boloId: sightingModalBoloId,
      boloNumber: targetBolo?.boloNumber || 'BOLO',
      locationDescription: sightingLocation,
      directionOfTravel: sightingDirection,
      description: `${sightingDescription} ${sightingPlate ? `[Plate: ${sightingPlate}]` : ''}`.trim(),
    });
    setSightingSubmitting(false);
    setSightingSuccess(true);
    setTimeout(() => {
      setSightingSuccess(false);
      setSightingModalBoloId(null);
      setSightingLocation('');
      setSightingDirection('');
      setSightingDescription('');
      setSightingPlate('');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-3.5 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>{t.alerts.title}</span>
          </h2>
          <p className="text-xs text-slate-400">{t.alerts.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsNotificationSettingsOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500/40 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
        >
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Kennisgewings & Klanke</span>
          <span className="sm:hidden">Klank</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            selectedType === 'ALL'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.alerts.filterAll} ({alerts.length + publicSitreps.length})
        </button>
        <button
          onClick={() => setSelectedType('SITREP')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
            selectedType === 'SITREP'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>SITREPS ({publicSitreps.length})</span>
        </button>
        <button
          onClick={() => setSelectedType('EMERGENCY')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            selectedType === 'EMERGENCY'
              ? 'bg-red-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.alerts.types.EMERGENCY}
        </button>
        <button
          onClick={() => setSelectedType('BOLO')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            selectedType === 'BOLO'
              ? 'bg-purple-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.alerts.types.BOLO}
        </button>
        <button
          onClick={() => setSelectedType('FIRE')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            selectedType === 'FIRE'
              ? 'bg-rose-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.alerts.types.FIRE}
        </button>
        <button
          onClick={() => setSelectedType('TRAFFIC')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            selectedType === 'TRAFFIC'
              ? 'bg-amber-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.alerts.types.TRAFFIC}
        </button>
      </div>

      {/* Alert & Sitrep Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 && filteredSitreps.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            {t.alerts.noAlerts}
          </div>
        ) : (
          <>
            {/* SITREPS */}
            {filteredSitreps.map((sitrep) => {
              const isFire = sitrep.category === 'fire';
              const isTraffic = sitrep.category === 'road_incident' || sitrep.category === 'traffic_alert';
              const isCrime = sitrep.category === 'theft' || sitrep.category === 'stock_theft';

              return (
                <div
                  key={`sitrep-${sitrep.id}`}
                  className="bg-slate-900 border border-emerald-900/50 hover:border-emerald-500/40 rounded-2xl p-4 shadow-md text-xs space-y-3 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                          isFire
                            ? 'bg-rose-600 text-white'
                            : isTraffic
                            ? 'bg-amber-600 text-slate-950 font-bold'
                            : isCrime
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isFire && <Flame className="w-5 h-5" />}
                        {isTraffic && <Car className="w-5 h-5" />}
                        {isCrime && <ShieldAlert className="w-5 h-5" />}
                        {!isFire && !isTraffic && !isCrime && <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                            SITREP • {sitrep.reportNumber}
                          </span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                            BEHEERKAMER
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm leading-tight mt-0.5">
                          {sitrep.location}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sitrep.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                    {sitrep.description}
                  </p>

                  {sitrep.notes && (
                    <div className="text-slate-300 text-[11px] bg-slate-850 p-2.5 rounded-xl border border-slate-800 italic">
                      {sitrep.notes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{sitrep.location}</span>
                      </span>
                      {sitrep.linkedCaseId && (
                        <span className="font-mono text-blue-300">
                          Saak: {sitrep.linkedCaseId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {sitrep.linkedCaseId && onSelectCase && (
                        <button
                          type="button"
                          onClick={() => onSelectCase(sitrep.linkedCaseId!)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-950/60 border border-blue-700/50 hover:bg-blue-900 text-blue-300 text-[11px] font-semibold transition"
                        >
                          Bekyk Saak
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedSitrep(sitrep)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition"
                      >
                        Sien Besonderhede
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ALERTS */}
            {filteredAlerts.map((alert) => {
            const userAck = alert.acknowledgements?.find((a) => a.userUid === currentUser?.uid);
            const linkedRequest = alert.linkedAssistanceRequestId
              ? (communityAssistanceRequests || []).find((r) => r.id === alert.linkedAssistanceRequestId)
              : null;
            const myResponderRecord = linkedRequest?.responders?.find(
              (r) => r.userUid === currentUser?.uid
            );

            return (
              <div
                key={alert.id}
                className={`bg-slate-900 border rounded-2xl p-4 shadow-md text-xs space-y-3.5 transition ${
                  alert.priority === 'critical' || alert.type === 'EMERGENCY'
                    ? 'border-red-600/70 bg-red-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${getAlertBadgeColor(
                        alert.type,
                        alert.priority
                      )}`}
                    >
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {t.alerts.types[alert.type] || alert.type} • {alert.alertNumber}
                      </span>
                      <h3 className="font-bold text-white text-sm leading-tight">{alert.title}</h3>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.publishedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-slate-200 text-xs leading-relaxed">{alert.shortDescription}</p>
                {alert.fullMessage && alert.fullMessage !== alert.shortDescription && (
                  <p className="text-slate-300 text-[11px] bg-slate-800/60 p-2.5 rounded-xl border border-slate-750">
                    {alert.fullMessage}
                  </p>
                )}

                {/* Staging Point & Public Safe Warning for Linked Community Request */}
                {linkedRequest && (
                  <div className="space-y-2.5 pt-1">
                    {linkedRequest.isAllClear ? (
                      <div className="bg-emerald-950/80 border border-emerald-500 rounded-xl p-3 text-emerald-300 font-bold text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                        <span>{t.communityResponse.allClearNotice}</span>
                      </div>
                    ) : (
                      <>
                        {linkedRequest.safetyInstructions && (
                          <div className="bg-amber-950/50 border border-amber-800/70 rounded-xl p-3 text-amber-200 text-[11px] flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                            <div>
                              <strong className="block text-amber-300 font-bold">
                                {t.communityResponse.safetyInstructions}:
                              </strong>
                              <span>{linkedRequest.safetyInstructions}</span>
                            </div>
                          </div>
                        )}

                        {linkedRequest.stagingPoint && (
                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
                            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                              <MapPin className="w-3.5 h-3.5 text-blue-400" />
                              <span>
                                {t.communityResponse.stagingPointTitle}: {linkedRequest.stagingPoint.name}
                              </span>
                            </span>
                            {linkedRequest.stagingPoint.instructions && (
                              <p className="text-slate-400">{linkedRequest.stagingPoint.instructions}</p>
                            )}
                            {linkedRequest.stagingPoint.contactPerson && (
                              <p className="text-slate-400 font-mono text-[10px]">
                                {t.communityResponse.stagingContactPerson}:{' '}
                                {linkedRequest.stagingPoint.contactPerson}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Metadata & Deep links */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  {alert.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{alert.location}</span>
                    </span>
                  )}

                  {alert.type === 'BOLO' && alert.linkedBoloId && (
                    <button
                      onClick={() => setSightingModalBoloId(alert.linkedBoloId || null)}
                      className="bg-purple-900/60 hover:bg-purple-800 border border-purple-600/60 text-purple-200 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-300" />
                      <span>{t.communityResponse.sightingReportTitle}</span>
                    </button>
                  )}

                  {alert.linkedCaseId && onSelectCase && (
                    <button
                      onClick={() => onSelectCase(alert.linkedCaseId!)}
                      className="text-emerald-400 font-semibold underline cursor-pointer"
                    >
                      Saak #{alert.linkedCaseId}
                    </button>
                  )}
                </div>

                {/* Community Assistance Request Detailed Actions */}
                {linkedRequest && !linkedRequest.isAllClear && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">
                        {t.communityResponse.title} ({t.communityResponse.round} {linkedRequest.escalationRound}):
                      </span>
                      {myResponderRecord && (
                        <span className="bg-slate-800 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded-md border border-emerald-500/30">
                          {myResponderRecord.status}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        onClick={() =>
                          acknowledgeAssistanceRequest(
                            linkedRequest.id,
                            'CAN_ASSIST',
                            responderNotes[linkedRequest.id]
                          )
                        }
                        className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                          myResponderRecord?.status === 'CAN_ASSIST'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700'
                        }`}
                      >
                        <HandMetal className="w-3.5 h-3.5" />
                        <span>{t.communityResponse.statsCanAssist}</span>
                      </button>

                      <button
                        onClick={() =>
                          acknowledgeAssistanceRequest(
                            linkedRequest.id,
                            'RESPONDING',
                            responderNotes[linkedRequest.id]
                          )
                        }
                        className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition shadow-sm ${
                          myResponderRecord?.status === 'RESPONDING'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-700/40 hover:bg-emerald-600 text-emerald-200 border border-emerald-600/40'
                        }`}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{t.communityResponse.statsResponding}</span>
                      </button>

                      <button
                        onClick={() =>
                          acknowledgeAssistanceRequest(
                            linkedRequest.id,
                            'ON_SCENE',
                            responderNotes[linkedRequest.id]
                          )
                        }
                        className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                          myResponderRecord?.status === 'ON_SCENE'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.communityResponse.statsArrived}</span>
                      </button>

                      <button
                        onClick={() =>
                          acknowledgeAssistanceRequest(
                            linkedRequest.id,
                            'UNABLE',
                            responderNotes[linkedRequest.id]
                          )
                        }
                        className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition ${
                          myResponderRecord?.status === 'UNABLE'
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t.communityResponse.statsUnable}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Standard Acknowledgement Controls for Urgent Alerts without linked request */}
                {!linkedRequest && alert.requiresAck && (
                  <div className="pt-2 border-t border-slate-800/80">
                    {userAck ? (
                      <div className="bg-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-emerald-400 border border-emerald-500/30">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>
                            {t.alerts.acknowledgedAs} <strong>{userAck.status.replace(/_/g, ' ')}</strong>
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(userAck.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-300 block">
                          {t.alerts.acknowledgePrompt}
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => acknowledgeAlert(alert.id, 'SEEN')}
                            className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700 py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>{t.alerts.btnSeen}</span>
                          </button>

                          <button
                            onClick={() => acknowledgeAlert(alert.id, 'CAN_ASSIST')}
                            className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition"
                          >
                            <HandMetal className="w-3 h-3 text-blue-300" />
                            <span>{t.alerts.btnCanAssist}</span>
                          </button>

                          <button
                            onClick={() => acknowledgeAlert(alert.id, 'RESPONDING')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition shadow-sm"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t.alerts.btnResponding}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </>
        )}
      </div>

      {/* Sitrep Details Modal */}
      <ClientSitrepModal
        isOpen={Boolean(selectedSitrep)}
        sitrep={selectedSitrep}
        onClose={() => setSelectedSitrep(null)}
        onSelectCase={onSelectCase}
      />

      {/* Sighting Report Modal */}
      {sightingModalBoloId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>{t.communityResponse.sightingReportTitle}</span>
              </h3>
              <button
                onClick={() => setSightingModalBoloId(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sightingSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-500 rounded-xl p-4 text-center text-emerald-300 font-bold text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <span>{t.common.success}! Waarneming gestuur na Beheerkamer.</span>
              </div>
            ) : (
              <form onSubmit={handleSightingSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.communityResponse.sightingLocation} *
                  </label>
                  <input
                    type="text"
                    required
                    value={sightingLocation}
                    onChange={(e) => setSightingLocation(e.target.value)}
                    placeholder="bv. R503 km 12 naby silo's / Hoofhek"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {t.communityResponse.directionOfTravel}
                    </label>
                    <input
                      type="text"
                      value={sightingDirection}
                      onChange={(e) => setSightingDirection(e.target.value)}
                      placeholder="bv. Rigting Klerksdorp"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Gesiene Nommerplaat (indien enige)
                    </label>
                    <input
                      type="text"
                      value={sightingPlate}
                      onChange={(e) => setSightingPlate(e.target.value)}
                      placeholder="bv. NW 12345"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono uppercase outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {t.communityResponse.sightingDescription} *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={sightingDescription}
                    onChange={(e) => setSightingDescription(e.target.value)}
                    placeholder="Beskryf wat gesien is: aantal insittendes, spoed, klere, verdagte optrede..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSightingModalBoloId(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={sightingSubmitting}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sightingSubmitting ? 'Besig...' : t.communityResponse.submitSightingBtn}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Notification Preferences Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
      />
    </div>
  );
};

