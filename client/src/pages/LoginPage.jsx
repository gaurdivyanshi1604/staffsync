import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Layers, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Sparkles, Sun, Moon } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsSubmitting(true);
    login(demoEmail, demoPassword).then((result) => {
      setIsSubmitting(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark
        ? 'radial-gradient(circle at 50% 20%, #151d33 0%, #0b1120 70%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background var(--transition-fast)',
    }}>
      {/* Top Corner Theme Switcher */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? (
            <Sun size={18} style={{ color: '#fbbf24' }} />
          ) : (
            <Moon size={18} style={{ color: 'var(--primary)' }} />
          )}
        </button>
      </div>

      {/* Background ambient orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '400px',
        height: '400px',
        background: isDark
          ? 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '350px',
        height: '350px',
        background: isDark
          ? 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '450px',
        zIndex: 1,
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
            boxShadow: '0 4px 14px var(--primary-glow)',
            color: '#ffffff',
            marginBottom: '0.875rem',
          }}>
            <Layers size={28} />
          </div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-main)',
            margin: 0,
          }}>
            StaffSync
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Enterprise Human Resource Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Sign in with your enterprise credentials or click a demo profile.
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger-text)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }} />
                <input
                  type="email"
                  required
                  placeholder="name@staffsync.com"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {isSubmitting ? 'Authenticating...' : (
                <>
                  <span>Sign In to StaffSync</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Instant Demo Access Switchers */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-dim)',
              textAlign: 'center',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}>
              <Sparkles size={12} style={{ color: 'var(--accent-purple)' }} /> Instant Demo Profiles
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@staffsync.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>HR Administrator</span>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>All Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager.eng@staffsync.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Engineering Lead</span>
                </div>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alice@staffsync.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Alice Johnson (Developer)</span>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Employee</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
