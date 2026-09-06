import React, { useState, useEffect } from 'react';
import { Flag, Trophy, Compass, Music, Zap, Heart, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function StudentLife() {
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
      <div style={{
        background: pageData?.heroImageUrl
          ? `linear-gradient(rgba(11, 37, 69, 0.85), rgba(19, 62, 104, 0.9)), url(${pageData.heroImageUrl}) center/cover no-repeat`
          : 'var(--color-primary)',
        color: '#FFFFFF',
        padding: '5rem 0 4rem 0',
        position: 'relative'
      }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)' }}>
            {pageData?.heroBadge || 'STUDENT CLUBS & ACTIVITIES'}
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.75rem', marginTop: '0.75rem' }}>
            {pageData?.heroTitle || 'Student Life & Cultural Energy'}
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.2rem', maxWidth: '720px', marginTop: '0.5rem' }}>
            {pageData?.heroSubtitle || 'Over 25+ student-led chapters spanning BAJA SAE motorsport, robotics, hackathons, music, drama, and NCC/NSS social impact.'}
          </p>
        </div>
      </div>

      <div className="section container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div className="academic-card">
            <img
              src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80"
              alt="Apex Racing"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            />
            <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>Motorsport & BAJA</span>
            <h3 style={{ fontSize: '1.35rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>Apex Racing (SAE BAJA)</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              National championship vehicle design team entirely run by student engineers, building electric and all-terrain buggies in the campus workshop.
            </p>
          </div>

          <div className="academic-card">
            <img
              src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80"
              alt="CodeCell"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            />
            <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>Competitive Coding</span>
            <h3 style={{ fontSize: '1.35rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>CodeCell & ACM Chapter</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Competitive programming hub hosting 36-hour hackathons, open-source workshops, algorithmic bootcamps, and developer meetups.
            </p>
          </div>

          <div className="academic-card">
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
              alt="Equinox"
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            />
            <span className="pill-badge" style={{ marginBottom: '0.5rem' }}>Annual Fest</span>
            <h3 style={{ fontSize: '1.35rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>Equinox Cultural Festival</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              The flagship 3-day multi-stage campus celebration bringing national performers, band battles, drama productions, and dance tournaments.
            </p>
          </div>
        </div>

        {/* Dynamic CMS Subsections */}
        {subsections && subsections.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <div className="section-header">
              <span className="pill-badge">Featured Initiatives</span>
              <h2 className="section-title">Special Student Societies & Centers</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {subsections.map((sub, idx) => (
                <div key={sub._id || idx} className="academic-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {sub.badge && <span className="pill-badge-blue">{sub.badge}</span>}
                    <span className="pill-badge" style={{ fontSize: '0.75rem' }}>CMS Activity</span>
                  </div>
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
