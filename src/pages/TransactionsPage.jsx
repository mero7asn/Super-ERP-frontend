import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const INVENTORY_ROLES = [
  'Super CRM Administrator', 'System Architect', 'Inventory Manager',
  'Warehouse Manager', 'Receiving Clerk', 'Shipping Clerk',
  'Warehouse Operator', 'Inventory Clerk', 'Quality Inspector'
];

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ item: '', warehouse: '', type: '' });
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await inventoryAPI.getTransactions(filter);
      setTransactions(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="teams" size={26} style={{ color: 'var(--accent-primary)' }} />
            Stock Transactions
          </h1>
          <p className="page-subtitle">Audit trail of all inventory movements (Material Documents)</p>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Filter by Item ID..." value={filter.item} onChange={e => setFilter(p => ({ ...p, item: e.target.value }))} style={{ width: 200 }} />
          <input className="form-input" placeholder="Filter by Warehouse ID..." value={filter.warehouse} onChange={e => setFilter(p => ({ ...p, warehouse: e.target.value }))} style={{ width: 200 }} />
          <select className="form-input" value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))} style={{ width: 200 }}>
            <option value="">All Types</option>
            <option value="GOODS_RECEIPT">Goods Receipt</option>
            <option value="GOODS_ISSUE">Goods Issue</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="RETURN_RECEIPT">Return Receipt</option>
            <option value="CYCLE_COUNT">Cycle Count</option>
            <option value="PHYSICAL_INVENTORY">Physical Inventory</option>
          </select>
          <button className="btn btn-primary" onClick={fetchTransactions}>Apply</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading transactions…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Subtype</th>
                  <th>Item</th>
                  <th>WH</th>
                  <th>Sub</th>
                  <th>Locator</th>
                  <th>Lot</th>
                  <th>Qty</th>
                  <th>UoM</th>
                  <th>Value</th>
                  <th>Reference</th>
                  <th>Performed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="14" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No transactions found.</td></tr>
                ) : transactions.map(txn => (
                  <tr key={txn._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{txn.transactionId}</td>
                    <td><span className="badge badge-new">{txn.type}</span></td>
                    <td style={{ fontSize: 12 }}>{txn.subtype || '—'}</td>
                    <td>{txn.item?.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{txn.warehouse?.code}</td>
                    <td>{txn.subinventory}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{txn.locator || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{txn.lotNumber || '—'}</td>
                    <td style={{ fontWeight: 600, color: txn.quantity > 0 ? '#22c55e' : '#ef4444' }}>{txn.quantity}</td>
                    <td style={{ fontFamily: 'monospace' }}>{txn.unitOfMeasure}</td>
                    <td>${txn.totalValue?.toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{txn.referenceNumber || '—'}</td>
                    <td>{txn.performedBy?.firstName} {txn.performedBy?.lastName}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(txn.createdAt).toLocaleDateString()}</td>
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

export default TransactionsPage;
