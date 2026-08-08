import { useState, useEffect } from 'react';
import API from '../services/api';
import { Icon } from '../components/Icons';

const LandedCostsPage = () => {
  const [landedCosts, setLandedCosts] = useState([]);
  const [receivingOrders, setReceivingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [selectedReceivingOrder, setSelectedReceivingOrder] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [aciNumber, setAciNumber] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [portOfEntry, setPortOfEntry] = useState('Alexandria Port');
  const [billOfLading, setBillOfLading] = useState('');

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

  const summaryCards = [
    { label: 'Total shipments', value: landedCosts.length, tone: '#0284c7' },
    { label: 'Customs cleared', value: landedCosts.filter((lc) => lc.status === 'Cleared').length, tone: '#16a34a' },
    { label: 'Pending', value: landedCosts.filter((lc) => lc.status !== 'Cleared').length, tone: '#d97706' },
    { label: 'Allocated', value: landedCosts.filter((lc) => lc.allocationMethod).length, tone: '#7c3aed' }
  ];

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Import controls</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Landed costs</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Track customs, freight, and allocation strategy for imported inventory.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> Calculate landed cost</button>
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

      {loading ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>Loading landed costs…</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {landedCosts.length > 0 ? landedCosts.map((lc) => {
            const extraSum = (lc.costs?.freightCost || 0) + (lc.costs?.customsCost || 0) + (lc.costs?.insuranceCost || 0) + (lc.costs?.handlingCost || 0) + (lc.costs?.inlandTransportCost || 0);
            return (
              <div key={lc._id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{lc.landedCostNumber}</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{lc.supplierName || 'Overseas supplier'}</div>
                  </div>
                  <span className={`badge ${lc.status === 'Cleared' ? 'badge-converted' : 'badge-warning'}`}>{lc.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>ACI / HS</div><div style={{ fontWeight: 700 }}>{lc.aciNumber || 'ACI-2026-9941'} / {lc.hsCode || '6109.10.00'}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Port / BL</div><div style={{ fontWeight: 700 }}>{lc.portOfEntry} / {lc.billOfLading || 'BL-881249'}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total landed cost</div><div style={{ fontWeight: 700, color: '#0284c7' }}>EGP {lc.totalLandedCost?.toLocaleString()}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Allocation</div><div style={{ fontWeight: 700 }}>{lc.allocationMethod}</div></div>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>Additional costs: EGP {extraSum.toLocaleString()}</div>
              </div>
            );
          }) : <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No import landed costs recorded.</div>}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 600, maxWidth: '95%', padding: 24, background: '#fff', borderRadius: 12, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>Landed cost wizard</h3>
            <form onSubmit={handleCalculateLandedCost}>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Select receiving order</label>
                <select className="form-input" value={selectedReceivingOrder} onChange={(e) => setSelectedReceivingOrder(e.target.value)} required>
                  <option value="">Choose GRN</option>
                  {receivingOrders.map((r) => <option key={r._id} value={r._id}>{r.receivingId} - {r.supplierName} ({r.poNumber})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">ACI number</label><input type="text" className="form-input" value={aciNumber} onChange={(e) => setAciNumber(e.target.value)} /></div>
                <div><label className="form-label">HS code</label><input type="text" className="form-input" value={hsCode} onChange={(e) => setHsCode(e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Port of entry</label><input type="text" className="form-input" value={portOfEntry} onChange={(e) => setPortOfEntry(e.target.value)} /></div>
                <div><label className="form-label">Bill of lading</label><input type="text" className="form-input" value={billOfLading} onChange={(e) => setBillOfLading(e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label className="form-label">Freight</label><input type="number" className="form-input" value={freightCost} onChange={(e) => setFreightCost(e.target.value)} /></div>
                <div><label className="form-label">Insurance</label><input type="number" className="form-input" value={insuranceCost} onChange={(e) => setInsuranceCost(e.target.value)} /></div>
                <div><label className="form-label">Customs</label><input type="number" className="form-input" value={customsCost} onChange={(e) => setCustomsCost(e.target.value)} /></div>
                <div><label className="form-label">Handling</label><input type="number" className="form-input" value={handlingCost} onChange={(e) => setHandlingCost(e.target.value)} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Inland transport</label>
                <input type="number" className="form-input" value={transportCost} onChange={(e) => setTransportCost(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Calculate & allocate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandedCostsPage;
