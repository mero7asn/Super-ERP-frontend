import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/inventoryAPI';
import { Icon } from '../components/Icons';

const STATUS_COLORS = {
  Draft: '#6b7280',
  Assigned: '#3b82f6',
  'In Progress': '#f59e0b',
  Picked: '#8b5cf6',
  Packed: '#22c55e',
  Cancelled: '#ef4444'
};

const STRATEGY_LABELS = {
  DISCRETE: 'Discrete',
  WAVE: 'Wave',
  ZONE: 'Zone',
  BATCH: 'Batch'
};

const PickTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showWaveModal, setShowWaveModal] = useState(false);
  const [waveForm, setWaveForm] = useState({ waveNumber: '', warehouse: '', subinventory: 'MAIN', pickingStrategy: 'WAVE' });
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterStrategy) params.pickingStrategy = filterStrategy;
      const res = await inventoryAPI.getPickTasks(params);
      setTasks(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pick tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    inventoryAPI.getWarehouses().then((r) => setWarehouses(r.data || []));
  }, [filterStatus, filterStrategy]);

  const handleStatusChange = async (task, newStatus) => {
    setSaving(true);
    try {
      await inventoryAPI.updatePickTask(task._id, { status: newStatus });
      fetchTasks();
      if (selectedTask?._id === task._id) {
        const updated = await inventoryAPI.getPickTask(task._id);
        setSelectedTask(updated.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleReleaseWave = async () => {
    if (!waveForm.waveNumber || !waveForm.warehouse) return setError('Wave number and warehouse are required.');
    setSaving(true);
    try {
      await inventoryAPI.releasePickWave(waveForm);
      setShowWaveModal(false);
      setWaveForm({ waveNumber: '', warehouse: '', subinventory: 'MAIN', pickingStrategy: 'WAVE' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release wave');
    } finally {
      setSaving(false);
    }
  };

  const nextStatus = (current) => {
    const flow = { Draft: 'Assigned', Assigned: 'In Progress', 'In Progress': 'Picked', Picked: 'Packed' };
    return flow[current] || null;
  };

  const summaryCards = [
    { label: 'Open tasks', value: tasks.length, tone: '#0284c7' },
    { label: 'In progress', value: tasks.filter((task) => task.status === 'In Progress').length, tone: '#d97706' },
    { label: 'Picked', value: tasks.filter((task) => task.status === 'Picked').length, tone: '#7c3aed' },
    { label: 'Packed', value: tasks.filter((task) => task.status === 'Packed').length, tone: '#16a34a' }
  ];

  return (
    <div className="fade-in">
      <div className="crm-page-banner" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc', marginBottom: 6 }}>Pick operations</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>Pick tasks</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#e2e8f0' }}>Coordinate discrete, wave, zone, and batch picking in one command view.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowWaveModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="plus" size={16} /> Release wave</button>
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

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16, padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-control" style={{ maxWidth: 200 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['Draft', 'Assigned', 'In Progress', 'Picked', 'Packed', 'Cancelled'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="form-control" style={{ maxWidth: 200 }} value={filterStrategy} onChange={(e) => setFilterStrategy(e.target.value)}>
          <option value="">All strategies</option>
          {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={fetchTasks}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTask ? '1fr 400px' : '1fr', gap: 20 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /> Loading…</div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No pick tasks found.</div>
          ) : (
            <div style={{ display: 'grid', gap: 12, padding: 12 }}>
              {tasks.map((task) => {
                const pickedQty = task.lines?.reduce((sum, line) => sum + Number(line.pickedQty || 0), 0) || 0;
                const orderedQty = task.lines?.reduce((sum, line) => sum + Number(line.orderedQty || 0), 0) || 0;
                const progress = orderedQty ? Math.round((pickedQty / orderedQty) * 100) : 0;
                return (
                  <div key={task._id} onClick={() => setSelectedTask(task)} style={{ border: selectedTask?._id === task._id ? '1px solid #0284c7' : '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: selectedTask?._id === task._id ? '#f8fbff' : '#fff', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{task.pickTaskId}</div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{task.shipmentId?.shipmentId || '—'}</div>
                      </div>
                      <span style={{ padding: '4px 8px', borderRadius: 999, background: STATUS_COLORS[task.status] + '22', color: STATUS_COLORS[task.status], fontWeight: 700, fontSize: 11 }}>{task.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 999, background: '#ede9fe', color: '#7c3aed', fontWeight: 700, fontSize: 11 }}>{STRATEGY_LABELS[task.pickingStrategy] || task.pickingStrategy}</span>
                      <span style={{ padding: '4px 8px', borderRadius: 999, background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 11 }}>{task.waveNumber || 'No wave'}</span>
                      <span style={{ padding: '4px 8px', borderRadius: 999, background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 11 }}>{task.lines?.length || 0} lines</span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}><span>Task progress</span><span>{progress}%</span></div>
                      <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', background: '#0284c7', borderRadius: 999 }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      {nextStatus(task.status) && task.status !== 'Cancelled' && (
                        <button className="btn btn-secondary btn-sm" disabled={saving} onClick={(e) => { e.stopPropagation(); handleStatusChange(task, nextStatus(task.status)); }}>Advance</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedTask && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{selectedTask.pickTaskId}</h3>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Status</span><span style={{ fontWeight: 700, color: STATUS_COLORS[selectedTask.status] }}>{selectedTask.status}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Strategy</span><span>{STRATEGY_LABELS[selectedTask.pickingStrategy]}</span></div>
              {selectedTask.waveNumber && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Wave</span><span style={{ fontFamily: 'monospace' }}>{selectedTask.waveNumber}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Warehouse</span><span>{selectedTask.warehouse?.code}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Subinventory</span><span>{selectedTask.subinventory}</span></div>
              {selectedTask.assignedTo && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Assigned to</span><span>{selectedTask.assignedTo.firstName} {selectedTask.assignedTo.lastName}</span></div>}
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 16, paddingTop: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Pick lines</h4>
              {selectedTask.lines?.map((line, i) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{line.item?.sku} — {line.item?.name}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Ordered: <strong style={{ color: 'var(--text-primary)' }}>{line.orderedQty}</strong></span>
                    <span>Picked: <strong style={{ color: line.pickedQty >= line.orderedQty ? '#22c55e' : '#f59e0b' }}>{line.pickedQty}</strong></span>
                  </div>
                </div>
              ))}
            </div>
            {nextStatus(selectedTask.status) && selectedTask.status !== 'Cancelled' && (
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={saving} onClick={() => handleStatusChange(selectedTask, nextStatus(selectedTask.status))}>Advance to {nextStatus(selectedTask.status)}</button>
            )}
          </div>
        )}
      </div>

      {showWaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowWaveModal(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 480, width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8 }}>Release pick wave</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <input className="form-input" placeholder="Wave number" value={waveForm.waveNumber} onChange={(e) => setWaveForm((p) => ({ ...p, waveNumber: e.target.value }))} />
              <select className="form-input" value={waveForm.warehouse} onChange={(e) => setWaveForm((p) => ({ ...p, warehouse: e.target.value }))}>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
              </select>
              <select className="form-input" value={waveForm.pickingStrategy} onChange={(e) => setWaveForm((p) => ({ ...p, pickingStrategy: e.target.value }))}>
                {Object.entries(STRATEGY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowWaveModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReleaseWave}>Release</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickTaskPage;
