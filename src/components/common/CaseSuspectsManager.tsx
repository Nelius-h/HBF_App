import React, { useState } from 'react';
import {
  UserX,
  UserPlus,
  Link2,
  Trash2,
  Phone,
  Shield,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Plus,
  Camera,
  ExternalLink,
  ZoomIn,
  Users,
  Eye,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { Case, PersonOfInterest, PoiStatus } from '../../types';

interface CaseSuspectsManagerProps {
  caseItem: Case;
  readOnly?: boolean;
  variant?: 'dark' | 'monochrome';
}

interface NewSuspectDraft {
  tempId: string;
  name: string;
  surname: string;
  nickname: string;
  aliases: string;
  status: PoiStatus;
  approximateAge?: number;
  gender: string;
  height: string;
  build: string;
  complexion: string;
  clothingLastSeen: string;
  identifyingMarks: string;
  phone: string;
  knownAreas: string;
  notes: string;
  photoUrl: string;
}

const DEFAULT_SUSPECT_DRAFT: () => NewSuspectDraft = () => ({
  tempId: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  name: '',
  surname: '',
  nickname: '',
  aliases: '',
  status: 'SUSPECT',
  approximateAge: undefined,
  gender: 'Male',
  height: '',
  build: '',
  complexion: '',
  clothingLastSeen: '',
  identifyingMarks: '',
  phone: '',
  knownAreas: '',
  notes: '',
  photoUrl: '',
});

export const CaseSuspectsManager: React.FC<CaseSuspectsManagerProps> = ({
  caseItem,
  readOnly = false,
  variant = 'dark',
}) => {
  const isMono = variant === 'monochrome';
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { pois, addSuspectToCase, linkPoiToCase, unlinkPoiFromCase } = useData();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [poiToUnlink, setPoiToUnlink] = useState<string | null>(null);

  // Add Multiple Suspects State
  const [suspectDrafts, setSuspectDrafts] = useState<NewSuspectDraft[]>([DEFAULT_SUSPECT_DRAFT()]);
  const [isSaving, setIsSaving] = useState(false);

  // Link POI State
  const [poiSearchQuery, setPoiSearchQuery] = useState('');

  // Get all linked POIs from repository
  const linkedPoiIds = caseItem.linkedPoiIds || [];
  const linkedPois: PersonOfInterest[] = linkedPoiIds
    .map((id) => pois.find((p) => p.id === id || p.internalPoiId === id))
    .filter((p): p is PersonOfInterest => !!p);

  // Candidates for linking (existing POIs not already linked)
  const unlinkedPois = pois.filter(
    (p) => !linkedPoiIds.includes(p.id) && !linkedPoiIds.includes(p.internalPoiId)
  );

  const filteredUnlinkedPois = unlinkedPois.filter((p) => {
    if (!poiSearchQuery) return true;
    const q = poiSearchQuery.toLowerCase();
    const fullName = `${p.name || ''} ${p.surname || ''}`.toLowerCase();
    const aliases = (p.aliases || []).join(' ').toLowerCase();
    const id = p.internalPoiId.toLowerCase();
    const phone = (p.phoneNumbers || []).join(' ');
    return fullName.includes(q) || aliases.includes(q) || id.includes(q) || phone.includes(q);
  });

  const handleAddDraftRow = () => {
    setSuspectDrafts((prev) => [...prev, DEFAULT_SUSPECT_DRAFT()]);
  };

  const handleRemoveDraftRow = (tempId: string) => {
    if (suspectDrafts.length <= 1) return;
    setSuspectDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
  };

  const handleUpdateDraft = (tempId: string, updates: Partial<NewSuspectDraft>) => {
    setSuspectDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, ...updates } : d))
    );
  };

  const handleSaveAllSuspects = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      for (const draft of suspectDrafts) {
        // Skip completely empty drafts
        if (!draft.name && !draft.surname && !draft.nickname && !draft.notes && !draft.clothingLastSeen) {
          continue;
        }

        const aliasList = draft.aliases
          ? draft.aliases.split(',').map((a) => a.trim()).filter(Boolean)
          : [];
        if (draft.nickname && !aliasList.includes(draft.nickname.trim())) {
          aliasList.push(draft.nickname.trim());
        }

        const phoneList = draft.phone
          ? draft.phone.split(',').map((p) => p.trim()).filter(Boolean)
          : [];

        const areasList = draft.knownAreas
          ? draft.knownAreas.split(',').map((a) => a.trim()).filter(Boolean)
          : caseItem.locationName
          ? [caseItem.locationName]
          : [];

        await addSuspectToCase(caseItem.id, {
          name: draft.name.trim(),
          surname: draft.surname.trim(),
          nickname: draft.nickname.trim(),
          aliases: aliasList,
          status: draft.status,
          approximateAge: draft.approximateAge,
          gender: draft.gender,
          physicalDescription: {
            height: draft.height.trim(),
            build: draft.build.trim(),
            complexion: draft.complexion.trim(),
            clothingLastSeen: draft.clothingLastSeen.trim(),
            identifyingMarks: draft.identifyingMarks.trim(),
          },
          phoneNumbers: phoneList,
          knownAreas: areasList,
          photos: draft.photoUrl ? [draft.photoUrl.trim()] : [],
          notes: draft.notes.trim() || `Identified as suspect in Case ${caseItem.caseNumber}.`,
        });
      }

      setIsAddModalOpen(false);
      setSuspectDrafts([DEFAULT_SUSPECT_DRAFT()]);
    } catch (err) {
      console.error('Failed to save suspects:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: PoiStatus) => {
    if (isMono) {
      return 'bg-gray-200 text-gray-900 border-gray-400 font-bold';
    }
    switch (status) {
      case 'WANTED':
      case 'wanted':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'SUSPECT':
      case 'suspect':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ARRESTED':
      case 'arrested':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'CHARGED':
      case 'charged':
      case 'CONVICTED':
      case 'convicted':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'cleared':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className={`${isMono ? 'bg-white rounded-lg p-3 border border-gray-300 space-y-3' : 'bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 space-y-4 shadow-lg'}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b ${isMono ? 'border-gray-200' : 'border-slate-800'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isMono ? 'bg-gray-100 border border-gray-300 text-gray-800' : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'}`}>
            <UserX className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-xs font-bold tracking-wide ${isMono ? 'text-gray-900' : 'text-white'}`}>
                {t.cases.suspectsTitle}
              </h3>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold border ${isMono ? 'bg-gray-100 text-gray-800 border-gray-300' : 'bg-amber-950 text-amber-300 border-amber-700/60'}`}>
                {linkedPois.length} {linkedPois.length === 1 ? 'Suspect' : 'Suspects'}
              </span>
            </div>
            <p className={`text-[10px] ${isMono ? 'text-gray-500' : 'text-amber-300/80'}`}>
              {t.cases.autoAddedToPoiNotice}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        {!readOnly && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSuspectDrafts([DEFAULT_SUSPECT_DRAFT()]);
                setIsAddModalOpen(true);
              }}
              className={`font-semibold text-xs px-2.5 py-1 rounded-md transition flex items-center gap-1 active:scale-95 ${
                isMono
                  ? 'bg-gray-900 hover:bg-black text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow'
              }`}
            >
              <UserPlus className="w-3 h-3" />
              <span>{t.cases.addSuspects}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPoiSearchQuery('');
                setIsLinkModalOpen(true);
              }}
              className={`font-semibold text-xs px-2.5 py-1 rounded-md transition flex items-center gap-1 active:scale-95 ${
                isMono
                  ? 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Link2 className={`w-3 h-3 ${isMono ? 'text-gray-600' : 'text-blue-400'}`} />
              <span>{t.cases.linkExistingPoi}</span>
            </button>
          </div>
        )}
      </div>

      {/* Linked Suspects Grid / Cards */}
      {linkedPois.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {linkedPois.map((poi) => {
            const displayName = `${poi.name || ''} ${poi.surname || ''}`.trim() || poi.nickname || 'Unknown Suspect';
            const hasPhoto = poi.photos && poi.photos.length > 0;
            const photoUrl = hasPhoto ? poi.photos[0] : null;

            return (
              <div
                key={poi.id}
                className={`rounded-lg p-2.5 border transition space-y-2 relative group ${
                  isMono
                    ? 'bg-gray-50 border-gray-300 hover:border-gray-500 text-gray-900'
                    : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    {/* Photo / Avatar */}
                    {photoUrl ? (
                      <div
                        onClick={() => setZoomedPhoto(photoUrl)}
                        className={`w-10 h-10 rounded-md overflow-hidden flex-shrink-0 cursor-pointer relative group/img border ${
                          isMono ? 'bg-gray-200 border-gray-400' : 'bg-slate-900 border-amber-500/40'
                        }`}
                      >
                        <img
                          src={photoUrl}
                          alt={displayName}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                          <ZoomIn className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 border ${
                        isMono ? 'bg-gray-200 border-gray-300 text-gray-600' : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        <UserX className={`w-5 h-5 ${isMono ? 'text-gray-700' : 'text-amber-400/70'}`} />
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`text-xs font-bold ${isMono ? 'text-gray-900' : 'text-white'}`}>{displayName}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${getStatusBadge(poi.status)}`}>
                          {poi.status}
                        </span>
                      </div>

                      {/* Aliases */}
                      {((poi.aliases && poi.aliases.length > 0) || poi.nickname) && (
                        <p className={`text-[10px] font-mono ${isMono ? 'text-gray-700 font-semibold' : 'text-amber-400'}`}>
                          Alias: {[poi.nickname, ...(poi.aliases || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                        </p>
                      )}

                      {/* POI Tag */}
                      <div className="flex items-center gap-1.5 text-[10px] pt-0.5">
                        <span className={`font-mono font-bold px-1.5 py-0.2 rounded border ${
                          isMono ? 'bg-gray-200 text-gray-800 border-gray-400' : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                        }`}>
                          {poi.internalPoiId}
                        </span>
                        <span className={`flex items-center gap-1 ${isMono ? 'text-gray-600' : 'text-emerald-400/80'}`}>
                          <CheckCircle2 className={`w-3 h-3 ${isMono ? 'text-gray-700' : 'text-emerald-400'}`} />
                          <span>In Database</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unlink Action */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setPoiToUnlink(poi.id)}
                      className={`p-1 rounded transition opacity-70 group-hover:opacity-100 ${
                        isMono ? 'text-gray-500 hover:text-black hover:bg-gray-200' : 'text-slate-500 hover:text-red-400 hover:bg-red-950/40'
                      }`}
                      title="Unlink suspect from case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Physical Description Chips */}
                {(poi.physicalDescription?.clothingLastSeen ||
                  poi.physicalDescription?.height ||
                  poi.physicalDescription?.build ||
                  poi.physicalDescription?.identifyingMarks ||
                  poi.approximateAge) && (
                  <div className={`rounded-md p-1.5 text-[10px] space-y-1 border ${
                    isMono ? 'bg-white border-gray-300 text-gray-800' : 'bg-slate-900/90 border-slate-800/80 text-slate-300'
                  }`}>
                    <div className="flex flex-wrap gap-1">
                      {poi.approximateAge && (
                        <span className={`px-1 py-0.2 rounded border ${isMono ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-slate-800 text-slate-300'}`}>
                          Age: ~{poi.approximateAge} yrs
                        </span>
                      )}
                      {poi.physicalDescription?.height && (
                        <span className={`px-1 py-0.2 rounded border ${isMono ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-slate-800 text-slate-300'}`}>
                          {poi.physicalDescription.height}
                        </span>
                      )}
                      {poi.physicalDescription?.build && (
                        <span className={`px-1 py-0.2 rounded border ${isMono ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-slate-800 text-slate-300'}`}>
                          {poi.physicalDescription.build} build
                        </span>
                      )}
                      {poi.physicalDescription?.complexion && (
                        <span className={`px-1 py-0.2 rounded border ${isMono ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-slate-800 text-slate-300'}`}>
                          {poi.physicalDescription.complexion}
                        </span>
                      )}
                    </div>
                    {poi.physicalDescription?.clothingLastSeen && (
                      <p className={isMono ? 'text-gray-800' : 'text-slate-300'}>
                        <span className={`font-semibold ${isMono ? 'text-gray-600' : 'text-slate-400'}`}>Clothing:</span> {poi.physicalDescription.clothingLastSeen}
                      </p>
                    )}
                    {poi.physicalDescription?.identifyingMarks && (
                      <p className={isMono ? 'text-gray-900 font-semibold' : 'text-amber-300/90'}>
                        <span className={`font-semibold ${isMono ? 'text-gray-600' : 'text-amber-400/80'}`}>Marks:</span> {poi.physicalDescription.identifyingMarks}
                      </p>
                    )}
                  </div>
                )}

                {/* Phone & Notes */}
                {poi.phoneNumbers && poi.phoneNumbers.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px]">
                    <Phone className={`w-3 h-3 ${isMono ? 'text-gray-700' : 'text-emerald-400'}`} />
                    <div className="flex flex-wrap gap-1.5">
                      {poi.phoneNumbers.map((phone, idx) => (
                        <a
                          key={idx}
                          href={`tel:${phone}`}
                          className={`font-mono font-bold hover:underline ${isMono ? 'text-gray-900' : 'text-emerald-400'}`}
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {poi.notes && (
                  <p className={`text-[10px] italic line-clamp-2 p-1 rounded border ${
                    isMono ? 'bg-white border-gray-200 text-gray-700' : 'bg-slate-900/50 text-slate-400'
                  }`}>
                    "{poi.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`rounded-lg p-3 border border-dashed text-center space-y-1.5 ${
          isMono ? 'bg-gray-50 border-gray-300 text-gray-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <UserX className={`w-6 h-6 mx-auto ${isMono ? 'text-gray-400' : 'text-slate-600'}`} />
          <p className="text-xs font-medium">
            {t.cases.noSuspectsLinked}
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                setSuspectDrafts([DEFAULT_SUSPECT_DRAFT()]);
                setIsAddModalOpen(true);
              }}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition inline-flex items-center gap-1 ${
                isMono
                  ? 'bg-gray-900 hover:bg-black text-white'
                  : 'bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>{t.cases.addSuspects}</span>
            </button>
          )}
        </div>
      )}

      {/* MODAL 1: ADD 1 OR MORE SUSPECTS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 sm:p-5 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t.cases.addSuspects}
                  </h3>
                  <p className="text-[10px] text-amber-400/90 font-mono">
                    Case {caseItem.caseNumber} • {caseItem.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informational Notice */}
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 flex items-start gap-2.5 flex-shrink-0 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-amber-200 font-bold">Automatic POI Registry Synchronization</p>
                <p className="text-amber-300/80 text-[11px]">
                  All suspects added here will be automatically registered in the Intelligence POI (Person of Interest) database with an active dossier, cross-referenced across sector investigations.
                </p>
              </div>
            </div>

            {/* Suspect Entry Forms */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {suspectDrafts.map((draft, index) => (
                <div
                  key={draft.tempId}
                  className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 space-y-3 relative"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <UserX className="w-3.5 h-3.5" />
                      <span>Suspect #{index + 1}</span>
                    </span>
                    {suspectDrafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftRow(draft.tempId)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t.cases.removeSuspectRow}</span>
                      </button>
                    )}
                  </div>

                  {/* Names & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectName}
                      </label>
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { name: e.target.value })}
                        placeholder="e.g. Themba or Unknown"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectSurname}
                      </label>
                      <input
                        type="text"
                        value={draft.surname}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { surname: e.target.value })}
                        placeholder="e.g. Khumalo"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectStatus}
                      </label>
                      <select
                        value={draft.status}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { status: e.target.value as PoiStatus })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      >
                        <option value="SUSPECT">Suspect (Active)</option>
                        <option value="WANTED">Wanted (High Priority)</option>
                        <option value="PERSON_OF_INTEREST">Person of Interest</option>
                        <option value="UNKNOWN_PERSON">Unknown Subject</option>
                        <option value="ARRESTED">Arrested</option>
                      </select>
                    </div>
                  </div>

                  {/* Nicknames, Age, Gender, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectNickname}
                      </label>
                      <input
                        type="text"
                        value={draft.nickname}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { nickname: e.target.value })}
                        placeholder="e.g. Shorty, Skaap"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectAge}
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={draft.approximateAge || ''}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { approximateAge: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                        placeholder="e.g. 32"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectGender}
                      </label>
                      <select
                        value={draft.gender}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { gender: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  {/* Physical Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectClothing}
                      </label>
                      <input
                        type="text"
                        value={draft.clothingLastSeen}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { clothingLastSeen: e.target.value })}
                        placeholder="e.g. Dark hoodie, blue overalls"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectMarks}
                      </label>
                      <input
                        type="text"
                        value={draft.identifyingMarks}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { identifyingMarks: e.target.value })}
                        placeholder="e.g. Scar over eyebrow, limp"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectPhone}
                      </label>
                      <input
                        type="tel"
                        value={draft.phone}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { phone: e.target.value })}
                        placeholder="e.g. +27 82 123 4567"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Photo URL & Modus Operandi Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectPhotoUrl}
                      </label>
                      <input
                        type="url"
                        value={draft.photoUrl}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { photoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {t.cases.suspectKnownAreas}
                      </label>
                      <input
                        type="text"
                        value={draft.knownAreas}
                        onChange={(e) => handleUpdateDraft(draft.tempId, { knownAreas: e.target.value })}
                        placeholder={caseItem.locationName || 'e.g. Sector 2, Tigane'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                      {t.cases.suspectNotes}
                    </label>
                    <textarea
                      rows={2}
                      value={draft.notes}
                      onChange={(e) => handleUpdateDraft(draft.tempId, { notes: e.target.value })}
                      placeholder="e.g. Seen cutting fence at perimeter, fled in direction of R503 railway line..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}

              {/* Add Another Suspect Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAddDraftRow}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-dashed border-amber-500/40 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.cases.addAnotherSuspect}</span>
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllSuspects}
                  disabled={isSaving}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span>{t.common.loading}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.cases.saveSuspects}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LINK EXISTING POI FROM DATABASE */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-blue-500/50 rounded-2xl p-4 sm:p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t.cases.linkExistingPoi}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Search and attach existing Intelligence dossiers to Case #{caseItem.caseNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={poiSearchQuery}
                onChange={(e) => setPoiSearchQuery(e.target.value)}
                placeholder="Search POI by name, alias, ID (POI-HBF-001), phone..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* POI Candidate List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredUnlinkedPois.length > 0 ? (
                filteredUnlinkedPois.map((poi) => {
                  const displayName = `${poi.name || ''} ${poi.surname || ''}`.trim() || poi.nickname || 'Unknown';
                  return (
                    <div
                      key={poi.id}
                      className="bg-slate-950 rounded-xl p-3 border border-slate-800 hover:border-blue-500/50 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{displayName}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${getStatusBadge(poi.status)}`}>
                            {poi.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-mono text-emerald-400">{poi.internalPoiId}</span>
                          {poi.aliases && poi.aliases.length > 0 && (
                            <span>Alias: {poi.aliases.join(', ')}</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          linkPoiToCase(caseItem.id, poi.id);
                          setIsLinkModalOpen(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>Link</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  No matching unlinked POIs found in database.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs transition"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNLINK CONFIRMATION MODAL */}
      {poiToUnlink && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Unlink Suspect</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {t.cases.unlinkSuspectConfirm}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPoiToUnlink(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  unlinkPoiFromCase(caseItem.id, poiToUnlink);
                  setPoiToUnlink(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl transition"
              >
                Confirm Unlink
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO ZOOM MODAL */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-fade-in"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <img src={zoomedPhoto} alt="Suspect" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
