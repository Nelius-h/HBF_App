import { BackupRecord } from '../types';

export interface RetentionPolicy {
  dataCategory: string;
  retentionPeriodDescription: string;
  retentionDays: number;
  statutoryBasis: string;
  autoPurgeEligible: boolean;
}

export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    dataCategory: 'User Profiles & Contact Details',
    retentionPeriodDescription: 'Duration of active community membership + 12 months after deactivation',
    retentionDays: 365,
    statutoryBasis: 'POPIA Section 14 (Retention for purpose only)',
    autoPurgeEligible: false,
  },
  {
    dataCategory: 'Emergency Logs & Dispatch Recordings',
    retentionPeriodDescription: '5 years from resolution date',
    retentionDays: 1825,
    statutoryBasis: 'Criminal Procedure & Emergency Liability Defense',
    autoPurgeEligible: false,
  },
  {
    dataCategory: 'SAPS Linked Crime Cases & Evidence',
    retentionPeriodDescription: 'Permanent or 10 years after closure',
    retentionDays: 3650,
    statutoryBasis: 'Criminal Procedure Act & Lawful Evidence Retention',
    autoPurgeEligible: false,
  },
  {
    dataCategory: 'BOLOs & Temporary Alerts',
    retentionPeriodDescription: '90 days after cancellation/closure',
    retentionDays: 90,
    statutoryBasis: 'Operational Relevance & POPIA Proportionality',
    autoPurgeEligible: true,
  },
  {
    dataCategory: 'Live GPS Breadcrumb History',
    retentionPeriodDescription: '30 days after emergency closed (Summary retained permanently)',
    retentionDays: 30,
    statutoryBasis: 'Privacy minimization & Bandwidth Optimization',
    autoPurgeEligible: true,
  },
  {
    dataCategory: 'System & Security Audit Logs',
    retentionPeriodDescription: '7 years immutable append-only',
    retentionDays: 2555,
    statutoryBasis: 'Cybercrimes Act & POPIA Audit Accountability',
    autoPurgeEligible: false,
  },
  {
    dataCategory: 'Training & Simulated Drills',
    retentionPeriodDescription: '180 days',
    retentionDays: 180,
    statutoryBasis: 'Training quality assurance',
    autoPurgeEligible: true,
  },
];

export interface DisasterRecoveryRunbook {
  id: string;
  incidentType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  rpo: string; // Recovery Point Objective
  rto: string; // Recovery Time Objective
  rootCauses: string[];
  immediateContainment: string[];
  recoverySteps: string[];
  postIncidentVerification: string[];
}

export const DISASTER_RECOVERY_RUNBOOKS: DisasterRecoveryRunbook[] = [
  {
    id: 'DR-01',
    incidentType: 'Firestore Database Corruption / Data Loss',
    severity: 'CRITICAL',
    rpo: '1 Hour (Hourly differential backups)',
    rto: '< 15 Minutes',
    rootCauses: ['Accidental bulk deletion', 'Faulty migration script', 'Cloud region disruption'],
    immediateContainment: [
      'Lock client write permissions in firestore.rules (set maintenance mode banner).',
      'Notify Control Room on 2-way Radio Channel 2 to operate from cached offline roster.',
    ],
    recoverySteps: [
      'Access Google Cloud Platform (GCP) Console > Firestore > Import/Export.',
      'Select latest verified automated backup snapshot from gs://hartbeesfontein-backups-prod/.',
      'Execute point-in-time recovery (PITR) to target collection namespace.',
      'Validate document count parity and checksum hashes before unlocking live traffic.',
    ],
    postIncidentVerification: [
      'Perform test emergency trigger from Operator test harness.',
      'Confirm audit log immutability and user profile integrity.',
      'Issue All-Clear advisory to Management Committee.',
    ],
  },
  {
    id: 'DR-02',
    incidentType: 'Cloud Storage & Evidence Loss',
    severity: 'HIGH',
    rpo: '24 Hours (Daily cold storage replication)',
    rto: '< 30 Minutes',
    rootCauses: ['Bucket lifecycle policy misconfiguration', 'Accidental attachment overwrite'],
    immediateContainment: ['Disable automated retention purge triggers.'],
    recoverySteps: [
      'Restore evidence attachments from secondary geo-redundant bucket (Cape Town / Johannesburg dual-region).',
      'Run image URL integrity audit script across all Case and Observation records.',
    ],
    postIncidentVerification: ['Check that photo attachments in open BOLOs and Cases render properly.'],
  },
  {
    id: 'DR-03',
    incidentType: 'Security Rules Regression / Unauthorized Role Escalation',
    severity: 'CRITICAL',
    rpo: '0 Seconds (Rule rollback)',
    rto: '< 5 Minutes',
    rootCauses: ['Flawed rule deployment', 'Relaxed client permissions'],
    immediateContainment: [
      'Immediately redeploy the hardened fallback firestore.rules using Firebase CLI.',
      'Terminate all active client auth tokens via Firebase Auth session revocation.',
    ],
    recoverySteps: [
      'Run security test runner (`security_spec.md` verification suite).',
      'Audit all writes made during the regression window for anomalous role changes.',
      'Re-authenticate Control Room operators and Management.',
    ],
    postIncidentVerification: ['Verify that Client accounts receive permission-denied for intel and admin records.'],
  },
  {
    id: 'DR-04',
    incidentType: 'WhatsApp Business API Outage / Push Notification Failure',
    severity: 'HIGH',
    rpo: 'N/A (Transient message queue)',
    rto: 'Instant (Automatic Failover)',
    rootCauses: ['Meta Cloud API outage', 'FCM push gateway downtime', 'Cellular tower congestion'],
    immediateContainment: [
      'System automatically switches dispatch status to REQUIRES_MANUAL_WHATSAPP.',
      'Control Room UI displays one-click WhatsApp web / phone call launchpad.',
    ],
    recoverySteps: [
      'Operators initiate direct cellular phone calls to Reaction Unit Commanders.',
      'Broadcast verbal voice alerts on 2-way Radio Channel 1 and 2.',
    ],
    postIncidentVerification: ['Confirm manual phone log recorded in emergency timeline.'],
  },
  {
    id: 'DR-05',
    incidentType: 'Management Admin Account Compromise / Lost Phone',
    severity: 'CRITICAL',
    rpo: 'Immediate',
    rto: '< 3 Minutes',
    rootCauses: ['Lost or stolen smartphone', 'Phishing or credential theft'],
    immediateContainment: [
      'Second Management user accesses User Security Console.',
      'Execute "One-Click Lost Device Containment" for compromised UID.',
      'Instantly demote role to CLIENT and disable isActive state.',
    ],
    recoverySteps: [
      'Revoke all active Firebase Auth refresh tokens.',
      'Review audit log for actions performed in the last 2 hours.',
      'Re-issue secure account credentials upon verified physical identity confirmation.',
    ],
    postIncidentVerification: ['Check audit trail confirms account disabled and tokens revoked.'],
  },
];

