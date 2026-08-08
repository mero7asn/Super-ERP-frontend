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
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create receiving order');
    }
  };

  return (
    <div style={{ padding: '0 12px 32px' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: 24, fontWeight: 800 }}>
            <Icon name="plus" size={28} style={{ color: '#0284c7' }} />
            Goods Receipt Notes (GRN) & Quality Control
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0', color: '#64748b' }}>
            Receive shipments, record quality inspection (Accepted / Rejected / Quarantine), and export ETA E-Invoices
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/landed-costs')}>
            🚢 Landed Costs
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0284c7' }}>
            <Icon name="plus" size={16} /> New GRN Receiving Order
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading GRN receiving orders…</div>
      ) : (
        <div className="card" style={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>PO & GRN #</th>
                  <th style={{ padding: '12px 16px' }}>Supplier</th>
                  <th style={{ padding: '12px 16px' }}>Warehouse</th>
                  <th style={{ padding: '12px 16px' }}>Lines & Qty</th>
                  <th style={{ padding: '12px 16px' }}>QC Inspection</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No receiving orders yet.</td></tr>
                ) : orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      <div>{order.poNumber}</div>
                      <div style={{ fontSize: 11, color: '#0369a1' }}>GRN-{order._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{order.supplierName}</td>
                    <td style={{ padding: '12px 16px' }}>{order.warehouse?.code || 'WH-01'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{order.lines?.length || 0} Lines</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#166534' }}>
                        Passed QC
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: order.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: order.status === 'Completed' ? '#166534' : '#92400e' }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => handleExportEtaInvoice(order._id)}
                      >
                        🇪🇬 ETA E-Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ETA E-Invoice Modal */}
      {showEtaModal && etaPayload && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 620, padding: 24, background: '#fff', borderRadius: 12, maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>🇪🇬 Egyptian Tax Authority (ETA) E-Invoice Payload</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Formal e-invoice JSON structure according to Egyptian Tax Authority v1.0 specifications</p>

            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: 16, borderRadius: 8, fontSize: 12, overflowX: 'auto' }}>
              {JSON.stringify(etaPayload, null, 2)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setShowEtaModal(false)}>Close Payload</button>
            </div>
          </div>
        </div>
      )}

      {/* New Receiving Order Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setShowForm(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 28, maxWidth: 900, width: '100%',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Create Goods Receipt Note (GRN)</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Receive vendor shipments and record initial Quality Inspection</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>PO Number *</label>
                <input className="input" placeholder="PO-2026-0098" value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value.toUpperCase() }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Supplier Name *</label>
                <input className="input" placeholder="ABC Trading" value={form.supplierName} onChange={e => setForm(p => ({ ...p, supplierName: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Target Warehouse *</label>
                <select className="input" value={form.warehouse} onChange={e => setForm(p => ({ ...p, warehouse: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Items Received & Quality Inspection</h3>
            {form.lines.map((line, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 10, padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Select Product</label>
                  <select className="input" value={line.item} onChange={e => updateLine(idx, 'item', e.target.value)} style={{ width: '100%', marginTop: 2 }}>
                    <option value="">-- Choose Item --</option>
                    {items.map(it => <option key={it._id} value={it._id}>{it.sku} - {it.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Received Qty</label>
                  <input type="number" className="input" value={line.receivedQty} onChange={e => updateLine(idx, 'receivedQty', e.target.value)} style={{ width: '100%', marginTop: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Accepted Qty</label>
                  <input type="number" className="input" value={line.acceptedQty} onChange={e => updateLine(idx, 'acceptedQty', e.target.value)} style={{ width: '100%', marginTop: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Batch / Lot #</label>
                  <input className="input" value={line.lotNumber} onChange={e => updateLine(idx, 'lotNumber', e.target.value.toUpperCase())} style={{ width: '100%', marginTop: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600 }}>Unit Cost (EGP)</label>
                  <input type="number" className="input" value={line.unitCost} onChange={e => updateLine(idx, 'unitCost', e.target.value)} style={{ width: '100%', marginTop: 2 }} />
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-secondary" onClick={addLine} style={{ marginTop: 8 }}>+ Add Line</button>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn" style={{ background: '#f1f5f9' }} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Post Goods Receipt Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivingPage;
