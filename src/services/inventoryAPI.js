import API from './api';

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
  getReceivingOrders: (params) => API.get('/inventory/receiving-orders', { params }).then(r => r.data),

  createShipment: (data) => API.post('/inventory/shipments', data).then(r => r.data),
  createReturnOrder: (data) => API.post('/inventory/returns', data).then(r => r.data),
  getShipments: (params) => API.get('/inventory/shipments', { params }).then(r => r.data),

  createTransfer: (data) => API.post('/inventory/transfers', data).then(r => r.data),
  getTransfers: (params) => API.get('/inventory/transfers', { params }).then(r => r.data),

  createAdjustment: (data) => API.post('/inventory/adjustments', data).then(r => r.data),
  getAdjustments: (params) => API.get('/inventory/adjustments', { params }).then(r => r.data),

  createCycleCount: (data) => API.post('/inventory/cycle-counts', data).then(r => r.data),
  getCycleCounts: (params) => API.get('/inventory/cycle-counts', { params }).then(r => r.data),

  createPhysicalInventory: (data) => API.post('/inventory/physical-inventories', data).then(r => r.data),
  getPhysicalInventories: (params) => API.get('/inventory/physical-inventories', { params }).then(r => r.data),

  getKPIs: () => API.get('/inventory/kpis').then(r => r.data),
  getWarehouses: () => API.get('/inventory/warehouses').then(r => r.data),
  createWarehouse: (data) => API.post('/inventory/warehouses', data).then(r => r.data),
  updateWarehouse: (id, data) => API.put(`/inventory/warehouses/${id}`, data).then(r => r.data),

  getLots: (params) => API.get('/inventory/lots', { params }).then(r => r.data),
  getSerials: (params) => API.get('/inventory/serials', { params }).then(r => r.data),

  // Pick Tasks
  createPickTask: (data) => API.post('/inventory/pick-tasks', data).then(r => r.data),
  getPickTasks: (params) => API.get('/inventory/pick-tasks', { params }).then(r => r.data),
  getPickTask: (id) => API.get(`/inventory/pick-tasks/${id}`).then(r => r.data),
  updatePickTask: (id, data) => API.put(`/inventory/pick-tasks/${id}`, data).then(r => r.data),
  releasePickWave: (data) => API.post('/inventory/pick-wave/release', data).then(r => r.data),

  // Inventory Intelligence
  getValuationReport: (params) => API.get('/inventory/reports/valuation', { params }).then(r => r.data),
  getABCReport: (params) => API.get('/inventory/reports/abc', { params }).then(r => r.data),
  getDeadStockReport: (params) => API.get('/inventory/reports/dead-stock', { params }).then(r => r.data),
  getReorderAlerts: () => API.get('/inventory/alerts/reorder').then(r => r.data),
  getExpiryAlerts: (params) => API.get('/inventory/alerts/expiry', { params }).then(r => r.data),
  getPutawaySuggestion: (params) => API.get('/inventory/putaway/suggest', { params }).then(r => r.data),
};
