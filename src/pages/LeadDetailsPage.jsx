import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import OfferHistoryModal from '../components/OfferHistoryModal';
import OfferVersionsModal from '../components/OfferVersionsModal';
import { Icon } from '../components/Icons';

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

const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = ['Super CRM Administrator', 'System Architect'].includes(user?.role);
  
  const [lead, setLead] = useState(null);
  const [offers, setOffers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Lead Update
  const [updatingLead, setUpdatingLead] = useState(false);
  
  // Modals & Forms
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  
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

  // Email Templates & Send Preview
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [showSendPreview, setShowSendPreview] = useState(false);
  const [sendPreviewOfferId, setSendPreviewOfferId] = useState(null);
  const [sendPreviewMethod, setSendPreviewMethod] = useState('Email');
  const [sendPreviewSubject, setSendPreviewSubject] = useState('');
  const [sendPreviewHtml, setSendPreviewHtml] = useState('');
  const [sendPreviewLoading, setSendPreviewLoading] = useState(false);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState('');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templateEditorMode, setTemplateEditorMode] = useState('edit'); // 'edit' | 'create'
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateBlocks, setTemplateBlocks] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');

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

  const fetchEmailTemplates = async () => {
    try {
      const res = await API.get('/templates');
      setEmailTemplates(res.data.data || []);
    } catch (err) {
      console.error('Failed to load email templates:', err);
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
    fetchEmailTemplates();
    fetchProducts();
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
      await API.post('/offers', { ...newOffer, lead: id, price: parseFloat(newOffer.price) });
      await fetchData();
      setShowOfferModal(false);
      setNewOffer({ title: '', description: '', offerType: 'Service', catalogProduct: '', price: '', validUntil: '', notes: '' });
      setSelectedTemplate('');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to create offer';
      setError(msg);
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
      await API.put(`/offers/${editingOffer._id}`, { ...editingOffer, price: parseFloat(editingOffer.price) });
      await fetchData();
      setShowEditModal(false);
      setEditingOffer(null);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to update offer';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (offer) => {
    setEditingOffer({
      ...offer,
      price: offer.price.toString(),
      validUntil: offer.validUntil.split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleSend = async (offerId, method) => {
    const offer = offers.find(o => o._id === offerId);
    if (!offer) return;
    
    setSendPreviewOfferId(offerId);
    setSendPreviewMethod(method);
    setSendPreviewLoading(true);
    setShowSendPreview(true);
    setSelectedEmailTemplateId('');
    setSendPreviewSubject('');
    setSendPreviewHtml('');
    
    try {
      const res = await API.get('/templates');
      const tpls = res.data.data || [];
      const defaultTpl = tpls.find(t => t.isDefault) || tpls[0];
      
      if (defaultTpl) {
        setSelectedEmailTemplateId(defaultTpl._id);
        const renderRes = await API.post(`/templates/${defaultTpl._id}/render`, {
          sampleData: {
            companyName: 'Super CRM',
            companyLogo: '',
            lead: { name: offer.lead?.name || 'Customer', email: offer.lead?.email || '' },
            offer: {
              title: offer.title,
              description: offer.description,
              price: offer.price,
              validUntil: offer.validUntil
            },
            payLink: `https://super-erp-frontend.vercel.app/pay/${offer.paymentToken || 'sample-token'}`,
            sender: { firstName: user?.firstName || 'Admin', lastName: user?.lastName || 'User' }
          }
        });
        setSendPreviewSubject(renderRes.data.data.subject);
        setSendPreviewHtml(renderRes.data.data.html);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load template preview');
    } finally {
      setSendPreviewLoading(false);
    }
  };

  const handleConfirmSend = async () => {
    if (!sendPreviewOfferId) return;
    setSendingId(sendPreviewOfferId);
    setError('');
    try {
      await API.post(`/offers/${sendPreviewOfferId}/send`, { 
        method: sendPreviewMethod, 
        templateId: selectedEmailTemplateId || undefined 
      });
      await fetchData();
      setShowSendPreview(false);
      setSendPreviewOfferId(null);
      setSendPreviewHtml('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send offer');
    } finally {
      setSendingId(null);
    }
  };

  const handleTemplateChange = async (templateId) => {
    setSelectedEmailTemplateId(templateId);
    if (!templateId || !sendPreviewOfferId) return;
    
    const offer = offers.find(o => o._id === sendPreviewOfferId);
    setSendPreviewLoading(true);
    try {
      const renderRes = await API.post(`/templates/${templateId}/render`, {
        sampleData: {
          companyName: 'Super CRM',
          companyLogo: '',
          lead: { name: offer?.lead?.name || 'Customer', email: offer?.lead?.email || '' },
          offer: {
            title: offer?.title || '',
            description: offer?.description || '',
            price: offer?.price || 0,
            validUntil: offer?.validUntil || ''
          },
          payLink: `https://super-erp-frontend.vercel.app/pay/${offer?.paymentToken || 'sample-token'}`,
          sender: { firstName: user?.firstName || 'Admin', lastName: user?.lastName || 'User' }
        }
      });
      setSendPreviewSubject(renderRes.data.data.subject);
      setSendPreviewHtml(renderRes.data.data.html);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to render template');
    } finally {
      setSendPreviewLoading(false);
    }
  };

  const openTemplateEditor = async (mode, templateId) => {
    setTemplateEditorMode(mode);
    setShowTemplateEditor(true);
    
    if (mode === 'edit' && templateId) {
      setEditingTemplateId(templateId);
      try {
        const { data } = await API.get(`/templates/${templateId}`);
        const tpl = data.data;
        setTemplateName(tpl.name);
        setTemplateSubject(tpl.subject);
        setTemplateBlocks(tpl.blocks || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load template');
      }
    } else {
      setEditingTemplateId(null);
      setTemplateName('');
      setTemplateSubject('New Offer: {{offer.title}}');
      setTemplateBlocks([
        { id: 'blk_' + Math.random().toString(36).substr(2, 9), type: 'header', content: '{{offer.title}}', styles: { fontSize: 24, color: '#111827', align: 'left' } },
        { id: 'blk_' + Math.random().toString(36).substr(2, 9), type: 'text', content: 'Hello {{lead.name}}, we have a special offer for you!', styles: { fontSize: 14, color: '#374151', align: 'left' } },
        { id: 'blk_' + Math.random().toString(36).substr(2, 9), type: 'offer-details', content: '', styles: {}, settings: {} },
        { id: 'blk_' + Math.random().toString(36).substr(2, 9), type: 'payment-link', content: 'Pay Now', styles: { backgroundColor: '#2563eb', color: '#ffffff', align: 'center' }, settings: { url: '{{payLink}}' } }
      ]);
    }
  };

  const handleTemplateEditorSave = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }
    if (!templateSubject.trim()) {
      setError('Subject line is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: templateName,
        subject: templateSubject,
        blocks: templateBlocks,
        isDefault: templateEditorMode === 'create'
      };
      
      let data;
      if (templateEditorMode === 'edit' && editingTemplateId) {
        const res = await API.put(`/templates/${editingTemplateId}`, payload);
        data = res.data;
      } else {
        const res = await API.post('/templates', payload);
        data = res.data;
      }
      
      await fetchEmailTemplates();
      setSelectedEmailTemplateId(data.data._id);
      await handleTemplateChange(data.data._id);
      setShowTemplateEditor(false);
      setSuccess('Template saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
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

  if (loading) return <div className="loading-state"><div className="spinner" />Loading lead details…</div>;
  if (!lead) return <div className="empty-state"><p>Lead not found</p></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/leads')} className="sidebar-link" style={{ width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Back to Leads
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Lead Information */}
        <div className="table-wrapper" style={{ padding: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 16,
          }}>
            {lead.name.substring(0, 2).toUpperCase()}
          </div>
          
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{lead.name}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{lead.email}</div>
            </div>
            {lead.phone && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{lead.phone}</div>
              </div>
            )}
            
            <div style={{ marginTop: 10, padding: '12px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Lead Status</div>
              <select
                value={lead.status}
                onChange={e => updateLeadStatus(e.target.value)}
                disabled={updatingLead}
                style={{
                  width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                  borderRadius: 6, padding: '8px 12px', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)'
                }}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</div>
              <div style={{ marginTop: 4 }}><span className={`badge ${lead.source === 'Meta' ? 'badge-meta' : lead.source === 'Google' ? 'badge-google' : 'badge-new'}`}>{lead.source}</span></div>
            </div>
            
            {lead.assignedTo && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Agent</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{lead.assignedTo.firstName} {lead.assignedTo.lastName}</div>
              </div>
            )}
            
            {lead.notes && (
              <div style={{ marginTop: 10, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{lead.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Offers & Tabs */}
        <div>
          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
            <div style={{ padding: '12px 24px', borderBottom: '2px solid var(--accent-primary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Offers ({offers.length})
            </div>
            {/* Future tabs can go here */}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button className="btn btn-primary" onClick={() => setShowOfferModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Create Offer
            </button>
          </div>

          {/* Offers List */}
          {offers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <p>No offers yet. Create one to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {offers.map(offer => (
                <div key={offer._id} className="table-wrapper" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{offer.title}</h3>
                        <span className={`badge ${statusBadge(offer.status)}`}>{offer.status}</span>
                        <span className={`badge ${offer.offerType === 'Product' ? 'badge-contacted' : 'badge-qualified'}`}>{offer.offerType}</span>
                        <span className="badge badge-meta" style={{ fontSize: 10, padding: '2px 8px', fontWeight: 700 }}>v{offer.version || 1}</span>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>{offer.description}</p>
                      
                      {/* Offer Images Gallery */}
                      {offer.images && offer.images.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
                          {offer.images.map(img => img && img.url && (
                            <div key={img._id || img.url} style={{ position: 'relative', width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000' }}>
                              <img 
                                src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                                alt={img.caption || 'Offer item'} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                title={img.caption || 'No caption'}
                              />
                              {(isAdmin || (offer.createdBy && offer.createdBy._id === user._id)) && (
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteImage(offer._id, img._id)}
                                  style={{
                                    position: 'absolute', top: 4, right: 4, 
                                    background: 'rgba(239, 68, 68, 0.85)', color: '#fff',
                                    border: 'none', borderRadius: '50%', width: 20, height: 20,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: 10, padding: 0
                                  }}
                                  title="Delete photo"
                                >
                                  ✕
                                </button>
                              )}
                              {img.caption && (
                                <div style={{
                                  position: 'absolute', bottom: 0, left: 0, right: 0,
                                  background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9,
                                  padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                  {img.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-primary)' }}>${offer.price.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Valid until {new Date(offer.validUntil).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: 12, borderRadius: 8 }}>
                    <div>Created By: <strong style={{ color: 'var(--text-secondary)' }}>{offer.createdBy.firstName} {offer.createdBy.lastName}</strong></div>
                    {offer.recordLocator && (
                      <div>Locator: <strong style={{ color: 'var(--accent-primary)' }}>{offer.recordLocator}</strong></div>
                    )}
                    {offer.sentAt && (
                      <div>Sent: <strong>{new Date(offer.sentAt).toLocaleDateString()}</strong> via {offer.sentVia}</div>
                    )}
                    {offer.revisionNote && (
                      <div style={{ flex: 1 }}>Revision Req: <strong>{offer.revisionNote}</strong></div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                    {offer.status === 'Draft' && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleSend(offer._id, 'Email')} disabled={sendingId === offer._id}>
                          {sendingId === offer._id ? 'Sending...' : '📧 Send Email'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleSend(offer._id, 'SMS')} disabled={sendingId === offer._id}>
                          💬 Send SMS
                        </button>
                        {offer.createdBy._id === user._id && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setImageUploadTarget(offer._id); setShowImageModal(true); }}>
                              📷 Add Photo
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => openEditModal(offer)}>
                              ✏️ Edit
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(offer._id)} style={{ color: 'var(--status-lost)' }}>
                              🗑️ Delete
                            </button>
                          </>
                        )}
                      </>
                    )}
                    
                    {offer.status === 'Sent' && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleSend(offer._id, 'Email')} disabled={sendingId === offer._id}>
                          {sendingId === offer._id ? 'Sending...' : '🔄 Resend Email'}
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => { setReviseOpenId(offer._id); setShowReviseModal(true); setRevisionRequirement(''); }}>
                          ✏️ Revise Offer
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setImageUploadTarget(offer._id); setShowImageModal(true); }}>
                          📷 Add Photo
                        </button>
                      </>
                    )}

                    {offer.status === 'Accepted' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdateOfferStatus(offer._id, 'Completed')}>
                        ✅ Complete Sale
                      </button>
                    )}

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setHistoryOpenId(offer._id); setShowHistoryModal(true); }}>
                        📋 History
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setVersionsOpenId(offer._id); setShowVersionsModal(true); }}>
                        📑 Versions
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                    onChange={e => setNewOffer(p => ({ ...p, catalogProduct: e.target.value }))}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Price ($)</label>
                  <input className="form-input" type="number" step="0.01" placeholder="0.00" value={newOffer.price} onChange={e => setNewOffer(p => ({ ...p, price: e.target.value }))} />
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Price ($)</label>
                  <input className="form-input" type="number" step="0.01" placeholder="0.00" value={editingOffer.price} onChange={e => setEditingOffer(p => ({ ...p, price: e.target.value }))} />
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

      {/* Send Preview Modal */}
      {showSendPreview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => { setShowSendPreview(false); setSendPreviewHtml(''); setShowTemplateEditor(false); }}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 12, width: '100%', maxWidth: 1100,
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  {showTemplateEditor ? 'Edit Email Template' : 'Preview & Send Offer Email'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  {showTemplateEditor 
                    ? 'Customize your email template blocks below' 
                    : `Review the email before sending to ${offers.find(o => o._id === sendPreviewOfferId)?.lead?.name || 'customer'}`
                  }
                </p>
              </div>
              <button onClick={() => { setShowSendPreview(false); setSendPreviewHtml(''); setShowTemplateEditor(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
              {!showTemplateEditor ? (
                /* SEND PREVIEW VIEW */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Left: Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Email Template</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select 
                          className="form-input" 
                          value={selectedEmailTemplateId} 
                          onChange={e => handleTemplateChange(e.target.value)}
                          disabled={sendPreviewLoading}
                          style={{ flex: 1 }}
                        >
                          <option value="">-- Select a template --</option>
                          {emailTemplates.map(t => (
                            <option key={t._id} value={t._id}>{t.name} {t.isDefault ? '(Default)' : ''}</option>
                          ))}
                        </select>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => openTemplateEditor('create', null)}
                          title="Create new template"
                        >
                          + New
                        </button>
                      </div>
                      {selectedEmailTemplateId && (
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => openTemplateEditor('edit', selectedEmailTemplateId)}
                          style={{ marginTop: 6 }}
                        >
                          ✏️ Edit Current Template
                        </button>
                      )}
                      {emailTemplates.length === 0 && !selectedEmailTemplateId && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          No templates yet. Click + New to create your first email template.
                        </p>
                      )}
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Subject Line</label>
                      <input 
                        className="form-input" 
                        value={sendPreviewSubject} 
                        onChange={e => setSendPreviewSubject(e.target.value)}
                        disabled={sendPreviewLoading || !selectedEmailTemplateId}
                      />
                    </div>
                    
                    <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div className="table-title" style={{ marginBottom: 8 }}>Send To</div>
                      <div style={{ fontSize: 14 }}>
                        <strong>{offers.find(o => o._id === sendPreviewOfferId)?.lead?.name}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{offers.find(o => o._id === sendPreviewOfferId)?.lead?.email}</div>
                      </div>
                    </div>
                    
                    <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div className="table-title" style={{ marginBottom: 8 }}>Offer Summary</div>
                      {(() => {
                        const o = offers.find(offer => offer._id === sendPreviewOfferId);
                        if (!o) return null;
                        return (
                          <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div><strong>Title:</strong> {o.title}</div>
                            <div><strong>Price:</strong> ${o.price?.toLocaleString()}</div>
                            <div><strong>Valid Until:</strong> {new Date(o.validUntil).toLocaleDateString()}</div>
                            {o.images?.length > 0 && <div><strong>Images:</strong> {o.images.length} attached</div>}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Right: Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="table-title">Email Preview</div>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', background: '#f4f4f4', flex: 1, minHeight: 400 }}>
                      <div style={{ background: '#111827', padding: '12px 16px', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                        {sendPreviewSubject || 'Loading...'}
                      </div>
                      <div style={{ padding: 20, background: '#ffffff', minHeight: 350, overflow: 'auto' }}>
                        {sendPreviewLoading ? (
                          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 12px' }} />
                            Rendering preview...
                          </div>
                        ) : sendPreviewHtml ? (
                          <div dangerouslySetInnerHTML={{ __html: sendPreviewHtml }} />
                        ) : (
                          <p style={{ color: '#9ca3af', textAlign: 'center' }}>Select a template to preview</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* TEMPLATE EDITOR VIEW */
                <TemplateEditorInline
                  mode={templateEditorMode}
                  editingTemplateId={editingTemplateId}
                  blocks={templateBlocks}
                  setBlocks={setTemplateBlocks}
                  templateName={templateName}
                  setTemplateName={setTemplateName}
                  templateSubject={templateSubject}
                  setTemplateSubject={setTemplateSubject}
                  onSave={handleTemplateEditorSave}
                  onCancel={() => setShowTemplateEditor(false)}
                  previewData={{
                    companyName: 'Super CRM',
                    companyLogo: '',
                    lead: offers.find(o => o._id === sendPreviewOfferId)?.lead || { name: 'Customer', email: '' },
                    offer: offers.find(o => o._id === sendPreviewOfferId) || { title: '', description: '', price: 0, validUntil: '' },
                    payLink: `https://super-erp-frontend.vercel.app/pay/${offers.find(o => o._id === sendPreviewOfferId)?.paymentToken || 'sample-token'}`,
                    sender: { firstName: user?.firstName || 'Admin', lastName: user?.lastName || 'User' }
                  }}
                />
              )}
            </div>
            
            {!showTemplateEditor && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => { setShowSendPreview(false); setSendPreviewHtml(''); }} disabled={sendPreviewLoading}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleConfirmSend} disabled={sendPreviewLoading || !selectedEmailTemplateId || !sendPreviewHtml}>
                  {sendPreviewLoading ? 'Rendering...' : sendingId === sendPreviewOfferId ? 'Sending...' : `Send ${sendPreviewMethod}`}
                </button>
              </div>
            )}
          </div>
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
        const compName = data.companyName || 'Super CRM';
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
