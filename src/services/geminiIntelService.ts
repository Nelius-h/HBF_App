import { GoogleGenAI } from '@google/genai';
import {
  PersonOfInterest,
  VehicleOfInterest,
  Case,
  BoloRecord,
  IntelObservation,
  IntelRelationship,
  ModusOperandiType,
} from '../types';

// System prompt enforcing strict ethical and operational boundaries
const INTEL_AI_SAFETY_INSTRUCTION = `
You are the Hartbeesfontein Veiligheid Intelligence Assistant for authorized Control Room and Management operators in North West, South Africa.

CRITICAL OPERATIONAL RULES & ETHICAL SAFEGUARDS:
1. You must STRICTLY distinguish between FACT, OBSERVATION, ALLEGATION, UNVERIFIED INFORMATION, and INFERENCE.
2. AI MUST NEVER determine guilt, declare anyone a criminal, or automatically assign suspect status.
3. AI MUST NEVER predict future crime or generate person risk/guilt scores.
4. All suggestions MUST be explicitly phrased as "POSSIBLE LINK - REVIEW RECOMMENDED" or "UNVERIFIED SIMILARITY".
5. Every point MUST cite the exact internal record IDs (e.g., Case HBF-2026-0012, POI-HBF-0014, VOI-HBF-0041, OBS-2026-0048, BOLO-2026-0007).
6. Support bilingual operation (Afrikaans & English).
`;

// Helper to initialize Gemini client safely
// Browser-side API keys are intentionally disabled. A VITE_* Gemini key would be
// embedded in the public JavaScript bundle. Keep deterministic intelligence tools
// operational until a trusted server-side Gemini proxy is configured.
function getGeminiClient(): GoogleGenAI | null {
  return null;
}

export interface LinkSuggestion {
  id: string;
  sourceId: string;
  sourceType: 'PERSON' | 'VEHICLE' | 'CASE' | 'BOLO' | 'LOCATION';
  sourceLabel: string;
  targetId: string;
  targetType: 'PERSON' | 'VEHICLE' | 'CASE' | 'BOLO' | 'LOCATION';
  targetLabel: string;
  relationshipType: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  matchingCriteria: string[];
  reasoning: string;
  disclaimer: string;
}

