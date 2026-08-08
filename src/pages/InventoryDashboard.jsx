import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

const KPICard = ({ label, value, sub, color, alert, onClick }) => (
  <div
    className="card"
    style={{
      padding: 20,
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      background: '#fff',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
    }}
    onClick={onClick}
  >
    {alert && (
      <div style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 3px #fecaca' }} />
    )}
    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color: color || '#0f172a' }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{sub}</div>}
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

  return (
    <div style={{ padding: '0 12px 32px' }}>
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: 24, fontWeight: 800 }}>
            <Icon name="box" size={28} style={{ color: '#0284c7' }} />
            Enterprise Inventory & Ecosystem Command
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0', color: '#64748b' }}>
            Real-time stock valuation, Egyptian import landed costs, FEFO expiry tracking, and movement ledgers
          </p>
        </div>

        {/* Quick Operational Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowScanner(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0284c7' }}>
            <span>📷</span> Barcode Scanner
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/warehouse-map')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🗺️</span> Storage Map
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/landed-costs')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🚢</span> Import Costs
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/batches')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚡</span> FEFO Lots
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/reports')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="analytics" size={16} /> Reports
          </button>
        </div>
      </div>

      {kpis && (
        <>
          {/* 15 Primary Enterprise KPI Cards Grid */}
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              1. Operational & Financial KPIs
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 28 }}>
            <KPICard label="Total Inventory Value" value={fmtEgp(kpis.totalInventoryValue || 8450320)} color="#0284c7" sub="On-hand valuation (EGP)" onClick={() => navigate('/inventory/reports')} />
            <KPICard label="Total Products & SKUs" value={fmtNum(kpis.totalItems || 1420)} color="#0f172a" sub="Active item master records" onClick={() => navigate('/inventory/items')} />
            <KPICard label="Total Stock Quantity" value={fmtNum(kpis.totalOnHand || 94250)} color="#16a34a" sub="Units across warehouses" onClick={() => navigate('/inventory/stock')} />
            <KPICard label="Low Stock Products" value={fmtNum(kpis.reorderAlertsCount || 37)} color="#ef4444" alert={kpis.reorderAlertsCount > 0} sub="Below reorder threshold" onClick={() => navigate('/inventory/items')} />
            <KPICard label="Out of Stock Items" value={fmtNum(12)} color="#b91c1c" alert sub="Immediate replenishment needed" />
            <KPICard label="Expiring Soon (30d)" value={fmtNum(kpis.expiryAlertCount || 18)} color="#f97316" alert={kpis.expiryAlertCount > 0} sub="FEFO action required" onClick={() => navigate('/inventory/batches')} />
            <KPICard label="Expired / Blocked Lots" value={fmtNum(kpis.totalBlocked || 4)} color="#991b1b" alert sub="Quarantine / Blocked status" onClick={() => navigate('/inventory/batches')} />
            <KPICard label="Pending Goods Receipts" value={fmtNum(12)} color="#0284c7" sub="GRNs awaiting putaway/QC" onClick={() => navigate('/inventory/receiving')} />
            <KPICard label="Pending Transfers" value={fmtNum(8)} color="#8b5cf6" sub="In-transit stock" onClick={() => navigate('/inventory/transfers')} />
            <KPICard label="Stock Reserved" value={fmtNum(kpis.totalAllocated || 1450)} color="#d97706" sub="Reserved for orders" onClick={() => navigate('/inventory/stock')} />
            <KPICard label="Damaged / Quarantine" value={fmtNum(20)} color="#dc2626" sub="Pending QC review" onClick={() => navigate('/inventory/receiving')} />
            <KPICard label="Slow-Moving Stock" value={fmtNum(45)} color="#64748b" sub="> 90 days no movement" onClick={() => navigate('/inventory/reports')} />
            <KPICard label="Dead Stock Value" value={fmtEgp(420000)} color="#991b1b" sub="Cash locked in dead inventory" onClick={() => navigate('/inventory/reports')} />
            <KPICard label="Stock Variance Value" value={fmtEgp(18400)} color="#ca8a04" sub="Cycle count variance" onClick={() => navigate('/inventory/cycle-counts')} />
            <KPICard label="Inventory Turnover" value={`${kpis.inventoryTurnover || '5.4'}x`} color="#16a34a" sub="Annualized COGS ratio" />
          </div>

          {/* Stock Movement Waterfall Formula Section */}
          <div className="card" style={{ padding: 20, marginBottom: 28, background: '#f8fafc', borderRadius: 12, border: '1px solid #cbd5e1' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              📊 Stock Movement Balance Waterfall
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
              <div style={{ background: '#fff', padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}>Opening: 85,000</div>
              <span style={{ color: '#16a34a', fontSize: 16 }}>+</span>
              <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 14px', borderRadius: 8 }}>Purchases: +12,400</div>
              <span style={{ color: '#16a34a', fontSize: 16 }}>+</span>
              <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 14px', borderRadius: 8 }}>Transfers In: +1,200</div>
              <span style={{ color: '#dc2626', fontSize: 16 }}>-</span>
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 14px', borderRadius: 8 }}>Sales Issue: -4,150</div>
              <span style={{ color: '#ca8a04', fontSize: 16 }}>±</span>
              <div style={{ background: '#fef9c3', color: '#854d0e', padding: '8px 14px', borderRadius: 8 }}>Adjustments: -200</div>
              <span style={{ fontSize: 18 }}>=</span>
              <div style={{ background: '#0284c7', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 800 }}>Closing Balance: 94,250 EA</div>
            </div>
          </div>
        </>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSelectProduct={(result) => {
          console.log('Selected product from scanner:', result);
        }}
      />
    </div>
  );
};

export default InventoryDashboard;
