'use client';

import { useState } from 'react';
import { Shield, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface GuardianRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  approvalRequired: number;
  isCustom: boolean;
  createdAt: string;
  members: number;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  {
    id: 'approve_withdrawal',
    name: 'Approve Withdrawals',
    description: 'Can approve vault withdrawal requests'
  },
  {
    id: 'emergency_access',
    name: 'Emergency Access',
    description: 'Can authorize emergency vault access'
  },
  {
    id: 'modify_contacts',
    name: 'Modify Emergency Contacts',
    description: 'Can add or remove emergency contacts'
  },
  {
    id: 'manage_guardians',
    name: 'Manage Guardians',
    description: 'Can add, remove, or modify other guardians'
  },
  {
    id: 'update_limits',
    name: 'Update Withdrawal Limits',
    description: 'Can modify vault withdrawal limits'
  },
  {
    id: 'view_history',
    name: 'View History',
    description: 'Can access vault transaction history'
  },
  {
    id: 'approve_settings',
    name: 'Approve Settings Changes',
    description: 'Can approve changes to vault settings'
  },
  {
    id: 'revoke_access',
    name: 'Revoke Access',
    description: 'Can revoke guardian or user access'
  }
];

const DEFAULT_ROLES: GuardianRole[] = [
  {
    id: 'primary',
    name: 'Primary Guardian',
    description: 'Full control over vault recovery and approvals',
    permissions: [
      'approve_withdrawal',
      'emergency_access',
      'modify_contacts',
      'manage_guardians',
      'update_limits',
      'view_history',
      'approve_settings',
      'revoke_access'
    ],
    approvalRequired: 1,
    isCustom: false,
    createdAt: '2025-01-01',
    members: 1
  },
  {
    id: 'secondary',
    name: 'Secondary Guardian',
    description: 'Limited control with oversight requirements',
    permissions: [
      'approve_withdrawal',
      'emergency_access',
      'modify_contacts',
      'view_history'
    ],
    approvalRequired: 2,
    isCustom: false,
    createdAt: '2025-01-01',
    members: 1
  },
  {
    id: 'tertiary',
    name: 'Tertiary Guardian',
    description: 'Emergency-only access',
    permissions: ['emergency_access', 'view_history'],
    approvalRequired: 3,
    isCustom: false,
    createdAt: '2025-01-01',
    members: 1
  },
  {
    id: 'custom-1',
    name: 'Advisor Role',
    description: 'Limited advisory permissions for recovery assistance',
    permissions: ['view_history', 'approve_settings'],
    approvalRequired: 2,
    isCustom: true,
    createdAt: '2026-01-10',
    members: 2
  }
];

export function GuardianRoleCustomization() {
  const [roles, setRoles] = useState<GuardianRole[]>(DEFAULT_ROLES);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<GuardianRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    approvalRequired: 1
  });

  const getPermissionName = (permId: string) => {
    return DEFAULT_PERMISSIONS.find(p => p.id === permId)?.name || permId;
  };

  const getPermissionDescription = (permId: string) => {
    return DEFAULT_PERMISSIONS.find(p => p.id === permId)?.description || '';
  };

  const handleCreateRole = () => {
    if (formData.name && selectedPermissions.length > 0) {
      const generateId = () => `custom-${String(Math.random()).slice(2, 11)}`;
      const newRole: GuardianRole = {
        id: generateId(),
        name: formData.name,
        description: formData.description,
        permissions: selectedPermissions,
        approvalRequired: formData.approvalRequired,
        isCustom: true,
        createdAt: new Date().toISOString().split('T')[0],
        members: 0
      };
      setRoles([...roles, newRole]);
      resetForm();
    }
  };

  const handleUpdateRole = () => {
    if (editingRole && formData.name && selectedPermissions.length > 0) {
      setRoles(
        roles.map(r =>
          r.id === editingRole.id
            ? {
                ...r,
                name: formData.name,
                description: formData.description,
                permissions: selectedPermissions,
                approvalRequired: formData.approvalRequired
              }
            : r
        )
      );
      resetForm();
    }
  };

  const handleDeleteRole = (id: string) => {
    if (!DEFAULT_ROLES.find(r => r.id === id)) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  const handleEditRole = (role: GuardianRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      approvalRequired: role.approvalRequired
    });
    setSelectedPermissions(role.permissions);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', approvalRequired: 1 });
    setSelectedPermissions([]);
    setEditingRole(null);
    setShowForm(false);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const getRoleColor = (roleId: string): string => {
    if (roleId === 'primary') return 'from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30';
    if (roleId === 'secondary') return 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30';
    if (roleId === 'tertiary') return 'from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30';
    return 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Guardian Role Customization
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Define custom guardian roles with specific permissions and approval requirements.
        </p>
      </div>

      {/* Available Permissions Reference */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Available Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DEFAULT_PERMISSIONS.map(perm => (
            <div key={perm.id} className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{perm.name}</p>
              <p className="text-slate-600 dark:text-slate-400">{perm.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Role Form */}
      {showForm && (
        <div className="bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h3>
            <button
              onClick={resetForm}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Role Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Financial Advisor"
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this role's purpose and responsibilities"
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Approval Requirement (out of 3 guardians)
            </label>
            <select
              value={formData.approvalRequired}
              onChange={(e) => setFormData({ ...formData, approvalRequired: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value={1}>1 Approval Required (Low Security)</option>
              <option value={2}>2 Approvals Required (Medium Security)</option>
              <option value={3}>3 Approvals Required (High Security)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Select Permissions
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {DEFAULT_PERMISSIONS.map(perm => (
                <label key={perm.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{perm.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{perm.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={editingRole ? handleUpdateRole : handleCreateRole}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
            >
              {editingRole ? 'Update Role' : 'Create Role'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Role Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Custom Role
        </button>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roles.map(role => (
          <div
            key={role.id}
            className={`bg-gradient-to-br ${getRoleColor(role.id)} border border-slate-200 dark:border-slate-700 rounded-lg p-5 space-y-4`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">{role.name}</h3>
                  {!role.isCustom && (
                    <span className="text-xs bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{role.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                {role.isCustom && (
                  <>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded transition-colors"
                      title="Edit role"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-2 bg-white dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                      title="Delete role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Approval Requirement */}
            <div className="bg-white/60 dark:bg-slate-800/40 rounded p-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Approval Requirement
              </p>
              <p className="text-sm text-slate-900 dark:text-white font-semibold">
                {role.approvalRequired} of 3 Guardian{role.approvalRequired !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i <= role.approvalRequired
                        ? 'bg-success'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Members */}
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-slate-700 dark:text-slate-300">
                {role.members} member{role.members !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Permissions */}
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Permissions ({role.permissions.length})
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {role.permissions.map(permId => (
                  <div
                    key={permId}
                    className="flex items-start gap-2 p-2 bg-white/40 dark:bg-slate-800/40 rounded text-xs"
                  >
                    <CheckCircle className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {getPermissionName(permId)}
                      </p>
                      <p className="text-slate-700 dark:text-slate-400 text-xs">
                        {getPermissionDescription(permId)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="pt-3 border-t border-white/20 dark:border-slate-700/40">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Created: {role.createdAt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Role Management Summary</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Total Roles: {roles.length}</li>
          <li>• Default Roles: {roles.filter(r => !r.isCustom).length}</li>
          <li>• Custom Roles: {roles.filter(r => r.isCustom).length}</li>
          <li>• Total Members: {roles.reduce((sum, r) => sum + r.members, 0)}</li>
        </ul>
      </div>
    </div>
  );
}
