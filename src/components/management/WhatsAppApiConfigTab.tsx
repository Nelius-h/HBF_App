import React, { useState } from 'react';
import {
  MessageSquare,
  Key,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Phone,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
  Settings,
  Layers,
  Terminal,
  HelpCircle,
  FileCheck,
  Save,
  Check,
  Users,
  Clock,
  Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { WhatsAppApiSettings, WhatsAppProviderType, WhatsAppMessageRecord } from '../../types';
import {
  formatEmergencyWhatsAppMessage,
  formatBoloWhatsAppMessage,
  testWhatsAppApiConnection,
  WhatsAppTestResult,
  generateManualWhatsAppUrl,
} from '../../services/whatsappService';
import { AreaGroupsManagementTab } from './AreaGroupsManagementTab';

export const WhatsAppApiConfigTab: React.FC = () => {
  const { settings, updateSettings, emergencies, bolos } = useData();

  // Local config form state
  const initialConfig: WhatsAppApiSettings = settings.whatsAppConfig || {
    isConfigured: settings.isWhatsAppApiConfigured,
    provider: 'META_CLOUD_API',
    apiUrl: 'https://graph.facebook.com/v20.0',
    phoneNumberId: '109283746195820',
    wabaId: '192837461829011',
    accessToken: 'EAAO...HBV_SECURE_TOKEN',
    webhookVerificationToken: 'hbv_wa_verify_2026',
    defaultReactionGroupNumber: '+27823065808',
    secondaryPoliceWhatsApp: '+27184310300',
    autoDispatchEmergency: true,
    autoDispatchBoloAlerts: true,
    includeGpsMapLink: true,
    includeAccessDetails: true,
    language: 'BILINGUAL',
    customFooterNote: 'Hartbeesfontein Veiligheid 24/7 Beheerkamer Dispatch',
  };

  const [config, setConfig] = useState<WhatsAppApiSettings>(initialConfig);
  const [showToken, setShowToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Test Console State
  const [testPhone, setTestPhone] = useState('+27823065808');
  const [testPreset, setTestPreset] = useState<'PING' | 'EMERGENCY' | 'BOLO' | 'CUSTOM'>('EMERGENCY');
  const [customTestMessage, setCustomTestMessage] = useState(
    '🚨 *HARTBEESFONTEIN TOETS*: Stelselverbinding met WhatsApp Cloud API suksesvol getoets.'
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<WhatsAppTestResult | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'CONFIG' | 'GROUPS' | 'TESTER' | 'PREVIEWS' | 'LOGS' | 'SETUP_GUIDE'>('CONFIG');

  const sampleEmergency = emergencies[0] || {
    id: 'EMG-DEMO-001',
    clientUid: 'USR-001',
    clientName: 'Johan van der Merwe',
    clientPhone: '+27 82 123 4567',
    secondaryPhone: '+27 83 987 6543',
    farmName: 'Rietfontein Plaas, Gedeelte 4',
    emergencyType: 'FARM_ATTACK',
    status: 'ACTION_TAKEN',
    startTime: new Date().toISOString(),
    location: {
      latitude: -26.7643,
      longitude: 26.3982,
      accuracy: 8,
      quality: 'LIVE_STREAM',
      timestamp: new Date().toISOString(),
    },
    propertySnapshot: {
      farmName: 'Rietfontein Plaas',
      mainGateCode: '7741#',
      dangerousAnimals: '2x Boerboele by werf, skietbaan agter kraal',
      waterPoints: 'Sementdam by hoofhuis, 10,000L tenk',
      firefightingEquipment: '1x Bakkie sakkie gereed in stoor',
      accessDifficulties: 'Sinkplaat sandpad, swak selfoonsein by laagwaterbrug',
    },
    familySnapshot: [
      {
        id: 'FAM-01',
        name: 'Martie',
        surname: 'van der Merwe',
        relationship: 'Egtgenote / Spouse',
        phone: '+27 82 991 3342',
        emergencyNotes: 'Primary home contact',
        healthInfo: 'Diabetic - Insulien in kombuiskas',
      },
      {
        id: 'FAM-02',
        name: 'Pieter',
        surname: 'van der Merwe',
        relationship: 'Seun / Son (Farm Manager)',
        phone: '+27 71 884 1029',
        emergencyNotes: 'Equipped with 2-way radio',
      },
    ],
    whatsappLogs: [],
    timeline: [],
  };

  const sampleBolo = bolos[0] || {
    id: 'BOLO-2026-001',
    title: 'Suspicious White Toyota Hilux Double Cab',
    category: 'SUSPICIOUS_VEHICLE',
    priority: 'URGENT',
    status: 'ACTIVE',
    vehiclePlate: 'NW 847291',
    vehicleMakeModel: 'Toyota Hilux 2.8 GD-6',
    vehicleColor: 'Wit (White)',
    suspectDescription: '3 Mans in donker klere en weerkaatsende baadjies',
    lastSeenLocation: 'R503 kruising naby Hartbeesfontein Graansilo',
    description: 'Voertuig beweeg stadig tussen plaasingange en neem fotos van hekke.',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    reportedBy: 'Kobus Eloff',
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isReady = config.isConfigured && Boolean(config.phoneNumberId);
    updateSettings({
      ...settings,
      isWhatsAppApiConfigured: isReady,
      whatsAppConfig: config,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    let messageBody = customTestMessage;
    if (testPreset === 'EMERGENCY') {
      messageBody = formatEmergencyWhatsAppMessage(sampleEmergency as any, 'Reaction Unit', {
        includeGpsLink: config.includeGpsMapLink,
        includeAccessDetails: config.includeAccessDetails,
        includeFamilyMembers: config.includeFamilyMembers !== false,
        language: config.language,
        customFooter: config.customFooterNote,
      });
    } else if (testPreset === 'BOLO') {
      messageBody = formatBoloWhatsAppMessage(sampleBolo as any, {
        customFooter: config.customFooterNote,
      });
    } else if (testPreset === 'PING') {
      messageBody = `✅ *HARTBEESFONTEIN VEILIGHEID - API CONNECTIVITY PING*\n\n` +
        `• Tyd: ${new Date().toLocaleString('en-ZA')}\n` +
        `• Gateway: ${config.provider}\n` +
        `• Sender Phone ID: ${config.phoneNumberId}\n` +
        `• Status: Koppelvlak aktief en geverifieer.\n\n` +
        `_${config.customFooterNote || 'Hartbeesfontein Veiligheid Beheerkamer'}_`;
    }

    try {
      const result = await testWhatsAppApiConnection(config, testPhone, messageBody);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        recipient: testPhone,
        error: err?.message || 'Test execution failed',
        diagnostics: [`[EXCEPTION] ${err?.message}`],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Collect all WhatsApp logs from recent emergencies
  const allWhatsAppLogs: { log: WhatsAppMessageRecord; emergencyId: string; farmName: string }[] = [];
  emergencies.forEach((emg) => {
    (emg.whatsappLogs || []).forEach((log) => {
      allWhatsAppLogs.push({
        log,
        emergencyId: emg.id,
        farmName: emg.farmName,
      });
    });
  });

  return (
    <div className="space-y-4">
      {/* Top Banner & Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  WhatsApp Business Cloud API &amp; Dispatch Gateway
                </h3>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black uppercase flex items-center gap-1.5 ${
                    config.isConfigured
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                      : 'bg-amber-950 text-amber-300 border border-amber-700/80'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.isConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  {config.isConfigured ? `${config.provider}` : 'MANUAL FALLBACK ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure automated WhatsApp Cloud dispatching to Farm Watch Reaction Units, SAPS Police, Medical Responders, and Management.
              </p>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setActiveSubTab('TESTER')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Send Test Alert</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Settings Saved!' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex bg-slate-950/70 border border-slate-800 rounded-xl p-1 mt-4 gap-1 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('CONFIG')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'CONFIG'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gateway Credentials &amp; Rules</span>
          </button>
          <button
            onClick={() => setActiveSubTab('GROUPS')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'GROUPS'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Uitsending &amp; Sektor Groepe (Broadcast Groups)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('TESTER')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'TESTER'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live API Tester &amp; Diagnostics</span>
          </button>
          <button
            onClick={() => setActiveSubTab('PREVIEWS')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'PREVIEWS'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Message Templates &amp; Preview</span>
          </button>
          <button
            onClick={() => setActiveSubTab('LOGS')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'LOGS'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Delivery Logs ({allWhatsAppLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('SETUP_GUIDE')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              activeSubTab === 'SETUP_GUIDE'
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Meta Setup Guide</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB: GROUPS & BROADCAST CHANNELS */}
      {activeSubTab === 'GROUPS' && (
        <AreaGroupsManagementTab />
      )}

      {/* SUB-TAB 1: CONFIGURATION & CREDENTIALS */}
      {activeSubTab === 'CONFIG' && (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Provider Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>1. Gateway Integration Mode</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'META_CLOUD_API',
                  title: 'Meta Cloud API (Official)',
                  desc: 'Direct integration with Meta WhatsApp Business Cloud Graph API v20.0.',
                  badge: 'Recommended for Live Production',
                  badgeColor: 'text-emerald-300 border-emerald-700 bg-emerald-950',
                },
                {
                  id: 'SIMULATED_SANDBOX',
                  title: 'Sandbox Simulator',
                  desc: 'Simulates API dispatch, payloads, and delivery confirmations without API keys.',
                  badge: 'Ideal for Drills & Demos',
                  badgeColor: 'text-blue-300 border-blue-700 bg-blue-950',
                },
                {
                  id: 'CUSTOM_GATEWAY',
                  title: 'Custom Webhook / Proxy',
                  desc: 'Forward dispatch payloads to a secure enterprise Node/Python proxy.',
                  badge: 'Enterprise Proxy',
                  badgeColor: 'text-purple-300 border-purple-700 bg-purple-950',
                },
                {
                  id: 'MANUAL_ONLY',
                  title: 'Manual Web Fallback',
                  desc: 'Operators click instant 1-click wa.me links to send preformatted messages.',
                  badge: 'Zero API Dependency',
                  badgeColor: 'text-amber-300 border-amber-700 bg-amber-950',
                },
              ].map((prov) => {
                const isSelected = config.provider === prov.id;
                return (
                  <div
                    key={prov.id}
                    onClick={() => setConfig({ ...config, provider: prov.id as WhatsAppProviderType })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-xs">{prov.title}</span>
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => setConfig({ ...config, provider: prov.id as WhatsAppProviderType })}
                          className="text-emerald-500 focus:ring-0"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{prov.desc}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border self-start ${prov.badgeColor}`}>
                      {prov.badge}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Master Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isConfigured}
                  onChange={(e) => setConfig({ ...config, isConfigured: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-white font-bold">
                  Enable Automated WhatsApp API Dispatch
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                {config.isConfigured ? 'Automated dispatch will run during emergencies.' : 'System will generate manual fallback links.'}
              </span>
            </div>
          </div>

          {/* Credentials & Endpoint Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>2. Meta WhatsApp Cloud API Credentials</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  WhatsApp Phone Number ID (Sender ID) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.phoneNumberId}
                    onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                    placeholder="e.g. 109283746195820"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(config.phoneNumberId, 'phoneId')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {copiedField === 'phoneId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Found in Meta App Dashboard → WhatsApp → API Setup → Phone number ID
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.wabaId || ''}
                    onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
                    placeholder="e.g. 192837461829011"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(config.wabaId || '', 'wabaId')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {copiedField === 'wabaId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Identifies your registered WhatsApp Business Manager portfolio
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Meta Graph API Endpoint URL
                </label>
                <input
                  type="text"
                  value={config.apiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  placeholder="https://graph.facebook.com/v20.0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Default: <code className="text-emerald-300">https://graph.facebook.com/v20.0</code>
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Webhook Verification Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.webhookVerificationToken || ''}
                    onChange={(e) => setConfig({ ...config, webhookVerificationToken: e.target.value })}
                    placeholder="e.g. hbv_wa_verify_2026"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(config.webhookVerificationToken || '', 'webhookToken')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {copiedField === 'webhookToken' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Configured in Meta App Webhook Subscription for delivery tracking
                </span>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">
                    Meta Cloud API Permanent Access Token (System User Token) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                  >
                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showToken ? 'Hide Secret' : 'Reveal Token'}</span>
                  </button>
                </div>
                <input
                  type={showToken ? 'text' : 'password'}
                  value={config.accessToken || ''}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  placeholder="EAABw..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Use a permanent Meta System User token with <code className="text-emerald-300">whatsapp_business_messaging</code> and <code className="text-emerald-300">whatsapp_business_management</code> scopes.
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Dispatch & Routing Rules */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>3. Automated Routing &amp; Payload Options</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Default Reaction Force WhatsApp Contact / Group Number *
                </label>
                <input
                  type="text"
                  value={config.defaultReactionGroupNumber || ''}
                  onChange={(e) => setConfig({ ...config, defaultReactionGroupNumber: e.target.value })}
                  placeholder="+27832908812"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Primary target for urgent farm watch reaction unit dispatches
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Secondary Police / SAPS WhatsApp Dispatch Channel
                </label>
                <input
                  type="text"
                  value={config.secondaryPoliceWhatsApp || ''}
                  onChange={(e) => setConfig({ ...config, secondaryPoliceWhatsApp: e.target.value })}
                  placeholder="+27184310300"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Designated SAPS sector station emergency contact
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Message Language &amp; Formatting
                </label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="BILINGUAL">Bilingual (Afrikaans &amp; English)</option>
                  <option value="AFRIKAANS">Afrikaans (Slegs Afrikaans)</option>
                  <option value="ENGLISH">English (English Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom WhatsApp Message Footer Signature
                </label>
                <input
                  type="text"
                  value={config.customFooterNote || ''}
                  onChange={(e) => setConfig({ ...config, customFooterNote: e.target.value })}
                  placeholder="Hartbeesfontein Veiligheid 24/7 Beheerkamer Dispatch"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoDispatchEmergency}
                  onChange={(e) => setConfig({ ...config, autoDispatchEmergency: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <div>
                  <span className="text-white font-bold block">Auto-Dispatch on Emergency SOS</span>
                  <span className="text-[10px] text-slate-400 block">
                    Instantly transmits WhatsApp alert to Reaction Force upon SOS confirmation
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoDispatchBoloAlerts}
                  onChange={(e) => setConfig({ ...config, autoDispatchBoloAlerts: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <div>
                  <span className="text-white font-bold block">Auto-Broadcast Urgent BOLO Alerts</span>
                  <span className="text-[10px] text-slate-400 block">
                    Sends suspicious vehicle &amp; suspect descriptions directly to group
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeGpsMapLink}
                  onChange={(e) => setConfig({ ...config, includeGpsMapLink: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <div>
                  <span className="text-white font-bold block">Include GPS Navigation &amp; Google Map Link</span>
                  <span className="text-[10px] text-slate-400 block">
                    Responders tap link directly to navigate via Google Maps / Waze
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeAccessDetails}
                  onChange={(e) => setConfig({ ...config, includeAccessDetails: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <div>
                  <span className="text-white font-bold block">Include Emergency Gate Code &amp; Warnings</span>
                  <span className="text-[10px] text-slate-400 block">
                    Injects farm gate code, dangerous animals warning, and water points
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeFamilyMembers !== false}
                  onChange={(e) => setConfig({ ...config, includeFamilyMembers: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <div>
                  <span className="text-white font-bold block">Include Family Members &amp; Contact Numbers</span>
                  <span className="text-[10px] text-slate-400 block">
                    Automatically bundles spouse, children, farm managers &amp; their phone numbers to reaction force
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Saved & Applied!' : 'Save & Activate Configuration'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: INTERACTIVE LIVE TESTER & DIAGNOSTICS */}
      {activeSubTab === 'TESTER' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Cloud API Test Console</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  Transmit an authentic WhatsApp test payload to verify phone number ID, authentication token, and recipient delivery.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                Mode: <strong className="text-emerald-400">{config.provider}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Recipient Test Phone Number (with Country Code) *
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+27821234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Test Payload Preset
                </label>
                <select
                  value={testPreset}
                  onChange={(e) => setTestPreset(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="EMERGENCY">🚨 Live Emergency Dispatch Notice</option>
                  <option value="BOLO">📢 Urgent BOLO / Vehicle Alert</option>
                  <option value="PING">✅ Simple Connectivity Ping</option>
                  <option value="CUSTOM">✍️ Custom Message Content</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Send className="w-4 h-4 text-slate-950" />}
                  <span>{isTesting ? 'Transmitting API Call...' : 'Execute WhatsApp API Call'}</span>
                </button>
              </div>
            </div>

            {testPreset === 'CUSTOM' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Custom Test Message Body:
                </label>
                <textarea
                  value={customTestMessage}
                  onChange={(e) => setCustomTestMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>
            )}

            {/* Quick 1-Click Manual WhatsApp Web Link */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Want to test standard browser/app dispatch?
              </span>
              <a
                href={generateManualWhatsAppUrl(
                  testPhone,
                  testPreset === 'EMERGENCY'
                    ? formatEmergencyWhatsAppMessage(sampleEmergency as any, 'Reaction Unit')
                    : customTestMessage
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <span>Launch in WhatsApp Web / App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Test Execution Output & Diagnostics */}
          {testResult && (
            <div
              className={`rounded-2xl p-5 border text-xs space-y-3 shadow-lg ${
                testResult.success
                  ? 'bg-emerald-950/20 border-emerald-500/60'
                  : 'bg-red-950/20 border-red-500/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <h4 className="font-bold text-white text-sm">
                    {testResult.success ? 'WhatsApp API Call Succeeded' : 'WhatsApp API Call Failed'}
                  </h4>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  {testResult.httpStatus && (
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        testResult.success
                          ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                          : 'bg-red-900/80 text-red-200 border border-red-700'
                      }`}
                    >
                      HTTP {testResult.httpStatus}
                    </span>
                  )}
                  {testResult.providerMessageId && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      ID: {testResult.providerMessageId}
                    </span>
                  )}
                </div>
              </div>

              {testResult.error && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs font-mono">
                  <strong>Error Message:</strong> {testResult.error}
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                  Execution Trace &amp; Diagnostic Logs:
                </label>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                  {testResult.diagnostics.map((d, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {d}
                    </div>
                  ))}
                </div>
              </div>

              {testResult.sentPayload && (
                <div>
                  <label className="block text-slate-400 font-bold mb-1 text-[11px]">
                    Raw Provider Response JSON:
                  </label>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-300 overflow-x-auto max-h-40">
                    {JSON.stringify(testResult.sentPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: MESSAGE TEMPLATES & LIVE CHAT PREVIEW */}
      {activeSubTab === 'PREVIEWS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Template Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Standard WhatsApp Dispatch Templates</span>
            </h4>
            <p className="text-xs text-slate-400">
              Templates conform to Meta WhatsApp Business message guidelines with Markdown formatting and clickable deep links.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">1. Emergency Reaction Force Dispatch</span>
                  <span className="text-[10px] font-mono text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800">HIGH PRIORITY</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Transmitted to armed reaction units and patrol bakkies with gate codes, coordinates, and hazard warnings.
                </p>
              </div>

              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">2. Urgent BOLO &amp; Vehicle Broadcast</span>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">SECURITY BROADCAST</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Pushed to sector farm watch channels with vehicle registration, color, and last seen coordinates.
                </p>
              </div>

              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">3. Daily Situation Report (SITREP)</span>
                  <span className="text-[10px] font-mono text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">DAILY DIGEST</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Executive daily safety summary for management and community committee.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Live WhatsApp Chat Bubble Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-slate-950 flex items-center justify-center font-black text-xs">
                  HBV
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Hartbeesfontein Veiligheid</span>
                  <span className="text-[10px] text-emerald-400 block">WhatsApp Official Business Account</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Preview</span>
            </div>

            {/* Chat Canvas */}
            <div className="bg-[#0b141a] rounded-xl p-4 border border-slate-800 min-h-[380px] flex flex-col justify-end">
              <div className="bg-[#005c4b] text-[#e9edef] p-3.5 rounded-2xl rounded-tr-none shadow-md text-xs font-sans max-w-[90%] self-end space-y-2 border border-emerald-700/40">
                <div className="whitespace-pre-wrap leading-relaxed text-[11px] font-mono">
                  {formatEmergencyWhatsAppMessage(sampleEmergency as any, 'Reaction Unit', {
                    includeGpsLink: config.includeGpsMapLink,
                    includeAccessDetails: config.includeAccessDetails,
                    includeFamilyMembers: config.includeFamilyMembers !== false,
                    language: config.language,
                    customFooter: config.customFooterNote,
                  })}
                </div>
                <div className="flex items-center justify-end gap-1 text-[9px] text-[#8696a0] pt-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RECENT WHATSAPP LOGS & DISPATCH QUEUE */}
      {activeSubTab === 'LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Transmission History &amp; Delivery Receipts</span>
              </h4>
              <p className="text-slate-400 text-xs">
                Real-time delivery verification across all active and historical incidents.
              </p>
            </div>

            <span className="text-xs font-mono text-emerald-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
              Total Records: {allWhatsAppLogs.length}
            </span>
          </div>

          {allWhatsAppLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <p>No automated WhatsApp notifications dispatched yet.</p>
              <button
                onClick={() => setActiveSubTab('TESTER')}
                className="text-emerald-400 hover:text-emerald-300 font-bold"
              >
                Send a test notification from the API Tester →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {allWhatsAppLogs.map(({ log, emergencyId, farmName }, idx) => (
                <div
                  key={`${log.id || 'wa-log'}-${idx}-${emergencyId}`}
                  className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{log.recipientName}</span>
                      <span className="font-mono text-emerald-300 text-[11px]">{log.recipient}</span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          log.sendStatus === 'SENT' || log.sendStatus === 'DELIVERED' || log.sendStatus === 'READ'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.sendStatus === 'REQUIRES_CONFIGURATION'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {log.sendStatus}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: #{emergencyId} ({farmName})
                      </span>
                      {log.requestedTimestamp && (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-slate-500" />
                          <span>{new Date(log.requestedTimestamp).toLocaleDateString('en-ZA')} {new Date(log.requestedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                      {log.content.replace(/\n/g, ' ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                    <a
                      href={generateManualWhatsAppUrl(log.recipient, log.content)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>WhatsApp Link</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: META SETUP GUIDE */}
      {activeSubTab === 'SETUP_GUIDE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Step-by-Step Meta WhatsApp Cloud API Setup Guide</span>
            </h4>
            <p className="text-slate-400 text-xs">
              Follow these simple steps to obtain your live Meta credentials in under 10 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 flex items-center justify-center text-[10px]">1</span>
                <span>Create Meta Developers Account &amp; App</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                1. Visit <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">developers.facebook.com</a> and sign in.
                <br />2. Click <strong>My Apps → Create App</strong>.
                <br />3. Select <strong>Other → Business</strong> as the app type.
                <br />4. Name the app <em>Hartbeesfontein Safety Dispatch</em>.
              </p>
            </div>

            <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 flex items-center justify-center text-[10px]">2</span>
                <span>Add WhatsApp Product &amp; Copy Phone Number ID</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                1. In your App Dashboard, scroll to <strong>Add products to your app</strong> and select <strong>WhatsApp</strong>.
                <br />2. Under <strong>API Setup</strong>, copy the <strong>Phone number ID</strong> and paste it into the <em>Phone Number ID</em> field here.
              </p>
            </div>

            <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 flex items-center justify-center text-[10px]">3</span>
                <span>Generate Permanent System User Token</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                1. Go to <strong>Meta Business Suite → Business Settings → Users → System Users</strong>.
                <br />2. Create an admin System User (e.g. <em>HBV-Dispatch-Bot</em>).
                <br />3. Click <strong>Generate New Token</strong>, select your app, and grant <code className="text-emerald-300">whatsapp_business_messaging</code> permissions.
                <br />4. Copy the permanent token into this configuration console.
              </p>
            </div>

            <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 flex items-center justify-center text-[10px]">4</span>
                <span>Configure Webhooks for Delivery Receipts</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                1. In the WhatsApp product menu, click <strong>Configuration → Webhook</strong>.
                <br />2. Set Verify Token to <code className="text-emerald-300">{config.webhookVerificationToken || 'hbv_wa_verify_2026'}</code>.
                <br />3. Subscribe to the <code className="text-emerald-300">messages</code> field for real-time sent/delivered/read receipts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
