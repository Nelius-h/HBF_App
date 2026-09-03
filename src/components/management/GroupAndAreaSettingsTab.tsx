import React, { useState } from 'react';
import {
  MapPin,
  Building,
  Users,
  Compass,
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Shield,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useData } from '../../context/DataContext';
import { LocationAreasManager } from '../controlRoom/LocationAreasSettingsModal';
import { AreaGroupsManagementTab } from './AreaGroupsManagementTab';

export const GroupAndAreaSettingsTab: React.FC = () => {
  const { language } = useI18n();
  const isAf = language === 'af';
  const { locationAreas, groups } = useData();

  const [activeSubSection, setActiveSubSection] = useState<'SECTORS_AREAS' | 'BROADCAST_GROUPS'>('SECTORS_AREAS');

  return (
    <div className="space-y-5 text-xs animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>{isAf ? 'Groep- & Areabestuur (Sektore, Wyke & Patrolliegroepe)' : 'Group & Area Settings (Sectors, Wards & Response Groups)'}</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                {locationAreas.length} AREAS • {groups.length} GROUPS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAf
                ? 'Bestuur Hartbeesfontein se geografiese sektore, landelike wyke, plaasgrense, patrolliegroepe en WhatsApp-uitsendingskanale.'
                : 'Configure Hartbeesfontein geographical sectors, rural wards, farm boundaries, patrol units, and linked WhatsApp response channels.'}
            </p>
          </div>
        </div>

        {/* Sub-section Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveSubSection('SECTORS_AREAS')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
              activeSubSection === 'SECTORS_AREAS'
                ? 'bg-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isAf ? 'Sektore & Wyke' : 'Sectors & Location Areas'}</span>
          </button>

          <button
            onClick={() => setActiveSubSection('BROADCAST_GROUPS')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
              activeSubSection === 'BROADCAST_GROUPS'
                ? 'bg-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isAf ? 'Patrollie- & Noodgroepe' : 'Patrol & Response Groups'}</span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-section */}
      {activeSubSection === 'SECTORS_AREAS' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <LocationAreasManager />
        </div>
      ) : (
        <AreaGroupsManagementTab />
      )}
    </div>
  );
};
