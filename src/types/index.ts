export type UserRole = 'CLIENT' | 'CONTROL_ROOM' | 'REACTION_FORCE' | 'MANAGEMENT' | 'MAINTENANCE_CREW';

export type OperationalRoleType =
  | 'REACTION_FORCE'
  | 'REACTION_FORCE_COMMANDER'
  | 'FIRETRUCK_DRIVER'
  | 'FIRE_RESPONDER'
  | 'PATROL_OFFICER'
  | 'SECTOR_LEADER'
  | 'MANAGEMENT_EXECUTIVE'
  | 'CONTROL_ROOM_OPERATOR'
  | 'MEDICAL_FIRST_RESPONDER'
  | 'FARM_WATCH_MEMBER'
  | 'MAINTENANCE_TECH'
  | 'CUSTOM';

export interface CustomRoleDefinition {
  id: string;
  name: string;
  code: string;
  category: 'REACTION' | 'FIRE' | 'MANAGEMENT' | 'OPERATIONS' | 'MEDICAL' | 'COMMUNITY';
  description: string;
  colorHex?: string;
  isSystemRole?: boolean;
  createdAt: string;
}

export type LanguageCode = 'en' | 'af';

// User Profile Models
export interface FamilyMember {
  id: string;
  name: string;
  surname: string;
  relationship: string;
  phone?: string;
  bloodType?: string;
  healthInfo?: string;
  emergencyNotes?: string;
  photoUrl?: string;
}

export interface ClientVehicle {
  id: string;
  year?: number;
  make: string;
  model: string;
  bodyType?: string;
  color: string;
  licensePlate: string;
  vin?: string;
  distinguishingFeatures?: string;
  notes?: string;
  photoUrl?: string;
}

export interface MedicalAidInfo {
  schemeName: string;
  provider?: string;
  planName?: string;
  membershipNumber: string;
  principalMember: string;
  emergencyContactNumber: string;
  additionalInfo?: string;
}

export type AnimalType = 'CATTLE' | 'SHEEP' | 'GOATS' | 'HORSES' | 'PIGS' | 'GENERAL_LIVESTOCK';
export type BrandMethodType = 'HOT_IRON' | 'FREEZE_BRAND' | 'EAR_NOTCH' | 'TATTOO' | 'RFID_TAG' | 'COLLAR';

export interface CattleBrandMark {
  id: string;
  brandCode: string; // e.g. "JH 2" or "CH 8"
  registeredOwner?: string; // Legal owner name registered at DALRRD / Landbou
  certificateNumber?: string; // DALRRD / Animal Identification Act Reg # e.g. "DALRRD-BM-88492"
  certificateDate?: string; // e.g. "2022-03-15"
  certificateFileUrl?: string; // Uploaded certificate document / image data URL
  certificateFileName?: string; // Original filename e.g. "Brandmerksertifikaat_JH2.pdf" / .jpg
  certificateFileType?: string; // e.g. "image/jpeg" | "application/pdf" | "image/png"
  certificateUploadedAt?: string;
  brandLocation?: string; // Placement: "Right Thigh (Regter Dy)", "Left Shoulder (Linker Blad)", "Left Neck (Linker Nek)", "Right Ribs (Regter Ribbe)", "Left/Right Ear"
  brandMethod?: BrandMethodType;
  animalType?: AnimalType;
  earMarkDescription?: string; // Description of ear notches / oorkepe e.g. "Swaelstert regs, stomp links"
  microchipOrRfid?: string; // RFID tag batch / microchip numbering
  brandMarkPhotoUrl?: string; // Optional photo of physical brand mark on hide or brand iron sketch
  stockTheftNotes?: string; // e.g. "Filed with Hartbeesfontein SAPS Stock Theft Unit"
  isPrimary?: boolean;
}

export interface EmergencyPropertyInfo {
  mainGateCode: string;
  secondaryGateInfo?: string;
  dangerousAnimals?: string; // e.g. "2 large Rottweilers near kraal"
  electricFenceInfo?: string;
  alternativeEntrance?: string;
  firefightingEquipment?: string;
  waterPoints?: string;
  hazardousMaterials?: string;
  accessDifficulties?: string;
  additionalResponderInfo?: string;
}

export interface CommunityResponseSettings {
  participateNearbyEmergencies: boolean; // default false
  receiveSecurityAlerts: boolean;
  receiveFireAlerts: boolean;
  receiveTrafficAlerts: boolean;
  receiveBoloAlerts: boolean;
  receiveCommunityNotices: boolean;
  receiveAssistanceRequests: boolean;
  availableToAssistNow: boolean;
  preferredGroupIds?: string[];
  maxResponseDistanceKm?: number;
  responseNotes?: string;
}

export type NotificationSoundTone =
  | 'SOS_SIREN'
  | 'TRAFFIC_HORN'
  | 'FIRE_WARBLE'
  | 'SECURITY_BEEP'
  | 'BOLO_RADAR'
  | 'CHIME_GENTLE'
  | 'TACTICAL_DOUBLE_BEEP';

export interface CategoryNotificationConfig {
  enabled: boolean;
  soundEnabled: boolean;
  soundTone: NotificationSoundTone;
  volume: number; // 0.0 to 1.0 (e.g. 0.8)
  pushBannerEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface AppNotificationPreferences {
  masterPushEnabled: boolean;
  masterSoundEnabled: boolean;
  masterVibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "05:00"
  overrideQuietHoursForSos: boolean; // default true
  sosPanic: CategoryNotificationConfig;
  trafficAlerts: CategoryNotificationConfig;
  fireAlerts: CategoryNotificationConfig;
  securityAlerts: CategoryNotificationConfig;
  boloAlerts: CategoryNotificationConfig;
  sitrepUpdates: CategoryNotificationConfig;
  reactionForceDispatchSound: boolean;
  reactionForceDispatchTone: NotificationSoundTone;
}

export interface FarmGpsLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  verifiedTimestamp?: string;
  source?: 'GPS' | 'MANUAL_PIN' | 'ADDRESS';
}

export interface ClientProperty {
  id: string;
  name: string;
  portionNumber?: string;
  sector?: string;
  isPrimary?: boolean;
  gpsLocation: FarmGpsLocation;
  gateCode?: string;
  secondaryGateCode?: string;
  accessDirections?: string;
  dangerousAnimals?: string;
  waterPoints?: string;
  firefightingEquipment?: string;
  notes?: string;
  photoUrl?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  surname: string;
  primaryPhone: string;
  secondaryPhone?: string;
  farmName: string;
  portionNumber?: string;
  sector?: string;
  locationArea?: string; // e.g. "Brakspruit", "Hartbeesfontein", "Palmietfontein", "Klerksdorp", "Dupperspos", "Schoemansfontein"
  locationAreaId?: string;
  areaGroupIds: string[];
  preferredLanguage: LanguageCode;
  photoUrl?: string;
  emergencyNotes?: string;
  themePreference?: 'dark' | 'light' | 'system';
  role: UserRole;
  isActive: boolean;

  // Farm / Property Location for nearby response calculation
  farmGpsLocation?: FarmGpsLocation;
  secondaryPropertyLocation?: {
    name?: string;
    latitude: number;
    longitude: number;
  };
  properties?: ClientProperty[];

  // Community response settings (Default: participateNearbyEmergencies = false)
  communityResponseSettings?: CommunityResponseSettings;
  
  // Sensitive sections
  familyMembers: FamilyMember[];
  vehicles: ClientVehicle[];
  medicalAid?: MedicalAidInfo;
  emergencyPropertyInfo?: EmergencyPropertyInfo;

  // Livestock & Cattle Identification Marks (Brandmerke & DALRRD Sertifikate)
  cattleIdentificationMarks?: CattleBrandMark[];
  cattleBrandCode?: string;
  cattleBrandCertificateUrl?: string;
  cattleBrandLocation?: string;
  
  // Operational Role Assignments (e.g. Reaction Force, Reaction Force Commander, Firetruck Driver, Management Executive, etc.)
  operationalRole?: OperationalRoleType | string;
  assignedRoles?: string[];
  roleTitle?: string;

  // Reaction Force Profile (When role === 'REACTION_FORCE')
  callsign?: string;
  organizationTeam?: string;
  vehicleDetails?: string;
  vehicleRegistration?: string;
  assignedAreaGroup?: string;
  isAvailableForDuty?: boolean;
  rfEmergencyContact?: string;
  rfNotes?: string;
  currentResponderLocation?: UniversalGeoLocation;

  // Emergency Live Media Preferences
  allowEmergencyAudio?: boolean;
  allowEmergencyCamera?: boolean;
  
  // Customizable Notification & Push Preferences (Client & Reaction Force)
  notificationPreferences?: AppNotificationPreferences;
  
  // Privacy & Agreement State
  acceptedAgreements?: UserAgreementRecord[];
  agreedToUserAgreement?: boolean;
  agreedToPrivacyNotice?: boolean;
  agreedToCommunitySafetyRules?: boolean;
  isDeactivationRequested?: boolean;
  deactivationRequestedAt?: string;
  deactivationReason?: string;

