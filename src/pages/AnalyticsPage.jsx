import { useState, useEffect } from 'react';
import API from '../services/api';
import { Icon } from '../components/Icons';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await API.get('/analytics');
        setStats(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const conversionRate = stats
    ? stats.leads.total > 0
      ? ((stats.leads.converted / stats.leads.total) * 100).toFixed(1)
      : '0.0'
    : '–';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="crm-glass-card">
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563EB', marginBottom: 4 }}>
          Enterprise Intelligence
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="analytics" size={26} style={{ color: '#2563EB' }} />
          System Performance Analytics
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, margin: 0 }}>
          Real-time metrics, conversion rates, and module throughput across Super CRM
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state" style={{ padding: 60 }}><div className="spinner" />Loading system analytics...</div>
      ) : stats ? (
        <>
          {/* Lead Analytics Section */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🎯</span> Lead Acquisition & Conversion
            </div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="crm-stat-widget">
                <div className="crm-stat-header">
                  <div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                    <Icon name="target" size={20} />
                  </div>
                  <span className="crm-trend-pill crm-trend-up">Total Leads</span>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats.leads.total}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Gross Prospects</div>
                </div>
              </div>

              <div className="crm-stat-widget">
                <div className="crm-stat-header">
                  <div className="crm-stat-icon-bg" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                    <Icon name="plus" size={20} />
                  </div>
                  <span className="crm-trend-pill crm-trend-up">New Queue</span>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats.leads.new}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Unassigned / New</div>
                </div>
              </div>

              <div className="crm-stat-widget">
                <div className="crm-stat-header">
                  <div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}>
                    <Icon name="check" size={20} />
                  </div>
                  <span className="crm-trend-pill crm-trend-up">Won Deals</span>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{stats.leads.converted}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Converted Customers</div>
                </div>
              </div>

              <div className="crm-stat-widget">
                <div className="crm-stat-header">
                  <div className="crm-stat-icon-bg" style={{ background: '#FEF3C7', color: '#D97706' }}>
                    <Icon name="trending" size={20} />
                  </div>
                  <span className="crm-trend-pill crm-trend-up">Benchmark 20%+</span>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706' }}>{conversionRate}%</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Win Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Analytics Section */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🎫</span> Support & Engineering Operations
            </div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="crm-stat-widget">
                <div className="crm-stat-header">
                  <div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                    <Icon name="ticket" size={20} />
                  </div>
                  <span className="crm-trend-pill crm-trend-up">Total Tickets</span>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats.tickets.total}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>All Submitted Tickets</div>
                </div>
              </div>

              <div className="crm-stat-widget">
                <div className="crm-stat-header">
                  <div className="crm-stat-icon-bg" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                    <Icon name="unlock" size={20} />
                  </div>
                  <span className="crm-trend-pill crm-trend-down">Pending Resolution</span>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#DC2626' }}>{stats.tickets.open}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Open Tickets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Analytics Section */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📢</span> Marketing Campaign Channels
            </div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="crm-stat-widget">
                <div className="crm-stat-header">
                  <div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                    <Icon name="megaphone" size={20} />
                  </div>
                  <span className="crm-trend-pill crm-trend-up">Total Channels</span>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats.campaigns.total}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Configured Campaigns</div>
                </div>
              </div>

              <div className="crm-stat-widget">
                <div className="crm-stat-header">
                  <div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}>
                    <Icon name="play" size={20} />
                  </div>
                  <span className="crm-trend-pill crm-trend-up">Live Broadcasting</span>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{stats.campaigns.active}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Active Campaigns</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AnalyticsPage;
