import React, { useState, useEffect } from 'react';
import { 
  Award, CheckCircle, Clock, Globe, Shield, Users, BookOpen, 
  Building2, Target, HeartHandshake, Compass, GraduationCap, 
  FileText, ExternalLink, Sparkles, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function About({ settings = {}, onNavigate }) {
  const [pageData, setPageData] = useState(null);
  const [subsections, setSubsections] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    async function loadAboutData() {
      try {
        setLoadingSubs(true);
        const [pageRes, subRes] = await Promise.all([
          api.get('/api/v1/public/pages/about').catch(() => null),
          api.get('/api/v1/public/subsections?pageSlug=about').catch(() => null)
        ]);
        if (pageRes?.data) setPageData(pageRes.data);
        if (subRes?.data) setSubsections(subRes.data);
      } catch (err) {
        console.error('Failed to load about data:', err);
      } finally {
        setLoadingSubs(false);
      }
    }
    loadAboutData();
  }, []);

  const milestones = [
    { year: '1984', title: 'Foundational Genesis', desc: 'Established under the visionary leadership of eminent philanthropists with 3 undergraduate engineering disciplines.' },
    { year: '1995', title: 'Postgraduate & Research Expansion', desc: 'Introduced Master of Engineering (ME/M.Tech) and recognized Ph.D. research centers affiliated with the state university.' },
    { year: '2008', title: 'Center of Excellence & Industry Tie-ups', desc: 'Inaugurated dedicated research clusters in AI, Robotics, and high-performance automotive manufacturing.' },
    { year: '2019', title: 'Conferment of Autonomous Status', desc: 'UGC and Government granted academic autonomy, enabling industry-synchronized dynamic curricula and credit systems.' },
    { year: '2023', title: 'NAAC A++ Grade Accreditation', desc: 'Highest institutional distinction awarded by NAAC with CGPA of 3.65 for quality education, research, and campus governance.' },
    { year: '2026', title: 'Next-Gen Quantum & DeepTech Hub', desc: 'Commenced autonomous AI Supercomputing center with NVIDIA DGX A100 systems and clean energy research parks.' }
  ];

  const leadership = [
    {
      name: 'Dr. K. N. Nandurkar',
      role: 'Principal & Executive Director',
      degree: 'Ph.D. (IIT Bombay), M.Tech (Production Engg.)',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      message: 'Our educational philosophy is anchored on turning theoretical rigor into deployable engineering breakthroughs. As an autonomous institution, we empower our students not merely to graduate with high honors, but to engineer responsible solutions for the challenges of tomorrow.'
    },
    {
      name: 'Prof. Ramesh K. Deshmukh',
      role: 'Dean - Academic Affairs',
      degree: 'Ph.D. (IISc Bangalore), Senior IEEE Member',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      message: 'Continuous syllabus revision with corporate advisory councils ensures our engineering and management students graduate with zero knowledge deficit relative to modern global industrial standards.'
    },
    {
      name: 'Dr. Sunita V. Sharma',
      role: 'Dean - Research & Innovation (R&D)',
      degree: 'Ph.D. (Computer Science), Post-Doc (NUS Singapore)',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      message: 'Through active industry-sponsored laboratories and multi-crore research grants, our undergraduates regularly publish in high-impact Scopus & SCI indexed journals and file international patents.'
    }
  ];

  const accreditations = [
    { title: 'NAAC A++ Grade', subtitle: 'National Assessment & Accreditation Council', detail: 'Awarded CGPA of 3.65 on a 4.0 scale', icon: Award, color: '#D97706' },
    { title: 'NBA Tier-1 Accredited', subtitle: 'National Board of Accreditation', detail: 'Eligible under the international Washington Accord', icon: Shield, color: '#2563EB' },
    { title: 'UGC Autonomous Status', subtitle: 'University Grants Commission', detail: 'Complete curricular, examination & academic freedom', icon: BookOpen, color: '#7C3AED' },
    { title: 'AICTE Approved', subtitle: 'All India Council for Technical Education', detail: 'Statutory approval for all UG, PG & Doctoral courses', icon: CheckCircle, color: '#059669' },
    { title: 'ISO 9001:2015 Certified', subtitle: 'International Organization for Standardization', detail: 'Standardized quality management systems across campus', icon: Globe, color: '#0284C7' },
    { title: 'NIRF Ranking Band', subtitle: 'Ministry of Education, Govt. of India', detail: 'Ranked among top engineering institutions in the western region', icon: Sparkles, color: '#E11D48' }
  ];

  const coreValues = [
    { title: 'Academic Rigor', desc: 'Uncompromising standard of technical education blended with deep mathematical foundations.', icon: GraduationCap },
    { title: 'Innovative Research', desc: 'Encouraging patent filings, scientific paper publications, and cross-disciplinary solutions.', icon: Target },
    { title: 'Ethical Leadership', desc: 'Inculcating civic responsibility, engineering ethics, integrity, and sustainability.', icon: HeartHandshake },
    { title: 'Global Inclusivity', desc: 'Welcoming diverse talents with merit scholarships, equal opportunity, and mentoring.', icon: Compass }
  ];

  return (
    <div style={{ background: '#F8FAFC' }}>
      {/* 1. HERO BANNER */}
      <div style={{
        background: pageData?.heroImageUrl 
          ? `linear-gradient(rgba(11, 37, 69, 0.85), rgba(19, 62, 104, 0.9)), url(${pageData.heroImageUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0B2545 0%, #133E68 100%)',
        color: '#FFFFFF',
        padding: '5rem 0 4rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)', marginBottom: '1rem' }}>
            <Sparkles size={13} /> {pageData?.heroBadge || 'INSTITUTIONAL PROFILE & HERITAGE'}
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: '3rem', fontWeight: 800, marginTop: '0.75rem', lineHeight: 1.2 }}>
            {pageData?.heroTitle || `About ${settings.college_name || 'Apex Institute of Engineering & Technology'}`}
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.25rem', maxWidth: '820px', marginTop: '1rem', lineHeight: 1.6 }}>
            {pageData?.heroSubtitle || 'Over four decades of autonomous engineering excellence, groundbreaking scientific research, world-class faculty, and visionary nation-building.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Award size={18} style={{ color: '#FCD34D' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>NAAC A++ Grade (CGPA 3.65)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Shield size={18} style={{ color: '#60A5FA' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>NBA Tier-1 Accredited</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Clock size={18} style={{ color: '#34D399' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Autonomous Institution Since 2019</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW & HERITAGE SUMMARY */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <span className="pill-badge-blue">The Institutional Legacy</span>
              <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Cultivating Engineers, Innovators & Global Leaders</h2>
              {pageData?.content ? (
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                  {pageData.content}
                </p>
              ) : (
                <>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.8, fontSize: '1.05rem' }}>
                    Established in 1984, {settings.college_name || 'Apex Institute'} stands as one of the nation's foremost autonomous centers for technical learning. Nestled within a sprawling 50-acre verdant green campus, we offer rigorous undergraduate, postgraduate, and doctoral degree programs across all contemporary engineering disciplines.
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.8, fontSize: '1.05rem' }}>
                    With UGC autonomy, our curriculum is engineered in real-time alignment with corporate technology leaders like Microsoft, NVIDIA, TCS, and Siemens. We foster an ecosystem where hands-on laboratory discovery, cross-disciplinary patents, and venture incubation thrive side by side.
                  </p>
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>40+</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Years Legacy</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#D97706' }}>12,000+</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Global Alumni</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#059669' }}>95%+</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Placement Rate</div>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80"
                alt="Main Academic Campus"
                style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '16px', boxShadow: 'var(--shadow-xl)' }}
              />
              <div style={{ position: 'absolute', bottom: '-20px', right: '20px', background: '#FFFFFF', padding: '1.25rem 1.75rem', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', maxWidth: '280px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>50 Acres</div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  State-of-the-art academic blocks, research centers, and sports arenas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISION, MISSION & VALUES */}
      <section className="section" style={{ background: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="pill-badge-blue">Charter of Purpose</span>
            <h2 className="section-title">Institutional Vision & Mission</h2>
            <p className="section-desc">Guided by the commitment to intellectual pursuit, national development, and ethical leadership.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
            <div className="academic-card" style={{ borderTop: '5px solid #2563EB', padding: '2.5rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>Our Vision</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.025rem', margin: 0 }}>
                To be a globally recognized autonomous temple of higher learning and scientific discovery, producing technically exceptional, ethically upright, and socially committed engineers capable of pioneering innovative solutions for global sustainability and welfare.
              </p>
            </div>

            <div className="academic-card" style={{ borderTop: '5px solid #D97706', padding: '2.5rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={22} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>Our Mission</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.025rem', margin: 0 }}>
                To deliver forward-looking, interdisciplinary engineering education enriched by active industrial partnerships, instill a culture of rigorous scientific inquiry, and foster entrepreneurial vigor among students while nurturing empathy, integrity, and ethical citizenship.
              </p>
            </div>
          </div>

          {/* Core Values 4-Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#FFFFFF', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
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

      {/* 4. LEADERSHIP & PRINCIPAL'S DESK */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="pill-badge-blue">Academic Governance</span>
            <h2 className="section-title">Leadership & Principal's Desk</h2>
            <p className="section-desc">Distinguished academicians, administrators, and researchers driving the institute's visionary trajectory.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {leadership.map((leader, idx) => (
              <div key={idx} className="academic-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <img
                    src={leader.image}
                    alt={leader.name}
                    style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563EB', boxShadow: 'var(--shadow-md)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                      {leader.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginTop: '0.2rem' }}>
                      {leader.role}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                      {leader.degree}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                    "{leader.message}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ACCREDITATIONS & RECOGNITIONS */}
      <section className="section" style={{ background: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="pill-badge-blue">Quality Benchmarks</span>
            <h2 className="section-title">Accreditations, Approvals & Ratings</h2>
            <p className="section-desc">National and international validation affirming highest tiers of pedagogical excellence.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {accreditations.map((acc, idx) => {
              const Icon = acc.icon;
              return (
                <div key={idx} style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FFFFFF', color: acc.color, border: `1px solid ${acc.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
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

      {/* 6. HISTORICAL MILESTONES TIMELINE */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="pill-badge-blue">Four Decades of Growth</span>
            <h2 className="section-title">Institutional Journey & Milestones</h2>
            <p className="section-desc">A chronological roadmap charting four decades of relentless innovation and institutional maturity.</p>
          </div>

          <div style={{ position: 'relative', maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {milestones.map((m, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1.5rem', background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', borderRight: '2px solid #2563EB', paddingRight: '1.5rem' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB', lineHeight: 1 }}>{m.year}</div>
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
        </div>
      </section>

      {/* 7. DYNAMIC SUBSECTIONS FROM CMS / MONGODB */}
      {subsections && subsections.length > 0 && (
        <section className="section" style={{ background: '#F1F5F9', borderTop: '1px solid var(--color-border)' }}>
          <div className="container">
            <div className="section-header">
              <span className="pill-badge">CMS Managed Sections</span>
              <h2 className="section-title">Special Institutional Features</h2>
              <p className="section-desc">Dynamic modules managed via the Admin CMS for this page.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {subsections.map((sub, idx) => (
                <div key={sub._id || idx} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
                  {sub.layoutType === 'image_banner' ? (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', minHeight: '260px', display: 'flex', alignItems: 'center', padding: '2.5rem', color: '#FFFFFF', backgroundImage: `linear-gradient(rgba(15,23,42,0.8), rgba(15,23,42,0.85)), url(${sub.imageUrl || ''})`, backgroundSize: 'cover' }}>
                      <div style={{ maxWidth: '640px' }}>
                        {sub.badge && <span className="pill-badge" style={{ marginBottom: '0.75rem' }}>{sub.badge}</span>}
                        <h3 style={{ fontSize: '1.85rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '0.5rem' }}>{sub.title}</h3>
                        {sub.subtitle && <p style={{ fontSize: '1.05rem', color: '#93C5FD', fontWeight: 600 }}>{sub.subtitle}</p>}
                        <p style={{ fontSize: '0.95rem', color: '#CBD5E1', lineHeight: 1.7, margin: 0 }}>{sub.content}</p>
                        {sub.ctaText && sub.ctaLink && (
                          <a href={sub.ctaLink} className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
                            {sub.ctaText} <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: sub.imageUrl ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '2.5rem', alignItems: 'center' }}>
                      <div>
                        {sub.badge && <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>{sub.badge}</span>}
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{sub.title}</h3>
                        {sub.subtitle && <p style={{ fontSize: '1rem', color: '#2563EB', fontWeight: 600, marginBottom: '0.75rem' }}>{sub.subtitle}</p>}
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, margin: 0 }}>{sub.content}</p>
                        {sub.ctaText && sub.ctaLink && (
                          <a href={sub.ctaLink} className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                            {sub.ctaText} <ChevronRight size={16} />
                          </a>
                        )}
                      </div>
                      {sub.imageUrl && (
                        <div>
                          <img src={sub.imageUrl} alt={sub.title} style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CALL TO ACTION: ADMISSIONS & CONTACT */}
      <section style={{ background: 'linear-gradient(135deg, #0B2545 0%, #133E68 100%)', color: '#FFFFFF', padding: '4.5rem 0', textAlign: 'center' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', marginBottom: '1rem' }}>
            BECOME PART OF OUR LEGACY
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', margin: '0.75rem 0 1rem 0' }}>
            Ready to Begin Your Autonomous Engineering Journey?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.15rem', maxWidth: '640px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
            Explore our state-approved degree programs, research facilities, and join thousands of successful alumni shaping the global tech landscape.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('admissions')}>
              Explore Admissions 2026-27 <ChevronRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)' }} onClick={() => onNavigate('contact')}>
              Connect with Admissions Desk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
