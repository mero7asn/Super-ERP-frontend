import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Icon } from '../components/Icons';

const AFFECTED_PAGES = [
  'Other',
  'Dashboard',
  'Leads',
  'Lead Distribution',
  'Sales Dashboard',
  'Offers',
  'Bookings',
  'Campaigns',
  'Analytics',
  'Executive Dashboard',
  'Teams',
  'User Management',
  'User Profile',
  'Settings',
  'CRM Dev Tools'
];

const userName = (person) => (person ? `${person.firstName} ${person.lastName}` : 'System');
const sameId = (left, right) => Boolean(left && right && left.toString() === right.toString());
const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—');

const priorityBadge = (p) => {
  switch (p) {
    case 'Urgent': return { bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5' };
    case 'High': return { bg: '#FFF7ED', color: '#EA580C', border: '#FFEDD5' };
    case 'Medium': return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
    default: return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' };
  }
};

const statusBadge = (s) => {
  switch (s) {
    case 'Open': return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
    case 'In Progress': return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
    case 'Resolved': return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
    case 'Closed': return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
    default: return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
  }
};

const TicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [technologyUsers, setTechnologyUsers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [commentSaving, setCommentSaving] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    affectedPage: 'Other',
    priority: 'Medium',
    assignedTo: ''
  });

  const canManage = ['CRM Developer', 'CRM Consultant', 'System Architect', 'CRM core Administrator'].includes(user?.role);
  const canCreate = Boolean(user);
  const canComment = Boolean(
    selectedTicket &&
    (
      canManage ||
      sameId(selectedTicket.assignedTo?._id, user?._id) ||
      sameId(selectedTicket.createdBy?._id, user?._id)
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, technologyUsersRes] = await Promise.all([
          API.get('/tickets'),
          canManage ? API.get('/tickets/technology-users') : Promise.resolve({ data: { data: [] } })
        ]);
        setTickets(ticketsRes.data.data || []);
        setTechnologyUsers(technologyUsersRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canManage]);

  const refreshTickets = async () => {
    const { data } = await API.get('/tickets');
    setTickets(data.data || []);
  };

  const openTicket = async (id) => {
    try {
      const { data } = await API.get(`/tickets/${id}`);
      setSelectedTicket(data.data);
      setShowDetailsModal(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details');
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...newTicket };
      if (!canManage) {
        delete payload.assignedTo;
        delete payload.priority;
      }
      await API.post('/tickets', payload);
      await refreshTickets();
      setShowModal(false);
      setNewTicket({ subject: '', description: '', affectedPage: 'Other', priority: 'Medium', assignedTo: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, changes) => {
    setUpdating(id);
    try {
      await API.put(`/tickets/${id}`, changes);
      await refreshTickets();
      if (selectedTicket?._id === id) {
        const { data } = await API.get(`/tickets/${id}`);
        setSelectedTicket(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setUpdating(null);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    setCommentSaving(true);
    setError('');
    try {
      await API.post(`/tickets/${selectedTicket._id}/comments`, { text: newComment.trim() });
      const { data } = await API.get(`/tickets/${selectedTicket._id}`);
      setSelectedTicket(data.data);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentSaving(false);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchesSearch =
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.status?.toLowerCase().includes(search.toLowerCase()) ||
      t.priority?.toLowerCase().includes(search.toLowerCase()) ||
      t.affectedPage?.toLowerCase().includes(search.toLowerCase()) ||
      t.requesterTeam?.toLowerCase().includes(search.toLowerCase()) ||
      t.createdBy?.role?.toLowerCase().includes(search.toLowerCase()) ||
      t.createdBy?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      t.createdBy?.lastName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="crm-page-banner" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 6 }}>
            System Support & Maintenance
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
            <span style={{ marginRight: 8 }}>??</span> Technical Issues ({filtered.length})
          </h1>
          <p style={{ fontSize: 14, color: '#CBD5E1', marginTop: 8, margin: 0, lineHeight: 1.5 }}>
            {canManage
              ? 'Viewing all technical support issues reported to the Technology team.'
              : 'Report and track technical issues submitted to the Technology team.'}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#2563EB',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <span>+</span>
            <span>Report Technical Issue</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Open', value: tickets.filter((t) => t.status === 'Open').length, icon: 'unlock', color: '#2563EB', bg: '#EFF6FF' },
          { label: 'In Progress', value: tickets.filter((t) => t.status === 'In Progress').length, icon: 'play', color: '#D97706', bg: '#FEF3C7' },
          { label: 'Resolved', value: tickets.filter((t) => t.status === 'Resolved').length, icon: 'check', color: '#059669', bg: '#ECFDF5' },
          { label: 'Urgent', value: tickets.filter((t) => t.priority === 'Urgent').length, icon: 'alert', color: '#DC2626', bg: '#FEF2F2' },
        ].map((item) => (
          <div key={item.label} className="crm-stat-widget">
            <div className="crm-stat-header">
              <div className="crm-stat-icon-bg" style={{ background: item.bg, color: item.color }}>
                <Icon name={item.icon} size={16} />
              </div>
              <span className="crm-trend-pill crm-trend-up">Live</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{item.value}</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="crm-glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: 'linear-gradient(90deg, #F8FAFC 0%, #F1F5F9 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            Support Tickets Directory
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All','Open','In Progress','Resolved','Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: filterStatus === status ? '1px solid #2563EB' : '1px solid #CBD5E1',
                    background: filterStatus === status ? '#2563EB' : '#ffffff',
                    color: filterStatus === status ? '#ffffff' : '#475569',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', width: 280 }}>
              <span style={{ position: 'absolute', left: 10, top: 8, fontSize: 13, color: '#94A3B8' }}>??</span>
              <input
                type="text"
                placeholder="Search by subject, status, or team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 30,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 999,
                  border: '1px solid #CBD5E1',
                  fontSize: 12,
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ padding: 40 }}><div className="spinner" />Loading support issues...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>??</div>
            <p style={{ fontWeight: 600, color: '#475569' }}>No support tickets match your search criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12, padding: 16 }}>
            {filtered.map((ticket) => {
              const pb = priorityBadge(ticket.priority);
              const sb = statusBadge(ticket.status);
              return (
                <div key={ticket._id} style={{ border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, background: '#ffffff', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.03)', opacity: updating === ticket._id ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <strong style={{ fontSize: 14, color: '#0F172A' }}>{ticket.subject}</strong>
                        <span style={{ background: pb.bg, color: pb.color, border: `1px solid ${pb.border}`, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          {ticket.priority}
                        </span>
                        <span style={{ background: sb.bg, color: sb.color, border: `1px solid ${sb.border}`, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          {ticket.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, maxWidth: 560 }}>
                        {ticket.description}
                      </div>
                    </div>
                    <button onClick={() => openTicket(ticket._id)} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      View Issue
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#64748B' }}><strong style={{ color: '#0F172A' }}>Affected page:</strong> {ticket.affectedPage || 'Other'}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}><strong style={{ color: '#0F172A' }}>Reporting team:</strong> {ticket.requesterTeam || ticket.createdBy?.role || '—'}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}><strong style={{ color: '#0F172A' }}>Assignee:</strong> {ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}><strong style={{ color: '#0F172A' }}>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#ffffff', borderRadius: 16, padding: 32, maxWidth: 580, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Report Technical Issue</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px 0' }}>Submit bug or feature feedback directly to the CRM Engineering Team.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Issue Subject</label>
                <input
                  className="form-input"
                  placeholder="Brief summary of the issue..."
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Steps to reproduce, error text, or expected behavior..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Affected Module / Page</label>
                <select
                  className="form-input"
                  value={newTicket.affectedPage}
                  onChange={(e) => setNewTicket((p) => ({ ...p, affectedPage: e.target.value }))}
                >
                  {AFFECTED_PAGES.map((page) => (
                    <option key={page}>{page}</option>
                  ))}
                </select>
              </div>

              {canManage && (
                <>
                  <div>
                    <label className="form-label">Priority</label>
                    <select
                      className="form-input"
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket((p) => ({ ...p, priority: e.target.value }))}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Assign Developer</label>
                    <select
                      className="form-input"
                      value={newTicket.assignedTo}
                      onChange={(e) => setNewTicket((p) => ({ ...p, assignedTo: e.target.value }))}
                    >
                      <option value="">Unassigned</option>
                      {technologyUsers.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.firstName} {agent.lastName} ({agent.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={saving} style={{ background: '#2563EB' }}>
                {saving ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details & Comments Modal */}
      {showDetailsModal && selectedTicket && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20,
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            style={{
              background: '#ffffff', borderRadius: 16, padding: 32, maxWidth: 740, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>{selectedTicket.subject}</h2>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  Page: <strong>{selectedTicket.affectedPage || 'Other'}</strong> · Status: <strong>{selectedTicket.status}</strong> · Priority: <strong>{selectedTicket.priority}</strong>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#64748B', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 14, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Issue Details</div>
                <div style={{ fontSize: 13, color: '#1E293B', marginTop: 6, whiteSpace: 'pre-wrap' }}>{selectedTicket.description}</div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Reporter Info</div>
                <div style={{ fontSize: 13, color: '#1E293B', marginTop: 6 }}>{userName(selectedTicket.createdBy)} ({selectedTicket.createdBy?.role || 'User'})</div>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Discussion & Activity History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {(selectedTicket.comments || []).length === 0 ? (
                <div style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>No discussion notes added yet.</div>
              ) : (
                (selectedTicket.comments || []).map((comment) => (
                  <div key={comment._id} style={{ padding: 12, borderRadius: 8, background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: 12, color: '#1E293B' }}>{userName(comment.author)}</strong>
                      <span style={{ fontSize: 10, color: '#94A3B8' }}>{formatDate(comment.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#334155' }}>{comment.text}</div>
                  </div>
                ))
              )}
            </div>

            {canComment && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Type an update or comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentSaving || !newComment.trim()}
                  style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  {commentSaving ? 'Saving...' : 'Add Comment'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
