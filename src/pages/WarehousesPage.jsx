import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    code: '', name: '', description: '', type: 'Main Warehouse', address: {}, contact: {}, status: 'Active', subinventories: []
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getWarehouses();
      setWarehouses(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      code: '', name: '', description: '', type: 'Main Warehouse',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
      contact: { phone: '', email: '', manager: '' },
      status: 'Active', subinventories: []
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    if (!form.code || !form.name) return setError('Code and name are required');

    try {
      if (editing) await inventoryAPI.updateWarehouse(editing._id, form);
      else await inventoryAPI.createWarehouse(form);
      setShowForm(false);
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save warehouse');
    }
  };

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Warehouse network</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Warehouses</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Manage warehouse master data and storage zones from a single premium workspace.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> New warehouse</button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading warehouses…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active sites</div><div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7' }}>{warehouses.filter((w) => w.status === 'Active').length}</div></div>
            <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zones configured</div><div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{warehouses.reduce((sum, w) => sum + (w.subinventories?.length || 0), 0)}</div></div>
            <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Maintenance</div><div style={{ fontSize: 22, fontWeight: 800, color: '#d97706' }}>{warehouses.filter((w) => w.status !== 'Active').length}</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {warehouses.map((wh) => { const usedPct = Math.min(100, ((wh.subinventories?.length || 0) / 8) * 100); return (
              <div key={wh._id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{wh.code}</div><div style={{ fontSize: 16, fontWeight: 800 }}>{wh.name}</div></div>
                  <span style={{ padding: '4px 8px', borderRadius: 999, background: wh.status === 'Active' ? '#dcfce7' : '#fef3c7', color: wh.status === 'Active' ? '#15803d' : '#92400e', fontSize: 11, fontWeight: 700 }}>{wh.status}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{wh.address?.city || 'No city'} · {wh.type}</div>
                <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden', marginBottom: 8 }}><div style={{ width: `${usedPct}%`, height: '100%', background: usedPct > 70 ? '#dc2626' : usedPct > 40 ? '#f59e0b' : '#16a34a', borderRadius: 999 }} /></div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{wh.subinventories?.length || 0} subinventory areas configured</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(wh); setForm({ code: wh.code, name: wh.name, description: wh.description || '', type: wh.type || 'Main Warehouse', address: wh.address || { street: '', city: '', state: '', zipCode: '', country: '' }, contact: wh.contact || { phone: '', email: '', manager: '' }, status: wh.status || 'Active', subinventories: wh.subinventories || [] }); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/inventory/warehouse-map')}>Storage map</button>
                </div>
              </div>
            );})}
          </div>
        </>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 600, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{editing ? 'Edit warehouse' : 'New warehouse'}</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Warehouse master data</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label className="form-label">Code *</label><input className="form-input" placeholder="WH-01" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} disabled={!!editing} /></div>
                <div><label className="form-label">Name *</label><input className="form-input" placeholder="Main Warehouse" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label className="form-label">Type</label><select className="form-input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}><option value="Main Warehouse">Main Warehouse</option><option value="Returns Warehouse">Returns Warehouse</option><option value="Transit Warehouse">Transit Warehouse</option><option value="Quarantine">Quarantine</option><option value="Production">Production</option></select></div>
                <div><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Maintenance">Maintenance</option></select></div>
              </div>
              <div><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>{editing ? 'Save changes' : 'Create warehouse'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
