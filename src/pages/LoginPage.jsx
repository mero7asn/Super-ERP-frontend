import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell fade-in">
        <div className="auth-hero">
          <div className="auth-hero-badge">Enterprise AI Workspace</div>
          <h1>Run your entire business from one intelligent command center.</h1>
          <p>CRM, inventory, HRM, support, and approvals all stay connected so your teams move faster.</p>
          <div className="auth-feature-list">
            <div className="auth-feature">✓ Unified customer and deal visibility</div>
            <div className="auth-feature">✓ Smart inventory and fulfillment insights</div>
            <div className="auth-feature">✓ Secure approvals across every department</div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-brand">
            <div className="auth-logo-icon">
              <img src={logo} alt="Core 360" style={{ height: 24, width: 24, objectFit: 'contain' }} />
            </div>
            <span className="auth-logo-text">Core 360</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your workspace</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="auth-input-group">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="auth-input-group">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">Powered by Super ERP</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
