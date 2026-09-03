import React, { useState } from 'react';
import {
  AlertOctagon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  Shield,
  HeartPulse,
  Flame,
  PhoneCall,
  Search,
  Filter,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useData } from '../../context/DataContext';
import { EmergencyEvent } from '../../types';
import { EmergencyDetailModal } from '../controlRoom/EmergencyDetailModal';

export const EmergencyMonitoringTab: React.FC = () => {
  const { t } = useI18n();
  const { emergencies } = useData();

  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Analytics Calculations (Requirement 18)
  const activeEmergencies = emergencies.filter(
    (e) => e.status !== 'SAFE' && e.status !== 'FALSE_ALARM' && e.status !== 'CLOSED'
  );

  const unackEmergencies = emergencies.filter(
    (e) => e.status === 'TRIGGERED' || e.status === 'CONTROL_ROOM_NOTIFIED'
  );

  // Average Ack Time calculation
  const ackedEmergencies = emergencies.filter(
    (e) => e.acknowledgedBy && e.startTime
  );

  const avgAckSeconds =
    ackedEmergencies.length > 0
      ? Math.round(
          ackedEmergencies.reduce((acc, curr) => {
            const start = new Date(curr.startTime).getTime();
            const ack = new Date(curr.acknowledgedBy!.timestamp).getTime();
            return acc + (ack - start) / 1000;
          }, 0) / ackedEmergencies.length
        )
      : 0;

  const resolvedLast7Days = emergencies.filter((e) => {
    if (e.status !== 'SAFE' && e.status !== 'FALSE_ALARM' && e.status !== 'CLOSED') return false;
    const resolvedTime = e.resolvedTime || e.updatedAt;
    const diffDays = (Date.now() - new Date(resolvedTime).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  // Filtered List
  const filteredEmergencies = emergencies.filter((e) => {
    if (statusFilter === 'ACTIVE') {
      if (e.status === 'SAFE' || e.status === 'FALSE_ALARM' || e.status === 'CLOSED') return false;
    } else if (statusFilter === 'UNACK') {
      if (e.status !== 'TRIGGERED' && e.status !== 'CONTROL_ROOM_NOTIFIED') return false;
    } else if (statusFilter === 'RESOLVED') {
      if (e.status !== 'SAFE' && e.status !== 'CLOSED') return false;
    } else if (statusFilter === 'FALSE_ALARM') {
      if (e.status !== 'FALSE_ALARM') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.clientName.toLowerCase().includes(q) ||
        e.farmName.toLowerCase().includes(q) ||
        e.emergencyType.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 text-white text-xs">
      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Active */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{t.management.activeCount}</span>
            <AlertOctagon className={`w-4 h-4 ${activeEmergencies.length > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {activeEmergencies.length}
          </div>
          <span className="text-[10px] text-slate-400">Ongoing field incidents</span>
        </div>

        {/* Metric 2: Unacknowledged */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{t.management.unackCount}</span>
            <Radio className={`w-4 h-4 ${unackEmergencies.length > 0 ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl font-black font-mono ${unackEmergencies.length > 0 ? 'text-amber-400' : 'text-white'}`}>
            {unackEmergencies.length}
          </div>
          <span className="text-[10px] text-slate-400">Awaiting operator accept</span>
        </div>

        {/* Metric 3: Avg Ack Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{t.management.avgAckTime}</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {avgAckSeconds > 0 ? `${avgAckSeconds}s` : '< 30s'}
          </div>
          <span className="text-[10px] text-slate-400">Trigger to acknowledgement</span>
        </div>

        {/* Metric 4: Resolved (7d) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{t.management.resolved7Days}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {resolvedLast7Days.length}
          </div>
          <span className="text-[10px] text-slate-400">Safely resolved incidents</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1 overflow-x-auto">
            {['ALL', 'ACTIVE', 'UNACK', 'RESOLVED', 'FALSE_ALARM'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase transition ${
                  statusFilter === filterKey
                    ? 'bg-amber-600 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {filterKey.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, farm, ref ID..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
          />
        </div>
      </div>

      {/* Emergencies Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-850 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Event Ref</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Client / Property</th>
                <th className="px-4 py-3">Activated</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ack Operator</th>
                <th className="px-4 py-3 text-right">Console</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredEmergencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500 italic">
                    No emergency records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEmergencies.map((emg) => {
                  const isUnack = emg.status === 'TRIGGERED' || emg.status === 'CONTROL_ROOM_NOTIFIED';
                  return (
                    <tr key={emg.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">
                        #{emg.id}
                      </td>
                      <td className="px-4 py-3 font-bold text-white uppercase text-[11px]">
                        {emg.emergencyType}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-white block">{emg.clientName}</span>
                        <span className="text-[10px] text-slate-400 block">{emg.farmName} ({emg.sector})</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(emg.startTime).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isUnack
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                              : emg.status === 'SAFE' || emg.status === 'CLOSED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : emg.status === 'FALSE_ALARM'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {emg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {emg.acknowledgedBy ? (
                          <span>{emg.acknowledgedBy.operatorName}</span>
                        ) : (
                          <span className="text-red-400 italic">Unacknowledged</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedEmergency(emg)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-xl font-bold text-[11px] transition"
                        >
                          View Console
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Detail Console Modal */}
      {selectedEmergency && (
        <EmergencyDetailModal
          emergency={selectedEmergency}
          isOpen={!!selectedEmergency}
          onClose={() => setSelectedEmergency(null)}
        />
      )}
    </div>
  );
};
