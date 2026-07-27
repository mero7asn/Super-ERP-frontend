import { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const PROVIDER_PRESETS = {
  gmail: { label: 'Gmail / Google Workspace', host: 'smtp.gmail.com', port: 587, secure: false },
  outlook: { label: 'Outlook / Microsoft 365', host: 'smtp.office365.com', port: 587, secure: false },
  custom: { label: 'Custom / Other', host: '', port: 587, secure: false },
};

const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 48.5 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rate: 3.75 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', rate: 0.31 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', rate: 3.64 },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', rate: 0.38 },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', rate: 0.38 },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', rate: 0.71 },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£', rate: 89500 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.36 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.53 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.5 },
];

const SettingsPage = () => {
  const { user, setBusinessModel } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // Business model (service | product | both)
  const [businessModel, setBm] = useState(user?.businessModel || 'service');
  const [savingBm, setSavingBm] = useState(false);

  // ERP integration base URL (external departments: Inventory, Supply Chain)
  const [erpBaseUrl, setErpBaseUrl] = useState('');
  const [savingErp, setSavingErp] = useState(false);

  // General settings
  const [appName, setAppName] = useState('Super CRM');
  const [companyName, setCompanyName] = useState('Super Enterprise Inc.');
  const [companyLogo, setCompanyLogo] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security settings
  const [sessionTimeout, setSessionTimeout] = useState('30d');
  const [twoFactor, setTwoFactor] = useState(true);

  // Notification settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Global SMTP settings
  const [smtpProvider, setSmtpProvider] = useState('custom');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  // Pricing & Currency settings
  const [pricingSettings, setPricingSettings] = useState({ offerPriceMin: '', productPriceMin: '', discountOverride: false });
  const [currencies, setCurrencies] = useState([]);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [newCurrency, setNewCurrency] = useState({ code: '', name: '', symbol: '', rate: '' });
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingCurrencies, setSavingCurrencies] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get('/settings/email');
        if (data.success && data.data) {
          const cfg = data.data;
          setSmtpHost(cfg.smtpHost || '');
          setSmtpPort(cfg.smtpPort || 587);
          setSmtpSecure(cfg.smtpSecure || false);
          setSmtpUser(cfg.smtpUser || '');
          setSmtpPass('');
          const presetKey = Object.entries(PROVIDER_PRESETS).find(([, p]) => p.host === cfg.smtpHost && p.port === cfg.smtpPort);
          setSmtpProvider(presetKey ? presetKey[0] : 'custom');
        }
      } catch (err) {
        console.error('Failed to load email settings:', err);
      }
    };
    const fetchBranding = async () => {
      try {
        const { data } = await API.get('/settings/branding');
        if (data.success && data.data) {
          setCompanyName(data.data.companyName || 'Super CRM');
          setCompanyLogo(data.data.companyLogo || '');
        }
      } catch (err) {
        console.error('Failed to load branding config:', err);
      }
    };
    fetchSettings();
    fetchBranding();

    const fetchBusinessModel = async () => {
      try {
        const { data } = await API.get('/settings/business-model');
        if (data.success && data.data?.businessModel) setBm(data.data.businessModel);
      } catch (err) {
        console.error('Failed to load business model:', err);
      }
    };
    fetchBusinessModel();

    const fetchErp = async () => {
      try {
        const { data } = await API.get('/settings/erp');
        if (data.success && data.data?.baseUrl) setErpBaseUrl(data.data.baseUrl);
      } catch (err) {
        console.error('Failed to load ERP config:', err);
      }
    };
    fetchErp();

    const fetchPricing = async () => {
      try {
        const { data } = await API.get('/settings/pricing');
        if (data.success && data.data) {
          setPricingSettings({
            offerPriceMin: data.data.offerPriceMin ?? data.data.minOfferPrice ?? '',
            productPriceMin: data.data.productPriceMin ?? data.data.minProductPrice ?? '',
            discountOverride: data.data.discountOverride ?? data.data.allowDiscountOverride ?? false
          });
        }
      } catch (err) {
        console.error('Failed to load pricing settings:', err);
      }
    };
    const fetchCurrencies = async () => {
      try {
        const { data } = await API.get('/settings/currencies');
        if (data.success && data.data) {
          setCurrencies(data.data.currencies || []);
          setDefaultCurrency(data.data.defaultCurrency || 'USD');
        }
      } catch (err) {
        console.error('Failed to load currencies:', err);
      }
    };
    fetchPricing();
    fetchCurrencies();
  }, []);

  const handleProviderChange = (key) => {
    setSmtpProvider(key);
    const preset = PROVIDER_PRESETS[key];
    if (preset) {
      setSmtpHost(preset.host);
      setSmtpPort(preset.port);
      setSmtpSecure(preset.secure);
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        companyName: companyName.trim() || 'Super CRM',
        companyLogo: companyLogo.trim() || ''
      };
      const { data } = await API.put('/settings/branding', payload);
      if (data.success) {
        setSuccessMsg('Branding settings updated successfully.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save branding settings');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        smtpHost: smtpHost || null,
        smtpPort,
        smtpSecure,
        smtpUser: smtpUser || null,
        ...(smtpPass ? { smtpPass } : {}),
      };
      const { data } = await API.put('/settings/email', payload);
      if (data.success) {
        setSuccessMsg('Global SMTP settings saved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data } = await API.post('/settings/email/test');
      if (data.success) {
        setSuccessMsg(data.message || 'Connection verified successfully');
      } else {
        setErrorMsg(data.message || 'Connection failed');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Test connection failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon name="settings" size={26} style={{ color: 'var(--accent-primary)' }} />
          System Settings
        </h1>
        <p className="page-subtitle">Configure application settings, security rules, integrations, and alerts</p>
      </div>

      {(successMsg || errorMsg) && (
        <>
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        </>
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 0 200px', display: 'flex', flexDirection: 'column', gap: 4, padding: 16, height: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('general')}
            className="sidebar-link"
            style={{
              background: activeTab === 'general' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: activeTab === 'general' ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: activeTab === 'general' ? 600 : 500,
              padding: '10px 16px',
            }}
          >
            General Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className="sidebar-link"
            style={{
              background: activeTab === 'security' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: activeTab === 'security' ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: activeTab === 'security' ? 600 : 500,
              padding: '10px 16px',
            }}
          >
            Security & Auth
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className="sidebar-link"
            style={{
              background: activeTab === 'integrations' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: activeTab === 'integrations' ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: activeTab === 'integrations' ? 600 : 500,
              padding: '10px 16px',
            }}
          >
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className="sidebar-link"
            style={{
              background: activeTab === 'notifications' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: activeTab === 'notifications' ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: activeTab === 'notifications' ? 600 : 500,
              padding: '10px 16px',
            }}
          >
            Alerts & Webhooks
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className="sidebar-link"
            style={{
              background: activeTab === 'business' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
              color: activeTab === 'business' ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: activeTab === 'business' ? 600 : 500,
              padding: '10px 16px',
            }}
          >
            Business Model
          </button>
          {user?.role === 'Super CRM Administrator' && (
            <button
              onClick={() => setActiveTab('pricing')}
              className="sidebar-link"
              style={{
                background: activeTab === 'pricing' ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                color: activeTab === 'pricing' ? 'var(--accent-primary)' : 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: activeTab === 'pricing' ? 600 : 500,
                padding: '10px 16px',
              }}
            >
              Pricing & Currency
            </button>
          )}
        </div>

        <div className="card" style={{ flex: '3 0 450px', padding: 32 }}>
          <form onSubmit={activeTab === 'integrations' ? handleSaveEmail : handleSaveGeneral}>
            {activeTab === 'general' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="globe" size={18} style={{ color: 'var(--accent-primary)' }} />
                  General System Configurations
                </h3>

                <div className="form-group">
                  <label className="form-label">Application Name</label>
                  <input
                    className="form-input"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    className="form-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Logo URL</label>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                  />
                  {companyLogo && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={companyLogo} alt="Company logo preview" style={{ height: 40, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border-color)' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Logo preview</span>
                    </div>
                  )}
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '8px 16px', fontSize: 13 }}>
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('logo', file);
                          try {
                            setLoading(true);
                            const { data } = await API.post('/settings/branding/logo', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            if (data.success) {
                              setCompanyLogo(data.data?.companyLogo || companyLogo);
                              setSuccessMsg('Logo uploaded successfully.');
                              setTimeout(() => setSuccessMsg(''), 4000);
                            }
                          } catch (err) {
                            setErrorMsg(err.response?.data?.message || 'Failed to upload logo');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, SVG up to 2MB</span>
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                  <input
                    type="checkbox"
                    id="maintenance"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="maintenance" style={{ fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                    Enable Maintenance Mode (Restricts access to Administrators)
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="lock" size={18} style={{ color: 'var(--accent-primary)' }} />
                  Security Policy & Authentication
                </h3>

                <div className="form-group">
                  <label className="form-label">JWT Token Expiry</label>
                  <select
                    className="form-input"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="1d">1 Day</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days (Default)</option>
                    <option value="90d">90 Days</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                  <input
                    type="checkbox"
                    id="twofactor"
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="twofactor" style={{ fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                    Enforce Multi-Factor Authentication (MFA) for all Managers
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="plug" size={18} style={{ color: 'var(--accent-primary)' }} />
                  Global SMTP Relay (Fallback for all users)
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Configure a global SMTP relay. Users without personal SMTP settings will send emails through this relay. The sender name remains the user's name, but the From address is the relay mailbox.
                </p>

                <div className="form-group">
                  <label className="form-label">Provider Preset</label>
                  <select
                    className="form-input"
                    value={smtpProvider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                      <option key={key} value={key}>{preset.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">SMTP Host</label>
                    <input
                      className="form-input"
                      placeholder="smtp.gmail.com"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">SMTP Port</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="587"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value) || 587)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">SMTP Username / Email</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="relay@yourdomain.com"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">SMTP Password / App Password</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="••••••••"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="checkbox"
                      id="smtpSecure"
                      checked={smtpSecure}
                      onChange={(e) => setSmtpSecure(e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label htmlFor="smtpSecure" style={{ fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                      Use SSL/TLS (port 465). Uncheck for STARTTLS (port 587).
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'auto', padding: '10px 32px' }}>
                    {loading ? 'Saving…' : 'Save SMTP Settings'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleTestConnection} disabled={testing || !smtpHost} style={{ width: 'auto', padding: '10px 32px' }}>
                    {testing ? 'Testing…' : 'Test Connection'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="megaphone" size={18} style={{ color: 'var(--accent-primary)' }} />
                  Automated Alerts & Webhook Integrations
                </h3>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <input
                    type="checkbox"
                    id="emailAlerts"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="emailAlerts" style={{ fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                    Enable Email Alerts for high-priority technical issues
                  </label>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <input
                    type="checkbox"
                    id="slackAlerts"
                    checked={slackAlerts}
                    onChange={(e) => setSlackAlerts(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="slackAlerts" style={{ fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                    Post webhook updates to Slack on lead conversions
                  </label>
                </div>

                {slackAlerts && (
                  <div className="form-group">
                    <label className="form-label">Slack Webhook URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'business' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="rocket" size={18} style={{ color: 'var(--accent-primary)' }} />
                  Business Model
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Controls which modules appear in your workspace. Changing this updates the sidebar immediately.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { id: 'service', title: 'Service', desc: 'Bookings module only.' },
                    { id: 'product', title: 'Product', desc: 'Products module + Super Inventory & Super Supply Chain.' },
                    { id: 'both', title: 'Both Service & Product', desc: 'Everything: Bookings, Products, Inventory & Supply Chain.' },
                  ].map(opt => (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                        border: `1px solid ${businessModel === opt.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        borderRadius: 10, cursor: 'pointer',
                        background: businessModel === opt.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name="businessModel"
                        checked={businessModel === opt.id}
                        onChange={() => setBm(opt.id)}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={savingBm || businessModel === (user?.businessModel || 'service')}
                    onClick={async () => {
                      setSavingBm(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                      try {
                        const { data } = await API.put('/settings/business-model', { businessModel });
                        setBusinessModel(data.data.businessModel, data.data.onboarded);
                        setSuccessMsg('Business model updated. Sidebar refreshed.');
                        setTimeout(() => setSuccessMsg(''), 4000);
                      } catch (err) {
                        setErrorMsg(err.response?.data?.message || 'Failed to update business model');
                      } finally {
                        setSavingBm(false);
                      }
                    }}
                    style={{ width: 'auto', padding: '10px 32px' }}
                  >
                    {savingBm ? 'Saving…' : 'Save Business Model'}
                  </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '28px 0' }} />

                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="plug" size={18} style={{ color: 'var(--accent-primary)' }} />
                  ERP Integration
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Base URL of the external Super ERP (Inventory &amp; Supply Chain apps). When set, the sidebar opens them in a new tab.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">ERP Base URL</label>
                    <input
                      className="form-input"
                      type="url"
                      placeholder="https://erp.yourcompany.com"
                      value={erpBaseUrl}
                      onChange={(e) => setErpBaseUrl(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={savingErp}
                    onClick={async () => {
                      setSavingErp(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                      try {
                        await API.put('/settings/erp', { baseUrl: erpBaseUrl });
                        setSuccessMsg('ERP integration settings saved.');
                        setTimeout(() => setSuccessMsg(''), 4000);
                      } catch (err) {
                        setErrorMsg(err.response?.data?.message || 'Failed to save ERP settings');
                      } finally {
                        setSavingErp(false);
                      }
                    }}
                    style={{ width: 'auto', padding: '10px 28px' }}
                  >
                    {savingErp ? 'Saving…' : 'Save ERP URL'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && user?.role === 'Super CRM Administrator' && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="dollar" size={18} style={{ color: 'var(--accent-primary)' }} />
                  Pricing & Currency Settings
                </h3>

                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Minimum Prices</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Minimum Offer Price ($)</label>
                      <input
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={pricingSettings.offerPriceMin}
                        onChange={(e) => setPricingSettings(p => ({ ...p, offerPriceMin: e.target.value }))}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Minimum Product Price ($)</label>
                      <input
                        className="form-input"
                        type="number"
                        step="0.01"
                        value={pricingSettings.productPriceMin}
                        onChange={(e) => setPricingSettings(p => ({ ...p, productPriceMin: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="checkbox"
                      id="allowDiscountOverride"
                      checked={pricingSettings.discountOverride}
                      onChange={(e) => setPricingSettings(p => ({ ...p, discountOverride: e.target.checked }))}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label htmlFor="allowDiscountOverride" style={{ fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                      Allow supervisors to apply discounts below minimum price
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 20, marginBottom: 32 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={savingPricing}
                    onClick={async () => {
                      setSavingPricing(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                      try {
                        await API.put('/settings/pricing', {
                          offerPriceMin: pricingSettings.offerPriceMin,
                          productPriceMin: pricingSettings.productPriceMin,
                          discountOverride: pricingSettings.discountOverride,
                        });
                        setSuccessMsg('Pricing settings saved successfully.');
                        setTimeout(() => setSuccessMsg(''), 4000);
                      } catch (err) {
                        setErrorMsg(err.response?.data?.message || 'Failed to save pricing settings');
                      } finally {
                        setSavingPricing(false);
                      }
                    }}
                    style={{ width: 'auto', padding: '10px 32px' }}
                  >
                    {savingPricing ? 'Saving…' : 'Save Pricing Settings'}
                  </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '28px 0' }} />

                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Currencies</h4>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <select
                      className="form-input"
                      value={newCurrency.code}
                      onChange={(e) => {
                        const selected = COMMON_CURRENCIES.find(c => c.code === e.target.value);
                        if (selected) {
                          setNewCurrency({ code: selected.code, name: selected.name, symbol: selected.symbol, rate: String(selected.rate) });
                        } else {
                          setNewCurrency({ code: '', name: '', symbol: '', rate: '' });
                        }
                      }}
                      style={{ width: 180 }}
                    >
                      <option value="">Select currency...</option>
                      {COMMON_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                    <input
                      className="form-input"
                      placeholder="Symbol (e.g. $)"
                      value={newCurrency.symbol}
                      onChange={(e) => setNewCurrency(p => ({ ...p, symbol: e.target.value }))}
                      style={{ width: 100 }}
                    />
                    <input
                      className="form-input"
                      type="number"
                      step="0.0001"
                      placeholder="Rate"
                      value={newCurrency.rate}
                      onChange={(e) => setNewCurrency(p => ({ ...p, rate: e.target.value }))}
                      style={{ width: 100 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={async () => {
                        if (!newCurrency.code || !newCurrency.name) return;
                        setSavingCurrencies(true);
                        setErrorMsg('');
                        setSuccessMsg('');
                        try {
                          const updated = [...currencies, { code: newCurrency.code, name: newCurrency.name, symbol: newCurrency.symbol, rate: Number(newCurrency.rate) || 0 }];
                          await API.put('/settings/currencies', { currencies: updated, defaultCurrency });
                          setNewCurrency({ code: '', name: '', symbol: '', rate: '' });
                          const { data } = await API.get('/settings/currencies');
                          setCurrencies(data.data?.currencies || []);
                          setSuccessMsg('Currency added successfully.');
                          setTimeout(() => setSuccessMsg(''), 4000);
                        } catch (err) {
                          setErrorMsg(err.response?.data?.message || 'Failed to add currency');
                        } finally {
                          setSavingCurrencies(false);
                        }
                      }}
                      style={{ width: 'auto', padding: '10px 16px' }}
                    >
                      Add
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px' }}>Code</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px' }}>Symbol</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px' }}>Rate</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currencies.map((c) => (
                        <tr key={c.code} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 12px' }}>{c.code}</td>
                          <td style={{ padding: '8px 12px' }}>{c.name}</td>
                          <td style={{ padding: '8px 12px' }}>{c.symbol}</td>
                          <td style={{ padding: '8px 12px' }}>{c.rate}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={async () => {
                                if (!confirm(`Delete currency ${c.code}?`)) return;
                                try {
                                  await API.delete(`/settings/currencies/${c.code}`);
                                  const { data } = await API.get('/settings/currencies');
                                  setCurrencies(data.data?.currencies || []);
                                } catch (err) {
                                  setErrorMsg(err.response?.data?.message || 'Failed to delete currency');
                                }
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {currencies.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No currencies configured.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div style={{ marginTop: 16 }}>
                    <label className="form-label">Default Currency</label>
                    <select
                      className="form-input"
                      value={defaultCurrency}
                      onChange={async (e) => {
                        setDefaultCurrency(e.target.value);
                        try {
                          await API.put('/settings/currencies', { defaultCurrency: e.target.value });
                          setSuccessMsg('Default currency updated.');
                          setTimeout(() => setSuccessMsg(''), 4000);
                        } catch (err) {
                          setErrorMsg(err.response?.data?.message || 'Failed to update default currency');
                        }
                      }}
                      style={{ maxWidth: 200 }}
                    >
                      {currencies.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 32px' }}>
                    Save Preferences
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