  // Security & Authentication Credentials
  pin?: string; // Default: '1234'
  mustChangePin?: boolean; // Set to true after registration until pin is changed
  hasChangedPin?: boolean;
  lastLoginAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// EMERGENCY SYSTEM STATE MACHINE & MODELS
// ==========================================

export type EmergencyType =
  | 'SECURITY'
  | 'MEDICAL'
  | 'POLICE_ASSISTANCE'
  | 'FIRE'
  | 'OTHER';

export type EmergencyStatus =
  | 'TRIGGERED'
  | 'CONTROL_ROOM_NOTIFIED'
  | 'ACKNOWLEDGED'
  | 'ACTION_TAKEN'
  | 'HELP_DISPATCHED'
  | 'MONITORING'
  | 'SAFE'
  | 'FALSE_ALARM'
  | 'CLOSED'
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED'
  | string;

export type LocationQuality =
  | 'CURRENT_GPS'
  | 'LAST_KNOWN'
  | 'PROPERTY_FALLBACK'
  | 'UNAVAILABLE'
  | 'LIVE_STREAM'
  | 'EXCELLENT'
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'ESTIMATED'
  | string;

export interface EmergencyLocationEvent {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  quality: LocationQuality;
  notes?: string;
  source?: string;
}

export type TimelineEventType =
  | 'TRIGGERED'
  | 'LOCATION_CAPTURED'
  | 'NOTIFIED_CONTROL_ROOM'
  | 'ACKNOWLEDGED'
  | 'REACTION_FORCE_NOTIFIED'
  | 'POLICE_CALL_INITIATED'
  | 'POLICE_OUTCOME_RECORDED'
  | 'AMBULANCE_CALL_INITIATED'
  | 'AMBULANCE_OUTCOME_RECORDED'
  | 'MANAGEMENT_NOTIFIED'
  | 'COMMUNITY_ALERT_CREATED'
  | 'CASE_LINKED'
  | 'CASE_CREATED'
  | 'CLIENT_LOCATION_UPDATED'
  | 'CLIENT_INFO_ADDED'
  | 'OPERATOR_NOTE_ADDED'
  | 'STATUS_CHANGED'
  | 'SAFE_CONFIRMED'
  | 'FALSE_ALARM_REPORTED'
  | 'RESOLVED_AND_CLOSED'
  | 'COMMUNICATION_FAILURE'
  | 'LIVE_AUDIO_REQUESTED'
  | 'LIVE_AUDIO_ACCEPTED'
  | 'LIVE_AUDIO_DECLINED'
  | 'LIVE_AUDIO_STARTED'
  | 'LIVE_AUDIO_CONNECTED'
  | 'LIVE_AUDIO_INTERRUPTED'
  | 'LIVE_AUDIO_ENDED'
  | 'LIVE_LOCATION_STARTED'
  | 'LIVE_LOCATION_UPDATED'
  | 'LIVE_LOCATION_STALE'
  | 'LIVE_LOCATION_ENDED'
  | 'CLIENT_MESSAGE_SENT'
  | 'CONTROL_ROOM_MESSAGE_SENT'
  | 'CALL_CLIENT_INITIATED'
  | 'CALL_CONTROL_ROOM_INITIATED'
  | 'REACTION_FORCE_CONTACTED'
  | 'MANAGEMENT_CONTACTED';

export interface EmergencyTimelineEvent {
  id: string;
  emergencyId: string;
  eventType: TimelineEventType;
  timestamp: string;
  actorUid?: string;
  actorName?: string;
  actorRole?: UserRole;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface EmergencyNote {
  id: string;
  emergencyId: string;
  authorUid: string;
  authorName: string;
  authorRole: UserRole;
  timestamp: string;
  text: string;
  attachments?: string[];
  location?: { latitude: number; longitude: number };
}

export interface EmergencyClientInfoUpdate {
  id: string;
  emergencyId: string;
  timestamp: string;
  text: string;
  photos?: string[];
  location?: { latitude: number; longitude: number; accuracy?: number };
}

export type WhatsAppDeliveryStatus =
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'UNKNOWN'
  | 'MANUAL_SEND_INITIATED'
  | 'REQUIRES_CONFIGURATION';

export interface WhatsAppMessageRecord {
  id: string;
  emergencyId: string;
  recipient: string;
  recipientName: string;
  messageType: 'REACTION_FORCE' | 'MANAGEMENT' | 'POLICE' | 'AMBULANCE' | 'CUSTOM';
  content: string;
  requestedTimestamp: string;
  providerMessageId?: string;
  sendStatus: WhatsAppDeliveryStatus;
  deliveryStatus?: WhatsAppDeliveryStatus;
  failureReason?: string;
  retryCount: number;
  isManualFallback: boolean;
}

export type CallOutcomeType = 'CONTACTED' | 'NO_ANSWER' | 'DISPATCH_CONFIRMED' | 'NOT_REQUIRED';

export interface CallActionRecord {
  id: string;
  emergencyId: string;
  callType: 'POLICE' | 'AMBULANCE' | 'REACTION_FORCE' | 'MANAGEMENT' | 'OTHER';
  targetNumber: string;
  targetName: string;
  initiatedAt: string;
  initiatedByUid: string;
  initiatedByName: string;
  outcome?: CallOutcomeType;
  outcomeRecordedAt?: string;
  notes?: string;
}

export interface EmergencyResolutionDetails {
  resolutionStatus: 'SAFE' | 'FALSE_ALARM' | 'RESOLVED' | 'CLOSED';
  resolutionTimestamp: string;
  resolvedByUid: string;
  resolvedByName: string;
  notes: string;
  policeInvolved: boolean;
  ambulanceInvolved: boolean;
  reactionForceInvolved: boolean;
  caseCreated: boolean;
  linkedCaseId?: string;
  followUpRequired: boolean;
  falseAlarmReason?: string;
}

export interface CommunicationFailure {
  id: string;
  emergencyId: string;
  service: 'PUSH_NOTIFICATION' | 'WHATSAPP' | 'SMS' | 'LOCATION_SERVICE' | 'NETWORK';
  errorDescription: string;
  timestamp: string;
  resolved: boolean;
}

export interface EmergencyEvent {
  id: string;
  isTraining?: boolean;
  clientUid: string;
  clientName: string;
  clientPhone: string;
  secondaryPhone?: string;
  clientPhotoUrl?: string;
  farmName: string;
  sector?: string;
  emergencyType: EmergencyType;
  type?: EmergencyType;
  status: EmergencyStatus;
  
  // Primary Location Snapshot
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
    quality: LocationQuality;
    locationName?: string;
  };
  
  // Location Updates History (Client updates during active emergency)
  locationHistory: EmergencyLocationEvent[];

  // Sensitive Property Snapshot (Encrypted & restricted to Control Room / Management)
  propertySnapshot: {
    mainGateCode?: string;
    secondaryGateInfo?: string;
    dangerousAnimals?: string;
    electricFenceInfo?: string;
    alternativeEntrance?: string;
    firefightingEquipment?: string;
    waterPoints?: string;
    hazardousMaterials?: string;
    accessDifficulties?: string;
    additionalResponderInfo?: string;
    emergencyNotes?: string;
  };

  // Sensitive Family & Medical Snapshot
  familySnapshot?: FamilyMember[];
  medicalAidSnapshot?: MedicalAidInfo;

  // Acknowledgement Details
  acknowledgedBy?: {
    operatorUid: string;
    operatorName: string;
    timestamp: string;
  };

  // Operational Timeline & Logs
  timeline: EmergencyTimelineEvent[];
  notes: EmergencyNote[];
  clientUpdates: EmergencyClientInfoUpdate[];
  whatsappLogs: WhatsAppMessageRecord[];
  callLogs: CallActionRecord[];
  failures: CommunicationFailure[];

  // Phase: Live Communications, Audio & Location
  audioSession?: AudioSessionRecord;
  audioRecordings?: AudioRecordingRecord[];
  locationSession?: EmergencyLocationSession;
  messages: EmergencyMessageRecord[];
  reactionForceContactLogs: ReactionForceContactLog[];

  // Resolution
  resolutionDetails?: EmergencyResolutionDetails;

  // Cross links
  linkedCaseId?: string;
  linkedAlertId?: string;

  startTime: string;
  updatedAt: string;
  resolvedTime?: string;
  sourceDevice?: string;
}

// Emergency Contacts Configuration (Management Settings & Control Room Phone Book)
export type ContactCategory =
  | 'REACTION_FORCE'
  | 'MANAGEMENT'
  | 'POLICE'
  | 'AMBULANCE'
  | 'FIRE'
  | 'TOWING'
  | 'VET'
  | 'NEIGHBOR_NON_CLIENT'
  | 'CONTRACTOR'
  | 'OTHER';

export interface LocationArea {
  id: string;
  name: string; // e.g. "Brakspruit", "Hartbeesfontein", "Palmietfontein", "Klerksdorp", "Dupperspos", "Schoemansfontein"
  code?: string; // e.g. "BRAK", "HBF", "PALM"
  description?: string;
  sector?: string; // Linked operational sector, e.g. "Sektor 1 - Suid"
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  id: string;
  category: ContactCategory;
  name: string;
  organisation: string;
  phone: string;
  role?: string;
  whatsappNumber?: string;
  areaSector?: string;
  locationArea?: string; // e.g. "Brakspruit", "Hartbeesfontein", "Palmietfontein", etc.
  locationAreaId?: string;
  isActive: boolean;
  notes?: string;
}

// Incident Categories
export type IncidentCategory =
  | 'attack'
  | 'robbery'
  | 'theft'
  | 'stock_theft'
  | 'housebreaking'
  | 'suspicious_person'
  | 'suspicious_vehicle'
  | 'suspicious_activity'
  | 'fire'
  | 'vandalism'
  | 'fence_damage'
  | 'traffic_alert'
  | 'road_incident'
  | 'other';

export type TrafficHazardCategory =
  | 'accident'
  | 'road_closed'
  | 'animals_on_road'
  | 'fire'
  | 'flooding'
  | 'road_damage'
  | 'debris'
  | 'dangerous_conditions'
  | 'roadworks'
  | 'other';

// Case Models
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseStatus = 'open' | 'investigating' | 'action_pending' | 'resolved' | 'closed' | 'OPEN' | 'INVESTIGATING' | 'ACTION_PENDING' | 'RESOLVED' | 'CLOSED' | 'NEW' | 'PENDING_SAPS' | string;

export interface CaseEvidence {
  id: string;
  fileUrl: string;
  storagePath?: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  uploadedByUid: string;
  uploadedByName: string;
  caption?: string;
  uploadedAt: string;
}

export interface CaseUpdate {
  id: string;
  caseId: string;
  authorUid: string;
  authorName: string;
  authorRole: UserRole;
  message: string;
  updateType: 'progress' | 'action_taken' | 'status_change' | 'responder_note' | 'evidence_added';
  isInternalOnly: boolean;
  gpsLocation?: { latitude: number; longitude: number };
  attachments?: string[];
  timestamp: string;
}

export type CasePrivacyLevel = 'STANDARD' | 'PRIVATE_CONFIDENTIAL';
export type CaseAccessLevel = 'VIEW' | 'CONTRIBUTE' | 'MANAGE';

export interface CaseAccessGrant {
  id: string;
  caseId: string;
  userUid: string;
  userName: string;
  role: UserRole;
  accessLevel: CaseAccessLevel;
  grantedByUid: string;
  grantedByName: string;
  grantedTimestamp: string;
  reason: string;
  revokedTimestamp?: string;
  revokedByUid?: string;
  revokedReason?: string;
}

export type PrivateCaseAction =
  | 'VIEWED'
  | 'UPDATED'
  | 'EVIDENCE_VIEWED'
  | 'EVIDENCE_ADDED'
  | 'DOWNLOADED'
  | 'EXPORTED'
  | 'ACCESS_GRANTED'
  | 'ACCESS_REVOKED';

export interface PrivateCaseAccessLog {
  id: string;
  caseId: string;
  caseNumber: string;
  userUid: string;
  userName: string;
  role: UserRole;
  action: PrivateCaseAction;
  timestamp: string;
  details?: string;
  ipOrSessionInfo?: string;
}

export interface CaseCorrectionEntry {
  id: string;
  fieldName: string;
  originalValue: string;
  correctedValue: string;
  correctedByUid: string;
  correctedByName: string;
  timestamp: string;
  reason: string;
}

export interface InvestigatingOfficer {
  id: string;
  name: string;
  rank?: string; // e.g. "Constable", "Sergeant", "Warrant Officer", "Captain", "Inspector", "Detective", "Lieutenant Colonel"
  station?: string; // e.g. "Hartbeesfontein SAPS", "Klerksdorp SAPS", "Ottosdal SAPS"
  phone?: string;
  badgeNumber?: string; // Force / Persal Number
  email?: string;
  unit?: string; // e.g. "Detective Services", "Stock Theft Unit", "VISPOL", "FCS"
  notes?: string;
  assignedDate?: string;
}

export interface SapsCaseDetails {
  caseNumber?: string; // CAS / MAS Number, e.g. "CAS 42/08/2026" or "MAS 42/08/2026"
  station?: string; // Police Station, e.g. "Hartbeesfontein SAPS"
  obNumber?: string; // Occurrence Book (OB) Number, e.g. "OB 189/08/2026"
  dateReported?: string;
  officers?: InvestigatingOfficer[];
  docketLocation?: string;
  prosecutorName?: string;
  courtCaseNumber?: string;
  statusNotes?: string;
}

export interface Case {
  id: string;
  caseNumber: string; // e.g. "HBF-2026-0042"
  title: string;
  description: string;
  category: IncidentCategory;
  priority: CasePriority;
  status: CaseStatus;
  isPublic: boolean;

