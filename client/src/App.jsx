import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InquiryModal from './components/InquiryModal';

import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Departments from './pages/Departments';
import Programs from './pages/Programs';
import Admissions from './pages/Admissions';
import Placements from './pages/Placements';
import Campus from './pages/Campus';
import StudentLife from './pages/StudentLife';
import Research from './pages/Research';
import NewsNotices from './pages/NewsNotices';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import CustomPage from './pages/CustomPage';

import AdminDashboard from './admin/AdminDashboard';
import SuperAdminDashboard from './admin/SuperAdminDashboard';
import { api } from './services/api';
import { applyTheme } from './styles/themes';
import './styles/portfolio-academic.css';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [config, setConfig] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryCourse, setInquiryCourse] = useState('');
  const [toast, setToast] = useState(null);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/api/v1/public/config');
      if (res.success) {
        let fullConfig = res.data;
        if (!fullConfig.pages || fullConfig.pages.length === 0) {
          try {
            const pagesRes = await api.get('/api/v1/public/pages');
            if (pagesRes?.success && Array.isArray(pagesRes.data)) {
              fullConfig = { ...fullConfig, pages: pagesRes.data };
            }
          } catch (e) {
            // Ignore if pages endpoint fails
          }
        }
        setConfig(fullConfig);
        if (fullConfig.settings) {
          applyTheme(fullConfig.settings);
          if (fullConfig.settings.seo_meta_title) {
            document.title = fullConfig.settings.seo_meta_title;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load configuration', err);
    }
  };

  const navigate = (route) => {
    const cleanRoute = (route || 'home').replace(/^#\/?/, '').replace(/^\/+|\/+$/g, '');
    const targetUrl = cleanRoute === 'home' ? '/' : `/${cleanRoute}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    setCurrentRoute(cleanRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConfig();

    const getCleanRoute = () => {
      // Automatic legacy hash migration: if user visits /#admin or /#about, migrate cleanly to /admin or /about
      if (window.location.hash) {
        const legacyHash = window.location.hash.replace(/^#\/?/, '').trim();
        if (legacyHash) {
          const cleanPath = legacyHash === 'home' ? '/' : `/${legacyHash}`;
          window.history.replaceState(null, '', cleanPath);
          return legacyHash;
        }
      }
      let path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      return path || 'home';
    };

    const syncRoute = () => {
      const route = getCleanRoute();
      setCurrentRoute(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);

    // Global internal link interceptor: intercepts any clicked links (including legacy # links or relative links)
    // to keep URLs 100% clean with HTML5 pushState without # anywhere
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        anchor.getAttribute('target') === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      if (href.startsWith('#')) {
        e.preventDefault();
        const clean = href.replace(/^#\/?/, '').trim();
        navigate(clean || 'home');
        return;
      }

      if (href.startsWith('/')) {
        if (href.startsWith('/uploads/') || href.startsWith('/assets/') || href.startsWith('/api/')) {
          return;
        }
        e.preventDefault();
        const clean = href.replace(/^\/+|\/+$/g, '');
        navigate(clean || 'home');
        return;
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('popstate', syncRoute);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openInquiry = (course = '') => {
    setInquiryCourse(course);
    setInquiryModalOpen(true);
  };

  const settings = config?.settings || {};
  const isSuperAdminRoute = currentRoute === 'superadmin' || currentRoute.startsWith('superadmin/');
  const isAdminRoute = currentRoute === 'admin' || currentRoute.startsWith('admin/');
  const isDedicatedPortal = isAdminRoute || isSuperAdminRoute;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {toast && <div className={`toast-msg ${toast.type}`}><span>{toast.message}</span></div>}

      {!isDedicatedPortal && (
        <Header settings={settings} navigation={config?.navigation} pages={config?.pages} currentRoute={currentRoute} onNavigate={navigate} onOpenInquiry={openInquiry} />
      )}

      <main style={{ flex: 1 }}>
        {currentRoute === 'home' && <Home onNavigate={navigate} onOpenInquiry={openInquiry} settings={settings} sections={config?.sections || []} />}
        {currentRoute === 'about' && <About settings={settings} onNavigate={navigate} />}
        {currentRoute === 'academics' && <Academics settings={settings} onNavigate={navigate} onOpenInquiry={openInquiry} />}
        {currentRoute === 'departments' && <Departments settings={settings} onNavigate={navigate} />}
        {currentRoute === 'programs' && <Programs settings={settings} onNavigate={navigate} onOpenInquiry={openInquiry} />}
        {currentRoute === 'admissions' && <Admissions settings={settings} onOpenInquiry={openInquiry} />}
        {currentRoute === 'placements' && <Placements settings={settings} onNavigate={navigate} />}
        {currentRoute === 'campus' && <Campus settings={settings} onNavigate={navigate} />}
        {currentRoute === 'research' && <Research settings={settings} onNavigate={navigate} onOpenInquiry={openInquiry} />}
        {currentRoute === 'life' && <StudentLife settings={settings} onNavigate={navigate} />}
        {currentRoute === 'gallery' && <Gallery settings={settings} />}
        {currentRoute === 'news' && <NewsNotices settings={settings} onNavigate={navigate} />}
        {currentRoute === 'contact' && <Contact settings={settings} onToast={showToast} />}

        {!isDedicatedPortal && !['home', 'about', 'academics', 'departments', 'programs', 'admissions', 'campus', 'placements', 'research', 'life', 'gallery', 'news', 'contact'].includes(currentRoute) && (
          <CustomPage slug={currentRoute.includes('/') ? currentRoute.split('/').pop() : currentRoute} onOpenInquiry={openInquiry} onNavigate={navigate} />
        )}

        {isAdminRoute && (
          <AdminDashboard onToast={showToast} onPublicUpdate={fetchConfig} onNavigate={navigate} />
        )}

        {isSuperAdminRoute && (
          <SuperAdminDashboard onToast={showToast} onNavigate={navigate} />
        )}
      </main>

      {!isDedicatedPortal && <Footer settings={settings} onNavigate={navigate} onOpenInquiry={openInquiry} />}

      {!isDedicatedPortal && (
        <button
          onClick={() => openInquiry()}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, var(--color-accent), #92400E)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.85rem 1.4rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
            cursor: 'pointer',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Admissions Inquiry</span>
        </button>
      )}

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        defaultCourse={inquiryCourse}
        onToast={showToast}
        settings={settings}
      />
    </div>
  );
}
