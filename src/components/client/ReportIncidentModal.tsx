import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  X,
  MapPin,
  Camera,
  Car,
  User,
  Check,
  AlertCircle,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  ZoomIn,
  Plus,
  BadgeCheck,
  Phone,
  Building2,
  FileText,
  UserCheck,
  Users,
  Search,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { IncidentCategory, InvestigatingOfficer } from '../../types';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { compressImageFile, ProcessedImage } from '../../utils/imageUtils';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const { currentUser, allUsers } = useAuth();
  const { createIncidentCase } = useData();

  const [category, setCategory] = useState<IncidentCategory>('suspicious_activity');
  const [shortTitle, setShortTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [locationName, setLocationName] = useState(currentUser.farmName || '');
  const [isPublic, setIsPublic] = useState(true);
  const [useGps, setUseGps] = useState(true);

  // Victim / Property Owner / Member Link
  const [isForSelf, setIsForSelf] = useState(true);
  const [victimUid, setVictimUid] = useState(currentUser.uid);
  const [victimName, setVictimName] = useState(`${currentUser.name} ${currentUser.surname}`);
  const [victimPhone, setVictimPhone] = useState(currentUser.primaryPhone || '');
  const [victimFarmName, setVictimFarmName] = useState(currentUser.farmName || '');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);

  // Photos & Evidence State
  const [attachedPhotos, setAttachedPhotos] = useState<ProcessedImage[]>([]);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // SAPS / SAPD Case Details
  const [hasSapsCase, setHasSapsCase] = useState(false);
  const [sapsCaseNumber, setSapsCaseNumber] = useState('');
  const [sapsStation, setSapsStation] = useState('Hartbeesfontein SAPS');
  const [obNumber, setObNumber] = useState('');
  const [investigatingOfficers, setInvestigatingOfficers] = useState<InvestigatingOfficer[]>([]);
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerRank, setNewOfficerRank] = useState('');
  const [newOfficerPhone, setNewOfficerPhone] = useState('');
  const [newOfficerBadge, setNewOfficerBadge] = useState('');
  const [newOfficerUnit, setNewOfficerUnit] = useState('');
  const [showAddOfficerForm, setShowAddOfficerForm] = useState(false);

  // Structured Vehicle Details
  const [vehicleMakeModel, setVehicleMakeModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleNotes, setVehicleNotes] = useState('');

  // Structured Person / Suspect Details
  const [personGender, setPersonGender] = useState('');
  const [personClothing, setPersonClothing] = useState('');
  const [personBuild, setPersonBuild] = useState('');
  const [personMarks, setPersonMarks] = useState('');
  const [personNotes, setPersonNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOfficer = () => {
    if (!newOfficerName.trim()) return;
    const officer: InvestigatingOfficer = {
      id: `IO-${Date.now()}`,
      name: newOfficerName.trim(),
      rank: newOfficerRank.trim() || undefined,
      phone: newOfficerPhone.trim() || undefined,
      badgeNumber: newOfficerBadge.trim() || undefined,
      unit: newOfficerUnit.trim() || undefined,
      station: sapsStation || undefined,
    };
    setInvestigatingOfficers((prev) => [...prev, officer]);
    setNewOfficerName('');
    setNewOfficerRank('');
    setNewOfficerPhone('');
    setNewOfficerBadge('');
    setNewOfficerUnit('');
    setShowAddOfficerForm(false);
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

      setAttachedPhotos((prev) => [...prev, ...processedList].slice(0, 10)); // max 10 photos
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
    setAttachedPhotos((prev) => [...prev, image].slice(0, 10));
    setPhotoError(null);
  };

  const handleRemovePhoto = (id: string) => {
    setAttachedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortTitle.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const caseId = await createIncidentCase({
        category,
        title: shortTitle,
        description,
        incidentDate,
        incidentTime,
        locationName: locationName || 'Hartbeesfontein',
        isPublic,
        sapsCaseNumber: hasSapsCase && sapsCaseNumber.trim() ? sapsCaseNumber.trim() : undefined,
        sapsStation: hasSapsCase && sapsStation.trim() ? sapsStation.trim() : undefined,
        sapsDetails:
          hasSapsCase && (sapsCaseNumber.trim() || investigatingOfficers.length > 0)
            ? {
                caseNumber: sapsCaseNumber.trim(),
                station: sapsStation.trim(),
                obNumber: obNumber.trim() || undefined,
                officers: investigatingOfficers,
                dateReported: incidentDate,
              }
            : undefined,
        investigatingOfficers: hasSapsCase ? investigatingOfficers : undefined,
        gpsLocation: useGps ? { latitude: -26.7645, longitude: 26.4128 } : undefined,
        photos: attachedPhotos.map((p) => p.dataUrl),
        victimUid: victimUid ? victimUid.trim() : (isForSelf ? currentUser.uid : undefined),
        victimName: victimName ? victimName.trim() : (isForSelf ? `${currentUser.name} ${currentUser.surname}` : undefined),
        victimPhone: victimPhone ? victimPhone.trim() : (isForSelf ? currentUser.primaryPhone : undefined),
        victimFarmName: victimFarmName ? victimFarmName.trim() : (isForSelf ? currentUser.farmName : undefined),
        victimRole: isForSelf ? currentUser.role : 'CLIENT',
        isVictimAware: true,
        assignedMemberUids: victimUid ? [victimUid.trim()] : (isForSelf ? [currentUser.uid] : []),
        vehicleInfo:
          vehicleMakeModel || vehiclePlate
            ? {
                makeModel: vehicleMakeModel,
                color: vehicleColor,
                plate: vehiclePlate,
                notes: vehicleNotes,
              }
            : undefined,
        personDescription:
          personClothing || personBuild || personMarks
            ? {
                gender: personGender,
                clothing: personClothing,
                buildHeight: personBuild,
                identifyingMarks: personMarks,
                notes: personNotes,
              }
            : undefined,
      });

      setSubmittedCaseId(caseId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-white">
          {/* Header */}
          <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">{t.incidents.reportTitle}</h2>
                <p className="text-[11px] text-slate-400">{currentUser.sector || 'Hartbeesfontein'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 text-xs space-y-4">
            {submittedCaseId ? (
              <div className="bg-emerald-950/60 border border-emerald-500 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-300">{t.incidents.submittedSuccess}</h3>
                <p className="text-xl font-mono font-black text-white">{submittedCaseId}</p>
                <p className="text-xs text-slate-300">
                  The Control Room and Sector First Responders have been notified. You can track updates under <strong>MY CASES</strong>.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  {t.common.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.incidents.category} *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-1 focus:ring-red-500 outline-none"
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

                {/* Title */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.incidents.shortTitle} *</label>
                  <input
                    type="text"
                    required
                    value={shortTitle}
                    onChange={(e) => setShortTitle(e.target.value)}
                    placeholder="e.g. 2 men spotted at kraal gate / cut wires"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-red-500 font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.incidents.description} *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide precise chronological details, direction of flight, tools, weapons seen..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.incidents.date}</label>
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">{t.incidents.time}</label>
                    <input
                      type="time"
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Location & GPS */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.incidents.location} *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="Farm name, portion number, GPS coordinate"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setUseGps(!useGps)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        useGps ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{useGps ? t.incidents.gpsAcquired : t.incidents.useGps}</span>
                    </button>
                  </div>
                </div>

                {/* VICTIM / PROPERTY OWNER / AFFECTED MEMBER SELECTION */}
                <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Who is the Victim / Affected Property Owner?</span>
                    </label>
                    {victimUid && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        Member Linked
                      </span>
                    )}
                  </div>

                  {/* Toggle: Myself vs Another Member */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForSelf(true);
                        setVictimUid(currentUser.uid);
                        setVictimName(`${currentUser.name} ${currentUser.surname}`);
                        setVictimPhone(currentUser.primaryPhone || '');
                        setVictimFarmName(currentUser.farmName || '');
                        if (!locationName && currentUser.farmName) {
                          setLocationName(currentUser.farmName);
                        }
                        setIsMemberPickerOpen(false);
                      }}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        isForSelf
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>I am the Victim / Owner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsForSelf(false);
                        setVictimUid('');
                        setVictimName('');
                        setVictimPhone('');
                        setVictimFarmName('');
                        setIsMemberPickerOpen(true);
                      }}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        !isForSelf
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Another Community Member</span>
                    </button>
                  </div>

                  {/* Member Picker when reporting on behalf of someone else */}
                  {!isForSelf && (
                    <div className="space-y-2 pt-1 border-t border-slate-700/60">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={memberSearchQuery}
                          onChange={(e) => {
                            setMemberSearchQuery(e.target.value);
                            setIsMemberPickerOpen(true);
                          }}
                          onFocus={() => setIsMemberPickerOpen(true)}
                          placeholder="Search community member by name, farm name, phone..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-500 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>

                      {isMemberPickerOpen && (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-800 shadow-xl">
                          {allUsers
                            .filter((u) => {
                              if (!memberSearchQuery.trim()) return true;
                              const q = memberSearchQuery.toLowerCase();
                              return (
                                `${u.name} ${u.surname}`.toLowerCase().includes(q) ||
                                (u.farmName && u.farmName.toLowerCase().includes(q)) ||
                                (u.primaryPhone && u.primaryPhone.includes(q))
                              );
                            })
                            .map((u) => (
                              <button
                                key={u.uid}
                                type="button"
                                onClick={() => {
                                  setVictimUid(u.uid);
                                  setVictimName(`${u.name} ${u.surname}`);
                                  setVictimPhone(u.primaryPhone || '');
                                  setVictimFarmName(u.farmName || '');
                                  if (!locationName && u.farmName) {
                                    setLocationName(u.farmName);
                                  }
                                  setIsMemberPickerOpen(false);
                                }}
                                className="w-full text-left p-2 hover:bg-slate-800 flex items-center justify-between text-xs transition"
                              >
                                <div>
                                  <div className="font-bold text-white">{u.name} {u.surname}</div>
                                  <div className="text-[10px] text-slate-400">{u.farmName || 'Member'}</div>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400">{u.primaryPhone}</span>
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Manual / editable victim details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">Victim Name</label>
                          <input
                            type="text"
                            value={victimName}
                            onChange={(e) => setVictimName(e.target.value)}
                            placeholder="Name & Surname"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">Phone Number</label>
                          <input
                            type="text"
                            value={victimPhone}
                            onChange={(e) => setVictimPhone(e.target.value)}
                            placeholder="e.g. 082 123 4567"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">Farm / Property</label>
                          <input
                            type="text"
                            value={victimFarmName}
                            onChange={(e) => setVictimFarmName(e.target.value)}
                            placeholder="Farm name"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-emerald-400/90 pt-1">
                        * The linked member will immediately see this case in their personal Client Cases window.
                      </p>
                    </div>
                  )}
                </div>

                {/* PHOTOS & EVIDENCE ATTACHMENT SECTION */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Photos & Evidence ({attachedPhotos.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Max 10 images</span>
                  </div>

                  {photoError && (
                    <div className="p-2 bg-red-500/15 border border-red-500/30 rounded-lg text-red-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span>{photoError}</span>
                    </div>
                  )}

                  {/* Photo Capture / Upload Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 1: Use Phone Camera */}
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="flex items-center justify-center gap-2 p-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl font-bold transition active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Use Phone Camera</span>
                    </button>

                    {/* Option 2: Upload from Files */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 p-2.5 bg-slate-750 hover:bg-slate-700 border border-slate-650 text-slate-200 rounded-xl font-bold transition active:scale-95"
                    >
                      <UploadCloud className="w-4 h-4 text-blue-400" />
                      <span>Upload from Files</span>
                    </button>

                    {/* Hidden Inputs */}
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

                  {/* Processing Spinner */}
                  {isProcessingPhotos && (
                    <div className="text-center py-2 text-amber-400 text-xs flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span>Compressing and attaching photos...</span>
                    </div>
                  )}

                  {/* Photo Previews Grid */}
                  {attachedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                      {attachedPhotos.map((photo, idx) => (
                        <div
                          key={photo.id}
                          className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square shadow-md"
                        >
                          <img
                            src={photo.dataUrl}
                            alt={photo.fileName}
                            className="w-full h-full object-cover cursor-pointer transition group-hover:scale-105"
                            onClick={() => setZoomedImage(photo.dataUrl)}
                          />

                          {/* Hover Overlay with Zoom & Delete */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                            <button
                              type="button"
                              onClick={() => setZoomedImage(photo.dataUrl)}
                              className="p-1.5 bg-slate-800/90 text-white rounded-lg hover:bg-slate-700 transition"
                              title="Zoom photo"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(photo.id)}
                              className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-500 transition"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Index Badge */}
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structured Vehicle Info section */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5 space-y-2.5">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>{t.incidents.vehicleInfo} ({t.common.optional})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Make / Model"
                      value={vehicleMakeModel}
                      onChange={(e) => setVehicleMakeModel(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Colour"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Registration Plate"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Structured Suspect Description section */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5 space-y-2.5">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>{t.incidents.personDescription} ({t.common.optional})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Clothing description"
                      value={personClothing}
                      onChange={(e) => setPersonClothing(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Build / Height estimate"
                      value={personBuild}
                      onChange={(e) => setPersonBuild(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                {/* SAPS / SAPD Police Case & Investigating Officers Section */}
                <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-blue-200 flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-blue-400" />
                      <span>{t.cases.sapsSectionTitle}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-blue-300">
                      <input
                        type="checkbox"
                        checked={hasSapsCase}
                        onChange={(e) => setHasSapsCase(e.target.checked)}
                        className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                      />
                      <span>Attach SAPD Case</span>
                    </label>
                  </div>

                  {hasSapsCase && (
                    <div className="space-y-3 pt-2 border-t border-blue-800/40 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-blue-300 mb-1">
                            {t.cases.sapsCaseNumber} *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. CAS 42/08/2026"
                            value={sapsCaseNumber}
                            onChange={(e) => setSapsCaseNumber(e.target.value)}
                            className="w-full bg-slate-900 border border-blue-700/60 rounded-lg px-2.5 py-1.5 text-white font-mono uppercase text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-blue-300 mb-1">
                            {t.cases.sapsStation}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Hartbeesfontein SAPS"
                            value={sapsStation}
                            onChange={(e) => setSapsStation(e.target.value)}
                            className="w-full bg-slate-900 border border-blue-700/60 rounded-lg px-2.5 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-blue-300 mb-1">
                            {t.cases.obNumber}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. OB 78/08/2026"
                            value={obNumber}
                            onChange={(e) => setObNumber(e.target.value)}
                            className="w-full bg-slate-900 border border-blue-700/60 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      {/* Investigating Officers List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-blue-200 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            {t.cases.investigatingOfficers} ({investigatingOfficers.length})
                          </span>
                          {!showAddOfficerForm && (
                            <button
                              type="button"
                              onClick={() => setShowAddOfficerForm(true)}
                              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-900/40 hover:bg-blue-900/60 px-2 py-1 rounded-lg border border-blue-700/50 transition"
                            >
                              <Plus className="w-3 h-3" />
                              {t.cases.addOfficer}
                            </button>
                          )}
                        </div>

                        {investigatingOfficers.length > 0 ? (
                          <div className="space-y-1.5">
                            {investigatingOfficers.map((officer) => (
                              <div
                                key={officer.id}
                                className="bg-slate-900/80 border border-blue-800/40 rounded-lg p-2 flex items-center justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{officer.rank ? `${officer.rank} ` : ''}{officer.name}</span>
                                    {officer.badgeNumber && (
                                      <span className="text-[10px] bg-blue-950 text-blue-300 font-mono px-1.5 py-0.2 rounded border border-blue-700/50">
                                        #{officer.badgeNumber}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-3">
                                    {officer.phone && (
                                      <span className="flex items-center gap-1 text-emerald-400">
                                        <Phone className="w-2.5 h-2.5" />
                                        {officer.phone}
                                      </span>
                                    )}
                                    {officer.unit && <span>Unit: {officer.unit}</span>}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOfficer(officer.id)}
                                  className="text-slate-400 hover:text-red-400 p-1 transition"
                                  title="Remove officer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            {t.cases.noOfficersAdded}
                          </p>
                        )}

                        {/* Add Officer Sub-Form */}
                        {showAddOfficerForm && (
                          <div className="bg-slate-900 border border-blue-600/50 rounded-xl p-3 space-y-2 mt-2">
                            <div className="font-bold text-blue-200 text-xs">
                              {t.cases.addOfficer}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder={t.cases.officerName + ' *'}
                                value={newOfficerName}
                                onChange={(e) => setNewOfficerName(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                              />
                              <input
                                type="text"
                                placeholder={t.cases.officerRank}
                                value={newOfficerRank}
                                onChange={(e) => setNewOfficerRank(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                              />
                              <input
                                type="text"
                                placeholder={t.cases.officerPhone}
                                value={newOfficerPhone}
                                onChange={(e) => setNewOfficerPhone(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                              />
                              <input
                                type="text"
                                placeholder={t.cases.officerBadge}
                                value={newOfficerBadge}
                                onChange={(e) => setNewOfficerBadge(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder={t.cases.officerUnit + ' (e.g. Stock Theft / VISPOL / Detectives)'}
                              value={newOfficerUnit}
                              onChange={(e) => setNewOfficerUnit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAddOfficerForm(false)}
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
                                {t.cases.addOfficer}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Public Community Visibility Switch */}
                <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-700">
                  <div>
                    <span className="font-bold text-white block">{t.cases.isPublicToggle}</span>
                    <span className="text-[11px] text-slate-400 block">{t.cases.isPublicHelp}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {/* Submit */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>{t.common.loading}</span>
                    ) : (
                      <>
                        <span>{t.common.submit}</span>
                        {attachedPhotos.length > 0 && (
                          <span className="bg-red-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                            +{attachedPhotos.length} photos
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onPhotoCaptured={handlePhotoCapturedFromCamera}
        />
      )}

      {/* Zoom Image Lightbox Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-700 shadow-2xl">
            <img src={zoomedImage} alt="Enlarged Evidence" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

