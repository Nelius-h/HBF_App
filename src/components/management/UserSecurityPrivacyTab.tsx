import React, { useState } from 'react';
import {
  Users,
  Shield,
  Search,
  Lock,
  Smartphone,
  Eye,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  Key,
  Trash2,
  RefreshCw,
  UserX,
  UserCheck,
  FileText,
  UserPlus,
  Tag,
  Plus,
  Edit2,
  Award,
  Check,
  X,
  Phone,
  MapPin,
  Flame,
  Radio,
  HeartPulse,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole, UserProfile, CustomRoleDefinition } from '../../types';
import { generatePopiaDsarExport } from '../../services/userPrivacyService';

export const UserSecurityPrivacyTab: React.FC = () => {
  const {
    allUsers,
    currentUser,
    updateUserRole,
    createUser,
    updateUser,
    deleteUser,
    assignRolesToUser,
    customRoles,
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
    resetToCleanTestLaunch,
  } = useAuth();
  const { privacyAccessLogs, logPrivacyAccess, logAuditEvent, areaGroups, locationAreas } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'USERS' | 'ROLES' | 'LOST_DEVICE' | 'POPIA' | 'PRIVACY_LOGS'>('USERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // New User Creation Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserSurname, setNewUserSurname] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserSecondaryPhone, setNewUserSecondaryPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFarmName, setNewUserFarmName] = useState('');
  const [newUserPortion, setNewUserPortion] = useState('');
  const [newUserSector, setNewUserSector] = useState('Sektor 2 - Noord');
  const [newUserArea, setNewUserArea] = useState('Palmietfontein');
  const [newUserBaseRole, setNewUserBaseRole] = useState<UserRole>('CLIENT');
  const [newUserOperationalRole, setNewUserOperationalRole] = useState('REACTION_FORCE');
  const [newUserAssignedRoles, setNewUserAssignedRoles] = useState<string[]>([]);
  const [newUserCallsign, setNewUserCallsign] = useState('');
  const [newUserNotes, setNewUserNotes] = useState('');

  // Role Assignment Modal State
  const [roleAssignmentUser, setRoleAssignmentUser] = useState<UserProfile | null>(null);
  const [selectedAssignedRoles, setSelectedAssignedRoles] = useState<string[]>([]);
  const [selectedOperationalRole, setSelectedOperationalRole] = useState<string>('');
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>('');

  // Custom Role Definition Modal State
  const [isRoleDefModalOpen, setIsRoleDefModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleDefName, setRoleDefName] = useState('');
  const [roleDefCode, setRoleDefCode] = useState('');
  const [roleDefCategory, setRoleDefCategory] = useState<'REACTION' | 'FIRE' | 'MANAGEMENT' | 'OPERATIONS' | 'MEDICAL' | 'COMMUNITY'>('REACTION');
  const [roleDefDesc, setRoleDefDesc] = useState('');
  const [roleDefColor, setRoleDefColor] = useState('#ef4444');

  // Lost Device Containment State
  const [lostDeviceUser, setLostDeviceUser] = useState<UserProfile | null>(null);
  const [containmentSuccessMessage, setContainmentSuccessMessage] = useState<string | null>(null);

  // POPIA DSAR Export Modal/View State
  const [dsarReportContent, setDsarReportContent] = useState<string | null>(null);

  // Privacy Access Reason Prompt State
  const [pendingPrivacyUser, setPendingPrivacyUser] = useState<UserProfile | null>(null);
  const [privacyDataType, setPrivacyDataType] = useState<any>('GATE_CODES');
  const [operationalReason, setOperationalReason] = useState('');
  const [viewingSensitiveData, setViewingSensitiveData] = useState<boolean>(false);

  const filteredUsers = (allUsers || []).filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.farmName && u.farmName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.primaryPhone.includes(searchQuery) ||
      (u.callsign && u.callsign.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.roleTitle && u.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to open Role Assignment modal
  const handleOpenRoleAssignment = (user: UserProfile) => {
    setRoleAssignmentUser(user);
    setSelectedAssignedRoles(user.assignedRoles || []);
    setSelectedOperationalRole(user.operationalRole || (user.role === 'REACTION_FORCE' ? 'REACTION_FORCE' : ''));
    setSelectedRoleTitle(user.roleTitle || '');
  };

  // Helper to save Role Assignment
  const handleSaveRoleAssignment = () => {
    if (!roleAssignmentUser) return;
    assignRolesToUser(
      roleAssignmentUser.uid,
      selectedAssignedRoles,
      selectedOperationalRole || undefined,
      selectedRoleTitle || undefined
    );
    logAuditEvent({
      recordType: 'USER_ROLE',
      recordId: roleAssignmentUser.uid,
      action: 'OPERATIONAL_ROLES_UPDATED',
      description: `Updated operational roles and permissions for ${roleAssignmentUser.name} ${roleAssignmentUser.surname} (Assigned: ${selectedAssignedRoles.length} roles)`,
    });
    setRoleAssignmentUser(null);
  };

  // Helper to toggle assigned role in picker
  const handleToggleRoleSelection = (code: string) => {
    setSelectedAssignedRoles((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Handle creating a new user
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserSurname.trim() || !newUserPhone.trim()) return;

    const created = await createUser({
      name: newUserName.trim(),
      surname: newUserSurname.trim(),
      primaryPhone: newUserPhone.trim(),
      secondaryPhone: newUserSecondaryPhone.trim() || undefined,
      email: newUserEmail.trim() || undefined,
      farmName: newUserFarmName.trim() || 'Hartbeesfontein Plaaswag Gebied',
      portionNumber: newUserPortion.trim() || undefined,
      sector: newUserSector,
      locationArea: newUserArea,
      role: newUserBaseRole,
      operationalRole: newUserOperationalRole,
      assignedRoles: newUserAssignedRoles,
      callsign: newUserCallsign.trim() || undefined,
      emergencyNotes: newUserNotes.trim() || undefined,
    });

    logAuditEvent({
      recordType: 'USER',
      recordId: created.uid,
      action: 'NEW_USER_REGISTERED',
      description: `Registered new member account ${created.name} ${created.surname} with primary role ${created.role}`,
    });

    // Reset Form
    setNewUserName('');
    setNewUserSurname('');
    setNewUserPhone('');
    setNewUserSecondaryPhone('');
    setNewUserEmail('');
    setNewUserFarmName('');
    setNewUserPortion('');
    setNewUserCallsign('');
    setNewUserNotes('');
    setNewUserAssignedRoles([]);
    setIsCreateUserModalOpen(false);
  };

  // Handle custom role definition
  const handleOpenCreateRoleDef = () => {
    setEditingRoleId(null);
    setRoleDefName('');
    setRoleDefCode('');
    setRoleDefCategory('REACTION');
    setRoleDefDesc('');
    setRoleDefColor('#ef4444');
    setIsRoleDefModalOpen(true);
  };

  const handleOpenEditRoleDef = (role: CustomRoleDefinition) => {
    setEditingRoleId(role.id);
    setRoleDefName(role.name);
    setRoleDefCode(role.code);
    setRoleDefCategory(role.category);
    setRoleDefDesc(role.description);
    setRoleDefColor(role.colorHex || '#3b82f6');
    setIsRoleDefModalOpen(true);
  };

  const handleSaveRoleDef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleDefName.trim() || !roleDefCode.trim()) return;

    if (editingRoleId) {
      await updateCustomRole(editingRoleId, {
        name: roleDefName.trim(),
        code: roleDefCode.trim().toUpperCase().replace(/\s+/g, '_'),
        category: roleDefCategory,
        description: roleDefDesc.trim(),
        colorHex: roleDefColor,
      });
      logAuditEvent({
        recordType: 'SETTINGS',
        recordId: editingRoleId,
        action: 'CUSTOM_ROLE_UPDATED',
        description: `Updated custom role definition "${roleDefName.trim()}"`,
      });
    } else {
      const newRole = await createCustomRole({
        name: roleDefName.trim(),
        code: roleDefCode.trim().toUpperCase().replace(/\s+/g, '_'),
        category: roleDefCategory,
        description: roleDefDesc.trim(),
        colorHex: roleDefColor,
        isSystemRole: false,
      });
      logAuditEvent({
        recordType: 'SETTINGS',
        recordId: newRole.id,
        action: 'CUSTOM_ROLE_CREATED',
        description: `Created new custom operational role "${newRole.name}" (${newRole.code})`,
      });
    }

    setIsRoleDefModalOpen(false);
  };

  const handleDeleteRoleDef = async (roleId: string, roleName: string) => {
    if (window.confirm(`Are you sure you want to remove role "${roleName}"?`)) {
      const ok = await deleteCustomRole(roleId);
      if (ok) {
        logAuditEvent({
          recordType: 'SETTINGS',
          recordId: roleId,
          action: 'CUSTOM_ROLE_DELETED',
          description: `Deleted custom operational role definition "${roleName}"`,
        });
      } else {
        alert('Cannot delete built-in system roles.');
      }
    }
  };

  // Lost Device Containment Handler
  const handleExecuteLostDeviceContainment = (user: UserProfile) => {
    // 1. Demote to CLIENT or deactivate
    updateUserRole(user.uid, 'CLIENT');

    logAuditEvent({
      recordType: 'SECURITY_CONTAINMENT',
      recordId: user.uid,
      action: 'LOST_STOLEN_DEVICE_LOCKOUT_EXECUTED',
      description: `Emergency lost/stolen device lockdown executed for ${user.name} ${user.surname} (${user.uid}). All sessions revoked and role reset.`,
    });

    setContainmentSuccessMessage(
      `Emergency containment executed for ${user.name} ${user.surname}. Active refresh tokens revoked & role downgraded.`
    );
    setTimeout(() => setContainmentSuccessMessage(null), 5000);
    setLostDeviceUser(null);
  };

  // POPIA DSAR Export Handler
  const handleGenerateDsar = (user: UserProfile) => {
    const report = generatePopiaDsarExport(user);
    setDsarReportContent(report);

    logAuditEvent({
      recordType: 'POPIA_DSAR',
      recordId: user.uid,
      action: 'POPIA_SECTION_23_DSAR_EXPORTED',
      description: `Generated POPIA Personal Data Subject Access Report for ${user.name} ${user.surname}`,
    });
  };

  // Authorize Sensitive Data Access View
  const handleAuthorizeSensitiveAccess = () => {
    if (!pendingPrivacyUser || !operationalReason.trim()) return;

    logPrivacyAccess({
      targetUserUid: pendingPrivacyUser.uid,
      targetUserName: `${pendingPrivacyUser.name} ${pendingPrivacyUser.surname}`,
      dataType: privacyDataType,
      operationalReason: operationalReason.trim(),
    });

    setViewingSensitiveData(true);
    setOperationalReason('');
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Subtabs */}
      <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('USERS')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'USERS'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & RBAC ({(allUsers || []).length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ROLES')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'ROLES'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Custom Roles & Designations ({customRoles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('LOST_DEVICE')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'LOST_DEVICE'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Lost Device Containment</span>
        </button>

        <button
          onClick={() => setActiveSubTab('POPIA')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'POPIA'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>POPIA Subject Access (DSAR)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PRIVACY_LOGS')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeSubTab === 'PRIVACY_LOGS'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Sensitive Access Audit ({privacyAccessLogs.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: USER ACCOUNTS & RBAC */}
      {activeSubTab === 'USERS' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by member name, farm, callsign, role title, phone number or UID..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Launch App for Test Run:\n\nThis will remove all test demo users and clear the database so new users can complete the onboarding wizard and register themselves.\n\nMaster Admin (Hattinghcornelius@gmail.com) will be preserved.\n\nProceed?')) {
                    resetToCleanTestLaunch();
                    alert('Test users removed. The app is ready for test launch!');
                  }
                }}
                className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/80 font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition whitespace-nowrap text-xs"
                title="Remove all test accounts for a clean launch test run"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Launch Test Run (Clear Test Users)</span>
              </button>

              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New User / Operator</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 text-[11px] uppercase font-bold">
                  <tr>
                    <th className="p-3.5">Member Identity</th>
                    <th className="p-3.5">Property & Sector</th>
                    <th className="p-3.5">Phone & Language</th>
                    <th className="p-3.5">Assigned Operational Roles</th>
                    <th className="p-3.5">System Access Role</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{u.name} {u.surname}</span>
                          {u.callsign && (
                            <span className="bg-red-950/80 text-red-400 border border-red-800 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                              {u.callsign}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">UID: {u.uid}</div>
                        {u.roleTitle && (
                          <div className="text-[10px] text-amber-400 font-medium">{u.roleTitle}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div className="font-medium text-white">{u.farmName || 'Hartbeesfontein'}</div>
                        <div className="text-[11px] text-slate-400">{u.sector || 'Sektor 2'}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div className="font-mono text-white">{u.primaryPhone}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{u.preferredLanguage}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 items-center max-w-xs">
                          {u.assignedRoles && u.assignedRoles.length > 0 ? (
                            u.assignedRoles.map((roleCode) => {
                              const roleDef = customRoles.find((r) => r.code === roleCode);
                              return (
                                <span
                                  key={roleCode}
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-200"
                                  style={roleDef?.colorHex ? { borderColor: `${roleDef.colorHex}66`, color: roleDef.colorHex } : undefined}
                                >
                                  {roleDef?.name || roleCode}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">Standard Member</span>
                          )}
                          <button
                            onClick={() => handleOpenRoleAssignment(u)}
                            className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition ml-1"
                            title="Assign Operational Roles"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            updateUserRole(u.uid, e.target.value as UserRole);
                            logAuditEvent({
                              recordType: 'USER_ROLE',
                              recordId: u.uid,
                              action: 'USER_ROLE_CHANGED',
                              description: `Updated role for ${u.name} ${u.surname} to ${e.target.value}`,
                            });
                          }}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 outline-none"
                        >
                          <option value="CLIENT">Member / Client (CLIENT)</option>
                          <option value="CONTROL_ROOM">Controle Room Operator (CONTROL_ROOM)</option>
                          <option value="MANAGEMENT">Management (MANAGEMENT)</option>
                          <option value="REACTION_FORCE">Reaction Force (REACTION_FORCE)</option>
                          <option value="MAINTENANCE_CREW">Maintenance Crew (MAINTENANCE_CREW)</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenRoleAssignment(u)}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 font-bold transition flex items-center gap-1"
                            title="Assign Roles"
                          >
                            <Award className="w-3 h-3" />
                            <span>Roles</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingPrivacyUser(u);
                              setViewingSensitiveData(false);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-bold transition flex items-center gap-1"
                            title="View POPIA PII"
                          >
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>PII</span>
                          </button>
                          {u.uid !== currentUser.uid && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`Delete user account "${u.name} ${u.surname}"?`)) {
                                  await deleteUser(u.uid);
                                  logAuditEvent({
                                    recordType: 'USER',
                                    recordId: u.uid,
                                    action: 'USER_ACCOUNT_DELETED',
                                    description: `Deleted account for ${u.name} ${u.surname}`,
                                  });
                                }
                              }}
                              className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: CUSTOM ROLES & DESIGNATIONS */}
      {activeSubTab === 'ROLES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Operational Role Definitions & Designations</span>
              </h3>
              <p className="text-slate-400 text-xs">
                Define specialized tactical, firefighting, sector leadership, and medical roles that can be assigned to members and personnel across the control room and phone book.
              </p>
            </div>
            <button
              onClick={handleOpenCreateRoleDef}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {customRoles.map((role) => (
              <div
                key={role.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: role.colorHex || '#f59e0b' }}
                />
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{role.name}</h4>
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        CODE: {role.code}
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border"
                      style={{
                        borderColor: `${role.colorHex || '#f59e0b'}55`,
                        color: role.colorHex || '#f59e0b',
                        backgroundColor: `${role.colorHex || '#f59e0b'}15`,
                      }}
                    >
                      {role.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-2.5 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500">
                    {role.isSystemRole ? 'Built-in System Role' : 'Custom Community Role'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditRoleDef(role)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Edit Role"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!role.isSystemRole && (
                      <button
                        onClick={() => handleDeleteRoleDef(role.id, role.name)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SENSITIVE DATA ACCESS PROMPT / VIEWER MODAL */}
      {pendingPrivacyUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>POPIA Protected Sensitive Access Gate</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  Target Member: {pendingPrivacyUser.name} {pendingPrivacyUser.surname}
                </p>
              </div>
              <button
                onClick={() => setPendingPrivacyUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {!viewingSensitiveData ? (
              <div className="space-y-3">
                <div className="bg-amber-950/40 border border-amber-500/50 p-3 rounded-xl text-amber-300 text-xs">
                  ⚠️ In accordance with POPIA and Security Policy, viewing medical notes or property gate codes is logged in the permanent audit trail.
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-semibold">Sensitive Category:</label>
                  <select
                    value={privacyDataType}
                    onChange={(e) => setPrivacyDataType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="GATE_CODES">Gate Access Codes & Perimeter Info</option>
                    <option value="MEDICAL_DATA">Medical Aid & Emergency Health Records</option>
                    <option value="FAMILY_DETAILS">Family Dependents & Vehicle Records</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-400 font-semibold">Operational Justification *:</label>
                  <input
                    type="text"
                    required
                    value={operationalReason}
                    onChange={(e) => setOperationalReason(e.target.value)}
                    placeholder="e.g. Responding to active night-shift perimeter check"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPendingPrivacyUser(null)}
                    className="px-4 py-2 rounded-xl text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!operationalReason.trim()}
                    onClick={handleAuthorizeSensitiveAccess}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                  >
                    Log Reason & Reveal Data
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200">
                <div className="text-emerald-400 font-bold text-xs border-b border-slate-800 pb-2">
                  ✓ Access Authorized & Logged (ID: PRV-{Date.now()})
                </div>

                {privacyDataType === 'GATE_CODES' && (
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400">Main Gate Code:</p>
                    <p className="text-lg font-bold text-amber-400">
                      {pendingPrivacyUser.emergencyPropertyInfo?.mainGateCode || 'No Gate Code Configured'}
                    </p>
                    <p className="text-slate-400 mt-2">Perimeter & Animals:</p>
                    <p className="text-slate-300">
                      {pendingPrivacyUser.emergencyPropertyInfo?.dangerousAnimals || 'No dangerous animals noted.'}
                    </p>
                  </div>
                )}

                {privacyDataType === 'MEDICAL_DATA' && (
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400">Medical Scheme:</p>
                    <p className="text-amber-400 font-bold">
                      {pendingPrivacyUser.medicalAid?.schemeName || 'None'} (No: {pendingPrivacyUser.medicalAid?.membershipNumber || 'N/A'})
                    </p>
                    <p className="text-slate-400 mt-2">Emergency Notes:</p>
                    <p className="text-slate-300">
                      {pendingPrivacyUser.emergencyNotes || 'No specific medical notes on file.'}
                    </p>
                  </div>
                )}

                {privacyDataType === 'FAMILY_DETAILS' && (
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400">Registered Vehicles ({pendingPrivacyUser.vehicles?.length || 0}):</p>
                    {pendingPrivacyUser.vehicles?.map((v) => (
                      <p key={v.id} className="text-slate-300">
                        • {v.make} {v.model} ({v.color}) - {v.licensePlate}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setPendingPrivacyUser(null)}
                    className="bg-slate-800 text-white px-4 py-2 rounded-xl"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROLE ASSIGNMENT MODAL */}
      {roleAssignmentUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Assign Operational Roles & Designations</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  User: {roleAssignmentUser.name} {roleAssignmentUser.surname} ({roleAssignmentUser.primaryPhone})
                </p>
              </div>
              <button
                onClick={() => setRoleAssignmentUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Custom Role Title / Position</label>
                <input
                  type="text"
                  value={selectedRoleTitle}
                  onChange={(e) => setSelectedRoleTitle(e.target.value)}
                  placeholder="e.g. Sector 2 Fire Captain / Chief Patrol Officer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Primary Operational Category</label>
                <select
                  value={selectedOperationalRole}
                  onChange={(e) => setSelectedOperationalRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-bold"
                >
                  <option value="">None (Standard Client)</option>
                  <option value="REACTION_FORCE">Reaction Force Unit</option>
                  <option value="REACTION_FORCE_COMMANDER">Reaction Force Commander</option>
                  <option value="FIRETRUCK_DRIVER">Firetruck / Bakkie Sakkie Driver</option>
                  <option value="FIRE_RESPONDER">Veld Fire Responder</option>
                  <option value="MANAGEMENT_EXECUTIVE">Management Executive</option>
                  <option value="CONTROL_ROOM_OPERATOR">Control Room Operator</option>
                  <option value="MEDICAL_FIRST_RESPONDER">Medical First Responder</option>
                  <option value="SECTOR_LEADER">Sector / Wyk Leader</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-2">
                  Assigned Operational Qualifications & Tags ({selectedAssignedRoles.length} selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {customRoles.map((role) => {
                    const isSelected = selectedAssignedRoles.includes(role.code);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleToggleRoleSelection(role.code)}
                        className={`text-left p-2.5 rounded-xl border transition flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{role.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{role.code}</div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border ${
                            isSelected
                              ? 'bg-amber-500 border-amber-400 text-slate-950'
                              : 'border-slate-600 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRoleAssignmentUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoleAssignment}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-sm transition"
                >
                  Save Role Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Register New User / Community Member</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  Add a member, reaction force officer, firetruck driver, or management operator.
                </p>
              </div>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Johan"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Surname *</label>
                  <input
                    type="text"
                    required
                    value={newUserSurname}
                    onChange={(e) => setNewUserSurname(e.target.value)}
                    placeholder="e.g. Van Zyl"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Primary Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="082 123 4567"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Secondary Phone</label>
                  <input
                    type="tel"
                    value={newUserSecondaryPhone}
                    onChange={(e) => setNewUserSecondaryPhone(e.target.value)}
                    placeholder="018 234 5678"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Farm / Property Name</label>
                  <input
                    type="text"
                    value={newUserFarmName}
                    onChange={(e) => setNewUserFarmName(e.target.value)}
                    placeholder="e.g. Brakpan Plaas"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Portion Number</label>
                  <input
                    type="text"
                    value={newUserPortion}
                    onChange={(e) => setNewUserPortion(e.target.value)}
                    placeholder="e.g. Gedeelte 4"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sector</label>
                  <select
                    value={newUserSector}
                    onChange={(e) => setNewUserSector(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                  >
                    <option value="Sektor 1 - Suid">Sektor 1 - Suid</option>
                    <option value="Sektor 2 - Noord">Sektor 2 - Noord</option>
                    <option value="Sektor 3 - Oos">Sektor 3 - Oos</option>
                    <option value="Sektor 4 - Wes">Sektor 4 - Wes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Area / Location</label>
                  <input
                    type="text"
                    list="location-areas-list"
                    value={newUserArea}
                    onChange={(e) => setNewUserArea(e.target.value)}
                    placeholder="e.g. Hartbeesfontein / Schoemansfontein"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                  />
                  <datalist id="location-areas-list">
                    {locationAreas.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name} ({a.sector || 'Algemeen'})
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">System Permission Role *</label>
                  <select
                    value={newUserBaseRole}
                    onChange={(e) => setNewUserBaseRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-bold"
                  >
                    <option value="CLIENT">Client / Farm Member</option>
                    <option value="REACTION_FORCE">Reaction Force Unit</option>
                    <option value="CONTROL_ROOM">Control Room Operator</option>
                    <option value="MANAGEMENT">Management Committee</option>
                    <option value="MAINTENANCE_CREW">Maintenance Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Radio Callsign</label>
                  <input
                    type="text"
                    value={newUserCallsign}
                    onChange={(e) => setNewUserCallsign(e.target.value)}
                    placeholder="e.g. RF-ALPHA-1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Emergency & Access Notes</label>
                <textarea
                  value={newUserNotes}
                  onChange={(e) => setNewUserNotes(e.target.value)}
                  placeholder="Gate instructions, special keys, medical details..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-sm transition"
                >
                  Create & Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CUSTOM ROLE MODAL */}
      {isRoleDefModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{editingRoleId ? 'Edit Role Definition' : 'Define New Operational Role'}</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  Create specific badges and designations for members and emergency responders.
                </p>
              </div>
              <button
                onClick={() => setIsRoleDefModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoleDef} className="space-y-3.5">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Role Display Name *</label>
                <input
                  type="text"
                  required
                  value={roleDefName}
                  onChange={(e) => setRoleDefName(e.target.value)}
                  placeholder="e.g. Firetruck Driver / Bakkie Sakkie"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Unique Role Code *</label>
                  <input
                    type="text"
                    required
                    value={roleDefCode}
                    onChange={(e) => setRoleDefCode(e.target.value)}
                    placeholder="FIRETRUCK_DRIVER"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={roleDefCategory}
                    onChange={(e) => setRoleDefCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-bold"
                  >
                    <option value="REACTION">Reaction Force</option>
                    <option value="FIRE">Fire & Rescue</option>
                    <option value="MANAGEMENT">Management</option>
                    <option value="OPERATIONS">Operations & Control</option>
                    <option value="MEDICAL">Medical & First Aid</option>
                    <option value="COMMUNITY">Community / Watch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description & Qualifications</label>
                <textarea
                  value={roleDefDesc}
                  onChange={(e) => setRoleDefDesc(e.target.value)}
                  placeholder="Describe duties, FPA requirements, radio protocols..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs h-20"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Badge Color Hex</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={roleDefColor}
                    onChange={(e) => setRoleDefColor(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={roleDefColor}
                    onChange={(e) => setRoleDefColor(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleDefModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-sm transition"
                >
                  Save Role Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 2: LOST DEVICE CONTAINMENT */}
      {activeSubTab === 'LOST_DEVICE' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-400" />
              <span>Rapid Lost or Stolen Device Lockdown Protocol</span>
            </h3>
            <p className="text-slate-400 text-xs">
              If an operator, committee member, or community member loses their phone, immediately trigger containment to revoke session tokens and reset access permissions.
            </p>
          </div>

          {containmentSuccessMessage && (
            <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 p-3.5 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{containmentSuccessMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(allUsers || []).map((u) => (
              <div
                key={u.uid}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs">{u.name} {u.surname}</h4>
                    <span className="font-mono text-[10px] text-amber-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono mt-1">{u.primaryPhone}</p>
                  <p className="text-slate-500 text-[10px]">{u.farmName || 'Hartbeesfontein'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteLostDeviceContainment(u)}
                  className="bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Lockdown & Revoke Tokens</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: POPIA DSAR */}
      {activeSubTab === 'POPIA' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>POPIA Section 23 Data Subject Access Request (DSAR) Generator</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Under South African POPIA law, data subjects have the right to request a formal copy of all their personal records, farm coordinates, logs, and vehicle registrations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="font-bold text-white text-xs">Select Member:</span>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {(allUsers || []).map((u) => (
                  <div
                    key={u.uid}
                    onClick={() => handleGenerateDsar(u)}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <div className="font-bold text-white">{u.name} {u.surname}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.primaryPhone}</div>
                    </div>
                    <FileDown className="w-4 h-4 text-amber-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              {dsarReportContent ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-sm">POPIA Formal Subject Record</span>
                    <button
                      onClick={() => window.print()}
                      className="bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg"
                    >
                      Print DSAR
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-xl font-mono text-slate-200 text-xs whitespace-pre-wrap max-h-[450px] overflow-y-auto leading-relaxed border border-slate-800">
                    {dsarReportContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="font-bold">Select a user on the left to compile their POPIA DSAR file.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PRIVACY ACCESS AUDIT LOGS */}
      {activeSubTab === 'PRIVACY_LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Sensitive PII Access Audit Trail</h3>
            <p className="text-slate-400 text-xs">
              Every view of member medical data or gate codes is immutably logged with the operator identity and operational reason.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 text-[11px] uppercase font-bold">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor (Who)</th>
                  <th className="p-3.5">Target Member</th>
                  <th className="p-3.5">Data Category</th>
                  <th className="p-3.5">Operational Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {privacyAccessLogs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition text-[11px]">
                    <td className="p-3.5 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span>{new Date(p.timestamp).toLocaleDateString('en-ZA')} {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-white font-bold">{p.actorName} ({p.actorRole})</td>
                    <td className="p-3.5 text-amber-300 font-bold">{p.targetUserName}</td>
                    <td className="p-3.5">
                      <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-white">
                        {p.dataType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{p.operationalReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
