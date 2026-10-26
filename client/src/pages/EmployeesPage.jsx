import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Power,
  ShieldAlert,
  Building,
  Mail,
  Phone,
  Calendar,
  Sparkles,
} from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'IT',
  'Legal',
  'Administration',
  'Support',
];

const EmployeesPage = () => {
  const { isHR } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    phoneNumber: '',
    managerId: '',
  });

  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (department) params.department = department;
      if (role) params.role = role;

      const res = await api.get('/employees', { params });
      if (res.data?.success) {
        setEmployees(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagersList = async () => {
    try {
      const res = await api.get('/employees/managers/list');
      if (res.data?.success) {
        setManagers(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, role, page]);

  useEffect(() => {
    if (isHR) {
      fetchManagersList();
    }
  }, [isHR]);

  const handleOpenAddModal = () => {
    setFormData({
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      email: '',
      password: 'Password123!',
      role: 'employee',
      department: 'Engineering',
      designation: '',
      phoneNumber: '',
      managerId: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      email: emp.email,
      password: '',
      role: emp.role,
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      phoneNumber: emp.phoneNumber || '',
      managerId: emp.managerId?._id || '',
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      const payload = { ...formData };
      if (!payload.managerId) delete payload.managerId;
      await api.post('/employees', payload);
      setIsAddModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      if (!payload.managerId) payload.managerId = null;
      await api.put(`/employees/${selectedEmp._id}`, payload);
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user account?`)) {
      return;
    }
    try {
      await api.patch(`/employees/${id}/toggle-status`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Status toggle failed');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Users size={20} />
            </div>
            <span>Employee Directory</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage staff profiles, department assignments, and enterprise access levels.
          </p>
        </div>

        {isHR && (
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <UserPlus size={16} /> Add Employee
          </button>
        )}
      </div>

      {/* Filter Toolbar Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by name, ID, or corporate email..."
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              style={{ height: '40px' }}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              style={{ height: '40px' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="hr_admin">HR Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Role</th>
              <th>Reporting Manager</th>
              <th>Status</th>
              {isHR && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isHR ? 8 : 7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                  Loading employee records...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={isHR ? 8 : 7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                  No employees found matching the search criteria.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {emp.employeeId}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                      }}>
                        {emp.fullName?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{emp.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{emp.department || '—'}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {emp.designation || 'Staff'}
                  </td>
                  <td>
                    <span className="badge badge-role">
                      {emp.role === 'hr_admin' ? 'HR Admin' : emp.role === 'manager' ? 'Manager' : 'Employee'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {emp.managerId?.fullName || '—'}
                  </td>
                  <td>
                    <Badge status={emp.isActive ? 'Active' : 'Inactive'} />
                  </td>
                  {isHR && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="btn btn-outline btn-sm"
                          title="Edit Employee"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp._id, emp.isActive)}
                          className={`btn btn-sm ${emp.isActive ? 'btn-outline' : 'btn-success'}`}
                          style={{
                            color: emp.isActive ? 'var(--accent-rose)' : undefined,
                            borderColor: emp.isActive ? 'var(--danger-border)' : undefined,
                          }}
                          title={emp.isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          <Power size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Employee">
        {formError && (
          <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateEmployee}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                className="form-input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <input
                type="email"
                required
                placeholder="jane@staffsync.com"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Access Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr_admin">HR Admin</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                placeholder="Software Engineer"
                className="form-input"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reporting Manager</label>
              <select
                className="form-select"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              >
                <option value="">No Manager Assigned</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>{m.fullName} ({m.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              className="form-input"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={formSubmitting} className="btn btn-primary">
              {formSubmitting ? 'Registering...' : 'Register Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Employee: ${selectedEmp?.fullName}`}>
        {formError && (
          <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleUpdateEmployee}>
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-input"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reporting Manager</label>
              <select
                className="form-select"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              >
                <option value="">No Manager Assigned</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>{m.fullName} ({m.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reset Password (Optional)</label>
              <input
                type="password"
                placeholder="Leave blank to retain"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={formSubmitting} className="btn btn-primary">
              {formSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