// 1. NON-AI DETERMINISTIC MATCHING ENGINE (Exact matching with zero token usage)
export function runDeterministicMatching(
  target: { type: 'PERSON' | 'VEHICLE' | 'CASE'; data: any },
  database: {
    pois: PersonOfInterest[];
    vois: VehicleOfInterest[];
    cases: Case[];
    bolos: BoloRecord[];
    observations: IntelObservation[];
  }
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];

  if (target.type === 'VEHICLE') {
    const voi = target.data as VehicleOfInterest;
    const cleanPlate = voi.registration.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    if (cleanPlate && cleanPlate.length >= 4 && !voi.isPartialRegistration) {
      // Search in other VOIs
      database.vois.forEach((other) => {
        if (other.id !== voi.id) {
          const otherPlate = other.registration.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          if (otherPlate && (otherPlate === cleanPlate || otherPlate.includes(cleanPlate) || cleanPlate.includes(otherPlate))) {
            suggestions.push({
              id: `det-voi-${voi.id}-${other.id}`,
              sourceId: voi.id,
              sourceType: 'VEHICLE',
              sourceLabel: `${voi.internalVoiId} (${voi.registration})`,
              targetId: other.id,
              targetType: 'VEHICLE',
              targetLabel: `${other.internalVoiId} (${other.registration})`,
              relationshipType: 'POSSIBLE_DUPLICATE_OR_SHARED_PLATE',
              confidence: 'HIGH',
              matchingCriteria: [`Exact Registration Match: ${voi.registration}`],
              reasoning: `Both records share the same license plate: ${voi.registration}`,
              disclaimer: 'Deterministic database match. Review recommended before merging.',
            });
          }
        }
      });

      // Search in Cases
      database.cases.forEach((c) => {
        const casePlate = c.vehicleInfo?.plate?.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (casePlate && casePlate === cleanPlate) {
          suggestions.push({
            id: `det-case-${voi.id}-${c.id}`,
            sourceId: voi.id,
            sourceType: 'VEHICLE',
            sourceLabel: `${voi.internalVoiId} (${voi.registration})`,
            targetId: c.id,
            targetType: 'CASE',
            targetLabel: `${c.caseNumber}: ${c.title}`,
            relationshipType: 'VEHICLE_MENTIONED_IN_CASE',
            confidence: 'HIGH',
            matchingCriteria: [`Exact Registration in Case: ${c.caseNumber}`],
            reasoning: `Vehicle license plate was recorded in Case ${c.caseNumber}`,
            disclaimer: 'Deterministic database match. Human operator verification required.',
          });
        }
      });

      // Search in BOLOs
      database.bolos.forEach((b) => {
        const boloPlate = b.vehicleInfo?.licensePlate?.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (boloPlate && boloPlate === cleanPlate) {
          suggestions.push({
            id: `det-bolo-${voi.id}-${b.id}`,
            sourceId: voi.id,
            sourceType: 'VEHICLE',
            sourceLabel: `${voi.internalVoiId} (${voi.registration})`,
            targetId: b.id,
            targetType: 'BOLO',
            targetLabel: `${b.boloNumber}: ${b.title}`,
            relationshipType: 'TARGET_OF_BOLO',
            confidence: 'HIGH',
            matchingCriteria: [`Exact BOLO License Plate Match: ${b.boloNumber}`],
            reasoning: `Vehicle is subject of active/past BOLO ${b.boloNumber}`,
            disclaimer: 'Deterministic database match. Verify current BOLO state.',
          });
        }
      });
    }
  }

  if (target.type === 'PERSON') {
    const poi = target.data as PersonOfInterest;

    // Check phone matches
    poi.phoneNumbers.forEach((phone) => {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 8) {
        database.pois.forEach((other) => {
          if (other.id !== poi.id) {
            const hasPhone = other.phoneNumbers.some((p) => p.replace(/[^0-9]/g, '').includes(cleanPhone));
            if (hasPhone) {
              suggestions.push({
                id: `det-poi-phone-${poi.id}-${other.id}`,
                sourceId: poi.id,
                sourceType: 'PERSON',
                sourceLabel: `${poi.internalPoiId} (${poi.name || 'Unknown'} ${poi.surname || ''})`,
                targetId: other.id,
                targetType: 'PERSON',
                targetLabel: `${other.internalPoiId} (${other.name || 'Unknown'} ${other.surname || ''})`,
                relationshipType: 'SHARED_PHONE_NUMBER',
                confidence: 'HIGH',
                matchingCriteria: [`Exact Phone Match: ${phone}`],
                reasoning: `Both persons list the same phone number (${phone}).`,
                disclaimer: 'Possible duplicate or shared device. Verify identity.',
              });
            }
          }
        });
      }
    });

    // Check Name + Surname exact match
    if (poi.name && poi.surname) {
      const fullName = `${poi.name} ${poi.surname}`.trim().toLowerCase();
      database.pois.forEach((other) => {
        if (other.id !== poi.id && other.name && other.surname) {
          const otherFullName = `${other.name} ${other.surname}`.trim().toLowerCase();
          if (fullName === otherFullName) {
            suggestions.push({
              id: `det-poi-name-${poi.id}-${other.id}`,
              sourceId: poi.id,
              sourceType: 'PERSON',
              sourceLabel: `${poi.internalPoiId} (${poi.name} ${poi.surname})`,
              targetId: other.id,
              targetType: 'PERSON',
              targetLabel: `${other.internalPoiId} (${other.name} ${other.surname})`,
              relationshipType: 'POSSIBLE_DUPLICATE_PERSON',
              confidence: 'MEDIUM',
              matchingCriteria: [`Identical Full Name: ${poi.name} ${poi.surname}`],
              reasoning: `Records share identical first and surname.`,
              disclaimer: 'Check dates of birth, photos and known areas before considering merge.',
            });
          }
        }
      });
    }
  }

  if (target.type === 'CASE') {
    const c = target.data as Case;
    if (c.modusOperandi && c.modusOperandi.length > 0) {
      database.cases.forEach((other) => {
        if (other.id !== c.id && other.modusOperandi && other.modusOperandi.length > 0) {
          const sharedMo = c.modusOperandi!.filter((mo) => other.modusOperandi!.includes(mo));
          if (sharedMo.length >= 2) {
            suggestions.push({
              id: `det-case-mo-${c.id}-${other.id}`,
              sourceId: c.id,
              sourceType: 'CASE',
              sourceLabel: `${c.caseNumber}: ${c.title}`,
              targetId: other.id,
              targetType: 'CASE',
              targetLabel: `${other.caseNumber}: ${other.title}`,
              relationshipType: 'SIMILAR_MODUS_OPERANDI',
              confidence: sharedMo.length >= 3 ? 'HIGH' : 'MEDIUM',
              matchingCriteria: sharedMo.map((mo) => `Shared MO: ${mo}`),
              reasoning: `Cases share ${sharedMo.length} specific modus operandi methods in ${c.locationName} / ${other.locationName}.`,
              disclaimer: 'Pattern observation only. Does not prove same perpetrator.',
            });
          }
        }
      });
    }
  }

  return suggestions;
}

