import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '../components/Icons';

const PUBLIC_API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

const PAYMENT_METHODS = [
  { id: 'Card', label: 'Credit / Debit Card', icon: 'card' },
  { id: 'BankTransfer', label: 'Bank Transfer', icon: 'bank' },
  { id: 'Fawry', label: 'Fawry', icon: 'wallet' },
  { id: 'PayMob', label: 'PayMob', icon: 'wallet' },
  { id: 'InstaPay', label: 'InstaPay', icon: 'wallet' },
  { id: 'Cash', label: 'Cash on Delivery', icon: 'cash' },
];

const PaymentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [method, setMethod] = useState('Card');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await PUBLIC_API.get(`/public/pay/${token}`);
        if (res.data.alreadyPaid) {
          setAlreadyPaid(true);
          setOffer(res.data.data);
        } else {
          setOffer(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'This payment link is invalid.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [token]);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    try {
      const res = await PUBLIC_API.post(`/public/pay/${token}`, { method });
      setResult(res.data.data);
    } catch (err) {
      const data = err.response?.data;
      if (data?.alreadyPaid) {
        setAlreadyPaid(true);
        setOffer(prev => ({ ...prev, bookingRef: data.data?.bookingRef }));
      } else {
        setError(data?.message || 'Payment failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 20 }}>
        <div style={{ maxWidth: 440, width: '100%', background: 'var(--bg-card)', borderRadius: 12, padding: 40, textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Payment Unavailable</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const isPaid = alreadyPaid || result;

  const brandName = offer?.companyName || 'Super CRM';
  const brandLogo = offer?.companyLogo || '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 16px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderRadius: 24, background: 'rgba(255,255,255,0.92)', boxShadow: '0 20px 50px rgba(15,23,42,0.08)' }}>
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 12, background: '#fff', border: '1px solid rgba(148,163,184,0.2)' }}
              />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2ff', color: '#4338ca', fontWeight: 700, fontSize: 18 }}>
                {brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{brandName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Secure payment portal</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {/* Offer Summary */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {offer.leadName ? `Offer for ${offer.leadName}` : 'Your Offer'}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 12px' }}>{offer.title}</h1>
            {offer.description && (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
                {offer.description}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total due</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-primary)' }}>
                ${Number(offer.price).toLocaleString()}
              </span>
            </div>
            {offer.validUntil && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Valid until {new Date(offer.validUntil).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Success state */}
          {isPaid ? (
            <div style={{ padding: '32px 28px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(16,185,129,0.12)', color: '#6EE7B7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
              }}>
                ✓
              </div>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>Payment Confirmed</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Your booking has been created successfully.
              </p>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Booking Reference
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-primary)', marginTop: 4 }}>
                  {result?.bookingRef || offer.bookingRef}
                </div>
              </div>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/')}>
                Done
              </button>
            </div>
          ) : (
            /* Payment form */
            <form onSubmit={handlePay} style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Choose a payment method
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {PAYMENT_METHODS.map(m => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                      background: method === m.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-primary)',
                      border: `1px solid ${method === m.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, textAlign: 'left'
                    }}
                  >
                    <Icon name={m.icon} size={18} style={{ color: 'var(--accent-primary)' }} />
                    {m.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
              )}

              <button type="submit" className="btn btn-primary" disabled={processing} style={{ width: '100%', padding: '14px', fontSize: 15 }}>
                {processing ? 'Processing…' : `Pay $${Number(offer.price).toLocaleString()}`}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                <Icon name="lock" size={14} />
                Payments are processed securely
              </div>
            </form>
          )}
        </div>

        {offer.agentName && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
            Prepared by {offer.agentName}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
