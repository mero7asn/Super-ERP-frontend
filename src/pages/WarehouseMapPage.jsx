import React, { useState, useEffect } from 'react';
import API from '../services/api';

const WarehouseMapPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/inventory/warehouses');
      if (res.data.success) {
        setWarehouses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedWarehouse(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Loading Warehouse Hierarchy & Storage Map...</div>;
  }

  const subinventories = selectedWarehouse?.subinventories || [];
  const allLocators = subinventories.flatMap(sub =>
    (sub.locators || []).map(loc => ({ ...loc, subName: sub.name, subCode: sub.code }))
  );

  const zones = Array.from(new Set(allLocators.map(l => l.zone || 'Zone A')));

  const filteredLocators = selectedZone === 'ALL'
    ? allLocators
    : allLocators.filter(l => (l.zone || 'Zone A') === selectedZone);

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#0f172a' }}>🗺️ Warehouse & Bin Storage Map</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            Visual hierarchy & occupancy: Warehouse → Zone → Aisle → Rack → Shelf → Bin
          </p>
        </div>
      </div>

      {/* Warehouse Selection Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '2px solid #e2e8f0', pb: 12, overflowX: 'auto' }}>
        {warehouses.map(wh => (
          <button
            key={wh._id}
            onClick={() => setSelectedWarehouse(wh)}
            style={{
              padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 'none',
              background: selectedWarehouse?._id === wh._id ? '#0284c7' : '#f1f5f9',
              color: selectedWarehouse?._id === wh._id ? '#fff' : '#334155',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <span>🏬</span> {wh.name} ({wh.code})
          </button>
        ))}
      </div>

      {selectedWarehouse && (
        <>
          {/* Warehouse Meta Banner */}
          <div className="card" style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Warehouse Type</span>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWarehouse.type}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Manager</span>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedWarehouse.contact?.manager || 'Unassigned'}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Subinventories</span>
              <div style={{ fontWeight: 600, color: '#0284c7' }}>{subinventories.length} Areas</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Bin Bins</span>
              <div style={{ fontWeight: 600, color: '#16a34a' }}>{allLocators.length} Bins</div>
            </div>
          </div>

          {/* Zone Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>Filter Zone:</span>
            <button
              onClick={() => setSelectedZone('ALL')}
              style={{
                padding: '6px 14px', borderRadius: 20, border: '1px solid #cbd5e1',
                background: selectedZone === 'ALL' ? '#0f172a' : '#fff',
                color: selectedZone === 'ALL' ? '#fff' : '#334155', cursor: 'pointer', fontSize: 12
              }}
            >
              All Zones ({allLocators.length})
            </button>
            {zones.map(z => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: '1px solid #cbd5e1',
                  background: selectedZone === z ? '#0f172a' : '#fff',
                  color: selectedZone === z ? '#fff' : '#334155', cursor: 'pointer', fontSize: 12
                }}
              >
                {z}
              </button>
            ))}
          </div>

          {/* Visual Bin Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {filteredLocators.map((loc, idx) => {
              const occPct = loc.capacity > 0 ? Math.round((loc.currentOccupancy / loc.capacity) * 100) : 0;
              const occColor = occPct > 90 ? '#ef4444' : occPct > 50 ? '#f59e0b' : '#10b981';

              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>BIN-{loc.code}</span>
                    <span style={{ fontSize: 10, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{loc.subCode}</span>
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                    Zone: <strong>{loc.zone || 'Zone A'}</strong> | Aisle: {loc.aisle || '01'} | Rack: {loc.rack || '01'}
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span>Occupancy ({loc.currentOccupancy || 0} / {loc.capacity || 100})</span>
                      <span style={{ fontWeight: 700, color: occColor }}>{occPct}%</span>
                    </div>
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${occPct}%`, height: '100%', background: occColor, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default WarehouseMapPage;
