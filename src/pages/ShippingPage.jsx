import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const ShippingPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    orderReference: '', customerName: '', customerRef: '',
    warehouse: '', lines: [{ item: '', quantity: '', uom: 'EA', lotNumber: '', serialNumbers: [] }],
    carrier: '', trackingNumber: '', shippingAddress: {}
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

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getShipments({ limit: 100 });
      setShipments(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const addLine = () => {
    setForm(p => ({
      ...p,
      lines: [...p.lines, { item: '', quantity: '', uom: 'EA', lotNumber: '', serialNumbers: [] }]
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
    if (!form.customerName || !form.warehouse) return setError('Customer name and warehouse are required');

    try {
      await inventoryAPI.createShipment(form);
      setShowForm(false);
      fetchShipments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="teams" size={26} style={{ color: 'var(--accent-primary)' }} />
            Shipping (Goods Issue)
          </h1>
          <p className="page-subtitle">Pick, pack, and ship outbound orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> New Shipment
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading shipments…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Carrier</th>
                  <th>Tracking #</th>
                  <th>Status</th>
                  <th>Shipped At</th>
                </tr>
              </thead>
              <tbody>
                {shipments.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No shipments yet.</td></tr>
                ) : shipments.map(ship => (
                  <tr key={ship._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{ship.shipmentId}</td>
                    <td style={{ fontFamily: 'monospace' }}>{ship.orderReference}</td>
                    <td>{ship.customerName}</td>
                    <td>{ship.carrier || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{ship.trackingNumber || '—'}</td>
                    <td><span className={`badge ${ship.status === 'Shipped' || ship.status === 'Delivered' ? 'badge-converted' : 'badge-new'}`}>{ship.status}</span></td>
                    <td style={{ fontSize: 12 }}>{ship.shippedAt ? new Date(ship.shippedAt).toLocaleDateString() : '—'}</td>
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
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New Shipment</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Outbound shipment / goods issue</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Order Reference</label>
                  <input className="form-input" value={form.orderReference} onChange={e => setForm(p => ({ ...p, orderReference: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Customer Name *</label>
                  <input className="form-input" value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Warehouse *</label>
                  <select className="form-input" value={form.warehouse} onChange={e => setForm(p => ({ ...p, warehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>Shipment Lines</h3>
              {form.lines.map((line, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Item</label>
                    <select className="form-input" value={line.item} onChange={e => updateLine(idx, 'item', e.target.value)}>
                      <option value="">Select item</option>
                      {items.map(it => <option key={it._id} value={it._id}>{it.sku} - {it.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Quantity</label>
                    <input className="form-input" type="number" value={line.quantity} onChange={e => updateLine(idx, 'quantity', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">UoM</label>
                    <input className="form-input" value={line.uom} onChange={e => updateLine(idx, 'uom', e.target.value.toUpperCase())} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Lot Number</label>
                    <input className="form-input" value={line.lotNumber} onChange={e => updateLine(idx, 'lotNumber', e.target.value.toUpperCase())} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addLine}>Add Line</button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create Shipment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingPage;
