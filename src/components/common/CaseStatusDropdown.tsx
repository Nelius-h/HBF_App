import React from 'react';
import { ChevronDown, Clock, Search, Activity, CheckCircle2, Lock } from 'lucide-react';
import { Case, CaseStatus } from '../../types';

interface CaseStatusDropdownProps {
  caseItem: Case;
  onRequestChange: (caseItem: Case, targetStatus: CaseStatus) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  theme?: 'dark' | 'light' | 'monochrome';
}

export const CaseStatusDropdown: React.FC<CaseStatusDropdownProps> = ({
  caseItem,
  onRequestChange,
  className = '',
  size = 'sm',
  disabled = false,
  theme = 'dark',
}) => {
  const currentStatus = caseItem.status;

  const STATUS_STYLES: Record<
    CaseStatus,
    {
      label: string;
      bg: string;
      border: string;
      text: string;
      dot: string;
      icon: any;
      monochromeBg: string;
      monochromeBorder: string;
      monochromeText: string;
    }
  > = {
    open: {
      label: 'Open / Logged',
      bg: 'bg-slate-900',
      border: 'border-slate-700',
      text: 'text-slate-200',
      dot: 'bg-blue-400',
      icon: Clock,
      monochromeBg: 'bg-white',
      monochromeBorder: 'border-gray-400',
      monochromeText: 'text-gray-900',
    },
    investigating: {
      label: 'Under Investigation',
      bg: 'bg-slate-900',
      border: 'border-amber-500/40',
      text: 'text-amber-300',
      dot: 'bg-amber-400',
      icon: Search,
      monochromeBg: 'bg-white',
      monochromeBorder: 'border-gray-400',
      monochromeText: 'text-gray-900',
    },
    action_pending: {
      label: 'Action Pending',
      bg: 'bg-slate-900',
      border: 'border-purple-500/40',
      text: 'text-purple-300',
      dot: 'bg-purple-400',
      icon: Activity,
      monochromeBg: 'bg-white',
      monochromeBorder: 'border-gray-400',
      monochromeText: 'text-gray-900',
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-slate-900',
      border: 'border-emerald-500/40',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
      icon: CheckCircle2,
      monochromeBg: 'bg-white',
      monochromeBorder: 'border-gray-400',
      monochromeText: 'text-gray-900',
    },
    closed: {
      label: 'Closed / Archived',
      bg: 'bg-slate-900',
      border: 'border-slate-750',
      text: 'text-slate-400',
      dot: 'bg-slate-500',
      icon: Lock,
      monochromeBg: 'bg-gray-100',
      monochromeBorder: 'border-gray-400',
      monochromeText: 'text-gray-700',
    },
  };

  const isLightOrMono = theme === 'light' || theme === 'monochrome';
  const style = STATUS_STYLES[currentStatus] || STATUS_STYLES.open;
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'text-[11px] py-1 pl-6 pr-5 rounded-md',
    md: 'text-xs py-1.5 pl-7 pr-6 rounded-lg',
    lg: 'text-sm py-2 pl-8 pr-7 rounded-lg',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute left-2 pointer-events-none flex items-center z-10">
        {!isLightOrMono && <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1 hidden sm:inline-block`} />}
        <Icon className={`${iconSizes} ${isLightOrMono ? 'text-gray-700' : style.text}`} />
      </div>

      <select
        value={currentStatus}
        disabled={disabled}
        onChange={(e) => {
          const newStatus = e.target.value as CaseStatus;
          if (newStatus !== currentStatus) {
            onRequestChange(caseItem, newStatus);
          }
        }}
        title="Change case investigation status"
        className={`appearance-none font-semibold border outline-none cursor-pointer transition ${sizeClasses} ${
          isLightOrMono
            ? `${style.monochromeBg} ${style.monochromeBorder} ${style.monochromeText} hover:bg-gray-50 focus:ring-1 focus:ring-gray-400`
            : `${style.bg} ${style.border} ${style.text} hover:border-slate-500 focus:ring-1 focus:ring-amber-500/50`
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <option value="open" className={isLightOrMono ? 'bg-white text-gray-900 font-medium py-1' : 'bg-slate-900 text-slate-200 font-medium py-1'}>
          Open / Logged
        </option>
        <option value="investigating" className={isLightOrMono ? 'bg-white text-gray-900 font-medium py-1' : 'bg-slate-900 text-amber-300 font-medium py-1'}>
          Under Investigation
        </option>
        <option value="action_pending" className={isLightOrMono ? 'bg-white text-gray-900 font-medium py-1' : 'bg-slate-900 text-purple-300 font-medium py-1'}>
          Action Pending
        </option>
        <option value="resolved" className={isLightOrMono ? 'bg-white text-gray-900 font-medium py-1' : 'bg-slate-900 text-emerald-300 font-medium py-1'}>
          Resolved
        </option>
        <option value="closed" className={isLightOrMono ? 'bg-white text-gray-900 font-medium py-1' : 'bg-slate-900 text-slate-400 font-medium py-1'}>
          Closed / Concluded
        </option>
      </select>

      <div className={`absolute right-1.5 pointer-events-none flex items-center ${isLightOrMono ? 'text-gray-500' : 'text-slate-400'}`}>
        <ChevronDown className="w-3 h-3" />
      </div>
    </div>
  );
};
