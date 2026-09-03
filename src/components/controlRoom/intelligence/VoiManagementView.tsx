import React, { useState } from 'react';
import {
  Car,
  Search,
  Plus,
  Filter,
  Shield,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Clock,
  MapPin,
  User,
  GitMerge,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Edit,
  Tag,
  MessageSquare,
  Send,
  Trash2,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import {
  VehicleOfInterest,
  IntelObservation,
  IntelConfidenceLevel,
  IntelVerificationStatus,
  IntelSourceType,
} from '../../../types';
import { WhatsAppVehicleAlertModal } from './WhatsAppVehicleAlertModal';
import { sendVehicleFlaggedWhatsAppAlert } from '../../../services/whatsappService';

export const VoiManagementView: React.FC = () => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const {
    vois,
    pois,
    cases,
    createVoi,
    updateVoi,
    updateVoiStatus,
    archiveVoi,
    deleteVoi,
    addIntelObservation,
    mergeVehicles,
    settings,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedVoi, setSelectedVoi] = useState<VehicleOfInterest | null>(null);
  const [whatsappAlertVehicle, setWhatsappAlertVehicle] = useState<VehicleOfInterest | null>(null);

  // Delete VOI State (Management only)
  const isManagement = currentUser?.role === 'MANAGEMENT' || activeRole === 'MANAGEMENT';
  const [voiToDelete, setVoiToDelete] = useState<VehicleOfInterest | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeletingVoi, setIsDeletingVoi] = useState(false);

  // New VOI Modal State
  const [isAddingVoi, setIsAddingVoi] = useState(false);
  const [newReg, setNewReg] = useState('');
  const [isPartial, setIsPartial] = useState(false);
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newColour, setNewColour] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newBodyType, setNewBodyType] = useState('Bakkie / Single Cab');
  const [newCanopy, setNewCanopy] = useState('');
  const [newDamage, setNewDamage] = useState('');
  const [newMarks, setNewMarks] = useState('');
  const [newStatus, setNewStatus] = useState<'FLAGGED' | 'STOLEN' | 'ACTIVE' | 'CLEARED'>('FLAGGED');
  const [newNotes, setNewNotes] = useState('');
  const [sendWhatsAppOnCreate, setSendWhatsAppOnCreate] = useState(true);

  // Add Sighting Modal State
  const [isAddingSighting, setIsAddingSighting] = useState(false);
  const [sightingDate, setSightingDate] = useState(new Date().toISOString().substring(0, 10));
  const [sightingTime, setSightingTime] = useState(new Date().toTimeString().substring(0, 5));
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingDesc, setSightingDesc] = useState('');
  const [sightingSource, setSightingSource] = useState<IntelSourceType>('CONTROL_ROOM_OPERATOR');
  const [sightingConfidence, setSightingConfidence] = useState<IntelConfidenceLevel>('MEDIUM');

  // Status Change State
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [nextStatus, setNextStatus] = useState<VehicleOfInterest['status']>('FLAGGED');
  const [statusReason, setStatusReason] = useState('');
  const [sendWhatsAppOnStatusChange, setSendWhatsAppOnStatusChange] = useState(true);

  // Merge State
  const [isMerging, setIsMerging] = useState(false);
  const [targetMergeId, setTargetMergeId] = useState('');
  const [mergeReason, setMergeReason] = useState('');

  // Filter VOIs
  const filteredVois = vois.filter((voi) => {
    if (statusFilter !== 'ALL' && voi.status !== statusFilter) return false;
    if (voi.lifecycleState === 'ARCHIVED' && statusFilter !== 'ARCHIVED') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchReg = voi.registration.toLowerCase().includes(q);
    const matchId = voi.internalVoiId.toLowerCase().includes(q);
    const matchMake = voi.make.toLowerCase().includes(q);
    const matchModel = voi.model.toLowerCase().includes(q);
    const matchColour = voi.colour.toLowerCase().includes(q);
    const matchBody = (voi.bodyType || '').toLowerCase().includes(q);
    const matchMarks = (voi.distinguishingMarks || '').toLowerCase().includes(q);
    const matchDamage = (voi.damage || '').toLowerCase().includes(q);
    const matchCanopy = (voi.canopyOrAccessories || '').toLowerCase().includes(q);
    const matchNotes = (voi.notes || '').toLowerCase().includes(q);
    const matchReporter = (voi.createdByName || '').toLowerCase().includes(q);
    const matchLastSeen = (voi.lastSeen || '').toLowerCase().includes(q);
    return (
      matchReg ||
      matchId ||
      matchMake ||
      matchModel ||
      matchColour ||
      matchBody ||
      matchMarks ||
      matchDamage ||
      matchCanopy ||
      matchNotes ||
      matchReporter ||
      matchLastSeen
    );
  });

  const handleCreateVoi = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdId = await createVoi({
      registration: newReg.toUpperCase().trim(),
      isPartialRegistration: isPartial,
      make: newMake.trim() || 'Unknown',
      model: newModel.trim() || 'Unknown',
      colour: newColour.trim() || 'Unknown',
      year: newYear.trim() || undefined,
      bodyType: newBodyType,
      canopyOrAccessories: newCanopy.trim() || undefined,
      damage: newDamage.trim() || undefined,
      distinguishingMarks: newMarks.trim() || undefined,
      photos: [],
      status: newStatus,
      associatedPersonIds: [],
      associatedCaseIds: [],
      associatedBoloIds: [],
      notes: newNotes.trim(),
    });

    if (sendWhatsAppOnCreate && (newStatus === 'FLAGGED' || newStatus === 'STOLEN')) {
      try {
        await sendVehicleFlaggedWhatsAppAlert(
          {
            registration: newReg.toUpperCase().trim(),
            make: newMake.trim() || 'Unknown',
            model: newModel.trim() || 'Unknown',
            colour: newColour.trim() || 'Unknown',
            status: newStatus,
            flagReason: newNotes.trim() || 'Nuut geregistreerde verdagte voertuig in Hartbeesfontein distrik',
            threatLevel: newStatus === 'STOLEN' ? 'CRITICAL' : 'HIGH',
            detectedLocation: 'Hartbeesfontein Sektor Area',
            operatorNotes: newNotes.trim(),
          },
          settings.whatsAppConfig?.defaultReactionGroupNumber || '+27 82 306 5808',
          'Hartbeesfontein Beheerkamer & Reaksiemag'
        );
      } catch (err) {
        console.error('Failed to dispatch automatic WhatsApp alert', err);
      }
    }

    setIsAddingVoi(false);
    // Reset Form
    setNewReg('');
    setIsPartial(false);
    setNewMake('');
    setNewModel('');
    setNewColour('');
    setNewYear('');
    setNewCanopy('');
    setNewDamage('');
    setNewMarks('');
    setNewNotes('');
  };

  const handleDeleteVoi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!voiToDelete) return;
    setIsDeletingVoi(true);
    try {
      await deleteVoi(voiToDelete.id, deleteReason || 'Management Permanent Deletion');
      if (selectedVoi?.id === voiToDelete.id) {
        setSelectedVoi(null);
      }
      setVoiToDelete(null);
      setDeleteReason('');
    } catch (err) {
      console.error('Failed to delete VOI:', err);
    } finally {
      setIsDeletingVoi(false);
    }
  };

  const handleAddSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoi || !sightingDesc.trim()) return;

    await addIntelObservation({
      vehicleId: selectedVoi.id,
      incidentTimestamp: `${sightingDate}T${sightingTime}:00Z`,
      date: sightingDate,
      time: sightingTime,
      locationDescription: sightingLocation,
      description: sightingDesc,
      sourceType: sightingSource,
      confidenceLevel: sightingConfidence,
      verificationStatus: 'UNVERIFIED',
      evidenceReferences: [],
    });

    setIsAddingSighting(false);
    setSightingDesc('');
    setSightingLocation('');
    const refreshed = vois.find((v) => v.id === selectedVoi.id);
    if (refreshed) setSelectedVoi(refreshed);
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoi || !statusReason.trim()) return;

    await updateVoiStatus(selectedVoi.id, nextStatus, statusReason);

    if (sendWhatsAppOnStatusChange && (nextStatus === 'FLAGGED' || nextStatus === 'STOLEN')) {
      try {
        await sendVehicleFlaggedWhatsAppAlert(
          {
            registration: selectedVoi.registration,
            make: selectedVoi.make,
            model: selectedVoi.model,
            colour: selectedVoi.colour,
            status: nextStatus,
            flagReason: statusReason,
            threatLevel: nextStatus === 'STOLEN' ? 'CRITICAL' : 'HIGH',
            detectedLocation: selectedVoi.lastSeen || 'Hartbeesfontein Gebied',
            operatorNotes: statusReason,
          },
          settings.whatsAppConfig?.defaultReactionGroupNumber || '+27 82 306 5808',
          'Hartbeesfontein Beheerkamer & Reaksiemag'
        );
      } catch (err) {
        console.error('Failed to send status update WhatsApp alert', err);
      }
    }

    setIsChangingStatus(false);
    setStatusReason('');
    const refreshed = vois.find((v) => v.id === selectedVoi.id);
    if (refreshed) setSelectedVoi(refreshed);
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoi || !targetMergeId || !mergeReason.trim()) return;

    await mergeVehicles(selectedVoi.id, targetMergeId, mergeReason);
    setIsMerging(false);
    setMergeReason('');
    setSelectedVoi(null);
  };

  const getStatusBadge = (status: VehicleOfInterest['status']) => {
    switch (status) {
      case 'STOLEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black bg-red-600 text-white uppercase tracking-wider animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" /> CONFIRMED STOLEN
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
            <AlertTriangle className="w-3.5 h-3.5" /> FLAGGED / SUSPICIOUS
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <Car className="w-3.5 h-3.5" /> ACTIVE WATCH
          </span>
        );
      case 'CLEARED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> CLEARED
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

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-1 items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search VOI by registration (supports partial, e.g. 'JH 44 ? GP'), make, model, colour, canopy, marks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
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
            <option value="ALL">All Statuses ({vois.length})</option>
            <option value="STOLEN">Confirmed Stolen</option>
            <option value="FLAGGED">Flagged / Suspicious</option>
            <option value="ACTIVE">Active Watch</option>
            <option value="CLEARED">Cleared / Legitimate</option>
          </select>

          <button
            onClick={() => setIsAddingVoi(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New VOI Dossier
          </button>
        </div>
      </div>

      {/* VOI Grid */}
      {filteredVois.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No Vehicles of Interest match query</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting search parameters or create a new vehicle dossier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVois.map((voi) => {
            const isStolen = voi.status === 'STOLEN';
            return (
              <div
                key={voi.id}
                onClick={() => setSelectedVoi(voi)}
                className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all hover:border-amber-500/60 hover:shadow-md relative flex flex-col justify-between ${
                  isStolen
                    ? 'border-red-900/70 shadow-red-950/20'
                    : voi.status === 'FLAGGED'
                    ? 'border-amber-800/50'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/50 border border-amber-900/40 px-1.5 py-0.5 rounded">
                          {voi.internalVoiId}
                        </span>
                        {voi.isPartialRegistration && (
                          <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                            PARTIAL PLATE
                          </span>
                        )}
                      </div>

                      {/* Prominent South African Style Plate Badge */}
                      <div className="mt-2 inline-block px-3 py-1 bg-slate-950 border-2 border-slate-700 rounded-md font-mono text-base font-black tracking-widest text-emerald-400 shadow-inner">
                        {voi.registration}
                      </div>

                      <h3 className="text-sm font-bold text-white mt-1.5">
                        {voi.colour} {voi.make} {voi.model} {voi.year ? `(${voi.year})` : ''}
                      </h3>
                    </div>
                    <div>{getStatusBadge(voi.status)}</div>
                  </div>

                  {/* Body, Canopy & Marks */}
                  <div className="text-xs text-slate-300 space-y-1 mb-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800/60">
                      <span>Tipe: <strong className="text-slate-200">{voi.bodyType || 'Voertuig'}</strong></span>
                      {voi.createdByName && (
                        <span className="text-amber-400/90 font-mono text-[10px]">Bron: {voi.createdByName}</span>
                      )}
                    </div>
                    {voi.canopyOrAccessories && (
                      <div>
                        <span className="text-slate-500">Canopy/Extras:</span>{' '}
                        <span className="text-slate-200">{voi.canopyOrAccessories}</span>
                      </div>
                    )}
                    {voi.damage && (
                      <div className="text-amber-200/90 font-medium">
                        <span className="text-slate-500">Damage / Rust:</span> {voi.damage}
                      </div>
                    )}
                    {voi.distinguishingMarks && (
                      <div>
                        <span className="text-slate-500">Distinguishing:</span> {voi.distinguishingMarks}
                      </div>
                    )}
                    {voi.notes && (
                      <div className="pt-1 text-[11px] text-amber-300/90 bg-amber-950/20 p-1.5 rounded border border-amber-900/30 line-clamp-2">
                        {voi.notes}
                      </div>
                    )}
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-b border-slate-800/80">
                    <div className="bg-slate-950/50 p-1.5 rounded">
                      <div className="font-bold text-white">{voi.observations?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Sightings</div>
                    </div>
                    <div className="bg-slate-950/50 p-1.5 rounded">
                      <div className="font-bold text-white">{voi.associatedPersonIds?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Drivers/POIs</div>
                    </div>
                    <div className="bg-slate-950/50 p-1.5 rounded">
                      <div className="font-bold text-white">{voi.associatedCaseIds?.length || 0}</div>
                      <div className="text-[10px] text-slate-400">Cases</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhatsappAlertVehicle(voi);
                      }}
                      className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Stuur WhatsApp Waarskuwing vir hierdie voertuig"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp Waarskuwing</span>
                    </button>

                    {isManagement && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVoiToDelete(voi);
                        }}
                        className="px-2 py-1 bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                        title="Verwyder VOI rekord permanent (Bestuur)"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Verwyder</span>
                      </button>
                    )}
                  </div>

                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    Dossier <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED VOI DOSSIER MODAL */}
      {selectedVoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Epistemic Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-400 uppercase tracking-wider font-mono text-[11px]">
                  Confidential Vehicle Intelligence Dossier
                </strong>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Vehicle observations reflect physical sightings and automatic gate logs. Linkages to crime require human operator corroboration and verification.
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-900/60 px-2 py-0.5 rounded">
                    {selectedVoi.internalVoiId}
                  </span>
                  {selectedVoi.isPartialRegistration && (
                    <span className="text-xs bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-mono">
                      PARTIAL REGISTRATION
                    </span>
                  )}
                  {getStatusBadge(selectedVoi.status)}
                </div>

                <div className="mt-2 inline-block px-4 py-1.5 bg-slate-950 border-2 border-slate-700 rounded-lg font-mono text-xl font-black tracking-widest text-emerald-400 shadow-inner">
                  {selectedVoi.registration}
                </div>

                <h2 className="text-lg font-black text-white mt-2">
                  {selectedVoi.colour} {selectedVoi.make} {selectedVoi.model} {selectedVoi.year ? `(${selectedVoi.year})` : ''}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setWhatsappAlertVehicle(selectedVoi)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Stuur WhatsApp Waarskuwing
                </button>

                <button
                  onClick={() => setIsAddingSighting(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Sighting
                </button>

                <button
                  onClick={() => {
                    setNextStatus(selectedVoi.status);
                    setIsChangingStatus(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Change Status
                </button>

                {activeRole === 'MANAGEMENT' && (
                  <>
                    <button
                      onClick={() => setIsMerging(true)}
                      className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-medium rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      Merge VOI
                    </button>
                    <button
                      onClick={() => setVoiToDelete(selectedVoi)}
                      className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-medium rounded-lg text-xs flex items-center gap-1.5 transition"
                      title="Verwyder VOI rekord permanent"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      Verwyder VOI
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedVoi(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Physical & Owner Specs */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    Vehicle Attributes
                  </h4>
                  <div className="text-xs space-y-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Body Type:</span>
                      <span className="font-medium text-slate-200">{selectedVoi.bodyType || 'Bakkie'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Canopy / Accessories:</span>
                      <span className="text-slate-200">{selectedVoi.canopyOrAccessories || 'None documented'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Damage / Distinctive Features:</span>
                      <span className="font-semibold text-amber-300">{selectedVoi.damage || 'None documented'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Distinguishing Marks:</span>
                      <span>{selectedVoi.distinguishingMarks || 'None documented'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    Known Owner & Associated Persons
                  </h4>
                  <div className="text-xs space-y-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Registered / Reported Owner:</span>
                      {selectedVoi.knownOwner ? (
                        <div className="mt-1 p-2 bg-slate-900 rounded border border-slate-800">
                          <div className="font-bold text-white">{selectedVoi.knownOwner.name}</div>
                          {selectedVoi.knownOwner.phone && <div className="text-slate-400">{selectedVoi.knownOwner.phone}</div>}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No verified owner profile</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block mb-1">Associated Drivers (POI):</span>
                      {selectedVoi.associatedPersonIds.length > 0 ? (
                        <div className="space-y-1">
                          {selectedVoi.associatedPersonIds.map((pId, i) => {
                            const foundPoi = pois.find((p) => p.id === pId || p.internalPoiId === pId);
                            return (
                              <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                                <span className="font-bold text-amber-400">{foundPoi?.internalPoiId || pId}</span>
                                <span className="text-slate-300 text-[11px]">{foundPoi?.name || 'Unknown'} {foundPoi?.surname || ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No linked driver profiles</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Sighting Log */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      Vehicle Sighting History ({selectedVoi.observations?.length || 0})
                    </h4>
                    <button
                      onClick={() => setIsAddingSighting(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Sighting
                    </button>
                  </div>

                  {(!selectedVoi.observations || selectedVoi.observations.length === 0) ? (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      No physical sightings recorded for this vehicle.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedVoi.observations.map((obs) => (
                        <div
                          key={obs.id}
                          className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5 text-slate-400">
                            <span className="font-mono">{obs.observationId}</span>
                            <span className="font-mono">{obs.date || obs.incidentTimestamp.substring(0, 10)} {obs.time || ''}</span>
                          </div>
                          <p className="text-slate-200">{obs.description}</p>
                          {obs.locationDescription && (
                            <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-amber-400" /> {obs.locationDescription}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW VOI MODAL */}
      {isAddingVoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create New Vehicle of Interest Dossier</h3>
              </div>
              <button onClick={() => setIsAddingVoi(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoi} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Registration Plate <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReg}
                    onChange={(e) => setNewReg(e.target.value)}
                    required
                    placeholder="e.g. JH 44 TY NW or JH 44 ? GP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono uppercase tracking-wider"
                  />
                  <label className="flex items-center gap-1.5 text-slate-400 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPartial}
                      onChange={(e) => setIsPartial(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800"
                    />
                    <span>Is partial / incomplete plate string</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Classification Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="FLAGGED">FLAGGED / SUSPICIOUS</option>
                    <option value="STOLEN">CONFIRMED STOLEN (SAPS CAS)</option>
                    <option value="ACTIVE">ACTIVE WATCH</option>
                    <option value="CLEARED">CLEARED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Make</label>
                  <input
                    type="text"
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    placeholder="e.g. Toyota, Isuzu, Ford"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Hilux, KB250, Ranger"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Colour</label>
                  <input
                    type="text"
                    value={newColour}
                    onChange={(e) => setNewColour(e.target.value)}
                    placeholder="e.g. White, Silver, Dark Blue"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Canopy / Accessories</label>
                  <input
                    type="text"
                    value={newCanopy}
                    onChange={(e) => setNewCanopy(e.target.value)}
                    placeholder="e.g. Aluminium cattle rail, white fibreglass canopy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Damage / Rust / Identifying Marks</label>
                  <input
                    type="text"
                    value={newDamage}
                    onChange={(e) => setNewDamage(e.target.value)}
                    placeholder="e.g. Dent on rear tailgate, mismatched left fender"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Dossier Notes & Context</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Factual context of why this vehicle is flagged..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[60px]"
                />
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <label className="flex items-center gap-2 text-emerald-400 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWhatsAppOnCreate}
                    onChange={(e) => setSendWhatsAppOnCreate(e.target.checked)}
                    className="rounded text-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>Stuur outomatiese WhatsApp-waarskuwing aan Reaksiemag & Beheerkamer indien gevlag/gesteel</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingVoi(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Register VOI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SIGHTING MODAL */}
      {isAddingSighting && selectedVoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Log Sighting for {selectedVoi.registration}
              </h3>
              <button onClick={() => setIsAddingSighting(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSighting} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={sightingDate}
                    onChange={(e) => setSightingDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={sightingTime}
                    onChange={(e) => setSightingTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location Sighted</label>
                <input
                  type="text"
                  value={sightingLocation}
                  onChange={(e) => setSightingLocation(e.target.value)}
                  placeholder="e.g. R507 travelling east toward Ottosdal"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Sighting Details</label>
                <textarea
                  value={sightingDesc}
                  onChange={(e) => setSightingDesc(e.target.value)}
                  placeholder="Direction of travel, occupants count, load details..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[70px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingSighting(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Save Sighting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE STATUS MODAL */}
      {isChangingStatus && selectedVoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Update VOI Status</h3>
              <button onClick={() => setIsChangingStatus(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Classification Status</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="FLAGGED">FLAGGED / SUSPICIOUS</option>
                  <option value="STOLEN">CONFIRMED STOLEN</option>
                  <option value="ACTIVE">ACTIVE WATCH</option>
                  <option value="CLEARED">CLEARED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Justification / CAS Reference <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  required
                  placeholder="State operational reason for status change..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[70px]"
                />
              </div>

              <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <label className="flex items-center gap-2 text-emerald-400 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWhatsAppOnStatusChange}
                    onChange={(e) => setSendWhatsAppOnStatusChange(e.target.checked)}
                    className="rounded text-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>Stuur outomatiese WhatsApp-waarskuwing aan Reaksiemag</span>
                </label>
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
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE MODAL */}
      {isMerging && selectedVoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Merge Vehicle Dossiers</h3>
              <button onClick={() => setIsMerging(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMergeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Secondary VOI</label>
                <select
                  value={targetMergeId}
                  onChange={(e) => setTargetMergeId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="">-- Choose VOI to merge into this record --</option>
                  {vois
                    .filter((v) => v.id !== selectedVoi.id)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registration} ({v.make} {v.model}) [{v.internalVoiId}]
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Reason for Merge <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  required
                  placeholder="e.g. Confirmed duplicate plate entry with identical canopy and dent features."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white min-h-[70px]"
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

      {/* WHATSAPP VEHICLE ALERT MODAL */}
      {whatsappAlertVehicle && (
        <WhatsAppVehicleAlertModal
          isOpen={Boolean(whatsappAlertVehicle)}
          onClose={() => setWhatsappAlertVehicle(null)}
          vehicle={whatsappAlertVehicle}
        />
      )}

      {/* CONFIRM DELETE VOI MODAL (MANAGEMENT ONLY) */}
      {voiToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-rose-950/50">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Verwyder VOI Rekord?</h3>
                <p className="text-xs text-rose-400 font-mono">Bestuursaksie (Permanente Skrapping)</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">VOI Kode:</span>
                <span className="font-mono font-bold text-amber-400">{voiToDelete.internalVoiId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Registrasie:</span>
                <span className="font-mono font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                  {voiToDelete.registration}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-500">Voertuig:</span>
                <span className="font-semibold text-white">
                  {voiToDelete.colour} {voiToDelete.make} {voiToDelete.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-amber-300">{voiToDelete.status}</span>
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
                placeholder="bv. Duplikaat registrasie, Vals nommerplaat, Verkeerde inskrywing..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              ⚠️ <strong>Waarskuwing:</strong> Hierdie aksie sal die VOI permanent uit die intelligensie-databasis verwyder en skakels in gekoppelde sake ontkoppel. 'n Permanente oudit-inskrywing sal aangeteken word.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setVoiToDelete(null);
                  setDeleteReason('');
                }}
                disabled={isDeletingVoi}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Kanselleer
              </button>
              <button
                type="button"
                onClick={() => handleDeleteVoi()}
                disabled={isDeletingVoi}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/60 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isDeletingVoi ? (
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
