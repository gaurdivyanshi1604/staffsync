import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
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
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background soft ambient orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
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
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            color: '#ffffff',
            marginBottom: '0.875rem',
          }}>
            <Layers size={28} />
          </div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0f172a',
            margin: 0,
          }}>
            StaffSync
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Enterprise Human Resource Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Welcome back
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Sign in with your enterprise credentials or click a demo profile.
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-sm)',
              color: '#e11d48',
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
                  color: '#94a3b8',
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
                  color: '#94a3b8',
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
              color: '#94a3b8',
              textAlign: 'center',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}>
              <Sparkles size={12} style={{ color: '#8b5cf6' }} /> Instant Demo Profiles
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@staffsync.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: '#f8fafc',
                  borderColor: '#e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} style={{ color: '#4f46e5' }} />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>HR Administrator</span>
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
                  backgroundColor: '#f8fafc',
                  borderColor: '#e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} style={{ color: '#0284c7' }} />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Engineering Lead</span>
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
                  backgroundColor: '#f8fafc',
                  borderColor: '#e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Alice Johnson (Developer)</span>
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
