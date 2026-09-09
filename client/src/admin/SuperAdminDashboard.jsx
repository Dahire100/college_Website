import React, { useState, useEffect } from 'react';
import {
  Shield, Server, Building2, Plus, Users, Search, RefreshCw,
  Power, PowerOff, CheckCircle2, AlertTriangle, Key, ExternalLink,
  Activity, Database, HardDrive, Cpu, LogOut, Lock, Eye, EyeOff,
  History, ArrowRight, Settings, Check, X, ShieldAlert, BarChart3,
  LayoutDashboard, FolderGit2, Sparkles, GraduationCap, Globe, Trash2, User
} from 'lucide-react';
import { superAdminApi } from '../services/api';

export default function SuperAdminDashboard({ onToast, onNavigate, onLogout }) {
  const [isAuthenticated, setIsAuthenticated] = useState(superAdminApi.isAuthenticated());
  const [superAdminUser, setSuperAdminUser] = useState(superAdminApi.getUser());
  
  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Navigation tab
  const [currentTab, setCurrentTab] = useState('tenants'); // 'tenants', 'health', 'audit', 'profile'
  
  // Tenants state
  const [tenants, setTenants] = useState([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Health state
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Audit state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditActionFilter, setAuditActionFilter] = useState('');

  // Database Explorer state
  const [dbData, setDbData] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbActionLoading, setDbActionLoading] = useState(false);
  const [colSearchTerm, setColSearchTerm] = useState('');
  const [colScopeFilter, setColScopeFilter] = useState('all');

  // Profile & Security state
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFullName, setProfileFullName] = useState(superAdminUser?.fullName || 'Platform Super Administrator');
  const [profileEmail, setProfileEmail] = useState(superAdminUser?.email || 'superadmin@apex-inst.edu');
  const [profileUpdating, setProfileUpdating] = useState(false);

  // Password rotation state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passUpdating, setPassUpdating] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantUsage, setTenantUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // Deletion safety modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [newTenant, setNewTenant] = useState({
    name: '',
    domain: '',
    subdomain: '',
    plan: 'standard',
    primaryColor: '#00529B',
    collegeName: '',
    storageLimitMb: 500
  });
  const [editTenantForm, setEditTenantForm] = useState({
    name: '',
    domain: '',
    subdomain: '',
    plan: 'standard',
    primaryColor: '#00529B'
  });
  const [resetAdminForm, setResetAdminForm] = useState({
    username: 'admin',
    newPassword: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      setIsAuthenticated(false);
      setSuperAdminUser(null);
      if (onLogout) onLogout();
      if (onToast) onToast('SuperAdmin session expired. Please log in again.', 'error');
    };
    window.addEventListener('superadmin_auth_expired', handleExpired);
    return () => window.removeEventListener('superadmin_auth_expired', handleExpired);
  }, [onToast, onLogout]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTenants();
      loadHealth();
      loadAuditLogs();
      loadProfile();
      loadDatabase();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await superAdminApi.post('/superadmin/login', { username, password });
      if (res.success && res.token) {
        superAdminApi.setAuth(res.token, res.superAdmin);
        setIsAuthenticated(true);
        setSuperAdminUser(res.superAdmin);
        if (onToast) onToast('Welcome to SuperAdmin Control Plane', 'success');
      } else {
        setLoginError(res.message || 'Login failed');
      }
    } catch (err) {
      setLoginError(err.message || 'Authentication error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    superAdminApi.clearAuth();
    setIsAuthenticated(false);
    setSuperAdminUser(null);
    if (onLogout) onLogout();
    if (onToast) onToast('Logged out of SuperAdmin Control Plane', 'info');
  };

  const loadTenants = async () => {
    setTenantsLoading(true);
    try {
      const res = await superAdminApi.get('/superadmin/tenants');
      if (res.success) {
        setTenants(res.tenants || []);
      }
    } catch (err) {
      if (onToast) onToast('Failed to load tenants: ' + err.message, 'error');
    } finally {
      setTenantsLoading(false);
    }
  };

  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await superAdminApi.get('/superadmin/health');
      if (res.success) {
        setHealthData(res);
      }
    } catch (err) {
      console.error('Health fetch failed', err);
    } finally {
      setHealthLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const query = auditActionFilter ? `?action=${auditActionFilter}` : '';
      const res = await superAdminApi.get(`/superadmin/audit-log${query}`);
      if (res.success) {
        setAuditLogs(res.data || []);
      }
    } catch (err) {
      console.error('Audit fetch failed', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await superAdminApi.get('/superadmin/profile');
      if (res.success && res.superAdmin) {
        setProfileData(res.superAdmin);
        setProfileFullName(res.superAdmin.fullName || 'Platform Super Administrator');
        setProfileEmail(res.superAdmin.email || 'superadmin@apex-inst.edu');
      }
    } catch (err) {
      console.error('Profile fetch failed', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadDatabase = async () => {
    setDbLoading(true);
    try {
      const res = await superAdminApi.get('/superadmin/database');
      if (res.success) {
        setDbData(res);
      }
    } catch (err) {
      console.error('Database fetch failed', err);
    } finally {
      setDbLoading(false);
    }
  };

  const handlePingDatabase = async () => {
    setDbActionLoading(true);
    try {
      const res = await superAdminApi.post('/superadmin/database/ping');
      if (res.success) {
        if (onToast) onToast(`Database ping successful! Latency: ${res.latencyMs} ms (${res.provider})`, 'success');
        loadDatabase();
      }
    } catch (err) {
      if (onToast) onToast('Ping failed: ' + err.message, 'error');
    } finally {
      setDbActionLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    setDbActionLoading(true);
    try {
      const res = await superAdminApi.post('/superadmin/database/verify-integrity');
      if (res.success) {
        if (res.healthy) {
          if (onToast) onToast(res.message, 'success');
        } else {
          if (onToast) onToast(`Isolation audit flagged ${res.totalIssues} issue(s).`, 'error');
        }
        loadDatabase();
      }
    } catch (err) {
      if (onToast) onToast('Integrity verification failed: ' + err.message, 'error');
    } finally {
      setDbActionLoading(false);
    }
  };

  const handleFixUnscoped = async () => {
    if (!window.confirm('Auto-heal database: bind all unstamped legacy documents to the root platform tenant (localhost)?')) return;
    setDbActionLoading(true);
    try {
      const res = await superAdminApi.post('/superadmin/database/fix-unscoped');
      if (res.success) {
        if (onToast) onToast(res.message, 'success');
        loadDatabase();
      }
    } catch (err) {
      if (onToast) onToast('Fix failed: ' + err.message, 'error');
    } finally {
      setDbActionLoading(false);
    }
  };

  const handlePurgeOrphans = async () => {
    if (!window.confirm('Purge all orphaned database records that point to non-existent or deleted colleges? This action cleans up leftover test data.')) return;
    setDbActionLoading(true);
    try {
      const res = await superAdminApi.post('/superadmin/database/purge-orphans');
      if (res.success) {
        if (onToast) onToast(res.message, 'success');
        loadDatabase();
      }
    } catch (err) {
      if (onToast) onToast('Purge failed: ' + err.message, 'error');
    } finally {
      setDbActionLoading(false);
    }
  };

  const handleUpdateProfileDetails = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    try {
      const res = await superAdminApi.put('/superadmin/profile', {
        fullName: profileFullName,
        email: profileEmail
      });
      if (res.success) {
        setProfileData(res.superAdmin);
        setSuperAdminUser(res.superAdmin);
        superAdminApi.setAuth(superAdminApi.getToken(), res.superAdmin);
        if (onToast) onToast('SuperAdmin profile details updated successfully!', 'success');
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPass) {
      if (onToast) onToast('Current password is required', 'error');
      return;
    }
    if (!newPass || newPass.length < 8) {
      if (onToast) onToast('New master password must be at least 8 characters', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      if (onToast) onToast('New password and confirmation do not match', 'error');
      return;
    }

    setPassUpdating(true);
    try {
      const res = await superAdminApi.put('/superadmin/profile', {
        currentPassword: currentPass,
        newPassword: newPass
      });
      if (res.success) {
        if (onToast) onToast('Master password updated successfully!', 'success');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to update password', 'error');
    } finally {
      setPassUpdating(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.domain) {
      if (onToast) onToast('College name and domain are required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        name: newTenant.name,
        domain: newTenant.domain,
        subdomain: newTenant.subdomain || undefined,
        plan: newTenant.plan,
        branding: {
          collegeName: newTenant.collegeName || newTenant.name,
          primaryColor: newTenant.primaryColor,
          storageLimitBytes: (parseInt(newTenant.storageLimitMb, 10) || 500) * 1024 * 1024
        }
      };
      const res = await superAdminApi.post('/superadmin/tenants', payload);
      if (res.success) {
        if (onToast) onToast(`Tenant '${res.tenant.name}' provisioned successfully!`, 'success');
        setShowCreateModal(false);
        setNewTenant({
          name: '',
          domain: '',
          subdomain: '',
          plan: 'standard',
          primaryColor: '#00529B',
          collegeName: '',
          storageLimitMb: 500
        });
        loadTenants();
        loadAuditLogs();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Creation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTenant = async (e) => {
    e.preventDefault();
    if (!editTenantForm.name || !editTenantForm.domain) {
      if (onToast) onToast('College name and domain are required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        name: editTenantForm.name.trim(),
        domain: editTenantForm.domain.trim().toLowerCase(),
        subdomain: editTenantForm.subdomain ? editTenantForm.subdomain.trim().toLowerCase() : '',
        plan: editTenantForm.plan,
        branding: {
          ...(selectedTenant.branding || {}),
          collegeName: editTenantForm.name.trim(),
          primaryColor: editTenantForm.primaryColor
        }
      };
      const res = await superAdminApi.patch(`/superadmin/tenants/${selectedTenant._id || selectedTenant.id}`, payload);
      if (res.success) {
        if (onToast) onToast(`Tenant '${res.tenant.name}' domain & settings updated!`, 'success');
        setShowEditModal(false);
        loadTenants();
        loadAuditLogs();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleTenantStatus = async (tenant) => {
    const isSuspended = tenant.status === 'suspended';
    const action = isSuspended ? 'activate' : 'suspend';
    const confirmMsg = isSuspended
      ? `Reactivate '${tenant.name}'? Access will be restored immediately.`
      : `Suspend '${tenant.name}'? Access will be severed immediately.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await superAdminApi.patch(`/superadmin/tenants/${tenant._id || tenant.id}/${action}`);
      if (res.success) {
        if (onToast) onToast(`Tenant '${tenant.name}' ${isSuspended ? 'reactivated' : 'suspended'}!`, 'success');
        loadTenants();
        loadAuditLogs();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteTenant = (tenant) => {
    if (tenant.domain === 'localhost') {
      if (onToast) onToast('The default root tenant (localhost) cannot be deleted.', 'error');
      return;
    }
    setTenantToDelete(tenant);
    setDeleteConfirmInput('');
    setShowDeleteModal(true);
  };

  const confirmExecuteDeleteTenant = async (e) => {
    e.preventDefault();
    if (!tenantToDelete) return;
    if (deleteConfirmInput.trim().toLowerCase() !== tenantToDelete.domain.toLowerCase()) {
      if (onToast) onToast(`Please type '${tenantToDelete.domain}' exactly to confirm deletion.`, 'error');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await superAdminApi.delete(`/superadmin/tenants/${tenantToDelete._id || tenantToDelete.id}`);
      if (res.success) {
        if (onToast) onToast(`Tenant '${tenantToDelete.name}' deleted successfully!`, 'success');
        setShowDeleteModal(false);
        setTenantToDelete(null);
        setDeleteConfirmInput('');
        loadTenants();
        loadAuditLogs();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Delete failed', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const viewTenantUsage = async (tenant) => {
    setSelectedTenant(tenant);
    setShowUsageModal(true);
    setUsageLoading(true);
    try {
      const res = await superAdminApi.get(`/superadmin/tenants/${tenant._id || tenant.id}/usage`);
      if (res.success) {
        setTenantUsage(res.usage);
      }
    } catch (err) {
      if (onToast) onToast('Failed to load usage statistics', 'error');
    } finally {
      setUsageLoading(false);
    }
  };

  const handleResetAdminPassword = async (e) => {
    e.preventDefault();
    if (!resetAdminForm.newPassword || resetAdminForm.newPassword.length < 6) {
      if (onToast) onToast('Password must be at least 6 characters', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await superAdminApi.post(`/superadmin/tenants/${selectedTenant._id || selectedTenant.id}/reset-admin`, {
        username: resetAdminForm.username,
        newPassword: resetAdminForm.newPassword
      });
      if (res.success) {
        if (onToast) onToast(res.message, 'success');
        setShowResetModal(false);
        setResetAdminForm({ username: 'admin', newPassword: '' });
        loadAuditLogs();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Reset failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.domain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subdomain || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTenantsCount = tenants.filter(t => t.status === 'active').length;
  const suspendedTenantsCount = tenants.filter(t => t.status === 'suspended').length;

  // Filtered collections for Database Explorer
  const filteredCollections = (dbData?.collections || []).filter(c => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(colSearchTerm.toLowerCase()) ||
      (c.modelName || '').toLowerCase().includes(colSearchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(colSearchTerm.toLowerCase());
    const matchesScope = colScopeFilter === 'all' || c.scope === colScopeFilter;
    return matchesSearch && matchesScope;
  });

  // ----------------------------------------------------
  // LOGIN SCREEN (if unauthenticated)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="admin-login-shell">
        <aside className="admin-login-hero" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0B132B 100%)' }}>
          <div>
            <span className="eyebrow" style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#93C5FD', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
              <Shield size={13} /> Platform Root Authority
            </span>
            <h2>SuperAdmin SaaS Control Plane</h2>
            <p>
              Provision colleges, manage multi-tenant database partitions, monitor system health, inspect audit logs, and administer platform storage.
            </p>
            <div className="admin-login-highlights">
              <div className="admin-login-badge">
                <span>Tenant Provisioning</span>
                <strong>Isolated college domains</strong>
              </div>
              <div className="admin-login-badge">
                <span>Database Explorer</span>
                <strong>Integrity & orphan recovery</strong>
              </div>
              <div className="admin-login-badge">
                <span>Platform Governance</span>
                <strong>Zero tenant cross-bleed</strong>
              </div>
            </div>
          </div>
        </aside>

        <section className="admin-login-card">
          <div className="admin-login-panel">
            <div className="login-icon" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)' }}>
              <Shield size={28} />
            </div>
            <h2 style={{ fontSize: '1.7rem', margin: '0 0 0.35rem', fontWeight: 800, color: '#0F172A' }}>SuperAdmin Login</h2>
            <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              Sign in with root SaaS administrator credentials to manage platform infrastructure.
            </p>

            {loginError && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚠️ {loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="simple-label">SuperAdmin Username</label>
                <input
                  type="text"
                  className="simple-input"
                  placeholder="Enter superadmin username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="simple-label">Master Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="simple-input"
                    placeholder="Enter superadmin master password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: '2.5rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={loginLoading}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
                  fontSize: '0.95rem',
                  fontWeight: 700
                }}
              >
                {loginLoading ? 'Authenticating...' : 'Sign In to Control Plane'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.15rem', borderTop: '1px solid #E5EAF1', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('admin') : window.location.pathname = '/admin'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Switch to College Admin CMS →
              </button>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('home') : window.location.pathname = '/'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ← Return to College Website
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ----------------------------------------------------
  // UNIFIED ADMIN SHELL
  // ----------------------------------------------------
  return (
    <div className="admin-shell">
      {/* TOP BAR */}
      <header className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00529B, #002147)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 14px 28px -18px rgba(0, 82, 155, 0.55)'
          }}>
            <Shield size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.15 }}>
                SuperAdmin Control Plane
              </h1>
              <span style={{
                background: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                ROOT SAAS
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Multi-tenant isolation, college provisioning, and platform governance
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.8rem',
            borderRadius: '8px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#334155'
          }}>
            <Shield size={14} style={{ color: '#00529B' }} />
            <span>{superAdminUser?.username || 'superadmin'}</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', marginLeft: '2px' }} title="Session Active (1h)" />
          </div>

          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
              } else {
                window.location.pathname = '/';
              }
            }}
            title="Return to public portal"
          >
            <Globe size={13} /> View Site
          </button>

          <button className="admin-btn admin-btn-secondary" onClick={handleLogout}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* WORKSPACE HERO / STATS HEADER */}
      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '0.25rem' }}>
        <div className="admin-workspace-hero">
          <section className="admin-workspace-panel">
            <span className="eyebrow" style={{ marginBottom: '0.85rem' }}>
              <Sparkles size={12} /> Root Platform Governance
            </span>
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.55rem', fontWeight: 800 }}>
              SaaS Multi-Tenant Operations
            </h2>
            <p style={{ margin: 0, maxWidth: '720px' }}>
              Manage registered institutions, configure domain mapping, enforce data isolation guards,
              and monitor cross-tenant platform health without touching individual college content.
            </p>

            <div className="admin-workspace-grid" style={{ marginTop: '1.1rem' }}>
              <div className="admin-mini-card">
                <span className="admin-mini-value">{tenants.length}</span>
                <span className="admin-mini-label">Colleges Provisioned</span>
                <span className="admin-mini-note">{activeTenantsCount} active • {suspendedTenantsCount} suspended</span>
              </div>
              <div className="admin-mini-card">
                <span className="admin-mini-value">Strict</span>
                <span className="admin-mini-label">Tenant Isolation</span>
                <span className="admin-mini-note">AsyncLocalStorage Context</span>
              </div>
              <div className="admin-mini-card">
                <span className="admin-mini-value">{auditLogs.length}</span>
                <span className="admin-mini-label">Security Audit Events</span>
                <span className="admin-mini-note">Immutable Log Entries</span>
              </div>
              <div className="admin-mini-card">
                <span className="admin-mini-value">1 Hour</span>
                <span className="admin-mini-label">JWT Session Life</span>
                <span className="admin-mini-note">Protected Key Rotation</span>
              </div>
            </div>
          </section>

          <aside className="admin-card" style={{ padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0,82,155,0.12), rgba(217,119,6,0.12))',
                color: '#00529B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Shield size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', fontWeight: 700 }}>
                  Root Control Authority
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  {superAdminUser?.username || 'superadmin'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Platform Super Administrator
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => setShowCreateModal(true)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Plus size={14} /> Provision New College
              </button>
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  setCurrentTab('profile');
                  loadProfile();
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <User size={14} /> SuperAdmin Profile
              </button>
              <button
                className="admin-btn admin-btn-success"
                onClick={() => {
                  loadTenants();
                  loadHealth();
                  loadAuditLogs();
                  loadProfile();
                  if (onToast) onToast('Platform state refreshed!', 'success');
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={14} /> Refresh Platform State
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* BODY WITH ADMIN SIDEBAR AND MAIN CONTENT */}
      <div className="admin-body">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="admin-section-label">Tenancy & Infrastructure</div>

            <button
              className={`admin-nav-item ${currentTab === 'tenants' ? 'active' : ''}`}
              onClick={() => setCurrentTab('tenants')}
            >
              <Building2 size={16} /> Colleges & Tenants
              <span style={{
                marginLeft: 'auto',
                background: '#EFF6FF',
                color: '#2563EB',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {tenants.length}
              </span>
            </button>

            <button
              className={`admin-nav-item ${currentTab === 'database' ? 'active' : ''}`}
              onClick={() => { setCurrentTab('database'); loadDatabase(); }}
            >
              <Database size={16} /> Database & Storage
              <span style={{
                marginLeft: 'auto',
                background: '#ECFDF5',
                color: '#059669',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {dbData?.database?.stats?.totalDocuments ? `${dbData.database.stats.totalDocuments} docs` : 'Atlas'}
              </span>
            </button>

            <button
              className={`admin-nav-item ${currentTab === 'health' ? 'active' : ''}`}
              onClick={() => { setCurrentTab('health'); loadHealth(); }}
            >
              <Activity size={16} /> Platform Health
            </button>

            <button
              className={`admin-nav-item ${currentTab === 'audit' ? 'active' : ''}`}
              onClick={() => { setCurrentTab('audit'); loadAuditLogs(); }}
            >
              <History size={16} /> Security Audit Log
              <span style={{
                marginLeft: 'auto',
                background: 'rgba(255,255,255,0.1)',
                color: '#D9E4F2',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {auditLogs.length}
              </span>
            </button>

            <div className="admin-section-label" style={{ marginTop: '1.2rem' }}>Administration</div>

            <button
              className={`admin-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
              onClick={() => { setCurrentTab('profile'); loadProfile(); }}
            >
              <User size={16} /> SuperAdmin Profile
            </button>

            <div className="admin-section-label" style={{ marginTop: '1.2rem' }}>Root Actions</div>

            <button
              className="admin-nav-item"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Provision College
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="admin-main">
          {/* TAB 1: TENANTS */}
          {currentTab === 'tenants' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.2rem', color: '#0F172A' }}>
                    Institutional Tenants
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                    View and manage all college domains, subscription plans, and operational statuses.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '280px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      className="simple-input"
                      placeholder="Search colleges, domains..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '2rem', paddingRight: '0.8rem', fontSize: '0.82rem', padding: '0.5rem 0.8rem 0.5rem 2rem' }}
                    />
                  </div>

                  <select
                    className="simple-input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: 'auto', fontSize: '0.82rem', padding: '0.5rem 0.8rem' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>

                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus size={14} /> Provision College
                  </button>
                </div>
              </div>

              <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>College / Tenant</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Domain & Routing</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Plan</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Status</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Created</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748B' }}>
                          No colleges found matching the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((t) => {
                        const isSuspended = t.status === 'suspended';
                        return (
                          <tr key={t._id || t.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.12s ease' }}>
                            <td style={{ padding: '1rem 1.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: t.branding?.primaryColor || '#00529B',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  color: '#FFFFFF'
                                }}>
                                  {(t.name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{t.name}</div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>ID: {t._id || t.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '1rem 1.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{t.domain}</span>
                                <a
                                  href={`http://${t.domain}${window.location.port ? ':' + window.location.port : ''}/`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={`Open ${t.name} public website on ${t.domain}`}
                                  style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center' }}
                                >
                                  <ExternalLink size={13} />
                                </a>
                              </div>
                              {t.subdomain ? (
                                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                  Subdomain: <strong style={{ color: '#334155' }}>{t.subdomain}</strong>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>No subdomain set</div>
                              )}
                            </td>
                            <td style={{ padding: '1rem 1.25rem' }}>
                              <span style={{
                                background: t.plan === 'enterprise' ? '#F3E8FF' : '#EFF6FF',
                                color: t.plan === 'enterprise' ? '#7E22CE' : '#1D4ED8',
                                border: `1px solid ${t.plan === 'enterprise' ? '#E9D5FF' : '#BFDBFE'}`,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'capitalize'
                              }}>
                                {t.plan || 'standard'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 1.25rem' }}>
                              <span style={{
                                background: isSuspended ? '#FEF2F2' : '#DCFCE7',
                                color: isSuspended ? '#991B1B' : '#166534',
                                border: `1px solid ${isSuspended ? '#FECACA' : '#BBF7D0'}`,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}>
                                <span className={`status-dot ${isSuspended ? 'hidden' : 'active'}`} style={{ width: '6px', height: '6px' }} />
                                {isSuspended ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                              {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button
                                  className="admin-btn admin-btn-secondary"
                                  onClick={() => {
                                    setSelectedTenant(t);
                                    setEditTenantForm({
                                      name: t.name || '',
                                      domain: t.domain || '',
                                      subdomain: t.subdomain || '',
                                      plan: t.plan || 'standard',
                                      primaryColor: t.branding?.primaryColor || '#00529B'
                                    });
                                    setShowEditModal(true);
                                  }}
                                  title="Edit Domain or College Settings"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
                                >
                                  <Settings size={13} /> Edit Domain
                                </button>
                                <button
                                  className="admin-btn admin-btn-secondary"
                                  onClick={() => viewTenantUsage(t)}
                                  title="View Usage Statistics"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
                                >
                                  <BarChart3 size={13} /> Stats
                                </button>
                                <button
                                  className="admin-btn admin-btn-secondary"
                                  onClick={() => {
                                    setSelectedTenant(t);
                                    setResetAdminForm({ username: 'admin', newPassword: '' });
                                    setShowResetModal(true);
                                  }}
                                  title="Reset Tenant Admin Credentials"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
                                >
                                  <Key size={13} /> Reset Admin
                                </button>
                                <button
                                  className={`admin-btn ${isSuspended ? 'admin-btn-success' : 'admin-btn-danger'}`}
                                  onClick={() => toggleTenantStatus(t)}
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }}
                                >
                                  {isSuspended ? <Power size={13} /> : <PowerOff size={13} />}
                                  {isSuspended ? 'Activate' : 'Suspend'}
                                </button>
                                {t.domain !== 'localhost' && (
                                  <button
                                    className="admin-btn"
                                    onClick={() => handleDeleteTenant(t)}
                                    title="Permanently Delete College"
                                    style={{
                                      padding: '0.35rem 0.65rem',
                                      fontSize: '0.76rem',
                                      background: '#FEF2F2',
                                      color: '#DC2626',
                                      borderColor: '#FECACA',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE & STORAGE EXPLORER */}
          {currentTab === 'database' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.2rem', color: '#0F172A' }}>
                      MongoDB Database & Storage Explorer
                    </h3>
                    <span style={{
                      background: dbData?.database?.connected ? '#DCFCE7' : '#FEF2F2',
                      color: dbData?.database?.connected ? '#166534' : '#991B1B',
                      border: `1px solid ${dbData?.database?.connected ? '#BBF7D0' : '#FECACA'}`,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dbData?.database?.connected ? '#10B981' : '#EF4444' }} />
                      {dbData?.database?.connected ? 'Atlas Cluster Online' : 'Local Persistence Store'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                    Live database topology, collections inspection, multi-tenant document allocation, and data isolation audit.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={handlePingDatabase}
                    disabled={dbActionLoading}
                    title="Send ping to test MongoDB Atlas roundtrip latency"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <Activity size={14} className={dbActionLoading ? 'spin' : ''} /> Ping DB
                  </button>

                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={handleVerifyIntegrity}
                    disabled={dbActionLoading}
                    title="Run deep tenant isolation audit across all collections"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <Shield size={14} /> Verify Isolation
                  </button>

                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={loadDatabase}
                    disabled={dbLoading}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <RefreshCw size={14} className={dbLoading ? 'spin' : ''} /> Refresh DB Stats
                  </button>
                </div>
              </div>

              {/* TOP KPI STATS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#00529B', fontSize: '1.55rem' }}>
                    {dbData?.database?.provider || 'MongoDB Atlas'}
                  </div>
                  <div className="stat-label">Database Provider</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                    Name: <strong style={{ color: '#0F172A' }}>{dbData?.database?.databaseName || 'college_db'}</strong> • Ping: <strong style={{ color: '#166534' }}>{dbData?.database?.pingMs || 0} ms</strong>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#10B981', fontSize: '1.55rem' }}>
                    {dbData?.database?.stats?.totalDocuments || 0}
                  </div>
                  <div className="stat-label">Total Documents Managed</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                    Across <strong style={{ color: '#0F172A' }}>{dbData?.collections?.length || 16}</strong> platform collections
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#7E22CE', fontSize: '1.55rem' }}>
                    {Math.round((dbData?.database?.stats?.dataSizeBytes || 0) / 1024)} KB
                  </div>
                  <div className="stat-label">Data & Storage Size</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                    Storage: <strong>{Math.round((dbData?.database?.stats?.storageSizeBytes || 0) / 1024)} KB</strong> • {dbData?.database?.stats?.indexesCount || 0} Indexes
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-number" style={{ color: dbData?.integrity?.isHealthy ? '#166534' : '#DC2626', fontSize: '1.55rem' }}>
                    {dbData?.integrity?.isHealthy ? '100% Guarded' : `${dbData?.integrity?.totalUnscopedLeakedDocs || 0} Unscoped`}
                  </div>
                  <div className="stat-label">Tenant Isolation Boundary</div>
                  <div style={{ fontSize: '0.72rem', color: dbData?.integrity?.isHealthy ? '#166534' : '#991B1B', marginTop: '0.35rem', fontWeight: 700 }}>
                    {dbData?.integrity?.isHealthy ? 'Zero Leaked Documents Verified' : 'Attention: Unscoped Documents Found'}
                  </div>
                </div>
              </div>

              {/* DATA INTEGRITY & MAINTENANCE BANNER */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '280px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                      Database Self-Healing & Isolation Audits
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Audit records, auto-heal legacy unstamped documents, or clean orphaned test records.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={handleVerifyIntegrity}
                    disabled={dbActionLoading}
                    style={{ fontSize: '0.76rem', padding: '0.4rem 0.75rem' }}
                  >
                    <CheckCircle2 size={13} style={{ color: '#10B981' }} /> Verify Data Isolation
                  </button>

                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={handleFixUnscoped}
                    disabled={dbActionLoading}
                    title="Binds any legacy unstamped documents to root platform (localhost)"
                    style={{ fontSize: '0.76rem', padding: '0.4rem 0.75rem' }}
                  >
                    <RefreshCw size={13} style={{ color: '#2563EB' }} /> Auto-Heal Unscoped
                  </button>

                  <button
                    className="admin-btn"
                    onClick={handlePurgeOrphans}
                    disabled={dbActionLoading}
                    title="Prunes leftover records pointing to non-existent colleges"
                    style={{
                      fontSize: '0.76rem',
                      padding: '0.4rem 0.75rem',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      borderColor: '#FECACA'
                    }}
                  >
                    <Trash2 size={13} /> Purge Orphaned Records
                  </button>
                </div>
              </div>

              {/* SECTION 1: COLLECTIONS EXPLORER */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.15rem', color: '#0F172A' }}>
                      Platform Collections Inspector ({filteredCollections.length})
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                      Detailed per-collection schema architecture, document allocation, and isolation guard status.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '240px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="Search collections..."
                        value={colSearchTerm}
                        onChange={(e) => setColSearchTerm(e.target.value)}
                        style={{ paddingLeft: '1.9rem', fontSize: '0.8rem', padding: '0.4rem 0.7rem 0.4rem 1.9rem' }}
                      />
                    </div>

                    <select
                      className="simple-input"
                      value={colScopeFilter}
                      onChange={(e) => setColScopeFilter(e.target.value)}
                      style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
                    >
                      <option value="all">All Scopes</option>
                      <option value="tenant">Tenant-Scoped Only</option>
                      <option value="global">Global Root Only</option>
                    </select>
                  </div>
                </div>

                <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Collection Name</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Scope & Isolation</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Documents</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Indexes</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Isolation Guard</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Architectural Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollections.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
                            No collections found matching filter.
                          </td>
                        </tr>
                      ) : (
                        filteredCollections.map((col) => {
                          const isTenant = col.scope === 'tenant';
                          const isHealthy = col.unscopedCount === 0;

                          return (
                            <tr key={col.name} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.12s ease' }}>
                              <td style={{ padding: '0.9rem 1.25rem' }}>
                                <div style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                                  {col.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  Model: <strong>{col.modelName}</strong>
                                </div>
                              </td>

                              <td style={{ padding: '0.9rem 1.25rem' }}>
                                <span style={{
                                  background: isTenant ? '#EFF6FF' : '#F3E8FF',
                                  color: isTenant ? '#1D4ED8' : '#7E22CE',
                                  border: `1px solid ${isTenant ? '#BFDBFE' : '#E9D5FF'}`,
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}>
                                  {isTenant ? 'Tenant-Scoped' : 'Global Platform Root'}
                                </span>
                              </td>

                              <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#0F172A' }}>
                                {col.documentCount}
                              </td>

                              <td style={{ padding: '0.9rem 1.25rem', color: '#475569' }}>
                                <span style={{ background: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {col.indexesCount} idx
                                </span>
                              </td>

                              <td style={{ padding: '0.9rem 1.25rem' }}>
                                <span style={{
                                  background: isHealthy ? '#DCFCE7' : '#FEF2F2',
                                  color: isHealthy ? '#166534' : '#991B1B',
                                  border: `1px solid ${isHealthy ? '#BBF7D0' : '#FECACA'}`,
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isHealthy ? '#10B981' : '#EF4444' }} />
                                  {isHealthy ? 'Guarded (0 leaks)' : `${col.unscopedCount} Unscoped`}
                                </span>
                              </td>

                              <td style={{ padding: '0.9rem 1.25rem', color: '#64748B', fontSize: '0.78rem' }}>
                                {col.description}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: PER-TENANT STORAGE FOOTPRINT */}
              <div>
                <div style={{ marginBottom: '0.85rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.15rem', color: '#0F172A' }}>
                    Multi-Tenant Data Distribution & Footprint
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                    Cross-tenant record breakdown showing how many institutional records each college owns in MongoDB.
                  </p>
                </div>

                <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Institution / College</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Domain & Routing</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Status</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Subscription</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Total Stored Records</th>
                        <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Isolation Mechanism</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbData?.tenantDistribution || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
                            No tenant footprints loaded yet.
                          </td>
                        </tr>
                      ) : (
                        (dbData?.tenantDistribution || []).map((t) => (
                          <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.9rem 1.25rem' }}>
                              <div style={{ fontWeight: 800, color: '#0F172A' }}>{t.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>ID: {t.id}</div>
                            </td>

                            <td style={{ padding: '0.9rem 1.25rem' }}>
                              <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{t.domain}</strong>
                            </td>

                            <td style={{ padding: '0.9rem 1.25rem' }}>
                              <span style={{
                                background: t.status === 'active' ? '#DCFCE7' : '#FEF2F2',
                                color: t.status === 'active' ? '#166534' : '#991B1B',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}>
                                {t.status}
                              </span>
                            </td>

                            <td style={{ padding: '0.9rem 1.25rem', textTransform: 'capitalize', color: '#475569' }}>
                              {t.plan || 'standard'}
                            </td>

                            <td style={{ padding: '0.9rem 1.25rem' }}>
                              <span style={{
                                background: '#EFF6FF',
                                color: '#1D4ED8',
                                border: '1px solid #BFDBFE',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                fontWeight: 800,
                                fontSize: '0.85rem'
                              }}>
                                {t.documentCount} records
                              </span>
                            </td>

                            <td style={{ padding: '0.9rem 1.25rem', color: '#64748B', fontSize: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 600 }}>
                                <CheckCircle2 size={13} /> AsyncLocalStorage Enforced
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEALTH */}
          {currentTab === 'health' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.2rem', color: '#0F172A' }}>
                  Platform Diagnostics & Health
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  Overall multi-tenant infrastructure runtime metrics and tenant allocation.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#00529B' }}>{healthData?.tenants?.total ?? tenants.length}</div>
                  <div className="stat-label">Total Provisioned Colleges</div>
                  <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '0.35rem', fontWeight: 700 }}>
                    {healthData?.tenants?.active ?? activeTenantsCount} Active • {healthData?.tenants?.suspended ?? suspendedTenantsCount} Suspended
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#10B981' }}>Healthy</div>
                  <div className="stat-label">Database Connection</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                    MongoDB Atlas / Isolated Queries Active
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#7E22CE' }}>Enforced</div>
                  <div className="stat-label">Tenant Isolation Engine</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                    Mongoose Pre-Hooks & AsyncLocalStorage
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#B45309' }}>
                    {Math.floor((healthData?.uptime || 0) / 60)}m
                  </div>
                  <div className="stat-label">Node Runtime Uptime</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                    Heap: {Math.round((healthData?.memory?.heapUsed || 0) / 1024 / 1024)} MB
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT LOG */}
          {currentTab === 'audit' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.2rem', color: '#0F172A' }}>
                    Security Audit Trail
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                    Immutable historical records of every administrative action performed at root privilege.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <select
                    className="simple-input"
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    style={{ width: 'auto', fontSize: '0.82rem', padding: '0.5rem 0.8rem' }}
                  >
                    <option value="">All Security Events</option>
                    <option value="tenant_created">tenant_created</option>
                    <option value="tenant_suspended">tenant_suspended</option>
                    <option value="tenant_activated">tenant_activated</option>
                    <option value="tenant_updated">tenant_updated</option>
                  </select>

                  <button className="admin-btn admin-btn-secondary" onClick={loadAuditLogs}>
                    <RefreshCw size={13} className={auditLoading ? 'spin' : ''} /> Refresh Logs
                  </button>
                </div>
              </div>

              <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Timestamp</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Security Action</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Target Tenant</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Operator IP</th>
                      <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#475569' }}>Event Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748B' }}>
                          No audit events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => {
                        let badgeBg = '#EFF6FF';
                        let badgeColor = '#1D4ED8';
                        let badgeBorder = '#BFDBFE';

                        if (log.action === 'tenant_suspended') {
                          badgeBg = '#FEF2F2';
                          badgeColor = '#991B1B';
                          badgeBorder = '#FECACA';
                        } else if (log.action === 'tenant_activated') {
                          badgeBg = '#DCFCE7';
                          badgeColor = '#166534';
                          badgeBorder = '#BBF7D0';
                        }

                        return (
                          <tr key={log._id || log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.85rem 1.25rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem' }}>
                              <span style={{
                                background: badgeBg,
                                color: badgeColor,
                                border: `1px solid ${badgeBorder}`,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                fontFamily: 'monospace'
                              }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', color: '#334155' }}>
                              {log.targetTenantId || 'N/A'}
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', color: '#64748B' }}>
                              {log.ipAddress || '127.0.0.1'}
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem', color: '#64748B', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {JSON.stringify(log.metadata || {})}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SUPERADMIN PROFILE */}
          {currentTab === 'profile' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.2rem', color: '#0F172A' }}>
                  Super Administrator Profile & Security
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  Manage platform root credentials, authorized contact details, and platform security policies.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* 1. Root Identity & Authority Card */}
                <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.85rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Root Control Identity</h3>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Global platform master credentials</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label className="simple-label">SuperAdmin Master Username</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="simple-input"
                          value={profileData?.username || superAdminUser?.username || 'superadmin'}
                          disabled
                          readOnly
                          style={{ background: '#F8FAFC', cursor: 'not-allowed', color: '#0F172A', fontWeight: 700, letterSpacing: '0.02em', border: '1px solid #CBD5E1' }}
                        />
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ECFDF5', color: '#059669', fontSize: '0.75rem', fontWeight: 700, padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #A7F3D0', whiteSpace: 'nowrap' }}>
                          🔒 Root Locked
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="simple-label">Platform Authority Role</label>
                      <input
                        type="text"
                        className="simple-input"
                        value="Global Super Administrator (Cross-Tenant Root)"
                        disabled
                        readOnly
                        style={{ background: '#F8FAFC', cursor: 'not-allowed', color: '#475569', fontWeight: 600, border: '1px solid #E2E8F0' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Security Level</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>Tier 0 (Root)</span>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Session Duration</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>1 Hour (Strict JWT)</span>
                      </div>
                    </div>

                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1rem', lineHeight: 1 }}>🛡️</span>
                      <div style={{ fontSize: '0.78rem', color: '#1E40AF', lineHeight: 1.5 }}>
                        <strong>Root Authority Policy:</strong> SuperAdmin credentials authorize global control across all college tenants, infrastructure settings, and audit logs. Master username cannot be altered.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Profile Details Form */}
                <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.85rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', flexShrink: 0 }}>
                      <User size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>SuperAdmin Details</h3>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Update master contact information</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfileDetails}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="simple-label">Full Name</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="e.g. Platform Administrator"
                        value={profileFullName}
                        onChange={e => setProfileFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label className="simple-label">Master Contact Email</label>
                      <input
                        type="email"
                        className="simple-input"
                        placeholder="e.g. superadmin@apex-inst.edu"
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        required
                      />
                      <div className="simple-hint">Used for platform notifications and emergency security alerts.</div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileUpdating}
                      className="admin-btn admin-btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontWeight: 600 }}
                    >
                      <Check size={15} /> {profileUpdating ? 'Saving Profile...' : 'Save Profile Details'}
                    </button>
                  </form>
                </div>

                {/* 3. Change Master Password Card */}
                <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.85rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Change Master Password</h3>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Rotate root administrative access password</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="simple-label">Current Master Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          className="simple-input"
                          placeholder="Enter current master password"
                          value={currentPass}
                          onChange={e => setCurrentPass(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(prev => !prev)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px' }}
                        >
                          {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="simple-label">New Master Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          className="simple-input"
                          placeholder="Minimum 8 characters"
                          value={newPass}
                          onChange={e => setNewPass(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(prev => !prev)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px' }}
                        >
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="simple-hint">Must contain at least 8 characters.</div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label className="simple-label">Confirm New Password *</label>
                      <input
                        type="password"
                        className="simple-input"
                        placeholder="Re-enter new password"
                        value={confirmPass}
                        onChange={e => setConfirmPass(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passUpdating}
                      className="admin-btn admin-btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontWeight: 600 }}
                    >
                      <Lock size={15} /> {passUpdating ? 'Updating Password...' : 'Update Master Password'}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: PROVISION NEW COLLEGE */}
      {/* ---------------------------------------------------- */}
      {showCreateModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} style={{ color: '#00529B' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Provision New College</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTenant}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="simple-label">College Name *</label>
                  <input
                    type="text"
                    className="simple-input"
                    placeholder="e.g. Oxford Institute of Technology"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="simple-label">Primary Domain *</label>
                    <input
                      type="text"
                      className="simple-input"
                      placeholder="e.g. oxford.edu"
                      value={newTenant.domain}
                      onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="simple-label">Subdomain Slug</label>
                    <input
                      type="text"
                      className="simple-input"
                      placeholder="e.g. oxford"
                      value={newTenant.subdomain}
                      onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="simple-label">Subscription Tier</label>
                    <select
                      className="simple-input"
                      value={newTenant.plan}
                      onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value })}
                    >
                      <option value="standard">Standard</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="simple-label">Primary Brand Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={newTenant.primaryColor}
                        onChange={(e) => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                        style={{ width: '40px', height: '38px', border: '1px solid #D7E0EA', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        className="simple-input"
                        value={newTenant.primaryColor}
                        onChange={(e) => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="admin-btn admin-btn-primary"
                >
                  {actionLoading ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                  <span>{actionLoading ? 'Provisioning...' : 'Provision College'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDIT TENANT DOMAIN & SETTINGS */}
      {/* ---------------------------------------------------- */}
      {showEditModal && selectedTenant && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} style={{ color: '#00529B' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Edit College Domain & Plan</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="simple-label">College Name *</label>
                  <input
                    type="text"
                    className="simple-input"
                    value={editTenantForm.name}
                    onChange={(e) => setEditTenantForm({ ...editTenantForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="simple-label">Primary Domain (Host) *</label>
                    <input
                      type="text"
                      className="simple-input"
                      placeholder="e.g. college-a.edu or college-a.localhost"
                      value={editTenantForm.domain}
                      onChange={(e) => setEditTenantForm({ ...editTenantForm, domain: e.target.value })}
                      required
                    />
                    <p className="simple-hint">Visitors & Admins accessing this host route to this college.</p>
                  </div>

                  <div>
                    <label className="simple-label">Subdomain Slug</label>
                    <input
                      type="text"
                      className="simple-input"
                      placeholder="e.g. college-a"
                      value={editTenantForm.subdomain}
                      onChange={(e) => setEditTenantForm({ ...editTenantForm, subdomain: e.target.value })}
                    />
                    <p className="simple-hint">Matches subdomain in multi-college host routing.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="simple-label">Subscription Tier</label>
                    <select
                      className="simple-input"
                      value={editTenantForm.plan}
                      onChange={(e) => setEditTenantForm({ ...editTenantForm, plan: e.target.value })}
                    >
                      <option value="standard">Standard</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="simple-label">Primary Brand Color</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={editTenantForm.primaryColor}
                        onChange={(e) => setEditTenantForm({ ...editTenantForm, primaryColor: e.target.value })}
                        style={{ width: '40px', height: '38px', border: '1px solid #D7E0EA', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        className="simple-input"
                        value={editTenantForm.primaryColor}
                        onChange={(e) => setEditTenantForm({ ...editTenantForm, primaryColor: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="admin-btn admin-btn-primary"
                >
                  {actionLoading ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                  <span>{actionLoading ? 'Saving...' : 'Save Domain Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: RESET ADMIN PASSWORD */}
      {/* ---------------------------------------------------- */}
      {showResetModal && selectedTenant && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '460px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} style={{ color: '#D97706' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Support: Reset Admin</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetAdminPassword}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  Reset administrator credentials for <strong>{selectedTenant.name}</strong>.
                </p>

                <div>
                  <label className="simple-label">Admin Username</label>
                  <input
                    type="text"
                    className="simple-input"
                    value={resetAdminForm.username}
                    onChange={(e) => setResetAdminForm({ ...resetAdminForm, username: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="simple-label">New Password (Min 6 Characters) *</label>
                  <input
                    type="password"
                    className="simple-input"
                    placeholder="Enter new administrator password"
                    value={resetAdminForm.newPassword}
                    onChange={(e) => setResetAdminForm({ ...resetAdminForm, newPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="admin-btn admin-btn-primary"
                >
                  {actionLoading ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                  <span>{actionLoading ? 'Updating...' : 'Set Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: USAGE & STORAGE STATS */}
      {/* ---------------------------------------------------- */}
      {showUsageModal && selectedTenant && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} style={{ color: '#00529B' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {selectedTenant.name} Usage
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUsageModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {usageLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                  <div>Loading usage metrics...</div>
                </div>
              ) : tenantUsage ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="stat-box">
                      <div className="stat-number">{tenantUsage.pagesCount}</div>
                      <div className="stat-label">Published Pages</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">{tenantUsage.noticesCount}</div>
                      <div className="stat-label">Active Notices</div>
                    </div>
                  </div>

                  <div className="admin-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: '#475569' }}>Storage Allocation</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>
                        {Math.round((tenantUsage.storageBytes || 0) / 1024 / 1024 * 100) / 100} MB / {Math.round((tenantUsage.storageLimitBytes || 524288000) / 1024 / 1024)} MB
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, Math.round(((tenantUsage.storageBytes || 0) / (tenantUsage.storageLimitBytes || 524288000)) * 100))}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #00529B, #D97706)'
                      }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Media Files: <strong>{tenantUsage.mediaCount} assets uploaded</strong>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowUsageModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: DELETE TENANT CONFIRMATION (GITHUB-STYLE TYPED GUARD) */}
      {/* ---------------------------------------------------- */}
      {showDeleteModal && tenantToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px', border: '1px solid #FECACA' }}>
            <div className="admin-modal-header" style={{ background: '#FEF2F2', borderBottom: '1px solid #FEE2E2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} style={{ color: '#DC2626' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#991B1B' }}>
                  Confirm Permanent Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTenantToDelete(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={confirmExecuteDeleteTenant}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#FFF1F2', border: '1px solid #FFE4E6', borderRadius: '8px', padding: '0.9rem', color: '#9F1239', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <strong>⚠️ Irreversible High-Consequence Action:</strong>
                  <p style={{ margin: '0.35rem 0 0 0' }}>
                    You are about to permanently purge <strong>{tenantToDelete.name}</strong> (<code>{tenantToDelete.domain}</code>). This will delete all tenant-scoped pages, notices, uploaded media, inquiries, and associated tenant admin credentials.
                  </p>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#881337' }}>
                    An immutable security audit record will be permanently retained in root SuperAdmin Audit Logs.
                  </p>
                </div>

                <div>
                  <label className="simple-label" style={{ fontWeight: 700 }}>
                    To confirm deletion, please type <code style={{ color: '#DC2626', background: '#FEE2E2', padding: '0.1rem 0.35rem', borderRadius: '4px', userSelect: 'all' }}>{tenantToDelete.domain}</code> below:
                  </label>
                  <input
                    type="text"
                    className="simple-input"
                    placeholder={`Type ${tenantToDelete.domain} to confirm`}
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer" style={{ background: '#F8FAFC' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTenantToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || deleteConfirmInput.trim().toLowerCase() !== tenantToDelete.domain.toLowerCase()}
                  className="admin-btn admin-btn-danger"
                  style={{
                    opacity: deleteConfirmInput.trim().toLowerCase() !== tenantToDelete.domain.toLowerCase() ? 0.5 : 1,
                    cursor: deleteConfirmInput.trim().toLowerCase() !== tenantToDelete.domain.toLowerCase() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {deleteLoading ? <RefreshCw size={14} className="spin" /> : <Trash2 size={14} />}
                  <span>{deleteLoading ? 'Purging Tenant...' : 'I understand, permanently delete'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
