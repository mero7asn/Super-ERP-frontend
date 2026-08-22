import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ item: '', warehouse: '', type: '' });

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

  const getTypeTone = (type) => {
    if (type === 'GOODS_RECEIPT' || type === 'RETURN_RECEIPT' || type === 'TRANSFER') return { bg: '#dcfce7', color: '#166534' };
    if (type === 'ADJUSTMENT' || type === 'CYCLE_COUNT' || type === 'PHYSICAL_INVENTORY') return { bg: '#fef3c7', color: '#92400e' };
    return { bg: '#e0f2fe', color: '#0369a1' };
  };

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Transaction ledger</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Stock transactions</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Trace every in- and out-bound movement in a polished audit workspace.</p>
        </div>
      </div>

      <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Filter by item" value={filter.item} onChange={(e) => setFilter((p) => ({ ...p, item: e.target.value }))} style={{ width: 200 }} />
          <input className="form-input" placeholder="Filter by warehouse" value={filter.warehouse} onChange={(e) => setFilter((p) => ({ ...p, warehouse: e.target.value }))} style={{ width: 200 }} />
          <select className="form-input" value={filter.type} onChange={(e) => setFilter((p) => ({ ...p, type: e.target.value }))} style={{ width: 220 }}>
            <option value="">All types</option>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Entries</div><div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7' }}>{transactions.length}</div></div>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Receipts</div><div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{transactions.filter((tx) => tx.type === 'GOODS_RECEIPT').length}</div></div>
        <div className="card" style={{ padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Issues</div><div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{transactions.filter((tx) => tx.type === 'GOODS_ISSUE').length}</div></div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" />Loading transactions…</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {transactions.length === 0 ? <div className="card" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No transactions found.</div> : transactions.map((txn) => {
            const tone = getTypeTone(txn.type);
            return (
              <div key={txn._id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{txn.transactionId}</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{txn.item?.name}</div>
                  </div>
                  <span style={{ padding: '6px 10px', borderRadius: 999, background: tone.bg, color: tone.color, fontWeight: 700, fontSize: 12 }}>{txn.type}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 12 }}>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Warehouse</div><div style={{ fontWeight: 700 }}>{txn.warehouse?.code}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Qty</div><div style={{ fontWeight: 700, color: Number(txn.quantity) > 0 ? '#16a34a' : '#dc2626' }}>{txn.quantity}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Reference</div><div style={{ fontWeight: 700 }}>{txn.referenceNumber || '—'}</div></div>
                  <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}><div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Performed by</div><div style={{ fontWeight: 700 }}>{txn.performedBy?.firstName} {txn.performedBy?.lastName}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
