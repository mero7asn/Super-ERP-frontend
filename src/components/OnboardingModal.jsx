import { useState } from 'react';
import API from '../services/api';
import { Icon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

const OPTIONS = [
  {
    id: 'service',
    title: 'I provide a Service',
    icon: 'hand',
    desc: 'Customers book appointments / engagements. You will see the Bookings module.',
    shows: ['Bookings'],
  },
  {
    id: 'product',
    title: 'I sell a Product',
    icon: 'box',
    desc: 'You manage a product catalog inside the CRM and get two extra ERP departments: Super Inventory & Super Supply Chain.',
    shows: ['Products', 'Super Inventory', 'Super Supply Chain'],
  },
  {
    id: 'both',
    title: 'Both Service & Product',
    icon: 'rocket',
    desc: 'Everything: Bookings, Products, Super Inventory & Super Supply Chain.',
    shows: ['Bookings', 'Products', 'Super Inventory', 'Super Supply Chain'],
  },
];

const OnboardingModal = () => {
  const { user, setBusinessModel } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChoose = async (model) => {
    setSaving(true);
    setError('');
    try {
      const { data } = await API.put('/settings/business-model', { businessModel: model });
      setBusinessModel(data.data.businessModel, data.data.onboarded);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save your choice. Please try again.');
      setSaving(false);
    }
  };

  if (!user || user.role !== 'Super CRM Administrator' || user.onboarded) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(8, 11, 20, 0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, maxWidth: 760, width: '100%',
        padding: '36px 36px 32px', boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Welcome, {user.firstName}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '8px 0 6px' }}>
            How does your business operate?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Choose your model to tailor your workspace. You can change this anytime in System Settings.
          </p>
        </div>

        {error && <div className="alert alert-error" style={{ marginTop: 18 }}>{error}</div>}

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 26,
        }}>
          {OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              disabled={saving}
              onClick={() => handleChoose(opt.id)}
              style={{
                textAlign: 'left', cursor: 'pointer', background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)', borderRadius: 12, padding: 20,
                display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color 0.15s, transform 0.15s',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(99,102,241,0.12)', color: 'var(--accent-primary)',
              }}>
                <Icon name={opt.icon} size={22} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{opt.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{opt.desc}</div>
              <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {opt.shows.map(s => (
                  <span key={s} style={{
                    fontSize: 10.5, padding: '3px 8px', borderRadius: 20,
                    background: 'rgba(16,185,129,0.12)', color: '#6EE7B7', fontWeight: 600,
                  }}>{s}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 22, marginBottom: 0 }}>
          This selection controls which modules appear in your sidebar.
        </p>
      </div>
    </div>
  );
};

export default OnboardingModal;
