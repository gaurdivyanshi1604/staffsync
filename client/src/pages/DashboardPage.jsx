import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import {
  Users,
  CalendarCheck,
  Clock,
  CalendarRange,
  GraduationCap,
  Megaphone,
  CheckCircle,
  Building2,
  TrendingUp,
  ArrowRight,
  PieChart as PieIcon,
  Activity,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';

const DONUT_COLORS = ['#10b981', '#f59e0b', '#cbd5e1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '0.625rem 0.875rem',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        fontSize: '0.75rem',
      }}>
        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: entry.color, marginBottom: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ color: '#475569', fontWeight: 500 }}>{entry.name}:</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { user, isHR, isManager } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayAttStatus, setTodayAttStatus] = useState(null);
  const [attActionLoading, setAttActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let endpoint = '/dashboard/employee';
      if (isHR) endpoint = '/dashboard/hr';
      else if (isManager) endpoint = '/dashboard/manager';

      const res = await api.get(endpoint);
      if (res.data?.success) {
        setData(res.data.data);
      }

      // Fetch employee today attendance status
      const todayRes = await api.get('/attendance/today');
      if (todayRes.data?.success) {
        setTodayAttStatus(todayRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const handleCheckIn = async () => {
    setAttActionLoading(true);
    try {
      await api.post('/attendance/check-in');
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setAttActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttActionLoading(true);
    try {
      await api.put('/attendance/check-out');
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setAttActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e0e7ff',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.25rem',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading dashboard analytics...</p>
      </div>
    );
  }

  // Calculate attendance distribution for Donut chart
  const presentCount = data?.todayAttendance || 0;
  const activeCount = data?.activeEmployees || (isManager ? data?.teamSize : 1) || 1;
  const absentCount = Math.max(0, activeCount - presentCount);
  
  const attendanceDonutData = [
    { name: 'Present Today', value: presentCount },
    { name: 'Not Checked In', value: absentCount },
  ];

  const presentPercentage = Math.round((presentCount / activeCount) * 100);

  return (
    <div className="page-wrapper">
      {/* Top Welcome Banner */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          padding: '1.75rem 2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 60%, #eef2ff 100%)',
          border: '1px solid #e0e7ff',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5', marginBottom: '0.625rem' }}>
            <Sparkles size={13} style={{ color: '#8b5cf6' }} />
            <span>StaffSync Workspace</span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Good day, {user?.fullName}! 👋
          </h1>
          <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.35rem', maxWidth: '620px' }}>
            {isHR
              ? 'Here is an overview of your organization workforce, real-time presence, and pending HR tasks.'
              : isManager
              ? `Supervising operations and personnel approvals for the ${user?.department || 'Operations'} team.`
              : 'Track your daily shift hours, view upcoming training schedules, and manage your time off.'}
          </p>
        </div>

        {/* Quick Shift Terminal Pill */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.875rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Today's Shift
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-main)' }}>
              {todayAttStatus?.status ? (
                <span style={{ color: 'var(--success-text)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> {todayAttStatus.status}
                </span>
              ) : (
                <span style={{ color: 'var(--text-dim)' }}>Not Checked In</span>
              )}
            </div>
          </div>

          {!todayAttStatus ? (
            <button
              onClick={handleCheckIn}
              disabled={attActionLoading}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.55rem 1rem' }}
            >
              <Clock size={14} /> Clock In
            </button>
          ) : !todayAttStatus.checkOut ? (
            <button
              onClick={handleCheckOut}
              disabled={attActionLoading}
              className="btn btn-danger btn-sm"
              style={{ padding: '0.55rem 1rem' }}
            >
              <Clock size={14} /> Clock Out
            </button>
          ) : (
            <span className="badge badge-success" style={{ padding: '0.45rem 0.75rem' }}>
              Shift Completed
            </span>
          )}
        </div>
      </div>

      {/* HR Admin View */}
      {isHR && data && (
        <>
          {/* Top 4 Stat Cards */}
          <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
            <StatCard
              title="Total Workforce"
              value={data.totalEmployees || 0}
              subtext={`${data.activeEmployees || 0} active employees`}
              icon={Users}
              color="#4f46e5"
              bgTint="#eef2ff"
              badgeText="Active Roster"
              badgeType="info"
            />
            <StatCard
              title="Present Today"
              value={data.todayAttendance || 0}
              subtext="Clocked in today"
              icon={CalendarCheck}
              color="#10b981"
              bgTint="#ecfdf5"
              badgeText={`${presentPercentage}% Present`}
              badgeType="success"
            />
            <StatCard
              title="Pending Leaves"
              value={data.pendingLeaves || 0}
              subtext="Awaiting review"
              icon={CalendarRange}
              color="#d97706"
              bgTint="#fffbeb"
              badgeText="Action Req"
              badgeType="warning"
            />
            <StatCard
              title="Active Programs"
              value={data.activeTraining || 0}
              subtext="Scheduled & ongoing"
              icon={GraduationCap}
              color="#8b5cf6"
              bgTint="#f5f3ff"
              badgeText="L&D Portal"
              badgeType="role"
            />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Weekly Attendance Trend Area Chart */}
            <div className="glass-card" style={{ gridColumn: 'span 8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Weekly Attendance Activity</h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Daily count of on-time present vs delayed clock-ins
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Live Stream</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <TrendingUp size={16} />
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '270px' }}>
                {data.attendanceChart && data.attendanceChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.attendanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                      <Area type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPresent)" />
                      <Area type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLate)" />
                      <Area type="monotone" dataKey="halfDay" name="Half-Day" stroke="#f43f5e" strokeWidth={2} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                    No recent attendance logs recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Donut Ratio Chart */}
            <div className="glass-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Today's Presence</h3>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <PieIcon size={16} />
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Total active employees vs today's check-ins
                </p>
              </div>

              <div style={{ position: 'relative', width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {attendanceDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center text in Donut */}
                <div style={{
                  position: 'absolute',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {presentPercentage}%
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontWeight: 600, marginTop: '2px' }}>
                    Turnout
                  </div>
                </div>
              </div>

              {/* Donut Legend */}
              <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Present ({presentCount})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Unmarked ({absentCount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Breakdown Bar Chart Row */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Department Distribution</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Workforce headcount distribution across functional units
                </p>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                <Building2 size={16} />
              </div>
            </div>

            <div style={{ width: '100%', height: '220px' }}>
              {data.departmentStats && data.departmentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Staff Count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)' }}>
                  No department statistics
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Manager View */}
      {isManager && data && (
        <>
          <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
            <StatCard
              title="Team Size"
              value={data.teamSize || 0}
              subtext="Supervised staff"
              icon={Users}
              color="#3b82f6"
              bgTint="#eff6ff"
              badgeText="Department"
              badgeType="info"
            />
            <StatCard
              title="Team Present"
              value={data.teamAttendanceToday || 0}
              subtext="Clocked in today"
              icon={CalendarCheck}
              color="#10b981"
              bgTint="#ecfdf5"
              badgeText="On Shift"
              badgeType="success"
            />
            <StatCard
              title="Pending Leaves"
              value={data.pendingLeaves || 0}
              subtext="Require your approval"
              icon={CalendarRange}
              color="#d97706"
              bgTint="#fffbeb"
              badgeText="Pending Decision"
              badgeType="warning"
            />
            <StatCard
              title="Upcoming Training"
              value={data.upcomingTraining || 0}
              subtext="Scheduled learning"
              icon={GraduationCap}
              color="#8b5cf6"
              bgTint="#f5f3ff"
              badgeText="Enrolled"
              badgeType="role"
            />
          </div>
        </>
      )}

      {/* Employee View */}
      {!isHR && !isManager && data && (
        <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Casual Leave Balance"
            value={`${data.leaveBalance?.casualRemaining ?? 12} Days`}
            subtext="Available this calendar year"
            icon={CalendarRange}
            color="#0284c7"
            bgTint="#f0f9ff"
            badgeText="Quota"
            badgeType="info"
          />
          <StatCard
            title="Sick Leave Balance"
            value={`${data.leaveBalance?.sickRemaining ?? 8} Days`}
            subtext="Medical leave allocation"
            icon={CalendarCheck}
            color="#10b981"
            bgTint="#ecfdf5"
            badgeText="Medical"
            badgeType="success"
          />
          <StatCard
            title="Active Trainings"
            value={data.upcomingTraining?.length || 0}
            subtext="Enrolled courses"
            icon={GraduationCap}
            color="#8b5cf6"
            bgTint="#f5f3ff"
            badgeText="L&D"
            badgeType="role"
          />
        </div>
      )}

      {/* Bottom Grid: Recent Announcements & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Recent Announcements */}
        <div className="glass-card" style={{ gridColumn: 'span 8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Megaphone size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Company Announcements</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>Latest notices and official memos</p>
              </div>
            </div>
            <Link to="/announcements" className="btn btn-outline btn-sm">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data?.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
              data.recentAnnouncements.map((ann) => (
                <div
                  key={ann._id}
                  style={{
                    padding: '1rem 1.125rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'border-color var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{ann.title}</span>
                    <Badge status={ann.category} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>
                    {ann.content}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8125rem', textAlign: 'center', padding: '2rem 0' }}>
                No recent notices published.
              </p>
            )}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="glass-card" style={{ gridColumn: 'span 4' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.0625rem', fontWeight: 700 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/attendance" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
              <Clock size={16} style={{ color: '#0284c7' }} />
              <span>Log Attendance & Timesheets</span>
            </Link>
            <Link to="/leaves" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
              <CalendarRange size={16} style={{ color: '#d97706' }} />
              <span>Apply for Time Off</span>
            </Link>
            {(isHR || isManager) && (
              <Link to="/employees" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
                <Users size={16} style={{ color: '#10b981' }} />
                <span>Personnel Directory</span>
              </Link>
            )}
            <Link to="/training" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
              <GraduationCap size={16} style={{ color: '#8b5cf6' }} />
              <span>Training Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