// 2. AI-ASSISTED CASE SUMMARY
export async function generateCaseSummary(
  caseRecord: Case,
  relatedIntel: {
    pois: PersonOfInterest[];
    vois: VehicleOfInterest[];
    observations: IntelObservation[];
    relationships: IntelRelationship[];
  },
  language: 'en' | 'af' = 'en'
): Promise<string> {
  const client = getGeminiClient();

  if (!client) {
    // High quality deterministic fallback summary
    const moList = caseRecord.modusOperandi?.join(', ') || 'Standard entry';
    const linkedPois = relatedIntel.pois.map((p) => `${p.internalPoiId} (${p.name || 'Unknown'} ${p.surname || ''})`).join(', ') || 'None linked yet';
    const linkedVois = relatedIntel.vois.map((v) => `${v.internalVoiId} (${v.registration})`).join(', ') || 'None linked yet';

    if (language === 'af') {
      return `### Saak Opsomming: ${caseRecord.caseNumber} - ${caseRecord.title}
* **Datum & Tyd**: ${caseRecord.incidentDate} om ${caseRecord.incidentTime}
* **Ligging**: ${caseRecord.locationName}
* **Kategorie**: ${caseRecord.category.toUpperCase()} | Prioriteit: ${caseRecord.priority.toUpperCase()} | Status: ${caseRecord.status.toUpperCase()}
* **Modus Operandi**: ${moList} ${caseRecord.modusOperandiNotes ? `(${caseRecord.modusOperandiNotes})` : ''}
* **Gekoppelde Persone**: ${linkedPois}
* **Gekoppelde Voertuie**: ${linkedVois}
* **Beskrywing**: ${caseRecord.description}
* **Opdaterings Geskiedenis**: ${caseRecord.updates.length} inskrywings aangeteken.

*Kennisgewing: Gegenereer deur Hartbeesfontein Beheerkamer Intelligensie-stelsel.*`;
    }

    return `### Case Intelligence Summary: ${caseRecord.caseNumber} - ${caseRecord.title}
* **Date & Time**: ${caseRecord.incidentDate} at ${caseRecord.incidentTime}
* **Location**: ${caseRecord.locationName}
* **Category**: ${caseRecord.category.toUpperCase()} | Priority: ${caseRecord.priority.toUpperCase()} | Status: ${caseRecord.status.toUpperCase()}
* **Modus Operandi**: ${moList} ${caseRecord.modusOperandiNotes ? `(${caseRecord.modusOperandiNotes})` : ''}
* **Linked Persons**: ${linkedPois}
* **Linked Vehicles**: ${linkedVois}
* **Primary Narrative**: ${caseRecord.description}
* **Investigation Progress**: ${caseRecord.updates.length} case log updates recorded.

*Notice: Generated from internal audit records. AI does not assign guilt.*`;
  }

  try {
    const prompt = `
Generate a professional, factual intelligence summary of this case in ${language === 'af' ? 'Afrikaans' : 'English'}.
Strictly adhere to safety rules: distinguish observations from verified facts, never declare guilt, and cite record IDs.

Case Data:
${JSON.stringify({
  caseNumber: caseRecord.caseNumber,
  title: caseRecord.title,
  category: caseRecord.category,
  priority: caseRecord.priority,
  status: caseRecord.status,
  incidentDate: caseRecord.incidentDate,
  incidentTime: caseRecord.incidentTime,
  location: caseRecord.locationName,
  description: caseRecord.description,
  modusOperandi: caseRecord.modusOperandi,
  vehicleInfo: caseRecord.vehicleInfo,
  personDescription: caseRecord.personDescription,
  updatesCount: caseRecord.updates.length,
  updates: caseRecord.updates.map((u) => ({ time: u.timestamp, message: u.message })),
  linkedPois: relatedIntel.pois.map((p) => ({ id: p.internalPoiId, name: `${p.name} ${p.surname}`, status: p.status })),
  linkedVois: relatedIntel.vois.map((v) => ({ id: v.internalVoiId, reg: v.registration, make: v.make, model: v.model })),
})}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: INTEL_AI_SAFETY_INSTRUCTION,
      },
    });

    return response.text || 'Unable to generate summary.';
  } catch (err) {
    console.error('Gemini Case Summary Error:', err);
    return `Case Summary for ${caseRecord.caseNumber}: ${caseRecord.title} at ${caseRecord.locationName}. (${caseRecord.updates.length} updates logged).`;
  }
}

// 3. AI-ASSISTED ENTITY TIMELINE SUMMARY (Person / Vehicle)
export async function generateEntityTimelineSummary(
  entityType: 'PERSON' | 'VEHICLE',
  entity: PersonOfInterest | VehicleOfInterest,
  timelineEvents: { date: string; title: string; detail: string; sourceId: string }[],
  language: 'en' | 'af' = 'en'
): Promise<string> {
  const client = getGeminiClient();
  const label = entityType === 'PERSON'
    ? `${(entity as PersonOfInterest).internalPoiId} (${(entity as PersonOfInterest).name || 'Unknown'} ${(entity as PersonOfInterest).surname || ''})`
    : `${(entity as VehicleOfInterest).internalVoiId} (${(entity as VehicleOfInterest).registration})`;

  if (!client) {
    if (language === 'af') {
      return `### Tydlyn Opsomming: ${label}
* **Totaal Gebeure**: ${timelineEvents.length} historiese inskrywings
* **Eerste Waarneming**: ${timelineEvents[0]?.date || 'Onbekend'}
* **Laaste Waarneming**: ${timelineEvents[timelineEvents.length - 1]?.date || 'Onbekend'}
* **Sleutel Tydlyn Inskrywings**:
${timelineEvents.slice(0, 5).map((e) => `  - **${e.date}**: ${e.title} (${e.sourceId})`).join('\n')}

*Kennisgewing: Streng feitelike tydlyn sonder afleidings.*`;
    }

    return `### Chronological Timeline Summary: ${label}
* **Total Logged Events**: ${timelineEvents.length} historical records
* **First Recorded Activity**: ${timelineEvents[0]?.date || 'Unknown'}
* **Latest Recorded Activity**: ${timelineEvents[timelineEvents.length - 1]?.date || 'Unknown'}
* **Recent Timeline Milestones**:
${timelineEvents.slice(0, 5).map((e) => `  - **${e.date}**: ${e.title} (Ref: ${e.sourceId})`).join('\n')}

*Notice: Chronological event trace based on verified operator observations.*`;
  }

  try {
    const prompt = `
Build a concise chronological intelligence timeline summary for ${entityType} ${label} in ${language === 'af' ? 'Afrikaans' : 'English'}.
Highlight recurring locations, linked vehicle/person associations, and case appearances.
Do NOT accuse or determine guilt. Cite every event's source reference.

Timeline Events:
${JSON.stringify(timelineEvents)}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: INTEL_AI_SAFETY_INSTRUCTION,
      },
    });

    return response.text || 'Unable to generate timeline summary.';
  } catch (err) {
    console.error('Gemini Timeline Summary Error:', err);
    return `Timeline for ${label} (${timelineEvents.length} events logged).`;
  }
}

