import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarRange,
  GraduationCap,
  Megaphone,
  UserCheck,
  Layers,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['hr_admin', 'manager', 'employee'],
    },
    {
      label: 'Employees',
      path: '/employees',
      icon: Users,
      roles: ['hr_admin', 'manager'],
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['hr_admin', 'manager', 'employee'],
    },
    {
      label: 'Leaves',
      path: '/leaves',
      icon: CalendarRange,
      roles: ['hr_admin', 'manager', 'employee'],
    },
    {
      label: 'Training Programs',
      path: '/training',
      icon: GraduationCap,
      roles: ['hr_admin', 'manager', 'employee'],
    },
    {
      label: 'Announcements',
      path: '/announcements',
      icon: Megaphone,
      roles: ['hr_admin', 'manager', 'employee'],
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: UserCheck,
      roles: ['hr_admin', 'manager', 'employee'],
    },
  ];

  const allowedItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      <aside
        className={`sidebar-drawer ${isOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minHeight: '100vh',
          zIndex: 90,
          transition: 'transform var(--transition-normal), background-color var(--transition-fast), border-color var(--transition-fast)',
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px var(--primary-glow)',
              color: '#ffffff',
            }}>
              <Layers size={22} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.1875rem',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
              }}>
                StaffSync
              </h2>
              <span style={{
                fontSize: '0.6875rem',
                color: 'var(--primary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                HR Management
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm mobile-only"
            style={{ padding: '0.35rem', borderRadius: '50%', display: 'none' }}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.25rem 0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{
            padding: '0 0.75rem 0.5rem',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Main Menu
          </div>

          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} style={{ color: 'inherit' }} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info Box */}
        <div style={{
          padding: '1rem',
          margin: '0.875rem',
          backgroundColor: 'var(--bg-sidebar-footer)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} style={{ color: 'var(--accent-lavender)' }} /> System Live
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
              Online
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
            StaffSync HRMS • Enterprise
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