  // SAPS / SAPD Integration
  sapsCaseNumber?: string; // Quick reference CAS/MAS number e.g. "CAS 42/08/2026"
  sapsStation?: string; // e.g. "Hartbeesfontein SAPS"
  sapsDetails?: SapsCaseDetails;
  investigatingOfficers?: InvestigatingOfficer[];
  
  // Privacy & Access Control
  privacyLevel?: CasePrivacyLevel;
  isConfidential?: boolean;
  accessControlList?: CaseAccessGrant[];
  authorizedUserUids?: string[];
  privacyWarningAcknowledgedBy?: string[];
  correctionHistory?: CaseCorrectionEntry[];
  
  incidentDate: string;
  incidentTime: string;
  locationName: string;
  farmId?: string;
  farmName?: string;
  sector?: string;
  areaGroupId?: string;
  gpsLocation?: { latitude: number; longitude: number };
  locationCoordinates?: { latitude: number; longitude: number };
  
  reportedByUid: string;
  reportedByName: string;
  reportedByPhone: string;
  
  // Victim / Property Owner / Associated Member
  victimUid?: string;
  victimName?: string;
  victimPhone?: string;
  victimFarmName?: string;
  victimRole?: string;
  isVictimAware?: boolean;
  assignedMemberUids?: string[];
  
  vehicleInfo?: {
    makeModel?: string;
    color?: string;
    plate?: string;
    notes?: string;
  };
  personDescription?: {
    gender?: string;
    clothing?: string;
    buildHeight?: string;
    identifyingMarks?: string;
    notes?: string;
  };
  
  photos: string[];
  evidence: CaseEvidence[];
  updates: CaseUpdate[];
  
  modusOperandi?: ModusOperandiType[];
  modusOperandiNotes?: string;
  
  linkedPoiIds: string[];
  linkedVehicleIds: string[];
  linkedSituationId?: string;
  linkedBoloId?: string;
  linkedEmergencyId?: string;

  suspects?: Array<any>;
  suspectVehicles?: Array<any>;
  aiAnalysisSummary?: string;
  aiIntelGeneratedAt?: string;
  crossCaseLinks?: Array<any>;
  investigationTimeline?: Array<any>;
  
  createdAt: string;
  updatedAt: string;
}

export interface IncidentNotification {
  id: string; // e.g. "INC-NOTIF-172421391234"
  caseId: string;
  caseNumber: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: CasePriority;
  reportedByName: string;
  reportedByPhone: string;
  reportedByUid: string;
  reportedByRole?: UserRole;
  victimName?: string;
  victimPhone?: string;
  victimFarmName?: string;
  sector?: string;
  locationName: string;
  gpsLocation?: { latitude: number; longitude: number };
  incidentDate: string;
  incidentTime: string;
  sapsCaseNumber?: string;
  photosCount: number;
  vehicleSummary?: string;
  personSummary?: string;
  timestamp: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export type SitrepBroadcastTarget =
  | 'REACTION_FORCE'
  | 'AREA_GROUP'
  | 'MANAGEMENT'
  | 'FIRE_DRIVERS'
  | 'ALL_MEMBERS';

// Situation Reports
export interface SituationReport {
  id: string;
  reportNumber: string; // e.g. "SIT-2026-089"
  sourceName: string;
  sourcePhone?: string;
  sourceType: 'phone' | 'radio' | 'in_person' | 'whatsapp_forward' | 'patrol';
  timestamp: string;
  location: string;
  gpsLocation?: { latitude: number; longitude: number };
  category: IncidentCategory | 'general_intel';
  description: string;
  notes?: string;
  status: 'active' | 'converted_to_case' | 'resolved' | 'archived';
  isPrivate?: boolean; // If false/undefined, visible to clients in HDR-CLIENT-NOTICES
  linkedCaseId?: string;
  broadcastTargets?: SitrepBroadcastTarget[];
  selectedAreaGroupId?: string;
  createdByUid: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// BOLO Models
export type BoloTargetType = 'person' | 'vehicle' | 'case' | 'location';
export type BoloDistribution = 'internal_only' | 'selected_group' | 'all_clients' | 'geographic_area';
export type BoloStatus = 'active' | 'cancelled' | 'resolved' | 'ACTIVE' | 'CANCELLED' | 'RESOLVED' | 'EXPIRED' | string;

export interface BoloRecord {
  id: string;
  boloNumber: string; // e.g. "BOLO-2026-015"
  title: string;
  reason: string;
  description: string;
  targetType: BoloTargetType;
  photos: string[];
  
  vehicleInfo?: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
    distinguishingFeatures?: string;
  };
  personInfo?: {
    nameAliases?: string;
    approximateAge?: string;
    physicalDescription?: string;
    identifyingMarks?: string;
    clothingLastSeen?: string;
  };
  
  lastKnownLocation: string;
  lastSeenTimestamp: string;
  directionOfTravel?: string;
  publicSafeInstructions?: string;
  relatedCaseId?: string;
  relatedPoiId?: string;
  
  distribution: BoloDistribution;
  targetAreaGroupIds?: string[];
  targetRadiusKm?: number;
  targetCenterLocation?: { latitude: number; longitude: number };
  status: BoloStatus;
  
