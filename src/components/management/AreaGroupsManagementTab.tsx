import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  Trash2,
  Edit2,
  Users,
  UserPlus,
  UserMinus,
  Radio,
  MapPin,
  Phone,
  Shield,
  CheckCircle2,
  X,
  Flame,
  Heart,
  Layers,
  MessageSquare,
  ExternalLink,
  Send,
  Bell,
  BellOff,
  Sliders,
  AlertTriangle,
  Zap,
  Activity,
  Compass,
  Check,
  Copy,
  Info,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  AreaGroup,
  GroupType,
  WhatsAppBroadcastType,
  GroupPriorityLevel,
  GroupAutoDispatchTriggers,
} from '../../types';
import { generateManualWhatsAppUrl } from '../../services/whatsappService';

export const AreaGroupsManagementTab: React.FC = () => {
  const { t } = useI18n();
  const { currentUser, allUsers } = useAuth();
  const {
    groups,
    createGroup,
    updateGroup,
    deleteGroup,
    assignUsersToGroup,
    removeUsersFromGroup,
    settings,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [copiedLinkGroupId, setCopiedLinkGroupId] = useState<string | null>(null);

  // Test Broadcast Modal State
  const [testBroadcastGroup, setTestBroadcastGroup] = useState<AreaGroup | null>(null);
  const [testMessageText, setTestMessageText] = useState('');
  const [testSendStatus, setTestSendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<GroupType>('SECURITY');
  const [formDescription, setFormDescription] = useState('');
  const [formGeoDesc, setFormGeoDesc] = useState('');
  const [formSector, setFormSector] = useState('');
  const [formCoverageRadius, setFormCoverageRadius] = useState<number>(25);
  const [formLeaderName, setFormLeaderName] = useState('');
  const [formLeaderPhone, setFormLeaderPhone] = useState('');

  // WhatsApp Broadcast options
  const [formWhatsappInviteLink, setFormWhatsappInviteLink] = useState('');
  const [formWhatsappGroupJid, setFormWhatsappGroupJid] = useState('');
  const [formWhatsappBroadcastType, setFormWhatsappBroadcastType] = useState<WhatsAppBroadcastType>('GROUP_CHAT');
  const [formPriorityLevel, setFormPriorityLevel] = useState<GroupPriorityLevel>('HIGH');
  const [formMuteNotifications, setFormMuteNotifications] = useState(false);
  const [formBroadcastFrequency, setFormBroadcastFrequency] = useState<'IMMEDIATE' | 'HOURLY_DIGEST' | 'DAILY_DIGEST'>('IMMEDIATE');

  // Auto dispatch triggers
  const [formAutoTriggers, setFormAutoTriggers] = useState<GroupAutoDispatchTriggers>({
    emergencySos: true,
    farmAttack: true,
    wildfire: true,
    suspiciousVehicleBolo: true,
    roadblockTraffic: false,
    sitrepSummary: true,
    communityNotice: false,
    drillTesting: false,
  });

  // Add Member state
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('');

  const filteredGroups = groups.filter((g) => {
    if (filterType === 'WHATSAPP_ONLY') {
      if (!g.whatsappInviteLink && !g.whatsappGroupJid) return false;
    } else if (filterType !== 'all' && g.groupType !== filterType) {
      return false;
    }

    if (
      searchQuery &&
      !g.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(g.sector && g.sector.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingGroupId(null);
    setFormName('');
    setFormCode('');
    setFormType('SECURITY');
    setFormDescription('');
    setFormGeoDesc('');
    setFormSector('');
    setFormCoverageRadius(25);
    setFormLeaderName('');
    setFormLeaderPhone('');
    setFormWhatsappInviteLink('');
    setFormWhatsappGroupJid('');
    setFormWhatsappBroadcastType('GROUP_CHAT');
    setFormPriorityLevel('HIGH');
    setFormMuteNotifications(false);
    setFormBroadcastFrequency('IMMEDIATE');
    setFormAutoTriggers({
      emergencySos: true,
      farmAttack: true,
      wildfire: true,
      suspiciousVehicleBolo: true,
      roadblockTraffic: false,
      sitrepSummary: true,
      communityNotice: false,
      drillTesting: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (group: AreaGroup) => {
    setEditingGroupId(group.id);
    setFormName(group.name);
    setFormCode(group.code);
    setFormType(group.groupType);
    setFormDescription(group.description);
    setFormGeoDesc(group.geographicDescription || '');
    setFormSector(group.sector || '');
    setFormCoverageRadius(group.coverageRadiusKm || 25);
    setFormLeaderName(group.leaderName || '');
    setFormLeaderPhone(group.leaderPhone || '');
    setFormWhatsappInviteLink(group.whatsappInviteLink || '');
    setFormWhatsappGroupJid(group.whatsappGroupJid || '');
    setFormWhatsappBroadcastType(group.whatsappBroadcastType || 'GROUP_CHAT');
    setFormPriorityLevel(group.priorityLevel || 'HIGH');
    setFormMuteNotifications(group.muteNotifications || false);
    setFormBroadcastFrequency(group.broadcastFrequencyLimit || 'IMMEDIATE');
    setFormAutoTriggers(
      group.autoDispatchTriggers || {
        emergencySos: true,
        farmAttack: true,
        wildfire: true,
        suspiciousVehicleBolo: true,
        roadblockTraffic: false,
        sitrepSummary: true,
        communityNotice: false,
        drillTesting: false,
      }
    );
    setIsModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload = {
      name: formName,
      code: formCode || `SEC-${formName.substring(0, 3).toUpperCase()}`,
      groupType: formType,
      description: formDescription,
      geographicDescription: formGeoDesc,
      sector: formSector,
      coverageRadiusKm: Number(formCoverageRadius) || 25,
      leaderName: formLeaderName,
      leaderPhone: formLeaderPhone,
      whatsappInviteLink: formWhatsappInviteLink.trim() || undefined,
      whatsappGroupJid: formWhatsappGroupJid.trim() || undefined,
      whatsappBroadcastType: formWhatsappBroadcastType,
      priorityLevel: formPriorityLevel,
      muteNotifications: formMuteNotifications,
      broadcastFrequencyLimit: formBroadcastFrequency,
      autoDispatchTriggers: formAutoTriggers,
    };

    if (editingGroupId) {
      updateGroup(editingGroupId, payload);
    } else {
      createGroup({
        ...payload,
        memberUserIds: [currentUser.uid],
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (groupId: string, name: string) => {
    if (window.confirm(`Is jy seker jy wil die groep "${name}" verwyder?`)) {
      deleteGroup(groupId);
    }
  };

  const handleAddMember = (groupId: string) => {
    if (!selectedUserToAdd) return;
    assignUsersToGroup(groupId, [selectedUserToAdd]);
    setSelectedUserToAdd('');
  };

  const handleRemoveMember = (groupId: string, userUid: string) => {
    removeUsersFromGroup(groupId, [userUid]);
  };

  const handleCopyInviteLink = (groupId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLinkGroupId(groupId);
    setTimeout(() => setCopiedLinkGroupId(null), 2500);
  };

  const handleOpenTestBroadcastModal = (group: AreaGroup) => {
    setTestBroadcastGroup(group);
    setTestMessageText(
      `🚨 *HARTBEESFONTEIN VEILIGHEID - TOETS UITENDING*\n\n` +
      `Hierdie is 'n toets uitsending na *${group.name}* (${group.code}).\n` +
      `Tipe: ${group.whatsappBroadcastType || 'GROEP'}\n` +
      `Prioriteit: ${group.priorityLevel || 'HOOG'}\n` +
      `Tyd: ${new Date().toLocaleTimeString('en-ZA')}\n\n` +
      `_Beheerkamer Status: Gereed & Aktief_`
    );
    setTestSendStatus('idle');
  };

  const handleSendTestBroadcast = () => {
    if (!testBroadcastGroup) return;
    setTestSendStatus('sending');
    setTimeout(() => {
      setTestSendStatus('sent');
      const targetPhone = testBroadcastGroup.leaderPhone || '+27825551029';
      const waUrl = generateManualWhatsAppUrl(targetPhone, testMessageText);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 600);
  };

  const getTypeIcon = (type: GroupType) => {
    switch (type) {
      case 'FIRE':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'SECURITY':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'TRAFFIC':
        return <MapPin className="w-4 h-4 text-cyan-400" />;
      case 'PATROL':
        return <Radio className="w-4 h-4 text-amber-400" />;
      case 'MEDICAL':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'EXECUTIVE':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'COMMUNITY':
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <Building className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority?: GroupPriorityLevel) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            KRITIES
          </span>
        );
      case 'HIGH':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            HOOG
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Bar Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="font-black text-white text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>Sektor &amp; WhatsApp Uitsending Groepe (Broadcast Groups)</span>
          </h3>
          <p className="text-slate-400 text-xs">
            Bestuur sektorstrukture, WhatsApp Groep-skakels, JID-kanale, outo-versending snellers en responslede.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Skep Nuwe Uitsending / Sektor Groep</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Soek groepe volgens naam, kode, sektor of beskrywing..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 font-semibold overflow-x-auto gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs font-bold ${
              filterType === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Alle Groepe ({groups.length})
          </button>
          <button
            onClick={() => setFilterType('WHATSAPP_ONLY')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs font-bold flex items-center gap-1.5 ${
              filterType === 'WHATSAPP_ONLY' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp Gekoppel</span>
          </button>
          <button
            onClick={() => setFilterType('SECURITY')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs font-bold ${
              filterType === 'SECURITY' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sekuriteit
          </button>
          <button
            onClick={() => setFilterType('PATROL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs font-bold ${
              filterType === 'PATROL' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Patrollie
          </button>
          <button
            onClick={() => setFilterType('FIRE')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs font-bold ${
              filterType === 'FIRE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Brandbestryding
          </button>
          <button
            onClick={() => setFilterType('COMMUNITY')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs font-bold ${
              filterType === 'COMMUNITY' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gemeenskap
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGroups.length === 0 ? (
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-bold text-white">Geen groepe gevind nie</p>
            <p className="text-xs text-slate-500">Pas jou soekterm aan of skep 'n nuwe uitsending groep.</p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isExpanded = expandedGroupId === group.id;
            const memberUids = group.memberUserIds || [];
            const members = (allUsers || []).filter((u) => memberUids.includes(u.uid));
            const nonMembers = (allUsers || []).filter((u) => !memberUids.includes(u.uid));
            const isCopied = copiedLinkGroupId === group.id;

            return (
              <div
                key={group.id}
                className={`bg-slate-900 border rounded-2xl p-4 space-y-3.5 shadow-sm transition ${
                  group.muteNotifications
                    ? 'border-slate-800 opacity-80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0">
                      {getTypeIcon(group.groupType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white text-sm">{group.name}</span>
                        <span className="font-mono text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 font-bold">
                          {group.code}
                        </span>
                        {getPriorityBadge(group.priorityLevel)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                        <span className="uppercase text-slate-300 font-bold">{group.groupType}</span>
                        {group.sector && <span>• Sektor: {group.sector}</span>}
                        {group.coverageRadiusKm && <span>• Dekking: {group.coverageRadiusKm}km</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {group.muteNotifications ? (
                      <span className="p-1.5 text-amber-400 bg-amber-950/40 rounded-lg text-[10px] flex items-center gap-1" title="Kennisgewings gedemp">
                        <BellOff className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1.5 text-emerald-400 bg-emerald-950/40 rounded-lg text-[10px]" title="Outo-Uitsending Aktief">
                        <Bell className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenTestBroadcastModal(group)}
                      className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-600 rounded-lg transition"
                      title="Toets WhatsApp Uitsending"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(group)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                      title="Wysig Groep &amp; Uitsending Opsies"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id, group.name)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                      title="Verwyder Groep"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">{group.description}</p>

                {/* WhatsApp Dispatch Details Card */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Kanaal &amp; Reëls</span>
                    </span>
                    <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">
                      {group.whatsappBroadcastType || 'GROUP_CHAT'}
                    </span>
                  </div>

                  {group.whatsappInviteLink ? (
                    <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 gap-2">
                      <span className="font-mono text-emerald-300 truncate max-w-[200px] sm:max-w-[260px]">
                        {group.whatsappInviteLink}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleCopyInviteLink(group.id, group.whatsappInviteLink!)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Gekopieer' : 'Kopieer'}</span>
                        </button>
                        <a
                          href={group.whatsappInviteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded"
                          title="Open WhatsApp Groep"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-[10px]">
                      Geen WhatsApp uitnodigingskakel opgestel nie. Klik wysig om by te voeg.
                    </p>
                  )}

                  {group.whatsappGroupJid && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono">API JID:</span>
                      <span className="font-mono text-amber-300">{group.whatsappGroupJid}</span>
                    </div>
                  )}

                  {/* Auto Dispatch Trigger Badges */}
                  <div className="pt-1.5 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      Outo-Uitsending Snellers:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {group.autoDispatchTriggers?.emergencySos && (
                        <span className="bg-red-950/60 border border-red-800 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          🚨 SOS Nood
                        </span>
                      )}
                      {group.autoDispatchTriggers?.farmAttack && (
                        <span className="bg-amber-950/60 border border-amber-800 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          ⚡ Plasaanvalle
                        </span>
                      )}
                      {group.autoDispatchTriggers?.wildfire && (
                        <span className="bg-orange-950/60 border border-orange-800 text-orange-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          🔥 Brandbestryding
                        </span>
                      )}
                      {group.autoDispatchTriggers?.suspiciousVehicleBolo && (
                        <span className="bg-purple-950/60 border border-purple-800 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          🚗 BOLO Voertuie
                        </span>
                      )}
                      {group.autoDispatchTriggers?.roadblockTraffic && (
                        <span className="bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          🚧 Padblokkades
                        </span>
                      )}
                      {group.autoDispatchTriggers?.sitrepSummary && (
                        <span className="bg-blue-950/60 border border-blue-800 text-blue-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          📋 Sitrep Verslae
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {group.leaderName && (
                  <div className="flex items-center justify-between text-[11px] bg-slate-800/60 px-3 py-1.5 rounded-xl text-slate-300 border border-slate-750">
                    <span>
                      <strong className="text-slate-200">Sektorleier:</strong> {group.leaderName}
                    </span>
                    {group.leaderPhone && (
                      <span className="font-mono text-emerald-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {group.leaderPhone}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer and Member Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>{members.length} Gekoppelde Lede</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenTestBroadcastModal(group)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Uitsending Toets</span>
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                      className="text-amber-400 hover:underline font-bold text-xs"
                    >
                      {isExpanded ? 'Versteek Lede' : 'Bestuur Lede'}
                    </button>
                  </div>
                </div>

                {/* Expanded Member Management Panel */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3 bg-slate-950/60 p-3 rounded-xl">
                    <div className="flex gap-2">
                      <select
                        value={selectedUserToAdd}
                        onChange={(e) => setSelectedUserToAdd(e.target.value)}
                        className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white text-xs"
                      >
                        <option value="">-- Kies Gebruiker om by te voeg --</option>
                        {nonMembers.map((u) => (
                          <option key={u.uid} value={u.uid}>
                            {u.name} {u.surname} ({u.farmName || u.sector || u.role}) - {u.primaryPhone}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!selectedUserToAdd}
                        onClick={() => handleAddMember(group.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1 shadow cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Voeg By</span>
                      </button>
                    </div>

                    {/* Member List */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {members.length === 0 ? (
                        <p className="text-slate-500 italic py-2 text-center">
                          Geen lede tans in hierdie groep nie.
                        </p>
                      ) : (
                        members.map((member) => (
                          <div
                            key={member.uid}
                            className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">
                                  {member.name} {member.surname}
                                </span>
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                                  {member.role}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                <span>{member.primaryPhone}</span>
                                {member.farmName && <span>• {member.farmName}</span>}
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveMember(group.id, member.uid)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/40 p-1.5 rounded-lg transition"
                              title="Verwyder uit groep"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT GROUP & BROADCAST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-emerald-400 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>{editingGroupId ? 'Wysig Sektor & WhatsApp Uitsending Groep' : 'Nuwe Sektor & WhatsApp Uitsending Groep'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4 text-xs">
              {/* Section 1: Basic Info */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Basiese Groepinligting &amp; Tipe</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Groep Naam *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Sektor 3 Rooipoort & Omstreke"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Kode *</label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g. SEC-03"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white uppercase font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Groep Tipe *</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as GroupType)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-emerald-500 outline-none"
                    >
                      <option value="SECURITY">SECURITY (Sekuriteit & Buurtwag)</option>
                      <option value="PATROL">PATROL (Patrollie & Reaksie)</option>
                      <option value="FIRE">FIRE (Brandbestryding & Veldbrande)</option>
                      <option value="TRAFFIC">TRAFFIC (Verkeersbeheer & Padveiligheid)</option>
                      <option value="MEDICAL">MEDICAL (Mediese Nood & Ambulans)</option>
                      <option value="EXECUTIVE">EXECUTIVE (Bestuur & Komitee)</option>
                      <option value="COMMUNITY">COMMUNITY (Algemene Gemeenskap)</option>
                      <option value="GENERAL">GENERAL (Algemeen)</option>
                      <option value="OTHER">OTHER (Ander)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Prioriteitsvlak</label>
                    <select
                      value={formPriorityLevel}
                      onChange={(e) => setFormPriorityLevel(e.target.value as GroupPriorityLevel)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-emerald-500 outline-none"
                    >
                      <option value="CRITICAL">🚨 KRITIES (Kitsversending vir Alle Nood)</option>
                      <option value="HIGH">⚡ HOOG (Prioriteit Reaksie)</option>
                      <option value="MEDIUM">📋 MEDIUM (Gereelde Opdaterings)</option>
                      <option value="INFO">ℹ️ INFO (Slegs Algemene Kennisgewings)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Beskrywing</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Beskryf die doel en dekkingsgebied van hierdie groep..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Section 2: WhatsApp Broadcast Integration */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-emerald-500/30 space-y-3">
                <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Versending &amp; Uitsending Konfigurasie</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      WhatsApp Uitsending Formaat
                    </label>
                    <select
                      value={formWhatsappBroadcastType}
                      onChange={(e) => setFormWhatsappBroadcastType(e.target.value as WhatsAppBroadcastType)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-emerald-500 outline-none"
                    >
                      <option value="GROUP_CHAT">Groepklets (Twee-rigting Interaktief)</option>
                      <option value="BROADCAST_LIST">Uitsendinglys (Slegs Beheerkamer Alerts)</option>
                      <option value="COMMUNITY_ANNOUNCEMENT">Gemeenskapskanaal / Aankondigings</option>
                      <option value="DIRECT_LEADERS">Sektorleiers Kitskanaal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Frekwensie Beperking
                    </label>
                    <select
                      value={formBroadcastFrequency}
                      onChange={(e) => setFormBroadcastFrequency(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-emerald-500 outline-none"
                    >
                      <option value="IMMEDIATE">Onmiddellik / Real-Time Kitsversending</option>
                      <option value="HOURLY_DIGEST">Uurlikse Opsomming</option>
                      <option value="DAILY_DIGEST">Daaglikse Oggend / Aand Opsomming</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    WhatsApp Uitnodigingskakel (Group Invite Link)
                  </label>
                  <input
                    type="url"
                    value={formWhatsappInviteLink}
                    onChange={(e) => setFormWhatsappInviteLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/ExAmPlEcOdE123"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Laat lede toe om direk aan te sluit en maak kits skakeling oop in Beheerkamer.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    WhatsApp API Group JID / Channel ID (Opsioneel vir Cloud API)
                  </label>
                  <input
                    type="text"
                    value={formWhatsappGroupJid}
                    onChange={(e) => setFormWhatsappGroupJid(e.target.value)}
                    placeholder="e.g. 12036304812903@g.us of 27825551029-16182910@g.us"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Auto Dispatch Trigger Checkboxes */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-slate-200 font-bold mb-2">
                    Outomatiese Uitsending Snellers (Kies watter insidente outomaties na hierdie groep gestuur word):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 bg-slate-850 p-2 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAutoTriggers.emergencySos}
                        onChange={(e) => setFormAutoTriggers({ ...formAutoTriggers, emergencySos: e.target.checked })}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-white font-semibold">🚨 SOS Noodgevalle (Paniek)</span>
                    </label>

                    <label className="flex items-center gap-2 bg-slate-850 p-2 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAutoTriggers.farmAttack}
                        onChange={(e) => setFormAutoTriggers({ ...formAutoTriggers, farmAttack: e.target.checked })}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-white font-semibold">⚡ Plasaanvalle &amp; Gewapende Invalle</span>
                    </label>

                    <label className="flex items-center gap-2 bg-slate-850 p-2 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAutoTriggers.wildfire}
                        onChange={(e) => setFormAutoTriggers({ ...formAutoTriggers, wildfire: e.target.checked })}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-white font-semibold">🔥 Veldbrande &amp; Brandalarms</span>
                    </label>

                    <label className="flex items-center gap-2 bg-slate-850 p-2 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAutoTriggers.suspiciousVehicleBolo}
                        onChange={(e) => setFormAutoTriggers({ ...formAutoTriggers, suspiciousVehicleBolo: e.target.checked })}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-white font-semibold">🚗 BOLO Verdagte Voertuie</span>
                    </label>

                    <label className="flex items-center gap-2 bg-slate-850 p-2 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAutoTriggers.roadblockTraffic}
                        onChange={(e) => setFormAutoTriggers({ ...formAutoTriggers, roadblockTraffic: e.target.checked })}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-white font-semibold">🚧 Padblokkades &amp; Verkeer</span>
                    </label>

                    <label className="flex items-center gap-2 bg-slate-850 p-2 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAutoTriggers.sitrepSummary}
                        onChange={(e) => setFormAutoTriggers({ ...formAutoTriggers, sitrepSummary: e.target.checked })}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      <span className="text-white font-semibold">📋 Situasieverslae (Sitrep)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMuteNotifications}
                      onChange={(e) => setFormMuteNotifications(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-amber-400 font-bold">Demp Outomatiese Kennisgewings Tydelik vir hierdie Groep</span>
                  </label>
                </div>
              </div>

              {/* Section 3: Geographic Coverage & Leadership */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Geografiese Dekking &amp; Sektor Leierskap</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Sektor Kode/Naam</label>
                    <input
                      type="text"
                      value={formSector}
                      onChange={(e) => setFormSector(e.target.value)}
                      placeholder="e.g. Sektor 3"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Dekkingsradius (km)</label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={formCoverageRadius}
                      onChange={(e) => setFormCoverageRadius(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Geografiese Dekkingsbeskrywing / Grense
                  </label>
                  <input
                    type="text"
                    value={formGeoDesc}
                    onChange={(e) => setFormGeoDesc(e.target.value)}
                    placeholder="e.g. R503 noordwaarts tot by Rooipoort spoorwegkruising, insluitend Rietkuil"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Sektorleier Naam</label>
                    <input
                      type="text"
                      value={formLeaderName}
                      onChange={(e) => setFormLeaderName(e.target.value)}
                      placeholder="e.g. Johan Venter"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Sektorleier Selfoon</label>
                    <input
                      type="tel"
                      value={formLeaderPhone}
                      onChange={(e) => setFormLeaderPhone(e.target.value)}
                      placeholder="e.g. +27 82 555 1234"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  {editingGroupId ? 'Stoor Groep & Uitsending Konfigurasie' : 'Skep Uitsending Groep'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEST BROADCAST TO GROUP MODAL */}
      {testBroadcastGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-emerald-400 text-sm flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>Toets WhatsApp Uitsending na {testBroadcastGroup.name}</span>
              </h3>
              <button
                onClick={() => setTestBroadcastGroup(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Groep Kode:</span>
                  <span className="font-mono text-emerald-300 font-bold">{testBroadcastGroup.code}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Uitsending Formaat:</span>
                  <span className="font-semibold text-white">{testBroadcastGroup.whatsappBroadcastType || 'GROUP_CHAT'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bestemming Kontak:</span>
                  <span className="font-mono text-white">{testBroadcastGroup.leaderPhone || '+27 82 555 1029 (Leier)'}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Boodskap Inhoud:</label>
                <textarea
                  rows={6}
                  value={testMessageText}
                  onChange={(e) => setTestMessageText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              {testSendStatus === 'sent' && (
                <div className="bg-emerald-950/60 border border-emerald-600 text-emerald-300 p-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Uitsending suksesvol uitgevoer na WhatsApp Gateway!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestBroadcastGroup(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Kanselleer
                </button>
                <button
                  type="button"
                  disabled={testSendStatus === 'sending'}
                  onClick={handleSendTestBroadcast}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{testSendStatus === 'sending' ? 'Versend...' : 'Stuur WhatsApp Uitsending'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
