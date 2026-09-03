import React, { useState } from 'react';
import {
  X,
  Sliders,
  HardDrive,
  MessageSquare,
  Users,
  Radio,
  Sparkles,
  Palette,
  Eye,
  FileText,
  Compass,
  Database,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { WhatsAppApiConfigTab } from '../management/WhatsAppApiConfigTab';
import { AreaGroupsManagementTab } from '../management/AreaGroupsManagementTab';
import { BroadcastMessageSettingsTab } from '../management/BroadcastMessageSettingsTab';
import { GroupAndAreaSettingsTab } from '../management/GroupAndAreaSettingsTab';
import { DataStorageSettingsTab } from '../management/DataStorageSettingsTab';
import { ViewSettingsTab } from '../management/ViewSettingsTab';
import { useI18n } from '../../i18n/I18nContext';
import { useBackButton } from '../../hooks/useBackButton';
import { useAuth } from '../../context/AuthContext';

export type SettingsModalTab =
  | 'whatsapp'
  | 'broadcast_groups'
  | 'broadcast_messages'
  | 'group_areas'
  | 'backup_restore'
  | 'view_style';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: SettingsModalTab;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'view_style',
}) => {
  const { language } = useI18n();
  const { activeRole, isMasterAdmin } = useAuth();
  const isAf = language === 'af';

  useBackButton(isOpen, onClose, 'system-settings-modal', 25);
  const [activeTab, setActiveTab] = useState<SettingsModalTab>(defaultTab);

  // Security Guard: Only Control Room, Management, and Master Admins can access Control Room settings
  const isAuthorized = isMasterAdmin || activeRole === 'MANAGEMENT' || activeRole === 'CONTROL_ROOM';

  if (!isOpen || !isAuthorized) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div id="hdr-set-modal" className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="hdr-set-modal-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isAf ? 'Beheerkamer & Stelselinstellings' : 'Control Room & System Settings'}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  ACTIVE ENGINE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAf
                  ? 'WhatsApp API • Uitsending Groepe • Boodskap Sjablone • Sektore & Wyke • Rugsteun & Data • Voorkoms & Styl'
                  : 'WhatsApp Settings • Broadcast Groups • Message Templates • Group & Area Settings • Backup & Restore • View Style'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="btn-set-close"
              data-ui-code="BTN-SET-CLOSE"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition relative"
              title={isAf ? 'Maak Toe' : 'Close Settings'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6 Unified Navigation Tabs Bar */}
        <div id="bar-set-tabs" className="bg-slate-950/90 border-b border-slate-800 px-3 sm:px-5 flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-thin">
          {/* 1. All WhatsApp Settings */}
          <button
            id="btn-set-tab-whatsapp"
            data-ui-code="BTN-SET-TAB-WHATSAPP"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>{isAf ? '1. WhatsApp API & Koppelvlak' : '1. WhatsApp Settings'}</span>
          </button>

          {/* 2. Broadcast Group Settings */}
          <button
            id="btn-set-tab-groups"
            data-ui-code="BTN-SET-TAB-GROUPS"
            onClick={() => setActiveTab('broadcast_groups')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'broadcast_groups'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-teal-300" />
            <span>{isAf ? '2. Uitsending Groepe' : '2. Broadcast Groups'}</span>
          </button>

          {/* 3. Broadcast Message Settings */}
          <button
            id="btn-set-tab-messages"
            data-ui-code="BTN-SET-TAB-MESSAGES"
            onClick={() => setActiveTab('broadcast_messages')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'broadcast_messages'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-300" />
            <span>{isAf ? '3. Boodskap Sjablone' : '3. Message Settings'}</span>
          </button>

          {/* 4. Group and Area Settings */}
          <button
            id="btn-set-tab-areas"
            data-ui-code="BTN-SET-TAB-AREAS"
            onClick={() => setActiveTab('group_areas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'group_areas'
                ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-600/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isAf ? '4. Groepe & Wyke' : '4. Group & Area Settings'}</span>
          </button>

          {/* 5. Data Backup and Restore */}
          <button
            id="btn-set-tab-backup"
            data-ui-code="BTN-SET-TAB-BACKUP"
            onClick={() => setActiveTab('backup_restore')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'backup_restore'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-4 h-4 text-blue-300" />
            <span>{isAf ? '5. Rugsteun & Data' : '5. Backup & Restore'}</span>
          </button>

          {/* 6. View Style */}
          <button
            id="btn-set-tab-view"
            data-ui-code="BTN-SET-TAB-VIEW"
            onClick={() => setActiveTab('view_style')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
              activeTab === 'view_style'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4 text-purple-300" />
            <span>{isAf ? '6. Voorkoms & Styl' : '6. View Style'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'whatsapp' && <WhatsAppApiConfigTab />}
          {activeTab === 'broadcast_groups' && <AreaGroupsManagementTab />}
          {activeTab === 'broadcast_messages' && <BroadcastMessageSettingsTab />}
          {activeTab === 'group_areas' && <GroupAndAreaSettingsTab />}
          {activeTab === 'backup_restore' && <DataStorageSettingsTab />}
          {activeTab === 'view_style' && <ViewSettingsTab />}
        </div>
      </div>
    </div>
  );
};
