import { Case } from '../types';

/**
 * Official Stock Theft (VIS - Veediefstal Inligting Stelsel) Consolidated Incident Register
 * Hartbeesfontein / Klerksdorp Region
 * Total Unique Cases: 176
 * Date Range: 2023-09-12 to 2025-10-31
 * Sources: April 2025 VIS • Aug 2023–Jun 2024 VIS • Oct 2025 VIS • Nov 2025 VIS
 */
export const ACTUAL_VIS_CASES: Case[] = [
  {
    "id": "CASE-VIS-HBF-001",
    "caseNumber": "VIS-HBF-2025-001",
    "title": "Veediefstal: 20 Cows - Cobus de Jager Trust (Renosterhoek)",
    "description": "KLAER / KONTAK: Cobus de Jager. AREA / PLAAS: Renosterhoek. GESTEEL: 20 Cows. STATUS: 2 Herwin | 17 Vermis | 1 Geslag. Gesteel Koördinate: 26°50'55.9\"S 26°25'33.3\"E. Gevind Koördinate: 26°53'58.4\"S 26°35'06.6\"E. Slagplek Koördinate: 26°53'58.4\"S 26°35'06.6\"E. Draadsnyding Koördinate: 26°51'03.4\"S 26°26'18.0\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-001",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-31",
    "incidentTime": "02:00",
    "locationName": "Renosterhoek (Cobus de Jager Trust)",
    "sector": "Sektor Renosterhoek",
    "gpsLocation": {
      "latitude": -26.848861,
      "longitude": 26.425917
    },
    "reportedByUid": "USR-CLIENT-016",
    "reportedByName": "Cobus de Jager Trust",
    "reportedByPhone": "+27 83 650 7383",
    "victimUid": "USR-CLIENT-016",
    "victimName": "Cobus de Jager Trust",
    "victimPhone": "+27 83 650 7383",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 20 Cows | Herwin: 2 | Vermis: 17 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°51'03.4\"S 26°26'18.0\"E. Veldslagting toneel by: 26°53'58.4\"S 26°35'06.6\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-001-1",
        "caseId": "CASE-VIS-HBF-001",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind. Gevind by koördinate: 26°53'58.4\"S 26°35'06.6\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.899556,
          "longitude": 26.585167
        },
        "timestamp": "2025-10-31T10:00:00Z"
      },
      {
        "id": "UPD-VIS-001-2",
        "caseId": "CASE-VIS-HBF-001",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag. Slagplek koördinate: 26°53'58.4\"S 26°35'06.6\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.899556,
          "longitude": 26.585167
        },
        "timestamp": "2025-10-31T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-31T06:00:00Z",
    "updatedAt": "2025-10-31T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-002",
    "caseNumber": "VIS-HBF-2025-002",
    "title": "Veediefstal: 17 Cows - James Lang (Nooitgedacht KLD)",
    "description": "KLAER / KONTAK: Steven Lang. AREA / PLAAS: Nooitgedacht KLD. GESTEEL: 17 Cows. STATUS: 2 Herwin | 0 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-002",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-28",
    "incidentTime": "02:00",
    "locationName": "Nooitgedacht KLD (James Lang)",
    "sector": "Sektor Renosterhoek",
    "reportedByUid": "USR-CLIENT-057",
    "reportedByName": "James Lang",
    "reportedByPhone": "+27 82 545 6893",
    "victimUid": "USR-CLIENT-057",
    "victimName": "James Lang",
    "victimPhone": "+27 82 545 6893",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 17 Cows | Herwin: 2 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-002-1",
        "caseId": "CASE-VIS-HBF-002",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-10-28T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-28T06:00:00Z",
    "updatedAt": "2025-10-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-003",
    "caseNumber": "VIS-HBF-2025-003",
    "title": "Veediefstal: Unknown Amt. Calves - Andries (Vee-arts) Nel (Meliodora)",
    "description": "KLAER / KONTAK: M. Nel. AREA / PLAAS: Meliodora. GESTEEL: Unknown Amt. Calves. STATUS: 0 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°48'41.1\"S 26°06'19.9\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-003",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-28",
    "incidentTime": "02:00",
    "locationName": "Meliodora (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.811417,
      "longitude": 26.105528
    },
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: Unknown Amt. Calves | Herwin: 0 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-28T06:00:00Z",
    "updatedAt": "2025-10-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-004",
    "caseNumber": "VIS-HBF-2025-004",
    "title": "Veediefstal: 3 Cows - Stephan - Jopie Grobler (Harrisburg)",
    "description": "KLAER / KONTAK: Stephan - Jopie Grobler. AREA / PLAAS: Harrisburg. GESTEEL: 3 Cows. STATUS: 0 Herwin | 3 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-004",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-28",
    "incidentTime": "02:00",
    "locationName": "Harrisburg (Stephan - Jopie Grobler)",
    "sector": "Sektor Harrisburg",
    "reportedByUid": "USR-VIS-REC-004",
    "reportedByName": "Stephan - Jopie Grobler",
    "reportedByPhone": "",
    "victimName": "Stephan - Jopie Grobler",
    "victimPhone": "",
    "victimFarmName": "Harrisburg",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 0 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-28T06:00:00Z",
    "updatedAt": "2025-10-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-005",
    "caseNumber": "VIS-HBF-2025-005",
    "title": "Veediefstal: 14 Cows 11 Calves - Gert Wessels (Schoemansfontein)",
    "description": "KLAER / KONTAK: Gert Wessels. AREA / PLAAS: Schoemansfontein. GESTEEL: 14 Cows 11 Calves. STATUS: 13 Herwin | 8 Vermis | 3 Geslag. Gesteel Koördinate: 26°46'54.6\"S 26°29'00.7\"E. Gevind Koördinate: 26°54'25.2\"S 26°37'08.6\"E. Slagplek Koördinate: 26°54'24.9\"S 26°37'11.1\"E. Draadsnyding Koördinate: 26°51'03.4\"S 26°26'18.0\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-005",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-25",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Gert Wessels)",
    "sector": "Sektor Bothaville / Doornhout",
    "gpsLocation": {
      "latitude": -26.781833,
      "longitude": 26.483528
    },
    "reportedByUid": "USR-CLIENT-121",
    "reportedByName": "Gert Wessels",
    "reportedByPhone": "+27 82 575 3457",
    "victimUid": "USR-CLIENT-121",
    "victimName": "Gert Wessels",
    "victimPhone": "+27 82 575 3457",
    "victimFarmName": "Doornhoutrivier",
    "personDescription": {
      "notes": "Gesteel: 14 Cows 11 Calves | Herwin: 13 | Vermis: 8 | Geslag: 3"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°51'03.4\"S 26°26'18.0\"E. Veldslagting toneel by: 26°54'24.9\"S 26°37'11.1\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-005-1",
        "caseId": "CASE-VIS-HBF-005",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 13 diere herwin/teruggevind. Gevind by koördinate: 26°54'25.2\"S 26°37'08.6\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.907,
          "longitude": 26.619056
        },
        "timestamp": "2025-10-25T10:00:00Z"
      },
      {
        "id": "UPD-VIS-005-2",
        "caseId": "CASE-VIS-HBF-005",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 3 diere geslag. Slagplek koördinate: 26°54'24.9\"S 26°37'11.1\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.906917,
          "longitude": 26.61975
        },
        "timestamp": "2025-10-25T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-25T06:00:00Z",
    "updatedAt": "2025-10-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-006",
    "caseNumber": "VIS-HBF-2025-006",
    "title": "Veediefstal: 60 Sheep - Karin Basson (Kafferskraal)",
    "description": "KLAER / KONTAK: Karin Basson. AREA / PLAAS: Kafferskraal. GESTEEL: 60 Sheep. STATUS: 0 Herwin | 60 Vermis | 0 Geslag. Gesteel Koördinate: 26°50'08.5\"S 26°35'09.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-006",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-18",
    "incidentTime": "02:00",
    "locationName": "Kafferskraal (Karin Basson)",
    "sector": "Sektor Kafferskraal",
    "gpsLocation": {
      "latitude": -26.835694,
      "longitude": 26.585861
    },
    "reportedByUid": "USR-VIS-REC-006",
    "reportedByName": "Karin Basson",
    "reportedByPhone": "",
    "victimName": "Karin Basson",
    "victimPhone": "",
    "victimFarmName": "Kafferskraal",
    "personDescription": {
      "notes": "Gesteel: 60 Sheep | Herwin: 0 | Vermis: 60 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-18T06:00:00Z",
    "updatedAt": "2025-10-18T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-007",
    "caseNumber": "VIS-HBF-2025-007",
    "title": "Veediefstal: 1 Cows - Cobus Van Zyl (Harrisburg)",
    "description": "KLAER / KONTAK: Cobus van Zyl. AREA / PLAAS: Harrisburg. GESTEEL: 1 Cows. STATUS: 1 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 27°04'54.2\"S 26°22'29.9\"E. Gevind Koördinate: 27°05'14.9\"S 26°22'58.8\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-007",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-17",
    "incidentTime": "02:00",
    "locationName": "Harrisburg (Cobus Van Zyl)",
    "sector": "Sektor Opraap",
    "gpsLocation": {
      "latitude": -27.081722,
      "longitude": 26.374972
    },
    "reportedByUid": "USR-CLIENT-111",
    "reportedByName": "Cobus Van Zyl",
    "reportedByPhone": "+27 83 283 7076",
    "victimUid": "USR-CLIENT-111",
    "victimName": "Cobus Van Zyl",
    "victimPhone": "+27 83 283 7076",
    "victimFarmName": "Opraap",
    "personDescription": {
      "notes": "Gesteel: 1 Cows | Herwin: 1 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-007-1",
        "caseId": "CASE-VIS-HBF-007",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind. Gevind by koördinate: 27°05'14.9\"S 26°22'58.8\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.087472,
          "longitude": 26.383
        },
        "timestamp": "2025-10-17T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-17T06:00:00Z",
    "updatedAt": "2025-10-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-008",
    "caseNumber": "VIS-HBF-2025-008",
    "title": "Veediefstal: 8 Cows - Johan Pollard (Klippan)",
    "description": "KLAER / KONTAK: Johan Pollard. AREA / PLAAS: Klippan. GESTEEL: 8 Cows. STATUS: 1 Herwin | 7 Vermis | 0 Geslag. Gesteel Koördinate: 26°59'26.3\"S 26°20'59.3\"E. Gevind Koördinate: 26°54'17.2\"S 26°28'34.5\"E. Draadsnyding Koördinate: 26°58'36.2\"S 26°21'51.5\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-008",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-14",
    "incidentTime": "02:00",
    "locationName": "Klippan (Johan Pollard)",
    "sector": "Sektor Renosterhoek",
    "gpsLocation": {
      "latitude": -26.990639,
      "longitude": 26.349806
    },
    "reportedByUid": "USR-CLIENT-081",
    "reportedByName": "Johan Pollard",
    "reportedByPhone": "+27 82 635 9797",
    "victimUid": "USR-CLIENT-081",
    "victimName": "Johan Pollard",
    "victimPhone": "+27 82 635 9797",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 8 Cows | Herwin: 1 | Vermis: 7 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°58'36.2\"S 26°21'51.5\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-008-1",
        "caseId": "CASE-VIS-HBF-008",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind. Gevind by koördinate: 26°54'17.2\"S 26°28'34.5\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.904778,
          "longitude": 26.47625
        },
        "timestamp": "2025-10-14T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-14T06:00:00Z",
    "updatedAt": "2025-10-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-009",
    "caseNumber": "VIS-HBF-2025-009",
    "title": "Veediefstal: 19 Cows - Andries (Vee-arts) Nel (Bamboesspruit)",
    "description": "KLAER / KONTAK: M Nel. AREA / PLAAS: Bamboesspruit. GESTEEL: 19 Cows. STATUS: 0 Herwin | 19 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-009",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-08",
    "incidentTime": "02:00",
    "locationName": "Bamboesspruit (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 19 Cows | Herwin: 0 | Vermis: 19 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-08T06:00:00Z",
    "updatedAt": "2025-10-08T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-010",
    "caseNumber": "VIS-HBF-2025-010",
    "title": "Veediefstal: 12 Cows - Andries (Vee-arts) Nel (Meliodora)",
    "description": "KLAER / KONTAK: M Nel. AREA / PLAAS: Meliodora. GESTEEL: 12 Cows. STATUS: 8 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°48'41.1\"S 26°06'19.9\"E. Gevind Koördinate: 26°44'39.1\"S 26°24'38.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-010",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-06",
    "incidentTime": "02:00",
    "locationName": "Meliodora (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.811417,
      "longitude": 26.105528
    },
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 12 Cows | Herwin: 8 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-010-1",
        "caseId": "CASE-VIS-HBF-010",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 8 diere herwin/teruggevind. Gevind by koördinate: 26°44'39.1\"S 26°24'38.1\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.744194,
          "longitude": 26.410583
        },
        "timestamp": "2025-10-06T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-06T06:00:00Z",
    "updatedAt": "2025-10-06T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-011",
    "caseNumber": "VIS-HBF-2025-011",
    "title": "Veediefstal: 5 Cows - Andries (Vee-arts) Nel (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: M Nel. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 5 Cows. STATUS: 5 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'27.3\"S 26°17'55.5\"E. Gevind Koördinate: 26°49'20.1\"S 26°20'04.6\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-011",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-06",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.82425,
      "longitude": 26.29875
    },
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 5 Cows | Herwin: 5 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-011-1",
        "caseId": "CASE-VIS-HBF-011",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 5 diere herwin/teruggevind. Gevind by koördinate: 26°49'20.1\"S 26°20'04.6\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.82225,
          "longitude": 26.334611
        },
        "timestamp": "2025-10-06T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-06T06:00:00Z",
    "updatedAt": "2025-10-06T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-012",
    "caseNumber": "VIS-HBF-2025-012",
    "title": "Veediefstal: 5 Cows - Willie Lemmer Trust (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: John Lemmer. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 5 Cows. STATUS: 0 Herwin | 5 Vermis | 0 Geslag. Gesteel Koördinate: 26°48'08.7\"S 26°23'22.5\"E. Draadsnyding Koördinate: 26°48'01.6\"S 26°25'33.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-012",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-03",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Willie Lemmer Trust)",
    "sector": "Sektor Lemmersville",
    "gpsLocation": {
      "latitude": -26.802417,
      "longitude": 26.389583
    },
    "reportedByUid": "USR-CLIENT-059",
    "reportedByName": "Willie Lemmer Trust",
    "reportedByPhone": "+27 71 687 0543",
    "victimUid": "USR-CLIENT-059",
    "victimName": "Willie Lemmer Trust",
    "victimPhone": "+27 71 687 0543",
    "victimFarmName": "Lemmersville",
    "personDescription": {
      "notes": "Gesteel: 5 Cows | Herwin: 0 | Vermis: 5 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°48'01.6\"S 26°25'33.1\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-03T06:00:00Z",
    "updatedAt": "2025-10-03T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-013",
    "caseNumber": "VIS-HBF-2025-013",
    "title": "Veediefstal: 12 Cows - Hendrik Badenhorst (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: Hendrik Badenhorst. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 12 Cows. STATUS: 6 Herwin | 0 Vermis | 6 Geslag. Gesteel Koördinate: 26°48'38.7\"S 26°19'52.7\"E. Gevind Koördinate: 26°50'44.8\"S 26°33'23.9\"E. Slagplek Koördinate: 26°47'58.8\"S 26°22'25.3\"E. Draadsnyding Koördinate: 26°48'11.7\"S 26°22'09.4\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-013",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-10-03",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Hendrik Badenhorst)",
    "sector": "Sektor Witfontein",
    "gpsLocation": {
      "latitude": -26.81075,
      "longitude": 26.331306
    },
    "reportedByUid": "USR-CLIENT-001",
    "reportedByName": "Hendrik Badenhorst",
    "reportedByPhone": "+27 82 669 7805",
    "victimUid": "USR-CLIENT-001",
    "victimName": "Hendrik Badenhorst",
    "victimPhone": "+27 82 669 7805",
    "victimFarmName": "Witfontein",
    "personDescription": {
      "notes": "Gesteel: 12 Cows | Herwin: 6 | Vermis: 0 | Geslag: 6"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°48'11.7\"S 26°22'09.4\"E. Veldslagting toneel by: 26°47'58.8\"S 26°22'25.3\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-013-1",
        "caseId": "CASE-VIS-HBF-013",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind. Gevind by koördinate: 26°50'44.8\"S 26°33'23.9\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.845778,
          "longitude": 26.556639
        },
        "timestamp": "2025-10-03T10:00:00Z"
      },
      {
        "id": "UPD-VIS-013-2",
        "caseId": "CASE-VIS-HBF-013",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 6 diere geslag. Slagplek koördinate: 26°47'58.8\"S 26°22'25.3\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.799667,
          "longitude": 26.373694
        },
        "timestamp": "2025-10-03T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-10-03T06:00:00Z",
    "updatedAt": "2025-10-03T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-014",
    "caseNumber": "VIS-HBF-2025-014",
    "title": "Veediefstal: 27 Cows - Johan Pollard (Renosterspruit)",
    "description": "KLAER / KONTAK: Johan Pollard. AREA / PLAAS: Renosterspruit. GESTEEL: 27 Cows. STATUS: 27 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°53'07.9\"S 26°22'56.2\"E. Gevind Koördinate: 26°48'17.1\"S 26°34'34.5\"E. Draadsnyding Koördinate: 26°50'18.6\"S 26°31'56.6\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-014",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-27",
    "incidentTime": "02:00",
    "locationName": "Renosterspruit (Johan Pollard)",
    "sector": "Sektor Renosterhoek",
    "gpsLocation": {
      "latitude": -26.885528,
      "longitude": 26.382278
    },
    "reportedByUid": "USR-CLIENT-081",
    "reportedByName": "Johan Pollard",
    "reportedByPhone": "+27 82 635 9797",
    "victimUid": "USR-CLIENT-081",
    "victimName": "Johan Pollard",
    "victimPhone": "+27 82 635 9797",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 27 Cows | Herwin: 27 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°50'18.6\"S 26°31'56.6\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-014-1",
        "caseId": "CASE-VIS-HBF-014",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 27 diere herwin/teruggevind. Gevind by koördinate: 26°48'17.1\"S 26°34'34.5\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.80475,
          "longitude": 26.57625
        },
        "timestamp": "2025-09-27T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-27T06:00:00Z",
    "updatedAt": "2025-09-27T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-015",
    "caseNumber": "VIS-HBF-2025-015",
    "title": "Veediefstal: 8 Cows - Rudi Loots (Lemoenfontein)",
    "description": "KLAER / KONTAK: Rudi Loots. AREA / PLAAS: Lemoenfontein. GESTEEL: 8 Cows. STATUS: 8 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°36'21.2\"S 26°25'02.9\"E. Gevind Koördinate: 26°35'54.5\"S 26°25'27.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-015",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-25",
    "incidentTime": "02:00",
    "locationName": "Lemoenfontein (Rudi Loots)",
    "sector": "Sektor Lemoenfontein",
    "gpsLocation": {
      "latitude": -26.605889,
      "longitude": 26.417472
    },
    "reportedByUid": "USR-CLIENT-063",
    "reportedByName": "Rudi Loots",
    "reportedByPhone": "+27 83 652 2136",
    "victimUid": "USR-CLIENT-063",
    "victimName": "Rudi Loots",
    "victimPhone": "+27 83 652 2136",
    "victimFarmName": "Lemoenfontein",
    "personDescription": {
      "notes": "Gesteel: 8 Cows | Herwin: 8 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-015-1",
        "caseId": "CASE-VIS-HBF-015",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 8 diere herwin/teruggevind. Gevind by koördinate: 26°35'54.5\"S 26°25'27.1\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.598472,
          "longitude": 26.424194
        },
        "timestamp": "2025-09-25T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-25T06:00:00Z",
    "updatedAt": "2025-09-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-016",
    "caseNumber": "VIS-HBF-2025-016",
    "title": "Veediefstal: 7 Cows - A Greef (Brakspruit)",
    "description": "KLAER / KONTAK: A Greef. AREA / PLAAS: Brakspruit. GESTEEL: 7 Cows. STATUS: 7 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°40'21.4\"S 26°34'47.9\"E. Gevind Koördinate: 26°40'35.8\"S 26°34'27.2\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-016",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-23",
    "incidentTime": "02:00",
    "locationName": "Brakspruit (A Greef)",
    "sector": "Sektor Brakspruit",
    "gpsLocation": {
      "latitude": -26.672611,
      "longitude": 26.579972
    },
    "reportedByUid": "USR-VIS-REC-016",
    "reportedByName": "A Greef",
    "reportedByPhone": "",
    "victimName": "A Greef",
    "victimPhone": "",
    "victimFarmName": "Brakspruit",
    "personDescription": {
      "notes": "Gesteel: 7 Cows | Herwin: 7 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-016-1",
        "caseId": "CASE-VIS-HBF-016",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 7 diere herwin/teruggevind. Gevind by koördinate: 26°40'35.8\"S 26°34'27.2\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.676611,
          "longitude": 26.574222
        },
        "timestamp": "2025-09-23T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-23T06:00:00Z",
    "updatedAt": "2025-09-23T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-017",
    "caseNumber": "VIS-HBF-2025-017",
    "title": "Veediefstal: 14 Sheep - Wansen Engelbrecht (Wolwerand)",
    "description": "KLAER / KONTAK: W Engelbrecht. AREA / PLAAS: Wolwerand. GESTEEL: 14 Sheep. STATUS: 14 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'53.9\"S 26°29'38.7\"E. Gevind Koördinate: 26°51'23.2\"S 26°29'42.6\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-017",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-19",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wansen Engelbrecht)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.864972,
      "longitude": 26.494083
    },
    "reportedByUid": "USR-CLIENT-027",
    "reportedByName": "Wansen Engelbrecht",
    "reportedByPhone": "+27 83 304 9388",
    "victimUid": "USR-CLIENT-027",
    "victimName": "Wansen Engelbrecht",
    "victimPhone": "+27 83 304 9388",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 14 Sheep | Herwin: 14 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-017-1",
        "caseId": "CASE-VIS-HBF-017",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 14 diere herwin/teruggevind. Gevind by koördinate: 26°51'23.2\"S 26°29'42.6\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.856444,
          "longitude": 26.495167
        },
        "timestamp": "2025-09-19T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-19T06:00:00Z",
    "updatedAt": "2025-09-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-018",
    "caseNumber": "VIS-HBF-2025-018",
    "title": "Veediefstal: 6 Cows - Jaco van der Werwe (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: Jaco van der Werwe. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 6 Cows. STATUS: 0 Herwin | 6 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'47.6\"S 26°23'49.4\"E. Draadsnyding Koördinate: 26°51'53.9\"S 26°23'19.2\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-018",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-17",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Jaco van der Werwe)",
    "sector": "Sektor Oorbietjiesfontein",
    "gpsLocation": {
      "latitude": -26.863222,
      "longitude": 26.397056
    },
    "reportedByUid": "USR-VIS-REC-018",
    "reportedByName": "Jaco van der Werwe",
    "reportedByPhone": "",
    "victimName": "Jaco van der Werwe",
    "victimPhone": "",
    "victimFarmName": "Oorbietjiesfontein",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 0 | Vermis: 6 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°51'53.9\"S 26°23'19.2\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-17T06:00:00Z",
    "updatedAt": "2025-09-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-019",
    "caseNumber": "VIS-HBF-2025-019",
    "title": "Veediefstal: 29 Cows - Herman Pretorius (Syferfontein)",
    "description": "KLAER / KONTAK: Herman Pretorius jnr. AREA / PLAAS: Syferfontein. GESTEEL: 29 Cows. STATUS: 29 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'50.5\"S 26°19'57.9\"E. Gevind Koördinate: 26°53'40.6\"S 26°27'28.5\"E. Draadsnyding Koördinate: 26°52'29.4\"S 26°24'50.7\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-019",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-17",
    "incidentTime": "02:00",
    "locationName": "Syferfontein (Herman Pretorius)",
    "sector": "Sektor Rietvlei",
    "gpsLocation": {
      "latitude": -26.864028,
      "longitude": 26.33275
    },
    "reportedByUid": "USR-CLIENT-082",
    "reportedByName": "Herman Pretorius",
    "reportedByPhone": "+27 83 450 0323",
    "victimUid": "USR-CLIENT-082",
    "victimName": "Herman Pretorius",
    "victimPhone": "+27 83 450 0323",
    "victimFarmName": "Rietvlei",
    "personDescription": {
      "notes": "Gesteel: 29 Cows | Herwin: 29 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°52'29.4\"S 26°24'50.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-019-1",
        "caseId": "CASE-VIS-HBF-019",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 29 diere herwin/teruggevind. Gevind by koördinate: 26°53'40.6\"S 26°27'28.5\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.894611,
          "longitude": 26.457917
        },
        "timestamp": "2025-09-17T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-17T06:00:00Z",
    "updatedAt": "2025-09-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-020",
    "caseNumber": "VIS-HBF-2025-020",
    "title": "Veediefstal: 21 Cows - Johan Pollard (Renosterspruit)",
    "description": "KLAER / KONTAK: Johan Pollard. AREA / PLAAS: Renosterspruit. GESTEEL: 21 Cows. STATUS: 21 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°53'07.9\"S 26°22'56.2\"E. Gevind Koördinate: 26°52'38.5\"S 26°23'42.9\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-020",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-16",
    "incidentTime": "02:00",
    "locationName": "Renosterspruit (Johan Pollard)",
    "sector": "Sektor Renosterhoek",
    "gpsLocation": {
      "latitude": -26.885528,
      "longitude": 26.382278
    },
    "reportedByUid": "USR-CLIENT-081",
    "reportedByName": "Johan Pollard",
    "reportedByPhone": "+27 82 635 9797",
    "victimUid": "USR-CLIENT-081",
    "victimName": "Johan Pollard",
    "victimPhone": "+27 82 635 9797",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 21 Cows | Herwin: 21 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-020-1",
        "caseId": "CASE-VIS-HBF-020",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 21 diere herwin/teruggevind. Gevind by koördinate: 26°52'38.5\"S 26°23'42.9\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.877361,
          "longitude": 26.39525
        },
        "timestamp": "2025-09-16T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-16T06:00:00Z",
    "updatedAt": "2025-09-16T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-021",
    "caseNumber": "VIS-HBF-2025-021",
    "title": "Veediefstal: 13 Cows - Werner Groenewald (Syferfontein)",
    "description": "KLAER / KONTAK: Werner Groenewald. AREA / PLAAS: Syferfontein. GESTEEL: 13 Cows. STATUS: 0 Herwin | 13 Vermis | 0 Geslag. Gesteel Koördinate: 27°01'40.3\"S 26°19'57.6\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-021",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-16",
    "incidentTime": "02:00",
    "locationName": "Syferfontein (Werner Groenewald)",
    "sector": "Sektor Syferfontein",
    "gpsLocation": {
      "latitude": -27.027861,
      "longitude": 26.332667
    },
    "reportedByUid": "USR-VIS-REC-021",
    "reportedByName": "Werner Groenewald",
    "reportedByPhone": "",
    "victimName": "Werner Groenewald",
    "victimPhone": "",
    "victimFarmName": "Syferfontein",
    "personDescription": {
      "notes": "Gesteel: 13 Cows | Herwin: 0 | Vermis: 13 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-16T06:00:00Z",
    "updatedAt": "2025-09-16T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-022",
    "caseNumber": "VIS-HBF-2025-022",
    "title": "Veediefstal: 4 Bulls - Johann (Dr.) Fourie (Jakkalsfontein)",
    "description": "KLAER / KONTAK: Dr Johan Fourie. AREA / PLAAS: Jakkalsfontein. GESTEEL: 4 Bulls. STATUS: 0 Herwin | 0 Vermis | 4 Geslag. Gesteel Koördinate: 26°56'31.5\"S 26°19'13.7\"E. Slagplek Koördinate: 26°56'58.9\"S 26°19'26.3\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-022",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-14",
    "incidentTime": "02:00",
    "locationName": "Jakkalsfontein (Johann (Dr.) Fourie)",
    "sector": "Sektor Jakkalsfontein",
    "gpsLocation": {
      "latitude": -26.942083,
      "longitude": 26.320472
    },
    "reportedByUid": "USR-CLIENT-033",
    "reportedByName": "Johann (Dr.) Fourie",
    "reportedByPhone": "+27 82 772 7716",
    "victimUid": "USR-CLIENT-033",
    "victimName": "Johann (Dr.) Fourie",
    "victimPhone": "+27 82 772 7716",
    "victimFarmName": "Jakkalsfontein",
    "personDescription": {
      "notes": "Gesteel: 4 Bulls | Herwin: 0 | Vermis: 0 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°56'58.9\"S 26°19'26.3\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-022-2",
        "caseId": "CASE-VIS-HBF-022",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag. Slagplek koördinate: 26°56'58.9\"S 26°19'26.3\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.949694,
          "longitude": 26.323972
        },
        "timestamp": "2025-09-14T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-14T06:00:00Z",
    "updatedAt": "2025-09-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-023",
    "caseNumber": "VIS-HBF-2025-023",
    "title": "Veediefstal: 1 Nyala 1 Emu - Gert Goosen (Geduld)",
    "description": "KLAER / KONTAK: Gert Goosen. AREA / PLAAS: Geduld. GESTEEL: 1 Nyala 1 Emu. STATUS: 0 Herwin | 2 Vermis | 0 Geslag. Gesteel Koördinate: 26°39'07.9\"S 26°26'17.8\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-023",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-13",
    "incidentTime": "02:00",
    "locationName": "Geduld (Gert Goosen)",
    "sector": "Sektor Geduld",
    "gpsLocation": {
      "latitude": -26.652194,
      "longitude": 26.438278
    },
    "reportedByUid": "USR-VIS-REC-023",
    "reportedByName": "Gert Goosen",
    "reportedByPhone": "",
    "victimName": "Gert Goosen",
    "victimPhone": "",
    "victimFarmName": "Geduld",
    "personDescription": {
      "notes": "Gesteel: 1 Nyala 1 Emu | Herwin: 0 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-13T06:00:00Z",
    "updatedAt": "2025-09-13T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-024",
    "caseNumber": "VIS-HBF-2025-024",
    "title": "Veediefstal: 30 Cows - Stephan Cloete (Swartlaagte)",
    "description": "KLAER / KONTAK: Stephan Cloete. AREA / PLAAS: Swartlaagte. GESTEEL: 30 Cows. STATUS: 30 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 27°01'33.6\"S 26°19'38.4\"E. Gevind Koördinate: 27°01'41.0\"S 26°17'08.9\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-024",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-11",
    "incidentTime": "02:00",
    "locationName": "Swartlaagte (Stephan Cloete)",
    "sector": "Sektor Swartlaagte",
    "gpsLocation": {
      "latitude": -27.026,
      "longitude": 26.327333
    },
    "reportedByUid": "USR-VIS-REC-024",
    "reportedByName": "Stephan Cloete",
    "reportedByPhone": "",
    "victimName": "Stephan Cloete",
    "victimPhone": "",
    "victimFarmName": "Swartlaagte",
    "personDescription": {
      "notes": "Gesteel: 30 Cows | Herwin: 30 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-024-1",
        "caseId": "CASE-VIS-HBF-024",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 30 diere herwin/teruggevind. Gevind by koördinate: 27°01'41.0\"S 26°17'08.9\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.028056,
          "longitude": 26.285806
        },
        "timestamp": "2025-09-11T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-11T06:00:00Z",
    "updatedAt": "2025-09-11T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-025",
    "caseNumber": "VIS-HBF-2025-025",
    "title": "Veediefstal: 10 Cows - Hendrik Badenhorst (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: Hendrik Badenhorst. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 10 Cows. STATUS: 0 Herwin | 10 Vermis | 0 Geslag. Gesteel Koördinate: 26°48'38.7\"S 26°19'52.7\"E. Draadsnyding Koördinate: 26°48'11.7\"S 26°22'09.4\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-025",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-04",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Hendrik Badenhorst)",
    "sector": "Sektor Witfontein",
    "gpsLocation": {
      "latitude": -26.81075,
      "longitude": 26.331306
    },
    "reportedByUid": "USR-CLIENT-001",
    "reportedByName": "Hendrik Badenhorst",
    "reportedByPhone": "+27 82 669 7805",
    "victimUid": "USR-CLIENT-001",
    "victimName": "Hendrik Badenhorst",
    "victimPhone": "+27 82 669 7805",
    "victimFarmName": "Witfontein",
    "personDescription": {
      "notes": "Gesteel: 10 Cows | Herwin: 0 | Vermis: 10 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Draad gesny by: 26°48'11.7\"S 26°22'09.4\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-04T06:00:00Z",
    "updatedAt": "2025-09-04T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-026",
    "caseNumber": "VIS-HBF-2025-026",
    "title": "Veediefstal: 3 Cows - Leon van Heerden (Wolwerand)",
    "description": "KLAER / KONTAK: Leon van Heerden. AREA / PLAAS: Wolwerand. GESTEEL: 3 Cows. STATUS: 0 Herwin | 3 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'26.6\"S 26°26'51.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-026",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-03",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Leon van Heerden)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.857389,
      "longitude": 26.447528
    },
    "reportedByUid": "USR-VIS-REC-026",
    "reportedByName": "Leon van Heerden",
    "reportedByPhone": "",
    "victimName": "Leon van Heerden",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 0 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-03T06:00:00Z",
    "updatedAt": "2025-09-03T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-027",
    "caseNumber": "VIS-HBF-2025-027",
    "title": "Veediefstal: 14 Cows - MJ Ernst (Syferfontein)",
    "description": "KLAER / KONTAK: MJ Ernst. AREA / PLAAS: Syferfontein. GESTEEL: 14 Cows. STATUS: 0 Herwin | 14 Vermis | 0 Geslag. Gesteel Koördinate: 27°05'10.7\"S 26°16'33.0\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-027",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-09-02",
    "incidentTime": "02:00",
    "locationName": "Syferfontein (MJ Ernst)",
    "sector": "Sektor Syferfontein",
    "gpsLocation": {
      "latitude": -27.086306,
      "longitude": 26.275833
    },
    "reportedByUid": "USR-VIS-REC-027",
    "reportedByName": "MJ Ernst",
    "reportedByPhone": "",
    "victimName": "MJ Ernst",
    "victimPhone": "",
    "victimFarmName": "Syferfontein",
    "personDescription": {
      "notes": "Gesteel: 14 Cows | Herwin: 0 | Vermis: 14 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-09-02T06:00:00Z",
    "updatedAt": "2025-09-02T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-028",
    "caseNumber": "VIS-HBF-2025-028",
    "title": "Veediefstal: 5 Cows - Josef (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: Josef. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 5 Cows. STATUS: 0 Herwin | 5 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'37.5\"S 26°23'50.5\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-028",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-08-26",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Josef)",
    "sector": "Sektor Oorbietjiesfontein",
    "gpsLocation": {
      "latitude": -26.860417,
      "longitude": 26.397361
    },
    "reportedByUid": "USR-VIS-REC-028",
    "reportedByName": "Josef",
    "reportedByPhone": "",
    "victimName": "Josef",
    "victimPhone": "",
    "victimFarmName": "Oorbietjiesfontein",
    "personDescription": {
      "notes": "Gesteel: 5 Cows | Herwin: 0 | Vermis: 5 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-08-26T06:00:00Z",
    "updatedAt": "2025-08-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-029",
    "caseNumber": "VIS-HBF-2025-029",
    "title": "Veediefstal: 7 Sheep - Wansen Engelbrecht (Wolwerand)",
    "description": "KLAER / KONTAK: W Engelbrecht. AREA / PLAAS: Wolwerand. GESTEEL: 7 Sheep. STATUS: 7 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'53.9\"S 26°29'38.7\"E. Gevind Koördinate: 26°51'23.2\"S 26°29'42.6\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-029",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-08-25",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wansen Engelbrecht)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.864972,
      "longitude": 26.494083
    },
    "reportedByUid": "USR-CLIENT-027",
    "reportedByName": "Wansen Engelbrecht",
    "reportedByPhone": "+27 83 304 9388",
    "victimUid": "USR-CLIENT-027",
    "victimName": "Wansen Engelbrecht",
    "victimPhone": "+27 83 304 9388",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 7 Sheep | Herwin: 7 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-029-1",
        "caseId": "CASE-VIS-HBF-029",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 7 diere herwin/teruggevind. Gevind by koördinate: 26°51'23.2\"S 26°29'42.6\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.856444,
          "longitude": 26.495167
        },
        "timestamp": "2025-08-25T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-08-25T06:00:00Z",
    "updatedAt": "2025-08-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-030",
    "caseNumber": "VIS-HBF-2025-030",
    "title": "Veediefstal: 6 Cows - Japie Grobbelaar (Sendelingsfontein)",
    "description": "KLAER / KONTAK: Japie Grobbelaar. AREA / PLAAS: Sendelingsfontein. GESTEEL: 6 Cows. STATUS: 4 Herwin | 2 Vermis | 0 Geslag. Gesteel Koördinate: 26°54'51.9\"S 26°14'23.5\"E. Gevind Koördinate: 26°55'36.8\"S 26°15'52.5\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-030",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-08-21",
    "incidentTime": "02:00",
    "locationName": "Sendelingsfontein (Japie Grobbelaar)",
    "sector": "Sektor Sendelingsfontein",
    "gpsLocation": {
      "latitude": -26.914417,
      "longitude": 26.239861
    },
    "reportedByUid": "USR-VIS-REC-030",
    "reportedByName": "Japie Grobbelaar",
    "reportedByPhone": "",
    "victimName": "Japie Grobbelaar",
    "victimPhone": "",
    "victimFarmName": "Sendelingsfontein",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 4 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-030-1",
        "caseId": "CASE-VIS-HBF-030",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 4 diere herwin/teruggevind. Gevind by koördinate: 26°55'36.8\"S 26°15'52.5\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.926889,
          "longitude": 26.264583
        },
        "timestamp": "2025-08-21T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-08-21T06:00:00Z",
    "updatedAt": "2025-08-21T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-031",
    "caseNumber": "VIS-HBF-2025-031",
    "title": "Veediefstal: 14 Cows - Wimpie Venter (Renosterspruit)",
    "description": "KLAER / KONTAK: W Venter. AREA / PLAAS: Renosterspruit. GESTEEL: 14 Cows. STATUS: 0 Herwin | 14 Vermis | 0 Geslag. Gesteel Koördinate: 26°55'26.1\"S 26°24'12.6\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-031",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-08-09",
    "incidentTime": "02:00",
    "locationName": "Renosterspruit (Wimpie Venter)",
    "sector": "Sektor Rhenosterspruit",
    "gpsLocation": {
      "latitude": -26.923917,
      "longitude": 26.4035
    },
    "reportedByUid": "USR-CLIENT-114",
    "reportedByName": "Wimpie Venter",
    "reportedByPhone": "+27 82 653 8466",
    "victimUid": "USR-CLIENT-114",
    "victimName": "Wimpie Venter",
    "victimPhone": "+27 82 653 8466",
    "victimFarmName": "Rhenosterspruit",
    "personDescription": {
      "notes": "Gesteel: 14 Cows | Herwin: 0 | Vermis: 14 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-08-09T06:00:00Z",
    "updatedAt": "2025-08-09T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-032",
    "caseNumber": "VIS-HBF-2025-032",
    "title": "Veediefstal: 22 Sheep - Moketsi (Wolwerand)",
    "description": "KLAER / KONTAK: Moketsi. AREA / PLAAS: Wolwerand. GESTEEL: 22 Sheep. STATUS: 3 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'49.0\"S 26°27'22.0\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-032",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-08-04",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Moketsi)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.880278,
      "longitude": 26.456111
    },
    "reportedByUid": "USR-VIS-REC-032",
    "reportedByName": "Moketsi",
    "reportedByPhone": "",
    "victimName": "Moketsi",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 22 Sheep | Herwin: 3 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-032-1",
        "caseId": "CASE-VIS-HBF-032",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 3 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-08-04T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-08-04T06:00:00Z",
    "updatedAt": "2025-08-04T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-033",
    "caseNumber": "VIS-HBF-2025-033",
    "title": "Veediefstal: 19 Cows - Christiaan Erasmus (Jakkalsfontein)",
    "description": "KLAER / KONTAK: Jan Erasmus. AREA / PLAAS: Jakkalsfontein. GESTEEL: 19 Cows. STATUS: 16 Herwin | 3 Vermis | 0 Geslag. Gesteel Koördinate: 26°56'09.2\"S 26°18'16.2\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-033",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-31",
    "incidentTime": "02:00",
    "locationName": "Jakkalsfontein (Christiaan Erasmus)",
    "sector": "Sektor Welgelegen",
    "gpsLocation": {
      "latitude": -26.935889,
      "longitude": 26.3045
    },
    "reportedByUid": "USR-CLIENT-028",
    "reportedByName": "Christiaan Erasmus",
    "reportedByPhone": "+27 84 549 0695",
    "victimUid": "USR-CLIENT-028",
    "victimName": "Christiaan Erasmus",
    "victimPhone": "+27 84 549 0695",
    "victimFarmName": "Welgelegen",
    "personDescription": {
      "notes": "Gesteel: 19 Cows | Herwin: 16 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-033-1",
        "caseId": "CASE-VIS-HBF-033",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 16 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-07-31T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-31T06:00:00Z",
    "updatedAt": "2025-07-31T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-034",
    "caseNumber": "VIS-HBF-2025-034",
    "title": "Veediefstal: 3 Pigs - Ben Botha (Klippan)",
    "description": "KLAER / KONTAK: Danie Botha. AREA / PLAAS: Klippan. GESTEEL: 3 Pigs. STATUS: 0 Herwin | 3 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'39.5\"S 26°11'33.9\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-034",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-26",
    "incidentTime": "02:00",
    "locationName": "Klippan (Ben Botha)",
    "sector": "Sektor Brakspruit",
    "gpsLocation": {
      "latitude": -26.744306,
      "longitude": 26.19275
    },
    "reportedByUid": "USR-CLIENT-009",
    "reportedByName": "Ben Botha",
    "reportedByPhone": "+27 82 805 3295",
    "victimUid": "USR-CLIENT-009",
    "victimName": "Ben Botha",
    "victimPhone": "+27 82 805 3295",
    "victimFarmName": "Brakspruit",
    "personDescription": {
      "notes": "Gesteel: 3 Pigs | Herwin: 0 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-26T06:00:00Z",
    "updatedAt": "2025-07-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-035",
    "caseNumber": "VIS-HBF-2025-035",
    "title": "Veediefstal: 5 Sheep - Felicia Prinsloo (Dupperspos)",
    "description": "KLAER / KONTAK: Felicia Prinsloo. AREA / PLAAS: Dupperspos. GESTEEL: 5 Sheep. STATUS: 0 Herwin | 5 Vermis | 0 Geslag. Gesteel Koördinate: 26°31'25.1\"S 26°24'47.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-035",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-22",
    "incidentTime": "02:00",
    "locationName": "Dupperspos (Felicia Prinsloo)",
    "sector": "Sektor Dupperspos",
    "gpsLocation": {
      "latitude": -26.523639,
      "longitude": 26.413083
    },
    "reportedByUid": "USR-VIS-REC-035",
    "reportedByName": "Felicia Prinsloo",
    "reportedByPhone": "",
    "victimName": "Felicia Prinsloo",
    "victimPhone": "",
    "victimFarmName": "Dupperspos",
    "personDescription": {
      "notes": "Gesteel: 5 Sheep | Herwin: 0 | Vermis: 5 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-22T06:00:00Z",
    "updatedAt": "2025-07-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-036",
    "caseNumber": "VIS-HBF-2025-036",
    "title": "Veediefstal: 4 Cows - Lou de Wet (Harrisburg)",
    "description": "KLAER / KONTAK: Lou de Wet. AREA / PLAAS: Harrisburg. GESTEEL: 4 Cows. STATUS: 0 Herwin | 0 Vermis | 4 Geslag. Slagplek Koördinate: 27°00'52.7\"S 26°19'30.3\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-036",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-17",
    "incidentTime": "02:00",
    "locationName": "Harrisburg (Lou de Wet)",
    "sector": "Sektor Harrisburg",
    "gpsLocation": {
      "latitude": -27.014639,
      "longitude": 26.325083
    },
    "reportedByUid": "USR-VIS-REC-036",
    "reportedByName": "Lou de Wet",
    "reportedByPhone": "",
    "victimName": "Lou de Wet",
    "victimPhone": "",
    "victimFarmName": "Harrisburg",
    "personDescription": {
      "notes": "Gesteel: 4 Cows | Herwin: 0 | Vermis: 0 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 27°00'52.7\"S 26°19'30.3\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-036-2",
        "caseId": "CASE-VIS-HBF-036",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag. Slagplek koördinate: 27°00'52.7\"S 26°19'30.3\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.014639,
          "longitude": 26.325083
        },
        "timestamp": "2025-07-17T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-17T06:00:00Z",
    "updatedAt": "2025-07-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-037",
    "caseNumber": "VIS-HBF-2025-037",
    "title": "Veediefstal: 20 Cows - Andries (Vee-arts) Nel (Wolwerand)",
    "description": "KLAER / KONTAK: Andre Nel jnr. AREA / PLAAS: Wolwerand. GESTEEL: 20 Cows. STATUS: 20 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'55.2\"S 26°30'19.9\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-037",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-16",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.882,
      "longitude": 26.505528
    },
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 20 Cows | Herwin: 20 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-037-1",
        "caseId": "CASE-VIS-HBF-037",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 20 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-07-16T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-16T06:00:00Z",
    "updatedAt": "2025-07-16T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-038",
    "caseNumber": "VIS-HBF-2025-038",
    "title": "Veediefstal: 5 Cows - Schalk Nezer (Sendelingsfontein)",
    "description": "KLAER / KONTAK: Schalk Nezer. AREA / PLAAS: Sendelingsfontein. GESTEEL: 5 Cows. STATUS: 5 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°56'27.3\"S 26°06'47.2\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-038",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-15",
    "incidentTime": "02:00",
    "locationName": "Sendelingsfontein (Schalk Nezer)",
    "sector": "Sektor Sendelingsfontein",
    "gpsLocation": {
      "latitude": -26.940917,
      "longitude": 26.113111
    },
    "reportedByUid": "USR-VIS-REC-038",
    "reportedByName": "Schalk Nezer",
    "reportedByPhone": "",
    "victimName": "Schalk Nezer",
    "victimPhone": "",
    "victimFarmName": "Sendelingsfontein",
    "personDescription": {
      "notes": "Gesteel: 5 Cows | Herwin: 5 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-038-1",
        "caseId": "CASE-VIS-HBF-038",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 5 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-07-15T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-15T06:00:00Z",
    "updatedAt": "2025-07-15T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-039",
    "caseNumber": "VIS-HBF-2025-039",
    "title": "Veediefstal: 10 Cows - Victor Swart (Tiganie)",
    "description": "KLAER / KONTAK: Swart boer van Tiganie. AREA / PLAAS: Tiganie. GESTEEL: 10 Cows. STATUS: 10 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'42.2\"S 26°24'40.9\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-039",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-13",
    "incidentTime": "02:00",
    "locationName": "Tiganie (Victor Swart)",
    "sector": "Sektor Witpoort",
    "gpsLocation": {
      "latitude": -26.745056,
      "longitude": 26.411361
    },
    "reportedByUid": "USR-CLIENT-098",
    "reportedByName": "Victor Swart",
    "reportedByPhone": "+27 83 407 2275",
    "victimUid": "USR-CLIENT-098",
    "victimName": "Victor Swart",
    "victimPhone": "+27 83 407 2275",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 10 Cows | Herwin: 10 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-039-1",
        "caseId": "CASE-VIS-HBF-039",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 10 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-07-13T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-13T06:00:00Z",
    "updatedAt": "2025-07-13T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-040",
    "caseNumber": "VIS-HBF-2025-040",
    "title": "Veediefstal: 10 Cows - Stoffel (Rietfontein)",
    "description": "KLAER / KONTAK: Stoffel. AREA / PLAAS: Rietfontein. GESTEEL: 10 Cows. STATUS: 10 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°39'11.8\"S 26°21'10.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-040",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-12",
    "incidentTime": "02:00",
    "locationName": "Rietfontein (Stoffel)",
    "sector": "Sektor Rietfontein",
    "gpsLocation": {
      "latitude": -26.653278,
      "longitude": 26.352806
    },
    "reportedByUid": "USR-VIS-REC-040",
    "reportedByName": "Stoffel",
    "reportedByPhone": "",
    "victimName": "Stoffel",
    "victimPhone": "",
    "victimFarmName": "Rietfontein",
    "personDescription": {
      "notes": "Gesteel: 10 Cows | Herwin: 10 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-040-1",
        "caseId": "CASE-VIS-HBF-040",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 10 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-07-12T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-12T06:00:00Z",
    "updatedAt": "2025-07-12T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-041",
    "caseNumber": "VIS-HBF-2025-041",
    "title": "Veediefstal: 10 Cows - Freddie Hugo (Renosterhoek)",
    "description": "KLAER / KONTAK: Freddie Hugo. AREA / PLAAS: Renosterhoek. GESTEEL: 10 Cows. STATUS: 10 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'28.0\"S 26°25'53.0\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-041",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-10",
    "incidentTime": "02:00",
    "locationName": "Renosterhoek (Freddie Hugo)",
    "sector": "Sektor Renosterhoek",
    "gpsLocation": {
      "latitude": -26.857778,
      "longitude": 26.431389
    },
    "reportedByUid": "USR-VIS-REC-041",
    "reportedByName": "Freddie Hugo",
    "reportedByPhone": "",
    "victimName": "Freddie Hugo",
    "victimPhone": "",
    "victimFarmName": "Renosterhoek",
    "personDescription": {
      "notes": "Gesteel: 10 Cows | Herwin: 10 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-041-1",
        "caseId": "CASE-VIS-HBF-041",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 10 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-07-10T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-10T06:00:00Z",
    "updatedAt": "2025-07-10T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-042",
    "caseNumber": "VIS-HBF-2025-042",
    "title": "Veediefstal: 11 Sheep - Danie Niewoudt (Beenjeskraal)",
    "description": "KLAER / KONTAK: Danie Niewoudt. AREA / PLAAS: Beenjeskraal. GESTEEL: 11 Sheep. STATUS: 0 Herwin | 11 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-042",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-08",
    "incidentTime": "02:00",
    "locationName": "Beenjeskraal (Danie Niewoudt)",
    "sector": "Sektor Beenjeskraal",
    "reportedByUid": "USR-VIS-REC-042",
    "reportedByName": "Danie Niewoudt",
    "reportedByPhone": "",
    "victimName": "Danie Niewoudt",
    "victimPhone": "",
    "victimFarmName": "Beenjeskraal",
    "personDescription": {
      "notes": "Gesteel: 11 Sheep | Herwin: 0 | Vermis: 11 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-08T06:00:00Z",
    "updatedAt": "2025-07-08T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-043",
    "caseNumber": "VIS-HBF-2025-043",
    "title": "Veediefstal: 10 Cows - Johan Styger (Schoemansfontein)",
    "description": "KLAER / KONTAK: J Styger. AREA / PLAAS: Schoemansfontein. GESTEEL: 10 Cows. STATUS: 10 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'29.2\"S 26°32'27.0\"E. Gevind Koördinate: 26°50'43.2\"S 26°35'31.7\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-043",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-07",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Johan Styger)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.741444,
      "longitude": 26.540833
    },
    "reportedByUid": "USR-CLIENT-095",
    "reportedByName": "Johan Styger",
    "reportedByPhone": "+27 82 460 8443",
    "victimUid": "USR-CLIENT-095",
    "victimName": "Johan Styger",
    "victimPhone": "+27 82 460 8443",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 10 Cows | Herwin: 10 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-043-1",
        "caseId": "CASE-VIS-HBF-043",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 10 diere herwin/teruggevind. Gevind by koördinate: 26°50'43.2\"S 26°35'31.7\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.845333,
          "longitude": 26.592139
        },
        "timestamp": "2025-07-07T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-07T06:00:00Z",
    "updatedAt": "2025-07-07T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-044",
    "caseNumber": "VIS-HBF-2025-044",
    "title": "Veediefstal: 4 Sheep - Corneels Swanepoel (Rietfontein)",
    "description": "KLAER / KONTAK: Corneels Swanepoel. AREA / PLAAS: Rietfontein. GESTEEL: 4 Sheep. STATUS: 0 Herwin | 4 Vermis | 0 Geslag. Gesteel Koördinate: 26°50'50.9\"S 26°14'10.0\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-044",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-06",
    "incidentTime": "02:00",
    "locationName": "Rietfontein (Corneels Swanepoel)",
    "sector": "Sektor Rietfontein",
    "gpsLocation": {
      "latitude": -26.847472,
      "longitude": 26.236111
    },
    "reportedByUid": "USR-CLIENT-096",
    "reportedByName": "Corneels Swanepoel",
    "reportedByPhone": "+27 82 937 0787",
    "victimUid": "USR-CLIENT-096",
    "victimName": "Corneels Swanepoel",
    "victimPhone": "+27 82 937 0787",
    "victimFarmName": "Rietfontein",
    "personDescription": {
      "notes": "Gesteel: 4 Sheep | Herwin: 0 | Vermis: 4 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-06T06:00:00Z",
    "updatedAt": "2025-07-06T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-045",
    "caseNumber": "VIS-HBF-2025-045",
    "title": "Veediefstal: 15 Cows - Ins Shalala (Witpoort)",
    "description": "KLAER / KONTAK: Ins Shalala. AREA / PLAAS: Witpoort. GESTEEL: 15 Cows. STATUS: 13 Herwin | 2 Vermis | 0 Geslag. Gesteel Koördinate: 26°43'56.0\"S 26°36'05.6\"E. Gevind Koördinate: 26°48'17.0\"S 26°34'34.5\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-045",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-07-03",
    "incidentTime": "02:00",
    "locationName": "Witpoort (Ins Shalala)",
    "sector": "Sektor Witpoort",
    "gpsLocation": {
      "latitude": -26.732222,
      "longitude": 26.601556
    },
    "reportedByUid": "USR-VIS-REC-045",
    "reportedByName": "Ins Shalala",
    "reportedByPhone": "",
    "victimName": "Ins Shalala",
    "victimPhone": "",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 15 Cows | Herwin: 13 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-045-1",
        "caseId": "CASE-VIS-HBF-045",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 13 diere herwin/teruggevind. Gevind by koördinate: 26°48'17.0\"S 26°34'34.5\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.804722,
          "longitude": 26.57625
        },
        "timestamp": "2025-07-03T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-07-03T06:00:00Z",
    "updatedAt": "2025-07-03T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-046",
    "caseNumber": "VIS-HBF-2025-046",
    "title": "Veediefstal: 8 Cows - Dolf Barnard (Rietkuil)",
    "description": "KLAER / KONTAK: Dolf Barnard. AREA / PLAAS: Rietkuil. GESTEEL: 8 Cows. STATUS: 8 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°50'12.3\"S 26°31'37.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-046",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-30",
    "incidentTime": "02:00",
    "locationName": "Rietkuil (Dolf Barnard)",
    "sector": "Sektor Rietkuil",
    "gpsLocation": {
      "latitude": -26.83675,
      "longitude": 26.526972
    },
    "reportedByUid": "USR-VIS-REC-046",
    "reportedByName": "Dolf Barnard",
    "reportedByPhone": "",
    "victimName": "Dolf Barnard",
    "victimPhone": "",
    "victimFarmName": "Rietkuil",
    "personDescription": {
      "notes": "Gesteel: 8 Cows | Herwin: 8 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-046-1",
        "caseId": "CASE-VIS-HBF-046",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 8 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-06-30T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-30T06:00:00Z",
    "updatedAt": "2025-06-30T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-047",
    "caseNumber": "VIS-HBF-2025-047",
    "title": "Veediefstal: 4 Cows - Janus janse van Vuuren (Harrisburg)",
    "description": "KLAER / KONTAK: Janus janse van Vuuren. AREA / PLAAS: Harrisburg. GESTEEL: 4 Cows. STATUS: 0 Herwin | 0 Vermis | 4 Geslag. Slagplek Koördinate: 27°00'54.0\"S 26°19'31.3\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-047",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-27",
    "incidentTime": "02:00",
    "locationName": "Harrisburg (Janus janse van Vuuren)",
    "sector": "Sektor Harrisburg",
    "gpsLocation": {
      "latitude": -27.015,
      "longitude": 26.325361
    },
    "reportedByUid": "USR-VIS-REC-047",
    "reportedByName": "Janus janse van Vuuren",
    "reportedByPhone": "",
    "victimName": "Janus janse van Vuuren",
    "victimPhone": "",
    "victimFarmName": "Harrisburg",
    "personDescription": {
      "notes": "Gesteel: 4 Cows | Herwin: 0 | Vermis: 0 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 27°00'54.0\"S 26°19'31.3\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-047-2",
        "caseId": "CASE-VIS-HBF-047",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag. Slagplek koördinate: 27°00'54.0\"S 26°19'31.3\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.015,
          "longitude": 26.325361
        },
        "timestamp": "2025-06-27T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-27T06:00:00Z",
    "updatedAt": "2025-06-27T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-048",
    "caseNumber": "VIS-HBF-2025-048",
    "title": "Veediefstal: 14 Sheep - Pieter Dimenia (Wolwerand)",
    "description": "KLAER / KONTAK: Pieter Dimenia. AREA / PLAAS: Wolwerand. GESTEEL: 14 Sheep. STATUS: 0 Herwin | 14 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-048",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-24",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Pieter Dimenia)",
    "sector": "Sektor Wolwerand",
    "reportedByUid": "USR-VIS-REC-048",
    "reportedByName": "Pieter Dimenia",
    "reportedByPhone": "",
    "victimName": "Pieter Dimenia",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 14 Sheep | Herwin: 0 | Vermis: 14 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-24T06:00:00Z",
    "updatedAt": "2025-06-24T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-049",
    "caseNumber": "VIS-HBF-2025-049",
    "title": "Veediefstal: 117 Sheep - C van der Westhuisen (Doornfontein)",
    "description": "KLAER / KONTAK: C van der Westhuisen. AREA / PLAAS: Doornfontein. GESTEEL: 117 Sheep. STATUS: 87 Herwin | 30 Vermis | 0 Geslag. Laaipunt Koördinate: 26°37'39.0\"S 26°36'49.6\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-049",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-21",
    "incidentTime": "02:00",
    "locationName": "Doornfontein (C van der Westhuisen)",
    "sector": "Sektor Doornfontein",
    "gpsLocation": {
      "latitude": -26.6275,
      "longitude": 26.613778
    },
    "reportedByUid": "USR-VIS-REC-049",
    "reportedByName": "C van der Westhuisen",
    "reportedByPhone": "",
    "victimName": "C van der Westhuisen",
    "victimPhone": "",
    "victimFarmName": "Doornfontein",
    "personDescription": {
      "notes": "Gesteel: 117 Sheep | Herwin: 87 | Vermis: 30 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°37'39.0\"S 26°36'49.6\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-049-1",
        "caseId": "CASE-VIS-HBF-049",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 87 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-06-21T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-21T06:00:00Z",
    "updatedAt": "2025-06-21T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-050",
    "caseNumber": "VIS-HBF-2025-050",
    "title": "Veediefstal: 9 Cows - B Bosch (Regina)",
    "description": "KLAER / KONTAK: B Bosch. AREA / PLAAS: Regina. GESTEEL: 9 Cows. STATUS: 8 Herwin | 1 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-050",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-19",
    "incidentTime": "02:00",
    "locationName": "Regina (B Bosch)",
    "sector": "Sektor Regina",
    "reportedByUid": "USR-VIS-REC-050",
    "reportedByName": "B Bosch",
    "reportedByPhone": "",
    "victimName": "B Bosch",
    "victimPhone": "",
    "victimFarmName": "Regina",
    "personDescription": {
      "notes": "Gesteel: 9 Cows | Herwin: 8 | Vermis: 1 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-050-1",
        "caseId": "CASE-VIS-HBF-050",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 8 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-06-19T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-19T06:00:00Z",
    "updatedAt": "2025-06-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-051",
    "caseNumber": "VIS-HBF-2025-051",
    "title": "Veediefstal: 30 Cows - Frans Roos (Rooikuil)",
    "description": "KLAER / KONTAK: Frans Roos. AREA / PLAAS: Rooikuil. GESTEEL: 30 Cows. STATUS: 0 Herwin | 30 Vermis | 4 Geslag. Gesteel Koördinate: 26°39'35.4\"S 26°34'05.4\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-051",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-16",
    "incidentTime": "02:00",
    "locationName": "Rooikuil (Frans Roos)",
    "sector": "Sektor Rooikuil",
    "gpsLocation": {
      "latitude": -26.659833,
      "longitude": 26.568167
    },
    "reportedByUid": "USR-VIS-REC-051",
    "reportedByName": "Frans Roos",
    "reportedByPhone": "",
    "victimName": "Frans Roos",
    "victimPhone": "",
    "victimFarmName": "Rooikuil",
    "personDescription": {
      "notes": "Gesteel: 30 Cows | Herwin: 0 | Vermis: 30 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-051-2",
        "caseId": "CASE-VIS-HBF-051",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag.",
        "updateType": "progress",
        "isInternalOnly": false,
        "timestamp": "2025-06-16T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-16T06:00:00Z",
    "updatedAt": "2025-06-16T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-052",
    "caseNumber": "VIS-HBF-2025-052",
    "title": "Veediefstal: 4 Cows - Lou de Wet (Harrisburg)",
    "description": "KLAER / KONTAK: Lou de Wet. AREA / PLAAS: Harrisburg. GESTEEL: 4 Cows. STATUS: 0 Herwin | 0 Vermis | 4 Geslag. Slagplek Koördinate: 27°00'54.0\"S 26°19'31.3\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-052",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-14",
    "incidentTime": "02:00",
    "locationName": "Harrisburg (Lou de Wet)",
    "sector": "Sektor Harrisburg",
    "gpsLocation": {
      "latitude": -27.015,
      "longitude": 26.325361
    },
    "reportedByUid": "USR-VIS-REC-052",
    "reportedByName": "Lou de Wet",
    "reportedByPhone": "",
    "victimName": "Lou de Wet",
    "victimPhone": "",
    "victimFarmName": "Harrisburg",
    "personDescription": {
      "notes": "Gesteel: 4 Cows | Herwin: 0 | Vermis: 0 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 27°00'54.0\"S 26°19'31.3\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-052-2",
        "caseId": "CASE-VIS-HBF-052",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag. Slagplek koördinate: 27°00'54.0\"S 26°19'31.3\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.015,
          "longitude": 26.325361
        },
        "timestamp": "2025-06-14T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-14T06:00:00Z",
    "updatedAt": "2025-06-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-053",
    "caseNumber": "VIS-HBF-2025-053",
    "title": "Veediefstal: 52 Sheep - Pieter Greyling (Palmietfontein)",
    "description": "KLAER / KONTAK: Pieter Greyling. AREA / PLAAS: Palmietfontein. GESTEEL: 52 Sheep. STATUS: 32 Herwin | 20 Vermis | 0 Geslag. Gesteel Koördinate: 26°34'46.8\"S 26°38'55.1\"E. Laaipunt Koördinate: 26°38'06.0\"S 26°36'12.2\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-053",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-12",
    "incidentTime": "02:00",
    "locationName": "Palmietfontein (Pieter Greyling)",
    "sector": "Sektor Palmietfontein",
    "gpsLocation": {
      "latitude": -26.579667,
      "longitude": 26.648639
    },
    "reportedByUid": "USR-VIS-REC-053",
    "reportedByName": "Pieter Greyling",
    "reportedByPhone": "",
    "victimName": "Pieter Greyling",
    "victimPhone": "",
    "victimFarmName": "Palmietfontein",
    "personDescription": {
      "notes": "Gesteel: 52 Sheep | Herwin: 32 | Vermis: 20 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°38'06.0\"S 26°36'12.2\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-053-1",
        "caseId": "CASE-VIS-HBF-053",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 32 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-06-12T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-12T06:00:00Z",
    "updatedAt": "2025-06-12T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-054",
    "caseNumber": "VIS-HBF-2025-054",
    "title": "Veediefstal: 46 Sheep - Philip Masilo (Sendelingsfontein)",
    "description": "KLAER / KONTAK: Philip Masilo. AREA / PLAAS: Sendelingsfontein. GESTEEL: 46 Sheep. STATUS: 0 Herwin | 46 Vermis | 0 Geslag. Gesteel Koördinate: 26°57'46.0\"S 26°17'07.8\"E. Laaipunt Koördinate: 26°56'41.2\"S 26°20'15.5\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-054",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-12",
    "incidentTime": "02:00",
    "locationName": "Sendelingsfontein (Philip Masilo)",
    "sector": "Sektor Sendelingsfontein",
    "gpsLocation": {
      "latitude": -26.962778,
      "longitude": 26.2855
    },
    "reportedByUid": "USR-VIS-REC-054",
    "reportedByName": "Philip Masilo",
    "reportedByPhone": "",
    "victimName": "Philip Masilo",
    "victimPhone": "",
    "victimFarmName": "Sendelingsfontein",
    "personDescription": {
      "notes": "Gesteel: 46 Sheep | Herwin: 0 | Vermis: 46 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°56'41.2\"S 26°20'15.5\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-12T06:00:00Z",
    "updatedAt": "2025-06-12T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-055",
    "caseNumber": "VIS-HBF-2025-055",
    "title": "Veediefstal: 68 Sheep - Wimpie Venter (Fortbuis)",
    "description": "KLAER / KONTAK: Theuns Venter. AREA / PLAAS: Fortbuis. GESTEEL: 68 Sheep. STATUS: 68 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°43'18.4\"S 26°29'38.2\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-055",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-10",
    "incidentTime": "02:00",
    "locationName": "Fortbuis (Wimpie Venter)",
    "sector": "Sektor Rhenosterspruit",
    "gpsLocation": {
      "latitude": -26.721778,
      "longitude": 26.493944
    },
    "reportedByUid": "USR-CLIENT-114",
    "reportedByName": "Wimpie Venter",
    "reportedByPhone": "+27 82 653 8466",
    "victimUid": "USR-CLIENT-114",
    "victimName": "Wimpie Venter",
    "victimPhone": "+27 82 653 8466",
    "victimFarmName": "Rhenosterspruit",
    "personDescription": {
      "notes": "Gesteel: 68 Sheep | Herwin: 68 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-055-1",
        "caseId": "CASE-VIS-HBF-055",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 68 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-06-10T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-10T06:00:00Z",
    "updatedAt": "2025-06-10T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-056",
    "caseNumber": "VIS-HBF-2025-056",
    "title": "Veediefstal: 32 Sheep - Dean Lowrey (Buisfontein)",
    "description": "KLAER / KONTAK: Dean Lowrey. AREA / PLAAS: Buisfontein. GESTEEL: 32 Sheep. STATUS: 32 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°41'33.0\"S 26°31'18.8\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-056",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-09",
    "incidentTime": "02:00",
    "locationName": "Buisfontein (Dean Lowrey)",
    "sector": "Sektor Buisfontein",
    "gpsLocation": {
      "latitude": -26.6925,
      "longitude": 26.521889
    },
    "reportedByUid": "USR-VIS-REC-056",
    "reportedByName": "Dean Lowrey",
    "reportedByPhone": "",
    "victimName": "Dean Lowrey",
    "victimPhone": "",
    "victimFarmName": "Buisfontein",
    "personDescription": {
      "notes": "Gesteel: 32 Sheep | Herwin: 32 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-056-1",
        "caseId": "CASE-VIS-HBF-056",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 32 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-06-09T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-09T06:00:00Z",
    "updatedAt": "2025-06-09T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-057",
    "caseNumber": "VIS-HBF-2025-057",
    "title": "Veediefstal: 1 Cows - Victor Swart (Witpoort)",
    "description": "KLAER / KONTAK: V Swart. AREA / PLAAS: Witpoort. GESTEEL: 1 Cows. STATUS: 1 Herwin | 0 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-057",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-05",
    "incidentTime": "02:00",
    "locationName": "Witpoort (Victor Swart)",
    "sector": "Sektor Witpoort",
    "reportedByUid": "USR-CLIENT-098",
    "reportedByName": "Victor Swart",
    "reportedByPhone": "+27 83 407 2275",
    "victimUid": "USR-CLIENT-098",
    "victimName": "Victor Swart",
    "victimPhone": "+27 83 407 2275",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 1 Cows | Herwin: 1 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-057-1",
        "caseId": "CASE-VIS-HBF-057",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-06-05T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-05T06:00:00Z",
    "updatedAt": "2025-06-05T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-058",
    "caseNumber": "VIS-HBF-2025-058",
    "title": "Veediefstal: 4 Cows - Andries (Vee-arts) Nel (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: M Nel. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 4 Cows. STATUS: 0 Herwin | 4 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'36.2\"S 26°17'36.3\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-058",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-04",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.826722,
      "longitude": 26.293417
    },
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 4 Cows | Herwin: 0 | Vermis: 4 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-04T06:00:00Z",
    "updatedAt": "2025-06-04T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-059",
    "caseNumber": "VIS-HBF-2025-059",
    "title": "Veediefstal: 2 Cows - Braam Hammilton Hall (Brakspruit)",
    "description": "KLAER / KONTAK: Braam Hammilton Hall. AREA / PLAAS: Brakspruit. GESTEEL: 2 Cows. STATUS: 0 Herwin | 2 Vermis | 0 Geslag. Gesteel Koördinate: 26°39'35.0\"S 26°34'33.5\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-059",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-04",
    "incidentTime": "02:00",
    "locationName": "Brakspruit (Braam Hammilton Hall)",
    "sector": "Sektor Brakspruit",
    "gpsLocation": {
      "latitude": -26.659722,
      "longitude": 26.575972
    },
    "reportedByUid": "USR-VIS-REC-059",
    "reportedByName": "Braam Hammilton Hall",
    "reportedByPhone": "",
    "victimName": "Braam Hammilton Hall",
    "victimPhone": "",
    "victimFarmName": "Brakspruit",
    "personDescription": {
      "notes": "Gesteel: 2 Cows | Herwin: 0 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-04T06:00:00Z",
    "updatedAt": "2025-06-04T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-060",
    "caseNumber": "VIS-HBF-2025-060",
    "title": "Veediefstal: 6 Cows - Gerrit Van der Walt (Maheimsvlei)",
    "description": "KLAER / KONTAK: Gerrit van der Walt. AREA / PLAAS: Maheimsvlei. GESTEEL: 6 Cows. STATUS: 0 Herwin | 6 Vermis | 0 Geslag. Gesteel Koördinate: 26°37'55.8\"S 26°34'57.6\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-060",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-04",
    "incidentTime": "02:00",
    "locationName": "Maheimsvlei (Gerrit Van der Walt)",
    "sector": "Sektor Mahemsvlei",
    "gpsLocation": {
      "latitude": -26.632167,
      "longitude": 26.582667
    },
    "reportedByUid": "USR-CLIENT-105",
    "reportedByName": "Gerrit Van der Walt",
    "reportedByPhone": "+27 83 441 7328",
    "victimUid": "USR-CLIENT-105",
    "victimName": "Gerrit Van der Walt",
    "victimPhone": "+27 83 441 7328",
    "victimFarmName": "Mahemsvlei",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 0 | Vermis: 6 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-04T06:00:00Z",
    "updatedAt": "2025-06-04T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-061",
    "caseNumber": "VIS-HBF-2025-061",
    "title": "Veediefstal: 6 Cows - Victor Swart (Unknown)",
    "description": "KLAER / KONTAK: J Swart. AREA / PLAAS: Unknown. GESTEEL: 6 Cows. STATUS: 0 Herwin | 6 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-061",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-03",
    "incidentTime": "02:00",
    "locationName": "Unknown (Victor Swart)",
    "sector": "Sektor Witpoort",
    "reportedByUid": "USR-CLIENT-098",
    "reportedByName": "Victor Swart",
    "reportedByPhone": "+27 83 407 2275",
    "victimUid": "USR-CLIENT-098",
    "victimName": "Victor Swart",
    "victimPhone": "+27 83 407 2275",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 0 | Vermis: 6 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-03T06:00:00Z",
    "updatedAt": "2025-06-03T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-062",
    "caseNumber": "VIS-HBF-2025-062",
    "title": "Veediefstal: 13 Cows - Hendrik Jooste (Bultfontein)",
    "description": "KLAER / KONTAK: Andries Nel Hendrik Jooste. AREA / PLAAS: Bultfontein. GESTEEL: 13 Cows. STATUS: 13 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°47'51.0\"S 26°18'05.8\"E. Gevind Koördinate: 26°48'33.4\"S 26°25'35.9\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-062",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-06-01",
    "incidentTime": "02:00",
    "locationName": "Bultfontein (Hendrik Jooste)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.7975,
      "longitude": 26.301611
    },
    "reportedByUid": "USR-CLIENT-048",
    "reportedByName": "Hendrik Jooste",
    "reportedByPhone": "+27 83 399 0792",
    "victimUid": "USR-CLIENT-048",
    "victimName": "Hendrik Jooste",
    "victimPhone": "+27 83 399 0792",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 13 Cows | Herwin: 13 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-062-1",
        "caseId": "CASE-VIS-HBF-062",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 13 diere herwin/teruggevind. Gevind by koördinate: 26°48'33.4\"S 26°25'35.9\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.809278,
          "longitude": 26.426639
        },
        "timestamp": "2025-06-01T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-06-01T06:00:00Z",
    "updatedAt": "2025-06-01T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-063",
    "caseNumber": "VIS-HBF-2025-063",
    "title": "Veediefstal: 11 Cows - Abraham Maree (Opraap Wes)",
    "description": "KLAER / KONTAK: J Mare. AREA / PLAAS: Opraap Wes. GESTEEL: 11 Cows. STATUS: 11 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°56'59.2\"S 26°19'27.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-063",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-05-29",
    "incidentTime": "02:00",
    "locationName": "Opraap Wes (Abraham Maree)",
    "sector": "Sektor Bonne Esperance",
    "gpsLocation": {
      "latitude": -26.949778,
      "longitude": 26.324194
    },
    "reportedByUid": "USR-CLIENT-065",
    "reportedByName": "Abraham Maree",
    "reportedByPhone": "+27 83 713 8996",
    "victimUid": "USR-CLIENT-065",
    "victimName": "Abraham Maree",
    "victimPhone": "+27 83 713 8996",
    "victimFarmName": "Bonne Esperance",
    "personDescription": {
      "notes": "Gesteel: 11 Cows | Herwin: 11 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-063-1",
        "caseId": "CASE-VIS-HBF-063",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 11 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-05-29T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-05-29T06:00:00Z",
    "updatedAt": "2025-05-29T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-064",
    "caseNumber": "VIS-HBF-2025-064",
    "title": "Veediefstal: 19 Cows - Cobus Van Zyl (Syferfontein)",
    "description": "KLAER / KONTAK: C. van Zyl. AREA / PLAAS: Syferfontein. GESTEEL: 19 Cows. STATUS: 10 Herwin | 9 Vermis | 0 Geslag. Gesteel Koördinate: 27°04'25.5\"S 26°21'33.9\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-064",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-05-28",
    "incidentTime": "02:00",
    "locationName": "Syferfontein (Cobus Van Zyl)",
    "sector": "Sektor Opraap",
    "gpsLocation": {
      "latitude": -27.07375,
      "longitude": 26.359417
    },
    "reportedByUid": "USR-CLIENT-111",
    "reportedByName": "Cobus Van Zyl",
    "reportedByPhone": "+27 83 283 7076",
    "victimUid": "USR-CLIENT-111",
    "victimName": "Cobus Van Zyl",
    "victimPhone": "+27 83 283 7076",
    "victimFarmName": "Opraap",
    "personDescription": {
      "notes": "Gesteel: 19 Cows | Herwin: 10 | Vermis: 9 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-064-1",
        "caseId": "CASE-VIS-HBF-064",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 10 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-05-28T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-05-28T06:00:00Z",
    "updatedAt": "2025-05-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-065",
    "caseNumber": "VIS-HBF-2025-065",
    "title": "Veediefstal: 1 Cow - W Geldenhuis (Morea)",
    "description": "KLAER / KONTAK: W Geldenhuis. AREA / PLAAS: Morea. GESTEEL: 1 Cow. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-065",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-05-22",
    "incidentTime": "02:00",
    "locationName": "Morea (W Geldenhuis)",
    "sector": "Sektor Morea",
    "reportedByUid": "USR-VIS-REC-065",
    "reportedByName": "W Geldenhuis",
    "reportedByPhone": "",
    "victimName": "W Geldenhuis",
    "victimPhone": "",
    "victimFarmName": "Morea",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-065-2",
        "caseId": "CASE-VIS-HBF-065",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag.",
        "updateType": "progress",
        "isInternalOnly": false,
        "timestamp": "2025-05-22T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-05-22T06:00:00Z",
    "updatedAt": "2025-05-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-066",
    "caseNumber": "VIS-HBF-2025-066",
    "title": "Veediefstal: 31 Sheep - Romke de Jong (Klerksdorp)",
    "description": "KLAER / KONTAK: Romke de Jong. AREA / PLAAS: Klerksdorp. GESTEEL: 31 Sheep. STATUS: 0 Herwin | 31 Vermis | 0 Geslag. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-066",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-05-20",
    "incidentTime": "02:00",
    "locationName": "Klerksdorp (Romke de Jong)",
    "sector": "Sektor Klerksdorp",
    "reportedByUid": "USR-VIS-REC-066",
    "reportedByName": "Romke de Jong",
    "reportedByPhone": "",
    "victimName": "Romke de Jong",
    "victimPhone": "",
    "victimFarmName": "Klerksdorp",
    "personDescription": {
      "notes": "Gesteel: 31 Sheep | Herwin: 0 | Vermis: 31 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-05-20T06:00:00Z",
    "updatedAt": "2025-05-20T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-067",
    "caseNumber": "VIS-HBF-2025-067",
    "title": "Veediefstal: 2 Cows - Cobus Van Zyl (Syferfontein)",
    "description": "KLAER / KONTAK: C. van Zyl. AREA / PLAAS: Syferfontein. GESTEEL: 2 Cows. STATUS: 0 Herwin | 0 Vermis | 2 Geslag. Gesteel Koördinate: 27°04'25.5\"S 26°21'33.9\"E. Slagplek Koördinate: 27°02'42.2\"S 26°20'55.0\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-067",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-05-17",
    "incidentTime": "02:00",
    "locationName": "Syferfontein (Cobus Van Zyl)",
    "sector": "Sektor Opraap",
    "gpsLocation": {
      "latitude": -27.07375,
      "longitude": 26.359417
    },
    "reportedByUid": "USR-CLIENT-111",
    "reportedByName": "Cobus Van Zyl",
    "reportedByPhone": "+27 83 283 7076",
    "victimUid": "USR-CLIENT-111",
    "victimName": "Cobus Van Zyl",
    "victimPhone": "+27 83 283 7076",
    "victimFarmName": "Opraap",
    "personDescription": {
      "notes": "Gesteel: 2 Cows | Herwin: 0 | Vermis: 0 | Geslag: 2"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 27°02'42.2\"S 26°20'55.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-067-2",
        "caseId": "CASE-VIS-HBF-067",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 2 diere geslag. Slagplek koördinate: 27°02'42.2\"S 26°20'55.0\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.045056,
          "longitude": 26.348611
        },
        "timestamp": "2025-05-17T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-05-17T06:00:00Z",
    "updatedAt": "2025-05-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-068",
    "caseNumber": "VIS-HBF-2025-068",
    "title": "Veediefstal: 9 Cows - Johan Styger (Schoemansfontein)",
    "description": "KLAER / KONTAK: Johan Styger. AREA / PLAAS: Schoemansfontein. GESTEEL: 9 Cows. STATUS: 2 Herwin | 0 Vermis | 7 Geslag. Gesteel Koördinate: 26°44'54.7\"S 26°32'18.5\"E. Slagplek Koördinate: 26°51'51.4\"S 26°34'36.7\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-068",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-05-13",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Johan Styger)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.748528,
      "longitude": 26.538472
    },
    "reportedByUid": "USR-CLIENT-095",
    "reportedByName": "Johan Styger",
    "reportedByPhone": "+27 82 460 8443",
    "victimUid": "USR-CLIENT-095",
    "victimName": "Johan Styger",
    "victimPhone": "+27 82 460 8443",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 9 Cows | Herwin: 2 | Vermis: 0 | Geslag: 7"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°51'51.4\"S 26°34'36.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-068-1",
        "caseId": "CASE-VIS-HBF-068",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-05-13T10:00:00Z"
      },
      {
        "id": "UPD-VIS-068-2",
        "caseId": "CASE-VIS-HBF-068",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 7 diere geslag. Slagplek koördinate: 26°51'51.4\"S 26°34'36.7\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.864278,
          "longitude": 26.576861
        },
        "timestamp": "2025-05-13T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-05-13T06:00:00Z",
    "updatedAt": "2025-05-13T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-069",
    "caseNumber": "VIS-HBF-2025-069",
    "title": "Veediefstal: 7 Sheep - Wansen Engelbrecht (Wolwerand)",
    "description": "KLAER / KONTAK: W. Engelbrecht. AREA / PLAAS: Wolwerand. GESTEEL: 7 Sheep. STATUS: 7 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'53.7\"S 26°29'38.8\"E. Gevind Koördinate: 26°51'52.7\"S 26°29'46.2\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-069",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-05-01",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wansen Engelbrecht)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.864917,
      "longitude": 26.494111
    },
    "reportedByUid": "USR-CLIENT-027",
    "reportedByName": "Wansen Engelbrecht",
    "reportedByPhone": "+27 83 304 9388",
    "victimUid": "USR-CLIENT-027",
    "victimName": "Wansen Engelbrecht",
    "victimPhone": "+27 83 304 9388",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 7 Sheep | Herwin: 7 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-069-1",
        "caseId": "CASE-VIS-HBF-069",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 7 diere herwin/teruggevind. Gevind by koördinate: 26°51'52.7\"S 26°29'46.2\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.864639,
          "longitude": 26.496167
        },
        "timestamp": "2025-05-01T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-05-01T06:00:00Z",
    "updatedAt": "2025-05-01T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-070",
    "caseNumber": "VIS-HBF-2025-070",
    "title": "Veediefstal: 3 Cows 2 Calves - Johan Styger (Schoemansfontein)",
    "description": "KLAER / KONTAK: Johan Styger. AREA / PLAAS: Schoemansfontein. GESTEEL: 3 Cows 2 Calves. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Gesteel Koördinate: 26°44'54.7\"S 26°32'18.5\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-070",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-05-01",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Johan Styger)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.748528,
      "longitude": 26.538472
    },
    "reportedByUid": "USR-CLIENT-095",
    "reportedByName": "Johan Styger",
    "reportedByPhone": "+27 82 460 8443",
    "victimUid": "USR-CLIENT-095",
    "victimName": "Johan Styger",
    "victimPhone": "+27 82 460 8443",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 3 Cows 2 Calves | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-070-2",
        "caseId": "CASE-VIS-HBF-070",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag.",
        "updateType": "progress",
        "isInternalOnly": false,
        "timestamp": "2025-05-01T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-05-01T06:00:00Z",
    "updatedAt": "2025-05-01T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-071",
    "caseNumber": "VIS-HBF-2025-071",
    "title": "Veediefstal: 1 Cow 1 Calve - Marinus Lechinsky (Witfontein)",
    "description": "KLAER / KONTAK: M. Leshinsky. AREA / PLAAS: Witfontein. GESTEEL: 1 Cow 1 Calve. STATUS: 0 Herwin | 2 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'29.1\"S 26°08'53.0\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-071",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-29",
    "incidentTime": "02:00",
    "locationName": "Witfontein (Marinus Lechinsky)",
    "sector": "Sektor Witfontein",
    "gpsLocation": {
      "latitude": -26.87475,
      "longitude": 26.148056
    },
    "reportedByUid": "USR-CLIENT-058",
    "reportedByName": "Marinus Lechinsky",
    "reportedByPhone": "+27 82 697 6801",
    "victimUid": "USR-CLIENT-058",
    "victimName": "Marinus Lechinsky",
    "victimPhone": "+27 82 697 6801",
    "victimFarmName": "Witfontein",
    "personDescription": {
      "notes": "Gesteel: 1 Cow 1 Calve | Herwin: 0 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-29T06:00:00Z",
    "updatedAt": "2025-04-29T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-072",
    "caseNumber": "VIS-HBF-2025-072",
    "title": "Veediefstal: 1 Cow - Sipho (Wolwerand)",
    "description": "KLAER / KONTAK: Sipho. AREA / PLAAS: Wolwerand. GESTEEL: 1 Cow. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Gesteel Koördinate: 26°51'12.3\"S 26°26'50.4\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-072",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-24",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Sipho)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.853417,
      "longitude": 26.447333
    },
    "reportedByUid": "USR-VIS-REC-072",
    "reportedByName": "Sipho",
    "reportedByPhone": "",
    "victimName": "Sipho",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-072-2",
        "caseId": "CASE-VIS-HBF-072",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag.",
        "updateType": "progress",
        "isInternalOnly": false,
        "timestamp": "2025-04-24T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-24T06:00:00Z",
    "updatedAt": "2025-04-24T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-073",
    "caseNumber": "VIS-HBF-2025-073",
    "title": "Veediefstal: 2 Sheep - Marinus Lechinsky (Witfontein)",
    "description": "KLAER / KONTAK: M. Leshinsky. AREA / PLAAS: Witfontein. GESTEEL: 2 Sheep. STATUS: 0 Herwin | 2 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'29.1\"S 26°08'53.0\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-073",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-23",
    "incidentTime": "02:00",
    "locationName": "Witfontein (Marinus Lechinsky)",
    "sector": "Sektor Witfontein",
    "gpsLocation": {
      "latitude": -26.87475,
      "longitude": 26.148056
    },
    "reportedByUid": "USR-CLIENT-058",
    "reportedByName": "Marinus Lechinsky",
    "reportedByPhone": "+27 82 697 6801",
    "victimUid": "USR-CLIENT-058",
    "victimName": "Marinus Lechinsky",
    "victimPhone": "+27 82 697 6801",
    "victimFarmName": "Witfontein",
    "personDescription": {
      "notes": "Gesteel: 2 Sheep | Herwin: 0 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-23T06:00:00Z",
    "updatedAt": "2025-04-23T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-074",
    "caseNumber": "VIS-HBF-2025-074",
    "title": "Veediefstal: 8 Sheep - Marinus Lechinsky (Witfontein)",
    "description": "KLAER / KONTAK: M. Leshinsky. AREA / PLAAS: Witfontein. GESTEEL: 8 Sheep. STATUS: 5 Herwin | 3 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'29.1\"S 26°08'53.0\"E. Gevind Koördinate: 26°52'09.7\"S 26°08'52.6\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-074",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-19",
    "incidentTime": "02:00",
    "locationName": "Witfontein (Marinus Lechinsky)",
    "sector": "Sektor Witfontein",
    "gpsLocation": {
      "latitude": -26.87475,
      "longitude": 26.148056
    },
    "reportedByUid": "USR-CLIENT-058",
    "reportedByName": "Marinus Lechinsky",
    "reportedByPhone": "+27 82 697 6801",
    "victimUid": "USR-CLIENT-058",
    "victimName": "Marinus Lechinsky",
    "victimPhone": "+27 82 697 6801",
    "victimFarmName": "Witfontein",
    "personDescription": {
      "notes": "Gesteel: 8 Sheep | Herwin: 5 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-074-1",
        "caseId": "CASE-VIS-HBF-074",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 5 diere herwin/teruggevind. Gevind by koördinate: 26°52'09.7\"S 26°08'52.6\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.869361,
          "longitude": 26.147944
        },
        "timestamp": "2025-04-19T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-19T06:00:00Z",
    "updatedAt": "2025-04-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-075",
    "caseNumber": "VIS-HBF-2025-075",
    "title": "Veediefstal: 4 Cows 1 Bull - Johan Styger (Schoemansfontein)",
    "description": "KLAER / KONTAK: Johan Styger. AREA / PLAAS: Schoemansfontein. GESTEEL: 4 Cows 1 Bull. STATUS: 0 Herwin | 5 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'54.7\"S 26°32'18.5\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-075",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-18",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Johan Styger)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.748528,
      "longitude": 26.538472
    },
    "reportedByUid": "USR-CLIENT-095",
    "reportedByName": "Johan Styger",
    "reportedByPhone": "+27 82 460 8443",
    "victimUid": "USR-CLIENT-095",
    "victimName": "Johan Styger",
    "victimPhone": "+27 82 460 8443",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 4 Cows 1 Bull | Herwin: 0 | Vermis: 5 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-18T06:00:00Z",
    "updatedAt": "2025-04-18T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-076",
    "caseNumber": "VIS-HBF-2025-076",
    "title": "Veediefstal: 115 Sheep - F. Anderson (Paardeplaas)",
    "description": "KLAER / KONTAK: F. Anderson. AREA / PLAAS: Paardeplaas. GESTEEL: 115 Sheep. STATUS: 7 Herwin | 108 Vermis | 0 Geslag. Gesteel Koördinate: 26°37'26.1\"S 26°18'23.5\"E. Gevind Koördinate: 26°38'07.5\"S 26°20'13.0\"E. Laaipunt Koördinate: 26°38'07.5\"S 26°20'13.0\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-076",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-12",
    "incidentTime": "02:00",
    "locationName": "Paardeplaas (F. Anderson)",
    "sector": "Sektor Paardeplaas",
    "gpsLocation": {
      "latitude": -26.623917,
      "longitude": 26.306528
    },
    "reportedByUid": "USR-VIS-REC-076",
    "reportedByName": "F. Anderson",
    "reportedByPhone": "",
    "victimName": "F. Anderson",
    "victimPhone": "",
    "victimFarmName": "Paardeplaas",
    "personDescription": {
      "notes": "Gesteel: 115 Sheep | Herwin: 7 | Vermis: 108 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°38'07.5\"S 26°20'13.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-076-1",
        "caseId": "CASE-VIS-HBF-076",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 7 diere herwin/teruggevind. Gevind by koördinate: 26°38'07.5\"S 26°20'13.0\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.635417,
          "longitude": 26.336944
        },
        "timestamp": "2025-04-12T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-12T06:00:00Z",
    "updatedAt": "2025-04-12T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-077",
    "caseNumber": "VIS-HBF-2025-077",
    "title": "Veediefstal: 3 Cows - Ben Botha (Boschpoort)",
    "description": "KLAER / KONTAK: L. Botha D le Roux. AREA / PLAAS: Boschpoort. GESTEEL: 3 Cows. STATUS: 3 Herwin | 0 Vermis | 0 Geslag. Gevind Koördinate: 26°51'35.0\"S 26°33'58.2\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-077",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-09",
    "incidentTime": "02:00",
    "locationName": "Boschpoort (Ben Botha)",
    "sector": "Sektor Brakspruit",
    "gpsLocation": {
      "latitude": -26.859722,
      "longitude": 26.566167
    },
    "reportedByUid": "USR-CLIENT-009",
    "reportedByName": "Ben Botha",
    "reportedByPhone": "+27 82 805 3295",
    "victimUid": "USR-CLIENT-009",
    "victimName": "Ben Botha",
    "victimPhone": "+27 82 805 3295",
    "victimFarmName": "Brakspruit",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 3 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-077-1",
        "caseId": "CASE-VIS-HBF-077",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 3 diere herwin/teruggevind. Gevind by koördinate: 26°51'35.0\"S 26°33'58.2\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.859722,
          "longitude": 26.566167
        },
        "timestamp": "2025-04-09T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-09T06:00:00Z",
    "updatedAt": "2025-04-09T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-078",
    "caseNumber": "VIS-HBF-2025-078",
    "title": "Veediefstal: 18 Sheep - Onbekend (Alabama)",
    "description": "KLAER / KONTAK: Onbekend. AREA / PLAAS: Alabama. GESTEEL: 18 Sheep. STATUS: 0 Herwin | 18 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'28.7\"S 26°34'33.8\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-078",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-06",
    "incidentTime": "02:00",
    "locationName": "Alabama (Onbekend)",
    "sector": "Sektor Alabama",
    "gpsLocation": {
      "latitude": -26.874639,
      "longitude": 26.576056
    },
    "reportedByUid": "USR-VIS-REC-078",
    "reportedByName": "Onbekend",
    "reportedByPhone": "",
    "victimName": "Onbekend",
    "victimPhone": "",
    "victimFarmName": "Alabama",
    "personDescription": {
      "notes": "Gesteel: 18 Sheep | Herwin: 0 | Vermis: 18 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-06T06:00:00Z",
    "updatedAt": "2025-04-06T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-079",
    "caseNumber": "VIS-HBF-2025-079",
    "title": "Veediefstal: 72 Sheep - K. Labouschangne (Dupperspos)",
    "description": "KLAER / KONTAK: K. Labouschangne. AREA / PLAAS: Dupperspos. GESTEEL: 72 Sheep. STATUS: 55 Herwin | 17 Vermis | 0 Geslag. Gesteel Koördinate: 26°31'23.9\"S 26°25'08.2\"E. Laaipunt Koördinate: 26°31'04.6\"S 26°24'50.2\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-079",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-03",
    "incidentTime": "02:00",
    "locationName": "Dupperspos (K. Labouschangne)",
    "sector": "Sektor Dupperspos",
    "gpsLocation": {
      "latitude": -26.523306,
      "longitude": 26.418944
    },
    "reportedByUid": "USR-VIS-REC-079",
    "reportedByName": "K. Labouschangne",
    "reportedByPhone": "",
    "victimName": "K. Labouschangne",
    "victimPhone": "",
    "victimFarmName": "Dupperspos",
    "personDescription": {
      "notes": "Gesteel: 72 Sheep | Herwin: 55 | Vermis: 17 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°31'04.6\"S 26°24'50.2\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-079-1",
        "caseId": "CASE-VIS-HBF-079",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 55 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-04-03T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-03T06:00:00Z",
    "updatedAt": "2025-04-03T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-080",
    "caseNumber": "VIS-HBF-2025-080",
    "title": "Veediefstal: 5 Cows - Herman Pretorius (Ottosdal)",
    "description": "KLAER / KONTAK: D. Pretorius. AREA / PLAAS: Ottosdal. GESTEEL: 5 Cows. STATUS: 2 Herwin | 3 Vermis | 0 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-080",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-04-02",
    "incidentTime": "02:00",
    "locationName": "Ottosdal (Herman Pretorius)",
    "sector": "Sektor Rietvlei",
    "reportedByUid": "USR-CLIENT-082",
    "reportedByName": "Herman Pretorius",
    "reportedByPhone": "+27 83 450 0323",
    "victimUid": "USR-CLIENT-082",
    "victimName": "Herman Pretorius",
    "victimPhone": "+27 83 450 0323",
    "victimFarmName": "Rietvlei",
    "personDescription": {
      "notes": "Gesteel: 5 Cows | Herwin: 2 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-080-1",
        "caseId": "CASE-VIS-HBF-080",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-04-02T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-04-02T06:00:00Z",
    "updatedAt": "2025-04-02T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-081",
    "caseNumber": "VIS-HBF-2025-081",
    "title": "Veediefstal: 6 Cows - P. Hamilton-hall (Brakspruit)",
    "description": "KLAER / KONTAK: P. Hamilton-hall. AREA / PLAAS: Brakspruit. GESTEEL: 6 Cows. STATUS: 6 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°39'48.0\"S 26°34'35.4\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-081",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-28",
    "incidentTime": "02:00",
    "locationName": "Brakspruit (P. Hamilton-hall)",
    "sector": "Sektor Brakspruit",
    "gpsLocation": {
      "latitude": -26.663333,
      "longitude": 26.5765
    },
    "reportedByUid": "USR-VIS-REC-081",
    "reportedByName": "P. Hamilton-hall",
    "reportedByPhone": "",
    "victimName": "P. Hamilton-hall",
    "victimPhone": "",
    "victimFarmName": "Brakspruit",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 6 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-081-1",
        "caseId": "CASE-VIS-HBF-081",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-03-28T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-28T06:00:00Z",
    "updatedAt": "2025-03-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-082",
    "caseNumber": "VIS-HBF-2025-082",
    "title": "Veediefstal: 6 Bulls - Abraham Maree (Renosterhoek)",
    "description": "KLAER / KONTAK: J. Mare. AREA / PLAAS: Renosterhoek. GESTEEL: 6 Bulls. STATUS: 6 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'06.3\"S 26°23'40.7\"E. Gevind Koördinate: 26°50'22.0\"S 26°24'15.0\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-082",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-26",
    "incidentTime": "02:00",
    "locationName": "Renosterhoek (Abraham Maree)",
    "sector": "Sektor Bonne Esperance",
    "gpsLocation": {
      "latitude": -26.85175,
      "longitude": 26.394639
    },
    "reportedByUid": "USR-CLIENT-065",
    "reportedByName": "Abraham Maree",
    "reportedByPhone": "+27 83 713 8996",
    "victimUid": "USR-CLIENT-065",
    "victimName": "Abraham Maree",
    "victimPhone": "+27 83 713 8996",
    "victimFarmName": "Bonne Esperance",
    "personDescription": {
      "notes": "Gesteel: 6 Bulls | Herwin: 6 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-082-1",
        "caseId": "CASE-VIS-HBF-082",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind. Gevind by koördinate: 26°50'22.0\"S 26°24'15.0\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.839444,
          "longitude": 26.404167
        },
        "timestamp": "2025-03-26T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-26T06:00:00Z",
    "updatedAt": "2025-03-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-083",
    "caseNumber": "VIS-HBF-2025-083",
    "title": "Veediefstal: 4 Cows 1 Calve - Johan Styger (Schoemansfontein)",
    "description": "KLAER / KONTAK: Johan Styger. AREA / PLAAS: Schoemansfontein. GESTEEL: 4 Cows 1 Calve. STATUS: 0 Herwin | 5 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'54.7\"S 26°32'18.5\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-083",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-26",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Johan Styger)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.748528,
      "longitude": 26.538472
    },
    "reportedByUid": "USR-CLIENT-095",
    "reportedByName": "Johan Styger",
    "reportedByPhone": "+27 82 460 8443",
    "victimUid": "USR-CLIENT-095",
    "victimName": "Johan Styger",
    "victimPhone": "+27 82 460 8443",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 4 Cows 1 Calve | Herwin: 0 | Vermis: 5 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-26T06:00:00Z",
    "updatedAt": "2025-03-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-084",
    "caseNumber": "VIS-HBF-2025-084",
    "title": "Veediefstal: 16 Cows 1 Calve - Jurgens Viljoen (Houwater)",
    "description": "KLAER / KONTAK: Hansie Viljoen. AREA / PLAAS: Houwater. GESTEEL: 16 Cows 1 Calve. STATUS: 12 Herwin | 3 Vermis | 2 Geslag. Gesteel Koördinate: 27°12'57.1\"S 26°15'15.6\"E. Gevind Koördinate: 27°12'57.1\"S 26°15'15.6\"E. Slagplek Koördinate: 27°12'57.1\"S 26°15'15.6\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-084",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-26",
    "incidentTime": "02:00",
    "locationName": "Houwater (Jurgens Viljoen)",
    "sector": "Sektor Droeëkraal",
    "gpsLocation": {
      "latitude": -27.215861,
      "longitude": 26.254333
    },
    "reportedByUid": "USR-CLIENT-116",
    "reportedByName": "Jurgens Viljoen",
    "reportedByPhone": "+27 79 490 8231",
    "victimUid": "USR-CLIENT-116",
    "victimName": "Jurgens Viljoen",
    "victimPhone": "+27 79 490 8231",
    "victimFarmName": "Droeëkraal",
    "personDescription": {
      "notes": "Gesteel: 16 Cows 1 Calve | Herwin: 12 | Vermis: 3 | Geslag: 2"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 27°12'57.1\"S 26°15'15.6\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-084-1",
        "caseId": "CASE-VIS-HBF-084",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 12 diere herwin/teruggevind. Gevind by koördinate: 27°12'57.1\"S 26°15'15.6\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.215861,
          "longitude": 26.254333
        },
        "timestamp": "2025-03-26T10:00:00Z"
      },
      {
        "id": "UPD-VIS-084-2",
        "caseId": "CASE-VIS-HBF-084",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 2 diere geslag. Slagplek koördinate: 27°12'57.1\"S 26°15'15.6\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.215861,
          "longitude": 26.254333
        },
        "timestamp": "2025-03-26T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-26T06:00:00Z",
    "updatedAt": "2025-03-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-085",
    "caseNumber": "VIS-HBF-2025-085",
    "title": "Veediefstal: 6 Cows - F. Martin (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: F. Martin. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 6 Cows. STATUS: 6 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'42.5\"S 26°22'31.7\"E. Gevind Koördinate: 26°53'16.4\"S 26°32'48.7\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-085",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-25",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (F. Martin)",
    "sector": "Sektor Oorbietjiesfontein",
    "gpsLocation": {
      "latitude": -26.828472,
      "longitude": 26.375472
    },
    "reportedByUid": "USR-VIS-REC-085",
    "reportedByName": "F. Martin",
    "reportedByPhone": "",
    "victimName": "F. Martin",
    "victimPhone": "",
    "victimFarmName": "Oorbietjiesfontein",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 6 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-085-1",
        "caseId": "CASE-VIS-HBF-085",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind. Gevind by koördinate: 26°53'16.4\"S 26°32'48.7\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.887889,
          "longitude": 26.546861
        },
        "timestamp": "2025-03-25T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-25T06:00:00Z",
    "updatedAt": "2025-03-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-086",
    "caseNumber": "VIS-HBF-2025-086",
    "title": "Veediefstal: 12 Cows - A. Corneels (Makokskraal)",
    "description": "KLAER / KONTAK: A. Corneels. AREA / PLAAS: Makokskraal. GESTEEL: 12 Cows. STATUS: 6 Herwin | 6 Vermis | 0 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-086",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-20",
    "incidentTime": "02:00",
    "locationName": "Makokskraal (A. Corneels)",
    "sector": "Sektor Makokskraal",
    "reportedByUid": "USR-VIS-REC-086",
    "reportedByName": "A. Corneels",
    "reportedByPhone": "",
    "victimName": "A. Corneels",
    "victimPhone": "",
    "victimFarmName": "Makokskraal",
    "personDescription": {
      "notes": "Gesteel: 12 Cows | Herwin: 6 | Vermis: 6 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-086-1",
        "caseId": "CASE-VIS-HBF-086",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-03-20T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-20T06:00:00Z",
    "updatedAt": "2025-03-20T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-087",
    "caseNumber": "VIS-HBF-2025-087",
    "title": "Veediefstal: 32 Sheep - E. van Wyk (Boschpoort)",
    "description": "KLAER / KONTAK: E. van Wyk. AREA / PLAAS: Boschpoort. GESTEEL: 32 Sheep. STATUS: 1 Herwin | 31 Vermis | 0 Geslag. Gesteel Koördinate: 26°37'29.2\"S 26°11'15.5\"E. Laaipunt Koördinate: 26°36'27.9\"S 26°13'09.4\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-087",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-14",
    "incidentTime": "02:00",
    "locationName": "Boschpoort (E. van Wyk)",
    "sector": "Sektor Boschpoort",
    "gpsLocation": {
      "latitude": -26.624778,
      "longitude": 26.187639
    },
    "reportedByUid": "USR-VIS-REC-087",
    "reportedByName": "E. van Wyk",
    "reportedByPhone": "",
    "victimName": "E. van Wyk",
    "victimPhone": "",
    "victimFarmName": "Boschpoort",
    "personDescription": {
      "notes": "Gesteel: 32 Sheep | Herwin: 1 | Vermis: 31 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°36'27.9\"S 26°13'09.4\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-087-1",
        "caseId": "CASE-VIS-HBF-087",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-03-14T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-14T06:00:00Z",
    "updatedAt": "2025-03-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-088",
    "caseNumber": "VIS-HBF-2025-088",
    "title": "Veediefstal: 14 Cows - Jurgens Viljoen (Doornfontein)",
    "description": "KLAER / KONTAK: D. Viljoen. AREA / PLAAS: Doornfontein. GESTEEL: 14 Cows. STATUS: 0 Herwin | 14 Vermis | 0 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-088",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-12",
    "incidentTime": "02:00",
    "locationName": "Doornfontein (Jurgens Viljoen)",
    "sector": "Sektor Droeëkraal",
    "reportedByUid": "USR-CLIENT-116",
    "reportedByName": "Jurgens Viljoen",
    "reportedByPhone": "+27 79 490 8231",
    "victimUid": "USR-CLIENT-116",
    "victimName": "Jurgens Viljoen",
    "victimPhone": "+27 79 490 8231",
    "victimFarmName": "Droeëkraal",
    "personDescription": {
      "notes": "Gesteel: 14 Cows | Herwin: 0 | Vermis: 14 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-12T06:00:00Z",
    "updatedAt": "2025-03-12T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-089",
    "caseNumber": "VIS-HBF-2025-089",
    "title": "Veediefstal: 12 Sheep - T. de Koker (Boschpoort)",
    "description": "KLAER / KONTAK: T. de Koker. AREA / PLAAS: Boschpoort. GESTEEL: 12 Sheep. STATUS: 0 Herwin | 12 Vermis | 0 Geslag. Gesteel Koördinate: 26°33'27.1\"S 26°11'37.6\"E. Laaipunt Koördinate: 26°36'27.9\"S 26°13'09.4\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-089",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-07",
    "incidentTime": "02:00",
    "locationName": "Boschpoort (T. de Koker)",
    "sector": "Sektor Boschpoort",
    "gpsLocation": {
      "latitude": -26.557528,
      "longitude": 26.193778
    },
    "reportedByUid": "USR-VIS-REC-089",
    "reportedByName": "T. de Koker",
    "reportedByPhone": "",
    "victimName": "T. de Koker",
    "victimPhone": "",
    "victimFarmName": "Boschpoort",
    "personDescription": {
      "notes": "Gesteel: 12 Sheep | Herwin: 0 | Vermis: 12 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°36'27.9\"S 26°13'09.4\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-07T06:00:00Z",
    "updatedAt": "2025-03-07T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-090",
    "caseNumber": "VIS-HBF-2025-090",
    "title": "Veediefstal: 2 Cows - S. Cloete (Vaalbos)",
    "description": "KLAER / KONTAK: S. Cloete. AREA / PLAAS: Vaalbos. GESTEEL: 2 Cows. STATUS: 0 Herwin | 2 Vermis | 0 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-090",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-03-05",
    "incidentTime": "02:00",
    "locationName": "Vaalbos (S. Cloete)",
    "sector": "Sektor Vaalbos",
    "reportedByUid": "USR-VIS-REC-090",
    "reportedByName": "S. Cloete",
    "reportedByPhone": "",
    "victimName": "S. Cloete",
    "victimPhone": "",
    "victimFarmName": "Vaalbos",
    "personDescription": {
      "notes": "Gesteel: 2 Cows | Herwin: 0 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-03-05T06:00:00Z",
    "updatedAt": "2025-03-05T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-091",
    "caseNumber": "VIS-HBF-2025-091",
    "title": "Veediefstal: 1 Rhino - Andries (Vee-arts) Nel (Rietfontein)",
    "description": "KLAER / KONTAK: M. Nel. AREA / PLAAS: Rietfontein. GESTEEL: 1 Rhino. STATUS: 0 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°50'47.5\"S 26°15'35.6\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-091",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-28",
    "incidentTime": "02:00",
    "locationName": "Rietfontein (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.846528,
      "longitude": 26.259889
    },
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 1 Rhino | Herwin: 0 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-28T06:00:00Z",
    "updatedAt": "2025-02-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-092",
    "caseNumber": "VIS-HBF-2025-092",
    "title": "Veediefstal: 1 Cow - G. Coetzer (Platberg)",
    "description": "KLAER / KONTAK: G. Coetzer. AREA / PLAAS: Platberg. GESTEEL: 1 Cow. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-092",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-25",
    "incidentTime": "02:00",
    "locationName": "Platberg (G. Coetzer)",
    "sector": "Sektor Platberg",
    "reportedByUid": "USR-VIS-REC-092",
    "reportedByName": "G. Coetzer",
    "reportedByPhone": "",
    "victimName": "G. Coetzer",
    "victimPhone": "",
    "victimFarmName": "Platberg",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-092-2",
        "caseId": "CASE-VIS-HBF-092",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag.",
        "updateType": "progress",
        "isInternalOnly": false,
        "timestamp": "2025-02-25T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-25T06:00:00Z",
    "updatedAt": "2025-02-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-093",
    "caseNumber": "VIS-HBF-2025-093",
    "title": "Veediefstal: 70 Goats - R. Victor (Schweizer)",
    "description": "KLAER / KONTAK: R. Victor. AREA / PLAAS: Schweizer. GESTEEL: 70 Goats. STATUS: 0 Herwin | 70 Vermis | 0 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-093",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-25",
    "incidentTime": "02:00",
    "locationName": "Schweizer (R. Victor)",
    "sector": "Sektor Schweizer",
    "reportedByUid": "USR-VIS-REC-093",
    "reportedByName": "R. Victor",
    "reportedByPhone": "",
    "victimName": "R. Victor",
    "victimPhone": "",
    "victimFarmName": "Schweizer",
    "personDescription": {
      "notes": "Gesteel: 70 Goats | Herwin: 0 | Vermis: 70 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-25T06:00:00Z",
    "updatedAt": "2025-02-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-094",
    "caseNumber": "VIS-HBF-2025-094",
    "title": "Veediefstal: 1 Cow - Jurgens Viljoen (Droekraal)",
    "description": "KLAER / KONTAK: J. Viljoen. AREA / PLAAS: Droekraal. GESTEEL: 1 Cow. STATUS: 0 Herwin | 1 Vermis | 0 Geslag. Gesteel Koördinate: 26°45'38.8\"S 26°07'37.3\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-094",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-13",
    "incidentTime": "02:00",
    "locationName": "Droekraal (Jurgens Viljoen)",
    "sector": "Sektor Droeëkraal",
    "gpsLocation": {
      "latitude": -26.760778,
      "longitude": 26.127028
    },
    "reportedByUid": "USR-CLIENT-116",
    "reportedByName": "Jurgens Viljoen",
    "reportedByPhone": "+27 79 490 8231",
    "victimUid": "USR-CLIENT-116",
    "victimName": "Jurgens Viljoen",
    "victimPhone": "+27 79 490 8231",
    "victimFarmName": "Droeëkraal",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 1 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-13T06:00:00Z",
    "updatedAt": "2025-02-13T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-095",
    "caseNumber": "VIS-HBF-2025-095",
    "title": "Veediefstal: 2 Cows - Johan Pollard (Renosterhoek)",
    "description": "KLAER / KONTAK: J. Pollard. AREA / PLAAS: Renosterhoek. GESTEEL: 2 Cows. STATUS: 2 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'08.6\"S 26°26'12.1\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-095",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-12",
    "incidentTime": "02:00",
    "locationName": "Renosterhoek (Johan Pollard)",
    "sector": "Sektor Renosterhoek",
    "gpsLocation": {
      "latitude": -26.869056,
      "longitude": 26.436694
    },
    "reportedByUid": "USR-CLIENT-081",
    "reportedByName": "Johan Pollard",
    "reportedByPhone": "+27 82 635 9797",
    "victimUid": "USR-CLIENT-081",
    "victimName": "Johan Pollard",
    "victimPhone": "+27 82 635 9797",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 2 Cows | Herwin: 2 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-095-1",
        "caseId": "CASE-VIS-HBF-095",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-02-12T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-12T06:00:00Z",
    "updatedAt": "2025-02-12T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-096",
    "caseNumber": "VIS-HBF-2025-096",
    "title": "Veediefstal: 7 Cows - P. Makintinie (Wolwerand)",
    "description": "KLAER / KONTAK: P. Makintinie. AREA / PLAAS: Wolwerand. GESTEEL: 7 Cows. STATUS: 6 Herwin | 1 Vermis | 0 Geslag. Gesteel Koördinate: 26°53'26.3\"S 26°29'44.6\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-096",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-11",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (P. Makintinie)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.890639,
      "longitude": 26.495722
    },
    "reportedByUid": "USR-VIS-REC-096",
    "reportedByName": "P. Makintinie",
    "reportedByPhone": "",
    "victimName": "P. Makintinie",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 7 Cows | Herwin: 6 | Vermis: 1 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-096-1",
        "caseId": "CASE-VIS-HBF-096",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-02-11T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-11T06:00:00Z",
    "updatedAt": "2025-02-11T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-097",
    "caseNumber": "VIS-HBF-2025-097",
    "title": "Veediefstal: 13 Cows - C. Daffue (Syferfontein)",
    "description": "KLAER / KONTAK: C. Daffue. AREA / PLAAS: Syferfontein. GESTEEL: 13 Cows. STATUS: 13 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 27°04'25.5\"S 26°21'33.9\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-097",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-11",
    "incidentTime": "02:00",
    "locationName": "Syferfontein (C. Daffue)",
    "sector": "Sektor Syferfontein",
    "gpsLocation": {
      "latitude": -27.07375,
      "longitude": 26.359417
    },
    "reportedByUid": "USR-VIS-REC-097",
    "reportedByName": "C. Daffue",
    "reportedByPhone": "",
    "victimName": "C. Daffue",
    "victimPhone": "",
    "victimFarmName": "Syferfontein",
    "personDescription": {
      "notes": "Gesteel: 13 Cows | Herwin: 13 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-097-1",
        "caseId": "CASE-VIS-HBF-097",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 13 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-02-11T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-11T06:00:00Z",
    "updatedAt": "2025-02-11T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-098",
    "caseNumber": "VIS-HBF-2025-098",
    "title": "Veediefstal: 5 Cows - L. Camfer (Wolwerand)",
    "description": "KLAER / KONTAK: L. Camfer. AREA / PLAAS: Wolwerand. GESTEEL: 5 Cows. STATUS: 0 Herwin | 5 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'12.3\"S 26°26'50.4\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-098",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-10",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (L. Camfer)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.853417,
      "longitude": 26.447333
    },
    "reportedByUid": "USR-VIS-REC-098",
    "reportedByName": "L. Camfer",
    "reportedByPhone": "",
    "victimName": "L. Camfer",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 5 Cows | Herwin: 0 | Vermis: 5 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-10T06:00:00Z",
    "updatedAt": "2025-02-10T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-099",
    "caseNumber": "VIS-HBF-2025-099",
    "title": "Veediefstal: 2 Bulls - Andries (Vee-arts) Nel (Meliodora)",
    "description": "KLAER / KONTAK: M. Nel. AREA / PLAAS: Meliodora. GESTEEL: 2 Bulls. STATUS: 2 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°48'30.5\"S 26°06'30.5\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-099",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-02-06",
    "incidentTime": "02:00",
    "locationName": "Meliodora (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.808472,
      "longitude": 26.108472
    },
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 2 Bulls | Herwin: 2 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-099-1",
        "caseId": "CASE-VIS-HBF-099",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-02-06T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-02-06T06:00:00Z",
    "updatedAt": "2025-02-06T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-100",
    "caseNumber": "VIS-HBF-2025-100",
    "title": "Veediefstal: 1 Cow 3 Calves - C. Boshoff (Makokskraal)",
    "description": "KLAER / KONTAK: C. Boshoff. AREA / PLAAS: Makokskraal. GESTEEL: 1 Cow 3 Calves. STATUS: 0 Herwin | 4 Vermis | 0 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-100",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-01-31",
    "incidentTime": "02:00",
    "locationName": "Makokskraal (C. Boshoff)",
    "sector": "Sektor Makokskraal",
    "reportedByUid": "USR-VIS-REC-100",
    "reportedByName": "C. Boshoff",
    "reportedByPhone": "",
    "victimName": "C. Boshoff",
    "victimPhone": "",
    "victimFarmName": "Makokskraal",
    "personDescription": {
      "notes": "Gesteel: 1 Cow 3 Calves | Herwin: 0 | Vermis: 4 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-01-31T06:00:00Z",
    "updatedAt": "2025-01-31T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-101",
    "caseNumber": "VIS-HBF-2025-101",
    "title": "Veediefstal: 44 Sheep - D. Kritzinger (Klerksdorp)",
    "description": "KLAER / KONTAK: D. Kritzinger. AREA / PLAAS: Klerksdorp. GESTEEL: 44 Sheep. STATUS: 0 Herwin | 44 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'02.5\"S 26°38'37.2\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-101",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-01-29",
    "incidentTime": "02:00",
    "locationName": "Klerksdorp (D. Kritzinger)",
    "sector": "Sektor Klerksdorp",
    "gpsLocation": {
      "latitude": -26.817361,
      "longitude": 26.643667
    },
    "reportedByUid": "USR-VIS-REC-101",
    "reportedByName": "D. Kritzinger",
    "reportedByPhone": "",
    "victimName": "D. Kritzinger",
    "victimPhone": "",
    "victimFarmName": "Klerksdorp",
    "personDescription": {
      "notes": "Gesteel: 44 Sheep | Herwin: 0 | Vermis: 44 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-01-29T06:00:00Z",
    "updatedAt": "2025-01-29T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-102",
    "caseNumber": "VIS-HBF-2025-102",
    "title": "Veediefstal: 1 Cow - Onbekend (Leeudoringstad)",
    "description": "KLAER / KONTAK: Onbekend. AREA / PLAAS: Leeudoringstad. GESTEEL: 1 Cow. STATUS: 6 Herwin | 1 Vermis | 0 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-102",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-01-26",
    "incidentTime": "02:00",
    "locationName": "Leeudoringstad (Onbekend)",
    "sector": "Sektor Leeudoringstad",
    "reportedByUid": "USR-VIS-REC-102",
    "reportedByName": "Onbekend",
    "reportedByPhone": "",
    "victimName": "Onbekend",
    "victimPhone": "",
    "victimFarmName": "Leeudoringstad",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 6 | Vermis: 1 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-102-1",
        "caseId": "CASE-VIS-HBF-102",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-01-26T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-01-26T06:00:00Z",
    "updatedAt": "2025-01-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-103",
    "caseNumber": "VIS-HBF-2025-103",
    "title": "Veediefstal: 18 Sheep - Wansen Engelbrecht (Wolwerand)",
    "description": "KLAER / KONTAK: W. Engelbrecht. AREA / PLAAS: Wolwerand. GESTEEL: 18 Sheep. STATUS: 16 Herwin | 2 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'52.6\"S 26°29'41.6\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-103",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-01-21",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wansen Engelbrecht)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.864611,
      "longitude": 26.494889
    },
    "reportedByUid": "USR-CLIENT-027",
    "reportedByName": "Wansen Engelbrecht",
    "reportedByPhone": "+27 83 304 9388",
    "victimUid": "USR-CLIENT-027",
    "victimName": "Wansen Engelbrecht",
    "victimPhone": "+27 83 304 9388",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 18 Sheep | Herwin: 16 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-103-1",
        "caseId": "CASE-VIS-HBF-103",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 16 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2025-01-21T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-01-21T06:00:00Z",
    "updatedAt": "2025-01-21T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-104",
    "caseNumber": "VIS-HBF-2025-104",
    "title": "Veediefstal: 27 Sheep - Victor Swart (Sendelingsfontein)",
    "description": "KLAER / KONTAK: R. Swart. AREA / PLAAS: Sendelingsfontein. GESTEEL: 27 Sheep. STATUS: 0 Herwin | 27 Vermis | 0 Geslag. Gesteel Koördinate: 26°54'59.6\"S 26°14'15.6\"E. Laaipunt Koördinate: 26°57'26.3\"S 26°18'24.3\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-104",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-01-17",
    "incidentTime": "02:00",
    "locationName": "Sendelingsfontein (Victor Swart)",
    "sector": "Sektor Witpoort",
    "gpsLocation": {
      "latitude": -26.916556,
      "longitude": 26.237667
    },
    "reportedByUid": "USR-CLIENT-098",
    "reportedByName": "Victor Swart",
    "reportedByPhone": "+27 83 407 2275",
    "victimUid": "USR-CLIENT-098",
    "victimName": "Victor Swart",
    "victimPhone": "+27 83 407 2275",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 27 Sheep | Herwin: 0 | Vermis: 27 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°57'26.3\"S 26°18'24.3\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-01-17T06:00:00Z",
    "updatedAt": "2025-01-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-105",
    "caseNumber": "VIS-HBF-2025-105",
    "title": "Veediefstal: 1 Cow - Andries (Vee-arts) Nel (Makokskraal)",
    "description": "KLAER / KONTAK: A. Cornelius. AREA / PLAAS: Makokskraal. GESTEEL: 1 Cow. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-105",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-01-09",
    "incidentTime": "02:00",
    "locationName": "Makokskraal (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-105-2",
        "caseId": "CASE-VIS-HBF-105",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag.",
        "updateType": "progress",
        "isInternalOnly": false,
        "timestamp": "2025-01-09T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-01-09T06:00:00Z",
    "updatedAt": "2025-01-09T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-106",
    "caseNumber": "VIS-HBF-2025-106",
    "title": "Veediefstal: 1 Rhino - Andries (Vee-arts) Nel (Rietfontein)",
    "description": "KLAER / KONTAK: M. Nel. AREA / PLAAS: Rietfontein. GESTEEL: 1 Rhino. STATUS: 0 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°50'47.5\"S 26°15'35.6\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-106",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2025-01-08",
    "incidentTime": "02:00",
    "locationName": "Rietfontein (Andries (Vee-arts) Nel)",
    "sector": "Sektor Bultfontein",
    "gpsLocation": {
      "latitude": -26.846528,
      "longitude": 26.259889
    },
    "reportedByUid": "USR-CLIENT-075",
    "reportedByName": "Andries (Vee-arts) Nel",
    "reportedByPhone": "+27 82 775 0948",
    "victimUid": "USR-CLIENT-075",
    "victimName": "Andries (Vee-arts) Nel",
    "victimPhone": "+27 82 775 0948",
    "victimFarmName": "Bultfontein",
    "personDescription": {
      "notes": "Gesteel: 1 Rhino | Herwin: 0 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2025-01-08T06:00:00Z",
    "updatedAt": "2025-01-08T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-107",
    "caseNumber": "VIS-HBF-2024-107",
    "title": "Veediefstal: 24 Sheep - F. Anderson (Paardeplaas)",
    "description": "KLAER / KONTAK: F. Anderson. AREA / PLAAS: Paardeplaas. GESTEEL: 24 Sheep. STATUS: 0 Herwin | 24 Vermis | 0 Geslag. Gesteel Koördinate: 26°37'26.1\"S 26°18'23.5\"E. Laaipunt Koördinate: 26°38'07.5\"S 26°20'13.0\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-107",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-12-31",
    "incidentTime": "02:00",
    "locationName": "Paardeplaas (F. Anderson)",
    "sector": "Sektor Paardeplaas",
    "gpsLocation": {
      "latitude": -26.623917,
      "longitude": 26.306528
    },
    "reportedByUid": "USR-VIS-REC-107",
    "reportedByName": "F. Anderson",
    "reportedByPhone": "",
    "victimName": "F. Anderson",
    "victimPhone": "",
    "victimFarmName": "Paardeplaas",
    "personDescription": {
      "notes": "Gesteel: 24 Sheep | Herwin: 0 | Vermis: 24 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°38'07.5\"S 26°20'13.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-12-31T06:00:00Z",
    "updatedAt": "2024-12-31T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-108",
    "caseNumber": "VIS-HBF-2024-108",
    "title": "Veediefstal: 3 Cows 3 Calves - N. Meyer (Wolwerand)",
    "description": "KLAER / KONTAK: N. Meyer. AREA / PLAAS: Wolwerand. GESTEEL: 3 Cows 3 Calves. STATUS: 6 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'22.0\"S 26°27'41.5\"E. Laaipunt Koördinate: 26°55'38.5\"S 26°33'26.9\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-108",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-12-31",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (N. Meyer)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.856111,
      "longitude": 26.461528
    },
    "reportedByUid": "USR-VIS-REC-108",
    "reportedByName": "N. Meyer",
    "reportedByPhone": "",
    "victimName": "N. Meyer",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 3 Cows 3 Calves | Herwin: 6 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°55'38.5\"S 26°33'26.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-108-1",
        "caseId": "CASE-VIS-HBF-108",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2024-12-31T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-12-31T06:00:00Z",
    "updatedAt": "2024-12-31T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-109",
    "caseNumber": "VIS-HBF-2024-109",
    "title": "Veediefstal: 1 Cow - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 1 Cow. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Gesteel Koördinate: 26°52'03.9\"S 26°29'21.6\"E. Slagplek Koördinate: 26°53'15.7\"S 26°30'48.7\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-109",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-08-30",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.86775,
      "longitude": 26.489333
    },
    "reportedByUid": "USR-VIS-REC-109",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°53'15.7\"S 26°30'48.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-109-2",
        "caseId": "CASE-VIS-HBF-109",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag. Slagplek koördinate: 26°53'15.7\"S 26°30'48.7\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.887694,
          "longitude": 26.513528
        },
        "timestamp": "2024-08-30T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-08-30T06:00:00Z",
    "updatedAt": "2024-08-30T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-110",
    "caseNumber": "VIS-HBF-2024-110",
    "title": "Veediefstal: 1 Bull - Hartbeesfontein Eienaar (Hartbeesfontein)",
    "description": "KLAER / KONTAK: Hartbeesfontein Eienaar. AREA / PLAAS: Hartbeesfontein. GESTEEL: 1 Bull. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Gesteel Koördinate: 26°45'16.6\"S 26°26'52.6\"E. Slagplek Koördinate: 26°45'29.3\"S 26°26'56.7\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-110",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-06-14",
    "incidentTime": "02:00",
    "locationName": "Hartbeesfontein (Hartbeesfontein Eienaar)",
    "sector": "Sektor Hartbeesfontein",
    "gpsLocation": {
      "latitude": -26.754611,
      "longitude": 26.447944
    },
    "reportedByUid": "USR-VIS-REC-110",
    "reportedByName": "Hartbeesfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Hartbeesfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Hartbeesfontein",
    "personDescription": {
      "notes": "Gesteel: 1 Bull | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°45'29.3\"S 26°26'56.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-110-2",
        "caseId": "CASE-VIS-HBF-110",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag. Slagplek koördinate: 26°45'29.3\"S 26°26'56.7\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.758139,
          "longitude": 26.449083
        },
        "timestamp": "2024-06-14T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-06-14T06:00:00Z",
    "updatedAt": "2024-06-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-111",
    "caseNumber": "VIS-HBF-2024-111",
    "title": "Veediefstal: 1 Bull 2 Cows 8 Calves - Witpoort Eienaar (Witpoort)",
    "description": "KLAER / KONTAK: Witpoort Eienaar. AREA / PLAAS: Witpoort. GESTEEL: 1 Bull 2 Cows 8 Calves. STATUS: 8 Herwin | 3 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'26.3\"S 26°35'36.4\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-111",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-06-14",
    "incidentTime": "02:00",
    "locationName": "Witpoort (Witpoort Eienaar)",
    "sector": "Sektor Witpoort",
    "gpsLocation": {
      "latitude": -26.823972,
      "longitude": 26.593444
    },
    "reportedByUid": "USR-VIS-REC-111",
    "reportedByName": "Witpoort Eienaar",
    "reportedByPhone": "",
    "victimName": "Witpoort Eienaar",
    "victimPhone": "",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 1 Bull 2 Cows 8 Calves | Herwin: 8 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-111-1",
        "caseId": "CASE-VIS-HBF-111",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 8 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2024-06-14T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-06-14T06:00:00Z",
    "updatedAt": "2024-06-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-112",
    "caseNumber": "VIS-HBF-2024-112",
    "title": "Veediefstal: 44 Sheep - Hartbeesfontein Eienaar (Hartbeesfontein)",
    "description": "KLAER / KONTAK: Hartbeesfontein Eienaar. AREA / PLAAS: Hartbeesfontein. GESTEEL: 44 Sheep. STATUS: 6 Herwin | 38 Vermis | 0 Geslag. Gesteel Koördinate: 26°46'10.6\"S 26°24'24.6\"E. Gevind Koördinate: 26°48'15.9\"S 26°25'34.4\"E. Laaipunt Koördinate: 26°48'15.9\"S 26°25'34.4\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-112",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-06-07",
    "incidentTime": "02:00",
    "locationName": "Hartbeesfontein (Hartbeesfontein Eienaar)",
    "sector": "Sektor Hartbeesfontein",
    "gpsLocation": {
      "latitude": -26.769611,
      "longitude": 26.406833
    },
    "reportedByUid": "USR-VIS-REC-112",
    "reportedByName": "Hartbeesfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Hartbeesfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Hartbeesfontein",
    "personDescription": {
      "notes": "Gesteel: 44 Sheep | Herwin: 6 | Vermis: 38 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°48'15.9\"S 26°25'34.4\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-112-1",
        "caseId": "CASE-VIS-HBF-112",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind. Gevind by koördinate: 26°48'15.9\"S 26°25'34.4\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.804417,
          "longitude": 26.426222
        },
        "timestamp": "2024-06-07T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-06-07T06:00:00Z",
    "updatedAt": "2024-06-07T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-113",
    "caseNumber": "VIS-HBF-2024-113",
    "title": "Veediefstal: 3 Cows - Sendelingsfontein Eienaar (Sendelingsfontein)",
    "description": "KLAER / KONTAK: Sendelingsfontein Eienaar. AREA / PLAAS: Sendelingsfontein. GESTEEL: 3 Cows. STATUS: 0 Herwin | 3 Vermis | 0 Geslag. Gesteel Koördinate: 26°55'22.8\"S 26°13'39.3\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-113",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-06-05",
    "incidentTime": "02:00",
    "locationName": "Sendelingsfontein (Sendelingsfontein Eienaar)",
    "sector": "Sektor Sendelingsfontein",
    "gpsLocation": {
      "latitude": -26.923,
      "longitude": 26.227583
    },
    "reportedByUid": "USR-VIS-REC-113",
    "reportedByName": "Sendelingsfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Sendelingsfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Sendelingsfontein",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 0 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-06-05T06:00:00Z",
    "updatedAt": "2024-06-05T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-114",
    "caseNumber": "VIS-HBF-2024-114",
    "title": "Veediefstal: 3 Cows - Ysterspruit Eienaar (Ysterspruit)",
    "description": "KLAER / KONTAK: Ysterspruit Eienaar. AREA / PLAAS: Ysterspruit. GESTEEL: 3 Cows. STATUS: 0 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 27°07'17.3\"S 26°22'13.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-114",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-05-29",
    "incidentTime": "02:00",
    "locationName": "Ysterspruit (Ysterspruit Eienaar)",
    "sector": "Sektor Ysterspruit",
    "gpsLocation": {
      "latitude": -27.121472,
      "longitude": 26.370278
    },
    "reportedByUid": "USR-VIS-REC-114",
    "reportedByName": "Ysterspruit Eienaar",
    "reportedByPhone": "",
    "victimName": "Ysterspruit Eienaar",
    "victimPhone": "",
    "victimFarmName": "Ysterspruit",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 0 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-05-29T06:00:00Z",
    "updatedAt": "2024-05-29T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-115",
    "caseNumber": "VIS-HBF-2024-115",
    "title": "Veediefstal: 3 Cows - Johann (Dr.) Fourie (Jakkalsfontein)",
    "description": "KLAER / KONTAK: Dr Johan Fourie. AREA / PLAAS: Jakkalsfontein. GESTEEL: 3 Cows. STATUS: 0 Herwin | 0 Vermis | 3 Geslag. Gesteel Koördinate: 26°56'26.5\"S 26°19'15.2\"E. Slagplek Koördinate: 26°56'59.2\"S 26°19'27.1\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-115",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-05-24",
    "incidentTime": "02:00",
    "locationName": "Jakkalsfontein (Johann (Dr.) Fourie)",
    "sector": "Sektor Jakkalsfontein",
    "gpsLocation": {
      "latitude": -26.940694,
      "longitude": 26.320889
    },
    "reportedByUid": "USR-CLIENT-033",
    "reportedByName": "Johann (Dr.) Fourie",
    "reportedByPhone": "+27 82 772 7716",
    "victimUid": "USR-CLIENT-033",
    "victimName": "Johann (Dr.) Fourie",
    "victimPhone": "+27 82 772 7716",
    "victimFarmName": "Jakkalsfontein",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 0 | Vermis: 0 | Geslag: 3"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°56'59.2\"S 26°19'27.1\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-115-2",
        "caseId": "CASE-VIS-HBF-115",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 3 diere geslag. Slagplek koördinate: 26°56'59.2\"S 26°19'27.1\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.949778,
          "longitude": 26.324194
        },
        "timestamp": "2024-05-24T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-05-24T06:00:00Z",
    "updatedAt": "2024-05-24T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-116",
    "caseNumber": "VIS-HBF-2024-116",
    "title": "Veediefstal: 5 Cows - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 5 Cows. STATUS: 3 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'17.9\"S 26°26'36.9\"E. Gevind Koördinate: 26°53'03.5\"S 26°30'20.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-116",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-05-19",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.854972,
      "longitude": 26.443583
    },
    "reportedByUid": "USR-VIS-REC-116",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 5 Cows | Herwin: 3 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-116-1",
        "caseId": "CASE-VIS-HBF-116",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 3 diere herwin/teruggevind. Gevind by koördinate: 26°53'03.5\"S 26°30'20.0\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.884306,
          "longitude": 26.505556
        },
        "timestamp": "2024-05-19T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-05-19T06:00:00Z",
    "updatedAt": "2024-05-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-117",
    "caseNumber": "VIS-HBF-2024-117",
    "title": "Veediefstal: 3 Cows - Stephan Cloete (Sendelingsfontein)",
    "description": "KLAER / KONTAK: Stephan Cloete. AREA / PLAAS: Sendelingsfontein. GESTEEL: 3 Cows. STATUS: 0 Herwin | 0 Vermis | 3 Geslag. Slagplek Koördinate: 27°01'07.5\"S 26°19'59.2\"E. Bron: Nov Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-117",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-05-19",
    "incidentTime": "02:00",
    "locationName": "Sendelingsfontein (Stephan Cloete)",
    "sector": "Sektor Sendelingsfontein",
    "gpsLocation": {
      "latitude": -27.01875,
      "longitude": 26.333111
    },
    "reportedByUid": "USR-VIS-REC-117",
    "reportedByName": "Stephan Cloete",
    "reportedByPhone": "",
    "victimName": "Stephan Cloete",
    "victimPhone": "",
    "victimFarmName": "Sendelingsfontein",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 0 | Vermis: 0 | Geslag: 3"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 27°01'07.5\"S 26°19'59.2\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-117-2",
        "caseId": "CASE-VIS-HBF-117",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 3 diere geslag. Slagplek koördinate: 27°01'07.5\"S 26°19'59.2\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -27.01875,
          "longitude": 26.333111
        },
        "timestamp": "2024-05-19T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-05-19T06:00:00Z",
    "updatedAt": "2024-05-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-118",
    "caseNumber": "VIS-HBF-2024-118",
    "title": "Veediefstal: 11 Cows - Witpoort Eienaar (Witpoort)",
    "description": "KLAER / KONTAK: Witpoort Eienaar. AREA / PLAAS: Witpoort. GESTEEL: 11 Cows. STATUS: 0 Herwin | 6 Vermis | 5 Geslag. Gesteel Koördinate: 26°43'58.8\"S 26°36'21.3\"E. Slagplek Koördinate: 26°51'50.8\"S 26°34'37.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-118",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-05-12",
    "incidentTime": "02:00",
    "locationName": "Witpoort (Witpoort Eienaar)",
    "sector": "Sektor Witpoort",
    "gpsLocation": {
      "latitude": -26.733,
      "longitude": 26.605917
    },
    "reportedByUid": "USR-VIS-REC-118",
    "reportedByName": "Witpoort Eienaar",
    "reportedByPhone": "",
    "victimName": "Witpoort Eienaar",
    "victimPhone": "",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 11 Cows | Herwin: 0 | Vermis: 6 | Geslag: 5"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°51'50.8\"S 26°34'37.2\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-118-2",
        "caseId": "CASE-VIS-HBF-118",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 5 diere geslag. Slagplek koördinate: 26°51'50.8\"S 26°34'37.2\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.864111,
          "longitude": 26.577
        },
        "timestamp": "2024-05-12T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-05-12T06:00:00Z",
    "updatedAt": "2024-05-12T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-119",
    "caseNumber": "VIS-HBF-2024-119",
    "title": "Veediefstal: 1 Cow - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 1 Cow. STATUS: 1 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'50.2\"S 26°28'15.2\"E. Gevind Koördinate: 26°53'23.2\"S 26°34'14.3\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-119",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-05-08",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.880611,
      "longitude": 26.470889
    },
    "reportedByUid": "USR-VIS-REC-119",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 1 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-119-1",
        "caseId": "CASE-VIS-HBF-119",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind. Gevind by koördinate: 26°53'23.2\"S 26°34'14.3\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.889778,
          "longitude": 26.570639
        },
        "timestamp": "2024-05-08T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-05-08T06:00:00Z",
    "updatedAt": "2024-05-08T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-120",
    "caseNumber": "VIS-HBF-2024-120",
    "title": "Veediefstal: 30 Chickens - Oorbietjiesfontein Eienaar (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: Oorbietjiesfontein Eienaar. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 30 Chickens. STATUS: 0 Herwin | 30 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'00.8\"S 26°21'57.7\"E. Draadsnyding Koördinate: Aug2023. Bron: undefined Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-120",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-05-01",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Oorbietjiesfontein Eienaar)",
    "sector": "Sektor Oorbietjiesfontein",
    "gpsLocation": {
      "latitude": -26.816889,
      "longitude": 26.366028
    },
    "reportedByUid": "USR-VIS-REC-120",
    "reportedByName": "Oorbietjiesfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Oorbietjiesfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Oorbietjiesfontein",
    "personDescription": {
      "notes": "Gesteel: 30 Chickens | Herwin: 0 | Vermis: 30 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Draad gesny by: Aug2023",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-05-01T06:00:00Z",
    "updatedAt": "2024-05-01T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-121",
    "caseNumber": "VIS-HBF-2024-121",
    "title": "Veediefstal: 1 Calve - Vredehof Eienaar (Vredehof)",
    "description": "KLAER / KONTAK: Vredehof Eienaar. AREA / PLAAS: Vredehof. GESTEEL: 1 Calve. STATUS: 0 Herwin | 1 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'05.1\"S 26°08'06.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-121",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-26",
    "incidentTime": "02:00",
    "locationName": "Vredehof (Vredehof Eienaar)",
    "sector": "Sektor Vredehof",
    "gpsLocation": {
      "latitude": -26.818083,
      "longitude": 26.135056
    },
    "reportedByUid": "USR-VIS-REC-121",
    "reportedByName": "Vredehof Eienaar",
    "reportedByPhone": "",
    "victimName": "Vredehof Eienaar",
    "victimPhone": "",
    "victimFarmName": "Vredehof",
    "personDescription": {
      "notes": "Gesteel: 1 Calve | Herwin: 0 | Vermis: 1 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-26T06:00:00Z",
    "updatedAt": "2024-04-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-122",
    "caseNumber": "VIS-HBF-2024-122",
    "title": "Veediefstal: 8 Cows 18 Calves - Witpoort Eienaar (Witpoort)",
    "description": "KLAER / KONTAK: Witpoort Eienaar. AREA / PLAAS: Witpoort. GESTEEL: 8 Cows 18 Calves. STATUS: 8 Herwin | 18 Vermis | 0 Geslag. Gesteel Koördinate: 26°43'14.3\"S 26°35'36.2\"E. Gevind Koördinate: 26°45'28.7\"S 26°59'27.1\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-122",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-25",
    "incidentTime": "02:00",
    "locationName": "Witpoort (Witpoort Eienaar)",
    "sector": "Sektor Witpoort",
    "gpsLocation": {
      "latitude": -26.720639,
      "longitude": 26.593389
    },
    "reportedByUid": "USR-VIS-REC-122",
    "reportedByName": "Witpoort Eienaar",
    "reportedByPhone": "",
    "victimName": "Witpoort Eienaar",
    "victimPhone": "",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 8 Cows 18 Calves | Herwin: 8 | Vermis: 18 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-122-1",
        "caseId": "CASE-VIS-HBF-122",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 8 diere herwin/teruggevind. Gevind by koördinate: 26°45'28.7\"S 26°59'27.1\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.757972,
          "longitude": 26.990861
        },
        "timestamp": "2024-04-25T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-25T06:00:00Z",
    "updatedAt": "2024-04-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-123",
    "caseNumber": "VIS-HBF-2024-123",
    "title": "Veediefstal: 11 Cows 4 Calves - Doornpoort Eienaar (Doornpoort)",
    "description": "KLAER / KONTAK: Doornpoort Eienaar. AREA / PLAAS: Doornpoort. GESTEEL: 11 Cows 4 Calves. STATUS: 15 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°40'48.3\"S 26°38'45.8\"E. Gevind Koördinate: 26°40'06.5\"S 26°36'19.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-123",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-25",
    "incidentTime": "02:00",
    "locationName": "Doornpoort (Doornpoort Eienaar)",
    "sector": "Sektor Doornpoort",
    "gpsLocation": {
      "latitude": -26.680083,
      "longitude": 26.646056
    },
    "reportedByUid": "USR-VIS-REC-123",
    "reportedByName": "Doornpoort Eienaar",
    "reportedByPhone": "",
    "victimName": "Doornpoort Eienaar",
    "victimPhone": "",
    "victimFarmName": "Doornpoort",
    "personDescription": {
      "notes": "Gesteel: 11 Cows 4 Calves | Herwin: 15 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-123-1",
        "caseId": "CASE-VIS-HBF-123",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 15 diere herwin/teruggevind. Gevind by koördinate: 26°40'06.5\"S 26°36'19.2\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.668472,
          "longitude": 26.605333
        },
        "timestamp": "2024-04-25T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-25T06:00:00Z",
    "updatedAt": "2024-04-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-124",
    "caseNumber": "VIS-HBF-2024-124",
    "title": "Veediefstal: 1 Cow - Ysterspruit Eienaar (Ysterspruit)",
    "description": "KLAER / KONTAK: Ysterspruit Eienaar. AREA / PLAAS: Ysterspruit. GESTEEL: 1 Cow. STATUS: 0 Herwin | 1 Vermis | 0 Geslag. Gesteel Koördinate: 26°59'05.0\"S 26°31'23.6\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-124",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-24",
    "incidentTime": "02:00",
    "locationName": "Ysterspruit (Ysterspruit Eienaar)",
    "sector": "Sektor Ysterspruit",
    "gpsLocation": {
      "latitude": -26.984722,
      "longitude": 26.523222
    },
    "reportedByUid": "USR-VIS-REC-124",
    "reportedByName": "Ysterspruit Eienaar",
    "reportedByPhone": "",
    "victimName": "Ysterspruit Eienaar",
    "victimPhone": "",
    "victimFarmName": "Ysterspruit",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 1 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-24T06:00:00Z",
    "updatedAt": "2024-04-24T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-125",
    "caseNumber": "VIS-HBF-2024-125",
    "title": "Veediefstal: 1 Bull 4 Cows 1 Calve - Schoemansfontein Eienaar (Schoemansfontein)",
    "description": "KLAER / KONTAK: Schoemansfontein Eienaar. AREA / PLAAS: Schoemansfontein. GESTEEL: 1 Bull 4 Cows 1 Calve. STATUS: 6 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°46'18.9\"S 26°27'36.2\"E. Gevind Koördinate: 26°51'13.0\"S 26°32'02.3\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-125",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-23",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Schoemansfontein Eienaar)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.771917,
      "longitude": 26.460056
    },
    "reportedByUid": "USR-VIS-REC-125",
    "reportedByName": "Schoemansfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Schoemansfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 1 Bull 4 Cows 1 Calve | Herwin: 6 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-125-1",
        "caseId": "CASE-VIS-HBF-125",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind. Gevind by koördinate: 26°51'13.0\"S 26°32'02.3\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.853611,
          "longitude": 26.533972
        },
        "timestamp": "2024-04-23T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-23T06:00:00Z",
    "updatedAt": "2024-04-23T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-126",
    "caseNumber": "VIS-HBF-2024-126",
    "title": "Veediefstal: 40 Sheep - Paardeplaas Eienaar (Paardeplaas)",
    "description": "KLAER / KONTAK: Paardeplaas Eienaar. AREA / PLAAS: Paardeplaas. GESTEEL: 40 Sheep. STATUS: 0 Herwin | 40 Vermis | 0 Geslag. Gesteel Koördinate: 26°37'25.8\"S 26°18'28.4\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-126",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-22",
    "incidentTime": "02:00",
    "locationName": "Paardeplaas (Paardeplaas Eienaar)",
    "sector": "Sektor Paardeplaas",
    "gpsLocation": {
      "latitude": -26.623833,
      "longitude": 26.307889
    },
    "reportedByUid": "USR-VIS-REC-126",
    "reportedByName": "Paardeplaas Eienaar",
    "reportedByPhone": "",
    "victimName": "Paardeplaas Eienaar",
    "victimPhone": "",
    "victimFarmName": "Paardeplaas",
    "personDescription": {
      "notes": "Gesteel: 40 Sheep | Herwin: 0 | Vermis: 40 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-22T06:00:00Z",
    "updatedAt": "2024-04-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-127",
    "caseNumber": "VIS-HBF-2024-127",
    "title": "Veediefstal: 2 Bulls 2 Cows 3 Calves - 1 Bull 2 Cows Eienaar (Rhenosterhoek)",
    "description": "KLAER / KONTAK: 1 Bull 2 Cows Eienaar. AREA / PLAAS: Rhenosterhoek. GESTEEL: 2 Bulls 2 Cows 3 Calves. STATUS: 4 Herwin | 0 Vermis | 3 Geslag. Gesteel Koördinate: 26°50'43.5\"S 26°24'00.0\"E. Gevind Koördinate: 26°54'30.8\"S 26°24'08.9\"E. Slagplek Koördinate: 26°54'40.1\"S 26°23'40.8\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-127",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-17",
    "incidentTime": "02:00",
    "locationName": "Rhenosterhoek (1 Bull 2 Cows Eienaar)",
    "sector": "Sektor Rhenosterhoek",
    "gpsLocation": {
      "latitude": -26.845417,
      "longitude": 26.4
    },
    "reportedByUid": "USR-VIS-REC-127",
    "reportedByName": "1 Bull 2 Cows Eienaar",
    "reportedByPhone": "",
    "victimName": "1 Bull 2 Cows Eienaar",
    "victimPhone": "",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 2 Bulls 2 Cows 3 Calves | Herwin: 4 | Vermis: 0 | Geslag: 3"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°54'40.1\"S 26°23'40.8\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-127-1",
        "caseId": "CASE-VIS-HBF-127",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 4 diere herwin/teruggevind. Gevind by koördinate: 26°54'30.8\"S 26°24'08.9\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.908556,
          "longitude": 26.402472
        },
        "timestamp": "2024-04-17T10:00:00Z"
      },
      {
        "id": "UPD-VIS-127-2",
        "caseId": "CASE-VIS-HBF-127",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 3 diere geslag. Slagplek koördinate: 26°54'40.1\"S 26°23'40.8\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.911139,
          "longitude": 26.394667
        },
        "timestamp": "2024-04-17T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-17T06:00:00Z",
    "updatedAt": "2024-04-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-128",
    "caseNumber": "VIS-HBF-2024-128",
    "title": "Veediefstal: 3 Cows - Onbekend (Witpoort)",
    "description": "KLAER / KONTAK: Onbekend. AREA / PLAAS: Witpoort. GESTEEL: 3 Cows. STATUS: 3 Herwin | 0 Vermis | 0 Geslag. Gevind Koördinate: 26°43'42.2\"S 26°35'52.9\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-128",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-16",
    "incidentTime": "02:00",
    "locationName": "Witpoort (Onbekend)",
    "sector": "Sektor Witpoort",
    "gpsLocation": {
      "latitude": -26.728389,
      "longitude": 26.598028
    },
    "reportedByUid": "USR-VIS-REC-128",
    "reportedByName": "Onbekend",
    "reportedByPhone": "",
    "victimName": "Onbekend",
    "victimPhone": "",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 3 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-128-1",
        "caseId": "CASE-VIS-HBF-128",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 3 diere herwin/teruggevind. Gevind by koördinate: 26°43'42.2\"S 26°35'52.9\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.728389,
          "longitude": 26.598028
        },
        "timestamp": "2024-04-16T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-16T06:00:00Z",
    "updatedAt": "2024-04-16T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-129",
    "caseNumber": "VIS-HBF-2024-129",
    "title": "Veediefstal: 2 Cows - Jan Bester (Palmietfontein)",
    "description": "KLAER / KONTAK: A. Bester. AREA / PLAAS: Palmietfontein. GESTEEL: 2 Cows. STATUS: 0 Herwin | 0 Vermis | 2 Geslag. Slagplek Koördinate: 26°45'02.1\"S 26°41'52.9\"E. Laaipunt Koördinate: 26°45'02.1\"S 26°41'52.9\"E. Bron: April Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-129",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-16",
    "incidentTime": "02:00",
    "locationName": "Palmietfontein (Jan Bester)",
    "sector": "Klerksdorp / Flamwood",
    "gpsLocation": {
      "latitude": -26.750583,
      "longitude": 26.698028
    },
    "reportedByUid": "USR-CLIENT-004",
    "reportedByName": "Jan Bester",
    "reportedByPhone": "+27 84 205 4610",
    "victimUid": "USR-CLIENT-004",
    "victimName": "Jan Bester",
    "victimPhone": "+27 84 205 4610",
    "victimFarmName": "Flamwood Walk",
    "personDescription": {
      "notes": "Gesteel: 2 Cows | Herwin: 0 | Vermis: 0 | Geslag: 2"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°45'02.1\"S 26°41'52.9\"E. Veldslagting toneel by: 26°45'02.1\"S 26°41'52.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-129-2",
        "caseId": "CASE-VIS-HBF-129",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 2 diere geslag. Slagplek koördinate: 26°45'02.1\"S 26°41'52.9\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.750583,
          "longitude": 26.698028
        },
        "timestamp": "2024-04-16T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-16T06:00:00Z",
    "updatedAt": "2024-04-16T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-130",
    "caseNumber": "VIS-HBF-2024-130",
    "title": "Veediefstal: 16 Cows 7 Calves - Rietvallei Eienaar (Rietvallei)",
    "description": "KLAER / KONTAK: Rietvallei Eienaar. AREA / PLAAS: Rietvallei. GESTEEL: 16 Cows 7 Calves. STATUS: 22 Herwin | 1 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'56.5\"S 26°08'25.7\"E. Gevind Koördinate: 26°42'54.2\"S 26°23'54.8\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-130",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-15",
    "incidentTime": "02:00",
    "locationName": "Rietvallei (Rietvallei Eienaar)",
    "sector": "Sektor Rietvallei",
    "gpsLocation": {
      "latitude": -26.832361,
      "longitude": 26.140472
    },
    "reportedByUid": "USR-VIS-REC-130",
    "reportedByName": "Rietvallei Eienaar",
    "reportedByPhone": "",
    "victimName": "Rietvallei Eienaar",
    "victimPhone": "",
    "victimFarmName": "Rietvallei",
    "personDescription": {
      "notes": "Gesteel: 16 Cows 7 Calves | Herwin: 22 | Vermis: 1 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-130-1",
        "caseId": "CASE-VIS-HBF-130",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 22 diere herwin/teruggevind. Gevind by koördinate: 26°42'54.2\"S 26°23'54.8\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.715056,
          "longitude": 26.398556
        },
        "timestamp": "2024-04-15T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-15T06:00:00Z",
    "updatedAt": "2024-04-15T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-131",
    "caseNumber": "VIS-HBF-2024-131",
    "title": "Veediefstal: 30 Sheep - Lemoenfontein Eienaar (Lemoenfontein)",
    "description": "KLAER / KONTAK: Lemoenfontein Eienaar. AREA / PLAAS: Lemoenfontein. GESTEEL: 30 Sheep. STATUS: 0 Herwin | 30 Vermis | 0 Geslag. Gesteel Koördinate: 26°37'32.5\"S 26°29'41.0\"E. Laaipunt Koördinate: 26°42'20.1\"S 26°24'06.9\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-131",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-15",
    "incidentTime": "02:00",
    "locationName": "Lemoenfontein (Lemoenfontein Eienaar)",
    "sector": "Sektor Lemoenfontein",
    "gpsLocation": {
      "latitude": -26.625694,
      "longitude": 26.494722
    },
    "reportedByUid": "USR-VIS-REC-131",
    "reportedByName": "Lemoenfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Lemoenfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Lemoenfontein",
    "personDescription": {
      "notes": "Gesteel: 30 Sheep | Herwin: 0 | Vermis: 30 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°42'20.1\"S 26°24'06.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-15T06:00:00Z",
    "updatedAt": "2024-04-15T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-132",
    "caseNumber": "VIS-HBF-2024-132",
    "title": "Veediefstal: 20 Cows - Witpoort Eienaar (Witpoort)",
    "description": "KLAER / KONTAK: Witpoort Eienaar. AREA / PLAAS: Witpoort. GESTEEL: 20 Cows. STATUS: 20 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'52.0\"S 26°34'12.8\"E. Gevind Koördinate: 26°46'20.8\"S 26°35'12.1\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-132",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-15",
    "incidentTime": "02:00",
    "locationName": "Witpoort (Witpoort Eienaar)",
    "sector": "Sektor Witpoort",
    "gpsLocation": {
      "latitude": -26.747778,
      "longitude": 26.570222
    },
    "reportedByUid": "USR-VIS-REC-132",
    "reportedByName": "Witpoort Eienaar",
    "reportedByPhone": "",
    "victimName": "Witpoort Eienaar",
    "victimPhone": "",
    "victimFarmName": "Witpoort",
    "personDescription": {
      "notes": "Gesteel: 20 Cows | Herwin: 20 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-132-1",
        "caseId": "CASE-VIS-HBF-132",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 20 diere herwin/teruggevind. Gevind by koördinate: 26°46'20.8\"S 26°35'12.1\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.772444,
          "longitude": 26.586694
        },
        "timestamp": "2024-04-15T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-15T06:00:00Z",
    "updatedAt": "2024-04-15T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-133",
    "caseNumber": "VIS-HBF-2024-133",
    "title": "Veediefstal: 12 Cows - Brakspruit Eienaar (Brakspruit)",
    "description": "KLAER / KONTAK: Brakspruit Eienaar. AREA / PLAAS: Brakspruit. GESTEEL: 12 Cows. STATUS: 12 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°39'59.7\"S 26°34'59.1\"E. Gevind Koördinate: 26°40'02.9\"S 26°35'49.3\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-133",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-15",
    "incidentTime": "02:00",
    "locationName": "Brakspruit (Brakspruit Eienaar)",
    "sector": "Sektor Brakspruit",
    "gpsLocation": {
      "latitude": -26.666583,
      "longitude": 26.583083
    },
    "reportedByUid": "USR-VIS-REC-133",
    "reportedByName": "Brakspruit Eienaar",
    "reportedByPhone": "",
    "victimName": "Brakspruit Eienaar",
    "victimPhone": "",
    "victimFarmName": "Brakspruit",
    "personDescription": {
      "notes": "Gesteel: 12 Cows | Herwin: 12 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-133-1",
        "caseId": "CASE-VIS-HBF-133",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 12 diere herwin/teruggevind. Gevind by koördinate: 26°40'02.9\"S 26°35'49.3\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.667472,
          "longitude": 26.597028
        },
        "timestamp": "2024-04-15T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-15T06:00:00Z",
    "updatedAt": "2024-04-15T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-134",
    "caseNumber": "VIS-HBF-2024-134",
    "title": "Veediefstal: 20 Pigs - Klippan Eienaar (Klippan)",
    "description": "KLAER / KONTAK: Klippan Eienaar. AREA / PLAAS: Klippan. GESTEEL: 20 Pigs. STATUS: 0 Herwin | 20 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'37.8\"S 26°11'41.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-134",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-14",
    "incidentTime": "02:00",
    "locationName": "Klippan (Klippan Eienaar)",
    "sector": "Sektor Klippan",
    "gpsLocation": {
      "latitude": -26.743833,
      "longitude": 26.194778
    },
    "reportedByUid": "USR-VIS-REC-134",
    "reportedByName": "Klippan Eienaar",
    "reportedByPhone": "",
    "victimName": "Klippan Eienaar",
    "victimPhone": "",
    "victimFarmName": "Klippan",
    "personDescription": {
      "notes": "Gesteel: 20 Pigs | Herwin: 0 | Vermis: 20 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-14T06:00:00Z",
    "updatedAt": "2024-04-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-135",
    "caseNumber": "VIS-HBF-2024-135",
    "title": "Veediefstal: 2 Cows - Onbekend (Unknown)",
    "description": "KLAER / KONTAK: Onbekend. AREA / PLAAS: Unknown. GESTEEL: 2 Cows. STATUS: 0 Herwin | 0 Vermis | 2 Geslag. Slagplek Koördinate: 26°51'35.7\"S 26°33'32.1\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-135",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-12",
    "incidentTime": "02:00",
    "locationName": "Unknown (Onbekend)",
    "sector": "Sektor Unknown",
    "gpsLocation": {
      "latitude": -26.859917,
      "longitude": 26.558917
    },
    "reportedByUid": "USR-VIS-REC-135",
    "reportedByName": "Onbekend",
    "reportedByPhone": "",
    "victimName": "Onbekend",
    "victimPhone": "",
    "victimFarmName": "Unknown",
    "personDescription": {
      "notes": "Gesteel: 2 Cows | Herwin: 0 | Vermis: 0 | Geslag: 2"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°51'35.7\"S 26°33'32.1\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-135-2",
        "caseId": "CASE-VIS-HBF-135",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 2 diere geslag. Slagplek koördinate: 26°51'35.7\"S 26°33'32.1\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.859917,
          "longitude": 26.558917
        },
        "timestamp": "2024-04-12T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-12T06:00:00Z",
    "updatedAt": "2024-04-12T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-136",
    "caseNumber": "VIS-HBF-2024-136",
    "title": "Veediefstal: 3 Cows - Arizona Eienaar (Arizona)",
    "description": "KLAER / KONTAK: Arizona Eienaar. AREA / PLAAS: Arizona. GESTEEL: 3 Cows. STATUS: 2 Herwin | 0 Vermis | 1 Geslag. Gesteel Koördinate: 26°40'47.0\"S 26°31'30.0\"E. Gevind Koördinate: 26°41'11.6\"S 26°32'19.5\"E. Slagplek Koördinate: 26°41'08.7\"S 26°32'33.7\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-136",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-09",
    "incidentTime": "02:00",
    "locationName": "Arizona (Arizona Eienaar)",
    "sector": "Sektor Arizona",
    "gpsLocation": {
      "latitude": -26.679722,
      "longitude": 26.525
    },
    "reportedByUid": "USR-VIS-REC-136",
    "reportedByName": "Arizona Eienaar",
    "reportedByPhone": "",
    "victimName": "Arizona Eienaar",
    "victimPhone": "",
    "victimFarmName": "Arizona",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 2 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°41'08.7\"S 26°32'33.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-136-1",
        "caseId": "CASE-VIS-HBF-136",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind. Gevind by koördinate: 26°41'11.6\"S 26°32'19.5\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.686556,
          "longitude": 26.53875
        },
        "timestamp": "2024-04-09T10:00:00Z"
      },
      {
        "id": "UPD-VIS-136-2",
        "caseId": "CASE-VIS-HBF-136",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag. Slagplek koördinate: 26°41'08.7\"S 26°32'33.7\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.68575,
          "longitude": 26.542694
        },
        "timestamp": "2024-04-09T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-09T06:00:00Z",
    "updatedAt": "2024-04-09T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-137",
    "caseNumber": "VIS-HBF-2024-137",
    "title": "Veediefstal: 10 Cows - Willie Lemmer Trust (Lemmerville)",
    "description": "KLAER / KONTAK: Lemmerville Eienaar. AREA / PLAAS: Lemmerville. GESTEEL: 10 Cows. STATUS: 2 Herwin | 8 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'52.7\"S 26°22'35.2\"E. Gevind Koördinate: 26°43'19.0\"S 26°22'35.8\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-137",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-04-03",
    "incidentTime": "02:00",
    "locationName": "Lemmerville (Willie Lemmer Trust)",
    "sector": "Sektor Lemmersville",
    "gpsLocation": {
      "latitude": -26.747972,
      "longitude": 26.376444
    },
    "reportedByUid": "USR-CLIENT-059",
    "reportedByName": "Willie Lemmer Trust",
    "reportedByPhone": "+27 71 687 0543",
    "victimUid": "USR-CLIENT-059",
    "victimName": "Willie Lemmer Trust",
    "victimPhone": "+27 71 687 0543",
    "victimFarmName": "Lemmersville",
    "personDescription": {
      "notes": "Gesteel: 10 Cows | Herwin: 2 | Vermis: 8 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-137-1",
        "caseId": "CASE-VIS-HBF-137",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind. Gevind by koördinate: 26°43'19.0\"S 26°22'35.8\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.721944,
          "longitude": 26.376611
        },
        "timestamp": "2024-04-03T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-04-03T06:00:00Z",
    "updatedAt": "2024-04-03T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-138",
    "caseNumber": "VIS-HBF-2024-138",
    "title": "Veediefstal: 48 Goats - Opraap Eienaar (Opraap Wes)",
    "description": "KLAER / KONTAK: Opraap Eienaar. AREA / PLAAS: Opraap Wes. GESTEEL: 48 Goats. STATUS: 0 Herwin | 48 Vermis | 0 Geslag. Gesteel Koördinate: 26°58'50.8\"S 26°21'51.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-138",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-03-26",
    "incidentTime": "02:00",
    "locationName": "Opraap Wes (Opraap Eienaar)",
    "sector": "Sektor Opraap Wes",
    "gpsLocation": {
      "latitude": -26.980778,
      "longitude": 26.364222
    },
    "reportedByUid": "USR-VIS-REC-138",
    "reportedByName": "Opraap Eienaar",
    "reportedByPhone": "",
    "victimName": "Opraap Eienaar",
    "victimPhone": "",
    "victimFarmName": "Opraap Wes",
    "personDescription": {
      "notes": "Gesteel: 48 Goats | Herwin: 0 | Vermis: 48 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-03-26T06:00:00Z",
    "updatedAt": "2024-03-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-139",
    "caseNumber": "VIS-HBF-2024-139",
    "title": "Veediefstal: 7 Cows - Syferlaagte Eienaar (Syferlaagte)",
    "description": "KLAER / KONTAK: Syferlaagte Eienaar. AREA / PLAAS: Syferlaagte. GESTEEL: 7 Cows. STATUS: 7 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°41'54.3\"S 26°22'22.6\"E. Gevind Koördinate: 26°42'19.6\"S 26°22'51.8\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-139",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-03-24",
    "incidentTime": "02:00",
    "locationName": "Syferlaagte (Syferlaagte Eienaar)",
    "sector": "Sektor Syferlaagte",
    "gpsLocation": {
      "latitude": -26.698417,
      "longitude": 26.372944
    },
    "reportedByUid": "USR-VIS-REC-139",
    "reportedByName": "Syferlaagte Eienaar",
    "reportedByPhone": "",
    "victimName": "Syferlaagte Eienaar",
    "victimPhone": "",
    "victimFarmName": "Syferlaagte",
    "personDescription": {
      "notes": "Gesteel: 7 Cows | Herwin: 7 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-139-1",
        "caseId": "CASE-VIS-HBF-139",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 7 diere herwin/teruggevind. Gevind by koördinate: 26°42'19.6\"S 26°22'51.8\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.705444,
          "longitude": 26.381056
        },
        "timestamp": "2024-03-24T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-03-24T06:00:00Z",
    "updatedAt": "2024-03-24T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-140",
    "caseNumber": "VIS-HBF-2024-140",
    "title": "Veediefstal: 19 Sheep - Platberg Eienaar (Platberg)",
    "description": "KLAER / KONTAK: Platberg Eienaar. AREA / PLAAS: Platberg. GESTEEL: 19 Sheep. STATUS: 0 Herwin | 19 Vermis | 0 Geslag. Gesteel Koördinate: 26°34'54.6\"S 26°38'52.9\"E. Laaipunt Koördinate: 26°37'40.6\"S 26°36'25.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-140",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-03-24",
    "incidentTime": "02:00",
    "locationName": "Platberg (Platberg Eienaar)",
    "sector": "Sektor Platberg",
    "gpsLocation": {
      "latitude": -26.581833,
      "longitude": 26.648028
    },
    "reportedByUid": "USR-VIS-REC-140",
    "reportedByName": "Platberg Eienaar",
    "reportedByPhone": "",
    "victimName": "Platberg Eienaar",
    "victimPhone": "",
    "victimFarmName": "Platberg",
    "personDescription": {
      "notes": "Gesteel: 19 Sheep | Herwin: 0 | Vermis: 19 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°37'40.6\"S 26°36'25.2\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-03-24T06:00:00Z",
    "updatedAt": "2024-03-24T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-141",
    "caseNumber": "VIS-HBF-2024-141",
    "title": "Veediefstal: 2 Cows - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 2 Cows. STATUS: 0 Herwin | 0 Vermis | 2 Geslag. Gesteel Koördinate: 26°52'03.9\"S 26°29'21.6\"E. Slagplek Koördinate: 26°51'35.7\"S 26°33'31.9\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-141",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-03-19",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.86775,
      "longitude": 26.489333
    },
    "reportedByUid": "USR-VIS-REC-141",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 2 Cows | Herwin: 0 | Vermis: 0 | Geslag: 2"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°51'35.7\"S 26°33'31.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-141-2",
        "caseId": "CASE-VIS-HBF-141",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 2 diere geslag. Slagplek koördinate: 26°51'35.7\"S 26°33'31.9\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.859917,
          "longitude": 26.558861
        },
        "timestamp": "2024-03-19T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-03-19T06:00:00Z",
    "updatedAt": "2024-03-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-142",
    "caseNumber": "VIS-HBF-2024-142",
    "title": "Veediefstal: 97 Chickens - Oorbietjiesfontein Eienaar (Oorbietjiesfontein)",
    "description": "KLAER / KONTAK: Oorbietjiesfontein Eienaar. AREA / PLAAS: Oorbietjiesfontein. GESTEEL: 97 Chickens. STATUS: 97 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'00.8\"S 26°21'57.7\"E. Gevind Koördinate: 26°50'23.6\"S 26°22'31.2\"E. Laaipunt Koördinate: 26°49'50.6\"S 26°22'32.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-142",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-03-18",
    "incidentTime": "02:00",
    "locationName": "Oorbietjiesfontein (Oorbietjiesfontein Eienaar)",
    "sector": "Sektor Oorbietjiesfontein",
    "gpsLocation": {
      "latitude": -26.816889,
      "longitude": 26.366028
    },
    "reportedByUid": "USR-VIS-REC-142",
    "reportedByName": "Oorbietjiesfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Oorbietjiesfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Oorbietjiesfontein",
    "personDescription": {
      "notes": "Gesteel: 97 Chickens | Herwin: 97 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°49'50.6\"S 26°22'32.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-142-1",
        "caseId": "CASE-VIS-HBF-142",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 97 diere herwin/teruggevind. Gevind by koördinate: 26°50'23.6\"S 26°22'31.2\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.839889,
          "longitude": 26.375333
        },
        "timestamp": "2024-03-18T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-03-18T06:00:00Z",
    "updatedAt": "2024-03-18T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-143",
    "caseNumber": "VIS-HBF-2024-143",
    "title": "Veediefstal: 1 Sheep - Syferlaagte Eienaar (Syferlaagte)",
    "description": "KLAER / KONTAK: Syferlaagte Eienaar. AREA / PLAAS: Syferlaagte. GESTEEL: 1 Sheep. STATUS: 0 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°41'50.4\"S 26°20'49.4\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-143",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-03-16",
    "incidentTime": "02:00",
    "locationName": "Syferlaagte (Syferlaagte Eienaar)",
    "sector": "Sektor Syferlaagte",
    "gpsLocation": {
      "latitude": -26.697333,
      "longitude": 26.347056
    },
    "reportedByUid": "USR-VIS-REC-143",
    "reportedByName": "Syferlaagte Eienaar",
    "reportedByPhone": "",
    "victimName": "Syferlaagte Eienaar",
    "victimPhone": "",
    "victimFarmName": "Syferlaagte",
    "personDescription": {
      "notes": "Gesteel: 1 Sheep | Herwin: 0 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-03-16T06:00:00Z",
    "updatedAt": "2024-03-16T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-144",
    "caseNumber": "VIS-HBF-2024-144",
    "title": "Veediefstal: 7 Cows 2 Calves - Rhenosterspruit Eienaar (Rhenosterspruit)",
    "description": "KLAER / KONTAK: Rhenosterspruit Eienaar. AREA / PLAAS: Rhenosterspruit. GESTEEL: 7 Cows 2 Calves. STATUS: 0 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°56'55.6\"S 26°22'03.6\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-144",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-03-14",
    "incidentTime": "02:00",
    "locationName": "Rhenosterspruit (Rhenosterspruit Eienaar)",
    "sector": "Sektor Rhenosterspruit",
    "gpsLocation": {
      "latitude": -26.948778,
      "longitude": 26.367667
    },
    "reportedByUid": "USR-VIS-REC-144",
    "reportedByName": "Rhenosterspruit Eienaar",
    "reportedByPhone": "",
    "victimName": "Rhenosterspruit Eienaar",
    "victimPhone": "",
    "victimFarmName": "Rhenosterspruit",
    "personDescription": {
      "notes": "Gesteel: 7 Cows 2 Calves | Herwin: 0 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-03-14T06:00:00Z",
    "updatedAt": "2024-03-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-145",
    "caseNumber": "VIS-HBF-2024-145",
    "title": "Veediefstal: 8 Cows - Vlaklaagte Eienaar (Vlaklaagte)",
    "description": "KLAER / KONTAK: Vlaklaagte Eienaar. AREA / PLAAS: Vlaklaagte. GESTEEL: 8 Cows. STATUS: 0 Herwin | 8 Vermis | 0 Geslag. Gesteel Koördinate: 26°40'47.0\"S 26°31'30.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-145",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-03-06",
    "incidentTime": "02:00",
    "locationName": "Vlaklaagte (Vlaklaagte Eienaar)",
    "sector": "Sektor Vlaklaagte",
    "gpsLocation": {
      "latitude": -26.679722,
      "longitude": 26.525
    },
    "reportedByUid": "USR-VIS-REC-145",
    "reportedByName": "Vlaklaagte Eienaar",
    "reportedByPhone": "",
    "victimName": "Vlaklaagte Eienaar",
    "victimPhone": "",
    "victimFarmName": "Vlaklaagte",
    "personDescription": {
      "notes": "Gesteel: 8 Cows | Herwin: 0 | Vermis: 8 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-03-06T06:00:00Z",
    "updatedAt": "2024-03-06T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-146",
    "caseNumber": "VIS-HBF-2024-146",
    "title": "Veediefstal: 7 Pigs - Doornpoort Eienaar (Doornpoort)",
    "description": "KLAER / KONTAK: Doornpoort Eienaar. AREA / PLAAS: Doornpoort. GESTEEL: 7 Pigs. STATUS: 0 Herwin | 7 Vermis | 0 Geslag. Gesteel Koördinate: 26°37'40.5\"S 26°37'48.8\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-146",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-02-28",
    "incidentTime": "02:00",
    "locationName": "Doornpoort (Doornpoort Eienaar)",
    "sector": "Sektor Doornpoort",
    "gpsLocation": {
      "latitude": -26.627917,
      "longitude": 26.630222
    },
    "reportedByUid": "USR-VIS-REC-146",
    "reportedByName": "Doornpoort Eienaar",
    "reportedByPhone": "",
    "victimName": "Doornpoort Eienaar",
    "victimPhone": "",
    "victimFarmName": "Doornpoort",
    "personDescription": {
      "notes": "Gesteel: 7 Pigs | Herwin: 0 | Vermis: 7 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-02-28T06:00:00Z",
    "updatedAt": "2024-02-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-147",
    "caseNumber": "VIS-HBF-2024-147",
    "title": "Veediefstal: 7 Cows - Graceland Eienaar (Graceland)",
    "description": "KLAER / KONTAK: Graceland Eienaar. AREA / PLAAS: Graceland. GESTEEL: 7 Cows. STATUS: 0 Herwin | 7 Vermis | 0 Geslag. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-147",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-02-24",
    "incidentTime": "02:00",
    "locationName": "Graceland (Graceland Eienaar)",
    "sector": "Sektor Graceland",
    "reportedByUid": "USR-VIS-REC-147",
    "reportedByName": "Graceland Eienaar",
    "reportedByPhone": "",
    "victimName": "Graceland Eienaar",
    "victimPhone": "",
    "victimFarmName": "Graceland",
    "personDescription": {
      "notes": "Gesteel: 7 Cows | Herwin: 0 | Vermis: 7 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-02-24T06:00:00Z",
    "updatedAt": "2024-02-24T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-148",
    "caseNumber": "VIS-HBF-2024-148",
    "title": "Veediefstal: 3 Cows - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 3 Cows. STATUS: 1 Herwin | 0 Vermis | 2 Geslag. Gesteel Koördinate: 26°52'03.9\"S 26°29'21.6\"E. Gevind Koördinate: 26°51'32.2\"S 26°33'25.1\"E. Slagplek Koördinate: 26°51'35.7\"S 26°33'31.9\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-148",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-02-22",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.86775,
      "longitude": 26.489333
    },
    "reportedByUid": "USR-VIS-REC-148",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 1 | Vermis: 0 | Geslag: 2"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°51'35.7\"S 26°33'31.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-148-1",
        "caseId": "CASE-VIS-HBF-148",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind. Gevind by koördinate: 26°51'32.2\"S 26°33'25.1\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.858944,
          "longitude": 26.556972
        },
        "timestamp": "2024-02-22T10:00:00Z"
      },
      {
        "id": "UPD-VIS-148-2",
        "caseId": "CASE-VIS-HBF-148",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 2 diere geslag. Slagplek koördinate: 26°51'35.7\"S 26°33'31.9\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.859917,
          "longitude": 26.558861
        },
        "timestamp": "2024-02-22T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-02-22T06:00:00Z",
    "updatedAt": "2024-02-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-149",
    "caseNumber": "VIS-HBF-2024-149",
    "title": "Veediefstal: 4 Cows - Hartbeesfontein Eienaar (Hartbeesfontein)",
    "description": "KLAER / KONTAK: Hartbeesfontein Eienaar. AREA / PLAAS: Hartbeesfontein. GESTEEL: 4 Cows. STATUS: 0 Herwin | 0 Vermis | 4 Geslag. Gesteel Koördinate: 26°45'42.7\"S 26°24'26.3\"E. Slagplek Koördinate: 26°43'09.2\"S 26°23'08.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-149",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-02-21",
    "incidentTime": "02:00",
    "locationName": "Hartbeesfontein (Hartbeesfontein Eienaar)",
    "sector": "Sektor Hartbeesfontein",
    "gpsLocation": {
      "latitude": -26.761861,
      "longitude": 26.407306
    },
    "reportedByUid": "USR-VIS-REC-149",
    "reportedByName": "Hartbeesfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Hartbeesfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Hartbeesfontein",
    "personDescription": {
      "notes": "Gesteel: 4 Cows | Herwin: 0 | Vermis: 0 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°43'09.2\"S 26°23'08.2\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-149-2",
        "caseId": "CASE-VIS-HBF-149",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag. Slagplek koördinate: 26°43'09.2\"S 26°23'08.2\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.719222,
          "longitude": 26.385611
        },
        "timestamp": "2024-02-21T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-02-21T06:00:00Z",
    "updatedAt": "2024-02-21T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-150",
    "caseNumber": "VIS-HBF-2024-150",
    "title": "Veediefstal: 17 Sheep - Hartbeesfontein Eienaar (Hartbeesfontein)",
    "description": "KLAER / KONTAK: Hartbeesfontein Eienaar. AREA / PLAAS: Hartbeesfontein. GESTEEL: 17 Sheep. STATUS: 17 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°46'02.3\"S 26°24'50.9\"E. Gevind Koördinate: 26°45'43.2\"S 26°24'24.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-150",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-02-19",
    "incidentTime": "02:00",
    "locationName": "Hartbeesfontein (Hartbeesfontein Eienaar)",
    "sector": "Sektor Hartbeesfontein",
    "gpsLocation": {
      "latitude": -26.767306,
      "longitude": 26.414139
    },
    "reportedByUid": "USR-VIS-REC-150",
    "reportedByName": "Hartbeesfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Hartbeesfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Hartbeesfontein",
    "personDescription": {
      "notes": "Gesteel: 17 Sheep | Herwin: 17 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-150-1",
        "caseId": "CASE-VIS-HBF-150",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 17 diere herwin/teruggevind. Gevind by koördinate: 26°45'43.2\"S 26°24'24.0\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.762,
          "longitude": 26.406667
        },
        "timestamp": "2024-02-19T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-02-19T06:00:00Z",
    "updatedAt": "2024-02-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-151",
    "caseNumber": "VIS-HBF-2024-151",
    "title": "Veediefstal: 1 Cow - Onbekend (Unknown)",
    "description": "KLAER / KONTAK: Onbekend. AREA / PLAAS: Unknown. GESTEEL: 1 Cow. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Slagplek Koördinate: 26°43'09.5\"S 26°23'05.9\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-151",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-02-17",
    "incidentTime": "02:00",
    "locationName": "Unknown (Onbekend)",
    "sector": "Sektor Unknown",
    "gpsLocation": {
      "latitude": -26.719306,
      "longitude": 26.384972
    },
    "reportedByUid": "USR-VIS-REC-151",
    "reportedByName": "Onbekend",
    "reportedByPhone": "",
    "victimName": "Onbekend",
    "victimPhone": "",
    "victimFarmName": "Unknown",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°43'09.5\"S 26°23'05.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-151-2",
        "caseId": "CASE-VIS-HBF-151",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag. Slagplek koördinate: 26°43'09.5\"S 26°23'05.9\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.719306,
          "longitude": 26.384972
        },
        "timestamp": "2024-02-17T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-02-17T06:00:00Z",
    "updatedAt": "2024-02-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-152",
    "caseNumber": "VIS-HBF-2024-152",
    "title": "Veediefstal: 1 Cow - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 1 Cow. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Slagplek Koördinate: 26°52'08.5\"S 26°31'56.7\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-152",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-02-13",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.869028,
      "longitude": 26.532417
    },
    "reportedByUid": "USR-VIS-REC-152",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°52'08.5\"S 26°31'56.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-152-2",
        "caseId": "CASE-VIS-HBF-152",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag. Slagplek koördinate: 26°52'08.5\"S 26°31'56.7\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.869028,
          "longitude": 26.532417
        },
        "timestamp": "2024-02-13T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-02-13T06:00:00Z",
    "updatedAt": "2024-02-13T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-153",
    "caseNumber": "VIS-HBF-2024-153",
    "title": "Veediefstal: 40 Sheep - Platberg Eienaar (Platberg)",
    "description": "KLAER / KONTAK: Platberg Eienaar. AREA / PLAAS: Platberg. GESTEEL: 40 Sheep. STATUS: 0 Herwin | 40 Vermis | 0 Geslag. Gesteel Koördinate: 26°40'42.3\"S 26°39'13.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-153",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-01-30",
    "incidentTime": "02:00",
    "locationName": "Platberg (Platberg Eienaar)",
    "sector": "Sektor Platberg",
    "gpsLocation": {
      "latitude": -26.678417,
      "longitude": 26.653667
    },
    "reportedByUid": "USR-VIS-REC-153",
    "reportedByName": "Platberg Eienaar",
    "reportedByPhone": "",
    "victimName": "Platberg Eienaar",
    "victimPhone": "",
    "victimFarmName": "Platberg",
    "personDescription": {
      "notes": "Gesteel: 40 Sheep | Herwin: 0 | Vermis: 40 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-01-30T06:00:00Z",
    "updatedAt": "2024-01-30T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-154",
    "caseNumber": "VIS-HBF-2024-154",
    "title": "Veediefstal: 6 Cows - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 6 Cows. STATUS: 3 Herwin | 0 Vermis | 3 Geslag. Gesteel Koördinate: 26°52'06.3\"S 26°28'03.0\"E. Gevind Koördinate: 26°52'48.5\"S 26°33'04.0\"E. Slagplek Koördinate: 26°52'48.5\"S 26°33'04.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-154",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-01-27",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.868417,
      "longitude": 26.4675
    },
    "reportedByUid": "USR-VIS-REC-154",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 3 | Vermis: 0 | Geslag: 3"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°52'48.5\"S 26°33'04.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-154-1",
        "caseId": "CASE-VIS-HBF-154",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 3 diere herwin/teruggevind. Gevind by koördinate: 26°52'48.5\"S 26°33'04.0\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.880139,
          "longitude": 26.551111
        },
        "timestamp": "2024-01-27T10:00:00Z"
      },
      {
        "id": "UPD-VIS-154-2",
        "caseId": "CASE-VIS-HBF-154",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 3 diere geslag. Slagplek koördinate: 26°52'48.5\"S 26°33'04.0\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.880139,
          "longitude": 26.551111
        },
        "timestamp": "2024-01-27T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-01-27T06:00:00Z",
    "updatedAt": "2024-01-27T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-155",
    "caseNumber": "VIS-HBF-2024-155",
    "title": "Veediefstal: 6 Cows - KLD Plotte Eienaar (KLD Plotte)",
    "description": "KLAER / KONTAK: KLD Plotte Eienaar. AREA / PLAAS: KLD Plotte. GESTEEL: 6 Cows. STATUS: 0 Herwin | 6 Vermis | 0 Geslag. Gesteel Koördinate: 26°49'51.7\"S 26°35'01.3\"E. Laaipunt Koördinate: 26°51'28.8\"S 26°35'34.7\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-155",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-01-25",
    "incidentTime": "02:00",
    "locationName": "KLD Plotte (KLD Plotte Eienaar)",
    "sector": "Sektor KLD Plotte",
    "gpsLocation": {
      "latitude": -26.831028,
      "longitude": 26.583694
    },
    "reportedByUid": "USR-VIS-REC-155",
    "reportedByName": "KLD Plotte Eienaar",
    "reportedByPhone": "",
    "victimName": "KLD Plotte Eienaar",
    "victimPhone": "",
    "victimFarmName": "KLD Plotte",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 0 | Vermis: 6 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°51'28.8\"S 26°35'34.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-01-25T06:00:00Z",
    "updatedAt": "2024-01-25T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-156",
    "caseNumber": "VIS-HBF-2024-156",
    "title": "Veediefstal: 7 Cows 10 Calves - Rhenosterspruit Eienaar (Rhenosterspruit)",
    "description": "KLAER / KONTAK: Rhenosterspruit Eienaar. AREA / PLAAS: Rhenosterspruit. GESTEEL: 7 Cows 10 Calves. STATUS: 0 Herwin | 17 Vermis | 0 Geslag. Gesteel Koördinate: 26°56'55.6\"S 26°22'03.6\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-156",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-01-22",
    "incidentTime": "02:00",
    "locationName": "Rhenosterspruit (Rhenosterspruit Eienaar)",
    "sector": "Sektor Rhenosterspruit",
    "gpsLocation": {
      "latitude": -26.948778,
      "longitude": 26.367667
    },
    "reportedByUid": "USR-VIS-REC-156",
    "reportedByName": "Rhenosterspruit Eienaar",
    "reportedByPhone": "",
    "victimName": "Rhenosterspruit Eienaar",
    "victimPhone": "",
    "victimFarmName": "Rhenosterspruit",
    "personDescription": {
      "notes": "Gesteel: 7 Cows 10 Calves | Herwin: 0 | Vermis: 17 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-01-22T06:00:00Z",
    "updatedAt": "2024-01-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-157",
    "caseNumber": "VIS-HBF-2024-157",
    "title": "Veediefstal: 1 Cow - Opraap Eienaar (Opraap Wes)",
    "description": "KLAER / KONTAK: Opraap Eienaar. AREA / PLAAS: Opraap Wes. GESTEEL: 1 Cow. STATUS: 1 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°57'32.9\"S 26°25'28.5\"E. Gevind Koördinate: 26°58'27.9\"S 26°24'20.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-157",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-01-22",
    "incidentTime": "02:00",
    "locationName": "Opraap Wes (Opraap Eienaar)",
    "sector": "Sektor Opraap Wes",
    "gpsLocation": {
      "latitude": -26.959139,
      "longitude": 26.424583
    },
    "reportedByUid": "USR-VIS-REC-157",
    "reportedByName": "Opraap Eienaar",
    "reportedByPhone": "",
    "victimName": "Opraap Eienaar",
    "victimPhone": "",
    "victimFarmName": "Opraap Wes",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 1 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-157-1",
        "caseId": "CASE-VIS-HBF-157",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind. Gevind by koördinate: 26°58'27.9\"S 26°24'20.0\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.974417,
          "longitude": 26.405556
        },
        "timestamp": "2024-01-22T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-01-22T06:00:00Z",
    "updatedAt": "2024-01-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-158",
    "caseNumber": "VIS-HBF-2024-158",
    "title": "Veediefstal: 17 Cows - Vlaklaagte Eienaar (Vlaklaagte)",
    "description": "KLAER / KONTAK: Vlaklaagte Eienaar. AREA / PLAAS: Vlaklaagte. GESTEEL: 17 Cows. STATUS: 12 Herwin | 5 Vermis | 0 Geslag. Gesteel Koördinate: 26°42'03.2\"S 26°33'13.3\"E. Gevind Koördinate: 26°48'51.4\"S 26°30'31.9\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-158",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-01-19",
    "incidentTime": "02:00",
    "locationName": "Vlaklaagte (Vlaklaagte Eienaar)",
    "sector": "Sektor Vlaklaagte",
    "gpsLocation": {
      "latitude": -26.700889,
      "longitude": 26.553694
    },
    "reportedByUid": "USR-VIS-REC-158",
    "reportedByName": "Vlaklaagte Eienaar",
    "reportedByPhone": "",
    "victimName": "Vlaklaagte Eienaar",
    "victimPhone": "",
    "victimFarmName": "Vlaklaagte",
    "personDescription": {
      "notes": "Gesteel: 17 Cows | Herwin: 12 | Vermis: 5 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-158-1",
        "caseId": "CASE-VIS-HBF-158",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 12 diere herwin/teruggevind. Gevind by koördinate: 26°48'51.4\"S 26°30'31.9\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.814278,
          "longitude": 26.508861
        },
        "timestamp": "2024-01-19T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-01-19T06:00:00Z",
    "updatedAt": "2024-01-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-159",
    "caseNumber": "VIS-HBF-2024-159",
    "title": "Veediefstal: 27 Calves - Rietkuil Eienaar (Rietkuil)",
    "description": "KLAER / KONTAK: Rietkuil Eienaar. AREA / PLAAS: Rietkuil. GESTEEL: 27 Calves. STATUS: 15 Herwin | 12 Vermis | 0 Geslag. Gesteel Koördinate: 26°48'27.2\"S 26°32'31.0\"E. Gevind Koördinate: 26°48'27.0\"S 26°31'44.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-159",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2024-01-19",
    "incidentTime": "02:00",
    "locationName": "Rietkuil (Rietkuil Eienaar)",
    "sector": "Sektor Rietkuil",
    "gpsLocation": {
      "latitude": -26.807556,
      "longitude": 26.541944
    },
    "reportedByUid": "USR-VIS-REC-159",
    "reportedByName": "Rietkuil Eienaar",
    "reportedByPhone": "",
    "victimName": "Rietkuil Eienaar",
    "victimPhone": "",
    "victimFarmName": "Rietkuil",
    "personDescription": {
      "notes": "Gesteel: 27 Calves | Herwin: 15 | Vermis: 12 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-159-1",
        "caseId": "CASE-VIS-HBF-159",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 15 diere herwin/teruggevind. Gevind by koördinate: 26°48'27.0\"S 26°31'44.2\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.8075,
          "longitude": 26.528944
        },
        "timestamp": "2024-01-19T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2024-01-19T06:00:00Z",
    "updatedAt": "2024-01-19T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-160",
    "caseNumber": "VIS-HBF-2023-160",
    "title": "Veediefstal: 5 Cows - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 5 Cows. STATUS: 1 Herwin | 0 Vermis | 4 Geslag. Gesteel Koördinate: 26°52'03.9\"S 26°29'21.6\"E. Slagplek Koördinate: 26°50'56.9\"S 26°33'57.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-160",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-12-28",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.86775,
      "longitude": 26.489333
    },
    "reportedByUid": "USR-VIS-REC-160",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 5 Cows | Herwin: 1 | Vermis: 0 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°50'56.9\"S 26°33'57.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-160-1",
        "caseId": "CASE-VIS-HBF-160",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2023-12-28T10:00:00Z"
      },
      {
        "id": "UPD-VIS-160-2",
        "caseId": "CASE-VIS-HBF-160",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag. Slagplek koördinate: 26°50'56.9\"S 26°33'57.0\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.849139,
          "longitude": 26.565833
        },
        "timestamp": "2023-12-28T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-12-28T06:00:00Z",
    "updatedAt": "2023-12-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-161",
    "caseNumber": "VIS-HBF-2023-161",
    "title": "Veediefstal: 53 Sheep - KLD Plotte Eienaar (KLD Plotte)",
    "description": "KLAER / KONTAK: KLD Plotte Eienaar. AREA / PLAAS: KLD Plotte. GESTEEL: 53 Sheep. STATUS: 0 Herwin | 53 Vermis | 0 Geslag. Gesteel Koördinate: 26°50'04.5\"S 26°34'37.9\"E. Laaipunt Koördinate: 26°51'46.7\"S 26°33'46.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "closed",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-161",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-12-28",
    "incidentTime": "02:00",
    "locationName": "KLD Plotte (KLD Plotte Eienaar)",
    "sector": "Sektor KLD Plotte",
    "gpsLocation": {
      "latitude": -26.834583,
      "longitude": 26.577194
    },
    "reportedByUid": "USR-VIS-REC-161",
    "reportedByName": "KLD Plotte Eienaar",
    "reportedByPhone": "",
    "victimName": "KLD Plotte Eienaar",
    "victimPhone": "",
    "victimFarmName": "KLD Plotte",
    "personDescription": {
      "notes": "Gesteel: 53 Sheep | Herwin: 0 | Vermis: 53 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°51'46.7\"S 26°33'46.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-12-28T06:00:00Z",
    "updatedAt": "2023-12-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-162",
    "caseNumber": "VIS-HBF-2023-162",
    "title": "Veediefstal: 17 Sheep - KLD Plotte Eienaar (KLD Plotte)",
    "description": "KLAER / KONTAK: KLD Plotte Eienaar. AREA / PLAAS: KLD Plotte. GESTEEL: 17 Sheep. STATUS: 0 Herwin | 17 Vermis | 0 Geslag. Gesteel Koördinate: 26°50'04.5\"S 26°35'08.2\"E. Laaipunt Koördinate: 26°51'46.7\"S 26°33'46.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "closed",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-162",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-12-26",
    "incidentTime": "02:00",
    "locationName": "KLD Plotte (KLD Plotte Eienaar)",
    "sector": "Sektor KLD Plotte",
    "gpsLocation": {
      "latitude": -26.834583,
      "longitude": 26.585611
    },
    "reportedByUid": "USR-VIS-REC-162",
    "reportedByName": "KLD Plotte Eienaar",
    "reportedByPhone": "",
    "victimName": "KLD Plotte Eienaar",
    "victimPhone": "",
    "victimFarmName": "KLD Plotte",
    "personDescription": {
      "notes": "Gesteel: 17 Sheep | Herwin: 0 | Vermis: 17 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°51'46.7\"S 26°33'46.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-12-26T06:00:00Z",
    "updatedAt": "2023-12-26T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-163",
    "caseNumber": "VIS-HBF-2023-163",
    "title": "Veediefstal: 4 Sheep - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 4 Sheep. STATUS: 4 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'43.2\"S 26°28'40.1\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-163",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-12-22",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.862,
      "longitude": 26.477806
    },
    "reportedByUid": "USR-VIS-REC-163",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 4 Sheep | Herwin: 4 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-163-1",
        "caseId": "CASE-VIS-HBF-163",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 4 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2023-12-22T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-12-22T06:00:00Z",
    "updatedAt": "2023-12-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-164",
    "caseNumber": "VIS-HBF-2023-164",
    "title": "Veediefstal: 7 Cows - Schoemansfontein Eienaar (Schoemansfontein)",
    "description": "KLAER / KONTAK: Schoemansfontein Eienaar. AREA / PLAAS: Schoemansfontein. GESTEEL: 7 Cows. STATUS: 1 Herwin | 1 Vermis | 5 Geslag. Gesteel Koördinate: 26°45'07.2\"S 26°30'43.1\"E. Gevind Koördinate: 26°50'46.4\"S 26°32'31.5\"E. Slagplek Koördinate: 26°49'17.1\"S 26°32'13.9\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "investigating",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-164",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-12-20",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Schoemansfontein Eienaar)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.752,
      "longitude": 26.511972
    },
    "reportedByUid": "USR-VIS-REC-164",
    "reportedByName": "Schoemansfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Schoemansfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 7 Cows | Herwin: 1 | Vermis: 1 | Geslag: 5"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°49'17.1\"S 26°32'13.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-164-1",
        "caseId": "CASE-VIS-HBF-164",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 1 diere herwin/teruggevind. Gevind by koördinate: 26°50'46.4\"S 26°32'31.5\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.846222,
          "longitude": 26.542083
        },
        "timestamp": "2023-12-20T10:00:00Z"
      },
      {
        "id": "UPD-VIS-164-2",
        "caseId": "CASE-VIS-HBF-164",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 5 diere geslag. Slagplek koördinate: 26°49'17.1\"S 26°32'13.9\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.821417,
          "longitude": 26.537194
        },
        "timestamp": "2023-12-20T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-12-20T06:00:00Z",
    "updatedAt": "2023-12-20T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-165",
    "caseNumber": "VIS-HBF-2023-165",
    "title": "Veediefstal: 6 Cows - Rhenosterhoek Eienaar (Rhenosterhoek)",
    "description": "KLAER / KONTAK: Rhenosterhoek Eienaar. AREA / PLAAS: Rhenosterhoek. GESTEEL: 6 Cows. STATUS: 2 Herwin | 0 Vermis | 4 Geslag. Gesteel Koördinate: 26°51'44.7\"S 26°28'11.3\"E. Gevind Koördinate: 26°51'43.7\"S 26°33'48.0\"E. Slagplek Koördinate: 26°51'43.0\"S 26°33'48.9\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-165",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-12-14",
    "incidentTime": "02:00",
    "locationName": "Rhenosterhoek (Rhenosterhoek Eienaar)",
    "sector": "Sektor Rhenosterhoek",
    "gpsLocation": {
      "latitude": -26.862417,
      "longitude": 26.469806
    },
    "reportedByUid": "USR-VIS-REC-165",
    "reportedByName": "Rhenosterhoek Eienaar",
    "reportedByPhone": "",
    "victimName": "Rhenosterhoek Eienaar",
    "victimPhone": "",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 2 | Vermis: 0 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°51'43.0\"S 26°33'48.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-165-1",
        "caseId": "CASE-VIS-HBF-165",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 2 diere herwin/teruggevind. Gevind by koördinate: 26°51'43.7\"S 26°33'48.0\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.862139,
          "longitude": 26.563333
        },
        "timestamp": "2023-12-14T10:00:00Z"
      },
      {
        "id": "UPD-VIS-165-2",
        "caseId": "CASE-VIS-HBF-165",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag. Slagplek koördinate: 26°51'43.0\"S 26°33'48.9\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.861944,
          "longitude": 26.563583
        },
        "timestamp": "2023-12-14T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-12-14T06:00:00Z",
    "updatedAt": "2023-12-14T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-166",
    "caseNumber": "VIS-HBF-2023-166",
    "title": "Veediefstal: 12 Cows - Schoemansfontein Eienaar (Schoemansfontein)",
    "description": "KLAER / KONTAK: Schoemansfontein Eienaar. AREA / PLAAS: Schoemansfontein. GESTEEL: 12 Cows. STATUS: 7 Herwin | 0 Vermis | 5 Geslag. Gesteel Koördinate: 26°45'07.2\"S 26°30'43.1\"E. Gevind Koördinate: 26°48'42.7\"S 26°31'59.0\"E. Slagplek Koördinate: 26°49'17.1\"S 26°32'13.9\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-166",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-11-24",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Schoemansfontein Eienaar)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.752,
      "longitude": 26.511972
    },
    "reportedByUid": "USR-VIS-REC-166",
    "reportedByName": "Schoemansfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Schoemansfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 12 Cows | Herwin: 7 | Vermis: 0 | Geslag: 5"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°49'17.1\"S 26°32'13.9\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-166-1",
        "caseId": "CASE-VIS-HBF-166",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 7 diere herwin/teruggevind. Gevind by koördinate: 26°48'42.7\"S 26°31'59.0\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.811861,
          "longitude": 26.533056
        },
        "timestamp": "2023-11-24T10:00:00Z"
      },
      {
        "id": "UPD-VIS-166-2",
        "caseId": "CASE-VIS-HBF-166",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 5 diere geslag. Slagplek koördinate: 26°49'17.1\"S 26°32'13.9\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.821417,
          "longitude": 26.537194
        },
        "timestamp": "2023-11-24T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-11-24T06:00:00Z",
    "updatedAt": "2023-11-24T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-167",
    "caseNumber": "VIS-HBF-2023-167",
    "title": "Veediefstal: 7 Cows - KLD Plotte Eienaar (KLD Plotte)",
    "description": "KLAER / KONTAK: KLD Plotte Eienaar. AREA / PLAAS: KLD Plotte. GESTEEL: 7 Cows. STATUS: 5 Herwin | 0 Vermis | 2 Geslag. Gesteel Koördinate: 26°50'21.9\"S 26°35'10.9\"E. Gevind Koördinate: 26°51'51.4\"S 26°34'34.1\"E. Slagplek Koördinate: 26°51'51.0\"S 26°34'34.8\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-167",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-11-22",
    "incidentTime": "02:00",
    "locationName": "KLD Plotte (KLD Plotte Eienaar)",
    "sector": "Sektor KLD Plotte",
    "gpsLocation": {
      "latitude": -26.839417,
      "longitude": 26.586361
    },
    "reportedByUid": "USR-VIS-REC-167",
    "reportedByName": "KLD Plotte Eienaar",
    "reportedByPhone": "",
    "victimName": "KLD Plotte Eienaar",
    "victimPhone": "",
    "victimFarmName": "KLD Plotte",
    "personDescription": {
      "notes": "Gesteel: 7 Cows | Herwin: 5 | Vermis: 0 | Geslag: 2"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°51'51.0\"S 26°34'34.8\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-167-1",
        "caseId": "CASE-VIS-HBF-167",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 5 diere herwin/teruggevind. Gevind by koördinate: 26°51'51.4\"S 26°34'34.1\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.864278,
          "longitude": 26.576139
        },
        "timestamp": "2023-11-22T10:00:00Z"
      },
      {
        "id": "UPD-VIS-167-2",
        "caseId": "CASE-VIS-HBF-167",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 2 diere geslag. Slagplek koördinate: 26°51'51.0\"S 26°34'34.8\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.864167,
          "longitude": 26.576333
        },
        "timestamp": "2023-11-22T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-11-22T06:00:00Z",
    "updatedAt": "2023-11-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-168",
    "caseNumber": "VIS-HBF-2023-168",
    "title": "Veediefstal: 1 Cow - Schoemansfontein Eienaar (Schoemansfontein)",
    "description": "KLAER / KONTAK: Schoemansfontein Eienaar. AREA / PLAAS: Schoemansfontein. GESTEEL: 1 Cow. STATUS: 0 Herwin | 0 Vermis | 1 Geslag. Gesteel Koördinate: 26°44'42.3\"S 26°32'01.7\"E. Slagplek Koördinate: 26°49'19.0\"S 26°32'12.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-168",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-11-17",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Schoemansfontein Eienaar)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.745083,
      "longitude": 26.533806
    },
    "reportedByUid": "USR-VIS-REC-168",
    "reportedByName": "Schoemansfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Schoemansfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 1 Cow | Herwin: 0 | Vermis: 0 | Geslag: 1"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°49'19.0\"S 26°32'12.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-168-2",
        "caseId": "CASE-VIS-HBF-168",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 1 diere geslag. Slagplek koördinate: 26°49'19.0\"S 26°32'12.0\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.821944,
          "longitude": 26.536667
        },
        "timestamp": "2023-11-17T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-11-17T06:00:00Z",
    "updatedAt": "2023-11-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-169",
    "caseNumber": "VIS-HBF-2023-169",
    "title": "Veediefstal: 7 Cows - Schoemansfontein Eienaar (Schoemansfontein)",
    "description": "KLAER / KONTAK: Schoemansfontein Eienaar. AREA / PLAAS: Schoemansfontein. GESTEEL: 7 Cows. STATUS: 3 Herwin | 0 Vermis | 4 Geslag. Gesteel Koördinate: 26°45'46.8\"S 26°31'24.8\"E. Gevind Koördinate: 26°53'09.0\"S 26°33'18.8\"E. Slagplek Koördinate: 26°53'09.0\"S 26°33'18.8\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "critical",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-169",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-10-31",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Schoemansfontein Eienaar)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.763,
      "longitude": 26.523556
    },
    "reportedByUid": "USR-VIS-REC-169",
    "reportedByName": "Schoemansfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Schoemansfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 7 Cows | Herwin: 3 | Vermis: 0 | Geslag: 4"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "OTHER"
    ],
    "modusOperandiNotes": "Veldslagting toneel by: 26°53'09.0\"S 26°33'18.8\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-169-1",
        "caseId": "CASE-VIS-HBF-169",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 3 diere herwin/teruggevind. Gevind by koördinate: 26°53'09.0\"S 26°33'18.8\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.885833,
          "longitude": 26.555222
        },
        "timestamp": "2023-10-31T10:00:00Z"
      },
      {
        "id": "UPD-VIS-169-2",
        "caseId": "CASE-VIS-HBF-169",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Veediefstal Ondersoek",
        "authorRole": "CONTROL_ROOM",
        "message": "Veldslagting bevestig: 4 diere geslag. Slagplek koördinate: 26°53'09.0\"S 26°33'18.8\"E",
        "updateType": "progress",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.885833,
          "longitude": 26.555222
        },
        "timestamp": "2023-10-31T12:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-10-31T06:00:00Z",
    "updatedAt": "2023-10-31T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-170",
    "caseNumber": "VIS-HBF-2023-170",
    "title": "Veediefstal: 4 Cows - Schoemansfontein Eienaar (Schoemansfontein)",
    "description": "KLAER / KONTAK: Schoemansfontein Eienaar. AREA / PLAAS: Schoemansfontein. GESTEEL: 4 Cows. STATUS: 0 Herwin | 4 Vermis | 0 Geslag. Gesteel Koördinate: 26°46'26.8\"S 26°29'48.2\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "closed",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-170",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-10-31",
    "incidentTime": "02:00",
    "locationName": "Schoemansfontein (Schoemansfontein Eienaar)",
    "sector": "Sektor Schoemansfontein",
    "gpsLocation": {
      "latitude": -26.774111,
      "longitude": 26.496722
    },
    "reportedByUid": "USR-VIS-REC-170",
    "reportedByName": "Schoemansfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Schoemansfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Schoemansfontein",
    "personDescription": {
      "notes": "Gesteel: 4 Cows | Herwin: 0 | Vermis: 4 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-10-31T06:00:00Z",
    "updatedAt": "2023-10-31T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-171",
    "caseNumber": "VIS-HBF-2023-171",
    "title": "Veediefstal: 14 Cows - Rhenosterhoek Eienaar (Rhenosterhoek)",
    "description": "KLAER / KONTAK: Rhenosterhoek Eienaar. AREA / PLAAS: Rhenosterhoek. GESTEEL: 14 Cows. STATUS: 14 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°51'18.6\"S 26°25'07.7\"E. Laaipunt Koördinate: 26°54'57.0\"S 26°23'15.0\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-171",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-10-17",
    "incidentTime": "02:00",
    "locationName": "Rhenosterhoek (Rhenosterhoek Eienaar)",
    "sector": "Sektor Rhenosterhoek",
    "gpsLocation": {
      "latitude": -26.855167,
      "longitude": 26.418806
    },
    "reportedByUid": "USR-VIS-REC-171",
    "reportedByName": "Rhenosterhoek Eienaar",
    "reportedByPhone": "",
    "victimName": "Rhenosterhoek Eienaar",
    "victimPhone": "",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 14 Cows | Herwin: 14 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°54'57.0\"S 26°23'15.0\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-171-1",
        "caseId": "CASE-VIS-HBF-171",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 14 diere herwin/teruggevind.",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "timestamp": "2023-10-17T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-10-17T06:00:00Z",
    "updatedAt": "2023-10-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-172",
    "caseNumber": "VIS-HBF-2023-172",
    "title": "Veediefstal: 3 Cows - Wolwerand Eienaar (Wolwerand)",
    "description": "KLAER / KONTAK: Wolwerand Eienaar. AREA / PLAAS: Wolwerand. GESTEEL: 3 Cows. STATUS: 0 Herwin | 3 Vermis | 0 Geslag. Gesteel Koördinate: 26°52'00.6\"S 26°29'28.8\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "closed",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-172",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-10-17",
    "incidentTime": "02:00",
    "locationName": "Wolwerand (Wolwerand Eienaar)",
    "sector": "Sektor Wolwerand",
    "gpsLocation": {
      "latitude": -26.866833,
      "longitude": 26.491333
    },
    "reportedByUid": "USR-VIS-REC-172",
    "reportedByName": "Wolwerand Eienaar",
    "reportedByPhone": "",
    "victimName": "Wolwerand Eienaar",
    "victimPhone": "",
    "victimFarmName": "Wolwerand",
    "personDescription": {
      "notes": "Gesteel: 3 Cows | Herwin: 0 | Vermis: 3 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-10-17T06:00:00Z",
    "updatedAt": "2023-10-17T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-173",
    "caseNumber": "VIS-HBF-2023-173",
    "title": "Veediefstal: 13 Sheep - Doornplaat Eienaar (Doornplaat)",
    "description": "KLAER / KONTAK: Doornplaat Eienaar. AREA / PLAAS: Doornplaat. GESTEEL: 13 Sheep. STATUS: 0 Herwin | 13 Vermis | 0 Geslag. Gesteel Koördinate: 27°01'40.6\"S 26°26'53.4\"E. Laaipunt Koördinate: 27°04'51.1\"S 26°22'10.7\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "high",
    "status": "closed",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-173",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-09-28",
    "incidentTime": "02:00",
    "locationName": "Doornplaat (Doornplaat Eienaar)",
    "sector": "Sektor Doornplaat",
    "gpsLocation": {
      "latitude": -27.027944,
      "longitude": 26.448167
    },
    "reportedByUid": "USR-VIS-REC-173",
    "reportedByName": "Doornplaat Eienaar",
    "reportedByPhone": "",
    "victimName": "Doornplaat Eienaar",
    "victimPhone": "",
    "victimFarmName": "Doornplaat",
    "personDescription": {
      "notes": "Gesteel: 13 Sheep | Herwin: 0 | Vermis: 13 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 27°04'51.1\"S 26°22'10.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-09-28T06:00:00Z",
    "updatedAt": "2023-09-28T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-174",
    "caseNumber": "VIS-HBF-2023-174",
    "title": "Veediefstal: 6 Cows - Hartbeesfontein Eienaar (Hartbeesfontein)",
    "description": "KLAER / KONTAK: Hartbeesfontein Eienaar. AREA / PLAAS: Hartbeesfontein. GESTEEL: 6 Cows. STATUS: 6 Herwin | 0 Vermis | 0 Geslag. Gesteel Koördinate: 26°44'45.0\"S 26°24'42.4\"E. Gevind Koördinate: 26°11'24.1\"S 26°11'10.3\"E. Laaipunt Koördinate: 26°43'09.3\"S 26°23'08.4\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "resolved",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-174",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-09-22",
    "incidentTime": "02:00",
    "locationName": "Hartbeesfontein (Hartbeesfontein Eienaar)",
    "sector": "Sektor Hartbeesfontein",
    "gpsLocation": {
      "latitude": -26.745833,
      "longitude": 26.411778
    },
    "reportedByUid": "USR-VIS-REC-174",
    "reportedByName": "Hartbeesfontein Eienaar",
    "reportedByPhone": "",
    "victimName": "Hartbeesfontein Eienaar",
    "victimPhone": "",
    "victimFarmName": "Hartbeesfontein",
    "personDescription": {
      "notes": "Gesteel: 6 Cows | Herwin: 6 | Vermis: 0 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°43'09.3\"S 26°23'08.4\"E",
    "photos": [],
    "evidence": [],
    "updates": [
      {
        "id": "UPD-VIS-174-1",
        "caseId": "CASE-VIS-HBF-174",
        "authorUid": "USR-CTRL-001",
        "authorName": "VIS Register Beheerkamer",
        "authorRole": "CONTROL_ROOM",
        "message": "Herwinning op rekord: 6 diere herwin/teruggevind. Gevind by koördinate: 26°11'24.1\"S 26°11'10.3\"E",
        "updateType": "action_taken",
        "isInternalOnly": false,
        "gpsLocation": {
          "latitude": -26.190028,
          "longitude": 26.186194
        },
        "timestamp": "2023-09-22T10:00:00Z"
      }
    ],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-09-22T06:00:00Z",
    "updatedAt": "2023-09-22T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-175",
    "caseNumber": "VIS-HBF-2023-175",
    "title": "Veediefstal: 3 Cows 3 Kalves - Driekuil Eienaar (Driekuil)",
    "description": "KLAER / KONTAK: Driekuil Eienaar. AREA / PLAAS: Driekuil. GESTEEL: 3 Cows 3 Kalves. STATUS: 0 Herwin | 6 Vermis | 0 Geslag. Gesteel Koördinate: 26°48'26.3\"S 26°03'43.4\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "closed",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-175",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-09-16",
    "incidentTime": "02:00",
    "locationName": "Driekuil (Driekuil Eienaar)",
    "sector": "Sektor Driekuil",
    "gpsLocation": {
      "latitude": -26.807306,
      "longitude": 26.062056
    },
    "reportedByUid": "USR-VIS-REC-175",
    "reportedByName": "Driekuil Eienaar",
    "reportedByPhone": "",
    "victimName": "Driekuil Eienaar",
    "victimPhone": "",
    "victimFarmName": "Driekuil",
    "personDescription": {
      "notes": "Gesteel: 3 Cows 3 Kalves | Herwin: 0 | Vermis: 6 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY"
    ],
    "modusOperandiNotes": "Veediefstal insident geregistreer op VIS databasis.",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-09-16T06:00:00Z",
    "updatedAt": "2023-09-16T14:00:00Z"
  },
  {
    "id": "CASE-VIS-HBF-176",
    "caseNumber": "VIS-HBF-2023-176",
    "title": "Veediefstal: 2 Cows - Rhenosterhoek Eienaar (Rhenosterhoek)",
    "description": "KLAER / KONTAK: Rhenosterhoek Eienaar. AREA / PLAAS: Rhenosterhoek. GESTEEL: 2 Cows. STATUS: 0 Herwin | 2 Vermis | 0 Geslag. Gesteel Koördinate: 26°53'17.0\"S 26°25'40.7\"E. Laaipunt Koördinate: 26°54'59.0\"S 26°23'15.7\"E. Bron: Aug2023 Register (VIS Konsolidasie).",
    "category": "stock_theft",
    "priority": "medium",
    "status": "closed",
    "isPublic": true,
    "sapsCaseNumber": "VIS-HBF-176",
    "sapsStation": "Hartbeesfontein SAPS / STESU",
    "incidentDate": "2023-09-12",
    "incidentTime": "02:00",
    "locationName": "Rhenosterhoek (Rhenosterhoek Eienaar)",
    "sector": "Sektor Rhenosterhoek",
    "gpsLocation": {
      "latitude": -26.888056,
      "longitude": 26.427972
    },
    "reportedByUid": "USR-VIS-REC-176",
    "reportedByName": "Rhenosterhoek Eienaar",
    "reportedByPhone": "",
    "victimName": "Rhenosterhoek Eienaar",
    "victimPhone": "",
    "victimFarmName": "Rhenosterhoek",
    "personDescription": {
      "notes": "Gesteel: 2 Cows | Herwin: 0 | Vermis: 2 | Geslag: 0"
    },
    "modusOperandi": [
      "FENCE_CUT",
      "LIVESTOCK_DRIVEN_AWAY",
      "VEHICLE_USED"
    ],
    "modusOperandiNotes": "Laaipunt/Vervoerpunt opgemerk by: 26°54'59.0\"S 26°23'15.7\"E",
    "photos": [],
    "evidence": [],
    "updates": [],
    "linkedPoiIds": [],
    "linkedVehicleIds": [],
    "createdAt": "2023-09-12T06:00:00Z",
    "updatedAt": "2023-09-12T14:00:00Z"
  }
];
