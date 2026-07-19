import { useState } from 'react';
import { Icon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

const statusBadge = (status) => {
  const map = {
    Active: 'badge-converted',
    Draft: 'badge-new',
    Discontinued: 'badge-lost',
  };
  return map[status] || 'badge-new';
};

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', sku: '', price: '', description: '', imageUrl: '', status: 'Active',
  });

  const isAdmin = ['Super CRM Administrator', 'System Architect'].includes(user?.role);

  const handleCreate = () => {
    if (!form.name.trim()) return setError('Product name is required');
    if (!form.price || isNaN(parseFloat(form.price))) return setError('Valid price is required');
    if (!form.sku.trim()) return setError('SKU is required');

    setSaving(true);
    setError('');
    try {
      const product = {
        _id: `local-${Date.now()}`,
        ...form,
        price: parseFloat(form.price),
        createdBy: { firstName: user?.firstName, lastName: user?.lastName },
        createdAt: new Date().toISOString(),
      };
      setProducts(prev => [product, ...prev]);
      setShowModal(false);
      setForm({ name: '', sku: '', price: '', description: '', imageUrl: '', status: 'Active' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this product?')) return;
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="box" size={26} style={{ color: 'var(--accent-primary)' }} />
            Products
          </h1>
          <p className="page-subtitle">Manage your product catalog used in offers and orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> New Product
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>No products yet. Add your first product to start building offers.</p>
        </div>
      ) : (
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                          <Icon name="box" size={18} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{p.sku}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>${Number(p.price).toLocaleString()}</td>
                  <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td>{p.createdBy ? `${p.createdBy.firstName} ${p.createdBy.lastName}` : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {isAdmin && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(p._id)} style={{ color: 'var(--status-lost)' }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 560, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>New Product</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Add an item to your catalog</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Name</label>
                <input className="form-input" placeholder="e.g. Premium Plan" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">SKU</label>
                  <input className="form-input" placeholder="PRD-001" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Price ($)</label>
                  <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Describe the product..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Image URL (optional)</label>
                <input className="form-input" placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
