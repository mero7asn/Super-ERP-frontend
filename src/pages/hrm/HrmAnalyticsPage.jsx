import { useState, useEffect } from 'react';
import API from '../../services/api';
import { Icon } from '../../components/Icons';

const HrmAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchHrmAnalytics = async () => {
      setLoading(true);
      try {
        const res = await API.get('/analytics/hrm');
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load HRM analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchHrmAnalytics();
  }, [range]);

  const fmtCurrency = (val) => `$${Number(val || 0).toLocaleString()}`;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>
      {/* Top Banner */}
      <div className="crm-page-banner" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 4 }}>
            HRM Core Intelligence
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👥</span> Workforce & Talent Analytics
          </h1>
          <p style={{ fontSize: 14, color: '#CBD5E1', marginTop: 8, margin: 0, lineHeight: 1.5 }}>
            Comprehensive workforce metrics, talent pipeline velocity, training completion, and payroll analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['30d', '90d', '1y'].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: range === item ? '1px solid #2563EB' : '1px solid rgba(255,255,255,0.2)',
                background: range === item ? '#2563EB' : 'rgba(15,23,42,0.6)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Last {item}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state" style={{ padding: 60 }}><div className="spinner" />Loading HRM analytics...</div>
      ) : data ? (
        <>
          {/* Executive HR KPI Cards */}
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="crm-stat-widget">
              <div className="crm-stat-header">
                <div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  <Icon name="users" size={20} />
                </div>
                <span className="crm-trend-pill crm-trend-up">Headcount</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{data.headcount?.total || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Active company employees</div>
            </div>

            <div className="crm-stat-widget">
              <div className="crm-stat-header">
                <div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <Icon name="check" size={20} />
                </div>
                <span className="crm-trend-pill crm-trend-up">Retention</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{data.headcount?.retentionRate || '97.6%'}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Turnover rate: {data.headcount?.turnoverRate || '2.4%'}</div>
            </div>

            <div className="crm-stat-widget">
              <div className="crm-stat-header">
                <div className="crm-stat-icon-bg" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  <Icon name="talent" size={20} />
                </div>
                <span className="crm-trend-pill crm-trend-up">Hiring Speed</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706' }}>{data.recruitment?.avgTimeToHireDays || 21} days</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Avg time-to-hire</div>
            </div>

            <div className="crm-stat-widget">
              <div className="crm-stat-header">
                <div className="crm-stat-icon-bg" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                  <Icon name="payroll" size={20} />
                </div>
                <span className="crm-trend-pill crm-trend-up">Payroll Cost</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED' }}>{fmtCurrency(data.payroll?.lastPayrollExpense || 284500)}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Monthly compensation total</div>
            </div>
          </div>

          {/* Department Breakdown & Recruitment Pipeline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {/* Department Headcount Breakdown */}
            <div className="crm-glass-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏢</span> Headcount Distribution by Department
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(data.departmentBreakdown || []).map((dept) => {
                  const percent = Math.min(100, Math.round((dept.count / (data.headcount?.total || 1)) * 100));
                  return (
                    <div key={dept.department}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        <span>{dept.department}</span>
                        <span>{dept.count} members ({percent}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 999, background: '#F1F5F9', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(10, percent)}%`, height: '100%', borderRadius: 999, background: '#2563EB' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recruitment Pipeline & Talent Funnel */}
            <div className="crm-glass-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎯</span> Talent Acquisition Funnel
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '14px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>APPLICANTS</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>{data.recruitment?.totalApplicants || 142}</div>
                  <div style={{ fontSize: 11, color: '#1E3A8A' }}>Candidate pool</div>
                </div>
                <div style={{ padding: '14px', borderRadius: 12, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>IN INTERVIEWS</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#92400E', marginTop: 4 }}>{data.recruitment?.inProcess || 18}</div>
                  <div style={{ fontSize: 11, color: '#78350F' }}>Active evaluations</div>
                </div>
                <div style={{ padding: '14px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>OFFER ACCEPTED</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#065F46', marginTop: 4 }}>{data.recruitment?.hiredThisPeriod || 6}</div>
                  <div style={{ fontSize: 11, color: '#047857' }}>{data.recruitment?.offerAcceptanceRate || '92.5%'} acceptance</div>
                </div>
                <div style={{ padding: '14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>AVG TIME TO HIRE</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#334155', marginTop: 4 }}>{data.recruitment?.avgTimeToHireDays || 21}d</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>Speed to close</div>
                </div>
              </div>
            </div>
          </div>

          {/* Training & Leave Utilization */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {/* Training Performance */}
            <div className="crm-glass-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📚</span> Training & Skill Development
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: 12, background: '#F8FAFC', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Active Sessions</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{data.training?.sessionsCount || 12}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Completion Rate</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>{data.training?.completionRate || '85%'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Hours Logged</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2563EB' }}>{data.training?.totalHoursLogged || 240} hrs</div>
                </div>
              </div>
            </div>

            {/* Leave & Attendance Utilization */}
            <div className="crm-glass-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏖️</span> Leave Management & Attendance
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: 12, background: '#F8FAFC', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Total Requests</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{data.leaves?.totalRequests || 34}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Approved</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>{data.leaves?.approved || 29}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Approval Rate</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#7C3AED' }}>{data.leaves?.approvalRate || '92%'}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default HrmAnalyticsPage;