export const DEFAULT_BACKUP_RECORDS: BackupRecord[] = [
  {
    id: 'BKP-2026-08-19-0300',
    type: 'DAILY',
    timestamp: '2026-08-19T03:00:00Z',
    sizeKb: 14820,
    itemCounts: {
      emergencies: 48,
      cases: 26,
      pois: 14,
      vois: 12,
      observations: 38,
      auditLogs: 194,
      users: 142,
    },
    checksum: 'sha256:7f9a88c42b109e88d6174a98402bce0a112233445566778899aabbccddeeff00',
    createdBy: 'SYSTEM_SCHEDULER',
    status: 'VERIFIED',
    storageBucket: 'gs://hartbeesfontein-backups-prod/daily/2026-08-19.json.gz',
  },
  {
    id: 'BKP-2026-08-18-0300',
    type: 'DAILY',
    timestamp: '2026-08-18T03:00:00Z',
    sizeKb: 14450,
    itemCounts: {
      emergencies: 46,
      cases: 25,
      pois: 14,
      vois: 12,
      observations: 34,
      auditLogs: 182,
      users: 141,
    },
    checksum: 'sha256:3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    createdBy: 'SYSTEM_SCHEDULER',
    status: 'VERIFIED',
    storageBucket: 'gs://hartbeesfontein-backups-prod/daily/2026-08-18.json.gz',
  },
  {
    id: 'BKP-2026-08-15-0000',
    type: 'WEEKLY',
    timestamp: '2026-08-15T00:00:00Z',
    sizeKb: 13980,
    itemCounts: {
      emergencies: 44,
      cases: 23,
      pois: 13,
      vois: 11,
      observations: 30,
      auditLogs: 160,
      users: 140,
    },
    checksum: 'sha256:99887766554433221100aabbccddeeff112233445566778899aabbccddeeff22',
    createdBy: 'SYSTEM_SCHEDULER',
    status: 'VERIFIED',
    storageBucket: 'gs://hartbeesfontein-backups-prod/weekly/2026-W33.json.gz',
  },
  {
    id: 'BKP-2026-08-01-0000',
    type: 'MONTHLY',
    timestamp: '2026-08-01T00:00:00Z',
    sizeKb: 12500,
    itemCounts: {
      emergencies: 38,
      cases: 19,
      pois: 10,
      vois: 8,
      observations: 22,
      auditLogs: 120,
      users: 135,
    },
    checksum: 'sha256:bbccddeeff00112233445566778899aabbccddeeff00112233445566778899aa',
    createdBy: 'SYSTEM_SCHEDULER',
    status: 'VERIFIED',
    storageBucket: 'gs://hartbeesfontein-backups-prod/monthly/2026-08.json.gz',
  },
];
