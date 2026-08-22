import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const CycleCountPage = () => {
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    warehouse: '', subinventory: '', countType: 'CYCLE', countMethod: 'BLIND',
    abcClass: '', scheduledDate: '', remarks: ''
  });
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const { data } = await inventoryAPI.getWarehouses();
        setWarehouses(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWarehouses();
  }, []);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getCycleCounts({ limit: 100 });
      setCounts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCounts(); }, []);

  const handleCreate = async () => {
    setError('');
    if (!form.warehouse || !form.subinventory || !form.scheduledDate) {
      return setError('Warehouse, subinventory, and scheduled date are required');
    }
    try {
      await inventoryAPI.createCycleCount(form);
      setShowForm(false);
      fetchCounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create cycle count');
    }
  };

  const filteredCounts = counts.filter((count) => filter === 'all' || count.status === filter);
  const summaryCards = [
    { label: 'Total sessions', value: counts.length, tone: '#0284c7' },
    { label: 'Pending', value: counts.filter((count) => count.status !== 'Posted').length, tone: '#d97706' },
    { label: 'Posted', value: counts.filter((count) => count.status === 'Posted').length, tone: '#16a34a' },
    { label: 'ABC A', value: counts.filter((count) => count.abcClass === 'A').length, tone: '#7c3aed' }
  ];

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Inventory controls</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Cycle counting</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Plan and execute cycle counts by ABC class with clear status visibility.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> New cycle count</button>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {summaryCards.map((card) => (
            <div key={card.label} style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{card.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: card.tone }}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'Pending', 'Posted'].map((value) => (
          <button key={value} onClick={() => setFilter(value)} style={{ padding: '8px 12px', borderRadius: 999, border: filter === value ? '1px solid #0284c7' : '1px solid #e2e8f0', background: filter === value ? '#eff6ff' : '#fff', color: filter === value ? '#0284c7' : '#475569', fontWeight: 700, cursor: 'pointer' }}>{value === 'all' ? 'All' : value}</button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>Loading cycle counts…</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filteredCounts.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No cycle counts yet.</div>
          ) : filteredCounts.map((cc) => (
            <div key={cc._id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{cc.countId}</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{cc.warehouse?.code} • {cc.subinventory}</div>
                </div>
                <span className={`badge ${cc.status === 'Posted' ? 'badge-converted' : 'badge-new'}`}>{cc.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Type</div><div style={{ fontWeight: 700 }}>{cc.countType}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Method</div><div style={{ fontWeight: 700 }}>{cc.countMethod}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>ABC</div><div style={{ fontWeight: 700 }}>{cc.abcClass || '—'}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Scheduled</div><div style={{ fontWeight: 700 }}>{new Date(cc.scheduledDate).toLocaleDateString()}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 500, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New cycle count</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Schedule a cycle count task</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Warehouse *</label>
                  <select className="form-input" value={form.warehouse} onChange={(e) => setForm((p) => ({ ...p, warehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Subinventory *</label>
                  <input className="form-input" value={form.subinventory} onChange={(e) => setForm((p) => ({ ...p, subinventory: e.target.value.toUpperCase() }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Count type</label>
                  <select className="form-input" value={form.countType} onChange={(e) => setForm((p) => ({ ...p, countType: e.target.value }))}>
                    <option value="CYCLE">Cycle</option>
                    <option value="FULL">Full</option>
                    <option value="AD_HOC">Ad Hoc</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Method</label>
                  <select className="form-input" value={form.countMethod} onChange={(e) => setForm((p) => ({ ...p, countMethod: e.target.value }))}>
                    <option value="BLIND">Blind</option>
                    <option value="VISIBLE">Visible</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">ABC class</label>
                  <select className="form-input" value={form.abcClass} onChange={(e) => setForm((p) => ({ ...p, abcClass: e.target.value }))}>
                    <option value="">All</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Scheduled date *</label>
                <input className="form-input" type="date" value={form.scheduledDate} onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create cycle count</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleCountPage;
