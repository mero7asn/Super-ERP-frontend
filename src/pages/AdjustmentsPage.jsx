import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const AdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [form, setForm] = useState({
    item: '', warehouse: '', subinventory: '', locator: '',
    lotNumber: '', serialNumber: '', systemQuantity: '', countedQuantity: '',
    unitCost: '', reasonCode: 'SHORTAGE', reasonDescription: '', glAccount: '', costCenter: '', remarks: ''
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

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getAdjustments({ limit: 100 });
      setAdjustments(data.data || []);
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

      const { data } = await inventoryAPI.createAdjustment({
        ...form,
        adjustmentId: `ADJ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        varianceQuantity: variance,
        varianceValue,
        status: 'Pending'
      });

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

  const tabs = ['All', 'Pending', 'Approved', 'Posted'];
  const filteredAdjustments = adjustments.filter((adj) => {
    if (activeTab === 'All') return true;
    return adj.status === activeTab;
  });

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Adjustment workflow</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Inventory adjustments</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Track physical count variance, approval state, and net stock impact.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> New adjustment</button>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pending</div><div style={{ fontSize: 20, fontWeight: 800, color: '#d97706' }}>{adjustments.filter((adj) => adj.status === 'Pending').length}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Approved</div><div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>{adjustments.filter((adj) => adj.status === 'Approved').length}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Posted</div><div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>{adjustments.filter((adj) => adj.status === 'Posted').length}</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #e2e8f0', background: activeTab === tab ? '#0284c7' : '#fff', color: activeTab === tab ? '#fff' : '#475569', fontWeight: 700, cursor: 'pointer' }}>{tab}</button>)}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading adjustments…</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filteredAdjustments.length === 0 ? <div className="card" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No adjustments match this view yet.</div> : filteredAdjustments.map((adj) => (
            <div key={adj._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{adj.adjustmentId}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{adj.item?.name}</div>
                </div>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: adj.status === 'Posted' ? '#dcfce7' : adj.status === 'Approved' ? '#e0f2fe' : '#fef3c7', color: adj.status === 'Posted' ? '#166534' : adj.status === 'Approved' ? '#0369a1' : '#92400e', fontWeight: 700, fontSize: 12 }}>{adj.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 12 }}>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Warehouse</div><div style={{ fontWeight: 700 }}>{adj.warehouse?.code}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>System qty</div><div style={{ fontWeight: 700 }}>{adj.systemQuantity}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Counted qty</div><div style={{ fontWeight: 700 }}>{adj.countedQuantity}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Variance</div><div style={{ fontWeight: 700, color: (adj.varianceQuantity || 0) > 0 ? '#16a34a' : '#dc2626' }}>{(adj.varianceQuantity || 0) > 0 ? '+' : ''}{adj.varianceQuantity || 0}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <span className="badge badge-new">{adj.reasonCode}</span>
                {adj.status === 'Pending' && <button className="btn btn-secondary btn-sm" onClick={() => handleApprove(adj._id)}>Approve</button>}
                {adj.status === 'Approved' && <button className="btn btn-primary btn-sm" onClick={() => handlePost(adj._id)}>Post</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 600, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New inventory adjustment</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Record variance and request approval</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Item *</label><select className="form-input" value={form.item} onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}><option value="">Select item</option>{items.map((it) => <option key={it._id} value={it._id}>{it.sku} - {it.name}</option>)}</select></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Warehouse *</label><select className="form-input" value={form.warehouse} onChange={(e) => setForm((p) => ({ ...p, warehouse: e.target.value }))}><option value="">Select warehouse</option>{warehouses.map((w) => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}</select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">System Qty *</label><input className="form-input" type="number" value={form.systemQuantity} onChange={(e) => setForm((p) => ({ ...p, systemQuantity: e.target.value }))} /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Counted Qty *</label><input className="form-input" type="number" value={form.countedQuantity} onChange={(e) => setForm((p) => ({ ...p, countedQuantity: e.target.value }))} /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Unit Cost</label><input className="form-input" type="number" step="0.01" value={form.unitCost} onChange={(e) => setForm((p) => ({ ...p, unitCost: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Reason Code *</label><select className="form-input" value={form.reasonCode} onChange={(e) => setForm((p) => ({ ...p, reasonCode: e.target.value }))}><option value="DAMAGE">Damage</option><option value="THEFT">Theft</option><option value="OBSOLETE">Obsolete</option><option value="DATA_ENTRY_ERROR">Data Entry Error</option><option value="OVERAGE">Overage</option><option value="SHORTAGE">Shortage</option><option value="OTHER">Other</option></select></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">GL Account</label><input className="form-input" placeholder="GL-XXXXX" value={form.glAccount} onChange={(e) => setForm((p) => ({ ...p, glAccount: e.target.value }))} /></div>
              </div>
              <div className="form-group" style={{ margin: 0 }}><label className="form-label">Remarks</label><textarea className="form-input" rows="2" value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate}>Create adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentsPage;
