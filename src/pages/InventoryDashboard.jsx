import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="box" size={26} style={{ color: 'var(--accent-primary)' }} />
            Inventory Dashboard
          </h1>
          <p className="page-subtitle">Real-time inventory overview and KPIs</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/items')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="box" size={16} /> Manage Items
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/stock')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="analytics" size={16} /> Stock Overview
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/transactions')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="teams" size={16} /> Transactions
          </button>
        </div>
      </div>

      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Items</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-primary)' }}>{kpis.totalItems}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Warehouses</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-secondary)' }}>{kpis.totalWarehouses}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total On-Hand</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{kpis.totalOnHand?.toLocaleString()}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Available</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#06b6d4' }}>{kpis.totalAvailable?.toLocaleString()}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Allocated</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{kpis.totalAllocated?.toLocaleString()}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Blocked</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{kpis.totalBlocked?.toLocaleString()}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Transactions</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{kpis.totalTransactions?.toLocaleString()}</div>
          </div>
        </div>
      )}

      {kpis?.recentTransactions?.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Transactions</h3>
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
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{txn.transactionId}</td>
                    <td><span className="badge badge-new">{txn.type}</span></td>
                    <td>{txn.item?.sku} - {txn.item?.name}</td>
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
