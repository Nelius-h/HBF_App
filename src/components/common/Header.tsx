import React, { useState, useEffect, useRef } from 'react';
import { Shield, Globe, Bell, User, AlertTriangle, ChevronDown, ChevronRight, Lock, CheckCircle2, Sun, Moon, Monitor, Settings as SettingsIcon, Database, Radio, MapPin, UserPlus, RotateCcw, Smartphone, Download, Search, X, Check, Eye, Sliders, Activity, PhoneCall, KeyRound, LogOut, Mic, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { PhoneInstallGuideModal } from './PhoneInstallGuideModal';
import { ChangePinModal } from '../auth/ChangePinModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { AppLogo } from './AppLogo';
import { pwaService } from '../../services/pwaService';
import { useBackButton } from '../../hooks/useBackButton';
import { systemPermissionsService, SystemPermissionStatus } from '../../services/systemPermissionsService';

interface HeaderProps {
  onOpenAlerts?: () => void;
  onOpenSettings?: () => void;
  onOpenRegisterWizard?: () => void;
  onOpenPermissions?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAlerts, onOpenSettings, onOpenRegisterWizard, onOpenPermissions }) => {
  const { currentUser, activeRole, isManagementMode, isMasterAdmin, switchToManagement, switchToControlRoom, switchToClient, setOverrideRole, switchUserAccount, availableUsers, resetToCleanTestLaunch, logout } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const { activeEmergency, allActiveEmergencies, alerts, isPatrolActive, startPatrol, stopPatrol, updatePatrolLocation, incidentNotifications, unacknowledgedIncidentsCount } = useData();
  const { theme, themeMode, setThemeMode, toggleTheme, isDark } = useTheme();

  // Primary emergency for top banner
  const displayedEmergency = activeEmergency || (activeRole !== 'CLIENT' && allActiveEmergencies.length > 0 ? allActiveEmergencies[0] : null);
  
  // Only Control Room operators, Management members, and Master Admins can access Control Room system settings
  const isControlRoomOrManagement = isMasterAdmin || activeRole === 'MANAGEMENT' || activeRole === 'CONTROL_ROOM';

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'MANAGEMENT' | 'REACTION_FORCE' | 'CONTROL_ROOM' | 'CLIENT'>('ALL');
  const [isStartingPatrol, setIsStartingPatrol] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [permStatus, setPermStatus] = useState<SystemPermissionStatus>(() => systemPermissionsService.getStatus());

  useEffect(() => {
    const unsub = systemPermissionsService.subscribe((s) => {
      setPermStatus(s);
    });
    return unsub;
  }, []);

  // Phone hardware/gesture Back button navigation handlers
  useBackButton(isInstallModalOpen, () => setIsInstallModalOpen(false), 'header-install-modal', 25);
  useBackButton(isChangePinModalOpen, () => setIsChangePinModalOpen(false), 'header-changepin-modal', 25);
  useBackButton(isNotificationModalOpen, () => setIsNotificationModalOpen(false), 'header-notifications-modal', 25);
  useBackButton(showUserMenu || showSettingsMenu, () => {
    setShowUserMenu(false);
    setShowSettingsMenu(false);
  }, 'header-menu-dropdown', 20);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    if (showUserMenu || showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showSettingsMenu]);

  const handleTogglePatrol = async () => {
    if (isPatrolActive) {
      stopPatrol();
    } else {
      setIsStartingPatrol(true);
      try {
        await startPatrol({
          notes: activeRole === 'REACTION_FORCE' ? 'Reaction Force Tactical Sector Patrol' : 'Community Member Field Patrol & Farm Watch Beacon',
          sector: currentUser.sector || 'Hartbeesfontein Sektor 2',
        });
      } finally {
        setIsStartingPatrol(false);
      }
    }
  };

  // Filter available users for user switcher dropdown
  const filteredUsers = availableUsers.filter((u) => {
    if (userRoleFilter !== 'ALL') {
      if (userRoleFilter === 'MANAGEMENT' && u.role !== 'MANAGEMENT' && u.role !== 'CONTROL_ROOM') return false;
      if (userRoleFilter === 'REACTION_FORCE' && u.role !== 'REACTION_FORCE') return false;
      if (userRoleFilter === 'CLIENT' && u.role !== 'CLIENT') return false;
    }
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    const fullName = `${u.name} ${u.surname}`.toLowerCase();
    const farm = (u.farmName || '').toLowerCase();
    const sec = (u.sector || '').toLowerCase();
    const roleStr = (u.role || '').toLowerCase();
    const phone = (u.primaryPhone || '').replace(/\s+/g, '');
    return (
      fullName.includes(q) ||
      farm.includes(q) ||
      sec.includes(q) ||
      roleStr.includes(q) ||
      phone.includes(q.replace(/\s+/g, ''))
    );
  });

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 text-white shadow-lg shadow-black/20">
      {/* Emergency Active Global Banner */}
      {displayedEmergency && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 px-4 py-2 text-white font-black flex items-center justify-between text-xs sm:text-sm shadow-inner animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-bounce" />
            <span className="tracking-wide text-[11px] sm:text-xs">
              {t.emergency.activeEmergencyAlert}: <span className="underline decoration-white/60">{displayedEmergency.farmName}</span> ({displayedEmergency.clientName})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-black/40 border border-white/20 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider">
              {displayedEmergency.status.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2.5 flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
        {/* Brand & Sector */}
        <div id="hdr-brand-container" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
          <AppLogo size="md" className="p-0.5 rounded-xl bg-slate-950/40 border border-emerald-500/30 shadow-md shadow-black/30 flex-shrink-0" />
          <div className="min-w-0">
            <h1 id="hdr-app-title" className="font-black text-xs sm:text-base leading-tight tracking-tight flex items-center gap-1.5 truncate">
              <span className="text-white drop-shadow-sm truncate">{t.common.appName}</span>
              <span className="text-[9px] sm:text-[10px] font-black font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-600/50 px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm flex-shrink-0">
                V0.1
              </span>
            </h1>
            <p id="hdr-sector-subtitle" className="text-[10px] sm:text-[11px] text-slate-300 font-semibold truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
              <span className="truncate">{currentUser.sector || 'Hartbeesfontein Plaaswag'}</span>
            </p>
          </div>
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Direct Role/View Switcher buttons for Cornelius Hattingh (Master Admin) - Desktop/Tablet */}
          {isMasterAdmin && (
            <div id="hdr-role-switcher-bar" className="hidden lg:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs shadow-inner">
              <button
                id="btn-hdr-role-client"
                data-ui-code="BTN-HDR-ROLE-CLIENT"
                onClick={switchToClient}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 relative ${
                  activeRole === 'CLIENT'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Wissel na Lid / Boer Uitsig"
              >
                <User className="w-3.5 h-3.5" />
                <span>Lid / Boer</span>
              </button>
              <button
                id="btn-hdr-role-cr"
                data-ui-code="BTN-HDR-ROLE-CR"
                onClick={switchToControlRoom}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 relative ${
                  activeRole === 'CONTROL_ROOM'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Wissel na Beheerkamer Uitsig"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Beheerkamer</span>
              </button>
              <button
                id="btn-hdr-role-mgmt"
                data-ui-code="BTN-HDR-ROLE-MGMT"
                onClick={switchToManagement}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 relative ${
                  activeRole === 'MANAGEMENT'
                    ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Wissel na Bestuur / Komitee Uitsig"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Bestuur</span>
              </button>
            </div>
          )}

          {/* Direct Patrol Beacon Action Button */}
          <button
            id="btn-hdr-patrol-beacon"
            data-ui-code="BTN-HDR-PATROL-BEACON"
            onClick={handleTogglePatrol}
            disabled={isStartingPatrol}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all shadow-sm border ${
              isPatrolActive
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            title={
              isPatrolActive
                ? (language === 'af' ? 'Patrollie Baken AAN: Stroom regstreekse GPS na Beheerkamer. Klik om af te skakel.' : 'Patrol Beacon ON: Streaming live GPS to Control Room. Click to stop.')
                : (language === 'af' ? 'Begin Patrollie Baken: Stuur lewendige GPS na Beheerkamer Kaart' : 'Start Patrol Beacon: Stream live GPS to Operations Map')
            }
          >
            <Radio className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isPatrolActive ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} />
            <span className="hidden sm:inline font-bold">
              {isPatrolActive
                ? (language === 'af' ? 'Baken AAN' : 'Beacon ON')
                : (language === 'af' ? 'Patrollie Baken' : 'Patrol Beacon')}
            </span>
            {isPatrolActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            )}
          </button>

          {/* Unified Settings Dropdown: Contains Theme/View Toggle, Language & Phone Install */}
          <div className="relative z-50" ref={settingsMenuRef}>
            <button
              id="btn-hdr-settings-menu"
              data-ui-code="BTN-HDR-SETTINGS-MENU"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="flex items-center gap-1 sm:gap-1.5 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700/80 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-slate-200 shadow-sm transition relative"
              title={language === 'af' ? 'Instellings, Uitsig & Taal' : 'Settings, View & Language'}
              aria-label="Settings"
            >
              <SettingsIcon className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${showSettingsMenu ? 'rotate-90 text-emerald-300' : ''}`} />
              <span className="hidden md:inline font-bold">{t.nav.settings}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSettingsMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl z-[80] text-xs overflow-hidden divide-y divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header title */}
                <div className="px-4 py-3 bg-slate-950/90 flex items-center justify-between border-b border-slate-800">
                  <span className="font-black text-white uppercase text-[10px] tracking-wider flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    {isControlRoomOrManagement
                      ? (language === 'af' ? 'Beheerkamer & Stelsel Instellings' : 'Control Room & System Settings')
                      : (language === 'af' ? 'Lid Voorkeure & Instellings' : 'Member Preferences & Settings')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-800 px-2 py-0.5 rounded">HBF V0.1</span>
                </div>

                {/* Control Room & System Settings Suite Modal Launcher - ONLY for Control Room operators & Management */}
                {isControlRoomOrManagement && onOpenSettings && (
                  <div className="p-3 bg-slate-950/70 border-b border-slate-800">
                    <button
                      id="btn-hdr-open-cr-settings"
                      data-ui-code="BTN-HDR-SETTINGS-GEAR"
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600/25 to-amber-700/20 hover:from-amber-600/35 hover:to-amber-700/30 active:scale-[0.98] border border-amber-500/60 hover:border-amber-400 rounded-xl text-amber-300 font-bold text-xs flex items-center justify-between shadow-md transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-white text-xs leading-tight">
                            {language === 'af' ? 'Beheerkamer Instellings' : 'Control Room Settings'}
                          </p>
                          <p className="text-[10px] text-amber-300/80 font-medium">
                            {language === 'af' ? 'WhatsApp, Groepe, Wyke & Stelsel' : 'WhatsApp, Groups, Sectors & System'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Device Permissions Manager */}
                <div className="p-3 bg-slate-950/70 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      if (onOpenPermissions) {
                        onOpenPermissions();
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] border border-slate-750 hover:border-emerald-500/40 rounded-xl text-slate-200 font-bold text-xs flex items-center justify-between shadow-md transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-white text-xs leading-tight flex items-center gap-1.5">
                          <span>{language === 'af' ? 'Stelsel Toestemmings' : 'System Permissions'}</span>
                          {systemPermissionsService.hasMissingCriticalPermissions() ? (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          ) : (
                            <Check className="w-3 h-3 text-emerald-400" />
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {language === 'af' ? 'GPS, Kennisgewings, Mic & Kamera' : 'GPS, Notifications, Mic & Camera'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Customizable Push & Audio Notifications */}
                <div className="p-3 bg-slate-950/70 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setIsNotificationModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] border border-slate-750 hover:border-emerald-500/40 rounded-xl text-slate-200 font-bold text-xs flex items-center justify-between shadow-md transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-white text-xs leading-tight">
                          {language === 'af' ? 'Kennisgewings & Klanke' : 'Notifications & Sounds'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {language === 'af' ? 'SOS, Verkeer, Brand & Stil-ure' : 'SOS, Traffic, Fire & Quiet Hours'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Theme / View Mode Toggle */}
                <div id="hdr-settings-theme-section" className="p-3.5 bg-slate-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      {language === 'af' ? 'Uitsig / Tema:' : 'View / Theme:'}
                    </span>
                    <span className="text-[10px] text-slate-300 uppercase font-mono font-bold bg-slate-800 px-2 py-0.5 rounded">{themeMode}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                    <button
                      id="btn-theme-dark"
                      data-ui-code="BTN-THEME-DARK"
                      onClick={() => setThemeMode('dark')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black transition relative ${
                        themeMode === 'dark' || themeMode === 'midnight'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={t.common.darkMode}
                    >
                      <Moon className="w-3 h-3 text-amber-300" />
                      <span>{t.common.darkMode}</span>
                    </button>
                    <button
                      id="btn-theme-light"
                      data-ui-code="BTN-THEME-LIGHT"
                      onClick={() => setThemeMode('light')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black transition relative ${
                        themeMode === 'light' || themeMode === 'daylight'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={t.common.lightMode}
                    >
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>{t.common.lightMode}</span>
                    </button>
                    <button
                      id="btn-theme-monochrome"
                      data-ui-code="BTN-THEME-BW"
                      onClick={() => setThemeMode('monochrome')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black transition relative ${
                        themeMode === 'monochrome'
                          ? 'bg-white text-black shadow ring-1 ring-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={language === 'af' ? 'S&W Kleurblind' : 'B&W Color-blind'}
                    >
                      <Eye className="w-3 h-3" />
                      <span>B&W</span>
                    </button>
                    <button
                      id="btn-theme-auto"
                      data-ui-code="BTN-THEME-AUTO"
                      onClick={() => setThemeMode('system')}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[10px] font-black transition relative ${
                        themeMode === 'system'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Auto System"
                    >
                      <Monitor className="w-3 h-3 text-blue-400" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                {/* Language Switcher Section */}
                <div id="hdr-settings-lang-section" className="p-3.5 bg-slate-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      {language === 'af' ? 'Taal / Language:' : 'Language / Taal:'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-black uppercase">{language === 'af' ? 'Afrikaans' : 'English'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                    <button
                      id="btn-lang-af"
                      data-ui-code="BTN-LANG-AF"
                      onClick={() => setLanguage('af')}
                      className={`py-1.5 px-2.5 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1.5 relative ${
                        language === 'af' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🇿🇦 Afrikaans</span>
                      {language === 'af' && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <button
                      id="btn-lang-en"
                      data-ui-code="BTN-LANG-EN"
                      onClick={() => setLanguage('en')}
                      className={`py-1.5 px-2.5 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1.5 relative ${
                        language === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🇬🇧 English</span>
                      {language === 'en' && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </div>
                </div>

                {/* Quick Phone Install PWA Action */}
                <div id="hdr-settings-pwa-section" className="p-3 bg-slate-900/50">
                  <button
                    id="btn-hdr-pwa-install"
                    data-ui-code="BTN-HDR-PWA-INSTALL"
                    onClick={async () => {
                      setShowSettingsMenu(false);
                      try {
                        const outcome = await pwaService.promptInstall();
                        if (outcome !== 'accepted') {
                          setIsInstallModalOpen(true);
                        }
                      } catch {
                        setIsInstallModalOpen(true);
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 border border-emerald-600/50 rounded-xl text-white font-black text-xs flex items-center justify-between shadow-md transition active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                      <div className="text-left">
                        <p className="leading-tight">{language === 'af' ? 'Installeer Toep (PWA)' : 'Install App (PWA)'}</p>
                        <p className="text-[10px] text-emerald-200/90 font-medium">{language === 'af' ? 'Android, iPhone & Windows' : 'Android, iPhone & Windows'}</p>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-emerald-300" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Switcher Dropdown with Clear Full Name Display */}
          <div className="relative z-50" ref={userMenuRef}>
            <button
              id="btn-hdr-user-menu"
              data-ui-code="BTN-HDR-USER-MENU"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700/80 hover:border-slate-600 rounded-xl px-2 sm:px-3 py-1.5 text-xs text-slate-200 transition shadow-sm relative"
              aria-label="Wissel Gebruiker Profiel"
              title={`Aangemeld as: ${currentUser.name} ${currentUser.surname} (${currentUser.role})`}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-[10px] sm:text-xs font-black text-white shadow-inner flex-shrink-0 border border-emerald-400/40">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-white text-xs leading-none flex items-center gap-1">
                  <span className="truncate max-w-[120px] lg:max-w-[160px]">{currentUser.name} {currentUser.surname}</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase mt-1 leading-none">
                  {t.roles[activeRole] || activeRole}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[80] text-xs overflow-hidden flex flex-col max-h-[85vh]">
                {/* Active User Header Info */}
                <div className="px-3.5 py-3 border-b border-slate-800 bg-slate-950/80">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{t.common.authenticatedAs}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="font-bold text-white text-sm">{currentUser.name} {currentUser.surname}</p>
                      <p className="text-emerald-400 font-semibold text-xs mt-0.5">{currentUser.farmName || 'Plaaswag'} {currentUser.portionNumber ? `(${currentUser.portionNumber})` : ''}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      {t.roles[currentUser.role] || currentUser.role}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate mt-1">{currentUser.primaryPhone} &bull; {currentUser.email}</p>
                </div>

                {/* Account Actions: Change PIN for all users */}
                <div className="p-2 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsChangePinModalOpen(true);
                    }}
                    className="flex-1 py-2 px-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700/70"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verander PIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="py-2 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    title="Meld af van hierdie toestel"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Meld Af</span>
                  </button>
                </div>

                {/* STRICT ROLE RESTRICTION: Only Master Admin (Cornelius Hattingh) can access administrative view toggling and profile switching */}
                {isMasterAdmin && (
                  <>
                    {/* Role switchers for Master Admin */}
                    <div className="p-2.5 bg-slate-900/90 border-b border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Wissel Stelsel Uitsig (Cornelius Hattingh):
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => {
                            switchToClient();
                            setShowUserMenu(false);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] flex flex-col items-center gap-0.5 border transition ${
                            activeRole === 'CLIENT'
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Lid / Boer</span>
                        </button>
                        <button
                          onClick={() => {
                            switchToControlRoom();
                            setShowUserMenu(false);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] flex flex-col items-center gap-0.5 border transition ${
                            activeRole === 'CONTROL_ROOM'
                              ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Beheerkamer</span>
                        </button>
                        <button
                          onClick={() => {
                            switchToManagement();
                            setShowUserMenu(false);
                          }}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] flex flex-col items-center gap-0.5 border transition ${
                            activeRole === 'MANAGEMENT'
                              ? 'bg-amber-600 text-slate-950 border-amber-400 shadow-sm'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Bestuur</span>
                        </button>
                      </div>
                    </div>

                    {/* Search & Quick Filter Section */}
                    <div className="p-2.5 border-b border-slate-800 bg-slate-950/40 space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          placeholder="Soek profiel (naam, van, plaas)..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-8 pr-7 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        {userSearchQuery && (
                          <button
                            onClick={() => setUserSearchQuery('')}
                            className="absolute right-2 top-2 text-slate-400 hover:text-white p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Role filter chips */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
                        <button
                          onClick={() => setUserRoleFilter('ALL')}
                          className={`px-2 py-0.5 rounded whitespace-nowrap font-semibold transition ${
                            userRoleFilter === 'ALL'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Alles ({availableUsers.length})
                        </button>
                        <button
                          onClick={() => setUserRoleFilter('CLIENT')}
                          className={`px-2 py-0.5 rounded whitespace-nowrap font-semibold transition ${
                            userRoleFilter === 'CLIENT'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Boere / Lede
                        </button>
                        <button
                          onClick={() => setUserRoleFilter('REACTION_FORCE')}
                          className={`px-2 py-0.5 rounded whitespace-nowrap font-semibold transition ${
                            userRoleFilter === 'REACTION_FORCE'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Reaksie
                        </button>
                        <button
                          onClick={() => setUserRoleFilter('MANAGEMENT')}
                          className={`px-2 py-0.5 rounded whitespace-nowrap font-semibold transition ${
                            userRoleFilter === 'MANAGEMENT'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Bestuur
                        </button>
                      </div>
                    </div>

                    {/* User List Header */}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between bg-slate-900 border-b border-slate-800/80">
                      <span>Administratiewe Profiele ({filteredUsers.length}):</span>
                      {onOpenRegisterWizard && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenRegisterWizard();
                          }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60 transition"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>+ Registrasie</span>
                        </button>
                      )}
                    </div>

                    {/* Scrollable User List */}
                    <div className="overflow-y-auto max-h-56 sm:max-h-64 divide-y divide-slate-800/80">
                      {filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          Geen gebruikers gevind vir &quot;{userSearchQuery}&quot; nie.
                        </div>
                      ) : (
                        filteredUsers.map((u) => {
                          const isCurrent = u.uid === currentUser.uid;
                          return (
                            <button
                              key={u.uid}
                              type="button"
                              onClick={() => {
                                switchUserAccount(u.uid);
                                setShowUserMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2.5 hover:bg-slate-800/90 transition flex items-center justify-between gap-2 group ${
                                isCurrent ? 'bg-emerald-950/40 border-l-2 border-emerald-500' : ''
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className={`font-bold text-xs truncate ${isCurrent ? 'text-emerald-400' : 'text-slate-200 group-hover:text-white'}`}>
                                    {u.name || 'Onbekend'} {u.surname}
                                  </p>
                                  {u.portionNumber && (
                                    <span className="text-[10px] text-slate-500 font-mono">({u.portionNumber})</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                                  <span className="text-slate-300">{u.farmName || 'Plaaswag'}</span>
                                  <span>&bull;</span>
                                  <span className="text-slate-400">{u.sector || t.roles[u.role] || u.role}</span>
                                </div>
                              </div>
                              {isCurrent ? (
                                <div className="px-2 py-0.5 rounded bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                                  <Check className="w-3 h-3" />
                                  <span>Aktief</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 font-medium flex-shrink-0 transition">
                                  Kies &rarr;
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Master Admin Reset & Log Out Action */}
                    <div className="p-2 border-t border-slate-800 bg-slate-950/80">
                      <button
                        onClick={() => {
                          if (window.confirm('Is u seker u wil u sessie beëindig en terugkeer na die aanmeldingskerm?')) {
                            resetToCleanTestLaunch();
                            setShowUserMenu(false);
                          }
                        }}
                        className="w-full text-left py-1.5 px-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span>Meld Af en Herstel na Aanmeldingskerm</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phone Installation Guide Modal */}
      {isInstallModalOpen && (
        <PhoneInstallGuideModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      )}

      {/* Self-Service Change PIN Modal */}
      {isChangePinModalOpen && (
        <ChangePinModal
          isOpen={isChangePinModalOpen}
          onClose={() => setIsChangePinModalOpen(false)}
        />
      )}

      {/* Customizable Push & Audio Notification Settings */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        isReactionForce={activeRole === 'REACTION_FORCE'}
      />
    </header>
  );
};
