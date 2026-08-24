import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { getDepartmentTheme } from '../services/departmentJobs';

// ─── Styles injected once ─────────────────────────────────────────────────────
const ORG_TREE_CSS = `
  .org-tree-root { text-align: center; display: table; margin: 0 auto; }

  /* Each level's child list */
  .org-tree-children {
    display: table;
    margin: 0 auto;
    border-collapse: separate;
    border-spacing: 20px 0;
    padding: 28px 0 0;
    position: relative;
  }
  /* Vertical drop from parent card to horizontal rail */
  .org-tree-children::before {
    content: '';
    display: block;
    width: 0;
    height: 28px;
    border-left: 2px solid var(--org-line, rgba(148,163,184,0.35));
    position: absolute;
    top: 0;
    left: 50%;
    margin-left: -1px;
  }

  /* Each sibling cell */
  .org-tree-cell {
    display: table-cell;
    vertical-align: top;
    text-align: center;
    padding: 28px 0 0;
    position: relative;
  }
  /* Horizontal rail — left half */
  .org-tree-cell::before {
    content: '';
    display: block;
    position: absolute;
    top: 0; right: 50%;
    width: 51%; height: 28px;
    border-top: 2px solid var(--org-line, rgba(148,163,184,0.35));
  }
  /* Horizontal rail — right half + vertical drop to this cell */
  .org-tree-cell::after {
    content: '';
    display: block;
    position: absolute;
    top: 0; left: 50%;
    width: 51%; height: 28px;
    border-top: 2px solid var(--org-line, rgba(148,163,184,0.35));
    border-left: 2px solid var(--org-line, rgba(148,163,184,0.35));
  }

  /* Only child — remove horizontal rails, keep vertical drop */
  .org-tree-cell:only-child::before,
  .org-tree-cell:only-child::after { display: none; }

  /* First child — no left cap */
  .org-tree-cell:first-child::before { border: 0 none; }
  /* Last child — no right segment */
  .org-tree-cell:last-child::after  { width: 0; border-top: 0 none; }
  /* Last child closes the right side of the rail */
  .org-tree-cell:last-child::before {
    border-right: 2px solid var(--org-line, rgba(148,163,184,0.35));
    border-radius: 0 6px 0 0;
  }
  /* First child rounds the left corner */
  .org-tree-cell:first-child::after { border-radius: 6px 0 0 0; }

  /* Hover lift on every card */
  .org-card { transition: transform 0.18s, box-shadow 0.18s; }
  .org-card:hover { transform: translateY(-2px); }

  /* Collapse toggle */
  .org-collapse-btn {
    margin-top: 5px;
    padding: 2px 10px;
    font-size: 10px; font-weight: 700;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-muted);
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: background 0.15s, color 0.15s;
  }
  .org-collapse-btn:hover { background: var(--bg-card); color: var(--text-primary); }

  /* Search highlight pulse */
  @keyframes org-highlight {
    0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
    50%      { box-shadow: 0 0 0 6px rgba(245,158,11,0.25); }
  }
  .org-card-highlighted { animation: org-highlight 1.4s ease-in-out 3; }

  /* Unassigned grid */
  .unassigned-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 10px; }
`;

