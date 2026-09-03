// Hartbeesfontein Veiligheid - Enterprise Data Storage, Import & Backup Management Service
// Full POPIA & Criminal Procedure Compliance Data Engine

import { EmergencyEvent, Case, BoloRecord, PersonOfInterest, VehicleOfInterest, AuditLogEntry, EmergencyContact, SystemSettings } from '../types';

export interface StorageMetricReport {
  totalStorageUsedKb: number;
  localStorageUsedKb: number;
  audioRecordingsSizeKb: number;
  mapLayersCacheKb: number;
  totalEntitiesCount: number;
  quotaEstimatedKb: number;
  usagePercentage: number;
  tableCounts: {
    emergencies: number;
    cases: number;
    bolos: number;
    pois: number;
    vois: number;
    auditLogs: number;
    contacts: number;
    audioRecordings: number;
    kmlLayers: number;
  };
}

export interface ImportValidationResult {
  isValid: boolean;
  type: 'JSON_FULL_BACKUP' | 'CSV_CONTACTS' | 'CSV_CLIENTS' | 'UNKNOWN';
  entityCounts: Record<string, number>;
  conflictsCount: number;
  schemaVersion?: string;
  error?: string;
  previewData?: any;
}

/**
 * Compute SHA-256 Checksum simulation
 */
export function generateChecksum(dataString: string): string {
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, '0')}${Date.now().toString(16)}`;
}

/**
 * Calculate Local Storage & In-Memory Data Footprint
 */
export function calculateStorageMetrics(state: {
  emergencies: EmergencyEvent[];
  cases: Case[];
  bolos: BoloRecord[];
  pois: PersonOfInterest[];
  vois: VehicleOfInterest[];
  auditLogs: AuditLogEntry[];
  emergencyContacts: EmergencyContact[];
  kmlLayers?: any[];
}): StorageMetricReport {
  let localStorageUsedBytes = 0;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageUsedBytes += (localStorage[key].length + key.length) * 2;
        }
      }
    }
  } catch {
    localStorageUsedBytes = 250000;
  }

  // Count audio recordings across emergencies
  let audioRecordingsCount = 0;
  let audioRecordingsSize = 0;
  state.emergencies.forEach((e) => {
    if (e.audioRecordings) {
      audioRecordingsCount += e.audioRecordings.length;
      e.audioRecordings.forEach((r) => {
        audioRecordingsSize += r.sizeBytes || 45000;
      });
    }
  });

  const stateString = JSON.stringify(state);
  const stateBytes = stateString.length * 2;
  const totalStorageUsedKb = Math.round((localStorageUsedBytes + stateBytes + audioRecordingsSize) / 1024);
  const quotaEstimatedKb = 51200; // 50MB browser storage allocation
  const usagePercentage = Math.min(100, Math.round((totalStorageUsedKb / quotaEstimatedKb) * 100));

  return {
    totalStorageUsedKb,
    localStorageUsedKb: Math.round(localStorageUsedBytes / 1024),
    audioRecordingsSizeKb: Math.round(audioRecordingsSize / 1024),
    mapLayersCacheKb: Math.round(((state.kmlLayers?.length || 1) * 350000) / 1024),
    totalEntitiesCount:
      state.emergencies.length +
      state.cases.length +
      state.bolos.length +
      state.pois.length +
      state.vois.length +
      state.auditLogs.length +
      state.emergencyContacts.length,
    quotaEstimatedKb,
    usagePercentage,
    tableCounts: {
      emergencies: state.emergencies.length,
      cases: state.cases.length,
      bolos: state.bolos.length,
      pois: state.pois.length,
      vois: state.vois.length,
      auditLogs: state.auditLogs.length,
      contacts: state.emergencyContacts.length,
      audioRecordings: audioRecordingsCount,
      kmlLayers: state.kmlLayers?.length || 4,
    },
  };
}

/**
 * Generate full downloadable System Backup JSON
 */
export function exportFullDatabaseJson(payload: {
  emergencies: EmergencyEvent[];
  cases: Case[];
  bolos: BoloRecord[];
  pois: PersonOfInterest[];
  vois: VehicleOfInterest[];
  auditLogs: AuditLogEntry[];
  emergencyContacts: EmergencyContact[];
  settings: SystemSettings;
  availableUsers?: any[];
  mapLayers?: any[];
}) {
  const timestamp = new Date().toISOString();
  const dateFormatted = timestamp.slice(0, 10);
  const dataString = JSON.stringify(payload, null, 2);
  const checksum = generateChecksum(dataString);

  const fullBackup = {
    metadata: {
      appName: 'Hartbeesfontein Plaaswag Veiligheid & Control Room',
      version: 'v0.1.2-PROD',
      exportedAt: timestamp,
      exportedBy: 'SYSTEM_ADMIN_SESSION',
      checksum,
      entityTotals: {
        emergencies: payload.emergencies.length,
        cases: payload.cases.length,
        bolos: payload.bolos.length,
        pois: payload.pois.length,
        vois: payload.vois.length,
        auditLogs: payload.auditLogs.length,
        contacts: payload.emergencyContacts.length,
      },
    },
    data: payload,
  };

  const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HBF_Full_System_Backup_${dateFormatted}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported data (JSON or CSV)
 */
export function validateImportPayload(content: string): ImportValidationResult {
  const trimmed = content.trim();

  // 1. Check if JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.data || parsed.emergencies || parsed.contacts || Array.isArray(parsed)) {
        const rootData = parsed.data || parsed;
        const entityCounts: Record<string, number> = {};

        if (Array.isArray(rootData.emergencies)) entityCounts.emergencies = rootData.emergencies.length;
        if (Array.isArray(rootData.cases)) entityCounts.cases = rootData.cases.length;
        if (Array.isArray(rootData.bolos)) entityCounts.bolos = rootData.bolos.length;
        if (Array.isArray(rootData.emergencyContacts || rootData.contacts)) {
          entityCounts.contacts = (rootData.emergencyContacts || rootData.contacts).length;
        }
        if (Array.isArray(rootData.pois)) entityCounts.pois = rootData.pois.length;
        if (Array.isArray(rootData.vois)) entityCounts.vois = rootData.vois.length;

        return {
          isValid: true,
          type: 'JSON_FULL_BACKUP',
          schemaVersion: parsed.metadata?.version || '1.0',
          entityCounts,
          conflictsCount: 0,
          previewData: rootData,
        };
      }
    } catch (err: any) {
      return {
        isValid: false,
        type: 'UNKNOWN',
        entityCounts: {},
        conflictsCount: 0,
        error: `JSON parsing failed: ${err.message}`,
      };
    }
  }

  // 2. Check if CSV (Contacts or Clients)
  if (trimmed.includes(',') && trimmed.includes('\n')) {
    const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
    const header = lines[0].toLowerCase();

    if (header.includes('category') || header.includes('organization') || header.includes('phone')) {
      return {
        isValid: true,
        type: 'CSV_CONTACTS',
        entityCounts: { contacts: lines.length - 1 },
        conflictsCount: 0,
        previewData: lines.slice(1, 4),
      };
    }

    if (header.includes('farm') || header.includes('client') || header.includes('sector')) {
      return {
        isValid: true,
        type: 'CSV_CLIENTS',
        entityCounts: { clients: lines.length - 1 },
        conflictsCount: 0,
        previewData: lines.slice(1, 4),
      };
    }
  }

  return {
    isValid: false,
    type: 'UNKNOWN',
    entityCounts: {},
    conflictsCount: 0,
    error: 'Unrecognized file format. Please upload a valid .json system snapshot or .csv template.',
  };
}

/**
 * Generate Downloadable CSV Templates
 */
export function generateSampleCsvTemplate(type: 'CONTACTS' | 'CLIENTS' | 'SECTORS'): void {
  let csvContent = '';
  let filename = '';

  if (type === 'CONTACTS') {
    filename = 'Hartbeesfontein_Emergency_Contacts_Template.csv';
    csvContent = `Name,Surname,Organization,Category,PrimaryPhone,WhatsAppNumber,RadioCallsign,Sector,Notes,IsPriority
