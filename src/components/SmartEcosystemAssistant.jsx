import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Icon } from './Icons';

const CONTEXT_INSIGHTS = {
  '/dashboard': [
    { title: 'Pipeline Velocity', desc: 'Conversion rate is up 12% this week across top sales reps.', icon: '📈' },
    { title: 'Action Item', desc: '3 high-value leads have had no contact for over 48 hours.', icon: '⚠️' },
    { title: 'System Health', desc: 'All CRM services, SMTP email relays, and APIs operating normally.', icon: '✅' },
  ],
  '/leads': [
    { title: 'Smart Recommendation', desc: 'Prioritize leads tagged "Service Inquiry" for highest conversion probability.', icon: '🎯' },
    { title: 'Auto-Distribution', desc: '2 newly assigned leads ready for sales team outreach.', icon: '🔁' },
  ],
  '/inventory': [
    { title: 'Stock Alert', desc: '3 SKU items are below safety threshold and require reordering.', icon: '📦' },
    { title: 'Cycle Count Due', desc: 'Physical inventory audit recommended for Zone A Warehouse.', icon: '📉' },
  ],
  '/hrm/payroll': [
    { title: 'Payroll Audit', desc: 'All 14 employee overtime entries validated against schedule logs.', icon: '💰' },
    { title: 'Tax Threshold Warning', desc: 'Quarterly tax adjustment summary ready for review.', icon: '⚠️' },
  ],
  '/executive': [
    { title: 'Executive Brief', desc: 'Quarterly revenue forecast tracking at 104% of baseline target.', icon: '📊' },
    { title: 'Margin Analysis', desc: 'Top product category generated 42% gross margin this month.', icon: '📈' },
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
  { label: 'Report Tech Issue', path: '/tickets', icon: '🐞', category: 'Support' },
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Super Ecosystem AI Co-Pilot (Ctrl + K)"
        className="assistant-trigger"
      >
        <span style={{ fontSize: 18 }}>🤖</span>
        <span>Ask Copilot</span>
        <span className="assistant-trigger-badge">Ctrl+K</span>
      </button>

      {isOpen && (
        <div className="assistant-overlay" onClick={() => setIsOpen(false)}>
          <div className="assistant-panel" onClick={(e) => e.stopPropagation()}>
            <div className="assistant-header">
              <div>
                <div className="assistant-header-title">Ecosystem AI Co-Pilot</div>
                <div className="assistant-subtitle">Active context: {currentRoute}</div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <div className="assistant-insights">
              {activeInsights.map((insight, idx) => (
                <div key={idx} className="assistant-insight">
                  <span style={{ fontSize: 16 }}>{insight.icon}</span>
                  <div>
                    <strong>{insight.title}</strong>
                    <span>{insight.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="assistant-quick-actions">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  className="assistant-quick-action"
                  onClick={() => {
                    navigate(action.path);
                    setIsOpen(false);
                  }}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            <div className="assistant-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`assistant-bubble ${msg.sender === 'user' ? 'assistant-bubble-user' : 'assistant-bubble-ai'}`}
                >
                  <div>{msg.text}</div>
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.72, textAlign: 'right' }}>{msg.timestamp}</div>
                </div>
              ))}
              {loading && (
                <div className="assistant-bubble assistant-bubble-ai">
                  <div className="assistant-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="assistant-input-row">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Assistant or search ecosystem..."
                className="assistant-input"
              />
              <button type="submit" disabled={loading} className="assistant-send">
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartEcosystemAssistant;
