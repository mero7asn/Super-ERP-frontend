import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const InventoryItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', sku: '', description: '', category: 'General', baseUom: 'EA',
    unitCost: '', sellingPrice: '', status: 'Active', lotControl: false,
    serialControl: false, shelfLifeDays: 0, reorderPoint: 0, maxStockLevel: 0
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getItems({ limit: 100 });
      setItems(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '', sku: '', description: '', category: 'General', baseUom: 'EA',
      unitCost: '', sellingPrice: '', status: 'Active', lotControl: false,
      serialControl: false, shelfLifeDays: 0, reorderPoint: 0, maxStockLevel: 0
    });
    setShowModal(true);
    setError('');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name, sku: item.sku, description: item.description || '',
      category: item.category || 'General', baseUom: item.baseUom || 'EA',
      unitCost: item.unitCost || '', sellingPrice: item.sellingPrice || '',
      status: item.status || 'Active', lotControl: item.lotControl || false,
      serialControl: item.serialControl || false,
      shelfLifeDays: item.shelfLifeDays || 0,
      reorderPoint: item.reorderPoint || 0,
      maxStockLevel: item.maxStockLevel || 0
    });
    setShowModal(true);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim() || !form.sku.trim()) return setError('Name and SKU are required');

    try {
      if (editing) {
        await inventoryAPI.updateItem(editing._id, form);
      } else {
        await inventoryAPI.createItem(form);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this inventory item?')) return;
    try {
      await inventoryAPI.deleteItem(id);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner" />Loading inventory items…</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="box" size={26} style={{ color: 'var(--accent-primary)' }} />
            Inventory Items
          </h1>
          <p className="page-subtitle">Manage item master data with UoM, lot/serial, and valuation</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> New Item
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Base UoM</th>
                <th>Unit Cost</th>
                <th>Status</th>
                <th>Lot</th>
                <th>Serial</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No inventory items yet.</td></tr>
              ) : items.map(item => (
                <tr key={item._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.sku}</td>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.category}</td>
                  <td style={{ fontFamily: 'monospace' }}>{item.baseUom}</td>
                  <td>${Number(item.unitCost).toLocaleString()}</td>
                  <td><span className={`badge ${item.status === 'Active' ? 'badge-converted' : 'badge-new'}`}>{item.status}</span></td>
                  <td>{item.lotControl ? 'Yes' : 'No'}</td>
                  <td>{item.serialControl ? 'Yes' : 'No'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>Edit</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/inventory/items/${item._id}`)}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 600, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{editing ? 'Edit Item' : 'New Inventory Item'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Item master data</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">SKU *</label>
                  <input className="form-input" placeholder="PRD-001" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value.toUpperCase() }))} disabled={!!editing} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Name *</label>
                  <input className="form-input" placeholder="e.g. Premium Widget" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <input className="form-input" placeholder="General" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Base UoM</label>
                  <input className="form-input" placeholder="EA" value={form.baseUom} onChange={e => setForm(p => ({ ...p, baseUom: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Discontinued">Discontinued</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Unit Cost ($)</label>
                  <input className="form-input" type="number" step="0.01" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Selling Price ($)</label>
                  <input className="form-input" type="number" step="0.01" value={form.sellingPrice} onChange={e => setForm(p => ({ ...p, sellingPrice: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.lotControl} onChange={e => setForm(p => ({ ...p, lotControl: e.target.checked }))} />
                  <span style={{ fontSize: 13 }}>Lot Control</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.serialControl} onChange={e => setForm(p => ({ ...p, serialControl: e.target.checked }))} />
                  <span style={{ fontSize: 13 }}>Serial Control</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>
                {editing ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryItemsPage;
