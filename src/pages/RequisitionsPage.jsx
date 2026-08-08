import React, { useState, useEffect } from 'react';
import API from '../services/api';

const RequisitionsPage = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
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

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#0f172a' }}>📋 Internal Material Requisitions</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            Employees & departments request spare parts, materials, and equipment from central inventory
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          + New Material Request
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center' }}>Loading Material Requisitions...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Requisition #</th>
                <th style={{ padding: '12px 16px' }}>Requester & Dept</th>
                <th style={{ padding: '12px 16px' }}>Purpose</th>
                <th style={{ padding: '12px 16px' }}>Items Requested</th>
                <th style={{ padding: '12px 16px' }}>Urgency</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.length > 0 ? (
                requisitions.map((req) => (
                  <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{req.requisitionNumber}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{req.requester ? `${req.requester.firstName} ${req.requester.lastName}` : 'Employee'}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{req.department}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{req.purpose || 'Maintenance'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {req.items?.map((i, idx) => (
                        <div key={idx} style={{ fontSize: 13, fontWeight: 600 }}>
                          • {i.item?.name || 'Item'} (Req: {i.requestedQty})
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: req.urgency === 'High' || req.urgency === 'Critical' ? '#fee2e2' : '#f1f5f9',
                        color: req.urgency === 'High' || req.urgency === 'Critical' ? '#991b1b' : '#334155'
                      }}>
                        {req.urgency}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: req.status === 'Approved' ? '#dcfce7' : req.status === 'Pending Approval' ? '#fef3c7' : '#f1f5f9',
                        color: req.status === 'Approved' ? '#166534' : req.status === 'Pending Approval' ? '#92400e' : '#334155'
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {req.status === 'Pending Approval' && (
                        <button
                          onClick={() => handleApprove(req._id)}
                          style={{ padding: '4px 10px', fontSize: 12, borderRadius: 4, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No requisitions submitted yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: 500, padding: 24, background: '#fff', borderRadius: 12 }}>
            <h3 style={{ margin: '0 0 16px' }}>Submit Internal Material Requisition</h3>
            <form onSubmit={handleCreateRequisition}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Department</label>
                <select className="input" value={department} onChange={e => setDepartment(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Production">Production</option>
                  <option value="Operations">Operations</option>
                  <option value="IT Support">IT Support</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Purpose / Notes</label>
                <input type="text" className="input" placeholder="e.g., Replacement parts for Machine #4" value={purpose} onChange={e => setPurpose(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Urgency</label>
                <select className="input" value={urgency} onChange={e => setUrgency(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Requested Product Item</label>
                <select className="input" value={selectedItem} onChange={e => setSelectedItem(e.target.value)} required style={{ width: '100%', marginTop: 4 }}>
                  <option value="">-- Select Item --</option>
                  {items.map(i => <option key={i._id} value={i._id}>{i.sku} - {i.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Requested Quantity</label>
                <input type="number" className="input" min={1} value={requestedQty} onChange={e => setRequestedQty(Number(e.target.value))} style={{ width: '100%', marginTop: 4 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ padding: '8px 16px', background: '#f1f5f9' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitionsPage;
