import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, User, Info, FolderGit2, Sparkles, GraduationCap,
  Briefcase, Award, Calendar, Layers, Shield, Settings, LogOut,
  CheckCircle, Plus, Trash2, Edit, ArrowUp, ArrowDown, ArrowLeft, Eye, EyeOff,
  Upload, X, Check, Save, HelpCircle, ExternalLink, Globe, Sliders,
  ChevronDown, ChevronUp, FileText, Search, Home, BookOpen, Users,
  Building2, ClipboardList, School, Microscope, Image, Newspaper, Phone
} from 'lucide-react';
import { api } from '../services/api';
import ImageUploadField from './ImageUploadField';

export default function AdminDashboard({ onToast, onPublicUpdate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [currentTab, setCurrentTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(api.getAdmin());

  // Tab states
  const [sectionsList, setSectionsList] = useState([]);
  const [pagesList, setPagesList] = useState([]);
  const [subsectionsList, setSubsectionsList] = useState([]);
  const [expandedPages, setExpandedPages] = useState({});
  const [pageSearch, setPageSearch] = useState('');
  const [banners, setBanners] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [selectedStudioPage, setSelectedStudioPage] = useState(null);
  const [pageEditorData, setPageEditorData] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [settingsList, setSettingsList] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('Admin@123');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);

  // Settings form local state
  const [localSettings, setLocalSettings] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, currentTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/v1/auth/login', { username: loginUsername, password: loginPassword });
      if (res.success) {
        api.setAuth(res.token, res.admin);
        setIsAuthenticated(true);
        setAdminUser(res.admin);
        onToast('Welcome to Portfolio Admin Dashboard & CMS!', 'success');
      }
    } catch (err) {
      onToast(err.message || 'Login failed', 'error');
    }
  };

  const handleLogout = () => {
    api.clearAuth();
    setIsAuthenticated(false);
    onToast('Logged out of Admin CMS');
  };

    const fetchAllData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get('/api/v1/admin/pages'),
        api.get('/api/v1/admin/subsections'),
        api.get('/api/v1/admin/homepage-sections'),
        api.get('/api/v1/admin/banners'),
        api.get('/api/v1/admin/courses'),
        api.get('/api/v1/admin/departments'),
        api.get('/api/v1/admin/facilities'),
        api.get('/api/v1/admin/placements'),
        api.get('/api/v1/admin/recruiters'),
        api.get('/api/v1/admin/admissions'),
        api.get('/api/v1/admin/notices'),
        api.get('/api/v1/admin/events'),
        api.get('/api/v1/admin/gallery'),
        api.get('/api/v1/admin/inquiries'),
        api.get('/api/v1/admin/settings'),
        api.get('/api/v1/admin/navigation')
      ]);

      const [
        pRes, subRes, secRes, banRes, courseRes, deptRes, facRes,
        plcRes, recRes, admRes, notRes, evRes, galRes, inqRes, setRes, navRes
      ] = results;

      if (pRes.status === 'fulfilled' && pRes.value?.data) {
        setPagesList(pRes.value.data);
        // Keep selected studio page in sync with updated database document
        setSelectedStudioPage(prev => {
          if (!prev) return null;
          const found = pRes.value.data.find(p => (p._id || p.id) === (prev._id || prev.id) || p.slug === prev.slug);
          return found || prev;
        });
      }
      if (subRes.status === 'fulfilled' && subRes.value?.data) setSubsectionsList(subRes.value.data);
      if (secRes.status === 'fulfilled' && secRes.value?.data) setSectionsList(secRes.value.data);
      if (banRes.status === 'fulfilled' && banRes.value?.data) setBanners(banRes.value.data);
      if (courseRes.status === 'fulfilled' && courseRes.value?.data) setCourses(courseRes.value.data);
      if (deptRes.status === 'fulfilled' && deptRes.value?.data) setDepartments(deptRes.value.data);
      if (facRes.status === 'fulfilled' && facRes.value?.data) setFacilities(facRes.value.data);
      if (plcRes.status === 'fulfilled' && plcRes.value?.data) setPlacements(plcRes.value.data);
      if (recRes.status === 'fulfilled' && recRes.value?.data) setRecruiters(recRes.value.data);
      if (admRes.status === 'fulfilled' && admRes.value?.data) setAdmissions(admRes.value.data);
      if (notRes.status === 'fulfilled' && notRes.value?.data) setNotices(notRes.value.data);
      if (evRes.status === 'fulfilled' && evRes.value?.data) setEvents(evRes.value.data);
      if (galRes.status === 'fulfilled' && galRes.value?.data) setGalleryList(galRes.value.data);
      if (inqRes.status === 'fulfilled' && inqRes.value?.data) setInquiries(inqRes.value.data);
      if (navRes.status === 'fulfilled' && navRes.value?.data) setNavItems(navRes.value.data);
      if (setRes.status === 'fulfilled' && setRes.value?.data) {
        setSettingsList(setRes.value.data);
        const map = {};
        (setRes.value.data || []).forEach(s => { map[s.key] = s.value; });
        setLocalSettings(map);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = () => fetchAllData();

  // 1-Click Toggle for Sections
  const handleToggleSection = async (sectionId) => {
    try {
      const res = await api.patch(`/api/v1/admin/homepage-sections/${sectionId}/toggle`);
      if (res.success) {
        onToast(res.message || 'Visibility updated!', 'success');
        setSectionsList(prev => prev.map(s => {
          if ((s._id || s.id) === sectionId) {
            return { ...s, isVisible: !s.isVisible };
          }
          return s;
        }));
        onPublicUpdate?.();
      }
    } catch (err) {
      onToast(err.message || 'Failed to toggle visibility', 'error');
    }
  };

  // Reorder Sections
  const handleMoveSection = async (index, direction) => {
    const list = [...sectionsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setSectionsList(list);

    try {
      const orderedIds = list.map(item => item._id || item.id);
      await api.post('/api/v1/admin/homepage-sections/reorder', { orderedIds });
      onToast('Section order re-arranged live!');
      onPublicUpdate?.();
    } catch (err) {
      onToast('Failed to save section order', 'error');
      loadTabData('overview');
    }
  };

  // 1-Click Toggle for other entities
  const handleToggleEntity = async (type, id) => {
    try {
      const res = await api.patch(`/api/v1/admin/${type}/${id}/toggle`);
      if (res.success) {
        onToast(res.message || 'Status updated!', 'success');
        fetchAllData();
        onPublicUpdate?.();
      }
    } catch (err) {
      onToast(err.message || 'Failed to toggle', 'error');
    }
  };

  // Save Settings (Header, Footer, About, Settings)
  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    try {
      await api.post('/api/v1/admin/settings', { settings: localSettings });
      onToast('All settings saved and published live to MongoDB Atlas!', 'success');
      fetchAllData();
      onPublicUpdate?.();
    } catch (err) {
      onToast(err.message || 'Failed to save settings', 'error');
    }
  };

  // Instant update and save when logo is uploaded
  const handleLogoUploaded = async (url) => {
    const updated = { ...localSettings, college_logo: url };
    setLocalSettings(updated);
    try {
      await api.post('/api/v1/admin/settings', { settings: updated });
      onToast('College emblem/logo updated and published live across the site!', 'success');
      fetchAllData();
      onPublicUpdate?.();
    } catch (err) {
      onToast(err.message || 'Logo uploaded. Please click Save Settings.', 'info');
    }
  };

  // Save Page Details
  const handleSavePageDetails = async (e) => {
    e?.preventDefault();
    if (!pageEditorData) return;
    try {
      const id = pageEditorData._id || pageEditorData.id;
      const res = await api.put(`/api/v1/admin/pages/${id}`, pageEditorData);
      if (res.success) {
        onToast(`Page "${pageEditorData.title}" details updated live!`, 'success');
        fetchAllData();
        setSelectedStudioPage(res.data);
        onPublicUpdate?.();
      }
    } catch (err) {
      onToast(err.message || 'Failed to save page', 'error');
    }
  };

  // File Upload Helper
  const handleFileUpload = async (file, targetField = 'imageUrl') => {
    if (!file) return;
    setUploading(true);
    onToast(`Uploading ${file.name}...`);
    try {
      const res = await api.upload(file);
      const url = res.file?.url;
      setFormData(prev => ({ ...prev, [targetField]: url }));
      onToast('File uploaded successfully!', 'success');
    } catch (err) {
      onToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Modal Open
    const getEndpoint = (type) => {
    switch (type) {
      case 'page': return 'pages';
      case 'subsection': return 'subsections';
      case 'banner': return 'banners';
      case 'gallery': return 'gallery';
      case 'nav': return 'navigation';
      case 'course': return 'courses';
      case 'department': return 'departments';
      case 'facility': return 'facilities';
      case 'recruiter': return 'recruiters';
      case 'admission': return 'admissions';
      case 'notice': return 'notices';
      case 'event': return 'events';
      case 'section': return 'homepage-sections';
      default: return 'homepage-sections';
    }
  };

  // Modal Open
  const openModal = (type, item = null, extraDefaults = {}) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      if (type === 'section') {
        setFormData({
          title: '',
          subtitle: '',
          badge: 'FEATURED',
          layoutType: 'image_banner',
          imageUrl: '',
          ctaText: 'Explore More',
          ctaLink: '#gallery',
          isVisible: true,
          content: ''
        });
      } else if (type === 'page') {
        setFormData({
          title: '',
          slug: '',
          navLabel: '',
          heroTitle: '',
          heroSubtitle: '',
          heroBadge: 'NEW PAGE',
          heroImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
          content: '',
          showInHeader: true,
          showInFooter: true,
          isActive: true
        });
      } else if (type === 'subsection') {
        setFormData({
          pageSlug: extraDefaults?.pageSlug || selectedStudioPage?.slug || (pagesList[0]?.slug || 'about'),
          title: '',
          subtitle: '',
          badge: 'FEATURED',
          layoutType: 'split_content',
          imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
          content: '',
          ctaText: 'Explore More',
          ctaLink: '#contact',
          isVisible: true
        });
      } else if (type === 'banner') {
        setFormData({
          title: '',
          subtitle: '',
          badge: 'NEW',
          imageUrl: '',
          ctaText: 'Explore Academic Degrees',
          ctaLink: '#academics',
          secondaryCtaText: 'Admission Roadmap',
          secondaryCtaLink: '#admissions',
          isActive: true
        });
      } else if (type === 'gallery') {
        setFormData({
          title: '',
          category: 'Campus',
          imageUrl: '',
          caption: '',
          isActive: true,
          featuredOnHome: true
        });
      } else if (type === 'nav') {
        setFormData({
          title: '',
          path: '#',
          sortOrder: navItems.length + 1,
          isActive: true
        });
      } else if (type === 'course') {
        setFormData({
          title: '',
          degree: 'B.Tech',
          departmentCode: departments[0]?.code || 'CS',
          duration: '4 Years',
          intake: 120,
          annualFee: '₹1,25,000 / Year',
          eligibility: '10+2 with PCM minimum 50%',
          careerOpportunities: 'Software Development, AI Engineering, Cloud Architecture',
          description: '',
          isActive: true
        });
      } else if (type === 'department') {
        setFormData({
          name: '',
          code: '',
          degreeLevels: 'B.Tech, M.Tech, Ph.D.',
          hodName: '',
          hodImage: '',
          hodMessage: '',
          email: '',
          phone: '',
          facultyCount: 20,
          studentIntake: 180,
          labsCount: 8,
          imageUrl: '',
          overview: '',
          vision: '',
          mission: '',
          isActive: true
        });
      } else if (type === 'facility') {
        setFormData({
          title: '',
          category: 'Academic',
          imageUrl: '',
          description: '',
          isActive: true
        });
      } else if (type === 'recruiter') {
        setFormData({
          name: '',
          highestPackage: '₹14 LPA',
          tier: 'Dream',
          logoUrl: '',
          isActive: true
        });
      } else if (type === 'admission') {
        setFormData({
          category: extraDefaults?.category || 'Admission Process',
          title: '',
          stepNumber: 1,
          deadline: '',
          description: '',
          feeAnnual: '',
          eligibilityCriteria: '',
          requiredDocuments: '',
          isActive: true
        });
      } else if (type === 'notice') {
        setFormData({
          title: '',
          category: 'Academics',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          description: '',
          link: '',
          status: 'published',
          isNewNotice: true
        });
      } else if (type === 'event') {
        setFormData({
          title: '',
          date: '',
          venue: '',
          description: '',
          imageUrl: '',
          status: 'published'
        });
      }
    }
    setModalOpen(true);
  };

  // Modal Submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = getEndpoint(modalType);
      let payload = { ...formData };

      // Ensure department stats object is properly synchronized
      if (modalType === 'department') {
        payload.facultyCount = Number(payload.facultyCount || 20);
        payload.studentIntake = Number(payload.studentIntake || 120);
        payload.stats = {
          ...(payload.stats || {}),
          intake: Number(payload.studentIntake || 120),
          faculty: Number(payload.facultyCount || 20),
          labs: Number(payload.labsCount || payload.stats?.labs || 8),
          placementRate: payload.placementRate || payload.stats?.placementRate || '95%'
        };
      }

      if (editingItem) {
        const id = editingItem._id || editingItem.id;
        await api.put(`/api/v1/admin/${endpoint}/${id}`, payload);
        onToast('Updated successfully!', 'success');
      } else {
        await api.post(`/api/v1/admin/${endpoint}`, payload);
        onToast('Created and published live!', 'success');
      }
      setModalOpen(false);
      fetchAllData();
      onPublicUpdate?.();
    } catch (err) {
      onToast(err.message || 'Failed to save item', 'error');
    }
  };

  // Delete Item
  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const endpoint = getEndpoint(type);
      await api.delete(`/api/v1/admin/${endpoint}/${id}`);
      onToast('Deleted successfully', 'success');
      fetchAllData();
      onPublicUpdate?.();
    } catch (err) {
      onToast(err.message || 'Failed to delete', 'error');
    }
  };

  // ============================================
  // LOGIN SCREEN
  // ============================================
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F7FA', padding: '1rem' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", color: "#2563EB" }}><GraduationCap size={28} /></div>
            <h2 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '0.25rem' }}>Admin Login</h2>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Sign in to manage your college website</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '0.85rem' }}>
              <label className="simple-label">Username</label>
              <input type="text" className="simple-input" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="simple-label">Password</label>
              <input type="password" className="simple-input" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}>
              Sign In
            </button>
          </form>

          <div style={{ background: '#F9FAFB', padding: '0.75rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.78rem', textAlign: 'center', color: '#6B7280', border: '1px solid #E5E7EB' }}>
            Username: <strong>admin</strong> &nbsp;|&nbsp; Password: <strong>Admin@123</strong>
          </div>
        </div>
      </div>
    );
  }

  // Helper: render clean Lucide icon for each page slug
  const renderPageIcon = (slug, size = 16) => {
    const p = { size, style: { flexShrink: 0 } };
    switch (slug) {
      case 'home': return <Home {...p} />;
      case 'about': return <Info {...p} />;
      case 'leadership': return <Users {...p} />;
      case 'academics': return <GraduationCap {...p} />;
      case 'departments': return <Building2 {...p} />;
      case 'programs': return <BookOpen {...p} />;
      case 'admissions': return <ClipboardList {...p} />;
      case 'placements': return <Briefcase {...p} />;
      case 'campus': return <School {...p} />;
      case 'life': return <Sparkles {...p} />;
      case 'research': return <Microscope {...p} />;
      case 'gallery': return <Image {...p} />;
      case 'news': return <Newspaper {...p} />;
      case 'contact': return <Phone {...p} />;
      default: return <FileText {...p} />;
    }
  };

  const filteredPages = pagesList.filter(p => {
    if (!pageSearch) return true;
    const q = pageSearch.toLowerCase();
    return (p.title || '').toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q);
  });

  // ============================================
  // MAIN DASHBOARD
  // ============================================
  return (
    <div className="admin-shell">
      {/* TOP BAR */}
      <header className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}><GraduationCap size={20} /></div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>College Website Admin</h1>
            <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: 0 }}>Manage your website content easily</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="admin-btn admin-btn-primary" onClick={() => openModal('page')} style={{ fontWeight: 600 }}>
            <Plus size={14} /> Add New Page
          </button>
          <button className="admin-btn admin-btn-success" onClick={() => { handleSaveSettings(); onToast('Changes saved!', 'success'); }}>
            <Check size={14} /> Save All Changes
          </button>
          <a href="#" target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary" style={{ textDecoration: 'none' }}>
            <ExternalLink size={13} /> View Website
          </a>
          <button className="admin-btn admin-btn-secondary" onClick={handleLogout}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      <div className="admin-body">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* Dashboard */}
            <button className={`admin-nav-item ${currentTab === 'overview' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('overview'); }}>
              <LayoutDashboard size={16} /> Dashboard
            </button>

            {/* All Pages */}
            <button className={`admin-nav-item ${currentTab === 'pages' && !selectedStudioPage ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('pages'); }}>
              <FolderGit2 size={16} /> All Pages
              <span style={{ marginLeft: 'auto', background: '#EFF6FF', color: '#2563EB', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                {pagesList.length}
              </span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.6rem 0.2rem 0.6rem' }}>
              <span className="admin-section-label" style={{ padding: 0, margin: 0 }}>Your Pages</span>
              <button
                type="button"
                onClick={() => openModal('page')}
                style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.15rem 0.35rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, gap: '0.2rem' }}
                title="Add New Page"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {/* List each page */}
            {pagesList.map(p => (
              <button key={p.slug}
                className={`admin-nav-item ${currentTab === 'pages' && selectedStudioPage?.slug === p.slug ? 'active' : ''}`}
                onClick={() => { setSelectedStudioPage(p); setPageEditorData({ ...p }); setCurrentTab('pages'); }}>
                {renderPageIcon(p.slug, 16)}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.title}</span>
                <span className={`status-dot ${p.isActive ? 'active' : 'hidden'}`} title={p.isActive ? 'Visible' : 'Hidden'} />
              </button>
            ))}

            <div className="admin-section-label">Content</div>

            <button className={`admin-nav-item ${currentTab === 'hero' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('hero'); }}>
              <Sparkles size={16} /> Hero Slides
            </button>

            <button className={`admin-nav-item ${currentTab === 'gallery' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('gallery'); }}>
              <Layers size={16} /> Gallery
            </button>

            <button className={`admin-nav-item ${currentTab === 'notices' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('notices'); }}>
              <FileText size={16} /> Notices
            </button>

            <button className={`admin-nav-item ${currentTab === 'events' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('events'); }}>
              <Calendar size={16} /> Events
            </button>

            <div className="admin-section-label">Settings</div>

            <button className={`admin-nav-item ${currentTab === 'header' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('header'); }}>
              <Layers size={16} /> Header & Menu
            </button>

            <button className={`admin-nav-item ${currentTab === 'footer' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('footer'); }}>
              <Sliders size={16} /> Footer
            </button>

            <button className={`admin-nav-item ${currentTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('settings'); }}>
              <Settings size={16} /> Settings
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-main">

          {/* ======== DASHBOARD TAB ======== */}
          {currentTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dashboard</h2>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem' }}>Overview of your website content and quick controls.</p>

              {/* Quick Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                <div className="stat-box">
                  <div className="stat-number">{pagesList.length}</div>
                  <div className="stat-label">Total Pages</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{pagesList.filter(p => p.isActive).length}</div>
                  <div className="stat-label">Active Pages</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{subsectionsList.length}</div>
                  <div className="stat-label">Content Sections</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{sectionsList.filter(s => s.isVisible).length}/{sectionsList.length}</div>
                  <div className="stat-label">Homepage Sections</div>
                </div>
              </div>

              {/* Homepage Sections */}
              <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Homepage Sections</h3>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Turn sections on or off on your homepage</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sectionsList.map((sec, idx) => (
                    <div key={sec._id || sec.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: sec.isVisible ? '#111827' : '#9CA3AF' }}>
                          {sec.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: sec.isVisible ? '#059669' : '#9CA3AF' }}>
                          {sec.isVisible ? 'Showing' : 'Hidden'}
                        </span>
                        <button className={`toggle-switch ${sec.isVisible ? 'on' : ''}`}
                          onClick={() => handleToggleSection(sec._id || sec.id)}>
                          <span className="toggle-switch-knob" />
                        </button>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="admin-btn admin-btn-secondary" style={{ padding: '0.25rem 0.4rem' }} disabled={idx === 0} onClick={() => handleMoveSection(idx, 'up')} title="Move up">
                            <ArrowUp size={13} />
                          </button>
                          <button className="admin-btn admin-btn-secondary" style={{ padding: '0.25rem 0.4rem' }} disabled={idx === sectionsList.length - 1} onClick={() => handleMoveSection(idx, 'down')} title="Move down">
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="admin-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.75rem 0' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button className="admin-btn admin-btn-primary" onClick={() => { setCurrentTab('pages'); openModal('page'); }}><Plus size={14} /> Add New Page</button>
                  <button className="admin-btn admin-btn-secondary" onClick={() => { setCurrentTab('hero'); openModal('banner'); }}><Plus size={14} /> Add Hero Slide</button>
                  <button className="admin-btn admin-btn-secondary" onClick={() => { setCurrentTab('gallery'); openModal('gallery'); }}><Plus size={14} /> Add Photo</button>
                  <button className="admin-btn admin-btn-secondary" onClick={() => { setCurrentTab('notices'); }}><FileText size={14} /> Manage Notices</button>
                </div>
              </div>
            </div>
          )}

          {/* ======== ALL PAGES TAB (no page selected) ======== */}
          {currentTab === 'pages' && !selectedStudioPage && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>All Pages</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>Click any page to edit its content, title, and images.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => openModal('page')}>
                  <Plus size={14} /> Add New Page
                </button>
              </div>

              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                <Search size={16} style={{ color: '#9CA3AF' }} />
                <input type="text" placeholder="Search pages..." value={pageSearch} onChange={e => setPageSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem', color: '#111827', background: 'transparent' }} />
                {pageSearch && <button onClick={() => setPageSearch('')} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}><X size={14} /></button>}
              </div>

              {/* Page List */}
              {filteredPages.map(page => {
                const pageSubs = subsectionsList.filter(s => s.pageSlug === page.slug);
                return (
                  <div key={page._id || page.slug} className="page-list-item"
                    onClick={() => { setSelectedStudioPage(page); setPageEditorData({ ...page }); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>{renderPageIcon(page.slug, 18)}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ fontSize: '0.92rem', color: '#111827' }}>{page.title}</strong>
                          {page.isSystem && <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>CORE</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>/{page.slug} • {pageSubs.length} section{pageSubs.length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: '0.75rem', color: page.isActive ? '#059669' : '#9CA3AF' }}>
                        {page.isActive ? '✓ Visible' : 'Hidden'}
                      </span>
                      <button className={`toggle-switch ${page.isActive ? 'on' : ''}`}
                        onClick={() => handleToggleEntity('pages', page._id || page.id)}>
                        <span className="toggle-switch-knob" />
                      </button>
                      <button className="admin-btn admin-btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        onClick={() => { setSelectedStudioPage(page); setPageEditorData({ ...page }); }}>
                        <Edit size={12} /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======== EDIT SINGLE PAGE ======== */}
          {currentTab === 'pages' && selectedStudioPage && (
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
              {/* Top Navigation & Action Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
                background: '#FFFFFF',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setSelectedStudioPage(null)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                  >
                    <ArrowLeft size={16} /> All Pages
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                      flexShrink: 0
                    }}>
                      {renderPageIcon(selectedStudioPage.slug, 20)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                        {selectedStudioPage.title}
                      </h2>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        Page Route: <code style={{ background: '#F3F4F6', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#2563EB', fontWeight: 600 }}>/{selectedStudioPage.slug}</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F9FAFB', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: selectedStudioPage.isActive ? '#059669' : '#9CA3AF' }}>
                      {selectedStudioPage.isActive ? '● Live on Website' : '○ Hidden from Visitors'}
                    </span>
                    <button
                      type="button"
                      className={`toggle-switch ${selectedStudioPage.isActive ? 'on' : ''}`}
                      onClick={async () => {
                        await handleToggleEntity('pages', selectedStudioPage._id || selectedStudioPage.id);
                        setSelectedStudioPage(prev => ({ ...prev, isActive: !prev.isActive }));
                      }}
                      title={selectedStudioPage.isActive ? 'Click to hide this page' : 'Click to make page visible'}
                    >
                      <span className="toggle-switch-knob" />
                    </button>
                  </div>

                  <a
                    href={`#${selectedStudioPage.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-secondary"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}
                  >
                    <ExternalLink size={14} /> Open Live Page
                  </a>

                  <button
                    type="button"
                    className="admin-btn admin-btn-success"
                    onClick={handleSavePageDetails}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    <Save size={15} /> Save Page
                  </button>
                </div>
              </div>

              {/* 2-Column Responsive Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left Column: Form */}
                <form onSubmit={handleSavePageDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Card 1: Top Hero Banner */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
                      <Sparkles size={18} style={{ color: '#2563EB' }} />
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                          Top Banner & Header Showcase
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                          This is the large showcase banner visitors see at the top of the {selectedStudioPage.title} page.
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.1rem' }}>
                      <label className="simple-label">Banner Headline</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="e.g. Empowering Minds, Advancing Global Innovation"
                        value={pageEditorData?.heroTitle || ''}
                        onChange={e => setPageEditorData({ ...pageEditorData, heroTitle: e.target.value })}
                        style={{ fontSize: '0.95rem', fontWeight: 600 }}
                      />
                      <div className="simple-hint">Main primary title displayed at the top of the page.</div>
                    </div>

                    <div style={{ marginBottom: '1.1rem' }}>
                      <label className="simple-label">Banner Subtitle / Description</label>
                      <textarea
                        rows="3"
                        className="simple-input"
                        placeholder="Brief overview or mission statement displayed under the headline..."
                        value={pageEditorData?.heroSubtitle || ''}
                        onChange={e => setPageEditorData({ ...pageEditorData, heroSubtitle: e.target.value })}
                        style={{ resize: 'vertical', lineHeight: 1.6 }}
                      />
                      <div className="simple-hint">Sub-headline paragraph that explains what this page is about.</div>
                    </div>

                    <div style={{ marginBottom: '1.1rem' }}>
                      <label className="simple-label">Badge Pill Text (Optional Tag)</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="e.g. NAAC A++ ACCREDITED or ESTD 1984"
                        value={pageEditorData?.heroBadge || ''}
                        onChange={e => setPageEditorData({ ...pageEditorData, heroBadge: e.target.value })}
                      />
                      <div className="simple-hint">Small pill badge appearing right above the headline.</div>
                    </div>

                    <ImageUploadField
                      label="Banner Background Image"
                      value={pageEditorData?.heroImageUrl || ''}
                      onChange={url => setPageEditorData(prev => ({ ...prev, heroImageUrl: url }))}
                      onToast={onToast}
                      aspectRatio="wide"
                      helperText="Upload high-resolution campus photo from your computer (1920x600 recommended)"
                    />
                  </div>

                  {/* ================================================================= */}
                  {/* DYNAMIC PAGE-SPECIFIC WEBSITE CONTENT & DATABASE RECORDS */}
                  {/* ================================================================= */}

                  {/* 1. HOMEPAGE SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'home' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Homepage Hero Slides ({banners.length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Manage the rotating slider banners shown at the very top of your homepage.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('banner')}>
                          <Plus size={13} /> Add Slide
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        {banners.map(b => (
                          <div key={b._id || b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', gap: '0.75rem' }}>
                            {b.imageUrl && <img src={b.imageUrl} alt="" style={{ width: '70px', height: '44px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{b.title}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subtitle}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('banner', b)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('banner', b._id || b.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Homepage Sections Controls */}
                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#111827' }}>
                          Homepage Section Modules & Order ({sectionsList.length})
                        </h4>
                        <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0 0 0.75rem 0' }}>
                          Toggle any section on or off, or change its position on the homepage.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '280px', overflowY: 'auto' }}>
                          {sectionsList.map((sec, idx) => (
                            <div key={sec._id || sec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', width: '22px', height: '22px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span>
                                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: sec.isVisible ? '#111827' : '#9CA3AF' }}>{sec.title}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <button type="button" className={`toggle-switch ${sec.isVisible ? 'on' : ''}`} style={{ transform: 'scale(0.85)' }} onClick={() => handleToggleSection(sec._id || sec.id)}>
                                  <span className="toggle-switch-knob" />
                                </button>
                                <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.2rem 0.4rem' }} disabled={idx === 0} onClick={() => handleMoveSection(idx, 'up')}><ArrowUp size={11} /></button>
                                <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.2rem 0.4rem' }} disabled={idx === sectionsList.length - 1} onClick={() => handleMoveSection(idx, 'down')}><ArrowDown size={11} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1.5 ABOUT US SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'about' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            About Us Content Sections ({subsectionsList.filter(s => s.pageSlug === 'about').length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Modular sections like Institutional Legacy, Vision & Mission, and Academic Freedom.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('subsection', null, { pageSlug: 'about' })}>
                          <Plus size={13} /> Add Section
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        {subsectionsList.filter(s => s.pageSlug === 'about').map(sub => (
                          <div key={sub._id || sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <strong style={{ fontSize: '0.88rem', color: sub.isVisible ? '#111827' : '#9CA3AF' }}>{sub.title}</strong>
                                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#2563EB', background: '#EFF6FF', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>{sub.layoutType}</span>
                              </div>
                              {sub.content && <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.content}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className={`toggle-switch ${sub.isVisible ? 'on' : ''}`} style={{ transform: 'scale(0.85)' }} onClick={() => handleToggleEntity('subsections', sub._id || sub.id)}>
                                <span className="toggle-switch-knob" />
                              </button>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('subsection', sub)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('subsection', sub._id || sub.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Institutional Accreditations Overview */}
                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#111827' }}>
                          Institutional Accreditations on About Page
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                          <div style={{ padding: '0.65rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#D97706' }}>NAAC A++ Grade</strong>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>CGPA 3.65 / 4.0</div>
                          </div>
                          <div style={{ padding: '0.65rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#2563EB' }}>NBA Tier-1</strong>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Washington Accord</div>
                          </div>
                          <div style={{ padding: '0.65rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#7C3AED' }}>UGC Autonomous</strong>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Since 2019</div>
                          </div>
                          <div style={{ padding: '0.65rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#059669' }}>AICTE Approved</strong>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>All UG & PG Degrees</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  
                  {/* 1.6 LEADERSHIP & GOVERNANCE SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'leadership' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Leadership & Governance Sections ({subsectionsList.filter(s => s.pageSlug === 'leadership').length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Manage Governing Body, Academic Council, Principal's Office, and Board of Trustees.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('subsection', null, { pageSlug: 'leadership' })}>
                          <Plus size={13} /> Add Leadership Section
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {subsectionsList.filter(s => s.pageSlug === 'leadership').map(sub => (
                          <div key={sub._id || sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <strong style={{ fontSize: '0.88rem', color: sub.isVisible ? '#111827' : '#9CA3AF' }}>{sub.title}</strong>
                                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#2563EB', background: '#EFF6FF', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>{sub.layoutType}</span>
                              </div>
                              {sub.content && <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.content}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className={`toggle-switch ${sub.isVisible ? 'on' : ''}`} style={{ transform: 'scale(0.85)' }} onClick={() => handleToggleEntity('subsections', sub._id || sub.id)}>
                                <span className="toggle-switch-knob" />
                              </button>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('subsection', sub)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('subsection', sub._id || sub.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                        {subsectionsList.filter(s => s.pageSlug === 'leadership').length === 0 && (
                          <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '1rem 0', margin: 0, fontSize: '0.82rem' }}>
                            No leadership sections added yet. Click "+ Add Leadership Section" to create Governing Body, Advisory Board, etc.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. ADMISSIONS SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'admissions' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      {/* Steps */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Admission Steps & Roadmap ({admissions.filter(a => a.category === 'Admission Process').length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Step-by-step procedures displayed on the Admissions page.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('admission', null, { category: 'Admission Process' })}>
                          <Plus size={13} /> Add Step
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        {admissions.filter(a => a.category === 'Admission Process').map(step => (
                          <div key={step._id || step.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: '#2563EB', color: '#FFF', width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{step.stepNumber || 1}</span>
                                <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{step.title}</strong>
                                {step.deadline && <span style={{ fontSize: '0.7rem', color: '#D97706', background: '#FEF3C7', padding: '0.05rem 0.4rem', borderRadius: '4px' }}>{step.deadline}</span>}
                              </div>
                              {step.description && <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.description}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('admission', step)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('admission', step._id || step.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Approved Fee Charts */}
                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                              Approved Annual Fee Charts ({admissions.filter(a => a.category === 'Fee Structure').length})
                            </h4>
                            <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.1rem 0 0 0' }}>
                              Annual approved fees per degree stream.
                            </p>
                          </div>
                          <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('admission', null, { category: 'Fee Structure' })}>
                            <Plus size={13} /> Add Fee Item
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {admissions.filter(a => a.category === 'Fee Structure').map(fee => (
                            <div key={fee._id || fee.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{fee.title}</strong>
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{fee.feeAnnual}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                                <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('admission', fee)}><Edit size={12} /></button>
                                <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('admission', fee._id || fee.id)}><Trash2 size={12} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. ACADEMICS SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'academics' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Degree Programs & Courses ({courses.length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Undergraduate, Postgraduate, and Doctoral programs.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('course')}>
                          <Plus size={13} /> Add Course
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {courses.map(c => (
                          <div key={c._id || c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.72rem' }}>{c.degree || 'B.Tech'}</span>
                                <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{c.title}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>• {c.duration || '4 Years'} • {c.intake || 120} Seats</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('course', c)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('course', c._id || c.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. DEPARTMENTS SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'departments' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Academic Departments ({departments.length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Manage academic departments, HOD profiles, faculty strength, and labs.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('department')}>
                          <Plus size={13} /> Add Department
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {departments.map(d => (
                          <div key={d._id || d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', gap: '0.75rem' }}>
                            {/* HOD Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              {d.hodImage ? (
                                <img src={d.hodImage} alt={d.hodName || d.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563EB' }} />
                              ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', border: '2px solid #BFDBFE' }}>
                                  {(d.code || 'DP').substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '0.92rem', color: '#111827' }}>{d.name}</strong>
                                <span style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                                  {d.code}
                                </span>
                                {d.degreeLevels && (
                                  <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                    {d.degreeLevels}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#4B5563', marginTop: '0.2rem' }}>
                                👤 <strong>HOD:</strong> {d.hodName || 'Head of Department'}
                                {d.hodMessage ? ` • "${d.hodMessage.substring(0, 45)}..."` : ''}
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', color: '#1E40AF', background: '#DBEAFE', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                                  Faculty: {d.facultyCount || d.stats?.faculty || 20}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#065F46', background: '#D1FAE5', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                                  Intake: {d.studentIntake || d.stats?.intake || 120} seats
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#92400E', background: '#FEF3C7', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                                  Labs: {d.stats?.labs || 8}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                              <button
                                type="button"
                                className={`toggle-switch ${d.isActive !== false ? 'on' : ''}`}
                                style={{ transform: 'scale(0.85)' }}
                                onClick={() => handleToggleEntity('departments', d._id || d.id)}
                                title={d.isActive !== false ? 'Active' : 'Inactive'}
                              >
                                <span className="toggle-switch-knob" />
                              </button>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.35rem 0.55rem' }} onClick={() => openModal('department', d)} title="Edit Department">
                                <Edit size={12} />
                              </button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.35rem 0.55rem' }} onClick={() => handleDelete('department', d._id || d.id)} title="Delete Department">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4.5. PROGRAMS SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'programs' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Degree Programs Catalog ({courses.length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Manage B.Tech, M.Tech, MBA, MCA, and Ph.D. degree offerings and approved intakes.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('course')}>
                          <Plus size={13} /> Add Degree Program
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {courses.map(c => (
                          <div key={c._id || c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', gap: '0.75rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.74rem' }}>
                                  {c.degree || 'B.Tech'}
                                </span>
                                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{c.title}</strong>
                                {c.departmentCode && (
                                  <span style={{ fontSize: '0.7rem', color: '#64748B', background: '#F1F5F9', padding: '0.05rem 0.35rem', borderRadius: '3px' }}>
                                    Dept: {c.departmentCode}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#4B5563', marginTop: '0.25rem' }}>
                                ⏱️ {c.duration || '4 Years'} &nbsp;|&nbsp; 👥 {c.intake || 120} Approved Seats &nbsp;|&nbsp; 💰 {c.annualFee || 'State FRA Approved'}
                              </div>
                              {c.eligibility && (
                                <div style={{ fontSize: '0.73rem', color: '#6B7280', marginTop: '0.15rem' }}>
                                  🎓 <em>Eligibility:</em> {c.eligibility}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button
                                type="button"
                                className={`toggle-switch ${c.isActive !== false ? 'on' : ''}`}
                                style={{ transform: 'scale(0.85)' }}
                                onClick={() => handleToggleEntity('courses', c._id || c.id)}
                                title={c.isActive !== false ? 'Active' : 'Inactive'}
                              >
                                <span className="toggle-switch-knob" />
                              </button>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('course', c)} title="Edit Program">
                                <Edit size={12} />
                              </button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('course', c._id || c.id)} title="Delete Program">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. PLACEMENTS SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'placements' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Top Recruiting Companies ({recruiters.length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Companies visiting for campus drives.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('recruiter')}>
                          <Plus size={13} /> Add Recruiter
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {recruiters.map(r => (
                          <div key={r._id || r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{r.name}</strong>
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>{r.highestPackage}</span>
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#EFF6FF', color: '#2563EB', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>{r.tier}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('recruiter', r)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('recruiter', r._id || r.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. CAMPUS SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'campus' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Campus Facilities & Labs ({facilities.length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Physical infrastructure, library, hostels, and sports.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('facility')}>
                          <Plus size={13} /> Add Facility
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {facilities.map(f => (
                          <div key={f._id || f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{f.title}</strong>
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: '#6B7280', background: '#F3F4F6', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>{f.category}</span>
                              {f.description && <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('facility', f)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('facility', f._id || f.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. GALLERY SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'gallery' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Campus Photos & Media ({galleryList.length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Photos displayed in the campus photo gallery.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('gallery')}>
                          <Plus size={13} /> Add Photo
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                        {galleryList.map(g => (
                          <div key={g._id || g.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                            <img src={g.imageUrl} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                            <div style={{ padding: '0.4rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                              <button type="button" onClick={() => handleDelete('gallery', g._id || g.id)} style={{ color: '#DC2626', background: 'none', border: 'none', fontSize: '0.7rem', cursor: 'pointer', padding: 0, marginTop: '0.2rem' }}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. NEWS & NOTICES SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'news' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Notices & Circulars ({notices.length})
                          </h3>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('notice')}>
                          <Plus size={13} /> Add Notice
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {notices.map(n => (
                          <div key={n._id || n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '0.85rem' }}>{n.title}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{n.category} • {n.date}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.25rem 0.45rem' }} onClick={() => openModal('notice', n)}><Edit size={11} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.25rem 0.45rem' }} onClick={() => handleDelete('notice', n._id || n.id)}><Trash2 size={11} /></button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Events Calendar ({events.length})</h4>
                          <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('event')}>
                            <Plus size={13} /> Add Event
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {events.map(ev => (
                            <div key={ev._id || ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <strong style={{ fontSize: '0.85rem' }}>{ev.title}</strong>
                                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{ev.date} • {ev.venue}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.25rem 0.45rem' }} onClick={() => openModal('event', ev)}><Edit size={11} /></button>
                                <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.25rem 0.45rem' }} onClick={() => handleDelete('event', ev._id || ev.id)}><Trash2 size={11} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8.5 STUDENT LIFE SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'life' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Student Clubs & Activities ({subsectionsList.filter(s => s.pageSlug === 'life').length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Motorsport, hackathons, coding cells, and cultural festivals.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('subsection', null, { pageSlug: 'life' })}>
                          <Plus size={13} /> Add Club / Activity
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {subsectionsList.filter(s => s.pageSlug === 'life').map(sub => (
                          <div key={sub._id || sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{sub.title}</strong>
                              {sub.content && <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.content}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('subsection', sub)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('subsection', sub._id || sub.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8.6 RESEARCH SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'research' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Research Centers & Innovation Labs ({subsectionsList.filter(s => s.pageSlug === 'research').length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            AI Supercomputing, Cyber-Physical Systems, and Patents Portfolio.
                          </p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('subsection', null, { pageSlug: 'research' })}>
                          <Plus size={13} /> Add Research Lab
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {subsectionsList.filter(s => s.pageSlug === 'research').map(sub => (
                          <div key={sub._id || sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{sub.title}</strong>
                              {sub.content && <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.content}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('subsection', sub)}><Edit size={12} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('subsection', sub._id || sub.id)}><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 9. CONTACT SPECIFIC CONTENT */}
                  {selectedStudioPage.slug === 'contact' && (
                    <div className="admin-card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                            Received Student Inquiries ({inquiries.length})
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                            Prospective student inquiries submitted from the website form.
                          </p>
                        </div>
                      </div>
                      {inquiries.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#6B7280', textAlign: 'center', padding: '1rem 0' }}>No inquiries submitted yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {inquiries.map(inq => (
                            <div key={inq._id || inq.id} style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '0.9rem' }}>{inq.name}</strong>
                                <span style={{ fontSize: '0.72rem', color: '#2563EB', background: '#EFF6FF', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{inq.programInterested || 'Inquiry'}</span>
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: '0.2rem' }}>📧 {inq.email} | 📞 {inq.phone}</div>
                              {inq.message && <p style={{ fontSize: '0.8rem', color: '#374151', margin: '0.35rem 0 0', lineHeight: 1.4 }}>{inq.message}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Campus Contact Info & Map Editor */}
                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#111827' }}>
                          Campus Admissions, Address & Google Map Location
                        </h4>

                        <div style={{ marginBottom: '0.75rem' }}>
                          <label className="simple-label">Campus Physical Address</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="Hirabai Haridas Vidyanagari, Amrutdham, Panchavati, Nashik - 422003, Maharashtra, India"
                            value={localSettings.contact_address || ''}
                            onChange={e => setLocalSettings({ ...localSettings, contact_address: e.target.value })}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div>
                            <label className="simple-label">Primary Phone</label>
                            <input
                              type="text"
                              className="simple-input"
                              value={localSettings.contact_phone_primary || ''}
                              onChange={e => setLocalSettings({ ...localSettings, contact_phone_primary: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="simple-label">Admissions Helpline</label>
                            <input
                              type="text"
                              className="simple-input"
                              value={localSettings.contact_phone_admissions || ''}
                              onChange={e => setLocalSettings({ ...localSettings, contact_phone_admissions: e.target.value })}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div>
                            <label className="simple-label">Primary Email</label>
                            <input
                              type="email"
                              className="simple-input"
                              value={localSettings.contact_email_primary || ''}
                              onChange={e => setLocalSettings({ ...localSettings, contact_email_primary: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="simple-label">Admissions Email</label>
                            <input
                              type="email"
                              className="simple-input"
                              value={localSettings.contact_email_admissions || ''}
                              onChange={e => setLocalSettings({ ...localSettings, contact_email_admissions: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Google Maps Embed Section */}
                        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '1rem', marginBottom: '0.75rem' }}>
                          <label className="simple-label" style={{ fontWeight: 700, color: '#1E40AF' }}>
                            📍 Google Maps Embed URL
                          </label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://maps.google.com/maps?q=Nashik,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed"
                            value={localSettings.google_maps_embed || ''}
                            onChange={e => setLocalSettings({ ...localSettings, google_maps_embed: e.target.value })}
                            style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                          />
                          <div className="simple-hint" style={{ marginTop: '0.35rem', lineHeight: 1.5 }}>
                            💡 <strong>Quick format:</strong> <code>https://maps.google.com/maps?q=YourCollegeName,City&output=embed</code> or paste an embed URL from Google Maps (Share → Embed a map → copy the src URL).
                          </div>

                          {/* Live Map Preview */}
                          <div style={{ marginTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Live Map Preview:</span>
                            <div style={{ height: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                              <iframe
                                src={localSettings.google_maps_embed || 'https://maps.google.com/maps?q=Nashik,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed'}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Admin Map Preview"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="admin-btn admin-btn-success"
                          style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                          onClick={handleSaveSettings}
                        >
                          <Save size={14} /> Save Contact Details & Map Live
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Card 2: Main Page Content / Introduction */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
                      <BookOpen size={18} style={{ color: '#2563EB' }} />
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                          Page Overview & Main Content
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                          Detailed introduction text displayed in the body of this page.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="simple-label">Main Content Text</label>
                      <textarea
                        rows="5"
                        className="simple-input"
                        placeholder="Write the introduction or detailed content for this page..."
                        value={pageEditorData?.content || ''}
                        onChange={e => setPageEditorData({ ...pageEditorData, content: e.target.value })}
                        style={{ resize: 'vertical', lineHeight: 1.7 }}
                      />
                      <div className="simple-hint">Supports full paragraphs, descriptions, and institutional details.</div>
                    </div>
                  </div>

                  {/* Card 3: Navigation & Visibility Settings */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
                      <Settings size={18} style={{ color: '#2563EB' }} />
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                          Page Navigation & URL Settings
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                          Control the page title, URL path, and menu visibility.
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.1rem' }}>
                      <label className="simple-label">Page Title</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="e.g. About Us"
                        value={pageEditorData?.title || ''}
                        onChange={e => setPageEditorData({ ...pageEditorData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '1.1rem' }}>
                      <label className="simple-label">Navigation Menu Label</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="e.g. About Us"
                        value={pageEditorData?.navLabel || ''}
                        onChange={e => setPageEditorData({ ...pageEditorData, navLabel: e.target.value })}
                      />
                      <div className="simple-hint">The button text shown in the website's top navigation bar.</div>
                    </div>

                    <div style={{ marginBottom: '1.1rem' }}>
                      <label className="simple-label">
                        URL Slug {pageEditorData?.isSystem && <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Core system route: /{pageEditorData.slug})</span>}
                      </label>
                      <input
                        type="text"
                        className="simple-input"
                        value={pageEditorData?.slug || ''}
                        disabled={pageEditorData?.isSystem}
                        style={pageEditorData?.isSystem ? { background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' } : {}}
                        onChange={e => setPageEditorData({ ...pageEditorData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', background: '#F9FAFB', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E5E7EB', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={pageEditorData?.showInHeader !== false}
                          onChange={e => setPageEditorData({ ...pageEditorData, showInHeader: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
                        />
                        Show in Main Header Menu
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={pageEditorData?.showInFooter !== false}
                          onChange={e => setPageEditorData({ ...pageEditorData, showInFooter: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }}
                        />
                        Show in Footer Links
                      </label>
                    </div>
                  </div>

                  {/* Big Save Button */}
                  <button
                    type="submit"
                    className="admin-btn admin-btn-success"
                    style={{
                      padding: '0.9rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      justifyContent: 'center',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Save size={18} /> Save All Changes to {selectedStudioPage.title}
                  </button>
                </form>

                {/* Right Column: Live Preview & Content Sections Manager */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Card: Live Banner Preview */}
                  <div className="admin-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Live Banner Preview
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#059669', background: '#ECFDF5', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                        Real-time
                      </span>
                    </div>

                    <div style={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      padding: '2.25rem 1.5rem',
                      color: '#FFFFFF',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      position: 'relative',
                      backgroundImage: `linear-gradient(rgba(11, 37, 69, 0.8), rgba(19, 62, 104, 0.92)), url(${pageEditorData?.heroImageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      {pageEditorData?.heroBadge && (
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(217, 119, 6, 0.45)',
                          color: '#FDE68A',
                          border: '1px solid rgba(217, 119, 6, 0.65)',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          marginBottom: '0.65rem',
                          width: 'fit-content'
                        }}>
                          {pageEditorData.heroBadge}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.3 }}>
                        {pageEditorData?.heroTitle || pageEditorData?.title || 'Banner Headline'}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#E2E8F0', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
                        {pageEditorData?.heroSubtitle || 'Your banner subtitle and description will appear here on the public website.'}
                      </p>
                    </div>
                  </div>

                  {/* Card: Content Sections Manager */}
                  <div className="admin-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                          Content Sections ({subsectionsList.filter(s => s.pageSlug === selectedStudioPage.slug).length})
                        </h3>
                        <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                          Modular content blocks on the {selectedStudioPage.title} page
                        </p>
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => openModal('subsection', null, { pageSlug: selectedStudioPage.slug })}
                      >
                        <Plus size={14} /> Add Section
                      </button>
                    </div>

                    {subsectionsList.filter(s => s.pageSlug === selectedStudioPage.slug).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#F9FAFB', borderRadius: '8px', border: '1.5px dashed #D1D5DB' }}>
                        <div style={{ color: '#9CA3AF', marginBottom: '0.5rem' }}>
                          <Layers size={28} style={{ margin: '0 auto' }} />
                        </div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#4B5563', margin: '0 0 0.25rem 0' }}>
                          No extra content sections yet
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 1rem 0' }}>
                          Add custom blocks like image+text, cards, or banners to this page.
                        </p>
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary"
                          style={{ margin: '0 auto', fontSize: '0.82rem' }}
                          onClick={() => openModal('subsection', null, { pageSlug: selectedStudioPage.slug })}
                        >
                          <Plus size={13} /> Create First Section
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {subsectionsList.filter(s => s.pageSlug === selectedStudioPage.slug).map((sub, idx) => (
                          <div
                            key={sub._id || idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.85rem 1rem',
                              background: '#F9FAFB',
                              borderRadius: '8px',
                              border: '1px solid #E5E7EB',
                              gap: '0.6rem',
                              transition: 'all 120ms ease'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '0.9rem', color: sub.isVisible ? '#111827' : '#9CA3AF' }}>
                                  {sub.title}
                                </strong>
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  color: '#2563EB',
                                  background: '#EFF6FF',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '4px'
                                }}>
                                  {sub.layoutType === 'split_content' ? 'Image + Text' :
                                   sub.layoutType === 'image_banner' ? 'Full Banner' :
                                   sub.layoutType === 'card_grid' ? 'Card Grid' : 'Text Only'}
                                </span>
                              </div>
                              {sub.content && (
                                <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {sub.content}
                                </p>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                              <button
                                type="button"
                                className={`toggle-switch ${sub.isVisible ? 'on' : ''}`}
                                onClick={() => handleToggleEntity('subsections', sub._id || sub.id)}
                                title={sub.isVisible ? 'Visible (click to hide)' : 'Hidden (click to show)'}
                              >
                                <span className="toggle-switch-knob" />
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                style={{ padding: '0.35rem 0.55rem' }}
                                title="Edit section"
                                onClick={() => openModal('subsection', sub)}
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger"
                                style={{ padding: '0.35rem 0.55rem' }}
                                title="Delete section"
                                onClick={() => handleDelete('subsection', sub._id || sub.id)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card: Quick Links */}
                  <div className="admin-card" style={{ padding: '1.25rem', background: '#F8FAFC' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                      💡 Quick Tip for Non-Developers
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
                      When you click <strong>Save Page</strong>, changes are stored directly in MongoDB Atlas and immediately displayed on the public website.
                    </p>
                    <a
                      href={`#${selectedStudioPage.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontSize: '0.82rem', textDecoration: 'none' }}
                    >
                      <ExternalLink size={13} /> Open Live Page in New Tab
                    </a>
                  </div>

                </div>
              </div>
            </div>
          )}
          
          {/* ======== HERO SLIDES TAB ======== */}
          {currentTab === 'hero' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Hero Slides</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>Manage the big slideshow banner on your homepage.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => openModal('banner')}><Plus size={14} /> Add Slide</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {banners.map(b => (
                  <div key={b._id || b.id} className="page-list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      {b.imageUrl && <img src={b.imageUrl} alt="" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />}
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{b.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{b.subtitle?.substring(0, 60)}{b.subtitle?.length > 60 ? '...' : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button className={`toggle-switch ${b.isActive !== false ? 'on' : ''}`} onClick={() => handleToggleEntity('banners', b._id || b.id)}>
                        <span className="toggle-switch-knob" />
                      </button>
                      <button className="admin-btn admin-btn-secondary" onClick={() => openModal('banner', b)}><Edit size={12} /> Edit</button>
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDelete('banner', b._id || b.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {banners.length === 0 && <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>No slides yet. Click "Add Slide" to create your first banner.</p>}
              </div>
            </div>
          )}

          {/* ======== GALLERY TAB ======== */}
          {currentTab === 'gallery' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Photo Gallery</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>Upload and manage campus photos.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => openModal('gallery')}><Plus size={14} /> Add Photo</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {galleryList.map(g => (
                  <div key={g._id || g.id} className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <img src={g.imageUrl} alt={g.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ padding: '0.65rem' }}>
                      <strong style={{ fontSize: '0.83rem', display: 'block' }}>{g.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>{g.category}</span>
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }} onClick={() => openModal('gallery', g)}><Edit size={11} /></button>
                        <button className="admin-btn admin-btn-danger" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }} onClick={() => handleDelete('gallery', g._id || g.id)}><Trash2 size={11} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {galleryList.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>No photos yet.</p>}
              </div>
            </div>
          )}

          {/* ======== NOTICES TAB ======== */}
          {currentTab === 'notices' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Notices & Circulars ({notices.length})</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0.2rem 0 0' }}>Institutional circulars, examination updates, and bulletins.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => openModal('notice')}><Plus size={14} /> Add Notice</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {notices.map(n => (
                  <div key={n._id || n.id} className="page-list-item">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{n.title}</strong>
                        {n.isNewNotice && <span style={{ fontSize: '0.68rem', color: '#D97706', background: '#FEF3C7', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>★ NEW</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>{n.category} • {n.date} {n.link && <a href={n.link} target="_blank" rel="noreferrer" style={{ color: '#2563EB', marginLeft: '0.5rem' }}>[View Attachment]</a>}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button className={`toggle-switch ${n.status === 'published' ? 'on' : ''}`} onClick={() => handleToggleEntity('notices', n._id || n.id)} title={n.status === 'published' ? 'Published' : 'Draft'}>
                        <span className="toggle-switch-knob" />
                      </button>
                      <button className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('notice', n)}><Edit size={12} /></button>
                      <button className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('notice', n._id || n.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {notices.length === 0 && <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>No notices found.</p>}
              </div>
            </div>
          )}

          {/* ======== EVENTS TAB ======== */}
          {currentTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Events Calendar ({events.length})</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0.2rem 0 0' }}>Conferences, tech fests, seminars, and sports meets.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => openModal('event')}><Plus size={14} /> Add Event</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {events.map(ev => (
                  <div key={ev._id || ev.id} className="page-list-item">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{ev.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>📅 {ev.date} • 📍 {ev.venue}</div>
                      {ev.description && <p style={{ fontSize: '0.75rem', color: '#4B5563', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.description}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button className={`toggle-switch ${ev.status === 'published' ? 'on' : ''}`} onClick={() => handleToggleEntity('events', ev._id || ev.id)} title={ev.status === 'published' ? 'Published' : 'Draft'}>
                        <span className="toggle-switch-knob" />
                      </button>
                      <button className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => openModal('event', ev)}><Edit size={12} /></button>
                      <button className="admin-btn admin-btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => handleDelete('event', ev._id || ev.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>No events found.</p>}
              </div>
            </div>
          )}

          {/* ======== HEADER, FOOTER & SETTINGS TABS ======== */}
          {(currentTab === 'header' || currentTab === 'footer' || currentTab === 'settings') && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                  {currentTab === 'header' ? 'Header & Menu Settings' : currentTab === 'footer' ? 'Footer Settings' : 'Website Global Settings'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                  {currentTab === 'header' ? 'Update institutional name, top contact bar, accreditation badge, and navbar menu links.' :
                   currentTab === 'footer' ? 'Update website footer tagline, address, helpline numbers, emails, and official social media accounts.' :
                   'Update admission alerts, university affiliation, Google Maps embed, and SEO metadata.'}
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="admin-card" style={{ maxWidth: '780px', padding: '1.75rem' }}>
                {/* HEADER TAB */}
                {currentTab === 'header' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                      <label className="simple-label">College Full Name</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="Apex Institute of Engineering & Technology"
                        value={localSettings.college_name || ''}
                        onChange={e => setLocalSettings({ ...localSettings, college_name: e.target.value })}
                      />
                      <div className="simple-hint">Main branding title displayed in top header navigation bar.</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label className="simple-label">Short Name / Acronym</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="Apex Institute"
                          value={localSettings.college_short_name || ''}
                          onChange={e => setLocalSettings({ ...localSettings, college_short_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="simple-label">Established Year</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="1984"
                          value={localSettings.college_est || ''}
                          onChange={e => setLocalSettings({ ...localSettings, college_est: e.target.value })}
                        />
                      </div>
                    </div>

                    <ImageUploadField
                      label="College Crest / Emblem Logo"
                      value={localSettings.college_logo || ''}
                      onChange={url => handleLogoUploaded(url)}
                      onToast={onToast}
                      aspectRatio="square"
                      helperText="Upload official college emblem or crest from your computer (PNG or SVG recommended)"
                    />

                    <div>
                      <label className="simple-label">Top Bar Accreditation Badge Summary</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="NAAC A++ Grade (CGPA 3.65) | NBA Accredited Programs | NIRF Top 150 Band"
                        value={localSettings.accreditation_summary || ''}
                        onChange={e => setLocalSettings({ ...localSettings, accreditation_summary: e.target.value })}
                      />
                      <div className="simple-hint">Appears in the gold pill at the very top of every website page.</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label className="simple-label">Top Bar Phone</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="+91 253 251 2876"
                          value={localSettings.contact_phone_primary || ''}
                          onChange={e => setLocalSettings({ ...localSettings, contact_phone_primary: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="simple-label">Top Bar Email</label>
                        <input
                          type="email"
                          className="simple-input"
                          placeholder="principal@apex-inst.edu"
                          value={localSettings.contact_email_primary || ''}
                          onChange={e => setLocalSettings({ ...localSettings, contact_email_primary: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Navigation Menu Links Manager */}
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#111827' }}>Header Menu Links ({navItems.length})</h4>
                          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.1rem 0 0' }}>Manage links displayed in the main navbar.</p>
                        </div>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal('nav')}>
                          <Plus size={13} /> Add Menu Link
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '240px', overflowY: 'auto' }}>
                        {navItems.map(item => (
                          <div key={item._id || item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                            <div>
                              <strong style={{ fontSize: '0.85rem', color: '#111827' }}>{item.title}</strong>
                              <code style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#2563EB', background: '#EFF6FF', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>{item.path}</code>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <button
                                type="button"
                                className={`toggle-switch ${item.isActive !== false ? 'on' : ''}`}
                                style={{ transform: 'scale(0.85)' }}
                                onClick={() => handleToggleEntity('navigation', item._id || item.id)}
                                title={item.isActive !== false ? 'Active' : 'Hidden'}
                              >
                                <span className="toggle-switch-knob" />
                              </button>
                              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.2rem 0.4rem' }} onClick={() => openModal('nav', item)}><Edit size={11} /></button>
                              <button type="button" className="admin-btn admin-btn-danger" style={{ padding: '0.2rem 0.4rem' }} onClick={() => handleDelete('nav', item._id || item.id)}><Trash2 size={11} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER TAB */}
                {currentTab === 'footer' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                      <label className="simple-label">Footer Tagline & Mission Statement</label>
                      <textarea
                        rows="3"
                        className="simple-input"
                        placeholder="Autonomous Institution of Engineering & Technology, fostering critical research and ethical leadership."
                        value={localSettings.college_tagline ?? localSettings.footer_about ?? ''}
                        onChange={e => setLocalSettings({ ...localSettings, college_tagline: e.target.value, footer_about: e.target.value })}
                        style={{ resize: 'vertical', lineHeight: 1.6 }}
                      />
                      <div className="simple-hint">Displayed prominently under the college name in the website footer.</div>
                    </div>

                    <div>
                      <label className="simple-label">Campus Address</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="Hirabai Haridas Vidyanagari, Amrutdham, Panchavati, Nashik - 422003, Maharashtra, India"
                        value={localSettings.contact_address ?? localSettings.footer_address ?? ''}
                        onChange={e => setLocalSettings({ ...localSettings, contact_address: e.target.value, footer_address: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label className="simple-label">Primary Contact Phone</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="+91 253 251 2876"
                          value={localSettings.contact_phone_primary ?? localSettings.footer_phone ?? ''}
                          onChange={e => setLocalSettings({ ...localSettings, contact_phone_primary: e.target.value, footer_phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="simple-label">Admissions Helpline Phone</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="+91 253 251 2867"
                          value={localSettings.contact_phone_admissions || ''}
                          onChange={e => setLocalSettings({ ...localSettings, contact_phone_admissions: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label className="simple-label">Primary Contact Email</label>
                        <input
                          type="email"
                          className="simple-input"
                          placeholder="principal@apex-inst.edu"
                          value={localSettings.contact_email_primary ?? localSettings.footer_email ?? ''}
                          onChange={e => setLocalSettings({ ...localSettings, contact_email_primary: e.target.value, footer_email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="simple-label">Admissions Office Email</label>
                        <input
                          type="email"
                          className="simple-input"
                          placeholder="admissions@apex-inst.edu"
                          value={localSettings.contact_email_admissions || ''}
                          onChange={e => setLocalSettings({ ...localSettings, contact_email_admissions: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid #E5E7EB', paddingTop: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#111827' }}>Official Social Media Profiles</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="simple-label">LinkedIn URL</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://linkedin.com/school/..."
                            value={localSettings.social_linkedin || ''}
                            onChange={e => setLocalSettings({ ...localSettings, social_linkedin: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">Twitter / X URL</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://x.com/..."
                            value={localSettings.social_twitter || ''}
                            onChange={e => setLocalSettings({ ...localSettings, social_twitter: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">YouTube Channel</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://youtube.com/..."
                            value={localSettings.social_youtube || ''}
                            onChange={e => setLocalSettings({ ...localSettings, social_youtube: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">Instagram Profile</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://instagram.com/..."
                            value={localSettings.social_instagram || ''}
                            onChange={e => setLocalSettings({ ...localSettings, social_instagram: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SETTINGS TAB */}
                {currentTab === 'settings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                    
                    {/* 1. College Identity & Logo */}
                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#002147', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        🏛️ College Identity & Official Emblem
                      </h3>

                      <ImageUploadField
                        label="Official College Emblem / Logo Image"
                        value={localSettings.college_logo || ''}
                        onChange={url => handleLogoUploaded(url)}
                        onToast={onToast}
                        aspectRatio="square"
                        helperText="Upload official college crest/emblem from computer (PNG, SVG, or WebP). Displayed in Header & Footer globally."
                      />

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label className="simple-label">College Full Name *</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="Apex Institute of Engineering & Technology"
                          value={localSettings.college_name || ''}
                          onChange={e => setLocalSettings({ ...localSettings, college_name: e.target.value })}
                        />
                        <div className="simple-hint">Main branding title displayed across the entire website.</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <div>
                          <label className="simple-label">Short Name / Acronym</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="Apex Institute"
                            value={localSettings.college_short_name || ''}
                            onChange={e => setLocalSettings({ ...localSettings, college_short_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">Established Year</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="1984"
                            value={localSettings.college_est || ''}
                            onChange={e => setLocalSettings({ ...localSettings, college_est: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label className="simple-label">Institutional Affiliation & Approvals</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="Autonomous College affiliated to State Technological University • Approved by AICTE, New Delhi"
                          value={localSettings.affiliation || ''}
                          onChange={e => setLocalSettings({ ...localSettings, affiliation: e.target.value })}
                        />
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label className="simple-label">Top Bar Accreditation Badge Summary</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="NAAC A++ Grade (CGPA 3.65) | NBA Accredited Programs | NIRF Top 150 Band"
                          value={localSettings.accreditation_summary || ''}
                          onChange={e => setLocalSettings({ ...localSettings, accreditation_summary: e.target.value })}
                        />
                        <div className="simple-hint">Shown in the gold accreditation pill at the top of every page.</div>
                      </div>

                      <div>
                        <label className="simple-label">Official Motto / Tagline</label>
                        <textarea
                          rows="2"
                          className="simple-input"
                          placeholder="Autonomous Institution of Engineering & Technology, fostering critical research, industry innovation, and ethical leadership."
                          value={localSettings.college_tagline ?? localSettings.footer_about ?? ''}
                          onChange={e => setLocalSettings({ ...localSettings, college_tagline: e.target.value, footer_about: e.target.value })}
                        />
                        <div className="simple-hint">Displayed in the footer and institutional overview cards.</div>
                      </div>
                    </div>

                    {/* 2. Campus Contacts & Location */}
                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#002147', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        📍 Campus Location & Direct Contacts
                      </h3>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label className="simple-label">Campus Physical Address</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="Hirabai Haridas Vidyanagari, Amrutdham, Panchavati, Nashik - 422003, Maharashtra, India"
                          value={localSettings.contact_address ?? localSettings.footer_address ?? ''}
                          onChange={e => setLocalSettings({ ...localSettings, contact_address: e.target.value, footer_address: e.target.value })}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <div>
                          <label className="simple-label">Primary Contact Phone</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="+91 253 251 2876"
                            value={localSettings.contact_phone_primary ?? localSettings.contact_phone ?? localSettings.footer_phone ?? ''}
                            onChange={e => setLocalSettings({ ...localSettings, contact_phone_primary: e.target.value, contact_phone: e.target.value, footer_phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">Admissions Helpline Phone</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="+91 253 251 2867"
                            value={localSettings.contact_phone_admissions || ''}
                            onChange={e => setLocalSettings({ ...localSettings, contact_phone_admissions: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <div>
                          <label className="simple-label">Primary Official Email</label>
                          <input
                            type="email"
                            className="simple-input"
                            placeholder="principal@apex-inst.edu"
                            value={localSettings.contact_email_primary ?? localSettings.contact_email ?? localSettings.footer_email ?? ''}
                            onChange={e => setLocalSettings({ ...localSettings, contact_email_primary: e.target.value, contact_email: e.target.value, footer_email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">Admissions Office Email</label>
                          <input
                            type="email"
                            className="simple-input"
                            placeholder="admissions@apex-inst.edu"
                            value={localSettings.contact_email_admissions || ''}
                            onChange={e => setLocalSettings({ ...localSettings, contact_email_admissions: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Google Maps Embed with Live Interactive Preview */}
                      <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                        <label className="simple-label" style={{ fontWeight: 700, color: '#1E40AF' }}>
                          📍 Google Maps Embed URL (Interactive Campus Location)
                        </label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="https://maps.google.com/maps?q=Nashik,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed"
                          value={localSettings.google_maps_embed || ''}
                          onChange={e => setLocalSettings({ ...localSettings, google_maps_embed: e.target.value })}
                          style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                        />
                        <div className="simple-hint" style={{ marginTop: '0.35rem', lineHeight: 1.5 }}>
                          💡 <strong>Quick format:</strong> <code>https://maps.google.com/maps?q=YourCollegeName,City&output=embed</code> or paste an embed link from Google Maps (Share → Embed a map → copy the iframe src).
                        </div>

                        {/* Live Map Preview in Settings */}
                        <div style={{ marginTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Live Map Preview:</span>
                          <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                            <iframe
                              src={localSettings.google_maps_embed || 'https://maps.google.com/maps?q=Nashik,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed'}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen=""
                              loading="lazy"
                              title="Settings Map Preview"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Live Announcement Marquee */}
                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#002147', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        📢 Live Campus Broadcast Strip
                      </h3>
                      <label className="simple-label">Hero Admission Alert Bar (Marquee Announcement)</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="Admissions Open 2026-27 for B.Tech, M.Tech, MBA & MCA Programs. Online Applications Closing Soon."
                        value={localSettings.hero_admission_alert || ''}
                        onChange={e => setLocalSettings({ ...localSettings, hero_admission_alert: e.target.value })}
                      />
                      <div className="simple-hint">Gold alert banner displayed right below the top header on the homepage.</div>
                    </div>

                    {/* 4. Official Social Media Profiles */}
                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#002147', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        🌐 Official Social Media Profiles
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="simple-label">LinkedIn URL</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://linkedin.com/school/..."
                            value={localSettings.social_linkedin || ''}
                            onChange={e => setLocalSettings({ ...localSettings, social_linkedin: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">Twitter / X URL</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://x.com/..."
                            value={localSettings.social_twitter || ''}
                            onChange={e => setLocalSettings({ ...localSettings, social_twitter: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">YouTube Channel</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://youtube.com/..."
                            value={localSettings.social_youtube || ''}
                            onChange={e => setLocalSettings({ ...localSettings, social_youtube: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="simple-label">Instagram Profile</label>
                          <input
                            type="text"
                            className="simple-input"
                            placeholder="https://instagram.com/..."
                            value={localSettings.social_instagram || ''}
                            onChange={e => setLocalSettings({ ...localSettings, social_instagram: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 5. Search Engine Optimization (SEO) */}
                    <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#002147', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        🔍 Search Engine Optimization (SEO) & Metadata
                      </h3>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label className="simple-label">SEO Meta Title</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="Apex Institute of Engineering & Technology | Autonomous College"
                          value={localSettings.seo_meta_title || ''}
                          onChange={e => setLocalSettings({ ...localSettings, seo_meta_title: e.target.value })}
                        />
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label className="simple-label">SEO Meta Description</label>
                        <textarea
                          rows="2"
                          className="simple-input"
                          placeholder="Premier autonomous engineering institution offering world-class UG, PG, and PhD programs..."
                          value={localSettings.seo_meta_description || ''}
                          onChange={e => setLocalSettings({ ...localSettings, seo_meta_description: e.target.value })}
                          style={{ resize: 'vertical', lineHeight: 1.5 }}
                        />
                      </div>
                      <div>
                        <label className="simple-label">SEO Meta Keywords</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="Engineering college, AI, Autonomous, Admissions, Placements"
                          value={localSettings.seo_meta_keywords || ''}
                          onChange={e => setLocalSettings({ ...localSettings, seo_meta_keywords: e.target.value })}
                        />
                      </div>
                    </div>

                  </div>
                )}

                <button
                  type="submit"
                  className="admin-btn admin-btn-success"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '1.5rem', fontSize: '0.92rem', fontWeight: 700 }}
                >
                  <Save size={16} /> Save & Publish Settings Live
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ======== MODAL ======== */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleModalSubmit}>
              <div className="admin-modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  {editingItem ? 'Edit' : 'Add New'} {modalType === 'section' ? 'Section' : modalType === 'page' ? 'Page' : modalType === 'subsection' ? 'Content Section' : modalType === 'banner' ? 'Hero Slide' : modalType === 'gallery' ? 'Photo' : modalType === 'nav' ? 'Menu Item' : 'Item'}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '1.2rem' }}>✕</button>
              </div>

              <div className="admin-modal-body">
                {/* COURSE / PROGRAM FORM */}
                {modalType === 'course' && (
                  <>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Course / Program Title *</label>
                      <input type="text" className="simple-input" placeholder="e.g. B.Tech Artificial Intelligence & Data Science" value={formData.title || ''} required
                        onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Degree Level</label>
                        <select className="simple-input" value={formData.degree || 'B.Tech'} onChange={e => setFormData({ ...formData, degree: e.target.value })}>
                          <option value="B.Tech">B.Tech (Undergraduate)</option>
                          <option value="M.Tech">M.Tech (Postgraduate)</option>
                          <option value="MBA">MBA (Management)</option>
                          <option value="MCA">MCA (Computer Applications)</option>
                          <option value="Ph.D.">Ph.D. (Doctoral)</option>
                        </select>
                      </div>
                      <div>
                        <label className="simple-label">Academic Department</label>
                        <select className="simple-input" value={formData.departmentCode || ''} onChange={e => setFormData({ ...formData, departmentCode: e.target.value })}>
                          {departments.map(d => (
                            <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Duration</label>
                        <input type="text" className="simple-input" placeholder="e.g. 4 Years" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                      </div>
                      <div>
                        <label className="simple-label">Approved Intake (Seats)</label>
                        <input type="number" className="simple-input" value={formData.intake || 120} onChange={e => setFormData({ ...formData, intake: Number(e.target.value) })} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Annual Approved Tuition Fee</label>
                        <input type="text" className="simple-input" placeholder="e.g. ₹1,25,000 / Year" value={formData.annualFee || ''} onChange={e => setFormData({ ...formData, annualFee: e.target.value })} />
                      </div>
                      <div>
                        <label className="simple-label">Eligibility Criteria</label>
                        <input type="text" className="simple-input" placeholder="e.g. 10+2 PCM min 50% & MHT-CET/JEE" value={formData.eligibility || ''} onChange={e => setFormData({ ...formData, eligibility: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Career Outcomes & Placements</label>
                      <input type="text" className="simple-input" placeholder="e.g. Machine Learning Engineer, Cloud Solutions Architect, Data Scientist" value={formData.careerOpportunities || ''} onChange={e => setFormData({ ...formData, careerOpportunities: e.target.value })} />
                    </div>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Course Description & Curriculum</label>
                      <textarea rows="3" className="simple-input" placeholder="Curriculum highlights, autonomous elective tracks, industry certifications..." value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                  </>
                )}

                {/* DEPARTMENT FORM */}
                {modalType === 'department' && (
                  <>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Department Name *</label>
                      <input type="text" className="simple-input" placeholder="e.g. Department of Computer Engineering" value={formData.name || ''} required
                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Dept Code (Unique Identifier) *</label>
                        <input type="text" className="simple-input" placeholder="e.g. CSE or AIDS" value={formData.code || ''} required
                          onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                      </div>
                      <div>
                        <label className="simple-label">Degree Levels Offered</label>
                        <input type="text" className="simple-input" placeholder="e.g. B.Tech, M.Tech, Ph.D." value={formData.degreeLevels || ''}
                          onChange={e => setFormData({ ...formData, degreeLevels: e.target.value })} />
                      </div>
                    </div>

                    {/* HOD Profile Section */}
                    <div style={{ padding: '0.85rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '0.85rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#1E40AF', display: 'block', marginBottom: '0.65rem' }}>
                        👤 Head of Department (HOD) Profile
                      </strong>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.65rem' }}>
                        <div>
                          <label className="simple-label">HOD Full Name</label>
                          <input type="text" className="simple-input" placeholder="e.g. Dr. Keshav N. Nandurkar" value={formData.hodName || ''}
                            onChange={e => setFormData({ ...formData, hodName: e.target.value })} />
                        </div>
                        <div>
                          <label className="simple-label">HOD Message / Qualification</label>
                          <input type="text" className="simple-input" placeholder="e.g. Ph.D. (IIT Roorkee), Senior Member IEEE" value={formData.hodMessage || ''}
                            onChange={e => setFormData({ ...formData, hodMessage: e.target.value })} />
                        </div>
                      </div>

                      <ImageUploadField
                        label="HOD Portrait Photo"
                        value={formData.hodImage || ''}
                        onChange={url => setFormData(prev => ({ ...prev, hodImage: url }))}
                        onToast={onToast}
                        aspectRatio="square"
                        helperText="Upload HOD portrait photo from your computer (square 400x400 recommended)"
                      />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="simple-label">HOD Official Email</label>
                          <input type="email" className="simple-input" placeholder="hod.cse@apex-inst.edu" value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div>
                          <label className="simple-label">Department Phone</label>
                          <input type="text" className="simple-input" placeholder="+91 253 251 2801" value={formData.phone || ''}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    {/* Department Key Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Faculty Count</label>
                        <input type="number" className="simple-input" value={formData.facultyCount || 20}
                          onChange={e => setFormData({ ...formData, facultyCount: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="simple-label">Annual Intake (Seats)</label>
                        <input type="number" className="simple-input" value={formData.studentIntake || 180}
                          onChange={e => setFormData({ ...formData, studentIntake: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="simple-label">Specialized Labs</label>
                        <input type="number" className="simple-input" value={formData.labsCount || formData.stats?.labs || 8}
                          onChange={e => setFormData({ ...formData, labsCount: Number(e.target.value) })} />
                      </div>
                    </div>

                    {/* Department Cover Photo */}
                    <ImageUploadField
                      label="Department Cover Photo"
                      value={formData.imageUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      onToast={onToast}
                      aspectRatio="wide"
                      helperText="Upload department building, lab, or banner photo from your computer"
                    />

                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Department Overview & Research Capabilities</label>
                      <textarea rows="3" className="simple-input" placeholder="Overview of curriculum, industry centers of excellence, and specialized labs..."
                        value={formData.overview || formData.description || ''}
                        onChange={e => setFormData({ ...formData, overview: e.target.value, description: e.target.value })} />
                    </div>
                  </>
                )}

                {/* FACILITY FORM */}
                {modalType === 'facility' && (
                  <>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Facility Title *</label>
                      <input type="text" className="simple-input" placeholder="e.g. Central Library & Learning Hub" value={formData.title || ''} required
                        onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Category</label>
                      <input type="text" className="simple-input" placeholder="e.g. Academic, Sports, Hostel, Labs" value={formData.category || 'Academic'} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <ImageUploadField
                      label="Facility Photo"
                      value={formData.imageUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      onToast={onToast}
                      aspectRatio="wide"
                      helperText="Upload campus facility photo from your computer (e.g. Library, Lab, Sports Complex)"
                    />
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Description</label>
                      <textarea rows="3" className="simple-input" placeholder="Key highlights and amenities..." value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                  </>
                )}

                {/* RECRUITER FORM */}
                {modalType === 'recruiter' && (
                  <>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Company Name *</label>
                      <input type="text" className="simple-input" placeholder="e.g. Microsoft or TCS" value={formData.name || ''} required
                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Highest Package Offered</label>
                        <input type="text" className="simple-input" placeholder="e.g. ₹44 LPA" value={formData.highestPackage || ''} onChange={e => setFormData({ ...formData, highestPackage: e.target.value })} />
                      </div>
                      <div>
                        <label className="simple-label">Tier</label>
                        <select className="simple-input" value={formData.tier || 'Dream'} onChange={e => setFormData({ ...formData, tier: e.target.value })}>
                          <option value="Dream">Dream Company (₹10+ LPA)</option>
                          <option value="Super Dream">Super Dream (₹20+ LPA)</option>
                          <option value="Core">Core Engineering</option>
                          <option value="IT Services">IT & Services</option>
                        </select>
                      </div>
                    </div>
                    <ImageUploadField
                      label="Company Logo"
                      value={formData.logoUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, logoUrl: url }))}
                      onToast={onToast}
                      aspectRatio="square"
                      helperText="Upload official company logo from your computer (transparent PNG recommended)"
                    />
                  </>
                )}

                {/* ADMISSION STEP / FEE FORM */}
                {modalType === 'admission' && (
                  <>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Category</label>
                      <select className="simple-input" value={formData.category || 'Admission Process'} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        <option value="Admission Process">Admission Step (Procedure)</option>
                        <option value="Fee Structure">Approved Annual Fee Chart</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">{formData.category === 'Fee Structure' ? 'Course / Program Name *' : 'Step Title *'}</label>
                      <input type="text" className="simple-input" placeholder={formData.category === 'Fee Structure' ? 'e.g. First Year B.Tech (General)' : 'e.g. Online Registration & Document Verification'} value={formData.title || ''} required
                        onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    {formData.category === 'Fee Structure' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <div>
                          <label className="simple-label">Annual Approved Fee</label>
                          <input type="text" className="simple-input" placeholder="e.g. ₹1,25,000 / Year" value={formData.feeAnnual || ''} onChange={e => setFormData({ ...formData, feeAnnual: e.target.value })} />
                        </div>
                        <div>
                          <label className="simple-label">Eligibility Criteria / Concessions</label>
                          <input type="text" className="simple-input" placeholder="As per State FRA norms" value={formData.eligibilityCriteria || ''} onChange={e => setFormData({ ...formData, eligibilityCriteria: e.target.value })} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        <div>
                          <label className="simple-label">Step Number</label>
                          <input type="number" className="simple-input" value={formData.stepNumber || 1} onChange={e => setFormData({ ...formData, stepNumber: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="simple-label">Target Deadline</label>
                          <input type="text" className="simple-input" placeholder="e.g. July 31, 2026" value={formData.deadline || ''} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                        </div>
                      </div>
                    )}
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Description</label>
                      <textarea rows="3" className="simple-input" placeholder="Details and instructions..." value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    {formData.category !== 'Fee Structure' && (
                      <div style={{ marginBottom: '0.85rem' }}>
                        <label className="simple-label">Required Documents</label>
                        <input type="text" className="simple-input" placeholder="e.g. 10th & 12th Marksheet, Domicile, CET Scorecard" value={formData.requiredDocuments || ''} onChange={e => setFormData({ ...formData, requiredDocuments: e.target.value })} />
                      </div>
                    )}
                  </>
                )}

                {/* NOTICE FORM */}
                {modalType === 'notice' && (
                  <>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Notice Title *</label>
                      <input type="text" className="simple-input" placeholder="e.g. Autonomous End-Semester Examination Schedule" value={formData.title || ''} required
                        onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Category</label>
                        <input type="text" className="simple-input" placeholder="Academics, Examination, Admissions" value={formData.category || 'Academics'} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                      </div>
                      <div>
                        <label className="simple-label">Date</label>
                        <input type="text" className="simple-input" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Notice Details</label>
                      <textarea rows="3" className="simple-input" placeholder="Notice text or instructions..." value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <ImageUploadField
                      label="Official Circular / PDF Document Attachment"
                      value={formData.link || ''}
                      onChange={url => setFormData(prev => ({ ...prev, link: url }))}
                      onToast={onToast}
                      fileType="document"
                      accept=".pdf,.doc,.docx,image/*"
                      helperText="Upload official circular PDF or notification document from your computer"
                    />
                  </>
                )}

                {/* EVENT FORM */}
                {modalType === 'event' && (
                  <>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Event Title *</label>
                      <input type="text" className="simple-input" placeholder="e.g. Equinox 2026 Annual Cultural Fest" value={formData.title || ''} required
                        onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Event Date</label>
                        <input type="text" className="simple-input" placeholder="e.g. Oct 15-17, 2026" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                      </div>
                      <div>
                        <label className="simple-label">Venue</label>
                        <input type="text" className="simple-input" placeholder="e.g. Main Auditorium" value={formData.venue || ''} onChange={e => setFormData({ ...formData, venue: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Event Description</label>
                      <textarea rows="3" className="simple-input" placeholder="Event overview..." value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <ImageUploadField
                      label="Event Banner / Poster"
                      value={formData.imageUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      onToast={onToast}
                      aspectRatio="wide"
                      helperText="Upload event promotional poster or conference banner from your computer"
                    />
                  </>
                )}

                {/* PAGE FORM */}
                {modalType === 'page' && (
                  <>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Page Name *</label>
                      <input type="text" className="simple-input" value={formData.title || ''} required
                        onChange={e => {
                          const val = e.target.value;
                          const slug = (formData.slug && editingItem) ? formData.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                          setFormData({ ...formData, title: val, slug: editingItem?.isSystem ? formData.slug : slug, navLabel: formData.navLabel || val, heroTitle: formData.heroTitle || val });
                        }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label className="simple-label">URL Path</label>
                        <input type="text" className="simple-input" value={formData.slug || ''} disabled={editingItem?.isSystem}
                          onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })} required />
                      </div>
                      <div>
                        <label className="simple-label">Menu Label</label>
                        <input type="text" className="simple-input" value={formData.navLabel || ''} onChange={e => setFormData({ ...formData, navLabel: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Banner Headline</label>
                      <input type="text" className="simple-input" value={formData.heroTitle || ''} onChange={e => setFormData({ ...formData, heroTitle: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Banner Description</label>
                      <textarea rows="2" className="simple-input" value={formData.heroSubtitle || ''} onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Badge</label>
                      <input type="text" className="simple-input" value={formData.heroBadge || ''} onChange={e => setFormData({ ...formData, heroBadge: e.target.value })} />
                    </div>
                    <ImageUploadField
                      label="Page Header Banner Image"
                      value={formData.heroImageUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, heroImageUrl: url }))}
                      onToast={onToast}
                      aspectRatio="wide"
                      helperText="Upload banner header photo for this page from your computer"
                    />
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Page Description</label>
                      <textarea rows="3" className="simple-input" value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.83rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.showInHeader !== false} onChange={e => setFormData({ ...formData, showInHeader: e.target.checked })} /> Show in menu
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.83rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.showInFooter !== false} onChange={e => setFormData({ ...formData, showInFooter: e.target.checked })} /> Show in footer
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button type="button" className={`toggle-switch ${formData.isActive !== false ? 'on' : ''}`} onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                        <span className="toggle-switch-knob" />
                      </button>
                      <span style={{ fontSize: '0.83rem' }}>{formData.isActive !== false ? 'Page is visible' : 'Page is hidden'}</span>
                    </div>
                  </>
                )}

                {/* SUBSECTION FORM */}
                {modalType === 'subsection' && (
                  <>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Which page is this for? *</label>
                      <select className="simple-input" value={formData.pageSlug || ''} onChange={e => setFormData({ ...formData, pageSlug: e.target.value })} required>
                        {pagesList.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Section Title *</label>
                      <input type="text" className="simple-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Subtitle</label>
                      <input type="text" className="simple-input" value={formData.subtitle || ''} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label className="simple-label">Badge</label>
                        <input type="text" className="simple-input" value={formData.badge || ''} onChange={e => setFormData({ ...formData, badge: e.target.value })} />
                      </div>
                      <div>
                        <label className="simple-label">Layout Style</label>
                        <select className="simple-input" value={formData.layoutType || 'split_content'} onChange={e => setFormData({ ...formData, layoutType: e.target.value })}>
                          <option value="split_content">Image + Text (side by side)</option>
                          <option value="image_banner">Full-width Banner</option>
                          <option value="card_grid">Card Grid</option>
                          <option value="text_only">Text Only</option>
                        </select>
                      </div>
                    </div>
                    <ImageUploadField
                      label="Section Feature Image"
                      value={formData.imageUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      onToast={onToast}
                      aspectRatio="standard"
                      helperText="Upload section illustration or photograph from your computer"
                    />
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Content *</label>
                      <textarea rows="4" className="simple-input" value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label className="simple-label">Button Text</label>
                        <input type="text" className="simple-input" value={formData.ctaText || ''} onChange={e => setFormData({ ...formData, ctaText: e.target.value })} />
                      </div>
                      <div>
                        <label className="simple-label">Button Link</label>
                        <input type="text" className="simple-input" value={formData.ctaLink || ''} onChange={e => setFormData({ ...formData, ctaLink: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button type="button" className={`toggle-switch ${formData.isVisible !== false ? 'on' : ''}`} onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}>
                        <span className="toggle-switch-knob" />
                      </button>
                      <span style={{ fontSize: '0.83rem' }}>{formData.isVisible !== false ? 'Visible on website' : 'Hidden from website'}</span>
                    </div>
                  </>
                )}

                {/* BANNER FORM */}
                {modalType === 'banner' && (
                  <>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Slide Title *</label>
                      <input type="text" className="simple-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Subtitle</label>
                      <textarea rows="2" className="simple-input" value={formData.subtitle || ''} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Badge</label>
                      <input type="text" className="simple-input" value={formData.badge || ''} onChange={e => setFormData({ ...formData, badge: e.target.value })} />
                    </div>
                    <ImageUploadField
                      label="Background Image"
                      value={formData.imageUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      onToast={onToast}
                      aspectRatio="wide"
                      required
                      helperText="Upload hero background photo from your computer (1920x800 recommended)"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <div>
                        <label className="simple-label">Button Text</label>
                        <input type="text" className="simple-input" value={formData.ctaText || ''} onChange={e => setFormData({ ...formData, ctaText: e.target.value })} />
                      </div>
                      <div>
                        <label className="simple-label">Button Link</label>
                        <input type="text" className="simple-input" value={formData.ctaLink || ''} onChange={e => setFormData({ ...formData, ctaLink: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}

                {/* GALLERY FORM */}
                {modalType === 'gallery' && (
                  <>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Photo Title *</label>
                      <input type="text" className="simple-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Category</label>
                      <select className="simple-input" value={formData.category || 'Campus'} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        <option value="Campus">Campus</option>
                        <option value="Academics">Academics</option>
                        <option value="Labs">Labs</option>
                        <option value="Student Life">Student Life</option>
                        <option value="Innovations">Innovations</option>
                        <option value="Facilities">Facilities</option>
                      </select>
                    </div>
                    <ImageUploadField
                      label="Campus Photo"
                      value={formData.imageUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      onToast={onToast}
                      aspectRatio="standard"
                      required
                      helperText="Upload campus photograph from your computer"
                    />
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Caption</label>
                      <textarea rows="2" className="simple-input" value={formData.caption || ''} onChange={e => setFormData({ ...formData, caption: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button type="button" className={`toggle-switch ${formData.isActive !== false ? 'on' : ''}`} onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                        <span className="toggle-switch-knob" />
                      </button>
                      <span style={{ fontSize: '0.83rem' }}>{formData.isActive !== false ? 'Visible' : 'Hidden'}</span>
                    </div>
                  </>
                )}

                {/* NAV ITEM FORM */}
                {modalType === 'nav' && (
                  <>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Menu Item Name *</label>
                      <input type="text" className="simple-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Link (e.g. #about, #contact) *</label>
                      <input type="text" className="simple-input" value={formData.path || ''} onChange={e => setFormData({ ...formData, path: e.target.value })} required />
                    </div>
                  </>
                )}

                {/* SECTION FORM */}
                {modalType === 'section' && (
                  <>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Section Name *</label>
                      <input type="text" className="simple-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label className="simple-label">Content</label>
                      <textarea rows="3" className="simple-input" value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                    </div>
                  </>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingItem ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
