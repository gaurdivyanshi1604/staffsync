import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import {
  Megaphone,
  PlusCircle,
  Archive,
  Calendar,
  User,
  Search,
} from 'lucide-react';

const CATEGORIES = ['All', 'General', 'HR Updates', 'Events', 'Important Notices'];

const AnnouncementsPage = () => {
  const { isHR } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'General',
    targetDepartment: '',
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      const res = await api.get('/announcements', { params });
      if (res.data?.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [categoryFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      const payload = { ...form };
      if (!payload.targetDepartment) delete payload.targetDepartment;
      await api.post('/announcements', payload);
      setIsModalOpen(false);
      setForm({
        title: '',
        content: '',
        category: 'General',
        targetDepartment: '',
      });
      fetchAnnouncements();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this announcement notice?')) return;
    try {
      await api.patch(`/announcements/${id}/archive`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Archive failed');
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Megaphone size={20} />
            </div>
            <span>Company Announcements</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Official corporate broadcasts, town hall updates, and department memos.
          </p>
        </div>

        {isHR && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> Post Announcement
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.75rem', padding: '1rem 1.25rem', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search announcements..."
              className="form-input"
              style={{ paddingLeft: '38px', height: '38px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
          Loading announcements...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)', backgroundColor: '#ffffff' }}>
          <Megaphone size={48} style={{ opacity: 0.25, margin: '0 auto 1rem', color: '#d97706' }} />
          <h3>No Announcements Found</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>No corporate notices match the active filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann._id}
              className="glass-card glass-card-interactive"
              style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Badge status={ann.category} />
                  {ann.targetDepartment && (
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {ann.targetDepartment} Dept Only
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {formatDate(ann.publishedAt || ann.createdAt)}
                  </span>
                  {isHR && (
                    <button
                      onClick={() => handleArchive(ann._id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--accent-rose)', borderColor: 'var(--danger-border)' }}
                      title="Archive Announcement"
                    >
                      <Archive size={13} /> Archive
                    </button>
                  )}
                </div>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--text-main)' }}>
                {ann.title}
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {ann.content}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <User size={14} />
                <span>Published by <strong>{ann.authorId?.fullName || 'HR Administration'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Official Notice">
        {formError && (
          <div style={{ padding: '0.75rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Company All-Hands & Awards"
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="HR Updates">HR Updates</option>
                <option value="Events">Events</option>
                <option value="Important Notices">Important Notices</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Audience (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank for All Staff"
                className="form-input"
                value={form.targetDepartment}
                onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Content</label>
            <textarea
              rows={5}
              required
              placeholder="Write the full announcement message..."
              className="form-textarea"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={formSubmitting} className="btn btn-primary">
              {formSubmitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
