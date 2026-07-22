import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icons';
import API from '../services/api';

const ROLE_GROUPS = {
  sales: ['Sales Agent', 'Sales Manager'],
  support: ['Customer Support Agent', 'Customer Support Manager'],
  marketing: ['Marketing Specialist', 'Marketing Manager'],
  analytics: ['Business Analyst', 'Executive User'],
  admin: ['Super CRM Administrator', 'System Architect', 'CRM Developer', 'CRM Consultant'],
};

const getRoleGroup = (role) => {
  for (const [group, roles] of Object.entries(ROLE_GROUPS)) {
    if (roles.includes(role)) return group;
  }
  return 'admin';
};

const ROLE_CARDS = {
  sales: [
    { label: 'My Leads', value: '–', icon: 'target', color: '#2563EB', bg: '#EFF6FF', trend: '+12% this week' },
    { label: 'Contacted', value: '–', icon: 'phone', color: '#0284C7', bg: '#E0F2FE', trend: '84% response rate' },
    { label: 'Converted', value: '–', icon: 'check', color: '#059669', bg: '#ECFDF5', trend: '↑ 3.2% vs last mo' },
    { label: 'Lost', value: '–', icon: 'close', color: '#DC2626', bg: '#FEF2F2', trend: 'Low churn' },
  ],
  support: [
    { label: 'My Tickets', value: '–', icon: 'ticket', color: '#2563EB', bg: '#EFF6FF', trend: 'Active workload' },
    { label: 'Open', value: '–', icon: 'unlock', color: '#0284C7', bg: '#E0F2FE', trend: 'Needs action' },
    { label: 'Resolved', value: '–', icon: 'check', color: '#059669', bg: '#ECFDF5', trend: '96% SLA compliance' },
    { label: 'Urgent', value: '–', icon: 'alert', color: '#DC2626', bg: '#FEF2F2', trend: 'High priority' },
  ],
  marketing: [
    { label: 'Campaigns', value: '–', icon: 'megaphone', color: '#2563EB', bg: '#EFF6FF', trend: '4 total channels' },
    { label: 'Active', value: '–', icon: 'play', color: '#059669', bg: '#ECFDF5', trend: 'Live broadcasts' },
    { label: 'Meta Leads', value: '–', icon: 'like', color: '#0284C7', bg: '#E0F2FE', trend: 'Social conversion' },
    { label: 'Google Leads', value: '–', icon: 'search', color: '#D97706', bg: '#FEF3C7', trend: 'Search inbound' },
  ],
  analytics: [
    { label: 'Total Leads', value: '–', icon: 'target', color: '#2563EB', bg: '#EFF6FF', trend: '↑ 14% MoM' },
    { label: 'Total Tickets', value: '–', icon: 'ticket', color: '#0284C7', bg: '#E0F2FE', trend: 'SLA healthy' },
    { label: 'Active Campaigns', value: '–', icon: 'megaphone', color: '#059669', bg: '#ECFDF5', trend: 'Optimal ROI' },
    { label: 'Conversion Rate', value: '–', icon: 'trending', color: '#D97706', bg: '#FEF3C7', trend: 'Benchmark 22%' },
  ],
  admin: [
    { label: 'Total Leads', value: '–', icon: 'target', color: '#2563EB', bg: '#EFF6FF', trend: 'Live pipeline' },
    { label: 'Open Tickets', value: '–', icon: 'ticket', color: '#0284C7', bg: '#E0F2FE', trend: 'Support queue' },
    { label: 'Active Campaigns', value: '–', icon: 'megaphone', color: '#059669', bg: '#ECFDF5', trend: 'Marketing ROI' },
    { label: 'System Users', value: '–', icon: 'users', color: '#D97706', bg: '#FEF3C7', trend: 'Active accounts' },
  ],
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const group = getRoleGroup(user?.role);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [leadsRes, ticketsRes, campaignsRes, usersRes] = await Promise.all([
          API.get('/leads').catch(() => ({ data: { data: [] } })),
          API.get('/tickets').catch(() => ({ data: { data: [] } })),
          API.get('/campaigns').catch(() => ({ data: { data: [] } })),
          ['Super CRM Administrator', 'System Architect'].includes(user?.role) 
            ? API.get('/auth/users').catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [] } })
        ]);

        const leads = leadsRes.data.data || [];
        const tickets = ticketsRes.data.data || [];
        const campaigns = campaignsRes.data.data || [];
        const users = usersRes.data.data || [];

        setStats({
          totalLeads: leads.length,
          myLeads: leads.filter(l => l.assignedTo?._id === user._id || l.assignedTo === user._id).length,
          contactedLeads: leads.filter(l => l.status === 'Contacted').length,
          convertedLeads: leads.filter(l => l.status === 'Converted').length,
          lostLeads: leads.filter(l => l.status === 'Lost').length,
          metaLeads: leads.filter(l => l.source === 'Meta').length,
          googleLeads: leads.filter(l => l.source === 'Google').length,
          totalTickets: tickets.length,
          myTickets: tickets.filter(t => t.assignedTo?._id === user._id || t.assignedTo === user._id).length,
          openTickets: tickets.filter(t => t.status === 'Open').length,
          resolvedTickets: tickets.filter(t => t.status === 'Resolved').length,
          urgentTickets: tickets.filter(t => t.priority === 'Urgent').length,
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'Active').length,
          totalUsers: users.length,
          conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Converted').length / leads.length) * 100) : 0
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const getCardValue = (label) => {
    if (!stats) return '–';
    const map = {
      'My Leads': stats.myLeads,
      'Contacted': stats.contactedLeads,
      'Converted': stats.convertedLeads,
      'Lost': stats.lostLeads,
      'My Tickets': stats.myTickets,
      'Open': stats.openTickets,
      'Resolved': stats.resolvedTickets,
      'Urgent': stats.urgentTickets,
      'Campaigns': stats.totalCampaigns,
      'Active': stats.activeCampaigns,
      'Meta Leads': stats.metaLeads,
      'Google Leads': stats.googleLeads,
      'Total Leads': stats.totalLeads,
      'Total Tickets': stats.totalTickets,
      'Active Campaigns': stats.activeCampaigns,
      'Conversion Rate': `${stats.conversionRate}%`,
      'System Users': stats.totalUsers,
      'Open Tickets': stats.openTickets
    };
    return map[label] ?? '–';
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="crm-page-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 4 }}>
              Super CRM Executive Workspace
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {greeting}, {user?.firstName} 👋
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 6, margin: 0 }}>
              Role: <strong style={{ color: '#F1F5F9' }}>{user?.role}</strong> &nbsp;&middot; Real-time operations & pipeline metrics
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/leads')} className="btn btn-primary btn-sm" style={{ background: '#2563EB', border: 'none', padding: '8px 16px', borderRadius: 8 }}>
              Manage Leads →
            </button>
            <button onClick={() => navigate('/kanban')} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 8 }}>
              Sales Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: 0 }}>
        {ROLE_CARDS[group].map((card) => (
          <div key={card.label} className="crm-stat-widget">
            <div className="crm-stat-header">
              <div className="crm-stat-icon-bg" style={{ background: card.bg, color: card.color }}>
                <Icon name={card.icon} size={20} />
              </div>
              <span className="crm-trend-pill crm-trend-up">
                {card.trend}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
                {loading ? '–' : getCardValue(card.label)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Access Permissions & Quick Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Permissions Panel */}
        <div className="crm-glass-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔒</span> Access Permissions Matrix
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {user?.permissions &&
              Object.entries(user.permissions)
                .filter(([, val]) => val)
                .map(([key]) => (
                  <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                    <Icon name="check" size={12} />
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </span>
                ))}
            {(!user?.permissions || Object.values(user.permissions).every((v) => !v)) && (
              <span style={{ color: '#64748B', fontSize: 13 }}>
                Permissions assigned automatically by system role ({user?.role}).
              </span>
            )}
          </div>
        </div>

        {/* Quick Module Shortcuts */}
        <div className="crm-glass-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚡</span> Quick Navigation Shortcuts
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => navigate('/leads')} style={{ padding: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>👤</span>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Leads Table</div><div style={{ fontSize: 11, color: '#64748B' }}>View all leads</div></div>
            </button>
            <button onClick={() => navigate('/kanban')} style={{ padding: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📊</span>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Sales Kanban</div><div style={{ fontSize: 11, color: '#64748B' }}>Deal pipeline</div></div>
            </button>
            <button onClick={() => navigate('/tickets')} style={{ padding: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎫</span>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Tech Tickets</div><div style={{ fontSize: 11, color: '#64748B' }}>Support issues</div></div>
            </button>
            <button onClick={() => navigate('/analytics')} style={{ padding: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📈</span>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Analytics</div><div style={{ fontSize: 11, color: '#64748B' }}>Reports & charts</div></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
