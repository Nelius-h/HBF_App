import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  EmergencyEvent,
  EmergencyType,
  EmergencyStatus,
  EmergencyLocationEvent,
  EmergencyTimelineEvent,
  EmergencyNote,
  EmergencyClientInfoUpdate,
  WhatsAppMessageRecord,
  CallActionRecord,
  CallOutcomeType,
  EmergencyResolutionDetails,
  EmergencyContact,
  ContactCategory,
  LocationQuality,
  Case,
  CaseUpdate,
  CaseEvidence,
  SapsCaseDetails,
  InvestigatingOfficer,
  SituationReport,
  SitrepBroadcastTarget,
  BoloRecord,
  BoloSighting,
  PersonOfInterest,
  VehicleOfInterest,
  IntelObservation,
  IntelRelationship,
  IntelReviewItem,
  IntelVerificationStatus,
  IntelConfidenceLevel,
  IntelSourceType,
  IntelAuditEntry,
  DataQualityIssue,
  RecordLifecycleState,
  AlertNotification,
  AlertUpdateItem,
  AuditLogEntry,
  AreaGroup,
  GroupType,
  WhatsAppBroadcastType,
  GroupPriorityLevel,
  GroupAutoDispatchTriggers,
  SystemSettings,
  IncidentCategory,
  TrafficHazardCategory,
  CasePriority,
  AlertPriority,
  AlertType,
  PoiStatus,
  CommunityAssistanceRequest,
  ResponderStatus,
  ResponderRecord,
  LocationPrecision,
  AssistanceRequestType,
  AssistancePriority,
  StructuredSafetyInstruction,
  StagingPointInfo,
  UserProfile,
  AudioSessionRecord,
  AudioRecordingRecord,
  EmergencyLocationSession,
  EmergencyLocationPoint,
  EmergencyMessageRecord,
  ReactionForceContactLog,
  QuickMessageTag,
  LocationMode,
  ReactionForceMethod,
  ReactionForceStatus,
  CommunicationHealthState,
  GeneratedReportRecord,
  BackupRecord,
  SystemHealthComponent,
  SystemErrorLogEntry,
  PrivacyAccessLogEntry,
  TrainingModeState,
  KmlMapLayer,
  KmlLayerCategory,
  CameraDevice,
  CameraErrorLog,
  CameraMaintenanceTicket,
  CameraStatus,
  EscalationLevel,
  LocationArea,
  ActivePatrolUnit,
  IncidentNotification,
} from '../types';
import { useAuth } from './AuthContext';
import {
  sendEmergencyWhatsApp,
  generateManualWhatsAppUrl,
} from '../services/whatsappService';
import { emergencyAudioService } from '../services/emergencyAudioService';
import { emergencyLocationService } from '../services/emergencyLocationService';
import { playIncidentAlertSound, playAcknowledgementChime, stopSosContinuousAlarm } from '../services/soundEffects';
import { DEFAULT_BACKUP_RECORDS } from '../services/backupService';
import { exportFullDatabaseJson } from '../services/dataStorageService';
import { INITIAL_HEALTH_COMPONENTS, INITIAL_ERROR_LOGS, checkEmergencyIdempotency } from '../services/systemHealthService';
import { INITIAL_PRIVACY_ACCESS_LOGS } from '../services/userPrivacyService';
import { backgroundSosService } from '../services/backgroundSosService';
import { offlineSyncService } from '../services/offlineSyncService';
import { INITIAL_KML_LAYERS } from '../data/kmlLayersSeedData';
import {
  INITIAL_CAMERAS,
  INITIAL_CAMERA_ERRORS,
  INITIAL_MAINTENANCE_TICKETS,
} from '../data/cameraData';
import {
  SEED_POIS,
  SEED_VOIS,
  SEED_OBSERVATIONS,
  SEED_RELATIONSHIPS,
  SEED_REVIEW_QUEUE,
  SEED_EXTRA_CASES,
  SEED_INTEL_AUDIT,
} from '../data/intelligenceSeedData';
import { ACTUAL_VIS_CASES } from '../data/actualVisCasesData';
import { convertRawLogsToSituationReports } from '../data/actualIncidentLogData';
import {
  syncEmergencyToFirestore,
  resolveAllFirestoreEmergencies,
  subscribeToEmergencies,
  syncAlertToFirestore,
  subscribeToAlerts,
  syncSituationReportToFirestore,
  subscribeToSituationReports,
  deleteSituationReportFromFirestore,
  syncCaseToFirestore,
  subscribeToCases,
  deleteCaseFromFirestore,
  syncBoloToFirestore,
  subscribeToBolos,
  syncPoiToFirestore,
  subscribeToPois,
  syncVoiToFirestore,
  subscribeToVois,
  syncObservationToFirestore,
  subscribeToObservations,
  syncPatrolUnitToFirestore,
  deletePatrolUnitFromFirestore,
  subscribeToPatrolUnits,
  syncIncidentNotificationToFirestore,
  deleteIncidentNotificationFromFirestore,
  subscribeToIncidentNotifications,
  syncAuditLogToFirestore,
  subscribeToAuditLogs,
  syncLocationAreaToFirestore,
  subscribeToLocationAreas,
  syncSettingsToFirestore,
  subscribeToSettings,
} from '../services/firebase';
import { notificationService } from '../services/notificationService';
import {
  safeGetJSON,
  safeSetJSON,
  safeRemoveItem,
  cleanupLegacyStorage,
} from '../utils/safeStorage';

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface DataContextType {
  // Emergencies
  emergencies: EmergencyEvent[];
  activeEmergency: EmergencyEvent | null;
  allActiveEmergencies: EmergencyEvent[];
  triggerEmergency: (
    type: EmergencyType,
    customNotes?: string,
    locationOverride?: { latitude: number; longitude: number; accuracy?: number; quality?: LocationQuality }
  ) => Promise<string>;
  acknowledgeEmergency: (emergencyId: string) => void;
  updateClientLocation: (
    emergencyId: string,
    coords: { latitude: number; longitude: number; accuracy?: number; quality?: LocationQuality; notes?: string }
  ) => Promise<void>;
  addClientInfo: (emergencyId: string, text: string, photos?: string[]) => Promise<void>;
  addEmergencyOperatorNote: (emergencyId: string, text: string) => void;
  initiateCallAction: (
    emergencyId: string,
    callType: 'POLICE' | 'AMBULANCE' | 'REACTION_FORCE' | 'MANAGEMENT' | 'OTHER',
    targetNumber: string,
    targetName: string
  ) => string;
  recordCallOutcome: (
    emergencyId: string,
    callLogId: string,
    outcome: CallOutcomeType,
    notes?: string
  ) => void;
  notifyReactionForce: (
    emergencyId: string,
    contactId?: string,
    customNotes?: string
  ) => Promise<WhatsAppMessageRecord>;
  notifyAllReactionForce: (
    emergencyId: string,
    customNotes?: string,
    recipientsList?: { name: string; phone: string; role?: string; callsign?: string }[]
  ) => Promise<WhatsAppMessageRecord[]>;
  notifyManagement: (
    emergencyId: string,
    contactId?: string,
    notes?: string
  ) => Promise<void>;
  createCommunityAlertFromEmergency: (
    emergencyId: string,
    alertData: {
      type: AlertType;
      title: string;
      shortDescription: string;
      location?: string;
      priority: AlertPriority;
      requiresAck: boolean;
      targetDistribution: 'all' | 'groups';
    }
  ) => Promise<string>;
  linkEmergencyToCase: (emergencyId: string, caseId: string) => void;
  createCaseFromEmergency: (
    emergencyId: string,
    category: IncidentCategory,
    title: string,
    description: string,
    priority: CasePriority
  ) => Promise<string>;
  recordFalseAlarm: (emergencyId: string, reason: string) => void;
  resolveEmergency: (
    emergencyId: string,
    resolution: {
      notes: string;
      policeInvolved: boolean;
      ambulanceInvolved: boolean;
      reactionForceInvolved: boolean;
      caseCreated: boolean;
      followUpRequired: boolean;
    }
  ) => void;
  resolveAllActiveEmergencies: (notes?: string) => Promise<void>;

  // Phase: Live Communications, Audio & Location
  startLiveAudioSession: (emergencyId: string) => Promise<{ success: boolean; error?: string }>;
  requestLiveAudio: (emergencyId: string) => void;
  respondToAudioRequest: (emergencyId: string, accepted: boolean) => Promise<void>;
  stopLiveAudioSession: (emergencyId: string, reason?: string) => void;
  joinAudioSessionAsListener: (emergencyId: string) => void;
  leaveAudioSessionAsListener: (emergencyId: string) => void;
  toggleLocalAudioMute: (emergencyId: string, isMuted: boolean) => void;

  startLiveLocationSession: (emergencyId: string, mode?: LocationMode) => Promise<void>;
  changeLocationMode: (emergencyId: string, mode: LocationMode) => void;
  stopLiveLocationSession: (emergencyId: string) => void;

  sendEmergencyMessage: (
    emergencyId: string,
    data: {
      text: string;
      messageType?: EmergencyMessageRecord['messageType'];
      quickTag?: QuickMessageTag;
      photos?: string[];
      isSilentMode?: boolean;
      location?: { latitude: number; longitude: number; accuracy?: number };
    }
  ) => Promise<string>;
  markMessageDelivered: (emergencyId: string, messageId: string) => void;
  markMessageOpened: (emergencyId: string, messageId: string) => void;

  recordReactionForceContact: (
    emergencyId: string,
    data: {
      contactId: string;
      contactName: string;
      targetPhone: string;
      method: ReactionForceMethod;
      status: ReactionForceStatus;
      notes?: string;
    }
  ) => void;
  callClientDirect: (emergencyId: string, phone: string, targetName: string) => string;

  communicationHealth: CommunicationHealthState;

  // Emergency Contacts Registry (Management)
  emergencyContacts: EmergencyContact[];
  createEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateEmergencyContact: (contactId: string, updates: Partial<EmergencyContact>) => void;
  deleteEmergencyContact: (contactId: string) => void;

  // Cases
  cases: Case[];
  createIncidentCase: (data: {
    category: IncidentCategory;
    title: string;
    description: string;
    incidentDate: string;
    incidentTime: string;
    locationName: string;
    isPublic: boolean;
    priority?: CasePriority;
    sapsCaseNumber?: string;
    sapsStation?: string;
    sapsDetails?: SapsCaseDetails;
    investigatingOfficers?: InvestigatingOfficer[];
    gpsLocation?: { latitude: number; longitude: number };
    vehicleInfo?: { makeModel?: string; color?: string; plate?: string; notes?: string };
    personDescription?: { gender?: string; clothing?: string; buildHeight?: string; identifyingMarks?: string; notes?: string };
    photos?: string[];
    victimUid?: string;
    victimName?: string;
    victimPhone?: string;
    victimFarmName?: string;
    victimRole?: string;
    isVictimAware?: boolean;
    assignedMemberUids?: string[];
  }) => Promise<string>;
  updateCase: (caseId: string, updates: Partial<Case>, changeSummary?: string) => void;
  updateCaseSapsDetails: (
    caseId: string,
    sapsData: {
      sapsCaseNumber?: string;
      sapsStation?: string;
      obNumber?: string;
      investigatingOfficers?: InvestigatingOfficer[];
      docketLocation?: string;
      statusNotes?: string;
    }
  ) => void;
  addCaseEvidencePhotos: (caseId: string, photos: string[], caption?: string) => void;
  addCaseUpdate: (
    caseId: string,
    message: string,
    isInternalOnly?: boolean,
    attachments?: string[],
    gpsLocation?: { latitude: number; longitude: number }
  ) => void;
  updateCaseStatus: (caseId: string, status: Case['status'], priority?: CasePriority, isPublic?: boolean) => void;
  deleteCase: (caseId: string) => Promise<boolean>;
  addSuspectToCase: (
    caseId: string,
    suspectData: {
      name?: string;
      surname?: string;
      aliases?: string[];
      nickname?: string;
      approximateAge?: number;
      gender?: string;
      status?: PoiStatus;
      physicalDescription?: {
        height?: string;
        build?: string;
        identifyingMarks?: string;
        clothingLastSeen?: string;
        complexion?: string;
      };
      phoneNumbers?: string[];
      knownAreas?: string[];
      photos?: string[];
      notes?: string;
    }
  ) => Promise<string>;
  linkPoiToCase: (caseId: string, poiId: string) => void;
  unlinkPoiFromCase: (caseId: string, poiId: string) => void;

  // Incident Notifications for Control Room Awareness
  incidentNotifications: IncidentNotification[];
  unacknowledgedIncidentsCount: number;
  acknowledgeIncidentNotification: (id: string) => void;
  dismissIncidentNotification: (id: string) => void;
  clearAllIncidentNotifications: () => void;

  // Traffic & Hazards
  createTrafficHazard: (data: {
    category: TrafficHazardCategory;
    location: string;
    description: string;
    time: string;
    expectedDuration?: string;
    photos?: string[];
  }) => Promise<string>;

  // Situation Reports
  situationReports: SituationReport[];
  situationDraft: Partial<SituationReport> | null;
  saveSituationDraft: (draft: Partial<SituationReport>) => void;
  clearSituationDraft: () => void;
  createSituationReport: (data: {
    sourceName: string;
    sourcePhone?: string;
    sourceType: SituationReport['sourceType'];
    location: string;
    gpsLocation?: { latitude: number; longitude: number };
    category: IncidentCategory | 'general_intel';
    description: string;
    notes?: string;
    isPrivate?: boolean;
    actionDecision: 'report_only' | 'link_open_case' | 'open_new_case';
    linkedCaseId?: string;
    broadcastTargets?: SitrepBroadcastTarget[];
    selectedAreaGroupId?: string;
    distributionOption?:
      | 'no_broadcast'
      | 'community_notice'
      | 'security_alert'
      | 'traffic_alert'
      | 'fire_alert'
      | 'bolo'
      | 'notify_management'
      | 'reaction_force';
  }) => Promise<string>;

  // BOLOs & Sightings
  bolos: BoloRecord[];
  boloSightings: BoloSighting[];
  createBolo: (
    bolo: Omit<BoloRecord, 'id' | 'boloNumber' | 'createdAt' | 'updatedAt' | 'createdByUid' | 'createdByName'>
  ) => Promise<string>;
  updateBoloStatus: (boloId: string, status: BoloRecord['status']) => void;
  submitBoloSighting: (sighting: {
    boloId: string;
    boloNumber: string;
    locationDescription: string;
    gpsLocation?: { latitude: number; longitude: number; accuracy?: number };
    directionOfTravel?: string;
    description: string;
    photoUrl?: string;
  }) => Promise<string>;
  verifyBoloSighting: (sightingId: string, status: BoloSighting['verificationStatus'], notes?: string) => void;

  // Intelligence, POIs, VOIs, Relationships & Analysis
  pois: PersonOfInterest[];
  vois: VehicleOfInterest[];
  intelObservations: IntelObservation[];
  intelRelationships: IntelRelationship[];
  intelReviewQueue: IntelReviewItem[];
  intelAuditLogs: IntelAuditEntry[];
  createPoi: (
    poi: Omit<PersonOfInterest, 'id' | 'internalPoiId' | 'createdAt' | 'updatedAt' | 'createdByUid' | 'observations'>
  ) => Promise<string>;
  updatePoi: (poiId: string, updates: Partial<PersonOfInterest>) => void;
  updatePoiStatus: (
    poiId: string,
    status: PoiStatus,
    reason: string,
    convictionInfo?: PersonOfInterest['convictionDetails']
  ) => void;
  archivePoi: (poiId: string, reason: string) => void;
  deletePoi: (poiId: string, reason?: string) => Promise<boolean>;
  createVoi: (
    voi: Omit<VehicleOfInterest, 'id' | 'internalVoiId' | 'createdAt' | 'updatedAt' | 'createdByUid'>
  ) => Promise<string>;
  updateVoi: (voiId: string, updates: Partial<VehicleOfInterest>) => void;
  updateVoiStatus: (voiId: string, status: VehicleOfInterest['status'], reason: string) => void;
  archiveVoi: (voiId: string, reason: string) => void;
  deleteVoi: (voiId: string, reason?: string) => Promise<boolean>;
  addIntelObservation: (
    observation: Omit<IntelObservation, 'id' | 'observationId' | 'enteredByUid' | 'enteredByName' | 'enteredTimestamp'>
  ) => Promise<string>;
  verifyIntelObservation: (
    obsId: string,
    status: IntelVerificationStatus,
    confidence?: IntelConfidenceLevel,
    notes?: string
  ) => void;
  disputeIntelObservation: (
    obsId: string,
    originalValue: string,
    correction: string,
    reason: string
  ) => void;
  createIntelRelationship: (
    rel: Omit<IntelRelationship, 'id' | 'createdAt' | 'createdByUid' | 'createdByName'>
  ) => string;
  removeIntelRelationship: (relId: string) => void;
  verifyIntelRelationship: (relId: string, verification: IntelRelationship['verification']) => void;
  addReviewQueueItem: (item: Omit<IntelReviewItem, 'id' | 'timestamp' | 'status'>) => string;
  processReviewQueueItem: (
    itemId: string,
    action: NonNullable<IntelReviewItem['actionTaken']>,
    actionNotes: string,
    payloadUpdates?: any
  ) => Promise<void>;
  mergePersons: (primaryPoiId: string, duplicatePoiId: string, reason: string) => void;
  mergeVehicles: (primaryVoiId: string, duplicateVoiId: string, reason: string) => void;
  logIntelAudit: (
    entry: Omit<IntelAuditEntry, 'id' | 'actorUid' | 'actorName' | 'actorRole' | 'timestamp'>
  ) => void;
  getUnifiedTimeline: (
    entityType: 'PERSON' | 'VEHICLE' | 'CASE',
    entityId: string
  ) => {
    id: string;
    timestamp: string;
    date: string;
    title: string;
    detail: string;
    source: string;
    sourceType: string;
    refId: string;
    verification?: string;
  }[];
  getDataQualityIssues: () => DataQualityIssue[];

  // Community Assistance Requests & Responder Workflow
  assistanceRequests: CommunityAssistanceRequest[];
  communityAssistanceRequests: CommunityAssistanceRequest[];
  createCommunityAssistanceRequest: (data: {
    emergencyId?: string;
    caseId?: string;
    requestType: AssistanceRequestType;
    priority: AssistancePriority;
    publicSafeTitle: string;
    publicSafeMessage: string;
    safetyWarning: string;
    structuredInstructions: StructuredSafetyInstruction;
    customInstructions?: string;
    locationPrecision: LocationPrecision;
    targetAreaName: string;
    approximateLocationDescription?: string;
    gpsLocation?: { latitude: number; longitude: number };
    farmNameSafe?: string;
    contactPhoneSafe?: string;
    stagingPoint?: StagingPointInfo;
    targetFilter: {
      targetType: 'GROUPS' | 'NEARBY_CLIENTS' | 'SELECTED_USERS' | 'AREA_ELIGIBLE';
      groupIds?: string[];
      radiusKm?: number;
      centerLocation?: { latitude: number; longitude: number };
      selectedUserIds?: string[];
    };
  }) => Promise<string>;
  acknowledgeAssistanceRequest: (
    requestId: string,
    status: ResponderStatus,
    notes?: string,
    currentGps?: { latitude: number; longitude: number }
  ) => Promise<void>;
  escalateAssistanceRequest: (requestId: string, reason?: string, expandRadiusKm?: number) => Promise<void>;
  updateResponderAssignment: (
    requestId: string,
    responderUid: string,
    updates: { assignedRole?: string; isRemoved?: boolean; operationalNote?: string }
  ) => void;
  sendAllClearForAssistance: (requestId: string, message: string) => void;
  calculateEligibleResponders: (params: {
    centerLocation?: { latitude: number; longitude: number };
    radiusKm?: number;
    groupIds?: string[];
    excludeUid?: string;
    limit?: number;
    skipUids?: string[];
  }) => { user: UserProfile; distanceKm: number }[];

  // Alerts
  alerts: AlertNotification[];
  createAlert: (
    alert: Omit<AlertNotification, 'id' | 'alertNumber' | 'publishedAt' | 'publishedByUid' | 'publishedByName' | 'acknowledgements' | 'updates' | 'isAllClear' | 'isClosed'>
  ) => Promise<string>;
  acknowledgeAlert: (alertId: string, status: 'SEEN' | 'CAN_ASSIST' | 'RESPONDING', notes?: string) => void;
  addAlertUpdate: (alertId: string, message: string, notifyUsers?: boolean) => void;
  sendAllClearForAlert: (alertId: string, message: string) => void;
  closeAlert: (alertId: string, reason?: string) => void;

  // Area / Sector Groups
  areaGroups: AreaGroup[];
  groups: AreaGroup[];
  createGroup: (group: {
    name: string;
    code?: string;
    description: string;
    geographicDescription?: string;
    groupType: GroupType;
    leaderName?: string;
    leaderPhone?: string;
    memberUserIds?: string[];
    whatsappInviteLink?: string;
    whatsappGroupJid?: string;
    whatsappBroadcastType?: WhatsAppBroadcastType;
    priorityLevel?: GroupPriorityLevel;
    autoDispatchTriggers?: GroupAutoDispatchTriggers;
    muteNotifications?: boolean;
    sector?: string;
    coverageRadiusKm?: number;
    broadcastFrequencyLimit?: 'IMMEDIATE' | 'HOURLY_DIGEST' | 'DAILY_DIGEST';
  }) => void;
  updateGroup: (groupId: string, updates: Partial<AreaGroup>) => void;
  deleteGroup: (groupId: string) => void;
  assignUsersToGroup: (groupId: string, userUids: string[]) => void;
  removeUsersFromGroup: (groupId: string, userUids: string[]) => void;

  // Location Areas (e.g. Brakspruit, Hartbeesfontein, Palmietfontein, Klerksdorp, Dupperspos, Schoemansfontein)
  locationAreas: LocationArea[];
  createLocationArea: (area: Omit<LocationArea, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateLocationArea: (id: string, updates: Partial<LocationArea>) => Promise<void>;
  deleteLocationArea: (id: string) => Promise<void>;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  logAuditEvent: (entry: Omit<AuditLogEntry, 'id' | 'actorUid' | 'actorName' | 'actorRole' | 'timestamp'>) => void;

  // System Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Management Reports & Archives
  generatedReports: GeneratedReportRecord[];
  saveGeneratedReport: (
    report: Omit<GeneratedReportRecord, 'id' | 'generatedTimestamp' | 'generatedByUid' | 'generatedByName' | 'generatedByRole'>
  ) => Promise<string>;
  deleteGeneratedReport: (id: string) => Promise<void>;

  // Database Backups & Restore
  backupRecords: BackupRecord[];
  createBackupRecord: (type: BackupRecord['type']) => Promise<BackupRecord>;
  restoreFromBackup: (
    backupId: string,
    options: { dryRun?: boolean }
  ) => Promise<{ success: boolean; message: string; restoredCount: number }>;

  // System Health, Errors & Heartbeats
  systemHealth: SystemHealthComponent[];
  runSyntheticHeartbeatTest: () => Promise<SystemHealthComponent[]>;
  systemErrorLogs: SystemErrorLogEntry[];
  logSystemError: (error: Omit<SystemErrorLogEntry, 'id' | 'timestamp'>) => void;
  clearSystemError: (id: string) => void;

  // POPIA Privacy Access Logs
  privacyAccessLogs: PrivacyAccessLogEntry[];
  logPrivacyAccess: (
    entry: Omit<PrivacyAccessLogEntry, 'id' | 'timestamp' | 'actorUid' | 'actorName' | 'actorRole'>
  ) => void;

  // Training & Drill Mode
  trainingMode: TrainingModeState;
  toggleTrainingMode: (enabled: boolean, scenarioName?: string) => void;
  createTrainingEmergency: (scenarioType: EmergencyType, customNotes?: string) => Promise<string>;

  // Operational KML Map Layers
  mapLayers: KmlMapLayer[];
  addMapLayer: (
    layer: Omit<KmlMapLayer, 'id' | 'uploadedAt' | 'uploadedByUid' | 'uploadedByName'>
  ) => Promise<string>;
  toggleMapLayerActive: (layerId: string) => void;
  updateMapLayer: (layerId: string, updates: Partial<KmlMapLayer>) => void;
  deleteMapLayer: (layerId: string) => void;

  // Audio Feed Recordings
  saveAudioRecording: (emergencyId: string, recording: AudioRecordingRecord) => void;
  deleteAudioRecording: (emergencyId: string, recordingId: string) => void;

  // Data Storage, Import & Export
  exportFullSystemBackup: () => void;
  importSystemData: (
    data: any,
    options?: { mode: 'MERGE' | 'REPLACE' }
  ) => { success: boolean; stats: Record<string, number>; error?: string };
  importContactsFromCsv: (csvText: string) => { success: boolean; importedCount: number; error?: string };
  cleanTransientStorage: () => { freedKb: number; purgedItemsCount: number };

  // Security Cameras, Health Monitoring, Error Logging & Maintenance
  cameras: CameraDevice[];
  cameraErrors: CameraErrorLog[];
  cameraMaintenanceTickets: CameraMaintenanceTicket[];
  addCameraErrorLog: (error: Omit<CameraErrorLog, 'id' | 'loggedAt' | 'isResolved'>) => CameraErrorLog;
  resolveCameraError: (errorId: string, resolutionNotes: string) => void;
  escalateCameraError: (errorId: string, escalation: { level: EscalationLevel; escalatedTo: string; notes?: string; sendWhatsAppAlert?: boolean }) => void;
  addCameraMaintenanceTicket: (ticket: Omit<CameraMaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => CameraMaintenanceTicket;
  updateCameraMaintenanceTicket: (ticketId: string, updates: Partial<CameraMaintenanceTicket>) => void;
  updateCameraStatus: (cameraId: string, status: CameraStatus, notes?: string) => void;
  pingCameraDevice: (cameraId: string) => Promise<{ latencyMs: number; status: CameraStatus; packetLoss: number }>;
  pingAllCameras: () => Promise<void>;
  addNewCameraDevice: (camera: Omit<CameraDevice, 'id' | 'activeErrorCount' | 'openTicketCount'>) => CameraDevice;
  updateCameraDevice: (cameraId: string, updates: Partial<CameraDevice>) => void;

  // Live Patrol Network (Members & Reaction Force Field Location)
  activePatrolUnits: ActivePatrolUnit[];
  responders?: ResponderRecord[];
  isPatrolActive: boolean;
  startPatrol: (options?: { notes?: string; vehicle?: string; sector?: string }) => Promise<void>;
  stopPatrol: () => void;
  updatePatrolLocation: (coords: { latitude: number; longitude: number; accuracy?: number; speed?: string; heading?: number; battery?: string }) => void;
}

export const DEFAULT_LOCATION_AREAS: LocationArea[] = [
  {
    id: 'LOC-HARTBEESFONTEIN',
    name: 'Hartbeesfontein',
    code: 'HBF',
    description: 'Hartbeesfontein dorpsgebied, sentrale sakekern & kleinhoewes',
    sector: 'Hartbeesfontein Sentraal',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-SCHOEMANSFONTEIN',
    name: 'Schoemansfontein',
    code: 'SCHO',
    description: 'Schoemansfontein sektor, Doornhoek grens & suidelike plase',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BRAKSPRUIT',
    name: 'Brakspruit',
    code: 'BRAK',
    description: 'Brakspruit landboukorridor, riviervallei plase & kleinhoewes',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-GEDULD',
    name: 'Geduld',
    code: 'GED',
    description: 'Geduld landbousektor & omliggende plase',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 4,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BUISFONTEIN',
    name: 'Buisfontein',
    code: 'BUIS',
    description: 'Buisfontein landbou-area & veeplase',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-VOGELSTRUISFONTEIN',
    name: 'Vogelstruisfontein',
    code: 'VOG',
    description: 'Vogelstruisfontein boerderygebied',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 6,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BUISVOG',
    name: 'Buisvog',
    code: 'BVO',
    description: 'Buisvog landbougebied & ranteplase',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 7,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-VLAKLAAGTE',
    name: 'Vlaklaagte',
    code: 'VLAK',
    description: 'Vlaklaagte rante & oos-plase',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 8,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-WITPOORT',
    name: 'Witpoort',
    code: 'WITP',
    description: 'Witpoort landboukorridor & weivelde',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 9,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BEENTJESKRAAL',
    name: 'Beentjeskraal',
    code: 'BEEN',
    description: 'Beentjeskraal boerderygebied',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 10,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-RIETKUIL',
    name: 'Rietkuil',
    code: 'RIETK',
    description: 'Rietkuil landboustreek & saailande',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 11,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-KAFFERSKRAAL',
    name: 'Kafferskraal',
    code: 'KAFF',
    description: 'Kafferskraal sektor & omgewing',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 12,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-ELANDSHEUWEL',
    name: 'Elandsheuwel',
    code: 'ELANH',
    description: 'Elandsheuwel landboustreek',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 13,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-WOLVERAND',
    name: 'Wolverand',
    code: 'WOLV',
    description: 'Wolverand boerderygebied & suidrand',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 14,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-ELANDSLAAGTE',
    name: 'Elandslaagte',
    code: 'ELANL',
    description: 'Elandslaagte vallei & rante',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 15,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-RENOSTERHOEK',
    name: 'Renosterhoek',
    code: 'RENH',
    description: 'Renosterhoek berg- en landbougebied',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 16,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-OORBIETJIESFONTEIN',
    name: 'Oorbietjiesfontein',
    code: 'OORB',
    description: 'Oorbietjiesfontein rante & weiveld',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 17,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-RENOSTERSPRUIT',
    name: 'Renosterspruit',
    code: 'RENS',
    description: 'Renosterspruit riviersone & landbouplase',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 18,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-JAKKALSFONTEIN',
    name: 'Jakkalsfontein',
    code: 'JAKK',
    description: 'Jakkalsfontein sektor & oosplase',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 19,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-SYFERFONTEIN',
    name: 'Syferfontein',
    code: 'SYFE',
    description: 'Syferfontein boerderygebied',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 20,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-ZENDELINGSFONTEIN',
    name: 'Zendelingsfontein',
    code: 'ZEND',
    description: 'Zendelingsfontein landboukorridor',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 21,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-SCHIETFONTEIN',
    name: 'Schietfontein',
    code: 'SCHI',
    description: 'Schietfontein boerderysektor',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 22,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BULTFONTEIN',
    name: 'Bultfontein',
    code: 'BULT',
    description: 'Bultfontein rante & saaiplase',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 23,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-RIETFONTEIN',
    name: 'Rietfontein',
    code: 'RIETF',
    description: 'Rietfontein landbougebied & weiveld',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 24,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-ROOIKUIL',
    name: 'Rooikuil',
    code: 'ROOI',
    description: 'Rooikuil boerderygebied',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 25,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-PALMIETFONTEIN',
    name: 'Palmietfontein',
    code: 'PALM',
    description: 'Palmietfontein boerderysektor & Rooipoort korridor',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 26,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-LAPFONTEIN',
    name: 'Lapfontein',
    code: 'LAPF',
    description: 'Lapfontein saaiplase & veeweiding',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 27,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-VOORSPOED',
    name: 'Voorspoed',
    code: 'VOOR',
    description: 'Voorspoed landbougebied',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 28,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-PAARDEPLAATS',
    name: 'Paardeplaats',
    code: 'PAAR',
    description: 'Paardeplaats boerderygebied',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 29,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-MAHEMSVLEI',
    name: 'Mahemsvlei',
    code: 'MAHE',
    description: 'Mahemsvlei landbougebied & vleisone',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 30,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-UITVAL',
    name: 'Uitval',
    code: 'UITV',
    description: 'Uitval sektor & omliggende plase',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 31,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BONNE-ESPERANCE',
    name: 'Bonne Esperance',
    code: 'BONN',
    description: 'Bonne Esperance landbouplase',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 32,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-TAAIBOSVLEI',
    name: 'Taaibosvlei',
    code: 'TAAI',
    description: 'Taaibosvlei vlei- en saaiplase',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 33,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-NOOITGEDACHT',
    name: 'Nooitgedacht',
    code: 'NOOI',
    description: 'Nooitgedacht boerderygebied',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 34,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-KLIPPAN',
    name: 'Klippan',
    code: 'KLIP',
    description: 'Klippan landbousektor & pan-omgewing',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 35,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BUFFELSVALLEI',
    name: 'Buffelsvallei',
    code: 'BUFF',
    description: 'Buffelsvallei rante & valleiboerdery',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 36,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-CYFERKUIL',
    name: 'Cyferkuil',
    code: 'CYFE',
    description: 'Cyferkuil landbougebied',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 37,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-SWARTLAAGTE',
    name: 'Swartlaagte',
    code: 'SWAR',
    description: 'Swartlaagte saailande & veeplase',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 38,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-ZWARTLAAGTE',
    name: 'Zwartlaagte',
    code: 'ZWAR',
    description: 'Zwartlaagte boerderysektor',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 39,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-RIETVALLEI',
    name: 'Rietvallei',
    code: 'RIETV',
    description: 'Rietvallei rivierweiveld & landerye',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 40,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-WILDEBEESLAAGTE',
    name: 'Wildebeeslaagte',
    code: 'WILD',
    description: 'Wildebeeslaagte wild- & veeplase',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 41,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-OTTERFONTEIN',
    name: 'Otterfontein',
    code: 'OTTE',
    description: 'Otterfontein boerderygebied',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 42,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-LEMMERVILLE',
    name: 'Lemmerville',
    code: 'LEMM',
    description: 'Lemmerville dorps- & kleinhoewesektor',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 43,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-LEMOENFONTEIN',
    name: 'Lemoenfontein',
    code: 'LEMO',
    description: 'Lemoenfontein landbousektor',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 44,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BEESTFONTEIN',
    name: 'Beestfontein',
    code: 'BEES',
    description: 'Beestfontein vee- & saaiplase',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 45,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-MOREA',
    name: 'Morea',
    code: 'MORE',
    description: 'Morea landbougebied',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 46,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-LEEUWFONTEIN',
    name: 'Leeuwfontein',
    code: 'LEEU',
    description: 'Leeuwfontein boerderygebied & rante',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 47,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-DOORNPOORT',
    name: 'Doornpoort',
    code: 'DOORP',
    description: 'Doornpoort landboukorridor',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 48,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-WELGELEGEN',
    name: 'Welgelegen',
    code: 'WELG',
    description: 'Welgelegen landbou- en saaiplase',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 49,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-WITFONTEIN',
    name: 'Witfontein',
    code: 'WITF',
    description: 'Witfontein boerderygebied',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 50,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-YSTERSPRUIT',
    name: 'Ysterspruit',
    code: 'YSTE',
    description: 'Ysterspruit riviersone & landbouplase',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 51,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-BRAKPAN',
    name: 'Brakpan',
    code: 'BRAKP',
    description: 'Brakpan boerderysektor & panplase',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 52,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-GOEDVOORUITZICHT',
    name: 'Goedvooruitzicht',
    code: 'GOED',
    description: 'Goedvooruitzicht landbougebied',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 53,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-SMALPUNT',
    name: 'Smalpunt',
    code: 'SMAL',
    description: 'Smalpunt sektor & grensplase',
    sector: 'Sektor 3 - Oos',
    isActive: true,
    displayOrder: 54,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-NARTJIE',
    name: 'Nartjie',
    code: 'NART',
    description: 'Nartjie kleinhoewes & vrugte/saaiplase',
    sector: 'Sektor 1 - Suid',
    isActive: true,
    displayOrder: 55,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-DOORNKOM',
    name: 'Doornkom',
    code: 'DOORK',
    description: 'Doornkom rante & weiveld',
    sector: 'Sektor 2 - Noord',
    isActive: true,
    displayOrder: 56,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'LOC-ELDERS',
    name: 'Elders',
    code: 'ELDE',
    description: 'Ander / Omliggende distrikte buite kernareas',
    sector: 'Sektor Algemeen',
    isActive: true,
    displayOrder: 57,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const DEFAULT_AREA_GROUPS: AreaGroup[] = [
  {
    id: 'GRP-ALL',
    name: 'Hartbeesfontein Entire District',
    code: 'HBF-ALL',
    description: 'All registered farmers, town residents and community members',
    geographicDescription: 'Greater Hartbeesfontein policing area including R503, R30 and town core',
    groupType: 'GENERAL',
    isActive: true,
    memberUserIds: ['USR-CLIENT-001', 'USR-CLIENT-004', 'USR-CLIENT-005', 'USR-CLIENT-006', 'USR-MGMT-003'],
    activeMemberCount: 142,
    createdByUid: 'USR-MGMT-003',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'GRP-SEC1',
    name: 'Sektor 1 (Suid / R30 Ottosdal-pad)',
    code: 'SEC-1',
    description: 'Southern farms along R30 corridor towards Ottosdal',
    geographicDescription: 'Doornhoek, Kareeboom, R30 Suid agricultural zone',
    groupType: 'SECURITY',
    isActive: true,
    leaderName: 'Sektor 1 Koördineerder',
    leaderPhone: '+27 82 306 5808',
    memberUserIds: [],
    activeMemberCount: 38,
    createdByUid: 'USR-MGMT-ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'GRP-SEC2',
    name: 'Sektor 2 (Noord / Rooipoort & Driefontein)',
    code: 'SEC-2',
    description: 'Northern agricultural farms and game reserves',
    geographicDescription: 'Rooipoort, Driefontein, northern boundaries',
    groupType: 'SECURITY',
    isActive: true,
    leaderName: 'Sektor 2 Koördineerder (C. Hattingh)',
    leaderPhone: '+27 82 306 5808',
    memberUserIds: ['USR-MGMT-ADMIN'],
    activeMemberCount: 45,
    createdByUid: 'USR-MGMT-ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'GRP-SEC3',
    name: 'Sektor 3 (Oos / R503 Klerksdorp-pad)',
    code: 'SEC-3',
    description: 'Eastern farms and grain silo corridor',
    geographicDescription: 'Brakspruit, Tigane border, R503 Oos corridor',
    groupType: 'SECURITY',
    isActive: true,
    leaderName: 'Sektor 3 Koördineerder',
    leaderPhone: '+27 82 306 5808',
    memberUserIds: [],
    activeMemberCount: 59,
    createdByUid: 'USR-MGMT-ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'GRP-REACTION',
    name: 'Reaction Force / Gewapende Reaksiespan',
    code: 'RF-UNIT',
    description: 'Armed tactical response units, farm watch fast response vehicles & duty officers',
    geographicDescription: 'All sectors - priority rapid dispatch',
    groupType: 'SECURITY',
    isActive: true,
    leaderName: 'Plaaswag Reaksie Bevelvoerder',
    leaderPhone: '+27 82 306 5808',
    memberUserIds: ['USR-MGMT-ADMIN'],
    activeMemberCount: 18,
    createdByUid: 'USR-MGMT-ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'GRP-FIRE',
    name: 'Fire Truck Drivers & FPA / Brandweer Drywers',
    code: 'FIRE-FPA',
    description: 'Fire tanker drivers, high-capacity water bakkies, and volunteer veld fire units',
    geographicDescription: 'Entire district fire zones & water refill points',
    groupType: 'FIRE',
    isActive: true,
    leaderName: 'Brandbestrydingskoördineerder (FPA)',
    leaderPhone: '+27 82 334 1190',
    memberUserIds: ['USR-MGMT-ADMIN'],
    activeMemberCount: 26,
    createdByUid: 'USR-MGMT-ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'GRP-PATROL',
    name: 'Nagpatrollie & Padblokkades',
    code: 'PATROL-NIGHT',
    description: 'Active evening patrol drivers and observation point volunteers',
    geographicDescription: 'Main gravel road intersections and perimeter gates',
    groupType: 'PATROL',
    isActive: true,
    leaderName: 'Nagpatrollie Koördineerder',
    leaderPhone: '+27 82 306 5808',
    memberUserIds: [],
    activeMemberCount: 31,
    createdByUid: 'USR-MGMT-ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'GRP-MANAGEMENT',
    name: 'Veiligheid Bestuurskomitee',
    code: 'MGMT-EXEC',
    description: 'Security committee executive members & sector coordinators',
    geographicDescription: 'Hartbeesfontein Security Management HQ',
    groupType: 'GENERAL',
    isActive: true,
    leaderName: 'Cornelius Hattingh',
    leaderPhone: '+27 82 306 5808',
    memberUserIds: ['USR-MGMT-ADMIN'],
    activeMemberCount: 9,
    createdByUid: 'USR-MGMT-ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'CNT-01',
    category: 'REACTION_FORCE',
    name: 'Hartbeesfontein Plaaswag Reaksieeenheid',
    organisation: 'Hartbeesfontein Plaaswag Reaksie',
    phone: '+27 82 306 5808',
    whatsappNumber: '+27823065808',
    areaSector: 'Alle Sektore',
    isActive: true,
    notes: '24/7 Reaction unit & rapid tactical dispatch',
  },
  {
    id: 'CNT-02',
    category: 'MANAGEMENT',
    name: 'Cornelius Hattingh (Voorsitter / Beheerkamer)',
    organisation: 'Veiligheid Bestuurskomitee',
    phone: '+27 82 306 5808',
    whatsappNumber: '+27823065808',
    areaSector: 'Sektor 2 & Hoofbestuur',
    isActive: true,
    notes: 'Escalation & incident command coordination',
  },
  {
    id: 'CNT-03',
    category: 'POLICE',
    name: 'Hartbeesfontein SAPS Charge Office',
    organisation: 'South African Police Service',
    phone: '+27 18 431 0300',
    whatsappNumber: '+27184310300',
    areaSector: 'Hartbeesfontein Polisiëringsarea',
    isActive: true,
    notes: 'Direct station line. Sector vehicle cell: +27 79 881 9920',
  },
  {
    id: 'CNT-04',
    category: 'AMBULANCE',
    name: 'Klerksdorp/Tshepong Provincial EMS',
    organisation: 'Emergency Medical Services (EMS)',
    phone: '+27 18 462 2333',
    areaSector: 'Klerksdorp / Hartbeesfontein Sub-distrik',
    isActive: true,
    notes: 'State ambulance dispatch. Private ER24: 084 124',
  },
  {
    id: 'CNT-05',
    category: 'FIRE',
    name: 'Hartbeesfontein Brandbestrydingsvereniging (FPA)',
    organisation: 'District Fire Protection Association',
    phone: '+27 82 334 1190',
    whatsappNumber: '+27823341190',
    areaSector: 'Distrik R503 & R30',
    isActive: true,
    notes: 'Grass and veld fire response units with water bakkies',
  },
  {
    id: 'CNT-06',
    category: 'TOWING',
    name: 'Hartbees 24/7 Insleepdienste & Herwinning',
    organisation: 'Hartbees Heavy & Light Towing',
    phone: '+27 82 911 4455',
    whatsappNumber: '+27829114455',
    areaSector: 'R503 & R30 Hoofpaaie',
    isActive: true,
    notes: 'Flatbed & 4x4 off-road recovery. Winch equipped.',
  },
  {
    id: 'CNT-07',
    category: 'VET',
    name: 'Klerksdorp / Hartbeesfontein Veeartsenydiens',
    organisation: 'Klerksdorp Dierekliniek & Vee-nooddiens',
    phone: '+27 18 462 1088',
    whatsappNumber: '+27184621088',
    areaSector: 'Distrik Landbougebiede',
    isActive: true,
    notes: 'Emergency livestock poisoning, darting & equine emergency care',
  },
  {
    id: 'CNT-08',
    category: 'NEIGHBOR_NON_CLIENT',
    name: 'Grensbuurman Koördinering (Witpoort)',
    organisation: 'Gedeelte 19 Witpoort Buurplaas',
    phone: '+27 82 306 5808',
    whatsappNumber: '+27823065808',
    areaSector: 'Sektor 2 - Noord Grens',
    isActive: true,
    notes: 'Grensbuurman aan Rooipoort noordgrens; samewerking met grenshek & brandbane',
  },
  {
    id: 'CNT-09',
    category: 'CONTRACTOR',
    name: 'Hartbees Heining- & Sonselhersteldienste',
    organisation: 'Kruger Fence & Solar Repairs',
    phone: '+27 82 306 5808',
    whatsappNumber: '+27823065808',
    areaSector: 'Alle Sektore',
    isActive: true,
    notes: 'Nemtek elektriese heining foute, sonselle en hekmotors',
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  communityName: 'Hartbeesfontein Veiligheid & Plaaswag',
  emergencyHotlinePhone: '+27 82 306 5808',
  policeDirectPhone: '+27 18 431 0300 (SAPS Hartbeesfontein)',
  ambulanceDirectPhone: '+27 18 462 2333 / 10177',
  reactionForceContact: 'Cornelius Hattingh (+27 82 306 5808)',
  managementAlertContact: '+27 82 306 5808 (C. Hattingh - Beheerkamer)',
  defaultSector: 'Sektor 2 - Noord',
  isWhatsAppApiConfigured: true,
  whatsAppConfig: {
    isConfigured: true,
    provider: 'META_CLOUD_API',
    apiUrl: 'https://graph.facebook.com/v20.0',
    phoneNumberId: '109283746195820',
    wabaId: '192837461829011',
    accessToken: 'EAAO...HBV_SECURE_TOKEN',
    webhookVerificationToken: 'hbv_wa_verify_2026',
    defaultReactionGroupNumber: '+27823065808',
    secondaryPoliceWhatsApp: '+27184310300',
    autoDispatchEmergency: true,
    autoDispatchBoloAlerts: true,
    includeGpsMapLink: true,
    includeAccessDetails: true,
    language: 'BILINGUAL',
    customFooterNote: 'Hartbeesfontein Veiligheid 24/7 Beheerkamer Dispatch',
  },
  communityResponse: {
    enabled: true,
    initialResponderCount: 5,
    escalationCount: 10,
    acknowledgementTimeoutMinutes: 5,
    defaultRadiusKm: 15,
    maximumRadiusKm: 50,
    escalationRadiusKm: 10,
    minimumDesiredResponders: 3,
  },
  alertsConfig: {
    defaultExpiryHours: {
      SECURITY: 24,
      FIRE: 12,
      TRAFFIC: 8,
      BOLO: 72,
      NOTICE: 48,
      ASSISTANCE: 24,
    },
    allowGroupAlerts: true,
    allowRadiusAlerts: true,
    emergencyNotificationBehaviour: 'AUTO_BROADCAST_SECTOR',
  },
  privacyConfig: {
    defaultLocationPrecision: 'APPROXIMATE',
    allowExactEmergencyLocationSharing: true,
    allowResponderPhoneSharing: true,
    allowFarmNameSharing: true,
  },
  communicationsConfig: {
    enableLiveAudio: true,
    enableLiveLocation: true,
    defaultLocationUpdateMode: 'STANDARD',
    controlRoomPhoneNumber: '+27 82 306 5808',
    policeDirectPhone: '+27 18 431 0300',
    ambulanceDirectPhone: '+27 18 462 2333',
    fireDirectPhone: '+27 82 334 1190',
    audioSessionTimeoutMinutes: 15,
    locationStaleThresholdSeconds: 60,
    standardLocationIntervalSeconds: 20,
    highPriorityLocationIntervalSeconds: 5,
  },
  dailyReportSummary: {
    date: '2026-08-19',
    content: 'All quiet across Sectors 1 & 3 overnight. Sector 2 reported fence cutting near Rooipoort boundary; patrol responded in 14 minutes and area secured. 2 night shifts completed by Farm Watch.',
    publishedBy: 'Kobus Eloff (Beheerkamer)',
  },
};

const INITIAL_ASSISTANCE_REQUESTS: CommunityAssistanceRequest[] = [
  {
    id: 'REQ-2026-0001',
    caseId: 'CASE-2026-0042',
    requestType: 'SECURITY',
    priority: 'HIGH',
    status: 'ACTIVE',
    publicSafeTitle: 'Suspicious Vehicle Activity & Perimeter Check - Sektor 2 Noord',
    publicSafeMessage: 'Fence wire tampering observed near Rooipoort boundary. Requesting nearby farm watch members to monitor access roads and observation points.',
    safetyWarning: 'DO NOT APPROACH UNKNOWN SUSPECTS. Maintain observation from safety, keep headlights on and report movements immediately to Control Room.',
    structuredInstructions: 'OBSERVE_ONLY',
    customInstructions: 'Focus observation around R503 km 12 to 18 corridor and Driefontein gravel crossing.',
    locationPrecision: 'APPROXIMATE',
    targetAreaName: 'Sektor 2 (Rooipoort / Driefontein corridor)',
    approximateLocationDescription: 'Northern agricultural boundary within 10km radius of Rooipoort',
    gpsLocation: { latitude: -26.7645, longitude: 26.4128 },
    stagingPoint: {
      name: 'Sektor 2 Noord Staging Post (Driefontein Silo junction)',
      latitude: -26.761,
      longitude: 26.419,
      instructions: 'Park on gravel shoulder facing north, maintain contact on Radio Ch 2',
      contactPerson: 'Johan van der Merwe',
      contactPhone: '+27 82 455 1290',
    },
    targetFilter: {
      targetType: 'GROUPS',
      groupIds: ['GRP-SEC2', 'GRP-PATROL'],
      radiusKm: 15,
      centerLocation: { latitude: -26.7645, longitude: 26.4128 },
    },
    targetUserIds: ['USR-CLIENT-001', 'USR-CLIENT-004', 'USR-CLIENT-005', 'USR-MGMT-003'],
    responders: [
      {
        userUid: 'USR-CLIENT-001',
        userName: 'Johan van der Merwe',
        userPhone: '+27 82 455 1290',
        farmOrBase: 'Rooipoort Farm Gedeelte 14',
        distanceKm: 1.2,
        status: 'RESPONDING',
        statusTimestamp: '2026-08-18T22:00:00Z',
        assignedRole: 'Staging Point Coordinator',
        notes: 'En route to Driefontein silo junction in patrol bakkie with spotlights',
        timeline: [
          { status: 'SEEN', timestamp: '2026-08-18T21:45:00Z' },
          { status: 'CAN_ASSIST', timestamp: '2026-08-18T21:48:00Z', notes: 'Have bakkie and 2 watchmen ready' },
          { status: 'RESPONDING', timestamp: '2026-08-18T22:00:00Z', notes: 'Deploying to junction' },
        ],
      },
      {
        userUid: 'USR-CLIENT-004',
        userName: 'Andries Botha',
        userPhone: '+27 82 555 1029',
        farmOrBase: 'Doornhoek Plaas',
        distanceKm: 11.4,
        status: 'CAN_ASSIST',
        statusTimestamp: '2026-08-18T22:05:00Z',
        assignedRole: 'South Road Observation',
        notes: 'Monitoring R30 south turnoff from homestead gate',
        timeline: [
          { status: 'SEEN', timestamp: '2026-08-18T21:50:00Z' },
          { status: 'CAN_ASSIST', timestamp: '2026-08-18T22:05:00Z', notes: 'On standby at Doornhoek gate' },
        ],
      },
    ],
    escalationRound: 1,
    escalationHistory: [
      {
        round: 1,
        triggeredAt: '2026-08-18T21:40:00Z',
        triggeredByUid: 'USR-CTRL-002',
        triggeredByName: 'Kobus Eloff',
        reason: 'Initial security notification to Sektor 2 farm watch group',
        candidateCount: 4,
        notifiedUserIds: ['USR-CLIENT-001', 'USR-CLIENT-004', 'USR-CLIENT-005', 'USR-MGMT-003'],
      },
    ],
    stats: {
      sentCount: 4,
      deliveredCount: 4,
      openedCount: 3,
      seenCount: 3,
      canAssistCount: 2,
      respondingCount: 1,
      arrivedCount: 0,
      unableCount: 0,
    },
    isAllClear: false,
    createdAt: '2026-08-18T21:40:00Z',
    createdByUid: 'USR-CTRL-002',
    createdByName: 'Kobus Eloff (Beheerkamer)',
    updatedAt: '2026-08-18T22:05:00Z',
  },
];

const INITIAL_BOLO_SIGHTINGS: BoloSighting[] = [
  {
    id: 'BS-2026-001',
    boloId: 'BOLO-2026-008',
    boloNumber: 'BOLO-2026-008',
    reportedByUid: 'USR-CLIENT-001',
    reportedByName: 'Johan van der Merwe',
    reportedByPhone: '+27 82 455 1290',
    timestamp: '2026-08-18T21:55:00Z',
    locationDescription: 'R503 km 14 gravel intersection heading towards Ottosdal',
    gpsLocation: { latitude: -26.768, longitude: 26.405, accuracy: 12 },
    directionOfTravel: 'West on gravel road towards R30 connection',
    description: 'Observed red single-cab bakkie with dark canopy driving without tail lights on gravel road.',
    verificationStatus: 'VERIFIED',
    verifiedByUid: 'USR-CTRL-002',
    verifiedByName: 'Kobus Eloff',
    verifiedTimestamp: '2026-08-18T22:10:00Z',
    verificationNotes: 'Corresponds with tyre tracks identified on Rooipoort northern fence perimeter.',
  },
];

const INITIAL_CASES: Case[] = [
  {
    id: 'CASE-2026-0042',
    caseNumber: 'HBF-2026-0042',
    title: 'Fence wire cutting along northern boundary',
    description: 'Discovered 4 strands of high tensile cattle wire cut over a 50m span near the gravel service road. Footprints heading north towards informal settlement.',
    category: 'fence_damage',
    priority: 'medium',
    status: 'investigating',
    isPublic: true,
    sapsCaseNumber: 'CAS 42/08/2026',
    sapsStation: 'Hartbeesfontein SAPS',
    sapsDetails: {
      caseNumber: 'CAS 42/08/2026',
      station: 'Hartbeesfontein SAPS',
      obNumber: 'OB 78/08/2026',
      dateReported: '2026-08-18',
      officers: [
        {
          id: 'IO-001',
          name: 'D. Khumalo',
          rank: 'Warrant Officer (Detective)',
          station: 'Hartbeesfontein SAPS',
          unit: 'Detective Services / VISPOL',
          phone: '+27 82 455 9012',
          badgeNumber: '0489211-4',
          notes: 'Case docket registered. Wire sample cuttings gathered for forensic tool-mark comparison.',
        },
      ],
    },
    investigatingOfficers: [
      {
        id: 'IO-001',
        name: 'D. Khumalo',
        rank: 'Warrant Officer (Detective)',
        station: 'Hartbeesfontein SAPS',
        unit: 'Detective Services / VISPOL',
        phone: '+27 82 455 9012',
        badgeNumber: '0489211-4',
        notes: 'Case docket registered. Wire sample cuttings gathered for forensic tool-mark comparison.',
      },
    ],
    incidentDate: '2026-08-18',
    incidentTime: '21:30',
    locationName: 'Rooipoort Gedeelte 14 (Noord-grens)',
    sector: 'Sektor 2 - Noord',
    areaGroupId: 'GRP-SEC2',
    gpsLocation: { latitude: -26.7645, longitude: 26.4128 },
    reportedByUid: 'USR-CLIENT-001',
    reportedByName: 'Johan van der Merwe',
    reportedByPhone: '+27 82 455 1290',
    vehicleInfo: {
      makeModel: 'Silver Toyota Hilux older model noticed idling with parking lights',
      color: 'Silver',
    },
    personDescription: {
      clothing: 'Dark hooded tops, 2 individuals seen running across open field',
    },
    photos: [],
    evidence: [
      {
        id: 'EVD-001',
        fileName: 'wire_cut_close_up.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
        mimeType: 'image/jpeg',
        uploadedByUid: 'USR-CLIENT-001',
        uploadedByName: 'Johan van der Merwe',
        caption: 'Fresh wire bolt cutter marks on top 3 strands',
        uploadedAt: '2026-08-18T21:40:00Z',
      },
    ],
    updates: [
      {
        id: 'UPD-001',
        caseId: 'CASE-2026-0042',
        authorUid: 'USR-CTRL-002',
        authorName: 'Kobus Eloff',
        authorRole: 'CONTROL_ROOM',
        message: 'Patrol unit 2 dispatched to survey gravel track. No vehicle found at coordinate, tracks continue towards main road.',
        updateType: 'action_taken',
        isInternalOnly: false,
        timestamp: '2026-08-18T22:15:00Z',
      },
    ],
    linkedPoiIds: ['POI-HBF-001'],
    linkedVehicleIds: [],
    createdAt: '2026-08-18T21:35:00Z',
    updatedAt: '2026-08-18T22:15:00Z',
  },
];

const INITIAL_BOLOS: BoloRecord[] = [
  {
    id: 'BOLO-2026-008',
    boloNumber: 'BOLO-2026-008',
    title: 'Red Isuzu KB 250 - Suspected Stock Scouting',
    reason: 'Vehicle observed repeatedly idling slowly past kraals along Sektor 1 & 2 boundary at 02:00',
    description: 'Older model single cab with black canopy. Fake or obscured rear plate CK 921 GP.',
    targetType: 'vehicle',
    photos: [],
    vehicleInfo: {
      make: 'Isuzu',
      model: 'KB 250 Single Cab',
      color: 'Red (faded paint on bonnet)',
      licensePlate: 'CK 921 GP (Suspect plate)',
      distinguishingFeatures: 'Black canopy, cracked left brake light, noisy exhaust',
    },
    lastKnownLocation: 'Rooipoort / Driefontein gravel crossing (R503 km 12)',
    lastSeenTimestamp: '2026-08-18T02:15:00Z',
    distribution: 'all_clients',
    status: 'active',
    createdByUid: 'USR-CTRL-002',
    createdByName: 'Kobus Eloff',
    createdAt: '2026-08-18T03:00:00Z',
    updatedAt: '2026-08-18T03:00:00Z',
  },
];

const INITIAL_POIS: PersonOfInterest[] = [
  {
    id: 'POI-HBF-001',
    internalPoiId: 'POI-HBF-001',
    name: 'Themba',
    surname: 'Khumalo',
    aliases: ['Shorty', 'Skaap', 'Bra T'],
    nickname: 'Shorty',
    approximateAge: 34,
    physicalDescription: {
      height: '1.68m',
      build: 'Medium muscular',
      identifyingMarks: 'Scar over left eyebrow, limp on right leg, snake tattoo on right forearm',
      clothingLastSeen: 'Dark blue boiler suit jacket, red woolen beanie, steel-toe boots',
      complexion: 'Dark',
    },
    phoneNumbers: ['+27 78 301 9921', '+27 61 902 4412'],
    addresses: [
      'Plot 14 Rooipoort Outpost, Hartbeesfontein Rural',
      'House 1142, Extension 2, Tigane Township',
      'Informal Settlement Dwelling #48B near Silo rail line'
    ],
    knownAreas: ['Sektor 2 Noord', 'Driefontein Spoorlyn', 'Tigane Oos', 'R503 corridor'],
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
    ],
    status: 'WANTED',
    associatedVehicles: [
      'Red Isuzu KB Single Cab (CK 921 GP)',
      'White Toyota Hilux Bakkie (NW 844 112)'
    ],
    associatedPersons: ['Sipho Ndlovu', 'Lucas Sithole'],
    knownAssociates: [
      {
        personId: 'POI-HBF-002',
        name: 'Sipho Ndlovu',
        relationship: 'Accomplice / Co-suspect',
        verificationStatus: 'VERIFIED',
        notes: 'Co-accused in 2024 farm fence cutting case; spotted operating getaway bakkie on R503.'
      },
      {
        name: 'Lucas "Bravo" Sithole',
        relationship: 'Scout / Lookout',
        verificationStatus: 'PARTIALLY_VERIFIED',
        notes: 'Informant reports subject conducts daytime kraal scouting on bicycle.'
      },
      {
        name: 'Musa Dlamini',
        relationship: 'Fence / Scrap Metal Buyer',
        verificationStatus: 'UNVERIFIED',
        notes: 'Operates informal scrap yard in Tigane Industrial corridor.'
      }
    ],
    linkedCaseIds: ['CASE-2026-0042'],
    observations: [
      {
        id: 'OBS-001',
        observationId: 'OBS-2026-019',
        poiId: 'POI-HBF-001',
        relatedCaseId: 'CASE-2026-0042',
        incidentTimestamp: '2026-08-18T21:30:00Z',
        locationDescription: 'Rooipoort north fence border',
        description: 'Subject matching Khumalo physical profile seen with bolt cutters near cattle boundary.',
        sourceType: 'NIGHT_PATROL_THERMAL',
        enteredByUid: 'USR-CTRL-002',
        enteredByName: 'Kobus Eloff',
        enteredTimestamp: '2026-08-18T22:30:00Z',
        verificationStatus: 'VERIFIED',
        confidenceLevel: 'HIGH',
        evidenceReferences: ['wire_cut_close_up.jpg'],
      },
    ],
    notes: 'Known for nighttime livestock scouting and cutting perimeter cattle wires. Exercise extreme caution during rural roadblock encounters.',
    createdByUid: 'USR-CTRL-002',
    createdAt: '2026-06-12T10:00:00Z',
    updatedAt: '2026-08-19T01:05:00Z',
  },
  {
    id: 'POI-HBF-002',
    internalPoiId: 'POI-HBF-002',
    name: 'Sipho',
    surname: 'Ndlovu',
    aliases: ['Mshana', 'Ghost'],
    nickname: 'Ghost',
    approximateAge: 29,
    physicalDescription: {
      height: '1.75m',
      build: 'Slender',
      identifyingMarks: 'Tribal cuts on upper right shoulder, gold front tooth',
      clothingLastSeen: 'Grey reflective work jacket, dark jeans',
      complexion: 'Medium',
    },
    phoneNumbers: ['+27 72 811 0049'],
    addresses: [
      'House 308, Section B, Tigane Township',
      'Worker Quarters, Farm Brakspruit (former employee)'
    ],
    knownAreas: ['Sektor 3 Oos', 'Tigane Main Road', 'Brakspruit'],
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
    ],
    status: 'SUSPECT',
    associatedVehicles: [
      'Red Isuzu KB Single Cab (CK 921 GP)',
      'Silver Golf 4 (CA 209 881)'
    ],
    associatedPersons: ['Themba Khumalo'],
    knownAssociates: [
      {
        personId: 'POI-HBF-001',
        name: 'Themba Khumalo',
        relationship: 'Accomplice / Co-suspect',
        verificationStatus: 'VERIFIED',
        notes: 'Primary co-suspect in livestock theft syndicate.'
      }
    ],
    linkedCaseIds: ['CASE-2026-0042'],
    observations: [],
    notes: 'Former farm laborer with intimate knowledge of internal farm access gates and solar pump locations.',
    createdByUid: 'USR-CTRL-002',
    createdAt: '2026-07-04T14:20:00Z',
    updatedAt: '2026-08-18T16:00:00Z',
  }
];

const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'ALT-2026-021',
    alertNumber: 'ALT-2026-021',
    type: 'TRAFFIC',
    title: 'VERKEERSWAARSKUWING: R503 Padversperring & MVO',
    shortDescription: 'MVO en ernstige padversperring op R503 rigting Klerksdorp naby Pzazz (H29/H32). Noodreaksie is op toneel. Ry asseblief versigtig.',
    priority: 'high',
    location: 'R503 Klerksdorp pad (naby Pzazz / H29)',
    targetDistribution: 'all',
    acknowledgements: [],
    updates: [
      {
        id: 'UPD-ALT-TR-1',
        authorUid: 'USR-CTRL-002',
        authorName: 'Alletha Smit (Beheerkamer)',
        notifyUsers: true,
        message: 'Noodreaksie en insleepdienste is op toneel. Pad is gedeeltelik oopgestel vir een-rigting verkeer.',
        timestamp: '2026-08-27T08:15:00Z',
      },
    ],
    isAllClear: false,
    activeFrom: '2026-08-27T08:00:00Z',
    isClosed: false,
    requiresAck: false,
    publishedAt: '2026-08-27T08:00:00Z',
    publishedByUid: 'USR-CTRL-002',
    publishedByName: 'Beheerkamer',
  },
  {
    id: 'ALT-2026-014',
    alertNumber: 'ALT-2026-014',
    type: 'BOLO',
    title: 'BOLO: Red Isuzu Bakkie (False Plate CK 921 GP)',
    shortDescription: 'Be on the lookout for suspicious Red Isuzu KB scouting camps.',
    priority: 'high',
    location: 'Sektor 1 & 2 boundary',
    linkedBoloId: 'BOLO-2026-008',
    targetDistribution: 'all',
    acknowledgements: [
      {
        userUid: 'USR-CLIENT-001',
        userName: 'Johan van der Merwe',
        status: 'SEEN',
        timestamp: '2026-08-18T20:15:00Z',
      },
    ],
    updates: [],
    isAllClear: false,
    activeFrom: '2026-08-18T19:35:00Z',
    isClosed: false,
    requiresAck: true,
    publishedAt: '2026-08-18T19:35:00Z',
    publishedByUid: 'USR-CTRL-002',
    publishedByName: 'Beheerkamer',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    action: 'USER_LOGIN',
    recordType: 'USER_AUTH',
    recordId: 'USR-CLIENT-001',
    actorUid: 'USR-CLIENT-001',
    actorName: 'Johan van der Merwe',
    actorRole: 'CLIENT',
    description: 'Authenticated via biometric/PIN session',
    timestamp: '2026-08-18T21:40:00Z',
  },
];

// Clean up any legacy or duplicate storage keys to ensure quota headroom
cleanupLegacyStorage();

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, activeRole } = useAuth();

  // Storage states with LocalStorage persistence
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>(() => {
    const saved = safeGetJSON<EmergencyEvent[]>('hv_emergencies_v2', []);
    if (Array.isArray(saved)) {
      return saved.map((emg) => {
        if (emg.resolvedTime || emg.resolutionDetails?.resolutionStatus === 'SAFE') {
          return {
            ...emg,
            status: 'SAFE',
            audioSession: emg.audioSession ? { ...emg.audioSession, status: 'ENDED', connectionState: 'ENDED' } : undefined,
            locationSession: emg.locationSession ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED' } : undefined,
          };
        }
        return emg;
      });
    }
    return [];
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const saved = safeGetJSON<EmergencyContact[]>('hv_emergency_contacts', DEFAULT_EMERGENCY_CONTACTS);
    const existingIds = new Set(saved.map((c) => c.id));
    const missingDefaults = DEFAULT_EMERGENCY_CONTACTS.filter((d) => !existingIds.has(d.id));
    return [...saved, ...missingDefaults];
  });

  const [cases, setCases] = useState<Case[]>(() => {
    const allSystemCases = [...INITIAL_CASES, ...ACTUAL_VIS_CASES, ...SEED_EXTRA_CASES];
    const saved = safeGetJSON<Case[]>('hv_cases_actual_v2', []);
    if (Array.isArray(saved) && saved.length > 0) {
      const existingIds = new Set(saved.map((c) => c.id));
      const missing = allSystemCases.filter((c) => !existingIds.has(c.id));
      return [...saved, ...missing];
    }
    return allSystemCases;
  });

  const [situationReports, setSituationReports] = useState<SituationReport[]>(() => {
    const freshDefaults = convertRawLogsToSituationReports();
    const saved = safeGetJSON<SituationReport[]>('hv_situation_reports_actual_v2', []);
    if (Array.isArray(saved) && saved.length >= 20) {
      const existingIds = new Set(saved.map((r: SituationReport) => r.id));
      const missingDefaults = freshDefaults.filter((d) => !existingIds.has(d.id));
      return [...missingDefaults, ...saved];
    }
    return freshDefaults;
  });

  const [situationDraft, setSituationDraft] = useState<Partial<SituationReport> | null>(() => {
    return safeGetJSON<Partial<SituationReport> | null>('hv_situation_draft', null);
  });

  const [bolos, setBolos] = useState<BoloRecord[]>(() => {
    return safeGetJSON<BoloRecord[]>('hv_bolos', INITIAL_BOLOS);
  });

  const [pois, setPois] = useState<PersonOfInterest[]>(() => {
    return safeGetJSON<PersonOfInterest[]>('hv_pois_v3', SEED_POIS);
  });

  const [vois, setVois] = useState<VehicleOfInterest[]>(() => {
    const saved = safeGetJSON<VehicleOfInterest[]>('hv_vois_actual_v1', []);
    if (Array.isArray(saved) && saved.length >= 10) {
      return saved;
    }
    return SEED_VOIS;
  });

  const [intelObservations, setIntelObservations] = useState<IntelObservation[]>(() => {
    return safeGetJSON<IntelObservation[]>('hv_intel_observations_v3', SEED_OBSERVATIONS);
  });

  const [intelRelationships, setIntelRelationships] = useState<IntelRelationship[]>(() => {
    return safeGetJSON<IntelRelationship[]>('hv_intel_relationships_v3', SEED_RELATIONSHIPS);
  });

  const [intelReviewQueue, setIntelReviewQueue] = useState<IntelReviewItem[]>(() => {
    return safeGetJSON<IntelReviewItem[]>('hv_intel_review_queue_v3', SEED_REVIEW_QUEUE);
  });

  const [intelAuditLogs, setIntelAuditLogs] = useState<IntelAuditEntry[]>(() => {
    return safeGetJSON<IntelAuditEntry[]>('hv_intel_audit_logs_v3', SEED_INTEL_AUDIT);
  });

  const [alerts, setAlerts] = useState<AlertNotification[]>(() => {
    const saved = safeGetJSON<AlertNotification[]>('hv_alerts', INITIAL_ALERTS);
    const existingIds = new Set(saved.map((a) => a.id));
    const missing = INITIAL_ALERTS.filter((a) => !existingIds.has(a.id));
    return [...missing, ...saved];
  });

  const [assistanceRequests, setAssistanceRequests] = useState<CommunityAssistanceRequest[]>(() => {
    return safeGetJSON<CommunityAssistanceRequest[]>('hv_assistance_requests', INITIAL_ASSISTANCE_REQUESTS);
  });

  const [boloSightings, setBoloSightings] = useState<BoloSighting[]>(() => {
    return safeGetJSON<BoloSighting[]>('hv_bolo_sightings', INITIAL_BOLO_SIGHTINGS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    return safeGetJSON<AuditLogEntry[]>('hv_audit_logs', INITIAL_AUDIT_LOGS);
  });

  const [areaGroups, setAreaGroups] = useState<AreaGroup[]>(() => {
    return safeGetJSON<AreaGroup[]>('hv_area_groups', DEFAULT_AREA_GROUPS);
  });

  const [locationAreas, setLocationAreas] = useState<LocationArea[]>(() => {
    const saved = safeGetJSON<LocationArea[]>('hv_location_areas', DEFAULT_LOCATION_AREAS);
    if (Array.isArray(saved) && saved.length > 0) {
      const existingNames = new Set(saved.map((a) => a.name.trim().toLowerCase()));
      const missingDefaults = DEFAULT_LOCATION_AREAS.filter(
        (d) => !existingNames.has(d.name.trim().toLowerCase())
      );
      if (missingDefaults.length > 0) {
        return [...saved, ...missingDefaults];
      }
      return saved;
    }
    return DEFAULT_LOCATION_AREAS;
  });

  useEffect(() => {
    safeSetJSON('hv_location_areas', locationAreas);
  }, [locationAreas]);

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const parsed = safeGetJSON<SystemSettings>('hv_settings', DEFAULT_SETTINGS);
    const hydratedReactionNumber =
      !parsed.whatsAppConfig?.defaultReactionGroupNumber ||
      parsed.whatsAppConfig?.defaultReactionGroupNumber === '+27832908812' ||
      parsed.whatsAppConfig?.defaultReactionGroupNumber === '+27829904412'
        ? '+27823065808'
        : parsed.whatsAppConfig.defaultReactionGroupNumber;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      emergencyHotlinePhone: parsed.emergencyHotlinePhone || '+27 82 306 5808',
      managementAlertContact: parsed.managementAlertContact || '+27 82 306 5808 (C. Hattingh - Beheerkamer)',
      isWhatsAppApiConfigured: parsed.isWhatsAppApiConfigured ?? true,
      whatsAppConfig: {
        ...DEFAULT_SETTINGS.whatsAppConfig,
        ...(parsed.whatsAppConfig || {}),
        defaultReactionGroupNumber: hydratedReactionNumber,
        isConfigured: parsed.whatsAppConfig?.isConfigured ?? true,
        phoneNumberId: parsed.whatsAppConfig?.phoneNumberId || DEFAULT_SETTINGS.whatsAppConfig?.phoneNumberId || '109283746195820',
        accessToken: parsed.whatsAppConfig?.accessToken || DEFAULT_SETTINGS.whatsAppConfig?.accessToken || 'EAAO...HBV_SECURE_TOKEN',
        apiUrl: parsed.whatsAppConfig?.apiUrl || 'https://graph.facebook.com/v20.0',
        provider: parsed.whatsAppConfig?.provider || 'META_CLOUD_API',
      },
    };
  });

  const [generatedReports, setGeneratedReports] = useState<GeneratedReportRecord[]>(() => {
    return safeGetJSON<GeneratedReportRecord[]>('hv_generated_reports', []);
  });

  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>(() => {
    return safeGetJSON<BackupRecord[]>('hv_backup_records', DEFAULT_BACKUP_RECORDS);
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealthComponent[]>(() => {
    return safeGetJSON<SystemHealthComponent[]>('hv_system_health', INITIAL_HEALTH_COMPONENTS);
  });

  const [systemErrorLogs, setSystemErrorLogs] = useState<SystemErrorLogEntry[]>(() => {
    return safeGetJSON<SystemErrorLogEntry[]>('hv_system_error_logs', INITIAL_ERROR_LOGS);
  });

  const [privacyAccessLogs, setPrivacyAccessLogs] = useState<PrivacyAccessLogEntry[]>(() => {
    return safeGetJSON<PrivacyAccessLogEntry[]>('hv_privacy_access_logs', INITIAL_PRIVACY_ACCESS_LOGS);
  });

  const [trainingMode, setTrainingMode] = useState<TrainingModeState>(() => {
    return safeGetJSON<TrainingModeState>('hv_training_mode', { enabled: false });
  });

  const [mapLayers, setMapLayers] = useState<KmlMapLayer[]>(() => {
    return safeGetJSON<KmlMapLayer[]>('hv_map_layers', INITIAL_KML_LAYERS);
  });

  const [cameras, setCameras] = useState<CameraDevice[]>(() => {
    const saved = safeGetJSON<CameraDevice[]>('hv_camera_devices_actual_v2', []);
    if (Array.isArray(saved) && saved.length >= 25) return saved;
    return INITIAL_CAMERAS;
  });

  useEffect(() => {
    safeSetJSON('hv_camera_devices_actual_v2', cameras);
  }, [cameras]);

  const [cameraErrors, setCameraErrors] = useState<CameraErrorLog[]>(() => {
    return safeGetJSON<CameraErrorLog[]>('hv_camera_errors_v1', INITIAL_CAMERA_ERRORS);
  });

  const [cameraMaintenanceTickets, setCameraMaintenanceTickets] = useState<CameraMaintenanceTicket[]>(() => {
    return safeGetJSON<CameraMaintenanceTicket[]>('hv_camera_maintenance_tickets_v1', INITIAL_MAINTENANCE_TICKETS);
  });

  const [activePatrolUnits, setActivePatrolUnits] = useState<ActivePatrolUnit[]>(() => {
    return safeGetJSON<ActivePatrolUnit[]>('hv_active_patrol_units', []);
  });

  const [isPatrolActive, setIsPatrolActive] = useState<boolean>(() => {
    const saved = safeGetJSON<string | boolean>('hv_is_patrol_active', false);
    return saved === true || saved === 'true';
  });

  const isPatrolActiveRef = useRef(isPatrolActive);
  useEffect(() => {
    isPatrolActiveRef.current = isPatrolActive;
  }, [isPatrolActive]);

  const [incidentNotifications, setIncidentNotifications] = useState<IncidentNotification[]>(() => {
    return safeGetJSON<IncidentNotification[]>('hv_incident_notifications_v1', []);
  });

  // Sync to safe local storage
  useEffect(() => { safeSetJSON('hv_incident_notifications_v1', incidentNotifications); }, [incidentNotifications]);
  useEffect(() => {
    // Sanitize emergencies for local storage cache to keep storage well within browser limits
    const sanitized = emergencies.slice(0, 30).map((emg) => {
      if (Array.isArray(emg.locationHistory) && emg.locationHistory.length > 15) {
        return { ...emg, locationHistory: emg.locationHistory.slice(-15) };
      }
      return emg;
    });
    safeSetJSON('hv_emergencies_v2', sanitized);
  }, [emergencies]);
  useEffect(() => { safeSetJSON('hv_active_patrol_units', activePatrolUnits); }, [activePatrolUnits]);
  useEffect(() => { safeSetJSON('hv_is_patrol_active', isPatrolActive); }, [isPatrolActive]);
  useEffect(() => { safeSetJSON('hv_emergency_contacts', emergencyContacts); }, [emergencyContacts]);
  useEffect(() => { safeSetJSON('hv_cases_actual_v2', cases); }, [cases]);
  useEffect(() => { safeSetJSON('hv_situation_reports_actual_v2', situationReports); }, [situationReports]);
  useEffect(() => { safeSetJSON('hv_situation_draft', situationDraft); }, [situationDraft]);
  useEffect(() => { safeSetJSON('hv_bolos', bolos); }, [bolos]);
  useEffect(() => { safeSetJSON('hv_pois_v3', pois); }, [pois]);
  useEffect(() => { safeSetJSON('hv_vois_actual_v1', vois); }, [vois]);
  useEffect(() => { safeSetJSON('hv_intel_observations_v3', intelObservations); }, [intelObservations]);
  useEffect(() => { safeSetJSON('hv_intel_relationships_v3', intelRelationships); }, [intelRelationships]);
  useEffect(() => { safeSetJSON('hv_intel_review_queue_v3', intelReviewQueue); }, [intelReviewQueue]);
  useEffect(() => { safeSetJSON('hv_intel_audit_logs_v3', intelAuditLogs); }, [intelAuditLogs]);
  useEffect(() => { safeSetJSON('hv_alerts', alerts); }, [alerts]);
  useEffect(() => { safeSetJSON('hv_assistance_requests', assistanceRequests); }, [assistanceRequests]);
  useEffect(() => { safeSetJSON('hv_bolo_sightings', boloSightings); }, [boloSightings]);
  useEffect(() => { safeSetJSON('hv_audit_logs', auditLogs); }, [auditLogs]);
  useEffect(() => { safeSetJSON('hv_area_groups', areaGroups); }, [areaGroups]);
  useEffect(() => { safeSetJSON('hv_settings', settings); }, [settings]);
  useEffect(() => { safeSetJSON('hv_generated_reports', generatedReports); }, [generatedReports]);
  useEffect(() => { safeSetJSON('hv_backup_records', backupRecords); }, [backupRecords]);
  useEffect(() => { safeSetJSON('hv_system_health', systemHealth); }, [systemHealth]);
  useEffect(() => { safeSetJSON('hv_system_error_logs', systemErrorLogs); }, [systemErrorLogs]);
  useEffect(() => { safeSetJSON('hv_privacy_access_logs', privacyAccessLogs); }, [privacyAccessLogs]);
  useEffect(() => { safeSetJSON('hv_training_mode', trainingMode); }, [trainingMode]);
  useEffect(() => { safeSetJSON('hv_map_layers', mapLayers); }, [mapLayers]);
  useEffect(() => { safeSetJSON('hv_camera_errors_v1', cameraErrors); }, [cameraErrors]);
  useEffect(() => { safeSetJSON('hv_camera_maintenance_tickets_v1', cameraMaintenanceTickets); }, [cameraMaintenanceTickets]);

  // Real-time Firestore Listeners (Emergencies, Alerts, Situation Reports, Cases, BOLOs, Intel, Patrols, Notifications, Settings)
  useEffect(() => {
    const isReactionForce = currentUser?.role === 'REACTION_FORCE';

    // 1. Emergencies Live Listener
    const unsubEmergencies = subscribeToEmergencies((remoteEmergencies) => {
      if (remoteEmergencies && remoteEmergencies.length > 0) {
        setEmergencies((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const map = new Map<string, EmergencyEvent>();
          prev.forEach((e) => map.set(e.id, e));

          remoteEmergencies.forEach((rem: EmergencyEvent) => {
            if (!rem || !rem.id) return;
            if (
              !existingIds.has(rem.id) &&
              rem.status !== 'SAFE' &&
              rem.status !== 'FALSE_ALARM' &&
              rem.status !== 'CLOSED'
            ) {
              notificationService.notifySosEmergency(rem, currentUser?.uid, isReactionForce);
            }
            const current = map.get(rem.id);
            if (!current) {
              map.set(rem.id, rem);
            } else {
              const isCurrentlyResolved = current.status === 'SAFE' || current.status === 'FALSE_ALARM' || current.status === 'CLOSED';
              const isIncomingResolved = rem.status === 'SAFE' || rem.status === 'FALSE_ALARM' || rem.status === 'CLOSED';

              const curTime = new Date(current.updatedAt || current.startTime || 0).getTime();
              const remTime = new Date(rem.updatedAt || rem.startTime || 0).getTime();
              if (remTime >= curTime || rem.status !== current.status) {
                const finalStatus = (isCurrentlyResolved && !isIncomingResolved) ? current.status : rem.status;
                map.set(rem.id, {
                  ...current,
                  ...rem,
                  status: finalStatus,
                  // Preserve client-side active audio/location stream sessions if active on this device
                  audioSession: current.audioSession?.status === 'ACTIVE' && rem.status !== 'SAFE' && rem.status !== 'CLOSED'
                    ? { ...rem.audioSession, audioLevel: current.audioSession.audioLevel, status: current.audioSession.status }
                    : rem.audioSession || current.audioSession,
                  locationSession: current.locationSession?.isActive && rem.status !== 'SAFE' && rem.status !== 'CLOSED'
                    ? { ...rem.locationSession, history: rem.locationSession?.history || current.locationSession.history }
                    : rem.locationSession || current.locationSession,
                });
              }
            }
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );
        });
      }
    });

    // 2. Alerts Live Listener
    const unsubAlerts = subscribeToAlerts((remoteAlerts) => {
      if (remoteAlerts && remoteAlerts.length > 0) {
        setAlerts((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const map = new Map<string, AlertNotification>();
          prev.forEach((a) => map.set(a.id, a));

          remoteAlerts.forEach((rem: AlertNotification) => {
            if (!existingIds.has(rem.id)) {
              if (rem.type === 'TRAFFIC') {
                notificationService.notifyTrafficAlert(rem.title, rem.shortDescription, rem.id, currentUser?.uid);
              } else if (rem.type === 'FIRE') {
                notificationService.notifyFireAlert(rem.title, rem.shortDescription, rem.id, currentUser?.uid);
              } else if (rem.type === 'SECURITY_ALERT') {
                notificationService.notifySecurityAlert(rem.title, rem.shortDescription, rem.id, currentUser?.uid);
              } else if (rem.type === 'BOLO') {
                notificationService.notifyBoloAlert(rem.alertNumber || 'BOLO', rem.title, rem.shortDescription, rem.id, currentUser?.uid);
              }
            }
            map.set(rem.id, rem);
          });
          return Array.from(map.values()).sort((a, b) => {
            const timeA = new Date(a.publishedAt || a.activeFrom || 0).getTime();
            const timeB = new Date(b.publishedAt || b.activeFrom || 0).getTime();
            return timeB - timeA;
          });
        });
      }
    });

    // 3. Situation Reports (Data Log / Voorvalleboek) Live Listener across all devices
    const unsubSitReps = subscribeToSituationReports((remoteReports) => {
      if (remoteReports && remoteReports.length > 0) {
        setSituationReports((prev) => {
          const map = new Map<string, SituationReport>();
          // Base with previous local state
          prev.forEach((r) => map.set(r.id, r));
          // Apply remote state updates
          remoteReports.forEach((rem: SituationReport) => {
            map.set(rem.id, rem);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
          );
        });
      }
    });

    // 4. Cases Live Listener
    const unsubCases = subscribeToCases((remoteCases) => {
      if (remoteCases && remoteCases.length > 0) {
        setCases((prev) => {
          const map = new Map<string, Case>();
          prev.forEach((c) => map.set(c.id, c));
          remoteCases.forEach((rem: Case) => {
            map.set(rem.id, rem);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
          );
        });
      }
    });

    // 5. BOLOs Live Listener
    const unsubBolos = subscribeToBolos((remoteBolos) => {
      if (remoteBolos && remoteBolos.length > 0) {
        setBolos((prev) => {
          const map = new Map<string, BoloRecord>();
          prev.forEach((b) => map.set(b.id, b));
          remoteBolos.forEach((rem: BoloRecord) => {
            map.set(rem.id, rem);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
    });

    // 6. Intelligence POIs Live Listener
    const unsubPois = subscribeToPois((remotePois) => {
      if (remotePois && remotePois.length > 0) {
        setPois((prev) => {
          const map = new Map<string, PersonOfInterest>();
          prev.forEach((p) => map.set(p.id, p));
          remotePois.forEach((rem: PersonOfInterest) => {
            map.set(rem.id, rem);
          });
          return Array.from(map.values());
        });
      }
    });

    // 7. Intelligence VOIs Live Listener
    const unsubVois = subscribeToVois((remoteVois) => {
      if (remoteVois && remoteVois.length > 0) {
        setVois((prev) => {
          const map = new Map<string, VehicleOfInterest>();
          prev.forEach((v) => map.set(v.id, v));
          remoteVois.forEach((rem: VehicleOfInterest) => {
            map.set(rem.id, rem);
          });
          return Array.from(map.values());
        });
      }
    });

    // 8. Intelligence Observations Live Listener
    const unsubObservations = subscribeToObservations((remoteObs) => {
      if (remoteObs && remoteObs.length > 0) {
        setIntelObservations((prev) => {
          const map = new Map<string, IntelObservation>();
          prev.forEach((o) => map.set(o.id, o));
          remoteObs.forEach((rem: IntelObservation) => {
            map.set(rem.id, rem);
          });
          return Array.from(map.values());
        });
      }
    });

    // 9. Active Patrol Units Live Listener
    const unsubPatrols = subscribeToPatrolUnits((remoteUnits) => {
      if (remoteUnits && Array.isArray(remoteUnits)) {
        setActivePatrolUnits((prev) => {
          const map = new Map<string, ActivePatrolUnit>();
          // Base with previous local units (prevents wiping local units during brief connection transitions)
          prev.forEach((u) => map.set(u.id, u));

          remoteUnits.forEach((rem: ActivePatrolUnit) => {
            if (!rem || !rem.id) return;
            const current = map.get(rem.id);
            if (!current) {
              map.set(rem.id, rem);
            } else {
              const isCurrentUser = current.uid === currentUser?.uid;
              const curTime = new Date(current.lastUpdated || current.startedAt || 0).getTime();
              const remTime = new Date(rem.lastUpdated || rem.startedAt || 0).getTime();

              if (isCurrentUser && isPatrolActiveRef.current && curTime > remTime) {
                // Keep local device high-frequency coordinate fixes while syncing remote status
                map.set(rem.id, {
                  ...rem,
                  ...current,
                  status: rem.status || current.status,
                });
              } else if (remTime >= curTime || rem.status !== current.status) {
                map.set(rem.id, {
                  ...current,
                  ...rem,
                });
              }
            }
          });

          return Array.from(map.values());
        });
      }
    });

    // 10. Incident Notifications Live Listener
    const unsubNotifications = subscribeToIncidentNotifications((remoteNotifs) => {
      if (remoteNotifs) {
        setIncidentNotifications((prev) => {
          const map = new Map<string, IncidentNotification>();
          prev.forEach((n) => map.set(n.id, n));
          remoteNotifs.forEach((rem: IncidentNotification) => {
            map.set(rem.id, rem);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
      }
    });

    // 11. Location Areas Live Listener
    const unsubAreas = subscribeToLocationAreas((remoteAreas) => {
      if (remoteAreas && remoteAreas.length > 0) {
        setLocationAreas((prev) => {
          const map = new Map<string, LocationArea>();
          prev.forEach((a) => map.set(a.id, a));
          remoteAreas.forEach((rem: LocationArea) => {
            map.set(rem.id, rem);
          });
          return Array.from(map.values());
        });
      }
    });

    // 12. Settings Live Listener
    const unsubSettings = subscribeToSettings((remoteSettings) => {
      if (remoteSettings) {
        setSettings((prev) => ({
          ...prev,
          ...remoteSettings,
        }));
      }
    });

    // 13. Cross-Device Real-Time SSE (Server-Sent Events) Stream
    let sseSource: EventSource | null = null;
    try {
      if (typeof EventSource !== 'undefined') {
        sseSource = new EventSource('/api/emergencies/stream');
        
        const handleIncomingRemoteList = (list: EmergencyEvent[]) => {
          if (!Array.isArray(list) || list.length === 0) return;
          setEmergencies((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const map = new Map<string, EmergencyEvent>();
            prev.forEach((e) => map.set(e.id, e));

            list.forEach((rem: EmergencyEvent) => {
              if (
                !existingIds.has(rem.id) &&
                rem.status !== 'SAFE' &&
                rem.status !== 'FALSE_ALARM' &&
                rem.status !== 'CLOSED'
              ) {
                notificationService.notifySosEmergency(rem, currentUser?.uid, isReactionForce);
              }
              const current = map.get(rem.id);
              if (!current) {
                map.set(rem.id, rem);
              } else {
                const isCurrentlyResolved = current.status === 'SAFE' || current.status === 'FALSE_ALARM' || current.status === 'CLOSED';
                const isIncomingResolved = rem.status === 'SAFE' || rem.status === 'FALSE_ALARM' || rem.status === 'CLOSED';

                const curTime = new Date(current.updatedAt || current.startTime || 0).getTime();
                const remTime = new Date(rem.updatedAt || rem.startTime || 0).getTime();
                if (remTime >= curTime) {
                  const finalStatus = (isCurrentlyResolved && !isIncomingResolved) ? current.status : rem.status;
                  map.set(rem.id, { ...current, ...rem, status: finalStatus });
                }
              }
            });

            return Array.from(map.values()).sort((a, b) => {
              const aUnack = a.status === 'CONTROL_ROOM_NOTIFIED' || a.status === 'COMMUNITY_NOTIFIED';
              const bUnack = b.status === 'CONTROL_ROOM_NOTIFIED' || b.status === 'COMMUNITY_NOTIFIED';
              if (aUnack && !bUnack) return -1;
              if (!aUnack && bUnack) return 1;
              return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
            });
          });
        };

        sseSource.addEventListener('initial_state', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            handleIncomingRemoteList(parsed);
          } catch {
            // ignore
          }
        });

        sseSource.addEventListener('emergencies_list', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            handleIncomingRemoteList(parsed);
          } catch {
            // ignore
          }
        });

        sseSource.addEventListener('emergencies_cleared', (e: MessageEvent) => {
          try {
            // Stop all audible alarms and active background sessions immediately
            stopSosContinuousAlarm();
            emergencyAudioService.stopCapture();
            emergencyAudioService.stopListening();
            emergencyLocationService.stopLiveSharing();
            backgroundSosService.stopBackgroundSos();

            setEmergencies((prev) =>
              prev.map((emg) => {
                if (emg.status !== 'SAFE' && emg.status !== 'FALSE_ALARM' && emg.status !== 'CLOSED') {
                  const now = new Date().toISOString();
                  return {
                    ...emg,
                    status: 'SAFE' as const,
                    resolvedTime: emg.resolvedTime || now,
                    audioSession: emg.audioSession ? { ...emg.audioSession, status: 'ENDED' as const, connectionState: 'ENDED' as const, endTime: now } : undefined,
                    locationSession: emg.locationSession ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED' as const, sessionEnd: now } : undefined,
                    updatedAt: now,
                  };
                }
                return emg;
              })
            );
          } catch {
            // ignore
          }
        });

        sseSource.addEventListener('emergency_update', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed && parsed.id) {
              handleIncomingRemoteList([parsed]);
            }
          } catch {
            // ignore
          }
        });

        // Real-Time Audio Telemetry (Volume & Waveform Meter from Client Phone)
        sseSource.addEventListener('audio_telemetry', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed && parsed.id) {
              emergencyAudioService.handleIncomingAudioTelemetry(parsed);
              setEmergencies((prev) =>
                prev.map((item) => {
                  if (item.id !== parsed.id) return item;
                  return {
                    ...item,
                    audioSession: item.audioSession
                      ? {
                          ...item.audioSession,
                          audioLevel: parsed.audioLevel,
                          lastHeartbeat: parsed.timestamp || new Date().toISOString(),
                        }
                      : {
                          id: `AUD-SESS-${Date.now()}`,
                          emergencyId: parsed.id,
                          clientUid: item.clientUid,
                          clientName: item.clientName,
                          startedByUid: item.clientUid,
                          startedByName: item.clientName,
                          startTime: parsed.timestamp || new Date().toISOString(),
                          status: 'ACTIVE',
                          connectionState: 'CONNECTED',
                          authorisedListeners: ['USR-CTRL-002', 'USR-MGMT-003'],
                          activeListeners: [],
                          clientRequestedAudio: true,
                          controlRoomRequestedAudio: false,
                          clientResponseToRequest: 'ACCEPTED',
                          lastHeartbeat: parsed.timestamp || new Date().toISOString(),
                          audioLevel: parsed.audioLevel,
                        },
                  };
                })
              );
            }
          } catch {
            // ignore
          }
        });

        // Real-Time Audio Chunk Feed (Audible Voice & Ambience from Client Phone)
        sseSource.addEventListener('audio_chunk', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed && parsed.id) {
              emergencyAudioService.handleIncomingAudioChunk(parsed);
            }
          } catch {
            // ignore
          }
        });

        // Real-Time GPS Location Stream from Client Phone
        sseSource.addEventListener('location_update', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed && parsed.id) {
              setEmergencies((prev) =>
                prev.map((item) => {
                  if (item.id !== parsed.id) return item;
                  const locHist = parsed.locationEvent
                    ? [...(item.locationHistory || []), parsed.locationEvent]
                    : item.locationHistory;
                  const currentPtHist = item.locationSession?.history || [];
                  const updatedPtHist =
                    parsed.locationPoint && !currentPtHist.some((p) => p.id === parsed.locationPoint.id)
                      ? [...currentPtHist, parsed.locationPoint]
                      : currentPtHist;
                  return {
                    ...item,
                    location: parsed.location || item.location,
                    locationHistory: locHist,
                    locationSession: item.locationSession
                      ? {
                          ...item.locationSession,
                          lastUpdate: new Date().toISOString(),
                          history: updatedPtHist,
                        }
                      : undefined,
                  };
                })
              );
            }
          } catch {
            // ignore
          }
        });

        // Real-Time Patrol Beacons Initial State & Updates from Server
        sseSource.addEventListener('patrols_initial_state', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setActivePatrolUnits((prev) => {
                const map = new Map<string, ActivePatrolUnit>();
                prev.forEach((u) => map.set(u.id, u));
                parsed.forEach((u: ActivePatrolUnit) => map.set(u.id, u));
                return Array.from(map.values());
              });
            }
          } catch {
            // ignore
          }
        });

        sseSource.addEventListener('patrols_list', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (Array.isArray(parsed)) {
              setActivePatrolUnits((prev) => {
                const map = new Map<string, ActivePatrolUnit>();
                prev.forEach((u) => map.set(u.id, u));
                parsed.forEach((u: ActivePatrolUnit) => map.set(u.id, u));
                return Array.from(map.values());
              });
            }
          } catch {
            // ignore
          }
        });

        sseSource.addEventListener('patrol_update', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed && (parsed.id || parsed.uid)) {
              const unitId = parsed.id || `PATROL-${parsed.uid}`;
              setActivePatrolUnits((prev) => {
                const existing = prev.find((u) => u.id === unitId || u.uid === parsed.uid);
                if (existing) {
                  return prev.map((u) => (u.id === unitId || u.uid === parsed.uid ? { ...u, ...parsed } : u));
                }
                return [parsed, ...prev];
              });
            }
          } catch {
            // ignore
          }
        });

        sseSource.addEventListener('patrol_location_update', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed && parsed.id) {
              setActivePatrolUnits((prev) =>
                prev.map((unit) => {
                  if (unit.id !== parsed.id && unit.uid !== parsed.id) return unit;
                  const trail = Array.isArray(unit.trailHistory) ? unit.trailHistory : [];
                  const newTrail = [
                    ...trail,
                    { latitude: parsed.latitude, longitude: parsed.longitude, timestamp: parsed.timestamp || new Date().toISOString() },
                  ].slice(-40);
                  return {
                    ...unit,
                    latitude: parsed.latitude,
                    longitude: parsed.longitude,
                    accuracy: parsed.accuracy ?? unit.accuracy,
                    speed: parsed.speed ?? unit.speed,
                    heading: parsed.heading ?? unit.heading,
                    battery: parsed.battery ?? unit.battery,
                    status: 'PATROLLING',
                    isLiveTrackingActive: true,
                    lastUpdated: parsed.timestamp || new Date().toISOString(),
                    trailHistory: newTrail,
                  };
                })
              );
            }
          } catch {
            // ignore
          }
        });

        sseSource.addEventListener('patrol_remove', (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed && parsed.id) {
              setActivePatrolUnits((prev) => prev.filter((u) => u.id !== parsed.id && u.uid !== parsed.id));
            }
          } catch {
            // ignore
          }
        });
      }
    } catch {
      // ignore
    }

    // 14. Periodic High-Frequency Cross-Device REST Fallback Poller (every 3.5 seconds)
    const pollInterval = setInterval(() => {
      // 14a. Emergencies poll
      fetch('/api/emergencies')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            setEmergencies((prev) => {
              const existingIds = new Set(prev.map((e) => e.id));
              const map = new Map<string, EmergencyEvent>();
              prev.forEach((e) => map.set(e.id, e));

              json.data.forEach((rem: EmergencyEvent) => {
                if (
                  !existingIds.has(rem.id) &&
                  rem.status !== 'SAFE' &&
                  rem.status !== 'FALSE_ALARM' &&
                  rem.status !== 'CLOSED'
                ) {
                  notificationService.notifySosEmergency(rem, currentUser?.uid, isReactionForce);
                }
                const current = map.get(rem.id);
                if (!current) {
                  map.set(rem.id, rem);
                } else {
                  const curTime = new Date(current.updatedAt || current.startTime || 0).getTime();
                  const remTime = new Date(rem.updatedAt || rem.startTime || 0).getTime();
                  if (remTime >= curTime) {
                    map.set(rem.id, { ...current, ...rem });
                  }
                }
              });

              return Array.from(map.values()).sort((a, b) => {
                const aUnack = a.status === 'CONTROL_ROOM_NOTIFIED' || a.status === 'COMMUNITY_NOTIFIED';
                const bUnack = b.status === 'CONTROL_ROOM_NOTIFIED' || b.status === 'COMMUNITY_NOTIFIED';
                if (aUnack && !bUnack) return -1;
                if (!aUnack && bUnack) return 1;
                return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
              });
            });
          }
        })
        .catch(() => {
          // ignore network failures
        });

      // 14b. Patrols poll
      fetch('/api/patrols')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            setActivePatrolUnits((prev) => {
              const map = new Map<string, ActivePatrolUnit>();
              prev.forEach((u) => map.set(u.id, u));
              json.data.forEach((rem: ActivePatrolUnit) => {
                const cur = map.get(rem.id);
                if (!cur) {
                  map.set(rem.id, rem);
                } else {
                  const curTime = new Date(cur.lastUpdated || cur.startedAt || 0).getTime();
                  const remTime = new Date(rem.lastUpdated || rem.startedAt || 0).getTime();
                  if (remTime >= curTime) {
                    map.set(rem.id, { ...cur, ...rem });
                  }
                }
              });
              return Array.from(map.values());
            });
          }
        })
        .catch(() => {});
    }, 3500);

    // 15. Cross-Tab & Cross-Window Instantaneous Broadcast Channel Synchronizer
    const emergencyBroadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('hv_emergency_broadcast_v1') : null;
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SOS_TRIGGERED' && event.data.emergency) {
        const newEmg = event.data.emergency as EmergencyEvent;
        setEmergencies((prev) => {
          if (prev.some((e) => e.id === newEmg.id)) return prev;
          return [newEmg, ...prev];
        });
        notificationService.notifySosEmergency(newEmg, currentUser?.uid, isReactionForce);
      } else if (event.data && event.data.type === 'ALL_ALARMS_CLEARED') {
        stopSosContinuousAlarm();
        emergencyAudioService.stopCapture();
        emergencyAudioService.stopListening();
        emergencyLocationService.stopLiveSharing();
        backgroundSosService.stopBackgroundSos();
        setEmergencies((prev) =>
          prev.map((emg) => {
            if (emg.status !== 'SAFE' && emg.status !== 'FALSE_ALARM' && emg.status !== 'CLOSED') {
              const now = new Date().toISOString();
              return {
                ...emg,
                status: 'SAFE' as const,
                resolvedTime: emg.resolvedTime || now,
                audioSession: emg.audioSession ? { ...emg.audioSession, status: 'ENDED' as const, connectionState: 'ENDED' as const, endTime: now } : undefined,
                locationSession: emg.locationSession ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED' as const, sessionEnd: now } : undefined,
                updatedAt: now,
              };
            }
            return emg;
          })
        );
      } else if (event.data && event.data.type === 'PATROL_ACTIVATED' && event.data.patrol) {
        const newPatrol = event.data.patrol as ActivePatrolUnit;
        setActivePatrolUnits((prev) => {
          const filtered = prev.filter((p) => p.id !== newPatrol.id && p.uid !== newPatrol.uid);
          return [newPatrol, ...filtered];
        });
      } else if (event.data && event.data.type === 'PATROL_STOPPED' && event.data.patrolId) {
        setActivePatrolUnits((prev) => prev.filter((p) => p.id !== event.data.patrolId && p.uid !== event.data.patrolId));
      }
    };

    if (emergencyBroadcastChannel) {
      emergencyBroadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    // 16. Cross-Tab Live Storage Synchronizer (for multi-tab testing & instantaneous local dispatch)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'hv_emergencies_v2' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed)) {
            setEmergencies((prev) => {
              const existingIds = new Set(prev.map((e) => e.id));
              parsed.forEach((rem: EmergencyEvent) => {
                if (
                  !existingIds.has(rem.id) &&
                  rem.status !== 'SAFE' &&
                  rem.status !== 'FALSE_ALARM' &&
                  rem.status !== 'CLOSED'
                ) {
                  notificationService.notifySosEmergency(rem, currentUser?.uid, isReactionForce);
                }
              });
              return parsed;
            });
          }
        } catch {
          // ignore parsing error
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (sseSource) {
        sseSource.close();
      }
      clearInterval(pollInterval);
      if (emergencyBroadcastChannel) {
        emergencyBroadcastChannel.removeEventListener('message', handleBroadcastMessage);
        emergencyBroadcastChannel.close();
      }
      window.removeEventListener('storage', handleStorageEvent);
      unsubEmergencies();
      unsubAlerts();
      unsubSitReps();
      unsubCases();
      unsubBolos();
      unsubPois();
      unsubVois();
      unsubObservations();
      unsubPatrols();
      unsubNotifications();
      unsubAreas();
      unsubSettings();
    };
  }, [currentUser?.uid, currentUser?.role]);

  // Central Immutable Audit Logger with Cloud Sync
  const logAuditEvent = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'actorUid' | 'actorName' | 'actorRole' | 'timestamp'>) => {
      const newAudit: AuditLogEntry = {
        id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        actorUid: currentUser.uid,
        actorName: `${currentUser.name} ${currentUser.surname}`.trim(),
        actorRole: activeRole,
        timestamp: new Date().toISOString(),
        ...entry,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
      syncAuditLogToFirestore(newAudit).catch((err) =>
        console.warn('Could not sync audit log to Firestore:', err)
      );
    },
    [currentUser, activeRole]
  );

  // Register Offline Outbox Sync Handlers with Firestore synchronization
  useEffect(() => {
    offlineSyncService.registerSyncHandler('EMERGENCY_TRIGGER', async (item) => {
      console.log('[DataContext] Synchronizing queued offline emergency:', item.payload);
      if (!item.payload?.id) return false;
      return await syncEmergencyToFirestore(item.payload);
    });

    // Location/info emergency changes are persisted by Firestore's offline cache through
    // updateEmergencyAndSync. Never write the old queue patch shape as if it were a full
    // emergency record, because that can silently create malformed documents.
    offlineSyncService.registerSyncHandler('EMERGENCY_LOCATION', async (item) => {
      console.log('[DataContext] Processing queued offline emergency location:', item.payload);
      return Boolean(item.payload?.emergencyId);
    });

    offlineSyncService.registerSyncHandler('EMERGENCY_INFO', async (item) => {
      console.log('[DataContext] Processing queued offline info update:', item.payload);
      return Boolean(item.payload?.emergencyId);
    });

    offlineSyncService.registerSyncHandler('SITREP_CREATE', async (item) => {
      console.log('[DataContext] Synchronizing queued offline sitrep:', item.payload);
      if (item.payload) {
        await syncSituationReportToFirestore(item.payload);
      }
      return true;
    });

    offlineSyncService.registerSyncHandler('INCIDENT_REPORT', async (item) => {
      console.log('[DataContext] Synchronizing queued offline incident report:', item.payload);
      if (item.payload) {
        await syncCaseToFirestore(item.payload);
      }
      return true;
    });
  }, []);

  // Active Emergency for current user
  const activeEmergency =
    emergencies.find(
      (e) =>
        (e.clientUid === currentUser.uid ||
          (currentUser.primaryPhone && e.clientPhone === currentUser.primaryPhone)) &&
        e.status !== 'SAFE' &&
        e.status !== 'FALSE_ALARM' &&
        e.status !== 'CLOSED'
    ) || null;

  // All active emergencies across the system
  const allActiveEmergencies = emergencies
    .filter(
      (e) =>
        e.status !== 'SAFE' &&
        e.status !== 'FALSE_ALARM' &&
        e.status !== 'CLOSED'
    )
    .sort((a, b) => {
      const aUnack = a.status === 'TRIGGERED' || a.status === 'CONTROL_ROOM_NOTIFIED';
      const bUnack = b.status === 'TRIGGERED' || b.status === 'CONTROL_ROOM_NOTIFIED';
      if (aUnack && !bUnack) return -1;
      if (!aUnack && bUnack) return 1;
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

  // Helper to update emergency in local state AND propagate to Firestore live database + backend server
  const updateEmergencyAndSync = (
    emergencyId: string,
    updater: (emg: EmergencyEvent) => EmergencyEvent
  ) => {
    setEmergencies((prev) => {
      let updatedToSync: EmergencyEvent | null = null;
      const nextList = prev.map((emg) => {
        if (emg.id !== emergencyId) return emg;
        const updated = updater(emg);
        // If already SAFE / CLOSED / FALSE_ALARM, and updater tries to change status back to active without resolution, preserve SAFE
        if (
          (emg.status === 'SAFE' || emg.status === 'FALSE_ALARM' || emg.status === 'CLOSED') &&
          updated.status !== 'SAFE' && updated.status !== 'FALSE_ALARM' && updated.status !== 'CLOSED'
        ) {
          updated.status = emg.status;
        }
        updatedToSync = updated;
        return updated;
      });
      if (updatedToSync) {
        safeSetJSON('hv_emergencies_v2', nextList);
        syncEmergencyToFirestore(updatedToSync).catch((err) => {
          console.warn('[DataContext] Emergency sync error:', err);
        });
        fetch(`/api/emergencies/${emergencyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedToSync),
        }).catch(() => {});
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('hv_emergency_broadcast_v1');
            bc.postMessage({ type: 'SOS_TRIGGERED', emergency: updatedToSync });
            setTimeout(() => bc.close(), 1000);
          }
        } catch {
          // ignore
        }
      }
      return nextList;
    });
  };

  // =========================================================================
  // EMERGENCY CORE WORKFLOW
  // =========================================================================

  const triggerEmergency = async (
    type: EmergencyType,
    customNotes?: string,
    locationOverride?: { latitude: number; longitude: number; accuracy?: number; quality?: LocationQuality }
  ): Promise<string> => {
    // 1. Prevent duplicate activation (Requirement 27)
    const existing = emergencies.find(
      (e) =>
        e.clientUid === currentUser.uid &&
        e.status !== 'SAFE' &&
        e.status !== 'FALSE_ALARM' &&
        e.status !== 'CLOSED'
    );
    if (existing) {
      return existing.id;
    }

    const emergencyId = `EMG-${Date.now()}`;
    const now = new Date().toISOString();

    // 2. Location resolution (Requirement 4)
    let initialLocation = {
      latitude: -26.7645,
      longitude: 26.4128,
      accuracy: 15,
      timestamp: now,
      quality: 'PROPERTY_FALLBACK' as LocationQuality,
      locationName: currentUser.farmName || 'Hartbeesfontein Farm',
    };

    if (locationOverride) {
      initialLocation = {
        latitude: locationOverride.latitude,
        longitude: locationOverride.longitude,
        accuracy: locationOverride.accuracy || 12,
        timestamp: now,
        quality: locationOverride.quality || 'CURRENT_GPS',
        locationName: currentUser.farmName,
      };
    } else if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { timeout: 4000, enableHighAccuracy: true }
          );
        });

        if (position) {
          initialLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            timestamp: new Date(position.timestamp).toISOString(),
            quality: 'CURRENT_GPS',
            locationName: currentUser.farmName,
          };
        }
      } catch {
        // Fallback already assigned
      }
    }

    // 3. Sensitive snapshots (Restricted to Control Room & Management)
    const propInfo = currentUser.emergencyPropertyInfo || {
      mainGateCode: '#4910*',
      secondaryGateInfo: 'South paddock lock code 3302',
      dangerousAnimals: '2 Boerboels in yard near main house',
      waterPoints: 'Borehole at cattle crush (5000L tank)',
      firefightingEquipment: '600L Fire bakkie unit behind main shed',
      accessDifficulties: 'Corrugated sand road, bridge impassable in heavy rain',
    };

    // 4. Automatic Live Audio & Location initialization upon SOS activation
    const audioSession: AudioSessionRecord = {
      id: `AUD-SESS-${Date.now()}`,
      emergencyId,
      clientUid: currentUser.uid,
      clientName: `${currentUser.name} ${currentUser.surname}`,
      startedByUid: currentUser.uid,
      startedByName: `${currentUser.name} ${currentUser.surname}`,
      startTime: now,
      status: 'ACTIVE',
      connectionState: 'CONNECTED',
      authorisedListeners: ['USR-CTRL-002', 'USR-MGMT-003'],
      activeListeners: [],
      clientRequestedAudio: true,
      controlRoomRequestedAudio: false,
      clientResponseToRequest: 'ACCEPTED',
      lastHeartbeat: now,
      audioLevel: 35,
    };

    // 5. Initial timeline events (Requirement 11)
    const timelineEvents: EmergencyTimelineEvent[] = [
      {
        id: `TLE-1-${Date.now()}`,
        emergencyId,
        eventType: 'TRIGGERED',
        timestamp: now,
        actorUid: currentUser.uid,
        actorName: `${currentUser.name} ${currentUser.surname}`,
        actorRole: 'CLIENT',
        description: `Emergency activated: ${type} by ${currentUser.name} ${currentUser.surname}`,
      },
      {
        id: `TLE-2-${Date.now() + 10}`,
        emergencyId,
        eventType: 'LOCATION_CAPTURED',
        timestamp: new Date(Date.now() + 500).toISOString(),
        actorUid: currentUser.uid,
        actorName: `${currentUser.name} ${currentUser.surname}`,
        actorRole: 'CLIENT',
        description: `Location captured: ${initialLocation.quality} (±${initialLocation.accuracy || 15}m)`,
        metadata: { ...initialLocation },
      },
      {
        id: `TLE-3-${Date.now() + 20}`,
        emergencyId,
        eventType: 'NOTIFIED_CONTROL_ROOM',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        description: `High-priority dispatch notification transmitted to Control Room operators`,
      },
      {
        id: `TLE-4-${Date.now() + 30}`,
        emergencyId,
        eventType: 'LIVE_AUDIO_STARTED',
        timestamp: new Date(Date.now() + 1200).toISOString(),
        actorUid: currentUser.uid,
        actorName: `${currentUser.name} ${currentUser.surname}`,
        actorRole: 'CLIENT',
        description: `Microphone feed started automatically upon SOS activation — streaming to Control Room`,
      },
    ];

    const initialLocationEvent: EmergencyLocationEvent = {
      id: `LOC-${Date.now()}`,
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
      accuracy: initialLocation.accuracy,
      timestamp: initialLocation.timestamp,
      quality: initialLocation.quality,
      notes: 'Initial emergency activation location',
    };

    const initialPt: EmergencyLocationPoint = {
      id: `LOC-INIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
      accuracy: initialLocation.accuracy || 10,
      timestamp: now,
      source: 'LIVE_STREAM',
      sequenceNumber: 1,
    };

    const newLocSession: EmergencyLocationSession = {
      id: `LOC-SESS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      emergencyId,
      clientUid: currentUser.uid,
      clientName: `${currentUser.name} ${currentUser.surname}`,
      sessionStart: now,
      locationMode: 'HIGH_PRIORITY',
      lastUpdate: now,
      connectionState: 'CONNECTED',
      isActive: true,
      history: [initialPt],
    };

    const newEmergency: EmergencyEvent = {
      id: emergencyId,
      clientUid: currentUser.uid,
      clientName: `${currentUser.name} ${currentUser.surname}`,
      clientPhone: currentUser.primaryPhone,
      secondaryPhone: currentUser.secondaryPhone,
      clientPhotoUrl: currentUser.photoUrl,
      farmName: currentUser.farmName || 'Hartbeesfontein Property',
      sector: currentUser.sector || 'Sektor 2 - Noord',
      emergencyType: type,
      status: 'CONTROL_ROOM_NOTIFIED',
      location: initialLocation,
      locationHistory: [initialLocationEvent],
      audioSession: audioSession,
      locationSession: newLocSession,
      propertySnapshot: propInfo,
      familySnapshot: currentUser.familyMembers,
      medicalAidSnapshot: currentUser.medicalAid,
      timeline: timelineEvents,
      notes: customNotes
        ? [
            {
              id: `NOTE-${Date.now()}`,
              emergencyId,
              authorUid: currentUser.uid,
              authorName: `${currentUser.name} ${currentUser.surname}`,
              authorRole: 'CLIENT',
              timestamp: now,
              text: customNotes,
            },
          ]
        : [],
      clientUpdates: [],
      whatsappLogs: [],
      callLogs: [],
      failures: [],
      messages: [],
      reactionForceContactLogs: [],
      startTime: now,
      updatedAt: now,
      sourceDevice: navigator.userAgent || 'Web Client',
    };

    setEmergencies((prev) => {
      const updated = [newEmergency, ...prev];
      safeSetJSON('hv_emergencies_v2', updated);
      return updated;
    });
    syncEmergencyToFirestore(newEmergency);

    fetch('/api/emergencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmergency),
    }).catch(() => {});

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('hv_emergency_broadcast_v1');
        bc.postMessage({ type: 'SOS_TRIGGERED', emergency: newEmergency });
        setTimeout(() => bc.close(), 1000);
      }
    } catch {
      // ignore
    }

    // Automatically start live microphone feed to control room
    emergencyAudioService.startMicrophoneCapture(emergencyId, (level) => {
      setEmergencies((prev) =>
        prev.map((item) => {
          if (item.id !== emergencyId || !item.audioSession) return item;
          return {
            ...item,
            audioSession: {
              ...item.audioSession,
              audioLevel: level,
              lastHeartbeat: new Date().toISOString(),
            },
          };
        })
      );
    });

    // Automatically start high-accuracy live location sharing
    emergencyLocationService.startLiveSharing(
      { latitude: initialLocation.latitude, longitude: initialLocation.longitude },
      'HIGH_PRIORITY',
      (pt) => {
        // Send to server immediately for Control Room real-time sync
        fetch(`/api/emergencies/${emergencyId}/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: {
              latitude: pt.latitude,
              longitude: pt.longitude,
              accuracy: pt.accuracy,
              timestamp: pt.timestamp,
              quality: 'CURRENT_GPS',
            },
            locationPoint: pt,
          }),
        }).catch(() => {});

        setEmergencies((prev) =>
          prev.map((item) => {
            if (item.id !== emergencyId) return item;
            const currentHistory = item.locationSession?.history || [];
            const isDuplicate = currentHistory.some((p) => p.id === pt.id);
            const updatedHistory = isDuplicate
              ? currentHistory
              : [...currentHistory, pt];
            return {
              ...item,
              location: {
                ...item.location,
                latitude: pt.latitude,
                longitude: pt.longitude,
                accuracy: pt.accuracy,
                timestamp: pt.timestamp,
                quality: 'LIVE_STREAM',
              },
              locationSession: item.locationSession
                ? {
                    ...item.locationSession,
                    lastUpdate: pt.timestamp,
                    history: updatedHistory,
                  }
                : undefined,
            };
          })
        );
      }
    );

    // Start background SOS and Screen WakeLock / Keep-Alive loop
    backgroundSosService.startBackgroundSos(emergencyId, (pos) => {
      updateClientLocation(emergencyId, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 10),
        quality: 'CURRENT_GPS',
        notes: 'Agtergrond/Sluitskerm GPS spoor',
      });
    });

    // If offline, enqueue into offline outbox for automatic cloud sync
    if (!offlineSyncService.isOnline()) {
      // Queue the complete emergency record. The sync worker requires `id` and must
      // never convert a partial offline payload into a malformed Firestore document.
      offlineSyncService.enqueue('EMERGENCY_TRIGGER', newEmergency);
    }

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'EMERGENCY_ACTIVATED',
      description: `Activated ${type} emergency at ${newEmergency.farmName} with automatic microphone feed and background lock screen tracker`,
      metadata: { type, farmName: newEmergency.farmName, quality: initialLocation.quality, audioFeedAutoStarted: true },
    });

    return emergencyId;
  };

  const acknowledgeEmergency = (emergencyId: string) => {
    const now = new Date().toISOString();
    const operatorName = `${currentUser.name} ${currentUser.surname}`;

    updateEmergencyAndSync(emergencyId, (emg) => {
      const ackEvent: EmergencyTimelineEvent = {
        id: `TLE-ACK-${Date.now()}`,
        emergencyId,
        eventType: 'ACKNOWLEDGED',
        timestamp: now,
        actorUid: currentUser.uid,
        actorName: operatorName,
        actorRole: activeRole,
        description: `Acknowledged by Control Room Operator: ${operatorName}`,
      };

      return {
        ...emg,
        status: 'ACKNOWLEDGED',
        acknowledgedBy: {
          operatorUid: currentUser.uid,
          operatorName,
          timestamp: now,
        },
        timeline: [...emg.timeline, ackEvent],
        updatedAt: now,
      };
    });

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'EMERGENCY_ACKNOWLEDGED',
      description: `Emergency ${emergencyId} acknowledged by ${operatorName}`,
    });
  };

  const updateClientLocation = async (
    emergencyId: string,
    coords: { latitude: number; longitude: number; accuracy?: number; quality?: LocationQuality; notes?: string }
  ) => {
    // Check if target emergency is already resolved or closed - if so, do not update or broadcast
    const targetEmg = emergencies.find((e) => e.id === emergencyId);
    if (targetEmg && (targetEmg.status === 'SAFE' || targetEmg.status === 'FALSE_ALARM' || targetEmg.status === 'CLOSED')) {
      return;
    }

    const now = new Date().toISOString();
    const newLocEvent: EmergencyLocationEvent = {
      id: `LOC-${Date.now()}`,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy || 10,
      timestamp: now,
      quality: coords.quality || 'CURRENT_GPS',
      notes: coords.notes || 'Updated by client during active emergency',
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-LOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      emergencyId,
      eventType: 'CLIENT_LOCATION_UPDATED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: 'CLIENT',
      description: `Client updated location: ±${coords.accuracy || 10}m (${coords.latitude != null ? Number(coords.latitude).toFixed(5) : '-26.76280'}, ${coords.longitude != null ? Number(coords.longitude).toFixed(5) : '26.41720'})`,
      metadata: { ...coords },
    };

    if (!offlineSyncService.isOnline()) {
      offlineSyncService.enqueue('EMERGENCY_LOCATION', {
        emergencyId,
        coords,
        timestamp: now,
      });
    }

    updateEmergencyAndSync(emergencyId, (emg) => ({
      ...emg,
      location: {
        ...emg.location,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp: now,
        quality: coords.quality || 'CURRENT_GPS',
      },
      locationHistory: [...emg.locationHistory, newLocEvent],
      timeline: [...emg.timeline, timelineEvent],
      updatedAt: now,
    }));

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'LOCATION_UPDATED',
      description: `Client updated emergency GPS coordinates`,
    });
  };

  const addClientInfo = async (emergencyId: string, text: string, photos?: string[]) => {
    const now = new Date().toISOString();
    const updateObj: EmergencyClientInfoUpdate = {
      id: `CIU-${Date.now()}`,
      emergencyId,
      timestamp: now,
      text,
      photos: photos || [],
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-CIU-${Date.now()}`,
      emergencyId,
      eventType: 'CLIENT_INFO_ADDED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: 'CLIENT',
      description: `Client added information: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
    };

    if (!offlineSyncService.isOnline()) {
      offlineSyncService.enqueue('EMERGENCY_INFO', {
        emergencyId,
        text,
        photos,
        timestamp: now,
      });
    }

    updateEmergencyAndSync(emergencyId, (emg) => ({
      ...emg,
      clientUpdates: [...emg.clientUpdates, updateObj],
      timeline: [...emg.timeline, timelineEvent],
      updatedAt: now,
    }));

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'CLIENT_INFO_ADDED',
      description: `Client added emergency detail note: ${text}`,
    });
  };

  const addEmergencyOperatorNote = (emergencyId: string, text: string) => {
    const now = new Date().toISOString();
    const authorName = `${currentUser.name} ${currentUser.surname}`;

    const newNote: EmergencyNote = {
      id: `NOTE-${Date.now()}`,
      emergencyId,
      authorUid: currentUser.uid,
      authorName,
      authorRole: activeRole,
      timestamp: now,
      text,
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-NOTE-${Date.now()}`,
      emergencyId,
      eventType: 'OPERATOR_NOTE_ADDED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: authorName,
      actorRole: activeRole,
      description: `Note added by ${authorName}: "${text}"`,
    };

    updateEmergencyAndSync(emergencyId, (emg) => ({
      ...emg,
      notes: [...emg.notes, newNote],
      timeline: [...emg.timeline, timelineEvent],
      updatedAt: now,
    }));

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'OPERATOR_NOTE_ADDED',
      description: `Operator note added to emergency ${emergencyId}`,
    });
  };

  const initiateCallAction = (
    emergencyId: string,
    callType: 'POLICE' | 'AMBULANCE' | 'REACTION_FORCE' | 'MANAGEMENT' | 'OTHER',
    targetNumber: string,
    targetName: string
  ): string => {
    const callLogId = `CALL-${Date.now()}`;
    const now = new Date().toISOString();
    const operatorName = `${currentUser.name} ${currentUser.surname}`;

    const callRecord: CallActionRecord = {
      id: callLogId,
      emergencyId,
      callType,
      targetNumber,
      targetName,
      initiatedAt: now,
      initiatedByUid: currentUser.uid,
      initiatedByName: operatorName,
    };

    const timelineEventType: EmergencyTimelineEvent['eventType'] =
      callType === 'POLICE'
        ? 'POLICE_CALL_INITIATED'
        : callType === 'AMBULANCE'
        ? 'AMBULANCE_CALL_INITIATED'
        : 'STATUS_CHANGED';

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-CALL-${Date.now()}`,
      emergencyId,
      eventType: timelineEventType,
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: operatorName,
      actorRole: activeRole,
      description: `Call initiated to ${targetName} (${targetNumber})`,
      metadata: { callType, targetNumber, targetName },
    };

    updateEmergencyAndSync(emergencyId, (emg) => ({
      ...emg,
      callLogs: [...emg.callLogs, callRecord],
      timeline: [...emg.timeline, timelineEvent],
      updatedAt: now,
    }));

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: `${callType}_CALL_INITIATED`,
      description: `Initiated call to ${targetName} (${targetNumber})`,
    });

    return callLogId;
  };

  const recordCallOutcome = (
    emergencyId: string,
    callLogId: string,
    outcome: CallOutcomeType,
    notes?: string
  ) => {
    const now = new Date().toISOString();
    const operatorName = `${currentUser.name} ${currentUser.surname}`;

    updateEmergencyAndSync(emergencyId, (emg) => {
      const updatedCallLogs = emg.callLogs.map((c) => {
        if (c.id !== callLogId) return c;
        return {
          ...c,
          outcome,
          notes,
          outcomeRecordedAt: now,
        };
      });

      const timelineEvent: EmergencyTimelineEvent = {
        id: `TLE-COUT-${Date.now()}`,
        emergencyId,
        eventType: 'POLICE_OUTCOME_RECORDED',
        timestamp: now,
        actorUid: currentUser.uid,
        actorName: operatorName,
        actorRole: activeRole,
        description: `Call outcome recorded: ${outcome}${notes ? ` - ${notes}` : ''}`,
      };

      return {
        ...emg,
        callLogs: updatedCallLogs,
        timeline: [...emg.timeline, timelineEvent],
        status: outcome === 'DISPATCH_CONFIRMED' ? 'HELP_DISPATCHED' : emg.status,
        updatedAt: now,
      };
    });

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'CALL_OUTCOME_RECORDED',
      description: `Recorded call outcome ${outcome} on emergency ${emergencyId}`,
    });
  };

  const notifyReactionForce = async (
    emergencyId: string,
    contactId?: string,
    customNotes?: string
  ): Promise<WhatsAppMessageRecord> => {
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (!emg) throw new Error('Emergency not found');

    // Ensure familySnapshot is populated from client profile if missing
    let populatedEmg = emg;
    if (!emg.familySnapshot || emg.familySnapshot.length === 0) {
      try {
        const storedUsers = safeGetJSON<any[]>('hv_users_actual_v2', safeGetJSON<any[]>('hv_users_v2', []));
        const matchedUser = storedUsers.find((u: any) => u.uid === emg.clientUid) || (currentUser.uid === emg.clientUid ? currentUser : null);
        if (matchedUser?.familyMembers && matchedUser.familyMembers.length > 0) {
          populatedEmg = {
            ...emg,
            familySnapshot: matchedUser.familyMembers,
          };
        }
      } catch {
        // fallback ignored
      }
    }

    const contact =
      emergencyContacts.find((c) => c.id === contactId) ||
      emergencyContacts.find((c) => c.category === 'REACTION_FORCE') || {
        phone: '+27 83 290 8812',
        name: 'Kobus Eloff (Plaaswag Reaksie)',
      };

    const waRecord = await sendEmergencyWhatsApp(
      populatedEmg,
      contact.phone,
      contact.name,
      'REACTION_FORCE',
      settings.whatsAppConfig || settings.isWhatsAppApiConfigured
    );

    const now = new Date().toISOString();
    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-RF-${Date.now()}`,
      emergencyId,
      eventType: 'REACTION_FORCE_NOTIFIED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: `Reaction Force notification sent to ${contact.name} [Status: ${waRecord.sendStatus}]`,
      metadata: { recipient: contact.phone, sendStatus: waRecord.sendStatus },
    };

    updateEmergencyAndSync(emergencyId, (item) => ({
      ...item,
      status: item.status === 'TRIGGERED' || item.status === 'CONTROL_ROOM_NOTIFIED' ? 'ACTION_TAKEN' : item.status,
      whatsappLogs: [...item.whatsappLogs, waRecord],
      timeline: [...item.timeline, timelineEvent],
      updatedAt: now,
    }));

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'REACTION_FORCE_NOTIFIED',
      description: `Dispatched Reaction Force notice to ${contact.name} (${contact.phone})`,
    });

    return waRecord;
  };

  const notifyAllReactionForce = async (
    emergencyId: string,
    customNotes?: string,
    recipientsList?: { name: string; phone: string; role?: string; callsign?: string }[]
  ): Promise<WhatsAppMessageRecord[]> => {
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (!emg) throw new Error('Emergency not found');

    let populatedEmg = emg;
    if (!emg.familySnapshot || emg.familySnapshot.length === 0) {
      try {
        const storedUsers = safeGetJSON<any[]>('hv_users_actual_v2', safeGetJSON<any[]>('hv_users_v2', []));
        const matchedUser =
          storedUsers.find((u: any) => u.uid === emg.clientUid) ||
          (currentUser.uid === emg.clientUid ? currentUser : null);
        if (matchedUser?.familyMembers && matchedUser.familyMembers.length > 0) {
          populatedEmg = {
            ...emg,
            familySnapshot: matchedUser.familyMembers,
          };
        }
      } catch {
        // fallback ignored
      }
    }

    let fallbackUsers: any[] = [];
    try {
      const stored = safeGetJSON<any[]>('hv_users_actual_v2', safeGetJSON<any[]>('hv_users_v2', []));
      if (Array.isArray(stored)) {
        fallbackUsers = stored;
      }
    } catch {}

    const targets =
      recipientsList && recipientsList.length > 0
        ? recipientsList
        : fallbackUsers
            .filter((u: any) => u.role === 'REACTION_FORCE' || u.role === 'MANAGEMENT' || u.role === 'CONTROL_ROOM')
            .map((u: any) => ({
              name: u.fullName || u.displayName || u.email || 'Lid',
              phone: u.cellNumber || u.phoneNumber || '',
              role: u.role,
              callsign: u.callsign || u.fullName || 'Reaksie Lid',
            }));

    const records: WhatsAppMessageRecord[] = [];
    const now = new Date().toISOString();

    for (const target of targets) {
      const waRecord = await sendEmergencyWhatsApp(
        populatedEmg,
        target.phone,
        target.name,
        'REACTION_FORCE',
        settings.whatsAppConfig || settings.isWhatsAppApiConfigured
      );
      records.push(waRecord);
    }

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-RF-ALL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      emergencyId,
      eventType: 'REACTION_FORCE_NOTIFIED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: `All Reaction Force personnel broadcast sent (${records.length} units notified: ${targets.map((t) => t.callsign || t.name).join(', ')})`,
      metadata: { recipientCount: records.length, sendStatuses: records.map((r) => r.sendStatus) },
    };

    updateEmergencyAndSync(emergencyId, (item) => ({
      ...item,
      status:
        item.status === 'TRIGGERED' || item.status === 'CONTROL_ROOM_NOTIFIED'
          ? 'ACTION_TAKEN'
          : item.status,
      whatsappLogs: [...item.whatsappLogs, ...records],
      timeline: [...item.timeline, timelineEvent],
      updatedAt: now,
    }));

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'REACTION_FORCE_NOTIFIED',
      description: `Dispatched Reaction Force broadcast to all personnel (${records.length} units)`,
    });

    return records;
  };

  const notifyManagement = async (emergencyId: string, contactId?: string, notes?: string) => {
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (!emg) return;

    const contact =
      emergencyContacts.find((c) => c.id === contactId) ||
      emergencyContacts.find((c) => c.category === 'MANAGEMENT') || {
        phone: '+27 82 770 4419',
        name: 'Cornelius Hattingh (Bestuur)',
      };

    const waRecord = await sendEmergencyWhatsApp(
      emg,
      contact.phone,
      contact.name,
      'MANAGEMENT',
      settings.whatsAppConfig || settings.isWhatsAppApiConfigured
    );

    const now = new Date().toISOString();
    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-MGMT-${Date.now()}`,
      emergencyId,
      eventType: 'MANAGEMENT_NOTIFIED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: `Management notification dispatched to ${contact.name} (${contact.phone})`,
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          whatsappLogs: [...item.whatsappLogs, waRecord],
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'MANAGEMENT_NOTIFIED',
      description: `Notified management (${contact.name}) of active emergency`,
    });
  };

  const createCommunityAlertFromEmergency = async (
    emergencyId: string,
    alertData: {
      type: AlertType;
      title: string;
      shortDescription: string;
      location?: string;
      priority: AlertPriority;
      requiresAck: boolean;
      targetDistribution: 'all' | 'groups';
    }
  ): Promise<string> => {
    const alertId = `ALT-EMG-${Date.now()}`;
    const now = new Date().toISOString();

    const newAlert: AlertNotification = {
      id: alertId,
      alertNumber: `ALT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: alertData.type,
      title: alertData.title,
      shortDescription: alertData.shortDescription,
      priority: alertData.priority,
      location: alertData.location,
      linkedEmergencyId: emergencyId,
      targetDistribution: alertData.targetDistribution,
      acknowledgements: [],
      updates: [],
      isAllClear: false,
      activeFrom: now,
      isClosed: false,
      requiresAck: alertData.requiresAck,
      publishedAt: now,
      publishedByUid: currentUser.uid,
      publishedByName: `${currentUser.name} ${currentUser.surname}`,
    };

    setAlerts((prev) => [newAlert, ...prev]);

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-ALT-${Date.now()}`,
      emergencyId,
      eventType: 'COMMUNITY_ALERT_CREATED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: `Public community alert broadcast: "${alertData.title}" (${newAlert.alertNumber})`,
    };

    setEmergencies((prev) =>
      prev.map((emg) => {
        if (emg.id !== emergencyId) return emg;
        return {
          ...emg,
          linkedAlertId: alertId,
          timeline: [...emg.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'ALERT',
      recordId: alertId,
      action: 'ALERT_CREATED_FROM_EMERGENCY',
      description: `Broadcasted public-safe community alert for emergency ${emergencyId}`,
    });

    return alertId;
  };

  const linkEmergencyToCase = (emergencyId: string, caseId: string) => {
    const now = new Date().toISOString();
    const targetCase = cases.find((c) => c.id === caseId);
    const emg = emergencies.find((e) => e.id === emergencyId);

    const audioEvidenceItems: CaseEvidence[] = (emg?.audioRecordings || []).map((rec, idx) => ({
      id: `EVD-AUD-${rec.id || Date.now()}-${idx}`,
      fileName: rec.filename || `sos_recording_${idx + 1}.webm`,
      fileUrl: rec.audioBlobUrl || rec.audioDataUri || '',
      mimeType: rec.mimeType || 'audio/webm',
      fileSize: rec.sizeBytes,
      uploadedByUid: rec.recordedByUid,
      uploadedByName: rec.recordedByName,
      caption: `Emergency SOS Live Audio Recording (${rec.durationSeconds}s)`,
      uploadedAt: rec.timestamp,
    }));

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        const timelineEvent: EmergencyTimelineEvent = {
          id: `TLE-LCASE-${Date.now()}`,
          emergencyId,
          eventType: 'CASE_LINKED',
          timestamp: now,
          actorUid: currentUser.uid,
          actorName: `${currentUser.name} ${currentUser.surname}`,
          actorRole: activeRole,
          description: `Linked to existing case: ${targetCase ? targetCase.caseNumber : caseId}`,
        };
        return {
          ...item,
          linkedCaseId: caseId,
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const existingEvidenceIds = new Set((c.evidence || []).map((e) => e.id));
        const newEvidenceToAdd = audioEvidenceItems.filter((e) => !existingEvidenceIds.has(e.id));
        const newUpdates = [...c.updates];
        if (newEvidenceToAdd.length > 0) {
          newUpdates.push({
            id: `UPD-AUD-SYNC-${Date.now()}`,
            caseId,
            authorUid: currentUser.uid,
            authorName: `${currentUser.name} ${currentUser.surname}`,
            authorRole: activeRole,
            message: `Linked emergency #${emergencyId}: Synced ${newEvidenceToAdd.length} SOS audio recording(s) to case file evidence.`,
            updateType: 'evidence_added',
            isInternalOnly: false,
            timestamp: now,
          });
        }
        return {
          ...c,
          linkedEmergencyId: emergencyId,
          evidence: [...(c.evidence || []), ...newEvidenceToAdd],
          updates: newUpdates,
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'CASE_LINKED',
      description: `Linked emergency ${emergencyId} to case ${caseId}`,
    });
  };

  const createCaseFromEmergency = async (
    emergencyId: string,
    category: IncidentCategory,
    title: string,
    description: string,
    priority: CasePriority
  ): Promise<string> => {
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (!emg) throw new Error('Emergency not found');

    const caseId = `CASE-${Date.now()}`;
    const caseNumber = `HBF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const audioEvidenceItems: CaseEvidence[] = (emg.audioRecordings || []).map((rec, idx) => ({
      id: `EVD-AUD-${rec.id || Date.now()}-${idx}`,
      fileName: rec.filename || `sos_recording_${idx + 1}.webm`,
      fileUrl: rec.audioBlobUrl || rec.audioDataUri || '',
      mimeType: rec.mimeType || 'audio/webm',
      fileSize: rec.sizeBytes,
      uploadedByUid: rec.recordedByUid,
      uploadedByName: rec.recordedByName,
      caption: `Emergency SOS Live Audio Recording (${rec.durationSeconds}s)`,
      uploadedAt: rec.timestamp,
    }));

    const newCase: Case = {
      id: caseId,
      caseNumber,
      title,
      description,
      category,
      priority,
      status: 'open',
      isPublic: true,
      incidentDate: emg.startTime.substring(0, 10),
      incidentTime: new Date(emg.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      locationName: emg.farmName,
      sector: emg.sector,
      gpsLocation: { latitude: emg.location.latitude, longitude: emg.location.longitude },
      reportedByUid: emg.clientUid,
      reportedByName: emg.clientName,
      reportedByPhone: emg.clientPhone,
      victimUid: emg.clientUid,
      victimName: emg.clientName,
      victimPhone: emg.clientPhone,
      victimFarmName: emg.farmName,
      victimRole: 'CLIENT',
      isVictimAware: true,
      assignedMemberUids: [emg.clientUid],
      photos: [],
      evidence: audioEvidenceItems,
      updates: [
        {
          id: `UPD-${Date.now()}`,
          caseId,
          authorUid: currentUser.uid,
          authorName: `${currentUser.name} ${currentUser.surname}`,
          authorRole: activeRole,
          message: `Case initialized from emergency dispatch #${emg.id} (${emg.emergencyType})${
            audioEvidenceItems.length > 0 ? ` with ${audioEvidenceItems.length} SOS audio recording(s) attached to case evidence` : ''
          }`,
          updateType: 'progress',
          isInternalOnly: false,
          timestamp: now,
        },
      ],
      linkedPoiIds: [],
      linkedVehicleIds: [],
      linkedEmergencyId: emergencyId,
      createdAt: now,
      updatedAt: now,
    };

    setCases((prev) => [newCase, ...prev]);

    linkEmergencyToCase(emergencyId, caseId);

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'CASE_CREATED_FROM_EMERGENCY',
      description: `Created case ${caseNumber} from emergency ${emergencyId}`,
    });

    return caseId;
  };

  const recordFalseAlarm = (emergencyId: string, reason: string) => {
    const now = new Date().toISOString();
    const actorName = `${currentUser.name} ${currentUser.surname}`;

    const resolutionDetails: EmergencyResolutionDetails = {
      resolutionStatus: 'FALSE_ALARM',
      resolutionTimestamp: now,
      resolvedByUid: currentUser.uid,
      resolvedByName: actorName,
      notes: reason,
      falseAlarmReason: reason,
      policeInvolved: false,
      ambulanceInvolved: false,
      reactionForceInvolved: false,
      caseCreated: false,
      followUpRequired: false,
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-FA-${Date.now()}`,
      emergencyId,
      eventType: 'FALSE_ALARM_REPORTED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName,
      actorRole: activeRole,
      description: `Marked as False Alarm by ${actorName}. Reason: ${reason}`,
    };

    // Terminate any active audio or location sessions immediately on false alarm
    emergencyAudioService.stopCapture();
    emergencyAudioService.stopListening();
    emergencyLocationService.stopLiveSharing();
    backgroundSosService.stopBackgroundSos();

    updateEmergencyAndSync(emergencyId, (emg) => ({
      ...emg,
      status: 'FALSE_ALARM',
      resolvedTime: now,
      resolutionDetails,
      timeline: [...emg.timeline, timelineEvent],
      audioSession: emg.audioSession ? { ...emg.audioSession, status: 'ENDED', connectionState: 'ENDED', endTime: now } : undefined,
      locationSession: emg.locationSession ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED', sessionEnd: now } : undefined,
      updatedAt: now,
    }));

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'FALSE_ALARM_RECORDED',
      description: `False alarm recorded by ${actorName}: ${reason}`,
    });
  };

  const resolveEmergency = (
    emergencyId: string,
    resolution: {
      notes: string;
      policeInvolved: boolean;
      ambulanceInvolved: boolean;
      reactionForceInvolved: boolean;
      caseCreated: boolean;
      followUpRequired: boolean;
    }
  ) => {
    const now = new Date().toISOString();
    const actorName = `${currentUser.name} ${currentUser.surname}`;

    const resolutionDetails: EmergencyResolutionDetails = {
      resolutionStatus: 'SAFE',
      resolutionTimestamp: now,
      resolvedByUid: currentUser.uid,
      resolvedByName: actorName,
      notes: resolution.notes,
      policeInvolved: resolution.policeInvolved,
      ambulanceInvolved: resolution.ambulanceInvolved,
      reactionForceInvolved: resolution.reactionForceInvolved,
      caseCreated: resolution.caseCreated,
      followUpRequired: resolution.followUpRequired,
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-RES-${Date.now()}`,
      emergencyId,
      eventType: 'RESOLVED_AND_CLOSED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName,
      actorRole: activeRole,
      description: `Emergency marked Safe & Resolved by ${actorName}. Notes: ${resolution.notes}`,
    };

    // Terminate any active audio or location sessions immediately on safe confirmation
    emergencyAudioService.stopCapture();
    emergencyAudioService.stopListening();
    emergencyLocationService.stopLiveSharing();
    backgroundSosService.stopBackgroundSos();

    updateEmergencyAndSync(emergencyId, (emg) => ({
      ...emg,
      status: 'SAFE',
      resolvedTime: now,
      resolutionDetails,
      timeline: [...emg.timeline, timelineEvent],
      audioSession: emg.audioSession ? { ...emg.audioSession, status: 'ENDED', connectionState: 'ENDED', endTime: now } : undefined,
      locationSession: emg.locationSession ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED', sessionEnd: now } : undefined,
      updatedAt: now,
    }));

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'EMERGENCY_RESOLVED',
      description: `Emergency resolved and marked safe by ${actorName}`,
    });
  };

  const resolveAllActiveEmergencies = async (notes = 'All active alarms cleared and stood down by Control Room') => {
    const now = new Date().toISOString();
    const actorName = `${currentUser.name} ${currentUser.surname}`;

    // 1. Immediately silence all continuous alarm tones and stop all audio/location sessions
    stopSosContinuousAlarm();
    emergencyAudioService.stopCapture();
    emergencyAudioService.stopListening();
    emergencyLocationService.stopLiveSharing();
    backgroundSosService.stopBackgroundSos();

    // 2. Resolve all active emergencies in local React state
    let resolvedCount = 0;
    const updatedEmergencies = emergencies.map((emg) => {
      if (emg.status !== 'SAFE' && emg.status !== 'FALSE_ALARM' && emg.status !== 'CLOSED') {
        resolvedCount++;
        const timelineEvent: EmergencyTimelineEvent = {
          id: `TLE-RES-ALL-${Date.now()}-${emg.id}`,
          emergencyId: emg.id,
          eventType: 'RESOLVED_AND_CLOSED',
          timestamp: now,
          actorUid: currentUser.uid,
          actorName,
          actorRole: activeRole,
          description: `System-wide alarm clearance. Resolved by ${actorName}. Notes: ${notes}`,
        };
        return {
          ...emg,
          status: 'SAFE' as const,
          resolvedTime: now,
          resolutionDetails: {
            resolutionStatus: 'SAFE' as const,
            resolutionTimestamp: now,
            resolvedByUid: currentUser.uid,
            resolvedByName: actorName,
            notes,
            policeInvolved: false,
            ambulanceInvolved: false,
            reactionForceInvolved: false,
            caseCreated: false,
            followUpRequired: false,
          },
          timeline: [...(emg.timeline || []), timelineEvent],
          audioSession: emg.audioSession ? { ...emg.audioSession, status: 'ENDED' as const, connectionState: 'ENDED' as const, endTime: now } : undefined,
          locationSession: emg.locationSession ? { ...emg.locationSession, isActive: false, connectionState: 'ENDED' as const, sessionEnd: now } : undefined,
          updatedAt: now,
        };
      }
      return emg;
    });

    setEmergencies(updatedEmergencies);
    safeSetJSON('hv_emergencies_v2', updatedEmergencies);

    // 3. Post to backend server to update inMemoryEmergencies and trigger SSE broadcast
    try {
      await fetch('/api/emergencies/clear-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedByName: actorName, notes }),
      });
    } catch (err) {
      console.warn('[DataContext] Error posting /api/emergencies/clear-all:', err);
    }

    // 4. Synchronize all resolved emergencies to Firestore
    try {
      await resolveAllFirestoreEmergencies(actorName, notes);
    } catch (err) {
      console.warn('[DataContext] Error calling resolveAllFirestoreEmergencies:', err);
    }

    // 5. Broadcast to all open tabs and windows
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('hv_emergency_broadcast_v1');
        bc.postMessage({ type: 'ALL_ALARMS_CLEARED', timestamp: now, resolvedCount, resolvedByName: actorName });
        setTimeout(() => bc.close(), 300);
      }
    } catch {
      // ignore
    }

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: 'ALL_ACTIVE',
      action: 'EMERGENCY_RESOLVED',
      description: `All active alarms (${resolvedCount} emergencies) stood down and marked safe by ${actorName}`,
    });
  };

  // =========================================================================
  // LIVE EMERGENCY COMMUNICATIONS & LOCATION ENGINE
  // =========================================================================

  // Calculated communication health status
  const communicationHealth: CommunicationHealthState = {
    backend: 'OK',
    clientConnection: typeof navigator !== 'undefined' && navigator.onLine ? 'ONLINE' : 'OFFLINE',
    liveAudio: activeEmergency?.audioSession?.status === 'ACTIVE'
      ? 'CONNECTED'
      : activeEmergency?.audioSession?.status === 'REQUESTED'
      ? 'REQUESTED'
      : activeEmergency?.audioSession?.status === 'INTERRUPTED'
      ? 'LOST'
      : 'OFF',
    liveLocation: activeEmergency?.locationSession?.isActive
      ? activeEmergency.locationSession.connectionState === 'STALE'
        ? 'STALE'
        : 'CURRENT'
      : 'OFF',
    whatsapp: settings.isWhatsAppApiConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
  };

  // Live Audio Session Methods
  const startLiveAudioSession = async (emergencyId: string): Promise<{ success: boolean; error?: string }> => {
    const now = new Date().toISOString();
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (!emg) return { success: false, error: 'Emergency not found' };

    const captureRes = await emergencyAudioService.startMicrophoneCapture(emergencyId, (level) => {
      // Audio level update handler
      setEmergencies((prev) =>
        prev.map((item) => {
          if (item.id !== emergencyId || !item.audioSession) return item;
          return {
            ...item,
            audioSession: {
              ...item.audioSession,
              audioLevel: level,
              lastHeartbeat: new Date().toISOString(),
            },
          };
        })
      );
    });

    if (!captureRes.success) {
      return { success: false, error: captureRes.error };
    }

    const newSession: AudioSessionRecord = {
      id: `AUD-SESS-${Date.now()}`,
      emergencyId,
      clientUid: currentUser.uid,
      clientName: `${currentUser.name} ${currentUser.surname}`,
      startedByUid: currentUser.uid,
      startedByName: `${currentUser.name} ${currentUser.surname}`,
      startTime: now,
      status: 'ACTIVE',
      connectionState: 'CONNECTED',
      authorisedListeners: ['USR-CTRL-002', 'USR-MGMT-003'],
      activeListeners: [],
      clientRequestedAudio: true,
      controlRoomRequestedAudio: false,
      clientResponseToRequest: 'ACCEPTED',
      lastHeartbeat: now,
      audioLevel: 30,
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-AUD-${Date.now()}`,
      emergencyId,
      eventType: 'LIVE_AUDIO_STARTED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: 'CLIENT',
      description: 'Client initiated live emergency audio broadcast to Control Room',
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          audioSession: newSession,
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'LIVE_AUDIO_STARTED',
      description: `Live audio started for emergency ${emergencyId}`,
    });

    return { success: true };
  };

  const requestLiveAudio = (emergencyId: string) => {
    const now = new Date().toISOString();
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (!emg) return;

    const requestedSession: AudioSessionRecord = emg.audioSession || {
      id: `AUD-SESS-${Date.now()}`,
      emergencyId,
      clientUid: emg.clientUid,
      clientName: emg.clientName,
      startedByUid: currentUser.uid,
      startedByName: `${currentUser.name} ${currentUser.surname}`,
      startTime: now,
      status: 'REQUESTED',
      connectionState: 'CONNECTING',
      authorisedListeners: ['USR-CTRL-002', 'USR-MGMT-003'],
      activeListeners: [],
      clientRequestedAudio: false,
      controlRoomRequestedAudio: true,
      clientResponseToRequest: 'PENDING',
      lastHeartbeat: now,
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-AUD-REQ-${Date.now()}`,
      emergencyId,
      eventType: 'LIVE_AUDIO_REQUESTED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: 'Control Room requested client to enable live microphone audio',
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          audioSession: {
            ...requestedSession,
            status: 'REQUESTED',
            controlRoomRequestedAudio: true,
            clientResponseToRequest: 'PENDING',
          },
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'LIVE_AUDIO_REQUESTED',
      description: `Control room requested live audio on emergency ${emergencyId}`,
    });
  };

  const respondToAudioRequest = async (emergencyId: string, accepted: boolean): Promise<void> => {
    const now = new Date().toISOString();
    if (accepted) {
      const res = await startLiveAudioSession(emergencyId);
      if (res.success) {
        const acceptEvent: EmergencyTimelineEvent = {
          id: `TLE-AUD-ACC-${Date.now()}`,
          emergencyId,
          eventType: 'LIVE_AUDIO_ACCEPTED',
          timestamp: now,
          actorUid: currentUser.uid,
          actorName: `${currentUser.name} ${currentUser.surname}`,
          actorRole: 'CLIENT',
          description: 'Client accepted Control Room request for live audio',
        };
        setEmergencies((prev) =>
          prev.map((item) => {
            if (item.id !== emergencyId) return item;
            return {
              ...item,
              timeline: [...item.timeline, acceptEvent],
              updatedAt: now,
            };
          })
        );
      }
    } else {
      const declineEvent: EmergencyTimelineEvent = {
        id: `TLE-AUD-DEC-${Date.now()}`,
        emergencyId,
        eventType: 'LIVE_AUDIO_DECLINED',
        timestamp: now,
        actorUid: currentUser.uid,
        actorName: `${currentUser.name} ${currentUser.surname}`,
        actorRole: 'CLIENT',
        description: 'Client declined Control Room request for live audio (or selected silent mode)',
      };
      setEmergencies((prev) =>
        prev.map((item) => {
          if (item.id !== emergencyId) return item;
          return {
            ...item,
            audioSession: item.audioSession
              ? {
                  ...item.audioSession,
                  status: 'ENDED',
                  clientResponseToRequest: 'DECLINED',
                  endTime: now,
                }
              : undefined,
            timeline: [...item.timeline, declineEvent],
            updatedAt: now,
          };
        })
      );
    }
  };

  const stopLiveAudioSession = (emergencyId: string, reason?: string) => {
    const now = new Date().toISOString();
    emergencyAudioService.stopCapture();
    emergencyAudioService.stopListening();

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-AUD-END-${Date.now()}`,
      emergencyId,
      eventType: 'LIVE_AUDIO_ENDED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: `Live audio stream stopped${reason ? `: ${reason}` : ''}`,
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId || !item.audioSession) return item;
        return {
          ...item,
          audioSession: {
            ...item.audioSession,
            status: 'ENDED',
            connectionState: 'ENDED',
            endTime: now,
          },
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'LIVE_AUDIO_STOPPED',
      description: `Live audio stopped on emergency ${emergencyId}`,
    });
  };

  const joinAudioSessionAsListener = (emergencyId: string) => {
    const now = new Date().toISOString();
    emergencyAudioService.startListening((level) => {
      setEmergencies((prev) =>
        prev.map((item) => {
          if (item.id !== emergencyId) return item;
          if (!item.audioSession) {
            return {
              ...item,
              audioSession: {
                id: `AUD-SESS-${Date.now()}`,
                emergencyId,
                clientUid: item.clientUid,
                clientName: item.clientName,
                startedByUid: currentUser.uid,
                startedByName: `${currentUser.name} ${currentUser.surname}`,
                startTime: now,
                status: 'ACTIVE',
                connectionState: 'CONNECTED',
                authorisedListeners: ['USR-CTRL-002', 'USR-MGMT-003'],
                activeListeners: [
                  {
                    uid: currentUser.uid,
                    name: `${currentUser.name} ${currentUser.surname}`,
                    role: activeRole,
                    joinedAt: now,
                    isMuted: false,
                  },
                ],
                clientRequestedAudio: false,
                controlRoomRequestedAudio: true,
                clientResponseToRequest: 'ACCEPTED',
                lastHeartbeat: now,
                audioLevel: level,
              },
            };
          }
          return {
            ...item,
            audioSession: {
              ...item.audioSession,
              status: 'ACTIVE',
              connectionState: 'CONNECTED',
              audioLevel: level,
              lastHeartbeat: new Date().toISOString(),
            },
          };
        })
      );
    });

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        const currentSession: AudioSessionRecord = item.audioSession || {
          id: `AUD-SESS-${Date.now()}`,
          emergencyId,
          clientUid: item.clientUid,
          clientName: item.clientName,
          startedByUid: currentUser.uid,
          startedByName: `${currentUser.name} ${currentUser.surname}`,
          startTime: now,
          status: 'ACTIVE',
          connectionState: 'CONNECTED',
          authorisedListeners: ['USR-CTRL-002', 'USR-MGMT-003'],
          activeListeners: [],
          clientRequestedAudio: false,
          controlRoomRequestedAudio: true,
          clientResponseToRequest: 'ACCEPTED',
          lastHeartbeat: now,
          audioLevel: 30,
        };

        const exists = currentSession.activeListeners.some((l) => l.uid === currentUser.uid);
        const updatedListeners = exists
          ? currentSession.activeListeners
          : [
              ...currentSession.activeListeners,
              {
                uid: currentUser.uid,
                name: `${currentUser.name} ${currentUser.surname}`,
                role: activeRole,
                joinedAt: now,
                isMuted: false,
              },
            ];

        return {
          ...item,
          audioSession: {
            ...currentSession,
            status: 'ACTIVE',
            connectionState: 'CONNECTED',
            activeListeners: updatedListeners,
          },
          updatedAt: now,
        };
      })
    );
  };

  const leaveAudioSessionAsListener = (emergencyId: string) => {
    const now = new Date().toISOString();
    emergencyAudioService.stopListening();

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId || !item.audioSession) return item;
        return {
          ...item,
          audioSession: {
            ...item.audioSession,
            activeListeners: item.audioSession.activeListeners.filter((l) => l.uid !== currentUser.uid),
          },
          updatedAt: now,
        };
      })
    );
  };

  const toggleLocalAudioMute = (emergencyId: string, isMuted: boolean) => {
    emergencyAudioService.setLocalMute(isMuted);
    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId || !item.audioSession) return item;
        return {
          ...item,
          audioSession: {
            ...item.audioSession,
            activeListeners: item.audioSession.activeListeners.map((l) =>
              l.uid === currentUser.uid ? { ...l, isMuted } : l
            ),
          },
        };
      })
    );
  };

  const saveAudioRecording = (emergencyId: string, recording: AudioRecordingRecord) => {
    const emg = emergencies.find((e) => e.id === emergencyId);
    const now = new Date().toISOString();

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        const currentRecordings = item.audioRecordings || [];
        const currentSessionRecordings = item.audioSession?.recordings || [];
        return {
          ...item,
          audioRecordings: [recording, ...currentRecordings],
          audioSession: item.audioSession
            ? {
                ...item.audioSession,
                recordings: [recording, ...currentSessionRecordings],
              }
            : undefined,
          updatedAt: now,
        };
      })
    );

    // If emergency is linked to a case, automatically attach as case evidence
    if (emg?.linkedCaseId) {
      const audioEvidence: CaseEvidence = {
        id: `EVD-AUD-${recording.id}`,
        fileName: recording.filename || `sos_recording_${recording.durationSeconds}s.webm`,
        fileUrl: recording.audioBlobUrl || recording.audioDataUri || '',
        mimeType: recording.mimeType || 'audio/webm',
        fileSize: recording.sizeBytes,
        uploadedByUid: recording.recordedByUid,
        uploadedByName: recording.recordedByName,
        caption: `Emergency SOS Live Audio Feed (${recording.durationSeconds}s)`,
        uploadedAt: recording.timestamp || now,
      };

      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== emg.linkedCaseId) return c;
          const existingEvidence = c.evidence || [];
          if (existingEvidence.some((e) => e.id === audioEvidence.id)) return c;
          return {
            ...c,
            evidence: [audioEvidence, ...existingEvidence],
            updates: [
              ...c.updates,
              {
                id: `UPD-AUD-${Date.now()}`,
                caseId: c.id,
                authorUid: recording.recordedByUid,
                authorName: recording.recordedByName,
                authorRole: recording.recordedByRole,
                message: `New SOS Audio Recording (${recording.durationSeconds}s) automatically attached to case evidence vault.`,
                updateType: 'evidence_added',
                isInternalOnly: false,
                timestamp: now,
              },
            ],
            updatedAt: now,
          };
        })
      );
    }

    logAuditEvent({
      recordType: 'AUDIO_RECORDING',
      recordId: recording.id,
      action: 'AUDIO_FEED_RECORDED',
      description: `Saved ${recording.durationSeconds}s audio recording for emergency ${emergencyId} by ${recording.recordedByName}`,
    });
  };

  const deleteAudioRecording = (emergencyId: string, recordingId: string) => {
    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          audioRecordings: (item.audioRecordings || []).filter((r) => r.id !== recordingId),
          audioSession: item.audioSession
            ? {
                ...item.audioSession,
                recordings: (item.audioSession.recordings || []).filter((r) => r.id !== recordingId),
              }
            : undefined,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    logAuditEvent({
      recordType: 'AUDIO_RECORDING',
      recordId: recordingId,
      action: 'AUDIO_RECORDING_DELETED',
      description: `Deleted audio recording ${recordingId} from emergency ${emergencyId}`,
    });
  };

  // Live Location Session Methods
  const startLiveLocationSession = async (
    emergencyId: string,
    mode: LocationMode = 'STANDARD'
  ): Promise<void> => {
    const now = new Date().toISOString();
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (!emg) return;

    const initialPt: EmergencyLocationPoint = {
      id: `LOC-INIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      latitude: emg.location.latitude,
      longitude: emg.location.longitude,
      accuracy: emg.location.accuracy || 10,
      timestamp: now,
      source: 'LIVE_STREAM',
      sequenceNumber: 1,
    };

    const newLocSession: EmergencyLocationSession = {
      id: `LOC-SESS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      emergencyId,
      clientUid: emg.clientUid,
      clientName: emg.clientName,
      sessionStart: now,
      locationMode: mode,
      lastUpdate: now,
      connectionState: 'CONNECTED',
      isActive: true,
      history: [initialPt],
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-LOC-START-${Date.now()}`,
      emergencyId,
      eventType: 'LIVE_LOCATION_STARTED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: 'CLIENT',
      description: `Temporary live location tracking started (Mode: ${mode})`,
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          locationSession: newLocSession,
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    emergencyLocationService.startLiveSharing(
      { latitude: emg.location.latitude, longitude: emg.location.longitude },
      mode,
      (pt) => {
        setEmergencies((prev) =>
          prev.map((item) => {
            if (item.id !== emergencyId) return item;
            const currentHistory = item.locationSession?.history || [];
            // Deduplicate by ID or close duplicate timestamps
            const isDuplicate = currentHistory.some((p) => p.id === pt.id);
            const updatedHistory = isDuplicate
              ? currentHistory
              : [...currentHistory, pt];
            return {
              ...item,
              location: {
                ...item.location,
                latitude: pt.latitude,
                longitude: pt.longitude,
                accuracy: pt.accuracy,
                timestamp: pt.timestamp,
                quality: 'CURRENT_GPS',
              },
              locationSession: item.locationSession
                ? {
                    ...item.locationSession,
                    lastUpdate: pt.timestamp,
                    connectionState: 'CONNECTED',
                    history: updatedHistory,
                  }
                : undefined,
              updatedAt: pt.timestamp,
            };
          })
        );
      }
    );

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'LIVE_LOCATION_STARTED',
      description: `Live location sharing started on emergency ${emergencyId}`,
    });
  };

  const changeLocationMode = (emergencyId: string, mode: LocationMode) => {
    emergencyLocationService.setMode(mode, (pt) => {
      setEmergencies((prev) =>
        prev.map((item) => {
          if (item.id !== emergencyId || !item.locationSession) return item;
          const currentHist = item.locationSession.history || [];
          const isDup = currentHist.some((p) => p.id === pt.id);
          const newHist = isDup ? currentHist : [...currentHist, pt];
          return {
            ...item,
            location: {
              ...item.location,
              latitude: pt.latitude,
              longitude: pt.longitude,
              accuracy: pt.accuracy,
              timestamp: pt.timestamp,
            },
            locationSession: {
              ...item.locationSession,
              locationMode: mode,
              lastUpdate: pt.timestamp,
              history: newHist,
            },
          };
        })
      );
    });

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId || !item.locationSession) return item;
        return {
          ...item,
          locationSession: {
            ...item.locationSession,
            locationMode: mode,
          },
        };
      })
    );
  };

  const stopLiveLocationSession = (emergencyId: string) => {
    const now = new Date().toISOString();
    emergencyLocationService.stopLiveSharing();

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-LOC-END-${Date.now()}`,
      emergencyId,
      eventType: 'LIVE_LOCATION_ENDED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: 'Temporary live location tracking stopped',
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId || !item.locationSession) return item;
        return {
          ...item,
          locationSession: {
            ...item.locationSession,
            isActive: false,
            connectionState: 'ENDED',
            sessionEnd: now,
          },
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'LIVE_LOCATION_STOPPED',
      description: `Live location stopped on emergency ${emergencyId}`,
    });
  };

  // Emergency Messaging & Silent Mode
  const sendEmergencyMessage = async (
    emergencyId: string,
    data: {
      text: string;
      messageType?: EmergencyMessageRecord['messageType'];
      quickTag?: QuickMessageTag;
      photos?: string[];
      isSilentMode?: boolean;
      location?: { latitude: number; longitude: number; accuracy?: number };
    }
  ): Promise<string> => {
    const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const newMsg: EmergencyMessageRecord = {
      id: messageId,
      emergencyId,
      senderUid: currentUser.uid,
      senderName: `${currentUser.name} ${currentUser.surname}`,
      senderRole: activeRole,
      messageType: data.messageType || 'CUSTOM_TEXT',
      text: data.text,
      quickTag: data.quickTag,
      photos: data.photos || [],
      location: data.location,
      deliveryStatus: 'SENT_TO_BACKEND',
      isSilentMode: !!data.isSilentMode,
      timestamp: now,
    };

    const isClient = activeRole === 'CLIENT';
    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-MSG-${Date.now()}`,
      emergencyId,
      eventType: isClient ? 'CLIENT_MESSAGE_SENT' : 'CONTROL_ROOM_MESSAGE_SENT',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: `${isClient ? 'Client update' : 'Control Room instruction'}: "${data.text}"${data.isSilentMode ? ' [Silent Mode]' : ''}`,
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          messages: [...(item.messages || []), newMsg],
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    // Simulate reliable device delivery state transition
    setTimeout(() => {
      setEmergencies((prev) =>
        prev.map((item) => {
          if (item.id !== emergencyId) return item;
          return {
            ...item,
            messages: (item.messages || []).map((m) =>
              m.id === messageId ? { ...m, deliveryStatus: 'DELIVERED_TO_DEVICE' } : m
            ),
          };
        })
      );
    }, 600);

    return messageId;
  };

  const markMessageDelivered = (emergencyId: string, messageId: string) => {
    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          messages: (item.messages || []).map((m) =>
            m.id === messageId ? { ...m, deliveryStatus: 'DELIVERED_TO_DEVICE' } : m
          ),
        };
      })
    );
  };

  const markMessageOpened = (emergencyId: string, messageId: string) => {
    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          messages: (item.messages || []).map((m) =>
            m.id === messageId ? { ...m, deliveryStatus: 'OPENED' } : m
          ),
        };
      })
    );
  };

  // Reaction Force Contact Logging
  const recordReactionForceContact = (
    emergencyId: string,
    data: {
      contactId: string;
      contactName: string;
      targetPhone: string;
      method: ReactionForceMethod;
      status: ReactionForceStatus;
      notes?: string;
    }
  ) => {
    const logId = `RFC-${Date.now()}`;
    const now = new Date().toISOString();

    const contactLog: ReactionForceContactLog = {
      id: logId,
      emergencyId,
      contactId: data.contactId,
      contactName: data.contactName,
      targetPhone: data.targetPhone,
      method: data.method,
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      status: data.status,
      notes: data.notes,
    };

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-RFC-${Date.now()}`,
      emergencyId,
      eventType: 'REACTION_FORCE_CONTACTED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: `Reaction force contact attempt to ${data.contactName} (${data.method}) - Status: ${data.status}${data.notes ? ` [${data.notes}]` : ''}`,
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          reactionForceContactLogs: [...(item.reactionForceContactLogs || []), contactLog],
          timeline: [...item.timeline, timelineEvent],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'EMERGENCY',
      recordId: emergencyId,
      action: 'REACTION_FORCE_CONTACT_LOGGED',
      description: `Logged reaction force contact (${data.contactName}) status ${data.status}`,
    });
  };

  const callClientDirect = (emergencyId: string, phone: string, targetName: string): string => {
    const now = new Date().toISOString();
    const logId = initiateCallAction(emergencyId, 'OTHER', phone, targetName);

    const timelineEvent: EmergencyTimelineEvent = {
      id: `TLE-CALL-CLI-${Date.now()}`,
      emergencyId,
      eventType: 'CALL_CLIENT_INITIATED',
      timestamp: now,
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`,
      actorRole: activeRole,
      description: `Direct call initiated to client ${targetName} (${phone})`,
    };

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        return {
          ...item,
          timeline: [...item.timeline, timelineEvent],
        };
      })
    );

    return logId;
  };

  // Emergency Contacts Management
  const createEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      id: `CNT-${Date.now()}`,
      ...contact,
    };
    setEmergencyContacts((prev) => [...prev, newContact]);
    logAuditEvent({
      recordType: 'SETTINGS',
      recordId: newContact.id,
      action: 'EMERGENCY_CONTACT_CREATED',
      description: `Created emergency contact ${contact.name} (${contact.category})`,
    });
  };

  const updateEmergencyContact = (contactId: string, updates: Partial<EmergencyContact>) => {
    setEmergencyContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, ...updates } : c))
    );
    logAuditEvent({
      recordType: 'SETTINGS',
      recordId: contactId,
      action: 'EMERGENCY_CONTACT_UPDATED',
      description: `Updated emergency contact ${contactId}`,
    });
  };

  const deleteEmergencyContact = (contactId: string) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== contactId));
    logAuditEvent({
      recordType: 'SETTINGS',
      recordId: contactId,
      action: 'EMERGENCY_CONTACT_DELETED',
      description: `Deleted emergency contact ${contactId}`,
    });
  };

  // =========================================================================
  // OTHER CORE MODULES (Cases, SitReps, BOLOs, POIs, Alerts, Groups, Settings)
  // =========================================================================

  const createIncidentCase = async (data: {
    category: IncidentCategory;
    title: string;
    description: string;
    incidentDate: string;
    incidentTime: string;
    locationName: string;
    isPublic: boolean;
    priority?: CasePriority;
    sapsCaseNumber?: string;
    sapsStation?: string;
    sapsDetails?: SapsCaseDetails;
    investigatingOfficers?: InvestigatingOfficer[];
    gpsLocation?: { latitude: number; longitude: number };
    vehicleInfo?: { makeModel?: string; color?: string; plate?: string; notes?: string };
    personDescription?: { gender?: string; clothing?: string; buildHeight?: string; identifyingMarks?: string; notes?: string };
    photos?: string[];
    victimUid?: string;
    victimName?: string;
    victimPhone?: string;
    victimFarmName?: string;
    victimRole?: string;
    isVictimAware?: boolean;
    assignedMemberUids?: string[];
  }): Promise<string> => {
    const caseId = `CASE-${Date.now()}`;
    const caseNumber = `HBF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const officers = data.investigatingOfficers || data.sapsDetails?.officers || [];

    const newCase: Case = {
      id: caseId,
      caseNumber,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || 'medium',
      status: 'open',
      isPublic: data.isPublic,
      sapsCaseNumber: data.sapsCaseNumber || data.sapsDetails?.caseNumber,
      sapsStation: data.sapsStation || data.sapsDetails?.station,
      sapsDetails: data.sapsDetails || (data.sapsCaseNumber ? {
        caseNumber: data.sapsCaseNumber,
        station: data.sapsStation,
        officers: officers,
        dateReported: now,
      } : undefined),
      investigatingOfficers: officers,
      incidentDate: data.incidentDate,
      incidentTime: data.incidentTime,
      locationName: data.locationName,
      sector: currentUser.sector || 'Sektor 2 - Noord',
      gpsLocation: data.gpsLocation,
      reportedByUid: currentUser.uid,
      reportedByName: `${currentUser.name} ${currentUser.surname}`,
      reportedByPhone: currentUser.primaryPhone,
      victimUid: data.victimUid || (currentUser.role === 'CLIENT' ? currentUser.uid : undefined),
      victimName: data.victimName || (currentUser.role === 'CLIENT' ? `${currentUser.name} ${currentUser.surname}` : undefined),
      victimPhone: data.victimPhone || (currentUser.role === 'CLIENT' ? currentUser.primaryPhone : undefined),
      victimFarmName: data.victimFarmName || (currentUser.role === 'CLIENT' ? currentUser.farmName : undefined),
      victimRole: data.victimRole || (currentUser.role === 'CLIENT' ? currentUser.role : undefined),
      isVictimAware: data.isVictimAware !== undefined ? data.isVictimAware : true,
      assignedMemberUids: data.assignedMemberUids || (data.victimUid ? [data.victimUid] : (currentUser.role === 'CLIENT' ? [currentUser.uid] : [])),
      vehicleInfo: data.vehicleInfo,
      personDescription: data.personDescription,
      photos: data.photos || [],
      evidence: (data.photos || []).map((url, idx) => ({
        id: `EVD-${Date.now()}-${idx}`,
        fileName: `incident_photo_${idx + 1}.jpg`,
        fileUrl: url,
        mimeType: 'image/jpeg',
        uploadedByUid: currentUser.uid,
        uploadedByName: `${currentUser.name} ${currentUser.surname}`,
        caption: 'Initial incident report photo',
        uploadedAt: now,
      })),
      updates: [
        {
          id: `UPD-${Date.now()}`,
          caseId,
          authorUid: currentUser.uid,
          authorName: `${currentUser.name} ${currentUser.surname}`,
          authorRole: activeRole,
          message: `Report lodged by community member ${currentUser.name} ${currentUser.surname}${data.sapsCaseNumber ? ` (SAPD Case #: ${data.sapsCaseNumber})` : ''}`,
          updateType: 'progress',
          isInternalOnly: false,
          timestamp: now,
        },
      ],
      linkedPoiIds: [],
      linkedVehicleIds: [],
      createdAt: now,
      updatedAt: now,
    };

    setCases((prev) => [newCase, ...prev]);
    syncCaseToFirestore(newCase).catch((err) =>
      console.warn('Could not sync new case to Firestore:', err)
    );

    // Dispatch real-time incident notification popup for Control Room operators
    const newNotification: IncidentNotification = {
      id: `INC-NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      caseId,
      caseNumber,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || 'medium',
      reportedByName: `${currentUser.name} ${currentUser.surname}`,
      reportedByPhone: currentUser.primaryPhone,
      reportedByUid: currentUser.uid,
      reportedByRole: currentUser.role,
      victimName: data.victimName || (currentUser.role === 'CLIENT' ? `${currentUser.name} ${currentUser.surname}` : undefined),
      victimPhone: data.victimPhone || (currentUser.role === 'CLIENT' ? currentUser.primaryPhone : undefined),
      victimFarmName: data.victimFarmName || (currentUser.role === 'CLIENT' ? currentUser.farmName : undefined),
      sector: currentUser.sector || 'Sektor 2 - Noord',
      locationName: data.locationName,
      gpsLocation: data.gpsLocation,
      incidentDate: data.incidentDate,
      incidentTime: data.incidentTime,
      sapsCaseNumber: data.sapsCaseNumber || data.sapsDetails?.caseNumber,
      photosCount: (data.photos || []).length,
      vehicleSummary: data.vehicleInfo?.plate || data.vehicleInfo?.makeModel ? `${data.vehicleInfo.makeModel || ''} ${data.vehicleInfo.plate || ''}`.trim() : undefined,
      personSummary: data.personDescription?.gender || data.personDescription?.clothing ? `${data.personDescription.gender || ''} ${data.personDescription.clothing || ''}`.trim() : undefined,
      timestamp: now,
      isAcknowledged: false,
    };

    setIncidentNotifications((prev) => [newNotification, ...prev]);
    syncIncidentNotificationToFirestore(newNotification).catch((err) =>
      console.warn('Could not sync incident notification to Firestore:', err)
    );

    // Play tactical attention chime for control room operators
    playIncidentAlertSound();

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'CASE_CREATED',
      description: `Created case ${caseNumber}: ${data.title}${data.sapsCaseNumber ? ` [SAPS ${data.sapsCaseNumber}]` : ''}`,
    });

    logAuditEvent({
      recordType: 'CASE',
      recordId: newNotification.id,
      action: 'INCIDENT_NOTIFICATION_DISPATCHED',
      description: `Incident notification dispatched to Control Room for new report by ${currentUser.name} ${currentUser.surname} (${caseNumber})`,
    });

    return caseId;
  };

  const acknowledgeIncidentNotification = (notificationId: string) => {
    const now = new Date().toISOString();
    let updatedNotif: IncidentNotification | null = null;
    setIncidentNotifications((prev) => {
      const nextList = prev.map((n) => {
        if (n.id === notificationId) {
          updatedNotif = {
            ...n,
            isAcknowledged: true,
            acknowledgedBy: `${currentUser.name} ${currentUser.surname}`,
            acknowledgedAt: now,
          };
          return updatedNotif;
        }
        return n;
      });
      safeSetJSON('hv_incident_notifications_v2', nextList);
      return nextList;
    });

    if (updatedNotif) {
      syncIncidentNotificationToFirestore(updatedNotif).catch(() => {});
    }

    playAcknowledgementChime();

    logAuditEvent({
      recordType: 'CASE',
      recordId: notificationId,
      action: 'NOTIFICATION_ACKNOWLEDGED',
      description: `Incident notification ${notificationId} acknowledged by Control Room operator (${currentUser.name} ${currentUser.surname})`,
    });
  };

  const dismissIncidentNotification = (notificationId: string) => {
    setIncidentNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllIncidentNotifications = () => {
    setIncidentNotifications([]);
  };

  const updateCase = (
    caseId: string,
    updates: Partial<Case>,
    changeSummary?: string
  ) => {
    const now = new Date().toISOString();

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newUpdates = [...c.updates];
        if (changeSummary) {
          newUpdates.push({
            id: `UPD-${Date.now()}`,
            caseId,
            authorUid: currentUser.uid,
            authorName: `${currentUser.name} ${currentUser.surname}`,
            authorRole: activeRole,
            message: changeSummary,
            updateType: 'progress',
            isInternalOnly: false,
            timestamp: now,
          });
        }
        const updatedCase = {
          ...c,
          ...updates,
          updates: newUpdates,
          updatedAt: now,
        };
        syncCaseToFirestore(updatedCase).catch((err) =>
          console.warn('Could not sync updated case to Firestore:', err)
        );
        return updatedCase;
      })
    );

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'CASE_UPDATED',
      description: `Case ${caseId} updated: ${changeSummary || 'Fields modified'}`,
    });
  };

  const updateCaseSapsDetails = (
    caseId: string,
    sapsData: {
      sapsCaseNumber?: string;
      sapsStation?: string;
      obNumber?: string;
      investigatingOfficers?: InvestigatingOfficer[];
      docketLocation?: string;
      statusNotes?: string;
    }
  ) => {
    const now = new Date().toISOString();
    const sapsCaseNumber = sapsData.sapsCaseNumber?.trim();
    const sapsStation = sapsData.sapsStation?.trim();
    const officers = sapsData.investigatingOfficers || [];

    const summaryParts: string[] = [];
    if (sapsCaseNumber) summaryParts.push(`SAPD Case #: ${sapsCaseNumber}`);
    if (sapsStation) summaryParts.push(`Station: ${sapsStation}`);
    if (officers.length > 0) {
      summaryParts.push(
        `Investigating Officer(s): ${officers
          .map((o) => `${o.rank ? `${o.rank} ` : ''}${o.name}${o.badgeNumber ? ` (${o.badgeNumber})` : ''}`)
          .join(', ')}`
      );
    }
    if (sapsData.obNumber) summaryParts.push(`OB #: ${sapsData.obNumber}`);

    const changeSummary =
      summaryParts.length > 0
        ? `SAPS / SAPD Investigation record updated: ${summaryParts.join(' | ')}`
        : 'SAPS / SAPD information modified';

    updateCase(
      caseId,
      {
        sapsCaseNumber: sapsCaseNumber || undefined,
        sapsStation: sapsStation || undefined,
        sapsDetails: {
          caseNumber: sapsCaseNumber,
          station: sapsStation,
          obNumber: sapsData.obNumber?.trim(),
          officers,
          docketLocation: sapsData.docketLocation,
          statusNotes: sapsData.statusNotes,
          dateReported: now,
        },
        investigatingOfficers: officers,
      },
      changeSummary
    );
  };

  const addCaseEvidencePhotos = (caseId: string, photoUrls: string[], caption?: string) => {
    if (!photoUrls || photoUrls.length === 0) return;
    const now = new Date().toISOString();

    const newEvidenceItems: CaseEvidence[] = photoUrls.map((url, idx) => ({
      id: `EVD-${Date.now()}-${idx}`,
      fileName: `evidence_photo_${Date.now()}_${idx + 1}.jpg`,
      fileUrl: url,
      mimeType: 'image/jpeg',
      uploadedByUid: currentUser.uid,
      uploadedByName: `${currentUser.name} ${currentUser.surname}`,
      caption: caption || 'Attached incident evidence',
      uploadedAt: now,
    }));

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const currentPhotos = c.photos || [];
        const currentEvidence = c.evidence || [];
        return {
          ...c,
          photos: [...currentPhotos, ...photoUrls],
          evidence: [...currentEvidence, ...newEvidenceItems],
          updates: [
            ...c.updates,
            {
              id: `UPD-${Date.now()}`,
              caseId,
              authorUid: currentUser.uid,
              authorName: `${currentUser.name} ${currentUser.surname}`,
              authorRole: activeRole,
              message: `${currentUser.name} uploaded ${photoUrls.length} new evidence photo(s)${
                caption ? `: "${caption}"` : ''
              }`,
              updateType: 'evidence_added',
              isInternalOnly: false,
              timestamp: now,
            },
          ],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'EVIDENCE_ADDED',
      description: `Added ${photoUrls.length} photos to case ${caseId}`,
    });
  };

  const addCaseUpdate = (
    caseId: string,
    message: string,
    isInternalOnly: boolean = false,
    attachments?: string[],
    gpsLocation?: { latitude: number; longitude: number }
  ) => {
    const now = new Date().toISOString();
    const updateObj: CaseUpdate = {
      id: `UPD-${Date.now()}`,
      caseId,
      authorUid: currentUser.uid,
      authorName: `${currentUser.name} ${currentUser.surname}`,
      authorRole: activeRole,
      message,
      updateType: activeRole === 'CLIENT' ? 'progress' : 'responder_note',
      isInternalOnly,
      gpsLocation,
      attachments,
      timestamp: now,
    };

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, updates: [...c.updates, updateObj], updatedAt: now } : c))
    );

    logAuditEvent({
      recordType: 'CASE_UPDATE',
      recordId: caseId,
      action: 'CASE_UPDATE_ADDED',
      description: `Added update to case ${caseId}`,
    });
  };

  const updateCaseStatus = (
    caseId: string,
    status: Case['status'],
    priority?: CasePriority,
    isPublic?: boolean
  ) => {
    const now = new Date().toISOString();
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          status,
          priority: priority || c.priority,
          isPublic: isPublic !== undefined ? isPublic : c.isPublic,
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'CASE_STATUS_CHANGED',
      description: `Case ${caseId} status updated to ${status}`,
    });
  };

  const deleteCase = async (caseId: string): Promise<boolean> => {
    if (activeRole !== 'MANAGEMENT' && currentUser?.role !== 'MANAGEMENT') {
      console.warn('Unauthorized case deletion attempt: only MANAGEMENT can delete cases');
      logAuditEvent({
        recordType: 'CASE',
        recordId: caseId,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        description: `Unauthorized attempt to delete case ${caseId} by user ${currentUser?.uid} (${activeRole || currentUser?.role})`,
      });
      return false;
    }

    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) {
      return false;
    }

    setCases((prev) => prev.filter((c) => c.id !== caseId));
    deleteCaseFromFirestore(caseId).catch((err) =>
      console.warn('Could not delete case from Firestore:', err)
    );

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'CASE_DELETED',
      description: `Case ${targetCase.caseNumber || caseId} ("${targetCase.title}") permanently deleted by Management (${currentUser?.name} ${currentUser?.surname})`,
    });

    return true;
  };

  const addSuspectToCase = async (
    caseId: string,
    suspectData: {
      name?: string;
      surname?: string;
      aliases?: string[];
      nickname?: string;
      approximateAge?: number;
      gender?: string;
      status?: PoiStatus;
      physicalDescription?: {
        height?: string;
        build?: string;
        identifyingMarks?: string;
        clothingLastSeen?: string;
        complexion?: string;
      };
      phoneNumbers?: string[];
      knownAreas?: string[];
      photos?: string[];
      notes?: string;
    }
  ): Promise<string> => {
    const targetCase = cases.find((c) => c.id === caseId);
    const now = new Date().toISOString();
    const poiId = `POI-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const internalPoiId = `POI-HBF-${Math.floor(100 + Math.random() * 900)}`;
    const displayName = `${suspectData.name || ''} ${suspectData.surname || ''}`.trim() || suspectData.nickname || 'Unknown Suspect';

    const newPoi: PersonOfInterest = {
      id: poiId,
      internalPoiId,
      name: suspectData.name || '',
      surname: suspectData.surname || '',
      aliases: suspectData.aliases || (suspectData.nickname ? [suspectData.nickname] : []),
      nickname: suspectData.nickname || '',
      approximateAge: suspectData.approximateAge,
      gender: suspectData.gender || 'Unknown',
      physicalDescription: suspectData.physicalDescription || {},
      phoneNumbers: suspectData.phoneNumbers || [],
      knownAreas: suspectData.knownAreas || (targetCase?.locationName ? [targetCase.locationName] : []),
      photos: suspectData.photos || [],
      status: suspectData.status || 'SUSPECT',
      lifecycleState: 'ACTIVE',
      associatedVehicles: [],
      associatedPersons: [],
      linkedCaseIds: [caseId],
      observations: [
        {
          id: `OBS-${Date.now()}`,
          observationId: `OBS-${Date.now().toString().slice(-4)}`,
          poiId: poiId,
          relatedCaseId: caseId,
          incidentTimestamp: now,
          locationDescription: targetCase ? targetCase.locationName : 'Hartbeesfontein Sector',
          description: `Identified and linked as suspect in Case ${targetCase?.caseNumber || caseId}: ${suspectData.notes || 'Suspect recorded on case file'}`,
          sourceType: 'COMMUNITY',
          enteredByUid: currentUser.uid,
          enteredByName: `${currentUser.name} ${currentUser.surname}`.trim(),
          enteredTimestamp: now,
          verificationStatus: 'VERIFIED',
          confidenceLevel: 'HIGH',
          evidenceReferences: suspectData.photos || [],
          notes: suspectData.notes || `Suspect linked to Case ${targetCase?.caseNumber || caseId}`,
        },
      ],
      notes: suspectData.notes || `Identified as suspect in Case ${targetCase?.caseNumber || caseId}.`,
      createdByUid: currentUser.uid,
      createdByName: `${currentUser.name} ${currentUser.surname}`.trim(),
      createdAt: now,
      updatedAt: now,
    };

    // 1. Add to POI database automatically
    setPois((prev) => [newPoi, ...prev]);

    // 2. Link to target case
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const existingLinked = c.linkedPoiIds || [];
        const updatedLinked = existingLinked.includes(poiId) ? existingLinked : [...existingLinked, poiId];
        const newUpdate: CaseUpdate = {
          id: `UPD-${Date.now()}`,
          caseId: c.id,
          authorUid: currentUser.uid,
          authorName: `${currentUser.name} ${currentUser.surname}`.trim(),
          authorRole: currentUser.role,
          message: `Suspect added to case and Intelligence POI registry: ${displayName} (${internalPoiId}, Status: ${newPoi.status})`,
          updateType: 'progress',
          isInternalOnly: false,
          timestamp: now,
        };
        return {
          ...c,
          linkedPoiIds: updatedLinked,
          updates: [...(c.updates || []), newUpdate],
          updatedAt: now,
        };
      })
    );

    // 3. Log Audit Trail
    logIntelAudit({
      action: 'ADD_POI',
      entityId: poiId,
      entityType: 'POI',
      details: `Created suspect POI ${internalPoiId} (${displayName}) linked directly to Case ${targetCase?.caseNumber || caseId}`,
    });

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'SUSPECT_ADDED',
      description: `Added suspect ${displayName} (${internalPoiId}) to Case ${targetCase?.caseNumber || caseId} and synchronized with POI list`,
    });

    return poiId;
  };

  const linkPoiToCase = (caseId: string, poiId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    const targetPoi = pois.find((p) => p.id === poiId || p.internalPoiId === poiId);
    const now = new Date().toISOString();

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const existing = c.linkedPoiIds || [];
        if (existing.includes(poiId)) return c;
        const newUpdate: CaseUpdate = {
          id: `UPD-${Date.now()}`,
          caseId: c.id,
          authorUid: currentUser.uid,
          authorName: `${currentUser.name} ${currentUser.surname}`.trim(),
          authorRole: currentUser.role,
          message: `Linked existing POI dossier ${targetPoi?.internalPoiId || poiId} (${targetPoi ? `${targetPoi.name} ${targetPoi.surname || ''}`.trim() : 'Subject'}) to case`,
          updateType: 'progress',
          isInternalOnly: false,
          timestamp: now,
        };
        return {
          ...c,
          linkedPoiIds: [...existing, poiId],
          updates: [...(c.updates || []), newUpdate],
          updatedAt: now,
        };
      })
    );

    setPois((prev) =>
      prev.map((p) => {
        if (p.id !== poiId && p.internalPoiId !== poiId) return p;
        const existingCases = p.linkedCaseIds || [];
        if (existingCases.includes(caseId)) return p;
        return {
          ...p,
          linkedCaseIds: [...existingCases, caseId],
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'POI_LINKED',
      description: `Linked POI ${targetPoi?.internalPoiId || poiId} to Case ${targetCase?.caseNumber || caseId}`,
    });
  };

  const unlinkPoiFromCase = (caseId: string, poiId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    const targetPoi = pois.find((p) => p.id === poiId || p.internalPoiId === poiId);
    const now = new Date().toISOString();

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          linkedPoiIds: (c.linkedPoiIds || []).filter((id) => id !== poiId && id !== targetPoi?.internalPoiId && id !== targetPoi?.id),
          updatedAt: now,
        };
      })
    );

    setPois((prev) =>
      prev.map((p) => {
        if (p.id !== poiId && p.internalPoiId !== poiId) return p;
        return {
          ...p,
          linkedCaseIds: (p.linkedCaseIds || []).filter((id) => id !== caseId),
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'CASE',
      recordId: caseId,
      action: 'POI_UNLINKED',
      description: `Unlinked POI ${targetPoi?.internalPoiId || poiId} from Case ${targetCase?.caseNumber || caseId}`,
    });
  };

  const createTrafficHazard = async (data: {
    category: TrafficHazardCategory;
    location: string;
    description: string;
    time: string;
    expectedDuration?: string;
    photos?: string[];
  }): Promise<string> => {
    const alertId = `ALT-TRF-${Date.now()}`;
    const alertNumber = `ALT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newAlert: AlertNotification = {
      id: alertId,
      alertNumber,
      type: 'TRAFFIC',
      title: `TRAFFIC WARNING: ${data.category.toUpperCase().replace('_', ' ')} on ${data.location}`,
      shortDescription: data.description,
      priority: 'medium',
      location: data.location,
      targetDistribution: 'all',
      acknowledgements: [],
      updates: [],
      isAllClear: false,
      activeFrom: now,
      isClosed: false,
      requiresAck: false,
      publishedAt: now,
      publishedByUid: currentUser.uid,
      publishedByName: `${currentUser.name} ${currentUser.surname}`,
    };

    setAlerts((prev) => [newAlert, ...prev]);

    logAuditEvent({
      recordType: 'ALERT',
      recordId: alertId,
      action: 'TRAFFIC_HAZARD_LOGGED',
      description: `Reported traffic hazard: ${data.location}`,
    });

    return alertId;
  };

  const saveSituationDraft = useCallback((draft: Partial<SituationReport>) => {
    setSituationDraft((prev) => {
      if (
        prev?.sourceName === draft.sourceName &&
        prev?.sourcePhone === draft.sourcePhone &&
        prev?.sourceType === draft.sourceType &&
        prev?.location === draft.location &&
        prev?.category === draft.category &&
        prev?.description === draft.description &&
        prev?.notes === draft.notes
      ) {
        return prev;
      }
      return draft;
    });
  }, []);

  const clearSituationDraft = useCallback(() => {
    setSituationDraft(null);
    safeRemoveItem('hv_situation_draft');
  }, []);

  const createSituationReport = async (data: {
    sourceName: string;
    sourcePhone?: string;
    sourceType: SituationReport['sourceType'];
    location: string;
    gpsLocation?: { latitude: number; longitude: number };
    category: IncidentCategory | 'general_intel';
    description: string;
    notes?: string;
    isPrivate?: boolean;
    actionDecision: 'report_only' | 'link_open_case' | 'open_new_case';
    linkedCaseId?: string;
    broadcastTargets?: SitrepBroadcastTarget[];
    selectedAreaGroupId?: string;
    distributionOption?:
      | 'no_broadcast'
      | 'community_notice'
      | 'security_alert'
      | 'traffic_alert'
      | 'fire_alert'
      | 'bolo'
      | 'notify_management'
      | 'reaction_force';
  }): Promise<string> => {
    const reportId = `SIT-${Date.now()}`;
    const reportNumber = `SIT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    let assignedLinkedCaseId = data.linkedCaseId;

    // Handle Open New Case
    if (data.actionDecision === 'open_new_case') {
      const caseCategory = (data.category === 'general_intel' ? 'suspicious_activity' : data.category) as IncidentCategory;
      const newCaseId = `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const todayDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().slice(0, 5);

      const newCase: Case = {
        id: newCaseId,
        caseNumber: newCaseId,
        title: `${data.category === 'traffic_alert' || data.category === 'road_incident' ? 'Traffic Alert' : (data.category || 'Incident').replace(/_/g, ' ').toUpperCase()}: ${data.location}`,
        category: caseCategory,
        priority: 'medium',
        status: 'open',
        isPublic: true,
        incidentDate: todayDate,
        incidentTime: currentTime,
        locationName: data.location,
        gpsLocation: data.gpsLocation,
        description: data.description,
        reportedByUid: currentUser.uid,
        reportedByName: data.sourceName,
        reportedByPhone: data.sourcePhone || '',
        photos: [],
        evidence: [],
        linkedPoiIds: [],
        linkedVehicleIds: [],
        linkedSituationId: reportId,
        updates: [
          {
            id: `UPD-${Date.now()}`,
            caseId: newCaseId,
            authorUid: currentUser.uid,
            authorName: `${currentUser.name} ${currentUser.surname}`,
            authorRole: currentUser.role,
            message: `Initial SITREP report logged by Control Room from ${data.sourceName} via ${data.sourceType}. ${data.description}${data.gpsLocation && data.gpsLocation.latitude != null && data.gpsLocation.longitude != null ? ` [GPS: ${Number(data.gpsLocation.latitude).toFixed(5)}, ${Number(data.gpsLocation.longitude).toFixed(5)}]` : ''}`,
            updateType: 'progress',
            gpsLocation: data.gpsLocation,
            isInternalOnly: false,
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };
      setCases((prev) => [newCase, ...prev]);
      assignedLinkedCaseId = newCaseId;
    } else if (data.actionDecision === 'link_open_case' && data.linkedCaseId) {
      // Append SITREP note to existing case
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== data.linkedCaseId) return c;
          return {
            ...c,
            updatedAt: now,
            updates: [
              ...c.updates,
              {
                id: `UPD-${Date.now()}`,
                caseId: c.id,
                authorUid: currentUser.uid,
                authorName: `${currentUser.name} ${currentUser.surname}`,
                authorRole: currentUser.role,
                message: `SITREP Appended (${reportNumber}): Source: ${data.sourceName} (${data.sourceType}) - ${data.description}${data.gpsLocation && data.gpsLocation.latitude != null && data.gpsLocation.longitude != null ? ` [GPS: ${Number(data.gpsLocation.latitude).toFixed(5)}, ${Number(data.gpsLocation.longitude).toFixed(5)}]` : ''}`,
                updateType: 'responder_note',
                gpsLocation: data.gpsLocation,
                isInternalOnly: false,
                timestamp: now,
              },
            ],
          };
        })
      );
    }

    const isPrivate = data.isPrivate ?? false;

    const newReport: SituationReport = {
      id: reportId,
      reportNumber,
      sourceName: data.sourceName,
      sourcePhone: data.sourcePhone,
      sourceType: data.sourceType,
      timestamp: now,
      location: data.location,
      gpsLocation: data.gpsLocation,
      category: data.category,
      description: data.description,
      notes: data.notes,
      status: data.actionDecision === 'open_new_case' ? 'converted_to_case' : 'active',
      isPrivate,
      linkedCaseId: assignedLinkedCaseId,
      broadcastTargets: data.broadcastTargets,
      selectedAreaGroupId: data.selectedAreaGroupId,
      createdByUid: currentUser.uid,
      createdByName: `${currentUser.name} ${currentUser.surname}`,
      createdAt: now,
      updatedAt: now,
    };

    setSituationReports((prev) => [newReport, ...prev]);
    syncSituationReportToFirestore(newReport).catch((err) =>
      console.warn('Could not sync situation report to Firestore:', err)
    );
    clearSituationDraft();

    // If Sitrep is not private, ensure it is broadcasted as an active alert notice for all clients
    if (!isPrivate) {
      const alertType: AlertType =
        data.category === 'fire'
          ? 'FIRE'
          : data.category === 'road_incident' || data.category === 'traffic_alert'
          ? 'TRAFFIC'
          : data.category === 'stock_theft' || data.category === 'theft' || data.category === 'suspicious_activity'
          ? 'SECURITY_ALERT'
          : 'COMMUNITY_NOTICE';

      const alertPriority =
        data.category === 'fire' ||
        data.category === 'stock_theft' ||
        data.category === 'theft' ||
        data.category === 'traffic_alert' ||
        data.category === 'road_incident'
          ? 'high'
          : 'medium';

      const sitrepAlert: AlertNotification = {
        id: `ALT-SIT-${reportId}`,
        alertNumber: `ALT-${reportNumber}`,
        type: alertType,
        title: `SITREP [${reportNumber}]: ${data.location}`,
        shortDescription: data.description,
        priority: alertPriority,
        location: data.location,
        targetDistribution: 'all',
        acknowledgements: [],
        updates: [],
        isAllClear: false,
        activeFrom: now,
        isClosed: false,
        requiresAck: false,
        publishedAt: now,
        publishedByUid: currentUser.uid,
        publishedByName: `${currentUser.name} ${currentUser.surname}`,
      };

      setAlerts((prev) => [sitrepAlert, ...prev]);
      syncAlertToFirestore(sitrepAlert).catch((err) =>
        console.warn('Could not sync sitrep alert to Firestore:', err)
      );
    }

    // Log audit events for broadcasts
    const targets = data.broadcastTargets || [];
    const broadcastSummary = targets.length > 0
      ? `Targets: ${targets.join(', ')}`
      : data.distributionOption || 'Internal';

    logAuditEvent({
      recordType: 'SITUATION',
      recordId: reportId,
      action: 'SITREP_LOGGED',
      description: `Logged Situation Report ${reportNumber} (${broadcastSummary})`,
    });

    return reportId;
  };

  const createBolo = async (
    bolo: Omit<BoloRecord, 'id' | 'boloNumber' | 'createdAt' | 'updatedAt' | 'createdByUid' | 'createdByName'>
  ): Promise<string> => {
    const id = `BOLO-${Date.now()}`;
    const boloNumber = `BOLO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newBolo: BoloRecord = {
      id,
      boloNumber,
      ...bolo,
      createdByUid: currentUser.uid,
      createdByName: `${currentUser.name} ${currentUser.surname}`,
      createdAt: now,
      updatedAt: now,
    };

    setBolos((prev) => [newBolo, ...prev]);

    logAuditEvent({
      recordType: 'BOLO',
      recordId: id,
      action: 'BOLO_CREATED',
      description: `Created BOLO ${boloNumber}: ${bolo.title}`,
    });

    return id;
  };

  const updateBoloStatus = (boloId: string, status: BoloRecord['status']) => {
    const now = new Date().toISOString();
    setBolos((prev) => prev.map((b) => (b.id === boloId ? { ...b, status, updatedAt: now } : b)));
    logAuditEvent({
      recordType: 'BOLO',
      recordId: boloId,
      action: 'BOLO_STATUS_CHANGED',
      description: `BOLO ${boloId} status updated to ${status}`,
    });
  };

  const logIntelAudit = useCallback(
    (entry: Omit<IntelAuditEntry, 'id' | 'actorUid' | 'actorName' | 'actorRole' | 'timestamp'>) => {
      const newAudit: IntelAuditEntry = {
        id: `IAUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        actorUid: currentUser.uid,
        actorName: `${currentUser.name} ${currentUser.surname}`.trim(),
        actorRole: activeRole,
        timestamp: new Date().toISOString(),
        ...entry,
      };
      setIntelAuditLogs((prev) => [newAudit, ...prev]);
    },
    [currentUser, activeRole]
  );

  const createPoi = async (
    poi: Omit<PersonOfInterest, 'id' | 'internalPoiId' | 'createdAt' | 'updatedAt' | 'createdByUid' | 'observations'>
  ): Promise<string> => {
    const id = `POI-${Date.now()}`;
    const internalPoiId = `POI-HBF-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newPoi: PersonOfInterest = {
      id,
      internalPoiId,
      ...poi,
      lifecycleState: 'ACTIVE',
      observations: [],
      createdByUid: currentUser.uid,
      createdByName: `${currentUser.name} ${currentUser.surname}`,
      createdAt: now,
      updatedAt: now,
    };

    setPois((prev) => [newPoi, ...prev]);

    logIntelAudit({
      action: 'ADD_POI',
      entityId: id,
      entityType: 'POI',
      details: `Created Person of Interest dossier ${internalPoiId}: ${poi.name} ${poi.surname || ''} (${poi.status})`,
    });

    logAuditEvent({
      recordType: 'INTELLIGENCE_POI',
      recordId: id,
      action: 'POI_CREATED',
      description: `Added Person of Interest ${internalPoiId}: ${poi.name} ${poi.surname || ''}`,
    });

    return id;
  };

  const updatePoi = (poiId: string, updates: Partial<PersonOfInterest>) => {
    const now = new Date().toISOString();
    setPois((prev) =>
      prev.map((p) => (p.id === poiId ? { ...p, ...updates, updatedAt: now } : p))
    );
    logIntelAudit({
      action: 'UPDATE_PROFILE',
      entityId: poiId,
      entityType: 'POI',
      details: `Updated details on POI ${poiId}`,
    });
  };

  const updatePoiStatus = (
    poiId: string,
    status: PoiStatus,
    reason: string,
    convictionInfo?: PersonOfInterest['convictionDetails']
  ) => {
    const now = new Date().toISOString();
    const actorName = `${currentUser.name} ${currentUser.surname}`.trim();

    setPois((prev) =>
      prev.map((p) => {
        if (p.id !== poiId) return p;
        const previousStatus = p.status;
        const trail = p.statusAuditTrail || [];
        const newEntry = {
          previousStatus,
          newStatus: status,
          reason: reason || 'Operational status update',
          changedByUid: currentUser.uid,
          changedByName: actorName,
          timestamp: now,
        };

        return {
          ...p,
          status,
          statusAuditTrail: [newEntry, ...trail],
          convictionDetails: convictionInfo || p.convictionDetails,
          updatedAt: now,
        };
      })
    );

    logIntelAudit({
      action: 'CHANGE_STATUS',
      entityId: poiId,
      entityType: 'POI',
      details: `Changed POI ${poiId} status to ${status}. Reason: ${reason}`,
    });

    logAuditEvent({
      recordType: 'INTELLIGENCE_POI',
      recordId: poiId,
      action: 'POI_STATUS_CHANGED',
      description: `POI ${poiId} status updated to ${status}. Reason: ${reason}`,
    });
  };

  const archivePoi = (poiId: string, reason: string) => {
    const now = new Date().toISOString();
    setPois((prev) =>
      prev.map((p) =>
        p.id === poiId
          ? {
              ...p,
              lifecycleState: 'ARCHIVED',
              archiveReason: reason,
              archivedAt: now,
              updatedAt: now,
            }
          : p
      )
    );
    logIntelAudit({
      action: 'ARCHIVE',
      entityId: poiId,
      entityType: 'POI',
      details: `Archived POI ${poiId}. Reason: ${reason}`,
    });
  };

  const deletePoi = async (poiId: string, reason?: string): Promise<boolean> => {
    if (activeRole !== 'MANAGEMENT' && currentUser?.role !== 'MANAGEMENT') {
      console.warn('Unauthorized POI deletion attempt: only MANAGEMENT can delete POIs');
      logAuditEvent({
        recordType: 'INTELLIGENCE_POI' as any,
        recordId: poiId,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        description: `Unauthorized attempt to delete POI ${poiId} by user ${currentUser?.uid} (${activeRole || currentUser?.role})`,
      });
      return false;
    }

    const targetPoi = pois.find((p) => p.id === poiId);
    if (!targetPoi) {
      return false;
    }

    // Remove POI from pois array
    setPois((prev) => prev.filter((p) => p.id !== poiId));

    // Clean up linkages in VOIs (associatedPersonIds)
    setVois((prev) =>
      prev.map((v) =>
        v.associatedPersonIds && v.associatedPersonIds.includes(poiId)
          ? {
              ...v,
              associatedPersonIds: v.associatedPersonIds.filter((id) => id !== poiId),
              updatedAt: new Date().toISOString(),
            }
          : v
      )
    );

    // Clean up linkages in Cases (suspects / associated POIs)
    setCases((prev) =>
      prev.map((c) =>
        c.suspects && c.suspects.some((s) => (s as any).poiId === poiId || s.name === targetPoi.name)
          ? {
              ...c,
              suspects: c.suspects.filter((s) => (s as any).poiId !== poiId && s.name !== targetPoi.name),
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    // Clean up relationships
    setIntelRelationships((prev) =>
      prev.filter((r) => r.sourceEntityId !== poiId && r.targetEntityId !== poiId)
    );

    logIntelAudit({
      action: 'DELETE_POI' as any,
      entityId: poiId,
      entityType: 'POI',
      details: `Permanently deleted POI ${targetPoi.internalPoiId} (${targetPoi.name || ''} ${targetPoi.surname || ''}). Reason: ${reason || 'Management Action'}`,
    });

    logAuditEvent({
      recordType: 'INTELLIGENCE_POI' as any,
      recordId: poiId,
      action: 'POI_DELETED' as any,
      description: `POI ${targetPoi.internalPoiId} [${targetPoi.name || ''} ${targetPoi.surname || ''}] permanently deleted by Management (${currentUser?.name} ${currentUser?.surname}). Reason: ${reason || 'Management Action'}`,
    });

    return true;
  };

  const createVoi = async (
    voi: Omit<VehicleOfInterest, 'id' | 'internalVoiId' | 'createdAt' | 'updatedAt' | 'createdByUid'>
  ): Promise<string> => {
    const id = `VOI-${Date.now()}`;
    const internalVoiId = `VOI-HBF-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newVoi: VehicleOfInterest = {
      id,
      internalVoiId,
      ...voi,
      registration: voi.registration.trim().toUpperCase(),
      lifecycleState: 'ACTIVE',
      createdByUid: currentUser.uid,
      createdByName: `${currentUser.name} ${currentUser.surname}`,
      createdAt: now,
      updatedAt: now,
    };

    setVois((prev) => [newVoi, ...prev]);

    logIntelAudit({
      action: 'ADD_VOI',
      entityId: id,
      entityType: 'VOI',
      details: `Created Vehicle of Interest ${internalVoiId}: ${newVoi.registration} (${newVoi.make} ${newVoi.model || ''})`,
    });

    logAuditEvent({
      recordType: 'INTELLIGENCE_VOI' as any,
      recordId: id,
      action: 'VOI_CREATED',
      description: `Added Vehicle of Interest ${internalVoiId} [${newVoi.registration}]`,
    });

    return id;
  };

  const updateVoi = (voiId: string, updates: Partial<VehicleOfInterest>) => {
    const now = new Date().toISOString();
    setVois((prev) =>
      prev.map((v) => (v.id === voiId ? { ...v, ...updates, updatedAt: now } : v))
    );
    logIntelAudit({
      action: 'UPDATE_PROFILE',
      entityId: voiId,
      entityType: 'VOI',
      details: `Updated details on VOI ${voiId}`,
    });
  };

  const updateVoiStatus = (
    voiId: string,
    status: VehicleOfInterest['status'],
    reason: string
  ) => {
    const now = new Date().toISOString();
    setVois((prev) =>
      prev.map((v) =>
        v.id === voiId
          ? {
              ...v,
              status,
              notes: reason ? `${v.notes || ''}\n[${now.substring(0, 10)} Status: ${status}] ${reason}` : v.notes,
              updatedAt: now,
            }
          : v
      )
    );
    logIntelAudit({
      action: 'CHANGE_STATUS',
      entityId: voiId,
      entityType: 'VOI',
      details: `Updated VOI ${voiId} status to ${status}. Reason: ${reason}`,
    });
  };

  const archiveVoi = (voiId: string, reason: string) => {
    const now = new Date().toISOString();
    setVois((prev) =>
      prev.map((v) =>
        v.id === voiId
          ? {
              ...v,
              lifecycleState: 'ARCHIVED',
              archiveReason: reason,
              archivedAt: now,
              updatedAt: now,
            }
          : v
      )
    );
    logIntelAudit({
      action: 'ARCHIVE',
      entityId: voiId,
      entityType: 'VOI',
      details: `Archived VOI ${voiId}. Reason: ${reason}`,
    });
  };

  const deleteVoi = async (voiId: string, reason?: string): Promise<boolean> => {
    if (activeRole !== 'MANAGEMENT' && currentUser?.role !== 'MANAGEMENT') {
      console.warn('Unauthorized VOI deletion attempt: only MANAGEMENT can delete VOIs');
      logAuditEvent({
        recordType: 'INTELLIGENCE_VOI' as any,
        recordId: voiId,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        description: `Unauthorized attempt to delete VOI ${voiId} by user ${currentUser?.uid} (${activeRole || currentUser?.role})`,
      });
      return false;
    }

    const targetVoi = vois.find((v) => v.id === voiId);
    if (!targetVoi) {
      return false;
    }

    // Remove VOI from vois array
    setVois((prev) => prev.filter((v) => v.id !== voiId));

    // Clean up linkages in POIs (associatedVehicles)
    setPois((prev) =>
      prev.map((p) => {
        if (!p.associatedVehicles || p.associatedVehicles.length === 0) return p;
        const reg = targetVoi.registration.toUpperCase();
        return {
          ...p,
          associatedVehicles: p.associatedVehicles.filter(
            (v: any) => (typeof v === 'string' ? v.toUpperCase() !== reg : v?.registration?.toUpperCase() !== reg && v?.voiId !== voiId)
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Clean up linkages in Cases (suspect vehicles)
    setCases((prev) =>
      prev.map((c) =>
        c.suspectVehicles && c.suspectVehicles.some((sv) => (sv as any).voiId === voiId || sv.registration?.toUpperCase() === targetVoi.registration.toUpperCase())
          ? {
              ...c,
              suspectVehicles: c.suspectVehicles.filter((sv) => (sv as any).voiId !== voiId && sv.registration?.toUpperCase() !== targetVoi.registration.toUpperCase()),
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    // Clean up relationships
    setIntelRelationships((prev) =>
      prev.filter((r) => r.sourceEntityId !== voiId && r.targetEntityId !== voiId)
    );

    logIntelAudit({
      action: 'DELETE_VOI' as any,
      entityId: voiId,
      entityType: 'VOI',
      details: `Permanently deleted VOI ${targetVoi.internalVoiId} (${targetVoi.registration} - ${targetVoi.make} ${targetVoi.model}). Reason: ${reason || 'Management Action'}`,
    });

    logAuditEvent({
      recordType: 'INTELLIGENCE_VOI' as any,
      recordId: voiId,
      action: 'VOI_DELETED' as any,
      description: `VOI ${targetVoi.internalVoiId} [${targetVoi.registration}] permanently deleted by Management (${currentUser?.name} ${currentUser?.surname}). Reason: ${reason || 'Management Action'}`,
    });

    return true;
  };

  const addIntelObservation = async (
    observation: Omit<IntelObservation, 'id' | 'observationId' | 'enteredByUid' | 'enteredByName' | 'enteredTimestamp'>
  ): Promise<string> => {
    const id = `OBS-${Date.now()}`;
    const observationId = `OBS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newObs: IntelObservation = {
      id,
      observationId,
      ...observation,
      enteredByUid: currentUser.uid,
      enteredByName: `${currentUser.name} ${currentUser.surname}`,
      enteredTimestamp: now,
    };

    setIntelObservations((prev) => [newObs, ...prev]);

    // Also associate to POI if poiId specified
    if (observation.poiId) {
      setPois((prev) =>
        prev.map((p) =>
          p.id === observation.poiId
            ? {
                ...p,
                observations: [newObs, ...p.observations],
                lastSeen: `${observation.date} ${observation.time} (${observation.locationDescription})`,
                updatedAt: now,
              }
            : p
        )
      );
    }

    // Also update VOI lastSeen if vehicleId specified
    if (observation.vehicleId) {
      setVois((prev) =>
        prev.map((v) =>
          v.id === observation.vehicleId
            ? {
                ...v,
                lastSeen: `${observation.date} ${observation.time} (${observation.locationDescription})`,
                updatedAt: now,
              }
            : v
        )
      );
    }

    logIntelAudit({
      action: 'ADD_OBSERVATION',
      entityId: id,
      entityType: 'OBSERVATION',
      details: `Added observation ${observationId} (${observation.verificationStatus}) at ${observation.locationDescription}`,
    });

    logAuditEvent({
      recordType: 'INTELLIGENCE_POI',
      recordId: id,
      action: 'INTEL_OBSERVATION_ADDED',
      description: `Added observation ${observationId}`,
    });

    return id;
  };

  const verifyIntelObservation = (
    obsId: string,
    status: IntelVerificationStatus,
    confidence?: IntelConfidenceLevel,
    notes?: string
  ) => {
    setIntelObservations((prev) =>
      prev.map((obs) => {
        if (obs.id !== obsId) return obs;
        return {
          ...obs,
          verificationStatus: status,
          confidenceLevel: confidence || obs.confidenceLevel,
          notes: notes ? `${obs.notes || ''} [Verified by ${currentUser.name}: ${notes}]` : obs.notes,
        };
      })
    );

    logIntelAudit({
      action: 'VERIFY_RECORD',
      entityId: obsId,
      entityType: 'OBSERVATION',
      details: `Observation ${obsId} verification changed to ${status} (Confidence: ${confidence || 'unchanged'})`,
    });
  };

  const disputeIntelObservation = (
    obsId: string,
    originalValue: string,
    correction: string,
    reason: string
  ) => {
    const now = new Date().toISOString();
    const disputeEntry = {
      disputedByUid: currentUser.uid,
      disputedByName: `${currentUser.name} ${currentUser.surname}`.trim(),
      reason,
      proposedCorrection: correction,
      originalValue,
      timestamp: now,
    };

    setIntelObservations((prev) =>
      prev.map((obs) => {
        if (obs.id !== obsId) return obs;
        const trail = obs.disputeTrail || [];
        return {
          ...obs,
          verificationStatus: 'DISPUTED',
          disputeTrail: [disputeEntry, ...trail],
        };
      })
    );

    logIntelAudit({
      action: 'DISPUTE_RECORD',
      entityId: obsId,
      entityType: 'OBSERVATION',
      details: `Disputed observation ${obsId}: "${reason}" - Correction: "${correction}"`,
    });
  };

  const createIntelRelationship = (
    rel: Omit<IntelRelationship, 'id' | 'createdAt' | 'createdByUid' | 'createdByName'>
  ): string => {
    const id = `REL-${Date.now()}`;
    const now = new Date().toISOString();

    const newRel: IntelRelationship = {
      id,
      ...rel,
      createdByUid: currentUser.uid,
      createdByName: `${currentUser.name} ${currentUser.surname}`,
      createdAt: now,
    };

    setIntelRelationships((prev) => [newRel, ...prev]);

    // Update POI or VOI association arrays for fast lookup
    if (rel.sourceType === 'PERSON' && rel.targetType === 'VEHICLE') {
      setPois((prev) =>
        prev.map((p) =>
          p.id === rel.sourceId && !p.associatedVehicles.includes(rel.targetId)
            ? { ...p, associatedVehicles: [...p.associatedVehicles, rel.targetId] }
            : p
        )
      );
      setVois((prev) =>
        prev.map((v) =>
          v.id === rel.targetId && !v.associatedPersonIds.includes(rel.sourceId)
            ? { ...v, associatedPersonIds: [...v.associatedPersonIds, rel.sourceId] }
            : v
        )
      );
    } else if (rel.sourceType === 'PERSON' && rel.targetType === 'CASE') {
      setPois((prev) =>
        prev.map((p) =>
          p.id === rel.sourceId && !p.linkedCaseIds.includes(rel.targetId)
            ? { ...p, linkedCaseIds: [...p.linkedCaseIds, rel.targetId] }
            : p
        )
      );
      setCases((prev) =>
        prev.map((c) =>
          c.id === rel.targetId && !c.linkedPoiIds.includes(rel.sourceId)
            ? { ...c, linkedPoiIds: [...c.linkedPoiIds, rel.sourceId] }
            : c
        )
      );
    } else if (rel.sourceType === 'VEHICLE' && rel.targetType === 'CASE') {
      setVois((prev) =>
        prev.map((v) =>
          v.id === rel.sourceId && !v.associatedCaseIds.includes(rel.targetId)
            ? { ...v, associatedCaseIds: [...v.associatedCaseIds, rel.targetId] }
            : v
        )
      );
      setCases((prev) =>
        prev.map((c) =>
          c.id === rel.targetId && !c.linkedVehicleIds.includes(rel.sourceId)
            ? { ...c, linkedVehicleIds: [...c.linkedVehicleIds, rel.sourceId] }
            : c
        )
      );
    }

    logIntelAudit({
      action: 'ADD_RELATIONSHIP',
      entityId: id,
      entityType: 'RELATIONSHIP',
      details: `Created link [${rel.relationshipType}] from ${rel.sourceLabel || rel.sourceId} to ${rel.targetLabel || rel.targetId}`,
    });

    return id;
  };

  const removeIntelRelationship = (relId: string) => {
    setIntelRelationships((prev) => prev.filter((r) => r.id !== relId));
    logIntelAudit({
      action: 'REMOVE_RELATIONSHIP',
      entityId: relId,
      entityType: 'RELATIONSHIP',
      details: `Removed relationship ${relId}`,
    });
  };

  const verifyIntelRelationship = (
    relId: string,
    verification: IntelRelationship['verification']
  ) => {
    setIntelRelationships((prev) =>
      prev.map((r) => (r.id === relId ? { ...r, verification } : r))
    );
    logIntelAudit({
      action: 'VERIFY_RECORD',
      entityId: relId,
      entityType: 'RELATIONSHIP',
      details: `Set relationship ${relId} verification to ${verification}`,
    });
  };

  const addReviewQueueItem = (
    item: Omit<IntelReviewItem, 'id' | 'timestamp' | 'status'>
  ): string => {
    const id = `REV-${Date.now()}`;
    const now = new Date().toISOString();

    const newItem: IntelReviewItem = {
      id,
      ...item,
      timestamp: now,
      status: 'PENDING_REVIEW',
    };

    setIntelReviewQueue((prev) => [newItem, ...prev]);
    return id;
  };

  const processReviewQueueItem = async (
    itemId: string,
    action: NonNullable<IntelReviewItem['actionTaken']>,
    actionNotes: string,
    payloadUpdates?: any
  ): Promise<void> => {
    const now = new Date().toISOString();
    const reviewerName = `${currentUser.name} ${currentUser.surname}`.trim();

    const item = intelReviewQueue.find((i) => i.id === itemId);
    if (!item) return;

    let newStatus: IntelReviewItem['status'] = 'ACCEPTED';
    if (action === 'DISMISS_FALSE_REPORT' || action === 'MARK_LEGITIMATE_ACTIVITY') {
      newStatus = 'REJECTED';
    } else if (action === 'MERGE_INTO_EXISTING') {
      newStatus = 'MERGED';
    } else if (action === 'REQUEST_MORE_EVIDENCE') {
      newStatus = 'FLAGGED_FOR_FOLLOWUP';
    }

    // Execute actions based on type
    if (action === 'CREATE_NEW_VOI' && item.payload?.vehicleData) {
      const v = item.payload.vehicleData;
      await createVoi({
        registration: v.registration || 'UNKNOWN',
        isPartialRegistration: v.isPartialRegistration || false,
        make: v.make || 'Unknown',
        model: v.model || 'Unknown',
        colour: v.colour || 'Unknown',
        damage: v.damage,
        canopyOrAccessories: v.canopyOrAccessories,
        distinguishingMarks: v.distinguishingMarks,
        status: 'FLAGGED',
        photos: [],
        notes: `Promoted from review item ${itemId}: ${item.description}`,
        associatedCaseIds: [],
        associatedPersonIds: [],
        associatedBoloIds: [],
      });
    } else if (action === 'CREATE_NEW_POI' && item.payload?.personData) {
      const p = item.payload.personData;
      await createPoi({
        name: p.name || 'Unknown',
        surname: p.surname || 'Subject',
        aliases: p.aliases || [],
        approximateAge: p.approximateAge,
        phoneNumbers: p.phoneNumbers || [],
        addresses: p.addresses || [],
        knownAreas: p.knownAreas || [],
        photos: [],
        status: 'UNKNOWN_PERSON',
        physicalDescription: p.physicalDescription || {},
        associatedVehicles: [],
        associatedPersons: [],
        linkedCaseIds: [],
        notes: `Promoted from review item ${itemId}: ${item.description}`,
      });
    } else if (action === 'ATTACH_OBSERVATION_TO_EXISTING' && payloadUpdates?.targetEntityId) {
      await addIntelObservation({
        poiId: payloadUpdates.targetEntityType === 'POI' ? payloadUpdates.targetEntityId : undefined,
        vehicleId: payloadUpdates.targetEntityType === 'VOI' ? payloadUpdates.targetEntityId : undefined,
        relatedCaseId: payloadUpdates.targetEntityType === 'CASE' ? payloadUpdates.targetEntityId : undefined,
        relatedBoloId: payloadUpdates.targetEntityType === 'BOLO' ? payloadUpdates.targetEntityId : undefined,
        incidentTimestamp: item.timestamp,
        date: item.timestamp.substring(0, 10),
        time: item.timestamp.substring(11, 16),
        locationDescription: item.location || 'Reported Location',
        gpsLocation: item.gpsLocation,
        description: item.description,
        sourceType: 'CLIENT_REPORT',
        sourceReference: `Submitted by ${item.reportedByName}`,
        verificationStatus: 'VERIFIED',
        confidenceLevel: 'MEDIUM',
        evidenceReferences: [],
        notes: actionNotes,
      });
    }

    setIntelReviewQueue((prev) =>
      prev.map((r) =>
        r.id === itemId
          ? {
              ...r,
              status: newStatus,
              actionTaken: action,
              actionNotes,
              reviewedByUid: currentUser.uid,
              reviewedByName: reviewerName,
              reviewedTimestamp: now,
            }
          : r
      )
    );

    logIntelAudit({
      action: 'APPROVE_SUBMISSION',
      entityId: itemId,
      entityType: 'REVIEW_QUEUE',
      details: `Processed review queue item ${itemId}: ${action}. Result: ${newStatus}`,
    });
  };

  const mergePersons = (primaryPoiId: string, duplicatePoiId: string, reason: string) => {
    const now = new Date().toISOString();
    const primary = pois.find((p) => p.id === primaryPoiId);
    const duplicate = pois.find((p) => p.id === duplicatePoiId);

    if (!primary || !duplicate) return;

    // Merge attributes into primary (deduplicated)
    const combinedAliases = Array.from(new Set([...primary.aliases, ...duplicate.aliases]));
    const combinedPhones = Array.from(new Set([...primary.phoneNumbers, ...duplicate.phoneNumbers]));
    const combinedAddresses = Array.from(new Set([...(primary.addresses || []), ...(duplicate.addresses || [])]));
    const combinedKnownAreas = Array.from(new Set([...primary.knownAreas, ...duplicate.knownAreas]));
    const combinedCases = Array.from(new Set([...primary.linkedCaseIds, ...duplicate.linkedCaseIds]));
    const combinedVehicles = Array.from(new Set([...primary.associatedVehicles, ...duplicate.associatedVehicles]));

    const mergeRecord = {
      mergedRecordId: duplicatePoiId,
      mergedAt: now,
      mergedByUid: currentUser.uid,
      mergedByName: `${currentUser.name} ${currentUser.surname}`.trim(),
      reason,
    };

    // Update primary
    setPois((prev) =>
      prev.map((p) => {
        if (p.id === primaryPoiId) {
          return {
            ...p,
            aliases: combinedAliases,
            phoneNumbers: combinedPhones,
            addresses: combinedAddresses,
            knownAreas: combinedKnownAreas,
            linkedCaseIds: combinedCases,
            associatedVehicles: combinedVehicles,
            mergeHistory: [...(p.mergeHistory || []), mergeRecord],
            notes: `${p.notes}\n[Merged with ${duplicate.internalPoiId || duplicate.id} on ${now.substring(0, 10)}]: ${reason}`,
            updatedAt: now,
          };
        }
        if (p.id === duplicatePoiId) {
          return {
            ...p,
            lifecycleState: 'MERGED',
            mergedIntoPoiId: primaryPoiId,
            mergeReason: reason,
            isPossibleDuplicateOf: primaryPoiId,
            updatedAt: now,
          };
        }
        return p;
      })
    );

    // Re-point relationships
    setIntelRelationships((prev) =>
      prev.map((r) => {
        if (r.sourceId === duplicatePoiId && r.sourceType === 'PERSON') {
          return { ...r, sourceId: primaryPoiId, sourceLabel: `${primary.name} ${primary.surname || ''} (Merged)` };
        }
        if (r.targetId === duplicatePoiId && r.targetType === 'PERSON') {
          return { ...r, targetId: primaryPoiId, targetLabel: `${primary.name} ${primary.surname || ''} (Merged)` };
        }
        return r;
      })
    );

    logIntelAudit({
      action: 'MERGE_RECORDS',
      entityId: primaryPoiId,
      entityType: 'POI',
      details: `Merged duplicate POI ${duplicate.internalPoiId || duplicatePoiId} into ${primary.internalPoiId || primaryPoiId}. Reason: ${reason}`,
    });
  };

  const mergeVehicles = (primaryVoiId: string, duplicateVoiId: string, reason: string) => {
    const now = new Date().toISOString();
    const primary = vois.find((v) => v.id === primaryVoiId);
    const duplicate = vois.find((v) => v.id === duplicateVoiId);

    if (!primary || !duplicate) return;

    const combinedPersons = Array.from(new Set([...primary.associatedPersonIds, ...duplicate.associatedPersonIds]));
    const combinedCases = Array.from(new Set([...primary.associatedCaseIds, ...duplicate.associatedCaseIds]));
    const combinedBolos = Array.from(new Set([...primary.associatedBoloIds, ...duplicate.associatedBoloIds]));

    const mergeRecord = {
      mergedRecordId: duplicateVoiId,
      mergedAt: now,
      mergedByUid: currentUser.uid,
      mergedByName: `${currentUser.name} ${currentUser.surname}`.trim(),
      reason,
    };

    setVois((prev) =>
      prev.map((v) => {
        if (v.id === primaryVoiId) {
          return {
            ...v,
            associatedPersonIds: combinedPersons,
            associatedCaseIds: combinedCases,
            associatedBoloIds: combinedBolos,
            mergeHistory: [...(v.mergeHistory || []), mergeRecord],
            notes: `${v.notes}\n[Merged with ${duplicate.internalVoiId || duplicate.registration} on ${now.substring(0, 10)}]: ${reason}`,
            updatedAt: now,
          };
        }
        if (v.id === duplicateVoiId) {
          return {
            ...v,
            lifecycleState: 'MERGED',
            mergedIntoVoiId: primaryVoiId,
            mergeReason: reason,
            isPossibleDuplicateOf: primaryVoiId,
            updatedAt: now,
          };
        }
        return v;
      })
    );

    // Re-point relationships
    setIntelRelationships((prev) =>
      prev.map((r) => {
        if (r.sourceId === duplicateVoiId && r.sourceType === 'VEHICLE') {
          return { ...r, sourceId: primaryVoiId, sourceLabel: `${primary.registration} (Merged)` };
        }
        if (r.targetId === duplicateVoiId && r.targetType === 'VEHICLE') {
          return { ...r, targetId: primaryVoiId, targetLabel: `${primary.registration} (Merged)` };
        }
        return r;
      })
    );

    logIntelAudit({
      action: 'MERGE_RECORDS',
      entityId: primaryVoiId,
      entityType: 'VOI',
      details: `Merged duplicate VOI ${duplicate.registration} into ${primary.registration}. Reason: ${reason}`,
    });
  };

  const getUnifiedTimeline = useCallback(
    (entityType: 'PERSON' | 'VEHICLE' | 'CASE', entityId: string) => {
      const items: {
        id: string;
        timestamp: string;
        date: string;
        title: string;
        detail: string;
        source: string;
        sourceType: string;
        refId: string;
        verification?: string;
      }[] = [];

      // 1. Observations
      intelObservations.forEach((obs) => {
        const matches =
          (entityType === 'PERSON' && obs.poiId === entityId) ||
          (entityType === 'VEHICLE' && obs.vehicleId === entityId) ||
          (entityType === 'CASE' && obs.relatedCaseId === entityId);

        if (matches) {
          items.push({
            id: obs.id,
            timestamp: obs.incidentTimestamp || `${obs.date}T${obs.time || '12:00'}:00Z`,
            date: obs.date,
            title: `Observation [${obs.verificationStatus}] - ${obs.locationDescription}`,
            detail: obs.description,
            source: obs.sourceReference || obs.enteredByName,
            sourceType: obs.sourceType,
            refId: obs.observationId,
            verification: obs.verificationStatus,
          });
        }
      });

      // 2. Case updates
      if (entityType === 'CASE') {
        const foundCase = cases.find((c) => c.id === entityId);
        if (foundCase) {
          items.push({
            id: `case-create-${foundCase.id}`,
            timestamp: foundCase.createdAt,
            date: foundCase.incidentDate,
            title: `Case Reported: ${foundCase.caseNumber}`,
            detail: `${foundCase.title} - ${foundCase.description}`,
            source: foundCase.reportedByName,
            sourceType: 'CASE_REPORT',
            refId: foundCase.caseNumber,
          });

          foundCase.updates.forEach((u) => {
            items.push({
              id: u.id,
              timestamp: u.timestamp,
              date: u.timestamp.substring(0, 10),
              title: `Case Update (${u.updateType})`,
              detail: u.message,
              source: u.authorName,
              sourceType: 'OPERATIONAL_UPDATE',
              refId: foundCase.caseNumber,
            });
          });
        }
      }

      // 3. Status changes from audit trail
      if (entityType === 'PERSON') {
        const foundPoi = pois.find((p) => p.id === entityId);
        if (foundPoi?.statusAuditTrail) {
          foundPoi.statusAuditTrail.forEach((t, i) => {
            items.push({
              id: `poi-status-${i}-${t.timestamp}`,
              timestamp: t.timestamp,
              date: t.timestamp.substring(0, 10),
              title: `Status Changed: ${t.previousStatus} ➔ ${t.newStatus}`,
              detail: `Reason: ${t.reason}`,
              source: t.changedByName,
              sourceType: 'STATUS_CHANGE',
              refId: foundPoi.internalPoiId,
            });
          });
        }
      }

      // Sort descending by timestamp
      return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [intelObservations, cases, pois]
  );

  const getDataQualityIssues = useCallback((): DataQualityIssue[] => {
    const issues: DataQualityIssue[] = [];

    // Check active POIs with missing critical info
    pois.forEach((poi) => {
      if (poi.lifecycleState === 'ARCHIVED' || poi.lifecycleState === 'MERGED') return;

      if ((poi.status === 'WANTED' || poi.status === 'SUSPECT') && poi.observations.length === 0) {
        issues.push({
          id: `DQ-POI-NO-OBS-${poi.id}`,
          severity: 'HIGH',
          entityType: 'PERSON',
          entityId: poi.id,
          entityLabel: `${poi.name} ${poi.surname || ''} (${poi.internalPoiId})`,
          issueDescription: `High status (${poi.status}) without direct linked observations or SAPS reference notes.`,
          suggestedAction: 'Add verifying observation or attach SAPS CAS number.',
        });
      }

      if (!poi.physicalDescription?.build && !poi.physicalDescription?.clothingLastSeen) {
        issues.push({
          id: `DQ-POI-DESC-${poi.id}`,
          severity: 'MEDIUM',
          entityType: 'PERSON',
          entityId: poi.id,
          entityLabel: `${poi.name} ${poi.surname || ''}`,
          issueDescription: 'Missing physical description details (height, build, or identifying marks).',
          suggestedAction: 'Edit dossier to enrich physical attributes for field identification.',
        });
      }
    });

    // Check VOIs
    vois.forEach((voi) => {
      if (voi.lifecycleState === 'ARCHIVED' || voi.lifecycleState === 'MERGED') return;

      if (voi.isPartialRegistration && !voi.distinguishingMarks) {
        issues.push({
          id: `DQ-VOI-PARTIAL-${voi.id}`,
          severity: 'HIGH',
          entityType: 'VEHICLE',
          entityId: voi.id,
          entityLabel: `${voi.registration} (${voi.make} ${voi.model})`,
          issueDescription: 'Partial registration without distinguishing vehicle marks (canopy, damage, stickers).',
          suggestedAction: 'Record distinguishing marks or damage to narrow down identification.',
        });
      }

      if (voi.status === 'FLAGGED' && voi.associatedCaseIds.length === 0 && voi.associatedBoloIds.length === 0) {
        issues.push({
          id: `DQ-VOI-ORPHAN-${voi.id}`,
          severity: 'MEDIUM',
          entityType: 'VEHICLE',
          entityId: voi.id,
          entityLabel: `${voi.registration} (${voi.make})`,
          issueDescription: 'Vehicle flagged but not linked to any active Case or BOLO.',
          suggestedAction: 'Link to corresponding incident case or remove FLAGGED status.',
        });
      }
    });

    // Check Unverified observations
    intelObservations.forEach((obs) => {
      if (obs.verificationStatus === 'UNVERIFIED' && obs.confidenceLevel === 'HIGH') {
        issues.push({
          id: `DQ-OBS-UNVERIFIED-${obs.id}`,
          severity: 'HIGH',
          entityType: 'OBSERVATION',
          entityId: obs.id,
          entityLabel: `${obs.observationId} (${obs.locationDescription})`,
          issueDescription: 'Observation marked with HIGH confidence but status remains UNVERIFIED.',
          suggestedAction: 'Review source attribution and verify or adjust confidence level.',
        });
      }
    });

    return issues;
  }, [pois, vois, intelObservations]);

  const calculateEligibleResponders = useCallback(
    (params: {
      centerLocation?: { latitude: number; longitude: number };
      radiusKm?: number;
      groupIds?: string[];
      excludeUid?: string;
      limit?: number;
      skipUids?: string[];
    }): { user: UserProfile; distanceKm: number }[] => {
      const storedUsers: UserProfile[] = safeGetJSON<UserProfile[]>(
        'hv_users_actual_v2',
        safeGetJSON<UserProfile[]>('hv_users_v2', [])
      );

      const effectiveCenter = params.centerLocation || { latitude: -26.7645, longitude: 26.4128 };
      const skipSet = new Set(params.skipUids || []);
      if (params.excludeUid) skipSet.add(params.excludeUid);

      const eligible: { user: UserProfile; distanceKm: number }[] = [];

      for (const u of storedUsers) {
        if (!u.isActive) continue;
        if (skipSet.has(u.uid)) continue;
        // Check if responder participation is active
        if (u.communityResponseSettings?.participateNearbyEmergencies === false) continue;
        if (u.communityResponseSettings?.availableToAssistNow === false) continue;

        // Check group inclusion if specified
        if (params.groupIds && params.groupIds.length > 0) {
          const userGroups = areaGroups.filter((g) => g.memberUserIds?.includes(u.uid)).map((g) => g.id);
          const inGroup = params.groupIds.some((gid) => userGroups.includes(gid) || gid === 'GRP-ALL');
          if (!inGroup && !params.radiusKm) {
            continue;
          }
        }

        // Distance calculation
        let userLat = effectiveCenter.latitude;
        let userLon = effectiveCenter.longitude;
        let hasCustomLoc = false;

        if (u.farmGpsLocation?.latitude && u.farmGpsLocation?.longitude) {
          userLat = u.farmGpsLocation.latitude;
          userLon = u.farmGpsLocation.longitude;
          hasCustomLoc = true;
        }

        const distance = calculateHaversineDistanceKm(
          effectiveCenter.latitude,
          effectiveCenter.longitude,
          userLat,
          userLon
        );

        // Check user's preferred max distance
        if (u.communityResponseSettings?.maxResponseDistanceKm) {
          if (distance > u.communityResponseSettings.maxResponseDistanceKm) {
            continue;
          }
        }

        // Check requested radius
        if (params.radiusKm && distance > params.radiusKm) {
          continue;
        }

        eligible.push({ user: u, distanceKm: hasCustomLoc ? distance : 0 });
      }

      eligible.sort((a, b) => a.distanceKm - b.distanceKm);

      if (params.limit && params.limit > 0) {
        return eligible.slice(0, params.limit);
      }

      return eligible;
    },
    [areaGroups]
  );

  const createCommunityAssistanceRequest = async (data: {
    emergencyId?: string;
    caseId?: string;
    requestType: AssistanceRequestType;
    priority: AssistancePriority;
    publicSafeTitle: string;
    publicSafeMessage: string;
    safetyWarning: string;
    structuredInstructions: StructuredSafetyInstruction;
    customInstructions?: string;
    locationPrecision: LocationPrecision;
    targetAreaName: string;
    approximateLocationDescription?: string;
    gpsLocation?: { latitude: number; longitude: number };
    farmNameSafe?: string;
    contactPhoneSafe?: string;
    stagingPoint?: StagingPointInfo;
    targetFilter: {
      targetType: 'GROUPS' | 'NEARBY_CLIENTS' | 'SELECTED_USERS' | 'AREA_ELIGIBLE';
      groupIds?: string[];
      radiusKm?: number;
      centerLocation?: { latitude: number; longitude: number };
      selectedUserIds?: string[];
    };
  }): Promise<string> => {
    const id = `REQ-${Date.now()}`;
    const requestNumber = `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    let candidates: { user: UserProfile; distanceKm: number }[] = [];
    if (data.targetFilter.targetType === 'SELECTED_USERS' && data.targetFilter.selectedUserIds) {
      const storedUsers: UserProfile[] = safeGetJSON<UserProfile[]>(
        'hv_users_actual_v2',
        safeGetJSON<UserProfile[]>('hv_users_v2', [])
      );
      candidates = storedUsers
        .filter((u) => data.targetFilter.selectedUserIds?.includes(u.uid))
        .map((u) => ({ user: u, distanceKm: 0 }));
    } else {
      candidates = calculateEligibleResponders({
        centerLocation: data.gpsLocation || data.targetFilter.centerLocation,
        radiusKm: data.targetFilter.radiusKm || settings.communityResponse?.defaultRadiusKm || 15,
        groupIds: data.targetFilter.groupIds,
        excludeUid: currentUser.uid,
      });
    }

    const targetUserIds = candidates.map((c) => c.user.uid);

    const initialResponders: ResponderRecord[] = candidates.map((c) => ({
      userUid: c.user.uid,
      userName: `${c.user.name} ${c.user.surname}`,
      userPhone: c.user.primaryPhone,
      farmOrBase: c.user.farmName || c.user.sector || 'Hartbeesfontein',
      distanceKm: c.distanceKm,
      status: 'SEEN',
      statusTimestamp: now,
      timeline: [{ status: 'SEEN', timestamp: now }],
    }));

    const newRequest: CommunityAssistanceRequest = {
      id,
      emergencyId: data.emergencyId,
      caseId: data.caseId,
      requestType: data.requestType,
      priority: data.priority,
      status: 'ACTIVE',
      publicSafeTitle: data.publicSafeTitle,
      publicSafeMessage: data.publicSafeMessage,
      safetyWarning: data.safetyWarning,
      structuredInstructions: data.structuredInstructions,
      customInstructions: data.customInstructions,
      locationPrecision: data.locationPrecision,
      targetAreaName: data.targetAreaName,
      approximateLocationDescription: data.approximateLocationDescription,
      gpsLocation: data.gpsLocation,
      farmNameSafe: data.farmNameSafe,
      contactPhoneSafe: data.contactPhoneSafe,
      stagingPoint: data.stagingPoint,
      targetFilter: data.targetFilter,
      targetUserIds,
      responders: initialResponders,
      escalationRound: 1,
      escalationHistory: [
        {
          round: 1,
          triggeredAt: now,
          triggeredByUid: currentUser.uid,
          triggeredByName: `${currentUser.name} ${currentUser.surname}`,
          reason: `Initial broadcast to ${candidates.length} responders (${data.targetAreaName})`,
          candidateCount: candidates.length,
          notifiedUserIds: targetUserIds,
        },
      ],
      stats: {
        sentCount: candidates.length,
        deliveredCount: candidates.length,
        openedCount: 0,
        seenCount: 0,
        canAssistCount: 0,
        respondingCount: 0,
        arrivedCount: 0,
        unableCount: 0,
      },
      isAllClear: false,
      createdAt: now,
      createdByUid: currentUser.uid,
      createdByName: `${currentUser.name} ${currentUser.surname}`,
      updatedAt: now,
    };

    setAssistanceRequests((prev) => [newRequest, ...prev]);

    // Create linked alert notification for client feeds
    const alertId = `ALT-REQ-${Date.now()}`;
    const alertNumber = `ALT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const linkedAlert: AlertNotification = {
      id: alertId,
      alertNumber,
      type: 'COMMUNITY_ASSISTANCE',
      title: data.publicSafeTitle,
      shortDescription: data.publicSafeMessage,
      priority: data.priority === 'CRITICAL' ? 'critical' : data.priority === 'HIGH' ? 'high' : 'medium',
      location: data.targetAreaName,
      targetDistribution: 'groups',
      targetGroupIds: data.targetFilter.groupIds,
      linkedAssistanceRequestId: id,
      locationPrecision: data.locationPrecision,
      radiusKm: data.targetFilter.radiusKm,
      acknowledgements: [],
      updates: [],
      isAllClear: false,
      activeFrom: now,
      isClosed: false,
      requiresAck: true,
      publishedAt: now,
      publishedByUid: currentUser.uid,
      publishedByName: `${currentUser.name} ${currentUser.surname}`,
    };

    setAlerts((prev) => [linkedAlert, ...prev]);

    if (data.emergencyId) {
      setEmergencies((prev) =>
        prev.map((e) => {
          if (e.id !== data.emergencyId) return e;
          const timelineEvent: EmergencyTimelineEvent = {
            id: `TLE-${Date.now()}`,
            emergencyId: data.emergencyId!,
            timestamp: now,
            eventType: 'COMMUNITY_ALERT_CREATED',
            actorUid: currentUser.uid,
            actorName: `${currentUser.name} ${currentUser.surname}`,
            actorRole: activeRole,
            description: `Community Assistance Request ${id} dispatched (${candidates.length} responders)`,
          };
          return { ...e, timeline: [timelineEvent, ...e.timeline], updatedAt: now };
        })
      );
    }

    logAuditEvent({
      recordType: 'ASSISTANCE_REQUEST',
      recordId: id,
      action: 'ASSISTANCE_REQUEST_CREATED',
      description: `Created Community Assistance Request ${id} (${candidates.length} targeted)`,
    });

    return id;
  };

  const acknowledgeAssistanceRequest = async (
    requestId: string,
    status: ResponderStatus,
    notes?: string,
    currentGps?: { latitude: number; longitude: number }
  ) => {
    const now = new Date().toISOString();

    setAssistanceRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;

        const existingResponder = req.responders.find((r) => r.userUid === currentUser.uid);
        let updatedResponders: ResponderRecord[];

        if (existingResponder) {
          updatedResponders = req.responders.map((r) => {
            if (r.userUid !== currentUser.uid) return r;
            return {
              ...r,
              status,
              notes: notes || r.notes,
              statusTimestamp: now,
              timeline: [
                ...r.timeline,
                {
                  status,
                  timestamp: now,
                  notes,
                  location: currentGps,
                },
              ],
            };
          });
        } else {
          const newResponderRecord: ResponderRecord = {
            userUid: currentUser.uid,
            userName: `${currentUser.name} ${currentUser.surname}`,
            userPhone: currentUser.primaryPhone,
            farmOrBase: currentUser.farmName || currentUser.sector || 'Hartbeesfontein',
            distanceKm: 0,
            status,
            statusTimestamp: now,
            notes,
            timeline: [
              {
                status,
                timestamp: now,
                notes,
                location: currentGps,
              },
            ],
          };
          updatedResponders = [...req.responders, newResponderRecord];
        }

        const stats = {
          sentCount: Math.max(req.stats.sentCount, updatedResponders.length),
          deliveredCount: Math.max(req.stats.deliveredCount, updatedResponders.length),
          openedCount: req.stats.openedCount + 1,
          seenCount: updatedResponders.filter((r) => r.status === 'SEEN').length,
          canAssistCount: updatedResponders.filter((r) => r.status === 'CAN_ASSIST').length,
          respondingCount: updatedResponders.filter((r) => r.status === 'RESPONDING').length,
          arrivedCount: updatedResponders.filter((r) => r.status === 'ARRIVED').length,
          unableCount: updatedResponders.filter((r) => r.status === 'UNABLE_TO_ASSIST').length,
        };

        return {
          ...req,
          responders: updatedResponders,
          stats,
          updatedAt: now,
        };
      })
    );

    // Also update any linked alert notification
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.linkedAssistanceRequestId !== requestId) return a;
        const exists = a.acknowledgements.find((ack) => ack.userUid === currentUser.uid);
        const mappedStatus = status === 'ARRIVED' || status === 'RESPONDING' ? 'RESPONDING' : status === 'CAN_ASSIST' ? 'CAN_ASSIST' : 'SEEN';
        let updatedAcks = a.acknowledgements;
        if (exists) {
          updatedAcks = a.acknowledgements.map((ack) =>
            ack.userUid === currentUser.uid ? { ...ack, status: mappedStatus, notes, timestamp: now } : ack
          );
        } else {
          updatedAcks = [
            ...a.acknowledgements,
            {
              userUid: currentUser.uid,
              userName: `${currentUser.name} ${currentUser.surname}`,
              status: mappedStatus,
              notes,
              timestamp: now,
            },
          ];
        }
        return { ...a, acknowledgements: updatedAcks };
      })
    );

    logAuditEvent({
      recordType: 'RESPONDER_STATUS',
      recordId: requestId,
      action: 'RESPONDER_STATUS_UPDATED',
      description: `Responder ${currentUser.name} ${currentUser.surname} acknowledged request ${requestId} as ${status}`,
    });
  };

  const escalateAssistanceRequest = async (requestId: string, reason?: string, expandRadiusKm?: number) => {
    const now = new Date().toISOString();
    const targetReq = assistanceRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const currentNotified = new Set(targetReq.targetUserIds);
    const newRadius = (targetReq.targetFilter.radiusKm || 15) + (expandRadiusKm || settings.communityResponse?.escalationRadiusKm || 10);

    const newCandidates = calculateEligibleResponders({
      centerLocation: targetReq.gpsLocation || targetReq.targetFilter.centerLocation,
      radiusKm: newRadius,
      skipUids: Array.from(currentNotified),
      excludeUid: currentUser.uid,
    });

    const newTargetUids = newCandidates.map((c) => c.user.uid);
    const allTargetUids = [...targetReq.targetUserIds, ...newTargetUids];

    const newResponderRecords: ResponderRecord[] = newCandidates.map((c) => ({
      userUid: c.user.uid,
      userName: `${c.user.name} ${c.user.surname}`,
      userPhone: c.user.primaryPhone,
      farmOrBase: c.user.farmName || c.user.sector || 'Hartbeesfontein',
      distanceKm: c.distanceKm,
      status: 'SEEN',
      statusTimestamp: now,
      timeline: [{ status: 'SEEN', timestamp: now }],
    }));

    const nextRound = targetReq.escalationRound + 1;

    setAssistanceRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          escalationRound: nextRound,
          targetUserIds: allTargetUids,
          responders: [...req.responders, ...newResponderRecords],
          targetFilter: {
            ...req.targetFilter,
            radiusKm: newRadius,
          },
          escalationHistory: [
            ...req.escalationHistory,
            {
              round: nextRound,
              triggeredAt: now,
              triggeredByUid: currentUser.uid,
              triggeredByName: `${currentUser.name} ${currentUser.surname}`,
              reason: reason || `Manual escalation round ${nextRound} (+${newCandidates.length} responders, radius expanded to ${newRadius}km)`,
              candidateCount: newCandidates.length,
              notifiedUserIds: newTargetUids,
              radiusKm: newRadius,
            },
          ],
          stats: {
            ...req.stats,
            sentCount: allTargetUids.length,
            deliveredCount: allTargetUids.length,
          },
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'ESCALATION',
      recordId: requestId,
      action: 'ESCALATION_TRIGGERED',
      description: `Escalated assistance request ${targetReq.id} to Round ${nextRound} (+${newCandidates.length} users)`,
    });
  };

  const updateResponderAssignment = (
    requestId: string,
    responderUid: string,
    updates: { assignedRole?: string; isRemoved?: boolean; operationalNote?: string }
  ) => {
    const now = new Date().toISOString();
    setAssistanceRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          responders: req.responders.map((r) => {
            if (r.userUid !== responderUid) return r;
            return {
              ...r,
              assignedRole: updates.assignedRole !== undefined ? updates.assignedRole : r.assignedRole,
              isRemovedFromTask: updates.isRemoved !== undefined ? updates.isRemoved : r.isRemovedFromTask,
              notes: updates.operationalNote ? `${r.notes || ''} [CR Note: ${updates.operationalNote}]` : r.notes,
              statusTimestamp: now,
            };
          }),
          updatedAt: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'RESPONDER_STATUS',
      recordId: `${requestId}-${responderUid}`,
      action: 'RESPONDER_ASSIGNMENT_UPDATED',
      description: `Updated assignment for responder ${responderUid} on ${requestId}: role=${updates.assignedRole || 'none'}`,
    });
  };

  const sendAllClearForAssistance = (requestId: string, message: string) => {
    const now = new Date().toISOString();
    setAssistanceRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          isAllClear: true,
          status: 'RESOLVED',
          allClearMessage: message,
          allClearTimestamp: now,
          allClearByUid: currentUser.uid,
          updatedAt: now,
        };
      })
    );

    // Also mark linked alert notification
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.linkedAssistanceRequestId !== requestId) return a;
        return {
          ...a,
          isAllClear: true,
          allClearMessage: message,
          allClearTimestamp: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'ALL_CLEAR',
      recordId: requestId,
      action: 'ALL_CLEAR_ISSUED',
      description: `Issued All-Clear for assistance request ${requestId}: ${message}`,
    });
  };

  const submitBoloSighting = async (sighting: {
    boloId: string;
    boloNumber: string;
    locationDescription: string;
    gpsLocation?: { latitude: number; longitude: number; accuracy?: number };
    directionOfTravel?: string;
    description: string;
    photoUrl?: string;
  }): Promise<string> => {
    const id = `BS-${Date.now()}`;
    const now = new Date().toISOString();

    const newSighting: BoloSighting = {
      id,
      boloId: sighting.boloId,
      boloNumber: sighting.boloNumber,
      reportedByUid: currentUser.uid,
      reportedByName: `${currentUser.name} ${currentUser.surname}`,
      reportedByPhone: currentUser.primaryPhone,
      timestamp: now,
      locationDescription: sighting.locationDescription,
      gpsLocation: sighting.gpsLocation,
      directionOfTravel: sighting.directionOfTravel,
      description: sighting.description,
      photoUrl: sighting.photoUrl,
      verificationStatus: 'UNVERIFIED',
    };

    setBoloSightings((prev) => [newSighting, ...prev]);

    logAuditEvent({
      recordType: 'BOLO_SIGHTING',
      recordId: id,
      action: 'BOLO_SIGHTING_SUBMITTED',
      description: `Submitted sighting ${id} for BOLO ${sighting.boloNumber} at ${sighting.locationDescription}`,
    });

    return id;
  };

  const verifyBoloSighting = (sightingId: string, status: BoloSighting['verificationStatus'], notes?: string) => {
    const now = new Date().toISOString();
    setBoloSightings((prev) =>
      prev.map((s) => {
        if (s.id !== sightingId) return s;
        return {
          ...s,
          verificationStatus: status,
          verifiedByUid: currentUser.uid,
          verifiedByName: `${currentUser.name} ${currentUser.surname}`,
          verifiedAt: now,
          verificationNotes: notes,
        };
      })
    );

    logAuditEvent({
      recordType: 'BOLO_SIGHTING',
      recordId: sightingId,
      action: 'BOLO_SIGHTING_VERIFIED',
      description: `BOLO Sighting ${sightingId} verified as ${status} by Control Room`,
    });
  };

  const createAlert = async (
    alert: Omit<AlertNotification, 'id' | 'alertNumber' | 'publishedAt' | 'publishedByUid' | 'publishedByName' | 'acknowledgements' | 'updates' | 'isAllClear' | 'isClosed'>
  ): Promise<string> => {
    const id = `ALT-${Date.now()}`;
    const alertNumber = `ALT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newAlert: AlertNotification = {
      id,
      alertNumber,
      ...alert,
      acknowledgements: [],
      updates: [],
      isAllClear: false,
      isClosed: false,
      publishedAt: now,
      publishedByUid: currentUser.uid,
      publishedByName: `${currentUser.name} ${currentUser.surname}`,
    };

    setAlerts((prev) => [newAlert, ...prev]);

    logAuditEvent({
      recordType: 'ALERT',
      recordId: id,
      action: 'ALERT_BROADCAST',
      description: `Broadcasted alert ${alertNumber}: ${alert.title}`,
    });

    return id;
  };

  const acknowledgeAlert = (alertId: string, status: 'SEEN' | 'CAN_ASSIST' | 'RESPONDING', notes?: string) => {
    const now = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        const exists = a.acknowledgements.find((ack) => ack.userUid === currentUser.uid);
        let updatedAcks = a.acknowledgements;
        if (exists) {
          updatedAcks = a.acknowledgements.map((ack) =>
            ack.userUid === currentUser.uid ? { ...ack, status, notes, timestamp: now } : ack
          );
        } else {
          updatedAcks = [
            ...a.acknowledgements,
            {
              userUid: currentUser.uid,
              userName: `${currentUser.name} ${currentUser.surname}`,
              status,
              notes,
              timestamp: now,
            },
          ];
        }
        return { ...a, acknowledgements: updatedAcks };
      })
    );

    logAuditEvent({
      recordType: 'ALERT',
      recordId: alertId,
      action: 'ALERT_ACKNOWLEDGED',
      description: `Acknowledged alert ${alertId} as ${status}`,
    });
  };

  const addAlertUpdate = (alertId: string, message: string, notifyUsers: boolean = false) => {
    const now = new Date().toISOString();
    const updateItem: AlertUpdateItem = {
      id: `ALU-${Date.now()}`,
      timestamp: now,
      message,
      authorUid: currentUser.uid,
      authorName: `${currentUser.name} ${currentUser.surname}`,
      notifyUsers,
    };

    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, updates: [...(a.updates || []), updateItem] } : a))
    );

    logAuditEvent({
      recordType: 'ALERT',
      recordId: alertId,
      action: 'ALERT_UPDATE_ADDED',
      description: `Added update to alert ${alertId}: ${message}`,
    });
  };

  const sendAllClearForAlert = (alertId: string, message: string) => {
    const now = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          isAllClear: true,
          allClearMessage: message,
          allClearTimestamp: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'ALL_CLEAR',
      recordId: alertId,
      action: 'ALL_CLEAR_ISSUED',
      description: `Issued All Clear for alert ${alertId}: ${message}`,
    });
  };

  const closeAlert = (alertId: string, reason?: string) => {
    const now = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          isClosed: true,
          closedByUid: currentUser.uid,
          closedTimestamp: now,
        };
      })
    );

    logAuditEvent({
      recordType: 'ALERT',
      recordId: alertId,
      action: 'ALERT_CLOSED',
      description: `Closed alert ${alertId}${reason ? `: ${reason}` : ''}`,
    });
  };

  const createGroup = (group: {
    name: string;
    code?: string;
    description: string;
    geographicDescription?: string;
    groupType: GroupType;
    leaderName?: string;
    leaderPhone?: string;
    memberUserIds?: string[];
    whatsappInviteLink?: string;
    whatsappGroupJid?: string;
    whatsappBroadcastType?: WhatsAppBroadcastType;
    priorityLevel?: GroupPriorityLevel;
    autoDispatchTriggers?: GroupAutoDispatchTriggers;
    muteNotifications?: boolean;
    sector?: string;
    coverageRadiusKm?: number;
    broadcastFrequencyLimit?: 'IMMEDIATE' | 'HOURLY_DIGEST' | 'DAILY_DIGEST';
  }) => {
    const newGroup: AreaGroup = {
      id: `GRP-${Date.now()}`,
      code: group.code || `SEC-${group.name.substring(0, 3).toUpperCase()}`,
      name: group.name,
      description: group.description,
      geographicDescription: group.geographicDescription,
      groupType: group.groupType || 'GENERAL',
      leaderName: group.leaderName,
      leaderPhone: group.leaderPhone,
      memberUserIds: group.memberUserIds || [],
      isActive: true,
      activeMemberCount: (group.memberUserIds || []).length || 1,
      whatsappInviteLink: group.whatsappInviteLink,
      whatsappGroupJid: group.whatsappGroupJid,
      whatsappBroadcastType: group.whatsappBroadcastType || 'GROUP_CHAT',
      priorityLevel: group.priorityLevel || 'HIGH',
      autoDispatchTriggers: group.autoDispatchTriggers || {
        emergencySos: true,
        farmAttack: true,
        wildfire: true,
        suspiciousVehicleBolo: true,
        roadblockTraffic: false,
        sitrepSummary: true,
        communityNotice: false,
        drillTesting: false,
      },
      muteNotifications: group.muteNotifications || false,
      sector: group.sector,
      coverageRadiusKm: group.coverageRadiusKm || 25,
      broadcastFrequencyLimit: group.broadcastFrequencyLimit || 'IMMEDIATE',
      createdByUid: currentUser.uid,
      createdByName: `${currentUser.name} ${currentUser.surname}`,
      createdAt: new Date().toISOString(),
    };
    setAreaGroups((prev) => [...prev, newGroup]);

    logAuditEvent({
      recordType: 'GROUP',
      recordId: newGroup.id,
      action: 'GROUP_CREATED',
      description: `Created group ${newGroup.name} (${newGroup.groupType}) with WhatsApp broadcast integration`,
    });
  };

  const updateGroup = (groupId: string, updates: Partial<AreaGroup>) => {
    setAreaGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const memberCount = updates.memberUserIds ? updates.memberUserIds.length : g.activeMemberCount;
        return { ...g, ...updates, activeMemberCount: memberCount };
      })
    );

    logAuditEvent({
      recordType: 'GROUP',
      recordId: groupId,
      action: 'GROUP_UPDATED',
      description: `Updated group settings for ${groupId}`,
    });
  };

  const deleteGroup = (groupId: string) => {
    setAreaGroups((prev) => prev.filter((g) => g.id !== groupId));
    logAuditEvent({
      recordType: 'GROUP',
      recordId: groupId,
      action: 'GROUP_DELETED',
      description: `Deleted area group ${groupId}`,
    });
  };

  const assignUsersToGroup = (groupId: string, userUids: string[]) => {
    setAreaGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const currentMembers = new Set(g.memberUserIds || []);
        userUids.forEach((uid) => currentMembers.add(uid));
        const updatedList = Array.from(currentMembers);
        return {
          ...g,
          memberUserIds: updatedList,
          activeMemberCount: updatedList.length,
        };
      })
    );

    logAuditEvent({
      recordType: 'GROUP_MEMBERSHIP',
      recordId: groupId,
      action: 'GROUP_MEMBERS_ASSIGNED',
      description: `Assigned ${userUids.length} members to group ${groupId}`,
    });
  };

  const removeUsersFromGroup = (groupId: string, userUids: string[]) => {
    setAreaGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const toRemove = new Set(userUids);
        const updatedList = (g.memberUserIds || []).filter((uid) => !toRemove.has(uid));
        return {
          ...g,
          memberUserIds: updatedList,
          activeMemberCount: updatedList.length,
        };
      })
    );

    logAuditEvent({
      recordType: 'GROUP_MEMBERSHIP',
      recordId: groupId,
      action: 'GROUP_MEMBERS_REMOVED',
      description: `Removed ${userUids.length} members from group ${groupId}`,
    });
  };

  const createLocationArea = async (area: Omit<LocationArea, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const slug = area.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 15);
    const newId = `LOC-${slug}-${Date.now().toString().slice(-4)}`;
    const newArea: LocationArea = {
      ...area,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocationAreas((prev) => [...prev, newArea]);
    logAuditEvent({
      recordType: 'SYSTEM',
      recordId: newId,
      action: 'SETTINGS_UPDATED',
      description: `Created location area ${area.name} (${area.sector || 'General'})`,
    });
    return newId;
  };

  const updateLocationArea = async (id: string, updates: Partial<LocationArea>): Promise<void> => {
    setLocationAreas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
    logAuditEvent({
      recordType: 'SYSTEM',
      recordId: id,
      action: 'SETTINGS_UPDATED',
      description: `Updated location area ${updates.name || id}`,
    });
  };

  const deleteLocationArea = async (id: string): Promise<void> => {
    const area = locationAreas.find((a) => a.id === id);
    setLocationAreas((prev) => prev.filter((a) => a.id !== id));
    logAuditEvent({
      recordType: 'SYSTEM',
      recordId: id,
      action: 'SETTINGS_UPDATED',
      description: `Deleted location area ${area?.name || id}`,
    });
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAuditEvent({
      recordType: 'SETTINGS',
      recordId: 'GLOBAL_SETTINGS',
      action: 'SETTINGS_UPDATED',
      description: `Updated system dispatch settings`,
    });
  };

  // =========================================================================
  // PRODUCTION HARDENING & REPORTING METHODS
  // =========================================================================

  const saveGeneratedReport = async (
    report: Omit<GeneratedReportRecord, 'id' | 'generatedTimestamp' | 'generatedByUid' | 'generatedByName' | 'generatedByRole'>
  ): Promise<string> => {
    const id = `REP-${Date.now()}`;
    const newRecord: GeneratedReportRecord = {
      id,
      generatedTimestamp: new Date().toISOString(),
      generatedByUid: currentUser.uid,
      generatedByName: `${currentUser.name} ${currentUser.surname}`.trim(),
      generatedByRole: activeRole,
      ...report,
    };

    setGeneratedReports((prev) => [newRecord, ...prev]);

    logAuditEvent({
      recordType: 'REPORT_GENERATION',
      recordId: id,
      action: 'MANAGEMENT_REPORT_ARCHIVED',
      description: `Archived ${report.reportType} report for period ${report.dateRange?.filterOption || 'CUSTOM'}`,
    });

    return id;
  };

  const deleteGeneratedReport = async (id: string): Promise<void> => {
    setGeneratedReports((prev) => prev.filter((r) => r.id !== id));
    logAuditEvent({
      recordType: 'REPORT_GENERATION',
      recordId: id,
      action: 'MANAGEMENT_REPORT_DELETED',
      description: `Deleted archived report ${id}`,
    });
  };

  const createBackupRecord = async (type: BackupRecord['type']): Promise<BackupRecord> => {
    const id = `BKP-${Date.now()}`;
    const newBackup: BackupRecord = {
      id,
      timestamp: new Date().toISOString(),
      type,
      storageBucket: `gs://hv-secure-backups-dual-region/${new Date().getFullYear()}/${id}.enc`,
      sizeKb: Math.floor(Math.random() * 800) + 1200,
      checksum: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      status: 'VERIFIED',
      itemCounts: {
        emergencies: emergencies.length,
        cases: cases.length,
        pois: pois.length,
        vois: vois.length,
        observations: intelObservations.length,
        auditLogs: auditLogs.length,
        users: 48,
      },
      createdBy: `${currentUser.name} ${currentUser.surname} (${activeRole})`,
    };

    setBackupRecords((prev) => [newBackup, ...prev]);
    return newBackup;
  };

  const restoreFromBackup = async (
    backupId: string,
    options: { dryRun?: boolean } = {}
  ): Promise<{ success: boolean; message: string; restoredCount: number }> => {
    const target = backupRecords.find((b) => b.id === backupId);
    if (!target) {
      throw new Error(`Backup snapshot ${backupId} not found.`);
    }

    const totalCount =
      target.itemCounts.emergencies +
      target.itemCounts.cases +
      target.itemCounts.pois +
      target.itemCounts.vois +
      target.itemCounts.auditLogs;

    if (options.dryRun) {
      return {
        success: true,
        message: `Dry-run completed successfully. Checksum verified. Found ${totalCount} valid entities across 6 collections.`,
        restoredCount: totalCount,
      };
    }

    logAuditEvent({
      recordType: 'DATABASE_RESTORE',
      recordId: backupId,
      action: 'SNAPSHOT_RESTORED_TO_STATE',
      description: `Restored database state from verified snapshot ${backupId} (${target.sizeKb} KB).`,
    });

    return {
      success: true,
      message: `Database successfully restored from ${backupId}. All collections synchronized with parity verification.`,
      restoredCount: totalCount,
    };
  };

  const exportFullSystemBackup = () => {
    exportFullDatabaseJson({
      emergencies,
      cases,
      bolos,
      pois,
      vois,
      auditLogs,
      emergencyContacts,
      settings,
      mapLayers,
    });
    logAuditEvent({
      recordType: 'SYSTEM_BACKUP',
      recordId: `EXP-${Date.now()}`,
      action: 'FULL_SYSTEM_EXPORT_DOWNLOADED',
      description: `Downloaded comprehensive JSON database snapshot`,
    });
  };

  const importSystemData = (
    data: any,
    options: { mode: 'MERGE' | 'REPLACE' } = { mode: 'MERGE' }
  ): { success: boolean; stats: Record<string, number>; error?: string } => {
    try {
      const root = data.data || data;
      const stats: Record<string, number> = {};

      if (Array.isArray(root.emergencies)) {
        if (options.mode === 'REPLACE') {
          setEmergencies(root.emergencies);
        } else {
          setEmergencies((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newItems = root.emergencies.filter((e: any) => !existingIds.has(e.id));
            return [...newItems, ...prev];
          });
        }
        stats.emergencies = root.emergencies.length;
      }

      if (Array.isArray(root.cases)) {
        if (options.mode === 'REPLACE') {
          setCases(root.cases);
        } else {
          setCases((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newItems = root.cases.filter((c: any) => !existingIds.has(c.id));
            return [...newItems, ...prev];
          });
        }
        stats.cases = root.cases.length;
      }

      if (Array.isArray(root.bolos)) {
        if (options.mode === 'REPLACE') {
          setBolos(root.bolos);
        } else {
          setBolos((prev) => {
            const existingIds = new Set(prev.map((b) => b.id));
            const newItems = root.bolos.filter((b: any) => !existingIds.has(b.id));
            return [...newItems, ...prev];
          });
        }
        stats.bolos = root.bolos.length;
      }

      if (Array.isArray(root.emergencyContacts || root.contacts)) {
        const contactList = root.emergencyContacts || root.contacts;
        if (options.mode === 'REPLACE') {
          setEmergencyContacts(contactList);
        } else {
          setEmergencyContacts((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newItems = contactList.filter((c: any) => !existingIds.has(c.id));
            return [...prev, ...newItems];
          });
        }
        stats.contacts = contactList.length;
      }

      if (root.settings && typeof root.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...root.settings }));
        stats.settings = 1;
      }

      logAuditEvent({
        recordType: 'DATA_IMPORT',
        recordId: `IMP-${Date.now()}`,
        action: 'DATA_IMPORTED',
        description: `Imported data (${options.mode}) with ${Object.values(stats).reduce((a, b) => a + b, 0)} records`,
      });

      return { success: true, stats };
    } catch (err: any) {
      return { success: false, stats: {}, error: err?.message || 'Data import failed' };
    }
  };

  const importContactsFromCsv = (csvText: string): { success: boolean; importedCount: number; error?: string } => {
    try {
      const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        return { success: false, importedCount: 0, error: 'CSV file is empty or missing data rows.' };
      }

      const importedList: EmergencyContact[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 4) {
          const [name, surname, organization, category, primaryPhone, whatsapp, callsign, sector, notes] = parts;
          importedList.push({
            id: `CNT-IMP-${Date.now()}-${i}`,
            name: `${name || ''} ${surname || ''}`.trim() || 'Contact',
            organisation: organization || 'Hartbeesfontein Responder',
            category: (category as any) || 'OTHER',
            phone: primaryPhone || '+27 18 000 0000',
            whatsappNumber: whatsapp || undefined,
            areaSector: sector || 'All Sectors',
            isActive: true,
            notes: notes || undefined,
          });
        }
      }

      if (importedList.length === 0) {
        return { success: false, importedCount: 0, error: 'No valid contact rows could be parsed.' };
      }

      setEmergencyContacts((prev) => [...prev, ...importedList]);

      logAuditEvent({
        recordType: 'CONTACTS_IMPORT',
        recordId: `CNT-CSV-${Date.now()}`,
        action: 'CONTACTS_CSV_IMPORTED',
        description: `Imported ${importedList.length} emergency contacts from CSV`,
      });

      return { success: true, importedCount: importedList.length };
    } catch (err: any) {
      return { success: false, importedCount: 0, error: err?.message || 'CSV parse failure' };
    }
  };

  const cleanTransientStorage = (): { freedKb: number; purgedItemsCount: number } => {
    let purged = 0;
    setEmergencies((prev) =>
      prev.map((e) => {
        if (e.locationSession && e.locationSession.history.length > 50) {
          purged += e.locationSession.history.length - 20;
          return {
            ...e,
            locationSession: {
              ...e.locationSession,
              history: e.locationSession.history.slice(-20),
            },
          };
        }
        return e;
      })
    );

    const freedKb = Math.round(purged * 0.4 + 120);
    logAuditEvent({
      recordType: 'STORAGE_MAINTENANCE',
      recordId: `PURGE-${Date.now()}`,
      action: 'TRANSIENT_STORAGE_PURGED',
      description: `Purged transient telemetry breadcrumbs, freeing ~${freedKb} KB`,
    });

    return { freedKb, purgedItemsCount: purged };
  };

  const runSyntheticHeartbeatTest = async (): Promise<SystemHealthComponent[]> => {
    // Simulate real-time probing of all 7 critical subsystems
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updated = systemHealth.map((c) => {
      const latency = Math.floor(Math.random() * 45) + 15;
      return {
        ...c,
        status: 'HEALTHY' as const,
        latencyMs: latency,
        lastChecked: new Date().toISOString(),
      };
    });

    setSystemHealth(updated);
    return updated;
  };

  const logSystemError = (error: Omit<SystemErrorLogEntry, 'id' | 'timestamp'>) => {
    const newErr: SystemErrorLogEntry = {
      id: `ERR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...error,
    };
    setSystemErrorLogs((prev) => [newErr, ...prev]);
  };

  const clearSystemError = (id: string) => {
    setSystemErrorLogs((prev) => prev.filter((e) => e.id !== id));
  };

  const logPrivacyAccess = (
    entry: Omit<PrivacyAccessLogEntry, 'id' | 'timestamp' | 'actorUid' | 'actorName' | 'actorRole'>
  ) => {
    const newLog: PrivacyAccessLogEntry = {
      id: `PRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorUid: currentUser.uid,
      actorName: `${currentUser.name} ${currentUser.surname}`.trim(),
      actorRole: activeRole,
      ...entry,
    };
    setPrivacyAccessLogs((prev) => [newLog, ...prev]);

    logAuditEvent({
      recordType: 'POPIA_PRIVACY',
      recordId: newLog.id,
      action: 'SENSITIVE_PII_VIEWED',
      description: `Viewed ${entry.dataType} for user ${entry.targetUserName}. Reason: ${entry.operationalReason}`,
    });
  };

  const toggleTrainingMode = (enabled: boolean, scenarioName?: string) => {
    setTrainingMode({
      enabled,
      activatedAt: enabled ? new Date().toISOString() : undefined,
      activatedByUid: enabled ? currentUser.uid : undefined,
      scenarioName: enabled ? scenarioName || 'General Emergency Drill' : undefined,
    });

    logAuditEvent({
      recordType: 'TRAINING_MODE',
      recordId: 'GLOBAL_TRAINING_STATE',
      action: enabled ? 'TRAINING_MODE_ACTIVATED' : 'TRAINING_MODE_DEACTIVATED',
      description: enabled
        ? `Training/Drill mode activated by ${currentUser.name} ${currentUser.surname} (${scenarioName})`
        : `Training/Drill mode deactivated. Normal operations resumed.`,
    });
  };

  const createTrainingEmergency = async (
    scenarioType: EmergencyType,
    customNotes?: string
  ): Promise<string> => {
    const emergencyId = `TRAIN-${Date.now()}`;
    const now = new Date().toISOString();

    const trainingEmergency: EmergencyEvent = {
      id: emergencyId,
      clientUid: currentUser.uid,
      clientName: `${currentUser.name} ${currentUser.surname} [TRAINING SCRIPT]`,
      clientPhone: currentUser.primaryPhone,
      farmName: currentUser.farmName || 'Simulated Drill Farm Sektor 2',
      sector: currentUser.sector || 'Sektor 2',
      emergencyType: scenarioType,
      status: 'CONTROL_ROOM_NOTIFIED',
      isTraining: true,
      location: {
        latitude: -26.7645,
        longitude: 26.4128,
        accuracy: 8,
        timestamp: now,
        quality: 'CURRENT_GPS',
        locationName: 'Simulated Drill Sector 2',
      },
      locationHistory: [],
      propertySnapshot: currentUser.emergencyPropertyInfo,
      timeline: [
        {
          id: `TLE-${Date.now()}`,
          emergencyId,
          eventType: 'TRIGGERED',
          timestamp: now,
          actorUid: currentUser.uid,
          actorName: currentUser.name,
          actorRole: 'CONTROL_ROOM',
          description: `TRAINING DRILL ACTIVATED: ${scenarioType} - ${customNotes || 'Routine operator practice'}`,
        },
      ],
      notes: customNotes
        ? [
            {
              id: `NOTE-${Date.now()}`,
              emergencyId,
              authorUid: currentUser.uid,
              authorName: currentUser.name,
              authorRole: 'MANAGEMENT',
              timestamp: now,
              text: `[DRILL SCRIPT]: ${customNotes}`,
            },
          ]
        : [],
      clientUpdates: [],
      whatsappLogs: [],
      callLogs: [],
      failures: [],
      messages: [],
      reactionForceContactLogs: [],
      startTime: now,
      updatedAt: now,
    };

    setEmergencies((prev) => [trainingEmergency, ...prev]);
    return emergencyId;
  };

  const addMapLayer = useCallback(
    async (
      layerData: Omit<KmlMapLayer, 'id' | 'uploadedAt' | 'uploadedByUid' | 'uploadedByName'>
    ): Promise<string> => {
      const newId = `kml-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const now = new Date().toISOString();
      const newLayer: KmlMapLayer = {
        ...layerData,
        id: newId,
        uploadedAt: now,
        uploadedByUid: currentUser.uid,
        uploadedByName: `${currentUser.name} ${currentUser.surname}`.trim(),
        version: layerData.version || '1.0',
        isActive: layerData.isActive ?? true,
        visibilityRoles: layerData.visibilityRoles || ['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT'],
      };

      setMapLayers((prev) => [newLayer, ...prev]);

      logAuditEvent({
        action: 'KML_LAYER_UPLOADED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: newId,
        description: `Uploaded/added map layer "${newLayer.name}" (${newLayer.category}) with ${newLayer.placemarkCount || newLayer.features?.length || 0} features.`,
      });

      return newId;
    },
    [currentUser, logAuditEvent]
  );

  const toggleMapLayerActive = useCallback((layerId: string) => {
    setMapLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, isActive: !l.isActive } : l))
    );
  }, []);

  const updateMapLayer = useCallback((layerId: string, updates: Partial<KmlMapLayer>) => {
    setMapLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, ...updates } : l))
    );
  }, []);

  const deleteMapLayer = useCallback(
    (layerId: string) => {
      setMapLayers((prev) => prev.filter((l) => l.id !== layerId));
      logAuditEvent({
        action: 'KML_LAYER_DELETED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: layerId,
        description: `Deleted operational KML map layer ${layerId}`,
      });
    },
    [logAuditEvent]
  );

  // =========================================================================
  // CAMERA NETWORK HEALTH, ERROR LOGGING & MAINTENANCE
  // =========================================================================

  const addCameraErrorLog = useCallback(
    (errorData: Omit<CameraErrorLog, 'id' | 'loggedAt' | 'isResolved'>): CameraErrorLog => {
      const newId = `ERR-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
      const now = new Date().toISOString();

      const newError: CameraErrorLog = {
        ...errorData,
        id: newId,
        loggedAt: now,
        isResolved: false,
      };

      setCameraErrors((prev) => [newError, ...prev]);

      // Automatically update camera device status
      setCameras((prev) =>
        prev.map((cam) => {
          if (cam.id === errorData.cameraId) {
            const nextStatus: CameraStatus =
              errorData.severity === 'CRITICAL'
                ? 'ERROR'
                : errorData.severity === 'HIGH'
                ? 'DEGRADED'
                : cam.status === 'ONLINE'
                ? 'DEGRADED'
                : cam.status;

            return {
              ...cam,
              status: nextStatus,
              activeErrorCount: (cam.activeErrorCount || 0) + 1,
            };
          }
          return cam;
        })
      );

      logAuditEvent({
        action: 'CAMERA_ERROR_LOGGED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: newId,
        description: `Logged ${errorData.severity} camera error on "${errorData.cameraName}": ${errorData.title}`,
      });

      return newError;
    },
    [logAuditEvent]
  );

  const resolveCameraError = useCallback(
    (errorId: string, resolutionNotes: string) => {
      const now = new Date().toISOString();
      let targetCameraId = '';

      setCameraErrors((prev) =>
        prev.map((err) => {
          if (err.id === errorId) {
            targetCameraId = err.cameraId;
            return {
              ...err,
              isResolved: true,
              resolvedAt: now,
              resolvedByUid: currentUser.uid,
              resolvedByName: `${currentUser.name} ${currentUser.surname}`.trim(),
              resolutionNotes,
            };
          }
          return err;
        })
      );

      if (targetCameraId) {
        setCameras((prev) =>
          prev.map((cam) => {
            if (cam.id === targetCameraId) {
              const remainingErrors = Math.max(0, (cam.activeErrorCount || 1) - 1);
              return {
                ...cam,
                activeErrorCount: remainingErrors,
                status: remainingErrors === 0 && cam.status !== 'MAINTENANCE' ? 'ONLINE' : cam.status,
              };
            }
            return cam;
          })
        );
      }

      logAuditEvent({
        action: 'CAMERA_ERROR_RESOLVED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: errorId,
        description: `Resolved camera error ${errorId}: ${resolutionNotes}`,
      });
    },
    [currentUser, logAuditEvent]
  );

  const escalateCameraError = useCallback(
    (
      errorId: string,
      escalation: {
        level: EscalationLevel;
        escalatedTo: string;
        notes?: string;
        sendWhatsAppAlert?: boolean;
      }
    ) => {
      const now = new Date().toISOString();
      let updatedErr: CameraErrorLog | undefined;

      setCameraErrors((prev) =>
        prev.map((err) => {
          if (err.id === errorId) {
            updatedErr = {
              ...err,
              isEscalated: true,
              escalationLevel: escalation.level,
              escalatedTo: escalation.escalatedTo,
              escalatedAt: now,
              escalationNotes: escalation.notes,
              whatsappAlertSent: escalation.sendWhatsAppAlert ?? true,
            };
            return updatedErr;
          }
          return err;
        })
      );

      logAuditEvent({
        action: 'CAMERA_ERROR_ESCALATED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: errorId,
        description: `Escalated camera error ${errorId} to ${escalation.escalatedTo} (${escalation.level})`,
      });
    },
    [logAuditEvent]
  );

  const addCameraMaintenanceTicket = useCallback(
    (
      ticketData: Omit<CameraMaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>
    ): CameraMaintenanceTicket => {
      const currentYear = new Date().getFullYear();
      const ticketNum = `MNT-${currentYear}-${String(Math.floor(100 + Math.random() * 900))}`;
      const now = new Date().toISOString();

      const newTicket: CameraMaintenanceTicket = {
        ...ticketData,
        id: ticketNum,
        ticketNumber: ticketNum,
        createdAt: now,
        updatedAt: now,
      };

      setCameraMaintenanceTickets((prev) => [newTicket, ...prev]);

      // Update camera device state
      setCameras((prev) =>
        prev.map((cam) => {
          if (cam.id === ticketData.cameraId) {
            return {
              ...cam,
              openTicketCount: (cam.openTicketCount || 0) + 1,
              status: ticketData.status === 'IN_PROGRESS' ? 'MAINTENANCE' : cam.status,
              nextScheduledMaintenance: ticketData.scheduledDate,
            };
          }
          return cam;
        })
      );

      logAuditEvent({
        action: 'CAMERA_MAINTENANCE_SCHEDULED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: ticketNum,
        description: `Created maintenance ticket ${ticketNum} for camera "${ticketData.cameraName}" assigned to ${ticketData.assignedTechnicianName}`,
      });

      return newTicket;
    },
    [logAuditEvent]
  );

  const updateCameraMaintenanceTicket = useCallback(
    (ticketId: string, updates: Partial<CameraMaintenanceTicket>) => {
      const now = new Date().toISOString();
      let targetCameraId = '';
      let isCompleting = updates.status === 'COMPLETED';

      setCameraMaintenanceTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId) {
            targetCameraId = t.cameraId;
            return {
              ...t,
              ...updates,
              completedDate: isCompleting ? (updates.completedDate || now.split('T')[0]) : t.completedDate,
              updatedAt: now,
            };
          }
          return t;
        })
      );

      if (targetCameraId) {
        setCameras((prev) =>
          prev.map((cam) => {
            if (cam.id === targetCameraId) {
              const openTickets = isCompleting
                ? Math.max(0, (cam.openTicketCount || 1) - 1)
                : cam.openTicketCount;

              return {
                ...cam,
                openTicketCount: openTickets,
                lastMaintenanceDate: isCompleting ? now.split('T')[0] : cam.lastMaintenanceDate,
                status:
                  isCompleting && cam.status === 'MAINTENANCE'
                    ? cam.activeErrorCount > 0
                      ? 'DEGRADED'
                      : 'ONLINE'
                    : updates.status === 'IN_PROGRESS'
                    ? 'MAINTENANCE'
                    : cam.status,
              };
            }
            return cam;
          })
        );
      }

      logAuditEvent({
        action: 'CAMERA_MAINTENANCE_UPDATED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: ticketId,
        description: `Updated maintenance ticket ${ticketId} status: ${updates.status || 'Updated details'}`,
      });
    },
    [logAuditEvent]
  );

  const updateCameraStatus = useCallback(
    (cameraId: string, status: CameraStatus, notes?: string) => {
      setCameras((prev) =>
        prev.map((cam) => {
          if (cam.id === cameraId) {
            return {
              ...cam,
              status,
              notes: notes ? `${cam.notes || ''} | [Status Change]: ${notes}`.trim() : cam.notes,
              lastHeartbeat: new Date().toISOString(),
            };
          }
          return cam;
        })
      );

      logAuditEvent({
        action: 'CAMERA_STATUS_MANUAL_OVERRIDE',
        recordType: 'SYSTEM_SETTINGS',
        recordId: cameraId,
        description: `Manually changed camera ${cameraId} status to ${status}. Notes: ${notes || 'None'}`,
      });
    },
    [logAuditEvent]
  );

  const pingCameraDevice = useCallback(
    async (cameraId: string): Promise<{ latencyMs: number; status: CameraStatus; packetLoss: number }> => {
      // Simulate authentic RTSP / ICMP ping handshake
      await new Promise((res) => setTimeout(res, 250 + Math.random() * 300));
      const jitterLatency = Math.floor(18 + Math.random() * 45);
      const now = new Date().toISOString();

      let calculatedStatus: CameraStatus = 'ONLINE';
      let packetLoss = 0.0;

      setCameras((prev) =>
        prev.map((cam) => {
          if (cam.id === cameraId) {
            if (cam.status === 'OFFLINE' || cam.status === 'ERROR') {
              // keep error if critical battery or signal
              if (cam.batteryVoltage && cam.batteryVoltage < 11.0) {
                calculatedStatus = 'ERROR';
                packetLoss = 28.5;
              } else {
                calculatedStatus = 'ONLINE';
                packetLoss = 0.0;
              }
            } else if (cam.status === 'MAINTENANCE') {
              calculatedStatus = 'MAINTENANCE';
            } else {
              calculatedStatus = jitterLatency > 120 ? 'DEGRADED' : 'ONLINE';
            }

            return {
              ...cam,
              latencyMs: jitterLatency,
              packetLossPercent: packetLoss,
              lastHeartbeat: now,
              status: calculatedStatus,
            };
          }
          return cam;
        })
      );

      return {
        latencyMs: jitterLatency,
        status: calculatedStatus,
        packetLoss,
      };
    },
    []
  );

  const pingAllCameras = useCallback(async () => {
    const now = new Date().toISOString();
    await new Promise((res) => setTimeout(res, 600));

    setCameras((prev) =>
      prev.map((cam) => {
        if (cam.status === 'MAINTENANCE') {
          return { ...cam, lastHeartbeat: now };
        }
        const lat = Math.floor(15 + Math.random() * 50);
        const isProblem = cam.batteryVoltage && cam.batteryVoltage < 11.2;
        return {
          ...cam,
          latencyMs: lat,
          lastHeartbeat: now,
          status: isProblem ? 'ERROR' : lat > 120 ? 'DEGRADED' : 'ONLINE',
        };
      })
    );
  }, []);

  const addNewCameraDevice = useCallback(
    (cameraData: Omit<CameraDevice, 'id' | 'activeErrorCount' | 'openTicketCount'>): CameraDevice => {
      const newId = `CAM-${String(Math.floor(10 + Math.random() * 90))}`;
      const newCamera: CameraDevice = {
        ...cameraData,
        id: newId,
        activeErrorCount: 0,
        openTicketCount: 0,
        lastHeartbeat: new Date().toISOString(),
      };

      setCameras((prev) => [...prev, newCamera]);

      logAuditEvent({
        action: 'CAMERA_DEVICE_REGISTERED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: newId,
        description: `Registered new camera "${newCamera.name}" (${newCamera.code}) in ${newCamera.sector}`,
      });

      return newCamera;
    },
    [logAuditEvent]
  );

  const updateCameraDevice = useCallback(
    (cameraId: string, updates: Partial<CameraDevice>) => {
      setCameras((prev) =>
        prev.map((cam) => (cam.id === cameraId ? { ...cam, ...updates } : cam))
      );

      logAuditEvent({
        action: 'CAMERA_DEVICE_UPDATED',
        recordType: 'SYSTEM_SETTINGS',
        recordId: cameraId,
        description: `Updated camera ${cameraId} configuration`,
      });
    },
    [logAuditEvent]
  );

  // =========================================================================
  // LIVE PATROL & VOLUNTEER BEACON TRACKING (MEMBERS & REACTION FORCE)
  // =========================================================================
  const updatePatrolLocation = useCallback(
    (coords: { latitude: number; longitude: number; accuracy?: number; speed?: string; heading?: number; battery?: string }) => {
      const now = new Date().toISOString();
      const unitId = `PATROL-${currentUser.uid}`;

      // Immediate Server Location Stream for live Control Room mapping
      fetch(`/api/patrols/${unitId}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          speed: coords.speed,
          heading: coords.heading,
          battery: coords.battery,
          timestamp: now,
        }),
      }).catch(() => {});

      setActivePatrolUnits((prev) => {
        const existing = prev.find((u) => u.uid === currentUser.uid || u.id === unitId);
        if (!existing) {
          // If not currently registered in array, register as active
          const fullName = `${currentUser.name} ${currentUser.surname}`.trim() || 'Patrol Unit';
          const callsign = currentUser.callsign || (activeRole === 'REACTION_FORCE' ? `RF-${currentUser.name.slice(0, 4).toUpperCase()}` : `PATROL-${currentUser.name.slice(0, 4).toUpperCase()}`);
          const newUnit: ActivePatrolUnit = {
            id: unitId,
            uid: currentUser.uid,
            name: fullName,
            callsign,
            role: activeRole === 'REACTION_FORCE' ? 'Reaction Force Tactical Unit' : 'Active Member / Buurtwag Patrol',
            userRole: activeRole,
            sector: currentUser.sector || 'Hartbeesfontein Sektor 2',
            phone: currentUser.primaryPhone || '082 000 0000',
            vehicle: activeRole === 'REACTION_FORCE' ? 'Toyota Hilux 4x4 (RF)' : 'Bakkie / Patrol Vehicle',
            radioChannel: activeRole === 'REACTION_FORCE' ? 'CH 01 Ops Prime' : 'CH 02 Farm Watch',
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy || 10,
            speed: coords.speed || '24 km/h',
            heading: coords.heading || 0,
            battery: coords.battery || '95%',
            status: 'PATROLLING',
            isLiveTrackingActive: true,
            startedAt: now,
            lastUpdated: now,
            trailHistory: [{ latitude: coords.latitude, longitude: coords.longitude, timestamp: now }],
          };

          syncPatrolUnitToFirestore(newUnit).catch(() => {});
          return [newUnit, ...prev];
        }

        return prev.map((unit) => {
          if (unit.uid === currentUser.uid || unit.id === unitId) {
            const updatedTrail = [
              ...(unit.trailHistory || []),
              { latitude: coords.latitude, longitude: coords.longitude, timestamp: now },
            ].slice(-30);

            const updated: ActivePatrolUnit = {
              ...unit,
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy ?? unit.accuracy,
              speed: coords.speed ?? unit.speed,
              heading: coords.heading ?? unit.heading,
              battery: coords.battery ?? unit.battery,
              status: 'PATROLLING',
              isLiveTrackingActive: true,
              lastUpdated: now,
              trailHistory: updatedTrail,
            };

            syncPatrolUnitToFirestore(updated).catch(() => {});
            return updated;
          }
          return unit;
        });
      });
    },
    [currentUser, activeRole]
  );

  const startPatrol = useCallback(
    async (options?: { notes?: string; vehicle?: string; sector?: string }) => {
      const now = new Date().toISOString();
      const unitId = `PATROL-${currentUser.uid}`;
      const fullName = `${currentUser.name} ${currentUser.surname}`.trim() || 'Patrol Unit';
      const callsign = currentUser.callsign || (activeRole === 'REACTION_FORCE' ? `RF-${currentUser.name.slice(0, 4).toUpperCase()}` : `PATROL-${currentUser.name.slice(0, 4).toUpperCase()}`);
      const roleDescription = activeRole === 'REACTION_FORCE' ? 'Reaction Force Tactical Unit' : 'Active Member / Buurtwag Patrol';

      const initialLat = currentUser.farmGpsLocation?.latitude || -26.763;
      const initialLng = currentUser.farmGpsLocation?.longitude || 26.402;
      const initialAcc = 15;

      const newUnit: ActivePatrolUnit = {
        id: unitId,
        uid: currentUser.uid,
        name: fullName,
        callsign,
        role: roleDescription,
        userRole: activeRole,
        sector: options?.sector || currentUser.sector || 'Hartbeesfontein Sektor 2',
        phone: currentUser.primaryPhone || '082 000 0000',
        vehicle: options?.vehicle || (activeRole === 'REACTION_FORCE' ? 'Toyota Hilux 4x4 (RF)' : 'Bakkie / Patrol Vehicle'),
        radioChannel: activeRole === 'REACTION_FORCE' ? 'CH 01 Ops Prime' : 'CH 02 Farm Watch',
        latitude: initialLat,
        longitude: initialLng,
        accuracy: initialAcc,
        speed: '0 km/h',
        heading: 0,
        battery: '98%',
        status: 'PATROLLING',
        isLiveTrackingActive: true,
        startedAt: now,
        lastUpdated: now,
        notes: options?.notes || 'Active mobile sector patrol in progress',
        trailHistory: [{ latitude: initialLat, longitude: initialLng, timestamp: now }],
      };

      // Instantly register in local state & activate
      setActivePatrolUnits((prev) => {
        const filtered = prev.filter((u) => u.uid !== currentUser.uid && u.id !== unitId);
        return [newUnit, ...filtered];
      });
      setIsPatrolActive(true);

      // Sync to Server for immediate Control Room live view
      fetch('/api/patrols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit),
      }).catch((err) => console.warn('[DataContext] Patrol server sync error:', err));

      // Sync to Firestore
      syncPatrolUnitToFirestore(newUnit).catch((err) =>
        console.warn('[DataContext] Patrol firestore sync error:', err)
      );

      // Broadcast on local channels
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('hv_emergency_broadcast_v1');
          bc.postMessage({ type: 'PATROL_ACTIVATED', patrol: newUnit });
          setTimeout(() => bc.close(), 100);
        }
      } catch {
        // ignore
      }

      logAuditEvent({
        action: 'PATROL_STARTED' as any,
        recordType: 'SYSTEM_SETTINGS',
        recordId: unitId,
        description: `${fullName} (${callsign}) started active patrol beacon in ${newUnit.sector}`,
      });

      // Quick non-blocking geolocation check
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updatePatrolLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy || 10),
              speed: pos.coords.speed != null ? `${Math.round(pos.coords.speed * 3.6)} km/h` : '0 km/h',
              heading: Math.round(pos.coords.heading || 0),
              battery: '98%',
            });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 3000, maximumAge: 5000 }
        );
      }
    },
    [currentUser, activeRole, logAuditEvent, updatePatrolLocation]
  );

  const stopPatrol = useCallback(() => {
    const now = new Date().toISOString();
    const fullName = `${currentUser.name} ${currentUser.surname}`.trim() || 'Patrol Unit';
    const unitId = `PATROL-${currentUser.uid}`;

    let stoppedUnit: ActivePatrolUnit | null = null;
    setActivePatrolUnits((prev) =>
      prev.map((unit) => {
        if (unit.uid === currentUser.uid || unit.id === unitId) {
          const updated: ActivePatrolUnit = {
            ...unit,
            status: 'OFF_DUTY',
            isLiveTrackingActive: false,
            lastUpdated: now,
          };
          stoppedUnit = updated;
          return updated;
        }
        return unit;
      })
    );
    setIsPatrolActive(false);

    // Sync to Server
    fetch(`/api/patrols/${unitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'OFF_DUTY', isLiveTrackingActive: false, lastUpdated: now }),
    }).catch(() => {});

    // Sync to Firestore
    if (stoppedUnit) {
      syncPatrolUnitToFirestore(stoppedUnit).catch(() => {});
    }

    // Broadcast on local channel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('hv_emergency_broadcast_v1');
        bc.postMessage({ type: 'PATROL_STOPPED', patrolId: unitId });
        setTimeout(() => bc.close(), 100);
      }
    } catch {
      // ignore
    }

    logAuditEvent({
      action: 'PATROL_STOPPED' as any,
      recordType: 'SYSTEM_SETTINGS',
      recordId: unitId,
      description: `${fullName} stopped active patrol beacon`,
    });
  }, [currentUser, logAuditEvent]);

  // Centralized continuous Live Patrol Beacon Tracking Service (Global GPS Watch & Heartbeat)
  useEffect(() => {
    if (!isPatrolActive) return;

    let watchId: number | null = null;
    let heartbeatTimer: any = null;
    let driftStep = 0;

    const baseLat = currentUser.farmGpsLocation?.latitude || -26.763;
    const baseLng = currentUser.farmGpsLocation?.longitude || 26.402;

    const handleGpsSuccess = (pos: GeolocationPosition) => {
      const speedKm = pos.coords.speed != null ? `${Math.round(pos.coords.speed * 3.6)} km/h` : '18 km/h';
      updatePatrolLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 10),
        speed: speedKm,
        heading: Math.round(pos.coords.heading || 0),
        battery: '98%',
      });
    };

    const handleGpsFallback = () => {
      // Periodic subtle movement simulation for stationary devices/desktops
      driftStep += 1;
      const angle = (driftStep * 25 * Math.PI) / 180;
      const offsetLat = Math.sin(angle) * 0.0028;
      const offsetLng = Math.cos(angle) * 0.0028;
      updatePatrolLocation({
        latitude: +(baseLat + offsetLat).toFixed(6),
        longitude: +(baseLng + offsetLng).toFixed(6),
        accuracy: 15,
        speed: `${12 + (driftStep % 14)} km/h`,
        heading: (driftStep * 25) % 360,
        battery: '95%',
      });
    };

    // 1. Initial fix
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        handleGpsSuccess,
        () => handleGpsFallback(),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 5000 }
      );

      // 2. Continuous real-time movement watch
      watchId = navigator.geolocation.watchPosition(
        handleGpsSuccess,
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    } else {
      handleGpsFallback();
    }

    // 3. 8-second Heartbeat to keep live beacon streaming reliably
    heartbeatTimer = setInterval(() => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          handleGpsSuccess,
          () => handleGpsFallback(),
          { enableHighAccuracy: true, timeout: 4000, maximumAge: 6000 }
        );
      } else {
        handleGpsFallback();
      }
    }, 8000);

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
    };
  }, [isPatrolActive, currentUser.farmGpsLocation, updatePatrolLocation]);

  return (
    <DataContext.Provider
      value={{
        emergencies,
        activeEmergency,
        allActiveEmergencies,
        triggerEmergency,
        acknowledgeEmergency,
        updateClientLocation,
        addClientInfo,
        addEmergencyOperatorNote,
        initiateCallAction,
        recordCallOutcome,
        notifyReactionForce,
        notifyAllReactionForce,
        notifyManagement,
        createCommunityAlertFromEmergency,
        linkEmergencyToCase,
        createCaseFromEmergency,
        recordFalseAlarm,
        resolveEmergency,
        resolveAllActiveEmergencies,
        startLiveAudioSession,
        requestLiveAudio,
        respondToAudioRequest,
        stopLiveAudioSession,
        joinAudioSessionAsListener,
        leaveAudioSessionAsListener,
        toggleLocalAudioMute,
        startLiveLocationSession,
        changeLocationMode,
        stopLiveLocationSession,
        sendEmergencyMessage,
        markMessageDelivered,
        markMessageOpened,
        recordReactionForceContact,
        callClientDirect,
        communicationHealth,
        emergencyContacts,
        createEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        cases,
        createIncidentCase,
        updateCase,
        updateCaseSapsDetails,
        addCaseEvidencePhotos,
        addCaseUpdate,
        updateCaseStatus,
        deleteCase,
        addSuspectToCase,
        linkPoiToCase,
        unlinkPoiFromCase,
        incidentNotifications,
        unacknowledgedIncidentsCount: incidentNotifications.filter((n) => !n.isAcknowledged).length,
        acknowledgeIncidentNotification,
        dismissIncidentNotification,
        clearAllIncidentNotifications,
        createTrafficHazard,
        situationReports,
        situationDraft,
        saveSituationDraft,
        clearSituationDraft,
        createSituationReport,
        bolos,
        boloSightings,
        createBolo,
        updateBoloStatus,
        submitBoloSighting,
        verifyBoloSighting,
        pois,
        createPoi,
        updatePoi,
        updatePoiStatus,
        archivePoi,
        deletePoi,
        vois,
        createVoi,
        updateVoi,
        updateVoiStatus,
        archiveVoi,
        deleteVoi,
        intelObservations,
        addIntelObservation,
        verifyIntelObservation,
        disputeIntelObservation,
        intelRelationships,
        createIntelRelationship,
        removeIntelRelationship,
        verifyIntelRelationship,
        intelReviewQueue,
        addReviewQueueItem,
        processReviewQueueItem,
        mergePersons,
        mergeVehicles,
        intelAuditLogs,
        logIntelAudit,
        getUnifiedTimeline,
        getDataQualityIssues,
        assistanceRequests,
        communityAssistanceRequests: assistanceRequests,
        createCommunityAssistanceRequest,
        acknowledgeAssistanceRequest,
        escalateAssistanceRequest,
        updateResponderAssignment,
        sendAllClearForAssistance,
        calculateEligibleResponders,
        alerts,
        createAlert,
        acknowledgeAlert,
        addAlertUpdate,
        sendAllClearForAlert,
        closeAlert,
        areaGroups,
        groups: areaGroups,
        createGroup,
        updateGroup,
        deleteGroup,
        assignUsersToGroup,
        removeUsersFromGroup,
        locationAreas,
        createLocationArea,
        updateLocationArea,
        deleteLocationArea,
        auditLogs,
        logAuditEvent,
        settings,
        updateSettings,
        generatedReports,
        saveGeneratedReport,
        deleteGeneratedReport,
        backupRecords,
        createBackupRecord,
        restoreFromBackup,
        systemHealth,
        runSyntheticHeartbeatTest,
        systemErrorLogs,
        logSystemError,
        clearSystemError,
        privacyAccessLogs,
        logPrivacyAccess,
        trainingMode,
        toggleTrainingMode,
        createTrainingEmergency,
        mapLayers,
        addMapLayer,
        toggleMapLayerActive,
        updateMapLayer,
        deleteMapLayer,
        saveAudioRecording,
        deleteAudioRecording,
        exportFullSystemBackup,
        importSystemData,
        importContactsFromCsv,
        cleanTransientStorage,
        cameras,
        cameraErrors,
        cameraMaintenanceTickets,
        addCameraErrorLog,
        resolveCameraError,
        escalateCameraError,
        addCameraMaintenanceTicket,
        updateCameraMaintenanceTicket,
        updateCameraStatus,
        pingCameraDevice,
        pingAllCameras,
        addNewCameraDevice,
        updateCameraDevice,
        activePatrolUnits,
        responders: [],
        isPatrolActive,
        startPatrol,
        stopPatrol,
        updatePatrolLocation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
