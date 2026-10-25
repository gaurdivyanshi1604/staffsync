import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Square,
  Users,
  Timer,
  Calendar,
} from 'lucide-react';

const AttendancePage = () => {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('my');
  const [todayStatus, setTodayStatus] = useState(null);
  const [myLogs, setMyLogs] = useState([]);
  const [teamLogs, setTeamLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Elapsed work timer
  const [elapsed, setElapsed] = useState('00:00:00');

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // 1. Today status
      const todayRes = await api.get('/attendance/today');
      if (todayRes.data?.success) {
        setTodayStatus(todayRes.data.data);
      }

      // 2. Personal attendance logs
      const myRes = await api.get('/attendance/my');
      if (myRes.data?.success) {
        setMyLogs(myRes.data.data);
      }

      // 3. Stats & team logs for HR or Manager
      if (isHR || isManager) {
        const [statsRes, allRes] = await Promise.all([
          api.get('/attendance/stats'),
          api.get('/attendance'),
        ]);
        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (allRes.data?.success) setTeamLogs(allRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [user]);

  // Live timer while checked in
  useEffect(() => {
    if (!todayStatus?.checkIn || todayStatus?.checkOut) {
      return;
    }
    const updateTimer = () => {
      const checkInTime = new Date(todayStatus.checkIn).getTime();
      const diff = Math.max(0, Date.now() - checkInTime);
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [todayStatus]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/check-in', { remarks });
      setRemarks('');
      await fetchAttendanceData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.put('/attendance/check-out');
      await fetchAttendanceData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="page-wrapper">
      {/* Title & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CalendarCheck size={20} />
            </div>
            <span>Attendance & Timesheets</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Track daily clock-ins, monitor active work hours, and inspect team rosters.
          </p>
        </div>

        {/* Tab switch for HR/Manager */}
        {(isHR || isManager) && (
          <div style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <button
              onClick={() => setActiveTab('my')}
              className={`btn btn-sm ${activeTab === 'my' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
            >
              My Attendance
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`btn btn-sm ${activeTab === 'team' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
            >
              {isHR ? 'Company Roster' : 'Team Roster'}
            </button>
          </div>
        )}
      </div>

      {/* Clock-In Terminal Card */}
      {activeTab === 'my' && (
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.75rem 2rem', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}>
            {/* Status Information */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: todayStatus
                  ? todayStatus.checkOut
                    ? '#eff6ff'
                    : '#ecfdf5'
                  : '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: todayStatus
                  ? todayStatus.checkOut
                    ? '#3b82f6'
                    : '#10b981'
                  : '#8b5cf6',
              }}>
                <Clock size={28} />
              </div>

              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Today's Shift Status
                </div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                  {todayStatus ? (
                    todayStatus.checkOut ? 'Shift Completed' : 'Active On Shift'
                  ) : (
                    'Not Checked In'
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {todayStatus?.checkIn && `Checked in at: ${formatTime(todayStatus.checkIn)}`}
                  {todayStatus?.checkOut && ` • Clocked out: ${formatTime(todayStatus.checkOut)}`}
                </div>
              </div>
            </div>

            {/* Live Stopwatch if Checked In */}
            {todayStatus && !todayStatus.checkOut && (
              <div style={{
                textAlign: 'center',
                padding: '0 2rem',
                borderLeft: '1px solid var(--border-color)',
                borderRight: '1px solid var(--border-color)',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Shift Time
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: '#10b981',
                  letterSpacing: '0.05em',
                }}>
                  {elapsed}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!todayStatus ? (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}
                >
                  <Play size={16} /> Clock In Now
                </button>
              ) : !todayStatus.checkOut ? (
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="btn btn-danger"
                  style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}
                >
                  <Square size={16} /> Clock Out
                </button>
              ) : (
                <span className="badge badge-success" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
                  <CheckCircle size={15} /> Total Hours: {todayStatus.workHours || 8} hrs
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Stats if on Team tab */}
      {activeTab === 'team' && stats && (
        <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
          <StatCard
            title="Present Today"
            value={stats.presentToday || 0}
            subtext="Clocked in staff"
            icon={Users}
            color="#10b981"
            bgTint="#ecfdf5"
            badgeText="Turnout"
            badgeType="success"
          />
          <StatCard
            title="On-Time Rate"
            value={`${stats.onTimeRate ?? 92}%`}
            subtext="Arrived before 9:15 AM"
            icon={CheckCircle}
            color="#3b82f6"
            bgTint="#eff6ff"
            badgeText="Punctuality"
            badgeType="info"
          />
          <StatCard
            title="Late Arrivals"
            value={stats.lateToday || 0}
            subtext="Delayed check-ins"
            icon={AlertTriangle}
            color="#d97706"
            bgTint="#fffbeb"
            badgeText="Delayed"
            badgeType="warning"
          />
          <StatCard
            title="Average Hours"
            value={`${stats.avgWorkHours ?? 8.2}h`}
            subtext="Per completed shift"
            icon={Clock}
            color="#8b5cf6"
            bgTint="#f5f3ff"
            badgeText="Shift Avg"
            badgeType="role"
          />
        </div>
      )}

      {/* Logs Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {activeTab === 'team' && <th>Employee</th>}
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Total Hours</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={activeTab === 'team' ? 7 : 6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                  Loading attendance records...
                </td>
              </tr>
            ) : (activeTab === 'my' ? myLogs : teamLogs).length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'team' ? 7 : 6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                  No attendance history available.
                </td>
              </tr>
            ) : (
              (activeTab === 'my' ? myLogs : teamLogs).map((rec) => (
                <tr key={rec._id}>
                  {activeTab === 'team' && (
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rec.userId?.fullName || 'Employee'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {rec.userId?.employeeId} • {rec.userId?.department}
                      </div>
                    </td>
                  )}
                  <td style={{ fontWeight: 500 }}>
                    {formatDate(rec.date)}
                  </td>
                  <td style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {formatTime(rec.checkIn)}
                  </td>
                  <td style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {formatTime(rec.checkOut)}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {rec.workHours ? `${rec.workHours} hrs` : 'In Progress'}
                  </td>
                  <td>
                    <Badge status={rec.status} />
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {rec.remarks || 'Regular Shift'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
