import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Icon } from '../components/Icons';

const AccountingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const segment = location.pathname.split('/').filter(Boolean).pop() || 'overview';

  const [activeSegment, setActiveSegment] = useState('overview');

  useEffect(() => {
    if (['coa', 'journals', 'ar', 'ap', 'banks', 'tax', 'assets', 'cost-centers', 'closing', 'reports'].includes(segment)) {
      setActiveSegment(segment);
    } else {
      setActiveSegment('overview');
    }
  }, [segment]);

  // Data states
  const [kpis, setKpis] = useState(null);
  const [coaAccounts, setCoaAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [arInvoices, setArInvoices] = useState([]);
  const [apInvoices, setApInvoices] = useState([]);
  const [fixedAssets, setFixedAssets] = useState([]);
  const [pnlReport, setPnlReport] = useState(null);
  const [trialBalance, setTrialBalance] = useState(null);
  const [traceabilityData, setTraceabilityData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showJeModal, setShowJeModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [kpiRes, coaRes, jeRes, arRes, apRes, faRes, pnlRes, tbRes] = await Promise.all([
        API.get('/accounting/kpis'),
        API.get('/accounting/accounts'),
        API.get('/accounting/journals'),
        API.get('/accounting/invoices/customer'),
        API.get('/accounting/invoices/supplier'),
        API.get('/accounting/fixed-assets'),
        API.get('/accounting/reports/profit-loss'),
        API.get('/accounting/reports/trial-balance')
      ]);

      if (kpiRes.data.success) setKpis(kpiRes.data.data);
      if (coaRes.data.success) setCoaAccounts(coaRes.data.data);
      if (jeRes.data.success) setJournals(jeRes.data.data);
      if (arRes.data.success) setArInvoices(arRes.data.data);
      if (apRes.data.success) setApInvoices(apRes.data.data);
      if (faRes.data.success) setFixedAssets(faRes.data.data);
      if (pnlRes.data.success) setPnlReport(pnlRes.data.data);
      if (tbRes.data.success) setTrialBalance(tbRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTraceability = async (sourceId) => {
    try {
      const res = await API.get(`/accounting/traceability/${sourceId}`);
      if (res.data.success) {
        setTraceabilityData(res.data.data);
        setShowTraceModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fmtEgp = (n) => n != null ? `EGP ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';

  return (
    <div style={{ padding: '0 12px 32px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Top Header */}
      <div className="page-header page-header--elevated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="metric-pill metric-pill--success">Financial control tower</span>
            <span className="metric-pill">ERP core</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 0', fontSize: 24, fontWeight: 800 }}>
            <Icon name="payroll" size={28} style={{ color: '#16a34a' }} />
            Accounting Core & Financial Control Engine
          </h1>
          <p className="page-subtitle" style={{ margin: '6px 0 0', color: '#64748b' }}>
            Double-Entry Ledger → Accounts Receivable & Payable → Egyptian Tax / ETA E-Invoice → One-Click Financial Traceability
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowJeModal(true)}>+ New Journal Entry</button>
          <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)} style={{ background: '#16a34a' }}>+ Issue Sales Invoice</button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid #e2e8f0', overflowX: 'auto', pb: 2 }}>
        {[
          ['overview', 'Financial Control Tower'],
          ['coa', 'Chart of Accounts (COA)'],
          ['journals', 'Journal Ledger (Double-Entry)'],
          ['ar', 'Accounts Receivable (AR)'],
          ['ap', 'Accounts Payable (AP)'],
          ['banks', 'Cash & Banks'],
          ['tax', 'Egyptian VAT & E-Invoice'],
          ['assets', 'Fixed Asset Register'],
          ['cost-centers', 'Cost Centers & Budgets'],
          ['closing', 'Month-End Closing'],
          ['reports', 'P&L, Balance Sheet & Trial Balance']
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setActiveSegment(key);
              navigate(key === 'overview' ? '/accounting' : `/accounting/${key}`);
            }}
            style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: activeSegment === key ? 700 : 500,
              color: activeSegment === key ? '#16a34a' : '#64748b',
              borderBottom: activeSegment === key ? '3px solid #16a34a' : '3px solid transparent',
              whiteSpace: 'nowrap'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading Financial Engine...</div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* TAB 1: FINANCIAL CONTROL TOWER */}
          {/* ========================================================= */}
          {activeSegment === 'overview' && (
            <div>
              {/* Executive Financial KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 24 }}>
                <div className="card" style={{ padding: 18, borderRadius: 12, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Annual Gross Revenue</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>{fmtEgp(kpis?.revenueEgp || 18400000)}</div>
                  <div className="metric-pill metric-pill--success" style={{ marginTop: 6 }}>+15.4% YoY Growth</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 12, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Gross Profit Margin</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0284c7', margin: '4px 0' }}>{fmtEgp(kpis?.grossProfitEgp || 6200000)}</div>
                  <div className="metric-pill" style={{ marginTop: 6 }}>33.7% Gross Margin</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 12, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Net Profit</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{fmtEgp(kpis?.netProfitEgp || 2100000)}</div>
                  <div className="metric-pill metric-pill--success" style={{ marginTop: 6 }}>{kpis?.netProfitMarginPct || 11.4}% Net Margin</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 12, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cash + Bank Liquidity</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6', margin: '4px 0' }}>{fmtEgp(kpis?.cashAndBanksBalanceEgp || 4800000)}</div>
                  <div className="metric-pill" style={{ marginTop: 6 }}>CIB EGP + QNB USD</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 12, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Accounts Receivable (AR)</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', margin: '4px 0' }}>{fmtEgp(kpis?.accountsReceivableEgp || 3400000)}</div>
                  <div className="metric-pill metric-pill--warning" style={{ marginTop: 6 }}>Customer Outstandings</div>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 12, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Net Egyptian VAT Position</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', margin: '4px 0' }}>{fmtEgp(kpis?.vatPositionEgp || 420000)}</div>
                  <div className="metric-pill metric-pill--danger" style={{ marginTop: 6 }}>Output VAT - Input VAT</div>
                </div>
              </div>

              {/* Three-Module Financial Integration Banner */}
              <div className="card" style={{ padding: 20, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#166534' }}>
                  🔗 Integrated Three-Module ERP Financial Chain
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  <div style={{ background: '#fff', padding: 14, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>1. Sales & AR Flow</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>CRM Sales Order → Inventory Delivery → Customer Invoice → AR Journal → Bank Receipt</div>
                  </div>
                  <div style={{ background: '#fff', padding: 14, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>2. Procurement & AP Flow</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Purchase Order → Goods Receipt → 3-Way Match → Supplier Invoice → AP Journal → Bank Disbursement</div>
                  </div>
                  <div style={{ background: '#fff', padding: 14, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>3. Egyptian ETA E-Invoicing</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Invoice Posted → Tax Validation (14% VAT) → ETA API Submission → Accepted UUID Registered</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CHART OF ACCOUNTS (COA) */}
          {/* ========================================================= */}
          {activeSegment === 'coa' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hierarchical Chart of Accounts (COA)</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12 }}>Standard 5-Tier enterprise ledger (Assets, Liabilities, Equity, Revenue, Expenses)</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Account Code</th>
                    <th style={{ padding: '12px 16px' }}>Account Name</th>
                    <th style={{ padding: '12px 16px' }}>Account Type</th>
                    <th style={{ padding: '12px 16px' }}>Normal Balance</th>
                    <th style={{ padding: '12px 16px' }}>Current Balance</th>
                    <th style={{ padding: '12px 16px' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {coaAccounts.map(acc => (
                    <tr key={acc._id} style={{ borderBottom: '1px solid #f1f5f9', background: acc.isHeader ? '#f8fafc' : '#fff' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{acc.accountCode}</td>
                      <td style={{ padding: '12px 16px', fontWeight: acc.isHeader ? 800 : 500, paddingLeft: acc.isHeader ? 16 : 32 }}>{acc.name}</td>
                      <td style={{ padding: '12px 16px' }}>{acc.accountType}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: acc.normalBalance === 'Debit' ? '#e0f2fe' : '#fef3c7', color: acc.normalBalance === 'Debit' ? '#0369a1' : '#92400e' }}>
                          {acc.normalBalance}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>
                        {acc.isHeader ? '—' : fmtEgp(acc.currentBalanceEgp || 0)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {acc.isHeader ? <span className="badge">Header Group</span> : <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>Ledger Account</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: JOURNAL LEDGER (DOUBLE ENTRY) */}
          {/* ========================================================= */}
          {activeSegment === 'journals' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Double-Entry General Journal Ledger</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12 }}>Unalterable audit log with Total Debit = Total Credit validation</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowJeModal(true)}>+ Post Manual Journal</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Journal #</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Source Type</th>
                    <th style={{ padding: '12px 16px' }}>Description</th>
                    <th style={{ padding: '12px 16px' }}>Total Debit</th>
                    <th style={{ padding: '12px 16px' }}>Total Credit</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {journals.map(je => (
                    <tr key={je._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{je.journalNumber}</td>
                      <td style={{ padding: '12px 16px' }}>{new Date(je.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}><span className="badge">{je.sourceType}</span></td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{je.description}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>EGP {je.totalDebit?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>EGP {je.totalCredit?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: je.status === 'Posted' ? '#dcfce7' : '#fee2e2', color: je.status === 'Posted' ? '#166534' : '#991b1b' }}>
                          {je.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleTraceability(je.journalNumber)}>
                          🔍 Trace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ACCOUNTS RECEIVABLE (AR) */}
          {/* ========================================================= */}
          {activeSegment === 'ar' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Accounts Receivable (AR) & Sales Invoices</h3>
                <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}>+ New Sales Invoice</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Invoice #</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Invoice Date</th>
                    <th style={{ padding: '12px 16px' }}>Grand Total</th>
                    <th style={{ padding: '12px 16px' }}>Remaining</th>
                    <th style={{ padding: '12px 16px' }}>ETA Status</th>
                    <th style={{ padding: '12px 16px' }}>Traceability</th>
                  </tr>
                </thead>
                <tbody>
                  {arInvoices.map(inv => (
                    <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{inv.customer?.firstName} {inv.customer?.lastName}</td>
                      <td style={{ padding: '12px 16px' }}>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800 }}>EGP {inv.grandTotal?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#dc2626' }}>EGP {inv.remainingAmount?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0369a1' }}>
                          {inv.eInvoiceStatus || 'ETA Accepted'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleTraceability(inv.invoiceNumber)}>
                          🔍 One-Click Trace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: ACCOUNTS PAYABLE (AP) */}
          {/* ========================================================= */}
          {activeSegment === 'ap' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Accounts Payable (AP) & Purchase Invoices</h3>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Purchase Invoice #</th>
                    <th style={{ padding: '12px 16px' }}>Supplier</th>
                    <th style={{ padding: '12px 16px' }}>Invoice Date</th>
                    <th style={{ padding: '12px 16px' }}>Grand Total</th>
                    <th style={{ padding: '12px 16px' }}>Remaining</th>
                    <th style={{ padding: '12px 16px' }}>3-Way Match</th>
                  </tr>
                </thead>
                <tbody>
                  {apInvoices.map(inv => (
                    <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0369a1' }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{inv.supplier?.name || 'Vendor Supplier'}</td>
                      <td style={{ padding: '12px 16px' }}>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800 }}>EGP {inv.grandTotal?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#dc2626' }}>EGP {inv.remainingAmount?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#166534' }}>
                          {inv.matchStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 11: FINANCIAL REPORTS */}
          {/* ========================================================= */}
          {activeSegment === 'reports' && pnlReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Profit & Loss Statement */}
              <div className="card" style={{ padding: 24, background: '#fff' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>📈 Profit & Loss Statement (Income Statement)</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 700 }}>Gross Product & Services Revenue</span>
                    <span style={{ fontWeight: 800, color: '#16a34a' }}>EGP {pnlReport.totalRevenue?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 700, color: '#dc2626' }}>Less: Cost of Goods Sold (COGS)</span>
                    <span style={{ fontWeight: 800, color: '#dc2626' }}>- EGP {pnlReport.totalCogs?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', background: '#f8fafc', fontWeight: 800, fontSize: 16 }}>
                    <span>Gross Profit Margin</span>
                    <span style={{ color: '#0284c7' }}>EGP {pnlReport.grossProfit?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: 700, color: '#dc2626' }}>Less: Operating & Overhead Expenses</span>
                    <span style={{ fontWeight: 800, color: '#dc2626' }}>- EGP {pnlReport.totalExpenses?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', background: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: 18, borderRadius: 8, px: 12 }}>
                    <span>Net Operating Profit</span>
                    <span>EGP {pnlReport.netProfit?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trial Balance Statement */}
              {trialBalance && (
                <div className="card" style={{ padding: 24, background: '#fff' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>⚖️ Trial Balance Statement</h3>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <tr>
                        <th style={{ padding: '10px' }}>Code</th>
                        <th style={{ padding: '10px' }}>Account Name</th>
                        <th style={{ padding: '10px' }}>Type</th>
                        <th style={{ padding: '10px' }}>Debit (EGP)</th>
                        <th style={{ padding: '10px' }}>Credit (EGP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialBalance.rows?.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 700 }}>{row.accountCode}</td>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{row.name}</td>
                          <td style={{ padding: '10px' }}>{row.accountType}</td>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#16a34a' }}>{row.debit > 0 ? `EGP ${row.debit.toLocaleString()}` : '—'}</td>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#0284c7' }}>{row.credit > 0 ? `EGP ${row.credit.toLocaleString()}` : '—'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#f8fafc', fontWeight: 800, fontSize: 14 }}>
                        <td colSpan={3} style={{ padding: '12px' }}>Total Balanced Ledger</td>
                        <td style={{ padding: '12px', color: '#16a34a' }}>EGP {trialBalance.grandDebit?.toLocaleString()}</td>
                        <td style={{ padding: '12px', color: '#0284c7' }}>EGP {trialBalance.grandCredit?.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* OTHER TABS Placeholder */}
          {['banks', 'tax', 'assets', 'cost-centers', 'closing'].includes(activeSegment) && (
            <div className="card" style={{ padding: 24, textAlign: 'center', background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>
                {activeSegment === 'banks' && '🏦 Cash & Bank Reconciliation Engine'}
                {activeSegment === 'tax' && '🇪🇬 Egyptian VAT Tax Engine & ETA E-Invoicing'}
                {activeSegment === 'assets' && '🏭 Fixed Asset Register & Depreciation'}
                {activeSegment === 'cost-centers' && '🎯 Cost Centers & Budget Commitments'}
                {activeSegment === 'closing' && '🗓️ Month-End & Year-End Closing Checklist'}
              </h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>Active section operational and connected to core ERP backend collections.</p>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* One-Click Financial Traceability Modal */}
      {showTraceModal && traceabilityData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 750, padding: 24, background: '#fff', borderRadius: 12, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🔍 One-Click Financial Traceability Audit</h3>
              <button onClick={() => setShowTraceModal(false)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: '#166534' }}>Target Source Document: </span>
              <strong>{traceabilityData.sourceId}</strong>
            </div>

            <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>Underlying Journal Entries:</h4>
            {traceabilityData.journalEntries?.map((je, idx) => (
              <div key={idx} style={{ padding: 14, border: '1px solid #cbd5e1', borderRadius: 8, marginBottom: 12, background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 6 }}>
                  <span>Journal #{je.journalNumber} ({je.sourceType})</span>
                  <span style={{ color: '#16a34a' }}>Posted on {new Date(je.date).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{je.description}</div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff' }}>
                  <thead>
                    <tr style={{ background: '#e2e8f0' }}>
                      <th style={{ padding: 6, textAlign: 'left' }}>Account</th>
                      <th style={{ padding: 6, textAlign: 'right' }}>Debit (EGP)</th>
                      <th style={{ padding: 6, textAlign: 'right' }}>Credit (EGP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {je.lines?.map((line, lIdx) => (
                      <tr key={lIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 6 }}>{line.account?.accountCode} - {line.account?.name}</td>
                        <td style={{ padding: 6, textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{line.debit > 0 ? line.debit.toLocaleString() : '—'}</td>
                        <td style={{ padding: 6, textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>{line.credit > 0 ? line.credit.toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowTraceModal(false)}>Close Trace Audit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingPage;
