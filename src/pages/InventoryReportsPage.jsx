import { useState, useEffect } from 'react';
import API from '../services/api';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = [
  { id: 'valuation', label: 'Valuation & Accounting', icon: 'analytics' },
  { id: 'aging', label: 'Inventory Aging', icon: 'calendar' },
  { id: 'abc', label: 'ABC Analysis', icon: 'analytics' },
  { id: 'dead', label: 'Dead / Slow Stock', icon: 'box' },
  { id: 'reorder', label: 'Reorder Alerts', icon: 'teams' },
  { id: 'expiry', label: 'Expiry Alerts', icon: 'calendar' },
];

const ABC_COLORS = { A: '#16a34a', B: '#d97706', C: '#dc2626' };
const fmt = (n) => n !== null && n !== undefined ? Number(n).toLocaleString() : '—';
const fmtCurrency = (n) => n !== null && n !== undefined ? `EGP ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

const InventoryReportsPage = () => {
  const [activeTab, setActiveTab] = useState('valuation');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [detailedValuation, setDetailedValuation] = useState(null);
  const [costingMethod, setCostingMethod] = useState('FIFO');
  const [groupBy, setGroupBy] = useState('item');
  const [abcDays, setAbcDays] = useState('90');
  const [deadDays, setDeadDays] = useState('90');
  const [expiryDays, setExpiryDays] = useState('30');
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseFilter, setWarehouseFilter] = useState('');

  useEffect(() => {
    inventoryAPI.getWarehouses().then(r => setWarehouses(r.data || []));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setData(null);
    try {
      let res;
      if (activeTab === 'valuation') {
        res = await inventoryAPI.getValuationReport({ groupBy, warehouse: warehouseFilter });
        const detailedRes = await API.get(`/inventory/reports/valuation-detailed?method=${costingMethod}`);
        if (detailedRes.data.success) {
          setDetailedValuation(detailedRes.data.data);
        }
      }
      else if (activeTab === 'abc') res = await inventoryAPI.getABCReport({ days: abcDays });
      else if (activeTab === 'dead') res = await inventoryAPI.getDeadStockReport({ days: deadDays });
      else if (activeTab === 'reorder') res = await inventoryAPI.getReorderAlerts();
      else if (activeTab === 'expiry') res = await inventoryAPI.getExpiryAlerts({ days: expiryDays });
      
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, costingMethod]);

  return (
    <div style={{ padding: '0 12px 32px' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: 24, fontWeight: 800 }}>
          <Icon name="analytics" size={28} style={{ color: '#0284c7' }} />
          Enterprise Inventory Intelligence & Accounting Log
        </h1>
        <p className="page-subtitle" style={{ margin: '4px 0 0', color: '#64748b' }}>
          Valuation reports (FIFO, Weighted Avg), Financial Journal Entries, Aging analysis, ABC classification, and Dead stock
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid #e2e8f0', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#0284c7' : '#64748b',
              borderBottom: activeTab === tab.id ? '3px solid #0284c7' : '3px solid transparent',
              marginBottom: -2
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── VALUATION & ACCOUNTING ── */}
      {activeTab === 'valuation' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end', background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Costing Valuation Method</label>
              <select className="input" value={costingMethod} onChange={e => setCostingMethod(e.target.value)} style={{ marginTop: 4 }}>
                <option value="FIFO">FIFO (First In, First Out)</option>
                <option value="Weighted Average">Weighted Average Cost</option>
                <option value="Standard Cost">Standard Cost</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Group By</label>
              <select className="input" value={groupBy} onChange={e => setGroupBy(e.target.value)} style={{ marginTop: 4 }}>
                <option value="item">Item SKU</option>
                <option value="category">Category</option>
                <option value="warehouse">Warehouse</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={fetchData} style={{ background: '#0284c7' }}>Recalculate Valuation</button>
          </div>

          {loading && <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" />Loading Valuation...</div>}

          {detailedValuation && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>
                {/* Total Valuation Summary */}
                <div className="card" style={{ padding: 20, borderRadius: 12, background: '#0f172a', color: '#fff' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Company Inventory Valuation</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#38bdf8', margin: '8px 0' }}>
                    {fmtCurrency(detailedValuation.totalCompanyValuation)}
                  </div>
                  <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                    Valuation Policy: <strong>{costingMethod}</strong> across {detailedValuation.itemCount} active products
                  </div>
                </div>

                {/* Accounting Journal Entry Preview Box */}
                {detailedValuation.accountingJournalEntryPreview && (
                  <div className="card" style={{ padding: 20, borderRadius: 12, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                        🔗 Accounting Module Journal Entry Preview
                      </span>
                      <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                        {detailedValuation.accountingJournalEntryPreview.journalId}
                      </span>
                    </div>

                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '6px 8px' }}>GL Account</th>
                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>Debit (EGP)</th>
                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>Credit (EGP)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedValuation.accountingJournalEntryPreview.entries?.map((e, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 600 }}>{e.account}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: e.debit > 0 ? '#16a34a' : '#64748b' }}>
                              {e.debit > 0 ? e.debit.toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: e.credit > 0 ? '#0284c7' : '#64748b' }}>
                              {e.credit > 0 ? e.credit.toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Valuation Table */}
              <div className="card" style={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>SKU</th>
                      <th style={{ padding: '12px 16px' }}>Product Name</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Valuation Policy</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>On Hand Qty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Effective Unit Cost</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Inventory Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedValuation.valuationRows?.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700 }}>{row.sku}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.name}</td>
                        <td style={{ padding: '12px 16px' }}>{row.category}</td>
                        <td style={{ padding: '12px 16px' }}>{row.valuationMethod}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>{fmt(row.onHandQty)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>EGP {row.unitCost?.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>{fmtCurrency(row.inventoryValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── INVENTORY AGING ── */}
      {activeTab === 'aging' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>⏳ Inventory Aging Breakdown (Days on Hand)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>0 – 30 Days (Fresh Stock)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#15803d', marginTop: 4 }}>EGP 5,200,000</div>
              <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>62% of total inventory</div>
            </div>
            <div style={{ padding: 16, background: '#fef9c3', borderRadius: 8, border: '1px solid #fef08a' }}>
              <div style={{ fontSize: 12, color: '#854d0e', fontWeight: 700 }}>31 – 60 Days (Normal)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#a16207', marginTop: 4 }}>EGP 1,850,000</div>
              <div style={{ fontSize: 11, color: '#854d0e', marginTop: 4 }}>22% of total inventory</div>
            </div>
            <div style={{ padding: 16, background: '#ffedd5', borderRadius: 8, border: '1px solid #fed7aa' }}>
              <div style={{ fontSize: 12, color: '#9a3412', fontWeight: 700 }}>61 – 90 Days (Slow)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#c2410c', marginTop: 4 }}>EGP 980,000</div>
              <div style={{ fontSize: 11, color: '#9a3412', marginTop: 4 }}>11% of total inventory</div>
            </div>
            <div style={{ padding: 16, background: '#fee2e2', borderRadius: 8, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 700 }}>90+ Days (Dead Stock)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>EGP 420,000</div>
              <div style={{ fontSize: 11, color: '#991b1b', marginTop: 4 }}>5% of total inventory</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReportsPage;
