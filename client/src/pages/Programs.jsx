import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Clock, Users, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile, getProgramTabs } from '../content/institutionProfile';

export default function Programs({ settings = {}, onNavigate, onOpenInquiry }) {
  const profile = getInstitutionProfile(settings);
  const [courses, setCourses] = useState([]);
  const [degreeFilter, setDegreeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await api.get('/api/v1/public/courses');
        setCourses(res.data || []);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const degrees = getProgramTabs(courses, profile);

  const filteredCourses = courses.filter(c => {
    const matchesDegree = degreeFilter === 'All'
      ? true
      : (c.degree || '').toLowerCase().includes(degreeFilter.toLowerCase());
    const matchesSearch = searchQuery === ''
      ? true
      : (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.departmentCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDegree && matchesSearch;
  });

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      <section style={{ background: 'linear-gradient(135deg, #0B1E36 0%, #153A6B 100%)', color: '#FFFFFF', padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4.5rem) 0', borderBottom: '4px solid #D97706' }}>
        <div className="container">
          <div style={{ maxWidth: '850px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', border: '1px solid rgba(217, 119, 6, 0.45)', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              <GraduationCap size={15} /> {profile.programsLabel}
            </div>
            <h1 className="page-hero-title" style={{ margin: '0 0 1rem 0' }}>
              Programs built for the selected institution profile
            </h1>
            <p className="page-hero-subtitle" style={{ margin: '0 0 2rem 0' }}>
              This catalog can represent engineering, pharmacy, school, or multi-college program groups without changing the page layout.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> CMS Managed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> Profile Driven
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> Editable by Admin
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-1.75rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFFFFF', padding: '1.25rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {degrees.map(deg => (
              <button key={deg} onClick={() => setDegreeFilter(deg)} style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: degreeFilter === deg ? '1px solid #2563EB' : '1px solid #E2E8F0', background: degreeFilter === deg ? '#2563EB' : '#F8FAFC', color: degreeFilter === deg ? '#FFFFFF' : '#475569', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 150ms ease' }}>
                {deg}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', borderRadius: '8px', padding: '0.45rem 0.85rem', width: '100%', maxWidth: '280px' }}>
            <Search size={16} style={{ color: '#94A3B8' }} />
            <input type="text" placeholder="Search by program or keyword..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '100%', color: '#1E293B' }} />
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Available Programs ({filteredCourses.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
              Program cards can be reused for degrees, streams, schools, or training tracks.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenInquiry?.()}>
            Apply / Enquire <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid #CBD5E1', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748B', fontWeight: 500 }}>Loading program catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <BookOpen size={40} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#1E293B', marginBottom: '0.5rem' }}>No matching programs found</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Try another filter or clear your search term.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => { setDegreeFilter('All'); setSearchQuery(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
            {filteredCourses.map(course => (
              <div key={course._id || course.id} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 180ms ease, box-shadow 180ms ease' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      {course.degree || profile.programsLabel}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Unit: {course.departmentCode || 'CMS'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.6rem', lineHeight: 1.35 }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.55, margin: '0 0 1.25rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || 'Program details, eligibility, and curriculum highlights are editable by the administrator.'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', background: '#F8FAFC', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Clock size={15} style={{ color: '#2563EB', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Duration: <strong style={{ color: '#0F172A' }}>{course.duration || 'As per curriculum'}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Users size={15} style={{ color: '#059669', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Intake: <strong style={{ color: '#0F172A' }}>{course.intake || 'Approved seats'}</strong>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    <strong style={{ color: '#0F172A' }}>Eligibility:</strong> {course.eligibility || 'Eligibility details can be customized in the CMS.'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onOpenInquiry?.(course.title)}>
                    Inquire / Apply
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.75rem' }} onClick={() => setSelectedProgram(course)} title="View details">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProgram && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={() => setSelectedProgram(null)}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>{selectedProgram.degree}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0 0' }}>{selectedProgram.title}</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>Offered by {selectedProgram.departmentCode || 'CMS Unit'}</div>
              </div>
              <button onClick={() => setSelectedProgram(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                x
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div><div style={{ fontSize: '0.75rem', color: '#64748B' }}>Duration</div><strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedProgram.duration || 'As per curriculum'}</strong></div>
              <div><div style={{ fontSize: '0.75rem', color: '#64748B' }}>Annual Intake</div><strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedProgram.intake || 'Approved seats'}</strong></div>
              <div><div style={{ fontSize: '0.75rem', color: '#64748B' }}>Approval</div><strong style={{ fontSize: '0.9rem', color: '#059669' }}>Institutional</strong></div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Program Overview</h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{selectedProgram.description}</p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Eligibility and Prerequisites</h4>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#1E40AF', lineHeight: 1.5 }}>
                {selectedProgram.eligibility}
              </div>
            </div>

            {selectedProgram.careerOpportunities && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Career Opportunities</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{selectedProgram.careerOpportunities}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelectedProgram(null); onOpenInquiry?.(selectedProgram.title); }}>
                Apply for {selectedProgram.title} <ArrowRight size={15} />
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedProgram(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