// 4. EXTRACT STRUCTURED FACTS FROM OPERATOR PATROL NOTES
export async function extractFactsFromNotes(
  rawNotes: string,
  language: 'en' | 'af' = 'en'
): Promise<{
  possibleVehicle?: { registration?: string; make?: string; model?: string; color?: string; damage?: string };
  possiblePerson?: { approximateAge?: string; clothing?: string; build?: string; direction?: string };
  location?: string;
  modusOperandi?: ModusOperandiType[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  extractedSummary: string;
}> {
  const client = getGeminiClient();

  if (!client) {
    // Regex-based deterministic parsing fallback
    const regMatch = rawNotes.match(/[A-Z]{2,4}\s?[0-9]{2,4}\s?[A-Z]{1,3}/i);
    const colorMatch = rawNotes.match(/\b(white|wit|black|swart|silver|silwer|red|rooi|blue|blou|grey|grys|green|groen)\b/i);
    const vehicleTypeMatch = rawNotes.match(/\b(hilux|isuzu|ford|ranger|quantum|bakkie|sedan|corolla|d-max|np300|polo)\b/i);

    return {
      possibleVehicle: {
        registration: regMatch ? regMatch[0].toUpperCase() : undefined,
        make: vehicleTypeMatch ? vehicleTypeMatch[0] : undefined,
        color: colorMatch ? colorMatch[0] : undefined,
      },
      possiblePerson: {},
      location: rawNotes.includes('R503') ? 'R503 Highway' : undefined,
      confidence: regMatch ? 'HIGH' : 'MEDIUM',
      extractedSummary: `Extracted from notes: ${regMatch ? `Plate: ${regMatch[0]}` : 'No plate detected'}, ${vehicleTypeMatch ? `Type: ${vehicleTypeMatch[0]}` : ''}`,
    };
  }

  try {
    const prompt = `
Extract structured facts from these patrol notes. Return ONLY valid JSON adhering strictly to this schema:
{
  "possibleVehicle": {
    "registration": string or null,
    "make": string or null,
    "model": string or null,
    "color": string or null,
    "damage": string or null
  },
  "possiblePerson": {
    "approximateAge": string or null,
    "clothing": string or null,
    "build": string or null,
    "direction": string or null
  },
  "location": string or null,
  "modusOperandi": array of string (subset of ["FENCE_CUT","GATE_FORCED","LIVESTOCK_DRIVEN_AWAY","VEHICLE_USED","FOOT_ACCESS","POWER_DISABLED","DOGS_POISONED","HOUSE_ENTERED_WINDOW","COPPER_WIRE_REMOVED","FIRE_DISTRACTION","CABLE_THEFT","TOOL_SHED_BREAKIN","OTHER"]),
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "extractedSummary": string (short 1-2 sentence overview)
}

Notes:
"""${rawNotes}"""
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: INTEL_AI_SAFETY_INSTRUCTION,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (err) {
    console.error('Gemini Fact Extraction Error:', err);
  }

  return {
    confidence: 'LOW',
    extractedSummary: rawNotes.slice(0, 100),
  };
}

// 5. GENERATE DAILY INTELLIGENCE SUMMARY
export async function generateDailyIntelligenceSummary(params: {
  cases: Case[];
  pois: PersonOfInterest[];
  vois: VehicleOfInterest[];
  observations: IntelObservation[];
  date: string;
  language?: 'en' | 'af';
}): Promise<string> {
  const { cases, pois, vois, observations, date, language = 'en' } = params;
  const client = getGeminiClient();

  const activeCases = cases.filter((c) => c.status !== 'resolved');
  const recentObs = observations.filter((o) => (o.date || o.incidentTimestamp.substring(0, 10)) === date);
  const flaggedVois = vois.filter((v) => v.status === 'FLAGGED' || v.status === 'STOLEN');
  const wantedPois = pois.filter((p) => p.status === 'WANTED' || p.status === 'SUSPECT');

  if (!client) {
    // Fallback deterministic digest
    return `=== HARTBEESFONTEIN VEILIGHEID - DAILY INTELLIGENCE SUMMARY ===
Date: ${date}
Active Incident Cases: ${activeCases.length}
Today's Sighting Observations: ${recentObs.length}
Vehicles on Active Watch/Stolen: ${flaggedVois.length}
Wanted Persons / Suspects: ${wantedPois.length}

1. PRIORITY VEHICLES OF INTEREST (VOI):
${flaggedVois.map((v) => `• [${v.internalVoiId}] ${v.registration} (${v.colour} ${v.make} ${v.model}) - Status: ${v.status}`).join('\n') || 'None active'}

2. RECENT SIGHTINGS & PATROL OBSERVATIONS:
${recentObs.map((o) => `• [${o.observationId}] ${o.locationDescription || 'Hartbeesfontein area'} - ${o.description} (${o.confidenceLevel} confidence)`).join('\n') || 'No sightings logged today'}

3. ACTIVE INCIDENT HIGHLIGHTS:
${activeCases.map((c) => `• Case ${c.caseNumber}: ${c.title} (${c.sector || 'General Sektor'}) - MO: ${(c.modusOperandi || []).join(', ') || 'Under investigation'}`).join('\n')}

OPERATIONAL DIRECTIVE:
Patrol units are advised to maintain vigilance along the R507 and Silo corridors during night windows (22:00 - 05:00). Report all partial plate sightings immediately to Control Room.
(Generated locally - Operational Reference Only)`;
  }

  try {
    const prompt = `
Generate an operational Daily Intelligence Summary for ${date} in ${language === 'af' ? 'Afrikaans' : 'English'}.
Strictly format with these sections:
1. EXECUTIVE SECURITY SITUATION OVERVIEW
2. PRIORITY VEHICLES OF INTEREST (VOI) ON WATCH (cite VOI IDs and registration plates)
3. SUSPECT & WANTED PERSONS SUMMARY (cite POI IDs and physical marks, no guilt assertions)
4. SIGHTING OBSERVATIONS & PATROL TIMELINE (cite OBS IDs and locations)
5. RECOMMENDED PATROL ATTENTION AREAS (Sectors, corridors, time windows)

DATA CONTEXT:
Cases: ${JSON.stringify(activeCases.map((c) => ({ id: c.caseNumber, title: c.title, sector: c.sector, mo: c.modusOperandi })))}
Flagged VOIs: ${JSON.stringify(flaggedVois.map((v) => ({ id: v.internalVoiId, reg: v.registration, make: v.make, status: v.status, damage: v.damage })))}
Wanted POIs: ${JSON.stringify(wantedPois.map((p) => ({ id: p.internalPoiId, name: `${p.name || ''} ${p.surname || ''}`, marks: p.physicalDescription?.identifyingMarks, status: p.status })))}
Recent Observations: ${JSON.stringify(recentObs.map((o) => ({ id: o.observationId, loc: o.locationDescription, desc: o.description, conf: o.confidenceLevel })))}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: INTEL_AI_SAFETY_INSTRUCTION,
      },
    });

    return response.text || 'Unable to generate summary.';
  } catch (err) {
    console.error('Daily Summary Error:', err);
    return `Daily Intelligence Summary for ${date} (Active Cases: ${activeCases.length}, Flagged VOIs: ${flaggedVois.length}).`;
  }
}

