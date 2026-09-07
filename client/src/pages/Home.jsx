import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Award, Bell, BookOpen, Briefcase, ChevronLeft, ChevronRight, 
  Cpu, Users, ShieldCheck, Building, Sparkles, TrendingUp, CheckCircle,
  GraduationCap, Microscope, FileCheck, Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function Home({ onNavigate, onOpenInquiry, settings = {}, sections = [] }) {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [notices, setNotices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeDegreeTab, setActiveDegreeTab] = useState('All');
  const [placements, setPlacements] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, nRes, dRes, cRes, pRes, fRes, gRes] = await Promise.all([
          api.get('/api/v1/public/banners'),
          api.get('/api/v1/public/notices?pinned=true'),
          api.get('/api/v1/public/departments'),
          api.get('/api/v1/public/courses'),
          api.get('/api/v1/public/placements'),
          api.get('/api/v1/public/facilities'),
          api.get('/api/v1/public/gallery')
        ]);
        setBanners(bRes.data || []);
        setNotices(nRes.data || []);
        setDepartments(dRes.data || []);
        setCourses(cRes.data || []);
        setPlacements(pRes.data?.records || []);
        setRecruiters(pRes.data?.recruiters || []);
        setFacilities(fRes.data || []);
        setGallery(gRes.data || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isSectionVisible = (key) => {
    if (!sections || sections.length === 0) return true;
    const match = sections.find(s => s.sectionKey === key || (key === 'hero_carousel' && s.sectionKey === 'hero_banners'));
    return match ? match.isVisible !== false : true;
  };

  const customSections = sections.filter(s => s.sectionKey && s.sectionKey.startsWith('custom_') && s.isVisible);

  // Slide timer
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const latestPlacement = placements[0] || {};
  const currentBanner = banners[currentSlide] || banners[0] || {};

  const filteredHomeCourses = (activeDegreeTab === 'All'
    ? courses
    : courses.filter(c => c.degree && c.degree.toLowerCase().includes(activeDegreeTab.toLowerCase()))
  ).slice(0, 6);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ marginBottom: '1rem' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Connecting to Academic Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Portfolio-Style Hero Banner with Animated Slides */}
      {isSectionVisible('hero_carousel') && banners.length > 0 && (
        <section className="portfolio-hero">
          {banners.map((b, idx) => (
            <div
              key={b._id || idx}
              className={`hero-slide-item ${idx === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `url('${b.imageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="hero-bg-overlay" />
              <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                <div className="hero-text-content">
                  {b.badge && (
                    <div className="pill-badge" style={{ marginBottom: '1.25rem' }}>
                      <span className="pulse-dot" /> {b.badge}
                    </div>
                  )}
                  <h1 className="hero-main-title">{b.title}</h1>
                  <p className="hero-main-subtitle">{b.subtitle}</p>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => onNavigate('academics')}>
                      {b.ctaText || 'Explore Degrees'} <ArrowRight size={18} />
                    </button>
                    <button className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }} onClick={() => onNavigate('admissions')}>
                      {b.secondaryCtaText || 'Admission Roadmap'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel controls */}
          {banners.length > 1 && (
            <div style={{ position: 'absolute', bottom: '24px', left: 0, right: 0, zIndex: 20 }}>
              <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      style={{
                        width: idx === currentSlide ? '32px' : '10px',
                        height: '10px',
                        borderRadius: '9999px',
                        background: idx === currentSlide ? 'var(--color-accent)' : 'rgba(255,255,255,0.35)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 200ms ease'
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 2. Live Notification Ticker */}
      {isSectionVisible('notice_ticker') && (
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--color-border)', padding: '0.75rem 0', boxShadow: 'var(--shadow-sm)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
              <span className="pulse-dot" style={{ background: '#EF4444' }} /> LIVE CIRCULAR
            </span>
            <div style={{ flex: 1, minWidth: '240px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              <button
                onClick={() => onNavigate('news')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                {notices[0]?.title || settings.hero_admission_alert || 'Admissions Open for AY 2026-27. Register online today.'}
              </button>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('news')}>
              All Notices ({notices.length})
            </button>
          </div>
        </div>
      )}

      {/* 2.5. BENCHMARK QUICK-ACTION NAVIGATION DOCK (VIT Pune, MIT-WPU & VIT Vellore Inspired) */}
      <section style={{ background: '#0F172A', padding: '1.25rem 0', borderBottom: '2px solid #C59B27' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
            {/* Card 1: Admissions */}
            <div
              onClick={() => onNavigate('admissions')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = '#FCD34D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#EF4444', background: 'rgba(239, 68, 68, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  DTE CODE: {settings.dte_code || '6277'}
                </span>
                <GraduationCap size={16} style={{ color: '#FCD34D' }} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Admissions 2026-27</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                B.Tech (MHT-CET / JEE), DSE & M.Tech CAP Round Guidance.
              </p>
            </div>

            {/* Card 2: Placements */}
            <div
              onClick={() => onNavigate('placements')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = '#FCD34D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  ₹54.3 LPA HIGHEST
                </span>
                <Briefcase size={16} style={{ color: '#60A5FA' }} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Placement Records</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                350+ marquee recruiters (Microsoft, NVIDIA, Barclays, Siemens).
              </p>
            </div>

            {/* Card 3: Academics & Autonomous NEP 2020 */}
            <div
              onClick={() => onNavigate('academics')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = '#FCD34D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FCD34D', background: 'rgba(252, 211, 77, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  NEP 2020 AUTONOMOUS
                </span>
                <BookOpen size={16} style={{ color: '#F472B6' }} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Autonomous Curricula</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                8 Minor Degree specializations, semester internships & honors.
              </p>
            </div>

            {/* Card 4: Research & CoE */}
            <div
              onClick={() => onNavigate('research')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = '#FCD34D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38BDF8', background: 'rgba(56, 189, 248, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  ₹14.8 CR+ GRANTS
                </span>
                <Cpu size={16} style={{ color: '#A78BFA' }} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Research & CoE</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                NVIDIA Supercomputing Lab, Siemens Smart Factory, 45+ Patents.
              </p>
            </div>

            {/* Card 5: Student Life & Fests */}
            <div
              onClick={() => onNavigate('life')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = '#FCD34D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FB923C', background: 'rgba(251, 146, 60, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  CAMPUS CULTURE
                </span>
                <Sparkles size={16} style={{ color: '#FBBF24' }} />
              </div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Vishwakarandak & Fests</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                Melange, MindSpark, Formula Student & BAJA SAE Champion Teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Figures Stats */}
      {isSectionVisible('stats_counter') && (
        <section style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))', color: '#FFFFFF', padding: '3.5rem 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: '#FCD34D', lineHeight: 1 }}>40+</div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '0.5rem' }}>Years of Academic Rigor</div>
                <div style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>Autonomous & Affiliated to SPPU</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: '#FCD34D', lineHeight: 1 }}>{latestPlacement.placementRate || '98.4'}%</div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '0.5rem' }}>Placement Track Record</div>
                <div style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>1,420+ Offers (2024-25 Season)</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: '#FCD34D', lineHeight: 1 }}>{latestPlacement.highestPackage || '₹54.3 LPA'}</div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '0.5rem' }}>Highest Campus Package</div>
                <div style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>Circuit Avg: {latestPlacement.averagePackage || '₹12.8 LPA'}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: '#FCD34D', lineHeight: 1 }}>350+</div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '0.5rem' }}>Corporate Partners</div>
                <div style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>Microsoft, NVIDIA, Barclays, Siemens</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3.5. INSTITUTIONAL PROFILE & ABOUT COLLEGE SPOTLIGHT */}
      {isSectionVisible('about_college') && (
        <section className="section" style={{ background: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
              <div>
                <span className="pill-badge-blue">Institutional Heritage & Profile</span>
                <h2 className="section-title" style={{ marginTop: '0.5rem' }}>
                  Four Decades of Autonomous Engineering Leadership in Pune
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.025rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                  Established in 1983 under Bansilal Ramnath Agarwal Charitable Trust, {settings.college_name || 'Vishwakarma Institute of Technology (VIT Pune)'} has consistently set benchmarks in technical education in Maharashtra. Accredited with NAAC A++ Grade (CGPA 3.68, Cycle-3) and NBA Tier-1 accreditation across all engineering departments, our autonomous campus combines deep academic rigor with experiential research.
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.025rem', lineHeight: 1.8, marginBottom: '1.75rem' }}>
                  Our autonomous governance allows continuous syllabus enhancements alongside multinational leaders like NVIDIA, Siemens, Microsoft, and Texas Instruments—preparing ethical engineering leaders who create global impact.
                </p>

                {/* Key Accreditations / Pills */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FEF3C7', color: '#92400E', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <Award size={15} /> NAAC A++ (CGPA 3.68)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#EFF6FF', color: '#1E40AF', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <ShieldCheck size={15} /> NBA Tier-1 Programs
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#F0FDF4', color: '#166534', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <CheckCircle size={15} /> UGC Autonomous & SPPU
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FEF2F2', color: '#DC2626', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} /> DTE Code: {settings.dte_code || '6277'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => onNavigate('about')}>
                    Explore Full Institutional Profile <ArrowRight size={16} />
                  </button>
                  <button className="btn btn-secondary" onClick={() => onNavigate('admissions')}>
                    Maharashtra CAP Admissions
                  </button>
                </div>
              </div>

              {/* Leadership Spotlight Card */}
              <div style={{ position: 'relative' }}>
                <div style={{ background: 'linear-gradient(135deg, #002147 0%, #0F3A65 100%)', borderRadius: '20px', padding: '2.5rem', color: '#FFFFFF', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(197, 155, 39, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                      alt="Director"
                      style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #C59B27' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#FCD34D', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Director's Desk</span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: '0.15rem 0 0 0' }}>Dr. Rajesh M. Jalnekar</h4>
                      <span style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Director, Ph.D. (Electronics & VLSI)</span>
                    </div>
                  </div>

                  <p style={{ color: '#E2E8F0', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 1.5rem 0' }}>
                    "Our educational philosophy transforms students from passive recipients of engineering concepts into active architects of industry solutions. Backed by autonomous flexibility, our graduates consistently excel across premier global research labs and Fortune 500 tech leaders."
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FCD34D' }}>1983</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Established</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FCD34D' }}>35,000+</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Global Alumni</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FCD34D' }}>6277</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>DTE Pune Code</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3.6. PROGRAMS & DEGREE EXPLORER (MIT-WPU BENCHMARK STYLE) */}
      {(isSectionVisible('programs_showcase') || isSectionVisible('academic_programs')) && courses.length > 0 && (
        <section className="section" style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <span className="pill-badge-blue">
                  <GraduationCap size={14} /> Degree Programs Catalog
                </span>
                <h2 className="section-title" style={{ marginTop: '0.4rem' }}>
                  Industry-Aligned Degree Programs
                </h2>
                <p className="section-desc" style={{ marginBottom: 0 }}>
                  Curriculum built under the National Education Policy (NEP 2020) framework with interdisciplinary minors, honors, and research tracks.
                </p>
              </div>

              {/* Degree Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: '#FFFFFF', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                {['All', 'B.Tech', 'M.Tech', 'MBA', 'Ph.D.'].map(deg => (
                  <button
                    key={deg}
                    onClick={() => setActiveDegreeTab(deg)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '7px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      background: activeDegreeTab === deg ? 'var(--color-primary)' : 'transparent',
                      color: activeDegreeTab === deg ? '#FFFFFF' : 'var(--color-text-secondary)'
                    }}
                  >
                    {deg}
                  </button>
                ))}
              </div>
            </div>

            {/* Program Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {filteredHomeCourses.map(c => (
                <div key={c._id || c.title} className="academic-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem', position: 'relative' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <span className="pill-badge-blue" style={{ fontSize: '0.75rem' }}>
                        {c.degree || 'B.Tech'}
                      </span>
                      {c.departmentCode && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', background: '#EFF6FF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          Dept: {c.departmentCode}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.65rem', lineHeight: 1.35 }}>
                      {c.title}
                    </h3>

                    {c.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                        {c.description.substring(0, 110)}...
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>DURATION</span>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{c.duration || '4 Years'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>INTAKE</span>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{c.intake || 120} Seats</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>ELIGIBILITY</span>
                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{c.eligibility || '10+2 PCM minimum 50%'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>
                      {c.annualFee || 'State FRA Approved'}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      onClick={() => onNavigate('programs')}
                    >
                      Program Details <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA to view all programs */}
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary btn-lg" onClick={() => onNavigate('programs')}>
                Browse Complete Degrees & Programs Catalog ({courses.length}+ Programs) <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3.7. DEPARTMENTS SHOWCASE (COEP & VIT PUNE BENCHMARK STYLE) */}
      {(isSectionVisible('departments_overview') || isSectionVisible('academic_departments')) && departments.length > 0 && (
        <section className="section" style={{ background: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <div>
                <span className="pill-badge">
                  <Building size={14} /> Academic Departments
                </span>
                <h2 className="section-title" style={{ marginTop: '0.4rem' }}>
                  World-Class Engineering Disciplines
                </h2>
                <p className="section-desc" style={{ marginBottom: 0 }}>
                  Each department is led by doctoral researchers, modern laboratories, and corporate Centers of Excellence.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={() => onNavigate('departments')}>
                All Departments & Faculty <ArrowRight size={15} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {departments.slice(0, 4).map(d => (
                <div key={d.code} className="academic-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 200ms ease' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      {d.hodImage ? (
                        <img src={d.hodImage} alt={d.hodName || d.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563EB', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, border: '2px solid #BFDBFE' }}>
                          {(d.code || 'DP').substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {d.code}
                        </span>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '0.15rem' }}>
                          {d.hodName || 'Head of Department'}
                        </div>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {d.name}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                      {(d.overview || d.description || '').substring(0, 100)}...
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Intake: <strong>{d.studentIntake || d.stats?.intake || 120}</strong> &nbsp;|&nbsp; Labs: <strong>{d.stats?.labs || 8}</strong>
                    </span>
                    <button
                      onClick={() => onNavigate('departments')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0 }}
                    >
                      View Dept <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Bento Grid: Campus Highlights & High-Tech Facilities */}
      {isSectionVisible('campus_highlights') && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="pill-badge-blue">Infrastructure & Labs</span>
              <h2 className="section-title">World-Class Experiential Ecosystem</h2>
              <p className="section-desc">Designed for high-performance computing, hands-on fabrication, and 24x7 academic discovery.</p>
            </div>

            <div className="bento-grid">
              {/* Featured Supercomputing Lab */}
              <div className="bento-card bento-card-span-2" style={{ background: 'linear-gradient(135deg, #0B2545, #133E68)', color: '#FFFFFF' }}>
                <div>
                  <span style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', border: '1px solid rgba(217, 119, 6, 0.4)', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Center of Excellence
                  </span>
                  <h3 style={{ fontSize: '1.75rem', color: '#FFFFFF', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                    NVIDIA Supercomputing & Deep AI Lab
                  </h3>
                  <p style={{ color: '#CBD5E1', fontSize: '1rem', lineHeight: 1.6, maxWidth: '600px' }}>
                    Powered by NVIDIA DGX A100 GPU clusters and dedicated 10Gbps fiber backhaul for neural network training and computer vision research.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FCD34D' }}>DGX A100</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Compute Engine</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FCD34D' }}>48 Nodes</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Cluster Architecture</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FCD34D' }}>200 TB</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>NVMe Fast Cache</div>
                  </div>
                </div>
              </div>

              {/* Central Library */}
              <div className="bento-card">
                <div>
                  <span className="pill-badge" style={{ marginBottom: '0.5rem' }}>Knowledge Hub</span>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Central Library</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Over 85,000 volumes, IEEE & ACM digital repositories, with 24/7 air-conditioned reading halls.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => onNavigate('campus')}>
                    Explore Library
                  </button>
                </div>
              </div>

              {/* Advanced Manufacturing Workshop */}
              <div className="bento-card">
                <div>
                  <span className="pill-badge" style={{ marginBottom: '0.5rem' }}>Fabrication</span>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>CNC & Robotics Workshop</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    5-Axis CNC Milling, Wire-cut EDM, and 3D additive printing suites for student racing buggy teams.
                  </p>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => onNavigate('campus')}>
                    Workshop Tour
                  </button>
                </div>
              </div>

              {/* Sports & Hostels */}
              <div className="bento-card bento-card-span-2">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>Campus Life</span>
                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Olympic Sports Complex</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      400m synthetic athletic track, gymnasium, floodlit basketball arena, and professional coaches.
                    </p>
                  </div>
                  <div>
                    <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>Residential</span>
                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Student Hostels</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      1,800 resident capacity with biometric security, solar heating, high-speed WiFi, and multi-cuisine mess.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4.5. RESEARCH, PATENTS & INNOVATION SHOWCASE (COEP BENCHMARK STYLE) */}
      {(isSectionVisible('research_spotlight') || isSectionVisible('innovation_ecosystem')) && (
        <section className="section" style={{ background: 'linear-gradient(135deg, #0B2545 0%, #133E68 100%)', color: '#FFFFFF' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)', marginBottom: '0.75rem' }}>
                  <Microscope size={13} /> Research & Deep-Tech Innovation
                </span>
                <h2 style={{ color: '#FFFFFF', fontSize: '2.2rem', margin: '0.5rem 0 1rem', lineHeight: 1.25 }}>
                  Pioneering Breakthroughs for National Imperatives
                </h2>
                <p style={{ color: '#CBD5E1', fontSize: '1.025rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                  Apex Institute hosts an active, multi-disciplinary research culture with funded R&D grants from DST, ISRO, and DRDO. Our AICTE IDEA Lab empowers student innovators to file patents and launch deep-tech startups before graduation.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FCD34D' }}>₹12.5 Cr+</div>
                    <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Active R&D Grants</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FCD34D' }}>45+</div>
                    <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Published Patents</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FCD34D' }}>18</div>
                    <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Incubated Startups</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-accent btn-lg" onClick={() => onNavigate('research')}>
                    Explore Research Centers & Patents <ArrowRight size={17} />
                  </button>
                  <button className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => onNavigate('departments')}>
                    View Faculty Directory
                  </button>
                </div>
              </div>

              {/* Research Pillars Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: '#2563EB', color: '#FFF', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={18} />
                    </div>
                    <strong style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>AICTE IDEA Lab & CoE in AI</strong>
                  </div>
                  <p style={{ color: '#E2E8F0', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    ₹1.1 Crore facility equipped with 3D scanners, CO2 laser cutters, PCB prototyping, and NVIDIA DGX compute for rapid engineering fabrication.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: '#059669', color: '#FFF', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileCheck size={18} />
                    </div>
                    <strong style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>Patents & Intellectual Property Cell</strong>
                  </div>
                  <p style={{ color: '#E2E8F0', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    Full legal and financial funding for student and faculty patent filings, with 14 commercialized technologies transferred to industry partners.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: '#D97706', color: '#FFF', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={18} />
                    </div>
                    <strong style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>IIC Startup Incubator & Pre-Seed Grant</strong>
                  </div>
                  <p style={{ color: '#E2E8F0', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    Up to ₹5 Lakhs in seed support for student ventures in CleanTech, MedTech, and Autonomous Robotics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Visual Campus Showcase & Image Highlights Section */}
      {(isSectionVisible('gallery_preview') || isSectionVisible('image_showcase')) && gallery.length > 0 && (
        <section className="section" style={{ background: 'var(--color-surface-subtle)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
              <div>
                <span className="pill-badge">
                  <Sparkles size={13} /> Visual Campus Showcase
                </span>
                <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Life, Innovation & Infrastructure</h2>
                <p className="section-desc" style={{ marginBottom: 0 }}>Glimpses into our advanced laboratories, tech fests, student innovations, and lush 50-acre campus.</p>
              </div>
              <button className="btn btn-primary" onClick={() => onNavigate('gallery')}>
                Open Full Gallery ({gallery.length}+ Photos) <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {gallery.slice(0, 6).map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="academic-card"
                  style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  onClick={() => onNavigate('gallery')}
                >
                  <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(11, 37, 69, 0.85)', backdropFilter: 'blur(4px)', color: '#FCD34D', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
                      {item.category}
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Recruiter Marquee */}
      {isSectionVisible('recruiter_marquee') && recruiters.length > 0 && (
        <section className="section" style={{ background: '#FFFFFF' }}>
          <div className="container">
            <div className="section-header">
              <span className="pill-badge">Corporate Collaborations</span>
              <h2 className="section-title">Where Our Graduates Work</h2>
              <p className="section-desc">Over 350+ technology enterprises hire from Apex Institute campus placements annually.</p>
            </div>

            <div className="marquee-container">
              <div className="marquee-track">
                {recruiters.concat(recruiters).map((r, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.85, transition: 'opacity 150ms ease' }}>
                    <img src={r.logoUrl} alt={r.name} style={{ height: '36px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginTop: '0.35rem' }}>{r.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={() => onNavigate('placements')}>
                Detailed Placement Report <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 7. Director's Leadership Message */}
      {isSectionVisible('director_message') && (
        <section className="section">
          <div className="container">
            <div className="academic-card" style={{ padding: '3rem 2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80"
                    alt="Director"
                    style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}
                  />
                </div>
                <div>
                  <span className="pill-badge">Executive Leadership</span>
                  <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0.5rem 0' }}>Director & Principal's Address</h2>
                  <p style={{ color: 'var(--color-accent)', fontWeight: 700, marginBottom: '1rem' }}>
                    Dr. Keshav N. Nandurkar • Ph.D. (IIT Roorkee), Fellow IEI
                  </p>
                  <blockquote style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', lineHeight: 1.7, borderLeft: '3px solid var(--color-accent)', paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                    "For four decades, our autonomous institute has nurtured engineering leaders who build multinational software systems, conduct funded scientific research, and pioneer indigenous deep-tech startups. Our academic curriculum is synchronized with global industry revolutions."
                  </blockquote>
                  <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('about')}>
                    Discover Our 40-Year Heritage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. Custom Admin Added Image Sections */}
      {customSections.map((cs) => (
        <section key={cs._id || cs.sectionKey} className="section" style={{ background: 'var(--color-bg)' }}>
          <div className="container">
            {cs.layoutType === 'image_banner' ? (
              <div 
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  minHeight: '380px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '3rem 2.5rem',
                  backgroundImage: cs.imageUrl ? `url('${cs.imageUrl}')` : 'linear-gradient(135deg, #0B2545, #133E68)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(11, 37, 69, 0.78)', backdropFilter: 'blur(2px)' }} />
                <div style={{ position: 'relative', zIndex: 10, maxWidth: '640px', color: '#FFFFFF' }}>
                  {cs.badge && (
                    <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.3)', color: '#FCD34D', marginBottom: '1rem' }}>
                      {cs.badge}
                    </span>
                  )}
                  <h2 style={{ fontSize: '2.2rem', color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: 1.2 }}>{cs.title}</h2>
                  {cs.subtitle && <p style={{ fontSize: '1.1rem', color: '#CBD5E1', marginBottom: '1.5rem', lineHeight: 1.6 }}>{cs.subtitle}</p>}
                  {cs.content && <p style={{ fontSize: '0.95rem', color: '#E2E8F0', marginBottom: '1.5rem', lineHeight: 1.6 }}>{cs.content}</p>}
                  {cs.ctaText && (
                    <button 
                      className="btn btn-accent btn-lg"
                      onClick={() => {
                        if (cs.ctaLink?.startsWith('#')) onNavigate(cs.ctaLink.replace('#', ''));
                        else if (cs.ctaLink) window.open(cs.ctaLink, '_blank');
                        else onOpenInquiry();
                      }}
                    >
                      {cs.ctaText} <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="academic-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                  {cs.imageUrl && (
                    <img 
                      src={cs.imageUrl} 
                      alt={cs.title} 
                      style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} 
                    />
                  )}
                  <div>
                    {cs.badge && <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>{cs.badge}</span>}
                    <h2 style={{ fontSize: '1.85rem', color: 'var(--color-primary)', margin: '0.5rem 0' }}>{cs.title}</h2>
                    {cs.subtitle && <p style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '0.75rem' }}>{cs.subtitle}</p>}
                    {cs.content && <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{cs.content}</p>}
                    {cs.ctaText && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          if (cs.ctaLink?.startsWith('#')) onNavigate(cs.ctaLink.replace('#', ''));
                          else if (cs.ctaLink) window.open(cs.ctaLink, '_blank');
                          else onOpenInquiry();
                        }}
                      >
                        {cs.ctaText} <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* 9. Call to Action Banner */}
      {isSectionVisible('admissions_cta') && (
        <section style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: '#FFFFFF', padding: '4.5rem 0', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '780px' }}>
            <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)', marginBottom: '1rem' }}>
              ADMISSIONS 2026-27
            </span>
            <h2 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginBottom: '1rem' }}>Take the First Step Towards Excellence</h2>
            <p style={{ color: '#CBD5E1', fontSize: '1.15rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Explore our NAAC A++ accredited degree programs in Computer Engineering, AI & Data Science, Electronics, Mechanical, and MBA.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-accent btn-lg" onClick={() => onOpenInquiry()}>
                Submit Online Inquiry
              </button>
              <button className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => onNavigate('admissions')}>
                Admission Guidelines & Schedule
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Floating Enquire Now Button (VIT Pune Signature Benchmark) */}
      <button
        onClick={() => onOpenInquiry()}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '28px',
          zIndex: 999,
          background: 'linear-gradient(90deg, #021B4C 0%, #003294 100%)',
          color: '#FFFFFF',
          border: '2px solid #FCD34D',
          borderRadius: '50px',
          padding: '0.65rem 1.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 8px 24px rgba(0, 33, 71, 0.4)',
          cursor: 'pointer',
          transition: 'all 200ms ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ED2226';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(90deg, #021B4C 0%, #003294 100%)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Enquire Now for Admissions 2026-27"
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
        <span>Enquire Now</span>
      </button>
    </div>
  );
}
