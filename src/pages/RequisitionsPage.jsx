import { useState, useEffect } from 'react';
import API from '../services/api';
import { Icon } from '../components/Icons';

const RequisitionsPage = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [department, setDepartment] = useState('Maintenance');
  const [purpose, setPurpose] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [selectedItem, setSelectedItem] = useState('');
  const [requestedQty, setRequestedQty] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, itemsRes, whRes] = await Promise.all([
        API.get('/inventory/requisitions'),
        API.get('/inventory/items'),
        API.get('/inventory/warehouses')
      ]);

      if (reqRes.data.success) setRequisitions(reqRes.data.data);
      if (itemsRes.data.success) setItems(itemsRes.data.data);
      if (whRes.data.success) setWarehouses(whRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    if (!selectedItem || requestedQty <= 0) return;

    try {
      const payload = {
        department,
        purpose,
        urgency,
        targetWarehouse: warehouses[0]?._id,
        items: [{ item: selectedItem, requestedQty }]
      };

      const res = await API.post('/inventory/requisitions', payload);
      if (res.data.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await API.post(`/inventory/requisitions/${id}/approve`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const summaryCards = [
    { label: 'Pending review', value: requisitions.filter((req) => req.status === 'Pending Approval').length, tone: '#d97706' },
    { label: 'Approved', value: requisitions.filter((req) => req.status === 'Approved').length, tone: '#16a34a' },
    { label: 'Urgent', value: requisitions.filter((req) => req.urgency === 'Critical' || req.urgency === 'High').length, tone: '#dc2626' },
    { label: 'Total requests', value: requisitions.length, tone: '#0284c7' }
  ];

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Inventory approvals</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Material requisitions</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Review internal requests, urgency, and approval status in a more structured flow.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> New request</button>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {summaryCards.map((card) => (
            <div key={card.label} style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{card.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: card.tone }}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>Loading requisitions…</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {requisitions.length > 0 ? requisitions.map((req) => (
            <div key={req._id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{req.requisitionNumber}</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{req.requester ? `${req.requester.firstName} ${req.requester.lastName}` : 'Employee'} • {req.department}</div>
                </div>
                <span className={`badge ${req.status === 'Approved' ? 'badge-converted' : req.status === 'Pending Approval' ? 'badge-warning' : 'badge-neutral'}`}>{req.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Purpose</div><div style={{ fontWeight: 700 }}>{req.purpose || 'Maintenance'}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Urgency</div><div style={{ fontWeight: 700 }}>{req.urgency}</div></div>
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Requested items</div><div style={{ fontWeight: 700 }}>{req.items?.length || 0}</div></div>
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>
                {req.items?.map((item, idx) => <div key={idx}>• {item.item?.name || 'Item'} — Qty {item.requestedQty}</div>)}
              </div>
              {req.status === 'Pending Approval' && (
                <button onClick={() => handleApprove(req._id)} className="btn btn-primary" style={{ marginTop: 12 }}>Approve request</button>
              )}
            </div>
          )) : <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No requisitions submitted yet.</div>}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 500, padding: 24, background: '#fff', borderRadius: 12 }}>
            <h3 style={{ margin: '0 0 16px' }}>Submit requisition</h3>
            <form onSubmit={handleCreateRequisition}>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Department</label>
                <select className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Production">Production</option>
                  <option value="Operations">Operations</option>
                  <option value="IT Support">IT Support</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Purpose / notes</label>
                <input type="text" className="form-input" placeholder="Replacement parts for Machine #4" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Urgency</label>
                <select className="form-input" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Requested item</label>
                <select className="form-input" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} required>
                  <option value="">Select item</option>
                  {items.map((item) => <option key={item._id} value={item._id}>{item.sku} - {item.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Requested quantity</label>
                <input type="number" className="form-input" min={1} value={requestedQty} onChange={(e) => setRequestedQty(Number(e.target.value))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitionsPage;
