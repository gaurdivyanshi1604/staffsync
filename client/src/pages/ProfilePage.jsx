import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Shield,
  KeyRound,
  Mail,
  Building,
  Calendar,
  CheckCircle,
  AlertCircle,
  Save,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    const res = await updateProfile(profileForm);
    setProfileLoading(false);
    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } else {
      setProfileMsg({ type: 'error', text: res.message });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setPwdLoading(true);
    const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setPwdLoading(false);

    if (res.success) {
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPwdMsg({ type: 'error', text: res.message });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <UserCheck size={20} />
          </div>
          <span>My Profile & Settings</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          View employee credentials, update contact information, and manage security settings.
        </p>
      </div>

      <div className="grid-cols-3" style={{ gap: '2rem' }}>
        {/* Left Card: Summary Profile Badge */}
        <div className="glass-card" style={{ height: 'fit-content', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
              color: '#ffffff',
              fontSize: '2rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}>
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              {user?.fullName}
            </h2>
            <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {user?.designation || 'Staff Member'}
            </div>
            <span className="badge badge-role">
              {user?.role === 'hr_admin' ? 'HR Administrator' : user?.role === 'manager' ? 'Supervisory Manager' : 'Staff Employee'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} /> Employee ID
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user?.employeeId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} /> Department
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.department || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Email
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Joined Date
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{formatDate(user?.joiningDate)}</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Edit Details & Security */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Edit Profile Form */}
          <div className="glass-card" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.0625rem', fontWeight: 700 }}>
              <UserCheck size={18} style={{ color: 'var(--primary)' }} />
              Personal Contact Details
            </h3>

            {profileMsg.text && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
                backgroundColor: profileMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                border: `1px solid ${profileMsg.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
                color: profileMsg.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
              }}>
                {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    className="form-input"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="submit" disabled={profileLoading} className="btn btn-primary">
                  <Save size={15} /> {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.0625rem', fontWeight: 700 }}>
              <KeyRound size={18} style={{ color: 'var(--accent-amber)' }} />
              Update Account Password
            </h3>

            {pwdMsg.text && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
                backgroundColor: pwdMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                border: `1px solid ${pwdMsg.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
                color: pwdMsg.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
              }}>
                {pwdMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="submit" disabled={pwdLoading} className="btn btn-secondary">
                  {pwdLoading ? 'Updating Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
