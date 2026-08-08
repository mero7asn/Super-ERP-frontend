import { useState, useEffect } from 'react';
import API from '../services/api';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const TABS = [
  { id: 'valuation', label: 'Valuation & accounting', icon: 'analytics' },
  { id: 'aging', label: 'Aging', icon: 'calendar' },
  { id: 'abc', label: 'ABC analysis', icon: 'analytics' },
  { id: 'dead', label: 'Dead / slow stock', icon: 'box' },
  { id: 'reorder', label: 'Reorder alerts', icon: 'teams' },
  { id: 'expiry', label: 'Expiry alerts', icon: 'calendar' },
];

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
    inventoryAPI.getWarehouses().then((r) => setWarehouses(r.data || []));
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
      } else if (activeTab === 'abc') res = await inventoryAPI.getABCReport({ days: abcDays });
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

  const summaryCards = [
    { label: 'Reports ready', value: 6, tone: '#0284c7' },
    { label: 'Alerts', value: data?.data?.length || 0, tone: '#d97706' },
    { label: 'Valuation', value: fmtCurrency(detailedValuation?.totalCompanyValuation), tone: '#16a34a' },
    { label: 'Costing policy', value: costingMethod, tone: '#7c3aed' }
  ];

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Inventory intelligence</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Inventory reports</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Review valuation, age, expiry, and reorder insights with a cleaner reporting workspace.</p>
          </div>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {summaryCards.map((card) => (
            <div key={card.label} style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{card.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: card.tone }}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '8px 14px', borderRadius: 999, border: activeTab === tab.id ? '1px solid #0284c7' : '1px solid #e2e8f0', background: activeTab === tab.id ? '#eff6ff' : '#fff', color: activeTab === tab.id ? '#0284c7' : '#475569', fontWeight: 700, cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'valuation' && (
        <div>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label className="form-label">Costing valuation method</label>
                <select className="form-input" value={costingMethod} onChange={(e) => setCostingMethod(e.target.value)}>
                  <option value="FIFO">FIFO</option>
                  <option value="Weighted Average">Weighted Average</option>
                  <option value="Standard Cost">Standard Cost</option>
                </select>
              </div>
              <div>
                <label className="form-label">Group by</label>
                <select className="form-input" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                  <option value="item">Item</option>
                  <option value="category">Category</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={fetchData}>Recalculate valuation</button>
            </div>
          </div>

          {loading && <div className="card" style={{ padding: 40, textAlign: 'center' }}>Loading valuation…</div>}

          {detailedValuation && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>
                <div className="card" style={{ padding: 20, background: '#0f172a', color: '#fff' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total inventory valuation</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#38bdf8', margin: '8px 0' }}>{fmtCurrency(detailedValuation.totalCompanyValuation)}</div>
                  <div style={{ fontSize: 12, color: '#cbd5e1' }}>Policy: <strong>{costingMethod}</strong> across {detailedValuation.itemCount} products</div>
                </div>
                {detailedValuation.accountingJournalEntryPreview && (
                  <div className="card" style={{ padding: 20, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Accounting journal preview</span>
                      <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>{detailedValuation.accountingJournalEntryPreview.journalId}</span>
                    </div>
                    <table className="table" style={{ fontSize: 13 }}>
                      <thead><tr><th>GL account</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th></tr></thead>
                      <tbody>
                        {detailedValuation.accountingJournalEntryPreview.entries?.map((entry, idx) => (
                          <tr key={idx}><td>{entry.account}</td><td style={{ textAlign: 'right', color: entry.debit > 0 ? '#16a34a' : '#64748b' }}>{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td><td style={{ textAlign: 'right', color: entry.credit > 0 ? '#0284c7' : '#64748b' }}>{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Policy</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit cost</th><th style={{ textAlign: 'right' }}>Value</th></tr></thead>
                  <tbody>
                    {detailedValuation.valuationRows?.map((row, i) => (
                      <tr key={i}><td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.sku}</td><td>{row.name}</td><td>{row.category}</td><td>{row.valuationMethod}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(row.onHandQty)}</td><td style={{ textAlign: 'right' }}>EGP {row.unitCost?.toLocaleString()}</td><td style={{ textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>{fmtCurrency(row.inventoryValue)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'aging' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Inventory aging</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))', gap: 16 }}>
            {[
              ['0–30 days', 'EGP 5,200,000', 'Fresh stock', '#f0fdf4', '#166534'],
              ['31–60 days', 'EGP 1,850,000', 'Normal', '#fef9c3', '#854d0e'],
              ['61–90 days', 'EGP 980,000', 'Slow moving', '#ffedd5', '#9a3412'],
              ['90+ days', 'EGP 420,000', 'Dead stock', '#fee2e2', '#991b1b']
            ].map(([label, value, note, bg, color]) => (
              <div key={label} style={{ padding: 16, background: bg, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{value}</div>
                <div style={{ fontSize: 11, color, marginTop: 4 }}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReportsPage;
