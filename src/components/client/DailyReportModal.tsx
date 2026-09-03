import React from 'react';
import { FileText, X, Shield, Clock, CheckCircle2, AlertTriangle, Printer, Download } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useData } from '../../context/DataContext';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const { cases, alerts, situationReports } = useData();

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('en-ZA', { dateStyle: 'full' });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">{t.clientHome.dailyReport}</h2>
              <p className="text-[11px] text-slate-400">{today}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs space-y-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center space-y-1">
            <h3 className="font-bold text-white text-sm uppercase">Hartbeesfontein Veiligheid • 24h SitRep</h3>
            <p className="text-slate-400 text-xs">Consolidated Community Safety and Incident Overview</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-750">
              <span className="text-lg font-bold text-emerald-400 block">{situationReports.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Situations Logged</span>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-750">
              <span className="text-lg font-bold text-blue-400 block">{cases.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Cases</span>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-750">
              <span className="text-lg font-bold text-purple-400 block">{alerts.length}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Bulletins Issued</span>
            </div>
          </div>

          {/* Summary sections */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 uppercase text-[11px]">Recent Community Incidents & Notices</h4>
            <div className="space-y-2">
              {cases.slice(0, 4).map((c) => (
                <div key={c.id} className="bg-slate-800/60 p-3 rounded-xl border border-slate-750 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{c.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.caseNumber}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{c.description}</p>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>{c.locationName}</span>
                    <span className="text-emerald-400 uppercase font-bold">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export SitRep</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
