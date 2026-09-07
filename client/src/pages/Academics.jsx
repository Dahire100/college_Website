import React from 'react';
import { BookOpen, Award, GraduationCap, CheckCircle2, ArrowRight, Compass, Clock, ShieldCheck, Briefcase } from 'lucide-react';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function Academics({ settings = {}, onNavigate }) {
  const profile = getInstitutionProfile(settings);
  const schools = [
    { name: 'School of Science and Technology', departments: ['Core Programs', 'Applied Labs', 'Research Cells'], dean: 'Managed by CMS', thrust: 'Computing, science, and applied learning', code: 'SST' },
    { name: 'School of Professional Studies', departments: ['Professional Programs', 'Skill Tracks', 'Industry Projects'], dean: 'Managed by CMS', thrust: 'Career-aligned professional education', code: 'SPS' },
    { name: 'School of Health and Allied Studies', departments: ['Pharmacy', 'Health Sciences', 'Training Units'], dean: 'Managed by CMS', thrust: 'Health, pharmacy, and clinical practice', code: 'SHA' },
    { name: 'School of Schooling and Junior College', departments: ['School Sections', 'Junior College', 'Parent Services'], dean: 'Managed by CMS', thrust: 'Foundational education and college streams', code: 'SSJ' }
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      <section style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0F3860 100%)', color: '#FFFFFF', padding: '5rem 0 4.5rem 0', borderBottom: '4px solid var(--color-accent)', position: 'relative' }}>
        <div className="container">
          <div style={{ maxWidth: '840px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(217, 119, 6, 0.22)', color: '#FCD34D', border: '1px solid rgba(217, 119, 6, 0.45)', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              <BookOpen size={15} /> Academic Framework
            </div>
            <h1 style={{ fontSize: '2.85rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem 0', color: '#FFFFFF' }}>
              Flexible academic structure for multiple institution types
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
              The same page can represent engineering, pharmacy, school, or general college content with the selected profile.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => onNavigate('programs')}>
                Explore Programs <ArrowRight size={16} />
              </button>
              <button className="btn btn-secondary" onClick={() => onNavigate('departments')}>
                View Academic Units
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>Core Academic Pillars</h2>
          <p style={{ fontSize: '0.95rem', color: '#64748B' }}>
            Use this section for curriculum design, delivery model, and institutional quality markers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Curriculum Design</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>Build a curriculum framework that suits the current institution profile and program catalog.</p>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Academic Quality</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>Keep accreditation, approvals, and quality statements editable from the CMS settings.</p>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Briefcase size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Outcomes</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>Show placements, internships, higher education, or student progress depending on the profile.</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Academic Units</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0' }}>Reused for departments, schools, divisions, or program groupings.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('departments')}>
            View All Units <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {schools.map(school => (
            <div key={school.code} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>{school.code}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Lead: <strong>{school.dean}</strong></span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem', lineHeight: 1.35 }}>{school.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1rem' }}><strong>Focus:</strong> {school.thrust}</p>
              <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Constituent Units</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {school.departments.map(dept => <span key={dept} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', color: '#1E293B', fontWeight: 500 }}>{dept}</span>)}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('programs')}>
                View Programs in this Unit
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ marginTop: '4rem' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2.5rem' }}>
          <span className="pill-badge-blue" style={{ marginBottom: '0.75rem' }}>Evaluation</span>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0 0.75rem' }}>Assessment and Progress Framework</h2>
          <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Use this area for academic rules, grading, attendance, credit systems, or parent/student policies.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}><strong style={{ fontSize: '1.1rem', color: '#2563EB', display: 'block' }}>SGPA / CGPA</strong><span style={{ fontSize: '0.8rem', color: '#64748B' }}>Evaluation model</span></div>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}><strong style={{ fontSize: '1.1rem', color: '#059669', display: 'block' }}>Credits</strong><span style={{ fontSize: '0.8rem', color: '#64748B' }}>Program-wise requirement</span></div>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}><strong style={{ fontSize: '1.1rem', color: '#D97706', display: 'block' }}>Support</strong><span style={{ fontSize: '0.8rem', color: '#64748B' }}>Counseling and mentoring</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