  createdByUid: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoloSighting {
  id: string; // e.g. "SGT-2026-003"
  boloId: string;
  boloNumber: string;
  reportedByUid: string;
  reportedByName: string;
  reportedByPhone: string;
  timestamp: string;
  locationDescription: string;
  gpsLocation?: { latitude: number; longitude: number; accuracy?: number };
  directionOfTravel?: string;
  description: string;
  photoUrl?: string;
  verificationStatus: 'UNVERIFIED' | 'PARTIALLY_VERIFIED' | 'VERIFIED' | 'DISPUTED' | 'FALSE' | 'IRRELEVANT';
  verifiedByUid?: string;
  verifiedByName?: string;
  verificationNotes?: string;
  verifiedTimestamp?: string;
}

// Intelligence & Persons of Interest (POI) & Vehicles of Interest (VOI)
export type PoiStatus =
  | 'unknown_person'
  | 'person_of_interest'
  | 'suspect'
  | 'wanted'
  | 'arrested'
  | 'charged'
  | 'convicted'
  | 'cleared'
  | 'UNKNOWN_PERSON'
  | 'PERSON_OF_INTEREST'
  | 'SUSPECT'
  | 'WANTED'
  | 'ARRESTED'
  | 'CHARGED'
  | 'CONVICTED'
  | 'CLEARED'
  | 'ACTIVE'
  | 'FLAGGED'
  | 'STOLEN'
  | 'ARCHIVED'
  | 'MONITORING'
  | string;

export type IntelVerificationStatus =
  | 'unverified'
  | 'partially_verified'
  | 'verified'
  | 'disputed'
  | 'false'
  | 'UNVERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'VERIFIED'
  | 'DISPUTED'
  | 'FALSE';

export type IntelConfidenceLevel = 'low' | 'medium' | 'high' | 'LOW' | 'MEDIUM' | 'HIGH';

export type RecordLifecycleState = 'ACTIVE' | 'CLOSED' | 'ARCHIVED' | 'MERGED';

export type IntelSourceType =
  | 'CLIENT_REPORT'
  | 'CONTROL_ROOM_CALL'
  | 'CONTROL_ROOM_OPERATOR'
  | 'MANAGEMENT'
  | 'SAPS'
  | 'SECURITY_COMPANY'
  | 'CCTV'
  | 'PHOTO'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'BOLO_SIGHTING'
  | 'OTHER'
  | string;

export interface IntelDisputeEntry {
  originalValue?: string;
  correction?: string;
  reason?: string;
  proposedCorrection?: string;
  disputedByUid?: string;
  disputedByName?: string;
  correctedByUid?: string;
  correctedByName?: string;
  timestamp: string;
}

export interface IntelObservation {
  id: string;
  observationId: string; // e.g. "OBS-2026-0048"
  poiId?: string;
  vehicleId?: string;
  relatedCaseId?: string;
  relatedBoloId?: string;
  incidentTimestamp: string;
  date?: string;
  time?: string;
  locationDescription?: string;
  gpsLocation?: { latitude: number; longitude: number };
  description: string;
  sourceType: IntelSourceType;
  sourceReference?: string;
  enteredByUid: string;
  enteredByName: string;
  enteredTimestamp: string;
  verificationStatus: IntelVerificationStatus;
  confidenceLevel: IntelConfidenceLevel;
  evidenceReferences: string[];
  notes?: string;
  disputeHistory?: IntelDisputeEntry[];
  disputeTrail?: IntelDisputeEntry[];
}

export interface PersonGranularConfidence {
  vehicleLink?: IntelConfidenceLevel;
  name?: IntelConfidenceLevel;
  phone?: IntelConfidenceLevel;
  address?: IntelConfidenceLevel;
  physicalDescription?: IntelConfidenceLevel;
}

export interface KnownAssociate {
  personId?: string;
  name: string;
  relationship: string;
  verificationStatus?: IntelVerificationStatus;
  notes?: string;
}

export interface PoiAddressEntry {
  id?: string;
  address: string;
  type?: 'PRIMARY_RESIDENCE' | 'WORKPLACE' | 'FREQUENTED_LOCATION' | 'FAMILY_HOME' | 'PREVIOUS_ADDRESS' | 'OTHER';
  isVerified?: boolean;
  notes?: string;
  addedAt?: string;
}

export interface PersonOfInterest {
  id: string;
  internalPoiId: string; // e.g. "POI-HBF-023"
  name?: string;
  surname?: string;
  aliases: string[];
  nickname?: string;
  approximateAge?: number;
  dateOfBirth?: string;
  gender?: string;
  physicalDescription: {
    height?: string;
    build?: string;
    identifyingMarks?: string;
    clothingLastSeen?: string;
    complexion?: string;
  };
  phoneNumbers: string[];
  addresses?: string[];
  knownAddresses?: PoiAddressEntry[];
  knownAreas: string[];
  photos: string[];
  status: PoiStatus;
  lifecycleState?: RecordLifecycleState;
  confidenceBreakdown?: PersonGranularConfidence;
  knownAssociates?: KnownAssociate[];
  convictionDetails?: {
    recordedByUid: string;
    courtCaseNumber: string;
    convictionDate: string;
    sentenceSummary: string;
  };
  associatedVehicles: string[];
  associatedPersons: (string | { id?: string; name: string; relationship?: string; phone?: string })[];
  linkedCaseIds: string[];
  associatedBoloIds?: string[];
  observations: IntelObservation[];
  notes: string;
  lastSeen?: string;
  isPossibleDuplicateOf?: string;
  mergedIntoPoiId?: string;
  mergeHistory?: {
    originalPoiId?: string;
    mergedRecordId?: string;
    mergedAt: string;
    mergedByUid: string;
    mergedByName: string;
    reason: string;
  }[];
  statusAuditTrail?: {
    previousStatus: PoiStatus;
    newStatus: PoiStatus;
    reason: string;
    changedByUid: string;
    changedByName: string;
    timestamp: string;
  }[];
  createdByUid: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// Vehicle Intelligence Model
export interface VehicleOfInterest {
  id: string;
  internalVoiId: string; // e.g. "VOI-HBF-0041"
  registration: string; // supports partial like "ABC ?23 NW"
  isPartialRegistration?: boolean;
  make: string;
  model: string;
  year?: string;
  bodyType?: string;
  colour: string;
  vin?: string;
  photos: string[];
  distinguishingMarks?: string;
  damage?: string;
  canopyOrAccessories?: string;
  knownOwner?: {
    name: string;
    phone?: string;
    address?: string;
    isVerified: boolean;
  };
  associatedPersonIds: string[];
  associatedCaseIds: string[];
  associatedBoloIds: string[];
  observations?: IntelObservation[];
  lastSeen?: string;
  status: 'ACTIVE' | 'FLAGGED' | 'STOLEN' | 'CLEARED' | 'ARCHIVED';
  lifecycleState?: RecordLifecycleState;
  notes: string;
  isPossibleDuplicateOf?: string;
  mergedIntoVoiId?: string;
  mergeHistory?: {
    originalVoiId?: string;
    mergedRecordId?: string;
    mergedAt: string;
    mergedByUid: string;
    mergedByName: string;
    reason: string;
  }[];
  createdByUid: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// Relationship System (Re-usable links between records)
export type IntelEntityType = 'PERSON' | 'VEHICLE' | 'CASE' | 'BOLO' | 'LOCATION' | 'EVIDENCE';

export interface IntelRelationship {
  id: string;
  sourceId: string;
  sourceType: IntelEntityType;
  sourceLabel: string;
  targetId: string;
  targetType: IntelEntityType;
  targetLabel: string;
  sourceEntityId?: string;
  targetEntityId?: string;
  relationshipType: string; // e.g. "DRIVER_OF_VEHICLE", "SUSPECT_IN_CASE", "KNOWN_ASSOCIATE", "SIGHTED_NEAR"
  sourceAttribution: string;
  createdByUid: string;
  createdByName: string;
  createdAt: string;
  verification: 'VERIFIED' | 'UNVERIFIED' | 'SUGGESTED' | 'DISPUTED';
  notes?: string;
}

// Review Queue Model for Client-submitted & automated reports
export type IntelReviewItemType =
  | 'SUSPICIOUS_PERSON_REPORT'
  | 'SUSPICIOUS_VEHICLE_REPORT'
  | 'BOLO_SIGHTING'
  | 'POSSIBLE_DUPLICATE_PERSON'
  | 'POSSIBLE_DUPLICATE_VEHICLE'
  | 'AI_LINK_SUGGESTION'
  | 'HIGH_PRIORITY_OBSERVATION';

export interface IntelReviewItem {
  id: string;
  itemType: IntelReviewItemType;
  title: string;
  description: string;
  location?: string;
  gpsLocation?: { latitude: number; longitude: number };
  reportedByUid?: string;
  reportedByName?: string;
  reportedByRole?: UserRole;
  timestamp: string;
  status:
    | 'PENDING_REVIEW'
    | 'PROCESSED'
    | 'DISMISSED'
    | 'FALSE_REPORT'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'MERGED'
    | 'FLAGGED_FOR_FOLLOWUP';
  payload: {
    caseId?: string;
    sightingId?: string;
    personData?: Partial<PersonOfInterest>;
    vehicleData?: Partial<VehicleOfInterest>;
    observationData?: Partial<IntelObservation>;
    suggestedSourceId?: string;
    suggestedTargetId?: string;
    similarityReason?: string;
    confidenceScore?: string;
  };
  actionTaken?:
    | 'LINKED_EXISTING'
    | 'CREATED_NEW'
    | 'KEPT_AS_CASE_NOTE'
    | 'MARKED_FALSE'
    | 'MERGED'
    | 'CREATE_NEW_VOI'
    | 'CREATE_NEW_POI'
    | 'ATTACH_OBSERVATION_TO_EXISTING'
    | 'DISMISS_FALSE_REPORT'
    | 'MARK_LEGITIMATE_ACTIVITY'
    | 'MERGE_INTO_EXISTING'
    | 'REQUEST_MORE_EVIDENCE';
  actionNotes?: string;
  reviewedByUid?: string;
  reviewedByName?: string;
  reviewedTimestamp?: string;
  processedByUid?: string;
  processedByName?: string;
  processedAt?: string;
}

// Modus Operandi
export type ModusOperandiType =
  | 'FENCE_CUT'
  | 'GATE_FORCED'
  | 'LIVESTOCK_DRIVEN_AWAY'
  | 'VEHICLE_USED'
  | 'FOOT_ACCESS'
  | 'POWER_DISABLED'
  | 'DOGS_POISONED'
  | 'HOUSE_ENTERED_WINDOW'
  | 'COPPER_WIRE_REMOVED'
  | 'FIRE_DISTRACTION'
  | 'CABLE_THEFT'
  | 'TOOL_SHED_BREAKIN'
  | 'OTHER';

// Data Quality Issues
export interface DataQualityIssue {
  id: string;
  entityType: 'PERSON' | 'VEHICLE' | 'CASE' | 'OBSERVATION' | 'BOLO';
  entityId: string;
  entityLabel: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  issueDescription: string;
  suggestedFix?: string;
  suggestedAction?: string;
}

// Intel Audit Entries
export interface IntelAuditEntry {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  action:
    | 'VIEW_POI'
    | 'VIEW_VOI'
    | 'VIEW_EVIDENCE'
    | 'SEARCH_INTEL'
    | 'EXPORT_DATA'
    | 'MODIFY_RECORD'
    | 'CHANGE_STATUS'
    | 'ADD_RELATIONSHIP'
    | 'REMOVE_RELATIONSHIP'
    | 'MERGE_DUPLICATES'
    | 'MERGE_RECORDS'
    | 'ARCHIVE_RECORD'
    | 'ARCHIVE'
    | 'DISPUTE_INFORMATION'
    | 'DISPUTE_RECORD'
    | 'ADD_POI'
    | 'ADD_VOI'
    | 'ADD_OBSERVATION'
    | 'UPDATE_PROFILE'
    | 'VERIFY_RECORD'
    | 'APPROVE_SUBMISSION';
  entityId: string;
  entityType: 'POI' | 'VOI' | 'CASE' | 'OBSERVATION' | 'RELATIONSHIP' | 'REPORT' | 'REVIEW_QUEUE';
  timestamp: string;
  details: string;
}


// ==========================================
// COMMUNITY ASSISTANCE & GEOGRAPHIC ALERTING
// ==========================================

export type LocationPrecision = 'EXACT' | 'APPROXIMATE' | 'AREA_ONLY';

export type AssistanceRequestType =
  | 'SECURITY'
  | 'FIRE'
  | 'SEARCH'
  | 'TRAFFIC'
  | 'GENERAL'
  | 'OTHER';

export type AssistancePriority = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type StructuredSafetyInstruction =
  | 'DO_NOT_APPROACH'
  | 'OBSERVE_ONLY'
  | 'REPORT_VEHICLE_MOVEMENT'
  | 'ASSIST_ONLY_IF_SAFE'
  | 'RESPOND_TO_DESIGNATED_POINT'
  | 'CUSTOM';

export type ResponderStatus =
  | 'SEEN'
  | 'CAN_ASSIST'
  | 'RESPONDING'
  | 'ARRIVED'
  | 'ON_SCENE'
  | 'UNABLE'
  | 'UNABLE_TO_ASSIST'
  | 'STAND_DOWN';

export interface StagingPointInfo {
  name: string;
  latitude?: number;
  longitude?: number;
  instructions: string;
  contactPerson?: string;
  contactPhone?: string;
}

export interface ResponderRecord {
  userUid: string;
  responderUid?: string;
  userName: string;
  responderName?: string;
  userPhone: string;
  responderPhone?: string;
  farmOrBase: string;
  farmOrArea?: string;
  distanceKm?: number;
  etaMinutes?: number;
  status: ResponderStatus;
  statusTimestamp: string;
  notes?: string;
  assignedRole?: string;
  isRemovedFromTask?: boolean;
  timeline: {
    status: ResponderStatus;
    timestamp: string;
    notes?: string;
    location?: { latitude: number; longitude: number };
  }[];
}

export interface EscalationRoundRecord {
  round: number;
  triggeredAt: string;
  triggeredByUid: string;
  triggeredByName: string;
  candidateCount: number;
  notifiedUserIds: string[];
  radiusKm?: number;
  reason?: string;
}

export interface CommunityAssistanceRequest {
  id: string; // e.g. "REQ-2026-0012"
  emergencyId?: string;
  linkedEmergencyId?: string;
  caseId?: string;
  requestType: AssistanceRequestType;
  priority: AssistancePriority;
  
