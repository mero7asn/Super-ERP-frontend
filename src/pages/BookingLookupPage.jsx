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
    Returned: 'badge-qualified'
  };
  return map[status] || 'badge-new';
};

const paymentBadge = (status) => {
  const map = {
    Paid: 'badge-converted',
    Pending: 'badge-contacted',
    Failed: 'badge-lost',
    Refunded: 'badge-meta',
    'Partially Refunded': 'badge-qualified'
  };
  return map[status] || 'badge-new';
};

const tabs = ['Overview', 'Offers', 'Payments', 'Communication', 'Documents', 'Timeline', 'Audit Log', 'Internal Notes'];

const BookingLookupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordLocator, setRecordLocator] = useState('');
  const [searchType, setSearchType] = useState('recordLocator');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const currentRole = user?.role || 'Sales Agent';
  const canAccess = ['Sales Agent', 'Sales Manager', 'Customer Support Agent', 'Customer Support Manager', 'CRM Developer', 'CRM Consultant', 'System Architect', 'Super CRM Administrator'].includes(currentRole);
  const canRefund = ['Finance Manager', 'Finance Analyst', 'Super CRM Administrator', 'CRM Developer', 'CRM Consultant', 'System Architect'].includes(currentRole);
  const canCancel = ['Sales Manager', 'Customer Support Manager', 'Super CRM Administrator', 'CRM Developer', 'CRM Consultant', 'System Architect'].includes(currentRole);
  const canDelete = ['Super CRM Administrator', 'CRM Developer', 'System Architect'].includes(currentRole);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!recordLocator) return;
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const res = await API.get(`/offers/locator/${recordLocator}`);
      setBooking(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!booking || !confirm(`Change booking status to ${status}?`)) return;
    try {
      await API.put(`/offers/${booking._id}`, { status });
      setBooking((prev) => ({ ...prev, status }));
    } catch {
      setError('Failed to update booking status');
    }
  };

  const quickAction = (label) => {
    if (label === 'Refund' && !canRefund) {
      setError('Only finance roles can process refunds.');
      return;
    }
    if (label === 'Cancel Booking' && !canCancel) {
      setError('Only managers or admins can cancel completed bookings.');
      return;
    }
    if (label === 'Delete Booking' && !canDelete) {
      setError('Only administrators can permanently delete a booking.');
      return;
    }
    setError(`${label} action is ready for implementation.`);
  };

  const bookingId = booking?.recordLocator || booking?.bookingRef || booking?._id || '—';
  const bookingAmount = Number(booking?.price || booking?.amount || 0);
  const currency = booking?.currency || 'USD';
  const paymentStatus = booking?.paymentStatus || 'Pending';
  const customerName = booking?.lead?.name || 'Customer name not listed';
  const customerEmail = booking?.lead?.email || 'Email not listed';
  const customerPhone = booking?.lead?.phone || 'Phone not listed';
  const bookingStatus = booking?.status || 'Pending';

  const offers = Array.isArray(booking?.offers) && booking.offers.length > 0
    ? booking.offers
    : [{ title: 'Primary offer', status: bookingStatus, total: bookingAmount, createdAt: booking?.createdAt, description: booking?.description || 'Offer details will appear here once linked to this booking.' }];

  const payments = Array.isArray(booking?.payments) && booking.payments.length > 0
    ? booking.payments
    : [{ id: 'PAY-001', amount: bookingAmount, method: 'Card', status: paymentStatus, date: booking?.createdAt || new Date().toISOString() }];

  const communications = Array.isArray(booking?.communications) && booking.communications.length > 0
    ? booking.communications
    : [{ type: 'Email', detail: 'Customer confirmation email prepared', employee: currentRole, date: booking?.createdAt || new Date().toISOString() }];

  const documents = Array.isArray(booking?.documents) && booking.documents.length > 0
    ? booking.documents
    : [{ name: 'Booking confirmation.pdf', type: 'Invoice', date: booking?.createdAt || new Date().toISOString() }];

  const timeline = Array.isArray(booking?.timeline) && booking.timeline.length > 0
    ? booking.timeline
    : [
        { title: 'Booking created', date: booking?.createdAt || new Date().toISOString(), description: 'A new booking was opened and indexed.' },
        { title: 'Offer sent', date: booking?.createdAt || new Date().toISOString(), description: 'The offer package was prepared for the customer.' }
      ];

  const notes = Array.isArray(booking?.notes) && booking.notes.length > 0
    ? booking.notes
    : [{ title: 'Internal follow-up', note: 'Customer requested a revision to the booking details.', employee: currentRole, date: booking?.createdAt || new Date().toISOString() }];

  const auditLog = Array.isArray(booking?.auditLog) && booking.auditLog.length > 0
    ? booking.auditLog
    : [{ action: 'Booking viewed', employee: currentRole, role: currentRole, timestamp: booking?.createdAt || new Date().toISOString() }];

  const renderSectionCard = (title, subtitle, children, accent = 'var(--accent-primary)') => (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, background: 'var(--bg-card)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );

  const renderStatCard = (label, value, icon, accent) => (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 14, padding: 14, background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>{label}</div>
        <div style={{ color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: `${accent}12` }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );

  if (!canAccess) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Access Denied</h1>
        </div>
        <div className="alert alert-error">You do not have permission to access booking lookup.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="search" size={26} style={{ color: 'var(--accent-primary)' }} />
            Find Booking
          </h1>
          <p className="page-subtitle">Manage bookings like a modern CRM workspace with customer, financial, communication, and audit data in one place.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/leads')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="leads" size={16} /> View Leads
        </button>
      </div>

      <div className="card" style={{ padding: 24, borderRadius: 20, boxShadow: '0 20px 45px rgba(15, 23, 42, 0.06)' }}>
        <div style={{ padding: 18, borderRadius: 16, background: 'linear-gradient(135deg, rgba(59,130,246,0.10), rgba(14,165,233,0.05))', border: '1px solid rgba(59,130,246,0.12)', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Search booking workspace</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>Find a booking by reference, customer, or order information</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-qualified">Live CRM view</span>
              <span className="badge badge-meta">Role aware</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleLookup} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.6fr auto', gap: 10, alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Search by</label>
              <select className="form-input" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="recordLocator">Booking number / record locator</option>
                <option value="orderNumber">Order number</option>
                <option value="customerName">Customer name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Search term</label>
              <input className="form-input" placeholder="Enter booking code or customer name" value={recordLocator} onChange={(e) => setRecordLocator(e.target.value.toUpperCase())} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 130 }}>
              {loading ? 'Searching...' : 'Search booking'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Booking status</label>
              <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Payment status</label>
              <select className="form-input" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="">All payments</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Assigned employee</label>
              <select className="form-input">
                <option value="">Any employee</option>
                <option value="me">Me</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Department</label>
              <select className="form-input">
                <option value="">Any department</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
                <option value="support">Customer Support</option>
              </select>
            </div>
          </div>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="card" style={{ padding: 18, borderRadius: 18 }}>
              <div style={{ height: 18, width: '40%', background: 'var(--bg-primary)', borderRadius: 999, marginBottom: 10 }} />
              <div style={{ height: 12, width: '70%', background: 'var(--bg-primary)', borderRadius: 999, marginBottom: 8 }} />
              <div style={{ height: 12, width: '55%', background: 'var(--bg-primary)', borderRadius: 999 }} />
            </div>
          ))}
        </div>
      ) : booking ? (
        <div style={{ display: 'grid', gap: 18, marginTop: 20 }}>
          <div className="card" style={{ padding: 20, borderRadius: 20, boxShadow: '0 20px 45px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{bookingId}</h2>
                  <span className={`badge ${statusBadge(bookingStatus)}`}>{bookingStatus}</span>
                  <span className={`badge ${paymentBadge(paymentStatus)}`}>{paymentStatus}</span>
                  <span className="badge badge-meta">{booking?.priority || 'Normal'}</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                  {customerName} • {customerEmail} • {customerPhone}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Email Customer')}><Icon name="phone" size={14} style={{ marginRight: 6 }} />Email</button>
                <button className="btn btn-secondary btn-sm" onClick={() => quickAction('SMS Customer')}><Icon name="phone" size={14} style={{ marginRight: 6 }} />SMS</button>
                <button className="btn btn-primary btn-sm" onClick={() => quickAction('Create Offer')}><Icon name="plus" size={14} style={{ marginRight: 6 }} />Create offer</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
              {renderStatCard('Booking amount', `${currency} ${bookingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, <Icon name="wallet" size={16} />, 'var(--accent-primary)')}
              {renderStatCard('Refund amount', `${currency} 0.00`, <Icon name="cash" size={16} />, 'var(--status-lost)')}
              {renderStatCard('Paid amount', `${currency} 0.00`, <Icon name="check" size={16} />, 'var(--status-completed)')}
              {renderStatCard('Outstanding', `${currency} ${bookingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, <Icon name="alert" size={16} />, 'var(--warning)')}
              {renderStatCard('Offers', offers.length, <Icon name="box" size={16} />, 'var(--accent-primary)')}
              {renderStatCard('Activities', timeline.length, <Icon name="analytics" size={16} />, 'var(--status-completed)')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.9fr', gap: 18, alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px', borderRadius: 999, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                {tabs.map((tab) => (
                  <button key={tab} className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(tab)} style={{ whiteSpace: 'nowrap' }}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'Overview' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {renderSectionCard('Booking summary', 'Core booking data and customer context', (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8 }}>Customer overview</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{customerName}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{customerEmail}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{customerPhone}</div>
                      </div>
                      <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8 }}>Booking overview</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Reference:</strong> {bookingId}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}><strong style={{ color: 'var(--text-primary)' }}>Channel:</strong> {booking?.channel || 'Website'}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}><strong style={{ color: 'var(--text-primary)' }}>Created:</strong> {booking?.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Today'}</div>
                      </div>
                      <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8 }}>Financial summary</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Subtotal:</strong> {currency} {bookingAmount.toLocaleString()}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}><strong style={{ color: 'var(--text-primary)' }}>Discount:</strong> {currency} 0.00</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}><strong style={{ color: 'var(--text-primary)' }}>Grand total:</strong> {currency} {bookingAmount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}

                  {renderSectionCard('Latest activity', 'Recent actions from sales, finance, and support', (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {timeline.slice(0, 3).map((event, idx) => (
                        <div key={idx} style={{ padding: 12, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{event.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{event.description}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{event.date ? new Date(event.date).toLocaleString() : 'Recent activity'}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Offers' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {offers.map((offer, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, background: 'var(--bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{offer.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{offer.description}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className={`badge ${statusBadge(offer.status || bookingStatus)}`}>{offer.status || bookingStatus}</span>
                          <span className="badge badge-meta">{currency} {Number(offer.total || bookingAmount).toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 12 }}>
                        <div style={{ padding: 10, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created by</div><div style={{ fontSize: 13, fontWeight: 600 }}>{currentRole}</div></div>
                        <div style={{ padding: 10, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created</div><div style={{ fontSize: 13, fontWeight: 600 }}>{offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : 'Today'}</div></div>
                        <div style={{ padding: 10, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Items</div><div style={{ fontSize: 13, fontWeight: 600 }}>1 item</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Payments' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {payments.map((payment, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, background: 'var(--bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{payment.id || `Payment ${idx + 1}`}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{payment.method || 'Card'} • {payment.status || paymentStatus}</div>
                        </div>
                        <span className={`badge ${paymentBadge(payment.status || paymentStatus)}`}>{payment.status || paymentStatus}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)', marginTop: 10 }}>{currency} {Number(payment.amount || bookingAmount).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Communication' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {communications.map((item, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, background: 'var(--bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.type || 'Communication'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.date ? new Date(item.date).toLocaleDateString() : 'Today'}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{item.detail || 'Conversation channel tracked for this booking.'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{item.employee || currentRole} • {item.department || 'Operations'}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Documents' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {documents.map((doc, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, background: 'var(--bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{doc.name}</div>
                        <span className="badge badge-meta">{doc.type || 'Document'}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{doc.date ? new Date(doc.date).toLocaleDateString() : 'Uploaded recently'}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Timeline' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {timeline.map((event, idx) => (
                    <div key={idx} style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: 12, marginLeft: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{event.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{event.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{event.date ? new Date(event.date).toLocaleString() : 'Recent'}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Audit Log' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {auditLog.map((entry, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, background: 'var(--bg-card)' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{entry.action}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{entry.employee || currentRole} • {entry.role || currentRole}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Audit record'}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Internal Notes' && (
                <div style={{ display: 'grid', gap: 14 }}>
                  {notes.map((note, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, background: 'var(--bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{note.title}</div>
                        <span className="badge badge-meta">Private</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{note.note || 'Internal follow-up recorded for this booking.'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{note.employee || currentRole} • {note.date ? new Date(note.date).toLocaleDateString() : 'Today'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div className="card" style={{ padding: 16, borderRadius: 18, position: 'sticky', top: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Booking status</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ padding: 10, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current status</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{bookingStatus}</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Payment status</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{paymentStatus}</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assigned</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{currentRole}</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Next action</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>Confirm booking</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 16, borderRadius: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick links</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Send Invoice')}>Send invoice</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Generate PDF')}>Generate PDF</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Open related ticket')}>Open related ticket</button>
                  {canRefund ? <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Refund')}>Refund booking</button> : null}
                  {canDelete ? <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Delete Booking')}>Delete booking</button> : null}
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', bottom: 12, zIndex: 20, paddingTop: 4 }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 12, background: 'rgba(255,255,255,0.96)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Booking workspace actions</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Confirm Booking')}>Confirm booking</button>
                {canCancel ? <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Cancel Booking')}>Cancel booking</button> : null}
                <button className="btn btn-secondary btn-sm" onClick={() => quickAction('Reschedule')}>Reschedule</button>
                {canRefund ? <button className="btn btn-primary btn-sm" onClick={() => quickAction('Refund')}>Refund</button> : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <div className="empty-state-icon">🔎</div>
          <p>Search for a booking to open the enterprise booking workspace.</p>
        </div>
      )}
    </div>
  );
};

export default BookingLookupPage;