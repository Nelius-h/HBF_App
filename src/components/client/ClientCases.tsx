import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Clock,
  MapPin,
  Plus,
  Send,
  Paperclip,
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
  Mic,
  Volume2,
  Download,
  Radio,
  FileSpreadsheet,
  ArrowLeft,
  Maximize2,
  Calendar,
  Activity,
  PhoneCall,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Case, CaseStatus } from '../../types';
import { EditCaseModal } from '../common/EditCaseModal';
import { CaseSuspectsManager } from '../common/CaseSuspectsManager';
import { CaseStatusDropdown } from '../common/CaseStatusDropdown';
import { CaseStatusChangeModal } from '../common/CaseStatusChangeModal';
import { useBackButton } from '../../hooks/useBackButton';

const STATUS_CONFIG: Record<
  CaseStatus,
  { labelEn: string; labelAf: string }
> = {
  open: { labelEn: 'Open', labelAf: 'Oop' },
  investigating: { labelEn: 'Investigating', labelAf: 'Onder Ondersoek' },
  action_pending: { labelEn: 'Action Pending', labelAf: 'Aksie Hangende' },
  resolved: { labelEn: 'Resolved', labelAf: 'Opgelos' },
  closed: { labelEn: 'Closed', labelAf: 'Gesluit' },
};