// ─── Avatar ───────────────────────────────────────────────────────────────────
const PALETTE = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899','#F97316'];
const Avatar = ({ user, size = 38, color }) => {
  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`.toUpperCase();
  const bg = color || PALETTE[(initials.charCodeAt(0)||0) % PALETTE.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.36,
      boxShadow: `0 0 0 3px ${bg}33`,
    }}>
      {initials}
    </div>
  );
};

// ─── Org-chart node cards ─────────────────────────────────────────────────────
const ExecCard = ({ node, search }) => {
  const hit = search && `${node.firstName} ${node.lastName} ${node.role}`.toLowerCase().includes(search.toLowerCase());
  return (
    <div className={`org-card${hit ? ' org-card-highlighted' : ''}`} style={{
      display: 'inline-flex', flexDirection: 'column', gap: 10,
      minWidth: 230, padding: '18px 22px', borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.18) 100%)',
      border: hit ? '2px solid #F59E0B' : '2px solid rgba(139,92,246,0.55)',
      boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar user={node} size={52} color="#6366F1" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{node.firstName} {node.lastName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{node.role}</div>
        </div>
        <span style={{ fontSize: 22, marginLeft: 4 }}>👑</span>
      </div>
      {node.children?.length > 0 && (
        <div style={{
          fontSize: 11, color: 'rgba(139,92,246,0.9)', fontWeight: 700,
          paddingTop: 6, borderTop: '1px solid rgba(139,92,246,0.2)',
        }}>
          {node.children.length} direct report{node.children.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

const ManagerCard = ({ node, isAdmin, allSupervisors, onMove, search }) => {
  const theme = node.department ? getDepartmentTheme(node.department) : null;
  const accent = theme?.primary || '#64748B';
  const hit = search && `${node.firstName} ${node.lastName} ${node.role}`.toLowerCase().includes(search.toLowerCase());
  const [moving, setMoving] = useState(false);
  const [val, setVal] = useState('');
  const handleMove = async (e) => {
    if (!e.target.value) return;
    setMoving(true);
    await onMove(node._id, e.target.value === 'none' ? null : e.target.value);
    setMoving(false);
    setVal('');
  };
  return (
    <div className={`org-card${hit ? ' org-card-highlighted' : ''}`} style={{
      display: 'inline-flex', flexDirection: 'column', gap: 8,
      minWidth: 200, padding: '14px 18px', borderRadius: 12,
      background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
      border: hit ? `2px solid #F59E0B` : `1.5px solid ${accent}40`,
      boxShadow: `0 4px 18px ${accent}18`,
      opacity: moving ? 0.5 : 1, pointerEvents: moving ? 'none' : 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={node} size={40} color={accent} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.firstName} {node.lastName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{node.role}</div>
          {node.department && (
            <div style={{
              display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700,
              padding: '1px 8px', borderRadius: 20,
              background: `${accent}22`, color: accent, border: `1px solid ${accent}44`,
            }}>
              {theme?.icon} {node.department}
            </div>
          )}
        </div>
      </div>
      {node.children?.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 5, borderTop: `1px solid ${accent}25` }}>
          👥 {node.children.length} member{node.children.length !== 1 ? 's' : ''}
        </div>
      )}
      {isAdmin && (
        <select value={val} onChange={handleMove} disabled={moving} style={{
          fontSize: 10, padding: '3px 7px', borderRadius: 6,
          border: '1px solid var(--border-color)', background: 'var(--bg-card)',
          color: 'var(--text-primary)', cursor: 'pointer', width: '100%',
        }}>
          <option value="">Assign supervisor…</option>
          <option value="none">✕ Remove supervisor</option>
          {allSupervisors.filter(s => s._id?.toString() !== node._id?.toString()).map(s => (
            <option key={s._id} value={s._id}>{s.firstName} {s.lastName} · {s.role}</option>
          ))}
        </select>
      )}
    </div>
  );
};

const MemberCard = ({ node, isAdmin, allSupervisors, onMove, search }) => {
  const hit = search && `${node.firstName} ${node.lastName} ${node.role}`.toLowerCase().includes(search.toLowerCase());
  const [moving, setMoving] = useState(false);
  const [val, setVal] = useState('');
  const initColor = PALETTE[((`${node.firstName}${node.lastName}`).charCodeAt(0)||0) % PALETTE.length];
  const handleMove = async (e) => {
    if (!e.target.value) return;
    setMoving(true);
    await onMove(node._id, e.target.value === 'none' ? null : e.target.value);
    setMoving(false);
    setVal('');
  };
  return (
    <div className={`org-card${hit ? ' org-card-highlighted' : ''}`} style={{
      display: 'inline-flex', flexDirection: 'column', gap: 6,
      minWidth: 165, padding: '10px 13px', borderRadius: 10,
      background: 'var(--bg-secondary)',
      border: hit ? '2px solid #F59E0B' : '1px solid var(--border-color)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      opacity: moving ? 0.5 : 1, pointerEvents: moving ? 'none' : 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar user={node} size={30} color={initColor} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.firstName} {node.lastName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.role}
          </div>
        </div>
      </div>
      {isAdmin && (
        <select value={val} onChange={handleMove} disabled={moving} style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 5,
          border: '1px solid var(--border-color)', background: 'var(--bg-card)',
          color: 'var(--text-primary)', cursor: 'pointer', width: '100%',
        }}>
          <option value="">Move to…</option>
          <option value="none">✕ Unassign</option>
          {allSupervisors.filter(s => s._id?.toString() !== node._id?.toString()).map(s => (
            <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
          ))}
        </select>
      )}
    </div>
  );
};

