import { SituationReport, IncidentCategory } from '../types';

export interface RawIncidentLog {
  Date: string;
  Time: string;
  'VB Number'?: string;
  'Person / Reporter': string;
  Category: string;
  'Issue / Details': string;
  Location: string;
  'Vehicle / Reg': string;
  'Record Type': string;
  ContactNotified?: string;
}

export const ACTUAL_RAW_INCIDENT_LOGS: RawIncidentLog[] = [
  // --- VOORVALLEBOEK VERSLAG DEUR ALLETHA SMIT 19/03/2026 - 20/03/2026 ---
  {
    "Date": "2026-03-19",
    "Time": "08:00",
    "VB Number": "VB739",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "KENAS verby H27 rigting Orkney, Ryno Uys in kennis gestel.",
    "Location": "H27 rigting Orkney",
    "Vehicle / Reg": "KENAS",
    "Record Type": "Voorvalleboek / LPR Hit",
    "ContactNotified": "test user35"
  },
  {
    "Date": "2026-03-19",
    "Time": "09:04",
    "VB Number": "VB742",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "KBB688NW verby H34 rigting KLD, A Roux in kennis gestel.",
    "Location": "H34 rigting Klerksdorp",
    "Vehicle / Reg": "KBB 688 NW",
    "Record Type": "Voorvalleboek / LPR Hit",
    "ContactNotified": "test user36"
  },
  {
    "Date": "2026-03-19",
    "Time": "13:52",
    "VB Number": "VB747",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle / Surveillance",
    "Issue / Details": "CSN326NC verby H2 rigting dorp. Voertuig is gevolg tot in die dorp. 14:50 (VB749) Is hy verby H2-Tigane.",
    "Location": "H2 Geduld na Dorp / Tigane",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / Active Tracking",
    "ContactNotified": "Beheerkamer / Buurtwag"
  },
  {
    "Date": "2026-03-19",
    "Time": "15:29",
    "VB Number": "VB751",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "Is hy verby H47 rigting Brakspruit. 15:40 Is hy verby H34 rigting Brakspruit - A Roux in kennis gestel.",
    "Location": "H47 / H34 Brakspruit",
    "Vehicle / Reg": "KBB 688 NW",
    "Record Type": "Voorvalleboek / LPR Hit",
    "ContactNotified": "test user36"
  },
  {
    "Date": "2026-03-19",
    "Time": "18:15",
    "VB Number": "VB755",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle Tracking",
    "Issue / Details": "Is hy verby H2 rigting dorp. 18:23 verby H29 rigting KLD, 18:27 verby H32 rigting KLD.",
    "Location": "H2 / H29 / H32 Klerksdorp pad",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / Active Tracking"
  },
  {
    "Date": "2026-03-19",
    "Time": "18:45",
    "VB Number": "VB756",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle Tracking",
    "Issue / Details": "Is hy verby H32 rigting HBF, 18:50 verby H29 rigting HBF, 18:58 verby H2 rigting Tigane.",
    "Location": "H32 / H29 / H2 Tigane",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / Active Tracking"
  },
  {
    "Date": "2026-03-19",
    "Time": "20:57",
    "VB Number": "VB761",
    "Person / Reporter": "test user2",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "Verby H24, vermoed hy is in die rigting van Wolmaranstad, want hy is nie verby H48 nie. Ryno Uys is in kennis gestel.",
    "Location": "H24 rigting Wolmaranstad",
    "Vehicle / Reg": "KENAS",
    "Record Type": "Voorvalleboek / LPR Hit",
    "ContactNotified": "test user35"
  },
  {
    "Date": "2026-03-19",
    "Time": "21:13",
    "VB Number": "VB762",
    "Person / Reporter": "test user2",
    "Category": "Suspicious Vehicle / Night Movement",
    "Issue / Details": "KBB688NW verby H37 rigting HBF, om 21:20 verby H38 rigting HBF, om 21:32 verby H2 rigting Tigane. Kennisgewing op SITRAP geplaas. Om 21:47 kom hy terug vanaf Tigane, 22:03 verby H38 en om 22:11 verby H37 rigting R30.",
    "Location": "H37 / H38 / H2 Buisfontein / Tigane / R30",
    "Vehicle / Reg": "KBB 688 NW",
    "Record Type": "Voorvalleboek / Sitrep Broadcast",
    "ContactNotified": "SITRAP Groep"
  },
  {
    "Date": "2026-03-20",
    "Time": "00:53",
    "VB Number": "VB767",
    "Person / Reporter": "test user3",
    "Category": "Suspicious Activity / SAPS Patrol",
    "Issue / Details": "Paul Jansen van Vuuren vra om asb te kyk wat se voertuig kom uit by H13 Geduld T-aansluit. Dis n SAPS voertuig BVF842B, het dit so aan Paul oorgedra.",
    "Location": "H13 Geduld T-aansluiting",
    "Vehicle / Reg": "BVF 842 B (SAPS)",
    "Record Type": "Voorvalleboek / Query Resolved",
    "ContactNotified": "test user37"
  },
  {
    "Date": "2026-03-20",
    "Time": "19:49",
    "VB Number": "VB797",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "MK96WYGP verby K3 rigting Brakspruit - KLD. James Lang in kennis gestel.",
    "Location": "K3 Doornfontein / Brakspruit - KLD",
    "Vehicle / Reg": "MK 96 WY GP",
    "Record Type": "Voorvalleboek / LPR Alert",
    "ContactNotified": "test user38"
  },
  {
    "Date": "2026-03-20",
    "Time": "19:51",
    "VB Number": "VB798",
    "Person / Reporter": "test user4",
    "Category": "Disturbance / Public Safety",
    "Issue / Details": "Ann laat weet dat voor stasie huis nr 1 lê daar n dronk man in die pad, in die grasse. Francois Botha sal die man gaan skuif.",
    "Location": "Stasie Huis nr 1, Hartbeesfontein",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Community Response",
    "ContactNotified": "test user5"
  },
  {
    "Date": "2026-03-20",
    "Time": "19:51",
    "VB Number": "VB799",
    "Person / Reporter": "test user5",
    "Category": "Motor Vehicle Accident",
    "Issue / Details": "Francois Botha laat weet op die Buurtwag groep van n MVO naby Pzazz. SAPS is reeds gekontak. Buurtwag lede is oppad na die toneel.",
    "Location": "Naby Pzazz, Hartbeesfontein",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / MVO Incident",
    "ContactNotified": "SAPS / Buurtwag Reaksie"
  },
  {
    "Date": "2026-03-20",
    "Time": "19:57",
    "VB Number": "VB800",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "CSN326NC verby H2 rigting Tigane.",
    "Location": "H2 Geduld / Tigane",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / LPR Hit"
  },
  {
    "Date": "2026-03-20",
    "Time": "20:24",
    "VB Number": "VB802",
    "Person / Reporter": "test user6",
    "Category": "Road Hazard / Reckless Driving",
    "Issue / Details": "Ann-Mari Basson vra om n kennisgewing op groepe te plaas om versigtig te wees op die KLD/Ottosdal pad agv ongelukstoneel. Ann-Mari rapporteer ook dat die drywer Zander baie dronk is.",
    "Location": "Klerksdorp / Ottosdal pad",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Hazard Warning",
    "ContactNotified": "Gemeenskap Groepe"
  },
  {
    "Date": "2026-03-20",
    "Time": "22:16",
    "VB Number": "VB806",
    "Person / Reporter": "test user7",
    "Category": "Disturbance / Public Safety",
    "Issue / Details": "Kennisgewing op groepe geplaas dat dronk mense in Eenheidstraat in die pad lê.",
    "Location": "Eenheidstraat, Hartbeesfontein",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Warning Broadcast"
  },

  // --- VOORVALLEBOEK VERSLAG DEUR ALLETHA SMIT 21/03/2026 - 23/03/2026 ---
  {
    "Date": "2026-03-21",
    "Time": "08:28",
    "VB Number": "VB821",
    "Person / Reporter": "test user8",
    "Category": "Livestock Movement",
    "Issue / Details": "K5 ROOIPOORT - Rooi-bruin beeste verby kamera. Beeste word elke dag oor die R30 gejaag na weikamp - werker het rooi klere aan.",
    "Location": "K5 Rooipoort / R30 Oorkruising",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Routine Observation"
  },
  {
    "Date": "2026-03-21",
    "Time": "09:02",
    "VB Number": "VB822",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle / People Transport",
    "Issue / Details": "KKZ866NW verby H2 rigting dorp vol mense en weer terug na Tigane om 09:51.",
    "Location": "H2 Geduld / Dorp na Tigane",
    "Vehicle / Reg": "KKZ 866 NW",
    "Record Type": "Voorvalleboek / LPR Monitoring"
  },
  {
    "Date": "2026-03-21",
    "Time": "12:10",
    "VB Number": "VB830",
    "Person / Reporter": "test user9",
    "Category": "Suspicious Livestock Activity",
    "Issue / Details": "Willem PTZ - man met wit gumboots jaag skape uit, hy word gemonitor. Om 12:48 gaan PTZ af.",
    "Location": "Willem PTZ sektor",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / PTZ Camera Tracking"
  },
  {
    "Date": "2026-03-21",
    "Time": "15:15",
    "VB Number": "VB833",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle Movement",
    "Issue / Details": "KKZ688NW was 4x keer op en af tussen dorp en Tigane, nou egter oppad KLD toe.",
    "Location": "Dorp / Tigane / Klerksdorp pad",
    "Vehicle / Reg": "KKZ 688 NW",
    "Record Type": "Voorvalleboek / Pattern Alert"
  },
  {
    "Date": "2026-03-21",
    "Time": "17:28",
    "VB Number": "VB836",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle / Passenger Drop",
    "Issue / Details": "KBB688NW verby H7 - daar was mense agter op wat hy erens op die Dupperspos grondpad afgelaai het, en weer terug gekom het sonder die mense. A Roux, Piet Bloem, Francois Coetzee is in kennis gestel.",
    "Location": "H7 Dupperspos grondpad",
    "Vehicle / Reg": "KBB 688 NW",
    "Record Type": "Voorvalleboek / Intelligence Flag",
    "ContactNotified": "test user39"
  },
  {
    "Date": "2026-03-21",
    "Time": "18:34",
    "VB Number": "VB838",
    "Person / Reporter": "test user10",
    "Category": "Crop Theft / Security Apprehension",
    "Issue / Details": "Op buurtwag is gerapporteer dat persone baklein in Tiganestraat op die hoek. Buurtwag reageer - dit is een van Gustav Schoeman se wagte wat van die mieliediewe bymekaar gemaak het.",
    "Location": "Tiganestraat hoek, Hartbeesfontein",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Apprehension",
    "ContactNotified": "Gustav Schoeman wagte / Buurtwag"
  },
  {
    "Date": "2026-03-21",
    "Time": "21:50",
    "VB Number": "VB844",
    "Person / Reporter": "test user11",
    "Category": "Burglary Alarm / False Alarm",
    "Issue / Details": "Abel Pienaar sien hoe breek hulle in by die bottelstoor langs Droëkraal Slaghuis. Buurtwag reageer dadelik - dit blyk die eienaar van die bottelstoor self te wees.",
    "Location": "Bottelstoor langs Droëkraal Slaghuis",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Reaction Response",
    "ContactNotified": "Buurtwag Reaksie"
  },
  {
    "Date": "2026-03-22",
    "Time": "08:41",
    "VB Number": "VB859",
    "Person / Reporter": "test user12",
    "Category": "Suspicious Gathering / Church Service",
    "Issue / Details": "Johan Breedt rapporteer dat na Heidi van Zyl staan n NP200 HZL830NW wat mense aflaai, en aan die ander kant n groep van 12-15 mense by die skooltjie ingaan met ander bakkies. Bevestig as vreedsame kerkdiens.",
    "Location": "Heidi van Zyl / Skooltjie",
    "Vehicle / Reg": "HZL 830 NW (Nissan NP200)",
    "Record Type": "Voorvalleboek / Verified Clear"
  },
  {
    "Date": "2026-03-22",
    "Time": "09:00",
    "VB Number": "VB860",
    "Person / Reporter": "test user13",
    "Category": "Airspace / Drone Query",
    "Issue / Details": "Abri Rossouw vra of ons dalk in Paardeplaas area met die drone gevlieg het gisteraand. Bevestig ons drone het nie gevlieg nie. Abri sê dankie want hy wou hom skiet maar was bang dit is ons span.",
    "Location": "Paardeplaas",
    "Vehicle / Reg": "Drone (Unknown)",
    "Record Type": "Voorvalleboek / Operations Query",
    "ContactNotified": "test user13"
  },
  {
    "Date": "2026-03-22",
    "Time": "15:00",
    "VB Number": "VB867",
    "Person / Reporter": "test user14",
    "Category": "Stray Livestock",
    "Issue / Details": "Otto Bruwer rapporteer dat daar n skaapooi op die Rooikuil pad is, geel oorplaatjie in regteroor en rooi verf op haar rug. Geen eienaarskap bevestig.",
    "Location": "Rooikuil grondpad",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Stray Animal",
    "ContactNotified": "test user40"
  },
  {
    "Date": "2026-03-22",
    "Time": "20:19",
    "VB Number": "VB877",
    "Person / Reporter": "test user15",
    "Category": "Suspicious Vehicle / Verified Local",
    "Issue / Details": "K2 Eleazer: Blou Toyota Tazz stadig verby kamera rigting Eleazer DRT851NW - bevestig dit is n plaaslike inwoner.",
    "Location": "K2 Eleazer",
    "Vehicle / Reg": "DRT 851 NW (Blou Toyota Tazz)",
    "Record Type": "Voorvalleboek / Local Clear"
  },
  {
    "Date": "2026-03-22",
    "Time": "20:43",
    "VB Number": "VB878",
    "Person / Reporter": "test user7",
    "Category": "Vehicle Sighting",
    "Issue / Details": "KFD337NW verby H2 rigting Coligny. Jaco Maré se ou bakkie. Jaco ingelig - geen verdere hits.",
    "Location": "H2 Geduld rigting Coligny",
    "Vehicle / Reg": "KFD 337 NW",
    "Record Type": "Voorvalleboek / LPR Hit",
    "ContactNotified": "test user32"
  },
  {
    "Date": "2026-03-22",
    "Time": "22:36",
    "VB Number": "VB881",
    "Person / Reporter": "test user7",
    "Category": "Camera Technical / Playback",
    "Issue / Details": "H13 Geduld AF - playback gekyk - geen verdagte bewegings onder paal nie.",
    "Location": "H13 Geduld",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / System Check"
  },
  {
    "Date": "2026-03-22",
    "Time": "22:55",
    "VB Number": "VB882",
    "Person / Reporter": "test user7",
    "Category": "Security Patrol",
    "Issue / Details": "H33 Paardeplaas - 2 x plaaswagte met flitse verby kamera rigting Wicus van Aarde.",
    "Location": "H33 Paardeplaas",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Guard Patrol"
  },
  {
    "Date": "2026-03-23",
    "Time": "00:02",
    "VB Number": "VB884",
    "Person / Reporter": "test user16",
    "Category": "Intelligence / Civil Unrest",
    "Issue / Details": "Francois Botha stemboodskap gestuur van n beplande staking deur die taxi-eienaars in Hartbeesfontein, Klerksdorp, Khuma en Kanana - bevestig.",
    "Location": "HBF / Klerksdorp / Khuma / Kanana",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Intel Early Warning",
    "ContactNotified": "Reaksiemag & Buurtwag"
  },
  {
    "Date": "2026-03-23",
    "Time": "07:20",
    "VB Number": "VB893",
    "Person / Reporter": "test user1",
    "Category": "Flooding / Road Hazard",
    "Issue / Details": "Kennisgewing op groepe geplaas van water wat ophoop op paaie: Eenheidstraat, Absa Kruising en Staalmeester Kruising.",
    "Location": "Eenheidstraat / Absa / Staalmeester",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Road Warning"
  },
  {
    "Date": "2026-03-23",
    "Time": "07:22",
    "VB Number": "VB894",
    "Person / Reporter": "test user17",
    "Category": "Flooding / Road Hazard",
    "Issue / Details": "Carla Alberts laat weet die Ventersdorp/Klerksdorp pad is vol water, sig word erg belemmer deur swaar reën. Kennisgewing op groepe geplaas.",
    "Location": "R30 Ventersdorp / Klerksdorp pad",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Road Warning",
    "ContactNotified": "Gemeenskap Groepe"
  },
  {
    "Date": "2026-03-23",
    "Time": "10:34",
    "VB Number": "VB899",
    "Person / Reporter": "test user7",
    "Category": "Livestock Hazard",
    "Issue / Details": "H6 Dominionville N12 - beeste loop en wei langs die pad by die Dominionville T-aansluiting. Kennisgewing op groepe geplaas.",
    "Location": "H6 Dominionville N12 T-aansluiting",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Livestock Warning"
  },
  {
    "Date": "2026-03-23",
    "Time": "12:33",
    "VB Number": "VB903",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "KBB688NW is verby H48 rigting Dominionville. A Roux, M de Klerk, G Pelser en J Maré in kennis gestel.",
    "Location": "H48 Jakkalsfontein rigting Dominionville",
    "Vehicle / Reg": "KBB 688 NW",
    "Record Type": "Voorvalleboek / Target Alert",
    "ContactNotified": "test user41"
  },
  {
    "Date": "2026-03-23",
    "Time": "15:42",
    "VB Number": "VB910",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "KBB688NW verby H47 rigting Brakspruit/Ventersdorp.",
    "Location": "H47 rigting Brakspruit/Ventersdorp",
    "Vehicle / Reg": "KBB 688 NW",
    "Record Type": "Voorvalleboek / Target Alert"
  },
  {
    "Date": "2026-03-23",
    "Time": "18:02",
    "VB Number": "VB914",
    "Person / Reporter": "test user18",
    "Category": "Road Hazard / Mud",
    "Issue / Details": "Phillip Meiring rapporteer dat die Syferfontein grondpad naby Josua Erasmus na die reën een modderspul is, pad is baie glad en gevaarlik, voertuie gaan vassit. Kennisgewing op groepe geplaas.",
    "Location": "Syferfontein grondpad naby Josua Erasmus",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Road Warning",
    "ContactNotified": "test user40"
  },
  {
    "Date": "2026-03-23",
    "Time": "18:18",
    "VB Number": "VB915",
    "Person / Reporter": "test user7",
    "Category": "Smoke / Controlled Fire",
    "Issue / Details": "Dorp silo - rook opgemerk in Eenheidstraat nader aan Staalmeester kruising. Buurtwag gaan kyk - dit is n inwoner wat braai met nat hout.",
    "Location": "Eenheidstraat naby Staalmeester kruising",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Checked & Clear"
  },

  // --- VOORVALLEBOEK VERSLAG DEUR ALLETHA SMIT 24/03/2026 - 27/03/2026 ---
  {
    "Date": "2026-03-24",
    "Time": "19:25",
    "VB Number": "VB950",
    "Person / Reporter": "test user19",
    "Category": "Motor Vehicle Accident / Livestock Strike",
    "Issue / Details": "Frikkie Martin rapporteer MVO op HBF/Ottosdal pad net na Senwes. Bakkie (JDW115FS donker grys Toyota D/C) het in 3 beeste vasgery. 2 beeste dood, 1 het weggehardloop. Drywer nie op toneel. Eienaar van beeste is Rose Magatleng (hoenderplaas).",
    "Location": "HBF / Ottosdal pad net na Senwes",
    "Vehicle / Reg": "JDW 115 FS (Toyota D/C)",
    "Record Type": "Voorvalleboek / MVO Accident",
    "ContactNotified": "Buurtwag & Lede Groep"
  },
  {
    "Date": "2026-03-25",
    "Time": "07:37",
    "VB Number": "VB970",
    "Person / Reporter": "test user20",
    "Category": "Civil Unrest / Protest",
    "Issue / Details": "Bertus Roos rapporteer protesaksie te N4 Ruakana.",
    "Location": "N4 Ruakana",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Situation Report"
  },
  {
    "Date": "2026-03-25",
    "Time": "10:49",
    "VB Number": "VB974",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle / Mohepies",
    "Issue / Details": "HKK755NW (Mohepies) is verby H46 rigting Schoemansfontein, met n sleepwa en twee mense agterop.",
    "Location": "H46 Wesselstraat rigting Schoemansfontein",
    "Vehicle / Reg": "HKK 755 NW",
    "Record Type": "Voorvalleboek / LPR Flag"
  },
  {
    "Date": "2026-03-26",
    "Time": "01:01",
    "VB Number": "VB1017",
    "Person / Reporter": "test user21",
    "Category": "Community Assistance / Animal",
    "Issue / Details": "Francois Botha stuur stemboodskap van dame wat sukkel om n hond uit een van die laerskool se klaskamers te kry. Ann-Mari reageer dadelik en kry die hond veilig uit.",
    "Location": "Laerskool Hartbeesfontein",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Community Assistance",
    "ContactNotified": "test user6"
  },
  {
    "Date": "2026-03-26",
    "Time": "21:17",
    "VB Number": "VB1030",
    "Person / Reporter": "test user7",
    "Category": "SAPS Patrol Movement",
    "Issue / Details": "H11 Geduld kruising - SAPS voertuig verby H11 rigting Rietfontein, in by Hennie Beyers se plaas waar Johan Botha gebly het, stop by 4de stat.",
    "Location": "H11 Geduld / Rietfontein Hennie Beyers plaas",
    "Vehicle / Reg": "SAPS Patrol",
    "Record Type": "Voorvalleboek / Police Movement"
  },
  {
    "Date": "2026-03-27",
    "Time": "02:03",
    "VB Number": "VB1039",
    "Person / Reporter": "test user8",
    "Category": "Suspicious Vehicle / Spotlight",
    "Issue / Details": "K1 Palmietfontein - voertuig vanaf Palmietfontein het n flitslig/spotlight bo op dak - stop naby T-aansluiting, staan rukkie daar, ry rigting Klerksdorp.",
    "Location": "K1 Palmietfontein T-aansluiting",
    "Vehicle / Reg": "Unverified (Spotlight on roof)",
    "Record Type": "Voorvalleboek / Suspicious Sighting"
  },
  {
    "Date": "2026-03-27",
    "Time": "04:16",
    "VB Number": "VB1041",
    "Person / Reporter": "test user22",
    "Category": "Infrastructure / Power Outage",
    "Issue / Details": "Eskom call centre gebel ivm Santech kragprobleme (geen antwoord). Piet Bloem geskakel, hy adviseer dat André Roux geskakel moet word.",
    "Location": "Santech krag substasie",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Utility Escalation",
    "ContactNotified": "test user42"
  },
  {
    "Date": "2026-03-27",
    "Time": "09:49",
    "VB Number": "VB1047",
    "Person / Reporter": "test user1",
    "Category": "Stock Theft / Interception / High Priority",
    "Issue / Details": "CSN326NC verby H2 rigting dorp. 09:55 terug Tigane. 11:06 verby I3 Coligny R503 met sleepwa en n BEES OP DIE WA. Marius de Klerk laat weet Coligny beheerkamer en SAPS om hom te stop. Coligny SAPS het bakkie gestop maar laat gaan. Gerhard Pelser, André Roux, Jaco Maré en Marius de Klerk in kennis gestel.",
    "Location": "H2 / I3 Coligny R503",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / Stock Theft Tracking",
    "ContactNotified": "Marius de Klerk, Gerhard Pelser, André Roux, Jaco Maré, Coligny SAPS"
  },
  {
    "Date": "2026-03-27",
    "Time": "15:33",
    "VB Number": "VB1051",
    "Person / Reporter": "test user23",
    "Category": "Stray Livestock",
    "Issue / Details": "Stanley Dewing rapporteer dat op HBF-KLD pad voor Cobus van Jaarsveld se ou plaas loop n koei. Jannie Schoevers gekontak - hy stuur sy werkers uit en is self oppad om haar te gaan haal.",
    "Location": "HBF-KLD pad voor Cobus van Jaarsveld plaas",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Livestock Recovery",
    "ContactNotified": "test user43"
  },
  {
    "Date": "2026-03-27",
    "Time": "16:10",
    "VB Number": "VB1050",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle / Stock Theft Follow-up",
    "Issue / Details": "CSN326NC kom terug verby H1 Leeuwfontein Geduld kruising rigting Tigane met wa maar SONDER DIE BEES. 16:29 verby H32 Freds Pub met wa. 16:48 verby H46 Wesselstraat SONDER sleepwa.",
    "Location": "H1 Leeuwfontein / H32 Freds Pub / H46 Wesselstraat",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / Intel Update"
  },
  {
    "Date": "2026-03-27",
    "Time": "18:20",
    "VB Number": "VB1054",
    "Person / Reporter": "test user24",
    "Category": "Active Vehicle Pursuit / Intel",
    "Issue / Details": "CSN326NC verby H38 Buisfontein rigting Brakspruit R30. 18:25 verby H37 met mense agter in canopy. Verby K3 Doornfontein rigting Blinkwater state. James Lang stuur reaksiemense uit. 18:42 verby K3 rigting Brakspruit. 18:48 terug Tigane. Gerhard Pelser volledig ingelig.",
    "Location": "H38 Buisfontein / H37 / K3 Doornfontein / Blinkwater / Tigane",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / Reaction Mobilisation",
    "ContactNotified": "test user44"
  },
  {
    "Date": "2026-03-27",
    "Time": "19:38",
    "VB Number": "VB1058",
    "Person / Reporter": "test user7",
    "Category": "Night Surveillance / Thermal Monitoring",
    "Issue / Details": "HKK755NW (Mohepies) kom vanaf Wolmaranstad na H6 Dominionville statte. Herman PTZ, Renosterhoek PTZ en Thermal kameras gefokus op Dominionville. André Roux, Marius de Klerk, Gerhard Pelser, Jaco Maré en Piet Bloem in kennis gestel. Na 2 ure niks verdag opgemerk.",
    "Location": "H6 Dominionville statte",
    "Vehicle / Reg": "HKK 755 NW",
    "Record Type": "Voorvalleboek / Camera Lockdown",
    "ContactNotified": "test user45"
  },
  {
    "Date": "2026-03-27",
    "Time": "20:26",
    "VB Number": "VB1060",
    "Person / Reporter": "test user25",
    "Category": "Suspicious Vehicles / Empty Trailers",
    "Issue / Details": "Delarey Lemmer rapporteer 2x bakkies met waentjies vanaf Ventersdorp na Klerksdorp: JCK959NW (Grys D/C Isuzu) en JXY651NW (Toyota Cruiser). Albei met leë waentjies gery. Inligting aan Delarey bevestig.",
    "Location": "R30 Ventersdorp na Klerksdorp",
    "Vehicle / Reg": "JCK 959 NW & JXY 651 NW",
    "Record Type": "Voorvalleboek / Syntell Verification",
    "ContactNotified": "test user46"
  },
  {
    "Date": "2026-03-27",
    "Time": "22:14",
    "VB Number": "VB1065",
    "Person / Reporter": "test user7",
    "Category": "Prowler / Suspicious Person",
    "Issue / Details": "H2 HBF Geduld - man kom gebuk onder die paal uit. Hy het geluister wat die luidsprekerpaal sê. Toe operateur oor paal vra wat hy soek, het hy dadelik weggehardloop.",
    "Location": "H2 Geduld Kamerapaal",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Pole Intercom Action"
  },

  // --- VOORVALLEBOEK VERSLAG DEUR ALLETHA SMIT 28/03/2026 - 01/04/2026 ---
  {
    "Date": "2026-03-28",
    "Time": "21:19",
    "VB Number": "VB1065-B",
    "Person / Reporter": "test user26",
    "Category": "Suspicious Vehicle / Crop Theft Patrol",
    "Issue / Details": "Vicus van Zyl op patrollie sien by Werda grondpad naby silo n silwer/grys bakkie met canopy en klein sleepwaentjie (moontlik mieliediewe). Kameras gesoek maar voertuig het pad verlaat.",
    "Location": "Werda grondpad naby silo",
    "Vehicle / Reg": "Silwer/Grys Bakkie + Canopy + Waentjie",
    "Record Type": "Voorvalleboek / Patrol Report",
    "ContactNotified": "Buurtwag Patrollie"
  },
  {
    "Date": "2026-03-28",
    "Time": "21:36",
    "VB Number": "VB1108",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle Towed",
    "Issue / Details": "KBB688NW verby H37 rigting R30, gesleep deur MP718NW. André Roux gekontak, Jaco Maré en Gerhard Pelser per WhatsApp ingelig.",
    "Location": "H37 Opraap rigting R30",
    "Vehicle / Reg": "KBB 688 NW & MP 718 NW",
    "Record Type": "Voorvalleboek / Towing Alert",
    "ContactNotified": "test user47"
  },
  {
    "Date": "2026-03-28",
    "Time": "23:02",
    "VB Number": "VB1070",
    "Person / Reporter": "test user27",
    "Category": "Fatal Truck Accident",
    "Issue / Details": "Robert Graham rapporteer dat by Dupperspos draai het n trok omgeval. Insleepdienste reeds op toneel. Drywer ongelukkig oorlede op toneel, wag vir Forensies. Kennisgewing op noodgroepe geplaas.",
    "Location": "Dupperspos draai, Hartbeesfontein",
    "Vehicle / Reg": "Trok (Heavy Vehicle)",
    "Record Type": "Voorvalleboek / Fatal Accident",
    "ContactNotified": "Nooddienste, SAPS, Forensies"
  },
  {
    "Date": "2026-03-29",
    "Time": "08:33",
    "VB Number": "VB1115",
    "Person / Reporter": "test user8",
    "Category": "Suspicious Vehicle / People Transport",
    "Issue / Details": "KKZ866NW verby H11 rigting Coligny vol mense. 09:44 (VB1117) verby I3 Coligny nog vol mense. 11:33 terug verby I3 rigting HBF.",
    "Location": "H11 / I3 Coligny pad",
    "Vehicle / Reg": "KKZ 866 NW",
    "Record Type": "Voorvalleboek / Passenger Tracking"
  },
  {
    "Date": "2026-03-29",
    "Time": "14:00",
    "VB Number": "VB1123",
    "Person / Reporter": "test user7",
    "Category": "SAPS Vehicle Observation",
    "Issue / Details": "MS2 Herman Wilkens: SAPS Nissan D/C bakkie stop by n man in sig van kamerapaal, laai die man op en ry in rigting van hoenderhokke.",
    "Location": "MS2 Herman Wilkens paal",
    "Vehicle / Reg": "SAPS Nissan D/C",
    "Record Type": "Voorvalleboek / Police Observation"
  },
  {
    "Date": "2026-03-29",
    "Time": "16:05",
    "VB Number": "VB1125",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "H48 Jakkalsfontein - KENAS is verby H48 rigting Wolmaranstad. 17:43 (VB1137) verby H51 rigting Sendelingsfontein met 2 persone in voertuig.",
    "Location": "H48 Jakkalsfontein / H51 Sendelingsfontein",
    "Vehicle / Reg": "KENAS",
    "Record Type": "Voorvalleboek / LPR Target"
  },
  {
    "Date": "2026-03-29",
    "Time": "19:35",
    "VB Number": "VB1141",
    "Person / Reporter": "test user28",
    "Category": "Suspicious Lights / PTZ Observation",
    "Issue / Details": "Renosterhoek PTZ - Ligte beweeg baie stadig na die toring. James Lang gekontak en video gestuur. James laat weet per voicenote hy vermoed dit is Cobus de Jager en sal hom bel.",
    "Location": "Renosterhoek toring",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / PTZ Night Sighting",
    "ContactNotified": "test user38"
  },
  {
    "Date": "2026-03-29",
    "Time": "23:00",
    "VB Number": "VB1146",
    "Person / Reporter": "test user29",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "Francois Coetzee rapporteer verdagte voertuig op die Geduld pad: Wit Isuzu bakkie JVX534NW.",
    "Location": "Geduld pad",
    "Vehicle / Reg": "JVX 534 NW (Wit Isuzu)",
    "Record Type": "Voorvalleboek / Suspicious Report",
    "ContactNotified": "test user48"
  },
  {
    "Date": "2026-03-30",
    "Time": "11:18",
    "VB Number": "VB1163",
    "Person / Reporter": "test user30",
    "Category": "Accident / Fence Damage",
    "Issue / Details": "Francois Botha rapporteer dat n voertuig deur die plaasdrade gery het by Staalmeester. Voertuig se voorste buffer lê nog teen die draad.",
    "Location": "Staalmeester draad / Hartbeesfontein",
    "Vehicle / Reg": "Bumper on scene",
    "Record Type": "Voorvalleboek / Property Damage",
    "ContactNotified": "test user5"
  },
  {
    "Date": "2026-03-30",
    "Time": "12:29",
    "VB Number": "VB1166",
    "Person / Reporter": "test user31",
    "Category": "Technical Query",
    "Issue / Details": "Thys Lourens vra of MS11, MS12 en MS hoppaal aan is. Operateur bevestig hulle is af. Thys vra dat André Roux hom skakel.",
    "Location": "MS11 / MS12 / MS Hoppaal",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Radio Check",
    "ContactNotified": "test user36"
  },
  {
    "Date": "2026-03-30",
    "Time": "13:37",
    "VB Number": "VB1167",
    "Person / Reporter": "test user32",
    "Category": "Suspicious Vehicle / Fled Reaction",
    "Issue / Details": "Jaco Maré rapporteer verdagte wit Isuzu D/C bakkie LM20CLGP op N12. Toe bestuurder lede van reaksiemag gewaar, het hy dadelik omgedraai en weggejaag rigting Klerksdorp. Ongeveer 4 insittendes. Ry gereeld by H28.",
    "Location": "N12 na Klerksdorp / H28",
    "Vehicle / Reg": "LM 20 CL GP (Wit Isuzu D/C)",
    "Record Type": "Voorvalleboek / Evasion Alert",
    "ContactNotified": "test user49"
  },
  {
    "Date": "2026-03-31",
    "Time": "08:20",
    "VB Number": "VB1194",
    "Person / Reporter": "test user1",
    "Category": "Suspicious Vehicle Movement",
    "Issue / Details": "CSN326NC verby H2 rigting dorp. 08:44 verby H2 terug na Tigane.",
    "Location": "H2 Geduld / Tigane",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / Surveillance"
  },
  {
    "Date": "2026-03-31",
    "Time": "10:33",
    "VB Number": "VB1197",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle Movement",
    "Issue / Details": "KTY546NW verby H2 rigting dorp. 11:22 kom voertuig terug na Tigane.",
    "Location": "H2 Geduld / Tigane",
    "Vehicle / Reg": "KTY 546 NW",
    "Record Type": "Voorvalleboek / LPR Monitoring"
  },
  {
    "Date": "2026-03-31",
    "Time": "18:23",
    "VB Number": "VB1206",
    "Person / Reporter": "test user33",
    "Category": "Suspicious Vehicle Movement",
    "Issue / Details": "CSN326NC verby H29 rigting KLD. Gerhard Pelser gekontak. André Roux, Jaco Maré en Marius de Klerk per WhatsApp ingelig. 18:46 verby H29 terug rigting HBF.",
    "Location": "H29 Klerksdorp pad",
    "Vehicle / Reg": "CSN 326 NC",
    "Record Type": "Voorvalleboek / Multi-Unit Alert",
    "ContactNotified": "test user50"
  },
  {
    "Date": "2026-03-31",
    "Time": "19:12",
    "VB Number": "VB1209",
    "Person / Reporter": "test user2",
    "Category": "Suspicious Handover / Theft Equipment",
    "Issue / Details": "CSN326NC verby H2 rigting HBF, stop oorkant SAPS stasie. 2 verdagtes klim agter by kappie uit: 1 met rugsak en 1 met n voertuigwiel. Senwes bakkie stop en die 2 persone klim by Senwes bakkie in. CSN terug na Tigane om 19:18. Jaco Maré in kennis gestel.",
    "Location": "H2 Geduld / Oorkant SAPS Stasie",
    "Vehicle / Reg": "CSN 326 NC & Senwes Bakkie",
    "Record Type": "Voorvalleboek / Tactical Intelligence",
    "ContactNotified": "test user32"
  },
  {
    "Date": "2026-03-31",
    "Time": "19:38",
    "VB Number": "VB1211",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "HWD945NW - wit S/C Toyota bakkie verby H48 rigting Klerksdorp. André Roux per WhatsApp in kennis gestel.",
    "Location": "H48 Jakkalsfontein rigting KLD",
    "Vehicle / Reg": "HWD 945 NW (Wit Toyota S/C)",
    "Record Type": "Voorvalleboek / LPR Hit",
    "ContactNotified": "test user36"
  },
  {
    "Date": "2026-03-31",
    "Time": "20:22",
    "VB Number": "VB1212",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle / Evading Camera",
    "Issue / Details": "KKZ882NW verby H2 rigting dorp, stop by Econo, laai iemand op, gooi brandstof en ry Delekile Khoza af rigting Ottosdal. Verby H4 om 20:33, verloor op Ottosdal pad. 21:06 is hy terug in Tigane.",
    "Location": "H2 / Econo / Delekile Khoza / H4 Ottosdal pad",
    "Vehicle / Reg": "KKZ 882 NW",
    "Record Type": "Voorvalleboek / Vehicle Pursuit"
  },
  {
    "Date": "2026-03-31",
    "Time": "21:23",
    "VB Number": "VB1214",
    "Person / Reporter": "test user34",
    "Category": "Crop Theft Scouting / Suspicious Vehicle",
    "Issue / Details": "Klein Frikkie rapporteer verdagte wit Nissan pannelvan FB57MKGP met leer op dak en spotlight wat by mielielande gestaan het. Kobus volg hom tot by N12 na KLD. Syntell rekord toon 192 hits vir ware reg FB57NKGP tussen KLD, Ottosdal en N12.",
    "Location": "Mielielande / N12 rigting Klerksdorp",
    "Vehicle / Reg": "FB 57 NK GP (Nissan Panelvan)",
    "Record Type": "Voorvalleboek / Syntell Match",
    "ContactNotified": "test user51"
  },
  {
    "Date": "2026-03-31",
    "Time": "22:01",
    "VB Number": "VB1216",
    "Person / Reporter": "test user7",
    "Category": "Suspicious Vehicle",
    "Issue / Details": "KTY546NW verby H2 rigting Tigane. Voertuig was om 21:56 verby H2 in die dorp in. André Roux, Jaco Maré, Gerhard Pelser en Marius de Klerk per WhatsApp ingelig.",
    "Location": "H2 Geduld / Tigane",
    "Vehicle / Reg": "KTY 546 NW",
    "Record Type": "Voorvalleboek / Multi-Unit Alert",
    "ContactNotified": "test user52"
  },
  {
    "Date": "2026-04-01",
    "Time": "00:34",
    "VB Number": "VB001",
    "Person / Reporter": "test user32",
    "Category": "Livestock Farm Alarm / Camera Guard",
    "Issue / Details": "Jaco Maré rapporteer dat sy beesalarms afgaan (moontlik te sensitief). Vra dat beheerkamer monitor. Operateur hou gereeld kameras op beeste en bevestig diere is rustig.",
    "Location": "Jaco Maré Plaas / Beeskrale",
    "Vehicle / Reg": "",
    "Record Type": "Voorvalleboek / Guarding Request",
    "ContactNotified": "test user32"
  }
];

