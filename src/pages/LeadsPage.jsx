import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Icon } from '../components/Icons';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];

const statusClass = (s) => {
  switch (s) {
    case 'New': return 'status-new';
    case 'Contacted': return 'status-contacted';
    case 'Qualified': return 'status-qualified';
    case 'Won':
    case 'Converted': return 'status-won';
    case 'Lost': return 'status-lost';
    default: return 'status-new';
  }
};

const LeadsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updating, setUpdating] = useState(null);

  const isAdmin = ['Super CRM Administrator', 'System Architect'].includes(user?.role);
  const isManager = user?.role === 'Sales Manager';
  const isAgent = user?.role === 'Sales Agent';
  const canReassign = isAdmin || isManager;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [leadsRes, agentsRes] = await Promise.all([
          API.get('/leads'),
          canReassign ? API.get('/leads/agents') : Promise.resolve({ data: { data: [] } }),
        ]);
        setLeads(leadsRes.data.data || []);
        setAgents(agentsRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load leads');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const updateLead = async (id, changes) => {
    setUpdating(id);
    try {
      const { data } = await API.put(`/leads/${id}`, changes);
      setLeads((prev) => prev.map((l) => (l._id === id ? data.data : l)));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = leads.filter(
    (l) =>
      (filterStatus === 'All' || l.status === filterStatus) &&
      (l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.source?.toLowerCase().includes(search.toLowerCase()) ||
        `${l.assignedTo?.firstName} ${l.assignedTo?.lastName}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="crm-glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563EB', marginBottom: 4 }}>
            Sales & Prospect Management
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="leads" size={26} style={{ color: '#2563EB' }} />
            Leads Directory ({filtered.length})
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, margin: 0 }}>
            {isAdmin && 'All prospects across enterprise teams'}
            {isManager && 'Assigned leads for your sales group'}
            {isAgent && 'Your personal lead pipeline'}
          </p>
        </div>

        {canReassign && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/leads/distribution')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8 }}
          >
            <Icon name="analytics" size={14} />
            <span>Lead Distribution & Rules</span>
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Table Container */}
      <div className="crm-table-wrapper">
        {/* Search & Filter Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Filter Status:</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['All', ...STATUSES].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 600,
                    border: filterStatus === st ? '1px solid #2563EB' : '1px solid #CBD5E1',
                    background: filterStatus === st ? '#2563EB' : '#ffffff',
                    color: filterStatus === st ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', width: 260 }}>
            <span style={{ position: 'absolute', left: 10, top: 8, fontSize: 13, color: '#94A3B8' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or rep..."
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
          <div className="loading-state" style={{ padding: 40 }}>
            <div className="spinner" />
            <span>Loading lead entries...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
            <p style={{ fontWeight: 600, color: '#475569' }}>No leads match your current search or filter.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lead Info</th>
                <th>Source</th>
                <th>Status</th>
                {canReassign && <th>Assigned Sales Rep</th>}
                {isAdmin && <th>Supervisor</th>}
                <th>Campaign</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead._id} style={{ opacity: updating === lead._id ? 0.5 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="crm-avatar-chip">
                        {lead.name ? lead.name[0].toUpperCase() : 'L'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{lead.name}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{lead.email}</div>
                        {lead.phone && <div style={{ fontSize: 11, color: '#94A3B8' }}>{lead.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: lead.source === 'Meta' ? '#E0F2FE' : '#FEF3C7', color: lead.source === 'Meta' ? '#0284C7' : '#B45309' }}>
                      {lead.source || 'Direct'}
                    </span>
                  </td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) => updateLead(lead._id, { status: e.target.value })}
                      disabled={updating === lead._id}
                      className={`crm-status-pill ${statusClass(lead.status)}`}
                      style={{ outline: 'none', cursor: 'pointer' }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  {canReassign && (
                    <td>
                      <select
                        value={lead.assignedTo?._id || lead.assignedTo || ''}
                        onChange={(e) => updateLead(lead._id, { assignedTo: e.target.value })}
                        disabled={updating === lead._id}
                        style={{
                          border: '1px solid #CBD5E1',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 12,
                          color: '#334155',
                          maxWidth: 160,
                          outline: 'none',
                        }}
                      >
                        <option value="">Unassigned</option>
                        {agents.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.firstName} {a.lastName}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  {isAdmin && (
                    <td style={{ fontSize: 12, color: '#64748B' }}>
                      {lead.assignedTo?.supervisor
                        ? `${lead.assignedTo.supervisor.firstName} ${lead.assignedTo.supervisor.lastName}`
                        : '—'}
                    </td>
                  )}
                  <td style={{ fontSize: 12, color: '#64748B' }}>
                    {lead.campaign?.name ? (
                      <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>
                        {lead.campaign.name}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: '#64748B' }}>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      style={{
                        background: '#2563EB',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
