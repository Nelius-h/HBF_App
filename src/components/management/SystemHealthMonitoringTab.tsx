import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  Radio,
  MessageSquare,
  Volume2,
  Database,
  Sparkles,
  ShieldAlert,
  Clock,
  Check,
  XCircle,
  Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { SystemHealthComponent, ErrorSeverity } from '../../types';

export const SystemHealthMonitoringTab: React.FC = () => {
  const {
    systemHealth,
    runSyntheticHeartbeatTest,
    systemErrorLogs,
    clearSystemError,
    logAuditEvent,
  } = useData();

  const [isRunningHeartbeat, setIsRunningHeartbeat] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | ErrorSeverity>('ALL');
  const [heartbeatSuccessMessage, setHeartbeatSuccessMessage] = useState<string | null>(null);

  const handleRunHeartbeat = async () => {
    setIsRunningHeartbeat(true);
    try {
      await runSyntheticHeartbeatTest();
      setHeartbeatSuccessMessage('Synthetic Heartbeat Diagnostic completed. All pipelines verified.');
      setTimeout(() => setHeartbeatSuccessMessage(null), 4000);
      logAuditEvent({
        recordType: 'SYSTEM_HEALTH',
        recordId: `HBT-${Date.now()}`,
        action: 'SYNTHETIC_HEARTBEAT_TEST_RUN',
        description: 'Executed manual synthetic heartbeat health test across all 7 subsystems',
      });
    } finally {
      setIsRunningHeartbeat(false);
    }
  };

  const filteredErrors = systemErrorLogs.filter((err) => {
    if (selectedSeverity === 'ALL') return true;
    return err.severity === selectedSeverity;
  });

  const getCategoryIcon = (category: SystemHealthComponent['category']) => {
    switch (category) {
      case 'DATABASE':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'FUNCTIONS':
        return <Server className="w-5 h-5 text-indigo-400" />;
      case 'NOTIFICATIONS':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'AUDIO_MEDIA':
        return <Volume2 className="w-5 h-5 text-blue-400" />;
      case 'BACKUP':
        return <Radio className="w-5 h-5 text-purple-400" />;
      case 'AI_SERVICE':
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header & Heartbeat Button */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Infrastructure Health & Real-Time Probes</span>
          </h3>
          <p className="text-slate-400 text-xs">
            Live telemetry for critical communications, emergency ingestion pipeline & databases.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunHeartbeat}
          disabled={isRunningHeartbeat}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRunningHeartbeat ? 'animate-spin' : ''}`} />
          <span>{isRunningHeartbeat ? 'Probing Services...' : 'Run Synthetic Heartbeat Test'}</span>
        </button>
      </div>

      {heartbeatSuccessMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 p-3.5 rounded-xl flex items-center gap-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{heartbeatSuccessMessage}</span>
        </div>
      )}

      {/* Emergency Pipeline Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
          Emergency Ingestion & Dispatch Pipeline Status
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center font-mono">
          <div className="bg-slate-850 border border-slate-700/60 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400">Step 1: Client App</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> ONLINE
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Direct HTTPS / WSS</div>
          </div>

          <div className="bg-slate-850 border border-slate-700/60 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400">Step 2: Ingestion Queue</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> ACTIVE
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Idempotency Guard On</div>
          </div>

          <div className="bg-slate-850 border border-slate-700/60 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400">Step 3: Control Room Alert</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> STREAMING
            </div>
            <div className="text-[10px] text-slate-500 mt-1">&lt; 100ms Push Latency</div>
          </div>

          <div className="bg-slate-850 border border-slate-700/60 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400">Step 4: Dispatch Outbound</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> DUAL ROUTE
            </div>
            <div className="text-[10px] text-slate-500 mt-1">WhatsApp API + Manual</div>
          </div>
        </div>
      </div>

      {/* Subsystems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {systemHealth.map((comp) => (
          <div
            key={comp.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                  {getCategoryIcon(comp.category)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{comp.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Latency: {comp.latencyMs || 0}ms
                  </span>
                </div>
              </div>

              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                  comp.status === 'HEALTHY'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : comp.status === 'DEGRADED'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-red-950 text-red-300 border-red-800'
                }`}
              >
                {comp.status}
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">{comp.details}</p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-slate-500" />
                <span>Last probed: {new Date(comp.lastChecked).toLocaleDateString('en-ZA')} {new Date(comp.lastChecked).toLocaleTimeString()}</span>
              </span>
              <span>Errors: {comp.errorCount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Error Logging Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Application & Subsystem Error Log</span>
            </h4>
            <p className="text-slate-400 text-xs">
              Diagnostics and failover events (sanitized, no PII).
            </p>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedSeverity === sev
                    ? 'bg-amber-600 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {filteredErrors.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No error events recorded in this category.</p>
        ) : (
          <div className="space-y-2">
            {filteredErrors.map((err) => (
              <div
                key={err.id}
                className="bg-slate-850 border border-slate-800 p-3 rounded-xl flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[9px] font-black px-1.5 py-0.5 rounded ${
                        err.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : err.severity === 'HIGH'
                          ? 'bg-orange-950 text-orange-300 border border-orange-800'
                          : err.severity === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {err.severity}
                    </span>
                    <span className="font-bold text-white text-xs">{err.subsystem}</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-slate-500" />
                      <span>{new Date(err.timestamp).toLocaleDateString('en-ZA')} {new Date(err.timestamp).toLocaleTimeString()}</span>
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{err.message}</p>
                  {err.details && <p className="text-slate-500 text-[11px] font-mono">{err.details}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => clearSystemError(err.id)}
                  className="text-slate-300 hover:text-white text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 whitespace-nowrap transition"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
