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

  const canManage = ['CRM Developer', 'CRM Consultant', 'System Architect', 'Super CRM Administrator'].includes(user?.role);
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

  const filtered = tickets.filter((t) =>
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.status?.toLowerCase().includes(search.toLowerCase()) ||
    t.priority?.toLowerCase().includes(search.toLowerCase()) ||
    t.affectedPage?.toLowerCase().includes(search.toLowerCase()) ||
    t.requesterTeam?.toLowerCase().includes(search.toLowerCase()) ||
    t.createdBy?.role?.toLowerCase().includes(search.toLowerCase()) ||
    t.createdBy?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    t.createdBy?.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="crm-glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563EB', marginBottom: 4 }}>
            System Support & Maintenance
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="tickets" size={26} style={{ color: '#2563EB' }} />
            Technical Issues ({filtered.length})
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, margin: 0 }}>
            {canManage
              ? 'Viewing all technical support issues reported to the Technology team'
              : 'Report and track technical issues submitted to the Technology team'}
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
              borderRadius: 8,
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

      {error && <div className="alert alert-error">{error}</div>}

      {/* Table Container */}
      <div className="crm-table-wrapper">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            Support Tickets Directory
          </div>
          <div style={{ position: 'relative', width: 280 }}>
            <span style={{ position: 'absolute', left: 10, top: 8, fontSize: 13, color: '#94A3B8' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by subject, status, or team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 30,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ padding: 40 }}><div className="spinner" />Loading support issues...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎫</div>
            <p style={{ fontWeight: 600, color: '#475569' }}>No support tickets match your search criteria.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject & Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Affected Page</th>
                <th>Reporting Team</th>
                <th>Assigned Developer</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => {
                const pb = priorityBadge(ticket.priority);
                const sb = statusBadge(ticket.status);
                return (
                  <tr key={ticket._id} style={{ opacity: updating === ticket._id ? 0.5 : 1 }}>
                    <td>
                      <div>
                        <strong style={{ fontSize: 14, color: '#0F172A' }}>{ticket.subject}</strong>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={ticket.priority}
                        onChange={(e) => handleUpdate(ticket._id, { priority: e.target.value })}
                        disabled={updating === ticket._id || !canManage}
                        style={{
                          background: pb.bg,
                          color: pb.color,
                          border: `1px solid ${pb.border}`,
                          borderRadius: 16,
                          padding: '3px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: canManage ? 'pointer' : 'default',
                          outline: 'none',
                        }}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleUpdate(ticket._id, { status: e.target.value })}
                        disabled={updating === ticket._id || !canManage}
                        style={{
                          background: sb.bg,
                          color: sb.color,
                          border: `1px solid ${sb.border}`,
                          borderRadius: 16,
                          padding: '3px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: canManage ? 'pointer' : 'default',
                          outline: 'none',
                        }}
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: '#475569' }}>
                      <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
                        {ticket.affectedPage || 'Other'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#475569' }}>
                      {ticket.requesterTeam || ticket.createdBy?.role || '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#475569' }}>
                      {ticket.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="crm-avatar-chip" style={{ width: 22, height: 22, fontSize: 9 }}>
                            {ticket.assignedTo.firstName?.[0] || 'D'}
                          </div>
                          <span>{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: '#94A3B8' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => openTicket(ticket._id)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          color: '#334155',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View Issue
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
