import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Search, Clock, Users, ArrowRight, CheckCircle2, 
  Award, BookOpen, Briefcase, ChevronRight, Filter, DollarSign 
} from 'lucide-react';
import { api } from '../services/api';

export default function Programs({ onNavigate, onOpenInquiry }) {
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

  const degrees = ['All', 'B.Tech', 'M.Tech', 'MBA', 'MCA', 'Ph.D.'];

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
      {/* 1. Hero Showcase Banner (MIT-WPU Inspired) */}
      <section style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #0F3860 100%)',
        color: '#FFFFFF',
        padding: '5rem 0 4.5rem 0',
        position: 'relative',
        borderBottom: '4px solid var(--color-accent)'
      }}>
        <div className="container">
          <div style={{ maxWidth: '840px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(217, 119, 6, 0.22)',
              color: '#FCD34D',
              border: '1px solid rgba(217, 119, 6, 0.45)',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              <GraduationCap size={15} /> Academic Degree Programs 2026-27
            </div>
            <h1 style={{ fontSize: '2.85rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem 0', color: '#FFFFFF' }}>
              Transformative Degree Programs Engineered for the Future
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
              Choose from undergraduate, postgraduate, and doctoral programs aligned with NEP 2020, offering hands-on industry apprenticeships, multidisciplinary minors, and global dual-degree prospects.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> AICTE Approved & Autonomous
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> NBA Accredited Programs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> Industry Capstone Projects
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter & Search Controls */}
      <div className="container" style={{ marginTop: '-1.75rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Degree Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {degrees.map(deg => (
              <button
                key={deg}
                onClick={() => setDegreeFilter(deg)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  border: degreeFilter === deg ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  background: degreeFilter === deg ? '#2563EB' : '#F8FAFC',
                  color: degreeFilter === deg ? '#FFFFFF' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                {deg}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', borderRadius: '8px', padding: '0.45rem 0.85rem', width: '280px' }}>
            <Search size={16} style={{ color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by course or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '100%', color: '#1E293B' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Program Cards Grid */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Available Academic Programs ({filteredCourses.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
              Showing curated degree programs approved by Academic Council and University.
            </p>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onOpenInquiry?.()}
          >
            Apply for Admission 2026-27 <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid #CBD5E1', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748B', fontWeight: 500 }}>Loading curriculum catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <BookOpen size={40} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#1E293B', marginBottom: '0.5rem' }}>No matching programs found</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Try choosing another degree level tab or clearing your search term.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => { setDegreeFilter('All'); setSearchQuery(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredCourses.map(course => (
              <div 
                key={course._id || course.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 180ms ease, box-shadow 180ms ease'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span style={{
                      background: course.degree === 'B.Tech' ? '#EFF6FF' : course.degree === 'M.Tech' ? '#F5F3FF' : course.degree === 'MBA' ? '#ECFDF5' : '#FEF3C7',
                      color: course.degree === 'B.Tech' ? '#2563EB' : course.degree === 'M.Tech' ? '#7C3AED' : course.degree === 'MBA' ? '#059669' : '#D97706',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {course.degree}
                    </span>

                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Dept: {course.departmentCode || 'ENGR'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.6rem', lineHeight: 1.35 }}>
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.55, margin: '0 0 1.25rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || 'Comprehensive curriculum offering cutting-edge theoretical depth and practical laboratory projects aligned with industry accreditation standards.'}
                  </p>

                  {/* Quick Spec Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.65rem',
                    background: '#F8FAFC',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Clock size={15} style={{ color: '#2563EB', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Duration: <strong style={{ color: '#0F172A' }}>{course.duration || '4 Years'}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Users size={15} style={{ color: '#059669', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Approved Intake: <strong style={{ color: '#0F172A' }}>{course.intake || 120} Seats</strong>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    <strong style={{ color: '#0F172A' }}>Eligibility:</strong> {course.eligibility || 'Passed 10+2 with Physics & Mathematics with min 50% marks; Valid CET/JEE Score.'}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => onOpenInquiry?.(course.title)}
                  >
                    Inquire / Apply
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem 0.75rem' }}
                    onClick={() => setSelectedProgram(course)}
                    title="View syllabus & details"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Program Detail Modal */}
      {selectedProgram && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setSelectedProgram(null)}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>{selectedProgram.degree}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {selectedProgram.title}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Offered by Department of {selectedProgram.departmentCode}
                </div>
              </div>
              <button 
                onClick={() => setSelectedProgram(null)}
                style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Duration</div>
                <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedProgram.duration || '4 Years'}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Annual Intake</div>
                <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{selectedProgram.intake || 120} Seats</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Approval</div>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>AICTE / NBA</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Program Overview</h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {selectedProgram.description}
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Eligibility & Admission Prerequisites</h4>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#1E40AF', lineHeight: 1.5 }}>
                {selectedProgram.eligibility}
              </div>
            </div>

            {selectedProgram.careerOpportunities && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Career Opportunities & Industry Roles</h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {selectedProgram.careerOpportunities}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button 
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setSelectedProgram(null);
                  onOpenInquiry?.(selectedProgram.title);
                }}
              >
                Apply for {selectedProgram.title} <ArrowRight size={15} />
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedProgram(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