  // Public-Safe Broadcast Information
  publicSafeTitle: string;
  publicTitle?: string;
  publicSafeMessage: string;
  publicMessage?: string;
  safetyWarning: string;
  safetyInstructions?: string;
  structuredInstructions: StructuredSafetyInstruction;
  customInstructions?: string;
  
  // Location & Precision
  locationPrecision: LocationPrecision;
  targetAreaName: string;
  approximateLocationDescription?: string;
  gpsLocation?: { latitude: number; longitude: number };
  farmNameSafe?: string;
  contactPhoneSafe?: string;
  
  // Staging Point
  stagingPoint?: StagingPointInfo;
  
  // Target Filter
  targetFilter: {
    targetType: 'GROUPS' | 'NEARBY_CLIENTS' | 'SELECTED_USERS' | 'AREA_ELIGIBLE' | string;
    groupIds?: string[];
    targetGroupIds?: string[];
    radiusKm?: number;
    centerLocation?: { latitude: number; longitude: number };
    selectedUserIds?: string[];
  };
  
  // Target Candidates
  targetUserIds: string[];
  responders: ResponderRecord[];
  
  // Escalation
  escalationRound: number;
  escalationHistory: EscalationRoundRecord[];
  
  // Statistics
  stats: {
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    seenCount: number;
    canAssistCount: number;
    respondingCount: number;
    arrivedCount: number;
    unableCount: number;
  };
  
  // Status
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED' | 'CLOSED' | 'ALL_CLEAR' | 'DISPATCHED' | string;
  isAllClear: boolean;
  allClearMessage?: string;
  allClearTimestamp?: string;
  allClearByUid?: string;
  
  createdByUid: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// Alerts & Notifications
export type AlertType =
  | 'EMERGENCY'
  | 'SECURITY'
  | 'SECURITY_ALERT'
  | 'CRIME'
  | 'BOLO'
  | 'FIRE'
  | 'TRAFFIC'
  | 'WEATHER'
  | 'SUSPICIOUS_ACTIVITY'
  | 'FARM_SAFETY'
  | 'MISSING_PERSON'
  | 'CASE_UPDATE'
  | 'COMMUNITY_NOTICE'
  | 'COMMUNITY_ASSISTANCE'
  | 'DAILY_REPORT'
  | 'OTHER'
  | string;

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AlertAcknowledgement {
  userUid: string;
  userName: string;
  status: 'SEEN' | 'CAN_ASSIST' | 'RESPONDING';
  timestamp: string;
  notes?: string;
}

export interface AlertUpdateItem {
  id: string;
  timestamp: string;
  message: string;
  authorUid: string;
  authorName: string;
  notifyUsers: boolean;
}

export interface AlertNotification {
  id: string;
  alertNumber: string; // e.g. "ALT-2026-081"
  type: AlertType;
  alertType?: AlertType;
  title: string;
  shortDescription: string;
  fullMessage?: string;
  priority: AlertPriority;
  location?: string;
  locationPrecision?: LocationPrecision;
  gpsLocation?: { latitude: number; longitude: number };
  radiusKm?: number;
  linkedCaseId?: string;
  linkedSituationId?: string;
  linkedBoloId?: string;
  linkedEmergencyId?: string;
  linkedAssistanceRequestId?: string;
  
  // Distribution target
  targetDistribution: 'all' | 'groups' | 'specific_users' | 'radius';
  targetGroupIds?: string[];
  targetUserIds?: string[];
  
  // Specialised Fire Alert Fields
  fireDetails?: {
    directionOfMovement?: string;
    windDirection?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CATASTROPHIC';
    structuresThreatened?: boolean;
    livestockThreatened?: boolean;
    fireUnitsRequested?: number;
    waterPointsAvailable?: string;
    stagingPointLocation?: string;
    assistanceRequired?: string;
  };
  
  // Specialised Traffic Alert Fields
  trafficDetails?: {
    category: TrafficHazardCategory;
    severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
    roadName: string;
    direction?: string;
    startTime?: string;
    expectedDuration?: string;
  };
  
  // Chronological updates & All Clear
  updates: AlertUpdateItem[];
  isAllClear: boolean;
  allClearMessage?: string;
  allClearTimestamp?: string;
  allClearByUid?: string;
  
  // Expiry & status
  activeFrom: string;
  expiresAt?: string;
  isClosed: boolean;
  closedByUid?: string;
  closedByName?: string;
  closedTimestamp?: string;
  
  acknowledgements: AlertAcknowledgement[];
  requiresAck: boolean;
  publishedAt: string;
  publishedByUid: string;
  publishedByName: string;
}

// Area / Sector & WhatsApp Broadcast Groups
export type GroupType =
  | 'GENERAL'
  | 'SECURITY'
  | 'FIRE'
  | 'TRAFFIC'
  | 'PATROL'
  | 'MEDICAL'
  | 'EXECUTIVE'
  | 'COMMUNITY'
  | 'OTHER';

export type WhatsAppBroadcastType =
  | 'BROADCAST_LIST'
  | 'GROUP_CHAT'
  | 'COMMUNITY_ANNOUNCEMENT'
  | 'DIRECT_LEADERS';

export type GroupPriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';

export interface GroupAutoDispatchTriggers {
  emergencySos?: boolean;
  farmAttack?: boolean;
  wildfire?: boolean;
  suspiciousVehicleBolo?: boolean;
  roadblockTraffic?: boolean;
  sitrepSummary?: boolean;
  communityNotice?: boolean;
  drillTesting?: boolean;
}

export interface AreaGroup {
  id: string;
  name: string;
  code: string; // e.g. "SEC-1", "NOORD", "R503", "BRAND-1"
  description: string;
  geographicDescription?: string;
  groupType: GroupType;
  isActive: boolean;
  leaderName?: string;
  leaderPhone?: string;
  memberUserIds: string[];
  activeMemberCount: number;
  
  // WhatsApp Broadcast & Dispatch Routing
  whatsappInviteLink?: string; // e.g. https://chat.whatsapp.com/...
  whatsappGroupJid?: string; // e.g. 12036304812903@g.us
  whatsappBroadcastType?: WhatsAppBroadcastType;
  priorityLevel?: GroupPriorityLevel;
  autoDispatchTriggers?: GroupAutoDispatchTriggers;
  muteNotifications?: boolean;
  sector?: string;
  coverageRadiusKm?: number;
  broadcastFrequencyLimit?: 'IMMEDIATE' | 'HOURLY_DIGEST' | 'DAILY_DIGEST';

  createdByUid: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
}

// Immutable Audit Log Record
export interface AuditLogEntry {
  id: string;
  action: string;
  recordType: 
    | 'USER_AUTH'
    | 'USER_PROFILE'
    | 'EMERGENCY'
    | 'SITUATION'
    | 'CASE'
    | 'CASE_UPDATE'
    | 'EVIDENCE'
    | 'BOLO'
    | 'BOLO_SIGHTING'
    | 'ALERT'
    | 'ASSISTANCE_REQUEST'
    | 'RESPONDER_STATUS'
    | 'ESCALATION'
    | 'INTELLIGENCE_POI'
    | 'INTELLIGENCE_VEHICLE'
    | 'ROLE_CLAIM'
    | 'GROUP'
    | 'GROUP_MEMBERSHIP'
    | 'SETTINGS'
    | 'SYSTEM'
    | 'SYSTEM_SETTINGS'
    | 'COMMUNICATION'
    | 'REPORT_GENERATION'
    | 'DATABASE_RESTORE'
    | 'SYSTEM_BACKUP'
    | 'DATA_IMPORT'
    | 'CONTACTS_IMPORT'
    | 'STORAGE_MAINTENANCE'
    | 'POPIA_PRIVACY'
    | 'TRAINING_MODE'
    | string;
  recordId: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// System Settings
export interface CommunityResponseConfig {
  enabled: boolean;
  initialResponderCount: number;
  escalationCount: number;
  acknowledgementTimeoutMinutes: number;
  defaultRadiusKm: number;
  maximumRadiusKm: number;
  escalationRadiusKm: number;
  minimumDesiredResponders: number;
}

export interface AlertConfig {
  defaultExpiryHours: {
    SECURITY: number;
    FIRE: number;
    TRAFFIC: number;
    BOLO: number;
    NOTICE: number;
    ASSISTANCE: number;
  };
  allowGroupAlerts: boolean;
  allowRadiusAlerts: boolean;
  emergencyNotificationBehaviour: string;
}

export interface PrivacyConfig {
  defaultLocationPrecision: LocationPrecision;
  allowExactEmergencyLocationSharing: boolean;
  allowResponderPhoneSharing: boolean;
  allowFarmNameSharing: boolean;
}

export interface EmergencyCommunicationsSettings {
  enableLiveAudio: boolean;
  enableLiveLocation: boolean;
  defaultLocationUpdateMode: 'STANDARD' | 'HIGH_PRIORITY';
  controlRoomPhoneNumber: string;
  policeDirectPhone: string;
  ambulanceDirectPhone: string;
  fireDirectPhone: string;
  audioSessionTimeoutMinutes: number;
  locationStaleThresholdSeconds: number;
  standardLocationIntervalSeconds: number;
  highPriorityLocationIntervalSeconds: number;
}

export type WhatsAppProviderType =
  | 'META_CLOUD_API'
  | 'TWILIO_WHATSAPP'
  | 'CUSTOM_GATEWAY'
  | 'SIMULATED_SANDBOX'
  | 'MANUAL_ONLY';

export interface WhatsAppApiSettings {
  isConfigured: boolean;
  provider: WhatsAppProviderType;
  apiUrl: string;
  phoneNumberId: string;
  wabaId?: string;
  accessToken?: string;
  webhookVerificationToken?: string;