// ─── Recursive org branch ─────────────────────────────────────────────────────
const OrgBranch = ({ node, isAdmin, allSupervisors, onMove, search, depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children?.length > 0;

  const CardComponent =
    node.nodeType === 'executive' ? ExecCard :
    node.nodeType === 'manager'   ? ManagerCard :
    MemberCard;

  return (
    <div className="org-tree-cell">
      {/* Card */}
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <CardComponent
          node={node}
          isAdmin={isAdmin}
          allSupervisors={allSupervisors}
          onMove={onMove}
          search={search}
        />
        {hasChildren && (
          <button className="org-collapse-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? `▼ Show ${node.children.length}` : '▲ Collapse'}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="org-tree-children">
          {node.children.map(child => (
            <OrgBranch
              key={child._id}
              node={child}
              isAdmin={isAdmin}
              allSupervisors={allSupervisors}
              onMove={onMove}
              search={search}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Build tree from API response ────────────────────────────────────────────
const buildTree = (execNode = [], teams = []) =>
  execNode.map(({ executive, directReports = [] }) => ({
    ...executive,
    nodeType: 'executive',
    children: directReports.map(report => {
      const team = teams.find(t =>
        t.manager._id?.toString() === report._id?.toString() ||
        t.manager._id === report._id
      );
      return {
        ...report,
        nodeType: team ? 'manager' : 'direct',
        department: team?.department || null,
        children: team
          ? team.members.map(m => ({ ...m, nodeType: 'member', children: [] }))
          : [],
      };
    }),
  }));

// ─── Unassigned user card ─────────────────────────────────────────────────────
const UnassignedCard = ({ m, isAdmin, allSupervisors, onMove }) => {
  const initColor = PALETTE[(`${m.firstName}${m.lastName}`.charCodeAt(0)||0) % PALETTE.length];
  const [moving, setMoving] = useState(false);
  const [val,    setVal]    = useState('');
  const handleMove = async (e) => {
    if (!e.target.value) return;
    setMoving(true);
    await onMove(m._id, e.target.value === 'none' ? null : e.target.value);
    setMoving(false);
    setVal('');
  };
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: '12px 14px', borderRadius: 10,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      opacity: moving ? 0.5 : 1,
      pointerEvents: moving ? 'none' : 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={m} size={34} color={initColor} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {m.firstName} {m.lastName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.role}</div>
          <div style={{
            display: 'inline-block', fontSize: 10, fontWeight: 700,
            padding: '1px 7px', borderRadius: 20, marginTop: 3,
            background: 'rgba(239,68,68,0.15)', color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.3)',
          }}>
            {m.uLabel}
          </div>
        </div>
      </div>
      {isAdmin && (
        <select value={val} onChange={handleMove} disabled={moving} style={{
          fontSize: 11, padding: '4px 8px', borderRadius: 6,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)', color: 'var(--text-primary)',
          cursor: 'pointer', width: '100%',
        }}>
          <option value="">Assign supervisor…</option>
          {allSupervisors.filter(s => s._id?.toString() !== m._id?.toString()).map(s => (
            <option key={s._id} value={s._id}>{s.firstName} {s.lastName} · {s.role}</option>
          ))}
        </select>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const TeamsPage = () => {
  const { user } = useAuth();
  const [treeData,        setTreeData]        = useState([]);
  const [unassigned,      setUnassigned]      = useState({ members: [], managers: [], directs: [] });
  const [allSupervisors,  setAllSupervisors]  = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [search,          setSearch]          = useState('');

  const isAdmin = ['CRM core Administrator', 'System Architect', 'Super Admin',
    'Super CRM Administrator', 'Core 360 Administrator', 'Administrator'].includes(user?.role);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/auth/teams');
      setTreeData(buildTree(data.execNode || [], data.teams || []));
      setUnassigned({
        members:  data.unassignedMembers  || [],
        managers: data.unassignedManagers || [],
        directs:  data.unassignedDirects  || [],
      });
      setAllSupervisors(data.allSupervisors || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const assignMember = async (userId, supervisorId) => {
    setError(''); setSuccess('');
    try {
      await API.put(`/auth/users/${userId}`, { supervisor: supervisorId || null });
      setSuccess('Updated successfully');
      await fetchTeams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner" />Loading org chart…</div>;

  const totalUnassigned = unassigned.members.length + unassigned.managers.length + unassigned.directs.length;
  const totalPeople = treeData.reduce((sum, exec) => {
    const directCount = exec.children.length;
    const memberCount = exec.children.reduce((s, c) => s + (c.children?.length || 0), 0);
    return sum + 1 + directCount + memberCount;
  }, 0);

  const allUnassigned = [
    ...unassigned.directs.map(u => ({ ...u, uLabel: 'Admin / Direct' })),
    ...unassigned.managers.map(u => ({ ...u, uLabel: 'Manager' })),
    ...unassigned.members.map(u => ({ ...u, uLabel: 'Member' })),
  ];

  return (
    <div className="fade-in">
      <style>{ORG_TREE_CSS}</style>

      {/* ── Banner ── */}
      <div className="crm-page-banner" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 16, padding: 24,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 6 }}>
            Organizational Chart
          </div>
          <h1 className="page-title" style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            🏢 Teams &amp; Hierarchy
          </h1>
          <p className="page-subtitle" style={{ color: '#CBD5E1', marginTop: 8, marginBottom: 0 }}>
            Who reports to whom — live org chart
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Executives',  value: treeData.length,   color: '#A78BFA' },
            { label: 'People',      value: totalPeople,        color: '#A7F3D0' },
            { label: 'Unassigned',  value: totalUnassigned,    color: totalUnassigned > 0 ? '#FCA5A5' : '#A7F3D0' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '12px 20px', textAlign: 'center', minWidth: 90,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(248,250,252,0.8)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Search ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          placeholder="🔍 Search by name or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        {search && (
          <button
            className="btn btn-secondary"
            onClick={() => setSearch('')}
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            ✕ Clear
          </button>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          🖱 Scroll horizontally to see the full chart · Click <strong>▲ Collapse</strong> to fold branches
        </div>
      </div>

      {/* ── Org chart trees ── */}
      {treeData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          No executives found. Assign users with the <strong>Executive User</strong> role and link managers to them to build the hierarchy.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: 32 }}>
          {treeData.map(execNode => (
            <div key={execNode._id} style={{ marginBottom: 56 }}>
              {/* Single root — wrap in a container that triggers the org-tree-cell behaviour */}
              <div className="org-tree-root">
                <div className="org-tree-children" style={{ paddingTop: 0, borderLeft: 'none' }}>
                  <OrgBranch
                    node={execNode}
                    isAdmin={isAdmin}
                    allSupervisors={allSupervisors}
                    onMove={assignMember}
                    search={search}
                    depth={0}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Unassigned section ── */}
      {allUnassigned.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 20px', borderRadius: '12px 12px 0 0',
            background: 'rgba(239,68,68,0.08)',
            border: '1.5px solid rgba(239,68,68,0.3)',
            borderBottom: 'none',
          }}>
            <span style={{ fontSize: 22 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                Unassigned — {allUnassigned.length} {allUnassigned.length === 1 ? 'person' : 'people'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                These users have no supervisor set and won't appear in the chart above
              </div>
            </div>
          </div>
          <div style={{
            padding: '18px 20px',
            border: '1.5px solid rgba(239,68,68,0.3)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            background: 'rgba(239,68,68,0.03)',
          }}>
            <div className="unassigned-grid">
              {allUnassigned.map(m => (
                <UnassignedCard
                  key={m._id}
                  m={m}
                  isAdmin={isAdmin}
                  allSupervisors={allSupervisors}
                  onMove={assignMember}
                />
              ))}
            </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
