import { UserProfile, PrivacyAccessLogEntry } from '../types';

export const INITIAL_PRIVACY_ACCESS_LOGS: PrivacyAccessLogEntry[] = [
  {
    id: 'PRV-001',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    actorUid: 'USR-CTRL-002',
    actorName: 'Kobus Eloff',
    actorRole: 'CONTROL_ROOM',
    targetUserUid: 'USR-CLIENT-001',
    targetUserName: 'Johan van der Merwe',
    dataType: 'GATE_CODES',
    operationalReason: 'Active Medical / Security emergency response dispatch to Rooipoort Farm.',
  },
  {
    id: 'PRV-002',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    actorUid: 'USR-MGMT-003',
    actorName: 'Cornelius Hattingh',
    actorRole: 'MANAGEMENT',
    targetUserUid: 'USR-CLIENT-004',
    targetUserName: 'Andries Botha',
    dataType: 'MEDICAL_DATA',
    operationalReason: 'Emergency medical aid validation for ambulance staging protocol.',
  },
];

export function generatePopiaDsarExport(user: UserProfile): string {
  return `# POPIA SECTION 23 - PERSONAL DATA SUBJECT ACCESS REPORT (DSAR)
**Datum / Date Generated:** ${new Date().toLocaleString()}
**Betrokkene / Data Subject:** ${user.name} ${user.surname}
**Identifikasienommer / UID:** ${user.uid}
**E-pos / Email:** ${user.email}
**Primêre Kontak / Phone:** ${user.primaryPhone}
**Plaas / Eiendom:** ${user.farmName} (${user.sector || 'Sektor 2'})
**Verantwoordelike Party:** Hartbeesfontein Veiligheid Bestuurskomitee

---

## 1. PERSOONLIKE IDENTIFIKASIEDATA GESTOOR
- **Volle Name:** ${user.name} ${user.surname}
- **Sekondêre Kontak:** ${user.secondaryPhone || 'Geen'}
- **Taalkeuse:** ${user.preferredLanguage === 'af' ? 'Afrikaans' : 'English'}
- **Lidmaatskapstatus:** ${user.isActive ? 'Aktiewe Gemeenskapslid' : 'Gedeaktiveer'}
- **Toegewysde Rol:** ${user.role}
- **Gedeeltes / Sektor:** ${user.portionNumber || 'N/A'} - ${user.sector || 'N/A'}

---

## 2. NOODPROFIEL & TOEGANGSINLIGTING (SENSITIEWE DATA)
- **Hoohek Kode:** ${user.emergencyPropertyInfo?.mainGateCode ? '[BEVEILIG - IN STELSEL GESTOOR VIR SLEGS NOODDISPATSJ]' : 'Geen kode verskaf'}
- **Sekondêre Toegang:** ${user.emergencyPropertyInfo?.secondaryGateInfo || 'N/A'}
- **Gevaarlike Diere / Honde:** ${user.emergencyPropertyInfo?.dangerousAnimals || 'Geen aangemeld'}
- **Waterpunte vir Brandweer:** ${user.emergencyPropertyInfo?.waterPoints || 'Geen aangemeld'}
- **Mediese Fondsinligting:** ${user.medicalAid?.schemeName ? `${user.medicalAid.schemeName} (Lidnr: ${user.medicalAid.membershipNumber})` : 'Geen geregistreer nie'}

---

## 3. GEREGISTREERDE FAMILIELEDE & VOERTUIE
### Familielede (${user.familyMembers?.length || 0}):
${(user.familyMembers || []).map((f) => `- **${f.name} ${f.surname}** (${f.relationship}) - Tel: ${f.phone || 'N/A'}`).join('\n') || '- Geen geregistreer nie'}

### Voertuie (${user.vehicles?.length || 0}):
${(user.vehicles || []).map((v) => `- **${v.make} ${v.model} (${v.color})** - Registrasie: ${v.licensePlate}`).join('\n') || '- Geen geregistreer nie'}

---

## 4. WETLIKE BEWARINGSKENNISGEWING
Ingevolge Artikel 14 van POPIA en die Strafproseswet word noodgevalle- en misdaadverslae waarin hierdie profiel as rapporteerder of getuie genoem word, vir 'n statutêre periode van 5 tot 10 jaar bewaar ten doeleindes van regsvervolging en openbare veiligheid.

*Hierdie verslag is amptelik gegenereer op versoek van die betrokkene.*`;
}
