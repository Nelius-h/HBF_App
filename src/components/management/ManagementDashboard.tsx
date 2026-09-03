import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Activity,
  HardDrive,
  Users,
  GraduationCap,
  PhoneCall,
  Building,
  Sliders,
  CheckCircle,
  Save,
  MessageSquare,
  Layers,
  Sun,
  Moon,
  Monitor,
  Palette,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { SystemSettings } from '../../types';

// Tab Components
import { ExecutiveOperationsDashboard } from './ExecutiveOperationsDashboard';
import { MapLayerManager } from './MapLayerManager';
import { ManagementReportsView } from './ManagementReportsView';
import { SystemHealthMonitoringTab } from './SystemHealthMonitoringTab';
import { BackupDisasterRecoveryTab } from './BackupDisasterRecoveryTab';
import { UserSecurityPrivacyTab } from './UserSecurityPrivacyTab';
import { TestTrainingSuiteTab } from './TestTrainingSuiteTab';
import { EmergencyContactsTab } from './EmergencyContactsTab';
import { AreaGroupsManagementTab } from './AreaGroupsManagementTab';
import { WhatsAppApiConfigTab } from './WhatsAppApiConfigTab';
import { DataStorageSettingsTab } from './DataStorageSettingsTab';
import { ViewSettingsTab } from './ViewSettingsTab';

export const ManagementDashboard: React.FC = () => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { settings, updateSettings, emergencies, trainingMode } = useData();
  const { themeMode, setThemeMode, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'MAP_LAYERS' | 'REPORTS' | 'HEALTH' | 'BACKUP_DR' | 'USER_PRIVACY' | 'TRAINING_GOLIVE' | 'CONTACTS' | 'GROUPS' | 'WHATSAPP_API' | 'SETTINGS' | 'VIEW'
  >('OVERVIEW');

  // Settings form state
  const [phoneSettings, setPhoneSettings] = useState<SystemSettings>(settings);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const activeEmergenciesCount = emergencies.filter(
    (e) => e.status !== 'SAFE' && e.status !== 'FALSE_ALARM' && e.status !== 'CLOSED' && !e.isTraining
  ).length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(phoneSettings);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 py-4 space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                {t.management.title}
              </h2>
              {trainingMode.enabled && (
                <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  TRAINING MODE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Executive Oversight, Hardened Reliability, POPIA Compliance & Production DR
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          Executive: {currentUser.name} {currentUser.surname}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex bg-slate-900 rounded-2xl p-1.5 border border-slate-800 text-xs font-semibold overflow-x-auto scrollbar-none gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Operations Center</span>
          {activeEmergenciesCount > 0 && (
            <span className="bg-red-500 text-white font-mono px-1.5 py-0.2 rounded-full text-[10px] animate-pulse">
              {activeEmergenciesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('MAP_LAYERS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'MAP_LAYERS'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>KML Map Layers</span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'REPORTS'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('HEALTH')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'HEALTH'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Health & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKUP_DR')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'BACKUP_DR'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Backups & DR</span>
        </button>

        <button
          onClick={() => setActiveTab('USER_PRIVACY')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'USER_PRIVACY'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & POPIA Privacy</span>
        </button>

        <button
          onClick={() => setActiveTab('TRAINING_GOLIVE')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'TRAINING_GOLIVE'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Drills & Go-Live (7/7)</span>
        </button>

        <button
          onClick={() => setActiveTab('CONTACTS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'CONTACTS'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Emergency Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('GROUPS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'GROUPS'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Area Sectors</span>
        </button>

        <button
          onClick={() => setActiveTab('WHATSAPP_API')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'WHATSAPP_API'
              ? 'bg-emerald-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp Cloud API</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveTab('VIEW')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'VIEW'
              ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Palette className="w-4 h-4 text-purple-300" />
          <span>View (Voorkoms &amp; Styl)</span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'SETTINGS'
              ? 'bg-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Dispatch Settings</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OPERATIONS DASHBOARD */}
      {activeTab === 'OVERVIEW' && (
        <ExecutiveOperationsDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
      )}

      {/* TAB 1.5: OPERATIONAL KML MAP LAYERS */}
      {activeTab === 'MAP_LAYERS' && <MapLayerManager />}

      {/* TAB 2: MANAGEMENT REPORTS & ANALYTICS */}
      {activeTab === 'REPORTS' && <ManagementReportsView />}

      {/* TAB 3: SYSTEM HEALTH & TELEMETRY */}
      {activeTab === 'HEALTH' && <SystemHealthMonitoringTab />}

      {/* TAB 4: BACKUPS & DISASTER RECOVERY */}
      {activeTab === 'BACKUP_DR' && <BackupDisasterRecoveryTab />}

      {/* TAB 5: USERS & POPIA PRIVACY */}
      {activeTab === 'USER_PRIVACY' && <UserSecurityPrivacyTab />}

      {/* TAB 6: TRAINING & PRE-PRODUCTION GO-LIVE */}
      {activeTab === 'TRAINING_GOLIVE' && <TestTrainingSuiteTab />}

      {/* TAB 7: EMERGENCY CONTACTS */}
      {activeTab === 'CONTACTS' && <EmergencyContactsTab />}

      {/* TAB 8: AREA GROUPS */}
      {activeTab === 'GROUPS' && <AreaGroupsManagementTab />}

      {/* TAB 8.5: WHATSAPP CLOUD API CONFIGURATION & GATEWAY */}
      {activeTab === 'WHATSAPP_API' && <WhatsAppApiConfigTab />}

      {/* TAB 9: VIEW, APPEARANCE & THEMES */}
      {activeTab === 'VIEW' && <ViewSettingsTab />}

      {/* TAB 10: SYSTEM SETTINGS, DATA STORAGE, IMPORT & BACKUP */}
      {activeTab === 'SETTINGS' && <DataStorageSettingsTab />}
    </div>
  );
};
