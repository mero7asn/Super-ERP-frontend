import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { getDepartmentTheme } from '../services/departmentJobs';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Color Helpers
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#F97316'];

const ADMIN_ROLES = [
  'CRM core Administrator', 'System Architect', 'Super Admin',
  'Super CRM Administrator', 'Core 360 Administrator', 'Administrator', 'Executive User',
];

const avatarColor = (user) => PALETTE[(`${user?.firstName || ''}${user?.lastName || ''}`).charCodeAt(0) % PALETTE.length];
const strId = (id) => (id?._id || id)?.toString() || '';

// ─────────────────────────────────────────────────────────────────────────────
// Mindmap & Tree Styling
// ─────────────────────────────────────────────────────────────────────────────
const MINDMAP_CSS = `
  /* Mindmap canvas */
  .mm-canvas {
    background: radial-gradient(circle, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
    background-size: 24px 24px;
    border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
    border-radius: 16px;
    min-height: 480px;
    overflow-x: auto;
    overflow-y: visible;
    padding: 40px 24px 60px;
    position: relative;
    box-shadow: inset 0 2px 8px rgba(0,0,0,0.04);
  }

  /* Tree table structure */
  .mm-tree-wrapper {
    display: table;
    margin: 0 auto;
    border-collapse: separate;
  }
  .mm-children {
    display: table;
    margin: 0 auto;
    border-collapse: separate;
    border-spacing: 20px 0;
    padding-top: 36px;
    position: relative;
  }
  /* Vertical drop line from parent */
  .mm-children::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    width: 0; height: 36px;
    border-left: 2px solid var(--accent-primary, #6366F1);
    transform: translateX(-50%);
    opacity: 0.45;
  }
  .mm-cell {
    display: table-cell;
    vertical-align: top;
    text-align: center;
    position: relative;
    padding-top: 36px;
  }
  /* Horizontal branch rails */
  .mm-cell::before {
    content: '';
    position: absolute;
    top: 0; right: 50%;
    width: 51%; height: 36px;
    border-top: 2px solid var(--accent-primary, #6366F1);
    opacity: 0.45;
  }
  .mm-cell::after {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    width: 51%; height: 36px;
    border-top: 2px solid var(--accent-primary, #6366F1);
    border-left: 2px solid var(--accent-primary, #6366F1);
    opacity: 0.45;
  }
  .mm-cell:only-child::before, .mm-cell:only-child::after { display: none; }
  .mm-cell:first-child::before { border: none; }
  .mm-cell:last-child::after   { width: 0; border-top: none; }
  .mm-cell:last-child::before  { border-right: 2px solid var(--accent-primary, #6366F1); border-radius: 0 8px 0 0; }
  .mm-cell:first-child::after  { border-radius: 8px 0 0 0; }

  /* Card nodes */
  .mm-node-card {
    display: inline-flex;
    flex-direction: column;
    position: relative;
    border-radius: 14px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    user-select: none;
  }
  .mm-node-card:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 25px rgba(0,0,0,0.12);
  }
  .mm-node-card.is-self {
    ring: 3px solid #10B981;
    box-shadow: 0 0 0 3px #10B981, 0 8px 24px rgba(16,185,129,0.25);
  }
  .mm-node-card.is-selected {
    box-shadow: 0 0 0 3px #6366F1, 0 8px 24px rgba(99,102,241,0.3);
  }

  /* Fold / Toggle Button */
  .mm-fold-btn {
    position: absolute;
    bottom: -13px;
    left: 50%;
    transform: translateX(-50%);
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--bg-card, #1E293B);
    border: 2px solid var(--accent-primary, #6366F1);
    color: var(--text-primary, #fff);
    font-size: 13px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .mm-fold-btn:hover {
    background: var(--accent-primary, #6366F1);
    color: #fff;
    transform: translateX(-50%) scale(1.15);
  }
  .mm-fold-btn.is-folded {
    background: #F59E0B;
    border-color: #D97706;
    color: #fff;
    width: auto;
    padding: 0 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
  }

  /* Search highlights */
  @keyframes mm-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
    50%      { box-shadow: 0 0 0 8px rgba(245,158,11,0.4); }
  }
  .mm-matched {
    animation: mm-glow 1.5s ease-in-out 3;
    border-color: #F59E0B !important;
  }

  /* Drawer */
  .mm-drawer-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px);
    animation: mmFade .2s ease;
  }
  .mm-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 380px; max-width: 90vw; z-index: 501;
    background: var(--bg-card, #1e293b);
    border-left: 1px solid var(--border-color, rgba(148,163,184,.2));
    box-shadow: -20px 0 60px rgba(0,0,0,.35);
    display: flex; flex-direction: column;
    animation: mmSlide .22s ease;
    overflow-y: auto;
  }
  @keyframes mmFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes mmSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Tree Generation (Circular-safe & Memoized)
// ─────────────────────────────────────────────────────────────────────────────
const buildTree = (execNode = [], teams = []) => {
  const seen = new Set();
  const teamByManagerId = {};
  teams.forEach(t => {
    const mid = strId(t.manager?._id);
    if (mid) teamByManagerId[mid] = t;
  });

  const safeNode = (raw, type, depth = 0) => {
    if (!raw) return null;
    const id = strId(raw._id);
    if (seen.has(id) || depth > 8) return null;
    seen.add(id);

    const team = type === 'manager' ? teamByManagerId[id] : null;
    const children = team
      ? (team.members || []).map(m => safeNode(m, 'employee', depth + 1)).filter(Boolean)
      : [];

    const theme = team ? getDepartmentTheme(team.department) : null;

    return {
      _id: id,
      firstName: raw.firstName || '',
      lastName: raw.lastName || '',
      role: raw.role || 'Member',
      email: raw.email || '',
      isActive: raw.isActive !== false,
      type,
      department: team?.department || raw.department || null,
      departmentTheme: theme,
      departmentAccent: theme?.primary || '#64748B',
      children,
      directCount: children.length,
      totalCount: children.reduce((s, c) => s + 1 + (c.totalCount || 0), 0),
    };
  };

  return execNode.map(({ executive, directReports = [] }) => {
    if (!executive) return null;
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
      firstName: executive.firstName || '',
      lastName: executive.lastName || '',
      role: executive.role || 'Executive User',
      email: executive.email || '',
      isActive: executive.isActive !== false,
      type: 'executive',
      department: 'Executive',
      departmentTheme: getDepartmentTheme('Executive'),
      departmentAccent: '#6366F1',
      children,
      directCount: children.length,
      totalCount: children.reduce((s, c) => s + 1 + (c.totalCount || 0), 0),
    };
  }).filter(Boolean);
};

// ─────────────────────────────────────────────────────────────────────────────
// Subtree Extractor for "Under My Control"
// ─────────────────────────────────────────────────────────────────────────────
const findUserSubtree = (nodes, currentUserId) => {
  if (!currentUserId) return null;
  const uid = currentUserId.toString();

  const search = (node) => {
    if (node._id === uid) return node;
    for (const child of node.children || []) {
      const found = search(child);
      if (found) return found;
    }
    return null;
  };

  for (const root of nodes) {
    const res = search(root);
    if (res) return res;
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
const Avatar = memo(({ user, size = 38, color }) => {
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';
  const bg = color || avatarColor(user);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: Math.max(10, Math.round(size * 0.36)),
      boxShadow: `0 0 0 2px ${bg}33`,
    }}>
      {initials}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Mindmap Node Component
// ─────────────────────────────────────────────────────────────────────────────
const MindmapNode = memo(({
  node,
  currentUserId,
  selectedId,
  onSelect,
  collapsedMap,
  onToggleFold,
  searchQ,
  deptFilter,
  depth = 0
}) => {
  const isFolded = !!collapsedMap[node._id];
  const hasChildren = node.children && node.children.length > 0;
  const isSelf = currentUserId && node._id === currentUserId.toString();
  const isSelected = selectedId === node._id;

  // Search match
  const matchesSearch = searchQ && (
    `${node.firstName} ${node.lastName}`.toLowerCase().includes(searchQ.toLowerCase()) ||
    (node.role || '').toLowerCase().includes(searchQ.toLowerCase()) ||
    (node.department || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  // Department filter
  const matchesDept = deptFilter === 'All' || node.department === deptFilter || node.type === 'executive';

  const accent = node.departmentAccent || '#6366F1';
  const theme = node.departmentTheme;

  return (
    <div className="mm-cell">
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        {/* Node Card */}
        <div
          className={`mm-node-card ${isSelf ? 'is-self' : ''} ${isSelected ? 'is-selected' : ''} ${matchesSearch ? 'mm-matched' : ''}`}
          onClick={() => onSelect(node)}
          style={{
            minWidth: node.type === 'executive' ? 220 : node.type === 'manager' ? 190 : 155,
            maxWidth: 240,
            padding: node.type === 'executive' ? '14px 18px' : '10px 14px',
            background: node.type === 'executive'
              ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)'
              : 'var(--bg-secondary, #1e293b)',
            border: `1.5px solid ${node.type === 'executive' ? 'rgba(99,102,241,0.6)' : isSelf ? '#10B981' : 'var(--border-color, rgba(148,163,184,0.25))'}`,
            borderLeft: `4px solid ${isSelf ? '#10B981' : accent}`,
            marginBottom: hasChildren ? 14 : 0,
            opacity: matchesDept ? 1 : 0.45,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar user={node} size={node.type === 'executive' ? 44 : 34} color={accent} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontWeight: 700, fontSize: node.type === 'executive' ? 14 : 13,
                lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {node.firstName} {node.lastName}
                {isSelf && <span style={{ fontSize: 10, background: '#10B98122', color: '#10B981', padding: '1px 5px', borderRadius: 6, fontWeight: 800 }}>YOU</span>}
                {node.type === 'executive' && <span>👑</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {node.role}
              </div>
              {node.department && node.type !== 'executive' && (
                <span style={{
                  display: 'inline-block', marginTop: 4, fontSize: 9, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 12,
                  background: `${accent}18`, color: accent, border: `1px solid ${accent}33`,
                }}>
                  {theme?.icon || '🏢'} {node.department}
                </span>
              )}
            </div>
          </div>

          {/* Subordinates count label */}
          {node.directCount > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 10, color: 'var(--text-muted)', fontWeight: 600,
              paddingTop: 6, marginTop: 6, borderTop: '1px solid rgba(148,163,184,0.15)',
            }}>
              <span>👥 {node.directCount} direct</span>
              <span>{node.totalCount} total under</span>
            </div>
          )}

          {/* Fold/Unfold Button */}
          {hasChildren && (
            <div
              className={`mm-fold-btn ${isFolded ? 'is-folded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFold(node._id);
              }}
              title={isFolded ? 'Expand subordinates' : 'Collapse subordinates'}
            >
              {isFolded ? `+ ${node.children.length}` : '−'}
            </div>
          )}
        </div>
      </div>

      {/* Children branches */}
      {hasChildren && !isFolded && (
        <div className="mm-children">
          {node.children.map(child => (
            <MindmapNode
              key={child._id}
              node={child}
              currentUserId={currentUserId}
              selectedId={selectedId}
              onSelect={onSelect}
              collapsedMap={collapsedMap}
              onToggleFold={onToggleFold}
              searchQ={searchQ}
              deptFilter={deptFilter}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Detail Drawer Component
// ─────────────────────────────────────────────────────────────────────────────
const Drawer = ({ node, isAdmin, allSupervisors, onMove, onClose }) => {
  const [moving, setMoving] = useState(false);
  const [val, setVal] = useState('');
  const accent = node?.departmentAccent || '#6366F1';
  const theme = node?.departmentTheme;

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
      <div className="mm-drawer-overlay" onClick={onClose} />
      <div className="mm-drawer">
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          background: `linear-gradient(135deg, ${accent}18, ${accent}06)`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Avatar user={node} size={54} color={accent} />
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, color: 'var(--text-muted)', padding: 4,
              }}
            >✕</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{node.firstName} {node.lastName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{node.role}</div>
            {node.department && (
              <span style={{
                display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700,
                padding: '2px 8px', borderRadius: 20,
                background: `${accent}20`, color: accent, border: `1px solid ${accent}40`,
              }}>
                {theme?.icon} {node.department}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
          {/* Subordinates stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>{node.directCount || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Direct Reports</div>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>{node.totalCount || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Subordinates</div>
            </div>
          </div>

          {node.email && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Email</div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, border: '1px solid var(--border-color)' }}>
                {node.email}
              </div>
            </div>
          )}

          {node.children && node.children.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                Direct Team Members ({node.children.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                {node.children.map(c => (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <Avatar user={c} size={26} color={c.departmentAccent || avatarColor(c)} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{c.firstName} {c.lastName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAdmin && node.type !== 'executive' && (
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                Reassign Supervisor
              </div>
              <select
                value={val}
                onChange={handleMove}
                disabled={moving}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer',
                }}
              >
                <option value="">Select new supervisor…</option>
                <option value="none">✕ Remove supervisor (unassign)</option>
                {allSupervisors
                  .filter(s => s._id?.toString() !== node._id)
                  .map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} · {s.role}</option>
                  ))}
              </select>
              {moving && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Saving…</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Unassigned Section
// ─────────────────────────────────────────────────────────────────────────────
const UnassignedSection = ({ unassigned, isAdmin, allSupervisors, onAssign }) => {
  const total = (unassigned.managers?.length || 0) + (unassigned.directs?.length || 0) + (unassigned.members?.length || 0);
  if (total === 0) return null;

  const allItems = [
    ...(unassigned.managers || []).map(p => ({ ...p, uType: 'Manager', accent: '#F59E0B' })),
    ...(unassigned.directs || []).map(p => ({ ...p, uType: 'Direct Report', accent: '#EF4444' })),
    ...(unassigned.members || []).map(p => ({ ...p, uType: 'Member', accent: '#94A3B8' })),
  ];

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{
        padding: '12px 18px', borderRadius: '12px 12px 0 0',
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Unassigned People ({total})</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Employees and managers without a designated supervisor in the mindmap</div>
        </div>
      </div>
      <div style={{
        padding: 16, background: 'rgba(239,68,68,0.02)',
        border: '1px solid rgba(239,68,68,0.25)', borderTop: 'none', borderRadius: '0 0 12px 12px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10,
      }}>
        {allItems.map(p => (
          <div key={p._id} style={{
            padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10,
            border: '1px solid var(--border-color)', borderLeft: `3px solid ${p.accent}`,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar user={p} size={28} color={p.accent} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.firstName} {p.lastName}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.role}</div>
              </div>
            </div>
            {isAdmin && (
              <select
                onChange={(e) => { if (e.target.value) onAssign(p._id, e.target.value); }}
                style={{ fontSize: 10, padding: '3px 6px', borderRadius: 5, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                <option value="">Assign to supervisor…</option>
                {allSupervisors.filter(s => s._id?.toString() !== p._id?.toString()).map(s => (
                  <option key={s._id} value={s._id}>{s.firstName} {s.lastName} · {s.role}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
const TeamsPage = () => {
  const { user } = useAuth();

  const [rawExecNode, setRawExecNode] = useState([]);
  const [rawTeams, setRawTeams] = useState([]);
  const [unassigned, setUnassigned] = useState({ members: [], managers: [], directs: [] });
  const [allSupervisors, setAllSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Controls
  const [viewScope, setViewScope] = useState('my-control'); // 'my-control' | 'all'
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedNode, setSelectedNode] = useState(null);
  const [collapsedMap, setCollapsedMap] = useState({});

  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/auth/teams');
      setRawExecNode(data.execNode || []);
      setRawTeams(data.teams || []);
      setUnassigned({
        members: data.unassignedMembers || [],
        managers: data.unassignedManagers || [],
        directs: data.unassignedDirects || [],
      });
      setAllSupervisors(data.allSupervisors || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load organization data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  // Full company tree
  const fullTree = useMemo(() => buildTree(rawExecNode, rawTeams), [rawExecNode, rawTeams]);

  // User's own subtree ("Under My Control")
  const mySubtree = useMemo(() => {
    if (!user?._id) return null;
    const found = findUserSubtree(fullTree, user._id);
    if (found) return found;

    // If logged in as top admin / executive, or not nested, fallback to first root or full tree
    if (fullTree.length > 0 && (isAdmin || user.role === 'Executive User')) {
      return fullTree[0];
    }
    return null;
  }, [fullTree, user, isAdmin]);

  // Active display tree
  const activeTree = useMemo(() => {
    if (viewScope === 'my-control' && mySubtree) {
      return [mySubtree];
    }
    return fullTree;
  }, [viewScope, mySubtree, fullTree]);

  // Expand / Collapse all
  const handleCollapseAll = useCallback(() => {
    const map = {};
    const traverse = (node) => {
      if (node.children && node.children.length > 0) {
        map[node._id] = true;
        node.children.forEach(traverse);
      }
    };
    fullTree.forEach(traverse);
    setCollapsedMap(map);
  }, [fullTree]);

  const handleExpandAll = useCallback(() => {
    setCollapsedMap({});
  }, []);

  const handleToggleFold = useCallback((nodeId) => {
    setCollapsedMap(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  }, []);

  // Supervisor assignment
  const handleAssign = useCallback(async (userId, supervisorId) => {
    setError(''); setSuccess('');
    try {
      await API.put(`/auth/users/${userId}`, { supervisor: supervisorId || null });
      setSuccess('Hierarchy updated successfully');
      await fetchTeams();
      if (selectedNode?._id === userId) setSelectedNode(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update hierarchy');
    }
  }, [fetchTeams, selectedNode]);

  // Available departments from teams for compact dropdown
  const departmentsList = useMemo(() => {
    const set = new Set();
    rawTeams.forEach(t => { if (t.department) set.add(t.department); });
    return ['All', ...Array.from(set)];
  }, [rawTeams]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        Generating Mindmap Hierarchy…
      </div>
    );
  }

  const peopleUnderControlCount = mySubtree ? mySubtree.totalCount : (fullTree.reduce((s, r) => s + r.totalCount, 0));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{MINDMAP_CSS}</style>

      {/* Detail Drawer */}
      {selectedNode && (
        <Drawer
          node={selectedNode}
          isAdmin={isAdmin}
          allSupervisors={allSupervisors}
          onMove={handleAssign}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Header Banner */}
      <div className="crm-page-banner" style={{ padding: '20px 24px', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 4 }}>
            Interactive Mindmap
          </div>
          <h1 className="page-title" style={{ color: '#fff', margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            🧠 Organization &amp; Reporting Hierarchy
          </h1>
          <p className="page-subtitle" style={{ color: '#CBD5E1', margin: '4px 0 0 0', fontSize: 13 }}>
            Visual reporting lines · Fold &amp; unfold teams · Real-time command structure
          </p>
        </div>

        {/* Stats & Quick Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#A7F3D0' }}>{peopleUnderControlCount}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Under Your Control</div>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#BAE6FD' }}>{rawTeams.length}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Total Teams</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Clean Mindmap Toolbar (Replaces the 15 redundant tabs with clean scope & controls) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        padding: '12px 18px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)',
      }}>
        {/* Left: View Mode Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', padding: 3, borderRadius: 10, border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewScope('my-control')}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: viewScope === 'my-control' ? 'var(--accent-primary, #6366F1)' : 'transparent',
              color: viewScope === 'my-control' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            🎯 People Under My Control
          </button>
          <button
            onClick={() => setViewScope('all')}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: viewScope === 'all' ? 'var(--accent-primary, #6366F1)' : 'transparent',
              color: viewScope === 'all' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            🌐 Full Company Org Chart
          </button>
        </div>

        {/* Right: Mindmap Folding + Search + Dept Dropdown */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Fold / Unfold All */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExpandAll}
            style={{ fontSize: 11, padding: '5px 10px' }}
            title="Unfold all branches"
          >
            ➕ Expand All
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCollapseAll}
            style={{ fontSize: 11, padding: '5px 10px' }}
            title="Fold all branches"
          >
            ➖ Fold All
          </button>

          {/* Department Filter Dropdown */}
          <select
            className="form-input"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            style={{ fontSize: 12, padding: '5px 10px', minWidth: 130, width: 'auto' }}
          >
            {departmentsList.map(d => (
              <option key={d} value={d}>{d === 'All' ? '🏢 All Departments' : d}</option>
            ))}
          </select>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              className="form-input"
              placeholder="🔍 Search name or role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 12, padding: '5px 10px', paddingRight: search ? 24 : 10, width: 170 }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)' }}
              >✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Mindmap Canvas */}
      <div className="mm-canvas">
        {activeTree.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>No subordinates found under your direct control</div>
            <div style={{ fontSize: 13, marginTop: 4, maxWidth: 460, margin: '6px auto 16px' }}>
              You are currently not listed as a supervisor over any team member. Switch to <strong>Full Company Org Chart</strong> to view the entire organization.
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setViewScope('all')}>
              🌐 View Full Organization
            </button>
          </div>
        ) : (
          <div className="mm-tree-wrapper">
            <div style={{ display: 'table-row' }}>
              {activeTree.map(rootNode => (
                <MindmapNode
                  key={rootNode._id}
                  node={rootNode}
                  currentUserId={user?._id}
                  selectedId={selectedNode?._id}
                  onSelect={setSelectedNode}
                  collapsedMap={collapsedMap}
                  onToggleFold={handleToggleFold}
                  searchQ={search}
                  deptFilter={deptFilter}
                  depth={0}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unassigned Staff Section */}
      <UnassignedSection
        unassigned={unassigned}
        isAdmin={isAdmin}
        allSupervisors={allSupervisors}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default TeamsPage;
