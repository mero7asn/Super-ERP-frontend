import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import API from '../services/api';

const BLOCK_TYPES = [
  { type: 'header', label: 'Header', icon: 'H', description: 'Big title' },
  { type: 'text', label: 'Text', icon: 'T', description: 'Paragraph' },
  { type: 'image', label: 'Image', icon: '🖼', description: 'Image from URL' },
  { type: 'button', label: 'Button', icon: '🔘', description: 'Call to action' },
  { type: 'divider', label: 'Divider', icon: '—', description: 'Horizontal line' },
  { type: 'spacer', label: 'Spacer', icon: '↕', description: 'Vertical space' },
  { type: 'offer-details', label: 'Offer Details', icon: '📋', description: 'Offer info card' },
  { type: 'payment-link', label: 'Payment Button', icon: '💳', description: 'Pay now button' },
  { type: 'company-info', label: 'Company Info', icon: '🏢', description: 'Branding block' },
];

const VARIABLES = [
  { category: 'Lead', items: [
    { label: 'Name', value: '{{lead.name}}' },
    { label: 'First Name', value: '{{lead.firstName}}' },
    { label: 'Last Name', value: '{{lead.lastName}}' },
    { label: 'Email', value: '{{lead.email}}' },
    { label: 'Phone', value: '{{lead.phone}}' },
  ]},
  { category: 'Company', items: [
    { label: 'Company Name', value: '{{companyName}}' },
    { label: 'Website', value: '{{company.website}}' },
    { label: 'Address', value: '{{company.address}}' },
  ]},
  { category: 'Offer', items: [
    { label: 'Title', value: '{{offer.title}}' },
    { label: 'Price', value: '{{offer.price}}' },
    { label: 'Discount', value: '{{offer.discount}}' },
    { label: 'Expiry Date', value: '{{offer.validUntil}}' },
  ]},
  { category: 'Employee', items: [
    { label: 'Sales Rep', value: '{{sender.firstName}} {{sender.lastName}}' },
    { label: 'Signature', value: '{{sender.signature}}' },
  ]},
];

