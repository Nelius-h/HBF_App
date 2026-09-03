import { KmlMapLayer, KmlMapFeature, KmlLayerCategory } from '../types';

/**
 * Parses raw KML/XML text in browser DOMParser to extract Placemarks, Coordinates, Geometries and metadata.
 */
export function parseKmlString(
  fileName: string,
  kmlText: string,
  defaultCategory: KmlLayerCategory = 'CUSTOM'
): {
  name: string;
  description: string;
  features: KmlMapFeature[];
  placemarkCount: number;
} {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
    
    // Check for parse errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      console.warn('KML XML Parse Warning:', parserError[0].textContent);
    }

    const docName = xmlDoc.getElementsByTagName('name')[0]?.textContent || fileName.replace(/\.[^/.]+$/, '');
    const docDesc = xmlDoc.getElementsByTagName('description')[0]?.textContent || `Imported KML Layer from ${fileName}`;

    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    const features: KmlMapFeature[] = [];

    for (let i = 0; i < placemarks.length; i++) {
      const pm = placemarks[i];
      const pName = pm.getElementsByTagName('name')[0]?.textContent || `Placemark #${i + 1}`;
      const pDesc = pm.getElementsByTagName('description')[0]?.textContent || undefined;

      // 1. Point
      const point = pm.getElementsByTagName('Point')[0];
      if (point) {
        const coordsText = point.getElementsByTagName('coordinates')[0]?.textContent?.trim();
        if (coordsText) {
          const parts = coordsText.split(',').map((v) => parseFloat(v.trim()));
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            // KML format is longitude, latitude, (altitude)
            features.push({
              id: `feat-pt-${Date.now()}-${i}`,
              name: pName,
              description: pDesc,
              featureType: 'Point',
              coordinates: [parts[1], parts[0]], // store as [lat, lng]
            });
            continue;
          }
        }
      }

      // 2. LineString
      const lineString = pm.getElementsByTagName('LineString')[0];
      if (lineString) {
        const coordsText = lineString.getElementsByTagName('coordinates')[0]?.textContent?.trim();
        if (coordsText) {
          const coordPairs = coordsText.split(/\s+/).filter(Boolean);
          const coords: [number, number][] = [];
          coordPairs.forEach((pair) => {
            const parts = pair.split(',').map((v) => parseFloat(v.trim()));
            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              coords.push([parts[1], parts[0]]); // [lat, lng]
            }
          });
          if (coords.length > 0) {
            features.push({
              id: `feat-ls-${Date.now()}-${i}`,
              name: pName,
              description: pDesc,
              featureType: 'LineString',
              coordinates: coords,
            });
            continue;
          }
        }
      }

      // 3. Polygon
      const polygon = pm.getElementsByTagName('Polygon')[0];
      if (polygon) {
        const coordsText = polygon.getElementsByTagName('coordinates')[0]?.textContent?.trim();
        if (coordsText) {
          const coordPairs = coordsText.split(/\s+/).filter(Boolean);
          const coords: [number, number][] = [];
          coordPairs.forEach((pair) => {
            const parts = pair.split(',').map((v) => parseFloat(v.trim()));
            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              coords.push([parts[1], parts[0]]); // [lat, lng]
            }
          });
          if (coords.length > 0) {
            features.push({
              id: `feat-poly-${Date.now()}-${i}`,
              name: pName,
              description: pDesc,
              featureType: 'Polygon',
              coordinates: coords,
            });
            continue;
          }
        }
      }
    }

    return {
      name: docName,
      description: docDesc,
      features,
      placemarkCount: features.length,
    };
  } catch (err) {
    console.error('Failed to parse KML string:', err);
    return {
      name: fileName.replace(/\.[^/.]+$/, ''),
      description: `Uploaded file: ${fileName}`,
      features: [],
      placemarkCount: 0,
    };
  }
}

