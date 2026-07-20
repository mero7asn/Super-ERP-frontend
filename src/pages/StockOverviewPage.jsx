import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const StockOverviewPage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ item: '', warehouse: '' });
  const navigate = useNavigate();

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getStockLevels(filter);
      setStocks(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="analytics" size={26} style={{ color: 'var(--accent-primary)' }} />
            Stock Overview
          </h1>
          <p className="page-subtitle">On-hand, available, allocated, and blocked stock by location</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/receiving')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={16} /> Receiving
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/shipping')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="teams" size={16} /> Shipping
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/transfers')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="analytics" size={16} /> Transfers
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Filter by Item ID..." value={filter.item} onChange={e => setFilter(p => ({ ...p, item: e.target.value }))} style={{ width: 200 }} />
          <input className="form-input" placeholder="Filter by Warehouse ID..." value={filter.warehouse} onChange={e => setFilter(p => ({ ...p, warehouse: e.target.value }))} style={{ width: 200 }} />
          <button className="btn btn-primary" onClick={fetchStocks}>Apply</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading stock levels…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>SKU</th>
                  <th>Warehouse</th>
                  <th>Subinventory</th>
                  <th>Locator</th>
                  <th>Lot</th>
                  <th>Serial</th>
                  <th>On-Hand</th>
                  <th>Available</th>
                  <th>Allocated</th>
                  <th>Reserved</th>
                  <th>Blocked</th>
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 ? (
                  <tr><td colSpan="12" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No stock records found.</td></tr>
                ) : stocks.map(stock => (
                  <tr key={stock._id}>
                    <td style={{ fontWeight: 600 }}>{stock.item?.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{stock.item?.sku}</td>
                    <td>{stock.warehouse?.code}</td>
                    <td>{stock.subinventory}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{stock.locator || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{stock.lotNumber || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{stock.serialNumber || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{stock.onHand}</td>
                    <td style={{ color: '#22c55e', fontWeight: 600 }}>{stock.available}</td>
                    <td style={{ color: '#f59e0b' }}>{stock.allocated}</td>
                    <td>{stock.reserved}</td>
                    <td style={{ color: '#ef4444' }}>{stock.blocked}</td>
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

export default StockOverviewPage;
