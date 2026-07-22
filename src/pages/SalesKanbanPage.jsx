import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import API from '../services/api';
import { Icon } from '../components/Icons';

const COLUMNS = [
  { id: 'New', label: 'New Lead', icon: 'plus', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'Contacted', label: 'In Outreach', icon: 'phone', color: '#0284C7', bg: '#E0F2FE' },
  { id: 'Qualified', label: 'Qualified', icon: 'like', color: '#7C3AED', bg: '#F3E8FF' },
  { id: 'Converted', label: 'Won / Converted', icon: 'check', color: '#059669', bg: '#ECFDF5' },
  { id: 'Lost', label: 'Lost Lead', icon: 'close', color: '#DC2626', bg: '#FEF2F2' },
];

const sourceBadgeStyle = (src) => ({
  background: src === 'Meta' ? '#DBEAFE' : '#FEF3C7',
  color: src === 'Meta' ? '#1E40AF' : '#B45309',
  border: `1px solid ${src === 'Meta' ? '#BFDBFE' : '#FDE68A'}`,
});

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
          else grouped['New'].push(lead);
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
    lead.email?.toLowerCase().includes(search.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="crm-glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563EB', marginBottom: 4 }}>
            Visual Sales Pipeline
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="kanban" size={26} style={{ color: '#2563EB' }} />
            Sales Kanban Board
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, margin: 0 }}>
            Drag and drop deals across stages to update status instantly
          </p>
        </div>

        <div style={{ position: 'relative', width: 260 }}>
          <span style={{ position: 'absolute', left: 10, top: 8, fontSize: 13, color: '#94A3B8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search deal pipeline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 30,
              paddingRight: 12,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state" style={{ padding: 60 }}><div className="spinner" />Loading Sales Kanban Board...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 20 }}>
            {COLUMNS.map((col) => {
              const leads = board[col.id].filter(filterLead);
              return (
                <div key={col.id} style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column' }}>
                  {/* Column Header */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: `1px solid ${col.color}33`,
                      borderTop: `3px solid ${col.color}`,
                      borderRadius: 12,
                      padding: '14px 16px',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: `0 4px 12px rgba(0,0,0,0.04), 0 1px 4px ${col.color}1A`,
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                      {col.label}
                    </span>
                    <span
                      style={{
                        background: col.bg,
                        color: col.color,
                        border: `1px solid ${col.color}44`,
                        borderRadius: 12,
                        padding: '2px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {leads.length}
                    </span>
                  </div>

                  {/* Droppable Column Body */}
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
                          borderRadius: 12,
                          padding: 8,
                          transition: 'all 0.15s ease',
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
                                  background: snap.isDragging ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
                                  backdropFilter: 'blur(8px)',
                                  WebkitBackdropFilter: 'blur(8px)',
                                  border: snap.isDragging ? `2px solid ${col.color}` : '1px solid rgba(226, 232, 240, 0.8)',
                                  borderRadius: 10,
                                  padding: 14,
                                  marginBottom: 10,
                                  boxShadow: snap.isDragging
                                    ? `0 16px 32px rgba(0,0,0,0.18), 0 4px 8px ${col.color}33`
                                    : '0 2px 8px rgba(15, 23, 42, 0.05)',
                                  cursor: 'grab',
                                  transition: 'all 0.15s ease',
                                  ...prov.draggableProps.style,
                                }}
                              >
                                <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', marginBottom: 4 }}>
                                  {lead.name}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {lead.email}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                  <span style={{ ...sourceBadgeStyle(lead.source), fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                                    {lead.source || 'Direct'}
                                  </span>
                                  {lead.phone && (
                                    <span style={{ fontSize: 11, color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <Icon name="phone" size={10} />
                                      {lead.phone}
                                    </span>
                                  )}
                                </div>

                                {lead.assignedTo && (
                                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8, marginTop: 6, fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div className="crm-avatar-chip" style={{ width: 20, height: 20, fontSize: 9 }}>
                                      {lead.assignedTo.firstName?.[0] || 'A'}
                                    </div>
                                    <span>{lead.assignedTo.firstName} {lead.assignedTo.lastName}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {leads.length === 0 && !snapshot.isDraggingOver && (
                          <div style={{ textAlign: 'center', padding: '36px 0', color: '#94A3B8', fontSize: 12 }}>
                            Drag deals here
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