export const INITIAL_KML_LAYERS: KmlMapLayer[] = [
  {
    id: 'kml-layer-001',
    name: 'Hartbeesfontein Sektor Afbakenings (Sektor A, B & C)',
    description: 'Amptelike veiligheidsgrense van Sektor A (Dorp), Sektor B (Noord-Plase) en Sektor C (Suid-R503).',
    category: 'SECTOR_BOUNDARIES',
    version: '2026.2',
    uploadedByUid: 'user-mgmt-001',
    uploadedByName: 'Fanie Botha',
    uploadedAt: '2026-02-10T08:00:00.000Z',
    isActive: true,
    visibilityRoles: ['CLIENT', 'CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT'],
    colorHex: '#3b82f6',
    placemarkCount: 3,
    features: [
      {
        id: 'feat-sec-a',
        name: 'Sektor A - Dorp & Buurtwag',
        description: 'Hartbeesfontein dorpskern en onmiddellike kleinhoewes.',
        featureType: 'Polygon',
        color: '#3b82f6',
        coordinates: [
          [-26.758, 26.398],
          [-26.755, 26.415],
          [-26.772, 26.425],
          [-26.779, 26.402],
          [-26.758, 26.398],
        ],
      },
      {
        id: 'feat-sec-b',
        name: 'Sektor B - Noordelike Plase & Brakspruit',
        description: 'Brakspruit, Klippan, Buffelsvlei en noordelike landbougebied.',
        featureType: 'Polygon',
        color: '#10b981',
        coordinates: [
          [-26.735, 26.380],
          [-26.720, 26.420],
          [-26.755, 26.415],
          [-26.758, 26.398],
          [-26.735, 26.380],
        ],
      },
      {
        id: 'feat-sec-c',
        name: 'Sektor C - R503 Suid & Doornplaat',
        description: 'Doornplaat, Rietkuil, R503 korridor na Klerksdorp/Coligny.',
        featureType: 'Polygon',
        color: '#f59e0b',
        coordinates: [
          [-26.772, 26.425],
          [-26.779, 26.402],
          [-26.810, 26.420],
          [-26.805, 26.455],
          [-26.772, 26.425],
        ],
      },
    ],
  },
  {
    id: 'kml-layer-002',
    name: 'Nood Waterpunte & Brandbestryding Damme',
    description: 'Geïdentifiseerde hoë-kapasiteit damme, brandpunte en koppeling-koördinate vir reaksievoertuie.',
    category: 'WATER_POINTS',
    version: '2026.1',
    uploadedByUid: 'user-ctrl-001',
    uploadedByName: 'Kobus van der Merwe',
    uploadedAt: '2026-02-12T14:30:00.000Z',
    isActive: true,
    visibilityRoles: ['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT'],
    colorHex: '#06b6d4',
    placemarkCount: 4,
    features: [
      {
        id: 'feat-wp-1',
        name: 'Brakspruit Hoofdam (50,000L Pompstasie)',
        description: '3-duim camlock koppeling, 24/7 oop sonder hekslot.',
        featureType: 'Point',
        color: '#06b6d4',
        icon: 'droplet',
        coordinates: [-26.745, 26.392],
      },
      {
        id: 'feat-wp-2',
        name: 'Doornplaat Noodtenk (20,000L Sonkrag-Boorgat)',
        description: 'Boorgat met sonkragpomp en tenk by suidelike hek.',
        featureType: 'Point',
        color: '#06b6d4',
        icon: 'droplet',
        coordinates: [-26.788, 26.435],
      },
      {
        id: 'feat-wp-3',
        name: 'Sektor A Silo Brandkraan',
        description: 'Munisipale hoëdruk brandkraan by Graansilo.',
        featureType: 'Point',
        color: '#06b6d4',
        icon: 'droplet',
        coordinates: [-26.763, 26.408],
      },
      {
        id: 'feat-wp-4',
        name: 'Klippan Brandweer Pompdam',
        description: 'Natuurlike gronddam met gruis-toegang vir vragmotors.',
        featureType: 'Point',
        color: '#06b6d4',
        icon: 'droplet',
        coordinates: [-26.728, 26.411],
      },
    ],
  },
  {
    id: 'kml-layer-003',
    name: 'VHF Radiotoring Herhalers & Lyn-van-Sig Relais',
    description: 'Strategiese herhalers op Hartbeesfontein Kop en Doornplaat Hoë-Terugvoer.',
    category: 'RADIO_REPEATERS',
    version: '2026.1',
    uploadedByUid: 'user-ctrl-001',
    uploadedByName: 'Kobus van der Merwe',
    uploadedAt: '2026-02-14T09:15:00.000Z',
    isActive: true,
    visibilityRoles: ['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT'],
    colorHex: '#8b5cf6',
    placemarkCount: 2,
    features: [
      {
        id: 'feat-rad-1',
        name: 'Herhaler 1: Hartbeesfontein Koppie (K1)',
        description: 'VHF 155.825 MHz - Primêre noodkanaal met battery & sonkrag rugsteun.',
        featureType: 'Point',
        color: '#8b5cf6',
        icon: 'radio',
        coordinates: [-26.751, 26.388],
      },
      {
        id: 'feat-rad-2',
        name: 'Herhaler 2: Doornplaat Hoësit (K2)',
        description: 'VHF 155.950 MHz - Suidelike dekkingsveld na Klerksdorp grens.',
        featureType: 'Point',
        color: '#8b5cf6',
        icon: 'radio',
        coordinates: [-26.802, 26.442],
      },
    ],
  },
  {
    id: 'kml-layer-004',
    name: 'Afgespreekte Nood-Versamelpunte & Ambulans-Oordrag',
    description: 'Veilige helikopterlandingsones (LZ) en noodvoertuig versamelpunte.',
    category: 'STAGING_POINTS',
    version: '2026.1',
    uploadedByUid: 'user-mgmt-001',
    uploadedByName: 'Fanie Botha',
    uploadedAt: '2026-02-15T11:00:00.000Z',
    isActive: true,
    visibilityRoles: ['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT'],
    colorHex: '#10b981',
    placemarkCount: 2,
    features: [
      {
        id: 'feat-stg-1',
        name: 'LZ 1: Hartbeesfontein Rugbyveld Heli-pad',
        description: 'Geskik vir Netcare 911 / HALO lugambulans naglandings met spreiligte.',
        featureType: 'Point',
        color: '#10b981',
        icon: 'crosshair',
        coordinates: [-26.764, 26.412],
      },
      {
        id: 'feat-stg-2',
        name: 'Staging 2: R503 / Brakspruit Kruising T-Aansluiting',
        description: 'Wye gruisskouer vir blokkades, padblokkades en polisie-ontmoetingspunt.',
        featureType: 'Point',
        color: '#10b981',
        icon: 'crosshair',
        coordinates: [-26.756, 26.428],
      },
    ],
  },
  {
    id: 'kml-layer-005',
    name: 'Hoë-Risiko Korridor: R503 Deurpad Buffelsone',
    description: 'Strategiese waarnemingsgebied vir vinnige wegkom-roetes en BOLO-monitering.',
    category: 'HIGH_RISK_ZONES',
    version: '2026.1',
    uploadedByUid: 'user-mgmt-001',
    uploadedByName: 'Fanie Botha',
    uploadedAt: '2026-02-16T16:00:00.000Z',
    isActive: true,
    visibilityRoles: ['CONTROL_ROOM', 'REACTION_FORCE', 'MANAGEMENT'],
    colorHex: '#ef4444',
    placemarkCount: 1,
    features: [
      {
        id: 'feat-corridor-1',
        name: 'R503 Hoofpad Buffer (Coligny na Klerksdorp)',
        description: 'Primêre transito-roete vir verdagte voertuie en veediefstal-bewegings.',
        featureType: 'LineString',
        color: '#ef4444',
        coordinates: [
          [-26.720, 26.350],
          [-26.745, 26.395],
          [-26.765, 26.425],
          [-26.795, 26.460],
          [-26.820, 26.490],
        ],
      },
    ],
  },
];
