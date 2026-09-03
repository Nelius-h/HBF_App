import React from 'react';
import {
  FileText,
  X,
  MapPin,
  Clock,
  Radio,
  Flame,
  Car,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Navigation,
  FolderOpen,
} from 'lucide-react';
import { SituationReport } from '../../types';
import { useBackButton } from '../../hooks/useBackButton';

interface ClientSitrepModalProps {
  sitrep: SituationReport | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
}

export const ClientSitrepModal: React.FC<ClientSitrepModalProps> = ({
  sitrep,
  isOpen,
  onClose,
  onSelectCase,
}) => {
  useBackButton(Boolean(isOpen && sitrep), onClose, 'client-sitrep-modal', 25);
  if (!isOpen || !sitrep) return null;

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'fire':
        return {
          icon: <Flame className="w-5 h-5 text-rose-400" />,
          label: 'Veldbrand / Brandgevaar (Fire Alert)',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        };
      case 'road_incident':
      case 'traffic_alert':
        return {
          icon: <Car className="w-5 h-5 text-amber-400" />,
          label: 'Padgevaar / Verkeersinsident (Traffic / Road Hazard)',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        };
      case 'stock_theft':
      case 'theft':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
          label: 'Misdaad / Diefstal (Security Alert)',
          bg: 'bg-red-500/10 border-red-500/30 text-red-300',
        };
      case 'suspicious_activity':
        return {
          icon: <Radio className="w-5 h-5 text-purple-400" />,
          label: 'Verdagte Beweging (Suspicious Activity)',
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-emerald-400" />,
          label: 'Situasierapport / Inligting (Community Intel)',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        };
    }
  };

  const catInfo = getCategoryInfo(sitrep.category);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="client-sitrep-detail-modal"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {sitrep.reportNumber}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  BEHEERKAMER SITREP
                </span>
              </div>
              <h3 className="text-base font-bold text-white truncate mt-0.5">
                Situasieverslag Kennisgewing
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Category Badge */}
          <div className={`p-3 rounded-2xl border flex items-center gap-3 ${catInfo.bg}`}>
            {catInfo.icon}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                Kategorie / Category
              </span>
              <span className="font-bold text-xs text-white">{catInfo.label}</span>
            </div>
          </div>

          {/* Time & Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Tyd Aangemeld
              </span>
              <span className="font-mono text-white text-xs font-semibold mt-1 block">
                {new Date(sitrep.timestamp).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>

            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Ligging / Sektor
              </span>
              <span className="text-white text-xs font-semibold mt-1 block truncate">
                {sitrep.location}
              </span>
            </div>
          </div>

          {/* GPS Location if available */}
          {sitrep.gpsLocation && sitrep.gpsLocation.latitude != null && (
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    GPS Koördinate
                  </span>
                  <span className="font-mono text-slate-200 text-xs font-bold">
                    {Number(sitrep.gpsLocation.latitude).toFixed(5)}, {Number(sitrep.gpsLocation.longitude).toFixed(5)}
                  </span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps?q=${sitrep.gpsLocation.latitude},${sitrep.gpsLocation.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/50 hover:bg-cyan-900 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Description */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Beskrywing / Situasie Besonderhede:
            </span>
            <p className="text-slate-200 leading-relaxed text-xs whitespace-pre-wrap">
              {sitrep.description}
            </p>
          </div>

          {/* Notes if any */}
          {sitrep.notes && (
            <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 text-slate-300 text-[11px] space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ekstra Notas / Opmerkings:
              </span>
              <p className="italic text-slate-300">{sitrep.notes}</p>
            </div>
          )}

          {/* Linked Case if any */}
          {sitrep.linkedCaseId && (
            <div className="bg-blue-950/30 border border-blue-800/40 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-blue-300 uppercase block">
                    Gekoppelde Saak
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {sitrep.linkedCaseId}
                  </span>
                </div>
              </div>

              {onSelectCase && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectCase(sitrep.linkedCaseId!);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 transition"
                >
                  <span>Bekyk Saak</span>
                </button>
              )}
            </div>
          )}

          {/* Verification Badge */}
          <div className="flex items-center gap-2 px-1 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Geverifieerde gemeenskapswaarskuwing uitgereik deur Hartbeesfontein Beheerkamer.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Sluit (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
