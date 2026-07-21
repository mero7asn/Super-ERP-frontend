import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';

const BLOCK_TYPES = [
  { type: 'header', label: 'Header', icon: 'H', description: 'Large heading text' },
  { type: 'text', label: 'Text', icon: 'T', description: 'Paragraph text block' },
  { type: 'image', label: 'Image', icon: '🖼', description: 'Image from URL' },
  { type: 'button', label: 'Button', icon: '🔘', description: 'Call-to-action button' },
  { type: 'divider', label: 'Divider', icon: '—', description: 'Horizontal line' },
  { type: 'spacer', label: 'Spacer', icon: '↕', description: 'Vertical spacing' },
  { type: 'offer-details', label: 'Offer Details', icon: '📋', description: 'Auto-populated offer info' },
  { type: 'payment-link', label: 'Payment Button', icon: '💳', description: 'Auto-populated pay link' },
  { type: 'company-info', label: 'Company Info', icon: '🏢', description: 'Branding block with logo' },
];

const SAMPLE_DATA = {
  companyName: 'Super CRM',
  companyLogo: '',
  lead: { name: 'John Doe', email: 'john@example.com' },
  offer: { title: 'Premium Service Package', description: 'A comprehensive service solution tailored to your business needs with premium support.', price: 2999, validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
  payLink: 'https://example.com/pay/sample-token',
  sender: { firstName: 'Admin', lastName: 'User' }
};

const generateId = () => 'blk_' + Math.random().toString(36).substr(2, 9);

const createBlock = (type) => {
  const base = { id: generateId(), type, content: '', styles: {}, settings: {} };
  switch (type) {
    case 'header':
      return { ...base, content: 'Your Offer Title Here', styles: { fontSize: 24, color: '#111827', align: 'left' } };
    case 'text':
      return { ...base, content: 'Enter your message here. You can use {{placeholders}} like {{lead.name}} and {{offer.title}}.', styles: { fontSize: 14, color: '#374151', align: 'left' } };
    case 'image':
      return { ...base, content: '', styles: {}, settings: { url: 'https://via.placeholder.com/600x300', alt: 'Offer image' } };
    case 'button':
      return { ...base, content: 'Pay Now', styles: { backgroundColor: '#2563eb', color: '#ffffff', align: 'center' }, settings: { url: '{{payLink}}' } };
    case 'divider':
      return { ...base, content: '', styles: { color: '#e5e7eb', thickness: 1 } };
    case 'spacer':
      return { ...base, content: '', styles: {}, settings: { height: 20 } };
    case 'offer-details':
      return { ...base, content: '', styles: {}, settings: {} };
    case 'payment-link':
      return { ...base, content: 'Complete Your Payment', styles: { backgroundColor: '#2563eb', color: '#ffffff', align: 'center' }, settings: { url: '{{payLink}}' } };
    case 'company-info':
      return { ...base, content: '', styles: {}, settings: {} };
    default:
      return base;
  }
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
      return `<h1 style="margin:0 0 16px;font-size:${block.styles.fontSize || 24}px;color:${block.styles.color || '#111827'};text-align:${block.styles.align || 'left'};font-weight:600;">${content}</h1>`;
    case 'text':
      return `<p style="margin:0 0 16px;font-size:${block.styles.fontSize || 14}px;color:${block.styles.color || '#374151'};text-align:${block.styles.align || 'left'};line-height:1.6;">${content}</p>`;
    case 'image':
      const url = block.settings?.url || '';
      if (!url) return '<p style="color:#9ca3af;font-style:italic;">No image URL set</p>';
      return `<div style="margin:0 0 16px;text-align:center;"><img src="${url}" alt="${block.settings?.alt || ''}" style="max-width:100%;height:auto;border-radius:8px;border:1px solid #e5e7eb;" /></div>`;
    case 'button':
      return `<div style="margin:0 0 16px;text-align:${block.styles.align || 'center'};"><a href="${block.settings?.url || '#'}" style="display:inline-block;background-color:${block.styles.backgroundColor || '#2563eb'};color:${block.styles.color || '#ffffff'};text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;">${content || 'Button'}</a></div>`;
    case 'divider':
      return `<hr style="border:none;border-top:${block.styles.thickness || 1}px solid ${block.styles.color || '#e5e7eb'};margin:0 0 16px;" />`;
    case 'spacer':
      return `<div style="height:${block.settings?.height || 20}px;"></div>`;
    case 'offer-details':
      return `
        <div style="margin:0 0 16px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
          <h3 style="margin:0 0 8px;font-size:16px;color:#111827;">${data.offer?.title || 'Offer Title'}</h3>
          <p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.5;">${data.offer?.description || 'Offer description goes here.'}</p>
          <p style="margin:0 0 4px;font-size:14px;color:#111827;"><strong>Price:</strong> $${(data.offer?.price || 0).toLocaleString()}</p>
          <p style="margin:0;font-size:14px;color:#6b7280;"><strong>Valid Until:</strong> ${data.offer?.validUntil ? new Date(data.offer.validUntil).toLocaleDateString() : 'N/A'}</p>
        </div>`;
    case 'payment-link':
      return `<div style="margin:0 0 16px;text-align:${block.styles.align || 'center'};"><a href="${data.payLink || '#'}" style="display:inline-block;background-color:${block.styles.backgroundColor || '#2563eb'};color:${block.styles.color || '#ffffff'};text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;">${content || 'Pay Now'}</a></div>`;
    case 'company-info':
      const compName = data.companyName || 'Super CRM';
      const compLogo = data.companyLogo || '';
      return `
        <div style="margin:0 0 16px;display:flex;align-items:center;gap:12px;">
          ${compLogo ? `<img src="${compLogo}" alt="${compName}" width="48" height="48" style="object-fit:contain;border-radius:8px;" />` : ''}
          <div>
            <h3 style="margin:0;font-size:16px;color:#111827;font-weight:600;">${compName}</h3>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Offer from ${compName}</p>
          </div>
        </div>`;
    default:
      return '';
  }
};

