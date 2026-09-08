import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Lock, ArrowRight, ExternalLink } from 'lucide-react';
import { getInstitutionProfile } from '../content/institutionProfile';
import { api } from '../services/api';

export default function Footer({ settings = {}, onNavigate, onOpenInquiry }) {
  const profile = getInstitutionProfile(settings);
  const [subInstitutions, setSubInstitutions] = useState([]);
  const isGroupMode = profile.profileKey === 'group';

  useEffect(() => {
    if (isGroupMode) {
      api.get('/api/v1/public/sub-institutions').then(res => {
        if (res.success) setSubInstitutions(res.data || []);
      }).catch(() => {});
    }
  }, [isGroupMode]);

  const linkStyle = {
    background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer',
    padding: 0, textAlign: 'left', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
    transition: 'color 150ms', display: 'block', marginBottom: '0.55rem'
  };

  return (
    <footer style={{ background: 'linear-gradient(180deg, #071526 0%, #020617 100%)', color: '#CBD5E1', paddingTop: 'clamp(2.5rem, 5vw, 4rem)', borderTop: '4px solid #D97706', marginTop: 'auto' }}>
      <div className="container">
        {/* Main Footer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '2.5rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>

          {/* Column 1: Institution Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {settings.college_logo ? (
                <img src={settings.college_logo} alt={settings.college_short_name || 'Logo'} style={{ width: '42px', height: '42px', objectFit: 'contain', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '3px' }} />
              ) : (
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--color-accent), #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '1.1rem', fontFamily: "'Playfair Display', serif" }}>
                  {(settings.college_short_name || profile.shortName || 'I').charAt(0)}
                </div>
              )}
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 800, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                  {settings.college_short_name || profile.shortName}
                </h4>
                {isGroupMode && <span style={{ fontSize: '0.68rem', color: 'var(--color-accent)', fontWeight: 600 }}>GROUP OF INSTITUTIONS</span>}
              </div>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.65 }}>
              {settings.college_tagline || profile.tagline}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                <MapPin size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <span>{settings.contact_address || 'Campus address managed from admin settings.'}</span>
              </div>
              <a href={`tel:${settings.contact_phone_primary || '+91 20 2420 2180'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94A3B8', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                <Phone size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span>{settings.contact_phone_primary || '+91 20 2420 2180'}</span>
              </a>
              <a href={`mailto:${settings.contact_email_primary || 'info@example.edu'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94A3B8', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                <Mail size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span>{settings.contact_email_primary || 'info@example.edu'}</span>
              </a>
            </div>

            {/* Social Media */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              {[
                { label: 'FB', url: settings.social_facebook },
                { label: 'IG', url: settings.social_instagram },
                { label: 'TW', url: settings.social_twitter },
                { label: 'YT', url: settings.social_youtube },
                { label: 'LI', url: settings.social_linkedin }
              ].filter(s => s.url).map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" style={{
                  width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', transition: 'all 200ms'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.color = '#FFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8'; }}>
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Academics */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Academics</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><button onClick={() => onNavigate('academics')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>Academics & Curriculum</button></li>
              <li><button onClick={() => onNavigate('departments')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>{profile.academicUnitsLabel}</button></li>
              <li><button onClick={() => onNavigate('programs')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>{profile.programsLabel}</button></li>
              <li><button onClick={() => onNavigate('research')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>{profile.researchLabel}</button></li>
              <li><button onClick={() => onNavigate('campus')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>{profile.campusLabel}</button></li>
            </ul>
          </div>

          {/* Column 3: Student Zone */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Student Zone</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li><button onClick={() => onNavigate('admissions')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>{profile.admissionsLabel}</button></li>
              <li><button onClick={() => onNavigate('placements')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>{profile.placementsLabel}</button></li>
              <li><button onClick={() => onNavigate('life')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>{profile.studentLifeLabel}</button></li>
              <li><button onClick={() => onNavigate('gallery')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>Gallery</button></li>
              <li><button onClick={() => onNavigate('news')} style={linkStyle} onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>{profile.noticeLabel}</button></li>
            </ul>
          </div>

          {/* Column 4: Admissions + Institutes */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Admissions Helpline</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Admissions and counseling support during office hours.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <Phone size={14} style={{ color: 'var(--color-accent)' }} />
              <span>{settings.contact_phone_admissions || settings.contact_phone_primary || '+91 20 2420 2115'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <Mail size={14} style={{ color: 'var(--color-accent)' }} />
              <span>{settings.contact_email_admissions || 'admissions@example.edu'}</span>
            </div>
            <button className="btn btn-accent btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.65rem', fontFamily: "'Inter', sans-serif" }} onClick={() => onOpenInquiry()}>
              Submit Online Inquiry <ArrowRight size={14} />
            </button>

            {/* Sub-institutions in footer (Group mode) */}
            {isGroupMode && subInstitutions.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 style={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Our Institutes</h5>
                {subInstitutions.slice(0, 5).map((inst, i) => (
                  <a key={i} href={inst.websiteUrl || '#'} target={inst.websiteUrl ? '_blank' : '_self'} rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.8rem', marginBottom: '0.4rem', textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                    <span style={{ fontSize: '0.85rem' }}>{inst.iconEmoji || '🏛️'}</span>
                    <span>{inst.shortName || inst.name}</span>
                    {inst.websiteUrl && <ExternalLink size={10} style={{ opacity: 0.5 }} />}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Accreditation badges */}
        {(settings.accreditation_summary || settings.affiliation) && (
          <div style={{ padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {settings.accreditation_summary && (
              <span style={{ fontSize: '0.78rem', color: '#FCD34D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                ⭐ {settings.accreditation_summary}
              </span>
            )}
            {settings.affiliation && (
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>{settings.affiliation}</span>
            )}
          </div>
        )}

        {/* Copyright Bar */}
        <div style={{ padding: '1.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: '#475569' }}>
          <div>
            &copy; {new Date().getFullYear()} {settings.college_name || profile.collegeName}. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => onNavigate('contact')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'Inter', sans-serif", transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
              Contact
            </button>
            <button onClick={() => onNavigate('admin')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: "'Inter', sans-serif", transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
              <Lock size={10} /> Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
