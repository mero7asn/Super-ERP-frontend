import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const ShippingPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
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
    setForm((p) => ({
      ...p,
      lines: [...p.lines, { item: '', quantity: '', uom: 'EA', lotNumber: '', serialNumbers: [] }]
    }));
  };

  const updateLine = (idx, field, value) => {
    setForm((p) => ({
      ...p,
      lines: p.lines.map((line, i) => (i === idx ? { ...line, [field]: value } : line))
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

  const tabs = ['All', 'Picked', 'Packed', 'Dispatched', 'Delivered'];
  const filteredShipments = shipments.filter((ship) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Picked') return ship.status === 'Picked';
    if (activeTab === 'Packed') return ship.status === 'Packed';
    if (activeTab === 'Dispatched') return ship.status === 'Dispatched';
    if (activeTab === 'Delivered') return ship.status === 'Delivered';
    return true;
  });

  const getStatusTone = (status) => {
    if (status === 'Delivered') return { bg: '#dcfce7', color: '#166534' };
    if (status === 'Dispatched' || status === 'Packed') return { bg: '#ede9fe', color: '#7c3aed' };
    if (status === 'Picked') return { bg: '#fef3c7', color: '#92400e' };
    return { bg: '#e2e8f0', color: '#334155' };
  };

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Shipping operations</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Shipping & goods issue</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Keep outbound orders moving with clear dispatch stages and carrier visibility.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> New shipment</button>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Open shipments</div><div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>{shipments.length}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Dispatched</div><div style={{ fontSize: 20, fontWeight: 800, color: '#7c3aed' }}>{shipments.filter((s) => s.status === 'Dispatched').length}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Delivered</div><div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>{shipments.filter((s) => s.status === 'Delivered').length}</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #e2e8f0', background: activeTab === tab ? '#0284c7' : '#fff', color: activeTab === tab ? '#fff' : '#475569', fontWeight: 700, cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading shipments…</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filteredShipments.length === 0 ? <div className="card" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No shipments match this view yet.</div> : filteredShipments.map((ship) => {
            const tone = getStatusTone(ship.status);
            return (
              <div key={ship._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{ship.orderReference || ship.shipmentId}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{ship.customerName}</div>
                  </div>
                  <span style={{ padding: '6px 10px', borderRadius: 999, background: tone.bg, color: tone.color, fontWeight: 700, fontSize: 12 }}>{ship.status || 'Pending'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 12 }}>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Carrier</div><div style={{ fontWeight: 700 }}>{ship.carrier || '—'}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tracking</div><div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{ship.trackingNumber || '—'}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Warehouse</div><div style={{ fontWeight: 700 }}>{ship.warehouse?.code || '—'}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Lines</div><div style={{ fontWeight: 700 }}>{ship.lines?.length || 0}</div></div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}><span>Dispatch progress</span><span>{['Picked', 'Packed', 'Dispatched', 'Delivered'].indexOf(ship.status) + 1}/4</span></div>
                  <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ width: `${Math.min(100, ((['Picked', 'Packed', 'Dispatched', 'Delivered'].indexOf(ship.status) + 1) / 4) * 100)}%`, height: '100%', background: '#0284c7', borderRadius: 999 }} /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 900, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New shipment</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Outbound shipment / goods issue</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Order Reference</label>
                  <input className="form-input" value={form.orderReference} onChange={(e) => setForm((p) => ({ ...p, orderReference: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Customer Name *</label>
                  <input className="form-input" value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Warehouse *</label>
                  <select className="form-input" value={form.warehouse} onChange={(e) => setForm((p) => ({ ...p, warehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>Shipment lines</h3>
              {form.lines.map((line, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Item</label>
                    <select className="form-input" value={line.item} onChange={(e) => updateLine(idx, 'item', e.target.value)}>
                      <option value="">Select item</option>
                      {items.map((it) => <option key={it._id} value={it._id}>{it.sku} - {it.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Quantity</label>
                    <input className="form-input" type="number" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">UoM</label>
                    <input className="form-input" value={line.uom} onChange={(e) => updateLine(idx, 'uom', e.target.value.toUpperCase())} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Lot Number</label>
                    <input className="form-input" value={line.lotNumber} onChange={(e) => updateLine(idx, 'lotNumber', e.target.value.toUpperCase())} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addLine}>Add line</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create shipment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingPage;
