import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [form, setForm] = useState({
    item: '', quantity: '', unitOfMeasure: 'EA',
    fromWarehouse: '', fromSubinventory: '', fromLocator: '', fromLotNumber: '',
    toWarehouse: '', toSubinventory: '', toLocator: '', toLotNumber: '',
    transferType: 'BIN_TRANSFER', remarks: ''
  });
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);

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
      const { data } = await inventoryAPI.getTransfers({ limit: 100 });
      setTransfers(data.data || []);
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
      const { data } = await inventoryAPI.createTransfer(form);
      if (!data.success) throw new Error(data.message);
      setShowForm(false);
      fetchTransfers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create transfer');
    }
  };

  const tabs = ['All', 'Pending', 'In Transit', 'Received'];
  const filteredTransfers = transfers.filter((transfer) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return transfer.status === 'Pending';
    if (activeTab === 'In Transit') return transfer.status === 'In Transit';
    if (activeTab === 'Received') return transfer.status === 'Completed' || transfer.status === 'Received';
    return true;
  });

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Transfer operations</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Stock transfers</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Move stock between bins, subinventories, or warehouses with clear routing.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> New transfer</button>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pending</div><div style={{ fontSize: 20, fontWeight: 800, color: '#d97706' }}>{transfers.filter((t) => t.status === 'Pending').length}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>In transit</div><div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>{transfers.filter((t) => t.status === 'In Transit').length}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Completed</div><div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>{transfers.filter((t) => t.status === 'Completed' || t.status === 'Received').length}</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #e2e8f0', background: activeTab === tab ? '#0284c7' : '#fff', color: activeTab === tab ? '#fff' : '#475569', fontWeight: 700, cursor: 'pointer' }}>{tab}</button>)}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading transfers…</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filteredTransfers.length === 0 ? <div className="card" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No transfers match this view yet.</div> : filteredTransfers.map((transfer) => (
            <div key={transfer._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{transfer.transferId}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{transfer.item?.name}</div>
                </div>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: transfer.status === 'Completed' || transfer.status === 'Received' ? '#dcfce7' : transfer.status === 'In Transit' ? '#e0f2fe' : '#fef3c7', color: transfer.status === 'Completed' || transfer.status === 'Received' ? '#166534' : transfer.status === 'In Transit' ? '#0369a1' : '#92400e', fontWeight: 700, fontSize: 12 }}>{transfer.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Route</div><div style={{ fontWeight: 700 }}>{transfer.fromWarehouse?.code} → {transfer.toWarehouse?.code}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Quantity</div><div style={{ fontWeight: 700 }}>{transfer.quantity}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Type</div><div style={{ fontWeight: 700 }}>{transfer.transferType}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Requested by</div><div style={{ fontWeight: 700 }}>{transfer.processedBy?.firstName} {transfer.processedBy?.lastName}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 700, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New stock transfer</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Move inventory between locations</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Item *</label>
                  <select className="form-input" value={form.item} onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}>
                    <option value="">Select item</option>
                    {items.map((it) => <option key={it._id} value={it._id}>{it.sku} - {it.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Quantity *</label>
                  <input className="form-input" type="number" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">From Warehouse *</label>
                  <select className="form-input" value={form.fromWarehouse} onChange={(e) => setForm((p) => ({ ...p, fromWarehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">To Warehouse *</label>
                  <select className="form-input" value={form.toWarehouse} onChange={(e) => setForm((p) => ({ ...p, toWarehouse: e.target.value }))}>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">From Subinventory</label>
                  <input className="form-input" value={form.fromSubinventory} onChange={(e) => setForm((p) => ({ ...p, fromSubinventory: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">From Locator</label>
                  <input className="form-input" value={form.fromLocator} onChange={(e) => setForm((p) => ({ ...p, fromLocator: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">To Subinventory</label>
                  <input className="form-input" value={form.toSubinventory} onChange={(e) => setForm((p) => ({ ...p, toSubinventory: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">To Locator</label>
                  <input className="form-input" value={form.toLocator} onChange={(e) => setForm((p) => ({ ...p, toLocator: e.target.value.toUpperCase() }))} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
