import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ==========================================
// ICON COMPONENT
// ==========================================
const Icon = ({ name, size = 16, style = {} }) => {
  const p = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style,
  };

  switch (name) {
    case 'overview':
      return <svg {...p}><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>;
    case 'requisitions':
      return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case 'jobs':
      return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
    case 'candidates':
      return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'interviews':
      return <svg {...p}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/></svg>;
    case 'distribution':
      return <svg {...p}><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>;
    case 'reports':
      return <svg {...p}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
    case 'activity':
      return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case 'user':
      return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'lock':
      return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case 'file':
      return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'briefcase':
      return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
    default:
      return null;
  }
};

// ==========================================
// STATUS COLORS & BADGES
// ==========================================
const STATUS_COLORS = {
  // Requisition statuses
  Draft: { bg: 'rgba(148,163,184,0.15)', text: '#94A3B8' },
  Submitted: { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  'Pending Approval': { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  Approved: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  Rejected: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
  'Converted to Job': { bg: 'rgba(99,102,241,0.12)', text: '#6366F1' },
  Cancelled: { bg: 'rgba(100,116,139,0.12)', text: '#64748B' },
  // Job statuses
  Open: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  'On Hold': { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  Closed: { bg: 'rgba(100,116,139,0.12)', text: '#64748B' },
  Filled: { bg: 'rgba(99,102,241,0.12)', text: '#6366F1' },
  // Candidate statuses
  Applied: { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  Screening: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  Shortlisted: { bg: 'rgba(99,102,241,0.12)', text: '#6366F1' },
  Interview: { bg: 'rgba(139,92,246,0.12)', text: '#8B5CF6' },
  Assessment: { bg: 'rgba(236,72,153,0.12)', text: '#EC4899' },
  Offer: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  Hired: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  Withdrawn: { bg: 'rgba(100,116,139,0.12)', text: '#64748B' },
  // Interview statuses
  Scheduled: { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  'In Progress': { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  Completed: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  // Publication statuses
  'Not Published': { bg: 'rgba(148,163,184,0.15)', text: '#94A3B8' },
  Publishing: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  Published: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
  Expired: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
  Failed: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  // Priority
  Low: { bg: 'rgba(148,163,184,0.12)', text: '#94A3B8' },
  Medium: { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6' },
  High: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  Urgent: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
};

const Badge = ({ status }) => {
  const colors = STATUS_COLORS[status] || { bg: 'rgba(148,163,184,0.15)', text: '#94A3B8' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 12,
      fontSize: 11, fontWeight: 600,
      background: colors.bg, color: colors.text,
    }}>{status}</span>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const TalentAcquisitionPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const isTA = ['Recruitment Specialist (Talent Acquisition)', 'HRM System Administrator', 'HR Manager', 'CRM core Administrator', 'Super Admin', 'Super CRM Administrator'].includes(user?.role);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'requisitions', label: 'Job Requisitions', icon: 'requisitions' },
    { id: 'jobs', label: 'Jobs', icon: 'jobs' },
    { id: 'candidates', label: 'Candidates', icon: 'candidates' },
    { id: 'interviews', label: 'Interviews', icon: 'interviews' },
    { id: 'distribution', label: 'Distribution', icon: 'distribution' },
    { id: 'reports', label: 'Reports', icon: 'reports' },
  ];

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let result;
      switch (tab) {
        case 'overview':
          result = await API.get('/talent/overview');
          setData(prev => ({ ...prev, overview: result.data.data }));
          break;
        case 'requisitions':
          result = await API.get('/talent/requisitions');
          setData(prev => ({ ...prev, requisitions: result.data.data }));
          break;
        case 'jobs':
          result = await API.get('/talent/jobs');
          setData(prev => ({ ...prev, jobs: result.data.data }));
          break;
        case 'candidates':
          result = await API.get('/talent/candidates');
          setData(prev => ({ ...prev, candidates: result.data.data }));
          break;
        case 'interviews':
          result = await API.get('/talent/interviews');
          setData(prev => ({ ...prev, interviews: result.data.data }));
          break;
        case 'distribution':
          result = await API.get('/talent/publications');
          setData(prev => ({ ...prev, publications: result.data.data }));
          break;
        case 'reports':
          const [funnel, activity] = await Promise.all([
            API.get('/talent/funnel'),
            API.get('/talent/activity')
          ]);
          setData(prev => ({ ...prev, funnel: funnel.data.data, activity: activity.data.data }));
          break;
      }
    } catch (err) {
      console.error('Failed to fetch TA data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTA) fetchData(activeTab);
  }, [activeTab, isTA]);

  if (!isTA) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
        <Icon name="lock" size={32} style={{ color: 'var(--text-muted)' }} />
        <span style={{ color: 'var(--text-muted)' }}>Access restricted to Talent Acquisition team.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Talent Acquisition</h1>
          <p className="page-subtitle">Manage hiring requests, vacancies, candidates, interviews, and recruitment performance from one workspace.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('requisitions')}>+ New Requisition</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('jobs')}>+ Create Job</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="loading-state"><div className="spinner" /> Loading...</div>
      ) : (
        <>
          {activeTab === 'overview' && <OverviewTab data={data.overview} onNavigate={setActiveTab} />}
          {activeTab === 'requisitions' && <RequisitionsTab data={data.requisitions} onRefresh={() => fetchData('requisitions')} />}
          {activeTab === 'jobs' && <JobsTab data={data.jobs} onRefresh={() => fetchData('jobs')} />}
          {activeTab === 'candidates' && <CandidatesTab data={data.candidates} onRefresh={() => fetchData('candidates')} />}
          {activeTab === 'interviews' && <InterviewsTab data={data.interviews} onRefresh={() => fetchData('interviews')} />}
          {activeTab === 'distribution' && <DistributionTab data={data.publications} onRefresh={() => fetchData('distribution')} />}
          {activeTab === 'reports' && <ReportsTab data={data} />}
        </>
      )}
    </div>
  );
};

