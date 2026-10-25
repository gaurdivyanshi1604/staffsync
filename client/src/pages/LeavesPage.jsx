import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import {
  CalendarRange,
  PlusCircle,
  Check,
  X,
  Trash2,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Inbox,
} from 'lucide-react';

const LeavesPage = () => {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('my');
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applyError, setApplyError] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Reject Modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const myRes = await api.get('/leaves/my');
      if (myRes.data?.success) {
        setMyLeaves(myRes.data.data);
      }

      if (isHR || isManager) {
        const allRes = await api.get('/leaves');
        if (allRes.data?.success) {
          setAllLeaves(allRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplySubmitting(true);
    setApplyError('');
    try {
      await api.post('/leaves', applyForm);
      setIsApplyModalOpen(false);
      setApplyForm({
        leaveType: 'Casual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }
    try {
      await api.put(`/leaves/${id}/cancel`);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleDecideLeave = async (id, status, reason = '') => {
    try {
      await api.put(`/leaves/${id}/decide`, {
        status,
        rejectionReason: reason,
      });
      setIsRejectModalOpen(false);
      setRejectionReason('');
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record decision');
    }
  };

  const pendingApprovals = allLeaves.filter((l) => l.status === 'Pending');

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  return (
    <div className="page-wrapper">
      {/* Title & Apply Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <CalendarRange size={20} />
            </div>
            <span>Time Off & Leave Management</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Submit time off applications, track approval workflows, and manage vacation allowances.
          </p>
        </div>

        <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={16} /> Apply for Leave
        </button>
      </div>

      {/* Quota Metric Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Casual Leave"
          value="12 Days"
          subtext="Available this year"
          icon={Calendar}
          color="#0284c7"
          bgTint="#f0f9ff"
          badgeText="Annual Quota"
          badgeType="info"
        />
        <StatCard
          title="Sick Leave"
          value="8 Days"
          subtext="Medical allocation"
          icon={CheckCircle2}
          color="#10b981"
          bgTint="#ecfdf5"
          badgeText="Health Care"
          badgeType="success"
        />
        <StatCard
          title="Earned Leave"
          value="15 Days"
          subtext="Accrued vacation time"
          icon={Clock}
          color="#8b5cf6"
          bgTint="#f5f3ff"
          badgeText="Paid Vacation"
          badgeType="role"
        />
        <StatCard
          title="Pending Requests"
          value={myLeaves.filter((l) => l.status === 'Pending').length}
          subtext="Awaiting review"
          icon={AlertCircle}
          color="#d97706"
          bgTint="#fffbeb"
          badgeText="In Review"
          badgeType="warning"
        />
      </div>

      {/* Tab Switch for HR/Manager */}
      {(isHR || isManager) && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveTab('my')}
            className={`btn ${activeTab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
          >
            My Applications ({myLeaves.length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Approval Queue ({pendingApprovals.length} Pending)
          </button>
        </div>
      )}

      {/* Tab 1: My Leave Requests Table */}
      {activeTab === 'my' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Reviewed By</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                    Loading leave applications...
                  </td>
                </tr>
              ) : myLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                    You have not submitted any leave requests yet.
                  </td>
                </tr>
              ) : (
                myLeaves.map((item) => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.leaveType} Leave</td>
                    <td>
                      {formatDate(item.startDate)} → {formatDate(item.endDate)}
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {calculateDays(item.startDate, item.endDate)} days
                    </td>
                    <td style={{ maxWidth: '280px', color: 'var(--text-muted)' }}>
                      <div>{item.reason}</div>
                      {item.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '0.2rem' }}>
                          Remarks: {item.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>
                      {item.reviewedBy?.fullName || 'Pending Review'}
                    </td>
                    <td>
                      <Badge status={item.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => handleCancelLeave(item._id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--accent-rose)', borderColor: 'var(--danger-border)' }}
                          title="Cancel Application"
                        >
                          <Trash2 size={13} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Approvals Queue (HR & Managers) */}
      {activeTab === 'approvals' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Decision</th>
              </tr>
            </thead>
            <tbody>
              {allLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                    No team leave records found.
                  </td>
                </tr>
              ) : (
                allLeaves.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.userId?.fullName || 'Employee'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {item.userId?.employeeId} • {item.userId?.department}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.leaveType}</td>
                    <td>
                      {formatDate(item.startDate)} → {formatDate(item.endDate)}
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {calculateDays(item.startDate, item.endDate)} days
                    </td>
                    <td style={{ maxWidth: '240px', color: 'var(--text-muted)' }}>
                      {item.reason}
                    </td>
                    <td>
                      <Badge status={item.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {item.status === 'Pending' ? (
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleDecideLeave(item._id, 'Approved')}
                            className="btn btn-success btn-sm"
                            title="Approve Leave"
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLeave(item);
                              setIsRejectModalOpen(true);
                            }}
                            className="btn btn-danger btn-sm"
                            title="Reject Leave"
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Reviewed by {item.reviewedBy?.fullName || 'Manager'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Submit Leave Application">
        {applyError && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {applyError}
          </div>
        )}
        <form onSubmit={handleApplySubmit}>
          <div className="form-group">
            <label className="form-label">Leave Category</label>
            <select
              className="form-select"
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
            >
              <option value="Casual">Casual Leave (Personal / Urgent)</option>
              <option value="Sick">Sick Leave (Medical / Health)</option>
              <option value="Earned">Earned / Annual Vacation</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Justification</label>
            <textarea
              rows={3}
              required
              placeholder="State the purpose of your time off..."
              className="form-textarea"
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsApplyModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={applySubmitting} className="btn btn-primary">
              {applySubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Leave Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Decline Leave Request">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Please specify the reason for declining this request from <strong>{selectedLeave?.userId?.fullName}</strong>.
        </p>
        <div className="form-group">
          <label className="form-label">Rejection Remarks</label>
          <textarea
            rows={3}
            required
            placeholder="e.g. Critical project sprint milestone, please reschedule..."
            className="form-textarea"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" onClick={() => setIsRejectModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDecideLeave(selectedLeave?._id, 'Rejected', rejectionReason)}
            className="btn btn-danger"
          >
            Confirm Rejection
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LeavesPage;
