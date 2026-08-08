import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

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
        const found = itemsData.data?.find((i) => i._id === id);
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

  const totalOnHand = stockLevels.reduce((sum, row) => sum + Number(row.onHand || 0), 0);
  const totalAvailable = stockLevels.reduce((sum, row) => sum + Number(row.available || 0), 0);

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Item detail</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>{item.name}</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>SKU: {item.sku} · Category: {item.category} · Base UOM: {item.baseUom}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/inventory/items')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Back to items</button>
            <button className="btn btn-primary" onClick={() => navigate('/inventory/stock')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="analytics" size={16} /> View stock</button>
          </div>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Unit cost</div><div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>EGP {Number(item.unitCost || 0).toLocaleString()}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Selling price</div><div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>EGP {Number(item.sellingPrice || 0).toLocaleString()}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>On hand</div><div style={{ fontSize: 18, fontWeight: 800, color: '#0284c7' }}>{totalOnHand}</div></div>
          <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Available</div><div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>{totalAvailable}</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['overview', 'stock', 'lots', 'serials'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 14px', borderRadius: 999, background: activeTab === tab ? '#0284c7' : '#f8fafc', color: activeTab === tab ? '#fff' : '#475569', fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer', textTransform: 'capitalize' }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Item master data</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>SKU</div><div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{item.sku}</div></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Name</div><div style={{ fontWeight: 700 }}>{item.name}</div></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Category</div><div>{item.category}</div></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Base UOM</div><div>{item.baseUom}</div></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Lot control</div><div>{item.lotControl ? 'Yes' : 'No'}</div></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Serial control</div><div>{item.serialControl ? 'Yes' : 'No'}</div></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Shelf life (days)</div><div>{item.shelfLifeDays}</div></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Reorder point</div><div>{item.reorderPoint}</div></div>
              <div><div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Description</div><div>{item.description || '—'}</div></div>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Recent activity snapshot</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>Stock levels across {stockLevels.length} warehouse locations</div>
              <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>{lots.length} lot records ready for FEFO review</div>
              <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>{serials.length} serial-tracked units available for audit</div>
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
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No stock levels for this item.</td></tr>
                ) : stockLevels.map((sl) => (
                  <tr key={sl._id}>
                    <td>{sl.warehouse?.code}</td>
                    <td>{sl.subinventory}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sl.locator || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sl.lotNumber || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{sl.serialNumber || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{sl.onHand}</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>{sl.available}</td>
                    <td style={{ color: '#f59e0b' }}>{sl.allocated}</td>
                    <td style={{ color: '#dc2626' }}>{sl.blocked}</td>
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
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No lots for this item.</td></tr>
                ) : lots.map((lot) => (
                  <tr key={lot._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{lot.lotNumber}</td>
                    <td>{lot.warehouse?.code}</td>
                    <td>{lot.subinventory}</td>
                    <td style={{ fontFamily: 'monospace' }}>{lot.locator || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{lot.quantity}</td>
                    <td><span className={`badge ${lot.status === 'Unrestricted' ? 'badge-converted' : 'badge-new'}`}>{lot.status}</span></td>
                    <td>{lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : '—'}</td>
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
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No serials for this item.</td></tr>
                ) : serials.map((sn) => (
                  <tr key={sn._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{sn.serialNumber}</td>
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
