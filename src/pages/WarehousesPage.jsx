import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    code: '', name: '', description: '', type: 'Main Warehouse',
    address: {}, contact: {}, status: 'Active', subinventories: []
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
      if (editing) {
        await inventoryAPI.updateWarehouse(editing._id, form);
      } else {
        await inventoryAPI.createWarehouse(form);
      }
      setShowForm(false);
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save warehouse');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="analytics" size={26} style={{ color: 'var(--accent-primary)' }} />
            Warehouses
          </h1>
          <p className="page-subtitle">Manage warehouse and storage location master data</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> New Warehouse
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading warehouses…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Subinventories</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {warehouses.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No warehouses yet.</td></tr>
                ) : warehouses.map(wh => (
                  <tr key={wh._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{wh.code}</td>
                    <td style={{ fontWeight: 600 }}>{wh.name}</td>
                    <td><span className="badge badge-new">{wh.type}</span></td>
                    <td>{wh.address?.city || '—'}</td>
                    <td>{wh.contact?.phone || '—'}</td>
                    <td><span className={`badge ${wh.status === 'Active' ? 'badge-converted' : 'badge-new'}`}>{wh.status}</span></td>
                    <td>{wh.subinventories?.length || 0}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(wh); setForm({ ...form, ...wh }); setShowForm(true); }}>Edit</button>
                    </td>
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
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 600, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{editing ? 'Edit Warehouse' : 'New Warehouse'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Warehouse master data</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Code *</label>
                  <input className="form-input" placeholder="WH-01" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} disabled={!!editing} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Name *</label>
                  <input className="form-input" placeholder="Main Warehouse" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="Returns Warehouse">Returns Warehouse</option>
                    <option value="Transit Warehouse">Transit Warehouse</option>
                    <option value="Quarantine">Quarantine</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
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
              <button type="button" className="btn btn-primary" onClick={handleSave}>
                {editing ? 'Save Changes' : 'Create Warehouse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
