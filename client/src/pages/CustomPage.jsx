import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ExternalLink, Compass, BookOpen, Layers, CheckCircle2, FileText, Download } from 'lucide-react';
import { api } from '../services/api';

export default function CustomPage({ slug, onOpenInquiry, onNavigate }) {
  const [pageData, setPageData] = useState(null);
  const [subsections, setSubsections] = useState([]);
  const [parentPage, setParentPage] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/v1/public/pages/${slug}`);
        if (res.success && res.data) {
          if (isMounted) {
            setPageData(res.data.page);
            setSubsections(res.data.subsections || []);
            setParentPage(res.data.parentPage || null);
            setSiblings(res.data.siblings || []);
          }
        } else {
          // Fallback: try fetching all pages to see if match exists
          const allRes = await api.get('/api/v1/public/pages');
          const matched = (allRes.data || []).find(p => p.slug === slug);
          if (matched && isMounted) {
            setPageData(matched);
            const subs = await api.get(`/api/v1/public/subsections?pageSlug=${slug}`);
            setSubsections(subs.data || []);
            if (matched.parentSlug) {
              const par = (allRes.data || []).find(p => p.slug === matched.parentSlug);
              setParentPage(par || null);
              const sibs = (allRes.data || []).filter(p => p.parentSlug === matched.parentSlug);
              setSiblings(sibs);
            }
          } else if (isMounted) {
            setError('Page not found or is currently inactive.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load page content.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPage();
    return () => { isMounted = false; };
  }, [slug]);

  const handleCtaClick = (e, link) => {
    if (!link) return;
    if (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('mailto:') && !link.startsWith('tel:')) {
      e.preventDefault();
      const clean = link.replace(/^#\/?/, '').replace(/^\/+/, '');
      if (onNavigate) {
        onNavigate(clean || 'home');
      } else {
        window.history.pushState(null, '', clean ? `/${clean}` : '/');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' }} />
          <p style={{ color: 'var(--color-muted)', fontWeight: 500 }}>Loading institutional page...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div style={{ minHeight: '60vh', display: 'center', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '2rem' }}>
        <div style={{ maxWidth: '540px', textAlign: 'center', background: '#FFFFFF', padding: '3rem 2rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)', margin: '4rem auto' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.75rem' }}>
            ⚠
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '0.75rem' }}>
            Page Not Found or Inactive
          </h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {error || 'This page has not been published yet or is currently hidden by the administrator in the CMS.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('home')}
            >
              Back to Home
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => onOpenInquiry?.()}
            >
              Contact Helpdesk
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. HERO HEADER */}
      <section 
        style={{
          position: 'relative',
          padding: '4.5rem 1.5rem 4.5rem 1.5rem',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.9)), url(${pageData.heroImageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#FFFFFF',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: '1.25rem' }}>
            <ol style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              listStyle: 'none',
              padding: '0.35rem 0.9rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.78rem',
              margin: 0
            }}>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                >
                  Home
                </button>
              </li>
              <li style={{ color: 'rgba(255, 255, 255, 0.4)' }}>/</li>
              {parentPage ? (
                <>
                  <li>
                    <button
                      onClick={() => onNavigate(parentPage.slug)}
                      style={{ background: 'none', border: 'none', color: '#93C5FD', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                    >
                      {parentPage.title}
                    </button>
                  </li>
                  <li style={{ color: 'rgba(255, 255, 255, 0.4)' }}>/</li>
                </>
              ) : null}
              <li style={{ color: '#FCD34D', fontWeight: 700 }}>
                {pageData.title}
              </li>
            </ol>
          </nav>

          {pageData.heroBadge && (
            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(37, 99, 235, 0.35)',
                color: '#93C5FD',
                border: '1px solid rgba(147, 197, 253, 0.4)',
                padding: '0.3rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}
            >
              <Sparkles size={13} /> {pageData.heroBadge}
            </span>
          )}

          <h1 
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: '1.25rem'
            }}
          >
            {pageData.heroTitle || pageData.title}
          </h1>

          {pageData.heroSubtitle && (
            <p 
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#E2E8F0',
                maxWidth: '750px',
                margin: '0 auto 2rem auto',
                lineHeight: 1.6
              }}
            >
              {pageData.heroSubtitle}
            </p>
          )}

          {pageData.content && (
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '1.25rem 2rem',
                borderRadius: '12px',
                maxWidth: '720px',
                margin: '0 auto',
                fontSize: '0.95rem',
                color: '#CBD5E1',
                lineHeight: 1.6
              }}
            >
              {pageData.content}
            </div>
          )}
        </div>
      </section>

      {/* IN-SECTION SIBLING SUBPAGES NAVIGATOR BAR */}
      {(parentPage || siblings.length > 0) && (
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0.75rem 0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', position: 'relative', zIndex: 15 }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {parentPage ? `${parentPage.title} Section:` : 'Explore Section:'}
              </span>
              {parentPage && (
                <button
                  onClick={() => onNavigate(parentPage.slug)}
                  style={{
                    background: pageData.slug === parentPage.slug ? '#002147' : '#F1F5F9',
                    color: pageData.slug === parentPage.slug ? '#FFFFFF' : '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '9999px',
                    padding: '0.3rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 120ms'
                  }}
                >
                  Overview
                </button>
              )}
              {siblings.map(sib => {
                const isCur = sib.slug === pageData.slug;
                return (
                  <button
                    key={sib._id || sib.slug}
                    onClick={() => onNavigate(sib.slug)}
                    style={{
                      background: isCur ? 'linear-gradient(135deg, #00529B, #003366)' : '#F8FAFC',
                      color: isCur ? '#FFFFFF' : '#334155',
                      border: '1px solid',
                      borderColor: isCur ? '#00529B' : '#E2E8F0',
                      borderRadius: '9999px',
                      padding: '0.3rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: isCur ? 700 : 500,
                      cursor: 'pointer',
                      boxShadow: isCur ? '0 2px 6px rgba(0,82,155,0.25)' : 'none',
                      transition: 'all 120ms'
                    }}
                  >
                    {sib.navLabel || sib.title}
                  </button>
                );
              })}
            </div>

            {onOpenInquiry && (
              <button
                onClick={() => onOpenInquiry(pageData.title)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D97706',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                Inquire About This <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ATTACHED PDF DOCUMENT DOWNLOAD CARD */}
      {pageData.pdfUrl && (
        <div className="container" style={{ maxWidth: '1200px', margin: '-2.5rem auto 2rem auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}>
                <FileText size={28} />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{
                  display: 'inline-block',
                  background: '#FEE2E2',
                  color: '#991B1B',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.35rem'
                }}>
                  Official Attached Document (PDF)
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--color-primary)' }}>
                  {pageData.pdfName || 'Download Official Document (PDF)'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Authorized institutional PDF publication available for direct viewing and offline download.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <a
                href={pageData.pdfUrl}
                download={pageData.pdfName || 'document.pdf'}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                <Download size={16} /> Download PDF
              </a>
              <a
                href={pageData.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                <ExternalLink size={16} /> Open in Viewer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBSECTIONS LIST */}
      <section className="container" style={{ maxWidth: '1200px', margin: pageData.pdfUrl ? '1rem auto 0 auto' : '3.5rem auto 0 auto', padding: '0 1.5rem' }}>
        {subsections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
            <Layers size={40} style={{ color: 'var(--color-muted)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '0.5rem' }}>
              Welcome to {pageData.title}
            </h3>
            <p style={{ color: 'var(--color-muted)', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              Additional subsections and interactive resources are being curated by the academic department. You can contact our campus desk for specific queries.
            </p>
            <button className="btn btn-primary" onClick={() => onOpenInquiry?.()}>
              Contact Campus Desk
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            {subsections.map((sub, index) => {
              // Layout 1: Split Content (Image + Text)
              if (sub.layoutType === 'split_content' || !sub.layoutType) {
                const isEven = index % 2 === 1;
                return (
                  <div 
                    key={sub._id || sub.id || index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: sub.imageUrl ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
                      gap: '2.5rem',
                      alignItems: 'center',
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '2.5rem',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--color-border)',
                      direction: isEven && sub.imageUrl ? 'rtl' : 'ltr'
                    }}
                  >
                    {sub.imageUrl && (
                      <div style={{ direction: 'ltr' }}>
                        <img 
                          src={sub.imageUrl} 
                          alt={sub.title} 
                          style={{
                            width: '100%',
                            height: '340px',
                            objectFit: 'cover',
                            borderRadius: '16px',
                            boxShadow: 'var(--shadow-md)'
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ direction: 'ltr' }}>
                      {sub.badge && (
                        <span 
                          style={{
                            display: 'inline-block',
                            background: 'rgba(37, 99, 235, 0.1)',
                            color: '#2563EB',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            marginBottom: '0.85rem'
                          }}
                        >
                          {sub.badge}
                        </span>
                      )}

                      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                        {sub.title}
                      </h2>

                      {sub.subtitle && (
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '1rem' }}>
                          {sub.subtitle}
                        </h4>
                      )}

                      <p style={{ color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                        {sub.content}
                      </p>

                      {sub.ctaText && (
                        <a 
                          href={sub.ctaLink || '/contact'} 
                          onClick={(e) => handleCtaClick(e, sub.ctaLink || '/contact')}
                          className="btn btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span>{sub.ctaText}</span>
                          <ArrowRight size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              }

              // Layout 2: Full Width Image Banner
              if (sub.layoutType === 'image_banner') {
                return (
                  <div 
                    key={sub._id || sub.id || index}
                    style={{
                      position: 'relative',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9)), url(${sub.imageUrl || pageData.heroImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#FFFFFF',
                      padding: '4rem 2.5rem',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <div style={{ maxWidth: '750px' }}>
                      {sub.badge && (
                        <span 
                          style={{
                            display: 'inline-block',
                            background: 'rgba(217, 119, 6, 0.25)',
                            color: '#FCD34D',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            marginBottom: '1rem'
                          }}
                        >
                          {sub.badge}
                        </span>
                      )}

                      <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                        {sub.title}
                      </h2>

                      {sub.subtitle && (
                        <p style={{ fontSize: '1.1rem', color: '#93C5FD', fontWeight: 600, marginBottom: '1rem' }}>
                          {sub.subtitle}
                        </p>
                      )}

                      <p style={{ fontSize: '1rem', color: '#E2E8F0', lineHeight: 1.7, marginBottom: '2rem' }}>
                        {sub.content}
                      </p>

                      {sub.ctaText && (
                        <a 
                          href={sub.ctaLink || '/contact'} 
                          onClick={(e) => handleCtaClick(e, sub.ctaLink || '/contact')}
                          className="btn"
                          style={{ background: '#FFFFFF', color: '#0F172A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                        >
                          <span>{sub.ctaText}</span>
                          <ArrowRight size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              }

              // Layout 3: Card Grid / Bento Box
              if (sub.layoutType === 'card_grid') {
                return (
                  <div 
                    key={sub._id || sub.id || index}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '2.5rem',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--color-border)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '2rem',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      {sub.badge && (
                        <span 
                          style={{
                            display: 'inline-block',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#059669',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            marginBottom: '0.85rem'
                          }}
                        >
                          {sub.badge}
                        </span>
                      )}

                      <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '0.5rem' }}>
                        {sub.title}
                      </h3>

                      {sub.subtitle && (
                        <p style={{ fontSize: '1rem', color: 'var(--color-muted)', fontWeight: 600, marginBottom: '1rem' }}>
                          {sub.subtitle}
                        </p>
                      )}

                      <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                        {sub.content}
                      </p>

                      {sub.ctaText && (
                        <a 
                          href={sub.ctaLink || '/contact'} 
                          onClick={(e) => handleCtaClick(e, sub.ctaLink || '/contact')}
                          className="btn btn-outline"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span>{sub.ctaText}</span>
                          <ArrowRight size={15} />
                        </a>
                      )}
                    </div>

                    {sub.imageUrl && (
                      <div>
                        <img 
                          src={sub.imageUrl} 
                          alt={sub.title} 
                          style={{
                            width: '100%',
                            height: '260px',
                            objectFit: 'cover',
                            borderRadius: '14px',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              }

              // Layout 4: Text Only / Callout Block
              return (
                <div 
                  key={sub._id || sub.id || index}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '2.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    borderLeft: '5px solid var(--color-primary)',
                    borderTop: '1px solid var(--color-border)',
                    borderRight: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)'
                  }}
                >
                  {sub.badge && (
                    <span 
                      style={{
                        display: 'inline-block',
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563EB',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: '0.75rem'
                      }}
                    >
                      {sub.badge}
                    </span>
                  )}
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '0.5rem' }}>
                    {sub.title}
                  </h3>
                  {sub.subtitle && (
                    <h5 style={{ fontSize: '1rem', color: 'var(--color-muted)', fontWeight: 600, marginBottom: '1rem' }}>
                      {sub.subtitle}
                    </h5>
                  )}
                  <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                    {sub.content}
                  </p>
                  {sub.ctaText && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <a
                        href={sub.ctaLink || '/contact'}
                        onClick={(e) => handleCtaClick(e, sub.ctaLink || '/contact')}
                        className="btn btn-sm btn-primary"
                      >
                        {sub.ctaText}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div 
          style={{
            marginTop: '4rem',
            background: 'linear-gradient(135deg, #1E293B, #0F172A)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            color: '#FFFFFF',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem' }}>
            Have Inquiries About {pageData.title}?
          </h3>
          <p style={{ color: '#94A3B8', maxWidth: '600px', margin: '0 auto 1.75rem auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Connect with our central campus administration or admissions helpline for guided counseling and syllabus documentation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn"
              style={{ background: '#2563EB', color: '#FFFFFF', fontWeight: 700, padding: '0.75rem 1.75rem', borderRadius: '8px' }}
              onClick={() => onOpenInquiry?.(pageData.title)}
            >
              Submit Online Inquiry
            </button>
            <button 
              className="btn"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
              onClick={() => onNavigate('contact')}
            >
              Contact Campus Desk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
