import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const TABS = [
  { id: 'valuation', label: 'Valuation', icon: 'analytics' },
  { id: 'abc', label: 'ABC Analysis', icon: 'analytics' },
  { id: 'dead', label: 'Dead Stock', icon: 'box' },
  { id: 'reorder', label: 'Reorder Alerts', icon: 'teams' },
  { id: 'expiry', label: 'Expiry Alerts', icon: 'calendar' },
];

const ABC_COLORS = { A: '#22c55e', B: '#f59e0b', C: '#ef4444' };
const fmt = (n) => n !== null && n !== undefined ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—';
const fmtCurrency = (n) => n !== null && n !== undefined ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

const InventoryReportsPage = () => {
  const [activeTab, setActiveTab] = useState('valuation');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
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
      if (activeTab === 'valuation') res = await inventoryAPI.getValuationReport({ groupBy, warehouse: warehouseFilter });
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

  useEffect(() => { fetchData(); }, [activeTab]);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="analytics" size={26} style={{ color: 'var(--accent-primary)' }} />
          Inventory Intelligence Reports
        </h1>
        <p className="page-subtitle">Valuation, ABC analysis, dead stock, reorder alerts, and expiry monitoring</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--border-color)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 400,
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              marginBottom: -2
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── VALUATION ── */}
      {activeTab === 'valuation' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Group By</label>
              <select className="form-control" style={{ maxWidth: 160 }} value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                <option value="item">Item (SKU)</option>
                <option value="category">Category</option>
                <option value="warehouse">Warehouse</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Warehouse</label>
              <select className="form-control" style={{ maxWidth: 200 }} value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
                <option value="">All Warehouses</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} — {w.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={fetchData}>Run Report</button>
          </div>

          {loading && <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>}

          {data && (
            <>
              <div className="card" style={{ padding: 16, marginBottom: 16, display: 'inline-block' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Inventory Value</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-primary)' }}>{fmtCurrency(data.grandTotal)}</div>
              </div>

              {data.data?.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data.data.slice(0, 15)} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                      <XAxis dataKey="_id" angle={-40} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => fmtCurrency(v)} />
                      <Bar dataKey="totalValue" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{groupBy === 'item' ? 'SKU' : groupBy === 'category' ? 'Category' : 'Warehouse'}</th>
                        <th>Label</th>
                        <th style={{ textAlign: 'right' }}>On Hand</th>
                        <th style={{ textAlign: 'right' }}>Available</th>
                        <th style={{ textAlign: 'right' }}>Allocated</th>
                        <th style={{ textAlign: 'right' }}>Blocked</th>
                        <th style={{ textAlign: 'right' }}>Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((row, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{row._id}</td>
                          <td>{row.label}</td>
                          <td style={{ textAlign: 'right' }}>{fmt(row.totalOnHand)}</td>
                          <td style={{ textAlign: 'right', color: '#22c55e' }}>{fmt(row.totalAvailable)}</td>
                          <td style={{ textAlign: 'right', color: '#f59e0b' }}>{fmt(row.totalAllocated)}</td>
                          <td style={{ textAlign: 'right', color: '#ef4444' }}>{fmt(row.totalBlocked)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtCurrency(row.totalValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ABC ANALYSIS ── */}
      {activeTab === 'abc' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Analysis Period (days)</label>
              <select className="form-control" style={{ maxWidth: 160 }} value={abcDays} onChange={e => setAbcDays(e.target.value)}>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 180 days</option>
                <option value="365">Last 365 days</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={fetchData}>Run Analysis</button>
          </div>

          {loading && <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>}

          {data && (
            <>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                {['A', 'B', 'C'].map(cls => {
                  const count = data.data?.filter(d => d.abcClass === cls).length || 0;
                  const value = data.data?.filter(d => d.abcClass === cls).reduce((a, d) => a + (d.totalValue || 0), 0) || 0;
                  return (
                    <div key={cls} className="card" style={{ padding: 16, minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: ABC_COLORS[cls], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>{cls}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Class {cls} Items</span>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>{count}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{fmtCurrency(value)} revenue</div>
                    </div>
                  );
                })}
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Period COGS</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtCurrency(data.grandTotal)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.period}</div>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Class</th>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th style={{ textAlign: 'right' }}>Units Issued</th>
                        <th style={{ textAlign: 'right' }}>Revenue Value</th>
                        <th style={{ textAlign: 'right' }}>Cumulative %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data?.map((item, i) => (
                        <tr key={i}>
                          <td>
                            <span style={{ padding: '3px 10px', borderRadius: 12, background: ABC_COLORS[item.abcClass] + '22', color: ABC_COLORS[item.abcClass], fontWeight: 700, fontSize: 12 }}>
                              {item.abcClass}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{item.sku}</td>
                          <td>{item.name}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.category}</td>
                          <td style={{ textAlign: 'right' }}>{fmt(item.totalIssued)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtCurrency(item.totalValue)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                              <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--border-color)', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, item.cumulativePct)}%`, height: '100%', background: ABC_COLORS[item.abcClass] }} />
                              </div>
                              <span style={{ fontSize: 12 }}>{item.cumulativePct}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── DEAD STOCK ── */}
      {activeTab === 'dead' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>No movement in (days)</label>
              <select className="form-control" style={{ maxWidth: 160 }} value={deadDays} onChange={e => setDeadDays(e.target.value)}>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={fetchData}>Run Report</button>
          </div>

          {loading && <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>}

          {data && (
            <>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dead Stock Items</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{data.count}</div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Dead Stock Value</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                    {fmtCurrency(data.data?.reduce((a, d) => a + (d.totalValue || 0), 0))}
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th style={{ textAlign: 'right' }}>On Hand</th>
                        <th style={{ textAlign: 'right' }}>Value</th>
                        <th>Last Movement</th>
                        <th style={{ textAlign: 'right' }}>Days Since Move</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data?.map((item, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{item.sku}</td>
                          <td>{item.name}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.category}</td>
                          <td style={{ textAlign: 'right' }}>{fmt(item.totalOnHand)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>{fmtCurrency(item.totalValue)}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {item.lastTransactionDate ? new Date(item.lastTransactionDate).toLocaleDateString() : 'Never'}
                          </td>
                          <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                            {item.daysSinceLastMovement ? Math.round(item.daysSinceLastMovement) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── REORDER ALERTS ── */}
      {activeTab === 'reorder' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button className="btn btn-primary" onClick={fetchData}>Refresh Alerts</button>
          </div>

          {loading && <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>}

          {data && (
            <>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Items Below Reorder Point</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{data.count}</div>
                </div>
              </div>
              {data.count === 0 ? (
                <div className="card" style={{ padding: 32, textAlign: 'center', color: '#22c55e', fontWeight: 600 }}>
                  All items are above their reorder points.
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th style={{ textAlign: 'right' }}>Available</th>
                          <th style={{ textAlign: 'right' }}>Reorder Point</th>
                          <th style={{ textAlign: 'right' }}>Max Stock</th>
                          <th style={{ textAlign: 'right' }}>Min Order Qty</th>
                          <th style={{ textAlign: 'right' }}>Shortage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.data?.map((item, i) => (
                          <tr key={i}>
                            <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{item.sku}</td>
                            <td>{item.name}</td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.category}</td>
                            <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>{fmt(item.totalAvailable)}</td>
                            <td style={{ textAlign: 'right' }}>{fmt(item.reorderPoint)}</td>
                            <td style={{ textAlign: 'right' }}>{fmt(item.maxStockLevel)}</td>
                            <td style={{ textAlign: 'right' }}>{fmt(item.minOrderQty)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b' }}>{fmt(item.shortage)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── EXPIRY ALERTS ── */}
      {activeTab === 'expiry' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Expiring within (days)</label>
              <select className="form-control" style={{ maxWidth: 160 }} value={expiryDays} onChange={e => setExpiryDays(e.target.value)}>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={fetchData}>Refresh</button>
          </div>

          {loading && <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>}

          {data && (
            <>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lots Expiring</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: data.count > 0 ? '#f59e0b' : '#22c55e' }}>{data.count}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>within {data.horizon}</div>
                </div>
              </div>
              {data.count === 0 ? (
                <div className="card" style={{ padding: 32, textAlign: 'center', color: '#22c55e', fontWeight: 600 }}>
                  No lots expiring in the next {expiryDays} days.
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Lot Number</th>
                          <th>SKU</th>
                          <th>Item Name</th>
                          <th>Warehouse</th>
                          <th>Subinventory</th>
                          <th style={{ textAlign: 'right' }}>Quantity</th>
                          <th>Expiry Date</th>
                          <th style={{ textAlign: 'right' }}>Days Left</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.data?.map((lot, i) => {
                          const urgency = lot.daysUntilExpiry <= 7 ? '#ef4444' : lot.daysUntilExpiry <= 14 ? '#f97316' : '#f59e0b';
                          return (
                            <tr key={i}>
                              <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{lot.lotNumber}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{lot.item?.sku}</td>
                              <td>{lot.item?.name}</td>
                              <td>{lot.warehouse?.code}</td>
                              <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lot.subinventory}</td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(lot.quantity)}</td>
                              <td>{lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : '—'}</td>
                              <td style={{ textAlign: 'right' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 12, background: urgency + '22', color: urgency, fontWeight: 700, fontSize: 12 }}>
                                  {lot.daysUntilExpiry}d
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryReportsPage;
