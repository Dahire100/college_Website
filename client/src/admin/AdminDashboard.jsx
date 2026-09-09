import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, User, Info, FolderGit2, Sparkles, GraduationCap,
  Briefcase, Award, Calendar, Layers, Shield, Settings, LogOut,
  CheckCircle, Plus, Trash2, Edit, ArrowUp, ArrowDown, ArrowLeft, Eye, EyeOff,
  Upload, X, Check, Save, HelpCircle, ExternalLink, Globe, Sliders,
  ChevronDown, ChevronUp, FileText, Search, Home, BookOpen, Users,
  Building2, ClipboardList, School, Microscope, Image, Newspaper, Phone, Key, Lock, Palette, Mail, Send, MessageSquare, Clock, Inbox, Bell
} from 'lucide-react';
import { api, superAdminApi } from '../services/api';
import ImageUploadField from './ImageUploadField';
import PdfUploadField from './PdfUploadField';
import { THEME_PRESETS, applyTheme } from '../styles/themes';
import SuperAdminDashboard from './SuperAdminDashboard';

export default function AdminDashboard({ onToast, onPublicUpdate, onNavigate }) {
  const [isSuperAdminAuth, setIsSuperAdminAuth] = useState(superAdminApi.isAuthenticated());
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [currentTab, setCurrentTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(api.getAdmin());

  // Tab states
  const [sectionsList, setSectionsList] = useState([]);
  const [pagesList, setPagesList] = useState([]);
  const [subsectionsList, setSubsectionsList] = useState([]);
  const [expandedPages, setExpandedPages] = useState({});
  const [expandedParentPages, setExpandedParentPages] = useState({});
  const [pageFilterMode, setPageFilterMode] = useState('all');
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [replyingInquiryId, setReplyingInquiryId] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [settingsList, setSettingsList] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDashboardSections, setShowDashboardSections] = useState(false);

  // Global Quick Search state
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);

  // Settings form local state
  const [localSettings, setLocalSettings] = useState({});

  // Admin Account & Security state (Username is permanently locked to domain)

  const [currentPasswordForPass, setCurrentPasswordForPass] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passUpdating, setPassUpdating] = useState(false);

  const [adminFullName, setAdminFullName] = useState(adminUser?.fullName || 'Chief Institutional Administrator');
  const [adminEmail, setAdminEmail] = useState(adminUser?.email || 'admin@apex-inst.edu');
  const [profileUpdating, setProfileUpdating] = useState(false);
  const dashboardStats = [
    { label: 'Pages', value: pagesList.length, note: `${pagesList.filter(p => p.isActive).length} live` },
    { label: 'Sections', value: sectionsList.filter(s => s.isVisible).length, note: `${sectionsList.length} total` },
    { label: 'Programs', value: courses.length, note: `${departments.length} academic units` },
    { label: 'Inquiries', value: inquiries.length, note: 'recent messages' }
  ];

  useEffect(() => {
    if (adminUser) {
      if (adminUser.fullName) setAdminFullName(adminUser.fullName);
      if (adminUser.email) setAdminEmail(adminUser.email);
    }
  }, [adminUser]);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K to focus search, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  
  const handleSendInquiryReply = async (inquiryId, statusOverride = 'replied') => {
    const text = (replyTextMap[inquiryId] || '').trim();
    if (!text) {
      onToast('Please enter a reply message before saving', 'error');
      return;
    }
    setSubmittingReply(true);
    try {
      const res = await api.post(`/api/v1/admin/inquiries/${inquiryId}/reply`, {
        replyMessage: text,
        status: statusOverride
      });
      if (res.success) {
        onToast('Reply saved and inquiry status updated!', 'success');
        setInquiries(prev => prev.map(i => (i._id === inquiryId || i.id === inquiryId ? (res.data || { ...i, adminReply: text, status: statusOverride, repliedBy: adminUser?.username || 'admin', repliedAt: new Date() }) : i)));
        setReplyingInquiryId(null);
      }
    } catch (err) {
      onToast(err.message || 'Failed to save reply', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const res = await api.put(`/api/v1/admin/inquiries/${inquiryId}`, { status: newStatus });
      if (res.success) {
        onToast(`Inquiry status updated to ${newStatus}`, 'success');
        setInquiries(prev => prev.map(i => (i._id === inquiryId || i.id === inquiryId ? { ...i, status: newStatus } : i)));
      }
    } catch (err) {
      onToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this student inquiry?')) return;
    try {
      const res = await api.delete(`/api/v1/admin/inquiries/${inquiryId}`);
      if (res.success) {
        onToast('Inquiry deleted successfully', 'success');
        setInquiries(prev => prev.filter(i => i._id !== inquiryId && i.id !== inquiryId));
      }
    } catch (err) {
      onToast(err.message || 'Failed to delete inquiry', 'error');
    }
  };


  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPasswordForPass) {
      onToast('Please enter your current password', 'error');
      return;
    }
    if (!newPasswordInput) {
      onToast('Please enter a new password', 'error');
      return;
    }
    if (newPasswordInput.length < 6) {
      onToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      onToast('New password and confirmation do not match', 'error');
      return;
    }
    setPassUpdating(true);
    try {
      const res = await api.put('/api/v1/auth/profile', {
        currentPassword: currentPasswordForPass,
        newPassword: newPasswordInput
      });
      if (res.success) {
        api.setAuth(res.token, res.admin);
        setAdminUser(res.admin);
        setCurrentPasswordForPass('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        onToast('Admin password successfully updated!', 'success');
      }
    } catch (err) {
      onToast(err.message || 'Failed to update password', 'error');
    } finally {
      setPassUpdating(false);
    }
  };

  const handleUpdateProfileDetails = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    try {
      const res = await api.put('/api/v1/auth/profile', {
        fullName: adminFullName,
        email: adminEmail
      });
      if (res.success) {
        api.setAuth(res.token, res.admin);
        setAdminUser(res.admin);
        onToast('Admin profile details updated!', 'success');
      }
    } catch (err) {
      onToast(err.message || 'Failed to update profile details', 'error');
    } finally {
      setProfileUpdating(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, currentTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanUser = (loginUsername || '').trim().toLowerCase();

    if (cleanUser === 'superadmin') {
      onToast('Redirecting to SuperAdmin Control Plane...', 'info');
      if (onNavigate) {
        onNavigate('superadmin');
      } else {
        window.location.pathname = '/superadmin';
      }
      return;
    }

    try {
      const res = await api.post('/api/v1/auth/login', { username: loginUsername, password: loginPassword });
      if (res.success) {
        api.setAuth(res.token, res.admin);
        setIsAuthenticated(true);
        setAdminUser(res.admin);
        onToast('Welcome to College Admin Dashboard & CMS!', 'success');
        return;
      }
    } catch (err) {
      onToast(err.message || 'Login failed', 'error');
    }
  };

  const handleLogout = () => {
    api.clearAuth();
    superAdminApi.clearAuth();
    setIsAuthenticated(false);
    setIsSuperAdminAuth(false);
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

  // Standard Institutional Subpage Quick Templates
  const STANDARD_SUBPAGE_TEMPLATES = [
    {
      title: 'Our Legacy',
      parentSlug: 'about',
      badge: 'HERITAGE',
      heroTitle: 'Our Glorious Legacy & Heritage',
      heroSubtitle: 'Imparting technical excellence, value-based education, and visionary leadership.',
      content: 'The institution was established with the noble objective of providing higher technical and professional education to students. Over decades of excellence, the institute has produced thousands of distinguished engineers, entrepreneurs, and researchers who contribute significantly to society and global industries.'
    },
    {
      title: 'Milestones',
      parentSlug: 'about',
      badge: 'MILESTONES',
      heroTitle: 'Decades of Institutional Milestones',
      heroSubtitle: 'A chronologically celebrated journey of academic autonomy, NAAC accreditations, and research milestones.',
      content: 'From the inception of the institution to achieving autonomous status and establishing international collaborative centers, explore the defining moments of our growth and achievements.'
    },
    {
      title: 'Our Leadership',
      parentSlug: 'about',
      badge: 'GOVERNANCE',
      heroTitle: 'Board of Trustees & Leadership',
      heroSubtitle: 'Distinguished governance, board of trustees, and administrative leadership guiding institutional vision.',
      content: 'Under the dynamic leadership of our Governing Body, Board of Trustees, and Academic Advisory Board, the institute continually fosters industry collaboration, state-of-the-art infrastructure, and holistic student development.'
    },
    {
      title: 'Accreditation & Recognition',
      parentSlug: 'about',
      badge: 'NAAC ACCREDITED',
      heroTitle: 'National Accreditations & Approvals',
      heroSubtitle: 'Approved by AICTE/UGC, recognized by statutory authorities, NAAC Accredited, and NBA accredited programs.',
      content: 'Quality education is our paramount ethos. The institution is recognized by statutory regulatory bodies (AICTE/UGC), affiliated to university, accredited with NAAC, and holds recognized accreditations across its core academic departments.'
    },
    {
      title: 'Academic Calendar',
      parentSlug: 'academics',
      badge: 'CALENDAR',
      heroTitle: 'Official Annual Academic Calendar',
      heroSubtitle: 'Term commencement dates, internal continuous evaluations, semester end exams, and holiday schedules.',
      content: 'View the complete academic schedule including syllabus milestones, industrial training intervals, seminar presentations, technical symposium dates, and examination cycles for all undergraduate and postgraduate engineering courses.'
    },
    {
      title: 'Fee Structure',
      parentSlug: 'admissions',
      badge: 'FRA APPROVED',
      heroTitle: 'Annual Fee Structure & Payment Guidelines',
      heroSubtitle: 'Approved by Fee Regulating Authority (FRA) Maharashtra for Open, OBC, EBC, SC/ST, and TFWS categories.',
      content: 'Comprehensive and transparent tuition fees, development charges, and hostel fees approved by the Fee Regulating Authority of Maharashtra.'
    },
    {
      title: 'Academic Facilities & IDEA Lab',
      parentSlug: 'campus',
      badge: 'INFRASTRUCTURE',
      heroTitle: 'State-of-the-Art Labs & AICTE IDEA Lab',
      heroSubtitle: 'Equipped with cutting-edge maker spaces, advanced robotics setups, IoT clusters, and high-performance computing.',
      content: 'Our campus boasts the renowned AICTE IDEA Lab, state-of-the-art departmental computing and hardware laboratories, modern seminar halls, digital libraries, and specialized prototyping centers designed to cultivate hands-on innovation.'
    }
  ];

  // Open Full-Page Studio directly to Create New Page / Subpage
  const handleStartCreateNewPage = (parentSlug = '') => {
    const newDraft = {
      isNew: true,
      title: '',
      slug: '',
      navLabel: '',
      parentSlug: parentSlug || '',
      heroTitle: '',
      heroSubtitle: '',
      heroBadge: parentSlug ? 'SUBPAGE' : 'NEW PAGE',
      heroImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
      content: '',
      pdfUrl: '',
      pdfName: '',
      showInHeader: true,
      showInFooter: true,
      isActive: true
    };
    setSelectedStudioPage(newDraft);
    setPageEditorData(newDraft);
    setCurrentTab('pages');
    setModalOpen(false);
  };

  const handleApplyTemplate = (tpl) => {
    const genSlug = tpl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setPageEditorData(prev => ({
      ...prev,
      title: tpl.title,
      slug: genSlug,
      navLabel: tpl.title,
      parentSlug: tpl.parentSlug,
      heroTitle: tpl.heroTitle,
      heroSubtitle: tpl.heroSubtitle,
      heroBadge: tpl.badge,
      content: tpl.content
    }));
    onToast(`Applied template: "${tpl.title}" (Subpage of ${tpl.parentSlug})`, 'success');
  };

  // Safe Page Deletion
  const handleDeletePage = async (page) => {
    if (!page) return;
    if (page.slug === 'home') {
      onToast('The Homepage is the primary root landing page and cannot be deleted.', 'error');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete the page "${page.title}"?\n\nThis will permanently remove the page, its menu link, and any content subsections.`);
    if (!confirmed) return;

    try {
      const id = page._id || page.id;
      const res = await api.delete(`/api/v1/admin/pages/${id}`);
      if (res.success) {
        onToast(`Page "${page.title}" deleted successfully!`, 'success');
        if (selectedStudioPage && ((selectedStudioPage._id || selectedStudioPage.id) === id || selectedStudioPage.slug === page.slug)) {
          setSelectedStudioPage(null);
          setPageEditorData(null);
        }
        await fetchAllData();
        onPublicUpdate?.();
      }
    } catch (err) {
      onToast(err.message || 'Failed to delete page', 'error');
    }
  };

  // Save Page Details (handles both updating existing pages and creating new pages)
  const handleSavePageDetails = async (e) => {
    e?.preventDefault();
    if (!pageEditorData) return;
    try {
      if (pageEditorData.isNew) {
        if (!pageEditorData.title?.trim()) {
          onToast('Please enter a Page Title', 'error');
          return;
        }
        const cleanSlug = (pageEditorData.slug || pageEditorData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
        const payload = {
          ...pageEditorData,
          slug: cleanSlug,
          parentSlug: pageEditorData.parentSlug || '',
          navLabel: pageEditorData.navLabel || pageEditorData.title,
          heroTitle: pageEditorData.heroTitle || pageEditorData.title
        };
        delete payload.isNew;
        const res = await api.post('/api/v1/admin/pages', payload);
        if (res.success) {
          onToast(`Page "${payload.title}" created and published live!`, 'success');
          await fetchAllData();
          setSelectedStudioPage(res.data);
          setPageEditorData(res.data);
          onPublicUpdate?.();
        }
      } else {
        const id = pageEditorData._id || pageEditorData.id;
        const res = await api.put(`/api/v1/admin/pages/${id}`, pageEditorData);
        if (res.success) {
          onToast(`Page "${pageEditorData.title}" details updated live!`, 'success');
          await fetchAllData();
          setSelectedStudioPage(res.data);
          setPageEditorData(res.data);
          onPublicUpdate?.();
        }
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
          pdfUrl: '',
          pdfName: '',
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
          pdfUrl: '',
          pdfName: '',
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
          path: '/',
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
  // SUPERADMIN CONTROL PLANE (If logged in as SuperAdmin)
  // ============================================
  if (isSuperAdminAuth) {
    return (
      <SuperAdminDashboard
        onToast={onToast}
        onNavigate={onNavigate}
        onLogout={() => {
          setIsSuperAdminAuth(false);
          setIsAuthenticated(false);
        }}
      />
    );
  }

  // ============================================
  // LOGIN SCREEN
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="admin-login-shell">
        <aside className="admin-login-hero">
          <div>
            <span className="eyebrow">
              <Lock size={12} /> Institutional CMS
            </span>
            <h2>Manage the whole campus site from one control room.</h2>
            <p>
              Update the website for engineering, pharmacy, school, or general college content without changing the layout.
              Keep branding, admissions, pages, and published sections in one place.
            </p>
          </div>

          <div className="admin-login-badges">
            <div className="admin-login-badge">
              <span>One profile switch</span>
              <strong>Engineering to Pharmacy</strong>
            </div>
            <div className="admin-login-badge">
              <span>Live publishing</span>
              <strong>CMS edits go live fast</strong>
            </div>
            <div className="admin-login-badge">
              <span>Institutional scope</span>
              <strong>Pages, admissions, media</strong>
            </div>
          </div>
        </aside>

        <section className="admin-login-card">
          <div className="admin-login-panel">
            <div className="login-icon">
              <GraduationCap size={28} />
            </div>
            <h2 style={{ fontSize: '1.7rem', margin: '0 0 0.35rem', fontWeight: 800 }}>College Admin Portal</h2>
            <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              Sign in with your institutional credentials to manage your college website.
            </p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="simple-label">Username</label>
                <input
                  type="text"
                  className="simple-input"
                  placeholder="Enter college domain or username"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="simple-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="simple-input"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: '2.5rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}>
                Sign In
              </button>
            </form>

            <div style={{ marginTop: '1.15rem', paddingTop: '1.15rem', borderTop: '1px solid #E5EAF1', display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('superadmin');
                  } else {
                    window.location.pathname = '/superadmin';
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00529B',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Shield size={14} /> Switch to Platform SuperAdmin Portal →
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('home');
                  } else {
                    window.location.pathname = '/';
                  }
                }}
                className="admin-btn admin-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem', fontSize: '0.85rem' }}
              >
                <ArrowLeft size={16} /> Back to Website
              </button>
            </div>
          </div>
        </section>
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



  // Global Search Index & Query Engine
  const getGlobalSearchResults = () => {
    const q = (globalSearch || '').trim().toLowerCase();
    if (!q) return [];
    const results = [];

    // 1. Navigation Sections / Tabs
    const adminTabsList = [
      { tab: 'overview', title: 'Dashboard Overview', desc: 'Summary metrics, quick actions & system status', category: 'Navigation', icon: LayoutDashboard },
      { tab: 'inquiries', title: 'Student Inquiries & Admission Leads', desc: 'View student leads, inquiries, contact messages & email replies', category: 'Navigation', icon: Mail },
      { tab: 'pages', title: 'Pages & Subpages CMS', desc: 'Custom pages, subpages hierarchy, rich content & SEO', category: 'Navigation', icon: FileText },
      { tab: 'courses', title: 'Academic Programs & Degrees', desc: 'B.Tech, M.Tech, MBA, MCA degree programs & curriculum', category: 'Navigation', icon: GraduationCap },
      { tab: 'departments', title: 'Academic Departments & Schools', desc: 'Faculty, HOD messages, labs, intake & vision/mission', category: 'Navigation', icon: Building2 },
      { tab: 'banners', title: 'Hero Carousel & Banners', desc: 'Homepage hero slides, call to action links & badges', category: 'Navigation', icon: Image },
      { tab: 'facilities', title: 'Campus Facilities & Labs', desc: 'IDEA lab, research centres, gymkhana, hostels & library', category: 'Navigation', icon: School },
      { tab: 'placements', title: 'Placements & Recruiters', desc: 'Placement statistics, highest packages & marquee recruiters', category: 'Navigation', icon: Briefcase },
      { tab: 'admissions', title: 'Admissions Roadmap', desc: 'Eligibility, fee structures, application deadlines & guidelines', category: 'Navigation', icon: ClipboardList },
      { tab: 'notices', title: 'Notices, Circulars & Announcements', desc: 'Official examination notices, circulars & announcements', category: 'Navigation', icon: Newspaper },
      { tab: 'events', title: 'Events & Academic Calendar', desc: 'Conferences, fests, hackathons & academic schedule', category: 'Navigation', icon: Calendar },
      { tab: 'gallery', title: 'Photo Gallery & Media', desc: 'Campus imagery, event highlights & media archives', category: 'Navigation', icon: Image },
      { tab: 'settings', title: 'Site Settings & Branding', desc: 'College name, logos, contact numbers, email & accreditation', category: 'Navigation', icon: Settings },
      { tab: 'theme', title: 'Theme Presets & Palette', desc: 'Colors, typography, glassmorphism & visual theme', category: 'Navigation', icon: Palette },
      { tab: 'nav', title: 'Header Navigation Menu', desc: 'Top navigation links, ordering & dropdown structures', category: 'Navigation', icon: Layers },
      { tab: 'security', title: 'Admin Account & Security', desc: 'Administrator credentials, password rotation & profile', category: 'Navigation', icon: Key }
    ];

    adminTabsList.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tab.toLowerCase().includes(q)) {
        results.push({
          type: 'tab',
          tab: t.tab,
          title: t.title,
          subtitle: t.desc,
          category: t.category,
          icon: t.icon
        });
      }
    });

    // 2. Student Inquiries
    (inquiries || []).forEach(inq => {
      const match = (inq.name || '').toLowerCase().includes(q) ||
                    (inq.email || '').toLowerCase().includes(q) ||
                    (inq.phone || '').toLowerCase().includes(q) ||
                    (inq.course || '').toLowerCase().includes(q) ||
                    (inq.message || '').toLowerCase().includes(q);
      if (match) {
        results.push({
          type: 'inquiry',
          tab: 'inquiries',
          title: inq.name || 'Anonymous Inquiry',
          subtitle: `${inq.course ? `Course: ${inq.course} • ` : ''}${inq.email || inq.phone || ''} • "${(inq.message || '').slice(0, 50)}..."`,
          category: 'Lead',
          icon: Mail,
          item: inq
        });
      }
    });

    // 3. Courses / Programs
    (courses || []).forEach(c => {
      const match = (c.title || '').toLowerCase().includes(q) ||
                    (c.degree || '').toLowerCase().includes(q) ||
                    (c.departmentCode || '').toLowerCase().includes(q) ||
                    (c.description || '').toLowerCase().includes(q);
      if (match) {
        results.push({
          type: 'course',
          tab: 'courses',
          title: c.title,
          subtitle: `${c.degree || 'Degree'} • Dept: ${c.departmentCode || 'General'} • Fee: ${c.annualFee || 'N/A'}`,
          category: 'Course',
          icon: GraduationCap,
          item: c
        });
      }
    });

    // 4. Departments
    (departments || []).forEach(d => {
      const match = (d.name || '').toLowerCase().includes(q) ||
                    (d.code || '').toLowerCase().includes(q) ||
                    (d.hodName || '').toLowerCase().includes(q) ||
                    (d.degreeLevels || '').toLowerCase().includes(q);
      if (match) {
        results.push({
          type: 'department',
          tab: 'departments',
          title: d.name,
          subtitle: `Code: ${d.code || 'N/A'}${d.hodName ? ` • HOD: ${d.hodName}` : ''}`,
          category: 'Department',
          icon: Building2,
          item: d
        });
      }
    });

    // 5. Pages & Subpages
    (pagesList || []).forEach(p => {
      const match = (p.title || '').toLowerCase().includes(q) ||
                    (p.slug || '').toLowerCase().includes(q) ||
                    (p.parentSlug || '').toLowerCase().includes(q);
      if (match) {
        results.push({
          type: 'page',
          tab: 'pages',
          title: p.title,
          subtitle: `/${p.slug}${p.parentSlug ? ` (Subpage of ${p.parentSlug})` : ''}`,
          category: 'Page',
          icon: FileText,
          item: p
        });
      }
    });

    // 6. Notices & Circulars
    (notices || []).forEach(n => {
      const match = (n.title || '').toLowerCase().includes(q) ||
                    (n.category || '').toLowerCase().includes(q) ||
                    (n.description || '').toLowerCase().includes(q);
      if (match) {
        results.push({
          type: 'notice',
          tab: 'notices',
          title: n.title,
          subtitle: `${n.category || 'Notice'} • ${n.date || 'Recent'}`,
          category: 'Notice',
          icon: Newspaper,
          item: n
        });
      }
    });

    // 7. Facilities & Labs
    (facilities || []).forEach(f => {
      const match = (f.title || '').toLowerCase().includes(q) ||
                    (f.category || '').toLowerCase().includes(q) ||
                    (f.description || '').toLowerCase().includes(q);
      if (match) {
        results.push({
          type: 'facility',
          tab: 'facilities',
          title: f.title,
          subtitle: `${f.category || 'Facility'} • ${(f.description || '').slice(0, 50)}`,
          category: 'Facility',
          icon: School,
          item: f
        });
      }
    });

    // 8. Recruiters & Placements
    (recruiters || []).forEach(r => {
      const match = (r.name || '').toLowerCase().includes(q) ||
                    (r.tier || '').toLowerCase().includes(q) ||
                    (r.highestPackage || '').toLowerCase().includes(q);
      if (match) {
        results.push({
          type: 'recruiter',
          tab: 'placements',
          title: r.name,
          subtitle: `Tier: ${r.tier || 'Standard'} • Package: ${r.highestPackage || 'Competitive'}`,
          category: 'Recruiter',
          icon: Briefcase,
          item: r
        });
      }
    });

    return results.slice(0, 10);
  };

  const handleSelectSearchResult = (res) => {
    setCurrentTab(res.tab);
    setSearchOpen(false);
    setGlobalSearch('');
    if (onToast) {
      onToast(`Switched to ${res.category}: ${res.title}`, 'info');
    }
  };

  // ============================================
  // MAIN DASHBOARD
  // ============================================
  return (
    <div className="admin-shell">
      {/* TOP BAR */}
      <header className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #00529B, #002147)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0, boxShadow: '0 14px 28px -18px rgba(0, 82, 155, 0.55)' }}>
            <GraduationCap size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.15 }}>College Website Admin</h1>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Manage website content, branding, and live publishing</p>
          </div>
        </div>

        {/* Global Instant Search Bar & Command Palette */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '440px', margin: '0 0.75rem' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#F1F5F9',
            border: searchOpen ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '0.35rem 0.75rem',
            boxShadow: searchOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
            transition: 'all 150ms ease'
          }}>
            <Search size={15} style={{ color: searchOpen ? '#2563EB' : '#64748B', flexShrink: 0, marginRight: '0.5rem' }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Quick search anything... (Ctrl+K)"
              value={globalSearch}
              onChange={e => {
                setGlobalSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.82rem',
                color: '#1E293B',
                fontFamily: "'Inter', sans-serif"
              }}
            />
            {globalSearch ? (
              <button
                type="button"
                onClick={() => {
                  setGlobalSearch('');
                  setSearchOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                padding: '0.1rem 0.35rem',
                fontSize: '0.65rem',
                color: '#64748B',
                fontWeight: 700,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}>
                Ctrl K
              </kbd>
            )}
          </div>

          {/* Live Search Results Popup */}
          {searchOpen && globalSearch.trim() && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 20px 50px rgba(0, 33, 71, 0.25)',
              zIndex: 3000,
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '0.4rem',
              animation: 'fadeIn 0.15s ease'
            }}>
              {(() => {
                const results = getGlobalSearchResults();
                if (results.length === 0) {
                  return (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                      <Search size={22} style={{ margin: '0 auto 0.5rem', opacity: 0.4, display: 'block' }} />
                      No matching records found for "<strong>{globalSearch}</strong>"
                    </div>
                  );
                }

                return results.map((res, i) => {
                  const IconComp = res.icon || FileText;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 120ms ease',
                        marginBottom: '2px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComp size={16} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {res.title}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {res.subtitle}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        background: '#F1F5F9',
                        color: '#475569',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        flexShrink: 0,
                        marginLeft: '0.5rem'
                      }}>
                        {res.category}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Topbar Notification Center */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="admin-btn"
              style={{
                background: notificationsOpen ? '#EFF6FF' : '#FFFFFF',
                border: inquiries.some(i => i.status === 'new') ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                color: '#1E293B',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}
              title="Recent Inquiries and Notifications"
            >
              <Bell size={16} style={{ color: inquiries.some(i => i.status === 'new') ? '#DC2626' : '#64748B' }} />
              <span>Inquiries</span>
              <span style={{
                background: inquiries.some(i => i.status === 'new') ? '#DC2626' : '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.12rem 0.5rem',
                borderRadius: '9999px'
              }}>
                {inquiries.filter(i => i.status === 'new').length || inquiries.length}
              </span>
            </button>

            {notificationsOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '380px',
                maxWidth: '92vw',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
                border: '1px solid #CBD5E1',
                zIndex: 2000,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{ padding: '0.85rem 1rem', background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={16} style={{ color: '#FCD34D' }} />
                    <strong style={{ fontSize: '0.92rem' }}>Student Inquiries ({inquiries.length})</strong>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                    {inquiries.filter(i => i.status === 'new').length} New
                  </span>
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {inquiries.length === 0 ? (
                    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                      No prospective student inquiries yet.
                    </div>
                  ) : (
                    inquiries.slice(0, 6).map(inq => (
                      <div
                        key={inq._id || inq.id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          setSelectedStudioPage(null);
                          setCurrentTab('inquiries');
                        }}
                        style={{
                          padding: '0.8rem 1rem',
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          background: inq.status === 'new' ? '#F0F7FF' : '#FFFFFF',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{inq.fullName || inq.name || 'Prospective Student'}</strong>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: inq.status === 'new' ? '#FEE2E2' : inq.status === 'replied' ? '#DCFCE7' : '#E0E7FF',
                            color: inq.status === 'new' ? '#B91C1C' : inq.status === 'replied' ? '#15803D' : '#3730A3'
                          }}>
                            {(inq.status || 'new').toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inq.message || 'Direct inquiry submission'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                          🎯 {inq.courseInterested || inq.programInterested || inq.subject || 'General'} • 🕒 {new Date(inq.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: '0.75rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      setSelectedStudioPage(null);
                      setCurrentTab('inquiries');
                    }}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Mail size={14} /> Open Full Inbox and Send Replies →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className={`admin-btn ${currentTab === 'account' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => { setSelectedStudioPage(null); setCurrentTab('account'); }}
            title="Change Admin Username & Password"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Shield size={13} />
            <span>{adminUser?.username || 'admin'}</span>
          </button>
          <button className="admin-btn admin-btn-secondary" onClick={handleLogout}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '0.25rem' }}>
        <div className="admin-workspace-hero">
          <section className="admin-workspace-panel">
            <span className="eyebrow" style={{ marginBottom: '0.85rem' }}>
              <Sparkles size={12} /> Live CMS Workspace
            </span>
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.55rem', fontWeight: 800 }}>CMS Control Center</h2>
            <p style={{ margin: 0, maxWidth: '720px' }}>
              Manage admissions, pages, media, navigation, and institution branding from a single premium dashboard.
              The same structure works for engineering, pharmacy, school, or a general college profile.
            </p>

            <div className="admin-workspace-grid" style={{ marginTop: '1.1rem' }}>
              {dashboardStats.map(stat => (
                <div key={stat.label} className="admin-mini-card">
                  <span className="admin-mini-value">{stat.value}</span>
                  <span className="admin-mini-label">{stat.label}</span>
                  <span className="admin-mini-note">{stat.note}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="admin-card" style={{ padding: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(0,82,155,0.12), rgba(217,119,6,0.12))', color: '#00529B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', fontWeight: 700 }}>Active Session</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{adminUser?.username || 'admin'}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Authorized CMS editor</div>
              </div>
            </div>

            {/* Live Inquiries Notification Alert */}
            <div
              onClick={() => {
                setSelectedStudioPage(null);
                setCurrentTab('inquiries');
              }}
              style={{
                background: inquiries.some(i => i.status === 'new') ? '#FEF2F2' : '#EFF6FF',
                border: '1.5px solid',
                borderColor: inquiries.some(i => i.status === 'new') ? '#FCA5A5' : '#BFDBFE',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.85rem',
                transition: 'all 0.18s ease'
              }}
              title="Click to open Inquiries Inbox and Send Replies"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <Bell size={18} style={{ color: inquiries.some(i => i.status === 'new') ? '#DC2626' : '#2563EB' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: inquiries.some(i => i.status === 'new') ? '#991B1B' : '#1E40AF' }}>
                    {inquiries.filter(i => i.status === 'new').length} New Student Inquiries
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{inquiries.length} total received • Click to reply</div>
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', background: '#FFFFFF', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #BFDBFE' }}>Reply →</span>
            </div>


            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <button className="admin-btn admin-btn-primary" onClick={handleStartCreateNewPage} style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={14} /> Create New Page
              </button>
              <button className="admin-btn admin-btn-success" onClick={() => { handleSaveSettings(); onToast('Changes saved!', 'success'); }} style={{ width: '100%', justifyContent: 'center' }}>
                <Check size={14} /> Publish Changes
              </button>
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('home');
                  } else {
                    window.location.pathname = '/';
                  }
                }}
                style={{ width: '100%', justifyContent: 'center' }}
                title="Return to public college portal"
              >
                <Globe size={13} /> View Public Site
              </button>
            </div>
          </aside>
        </div>
      </div>

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
                onClick={handleStartCreateNewPage}
                style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.15rem 0.35rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, gap: '0.2rem' }}
                title="Add New Page"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {/* Hierarchical Sidebar Page List with Nested Subpages */}
            {pagesList.filter(p => !p.parentSlug).map(p => {
              const childSubpages = pagesList.filter(s => s.parentSlug === p.slug);
              const isParentActive = currentTab === 'pages' && selectedStudioPage?.slug === p.slug;
              return (
                <div key={p.slug} style={{ marginBottom: '0.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <button
                      className={`admin-nav-item ${isParentActive ? 'active' : ''}`}
                      style={{ flex: 1, paddingRight: '2.2rem' }}
                      onClick={() => { setSelectedStudioPage(p); setPageEditorData({ ...p }); setCurrentTab('pages'); }}
                    >
                      {renderPageIcon(p.slug, 16)}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>{p.title}</span>
                      {childSubpages.length > 0 && (
                        <span style={{ fontSize: '0.65rem', background: '#EFF6FF', color: '#2563EB', padding: '0.05rem 0.35rem', borderRadius: '9999px', fontWeight: 700, marginRight: '0.35rem' }}>
                          {childSubpages.length}
                        </span>
                      )}
                      <span className={`status-dot ${p.isActive ? 'active' : 'hidden'}`} title={p.isActive ? 'Visible' : 'Hidden'} />
                    </button>
                    {/* Quick + Add Subpage under this parent */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCreateNewPage(p.slug);
                      }}
                      title={`+ Add Subpage under ${p.title}`}
                      style={{
                        position: 'absolute',
                        right: '0.3rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Render Nested Subpages in Sidebar */}
                  {childSubpages.length > 0 && (
                    <div style={{ marginLeft: '1.25rem', borderLeft: '1.5px solid #E2E8F0', paddingLeft: '0.35rem', marginTop: '0.1rem', marginBottom: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      {childSubpages.map(sub => {
                        const isSubActive = currentTab === 'pages' && selectedStudioPage?.slug === sub.slug;
                        return (
                          <button
                            key={sub.slug}
                            onClick={() => { setSelectedStudioPage(sub); setPageEditorData({ ...sub }); setCurrentTab('pages'); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              width: '100%',
                              padding: '0.3rem 0.5rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: isSubActive ? '#EFF6FF' : 'transparent',
                              color: isSubActive ? '#2563EB' : '#64748B',
                              fontWeight: isSubActive ? 700 : 500,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 120ms'
                            }}
                            onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = '#F8FAFC'; }}
                            onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span style={{ color: isSubActive ? '#2563EB' : '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>↳</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{sub.title}</span>
                            <span className={`status-dot ${sub.isActive ? 'active' : 'hidden'}`} style={{ width: '6px', height: '6px' }} title={sub.isActive ? 'Live' : 'Hidden'} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Standalone subpages without matching root */}
            {pagesList.filter(p => p.parentSlug && !pagesList.some(r => !r.parentSlug && r.slug === p.parentSlug)).map(sub => (
              <button key={sub.slug}
                className={`admin-nav-item ${currentTab === 'pages' && selectedStudioPage?.slug === sub.slug ? 'active' : ''}`}
                onClick={() => { setSelectedStudioPage(sub); setPageEditorData({ ...sub }); setCurrentTab('pages'); }}>
                <span style={{ color: '#2563EB', fontWeight: 700 }}>↳</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{sub.title}</span>
                <span className={`status-dot ${sub.isActive ? 'active' : 'hidden'}`} title={sub.isActive ? 'Visible' : 'Hidden'} />
              </button>
            ))}

            
            <div className="admin-section-label">Communication & Leads</div>

            <button className={`admin-nav-item ${currentTab === 'inquiries' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('inquiries'); }}>
              <Mail size={16} /> Inquiries & Messages
              <span style={{
                marginLeft: 'auto',
                background: inquiries.some(i => i.status === 'new') ? '#DC2626' : '#2563EB',
                color: '#FFFFFF',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {inquiries.length}
              </span>
            </button>

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

            <button className={`admin-nav-item ${currentTab === 'account' ? 'active' : ''}`}
              onClick={() => { setSelectedStudioPage(null); setCurrentTab('account'); }}>
              <Shield size={16} /> Admin Account & Security
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

              {/* Website Pages List directly on Dashboard */}
              <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                      Website Pages ({pagesList.length})
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0.2rem 0 0 0' }}>
                      All institutional pages live on your website. Click any page to edit its banner, photos, and content.
                    </p>
                  </div>
                  <button className="admin-btn admin-btn-primary" onClick={handleStartCreateNewPage} style={{ fontWeight: 600 }}>
                    <Plus size={14} /> Add New Page
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {pagesList.map(page => {
                    const pageSubs = subsectionsList.filter(s => s.pageSlug === page.slug);
                    return (
                      <div
                        key={page._id || page.slug}
                        className="page-list-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setSelectedStudioPage(page); setPageEditorData({ ...page }); setCurrentTab('pages'); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>
                            {renderPageIcon(page.slug, 18)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <strong style={{ fontSize: '0.92rem', color: '#111827' }}>{page.title}</strong>
                              {page.isSystem && (
                                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                                  CORE
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                              /{page.slug} • {pageSubs.length} section{pageSubs.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                          <span style={{ fontSize: '0.75rem', color: page.isActive ? '#059669' : '#9CA3AF', fontWeight: 600 }}>
                            {page.isActive ? '● Live' : '○ Hidden'}
                          </span>
                          <button
                            type="button"
                            className={`toggle-switch ${page.isActive ? 'on' : ''}`}
                            onClick={() => handleToggleEntity('pages', page._id || page.id)}
                            title={page.isActive ? 'Hide page' : 'Show page'}
                          >
                            <span className="toggle-switch-knob" />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                            onClick={() => { setSelectedStudioPage(page); setPageEditorData({ ...page }); setCurrentTab('pages'); }}
                          >
                            <Edit size={13} /> Edit Page
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible Homepage Sections Management */}
              <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setShowDashboardSections(!showDashboardSections)}
                >
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827' }}>
                      <Sliders size={16} style={{ color: '#2563EB' }} /> Homepage Sections Reordering & Visibility ({sectionsList.filter(s => s.isVisible).length}/{sectionsList.length})
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>Click to expand/collapse homepage section re-ordering</p>
                  </div>
                  <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '0.3rem 0.6rem' }}>
                    {showDashboardSections ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {showDashboardSections && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => openModal('section', sec)}
                            title={`Edit ${sec.title}`}
                          >
                            <Edit size={11} /> Edit
                          </button>
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
                )}
              </div>

              {/* Quick Links */}
              <div className="admin-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.75rem 0' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button className="admin-btn admin-btn-primary" onClick={handleStartCreateNewPage}><Plus size={14} /> Add New Page</button>
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
              {/* Header with Title & Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#111827' }}>
                    Website Pages & Subpages Manager
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0.2rem 0 0 0' }}>
                    Organize root pages and hierarchical dropdown subpages (modeled after K. K. Wagh Institute).
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="admin-btn admin-btn-secondary" onClick={() => handleStartCreateNewPage('about')} style={{ fontSize: '0.85rem' }}>
                    <Plus size={14} /> + Add Subpage
                  </button>
                  <button className="admin-btn admin-btn-primary" onClick={() => handleStartCreateNewPage('')} style={{ fontSize: '0.85rem' }}>
                    <Plus size={14} /> + Add Root Page
                  </button>
                </div>
              </div>

              {/* Filter Pills & Search */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPageFilterMode('all')}
                    style={{
                      background: pageFilterMode === 'all' ? '#002147' : '#FFFFFF',
                      color: pageFilterMode === 'all' ? '#FFFFFF' : '#475569',
                      border: '1px solid',
                      borderColor: pageFilterMode === 'all' ? '#002147' : '#CBD5E1',
                      borderRadius: '9999px',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: pageFilterMode === 'all' ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    All Pages ({pagesList.length})
                  </button>
                  <button
                    onClick={() => setPageFilterMode('root')}
                    style={{
                      background: pageFilterMode === 'root' ? '#002147' : '#FFFFFF',
                      color: pageFilterMode === 'root' ? '#FFFFFF' : '#475569',
                      border: '1px solid',
                      borderColor: pageFilterMode === 'root' ? '#002147' : '#CBD5E1',
                      borderRadius: '9999px',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: pageFilterMode === 'root' ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    Root Menus ({pagesList.filter(p => !p.parentSlug).length})
                  </button>
                  <button
                    onClick={() => setPageFilterMode('subpages')}
                    style={{
                      background: pageFilterMode === 'subpages' ? '#2563EB' : '#FFFFFF',
                      color: pageFilterMode === 'subpages' ? '#FFFFFF' : '#475569',
                      border: '1px solid',
                      borderColor: pageFilterMode === 'subpages' ? '#2563EB' : '#CBD5E1',
                      borderRadius: '9999px',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: pageFilterMode === 'subpages' ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    Subpages ({pagesList.filter(p => p.parentSlug).length})
                  </button>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.4rem 0.75rem', minWidth: '240px' }}>
                  <Search size={15} style={{ color: '#9CA3AF' }} />
                  <input type="text" placeholder="Search title, slug, or parent..." value={pageSearch} onChange={e => setPageSearch(e.target.value)}
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.84rem', color: '#111827', background: 'transparent' }} />
                  {pageSearch && <button onClick={() => setPageSearch('')} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}><X size={13} /></button>}
                </div>
              </div>

              {/* Subpage Quick Structure Banner */}
              <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(217,119,6,0.06))', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏛️</span>
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: '#002147' }}>Hierarchical Subpage Structure:</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '0.4rem' }}>
                      Add subpages under <strong>About Us</strong> (Legacy, Milestones, Leadership, NAAC), <strong>Academics</strong> (Calendar), or <strong>Admissions</strong> (Fees).
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                  onClick={() => handleStartCreateNewPage('about')}
                >
                  Create Subpage →
                </button>
              </div>

              {/* Hierarchical Page List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {pageFilterMode !== 'subpages' && !pageSearch ? (
                  <>
                    {pagesList.filter(p => !p.parentSlug).map(parentPage => {
                      const childSubpages = pagesList.filter(s => s.parentSlug === parentPage.slug);
                      const pageSubs = subsectionsList.filter(s => s.pageSlug === parentPage.slug);
                      const isExpanded = expandedParentPages[parentPage.slug] !== false;

                      return (
                        <div key={parentPage._id || parentPage.slug} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', background: '#FFFFFF', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                          {/* Parent Row */}
                          <div
                            className="page-list-item"
                            style={{ margin: 0, borderRadius: 0, border: 'none', background: '#FFFFFF' }}
                            onClick={() => { setSelectedStudioPage(parentPage); setPageEditorData({ ...parentPage }); }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                              {childSubpages.length > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedParentPages(prev => ({ ...prev, [parentPage.slug]: !isExpanded }));
                                  }}
                                  style={{
                                    background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
                                    padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  title={isExpanded ? 'Collapse subpages' : 'Expand subpages'}
                                >
                                  <ChevronDown size={16} style={{ transform: isExpanded ? 'none' : 'rotate(-90deg)', transition: 'transform 150ms' }} />
                                </button>
                              )}
                              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>
                                {renderPageIcon(parentPage.slug, 18)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '0.92rem', color: '#111827' }}>{parentPage.title}</strong>
                                  {parentPage.isSystem && <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>CORE</span>}
                                  {childSubpages.length > 0 && (
                                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.05rem 0.45rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, border: '1px solid #FDE68A' }}>
                                      {childSubpages.length} subpage{childSubpages.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {parentPage.pdfUrl && <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>PDF</span>}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>/{parentPage.slug} • {pageSubs.length} content section{pageSubs.length !== 1 ? 's' : ''}</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                              {/* Add Subpage Button */}
                              <button
                                type="button"
                                className="admin-btn admin-btn-secondary"
                                style={{ fontSize: '0.74rem', padding: '0.28rem 0.6rem', color: '#00529B', fontWeight: 600 }}
                                onClick={() => handleStartCreateNewPage(parentPage.slug)}
                                title={`Add new subpage under ${parentPage.title}`}
                              >
                                <Plus size={12} /> Subpage
                              </button>

                              <span style={{ fontSize: '0.75rem', color: parentPage.isActive ? '#059669' : '#9CA3AF' }}>
                                {parentPage.isActive ? '✓ Visible' : 'Hidden'}
                              </span>
                              <button className={`toggle-switch ${parentPage.isActive ? 'on' : ''}`}
                                onClick={() => handleToggleEntity('pages', parentPage._id || parentPage.id)}>
                                <span className="toggle-switch-knob" />
                              </button>
                              <button className="admin-btn admin-btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                                onClick={() => { setSelectedStudioPage(parentPage); setPageEditorData({ ...parentPage }); }}>
                                <Edit size={12} /> Edit
                              </button>
                              {parentPage.slug !== 'home' && (
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-danger"
                                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                                  onClick={() => handleDeletePage(parentPage)}
                                  title="Delete this page"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Nested Subpages */}
                          {childSubpages.length > 0 && isExpanded && (
                            <div style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9', padding: '0.4rem 0.6rem 0.6rem 2.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.2rem 0' }}>
                                Dropdown Subpages under {parentPage.title} ({childSubpages.length})
                              </div>
                              {childSubpages.map(sub => {
                                const subSections = subsectionsList.filter(s => s.pageSlug === sub.slug);
                                return (
                                  <div
                                    key={sub._id || sub.slug}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '0.5rem 0.75rem',
                                      background: '#FFFFFF',
                                      borderRadius: '8px',
                                      border: '1px solid #E2E8F0',
                                      cursor: 'pointer',
                                      transition: 'all 120ms ease'
                                    }}
                                    onClick={() => { setSelectedStudioPage(sub); setPageEditorData({ ...sub }); }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                      <span style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.9rem' }}>↳</span>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                          <strong style={{ fontSize: '0.86rem', color: '#1E293B' }}>{sub.title}</strong>
                                          <span style={{ fontSize: '0.64rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: '#EFF6FF', color: '#2563EB', fontWeight: 700 }}>
                                            SUBPAGE
                                          </span>
                                          {sub.heroBadge && (
                                            <span style={{ fontSize: '0.64rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>
                                              {sub.heroBadge}
                                            </span>
                                          )}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                                          /{sub.slug} • {subSections.length} section{subSections.length !== 1 ? 's' : ''}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }} onClick={e => e.stopPropagation()}>
                                      <span style={{ fontSize: '0.72rem', color: sub.isActive ? '#059669' : '#94A3B8' }}>
                                        {sub.isActive ? 'Live' : 'Hidden'}
                                      </span>
                                      <button
                                        className={`toggle-switch ${sub.isActive ? 'on' : ''}`}
                                        style={{ transform: 'scale(0.85)' }}
                                        onClick={() => handleToggleEntity('pages', sub._id || sub.id)}
                                      >
                                        <span className="toggle-switch-knob" />
                                      </button>
                                      <button
                                        className="admin-btn admin-btn-primary"
                                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                                        onClick={() => { setSelectedStudioPage(sub); setPageEditorData({ ...sub }); }}
                                      >
                                        <Edit size={11} /> Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="admin-btn admin-btn-danger"
                                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.45rem' }}
                                        onClick={() => handleDeletePage(sub)}
                                        title="Delete this subpage"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {pagesList.filter(p => p.parentSlug && !pagesList.some(r => !r.parentSlug && r.slug === p.parentSlug)).length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                          Other Subpages
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {pagesList.filter(p => p.parentSlug && !pagesList.some(r => !r.parentSlug && r.slug === p.parentSlug)).map(sub => (
                            <div key={sub._id || sub.slug} className="page-list-item" onClick={() => { setSelectedStudioPage(sub); setPageEditorData({ ...sub }); }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2563EB', fontWeight: 700 }}>↳</span>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{sub.title}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>/{sub.slug} • Under: /{sub.parentSlug}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                                <button className="admin-btn admin-btn-primary" style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }} onClick={() => { setSelectedStudioPage(sub); setPageEditorData({ ...sub }); }}><Edit size={11} /> Edit</button>
                                <button className="admin-btn admin-btn-danger" style={{ fontSize: '0.72rem', padding: '0.25rem 0.45rem' }} onClick={() => handleDeletePage(sub)}><Trash2 size={11} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  filteredPages.map(page => {
                    const pageSubs = subsectionsList.filter(s => s.pageSlug === page.slug);
                    return (
                      <div key={page._id || page.slug} className="page-list-item"
                        onClick={() => { setSelectedStudioPage(page); setPageEditorData({ ...page }); }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>{renderPageIcon(page.slug, 18)}</div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.92rem', color: '#111827' }}>{page.title}</strong>
                              {page.parentSlug ? (
                                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.05rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                                  SUBPAGE OF: /{page.parentSlug}
                                </span>
                              ) : (
                                <span style={{ background: '#F1F5F9', color: '#475569', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>ROOT PAGE</span>
                              )}
                              {page.isSystem && <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>CORE</span>}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>/{page.slug} • {pageSubs.length} section{pageSubs.length !== 1 ? 's' : ''}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} onClick={e => e.stopPropagation()}>
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
                          {page.slug !== 'home' && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                              onClick={() => handleDeletePage(page)}
                              title="Delete this custom page"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
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
                        {selectedStudioPage.isNew ? (pageEditorData?.title || 'Create New Page') : selectedStudioPage.title}
                      </h2>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        Page Route: <code style={{ background: '#F3F4F6', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#2563EB', fontWeight: 600 }}>/{pageEditorData?.slug || selectedStudioPage.slug || 'new-page'}</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F9FAFB', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: (pageEditorData?.isActive ?? selectedStudioPage.isActive) ? '#059669' : '#9CA3AF' }}>
                      {(pageEditorData?.isActive ?? selectedStudioPage.isActive) ? '● Live on Website' : '○ Hidden from Visitors'}
                    </span>
                    <button
                      type="button"
                      className={`toggle-switch ${(pageEditorData?.isActive ?? selectedStudioPage.isActive) ? 'on' : ''}`}
                      onClick={async () => {
                        if (selectedStudioPage.isNew) {
                          setPageEditorData(prev => ({ ...prev, isActive: !prev.isActive }));
                        } else {
                          await handleToggleEntity('pages', selectedStudioPage._id || selectedStudioPage.id);
                          setSelectedStudioPage(prev => ({ ...prev, isActive: !prev.isActive }));
                        }
                      }}
                      title="Toggle visibility"
                    >
                      <span className="toggle-switch-knob" />
                    </button>
                  </div>

                  {!selectedStudioPage.isNew && (
                    <a
                      href={`/${selectedStudioPage.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn-secondary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}
                    >
                      <ExternalLink size={14} /> Open Live Page
                    </a>
                  )}

                  {!selectedStudioPage.isNew && selectedStudioPage.slug !== 'home' && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDeletePage(selectedStudioPage)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', fontWeight: 600 }}
                    >
                      <Trash2 size={14} /> Delete Page
                    </button>
                  )}

                  <button
                    type="button"
                    className="admin-btn admin-btn-success"
                    onClick={handleSavePageDetails}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <Save size={15} /> {selectedStudioPage.isNew ? 'Publish Page Live' : 'Save Page'}
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

                  {/* Card 2: Attached Official PDF Document */}
                  <div className="admin-card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
                      <FileText size={18} style={{ color: '#DC2626' }} />
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                          Official PDF Document Attachment
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                          Upload an official syllabus, prospectus, or circular PDF for this page. Visitors will see an institutional download & preview card.
                        </p>
                      </div>
                    </div>

                    <PdfUploadField
                      label="Page Official PDF Document"
                      value={pageEditorData?.pdfUrl || ''}
                      pdfName={pageEditorData?.pdfName || ''}
                      onChange={(url, name) => setPageEditorData(prev => ({ ...prev, pdfUrl: url, pdfName: name }))}
                      onToast={onToast}
                      helperText="Upload official syllabus, prospectus, brochure, or notice PDF from computer (Max 10MB)"
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
                      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Sliders size={16} style={{ color: '#2563EB' }} /> Homepage Section Modules & Order ({sectionsList.length})
                            </h4>
                            <p style={{ fontSize: '0.76rem', color: '#6B7280', margin: '0.15rem 0 0 0' }}>
                              Click <strong>Edit</strong> on any section to customize titles, badges, taglines, CTA buttons, or use arrows to reorder.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="admin-btn admin-btn-primary"
                            style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            onClick={() => openModal('section')}
                          >
                            <Plus size={12} /> Add Module
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '440px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                          {sectionsList.map((sec, idx) => (
                            <div
                              key={sec._id || sec.id || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.65rem 0.85rem',
                                background: '#FFFFFF',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                gap: '0.75rem',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {idx + 1}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <strong style={{ fontSize: '0.88rem', color: sec.isVisible ? '#111827' : '#9CA3AF' }}>
                                      {sec.title}
                                    </strong>
                                    {sec.badge && (
                                      <span style={{ fontSize: '0.64rem', padding: '0.05rem 0.35rem', borderRadius: '4px', background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                                        {sec.badge}
                                      </span>
                                    )}
                                    <code style={{ fontSize: '0.68rem', color: '#64748B', background: '#F1F5F9', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                                      {sec.sectionKey}
                                    </code>
                                  </div>
                                  {sec.subtitle && (
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.15rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {sec.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-primary"
                                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  onClick={() => openModal('section', sec)}
                                  title={`Edit ${sec.title} module settings`}
                                >
                                  <Edit size={11} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className={`toggle-switch ${sec.isVisible ? 'on' : ''}`}
                                  style={{ transform: 'scale(0.85)' }}
                                  onClick={() => handleToggleSection(sec._id || sec.id)}
                                  title={sec.isVisible ? 'Visible (click to hide)' : 'Hidden (click to show)'}
                                >
                                  <span className="toggle-switch-knob" />
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-secondary"
                                  style={{ padding: '0.22rem 0.4rem' }}
                                  disabled={idx === 0}
                                  onClick={() => handleMoveSection(idx, 'up')}
                                  title="Move section up"
                                >
                                  <ArrowUp size={11} />
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-secondary"
                                  style={{ padding: '0.22rem 0.4rem' }}
                                  disabled={idx === sectionsList.length - 1}
                                  onClick={() => handleMoveSection(idx, 'down')}
                                  title="Move section down"
                                >
                                  <ArrowDown size={11} />
                                </button>
                                {sec.sectionKey?.startsWith('custom_') && (
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn-danger"
                                    style={{ padding: '0.22rem 0.4rem' }}
                                    onClick={() => handleDelete('section', sec._id || sec.id)}
                                    title="Delete custom module"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
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

                    {/* Subpage Parent Selector */}
                    <div style={{ marginBottom: '1.25rem', background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label className="simple-label" style={{ color: '#0369A1', fontWeight: 700, margin: 0 }}>
                          Page Hierarchy / Parent Menu (Dropdown Grouping)
                        </label>
                        {pageEditorData?.parentSlug && (
                          <span style={{ background: '#0284C7', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                            Subpage Mode
                          </span>
                        )}
                      </div>
                      <select
                        className="simple-input"
                        value={pageEditorData?.parentSlug || ''}
                        onChange={e => {
                          const pSlug = e.target.value;
                          setPageEditorData(prev => ({
                            ...prev,
                            parentSlug: pSlug,
                            heroBadge: pSlug ? (prev?.heroBadge === 'NEW PAGE' ? 'SUBPAGE' : prev?.heroBadge || 'SUBPAGE') : (prev?.heroBadge === 'SUBPAGE' ? 'NEW PAGE' : prev?.heroBadge)
                          }));
                        }}
                        style={{ background: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}
                      >
                        <option value="">● Root Page (Top-Level Navigation Item — no parent)</option>
                        <optgroup label="Institutional Main Categories">
                          <option value="about">About Us (/about)</option>
                          <option value="academics">Academics (/academics)</option>
                          <option value="admissions">Admissions (/admissions)</option>
                          <option value="departments">Departments (/departments)</option>
                          <option value="programs">Programs (/programs)</option>
                          <option value="placements">Placements (/placements)</option>
                          <option value="campus">Campus & Facilities (/campus)</option>
                          <option value="research">Research & Innovation (/research)</option>
                          <option value="life">Student Life (/life)</option>
                          <option value="news">News & Events (/news)</option>
                        </optgroup>
                        {pagesList.filter(p => !p.parentSlug && !['home', 'about', 'academics', 'admissions', 'departments', 'programs', 'placements', 'campus', 'research', 'life', 'news', selectedStudioPage?.slug].includes(p.slug)).length > 0 && (
                          <optgroup label="Other Root Pages">
                            {pagesList.filter(p => !p.parentSlug && !['home', 'about', 'academics', 'admissions', 'departments', 'programs', 'placements', 'campus', 'research', 'life', 'news', selectedStudioPage?.slug].includes(p.slug)).map(p => (
                              <option key={p.slug} value={p.slug}>{p.title} (/{p.slug})</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <div style={{ fontSize: '0.76rem', color: '#0369A1', marginTop: '0.4rem', lineHeight: 1.4 }}>
                        {pageEditorData?.parentSlug ? (
                          <span>
                            ✓ This page will be nested as a <strong>dropdown subpage</strong> under the <strong>/{pageEditorData.parentSlug}</strong> menu on the website header!
                          </span>
                        ) : (
                          <span>This is a primary top-level navigation item. Select a parent above to make it a subpage.</span>
                        )}
                      </div>
                    </div>

                    {/* KK Wagh Quick Templates (Shown for new pages or quick fill) */}
                    {selectedStudioPage.isNew && (
                      <div style={{ marginBottom: '1.25rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.85rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                          ⚡ KK Wagh Subpage Quick Templates (1-Click Fill):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {KK_WAGH_TEMPLATES.map(tpl => (
                            <button
                              key={tpl.title}
                              type="button"
                              onClick={() => handleApplyTemplate(tpl)}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #F59E0B',
                                borderRadius: '6px',
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.75rem',
                                color: '#92400E',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 120ms'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.color = '#FFFFFF'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#92400E'; }}
                            >
                              + {tpl.title} ({tpl.parentSlug})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: '1.1rem' }}>
                      <label className="simple-label">Page Title *</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="e.g. Alumni Network"
                        value={pageEditorData?.title || ''}
                        onChange={e => {
                          const val = e.target.value;
                          if (selectedStudioPage.isNew) {
                            const genSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                            setPageEditorData(prev => ({
                              ...prev,
                              title: val,
                              slug: genSlug,
                              navLabel: prev.navLabel || val,
                              heroTitle: prev.heroTitle || val
                            }));
                          } else {
                            setPageEditorData(prev => ({ ...prev, title: val }));
                          }
                        }}
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

                    {selectedStudioPage.isNew ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#F8FAFC', borderRadius: '10px', border: '1.5px dashed #CBD5E1' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                          <CheckCircle size={24} />
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.4rem 0' }}>
                          Ready to Publish New Page
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                          Enter your headline and page title on the left, then click <strong>Publish Page Live</strong>. Once published, you can add modular content subsections, cards, and images right here!
                        </p>
                        <button
                          type="button"
                          className="admin-btn admin-btn-success"
                          style={{ margin: '0 auto', padding: '0.6rem 1.25rem', fontWeight: 700 }}
                          onClick={handleSavePageDetails}
                        >
                          <Save size={15} /> Publish Page Live
                        </button>
                      </div>
                    ) : subsectionsList.filter(s => s.pageSlug === selectedStudioPage.slug).length === 0 ? (
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
                      href={`/${selectedStudioPage.slug}`}
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
                <button className="admin-btn admin-btn-primary" onClick={() => openModal('notice')}><Plus size={14} /> Add Notice / Circular</button>
              </div>

              {/* Quick Top Marquee Announcement Bar Editor */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📢</span>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>Top Header Scrolling Announcement Bar (Tier 0 Ticker)</strong>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.1rem 0 0' }}>Appears at the very top of every website page across all visitors.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                    onClick={async () => {
                      await handleSaveSettings();
                      onToast('Top announcement ticker updated & published live!', 'success');
                    }}
                  >
                    <Save size={12} /> Save Ticker
                  </button>
                </div>
                <input
                  type="text"
                  className="simple-input"
                  style={{ background: '#FFFFFF' }}
                  placeholder="e.g. 📢 Admissions Open 2026-27 | Apply Online for B.Tech, M.Tech, MBA programs | Scholarship applications closing soon!"
                  value={localSettings.announcement_text || ''}
                  onChange={e => setLocalSettings({ ...localSettings, announcement_text: e.target.value })}
                />
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                  Leave empty to hide the marquee banner completely.
                </div>
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
                      <label className="simple-label">📢 Top Announcement Marquee Bar (Scrolling Ticker)</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="e.g. 📢 Admissions Open 2026-27 | Apply Online for B.Tech, M.Tech, MBA programs | Scholarship applications closing soon!"
                        value={localSettings.announcement_text || ''}
                        onChange={e => setLocalSettings({ ...localSettings, announcement_text: e.target.value })}
                      />
                      <div className="simple-hint">
                        High-priority scrolling ticker displayed at the very top of every website page (Tier 0). Leave empty to hide.
                      </div>
                    </div>

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
                    <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <School size={20} style={{ color: '#2563EB' }} /> Institutional Profile & Domain Switcher
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
                            Switch this website between Engineering, Pharmacy, Polytechnic, MBA/Management, Law, Arts & Science, School, or an entire Multi-College Group.
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '9999px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                          Active: {(localSettings.institution_profile || localSettings.institution_type || 'college').toUpperCase()}
                        </span>
                      </div>

                      {/* Quick Profile Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                        {[
                          { id: 'engineering', name: 'Engineering Institute', icon: '⚙️', badge: 'B.Tech / M.Tech / Ph.D.', desc: 'Technical education, research, engineering departments & placement stats.' },
                          { id: 'pharmacy', name: 'Pharmacy Institute', icon: '💊', badge: 'D.Pharm / B.Pharm / M.Pharm', desc: 'PCI/AICTE compliant pharma portal with laboratories, drug research & training.' },
                          { id: 'polytechnic', name: 'Polytechnic Institute', icon: '📐', badge: 'Diploma Engg / Pharmacy', desc: 'Technical diplomas, workshops, MSBTE/State board affiliation & skill paths.' },
                          { id: 'management', name: 'Management Institute', icon: '📊', badge: 'MBA / BBA / MCA', desc: 'Business administration, corporate links, leadership & campus placements.' },
                          { id: 'law', name: 'Law College', icon: '⚖️', badge: 'BA LLB / LLB / LLM', desc: 'Bar Council compliant legal education, moot courts & judicial internships.' },
                          { id: 'arts_science', name: 'Arts, Science & Commerce', icon: '📚', badge: 'BA / BSc / BCom / MSc', desc: 'Multi-disciplinary degree college with humanities, sciences & commerce.' },
                          { id: 'group', name: 'Group of Institutions', icon: '🏛️', badge: 'Multi-College Umbrella', desc: 'Multi-campus portal bringing Engineering, Pharmacy, MBA & School together.' },
                          { id: 'school', name: 'School & Junior College', icon: '🎒', badge: 'K-12 & Junior College', desc: 'Primary, secondary, and junior college portal with parent & academic focus.' },
                          { id: 'college', name: 'Higher Education Portal', icon: '🎓', badge: 'General Academic', desc: 'Flexible multi-track higher education institutional portal.' }
                        ].map(p => {
                          const isSelected = (localSettings.institution_profile || localSettings.institution_type || 'college') === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                const next = {
                                  ...localSettings,
                                  institution_profile: p.id,
                                  institution_type: p.id
                                };
                                setLocalSettings(next);
                                onToast(`Switched profile to ${p.name}! Click "Save All Changes" to publish.`, 'info');
                              }}
                              style={{
                                border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                background: isSelected ? '#EFF6FF' : '#F8FAFC',
                                borderRadius: '10px',
                                padding: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.4rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '1.25rem' }}>{p.icon}</span>
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  padding: '0.12rem 0.4rem',
                                  borderRadius: '4px',
                                  background: isSelected ? '#2563EB' : '#E2E8F0',
                                  color: isSelected ? '#FFFFFF' : '#475569'
                                }}>
                                  {isSelected ? '✓ ACTIVE' : p.id}
                                </span>
                              </div>
                              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>{p.badge}</span>
                              <p style={{ fontSize: '0.73rem', color: '#64748B', margin: 0, lineHeight: 1.35 }}>{p.desc}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dropdown Alternative */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div>
                          <label className="simple-label" style={{ fontWeight: 600 }}>Select Active Profile (Dropdown)</label>
                          <select
                            className="simple-input"
                            value={localSettings.institution_profile || localSettings.institution_type || 'college'}
                            onChange={e => {
                              const val = e.target.value;
                              setLocalSettings({ ...localSettings, institution_profile: val, institution_type: val });
                              onToast(`Switched profile to ${val}. Click "Save All Changes" to apply.`, 'info');
                            }}
                          >
                            <option value="engineering">⚙️ Engineering Institute (B.Tech, M.Tech, Ph.D.)</option>
                            <option value="pharmacy">💊 Pharmacy Institute (D.Pharm, B.Pharm, M.Pharm)</option>
                            <option value="polytechnic">📐 Polytechnic Institute (Diploma Engineering / Pharmacy)</option>
                            <option value="management">📊 Management Institute (MBA, BBA, MCA)</option>
                            <option value="law">⚖️ Law College (BA LLB, LLB, LLM)</option>
                            <option value="arts_science">📚 Arts, Science & Commerce College (BA, BSc, BCom)</option>
                            <option value="group">🏛️ Group of Institutions (Multi-College / Campus)</option>
                            <option value="school">🎒 School & Junior College (K-12, +2 Junior College)</option>
                            <option value="college">🎓 General Higher Education Portal</option>
                          </select>
                          <div className="simple-hint" style={{ marginTop: '0.35rem' }}>
                            All public pages automatically adapt headlines, program filters, degrees, admissions labels, and navigation copy.
                          </div>
                        </div>

                        {/* Quick Name Auto-Fill Helper */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                            Auto-Configure Brand Defaults
                          </span>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ alignSelf: 'flex-start', fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                            onClick={() => {
                              const cur = localSettings.institution_profile || 'engineering';
                              const defaultsMap = {
                                engineering: {
                                  college_name: 'Apex Institute of Engineering & Technology',
                                  college_short_name: 'Apex Engineering',
                                  college_tagline: 'Premier Technical Education, Industry Placements & Applied Research',
                                  affiliation: 'Autonomous College affiliated to State Technological University • Approved by AICTE, New Delhi'
                                },
                                pharmacy: {
                                  college_name: 'Apex Institute of Pharmaceutical Sciences & Research',
                                  college_short_name: 'Apex Pharmacy',
                                  college_tagline: 'Excellence in Pharmaceutical Education, Advanced Formulation Labs & Healthcare',
                                  affiliation: 'Approved by Pharmacy Council of India (PCI) & AICTE, New Delhi • Affiliated to State Health University'
                                },
                                polytechnic: {
                                  college_name: 'Apex Polytechnic & Technical Institute',
                                  college_short_name: 'Apex Polytechnic',
                                  college_tagline: 'Hands-on Technical Diploma Education, Advanced Workshops & Industry Apprenticeships',
                                  affiliation: 'Approved by AICTE, New Delhi • Affiliated to Maharashtra State Board of Technical Education (MSBTE)'
                                },
                                management: {
                                  college_name: 'Apex Institute of Management & Computer Applications',
                                  college_short_name: 'Apex Management',
                                  college_tagline: 'Developing Future Leaders with MBA, BBA & MCA Programs and Corporate Partnerships',
                                  affiliation: 'Approved by AICTE, New Delhi • Affiliated to Savitribai Phule Pune University'
                                },
                                law: {
                                  college_name: 'Apex Law College & Judicial Research Centre',
                                  college_short_name: 'Apex Law',
                                  college_tagline: 'Comprehensive Legal Education with Active Moot Court Society & Judicial Internships',
                                  affiliation: 'Approved by Bar Council of India (BCI) • Affiliated to State University'
                                },
                                arts_science: {
                                  college_name: 'Apex College of Arts, Science & Commerce',
                                  college_short_name: 'Apex Arts & Science',
                                  college_tagline: 'Liberal Higher Education, Holistic Development & Interdisciplinary Research',
                                  affiliation: 'Recognized under Section 2(f) & 12(B) of UGC Act • Affiliated to State University'
                                },
                                group: {
                                  college_name: 'Apex Group of Institutions',
                                  college_short_name: 'Apex Group',
                                  college_tagline: 'A Multi-Disciplinary Campus: Engineering, Pharmacy, Management, Polytechnic & Schools',
                                  affiliation: 'Multi-Institutional Academic Campus • AICTE, PCI, BCI & UGC Approved Colleges'
                                },
                                school: {
                                  college_name: 'Apex Public School & Junior College',
                                  college_short_name: 'Apex School',
                                  college_tagline: 'Nurturing Academic Excellence, Values & Sports from Kindergarten to Junior College',
                                  affiliation: 'Affiliated to Central Board of Secondary Education (CBSE) / State Board'
                                },
                                college: {
                                  college_name: 'Apex Higher Education Institute',
                                  college_short_name: 'Apex Institute',
                                  college_tagline: 'Fostering Innovation, Academic Rigor and Global Perspectives',
                                  affiliation: 'Affiliated to State University • Approved by Statutory Regulatory Authorities'
                                }
                              };
                              const patch = defaultsMap[cur] || defaultsMap.engineering;
                              setLocalSettings({ ...localSettings, ...patch });
                              onToast(`Applied recommended naming and affiliation for ${cur.toUpperCase()}! Review below and click "Save All Changes".`, 'success');
                            }}
                          >
                            🪄 Auto-Fill Recommended Name & Affiliation for Selected Profile
                          </button>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                            Prefills college title, short name, and regulatory affiliations (AICTE / PCI / BCI / UGC) tailored to the profile.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 0. Website Theme & Color Customizer */}
                    <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Palette size={20} style={{ color: '#2563EB' }} /> Institutional Website Theme & Color Palette
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0.2rem 0 0 0' }}>
                            Select an official academic theme preset or customize primary and accent brand colors with instant live preview.
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#F3F4F6', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>
                          Active Preset: <strong>{THEME_PRESETS[localSettings.theme_preset || 'oxford']?.name || 'Oxford Academic'}</strong>
                        </div>
                      </div>

                      {/* Theme Presets Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                        {Object.values(THEME_PRESETS).map(preset => {
                          const isSelected = (localSettings.theme_preset || 'oxford') === preset.id;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => {
                                const nextSettings = {
                                  ...localSettings,
                                  theme_preset: preset.id,
                                  theme_primary_color: preset.primary,
                                  theme_accent_color: preset.accent
                                };
                                setLocalSettings(nextSettings);
                                applyTheme(nextSettings);
                                onToast(`Theme switched to ${preset.name}! Click "Save All Changes" to publish permanently.`, 'info');
                              }}
                              style={{
                                border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                borderRadius: '10px',
                                padding: '1rem',
                                background: isSelected ? '#EFF6FF' : '#F8FAFC',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.65rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {/* Swatch */}
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: preset.primary, border: '2px solid #FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: preset.accent, marginLeft: '-8px', border: '2px solid #FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                  </div>
                                  <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{preset.name}</strong>
                                </div>
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  background: isSelected ? '#2563EB' : '#E2E8F0',
                                  color: isSelected ? '#FFFFFF' : '#475569'
                                }}>
                                  {preset.badge}
                                </span>
                              </div>

                              <p style={{ fontSize: '0.76rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                                {preset.description}
                              </p>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: '#6B7280', paddingTop: '0.4rem', borderTop: '1px solid #E2E8F0' }}>
                                <span>Primary: <code>{preset.primary}</code></span>
                                <span>Accent: <code>{preset.accent}</code></span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Color Pickers */}
                      <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                          Custom Brand Color Overrides (Optional)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                          <div>
                            <label className="simple-label">Primary Brand Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="color"
                                value={localSettings.theme_primary_color || '#002147'}
                                onChange={e => {
                                  const next = { ...localSettings, theme_primary_color: e.target.value };
                                  setLocalSettings(next);
                                  applyTheme(next);
                                }}
                                style={{ width: '42px', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: '2px' }}
                              />
                              <input
                                type="text"
                                className="simple-input"
                                value={localSettings.theme_primary_color || '#002147'}
                                onChange={e => {
                                  const next = { ...localSettings, theme_primary_color: e.target.value };
                                  setLocalSettings(next);
                                  applyTheme(next);
                                }}
                                placeholder="#002147"
                                style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="simple-label">Accent / Highlight Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="color"
                                value={localSettings.theme_accent_color || '#C59B27'}
                                onChange={e => {
                                  const next = { ...localSettings, theme_accent_color: e.target.value };
                                  setLocalSettings(next);
                                  applyTheme(next);
                                }}
                                style={{ width: '42px', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: '2px' }}
                              />
                              <input
                                type="text"
                                className="simple-input"
                                value={localSettings.theme_accent_color || '#C59B27'}
                                onChange={e => {
                                  const next = { ...localSettings, theme_accent_color: e.target.value };
                                  setLocalSettings(next);
                                  applyTheme(next);
                                }}
                                placeholder="#C59B27"
                                style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

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

          
          {/* ======== INQUIRIES & MESSAGES TAB ======== */}
          {currentTab === 'inquiries' && (
            <div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={22} style={{ color: '#2563EB' }} /> Student Inquiries & Admission Leads
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                    Messages submitted from the website Contact page and Admissions counseling modals. Reply directly, track progress, or contact via WhatsApp/Email.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', background: '#EFF6FF', color: '#1D4ED8', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #BFDBFE', fontWeight: 700 }}>
                    Total: {inquiries.length} | New: {inquiries.filter(i => i.status === 'new').length}
                  </span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: `All (${inquiries.length})` },
                    { id: 'new', label: `New (${inquiries.filter(i => i.status === 'new').length})` },
                    { id: 'contacted', label: `Contacted (${inquiries.filter(i => i.status === 'contacted').length})` },
                    { id: 'replied', label: `Replied (${inquiries.filter(i => i.status === 'replied').length})` },
                    { id: 'resolved', label: `Resolved (${inquiries.filter(i => i.status === 'resolved' || i.status === 'closed').length})` }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setInquiryFilter(f.id)}
                      style={{
                        background: inquiryFilter === f.id ? '#2563EB' : '#F1F5F9',
                        color: inquiryFilter === f.id ? '#FFFFFF' : '#475569',
                        border: 'none',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <input
                    type="text"
                    className="simple-input"
                    placeholder="Search by student name, email, course..."
                    value={inquirySearch}
                    onChange={e => setInquirySearch(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem 0.4rem 2rem' }}
                  />
                  <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                </div>
              </div>

              {/* Inquiries Cards List */}
              {inquiries
                .filter(inq => {
                  if (inquiryFilter === 'new') return inq.status === 'new';
                  if (inquiryFilter === 'contacted') return inq.status === 'contacted';
                  if (inquiryFilter === 'replied') return inq.status === 'replied';
                  if (inquiryFilter === 'resolved') return inq.status === 'resolved' || inq.status === 'closed';
                  return true;
                })
                .filter(inq => {
                  if (!inquirySearch.trim()) return true;
                  const q = inquirySearch.toLowerCase();
                  return (
                    (inq.fullName || inq.name || '').toLowerCase().includes(q) ||
                    (inq.email || '').toLowerCase().includes(q) ||
                    (inq.phone || '').includes(q) ||
                    (inq.courseInterested || inq.programInterested || inq.subject || '').toLowerCase().includes(q) ||
                    (inq.message || '').toLowerCase().includes(q)
                  );
                })
                .length === 0 ? (
                  <div style={{ background: '#FFFFFF', padding: '3.5rem 1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <Inbox size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: '0 0 0.4rem 0' }}>No Inquiries Found</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0 auto' }}>
                      {inquiries.length === 0
                        ? 'Prospective students submitting the Contact Form or Admission Modal will appear here in real time.'
                        : 'No inquiries match the current filter or search criteria.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {inquiries
                      .filter(inq => {
                        if (inquiryFilter === 'new') return inq.status === 'new';
                        if (inquiryFilter === 'contacted') return inq.status === 'contacted';
                        if (inquiryFilter === 'replied') return inq.status === 'replied';
                        if (inquiryFilter === 'resolved') return inq.status === 'resolved' || inq.status === 'closed';
                        return true;
                      })
                      .filter(inq => {
                        if (!inquirySearch.trim()) return true;
                        const q = inquirySearch.toLowerCase();
                        return (
                          (inq.fullName || inq.name || '').toLowerCase().includes(q) ||
                          (inq.email || '').toLowerCase().includes(q) ||
                          (inq.phone || '').includes(q) ||
                          (inq.courseInterested || inq.programInterested || inq.subject || '').toLowerCase().includes(q) ||
                          (inq.message || '').toLowerCase().includes(q)
                        );
                      })
                      .map(inq => {
                        const inqId = inq._id || inq.id;
                        const isReplying = replyingInquiryId === inqId;
                        const currentText = replyTextMap[inqId] !== undefined ? replyTextMap[inqId] : (inq.adminReply || '');
                        const cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');

                        return (
                          <div
                            key={inqId}
                            style={{
                              background: '#FFFFFF',
                              borderRadius: '12px',
                              border: inq.status === 'new' ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
                              boxShadow: inq.status === 'new' ? '0 4px 12px rgba(59,130,246,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                              overflow: 'hidden'
                            }}
                          >
                            {/* Card Top Header */}
                            <div style={{ padding: '1rem 1.25rem', background: inq.status === 'new' ? '#F8FAFC' : '#FCFDFE', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>
                                  {inq.fullName || inq.name}
                                </strong>
                                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.15rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                                  🎯 {inq.courseInterested || inq.programInterested || inq.subject || 'General Inquiry'}
                                </span>
                                {inq.source && (
                                  <span style={{ fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                                    Source: {inq.source}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '9999px',
                                  background: inq.status === 'new' ? '#FEE2E2' : inq.status === 'replied' ? '#DCFCE7' : inq.status === 'contacted' ? '#DBEAFE' : '#F1F5F9',
                                  color: inq.status === 'new' ? '#DC2626' : inq.status === 'replied' ? '#16A34A' : inq.status === 'contacted' ? '#2563EB' : '#475569'
                                }}>
                                  {(inq.status || 'new').toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                  🕒 {new Date(inq.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div style={{ padding: '1.25rem' }}>
                              {/* Contact Details & Quick Links */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.84rem' }}>
                                <a
                                  href={`mailto:${inq.email}?subject=Re: Your Inquiry for ${inq.courseInterested || 'College Admissions'}&body=Dear ${inq.fullName || inq.name},\n\nThank you for reaching out to us regarding ${inq.courseInterested || 'admissions'}.\n\n`}
                                  style={{ color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                                  title="Click to compose email"
                                >
                                  <Mail size={15} /> {inq.email}
                                </a>
                                <a
                                  href={`tel:${inq.phone}`}
                                  style={{ color: '#0F172A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                                >
                                  <Phone size={15} style={{ color: '#16A34A' }} /> {inq.phone}
                                </a>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=Hello ${encodeURIComponent(inq.fullName || inq.name)}, regarding your inquiry for ${encodeURIComponent(inq.courseInterested || 'Admissions')} at our campus:`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#16A34A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, background: '#DCFCE7', padding: '0.15rem 0.55rem', borderRadius: '6px' }}
                                  >
                                    💬 Open WhatsApp Chat
                                  </a>
                                )}
                              </div>

                              {/* Student Message Box */}
                              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #2563EB', marginBottom: '1.1rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                  Student Message:
                                </div>
                                <p style={{ fontSize: '0.92rem', color: '#1E293B', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                  {inq.message || '(No message provided)'}
                                </p>
                              </div>

                              {/* Existing Admin Reply Banner */}
                              {inq.adminReply && !isReplying && (
                                <div style={{ background: '#F0FDF4', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '1rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                      ✅ Replied by {inq.repliedBy || 'Admin'} {inq.repliedAt && `on ${new Date(inq.repliedAt).toLocaleString()}`}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyTextMap(prev => ({ ...prev, [inqId]: inq.adminReply }));
                                        setReplyingInquiryId(inqId);
                                      }}
                                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                      Edit Reply
                                    </button>
                                  </div>
                                  <p style={{ fontSize: '0.88rem', color: '#14532D', margin: 0, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                                    {inq.adminReply}
                                  </p>
                                </div>
                              )}

                              {/* Inline Reply Box (When Opened) */}
                              {isReplying ? (
                                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1.5px solid #93C5FD', marginTop: '0.85rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                    <strong style={{ fontSize: '0.88rem', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      <Send size={15} /> Compose Official Response to {inq.fullName || inq.name}
                                    </strong>
                                    <button
                                      type="button"
                                      onClick={() => setReplyingInquiryId(null)}
                                      style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                      ✕ Cancel
                                    </button>
                                  </div>

                                  {/* Quick Reply Templates */}
                                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B', alignSelf: 'center', fontWeight: 600 }}>Quick Templates:</span>
                                    {[
                                      "Admissions for 2026-27 are open. Please visit our admissions cell with your academic marksheet.",
                                      "Thank you for contacting us. Our counselor will call you shortly on your registered number.",
                                      "Please find our curriculum and fee structure on the website programs section."
                                    ].map((tpl, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setReplyTextMap(prev => ({ ...prev, [inqId]: (prev[inqId] ? prev[inqId] + ' ' : '') + tpl }))}
                                        style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', color: '#334155', cursor: 'pointer' }}
                                      >
                                        + Template {idx + 1}
                                      </button>
                                    ))}
                                  </div>

                                  <textarea
                                    rows="3"
                                    className="simple-input"
                                    placeholder="Type your official counseling reply / response here..."
                                    value={currentText}
                                    onChange={e => setReplyTextMap({ ...replyTextMap, [inqId]: e.target.value })}
                                    style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
                                  />

                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <button
                                        type="button"
                                        className="admin-btn admin-btn-primary"
                                        disabled={submittingReply}
                                        onClick={() => handleSendInquiryReply(inqId, 'replied')}
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                                      >
                                        <Save size={14} /> {submittingReply ? 'Saving...' : 'Save & Mark as Replied'}
                                      </button>

                                      <a
                                        href={`mailto:${inq.email}?subject=Re: Admission Inquiry - ${inq.courseInterested || 'College Portal'}&body=${encodeURIComponent((currentText || '').trim())}`}
                                        className="admin-btn admin-btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', textDecoration: 'none' }}
                                        onClick={() => handleSendInquiryReply(inqId, 'replied')}
                                      >
                                        <Mail size={14} /> Send via Email Client
                                      </a>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Status:</span>
                                      <select
                                        className="simple-input"
                                        value={inq.status || 'new'}
                                        onChange={e => handleUpdateInquiryStatus(inqId, e.target.value)}
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: 'auto' }}
                                      >
                                        <option value="new">New</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="replied">Replied</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn-primary"
                                      onClick={() => {
                                        setReplyTextMap(prev => ({ ...prev, [inqId]: inq.adminReply || '' }));
                                        setReplyingInquiryId(inqId);
                                      }}
                                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                                    >
                                      <Send size={13} /> {inq.adminReply ? 'Edit Response' : 'Reply to Student'}
                                    </button>

                                    <select
                                      className="simple-input"
                                      value={inq.status || 'new'}
                                      onChange={e => handleUpdateInquiryStatus(inqId, e.target.value)}
                                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', width: 'auto' }}
                                      title="Update Inquiry Status"
                                    >
                                      <option value="new">Status: New</option>
                                      <option value="in_progress">Status: In Progress</option>
                                      <option value="contacted">Status: Contacted</option>
                                      <option value="replied">Status: Replied</option>
                                      <option value="resolved">Status: Resolved</option>
                                      <option value="closed">Status: Closed</option>
                                    </select>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInquiry(inqId)}
                                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', borderRadius: '4px' }}
                                    title="Delete Inquiry"
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
            </div>
          )}

          {/* ======== ADMIN ACCOUNT & SECURITY TAB ======== */}
          {currentTab === 'account' && (
            <div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={22} style={{ color: '#2563EB' }} /> Admin Account & Security
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                    Change your administrative login username, update master password, and manage institutional admin credentials.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#EFF6FF', padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid #BFDBFE', color: '#1E40AF', fontSize: '0.84rem', fontWeight: 600 }}>
                  <CheckCircle size={15} style={{ color: '#2563EB' }} />
                  <span>Active Session: <strong>{adminUser?.username || 'admin'}</strong></span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* 1. Institutional Identity & Domain Binding Card */}
                <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.85rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                      <User size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Institutional Admin Identity</h3>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Username permanently bound to your college domain</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label className="simple-label">Assigned Admin Username</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="simple-input"
                          value={adminUser?.username || 'admin'}
                          disabled
                          readOnly
                          style={{ background: '#F8FAFC', cursor: 'not-allowed', color: '#0F172A', fontWeight: 700, letterSpacing: '0.02em', border: '1px solid #CBD5E1' }}
                        />
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ECFDF5', color: '#059669', fontSize: '0.75rem', fontWeight: 700, padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #A7F3D0', whiteSpace: 'nowrap' }}>
                          🔒 Locked
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="simple-label">Authorized College Domain</label>
                      <input
                        type="text"
                        className="simple-input"
                        value={typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
                        disabled
                        readOnly
                        style={{ background: '#F8FAFC', cursor: 'not-allowed', color: '#475569', fontWeight: 600, border: '1px solid #E2E8F0' }}
                      />
                    </div>

                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1rem', lineHeight: 1 }}>🛡️</span>
                      <div style={{ fontSize: '0.78rem', color: '#1E40AF', lineHeight: 1.5 }}>
                        <strong>Domain Isolation Policy:</strong> Administrative usernames cannot be altered. For institutional security and tenant isolation, your login identifier must strictly match your authorized college domain.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Change Password Card */}
                <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.85rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Change Admin Password</h3>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Set a strong and secure new password</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="simple-label">Current Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          className="simple-input"
                          placeholder="Enter your current password"
                          value={currentPasswordForPass}
                          onChange={e => setCurrentPasswordForPass(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(prev => !prev)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#6B7280',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          title={showCurrentPass ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="simple-label">New Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          className="simple-input"
                          placeholder="Enter new password (min. 6 characters)"
                          value={newPasswordInput}
                          onChange={e => setNewPasswordInput(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(prev => !prev)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#6B7280',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          title={showNewPass ? 'Hide password' : 'Show password'}
                        >
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="simple-hint">Must be at least 6 characters.</div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label className="simple-label">Confirm New Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          className="simple-input"
                          placeholder="Re-enter new password"
                          value={confirmPasswordInput}
                          onChange={e => setConfirmPasswordInput(e.target.value)}
                          style={{ paddingRight: '2.5rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(prev => !prev)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#6B7280',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          title={showConfirmPass ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passUpdating}
                      className="admin-btn admin-btn-success"
                      style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontWeight: 600 }}
                    >
                      <Lock size={15} /> {passUpdating ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>

              </div>

              {/* 3. Administrator Profile Details Card */}
              <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.85rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Administrator Profile & Contact Information</h3>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Official administrative name and recovery/notification email</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfileDetails}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label className="simple-label">Administrator Full Name / Title</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="Chief Institutional Administrator"
                        value={adminFullName}
                        onChange={e => setAdminFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="simple-label">Administrative Official Email</label>
                      <input
                        type="email"
                        className="simple-input"
                        placeholder="admin@apex-inst.edu"
                        value={adminEmail}
                        onChange={e => setAdminEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileUpdating}
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: '0.65rem 1.4rem', fontWeight: 600 }}
                  >
                    <Save size={15} /> {profileUpdating ? 'Saving...' : 'Save Profile Information'}
                  </button>
                </form>
              </div>

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
                    <PdfUploadField
                      label="Attach Official PDF Document (Optional)"
                      value={formData.pdfUrl || ''}
                      pdfName={formData.pdfName || ''}
                      onChange={(url, name) => setFormData(prev => ({ ...prev, pdfUrl: url, pdfName: name }))}
                      onToast={onToast}
                      helperText="Attach a syllabus, prospectus, circular, or brochure PDF for this page"
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
                      aspectRatio="wide"
                      helperText="Upload feature visual for this subsection"
                    />
                    <PdfUploadField
                      label="Attach Section PDF Document (Optional)"
                      value={formData.pdfUrl || ''}
                      pdfName={formData.pdfName || ''}
                      onChange={(url, name) => setFormData(prev => ({ ...prev, pdfUrl: url, pdfName: name }))}
                      onToast={onToast}
                      helperText="Attach optional PDF document for this specific content section"
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

                {/* HOMEPAGE SECTION FORM */}
                {modalType === 'section' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Section Title / Headline *</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="e.g. Academic Programs & Degrees"
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="simple-label">Badge Pill Tag</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="e.g. NAAC A++ / ADMISSIONS 2026"
                          value={formData.badge || ''}
                          onChange={e => setFormData({ ...formData, badge: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Subtitle / Introductory Tagline</label>
                      <input
                        type="text"
                        className="simple-input"
                        placeholder="Brief summary or overarching theme of this homepage section..."
                        value={formData.subtitle || ''}
                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                      />
                    </div>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="simple-label">Section Content / Description</label>
                      <textarea
                        rows="3"
                        className="simple-input"
                        placeholder="Detailed narrative, promotional copy, or overview text..."
                        value={formData.content || ''}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        style={{ resize: 'vertical', lineHeight: 1.5 }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Call-to-Action (CTA) Button Text</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="e.g. Apply Now, View Placements, Explore"
                          value={formData.ctaText || ''}
                          onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="simple-label">CTA Link / Route</label>
                        <input
                          type="text"
                          className="simple-input"
                          placeholder="e.g. #admissions, #programs, or /contact"
                          value={formData.ctaLink || ''}
                          onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label className="simple-label">Presentation Layout</label>
                        <select
                          className="simple-input"
                          value={formData.layoutType || 'standard'}
                          onChange={e => setFormData({ ...formData, layoutType: e.target.value })}
                        >
                          <option value="standard">Standard Grid / Interactive Module</option>
                          <option value="split_content">Split Content (Showcase Image + Text)</option>
                          <option value="image_banner">Hero / Full-Width Feature Banner</option>
                          <option value="card_grid">Curated Cards Showcase</option>
                          <option value="marquee">Continuous Marquee Partner Banner</option>
                        </select>
                      </div>
                      <div>
                        <label className="simple-label">Section Key / Identifier</label>
                        <input
                          type="text"
                          className="simple-input"
                          value={formData.sectionKey || ''}
                          onChange={e => setFormData({ ...formData, sectionKey: e.target.value })}
                          disabled={editingItem && !editingItem.sectionKey?.startsWith('custom_')}
                          style={{ fontFamily: 'monospace', fontSize: '0.82rem', background: (editingItem && !editingItem.sectionKey?.startsWith('custom_')) ? '#F1F5F9' : '#FFFFFF' }}
                        />
                        <div className="simple-hint">
                          {editingItem && !editingItem.sectionKey?.startsWith('custom_') ? 'System key linking this module to homepage components' : 'Unique identifier for custom homepage section'}
                        </div>
                      </div>
                    </div>

                    <ImageUploadField
                      label="Section Showcase / Background Image"
                      value={formData.imageUrl || ''}
                      onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      onToast={onToast}
                      helperText="Optional image for split banners or background showcases (1920x800 recommended)"
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <button
                        type="button"
                        className={`toggle-switch ${formData.isVisible !== false ? 'on' : ''}`}
                        onClick={() => setFormData({ ...formData, isVisible: formData.isVisible === false ? true : false })}
                      >
                        <span className="toggle-switch-knob" />
                      </button>
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: formData.isVisible !== false ? '#059669' : '#64748B' }}>
                          {formData.isVisible !== false ? '✓ Visible on Live Homepage' : '○ Hidden from Live Homepage'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          Toggle whether visitors see this section module on the live homepage.
                        </div>
                      </div>
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
