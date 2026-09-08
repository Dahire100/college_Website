import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Search, ArrowRight, FileText, X, CheckCircle, Download, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function NewsNotices({ settings = {} }) {
  const profile = getInstitutionProfile(settings);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [nRes, eRes] = await Promise.all([
          api.get('/api/v1/public/notices'),
          api.get('/api/v1/public/events')
        ]);
        setNotices(nRes.data || []);
        setEvents(eRes.data || []);
      } catch (e) {
        console.error('Failed to load notices', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedNotice(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredNotices = notices.filter(n => {
    const matchesCat = categoryFilter === 'All' || (n.category && n.category.toLowerCase() === categoryFilter.toLowerCase());
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.content && n.content.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0B1E36 0%, #153A6B 100%)', color: '#FFFFFF', padding: 'clamp(3rem, 6vw, 4.5rem) 0', borderBottom: '4px solid #D97706' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)' }}>
            OFFICIAL UPDATES
          </span>
          <h1 className="page-hero-title" style={{ marginTop: '0.75rem' }}>
            Notices, Circulars, and Events
          </h1>
          <p className="page-hero-subtitle" style={{ maxWidth: '720px', marginTop: '0.5rem' }}>
            Administrative notices, admissions alerts, and upcoming events for the current institution profile.
          </p>
        </div>
      </div>

      <div className="section container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>Official Notices</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', 'Admissions', 'Examinations', 'Events'].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} className={`btn ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
              <input
                type="text"
                className="simple-input"
                placeholder="Search notices, circular keywords, announcements..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>

            {loading ? (
              <p>Loading notices...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredNotices.map(n => (
                  <div
                    key={n._id || n.id}
                    className="academic-card notice-item-card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      transition: 'all 180ms ease',
                      border: '1px solid #E2E8F0'
                    }}
                    onClick={() => setSelectedNotice(n)}
                  >
                    <div style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', minWidth: '60px', fontWeight: 700, flexShrink: 0 }}>
                      <div style={{ fontSize: '1.1rem', lineHeight: 1 }}>{n.publishedDate ? n.publishedDate.split('-')[2] : '10'}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{n.publishedDate ? n.publishedDate.split('-')[1] : 'APR'}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <span className="pill-badge-blue" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{n.category || 'General'}</span>
                        {n.isPinned && (
                          <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#FEF2F2', color: '#DC2626', fontWeight: 700 }}>
                            📌 Pinned Alert
                          </span>
                        )}
                      </div>

                      {/* Clickable Title Link */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedNotice(n); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          textAlign: 'left',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          marginTop: '0.15rem',
                          marginBottom: '0.4rem',
                          cursor: 'pointer',
                          display: 'block',
                          lineHeight: 1.35,
                          fontFamily: "inherit"
                        }}
                        className="notice-title-link"
                      >
                        {n.title}
                      </button>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {n.content}
                      </p>

                      {/* Action Controls */}
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.76rem', padding: '0.28rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedNotice(n); }}
                          aria-label={`View notice details for ${n.title}`}
                        >
                          View Notice Details <ArrowRight size={12} />
                        </button>

                        {n.pdfUrl && (
                          <a
                            href={n.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="btn btn-sm"
                            style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', fontSize: '0.74rem', padding: '0.28rem 0.65rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <FileText size={12} /> PDF Download
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredNotices.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                    <p style={{ color: '#64748B', margin: 0 }}>No circulars found matching your current filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Upcoming Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {events.map(ev => (
                <div key={ev._id || ev.id} className="academic-card" style={{ padding: '1.5rem' }}>
                  <span className="pill-badge" style={{ marginBottom: '0.5rem' }}>{ev.category}</span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>{ev.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>{ev.description}</p>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>When: {ev.eventDate} | Where: {ev.venue}</div>
                  <button className="btn btn-primary btn-sm" onClick={() => alert('Event registration portal opened for ' + ev.title)}>
                    Register
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Detail View Modal */}
      {selectedNotice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 21, 40, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}
          onClick={() => setSelectedNotice(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Badges and Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="pill-badge-blue" style={{ fontSize: '0.76rem', padding: '0.2rem 0.6rem' }}>
                  {selectedNotice.category || 'Official Circular'}
                </span>
                {selectedNotice.isPinned && (
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#FEF2F2', color: '#DC2626', fontWeight: 700 }}>
                    📌 Important Announcement
                  </span>
                )}
                {selectedNotice.publishedDate && (
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Published: {selectedNotice.publishedDate}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                  transition: 'all 120ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Notice Title */}
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#002147', margin: '0 0 1rem 0', lineHeight: 1.35 }}>
              {selectedNotice.title}
            </h2>

            {/* Notice Full Content */}
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', lineHeight: 1.7, color: '#334155', fontSize: '0.92rem', whiteSpace: 'pre-line' }}>
              {selectedNotice.content || 'No detailed content provided for this circular.'}
            </div>

            {/* Actions: Download PDF and Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              {selectedNotice.pdfUrl && (
                <a
                  href={selectedNotice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                >
                  <Download size={15} /> Download Official PDF
                </a>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedNotice(null)}
              >
                Close Circular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
