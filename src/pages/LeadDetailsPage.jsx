import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import OfferHistoryModal from '../components/OfferHistoryModal';
import OfferVersionsModal from '../components/OfferVersionsModal';
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

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];

const FALLBACK_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 48.5 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rate: 3.75 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
];

const normalizeCurrencies = (values = []) => {
  const seen = new Set();
  const merged = [];
  const source = [...(Array.isArray(values) ? values : []), ...FALLBACK_CURRENCIES];

  source.forEach((currency) => {
    if (!currency || !currency.code) return;
    const code = String(currency.code).trim().toUpperCase();
    if (seen.has(code)) return;
    seen.add(code);
    merged.push({
      code,
      name: currency.name || code,
      symbol: currency.symbol || '',
      rate: currency.rate ?? 1,
    });
  });

  return merged;
};

const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = ['CRM core Administrator', 'System Architect'].includes(user?.role);
  
  const [lead, setLead] = useState(null);
  const [offers, setOffers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Lead Update
  const [updatingLead, setUpdatingLead] = useState(false);
  
  // Notes
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  
  // Modals & Forms
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [callingLead, setCallingLead] = useState(false);
  const [callProvider, setCallProvider] = useState('avaya');
  const [success, setSuccess] = useState('');
  
  // Email Composer
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [composerOffer, setComposerOffer] = useState(null);
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyOpenId, setHistoryOpenId] = useState(null);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [reviseOpenId, setReviseOpenId] = useState(null);
  const [revisionRequirement, setRevisionRequirement] = useState('');
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [versionsOpenId, setVersionsOpenId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [newOffer, setNewOffer] = useState({
    title: '', description: '', offerType: 'Service', catalogProduct: '',
    price: '', validUntil: '', notes: ''
  });

  // Settings & Currency
  const [settings, setSettings] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [newOfferCurrency, setNewOfferCurrency] = useState('USD');
  const [discountingId, setDiscountingId] = useState(null);

  // Image Uploads
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUploadTarget, setImageUploadTarget] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageCaption, setImageCaption] = useState('');

  const fetchData = async () => {
    try {
      const [leadRes, offersRes] = await Promise.all([
        API.get(`/leads/${id}`),
        API.get(`/offers/lead/${id}`)
      ]);
      setLead(leadRes.data.data);
      setOffers(offersRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await API.get('/offers/templates');
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTemplates();
    fetchProducts();
  }, [id]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const pricingRes = await API.get('/settings/pricing');
        setSettings(pricingRes.data.data || {});
      } catch (err) {
        console.error('Failed to load pricing settings:', err);
      }
    };
    const fetchTelephonySettings = async () => {
      try {
        const { data } = await API.get('/settings/telephony');
        if (data.success) {
          setCallProvider(data.data?.provider || 'avaya');
        }
      } catch (err) {
        console.error('Failed to load telephony settings:', err);
      }
    };
    const fetchCurrencies = async () => {
      try {
        const { data } = await API.get('/settings/currencies');
        const configuredCurrencies = normalizeCurrencies(data.data?.currencies || []);
        const configuredDefault = data.data?.defaultCurrency || configuredCurrencies[0]?.code || 'USD';
        setCurrencies(configuredCurrencies);
        setDefaultCurrency(configuredDefault);
        setNewOfferCurrency(configuredDefault);
      } catch (err) {
        console.error('Failed to load currencies:', err);
        setCurrencies(normalizeCurrencies());
        setDefaultCurrency('USD');
        setNewOfferCurrency('USD');
      }
    };
    fetchSettings();
    fetchTelephonySettings();
    fetchCurrencies();
  }, [id]);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t._id === selectedTemplate);
      if (template) {
        const validUntilDate = new Date();
        validUntilDate.setDate(validUntilDate.getDate() + (template.validDays || 30));
        setNewOffer(prev => ({
          ...prev,
          title: template.title,
          description: template.description,
          price: template.price.toString(),
          validUntil: validUntilDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [selectedTemplate, templates]);

  const updateLeadStatus = async (newStatus) => {
    setUpdatingLead(true);
    try {
      const { data } = await API.put(`/leads/${id}`, { status: newStatus });
      setLead(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lead');
    } finally {
      setUpdatingLead(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!newOffer.title.trim()) return setError('Offer title is required');
    if (!newOffer.description.trim()) return setError('Offer description is required');
    if (!newOffer.price || isNaN(parseFloat(newOffer.price))) return setError('Valid price is required');
    if (!newOffer.validUntil) return setError('Valid until date is required');
    
    setSaving(true);
    setError('');
    try {
      const selectedCurrency = currencies.find(c => c.code === newOfferCurrency) || null;
      await API.post('/offers', {
        ...newOffer,
        lead: id,
        price: parseFloat(newOffer.price),
        currency: newOfferCurrency || defaultCurrency || 'USD',
        currencySymbol: selectedCurrency?.symbol || ''
      });
      await fetchData();
      setShowOfferModal(false);
      setNewOffer({ title: '', description: '', offerType: 'Service', catalogProduct: '', price: '', validUntil: '', notes: '' });
      setSelectedTemplate('');
    } catch (err) {
      const payload = err.response?.data;
      const msg = payload?.message || payload?.error || payload?.detail || 'Failed to create offer';
      setError(msg || 'The offer could not be created. Please check the price and try again.');
      setShowOfferModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOffer = async () => {
    if (!editingOffer.title.trim()) return setError('Offer title is required');
    if (!editingOffer.description.trim()) return setError('Offer description is required');
    if (!editingOffer.price || isNaN(parseFloat(editingOffer.price))) return setError('Valid price is required');
    if (!editingOffer.validUntil) return setError('Valid until date is required');
    
    setSaving(true);
    setError('');
    try {
      const selectedCurrency = currencies.find(c => c.code === (editingOffer.currency || newOfferCurrency)) || null;
      await API.put(`/offers/${editingOffer._id}`, {
        ...editingOffer,
        price: parseFloat(editingOffer.price),
        currency: editingOffer.currency || newOfferCurrency || defaultCurrency || 'USD',
        currencySymbol: selectedCurrency?.symbol || ''
      });
      await fetchData();
      setShowEditModal(false);
      setEditingOffer(null);
    } catch (err) {
      const payload = err.response?.data;
      const msg = payload?.message || payload?.error || payload?.detail || 'Failed to update offer';
      setError(msg || 'The offer could not be updated. Please try again.');
      setShowEditModal(true);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (offer) => {
    setEditingOffer({
      ...offer,
      price: offer.price.toString(),
      validUntil: offer.validUntil.split('T')[0],
      currency: offer.currency || newOfferCurrency || defaultCurrency || 'USD',
      currencySymbol: offer.currencySymbol || ''
    });
    setShowEditModal(true);
  };

  const handleSend = async (offerId, method) => {
    const offer = offers.find(o => o._id === offerId);
    if (!offer) return;
    setComposerOffer(offer);
    setShowEmailComposer(true);
  };

  const handleEmailSent = async (emailPayload = {}) => {
    setSendingId(composerOffer._id);
    setError('');
    setSuccess('');
    try {
      if (emailPayload instanceof FormData) {
        emailPayload.append('method', 'Email');
      } else {
        emailPayload = { method: 'Email', ...emailPayload };
      }
      await API.post(`/offers/${composerOffer._id}/send`, emailPayload);
      await fetchData();
      setSuccess('Email sent successfully');
      setTimeout(() => {
        setShowEmailComposer(false);
        setComposerOffer(null);
        setSuccess('');
      }, 1500);
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.hint 
        ? `${data.message}: ${data.hint}` 
        : (data?.message || data?.error || 'Failed to send email');
      setError(msg);
    } finally {
      setSendingId(null);
    }
  };

  const handleCallLead = async () => {
    const primaryOffer = offers.find(o => o._id) || offers[0];
    if (!primaryOffer) {
      setError('Create an offer first so the lead can be called from this page.');
      return;
    }
    setCallingLead(true);
    setError('');
    setSuccess('');
    try {
      await API.post(`/offers/${primaryOffer._id}/call`, { provider: callProvider, phone: lead?.phone });
      setSuccess(`Call initiated for ${lead?.name || 'the lead'}`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate call');
    } finally {
      setCallingLead(false);
    }
  };

  const handleDiscount = async (offer) => {
    setDiscountingId(offer._id);
    setError('');
    const discountType = prompt('Discount type (Percentage or Fixed):', 'Percentage');
    if (!discountType || !['Percentage', 'Fixed'].includes(discountType)) {
      setDiscountingId(null);
      return;
    }
    const discountValue = prompt('Discount value:');
    if (!discountValue || isNaN(parseFloat(discountValue))) {
      setDiscountingId(null);
      return;
    }
    try {
      await API.post(`/offers/${offer._id}/discount`, { discountType, discountValue: parseFloat(discountValue) });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply discount');
    } finally {
      setDiscountingId(null);
    }
  };

  const handleDelete = async (offerId) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await API.delete(`/offers/${offerId}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete offer');
    }
  };

  const handleRevise = async (offerId) => {
    if (!revisionRequirement.trim()) return setError('Please describe the customer requirement.');
    setError('');
    try {
      await API.post(`/offers/${offerId}/revise`, { requirement: revisionRequirement });
      setShowReviseModal(false);
      setReviseOpenId(null);
      setRevisionRequirement('');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revise offer');
    }
  };

  const handleUpdateOfferStatus = async (offerId, status) => {
    try {
      await API.put(`/offers/${offerId}`, { status });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
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
      await API.post(`/offers/${imageUploadTarget}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchData();
      setShowImageModal(false);
      setImageUploadTarget(null);
      setSelectedFile(null);
      setImageCaption('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (offerId, imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await API.delete(`/offers/${offerId}/images/${imageId}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setAddingNote(true);
    try {
      const response = await API.post(`/leads/${id}/notes`, { text: newNoteText });
      if (response.data?.note) {
        setLead(prevLead => ({
          ...prevLead,
          notes: [...(Array.isArray(prevLead.notes) ? prevLead.notes : []), response.data.note]
        }));
      }
      setNewNoteText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner" />Loading lead details…</div>;
  if (!lead) return <div className="empty-state"><p>Lead not found</p></div>;

  const leadInitials = String(lead.name || 'Lead').split(' ').slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'L';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="crm-page-banner" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', marginBottom: 6 }}>
            Lead workspace
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
            {lead.name}
          </h1>
          <p style={{ fontSize: 13, color: '#CBD5E1', marginTop: 8, margin: 0, lineHeight: 1.5 }}>
            {lead.email} • {lead.phone || 'No phone on file'} • Status <strong style={{ color: '#F8FAFC' }}>{lead.status}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/leads')} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 10 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Back to Leads
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowOfferModal(true)} style={{ padding: '8px 16px', borderRadius: 10 }}>
            Create Offer
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        <div className="crm-glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 18, boxShadow: '0 20px 45px rgba(15, 23, 42, 0.10)' }}>
          <div style={{ padding: '24px 24px 18px', background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(16,185,129,0.16))', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                width: 58, height: 58, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: '#fff',
              }}>
                {leadInitials}
              </div>
              <span className={`badge ${lead.source === 'Meta' ? 'badge-meta' : lead.source === 'Google' ? 'badge-google' : 'badge-new'}`} style={{ padding: '6px 10px' }}>{lead.source || 'Unknown'}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{lead.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Lead profile and activity snapshot</p>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{lead.email}</div>
              </div>
              {lead.phone && (
                <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Phone</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{lead.phone}</div>
                    <button className="btn btn-secondary btn-sm" onClick={handleCallLead} disabled={callingLead || offers.length === 0}>
                      {callingLead ? 'Calling...' : '📞 Call'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Lead status</div>
              <select
                value={lead.status}
                onChange={e => updateLeadStatus(e.target.value)}
                disabled={updatingLead}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {lead.assignedTo && (
              <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Assigned agent</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{lead.assignedTo.firstName} {lead.assignedTo.lastName}</div>
              </div>
            )}

            <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notes</div>
              <div style={{ marginBottom: 10, padding: 12, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Add note</div>
                <textarea
                  className="form-input"
                  rows={3}
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Type a new note..."
                  style={{ fontSize: 13, marginBottom: 8 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={addingNote || !newNoteText.trim()}>
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </div>

              {(() => {
                const notes = Array.isArray(lead?.notes) ? lead.notes : (lead?.notes ? [{ text: lead.notes, createdAt: new Date(), createdBy: { name: 'System', email: '', role: 'System' } }] : []);
                return notes.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notes.map((note, idx) => (
                      <div key={idx} style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: 6 }}>{note.text}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span>{note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</span>
                          {note.createdBy?.name && <span>by {note.createdBy.name} ({note.createdBy.role})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 18, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: '12px 24px', borderBottom: '2px solid var(--accent-primary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                Offers ({offers.length})
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowOfferModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Create Offer
            </button>
          </div>

          {offers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <p>No offers yet. Create one to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {offers.map(offer => {
                const offerNumber = offer.recordLocator || offer.offerNumber || `OFF-${String(offer._id || '').slice(-4).toUpperCase() || '0001'}`;
                const offerPrice = Number(offer.price || 0);
                const currencyMeta = currencies.find(c => c.code === offer.currency) || null;
                const offerSymbol = currencyMeta?.symbol || offer.currencySymbol || '$';
                const formattedPrice = offerPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const offerImages = Array.isArray(offer.images) ? offer.images.filter(Boolean) : [];
                const internalNotes = offer.notes ? [{ title: 'Internal note', text: offer.notes, author: offer.createdBy?.firstName || 'Employee', date: offer.updatedAt || offer.createdAt }] : [];
                const activityTimeline = [
                  { title: 'Created', description: 'Offer draft was created for this lead.', time: offer.createdAt ? new Date(offer.createdAt).toLocaleString() : 'Pending' },
                  { title: 'Edited', description: 'Offer details and pricing were updated.', time: offer.updatedAt ? new Date(offer.updatedAt).toLocaleString() : 'No edits recorded yet' },
                  { title: 'Sent', description: offer.sentAt ? 'Offer email sent to the customer.' : 'Waiting to be sent.', time: offer.sentAt ? new Date(offer.sentAt).toLocaleString() : 'Pending' },
                  { title: 'Payment', description: offer.status === 'Accepted' || offer.status === 'Paid' ? 'Customer payment is in progress or completed.' : 'Payment is still pending.', time: offer.status === 'Accepted' || offer.status === 'Paid' ? 'Awaiting confirmation' : 'Pending' }
                ];
                const auditEntries = [
                  { time: offer.createdAt ? new Date(offer.createdAt).toLocaleString() : '—', action: `${offer.createdBy?.firstName || 'Employee'} created ${offer.title || 'this offer'}` },
                  { time: offer.updatedAt ? new Date(offer.updatedAt).toLocaleString() : '—', action: 'Offer details and pricing were revised' },
                  { time: offer.sentAt ? new Date(offer.sentAt).toLocaleString() : '—', action: 'Offer sent to customer' }
                ];

                return (
                  <div key={offer._id} onClick={() => navigate(`/offers/${offer._id}`)} style={{ cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.07)' }}>
                    <div style={{ padding: '18px 20px', background: 'linear-gradient(90deg, rgba(99,102,241,0.10), rgba(16,185,129,0.08))', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{offer.title}</h3>
                            <span className={`badge ${statusBadge(offer.status)}`}>{offer.status || 'Draft'}</span>
                            <span className="badge badge-meta" style={{ fontSize: 10, padding: '2px 8px', fontWeight: 700 }}>v{offer.version || 1}</span>
                            <span className="badge badge-qualified" style={{ fontSize: 10, padding: '2px 8px', fontWeight: 700 }}>{offerNumber}</span>
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{offer.description || 'Proposal details will appear here once the offer is prepared.'}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-primary)' }}>{offerSymbol}{formattedPrice}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{offer.currency || 'USD'}</div>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>View details →</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Offer Modal */}
      {showOfferModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setShowOfferModal(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 600, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Create New Offer</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Build a custom offer for {lead.name}</p>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {templates.length > 0 && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Use Template (optional)</label>
                  <select
                    className="form-input"
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value)}
                  >
                    <option value="">— Select a template —</option>
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Offer Type</label>
                <select
                  className="form-input"
                  value={newOffer.offerType}
                  onChange={e => setNewOffer(p => ({ ...p, offerType: e.target.value, catalogProduct: e.target.value === 'Product' ? p.catalogProduct : '' }))}
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
              </div>
              {newOffer.offerType === 'Product' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Catalog Product</label>
                  <select
                    className="form-input"
                    value={newOffer.catalogProduct}
                     onChange={e => {
                       const selectedProduct = products.find(p => p._id === e.target.value);
                       setNewOffer(prev => ({ ...prev, catalogProduct: e.target.value, price: selectedProduct ? selectedProduct.price : '' }));
                     }}
                  >
                    <option value="">— Select a product —</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>{product.name} ({product.sku})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Offer Title</label>
                <input className="form-input" placeholder="e.g. Premium Package" value={newOffer.title} onChange={e => setNewOffer(p => ({ ...p, title: e.target.value }))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Describe what's included..." value={newOffer.description} onChange={e => setNewOffer(p => ({ ...p, description: e.target.value }))} />
              </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                 <div className="form-group" style={{ margin: 0 }}>
                   <label className="form-label">Price</label>
                   <input className="form-input" type="number" step="0.01" placeholder="0.00" value={newOffer.price} onChange={e => setNewOffer(p => ({ ...p, price: e.target.value }))} />
                 </div>
                 <div className="form-group" style={{ margin: 0 }}>
                   <label className="form-label">Currency</label>
                   <select
                     className="form-input"
                     value={newOfferCurrency}
                     onChange={e => setNewOfferCurrency(e.target.value)}
                   >
                     {currencies.map(c => (
                       <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>
                     ))}
                   </select>
                 </div>
                 <div className="form-group" style={{ margin: 0 }}>
                   <label className="form-label">Valid Until</label>
                   <input className="form-input" type="date" value={newOffer.validUntil} onChange={e => setNewOffer(p => ({ ...p, validUntil: e.target.value }))} />
                 </div>
               </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Internal Notes</label>
                <textarea className="form-input" rows="2" placeholder="Private notes..." value={newOffer.notes} onChange={e => setNewOffer(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowOfferModal(false)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreateOffer} disabled={saving}>
                {saving ? 'Creating...' : 'Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals */}
      {showHistoryModal && historyOpenId && (
        <OfferHistoryModal offerId={historyOpenId} onClose={() => { setShowHistoryModal(false); setHistoryOpenId(null); }} />
      )}

      {showReviseModal && reviseOpenId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => { setShowReviseModal(false); setReviseOpenId(null); setRevisionRequirement(''); }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 500, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Revise Offer</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Describe the customer requirement to freeze the current version and open a new draft.</p>
            <div className="form-group">
              <label className="form-label">Customer Requirement <span style={{ color: 'var(--status-lost)' }}>*</span></label>
              <textarea
                className="form-input" rows="4" placeholder="e.g. 10% lower price"
                value={revisionRequirement} onChange={e => setRevisionRequirement(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setShowReviseModal(false); setReviseOpenId(null); setRevisionRequirement(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleRevise(reviseOpenId)}>
                Revise Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {showVersionsModal && versionsOpenId && (
        <OfferVersionsModal offerId={versionsOpenId} onClose={() => { setShowVersionsModal(false); setVersionsOpenId(null); }} />
      )}

      {/* Edit Offer Modal */}
      {showEditModal && editingOffer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setShowEditModal(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 600, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Edit Offer</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Update this draft offer before sending.</p>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Offer Type</label>
                <select
                  className="form-input"
                  value={editingOffer.offerType}
                  onChange={e => setEditingOffer(p => ({ ...p, offerType: e.target.value }))}
                >
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Offer Title</label>
                <input className="form-input" placeholder="e.g. Premium Package" value={editingOffer.title} onChange={e => setEditingOffer(p => ({ ...p, title: e.target.value }))} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Describe what's included..." value={editingOffer.description} onChange={e => setEditingOffer(p => ({ ...p, description: e.target.value }))} />
              </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                 <div className="form-group" style={{ margin: 0 }}>
                   <label className="form-label">Price</label>
                   <input className="form-input" type="number" step="0.01" placeholder="0.00" value={editingOffer.price} onChange={e => setEditingOffer(p => ({ ...p, price: e.target.value }))} />
                 </div>
                 <div className="form-group" style={{ margin: 0 }}>
                   <label className="form-label">Currency</label>
                   <select
                     className="form-input"
                     value={editingOffer?.currency || newOfferCurrency}
                     onChange={e => setEditingOffer(p => ({ ...p, currency: e.target.value, currencySymbol: currencies.find(c => c.code === e.target.value)?.symbol || '' }))}
                   >
                     {currencies.map(c => (
                       <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>
                     ))}
                   </select>
                 </div>
                 <div className="form-group" style={{ margin: 0 }}>
                   <label className="form-label">Valid Until</label>
                   <input className="form-input" type="date" value={editingOffer.validUntil} onChange={e => setEditingOffer(p => ({ ...p, validUntil: e.target.value }))} />
                 </div>
               </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Internal Notes</label>
                <textarea className="form-input" rows="2" placeholder="Private notes..." value={editingOffer.notes || ''} onChange={e => setEditingOffer(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleUpdateOffer} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageModal && imageUploadTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => { setShowImageModal(false); setImageUploadTarget(null); setSelectedFile(null); setImageCaption(''); }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 32, maxWidth: 500, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Add Photo to Offer</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Upload a product image or document receipt</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Select Image <span style={{ color: 'var(--status-lost)' }}>*</span></label>
                <input 
                  className="form-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setSelectedFile(e.target.files[0])} 
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Caption (optional)</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Front view, contract page" 
                  value={imageCaption} 
                  onChange={e => setImageCaption(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowImageModal(false); setImageUploadTarget(null); setSelectedFile(null); setImageCaption(''); }} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleUploadImage} disabled={saving}>
                {saving ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {showEmailComposer && composerOffer && (
        <EmailComposer
          offer={composerOffer}
          lead={lead}
          user={user}
          onClose={() => { setShowEmailComposer(false); setComposerOffer(null); }}
          onSend={handleEmailSent}
        />
      )}
    </div>
   );
};

const OfferCommunicationPanel = ({ offer, user, onError, onSuccess }) => {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadThread = async () => {
      try {
        const { data } = await API.get(`/offers/${offer._id}/communications`);
        if (isActive) {
          setCommunications(data?.data || []);
        }
      } catch (err) {
        if (isActive) {
          setCommunications([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadThread();
    return () => { isActive = false; };
  }, [offer._id]);

  const handleReply = async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;

    setSubmitting(true);
    try {
      const { data } = await API.post(`/offers/${offer._id}/communications/reply`, { body: text, subject: 'Customer reply' });
      setCommunications(prev => [data?.data, ...prev]);
      setReplyText('');
      onSuccess?.('Reply logged for this offer');
      setTimeout(() => onSuccess?.(''), 1800);
    } catch (err) {
      onError?.(err.response?.data?.message || 'Failed to save reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, background: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Offer communication</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{communications.length} item{communications.length === 1 ? '' : 's'}</div>
      </div>

      <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        <textarea
          className="form-input"
          rows={2}
          placeholder="Add a quick reply or note for this offer"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          style={{ fontSize: 13 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !replyText.trim()}>
            {submitting ? 'Saving...' : 'Log reply'}
          </button>
        </div>
      </form>

      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading communications…</div>
      ) : communications.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No communications yet for this offer.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {communications.map((entry) => (
            <div key={entry._id || `${entry.direction}-${entry.createdAt}`} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {entry.direction === 'outbound' ? 'Outbound' : 'Inbound'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{entry.subject || 'Offer update'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{entry.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TemplateEditorInline = ({ mode, editingTemplateId, blocks, setBlocks, templateName, setTemplateName, templateSubject, setTemplateSubject, onSave, onCancel, previewData }) => {
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const generateId = () => 'blk_' + Math.random().toString(36).substr(2, 9);

  const addBlock = (type) => {
    const base = { id: generateId(), type, content: '', styles: {}, settings: {} };
    switch (type) {
      case 'header': return { ...base, content: 'Your Offer Title Here', styles: { fontSize: 24, color: '#111827', align: 'left' } };
      case 'text': return { ...base, content: 'Enter your message here.', styles: { fontSize: 14, color: '#374151', align: 'left' } };
      case 'image': return { ...base, styles: {}, settings: { url: 'https://via.placeholder.com/600x300', alt: 'Offer image' } };
      case 'button': return { ...base, content: 'Pay Now', styles: { backgroundColor: '#2563eb', color: '#ffffff', align: 'center' }, settings: { url: '{{payLink}}' } };
      case 'divider': return { ...base, styles: { color: '#e5e7eb', thickness: 1 } };
      case 'spacer': return { ...base, styles: {}, settings: { height: 20 } };
      case 'offer-details': return { ...base, styles: {}, settings: {} };
      case 'payment-link': return { ...base, content: 'Complete Your Payment', styles: { backgroundColor: '#2563eb', color: '#ffffff', align: 'center' }, settings: { url: '{{payLink}}' } };
      case 'company-info': return { ...base, styles: {}, settings: {} };
      default: return base;
    }
  };

  const updateBlock = (blockId, updates) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  const moveBlock = (fromIndex, toIndex) => {
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, moved);
    setBlocks(newBlocks);
  };

  const replacePlaceholders = (text, data) => {
    if (!text) return '';
    return text
      .replace(/\{\{companyName\}\}/g, data.companyName || '')
      .replace(/\{\{companyLogo\}\}/g, data.companyLogo || '')
      .replace(/\{\{lead\.name\}\}/g, data.lead?.name || '')
      .replace(/\{\{lead\.email\}\}/g, data.lead?.email || '')
      .replace(/\{\{offer\.title\}\}/g, data.offer?.title || '')
      .replace(/\{\{offer\.description\}\}/g, data.offer?.description || '')
      .replace(/\{\{offer\.price\}\}/g, data.offer?.price || '')
      .replace(/\{\{offer\.validUntil\}\}/g, data.offer?.validUntil ? new Date(data.offer.validUntil).toLocaleDateString() : '')
      .replace(/\{\{payLink\}\}/g, data.payLink || '')
      .replace(/\{\{sender\.firstName\}\}/g, data.sender?.firstName || '')
      .replace(/\{\{sender\.lastName\}\}/g, data.sender?.lastName || '');
  };

  const renderBlockPreview = (block, data) => {
    const content = replacePlaceholders(block.content, data);
    switch (block.type) {
      case 'header':
        return `<h1 style="margin:0 0 16px;font-size:${block.styles?.fontSize || 24}px;color:${block.styles?.color || '#111827'};text-align:${block.styles?.align || 'left'};font-weight:600;">${content}</h1>`;
      case 'text':
        return `<p style="margin:0 0 16px;font-size:${block.styles?.fontSize || 14}px;color:${block.styles?.color || '#374151'};text-align:${block.styles?.align || 'left'};line-height:1.6;">${content}</p>`;
      case 'image':
        const url = block.settings?.url || '';
        if (!url) return '<p style="color:#9ca3af;font-style:italic;">No image URL set</p>';
        return `<div style="margin:0 0 16px;text-align:center;"><img src="${url}" alt="${block.settings?.alt || ''}" style="max-width:100%;height:auto;border-radius:8px;" /></div>`;
      case 'button':
        return `<div style="margin:0 0 16px;text-align:${block.styles?.align || 'center'};"><a href="${block.settings?.url || '#'}" style="display:inline-block;background-color:${block.styles?.backgroundColor || '#2563eb'};color:${block.styles?.color || '#ffffff'};text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;">${content || 'Button'}</a></div>`;
      case 'divider':
        return `<hr style="border:none;border-top:${block.styles?.thickness || 1}px solid ${block.styles?.color || '#e5e7eb'};margin:0 0 16px;" />`;
      case 'spacer':
        return `<div style="height:${block.settings?.height || 20}px;"></div>`;
      case 'offer-details':
        return `<div style="margin:0 0 16px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;"><h3 style="margin:0 0 8px;font-size:16px;color:#111827;">${data.offer?.title || 'Offer Title'}</h3><p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.5;">${data.offer?.description || 'Offer description goes here.'}</p><p style="margin:0 0 4px;font-size:14px;color:#111827;"><strong>Price:</strong> $${(data.offer?.price || 0).toLocaleString()}</p><p style="margin:0;font-size:14px;color:#6b7280;"><strong>Valid Until:</strong> ${data.offer?.validUntil ? new Date(data.offer.validUntil).toLocaleDateString() : 'N/A'}</p></div>`;
      case 'payment-link':
        return `<div style="margin:0 0 16px;text-align:${block.styles?.align || 'center'};"><a href="${data.payLink || '#'}" style="display:inline-block;background-color:${block.styles?.backgroundColor || '#2563eb'};color:${block.styles?.color || '#ffffff'};text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;">${content || 'Pay Now'}</a></div>`;
      case 'company-info':
        const compName = data.companyName || 'Core 360';
        const compLogo = data.companyLogo || '';
        return `<div style="margin:0 0 16px;display:flex;align-items:center;gap:12px;">${compLogo ? `<img src="${compLogo}" alt="${compName}" width="48" height="48" style="object-fit:contain;border-radius:8px;" />` : ''}<div><h3 style="margin:0;font-size:16px;color:#111827;font-weight:600;">${compName}</h3><p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Offer from ${compName}</p></div></div>`;
      default: return '';
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const renderedPreview = blocks.map(b => renderBlockPreview(b, previewData)).join('');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 380px', gap: 16, maxHeight: '70vh' }}>
      {/* Left: Block Palette */}
      <div style={{ overflow: 'auto', paddingRight: 8 }}>
        <div className="table-title" style={{ marginBottom: 12 }}>Template Name & Subject</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Template Name</label>
            <input className="form-input" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="My Offer Template" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Subject Line</label>
            <input className="form-input" value={templateSubject} onChange={e => setTemplateSubject(e.target.value)} placeholder="New Offer: {{offer.title}}" />
          </div>
        </div>

        <div className="table-title" style={{ marginBottom: 12 }}>Blocks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { type: 'header', label: 'Header', icon: 'H' },
            { type: 'text', label: 'Text', icon: 'T' },
            { type: 'image', label: 'Image', icon: '🖼' },
            { type: 'button', label: 'Button', icon: '🔘' },
            { type: 'divider', label: 'Divider', icon: '—' },
            { type: 'spacer', label: 'Spacer', icon: '↕' },
            { type: 'offer-details', label: 'Offer Details', icon: '📋' },
            { type: 'payment-link', label: 'Payment Button', icon: '💳' },
            { type: 'company-info', label: 'Company Info', icon: '🏢' },
          ].map(bt => (
            <div
              key={bt.type}
              onClick={() => { const newBlock = addBlock(bt.type); setBlocks([...blocks, newBlock]); setSelectedBlockId(newBlock.id); }}
              style={{
                padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13
              }}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{bt.icon}</span>
              <span>{bt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Block List */}
      <div style={{ overflow: 'auto' }}>
        <div className="table-title" style={{ marginBottom: 12 }}>Canvas ({blocks.length} blocks)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {blocks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p>Click blocks on the left to add them</p>
            </div>
          )}
          {blocks.map((block, index) => (
            <div
              key={block.id}
              onClick={() => setSelectedBlockId(block.id)}
              style={{
                padding: 10, background: selectedBlockId === block.id ? 'rgba(var(--accent-rgb, 99,102,241),0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedBlockId === block.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: 6, cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  {block.type} #{index + 1}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={(e) => { e.stopPropagation(); if (index > 0) moveBlock(index, index - 1); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>↑</button>
                  <button onClick={(e) => { e.stopPropagation(); if (index < blocks.length - 1) moveBlock(index, index + 1); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>↓</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}>×</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: renderBlockPreview(block, previewData) }} />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Edit + Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {selectedBlock && (
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div className="table-title" style={{ marginBottom: 8 }}>Edit {selectedBlock.type}</div>
            {(selectedBlock.type === 'header' || selectedBlock.type === 'text') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Content</label>
                  <textarea className="form-input" rows={3} value={selectedBlock.content} onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Font Size (px)</label>
                  <input className="form-input" type="number" value={selectedBlock.styles?.fontSize || 14} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontSize: parseInt(e.target.value) || 14 } })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Color</label>
                  <input className="form-input" type="color" value={selectedBlock.styles?.color || '#374151'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, color: e.target.value } })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Alignment</label>
                  <select className="form-input" value={selectedBlock.styles?.align || 'left'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, align: e.target.value } })}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            )}
            {selectedBlock.type === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={selectedBlock.settings?.url || ''} onChange={e => updateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, url: e.target.value } })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Alt Text</label>
                  <input className="form-input" value={selectedBlock.settings?.alt || ''} onChange={e => updateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, alt: e.target.value } })} />
                </div>
              </div>
            )}
            {(selectedBlock.type === 'button' || selectedBlock.type === 'payment-link') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Button Text</label>
                  <input className="form-input" value={selectedBlock.content} onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Link URL</label>
                  <input className="form-input" value={selectedBlock.settings?.url || ''} onChange={e => updateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, url: e.target.value } })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Background Color</label>
                  <input className="form-input" type="color" value={selectedBlock.styles?.backgroundColor || '#2563eb'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, backgroundColor: e.target.value } })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Text Color</label>
                  <input className="form-input" type="color" value={selectedBlock.styles?.color || '#ffffff'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, color: e.target.value } })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Alignment</label>
                  <select className="form-input" value={selectedBlock.styles?.align || 'center'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, align: e.target.value } })}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            )}
            {selectedBlock.type === 'divider' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Line Color</label>
                  <input className="form-input" type="color" value={selectedBlock.styles?.color || '#e5e7eb'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, color: e.target.value } })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Thickness (px)</label>
                  <input className="form-input" type="number" value={selectedBlock.styles?.thickness || 1} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, thickness: parseInt(e.target.value) || 1 } })} />
                </div>
              </div>
            )}
            {selectedBlock.type === 'spacer' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Height (px)</label>
                <input className="form-input" type="number" value={selectedBlock.settings?.height || 20} onChange={e => updateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, height: parseInt(e.target.value) || 20 } })} />
              </div>
            )}
            {(selectedBlock.type === 'offer-details' || selectedBlock.type === 'company-info') && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This block auto-populates with data. No manual content needed.</p>
            )}
          </div>
        )}

        <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
          <div className="table-title" style={{ marginBottom: 8 }}>Live Preview</div>
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 6, overflow: 'hidden', background: '#f4f4f4' }}>
            <div style={{ background: '#111827', padding: '10px 14px', color: '#fff', fontSize: 12, fontWeight: 600 }}>
              {templateSubject.replace(/\{\{.*?\}\}/g, m => m) || 'Subject...'}
            </div>
            <div style={{ padding: 16, background: '#fff', minHeight: 200, maxHeight: 300, overflow: 'auto' }}>
              {renderedPreview ? <div dangerouslySetInnerHTML={{ __html: renderedPreview }} /> : <p style={{ color: '#9ca3af', textAlign: 'center' }}>Add blocks to preview</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsPage;
