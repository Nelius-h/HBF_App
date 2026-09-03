import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Car,
  User,
  FileText,
  Shield,
  Trash2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import { IntelRelationship, IntelEntityType } from '../../../types';

export const RelationshipGraphView: React.FC = () => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const {
    intelRelationships,
    createIntelRelationship,
    removeIntelRelationship,
    verifyIntelRelationship,
    pois,
    vois,
    cases,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isAddingLink, setIsAddingLink] = useState(false);

  // New Link form state
  const [sourceType, setSourceType] = useState<IntelEntityType>('PERSON');
  const [sourceId, setSourceId] = useState('');
  const [targetType, setTargetType] = useState<IntelEntityType>('VEHICLE');
  const [targetId, setTargetId] = useState('');
  const [relationType, setRelationType] = useState('DRIVER_OF_VEHICLE');
  const [attribution, setAttribution] = useState('');
  const [linkVerification, setLinkVerification] = useState<'VERIFIED' | 'UNVERIFIED' | 'SUGGESTED'>('UNVERIFIED');
  const [linkNotes, setLinkNotes] = useState('');

  const filteredLinks = intelRelationships.filter((rel) => {
    if (filterType !== 'ALL') {
      if (rel.sourceType !== filterType && rel.targetType !== filterType) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rel.sourceLabel.toLowerCase().includes(q) ||
      rel.targetLabel.toLowerCase().includes(q) ||
      rel.relationshipType.toLowerCase().includes(q) ||
      rel.sourceAttribution.toLowerCase().includes(q)
    );
  });

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || !attribution.trim()) return;

    // Resolve labels
    let sLabel = sourceId;
    if (sourceType === 'PERSON') {
      const p = pois.find((x) => x.id === sourceId);
      sLabel = p ? `${p.name || ''} ${p.surname || ''} (${p.internalPoiId})` : sourceId;
    } else if (sourceType === 'VEHICLE') {
      const v = vois.find((x) => x.id === sourceId);
      sLabel = v ? `${v.registration} (${v.make})` : sourceId;
    } else if (sourceType === 'CASE') {
      const c = cases.find((x) => x.id === sourceId);
      sLabel = c ? `${c.caseNumber} - ${c.title}` : sourceId;
    }

    let tLabel = targetId;
    if (targetType === 'PERSON') {
      const p = pois.find((x) => x.id === targetId);
      tLabel = p ? `${p.name || ''} ${p.surname || ''} (${p.internalPoiId})` : targetId;
    } else if (targetType === 'VEHICLE') {
      const v = vois.find((x) => x.id === targetId);
      tLabel = v ? `${v.registration} (${v.make})` : targetId;
    } else if (targetType === 'CASE') {
      const c = cases.find((x) => x.id === targetId);
      tLabel = c ? `${c.caseNumber} - ${c.title}` : targetId;
    }

    await createIntelRelationship({
      sourceId,
      sourceType,
      sourceLabel: sLabel,
      targetId,
      targetType,
      targetLabel: tLabel,
      relationshipType: relationType,
      sourceAttribution: attribution,
      verification: linkVerification,
      notes: linkNotes,
    });

    setIsAddingLink(false);
    setSourceId('');
    setTargetId('');
    setAttribution('');
    setLinkNotes('');
  };

  const getEntityIcon = (type: IntelEntityType) => {
    switch (type) {
      case 'PERSON':
        return <User className="w-4 h-4 text-indigo-400" />;
      case 'VEHICLE':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'CASE':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      default:
        return <LinkIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-1 items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter relationships by person, vehicle plate, case number, or link type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Entity Links ({intelRelationships.length})</option>
            <option value="PERSON">Person Links</option>
            <option value="VEHICLE">Vehicle Links</option>
            <option value="CASE">Case Links</option>
          </select>

          <button
            onClick={() => setIsAddingLink(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Link Entities
          </button>
        </div>
      </div>

      {/* Relationship Cards */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl">
          <LinkIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No entity relationships found</p>
          <p className="text-xs text-slate-500 mt-1">Connect Persons, Vehicles, and Incident Cases with verifiable links.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLinks.map((rel) => (
            <div
              key={rel.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 relative hover:border-amber-500/50 transition-all"
            >
              {/* Header with Verification Pill */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/40">
                  {rel.relationshipType.replace(/_/g, ' ')}
                </span>

                <div className="flex items-center gap-2">
                  {rel.verification === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  ) : (
                    <button
                      onClick={() => verifyIntelRelationship(rel.id, 'VERIFIED')}
                      className="text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800"
                    >
                      Mark Verified
                    </button>
                  )}

                  <button
                    onClick={() => removeIntelRelationship(rel.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Source & Target Linked Pair */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-2 flex-1">
                  {getEntityIcon(rel.sourceType)}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">{rel.sourceType}</span>
                    <span className="text-xs font-bold text-white">{rel.sourceLabel}</span>
                  </div>
                </div>

                <div className="text-slate-600 font-bold text-sm shrink-0">➔</div>

                <div className="flex items-center gap-2 flex-1 justify-end text-right">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">{rel.targetType}</span>
                    <span className="text-xs font-bold text-white">{rel.targetLabel}</span>
                  </div>
                  {getEntityIcon(rel.targetType)}
                </div>
              </div>

              {/* Attribution & Evidence */}
              <div className="text-xs text-slate-400 space-y-1">
                <div>
                  Attribution: <strong className="text-slate-200">{rel.sourceAttribution}</strong>
                </div>
                {rel.notes && <div className="text-slate-500 text-[11px]">Notes: {rel.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW RELATIONSHIP MODAL */}
      {isAddingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create Direct Entity Relationship</h3>
              </div>
              <button onClick={() => setIsAddingLink(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4 text-xs">
              {/* Source Entity */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-300">1. Source Entity</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                    <select
                      value={sourceType}
                      onChange={(e) => {
                        setSourceType(e.target.value as any);
                        setSourceId('');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="PERSON">Person of Interest (POI)</option>
                      <option value="VEHICLE">Vehicle of Interest (VOI)</option>
                      <option value="CASE">Incident Case</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Select Record</label>
                    <select
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="">-- Choose Source --</option>
                      {sourceType === 'PERSON' &&
                        pois.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.internalPoiId} - {p.name || ''} {p.surname || 'Unknown'}
                          </option>
                        ))}
                      {sourceType === 'VEHICLE' &&
                        vois.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.registration} ({v.make}) [{v.internalVoiId}]
                          </option>
                        ))}
                      {sourceType === 'CASE' &&
                        cases.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.caseNumber} - {c.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Relationship Type */}
              <div>
                <label className="block text-slate-400 mb-1">Relationship Connection</label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                >
                  <option value="DRIVER_OF_VEHICLE">DRIVER_OF_VEHICLE</option>
                  <option value="PRIMARY_SUSPECT">PRIMARY_SUSPECT</option>
                  <option value="KNOWN_ASSOCIATE">KNOWN_ASSOCIATE</option>
                  <option value="SIGHTED_NEAR_INCIDENT">SIGHTED_NEAR_INCIDENT</option>
                  <option value="SIMILAR_MODUS_OPERANDI">SIMILAR_MODUS_OPERANDI</option>
                  <option value="REGISTERED_OWNER">REGISTERED_OWNER</option>
                </select>
              </div>

              {/* Target Entity */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-300">2. Target Entity</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                    <select
                      value={targetType}
                      onChange={(e) => {
                        setTargetType(e.target.value as any);
                        setTargetId('');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="VEHICLE">Vehicle of Interest (VOI)</option>
                      <option value="PERSON">Person of Interest (POI)</option>
                      <option value="CASE">Incident Case</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Select Record</label>
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="">-- Choose Target --</option>
                      {targetType === 'PERSON' &&
                        pois.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.internalPoiId} - {p.name || ''} {p.surname || 'Unknown'}
                          </option>
                        ))}
                      {targetType === 'VEHICLE' &&
                        vois.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.registration} ({v.make}) [{v.internalVoiId}]
                          </option>
                        ))}
                      {targetType === 'CASE' &&
                        cases.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.caseNumber} - {c.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Source Attribution / Corroborating Basis <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  required
                  placeholder="e.g. CCTV Gate 3 camera log #884 or SAPS CAS statement"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingLink(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Save Relationship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
