import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    item: '', quantity: '', unitOfMeasure: 'EA',
    fromWarehouse: '', fromSubinventory: '', fromLocator: '', fromLotNumber: '',
    toWarehouse: '', toSubinventory: '', toLocator: '', toLotNumber: '',
    transferType: 'BIN_TRANSFER', remarks: ''
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

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      setTransfers([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransfers(); }, []);

  const handleCreate = async () => {
    setError('');
    if (!form.item || !form.fromWarehouse || !form.toWarehouse || !form.quantity) {
      return setError('Item, warehouses, and quantity are required');
    }

    try {
      // For transfers, we'd need a separate create endpoint
      // For now, show a placeholder
      setShowForm(false);
      alert('Transfer creation endpoint coming soon');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transfer');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="analytics" size={26} style={{ color: 'var(--accent-primary)' }} />
            Stock Transfers
          </h1>
          <p className="page-subtitle">Move stock between bins, subinventories, or warehouses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> New Transfer
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading transfers…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>Item</th>
                  <th>From WH</th>
                  <th>To WH</th>
                  <th>Qty</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Processed By</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No transfers yet.</td></tr>
                ) : transfers.map(t => (
                  <tr key={t._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.transferId}</td>
                    <td>{t.item?.name}</td>
                    <td>{t.fromWarehouse?.code}</td>
                    <td>{t.toWarehouse?.code}</td>
                    <td style={{ fontWeight: 600 }}>{t.quantity}</td>
                    <td><span className="badge badge-new">{t.transferType}</span></td>
                    <td><span className={`badge ${t.status === 'Completed' ? 'badge-converted' : 'badge-new'}`}>{t.status}</span></td>
                    <td>{t.processedBy?.firstName} {t.processedBy?.lastName}</td>
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
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 700, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New Stock Transfer</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Move inventory between locations</p>

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
                  <label className="form-label">Quantity *</label>
                  <input className="form-input" type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">From Warehouse *</label>
                  <select className="form-input" value={form.fromWarehouse} onChange={e => setForm(p => ({ ...p, fromWarehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">To Warehouse *</label>
                  <select className="form-input" value={form.toWarehouse} onChange={e => setForm(p => ({ ...p, toWarehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">From Subinventory</label>
                  <input className="form-input" value={form.fromSubinventory} onChange={e => setForm(p => ({ ...p, fromSubinventory: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">From Locator</label>
                  <input className="form-input" value={form.fromLocator} onChange={e => setForm(p => ({ ...p, fromLocator: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">To Subinventory</label>
                  <input className="form-input" value={form.toSubinventory} onChange={e => setForm(p => ({ ...p, toSubinventory: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">To Locator</label>
                  <input className="form-input" value={form.toLocator} onChange={e => setForm(p => ({ ...p, toLocator: e.target.value.toUpperCase() }))} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
