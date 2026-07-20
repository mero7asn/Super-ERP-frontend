const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const inventoryAPI = {
  getItems: (params) => API.get('/inventory/items', { params }).then(r => r.data),
  createItem: (data) => API.post('/inventory/items', data).then(r => r.data),
  updateItem: (id, data) => API.put(`/inventory/items/${id}`, data).then(r => r.data),
  deleteItem: (id) => API.delete(`/inventory/items/${id}`).then(r => r.data),

  getStockLevels: (params) => API.get('/inventory/stock', { params }).then(r => r.data),
  getTransactions: (params) => API.get('/inventory/transactions', { params }).then(r => r.data),

  postGoodsReceipt: (id) => API.post(`/inventory/receipts/goods/${id}`).then(r => r.data),
  postGoodsIssue: (id) => API.post(`/inventory/issues/goods/${id}`).then(r => r.data),
  executeTransfer: (id) => API.post(`/inventory/transfers/${id}/execute`).then(r => r.data),
  postAdjustment: (id) => API.post(`/inventory/adjustments/${id}/post`).then(r => r.data),
  approveAdjustment: (id) => API.post(`/inventory/adjustments/${id}/approve`).then(r => r.data),
  rejectAdjustment: (id) => API.post(`/inventory/adjustments/${id}/reject`).then(r => r.data),

  createReceivingOrder: (data) => API.post('/inventory/receiving-orders', data).then(r => r.data),
  updateReceivingOrder: (id, data) => API.put(`/inventory/receiving-orders/${id}`, data).then(r => r.data),

  createShipment: (data) => API.post('/inventory/shipments', data).then(r => r.data),
  createReturnOrder: (data) => API.post('/inventory/returns', data).then(r => r.data),
  createCycleCount: (data) => API.post('/inventory/cycle-counts', data).then(r => r.data),
  createPhysicalInventory: (data) => API.post('/inventory/physical-inventories', data).then(r => r.data),

  getKPIs: () => API.get('/inventory/kpis').then(r => r.data),
  getWarehouses: () => API.get('/inventory/warehouses').then(r => r.data),
  createWarehouse: (data) => API.post('/inventory/warehouses', data).then(r => r.data),
  updateWarehouse: (id, data) => API.put(`/inventory/warehouses/${id}`, data).then(r => r.data),

  getLots: (params) => API.get('/inventory/lots', { params }).then(r => r.data),
  getSerials: (params) => API.get('/inventory/serials', { params }).then(r => r.data),
};
