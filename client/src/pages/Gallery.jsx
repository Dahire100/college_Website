import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, ZoomIn, Eye, Sparkles, Filter, X, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function Gallery({ settings = {} }) {
  const [items, setItems] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await api.get('/api/v1/public/gallery');
        setItems(res.data || []);
      } catch (err) {
        console.error('Failed to load gallery items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];

  const displayedItems = filteredCategory === 'All' 
    ? items 
    : items.filter(i => i.category?.toLowerCase() === filteredCategory.toLowerCase());

  return (
    <div className="gallery-page">
      {/* Page Header */}
      <section className="page-hero" style={{ background: 'linear-gradient(135deg, #0B2545, #133E68)', color: '#FFFFFF', padding: '4.5rem 0 3.5rem 0' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)', marginBottom: '1rem' }}>
            <Sparkles size={13} /> Visual Campus Showcase & Image Sections
          </span>
          <h1 style={{ fontSize: '2.75rem', color: '#FFFFFF', marginBottom: '1rem', lineHeight: 1.2 }}>
            Campus Life, Labs & Milestones
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#CBD5E1', maxWidth: '750px', lineHeight: 1.6 }}>
            Explore our high-performance computational facilities, interactive smart classrooms, national championships, and vibrant cultural community.
          </p>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilteredCategory(cat)}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  background: filteredCategory === cat ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.1)',
                  borderColor: filteredCategory === cat ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.25)',
                  color: filteredCategory === cat ? '#FFFFFF' : '#E2E8F0'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Bento Grid */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="pulse-dot" style={{ margin: '0 auto 1rem auto' }}></div>
              <p style={{ color: 'var(--color-text-secondary)' }}>Loading visual showcase...</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="academic-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <ImageIcon size={48} style={{ color: '#94A3B8', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary)' }}>No images available in this category</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                Images can be added or updated dynamically via the Admin CMS Dashboard.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {displayedItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="academic-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    group: 'card',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => setSelectedImage(item)}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', height: '240px' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 300ms ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(11, 37, 69, 0.85)',
                      backdropFilter: 'blur(6px)',
                      color: '#FCD34D',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px'
                    }}>
                      {item.category}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ZoomIn size={16} />
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.4rem' }}>
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          {item.caption}
                        </p>
                      )}
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span>View Full Resolution</span> <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '960px',
              width: '100%',
              background: '#0F172A',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              style={{ width: '100%', maxHeight: '68vh', objectFit: 'contain', background: '#000000' }}
            />

            <div style={{ padding: '1.5rem', background: '#0F172A', color: '#FFFFFF' }}>
              <div style={{ display: 'inline-block', background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {selectedImage.category}
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                {selectedImage.title}
              </h2>
              {selectedImage.caption && (
                <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {selectedImage.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
