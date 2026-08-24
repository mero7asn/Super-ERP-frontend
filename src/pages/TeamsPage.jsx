import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { getDepartmentTheme, DEPARTMENT_THEMES } from '../services/departmentJobs';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899','#F97316'];
const DEPT_TABS = [
  'All','Sales','Customer Support','Marketing','Technology',
  'Human Resources','Finance','Inventory','Operations','Personal',
  'Payroll','Training','Talent Acquisition','BD & People Culture','Executive',
];
const ADMIN_ROLES = [
  'CRM core Administrator','System Architect','Super Admin',
  'Super CRM Administrator','Core 360 Administrator','Administrator',
];

// ─────────────────────────────────────────────────────────────────────────────
// CSS injected once (org-tree connector lines + animations)
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  /* ── Tree layout ─────────────────────────────── */
  .ot-children {
    display: table;
    margin: 0 auto;
    border-collapse: separate;
    border-spacing: 18px 0;
    padding-top: 32px;
    position: relative;
  }
  /* vertical stem from parent to horizontal rail */
  .ot-children::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    width: 0; height: 32px;
    border-left: 2px solid var(--ot-line, rgba(148,163,184,.3));
    transform: translateX(-50%);
  }
  .ot-cell {
    display: table-cell;
    vertical-align: top;
    text-align: center;
    position: relative;
    padding-top: 32px;
  }
  /* horizontal rail — left arm */
  .ot-cell::before {
    content: '';
    position: absolute;
    top: 0; right: 50%;
    width: 51%; height: 32px;
    border-top: 2px solid var(--ot-line, rgba(148,163,184,.3));
  }
  /* horizontal rail — right arm + vertical drop */
  .ot-cell::after {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    width: 51%; height: 32px;
    border-top: 2px solid var(--ot-line, rgba(148,163,184,.3));
    border-left: 2px solid var(--ot-line, rgba(148,163,184,.3));
  }
  .ot-cell:only-child::before, .ot-cell:only-child::after { display: none; }
  .ot-cell:first-child::before { border: none; }
  .ot-cell:last-child::after   { width: 0; border-top: none; }
  .ot-cell:last-child::before  { border-right: 2px solid var(--ot-line, rgba(148,163,184,.3)); border-radius: 0 6px 0 0; }
  .ot-cell:first-child::after  { border-radius: 6px 0 0 0; }

  /* ── Card interactions ───────────────────────── */
  .ot-card { transition: transform .18s ease, box-shadow .18s ease; cursor: pointer; }
  .ot-card:hover { transform: translateY(-3px); }
  .ot-card.ot-selected { outline: 3px solid #6366F1; outline-offset: 2px; }

  /* ── Search highlight ───────────────────────── */
  @keyframes ot-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
    50%      { box-shadow: 0 0 0 8px rgba(245,158,11,.3); }
  }
  .ot-matched { animation: ot-pulse 1.6s ease-in-out 3; }
  .ot-dim { opacity: .3; pointer-events: none; }

  /* ── Collapse button ───────────────────────── */
  .ot-coll {
    display: inline-flex; align-items: center; gap: 4px;
    margin-top: 6px; padding: 3px 10px;
    font-size: 10px; font-weight: 700; letter-spacing: .3px;
    border-radius: 20px;
    border: 1px solid var(--border-color, rgba(148,163,184,.3));
    background: var(--bg-secondary, rgba(30,41,59,.6));
    color: var(--text-muted, #94a3b8);
    cursor: pointer;
    transition: background .15s, color .15s;
  }
  .ot-coll:hover { background: var(--bg-card); color: var(--text-primary); }

  /* ── Drawer ───────────────────────── */
  .ot-drawer-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(0,0,0,.4);
    backdrop-filter: blur(3px);
    animation: ot-fade-in .2s ease;
  }
  .ot-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 360px; max-width: 90vw; z-index: 501;
    background: var(--bg-card, #1e293b);
    border-left: 1px solid var(--border-color, rgba(148,163,184,.2));
    box-shadow: -20px 0 60px rgba(0,0,0,.3);
    display: flex; flex-direction: column;
    animation: ot-slide-in .22s ease;
    overflow-y: auto;
  }
  @keyframes ot-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ot-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }

  /* ── Dept tabs ───────────────────────── */
  .ot-tabs { display: flex; overflow-x: auto; gap: 0; padding-bottom: 1px; }
  .ot-tabs::-webkit-scrollbar { height: 3px; }
  .ot-tab {
    padding: 9px 16px; font-size: 12px; font-weight: 600; white-space: nowrap;
    background: none; border: none; border-bottom: 2px solid transparent;
    color: var(--text-muted); cursor: pointer; transition: color .15s, border-color .15s;
    margin-bottom: -1px;
  }
  .ot-tab.ot-tab-active { color: var(--accent-primary, #6366F1); border-bottom-color: var(--accent-primary, #6366F1); }
  .ot-tab:hover:not(.ot-tab-active) { color: var(--text-secondary); }

  /* ── Unassigned section ───────────────────────── */
  .ot-ua-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 10px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const avatarColor = (user) => PALETTE[(`${user?.firstName||''}${user?.lastName||''}`).charCodeAt(0) % PALETTE.length];

const userDept = (node) => {
  const theme = node.department ? getDepartmentTheme(node.department) : null;
  return theme;
};

const strId = (id) => (id?._id || id)?.toString() || '';

// ─────────────────────────────────────────────────────────────────────────────
// Tree transformation  (circular-ref safe, dedup by id)
// ─────────────────────────────────────────────────────────────────────────────
const buildTree = (execNode = [], teams = []) => {
  const seen = new Set();

  const teamByManagerId = {};
  teams.forEach(t => {
    const mid = strId(t.manager._id);
    teamByManagerId[mid] = t;
  });

  const safeNode = (raw, type, depth = 0) => {
    const id = strId(raw._id);
    if (seen.has(id) || depth > 6) return null;   // circular / too deep
    seen.add(id);

    const team = type === 'manager' ? teamByManagerId[id] : null;
    const children = team
      ? team.members
          .map(m => safeNode(m, 'employee', depth + 1))
          .filter(Boolean)
      : [];

    const theme = team ? getDepartmentTheme(team.department) : null;

    return {
      _id: id,
      firstName: raw.firstName,
      lastName:  raw.lastName,
      role:      raw.role,
      email:     raw.email,
      isActive:  raw.isActive,
      type,
      department: team?.department || null,
      departmentTheme: theme,
      departmentAccent: theme?.primary || null,
      children,
      // counts
      directCount: children.length,
      totalCount:  children.reduce((s, c) => s + 1 + (c.totalCount || 0), 0),
    };
  };

  return execNode.map(({ executive, directReports = [] }) => {
    const execId = strId(executive._id);
    if (seen.has(execId)) return null;
    seen.add(execId);

    const children = directReports
      .map(r => {
        const rid = strId(r._id);
        const hasTeam = !!teamByManagerId[rid];
        return safeNode(r, hasTeam ? 'manager' : 'direct', 1);
      })
      .filter(Boolean);

    return {
      _id: execId,
      firstName: executive.firstName,
      lastName:  executive.lastName,
      role:      executive.role,
      email:     executive.email,
      isActive:  executive.isActive,
      type: 'executive',
      department: 'Executive',
      departmentTheme: getDepartmentTheme('Executive'),
      departmentAccent: '#6366F1',
      children,
      directCount: children.length,
      totalCount:  children.reduce((s, c) => s + 1 + (c.totalCount || 0), 0),
    };
  }).filter(Boolean);
};

// ─────────────────────────────────────────────────────────────────────────────
// Search: returns a Set of node IDs that should be VISIBLE
// (matching nodes + all their ancestors)
// ─────────────────────────────────────────────────────────────────────────────
const computeVisible = (nodes, q) => {
  if (!q) return null;
  const lq = q.toLowerCase();
  const visible = new Set();

  const matches = (n) =>
    `${n.firstName} ${n.lastName}`.toLowerCase().includes(lq) ||
    (n.role || '').toLowerCase().includes(lq) ||
    (n.department || '').toLowerCase().includes(lq);

  const walk = (n, ancestors) => {
    const hit = matches(n);
    const childHit = (n.children || []).some(c => walk(c, [...ancestors, n._id]));
    if (hit || childHit) {
      visible.add(n._id);
      ancestors.forEach(a => visible.add(a));
    }
    return hit || childHit;
  };

  nodes.forEach(n => walk(n, []));
  return visible;
};

// ─────────────────────────────────────────────────────────────────────────────
// Department filter: returns Set of IDs to show (node + ancestors)
// ─────────────────────────────────────────────────────────────────────────────
const computeDeptVisible = (nodes, dept) => {
  if (dept === 'All') return null;
  const visible = new Set();

  const deptMatch = (n) => n.department === dept || n.type === 'executive';

  const walk = (n, ancestors) => {
    const hit = deptMatch(n);
    const childHit = (n.children || []).some(c => walk(c, [...ancestors, n._id]));
    if (hit || childHit) {
      visible.add(n._id);
      ancestors.forEach(a => visible.add(a));
    }
    return hit || childHit;
  };

  nodes.forEach(n => walk(n, []));
  return visible;
};

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────
const Avatar = memo(({ user, size = 36, color }) => {
  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase();
  const bg = color || avatarColor(user);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: Math.round(size * .36),
      boxShadow: `0 0 0 2px ${bg}44`,
    }}>
      {initials}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Node cards
// ─────────────────────────────────────────────────────────────────────────────
const ExecNodeCard = memo(({ node, selected, onClick }) => (
  <div
    className={`ot-card${selected ? ' ot-selected' : ''}`}
    onClick={() => onClick(node)}
    style={{
      display: 'inline-flex', flexDirection: 'column', gap: 10,
      minWidth: 240, padding: '18px 20px', borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(99,102,241,.2) 0%, rgba(139,92,246,.15) 100%)',
      border: `2px solid rgba(99,102,241,.5)`,
      boxShadow: '0 8px 32px rgba(99,102,241,.22)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar user={node} size={52} color="#6366F1" />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>
          {node.firstName} {node.lastName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{node.role}</div>
      </div>
      <span style={{ fontSize: 20 }}>👑</span>
    </div>
    <div style={{
      display: 'flex', gap: 12, paddingTop: 8,
      borderTop: '1px solid rgba(99,102,241,.2)', fontSize: 11, color: 'rgba(139,92,246,.9)', fontWeight: 600,
    }}>
      <span>⬇ {node.directCount} direct</span>
      <span>👥 {node.totalCount} total</span>
    </div>
  </div>
));

const ManagerNodeCard = memo(({ node, selected, onClick }) => {
  const accent = node.departmentAccent || '#64748B';
  const theme = node.departmentTheme;
  return (
    <div
      className={`ot-card${selected ? ' ot-selected' : ''}`}
      onClick={() => onClick(node)}
      style={{
        display: 'inline-flex', flexDirection: 'column', gap: 8,
        minWidth: 200, padding: '14px 16px', borderRadius: 12,
        background: `linear-gradient(135deg, ${accent}14, ${accent}06)`,
        border: `1.5px solid ${accent}50`,
        boxShadow: `0 4px 18px ${accent}18`,
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={node} size={40} color={accent} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.firstName} {node.lastName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{node.role}</div>
          {node.department && (
            <span style={{
              display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700,
              padding: '1px 7px', borderRadius: 20,
              background: `${accent}20`, color: accent, border: `1px solid ${accent}40`,
            }}>
              {theme?.icon} {node.department}
            </span>
          )}
        </div>
      </div>
      {node.directCount > 0 && (
        <div style={{
          fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
          paddingTop: 6, borderTop: `1px solid ${accent}20`,
        }}>
          👥 {node.directCount} member{node.directCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
});

const EmployeeNodeCard = memo(({ node, selected, onClick }) => {
  const color = avatarColor(node);
  return (
    <div
      className={`ot-card${selected ? ' ot-selected' : ''}`}
      onClick={() => onClick(node)}
      style={{
        display: 'inline-flex', flexDirection: 'column', gap: 0,
        minWidth: 155, maxWidth: 190, padding: '10px 12px', borderRadius: 10,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar user={node} size={28} color={color} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.firstName} {node.lastName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.role}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OrgNode — recursive tree renderer
// ─────────────────────────────────────────────────────────────────────────────
const OrgNode = memo(({ node, visible, searchQ, selectedId, onSelect, depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children?.length > 0;
  const isVisible = !visible || visible.has(node._id);
  const isMatched = searchQ && `${node.firstName} ${node.lastName} ${node.role} ${node.department||''}`.toLowerCase().includes(searchQ.toLowerCase());

  if (!isVisible) return null;

  const Card =
    node.type === 'executive' ? ExecNodeCard :
    node.type === 'manager'   ? ManagerNodeCard :
    EmployeeNodeCard;

  // filter children by visibility
  const visibleChildren = hasChildren
    ? node.children.filter(c => !visible || visible.has(c._id))
    : [];

  return (
    <div className="ot-cell">
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className={isMatched ? 'ot-matched' : undefined}>
          <Card
            node={node}
            selected={selectedId === node._id}
            onClick={onSelect}
          />
        </div>
        {hasChildren && visibleChildren.length > 0 && (
          <button className="ot-coll" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? `▶ ${visibleChildren.length} reports` : '▾ collapse'}
          </button>
        )}
      </div>

      {!collapsed && visibleChildren.length > 0 && (
        <div className="ot-children">
          {visibleChildren.map(child => (
            <OrgNode
              key={child._id}
              node={child}
              visible={visible}
              searchQ={searchQ}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────
const Drawer = ({ node, isAdmin, allSupervisors, onMove, onClose }) => {
  const [moving, setMoving] = useState(false);
  const [val,    setVal]    = useState('');
  const accent = node?.departmentAccent || '#6366F1';
  const theme  = node?.departmentTheme;

  if (!node) return null;

  const handleMove = async (e) => {
    if (!e.target.value) return;
    setMoving(true);
    await onMove(node._id, e.target.value === 'none' ? null : e.target.value);
    setMoving(false);
    setVal('');
  };

  return (
    <>
      <div className="ot-drawer-overlay" onClick={onClose} />
      <div className="ot-drawer">
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          background: `linear-gradient(135deg, ${accent}14, ${accent}06)`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Avatar user={node} size={56} color={accent} />
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, color: 'var(--text-muted)', lineHeight: 1,
                padding: 4,
              }}
            >✕</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{node.firstName} {node.lastName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{node.role}</div>
            {node.department && (
              <span style={{
                display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700,
                padding: '2px 10px', borderRadius: 20,
                background: `${accent}22`, color: accent, border: `1px solid ${accent}44`,
              }}>
                {theme?.icon} {node.department}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

          {/* Status */}
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: node.isActive ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
              color: node.isActive ? '#10B981' : '#EF4444',
              border: `1px solid ${node.isActive ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`,
            }}>
              {node.isActive ? '● Active' : '● Inactive'}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              textTransform: 'capitalize',
            }}>
              {node.type}
            </span>
          </div>

          {/* Reporting stats */}
          {(node.directCount > 0 || node.totalCount > 0) && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}>
              {[
                { label: 'Direct Reports', value: node.directCount || 0 },
                { label: 'Total Reports',  value: node.totalCount  || 0 },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: accent }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Email */}
          {node.email && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Email</div>
              <div style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                fontSize: 12, wordBreak: 'break-all',
              }}>
                {node.email}
              </div>
            </div>
          )}

          {/* Direct reports list */}
          {node.children?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Direct Reports ({node.children.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {node.children.map(c => (
                  <div key={c._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  }}>
                    <Avatar user={c} size={28} color={c.departmentAccent || avatarColor(c)} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{c.firstName} {c.lastName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reassign */}
          {isAdmin && node.type !== 'executive' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Reassign Supervisor
              </div>
              <select
                value={val}
                onChange={handleMove}
                disabled={moving}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: 13, cursor: 'pointer',
                  opacity: moving ? .5 : 1,
                }}
              >
                <option value="">Select new supervisor…</option>
                <option value="none">✕ Remove supervisor (unassign)</option>
                {allSupervisors
                  .filter(s => s._id?.toString() !== node._id)
                  .map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} · {s.role}
                    </option>
                  ))}
              </select>
              {moving && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Saving…</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Unassigned sub-section
// ─────────────────────────────────────────────────────────────────────────────
const UnassignedCard = memo(({ person, label, accent, isAdmin, allSupervisors, onAssign }) => {
  const [moving, setMoving] = useState(false);
  const [val,    setVal]    = useState('');
  const color = avatarColor(person);

  const handleAssign = async (e) => {
    if (!e.target.value) return;
    setMoving(true);
    await onAssign(person._id, e.target.value === 'none' ? null : e.target.value);
    setMoving(false);
    setVal('');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: '11px 13px', borderRadius: 10,
      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
      opacity: moving ? .5 : 1, pointerEvents: moving ? 'none' : 'auto',
      borderLeft: `3px solid ${accent}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={person} size={32} color={color} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {person.firstName} {person.lastName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{person.role}</div>
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 700,
            padding: '1px 7px', borderRadius: 20, marginTop: 3,
            background: `${accent}18`, color: accent, border: `1px solid ${accent}36`,
          }}>{label}</span>
        </div>
      </div>
      {isAdmin && (
        <select value={val} onChange={handleAssign} disabled={moving} style={{
          fontSize: 11, padding: '4px 8px', borderRadius: 6,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)', color: 'var(--text-primary)',
          cursor: 'pointer', width: '100%',
        }}>
          <option value="">Assign supervisor…</option>
          {allSupervisors.filter(s => s._id?.toString() !== person._id?.toString()).map(s => (
            <option key={s._id} value={s._id}>{s.firstName} {s.lastName} · {s.role}</option>
          ))}
        </select>
      )}
    </div>
  );
});

const UnassignedSection = ({ managers, directs, members, isAdmin, allSupervisors, onAssign }) => {
  const total = managers.length + directs.length + members.length;
  if (total === 0) return null;

  const groups = [
    { label: 'Unassigned Managers',       people: managers, accent: '#F59E0B', tag: 'Manager'       },
    { label: 'Unassigned Admin / Direct',  people: directs,  accent: '#EF4444', tag: 'Admin / Direct' },
    { label: 'Unassigned Members',         people: members,  accent: '#94A3B8', tag: 'Member'         },
  ].filter(g => g.people.length > 0);

  return (
    <div style={{ marginTop: 32 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', borderRadius: '12px 12px 0 0',
        background: 'rgba(239,68,68,.07)',
        border: '1.5px solid rgba(239,68,68,.25)', borderBottom: 'none',
      }}>
        <span style={{ fontSize: 24 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            Unassigned Users — {total}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            These users have no supervisor and don't appear in the chart above
          </div>
        </div>
      </div>

      <div style={{
        border: '1.5px solid rgba(239,68,68,.25)', borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        background: 'rgba(239,68,68,.02)',
        padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {groups.map(g => (
          <div key={g.label}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: g.accent,
              textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.accent, display: 'inline-block' }} />
              {g.label} ({g.people.length})
            </div>
            <div className="ot-ua-grid">
              {g.people.map(p => (
                <UnassignedCard
                  key={p._id?.toString()}
                  person={p}
                  label={g.tag}
                  accent={g.accent}
                  isAdmin={isAdmin}
                  allSupervisors={allSupervisors}
                  onAssign={onAssign}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Stat pill
// ─────────────────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, color }) => (
  <div style={{
    padding: '11px 18px', textAlign: 'center', minWidth: 84,
    background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.14)',
    borderRadius: 12,
  }}>
    <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 11, color: 'rgba(248,250,252,.75)', marginTop: 2 }}>{label}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const TeamsPage = () => {
  const { user } = useAuth();

  // ── State ──
  const [rawExecNode,     setRawExecNode]     = useState([]);
  const [rawTeams,        setRawTeams]        = useState([]);
  const [unassigned,      setUnassigned]      = useState({ members: [], managers: [], directs: [] });
  const [allSupervisors,  setAllSupervisors]  = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [search,          setSearch]          = useState('');
  const [activeTab,       setActiveTab]       = useState('All');
  const [selectedNode,    setSelectedNode]    = useState(null);

  const isAdmin = ADMIN_ROLES.includes(user?.role);

  // ── Fetch ──
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/auth/teams');
      setRawExecNode(data.execNode  || []);
      setRawTeams(data.teams        || []);
      setUnassigned({
        members:  data.unassignedMembers  || [],
        managers: data.unassignedManagers || [],
        directs:  data.unassignedDirects  || [],
      });
      setAllSupervisors(data.allSupervisors || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load org chart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  // ── Build tree (memoized) ──
  const treeData = useMemo(
    () => buildTree(rawExecNode, rawTeams),
    [rawExecNode, rawTeams]
  );

  // ── Visibility sets (memoized) ──
  const searchVisible = useMemo(() => computeVisible(treeData, search), [treeData, search]);
  const deptVisible   = useMemo(() => computeDeptVisible(treeData, activeTab), [treeData, activeTab]);

  // Combine: a node is visible if it passes BOTH filters
  const visible = useMemo(() => {
    if (!searchVisible && !deptVisible) return null;
    if (searchVisible && deptVisible) {
      const combined = new Set();
      searchVisible.forEach(id => { if (deptVisible.has(id)) combined.add(id); });
      // if nothing passes both, relax to union for ancestor paths
      if (combined.size === 0) {
        searchVisible.forEach(id => combined.add(id));
        deptVisible.forEach(id => combined.add(id));
      }
      return combined;
    }
    return searchVisible || deptVisible;
  }, [searchVisible, deptVisible]);

  // ── Stats ──
  const stats = useMemo(() => {
    const totalPeople = treeData.reduce((s, e) => s + 1 + e.directCount + e.totalCount, 0);
    const totalTeams  = rawTeams.length;
    const totalUnassigned = unassigned.members.length + unassigned.managers.length + unassigned.directs.length;
    return { totalPeople, totalTeams, totalUnassigned };
  }, [treeData, rawTeams, unassigned]);

  // ── Reassign ──
  const handleAssign = useCallback(async (userId, supervisorId) => {
    setError(''); setSuccess('');
    try {
      await API.put(`/auth/users/${userId}`, { supervisor: supervisorId || null });
      setSuccess('Reporting line updated');
      await fetchTeams();
      // If the selected node was moved, close drawer
      if (selectedNode?._id === userId) setSelectedNode(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  }, [fetchTeams, selectedNode]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="loading-state">
      <div className="spinner" />
      Building org chart…
    </div>
  );

  const deptTheme = activeTab !== 'All' ? getDepartmentTheme(activeTab) : null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <style>{CSS}</style>

      {/* ── Detail Drawer ── */}
      {selectedNode && (
        <Drawer
          node={selectedNode}
          isAdmin={isAdmin}
          allSupervisors={allSupervisors}
          onMove={handleAssign}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* ── Page Banner ── */}
      <div className="crm-page-banner" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 16, padding: 24, marginBottom: 0,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#60A5FA', marginBottom: 6 }}>
            Organization Chart
          </div>
          <h1 className="page-title" style={{ color: '#fff', margin: 0 }}>
            Teams
          </h1>
          <p className="page-subtitle" style={{ color: '#CBD5E1', marginTop: 6, marginBottom: 0 }}>
            Organization structure, reporting lines and team ownership
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatPill label="Teams"      value={stats.totalTeams}      color="#A7F3D0" />
          <StatPill label="Members"    value={stats.totalPeople}     color="#BAE6FD" />
          <StatPill label="Unassigned" value={stats.totalUnassigned} color={stats.totalUnassigned > 0 ? '#FCA5A5' : '#A7F3D0'} />
        </div>
      </div>

      {/* ── Alerts ── */}
      {error   && <div className="alert alert-error"   style={{ marginTop: 12 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginTop: 12 }}>{success}</div>}

      {/* ── Department Tabs ── */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        marginTop: 16, marginBottom: 0,
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-primary)',
      }}>
        <div className="ot-tabs">
          {DEPT_TABS.map(tab => {
            const th = tab !== 'All' ? getDepartmentTheme(tab) : null;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                className={`ot-tab${active ? ' ot-tab-active' : ''}`}
                style={active && th ? { color: th.primary, borderBottomColor: th.primary } : {}}
                onClick={() => setActiveTab(tab)}
              >
                {th?.icon ? `${th.icon} ` : ''}{tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar: search + hint ── */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
        padding: '16px 0',
      }}>
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
          <input
            className="form-input"
            placeholder="Search employees, managers or roles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, minWidth: 280 }}
          />
        </div>
        {search && (
          <button className="btn btn-secondary" onClick={() => setSearch('')} style={{ padding: '8px 14px', fontSize: 12 }}>
            ✕ Clear
          </button>
        )}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
          🖱 Scroll to explore · Click any node to view details · ▾ collapse to fold branches
        </div>
      </div>

      {/* ── Org Chart Canvas ── */}
      <div style={{
        overflowX: 'auto', overflowY: 'visible',
        paddingBottom: 40, paddingTop: 8,
        minHeight: 200,
      }}>
        {treeData.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>No org chart to display</div>
            <div style={{ fontSize: 13 }}>
              Assign users with the <strong>Executive User</strong> role, then link managers and members to them via the <em>supervisor</em> field.
            </div>
          </div>
        ) : (
          /* One table per executive so multiple executives don't overlap */
          <div style={{ display: 'table', margin: '0 auto', borderSpacing: '48px 0', borderCollapse: 'separate' }}>
            {treeData.map((execNode, i) => {
              // Check if this executive has any visible children
              const hasVis = !visible || visible.has(execNode._id);
              if (!hasVis) return null;
              return (
                <div key={execNode._id} style={{ display: 'table-cell', verticalAlign: 'top', paddingLeft: i > 0 ? 48 : 0 }}>
                  {/* Each executive is its own mini-tree */}
                  <div style={{ display: 'table', margin: '0 auto' }}>
                    <div style={{ display: 'table-row' }}>
                      <OrgNode
                        node={execNode}
                        visible={visible}
                        searchQ={search}
                        selectedId={selectedNode?._id}
                        onSelect={setSelectedNode}
                        depth={0}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No results for current filter */}
        {treeData.length > 0 && visible && visible.size === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ fontWeight: 600 }}>No results found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try a different search term or department filter</div>
          </div>
        )}
      </div>

      {/* ── Unassigned Section ── */}
      <UnassignedSection
        managers={unassigned.managers}
        directs={unassigned.directs}
        members={unassigned.members}
        isAdmin={isAdmin}
        allSupervisors={allSupervisors}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default TeamsPage;