  // Routing Numbers & Channels
  defaultReactionGroupNumber?: string;
  secondaryPoliceWhatsApp?: string;
  medicalDispatchWhatsApp?: string;
  fireProtectionWhatsApp?: string;
  managementAlertWhatsApp?: string;
  communityBroadcastChannelId?: string;

  // Automated Dispatch Trigger Options
  autoDispatchEmergency: boolean;
  autoDispatchBoloAlerts: boolean;
  autoDispatchSitrep?: boolean;
  autoDispatchCases?: boolean;
  autoDispatchWeatherWarning?: boolean;
  autoDispatchDrills?: boolean;

  // Message Formatting & Content Options
  language: 'BILINGUAL' | 'AFRIKAANS' | 'ENGLISH';
  includeGpsMapLink: boolean;
  includeWazeLink?: boolean;
  includeAccessDetails: boolean;
  includeFamilyMembers?: boolean;
  includeWaterPoints?: boolean;
  includeFirefightingEquipment?: boolean;
  includeDangerousAnimals?: boolean;
  includeClientVehicles?: boolean;
  customHeaderTitle?: string;
  customFooterNote?: string;

  // Transmission & Delivery Options
  rateLimitDelayMs?: number;
  enableRetryOnFailure?: boolean;
  maxRetryAttempts?: number;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  overrideQuietHoursForSos?: boolean;
  enableInteractiveResponseButtons?: boolean;
  autoSendAcknowledgeReceipt?: boolean;
}

export interface SystemSettings {
  communityName: string;
  emergencyHotlinePhone: string;
  policeDirectPhone: string;
  ambulanceDirectPhone: string;
  reactionForceContact: string;
  managementAlertContact: string;
  defaultSector: string;
  isWhatsAppApiConfigured: boolean;
  whatsAppConfig?: WhatsAppApiSettings;

  sapsContact?: string;
  ambulanceContact?: string;
  fireContact?: string;
  autoRecordAudio?: boolean;
  dataRetentionYears?: number;
  
  // Phase Management Configurations
  communityResponse: CommunityResponseConfig;
  alertsConfig: AlertConfig;
  privacyConfig: PrivacyConfig;
  communicationsConfig: EmergencyCommunicationsSettings;
  locationAreas?: LocationArea[];

