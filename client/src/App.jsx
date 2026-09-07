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
        setConfig(res.data);
        if (res.data.settings) {
          applyTheme(res.data.settings);
          if (res.data.settings.seo_meta_title) {
            document.title = res.data.settings.seo_meta_title;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load configuration', err);
    }
  };

  useEffect(() => {
    fetchConfig();

    const syncRouteFromHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setCurrentRoute(hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    syncRouteFromHash();
    window.addEventListener('hashchange', syncRouteFromHash);
    return () => window.removeEventListener('hashchange', syncRouteFromHash);
  }, []);

  const navigate = (route) => {
    window.location.hash = `#${route}`;
    setCurrentRoute(route);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openInquiry = (course = '') => {
    setInquiryCourse(course);
    setInquiryModalOpen(true);
  };

  const settings = config?.settings || {};

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {toast && <div className={`toast-msg ${toast.type}`}><span>{toast.message}</span></div>}

      {currentRoute !== 'admin' && (
        <Header settings={settings} navigation={config?.navigation} currentRoute={currentRoute} onNavigate={navigate} onOpenInquiry={openInquiry} />
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

        {!['home', 'about', 'academics', 'departments', 'programs', 'admissions', 'campus', 'placements', 'research', 'life', 'gallery', 'news', 'contact', 'admin'].includes(currentRoute) && (
          <CustomPage slug={currentRoute} onOpenInquiry={openInquiry} onNavigate={navigate} />
        )}

        {currentRoute === 'admin' && (
          <AdminDashboard onToast={showToast} onPublicUpdate={fetchConfig} onNavigate={navigate} />
        )}
      </main>

      {currentRoute !== 'admin' && <Footer settings={settings} onNavigate={navigate} onOpenInquiry={openInquiry} />}

      {currentRoute !== 'admin' && (
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
