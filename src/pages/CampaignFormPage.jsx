import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import logo from '../assets/logo.png';

const steps = ['Details', 'Audience', 'Budget', 'Review'];

const CampaignFormPage = () => {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '', company: '', interest: 'Product Demo', budget: '5000', channel: 'Email' });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data } = await API.get(`/public/form/${slug}`);
        setCampaign(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'This form is not available.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await API.post(`/public/form/${slug}`, form);
      setSubmitted(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(20,184,166,0.08) 0%, transparent 50%), #F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="crm-glass-card" style={{ width: '100%', maxWidth: 980, padding: 0, overflow: 'hidden', borderRadius: 24 }}>
        <div style={{ padding: 24, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logo} alt="Logo" style={{ width: 38, height: 38, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Campaign Intake</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Powered by Super ERP</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {steps.map((label, index) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: index <= step ? '#EFF6FF' : '#F8FAFC', color: index <= step ? '#2563EB' : '#64748B', fontSize: 12, fontWeight: 700 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: index <= step ? '#2563EB' : '#CBD5E1', color: '#fff', fontSize: 10 }}>{index + 1}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 0 }}>
          <div style={{ padding: 28 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}><div className="spinner" style={{ margin: '0 auto 16px' }} />Loading form…</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}><div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div><h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1F2937' }}>Form Unavailable</h2><p style={{ color: '#6B7280', fontSize: 14 }}>{error}</p></div>
            ) : submitted ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}><div style={{ fontSize: 48, marginBottom: 12 }}>✅</div><h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1F2937' }}>Thank You!</h2><p style={{ color: '#6B7280', fontSize: 14 }}>Your information has been received. We will be in touch shortly.</p></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 8 }}>Step {step + 1} · {steps[step]}</div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>{campaign?.name || 'Request a marketing consultation'}</h1>
                <p style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>Collect the key details in a guided flow so the team can respond quickly.</p>

                {formError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{formError}</div>}

                {step === 0 && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Full Name <span style={{ color: '#EF4444' }}>*</span></label><input className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Email Address <span style={{ color: '#EF4444' }}>*</span></label><input className="form-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" placeholder="+1 234 567 8900" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Company</label><input className="form-input" placeholder="Acme Ltd" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
                  </div>
                )}

                {step === 1 && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Primary Interest</label><select className="form-input" value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}><option>Product Demo</option><option>Lead Generation</option><option>Brand Awareness</option><option>Customer Retention</option></select></div>
                    <div className="form-group"><label className="form-label">Preferred Channel</label><select className="form-input" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}><option>Email</option><option>Meta</option><option>Google</option><option>WhatsApp</option></select></div>
                    <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" rows={4} placeholder="Tell us what you need…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div className="form-group"><label className="form-label">Budget Range (EGP)</label><input type="number" className="form-input" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} /></div>
                    <div style={{ padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>Suggested pacing</div>
                      <div style={{ height: 8, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}><div style={{ width: '70%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)' }} /></div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>A balanced launch will help you reach the best return while staying within budget.</div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div style={{ padding: 16, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Review request</div>
                      <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                        <div><strong>Name:</strong> {form.name || '—'}</div>
                        <div><strong>Email:</strong> {form.email || '—'}</div>
                        <div><strong>Company:</strong> {form.company || '—'}</div>
                        <div><strong>Interest:</strong> {form.interest}</div>
                        <div><strong>Budget:</strong> {form.budget || '—'} EGP</div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={step === 0}>Back</button>
                  {step < steps.length - 1 ? (
                    <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
                  ) : (
                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit'}</button>
                  )}
                </div>
              </form>
            )}
          </div>

          <div style={{ padding: 28, borderLeft: '1px solid #E2E8F0', background: 'linear-gradient(180deg, #F8FAFC 0%, #ffffff 100%)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 12 }}>Campaign preview</div>
            <div style={{ padding: 16, borderRadius: 16, background: '#ffffff', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{campaign?.name || 'New campaign launch'}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>A guided request that gives your team context for the next move.</div>
              <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                <div style={{ padding: 10, borderRadius: 12, background: '#EFF6FF', color: '#1D4ED8', fontSize: 13, fontWeight: 600 }}>{form.channel || 'Email'} channel</div>
                <div style={{ padding: 10, borderRadius: 12, background: '#ECFDF5', color: '#166534', fontSize: 13, fontWeight: 600 }}>{form.interest || 'Product Demo'} focus</div>
                <div style={{ padding: 10, borderRadius: 12, background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 600 }}>Budget target {form.budget || '5000'} EGP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignFormPage;
