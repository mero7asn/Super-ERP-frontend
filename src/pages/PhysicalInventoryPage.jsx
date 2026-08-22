import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const PhysicalInventoryPage = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    warehouse: '', subinventory: '', description: '', countMethod: 'BLIND',
    freezeDate: '', remarks: ''
  });
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState([]);

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

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getPhysicalInventories({ limit: 100 });
      setInventories(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventories(); }, []);

  const handleCreate = async () => {
    setError('');
    if (!form.warehouse || !form.subinventory) return setError('Warehouse and subinventory are required');
    try {
      await inventoryAPI.createPhysicalInventory(form);
      setShowForm(false);
      fetchInventories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create physical inventory');
    }
  };

  const summaryCards = [
    { label: 'Open inventories', value: inventories.length, tone: '#0284c7' },
    { label: 'Posted', value: inventories.filter((pi) => pi.status === 'Posted').length, tone: '#16a34a' },
    { label: 'Pending', value: inventories.filter((pi) => pi.status !== 'Posted').length, tone: '#d97706' },
    { label: 'Variance entries', value: inventories.reduce((sum, pi) => sum + Number(pi.totalVariance || 0), 0), tone: '#7c3aed' }
  ];

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Inventory controls</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Physical inventory</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Coordinate full-count sessions, freeze dates, and posting workflows in a simpler view.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> New physical inventory</button>
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

      {loading ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>Loading physical inventories…</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {inventories.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No physical inventories yet.</div>
          ) : inventories.map((pi) => (
            <div key={pi._id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{pi.piId}</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{pi.warehouse?.code} • {pi.subinventory}</div>
                </div>
                <span className={`badge ${pi.status === 'Posted' ? 'badge-converted' : 'badge-new'}`}>{pi.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Method</div><div style={{ fontWeight: 700 }}>{pi.countMethod}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Items</div><div style={{ fontWeight: 700 }}>{pi.totalItems}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Variance</div><div style={{ fontWeight: 700, color: pi.totalVariance !== 0 ? (pi.totalVariance > 0 ? '#16a34a' : '#dc2626') : '#0f172a' }}>{pi.totalVariance}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Created</div><div style={{ fontWeight: 700 }}>{new Date(pi.createdAt).toLocaleDateString()}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 500, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New physical inventory</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Schedule full physical inventory count</p>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Freeze date</label>
                  <input className="form-input" type="date" value={form.freezeDate} onChange={(e) => setForm((p) => ({ ...p, freezeDate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Count method</label>
                  <select className="form-input" value={form.countMethod} onChange={(e) => setForm((p) => ({ ...p, countMethod: e.target.value }))}>
                    <option value="BLIND">Blind</option>
                    <option value="VISIBLE">Visible</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create physical inventory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicalInventoryPage;
