import React, { useState, useEffect } from 'react';
import { Phone, Mail, Lock, Menu, X, ArrowRight, ChevronDown, Globe, ExternalLink } from 'lucide-react';
import { getInstitutionProfile } from '../content/institutionProfile';
import { api } from '../services/api';

export default function Header({ settings = {}, navigation = [], pages = [], currentRoute, onNavigate, onOpenInquiry }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [subInstitutions, setSubInstitutions] = useState([]);
  const [instituteDropdownOpen, setInstituteDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const profile = getInstitutionProfile(settings);
  const collegeName = settings?.college_name || settings?.college_short_name || profile.collegeName || 'Institution';
  const isGroupMode = profile.profileKey === 'group';

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

  // Group active subpages by parentSlug
  const subpagesByParent = {};
  if (Array.isArray(pages)) {
    pages.filter(p => p.isActive && p.showInHeader !== false && p.parentSlug).forEach(p => {
      const parentKey = p.parentSlug.toLowerCase().trim();
      if (!subpagesByParent[parentKey]) subpagesByParent[parentKey] = [];
      subpagesByParent[parentKey].push(p);
    });
  }

  let navItems = defaultNavItems.map(d => ({
    ...d,
    subpages: subpagesByParent[d.id] || []
  }));

  if (Array.isArray(navigation) && navigation.length > 0) {
    const activePaths = new Set(navigation.filter(n => n.isActive !== false).map(n => n.path.replace('#', '')));
    if (activePaths.size > 0) {
      const coreNavs = defaultNavItems
        .filter(item => activePaths.has(item.id) || item.id === 'home' || item.id === 'programs' || item.id === 'research')
        .map(d => ({ ...d, subpages: subpagesByParent[d.id] || [] }));

      // Custom top-level pages only (exclude pages that belong to a parent as a subpage)
      const customNavs = navigation
        .filter(n => {
          if (n.isActive === false) return false;
          const cleanId = n.path.replace('#', '');
          if (defaultNavItems.some(d => d.id === cleanId)) return false;
          const pageObj = (pages || []).find(p => p.slug === cleanId);
          if (pageObj && pageObj.parentSlug) return false;
          return true;
        })
        .map(n => {
          const cleanId = n.path.replace('#', '');
          return { id: cleanId, label: n.title, subpages: subpagesByParent[cleanId] || [] };
        });

      navItems = [...coreNavs, ...customNavs];
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isGroupMode) {
      api.get('/api/v1/public/sub-institutions').then(res => {
        if (res.success) setSubInstitutions(res.data || []);
      }).catch(() => {});
    }
  }, [isGroupMode]);

  const handleNavClick = (id) => {
    setMobileOpen(false);
    setInstituteDropdownOpen(false);
    onNavigate(id);
  };

  const announcementText = settings?.announcement_text || profile.announcementText || '';

  return (
    <header style={{ width: '100%', position: 'relative', zIndex: 100 }}>

      {/* Tier 0: Announcement Marquee Bar */}
      {announcementText && (
        <div className="announcement-bar">
          <span className="announcement-text">{announcementText}</span>
        </div>
      )}

      {/* Tier 1: Sleek Top Utility Bar */}
      <div style={{ background: '#0B1528', color: '#94A3B8', fontSize: '0.76rem', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0.42rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Left: Institute Badges & Accreditation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#FFFFFF',
              padding: '0.15rem 0.55rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.68rem',
              letterSpacing: '0.04em',
              boxShadow: '0 2px 6px rgba(220,38,38,0.3)'
            }}>
              {profile.shortName}
            </span>

            <span style={{ color: '#E2E8F0', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />
              {profile.academicUnitsLabel}
            </span>

            {settings.accreditation_summary && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
                <span style={{
                  color: '#FCD34D',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  letterSpacing: '0.01em'
                }}>
                  {settings.accreditation_summary}
                </span>
              </>
            )}

            {settings.affiliation && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
                <span style={{ color: '#CBD5E1', fontSize: '0.74rem' }}>
                  {settings.affiliation}
                </span>
              </>
            )}
          </div>

          {/* Right: Contact & Admin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={`tel:${settings.contact_phone_primary || '+91 20 2420 2180'}`}
              style={{ color: '#CBD5E1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'color 150ms', fontSize: '0.74rem' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'}
              onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
            >
              <Phone size={12} style={{ color: '#60A5FA' }} />
              <span>{settings.contact_phone_primary || '+91 20 2420 2180'}</span>
            </a>

            <a
              href={`mailto:${settings.contact_email_primary || 'info@example.edu'}`}
              style={{ color: '#CBD5E1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'color 150ms', fontSize: '0.74rem' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FCD34D'}
              onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
            >
              <Mail size={12} style={{ color: '#60A5FA' }} />
              <span>{settings.contact_email_primary || 'info@example.edu'}</span>
            </a>

            {settings.erp_login_url && (
              <a
                href={settings.erp_login_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#CBD5E1',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  transition: 'all 150ms'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#60A5FA'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#CBD5E1'; }}
              >
                <Globe size={11} /> ERP Portal
              </a>
            )}

            <button
              onClick={() => handleNavClick('admin')}
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.25))',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#FCD34D',
                cursor: 'pointer',
                fontSize: '0.73rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.22rem 0.65rem',
                borderRadius: '6px',
                transition: 'all 200ms',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(245,158,11,0.35)';
                e.currentTarget.style.borderColor = '#FCD34D';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.25))';
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Lock size={11} /> Admin CMS
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Brand Bar */}
      <div style={{ background: '#FFFFFF', padding: '0.85rem 0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.1rem', minWidth: 0 }}
          >
            <div style={{ flexShrink: 0 }}>
              {settings?.college_logo ? (
                <img
                  src={settings.college_logo}
                  alt={collegeName}
                  style={{ width: '58px', height: '58px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,33,71,0.12))' }}
                />
              ) : (
                <div style={{
                  width: '58px', height: '58px',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', fontWeight: 800, fontSize: '1.5rem', fontFamily: 'var(--font-heading)',
                  boxShadow: '0 4px 12px rgba(0,33,71,0.25)'
                }}>
                  {(collegeName || 'I').charAt(0)}
                </div>
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              {isGroupMode && (
                <div style={{ fontSize: '0.68rem', color: '#D97706', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.1rem' }}>
                  GROUP OF INSTITUTIONS
                </div>
              )}
              <h1 style={{ fontSize: '1.45rem', color: '#002147', fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
                {collegeName}
              </h1>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem', lineHeight: 1.35, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {settings.college_tagline || profile.tagline}
              </div>
            </div>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            {/* Admissions Helpline */}
            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1.25rem', textAlign: 'right' }} className="header-helpline-box">
              <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Admissions Helpline
              </span>
              <a
                href={`tel:${settings.contact_phone_admissions || settings.contact_phone_primary || '+91 20 2420 2115'}`}
                style={{ fontSize: '0.95rem', color: '#002147', fontWeight: 800, fontFamily: "'Inter', sans-serif", textDecoration: 'none', display: 'block' }}
              >
                {settings.contact_phone_admissions || settings.contact_phone_primary || '+91 20 2420 2115'}
              </a>
              <div style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }}></span>
                {profile.admissionsLabel || 'Admissions Open'}
              </div>
            </div>

            {/* Apply Now CTA */}
            {onOpenInquiry && (
              <button
                onClick={() => onOpenInquiry()}
                style={{
                  background: 'linear-gradient(135deg, #D97706, #B45309)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(217, 119, 6, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.3)';
                }}
                id="header-apply-btn"
              >
                Apply Now <ArrowRight size={15} />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation Menu"
              style={{
                display: 'none',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: '#002147',
                transition: 'all 150ms'
              }}
              className="mobile-header-btn"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tier 3: Navigation Bar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 990,
        background: scrolled ? 'rgba(0, 33, 71, 0.97)' : '#002147',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '3px solid var(--color-accent)',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
        transition: 'all 300ms ease'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
          <div className="nav-links-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>

            {/* Institutes Dropdown (Group Mode) */}
            {isGroupMode && subInstitutions.length > 0 && (
              <div
                className="institute-dropdown"
                style={{ position: 'relative' }}
                onMouseEnter={() => setInstituteDropdownOpen(true)}
                onMouseLeave={() => setInstituteDropdownOpen(false)}
              >
                <button
                  style={{
                    background: 'rgba(217, 119, 6, 0.2)',
                    color: '#FCD34D',
                    border: '1px solid rgba(217, 119, 6, 0.4)',
                    borderRadius: '6px',
                    padding: '0.55rem 0.8rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    letterSpacing: '0.015em',
                    transition: 'all 150ms',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  🏛️ Our Institutes <ChevronDown size={14} style={{ transition: 'transform 200ms', transform: instituteDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {instituteDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, minWidth: '320px',
                    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)', padding: '0.5rem',
                    zIndex: 1100, animation: 'fadeInDown 0.2s ease'
                  }}>
                    {subInstitutions.map(inst => (
                      <a
                        key={inst._id}
                        href={inst.websiteUrl || '#'}
                        target={inst.websiteUrl ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#1E293B',
                          fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                          transition: 'all 150ms'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#00529B'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1E293B'; }}
                      >
                        <span style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                          {inst.iconEmoji || '🏛️'}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inst.name}</div>
                          {inst.programs && inst.programs.length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                              {inst.programs.slice(0, 3).join(' • ')}
                            </div>
                          )}
                        </div>
                        {inst.websiteUrl && <ExternalLink size={12} style={{ color: '#94A3B8', flexShrink: 0 }} />}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Nav Items with Multi-level Subpage Dropdowns */}
            {navItems.map(item => {
              const hasSubpages = item.subpages && item.subpages.length > 0;
              const isSubpageActive = hasSubpages && item.subpages.some(s => s.slug === currentRoute);
              const isActive = currentRoute === item.id || isSubpageActive;
              const isDropdownOpen = activeDropdown === item.id;

              if (!hasSubpages) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      background: isActive ? 'rgba(217, 119, 6, 0.2)' : 'transparent',
                      color: isActive ? '#FCD34D' : '#F8FAFC',
                      border: 'none',
                      borderBottom: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                      padding: '0.7rem 0.6rem',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.015em',
                      transition: 'all 150ms ease',
                      fontFamily: "'Inter', sans-serif"
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#FCD34D'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <div
                  key={item.id}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      background: isActive ? 'rgba(217, 119, 6, 0.2)' : 'transparent',
                      color: isActive ? '#FCD34D' : '#F8FAFC',
                      border: 'none',
                      borderBottom: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                      padding: '0.7rem 0.6rem',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.015em',
                      transition: 'all 150ms ease',
                      fontFamily: "'Inter', sans-serif",
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#FCD34D'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={13}
                      style={{
                        transition: 'transform 200ms ease',
                        transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                        opacity: 0.8
                      }}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        minWidth: '270px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        boxShadow: '0 16px 40px rgba(0, 33, 71, 0.22)',
                        padding: '0.45rem',
                        zIndex: 1100,
                        animation: 'fadeInDown 0.18s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem 0.4rem 0.75rem',
                        borderBottom: '1px solid #F1F5F9',
                        marginBottom: '0.3rem'
                      }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {item.label}
                        </span>
                        <button
                          onClick={() => handleNavClick(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#00529B',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Overview →
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        {item.subpages.map(sub => {
                          const isSubActive = currentRoute === sub.slug;
                          return (
                            <button
                              key={sub._id || sub.slug}
                              onClick={() => handleNavClick(sub.slug)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '0.55rem 0.75rem',
                                borderRadius: '6px',
                                background: isSubActive ? '#EFF6FF' : 'transparent',
                                color: isSubActive ? '#00529B' : '#1E293B',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 120ms ease',
                                fontFamily: "'Inter', sans-serif"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#F8FAFC';
                                e.currentTarget.style.color = '#00529B';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = isSubActive ? '#EFF6FF' : 'transparent';
                                e.currentTarget.style.color = isSubActive ? '#00529B' : '#1E293B';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: isSubActive ? '#2563EB' : '#94A3B8',
                                  flexShrink: 0
                                }} />
                                <span style={{
                                  fontSize: '0.84rem',
                                  fontWeight: isSubActive ? 700 : 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {sub.navLabel || sub.title}
                                </span>
                              </div>
                              {sub.heroBadge && (
                                <span style={{
                                  fontSize: '0.62rem',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  background: '#EFF6FF',
                                  color: '#2563EB',
                                  fontWeight: 700,
                                  marginLeft: '0.5rem',
                                  flexShrink: 0
                                }}>
                                  {sub.heroBadge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div style={{
            background: '#FFFFFF', borderTop: '2px solid var(--color-accent)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.2)', padding: '1.25rem',
            maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            animation: 'fadeInDown 0.3s ease'
          }}>
            {/* Sub-institutions in mobile */}
            {isGroupMode && subInstitutions.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Our Institutions
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {subInstitutions.map(inst => (
                    <a
                      key={inst._id}
                      href={inst.websiteUrl || '#'}
                      target={inst.websiteUrl ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0',
                        background: '#F8FAFC', textDecoration: 'none', color: '#334155', fontSize: '0.8rem', fontWeight: 500
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{inst.iconEmoji || '🏛️'}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.shortName || inst.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem' }}>
              {navItems.map(item => {
                const hasSubpages = item.subpages && item.subpages.length > 0;
                const isSubpageActive = hasSubpages && item.subpages.some(s => s.slug === currentRoute);
                const isActive = currentRoute === item.id || isSubpageActive;
                const isExpanded = mobileExpanded[item.id];

                if (!hasSubpages) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem', borderRadius: '8px',
                        border: '1px solid', borderColor: isActive ? '#002147' : '#E2E8F0',
                        background: isActive ? '#EFF6FF' : '#F8FAFC',
                        color: isActive ? '#002147' : '#334155',
                        fontWeight: isActive ? 700 : 500, fontSize: '0.85rem',
                        cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={13} style={{ opacity: isActive ? 1 : 0.3 }} />
                    </button>
                  );
                }

                return (
                  <div key={item.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isActive ? '#EFF6FF' : '#F8FAFC',
                      padding: '0.55rem 0.75rem'
                    }}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        style={{
                          background: 'none', border: 'none', textAlign: 'left',
                          color: isActive ? '#002147' : '#1E293B',
                          fontWeight: isActive ? 700 : 600,
                          fontSize: '0.86rem', cursor: 'pointer', flex: 1, padding: 0
                        }}
                      >
                        {item.label}
                      </button>
                      <button
                        onClick={() => setMobileExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        style={{
                          background: 'rgba(0,0,0,0.04)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.25rem 0.45rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.72rem',
                          color: '#64748B',
                          fontWeight: 600
                        }}
                      >
                        <span>{item.subpages.length}</span>
                        <ChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '0.35rem 0.5rem', background: '#FFFFFF', borderTop: '1px solid #F1F5F9' }}>
                        {item.subpages.map(sub => {
                          const isSubActive = currentRoute === sub.slug;
                          return (
                            <button
                              key={sub._id || sub.slug}
                              onClick={() => handleNavClick(sub.slug)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                background: isSubActive ? '#EFF6FF' : 'transparent',
                                color: isSubActive ? '#00529B' : '#475569',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: isSubActive ? 700 : 500,
                                fontFamily: "'Inter', sans-serif"
                              }}
                            >
                              <span>↳ {sub.navLabel || sub.title}</span>
                              {sub.heroBadge && (
                                <span style={{ fontSize: '0.62rem', background: '#EFF6FF', color: '#2563EB', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                                  {sub.heroBadge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }} onClick={() => handleNavClick('admin')}>
                <Lock size={14} /> CMS Admin
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
