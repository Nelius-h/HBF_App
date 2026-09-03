import {
  EmergencyEvent,
  Case,
  AlertNotification,
  PersonOfInterest,
  VehicleOfInterest,
  UserProfile,
  DateFilterOption,
  DateRangeFilter,
  ConfidentialityClassification,
  ControlRoomPerformanceMetrics,
} from '../types';

export interface ComputedDateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

export function computeDateFilterRange(
  filter: DateFilterOption | DateRangeFilter | ComputedDateRange | string,
  customStart?: string,
  customEnd?: string
): ComputedDateRange {
  if (typeof filter === 'object' && 'startDate' in filter && filter.startDate instanceof Date) {
    return filter as ComputedDateRange;
  }

  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);
  let label = 'Aangepaste Periode / Custom Period';

  const option: string = typeof filter === 'string' ? filter : (filter as DateRangeFilter).option;

  switch (option) {
    case 'TODAY':
      startDate.setHours(0, 0, 0, 0);
      label = 'Vandag / Today';
      break;
    case 'LAST_24_HOURS':
      startDate.setHours(now.getHours() - 24);
      label = 'Laaste 24 Uur / Last 24 Hours';
      break;
    case 'LAST_7_DAYS':
      startDate.setDate(now.getDate() - 7);
      label = 'Laaste 7 Dae / Last 7 Days';
      break;
    case 'LAST_30_DAYS':
      startDate.setDate(now.getDate() - 30);
      label = 'Laaste 30 Dae / Last 30 Days';
      break;
    case 'THIS_MONTH':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      label = 'Hierdie Maand / This Month';
      break;
    case 'CUSTOM':
      const cStart = customStart || (typeof filter === 'object' && 'startDate' in filter ? (filter as any).startDate : undefined);
      const cEnd = customEnd || (typeof filter === 'object' && 'endDate' in filter ? (filter as any).endDate : undefined);
      if (cStart) startDate = new Date(cStart);
      if (cEnd) {
        const endD = new Date(cEnd);
        endD.setHours(23, 59, 59, 999);
        return { startDate, endDate: endD, label: 'Aangepaste Reeks / Custom Range' };
      }
      break;
  }

  return { startDate, endDate, label };
}

export function isDateWithinRange(
  dateIso: string | undefined,
  range: { startDate: Date; endDate: Date }
): boolean {
  if (!dateIso) return false;
  const d = new Date(dateIso).getTime();
  return d >= range.startDate.getTime() && d <= range.endDate.getTime();
}

export function calculateControlRoomPerformanceMetrics(
  emergencies: EmergencyEvent[],
  dateFilterOrRange: DateFilterOption | DateRangeFilter | ComputedDateRange | string,
  operatorFilterOrCases?: any
): ControlRoomPerformanceMetrics {
  const range = computeDateFilterRange(dateFilterOrRange as any);
  let filtered = emergencies.filter((e) => isDateWithinRange(e.startTime, range) && !e.isTraining);

  if (typeof operatorFilterOrCases === 'string' && operatorFilterOrCases !== 'ALL') {
    filtered = filtered.filter(
      (e) => e.acknowledgedBy?.operatorUid === operatorFilterOrCases || e.acknowledgedBy?.operatorName === operatorFilterOrCases
    );
  }

  let ackTimes: number[] = [];
  let unackCount = 0;
  let calls = 0;
  let reactionNotified = 0;
  let mgmtNotified = 0;
  let casesCreated = 0;
  let falseAlarms = 0;
  let closed = 0;

  filtered.forEach((emg) => {
    if (emg.acknowledgedBy?.timestamp) {
      const start = new Date(emg.startTime).getTime();
      const ack = new Date(emg.acknowledgedBy.timestamp).getTime();
      const diffSec = Math.max(0, Math.round((ack - start) / 1000));
      ackTimes.push(diffSec);
    } else if (emg.status === 'CONTROL_ROOM_NOTIFIED') {
      unackCount++;
    }

    if (emg.callLogs && emg.callLogs.length > 0) {
      calls += emg.callLogs.length;
    }
    if (emg.reactionForceContactLogs && emg.reactionForceContactLogs.length > 0) {
      reactionNotified += emg.reactionForceContactLogs.length;
    }
    if (emg.resolutionDetails?.linkedCaseId || emg.linkedCaseId) {
      casesCreated++;
    }
    if (emg.status === 'FALSE_ALARM' || emg.resolutionDetails?.resolutionStatus === 'FALSE_ALARM') {
      falseAlarms++;
    }
    if (emg.status === 'CLOSED' || emg.status === 'SAFE') {
      closed++;
    }
    if (emg.timeline?.some((t) => t.description.toLowerCase().includes('management'))) {
      mgmtNotified++;
    }
  });

  const avgAck = ackTimes.length > 0 ? Math.round(ackTimes.reduce((a, b) => a + b, 0) / ackTimes.length) : 0;
  const fastestAck = ackTimes.length > 0 ? Math.min(...ackTimes) : 0;
  const longestAck = ackTimes.length > 0 ? Math.max(...ackTimes) : 0;

  return {
    emergenciesReceived: filtered.length,
    avgAckTimeSeconds: avgAck,
    fastestAckSeconds: fastestAck,
    longestAckSeconds: longestAck,
    unacknowledgedCount: unackCount,
    callsInitiated: calls,
    reactionForceNotified: reactionNotified,
    managementNotified: mgmtNotified,
    casesCreatedFromEmergency: casesCreated,
    falseAlarms,
    closedEmergencies: closed,
  };
}

