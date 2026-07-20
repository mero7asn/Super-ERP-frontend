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
    inventoryAPI.getWarehouses().then(r => setWarehouses(r.data || []));
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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="teams" size={26} style={{ color: 'var(--accent-primary)' }} />
            Pick Tasks
          </h1>
          <p className="page-subtitle">Manage picking operations — discrete, wave, zone, and batch picking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowWaveModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="plus" size={16} /> Release Wave
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16, padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>×</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-control" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['Draft', 'Assigned', 'In Progress', 'Picked', 'Packed', 'Cancelled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="form-control" style={{ maxWidth: 200 }} value={filterStrategy} onChange={e => setFilterStrategy(e.target.value)}>
          <option value="">All Strategies</option>
          {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={fetchTasks}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTask ? '1fr 400px' : '1fr', gap: 20 }}>
        {/* Task list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /> Loading…</div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No pick tasks found.</div>
          ) : (
            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Shipment</th>
                    <th>Strategy</th>
                    <th>Wave</th>
                    <th>Lines</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id} style={{ cursor: 'pointer', background: selectedTask?._id === task._id ? 'var(--bg-hover)' : undefined }}
                      onClick={() => setSelectedTask(task)}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{task.pickTaskId}</td>
                      <td style={{ fontSize: 13 }}>{task.shipmentId?.shipmentId || '—'}</td>
                      <td>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#ede9fe', color: '#7c3aed', fontWeight: 600 }}>
                          {STRATEGY_LABELS[task.pickingStrategy] || task.pickingStrategy}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.waveNumber || '—'}</td>
                      <td style={{ fontWeight: 600 }}>{task.lines?.length || 0}</td>
                      <td style={{ fontSize: 13 }}>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                      <td>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: STATUS_COLORS[task.status] + '22', color: STATUS_COLORS[task.status], fontWeight: 700 }}>
                          {task.status}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {nextStatus(task.status) && task.status !== 'Cancelled' && (
                          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}
                            disabled={saving}
                            onClick={() => handleStatusChange(task, nextStatus(task.status))}>
                            → {nextStatus(task.status)}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task detail panel */}
        {selectedTask && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{selectedTask.pickTaskId}</h3>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontWeight: 700, color: STATUS_COLORS[selectedTask.status] }}>{selectedTask.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Strategy</span>
                <span>{STRATEGY_LABELS[selectedTask.pickingStrategy]}</span>
              </div>
              {selectedTask.waveNumber && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Wave</span>
                  <span style={{ fontFamily: 'monospace' }}>{selectedTask.waveNumber}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Warehouse</span>
                <span>{selectedTask.warehouse?.code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subinventory</span>
                <span>{selectedTask.subinventory}</span>
              </div>
              {selectedTask.assignedTo && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned To</span>
                  <span>{selectedTask.assignedTo.firstName} {selectedTask.assignedTo.lastName}</span>
                </div>
              )}
              {selectedTask.startedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Started</span>
                  <span>{new Date(selectedTask.startedAt).toLocaleString()}</span>
                </div>
              )}
              {selectedTask.completedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Completed</span>
                  <span>{new Date(selectedTask.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 16, paddingTop: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Pick Lines ({selectedTask.lines?.length})</h4>
              {selectedTask.lines?.map((line, i) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{line.item?.sku} — {line.item?.name}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Ordered: <strong style={{ color: 'var(--text-primary)' }}>{line.orderedQty}</strong></span>
                    <span>Picked: <strong style={{ color: line.pickedQty >= line.orderedQty ? '#22c55e' : '#f59e0b' }}>{line.pickedQty}</strong></span>
                    {line.sourceLocator && <span>Loc: <strong style={{ color: 'var(--text-primary)' }}>{line.sourceLocator}</strong></span>}
                    {line.lotNumber && <span>Lot: <strong style={{ color: 'var(--text-primary)' }}>{line.lotNumber}</strong></span>}
                  </div>
                </div>
              ))}
            </div>

            {nextStatus(selectedTask.status) && selectedTask.status !== 'Cancelled' && (
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}
                disabled={saving}
                onClick={() => handleStatusChange(selectedTask, nextStatus(selectedTask.status))}>
                Advance to: {nextStatus(selectedTask.status)}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Wave Release Modal */}
      {showWaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 480, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Release Pick Wave</h2>
              <button onClick={() => setShowWaveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Create wave-based pick tasks for multiple shipments simultaneously.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label className="form-label">Wave Number *</label>
                <input className="form-control" placeholder="e.g. WAVE-001" value={waveForm.waveNumber}
                  onChange={e => setWaveForm(f => ({ ...f, waveNumber: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label className="form-label">Warehouse *</label>
                <select className="form-control" value={waveForm.warehouse} onChange={e => setWaveForm(f => ({ ...f, warehouse: e.target.value }))}>
                  <option value="">Select warehouse…</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} — {w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Subinventory</label>
                <input className="form-control" placeholder="e.g. MAIN" value={waveForm.subinventory}
                  onChange={e => setWaveForm(f => ({ ...f, subinventory: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label className="form-label">Picking Strategy</label>
                <select className="form-control" value={waveForm.pickingStrategy} onChange={e => setWaveForm(f => ({ ...f, pickingStrategy: e.target.value }))}>
                  {Object.entries(STRATEGY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowWaveModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={saving} onClick={handleReleaseWave}>
                {saving ? 'Releasing…' : 'Release Wave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickTaskPage;
