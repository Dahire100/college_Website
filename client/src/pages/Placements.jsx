import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, Building, ArrowRight, Users } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function Placements({ settings = {}, onNavigate }) {
  const profile = getInstitutionProfile(settings);
  const [records, setRecords] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [tierFilter, setTierFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/v1/public/placements');
        setRecords(res.data?.records || []);
        setRecruiters(res.data?.recruiters || []);
      } catch (e) {
        console.error('Failed to load placements', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latest = records[0] || {
    highestPackage: 'Profile-based',
    averagePackage: 'Profile-based',
    placementRate: 95,
    totalOffers: 0,
    academicYear: 'Current'
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      <section style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0F3860 100%)', color: '#FFFFFF', padding: '5rem 0 4.5rem 0', borderBottom: '4px solid var(--color-accent)', position: 'relative' }}>
        <div className="container">
          <div style={{ maxWidth: '850px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(217, 119, 6, 0.22)', color: '#FCD34D', border: '1px solid rgba(217, 119, 6, 0.45)', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              <Briefcase size={15} /> {profile.placementsLabel}
            </div>
            <h1 style={{ fontSize: '2.85rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem 0', color: '#FFFFFF' }}>
              Career outcomes and partner ecosystem
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
              This page can describe placement support, internships, clinical training, or student progression depending on the site profile.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div><div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FCD34D' }}>{latest.highestPackage}</div><div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Highest Support</div></div>
              <div><div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34D399' }}>{latest.averagePackage}</div><div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Average Outcome</div></div>
              <div><div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>{latest.placementRate}%</div><div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Outcome Rate</div></div>
              <div><div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#60A5FA' }}>{latest.totalOffers}+</div><div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Total Opportunities</div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Partners and Recruiters ({recruiters.length})</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0' }}>Use this area for recruiters, hospital partners, companies, and institutions.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Dream', 'Core', 'Institutional'].map(t => (
              <button key={t} onClick={() => setTierFilter(t)} style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: tierFilter === t ? '1px solid #2563EB' : '1px solid #E2E8F0', background: tierFilter === t ? '#2563EB' : '#FFFFFF', color: tierFilter === t ? '#FFFFFF' : '#475569', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>Loading partner directory...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {recruiters.map(rc => (
              <div key={rc._id || rc.id || rc.name} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem 1rem', textAlign: 'center' }}>
                <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  {rc.logoUrl ? <img src={rc.logoUrl} alt={rc.name} style={{ maxHeight: '42px', maxWidth: '140px', objectFit: 'contain' }} /> : <Building size={32} style={{ color: '#64748B' }} />}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>{rc.name}</h4>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>{rc.tier || 'Partner'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="container" style={{ marginTop: '4.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <span className="pill-badge-blue">Career Pathway</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '0.5rem 0' }}>Support, internships, and outcomes</h2>
          <p style={{ fontSize: '0.92rem', color: '#64748B' }}>Use this section for career support models, training steps, or student progress planning.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>YEAR 1</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>Foundations</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>Communication, basics, and orientation to the institution.</p>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ background: '#ECFDF5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>YEAR 2</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>Skill Building</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>Practical skills, labs, and domain-specific learning.</p>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ background: '#FEF3C7', color: '#D97706', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>YEAR 3</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>Projects</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>Internships, projects, and portfolio building.</p>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ background: '#F5F3FF', color: '#7C3AED', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>YEAR 4</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>Outcomes</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>Placements, higher studies, internships, or progression to the next stage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
