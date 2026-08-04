import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import API from '../services/api';
import { Icon } from '../components/Icons';

const COLUMNS = [
  { id: 'New', label: 'New Lead', icon: 'plus', color: '#2563EB', bg: '#EFF6FF', description: 'Fresh prospects to contact' },
  { id: 'Contacted', label: 'In Outreach', icon: 'phone', color: '#0284C7', bg: '#E0F2FE', description: 'Follow-up in progress' },
  { id: 'Qualified', label: 'Qualified', icon: 'like', color: '#7C3AED', bg: '#F3E8FF', description: 'Ready for next step' },
  { id: 'Converted', label: 'Won / Converted', icon: 'check', color: '#059669', bg: '#ECFDF5', description: 'Deals closed successfully' },
  { id: 'Lost', label: 'Lost Lead', icon: 'close', color: '#DC2626', bg: '#FEF2F2', description: 'Closed and not pursued' },
];

const sourceBadgeStyle = (src) => ({
  background: src === 'Meta' ? '#DBEAFE' : '#FEF3C7',
  color: src === 'Meta' ? '#1E40AF' : '#B45309',
  border: `1px solid ${src === 'Meta' ? '#BFDBFE' : '#FDE68A'}`,
});

const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'LD';

const SalesKanbanPage = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState(() =>
    Object.fromEntries(COLUMNS.map((c) => [c.id, []]))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await API.get('/leads');
        const grouped = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
        (data.data || []).forEach((lead) => {
          if (grouped[lead.status]) grouped[lead.status].push(lead);
          else grouped.New.push(lead);
        });
        setBoard(grouped);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load leads');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = [...board[source.droppableId]];
    const dstCol = source.droppableId === destination.droppableId ? srcCol : [...board[destination.droppableId]];
    const [moved] = srcCol.splice(source.index, 1);
    moved.status = destination.droppableId;
    dstCol.splice(destination.index, 0, moved);

    setBoard((prev) => ({
      ...prev,
      [source.droppableId]: srcCol,
      [destination.droppableId]: dstCol,
    }));

    try {
      await API.put(`/leads/${draggableId}`, { status: destination.droppableId });
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const filterLead = (lead) =>
    !search ||
    lead.name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone?.toLowerCase().includes(search.toLowerCase());

  const summary = useMemo(() => {
    const total = Object.values(board).reduce((sum, column) => sum + column.length, 0);
    const openDeals = (board.New?.length || 0) + (board.Contacted?.length || 0);
    const qualified = board.Qualified?.length || 0;
    const won = board.Converted?.length || 0;
    const lost = board.Lost?.length || 0;
    const conversion = total ? Math.round((won / total) * 100) : 0;

    return {
      total,
      openDeals,
      qualified,
      won,
      lost,
      conversion,
    };
  }, [board]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="crm-glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563EB', marginBottom: 4 }}>
            Visual Sales Pipeline
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="kanban" size={24} style={{ color: '#2563EB' }} />
            Sales Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, margin: 0 }}>
            Track every deal from first contact to close with a clearer, faster workflow.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <span style={{ position: 'absolute', left: 10, top: 8, fontSize: 13, color: '#94A3B8' }}>
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              placeholder="Search deals"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: 34,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                fontSize: 12,
                outline: 'none',
                background: '#FFF',
              }}
            />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, fontWeight: 700 }}>
            <Icon name="trending" size={14} />
            {summary.conversion}% conversion
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Open deals', value: summary.openDeals, icon: 'target', color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Qualified', value: summary.qualified, icon: 'like', color: '#7C3AED', bg: '#F3E8FF' },
          { label: 'Won', value: summary.won, icon: 'check', color: '#059669', bg: '#ECFDF5' },
          { label: 'Lost', value: summary.lost, icon: 'close', color: '#DC2626', bg: '#FEF2F2' },
        ].map((item) => (
          <div key={item.label} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.bg, color: item.color }}>
                <Icon name={item.icon} size={16} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{item.value}</div>
            </div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state" style={{ padding: 60 }}><div className="spinner" />Loading Sales Dashboard...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 20 }}>
            {COLUMNS.map((col) => {
              const leads = board[col.id].filter(filterLead);
              return (
                <div key={col.id} style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${col.color}33`,
                      borderTop: `3px solid ${col.color}`,
                      borderRadius: 14,
                      padding: '14px 16px',
                      marginBottom: 12,
                      boxShadow: `0 10px 24px rgba(15, 23, 42, 0.05)`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: col.bg, color: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={col.icon} size={15} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{col.label}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>{col.description}</div>
                        </div>
                      </div>
                      <span style={{ background: col.bg, color: col.color, border: `1px solid ${col.color}44`, borderRadius: 999, padding: '3px 9px', fontSize: 12, fontWeight: 700 }}>
                        {leads.length}
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          flex: 1,
                          minHeight: 340,
                          background: snapshot.isDraggingOver ? `${col.color}0D` : '#F8FAFC',
                          border: snapshot.isDraggingOver ? `2px dashed ${col.color}` : '1px solid #E2E8F0',
                          borderRadius: 14,
                          padding: 8,
                          transition: 'all 0.18s ease',
                        }}
                      >
                        {leads.map((lead, index) => (
                          <Draggable key={lead._id} draggableId={lead._id} index={index}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                onClick={() => navigate(`/leads/${lead._id}`)}
                                style={{
                                  background: snap.isDragging ? 'rgba(255,255,255,0.98)' : '#FFF',
                                  border: snap.isDragging ? `2px solid ${col.color}` : '1px solid #E2E8F0',
                                  borderRadius: 12,
                                  padding: 12,
                                  marginBottom: 10,
                                  boxShadow: snap.isDragging ? `0 16px 32px rgba(0,0,0,0.12)` : '0 4px 10px rgba(15, 23, 42, 0.04)',
                                  cursor: 'grab',
                                  transition: 'all 0.15s ease',
                                  ...prov.draggableProps.style,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                      {getInitials(lead.name)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {lead.name}
                                      </div>
                                      <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {lead.email || 'No email provided'}
                                      </div>
                                    </div>
                                  </div>
                                  <span style={{ ...sourceBadgeStyle(lead.source), fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, flexShrink: 0 }}>
                                    {lead.source || 'Direct'}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                  {lead.phone && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 7px', borderRadius: 999 }}>
                                      <Icon name="phone" size={11} />
                                      {lead.phone}
                                    </span>
                                  )}
                                  {lead.assignedTo ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#334155', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 7px', borderRadius: 999 }}>
                                      <Icon name="users" size={11} />
                                      {lead.assignedTo.firstName || 'Agent'}
                                    </span>
                                  ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 7px', borderRadius: 999 }}>
                                      <Icon name="clock" size={11} />
                                      Pending
                                    </span>
                                  )}
                                </div>

                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8, fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Icon name="trending" size={11} />
                                    {col.label}
                                  </span>
                                  <span style={{ color: '#0F172A', fontWeight: 700 }}>Open</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {leads.length === 0 && !snapshot.isDraggingOver && (
                          <div style={{ textAlign: 'center', padding: '38px 10px', color: '#94A3B8', fontSize: 12 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 12, background: '#F8FAFC', marginBottom: 8 }}>
                              <Icon name={col.icon} size={16} />
                            </div>
                            <div>No deals in this stage</div>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default SalesKanbanPage;