// ==========================================
// OVERVIEW TAB
// ==========================================
const OverviewTab = ({ data, onNavigate }) => {
  if (!data) return null;

  const kpis = [
    { label: 'Open Positions', value: data.openPositions || 0, color: '#3B82F6', onClick: () => onNavigate('jobs') },
    { label: 'Candidates', value: data.totalCandidates || 0, color: '#8B5CF6', onClick: () => onNavigate('candidates') },
    { label: 'Interviews This Week', value: data.interviewsThisWeek || 0, color: '#F59E0B', onClick: () => onNavigate('interviews') },
    { label: 'Active Offers', value: data.activeOffers || 0, color: '#EC4899', onClick: () => onNavigate('candidates') },
    { label: 'Hired This Month', value: data.hiredThisMonth || 0, color: '#10B981', onClick: () => onNavigate('candidates') },
    { label: 'Avg. Time to Hire', value: `${data.avgTimeToHireDays || 0}d`, color: '#6366F1', onClick: () => onNavigate('reports') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            onClick={kpi.onClick}
            className="card"
            style={{ cursor: 'pointer', padding: '16px 18px', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Recent Activity</h3>
        {!data.recentActivity?.length ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
            <Icon name="activity" size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>No recent activity</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.recentActivity.slice(0, 8).map((activity, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: idx < data.recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                  {activity.entityType === 'Job' ? <Icon name="jobs" size={14} /> : activity.entityType === 'Candidate' ? <Icon name="user" size={14} /> : <Icon name="file" size={14} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{activity.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {activity.performedBy?.firstName} {activity.performedBy?.lastName} · {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// REQUISITIONS TAB
// ==========================================
const RequisitionsTab = ({ data = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    department: '', positionTitle: '', numberOfEmployees: 1, employmentType: 'Full Time',
    location: '', priority: 'Medium', reasonForHiring: 'New Position', notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/talent/requisitions', form);
      setShowForm(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create requisition');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/talent/requisitions/${id}/status`, { status });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Job Requisitions ({data.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Requisition'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Position Title</label>
              <input className="form-input" value={form.positionTitle} onChange={e => setForm({ ...form, positionTitle: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Department</label>
              <input className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Number of Employees</label>
              <input type="number" className="form-input" value={form.numberOfEmployees} onChange={e => setForm({ ...form, numberOfEmployees: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Employment Type</label>
              <select className="form-input" value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })}>
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Contract</option>
                <option>Temporary</option>
                <option>Internship</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Reason for Hiring</label>
              <select className="form-input" value={form.reasonForHiring} onChange={e => setForm({ ...form, reasonForHiring: e.target.value })}>
                <option>New Position</option>
                <option>Replacement</option>
                <option>Expansion</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">Submit Requisition</button>
            </div>
          </form>
        </div>
      )}

      {!data.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="requisitions" size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} />
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No job requisitions</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create a job requisition to start the hiring process.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Position</th>
                <th>Department</th>
                <th>Requested By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(req => (
                <tr key={req._id}>
                  <td><strong>{req.requisitionId}</strong></td>
                  <td>{req.positionTitle}</td>
                  <td>{req.department}</td>
                  <td>{req.requestedBy?.firstName} {req.requestedBy?.lastName}</td>
                  <td><Badge status={req.priority} /></td>
                  <td><Badge status={req.approvalStatus} /></td>
                  <td>
                    {req.approvalStatus === 'Pending Approval' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(req._id, 'Approved')}>Approve</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(req._id, 'Rejected')}>Reject</button>
                      </div>
                    )}
                    {req.approvalStatus === 'Approved' && (
                      <button className="btn btn-sm btn-primary" onClick={async () => {
                        try {
                          await API.post(`/talent/requisitions/${req._id}/convert`);
                          onRefresh();
                        } catch (err) {
                          alert('Failed to convert');
                        }
                      }}>Create Job</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==========================================
// JOBS TAB
// ==========================================
const JobsTab = ({ data = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', department: '', location: '', employmentType: 'Full Time', numberOfPositions: 1, priority: 'Medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/talent/jobs', form);
      setShowForm(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create job');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Jobs ({data.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Job'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Job Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Department</label>
              <input className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Employment Type</label>
              <select className="form-input" value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })}>
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Contract</option>
                <option>Temporary</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Positions</label>
              <input type="number" className="form-input" value={form.numberOfPositions} onChange={e => setForm({ ...form, numberOfPositions: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">Create Job</button>
            </div>
          </form>
        </div>
      )}

      {!data.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="jobs" size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} />
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No active vacancies</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create a job or convert an approved requisition to start hiring.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Title</th>
                <th>Department</th>
                <th>Positions</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(job => (
                <tr key={job._id}>
                  <td><strong>{job.jobId}</strong></td>
                  <td>{job.title}</td>
                  <td>{job.department}</td>
                  <td>{job.numberOfPositions}</td>
                  <td><Badge status={job.priority} /></td>
                  <td><Badge status={job.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {job.status === 'Draft' && (
                        <button className="btn btn-sm btn-primary" onClick={async () => {
                          await API.put(`/talent/jobs/${job._id}/status`, { status: 'Open' });
                          onRefresh();
                        }}>Publish</button>
                      )}
                      {job.status === 'Open' && (
                        <button className="btn btn-sm btn-secondary" onClick={async () => {
                          await API.put(`/talent/jobs/${job._id}/status`, { status: 'On Hold' });
                          onRefresh();
                        }}>Pause</button>
                      )}
                      {job.status === 'On Hold' && (
                        <button className="btn btn-sm btn-primary" onClick={async () => {
                          await API.put(`/talent/jobs/${job._id}/status`, { status: 'Open' });
                          onRefresh();
                        }}>Resume</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==========================================
// CANDIDATES TAB
// ==========================================
const CandidatesTab = ({ data = [], onRefresh }) => {
  const [view, setView] = useState('kanban');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', job: '', source: 'Manual' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/talent/candidates', form);
      setShowForm(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add candidate');
    }
  };

  const stages = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Assessment', 'Offer', 'Hired', 'Rejected'];

  const candidatesByStage = useMemo(() => {
    const grouped = {};
    stages.forEach(stage => { grouped[stage] = []; });
    data.forEach(c => {
      if (c.applications) {
        c.applications.forEach(app => {
          if (grouped[app.status]) {
            grouped[app.status].push({ ...c, application: app });
          }
        });
      }
    });
    return grouped;
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Candidates ({data.length})</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}>Kanban</button>
            <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>Table</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Candidate'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Source</label>
              <select className="form-input" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                <option>Manual</option>
                <option>LinkedIn</option>
                <option>Indeed</option>
                <option>Wuzzuf</option>
                <option>Referral</option>
                <option>Internal</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">Add Candidate</button>
            </div>
          </form>
        </div>
      )}

      {view === 'kanban' ? (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
          {stages.map(stage => (
            <div key={stage} style={{ minWidth: 200, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{stage}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{candidatesByStage[stage]?.length || 0}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
                {candidatesByStage[stage]?.map((c, idx) => (
                  <div key={idx} className="card" style={{ padding: 10, cursor: 'pointer' }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.application?.job?.title || 'No job'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Job</th>
                <th>Stage</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {data.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.fullName}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.applications?.[0]?.job?.title || '-'}</td>
                  <td><Badge status={c.applications?.[0]?.status || 'Applied'} /></td>
                  <td>{c.applications?.[0]?.source || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==========================================
// INTERVIEWS TAB
// ==========================================
const InterviewsTab = ({ data = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    application: '', interviewer: '', interviewType: 'HR Interview',
    scheduledDate: '', scheduledTime: '', duration: 60, location: '', meetingLink: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/talent/interviews', form);
      setShowForm(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Interviews ({data.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Schedule Interview'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Interview Type</label>
              <select className="form-input" value={form.interviewType} onChange={e => setForm({ ...form, interviewType: e.target.value })}>
                <option>Phone Screening</option>
                <option>HR Interview</option>
                <option>Technical Interview</option>
                <option>Manager Interview</option>
                <option>Final Interview</option>
                <option>Panel Interview</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Duration (minutes)</label>
              <input type="number" className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Time</label>
              <input type="time" className="form-input" value={form.scheduledTime} onChange={e => setForm({ ...form, scheduledTime: e.target.value })} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Room name or address" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Meeting Link</label>
              <input className="form-input" value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} placeholder="Zoom/Teams URL" />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">Schedule Interview</button>
            </div>
          </form>
        </div>
      )}

      {!data.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="interviews" size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} />
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No interviews scheduled</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Schedule interviews with candidates to evaluate them.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Interviewer</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {data.map(interview => (
                <tr key={interview._id}>
                  <td><strong>{interview.candidate?.fullName}</strong></td>
                  <td>{interview.job?.title}</td>
                  <td>{interview.interviewer?.firstName} {interview.interviewer?.lastName}</td>
                  <td>{new Date(interview.scheduledDate).toLocaleDateString()} {interview.scheduledTime}</td>
                  <td>{interview.interviewType}</td>
                  <td><Badge status={interview.status} /></td>
                  <td><Badge status={interview.feedbackStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==========================================
// DISTRIBUTION TAB
// ==========================================
const DistributionTab = ({ data = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    job: '', platform: 'Company Careers Page', externalUrl: '', publicJobLink: ''
  });

  const platforms = ['Company Careers Page', 'LinkedIn', 'Indeed', 'Wuzzuf', 'Forasna', 'Social Media', 'Manual', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/talent/publications', { ...form, status: 'Published', publishedDate: new Date() });
      setShowForm(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish job');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Job Distribution ({data.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Publish Job'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Platform</label>
              <select className="form-input" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                {platforms.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">External URL</label>
              <input className="form-input" value={form.externalUrl} onChange={e => setForm({ ...form, externalUrl: e.target.value })} placeholder="Link to job posting" />
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Public Job Link</label>
              <input className="form-input" value={form.publicJobLink} onChange={e => setForm({ ...form, publicJobLink: e.target.value })} placeholder="Company careers page link" />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">Publish</button>
            </div>
          </form>
        </div>
      )}

      {!data.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="distribution" size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} />
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No publications yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Publish your jobs on multiple platforms to reach more candidates.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Published</th>
                <th>Applications</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {data.map(pub => (
                <tr key={pub._id}>
                  <td><strong>{pub.job?.title}</strong></td>
                  <td>{pub.platform}</td>
                  <td><Badge status={pub.status} /></td>
                  <td>{pub.publishedDate ? new Date(pub.publishedDate).toLocaleDateString() : '-'}</td>
                  <td>{pub.applicationsReceived}</td>
                  <td>{pub.externalUrl ? <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer">View</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==========================================
// REPORTS TAB
// ==========================================
const ReportsTab = ({ data }) => {
  const funnel = data?.funnel || [];
  const activity = data?.activity || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={{ margin: 0, fontSize: 16 }}>Recruitment Reports</h3>

      {/* Recruitment Funnel */}
      <div className="card">
        <h4 style={{ margin: '0 0 16px', fontSize: 14 }}>Recruitment Funnel</h4>
        {!funnel.length ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No data available</div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
            {funnel.map((stage, idx) => {
              const maxCount = Math.max(...funnel.map(s => s.count), 1);
              const height = (stage.count / maxCount) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{stage.count}</div>
                  <div style={{ width: '100%', height: `${height}%`, background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{stage.stage}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="card">
        <h4 style={{ margin: '0 0 16px', fontSize: 14 }}>Activity Log</h4>
        {!activity.length ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No activity recorded</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activity.slice(0, 10).map((act, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: idx < activity.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  {act.entityType === 'Job' ? <Icon name="jobs" size={14} /> : act.entityType === 'Candidate' ? <Icon name="user" size={14} /> : <Icon name="file" size={14} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12 }}>{act.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {act.performedBy?.firstName} {act.performedBy?.lastName} · {new Date(act.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentAcquisitionPage;
