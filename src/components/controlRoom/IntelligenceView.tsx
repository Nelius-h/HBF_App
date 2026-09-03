import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Plus,
  Eye,
  AlertTriangle,
  FileCheck,
  User,
  Car,
  Lock,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  FileText,
  Inbox,
  Link as LinkIcon,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PoiManagementView } from './intelligence/PoiManagementView';
import { VoiManagementView } from './intelligence/VoiManagementView';
import { ReviewQueueTab } from './intelligence/ReviewQueueTab';
import { RelationshipGraphView } from './intelligence/RelationshipGraphView';
import { HistoricalAnalyticsView } from './intelligence/HistoricalAnalyticsView';

export const IntelligenceView: React.FC = () => {
  const { t } = useI18n();
  const { activeRole, currentUser } = useAuth();
  const { pois, vois, intelReviewQueue, intelRelationships } = useData();

  const [activeTab, setActiveTab] = useState<'POIS' | 'VOIS' | 'REVIEW_QUEUE' | 'RELATIONSHIPS' | 'ANALYTICS'>('POIS');

  // Strictly restrict to CONTROL_ROOM or MANAGEMENT
  if (activeRole !== 'CONTROL_ROOM' && activeRole !== 'MANAGEMENT') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-900/30 text-red-500 mx-auto flex items-center justify-center border border-red-800">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">{t.common.accessRestricted}</h2>
        <p className="text-slate-400 text-xs max-w-md mx-auto">{t.common.unauthorizedRoleMsg}</p>
      </div>
    );
  }

  const pendingReviewCount = intelReviewQueue.filter((item) => item.status === 'PENDING_REVIEW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with Strict Epistemic Demarcation Principles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                CONTROL ROOM & MANAGEMENT ONLY
              </span>
              <span className="text-xs text-slate-500 font-mono">HV-INTEL-SYS-v3</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              Intelligence & Historical Analysis
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Operational dossiers, vehicle watchlists, verified field observations, and linked incident intelligence for the Hartbeesfontein safety cluster.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
              <div className="text-sm font-black text-amber-400 font-mono">{pois.length}</div>
              <div className="text-[10px] text-slate-400 font-bold">POIs</div>
            </div>
            <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
              <div className="text-sm font-black text-amber-400 font-mono">{vois.length}</div>
              <div className="text-[10px] text-slate-400 font-bold">VOIs</div>
            </div>
            <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
              <div className="text-sm font-black text-amber-400 font-mono">{intelRelationships.length}</div>
              <div className="text-[10px] text-slate-400 font-bold">Links</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('POIS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'POIS'
              ? 'bg-amber-600 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Persons of Interest ({pois.length})
        </button>

        <button
          onClick={() => setActiveTab('VOIS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'VOIS'
              ? 'bg-amber-600 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Car className="w-4 h-4" />
          Vehicles of Interest ({vois.length})
        </button>

        <button
          onClick={() => setActiveTab('REVIEW_QUEUE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 relative ${
            activeTab === 'REVIEW_QUEUE'
              ? 'bg-amber-600 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Review Queue
          {pendingReviewCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'REVIEW_QUEUE' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
              }`}
            >
              {pendingReviewCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RELATIONSHIPS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'RELATIONSHIPS'
              ? 'bg-amber-600 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Link & Relationship Matrix
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'ANALYTICS'
              ? 'bg-amber-600 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Historical & MO Analytics
        </button>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'POIS' && <PoiManagementView />}
        {activeTab === 'VOIS' && <VoiManagementView />}
        {activeTab === 'REVIEW_QUEUE' && <ReviewQueueTab />}
        {activeTab === 'RELATIONSHIPS' && <RelationshipGraphView />}
        {activeTab === 'ANALYTICS' && <HistoricalAnalyticsView />}
      </div>
    </div>
  );
};
