import React, { useState, useRef } from 'react';
import { Upload, X, Image, FileText, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function ImageUploadField({
  label,
  value,
  onChange,
  onToast,
  aspectRatio = 'wide', // 'wide' (16/9), 'square' (1/1), 'standard' (4/3), 'auto'
  helperText = 'Upload an image from your computer (JPG, PNG, WebP up to 10MB)',
  required = false,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif',
  category = 'general',
  fileType = 'image' // 'image' or 'document'
}) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    if (fileType === 'image' && !file.type.startsWith('image/')) {
      onToast?.('Please upload a valid image file (PNG, JPG, WebP, SVG)', 'error');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      onToast?.('File size exceeds 12MB limit. Please choose a smaller file.', 'error');
      return;
    }

    setUploading(true);
    onToast?.(`Uploading ${file.name}...`);
    try {
      const res = await api.upload(file, category);
      if (res?.file?.url) {
        onChange(res.file.url);
        onToast?.('File uploaded successfully from computer!', 'success');
      } else {
        throw new Error('Upload succeeded but server did not return file URL');
      }
    } catch (err) {
      onToast?.(err.message || 'Upload failed. Please try again.', 'error');
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

  const getAspectStyle = () => {
    if (aspectRatio === 'square') return { width: '120px', height: '120px', margin: '0.5rem auto', borderRadius: '8px' };
    if (aspectRatio === 'wide') return { width: '100%', height: '160px' };
    if (aspectRatio === 'standard') return { width: '100%', height: '140px' };
    return { width: '100%', maxHeight: '180px' };
  };

  const fileName = value ? value.split('/').pop().split('?')[0] : '';

  return (
    <div style={{ marginBottom: '0.9rem' }}>
      {/* Label and Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <label className="simple-label" style={{ margin: 0, fontWeight: 600, color: '#1E293B', fontSize: '0.84rem' }}>
          {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
        {value && (
          <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={12} /> Image Attached
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
          }
          e.target.value = '';
        }}
      />

      {/* When an Image / File is present */}
      {value ? (
        <div
          style={{
            border: '1.5px solid #CBD5E1',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#F8FAFC',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          {fileType === 'image' ? (
            <div
              style={{
                position: 'relative',
                background: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                ...getAspectStyle()
              }}
            >
              <img
                src={value}
                alt={label || 'Uploaded'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: aspectRatio === 'square' ? 'contain' : 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {uploading && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <RefreshCw size={20} className="spin-animation" />
                  Uploading new photo...
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F1F5F9' }}>
              <FileText size={26} color="#2563EB" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fileName}
                </div>
                <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2563EB' }}>
                  View Document ↗
                </a>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div
            style={{
              padding: '0.55rem 0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={fileName}
              >
                📎 {fileName}
              </div>
              <div style={{ fontSize: '0.69rem', color: '#94A3B8', marginTop: '0.1rem' }}>
                Stored locally on server
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={12} /> Change Image
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onClick={() => onChange('')}
                disabled={uploading}
                title="Remove image"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? '#002147' : '#CBD5E1'}`,
            borderRadius: '8px',
            padding: '1.25rem 1rem',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            background: isDragOver ? '#EFF6FF' : '#F8FAFC',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#EEF2FF',
              color: '#002147',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {uploading ? (
              <RefreshCw size={18} className="spin-animation" />
            ) : fileType === 'image' ? (
              <Upload size={18} />
            ) : (
              <FileText size={18} />
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#002147' }}>
              {uploading
                ? 'Uploading file to server...'
                : isDragOver
                ? 'Drop the file to upload'
                : 'Upload Image from Computer'}
            </span>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.73rem', color: '#64748B' }}>
              {helperText}
            </p>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            style={{
              fontSize: '0.76rem',
              padding: '0.3rem 0.75rem',
              marginTop: '0.2rem',
              pointerEvents: 'none'
            }}
          >
            Browse Computer Files
          </button>
        </div>
      )}

      {/* Hidden/Collapsed details for manual URL override */}
      <details
        open={showUrlFallback}
        onToggle={(e) => setShowUrlFallback(e.target.open)}
        style={{ marginTop: '0.35rem' }}
      >
        <summary
          style={{
            fontSize: '0.7rem',
            color: '#94A3B8',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {showUrlFallback ? 'Hide URL input' : 'Or paste external image URL'}
        </summary>
        <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.4rem' }}>
          <input
            type="text"
            className="simple-input"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
            placeholder="https://images.unsplash.com/..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => onChange('')}
            >
              Clear
            </button>
          )}
        </div>
      </details>
    </div>
  );
}
