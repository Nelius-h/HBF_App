import { CameraDevice, CameraErrorLog, CameraMaintenanceTicket } from '../types';
import { PRODUCTION_CAMERA_INVENTORY } from './actualCameraInventory';

export const INITIAL_CAMERAS: CameraDevice[] = PRODUCTION_CAMERA_INVENTORY;

export const INITIAL_CAMERA_ERRORS: CameraErrorLog[] = [
  {
    id: 'ERR-2026-001',
    cameraId: 'CAM-H44',
    cameraName: 'H44 Lapfontein',
    severity: 'MEDIUM',
    category: 'SIGNAL_LOSS_PING_FAIL',
    title: 'Intermittent 5.8GHz Link Latency Jitter',
    description: 'Ping latency jitter observed between repeater mast and Lapfontein ALPR during heavy rain.',
    loggedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    loggedByUid: 'USR-MGMT-ADMIN',
    loggedByName: 'Cornelius Hattingh',
    loggedByRole: 'MANAGEMENT',
    isResolved: false,
    isEscalated: true,
    escalationLevel: 'LEVEL_3_TECHNICIAN_DISPATCH',
    escalatedTo: 'Tegniese Span (Cornelius Hattingh)',
    escalatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    escalationNotes: 'Mikrotik Wireless link requires antenna realignment and RSSI check.',
    whatsappAlertSent: true,
  },
  {
    id: 'ERR-2026-002',
    cameraId: 'CAM-H25',
    cameraName: 'H25 N12 Ysterspruit T',
    severity: 'LOW',
    category: 'LENS_DIRTY_OBSCURED',
    title: 'Spider Web / Dust on IR Lens',
    description: 'Minor optical scatter during night IR illumination.',
    loggedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    loggedByUid: 'USR-MGMT-ADMIN',
    loggedByName: 'Cornelius Hattingh',
    loggedByRole: 'MANAGEMENT',
    isResolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    resolvedByUid: 'USR-MGMT-ADMIN',
    resolvedByName: 'Cornelius Hattingh',
    resolutionNotes: 'Cleaned during patrol route stop by reaction officer.',
    isEscalated: false,
  },
];

export const INITIAL_CAMERA_TICKETS: CameraMaintenanceTicket[] = [
  {
    id: 'MNT-2026-041',
    ticketNumber: 'MNT-2026-041',
    cameraId: 'CAM-H44',
    cameraName: 'H44 Lapfontein',
    sector: 'Sector Lapfontein',
    type: 'ROUTINE_INSPECTION',
    status: 'SCHEDULED',
    priority: 'NORMAL',
    assignedTechnicianName: 'Cornelius Hattingh (Tegniese Span)',
    assignedTechnicianPhone: '+27 82 306 5808',
    scheduledDate: new Date().toISOString().split('T')[0],
    description: 'Check 5.8GHz dish alignment and clean solar panels at Lapfontein pole.',
    checklist: {
      lensCleaned: true,
      solarPanelCleaned: true,
      batteryVoltageChecked: true,
      nightVisionIRVerified: true,
      ptzCalibrated: true,
      simDataChecked: true,
      housingSealsInspected: true,
      backupRecordingVerified: true,
    },
    estimatedCostZAR: 450,
    notes: 'Routine alignment scheduled.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdByUid: 'USR-MGMT-ADMIN',
    createdByName: 'Cornelius Hattingh',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_MAINTENANCE_TICKETS = INITIAL_CAMERA_TICKETS;
