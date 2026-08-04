import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Icon } from '../components/Icons';
import EmailComposer from './EmailComposer';

const statusBadge = (status) => {
  const map = {
    New: 'badge-new', Contacted: 'badge-contacted', Qualified: 'badge-qualified',
    Lost: 'badge-lost', Converted: 'badge-converted', Draft: 'badge-new',
    Sent: 'badge-contacted', Viewed: 'badge-qualified', Accepted: 'badge-converted',
    Rejected: 'badge-lost', Expired: 'badge-meta', Completed: 'badge-completed',
    Canceled: 'badge-lost', Refunded: 'badge-meta'
  };
  return map[status] || 'badge-new';
};

const normalizeCurrencies = (values = []) => {
  const seen = new Set();
  const merged = [];
  const source = [...(Array.isArray(values) ? values : [])];
  source.forEach((currency) => {
    if (!currency || !currency.code) return;
    const code = String(currency.code).trim().toUpperCase();
    if (seen.has(code)) return;
    seen.add(code);
    merged.push({ code, name: currency.name || code, symbol: currency.symbol || '', rate: currency.rate ?? 1 });
  });
  return merged;
};

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'emails', label: 'Emails' },
  { key: 'images', label: 'Images' },
  { key: 'payment', label: 'Payment' },
  { key: 'booking', label: 'Booking' },
  { key: 'files', label: 'Files' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'history', label: 'History' },
  { key: 'versions', label: 'Versions' },
];

const OfferDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = ['Core 360 Administrator', 'System Architect'].includes(user?.role);

  const [offer, setOffer] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [emails, setEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [errRaw, setErrRaw] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageCaption, setImageCaption] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOffer = async () => {
    try {
      const offerRes = await API.get(`/offers/${id}`);
      const offer = offerRes.data.data;
      setOffer(offer);

      const leadId = offer?.lead?._id || offer?.lead;
      if (leadId) {
        const leadRes = await API.get(`/leads/${leadId}`);
        setLead(leadRes.data.data);
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      const apiError = err.response?.data?.error;
      const raw = err.message || err.toString();
      setError([apiMsg, apiError].filter(Boolean).join(' | ') || 'Failed to load offer');
      setErrRaw(raw);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    setEmailsLoading(true);
    try {
      const res = await API.get(`/offers/${id}/communications`);
      setEmails(res.data.data || []);
    } catch (err) {
      setEmails([]);
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load offer communications');
      }
    } finally {
      setEmailsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [id]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data } = await API.get('/settings/currencies');
        setCurrencies(normalizeCurrencies(data.data?.currencies || []));
      } catch {
        setCurrencies([]);
      }
    };
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (activeTab === 'emails') {
      fetchEmails();
    }
  }, [activeTab]);

  const handleEmailSent = async (emailPayload = {}) => {
    setSendingId(offer._id);
    setError('');
    setSuccess('');
    try {
      if (emailPayload instanceof FormData) {
        emailPayload.append('method', 'Email');
      } else {
        emailPayload = { method: 'Email', ...emailPayload };
      }
      await API.post(`/offers/${offer._id}/send`, emailPayload);
      setSuccess('Email sent successfully');
      setTimeout(() => {
        setShowEmailComposer(false);
        setSuccess('');
      }, 1500);
      fetchOffer();
      if (activeTab === 'emails') fetchEmails();
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.hint ? `${data.message}: ${data.hint}` : (data?.message || data?.error || 'Failed to send email');
      setError(msg);
    } finally {
      setSendingId(null);
    }
  };

  const handleAddReply = async (body) => {
    try {
      await API.post(`/offers/${offer._id}/communications/reply`, { body });
      fetchEmails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleUploadImage = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) return setError('Please select an image file first');
    setSaving(true);
    setError('');
    const formData = new FormData();
    formData.append('image', selectedFile);
    if (imageCaption) formData.append('caption', imageCaption);
    try {
      await API.post(`/offers/${offer._id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchOffer();
      setShowImageModal(false);
      setSelectedFile(null);
      setImageCaption('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await API.delete(`/offers/${offer._id}/images/${imageId}`);
      await fetchOffer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image');
    }
  };

  const currency = currencies.find(c => c.code === offer?.currency) || null;
  const symbol = currency?.symbol || offer?.currencySymbol || '$';
  const price = Number(offer?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) return <div className="loading-state"><div className="spinner" />Loading offer…</div>;
  if (!offer) return <div className="empty-state"><p>Offer not found</p></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} className="sidebar-link" style={{ width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
          </svg>
          Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{offer.title}</h1>
            <span className={`badge ${statusBadge(offer.status)}`}>{offer.status}</span>
            <span className={`badge ${offer.offerType === 'Product' ? 'badge-contacted' : 'badge-qualified'}`}>{offer.offerType}</span>
            <span className="badge badge-meta" style={{ fontSize: 10, padding: '2px 8px', fontWeight: 700 }}>v{offer.version || 1}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {lead?.name} • {symbol}{price} • Expires {new Date(offer.validUntil).toLocaleDateString()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {offer.status === 'Draft' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => setShowEmailComposer(true)} disabled={sendingId === offer._id}>
                <Icon name="send" size={14} /> Send Offer
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/leads/${lead?._id}`)}>
                <Icon name="edit" size={14} /> Edit
              </button>
            </>
          )}
          {offer.status === 'Sent' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowEmailComposer(true)} disabled={sendingId === offer._id}>
              <Icon name="send" size={14} /> Resend
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowHistoryModal(true)}>
            <Icon name="clock" size={14} /> History
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowVersionsModal(true)}>
            <Icon name="copy" size={14} /> Versions
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <div>{error}</div>
          {errRaw && <div style={{ fontSize: 11, marginTop: 6, opacity: .85 }}>Raw error: {String(errRaw)}</div>}
        </div>
      )}
      {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: activeTab === tab.key ? 'var(--bg-primary)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.key ? 600 : 500,
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Offer</div>
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <div><strong>Offer no.:</strong> {offer.recordLocator || offer._id?.toString().slice(-6).toUpperCase()}</div>
                <div><strong>Status:</strong> {offer.status}</div>
                <div><strong>Type:</strong> {offer.offerType}</div>
                <div><strong>Valid until:</strong> {new Date(offer.validUntil).toLocaleDateString()}</div>
                <div><strong>Created by:</strong> {offer.createdBy?.firstName} {offer.createdBy?.lastName}</div>
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer</div>
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <div><strong>Name:</strong> {lead?.name}</div>
                <div><strong>Email:</strong> {lead?.email || '—'}</div>
                <div><strong>Phone:</strong> {lead?.phone || '—'}</div>
                <div><strong>Lead ref:</strong> {lead?.referenceNumber || lead?._id || '—'}</div>
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pricing</div>
              <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
                <div><strong>Product/service:</strong> {offer.title}</div>
                <div><strong>Grand total:</strong> {symbol}{price}</div>
                <div><strong>Currency:</strong> {offer.currency || 'USD'}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Email Center</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowEmailComposer(true)}>
                <Icon name="send" size={14} /> New Email
              </button>
            </div>
            {emailsLoading ? (
              <div className="loading-state"><div className="spinner" />Loading emails…</div>
            ) : emails.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No communications yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {emails.map(email => (
                  <div key={email._id} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{email.subject}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {email.direction === 'outbound' ? 'To' : 'From'}: {email.direction === 'outbound' ? email.recipientEmail : email.senderEmail}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                        {new Date(email.createdAt).toLocaleString()}
                        <div style={{ marginTop: 4 }}>{email.status}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{email.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Offer Images</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowImageModal(true)}>
                <Icon name="image" size={14} /> Add Image
              </button>
            </div>
            {(!offer.images || offer.images.length === 0) ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 10 }}>
                No images have been added to this offer yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                {offer.images.map(img => img && img.url && (
                  <div key={img._id || img.url} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000', minHeight: 110 }}>
                    <img src={img.url && (img.url.startsWith('http') || img.url.startsWith('data:')) ? img.url : `http://localhost:5000${img.url}`} alt={img.caption || 'Offer image'} style={{ width: '100%', height: 110, objectFit: 'cover' }} />
                    {(isAdmin || (offer.createdBy && offer.createdBy._id === user?._id)) && (
                      <button type="button" onClick={() => handleDeleteImage(img._id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: 999, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10 }} title="Delete photo">✕</button>
                    )}
                    {img.caption && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, padding: '4px 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.caption}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payment' && (
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Payment</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
              <div style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Amount</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{symbol}{price}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Status</div>
                <div style={{ fontWeight: 700 }}>{offer.status === 'Paid' || offer.status === 'Completed' ? 'Paid' : 'Waiting for customer payment'}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Booking</h3>
            <div style={{ fontSize: 13 }}>
              <div><strong>Ref:</strong> {offer.recordLocator || offer.bookingRef || 'Not created yet'}</div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Files</h3>
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 10 }}>
              Documents can be attached here for this offer.
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', fontSize: 13 }}>
                <div style={{ fontWeight: 600 }}>Offer Created</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(offer.createdAt).toLocaleString()}</div>
              </div>
              {offer.sentAt && (
                <div style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>Sent</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(offer.sentAt).toLocaleString()} via {offer.sentVia}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>History</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowHistoryModal(true)}>Open History</button>
            </div>
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 10 }}>
              Audit log and change history are available in the history viewer.
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Versions</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowVersionsModal(true)}>Open Versions</button>
            </div>
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 10 }}>
              Previous sent versions are available in the versions viewer.
            </div>
          </div>
        )}
      </div>

      {showHistoryModal && (
        <OfferHistoryModal offerId={offer._id} onClose={() => setShowHistoryModal(false)} />
      )}
      {showVersionsModal && (
        <OfferVersionsModal offerId={offer._id} onClose={() => setShowVersionsModal(false)} />
      )}
      {showEmailComposer && (
        <EmailComposer
          offer={offer}
          lead={lead}
          user={user}
          onClose={() => setShowEmailComposer(false)}
          onSend={handleEmailSent}
        />
      )}

      {showImageModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => { setShowImageModal(false); setSelectedFile(null); setImageCaption(''); }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 24, maxWidth: 520, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add Offer Image</h3>
              <button onClick={() => { setShowImageModal(false); setSelectedFile(null); setImageCaption(''); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Image</label>
                <input className="form-input" type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Caption (optional)</label>
                <input className="form-input" value={imageCaption} onChange={e => setImageCaption(e.target.value)} placeholder="Image caption" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => { setShowImageModal(false); setSelectedFile(null); setImageCaption(''); }} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUploadImage} disabled={saving || !selectedFile}>
                  {saving ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetailPage;
