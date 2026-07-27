import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusBadge = (status) => {
  const map = {
    'Open': 'badge-new', 'In Progress': 'badge-qualified',
    'Resolved': 'badge-converted', 'Closed': 'badge-meta',
    'Canceled': 'badge-lost', 'Paused': 'badge-contacted'
  };
  return map[status] || 'badge-new';
};

const BookingLookupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordLocator, setRecordLocator] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canAccess = ['Sales Agent', 'Sales Manager', 'Customer Support Agent', 'Customer Support Manager', 'CRM Developer', 'CRM Consultant', 'System Architect', 'Super CRM Administrator'].includes(user?.role);

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
      setBooking(p => ({ ...p, status }));
    } catch {
      setError('Failed to update booking status');
    }
  };

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
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="search" size={26} style={{ color: 'var(--accent-primary)' }} />
            Booking Lookup
          </h1>
          <p className="page-subtitle">Search for bookings by record locator to view, modify or cancel</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/leads')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="leads" size={16} /> View Leads
        </button>
      </div>

      <div className="card" style={{ padding: 32, maxWidth: 600 }}>
        <form onSubmit={handleLookup}>
          <div className="form-group">
            <label className="form-label">Record Locator</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="form-input"
                placeholder="Enter booking code (e.g. REC-ABC123)"
                value={recordLocator}
                onChange={e => setRecordLocator(e.target.value.toUpperCase())}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'auto' }}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

        {booking && (
          <div style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 24, display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Booking / Order Details</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Review the booking summary, manage customer-facing actions, and inspect the full history and financial trail.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${statusBadge(booking.status)}`}>{booking.status || 'Pending'}</span>
                <span className="badge badge-meta">{booking.recordLocator || booking.bookingRef || 'REC-000'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Header — booking summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Customer information</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{booking.lead?.name || 'Customer name not listed'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{booking.lead?.email || 'Email not listed'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{booking.lead?.phone || 'Phone not listed'}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Booking information</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}><strong style={{ color: 'var(--text-primary)' }}>Booking / Order:</strong> {booking.recordLocator || booking.bookingRef || 'REC-000'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}><strong style={{ color: 'var(--text-primary)' }}>Date:</strong> {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'Not available'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}><strong style={{ color: 'var(--text-primary)' }}>Status:</strong> {booking.status || 'Pending'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Amount:</strong> {booking.price ? `$${Number(booking.price).toLocaleString()}` : 'Not available'} {booking.currency || 'USD'}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', background: 'rgba(99,102,241,0.04)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Body — customer actions and employee documentation</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Customer actions</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm">Confirm details</button>
                      <button className="btn btn-secondary btn-sm">Request change</button>
                      <button className="btn btn-secondary btn-sm">Cancel booking</button>
                      <button className="btn btn-secondary btn-sm">Request refund</button>
                      <button className="btn btn-secondary btn-sm">Start return</button>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{booking.description || 'Booking details and customer instructions will appear here.'}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Internal employee documentation</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Employees can leave private notes, call summaries, observations, and attachments here. These entries should carry the employee name, email, position, department, and timestamps.</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', background: 'rgba(16,185,129,0.04)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Footer — payments, documentation history, and audit log</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Payment information</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Payment method: Card ending in 4242 • Status: Pending / Completed • Invoice actions and refund status will appear here.</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Employee documentation history</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All internal documentation entries will be shown here with date, time, employee name, email, position, and department.</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Booking activity log</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Every action taken on this booking will be recorded in the audit trail with the employee name, email, role, and timestamp.</div>
                  </div>
                </div>
              </div>
            </div>

            {(user.role === 'Customer Support Agent' || user.role === 'Customer Support Manager' ||
              user.role === 'CRM Developer' || user.role === 'CRM Consultant' ||
              user.role === 'System Architect' || user.role === 'Super CRM Administrator') && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {booking.status !== 'Canceled' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange('Canceled')}>
                    Cancel Booking
                  </button>
                )}
                {booking.status !== 'Refunded' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange('Refunded')}>
                    Process Refund
                  </button>
                )}
                {booking.status !== 'Completed' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange('Completed')}>
                    Mark Complete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingLookupPage;