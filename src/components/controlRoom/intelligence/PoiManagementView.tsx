import React, { useState } from 'react';
import {
  User,
  Users,
  Search,
  Plus,
  Filter,
  Shield,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Clock,
  MapPin,
  Car,
  Link as LinkIcon,
  GitMerge,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Phone,
  Tag,
  ChevronRight,
  Printer,
  Edit,
  History,
  AlertCircle,
  Lock,
  Save,
  Trash2,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import {
  PersonOfInterest,
  PoiStatus,
  IntelObservation,
  IntelConfidenceLevel,
  IntelVerificationStatus,
  IntelSourceType,
} from '../../../types';

export const PoiManagementView: React.FC = () => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const isManagement = activeRole === 'MANAGEMENT' || currentUser?.role === 'MANAGEMENT';

  const {
    pois,
    vois,
    cases,
    createPoi,
    updatePoi,
    updatePoiStatus,
    archivePoi,
    deletePoi,
    addIntelObservation,
    verifyIntelObservation,
    disputeIntelObservation,
    mergePersons,
    getUnifiedTimeline,
    intelRelationships,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPoi, setSelectedPoi] = useState<PersonOfInterest | null>(null);

  // New POI Modal State
  const [isAddingPoi, setIsAddingPoi] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSurname, setNewSurname] = useState('');
  const [newAliases, setNewAliases] = useState('');
  const [newStatus, setNewStatus] = useState<PoiStatus>('PERSON_OF_INTEREST');
  const [newApproxAge, setNewApproxAge] = useState('');
  const [newPhones, setNewPhones] = useState('');
  const [newAreas, setNewAreas] = useState('');
  const [newAddresses, setNewAddresses] = useState('');
  const [newPhotos, setNewPhotos] = useState('');
  const [newVehicles, setNewVehicles] = useState('');
  const [newAssociates, setNewAssociates] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newBuild, setNewBuild] = useState('');
  const [newMarks, setNewMarks] = useState('');
  const [newClothing, setNewClothing] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Add Observation Modal State
  const [isAddingObs, setIsAddingObs] = useState(false);
  const [obsDate, setObsDate] = useState(new Date().toISOString().substring(0, 10));
  const [obsTime, setObsTime] = useState(new Date().toTimeString().substring(0, 5));
  const [obsLocation, setObsLocation] = useState('');
  const [obsDescription, setObsDescription] = useState('');
  const [obsSourceType, setObsSourceType] = useState<IntelSourceType>('CONTROL_ROOM_OPERATOR');
  const [obsConfidence, setObsConfidence] = useState<IntelConfidenceLevel>('MEDIUM');
  const [obsVerification, setObsVerification] = useState<IntelVerificationStatus>('UNVERIFIED');
  const [obsEvidence, setObsEvidence] = useState('');

  // Status Change Modal State
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [nextStatus, setNextStatus] = useState<PoiStatus>('SUSPECT');
  const [statusReason, setStatusReason] = useState('');

  // Merge Modal State
  const [isMerging, setIsMerging] = useState(false);
  const [targetMergePoiId, setTargetMergePoiId] = useState('');
  const [mergeReason, setMergeReason] = useState('');

  // Dispute Observation Modal State
  const [disputingObsId, setDisputingObsId] = useState<string | null>(null);
  const [disputeCorrection, setDisputeCorrection] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  // Edit POI Modal State
  const [isEditingPoi, setIsEditingPoi] = useState(false);
  const [editPoiTargetId, setEditPoiTargetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editAliases, setEditAliases] = useState('');
  const [editStatus, setEditStatus] = useState<PoiStatus>('PERSON_OF_INTEREST');
  const [editApproxAge, setEditApproxAge] = useState('');
  const [editPhones, setEditPhones] = useState('');
  const [editAreas, setEditAreas] = useState('');
  const [editAddresses, setEditAddresses] = useState('');
  const [editPhotos, setEditPhotos] = useState('');
  const [editVehicles, setEditVehicles] = useState('');
  const [editAssociates, setEditAssociates] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editBuild, setEditBuild] = useState('');
  const [editMarks, setEditMarks] = useState('');
  const [editClothing, setEditClothing] = useState('');
  const [editComplexion, setEditComplexion] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLinkedCases, setEditLinkedCases] = useState('');

  // Delete POI State (Management only)
  const [poiToDelete, setPoiToDelete] = useState<PersonOfInterest | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeletingPoi, setIsDeletingPoi] = useState(false);

  // Filter POIs
  const filteredPois = pois.filter((poi) => {
    if (statusFilter !== 'ALL' && poi.status !== statusFilter) return false;
    if (poi.lifecycleState === 'ARCHIVED' && statusFilter !== 'ARCHIVED') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = `${poi.name || ''} ${poi.surname || ''}`.toLowerCase().includes(q);
    const matchId = poi.internalPoiId.toLowerCase().includes(q);
    const matchAlias = poi.aliases.some((a) => a.toLowerCase().includes(q));
    const matchAreas = poi.knownAreas.some((a) => a.toLowerCase().includes(q));
    const matchPhone = poi.phoneNumbers.some((p) => p.includes(q));
    const matchMarks = (poi.physicalDescription?.identifyingMarks || '').toLowerCase().includes(q);
    return matchName || matchId || matchAlias || matchAreas || matchPhone || matchMarks;
  });

  const handleCreatePoi = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse known associates
    const parsedAssociates = newAssociates
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        // supports "Name - Role" or "Name (Relationship)" or just "Name"
        const parts = line.split(/[-–—:]/);
        const namePart = parts[0]?.trim() || line;
        const relPart = parts[1]?.trim() || 'Known Associate';
        return {
          id: `assoc-${Date.now()}-${idx}`,
          name: namePart,
          relationship: relPart,
        };
      });

    // Parse known addresses
    const parsedAddresses = newAddresses
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => ({
        id: `addr-${Date.now()}-${idx}`,
        address: line,
        type: (idx === 0 ? 'PRIMARY_RESIDENCE' : 'FREQUENTED_LOCATION') as any,
        isVerified: false,
        addedAt: new Date().toISOString(),
      }));

    // Parse vehicles
    const parsedVehicles = newVehicles
      .split(/[\n,]/)
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean);

    // Parse photo URLs / inputs
    const parsedPhotos = newPhotos
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    await createPoi({
      name: newName.trim() || undefined,
      surname: newSurname.trim() || undefined,
      aliases: newAliases
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      approximateAge: newApproxAge ? parseInt(newApproxAge, 10) : undefined,
      phoneNumbers: newPhones
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      knownAreas: newAreas
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      knownAddresses: parsedAddresses.length > 0 ? parsedAddresses : undefined,
      physicalDescription: {
        height: newHeight.trim() || undefined,
        build: newBuild.trim() || undefined,
        identifyingMarks: newMarks.trim() || undefined,
        clothingLastSeen: newClothing.trim() || undefined,
      },
      status: newStatus,
      photos: parsedPhotos,
      associatedVehicles: parsedVehicles,
      associatedPersons: parsedAssociates,
      linkedCaseIds: [],
      notes: newNotes.trim(),
    });

    setIsAddingPoi(false);
    // Reset form
    setNewName('');
    setNewSurname('');
    setNewAliases('');
    setNewApproxAge('');
    setNewPhones('');
    setNewAreas('');
    setNewAddresses('');
    setNewPhotos('');
    setNewVehicles('');
    setNewAssociates('');
    setNewHeight('');
    setNewBuild('');
    setNewMarks('');
    setNewClothing('');
    setNewNotes('');
  };

  const handleDeletePoi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!poiToDelete) return;
    setIsDeletingPoi(true);
    try {
      await deletePoi(poiToDelete.id, deleteReason || 'Management Permanent Deletion');
      if (selectedPoi?.id === poiToDelete.id) {
        setSelectedPoi(null);
      }
      if (editPoiTargetId === poiToDelete.id) {
        setIsEditingPoi(false);
        setEditPoiTargetId(null);
      }
      setPoiToDelete(null);
      setDeleteReason('');
    } catch (err) {
      console.error('Failed to delete POI:', err);
    } finally {
      setIsDeletingPoi(false);
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoi || !obsDescription.trim()) return;

    await addIntelObservation({
      poiId: selectedPoi.id,
      incidentTimestamp: `${obsDate}T${obsTime}:00Z`,
      date: obsDate,
      time: obsTime,
      locationDescription: obsLocation,
      description: obsDescription,
      sourceType: obsSourceType,
      confidenceLevel: obsConfidence,
      verificationStatus: obsVerification,
      evidenceReferences: obsEvidence ? [obsEvidence] : [],
    });

    setIsAddingObs(false);
    setObsDescription('');
    setObsLocation('');
    setObsEvidence('');
    // refresh selected POI
    const refreshed = pois.find((p) => p.id === selectedPoi.id);
    if (refreshed) setSelectedPoi(refreshed);
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoi || !statusReason.trim()) return;

    await updatePoiStatus(selectedPoi.id, nextStatus, statusReason);
    setIsChangingStatus(false);
    setStatusReason('');
    const refreshed = pois.find((p) => p.id === selectedPoi.id);
    if (refreshed) setSelectedPoi(refreshed);
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoi || !targetMergePoiId || !mergeReason.trim()) return;

    await mergePersons(selectedPoi.id, targetMergePoiId, mergeReason);
    setIsMerging(false);
    setMergeReason('');
    setSelectedPoi(null);
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoi || !disputingObsId || !disputeCorrection.trim() || !disputeReason.trim()) return;

    await disputeIntelObservation(disputingObsId, '', disputeCorrection, disputeReason);
    setDisputingObsId(null);
    setDisputeCorrection('');
    setDisputeReason('');
    const refreshed = pois.find((p) => p.id === selectedPoi.id);
    if (refreshed) setSelectedPoi(refreshed);
  };

  const openEditPoiModal = (poi: PersonOfInterest) => {
    setEditPoiTargetId(poi.id);
    setEditName(poi.name || '');
    setEditSurname(poi.surname || '');
    setEditNickname(poi.nickname || '');
    setEditAliases(poi.aliases ? poi.aliases.join(', ') : '');
    setEditStatus(poi.status || 'PERSON_OF_INTEREST');
    setEditApproxAge(poi.approximateAge ? String(poi.approximateAge) : '');
    setEditPhones(poi.phoneNumbers ? poi.phoneNumbers.join(', ') : '');
    setEditAreas(poi.knownAreas ? poi.knownAreas.join(', ') : '');

    // Addresses
    if (poi.knownAddresses && poi.knownAddresses.length > 0) {
      setEditAddresses(poi.knownAddresses.map((a) => a.address).join('\n'));
    } else if (poi.addresses && poi.addresses.length > 0) {
      setEditAddresses(poi.addresses.join('\n'));
    } else {
      setEditAddresses('');
    }

    // Photos
    setEditPhotos(poi.photos ? poi.photos.join('\n') : '');

    // Vehicles
    setEditVehicles(poi.associatedVehicles ? poi.associatedVehicles.join(', ') : '');

    // Associates
    if (poi.associatedPersons && poi.associatedPersons.length > 0) {
      setEditAssociates(
        poi.associatedPersons
          .map((ap) =>
            typeof ap === 'string'
              ? ap
              : `${ap.name}${ap.relationship ? ' - ' + ap.relationship : ''}${ap.phone ? ' (' + ap.phone + ')' : ''}`
          )
          .join('\n')
      );
    } else if (poi.knownAssociates && poi.knownAssociates.length > 0) {
      setEditAssociates(
        poi.knownAssociates
          .map((ka) => `${ka.name}${ka.relationship ? ' - ' + ka.relationship : ''}`)
          .join('\n')
      );
    } else {
      setEditAssociates('');
    }

    setEditHeight(poi.physicalDescription?.height || '');
    setEditBuild(poi.physicalDescription?.build || '');
    setEditMarks(poi.physicalDescription?.identifyingMarks || '');
    setEditClothing(poi.physicalDescription?.clothingLastSeen || '');
    setEditComplexion(poi.physicalDescription?.complexion || '');
    setEditNotes(poi.notes || '');
    setEditLinkedCases(poi.linkedCaseIds ? poi.linkedCaseIds.join(', ') : '');

    setIsEditingPoi(true);
  };

  const handleSaveEditedPoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPoiTargetId) return;

    const targetPoi = pois.find((p) => p.id === editPoiTargetId);
    if (!targetPoi) return;

    // Parse known associates
    const parsedAssociates = editAssociates
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split(/[-–—:]/);
        const namePart = parts[0]?.trim() || line;
        const relPart = parts[1]?.trim() || 'Known Associate';
        return {
          id: `assoc-${Date.now()}-${idx}`,
          name: namePart,
          relationship: relPart,
        };
      });

    // Parse known addresses
    const parsedAddresses = editAddresses
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => ({
        id: `addr-${Date.now()}-${idx}`,
        address: line,
        type: (idx === 0 ? 'PRIMARY_RESIDENCE' : 'FREQUENTED_LOCATION') as any,
        isVerified: false,
        addedAt: new Date().toISOString(),
      }));

    // Parse vehicles
    const parsedVehicles = editVehicles
      .split(/[\n,]/)
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean);

    // Parse photos
    const parsedPhotos = editPhotos
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    // Parse aliases
    const parsedAliases = editAliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    // Parse phones
    const parsedPhones = editPhones
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    // Parse areas
    const parsedAreas = editAreas
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    // Parse cases
    const parsedCases = editLinkedCases
      .split(/[\n,]/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const updates: Partial<PersonOfInterest> = {
      name: editName.trim() || undefined,
      surname: editSurname.trim() || undefined,
      nickname: editNickname.trim() || undefined,
      aliases: parsedAliases,
      status: editStatus,
      approximateAge: editApproxAge ? parseInt(editApproxAge, 10) : undefined,
      phoneNumbers: parsedPhones,
      knownAreas: parsedAreas,
      knownAddresses: parsedAddresses.length > 0 ? parsedAddresses : undefined,
      addresses: parsedAddresses.map((a) => a.address),
      photos: parsedPhotos,
      associatedVehicles: parsedVehicles,
      associatedPersons: parsedAssociates,
      linkedCaseIds: parsedCases,
      physicalDescription: {
        ...targetPoi.physicalDescription,
        height: editHeight.trim() || undefined,
        build: editBuild.trim() || undefined,
        identifyingMarks: editMarks.trim() || undefined,
        clothingLastSeen: editClothing.trim() || undefined,
        complexion: editComplexion.trim() || undefined,
      },
      notes: editNotes.trim(),
    };

    updatePoi(targetPoi.id, updates);
    setIsEditingPoi(false);
    setEditPoiTargetId(null);

    // If active selectedPoi was updated, refresh it
    if (selectedPoi && selectedPoi.id === targetPoi.id) {
      setSelectedPoi({ ...targetPoi, ...updates, updatedAt: new Date().toISOString() });
    }
  };

  const getStatusBadge = (status: PoiStatus) => {
    switch (status.toUpperCase()) {
      case 'WANTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-red-600 text-white uppercase tracking-wider shadow-sm animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" /> SAPS WANTED
          </span>
        );
      case 'SUSPECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
            <AlertTriangle className="w-3.5 h-3.5" /> FORMAL SUSPECT
          </span>
        );
      case 'PERSON_OF_INTEREST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
            <User className="w-3.5 h-3.5" /> PERSON OF INTEREST
          </span>
        );
      case 'UNKNOWN_PERSON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> UNKNOWN SUBJECT
          </span>
        );
      case 'CLEARED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" /> CLEARED / EXONERATED
          </span>
        );
      case 'ARRESTED':
      case 'CONVICTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
            <Lock className="w-3.5 h-3.5" /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getConfidencePill = (conf?: IntelConfidenceLevel) => {
    switch (conf?.toUpperCase()) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">HIGH CONFIDENCE</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60">MEDIUM CONFIDENCE</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">LOW CONFIDENCE</span>;
    }
  };

  const getVerificationPill = (status?: IntelVerificationStatus) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED</span>;
      case 'PARTIALLY_VERIFIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60">PARTIALLY VERIFIED</span>;
      case 'DISPUTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/60 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> DISPUTED</span>;
      case 'FALSE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 line-through">FALSE</span>;
      case 'UNVERIFIED':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">UNVERIFIED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-1 items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search POI by internal ID (POI-HBF-xxx), full name, alias, phone, marks, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white text-xs">
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses ({pois.length})</option>
            <option value="WANTED">Wanted (SAPS)</option>
            <option value="SUSPECT">Formal Suspects</option>
            <option value="PERSON_OF_INTEREST">Persons of Interest</option>
            <option value="UNKNOWN_PERSON">Unknown Subjects</option>
            <option value="CLEARED">Cleared / Exonerated</option>
            <option value="ARCHIVED">Archived Records</option>
          </select>

          <button
            onClick={() => setIsAddingPoi(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New POI Dossier
          </button>
        </div>
      </div>

      {/* POI Cards Grid */}
      {filteredPois.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No Person of Interest dossiers match query</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting search parameters or create a new dossier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPois.map((poi) => {
            const hasWarrant = poi.status === 'WANTED';
            return (
              <div
                key={poi.id}
                onClick={() => setSelectedPoi(poi)}
                className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all hover:border-amber-500/60 hover:shadow-md relative flex flex-col justify-between ${
                  hasWarrant
                    ? 'border-red-900/70 shadow-red-950/20'
                    : poi.status === 'SUSPECT'
                    ? 'border-amber-800/50'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Suspect Photo Avatar / Placeholder */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center relative shadow-inner">
                        {poi.photos && poi.photos.length > 0 ? (
                          <img
                            src={poi.photos[0]}
                            alt={poi.name || poi.internalPoiId}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-600">
                            <User className="w-6 h-6" />
                            <span className="text-[9px] text-slate-500 font-mono">NO PHOTO</span>
                          </div>
                        )}
                        {poi.photos && poi.photos.length > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-amber-300 text-[9px] font-bold px-1 rounded">
                            +{poi.photos.length - 1}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/50 border border-amber-900/40 px-1.5 py-0.5 rounded">
                            {poi.internalPoiId}
                          </span>
                          {poi.lifecycleState === 'MERGED' && (
                            <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">
                              MERGED
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white mt-1 truncate">
                          {poi.name || poi.surname ? `${poi.name || ''} ${poi.surname || ''}` : 'Unknown Subject'}
                        </h3>
                        {poi.nickname && <p className="text-xs text-amber-300 font-medium truncate">"{poi.nickname}"</p>}
                      </div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(poi.status)}</div>
                  </div>

                  {/* Aliases */}
                  {poi.aliases.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {poi.aliases.map((alias, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                        >
                          a.k.a. {alias}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Physical & Identifying Marks */}
                  <div className="text-xs text-slate-300 space-y-1 mb-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    {poi.approximateAge && (
                      <div>
                        <span className="text-slate-500">Approx. Age:</span> ~{poi.approximateAge} yrs
                      </div>
                    )}
                    {poi.physicalDescription?.height && (
                      <div>
                        <span className="text-slate-500">Height / Build:</span> {poi.physicalDescription.height}{' '}
                        {poi.physicalDescription.build && `• ${poi.physicalDescription.build}`}
                      </div>
                    )}
                    {poi.physicalDescription?.identifyingMarks && (
                      <div className="text-amber-200/90 font-medium">
                        <span className="text-slate-500">Marks:</span> {poi.physicalDescription.identifyingMarks}
                      </div>
                    )}
                  </div>

                  {/* Linked metadata stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-b border-slate-800/80">
                    <div className="bg-slate-950/50 p-1.5 rounded">
                      <div className="font-bold text-white">{poi.observations?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Sightings</div>
                    </div>
                    <div className="bg-slate-950/50 p-1.5 rounded">
                      <div className="font-bold text-white">{poi.associatedVehicles?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Vehicles</div>
                    </div>
                    <div className="bg-slate-950/50 p-1.5 rounded">
                      <div className="font-bold text-white">{poi.linkedCaseIds?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Cases</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-[150px]">
                    {poi.knownAreas[0] ? `Sector: ${poi.knownAreas[0]}` : 'General Sector'}
                  </span>
                  <div className="flex items-center gap-2">
                    {isManagement && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPoiToDelete(poi);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 flex items-center gap-1 hover:text-rose-100 transition"
                        title="Verwyder POI rekord permanent (Bestuur)"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        Verwyder
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPoiModal(poi);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 hover:text-white"
                    >
                      <Edit className="w-3 h-3 text-blue-400" />
                      Edit
                    </button>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      Dossier <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED POI DOSSIER MODAL */}
      {selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Epistemic Demarcation Safeguard Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-400 uppercase tracking-wider font-mono text-[11px]">
                  Confidential Intelligence Dossier • Safeguards Active
                </strong>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Strictly demarcate <strong>FACTS</strong> (confirmed ID/court warrants) from <strong>OBSERVATIONS</strong> (field patrol sightings), <strong>ALLEGATIONS</strong> (unverified reports), and <strong>INFERENCES</strong>. AI never determines guilt.
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-start gap-4">
                {/* Dossier Photo Box */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center relative shadow-lg">
                  {selectedPoi.photos && selectedPoi.photos.length > 0 ? (
                    <img
                      src={selectedPoi.photos[0]}
                      alt={selectedPoi.name || selectedPoi.internalPoiId}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600">
                      <User className="w-8 h-8" />
                      <span className="text-[9px] text-slate-500 font-mono">NO PHOTO</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-900/60 px-2 py-0.5 rounded">
                      {selectedPoi.internalPoiId}
                    </span>
                    {selectedPoi.lifecycleState === 'MERGED' && (
                      <span className="text-xs bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                        MERGED RECORD
                      </span>
                    )}
                    {getStatusBadge(selectedPoi.status)}
                  </div>

                  <h2 className="text-2xl font-black text-white mt-1">
                    {selectedPoi.name || selectedPoi.surname
                      ? `${selectedPoi.name || ''} ${selectedPoi.surname || ''}`
                      : 'Unknown Subject'}
                  </h2>

                  {selectedPoi.nickname && (
                    <p className="text-sm text-amber-300 font-semibold">
                      Known as "{selectedPoi.nickname}"
                    </p>
                  )}

                  {selectedPoi.aliases.length > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Aliases: <span className="text-slate-200">{selectedPoi.aliases.join(', ')}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditPoiModal(selectedPoi)}
                  className="px-3 py-1.5 bg-blue-900/50 hover:bg-blue-800 text-blue-200 border border-blue-700/60 font-medium rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Dossier
                </button>

                <button
                  onClick={() => setIsAddingObs(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Observation
                </button>

                <button
                  onClick={() => {
                    setNextStatus(selectedPoi.status);
                    setIsChangingStatus(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Change Status
                </button>

                {activeRole === 'MANAGEMENT' && (
                  <>
                    <button
                      onClick={() => setIsMerging(true)}
                      className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-medium rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      Merge Record
                    </button>
                    <button
                      onClick={() => setPoiToDelete(selectedPoi)}
                      className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-medium rounded-lg text-xs flex items-center gap-1.5 transition"
                      title="Verwyder POI rekord permanent"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      Verwyder POI
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedPoi(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Body Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Physical, Contact & Background */}
              <div className="space-y-4">
                {/* Photo Gallery Card (if multiple or single photos exist) */}
                {selectedPoi.photos && selectedPoi.photos.length > 0 && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      Photographic Record ({selectedPoi.photos.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPoi.photos.map((imgUrl, i) => (
                        <a
                          key={i}
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-900 block group relative hover:border-amber-500/60"
                        >
                          <img
                            src={imgUrl}
                            alt={`POI ${selectedPoi.internalPoiId} photo ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                            View Full
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Physical Description Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    Physical Description
                  </h4>
                  <div className="text-xs space-y-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Height & Build:</span>
                      <span className="font-medium text-slate-200">
                        {selectedPoi.physicalDescription?.height || 'Unrecorded'} • {selectedPoi.physicalDescription?.build || 'Unrecorded build'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Distinguishing Marks / Tattoos:</span>
                      <span className="font-semibold text-amber-300">
                        {selectedPoi.physicalDescription?.identifyingMarks || 'None documented'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Complexion:</span>
                      <span>{selectedPoi.physicalDescription?.complexion || 'Unrecorded'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Clothing Last Seen:</span>
                      <span>{selectedPoi.physicalDescription?.clothingLastSeen || 'Unrecorded'}</span>
                    </div>
                  </div>
                </div>

                {/* Contact, Geographic Presence & Addresses */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    Known Addresses & Geographic Presence
                  </h4>
                  <div className="text-xs space-y-2.5 text-slate-300">
                    {/* Known Addresses */}
                    <div>
                      <span className="text-slate-500 block mb-1">Known Addresses / Dwellings:</span>
                      {selectedPoi.knownAddresses && selectedPoi.knownAddresses.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedPoi.knownAddresses.map((addr, i) => (
                            <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <div className="text-slate-200 font-medium">{addr.address}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span className="px-1 py-0.2 bg-slate-950 rounded border border-slate-800 text-amber-300/80 uppercase">
                                    {addr.type?.replace('_', ' ') || 'ADDRESS'}
                                  </span>
                                  {addr.isVerified ? (
                                    <span className="text-emerald-400 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">Unverified Lead</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No street addresses documented</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-500 block">Operating Sectors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPoi.knownAreas.length > 0 ? (
                          selectedPoi.knownAreas.map((area, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-[11px]">
                              {area}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">No specific sectors recorded</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Known Phone Numbers:</span>
                      {selectedPoi.phoneNumbers.length > 0 ? (
                        <div className="space-y-1 mt-1">
                          {selectedPoi.phoneNumbers.map((p, i) => (
                            <div key={i} className="font-mono text-slate-200 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {p}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No numbers documented</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linked Vehicles & Associated Persons */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    Associated Entities & Network
                  </h4>
                  <div className="space-y-3 text-xs">
                    {/* Associated Vehicles */}
                    <div>
                      <span className="text-slate-500 block mb-1">Associated Vehicles (VOI):</span>
                      {selectedPoi.associatedVehicles.length > 0 ? (
                        <div className="space-y-1">
                          {selectedPoi.associatedVehicles.map((voiReg, i) => (
                            <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-slate-200">
                              <div className="flex items-center gap-2">
                                <Car className="w-3.5 h-3.5 text-amber-400" />
                                <span className="font-mono font-bold text-amber-400">{voiReg}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">Linked VOI</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No direct vehicle links</span>
                      )}
                    </div>

                    {/* Known Associates */}
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block mb-1">Known Associates & Accomplices:</span>
                      {selectedPoi.associatedPersons && selectedPoi.associatedPersons.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedPoi.associatedPersons.map((assoc: any, i) => {
                            const name = typeof assoc === 'string' ? assoc : assoc?.name;
                            const rel = typeof assoc === 'object' ? assoc?.relationship : undefined;
                            const phone = typeof assoc === 'object' ? assoc?.phone : undefined;
                            return (
                              <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-slate-200">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-200 truncate">{name}</div>
                                    {rel && <div className="text-[10px] text-slate-400 truncate">{rel}</div>}
                                  </div>
                                </div>
                                {phone && (
                                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{phone}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No associates recorded</span>
                      )}
                    </div>

                    {/* Linked Cases */}
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block mb-1">Linked Incident Cases:</span>
                      {selectedPoi.linkedCaseIds.length > 0 ? (
                        <div className="space-y-1">
                          {selectedPoi.linkedCaseIds.map((cId, i) => {
                            const foundCase = cases.find((c) => c.id === cId || c.caseNumber === cId);
                            return (
                              <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-200 text-xs">
                                <div className="font-bold text-amber-400">{foundCase?.caseNumber || cId}</div>
                                {foundCase && <div className="text-slate-400 text-[11px] truncate">{foundCase.title}</div>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No active linked cases</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle & Right Columns: Sighting Observations & Unified Timeline */}
              <div className="lg:col-span-2 space-y-4">
                {/* Observations Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      Field Observations & Sightings ({selectedPoi.observations?.length || 0})
                    </h4>
                    <button
                      onClick={() => setIsAddingObs(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Sighting
                    </button>
                  </div>

                  {(!selectedPoi.observations || selectedPoi.observations.length === 0) ? (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      No field observations recorded for this person yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPoi.observations.map((obs) => (
                        <div
                          key={obs.id}
                          className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-400 text-[11px]">{obs.observationId}</span>
                              {getVerificationPill(obs.verificationStatus)}
                              {getConfidencePill(obs.confidenceLevel)}
                            </div>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {obs.date || obs.incidentTimestamp.substring(0, 10)} {obs.time || ''}
                            </span>
                          </div>

                          <p className="text-slate-200 leading-relaxed">{obs.description}</p>

                          {obs.locationDescription && (
                            <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{obs.locationDescription}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 text-[11px] text-slate-400 border-t border-slate-800/60">
                            <div>
                              Source: <strong className="text-slate-300">{obs.sourceType}</strong>
                              {obs.enteredByName && ` (logged by ${obs.enteredByName})`}
                            </div>
                            <div className="flex items-center gap-2">
                              {obs.verificationStatus !== 'VERIFIED' && (
                                <button
                                  onClick={() => verifyIntelObservation(obs.id, 'VERIFIED', 'HIGH', 'Verified by operator review')}
                                  className="text-emerald-400 hover:underline font-medium"
                                >
                                  Verify
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setDisputingObsId(obs.id);
                                  setDisputeCorrection('');
                                  setDisputeReason('');
                                }}
                                className="text-rose-400 hover:underline font-medium"
                              >
                                Dispute / Correct
                              </button>
                            </div>
                          </div>

                          {/* Dispute Trail if corrected */}
                          {obs.disputeHistory && obs.disputeHistory.length > 0 && (
                            <div className="bg-rose-950/20 border border-rose-900/40 rounded p-2 text-[11px] text-rose-200 space-y-1 mt-1">
                              <div className="font-bold flex items-center gap-1 text-rose-400">
                                <History className="w-3 h-3" /> Correction History
                              </div>
                              {obs.disputeHistory.map((dh, dIdx) => (
                                <div key={dIdx} className="text-slate-400">
                                  "{dh.correction}" — reason: {dh.reason} ({dh.correctedByName})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Audit Trail */}
                {selectedPoi.statusAuditTrail && selectedPoi.statusAuditTrail.length > 0 && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      Status Change & Authorization Log
                    </h4>
                    <div className="space-y-1.5">
                      {selectedPoi.statusAuditTrail.map((st, i) => (
                        <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800/80 text-xs text-slate-300">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              {st.previousStatus} ➔ <strong className="text-amber-400">{st.newStatus}</strong>
                            </span>
                            <span className="font-mono">{new Date(st.timestamp).toLocaleString('en-ZA')}</span>
                          </div>
                          <div className="mt-1 text-slate-300">Reason: {st.reason}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Authorized by: {st.changedByName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW POI DOSSIER MODAL */}
      {isAddingPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create New Person of Interest Dossier</h3>
              </div>
              <button onClick={() => setIsAddingPoi(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoi} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">First Name / Known Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sipho (leave blank if unknown)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Surname</label>
                  <input
                    type="text"
                    value={newSurname}
                    onChange={(e) => setNewSurname(e.target.value)}
                    placeholder="e.g. Ndlovu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Aliases / Nicknames (comma separated)</label>
                  <input
                    type="text"
                    value={newAliases}
                    onChange={(e) => setNewAliases(e.target.value)}
                    placeholder="e.g. Mshana, Ghost"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status Classification</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PoiStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="UNKNOWN_PERSON">Unknown Subject / Unidentified</option>
                    <option value="PERSON_OF_INTEREST">Person of Interest (Operational)</option>
                    <option value="SUSPECT">Formal Suspect</option>
                    <option value="WANTED">Wanted (SAPS Warrant)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Approximate Age</label>
                  <input
                    type="number"
                    value={newApproxAge}
                    onChange={(e) => setNewApproxAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Height</label>
                  <input
                    type="text"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    placeholder="e.g. 1.75m / Medium"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Build</label>
                  <input
                    type="text"
                    value={newBuild}
                    onChange={(e) => setNewBuild(e.target.value)}
                    placeholder="e.g. Slender, Stocky"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Identifying Marks / Tattoos / Scars</label>
                <input
                  type="text"
                  value={newMarks}
                  onChange={(e) => setNewMarks(e.target.value)}
                  placeholder="e.g. Scar on left jawline, tattoo on right wrist"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone Numbers (comma separated)</label>
                  <input
                    type="text"
                    value={newPhones}
                    onChange={(e) => setNewPhones(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Known Sectors / Areas</label>
                  <input
                    type="text"
                    value={newAreas}
                    onChange={(e) => setNewAreas(e.target.value)}
                    placeholder="e.g. Sektor 1 Suid, Silo corridor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Suspect Photo & Known Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Suspect Photo URLs / Image Paths (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    value={newPhotos}
                    onChange={(e) => setNewPhotos(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    Known Addresses (1 or more, 1 per line)
                  </label>
                  <textarea
                    rows={2}
                    value={newAddresses}
                    onChange={(e) => setNewAddresses(e.target.value)}
                    placeholder="14 Tambo St, Hectorspruit&#10;Plot 22 Farmstead Outpost"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-[11px]"
                  />
                </div>
              </div>

              {/* Linked Vehicles & Known Associates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Associated Vehicles / VOI Plates (comma or newline separated)
                  </label>
                  <input
                    type="text"
                    value={newVehicles}
                    onChange={(e) => setNewVehicles(e.target.value)}
                    placeholder="e.g. HBF 942 MP, CA 123-456"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    Known Associates (1 per line: Name - Relationship)
                  </label>
                  <textarea
                    rows={2}
                    value={newAssociates}
                    onChange={(e) => setNewAssociates(e.target.value)}
                    placeholder="Themba Khumalo - Accomplice / Driver&#10;Sipho Ndlovu - Lookout"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Dossier Notes & Background</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Factual context, SAPS CAS reference numbers if applicable..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingPoi(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Create Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD OBSERVATION MODAL */}
      {isAddingObs && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Add Field Observation for {selectedPoi.internalPoiId}
                </h3>
              </div>
              <button onClick={() => setIsAddingObs(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddObservation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={obsDate}
                    onChange={(e) => setObsDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={obsTime}
                    onChange={(e) => setObsTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location Description</label>
                <input
                  type="text"
                  value={obsLocation}
                  onChange={(e) => setObsLocation(e.target.value)}
                  placeholder="e.g. R507 corner near Silo entrance"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Observation Description</label>
                <textarea
                  value={obsDescription}
                  onChange={(e) => setObsDescription(e.target.value)}
                  placeholder="State what was observed in factual, objective terms..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Source Type</label>
                  <select
                    value={obsSourceType}
                    onChange={(e) => setObsSourceType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="CONTROL_ROOM_OPERATOR">Control Room Operator</option>
                    <option value="CONTROL_ROOM_CALL">Control Room Phone Call</option>
                    <option value="SAPS">SAPS Officer Report</option>
                    <option value="SECURITY_COMPANY">Reaction Patrol Officer</option>
                    <option value="CLIENT_REPORT">Client Community Report</option>
                    <option value="CCTV">CCTV Camera Log</option>
                    <option value="BOLO_SIGHTING">Public BOLO Sighting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Confidence Level</label>
                  <select
                    value={obsConfidence}
                    onChange={(e) => setObsConfidence(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="HIGH">High (Direct physical sighting / Patrol ID)</option>
                    <option value="MEDIUM">Medium (Corroborated report)</option>
                    <option value="LOW">Low (Uncorroborated / Distance view)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Evidence / Reference Number (optional)</label>
                <input
                  type="text"
                  value={obsEvidence}
                  onChange={(e) => setObsEvidence(e.target.value)}
                  placeholder="e.g. CCTV clip #0492 or CAS 12/08/2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingObs(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS CHANGE MODAL */}
      {isChangingStatus && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Change Status Classification</h3>
              <button onClick={() => setIsChangingStatus(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">New Classification Status</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as PoiStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="UNKNOWN_PERSON">UNKNOWN_PERSON</option>
                  <option value="PERSON_OF_INTEREST">PERSON_OF_INTEREST</option>
                  <option value="SUSPECT">SUSPECT</option>
                  <option value="WANTED">WANTED (SAPS Warrant)</option>
                  <option value="CLEARED">CLEARED / EXONERATED</option>
                  <option value="ARRESTED">ARRESTED</option>
                  <option value="CONVICTED">CONVICTED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Mandatory Justification & Legal Reference <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  required
                  placeholder="State the verified evidence or SAPS officer instruction requiring this status change..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChangingStatus(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Update & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE MODAL (MANAGEMENT ONLY) */}
      {isMerging && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Non-Destructive Person Merge</h3>
              </div>
              <button onClick={() => setIsMerging(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Target record <strong>{selectedPoi.internalPoiId}</strong> will absorb observations and aliases from the secondary record. Lineage is retained in audit logs.
            </p>

            <form onSubmit={handleMergeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Secondary Record to Merge Into This One</label>
                <select
                  value={targetMergePoiId}
                  onChange={(e) => setTargetMergePoiId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="">-- Choose POI to Merge --</option>
                  {pois
                    .filter((p) => p.id !== selectedPoi.id && p.lifecycleState !== 'MERGED')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.internalPoiId} - {p.name || ''} {p.surname || 'Unknown'} ({p.status})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Merge Justification & Audit Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  required
                  placeholder="e.g. Verified through biometric matching that POI-HBF-001 and POI-HBF-009 are the same individual."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[80px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMerging(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
                >
                  Execute Merge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPUTE OBSERVATION MODAL */}
      {disputingObsId && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Dispute / Correct Field Observation</h3>
              <button onClick={() => setDisputingObsId(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  Corrected Factual Detail <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={disputeCorrection}
                  onChange={(e) => setDisputeCorrection(e.target.value)}
                  required
                  placeholder="e.g. Subject was wearing dark blue overall, not black hoodie"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Reason for Dispute / Evidence Basis <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  required
                  placeholder="e.g. Clear HD camera footage verified exact clothing colors at gate entrance."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[70px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDisputingObsId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                >
                  Submit Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT POI DOSSIER MODAL */}
      {isEditingPoi && editPoiTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Intelligence Dossier</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Subject ID: {pois.find((p) => p.id === editPoiTargetId)?.internalPoiId || editPoiTargetId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditingPoi(false);
                  setEditPoiTargetId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPoi} className="space-y-4 text-xs">
              {/* Basic Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">First Name / Given Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Themba"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Surname / Family Name</label>
                  <input
                    type="text"
                    value={editSurname}
                    onChange={(e) => setEditSurname(e.target.value)}
                    placeholder="e.g. Khumalo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Primary Nickname / Call-sign</label>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="e.g. Shorty"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-amber-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Known Aliases (comma separated)</label>
                  <input
                    type="text"
                    value={editAliases}
                    onChange={(e) => setEditAliases(e.target.value)}
                    placeholder="e.g. Skaap, Bra T, Mshana"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Classification Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PoiStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="UNKNOWN_PERSON">UNKNOWN_PERSON</option>
                    <option value="PERSON_OF_INTEREST">PERSON_OF_INTEREST</option>
                    <option value="SUSPECT">SUSPECT</option>
                    <option value="WANTED">WANTED (SAPS Warrant)</option>
                    <option value="CLEARED">CLEARED / EXONERATED</option>
                    <option value="ARRESTED">ARRESTED</option>
                    <option value="CONVICTED">CONVICTED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Approximate Age</label>
                  <input
                    type="number"
                    value={editApproxAge}
                    onChange={(e) => setEditApproxAge(e.target.value)}
                    placeholder="e.g. 34"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Physical Characteristics */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono block">
                  Physical Profile & Identifying Marks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Estimated Height</label>
                    <input
                      type="text"
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      placeholder="e.g. 1.75m or Tall"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Build / Body Type</label>
                    <input
                      type="text"
                      value={editBuild}
                      onChange={(e) => setEditBuild(e.target.value)}
                      placeholder="e.g. Slender, Stocky, Muscular"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Complexion</label>
                    <input
                      type="text"
                      value={editComplexion}
                      onChange={(e) => setEditComplexion(e.target.value)}
                      placeholder="e.g. Dark, Medium, Light"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Scars / Tattoos / Physical Marks</label>
                    <input
                      type="text"
                      value={editMarks}
                      onChange={(e) => setEditMarks(e.target.value)}
                      placeholder="e.g. Snake tattoo right forearm, limp on right leg"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Clothing Profile / Last Known Attire</label>
                    <input
                      type="text"
                      value={editClothing}
                      onChange={(e) => setEditClothing(e.target.value)}
                      placeholder="e.g. Dark blue boiler suit jacket, red beanie"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Photos & Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Suspect Photo URLs / Image Paths (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={editPhotos}
                    onChange={(e) => setEditPhotos(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    Known Addresses / Dwellings (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={editAddresses}
                    onChange={(e) => setEditAddresses(e.target.value)}
                    placeholder="Plot 14 Rooipoort Outpost, Hartbeesfontein Rural&#10;House 1142, Extension 2, Tigane"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-[11px]"
                  />
                </div>
              </div>

              {/* Vehicles & Associates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Associated Vehicles / VOI Plates (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editVehicles}
                    onChange={(e) => setEditVehicles(e.target.value)}
                    placeholder="e.g. Red Isuzu KB Single Cab (CK 921 GP), NW 844 112"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    Known Associates (1 per line: Name - Relationship)
                  </label>
                  <textarea
                    rows={2}
                    value={editAssociates}
                    onChange={(e) => setEditAssociates(e.target.value)}
                    placeholder="Sipho Ndlovu - Accomplice / Driver&#10;Lucas Sithole - Scout"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-[11px]"
                  />
                </div>
              </div>

              {/* Sectors, Phones & Linked Cases */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Known Sectors / Areas (comma separated)</label>
                  <input
                    type="text"
                    value={editAreas}
                    onChange={(e) => setEditAreas(e.target.value)}
                    placeholder="e.g. Sektor 2 Noord, R503 Corridor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Numbers (comma separated)</label>
                  <input
                    type="text"
                    value={editPhones}
                    onChange={(e) => setEditPhones(e.target.value)}
                    placeholder="e.g. +27 78 301 9921, +27 61 902 4412"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Linked Case Numbers (comma separated)</label>
                  <input
                    type="text"
                    value={editLinkedCases}
                    onChange={(e) => setEditLinkedCases(e.target.value)}
                    placeholder="e.g. CASE-2026-0042, CAS 14/08/2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Dossier Notes */}
              <div>
                <label className="block text-slate-400 mb-1">Dossier Notes & Intelligence Synopsis</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Comprehensive notes, MO, risk profile..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                {isManagement && editPoiTargetId && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = pois.find((p) => p.id === editPoiTargetId);
                      if (target) {
                        setPoiToDelete(target);
                      }
                    }}
                    className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                    title="Verwyder POI rekord permanent"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Verwyder POI
                  </button>
                )}
                <div className="flex justify-end gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPoi(false);
                      setEditPoiTargetId(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE POI MODAL (MANAGEMENT ONLY) */}
      {poiToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-rose-950/50">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Verwyder POI Rekord?</h3>
                <p className="text-xs text-rose-400 font-mono">Bestuursaksie (Permanente Skrapping)</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">POI Kode:</span>
                <span className="font-mono font-bold text-amber-400">{poiToDelete.internalPoiId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Naam:</span>
                <span className="font-semibold text-white">
                  {poiToDelete.name || poiToDelete.surname ? `${poiToDelete.name || ''} ${poiToDelete.surname || ''}` : 'Onbekend'}
                </span>
              </div>
              {poiToDelete.aliases && poiToDelete.aliases.length > 0 && (
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">Bynaam/Alias:</span>
                  <span className="text-slate-300">{poiToDelete.aliases.join(', ')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-amber-300">{poiToDelete.status}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Rede vir Skrapping (opsioneel vir ouditlog):
              </label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="bv. Duplikaat rekord, Verkeerde inskrywing, Toetsdata..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              ⚠️ <strong>Waarskuwing:</strong> Hierdie aksie sal die POI permanent uit die intelligensie-databasis verwyder en skakels in gekoppelde sake ontkoppel. 'n Permanente oudit-inskrywing sal aangeteken word.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPoiToDelete(null);
                  setDeleteReason('');
                }}
                disabled={isDeletingPoi}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Kanselleer
              </button>
              <button
                type="button"
                onClick={() => handleDeletePoi()}
                disabled={isDeletingPoi}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/60 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isDeletingPoi ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verwyder tans...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanent Verwyder</span>
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
