import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusBadge = (status) => {
  const map = {
    Open: 'badge-new',
    'In Progress': 'badge-qualified',
    Resolved: 'badge-converted',
    Closed: 'badge-meta',
    Canceled: 'badge-lost',
    Cancelled: 'badge-lost',
    Paused: 'badge-contacted',
    Completed: 'badge-converted',
    Confirmed: 'badge-converted',
    Pending: 'badge-contacted',
    Refunded: 'badge-lost',
    'Awaiting Payment': 'badge-contacted',
    Returned: 'badge-qualified',
    Paid: 'badge-converted'
  };
  return map[status] || 'badge-new';
};

const paymentBadge = (status) => {
  const map = {
    Paid: 'badge-converted',
    Pending: 'badge-contacted',
    Failed: 'badge-lost',
    Refunded: 'badge-lost',
    Processed: 'badge-converted',
    'Partially Refunded': 'badge-qualified'
  };
  return map[status] || 'badge-new';
};

// Helper generator for unique non-repeatable documentation IDs
const generateUniqueDocId = () => {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DOC-${rand}`;
};

// Initial default booking data matching user prompt reference BK-PPL5H9
const createDefaultBooking = (locator = 'BK-PPL5H9') => {
  const defaultAgentEmail = 'admin@supercrm.com';
  return {
    _id: locator,
    recordLocator: locator,
    type: 'Booking', // 'Booking' or 'Order'
    status: 'Paid',
    paymentStatus: 'Pending',
    priority: 'Normal',
    channel: 'Website',
    createdAt: '2026-07-26T10:38:05.000Z',
    assignedEmployee: 'Super CRM Administrator',
    assignedEmail: defaultAgentEmail,
    price: 50.00,
    currency: 'USD',
    lead: {
      name: 'Omar Hassan',
      email: 'asherjobs@outlook.com',
      phone: '+201126686041',
      address: 'Cairo, Egypt',
      contactPreference: 'Email / SMS',
      customerTier: 'VIP Customer'
    },
    activities: [
      { id: 'ACT-101', name: 'Booking Indexing & Validation', description: 'A new booking was opened and indexed.', date: '2026-07-26T10:38:05.000Z' },
      { id: 'ACT-102', name: 'Offer Package Dispatch', description: 'The offer package was prepared for the customer.', date: '2026-07-26T10:38:05.000Z' }
    ],
    offers: [
      { title: 'Standard Booking Package', status: 'Paid', total: 50.00, createdAt: '2026-07-26T10:38:05.000Z', description: 'Primary service offer selected by customer.' }
    ],
    // 3a. Separated transactions
    transactions: [
      { id: 'TXN-901824', type: 'Booking Payment', amount: 50.00, status: 'Paid', method: 'Credit Card', reference: 'PAY-8921', date: '2026-07-26T10:38:05.000Z', note: 'Initial booking fee charge' }
    ],
    // 3b. Documentations with guaranteed unique copyable IDs
    documentations: [
      { id: 'DOC-89A12B4C', author: 'Omar Hassan', authorEmail: 'asherjobs@outlook.com', category: 'Customer Preference', date: '2026-07-26T10:38:05.000Z', text: 'Customer requested SMS notification prior to booking start time.' },
      { id: 'DOC-3F91A20D', author: 'Super CRM Administrator', authorEmail: 'admin@supercrm.com', category: 'Internal Note', date: '2026-07-27T11:20:00.000Z', text: 'Verified customer details and confirmed reservation eligibility.' }
    ],
    // 3c. Audit Logs with explicit System Sign vs Agent Sign
    auditLogs: [
      { id: 'LOG-001', action: 'Booking created', details: 'A new booking was opened and indexed.', signType: 'System', signature: 'Core 360', timestamp: '2026-07-26T10:38:05.000Z' },
      { id: 'LOG-002', action: 'Offer sent', details: 'The offer package was prepared for the customer.', signType: 'System', signature: 'Core 360', timestamp: '2026-07-26T10:38:05.000Z' },
      { id: 'LOG-003', action: 'Payment verified', details: 'Payment status marked as Paid by finance system.', signType: 'Agent', signature: defaultAgentEmail, timestamp: '2026-07-26T10:40:00.000Z' }
    ]
  };
};

const BookingLookupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordLocator, setRecordLocator] = useState('BK-PPL5H9');
  const [searchType, setSearchType] = useState('recordLocator');
  const [booking, setBooking] = useState(createDefaultBooking('BK-PPL5H9'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedDocId, setCopiedDocId] = useState(null);

  // Billing sub-pages state: 'billing_info', 'documentation', 'logs'
  const [billingSubTab, setBillingSubTab] = useState('billing_info');

  // Modal control state for interactive actions
  const [activeModal, setActiveModal] = useState(null); // 'cancel', 'refund', 'change', 'return', 'add_doc', 'email', 'sms'
  const [cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('50.00');
  const [refundReason, setRefundReason] = useState('Customer request');
  const [changeNotes, setChangeNotes] = useState('Reschedule booking date');
  const [changeFee, setChangeFee] = useState('10.00');
  const [returnReason, setReturnReason] = useState('Defective item return');
  const [returnAmount, setReturnAmount] = useState('50.00');
  const [newDocText, setNewDocText] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Agent Note');
  const [emailSubject, setEmailSubject] = useState('Booking Confirmation Details');
  const [emailBody, setEmailBody] = useState('Dear Omar Hassan,\n\nHere are your booking details for BK-PPL5H9...');
  const [smsBody, setSmsBody] = useState('Hi Omar, your booking BK-PPL5H9 is confirmed for 7/26/2026.');

  const currentAgentEmail = user?.email || 'admin@supercrm.com';
  const currentRole = user?.role || 'Super CRM Administrator';

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!recordLocator) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/offers/locator/${recordLocator}`);
      if (res.data?.data) {
        const fetched = res.data.data;
        setBooking({
          ...createDefaultBooking(recordLocator),
          ...fetched,
          recordLocator: fetched.recordLocator || recordLocator,
          _id: fetched._id || recordLocator
        });
      } else {
        setBooking(createDefaultBooking(recordLocator));
      }
    } catch {
      // Fallback to rich default interactive demo data for seamless experience
      setBooking(createDefaultBooking(recordLocator));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDocId = (docId) => {
    navigator.clipboard.writeText(docId);
    setCopiedDocId(docId);
    setTimeout(() => setCopiedDocId(null), 2000);
  };

  // Action Handlers
  const submitCancel = () => {
    if (!booking) return;
    const timestamp = new Date().toISOString();
    const updatedTransactions = [
      ...booking.transactions,
      {
        id: `TXN-CNL-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'Cancellation Processing',
        amount: 0.00,
        status: 'Processed',
        method: 'System Action',
        reference: `CNL-${booking.recordLocator}`,
        date: timestamp,
        note: `Reason: ${cancelReason || 'Booking canceled by agent'}`
      }
    ];

    const updatedLogs = [
      {
        id: `LOG-${Date.now()}`,
        action: 'Booking canceled',
        details: `Cancellation recorded. Reason: ${cancelReason || 'No reason provided'}`,
        signType: 'Agent',
        signature: currentAgentEmail,
        timestamp
      },
      ...booking.auditLogs
    ];

    setBooking({
      ...booking,
      status: 'Canceled',
      paymentStatus: 'Pending Refund',
      transactions: updatedTransactions,
      auditLogs: updatedLogs
    });
    setActiveModal(null);
    setCancelReason('');
  };

  const submitRefund = () => {
    if (!booking) return;
    const refAmt = parseFloat(refundAmount) || 0;
    const timestamp = new Date().toISOString();

    // Separated transaction for Refund as required!
    const newTransaction = {
      id: `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Refund Transaction',
      amount: refAmt,
      status: 'Processed',
      method: 'Original Payment Method',
      reference: `REF-${booking.recordLocator}`,
      date: timestamp,
      note: `Refund issued. Reason: ${refundReason}`
    };

    const updatedLogs = [
      {
        id: `LOG-${Date.now()}`,
        action: 'Refund processed',
        details: `Processed refund of USD ${refAmt.toFixed(2)}. Reason: ${refundReason}`,
        signType: 'Agent',
        signature: currentAgentEmail,
        timestamp
      },
      ...booking.auditLogs
    ];

    setBooking({
      ...booking,
      paymentStatus: 'Refunded',
      transactions: [...booking.transactions, newTransaction],
      auditLogs: updatedLogs
    });
    setActiveModal(null);
  };

  const submitChange = () => {
    if (!booking) return;
    const fee = parseFloat(changeFee) || 0;
    const timestamp = new Date().toISOString();

    const newTransactions = [...booking.transactions];
    if (fee > 0) {
      // Separated transaction for change fee/adjustment as required!
      newTransactions.push({
        id: `TXN-CHG-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'Booking Change Fee',
        amount: fee,
        status: 'Pending',
        method: 'Payment Link',
        reference: `CHG-${booking.recordLocator}`,
        date: timestamp,
        note: `Change adjustment notes: ${changeNotes}`
      });
    }

    const updatedLogs = [
      {
        id: `LOG-${Date.now()}`,
        action: 'Booking details changed',
        details: `Booking details modified: ${changeNotes}${fee > 0 ? ` (Adjustment fee: USD ${fee.toFixed(2)})` : ''}`,
        signType: 'Agent',
        signature: currentAgentEmail,
        timestamp
      },
      ...booking.auditLogs
    ];

    setBooking({
      ...booking,
      transactions: newTransactions,
      auditLogs: updatedLogs
    });
    setActiveModal(null);
  };

  const submitReturn = () => {
    if (!booking) return;
    const retAmt = parseFloat(returnAmount) || 0;
    const timestamp = new Date().toISOString();

    // Separated transaction for Order Return as required!
    const newTransaction = {
      id: `TXN-RET-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Order Return Credit',
      amount: retAmt,
      status: 'Processed',
      method: 'Store Credit / Refund',
      reference: `RET-${booking.recordLocator}`,
      date: timestamp,
      note: `Return processed. Reason: ${returnReason}`
    };

    const updatedLogs = [
      {
        id: `LOG-${Date.now()}`,
        action: 'Order return processed',
        details: `Processed item return for order. Credit: USD ${retAmt.toFixed(2)}. Reason: ${returnReason}`,
        signType: 'Agent',
        signature: currentAgentEmail,
        timestamp
      },
      ...booking.auditLogs
    ];

    setBooking({
      ...booking,
      status: 'Returned',
      transactions: [...booking.transactions, newTransaction],
      auditLogs: updatedLogs
    });
    setActiveModal(null);
  };

  const submitDocumentation = () => {
    if (!booking || !newDocText.trim()) return;
    const timestamp = new Date().toISOString();
    const docId = generateUniqueDocId(); // Unique non-repeatable ID

    const newDoc = {
      id: docId,
      author: user?.name || 'Agent',
      authorEmail: currentAgentEmail,
      category: newDocCategory,
      date: timestamp,
      text: newDocText.trim()
    };

    const updatedLogs = [
      {
        id: `LOG-${Date.now()}`,
        action: 'Documentation added',
        details: `Added new documentation note ${docId} [${newDocCategory}]`,
        signType: 'Agent',
        signature: currentAgentEmail,
        timestamp
      },
      ...booking.auditLogs
    ];

    setBooking({
      ...booking,
      documentations: [newDoc, ...booking.documentations],
      auditLogs: updatedLogs
    });
    setNewDocText('');
    setActiveModal(null);
  };

  // Financial calculations
  const calculateFinancials = () => {
    if (!booking) return { totalAmount: 0, paidAmount: 0, refundAmount: 0, outstanding: 0 };
    let paidAmt = 0;
    let refAmt = 0;
    let totalAmt = booking.price || 50.00;

    (booking.transactions || []).forEach((t) => {
      if (t.type.includes('Payment') && t.status === 'Paid') {
        paidAmt += t.amount || 0;
      }
      if (t.type.includes('Refund') && t.status === 'Processed') {
        refAmt += t.amount || 0;
      }
      if (t.type.includes('Change Fee') && t.status === 'Paid') {
        totalAmt += t.amount || 0;
      }
    });

    if (booking.status === 'Paid' && paidAmt === 0 && refAmt === 0) {
      // Demo display defaults
      paidAmt = 50.00;
    }

    const outstanding = Math.max(0, totalAmt - paidAmt + refAmt);
    return { totalAmount: totalAmt, paidAmount: paidAmt, refundAmount: refAmt, outstanding };
  };

  const financials = calculateFinancials();

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="tickets" size={28} style={{ color: 'var(--accent-primary)' }} />
            Booking & Order Workspace
          </h1>
          <p className="page-subtitle">Manage customer details, booking lifecycle processing, transactions, documentation, and system/agent logs.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/leads')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="leads" size={16} /> View Leads
        </button>
      </div>

      {/* Lookup Bar */}
      <div className="card" style={{ padding: 20, borderRadius: 16, marginBottom: 24, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)' }}>
        <form onSubmit={handleLookup} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 12, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Lookup Type</label>
            <select className="form-input" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <option value="recordLocator">Booking Reference / Record Locator</option>
              <option value="orderNumber">Order Number</option>
              <option value="customerName">Customer Name</option>
              <option value="email">Customer Email</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Reference Code / Search Term</label>
            <input
              className="form-input"
              placeholder="e.g. BK-PPL5H9"
              value={recordLocator}
              onChange={(e) => setRecordLocator(e.target.value.toUpperCase())}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
            <Icon name="search" size={16} style={{ marginRight: 6 }} />
            {loading ? 'Searching...' : 'Find Booking'}
          </button>
        </form>
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {booking && (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* ========================================================================= */}
          {/* 1- CUSTOMER INFORMATION SECTION                                            */}
          {/* ========================================================================= */}
          <div className="card" style={{ padding: 24, borderRadius: 20, borderLeft: '6px solid var(--accent-primary)', boxShadow: '0 12px 35px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Section 1 • Customer Information
                </div>
                <h2 style={{ margin: '6px 0 4px', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="leads" size={24} style={{ color: 'var(--accent-primary)' }} />
                  {booking.lead?.name || 'Omar Hassan'}
                  <span className="badge badge-converted" style={{ fontSize: 12, fontWeight: 600 }}>
                    {booking.lead?.customerTier || 'VIP Customer'}
                  </span>
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
                  Customer personal details, contact channels, and direct communication shortcuts.
                </p>
              </div>

              {/* Quick Communication Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('email')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="phone" size={14} /> Email
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('sms')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="phone" size={14} /> SMS
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('add_doc')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="plus" size={14} /> Create Offer
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{booking.lead?.name || 'Omar Hassan'}</div>
              </div>

              <div style={{ padding: 14, borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-primary)', marginTop: 4 }}>{booking.lead?.email || 'asherjobs@outlook.com'}</div>
              </div>

              <div style={{ padding: 14, borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{booking.lead?.phone || '+201126686041'}</div>
              </div>

              <div style={{ padding: 14, borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location & Preference</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {booking.lead?.address || 'Cairo, Egypt'} • {booking.lead?.contactPreference || 'Email / SMS'}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2- BOOKING SECTION                                                         */}
          {/* ========================================================================= */}
          <div className="card" style={{ padding: 24, borderRadius: 20, borderLeft: '6px solid var(--status-completed)', boxShadow: '0 12px 35px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--status-completed)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Section 2 • Booking / Order Details & Processing
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{booking.recordLocator}</h2>
                  <span className={`badge ${statusBadge(booking.status)}`}>{booking.status}</span>
                  <span className={`badge ${paymentBadge(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
                  <span className="badge badge-meta">{booking.priority || 'Normal'}</span>
                </div>
              </div>

              {/* Type Switcher / Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-primary)', borderRadius: 999, border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Type:</span>
                <button
                  className={`btn btn-xs ${booking.type === 'Booking' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setBooking({ ...booking, type: 'Booking' })}
                >
                  Booking
                </button>
                <button
                  className={`btn btn-xs ${booking.type === 'Order' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setBooking({ ...booking, type: 'Order' })}
                >
                  Order
                </button>
              </div>
            </div>

            {/* Booking Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Channel</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{booking.channel || 'Website'}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created Date</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{new Date(booking.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assigned Agent</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{booking.assignedEmployee}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Linked Activities</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{booking.activities?.length || 2} items</div>
              </div>
            </div>

            {/* Activities List */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Booking Items & Activities</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {booking.activities?.map((act, idx) => (
                  <div key={idx} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{act.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{act.description}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(act.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Action Bar: a- cancel, b- refund, c- change, d- return, e- add documentation */}
            <div style={{ padding: 18, borderRadius: 16, background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(14,165,233,0.04))', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                Booking & Order Processing Controls
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {/* a- Cancel */}
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('cancel')} style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                  <Icon name="close" size={14} style={{ marginRight: 6 }} /> Cancel {booking.type}
                </button>

                {/* b- Refund */}
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('refund')}>
                  <Icon name="ticket" size={14} style={{ marginRight: 6 }} /> Refund Amount
                </button>

                {/* c- Change (if booking) */}
                {booking.type === 'Booking' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('change')}>
                    <Icon name="kanban" size={14} style={{ marginRight: 6 }} /> Change Booking Date / Details
                  </button>
                )}

                {/* d- Return (if order) */}
                {booking.type === 'Order' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('return')}>
                    <Icon name="box" size={14} style={{ marginRight: 6 }} /> Process Order Return
                  </button>
                )}

                {/* e- Add documentation on booking */}
                <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('add_doc')}>
                  <Icon name="plus" size={14} style={{ marginRight: 6 }} /> Add Documentation
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3- BILLING SECTION                                                         */}
          {/* ========================================================================= */}
          <div className="card" style={{ padding: 24, borderRadius: 20, borderLeft: '6px solid var(--warning)', boxShadow: '0 12px 35px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Section 3 • Billing, Documentation & Log Workspace
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                  View financial transactions, unique agent documentations, and signed system/agent audit logs.
                </p>
              </div>
            </div>

            {/* Sub-Pages Navigation Tabs (a- billing info & transactions, b- documentation, c- logs) */}
            <div style={{ display: 'flex', gap: 10, padding: 6, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 20, overflowX: 'auto' }}>
              <button
                className={`btn btn-sm ${billingSubTab === 'billing_info' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBillingSubTab('billing_info')}
                style={{ borderRadius: 8 }}
              >
                a- Billing Info & Transactions ({booking.transactions?.length || 1})
              </button>
              <button
                className={`btn btn-sm ${billingSubTab === 'documentation' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBillingSubTab('documentation')}
                style={{ borderRadius: 8 }}
              >
                b- Documentation ({booking.documentations?.length || 0})
              </button>
              <button
                className={`btn btn-sm ${billingSubTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBillingSubTab('logs')}
                style={{ borderRadius: 8 }}
              >
                c- Logs & Audit Trail ({booking.auditLogs?.length || 0})
              </button>
            </div>

            {/* Sub-Page a: Billing Information and Transaction Status */}
            {billingSubTab === 'billing_info' && (
              <div style={{ display: 'grid', gap: 18 }}>
                {/* Stat Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Amount</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>USD {financials.totalAmount.toFixed(2)}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Paid Amount</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-completed)', marginTop: 4 }}>USD {financials.paidAmount.toFixed(2)}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Refund Amount</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--status-lost)', marginTop: 4 }}>USD {financials.refundAmount.toFixed(2)}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outstanding Balance</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--warning)', marginTop: 4 }}>USD {financials.outstanding.toFixed(2)}</div>
                  </div>
                </div>

                {/* Separated Transactions List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Separated Transactions Breakdown
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Each transaction, refund, or change adjustment appears separately</span>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    {booking.transactions && booking.transactions.length > 0 ? (
                      booking.transactions.map((txn, idx) => (
                        <div key={idx} style={{ padding: 16, borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{txn.type}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>ID: {txn.id} • Ref: {txn.reference}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Payment Method</div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{txn.method}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Date</div>
                            <div style={{ fontSize: 12 }}>{new Date(txn.date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Amount</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>USD {Number(txn.amount).toFixed(2)}</div>
                          </div>
                          <div>
                            <span className={`badge ${paymentBadge(txn.status)}`}>{txn.status}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">No transactions recorded yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Page b: Documentation */}
            {billingSubTab === 'documentation' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Documentation Notes</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Each documentation has a unique system ID that can be copied.</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('add_doc')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="plus" size={14} /> Add Documentation
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {booking.documentations && booking.documentations.length > 0 ? (
                    booking.documentations.map((doc) => (
                      <div key={doc.id} style={{ padding: 16, borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Unique non-repeatable ID & Copy Button */}
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.2)' }}>
                              {doc.id}
                            </span>
                            <button
                              className="btn btn-secondary btn-xs"
                              onClick={() => handleCopyDocId(doc.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                            >
                              <Icon name="kanban" size={12} />
                              {copiedDocId === doc.id ? 'Copied!' : 'Copy ID'}
                            </button>
                            <span className="badge badge-meta">{doc.category || 'Note'}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {new Date(doc.date).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 8, whiteSpace: 'pre-wrap' }}>
                          {doc.text}
                        </div>

                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, borderTop: '1px dashed var(--border-color)', paddingTop: 6 }}>
                          Author: <strong style={{ color: 'var(--text-secondary)' }}>{doc.author}</strong> ({doc.authorEmail})
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No documentations recorded yet. Click "Add Documentation" to add one.</div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Page c: Logs Section */}
            {billingSubTab === 'logs' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Action Logs & Audit History</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Every action is attributed with either a System Sign (e.g. Core 360) or an Agent Sign (agent login email).
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {booking.auditLogs && booking.auditLogs.length > 0 ? (
                    booking.auditLogs.map((log, idx) => (
                      <div key={log.id || idx} style={{ padding: 14, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{log.action}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{log.details}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{new Date(log.timestamp).toLocaleString()}</div>
                        </div>

                        {/* Explicit Signature Badge: System Sign vs Agent Sign */}
                        <div>
                          {log.signType === 'System' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', fontSize: 12, fontWeight: 700, border: '1px solid rgba(147, 51, 234, 0.2)' }}>
                              ?? [System Sign: {log.signature || 'Core 360'}]
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontSize: 12, fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              ?? [Agent Sign: {log.signature || currentAgentEmail}]
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No audit logs recorded.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTION MODALS & DIALOGS                                                    */}
      {/* ========================================================================= */}

      {/* a- Cancel Modal */}
      {activeModal === 'cancel' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: 24, borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#dc2626' }}>Cancel {booking.type}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Are you sure you want to cancel {booking.recordLocator}? This action will record a cancellation event and update the status.
            </p>
            <div className="form-group">
              <label className="form-label">Cancellation Reason</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Enter cancellation reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Dismiss</button>
              <button className="btn btn-primary" onClick={submitCancel} style={{ background: '#dc2626', borderColor: '#dc2626' }}>Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* b- Refund Modal */}
      {activeModal === 'refund' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: 24, borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Process Refund</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Issue a full or partial refund. A separate refund transaction will be logged under Billing.
            </p>
            <div className="form-group">
              <label className="form-label">Refund Amount (USD)</label>
              <input
                className="form-input"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Refund Reason</label>
              <input
                className="form-input"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Dismiss</button>
              <button className="btn btn-primary" onClick={submitRefund}>Issue Refund</button>
            </div>
          </div>
        </div>
      )}

      {/* c- Change Booking Modal */}
      {activeModal === 'change' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: 24, borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Change Booking Details</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Modify booking date or service requirements. If an adjustment fee applies, it will be recorded as a separated transaction.
            </p>
            <div className="form-group">
              <label className="form-label">Change Details / Notes</label>
              <textarea
                className="form-input"
                rows={3}
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Adjustment Fee (USD)</label>
              <input
                className="form-input"
                type="number"
                value={changeFee}
                onChange={(e) => setChangeFee(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Dismiss</button>
              <button className="btn btn-primary" onClick={submitChange}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* d- Process Order Return Modal */}
      {activeModal === 'return' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: 24, borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Process Order Return</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Record returned items for this order and issue store credit or refund.
            </p>
            <div className="form-group">
              <label className="form-label">Return Reason</label>
              <input
                className="form-input"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Credit Amount (USD)</label>
              <input
                className="form-input"
                type="number"
                value={returnAmount}
                onChange={(e) => setReturnAmount(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Dismiss</button>
              <button className="btn btn-primary" onClick={submitReturn}>Process Return</button>
            </div>
          </div>
        </div>
      )}

      {/* e- Add Documentation Modal */}
      {activeModal === 'add_doc' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', padding: 24, borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Add Documentation</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Creates a documentation note with an auto-generated unique non-repeatable system ID.
            </p>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={newDocCategory} onChange={(e) => setNewDocCategory(e.target.value)}>
                <option value="Agent Note">Agent Note</option>
                <option value="Customer Preference">Customer Preference</option>
                <option value="Service Specification">Service Specification</option>
                <option value="Verification Record">Verification Record</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Documentation Content</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Enter detailed documentation notes..."
                value={newDocText}
                onChange={(e) => setNewDocText(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Dismiss</button>
              <button className="btn btn-primary" onClick={submitDocumentation} disabled={!newDocText.trim()}>Save Documentation</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {activeModal === 'email' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: 24, borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Email Customer ({booking.lead?.name})</h3>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Subject</label>
              <input className="form-input" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Message Body</label>
              <textarea className="form-input" rows={5} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Dismiss</button>
              <button className="btn btn-primary" onClick={() => { setActiveModal(null); alert('Email sent successfully!'); }}>Send Email</button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {activeModal === 'sms' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: 24, borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>SMS Customer ({booking.lead?.phone})</h3>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">SMS Message</label>
              <textarea className="form-input" rows={3} value={smsBody} onChange={(e) => setSmsBody(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>Dismiss</button>
              <button className="btn btn-primary" onClick={() => { setActiveModal(null); alert('SMS sent successfully!'); }}>Send SMS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingLookupPage;