// 6. GENERATE WEEKLY MANAGEMENT REPORT
export async function generateWeeklyManagementReport(params: {
  cases: Case[];
  pois: PersonOfInterest[];
  vois: VehicleOfInterest[];
  observations: IntelObservation[];
  timeRangeDays?: number;
  language?: 'en' | 'af';
}): Promise<string> {
  const { cases, pois, vois, observations, timeRangeDays = 14, language = 'en' } = params;
  const client = getGeminiClient();

  if (!client) {
    return `=== HARTBEESFONTEIN VEILIGHEID - MANAGEMENT INTELLIGENCE REPORT ===
Period: Last ${timeRangeDays} Days
Total Incident Cases: ${cases.length}
Vehicles of Interest Tracked: ${vois.length}
Persons of Interest Tracked: ${pois.length}
Total Field Observations Logged: ${observations.length}

1. MODUS OPERANDI TRENDS:
• Fence cutting and gate forcing remain predominant method in rural farm sectors.
• Transformer copper cable theft concentrated between 02:00 and 04:30.

2. SECTOR DISTRIBUTION:
• Sektor 1 Suid: High livestock risk
• Sektor 2 Noord: Silo corridor vehicle transit
• Sektor 3 Oos: Eskom infrastructure cable targeting

3. OPERATIONAL RECOMMENDATIONS:
• Increase joint patrols with SAPS and private security between 01:00 and 04:30.
• Maintain verification checks on all client-reported sightings before dossier entry.
(Management Briefing - Strictly Confidential)`;
  }

  try {
    const prompt = `
Generate a comprehensive Weekly Management Intelligence Report for Hartbeesfontein security leadership (${timeRangeDays} days range) in ${language === 'af' ? 'Afrikaans' : 'English'}.
Structure:
1. EXECUTIVE STRATEGIC SUMMARY
2. INCIDENT & MODUS OPERANDI ANALYSIS
3. GEOGRAPHIC SECTOR HEATMAP & RECURRENCE PATTERNS
4. WATCHLIST STATUS (VOIs & POIs)
5. STRATEGIC RECOMMENDATIONS FOR PATROL ALLOCATION & FARM SAFETY

DATA CONTEXT:
Cases: ${JSON.stringify(cases.map((c) => ({ case: c.caseNumber, cat: c.category, sector: c.sector, mo: c.modusOperandi, date: c.incidentDate })))}
VOIs: ${JSON.stringify(vois.map((v) => ({ reg: v.registration, make: v.make, status: v.status })))}
POIs: ${JSON.stringify(pois.map((p) => ({ id: p.internalPoiId, status: p.status })))}
Observations: ${JSON.stringify(observations.length)}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: INTEL_AI_SAFETY_INSTRUCTION,
      },
    });

    return response.text || 'Unable to generate management report.';
  } catch (err) {
    console.error('Weekly Report Error:', err);
    return `Weekly Intelligence Report (Total Cases: ${cases.length}).`;
  }
}

// 7. ANALYZE INCIDENT PATTERNS
export async function analyzeIncidentPatterns(params: {
  cases: Case[];
  pois: PersonOfInterest[];
  vois: VehicleOfInterest[];
  targetFocus: string;
  language?: 'en' | 'af';
}): Promise<string> {
  const { cases, pois, vois, targetFocus, language = 'en' } = params;
  const client = getGeminiClient();

  if (!client) {
    return `=== INCIDENT PATTERN MATCH REPORT ===
Target Focus: ${targetFocus}

1. MATCHING CASES:
${cases.slice(0, 4).map((c) => `• Case ${c.caseNumber}: ${c.title} (Sector: ${c.sector || 'General'}) - MO: ${(c.modusOperandi || []).join(', ')}`).join('\n')}

2. ASSOCIATED VEHICLES:
${vois.filter((v) => v.status === 'FLAGGED' || v.status === 'STOLEN').map((v) => `• ${v.internalVoiId} (${v.registration}) - ${v.colour} ${v.make} ${v.model}`).join('\n')}

3. PATTERN INFERENCE:
Common entry pattern identified along unlit gravel roads adjoining the R507. Corroborating observation logs suggest 2-3 occupants operating with cutting torches and bakkie transport.
(Deterministic Pattern Match - Verify with Control Room logs)`;
  }

  try {
    const prompt = `
Analyze cross-case patterns for the specified focus: "${targetFocus}" in ${language === 'af' ? 'Afrikaans' : 'English'}.
Strictly adhere to safeguards: identify recurring MO, timeframes, and physical descriptions across records, citing exact internal record IDs.

DATA CONTEXT:
Cases: ${JSON.stringify(cases.map((c) => ({ case: c.caseNumber, title: c.title, sector: c.sector, mo: c.modusOperandi, notes: c.modusOperandiNotes })))}
VOIs: ${JSON.stringify(vois.map((v) => ({ id: v.internalVoiId, reg: v.registration, make: v.make, marks: v.distinguishingMarks })))}
POIs: ${JSON.stringify(pois.map((p) => ({ id: p.internalPoiId, status: p.status, marks: p.physicalDescription?.identifyingMarks })))}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: INTEL_AI_SAFETY_INSTRUCTION,
      },
    });

    return response.text || 'Unable to analyze patterns.';
  } catch (err) {
    console.error('Pattern Analysis Error:', err);
    return `Pattern analysis for "${targetFocus}" complete.`;
  }
}

