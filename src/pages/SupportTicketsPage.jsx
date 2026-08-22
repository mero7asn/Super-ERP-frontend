import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { Icon } from '../components/Icons';

const PRIORITY_ORDER = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

const priorityColor = {
  Urgent: '#ef4444', High: '#f59e0b', Medium: '#06b6d4', Low: '#22c55e'
};

const statusColor = {
  'Open': '#4f6ef7',
  'In Progress': '#06b6d4',
  'Resolved': '#22c55e',
  'Closed': '#64748b',
};

// Resolution timer: ticks every second
const useElapsed = (createdAt) => {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(`${h}h ${m}m ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
};

const TicketRow = ({ ticket, onStatusChange }) => {
  const elapsed = useElapsed(ticket.createdAt);
  const isUrgent = ticket.priority === 'Urgent';
  const isOpen = ticket.status === 'Open' || ticket.status === 'In Progress';

  return (
    <tr style={isUrgent && isOpen ? { background: 'rgba(239,68,68,0.04)' } : {}}>
      <td>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{ticket.subject}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
          {ticket.description?.slice(0, 60)}{ticket.description?.length > 60 ? '…' : ''}
        </div>
      </td>
      <td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 20,
          fontSize: 11, fontWeight: 700,
          background: `${priorityColor[ticket.priority]}18`,
          color: priorityColor[ticket.priority],
        }}>
          {ticket.priority === 'Urgent' && <Icon name="alert" size={12} style={{ color: '#ef4444' }} />}
          {ticket.priority}
        </span>
      </td>
      <td>
        <select
          value={ticket.status}
          onChange={e => onStatusChange(ticket._id, e.target.value)}
          style={{
            background: `${statusColor[ticket.status]}18`,
            color: statusColor[ticket.status],
            border: `1px solid ${statusColor[ticket.status]}44`,
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {ticket.affectedPage || 'Other'}
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {ticket.requesterTeam || ticket.createdBy?.role || '—'}
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {ticket.assignedTo
          ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
          : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
      </td>
      <td>
        {isOpen ? (
          <span style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: isUrgent ? '#ef4444' : 'var(--accent-info)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Icon name="clock" size={12} />
            {elapsed}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
        )}
      </td>
    </tr>
  );
};

const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    API.get('/tickets')
      .then(({ data }) => setTickets(data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = useCallback(async (id, status) => {
    setTickets(prev =>
      prev.map(t => (t._id === id ? { ...t, status } : t))
    );
    try {
      await API.put(`/tickets/${id}`, { status });
    } catch { /* revert in production */ }
  }, []);

  const filtered = tickets
    .filter(t =>
      (filterPriority === 'All' || t.priority === filterPriority) &&
      (filterStatus === 'All' || t.status === filterStatus) &&
        (!search ||
        t.subject?.toLowerCase().includes(search.toLowerCase()) ||
        t.affectedPage?.toLowerCase().includes(search.toLowerCase()) ||
        t.requesterTeam?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
    );

  const openCount  = tickets.filter(t => t.status === 'Open').length;
  const urgentCount = tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 20 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', margin: 0 }}>
          <Icon name="support" size={26} style={{ color: '#F8FAFC' }} />
          Technical Issues
        </h1>
        <p className="page-subtitle" style={{ color: '#CBD5E1', marginTop: 8, marginBottom: 0 }}>View technical issues reported by internal teams to the Technology team.</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="crm-stat-widget">
          <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}><Icon name="ticket" size={18} /></div><span className="crm-trend-pill crm-trend-up">Live</span></div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{tickets.length}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total Tickets</div>
        </div>
        <div className="crm-stat-widget">
          <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#E0F2FE', color: '#0284C7' }}><Icon name="unlock" size={18} /></div><span className="crm-trend-pill crm-trend-up">Live</span></div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{openCount}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Open</div>
        </div>
        <div className="crm-stat-widget">
          <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#FEF2F2', color: '#DC2626' }}><Icon name="alert" size={18} /></div><span className="crm-trend-pill crm-trend-up">Live</span></div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{urgentCount}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Urgent Active</div>
        </div>
        <div className="crm-stat-widget">
          <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}><Icon name="check" size={18} /></div><span className="crm-trend-pill crm-trend-up">Live</span></div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{resolvedCount}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Resolved</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="crm-glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: 'linear-gradient(90deg, #F8FAFC 0%, #F1F5F9 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{filtered.length} Ticket{filtered.length !== 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 128, border: '1px solid #CBD5E1', borderRadius: 999, padding: '6px 10px', fontSize: 12, background: '#ffffff' }}>
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 140, border: '1px solid #CBD5E1', borderRadius: 999, padding: '6px 10px', fontSize: 12, background: '#ffffff' }}>
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <input placeholder="Search subject or customer…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, border: '1px solid #CBD5E1', borderRadius: 999, padding: '6px 10px', fontSize: 12, background: '#ffffff' }} />
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" />Loading tickets…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Icon name="ticket" size={48} style={{ opacity: 0.5 }} />
            </div>
            <p>No tickets match your filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12, padding: 16 }}>
            {filtered.map(ticket => (
              <TicketRow key={ticket._id} ticket={ticket} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;
