import React, { useState, useEffect } from 'react';
import { Microscope, Award, BookOpen, Zap, Rocket, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function Research({ settings = {}, onNavigate }) {
  const profile = getInstitutionProfile(settings);
  const [subsections, setSubsections] = useState([]);
  const [activeTab, setActiveTab] = useState('coe');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResearch() {
      try {
        const res = await api.get('/api/v1/public/subsections?pageSlug=research');
        setSubsections(res.data || []);
      } catch (err) {
        console.error('Failed to load research data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResearch();
  }, []);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      <section style={{ background: 'linear-gradient(135deg, #0B1E36 0%, #153A6B 100%)', color: '#FFFFFF', padding: 'clamp(3rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4.5rem) 0', borderBottom: '4px solid #D97706' }}>
        <div className="container">
          <div style={{ maxWidth: '850px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', border: '1px solid rgba(217, 119, 6, 0.45)', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              <Microscope size={15} /> {profile.researchLabel}
            </div>
            <h1 className="page-hero-title" style={{ margin: '0 0 1rem 0' }}>
              Research, innovation, and creative work
            </h1>
            <p className="page-hero-subtitle" style={{ margin: '0 0 2rem 0' }}>
              This page can represent labs, projects, patents, incubators, or practice-based innovation depending on the selected profile.
            </p>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.5rem', marginBottom: '2.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[{ id: 'coe', label: 'Centers and Labs', icon: <BookOpen size={16} /> }, { id: 'patents', label: 'Projects and IP', icon: <Award size={16} /> }, { id: 'grants', label: 'Sponsored Work', icon: <Zap size={16} /> }, { id: 'incubator', label: 'Incubator', icon: <Rocket size={16} /> }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', background: activeTab === tab.id ? '#2563EB' : 'transparent', color: activeTab === tab.id ? '#FFFFFF' : '#475569', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'coe' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>Research spaces and labs</h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>Use this section to highlight facilities and capabilities relevant to the selected profile.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
              {(subsections.length > 0 ? subsections : [{ title: 'Research Highlight', subtitle: 'CMS Section', content: 'Add lab, project, or innovation content from the CMS.' }]).map((item, idx) => (
                <div key={idx} style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
                  <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{item.badge || 'CMS Managed'}</span>
                  <h3 style={{ fontSize: '1.35rem', color: '#0F172A', margin: '0.75rem 0 0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'coe' && (
          <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: 0 }}>More content can be added here</h2>
            <p style={{ color: '#64748B' }}>Use the CMS to populate projects, grants, patents, incubator stories, or practice-based innovation.</p>
            <button className="btn btn-primary" onClick={() => onNavigate('contact')}>
              Contact the Office <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
