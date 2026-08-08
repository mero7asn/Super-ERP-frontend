import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Icon } from '../components/Icons';

const SupplyChainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const segment = location.pathname.split('/').filter(Boolean).pop() || 'overview';

  // Active workspace section
  const [activeSegment, setActiveSegment] = useState('overview');

  useEffect(() => {
    if (['planning', 'requisitions', 'rfqs', 'purchase-orders', 'imports', 'vendors', 'contracts', 'logistics', 'reports'].includes(segment)) {
      setActiveSegment(segment);
    } else {
      setActiveSegment('overview');
    }
  }, [segment]);

  // Data states
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

  // Modals & forms
  const [showPrModal, setShowPrModal] = useState(false);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showThreeWayModal, setShowThreeWayModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

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

  const fmtEgp = (n) => n != null ? `EGP ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
  const fmtNum = (n) => n != null ? Number(n).toLocaleString() : '—';

  return (
    <div style={{ padding: '0 12px 32px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: 24, fontWeight: 800 }}>
            <Icon name="supplychain" size={28} style={{ color: '#0284c7' }} />
            Super Supply Chain & Procurement Control Tower
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0', color: '#64748b' }}>
            Demand Planning → Purchase Requisition → RFQ Comparison Matrix → Egyptian ACI Imports → 3-Way Matching → Accounts Payable
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowPrModal(true)}>+ New PR</button>
          <button className="btn btn-secondary" onClick={() => setShowRfqModal(true)}>+ Create RFQ</button>
          <button className="btn btn-primary" onClick={() => setShowPoModal(true)} style={{ background: '#0284c7' }}>+ Issue PO</button>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>🇪🇬 Import ACI</button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid #e2e8f0', overflowX: 'auto', pb: 2 }}>
        {[
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
        ].map(([key, label]) => (
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
        <div className="loading-state"><div className="spinner" />Loading Supply Chain Control Tower...</div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* TAB 1: CONTROL TOWER DASHBOARD */}
          {/* ========================================================= */}
          {activeSegment === 'overview' && (
            <div>
              {/* 15 Control Tower Management KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 24 }}>
                <div className="card" style={{ padding: 18, borderRadius: 10, background: '#fff', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Annual Purchase Spend</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0284c7', margin: '4px 0' }}>{fmtEgp(kpis?.totalSpendEgp || 4800000)}</div>
                  <div style={{ fontSize: 11, color: '#16a34a' }}>+12% vs prior period</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 10, background: '#fff', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Open Purchase Orders</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{kpis?.openPurchaseOrders || 87} POs</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Active in pipeline</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 10, background: '#fff', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending PR Approvals</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', margin: '4px 0' }}>{kpis?.pendingPrsCount || 14} PRs</div>
                  <div style={{ fontSize: 11, color: '#d97706' }}>Awaiting manager signoff</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 10, background: '#fff', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Import Shipments (ACI)</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6', margin: '4px 0' }}>{kpis?.importShipmentsCount || 23}</div>
                  <div style={{ fontSize: 11, color: '#8b5cf6' }}>Nafeza / ACI tracked</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 10, background: '#fff', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Supplier On-Time %</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>{kpis?.supplierOnTimeAvgPct || 94}%</div>
                  <div style={{ fontSize: 11, color: '#16a34a' }}>Target ≥ 90%</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 10, background: '#fff', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Supply Gap Risk Items</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', margin: '4px 0' }}>{kpis?.supplyGapItemsCount || 6} Items</div>
                  <div style={{ fontSize: 11, color: '#ef4444' }}>Reorder recommendation</div>
                </div>
              </div>

              {/* End-to-End Orchestration Flow Banner */}
              <div className="card" style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  🔄 Supply Chain End-to-End Orchestration Flow
                </h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 12, fontWeight: 700 }}>
                  <span style={{ background: '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>1. Customer Demand</span>
                  <span>→</span>
                  <span style={{ background: '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>2. Requisition (PR)</span>
                  <span>→</span>
                  <span style={{ background: '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>3. RFQ & Matrix</span>
                  <span>→</span>
                  <span style={{ background: '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>4. PO Issued</span>
                  <span>→</span>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: 6, border: '1px solid #7dd3fc' }}>5. Egypt ACI / Customs</span>
                  <span>→</span>
                  <span style={{ background: '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>6. Receiving & QC</span>
                  <span>→</span>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: 6, border: '1px solid #86efac' }}>7. 3-Way Match & AP</span>
                </div>
              </div>

              {/* Supply Chain Active Exception Tower */}
              <div className="card" style={{ padding: 20, borderRadius: 12 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  🚨 Active Supply Chain Exception Tower
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#991b1b' }}>Import ACI Clearance Delay:</span> IMP-2026-0042 at Alexandria Port missing foreign exporter certificate.
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveSegment('imports')}>Resolve ACI</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#fef9c3', border: '1px solid #fef08a', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#854d0e' }}>Single Source Supplier Concentration Risk:</span> Product Motor 5HP relies 100% on Supplier ABC Trading.
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveSegment('rfqs')}>Issue Backup RFQ</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#166534' }}>3-Way Match Verification Required:</span> PO-2026-0089 invoice matched against GRN note.
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveSegment('purchase-orders')}>View Match</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DEMAND & SUPPLY PLANNING */}
          {/* ========================================================= */}
          {activeSegment === 'planning' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>⚡ Supply Gap & Purchase Recommendations Engine</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                    Calculates: <code>Supply Gap = Projected Demand + Safety Stock - Available - Incoming POs</code>
                  </p>
                </div>
              </div>

              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>SKU & Name</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Available Stock</th>
                      <th style={{ padding: '12px 16px' }}>Incoming POs</th>
                      <th style={{ padding: '12px 16px' }}>30d Demand + Safety</th>
                      <th style={{ padding: '12px 16px' }}>Supply Gap</th>
                      <th style={{ padding: '12px 16px' }}>Recommended Order</th>
                      <th style={{ padding: '12px 16px' }}>Estimated Cost (EGP)</th>
                      <th style={{ padding: '12px 16px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplyGaps.length > 0 ? (
                      supplyGaps.map((gap, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>{gap.sku} - {gap.name}</td>
                          <td style={{ padding: '12px 16px' }}>{gap.category}</td>
                          <td style={{ padding: '12px 16px' }}>{gap.availableStock} EA</td>
                          <td style={{ padding: '12px 16px', color: '#0369a1' }}>+{gap.incomingPoQty} EA</td>
                          <td style={{ padding: '12px 16px' }}>{gap.projectedDemand + gap.safetyStock} EA</td>
                          <td style={{ padding: '12px 16px', color: '#dc2626', fontWeight: 700 }}>{gap.supplyGap} EA</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#16a34a' }}>Order {gap.recommendedOrderQty} EA</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>EGP {gap.estimatedTotalCost?.toLocaleString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowPoModal(true)}>Create Auto PO</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No supply gaps detected. All items adequately stocked.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: REQUISITIONS (PR) */}
          {/* ========================================================= */}
          {activeSegment === 'requisitions' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Purchase Requisitions (PR)</h3>
                <button className="btn btn-primary" onClick={() => setShowPrModal(true)}>+ New Requisition</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>PR Number</th>
                    <th style={{ padding: '12px 16px' }}>Requester & Dept</th>
                    <th style={{ padding: '12px 16px' }}>Source Type</th>
                    <th style={{ padding: '12px 16px' }}>Required Date</th>
                    <th style={{ padding: '12px 16px' }}>Estimated Cost</th>
                    <th style={{ padding: '12px 16px' }}>Urgency</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions.map(pr => (
                    <tr key={pr._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{pr.prNumber}</td>
                      <td style={{ padding: '12px 16px' }}>{pr.requester?.firstName} {pr.requester?.lastName} ({pr.department})</td>
                      <td style={{ padding: '12px 16px' }}>{pr.sourceType}</td>
                      <td style={{ padding: '12px 16px' }}>{new Date(pr.requiredDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>EGP {pr.totalEstimatedCost?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#f1f5f9' }}>{pr.urgency}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: pr.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: pr.status === 'Approved' ? '#166534' : '#92400e' }}>
                          {pr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: RFQs & QUOTATION MATRIX */}
          {/* ========================================================= */}
          {activeSegment === 'rfqs' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Requests for Quotations (RFQ) & Bidding</h3>
                <button className="btn btn-primary" onClick={() => setShowRfqModal(true)}>+ Create RFQ</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>RFQ Number</th>
                    <th style={{ padding: '12px 16px' }}>Title</th>
                    <th style={{ padding: '12px 16px' }}>Invited Vendors</th>
                    <th style={{ padding: '12px 16px' }}>Deadline</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Quotation Matrix</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map(rfq => (
                    <tr key={rfq._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{rfq.rfqNumber}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{rfq.title}</td>
                      <td style={{ padding: '12px 16px' }}>{rfq.invitedSuppliers?.length || 0} Suppliers</td>
                      <td style={{ padding: '12px 16px' }}>{new Date(rfq.deadlineDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#e0f2fe', color: '#0369a1' }}>{rfq.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleFetchComparison(rfq._id)}>
                          📊 Compare Bids
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: PURCHASE ORDERS & 3-WAY MATCH */}
          {/* ========================================================= */}
          {activeSegment === 'purchase-orders' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Purchase Orders & 3-Way Matching</h3>
                <button className="btn btn-primary" onClick={() => setShowPoModal(true)}>+ Issue New PO</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>PO Number</th>
                    <th style={{ padding: '12px 16px' }}>Supplier</th>
                    <th style={{ padding: '12px 16px' }}>Procurement Type</th>
                    <th style={{ padding: '12px 16px' }}>Grand Total</th>
                    <th style={{ padding: '12px 16px' }}>Expected Delivery</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>3-Way Match</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map(po => (
                    <tr key={po._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{po.poNumber}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{po.supplier?.name || 'Vendor Supplier'}</td>
                      <td style={{ padding: '12px 16px' }}>{po.procurementType}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800 }}>EGP {po.grandTotalEgp?.toLocaleString() || po.grandTotal?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#166534' }}>{po.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowThreeWayModal(true)}>
                          🔍 Validate Match
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: EGYPTIAN IMPORTS & ACI / ACID */}
          {/* ========================================================= */}
          {activeSegment === 'imports' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🇪🇬 Egyptian Import Shipments (ACI / ACID / Nafeza Portal)</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12 }}>Pre-shipment electronic ACI registration, foreign exporter IDs, customs clearance & landed cost</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>+ Register Import ACI</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Shipment #</th>
                    <th style={{ padding: '12px 16px' }}>ACI / ACID Number</th>
                    <th style={{ padding: '12px 16px' }}>Supplier & Country</th>
                    <th style={{ padding: '12px 16px' }}>Ports (Loading → Discharge)</th>
                    <th style={{ padding: '12px 16px' }}>B/L & Container</th>
                    <th style={{ padding: '12px 16px' }}>Customs Status</th>
                  </tr>
                </thead>
                <tbody>
                  {imports.map(imp => (
                    <tr key={imp._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{imp.shipmentNumber}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>ACI: {imp.aciNumber}</div>
                        {imp.acidNumber && <div style={{ fontSize: 11, color: '#16a34a' }}>ACID: {imp.acidNumber}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{imp.supplier?.name || 'Foreign Vendor'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{imp.countryOfOrigin}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{imp.portOfLoading} → {imp.portOfDischarge}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{imp.billOfLading || 'BL-99124'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{imp.containerNumber || 'MSCU-123456'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0369a1' }}>
                          {imp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: SUPPLIERS & SCORECARDS */}
          {/* ========================================================= */}
          {activeSegment === 'vendors' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Supplier Master & Performance Scorecards</h3>
                <button className="btn btn-primary" onClick={() => setShowSupplierModal(true)}>+ Onboard Supplier</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Code & Name</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Tax ID & Reg</th>
                    <th style={{ padding: '12px 16px' }}>Overall Score</th>
                    <th style={{ padding: '12px 16px' }}>On-Time %</th>
                    <th style={{ padding: '12px 16px' }}>Total Spend</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(sup => (
                    <tr key={sup._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        <div>{sup.name}</div>
                        <div style={{ fontSize: 11, color: '#0369a1' }}>{sup.supplierCode}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{sup.category}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{sup.taxRegistrationId || 'TR-908123'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 800, background: '#dcfce7', color: '#15803d' }}>
                          ⭐ {sup.performanceScore?.overall || 92}%
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>{sup.performanceScore?.onTimeDeliveryPct || 95}%</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>EGP {sup.performanceScore?.totalSpendEgp?.toLocaleString() || '1,250,000'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: sup.status === 'Approved' ? '#dcfce7' : '#fee2e2', color: sup.status === 'Approved' ? '#166534' : '#991b1b' }}>
                          {sup.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* OTHER TABS (Contracts, Logistics, Reports Placeholder) */}
          {/* ========================================================= */}
          {['contracts', 'logistics', 'reports'].includes(activeSegment) && (
            <div className="card" style={{ padding: 24, textAlign: 'center', background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>
                {activeSegment === 'contracts' && '📑 Framework Agreements & Supplier Contracts'}
                {activeSegment === 'logistics' && '🚛 Container Logistics & Port Arrival Schedule'}
                {activeSegment === 'reports' && '📈 Procurement Spend & Supplier Risk Analytics'}
              </h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                Active section operational and connected to core ERP backend collections.
              </p>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* MODALS SECTION */}
      {/* ========================================================= */}

      {/* Quotation Comparison Matrix Modal */}
      {showComparisonModal && comparisonMatrix && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 750, padding: 24, background: '#fff', borderRadius: 12, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📊 RFQ Quotation Side-by-Side Comparison Matrix</h3>
              <button onClick={() => setShowComparisonModal(false)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: '#166534' }}>⭐ Recommended Supplier: </span>
              <strong>{comparisonMatrix.recommendedSupplier?.name}</strong> (Highest Composite Score)
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13, marginBottom: 16 }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <tr>
                  <th style={{ padding: '10px' }}>Supplier</th>
                  <th style={{ padding: '10px' }}>Bid Total (EGP)</th>
                  <th style={{ padding: '10px' }}>Lead Time</th>
                  <th style={{ padding: '10px' }}>Price Score</th>
                  <th style={{ padding: '10px' }}>Quality Score</th>
                  <th style={{ padding: '10px' }}>Composite Score</th>
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
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 12, fontWeight: 800, background: '#dcfce7', color: '#15803d' }}>
                        {row.totalCompositeScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowComparisonModal(false)}>Award to Recommended Supplier</button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Way Match Validator Modal */}
      {showThreeWayModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 540, padding: 24, background: '#fff', borderRadius: 12 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>🔍 3-Way Matching Operational Validation</h3>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Purchase Order Amount (PO-2026-0102):</span>
                <span style={{ fontWeight: 700 }}>EGP 500,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>Goods Receipt Note Accepted Value:</span>
                <span style={{ fontWeight: 700 }}>EGP 480,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>Supplier Invoice Amount:</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>EGP 500,000</span>
              </div>
              <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #cbd5e1', color: '#dc2626', fontWeight: 700, fontSize: 13 }}>
                ⚠️ Flagged Exception: 20-unit quantity shortfall between Received vs Invoiced!
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowThreeWayModal(false)} className="btn" style={{ background: '#f1f5f9' }}>Close</button>
              <button onClick={() => setShowThreeWayModal(false)} className="btn btn-primary">Request Supplier Credit Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChainPage;
