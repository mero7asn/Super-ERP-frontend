import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const AdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    item: '', warehouse: '', subinventory: '', locator: '',
    lotNumber: '', serialNumber: '', systemQuantity: '', countedQuantity: '',
    unitCost: '', reasonCode: 'SHORTAGE', reasonDescription: '', glAccount: '', costCenter: '', remarks: ''
  });
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: whData }, { data: itemData }] = await Promise.all([
          inventoryAPI.getWarehouses(),
          inventoryAPI.getItems({ limit: 200 })
        ]);
        setWarehouses(whData.data || []);
        setItems(itemData.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      setAdjustments([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdjustments(); }, []);

  const handleCreate = async () => {
    setError('');
    if (!form.item || !form.warehouse || form.systemQuantity === '' || form.countedQuantity === '' || !form.reasonCode) {
      return setError('Item, warehouse, system quantity, counted quantity, and reason code are required');
    }

    try {
      const variance = Number(form.countedQuantity) - Number(form.systemQuantity);
      const varianceValue = variance * (Number(form.unitCost) || 0);

      const { data } = await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          ...form,
          adjustmentId: `ADJ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          varianceQuantity: variance,
          varianceValue,
          status: 'Pending'
        })
      }).then(r => r.json());

      if (!data.success) throw new Error(data.message);

      setShowForm(false);
      fetchAdjustments();
    } catch (err) {
      setError(err.message || 'Failed to create adjustment');
    }
  };

  const handleApprove = async (id) => {
    try {
      const { data } = await inventoryAPI.approveAdjustment(id);
      if (data.success) fetchAdjustments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handlePost = async (id) => {
    try {
      const { data } = await inventoryAPI.postAdjustment(id);
      if (data.success) fetchAdjustments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="kanban" size={26} style={{ color: 'var(--accent-primary)' }} />
            Inventory Adjustments
          </h1>
          <p className="page-subtitle">Cycle count variances and miscellaneous adjustments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> New Adjustment
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading adjustments…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Adjustment ID</th>
                  <th>Item</th>
                  <th>WH</th>
                  <th>System Qty</th>
                  <th>Counted Qty</th>
                  <th>Variance</th>
                  <th>Value</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.length === 0 ? (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No adjustments yet.</td></tr>
                ) : adjustments.map(adj => (
                  <tr key={adj._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{adj.adjustmentId}</td>
                    <td>{adj.item?.name}</td>
                    <td>{adj.warehouse?.code}</td>
                    <td>{adj.systemQuantity}</td>
                    <td style={{ fontWeight: 600 }}>{adj.countedQuantity}</td>
                    <td style={{ color: adj.varianceQuantity > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{adj.varianceQuantity > 0 ? '+' : ''}{adj.varianceQuantity}</td>
                    <td>${adj.varianceValue?.toLocaleString()}</td>
                    <td><span className="badge badge-new">{adj.reasonCode}</span></td>
                    <td><span className={`badge ${adj.status === 'Posted' ? 'badge-converted' : adj.status === 'Approved' ? 'badge-qualified' : 'badge-new'}`}>{adj.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {adj.status === 'Pending' && <button className="btn btn-secondary btn-sm" onClick={() => handleApprove(adj._id)}>Approve</button>}
                        {adj.status === 'Approved' && <button className="btn btn-primary btn-sm" onClick={() => handlePost(adj._id)}>Post</button>}
                      </div>
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
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New Inventory Adjustment</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Record variance and request approval</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Item *</label>
                  <select className="form-input" value={form.item} onChange={e => setForm(p => ({ ...p, item: e.target.value }))}>
                    <option value="">Select item</option>
                    {items.map(it => <option key={it._id} value={it._id}>{it.sku} - {it.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Warehouse *</label>
                  <select className="form-input" value={form.warehouse} onChange={e => setForm(p => ({ ...p, warehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">System Qty *</label>
                  <input className="form-input" type="number" value={form.systemQuantity} onChange={e => setForm(p => ({ ...p, systemQuantity: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Counted Qty *</label>
                  <input className="form-input" type="number" value={form.countedQuantity} onChange={e => setForm(p => ({ ...p, countedQuantity: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Unit Cost</label>
                  <input className="form-input" type="number" step="0.01" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Reason Code *</label>
                  <select className="form-input" value={form.reasonCode} onChange={e => setForm(p => ({ ...p, reasonCode: e.target.value }))}>
                    <option value="DAMAGE">Damage</option>
                    <option value="THEFT">Theft</option>
                    <option value="OBSOLETE">Obsolete</option>
                    <option value="DATA_ENTRY_ERROR">Data Entry Error</option>
                    <option value="OVERAGE">Overage</option>
                    <option value="SHORTAGE">Shortage</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">GL Account</label>
                  <input className="form-input" placeholder="GL-XXXXX" value={form.glAccount} onChange={e => setForm(p => ({ ...p, glAccount: e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Remarks</label>
                <textarea className="form-input" rows="2" value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentsPage;
