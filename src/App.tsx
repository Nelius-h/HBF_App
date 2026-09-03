import React, { useState } from 'react';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { EmergencyModal } from './components/common/EmergencyModal';
import { ClientHome } from './components/client/ClientHome';
import { ClientProfile } from './components/client/ClientProfile';
import { ClientCases } from './components/client/ClientCases';
import { ClientAlerts } from './components/client/ClientAlerts';
import { ReportIncidentModal } from './components/client/ReportIncidentModal';
import { DailyReportModal } from './components/client/DailyReportModal';
import { ControlRoomDashboard } from './components/controlRoom/ControlRoomDashboard';
import { CaseInvestigationTracker } from './components/controlRoom/CaseInvestigationTracker';
import { BoloManagement } from './components/controlRoom/BoloManagement';
import { IntelligenceView } from './components/controlRoom/IntelligenceView';
import { SituationReportModal } from './components/controlRoom/SituationReportModal';
import { ControlRoomPhoneBook } from './components/controlRoom/ControlRoomPhoneBook';
import { OperationsMap } from './components/controlRoom/OperationsMap';
import { IncidentNotificationBanner } from './components/controlRoom/IncidentNotificationBanner';
import { GlobalSosEmergencyModal } from './components/controlRoom/GlobalSosEmergencyModal';
import { ReactionForceHome } from './components/responder/ReactionForceHome';
import { ManagementDashboard } from './components/management/ManagementDashboard';
import { SystemSettingsModal, SettingsModalTab } from './components/common/SystemSettingsModal';
import { OnboardingWizardModal } from './components/common/OnboardingWizardModal';
import { SystemPermissionsModal } from './components/common/SystemPermissionsModal';
import { systemPermissionsService } from './services/systemPermissionsService';
import { OfflineStatusBanner } from './components/common/OfflineStatusBanner';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { AuthPage } from './components/auth/AuthPage';
import { ForceChangePinModal } from './components/auth/ForceChangePinModal';
import { useBackButton } from './hooks/useBackButton';
import {
  Home,
  FolderLock,
  Bell,
  User,
  Radio,
  ShieldCheck,
  Lock,
  LayoutDashboard,
  AlertOctagon,
  PhoneCall,
  Map as MapIcon,
  Crosshair,
} from 'lucide-react';

import { safeGetItem, safeSetItem } from './utils/safeStorage';

