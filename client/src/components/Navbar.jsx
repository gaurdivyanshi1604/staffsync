import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Menu, Clock, Check, Shield } from 'lucide-react';
import api from '../api/axios';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const notifRef = useRef(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // background poll silently
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'hr_admin') return 'HR Admin';
    if (role === 'manager') return 'Manager';
    return 'Employee';
  };

  return (
    <header style={{
      height: '66px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 80,
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Left: Mobile hamburger & live clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-outline btn-sm mobile-only"
          style={{ padding: '0.45rem', display: 'none' }}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-dim)',
          fontSize: '0.8125rem',
          fontWeight: 500,
        }}>
          <Clock size={15} style={{ color: 'var(--primary)' }} />
          <span>{currentTime}</span>
          <span style={{ margin: '0 0.25rem', color: '#cbd5e1' }}>•</span>
          <span style={{
            color: 'var(--success-text)',
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.6875rem',
            fontWeight: 600,
          }}>
            Connected
          </span>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-outline btn-sm"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              padding: 0,
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--accent-rose)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(225, 29, 72, 0.4)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '340px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 200,
              overflow: 'hidden',
              animation: 'slideUp 0.15s ease-out',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: '#f8fafc',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkOneRead(n._id)}
                      style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: n.isRead ? '#ffffff' : '#f5f3ff',
                        cursor: n.isRead ? 'default' : 'pointer',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)',
                        }}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                        )}
                      </div>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.35rem 0.75rem 0.35rem 0.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: '#ffffff',
          }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {user?.fullName}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', lineHeight: 1.2 }}>
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
