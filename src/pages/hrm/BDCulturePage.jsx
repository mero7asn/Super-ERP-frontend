import { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Icon = ({ name, size = 16, style = {} }) => {
  const p = { xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const icons = {
    overview: '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
    opportunities: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    partnerships: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    benefits: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    culture: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    suggestions: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    events: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    reports: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>'
  };
  const svg = icons[name];
  if (!svg) return null;
  return <svg {...p} dangerouslySetInnerHTML={{ __html: svg }} />;
};

const SC = {
  Lead:['rgba(148,163,184,0.15)','#94A3B8'],Contacted:['rgba(59,130,246,0.12)','#3B82F6'],Discussion:['rgba(139,92,246,0.12)','#8B5CF6'],Proposal:['rgba(245,158,11,0.15)','#F59E0B'],Negotiation:['rgba(236,72,153,0.12)','#EC4899'],Approval:['rgba(99,102,241,0.12)','#6366F1'],Partnership:['rgba(16,185,129,0.12)','#10B981'],Lost:['rgba(239,68,68,0.12)','#EF4444'],Prospect:['rgba(148,163,184,0.15)','#94A3B8'],Active:['rgba(16,185,129,0.12)','#10B981'],'Pending Renewal':['rgba(245,158,11,0.15)','#F59E0B'],Expired:['rgba(239,68,68,0.12)','#EF4444'],Suspended:['rgba(100,116,139,0.12)','#64748B'],Terminated:['rgba(239,68,68,0.15)','#EF4444'],Draft:['rgba(148,163,184,0.15)','#94A3B8'],Planned:['rgba(59,130,246,0.12)','#3B82F6'],Completed:['rgba(16,185,129,0.12)','#10B981'],Cancelled:['rgba(100,116,139,0.12)','#64748B'],Upcoming:['rgba(59,130,246,0.12)','#3B82F6'],'Registration Open':['rgba(16,185,129,0.12)','#10B981'],'In Progress':['rgba(245,158,11,0.12)','#F59E0B'],Pending:['rgba(245,158,11,0.15)','#F59E0B'],'Under Review':['rgba(59,130,246,0.12)','#3B82F6'],Approved:['rgba(16,185,129,0.12)','#10B981'],Rejected:['rgba(239,68,68,0.12)','#EF4444'],Implemented:['rgba(99,102,241,0.12)','#6366F1'],Low:['rgba(148,163,184,0.12)','#94A3B8'],Medium:['rgba(59,130,246,0.12)','#3B82F6'],High:['rgba(245,158,11,0.12)','#F59E0B'],Urgent:['rgba(239,68,68,0.12)','#EF4444']
};

const Badge = ({ status }) => {
  const c = SC[status] || ['rgba(148,163,184,0.15)','#94A3B8'];
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: c[0], color: c[1] }}>{status}</span>;
};

const BDCulturePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const isBD = ['HR Business Partner','HRM System Administrator','HR Manager','CRM core Administrator','Super Admin','Super CRM Administrator'].includes(user?.role);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'opportunities', label: 'Opportunities', icon: 'opportunities' },
    { id: 'partnerships', label: 'Partnerships', icon: 'partnerships' },
    { id: 'benefits', label: 'Benefits & Perks', icon: 'benefits' },
    { id: 'culture', label: 'Culture Programs', icon: 'culture' },
    { id: 'suggestions', label: 'Suggestions', icon: 'suggestions' },
    { id: 'events', label: 'Events', icon: 'events' },
    { id: 'reports', label: 'Reports', icon: 'reports' },
  ];

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let r;
      switch (tab) {
        case 'overview': r = await API.get('/bd-culture/overview'); setData(p => ({ ...p, overview: r.data.data })); break;
        case 'opportunities': r = await API.get('/bd-culture/opportunities'); setData(p => ({ ...p, opportunities: r.data.data })); break;
        case 'partnerships': r = await API.get('/bd-culture/partnerships'); setData(p => ({ ...p, partnerships: r.data.data })); break;
        case 'benefits': r = await API.get('/bd-culture/benefits'); setData(p => ({ ...p, benefits: r.data.data })); break;
        case 'culture': r = await API.get('/bd-culture/culture-programs'); setData(p => ({ ...p, programs: r.data.data })); break;
        case 'suggestions': r = await API.get('/bd-culture/suggestions'); setData(p => ({ ...p, suggestions: r.data.data })); break;
        case 'events': r = await API.get('/bd-culture/events'); setData(p => ({ ...p, events: r.data.data })); break;
        case 'reports':
          const [pipeline, feedback] = await Promise.all([API.get('/bd-culture/pipeline'), API.get('/bd-culture/feedback')]);
          setData(p => ({ ...p, pipeline: pipeline.data.data, feedback: feedback.data.data })); break;
      }
    } catch (err) { console.error('Failed to fetch BD data:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isBD) fetchData(activeTab); }, [activeTab, isBD]);

  if (!isBD) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 12 }}>
      <Icon name="briefcase" size={32} style={{ color: 'var(--text-muted)' }} />
      <span style={{ color: 'var(--text-muted)' }}>Access restricted to Business Development & People Culture team.</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Development & People Culture</h1>
          <p className="page-subtitle">Build valuable partnerships, improve employee benefits, and create a stronger workplace culture.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('opportunities')}>+ New Opportunity</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('partnerships')}>+ New Partnership</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 16px', background: 'transparent', border: 'none', color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)', borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent', fontWeight: activeTab === tab.id ? 600 : 400, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name={tab.icon} size={15} />{tab.label}
          </button>
        ))}
      </div>
      {loading ? <div className="loading-state"><div className="spinner" /> Loading...</div> : (
        <>
          {activeTab === 'overview' && <OverviewTab data={data.overview} onNavigate={setActiveTab} />}
          {activeTab === 'opportunities' && <OpportunitiesTab data={data.opportunities} onRefresh={() => fetchData('opportunities')} />}
          {activeTab === 'partnerships' && <PartnershipsTab data={data.partnerships} onRefresh={() => fetchData('partnerships')} />}
          {activeTab === 'benefits' && <BenefitsTab data={data.benefits} onRefresh={() => fetchData('benefits')} />}
          {activeTab === 'culture' && <CultureTab data={data.programs} onRefresh={() => fetchData('culture')} />}
          {activeTab === 'suggestions' && <SuggestionsTab data={data.suggestions} onRefresh={() => fetchData('suggestions')} />}
          {activeTab === 'events' && <EventsTab data={data.events} onRefresh={() => fetchData('events')} />}
          {activeTab === 'reports' && <ReportsTab data={data} />}
        </>
      )}
    </div>
  );
};

