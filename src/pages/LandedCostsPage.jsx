import React, { useState, useEffect } from 'react';
import API from '../services/api';

const LandedCostsPage = () => {
  const [landedCosts, setLandedCosts] = useState([]);
  const [receivingOrders, setReceivingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state for calculation wizard
  const [selectedReceivingOrder, setSelectedReceivingOrder] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [aciNumber, setAciNumber] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [portOfEntry, setPortOfEntry] = useState('Alexandria Port');
  const [billOfLading, setBillOfLading] = useState('');

  // Cost breakdowns (EGP)
  const [freightCost, setFreightCost] = useState(35000);
  const [insuranceCost, setInsuranceCost] = useState(5000);
  const [customsCost, setCustomsCost] = useState(80000);
  const [handlingCost, setHandlingCost] = useState(10000);
  const [transportCost, setTransportCost] = useState(15000);
  const [allocationMethod, setAllocationMethod] = useState('By Value');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lcRes, rcRes] = await Promise.all([
        API.get('/inventory/landed-costs'),
        API.get('/inventory/receiving-orders')
      ]);

      if (lcRes.data.success) setLandedCosts(lcRes.data.data);
      if (rcRes.data.success) setReceivingOrders(rcRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateLandedCost = async (e) => {
    e.preventDefault();
    if (!selectedReceivingOrder) return;

    try {
      const payload = {
        receivingOrder: selectedReceivingOrder,
        supplierName,
        aciNumber,
        hsCode,
        portOfEntry,
        billOfLading,
        allocationMethod,
        costs: {
          freightCost: Number(freightCost) || 0,
          insuranceCost: Number(insuranceCost) || 0,
          customsCost: Number(customsCost) || 0,
          handlingCost: Number(handlingCost) || 0,
          inlandTransportCost: Number(transportCost) || 0
        }
      };

      const res = await API.post('/inventory/landed-costs', payload);
      if (res.data.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#0f172a' }}>🇪🇬 Import Purchasing & Landed Cost Calculator</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            Egyptian customs ACI tracking, HS Codes, port clearance, and landed cost allocations (Freight + Customs + Insurance)
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          + Calculate Landed Cost Shipment
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center' }}>Loading Import Landed Costs...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Landed Cost #</th>
                <th style={{ padding: '12px 16px' }}>Supplier / Origin</th>
                <th style={{ padding: '12px 16px' }}>ACI Number & HS Code</th>
                <th style={{ padding: '12px 16px' }}>Port & B/L</th>
                <th style={{ padding: '12px 16px' }}>Total Costs (EGP)</th>
                <th style={{ padding: '12px 16px' }}>Allocation Method</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {landedCosts.length > 0 ? (
                landedCosts.map((lc) => {
                  const extraSum = (lc.costs?.freightCost || 0) + (lc.costs?.customsCost || 0) + (lc.costs?.insuranceCost || 0) + (lc.costs?.handlingCost || 0) + (lc.costs?.inlandTransportCost || 0);
                  return (
                    <tr key={lc._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{lc.landedCostNumber}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{lc.supplierName || 'Overseas Supplier'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{lc.originCountry || 'Import'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>ACI: {lc.aciNumber || 'ACI-2026-9941'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>HS Code: {lc.hsCode || '6109.10.00'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{lc.portOfEntry}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>B/L: {lc.billOfLading || 'BL-881249'}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        <div>EGP {lc.totalLandedCost?.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 600 }}>+EGP {extraSum.toLocaleString()} Expenses</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#f1f5f9' }}>
                          {lc.allocationMethod}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#166534' }}>
                          {lc.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No import landed costs recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Calculation Wizard */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 600, maxWidth: '95%', padding: 24, background: '#fff', borderRadius: 12, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', borderBottom: '1px solid #e2e8f0', pb: 8 }}>🚢 Landed Cost & Customs Allocation Wizard</h3>
            <form onSubmit={handleCalculateLandedCost}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Select Goods Receipt Note (GRN)</label>
                <select className="input" value={selectedReceivingOrder} onChange={e => setSelectedReceivingOrder(e.target.value)} required style={{ width: '100%', marginTop: 4 }}>
                  <option value="">-- Choose GRN --</option>
                  {receivingOrders.map(r => <option key={r._id} value={r._id}>{r.receivingId} - {r.supplierName} ({r.poNumber})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>ACI Number (Egyptian Customs)</label>
                  <input type="text" className="input" placeholder="e.g. ACI-489102" value={aciNumber} onChange={e => setAciNumber(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>HS Code</label>
                  <input type="text" className="input" placeholder="e.g. 6109.10.00" value={hsCode} onChange={e => setHsCode(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Port of Entry</label>
                  <input type="text" className="input" value={portOfEntry} onChange={e => setPortOfEntry(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Bill of Lading (B/L)</label>
                  <input type="text" className="input" placeholder="e.g. BL-90812" value={billOfLading} onChange={e => setBillOfLading(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
              </div>

              <h4 style={{ margin: '16px 0 8px', fontSize: 14, color: '#0369a1' }}>Expenses Breakdown (EGP)</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Shipping / Freight</label>
                  <input type="number" className="input" value={freightCost} onChange={e => setFreightCost(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Marine Insurance</label>
                  <input type="number" className="input" value={insuranceCost} onChange={e => setInsuranceCost(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Egyptian Customs Duties</label>
                  <input type="number" className="input" value={customsCost} onChange={e => setCustomsCost(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Port Handling & Clearance</label>
                  <input type="number" className="input" value={handlingCost} onChange={e => setHandlingCost(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Inland Transportation to Warehouse</label>
                <input type="number" className="input" value={transportCost} onChange={e => setTransportCost(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Allocation Strategy</label>
                <select className="input" value={allocationMethod} onChange={e => setAllocationMethod(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                  <option value="By Value">By Item Monetary Value Ratio</option>
                  <option value="By Quantity">By Item Quantity Ratio</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ padding: '8px 16px', background: '#f1f5f9' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Calculate & Allocate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandedCostsPage;
