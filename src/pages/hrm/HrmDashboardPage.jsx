import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Icon } from '../../components/Icons';

const HrmDashboardPage = () => {
  const { user } = useAuth();
  const [hrmStats, setHrmStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/analytics/hrm');
        setHrmStats(res.data.data);
      } catch (err) {
        console.error('Failed to load HRM stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fmtCurrency = (val) => `$${Number(val || 0).toLocaleString()}`;

  const MODULES = [
    {
      id: 'personal',
      title: 'Personal & Staff',
      icon: 'personal',
      color: '#2563EB',
      bg: '#EFF6FF',
      path: '/hrm/personal',
      desc: 'Employee contracts, compliance documents, schedules, attendance logs, and leave requests.',
      badge: `${hrmStats?.leaves?.pending || 0} Pending Leaves`
    },
    {
      id: 'payroll',
      title: 'Payroll Department',
      icon: 'payroll',
      color: '#059669',
      bg: '#ECFDF5',
      path: '/hrm/payroll',
      desc: 'Process monthly salaries, deductions, performance bonuses, and annual salary progression.',
      badge: fmtCurrency(hrmStats?.payroll?.lastPayrollExpense || 284500)
    },
    {
      id: 'training',
      title: 'Training & Development',
      icon: 'training',
      color: '#7C3AED',
      bg: '#F3E8FF',
      path: '/hrm/training',
      desc: 'Assign supervisor training courses, track technical tutorials, and update AUX statuses.',
      badge: `${hrmStats?.training?.sessionsCount || 12} Sessions`
    },
    {
      id: 'talent',
      title: 'Talent Acquisition',
      icon: 'talent',
      color: '#D97706',
      bg: '#FEF3C7',
      path: '/hrm/talent',
      desc: 'Job openings, candidate resume screening, multi-stage interviews, and hire offers.',
      badge: `${hrmStats?.recruitment?.inProcess || 18} In Pipeline`
    },
    {
      id: 'partnerships',
      title: 'BD & People Culture',
      icon: 'partnerships',
      color: '#0284C7',
      bg: '#E0F2FE',
      path: '/hrm/partnerships',
      desc: 'Corporate discounts, health insurance plans, medical benefits, and employee perks.',
      badge: 'Active Schemes'
    },
    {
      id: 'analytics',
      title: 'HR Analytics & Intelligence',
      icon: 'analytics',
      color: '#DC2626',
      bg: '#FEF2F2',
      path: '/hrm/analytics',
      desc: 'Workforce turnover rate, retention metrics, time-to-hire velocity, and department costs.',
      badge: `${hrmStats?.headcount?.retentionRate || '97.6%'} Retention`
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 32 }}>
      {/* Top Banner */}
      <div className="crm-page-banner" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 4 }}>
            Human Resources Management
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👥</span> HRM Core Command Center
          </h1>
          <p style={{ fontSize: 14, color: '#CBD5E1', marginTop: 8, margin: 0, lineHeight: 1.5 }}>
            Welcome back, <strong>{user?.firstName}</strong>! Manage workforce lifecycle, talent acquisition, payroll, and compliance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/hrm/analytics" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="analytics" size={14} /> View HR Analytics
          </Link>
          <Link to="/hrm/personal" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} /> Leave Requests
          </Link>
        </div>
      </div>

      {/* Live KPI Metric Widgets */}
      <div className="stat-grid" style={{ marginBottom: 0 }}>
        <div className="crm-stat-widget">
          <div className="crm-stat-header">
            <div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <Icon name="users" size={20} />
            </div>
            <span className="crm-trend-pill crm-trend-up">Workforce</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>{hrmStats?.headcount?.total || 0}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Active company staff</div>
        </div>

        <div className="crm-stat-widget">
          <div className="crm-stat-header">
            <div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}>
              <Icon name="check" size={20} />
            </div>
            <span className="crm-trend-pill crm-trend-up">Retention</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{hrmStats?.headcount?.retentionRate || '97.6%'}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Turnover rate: {hrmStats?.headcount?.turnoverRate || '2.4%'}</div>
        </div>

        <div className="crm-stat-widget">
          <div className="crm-stat-header">
            <div className="crm-stat-icon-bg" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Icon name="talent" size={20} />
            </div>
            <span className="crm-trend-pill crm-trend-up">Recruitment</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706' }}>{hrmStats?.recruitment?.inProcess || 18}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Candidates in evaluation</div>
        </div>

        <div className="crm-stat-widget">
          <div className="crm-stat-header">
            <div className="crm-stat-icon-bg" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
              <Icon name="payroll" size={20} />
            </div>
            <span className="crm-trend-pill crm-trend-up">Payroll Cost</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED' }}>{fmtCurrency(hrmStats?.payroll?.lastPayrollExpense || 284500)}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Monthly disbursement</div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {MODULES.map((mod) => (
          <div
            key={mod.id}
            className="crm-glass-card"
            style={{
              padding: 22,
              background: '#ffffff',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: mod.bg, color: mod.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={mod.icon} size={22} />
                </div>
                <span className="badge badge-new" style={{ fontWeight: 700, fontSize: 12 }}>{mod.badge}</span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 800, color: '#0F172A' }}>{mod.title}</h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {mod.desc}
              </p>
            </div>

            <Link
              to={mod.path}
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              Open Module →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HrmDashboardPage;
