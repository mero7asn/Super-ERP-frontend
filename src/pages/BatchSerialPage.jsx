import React, { useState, useEffect } from 'react';
import API from '../services/api';

const BatchSerialPage = () => {
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'serials' | 'fefo'
  const [lots, setLots] = useState([]);
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);

  // FEFO Recommender State
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

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#0f172a' }}>📦 Batch / Lot & Serial Number Management</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          Track production batches, expiration timelines, FEFO picking rules, and full serial number lifecycle history
        </p>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('batches')}
          style={{
            padding: '10px 20px', border: 'none', borderBottom: activeTab === 'batches' ? '3px solid #0284c7' : 'none',
            background: 'none', fontWeight: 600, color: activeTab === 'batches' ? '#0284c7' : '#64748b', cursor: 'pointer'
          }}
        >
          🏷️ Batches & Expiry Lots ({lots.length})
        </button>
        <button
          onClick={() => setActiveTab('serials')}
          style={{
            padding: '10px 20px', border: 'none', borderBottom: activeTab === 'serials' ? '3px solid #0284c7' : 'none',
            background: 'none', fontWeight: 600, color: activeTab === 'serials' ? '#0284c7' : '#64748b', cursor: 'pointer'
          }}
        >
          🔢 Serial Numbers ({serials.length})
        </button>
        <button
          onClick={() => setActiveTab('fefo')}
          style={{
            padding: '10px 20px', border: 'none', borderBottom: activeTab === 'fefo' ? '3px solid #0284c7' : 'none',
            background: 'none', fontWeight: 600, color: activeTab === 'fefo' ? '#0284c7' : '#64748b', cursor: 'pointer'
          }}
        >
          ⚡ FEFO Recommendation Engine
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center' }}>Loading Batches & Serials...</div>
      ) : (
        <>
          {/* TAB 1: BATCHES */}
          {activeTab === 'batches' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Lot / Batch #</th>
                    <th style={{ padding: '12px 16px' }}>Item SKU & Name</th>
                    <th style={{ padding: '12px 16px' }}>Warehouse</th>
                    <th style={{ padding: '12px 16px' }}>Quantity</th>
                    <th style={{ padding: '12px 16px' }}>Mfg Date</th>
                    <th style={{ padding: '12px 16px' }}>Expiry Date</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.length > 0 ? (
                    lots.map((lot) => {
                      const isExpired = new Date(lot.expiryDate) < new Date();
                      return (
                        <tr key={lot._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{lot.lotNumber}</td>
                          <td style={{ padding: '12px 16px' }}>{lot.item?.sku} - {lot.item?.name}</td>
                          <td style={{ padding: '12px 16px' }}>{lot.warehouse?.code || 'WH-01'}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>{lot.quantity} EA</td>
                          <td style={{ padding: '12px 16px' }}>{lot.manufactureDate ? new Date(lot.manufactureDate).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ padding: '12px 16px', color: isExpired ? '#dc2626' : '#15803d', fontWeight: 600 }}>
                            {lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : 'No Expiry'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                              background: lot.status === 'Unrestricted' ? '#dcfce7' : '#fee2e2',
                              color: lot.status === 'Unrestricted' ? '#166534' : '#991b1b'
                            }}>
                              {lot.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No lots found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: SERIAL NUMBERS */}
          {activeTab === 'serials' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Serial Number</th>
                    <th style={{ padding: '12px 16px' }}>Item</th>
                    <th style={{ padding: '12px 16px' }}>Warehouse</th>
                    <th style={{ padding: '12px 16px' }}>Current Status</th>
                    <th style={{ padding: '12px 16px' }}>Warranty Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {serials.length > 0 ? (
                    serials.map((s) => (
                      <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{s.serialNumber}</td>
                        <td style={{ padding: '12px 16px' }}>{s.item?.sku} - {s.item?.name}</td>
                        <td style={{ padding: '12px 16px' }}>{s.warehouse?.code || 'WH-01'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{s.warrantyEndDate ? new Date(s.warrantyEndDate).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No serial numbers tracked</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: FEFO RECOMMENDER */}
          {activeTab === 'fefo' && (
            <div className="card" style={{ padding: 24, background: '#fff' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>⚡ First-Expired → First-Out (FEFO) Auto Picker</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end', marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Select Product Item</label>
                  <select className="input" value={selectedItem} onChange={e => setSelectedItem(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                    <option value="">-- Choose Item --</option>
                    {items.map(i => <option key={i._id} value={i._id}>{i.sku} - {i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Select Warehouse</label>
                  <select className="input" value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                    <option value="">-- Choose Warehouse --</option>
                    {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Required Quantity</label>
                  <input type="number" className="input" value={requiredQty} onChange={e => setRequiredQty(Number(e.target.value))} style={{ width: '100%', marginTop: 4 }} />
                </div>
                <button onClick={handleRunFefo} className="btn btn-primary" style={{ padding: '10px 20px' }}>Calculate FEFO</button>
              </div>

              {fefoResult && (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Recommendation Result</span>
                    <span style={{
                      padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                      background: fefoResult.fulfilled ? '#dcfce7' : '#fee2e2',
                      color: fefoResult.fulfilled ? '#15803d' : '#b91c1c'
                    }}>
                      {fefoResult.fulfilled ? '✅ Fully Available' : `⚠️ Shortage of ${fefoResult.shortageQty} units`}
                    </span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead style={{ background: '#e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '8px 12px' }}>Lot #</th>
                        <th style={{ padding: '8px 12px' }}>Expiry Date</th>
                        <th style={{ padding: '8px 12px' }}>Lot Available</th>
                        <th style={{ padding: '8px 12px' }}>Recommended Pick Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fefoResult.selectedBatches?.map((b, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{b.lotNumber}</td>
                          <td style={{ padding: '8px 12px', color: '#b91c1c', fontWeight: 600 }}>{new Date(b.expiryDate).toLocaleDateString()}</td>
                          <td style={{ padding: '8px 12px' }}>{b.availableQty} EA</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0369a1' }}>Pick {b.takeQty} EA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