const MainAppContent: React.FC = () => {
  const { t } = useI18n();
  const { activeRole, switchUserAccount, allUsers, currentUser, isAuthenticated, isForcePinChangeRequired } = useAuth();
  const { activeEmergency } = useData();

  // Read URL search params for 1-click WhatsApp SOS dispatch responding
  const [urlParams] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        action: params.get('action'),
        emergencyId: params.get('emergencyId'),
        role: params.get('role'),
      };
    } catch {
      return { action: null, emergencyId: null, role: null };
    }
  });

  // Auto-switch account if opened from a Reaction Force WhatsApp dispatch link
  React.useEffect(() => {
    if (urlParams.role === 'REACTION_FORCE' && activeRole !== 'REACTION_FORCE') {
      const rfUser = allUsers.find((u) => u.role === 'REACTION_FORCE');
      if (rfUser) {
        switchUserAccount(rfUser.uid);
      }
    }
  }, [urlParams.role, activeRole, allUsers, switchUserAccount]);

  // Navigation tab state
  const [clientTab, setClientTab] = useState<'HOME' | 'CASES' | 'ALERTS' | 'PROFILE'>('HOME');
  const [controlTab, setControlTab] = useState<'DASHBOARD' | 'MAP' | 'CASES' | 'ALERTS' | 'BOLO' | 'INTELLIGENCE' | 'PHONEBOOK'>('DASHBOARD');
  const [mgmtTab, setMgmtTab] = useState<'MANAGEMENT' | 'MAP' | 'CASES' | 'BOLO' | 'INTELLIGENCE' | 'PHONEBOOK'>('MANAGEMENT');
  const [rfTab, setRfTab] = useState<'HOME' | 'CASES' | 'ALERTS' | 'PROFILE'>('HOME');
  const [maintTab, setMaintTab] = useState<'MAP' | 'CASES' | 'ALERTS' | 'PHONEBOOK'>('MAP');

  // Modal states
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isReportIncidentOpen, setIsReportIncidentOpen] = useState(false);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  const [isSituationModalOpen, setIsSituationModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<SettingsModalTab>('whatsapp');
  const [isOperationsMapFullScreenOpen, setIsOperationsMapFullScreenOpen] = useState(false);

  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  const handleOpenSettings = (tab: SettingsModalTab = 'whatsapp') => {
    setSettingsDefaultTab(tab);
    setIsSettingsOpen(true);
  };
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    // Do not auto-force onboarding popup if already completed or if returning to app
    const completed = safeGetItem('hv_onboarding_completed');
    if (completed === 'true') return false;
    const savedUid = safeGetItem('hv_auth_user_uid');
    if (savedUid) {
      safeSetItem('hv_onboarding_completed', 'true');
      return false;
    }
    // Only open for completely fresh first-time device visit
    return false;
  });

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(activeRole === 'CLIENT' && clientTab !== 'HOME', () => setClientTab('HOME'), `tab-client-${clientTab}`);
  useBackButton(activeRole === 'CONTROL_ROOM' && controlTab !== 'DASHBOARD', () => setControlTab('DASHBOARD'), `tab-cr-${controlTab}`);
  useBackButton(activeRole === 'MANAGEMENT' && mgmtTab !== 'MANAGEMENT', () => setMgmtTab('MANAGEMENT'), `tab-mgmt-${mgmtTab}`);
  useBackButton(activeRole === 'REACTION_FORCE' && rfTab !== 'HOME', () => setRfTab('HOME'), `tab-rf-${rfTab}`);
  useBackButton(activeRole === 'MAINTENANCE_CREW' && maintTab !== 'MAP', () => setMaintTab('MAP'), `tab-maint-${maintTab}`);

  // Global modals back button handlers
  useBackButton(isEmergencyOpen, () => setIsEmergencyOpen(false), 'global-emergency-modal', 20);
  useBackButton(isReportIncidentOpen, () => setIsReportIncidentOpen(false), 'global-report-incident-modal', 20);
  useBackButton(isDailyReportOpen, () => setIsDailyReportOpen(false), 'global-daily-report-modal', 20);
  useBackButton(isSituationModalOpen, () => setIsSituationModalOpen(false), 'global-situation-modal', 20);
  useBackButton(isSettingsOpen, () => setIsSettingsOpen(false), 'global-settings-modal', 20);
  useBackButton(isOperationsMapFullScreenOpen, () => setIsOperationsMapFullScreenOpen(false), 'global-ops-map-modal', 20);
  useBackButton(isOnboardingOpen, () => setIsOnboardingOpen(false), 'global-onboarding-modal', 20);
  useBackButton(isPermissionsOpen, () => setIsPermissionsOpen(false), 'global-permissions-modal', 20);

  // If user is not authenticated, render the dedicated secure Login / Registration page
  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onOpenPermissions={() => setIsPermissionsOpen(true)} />
        {isPermissionsOpen && (
          <SystemPermissionsModal
            isOpen={isPermissionsOpen}
            onClose={() => setIsPermissionsOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header with Role Switcher, Settings & Language selector */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRegisterWizard={() => setIsOnboardingOpen(true)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
      />

      {/* Connectivity & Offline Status Bar */}
      <OfflineStatusBanner />

      {/* PWA Phone Installation Prompt Banner */}
      <PwaInstallBanner />

      {/* Mandatory Forced PIN Change Modal right after registration or when requested */}
      {isForcePinChangeRequired && <ForceChangePinModal />}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-24 sm:pb-8">
        {/* CLIENT ROLE VIEW */}
        {activeRole === 'CLIENT' && (
          <>
            {clientTab === 'HOME' && (
              <ClientHome
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenReportIncident={() => setIsReportIncidentOpen(true)}
                onNavigateTab={(tab) => setClientTab(tab)}
                onOpenDailyReportModal={() => setIsDailyReportOpen(true)}
              />
            )}
            {clientTab === 'CASES' && <ClientCases />}
            {clientTab === 'ALERTS' && <ClientAlerts />}
            {clientTab === 'PROFILE' && <ClientProfile />}
          </>
        )}

        {/* CONTROL ROOM ROLE VIEW */}
        {activeRole === 'CONTROL_ROOM' && (
          <>
            {controlTab === 'DASHBOARD' && (
              <ControlRoomDashboard
                onOpenSituationModal={() => setIsSituationModalOpen(true)}
                onNavigateTab={(tab) => setControlTab(tab)}
              />
            )}
            {controlTab === 'MAP' && (
              <div className="p-4 max-w-7xl mx-auto">
                <OperationsMap />
              </div>
            )}
            {controlTab === 'CASES' && (
              <CaseInvestigationTracker
                onOpenReportIncident={() => setIsReportIncidentOpen(true)}
                onOpenSituationReport={() => setIsSituationModalOpen(true)}
              />
            )}
            {controlTab === 'ALERTS' && <ClientAlerts />}
            {controlTab === 'BOLO' && <BoloManagement />}
            {controlTab === 'INTELLIGENCE' && <IntelligenceView />}
            {controlTab === 'PHONEBOOK' && <ControlRoomPhoneBook />}
          </>
        )}

        {/* MANAGEMENT ROLE VIEW */}
        {activeRole === 'MANAGEMENT' && (
          <>
            {mgmtTab === 'MANAGEMENT' && <ManagementDashboard />}
            {mgmtTab === 'MAP' && (
              <div className="p-4 max-w-7xl mx-auto">
                <OperationsMap />
              </div>
            )}
            {mgmtTab === 'CASES' && (
              <CaseInvestigationTracker
                onOpenReportIncident={() => setIsReportIncidentOpen(true)}
                onOpenSituationReport={() => setIsSituationModalOpen(true)}
              />
            )}
            {mgmtTab === 'BOLO' && <BoloManagement />}
            {mgmtTab === 'INTELLIGENCE' && <IntelligenceView />}
            {mgmtTab === 'PHONEBOOK' && <ControlRoomPhoneBook />}
          </>
        )}

        {/* REACTION FORCE ROLE VIEW (Same as Member / Client page with direct Operations Map full-screen link) */}
        {activeRole === 'REACTION_FORCE' && (
          <>
            {rfTab === 'HOME' && (
              <ClientHome
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenReportIncident={() => setIsReportIncidentOpen(true)}
                onNavigateTab={(tab) => setRfTab(tab)}
                onOpenDailyReportModal={() => setIsDailyReportOpen(true)}
                onOpenOperationsMap={() => setIsOperationsMapFullScreenOpen(true)}
              />
            )}
            {rfTab === 'CASES' && <ClientCases />}
            {rfTab === 'ALERTS' && <ClientAlerts />}
            {rfTab === 'PROFILE' && <ClientProfile />}
          </>
        )}

        {/* MAINTENANCE CREW ROLE VIEW */}
        {activeRole === 'MAINTENANCE_CREW' && (
          <>
            {maintTab === 'MAP' && (
              <div className="p-4 max-w-7xl mx-auto">
                <OperationsMap />
              </div>
            )}
            {maintTab === 'CASES' && <ClientCases />}
            {maintTab === 'ALERTS' && <ClientAlerts />}
            {maintTab === 'PHONEBOOK' && <ControlRoomPhoneBook />}
          </>
        )}
      </main>

      {/* Persistent Bottom Mobile Navigation Bar */}
      <nav id="hv-nav-bottom-bar" className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-1.5 sm:px-2.5 flex items-center justify-around text-[10px] font-semibold text-slate-400 shadow-2xl shadow-black overflow-x-auto no-scrollbar">
        {activeRole === 'CLIENT' && (
          <>
            <button
              id="btn-nav-client-home"
              data-ui-code="BTN-NAV-CLIENT-HOME"
              onClick={() => setClientTab('HOME')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-150 relative ${
                clientTab === 'HOME' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>{t.nav.home}</span>
            </button>

            <button
              id="btn-nav-client-cases"
              data-ui-code="BTN-NAV-CLIENT-CASES"
              onClick={() => setClientTab('CASES')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-150 relative ${
                clientTab === 'CASES' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <FolderLock className="w-5 h-5" />
              <span>{t.clientHome.myCases}</span>
            </button>

            <button
              id="btn-nav-client-sos"
              data-ui-code="BTN-NAV-CLIENT-SOS"
              onClick={() => setIsEmergencyOpen(true)}
              className="flex flex-col items-center -mt-5 transition-transform active:scale-95 relative"
            >
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-red-950/60 ring-2 ring-red-500/30 animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-red-400 uppercase mt-0.5 tracking-wider">
                SOS
              </span>
            </button>

            <button
              id="btn-nav-client-alerts"
              data-ui-code="BTN-NAV-CLIENT-ALERTS"
              onClick={() => setClientTab('ALERTS')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-150 relative ${
                clientTab === 'ALERTS' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>{t.clientHome.currentAlerts}</span>
            </button>

            <button
              id="btn-nav-client-profile"
              data-ui-code="BTN-NAV-CLIENT-PROFILE"
              onClick={() => setClientTab('PROFILE')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-150 relative ${
                clientTab === 'PROFILE' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <User className="w-5 h-5" />
              <span>{t.clientHome.myProfile}</span>
            </button>
          </>
        )}

        {activeRole === 'CONTROL_ROOM' && (
          <>
            <button
              id="btn-nav-cr-dash"
              data-ui-code="BTN-NAV-CR-DASH"
              onClick={() => setControlTab('DASHBOARD')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                controlTab === 'DASHBOARD' ? 'text-blue-400 font-black bg-blue-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              id="btn-nav-cr-cases"
              data-ui-code="BTN-NAV-CR-CASES"
              onClick={() => setControlTab('CASES')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                controlTab === 'CASES' ? 'text-amber-400 font-black bg-amber-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <FolderLock className="w-5 h-5" />
              <span>Cases</span>
            </button>

            <button
              id="btn-nav-cr-sitrep"
              data-ui-code="BTN-NAV-CR-SITREP"
              onClick={() => setIsSituationModalOpen(true)}
              className="flex flex-col items-center -mt-5 transition-transform active:scale-95 relative"
            >
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-blue-950/60 ring-2 ring-blue-500/30">
                <Radio className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-blue-400 uppercase mt-0.5">
                + SITREP
              </span>
            </button>

            <button
              id="btn-nav-cr-phonebook"
              data-ui-code="BTN-NAV-CR-PHONEBOOK"
              onClick={() => setControlTab('PHONEBOOK')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                controlTab === 'PHONEBOOK' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <PhoneCall className="w-5 h-5" />
              <span>Phone Book</span>
            </button>

            <button
              id="btn-nav-cr-bolo"
              data-ui-code="BTN-NAV-CR-BOLO"
              onClick={() => setControlTab('BOLO')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                controlTab === 'BOLO' ? 'text-purple-400 font-black bg-purple-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Radio className="w-5 h-5" />
              <span>BOLO</span>
            </button>

            <button
              id="btn-nav-cr-intel"
              data-ui-code="BTN-NAV-CR-INTEL"
              onClick={() => setControlTab('INTELLIGENCE')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                controlTab === 'INTELLIGENCE' ? 'text-amber-400 font-black bg-amber-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Intel</span>
            </button>
          </>
        )}

        {activeRole === 'MANAGEMENT' && (
          <>
            <button
              id="btn-nav-mgmt-dashboard"
              data-ui-code="BTN-NAV-MGMT-DASH"
              onClick={() => setMgmtTab('MANAGEMENT')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                mgmtTab === 'MANAGEMENT' ? 'text-amber-400 font-black bg-amber-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Management</span>
            </button>

            <button
              id="btn-nav-mgmt-phonebook"
              data-ui-code="BTN-NAV-MGMT-PHONEBOOK"
              onClick={() => setMgmtTab('PHONEBOOK')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                mgmtTab === 'PHONEBOOK' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <PhoneCall className="w-5 h-5" />
              <span>Phone Book</span>
            </button>

            <button
              id="btn-nav-mgmt-cases"
              data-ui-code="BTN-NAV-MGMT-CASES"
              onClick={() => setMgmtTab('CASES')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                mgmtTab === 'CASES' ? 'text-amber-400 font-black bg-amber-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <FolderLock className="w-5 h-5" />
              <span>Cases</span>
            </button>

            <button
              id="btn-nav-mgmt-bolo"
              data-ui-code="BTN-NAV-MGMT-BOLO"
              onClick={() => setMgmtTab('BOLO')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                mgmtTab === 'BOLO' ? 'text-purple-400 font-black bg-purple-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Radio className="w-5 h-5" />
              <span>BOLO</span>
            </button>

            <button
              id="btn-nav-mgmt-intel"
              data-ui-code="BTN-NAV-MGMT-INTEL"
              onClick={() => setMgmtTab('INTELLIGENCE')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                mgmtTab === 'INTELLIGENCE' ? 'text-amber-400 font-black bg-amber-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Intel</span>
            </button>
          </>
        )}

        {/* REACTION FORCE NAV (Same as Member / Client navigation) */}
        {activeRole === 'REACTION_FORCE' && (
          <>
            <button
              id="btn-nav-rf-home"
              data-ui-code="BTN-NAV-RF-HOME"
              onClick={() => setRfTab('HOME')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-150 relative ${
                rfTab === 'HOME' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>{t.nav.home}</span>
            </button>

            <button
              id="btn-nav-rf-cases"
              data-ui-code="BTN-NAV-RF-CASES"
              onClick={() => setRfTab('CASES')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-150 relative ${
                rfTab === 'CASES' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <FolderLock className="w-5 h-5" />
              <span>{t.clientHome.myCases}</span>
            </button>

            <button
              id="btn-nav-rf-sos"
              data-ui-code="BTN-NAV-RF-SOS"
              onClick={() => setIsEmergencyOpen(true)}
              className="flex flex-col items-center -mt-5 transition-transform active:scale-95 relative"
            >
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xl shadow-red-950/60 ring-2 ring-red-500/30 animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-red-400 uppercase mt-0.5 tracking-wider">
                SOS
              </span>
            </button>

            <button
              id="btn-nav-rf-alerts"
              data-ui-code="BTN-NAV-RF-ALERTS"
              onClick={() => setRfTab('ALERTS')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-150 relative ${
                rfTab === 'ALERTS' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>{t.clientHome.currentAlerts}</span>
            </button>

            <button
              id="btn-nav-rf-profile"
              data-ui-code="BTN-NAV-RF-PROFILE"
              onClick={() => setRfTab('PROFILE')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-150 relative ${
                rfTab === 'PROFILE' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <User className="w-5 h-5" />
              <span>{t.clientHome.myProfile}</span>
            </button>
          </>
        )}

        {/* MAINTENANCE CREW NAV */}
        {activeRole === 'MAINTENANCE_CREW' && (
          <>
            <button
              onClick={() => setMaintTab('MAP')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-150 ${
                maintTab === 'MAP' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <MapIcon className="w-5 h-5" />
              <span>Map & Towers</span>
            </button>

            <button
              onClick={() => setMaintTab('CASES')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-150 ${
                maintTab === 'CASES' ? 'text-amber-400 font-black bg-amber-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <FolderLock className="w-5 h-5" />
              <span>Work Cases</span>
            </button>

            <button
              onClick={() => setMaintTab('PHONEBOOK')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-150 ${
                maintTab === 'PHONEBOOK' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <PhoneCall className="w-5 h-5" />
              <span>Phone Book</span>
            </button>

            <button
              onClick={() => setMaintTab('ALERTS')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-150 ${
                maintTab === 'ALERTS' ? 'text-emerald-400 font-black bg-emerald-500/10' : 'hover:text-slate-200 active:scale-95'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
            </button>
          </>
        )}
      </nav>

      {/* Global SOS Emergency Alert Overlay for Responders, Control Room & Management */}
      <GlobalSosEmergencyModal />

      {/* Control Room & Management Real-time Incident Notification Popups */}
      {(activeRole === 'CONTROL_ROOM' || activeRole === 'MANAGEMENT') && (
        <IncidentNotificationBanner
          onOpenCase={(caseId) => {
            if (activeRole === 'CONTROL_ROOM') {
              setControlTab('CASES');
            } else if (activeRole === 'MANAGEMENT') {
              setMgmtTab('CASES');
            }
          }}
        />
      )}

      {/* Global Modals */}
      {isEmergencyOpen && (
        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
        />
      )}

      {isReportIncidentOpen && (
        <ReportIncidentModal
          isOpen={isReportIncidentOpen}
          onClose={() => setIsReportIncidentOpen(false)}
        />
      )}

      {isDailyReportOpen && (
        <DailyReportModal
          isOpen={isDailyReportOpen}
          onClose={() => setIsDailyReportOpen(false)}
        />
      )}

      {isSituationModalOpen && (
        <SituationReportModal
          isOpen={isSituationModalOpen}
          onClose={() => setIsSituationModalOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SystemSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          defaultTab={settingsDefaultTab}
        />
      )}

      {/* Fullscreen Operations Map Modal for Reaction Force and Quick Tactical Access */}
      {isOperationsMapFullScreenOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col">
          <OperationsMap
            onClose={() => setIsOperationsMapFullScreenOpen(false)}
            hideSettingsTab={true}
            isFullScreenMode={true}
          />
        </div>
      )}

      {/* Mandatory Onboarding & Registration Wizard for New Users */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* System Device Permissions Modal (GPS, Notifications, Mic, Camera) */}
      <SystemPermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <DataProvider>
            <MainAppContent />
          </DataProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

