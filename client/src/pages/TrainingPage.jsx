import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  GraduationCap,
  PlusCircle,
  UserPlus,
  Calendar,
  MapPin,
  User,
  Users,
  CheckCircle,
  BookOpen,
} from 'lucide-react';

const TrainingPage = () => {
  const { user, isHR, isManager } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    trainer: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: 20,
    status: 'Upcoming',
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainings');
      if (res.data?.success) {
        setTrainings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await api.get('/employees?limit=100');
      if (res.data?.success) {
        setEmployees(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTrainings();
    if (isHR || isManager) {
      fetchEmployeesList();
    }
  }, [user]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      await api.post('/trainings', createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        title: '',
        description: '',
        trainer: '',
        startDate: '',
        endDate: '',
        location: '',
        capacity: 20,
        status: 'Upcoming',
      });
      fetchTrainings();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create training');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenAssignModal = (training) => {
    setSelectedTraining(training);
    const currentIds = (training.assignedEmployees || []).map((e) => e._id || e);
    setSelectedEmployees(currentIds);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trainings/${selectedTraining._id}/assign`, {
        employeeIds: selectedEmployees,
      });
      setIsAssignModalOpen(false);
      fetchTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign employees');
    }
  };

  const toggleEmployeeSelect = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="page-wrapper">
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <GraduationCap size={20} />
            </div>
            <span>Learning & Development Programs</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Upskilling curricula, corporate certifications, and talent enablement workshops.
          </p>
        </div>

        {(isHR || isManager) && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> Create Program
          </button>
        )}
      </div>

      {/* Program Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
          Loading training programs...
        </div>
      ) : trainings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)', backgroundColor: '#ffffff' }}>
          <BookOpen size={48} style={{ opacity: 0.25, margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <h3>No Training Programs Scheduled</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Check back later or schedule a new talent workshop.</p>
        </div>
      ) : (
        <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
          {trainings.map((t) => {
            const enrolledCount = t.assignedEmployees?.length || 0;
            const fillPct = Math.min(100, Math.round((enrolledCount / t.capacity) * 100));
            const isUserEnrolled = (t.assignedEmployees || []).some(
              (emp) => (emp._id || emp) === user?._id
            );

            return (
              <div
                key={t._id}
                className="glass-card glass-card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <Badge status={t.status} />
                    {isUserEnrolled && (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle size={12} /> You are Enrolled
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {t.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {t.description || 'Comprehensive corporate training curriculum.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={15} style={{ color: '#0284c7' }} />
                      <span>Trainer: <strong style={{ color: 'var(--text-main)' }}>{t.trainer}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={15} style={{ color: '#d97706' }} />
                      <span>{formatDate(t.startDate)} → {formatDate(t.endDate)}</span>
                    </div>
                    {t.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={15} style={{ color: '#e11d48' }} />
                        <span>{t.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Capacity & Actions */}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Enrolled Seats</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {enrolledCount} / {t.capacity} ({fillPct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ width: `${fillPct}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5, #0284c7)', borderRadius: '3px' }} />
                  </div>

                  {(isHR || isManager) && (
                    <button
                      onClick={() => handleOpenAssignModal(t)}
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%' }}
                    >
                      <UserPlus size={14} /> Manage Assigned Employees ({enrolledCount})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Program Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Schedule New Training Program">
        {formError && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Program Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Cloud Architecture & Kubernetes"
              className="form-input"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Lead Trainer / Instructor</label>
              <input
                type="text"
                required
                placeholder="Dr. Jordan West"
                className="form-input"
                value={createForm.trainer}
                onChange={(e) => setCreateForm({ ...createForm, trainer: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Capacity</label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                value={createForm.capacity}
                onChange={(e) => setCreateForm({ ...createForm, capacity: parseInt(e.target.value) || 20 })}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Location / URL</label>
              <input
                type="text"
                placeholder="Virtual Lab or Room 402"
                className="form-input"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Course Description & Outcomes</label>
            <textarea
              rows={3}
              placeholder="Outline the workshop goals and syllabus..."
              className="form-textarea"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={formSubmitting} className="btn btn-primary">
              {formSubmitting ? 'Scheduling...' : 'Schedule Program'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Employees Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Staff: ${selectedTraining?.title}`}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
          Select the team members you wish to enroll in this course:
        </p>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', marginBottom: '1.25rem' }}>
          {employees.map((emp) => {
            const isChecked = selectedEmployees.includes(emp._id);
            return (
              <label
                key={emp._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: isChecked ? '#eef2ff' : 'transparent',
                  cursor: 'pointer',
                  marginBottom: '2px',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleEmployeeSelect(emp._id)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{emp.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.employeeId} • {emp.department}</div>
                </div>
              </label>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleAssignSubmit} className="btn btn-primary">
            Save Enrolled Staff ({selectedEmployees.length})
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TrainingPage;