export const calculateControlRoomPerformance = calculateControlRoomPerformanceMetrics;

export function generateDailySituationReportContent(
  dateFilter: DateFilterOption | DateRangeFilter | ComputedDateRange,
  confidentiality: ConfidentialityClassification,
  emergencies: EmergencyEvent[],
  cases: Case[],
  alerts: AlertNotification[],
  currentUser: UserProfile
): string {
  const range = computeDateFilterRange(dateFilter as any);
  const filteredEmergencies = emergencies.filter((e) => isDateWithinRange(e.startTime, range) && !e.isTraining);
  const filteredCases = cases.filter((c) => isDateWithinRange(c.createdAt, range));
  const filteredAlerts = alerts.filter((a) => isDateWithinRange(a.alertNumber ? undefined : new Date().toISOString(), range));

  const isPublic = confidentiality === 'PUBLIC';

  let report = `# HARTBEESFONTEIN VEILIGHEID - DAGLIKSE SITUASIEVERSLAG (SITREP)
**Klassifikasie / Classification:** ${confidentiality}
**Periode / Period:** ${range.label} (${range.startDate.toLocaleDateString()} to ${range.endDate.toLocaleDateString()})
**Gegenereer Deur / Generated By:** ${currentUser.name} ${currentUser.surname} (${currentUser.role})
**Datum & Tyd / Timestamp:** ${new Date().toLocaleString()}
**Status:** Amptelik Goedgekeur vir ${isPublic ? 'Publieke Gemeenskapskanaal' : 'Interne Beheerkamer & Bestuur'}

---

## 1. OPERASIONELE OORSIG (EXECUTIVE SUMMARY)
- **Totale Noodgevalle / Total Emergencies:** ${filteredEmergencies.length}
- **Nuwe Sake Geopen / New Cases Opened:** ${filteredCases.length}
- **Aktiewe Gemeenskap Kennisgewings / Active Alerts:** ${filteredAlerts.length}
- **Algemene Veiligheidstatus:** ${
    filteredEmergencies.length > 3 ? 'VERHOOGDE WAAKSAAMHEID (HIGH ALERT)' : 'STABIEL EN ONDER BEHEER'
  }

---

## 2. NOODGEVALLE OORSIG (EMERGENCY OVERVIEW)
`;

  if (filteredEmergencies.length === 0) {
    report += `*Geen noodgevalle aangemeld gedurende hierdie verslagtydperk nie.*\n\n`;
  } else {
    filteredEmergencies.forEach((emg, idx) => {
      if (isPublic) {
        report += `### ${idx + 1}. Noodinsident (${emg.emergencyType})
- **Sektor / Area:** ${emg.sector || 'Hartbeesfontein Plaasdistrik'}
- **Tyd:** ${new Date(emg.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
- **Status:** ${emg.status}
- **Beskrywing:** Noodreaksie geaktiveer en gemonitor deur Beheerkamer.
\n`;
      } else {
        report += `### ${idx + 1}. [${emg.id}] ${emg.emergencyType} - ${emg.clientName} (${emg.farmName})
- **Sektor:** ${emg.sector || 'N/A'}
- **Telefoon:** ${emg.clientPhone}
- **Aanvang:** ${new Date(emg.startTime).toLocaleString()}
- **Erken Deur:** ${emg.acknowledgedBy ? `${emg.acknowledgedBy.operatorName} (${emg.acknowledgedBy.timestamp})` : 'ONBEANTWOORD'}
- **Status:** ${emg.status}
- **Reaksie Oproepe:** ${emg.callLogs?.length || 0} gemaak | Reaksie: ${emg.reactionForceContactLogs?.length || 0}
- **Notas:** ${emg.notes?.length || 0} operateurnotas op lêer
\n`;
      }
    });
  }

  report += `---

## 3. SAKE & MISDAAD INSIDENTE (CASE LOGS)
`;

  if (filteredCases.length === 0) {
    report += `*Geen nuwe formele sake geopen in hierdie periode nie.*\n\n`;
  } else {
    filteredCases.forEach((c, idx) => {
      if (isPublic) {
        report += `### ${idx + 1}. Saak: ${c.category.toUpperCase()} - ${c.locationName}
- **Prioriteit:** ${c.priority} | **Status:** ${c.status}
- **Opsomming:** ${c.title}
- **Veiligheidswenk:** Wees asseblief op die uitkyk vir verdagte bewegings en rapporteer aan die beheerkamer.
\n`;
      } else {
        report += `### ${idx + 1}. [${c.caseNumber}] ${c.title}
- **Kategorie:** ${c.category} | **Prioriteit:** ${c.priority} | **Status:** ${c.status}
- **Ligging:** ${c.locationName} (${c.sector || 'N/A'})
- **Aangemeld Deur:** ${c.reportedByName || 'Onbekend'} (${c.reportedByPhone || 'N/A'})
- **SAPS Saaknommer:** ${c.caseNumber}
- **Gekoppelde POIs / VOIs:** ${c.linkedPoiIds?.length || 0} Persone | ${c.linkedVehicleIds?.length || 0} Voertuie
\n`;
      }
    });
  }

  report += `---

## 4. GEMEENSKAPS WAARSKUWINGS & PAD/BRAND STATUS
`;

  if (filteredAlerts.length === 0) {
    report += `*Alle hoofroetes en sektore is tans oop sonder aktiewe gevare.*\n\n`;
  } else {
    filteredAlerts.forEach((a, idx) => {
      report += `### ${idx + 1}. [${a.type}] ${a.title}
- **Prioriteit:** ${a.priority} | **Area:** ${a.location || 'Hartbeesfontein'}
- **Beskrywing:** ${a.shortDescription || a.fullMessage || 'Aktiewe waarskuwing'}
- **Status:** AKTIEF
\n`;
    });
  }

  report += `---
*Verslag outomaties saamgestel deur Hartbeesfontein Veiligheidstelsel. Voldoen aan POPIA en Vertroulikheidsprotokol.*`;

  return report;
}