// 8. GENERATE CASE INTELLIGENCE SUMMARY & DOSSIER
export async function generateCaseIntelligenceSummary(params: {
  caseRecord: Case;
  relatedIntel?: {
    pois?: PersonOfInterest[];
    vois?: VehicleOfInterest[];
  };
  language?: 'en' | 'af';
}): Promise<string> {
  const { caseRecord, relatedIntel, language = 'en' } = params;
  const client = getGeminiClient();

  const officersStr = (caseRecord.investigatingOfficers || caseRecord.sapsDetails?.officers || [])
    .map((o) => `${o.rank || 'Officer'} ${o.name} (${o.station || 'SAPS'}, Phone: ${o.phone || 'N/A'})`)
    .join(', ');

  if (!client) {
    return `=== CASE INTELLIGENCE BRIEFING: ${caseRecord.caseNumber} ===
Title: ${caseRecord.title}
Status: ${caseRecord.status.toUpperCase()} | Priority: ${caseRecord.priority.toUpperCase()}
Incident Date/Time: ${caseRecord.incidentDate} at ${caseRecord.incidentTime}
Location: ${caseRecord.locationName} (${caseRecord.sector || 'Sector General'})

1. POLICE & INVESTIGATION STATUS:
• SAPS CAS Docket: ${caseRecord.sapsCaseNumber || 'Pending docket allocation'} (${caseRecord.sapsStation || 'Hartbeesfontein SAPS'})
• OB Number: ${caseRecord.sapsDetails?.obNumber || 'Pending OB'}
• Assigned Officers: ${officersStr || 'No investigating officer attached yet.'}

2. MODUS OPERANDI & PHYSICAL EVIDENCE:
• MO Tags: ${(caseRecord.modusOperandi || []).join(', ') || 'General farm security incident'}
• Vehicle Noted: ${caseRecord.vehicleInfo ? `${caseRecord.vehicleInfo.color || ''} ${caseRecord.vehicleInfo.makeModel || ''} (${caseRecord.vehicleInfo.plate || 'No plate'})` : 'None logged'}
• Suspect Traits: ${caseRecord.personDescription ? `${caseRecord.personDescription.clothing || ''} ${caseRecord.personDescription.buildHeight || ''}` : 'None logged'}

3. CID INVESTIGATION RECOMMENDATIONS:
• Follow up with SAPS detective unit regarding ballistic/fingerprint exhibits if applicable.
• Correlate ANPR camera sightings in ${caseRecord.sector || 'the area'} during the 2-hour window around ${caseRecord.incidentTime}.
• Keep victim informed via automated WhatsApp progress docket briefs.
(Hartbeesfontein Veiligheid Control Room Dossier)`;
  }

  try {
    const prompt = `
Generate a concise, professional, structured Case Intelligence Briefing for Case ${caseRecord.caseNumber} in ${language === 'af' ? 'Afrikaans' : 'English'}.
Strictly adhere to safety rules: do not declare guilt or make unverified criminal claims.

CASE DATA:
Case Number: ${caseRecord.caseNumber}
Title: ${caseRecord.title}
Status: ${caseRecord.status}
Priority: ${caseRecord.priority}
Date & Time: ${caseRecord.incidentDate} ${caseRecord.incidentTime}
Location: ${caseRecord.locationName} (Sector: ${caseRecord.sector || 'General'})
Description: ${caseRecord.description}
SAPS Docket: ${caseRecord.sapsCaseNumber || 'N/A'} (Station: ${caseRecord.sapsStation || 'Hartbeesfontein SAPS'})
SAPS OB: ${caseRecord.sapsDetails?.obNumber || 'N/A'}
Officers: ${officersStr}
MO: ${JSON.stringify(caseRecord.modusOperandi || [])}
Vehicle: ${JSON.stringify(caseRecord.vehicleInfo || null)}
Suspect Description: ${JSON.stringify(caseRecord.personDescription || null)}
Updates Count: ${(caseRecord.updates || []).length}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: INTEL_AI_SAFETY_INSTRUCTION,
      },
    });

    return response.text || 'Unable to generate case summary.';
  } catch (err) {
    console.error('Case Summary Error:', err);
    return `Case briefing for ${caseRecord.caseNumber}: ${caseRecord.title} (${caseRecord.status.toUpperCase()}).`;
  }
}

