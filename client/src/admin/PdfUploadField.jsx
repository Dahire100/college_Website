import React, { useState, useRef } from 'react';
import { FileText, Upload, X, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function PdfUploadField({
  label = 'Official Document / PDF Upload',
  value = '',
  pdfName = '',
  onChange,
  onToast,
  helperText = 'Upload official PDF syllabus, prospectus, circular, or academic brochure (Max 10MB)'
}) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      onToast?.('Please upload a valid PDF document (.pdf)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onToast?.('PDF size exceeds 10MB limit. Please compress or choose a smaller file.', 'error');
      return;
    }

    setUploading(true);
    onToast?.(`Uploading ${file.name}...`);
    try {
      const res = await api.upload(file, 'documents');
      if (res?.file?.url) {
        onChange(res.file.url, file.name);
        onToast?.('PDF document uploaded successfully!', 'success');
      } else {
        throw new Error('Upload succeeded but server did not return file URL');
      }
    } catch (err) {
      onToast?.(err.message || 'PDF upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onToast?.('PDF attachment removed');
  };

  const displayName = pdfName || (value ? value.split('/').pop() : 'Attached Document.pdf');

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <label className="simple-label" style={{ marginBottom: 0, fontWeight: 700, color: '#1F2937' }}>
          📄 {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(prev => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563EB',
            fontSize: '0.75rem',
            cursor: 'pointer',
            padding: '2px 4px',
            textDecoration: 'underline'
          }}
        >
          {showUrlInput ? 'Switch to File Upload' : 'Paste Direct PDF URL'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
          }
        }}
      />

      {/* If a PDF is already attached */}
      {value ? (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: '#DC2626',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
            }}>
              <FileText size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#991B1B',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                <CheckCircle2 size={13} />
                <span>PDF Document attached & ready for visitors</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                background: '#FFFFFF',
                color: '#DC2626',
                border: '1px solid #FCA5A5',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={13} /> Preview
            </a>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                background: '#FFFFFF',
                color: '#374151',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Upload size={13} /> Replace
            </button>

            <button
              type="button"
              onClick={handleRemove}
              title="Remove PDF"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.4rem',
                background: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #F87171',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : showUrlInput ? (
        <div>
          <input
            type="text"
            className="simple-input"
            placeholder="Paste direct PDF URL (e.g. /uploads/syllabus-2026.pdf or https://...)"
            value={value}
            onChange={(e) => onChange(e.target.value, e.target.value.split('/').pop() || 'Document.pdf')}
          />
          <div className="simple-hint" style={{ marginTop: '0.3rem' }}>
            Enter the public link to the PDF document.
          </div>
        </div>
      ) : (
        /* Dropzone for PDF upload */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragOver ? '2px dashed #DC2626' : '2px dashed #CBD5E1',
            borderRadius: '10px',
            background: isDragOver ? '#FEF2F2' : '#F8FAFC',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            {uploading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid #FCA5A5', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <FileText size={24} />
            )}
          </div>

          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.25rem' }}>
            {uploading ? 'Uploading PDF Document...' : 'Click to Upload PDF or Drag & Drop here'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            {helperText}
          </div>
        </div>
      )}
    </div>
  );
}
