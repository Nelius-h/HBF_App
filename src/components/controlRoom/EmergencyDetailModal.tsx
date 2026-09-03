import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Send,
  Shield,
  HeartPulse,
  Flame,
  X,
  ExternalLink,
  MessageSquare,
  KeyRound,
  FileText,
  User,
  Users,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Link as LinkIcon,
  Bell,
  EyeOff,
  FlameKindling,
  PhoneCall,
  Lock,
  Mic,
  Calendar,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  EmergencyEvent,
  CallOutcomeType,
  AlertType,
  AlertPriority,
  IncidentCategory,
  CasePriority,
  WhatsAppMessageRecord,
} from '../../types';
import { formatEmergencyWhatsAppMessage, generateManualWhatsAppUrl } from '../../services/whatsappService';
import { stopSosContinuousAlarm } from '../../services/soundEffects';
import { LiveCommunicationsPanel } from './LiveCommunicationsPanel';
import { LiveAudioConsole } from '../common/LiveAudioConsole';
import { DispatchReactionForceWhatsAppModal } from './DispatchReactionForceWhatsAppModal';

interface EmergencyDetailModalProps {
  emergency: EmergencyEvent;
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyDetailModal: React.FC<EmergencyDetailModalProps> = ({
  emergency,
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const { currentUser, activeRole } = useAuth();
  const {
    acknowledgeEmergency,
    addEmergencyOperatorNote,
    initiateCallAction,
    recordCallOutcome,
    notifyReactionForce,
    notifyManagement,
    createCommunityAlertFromEmergency,
    linkEmergencyToCase,
    createCaseFromEmergency,
    recordFalseAlarm,
    resolveEmergency,
    emergencyContacts,
    cases,
    settings,
    groups,
    communityAssistanceRequests,
    createCommunityAssistanceRequest,
    escalateAssistanceRequest,
    updateResponderAssignment,
    sendAllClearForAssistance,
  } = useData();

  // Silence continuous SOS alarm tone immediately when console is opened
  useEffect(() => {
    if (isOpen) {
      stopSosContinuousAlarm();
    }
  }, [isOpen]);

  // Elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    return Math.floor((Date.now() - new Date(emergency.startTime).getTime()) / 1000);
  });

