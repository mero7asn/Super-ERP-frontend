import { useState, useEffect } from 'react';
import API from '../services/api';
import { Icon } from '../components/Icons';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30d');

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

  const sourceBreakdown = [
    { label: 'Meta', value: Math.max(40, Number(stats?.leads?.total || 0) % 60), color: '#2563EB' },
    { label: 'Google', value: Math.max(26, Number(stats?.campaigns?.active || 0) * 8), color: '#7C3AED' },
    { label: 'Email', value: Math.max(18, Number(stats?.tickets?.total || 0) % 30), color: '#059669' },
    { label: 'WhatsApp', value: Math.max(16, Number(stats?.leads?.new || 0) % 20), color: '#F59E0B' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="crm-page-banner" style={{ padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 4 }}>
          Enterprise Intelligence
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="analytics" size={26} style={{ color: '#60A5FA' }} />
          System Performance Analytics
        </h1>
        <p style={{ fontSize: 14, color: '#CBD5E1', marginTop: 8, margin: 0, lineHeight: 1.5 }}>
          Real-time metrics, conversion rates, and module throughput across Core 360.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['7d', '30d', '90d', 'Custom'].map((item) => (
          <button key={item} onClick={() => setRange(item)} style={{ padding: '7px 12px', borderRadius: 999, border: range === item ? '1px solid #2563EB' : '1px solid #CBD5E1', background: range === item ? '#2563EB' : '#ffffff', color: range === item ? '#fff' : '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {item === 'Custom' ? 'Custom' : `Last ${item}`}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state" style={{ padding: 60 }}><div className="spinner" />Loading system analytics...</div>
      ) : stats ? (
        <>
          <div className="crm-glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📈</span> Executive KPI Overview
            </div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="crm-stat-widget">
                <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}><Icon name="target" size={20} /></div><span className="crm-trend-pill crm-trend-up">Total Leads</span></div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats.leads.total}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Gross prospects</div>
              </div>
              <div className="crm-stat-widget">
                <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#E0F2FE', color: '#0284C7' }}><Icon name="plus" size={20} /></div><span className="crm-trend-pill crm-trend-up">New Queue</span></div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats.leads.new}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Unassigned / new</div>
              </div>
              <div className="crm-stat-widget">
                <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}><Icon name="check" size={20} /></div><span className="crm-trend-pill crm-trend-up">Won Deals</span></div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{stats.leads.converted}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Converted customers</div>
              </div>
              <div className="crm-stat-widget">
                <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#FEF3C7', color: '#D97706' }}><Icon name="trending" size={20} /></div><span className="crm-trend-pill crm-trend-up">Benchmark</span></div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706' }}>{conversionRate}%</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Win conversion rate</div>
              </div>
              <div className="crm-stat-widget">
                <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#FEF2F2', color: '#DC2626' }}><Icon name="ticket" size={20} /></div><span className="crm-trend-pill crm-trend-down">Queue</span></div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#DC2626' }}>{stats.tickets.open}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Open tickets</div>
              </div>
              <div className="crm-stat-widget">
                <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#E0F2FE', color: '#0284C7' }}><Icon name="megaphone" size={20} /></div><span className="crm-trend-pill crm-trend-up">Channels</span></div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{stats.campaigns.active}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Active campaigns</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
            <div className="crm-glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 14 }}>Conversion funnel</div>
              <svg viewBox="0 0 320 220" width="100%" height="220">
                <rect x="40" y="20" width="240" height="180" rx="16" fill="#F8FAFC" stroke="#E2E8F0" />
                <path d="M80 60 L160 40 L240 60" stroke="#2563EB" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M100 110 L160 90 L220 110" stroke="#7C3AED" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M120 160 L160 140 L200 160" stroke="#059669" strokeWidth="10" fill="none" strokeLinecap="round" />
                <circle cx="160" cy="40" r="12" fill="#2563EB" />
                <circle cx="160" cy="90" r="12" fill="#7C3AED" />
                <circle cx="160" cy="140" r="12" fill="#059669" />
                <text x="160" y="45" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">1</text>
                <text x="160" y="95" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">2</text>
                <text x="160" y="145" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">3</text>
                <text x="160" y="198" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="700">Leads → Contacted → Won</text>
              </svg>
            </div>

            <div className="crm-glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 14 }}>Source breakdown</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {sourceBreakdown.map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', marginBottom: 4 }}><span>{item.label}</span><span>{item.value}%</span></div>
                    <div style={{ height: 8, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}><div style={{ width: `${item.value}%`, height: '100%', borderRadius: 999, background: item.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="crm-glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 14 }}>Performance trend</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 150 }}>
                {[44, 68, 54, 82, 72, 90].map((value, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: '100%', height: 120, borderRadius: 10, background: 'linear-gradient(180deg, #BFDBFE 0%, #2563EB 100%)', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: `${value}%`, borderRadius: 10, background: 'linear-gradient(180deg, #DBEAFE 0%, #1D4ED8 100%)' }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{['M','T','W','T','F','S'][index]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="crm-glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 14 }}>Agent leaderboard</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {(stats.teamPerformance || []).slice(0, 4).map((member, idx) => (
                  <div key={member.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, color: idx === 0 ? '#D97706' : idx === 1 ? '#64748B' : idx === 2 ? '#B45309' : '#2563EB' }}>{idx + 1}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{member.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{member.role}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 12, color: '#475569' }}>
                      <div>{member.conversionRate}</div>
                      <div style={{ fontWeight: 700, color: '#2563EB' }}>{member.performance}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AnalyticsPage;
