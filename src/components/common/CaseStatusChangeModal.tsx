import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Activity,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Case, CaseStatus } from '../../types';
import { useI18n } from '../../i18n/I18nContext';
import { useBackButton } from '../../hooks/useBackButton';

interface CaseStatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: Case | null;
  targetStatus: CaseStatus | null;
  onConfirm: (caseId: string, newStatus: CaseStatus, note?: string) => void;
  isManagement?: boolean;
}

export const CaseStatusChangeModal: React.FC<CaseStatusChangeModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  targetStatus,
  onConfirm,
}) => {
  const { t } = useI18n();
  useBackButton(Boolean(isOpen && caseItem && targetStatus), onClose, 'case-status-change-modal', 30);
  const [statusNote, setStatusNote] = useState('');
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !caseItem || !targetStatus) return null;

  const currentStatus = caseItem.status;

  const STATUS_DETAILS: Record<
    CaseStatus,
    {
      label: string;
      color: string;
      bg: string;
      border: string;
      icon: any;
      description: string;
    }
  > = {
    open: {
      label: 'Open / Logged',
      color: 'text-blue-400',
      bg: 'bg-blue-950/60',
      border: 'border-blue-500/40',
      icon: Clock,
      description: 'Newly logged incident awaiting officer or detective allocation.',
    },
    investigating: {
      label: 'Under Investigation',
      color: 'text-amber-300',
      bg: 'bg-amber-950/60',
      border: 'border-amber-500/50',
      icon: Search,
      description: 'Active field inquiry, witness follow-ups, or detective work in progress.',
    },
    action_pending: {
      label: 'Action Pending',
      color: 'text-purple-300',
      bg: 'bg-purple-950/60',
      border: 'border-purple-500/40',
      icon: Activity,
      description: 'Docket awaiting SAPS CAS feedback, court proceedings, or forensic results.',
    },
    resolved: {
      label: 'Resolved',
      color: 'text-emerald-300',
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-500/40',
      icon: CheckCircle2,
      description: 'Apprehensions made, property recovered, or inquiry successfully resolved.',
    },
    closed: {
      label: 'Closed / Concluded',
      color: 'text-slate-300',
      bg: 'bg-slate-800',
      border: 'border-slate-600',
      icon: Lock,
      description: 'Docket concluded, audited, and archived in historical Plaaswag archives.',
    },
  };

  const currentMeta = STATUS_DETAILS[currentStatus] || STATUS_DETAILS.open;
  const targetMeta = STATUS_DETAILS[targetStatus] || STATUS_DETAILS.open;

  const CurrentIcon = currentMeta.icon;
  const TargetIcon = targetMeta.icon;

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasConfirmedCheckbox) return;

    setIsSubmitting(true);
    try {
      onConfirm(caseItem.id, targetStatus, statusNote.trim());
      setStatusNote('');
      setHasConfirmedCheckbox(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Confirm Status Transition
              </h2>
              <p className="text-[11px] text-slate-300">
                Double confirmation verification for docket audit trail
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleApply} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Case Identifier Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                {caseItem.caseNumber}
              </span>
              <span className="text-slate-300 capitalize bg-slate-800 px-2 py-0.5 rounded">
                {caseItem.category.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white line-clamp-1 pt-1">
              {caseItem.title}
            </h3>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              {caseItem.locationName}
            </p>
          </div>

          {/* Step 1: Status Transition Visual Comparison */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
              Step 1: Verify Status Change
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
              {/* From Status */}
              <div className={`sm:col-span-5 p-2.5 rounded-xl border ${currentMeta.bg} ${currentMeta.border} space-y-1 text-center sm:text-left`}>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Current Status</span>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-xs text-white">
                  <CurrentIcon className={`w-3.5 h-3.5 ${currentMeta.color}`} />
                  <span className={currentMeta.color}>{currentMeta.label}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="sm:col-span-1 flex justify-center text-slate-400 py-1 sm:py-0">
                <ArrowRight className="w-4 h-4 text-amber-400 rotate-90 sm:rotate-0" />
              </div>

              {/* To Status */}
              <div className={`sm:col-span-5 p-2.5 rounded-xl border ${targetMeta.bg} ${targetMeta.border} space-y-1 text-center sm:text-left ring-1 ring-amber-500/40`}>
                <span className="text-[10px] text-amber-300 font-semibold block uppercase">New Target Status</span>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-xs text-white">
                  <TargetIcon className={`w-3.5 h-3.5 ${targetMeta.color}`} />
                  <span className={targetMeta.color}>{targetMeta.label}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 italic px-1">
              "{targetMeta.description}"
            </p>
          </div>

          {/* Audit Trail / Docket Log Note Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Audit Trail Docket Note (Optional):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Logged to investigation history</span>
            </label>
            <textarea
              rows={2}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Suspect identified by Sector 2 team, SAPS docket CAS 42/08 logged, or case concluded..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder:text-slate-400 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none transition"
            />
          </div>

          {/* Step 2: Double Confirmation Safety Checkbox */}
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Step 2: Double Confirmation Safety Gate</span>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={hasConfirmedCheckbox}
                onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-amber-500 rounded border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-200 leading-relaxed font-medium">
                I verify that changing Docket <strong className="text-white font-mono">{caseItem.caseNumber}</strong> status to <strong className={targetMeta.color}>{targetMeta.label}</strong> is authorized and accurate.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!hasConfirmedCheckbox || isSubmitting}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
                hasConfirmedCheckbox
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black ring-2 ring-amber-400 shadow-amber-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : `Confirm & Apply: ${targetMeta.label}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
