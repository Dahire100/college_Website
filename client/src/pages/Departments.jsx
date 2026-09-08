import React, { useState, useEffect } from 'react';
import { Building2, Search, User, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function Departments({ settings = {}, onNavigate }) {
  const profile = getInstitutionProfile(settings);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      <section style={{ background: 'linear-gradient(135deg, #0B1E36 0%, #153A6B 100%)', color: '#FFFFFF', padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4.5rem) 0', borderBottom: '4px solid #D97706', position: 'relative' }}>
        <div className="container">
          <div style={{ maxWidth: '840px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(217, 119, 6, 0.22)', color: '#FCD34D', border: '1px solid rgba(217, 119, 6, 0.45)', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              <Building2 size={15} /> {profile.academicUnitsLabel}
            </div>
            <h1 className="page-hero-title" style={{ margin: '0 0 1rem 0' }}>
              Academic Units and Department Directory
            </h1>
            <p className="page-hero-subtitle" style={{ margin: '0 0 1.75rem 0' }}>
              This page can represent departments, schools, divisions, or academic centers based on the selected institution profile.
            </p>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-1.75rem', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFFFFF', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1E293B', fontWeight: 700, fontSize: '0.95rem' }}>
            <Building2 size={18} style={{ color: '#2563EB' }} /> Explore Units ({filteredDepts.length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', borderRadius: '8px', padding: '0.45rem 0.85rem', width: '100%', maxWidth: '320px' }}>
            <Search size={16} style={{ color: '#94A3B8' }} />
            <input type="text" placeholder="Search unit, lead, or code..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '100%', color: '#1E293B' }} />
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading units...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.75rem' }}>
            {filteredDepts.map(dept => (
              <div key={dept._id || dept.id || dept.code} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                    <img src={dept.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'} alt={dept.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', color: '#FFFFFF', backdropFilter: 'blur(4px)', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>{dept.code}</div>
                    <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: '#2563EB', color: '#FFFFFF', padding: '0.15rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>{dept.degreeLevels || 'Profile-based programs'}</div>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem', lineHeight: 1.35 }}>{dept.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.55, margin: '0 0 1rem' }}>{dept.overview || 'Department overview is maintained through the CMS.'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid #2563EB' }}>
                        {dept.hodImage ? <img src={dept.hodImage} alt={dept.hodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={22} style={{ color: '#2563EB' }} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Unit Lead</div>
                        <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>{dept.hodName || 'Unit Head'}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#2563EB' }}>{dept.email || 'hod@example.edu'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', background: '#F1F5F9', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <div><span style={{ display: 'block', color: '#64748B' }}>Intake</span><strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{dept.studentIntake || dept.stats?.intake || 'n/a'}</strong></div>
                      <div><span style={{ display: 'block', color: '#64748B' }}>Faculty</span><strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{dept.facultyCount || dept.stats?.faculty || 'n/a'}</strong></div>
                      <div><span style={{ display: 'block', color: '#64748B' }}>Units</span><strong style={{ color: '#059669', fontSize: '0.85rem' }}>CMS</strong></div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.5rem', background: '#FAFAFA' }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onNavigate('programs')}>
                    View Programs
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('contact')}>
                    Contact <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
