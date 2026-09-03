import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderLock,
  Clock,
  MapPin,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Car,
  User,
  Users,
  Shield,
  ChevronRight,
  Eye,
  Camera,
  ZoomIn,
  X,
  Edit3,
  Trash2,
  BadgeCheck,
  Phone,
  Building2,
  Search,
  UserCheck,
  FileText,
  Share2,
  Home,
  Download,
  Radio,
  FileSpreadsheet,
  Activity,
  AlertOctagon,
  Sparkles,
  Check,
  Filter,
  ArrowUpDown,
  PhoneCall,
  Calendar,
  ExternalLink,
  MessageSquare,
  Lock,
  SlidersHorizontal,
  ArrowLeft,
  Maximize2,
  Minimize2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Case, CaseStatus, CasePriority, IncidentCategory, InvestigatingOfficer } from '../../types';
import { EditCaseModal } from '../common/EditCaseModal';
import { CaseSuspectsManager } from '../common/CaseSuspectsManager';
import { CaseStatusDropdown } from '../common/CaseStatusDropdown';
import { CaseStatusChangeModal } from '../common/CaseStatusChangeModal';
import { generateCaseIntelligenceSummary } from '../../services/geminiIntelService';
import { useBackButton } from '../../hooks/useBackButton';

export type InvestigationTab =
  | 'ALL'
  | 'OPEN'
  | 'INVESTIGATING'
  | 'ACTION_PENDING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CRITICAL'
  | 'SITREPS';

interface CaseInvestigationTrackerProps {
  onOpenReportIncident?: () => void;
  onOpenSituationReport?: () => void;
  initialSelectedCaseId?: string;
}

