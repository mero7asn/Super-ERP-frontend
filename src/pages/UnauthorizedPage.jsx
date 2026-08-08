import { Icon } from '../components/Icons';

const UnauthorizedPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: 24 }}>
    <div style={{ marginBottom: 24, padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, rgba(2,132,199,0.12), rgba(124,58,237,0.12))', color: 'var(--accent-danger)', boxShadow: '0 16px 35px rgba(15, 23, 42, 0.08)' }}>
      <Icon name="lock" size={64} />
    </div>
    <h1 style={{ fontSize: '28px', marginBottom: '12px', fontWeight: 800 }}>Access Restricted</h1>
    <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '15px', lineHeight: 1.7 }}>
      You don't have permission to view this page. Please contact your administrator if you believe this is a mistake.
    </p>
    <button className="btn btn-primary" onClick={() => window.history.back()} style={{ marginTop: 18 }}>
      Go to Dashboard
    </button>
  </div>
);

export default UnauthorizedPage;
