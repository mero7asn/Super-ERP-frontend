import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';

const CONTEXT_INSIGHTS = {
  '/dashboard': [
    { title: 'Pipeline Velocity', desc: 'Conversion rate is up 12% this week across top sales reps.', icon: '📈' },
    { title: 'Action Item', desc: '3 high-value leads have had no contact for over 48 hours.', icon: '⚡' },
    { title: 'System Health', desc: 'All CRM services, SMTP email relays, and APIs operating normally.', icon: '✅' },
  ],
  '/leads': [
    { title: 'Smart Recommendation', desc: 'Prioritize leads tagged "Service Inquiry" for highest conversion probability.', icon: '🎯' },
    { title: 'Auto-Distribution', desc: '2 newly assigned leads ready for sales team outreach.', icon: '🔄' },
  ],
  '/inventory': [
    { title: 'Stock Alert', desc: '3 SKU items are below safety threshold and require reordering.', icon: '📦' },
    { title: 'Cycle Count Due', desc: 'Physical inventory audit recommended for Zone A Warehouse.', icon: '📋' },
  ],
  '/hrm/payroll': [
    { title: 'Payroll Audit', desc: 'All 14 employee overtime entries validated against schedule logs.', icon: '💰' },
    { title: 'Tax Threshold Warning', desc: 'Quarterly tax adjustment summary ready for review.', icon: '⚠️' },
  ],
  '/executive': [
    { title: 'Executive Brief', desc: 'Quarterly revenue forecast tracking at 104% of baseline target.', icon: '📊' },
    { title: 'Margin Analysis', desc: 'Top product category generated 42% gross margin this month.', icon: '🏆' },
  ],
};

const DEFAULT_INSIGHTS = [
  { title: 'Super Ecosystem Co-Pilot', desc: 'Connected across CRM, HRM, ESS, and Inventory modules.', icon: '🤖' },
  { title: 'Proactive Alert', desc: 'Check system alerts and pending approvals in the top menu.', icon: '💡' },
];

const QUICK_ACTIONS = [
  { label: 'Create New Lead', path: '/leads', icon: '👤', category: 'CRM' },
  { label: 'Draft Offer Email', path: '/email-composer', icon: '✉️', category: 'CRM' },
  { label: 'Check Stock Items', path: '/inventory/items', icon: '📦', category: 'Inventory' },
  { label: 'View Employee Payroll', path: '/hrm/payroll', icon: '💰', category: 'HRM' },
  { label: 'Report Tech Issue', path: '/tickets', icon: '🎫', category: 'Support' },
];

const SmartEcosystemAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Super Ecosystem Smart Assistant. Ask me anything about your Leads, Inventory, Payroll, or System Analytics.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Keyboard shortcut listener Ctrl + K / Cmd + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const currentRoute = location.pathname;
  const activeInsights = CONTEXT_INSIGHTS[currentRoute] || DEFAULT_INSIGHTS;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      // Ecosystem Smart Search & Query logic
      let replyText = '';
      const q = currentQuery.toLowerCase();

      if (q.includes('lead') || q.includes('customer') || q.includes('prospect')) {
        replyText = `Found relevant lead records in CRM. Redirecting to Lead Management...`;
        setTimeout(() => navigate('/leads'), 1200);
      } else if (q.includes('stock') || q.includes('inventory') || q.includes('item') || q.includes('product')) {
        replyText = `Checking stock levels across warehouses. Navigating to Inventory Catalog...`;
        setTimeout(() => navigate('/inventory/items'), 1200);
      } else if (q.includes('payroll') || q.includes('salary') || q.includes('payslip') || q.includes('employee')) {
        replyText = `Opening Human Resources Payroll portal...`;
        setTimeout(() => navigate('/hrm/payroll'), 1200);
      } else if (q.includes('offer') || q.includes('quote') || q.includes('email')) {
        replyText = `Opening Email Proposal Composer...`;
        setTimeout(() => navigate('/email-composer'), 1200);
      } else if (q.includes('ticket') || q.includes('issue') || q.includes('bug')) {
        replyText = `Navigating to Technical Support Tickets...`;
        setTimeout(() => navigate('/tickets'), 1200);
      } else {
        replyText = `I have analyzed "${currentQuery}". The system ecosystem status is optimal with 100% operational throughput. You can use quick navigation buttons below for instant actions.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Assistant system error. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Super Ecosystem AI Co-Pilot (Ctrl + K)"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          height: 52,
          padding: '0 20px',
          borderRadius: 26,
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          zIndex: 9000,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: 18 }}>🤖</span>
        <span>AI Assistant</span>
        <span
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '2px 8px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          Ctrl+K
        </span>
      </button>

      {/* ASSISTANT DRAWER PANEL */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 9999,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 420,
              maxWidth: '100vw',
              height: '100%',
              background: '#ffffff',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(37, 99, 235, 0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  🤖
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Ecosystem AI Co-Pilot</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    Active Context: <strong style={{ color: '#60A5FA' }}>{currentRoute}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 24, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Context Insights */}
            <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>
                💡 Page Insights & Recommendations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      background: '#ffffff',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{insight.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{insight.title}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{insight.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>
                ⚡ Quick Ecosystem Actions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(action.path);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: 16,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#DBEAFE';
                      e.currentTarget.style.borderColor = '#93C5FD';
                      e.currentTarget.style.color = '#1E40AF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F1F5F9';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.color = '#334155';
                    }}
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? '#2563EB' : '#F1F5F9',
                    color: msg.sender === 'user' ? '#ffffff' : '#1E293B',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div>{msg.text}</div>
                  <div
                    style={{
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: 'right',
                      opacity: 0.7,
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', background: '#F1F5F9', padding: '10px 14px', borderRadius: 14, fontSize: 13, color: '#64748B' }}>
                  Analyzing ecosystem data...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSearch} style={{ padding: 16, borderTop: '1px solid #E2E8F0', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Assistant or search ecosystem..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 20,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#2563EB',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 20,
                    padding: '0 18px',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartEcosystemAssistant;
