import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

const KPICard = ({ label, value, sub, color, alert, onClick }) => (
  <div
    className="card"
    style={{
      padding: 18,
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)'
    }}
    onClick={onClick}
  >
    {alert && <div style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 3px #fecaca' }} />}
    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: color || '#0f172a' }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>{sub}</div>}
  </div>
);

const InventoryDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
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

  if (loading) return <div className="loading-state"><div className="spinner" />Loading enterprise inventory dashboard…</div>;

  const fmtEgp = (n) => n != null ? `EGP ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
  const fmtNum = (n) => n != null ? Number(n).toLocaleString() : '—';
  const quickActions = [
    { label: 'Barcode Scan', icon: 'scan', path: null, primary: true },
    { label: 'Storage Map', icon: 'map', path: '/inventory/warehouse-map' },
    { label: 'Import Costs', icon: 'ship', path: '/inventory/landed-costs' },
    { label: 'FEFO Lots', icon: 'sparkles', path: '/inventory/batches' },
    { label: 'Reports', icon: 'analytics', path: '/inventory/reports' }
  ];

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Enterprise inventory command</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Inventory control center</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>Monitor stock health, exception alerts, warehouse flow, and landed cost exposure from a single premium workspace.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {quickActions.map((action) => (
              <button key={action.label} className={action.primary ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => action.path ? navigate(action.path) : setShowScanner(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={action.icon} size={16} /> {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {kpis && (
        <>
          <div className="crm-glass-card" style={{ padding: 18, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Operational & financial KPIs</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Updated in real time</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginTop: 16 }}>
              <KPICard label="Total Inventory Value" value={fmtEgp(kpis.totalInventoryValue ?? 0)} color="#0284c7" sub="On-hand valuation (EGP)" onClick={() => navigate('/inventory/reports')} />
              <KPICard label="Total Products & SKUs" value={fmtNum(kpis.totalItems ?? 0)} color="#0f172a" sub="Active item master records" onClick={() => navigate('/inventory/items')} />
              <KPICard label="Total Stock Quantity" value={fmtNum(kpis.totalOnHand ?? 0)} color="#16a34a" sub="Units across warehouses" onClick={() => navigate('/inventory/stock')} />
              <KPICard label="Low Stock Products" value={fmtNum(kpis.reorderAlertsCount ?? 0)} color="#ef4444" alert={(kpis.reorderAlertsCount ?? 0) > 0} sub="Below reorder threshold" onClick={() => navigate('/inventory/items')} />
              <KPICard label="Out of Stock Items" value={fmtNum(kpis.outOfStockCount ?? 0)} color="#b91c1c" alert={(kpis.outOfStockCount ?? 0) > 0} sub="Immediate replenishment needed" />
              <KPICard label="Expiring Soon (30d)" value={fmtNum(kpis.expiryAlertCount ?? 0)} color="#f97316" alert={(kpis.expiryAlertCount ?? 0) > 0} sub="FEFO action required" onClick={() => navigate('/inventory/batches')} />
              <KPICard label="Expired / Blocked Lots" value={fmtNum(kpis.totalBlocked ?? 0)} color="#991b1b" alert={(kpis.totalBlocked ?? 0) > 0} sub="Quarantine / Blocked status" onClick={() => navigate('/inventory/batches')} />
              <KPICard label="Pending Goods Receipts" value={fmtNum(kpis.pendingReceivingCount ?? 0)} color="#0284c7" sub="GRNs awaiting putaway/QC" onClick={() => navigate('/inventory/receiving')} />
              <KPICard label="Pending Transfers" value={fmtNum(kpis.pendingTransfersCount ?? 0)} color="#8b5cf6" sub="In-transit stock" onClick={() => navigate('/inventory/transfers')} />
              <KPICard label="Stock Reserved" value={fmtNum(kpis.totalAllocated ?? 0)} color="#d97706" sub="Reserved for orders" onClick={() => navigate('/inventory/stock')} />
              <KPICard label="Damaged / Quarantine" value={fmtNum(kpis.damagedCount ?? 0)} color="#dc2626" sub="Pending QC review" onClick={() => navigate('/inventory/receiving')} />
              <KPICard label="Slow-Moving Stock" value={fmtNum(kpis.slowMovingCount ?? 0)} color="#64748b" sub="> 90 days no movement" onClick={() => navigate('/inventory/reports')} />
              <KPICard label="Dead Stock Value" value={fmtEgp(kpis.deadStockValue ?? 0)} color="#991b1b" sub="Cash locked in dead inventory" onClick={() => navigate('/inventory/reports')} />
              <KPICard label="Stock Variance Value" value={fmtEgp(kpis.stockVarianceValue ?? 0)} color="#ca8a04" sub="Cycle count variance" onClick={() => navigate('/inventory/cycle-counts')} />
              <KPICard label="Inventory Turnover" value={kpis.inventoryTurnover != null ? `${kpis.inventoryTurnover}x` : '—'} color="#16a34a" sub="Annualized COGS ratio" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
            <div className="crm-glass-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Stock movement balance</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>Opening: {fmtNum(kpis.openingStock ?? 0)}</div>
                <span style={{ color: '#16a34a', fontSize: 16 }}>+</span>
                <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: 10 }}>Purchases: +{fmtNum(kpis.totalReceived ?? 0)}</div>
                <span style={{ color: '#16a34a', fontSize: 16 }}>+</span>
                <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: 10 }}>Transfers In: +{fmtNum(kpis.transfersIn ?? 0)}</div>
                <span style={{ color: '#dc2626', fontSize: 16 }}>-</span>
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: 10 }}>Issue: -{fmtNum(kpis.totalIssued ?? 0)}</div>
                <span style={{ color: '#ca8a04', fontSize: 16 }}>±</span>
                <div style={{ background: '#fef9c3', color: '#854d0e', padding: '8px 12px', borderRadius: 10 }}>Adjustments: {kpis.totalAdjusted != null ? (kpis.totalAdjusted >= 0 ? '+' : '') + fmtNum(kpis.totalAdjusted) : '0'}</div>
              </div>
              <div style={{ marginTop: 16, padding: '12px 14px', background: '#0284c7', color: '#fff', borderRadius: 12, fontWeight: 800, textAlign: 'center' }}>Closing Balance: {fmtNum(kpis.totalOnHand ?? 0)} EA</div>
            </div>
            <div className="crm-glass-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Priority alerts</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}><strong>{kpis.reorderAlertsCount ?? 0}</strong> items below reorder point</div>
                <div style={{ padding: 12, borderRadius: 12, background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}><strong>{kpis.expiryAlertCount ?? 0}</strong> batches nearing expiry</div>
                <div style={{ padding: 12, borderRadius: 12, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534' }}><strong>{kpis.pendingReceivingCount ?? 0}</strong> goods receipts pending</div>
              </div>
            </div>
          </div>
        </>
      )}

      <BarcodeScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onSelectProduct={(result) => { console.log('Selected product from scanner:', result); }} />
    </div>
  );
};

export default InventoryDashboard;