const EmailComposer = ({ offer, lead, user, onClose, onSend }) => {
  const [subject, setSubject] = useState(`New Offer: ${offer?.title || ''}`);
  const [to, setTo] = useState(lead?.email || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [from, setFrom] = useState(user?.email || '');
  const [showFormatting, setShowFormatting] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const variablesRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Compose your email...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'email-image' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Underline,
    ],
    content: `<p>Hello ${lead?.name ? `{{lead.firstName}}` : 'Customer'},</p><p>We have a special offer for you!</p><p>${offer?.title || 'Your Offer'}<br />${offer?.description || ''}</p><p><strong>Price:</strong> $${offer?.price?.toLocaleString() || '0'}<br /><strong>Valid Until:</strong> ${offer?.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'N/A'}</p><p><a href="https://super-erp-frontend.vercel.app/pay/${offer?.paymentToken || 'sample-token'}">Pay Now</a></p><p>Best regards,<br />${user?.firstName || ''} ${user?.lastName || ''}</p>`,
    editorProps: {
      attributes: {
        class: 'email-editor-content',
        style: 'min-height: 400px; padding: 20px; outline: none; font-size: 14px; line-height: 1.6;',
      },
    },
  });

  const fetchTemplates = async () => {
    try {
      const { data } = await API.get('/templates');
      setTemplates(data.data || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (!editor) return;
    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      setSelectedText(editor.state.doc.textBetween(from, to, ' '));
    };
    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => { editor.off('selectionUpdate', handleSelectionUpdate); };
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (variablesRef.current && !variablesRef.current.contains(e.target)) {
        setShowVariables(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertVariable = (variable) => {
    if (!editor) return;
    editor.chain().focus().insertContent(variable).run();
    setShowVariables(false);
  };

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('blockType', type);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('blockType');
    if (!type || !editor) return;
    
    const blockHtml = getBlockHtml(type);
    if (blockHtml) {
      editor.chain().focus().insertContent(blockHtml).run();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getBlockHtml = (type) => {
    switch (type) {
      case 'header':
        return '<h2 style="font-size: 20px; font-weight: 600; margin: 16px 0;">Header Text</h2>';
      case 'text':
        return '<p style="margin: 8px 0;">Enter your text here...</p>';
      case 'image':
        return '<div style="text-align: center; margin: 16px 0;"><img src="https://via.placeholder.com/600x300" alt="Image" style="max-width: 100%; border-radius: 8px;" /></div>';
      case 'button':
        return '<div style="text-align: center; margin: 16px 0;"><a href="{{payLink}}" style="display: inline-block; background-color: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Pay Now</a></div>';
      case 'divider':
        return '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />';
      case 'spacer':
        return '<div style="height: 20px;"></div>';
      case 'offer-details':
        return '<div style="padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;"><h3 style="margin: 0 0 8px; font-size: 16px;">{{offer.title}}</h3><p style="margin: 0 0 8px; font-size: 14px; color: #374151;">{{offer.description}}</p><p style="margin: 0 0 4px; font-size: 14px;"><strong>Price:</strong> ${{offer.price}}</p><p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Valid Until:</strong> {{offer.validUntil}}</p></div>';
      case 'payment-link':
        return '<div style="text-align: center; margin: 16px 0;"><a href="{{payLink}}" style="display: inline-block; background-color: #2563eb; color: #fff; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Complete Your Payment</a></div>';
      case 'company-info':
        return '<div style="display: flex; align-items: center; gap: 12px; margin: 16px 0;"><div><h3 style="margin: 0; font-size: 16px;">{{companyName}}</h3><p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Offer from {{companyName}}</p></div></div>';
      default:
        return '';
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, { name: file.name, size: file.size, url: event.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const html = editor?.getHTML() || '';
      const text = editor?.getText() || '';
      const payload = {
        name: templateName,
        subject,
        blocks: [{ id: 'blk_1', type: 'html', content: html, styles: {}, settings: {} }],
        isDefault: false,
      };
      
      await API.post('/templates', payload);
      setSaveStatus('Saved');
      setSuccess('Template saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!to.trim()) {
      setError('Recipient is required');
      return;
    }
    setSending(true);
    setError('');
    try {
      await onSend?.({ to, subject, html: editor?.getHTML() || '' });
      setSuccess('Email sent successfully');
      setTimeout(() => onClose?.(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const getPreviewHtml = () => {
    return editor?.getHTML() || '<p>No content</p>';
  };

  if (!editor) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 12, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f9fa', zIndex: 1500 }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#5f6368' }}>←</button>
          <input
            className="form-input"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="Template name..."
            style={{ width: 200, fontSize: 13 }}
          />
          <button onClick={handleSaveTemplate} disabled={saving} className="btn btn-secondary btn-sm">
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saveStatus && <span style={{ fontSize: 12, color: '#188038' }}>{saveStatus}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handlePreview} className="btn btn-secondary btn-sm">Preview</button>
          <button onClick={handleSend} disabled={sending} className="btn btn-primary btn-sm">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        {showSidebar && (
          <div style={{ width: 240, background: '#fff', borderRight: '1px solid #e5e7eb', overflow: 'auto', padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5f6368', marginBottom: 8, textTransform: 'uppercase' }}>Components</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {BLOCK_TYPES.map(bt => (
                <div
                  key={bt.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, bt.type)}
                  style={{
                    padding: '10px 12px',
                    background: '#f8f9fa',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{bt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{bt.label}</div>
                    <div style={{ fontSize: 11, color: '#80868b' }}>{bt.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Compose Area */}
        <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
          {/* Compose Header */}
          <div style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#5f6368', width: 40 }}>From:</span>
              <select className="form-input" value={from} onChange={e => setFrom(e.target.value)} style={{ flex: 1, fontSize: 13 }}>
                <option value={from}>{from}</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#5f6368', width: 40 }}>To:</span>
              <input className="form-input" value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" style={{ flex: 1, fontSize: 13 }} />
            </div>
            {showCc && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#5f6368', width: 40 }}>CC:</span>
                <input className="form-input" value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@example.com" style={{ flex: 1, fontSize: 13 }} />
              </div>
            )}
            {showBcc && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#5f6368', width: 40 }}>BCC:</span>
                <input className="form-input" value={bcc} onChange={e => setBcc(e.target.value)} placeholder="bcc@example.com" style={{ flex: 1, fontSize: 13 }} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#5f6368', width: 40 }}>Subject:</span>
              <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" style={{ flex: 1, fontSize: 13 }} />
            </div>
            <div style={{ marginTop: 8, marginLeft: 40 }}>
              <button onClick={() => setShowCc(!showCc)} style={{ background: 'none', border: 'none', color: '#1A73E8', fontSize: 12, cursor: 'pointer' }}>Cc</button>
              <button onClick={() => setShowBcc(!showBcc)} style={{ background: 'none', border: 'none', color: '#1A73E8', fontSize: 12, cursor: 'pointer', marginLeft: 12 }}>Bcc</button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {showFormatting && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 24px', borderBottom: '1px solid #e5e7eb', background: '#f8f9fa', flexWrap: 'wrap' }}>
              <button onClick={() => editor.chain().focus().toggleBold().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: editor.isActive('bold') ? 'bold' : 'normal' }}>B</button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontStyle: editor.isActive('italic') ? 'italic' : 'normal' }}>I</button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', textDecoration: editor.isActive('underline') ? 'underline' : 'none' }}>U</button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', textDecoration: editor.isActive('strike') ? 'line-through' : 'none' }}>S</button>
              <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />
              <select onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb' }}>
                <option value="">Font</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
              <select onChange={e => editor.chain().focus().setFontSize(e.target.value + 'px').run()} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb' }}>
                <option value="">Size</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="24">24</option>
              </select>
              <input type="color" onChange={e => editor.chain().focus().setColor(e.target.value).run()} style={{ width: 24, height: 24, border: '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer' }} />
              <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />
              <button onClick={() => editor.chain().focus().setTextAlign('left').run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Left</button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Center</button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Right</button>
              <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>• List</button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>1. List</button>
              <button onClick={() => editor.chain().focus().toggleBlockquote().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Quote</button>
              <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Code</button>
              <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />
              <button onClick={() => { const url = prompt('Enter URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Link</button>
              <button onClick={() => { const url = prompt('Enter image URL:'); if (url) editor.chain().focus().setImage({ src: url }).run(); }} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Image</button>
              <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />
              <button onClick={() => editor.chain().focus().undo().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Undo</button>
              <button onClick={() => editor.chain().focus().redo().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Redo</button>
              <button onClick={() => editor.chain().focus().unsetAllMarks().run()} style={{ background: 'none', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Clear</button>
            </div>
          )}

          {/* Editor Body */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{ flex: 1, overflow: 'auto', padding: '0 24px 24px' }}
          >
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px', minHeight: 500, background: '#fff' }}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        {showProperties && selectedBlockType && (
          <div style={{ width: 300, background: '#fff', borderLeft: '1px solid #e5e7eb', overflow: 'auto', padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Properties</div>
            {selectedBlockType === 'button' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Text</label><input className="form-input" defaultValue="Pay Now" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">URL</label><input className="form-input" defaultValue="{{payLink}}" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Background Color</label><input type="color" defaultValue="#2563eb" style={{ width: 40, height: 32 }} /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Text Color</label><input type="color" defaultValue="#ffffff" style={{ width: 40, height: 32 }} /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Radius (px)</label><input type="number" defaultValue="8" className="form-input" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Padding</label><input className="form-input" defaultValue="12px 24px" /></div>
              </div>
            )}
            {selectedBlockType === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Font</label><select className="form-input"><option>Arial</option><option>Georgia</option></select></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Size (px)</label><input type="number" defaultValue="14" className="form-input" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Weight</label><select className="form-input"><option>Normal</option><option>Bold</option></select></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Color</label><input type="color" defaultValue="#374151" style={{ width: 40, height: 32 }} /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Alignment</label><select className="form-input"><option>Left</option><option>Center</option><option>Right</option></select></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Line Height</label><input type="number" defaultValue="1.6" step="0.1" className="form-input" /></div>
              </div>
            )}
            {selectedBlockType === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Image URL</label><input className="form-input" placeholder="https://..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Width (%)</label><input type="number" defaultValue="100" className="form-input" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Height</label><input className="form-input" placeholder="auto" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Border Radius (px)</label><input type="number" defaultValue="0" className="form-input" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Alt Text</label><input className="form-input" placeholder="Image description" /></div>
              </div>
            )}
            {selectedBlockType === 'header' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Text</label><input className="form-input" defaultValue="Header" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Font Size (px)</label><input type="number" defaultValue="20" className="form-input" /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Color</label><input type="color" defaultValue="#111827" style={{ width: 40, height: 32 }} /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Alignment</label><select className="form-input"><option>Left</option><option>Center</option><option>Right</option></select></div>
              </div>
            )}
            {selectedBlockType === 'divider' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Color</label><input type="color" defaultValue="#e5e7eb" style={{ width: 40, height: 32 }} /></div>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Thickness (px)</label><input type="number" defaultValue="1" className="form-input" /></div>
              </div>
            )}
            {selectedBlockType === 'spacer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}><label className="form-label">Height (px)</label><input type="number" defaultValue="20" className="form-input" /></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowSidebar(!showSidebar)} className="btn btn-secondary btn-sm">Blocks</button>
          <button onClick={() => setShowFormatting(!showFormatting)} className="btn btn-secondary btn-sm">Format</button>
          <button onClick={() => setShowVariables(!showVariables)} className="btn btn-secondary btn-sm">{'{}'} Variables</button>
          <button onClick={() => setShowAttachments(!showAttachments)} className="btn btn-secondary btn-sm">Attachments</button>
          <button onClick={() => setShowTemplates(true)} className="btn btn-secondary btn-sm">Templates</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSaveTemplate} className="btn btn-secondary btn-sm">Save Template</button>
          <button onClick={handleSend} disabled={sending} className="btn btn-primary btn-sm">{sending ? 'Sending...' : 'Send'}</button>
        </div>
      </div>

      {/* Variables Popup */}
      {showVariables && (
        <div ref={variablesRef} style={{ position: 'absolute', bottom: 60, left: 280, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: 280, maxHeight: 300, overflow: 'auto', zIndex: 100 }}>
          <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
            <input className="form-input" placeholder="Search variables..." autoFocus />
          </div>
          {VARIABLES.map(cat => (
            <div key={cat.category} style={{ padding: '8px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#5f6368', marginBottom: 4 }}>{cat.category}</div>
              {cat.items.map(item => (
                <div key={item.value} onClick={() => insertVariable(item.value)} style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: 4, fontSize: 13 }} onMouseEnter={e => e.target.style.background = '#f8f9fa'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                  {item.label} <code style={{ fontSize: 11, color: '#1A73E8' }}>{item.value}</code>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Template Drawer */}
      {showTemplates && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: 320, height: '100%', background: '#fff', borderLeft: '1px solid #e5e7eb', boxShadow: '-4px 0 12px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'auto' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Templates</div>
            <button onClick={() => setShowTemplates(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: 12 }}>
            <button className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: 12 }}>+ New Template</button>
            <input className="form-input" placeholder="Search templates..." style={{ marginBottom: 12 }} />
            {templates.length === 0 && <p style={{ fontSize: 13, color: '#5f6368', textAlign: 'center' }}>No templates yet</p>}
            {templates.map(t => (
              <div key={t._id} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }} onMouseEnter={e => e.target.style.borderColor = '#1A73E8'} onMouseLeave={e => e.target.style.borderColor = '#e5e7eb'}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>{t.subject}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowPreview(false)}>
          <div style={{ background: '#fff', borderRadius: 12, width: '90%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto', padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Preview</h3>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: '#111827', padding: '12px 16px', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                {subject}
              </div>
              <div style={{ padding: 20, background: '#fff', minHeight: 300 }}>
                <div dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Bar */}
      {showAttachments && (
        <div style={{ position: 'absolute', bottom: 60, right: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: 320, maxHeight: 300, overflow: 'auto', zIndex: 100, padding: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Attachments</div>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: 8 }}>+ Upload Files</button>
          {attachments.map((att, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8f9fa', borderRadius: 6, marginBottom: 4 }}>
              <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{att.name}</div>
              <button onClick={() => removeAttachment(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Autosave Indicator */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, fontSize: 12, color: '#5f6368', background: '#fff', padding: '4px 12px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {saveStatus || 'Ready'}
      </div>
    </div>
  );
};

export default EmailComposer;
