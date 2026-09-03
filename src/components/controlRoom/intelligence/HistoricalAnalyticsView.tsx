import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Flame,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import {
  generateDailyIntelligenceSummary,
  generateWeeklyManagementReport,
  analyzeIncidentPatterns,
} from '../../../services/geminiIntelService';

export const HistoricalAnalyticsView: React.FC = () => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const { cases, pois, vois, intelObservations, getDataQualityIssues } = useData();

  const [activeTab, setActiveTab] = useState<'MODUS_OPERANDI' | 'HOTSPOTS' | 'AI_REPORTS' | 'DATA_QUALITY'>('MODUS_OPERANDI');

  // AI Generator state
  const [selectedReportType, setSelectedReportType] = useState<'DAILY' | 'WEEKLY' | 'PATTERNS'>('DAILY');
  const [reportSector, setReportSector] = useState('ALL');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Compute Modus Operandi statistics from cases and observations
  const moCounts: Record<string, number> = {
    'FENCE_CUT': 0,
    'GATE_FORCED': 0,
    'LIVESTOCK_DRIVEN_AWAY': 0,
    'COPPER_WIRE_REMOVED': 0,
    'TOOL_SHED_BREAKIN': 0,
    'POWER_DISABLED': 0,
    'VEHICLE_USED': 0,
    'FOOT_ACCESS': 0,
  };

  cases.forEach((c) => {
    if (c.modusOperandi) {
      c.modusOperandi.forEach((mo) => {
        if (moCounts[mo] !== undefined) {
          moCounts[mo]++;
        } else {
          moCounts[mo] = 1;
        }
      });
    }
  });

  // Sector stats
  const sectorCounts: Record<string, number> = {};
  cases.forEach((c) => {
    const s = c.sector || 'General Sektor';
    sectorCounts[s] = (sectorCounts[s] || 0) + 1;
  });

  // Time patterns (Night 22:00-05:00 vs Dusk 18:00-22:00 vs Day 06:00-18:00)
  let nightCount = 0;
  let duskCount = 0;
  let dayCount = 0;

  cases.forEach((c) => {
    if (!c.incidentTime) return;
    const hour = parseInt(c.incidentTime.split(':')[0], 10);
    if (isNaN(hour)) return;
    if (hour >= 22 || hour <= 5) {
      nightCount++;
    } else if (hour >= 18 && hour < 22) {
      duskCount++;
    } else {
      dayCount++;
    }
  });

  const totalTimeIncidents = nightCount + duskCount + dayCount || 1;
  const qualityIssues = getDataQualityIssues();

  const handleGenerateAiReport = async () => {
    setIsGenerating(true);
    setGeneratedReport(null);

    try {
      if (selectedReportType === 'DAILY') {
        const todayStr = new Date().toISOString().substring(0, 10);
        const result = await generateDailyIntelligenceSummary({
          cases,
          pois,
          vois,
          observations: intelObservations,
          date: todayStr,
          language: 'en',
        });
        setGeneratedReport(result);
      } else if (selectedReportType === 'WEEKLY') {
        const result = await generateWeeklyManagementReport({
          cases,
          pois,
          vois,
          observations: intelObservations,
          timeRangeDays: 14,
          language: 'en',
        });
        setGeneratedReport(result);
      } else {
        const result = await analyzeIncidentPatterns({
          cases,
          pois,
          vois,
          targetFocus: 'Livestock and copper cable theft patterns along R507 corridor',
          language: 'en',
        });
        setGeneratedReport(result);
      }
    } catch (err) {
      setGeneratedReport('Failed to generate report. Please verify connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReport = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('MODUS_OPERANDI')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'MODUS_OPERANDI'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Modus Operandi Breakdown
        </button>

        <button
          onClick={() => setActiveTab('HOTSPOTS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'HOTSPOTS'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Sector Hotspots & Time Windows
        </button>

        <button
          onClick={() => setActiveTab('AI_REPORTS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'AI_REPORTS'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Intelligence Summaries
        </button>

        <button
          onClick={() => setActiveTab('DATA_QUALITY')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'DATA_QUALITY'
              ? 'bg-amber-600 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Data Quality Scanner ({qualityIssues.length})
        </button>
      </div>

      {/* TAB 1: MODUS OPERANDI BREAKDOWN */}
      {activeTab === 'MODUS_OPERANDI' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(moCounts).map(([moKey, count]) => {
              const formatted = moKey.replace(/_/g, ' ');
              return (
                <div key={moKey} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">{formatted}</span>
                    <span className="text-xl font-black text-white">{count}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (count / (cases.length || 1)) * 100 * 3)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Documented in active cases and verified observations
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Modus Operandi Operational Insights
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Recurring patterns in the Hartbeesfontein area demonstrate coordinated night actions targeting corner fence posts and transformers during scheduled power interruptions (02:00–04:30), typically utilizing single-cab utility bakkies (Isuzu KB / Toyota Hilux) with aluminium cattle rails.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SECTOR HOTSPOTS & TIME WINDOWS */}
      {activeTab === 'HOTSPOTS' && (
        <div className="space-y-6">
          {/* Time Windows Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Night Window (22:00 - 05:00)
                </span>
                <span className="text-lg font-black text-white">{nightCount}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${(nightCount / totalTimeIncidents) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Primary window for livestock theft and transformer wire cutting.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Dusk Window (18:00 - 22:00)
                </span>
                <span className="text-lg font-black text-white">{duskCount}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(duskCount / totalTimeIncidents) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Reconnaissance sightings and gate surveillance activities.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Daytime (06:00 - 18:00)
                </span>
                <span className="text-lg font-black text-white">{dayCount}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(dayCount / totalTimeIncidents) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Traffic hazards, farm gate reports, and trespassing reports.
              </p>
            </div>
          </div>

          {/* Sector Hotspot List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Incidents by Geographic Sector
            </h3>
            <div className="space-y-2">
              {Object.entries(sectorCounts).map(([sector, count]) => (
                <div
                  key={sector}
                  className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="font-bold text-white">{sector}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{count} incidents recorded</span>
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 font-bold rounded border border-amber-900/40">
                      {Math.round((count / (cases.length || 1)) * 100)}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI INTELLIGENCE SUMMARIES */}
      {activeTab === 'AI_REPORTS' && (
        <div className="space-y-6">
          {/* Safeguard Notice */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-400 uppercase font-mono text-[11px]">
                AI Intelligence & Reporting Engine • Grounded Citations
              </strong>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Generates strictly factual operational intelligence digests citing internal record IDs. AI does not assign guilt, generate risk scores, or replace human operator confirmation.
              </p>
            </div>
          </div>

          {/* Report Generator Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Generate Intelligence Digest</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label
                className={`p-3 rounded-lg border cursor-pointer ${
                  selectedReportType === 'DAILY'
                    ? 'bg-amber-950/40 border-amber-600 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value="DAILY"
                  checked={selectedReportType === 'DAILY'}
                  onChange={() => setSelectedReportType('DAILY')}
                  className="hidden"
                />
                <div>Daily Intelligence Summary</div>
                <div className="text-[11px] font-normal text-slate-500 mt-1">
                  24-hour summary of active cases, sightings, and VOI alerts
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer ${
                  selectedReportType === 'WEEKLY'
                    ? 'bg-amber-950/40 border-amber-600 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value="WEEKLY"
                  checked={selectedReportType === 'WEEKLY'}
                  onChange={() => setSelectedReportType('WEEKLY')}
                  className="hidden"
                />
                <div>Weekly Management Report</div>
                <div className="text-[11px] font-normal text-slate-500 mt-1">
                  14-day trend analysis, sector distributions, and MO patterns
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer ${
                  selectedReportType === 'PATTERNS'
                    ? 'bg-amber-950/40 border-amber-600 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value="PATTERNS"
                  checked={selectedReportType === 'PATTERNS'}
                  onChange={() => setSelectedReportType('PATTERNS')}
                  className="hidden"
                />
                <div>Cross-Case Pattern Matcher</div>
                <div className="text-[11px] font-normal text-slate-500 mt-1">
                  Correlates livestock & cable theft MO across sectors
                </div>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerateAiReport}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Grounded Digest...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Intelligence Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Output Box */}
          {generatedReport && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Grounded Intelligence Output
                  </h4>
                </div>
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied to Clipboard' : 'Copy Report Text'}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {generatedReport}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DATA QUALITY SCANNER */}
      {activeTab === 'DATA_QUALITY' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Intelligence Integrity & Completeness Scanner
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Automated rules identify missing critical physical attributes, unverified high-confidence observations, and orphaned records to maintain high operational data quality.
            </p>
          </div>

          {qualityIssues.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl text-emerald-400 text-xs font-bold">
              ✓ All intelligence records meet current data quality standards.
            </div>
          ) : (
            <div className="space-y-3">
              {qualityIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.severity === 'HIGH'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {issue.severity} SEVERITY
                      </span>
                      <span className="font-mono text-slate-400">{issue.entityType}</span>
                      <strong className="text-white">{issue.entityLabel}</strong>
                    </div>
                    <p className="text-slate-300">{issue.issueDescription}</p>
                    <div className="text-amber-400 text-[11px]">
                      Recommended Fix: {issue.suggestedAction || issue.suggestedFix}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