// Helper to map raw logs into SituationReport models with accurate coordinates in Hartbeesfontein & surrounding camera sectors
export function convertRawLogsToSituationReports(): SituationReport[] {
  const cameraSectorCoords: Record<string, { lat: number; lng: number }> = {
    'H1': { lat: -26.7580, lng: 26.4110 },
    'H2': { lat: -26.7645, lng: 26.4020 },
    'H4': { lat: -26.7710, lng: 26.3930 },
    'H6': { lat: -26.8340, lng: 26.3680 },
    'H7': { lat: -26.7820, lng: 26.4350 },
    'H11': { lat: -26.7510, lng: 26.4250 },
    'H13': { lat: -26.7460, lng: 26.4310 },
    'H24': { lat: -26.7910, lng: 26.3780 },
    'H27': { lat: -26.8050, lng: 26.4520 },
    'H28': { lat: -26.8480, lng: 26.4710 },
    'H29': { lat: -26.7690, lng: 26.4420 },
    'H32': { lat: -26.7740, lng: 26.4560 },
    'H33': { lat: -26.7210, lng: 26.4590 },
    'H34': { lat: -26.7790, lng: 26.4670 },
    'H37': { lat: -26.7410, lng: 26.4860 },
    'H38': { lat: -26.7380, lng: 26.4750 },
    'H46': { lat: -26.7610, lng: 26.4190 },
    'H47': { lat: -26.7350, lng: 26.4910 },
    'H48': { lat: -26.8120, lng: 26.3890 },
    'H51': { lat: -26.8420, lng: 26.3420 },
    'K1': { lat: -26.7250, lng: 26.5020 },
    'K2': { lat: -26.7120, lng: 26.5120 },
    'K3': { lat: -26.7320, lng: 26.4680 },
    'K5': { lat: -26.7450, lng: 26.4850 },
    'I3': { lat: -26.6850, lng: 26.4150 },
    'R30': { lat: -26.7450, lng: 26.4850 },
    'R503': { lat: -26.7725, lng: 26.4380 },
    'N12': { lat: -26.8520, lng: 26.4720 },
    'Tigane': { lat: -26.7820, lng: 26.3980 },
    'Dominionville': { lat: -26.8340, lng: 26.3680 },
    'Brakspruit': { lat: -26.7320, lng: 26.4680 },
    'Paardeplaas': { lat: -26.7210, lng: 26.4590 },
    'Dorp': { lat: -26.7635, lng: 26.4168 },
    'Geduld': { lat: -26.7460, lng: 26.4310 },
    'default': { lat: -26.7635, lng: 26.4168 }
  };

  const nowIso = new Date().toISOString();

  // Active High-Priority Traffic Situation Report
  const activeTrafficSitrep: SituationReport & { customCoordinates?: { lat: number; lng: number } } = {
    id: 'SIT-2026-TR01',
    reportNumber: 'SIT-2026-021',
    sourceName: 'Alletha Smit (Beheerkamer)',
    sourcePhone: '018 464 1234',
    sourceType: 'radio',
    timestamp: nowIso,
    location: 'R503 Klerksdorp pad (naby Pzazz / H29)',
    gpsLocation: { latitude: -26.7690, longitude: 26.4420 },
    category: 'road_incident',
    description: 'VERKEERSWAARSKUWING: MVO en ernstige padversperring op R503 rigting Klerksdorp naby Pzazz (H29/H32). Noodreaksie en insleepdienste is op toneel. Pad is gedeeltelik oopgestel vir een-rigting verkeer. Ry asseblief versigtig.',
    notes: 'Bron: Radio & Buurtwag Patrollie | In kennis gestel: SAPS, EMS & Reaksie-eenhede | Status: Pad gedeeltelik heropen',
    status: 'active',
    isPrivate: false,
    createdByUid: 'USR-CTRL-002',
    createdByName: 'Alletha Smit (Beheerkamer)',
    createdAt: nowIso,
    updatedAt: nowIso,
    customCoordinates: { lat: -26.7690, lng: 26.4420 },
  };

  const mappedLogs = ACTUAL_RAW_INCIDENT_LOGS.map((log, index) => {
    let cat: IncidentCategory = 'suspicious_activity';
    const cLower = log.Category.toLowerCase();
    const dLower = log['Issue / Details'].toLowerCase();

    if (cLower.includes('stock theft') || cLower.includes('livestock') || dLower.includes('bees') || dLower.includes('skaap')) {
      cat = 'stock_theft';
    } else if (cLower.includes('crop theft') || cLower.includes('theft') || cLower.includes('burglary') || dLower.includes('mieliediewe') || dLower.includes('koper')) {
      cat = 'theft';
    } else if (cLower.includes('fire') || cLower.includes('smoke') || dLower.includes('brand')) {
      cat = 'fire';
    } else if (
      cLower.includes('accident') ||
      cLower.includes('mvo') ||
      cLower.includes('hazard') ||
      cLower.includes('flood') ||
      cLower.includes('traffic') ||
      cLower.includes('road') ||
      dLower.includes('mvo') ||
      dLower.includes('ongeluk') ||
      dLower.includes('padversperring') ||
      dLower.includes('pad is vol water') ||
      dLower.includes('verkeer')
    ) {
      cat = 'road_incident';
    } else if (cLower.includes('unrest') || cLower.includes('protest') || cLower.includes('disturbance')) {
      cat = 'suspicious_activity';
    }

    // Determine coordinate mapping
    let coords = cameraSectorCoords.default;
    const combinedText = `${log.Location} ${log['Issue / Details']} ${log['VB Number'] || ''}`;

    for (const key of Object.keys(cameraSectorCoords)) {
      if (combinedText.includes(key)) {
        coords = cameraSectorCoords[key];
        break;
      }
    }

    // Fine spatial spread so markers remain distinct on map
    const lat = coords.lat + (Math.sin((index + 1) * 2.3) * 0.007);
    const lng = coords.lng + (Math.cos((index + 1) * 2.3) * 0.007);

    const reportDate = `${log.Date}T${log.Time}:00Z`;
    const vbLabel = log['VB Number'] ? `[${log['VB Number']}] ` : '';

    return {
      id: `sit-vb-${index + 1}`,
      reportNumber: log['VB Number'] ? `${log['VB Number']}` : `SIT-${log.Date.replace(/-/g, '').slice(2)}-${String(index + 1).padStart(3, '0')}`,
      sourceName: log['Person / Reporter'] || 'Alletha Smit (Beheerkamer)',
      sourceType: log['Person / Reporter'].toLowerCase().includes('saps') ? 'radio' : 'phone',
      timestamp: reportDate,
      location: log.Location || 'Hartbeesfontein Beheergebied',
      category: cat,
      description: `${vbLabel}${log['Issue / Details']}`,
      notes: [
        log['Vehicle / Reg'] ? `Voertuig/Reg: ${log['Vehicle / Reg']}` : null,
        log.ContactNotified ? `In kennis gestel: ${log.ContactNotified}` : null,
        log['Record Type'] ? `Bron: ${log['Record Type']}` : null,
      ].filter(Boolean).join(' | '),
      status: 'active',
      isPrivate: false,
      createdByUid: 'USR-CTRL-002',
      createdByName: 'Alletha Smit (Beheerkamer)',
      createdAt: reportDate,
      updatedAt: reportDate,
      customCoordinates: { lat, lng },
      vehicleReg: log['Vehicle / Reg'] || undefined,
    } as SituationReport & { customCoordinates?: { lat: number; lng: number }; vehicleReg?: string };
  });

  return [activeTrafficSitrep, ...mappedLogs];
}
