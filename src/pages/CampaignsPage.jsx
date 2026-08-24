import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Icon } from '../components/Icons';

const platformBadge = (platform) => {
  const map = { Meta: 'badge-meta', Google: 'badge-google', Email: 'badge-new', WhatsApp: 'badge-qualified', Other: 'badge-contacted' };
  return map[platform] || 'badge-new';
};

const statusBadge = (status) => {
  const map = { Active: 'badge-qualified', Draft: 'badge-closed', Paused: 'badge-high', Completed: 'badge-resolved' };
  return map[status] || 'badge-new';
};

const EMPTY_FORM = { name: '', platform: 'Meta', status: 'Draft', budget: '', startDate: '', endDate: '' };

const CampaignsPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPlatform, setFilterPlatform] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [copied, setCopied] = useState(null);

  const ADMIN_MARKETING_ROLES = [
    'Super CRM Administrator', 'Super Admin', 'Administrator',
    'CRM core Administrator', 'Core 360 Administrator', 'System Architect',
    'Marketing Manager', 'Marketing Specialist', 'Executive User'
  ];

  const canCreate = ADMIN_MARKETING_ROLES.includes(user?.role);
  const canDelete = ADMIN_MARKETING_ROLES.includes(user?.role);
  const canGetFormLink = ADMIN_MARKETING_ROLES.includes(user?.role);

  const handleGetFormLink = async (campaign) => {
    try {
      const { data } = await API.post(`/public/campaigns/${campaign._id}/generate-form`);
      const link = `${window.location.origin}/form/${data.formSlug}`;
      await navigator.clipboard.writeText(link);
      setCopied(campaign._id);
      setTimeout(() => setCopied(null), 2500);
      setCampaigns(prev => prev.map(c => c._id === campaign._id ? { ...c, formSlug: data.formSlug } : c));
    } catch {
      setError('Failed to generate form link');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data } = await API.get('/campaigns');
      setCampaigns(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const filtered = campaigns.filter((c) => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesPlatform = filterPlatform === 'All' || c.platform === filterPlatform;
    const query = search.toLowerCase();
    const matchesSearch = !query || [c.name, c.platform, c.status].join(' ').toLowerCase().includes(query);
    return matchesStatus && matchesPlatform && matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (campaign) => {
    setEditingId(campaign._id);
    setForm({
      name: campaign.name || '',
      platform: campaign.platform || 'Meta',
      status: campaign.status || 'Draft',
      budget: campaign.budget || '',
      startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : '',
      endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        const { data } = await API.put(`/campaigns/${editingId}`, form);
        setCampaigns(prev => prev.map(c => c._id === editingId ? data.data : c));
      } else {
        const { data } = await API.post('/campaigns', form);
        setCampaigns(prev => [data.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      await API.delete(`/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const draftCampaigns = campaigns.filter(c => c.status === 'Draft').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;

  const progressValue = (campaign) => {
    if (campaign.status === 'Completed') return 100;
    if (campaign.status === 'Paused') return 38;
    if (campaign.status === 'Active') return 72;
    return 56;
  };

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 6 }}>
            Marketing Command Center
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
            <span style={{ marginRight: 8 }}>📢</span> Campaigns
          </h1>
          <p style={{ fontSize: 14, color: '#CBD5E1', marginTop: 8, margin: 0, lineHeight: 1.5 }}>
            Plan, track, and manage campaigns with a faster visual workflow across every channel.
          </p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={openCreate} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="plus" size={16} />
            New Campaign
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="crm-stat-widget">
          <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#EFF6FF', color: '#2563EB' }}><Icon name="campaigns" size={18} /></div><span className="crm-trend-pill crm-trend-up">Live</span></div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{campaigns.length}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total Campaigns</div>
        </div>
        <div className="crm-stat-widget">
          <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#ECFDF5', color: '#059669' }}><Icon name="play" size={18} /></div><span className="crm-trend-pill crm-trend-up">Active</span></div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{activeCampaigns}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Active Now</div>
        </div>
        <div className="crm-stat-widget">
          <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#FEF3C7', color: '#D97706' }}><Icon name="edit" size={18} /></div><span className="crm-trend-pill crm-trend-up">Draft</span></div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{draftCampaigns}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>In Draft</div>
        </div>
        <div className="crm-stat-widget">
          <div className="crm-stat-header"><div className="crm-stat-icon-bg" style={{ background: '#E0F2FE', color: '#0284C7' }}><Icon name="check" size={18} /></div><span className="crm-trend-pill crm-trend-up">Done</span></div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{completedCampaigns}</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Completed</div>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{filtered.length} campaign{filtered.length !== 1 ? 's' : ''}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 140, border: '1px solid #CBD5E1', borderRadius: 999, padding: '6px 10px', fontSize: 12, background: '#fff' }}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ width: 140, border: '1px solid #CBD5E1', borderRadius: 999, padding: '6px 10px', fontSize: 12, background: '#fff' }}>
              <option value="All">All Channels</option>
              <option value="Meta">Meta</option>
              <option value="Google">Google</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Other">Other</option>
            </select>
            <input placeholder="Search campaigns…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, border: '1px solid #CBD5E1', borderRadius: 999, padding: '6px 10px', fontSize: 12, background: '#fff' }} />
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" />Loading campaigns…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon name="campaigns" size={48} style={{ opacity: 0.4 }} /></div>
            <p>No campaigns match the current filters.</p>
            {canCreate && (<button className="btn btn-primary" onClick={openCreate} style={{ width: 'auto', marginTop: 12 }}>Create First Campaign</button>)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
            {filtered.map((campaign) => {
              const value = progressValue(campaign);
              return (
                <div key={campaign._id} className="crm-glass-card" style={{ padding: 18, background: '#ffffff', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{campaign.platform}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>{campaign.name}</div>
                    </div>
                    <span className={`badge ${statusBadge(campaign.status)}`}>{campaign.status}</span>
                  </div>

                  <div style={{ marginTop: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 6 }}>
                      <span>Performance pulse</span>
                      <span>{value}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}>
                      <div style={{ width: `${value}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)' }} />
                    </div>
                  </div>

                  <svg viewBox="0 0 120 32" width="120" height="32" style={{ marginBottom: 10 }}>
                    <polyline fill="none" stroke="#2563EB" strokeWidth="2.5" points="0,24 20,18 40,22 60,12 80,16 100,8 120,10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: '#475569', marginBottom: 12 }}>
                    <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: 10 }}><strong style={{ color: '#0F172A' }}>Budget</strong><div>${Number(campaign.budget || 0).toLocaleString()}</div></div>
                    <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: 10 }}><strong style={{ color: '#0F172A' }}>Lead goal</strong><div>{campaign.leadsCount || 'Live'}</div></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      {campaign.manager ? `${campaign.manager.firstName} ${campaign.manager.lastName}` : 'Manager pending'}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canGetFormLink && (
                        <button onClick={() => handleGetFormLink(campaign)} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          {copied === campaign._id ? <><Icon name="check" size={13} /> Copied</> : <><Icon name="globe" size={13} /> Link</>}
                        </button>
                      )}
                      {canCreate && (<button onClick={() => openEdit(campaign)} className="btn btn-secondary btn-sm"><Icon name="edit" size={13} /></button>)}
                      {canDelete && (<button onClick={() => handleDelete(campaign._id)} className="btn btn-danger btn-sm"><Icon name="trash" size={13} /></button>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && campaigns.length > 0 && (
        <div style={{ textAlign: 'right', fontSize: 13, color: '#64748B', marginTop: 8 }}>
          Total allocated budget: <strong style={{ color: '#0F172A' }}>${totalBudget.toLocaleString()}</strong>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="crm-glass-card" style={{ width: '100%', maxWidth: 560, padding: 32, position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
              <Icon name="close" size={18} />
            </button>

            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="campaigns" size={20} style={{ color: 'var(--accent-primary)' }} />
              {editingId ? 'Edit Campaign' : 'Create Campaign'}
            </h2>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>
              {editingId ? 'Update campaign details below.' : 'Fill in the details to launch a new campaign.'}
            </p>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Campaign Name</label>
                <input className="form-input" placeholder="e.g. Summer Sale Q3 2026" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-input" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} style={{ cursor: 'pointer' }}>
                    <option>Meta</option><option>Google</option><option>Email</option><option>WhatsApp</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ cursor: 'pointer' }}>
                    <option>Draft</option><option>Active</option><option>Paused</option><option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Budget (USD)</label>
                <input type="number" min="0" className="form-input" placeholder="e.g. 5000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Campaign'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
