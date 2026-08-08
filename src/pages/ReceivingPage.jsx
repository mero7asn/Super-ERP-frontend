import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const ReceivingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEtaModal, setShowEtaModal] = useState(false);
  const [etaPayload, setEtaPayload] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');

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

  const handleExportEtaInvoice = async (orderId) => {
    try {
      const res = await API.get(`/inventory/e-invoice/export/${orderId}`);
      if (res.data.success) {
        setEtaPayload(res.data.etaPayload);
        setShowEtaModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addLine = () => {
    setForm((p) => ({
      ...p,
      lines: [...p.lines, { item: '', expectedQty: '', receivedQty: '', acceptedQty: '', rejectedQty: '', uom: 'EA', lotNumber: '', unitCost: '', qualityStatus: 'Pending', damageNotes: '', suggestedLocator: '', actualLocator: '', overrideReason: '' }]
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
    if (!form.poNumber || !form.supplierName || !form.warehouse) return setError('PO Number, Supplier, and Warehouse are required');

    try {
      await inventoryAPI.createReceivingOrder(form);
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create receiving order');
    }
  };

  const summarizeOrder = (order) => {
    const expectedQty = order.lines?.reduce((sum, line) => sum + Number(line.expectedQty || 0), 0) || 0;
    const receivedQty = order.lines?.reduce((sum, line) => sum + Number(line.receivedQty || 0), 0) || 0;
    const percent = expectedQty ? Math.round((receivedQty / expectedQty) * 100) : 0;
    const statusLabel = order.status === 'Completed' ? 'Complete' : percent > 70 ? 'Partially received' : 'Pending';
    return { expectedQty, receivedQty, percent, statusLabel };
  };

  const tabs = ['Pending', 'Partially Received', 'Quality Check', 'Putaway', 'Complete', 'All'];
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'All') return true;
    const { statusLabel } = summarizeOrder(order);
    if (activeTab === 'Pending') return statusLabel === 'Pending';
    if (activeTab === 'Partially Received') return statusLabel === 'Partially received';
    if (activeTab === 'Quality Check') return order.status === 'Quality Check';
    if (activeTab === 'Putaway') return order.status === 'Putaway';
    if (activeTab === 'Complete') return order.status === 'Completed';
    return true;
  });

  const summaryCards = [
    { label: 'Pending', value: orders.filter((order) => summarizeOrder(order).statusLabel === 'Pending').length, tone: '#d97706' },
    { label: 'Partially received', value: orders.filter((order) => summarizeOrder(order).statusLabel === 'Partially received').length, tone: '#0284c7' },
    { label: 'Quality check', value: orders.filter((order) => order.status === 'Quality Check').length, tone: '#7c3aed' },
    { label: 'Complete', value: orders.filter((order) => order.status === 'Completed').length, tone: '#16a34a' }
  ];

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Receiving operations</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Goods receipt notes & quality control</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Track inbound flow, inspection status, and putaway readiness with a clearer warehouse workflow.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/inventory/landed-costs')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Landed costs</button>
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> New GRN</button>
          </div>
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

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #e2e8f0', background: activeTab === tab ? '#0284c7' : '#fff', color: activeTab === tab ? '#fff' : '#475569', fontWeight: 700, cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading GRN receiving orders…</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filteredOrders.length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No receiving orders match this view yet.</div>
          ) : filteredOrders.map((order) => {
            const { expectedQty, receivedQty, percent, statusLabel } = summarizeOrder(order);
            return (
              <div key={order._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{order.poNumber}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{order.supplierName}</div>
                  </div>
                  <span style={{ padding: '6px 10px', borderRadius: 999, background: order.status === 'Completed' ? '#dcfce7' : order.status === 'Quality Check' ? '#ede9fe' : '#fef3c7', color: order.status === 'Completed' ? '#166534' : order.status === 'Quality Check' ? '#7c3aed' : '#92400e', fontWeight: 700, fontSize: 12 }}>{order.status || statusLabel}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 12 }}>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Warehouse</div><div style={{ fontWeight: 700 }}>{order.warehouse?.code || 'WH-01'}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Lines</div><div style={{ fontWeight: 700 }}>{order.lines?.length || 0}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Expected</div><div style={{ fontWeight: 700 }}>{expectedQty}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Received</div><div style={{ fontWeight: 700, color: '#0284c7' }}>{receivedQty}</div></div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}><span>Inbound progress</span><span>{percent}%</span></div>
                  <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ width: `${percent}%`, height: '100%', background: percent > 80 ? '#16a34a' : percent > 40 ? '#f59e0b' : '#0284c7', borderRadius: 999 }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm">Quality review</button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleExportEtaInvoice(order._id)}>ETA E-Invoice</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>Putaway suggestion</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showEtaModal && etaPayload && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 620, padding: 24, background: '#fff', borderRadius: 12, maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Egyptian Tax Authority (ETA) e-invoice payload</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Formal invoice JSON structure according to ETA v1.0.</p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: 16, borderRadius: 8, fontSize: 12, overflowX: 'auto' }}>{JSON.stringify(etaPayload, null, 2)}</pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setShowEtaModal(false)}>Close payload</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 900, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Create goods receipt note (GRN)</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Receive vendor shipments and record initial quality inspection.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>PO Number *</label>
                <input className="input" placeholder="PO-2026-0098" value={form.poNumber} onChange={(e) => setForm((p) => ({ ...p, poNumber: e.target.value.toUpperCase() }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Supplier Name *</label>
                <input className="input" placeholder="ABC Trading" value={form.supplierName} onChange={(e) => setForm((p) => ({ ...p, supplierName: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Target Warehouse *</label>
                <select className="input" value={form.warehouse} onChange={(e) => setForm((p) => ({ ...p, warehouse: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map((w) => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                </select>
              </div>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Items received & quality inspection</h3>
            {form.lines.map((line, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 10, padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Select Product</label>
                  <select className="input" value={line.item} onChange={(e) => updateLine(idx, 'item', e.target.value)} style={{ width: '100%', marginTop: 2 }}>
                    <option value="">-- Choose Item --</option>
                    {items.map((it) => <option key={it._id} value={it._id}>{it.sku} - {it.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Received Qty</label>
                  <input type="number" className="input" value={line.receivedQty} onChange={(e) => updateLine(idx, 'receivedQty', e.target.value)} style={{ width: '100%', marginTop: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Accepted Qty</label>
                  <input type="number" className="input" value={line.acceptedQty} onChange={(e) => updateLine(idx, 'acceptedQty', e.target.value)} style={{ width: '100%', marginTop: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Batch / Lot #</label>
                  <input className="input" value={line.lotNumber} onChange={(e) => updateLine(idx, 'lotNumber', e.target.value.toUpperCase())} style={{ width: '100%', marginTop: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Unit Cost (EGP)</label>
                  <input type="number" className="input" value={line.unitCost} onChange={(e) => updateLine(idx, 'unitCost', e.target.value)} style={{ width: '100%', marginTop: 2 }} />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addLine} style={{ marginTop: 8 }}>+ Add Line</button>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn" style={{ background: '#f1f5f9' }} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Post goods receipt note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivingPage;            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivingPage;
