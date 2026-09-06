import React, { useState } from 'react';
import { Phone, Mail, Award, Lock, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';

export default function Header({ settings = {}, navigation = [], currentRoute, onNavigate, onOpenInquiry }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const collegeName = settings?.college_name || settings?.college_short_name || 'College Emblem';

  // Exact 13-stage information architecture:
  // Home → About → Academics → Departments → Programs → Admissions → Campus → Placements → Research → Student Life → News & Events → Gallery → Contact
  const defaultNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'departments', label: 'Departments' },
    { id: 'programs', label: 'Programs' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'campus', label: 'Campus' },
    { id: 'placements', label: 'Placements' },
    { id: 'research', label: 'Research' },
    { id: 'life', label: 'Student Life' },
    { id: 'news', label: 'News & Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' }
  ];

  let navItems = defaultNavItems;
  if (Array.isArray(navigation) && navigation.length > 0) {
    const activePaths = new Set(navigation.filter(n => n.isActive !== false).map(n => n.path.replace('#', '')));
    if (activePaths.size > 0) {
      const coreNavs = defaultNavItems.filter(item => activePaths.has(item.id) || item.id === 'home' || item.id === 'programs' || item.id === 'research');
      const customNavs = navigation
        .filter(n => n.isActive !== false && !defaultNavItems.some(d => d.id === n.path.replace('#', '')))
        .map(n => ({ id: n.path.replace('#', ''), label: n.title }));
      navItems = [...coreNavs, ...customNavs];
    }
  }

  const handleNavClick = (id) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header style={{ width: '100%', position: 'relative', zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {/* =========================================================================
          1. TOP UTILITY BAR (Authentic Government/Institutional Dark Ribbon)
          ========================================================================= */}
      <div style={{ background: '#071626', color: '#94A3B8', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0.35rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
          {/* Left: Government Accreditations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#F1F5F9', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              UGC Autonomous Institution
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: '#FCD34D', fontWeight: 600 }}>
              NAAC 'A++' Grade (CGPA 3.65)
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: '#E2E8F0' }}>
              NBA Tier-1 Accredited Programs
            </span>
          </div>

          {/* Right: Contact & Portal Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <a href={`tel:${settings.contact_phone_primary || '+91 253 251 2876'}`} style={{ color: '#CBD5E1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Phone size={11} style={{ color: '#94A3B8' }} />
              <span>{settings.contact_phone_primary || '+91 253 251 2876'}</span>
            </a>
            <a href={`mailto:${settings.contact_email_primary || 'principal@apex-inst.edu'}`} style={{ color: '#CBD5E1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={11} style={{ color: '#94A3B8' }} />
              <span>{settings.contact_email_primary || 'principal@apex-inst.edu'}</span>
            </a>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <button
              onClick={() => handleNavClick('admin')}
              style={{
                background: 'none',
                border: 'none',
                color: '#CBD5E1',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: 0
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FCD34D')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
            >
              <Lock size={11} /> Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN INSTITUTIONAL IDENTITY BAR (Classic Academic Heritage / Clean White)
          ========================================================================= */}
      <div style={{ background: '#FFFFFF', padding: '1rem 0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          
          {/* Logo & Traditional University Typography */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.1rem', minWidth: 0 }}
          >
            {/* Authentic Academic Crest / Uploaded College Logo */}
            <div style={{ flexShrink: 0 }}>
              {settings?.college_logo ? (
                <img
                  src={settings.college_logo}
                  alt={collegeName}
                  style={{ width: '58px', height: '58px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,33,71,0.12))' }}
                />
              ) : (
                <svg width="58" height="58" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,33,71,0.15))' }}>
                  {/* Outer Crest Ring */}
                  <circle cx="50" cy="50" r="47" fill="#002147" stroke="#C59B27" strokeWidth="3" />
                  <circle cx="50" cy="50" r="41" fill="#FFFFFF" stroke="#002147" strokeWidth="1.5" />
                  
                  {/* Shield Body */}
                  <path d="M50 18 L68 25 C68 45 50 58 50 58 C50 58 32 45 32 25 Z" fill="#002147" stroke="#C59B27" strokeWidth="1.5" />
                  
                  {/* Torch of Knowledge / Book */}
                  <path d="M43 32 Q50 28 57 32 L57 42 Q50 38 43 42 Z" fill="#C59B27" />
                  <line x1="50" y1="28" x2="50" y2="44" stroke="#FFFFFF" strokeWidth="1" />
                  <circle cx="50" cy="24" r="2.5" fill="#EF4444" />
                  
                  {/* Gear of Engineering */}
                  <circle cx="50" cy="69" r="6" stroke="#002147" strokeWidth="2" fill="#C59B27" strokeDasharray="3 2" />

                  {/* Banner ESTD 1984 */}
                  <rect x="26" y="80" width="48" height="11" rx="2" fill="#002147" stroke="#C59B27" strokeWidth="1" />
                  <text x="50" y="88.5" fontSize="7" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">
                    ESTD. 1984
                  </text>
                </svg>
              )}
            </div>

            {/* University Titles */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                Apex Education Trust • Autonomous Institute
              </div>
              <h1 style={{
                fontSize: '1.45rem',
                color: '#002147',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 800,
                letterSpacing: '-0.015em',
                margin: 0,
                lineHeight: 1.2
              }}>
                {settings.college_name || 'Apex Institute of Engineering & Technology'}
              </h1>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.35 }}>
                Approved by AICTE, New Delhi • Affiliated to State Technological University • Recognized by Govt. of Maharashtra
              </div>
            </div>
          </a>

          {/* Right: Institutional Credentials (Desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            {/* Admissions Help Desk */}
            <div style={{ borderLeft: '2px solid #E2E8F0', paddingLeft: '1.25rem', textAlign: 'right' }} className="header-helpline-box">
              <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Admissions Helpline</span>
              <span style={{ fontSize: '0.95rem', color: '#002147', fontWeight: 700, fontFamily: 'monospace' }}>
                {settings.contact_phone_admissions || '+91 253 251 2867'}
              </span>
              <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                Online Counseling Active
              </div>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation Menu"
              style={{
                display: 'none',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '0.45rem',
                cursor: 'pointer',
                color: '#002147'
              }}
              className="mobile-header-btn"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN HORIZONTAL NAVIGATION BAR (Regal Oxford Navy #002147)
          ========================================================================= */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 990,
          background: '#002147',
          borderBottom: '2.5px solid #C59B27'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
          {/* 13 Core Navigation Stages - Flat, Clean, No Scrollbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: 'wrap'
            }}
          >
            {navItems.map(item => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    background: isActive ? 'rgba(197, 155, 39, 0.25)' : 'transparent',
                    color: isActive ? '#FCD34D' : '#F8FAFC',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #C59B27' : '3px solid transparent',
                    padding: '0.7rem 0.6rem',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.015em',
                    transition: 'all 120ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#F8FAFC';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            4. RESPONSIVE MOBILE MENU DRAWER
            ========================================================================= */}
        {mobileOpen && (
          <div
            style={{
              background: '#FFFFFF',
              borderTop: '2px solid #C59B27',
              boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
              padding: '1.25rem',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {navItems.map(item => {
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: isActive ? '#002147' : '#E2E8F0',
                      background: isActive ? '#EFF6FF' : '#F8FAFC',
                      color: isActive ? '#002147' : '#334155',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={13} style={{ opacity: isActive ? 1 : 0.3 }} />
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleNavClick('admin')}
              >
                <Lock size={14} /> Admin CMS Portal
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