  useEffect(() => {
    if (emergency.status === 'SAFE' || emergency.status === 'FALSE_ALARM' || emergency.status === 'CLOSED') return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - new Date(emergency.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [emergency.startTime, emergency.status]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sub-dialogs state
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'SENSITIVE' | 'COMMUNICATIONS' | 'COMMUNITY'>('OVERVIEW');
  const [operatorNote, setOperatorNote] = useState('');
  const [copiedGateCode, setCopiedGateCode] = useState(false);
  const [copiedWAMessage, setCopiedWAMessage] = useState(false);

  // Community Assistance Request for this emergency
  const linkedAssistanceRequest = (communityAssistanceRequests || []).find(
    (r) => r.linkedEmergencyId === emergency.id
  );

  // Assistance Dispatch form state
  const [isDispatchingAssistance, setIsDispatchingAssistance] = useState(false);
  const [assistPublicTitle, setAssistPublicTitle] = useState(`NOODGEVAL: Bystand Versoek naby ${emergency.farmName}`);
  const [assistPublicMessage, setAssistPublicMessage] = useState(`Veiligheidssituasie aangemeld in ${emergency.sector}. Nabygeleë lede versoek om op bystand te wees en bewegings aan te meld.`);
  const [assistSafetyInstructions, setAssistSafetyInstructions] = useState('Moenie verdagtes self benader nie. Bly in voertuie en rapporteer posisies.');
  const [assistStagingName, setAssistStagingName] = useState(`Sektor ${emergency.sector} - Hoofpad kruising`);
  const [assistStagingInstructions, setAssistStagingInstructions] = useState('Vergader by kruising met flikkerligte aan.');
  const [assistStagingContact, setAssistStagingContact] = useState(currentUser?.name ? `${currentUser.name} (${currentUser.primaryPhone})` : 'Beheerkamer');
  const [assistRadiusKm, setAssistRadiusKm] = useState(15);
  const [assistFilterType, setAssistFilterType] = useState<'nearby_responders' | 'specific_groups'>('nearby_responders');
  const [assistSelectedGroups, setAssistSelectedGroups] = useState<string[]>([]);
  const [isSubmittingAssist, setIsSubmittingAssist] = useState(false);

  // Task assignment dialog state
  const [assigningResponderUid, setAssigningResponderUid] = useState<string | null>(null);
  const [assignedRoleInput, setAssignedRoleInput] = useState('');

  // Action Modals
  const [isReactionModalOpen, setIsReactionModalOpen] = useState(false);
  const [selectedReactionContact, setSelectedReactionContact] = useState<string>('');
  const [reactionCustomNotes, setReactionCustomNotes] = useState('');
  const [isSendingReaction, setIsSendingReaction] = useState(false);
  const [reactionResultMsg, setReactionResultMsg] = useState<string | null>(null);
  const [dispatchedWaRecord, setDispatchedWaRecord] = useState<WhatsAppMessageRecord | null>(null);

  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [activeCallType, setActiveCallType] = useState<'POLICE' | 'AMBULANCE'>('POLICE');
  const [activeCallLogId, setActiveCallLogId] = useState<string | null>(null);
  const [callOutcome, setCallOutcome] = useState<CallOutcomeType>('DISPATCH_CONFIRMED');
  const [callNotes, setCallNotes] = useState('');

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState(`SECURITY INCIDENT: ${emergency.farmName}`);
  const [alertDesc, setAlertDesc] = useState(`Active security situation reported in ${emergency.sector}. Community members are requested to remain vigilant and keep gates secured.`);
  const [alertPriority, setAlertPriority] = useState<AlertPriority>('high');
  const [alertDistribution, setAlertDistribution] = useState<'all' | 'groups'>('all');

  const [isLinkCaseModalOpen, setIsLinkCaseModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState(`Emergency dispatch: ${emergency.emergencyType} at ${emergency.farmName}`);
  const [newCaseDesc, setNewCaseDesc] = useState(`Emergency triggered by ${emergency.clientName} (${emergency.clientPhone}) at ${emergency.farmName}.\nLocation: ${(emergency.location?.latitude ?? -26.7628).toFixed(5)}, ${(emergency.location?.longitude ?? 26.4172).toFixed(5)}`);
  const [newCaseCategory, setNewCaseCategory] = useState<IncidentCategory>('suspicious_activity');
  const [newCasePriority, setNewCasePriority] = useState<CasePriority>('high');

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [policeInvolved, setPoliceInvolved] = useState(false);
  const [ambulanceInvolved, setAmbulanceInvolved] = useState(false);
  const [reactionInvolved, setReactionInvolved] = useState(true);
  const [caseCreated, setCaseCreated] = useState(true); // Auto-ticked by default
  const [isFalseAlarm, setIsFalseAlarm] = useState(false); // Can be ticked
  const [followUpRequired, setFollowUpRequired] = useState(false);

  const [isFalseAlarmModalOpen, setIsFalseAlarmModalOpen] = useState(false);
  const [falseAlarmReason, setFalseAlarmReason] = useState('');

  if (!isOpen) return null;

  const isAcknowledged = emergency.status !== 'TRIGGERED' && emergency.status !== 'CONTROL_ROOM_NOTIFIED';
  const isClosed = emergency.status === 'SAFE' || emergency.status === 'FALSE_ALARM' || emergency.status === 'CLOSED';

  // Action Handlers
  const handleAcknowledge = () => {
    acknowledgeEmergency(emergency.id);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorNote.trim()) return;
    addEmergencyOperatorNote(emergency.id, operatorNote.trim());
    setOperatorNote('');
  };

  const handleSendReactionForce = async () => {
    setIsSendingReaction(true);
    try {
      const waRecord = await notifyReactionForce(
        emergency.id,
        selectedReactionContact || undefined,
        reactionCustomNotes
      );
      setDispatchedWaRecord(waRecord);
      if (waRecord.sendStatus === 'SENT') {
        setReactionResultMsg(`✅ WhatsApp alert dispatched successfully to ${waRecord.recipientName} (${waRecord.recipient}).`);
      } else if (waRecord.sendStatus === 'REQUIRES_CONFIGURATION') {
        setReactionResultMsg(`⚠️ WhatsApp Cloud API not configured in settings. Manual WhatsApp direct chat link generated below.`);
      } else {
        setReactionResultMsg(`WhatsApp notification status: ${waRecord.sendStatus}`);
      }
    } catch (err: any) {
      setReactionResultMsg(`Error: ${err?.message || 'Failed to dispatch'}`);
    } finally {
      setIsSendingReaction(false);
    }
  };

  const handleStartCall = (type: 'POLICE' | 'AMBULANCE') => {
    setActiveCallType(type);
    const targetNumber =
      type === 'POLICE'
        ? settings.policeDirectPhone
        : settings.ambulanceDirectPhone;
    const targetName =
      type === 'POLICE' ? 'SAPS Hartbeesfontein' : 'Emergency Medical Services';

    const logId = initiateCallAction(emergency.id, type, targetNumber, targetName);
    setActiveCallLogId(logId);
    setIsCallModalOpen(true);

    // Trigger device dialler
    window.location.href = `tel:${targetNumber.replace(/[^0-9+]/g, '')}`;
  };

  const handleSaveCallOutcome = () => {
    if (!activeCallLogId) return;
    recordCallOutcome(emergency.id, activeCallLogId, callOutcome, callNotes);
    setIsCallModalOpen(false);
    setActiveCallLogId(null);
    setCallNotes('');
  };

  const handleCreateCommunityAlert = async () => {
    await createCommunityAlertFromEmergency(emergency.id, {
      type: 'SECURITY',
      title: alertTitle,
      shortDescription: alertDesc,
      priority: alertPriority,
      location: `${emergency.farmName}, ${emergency.sector}`,
      requiresAck: false,
      targetDistribution: alertDistribution,
    });
    setIsAlertModalOpen(false);
  };

  const handleLinkExistingCase = () => {
    if (!selectedCaseId) return;
    linkEmergencyToCase(emergency.id, selectedCaseId);
    setIsLinkCaseModalOpen(false);
  };

  const handleCreateNewCase = async () => {
    await createCaseFromEmergency(
      emergency.id,
      newCaseCategory,
      newCaseTitle,
      newCaseDesc,
      newCasePriority
    );
    setIsCreateCaseModalOpen(false);
  };

  const handleConfirmResolve = async () => {
    try {
      if (isFalseAlarm) {
        recordFalseAlarm(
          emergency.id,
          resolveNotes || 'False alarm recorded during resolution by Control Room'
        );
        if (caseCreated) {
          try {
            await createCaseFromEmergency(
              emergency.id,
              'other',
              `False Alarm: ${emergency.emergencyType} at ${emergency.farmName}`,
              resolveNotes || `False alarm recorded for ${emergency.clientName} at ${emergency.farmName}.`,
              'low'
            );
          } catch (caseErr) {
            console.warn('[EmergencyDetailModal] Case creation note:', caseErr);
          }
        }
      } else {
        resolveEmergency(emergency.id, {
          notes: resolveNotes || 'Standard safe resolution recorded by Control Room',
          policeInvolved,
          ambulanceInvolved,
          reactionForceInvolved: reactionInvolved,
          caseCreated,
          followUpRequired,
        });
        if (caseCreated) {
          try {
            await createCaseFromEmergency(
              emergency.id,
              newCaseCategory,
              newCaseTitle,
              resolveNotes || newCaseDesc,
              newCasePriority
            );
          } catch (caseErr) {
            console.warn('[EmergencyDetailModal] Case creation note:', caseErr);
          }
        }
      }
    } finally {
      setIsResolveModalOpen(false);
      onClose();
    }
  };

  const handleDispatchCommunityAssistance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAssist(true);
    try {
      await createCommunityAssistanceRequest({
        emergencyId: emergency.id,
        requestType: 'SECURITY',
        priority: 'CRITICAL',
        publicSafeTitle: assistPublicTitle,
        publicSafeMessage: assistPublicMessage,
        safetyWarning: assistSafetyInstructions,
        structuredInstructions: 'OBSERVE_ONLY',
        customInstructions: assistSafetyInstructions,
        locationPrecision: 'APPROXIMATE',
        targetAreaName: emergency.sector || 'Hartbeesfontein',
        farmNameSafe: emergency.farmName,
        stagingPoint: {
          name: assistStagingName,
          instructions: assistStagingInstructions,
          contactPerson: assistStagingContact,
        },
        gpsLocation: emergency.location ? {
          latitude: emergency.location.latitude,
          longitude: emergency.location.longitude,
        } : undefined,
        targetFilter: {
          targetType: assistFilterType === 'nearby_responders' ? 'NEARBY_CLIENTS' : 'GROUPS',
          radiusKm: assistFilterType === 'nearby_responders' ? assistRadiusKm : undefined,
          groupIds: assistFilterType === 'specific_groups' ? assistSelectedGroups : undefined,
        },
      });
      setIsDispatchingAssistance(false);
      setActiveTab('COMMUNITY');
    } finally {
      setIsSubmittingAssist(false);
    }
  };

  const handleEscalateAssistance = async () => {
    if (!linkedAssistanceRequest) return;
    await escalateAssistanceRequest(
      linkedAssistanceRequest.id,
      'Automated/Operator manual expansion due to need for additional perimeter support',
      (linkedAssistanceRequest.targetFilter.radiusKm || 15) + 10
    );
  };

  const handleSaveAssignment = async () => {
    if (!linkedAssistanceRequest || !assigningResponderUid) return;
    await updateResponderAssignment(
      linkedAssistanceRequest.id,
      assigningResponderUid,
      { assignedRole: assignedRoleInput }
    );
    setAssigningResponderUid(null);
    setAssignedRoleInput('');
  };

  const handleStandDownResponder = async (responderUid: string) => {
    if (!linkedAssistanceRequest) return;
    await updateResponderAssignment(
      linkedAssistanceRequest.id,
      responderUid,
      { assignedRole: 'STAND DOWN / TERUGGESTAAN', isRemoved: true, operationalNote: 'Stood down by operator' }
    );
  };

  const handleSendAllClear = async () => {
    if (!linkedAssistanceRequest) return;
    await sendAllClearForAssistance(
      linkedAssistanceRequest.id,
      'Situasie onder beheer. Alle responders kan terugstaan. Baie dankie vir julle bystand.'
    );
  };

  const handleConfirmFalseAlarm = () => {
    recordFalseAlarm(emergency.id, falseAlarmReason || 'Control Room verified false alarm');
    setIsFalseAlarmModalOpen(false);
  };

  const reactionContactsList = emergencyContacts.filter(
    (c) => c.category === 'REACTION_FORCE' || c.category === 'MANAGEMENT' || c.category === 'OTHER'
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-red-500/70 rounded-3xl w-full max-w-4xl max-h-[94vh] overflow-hidden shadow-2xl flex flex-col text-white">
        {/* TOP HEADER */}
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-rose-800 px-5 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-red-700 flex items-center justify-center font-black shadow-lg flex-shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-wide uppercase">
                  {t.emergency.types[emergency.emergencyType] || emergency.emergencyType}
                </span>
                <span className="font-mono text-xs bg-black/40 px-2.5 py-0.5 rounded-full font-bold">
                  #{emergency.id}
                </span>
              </div>
              <p className="text-xs text-red-100 font-semibold mt-0.5">
                {emergency.farmName} • {emergency.sector}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isClosed && (
              <div className="flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm bg-black/40 px-3 py-1.5 rounded-xl border border-red-400/40">
                <Clock className="w-4 h-4 text-red-200" />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ACKNOWLEDGEMENT BANNER / FAST ACTION */}
        {!isAcknowledged && !isClosed && (
          <div className="bg-amber-500 text-slate-950 px-5 py-3 flex items-center justify-between font-bold animate-pulse">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 animate-spin text-slate-950" />
              <span className="text-xs sm:text-sm uppercase tracking-wider font-black">
                {t.emergency.crWaitingHeader}
              </span>
            </div>
            <button
              onClick={handleAcknowledge}
              className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg uppercase transition"
            >
              {t.emergency.acknowledgeBtn}
            </button>
          </div>
        )}

        {isAcknowledged && emergency.acknowledgedBy && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-5 py-2 flex items-center justify-between text-[11px] text-emerald-200">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {t.emergency.acknowledgedBy} {emergency.acknowledgedBy.operatorName} ({emergency.acknowledgedBy.operatorUid})
              </span>
            </div>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-500" />
              <span>{new Date(emergency.acknowledgedBy.timestamp).toLocaleDateString('en-ZA')} {new Date(emergency.acknowledgedBy.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </span>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-850 px-4 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.emergency.tabOverview}
          </button>
          <button
            onClick={() => setActiveTab('SENSITIVE')}
            className={`px-4 py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SENSITIVE'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.emergency.tabAccessInfo}</span>
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'TIMELINE'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.emergency.tabTimeline} ({emergency.timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('COMMUNICATIONS')}
            className={`px-4 py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'COMMUNICATIONS'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {emergency.audioSession?.status === 'ACTIVE' && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            )}
            <Mic className={`w-3.5 h-3.5 ${emergency.audioSession?.status === 'ACTIVE' ? 'text-red-400 animate-pulse' : ''}`} />
            <span>{t.emergency.tabCommunications} ({emergency.whatsappLogs.length + emergency.callLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('COMMUNITY')}
            className={`px-4 py-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'COMMUNITY'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.communityResponse.title}</span>
            {linkedAssistanceRequest && (
              <span className="bg-blue-900 text-blue-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-blue-700">
                {linkedAssistanceRequest.responders.length}
              </span>
            )}
          </button>
        </div>

        {/* MAIN BODY AREA */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* TAB: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              {/* LIVE AUDIO CONSOLE (Visible directly on Overview for immediate dispatch monitoring) */}
              <LiveAudioConsole emergency={emergency} isClientView={false} />

              {/* Top Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Client Card */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                      {t.emergency.clientInfo}
                    </h3>
                    <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                      UID: {emergency.clientUid}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold text-lg overflow-hidden border border-slate-600">
                      {emergency.clientPhotoUrl ? (
                        <img
                          src={emergency.clientPhotoUrl}
                          alt={emergency.clientName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-black text-sm text-white block">{emergency.clientName}</span>
                      <span className="text-slate-400 text-[11px] block">{emergency.farmName}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t.emergency.primaryPhone}:</span>
                      <a
                        href={`tel:${emergency.clientPhone.replace(/[^0-9+]/g, '')}`}
                        className="font-mono text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{emergency.clientPhone}</span>
                      </a>
                    </div>
                    {emergency.secondaryPhone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{t.emergency.secondaryPhone}:</span>
                        <a
                          href={`tel:${emergency.secondaryPhone.replace(/[^0-9+]/g, '')}`}
                          className="font-mono text-slate-300 hover:underline"
                        >
                          {emergency.secondaryPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Location Card */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                      {t.emergency.locationDetails}
                    </h3>
                    <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-bold">
                      {emergency.location.quality === 'CURRENT_GPS'
                        ? `GPS (±${emergency.location.accuracy || 12}m)`
                        : emergency.location.quality}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono text-white font-bold block">
                        {(emergency.location?.latitude ?? -26.7628).toFixed(5)}, {(emergency.location?.longitude ?? 26.4172).toFixed(5)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {emergency.farmName} • {emergency.sector}
                      </span>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${emergency.location?.latitude ?? -26.7628},${emergency.location?.longitude ?? 26.4172}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.emergency.openMap}</span>
                    </a>
                  </div>

                  <div className="text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Activated: {new Date(emergency.startTime).toLocaleDateString('en-ZA')} {new Date(emergency.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span className="font-mono">Fix: {new Date(emergency.location.timestamp).toLocaleDateString('en-ZA')} {new Date(emergency.location.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Client Live Updates if any */}
              {emergency.clientUpdates.length > 0 && (
                <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>Live Updates from Client ({emergency.clientUpdates.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {emergency.clientUpdates.map((up) => (
                      <div key={up.id} className="bg-slate-900/80 p-2.5 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-purple-400">
                          <span className="font-bold">Client Report</span>
                          <span className="font-mono">{new Date(up.timestamp).toLocaleDateString('en-ZA')} {new Date(up.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-white">{up.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operator Notes Box */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                  {t.emergency.operatorNotes} ({emergency.notes.length})
                </h3>

                {emergency.notes.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {emergency.notes.map((n) => (
                      <div key={n.id} className="bg-slate-900 p-2.5 rounded-xl space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="text-slate-300 font-bold">{n.authorName} ({n.authorRole})</span>
                          <span className="font-mono">{new Date(n.timestamp).toLocaleDateString('en-ZA')} {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-white">{n.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">No operator notes logged yet.</p>
                )}

                <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={operatorNote}
                    onChange={(e) => setOperatorNote(e.target.value)}
                    placeholder={t.emergency.addNotePlaceholder}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl"
                  >
                    Add Note
                  </button>
                </form>
              </div>

              {/* Cross-linking Status */}
              <div className="flex flex-wrap items-center justify-between bg-slate-850 p-3 rounded-2xl border border-slate-800 text-xs gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>
                    Linked Case: {emergency.linkedCaseId ? (
                      <span className="font-mono text-blue-400 font-bold">{emergency.linkedCaseId}</span>
                    ) : (
                      <span className="text-slate-500 italic">None</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>
                    Community Alert: {emergency.linkedAlertId ? (
                      <span className="font-mono text-amber-400 font-bold">{emergency.linkedAlertId}</span>
                    ) : (
                      <span className="text-slate-500 italic">None broadcasted</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SENSITIVE ACCESS INFO (Requirement 3 & 14) */}
          {activeTab === 'SENSITIVE' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  CONFIDENTIAL EMERGENCY ACCESS DATA: Restricted to authorized Control Room operators and Management for dispatching reaction units and emergency responders.
                </span>
              </div>

              {/* Main Gate Access Code */}
              <div className="bg-slate-800 border-2 border-amber-500/50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-xs flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    <span>{t.emergency.mainGateCode}</span>
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(emergency.propertySnapshot.mainGateCode || '');
                      setCopiedGateCode(true);
                      setTimeout(() => setCopiedGateCode(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] bg-slate-900 hover:bg-slate-750 px-2.5 py-1 rounded-lg text-slate-300 font-bold"
                  >
                    {copiedGateCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGateCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <div className="font-mono text-xl sm:text-2xl font-black text-amber-300 bg-slate-900 p-3 rounded-xl tracking-wider">
                  {emergency.propertySnapshot.mainGateCode || 'NOT CONFIGURED'}
                </div>
              </div>

              {/* Property Snapshot Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    {t.emergency.dangerousAnimals}
                  </span>
                  <p className="text-white font-medium">
                    {emergency.propertySnapshot.dangerousAnimals || 'None reported'}
                  </p>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    {t.emergency.waterPoints}
                  </span>
                  <p className="text-white font-medium">
                    {emergency.propertySnapshot.waterPoints || 'Standard farm boreholes'}
                  </p>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    {t.emergency.fireEquipment}
                  </span>
                  <p className="text-white font-medium">
                    {emergency.propertySnapshot.firefightingEquipment || 'Standard portable extinguishers'}
                  </p>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    {t.emergency.accessNotes}
                  </span>
                  <p className="text-white font-medium">
                    {emergency.propertySnapshot.accessDifficulties || 'No specific hazards noted'}
                  </p>
                </div>
              </div>

              {/* Family Snapshot & Medical */}
              {emergency.medicalAidSnapshot && (
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-emerald-400" />
                    <span>Medical Aid Information (Confidential)</span>
                  </h4>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p>
                      <strong>Scheme:</strong> {emergency.medicalAidSnapshot.provider} (Plan: {emergency.medicalAidSnapshot.planName})
                    </p>
                    <p>
                      <strong>Membership Number:</strong> {emergency.medicalAidSnapshot.membershipNumber}
                    </p>
                    <p>
                      <strong>Principal Member:</strong> {emergency.medicalAidSnapshot.principalMember}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: TIMELINE (Requirement 11) */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-xs">
                  Immutable Emergency Event Stream
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {emergency.timeline.length} Events Logged
                </span>
              </div>

              <div className="space-y-2 border-l-2 border-slate-700 pl-3 ml-2">
                {emergency.timeline.map((ev, idx) => (
                  <div key={ev.id} className="relative pb-3 space-y-1">
                    {/* Event Dot */}
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-slate-900" />

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold font-mono uppercase text-red-400">
                        {ev.eventType}
                      </span>
                      <span className="font-mono flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-slate-500" />
                        <span>{new Date(ev.timestamp).toLocaleDateString('en-ZA')} {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </span>
                    </div>

                    <p className="text-white text-xs font-medium">{ev.description}</p>
                    {ev.actorName && (
                      <span className="text-[10px] text-slate-400 block">
                        Actor: {ev.actorName} ({ev.actorRole})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COMMUNICATIONS (Live Audio, Location, Messages, Reaction Log, WhatsApp & Calls) */}
          {activeTab === 'COMMUNICATIONS' && (
            <div className="space-y-6">
              {/* Comprehensive Live Communications Suite */}
              <LiveCommunicationsPanel emergency={emergency} />

              {/* WhatsApp Messages */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Automated WhatsApp Dispatch Records ({emergency.whatsappLogs.length})</span>
                </h4>

                {emergency.whatsappLogs.length === 0 ? (
                  <p className="text-slate-500 italic text-xs">No WhatsApp notifications dispatched yet.</p>
                ) : (
                  <div className="space-y-2">
                    {emergency.whatsappLogs.map((wa, idx) => (
                      <div key={`${wa.id || 'wa'}-${idx}-${wa.requestedTimestamp || ''}`} className="bg-slate-800 p-3 rounded-2xl border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white">To: {wa.recipientName} ({wa.recipient})</span>
                          <span
                            className={`font-bold uppercase px-2 py-0.5 rounded ${
                              wa.sendStatus === 'SENT'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : wa.sendStatus === 'REQUIRES_CONFIGURATION'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}
                          >
                            {wa.sendStatus}
                          </span>
                        </div>

                        <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                          {wa.content}
                        </div>

                        {wa.isManualFallback && (
                          <div className="flex justify-end gap-2 pt-1">
                            <a
                              href={generateManualWhatsAppUrl(wa.recipient, wa.content)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Open in WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Call Records */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span>Call Actions & Outcomes ({emergency.callLogs.length})</span>
                </h4>

                {emergency.callLogs.length === 0 ? (
                  <p className="text-slate-500 italic text-xs">No calls logged for this event.</p>
                ) : (
                  <div className="space-y-2">
                    {emergency.callLogs.map((c) => (
                      <div key={c.id} className="bg-slate-800 p-3 rounded-2xl border border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white">Call: {c.targetName} ({c.targetNumber})</span>
                          <span className="font-mono text-slate-400">
                            {new Date(c.initiatedAt).toLocaleDateString('en-ZA')} {new Date(c.initiatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-300">
                            Outcome: <strong>{c.outcome || 'Pending outcome...'}</strong>
                          </span>
                          {c.notes && <span className="text-slate-400 italic text-[11px]">{c.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: COMMUNITY ASSISTANCE */}
          {activeTab === 'COMMUNITY' && (
            <div className="space-y-4">
              {!linkedAssistanceRequest ? (
                <div className="bg-slate-800/90 border border-blue-500/40 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                        <Radio className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white">{t.communityResponse.dispatchAssistance}</h3>
                        <p className="text-[11px] text-slate-400">
                          {t.communityResponse.notDispatchedDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleDispatchCommunityAssistance} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        {t.communityResponse.publicTitleLabel}:
                      </label>
                      <input
                        type="text"
                        required
                        value={assistPublicTitle}
                        onChange={(e) => setAssistPublicTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                        {t.communityResponse.publicMessageLabel}:
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={assistPublicMessage}
                        onChange={(e) => setAssistPublicMessage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                          {t.communityResponse.targetStrategyLabel}:
                        </label>
                        <select
                          value={assistFilterType}
                          onChange={(e) => setAssistFilterType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                        >
                          <option value="nearby_responders">{t.communityResponse.nearbyRadiusOption}</option>
                          <option value="specific_groups">{t.communityResponse.specificGroupsOption}</option>
                        </select>
                      </div>

                      {assistFilterType === 'nearby_responders' ? (
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                            {t.communityResponse.radiusKmLabel}: <span className="text-blue-400 font-mono font-bold">{assistRadiusKm} km</span>
                          </label>
                          <input
                            type="range"
                            min="2"
                            max="50"
                            step="1"
                            value={assistRadiusKm}
                            onChange={(e) => setAssistRadiusKm(Number(e.target.value))}
                            className="w-full accent-blue-500"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                            {t.communityResponse.selectGroupsLabel}:
                          </label>
                          <select
                            multiple
                            value={assistSelectedGroups}
                            onChange={(e) =>
                              setAssistSelectedGroups(
                                Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)
                              )
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-1.5 text-white text-xs max-h-20"
                          >
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name} ({g.groupType})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700/80 space-y-2">
                      <span className="text-amber-400 font-bold text-[11px] block">
                        {t.communityResponse.stagingPointTitle}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Staging Point Location / Name"
                          value={assistStagingName}
                          onChange={(e) => setAssistStagingName(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Coordinator Contact Person & Phone"
                          value={assistStagingContact}
                          onChange={(e) => setAssistStagingContact(e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Specific instructions on scene / safety protocols"
                        value={assistStagingInstructions}
                        onChange={(e) => setAssistStagingInstructions(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isSubmittingAssist}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-xs transition"
                      >
                        <Radio className="w-4 h-4" />
                        <span>{isSubmittingAssist ? 'Dispatshing...' : t.communityResponse.broadcastAssistanceBtn}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Live Request Card */}
                  <div className="bg-slate-800/90 border border-blue-500/50 rounded-3xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            linkedAssistanceRequest.status === 'ALL_CLEAR'
                              ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600'
                              : linkedAssistanceRequest.status === 'DISPATCHED'
                              ? 'bg-blue-900/80 text-blue-300 border border-blue-600'
                              : 'bg-amber-900/80 text-amber-300 border border-amber-600'
                          }`}>
                            Status: {linkedAssistanceRequest.status}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {t.communityResponse.escalationRound}: {linkedAssistanceRequest.escalationRound} (Radius: {linkedAssistanceRequest.targetFilter.radiusKm || 15}km)
                          </span>
                        </div>
                        <h3 className="font-black text-sm text-white mt-1">
                          {linkedAssistanceRequest.publicTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {linkedAssistanceRequest.status !== 'ALL_CLEAR' && (
                          <>
                            <button
                              onClick={handleEscalateAssistance}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-[11px] shadow flex items-center gap-1 transition"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>{t.communityResponse.escalateRadiusBtn} (+10km)</span>
                            </button>
                            <button
                              onClick={handleSendAllClear}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[11px] shadow flex items-center gap-1 transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t.communityResponse.sendAllClearBtn}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-slate-900 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.communityResponse.statusCanAssist}</span>
                        <span className="text-blue-400 font-mono text-base font-black">
                          {linkedAssistanceRequest.responders.filter((r) => r.status === 'CAN_ASSIST').length}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.communityResponse.statusResponding}</span>
                        <span className="text-amber-400 font-mono text-base font-black">
                          {linkedAssistanceRequest.responders.filter((r) => r.status === 'RESPONDING').length}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.communityResponse.statusOnScene}</span>
                        <span className="text-emerald-400 font-mono text-base font-black">
                          {linkedAssistanceRequest.responders.filter((r) => r.status === 'ON_SCENE').length}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl text-center">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.communityResponse.statusUnable}</span>
                        <span className="text-slate-500 font-mono text-base font-black">
                          {linkedAssistanceRequest.responders.filter((r) => r.status === 'UNABLE').length}
                        </span>
                      </div>
                    </div>

                    {linkedAssistanceRequest.stagingPoint && (
                      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-700/60 text-[11px] space-y-1">
                        <span className="text-amber-400 font-bold block">{t.communityResponse.stagingPointTitle}:</span>
                        <span className="text-white font-semibold">{linkedAssistanceRequest.stagingPoint.name}</span>
                        <p className="text-slate-400">{linkedAssistanceRequest.stagingPoint.instructions}</p>
                        {linkedAssistanceRequest.stagingPoint.contactPerson && (
                          <p className="text-slate-300">
                            <strong>{t.communityResponse.coordinator}:</strong> {linkedAssistanceRequest.stagingPoint.contactPerson}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Responders List Table */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                        {t.communityResponse.respondersList} ({linkedAssistanceRequest.responders.length})
                      </h4>
                    </div>

                    {linkedAssistanceRequest.responders.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-4">
                        {t.communityResponse.noRespondersYet}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {linkedAssistanceRequest.responders.map((resp) => (
                          <div
                            key={resp.responderUid}
                            className="bg-slate-900 p-3 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">{resp.responderName}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  resp.status === 'ON_SCENE'
                                    ? 'bg-emerald-900 text-emerald-300'
                                    : resp.status === 'RESPONDING'
                                    ? 'bg-amber-900 text-amber-300'
                                    : resp.status === 'CAN_ASSIST'
                                    ? 'bg-blue-900 text-blue-300'
                                    : resp.status === 'UNABLE'
                                    ? 'bg-red-950 text-red-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {resp.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{resp.responderPhone}</span>
                                {resp.farmOrArea && <span>• {resp.farmOrArea}</span>}
                                {resp.distanceKm !== undefined && (
                                  <span className="font-mono text-emerald-400 font-bold">
                                    • {resp.distanceKm.toFixed(1)} km away
                                  </span>
                                )}
                              </div>
                              {resp.assignedRole && (
                                <div className="mt-1 text-[11px] bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-semibold inline-block">
                                  {t.communityResponse.assignedRoleLabel}: {resp.assignedRole}
                                </div>
                              )}
                              {resp.etaMinutes && (
                                <span className="text-[11px] text-amber-300 ml-2 font-mono">
                                  ETA: ~{resp.etaMinutes} min
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-center">
                              <button
                                onClick={() => {
                                  setAssigningResponderUid(resp.userUid || resp.responderUid || '');
                                  setAssignedRoleInput(resp.assignedRole || '');
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-600"
                              >
                                {t.communityResponse.assignRoleBtn}
                              </button>
                              <button
                                onClick={() => handleStandDownResponder(resp.userUid || resp.responderUid || '')}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 rounded-lg text-[11px] font-bold border border-red-900/60"
                              >
                                {t.communityResponse.standDownBtn}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* OPERATIONAL CONTROL ROOM ACTION BUTTONS */}
        {!isClosed && (
          <div className="bg-slate-850 p-3.5 border-t border-slate-800 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* Action 1: ACKNOWLEDGE */}
              <button
                disabled={isAcknowledged}
                onClick={handleAcknowledge}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  isAcknowledged
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
              </button>

              {/* Action 2: NOTIFY REACTION FORCE */}
              <button
                onClick={() => setIsReactionModalOpen(true)}
                className="p-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Radio className="w-4 h-4" />
                <span>Reaction Force</span>
              </button>

              {/* Action 3: CALL POLICE */}
              <button
                onClick={() => handleStartCall('POLICE')}
                className="p-2.5 rounded-xl font-bold text-xs bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Shield className="w-4 h-4" />
                <span>Call Police</span>
              </button>

              {/* Action 4: CALL AMBULANCE */}
              <button
                onClick={() => handleStartCall('AMBULANCE')}
                className="p-2.5 rounded-xl font-bold text-xs bg-teal-700 hover:bg-teal-600 text-white flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <HeartPulse className="w-4 h-4" />
                <span>Call Ambulance</span>
              </button>

              {/* Action 5: NOTIFY MANAGEMENT */}
              <button
                onClick={() => notifyManagement(emergency.id)}
                className="p-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <Users className="w-4 h-4" />
                <span>Notify Mgmt</span>
              </button>

              {/* Action 6: MARK SAFE / RESOLVE */}
              <button
                onClick={() => {
                  setIsFalseAlarm(false);
                  setIsResolveModalOpen(true);
                }}
                className="p-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Safe / Resolve</span>
              </button>
            </div>

            {/* Sub-actions row: Broadcast Alert, Stand down / False Alarm & Link Case */}
            <div className="flex flex-wrap justify-between items-center pt-1 px-1 gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAlertModalOpen(true)}
                  className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Broadcast Community Alert</span>
                </button>
                <button
                  onClick={() => {
                    setIsFalseAlarm(true);
                    setIsResolveModalOpen(true);
                  }}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Record False Alarm</span>
                </button>
              </div>
              <button
                onClick={() => setIsLinkCaseModalOpen(true)}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link to Existing Open Case</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: DISPATCH REACTION FORCE WHATSAPP (2 Options: Commander / All Personnel) */}
      <DispatchReactionForceWhatsAppModal
        isOpen={isReactionModalOpen}
        onClose={() => setIsReactionModalOpen(false)}
        emergency={emergency}
      />

      {/* MODAL: CALL OUTCOME LOGGER (Requirement 13) */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-500/60 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                <span>Record Call Outcome: {activeCallType}</span>
              </h3>
              <button onClick={() => setIsCallModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Dispatch Outcome:</label>
              <select
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value as CallOutcomeType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
              >
                <option value="DISPATCH_CONFIRMED">DISPATCH CONFIRMED (Vehicle En Route)</option>
                <option value="CONTACTED">CONTACTED (Information Logged)</option>
                <option value="NO_ANSWER">NO ANSWER / ENGAGED</option>
                <option value="LINE_BUSY">LINE BUSY</option>
                <option value="REFUSED">UNABLE TO ASSIST</option>
                <option value="NOT_REQUIRED">STANDBY / NOT REQUIRED</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Outcome Notes / OB Number:</label>
              <input
                type="text"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="e.g. Sgt. Van Zyl took details, SAPS patrol vehicle 04 dispatched, OB 124/08/2026"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCallModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveCallOutcome}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg"
              >
                Save Outcome
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST COMMUNITY ALERT (Requirement 14 - Safe version) */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/60 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Broadcast Safe Community Alert</span>
              </h3>
              <button onClick={() => setIsAlertModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-amber-300 flex items-center gap-2">
              <EyeOff className="w-4 h-4 flex-shrink-0" />
              <span>Gate codes, medical aid details, and private notes are automatically excluded from public alerts.</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Alert Headline:</label>
              <input
                type="text"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Public Notice Text:</label>
              <textarea
                rows={3}
                value={alertDesc}
                onChange={(e) => setAlertDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority:</label>
                <select
                  value={alertPriority}
                  onChange={(e) => setAlertPriority(e.target.value as AlertPriority)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Distribution:</label>
                <select
                  value={alertDistribution}
                  onChange={(e) => setAlertDistribution(e.target.value as 'all' | 'groups')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs"
                >
                  <option value="all">Entire District (All Clients)</option>
                  <option value="groups">Sector Group Only</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleCreateCommunityAlert}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg"
              >
                Broadcast Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CASE FROM EMERGENCY (Requirement 15) */}
      {isCreateCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-500/60 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                <FolderPlus className="w-4 h-4" />
                <span>Create Case from Emergency</span>
              </h3>
              <button onClick={() => setIsCreateCaseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Member Owner / Victim Info Notice */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="text-emerald-300 font-semibold block">
                  Linked Member / Victim: {emergency.clientName}
                </span>
                <span className="text-slate-400 text-[10px]">
                  {emergency.farmName} • This case will automatically appear on the member's personal Client Cases app.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Case Title:</label>
              <input
                type="text"
                value={newCaseTitle}
                onChange={(e) => setNewCaseTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category:</label>
              <select
                value={newCaseCategory}
                onChange={(e) => setNewCaseCategory(e.target.value as IncidentCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs"
              >
                <option value="suspicious_activity">Suspicious Activity / Scouting</option>
                <option value="theft">Theft / Break-in</option>
                <option value="fence_damage">Fence Damage / Boundary Breach</option>
                <option value="poaching">Stock Theft / Poaching</option>
                <option value="trespassing">Trespassing</option>
                <option value="other">Other Incident</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Investigation Description:</label>
              <textarea
                rows={3}
                value={newCaseDesc}
                onChange={(e) => setNewCaseDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreateCaseModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleCreateNewCase}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg"
              >
                Create & Link Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LINK EXISTING CASE */}
      {isLinkCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Link to Existing Open Case</h3>
              <button onClick={() => setIsLinkCaseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Open Case:</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
              >
                <option value="">-- Choose Case --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber}: {c.title} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsLinkCaseModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={!selectedCaseId}
                onClick={handleLinkExistingCase}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
              >
                Link Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE EMERGENCY / FALSE ALARM WITH AUTO-TICKED CREATE CASE */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`bg-slate-900 border rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-xs text-white ${
            isFalseAlarm ? 'border-amber-500/80 shadow-amber-950/40' : 'border-emerald-500/60 shadow-emerald-950/40'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${
                isFalseAlarm ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {isFalseAlarm ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isFalseAlarm ? 'Record False Alarm & Resolve' : 'Mark Safe & Resolve Emergency'}</span>
              </h3>
              <button onClick={() => setIsResolveModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Classification Checkboxes: Create Case & False Alarm */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                  Resolution Options:
                </span>
                
                {/* Auto-ticked Create Case */}
                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg bg-blue-950/30 border border-blue-800/40 hover:bg-blue-950/50 transition">
                  <input
                    type="checkbox"
                    checked={caseCreated}
                    onChange={(e) => setCaseCreated(e.target.checked)}
                    className="mt-0.5 rounded accent-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-blue-300">
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Create & Link Incident Case</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono font-normal uppercase">
                        Auto-Ticked
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Automatically generates and links an official investigation dossier for this incident.
                    </p>
                  </div>
                </label>

                {/* False Alarm Option */}
                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 hover:bg-amber-950/50 transition">
                  <input
                    type="checkbox"
                    checked={isFalseAlarm}
                    onChange={(e) => setIsFalseAlarm(e.target.checked)}
                    className="mt-0.5 rounded accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>False Alarm (Vals Alarm)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Check if this emergency was an accidental trigger, drill, or no actual danger occurred.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isFalseAlarm ? 'False Alarm Explanation / Notes:' : 'Resolution Summary / Notes:'}
                </label>
                <textarea
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder={
                    isFalseAlarm
                      ? 'e.g. Accidental panic button press during routine maintenance, verified client safe via phone.'
                      : 'e.g. Reaction unit arrived on scene at 21:48, perimeter inspected, all gates secure, client safe.'
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                />
              </div>

              {!isFalseAlarm && (
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                    Involved Responders & Outcomes Checklist:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reactionInvolved}
                        onChange={(e) => setReactionInvolved(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>Reaction Force Dispatched</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policeInvolved}
                        onChange={(e) => setPoliceInvolved(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>SAPS Police Attended</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ambulanceInvolved}
                        onChange={(e) => setAmbulanceInvolved(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>Ambulance / EMS Attended</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={followUpRequired}
                        onChange={(e) => setFollowUpRequired(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>Follow-up Investigation Needed</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className={`px-5 py-2 text-white font-bold rounded-xl shadow-lg transition ${
                  isFalseAlarm
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isFalseAlarm ? 'Confirm False Alarm & Resolve' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FALSE ALARM (Requirement 16) */}
      {isFalseAlarmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/60 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Record False Alarm</span>
              </h3>
              <button onClick={() => setIsFalseAlarmModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason for False Alarm / Cancellation:</label>
              <textarea
                rows={3}
                required
                value={falseAlarmReason}
                onChange={(e) => setFalseAlarmReason(e.target.value)}
                placeholder="e.g. Accidental button trigger on phone, verified by client over direct phone call."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsFalseAlarmModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={!falseAlarmReason.trim()}
                onClick={handleConfirmFalseAlarm}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg disabled:opacity-50"
              >
                Confirm False Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN RESPONDER ROLE */}
      {assigningResponderUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-blue-500/60 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                <Radio className="w-4 h-4" />
                <span>{t.communityResponse.assignRoleBtn}</span>
              </h3>
              <button onClick={() => setAssigningResponderUid(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.communityResponse.assignedRoleLabel} / Taak Toewysing:
              </label>
              <input
                type="text"
                value={assignedRoleInput}
                onChange={(e) => setAssignedRoleInput(e.target.value)}
                placeholder="e.g. Sektor 2 Hek Wag, Noorde Observasie, Waterwa bystand..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAssigningResponderUid(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
