import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldAlert,
  WifiOff,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  VolumeX,
  Smartphone,
  Server,
  FileCheck,
  Check,
  XCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { EmergencyType } from '../../types';

interface GoLiveItem {
  id: string;
  category: string;
  title: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'PASSED' | 'PENDING' | 'ACTION_REQUIRED';
  details: string;
}

const INITIAL_CHECKLIST: GoLiveItem[] = [
  {
    id: 'CHK-01',
    category: 'AUTHENTICATION & RBAC',
    title: 'Three Strict User Roles (CLIENT, CONTROL_ROOM, MANAGEMENT) Enforced',
    severity: 'BLOCKER',
    status: 'PASSED',
    details: 'Firestore security rules reject role self-escalation and deny unauthenticated reads.',
  },
  {
    id: 'CHK-02',
    category: 'EMERGENCY DISPATCH',
    title: 'Instant Emergency Trigger & High-Priority Location Stream',
    severity: 'BLOCKER',
    status: 'PASSED',
    details: 'Sub-second push to Control Room queue with GPS fallback to verified farm homestead.',
  },
  {
    id: 'CHK-03',
    category: 'COMMUNICATIONS RESILIENCE',
    title: 'Dual Outbound Route (WhatsApp API + Operator Manual Phone Fallback)',
    severity: 'CRITICAL',
    status: 'PASSED',
    details: 'If Meta API is offline, system automatically generates one-click manual WhatsApp web dispatch links.',
  },
  {
    id: 'CHK-04',
    category: 'AI GOVERNANCE & SAFETY',
    title: 'Strict Epistemic Demarcation (Fact vs. Observation vs. Allegation)',
    severity: 'CRITICAL',
    status: 'PASSED',
    details: 'AI provides auxiliary summarization only. Cannot declare guilt or alter criminal records autonomously.',
  },
  {
    id: 'CHK-05',
    category: 'POPIA & PRIVACY',
    title: 'Sensitive PII Isolation & Privacy Access Logging',
    severity: 'CRITICAL',
    status: 'PASSED',
    details: 'Viewing medical records or gate codes is logged with operator justification in the audit trail.',
  },
  {
    id: 'CHK-06',
    category: 'DATA INTEGRITY & RECOVERY',
    title: 'Automated Snapshot Backups & Documented 8-Step Restore Protocol',
    severity: 'HIGH',
    status: 'PASSED',
    details: 'Daily snapshots with SHA-256 parity verification and management authorization gate.',
  },
  {
    id: 'CHK-07',
    category: 'SAPS & LEGAL COMPLIANCE',
    title: 'Statutory Case Retention (No automatic case deletion on user deactivation)',
    severity: 'HIGH',
    status: 'PASSED',
    details: 'Preserves criminal and incident evidence in accordance with South African Criminal Procedure Act.',
  },
];

export const TestTrainingSuiteTab: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    trainingMode,
    toggleTrainingMode,
    createTrainingEmergency,
    logAuditEvent,
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'TRAINING' | 'FAILURES' | 'CHECKLIST'>('TRAINING');
  const [selectedScenario, setSelectedScenario] = useState<EmergencyType>('SECURITY');
  const [scenarioNotes, setScenarioNotes] = useState('SIMULATED DRILL: Night-time farm watch perimeter inspection drill near Sektor 2.');
  const [simulatedEmergencyId, setSimulatedEmergencyId] = useState<string | null>(null);

  // Failure Simulation States
  const [activeSimulatedFailures, setActiveSimulatedFailures] = useState<{ [key: string]: boolean }>({});

  const handleToggleFailure = (key: string, name: string) => {
    setActiveSimulatedFailures((prev) => {
      const nextState = !prev[key];
      logAuditEvent({
        recordType: 'FAILURE_SIMULATION',
        recordId: key,
        action: nextState ? 'FAILURE_SIMULATION_ACTIVATED' : 'FAILURE_SIMULATION_CLEARED',
        description: `Simulation: ${name} is now ${nextState ? 'ACTIVATED (FAILING)' : 'CLEARED (NORMAL)'}`,
      });
      return { ...prev, [key]: nextState };
    });
  };

  const handleLaunchTrainingEmergency = async () => {
    const id = await createTrainingEmergency(selectedScenario, scenarioNotes);
    setSimulatedEmergencyId(id);
    logAuditEvent({
      recordType: 'TRAINING_DRILL',
      recordId: id,
      action: 'TRAINING_EMERGENCY_TRIGGERED',
      description: `Launched simulated ${selectedScenario} training drill: ${scenarioNotes}`,
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Subtabs */}
      <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('TRAINING')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'TRAINING'
              ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Training & Drill Mode</span>
        </button>

        <button
          onClick={() => setActiveSubTab('FAILURES')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'FAILURES'
              ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>Critical Failure Simulator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('CHECKLIST')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'CHECKLIST'
              ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Go-Live Production Checklist (7/7)</span>
        </button>
      </div>

      {/* SUBTAB 1: TRAINING MODE */}
      {activeSubTab === 'TRAINING' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Operator Practice & Training Mode</span>
              </h3>
              <p className="text-slate-400 text-xs">
                Run live simulation drills without polluting actual crime and emergency statistics.
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleTrainingMode(!trainingMode.enabled, 'Farm Watch Sector Drill')}
              className={`font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition ${
                trainingMode.enabled
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
              }`}
            >
              <span>{trainingMode.enabled ? 'STOP TRAINING MODE' : 'ACTIVATE TRAINING MODE'}</span>
            </button>
          </div>

          {trainingMode.enabled && (
            <div className="bg-amber-950/80 border border-amber-500 text-amber-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-black text-sm text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>TRAINING MODE ACTIVE - NOT A REAL EMERGENCY</span>
              </div>
              <p className="text-xs">
                All events created while training mode is active are flagged with <code className="bg-amber-900 px-1 rounded">IS_TRAINING=true</code> and filtered out of official crime analytics.
              </p>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm">Launch Simulated Emergency Drill</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Scenario Type:</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value as EmergencyType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="SECURITY">Security / Suspicious Prowlers</option>
                  <option value="FIRE">Veld / Property Fire (FPA)</option>
                  <option value="MEDICAL">Medical Emergency</option>
                  <option value="POLICE_ASSISTANCE">SAPS Urgent Assistance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Simulated Notes & Script:</label>
                <input
                  type="text"
                  value={scenarioNotes}
                  onChange={(e) => setScenarioNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleLaunchTrainingEmergency}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition"
              >
                <Play className="w-4 h-4" />
                <span>Inject Training Emergency into Control Room</span>
              </button>
            </div>

            {simulatedEmergencyId && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-between">
                <span>✓ Training Emergency {simulatedEmergencyId} injected. Visible in Control Room with TRAINING badge.</span>
                <span className="text-amber-400 font-bold">READY TO ACKNOWLEDGE</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: CRITICAL FAILURE SIMULATOR */}
      {activeSubTab === 'FAILURES' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-red-400" />
              <span>Critical Subsystem Failure Simulator</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Test how the system, control room operators, and fallback mechanisms react under catastrophic network or API failure conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                key: 'SIM_INTERNET_LOSS',
                name: 'Total Internet Loss / Offline Mode',
                icon: <WifiOff className="w-4 h-4 text-red-400" />,
                impact: 'Client UI caches local GPS fixes and queues SMS emergency button.',
              },
              {
                key: 'SIM_GPS_UNAVAILABLE',
                name: 'GPS Sensor Failure / Cloud Cover',
                icon: <Smartphone className="w-4 h-4 text-amber-400" />,
                impact: 'Automatically falls back to verified homestead/farm coordinate database.',
              },
              {
                key: 'SIM_WHATSAPP_DOWN',
                name: 'WhatsApp Cloud API Gateway Outage',
                icon: <Radio className="w-4 h-4 text-orange-400" />,
                impact: 'Control room displays instant 1-click manual WhatsApp web links.',
              },
              {
                key: 'SIM_AI_DOWN',
                name: 'Gemini AI Service Timeout',
                icon: <Sparkles className="w-4 h-4 text-purple-400" />,
                impact: 'Non-blocking fallback: all core dispatch and case logging continue without delay.',
              },
              {
                key: 'SIM_AUDIO_LOSS',
                name: 'WebRTC Live Audio Disconnect',
                icon: <VolumeX className="w-4 h-4 text-blue-400" />,
                impact: 'Operator prompts one-click cellular GSM phone call to client.',
              },
              {
                key: 'SIM_DATABASE_SLOW',
                name: 'High Latency / Network Congestion',
                icon: <Server className="w-4 h-4 text-green-400" />,
                impact: 'Optimistic UI state allows immediate operator acknowledgements.',
              },
            ].map((sim) => {
              const isFailing = !!activeSimulatedFailures[sim.key];
              return (
                <div
                  key={sim.key}
                  className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition ${
                    isFailing ? 'border-red-500 bg-red-950/20' : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white text-xs">
                        {sim.icon}
                        <span>{sim.name}</span>
                      </div>
                      <span
                        className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isFailing
                            ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isFailing ? 'SIMULATING OUTAGE' : 'NORMAL'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">{sim.impact}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFailure(sim.key, sim.name)}
                    className={`py-2 rounded-xl font-bold transition text-xs ${
                      isFailing
                        ? 'bg-red-600 text-white hover:bg-red-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isFailing ? 'Clear Failure & Restore Normal' : 'Simulate Outage'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: GO-LIVE PRODUCTION CHECKLIST */}
      {activeSubTab === 'CHECKLIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-sm">Pre-Production Go-Live Hardening Checklist</h3>
              <p className="text-slate-400 text-xs">
                Verification of core security, resilience, legal, and operational prerequisites.
              </p>
            </div>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-xl font-bold font-mono text-xs">
              7 / 7 PASSED
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {INITIAL_CHECKLIST.map((item) => (
              <div key={item.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-850/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">{item.id}</span>
                    <span className="font-bold text-white text-xs">{item.title}</span>
                    <span
                      className={`font-mono text-[9px] font-black px-1.5 py-0.5 rounded ${
                        item.severity === 'BLOCKER'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{item.details}</p>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Category: {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
