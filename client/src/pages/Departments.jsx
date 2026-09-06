import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, BookOpen, Layers, Mail, Phone, ArrowRight, 
  Search, CheckCircle2, User, Award, Microscope, ExternalLink, X 
} from 'lucide-react';
import { api } from '../services/api';

export default function Departments({ onNavigate }) {
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptDetails, setDeptDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/v1/public/departments');
        setDepartments(res.data || []);
      } catch (e) {
        console.error('Failed to load departments', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleOpenDetails = async (dept) => {
    setSelectedDept(dept);
    setDetailsLoading(true);
    try {
      const res = await api.get(`/api/v1/public/departments/${dept.code}`);
      if (res.success) {
        setDeptDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to load department details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredDepts = departments.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (d.name || '').toLowerCase().includes(q) ||
           (d.code || '').toLowerCase().includes(q) ||
           (d.hodName || '').toLowerCase().includes(q) ||
           (d.overview || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Header Showcase Banner (VIT Pune & KKW Inspired) */}
      <section style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #0F3860 100%)',
        color: '#FFFFFF',
        padding: '5rem 0 4.5rem 0',
        borderBottom: '4px solid var(--color-accent)',
        position: 'relative'
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
              <Building2 size={15} /> Academic Disciplines & Departments
            </div>
            <h1 style={{ fontSize: '2.85rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem 0', color: '#FFFFFF' }}>
              Specialized Engineering & Management Departments
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
              Led by distinguished doctorates and industry researchers across advanced computational clusters, robotics testbeds, and state-of-the-art materials fabrication laboratories.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> NBA Tier-1 Accredited Departments
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> 100% Ph.D. & Doctorate Faculty Chairs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0', fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} /> Industry Sponsored Laboratories
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search Filter Bar */}
      <div className="container" style={{ marginTop: '-1.75rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1E293B', fontWeight: 700, fontSize: '0.95rem' }}>
            <Building2 size={18} style={{ color: '#2563EB' }} /> Explore Academic Divisions ({filteredDepts.length})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', borderRadius: '8px', padding: '0.45rem 0.85rem', width: '320px' }}>
            <Search size={16} style={{ color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search department, HOD or code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '100%', color: '#1E293B' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Departments Grid */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ width: '36px', height: '36px', border: '3px solid #CBD5E1', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748B', fontWeight: 500 }}>Loading academic departments...</p>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <p style={{ color: '#64748B' }}>No departments matching your search query.</p>
            <button className="btn btn-secondary btn-sm" onClick={() => setSearchQuery('')}>Clear Search</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
            {filteredDepts.map(dept => (
              <div 
                key={dept._id || dept.id || dept.code}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Department Image with Code Badge */}
                  <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                    <img
                      src={dept.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'}
                      alt={dept.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', color: '#FFFFFF', backdropFilter: 'blur(4px)', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                      {dept.code}
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: '#2563EB', color: '#FFFFFF', padding: '0.15rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {dept.degreeLevels || 'B.Tech | M.Tech | Ph.D.'}
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    {/* Department Title */}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                      {dept.name}
                    </h3>

                    {/* Overview */}
                    <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.55, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {dept.overview || 'Dedicated to advancing innovative curriculum, cutting-edge laboratories, and research publication excellence in specialized engineering domains.'}
                    </p>

                    {/* HOD Profile Card (VIT Pune style) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: '#F8FAFC',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1.5px solid #2563EB'
                      }}>
                        {dept.hodImage ? (
                          <img src={dept.hodImage} alt={dept.hodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={22} style={{ color: '#2563EB' }} />
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Head of Department</div>
                        <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dept.hodName || 'Dr. Department Head'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#2563EB' }}>{dept.email || 'hod@apex-inst.edu'}</span>
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', background: '#F1F5F9', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <div>
                        <span style={{ display: 'block', color: '#64748B' }}>Intake</span>
                        <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{dept.studentIntake || 180}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#64748B' }}>Faculty</span>
                        <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{dept.facultyCount || 24}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#64748B' }}>Labs</span>
                        <strong style={{ color: '#059669', fontSize: '0.85rem' }}>12+</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.5rem', background: '#FAFAFA' }}>
                  <button 
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleOpenDetails(dept)}
                  >
                    View Faculty & Labs
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigate('programs')}
                    title="View degree courses"
                  >
                    Courses
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Department Details & Faculty Modal */}
      {selectedDept && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setSelectedDept(null)}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="pill-badge-blue" style={{ marginBottom: '0.4rem' }}>{selectedDept.code} • {selectedDept.degreeLevels}</span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0' }}>
                  {selectedDept.name}
                </h2>
              </div>
              <button onClick={() => setSelectedDept(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>

            {/* HOD Callout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', background: '#EFF6FF', flexShrink: 0, border: '2px solid #2563EB' }}>
                {selectedDept.hodImage ? (
                  <img src={selectedDept.hodImage} alt={selectedDept.hodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={36} style={{ color: '#2563EB', margin: '10px auto' }} />
                )}
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Head of Department</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0.1rem 0' }}>{selectedDept.hodName || 'Dr. Department Head'}</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Email: {selectedDept.email || 'hod@apex-inst.edu'} | Phone: {selectedDept.phone || '+91 253 251 2876'}</div>
              </div>
            </div>

            {/* Department Vision & Overview */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Department Overview</h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {selectedDept.overview}
              </p>
            </div>

            {/* Faculty List (if loaded) */}
            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>Loading faculty directory...</div>
            ) : (
              deptDetails?.faculty && deptDetails.faculty.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem' }}>
                    Department Faculty Directory ({deptDetails.faculty.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {deptDetails.faculty.map(f => (
                      <div key={f._id || f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{f.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{f.designation} • {f.qualification}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', background: '#EFF6FF', color: '#2563EB', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {f.researchAreas || 'Core Engineering'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <button 
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setSelectedDept(null); onNavigate('programs'); }}
              >
                View Degree Programs <ArrowRight size={15} />
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedDept(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
