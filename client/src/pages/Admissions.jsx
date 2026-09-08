import React, { useState, useEffect } from 'react';
import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function Admissions({ settings = {}, onOpenInquiry }) {
  const profile = getInstitutionProfile(settings);
  const [pageData, setPageData] = useState(null);
  const [subsections, setSubsections] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [admRes, pageRes, subRes] = await Promise.all([
          api.get('/api/v1/public/admissions').catch(() => ({ data: [] })),
          api.get('/api/v1/public/pages/admissions').catch(() => null),
          api.get('/api/v1/public/subsections?pageSlug=admissions').catch(() => null)
        ]);
        setAdmissions(admRes.data || []);
        if (pageRes?.data) setPageData(pageRes.data);
        if (subRes?.data) setSubsections(subRes.data || []);
      } catch (e) {
        console.error('Failed to load admissions', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const steps = admissions.filter(i => i.category === 'Admission Process');
  const fees = admissions.filter(i => i.category === 'Fee Structure');

  return (
    <div>
      <div style={{
        background: pageData?.heroImageUrl
          ? `linear-gradient(rgba(11, 37, 69, 0.85), rgba(19, 62, 104, 0.9)), url(${pageData.heroImageUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0B1E36 0%, #153A6B 100%)',
        color: '#FFFFFF',
        padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4rem) 0',
        borderBottom: '4px solid #D97706',
        position: 'relative'
      }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)' }}>
            {profile.admissionsLabel || pageData?.heroBadge}
          </span>
          <h1 className="page-hero-title" style={{ marginTop: '0.75rem' }}>
            {profile.admissionsLabel || pageData?.heroTitle || 'Admissions and Roadmap'}
          </h1>
          <p className="page-hero-subtitle" style={{ maxWidth: '720px', marginTop: '0.5rem' }}>
            {profile.admissionsNote || pageData?.heroSubtitle}
          </p>
        </div>
      </div>

      <div className="section container">
        <div className="section-header">
          <span className="pill-badge-blue">Step-by-Step Flow</span>
          <h2 className="section-title">Centralized Admission Process</h2>
          <p className="section-desc">Follow the official steps to complete counseling, verification, and enrollment.</p>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><span className="pulse-dot" /> Loading admissions...</div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '4rem' }}>
              {steps.map(s => (
                <div key={s._id || s.id} className="academic-card" style={{ display: 'flex', gap: 'clamp(0.85rem, 2vw, 1.5rem)', alignItems: 'flex-start' }}>
                  <div style={{ width: 'clamp(40px, 5vw, 48px)', height: 'clamp(40px, 5vw, 48px)', borderRadius: '50%', background: 'var(--color-secondary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', flexShrink: 0 }}>
                    {s.stepNumber || '1'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: 'var(--color-primary)', margin: 0 }}>{s.title}</h3>
                      {s.deadline && <span className="pill-badge" style={{ fontSize: '0.75rem' }}>Target Date: {s.deadline}</span>}
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: 1.6, fontSize: '0.92rem' }}>{s.description}</p>
                    <div style={{ background: 'var(--color-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                      <strong>Required Documents:</strong> {s.requiredDocuments}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-header">
              <span className="pill-badge">Fee Structure</span>
              <h2 className="section-title">Approved Annual Fee Charts</h2>
              <p className="section-desc">Fee details can be managed by the administrator and shown by program or stream.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
              {fees.map(f => (
                <div key={f._id || f.id} className="academic-card">
                  <span className="pill-badge-blue" style={{ marginBottom: '0.5rem' }}>Annual Fee</span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)', marginBottom: '0.75rem' }}>
                    {f.feeAnnual}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {f.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <strong>Concession Eligibility:</strong> {f.eligibilityCriteria || 'As per institutional policy'}
                  </div>
                </div>
              ))}
            </div>

            {subsections && subsections.length > 0 && (
              <div style={{ marginTop: '3.5rem' }}>
                <div className="section-header">
                  <span className="pill-badge">Special Opportunities</span>
                  <h2 className="section-title">Scholarships and Institutional Programs</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {subsections.map((sub, idx) => (
                    <div key={sub._id || idx} className="academic-card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {sub.badge && <span className="pill-badge-blue">{sub.badge}</span>}
                        <span className="pill-badge" style={{ fontSize: '0.75rem' }}>CMS Section</span>
                      </div>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{sub.title}</h3>
                      {sub.subtitle && <p style={{ fontSize: '1rem', color: '#2563EB', fontWeight: 600, marginBottom: '0.75rem' }}>{sub.subtitle}</p>}
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{sub.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
              <button className="btn btn-accent btn-lg" onClick={() => onOpenInquiry()}>
                Submit Admission Inquiry Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