const EmailTemplateEditor = () => {
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [subject, setSubject] = useState('New Offer: {{offer.title}}');
  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState(SAMPLE_DATA);

  const fetchTemplates = async () => {
    try {
      const { data } = await API.get('/templates');
      setTemplates(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const loadTemplate = async (templateId) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/templates/${templateId}`);
      const tpl = data.data;
      setCurrentTemplate(tpl);
      setBlocks(tpl.blocks || []);
      setSubject(tpl.subject || '');
      setTemplateName(tpl.name || '');
      setSelectedBlockId(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleNewTemplate = () => {
    setCurrentTemplate(null);
    setBlocks([createBlock('header'), createBlock('text'), createBlock('payment-link')]);
    setSubject('New Offer: {{offer.title}}');
    setTemplateName('');
    setSelectedBlockId(null);
    setError('');
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }
    if (!subject.trim()) {
      setError('Subject line is required');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: templateName,
        subject,
        blocks,
        isDefault: currentTemplate?.isDefault || false
      };
      
      let data;
      if (currentTemplate?._id) {
        const res = await API.put(`/templates/${currentTemplate._id}`, payload);
        data = res.data;
      } else {
        const res = await API.post('/templates', payload);
        data = res.data;
      }
      
      setCurrentTemplate(data.data);
      setSuccess('Template saved successfully');
      await fetchTemplates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTemplate?._id) return;
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await API.delete(`/templates/${currentTemplate._id}`);
      setSuccess('Template deleted');
      handleNewTemplate();
      await fetchTemplates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const addBlock = (type) => {
    const newBlock = createBlock(type);
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
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

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const renderedPreview = blocks.map(b => renderBlockPreview(b, previewData)).join('');

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Email Template Builder
          </h1>
          <p className="page-subtitle">Design custom offer email templates with drag-and-drop blocks</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleNewTemplate}>
            + New Template
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Template'}
          </button>
          {currentTemplate && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete} style={{ background: '#dc2626', color: '#fff' }}>
              Delete
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 400px', gap: 16, marginTop: 16, alignItems: 'start' }}>
        
        {/* Left: Block Palette */}
        <div className="table-wrapper" style={{ padding: 16, position: 'sticky', top: 16 }}>
          <div className="table-title" style={{ marginBottom: 12 }}>Blocks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BLOCK_TYPES.map(bt => (
              <div
                key={bt.type}
                onClick={() => addBlock(bt.type)}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{bt.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{bt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bt.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <div className="table-title" style={{ marginBottom: 8 }}>Saved Templates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {templates.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No templates yet</div>
              )}
              {templates.map(t => (
                <div
                  key={t._id}
                  onClick={() => loadTemplate(t._id)}
                  style={{
                    padding: '8px 10px',
                    background: currentTemplate?._id === t._id ? 'rgba(var(--accent-rgb, 99,102,241),0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${currentTemplate?._id === t._id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.blocks?.length || 0} blocks</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Canvas */}
        <div>
          <div className="table-wrapper" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Template Name</label>
                <input className="form-input" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="My Offer Template" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Subject</label>
                <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="New Offer: {{offer.title}}" />
              </div>
            </div>
          </div>

          <div className="table-wrapper" style={{ padding: 0, minHeight: 400 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="table-title">Canvas</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{blocks.length} blocks — drag to reorder</span>
            </div>
            <div style={{ padding: 16 }}>
              {blocks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📧</div>
                  <p>Click blocks on the left to add them to your template</p>
                </div>
              )}
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={e => { e.dataTransfer.setData('text/plain', String(index)); }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const from = parseInt(e.dataTransfer.getData('text/plain'));
                    if (!isNaN(from) && from !== index) moveBlock(from, index);
                  }}
                  onClick={() => setSelectedBlockId(block.id)}
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    background: selectedBlockId === block.id ? 'rgba(var(--accent-rgb, 99,102,241),0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedBlockId === block.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: 8,
                    cursor: 'grab',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {block.type} #{index + 1}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: renderBlockPreview(block, previewData) }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Edit + Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Block Editor */}
          {selectedBlock && (
            <div className="table-wrapper" style={{ padding: 16, position: 'sticky', top: 16 }}>
              <div className="table-title" style={{ marginBottom: 12 }}>Edit {selectedBlock.type}</div>
              
              {(selectedBlock.type === 'header' || selectedBlock.type === 'text') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Content</label>
                    <textarea className="form-input" rows={3} value={selectedBlock.content} onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Font Size (px)</label>
                    <input className="form-input" type="number" value={selectedBlock.styles.fontSize || 14} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontSize: parseInt(e.target.value) || 14 } })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Text Color</label>
                    <input className="form-input" type="color" value={selectedBlock.styles.color || '#374151'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, color: e.target.value } })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Alignment</label>
                    <select className="form-input" value={selectedBlock.styles.align || 'left'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, align: e.target.value } })}>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedBlock.type === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Image URL</label>
                    <input className="form-input" value={selectedBlock.settings?.url || ''} onChange={e => updateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, url: e.target.value } })} placeholder="https://example.com/image.jpg" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Alt Text</label>
                    <input className="form-input" value={selectedBlock.settings?.alt || ''} onChange={e => updateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, alt: e.target.value } })} />
                  </div>
                </div>
              )}

              {(selectedBlock.type === 'button' || selectedBlock.type === 'payment-link') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Button Text</label>
                    <input className="form-input" value={selectedBlock.content} onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Link URL</label>
                    <input className="form-input" value={selectedBlock.settings?.url || ''} onChange={e => updateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, url: e.target.value } })} placeholder="{{payLink}}" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Background Color</label>
                    <input className="form-input" type="color" value={selectedBlock.styles.backgroundColor || '#2563eb'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, backgroundColor: e.target.value } })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Text Color</label>
                    <input className="form-input" type="color" value={selectedBlock.styles.color || '#ffffff'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, color: e.target.value } })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Alignment</label>
                    <select className="form-input" value={selectedBlock.styles.align || 'center'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, align: e.target.value } })}>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedBlock.type === 'divider' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Line Color</label>
                    <input className="form-input" type="color" value={selectedBlock.styles.color || '#e5e7eb'} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, color: e.target.value } })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Thickness (px)</label>
                    <input className="form-input" type="number" value={selectedBlock.styles.thickness || 1} onChange={e => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, thickness: parseInt(e.target.value) || 1 } })} />
                  </div>
                </div>
              )}

              {selectedBlock.type === 'spacer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Height (px)</label>
                    <input className="form-input" type="number" value={selectedBlock.settings?.height || 20} onChange={e => updateBlock(selectedBlock.id, { settings: { ...selectedBlock.settings, height: parseInt(e.target.value) || 20 } })} />
                  </div>
                </div>
              )}

              {(selectedBlock.type === 'offer-details' || selectedBlock.type === 'payment-link' || selectedBlock.type === 'company-info') && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  This block auto-populates with offer data when the email is sent. No manual content needed.
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="table-wrapper" style={{ padding: 16, position: 'sticky', top: 16 }}>
            <div className="table-title" style={{ marginBottom: 12 }}>Live Preview</div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', background: '#f4f4f4' }}>
              <div style={{ background: '#111827', padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{subject.replace(/\{\{.*?\}\}/g, m => m)}</span>
              </div>
              <div style={{ padding: 20, minHeight: 200, background: '#ffffff' }}>
                {renderedPreview ? (
                  <div dangerouslySetInnerHTML={{ __html: renderedPreview }} />
                ) : (
                  <p style={{ color: '#9ca3af', textAlign: 'center' }}>Add blocks to see preview</p>
                )}
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
              Preview uses sample data. Placeholders like {`{{lead.name}}`} show sample values.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