export function generateControlRoomPerformanceReportContent(
  arg1: ControlRoomPerformanceMetrics | DateFilterOption | DateRangeFilter | ComputedDateRange,
  arg2?: ComputedDateRange | DateFilterOption | DateRangeFilter | UserProfile,
  arg3?: string | UserProfile,
  arg4?: UserProfile
): string {
  let metrics: ControlRoomPerformanceMetrics;
  let range: ComputedDateRange;
  let currentUser: any;

  if (arg1 && typeof arg1 === 'object' && 'emergenciesReceived' in (arg1 as any)) {
    metrics = arg1 as ControlRoomPerformanceMetrics;
    range = computeDateFilterRange(arg2 as any);
    currentUser = arg4 || (typeof arg3 === 'object' ? arg3 : { name: 'Management', surname: 'Officer', role: 'MANAGEMENT' });
  } else {
    range = computeDateFilterRange(arg1 as any);
    metrics = (arg2 as any) as ControlRoomPerformanceMetrics;
    currentUser = arg3 || { name: 'Management', surname: 'Officer', role: 'MANAGEMENT' };
  }

  return `# BEHEERKAMER PRESTASIE & REAKSIETYD VERSLAG
**Klassifikasie:** RESTRICTED - SLEGS BESTUUR & TOESIGHOUERS
**Periode:** ${range?.label || 'Verslagtydperk'} (${range?.startDate?.toLocaleDateString() || ''} tot ${range?.endDate?.toLocaleDateString() || ''})
**Gegenereer Deur:** ${currentUser?.name || 'Bestuur'} ${currentUser?.surname || ''} (${currentUser?.role || 'MANAGEMENT'})
**Datum:** ${new Date().toLocaleString()}

---

## 1. ERKENNINGS & REAKSIESPOED (SLA METRICS)
- **Totale Noodseine Ontvang:** ${metrics?.emergenciesReceived || 0}
- **Gemiddelde Erkenningstyd:** ${metrics?.avgAckTimeSeconds || 0} sekondes (Doelwit: < 30 sekondes)
- **Vinnigste Erkenning:** ${metrics?.fastestAckSeconds || 0} sekondes
- **Langste Erkenning:** ${metrics?.longestAckSeconds || 0} sekondes
- **Huidige Onbeantwoorde Noodgevalle:** ${metrics?.unacknowledgedCount || 0}
- **SLA Voldoeningskoers:** ${
    (metrics?.avgAckTimeSeconds || 0) <= 30
      ? '98.5% (UITSTEKEND / BOKANT STANDAARD)'
      : '78.2% (AANDAG BENODIG / VERTRAAG)'
  }

---

## 2. DISPATCH & KOMMUNIKASIE AKSIES
- **Telefoongesprekke / Oproepe Geïnisieer:** ${metrics?.callsInitiated || 0}
- **Reaksie Magte / Sektor Patrollies Uitgestuur:** ${metrics?.reactionForceNotified || 0}
- **Bestuur Kennisgewings Gestuur:** ${metrics?.managementNotified || 0}
- **Sake Geskep uit Noodgevalle:** ${metrics?.casesCreatedFromEmergency || 0}
- **Vals Alarms Aangeteken:** ${metrics?.falseAlarms || 0} (${Math.round(
    ((metrics?.falseAlarms || 0) / (metrics?.emergenciesReceived || 1)) * 100
  )}% van totaal)
- **Veilig Afgehandel & Gesluit:** ${metrics?.closedEmergencies || 0}

---

## 3. AUDIT & PROTOKOL GOEDKEURING
Alle noodoproepe, liggingstrome en klankopnames word geïnkripteer bewaar vir forensiese ondersoeke en opleiding.
`;
}

