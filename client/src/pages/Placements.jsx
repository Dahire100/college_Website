import React, { useState, useEffect } from 'react';
import { 
  Briefcase, TrendingUp, Award, Building, CheckCircle2, 
  ArrowRight, Download, Users, ShieldCheck, Star 
} from 'lucide-react';
import { api } from '../services/api';

export default function Placements({ onNavigate }) {
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

  const tiers = ['All', 'Super Dream', 'Dream', 'Core', 'IT Services'];

  const filteredRecruiters = tierFilter === 'All'
    ? recruiters
    : recruiters.filter(r => (r.tier || '').toLowerCase().includes(tierFilter.toLowerCase()));

  const latest = records[0] || {
    highestPackage: '₹44.00 LPA',
    averagePackage: '₹8.75 LPA',
    medianPackage: '₹7.20 LPA',
    placementRate: 95.8,
    totalOffers: 840,
    placedStudents: 680,
    totalStudents: 710,
    academicYear: '2025-26'
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Header Showcase (COEP Placement Statistics Inspired) */}
      <section style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #0F3860 100%)',
        color: '#FFFFFF',
        padding: '5rem 0 4.5rem 0',
        borderBottom: '4px solid var(--color-accent)',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{ maxWidth: '850px' }}>
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
              <Briefcase size={15} /> Training, Internships & Corporate Placements
            </div>
            <h1 style={{ fontSize: '2.85rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem 0', color: '#FFFFFF' }}>
              Exceptional Campus Career Outcomes & Industry Partnerships
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
              Backed by our 4-year employability accelerator, student mock interview cells, and strong ties with 160+ Fortune 500 tech corporations and core engineering leaders.
            </p>

            {/* Quick Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FCD34D' }}>{latest.highestPackage}</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Highest Annual Package</div>
              </div>
              <div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34D399' }}>{latest.averagePackage}</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Average Batch Package</div>
              </div>
              <div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>{latest.placementRate}%</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Verified Placement Rate</div>
              </div>
              <div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#60A5FA' }}>{latest.totalOffers}+</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Total Job Offers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Recruiter Tier Tabs & Grid */}
      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Participating Corporate Recruiters ({filteredRecruiters.length})
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0' }}>
              Tiered corporate partners conducting on-campus recruitment drives and pre-placement interviews.
            </p>
          </div>

          {/* Tier Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tiers.map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: tierFilter === t ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  background: tierFilter === t ? '#2563EB' : '#FFFFFF',
                  color: tierFilter === t ? '#FFFFFF' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>Loading recruiters directory...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {filteredRecruiters.map(rc => (
              <div 
                key={rc._id || rc.id || rc.name}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 150ms ease, box-shadow 150ms ease'
                }}
              >
                <div>
                  <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    {rc.logoUrl ? (
                      <img src={rc.logoUrl} alt={rc.name} style={{ maxHeight: '42px', maxWidth: '140px', objectFit: 'contain' }} />
                    ) : (
                      <Building size={32} style={{ color: '#64748B' }} />
                    )}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>{rc.name}</h4>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: rc.tier === 'Super Dream' ? '#FEF3C7' : rc.tier === 'Dream' ? '#EFF6FF' : '#F1F5F9',
                    color: rc.tier === 'Super Dream' ? '#D97706' : rc.tier === 'Dream' ? '#2563EB' : '#475569',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {rc.tier || 'Corporate Recruiter'}
                  </span>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem', width: '100%' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Package Offered</div>
                  <strong style={{ fontSize: '0.95rem', color: '#059669' }}>{rc.highestPackage || 'Competitive'}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. 4-Year Employability Roadmap (COEP Placement Department Model) */}
      <div className="container" style={{ marginTop: '4.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <span className="pill-badge-blue">Structured Career Pathway</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '0.5rem 0' }}>
            4-Year Continuous Employability Accelerator
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748B' }}>
            From day one to campus interview: grooming future technology leaders through technical mastery and personality enhancement.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>YEAR 1</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>Foundations & Logic</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              C/Python programming, discrete structures, engineering mathematics, and business communication workshops.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ background: '#ECFDF5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>YEAR 2</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>Data Structures & Full-Stack</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Advanced DSA, OOPs, Database systems, Hackathon training, and technical competitive programming on LeetCode.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ background: '#FEF3C7', color: '#D97706', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>YEAR 3</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>Internships & Projects</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Summer industry internships, system design, mock coding interviews, cloud certifications (AWS/Azure), and group discussions.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ background: '#F5F3FF', color: '#7C3AED', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>YEAR 4</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>Campus Recruitment Drives</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              On-campus recruitment drives, technical HR interviews, pre-placement offers (PPOs), and salary negotiations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
