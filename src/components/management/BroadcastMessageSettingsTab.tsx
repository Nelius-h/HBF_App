import React, { useState } from 'react';
import {
  MessageSquare,
  FileText,
  Sparkles,
  Sliders,
  Copy,
  Check,
  Eye,
  Send,
  AlertTriangle,
  Flame,
  Shield,
  Radio,
  MapPin,
  Clock,
  Phone,
  Key,
  Users,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  formatEmergencyWhatsAppMessage,
  formatBoloWhatsAppMessage,
  formatSitrepWhatsAppMessage,
} from '../../services/whatsappService';

export const BroadcastMessageSettingsTab: React.FC = () => {
  const { language } = useI18n();
  const isAf = language === 'af';
  const { currentUser } = useAuth();
  const { settings, updateSettings, emergencies, bolos, situationReports } = useData();

  const currentConfig = settings.whatsAppConfig || {
    isConfigured: settings.isWhatsAppApiConfigured,
    provider: 'META_CLOUD_API',
    apiUrl: 'https://graph.facebook.com/v20.0',
    phoneNumberId: '109283746195820',
    language: 'BILINGUAL',
    includeGpsMapLink: true,
    includeAccessDetails: true,
    includeFamilyMembers: true,
    includeWaterPoints: true,
    includeFirefightingEquipment: true,
    includeDangerousAnimals: true,
    customHeaderTitle: 'HARTBEESFONTEIN VEILIGHEID / COMMUNITY SAFETY',
    customFooterNote: 'Hartbeesfontein Veiligheid 24/7 Beheerkamer Dispatch • Noodnommer: 082 306 5808',
    autoDispatchEmergency: true,
    autoDispatchBoloAlerts: true,
  };

  const [messageConfig, setMessageConfig] = useState(currentConfig);
  const [selectedTemplateType, setSelectedTemplateType] = useState<
    'EMERGENCY_FARM_ATTACK' | 'EMERGENCY_MEDICAL' | 'EMERGENCY_FIRE' | 'BOLO_VEHICLE' | 'SITREP_DAILY' | 'ALL_CLEAR'
  >('EMERGENCY_FARM_ATTACK');

  const [customHeader, setCustomHeader] = useState(
    messageConfig.customHeaderTitle || 'HARTBEESFONTEIN VEILIGHEID / COMMUNITY SAFETY'
  );
  const [customFooter, setCustomFooter] = useState(
    messageConfig.customFooterNote || 'Hartbeesfontein Veiligheid 24/7 Beheerkamer Dispatch • Noodnommer: 082 306 5808'
  );
  const [safetyNoticeText, setSafetyNoticeText] = useState(
    '⚠️ Bly asseblief binnenshuis met ligte af totdat Reaksie-eenheid op die toneel arriveer. Moenie self konfronteer nie.'
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  // Dynamic placeholders reference list
  const placeholders = [
    { tag: '{farmerName}', desc: isAf ? 'Naam van boer / kliënt' : 'Client / Farmer Name' },
    { tag: '{farmName}', desc: isAf ? 'Plaasnaam & Gedeelte' : 'Farm Name & Portion' },
    { tag: '{sector}', desc: isAf ? 'Sektor / Wyk nommer' : 'Sector / Ward number' },
    { tag: '{emergencyType}', desc: isAf ? 'Noodtipe (bv. Plaasaanval)' : 'Emergency Type (e.g. Farm Attack)' },
    { tag: '{gpsCoordinates}', desc: isAf ? 'Breedtegraad & Lengtegraad' : 'Latitude & Longitude' },
    { tag: '{googleMapsLink}', desc: isAf ? 'Klikbare Google Maps skakel' : 'Clickable Google Maps link' },
    { tag: '{gateCode}', desc: isAf ? 'Sekuriteits Hekkode' : 'Security Gate PIN code' },
    { tag: '{dangerousAnimals}', desc: isAf ? 'Diere waarskuwing' : 'Dangerous animals warning' },
    { tag: '{waterPoints}', desc: isAf ? 'Waterpunte / Damme' : 'Water points / reservoirs' },
    { tag: '{primaryPhone}', desc: isAf ? 'Kliënt se selfoonnommer' : 'Primary phone number' },
    { tag: '{timestamp}', desc: isAf ? 'Tydstip van insident' : 'Activation timestamp' },
    { tag: '{controlRoomContact}', desc: isAf ? 'Beheerkamer noodkontak' : 'Control room emergency hotline' },
  ];

  const handleInsertTag = (tag: string) => {
    setCustomFooter((prev) => `${prev} ${tag}`);
  };

  const handleSaveMessageSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...messageConfig,
      customHeaderTitle: customHeader,
      customFooterNote: customFooter,
    };
    setMessageConfig(updated);
    updateSettings({
      ...settings,
      whatsAppConfig: updated,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Sample data for rendering dynamic preview
  const demoEmergency = emergencies[0] || {
    id: 'EMG-2026-0811',
    clientUid: 'USR-DEMO',
    clientName: 'Kobus van Zyl',
    clientPhone: '+27 82 555 1234',
    secondaryPhone: '+27 83 444 9876',
    farmName: 'Doornkloof Plaas, Gedeelte 2',
    emergencyType: selectedTemplateType === 'EMERGENCY_MEDICAL' ? 'MEDICAL_EMERGENCY' : selectedTemplateType === 'EMERGENCY_FIRE' ? 'WILDFIRE' : 'FARM_ATTACK',
    status: 'ACTION_TAKEN',
    startTime: new Date().toISOString(),
    sector: 'Sektor 3 - Doornkloof',
    location: {
      latitude: -26.7628,
      longitude: 26.4172,
      accuracy: 6,
      quality: 'LIVE_STREAM',
      timestamp: new Date().toISOString(),
    },
    propertySnapshot: {
      farmName: 'Doornkloof Plaas',
      mainGateCode: '8839#',
      dangerousAnimals: '2x Boerboele by hoofhek',
      waterPoints: '50kL Sementdam noord van skuur',
      firefightingEquipment: '1x Bakkie-sakkie gereed in motorhuis',
      accessDifficulties: 'Sinkplaat sandpad na brug',
    },
    familySnapshot: [
      {
        id: 'FAM-01',
        name: 'Elize',
        surname: 'van Zyl',
        relationship: 'Egtgenote / Spouse',
        phone: '+27 82 777 6655',
      },
    ],
  };

  const demoBolo = bolos[0] || {
    id: 'BOLO-2026-019',
    title: 'Suspicious Silver Isuzu D-Max',
    category: 'SUSPICIOUS_VEHICLE',
    priority: 'URGENT',
    status: 'ACTIVE',
    vehiclePlate: 'NW 912834',
    vehicleMakeModel: 'Isuzu D-Max 3.0 Ddi',
    vehicleColor: 'Silwer / Silver',
    suspectDescription: '4 Onbekende mans met flitse by plaasingang',
    lastSeenLocation: 'R503 naby Brakspruit ingang',
    description: 'Voertuig stop by plaashekke en probeer slotte toets.',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    reportedBy: 'Gert Botha',
  };

  // Generate rendered preview text
  const generatePreviewContent = (): string => {
    if (selectedTemplateType === 'BOLO_VEHICLE') {
      return formatBoloWhatsAppMessage(demoBolo as any, {
        customFooter: customFooter,
      });
    }

    if (selectedTemplateType === 'SITREP_DAILY') {
      return `📋 *${customHeader}*\n*DAGLIKSE SITUASIEVERSLAG (SITREP)*\n\n` +
        `📅 *Datum:* ${new Date().toLocaleDateString('en-ZA')}\n` +
        `🚨 *Aktiewe Insidente:* ${emergencies.filter((e) => e.status !== 'RESOLVED').length}\n` +
        `🚗 *Aktiewe BOLOs:* ${bolos.filter((b) => b.status === 'ACTIVE').length}\n` +
        `🛡️ *Patrollie Eenhede Uit:* 4 Voertuie / 8 Responders\n` +
        `📡 *Status:* Alle sektore stabiel en gemonitor.\n\n` +
        `_${customFooter}_`;
    }

    if (selectedTemplateType === 'ALL_CLEAR') {
      return `🟢 *${customHeader}*\n*ALLES VEILIG / ALL CLEAR VERKLARING*\n\n` +
        `📍 *Plaas / Area:* ${demoEmergency.farmName}\n` +
        `⏰ *Tydstip:* ${new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}\n` +
        `👮 *Reaksie Status:* Toneel beveilig deur Plaaswag & SAPS.\n` +
        `ℹ️ *Boodskap:* Die situasie is onder beheer. Inwoners kan normale aktiwiteite hervat.\n\n` +
        `_${customFooter}_`;
    }

    return formatEmergencyWhatsAppMessage(demoEmergency as any, 'Reaksie-eenheid', {
      includeGpsLink: messageConfig.includeGpsMapLink,
      includeAccessDetails: messageConfig.includeAccessDetails,
      includeFamilyMembers: messageConfig.includeFamilyMembers !== false,
      language: messageConfig.language,
      customFooter: customFooter,
    });
  };

  const previewText = generatePreviewContent();

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewText);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2500);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>{isAf ? 'Uitsending Boodskapinstellings & Formate' : 'Broadcast Message Settings & Templates'}</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold px-2 py-0.5 rounded-full uppercase">
                DYNAMIC TEMPLATES
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAf
                ? 'Stel die presiese teksstruktuur, veiligheidswaarskuwings, GPS-skakels en tweetalige formatering in vir outomatiese WhatsApp-uitsendings.'
                : 'Configure automated WhatsApp dispatch wording, safety guidelines, GPS deep links, and bilingual templates for immediate community broadcasts.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveMessageSettings}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition self-stretch sm:self-auto justify-center"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? (isAf ? 'Gestoor!' : 'Saved!') : isAf ? 'Stoor Boodskapinstellings' : 'Save Message Settings'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2 font-bold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{isAf ? 'Boodskap sjablone en formatering suksesvol opgedateer!' : 'Broadcast message templates successfully saved!'}</span>
        </div>
      )}

      {/* Main 2-Column Workspace: Form Controls Left, Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Options & Formatting Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Language & Phrasing Preference */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAf ? 'Taalvoorkeur vir Uitsendings' : 'Broadcast Language & Phrasing'}</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'BILINGUAL', label: 'Tweetalig (Bilingual)', desc: 'Afrikaans / English' },
                { id: 'AFRIKAANS', label: 'Afrikaans Slegs', desc: 'Plaaslike gemeenskap' },
                { id: 'ENGLISH', label: 'English Only', desc: 'Standard English' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setMessageConfig({ ...messageConfig, language: lang.id as any })}
                  className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                    messageConfig.language === lang.id
                      ? 'bg-amber-600/20 border-amber-500 text-white font-bold shadow-lg shadow-amber-600/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs">{lang.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{lang.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Content Inclusions Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>{isAf ? 'Inhoud & Data Insluitings' : 'Message Content Inclusions'}</span>
            </h4>
            <p className="text-slate-400 text-xs">
              {isAf
                ? 'Bepaal watter kritieke plaasdata outomaties in die WhatsApp-boodskap ingesluit word:'
                : 'Select property and safety details automatically injected into dispatched alerts:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={messageConfig.includeGpsMapLink}
                  onChange={(e) => setMessageConfig({ ...messageConfig, includeGpsMapLink: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Google Maps & GPS Link</span>
                  <span className="text-[10px] text-slate-400">1-Klik navigasie vir reaksievoertuie</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={messageConfig.includeAccessDetails}
                  onChange={(e) => setMessageConfig({ ...messageConfig, includeAccessDetails: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Hekkode & Toegang</span>
                  <span className="text-[10px] text-slate-400">Plaashek PIN en sandpad notas</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={messageConfig.includeFamilyMembers !== false}
                  onChange={(e) => setMessageConfig({ ...messageConfig, includeFamilyMembers: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Gesinslede & Kontakte</span>
                  <span className="text-[10px] text-slate-400">Noodkontaknommers van familie op plaas</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={messageConfig.includeDangerousAnimals !== false}
                  onChange={(e) => setMessageConfig({ ...messageConfig, includeDangerousAnimals: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-white block">Gevaarlike Diere Waarskuwing</span>
                  <span className="text-[10px] text-slate-400">bv. Boerboele, bulle of skietbaan</span>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Header, Footer & Legal Disclaimer Customization */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{isAf ? 'Opskrif, Voetskrif & Disclaimers' : 'Header, Footer & Disclaimer Customization'}</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAf ? 'Boodskap Opskrif / Banner Titel:' : 'Broadcast Header Banner Title:'}
                </label>
                <input
                  type="text"
                  value={customHeader}
                  onChange={(e) => setCustomHeader(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="HARTBEESFONTEIN VEILIGHEID / COMMUNITY SAFETY"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAf ? 'Voetskrif & Noodnommer Disclaimer:' : 'Footer Note & Emergency Hotline Disclaimer:'}
                </label>
                <textarea
                  rows={2}
                  value={customFooter}
                  onChange={(e) => setCustomFooter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Hartbeesfontein Veiligheid 24/7 Beheerkamer Dispatch • Noodnommer: 082 306 5808"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAf ? 'Standaard Veiligheidsinstruksie vir Inwoners:' : 'Default Community Safety Instruction Note:'}
                </label>
                <textarea
                  rows={2}
                  value={safetyNoticeText}
                  onChange={(e) => setSafetyNoticeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Dynamic Placeholders Tag Box */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                {isAf ? 'Klik om plekhouer-veranderlike in te voeg:' : 'Click to insert dynamic placeholder tag:'}
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                {placeholders.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    title={item.desc}
                    className="bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 px-2 py-1 rounded-lg text-[10px] font-mono transition flex items-center gap-1"
                  >
                    <span>{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Message Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-white text-xs">
                    {isAf ? 'Regstreekse WhatsApp Voorskou' : 'Live WhatsApp Broadcast Preview'}
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    WYSIWYG FORMATTER
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyPreview}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition"
                title="Kopieer teks / Copy text"
              >
                {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPreview ? (isAf ? 'Gekopieer!' : 'Copied!') : isAf ? 'Kopieer' : 'Copy'}</span>
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="py-3 flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'EMERGENCY_FARM_ATTACK', label: '🚨 Plaasaanval / Attack' },
                { id: 'EMERGENCY_MEDICAL', label: '🚑 Medies / Medical' },
                { id: 'EMERGENCY_FIRE', label: '🔥 Veldbrand / Fire' },
                { id: 'BOLO_VEHICLE', label: '🚗 BOLO Voertuig' },
                { id: 'SITREP_DAILY', label: '📋 Daaglikse SITREP' },
                { id: 'ALL_CLEAR', label: '🟢 Alles Veilig' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedTemplateType(pill.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                    selectedTemplateType === pill.id
                      ? 'bg-emerald-600 text-white font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* WhatsApp Chat Balloon Bubble Mockup */}
            <div className="flex-1 bg-[#0b141a] rounded-2xl p-3 border border-slate-800 flex flex-col justify-between shadow-inner overflow-hidden min-h-[340px]">
              <div className="bg-[#1f2c34] text-slate-100 rounded-2xl rounded-tl-sm p-3.5 text-xs font-sans whitespace-pre-wrap leading-relaxed shadow-md border border-slate-700/40 select-all overflow-y-auto max-h-[380px]">
                {previewText}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  WhatsApp Formatting Ready
                </span>
                <span>{previewText.length} karakters</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
