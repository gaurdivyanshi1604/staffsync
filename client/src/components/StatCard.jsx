import React from 'react';

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = '#4f46e5',
  bgTint = '#eef2ff',
  badgeText,
  badgeType = 'info',
}) => {
  return (
    <div
      className="glass-card glass-card-interactive"
      style={{
        padding: '1.35rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text-dim)',
          letterSpacing: '0.02em',
        }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: bgTint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            flexShrink: 0,
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <div style={{
          fontSize: '1.875rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
        }}>
          {value}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.625rem',
          fontSize: '0.75rem',
        }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            {subtext}
          </span>
          {badgeText && (
            <span className={`badge badge-${badgeType}`} style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem' }}>
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
