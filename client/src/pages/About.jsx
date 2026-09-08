import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Clock, Globe, Shield, BookOpen, Target, HeartHandshake, Compass, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function About({ settings = {}, onNavigate }) {
  const profile = getInstitutionProfile(settings);
  const [pageData, setPageData] = useState(null);
  const [subsections, setSubsections] = useState([]);

  useEffect(() => {
    async function loadAboutData() {
      try {
        const [pageRes, subRes] = await Promise.all([
          api.get('/api/v1/public/pages/about').catch(() => null),
          api.get('/api/v1/public/subsections?pageSlug=about').catch(() => null)
        ]);
        if (pageRes?.data) setPageData(pageRes.data);
        if (subRes?.data) setSubsections(subRes.data);
      } catch (err) {
        console.error('Failed to load about data:', err);
      }
    }
    loadAboutData();
  }, []);

  const milestones = [
    { year: '1984', title: 'Founding', desc: 'The institution was established with a vision for quality education.' },
    { year: '2000', title: 'Academic Growth', desc: 'Programs and academic units expanded to serve more learners.' },
    { year: '2010', title: 'Digital Transformation', desc: 'Campus systems and digital learning support were strengthened.' },
    { year: '2026', title: 'CMS-First Portal', desc: 'A reusable website structure was designed for multiple institution types.' }
  ];

  const accreditations = [
    { title: 'CMS Managed', subtitle: 'Admin editable content', detail: 'Profile-based content can be updated without changing layout.', icon: Award, color: '#D97706' },
    { title: 'Multiple Profiles', subtitle: 'Engineering / Pharmacy / School', detail: 'Switch the site identity from one profile to another.', icon: Shield, color: '#2563EB' },
    { title: 'Reusable Structure', subtitle: 'Multi-page portal', detail: 'Admissions, programs, and campus pages stay consistent.', icon: BookOpen, color: '#7C3AED' },
    { title: 'Editable Branding', subtitle: 'Name, logo, and tagline', detail: 'Every institution can keep its own identity and voice.', icon: CheckCircle, color: '#059669' }
  ];

  const coreValues = [
    { title: 'Clarity', desc: 'Simple navigation and content that is easy to update.', icon: GraduationCap },
    { title: 'Flexibility', desc: 'A single design that works across institution types.', icon: Target },
    { title: 'Trust', desc: 'Professional, consistent, and admin-friendly structure.', icon: HeartHandshake },
    { title: 'Growth', desc: 'Supports future pages, sections, and content expansion.', icon: Compass }
  ];

  return (
    <div style={{ background: '#F8FAFC' }}>
      <div style={{ background: pageData?.heroImageUrl ? `linear-gradient(rgba(11, 37, 69, 0.85), rgba(19, 62, 104, 0.9)), url(${pageData.heroImageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #0B2545 0%, #133E68 100%)', color: '#FFFFFF', padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4rem) 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)', marginBottom: '1rem' }}>
            <Sparkles size={13} /> {pageData?.heroBadge || 'INSTITUTIONAL PROFILE'}
          </span>
          <h1 className="page-hero-title" style={{ marginTop: '0.75rem' }}>
            {profile.aboutTitle || pageData?.heroTitle || `About ${settings.college_name || profile.collegeName}`}
          </h1>
          <p className="page-hero-subtitle" style={{ maxWidth: '820px', marginTop: '1rem' }}>
            {profile.aboutSummary || pageData?.heroSubtitle}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <span className="pill-badge-blue">Overview</span>
              <h2 className="section-title" style={{ marginTop: '0.5rem' }}>{profile.aboutTitle}</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.8, fontSize: '1.05rem' }}>{profile.aboutSummary}</p>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.8, fontSize: '1.05rem' }}>{settings.college_tagline || profile.tagline}</p>
              <div className="responsive-stats-3col">
                <div><div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--color-primary)' }}>1</div><div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Portal</div></div>
                <div><div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: '#D97706' }}>4</div><div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Key Pages</div></div>
                <div><div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: '#059669' }}>CMS</div><div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Editable</div></div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <img src={pageData?.heroImageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80'} alt="Institution" style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', borderRadius: '16px' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="section-header">
            <span className="pill-badge-blue">Charter</span>
            <h2 className="section-title">Vision, Mission, and Values</h2>
            <p className="section-desc">Keep the institutional story concise, editable, and profile aware.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.75rem', marginBottom: '3.5rem' }}>
            <div className="academic-card" style={{ borderTop: '5px solid #2563EB', padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 2.5vw, 2rem)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>Vision</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.025rem', margin: 0 }}>To provide a clear, modern, and reusable institutional presence that can be adapted across education profiles.</p>
            </div>
            <div className="academic-card" style={{ borderTop: '5px solid #D97706', padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 2.5vw, 2rem)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>Mission</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.025rem', margin: 0 }}>To support admissions, academics, campus life, and communication for engineering, pharmacy, school, or college sites.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.5rem' }}>
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FFFFFF', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
                    <Icon size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.4rem' }}>{val.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="pill-badge-blue">Quality Benchmarks</span>
            <h2 className="section-title">Accreditations and Capabilities</h2>
            <p className="section-desc">Show the badges and claims relevant to the current institution profile.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {accreditations.map((acc, idx) => {
              const Icon = acc.icon;
              return (
                <div key={idx} style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FFFFFF', color: acc.color, border: `1px solid ${acc.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>{acc.title}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginTop: '0.2rem' }}>{acc.subtitle}</div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: '0.4rem 0 0 0', lineHeight: 1.5 }}>{acc.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="section-header">
            <span className="pill-badge-blue">Timeline</span>
            <h2 className="section-title">Institutional Journey</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {milestones.map((m, idx) => (
              <div key={idx} className="responsive-timeline-item">
                <div style={{ textAlign: 'center', borderRight: '2px solid #2563EB', paddingRight: '1rem' }}>
                  <div style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.75rem)', fontWeight: 800, color: '#2563EB', lineHeight: 1 }}>{m.year}</div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Milestone</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>{m.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.35rem 0 0 0', lineHeight: 1.6 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {subsections && subsections.length > 0 && (
        <section className="section" style={{ background: '#F1F5F9', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div className="section-header">
              <span className="pill-badge">CMS Managed Sections</span>
              <h2 className="section-title">Special Institutional Features</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {subsections.map((sub, idx) => (
                <div key={sub._id || idx} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: 'clamp(1.25rem, 3vw, 2.25rem)' }}>
                  <h3 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{sub.title}</h3>
                  {sub.subtitle && <p style={{ fontSize: '0.95rem', color: '#2563EB', fontWeight: 600, marginBottom: '0.75rem' }}>{sub.subtitle}</p>}
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>{sub.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ background: 'linear-gradient(135deg, #0B2545 0%, #133E68 100%)', color: '#FFFFFF', padding: 'clamp(3rem, 5vw, 4.5rem) 0', textAlign: 'center' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', marginBottom: '1rem' }}>
            GET STARTED
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', margin: '0.75rem 0 1rem 0' }}>
            Ready to adapt this portal to your institution?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.15rem', maxWidth: '640px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
            Use the admin profile and content fields to switch the site between engineering, pharmacy, school, or college branding.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('admissions')}>
              Explore Admissions <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)' }} onClick={() => onNavigate('contact')}>
              Contact the Office
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
