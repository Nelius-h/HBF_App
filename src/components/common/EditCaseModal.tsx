import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BadgeCheck,
  Shield,
  Phone,
  UserCheck,
  Plus,
  Trash2,
  Camera,
  UploadCloud,
  MapPin,
  Check,
  AlertCircle,
  Car,
  User,
  Users,
  Search,
  ZoomIn,
  Building2,
  FileText,
  Clock,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Case, IncidentCategory, InvestigatingOfficer, CasePriority } from '../../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { compressImageFile, ProcessedImage } from '../../utils/imageUtils';
import { CaseSuspectsManager } from './CaseSuspectsManager';
import { useBackButton } from '../../hooks/useBackButton';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: Case | null;
}

type EditTab = 'general' | 'saps' | 'victim' | 'suspects' | 'photos' | 'management';

export const EditCaseModal: React.FC<EditCaseModalProps> = ({ isOpen, onClose, caseItem }) => {
  const { t } = useI18n();
  const { currentUser, activeRole, allUsers } = useAuth();
  const { updateCase, addCaseEvidencePhotos, deleteCase } = useData();

  const isManagement = currentUser?.role === 'MANAGEMENT' || activeRole === 'MANAGEMENT';
  const [activeTab, setActiveTab] = useState<EditTab>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(isOpen, onClose, 'edit-case-modal', 25);
  useBackButton(showDeleteConfirm, () => setShowDeleteConfirm(false), 'edit-case-delete-confirm', 30);

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('suspicious_activity');
  const [status, setStatus] = useState<Case['status']>('open');
  const [priority, setPriority] = useState<CasePriority>('medium');
  const [isPublic, setIsPublic] = useState(true);
  const [locationName, setLocationName] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');

  // Victim / Property Owner / Client Member Assignment
  const [victimUid, setVictimUid] = useState('');
  const [victimName, setVictimName] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [victimFarmName, setVictimFarmName] = useState('');
  const [isVictimAware, setIsVictimAware] = useState(true);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);

  // SAPS / SAPD Details
  const [sapsCaseNumber, setSapsCaseNumber] = useState('');
  const [sapsStation, setSapsStation] = useState('');
  const [obNumber, setObNumber] = useState('');
  const [docketLocation, setDocketLocation] = useState('');
  const [sapsStatusNotes, setSapsStatusNotes] = useState('');
  const [investigatingOfficers, setInvestigatingOfficers] = useState<InvestigatingOfficer[]>([]);

  // New Officer Sub-Form
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerRank, setNewOfficerRank] = useState('');
  const [newOfficerPhone, setNewOfficerPhone] = useState('');
  const [newOfficerBadge, setNewOfficerBadge] = useState('');
  const [newOfficerUnit, setNewOfficerUnit] = useState('');
  const [newOfficerNotes, setNewOfficerNotes] = useState('');

  // Suspect & Vehicle Details
  const [vehicleMakeModel, setVehicleMakeModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleNotes, setVehicleNotes] = useState('');
  const [personClothing, setPersonClothing] = useState('');
  const [personBuild, setPersonBuild] = useState('');
  const [personMarks, setPersonMarks] = useState('');
  const [personNotes, setPersonNotes] = useState('');

  // New Evidence / Photos to upload
  const [newPhotos, setNewPhotos] = useState<ProcessedImage[]>([]);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync state when caseItem changes
  useEffect(() => {
    if (caseItem) {
      setTitle(caseItem.title || '');
      setDescription(caseItem.description || '');
      setCategory(caseItem.category || 'suspicious_activity');
      setStatus(caseItem.status || 'open');
      setPriority(caseItem.priority || 'medium');
      setIsPublic(caseItem.isPublic !== undefined ? caseItem.isPublic : true);
      setLocationName(caseItem.locationName || '');
      setIncidentDate(caseItem.incidentDate || '');
      setIncidentTime(caseItem.incidentTime || '');

      const sapsNum = caseItem.sapsCaseNumber || caseItem.sapsDetails?.caseNumber || '';
      const station = caseItem.sapsStation || caseItem.sapsDetails?.station || 'Hartbeesfontein SAPS';
      const ob = caseItem.sapsDetails?.obNumber || '';
      const docket = caseItem.sapsDetails?.docketLocation || '';
      const notes = caseItem.sapsDetails?.statusNotes || '';
      const officers = caseItem.investigatingOfficers || caseItem.sapsDetails?.officers || [];

      setSapsCaseNumber(sapsNum);
      setSapsStation(station);
      setObNumber(ob);
      setDocketLocation(docket);
      setSapsStatusNotes(notes);
      setInvestigatingOfficers(officers);

      setVehicleMakeModel(caseItem.vehicleInfo?.makeModel || '');
      setVehicleColor(caseItem.vehicleInfo?.color || '');
      setVehiclePlate(caseItem.vehicleInfo?.plate || '');
      setVehicleNotes(caseItem.vehicleInfo?.notes || '');

      setPersonClothing(caseItem.personDescription?.clothing || '');
      setPersonBuild(caseItem.personDescription?.buildHeight || '');
      setPersonMarks(caseItem.personDescription?.identifyingMarks || '');
      setPersonNotes(caseItem.personDescription?.notes || '');

      // Victim / Owner
      setVictimUid(caseItem.victimUid || '');
      setVictimName(caseItem.victimName || '');
      setVictimPhone(caseItem.victimPhone || '');
      setVictimFarmName(caseItem.victimFarmName || '');
      setIsVictimAware(caseItem.isVictimAware !== undefined ? caseItem.isVictimAware : true);
      setMemberSearchQuery('');
      setIsMemberPickerOpen(false);

      setNewPhotos([]);
      setSaveSuccessMessage(false);
      setShowAddOfficer(false);
      setActiveTab('general');
    }
  }, [caseItem, isOpen]);

  if (!isOpen || !caseItem) return null;

  const handleAddOfficer = () => {
    if (!newOfficerName.trim()) return;
    const officer: InvestigatingOfficer = {
      id: `IO-${Date.now()}`,
      name: newOfficerName.trim(),
      rank: newOfficerRank.trim() || undefined,
      phone: newOfficerPhone.trim() || undefined,
      badgeNumber: newOfficerBadge.trim() || undefined,
      unit: newOfficerUnit.trim() || undefined,
      station: sapsStation.trim() || 'Hartbeesfontein SAPS',
      notes: newOfficerNotes.trim() || undefined,
    };

    setInvestigatingOfficers((prev) => [...prev, officer]);
    setNewOfficerName('');
    setNewOfficerRank('');
    setNewOfficerPhone('');
    setNewOfficerBadge('');
    setNewOfficerUnit('');
    setNewOfficerNotes('');
    setShowAddOfficer(false);
  };

  const handleRemoveOfficer = (id: string) => {
    setInvestigatingOfficers((prev) => prev.filter((o) => o.id !== id));
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    setPhotoError(null);

    try {
      const processedList: ProcessedImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const processed = await compressImageFile(file);
        processedList.push(processed);
      }

      setNewPhotos((prev) => [...prev, ...processedList].slice(0, 10));
    } catch (err: any) {
      console.error('Error processing files:', err);
      setPhotoError('Failed to process one or more images.');
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handlePhotoCapturedFromCamera = (image: ProcessedImage) => {
    setNewPhotos((prev) => [...prev, image].slice(0, 10));
    setPhotoError(null);
  };

  const handleRemoveNewPhoto = (id: string) => {
    setNewPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseItem) return;

    setIsSaving(true);
    try {
      const cleanSapsNumber = sapsCaseNumber.trim();
      const cleanStation = sapsStation.trim();
      const cleanOb = obNumber.trim();

      // Build updates
      const updates: Partial<Case> = {
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        priority,
        isPublic,
        locationName: locationName.trim(),
        incidentDate,
        incidentTime,
        sapsCaseNumber: cleanSapsNumber || undefined,
        sapsStation: cleanStation || undefined,
        sapsDetails:
          cleanSapsNumber || investigatingOfficers.length > 0 || cleanOb
            ? {
                caseNumber: cleanSapsNumber || undefined,
                station: cleanStation || undefined,
                obNumber: cleanOb || undefined,
                docketLocation: docketLocation.trim() || undefined,
                statusNotes: sapsStatusNotes.trim() || undefined,
                officers: investigatingOfficers,
                dateReported: caseItem.sapsDetails?.dateReported || new Date().toISOString().split('T')[0],
              }
            : undefined,
        investigatingOfficers: investigatingOfficers,
        vehicleInfo:
          vehicleMakeModel || vehiclePlate || vehicleColor || vehicleNotes
            ? {
                makeModel: vehicleMakeModel,
                color: vehicleColor,
                plate: vehiclePlate,
                notes: vehicleNotes,
              }
            : caseItem.vehicleInfo,
        personDescription:
          personClothing || personBuild || personMarks || personNotes
            ? {
                clothing: personClothing,
                buildHeight: personBuild,
                identifyingMarks: personMarks,
                notes: personNotes,
              }
            : caseItem.personDescription,
        victimUid: victimUid.trim() || undefined,
        victimName: victimName.trim() || undefined,
        victimPhone: victimPhone.trim() || undefined,
        victimFarmName: victimFarmName.trim() || undefined,
        isVictimAware: isVictimAware,
        assignedMemberUids: victimUid.trim() ? [victimUid.trim()] : (caseItem.assignedMemberUids || []),
      };

      const changeSummary = `Case edited by ${currentUser.name} (${activeRole})${
        victimName.trim() ? ` - Owner/Victim: ${victimName.trim()}` : ''
      }${
        cleanSapsNumber ? ` - SAPD CAS: ${cleanSapsNumber}` : ''
      }${investigatingOfficers.length > 0 ? ` - ${investigatingOfficers.length} Officer(s)` : ''}`;

      updateCase(caseItem.id, updates, changeSummary);

      // Upload extra photos if added
      if (newPhotos.length > 0) {
        addCaseEvidencePhotos(
          caseItem.id,
          newPhotos.map((p) => p.dataUrl),
          'Attached during case editing'
        );
        setNewPhotos([]);
      }

      setSaveSuccessMessage(true);
      setTimeout(() => {
        setSaveSuccessMessage(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error saving case:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-white">
          {/* Top Compact Header */}
          <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold flex-shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    {t.cases.editCase}
                  </h2>
                  <span className="bg-slate-800 text-blue-400 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-blue-900/60">
                    {caseItem.caseNumber}
                  </span>
                  {sapsCaseNumber && (
                    <span className="bg-blue-950/80 text-blue-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-blue-800 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3 text-blue-400" />
                      <span>{sapsCaseNumber}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-lg">
                  {caseItem.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Tab Navigation Bar */}
          <div className="bg-slate-950/80 px-3 py-1.5 border-b border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none flex-shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'general'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>General & Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saps')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'saps'
                  ? 'bg-blue-950 text-blue-200 font-bold border border-blue-800/80 shadow-xs'
                  : 'text-slate-400 hover:text-blue-300 hover:bg-slate-900'
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>SAPS & Officers</span>
              {investigatingOfficers.length > 0 && (
                <span className="bg-blue-900/80 text-blue-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {investigatingOfficers.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('victim')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'victim'
                  ? 'bg-emerald-950 text-emerald-200 font-bold border border-emerald-800/80 shadow-xs'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Victim / Owner</span>
              {victimName && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('suspects')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'suspects'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>Suspects & Vehicles</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Photos & Evidence</span>
              {(caseItem.photos?.length || 0) + newPhotos.length > 0 && (
                <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {(caseItem.photos?.length || 0) + newPhotos.length}
                </span>
              )}
            </button>

            {isManagement && (
              <button
                type="button"
                onClick={() => setActiveTab('management')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'management'
                    ? 'bg-red-950/60 text-red-200 font-bold border border-red-800/80 shadow-xs'
                    : 'text-slate-400 hover:text-red-300 hover:bg-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>Admin / Delete</span>
              </button>
            )}
          </div>

          {/* Form Content - Compact & High Contrast */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 text-xs space-y-3.5">
            {saveSuccessMessage && (
              <div className="bg-emerald-950/80 border border-emerald-500 rounded-xl p-2.5 text-emerald-300 text-center font-bold flex items-center justify-center gap-2 animate-fadeIn text-xs">
                <Check className="w-4 h-4" />
                <span>{t.cases.savedSuccess}</span>
              </div>
            )}

            {/* TAB 1: GENERAL & CASE METADATA */}
            {activeTab === 'general' && (
              <div className="space-y-3 animate-fadeIn">
                {/* Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t.incidents.shortTitle} *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Armed robbery at main farmhouse"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t.incidents.category}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    >
                      <option value="attack">{t.incidents.categories.attack}</option>
                      <option value="robbery">{t.incidents.categories.robbery}</option>
                      <option value="theft">{t.incidents.categories.theft}</option>
                      <option value="stock_theft">{t.incidents.categories.stock_theft}</option>
                      <option value="housebreaking">{t.incidents.categories.housebreaking}</option>
                      <option value="suspicious_person">{t.incidents.categories.suspicious_person}</option>
                      <option value="suspicious_vehicle">{t.incidents.categories.suspicious_vehicle}</option>
                      <option value="suspicious_activity">{t.incidents.categories.suspicious_activity}</option>
                      <option value="fence_damage">{t.incidents.categories.fence_damage}</option>
                      <option value="fire">{t.incidents.categories.fire}</option>
                      <option value="vandalism">{t.incidents.categories.vandalism}</option>
                      <option value="road_incident">{t.incidents.categories.road_incident}</option>
                      <option value="other">{t.incidents.categories.other}</option>
                    </select>
                  </div>
                </div>

                {/* Status & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Investigation Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Case['status'])}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    >
                      <option value="open">{t.cases.statusLabels.open}</option>
                      <option value="investigating">{t.cases.statusLabels.investigating}</option>
                      <option value="action_pending">{t.cases.statusLabels.action_pending}</option>
                      <option value="resolved">{t.cases.statusLabels.resolved}</option>
                      <option value="closed">{t.cases.statusLabels.closed}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as CasePriority)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    >
                      <option value="low">{t.cases.priorityLabels.low}</option>
                      <option value="medium">{t.cases.priorityLabels.medium}</option>
                      <option value="high">{t.cases.priorityLabels.high}</option>
                      <option value="critical">{t.cases.priorityLabels.critical}</option>
                    </select>
                  </div>
                </div>

                {/* Location, Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{t.incidents.location}</span>
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Syferfontein / R503 pad"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{t.incidents.date}</span>
                    </label>
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t.incidents.time}
                    </label>
                    <input
                      type="time"
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t.incidents.description} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Full incident narrative, sequence of events, and findings..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs leading-relaxed outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Public Case Toggle */}
                <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white text-xs block">{t.cases.publicCase}</span>
                    <span className="text-[10px] text-slate-400 block">{t.cases.publicCaseHelp}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: SAPS / POLICE DOCKET & OFFICERS */}
            {activeTab === 'saps' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="bg-blue-950/30 border border-blue-800/60 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-200 text-xs flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-blue-400" />
                      <span>{t.cases.sapsSectionTitle}</span>
                    </span>
                    <span className="text-[10px] text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/60 font-mono">
                      Official Docket
                    </span>
                  </div>

                  {/* Case #, Station, OB # */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-blue-300 mb-1">
                        {t.cases.sapsCaseNumber}
                      </label>
                      <input
                        type="text"
                        value={sapsCaseNumber}
                        onChange={(e) => setSapsCaseNumber(e.target.value)}
                        placeholder="e.g. CAS 42/08/2026"
                        className="w-full bg-slate-950 border border-blue-700/60 rounded-lg px-2.5 py-1.5 text-white font-mono uppercase text-xs focus:border-blue-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-300 mb-1">
                        {t.cases.sapsStation}
                      </label>
                      <input
                        type="text"
                        value={sapsStation}
                        onChange={(e) => setSapsStation(e.target.value)}
                        placeholder="e.g. Hartbeesfontein SAPS"
                        className="w-full bg-slate-950 border border-blue-700/60 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-blue-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-300 mb-1">
                        {t.cases.obNumber}
                      </label>
                      <input
                        type="text"
                        value={obNumber}
                        onChange={(e) => setObNumber(e.target.value)}
                        placeholder="e.g. OB 78/08/2026"
                        className="w-full bg-slate-950 border border-blue-700/60 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-blue-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Court / Docket Location & Status Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Court / Docket Location
                      </label>
                      <input
                        type="text"
                        value={docketLocation}
                        onChange={(e) => setDocketLocation(e.target.value)}
                        placeholder="e.g. Klerksdorp Court / Detective Office"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        SAPS Investigation Notes
                      </label>
                      <input
                        type="text"
                        value={sapsStatusNotes}
                        onChange={(e) => setSapsStatusNotes(e.target.value)}
                        placeholder="e.g. Ballistics & fingerprints queued"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Investigating Officers List */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-400" />
                      <span>{t.cases.investigatingOfficers} ({investigatingOfficers.length})</span>
                    </div>
                    {!showAddOfficer && (
                      <button
                        type="button"
                        onClick={() => setShowAddOfficer(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.cases.addOfficer}</span>
                      </button>
                    )}
                  </div>

                  {investigatingOfficers.length > 0 ? (
                    <div className="space-y-1.5">
                      {investigatingOfficers.map((officer) => (
                        <div
                          key={officer.id}
                          className="bg-slate-900 border border-blue-900/40 rounded-lg p-2.5 flex items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                              <span>{officer.rank ? `${officer.rank} ` : ''}{officer.name}</span>
                              {officer.badgeNumber && (
                                <span className="bg-blue-950 text-blue-300 font-mono text-[9px] px-1.5 py-0.2 rounded border border-blue-800">
                                  #{officer.badgeNumber}
                                </span>
                              )}
                              {officer.unit && (
                                <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.2 rounded font-mono">
                                  {officer.unit}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              {officer.phone && (
                                <a
                                  href={`tel:${officer.phone}`}
                                  className="text-emerald-400 font-mono flex items-center gap-1 hover:underline"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{officer.phone}</span>
                                </a>
                              )}
                              {officer.station && <span>• {officer.station}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {officer.phone && (
                              <a
                                href={`tel:${officer.phone}`}
                                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveOfficer(officer.id)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded transition"
                              title="Remove officer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800 text-center text-slate-400 text-xs italic">
                      {t.cases.noOfficersAdded} Click "{t.cases.addOfficer}" to attach SAPS officers.
                    </div>
                  )}

                  {/* Inline Add Officer Form */}
                  {showAddOfficer && (
                    <div className="bg-slate-900 border border-blue-500/50 rounded-xl p-3 space-y-2 animate-fadeIn">
                      <div className="font-bold text-blue-200 text-xs flex items-center justify-between">
                        <span>Add Investigating Officer</span>
                        <button
                          type="button"
                          onClick={() => setShowAddOfficer(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Officer Name (e.g. W/O Khumalo)"
                          value={newOfficerName}
                          onChange={(e) => setNewOfficerName(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Rank (e.g. Detective Warrant Officer)"
                          value={newOfficerRank}
                          onChange={(e) => setNewOfficerRank(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Contact Phone (e.g. +27 82 455 9012)"
                          value={newOfficerPhone}
                          onChange={(e) => setNewOfficerPhone(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Badge / Force Number (e.g. 0489211-4)"
                          value={newOfficerBadge}
                          onChange={(e) => setNewOfficerBadge(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Unit (e.g. Stock Theft, VISPOL)"
                          value={newOfficerUnit}
                          onChange={(e) => setNewOfficerUnit(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Role on scene / notes"
                          value={newOfficerNotes}
                          onChange={(e) => setNewOfficerNotes(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddOfficer(false)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
                        >
                          {t.common.cancel}
                        </button>
                        <button
                          type="button"
                          onClick={handleAddOfficer}
                          disabled={!newOfficerName.trim()}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-3 py-1 rounded-lg text-xs transition"
                        >
                          Add Officer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: VICTIM / CLIENT MEMBER ASSIGNMENT */}
            {activeTab === 'victim' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Property Owner / Victim / Client Member</span>
                    </span>
                    {victimUid && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Linked to Member
                      </span>
                    )}
                  </div>

                  {/* Search / Pick Member */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => {
                          setMemberSearchQuery(e.target.value);
                          if (!isMemberPickerOpen) setIsMemberPickerOpen(true);
                        }}
                        onFocus={() => setIsMemberPickerOpen(true)}
                        placeholder="Search member by name, farm name, or phone number..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-500 text-xs outline-none focus:border-emerald-500 transition"
                      />
                      {memberSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMemberSearchQuery('')}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Member selection dropdown list */}
                    {isMemberPickerOpen && (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl max-h-44 overflow-y-auto divide-y divide-slate-800 shadow-xl z-10 animate-fadeIn">
                        {allUsers
                          .filter((u) => {
                            if (!memberSearchQuery.trim()) return true;
                            const q = memberSearchQuery.toLowerCase();
                            return (
                              `${u.name} ${u.surname}`.toLowerCase().includes(q) ||
                              (u.farmName && u.farmName.toLowerCase().includes(q)) ||
                              (u.primaryPhone && u.primaryPhone.includes(q)) ||
                              (u.sector && u.sector.toLowerCase().includes(q))
                            );
                          })
                          .map((user) => (
                            <button
                              key={user.uid}
                              type="button"
                              onClick={() => {
                                setVictimUid(user.uid);
                                setVictimName(`${user.name} ${user.surname}`);
                                setVictimPhone(user.primaryPhone || '');
                                setVictimFarmName(user.farmName || '');
                                if (!locationName && user.farmName) {
                                  setLocationName(user.farmName);
                                }
                                setIsMemberPickerOpen(false);
                                setMemberSearchQuery('');
                              }}
                              className={`w-full text-left p-2 flex items-center justify-between hover:bg-slate-800 transition text-xs ${
                                victimUid === user.uid ? 'bg-emerald-950/40 border-l-2 border-emerald-500' : ''
                              }`}
                            >
                              <div>
                                <div className="font-bold text-white">
                                  {user.name} {user.surname}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                  {user.farmName && (
                                    <span className="flex items-center gap-0.5 text-slate-300">
                                      <Home className="w-2.5 h-2.5 text-emerald-400" />
                                      {user.farmName}
                                    </span>
                                  )}
                                  {user.sector && <span>• {user.sector}</span>}
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] font-mono text-emerald-400 font-semibold block">
                                  {user.primaryPhone}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {victimUid === user.uid ? 'Selected' : 'Select'}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Member Details Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Victim / Member Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Johan van der Merwe"
                        value={victimName}
                        onChange={(e) => setVictimName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +27 82 455 1290"
                        value={victimPhone}
                        onChange={(e) => setVictimPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Farm / Property
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rooipoort Gedeelte 14"
                        value={victimFarmName}
                        onChange={(e) => setVictimFarmName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Member Visibility Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isVictimAware}
                        onChange={(e) => setIsVictimAware(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="text-[11px] text-slate-200">
                        Show on Member's Personal Client Cases Tab
                      </span>
                    </label>

                    {victimUid && (
                      <button
                        type="button"
                        onClick={() => {
                          setVictimUid('');
                          setVictimName('');
                          setVictimPhone('');
                          setVictimFarmName('');
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 underline"
                      >
                        Unlink Member
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SUSPECTS & VEHICLES */}
            {activeTab === 'suspects' && (
              <div className="space-y-3 animate-fadeIn">
                {/* Vehicle Details */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>Suspect Vehicle Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Make / Model (e.g. White Hilux)"
                      value={vehicleMakeModel}
                      onChange={(e) => setVehicleMakeModel(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Colour (e.g. Silver/Grey)"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Registration Plate"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Vehicle notes, damage, stickers or direction of escape..."
                    value={vehicleNotes}
                    onChange={(e) => setVehicleNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                </div>

                {/* Suspect Person Description */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Suspect Physical Description & Clothing</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Clothing Last Seen"
                      value={personClothing}
                      onChange={(e) => setPersonClothing(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Build / Height"
                      value={personBuild}
                      onChange={(e) => setPersonBuild(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Marks / Tattoos / Scars"
                      value={personMarks}
                      onChange={(e) => setPersonMarks(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="General suspect notes or modus operandi..."
                    value={personNotes}
                    onChange={(e) => setPersonNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                </div>

                {/* Linked Suspects & POI Profiles Manager */}
                <CaseSuspectsManager caseItem={caseItem} />
              </div>
            )}

            {/* TAB 5: PHOTOS & EVIDENCE */}
            {activeTab === 'photos' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Attach New Crime Scene & Evidence Photos</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Existing: {(caseItem.photos || caseItem.evidence || []).length} | New: {newPhotos.length}
                    </span>
                  </div>

                  {photoError && (
                    <div className="p-2 bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span>{photoError}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="flex items-center justify-center gap-2 p-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl font-bold transition active:scale-95 text-xs"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold transition active:scale-95 text-xs"
                    >
                      <UploadCloud className="w-4 h-4 text-blue-400" />
                      <span>Upload Files</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFilesSelected}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFilesSelected}
                      className="hidden"
                    />
                  </div>

                  {isProcessingPhotos && (
                    <div className="text-center py-1 text-amber-400 text-xs flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span>Compressing image...</span>
                    </div>
                  )}

                  {/* Newly Attached Photos */}
                  {newPhotos.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-amber-300 block">
                        New Photos to be Saved ({newPhotos.length}):
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {newPhotos.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className="relative group rounded-xl overflow-hidden border border-amber-500/50 bg-slate-950 aspect-square shadow-sm"
                          >
                            <img
                              src={photo.dataUrl}
                              alt={photo.fileName}
                              className="w-full h-full object-cover cursor-pointer transition group-hover:scale-105"
                              onClick={() => setZoomedImage(photo.dataUrl)}
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              <button
                                type="button"
                                onClick={() => setZoomedImage(photo.dataUrl)}
                                className="p-1 bg-slate-800 text-white rounded"
                              >
                                <ZoomIn className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewPhoto(photo.id)}
                                className="p-1 bg-red-600 text-white rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 bg-amber-600 text-white font-mono text-[9px] px-1 py-0.2 rounded font-bold">
                              NEW #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: MANAGEMENT ACTIONS */}
            {activeTab === 'management' && isManagement && (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-4 bg-red-950/20 rounded-xl border border-red-800/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <div>
                      <h4 className="text-xs font-bold text-red-300">Management Administrative Controls</h4>
                      <p className="text-[10px] text-red-400/80">Permanent removal of this case docket</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    Deleting a case permanently clears all attached notes, linked officers, and docket references. This action is restricted to management and cannot be undone.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.cases.deleteCaseShort}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Compact Bottom Action Bar */}
            <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-slate-800 flex-shrink-0">
              <span className="text-[10px] text-slate-500 truncate hidden sm:inline">
                Last modified: {new Date(caseItem.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <span>{t.common.loading}</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.cases.saveCase}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && caseItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-4 max-w-md w-full shadow-2xl space-y-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t.cases.deleteCaseConfirmTitle}
                </h3>
                <p className="text-xs text-red-300 font-mono">
                  {caseItem.caseNumber} • {caseItem.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {t.cases.deleteCaseConfirmMessage}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs transition"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteCase(caseItem.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
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

      {/* Camera Capture Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onPhotoCaptured={handlePhotoCapturedFromCamera}
        />
      )}

      {/* Lightbox for zooming photos */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-700 shadow-2xl">
            <img src={zoomedImage} alt="Enlarged" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
