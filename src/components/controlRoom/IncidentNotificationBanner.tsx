import React, { useState } from 'react';
import {
  AlertCircle,
  Phone,
  MessageSquare,
  CheckCircle2,
  X,
  ExternalLink,
  MapPin,
  Clock,
  User,
  Shield,
  Camera,
  Car,
  ChevronRight,
  BellRing,
  Volume2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { IncidentNotification } from '../../types';
import { getWhatsAppEmergencyLink } from '../../services/whatsappService';

interface IncidentNotificationBannerProps {
  onOpenCase?: (caseId: string) => void;
}

export const IncidentNotificationBanner: React.FC<IncidentNotificationBannerProps> = ({ onOpenCase }) => {
  const { t } = useI18n();
  const {
    incidentNotifications,
    acknowledgeIncidentNotification,
    dismissIncidentNotification,
    clearAllIncidentNotifications,
  } = useData();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Active unacknowledged notifications
  const unacknowledged = incidentNotifications.filter((n) => !n.isAcknowledged);

  if (incidentNotifications.length === 0) return null;

  return (
    <aside aria-label="Incident Alert Notifications" className="fixed bottom-4 right-4 z-[95] max-w-md w-full pointer-events-none flex flex-col gap-2.5">
      {incidentNotifications.slice(0, 3).map((notif) => {
        const isExpanded = expandedId === notif.id;
        const isUnack = !notif.isAcknowledged;
        const phone = notif.reportedByPhone || notif.victimPhone;

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto rounded-2xl shadow-2xl transition-all duration-300 border backdrop-blur-md overflow-hidden ${
              isUnack
                ? 'bg-slate-900/95 border-amber-500/80 shadow-amber-500/10 ring-2 ring-amber-500/40 animate-bounce-short'
                : 'bg-slate-900/90 border-slate-700/80'
            }`}
          >
            {/* Notification Header */}
            <div className="p-3.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUnack
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <BellRing className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isUnack
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {isUnack ? t.incidentNotifications.newIncidentAlert : t.incidentNotifications.acknowledgedBadge}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {notif.caseNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      • {notif.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {notif.title}
                  </h4>

                  <p className="text-[10px] text-slate-300 flex items-center gap-1.5 pt-0.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{notif.reportedByName}</span>
                    {notif.victimFarmName && (
                      <span className="text-amber-300 font-semibold">({notif.victimFarmName})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => dismissIncidentNotification(notif.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                title={t.incidentNotifications.dismiss}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Location & Time Sub-bar */}
            <div className="px-3.5 py-1.5 bg-slate-950/70 border-t border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{notif.locationName || notif.sector}</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-slate-400 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span>{notif.incidentTime || new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            </div>

            {/* Expanded Detailed View */}
            {isExpanded && (
              <div className="p-3.5 bg-slate-950/90 text-xs space-y-2.5 border-b border-slate-800 animate-fade-in">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {notif.description}
                </p>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {notif.photosCount > 0 && (
                    <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>{notif.photosCount} Evidence Photos</span>
                    </span>
                  )}
                  {notif.vehicleSummary && (
                    <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      <span>{notif.vehicleSummary}</span>
                    </span>
                  )}
                  {notif.sapsCaseNumber && (
                    <span className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      SAPS: {notif.sapsCaseNumber}
                    </span>
                  )}
                </div>

                {/* Direct Contact Actions */}
                {phone && (
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`tel:${phone}`}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t.incidentNotifications.callMember}</span>
                    </a>
                    <a
                      href={getWhatsAppEmergencyLink(
                        phone,
                        `Control Room regarding Incident Case ${notif.caseNumber} (${notif.title}): We have received your report.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.incidentNotifications.whatsappMember}</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Action Footer */}
            <div className="p-2.5 bg-slate-900 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : notif.id)}
                className="text-[11px] text-slate-400 hover:text-white font-semibold flex items-center gap-1 px-2 py-1 rounded transition"
              >
                <span>{isExpanded ? 'Less' : 'Details'}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              <div className="flex items-center gap-1.5">
                {isUnack && (
                  <button
                    type="button"
                    onClick={() => acknowledgeIncidentNotification(notif.id)}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow flex items-center gap-1 active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.incidentNotifications.acknowledge}</span>
                  </button>
                )}

                {onOpenCase && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isUnack) acknowledgeIncidentNotification(notif.id);
                      onOpenCase(notif.caseId);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow flex items-center gap-1 active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t.incidentNotifications.viewCaseDetails}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Clear All Option if multiple */}
      {incidentNotifications.length > 1 && (
        <div className="flex justify-end pointer-events-auto">
          <button
            type="button"
            onClick={clearAllIncidentNotifications}
            className="text-[10px] text-slate-400 hover:text-red-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 transition"
          >
            {t.incidentNotifications.clearAll} ({incidentNotifications.length})
          </button>
        </div>
      )}
    </aside>
  );
};
