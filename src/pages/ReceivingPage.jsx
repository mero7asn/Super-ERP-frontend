import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const ReceivingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    poNumber: '', supplierName: '', supplierRef: '', asnNumber: '',
    warehouse: '', subinventory: 'RECEIVING',
    lines: [{ item: '', expectedQty: '', receivedQty: '', acceptedQty: '', rejectedQty: '', uom: 'EA', lotNumber: '', unitCost: '', qualityStatus: 'Pending', damageNotes: '', suggestedLocator: '', actualLocator: '', overrideReason: '' }]
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getReceivingOrders({ limit: 100 });
      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const addLine = () => {
    setForm(p => ({
      ...p,
      lines: [...p.lines, { item: '', expectedQty: '', receivedQty: '', acceptedQty: '', rejectedQty: '', uom: 'EA', lotNumber: '', unitCost: '', qualityStatus: 'Pending', damageNotes: '', suggestedLocator: '', actualLocator: '', overrideReason: '' }]
    }));
  };

  const updateLine = (idx, field, value) => {
    setForm(p => ({
      ...p,
      lines: p.lines.map((line, i) => i === idx ? { ...line, [field]: value } : line)
    }));
  };

  const handleCreate = async () => {
    setError('');
    if (!form.poNumber || !form.supplierName || !form.warehouse) return setError('PO Number, Supplier, and Warehouse are required');

    try {
      await inventoryAPI.createReceivingOrder(form);
      setShowForm(false);
      setForm({
        poNumber: '', supplierName: '', supplierRef: '', asnNumber: '',
        warehouse: '', subinventory: 'RECEIVING',
        lines: [{ item: '', expectedQty: '', receivedQty: '', acceptedQty: '', rejectedQty: '', uom: 'EA', lotNumber: '', unitCost: '', qualityStatus: 'Pending', damageNotes: '', suggestedLocator: '', actualLocator: '', overrideReason: '' }]
      });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create receiving order');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="plus" size={26} style={{ color: 'var(--accent-primary)' }} />
            Receiving (Goods Receipt)
          </h1>
          <p className="page-subtitle">Receive, inspect, and put away incoming goods</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> New Receiving Order
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading receiving orders…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>ASN</th>
                  <th>Warehouse</th>
                  <th>Lines</th>
                  <th>Status</th>
                  <th>Received At</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No receiving orders yet.</td></tr>
                ) : orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.poNumber}</td>
                    <td>{order.supplierName}</td>
                    <td style={{ fontFamily: 'monospace' }}>{order.asnNumber || '—'}</td>
                    <td>{order.warehouse?.code}</td>
                    <td>{order.lines?.length || 0}</td>
                    <td><span className={`badge ${order.status === 'Completed' ? 'badge-converted' : 'badge-new'}`}>{order.status}</span></td>
                    <td style={{ fontSize: 12 }}>{order.receivedAt ? new Date(order.receivedAt).toLocaleDateString() : '—'}</td>
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
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 900, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New Receiving Order</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Goods receipt for incoming PO</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">PO Number *</label>
                  <input className="form-input" placeholder="PO-12345" value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Supplier Name *</label>
                  <input className="form-input" placeholder="Supplier" value={form.supplierName} onChange={e => setForm(p => ({ ...p, supplierName: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Warehouse *</label>
                  <select className="form-input" value={form.warehouse} onChange={e => setForm(p => ({ ...p, warehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Supplier Ref</label>
                  <input className="form-input" placeholder="Supplier reference" value={form.supplierRef} onChange={e => setForm(p => ({ ...p, supplierRef: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">ASN Number</label>
                  <input className="form-input" placeholder="ASN-12345" value={form.asnNumber} onChange={e => setForm(p => ({ ...p, asnNumber: e.target.value.toUpperCase() }))} />
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>Receiving Lines</h3>
              {form.lines.map((line, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 12, padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Item</label>
                    <select className="form-input" value={line.item} onChange={e => updateLine(idx, 'item', e.target.value)}>
                      <option value="">Select item</option>
                      {items.map(it => <option key={it._id} value={it._id}>{it.sku} - {it.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Expected Qty</label>
                    <input className="form-input" type="number" value={line.expectedQty} onChange={e => updateLine(idx, 'expectedQty', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Received Qty</label>
                    <input className="form-input" type="number" value={line.receivedQty} onChange={e => updateLine(idx, 'receivedQty', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Accepted Qty</label>
                    <input className="form-input" type="number" value={line.acceptedQty} onChange={e => updateLine(idx, 'acceptedQty', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Lot Number</label>
                    <input className="form-input" value={line.lotNumber} onChange={e => updateLine(idx, 'lotNumber', e.target.value.toUpperCase())} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Unit Cost</label>
                    <input className="form-input" type="number" step="0.01" value={line.unitCost} onChange={e => updateLine(idx, 'unitCost', e.target.value)} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addLine}>Add Line</button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create Receiving Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivingPage;
