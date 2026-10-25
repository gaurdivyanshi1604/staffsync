import React from 'react';

const Badge = ({ status, type = 'status' }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let variant = 'info';
  if (['present', 'approved', 'completed', 'active'].includes(normalized)) {
    variant = 'success';
  } else if (['pending', 'late', 'in progress', 'upcoming'].includes(normalized)) {
    variant = 'warning';
  } else if (['rejected', 'cancelled', 'inactive', 'half-day'].includes(normalized)) {
    variant = 'danger';
  }

  return (
    <span className={`badge badge-${variant}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
};

export default Badge;
