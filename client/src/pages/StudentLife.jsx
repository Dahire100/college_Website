import React, { useState, useEffect } from 'react';
import { Flag, Trophy, Compass, Music, Zap, Heart, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function StudentLife({ settings = {}, onNavigate }) {
  const profile = getInstitutionProfile(settings);
  const [pageData, setPageData] = useState(null);
  const [subsections, setSubsections] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [pageRes, subRes] = await Promise.all([
          api.get('/api/v1/public/pages/life').catch(() => null),
          api.get('/api/v1/public/subsections?pageSlug=life').catch(() => null)
        ]);
        if (pageRes?.data) setPageData(pageRes.data);
        if (subRes?.data) setSubsections(subRes.data || []);
      } catch (e) {
        console.error('Failed to load student life CMS data', e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div style={{ background: pageData?.heroImageUrl ? `linear-gradient(rgba(11, 37, 69, 0.85), rgba(19, 62, 104, 0.9)), url(${pageData.heroImageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #0B1E36 0%, #153A6B 100%)', color: '#FFFFFF', padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4rem) 0', borderBottom: '4px solid #D97706', position: 'relative' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)' }}>
            {pageData?.heroBadge || profile.studentLifeLabel}
          </span>
          <h1 className="page-hero-title" style={{ marginTop: '0.75rem' }}>
            {pageData?.heroTitle || 'Student Life and Activities'}
          </h1>
          <p className="page-hero-subtitle" style={{ maxWidth: '720px', marginTop: '0.5rem' }}>
            {pageData?.heroSubtitle || 'Clubs, events, cultural activities, and student engagement can be adapted to any institution profile.'}
          </p>
        </div>
      </div>

      <div className="section container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          <div className="academic-card"><span className="pill-badge-blue">Community</span><h3 style={{ fontSize: '1.35rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>Clubs and Societies</h3><p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>Add academic, cultural, sports, service, or subject clubs here.</p></div>
          <div className="academic-card"><span className="pill-badge-blue">Events</span><h3 style={{ fontSize: '1.35rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>Festivals and Programs</h3><p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>Use this card for fests, annual days, competitions, or orientation activities.</p></div>
          <div className="academic-card"><span className="pill-badge">Support</span><h3 style={{ fontSize: '1.35rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>Student Support</h3><p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>Mentoring, counseling, and leadership support can be shown here.</p></div>
        </div>

        {subsections && subsections.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <div className="section-header">
              <span className="pill-badge">Featured Initiatives</span>
              <h2 className="section-title">Special Student Activities</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {subsections.map((sub, idx) => (
                <div key={sub._id || idx} className="academic-card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{sub.title}</h3>
                  {sub.subtitle && <p style={{ fontSize: '1rem', color: '#2563EB', fontWeight: 600, marginBottom: '0.75rem' }}>{sub.subtitle}</p>}
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{sub.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
