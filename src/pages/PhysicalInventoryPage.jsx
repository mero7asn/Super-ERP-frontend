import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

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
  const navigate = useNavigate();

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
      setInventories([]);
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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="kanban" size={26} style={{ color: 'var(--accent-primary)' }} />
            Physical Inventory
          </h1>
          <p className="page-subtitle">Full physical inventory count and posting</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> New Physical Inventory
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading physical inventories…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>PI ID</th>
                  <th>Warehouse</th>
                  <th>Subinventory</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Total Items</th>
                  <th>Variance</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {inventories.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No physical inventories yet.</td></tr>
                ) : inventories.map(pi => (
                  <tr key={pi._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{pi.piId}</td>
                    <td>{pi.warehouse?.code}</td>
                    <td>{pi.subinventory}</td>
                    <td><span className={`badge ${pi.status === 'Posted' ? 'badge-converted' : 'badge-new'}`}>{pi.status}</span></td>
                    <td>{pi.countMethod}</td>
                    <td>{pi.totalItems}</td>
                    <td style={{ fontWeight: 600, color: pi.totalVariance !== 0 ? (pi.totalVariance > 0 ? '#22c55e' : '#ef4444') : 'inherit' }}>{pi.totalVariance}</td>
                    <td style={{ fontSize: 12 }}>{new Date(pi.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }} onClick={() => setShowForm(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 500, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New Physical Inventory</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Schedule full physical inventory count</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Warehouse *</label>
                  <select className="form-input" value={form.warehouse} onChange={e => setForm(p => ({ ...p, warehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Subinventory *</label>
                  <input className="form-input" value={form.subinventory} onChange={e => setForm(p => ({ ...p, subinventory: e.target.value.toUpperCase() }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Freeze Date</label>
                  <input className="form-input" type="date" value={form.freezeDate} onChange={e => setForm(p => ({ ...p, freezeDate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Count Method</label>
                  <select className="form-input" value={form.countMethod} onChange={e => setForm(p => ({ ...p, countMethod: e.target.value }))}>
                    <option value="BLIND">Blind</option>
                    <option value="VISIBLE">Visible</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create Physical Inventory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicalInventoryPage;
