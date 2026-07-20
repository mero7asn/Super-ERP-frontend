import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const InventoryItemDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [stockLevels, setStockLevels] = useState([]);
  const [lots, setLots] = useState([]);
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: itemsData }, { data: stockData }, { data: lotsData }, { data: serialsData }] = await Promise.all([
          inventoryAPI.getItems(),
          inventoryAPI.getStockLevels({ item: id }),
          inventoryAPI.getLots({ item: id }),
          inventoryAPI.getSerials({ item: id })
        ]);
        const found = itemsData.data?.find(i => i._id === id);
        setItem(found || null);
        setStockLevels(stockData.data || []);
        setLots(lotsData.data || []);
        setSerials(serialsData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading-state"><div className="spinner" />Loading item details…</div>;
  if (!item) return <div className="empty-state"><p>Item not found</p></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="box" size={26} style={{ color: 'var(--accent-primary)' }} />
            {item.name}
          </h1>
          <p className="page-subtitle">SKU: {item.sku} | Category: {item.category} | Base UoM: {item.baseUom}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/inventory/items')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Back to Items
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/inventory/stock')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            View Stock
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
        {['overview', 'stock', 'lots', 'serials'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : 'none',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Item Master Data</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>SKU</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.sku}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Name</div>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Category</div>
              <div>{item.category}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Base UoM</div>
              <div>{item.baseUom}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Unit Cost</div>
              <div>${Number(item.unitCost).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Selling Price</div>
              <div>${Number(item.sellingPrice).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Lot Control</div>
              <div>{item.lotControl ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Serial Control</div>
              <div>{item.serialControl ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Shelf Life (Days)</div>
              <div>{item.shelfLifeDays}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Reorder Point</div>
              <div>{item.reorderPoint}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
              <div><span className={`badge ${item.status === 'Active' ? 'badge-converted' : 'badge-new'}`}>{item.status}</span></div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Description</div>
              <div>{item.description || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
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
                {stockLevels.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No stock levels for this item.</td></tr>
                ) : stockLevels.map(sl => (
                  <tr key={sl._id}>
                    <td>{sl.warehouse?.code}</td>
                    <td>{sl.subinventory}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sl.locator || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sl.lotNumber || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sl.serialNumber || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{sl.onHand}</td>
                    <td style={{ color: '#22c55e' }}>{sl.available}</td>
                    <td style={{ color: '#f59e0b' }}>{sl.allocated}</td>
                    <td style={{ color: '#ef4444' }}>{sl.blocked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'lots' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Lot Number</th>
                  <th>Warehouse</th>
                  <th>Subinventory</th>
                  <th>Locator</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {lots.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No lots for this item.</td></tr>
                ) : lots.map(lot => (
                  <tr key={lot._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{lot.lotNumber}</td>
                    <td>{lot.warehouse?.code}</td>
                    <td>{lot.subinventory}</td>
                    <td style={{ fontFamily: 'monospace' }}>{lot.locator || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{lot.quantity}</td>
                    <td><span className={`badge ${lot.status === 'Unrestricted' ? 'badge-converted' : 'badge-new'}`}>{lot.status}</span></td>
                    <td style={{ fontSize: 12 }}>{lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'serials' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Warehouse</th>
                  <th>Subinventory</th>
                  <th>Locator</th>
                  <th>Lot</th>
                  <th>Status</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
                {serials.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No serials for this item.</td></tr>
                ) : serials.map(sn => (
                  <tr key={sn._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{sn.serialNumber}</td>
                    <td>{sn.warehouse?.code}</td>
                    <td>{sn.subinventory}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sn.locator || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sn.lotNumber || '—'}</td>
                    <td><span className={`badge ${sn.status === 'Unrestricted' ? 'badge-converted' : 'badge-new'}`}>{sn.status}</span></td>
                    <td>{sn.condition}</td>
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

export default InventoryItemDetail;
