import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAux, AUX_COLORS, AUX_ICONS } from '../context/AuxContext';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Live', 'Training', 'Coaching', 'Break', 'Logged out'];

const fmtSecs = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const fmtMins = (mins) => {
  if (!mins && mins !== 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const AuxTopBar = () => {
  const { user } = useAuth();
  const { currentAux, statusSince, todayStats, myPlan, changeAux } = useAux();
  const [elapsed, setElapsed] = useState(0);
  const [openAux, setOpenAux] = useState(false);
  const [openQuickAdd, setOpenQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const auxRef = useRef(null);
  const quickRef = useRef(null);

  // Tick every second for the live timer
  useEffect(() => {
    setElapsed(Math.floor((Date.now() - statusSince) / 1000));
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [statusSince]);

  useEffect(() => {
    setElapsed(0);
  }, [currentAux]);

  useEffect(() => {
    const handler = (e) => {
      if (auxRef.current && !auxRef.current.contains(e.target)) setOpenAux(false);
      if (quickRef.current && !quickRef.current.contains(e.target)) setOpenQuickAdd(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const color = AUX_COLORS[currentAux] || '#6B7280';

  const todayFor = (status) =>
    (todayStats?.[status] || 0) + (currentAux === status ? Math.floor(elapsed / 60) : 0);

  const statItems = [
    { key: 'Live', planned: myPlan?.liveMinutes },
    { key: 'Training', planned: myPlan?.trainingMinutes },
    { key: 'Coaching', planned: myPlan?.coachingMinutes },
    { key: 'Break', planned: myPlan?.breakMinutes },
  ];

  const handleOmniSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('lead') || q.includes('client')) navigate('/leads');
    else if (q.includes('item') || q.includes('stock') || q.includes('product')) navigate('/inventory/items');
    else if (q.includes('payroll') || q.includes('salary')) navigate('/hrm/payroll');
    else if (q.includes('ticket')) navigate('/tickets');
    else navigate(`/leads?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 'var(--sidebar-width, 240px)',
        right: 0,
        height: 48,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '0 24px',
        zIndex: 900,
        gap: 16,
      }}
    >
      {/* LEFT: Omni-Search & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 520 }}>
        {/* Omni Search Bar */}
        <form onSubmit={handleOmniSearch} style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 13, color: '#94A3B8' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Omni Search (Leads, Inventory, Tickets, Staff)..."
            style={{
              width: '100%',
              height: 32,
              paddingLeft: 32,
              paddingRight: 12,
              borderRadius: 16,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              fontSize: 12,
              outline: 'none',
              color: 'var(--text-primary)',
              transition: 'all 0.2s',
            }}
          />
        </form>

        {/* Quick Creation Menu */}
        <div ref={quickRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenQuickAdd(!openQuickAdd)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              height: 30,
              padding: '0 10px',
              borderRadius: 15,
              background: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>+</span>
            <span>New</span>
          </button>

          {openQuickAdd && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                minWidth: 160,
                overflow: 'hidden',
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => { navigate('/leads'); setOpenQuickAdd(false); }}
                style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', fontSize: 12, cursor: 'pointer', display: 'flex', gap: 8 }}
              >
                <span>👤</span> New Lead
              </button>
              <button
                onClick={() => { navigate('/email-composer'); setOpenQuickAdd(false); }}
                style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', fontSize: 12, cursor: 'pointer', display: 'flex', gap: 8 }}
              >
                <span>✉️</span> Compose Email
              </button>
              <button
                onClick={() => { navigate('/tickets'); setOpenQuickAdd(false); }}
                style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', fontSize: 12, cursor: 'pointer', display: 'flex', gap: 8 }}
              >
                <span>🎫</span> New Support Ticket
              </button>
              <button
                onClick={() => { navigate('/inventory/items'); setOpenQuickAdd(false); }}
                style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', fontSize: 12, cursor: 'pointer', display: 'flex', gap: 8 }}
              >
                <span>📦</span> Add Inventory Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CENTER: Today's Aux Stats */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {statItems.map(({ key, planned }) => {
          const today = todayFor(key);
          const pct = planned ? Math.round((today / planned) * 100) : null;
          const c = AUX_COLORS[key];
          const onTrack = pct === null || pct >= 80;
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{key}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{fmtMins(today)}</span>
              {planned > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 8,
                    fontWeight: 600,
                    background: onTrack ? `${c}18` : '#EF444418',
                    color: onTrack ? c : '#EF4444',
                    border: `1px solid ${onTrack ? c : '#EF4444'}33`,
                  }}
                >
                  {pct}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT: Live Aux Status Pill */}
      <div ref={auxRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpenAux((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 20,
            background: `${color}18`,
            border: `1px solid ${color}55`,
            color,
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
          {AUX_ICONS[currentAux]} {currentAux}
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: 700,
              background: `${color}22`,
              padding: '1px 6px',
              borderRadius: 4,
            }}
          >
            {fmtSecs(elapsed)}
          </span>
          <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
        </button>

        {openAux && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden',
              minWidth: 180,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              zIndex: 1000,
            }}
          >
            {STATUSES.map((s) => {
              const c = AUX_COLORS[s];
              const active = currentAux === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    changeAux(s);
                    setOpenAux(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: active ? `${c}18` : 'transparent',
                    color: active ? c : 'var(--text-primary)',
                    fontWeight: active ? 700 : 400,
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderLeft: active ? `3px solid ${c}` : '3px solid transparent',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                  {AUX_ICONS[s]} {s}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuxTopBar;
