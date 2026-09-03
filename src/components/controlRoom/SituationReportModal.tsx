import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Phone,
  Radio,
  MapPin,
  Map,
  FolderLock,
  PlusCircle,
  Share2,
  Check,
  Save,
  AlertTriangle,
  Send,
  Users,
  Shield,
  Flame,
  UserCheck,
  ExternalLink,
  Layers,
  ChevronDown,
  Navigation,
  Sparkles,
  Eye,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { IncidentCategory, SituationReport, SitrepBroadcastTarget } from '../../types';
import { formatSitrepWhatsAppMessage, generateManualWhatsAppUrl } from '../../services/whatsappService';
import { SitrepMapLocationPicker } from './SitrepMapLocationPicker';

interface SituationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SituationReportModal: React.FC<SituationReportModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const {
    cases,
    areaGroups,
    situationDraft,
    saveSituationDraft,
    clearSituationDraft,
    createSituationReport,
  } = useData();

  // Form states with autosave draft integration
  const [sourceName, setSourceName] = useState(situationDraft?.sourceName || '');
  const [sourcePhone, setSourcePhone] = useState(situationDraft?.sourcePhone || '');
  const [sourceType, setSourceType] = useState<SituationReport['sourceType']>(
    situationDraft?.sourceType || 'radio'
  );
  const [location, setLocation] = useState(situationDraft?.location || '');
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | undefined>(
    situationDraft?.gpsLocation
  );
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [category, setCategory] = useState<IncidentCategory | 'general_intel'>(
    situationDraft?.category || 'suspicious_activity'
  );
  const [description, setDescription] = useState(situationDraft?.description || '');
  const [notes, setNotes] = useState(situationDraft?.notes || '');

  const [actionDecision, setActionDecision] = useState<'report_only' | 'link_open_case' | 'open_new_case'>('open_new_case');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');

  // Sitrep Privacy & Visibility setting (default not private / public community notice)
  const [isPrivate, setIsPrivate] = useState(false);

  // The 5 Specific WhatsApp Broadcast Options
  const [sendToReactionForce, setSendToReactionForce] = useState(true);
  const [sendToAreaGroup, setSendToAreaGroup] = useState(false);
  const [selectedAreaGroupId, setSelectedAreaGroupId] = useState<string>(
    areaGroups.find((g) => g.id.startsWith('GRP-SEC'))?.id || areaGroups[1]?.id || 'GRP-SEC1'
  );
  const [sendToManagement, setSendToManagement] = useState(false);
  const [sendToFireDrivers, setSendToFireDrivers] = useState(false);
  const [sendToAllMembers, setSendToAllMembers] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string>('');
  const [submittedReportNumber, setSubmittedReportNumber] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Auto-tune broadcast defaults when category changes (e.g. fire -> suggest fire truck drivers)
  useEffect(() => {
    if (category === 'fire') {
      setSendToFireDrivers(true);
    }
  }, [category]);

  // Autosave Draft effect
  useEffect(() => {
    if (!isOpen) return;
    if (sourceName || description || location) {
      saveSituationDraft({
        sourceName,
        sourcePhone,
        sourceType,
        location,
        gpsLocation,
        category,
        description,
        notes,
      });
    }
  }, [isOpen, sourceName, sourcePhone, sourceType, location, gpsLocation, category, description, notes, saveSituationDraft]);

  if (!isOpen) return null;

  // Selected area group object
  const activeAreaGroup = areaGroups.find((g) => g.id === selectedAreaGroupId) || areaGroups[0];

  // Compile active targets array
  const activeTargets: SitrepBroadcastTarget[] = [];
  if (sendToReactionForce) activeTargets.push('REACTION_FORCE');
  if (sendToAreaGroup) activeTargets.push('AREA_GROUP');
  if (sendToManagement) activeTargets.push('MANAGEMENT');
  if (sendToFireDrivers) activeTargets.push('FIRE_DRIVERS');
  if (sendToAllMembers) activeTargets.push('ALL_MEMBERS');

  // Preview dummy object
  const previewSitrep: SituationReport = {
    id: 'SIT-TEMP',
    reportNumber: `SIT-${new Date().getFullYear()}-XXX`,
    sourceName: sourceName || '(Caller Name)',
    sourcePhone: sourcePhone || undefined,
    sourceType,
    timestamp: new Date().toISOString(),
    location: location || '(Location / Sector)',
    gpsLocation,
    category,
    description: description || '(Situation description...)',
    notes: notes || undefined,
    status: 'active',
    isPrivate,
    createdByUid: currentUser.uid,
    createdByName: `${currentUser.name} ${currentUser.surname}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const previewFormattedText = formatSitrepWhatsAppMessage(previewSitrep, {
    targetGroupName: sendToAreaGroup ? activeAreaGroup?.name : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const reportId = await createSituationReport({
        sourceName,
        sourcePhone: sourcePhone || undefined,
        sourceType,
        location: location || 'Hartbeesfontein District',
        gpsLocation,
        category,
        description,
        notes: notes || undefined,
        isPrivate,
        actionDecision,
        linkedCaseId: actionDecision === 'link_open_case' ? selectedCaseId : undefined,
        broadcastTargets: activeTargets,
        selectedAreaGroupId: sendToAreaGroup ? selectedAreaGroupId : undefined,
      });

      setSubmittedReportId(reportId);
      setSubmittedReportNumber(`SIT-${new Date().getFullYear()}`);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    clearSituationDraft();
    setSourceName('');
    setSourcePhone('');
    setLocation('');
    setGpsLocation(undefined);
    setDescription('');
    setNotes('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div id="sitrep-modal-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div id="sitrep-modal-container" className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[94vh] overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div id="sitrep-modal-header" className="bg-slate-850 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Control Room Situation Report (SITREP)
                </h2>
                <span className="text-[10px] bg-slate-800 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                  {t.controlRoom.situationDraftSaved}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct phone / radio intake, case linkage & targeted WhatsApp group dispatch
              </p>
            </div>
          </div>
          <button
            id="sitrep-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div id="sitrep-modal-body" className="p-4 sm:p-5 overflow-y-auto flex-1 text-xs space-y-4">
          {isSuccess ? (
            <div id="sitrep-success-screen" className="space-y-4">
              <div className="bg-emerald-950/70 border border-emerald-500/60 rounded-2xl p-6 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/50">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-emerald-300">
                  Situation Report Logged & WhatsApp Broadcasts Dispatched
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  Report <strong className="text-white font-mono">{submittedReportId}</strong> has been logged to the operational log.
                  {actionDecision === 'open_new_case' && ' An investigation case file was automatically created.'}
                  {actionDecision === 'link_open_case' && ' Entry was appended to the selected open case timeline.'}
                </p>
              </div>

              {/* Group Broadcast Dispatch Confirmations & WhatsApp Links */}
              <div className="bg-slate-850 border border-slate-750 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  Targeted WhatsApp Group Dispatches ({activeTargets.length})
                </h4>

                {activeTargets.length === 0 ? (
                  <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-slate-400 text-[11px]">
                    No external WhatsApp broadcasts selected (Recorded as internal control room log only).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sendToReactionForce && (
                      <div className="p-3 bg-slate-800 rounded-xl border border-blue-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Reaction Force Group</p>
                            <span className="text-[10px] text-emerald-400 font-mono">Dispatched to Armed Patrols</span>
                          </div>
                        </div>
                        <a
                          href={generateManualWhatsAppUrl('+27829114455', previewFormattedText)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {sendToAreaGroup && (
                      <div className="p-3 bg-slate-800 rounded-xl border border-purple-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{activeAreaGroup?.name || 'Area Specific Group'}</p>
                            <span className="text-[10px] text-emerald-400 font-mono">Dispatched to {activeAreaGroup?.activeMemberCount || '30+'} Sector Members</span>
                          </div>
                        </div>
                        <a
                          href={generateManualWhatsAppUrl(activeAreaGroup?.leaderPhone || '+27825551029', previewFormattedText)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {sendToManagement && (
                      <div className="p-3 bg-slate-800 rounded-xl border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Management Group</p>
                            <span className="text-[10px] text-emerald-400 font-mono">Dispatched to Executive Committee</span>
                          </div>
                        </div>
                        <a
                          href={generateManualWhatsAppUrl('+27827704419', previewFormattedText)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {sendToFireDrivers && (
                      <div className="p-3 bg-slate-800 rounded-xl border border-orange-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center">
                            <Flame className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Fire Truck Drivers Group</p>
                            <span className="text-[10px] text-emerald-400 font-mono">Dispatched to Fire Bakkies & Tankers</span>
                          </div>
                        </div>
                        <a
                          href={generateManualWhatsAppUrl('+27823065808', previewFormattedText)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {sendToAllMembers && (
                      <div className="p-3 bg-slate-800 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">All Members Broadcast</p>
                            <span className="text-[10px] text-emerald-400 font-mono">Entire Hartbeesfontein District</span>
                          </div>
                        </div>
                        <a
                          href={generateManualWhatsAppUrl('+27834567890', previewFormattedText)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  id="sitrep-close-done-btn"
                  onClick={handleResetForm}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md"
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Source & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-slate-400 font-semibold mb-1">Source Channel *</label>
                  <select
                    id="sitrep-source-channel"
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as SituationReport['sourceType'])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="radio">Radio Channel (Plaaswag)</option>
                    <option value="phone">Telephone Call</option>
                    <option value="whatsapp_forward">WhatsApp / Group Report</option>
                    <option value="in_person">In Person / Gate Sighting</option>
                    <option value="patrol">Active Patrol Vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Caller / Source Name *</label>
                  <input
                    id="sitrep-caller-name"
                    type="text"
                    required
                    autoFocus
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="e.g. Fanie Venter (Tierfontein)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                  >
                  </input>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Caller Phone Number</label>
                  <input
                    id="sitrep-caller-phone"
                    type="tel"
                    value={sourcePhone}
                    onChange={(e) => setSourcePhone(e.target.value)}
                    placeholder="e.g. 082 123 4567"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Location & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400 font-semibold">Location / Road / Sector *</label>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="text-xs bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1.5 transition shadow-sm"
                      title="Choose incident location on map"
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>Choose on Map</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      id="sitrep-location"
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. R503 km 14 near Silos, Plaas Driefontein"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 pr-9 text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 p-1"
                      title="Open Map Location Picker"
                    >
                      <MapPin className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>

                  {/* Selected GPS Coordinates Badge */}
                  {gpsLocation && (
                    <div className="mt-1.5 flex items-center justify-between bg-slate-800/90 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
                        <MapPin className="w-3 h-3 text-red-400 animate-pulse flex-shrink-0" />
                        <span className="font-bold">GPS: {gpsLocation.latitude.toFixed(5)}, {gpsLocation.longitude.toFixed(5)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMapPickerOpen(true)}
                          className="text-cyan-400 hover:text-cyan-200 underline text-[10px] font-bold"
                        >
                          Change Pin
                        </button>
                        <button
                          type="button"
                          onClick={() => setGpsLocation(undefined)}
                          className="text-slate-400 hover:text-red-400 text-[10px]"
                          title="Remove GPS Pin"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Incident Category *</label>
                  <select
                    id="sitrep-incident-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IncidentCategory | 'general_intel')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="traffic_alert">🚨 Traffic alert (Pad / Verkeer)</option>
                    <option value="road_incident">🚨 Traffic alert (Road / Obstruction)</option>
                    <option value="suspicious_activity">🔍 {t.incidents.categories.suspicious_activity}</option>
                    <option value="suspicious_vehicle">🚗 {t.incidents.categories.suspicious_vehicle}</option>
                    <option value="suspicious_person">👤 {t.incidents.categories.suspicious_person}</option>
                    <option value="fence_damage">✂️ {t.incidents.categories.fence_damage}</option>
                    <option value="stock_theft">🐂 {t.incidents.categories.stock_theft}</option>
                    <option value="fire">🔥 {t.incidents.categories.fire}</option>
                    <option value="attack">⚠️ {t.incidents.categories.attack}</option>
                    <option value="vandalism">🔨 {t.incidents.categories.vandalism}</option>
                    <option value="general_intel">🛡️ General Security Intelligence</option>
                  </select>
                </div>
              </div>

              {/* Situation Description */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Live Situation Description *</label>
                <textarea
                  id="sitrep-description"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Record immediate caller statement: direction, vehicle make/model, suspects, hazards..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action Decision Selector */}
              <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-750 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Action & Case Routing:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="sitrep-route-report-only"
                    type="button"
                    onClick={() => setActionDecision('report_only')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition text-xs ${
                      actionDecision === 'report_only'
                        ? 'bg-slate-700 text-white border-slate-400 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t.controlRoom.reportOnly}
                  </button>

                  <button
                    id="sitrep-route-link-case"
                    type="button"
                    onClick={() => setActionDecision('link_open_case')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition text-xs ${
                      actionDecision === 'link_open_case'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t.controlRoom.linkToOpenCase}
                  </button>

                  <button
                    id="sitrep-route-open-new-case"
                    type="button"
                    onClick={() => setActionDecision('open_new_case')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition text-xs ${
                      actionDecision === 'open_new_case'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t.controlRoom.openNewCase}
                  </button>
                </div>

                {/* If LINK TO OPEN CASE selected */}
                {actionDecision === 'link_open_case' && (
                  <div className="pt-1.5">
                    <label className="block text-slate-400 font-semibold mb-1">Select Open Case to Append:</label>
                    <select
                      id="sitrep-linked-case-select"
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium outline-none"
                    >
                      {cases
                        .filter((c) => c.status !== 'closed')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.caseNumber} — {c.title} ({c.locationName})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* SITREP PRIVACY & CLIENT NOTICES VISIBILITY */}
              {/* ========================================================================= */}
              <div id="sitrep-privacy-section" className="bg-slate-850 p-4 rounded-xl border border-slate-750 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className={`w-4 h-4 ${isPrivate ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Sitrep Privaatheid & Sigbaarheid (Client Notices):
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isPrivate ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                    {isPrivate ? 'PRIVAAT (SLEGS INTERN)' : 'OPENBAAR (HDR-CLIENT-NOTICES)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="btn-sitrep-visibility-public"
                    onClick={() => setIsPrivate(false)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      !isPrivate
                        ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${!isPrivate ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'}`}>
                      {!isPrivate && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-white">Openbaar vir Lede</span>
                      <span className="text-[10px] text-emerald-400/90 leading-tight block mt-0.5">
                        Wys in HDR-CLIENT-NOTICES op lede se tuisskerm
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-sitrep-visibility-private"
                    onClick={() => setIsPrivate(true)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      isPrivate
                        ? 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${isPrivate ? 'border-amber-400 bg-amber-500' : 'border-slate-600'}`}>
                      {isPrivate && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-white">Privaat / Intern</span>
                      <span className="text-[10px] text-amber-400/90 leading-tight block mt-0.5">
                        Slegs Beheerkamer & Reaksiemag (weggesteek)
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* THE 5 BROADCAST OPTIONS SPECIFIED BY USER */}
              {/* ========================================================================= */}
              <div id="sitrep-broadcast-options-section" className="bg-slate-850 p-4 rounded-xl border border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Broadcast Options / WhatsApp Distribution:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSendToReactionForce(true);
                        setSendToAreaGroup(true);
                        setSendToManagement(true);
                        setSendToFireDrivers(category === 'fire');
                        setSendToAllMembers(true);
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSendToReactionForce(false);
                        setSendToAreaGroup(false);
                        setSendToManagement(false);
                        setSendToFireDrivers(false);
                        setSendToAllMembers(false);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-300 font-bold underline"
                    >
                      Clear (Internal only)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* OPTION 1: Send WhatsApp to reaction force group */}
                  <label
                    id="broadcast-opt-reaction-force"
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      sendToReactionForce
                        ? 'bg-blue-950/40 border-blue-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={sendToReactionForce}
                        onChange={(e) => setSendToReactionForce(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-0"
                      />
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${sendToReactionForce ? 'text-blue-400' : 'text-slate-500'}`} />
                        <div>
                          <span className="text-xs font-bold block">
                            Send WhatsApp to reaction force group
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Plaaswag armed tactical units & rapid responders
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sendToReactionForce ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'bg-slate-700 text-slate-400'}`}>
                      {sendToReactionForce ? 'ACTIVE' : 'OFF'}
                    </span>
                  </label>

                  {/* OPTION 2: Send WhatsApp to area specific group */}
                  <div
                    id="broadcast-opt-area-group"
                    className={`p-2.5 rounded-xl border transition ${
                      sendToAreaGroup
                        ? 'bg-purple-950/40 border-purple-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setSendToAreaGroup(!sendToAreaGroup)}>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={sendToAreaGroup}
                          onChange={(e) => setSendToAreaGroup(e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded text-purple-600 bg-slate-700 border-slate-600 focus:ring-0"
                        />
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${sendToAreaGroup ? 'text-purple-400' : 'text-slate-500'}`} />
                          <div>
                            <span className="text-xs font-bold block">
                              Send WhatsApp to area specific group
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Targeted sector or geographic farming corridor
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sendToAreaGroup ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'bg-slate-700 text-slate-400'}`}>
                        {sendToAreaGroup ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>

                    {/* Sector Selector Dropdown when checked */}
                    {sendToAreaGroup && (
                      <div className="mt-2.5 pt-2.5 border-t border-purple-500/20 flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-[11px] font-semibold text-purple-300 flex-shrink-0">
                          Select Sector Group:
                        </label>
                        <select
                          id="sitrep-area-group-select"
                          value={selectedAreaGroupId}
                          onChange={(e) => setSelectedAreaGroupId(e.target.value)}
                          className="w-full bg-slate-800 border border-purple-500/40 rounded-lg px-2.5 py-1.5 text-white font-medium text-xs outline-none focus:ring-1 focus:ring-purple-400"
                        >
                          {areaGroups
                            .filter((g) => g.id !== 'GRP-ALL' && g.id !== 'GRP-MANAGEMENT')
                            .map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name} ({g.activeMemberCount || 30} members)
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* OPTION 3: Send WhatsApp to management */}
                  <label
                    id="broadcast-opt-management"
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      sendToManagement
                        ? 'bg-amber-950/40 border-amber-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={sendToManagement}
                        onChange={(e) => setSendToManagement(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 bg-slate-700 border-slate-600 focus:ring-0"
                      />
                      <div className="flex items-center gap-2">
                        <UserCheck className={`w-4 h-4 ${sendToManagement ? 'text-amber-400' : 'text-slate-500'}`} />
                        <div>
                          <span className="text-xs font-bold block">
                            Send WhatsApp to management
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Executive safety committee & duty coordinators
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sendToManagement ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-400'}`}>
                      {sendToManagement ? 'ACTIVE' : 'OFF'}
                    </span>
                  </label>

                  {/* OPTION 4: Send WhatsApp to fire truck drivers */}
                  <label
                    id="broadcast-opt-fire-drivers"
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      sendToFireDrivers
                        ? 'bg-orange-950/40 border-orange-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={sendToFireDrivers}
                        onChange={(e) => setSendToFireDrivers(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 bg-slate-700 border-slate-600 focus:ring-0"
                      />
                      <div className="flex items-center gap-2">
                        <Flame className={`w-4 h-4 ${sendToFireDrivers ? 'text-orange-400' : 'text-slate-500'}`} />
                        <div>
                          <span className="text-xs font-bold block">
                            Send WhatsApp to fire truck drivers.
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Brandbestryding FPA, fire bakkies & water tanker drivers
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sendToFireDrivers ? 'bg-orange-600/20 text-orange-300 border border-orange-500/30' : 'bg-slate-700 text-slate-400'}`}>
                      {sendToFireDrivers ? 'ACTIVE' : 'OFF'}
                    </span>
                  </label>

                  {/* OPTION 5: Send WhatsApp to All members */}
                  <label
                    id="broadcast-opt-all-members"
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      sendToAllMembers
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={sendToAllMembers}
                        onChange={(e) => setSendToAllMembers(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 bg-slate-700 border-slate-600 focus:ring-0"
                      />
                      <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${sendToAllMembers ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div>
                          <span className="text-xs font-bold block">
                            Send WhatsApp to All members
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Entire Hartbeesfontein farming district community
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sendToAllMembers ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}`}>
                      {sendToAllMembers ? 'ACTIVE' : 'OFF'}
                    </span>
                  </label>
                </div>

                {/* Message preview toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
                    <span>{showPreview ? 'Hide WhatsApp Text Preview' : 'Preview WhatsApp Message Text'}</span>
                  </button>
                  {showPreview && (
                    <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-750 font-mono text-[11px] text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                      {previewFormattedText}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  id="sitrep-cancel-btn"
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  id="sitrep-submit-btn"
                  type="submit"
                  disabled={isSubmitting || !sourceName.trim() || !description.trim()}
                  className="flex-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t.common.loading : `Log SITREP & Dispatch WhatsApp (${activeTargets.length})`}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Interactive Map Location Picker Modal */}
      {isMapPickerOpen && (
        <SitrepMapLocationPicker
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          initialLocationName={location}
          initialCoordinates={gpsLocation}
          onSelectLocation={(result) => {
            setLocation(result.locationName);
            setGpsLocation(result.coordinates);
          }}
        />
      )}
    </div>
  );
};
