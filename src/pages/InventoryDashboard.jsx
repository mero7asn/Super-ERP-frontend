import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const KPICard = ({ label, value, sub, color, alert, onClick }) => (
  <div className="card" style={{ padding: 20, cursor: onClick ? 'pointer' : 'default', position: 'relative' }}
    onClick={onClick}>
    {alert && (
      <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 3px #fecaca' }} />
    )}
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const InventoryDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const { data } = await inventoryAPI.getKPIs();
        setKpis(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" />Loading inventory dashboard…</div>;

  const fmtCurrency = (n) => n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
  const fmtPct = (n) => n != null ? `${n}%` : '—';
  const fmtNum = (n) => n != null ? Number(n).toLocaleString() : '—';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="box" size={26} style={{ color: 'var(--accent-primary)' }} />
            Inventory Dashboard
          </h1>
          <p className="page-subtitle">Real-time inventory overview and enterprise KPIs</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/items')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="box" size={16} /> Items
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/stock')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="analytics" size={16} /> Stock
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/pick-tasks')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="teams" size={16} /> Pick Tasks
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/reports')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="analytics" size={16} /> Reports
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/transactions')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="teams" size={16} /> Transactions
          </button>
        </div>
      </div>

      {kpis && (
        <>
          {/* ── Operational Stock Counts ── */}
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Stock Overview
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            <KPICard label="Active Items" value={fmtNum(kpis.totalItems)} color="var(--accent-primary)" />
            <KPICard label="Warehouses" value={fmtNum(kpis.totalWarehouses)} color="var(--accent-secondary)" />
            <KPICard label="Total On-Hand" value={fmtNum(kpis.totalOnHand)} color="#22c55e" />
            <KPICard label="Available" value={fmtNum(kpis.totalAvailable)} color="#06b6d4" />
            <KPICard label="Allocated" value={fmtNum(kpis.totalAllocated)} color="#f59e0b" />
            <KPICard label="Blocked" value={fmtNum(kpis.totalBlocked)} color="#ef4444" />
            <KPICard label="Inventory Value" value={fmtCurrency(kpis.totalInventoryValue)} color="var(--accent-primary)"
              sub="On-hand × unit cost"
              onClick={() => navigate('/inventory/reports')} />
            <KPICard label="Total Transactions" value={fmtNum(kpis.totalTransactions)} />
          </div>

          {/* ── Enterprise Performance KPIs ── */}
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Performance KPIs
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            <KPICard
              label="Inventory Turnover"
              value={kpis.inventoryTurnover != null ? `${kpis.inventoryTurnover}x` : '—'}
              color={kpis.inventoryTurnover > 6 ? '#22c55e' : kpis.inventoryTurnover > 3 ? '#f59e0b' : '#ef4444'}
              sub="Annualized (90-day COGS)"
            />
            <KPICard
              label="Days on Hand"
              value={kpis.daysOnHand != null ? `${kpis.daysOnHand}d` : '—'}
              color={kpis.daysOnHand < 30 ? '#22c55e' : kpis.daysOnHand < 60 ? '#f59e0b' : '#ef4444'}
              sub="Avg days stock will last"
            />
            <KPICard
              label="Stock Accuracy"
              value={fmtPct(kpis.stockAccuracy)}
              color={kpis.stockAccuracy >= 99 ? '#22c55e' : kpis.stockAccuracy >= 95 ? '#f59e0b' : '#ef4444'}
              sub="From last 30-day cycle counts"
            />
            <KPICard
              label="Order Fill Rate"
              value={fmtPct(kpis.fillRate)}
              color={kpis.fillRate >= 95 ? '#22c55e' : kpis.fillRate >= 85 ? '#f59e0b' : '#ef4444'}
              sub="Shipments completed on time (30d)"
            />
          </div>

          {/* ── Alerts ── */}
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Active Alerts
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
            <KPICard
              label="Reorder Alerts"
              value={fmtNum(kpis.reorderAlertsCount)}
              color={kpis.reorderAlertsCount > 0 ? '#ef4444' : '#22c55e'}
              alert={kpis.reorderAlertsCount > 0}
              sub="Items below reorder point"
              onClick={() => navigate('/inventory/reports')}
            />
            <KPICard
              label="Expiry Alerts"
              value={fmtNum(kpis.expiryAlertCount)}
              color={kpis.expiryAlertCount > 0 ? '#f97316' : '#22c55e'}
              alert={kpis.expiryAlertCount > 0}
              sub="Lots expiring in 30 days"
              onClick={() => navigate('/inventory/reports')}
            />
            <KPICard
              label="Open Pick Tasks"
              value={fmtNum(kpis.openPickTasks)}
              color={kpis.openPickTasks > 0 ? '#3b82f6' : '#22c55e'}
              sub="Draft / Assigned / In Progress"
              onClick={() => navigate('/inventory/pick-tasks')}
            />
            <KPICard
              label="Exception Queue"
              value={fmtNum(kpis.adjustmentsByStatus?.find(a => a._id === 'Pending')?.count || 0)}
              color="#f59e0b"
              sub="Pending adjustments for review"
              onClick={() => navigate('/inventory/adjustments')}
            />
          </div>

          {/* ── Adjustments by Status ── */}
          {kpis.adjustmentsByStatus?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Adjustment Pipeline
              </h3>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {kpis.adjustmentsByStatus.map(a => {
                  const colorMap = { Pending: '#f59e0b', Approved: '#3b82f6', Posted: '#22c55e', Rejected: '#ef4444' };
                  return (
                    <div key={a._id} className="card" style={{ padding: '14px 20px', minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{a._id}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: colorMap[a._id] || 'var(--text-primary)' }}>{a.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Recent Transactions ── */}
      {kpis?.recentTransactions?.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Transactions</h3>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => navigate('/inventory/transactions')}>
              View All
            </button>
          </div>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Warehouse</th>
                  <th>Qty</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {kpis.recentTransactions.map(txn => (
                  <tr key={txn._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{txn.transactionId}</td>
                    <td><span className="badge badge-new">{txn.type}</span></td>
                    <td>{txn.item?.sku} — {txn.item?.name}</td>
                    <td>{txn.warehouse?.code}</td>
                    <td style={{ fontWeight: 600 }}>{txn.quantity}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(txn.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
