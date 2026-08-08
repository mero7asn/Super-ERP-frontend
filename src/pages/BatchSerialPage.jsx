import { useState, useEffect } from 'react';
import API from '../services/api';

const BatchSerialPage = () => {
  const [activeTab, setActiveTab] = useState('batches');
  const [lots, setLots] = useState([]);
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiryFilter, setExpiryFilter] = useState('all');

  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [requiredQty, setRequiredQty] = useState(10);
  const [fefoResult, setFefoResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lotsRes, serialsRes, itemsRes, whRes] = await Promise.all([
        API.get('/inventory/lots'),
        API.get('/inventory/serials'),
        API.get('/inventory/items'),
        API.get('/inventory/warehouses')
      ]);

      if (lotsRes.data.success) setLots(lotsRes.data.data);
      if (serialsRes.data.success) setSerials(serialsRes.data.data);
      if (itemsRes.data.success) setItems(itemsRes.data.data);
      if (whRes.data.success) setWarehouses(whRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunFefo = async () => {
    if (!selectedItem || !selectedWarehouse) return;
    try {
      const res = await API.get(`/inventory/fefo/recommend?item=${selectedItem}&warehouse=${selectedWarehouse}&quantity=${requiredQty}`);
      if (res.data.success) {
        setFefoResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLots = lots.filter((lot) => {
    if (expiryFilter === 'all') return true;
    const expiry = new Date(lot.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (expiryFilter === 'expired') return diffDays < 0;
    if (expiryFilter === '7d') return diffDays >= 0 && diffDays <= 7;
    if (expiryFilter === '30d') return diffDays > 7 && diffDays <= 30;
    if (expiryFilter === '90d') return diffDays > 30 && diffDays <= 90;
    return diffDays > 90;
  });

  const summaryCards = [
    { label: 'Lots on hand', value: lots.length, tone: '#0284c7' },
    { label: 'Serials tracked', value: serials.length, tone: '#7c3aed' },
    { label: 'Expiring soon', value: lots.filter((lot) => {
      const diffDays = Math.ceil((new Date(lot.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length, tone: '#d97706' },
    { label: 'Expired', value: lots.filter((lot) => new Date(lot.expiryDate) < new Date()).length, tone: '#dc2626' }
  ];

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Advanced inventory</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Batch, lot, and serial control</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Monitor expiry risk, lot traceability, and FEFO recommendations from one view.</p>
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

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {['batches', 'serials', 'fefo'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 14px', borderRadius: 999, border: activeTab === tab ? '1px solid #0284c7' : '1px solid #e2e8f0', background: activeTab === tab ? '#eff6ff' : '#fff', color: activeTab === tab ? '#0284c7' : '#475569', fontWeight: 700, cursor: 'pointer' }}>
            {tab === 'batches' ? 'Batches' : tab === 'serials' ? 'Serials' : 'FEFO'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>Loading batches and serials…</div>
      ) : (
        <>
          {activeTab === 'batches' && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Lot and batch watchlist</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['all', 'expired', '7d', '30d', '90d'].map((option) => (
                    <button key={option} onClick={() => setExpiryFilter(option)} style={{ padding: '6px 10px', borderRadius: 999, border: expiryFilter === option ? '1px solid #0284c7' : '1px solid #e2e8f0', background: expiryFilter === option ? '#eff6ff' : '#fff', color: expiryFilter === option ? '#0284c7' : '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {option === 'all' ? 'All' : option === 'expired' ? 'Expired' : `${option}d`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Lot / Batch #</th>
                      <th>Item</th>
                      <th>Warehouse</th>
                      <th>Qty</th>
                      <th>Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLots.length > 0 ? filteredLots.map((lot) => {
                      const diffDays = Math.ceil((new Date(lot.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                      const isExpiring = diffDays >= 0 && diffDays <= 7;
                      const isExpired = diffDays < 0;
                      return (
                        <tr key={lot._id}>
                          <td style={{ fontWeight: 700 }}>{lot.lotNumber}</td>
                          <td>{lot.item?.sku} - {lot.item?.name}</td>
                          <td>{lot.warehouse?.code || 'WH-01'}</td>
                          <td>{lot.quantity} EA</td>
                          <td style={{ color: isExpired ? '#dc2626' : isExpiring ? '#d97706' : '#16a34a', fontWeight: 700 }}>{lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : 'No expiry'}</td>
                          <td><span className={`badge ${lot.status === 'Unrestricted' ? 'badge-converted' : 'badge-danger'}`}>{lot.status}</span></td>
                        </tr>
                      );
                    }) : <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No matching lots found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'serials' && (
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Serial number inventory</h3>
              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Serial</th>
                      <th>Item</th>
                      <th>Warehouse</th>
                      <th>Status</th>
                      <th>Warranty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serials.length > 0 ? serials.map((s) => (
                      <tr key={s._id}>
                        <td style={{ fontWeight: 700, color: '#0369a1' }}>{s.serialNumber}</td>
                        <td>{s.item?.sku} - {s.item?.name}</td>
                        <td>{s.warehouse?.code || 'WH-01'}</td>
                        <td><span className="badge badge-info">{s.status}</span></td>
                        <td>{s.warrantyEndDate ? new Date(s.warrantyEndDate).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No serial numbers tracked.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fefo' && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>FEFO recommendation engine</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end', marginBottom: 20 }}>
                <div>
                  <label className="form-label">Select item</label>
                  <select className="form-input" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
                    <option value="">Choose item</option>
                    {items.map((item) => <option key={item._id} value={item._id}>{item.sku} - {item.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Warehouse</label>
                  <select className="form-input" value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
                    <option value="">Choose warehouse</option>
                    {warehouses.map((warehouse) => <option key={warehouse._id} value={warehouse._id}>{warehouse.code} - {warehouse.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Required quantity</label>
                  <input type="number" className="form-input" value={requiredQty} onChange={(e) => setRequiredQty(Number(e.target.value))} />
                </div>
                <button onClick={handleRunFefo} className="btn btn-primary">Calculate FEFO</button>
              </div>

              {fefoResult && (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700 }}>Recommendation result</span>
                    <span className={`badge ${fefoResult.fulfilled ? 'badge-converted' : 'badge-danger'}`}>{fefoResult.fulfilled ? 'Fully available' : `Shortage ${fefoResult.shortageQty} units`}</span>
                  </div>
                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Lot</th>
                          <th>Expiry</th>
                          <th>Available</th>
                          <th>Recommended pick</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fefoResult.selectedBatches?.map((batch, idx) => (
                          <tr key={idx}>
                            <td>{batch.lotNumber}</td>
                            <td>{new Date(batch.expiryDate).toLocaleDateString()}</td>
                            <td>{batch.availableQty} EA</td>
                            <td>{batch.takeQty} EA</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BatchSerialPage;
