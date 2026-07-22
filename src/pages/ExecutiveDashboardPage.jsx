import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import API from '../services/api';
import { Icon } from '../components/Icons';

const C = {
  blue: '#2563EB',
  cyan: '#0284C7',
  green: '#059669',
  yellow: '#D97706',
  red: '#DC2626',
  purple: '#7C3AED',
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #CBD5E1',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {label && <div style={{ color: '#64748B', marginBottom: 4, fontWeight: 700 }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const SectionHeading = ({ children }) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: '#64748B',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: 12,
      marginTop: 20,
    }}
  >
    {children}
  </div>
);

const PIE_COLORS = [C.blue, C.cyan, C.yellow, C.purple, C.green];

const processLeadTrend = (data) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMap = {};

  data.forEach((item) => {
    const monthKey = months[item._id.month - 1];
    if (!monthMap[monthKey]) monthMap[monthKey] = { month: monthKey, Meta: 0, Google: 0, Email: 0, Other: 0, Converted: 0 };

    if (item._id.status === 'Converted') {
      monthMap[monthKey].Converted += item.count;
    } else {
      const platform = item._id.platform || 'Other';
      if (monthMap[monthKey][platform] !== undefined) {
        monthMap[monthKey][platform] += item.count;
      } else {
        monthMap[monthKey].Other += item.count;
      }
    }
  });

  return Object.values(monthMap).slice(-6);
};

const processTicketTrend = (data) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMap = {};

  data.forEach((item) => {
    const monthKey = months[item._id.month - 1];
    if (!monthMap[monthKey]) monthMap[monthKey] = { month: monthKey, Open: 0, Resolved: 0 };

    if (item._id.status === 'Open') {
      monthMap[monthKey].Open += item.count;
    } else if (item._id.status === 'Resolved') {
      monthMap[monthKey].Resolved += item.count;
    }
  });

  return Object.values(monthMap).slice(-6);
};

const processRoleDistribution = (data) => {
  const roleMap = {
    'Sales Agent': 'Sales',
    'Sales Manager': 'Sales',
    'Customer Support Agent': 'Support',
    'Customer Support Manager': 'Support',
    'Marketing Specialist': 'Marketing',
    'Marketing Manager': 'Marketing',
    'Business Analyst': 'Analyst',
    'CRM Consultant': 'Consultant',
    'CRM Developer': 'Developer',
    'System Architect': 'Admin',
    'Super CRM Administrator': 'Admin',
    'Executive User': 'Executive',
  };

  const grouped = {};
  data.forEach((item) => {
    const category = roleMap[item._id] || 'Other';
    grouped[category] = (grouped[category] || 0) + item.count;
  });

  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
};

const ExecutiveDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/analytics')
      .then(({ data }) => setStats(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const leadTrend = stats?.leadsByPlatform ? processLeadTrend(stats.leadsByPlatform) : [];
  const ticketTrend = stats?.ticketsByMonth ? processTicketTrend(stats.ticketsByMonth) : [];
  const roleData = stats?.roleDistribution ? processRoleDistribution(stats.roleDistribution) : [];

  const convRate = stats && stats.leads.total > 0
    ? ((stats.leads.converted / stats.leads.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="crm-page-banner">
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 4 }}>
          Executive Suite & Strategic KPI Control
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="executive" size={26} style={{ color: '#60A5FA' }} />
          Executive Overview Dashboard
        </h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 6, margin: 0 }}>
          Enterprise wide KPIs, lead platform trends, support resolution velocity, and team performance
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state" style={{ padding: 60 }}><div className="spinner" />Loading executive briefing...</div>
      ) : (
        <>
          {/* KPI Stat Widgets */}
          <SectionHeading>Key Performance Indicators</SectionHeading>
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="crm-stat-widget">
              <div className="crm-stat-header">
                <div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}><Icon name="target" size={20} /></div>
                <span className="crm-trend-pill crm-trend-up">Pipeline Total</span>
              </div>
              <div><div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats?.leads.total ?? '–'}</div><div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Gross Leads</div></div>
            </div>

            <div className="crm-stat-widget">
              <div className="crm-stat-header">
                <div className="crm-stat-icon-bg" style={{ background: '#E0F2FE', color: '#0284C7' }}><Icon name="plus" size={20} /></div>
                <span className="crm-trend-pill crm-trend-up">Inflow</span>
              </div>
              <div><div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats?.leads.new ?? '–'}</div><div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>New Prospects</div></div>
            </div>

            <div className="crm-stat-widget">
              <div className="crm-stat-header">
                <div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}><Icon name="check" size={20} /></div>
                <span className="crm-trend-pill crm-trend-up">Won Deals</span>
              </div>
              <div><div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{stats?.leads.converted ?? '–'}</div><div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Converted Customers</div></div>
            </div>

            <div className="crm-stat-widget">
              <div className="crm-stat-header">
                <div className="crm-stat-icon-bg" style={{ background: '#FEF3C7', color: '#D97706' }}><Icon name="trending" size={20} /></div>
                <span className="crm-trend-pill crm-trend-up">Target 20%</span>
              </div>
              <div><div style={{ fontSize: 28, fontWeight: 800, color: '#D97706' }}>{convRate}%</div><div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Conversion Rate</div></div>
            </div>
          </div>

          {/* Lead Platform Trend Area Chart */}
          <SectionHeading>Lead Pipeline — Marketing Platforms Performance</SectionHeading>
          <div className="crm-glass-card" style={{ padding: 20 }}>
            {leadTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={leadTrend} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gMeta" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.25} /><stop offset="95%" stopColor={C.blue} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gGoogle" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.cyan} stopOpacity={0.25} /><stop offset="95%" stopColor={C.cyan} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.25} /><stop offset="95%" stopColor={C.green} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                  <Area type="monotone" dataKey="Meta" stroke={C.blue} fill="url(#gMeta)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Google" stroke={C.cyan} fill="url(#gGoogle)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Converted" stroke={C.green} fill="url(#gConv)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No platform lead data available</div>
            )}
          </div>

          {/* Ticket Bar & Role Pie Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div className="crm-glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="ticket" size={18} style={{ color: '#2563EB' }} />
                Support Resolution Trend
              </h3>
              {ticketTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ticketTrend} margin={{ top: 0, right: 8, left: -20, bottom: 0 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#475569' }} />
                    <Bar dataKey="Open" fill={C.red} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Resolved" fill={C.green} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No ticket data available</div>
              )}
            </div>

            <div className="crm-glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="users" size={18} style={{ color: '#2563EB' }} />
                Team Role Distribution
              </h3>
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {roleData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend formatter={(val) => <span style={{ fontSize: 12, color: '#475569' }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No team data available</div>
              )}
            </div>
          </div>

          {/* Team Performance Table */}
          <SectionHeading>Team Performance Snapshot</SectionHeading>
          <div className="crm-table-wrapper">
            {stats?.teamPerformance && stats.teamPerformance.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Team Member</th>
                    <th>Role</th>
                    <th>Leads Handled</th>
                    <th>Tickets Resolved</th>
                    <th>Conversion Rate</th>
                    <th>Performance Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.teamPerformance.map((m) => (
                    <tr key={m.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="crm-avatar-chip">
                            {m.name.split(' ').map((w) => w[0]).join('')}
                          </div>
                          <strong style={{ fontSize: 13, color: '#0F172A' }}>{m.name}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#64748B' }}>{m.role}</td>
                      <td style={{ fontWeight: 700, color: '#1E293B' }}>{m.leads || '—'}</td>
                      <td style={{ fontWeight: 700, color: '#1E293B' }}>{m.tickets || '—'}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>{m.conversionRate}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${m.performance}%`,
                                height: '100%',
                                borderRadius: 3,
                                background: m.performance >= 90 ? C.green : m.performance >= 75 ? C.yellow : C.red,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', minWidth: 32 }}>
                            {m.performance}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No team performance data available</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExecutiveDashboardPage;
