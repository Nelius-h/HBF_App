import React, { useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Car,
  User,
  GitMerge,
  HelpCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/I18nContext';
import { IntelReviewItem } from '../../../types';

export const ReviewQueueTab: React.FC = () => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const {
    intelReviewQueue,
    processReviewQueueItem,
    pois,
    vois,
    cases,
  } = useData();

  const [selectedItem, setSelectedItem] = useState<IntelReviewItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PROCESSED'>('PENDING');
  const [actionType, setActionType] = useState<
    | 'CREATE_NEW_VOI'
    | 'CREATE_NEW_POI'
    | 'ATTACH_OBSERVATION_TO_EXISTING'
    | 'DISMISS_FALSE_REPORT'
    | 'MARK_LEGITIMATE_ACTIVITY'
    | 'MERGE_INTO_EXISTING'
    | 'REQUEST_MORE_EVIDENCE'
  >('ATTACH_OBSERVATION_TO_EXISTING');
  const [actionNotes, setActionNotes] = useState('');
  const [targetEntityType, setTargetEntityType] = useState<'POI' | 'VOI' | 'CASE'>('VOI');
  const [targetEntityId, setTargetEntityId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredItems = intelReviewQueue.filter((item) => {
    if (filterStatus === 'PENDING') return item.status === 'PENDING_REVIEW';
    if (filterStatus === 'PROCESSED') return item.status !== 'PENDING_REVIEW';
    return true;
  });

  const pendingCount = intelReviewQueue.filter((i) => i.status === 'PENDING_REVIEW').length;

  const openActionModal = (item: IntelReviewItem) => {
    setSelectedItem(item);
    setActionNotes('');
    if (item.itemType === 'SUSPICIOUS_VEHICLE_REPORT') {
      setActionType('CREATE_NEW_VOI');
    } else if (item.itemType === 'SUSPICIOUS_PERSON_REPORT') {
      setActionType('CREATE_NEW_POI');
    } else if (item.itemType === 'POSSIBLE_DUPLICATE_PERSON' || item.itemType === 'POSSIBLE_DUPLICATE_VEHICLE') {
      setActionType('MERGE_INTO_EXISTING');
    } else {
      setActionType('ATTACH_OBSERVATION_TO_EXISTING');
    }
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsProcessing(true);

    try {
      await processReviewQueueItem(selectedItem.id, actionType, actionNotes, {
        targetEntityType,
        targetEntityId,
      });
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to process review item:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getItemTypeBadge = (type: IntelReviewItem['itemType']) => {
    switch (type) {
      case 'SUSPICIOUS_VEHICLE_REPORT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/50">
            <Car className="w-3 h-3" /> Suspicious Vehicle Report
          </span>
        );
      case 'SUSPICIOUS_PERSON_REPORT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
            <User className="w-3 h-3" /> Suspicious Person Report
          </span>
        );
      case 'BOLO_SIGHTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/50">
            <AlertTriangle className="w-3 h-3" /> Public BOLO Sighting
          </span>
        );
      case 'POSSIBLE_DUPLICATE_PERSON':
      case 'POSSIBLE_DUPLICATE_VEHICLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/50">
            <GitMerge className="w-3 h-3" /> Duplicate Record Warning
          </span>
        );
      case 'AI_LINK_SUGGESTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
            <Sparkles className="w-3 h-3" /> AI Pattern Suggestion (Unverified)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Inbox className="w-3 h-3" /> Client Submission
          </span>
        );
    }
  };

  const getStatusBadge = (status: IntelReviewItem['status']) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> PENDING OPERATOR REVIEW
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> ACCEPTED & RECORDED
          </span>
        );
      case 'REJECTED':
      case 'DISMISSED':
      case 'FALSE_REPORT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
            <XCircle className="w-3 h-3" /> DISMISSED / LEGITIMATE
          </span>
        );
      case 'MERGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <GitMerge className="w-3 h-3" /> MERGED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-400" />
            Intelligence Review Queue
            {pendingCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black rounded-full">
                {pendingCount} PENDING
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Triage incoming client submissions, suspicious sightings, duplicate alerts, and pattern links before adding to confidential intelligence records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === 'PENDING'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('PROCESSED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === 'PROCESSED'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Processed
          </button>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Items ({intelReviewQueue.length})
          </button>
        </div>
      </div>

      {/* List of Queue Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No review queue items found</p>
          <p className="text-xs text-slate-500 mt-1">
            Incoming public reports and automated similarity matches will appear here for verification.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.status === 'PENDING_REVIEW'
                  ? 'bg-slate-900 border-amber-800/40 hover:border-amber-700/60 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getItemTypeBadge(item.itemType)}
                    {getStatusBadge(item.status)}
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {item.reportedByName && (
                      <span className="text-xs text-slate-400">
                        • Reported by: <strong className="text-slate-200">{item.reportedByName}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    {item.description}
                  </p>

                  {item.location && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Reported Location:</span>
                      <span className="text-slate-200">{item.location}</span>
                    </div>
                  )}

                  {item.payload?.similarityReason && (
                    <div className="text-xs text-amber-200/90 bg-amber-950/30 border border-amber-800/30 rounded px-2.5 py-1.5 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span>{item.payload.similarityReason}</span>
                    </div>
                  )}

                  {item.actionTaken && (
                    <div className="text-xs text-slate-400 pt-1 border-t border-slate-800 flex flex-wrap items-center gap-3">
                      <span>Action: <strong className="text-slate-200">{item.actionTaken}</strong></span>
                      {item.actionNotes && <span>Notes: <em>{item.actionNotes}</em></span>}
                      {item.reviewedByName && (
                        <span>Reviewed by: <strong className="text-slate-200">{item.reviewedByName}</strong></span>
                      )}
                    </div>
                  )}
                </div>

                {item.status === 'PENDING_REVIEW' && (
                  <div className="flex lg:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => openActionModal(item)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Triage & Action
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Execution Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Review Queue Triage</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Report Summary</div>
              <p>{selectedItem.description}</p>
              {selectedItem.location && <p className="text-slate-400">Location: {selectedItem.location}</p>}
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Select Triage Action <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 ${
                      actionType === 'CREATE_NEW_VOI'
                        ? 'bg-amber-950/40 border-amber-600 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="CREATE_NEW_VOI"
                      checked={actionType === 'CREATE_NEW_VOI'}
                      onChange={() => setActionType('CREATE_NEW_VOI')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-amber-400" /> Create New VOI
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Register as new Vehicle of Interest dossier</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 ${
                      actionType === 'CREATE_NEW_POI'
                        ? 'bg-amber-950/40 border-amber-600 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="CREATE_NEW_POI"
                      checked={actionType === 'CREATE_NEW_POI'}
                      onChange={() => setActionType('CREATE_NEW_POI')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-indigo-400" /> Create New POI
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Create Unknown Person / POI record</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 ${
                      actionType === 'ATTACH_OBSERVATION_TO_EXISTING'
                        ? 'bg-amber-950/40 border-amber-600 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="ATTACH_OBSERVATION_TO_EXISTING"
                      checked={actionType === 'ATTACH_OBSERVATION_TO_EXISTING'}
                      onChange={() => setActionType('ATTACH_OBSERVATION_TO_EXISTING')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-400" /> Attach to Existing Entity
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Add verified observation to existing POI/VOI/Case</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 ${
                      actionType === 'DISMISS_FALSE_REPORT'
                        ? 'bg-amber-950/40 border-amber-600 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionType"
                      value="DISMISS_FALSE_REPORT"
                      checked={actionType === 'DISMISS_FALSE_REPORT'}
                      onChange={() => setActionType('DISMISS_FALSE_REPORT')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-400" /> Dismiss / False Report
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Verified as legitimate or non-security activity</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Target Entity Selection if Attaching */}
              {actionType === 'ATTACH_OBSERVATION_TO_EXISTING' && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Target Entity Type</label>
                      <select
                        value={targetEntityType}
                        onChange={(e) => setTargetEntityType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="VOI">Vehicle of Interest (VOI)</option>
                        <option value="POI">Person of Interest (POI)</option>
                        <option value="CASE">Incident Case</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Select Existing Target Record</label>
                      <select
                        value={targetEntityId}
                        onChange={(e) => setTargetEntityId(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="">-- Select Record --</option>
                        {targetEntityType === 'VOI' &&
                          vois.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.registration} ({v.make} {v.model}) [{v.internalVoiId}]
                            </option>
                          ))}
                        {targetEntityType === 'POI' &&
                          pois.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.surname || ''} ({p.internalPoiId}) - {p.status}
                            </option>
                          ))}
                        {targetEntityType === 'CASE' &&
                          cases.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.caseNumber} - {c.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Operator Triage Notes & Rationale <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  required
                  placeholder="State the verified factual basis for accepting or dismissing this submission..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none min-h-[70px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Triage Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
