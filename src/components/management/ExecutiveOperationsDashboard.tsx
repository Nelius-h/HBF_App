import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Flame,
  Car,
  Eye,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Radio,
  BarChart3,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { DateFilterOption } from '../../types';
import { computeDateFilterRange, isDateWithinRange, calculateControlRoomPerformance } from '../../services/reportingService';

interface Props {
  onNavigateTab?: (tabKey: any) => void;
}

export const ExecutiveOperationsDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const { emergencies, cases, bolos, alerts, intelReviewQueue, systemHealth, systemErrorLogs } = useData();

  const [dateFilter, setDateFilter] = useState<DateFilterOption>('LAST_7_DAYS');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const range = computeDateFilterRange(dateFilter, customStart, customEnd);

  // Filtered operational datasets
  const filteredEmergencies = emergencies.filter((e) => isDateWithinRange(e.startTime, range));
  const filteredCases = cases.filter((c) => isDateWithinRange(c.createdAt, range));
  const filteredAlerts = alerts.filter((a) => isDateWithinRange(a.publishedAt, range));

  const activeEmergencies = emergencies.filter(
    (e) => e.status !== 'SAFE' && e.status !== 'FALSE_ALARM' && e.status !== 'CLOSED'
  );
  const unacknowledgedEmergencies = emergencies.filter(
    (e) => e.status === 'TRIGGERED' || e.status === 'CONTROL_ROOM_NOTIFIED'
  );
  const openCases = cases.filter((c) => c.status === 'NEW' || c.status === 'INVESTIGATING');
  const pendingCases = cases.filter((c) => c.status === 'PENDING_SAPS');
  const activeBolos = bolos.filter((b) => b.status === 'ACTIVE');
  const activeFires = alerts.filter((a) => a.alertType === 'FIRE' && !a.isAllClear && !a.isClosed);
  const activeTraffic = alerts.filter((a) => a.alertType === 'TRAFFIC' && !a.isAllClear && !a.isClosed);
  const criticalErrors = systemErrorLogs.filter((e) => e.severity === 'CRITICAL' && !e.acknowledged);

  const performanceMetrics = calculateControlRoomPerformance(emergencies, range);

  // Category counts
  const casesByCategory: Record<string, number> = {};
  filteredCases.forEach((c) => {
    casesByCategory[c.category] = (casesByCategory[c.category] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      {/* Date Filter & Control Ribbon */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Operations Timeframe:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {(['TODAY', 'LAST_24_HOURS', 'LAST_7_DAYS', 'LAST_30_DAYS', 'THIS_MONTH', 'CUSTOM'] as DateFilterOption[]).map(
            (opt) => (
              <button
                key={opt}
                onClick={() => setDateFilter(opt)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  dateFilter === opt
                    ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        {dateFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1"
            />
          </div>
        )}
      </div>

      {/* Critical Operational Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div
          onClick={() => onNavigateTab?.('MONITORING')}
          className="bg-slate-900 border border-slate-800 hover:border-red-500/50 p-3.5 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold">Active Emergencies</span>
            <Activity className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeEmergencies.length}</span>
            {unacknowledgedEmergencies.length > 0 && (
              <span className="text-[10px] text-red-400 font-bold bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800 animate-pulse">
                {unacknowledgedEmergencies.length} Unacked
              </span>
            )}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab?.('REPORTS')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold">Open Cases</span>
            <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{openCases.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">({pendingCases.length} SAPS)</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab?.('REPORTS')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-3.5 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold">Active BOLOs</span>
            <Eye className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeBolos.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">broadcasted</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab?.('REPORTS')}
          className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 p-3.5 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold">Fires & Traffic</span>
            <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeFires.length + activeTraffic.length}</span>
            <span className="text-[10px] text-orange-400 font-bold">{activeFires.length} Fire • {activeTraffic.length} Traf</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab?.('REPORTS')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-3.5 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold">Intel Queue</span>
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{intelReviewQueue.filter((q) => q.status === 'PENDING_REVIEW' || (q.status as any) === 'PENDING').length}</span>
            <span className="text-[10px] text-purple-400 font-bold">Review Req</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab?.('HEALTH')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold">System Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">100%</span>
            {criticalErrors.length > 0 ? (
              <span className="text-[10px] text-red-400 font-bold bg-red-950 px-1 rounded">{criticalErrors.length} ERR</span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-medium">All Healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* Control Room SLA & Speed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Control Room Operational Performance & SLA</h3>
            </div>
            <button
              onClick={() => onNavigateTab?.('REPORTS')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <span>Detailed Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block text-[11px]">Period Emergencies</span>
              <span className="text-xl font-black text-white mt-1 block">{filteredEmergencies.length}</span>
              <span className="text-[10px] text-slate-500">In selected timeframe</span>
            </div>

            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block text-[11px]">Avg Ack Time</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">
                {performanceMetrics.avgAckTimeSeconds}s
              </span>
              <span className="text-[10px] text-slate-500">Fastest: {performanceMetrics.fastestAckSeconds}s</span>
            </div>

            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block text-[11px]">Reaction Dispatched</span>
              <span className="text-xl font-black text-amber-400 mt-1 block">
                {performanceMetrics.reactionForceNotified}
              </span>
              <span className="text-[10px] text-slate-500">{performanceMetrics.callsInitiated} phone calls</span>
            </div>

            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block text-[11px]">Cases Created</span>
              <span className="text-xl font-black text-indigo-400 mt-1 block">
                {performanceMetrics.casesCreatedFromEmergency}
              </span>
              <span className="text-[10px] text-slate-500">{performanceMetrics.falseAlarms} false alarms</span>
            </div>
          </div>

          {/* Quick SLA Health Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>SLA Target: Operator Acknowledged in &lt; 60 Seconds</span>
              <span className="text-emerald-400 font-mono font-bold">
                {performanceMetrics.avgAckTimeSeconds <= 60 ? 'COMPLIANT' : 'ATTENTION NEEDED'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  performanceMetrics.avgAckTimeSeconds <= 60
                    ? 'bg-emerald-500'
                    : performanceMetrics.avgAckTimeSeconds <= 180
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(10, 100 - performanceMetrics.avgAckTimeSeconds / 2))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Crime Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Cases by Category</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{filteredCases.length} Total</span>
          </div>

          <div className="space-y-2">
            {Object.keys(casesByCategory).length === 0 ? (
              <p className="text-slate-500 text-center py-6">No cases reported in selected period.</p>
            ) : (
              Object.entries(casesByCategory).map(([cat, count]) => {
                const percent = Math.round((count / (filteredCases.length || 1)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-300 capitalize">{cat.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-slate-400">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
