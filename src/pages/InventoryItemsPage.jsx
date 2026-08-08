import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const InventoryItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('basic'); // 'basic' | 'variants' | 'uom' | 'tax'

  const [form, setForm] = useState({
    name: '', nameAr: '', sku: '', supplierSku: '', barcode: '', barcodeType: 'Code 128',
    description: '', descriptionAr: '', category: 'General', subcategory: '', productType: 'Stock Item',
    baseUom: 'EA', unitCost: '', sellingPrice: '', status: 'Active',
    valuationMethod: 'FIFO', abcClassification: 'B', vatRate: 14.0, taxCategory: 'Standard VAT', hsCode: '',
    lotControl: false, serialControl: false, shelfLifeDays: 0, reorderPoint: 0, maxStockLevel: 0, safetyStock: 0
  });

  // Variant Matrix Generator State
  const [matrixProduct, setMatrixProduct] = useState(null);
  const [matrixColors, setMatrixColors] = useState('Black, White, Navy');
  const [matrixSizes, setMatrixSizes] = useState('M, L, XL, 2XL');
  const [matrixBaseCost, setMatrixBaseCost] = useState(150);
  const [matrixBasePrice, setMatrixBasePrice] = useState(350);

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getItems({ limit: 100 });
      setItems(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '', nameAr: '', sku: '', supplierSku: '', barcode: '', barcodeType: 'Code 128',
      description: '', descriptionAr: '', category: 'General', subcategory: '', productType: 'Stock Item',
      baseUom: 'EA', unitCost: '', sellingPrice: '', status: 'Active',
      valuationMethod: 'FIFO', abcClassification: 'B', vatRate: 14.0, taxCategory: 'Standard VAT', hsCode: '',
      lotControl: false, serialControl: false, shelfLifeDays: 0, reorderPoint: 0, maxStockLevel: 0, safetyStock: 0
    });
    setShowModal(true);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    if (!form.name.trim() || !form.sku.trim()) return setError('Name and SKU are required');

    try {
      if (editing) {
        await inventoryAPI.updateItem(editing._id, form);
      } else {
        await inventoryAPI.createItem(form);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleGenerateMatrix = async (e) => {
    e.preventDefault();
    if (!matrixProduct) return;

    try {
      const colors = matrixColors.split(',').map(c => c.trim()).filter(Boolean);
      const sizes = matrixSizes.split(',').map(s => s.trim()).filter(Boolean);

      const res = await API.post('/inventory/variants/generate-matrix', {
        productId: matrixProduct._id,
        colors,
        sizes,
        basePrice: Number(matrixBasePrice),
        baseCost: Number(matrixBaseCost)
      });

      if (res.data.success) {
        setShowMatrixModal(false);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner" />Loading enterprise item master catalog…</div>;

  return (
    <div style={{ padding: '0 12px 32px' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: 24, fontWeight: 800 }}>
            <Icon name="box" size={28} style={{ color: '#0284c7' }} />
            Item Master & Product Matrix
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0', color: '#64748b' }}>
            Bilingual product master (Arabic/English), Color × Size variant matrices, barcodes, UOM conversions, and Egyptian VAT rates
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0284c7' }}>
            <Icon name="plus" size={16} /> New Product Item
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>SKU & Supplier SKU</th>
                <th style={{ padding: '12px 16px' }}>Item Name (Arabic / EN)</th>
                <th style={{ padding: '12px 16px' }}>Category & Type</th>
                <th style={{ padding: '12px 16px' }}>Base UOM</th>
                <th style={{ padding: '12px 16px' }}>Cost & Price (EGP)</th>
                <th style={{ padding: '12px 16px' }}>Costing Method</th>
                <th style={{ padding: '12px 16px' }}>ABC</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No inventory items found.</td></tr>
              ) : items.map(item => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                    <div>{item.sku}</div>
                    {item.supplierSku && <div style={{ fontSize: 11, color: '#0369a1' }}>SUP: {item.supplierSku}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                    {item.nameAr && <div style={{ fontSize: 12, color: '#16a34a', direction: 'rtl' }}>{item.nameAr}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{item.category}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.productType || 'Stock Item'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>{item.baseUom}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    <div>EGP {Number(item.unitCost || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#16a34a' }}>Sell: EGP {Number(item.sellingPrice || 0).toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: '#f1f5f9' }}>
                      {item.valuationMethod || 'FIFO'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800,
                      background: item.abcClassification === 'A' ? '#dcfce7' : item.abcClassification === 'B' ? '#fef3c7' : '#f1f5f9',
                      color: item.abcClassification === 'A' ? '#15803d' : item.abcClassification === 'B' ? '#92400e' : '#475569'
                    }}>
                      Class {item.abcClassification || 'B'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: item.status === 'Active' ? '#dcfce7' : '#fee2e2', color: item.status === 'Active' ? '#15803d' : '#b91c1c' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => {
                          setMatrixProduct(item);
                          setShowMatrixModal(true);
                        }}
                      >
                        Matrix
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => navigate(`/inventory/items/${item._id}`)}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Form Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 28, maxWidth: 680, width: '100%',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>New Inventory Product Item</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Complete Item Master with Arabic localization and Egyptian Tax rules</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>SKU (Internal) *</label>
                <input className="input" placeholder="FE-TSH-BLK-M" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value.toUpperCase() }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Supplier SKU</label>
                <input className="input" placeholder="SUP-4589" value={form.supplierSku} onChange={e => setForm(p => ({ ...p, supplierSku: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>English Product Name *</label>
                <input className="input" placeholder="Cotton T-Shirt Black M" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Arabic Product Name (اسم المنتج بالعربية)</label>
                <input className="input" placeholder="تيشيرت قطن أسود مقاس M" value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} style={{ width: '100%', marginTop: 4, direction: 'rtl' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Category</label>
                <input className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Product Type</label>
                <select className="input" value={form.productType} onChange={e => setForm(p => ({ ...p, productType: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
                  <option value="Stock Item">Stock Item</option>
                  <option value="Raw Material">Raw Material</option>
                  <option value="Finished Product">Finished Product</option>
                  <option value="Spare Part">Spare Part</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Base UOM</label>
                <input className="input" value={form.baseUom} onChange={e => setForm(p => ({ ...p, baseUom: e.target.value.toUpperCase() }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Unit Cost (EGP)</label>
                <input type="number" className="input" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Selling Price (EGP)</label>
                <input type="number" className="input" value={form.sellingPrice} onChange={e => setForm(p => ({ ...p, sellingPrice: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Valuation Method</label>
                <select className="input" value={form.valuationMethod} onChange={e => setForm(p => ({ ...p, valuationMethod: e.target.value }))} style={{ width: '100%', marginTop: 4 }}>
                  <option value="FIFO">FIFO (First In First Out)</option>
                  <option value="Weighted Average">Weighted Average</option>
                  <option value="Standard Cost">Standard Cost</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Egyptian VAT %</label>
                <input type="number" className="input" value={form.vatRate} onChange={e => setForm(p => ({ ...p, vatRate: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Customs HS Code</label>
                <input type="text" className="input" placeholder="e.g. 6109.10.00" value={form.hsCode} onChange={e => setForm(p => ({ ...p, hsCode: e.target.value }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn" style={{ background: '#f1f5f9' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Variant Matrix Generator Modal */}
      {showMatrixModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 520, padding: 24, background: '#fff', borderRadius: 12 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>⚡ Product Variant Matrix Generator</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
              Generate Color × Size variant combinations automatically with individual SKUs and barcodes for {matrixProduct?.sku}
            </p>
            <form onSubmit={handleGenerateMatrix}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Colors (comma separated)</label>
                <input type="text" className="input" value={matrixColors} onChange={e => setMatrixColors(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Sizes (comma separated)</label>
                <input type="text" className="input" value={matrixSizes} onChange={e => setMatrixSizes(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Base Cost (EGP)</label>
                  <input type="number" className="input" value={matrixBaseCost} onChange={e => setMatrixBaseCost(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Base Price (EGP)</label>
                  <input type="number" className="input" value={matrixBasePrice} onChange={e => setMatrixBasePrice(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowMatrixModal(false)} className="btn" style={{ background: '#f1f5f9' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Variant Grid</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryItemsPage;