export const CaseInvestigationTracker: React.FC<CaseInvestigationTrackerProps> = ({
  onOpenReportIncident,
  onOpenSituationReport,
  initialSelectedCaseId,
}) => {
  const { t, language } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const {
    cases,
    situationReports,
    pois,
    vois,
    updateCaseStatus,
    addCaseUpdate,
    deleteCase,
  } = useData();

  const isManagement = currentUser?.role === 'MANAGEMENT' || activeRole === 'MANAGEMENT';

  // Navigation & Tabs state
  const [activeTab, setActiveTab] = useState<InvestigationTab>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialSelectedCaseId || null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'status' | 'caseNumber'>('newest');

  // Full Screen Dossier Tab Navigation
  const [dossierTab, setDossierTab] = useState<'overview' | 'saps' | 'suspects' | 'photos' | 'ai' | 'timeline'>('overview');

  // Investigation updates & AI Dossier
  const [newUpdateMessage, setNewUpdateMessage] = useState('');
  const [isInternalOnly, setIsInternalOnly] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [statusChangeSuccess, setStatusChangeSuccess] = useState<string | null>(null);

  // Status Change with Double Confirmation Prompt
  const [statusPromptData, setStatusPromptData] = useState<{ caseItem: Case; targetStatus: CaseStatus } | null>(null);

  const requestStatusChange = (caseItem: Case, targetStatus: CaseStatus) => {
    if (caseItem.status === targetStatus) return;
    setStatusPromptData({ caseItem, targetStatus });
  };

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(!!zoomedPhoto, () => setZoomedPhoto(null), 'cr-cases-zoom', 30);
  useBackButton(!!statusPromptData, () => setStatusPromptData(null), 'cr-cases-status-prompt', 25);
  useBackButton(!!editingCase, () => setEditingCase(null), 'cr-cases-edit-modal', 25);
  useBackButton(!!caseToDelete, () => setCaseToDelete(null), 'cr-cases-delete-prompt', 25);
  useBackButton(!!selectedCaseId, () => setSelectedCaseId(null), 'cr-cases-detail-view', 15);

  // Status metadata helper - clean, compact and subdued
  const STATUS_CONFIG: Record<
    CaseStatus,
    {
      labelEn: string;
      labelAf: string;
      bgBadge: string;
      borderBadge: string;
      textBadge: string;
      dotColor: string;
      icon: any;
      descriptionEn: string;
      descriptionAf: string;
    }
  > = {
    open: {
      labelEn: 'Open',
      labelAf: 'Oop',
      bgBadge: 'bg-slate-800/90',
      borderBadge: 'border-slate-700',
      textBadge: 'text-slate-200',
      dotColor: 'bg-blue-400',
      icon: Clock,
      descriptionEn: 'Newly logged incident awaiting officer / detective assessment',
      descriptionAf: 'Nuwe saak aangemeld, wag op toewysing',
    },
    investigating: {
      labelEn: 'Investigating',
      labelAf: 'Onder Ondersoek',
      bgBadge: 'bg-slate-800/90',
      borderBadge: 'border-amber-500/40',
      textBadge: 'text-amber-300',
      dotColor: 'bg-amber-400',
      icon: Search,
      descriptionEn: 'Active investigation in progress with detectives / Plaaswag field team',
      descriptionAf: 'Aktiewe ondersoek aan die gang met speurders / patrollie',
    },
    action_pending: {
      labelEn: 'Action Pending',
      labelAf: 'Aksie Hangende',
      bgBadge: 'bg-slate-800/90',
      borderBadge: 'border-purple-500/40',
      textBadge: 'text-purple-300',
      dotColor: 'bg-purple-400',
      icon: Activity,
      descriptionEn: 'Awaiting court date, SAPS docket feedback, or forensic results',
      descriptionAf: 'Wag op hofdatum, SAPD-dossier terugvoer of forensiese toetse',
    },
    resolved: {
      labelEn: 'Resolved',
      labelAf: 'Opgelos',
      bgBadge: 'bg-slate-800/90',
      borderBadge: 'border-emerald-500/40',
      textBadge: 'text-emerald-300',
      dotColor: 'bg-emerald-400',
      icon: CheckCircle2,
      descriptionEn: 'Suspects apprehended, property recovered, or inquiry completed',
      descriptionAf: 'Verdagtes vasgetrek, eiendom teruggevind, saak opgelos',
    },
    closed: {
      labelEn: 'Closed',
      labelAf: 'Gesluit',
      bgBadge: 'bg-slate-850',
      borderBadge: 'border-slate-750',
      textBadge: 'text-slate-400',
      dotColor: 'bg-slate-500',
      icon: Lock,
      descriptionEn: 'Docket finalized and safely archived in historical records',
      descriptionAf: 'Dossier gefinaliseer en geargiveer in geskiedenis',
    },
  };

  const PRIORITY_CONFIG: Record<CasePriority, { label: string; color: string; bg: string }> = {
    critical: { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-950/40 border-red-900/60' },
    high: { label: 'HIGH', color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-900/50' },
    medium: { label: 'MED', color: 'text-slate-300', bg: 'bg-slate-800 border-slate-700' },
    low: { label: 'LOW', color: 'text-slate-400', bg: 'bg-slate-850 border-slate-800' },
  };

  // Case counts by tab
  const counts = useMemo(() => {
    return {
      all: cases.length,
      open: cases.filter((c) => c.status === 'open').length,
      investigating: cases.filter((c) => c.status === 'investigating').length,
      action_pending: cases.filter((c) => c.status === 'action_pending').length,
      resolved: cases.filter((c) => c.status === 'resolved').length,
      closed: cases.filter((c) => c.status === 'closed').length,
      critical: cases.filter((c) => c.priority === 'critical' || c.priority === 'high').length,
      sitreps: cases.filter(
        (c) =>
          !!c.linkedSituationId ||
          c.title.toLowerCase().includes('sitrep') ||
          c.category === 'suspicious_activity' ||
          c.category === 'traffic_alert'
      ).length,
    };
  }, [cases]);

  // Tab Filter Logic
  const tabFilteredCases = useMemo(() => {
    switch (activeTab) {
      case 'OPEN':
        return cases.filter((c) => c.status === 'open');
      case 'INVESTIGATING':
        return cases.filter((c) => c.status === 'investigating');
      case 'ACTION_PENDING':
        return cases.filter((c) => c.status === 'action_pending');
      case 'RESOLVED':
        return cases.filter((c) => c.status === 'resolved');
      case 'CLOSED':
        return cases.filter((c) => c.status === 'closed');
      case 'CRITICAL':
        return cases.filter((c) => c.priority === 'critical' || c.priority === 'high');
      case 'SITREPS':
        return cases.filter(
          (c) =>
            !!c.linkedSituationId ||
            c.title.toLowerCase().includes('sitrep') ||
            c.category === 'suspicious_activity' ||
            c.category === 'traffic_alert'
        );
      case 'ALL':
      default:
        return cases;
    }
  }, [cases, activeTab]);

  // Search & Multi-Filters
  const filteredAndSortedCases = useMemo(() => {
    let list = [...tabFilteredCases];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const officerMatch = (c.investigatingOfficers || c.sapsDetails?.officers || []).some(
          (o) =>
            o.name.toLowerCase().includes(q) ||
            o.rank?.toLowerCase().includes(q) ||
            o.badgeNumber?.includes(q) ||
            o.station?.toLowerCase().includes(q)
        );
        const updatesMatch = (c.updates || []).some(
          (u) => u.message.toLowerCase().includes(q) || u.authorName.toLowerCase().includes(q)
        );
        return (
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.locationName.toLowerCase().includes(q) ||
          (c.sector && c.sector.toLowerCase().includes(q)) ||
          (c.farmName && c.farmName.toLowerCase().includes(q)) ||
          (c.victimName && c.victimName.toLowerCase().includes(q)) ||
          (c.reportedByName && c.reportedByName.toLowerCase().includes(q)) ||
          (c.sapsCaseNumber && c.sapsCaseNumber.toLowerCase().includes(q)) ||
          (c.sapsStation && c.sapsStation.toLowerCase().includes(q)) ||
          (c.sapsDetails?.obNumber && c.sapsDetails.obNumber.toLowerCase().includes(q)) ||
          officerMatch ||
          updatesMatch
        );
      });
    }

    // Sector Filter
    if (selectedSector !== 'ALL') {
      list = list.filter((c) => c.sector === selectedSector || (c.locationName && c.locationName.includes(selectedSector)));
    }

    // Category Filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Priority Filter
    if (selectedPriority !== 'ALL') {
      list = list.filter((c) => c.priority === selectedPriority);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || `${b.incidentDate}T${b.incidentTime}`).getTime() -
          new Date(a.createdAt || `${a.incidentDate}T${a.incidentTime}`).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || `${a.incidentDate}T${a.incidentTime}`).getTime() -
          new Date(b.createdAt || `${b.incidentDate}T${b.incidentTime}`).getTime();
      }
      if (sortBy === 'priority') {
        const pOrder: Record<CasePriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === 'status') {
        const sOrder: Record<CaseStatus, number> = { open: 5, investigating: 4, action_pending: 3, resolved: 2, closed: 1 };
        return (sOrder[b.status] || 0) - (sOrder[a.status] || 0);
      }
      if (sortBy === 'caseNumber') {
        return b.caseNumber.localeCompare(a.caseNumber);
      }
      return 0;
    });

    return list;
  }, [tabFilteredCases, searchQuery, selectedSector, selectedCategory, selectedPriority, sortBy]);

  // Keyboard ESC listener to close full screen case view or photo zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedPhoto) {
          setZoomedPhoto(null);
        } else if (selectedCaseId) {
          setSelectedCaseId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedPhoto, selectedCaseId]);

  // Selected Case Object (reactive to global state updates)
  const currentCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  // Quick Status Transition Handler
  const handleQuickStatusChange = (caseId: string, newStatus: CaseStatus, note?: string) => {
    updateCaseStatus(caseId, newStatus);
    if (note && note.trim()) {
      addCaseUpdate(caseId, `[Status update: ${newStatus.toUpperCase()}] ${note.trim()}`, false);
    }
    const target = cases.find((c) => c.id === caseId);
    setStatusChangeSuccess(`Case ${target?.caseNumber || caseId} status set to ${STATUS_CONFIG[newStatus].labelEn}`);
    setTimeout(() => setStatusChangeSuccess(null), 3500);
  };

  // Add Case Note / Update
  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCase || !newUpdateMessage.trim()) return;

    addCaseUpdate(currentCase.id, newUpdateMessage.trim(), isInternalOnly);
    setNewUpdateMessage('');
    setIsInternalOnly(false);
  };

  // Generate AI Intelligence Summary
  const handleGenerateAiSummary = async (caseObj: Case) => {
    setIsGeneratingAiSummary(true);
    try {
      const summary = await generateCaseIntelligenceSummary({
        caseRecord: caseObj,
        relatedIntel: { pois, vois },
        language: language as 'af' | 'en',
      });
      setAiSummary(summary);
    } catch (err) {
      console.error('Error generating AI Case Summary:', err);
      setAiSummary('Failed to generate summary. Please review investigation logs directly.');
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  // WhatsApp Share Case Brief
  const handleShareDocketWhatsApp = (c: Case) => {
    const sapsInfo = c.sapsCaseNumber
      ? `*SAPS CAS/MAS:* ${c.sapsCaseNumber} (${c.sapsStation || 'Hartbeesfontein SAPS'})\n*OB #:* ${c.sapsDetails?.obNumber || 'N/A'}\n`
      : '';
    const officersInfo = (c.investigatingOfficers || [])
      .map((o) => `• ${o.rank || 'Officer'} ${o.name} (${o.phone || 'No phone'})`)
      .join('\n');

    const text = encodeURIComponent(
      `🚨 *HARTBEESFONTEIN VEILIGHEID - CASE INVESTIGATION DOSSIER*\n` +
      `*Saak / Case #:* ${c.caseNumber}\n` +
      `*Title:* ${c.title}\n` +
      `*Status:* ${STATUS_CONFIG[c.status]?.labelEn.toUpperCase()} | *Priority:* ${c.priority.toUpperCase()}\n` +
      `*Date/Time:* ${c.incidentDate} om ${c.incidentTime}\n` +
      `*Location:* ${c.locationName} (${c.sector || 'Sektor Algemeen'})\n` +
      sapsInfo +
      (officersInfo ? `*Investigating Officers:*\n${officersInfo}\n` : '') +
      `*Description:*\n${c.description}\n\n` +
      `_Uitgereik deur Hartbeesfontein Beheerkamer & Ondersoekeenheid_`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Distinct sectors available for filtering
  const sectorList = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      if (c.sector) set.add(c.sector);
    });
    return Array.from(set);
  }, [cases]);

  return (
    <div className="max-w-7xl mx-auto px-3 py-3 space-y-3 font-sans text-slate-100">
      {/* 1. TOP HEADER & METRICS STRIP */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
              <FolderLock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Case & Investigation Tracker
                </h1>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-800 text-slate-300 border border-slate-700 rounded">
                  CID & Control
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage incident dockets, SAPS CAS/MAS details, and detective investigation lifecycles.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenReportIncident && (
              <button
                onClick={onOpenReportIncident}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                title="Log New Incident Case"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Case</span>
              </button>
            )}

            {onOpenSituationReport && (
              <button
                onClick={onOpenSituationReport}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
                title="Broadcast Situation Report"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>+ SITREP</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Status Toast */}
        {statusChangeSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-emerald-300 font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{statusChangeSuccess}</span>
          </div>
        )}

        {/* Compact Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-xs">
          <div
            onClick={() => { setActiveTab('ALL'); setSelectedCaseId(null); }}
            className={`p-2 rounded-xl border cursor-pointer transition ${
              activeTab === 'ALL'
                ? 'bg-slate-800 border-amber-500/60 shadow-sm'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-400 font-semibold uppercase">All Cases</div>
            <div className="text-sm sm:text-base font-mono font-bold text-white">{counts.all}</div>
          </div>

          <div
            onClick={() => { setActiveTab('OPEN'); setSelectedCaseId(null); }}
            className={`p-2 rounded-xl border cursor-pointer transition ${
              activeTab === 'OPEN'
                ? 'bg-slate-800 border-slate-600 shadow-sm'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-300 font-semibold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Open
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-200">{counts.open}</div>
          </div>

          <div
            onClick={() => { setActiveTab('INVESTIGATING'); setSelectedCaseId(null); }}
            className={`p-2 rounded-xl border cursor-pointer transition ${
              activeTab === 'INVESTIGATING'
                ? 'bg-slate-800 border-amber-500/60 shadow-sm'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-amber-300 font-semibold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Investigating
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-amber-300">{counts.investigating}</div>
          </div>

          <div
            onClick={() => { setActiveTab('ACTION_PENDING'); setSelectedCaseId(null); }}
            className={`p-2 rounded-xl border cursor-pointer transition ${
              activeTab === 'ACTION_PENDING'
                ? 'bg-slate-800 border-purple-500/60 shadow-sm'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-purple-300 font-semibold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Pending
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-purple-300">{counts.action_pending}</div>
          </div>

          <div
            onClick={() => { setActiveTab('RESOLVED'); setSelectedCaseId(null); }}
            className={`p-2 rounded-xl border cursor-pointer transition ${
              activeTab === 'RESOLVED'
                ? 'bg-slate-800 border-emerald-500/60 shadow-sm'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-emerald-300 font-semibold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Resolved
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-emerald-300">{counts.resolved}</div>
          </div>

          <div
            onClick={() => { setActiveTab('CLOSED'); setSelectedCaseId(null); }}
            className={`p-2 rounded-xl border cursor-pointer transition ${
              activeTab === 'CLOSED'
                ? 'bg-slate-800 border-slate-600 shadow-sm'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Closed
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-400">{counts.closed}</div>
          </div>

          <div
            onClick={() => { setActiveTab('CRITICAL'); setSelectedCaseId(null); }}
            className={`p-2 rounded-xl border cursor-pointer transition col-span-2 sm:col-span-1 ${
              activeTab === 'CRITICAL'
                ? 'bg-slate-800 border-red-500/60 shadow-sm'
                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-red-300 font-semibold uppercase flex items-center gap-1">
              <AlertOctagon className="w-3 h-3 text-red-400" />
              Critical
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-red-400">{counts.critical}</div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & MULTI-FILTER BAR */}
      <div className="space-y-2">
        {/* Navigation Tabs - Clean unified dark styling */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs font-medium scrollbar-none">
          <button
            onClick={() => { setActiveTab('ALL'); setSelectedCaseId(null); }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>All ({counts.all})</span>
          </button>

          <button
            onClick={() => { setActiveTab('OPEN'); setSelectedCaseId(null); }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'OPEN'
                ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Open ({counts.open})</span>
          </button>

          <button
            onClick={() => { setActiveTab('INVESTIGATING'); setSelectedCaseId(null); }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'INVESTIGATING'
                ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Investigating ({counts.investigating})</span>
          </button>

          <button
            onClick={() => { setActiveTab('ACTION_PENDING'); setSelectedCaseId(null); }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'ACTION_PENDING'
                ? 'bg-slate-800 text-purple-300 font-bold border border-slate-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Pending ({counts.action_pending})</span>
          </button>

          <button
            onClick={() => { setActiveTab('RESOLVED'); setSelectedCaseId(null); }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'RESOLVED'
                ? 'bg-slate-800 text-emerald-300 font-bold border border-slate-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Resolved ({counts.resolved})</span>
          </button>

          <button
            onClick={() => { setActiveTab('CLOSED'); setSelectedCaseId(null); }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'CLOSED'
                ? 'bg-slate-800 text-slate-300 font-bold border border-slate-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Closed ({counts.closed})</span>
          </button>

          <button
            onClick={() => { setActiveTab('CRITICAL'); setSelectedCaseId(null); }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'CRITICAL'
                ? 'bg-slate-800 text-red-300 font-bold border border-slate-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Critical ({counts.critical})</span>
          </button>

          <button
            onClick={() => { setActiveTab('SITREPS'); setSelectedCaseId(null); }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'SITREPS'
                ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>SITREPs ({counts.sitreps})</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Case #, CAS/MAS, Title, Officer, Location, Suspect..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-white placeholder:text-slate-500 outline-none focus:border-slate-600 transition text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Dropdown Filters & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Sector */}
            {sectorList.length > 0 && (
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-slate-600"
              >
                <option value="ALL">All Sectors</option>
                {sectorList.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            )}

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-slate-600"
            >
              <option value="ALL">All Categories</option>
              <option value="attack">Attack / Pluimvee</option>
              <option value="robbery">Robbery</option>
              <option value="theft">Theft / Burglary</option>
              <option value="stock_theft">Stock Theft</option>
              <option value="housebreaking">Housebreaking</option>
              <option value="suspicious_person">Suspicious Person</option>
              <option value="suspicious_vehicle">Suspicious Vehicle</option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="fence_damage">Fence Damage</option>
              <option value="fire">Fire / Arson</option>
            </select>

            {/* Priority */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-slate-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Sort */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority Order</option>
                <option value="status">Status Order</option>
                <option value="caseNumber">Case Number</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs Dense Table */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded transition ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Compact Grid Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1 rounded transition ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dense Table Rows"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: COMPACT CASES GRID OR DENSE TABLE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-medium">
          <span>
            Showing <b className="text-white">{filteredAndSortedCases.length}</b> case{filteredAndSortedCases.length !== 1 ? 's' : ''} in <span className="text-slate-200 font-semibold">{activeTab}</span>
          </span>
          {(searchQuery || selectedCategory !== 'ALL' || selectedPriority !== 'ALL' || selectedSector !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedPriority('ALL');
                setSelectedSector('ALL');
              }}
              className="text-amber-400 hover:underline text-[11px]"
            >
              Clear Filters
            </button>
          )}
        </div>

        {filteredAndSortedCases.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <FolderLock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">No Cases Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no cases matching the filter criteria in the <b className="text-slate-300">{activeTab}</b> tab.
            </p>
            {onOpenReportIncident && (
              <button
                onClick={onOpenReportIncident}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Incident Case</span>
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* DENSE TABLE VIEW FOR HIGH-DENSITY AUDIT */
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Case #</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Title & Location</th>
                    <th className="py-2.5 px-3">SAPS CAS #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredAndSortedCases.map((caseItem) => {
                    const priorityMeta = PRIORITY_CONFIG[caseItem.priority] || PRIORITY_CONFIG.medium;
                    return (
                      <tr
                        key={caseItem.id}
                        onClick={() => setSelectedCaseId(caseItem.id)}
                        className="hover:bg-slate-850/80 cursor-pointer transition group"
                      >
                        <td className="py-2 px-3 font-mono font-bold text-white whitespace-nowrap">
                          {caseItem.caseNumber}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <CaseStatusDropdown
                            caseItem={caseItem}
                            onRequestChange={requestStatusChange}
                            size="sm"
                          />
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${priorityMeta.bg} ${priorityMeta.color}`}>
                            {priorityMeta.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 min-w-[200px]">
                          <div className="font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                            {caseItem.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {caseItem.locationName} {caseItem.sector ? `• ${caseItem.sector}` : ''}
                          </div>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {caseItem.sapsCaseNumber ? (
                            <span className="font-mono text-slate-200 text-[11px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                              {caseItem.sapsCaseNumber}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {caseItem.incidentDate}
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingCase(caseItem)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              title="Edit Case"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleShareDocketWhatsApp(caseItem)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400"
                              title="WhatsApp Brief"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setSelectedCaseId(caseItem.id)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              title="Open Dossier"
                            >
                              <Maximize2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* COMPACT CARD GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredAndSortedCases.map((caseItem) => {
              const statusMeta = STATUS_CONFIG[caseItem.status] || STATUS_CONFIG.open;
              const priorityMeta = PRIORITY_CONFIG[caseItem.priority] || PRIORITY_CONFIG.medium;
              const isSelected = selectedCaseId === caseItem.id;
              const officers = caseItem.investigatingOfficers || caseItem.sapsDetails?.officers || [];
              const photoCount = caseItem.photos?.length || 0;
              const updateCount = caseItem.updates?.length || 0;

              return (
                <div
                  key={caseItem.id}
                  onClick={() => setSelectedCaseId(caseItem.id)}
                  className={`rounded-xl border transition cursor-pointer flex flex-col justify-between group p-3.5 space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/90'
                  }`}
                >
                  {/* Top Bar: Case #, Priority, Category, Status dropdown */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {caseItem.caseNumber}
                        </span>

                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold uppercase ${priorityMeta.bg} ${priorityMeta.color}`}>
                          {priorityMeta.label}
                        </span>

                        <span className="text-[10px] text-slate-400 font-medium capitalize bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-750">
                          {caseItem.category.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Direct Status Selector Dropdown on Card */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <CaseStatusDropdown
                          caseItem={caseItem}
                          onRequestChange={requestStatusChange}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* SAPS CAS line if present */}
                    {caseItem.sapsCaseNumber && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="font-bold">{caseItem.sapsCaseNumber}</span>
                        <span className="text-slate-400 font-sans font-normal text-[10px]">
                          • {caseItem.sapsStation || 'Hartbeesfontein SAPS'}
                        </span>
                      </div>
                    )}

                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {caseItem.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
                      {caseItem.description}
                    </p>
                  </div>

                  {/* Metadata & Actions Footer */}
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-slate-300 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{caseItem.locationName}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 shrink-0 font-mono text-[10px]">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{caseItem.incidentDate}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        {officers.length > 0 && (
                          <span className="flex items-center gap-1 text-slate-300 text-[10px]">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            <span>{officers.length} Off.</span>
                          </span>
                        )}

                        {photoCount > 0 && (
                          <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                            <Camera className="w-3 h-3 text-slate-500" />
                            <span>{photoCount}</span>
                          </span>
                        )}

                        {updateCount > 0 && (
                          <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                            <MessageSquare className="w-3 h-3 text-slate-500" />
                            <span>{updateCount}</span>
                          </span>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingCase(caseItem)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                          title="Edit Full Case & Officers"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleShareDocketWhatsApp(caseItem)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition"
                          title="Share Case Brief to WhatsApp"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => setSelectedCaseId(caseItem.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. FULL SCREEN CASE INVESTIGATION DOSSIER MODAL / OVERLAY - MONOCHROME LIGHT THEME ALL-IN-ONE */}
      {currentCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto flex flex-col items-center justify-start p-2 sm:p-4 text-gray-900 animate-fadeIn">
          {/* Inner Modal Container */}
          <div className="w-full max-w-7xl bg-white border border-gray-400 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto">
            {/* Sticky Fullscreen Top Navigation Header - Light & Monochrome */}
            <div className="bg-gray-100 border-b border-gray-300 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
              {/* Left: Back button & Case badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCaseId(null)}
                  className="bg-white hover:bg-gray-200 text-gray-900 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition border border-gray-400 active:scale-95 shadow-xs"
                  title="Return to Cases list (Esc)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                  <span className="text-[10px] text-gray-500 font-mono hidden md:inline">(Esc)</span>
                </button>

                <div className="h-4 w-px bg-gray-300 hidden sm:block" />

                <span className="font-mono font-bold text-xs text-white bg-black px-2 py-1 rounded-md">
                  {currentCase.caseNumber}
                </span>

                {currentCase.sapsCaseNumber && (
                  <span className="font-mono font-semibold text-xs text-gray-900 bg-gray-200 px-2 py-1 rounded-md border border-gray-400 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-gray-700" />
                    <span>CAS: {currentCase.sapsCaseNumber}</span>
                  </span>
                )}

                <span className="text-[10px] px-2 py-0.5 rounded border border-gray-400 font-bold uppercase bg-gray-200 text-gray-900 font-mono">
                  {currentCase.priority} Priority
                </span>

                <span className="text-[10px] px-2 py-0.5 rounded border border-gray-300 font-semibold uppercase bg-gray-100 text-gray-800">
                  {currentCase.category.replace('_', ' ')}
                </span>
              </div>

              {/* Right: Quick actions and Close button */}
              <div className="flex items-center gap-1.5">
                <CaseStatusDropdown
                  caseItem={currentCase}
                  onRequestChange={requestStatusChange}
                  size="sm"
                  theme="monochrome"
                />

                <button
                  onClick={() => handleShareDocketWhatsApp(currentCase)}
                  className="bg-white hover:bg-gray-200 text-gray-900 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-gray-300 transition"
                  title="Share WhatsApp Case Brief"
                >
                  <Share2 className="w-3.5 h-3.5 text-gray-700" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  onClick={() => setEditingCase(currentCase)}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-1 border border-gray-300 transition"
                  title="Edit Full Case"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-700" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                {isManagement && (
                  <button
                    onClick={() => setCaseToDelete(currentCase)}
                    className="p-1.5 bg-white hover:bg-gray-200 text-gray-700 hover:text-black border border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    title="Delete Case"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedCaseId(null)}
                  className="p-1.5 bg-white hover:bg-gray-200 text-gray-700 hover:text-black rounded-lg border border-gray-300 transition"
                  title="Close Full Screen (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Dossier Workspace - All Data Visible on One Screen */}
            <div className="p-3 sm:p-4 space-y-3 bg-gray-50 flex-1 overflow-y-auto max-h-[calc(90vh-60px)]">
              {/* Top Case Title & 4 Compact Key Fact Blocks */}
              <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                    {currentCase.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                    <span>Logged:</span>
                    <span>{new Date(currentCase.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* 4 Compact Key Fact Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                  {/* 1. Location */}
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-2 space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-600" />
                      <span>Location / Sector</span>
                    </div>
                    <div className="font-bold text-gray-900 truncate" title={currentCase.locationName}>
                      {currentCase.locationName}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                      {currentCase.farmName ? `Farm: ${currentCase.farmName}` : (currentCase.sector ? `Sector ${currentCase.sector}` : 'No sector logged')}
                    </div>
                  </div>

                  {/* 2. Incident Date & Time */}
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-2 space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-600" />
                      <span>Incident Date & Time</span>
                    </div>
                    <div className="font-bold text-gray-900 font-mono">
                      {currentCase.incidentDate}
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono">
                      {currentCase.incidentTime || 'Time unrecorded'}
                    </div>
                  </div>

                  {/* 3. Complainant / Victim */}
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-2 space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-600" />
                      <span>Complainant / Victim</span>
                    </div>
                    <div className="font-bold text-gray-900 truncate">
                      {currentCase.victimName || currentCase.reportedByName || 'Resident'}
                    </div>
                    {currentCase.victimPhone ? (
                      <a
                        href={`tel:${currentCase.victimPhone}`}
                        className="text-[10px] text-gray-800 hover:underline flex items-center gap-1 font-mono font-bold"
                      >
                        <Phone className="w-2.5 h-2.5 text-gray-600" />
                        <span>{currentCase.victimPhone}</span>
                      </a>
                    ) : (
                      <div className="text-[10px] text-gray-500">No phone logged</div>
                    )}
                  </div>

                  {/* 4. SAPS Police CAS & Lead Officer */}
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-2 space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3 text-gray-700" />
                      <span>SAPS Police Docket</span>
                    </div>
                    <div className="font-mono font-bold text-gray-900 truncate">
                      {currentCase.sapsCaseNumber || 'CAS Pending'}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                      {(currentCase.investigatingOfficers && currentCase.investigatingOfficers[0]?.name)
                        ? `${currentCase.investigatingOfficers[0].rank || 'Off.'} ${currentCase.investigatingOfficers[0].name}`
                        : (currentCase.sapsStation || 'Hartbeesfontein SAPS')}
                    </div>
                  </div>
                </div>

                {/* Status Phase Tracker */}
                <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold">
                    <Activity className="w-3.5 h-3.5 text-gray-600" />
                    <span>Investigation Phase:</span>
                    <span className="font-bold text-black font-mono bg-gray-200 px-2 py-0.5 rounded border border-gray-400">
                      {STATUS_CONFIG[currentCase.status]?.labelEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    {(['open', 'investigating', 'action_pending', 'resolved', 'closed'] as CaseStatus[]).map((st, index) => {
                      const isCurrent = currentCase.status === st;
                      const meta = STATUS_CONFIG[st];

                      return (
                        <button
                          key={st}
                          onClick={() => requestStatusChange(currentCase, st)}
                          className={`py-1 px-2 rounded font-semibold transition flex items-center gap-1 border text-[10px] ${
                            isCurrent
                              ? 'bg-black border-black text-white font-bold'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="opacity-60 font-mono">{index + 1}.</span>
                          <span className="truncate">{meta.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3-COLUMN ALL-IN-ONE SCREEN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                
                {/* ===== COLUMN 1: NARRATIVE & POLICE DOCKET ===== */}
                <div className="space-y-3">
                  {/* Narrative Statement Box */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-700" />
                        <span>Incident Narrative & Details</span>
                      </h3>
                      <button
                        onClick={() => navigator.clipboard.writeText(currentCase.description)}
                        className="text-[10px] text-gray-700 hover:text-black flex items-center gap-1 font-semibold bg-gray-100 px-2 py-0.5 rounded border border-gray-300"
                        title="Copy description"
                      >
                        <span>Copy</span>
                      </button>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {currentCase.description}
                    </div>

                    {/* Modus Operandi Tags */}
                    {currentCase.modusOperandi && currentCase.modusOperandi.length > 0 && (
                      <div className="pt-1.5 border-t border-gray-200 space-y-1">
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider block">
                          Modus Operandi:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {currentCase.modusOperandi.map((mo, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-gray-200 text-gray-900 border border-gray-400 px-1.5 py-0.5 rounded font-mono font-semibold"
                            >
                              {mo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Physical & Vehicle Clues */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs text-xs">
                    <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                      <User className="w-3.5 h-3.5 text-gray-700" />
                      <span>Suspect & Vehicle Clues</span>
                    </h3>

                    {currentCase.personDescription ? (
                      <div className="bg-gray-50 p-2 rounded border border-gray-200 space-y-0.5">
                        <span className="text-[10px] text-gray-700 font-bold uppercase flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-600" /> Suspect Physical Traits
                        </span>
                        <p className="text-gray-900 text-xs">
                          {currentCase.personDescription.clothing || currentCase.personDescription.buildHeight || 'Recorded traits'}
                        </p>
                        {currentCase.personDescription.identifyingMarks && (
                          <p className="text-[10px] text-gray-600 italic">
                            Marks: {currentCase.personDescription.identifyingMarks}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-200">
                        No physical traits recorded.
                      </div>
                    )}

                    {currentCase.vehicleInfo ? (
                      <div className="bg-gray-50 p-2 rounded border border-gray-200 space-y-0.5">
                        <span className="text-[10px] text-gray-700 font-bold uppercase flex items-center gap-1">
                          <Car className="w-3 h-3 text-gray-600" /> Suspect Vehicle
                        </span>
                        <p className="text-gray-900 text-xs font-semibold">
                          {currentCase.vehicleInfo.makeModel || currentCase.vehicleInfo.color
                            ? `${currentCase.vehicleInfo.color || ''} ${currentCase.vehicleInfo.makeModel || ''}`
                            : 'Vehicle noted'}
                          {currentCase.vehicleInfo.plate ? ` • Reg: ${currentCase.vehicleInfo.plate}` : ''}
                        </p>
                        {currentCase.vehicleInfo.notes && (
                          <p className="text-[10px] text-gray-600 italic">{currentCase.vehicleInfo.notes}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-200">
                        No vehicle details logged.
                      </div>
                    )}
                  </div>

                  {/* SAPS Police Docket & Assigned Officers */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-gray-700" />
                        <span>Official SAPS Docket Information</span>
                      </div>
                      <button
                        onClick={() => setEditingCase(currentCase)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition border border-gray-400"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit SAPS</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded border border-gray-200">
                        <span className="text-[10px] text-gray-500 font-bold uppercase block">CAS Docket #</span>
                        <span className="font-mono font-bold text-gray-900 text-xs">
                          {currentCase.sapsCaseNumber || currentCase.sapsDetails?.caseNumber || 'Not recorded'}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded border border-gray-200">
                        <span className="text-[10px] text-gray-500 font-bold uppercase block">Station</span>
                        <span className="font-semibold text-gray-900 text-xs truncate block">
                          {currentCase.sapsStation || currentCase.sapsDetails?.station || 'Hartbeesfontein SAPS'}
                        </span>
                      </div>
                    </div>

                    {/* Detective List */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-600 font-bold uppercase flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-gray-600" />
                        <span>Assigned Investigating Officers</span>
                      </span>

                      {((currentCase.investigatingOfficers && currentCase.investigatingOfficers.length > 0) ||
                        (currentCase.sapsDetails?.officers && currentCase.sapsDetails.officers.length > 0)) ? (
                        <div className="space-y-1.5">
                          {(currentCase.investigatingOfficers || currentCase.sapsDetails?.officers || []).map((officer, idx) => (
                            <div
                              key={officer.id || idx}
                              className="bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-gray-900 truncate">
                                  {officer.name}
                                </div>
                                <div className="text-[10px] text-gray-600 truncate">
                                  {officer.rank || 'Detective'} {officer.badgeNumber ? `• #${officer.badgeNumber}` : ''} {officer.unit ? `• ${officer.unit}` : ''}
                                </div>
                              </div>
                              {officer.phone && (
                                <a
                                  href={`tel:${officer.phone}`}
                                  className="px-2 py-1 bg-gray-900 hover:bg-black text-white rounded text-[10px] flex items-center gap-1 font-bold shrink-0"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>Call</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-200">
                          No detectives assigned yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== COLUMN 2: SUSPECTS / POIS & EVIDENCE PHOTOS & AI ===== */}
                <div className="space-y-3">
                  {/* Suspects & Persons of Interest Component */}
                  <CaseSuspectsManager caseItem={currentCase} variant="monochrome" />

                  {/* Evidence & Crime Scene Media */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-gray-700" />
                        <span>Evidence & Photos ({currentCase.photos?.length || 0})</span>
                      </h3>
                      <button
                        onClick={() => setEditingCase(currentCase)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition border border-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Photo</span>
                      </button>
                    </div>

                    {currentCase.photos && currentCase.photos.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {currentCase.photos.map((photoUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setZoomedPhoto(photoUrl)}
                            className="aspect-square bg-gray-200 rounded-md overflow-hidden border border-gray-300 cursor-pointer relative group"
                          >
                            <img
                              src={photoUrl}
                              alt={`Evidence ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center text-xs text-gray-500">
                        No photos attached.
                      </div>
                    )}
                  </div>

                  {/* AI Intel Analysis Box */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gray-700" />
                        <span>Investigation Briefing</span>
                      </div>
                      <button
                        onClick={() => handleGenerateAiSummary(currentCase)}
                        disabled={isGeneratingAiSummary}
                        className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-semibold px-2.5 py-1 rounded text-xs flex items-center gap-1 transition shadow-xs"
                      >
                        <Sparkles className={`w-3 h-3 ${isGeneratingAiSummary ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingAiSummary ? 'Analyzing...' : aiSummary ? 'Regenerate' : 'Generate Briefing'}</span>
                      </button>
                    </div>

                    {aiSummary ? (
                      <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs text-gray-900 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {aiSummary}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-center text-xs text-gray-600 space-y-1">
                        <p className="text-[11px]">Generate cross-correlated suspect, vehicle, and MO analysis summary.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ===== COLUMN 3: AUDIT TRAIL & QUICK UPDATE ENTRY ===== */}
                <div className="space-y-3">
                  {/* Add New Case Update Form */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-gray-700" />
                      <span>Record Investigative Action / Note</span>
                    </h3>

                    <form onSubmit={handlePostUpdate} className="space-y-2">
                      <textarea
                        rows={2}
                        value={newUpdateMessage}
                        onChange={(e) => setNewUpdateMessage(e.target.value)}
                        placeholder="Log detective action, statement note, or lead update..."
                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-xs text-gray-900 placeholder:text-gray-500 outline-none focus:border-black transition"
                      />
                      <div className="flex items-center justify-between text-xs flex-wrap gap-1.5">
                        <label className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isInternalOnly}
                            onChange={(e) => setIsInternalOnly(e.target.checked)}
                            className="w-3.5 h-3.5 accent-black rounded"
                          />
                          <span>Internal Note</span>
                        </label>

                        <button
                          type="submit"
                          disabled={!newUpdateMessage.trim()}
                          className="bg-black hover:bg-gray-800 disabled:opacity-40 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition"
                        >
                          <Send className="w-3 h-3" />
                          <span>Post Note</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Investigation Audit Trail */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-700" />
                        <span>Audit Trail ({currentCase.updates?.length || 0})</span>
                      </h3>
                    </div>

                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                      {(!currentCase.updates || currentCase.updates.length === 0) ? (
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center text-xs text-gray-500">
                          No investigative notes recorded yet.
                        </div>
                      ) : (
                        [...currentCase.updates]
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((upd) => (
                            <div
                              key={upd.id}
                              className="p-2 rounded border bg-gray-50 border-gray-300 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span className="font-bold text-gray-900 flex items-center gap-1">
                                  <span>{upd.authorName}</span>
                                  <span className="text-gray-500 font-mono text-[10px]">({upd.authorRole})</span>
                                  {upd.isInternalOnly && (
                                    <span className="bg-gray-200 text-gray-800 border border-gray-400 px-1 py-0.2 rounded text-[9px] font-bold">
                                      INTERNAL
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono text-[10px]">{new Date(upd.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                              <p className="text-xs leading-relaxed whitespace-pre-wrap text-gray-800">{upd.message}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODALS & POPUPS */}
      {/* Full Edit Case Modal */}
      {editingCase && (
        <EditCaseModal
          caseItem={editingCase}
          isOpen={!!editingCase}
          onClose={() => setEditingCase(null)}
        />
      )}

      {/* Photo Lightbox */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedPhoto}
              alt="Evidence Zoom"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-700 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Double Confirmation Status Change Modal */}
      <CaseStatusChangeModal
        isOpen={!!statusPromptData}
        caseItem={statusPromptData?.caseItem || null}
        targetStatus={statusPromptData?.targetStatus || null}
        onClose={() => setStatusPromptData(null)}
        onConfirm={(caseId, newStatus, note) => {
          handleQuickStatusChange(caseId, newStatus, note);
        }}
        isManagement={isManagement}
      />

      {/* Delete Case Confirmation Modal */}
      {caseToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Permanently Delete Case?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete case <strong className="text-white">{caseToDelete.caseNumber}</strong>? This will remove all associated logs and SAPS details.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCaseToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteCase(caseToDelete.id);
                  setIsDeleting(false);
                  if (selectedCaseId === caseToDelete.id) {
                    setSelectedCaseId(null);
                  }
                  setCaseToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                {isDeleting ? 'Deleting...' : 'Delete Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
