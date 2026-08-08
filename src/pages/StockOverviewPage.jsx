import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const StockOverviewPage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ item: '', warehouse: '' });
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const navigate = useNavigate();

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const payload = { ...filter };
      if (warehouseFilter !== 'All') payload.warehouse = warehouseFilter;
      const { data } = await inventoryAPI.getStockLevels(payload);
      setStocks(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);

  const totalOnHand = stocks.reduce((sum, row) => sum + Number(row.onHand || 0), 0);
  const totalAvailable = stocks.reduce((sum, row) => sum + Number(row.available || 0), 0);
  const totalBlocked = stocks.reduce((sum, row) => sum + Number(row.blocked || 0), 0);

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Stock command</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Stock overview</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Monitor on-hand, available, allocated, and blocked stock by location.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/inventory/receiving')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> Receiving</button>
            <button className="btn btn-secondary" onClick={() => navigate('/inventory/shipping')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="teams" size={16} /> Shipping</button>
            <button className="btn btn-secondary" onClick={() => navigate('/inventory/transfers')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="analytics" size={16} /> Transfers</button>
          </div>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" placeholder="Filter by item ID" value={filter.item} onChange={(e) => setFilter((p) => ({ ...p, item: e.target.value }))} style={{ width: 200 }} />
          <input className="form-input" placeholder="Filter by warehouse" value={filter.warehouse} onChange={(e) => setFilter((p) => ({ ...p, warehouse: e.target.value }))} style={{ width: 200 }} />
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: 999, padding: '8px 12px' }}>
            <option value="All">All warehouses</option>
            <option value="WH-01">WH-01</option>
            <option value="WH-02">WH-02</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: 999, padding: '8px 12px' }}>
            <option value="All">All categories</option>
            <option value="General">General</option>
            <option value="Raw Material">Raw Material</option>
          </select>
          <button className="btn btn-primary" onClick={fetchStocks}>Apply</button>
          <button className="btn btn-secondary" onClick={() => { setFilter({ item: '', warehouse: '' }); setWarehouseFilter('All'); setCategoryFilter('All'); }}>Reset</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>On hand</div><div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7' }}>{totalOnHand}</div></div>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Available</div><div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{totalAvailable}</div></div>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Blocked</div><div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{totalBlocked}</div></div>
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
                  <th>Blocked</th>
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 ? (
                  <tr><td colSpan="11" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No stock records found.</td></tr>
                ) : stocks.map((stock) => (
                  <tr key={stock._id}>
                    <td style={{ fontWeight: 700 }}>{stock.item?.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{stock.item?.sku}</td>
                    <td>{stock.warehouse?.code}</td>
                    <td>{stock.subinventory}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{stock.locator || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{stock.lotNumber || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{stock.serialNumber || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{stock.onHand}</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>{stock.available}</td>
                    <td style={{ color: '#f59e0b' }}>{stock.allocated}</td>
                    <td style={{ color: '#dc2626' }}>{stock.blocked}</td>
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
