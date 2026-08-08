import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Icon } from '../components/Icons';

const SupplyChainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const segment = location.pathname.split('/').filter(Boolean).pop() || 'overview';

  const [activeSegment, setActiveSegment] = useState('overview');
  const [kpis, setKpis] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [imports, setImports] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [supplyGaps, setSupplyGaps] = useState([]);
  const [comparisonMatrix, setComparisonMatrix] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showPrModal, setShowPrModal] = useState(false);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showThreeWayModal, setShowThreeWayModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [autoPoId, setAutoPoId] = useState(null);

  useEffect(() => {
    if (['planning', 'requisitions', 'rfqs', 'purchase-orders', 'imports', 'vendors', 'contracts', 'logistics', 'reports'].includes(segment)) {
      setActiveSegment(segment);
    } else {
      setActiveSegment('overview');
    }
  }, [segment]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [kpiRes, supRes, prRes, rfqRes, poRes, impRes, cntRes, gapRes] = await Promise.all([
        API.get('/supply-chain/kpis'),
        API.get('/supply-chain/suppliers'),
        API.get('/supply-chain/requisitions'),
        API.get('/supply-chain/rfqs'),
        API.get('/supply-chain/purchase-orders'),
        API.get('/supply-chain/imports'),
        API.get('/supply-chain/contracts'),
        API.get('/supply-chain/planning/supply-gap')
      ]);

      if (kpiRes.data.success) setKpis(kpiRes.data.data);
      if (supRes.data.success) setSuppliers(supRes.data.data);
      if (prRes.data.success) setRequisitions(prRes.data.data);
      if (rfqRes.data.success) setRfqs(rfqRes.data.data);
      if (poRes.data.success) setPurchaseOrders(poRes.data.data);
      if (impRes.data.success) setImports(impRes.data.data);
      if (cntRes.data.success) setContracts(cntRes.data.data);
      if (gapRes.data.success) setSupplyGaps(gapRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchComparison = async (rfqId) => {
    try {
      const res = await API.get(`/supply-chain/comparison-matrix/${rfqId}`);
      if (res.data.success) {
        setComparisonMatrix(res.data);
        setShowComparisonModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutoPo = (gap) => {
    setAutoPoId(gap.sku);
    window.setTimeout(() => setAutoPoId(null), 1000);
  };

  const fmtEgp = (n) => n != null ? `EGP ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
  const fmtNum = (n) => n != null ? Number(n).toLocaleString() : '—';
  const fmtDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString();
  };
  const getDaysRemaining = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return Math.ceil((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getGapTone = (gap) => {
    const value = Number(gap?.supplyGap || 0);
    if (value > 40) return { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' };
    if (value > 10) return { bg: '#fef9c3', border: '#fde68a', color: '#d97706' };
    return { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' };
  };

  const getStatusTone = (status) => {
    if (status === 'Approved' || status === 'Completed' || status === 'Matched') return { bg: '#dcfce7', color: '#166534' };
    if (status === 'Pending' || status === 'In Progress' || status === 'Submitted') return { bg: '#fef3c7', color: '#92400e' };
    if (status === 'Flagged' || status === 'Blocked' || status === 'Critical') return { bg: '#fee2e2', color: '#991b1b' };
    return { bg: '#e0f2fe', color: '#0369a1' };
  };

  const tabs = [
    ['overview', 'Control Tower'],
    ['planning', 'Demand & Gap Planning'],
    ['requisitions', 'Requisitions (PR)'],
    ['rfqs', 'RFQs & Bid Matrix'],
    ['purchase-orders', 'Purchase Orders & 3-Way Match'],
    ['imports', 'Egyptian Imports & ACI/ACID'],
    ['vendors', 'Suppliers & Scorecards'],
    ['contracts', 'Contracts & Price Lists'],
    ['logistics', 'Logistics Milestones'],
    ['reports', 'Spend Analysis & KPIs']
  ];

  return (
    <div style={{ padding: '0 12px 32px', maxWidth: 1440, margin: '0 auto' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Supply chain operations</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Super Supply Chain & Procurement Control Tower</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>From planning and requisitions to imports, supplier scorecards, and spend intelligence.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setShowPrModal(true)}>+ New PR</button>
            <button className="btn btn-secondary" onClick={() => setShowRfqModal(true)}>+ Create RFQ</button>
            <button className="btn btn-primary" onClick={() => setShowPoModal(true)}>+ Issue PO</button>
            <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>🇪🇬 Import ACI</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid #e2e8f0', overflowX: 'auto', paddingBottom: 2 }}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setActiveSegment(key);
              navigate(key === 'overview' ? '/supply-chain' : `/supply-chain/${key}`);
            }}
            style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: activeSegment === key ? 700 : 500,
              color: activeSegment === key ? '#0284c7' : '#64748b',
              borderBottom: activeSegment === key ? '3px solid #0284c7' : '3px solid transparent',
              whiteSpace: 'nowrap'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>Loading supply chain control tower…</div>
      ) : (
        <>
          {activeSegment === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 20 }}>
                {[
                  ['Annual purchase spend', fmtEgp(kpis?.totalSpendEgp ?? 0), 'Total PO value', '#0284c7'],
                  ['Open purchase orders', `${kpis?.openPurchaseOrders ?? 0} POs`, 'Active pipeline', '#0f172a'],
                  ['Pending PR approvals', `${kpis?.pendingPrsCount ?? 0} PRs`, 'Awaiting sign-off', '#d97706'],
                  ['Import shipments', `${kpis?.importShipmentsCount ?? 0}`, 'ACI / ACID tracked', '#7c3aed'],
                  ['Supplier on-time', `${kpis?.supplierOnTimeAvgPct != null ? `${kpis.supplierOnTimeAvgPct}%` : '—'}`, 'Target ≥ 90%', '#16a34a'],
                  ['Supply gap risk', `${kpis?.supplyGapItemsCount ?? 0} items`, 'Reorder recommendation', '#dc2626']
                ].map(([label, value, detail, color]) => (
                  <div key={label} className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color, margin: '6px 0' }}>{value}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{detail}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 18, marginBottom: 18 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>End-to-end flow</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {['Demand', 'PR', 'RFQ', 'PO', 'ACI', 'Receiving', '3-Way Match'].map((step, index) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '7px 11px', borderRadius: 999, border: '1px solid #e2e8f0', background: index === 4 ? '#eff6ff' : '#fff', color: index === 4 ? '#0284c7' : '#0f172a', fontWeight: 700 }}>{step}</span>
                      {index < 6 && <span style={{ color: '#64748b' }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 18 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Active exception tower</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    { title: 'Import ACI clearance delay', body: 'Alexandria Port documentation is pending for IMP-2026-0042.', tone: '#fef2f2', border: '#fecaca', color: '#991b1b' },
                    { title: 'Supplier concentration risk', body: 'Motor 5HP is still 100% dependent on a single supplier.', tone: '#fef9c3', border: '#fde68a', color: '#92400e' },
                    { title: '3-way match exception', body: 'PO-2026-0089 is showing a quantity variance and needs review.', tone: '#f0fdf4', border: '#bbf7d0', color: '#166534' }
                  ].map((item) => (
                    <div key={item.title} style={{ padding: 12, background: item.tone, border: `1px solid ${item.border}`, borderRadius: 10 }}>
                      <div style={{ fontWeight: 700, color: item.color }}>{item.title}</div>
                      <div style={{ marginTop: 4, color: '#334155', fontSize: 13 }}>{item.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSegment === 'planning' && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Demand and gap planning</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Gap signal is highlighted by severity so critical shortages can be acted on first.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowPoModal(true)}>Create auto PO</button>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {supplyGaps.length > 0 ? supplyGaps.map((gap) => {
                  const tone = getGapTone(gap);
                  return (
                    <div key={gap.sku} style={{ padding: 14, borderRadius: 12, border: `1px solid ${tone.border}`, background: tone.bg }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{gap.sku} • {gap.name}</div>
                          <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{gap.category}</div>
                        </div>
                        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#fff', color: tone.color, fontWeight: 700, fontSize: 12 }}>Gap {gap.supplyGap} EA</span>
                      </div>
                      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                        <div style={{ padding: 10, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Available</div><div style={{ fontWeight: 800 }}>{gap.availableStock} EA</div></div>
                        <div style={{ padding: 10, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Incoming POs</div><div style={{ fontWeight: 800 }}>{gap.incomingPoQty} EA</div></div>
                        <div style={{ padding: 10, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Recommended order</div><div style={{ fontWeight: 800 }}>{gap.recommendedOrderQty} EA</div></div>
                        <div style={{ padding: 10, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Estimated cost</div><div style={{ fontWeight: 800 }}>{fmtEgp(gap.estimatedTotalCost)}</div></div>
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => handleAutoPo(gap)}>{autoPoId === gap.sku ? 'Creating…' : 'Create Auto PO'}</button>
                      </div>
                    </div>
                  );
                }) : <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No supply gaps detected.</div>}
              </div>
            </div>
          )}

          {activeSegment === 'requisitions' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {requisitions.map((pr) => (
                <div key={pr._id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{pr.prNumber}</div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{pr.requester?.firstName} {pr.requester?.lastName} • {pr.department}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#0284c7', fontWeight: 700, fontSize: 12 }}>{pr.urgency}</span>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: getStatusTone(pr.status).bg, color: getStatusTone(pr.status).color, fontWeight: 700, fontSize: 12 }}>{pr.status}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Source</div><div style={{ fontWeight: 700 }}>{pr.sourceType}</div></div>
                    <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Required date</div><div style={{ fontWeight: 700 }}>{fmtDate(pr.requiredDate)}</div></div>
                    <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Estimated cost</div><div style={{ fontWeight: 700 }}>{fmtEgp(pr.totalEstimatedCost)}</div></div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Submitted', 'Manager review', 'Approved'].map((step, index) => (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ padding: '6px 10px', borderRadius: 999, background: index <= 1 ? '#eff6ff' : '#f8fafc', color: index <= 1 ? '#0284c7' : '#64748b', fontWeight: 700, fontSize: 12 }}>{step}</span>
                        {index < 2 && <span style={{ color: '#64748b' }}>→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSegment === 'rfqs' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {rfqs.map((rfq) => {
                const days = getDaysRemaining(rfq.deadlineDate);
                return (
                  <div key={rfq._id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800 }}>{rfq.rfqNumber}</div>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#0284c7', fontSize: 12, fontWeight: 700 }}>{rfq.status}</span>
                    </div>
                    <div style={{ marginTop: 10, fontWeight: 700 }}>{rfq.title}</div>
                    <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>Invited suppliers: {rfq.invitedSuppliers?.length || 0}</div>
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>Deadline {fmtDate(rfq.deadlineDate)}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: days != null && days <= 3 ? '#dc2626' : '#16a34a' }}>{days != null ? `${days}d left` : 'Open'}</span>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Bids received: 3</span>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleFetchComparison(rfq._id)}>Compare bids</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSegment === 'purchase-orders' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {purchaseOrders.map((po) => {
                const statusTone = getStatusTone(po.status);
                const days = getDaysRemaining(po.expectedDeliveryDate);
                return (
                  <div key={po._id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{po.poNumber}</div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{po.supplier?.name || 'Vendor supplier'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#f8fafc', color: '#0f172a', fontWeight: 700, fontSize: 12 }}>{po.procurementType}</span>
                        <span style={{ padding: '4px 10px', borderRadius: 999, background: statusTone.bg, color: statusTone.color, fontWeight: 700, fontSize: 12 }}>{po.status}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                      <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Grand total</div><div style={{ fontWeight: 800 }}>{fmtEgp(po.grandTotalEgp || po.grandTotal)}</div></div>
                      <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Delivery</div><div style={{ fontWeight: 800 }}>{fmtDate(po.expectedDeliveryDate)}</div></div>
                      <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>ETA</div><div style={{ fontWeight: 800, color: days != null && days <= 3 ? '#dc2626' : '#16a34a' }}>{days != null ? `${days} days` : 'TBD'}</div></div>
                    </div>
                    <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontWeight: 700, color: '#166534' }}>3-way match result</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: '#334155' }}>PO, GRN, and invoice are aligned. No exception pending.</div>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={() => setShowThreeWayModal(true)}>Validate match</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSegment === 'imports' && (
            <div style={{ display: 'grid', gap: 14 }}>
              {imports.map((imp) => {
                const stages = ['ACI Filed', 'ACID Received', 'At Port', 'Customs', 'Released'];
                const currentStage = stages.indexOf(imp.status) >= 0 ? stages.indexOf(imp.status) + 1 : 2;
                return (
                  <div key={imp._id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{imp.shipmentNumber}</div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{imp.supplier?.name || 'Foreign supplier'} • {imp.countryOfOrigin}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#fef9c3', color: '#92400e', fontWeight: 700, fontSize: 12 }}>ACI {imp.aciNumber}</span>
                        {imp.acidNumber && <span style={{ padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#0284c7', fontWeight: 700, fontSize: 12 }}>ACID {imp.acidNumber}</span>}
                      </div>
                    </div>
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                      <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Ports</div><div style={{ fontWeight: 800 }}>{imp.portOfLoading} → {imp.portOfDischarge}</div></div>
                      <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Bill of lading</div><div style={{ fontWeight: 800 }}>{imp.billOfLading || 'BL-99124'}</div></div>
                      <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Customs status</div><div style={{ fontWeight: 800 }}>{imp.status}</div></div>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {stages.map((stage, index) => (
                        <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ padding: '6px 10px', borderRadius: 999, background: index < currentStage ? '#dcfce7' : '#f8fafc', color: index < currentStage ? '#166534' : '#64748b', fontWeight: 700, fontSize: 12 }}>{stage}</span>
                          {index < stages.length - 1 && <span style={{ color: '#64748b' }}>→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSegment === 'vendors' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {suppliers.map((supplier) => {
                const score = supplier.performanceScore?.overall || 92;
                const ringStyle = { background: `conic-gradient(#0284c7 ${score}%, #e2e8f0 ${score}% 100%)` };
                return (
                  <div key={supplier._id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{supplier.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{supplier.category}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: supplier.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: supplier.status === 'Approved' ? '#166534' : '#92400e', fontSize: 12, fontWeight: 700 }}>{supplier.status}</span>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', padding: 4, ...ringStyle }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0284c7' }}>{score}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>On-time delivery</div>
                        <div style={{ fontWeight: 800 }}>{supplier.performanceScore?.onTimeDeliveryPct || 95}%</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Spend: {fmtEgp(supplier.performanceScore?.totalSpendEgp || 1250000)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSegment === 'contracts' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {contracts.map((contract) => {
                const days = getDaysRemaining(contract.validTo);
                const expiringSoon = days != null && days <= 30;
                return (
                  <div key={contract._id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800 }}>{contract.contractNumber || 'Contract'}</div>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#0284c7', fontWeight: 700, fontSize: 12 }}>{contract.type || 'Framework'}</span>
                    </div>
                    <div style={{ marginTop: 10, color: '#475569' }}>{contract.supplier?.name || 'Supplier'}</div>
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Valid until</div><div style={{ fontWeight: 800 }}>{fmtDate(contract.validTo)}</div></div>
                      <div style={{ padding: 10, borderRadius: 10, background: expiringSoon ? '#fef9c3' : '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Expiry warning</div><div style={{ fontWeight: 800, color: expiringSoon ? '#92400e' : '#0f172a' }}>{expiringSoon ? 'Expiring within 30 days' : 'Healthy coverage'}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSegment === 'logistics' && (
            <div style={{ display: 'grid', gap: 14 }}>
              {imports.map((imp) => {
                const stages = ['Ordered', 'Shipped', 'At Port', 'Cleared', 'Delivered'];
                const current = stages.indexOf(imp.status) >= 0 ? stages.indexOf(imp.status) : 2;
                return (
                  <div key={imp._id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{imp.shipmentNumber}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{imp.portOfLoading} → {imp.portOfDischarge}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#0284c7', fontWeight: 700, fontSize: 12 }}>{imp.status}</span>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {stages.map((stage, index) => (
                        <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ padding: '6px 10px', borderRadius: 999, background: index <= current ? '#dcfce7' : '#f8fafc', color: index <= current ? '#166534' : '#64748b', fontWeight: 700, fontSize: 12 }}>{stage}</span>
                          {index < stages.length - 1 && <span style={{ color: '#64748b' }}>→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSegment === 'reports' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 16 }}>
                <div className="card" style={{ padding: 18 }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Spend analysis</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    {['Direct materials', 'Freight', 'Services'].map((name, idx) => (
                      <div key={name} style={{ padding: 12, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{name}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0284c7', marginTop: 6 }}>{['EGP 3.2M', 'EGP 810K', 'EGP 560K'][idx]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card" style={{ padding: 18 }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Top suppliers</h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {suppliers.slice(0, 4).map((supplier, idx) => (
                      <div key={supplier._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 10, background: '#f8fafc' }}>
                        <div style={{ fontWeight: 700 }}>{idx + 1}. {supplier.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{fmtEgp(supplier.performanceScore?.totalSpendEgp || 1250000)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: 18 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Monthly spend trend</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, alignItems: 'end' }}>
                  {[70, 86, 92, 78, 96, 110].map((value, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: '100%', height: value, minHeight: 28, borderRadius: 8, background: 'linear-gradient(180deg, #7dd3fc 0%, #0284c7 100%)' }} />
                      <div style={{ fontSize: 11, color: '#64748b' }}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][idx]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showComparisonModal && comparisonMatrix && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 760, padding: 24, background: '#fff', borderRadius: 12, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>RFQ comparison matrix</h3>
              <button onClick={() => setShowComparisonModal(false)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 16 }}>
              <strong>{comparisonMatrix.recommendedSupplier?.name}</strong> is the preferred supplier based on the highest composite score.
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '10px' }}>Supplier</th>
                  <th style={{ padding: '10px' }}>Bid total</th>
                  <th style={{ padding: '10px' }}>Lead time</th>
                  <th style={{ padding: '10px' }}>Price score</th>
                  <th style={{ padding: '10px' }}>Quality score</th>
                  <th style={{ padding: '10px' }}>Composite</th>
                </tr>
              </thead>
              <tbody>
                {comparisonMatrix.comparisonMatrix?.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{row.supplier?.name}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#0369a1' }}>EGP {row.grandTotalEgp?.toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>{row.leadTimeDays} days</td>
                    <td style={{ padding: '10px' }}>{row.priceScore}%</td>
                    <td style={{ padding: '10px' }}>{row.qualityScore}%</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '3px 8px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontWeight: 800 }}>{row.totalCompositeScore}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setShowComparisonModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showThreeWayModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 540, padding: 24, background: '#fff', borderRadius: 12 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>3-way match validation</h3>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>PO amount</span><span style={{ fontWeight: 700 }}>EGP 500,000</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>GRN accepted value</span><span style={{ fontWeight: 700 }}>EGP 480,000</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Invoice amount</span><span style={{ fontWeight: 700, color: '#dc2626' }}>EGP 500,000</span></div>
              <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #cbd5e1', color: '#dc2626', fontWeight: 700, fontSize: 13 }}>⚠️ Flagged exception: quantity shortfall between received and invoiced.</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowThreeWayModal(false)} className="btn btn-secondary">Close</button>
              <button onClick={() => setShowThreeWayModal(false)} className="btn btn-primary">Request supplier credit note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChainPage;