const OverviewTab = ({ data, onNavigate }) => {
  if (!data) return null;
  const kpis = [
    { l: 'Active Partnerships', v: data.activePartnerships || 0, c: '#10B981', o: () => onNavigate('partnerships') },
    { l: 'Open Opportunities', v: data.openOpportunities || 0, c: '#3B82F6', o: () => onNavigate('opportunities') },
    { l: 'Employee Benefits', v: data.activeBenefits || 0, c: '#EC4899', o: () => onNavigate('benefits') },
    { l: 'Culture Programs', v: data.activePrograms || 0, c: '#8B5CF6', o: () => onNavigate('culture') },
    { l: 'Pending Suggestions', v: data.pendingSuggestions || 0, c: '#F59E0B', o: () => onNavigate('suggestions') },
    { l: 'Upcoming Renewals', v: data.upcomingRenewals || 0, c: '#EF4444', o: () => onNavigate('partnerships') },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {kpis.map((k, i) => (
          <div key={i} onClick={k.o} className="card" style={{ cursor: 'pointer', padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{k.l}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card"><h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Business Development</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Active Partnerships</span><strong>{data.activePartnerships || 0}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Open Opportunities</span><strong>{data.openOpportunities || 0}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Upcoming Renewals</span><strong style={{ color: '#EF4444' }}>{data.upcomingRenewals || 0}</strong></div>
          </div>
        </div>
        <div className="card"><h3 style={{ margin: '0 0 12px', fontSize: 14 }}>People Culture</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Active Benefits</span><strong>{data.activeBenefits || 0}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Culture Programs</span><strong>{data.activePrograms || 0}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Pending Suggestions</span><strong>{data.pendingSuggestions || 0}</strong></div>
          </div>
        </div>
      </div>
      <div className="card"><h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Recent Activity</h3>
        {!data.recentActivities?.length ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}><Icon name="activity" size={28} style={{ marginBottom: 8, opacity: 0.5 }} /><div>No recent activity</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.recentActivities.slice(0, 8).map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < data.recentActivities.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}><Icon name="activity" size={14} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13 }}>{a.notes || a.activityType}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.user?.firstName} {a.user?.lastName} · {new Date(a.date || a.createdAt).toLocaleDateString()}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const OpportunitiesTab = ({ data = [], onRefresh }) => {
  const [view, setView] = useState('kanban');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: '', contactPerson: '', opportunityType: 'Corporate Partnership', description: '', expectedValue: 0, priority: 'Medium', stage: 'Lead' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await API.post('/bd-culture/opportunities', form); setShowForm(false); onRefresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  const stages = ['Lead','Contacted','Discussion','Proposal','Negotiation','Approval','Partnership'];
  const byStage = useMemo(() => { const g = {}; stages.forEach(s => { g[s] = []; }); data.forEach(o => { if (g[o.stage]) g[o.stage].push(o); }); return g; }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Opportunities ({data.length})</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}>Kanban</button>
            <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>Table</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Opportunity'}</button>
        </div>
      </div>
      {showForm && (
        <div className="card"><form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Company Name</label><input className="form-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} required /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Contact Person</label><input className="form-input" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Type</label><select className="form-input" value={form.opportunityType} onChange={e => setForm({ ...form, opportunityType: e.target.value })}><option>Employee Benefits</option><option>Corporate Partnership</option><option>Vendor Partnership</option><option>Strategic Partnership</option><option>Sponsorship</option><option>Discount Partnership</option><option>Other</option></select></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Priority</label><select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Expected Value</label><input type="number" className="form-input" value={form.expectedValue} onChange={e => setForm({ ...form, expectedValue: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Stage</label><select className="form-input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>{stages.map(s => <option key={s}>{s}</option>)}</select></div>
          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" className="btn btn-primary btn-sm">Create Opportunity</button></div>
        </form></div>
      )}
      {view === 'kanban' ? (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
          {stages.map(stage => (
            <div key={stage} style={{ minWidth: 180, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 600 }}>{stage}</span><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{byStage[stage]?.length || 0}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
                {byStage[stage]?.map((opp, i) => (<div key={i} className="card" style={{ padding: 10 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{opp.companyName}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opp.opportunityType}</div><div style={{ marginTop: 4 }}><Badge status={opp.priority} /></div></div>))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Company</th><th>Type</th><th>Stage</th><th>Priority</th><th>Value</th><th>Owner</th></tr></thead><tbody>
          {data.map(opp => (<tr key={opp._id}><td><strong>{opp.opportunityId}</strong></td><td>{opp.companyName}</td><td>{opp.opportunityType}</td><td><Badge status={opp.stage} /></td><td><Badge status={opp.priority} /></td><td>{opp.expectedValue}</td><td>{opp.owner?.firstName} {opp.owner?.lastName}</td></tr>))}
        </tbody></table></div>
      )}
    </div>
  );
};

const PartnershipsTab = ({ data = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: '', category: 'Other', partnershipType: 'Corporate Partnership', status: 'Prospect', partnershipValue: 0, discountPercentage: 0, benefitDetails: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await API.post('/bd-culture/partnerships', form); setShowForm(false); onRefresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Partnerships ({data.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Partnership'}</button>
      </div>
      {showForm && (
        <div className="card"><form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Company Name</label><input className="form-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} required /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Health & Wellness</option><option>Financial</option><option>Lifestyle & Leisure</option><option>Education & Training</option><option>Insurance</option><option>Transportation</option><option>Food & Dining</option><option>Shopping</option><option>Technology</option><option>Family</option><option>Other</option></select></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Type</label><select className="form-input" value={form.partnershipType} onChange={e => setForm({ ...form, partnershipType: e.target.value })}><option>Employee Benefits</option><option>Corporate Partnership</option><option>Vendor Partnership</option><option>Strategic Partnership</option><option>Sponsorship</option><option>Discount Partnership</option><option>Other</option></select></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>Prospect</option><option>Active</option><option>Pending Renewal</option><option>Expired</option><option>Suspended</option><option>Terminated</option></select></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Value</label><input type="number" className="form-input" value={form.partnershipValue} onChange={e => setForm({ ...form, partnershipValue: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Discount %</label><input type="number" className="form-input" value={form.discountPercentage} onChange={e => setForm({ ...form, discountPercentage: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}><label className="form-label">Benefit Details</label><textarea className="form-input" rows={2} value={form.benefitDetails} onChange={e => setForm({ ...form, benefitDetails: e.target.value })} /></div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" className="btn btn-primary btn-sm">Create Partnership</button></div>
        </form></div>
      )}
      {!data.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}><Icon name="partnerships" size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} /><div style={{ fontWeight: 600, marginBottom: 8 }}>No active partnerships</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Start building your partner network by creating your first business opportunity.</div></div>
      ) : (
        <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Company</th><th>Category</th><th>Type</th><th>Status</th><th>Value</th><th>Discount</th><th>Renewal</th></tr></thead><tbody>
           {data.map(p => (<tr key={p._id}><td><strong>{p.partnershipId}</strong></td><td>{p.companyName}</td><td>{p.category}</td><td>{p.partnershipType}</td><td><Badge status={p.status} /></td><td>{p.partnershipValue}</td><td>{p.discountPercentage}%</td><td>{p.renewalDate ? new Date(p.renewalDate).toLocaleDateString() : '-'}</td></tr>))}
        </tbody></table></div>
      )}
    </div>
  );
};

const BenefitsTab = ({ data = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Other', description: '', discountPercentage: 0, howToUse: '' });
  const handleSubmit = async (e) => { e.preventDefault(); try { await API.post('/bd-culture/benefits', { ...form, status: 'Active' }); setShowForm(false); onRefresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Benefits & Perks ({data.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Benefit'}</button>
      </div>
      {showForm && (
        <div className="card"><form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Benefit Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Health & Wellness</option><option>Financial</option><option>Lifestyle & Leisure</option><option>Education & Training</option><option>Insurance</option><option>Transportation</option><option>Food & Dining</option><option>Shopping</option><option>Technology</option><option>Family</option><option>Other</option></select></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Discount %</label><input type="number" className="form-input" value={form.discountPercentage} onChange={e => setForm({ ...form, discountPercentage: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">How to Use</label><input className="form-input" value={form.howToUse} onChange={e => setForm({ ...form, howToUse: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" className="btn btn-primary btn-sm">Add Benefit</button></div>
        </form></div>
      )}
      {!data.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}><Icon name="benefits" size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} /><div style={{ fontWeight: 600, marginBottom: 8 }}>No employee benefits</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create a benefit from an existing partnership and make it available to employees.</div></div>
      ) : (
        <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Discount</th><th>Status</th><th>Usage</th></tr></thead><tbody>
          {data.map(b => (<tr key={b._id}><td><strong>{b.benefitId}</strong></td><td>{b.name}</td><td>{b.category}</td><td>{b.discountPercentage}%</td><td><Badge status={b.status} /></td><td>{b.usageCount}</td></tr>))}
        </tbody></table></div>
      )}
    </div>
  );
};

const CultureTab = ({ data = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Employee Engagement', description: '', objective: '', startDate: '', endDate: '', budget: 0 });
  const handleSubmit = async (e) => { e.preventDefault(); try { await API.post('/bd-culture/culture-programs', { ...form, status: 'Planned' }); setShowForm(false); onRefresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Culture Programs ({data.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Program'}</button>
      </div>
      {showForm && (
        <div className="card"><form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Program Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Type</label><select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Employee Recognition</option><option>Team Building</option><option>Wellness Programs</option><option>Learning Programs</option><option>Company Events</option><option>CSR Activities</option><option>Employee Engagement</option><option>Innovation Programs</option><option>Employee Appreciation</option><option>Internal Campaigns</option><option>Other</option></select></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Start Date</label><input type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">End Date</label><input type="date" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Budget</label><input type="number" className="form-input" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Objective</label><input className="form-input" value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" className="btn btn-primary btn-sm">Create Program</button></div>
        </form></div>
      )}
      {!data.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}><Icon name="culture" size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} /><div style={{ fontWeight: 600, marginBottom: 8 }}>No active culture programs</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create an initiative to improve employee engagement and workplace culture.</div></div>
      ) : (
        <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Start</th><th>End</th><th>Participants</th></tr></thead><tbody>
          {data.map(p => (<tr key={p._id}><td><strong>{p.programId}</strong></td><td>{p.name}</td><td>{p.type}</td><td><Badge status={p.status} /></td><td>{p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}</td><td>{p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}</td><td>{p.participationCount}</td></tr>))}
        </tbody></table></div>
      )}
    </div>
  );
};

const SuggestionsTab = ({ data = [], onRefresh }) => {
  const [view, setView] = useState('kanban');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Workplace', details: '', isAnonymous: false });
  const handleSubmit = async (e) => { e.preventDefault(); try { await API.post('/bd-culture/suggestions', form); setShowForm(false); onRefresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  const statuses = ['Pending','Under Review','Approved','Implemented','Rejected'];
  const byStatus = useMemo(() => { const g = {}; statuses.forEach(s => { g[s] = []; }); data.forEach(s => { if (g[s.status]) g[s.status].push(s); }); return g; }, [data]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Employee Suggestions ({data.length})</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}>Kanban</button>
            <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>Table</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Suggestion'}</button>
        </div>
      </div>
      {showForm && (
        <div className="card"><form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Workplace</option><option>HR</option><option>Technology</option><option>Operations</option><option>Benefits</option><option>Culture</option><option>Safety</option><option>Productivity</option><option>Cost Saving</option><option>Other</option></select></div>
          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} required /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={form.isAnonymous} onChange={e => setForm({ ...form, isAnonymous: e.target.checked })} />Submit anonymously</label>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="submit" className="btn btn-primary btn-sm">Submit</button></div>
        </form></div>
      )}
      {view === 'kanban' ? (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
          {statuses.map(status => (
            <div key={status} style={{ minWidth: 180, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 600 }}>{status}</span><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{byStatus[status]?.length || 0}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
                {byStatus[status]?.map((s, i) => (<div key={i} className="card" style={{ padding: 10 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{s.title}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.category}</div></div>))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper"><table><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Submitted By</th><th>Date</th><th>Actions</th></tr></thead><tbody>
          {data.map(s => (
            <tr key={s._id}>
              <td><strong>{s.title}</strong></td>
              <td>{s.category}</td>
              <td><Badge status={s.status} /></td>
              <td>{s.isAnonymous ? 'Anonymous' : `${s.submittedBy?.firstName || ''} ${s.submittedBy?.lastName || ''}`}</td>
              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
              <td>
                {s.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-sm btn-secondary" onClick={async () => { await API.put(`/bd-culture/suggestions/${s._id}/status`, { status: 'Approved' }); onRefresh(); }}>Approve</button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => { await API.put(`/bd-culture/suggestions/${s._id}/status`, { status: 'Rejected' }); onRefresh(); }}>Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody></table></div>
      )}
    </div>
  );
};

const EventsTab = ({ data = [], onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Company Event', date: '', time: '', location: '', description: '', capacity: 0 });
  const handleSubmit = async (e) => { e.preventDefault(); try { await API.post('/bd-culture/events', { ...form, status: 'Upcoming' }); setShowForm(false); onRefresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Events & Activities ({data.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Event'}</button>
      </div>
      {showForm && (
        <div className="card"><form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Event Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Type</label><select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Company Event</option><option>Team Building</option><option>Workshop</option><option>Seminar</option><option>Wellness Activity</option><option>Community Event</option><option>Other</option></select></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Time</label><input type="time" className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0 }}><label className="form-label">Capacity</label><input type="number" className="form-input" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
          <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}><button type="submit" className="btn btn-primary btn-sm">Create Event</button></div>
        </form></div>
      )}
      {!data.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}><Icon name="events" size={32} style={{ marginBottom: 12, color: 'var(--text-muted)' }} /><div style={{ fontWeight: 600, marginBottom: 8 }}>No upcoming events</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create an event to engage employees and build culture.</div></div>
      ) : (
        <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Date</th><th>Location</th><th>Capacity</th><th>Status</th></tr></thead><tbody>
          {data.map(e => (<tr key={e._id}><td><strong>{e.eventId}</strong></td><td>{e.name}</td><td>{e.type}</td><td>{e.date ? new Date(e.date).toLocaleDateString() : '-'}</td><td>{e.location}</td><td>{e.participantCount}/{e.capacity}</td><td><Badge status={e.status} /></td></tr>))}
        </tbody></table></div>
      )}
    </div>
  );
};

const ReportsTab = ({ data }) => {
  const pipeline = data?.pipeline || [];
  const feedback = data?.feedback || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={{ margin: 0, fontSize: 16 }}>Reports</h3>
      <div className="card">
        <h4 style={{ margin: '0 0 16px', fontSize: 14 }}>Partnership Pipeline</h4>
        {!pipeline.length ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No data available</div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
            {pipeline.map((stage, idx) => {
              const maxCount = Math.max(...pipeline.map(s => s.count), 1);
              const height = (stage.count / maxCount) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{stage.count}</div>
                  <div style={{ width: '100%', height: `${height}%`, background: 'linear-gradient(180deg, #8B5CF6 0%, #6366F1 100%)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{stage.stage}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="card">
        <h4 style={{ margin: '0 0 16px', fontSize: 14 }}>Employee Feedback</h4>
        {!feedback.length ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No feedback recorded</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {feedback.slice(0, 10).map((f, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: idx < feedback.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <Icon key={i} name="star" size={12} style={{ color: i <= f.rating ? '#F59E0B' : 'var(--border-color)' }} />)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12 }}>{f.comment || f.feedbackType}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.isAnonymous ? 'Anonymous' : `${f.employee?.firstName || ''} ${f.employee?.lastName || ''}`} · {new Date(f.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BDCulturePage;