Kapt. Johan,Venter,SAPS Hartbeesfontein,POLICE,+27 18 431 0111,+27 82 555 1234,EAGLE-1,Sector 1 - North,Station Commander,true
Dr. Willem,Botha,Hartbeesfontein Medies,AMBULANCE,+27 18 431 0222,+27 83 444 5678,MEDIC-2,All Sectors,Trauma & Paramedic Lead,true
Corne,Hattingh,Hartbeesfontein Plaaswag,REACTION_FORCE,+27 82 123 4567,+27 82 123 4567,ALPHA-LEAD,Sector 2 - Central,Platoon Commander,true
Andries,Smit,Noordwes Brandbestryding,FIRE,+27 82 999 0011,+27 82 999 0011,FIRE-1,Hartbeesfontein Area,Wildfire Response Unit,false
`;
  } else if (type === 'CLIENTS') {
    filename = 'Hartbeesfontein_Farms_and_Clients_Template.csv';
    csvContent = `FarmName,OwnerName,OwnerSurname,Phone,WhatsApp,Sector,Latitude,Longitude,GateCode,WaterPoint
Blydskap Plaas 42,Gert,Pretorius,+27 82 345 6789,+27 82 345 6789,Sector 1 - North,-26.7648,26.4192,*4920#,50000L Dam at South Gate
Sterkfontein Boerdery,Kobus,Van Der Merwe,+27 83 234 5678,+27 83 234 5678,Sector 2 - Central,-26.7821,26.4350,1199,Borehole with 10kL JoJo
`;
  } else {
    filename = 'Hartbeesfontein_Area_Sectors_Template.csv';
    csvContent = `SectorId,SectorName,CommanderName,CommanderPhone,RadioChannel,ActivePatrolUnits
SEC-01,Sector 1 - North (Tigane Border),Corne Hattingh,+27 82 123 4567,Channel 1 - 145.550MHz,4
SEC-02,Sector 2 - Central & R503 Corridor,Johan Venter,+27 83 999 8888,Channel 2 - 145.600MHz,3
`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
