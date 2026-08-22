import React, { useState } from 'react';
import API from '../services/api';

const BarcodeScannerModal = ({ isOpen, onClose, onSelectProduct }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setLoading(true);
    setError('');
    setScannedResult(null);

    try {
      const res = await API.get(`/inventory/barcode/scan/${encodeURIComponent(barcodeInput.trim())}`);
      if (res.data.success) {
        setScannedResult(res.data);
        if (onSelectProduct) onSelectProduct(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Barcode / SKU not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCameraScan = (sampleCode) => {
    setBarcodeInput(sampleCode);
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card" style={{ width: 540, maxWidth: '90%', borderRadius: 12, padding: 24, background: '#fff', color: '#1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #e2e8f0', pb: 12 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700 }}>
            <span>📷</span> Barcode & Mobile Scanner
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>

        {/* Camera Simulation Feed */}
        <div style={{
          height: 140, borderRadius: 8, background: '#0f172a', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: 16, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', width: '80%', height: 2, background: '#ef4444',
            boxShadow: '0 0 10px #ef4444', animation: 'scanLine 2s infinite ease-in-out'
          }} />
          <span style={{ fontSize: 32 }}>🔍</span>
          <span style={{ fontSize: 12, marginTop: 6, color: '#94a3b8' }}>Point camera or scanner hardware at barcode</span>
        </div>

        <form onSubmit={handleScan} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            className="input"
            placeholder="Enter Barcode, SKU, or Serial number..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1' }}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 18px' }}>
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </form>

        {/* Preset quick test buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: '#64748b', width: '100%' }}>Sample SKUs to test:</span>
          {['FE-TSH-BLK-M', 'TSHIRT-001', 'ITEM-1001', 'BAR-100200'].map(code => (
            <button
              key={code}
              type="button"
              onClick={() => handleSimulateCameraScan(code)}
              style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            >
              {code}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: 12, background: '#fef2f2', color: '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
            ❌ {error}
          </div>
        )}

        {scannedResult && scannedResult.item && (
          <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#166534', fontSize: 16 }}>{scannedResult.item.sku}</span>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Matched</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: '#0f172a' }}>{scannedResult.item.name}</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Category: {scannedResult.item.category} | Base UOM: {scannedResult.item.baseUom}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, color: '#0369a1' }}>Unit Cost: EGP {scannedResult.item.unitCost?.toLocaleString()}</div>

            {/* Warehouse Stock breakdown */}
            <div style={{ marginTop: 12, borderTop: '1px solid #cbd5e1', paddingTop: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Warehouse Availability:</span>
              {scannedResult.stockLevels?.length > 0 ? (
                scannedResult.stockLevels.map((sl, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4, background: '#fff', padding: '4px 8px', borderRadius: 4 }}>
                    <span>{sl.warehouse?.name || 'Warehouse'} ({sl.subinventory})</span>
                    <span style={{ fontWeight: 700 }}>{sl.available} {scannedResult.item.baseUom} Available (OnHand: {sl.onHand})</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginTop: 4 }}>No physical stock recorded in warehouses</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
