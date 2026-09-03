import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Shield,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
  Globe,
  Database,
  Search,
  Archive,
  BarChart,
  UserCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  ReportType,
  ConfidentialityClassification,
  DateFilterOption,
  GeneratedReportRecord,
} from '../../types';
import {
  computeDateFilterRange,
  isDateWithinRange,
  calculateControlRoomPerformance,
  generateDailySituationReportContent,
  generateControlRoomPerformanceReportContent,
  generateSecurityTrendReportContent,
  exportToCsv,
} from '../../services/reportingService';

export const ManagementReportsView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    emergencies,
    cases,
    alerts,
    bolos,
    pois,
    vois,
    generatedReports,
    saveGeneratedReport,
    logAuditEvent,
  } = useData();

  const [selectedReportType, setSelectedReportType] = useState<ReportType>('DAILY_SITUATION_REPORT');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityClassification>('INTERNAL');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('LAST_7_DAYS');
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'BUILDER' | 'ARCHIVE'>('BUILDER');

  const [previewContent, setPreviewContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const range = computeDateFilterRange(dateFilter, customStart, customEnd);

  // Generate Report Handler
  const handleGenerateReport = () => {
    setIsGenerating(true);
    let content = '';

    if (selectedReportType === 'DAILY_SITUATION_REPORT') {
      content = generateDailySituationReportContent(
        dateFilter,
        confidentiality,
        emergencies,
        cases,
        alerts,
        currentUser
      );
    } else if (selectedReportType === 'CONTROL_ROOM_PERFORMANCE_REPORT') {
      const metrics = calculateControlRoomPerformance(emergencies, range, operatorFilter);
      content = generateControlRoomPerformanceReportContent(
        metrics,
        range,
        operatorFilter,
        currentUser
      );
    } else if (selectedReportType === 'SECURITY_TREND_REPORT') {
      content = generateSecurityTrendReportContent(cases, range, currentUser);
    } else {
      // General structured summary for other report types
      const filteredCases = cases.filter((c) => isDateWithinRange(c.createdAt, range));
      const filteredEmergencies = emergencies.filter((e) => isDateWithinRange(e.startTime, range));

      content = `# ${selectedReportType.replace(/_/g, ' ')}
**Klassifikasie:** ${confidentiality}
**Periode:** ${range.label}
**Gegenereer Deur:** ${currentUser.name} ${currentUser.surname} (${currentUser.role})
**Datum:** ${new Date().toLocaleString()}

---

## 1. OPSOMMING VAN DATA
- Gekoppelde Sake: ${filteredCases.length}
- Noodgevalle: ${filteredEmergencies.length}
- Aktiewe BOLOs: ${bolos.length}
- Gemonitorde POIs: ${pois.length}
- Gemonitorde VOIs: ${vois.length}

---
*Verslag outomaties saamgestel vir Hartbeesfontein Veiligheid Bestuur.*`;
    }

    setPreviewContent(content);
    setIsGenerating(false);
  };

  // Save to Archive
  const handleSaveToArchive = async () => {
    if (!previewContent) return;

    await saveGeneratedReport({
      reportType: selectedReportType,
      title: `${selectedReportType.replace(/_/g, ' ')} - ${range.label}`,
      confidentiality,
      dateRange: { start: range.startDate.toISOString(), end: range.endDate.toISOString(), filterOption: dateFilter },
      filtersUsed: { dateFilter, operatorFilter, confidentiality },
      pageCount: Math.ceil(previewContent.length / 1500) || 1,
      sampleSize: cases.length + emergencies.length,
      contentFormatted: previewContent,
    });

    logAuditEvent({
      recordType: 'REPORT',
      recordId: `RPT-${Date.now()}`,
      action: 'REPORT_GENERATED_AND_ARCHIVED',
      description: `Generated and archived ${selectedReportType} (${confidentiality})`,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCsv = (category: 'CASES' | 'EMERGENCIES' | 'POIS') => {
    let data: any[] = [];
    if (category === 'CASES') data = cases.filter((c) => isDateWithinRange(c.createdAt, range));
    if (category === 'EMERGENCIES') data = emergencies.filter((e) => isDateWithinRange(e.startTime, range));
    if (category === 'POIS') data = pois;

    exportToCsv(category, data, `Hartbeesfontein_${category}_${range.label.replace(/\s+/g, '_')}`);

    logAuditEvent({
      recordType: 'EXPORT',
      recordId: `EXP-${Date.now()}`,
      action: 'CSV_DATA_EXPORTED',
      description: `Exported ${category} dataset (${data.length} records) to CSV`,
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Sub Tabs */}
      <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 font-semibold">
        <button
          onClick={() => setActiveSubTab('BUILDER')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeSubTab === 'BUILDER'
              ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Report Generator & Live Preview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ARCHIVE')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition ${
            activeSubTab === 'ARCHIVE'
              ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Report Archive ({generatedReports.length})</span>
        </button>
      </div>

      {activeSubTab === 'BUILDER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Controls Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm">Report Configuration</h3>
              <p className="text-slate-400 text-xs">Select parameters, scope, and confidentiality.</p>
            </div>

            {/* Report Type Selector */}
            <div className="space-y-1.5">
              <label className="block text-slate-400 font-semibold">Report Type:</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="DAILY_SITUATION_REPORT">Daily Situation Report (SitRep)</option>
                <option value="CONTROL_ROOM_PERFORMANCE_REPORT">Control Room Performance & SLA Report</option>
                <option value="SECURITY_TREND_REPORT">Security & Crime Trend Analysis</option>
                <option value="WEEKLY_MANAGEMENT_REPORT">Weekly Executive Management Report</option>
                <option value="MONTHLY_MANAGEMENT_REPORT">Monthly District Operations Report</option>
                <option value="CASE_REPORT">Comprehensive Case & SAPS Status Report</option>
                <option value="EMERGENCY_REPORT">Emergency Incident Dispatch Report</option>
                <option value="BOLO_REPORT">BOLO & Sighting Intelligence Report</option>
              </select>
            </div>

            {/* Confidentiality Classification */}
            <div className="space-y-1.5">
              <label className="block text-slate-400 font-semibold">Classification & Demarcation:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfidentiality('PUBLIC')}
                  className={`p-2.5 rounded-xl border flex items-center gap-1.5 justify-center font-bold transition ${
                    confidentiality === 'PUBLIC'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>PUBLIC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfidentiality('INTERNAL')}
                  className={`p-2.5 rounded-xl border flex items-center gap-1.5 justify-center font-bold transition ${
                    confidentiality === 'INTERNAL'
                      ? 'bg-blue-950/60 border-blue-500 text-blue-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>INTERNAL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfidentiality('CONFIDENTIAL')}
                  className={`p-2.5 rounded-xl border flex items-center gap-1.5 justify-center font-bold transition ${
                    confidentiality === 'CONFIDENTIAL'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>CONFIDENTIAL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfidentiality('RESTRICTED')}
                  className={`p-2.5 rounded-xl border flex items-center gap-1.5 justify-center font-bold transition ${
                    confidentiality === 'RESTRICTED'
                      ? 'bg-red-950/60 border-red-500 text-red-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>RESTRICTED</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {confidentiality === 'PUBLIC'
                  ? 'Sanitizes gate codes, names, exact GPS, and medical details for public channel broadcast.'
                  : 'Includes confidential operational specifics strictly for Control Room & Executive Committee.'}
              </p>
            </div>

            {/* Timeframe Filter */}
            <div className="space-y-1.5">
              <label className="block text-slate-400 font-semibold">Timeframe:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="TODAY">Today</option>
                <option value="LAST_24_HOURS">Last 24 Hours</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="CUSTOM">Custom Date Range</option>
              </select>
            </div>

            {dateFilter === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">Start Date:</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">End Date:</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                  />
                </div>
              </div>
            )}

            {/* Operator filter for Control Room reports */}
            {selectedReportType === 'CONTROL_ROOM_PERFORMANCE_REPORT' && (
              <div className="space-y-1.5">
                <label className="block text-slate-400 font-semibold">Filter by Operator:</label>
                <select
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="ALL">All Operators</option>
                  <option value="USR-CTRL-002">Kobus Eloff (Shift Lead)</option>
                  <option value="USR-MGMT-003">Cornelius Hattingh (Management Admin)</option>
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Compiling Report...' : 'Compile & Preview Report'}</span>
              </button>

              {previewContent && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSaveToArchive}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{savedSuccess ? 'Archived!' : 'Save to Archive'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print / PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* CSV Quick Export Block */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Direct CSV Data Exports
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleExportCsv('CASES')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg text-center font-semibold text-[11px] transition"
                >
                  Cases CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCsv('EMERGENCIES')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg text-center font-semibold text-[11px] transition"
                >
                  Emergencies CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCsv('POIS')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg text-center font-semibold text-[11px] transition"
                >
                  POIs CSV
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            {previewContent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-white text-sm">Official Document Preview</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      confidentiality === 'PUBLIC'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : confidentiality === 'INTERNAL'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : confidentiality === 'CONFIDENTIAL'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {confidentiality}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-slate-200 text-xs whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed shadow-inner">
                  {previewContent}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Page 1 of 1 • Hartbeesfontein Veiligheid</span>
                  <span>Digitally Audited by {currentUser.name} {currentUser.surname}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 space-y-3">
                <FileText className="w-12 h-12 text-slate-700" />
                <div>
                  <p className="font-bold text-slate-400">No Report Generated Yet</p>
                  <p className="text-xs">Configure your parameters on the left and click Compile Report.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ARCHIVE TAB */}
      {activeSubTab === 'ARCHIVE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {generatedReports.length === 0 ? (
            <div className="p-10 text-center text-slate-500 space-y-2">
              <Archive className="w-10 h-10 mx-auto text-slate-700" />
              <p className="font-bold">No Archived Reports</p>
              <p className="text-xs">Generate and save reports to build an immutable audit history.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 text-[11px] uppercase font-bold">
                  <tr>
                    <th className="p-3.5">Report Title</th>
                    <th className="p-3.5">Classification</th>
                    <th className="p-3.5">Date Range</th>
                    <th className="p-3.5">Generated By</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {generatedReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5 font-bold text-white">{r.title}</td>
                      <td className="p-3.5 font-mono text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            r.confidentiality === 'PUBLIC'
                              ? 'bg-emerald-950 text-emerald-300'
                              : r.confidentiality === 'INTERNAL'
                              ? 'bg-blue-950 text-blue-300'
                              : 'bg-red-950 text-red-300'
                          }`}
                        >
                          {r.confidentiality}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                        {r.dateRange.filterOption}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {r.generatedByName} ({r.generatedByRole})
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(r.generatedTimestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setPreviewContent(r.contentFormatted);
                            setActiveSubTab('BUILDER');
                          }}
                          className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg font-bold transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