export const ClientCases: React.FC = () => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const { cases, situationReports, addCaseUpdate, deleteCase, updateCaseStatus } = useData();

  const isManagement = currentUser?.role === 'MANAGEMENT' || activeRole === 'MANAGEMENT';

  const [activeTab, setActiveTab] = useState<'MY_OPEN' | 'MY_CLOSED' | 'COMMUNITY' | 'SITREPS' | 'ALL'>('MY_OPEN');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'saps' | 'suspects' | 'evidence' | 'timeline'>('overview');
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUpdateMessage, setNewUpdateMessage] = useState('');
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Status Change with Double Prompt
  const [statusPromptData, setStatusPromptData] = useState<{ caseItem: Case; targetStatus: CaseStatus } | null>(null);

  const requestStatusChange = (caseItem: Case, targetStatus: CaseStatus) => {
    if (caseItem.status === targetStatus) return;
    setStatusPromptData({ caseItem, targetStatus });
  };

  const handleStatusChangeConfirmed = (caseId: string, newStatus: CaseStatus, note?: string) => {
    updateCaseStatus(caseId, newStatus);
    if (note && note.trim()) {
      addCaseUpdate(caseId, `[Status update: ${newStatus.toUpperCase()}] ${note.trim()}`, false);
    }
  };

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(!!zoomedPhoto, () => setZoomedPhoto(null), 'client-cases-zoom', 30);
  useBackButton(!!statusPromptData, () => setStatusPromptData(null), 'client-cases-status-prompt', 25);
  useBackButton(!!editingCase, () => setEditingCase(null), 'client-cases-edit-modal', 25);
  useBackButton(!!caseToDelete, () => setCaseToDelete(null), 'client-cases-delete-prompt', 25);
  useBackButton(!!selectedCase, () => setSelectedCase(null), 'client-cases-detail-view', 15);

  // Keyboard ESC listener to close full screen case view or photo zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedPhoto) {
          setZoomedPhoto(null);
        } else if (selectedCase) {
          setSelectedCase(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedPhoto, selectedCase]);

  // Check if case belongs to the client either as reporter or as victim / owner / assigned member
  const isAssociatedWithMe = (c: Case) => {
    if (c.reportedByUid === currentUser.uid || c.victimUid === currentUser.uid) return true;
    if (c.assignedMemberUids && c.assignedMemberUids.includes(currentUser.uid)) return true;
    
    // Match phone
    if (c.victimPhone && currentUser.primaryPhone) {
      const cleanCasePhone = c.victimPhone.replace(/\D/g, '');
      const cleanUserPhone = currentUser.primaryPhone.replace(/\D/g, '');
      if (cleanCasePhone && cleanUserPhone && cleanCasePhone.slice(-9) === cleanUserPhone.slice(-9)) {
        return true;
      }
    }

    // Match full name / surname if specified
    if (currentUser.surname && currentUser.surname.trim().length > 2) {
      const userSurname = currentUser.surname.toLowerCase().trim();
      const userName = (currentUser.name || '').toLowerCase().trim();
      const victimLower = (c.victimName || '').toLowerCase().trim();
      const repLower = (c.reportedByName || '').toLowerCase().trim();
      const titleLower = (c.title || '').toLowerCase().trim();

      if ((victimLower.includes(userSurname) || repLower.includes(userSurname) || titleLower.includes(userSurname)) &&
          (userName.length <= 3 || victimLower.includes(userName) || repLower.includes(userName) || titleLower.includes(userName))) {
        return true;
      }
    }

    return false;
  };

  // Filter cases
  const myOpenCases = cases.filter(
    (c) => isAssociatedWithMe(c) && c.status !== 'closed' && c.status !== 'resolved'
  );
  const myClosedCases = cases.filter(
    (c) => isAssociatedWithMe(c) && (c.status === 'closed' || c.status === 'resolved')
  );
  const communityCases = cases.filter((c) => c.isPublic === true);
  const sitrepCases = cases.filter(
    (c) => !!c.linkedSituationId || c.title.toLowerCase().includes('sitrep') || c.category === 'suspicious_activity' || c.category === 'traffic_alert'
  );
  const allCases = cases;

  let baseList: Case[] = [];
  if (activeTab === 'MY_OPEN') baseList = myOpenCases;
  else if (activeTab === 'MY_CLOSED') baseList = myClosedCases;
  else if (activeTab === 'COMMUNITY') baseList = communityCases;
  else if (activeTab === 'SITREPS') baseList = sitrepCases;
  else baseList = allCases;

  // Apply search query
  const displayedCases = baseList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const officerMatch = (c.investigatingOfficers || c.sapsDetails?.officers || []).some(
      (o) => o.name.toLowerCase().includes(q) || o.rank?.toLowerCase().includes(q) || o.badgeNumber?.includes(q)
    );
    const updatesMatch = (c.updates || []).some((u) => u.message.toLowerCase().includes(q) || u.authorName.toLowerCase().includes(q));
    return (
      c.caseNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.locationName.toLowerCase().includes(q) ||
      (c.linkedSituationId && c.linkedSituationId.toLowerCase().includes(q)) ||
      (c.reportedByName && c.reportedByName.toLowerCase().includes(q)) ||
      (c.victimName && c.victimName.toLowerCase().includes(q)) ||
      (c.sapsCaseNumber && c.sapsCaseNumber.toLowerCase().includes(q)) ||
      (c.sapsStation && c.sapsStation.toLowerCase().includes(q)) ||
      officerMatch ||
      updatesMatch
    );
  });

  // Active case for detail view (synced with global cases state)
  const currentCase = selectedCase ? cases.find((c) => c.id === selectedCase.id) || selectedCase : null;

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCase || !newUpdateMessage.trim()) return;

    addCaseUpdate(currentCase.id, newUpdateMessage, false);
    setNewUpdateMessage('');
  };

  const handleOpenEdit = (caseToEdit: Case) => {
    setEditingCase(caseToEdit);
  };

  return (
    <div className="max-w-5xl mx-auto px-3.5 py-4 space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-emerald-400" />
            <span>{t.cases.title}</span>
          </h2>
          <p className="text-xs text-slate-400">
            Open, view, and edit cases, attach SAPD CAS dockets & investigating officers
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.cases.filterSearch}
            className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-900 rounded-xl p-1.5 border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => {
            setActiveTab('MY_OPEN');
            setSelectedCase(null);
          }}
          className={`py-2 px-2 rounded-lg transition text-center truncate ${
            activeTab === 'MY_OPEN' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.cases.myOpenCases} ({myOpenCases.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('MY_CLOSED');
            setSelectedCase(null);
          }}
          className={`py-2 px-2 rounded-lg transition text-center truncate ${
            activeTab === 'MY_CLOSED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.cases.myClosedCases} ({myClosedCases.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('COMMUNITY');
            setSelectedCase(null);
          }}
          className={`py-2 px-2 rounded-lg transition text-center truncate ${
            activeTab === 'COMMUNITY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.cases.communityCases} ({communityCases.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('SITREPS');
            setSelectedCase(null);
          }}
          className={`py-2 px-2 rounded-lg transition text-center truncate ${
            activeTab === 'SITREPS' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SITRAP Logs ({sitrepCases.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('ALL');
            setSelectedCase(null);
          }}
          className={`py-2 px-2 rounded-lg transition text-center truncate ${
            activeTab === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.cases.allCases} ({allCases.length})
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {displayedCases.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
            {t.cases.noCasesFound}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayedCases.map((c) => {
              const sapsCaseNum = c.sapsCaseNumber || c.sapsDetails?.caseNumber;
              const officers = c.investigatingOfficers || c.sapsDetails?.officers || [];

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCase(c);
                    setDetailTab('overview');
                  }}
                  className={`bg-slate-900 border rounded-xl p-3 cursor-pointer transition shadow-xs text-xs space-y-2 relative group hover:border-slate-700 hover:bg-slate-850 ${
                    currentCase?.id === c.id
                      ? 'border-emerald-500 bg-slate-850 shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-xs">
                        {c.caseNumber}
                      </span>
                      {isManagement && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCaseToDelete(c);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                          title="Management: Delete Case"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {c.victimUid === currentUser.uid && c.reportedByUid !== currentUser.uid ? (
                        <span className="bg-slate-800 text-emerald-300 border border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                          Victim/Owner
                        </span>
                      ) : c.reportedByUid === currentUser.uid ? (
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-medium">
                          Reported by You
                        </span>
                      ) : null}

                      {c.isPublic && (
                        <span className="bg-slate-800 text-blue-300 border border-slate-700 text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase">
                          Public
                        </span>
                      )}
                      <div onClick={(e) => e.stopPropagation()}>
                        <CaseStatusDropdown
                          caseItem={c}
                          onRequestChange={requestStatusChange}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-emerald-300 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Victim / Property Owner Pill */}
                  {(c.victimName || c.victimFarmName) && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-300 bg-slate-800/80 border border-slate-750 px-2 py-0.5 rounded w-fit">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>
                        Owner/Victim: <strong className="text-white">{c.victimName || 'Member'}</strong>
                        {c.victimFarmName ? ` (${c.victimFarmName})` : ''}
                      </span>
                    </div>
                  )}

                  {/* SAPS Case Badge & Officers */}
                  {sapsCaseNum && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="bg-slate-800 text-slate-200 border border-slate-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono font-semibold">
                        <BadgeCheck className="w-3 h-3 text-blue-400" />
                        {sapsCaseNum}
                      </span>
                      {officers.length > 0 && (
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          {officers[0].name}{officers.length > 1 ? ` +${officers.length - 1}` : ''}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="truncate max-w-[150px]">{c.locationName}</span>
                    </div>
                    <span className="flex items-center gap-1 text-slate-300 group-hover:text-emerald-400 font-medium transition-colors">
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compact Full-Screen Case Detail View      {/* CASE DETAILS FULL MODAL - MONOCHROME LIGHT THEME ALL-IN-ONE */}
      {currentCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto flex flex-col items-center justify-start p-2 sm:p-4 text-gray-900 animate-fadeIn">
          {/* Inner Modal Container */}
          <div className="w-full max-w-7xl bg-white border border-gray-400 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto">
            {/* Top Compact Header - Monochrome Light */}
            <div className="bg-gray-100 border-b border-gray-300 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-10">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-bold transition border border-gray-400 active:scale-95 shadow-xs shrink-0"
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
                  {t.incidents.categories[currentCase.category] || currentCase.category}
                </span>
              </div>

              {/* Quick Actions & Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <CaseStatusDropdown
                  caseItem={currentCase}
                  onRequestChange={requestStatusChange}
                  size="sm"
                  theme="monochrome"
                />

                {isManagement && (
                  <button
                    type="button"
                    onClick={() => setCaseToDelete(currentCase)}
                    className="p-1.5 bg-white hover:bg-gray-200 text-gray-700 hover:text-black border border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    title="Delete Case"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleOpenEdit(currentCase)}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-1 border border-gray-300 transition"
                  title="Edit Case"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-700" />
                  <span className="hidden sm:inline">{t.cases.editCase}</span>
                </button>

                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1.5 bg-white hover:bg-gray-200 text-gray-700 hover:text-black rounded-lg border border-gray-300 transition"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content Workspace - All Data Visible on One Screen */}
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

                {/* 4 Key Facts Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                  {/* Location */}
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-2 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-600" />
                      <span>Location</span>
                    </span>
                    <div className="font-bold text-gray-900 truncate" title={currentCase.locationName}>
                      {currentCase.locationName}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                      {currentCase.farmName ? `Farm: ${currentCase.farmName}` : (currentCase.sector ? `Sector ${currentCase.sector}` : 'Sector recorded')}
                    </div>
                  </div>

                  {/* Incident Date & Time */}
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-2 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-600" />
                      <span>Incident Time</span>
                    </span>
                    <div className="font-bold text-gray-900 font-mono">
                      {currentCase.incidentDate}
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono">
                      {currentCase.incidentTime || 'Time unrecorded'}
                    </div>
                  </div>

                  {/* Complainant / Victim */}
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-2 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-600" />
                      <span>Complainant / Owner</span>
                    </span>
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

                  {/* SAPS Case */}
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-2 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3 text-gray-700" />
                      <span>SAPS Police Docket</span>
                    </span>
                    <div className="font-mono font-bold text-gray-900 truncate">
                      {currentCase.sapsCaseNumber || currentCase.sapsDetails?.caseNumber || 'CAS Pending'}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                      {currentCase.sapsStation || currentCase.sapsDetails?.station || 'Hartbeesfontein SAPS'}
                    </div>
                  </div>
                </div>

                {/* Status Phase Indicator */}
                <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold">
                    <Activity className="w-3.5 h-3.5 text-gray-600" />
                    <span>Case Status:</span>
                    <span className="font-bold text-black font-mono bg-gray-200 px-2 py-0.5 rounded border border-gray-400">
                      {STATUS_CONFIG[currentCase.status]?.labelEn || currentCase.status.toUpperCase()}
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
                          <span className="truncate">{meta?.labelEn || st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3-Column All-In-One Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                {/* Column 1: Narrative & Police Record */}
                <div className="space-y-3">
                  {/* Narrative Card */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-700" />
                        <span>Incident Narrative</span>
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

                  {/* Physical Traits & Vehicle Clues */}
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

                  {/* SAPS Officers */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs text-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-gray-700" />
                        <span>SAPS Official Investigation</span>
                      </div>
                      <button
                        onClick={() => handleOpenEdit(currentCase)}
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

                    {((currentCase.investigatingOfficers && currentCase.investigatingOfficers.length > 0) ||
                      (currentCase.sapsDetails?.officers && currentCase.sapsDetails.officers.length > 0)) ? (
                      <div className="space-y-1.5 pt-1">
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
                                {officer.rank || 'Detective'} {officer.badgeNumber ? `• #${officer.badgeNumber}` : ''}
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
                        No investigating officers recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Suspects & Evidence Photos */}
                <div className="space-y-3">
                  {/* Suspects & POIs */}
                  <CaseSuspectsManager caseItem={currentCase} variant="monochrome" />

                  {/* Evidence Photos */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-gray-700" />
                        <span>Evidence & Media ({currentCase.photos?.length || 0})</span>
                      </h3>
                      <button
                        onClick={() => handleOpenEdit(currentCase)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition border border-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>

                    {((currentCase.photos && currentCase.photos.length > 0) ||
                      (currentCase.evidence && currentCase.evidence.length > 0)) ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {[
                          ...(currentCase.photos || []),
                          ...(currentCase.evidence || []).map((e) => e.fileUrl),
                        ].map((photoUrl, idx) => (
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
                </div>

                {/* Column 3: Timeline & Quick Updates */}
                <div className="space-y-3">
                  {/* Add Note Form */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-gray-700" />
                      <span>{t.cases.addUpdate}</span>
                    </h3>

                    <form onSubmit={handlePostUpdate} className="space-y-2">
                      <textarea
                        rows={2}
                        required
                        value={newUpdateMessage}
                        onChange={(e) => setNewUpdateMessage(e.target.value)}
                        placeholder={t.cases.updatePlaceholder}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-xs text-gray-900 placeholder:text-gray-500 outline-none focus:border-black transition"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newUpdateMessage.trim()}
                          className="bg-black hover:bg-gray-800 disabled:opacity-40 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition"
                        >
                          <Send className="w-3 h-3" />
                          <span>{t.common.submit}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Activity History */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                      <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-700" />
                        <span>{t.cases.updatesHistory} ({currentCase.updates.length})</span>
                      </h3>
                    </div>

                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                      {currentCase.updates.length === 0 ? (
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center text-xs text-gray-500">
                          No updates logged yet.
                        </div>
                      ) : (
                        [...currentCase.updates]
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .filter((u) => !u.isInternalOnly || activeRole === 'CONTROL_ROOM' || activeRole === 'MANAGEMENT')
                          .map((upd) => (
                            <div
                              key={upd.id}
                              className="p-2 rounded border bg-gray-50 border-gray-300 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span className="font-bold text-gray-900 flex items-center gap-1">
                                  <span>{upd.authorName}</span>
                                  {upd.isInternalOnly && (
                                    <span className="bg-gray-200 text-gray-800 border border-gray-400 px-1 py-0.2 rounded text-[9px] font-bold">
                                      INTERNAL
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono text-[10px]">
                                  {new Date(upd.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
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

      {/* Edit Case Modal */}
      {editingCase && (
        <EditCaseModal
          isOpen={!!editingCase}
          onClose={() => setEditingCase(null)}
          caseItem={editingCase}
        />
      )}

      {/* Enlarged Photo Lightbox Modal */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-700 shadow-2xl">
            <img src={zoomedPhoto} alt="Zoomed evidence" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Double Confirmation Status Change Modal */}
      <CaseStatusChangeModal
        isOpen={!!statusPromptData}
        caseItem={statusPromptData?.caseItem || null}
        targetStatus={statusPromptData?.targetStatus || null}
        onClose={() => setStatusPromptData(null)}
        onConfirm={handleStatusChangeConfirmed}
        isManagement={isManagement}
      />

      {/* Delete Confirmation Modal (Management Alone) */}
      {caseToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t.cases.deleteCaseConfirmTitle}
                </h3>
                <p className="text-xs text-red-300 font-mono">
                  {caseToDelete.caseNumber} • {caseToDelete.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {t.cases.deleteCaseConfirmMessage}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCaseToDelete(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const deletedId = caseToDelete.id;
                    await deleteCase(deletedId);
                    if (selectedCase?.id === deletedId) {
                      setSelectedCase(null);
                    }
                    setCaseToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span>{t.common.loading}</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
