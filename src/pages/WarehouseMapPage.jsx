import React, { useState, useEffect } from 'react';
import API from '../services/api';

const WarehouseMapPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedLocator, setSelectedLocator] = useState(null);
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
    return <div className="loading-state"><div className="spinner" />Loading warehouse map…</div>;
  }

  const subinventories = selectedWarehouse?.subinventories || [];
  const allLocators = subinventories.flatMap((sub) => (sub.locators || []).map((loc) => ({ ...loc, subName: sub.name, subCode: sub.code })));
  const zones = Array.from(new Set(allLocators.map((loc) => loc.zone || 'Zone A')));
  const filteredLocators = selectedZone === 'ALL' ? allLocators : allLocators.filter((loc) => (loc.zone || 'Zone A') === selectedZone);

  return (
    <div className="fade-in" style={{ padding: '0 12px 32px' }}>
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Warehouse map</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Warehouse & bin storage map</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Visualize zones, occupancy, and pick/putaway readiness by location.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {warehouses.map((wh) => (
          <button key={wh._id} onClick={() => { setSelectedWarehouse(wh); setSelectedLocator(null); }} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #e2e8f0', background: selectedWarehouse?._id === wh._id ? '#0284c7' : '#f8fafc', color: selectedWarehouse?._id === wh._id ? '#fff' : '#475569', fontWeight: 700, cursor: 'pointer' }}>{wh.name}</button>
        ))}
      </div>

      {selectedWarehouse && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
          <div>
            <div className="crm-glass-card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Warehouse overview</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedWarehouse.name}</div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{subinventories.length} subinventory areas · {allLocators.length} bins</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedZone('ALL')} style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid #e2e8f0', background: selectedZone === 'ALL' ? '#0f172a' : '#fff', color: selectedZone === 'ALL' ? '#fff' : '#475569', cursor: 'pointer' }}>All zones ({allLocators.length})</button>
              {zones.map((zone) => <button key={zone} onClick={() => setSelectedZone(zone)} style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid #e2e8f0', background: selectedZone === zone ? '#0f172a' : '#fff', color: selectedZone === zone ? '#fff' : '#475569', cursor: 'pointer' }}>{zone}</button>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {filteredLocators.map((loc, idx) => {
                const occPct = loc.capacity > 0 ? Math.round((loc.currentOccupancy / loc.capacity) * 100) : 0;
                const occColor = occPct > 90 ? '#dc2626' : occPct > 50 ? '#f59e0b' : '#16a34a';
                return (
                  <div key={idx} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setSelectedLocator(loc)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 800 }}>BIN-{loc.code}</span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: '#f1f5f9', fontWeight: 700 }}>{loc.subCode}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Zone: {loc.zone || 'Zone A'} · Aisle {loc.aisle || '01'}</div>
                    <div style={{ height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ width: `${occPct}%`, height: '100%', background: occColor, borderRadius: 999 }} /></div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>{loc.currentOccupancy || 0} / {loc.capacity || 100} occupied</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 18, height: 'fit-content' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Selected bin</div>
            {selectedLocator ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>BIN-{selectedLocator.code}</div>
                <div style={{ color: '#64748b', marginBottom: 10 }}>Zone {selectedLocator.zone || 'Zone A'} · {selectedLocator.subName}</div>
                <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Occupancy</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7' }}>{selectedLocator.currentOccupancy || 0} / {selectedLocator.capacity || 100}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Legend</div>
                  <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }} /> Available</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} /> Partial</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }} /> Full / blocked</div>
                  </div>
                </div>
              </>
            ) : <div style={{ color: '#64748b' }}>Select a bin card to inspect availability and zone status.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseMapPage;