  dailyReportSummary?: {
    date: string;
    content: string;
    publishedBy: string;
  };
}

// ==========================================
// LIVE EMERGENCY COMMUNICATIONS & LOCATION
// ==========================================

export type AudioSessionStatus =
  | 'REQUESTED'
  | 'STARTING'
  | 'ACTIVE'
  | 'INTERRUPTED'
  | 'ENDED'
  | 'FAILED';

export type AudioConnectionState =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'DISCONNECTED'
  | 'FAILED'
  | 'ENDED';

export interface AudioListener {
  uid: string;
  name: string;
  role: UserRole;
  joinedAt: string;
  leftAt?: string;
  isMuted?: boolean;
}

export interface AudioRecordingRecord {
  id: string;
  emergencyId: string;
  sessionRecordId?: string;
  timestamp: string;
  durationSeconds: number;
  sizeBytes: number;
  recordedByUid: string;
  recordedByName: string;
  recordedByRole: UserRole;
  audioBlobUrl?: string;
  audioDataUri?: string;
  mimeType: string;
  filename: string;
  label?: string;
  notes?: string;
  isEvidencePreserved?: boolean;
}

export interface AudioSessionRecord {
  id: string;
  emergencyId: string;
  clientUid: string;
  clientName: string;
  startedByUid: string;
  startedByName: string;
  startTime: string;
  endTime?: string;
  status: AudioSessionStatus;
  connectionState: AudioConnectionState;
  authorisedListeners: string[];
  activeListeners: AudioListener[];
  clientRequestedAudio: boolean;
  controlRoomRequestedAudio: boolean;
  clientResponseToRequest?: 'ACCEPTED' | 'DECLINED' | 'PENDING';
  failureReason?: string;
  lastHeartbeat: string;
  audioLevel?: number; // 0 to 100 relative spectrum energy for audio meter
  recordings?: AudioRecordingRecord[];
}

export type LocationMode = 'STANDARD' | 'HIGH_PRIORITY';

export interface EmergencyLocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  source: 'LIVE_STREAM' | 'MANUAL_FIX' | 'HIGH_PRIORITY_GPS' | 'FALLBACK';
  sequenceNumber: number;
  isStale?: boolean;
}

export interface EmergencyLocationSession {
  id: string;
  emergencyId: string;
  clientUid: string;
  clientName: string;
  sessionStart: string;
  sessionEnd?: string;
  locationMode: LocationMode;
  lastUpdate: string;
  connectionState: 'CONNECTING' | 'CONNECTED' | 'STALE' | 'DISCONNECTED' | 'ENDED';
  isActive: boolean;
  history: EmergencyLocationPoint[];
}

export type MessageDeliveryStatus =
  | 'QUEUED'
  | 'SENT_TO_BACKEND'
  | 'DELIVERED_TO_DEVICE'
  | 'OPENED'
  | 'FAILED'
  | 'UNKNOWN';

export type QuickMessageTag =
  | 'SAFE'
  | 'HIDING'
  | 'SUSPECT_LEFT'
  | 'VEHICLE_LEAVING'
  | 'FIRE_SPREADING'
  | 'NEED_MEDICAL'
  | 'CANT_SPEAK'
  | 'IN_DANGER'
  | 'SUSPECT_NEARBY'
  | 'NEED_POLICE'
  | 'NEED_AMBULANCE'
  | 'POLICE_CONTACTED'
  | 'HELP_ON_WAY'
  | 'STAY_PUT'
  | 'MOVE_SAFE'
  | 'DO_NOT_APPROACH'
  | 'CALL_CONTROL_ROOM'
  | 'OTHER';

export interface EmergencyMessageRecord {
  id: string;
  emergencyId: string;
  senderUid: string;
  senderName: string;
  senderRole: UserRole;
  messageType: 'QUICK_TEXT' | 'CUSTOM_TEXT' | 'CANT_SPEAK_ALERT' | 'OPERATIONAL_INSTRUCTION' | 'PHOTO_UPDATE';
  text: string;
  quickTag?: QuickMessageTag;
  photos?: string[];
  location?: { latitude: number; longitude: number; accuracy?: number };
  deliveryStatus: MessageDeliveryStatus;
  isSilentMode?: boolean;
  timestamp: string;
}

export type ReactionForceMethod = 'WHATSAPP' | 'PHONE' | 'INTERNAL' | 'OTHER';
export type ReactionForceStatus =
  | 'INITIATED'
  | 'SENT'
  | 'DELIVERED'
  | 'CONTACTED'
  | 'RESPONDING'
  | 'FAILED'
  | 'UNKNOWN';

export interface ReactionForceContactLog {
  id: string;
  emergencyId: string;
  contactId: string;
  contactName: string;
  targetPhone: string;
  method: ReactionForceMethod;
  timestamp: string;
  actorUid: string;
  actorName: string;
  status: ReactionForceStatus;
  notes?: string;
}

export interface CommunicationHealthState {
  backend: 'OK' | 'DEGRADED' | 'UNKNOWN';
  clientConnection: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  liveAudio: 'CONNECTED' | 'LOST' | 'OFF' | 'REQUESTED';
  liveLocation: 'CURRENT' | 'STALE' | 'OFF';
  whatsapp: 'CONFIGURED' | 'FAILED' | 'NOT_CONFIGURED';
}

// ==========================================
// PRODUCTION HARDENING & REPORTING MODELS
// ==========================================

export type ConfidentialityClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export type ReportType =
  | 'DAILY_SITUATION_REPORT'
  | 'WEEKLY_MANAGEMENT_REPORT'
  | 'MONTHLY_MANAGEMENT_REPORT'
  | 'CASE_REPORT'
  | 'EMERGENCY_REPORT'
  | 'BOLO_REPORT'
  | 'INTELLIGENCE_SUMMARY'
  | 'CONTROL_ROOM_PERFORMANCE_REPORT'
  | 'SECURITY_TREND_REPORT';

export type DateFilterOption =
  | 'TODAY'
  | 'LAST_24_HOURS'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'THIS_MONTH'
  | 'CUSTOM';

export interface DateRangeFilter {
  option: DateFilterOption;
  startDate?: string;
  endDate?: string;
}

export interface GeneratedReportRecord {
  id: string;
  reportType: ReportType;
  title: string;
  confidentiality: ConfidentialityClassification;
  dateRange: { start: string; end: string; filterOption: DateFilterOption };
  generatedTimestamp: string;
  generatedByUid: string;
  generatedByName: string;
  generatedByRole: UserRole;
  filtersUsed: Record<string, any>;
  pageCount: number;
  sampleSize: number;
  contentFormatted: string;
}

export interface ControlRoomPerformanceMetrics {
  emergenciesReceived: number;
  avgAckTimeSeconds: number;
  fastestAckSeconds: number;
  longestAckSeconds: number;
  unacknowledgedCount: number;
  callsInitiated: number;
  reactionForceNotified: number;
  managementNotified: number;
  casesCreatedFromEmergency: number;
  falseAlarms: number;
  closedEmergencies: number;
}

export type SystemHealthStatus = 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'UNKNOWN';

export interface SystemHealthComponent {
  id: string;
  name: string;
  category: 'DATABASE' | 'FUNCTIONS' | 'NOTIFICATIONS' | 'WHATSAPP' | 'AUDIO_MEDIA' | 'BACKUP' | 'AI_SERVICE';
  status: SystemHealthStatus;
  lastChecked: string;
  latencyMs?: number;
  errorCount: number;
  details: string;
}

export type ErrorSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SystemErrorLogEntry {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  subsystem:
    | 'BACKEND'
    | 'DATABASE'
    | 'PUSH_NOTIFICATIONS'
    | 'WHATSAPP'
    | 'AUDIO_WEBRTC'
    | 'AI_SERVICE'
    | 'EXPORT_BACKUP'
    | 'AUTH_SECURITY';
  message: string;
  details?: string;
  acknowledged?: boolean;
}

export interface BackupRecord {
  id: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MANUAL' | 'SCHEDULED' | 'PRE_DEPLOYMENT' | string;
  timestamp: string;
  sizeKb: number;
  itemCounts: {
    emergencies: number;
    cases: number;
    pois: number;
    vois: number;
    observations: number;
    auditLogs: number;
    users: number;
  };
  checksum: string;
  createdBy: string;
  status: 'VERIFIED' | 'PENDING' | 'CORRUPTED';
  storageBucket: string;
}

export interface PrivacyAccessLogEntry {
  id: string;
  timestamp: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  targetUserUid: string;
  targetUserName: string;
  dataType:
    | 'MEDICAL_DATA'
    | 'GATE_CODES'
    | 'FAMILY_DETAILS'
    | 'PRIVATE_PROFILE'
    | 'INTELLIGENCE_DOSSIER';
  operationalReason: string;
}

export interface TrainingModeState {
  enabled: boolean;
  startedAt?: string;
  startedBy?: string;
  activatedAt?: string;
  activatedByUid?: string;
  scenarioName?: string;
}

// ==========================================
// POPIA USER AGREEMENT & PRIVACY GOVERNANCE
// ==========================================

export type AgreementType =
  | 'USER_AGREEMENT'
  | 'PRIVACY_NOTICE'
  | 'COMMUNITY_SAFETY_RULES';

export interface UserAgreementRecord {
  id: string;
  userUid: string;
  agreementType: AgreementType;
  version: string;
  acceptedTimestamp: string;
  effectiveDate: string;
  acceptanceMethod: 'REGISTRATION_CHECKBOX' | 'RENEWAL_POPUP' | 'PROFILE_REAUTHORIZATION';
  ipHash?: string;
  userAgent?: string;
}

export interface AgreementDocumentVersion {
  id: string;
  type: AgreementType;
  version: string;
  title: string;
  titleAf: string;
  contentEn: string;
  contentAf: string;
  effectiveDate: string;
  isCurrent: boolean;
  publishedByUid: string;
  publishedAt: string;
  requiresReacceptance: boolean;
}

export type PrivacyRequestType =
  | 'ACCESS_DSAR'
  | 'CORRECTION'
  | 'DELETION_ANONYMIZATION'
  | 'OBJECTION_TO_PROCESSING'
  | 'REVOKE_CONSENT';

export interface PrivacyDataRequest {
  id: string;
  requestNumber: string; // e.g. "POPIA-2026-0012"
  userUid: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  requestType: PrivacyRequestType;
  description: string;
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED_LAWFUL_RETENTION';
  submittedAt: string;
  updatedAt: string;
  processedByUid?: string;
  processedByName?: string;
  resolutionNotes?: string;
  completedAt?: string;
}

export interface PrivacySecurityIncident {
  id: string;
  incidentNumber: string; // e.g. "INC-SEC-2026-004"
  reportedTimestamp: string;
  description: string;
  dataPotentiallyAffected: string[];
  usersPotentiallyAffected: string[];
  actionsTaken: string[];
  investigationNotes: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'REPORTED_TO_REGULATOR' | 'CLOSED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  responsibleManagerUid: string;
  responsibleManagerName: string;
  closedAt?: string;
}

// ==========================================
// UNIVERSAL GEOLOCATION & PHOTO MODELS
// ==========================================

export type LocationSource =
  | 'CURRENT_GPS'
  | 'MANUAL_MAP_PIN'
  | 'PROPERTY_LOCATION'
  | 'LAST_KNOWN'
  | 'OTHER';

export interface UniversalGeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: string;
  source: LocationSource;
  locationName?: string;
  googleMapsUrl?: string;
  isStale?: boolean;
  lastUpdatedSecondsAgo?: number;
}

export interface UniversalEvidencePhoto {
  id: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
  caption: string;
  uploadedByUid: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  linkedRecordType: 'CASE' | 'EMERGENCY' | 'OPERATION' | 'SITUATION' | 'BOLO' | 'MARKER';
  linkedRecordId: string;
  gpsLocation?: UniversalGeoLocation;
}

// ==========================================
// KML MAP OVERLAY & OPERATIONAL LAYERS
// ==========================================

export type KmlLayerCategory =
  | 'SECTOR_BOUNDARIES'
  | 'FARM_BOUNDARIES'
  | 'GRAVEL_ROADS'
  | 'SECTOR_PATROLS'
  | 'WATER_POINTS'
  | 'RADIO_REPEATERS'
  | 'FIREBREAKS'
  | 'GATES'
  | 'STAGING_POINTS'
  | 'HIGH_RISK_ZONES'
  | 'CUSTOM';

export interface KmlMapFeature {
  id: string;
  name: string;
  description?: string;
  featureType: 'Point' | 'LineString' | 'Polygon';
  coordinates: [number, number][] | [number, number];
  color?: string;
  icon?: string;
}

export interface KmlMapLayer {
  id: string;
  name: string;
  description: string;
  category: KmlLayerCategory;
  kmlContent?: string;
  features?: KmlMapFeature[];
  uploadedByUid: string;
  uploadedByName: string;
  uploadedAt: string;
  version?: string | number;
  isActive: boolean;
  visibilityRoles: UserRole[];
  colorHex?: string;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  placemarkCount?: number;
  featureCount?: number;
}

// ==========================================
// FIELD OPERATIONS & REACTION FORCE COORDINATION
// ==========================================

export type FieldOperationType =
  | 'EMERGENCY_RESPONSE'
  | 'SEARCH_AND_RESCUE'
  | 'SUSPICIOUS_ACTIVITY'
  | 'FIRE_CONTAINMENT'
  | 'PATROL_SWEEP'
  | 'BOLO_INTERCEPTION'
  | 'FARM_ATTACK_RESPONSE'
  | 'STOCK_THEFT_TRACKING'
  | 'PLANNED_TACTICAL'
  | 'OTHER';

export type OperationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FieldOperationStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type ResponderAssignmentStatus = 'ASSIGNED' | 'ACCEPTED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED' | 'UNAVAILABLE';

export interface OperationResponderAssignment {
  id: string;
  operationId: string;
  responderUid: string;
  responderName: string;
  callsign: string;
  vehicleReg?: string;
  phone: string;
  status: ResponderAssignmentStatus;
  assignedAt: string;
  acceptedAt?: string;
  enRouteAt?: string;
  onSceneAt?: string;
  completedAt?: string;
  statusNotes?: string;
  currentLocation?: UniversalGeoLocation;
  lastPingSecondsAgo?: number;
  batteryLevel?: number;
}

export type OperationalMarkerType =
  | 'SUSPECT_SEEN'
  | 'VEHICLE_SEEN'
  | 'EVIDENCE'
  | 'FENCE_CUT'
  | 'FIRE'
  | 'ROAD_BLOCK'
  | 'ENTRY_POINT'
  | 'EXIT_POINT'
  | 'STAGING_POINT'
  | 'WATER_POINT'
  | 'COMMAND_POST'
  | 'OTHER';

export interface OperationalMarker {
  id: string;
  operationId?: string;
  type: OperationalMarkerType;
  title: string;
  description: string;
  location: UniversalGeoLocation;
  createdTimestamp: string;
  createdByUid: string;
  createdByName: string;
  createdByRole: UserRole;
  photoUrl?: string;
  photoCaption?: string;
  isCorrected?: boolean;
  originalLocation?: UniversalGeoLocation;
  correctionReason?: string;
}

export interface OperationChatMessage {
  id: string;
  operationId: string;
  senderUid: string;
  senderName: string;
  senderRole: UserRole;
  callsign?: string;
  timestamp: string;
  message: string;
  isUrgentPriority?: boolean;
  urgentType?: 'NEED_ASSISTANCE' | 'MEDICAL_REQUIRED' | 'SUSPECT_MOVING' | 'ROAD_BLOCKED' | 'FIRE_SPREADING';
  photoUrl?: string;
  photoCaption?: string;
  location?: UniversalGeoLocation;
  quickStatusUpdate?: string;
}

export interface OperationTimelineEvent {
  id: string;
  operationId: string;
  timestamp: string;
  eventType: string;
  description: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
}

export interface Operation {
  id: string;
  operationNumber: string; // e.g. "OP-2026-008"
  title: string;
  type: FieldOperationType;
  description: string;
  priority: OperationPriority;
  status: FieldOperationStatus;
  startTime: string;
  endTime?: string;
  
  location: UniversalGeoLocation;
  stagingPoint?: {
    name: string;
    location: UniversalGeoLocation;
    instructions?: string;
  };
  
  originType: 'EMERGENCY' | 'CASE' | 'FIRE' | 'BOLO' | 'SITUATION_REPORT' | 'PLANNED_TACTICAL' | 'OTHER';
  originId?: string;
  relatedEmergencyId?: string;
  relatedCaseId?: string;
  relatedBoloId?: string;
  relatedSituationId?: string;
  
  assignedResponders: OperationResponderAssignment[];
  controlRoomOperatorUid: string;
  controlRoomOperatorName: string;
  
  markers: OperationalMarker[];
  photos: UniversalEvidencePhoto[];
  timeline: OperationTimelineEvent[];
  chatMessages: OperationChatMessage[];
  
  operationalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// SOS LIVE EMERGENCY MEDIA SESSION
// ==========================================

export interface EmergencyMediaSessionState {
  emergencyId: string;
  sessionActive: boolean;
  audioActive: boolean;
  cameraActive: boolean;
  activeCamera: 'front' | 'rear';
  requestedByControlRoom: boolean;
  clientConsentGiven: boolean;
  sessionStartedAt?: string;
  isRecording: boolean; // default false (recording forbidden by default)
  activeListeners: { uid: string; name: string; role: UserRole; joinedAt: string }[];
}

// ==========================================
// CAMERA NETWORK, HEALTH & MAINTENANCE TYPES
// ==========================================

export type CameraType =
  | 'LPR_ANPR'
  | 'ALPR'
  | 'PTZ_DOME'
  | 'FIXED_BULLET'
  | 'PERIMETER_THERMAL'
  | 'SOLAR_REPEATER_CAM'
  | 'INTERSECTION_OVERVIEW'
  | 'GATE_ACCESS_CAM'
  | 'IP_CAM'
  | 'NVR'
  | 'LINK'
  | 'ACS'
  | 'PC'
  | 'PEPPER_SPRAY';

export type CameraStatus =
  | 'ONLINE'        // Camera active, stream reachable, low latency
  | 'DEGRADED'      // High latency, intermittent stream, lens obscured / dirty
  | 'ERROR'         // Stream offline, signal dropped, critical tamper/power error
  | 'OFFLINE'       // Completely unreachable / no ping / power dead
  | 'MAINTENANCE';  // Under active maintenance, calibration or technician servicing

export type CameraPowerSource =
  | 'SOLAR_BATTERY'
  | 'GRID_220V'
  | 'POE_NETWORK'
  | 'UPS_BACKUP'
  | 'HYBRID_SOLAR_GRID'
  | 'SOLAR_LITHIUM'
  | 'SOLAR_GEL'
  | 'MAINS'
  | 'SOLAR'
  | 'BATTERY'
  | 'POE'
  | string;

export type CameraConnection =
  | 'CELLULAR_4G_5G'
  | 'WIRELESS_MESH'
  | 'FIBRE_OPTIC'
  | 'RADIO_LINK_5GHZ';

export type ConnectionType = CameraConnection;

export type CameraSector =
  | 'R503_ARTERIAL'
  | 'R30_ARTERIAL'
  | 'SEKTOR_1_SUID'
  | 'SEKTOR_2_OOS'
  | 'SEKTOR_3_WES'
  | 'SEKTOR_4_NOORD'
  | 'TOWN_CBD'
  | string;

export type CameraErrorCategory =
  | 'RTSP_STREAM_DOWN'
  | 'SIGNAL_LOSS_PING_FAIL'
  | 'SOLAR_BATTERY_LOW'
  | 'NIGHT_IR_FAIL'
  | 'LENS_DIRTY_OBSCURED'
  | 'PTZ_MOTOR_STUCK'
  | 'TAMPER_VANDALISM'
  | 'LIGHTNING_SURGE'
  | 'SIM_DATA_EXHAUSTED'
  | 'HARDWARE_OVERHEAT'
  | 'FIRMWARE_CRASH'
  | 'OTHER';

export type CameraErrorSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EscalationLevel =
  | 'LEVEL_1_OPERATOR_MONITOR'
  | 'LEVEL_2_LOCAL_PATROL_CHECK'
  | 'LEVEL_3_TECHNICIAN_DISPATCH'
  | 'LEVEL_4_MANAGEMENT_VENDOR_ESCALATION';

export interface CameraErrorLog {
  id: string;
  cameraId: string;
  cameraName: string;
  category: CameraErrorCategory;
  severity: CameraErrorSeverity;
  title: string;
  description: string;
  loggedAt: string;
  loggedByUid: string;
  loggedByName: string;
  loggedByRole: UserRole;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedByUid?: string;
  resolvedByName?: string;
  resolutionNotes?: string;
  isEscalated: boolean;
  escalationLevel?: EscalationLevel;
  escalatedTo?: string; // e.g. "Kobus Venter (Solar & Radio Tech)", "Sector 2 Patrol", "Management"
  escalatedAt?: string;
  escalationNotes?: string;
  whatsappAlertSent?: boolean;
}

export type MaintenanceTicketStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PARTS_PENDING'
  | 'ESCALATED';

export type MaintenanceType =
  | 'ROUTINE_INSPECTION'
  | 'LENS_SOLAR_CLEANING'
  | 'BATTERY_REPLACEMENT'
  | 'LPR_RECALIBRATION'
  | 'FIRMWARE_UPGRADE'
  | 'HARDWARE_REPAIR'
  | 'SIM_RELOAD'
  | 'EMERGENCY_REPAIR';

export interface CameraMaintenanceTicket {
  id: string;
  ticketNumber: string; // e.g. "MNT-2026-042"
  cameraId: string;
  cameraName: string;
  sector: string;
  type: MaintenanceType;
  status: MaintenanceTicketStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  assignedTechnicianName: string;
  assignedTechnicianPhone?: string;
  scheduledDate: string;
  completedDate?: string;
  description: string;
  checklist: {
    lensCleaned: boolean;
    solarPanelCleaned: boolean;
    batteryVoltageChecked: boolean;
    nightVisionIRVerified: boolean;
    ptzCalibrated: boolean;
    simDataChecked: boolean;
    housingSealsInspected: boolean;
    backupRecordingVerified: boolean;
  };
  partsReplaced?: string;
  estimatedCostZAR?: number;
  actualCostZAR?: number;
  invoiceOrJobCardNumber?: string;
  notes?: string;
  reportedErrorLogId?: string;
  createdAt: string;
  createdByUid: string;
  createdByName: string;
  updatedAt: string;
}

export interface PortScanResult {
  port: number;
  service: string;
  protocol: 'TCP' | 'UDP';
  status: 'OPEN' | 'CLOSED' | 'FILTERED';
  responseTimeMs?: number;
}

export interface NetworkTracerouteHop {
  hopNumber: number;
  ip: string;
  hostName: string;
  latencyMs: number;
  status: 'REACHABLE' | 'DEGRADED' | 'TIMEOUT';
}

export interface DiagnosticMetrics {
  dnsLookupMs?: number;
  tcpHandshakeMs?: number;
  rtspStreamState?: 'HEALTHY' | 'UNSTABLE' | 'OFFLINE';
  bitrateKbps?: number;
  jitterMs?: number;
  openPorts?: number[];
  closedPorts?: number[];
  pingHistory?: { timestamp: string; latencyMs: number; packetLoss: number }[];
  traceroute?: NetworkTracerouteHop[];
  portsScanned?: PortScanResult[];
  lastFullDiagnostic?: string;
  bandwidthMbps?: number;
}

export interface CameraDevice {
  id: string;
  name: string; // e.g. "R503 North Entry ANPR"
  code: string; // e.g. "CAM-N01" or "H44"
  sector: string; // e.g. "Sector 1 (North/R503)"
  farmOrLandmark?: string; // e.g. "Welgevonden T-Junction"
  locationDescription?: string;
  type: CameraType;
  status: CameraStatus;
  ipAddress: string; // e.g. "10.10.10.13" or "ae850bd67278.sn.mynetname.net"
  httpPort?: number; // e.g. 80, 81, 82, 91, 155, 383
  altPort?: number; // e.g. 8000, 8008, 9001, 9083
  webUrl?: string; // e.g. "http://10.10.10.13:80"
  rtspUrl?: string; // e.g. "rtsp://admin:****@10.10.10.13:554/live/ch0"
  model: string; // e.g. "TVT ALPR" | "HIK7 ALPR" | "HIK ANPR" | "NVR"
  serialNumber?: string;
  firmwareVersion?: string;
  powerSource: CameraPowerSource;
  batteryVoltage?: number; // e.g. 13.8V
  batteryCapacityAh?: number;
  lprReadRatePercent?: number;
  macAddress?: string;
  rtspPort?: number;
  latitude?: number;
  longitude?: number;
  simCardNumber?: string;
  previewImageUrl?: string;
  streamUrl?: string;
  connectionType: CameraConnection;
  signalStrengthDbm?: number; // e.g. -68 dBm
  latencyMs?: number; // e.g. 42 ms
  packetLossPercent?: number; // e.g. 0.0%
  fps?: number; // e.g. 25
  resolution?: string; // e.g. "4K (3840x2160)" or "1080p"
  lprAccuracyRate?: number; // e.g. 98.4%
  hasNightVisionIR?: boolean;
  hasPTZ?: boolean;
  isPTZ?: boolean;
  hasSolarKit?: boolean;
  gpsLocation?: { latitude: number; longitude: number };
  installDate?: string;
  lastMaintenanceDate?: string;
  nextScheduledMaintenance?: string;
  lastHeartbeat?: string;
  lastPingTime?: string;
  activeErrorCount: number;
  openTicketCount: number;
  notes?: string;
  thumbnailUrl?: string;
  networkSubnet?: string; // e.g. "10.10.10.x Local Management", "192.168.3.x N12 Corridor", "sn.mynetname.net Dynamic DDNS"
  diagnosticMetrics?: DiagnosticMetrics;
}

// Live Reaction Force Responder & Member Patrol Location Feed
export interface ResponderLocationFeed {
  responderId: string;
  responderName: string;
  callsign: string;
  role: string;
  phone: string;
  vehicle?: string;
  radioChannel?: string;
  emergencyId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: string;
  heading?: number;
  battery?: string;
  status: 'STANDBY' | 'RESPONDING' | 'ON_SCENE' | 'PATROLLING' | 'DISPATCHED' | 'EN_ROUTE' | 'OFF_DUTY';
  isLiveTrackingActive: boolean;
  lastUpdated: string;
}

export interface ActivePatrolUnit {
  id: string;
  uid: string;
  name: string;
  callsign: string;
  role: string;
  userRole: UserRole;
  sector?: string;
  phone?: string;
  vehicle?: string;
  radioChannel?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: string;
  heading?: number;
  battery?: string;
  status: 'PATROLLING' | 'STANDBY' | 'RESPONDING' | 'ON_SCENE' | 'OFF_DUTY';
  isLiveTrackingActive: boolean;
  startedAt: string;
  lastUpdated: string;
  notes?: string;
  trailHistory?: { latitude: number; longitude: number; timestamp: string }[];
}



