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

// SVG Icon Helpers
const Icon = ({ path, size = 18, color = 'currentColor', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {path}
  </svg>
);

const Icons = {
  Send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  Paperclip: <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />,
  Link: <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />,
  Template: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />,
  Eye: <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z" />,
  Save: <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" />,
  Trash: <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />,
  Minimize: <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />,
  Maximize: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  Close: <path d="M18 6L6 18M6 6l12 12" />,
  Variable: <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
  Bold: <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />,
  Italic: <path d="M19 4h-9M14 20H5M15 4L9 20" />,
  Underline: <path d="M6 3v7a6 6 0 0012 0V3M4 21h16" />,
  Strikethrough: <path d="M17.5 12H6.5M16 6a4 4 0 00-7 1.5M8 18a4 4 0 007-1.5" />,
  AlignLeft: <path d="M17 10H3M21 6H3M21 14H3M17 18H3" />,
  AlignCenter: <path d="M18 10H6M21 6H3M21 14H3M18 18H6" />,
  AlignRight: <path d="M21 10H7M21 6H3M21 14H3M21 18H7" />,
  ListBullet: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  ListOrdered: <path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M4 18h3M4 14h2.5" />,
  Quote: <path d="M3 21c3 0 7-1 7-8V5H3v8h4c0 3-2 5-4 5zm11 0c3 0 7-1 7-8V5h-7v8h4c0 3-2 5-4 5z" />,
  Code: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  Undo: <path d="M3 7v6h6M3 13L9 7c5-5 13-3 14 4 1 5-3 10-9 10H9" />,
  Redo: <path d="M21 7v6h-6M21 13l-6-6c-5-5-13-3-14 4-1 5 3 10 9 10h5" />,
  ClearFormat: <path d="M4 7h16M10 11l-6 6M14 11l6 6M12 4v16" />,
  Blocks: <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />,
  ChevronDown: <path d="M6 9l6 6 6-6" />,
  Smile: <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />,
  Check: <path d="M20 6L9 17l-5-5" />,
  Smartphone: <path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm7 14h.01" />,
  Monitor: <path d="M20 3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2zm-8 14v4m-4 0h8" />,
};

const BLOCK_TYPES = [
  { type: 'header', label: 'Title Header', icon: 'H', description: 'Styled title banner' },
  { type: 'offer-details', label: 'Offer Summary Card', icon: '📋', description: 'Interactive proposal box' },
  { type: 'payment-link', label: 'Pay Now Button', icon: '💳', description: 'Direct checkout action' },
  { type: 'company-info', label: 'Company Branding', icon: '🏢', description: 'Logo & signature header' },
  { type: 'text', label: 'Text Paragraph', icon: '¶', description: 'Standard body text' },
  { type: 'button', label: 'Custom CTA Button', icon: '🔘', description: 'Clickable action button' },
  { type: 'image', label: 'Image Box', icon: '🖼', description: 'Image placeholder or URL' },
  { type: 'divider', label: 'Divider Line', icon: '—', description: 'Clean separator line' },
  { type: 'spacer', label: 'Spacer', icon: '↕', description: 'Vertical spacing gap' },
];

const VARIABLES = [
  {
    category: 'Lead Information',
    items: [
      { label: 'Full Name', value: '{{lead.name}}' },
      { label: 'First Name', value: '{{lead.firstName}}' },
      { label: 'Last Name', value: '{{lead.lastName}}' },
      { label: 'Email Address', value: '{{lead.email}}' },
      { label: 'Phone Number', value: '{{lead.phone}}' },
    ],
  },
  {
    category: 'Offer Details',
    items: [
      { label: 'Offer Title', value: '{{offer.title}}' },
      { label: 'Offer Price', value: '{{offer.price}}' },
      { label: 'Offer Expiry', value: '{{offer.validUntil}}' },
      { label: 'Payment Link', value: '{{payLink}}' },
    ],
  },
  {
    category: 'Company & Sender',
    items: [
      { label: 'Company Name', value: '{{companyName}}' },
      { label: 'Website', value: '{{company.website}}' },
      { label: 'Sender Name', value: '{{sender.firstName}} {{sender.lastName}}' },
    ],
  },
];

const EMOJIS = ['😊', '👍', '💼', '📊', '🤝', '🚀', '✅', '⭐', '✉️', '📌', '💡', '🎉'];

const EmailComposer = ({ offer, lead, user, onClose, onSend }) => {
  const [subject, setSubject] = useState(`Offer Proposal: ${offer?.title || 'Custom Service'}`);
  const [to, setTo] = useState(lead?.email || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [from, setFrom] = useState(user?.smtpUser || user?.email || 'sales@company.com');
  
  // UI Panels & Modes
  const [showFormatting, setShowFormatting] = useState(true);
  const [showVariables, setShowVariables] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [showSidePane, setShowSidePane] = useState(false);
  const [sidePaneTab, setSidePaneTab] = useState('blocks'); // 'blocks' | 'variables'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);
  const variablesRef = useRef(null);
  const emojiRef = useRef(null);

  const initialContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; color: #1F2937; line-height: 1.6;">
      <p style="font-size: 15px; margin-bottom: 16px;">Dear <strong>${lead?.name ? '{{lead.firstName}}' : 'Valued Client'}</strong>,</p>
      
      <p style="font-size: 15px; margin-bottom: 20px;">
        We are pleased to present our proposal for <strong>${offer?.title || 'your requested services'}</strong>. Below are the complete offer details for your review:
      </p>

      <!-- Offer Card Block -->
      <div style="background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%); border: 1px solid #BFDBFE; border-radius: 12px; padding: 24px; margin: 24px 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; tracking: 1px; color: #2563EB; background: #DBEAFE; padding: 4px 8px; border-radius: 4px;">Official Offer</span>
            <h3 style="font-size: 20px; font-weight: 700; color: #1E3A8A; margin: 8px 0 4px 0;">${offer?.title || 'Custom Service Package'}</h3>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 800; color: #1E40AF;">$${offer?.price ? Number(offer.price).toLocaleString() : '0.00'}</div>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #4B5563; margin: 0 0 16px 0;">
          ${offer?.description || 'Comprehensive service plan tailored specifically for your business requirements.'}
        </p>
        
        <div style="display: flex; gap: 24px; font-size: 13px; color: #64748B; border-top: 1px dashed #CBD5E1; padding-top: 12px;">
          <div><strong>Valid Until:</strong> ${offer?.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'Next 14 Days'}</div>
          <div><strong>Offer ID:</strong> #${offer?._id ? offer._id.slice(-6).toUpperCase() : 'OFFER-01'}</div>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="https://super-erp-frontend.vercel.app/pay/${offer?.paymentToken || 'token'}" style="display: inline-block; background: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            Review & Pay Online →
          </a>
        </div>
      </div>

      <p style="font-size: 15px; margin-bottom: 20px;">
        Should you have any questions or require custom adjustments, please reply directly to this email or contact us at any time.
      </p>

      <div style="margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 14px; color: #4B5563;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 4px 0 0 0; font-weight: 700; color: #1F2937;">${user?.firstName || 'Sales'} ${user?.lastName || 'Team'}</p>
        <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748B;">Super CRM Solutions</p>
      </div>
    </div>
  `;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Write your email body here...' }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ HTMLAttributes: { class: 'email-image' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      TextStyle,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Underline,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'gmail-editor-content',
        style: 'min-height: 380px; padding: 24px; outline: none; font-size: 14px; line-height: 1.6; background: #ffffff; color: #1F2937;',
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
    const handleClickOutside = (e) => {
      if (variablesRef.current && !variablesRef.current.contains(e.target)) {
        setShowVariables(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertVariable = (variable) => {
    if (!editor) return;
    editor.chain().focus().insertContent(` ${variable} `).run();
    setShowVariables(false);
  };

  const insertEmoji = (emoji) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  const getBlockHtml = (type) => {
    switch (type) {
      case 'header':
        return '<div style="background: #1E3A8A; color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 16px 0;"><h2 style="margin: 0; font-size: 22px; font-weight: 700;">Special Proposal for {{lead.firstName}}</h2></div>';
      case 'text':
        return '<p style="font-size: 15px; color: #374151; margin: 12px 0;">Insert your text detailed notes here...</p>';
      case 'image':
        return '<div style="text-align: center; margin: 16px 0;"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Proposal Image" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" /></div>';
      case 'button':
        return '<div style="text-align: center; margin: 20px 0;"><a href="{{payLink}}" style="display: inline-block; background: #2563EB; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Accept & Proceed</a></div>';
      case 'divider':
        return '<hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />';
      case 'spacer':
        return '<div style="height: 24px;"></div>';
      case 'offer-details':
        return `<div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin: 20px 0;"><h4 style="margin: 0 0 8px 0; color: #1E293B; font-size: 16px;">{{offer.title}}</h4><p style="margin: 0 0 12px 0; color: #64748B; font-size: 14px;">Official Offer details and parameters</p><div style="font-size: 18px; font-weight: 700; color: #2563EB;">Price: \${{offer.price}}</div></div>`;
      case 'payment-link':
        return '<div style="text-align: center; margin: 20px 0;"><a href="{{payLink}}" style="display: inline-block; background: #10B981; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">💳 Pay Now via Secure Portal</a></div>';
      case 'company-info':
        return '<div style="padding: 16px; border-left: 4px solid #2563EB; background: #F1F5F9; margin: 20px 0;"><h4 style="margin: 0; color: #0F172A; font-size: 15px;">{{companyName}}</h4><p style="margin: 4px 0 0 0; font-size: 13px; color: #475569;">Verified Partner & Enterprise Provider</p></div>';
      default:
        return '';
    }
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments((prev) => [
          ...prev,
          { name: file.name, size: file.size, type: file.type, url: event.target.result },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please provide a name for this email template');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const html = editor?.getHTML() || '';
      const payload = {
        name: templateName,
        subject,
        blocks: [{ id: `blk_${Date.now()}`, type: 'html', content: html }],
      };
      await API.post('/templates', payload);
      setSaveStatus('Template Saved');
      setSuccess('Template saved successfully!');
      fetchTemplates();
      setTimeout(() => {
        setSaveStatus('');
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (tmpl) => {
    if (!editor) return;
    if (tmpl.subject) setSubject(tmpl.subject);
    let htmlContent = '';
    if (tmpl.blocks && tmpl.blocks.length > 0) {
      htmlContent = tmpl.blocks.map((b) => b.content).join('');
    } else if (tmpl.html) {
      htmlContent = tmpl.html;
    }
    if (htmlContent) {
      editor.commands.setContent(htmlContent);
    }
    setShowTemplates(false);
  };

  const handleSend = async () => {
    if (!to.trim()) {
      setError('Please specify at least one recipient email.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const emailPayload = {
        to,
        cc,
        bcc,
        subject,
        from,
        html: editor?.getHTML() || '',
        attachments,
      };
      await onSend?.(emailPayload);
      setSuccess('Email sent successfully!');
      setTimeout(() => {
        onClose?.();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  if (!editor) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ background: '#ffffff', padding: '32px 48px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 36, height: 36, borderTopColor: '#2563EB' }} />
          <p style={{ fontWeight: 600, color: '#1E293B', margin: 0 }}>Initializing Email Composer...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: isMaximized ? 0 : 'auto 24px 0 auto',
        top: isMaximized ? 0 : 'auto',
        bottom: 0,
        right: isMaximized ? 0 : 24,
        width: isMaximized ? '100vw' : '900px',
        maxWidth: '100vw',
        height: isMaximized ? '100vh' : '720px',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRadius: isMaximized ? 0 : '16px 16px 0 0',
        boxShadow: isMaximized ? 'none' : '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.1)',
        zIndex: 9000,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* 1. OUTLOOK / GMAIL STYLE WINDOW HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#ffffff',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'rgba(37, 99, 235, 0.3)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA',
            }}
          >
            <Icon path={Icons.Send} size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}>
              {offer?.title ? `New Offer Email — ${offer.title}` : 'Compose New Offer Email'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              SMTP Ready ({from})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Side Pane Toggle */}
          <button
            onClick={() => setShowSidePane(!showSidePane)}
            title="Toggle Components & Variables"
            style={{
              background: showSidePane ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: 'none',
              color: '#94A3B8',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = showSidePane ? '#ffffff' : '#94A3B8')}
          >
            <Icon path={Icons.Blocks} size={15} />
            <span>Blocks</span>
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Restore Window' : 'Maximize Window'}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <Icon path={isMaximized ? Icons.Minimize : Icons.Maximize} size={16} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon path={Icons.Close} size={18} />
          </button>
        </div>
      </div>

      {/* ALERT NOTIFICATIONS */}
      {error && (
        <div style={{ background: '#FEF2F2', color: '#991B1B', borderBottom: '1px solid #FCA5A5', padding: '8px 16px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}
      {success && (
        <div style={{ background: '#ECFDF5', color: '#065F46', borderBottom: '1px solid #6EE7B7', padding: '8px 16px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✨ {success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* 2. RECIPIENT FIELDS BAR (GMAIL / OUTLOOK CLEAN STYLING) */}
      <div style={{ borderBottom: '1px solid #E2E8F0', background: '#FAFAFA' }}>
        {/* From Row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ width: 64, fontSize: 13, fontWeight: 600, color: '#64748B' }}>From:</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1E293B', background: '#E2E8F0', padding: '2px 10px', borderRadius: '12px' }}>
              {from}
            </span>
          </div>
        </div>

        {/* To Row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{ width: 64, fontSize: 13, fontWeight: 600, color: '#64748B' }}>To:</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            {lead && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#DBEAFE', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '2px 10px', borderRadius: '16px', fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#2563EB', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {lead.name ? lead.name[0].toUpperCase() : 'L'}
                </span>
                <span>{lead.name || 'Lead'}</span>
              </div>
            )}
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                color: '#0F172A',
                padding: '4px 0',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!showCc && (
              <button
                onClick={() => setShowCc(true)}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                onClick={() => setShowBcc(true)}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
              >
                Bcc
              </button>
            )}
          </div>
        </div>

        {/* CC Row */}
        {showCc && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ width: 64, fontSize: 13, fontWeight: 600, color: '#64748B' }}>Cc:</span>
            <input
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#0F172A' }}
            />
            <button onClick={() => { setCc(''); setShowCc(false); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* BCC Row */}
        {showBcc && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ width: 64, fontSize: 13, fontWeight: 600, color: '#64748B' }}>Bcc:</span>
            <input
              type="email"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc@example.com"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#0F172A' }}
            />
            <button onClick={() => { setBcc(''); setShowBcc(false); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Subject Row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px' }}>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: 600,
              color: '#0F172A',
              padding: '4px 0',
            }}
          />
        </div>
      </div>

      {/* 3. RICH TEXT FORMATTING TOOLBAR (OUTLOOK / GMAIL DOCKED BAR) */}
      {showFormatting && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '6px 16px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            userSelect: 'none',
          }}
        >
          {/* Undo / Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
            style={{ background: 'none', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', opacity: editor.can().undo() ? 1 : 0.4 }}
          >
            <Icon path={Icons.Undo} size={15} color="#475569" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
            style={{ background: 'none', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', opacity: editor.can().redo() ? 1 : 0.4 }}
          >
            <Icon path={Icons.Redo} size={15} color="#475569" />
          </button>

          <div style={{ width: 1, height: 18, background: '#CBD5E1', margin: '0 4px' }} />

          {/* Font Family Selector */}
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            style={{ border: '1px solid #CBD5E1', borderRadius: '4px', background: '#fff', fontSize: 12, padding: '3px 6px', outline: 'none', cursor: 'pointer', color: '#334155' }}
          >
            <option value="">Sans Serif</option>
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Monospace</option>
          </select>

          <div style={{ width: 1, height: 18, background: '#CBD5E1', margin: '0 4px' }} />

          {/* Text Formatting Styles */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
            style={{
              background: editor.isActive('bold') ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.Bold} size={15} color={editor.isActive('bold') ? '#2563EB' : '#475569'} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
            style={{
              background: editor.isActive('italic') ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.Italic} size={15} color={editor.isActive('italic') ? '#2563EB' : '#475569'} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
            style={{
              background: editor.isActive('underline') ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.Underline} size={15} color={editor.isActive('underline') ? '#2563EB' : '#475569'} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            style={{
              background: editor.isActive('strike') ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.Strikethrough} size={15} color={editor.isActive('strike') ? '#2563EB' : '#475569'} />
          </button>

          {/* Color Picker Input */}
          <label title="Text Color" style={{ display: 'flex', alignItems: 'center', padding: '4px', cursor: 'pointer' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#2563EB', textDecoration: 'underline' }}>A</span>
            <input
              type="color"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
            />
          </label>

          <div style={{ width: 1, height: 18, background: '#CBD5E1', margin: '0 4px' }} />

          {/* Alignments */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
            style={{
              background: editor.isActive({ textAlign: 'left' }) ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.AlignLeft} size={15} color="#475569" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
            style={{
              background: editor.isActive({ textAlign: 'center' }) ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.AlignCenter} size={15} color="#475569" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
            style={{
              background: editor.isActive({ textAlign: 'right' }) ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.AlignRight} size={15} color="#475569" />
          </button>

          <div style={{ width: 1, height: 18, background: '#CBD5E1', margin: '0 4px' }} />

          {/* Lists & Quote */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bulleted List"
            style={{
              background: editor.isActive('bulletList') ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.ListBullet} size={15} color="#475569" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            style={{
              background: editor.isActive('orderedList') ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.ListOrdered} size={15} color="#475569" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote Block"
            style={{
              background: editor.isActive('blockquote') ? '#DBEAFE' : 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Icon path={Icons.Quote} size={15} color="#475569" />
          </button>

          <div style={{ width: 1, height: 18, background: '#CBD5E1', margin: '0 4px' }} />

          {/* Clear formatting */}
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clear Formatting"
            style={{ background: 'none', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
          >
            <Icon path={Icons.ClearFormat} size={15} color="#64748B" />
          </button>
        </div>
      )}

      {/* 4. MAIN EDITOR CONTENT AREA + SIDE PANE */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Editor Box */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <EditorContent editor={editor} style={{ flex: 1 }} />

          {/* Attached Files Badges Container */}
          {attachments.length > 0 && (
            <div style={{ padding: '12px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {attachments.map((att, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#ffffff',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: 12,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <Icon path={Icons.Paperclip} size={14} color="#2563EB" />
                  <div style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: '#1E293B' }}>
                    {att.name}
                  </div>
                  <span style={{ fontSize: 10, color: '#94A3B8' }}>({formatFileSize(att.size)})</span>
                  <button
                    onClick={() => removeAttachment(i)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 2, fontSize: 14, fontWeight: 'bold' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDE PANE FOR BLOCKS & DYNAMIC VARIABLES */}
        {showSidePane && (
          <div
            style={{
              width: 280,
              background: '#F8FAFC',
              borderLeft: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
            }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#ffffff' }}>
              <button
                onClick={() => setSidePaneTab('blocks')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: sidePaneTab === 'blocks' ? '2px solid #2563EB' : 'none',
                  color: sidePaneTab === 'blocks' ? '#2563EB' : '#64748B',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                Layout Blocks
              </button>
              <button
                onClick={() => setSidePaneTab('variables')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: sidePaneTab === 'variables' ? '2px solid #2563EB' : 'none',
                  color: sidePaneTab === 'variables' ? '#2563EB' : '#64748B',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                Variables {'{ }'}
              </button>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {sidePaneTab === 'blocks' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>
                    Drag & Drop Blocks
                  </div>
                  {BLOCK_TYPES.map((bt) => (
                    <div
                      key={bt.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, bt.type)}
                      onClick={() => {
                        const blockHtml = getBlockHtml(bt.type);
                        if (blockHtml && editor) editor.chain().focus().insertContent(blockHtml).run();
                      }}
                      style={{
                        padding: '10px 12px',
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.15s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#93C5FD';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{bt.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{bt.label}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{bt.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {VARIABLES.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>
                        {cat.category}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {cat.items.map((item) => (
                          <div
                            key={item.value}
                            onClick={() => insertVariable(item.value)}
                            style={{
                              padding: '6px 10px',
                              background: '#ffffff',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              justify: 'space-between',
                              alignItems: 'center',
                              fontSize: 12,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#EFF6FF')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                          >
                            <span style={{ fontWeight: 500, color: '#334155' }}>{item.label}</span>
                            <code style={{ fontSize: 10, background: '#DBEAFE', color: '#1E40AF', padding: '2px 4px', borderRadius: '4px' }}>
                              {item.value}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. GMAIL / OUTLOOK FOOTER ACTION BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: '12px 20px',
          background: '#ffffff',
          borderTop: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        {/* Left Side: Send Button & Action Quick Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: sending ? '#94A3B8' : '#2563EB',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: 14,
              cursor: sending ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease-in-out',
            }}
            onMouseEnter={(e) => !sending && (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={(e) => !sending && (e.currentTarget.style.background = '#2563EB')}
          >
            <Icon path={Icons.Send} size={16} />
            <span>{sending ? 'Sending...' : 'Send'}</span>
          </button>

          {/* Formatting Toggle */}
          <button
            onClick={() => setShowFormatting(!showFormatting)}
            title="Formatting Options"
            style={{
              background: showFormatting ? '#EFF6FF' : 'transparent',
              border: '1px solid',
              borderColor: showFormatting ? '#BFDBFE' : 'transparent',
              color: showFormatting ? '#2563EB' : '#64748B',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 14 }}>A</span>
          </button>

          {/* File Attachment */}
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach Files"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon path={Icons.Paperclip} size={18} />
          </button>

          {/* Insert Link */}
          <button
            onClick={() => {
              const url = prompt('Enter website link URL:');
              if (url && editor) editor.chain().focus().setLink({ href: url }).run();
            }}
            title="Insert Link"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon path={Icons.Link} size={18} />
          </button>

          {/* Emoji Picker */}
          <div style={{ position: 'relative' }} ref={emojiRef}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Insert Emoji"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Icon path={Icons.Smile} size={18} />
            </button>

            {showEmojiPicker && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 44,
                  left: 0,
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  padding: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 6,
                  zIndex: 100,
                }}
              >
                {EMOJIS.map((emo) => (
                  <button
                    key={emo}
                    onClick={() => insertEmoji(emo)}
                    style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 6, borderRadius: 6 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Templates Launcher */}
          <button
            onClick={() => setShowTemplates(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#334155',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          >
            <Icon path={Icons.Template} size={14} color="#2563EB" />
            <span>Templates</span>
          </button>
        </div>

        {/* Right Side Actions: Preview, Save, Trash */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Live Preview Button */}
          <button
            onClick={() => setShowPreview(true)}
            title="Live Preview"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid #E2E8F0',
              color: '#475569',
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon path={Icons.Eye} size={14} />
            <span>Preview</span>
          </button>

          {/* Save Template Button */}
          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            title="Save as Template"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid #E2E8F0',
              color: '#475569',
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon path={Icons.Save} size={14} />
            <span>{saving ? 'Saving...' : 'Save Template'}</span>
          </button>

          {/* Discard / Close */}
          <button
            onClick={onClose}
            title="Discard Draft"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF4444';
              e.currentTarget.style.background = '#FEF2F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748B';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon path={Icons.Trash} size={18} />
          </button>
        </div>
      </div>

      {/* 6. TEMPLATES DRAWER MODAL */}
      {showTemplates && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 999,
          }}
          onClick={() => setShowTemplates(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360,
              height: '100%',
              background: '#ffffff',
              boxShadow: '-10px 0 25px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon path={Icons.Template} size={18} color="#2563EB" />
                <span>Email Templates</span>
              </div>
              <button onClick={() => setShowTemplates(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#64748B', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Template Name..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: 13, outline: 'none' }}
                />
                <button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  style={{ width: '100%', marginTop: 8, background: '#2563EB', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  Save Current Email as Template
                </button>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8 }}>
                Saved Templates ({templates.length})
              </div>

              {templates.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                  No saved templates found. Create and save your first template!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl._id || tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl)}
                      style={{
                        padding: 12,
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2563EB';
                        e.currentTarget.style.background = '#EFF6FF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = '#F8FAFC';
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1E293B' }}>{tmpl.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Subject: {tmpl.subject || 'No Subject'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. LIVE PREVIEW MODAL (DESKTOP / MOBILE RESPONSIVE PREVIEW) */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#F1F5F9',
              borderRadius: '16px',
              width: previewDevice === 'mobile' ? '420px' : '840px',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', background: '#1E293B', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon path={Icons.Eye} size={18} color="#60A5FA" />
                <span>Email Client Live Preview</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Switch view */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: 2, borderRadius: 8 }}>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    style={{
                      background: previewDevice === 'desktop' ? '#2563EB' : 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Icon path={Icons.Monitor} size={14} /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    style={{
                      background: previewDevice === 'mobile' ? '#2563EB' : 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Icon path={Icons.Smartphone} size={14} /> Mobile
                  </button>
                </div>
                <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 24, cursor: 'pointer' }}>×</button>
              </div>
            </div>

            {/* Email Container Mockup */}
            <div style={{ flex: 1, overflowY: 'auto', padding: previewDevice === 'mobile' ? 16 : 32, display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '100%',
                  background: '#ffffff',
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Email Header Bar */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#FAFAFA' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{subject}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    From: <strong style={{ color: '#334155' }}>{from}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    To: <strong style={{ color: '#334155' }}>{to}</strong>
                  </div>
                </div>

                {/* Email Content Body */}
                <div
                  style={{ padding: 24, flex: 1 }}
                  dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '<p>No content available</p>' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailComposer;
