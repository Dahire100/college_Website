import React from 'react';
import { MapPin, Phone, Mail, Award, Lock, ExternalLink, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Footer({ settings = {}, onNavigate, onOpenInquiry }) {
  return (
    <footer style={{ background: 'var(--color-primary-dark)', color: '#CBD5E1', paddingTop: '4rem', borderTop: '4px solid var(--color-accent)', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {/* Col 1: Identity & Accreditations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {settings.college_logo ? (
                <img
                  src={settings.college_logo}
                  alt={settings.college_short_name || 'College Logo'}
                  style={{ width: '42px', height: '42px', objectFit: 'contain', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '3px' }}
                />
              ) : null}
              <h4 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {settings.college_short_name || 'Apex Institute'}
              </h4>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {settings.college_tagline || 'Autonomous Institution of Engineering & Technology, fostering critical research, industry innovation, and ethical leadership.'}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#94A3B8', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
              <MapPin size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '3px' }} />
              <span>{settings.contact_address || 'Hirabai Haridas Vidyanagari, Amrutdham, Panchavati, Nashik - 422003, Maharashtra, India'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94A3B8', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
              <Phone size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <span>{settings.contact_phone_primary || '+91 253 251 2876'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94A3B8', fontSize: '0.85rem' }}>
              <Mail size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <span>{settings.contact_email_primary || 'principal@apex-inst.edu'}</span>
            </div>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {settings.social_linkedin && (
                <a href={settings.social_linkedin} target="_blank" rel="noreferrer" style={{ color: '#94A3B8', fontSize: '0.8rem', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>LinkedIn</a>
              )}
              {settings.social_twitter && (
                <a href={settings.social_twitter} target="_blank" rel="noreferrer" style={{ color: '#94A3B8', fontSize: '0.8rem', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>Twitter</a>
              )}
              {settings.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noreferrer" style={{ color: '#94A3B8', fontSize: '0.8rem', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>YouTube</a>
              )}
              {settings.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noreferrer" style={{ color: '#94A3B8', fontSize: '0.8rem', textDecoration: 'none', background: 'rgba(255,255,255,0.06)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>Instagram</a>
              )}
            </div>
          </div>

          {/* Col 2: Academics, Departments & Research */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Academics & Research</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem' }}>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('academics')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Academic Architecture & Framework
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('departments')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Engineering Departments & HODs
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('programs')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Undergraduate & PG Degree Catalog
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('research')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Centers of Excellence (CoE) & Patents
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('research')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Sponsored Research Grants (DRDO/ISRO)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('departments')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Specialized Laboratory Infrastructure
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Admissions, Placements & Student Life */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Admissions & Campus</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem' }}>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('admissions')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Admissions Roadmap & Deadlines
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('admissions')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Approved Annual Fee Charts & Scholarships
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('placements')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Placement Reports & Recruiter Tiers
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('campus')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  50-Acre Campus Facilities & Hostels
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('life')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Student Societies & Formula Racing Club
                </button>
              </li>
              <li style={{ marginBottom: '0.55rem' }}>
                <button onClick={() => onNavigate('news')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Official Notices & Academic Circulars
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                  Campus Visual Showcase & Media
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Admission Helpline & Admin */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Admissions Helpline</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Central admissions and counseling desk active Mon–Sat (9 AM to 5 PM IST).
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <Phone size={15} style={{ color: 'var(--color-accent)' }} />
              <span>{settings.contact_phone_admissions || '+91 253 251 2867'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <Mail size={15} style={{ color: 'var(--color-accent)' }} />
              <span>{settings.contact_email_admissions || 'admissions@apex-inst.edu'}</span>
            </div>
            <button className="btn btn-accent btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.85rem' }} onClick={() => onOpenInquiry()}>
              Submit Online Inquiry
            </button>
            <button 
              onClick={() => onNavigate('admin')} 
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FCD34D',
                borderRadius: '6px',
                padding: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <Lock size={12} /> Institutional CMS Admin Panel
            </button>
          </div>
        </div>

        {/* Footer bottom */}
        <div style={{ padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#64748B' }}>
          <div>
            © {new Date().getFullYear()} {settings.college_name || 'Apex Institute of Engineering & Technology'}. Autonomous Institution. {settings.affiliation || ''}
          </div>
          <div>
            <span>Accredited NAAC A++ (CGPA 3.65) | NBA Tier-1 | NIRF Ranked</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