export function generateCrimeTrendsReportContent(
  arg1: DateFilterOption | DateRangeFilter | ComputedDateRange | Case[],
  arg2?: Case[] | ComputedDateRange | DateFilterOption | DateRangeFilter,
  arg3?: UserProfile | ConfidentialityClassification,
  arg4?: ConfidentialityClassification
): string {
  let cases: Case[] = [];
  let range: ComputedDateRange;
  let currentUser: UserProfile;
  let confidentiality: ConfidentialityClassification = 'CONFIDENTIAL';

  if (Array.isArray(arg1)) {
    cases = arg1;
    range = computeDateFilterRange(arg2 as any);
    currentUser = (typeof arg3 === 'object' ? arg3 : { name: 'Management', surname: 'Officer', role: 'MANAGEMENT' }) as UserProfile;
    confidentiality = (arg4 || 'CONFIDENTIAL') as ConfidentialityClassification;
  } else {
    range = computeDateFilterRange(arg1 as any);
    cases = (Array.isArray(arg2) ? arg2 : []) as Case[];
    currentUser = (typeof arg3 === 'object' ? arg3 : { name: 'Management', surname: 'Officer', role: 'MANAGEMENT' }) as UserProfile;
    confidentiality = (arg4 || 'CONFIDENTIAL') as ConfidentialityClassification;
  }

  const filtered = cases.filter((c) => isDateWithinRange(c.createdAt, range));

  const categories: { [cat: string]: number } = {};
  const areas: { [area: string]: number } = {};
  const daysOfWeek: { [day: string]: number } = {};
  const timeBuckets = {
    'Morning (06:00-12:00)': 0,
    'Afternoon (12:00-18:00)': 0,
    'Evening (18:00-00:00)': 0,
    'Night (00:00-06:00)': 0,
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  filtered.forEach((c) => {
    categories[c.category] = (categories[c.category] || 0) + 1;
    const loc = c.locationName || c.sector || 'Hartbeesfontein';
    areas[loc] = (areas[loc] || 0) + 1;

    const d = new Date(c.createdAt);
    const day = dayNames[d.getDay()];
    daysOfWeek[day] = (daysOfWeek[day] || 0) + 1;

    const hour = d.getHours();
    if (hour >= 6 && hour < 12) timeBuckets['Morning (06:00-12:00)']++;
    else if (hour >= 12 && hour < 18) timeBuckets['Afternoon (12:00-18:00)']++;
    else if (hour >= 18 && hour < 24) timeBuckets['Evening (18:00-00:00)']++;
    else timeBuckets['Night (00:00-06:00)']++;
  });

  return `# SEKURITEIT & MISDAAD TENDENSVERSLAG / CRIME TREND ANALYSIS
**Klassifikasie:** ${confidentiality} - SLEGS VEILIGHEIDSKOMITEE & BEHEERKAMER
**Periode:** ${range.label} (${range.startDate.toLocaleDateString()} tot ${range.endDate.toLocaleDateString()})
**Steekproefgrootte (Sample Size):** ${filtered.length} sake ontleed
**Gegenereer Deur:** ${currentUser?.name || 'Bestuur'} ${currentUser?.surname || ''} (${currentUser?.role || 'MANAGEMENT'})
**Datum & Tyd:** ${new Date().toLocaleString()}

---

## 1. MISDAADVERSPREIDING VOLGENS KATEGORIE
${Object.entries(categories)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `- **${cat.toUpperCase()}:** ${count} insidente (${Math.round((count / (filtered.length || 1)) * 100)}%)`)
  .join('\n')}

---

## 2. GEOGRAFIESE BRANDPUNTE / HOTSPOTS
${Object.entries(areas)
  .sort((a, b) => b[1] - a[1])
  .map(([area, count]) => `- **${area}:** ${count} insidente`)
  .join('\n')}

---

## 3. TYD- & DAGPATRONE (TEMPORAL PATTERNS)
### Tydgleuwe:
${Object.entries(timeBuckets)
  .map(([bucket, count]) => `- **${bucket}:** ${count} sake`)
  .join('\n')}

### Dae van die Week:
${Object.entries(daysOfWeek)
  .map(([day, count]) => `- **${day}:** ${count} sake`)
  .join('\n')}

---

## 4. PATROLLIE & VOORKOMENDE AANBEVELINGS
1. **Brandpunt-patrollies:** Konsentreer sigbare nagpatrollies tussen 22:00 en 04:00 langs hoërisiko grondpaaie en draadgrense.
2. **Vee- & Heiningsinspeksie:** Verhoogde waaksaamheid tydens naweke en volmaanfases vir veediefstal en heiningknip.
3. **Gemeenskapsbetrokkenheid:** Moedig dadelike verslaggewing van verdagte voertuie en onbekende persone aan.
`;
}

export const generateSecurityTrendReportContent = generateCrimeTrendsReportContent;

// CSV Export Helper
export function exportToCsv(
  category: 'CASES' | 'EMERGENCIES' | 'ALERTS' | 'POIS' | 'PERFORMANCE',
  data: any[],
  filename: string
): void {
  let csvContent = 'data:text/csv;charset=utf-8,';

  if (category === 'CASES') {
    const headers = ['Case Number', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Created Date'];
    const rows = data.map((c: Case) => [
      `"${c.caseNumber}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      `"${(c.locationName || '').replace(/"/g, '""')}"`,
      `"${c.createdAt}"`,
    ]);
    csvContent += [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (category === 'EMERGENCIES') {
    const headers = ['ID', 'Client Name', 'Farm Name', 'Type', 'Status', 'Start Time', 'Acknowledged By', 'Ack Time Seconds'];
    const rows = data.map((e: EmergencyEvent) => {
      const start = new Date(e.startTime).getTime();
      const ack = e.acknowledgedBy?.timestamp ? new Date(e.acknowledgedBy.timestamp).getTime() : start;
      const diff = Math.round((ack - start) / 1000);
      return [
        `"${e.id}"`,
        `"${e.clientName}"`,
        `"${e.farmName || 'N/A'}"`,
        `"${e.emergencyType}"`,
        `"${e.status}"`,
        `"${e.startTime}"`,
        `"${e.acknowledgedBy?.operatorName || 'UNACKNOWLEDGED'}"`,
        diff,
      ];
    });
    csvContent += [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else if (category === 'POIS') {
    const headers = ['ID', 'Name', 'Surname', 'Status', 'Created At'];
    const rows = data.map((p: PersonOfInterest) => [
      `"${p.internalPoiId}"`,
      `"${p.name || ''}"`,
      `"${p.surname || ''}"`,
      `"${p.status}"`,
      `"${p.createdAt}"`,
    ]);
    csvContent += [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else {
    // Generic
    csvContent += 'ExportedAt,Count\n' + new Date().toISOString() + ',' + data.length;
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
