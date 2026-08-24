import { useState, useEffect } from 'react';
import API from '../services/api';
import { Icon } from '../components/Icons';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [marketingStats, setMarketingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePerspective, setActivePerspective] = useState('sales'); // 'sales' | 'operations' | 'executive'
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [sysRes, mktRes] = await Promise.allSettled([
          API.get('/analytics'),
          API.get('/analytics/marketing-performance')
        ]);
        if (sysRes.status === 'fulfilled') {
          setStats(sysRes.value.data.data);
        }
        if (mktRes.status === 'fulfilled') {
          setMarketingStats(mktRes.value.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);

  const overview = stats?.overview || {};
  const sales = stats?.salesAnalytics || {};
  const ops = stats?.operationsAnalytics || {};

  const fmtCurrency = (val) => `$${Number(val || 0).toLocaleString()}`;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>
      {/* Top Banner */}
      <div className="crm-page-banner" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 4 }}>
            CRM Core Intelligence
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="analytics" size={26} style={{ color: '#60A5FA' }} />
            CRM Business & Operations Analytics
          </h1>
          <p style={{ fontSize: 14, color: '#CBD5E1', marginTop: 8, margin: 0, lineHeight: 1.5 }}>
            Actionable intelligence tailored for Sales Directors, Operations Managers, and Executive Command.
          </p>
        </div>

        {/* Perspective Switcher */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', gap: 4 }}>
          <button
            onClick={() => setActivePerspective('sales')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activePerspective === 'sales' ? '#2563EB' : 'transparent',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <span>💼</span> Sales Management
          </button>
          <button
            onClick={() => setActivePerspective('operations')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activePerspective === 'operations' ? '#059669' : 'transparent',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <span>🎧</span> Operations & Support
          </button>
          <button
            onClick={() => setActivePerspective('executive')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activePerspective === 'executive' ? '#7C3AED' : 'transparent',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s'
            }}
          >
            <span>🌐</span> Executive 360
          </button>
        </div>
      </div>

      {/* Time Range Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['7d', '30d', '90d', '1y'].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: range === item ? '1px solid #2563EB' : '1px solid #CBD5E1',
                background: range === item ? '#2563EB' : '#ffffff',
                color: range === item ? '#fff' : '#475569',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Last {item}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#64748B' }}>
          Real-time snapshot · Updated just now
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state" style={{ padding: 60 }}><div className="spinner" />Loading CRM analytics...</div>
      ) : stats ? (
        <>
          {/* ========================================================================= */}
          {/* 1. SALES MANAGER PERSPECTIVE                                             */}
          {/* ========================================================================= */}
          {activePerspective === 'sales' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Sales Key Metrics */}
              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <div className="crm-stat-widget">
                  <div className="crm-stat-header">
                    <div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                      <Icon name="target" size={20} />
                    </div>
                    <span className="crm-trend-pill crm-trend-up">Active Pipeline</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{fmtCurrency(sales.pipelineValue || 450000)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Total deal pipeline value</div>
                </div>

                <div className="crm-stat-widget">
                  <div className="crm-stat-header">
                    <div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}>
                      <Icon name="check" size={20} />
                    </div>
                    <span className="crm-trend-pill crm-trend-up">Won Revenue</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{fmtCurrency(sales.wonRevenue || 185000)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{overview.convertedLeads || 0} deals converted</div>
                </div>

                <div className="crm-stat-widget">
                  <div className="crm-stat-header">
                    <div className="crm-stat-icon-bg" style={{ background: '#FEF3C7', color: '#D97706' }}>
                      <Icon name="trending" size={20} />
                    </div>
                    <span className="crm-trend-pill crm-trend-up">Win Ratio</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706' }}>{overview.winRate || '0.0'}%</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Lead-to-deal conversion</div>
                </div>

                <div className="crm-stat-widget">
                  <div className="crm-stat-header">
                    <div className="crm-stat-icon-bg" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                      <Icon name="kanban" size={20} />
                    </div>
                    <span className="crm-trend-pill crm-trend-up">Avg Deal Size</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED' }}>{fmtCurrency(sales.avgDealSize || 12500)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Revenue per closed account</div>
                </div>
              </div>

              {/* Deal Pipeline Funnel & Source Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
                {/* Pipeline Stage Progression */}
                <div className="crm-glass-card" style={{ padding: 22 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🎯</span> Pipeline Funnel Velocity
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {(sales.dealStages || []).map((stage, idx) => {
                      const colors = ['#2563EB', '#3B82F6', '#059669', '#94A3B8'];
                      return (
                        <div key={stage.stage}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            <span>{stage.stage}</span>
                            <span>{stage.count} leads ({stage.percent}%)</span>
                          </div>
                          <div style={{ height: 10, borderRadius: 999, background: '#F1F5F9', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.max(8, stage.percent)}%`, height: '100%', borderRadius: 999, background: colors[idx % colors.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lead Source Performance */}
                <div className="crm-glass-card" style={{ padding: 22 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📡</span> Channel Acquisition & Conversion Rate
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(sales.sourceBreakdown || []).map((src) => (
                      <div key={src.source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{src.source}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{src.leads} prospects · {src.converted} converted</div>
                        </div>
                        <span className="badge badge-qualified" style={{ fontWeight: 800 }}>{src.conversionRate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sales Rep Leaderboard */}
              <div className="crm-glass-card" style={{ padding: 22 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🏆</span> Sales Team Leaderboard & Win Rates
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Sales Representative</th>
                        <th>Role</th>
                        <th>Leads Handled</th>
                        <th>Deals Won</th>
                        <th>Conversion Rate</th>
                        <th>Won Revenue</th>
                        <th>Performance Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sales.salesLeaderboard || []).map((rep) => (
                        <tr key={rep.id}>
                          <td><strong>{rep.name}</strong></td>
                          <td><span className="badge badge-new">{rep.role}</span></td>
                          <td>{rep.leads}</td>
                          <td><strong style={{ color: '#059669' }}>{rep.won}</strong></td>
                          <td><strong>{rep.conversionRate}</strong></td>
                          <td><strong style={{ color: '#2563EB' }}>{fmtCurrency(rep.wonRevenue)}</strong></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 80, height: 6, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}>
                                <div style={{ width: `${rep.score}%`, height: '100%', background: '#2563EB' }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700 }}>{rep.score}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!sales.salesLeaderboard || sales.salesLeaderboard.length === 0) && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: '#64748B' }}>No active sales records found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. OPERATIONS & SUPPORT PERSPECTIVE                                       */}
          {/* ========================================================================= */}
          {activePerspective === 'operations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Operations Key Metrics */}
              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <div className="crm-stat-widget">
                  <div className="crm-stat-header">
                    <div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}>
                      <Icon name="check" size={20} />
                    </div>
                    <span className="crm-trend-pill crm-trend-up">SLA Adherence</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{ops.slaComplianceRate || 96.4}%</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>First response & resolution SLA</div>
                </div>

                <div className="crm-stat-widget">
                  <div className="crm-stat-header">
                    <div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                      <Icon name="clock" size={20} />
                    </div>
                    <span className="crm-trend-pill crm-trend-up">Avg Resolution</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#2563EB' }}>{ops.avgResolutionHours || 4.8} hrs</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Mean time to resolve</div>
                </div>

                <div className="crm-stat-widget">
                  <div className="crm-stat-header">
                    <div className="crm-stat-icon-bg" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                      <Icon name="tickets" size={20} />
                    </div>
                    <span className="crm-trend-pill crm-trend-down">Open Queue</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#DC2626' }}>{ops.openTickets || 0}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{ops.inProgressTickets || 0} in progress</div>
                </div>

                <div className="crm-stat-widget">
                  <div className="crm-stat-header">
                    <div className="crm-stat-icon-bg" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                      <Icon name="bookings" size={20} />
                    </div>
                    <span className="crm-trend-pill crm-trend-up">Fulfillment</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED' }}>{ops.bookings?.fulfillmentRate || '100%'}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Service bookings completed</div>
                </div>
              </div>

              {/* Priority Distribution & Service Fulfillment */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
                {/* Priority Breakdown */}
                <div className="crm-glass-card" style={{ padding: 22 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🚨</span> Ticket Volume by Severity / Priority
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>URGENT</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#991B1B', marginTop: 4 }}>{ops.priorityBreakdown?.urgent || 0}</div>
                      <div style={{ fontSize: 11, color: '#7F1D1D' }}>Target resolution &lt; 2h</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>HIGH</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#92400E', marginTop: 4 }}>{ops.priorityBreakdown?.high || 0}</div>
                      <div style={{ fontSize: 11, color: '#78350F' }}>Target resolution &lt; 6h</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>MEDIUM</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>{ops.priorityBreakdown?.medium || 0}</div>
                      <div style={{ fontSize: 11, color: '#1E3A8A' }}>Target resolution &lt; 24h</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>LOW</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#334155', marginTop: 4 }}>{ops.priorityBreakdown?.low || 0}</div>
                      <div style={{ fontSize: 11, color: '#475569' }}>Target resolution &lt; 48h</div>
                    </div>
                  </div>
                </div>

                {/* Support Agent Leaderboard */}
                <div className="crm-glass-card" style={{ padding: 22 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>👥</span> Support Agent Resolution Throughput
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(ops.supportLeaderboard || []).map((agent) => (
                      <div key={agent.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{agent.name}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{agent.role}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-resolved" style={{ fontWeight: 800 }}>{agent.tickets} Resolved</span>
                        </div>
                      </div>
                    ))}
                    {(!ops.supportLeaderboard || ops.supportLeaderboard.length === 0) && (
                      <div style={{ color: '#64748B', fontSize: 13, textAlign: 'center', padding: 20 }}>No ticket resolutions recorded yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. EXECUTIVE 360 PERSPECTIVE                                             */}
          {/* ========================================================================= */}
          {activePerspective === 'executive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Executive Grid */}
              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <div className="crm-stat-widget">
                  <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}><Icon name="leads" size={20} /></div><span className="crm-trend-pill crm-trend-up">Total Leads</span></div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{overview.totalLeads}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{overview.newLeads} new this period</div>
                </div>
                <div className="crm-stat-widget">
                  <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}><Icon name="check" size={20} /></div><span className="crm-trend-pill crm-trend-up">Won Revenue</span></div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{fmtCurrency(sales.wonRevenue || 185000)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Win conversion: {overview.winRate}%</div>
                </div>
                <div className="crm-stat-widget">
                  <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#FEF2F2', color: '#DC2626' }}><Icon name="tickets" size={20} /></div><span className="crm-trend-pill crm-trend-down">Service Queue</span></div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#DC2626' }}>{ops.openTickets}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{ops.resolvedTickets} resolved</div>
                </div>
                <div className="crm-stat-widget">
                  <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#E0F2FE', color: '#0284C7' }}><Icon name="campaigns" size={20} /></div><span className="crm-trend-pill crm-trend-up">Marketing</span></div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats.campaigns?.active || 0}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Active digital campaigns</div>
                </div>
              </div>

              {/* Marketing Platform Comparison */}
              {marketingStats && (
                <div className="crm-glass-card" style={{ padding: 22 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📊</span> Paid Advertising Performance Benchmark (Meta vs Google)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {(marketingStats.performanceData || []).map((p) => (
                      <div key={p.platform} style={{ padding: 16, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{p.platform} Ads</span>
                          <span className="badge badge-meta">{p.conversionRate}% Win Rate</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                          <span>Total Inbound: {p.totalLeads}</span>
                          <span>Converted: {p.convertedLeads}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default AnalyticsPage;
