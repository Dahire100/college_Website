/**
 * SINGLE ADMIN CMS CONTROLLER
 * Full administrative control over all website content, settings, and media.
 */

const AdminApp = {
  currentTab: 'overview',
  analyticsData: null,

  async render(container) {
    if (!API.isAuthenticated()) {
      this.renderLogin(container);
      return;
    }

    container.innerHTML = `
      <div class="admin-layout">
        <!-- Sidebar Navigation -->
        <aside class="admin-sidebar">
          <div class="admin-sidebar-header">
            <div class="admin-logo-icon">A</div>
            <div>
              <h2>Apex Admin CMS</h2>
              <span>Institutional Management</span>
            </div>
          </div>

          <ul class="admin-nav-menu">
            <li class="admin-nav-category">Core Overview</li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'overview' ? 'active' : ''}" onclick="AdminApp.switchTab('overview')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Dashboard Overview</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'inquiries' ? 'active' : ''}" onclick="AdminApp.switchTab('inquiries')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Inquiries Inbox</span>
              </a>
            </li>

            <li class="admin-nav-category">Homepage & Branding</li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'settings' ? 'active' : ''}" onclick="AdminApp.switchTab('settings')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Website Settings & SEO</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'banners' ? 'active' : ''}" onclick="AdminApp.switchTab('banners')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <span>Hero Banners</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'sections' ? 'active' : ''}" onclick="AdminApp.switchTab('sections')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                <span>Homepage Sections</span>
              </a>
            </li>

            <li class="admin-nav-category">Academic Content</li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'notices' ? 'active' : ''}" onclick="AdminApp.switchTab('notices')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>Notices & Circulars</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'events' ? 'active' : ''}" onclick="AdminApp.switchTab('events')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Upcoming Events</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'news' ? 'active' : ''}" onclick="AdminApp.switchTab('news')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                <span>News & Articles</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'departments' ? 'active' : ''}" onclick="AdminApp.switchTab('departments')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>Departments</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'courses' ? 'active' : ''}" onclick="AdminApp.switchTab('courses')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                <span>Courses & Syllabi</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'faculty' ? 'active' : ''}" onclick="AdminApp.switchTab('faculty')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Faculty Directory</span>
              </a>
            </li>

            <li class="admin-nav-category">Institutional Operations</li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'admissions' ? 'active' : ''}" onclick="AdminApp.switchTab('admissions')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                <span>Admissions & Fees</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'placements' ? 'active' : ''}" onclick="AdminApp.switchTab('placements')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <span>Placements & Packages</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'recruiters' ? 'active' : ''}" onclick="AdminApp.switchTab('recruiters')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span>Recruiter Logos</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'facilities' ? 'active' : ''}" onclick="AdminApp.switchTab('facilities')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                <span>Campus Facilities</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'testimonials' ? 'active' : ''}" onclick="AdminApp.switchTab('testimonials')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Testimonials & Stories</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'media' ? 'active' : ''}" onclick="AdminApp.switchTab('media')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Media Library & Uploads</span>
              </a>
            </li>
            <li class="admin-nav-item">
              <a class="admin-nav-link ${this.currentTab === 'audit' ? 'active' : ''}" onclick="AdminApp.switchTab('audit')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Security Audit Logs</span>
              </a>
            </li>
          </ul>

          <div class="admin-sidebar-footer">
            <div class="admin-user-pill">
              <div class="admin-avatar">A</div>
              <div class="admin-meta">
                <p>${API.getAdmin()?.fullName || 'Chief Administrator'}</p>
                <span>Unified Single Admin</span>
              </div>
              <button class="btn-logout" onclick="AdminApp.logout()" title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="admin-main">
          <header class="admin-topbar">
            <div class="admin-topbar-title">
              <h1 id="admin-page-title">${this.getTabTitle(this.currentTab)}</h1>
              <span>Manage live website content with zero code modification</span>
            </div>
            <div class="admin-topbar-actions">
              <a href="#home" class="btn btn-secondary btn-sm" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                View Live Portal
              </a>
            </div>
          </header>

          <div class="admin-body" id="admin-tab-mount">
            <div style="text-align: center; padding: 3rem;"><div class="pulse-dot"></div> Loading module...</div>
          </div>
        </main>
      </div>
    `;

    this.loadCurrentTab();
  },

  getTabTitle(tab) {
    const titles = {
      overview: 'System Overview & Analytics',
      inquiries: 'Student Inquiries Inbox',
      settings: 'Site Identity & SEO Configuration',
      banners: 'Hero Carousel Manager',
      sections: 'Homepage Layout & Ordering',
      notices: 'Notices & Circulars',
      events: 'Conferences & Campus Events',
      news: 'News Articles & Achievements',
      departments: 'Academic Departments',
      courses: 'Degree Programs & Syllabi',
      faculty: 'Faculty Directory',
      admissions: 'Admissions & Fee Charts',
      placements: 'Placement Records & Packages',
      recruiters: 'Corporate Recruiters & Logos',
      facilities: 'Campus Infrastructure & Labs',
      testimonials: 'Testimonials & Alumni Stories',
      media: 'Media Library & Files',
      audit: 'Administrative Audit Trail'
    };
    return titles[tab] || 'Management';
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('admin-page-title').textContent = this.getTabTitle(tab);
    this.loadCurrentTab();
  },

  async loadCurrentTab() {
    const mount = document.getElementById('admin-tab-mount');
    if (!mount) return;

    switch (this.currentTab) {
      case 'overview':
        await this.renderOverviewTab(mount);
        break;
      case 'inquiries':
        await this.renderInquiriesTab(mount);
        break;
      case 'settings':
        await this.renderSettingsTab(mount);
        break;
      case 'banners':
        await this.renderBannersTab(mount);
        break;
      case 'sections':
        await this.renderSectionsTab(mount);
        break;
      case 'notices':
        await this.renderNoticesTab(mount);
        break;
      case 'events':
        await this.renderEventsTab(mount);
        break;
      case 'news':
        await this.renderNewsTab(mount);
        break;
      case 'departments':
        await this.renderDepartmentsTab(mount);
        break;
      case 'courses':
        await this.renderCoursesTab(mount);
        break;
      case 'faculty':
        await this.renderFacultyTab(mount);
        break;
      case 'admissions':
        await this.renderAdmissionsTab(mount);
        break;
      case 'placements':
        await this.renderPlacementsTab(mount);
        break;
      case 'recruiters':
        await this.renderRecruitersTab(mount);
        break;
      case 'facilities':
        await this.renderFacilitiesTab(mount);
        break;
      case 'testimonials':
        await this.renderTestimonialsTab(mount);
        break;
      case 'media':
        await this.renderMediaTab(mount);
        break;
      case 'audit':
        await this.renderAuditTab(mount);
        break;
    }
  },

  // ----------------------------------------------------
  // TAB 1: OVERVIEW & ANALYTICS
  // ----------------------------------------------------
  async renderOverviewTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading analytics...</div>`;

    try {
      const res = await API.get('/api/v1/admin/analytics');
      const data = res.data;
      const stats = data.stats;

      mount.innerHTML = `
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <div class="stat-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path></svg>
            </div>
            <div class="stat-info">
              <h3>${stats.newInquiries} / ${stats.totalInquiries}</h3>
              <p>New / Total Inquiries</p>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="stat-icon-wrap gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
            </div>
            <div class="stat-info">
              <h3>${stats.publishedNotices}</h3>
              <p>Active Circulars (${stats.draftNotices} drafts)</p>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="stat-icon-wrap green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path></svg>
            </div>
            <div class="stat-info">
              <h3>${stats.totalCourses}</h3>
              <p>Courses in ${stats.totalDepartments} Departments</p>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="stat-icon-wrap red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect></svg>
            </div>
            <div class="stat-info">
              <h3>${stats.totalRecruiters}</h3>
              <p>Recruiters (${stats.totalFaculty} Faculty)</p>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Recent Inquiries -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">Recent Student Inquiries</span>
              <button class="btn btn-secondary btn-sm" onclick="AdminApp.switchTab('inquiries')">View All</button>
            </div>
            <div class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${(data.recentInquiries || []).map(inq => `
                    <tr>
                      <td>
                        <strong>${inq.fullName}</strong><br>
                        <span style="font-size: 0.75rem; color: #64748B;">${inq.phone}</span>
                      </td>
                      <td>${inq.courseInterested || 'General Inquiry'}</td>
                      <td>
                        <span class="badge ${inq.status === 'new' ? 'badge-danger' : inq.status === 'contacted' ? 'badge-warning' : 'badge-success'}">
                          ${inq.status}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quick Actions & System Status -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">Quick Content Shortcuts</span>
            </div>
            <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <button class="btn btn-primary" onclick="AdminApp.openCreateNoticeModal()">
                + Publish New Notice / Circular
              </button>
              <button class="btn btn-secondary" onclick="AdminApp.openCreateEventModal()">
                + Schedule Upcoming Event
              </button>
              <button class="btn btn-secondary" onclick="AdminApp.openCreateBannerModal()">
                + Add Hero Banner Slide
              </button>
              <button class="btn btn-secondary" onclick="AdminApp.switchTab('settings')">
                ⚙️ Update College Contact & Tagline
              </button>

              <div style="background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md); margin-top: 1rem; font-size: 0.8125rem;">
                <strong>Database Sync:</strong> MongoDB Atlas / Local Fallback Store is ACTIVE.<br>
                All edits take effect on the public portal immediately upon saving.
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<p>Failed to load overview.</p>`;
    }
  },

  // ----------------------------------------------------
  // TAB 2: INQUIRIES INBOX
  // ----------------------------------------------------
  async renderInquiriesTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading inquiries...</div>`;

    try {
      const res = await API.get('/api/v1/admin/inquiries');
      const inquiries = res.data || [];

      mount.innerHTML = `
        <div class="admin-card">
          <div class="admin-card-header">
            <span class="admin-card-title">Student Admission Inquiries (${inquiries.length})</span>
          </div>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Course Interest</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${inquiries.length ? inquiries.map(inq => `
                  <tr>
                    <td>
                      <strong>${inq.fullName}</strong><br>
                      <span style="font-size: 0.75rem; color: #64748B;">✉️ ${inq.email}</span><br>
                      <span style="font-size: 0.75rem; color: #64748B;">📞 ${inq.phone}</span>
                    </td>
                    <td>${inq.courseInterested || 'General'}</td>
                    <td style="max-width: 280px; font-size: 0.8125rem;">${inq.message}</td>
                    <td>
                      <select class="form-control" style="font-size: 0.75rem; padding: 0.35rem;" onchange="AdminApp.updateInquiryStatus('${inq._id || inq.id}', this.value)">
                        <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${inq.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="resolved" ${inq.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon danger" onclick="AdminApp.deleteInquiry('${inq._id || inq.id}')" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `).join('') : `<tr><td colspan="5" style="text-align: center; padding: 2rem;">No inquiries recorded yet.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<p>Failed to load inquiries.</p>`;
    }
  },

  async updateInquiryStatus(id, status) {
    try {
      await API.put(`/api/v1/admin/inquiries/${id}`, { status });
      showToast(`Inquiry marked as ${status}`);
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  },

  async deleteInquiry(id) {
    if (!confirm('Are you sure you want to delete this inquiry record?')) return;
    try {
      await API.delete(`/api/v1/admin/inquiries/${id}`);
      showToast('Inquiry deleted');
      this.loadCurrentTab();
    } catch (e) {
      showToast('Failed to delete inquiry', 'error');
    }
  },

  // ----------------------------------------------------
  // TAB 3: SITE SETTINGS & SEO
  // ----------------------------------------------------
  async renderSettingsTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading settings...</div>`;

    try {
      const res = await API.get('/api/v1/admin/settings');
      const settingsList = res.data || [];
      const sMap = {};
      settingsList.forEach(s => sMap[s.key] = s.value);

      mount.innerHTML = `
        <form onsubmit="AdminApp.saveSettings(event)">
          <div class="settings-section-card">
            <h3 class="settings-section-title">Institutional Brand & Names</h3>
            <p class="settings-section-desc">Controls the header logo text, diplomas, and official references.</p>

            <div class="form-group">
              <label class="form-label">College / University Name</label>
              <input type="text" name="college_name" class="form-control" value="${sMap.college_name || ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Institutional Tagline</label>
              <input type="text" name="college_tagline" class="form-control" value="${sMap.college_tagline || ''}" required>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Short Name / Abbreviation</label>
                <input type="text" name="college_short_name" class="form-control" value="${sMap.college_short_name || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Year Established</label>
                <input type="text" name="college_est" class="form-control" value="${sMap.college_est || ''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Accreditation Summary Bar</label>
              <input type="text" name="accreditation_summary" class="form-control" value="${sMap.accreditation_summary || ''}">
            </div>
          </div>

          <div class="settings-section-card">
            <h3 class="settings-section-title">Campus Contact Details</h3>
            <p class="settings-section-desc">Displayed in the header top-bar, contact page, and footer.</p>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">General Contact Phone</label>
                <input type="text" name="contact_phone_primary" class="form-control" value="${sMap.contact_phone_primary || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Admissions Helpline</label>
                <input type="text" name="contact_phone_admissions" class="form-control" value="${sMap.contact_phone_admissions || ''}">
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Primary Email</label>
                <input type="email" name="contact_email_primary" class="form-control" value="${sMap.contact_email_primary || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Admissions Email</label>
                <input type="email" name="contact_email_admissions" class="form-control" value="${sMap.contact_email_admissions || ''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Physical Campus Address</label>
              <textarea name="contact_address" class="form-control" rows="2">${sMap.contact_address || ''}</textarea>
            </div>
          </div>

          <div class="settings-section-card">
            <h3 class="settings-section-title">SEO & Metadata</h3>
            <p class="settings-section-desc">Search engine title, indexing descriptions, and preview keywords.</p>

            <div class="form-group">
              <label class="form-label">Default SEO Title</label>
              <input type="text" name="seo_meta_title" class="form-control" value="${sMap.seo_meta_title || ''}">
            </div>

            <div class="form-group">
              <label class="form-label">Meta Description</label>
              <textarea name="seo_meta_description" class="form-control" rows="2">${sMap.seo_meta_description || ''}</textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="margin-bottom: 3rem;">
            Save All Settings
          </button>
        </form>
      `;
    } catch (e) {
      mount.innerHTML = `<p>Failed to load settings.</p>`;
    }
  },

  async saveSettings(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    try {
      await API.post('/api/v1/admin/settings', { settings: body });
      showToast('Site settings updated successfully!');
      // Refresh global app config
      const res = await API.get('/api/v1/public/config');
      if (res.success) {
        App.config = res.data;
        App.applyGlobalBranding();
        App.renderTopBar();
        App.renderHeader();
        App.renderFooter();
      }
    } catch (err) {
      showToast('Failed to save settings: ' + err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // TAB 4: HERO BANNERS
  // ----------------------------------------------------
  async renderBannersTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading banners...</div>`;

    try {
      const res = await API.get('/api/v1/admin/banners');
      const banners = res.data || [];

      mount.innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
          <button class="btn btn-primary" onclick="AdminApp.openCreateBannerModal()">+ Add New Hero Slide</button>
        </div>

        <div class="admin-card">
          <div class="admin-card-header">
            <span class="admin-card-title">Homepage Hero Slides (${banners.length})</span>
          </div>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title & Subtitle</th>
                  <th>Badge</th>
                  <th>CTA Button</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${banners.map(b => `
                  <tr>
                    <td>
                      <img src="${b.imageUrl}" alt="" style="width: 80px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);">
                    </td>
                    <td>
                      <strong>${b.title}</strong><br>
                      <span style="font-size: 0.75rem; color: #64748B;">${b.subtitle || ''}</span>
                    </td>
                    <td><span class="badge badge-gold">${b.badge || 'None'}</span></td>
                    <td><span style="font-size: 0.8125rem;">${b.ctaText} → ${b.ctaLink}</span></td>
                    <td><span class="badge ${b.isActive ? 'badge-success' : 'badge-neutral'}">${b.isActive ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" onclick='AdminApp.openEditBannerModal(${JSON.stringify(b)})'>✏️</button>
                        <button class="btn-icon danger" onclick="AdminApp.deleteBanner('${b._id || b.id}')">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<p>Failed to load banners.</p>`;
    }
  },

  openCreateBannerModal() {
    this.openEditBannerModal({
      title: '',
      subtitle: '',
      badge: 'NAAC A++ ACCREDITED',
      ctaText: 'Explore Courses',
      ctaLink: '#academics',
      secondaryCtaText: 'Admissions',
      secondaryCtaLink: '#admissions',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
      isActive: true
    }, true);
  },

  openEditBannerModal(b, isNew = false) {
    const modalId = 'banner-edit-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isNew ? 'Create New Hero Slide' : 'Edit Hero Slide'}</h3>
          <button class="btn-icon" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="AdminApp.saveBanner(event, '${b._id || b.id || ''}', ${isNew})">
            <div class="form-group">
              <label class="form-label">Headline Title *</label>
              <input type="text" name="title" class="form-control" value="${b.title || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Subtitle Description *</label>
              <textarea name="subtitle" class="form-control" rows="2" required>${b.subtitle || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Pill Badge</label>
              <input type="text" name="badge" class="form-control" value="${b.badge || ''}">
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Primary CTA Text</label>
                <input type="text" name="ctaText" class="form-control" value="${b.ctaText || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Primary CTA Link</label>
                <input type="text" name="ctaLink" class="form-control" value="${b.ctaLink || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Background Image URL *</label>
              <input type="text" name="imageUrl" class="form-control" value="${b.imageUrl || ''}" required>
              <span style="font-size: 0.75rem; color: #64748B;">Enter Unsplash URL or upload through the Media Library.</span>
            </div>
            <div class="form-group">
              <label class="switch-label">
                <input type="checkbox" name="isActive" class="switch-input" ${b.isActive ? 'checked' : ''}>
                <div class="switch-slider"></div>
                <span>Display on Homepage</span>
              </label>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Save Slide</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async saveBanner(e, id, isNew) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());
    body.isActive = formData.get('isActive') === 'on';

    try {
      if (isNew) {
        await API.post('/api/v1/admin/banners', body);
        showToast('Banner created!');
      } else {
        await API.put(`/api/v1/admin/banners/${id}`, body);
        showToast('Banner updated!');
      }
      document.getElementById('banner-edit-modal').remove();
      this.loadCurrentTab();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async deleteBanner(id) {
    if (!confirm('Delete this banner?')) return;
    try {
      await API.delete(`/api/v1/admin/banners/${id}`);
      showToast('Banner deleted');
      this.loadCurrentTab();
    } catch (e) {
      showToast('Failed to delete banner', 'error');
    }
  },

  // ----------------------------------------------------
  // TAB 5: HOMEPAGE SECTIONS ORDER & VISIBILITY
  // ----------------------------------------------------
  async renderSectionsTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading sections...</div>`;

    try {
      const res = await API.get('/api/v1/admin/homepage-sections');
      const sections = res.data || [];

      mount.innerHTML = `
        <div class="admin-card">
          <div class="admin-card-header">
            <span class="admin-card-title">Homepage Section Order & Visibility</span>
            <span style="font-size: 0.8125rem; color: #64748B;">Toggle visibility or modify section headings live</span>
          </div>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Section Name & Key</th>
                  <th>Display Title</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${sections.map((s, idx) => `
                  <tr>
                    <td><strong>#${s.sortOrder || idx + 1}</strong></td>
                    <td>
                      <strong>${s.title}</strong><br>
                      <span style="font-size: 0.75rem; color: #64748B;">${s.sectionKey}</span>
                    </td>
                    <td>${s.subtitle || 'Standard'}</td>
                    <td>
                      <label class="switch-label">
                        <input type="checkbox" class="switch-input" ${s.isVisible ? 'checked' : ''} onchange="AdminApp.toggleSectionVisibility('${s._id || s.id}', this.checked)">
                        <div class="switch-slider"></div>
                      </label>
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick='AdminApp.openEditSectionModal(${JSON.stringify(s)})'>Edit Titles</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<p>Failed to load homepage sections.</p>`;
    }
  },

  async toggleSectionVisibility(id, isVisible) {
    try {
      await API.put(`/api/v1/admin/homepage-sections/${id}`, { isVisible });
      showToast('Section visibility updated');
    } catch (e) {
      showToast('Failed to update visibility', 'error');
    }
  },

  openEditSectionModal(s) {
    const modalId = 'section-edit-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Section: ${s.title}</h3>
          <button class="btn-icon" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="AdminApp.saveSection(event, '${s._id || s.id}')">
            <div class="form-group">
              <label class="form-label">Heading Title *</label>
              <input type="text" name="title" class="form-control" value="${s.title}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Subtitle Description</label>
              <input type="text" name="subtitle" class="form-control" value="${s.subtitle || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order Number</label>
              <input type="number" name="sortOrder" class="form-control" value="${s.sortOrder || 1}">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Save Section</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async saveSection(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());
    body.sortOrder = parseInt(body.sortOrder) || 1;

    try {
      await API.put(`/api/v1/admin/homepage-sections/${id}`, body);
      showToast('Section updated successfully');
      document.getElementById('section-edit-modal').remove();
      this.loadCurrentTab();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // TAB 6: NOTICES & CIRCULARS
  // ----------------------------------------------------
  async renderNoticesTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading notices...</div>`;

    try {
      const res = await API.get('/api/v1/admin/notices');
      const notices = res.data || [];

      mount.innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
          <button class="btn btn-primary" onclick="AdminApp.openCreateNoticeModal()">+ Publish New Notice</button>
        </div>

        <div class="admin-card">
          <div class="admin-card-header">
            <span class="admin-card-title">Official Notices & Circulars (${notices.length})</span>
          </div>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Published</th>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Pinned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${notices.map(n => `
                  <tr>
                    <td><strong>${n.publishedDate}</strong></td>
                    <td style="max-width: 320px;">
                      <strong>${n.title}</strong><br>
                      <span style="font-size: 0.75rem; color: #64748B;">${n.content ? n.content.slice(0, 90) + '...' : ''}</span>
                    </td>
                    <td><span class="badge badge-neutral">${n.category}</span></td>
                    <td>${n.isPinned ? '📌 Yes' : 'No'}</td>
                    <td><span class="badge ${n.status === 'published' ? 'badge-success' : 'badge-warning'}">${n.status}</span></td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" onclick='AdminApp.openEditNoticeModal(${JSON.stringify(n)})'>✏️</button>
                        <button class="btn-icon danger" onclick="AdminApp.deleteNotice('${n._id || n.id}')">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<p>Failed to load notices.</p>`;
    }
  },

  openCreateNoticeModal() {
    this.openEditNoticeModal({
      title: '',
      category: 'Admissions',
      publishedDate: new Date().toISOString().split('T')[0],
      isPinned: false,
      status: 'published',
      content: ''
    }, true);
  },

  openEditNoticeModal(n, isNew = false) {
    const modalId = 'notice-edit-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isNew ? 'Publish Official Circular' : 'Edit Circular'}</h3>
          <button class="btn-icon" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="AdminApp.saveNotice(event, '${n._id || n.id || ''}', ${isNew})">
            <div class="form-group">
              <label class="form-label">Notice Headline *</label>
              <input type="text" name="title" class="form-control" value="${n.title || ''}" required>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select name="category" class="form-control">
                  <option value="Admissions" ${n.category === 'Admissions' ? 'selected' : ''}>Admissions</option>
                  <option value="Examinations" ${n.category === 'Examinations' ? 'selected' : ''}>Examinations</option>
                  <option value="Placements" ${n.category === 'Placements' ? 'selected' : ''}>Placements</option>
                  <option value="Research" ${n.category === 'Research' ? 'selected' : ''}>Research</option>
                  <option value="Hostel" ${n.category === 'Hostel' ? 'selected' : ''}>Hostel</option>
                  <option value="General" ${n.category === 'General' ? 'selected' : ''}>General</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Publish Date</label>
                <input type="date" name="publishedDate" class="form-control" value="${n.publishedDate || ''}" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Detailed Content / Circular Description</label>
              <textarea name="content" class="form-control" rows="3">${n.content || ''}</textarea>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Publication Status</label>
                <select name="status" class="form-control">
                  <option value="published" ${n.status === 'published' ? 'selected' : ''}>Published (Live)</option>
                  <option value="draft" ${n.status === 'draft' ? 'selected' : ''}>Draft</option>
                </select>
              </div>
              <div class="form-group" style="display: flex; align-items: center; margin-top: 1.5rem;">
                <label class="switch-label">
                  <input type="checkbox" name="isPinned" class="switch-input" ${n.isPinned ? 'checked' : ''}>
                  <div class="switch-slider"></div>
                  <span>Pin to Top of Ticker</span>
                </label>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Save Notice</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async saveNotice(e, id, isNew) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());
    body.isPinned = formData.get('isPinned') === 'on';

    try {
      if (isNew) {
        await API.post('/api/v1/admin/notices', body);
        showToast('Notice published live!');
      } else {
        await API.put(`/api/v1/admin/notices/${id}`, body);
        showToast('Notice updated!');
      }
      document.getElementById('notice-edit-modal').remove();
      this.loadCurrentTab();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async deleteNotice(id) {
    if (!confirm('Delete this notice?')) return;
    try {
      await API.delete(`/api/v1/admin/notices/${id}`);
      showToast('Notice deleted');
      this.loadCurrentTab();
    } catch (e) {
      showToast('Failed to delete notice', 'error');
    }
  },

  // ----------------------------------------------------
  // TAB 7: UPCOMING EVENTS
  // ----------------------------------------------------
  async renderEventsTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading events...</div>`;

    try {
      const res = await API.get('/api/v1/admin/events');
      const events = res.data || [];

      mount.innerHTML = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
          <button class="btn btn-primary" onclick="AdminApp.openCreateEventModal()">+ Schedule New Event</button>
        </div>

        <div class="admin-card">
          <div class="admin-card-header">
            <span class="admin-card-title">Campus Events & Conferences (${events.length})</span>
          </div>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${events.map(ev => `
                  <tr>
                    <td><strong>${ev.eventDate}</strong><br><span style="font-size: 0.75rem; color: #64748B;">${ev.eventTime || ''}</span></td>
                    <td><strong>${ev.title}</strong></td>
                    <td><span class="badge badge-warning">${ev.category}</span></td>
                    <td>${ev.venue}</td>
                    <td><span class="badge ${ev.status === 'published' ? 'badge-success' : 'badge-neutral'}">${ev.status}</span></td>
                    <td>
                      <div class="table-actions">
                        <button class="btn-icon" onclick='AdminApp.openEditEventModal(${JSON.stringify(ev)})'>✏️</button>
                        <button class="btn-icon danger" onclick="AdminApp.deleteEvent('${ev._id || ev.id}')">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<p>Failed to load events.</p>`;
    }
  },

  openCreateEventModal() {
    this.openEditEventModal({
      title: '',
      category: 'Technical Fest',
      eventDate: new Date().toISOString().split('T')[0],
      eventTime: '10:00 AM - 05:00 PM',
      venue: 'Main Auditorium',
      speaker: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
      status: 'published'
    }, true);
  },

  openEditEventModal(ev, isNew = false) {
    const modalId = 'event-edit-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isNew ? 'Schedule New Campus Event' : 'Edit Event'}</h3>
          <button class="btn-icon" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="AdminApp.saveEvent(event, '${ev._id || ev.id || ''}', ${isNew})">
            <div class="form-group">
              <label class="form-label">Event Title *</label>
              <input type="text" name="title" class="form-control" value="${ev.title || ''}" required>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input type="date" name="eventDate" class="form-control" value="${ev.eventDate || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Time</label>
                <input type="text" name="eventTime" class="form-control" value="${ev.eventTime || ''}">
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" name="category" class="form-control" value="${ev.category || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Venue *</label>
                <input type="text" name="venue" class="form-control" value="${ev.venue || ''}" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Key Speaker / Guests</label>
              <input type="text" name="speaker" class="form-control" value="${ev.speaker || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea name="description" class="form-control" rows="3">${ev.description || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Banner Image URL</label>
              <input type="text" name="imageUrl" class="form-control" value="${ev.imageUrl || ''}">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Save Event</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async saveEvent(e, id, isNew) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    try {
      if (isNew) {
        await API.post('/api/v1/admin/events', body);
        showToast('Event created!');
      } else {
        await API.put(`/api/v1/admin/events/${id}`, body);
        showToast('Event updated!');
      }
      document.getElementById('event-edit-modal').remove();
      this.loadCurrentTab();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async deleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    try {
      await API.delete(`/api/v1/admin/events/${id}`);
      showToast('Event deleted');
      this.loadCurrentTab();
    } catch (e) {
      showToast('Failed to delete event', 'error');
    }
  },

  // ----------------------------------------------------
  // OTHER ADMINISTRATIVE TABS (DEPARTMENTS, COURSES, FACULTY, RECRUITERS, ETC.)
  // ----------------------------------------------------
  async renderDepartmentsTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading departments...</div>`;
    const res = await API.get('/api/v1/admin/departments');
    const depts = res.data || [];

    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <span class="admin-card-title">Academic Departments (${depts.length})</span>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
                <th>Degree Levels</th>
                <th>HOD Name</th>
                <th>Contact Email</th>
              </tr>
            </thead>
            <tbody>
              ${depts.map(d => `
                <tr>
                  <td><strong>${d.code}</strong></td>
                  <td>${d.name}</td>
                  <td><span class="badge badge-primary">${d.degreeLevels}</span></td>
                  <td>${d.hodName || 'N/A'}</td>
                  <td>${d.email || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderCoursesTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading courses...</div>`;
    const res = await API.get('/api/v1/admin/courses');
    const courses = res.data || [];

    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <span class="admin-card-title">Approved Degree Courses (${courses.length})</span>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Degree</th>
                <th>Course Title</th>
                <th>Duration</th>
                <th>Intake</th>
                <th>Eligibility</th>
              </tr>
            </thead>
            <tbody>
              ${courses.map(c => `
                <tr>
                  <td><span class="program-degree">${c.degree}</span></td>
                  <td><strong>${c.title}</strong></td>
                  <td>${c.duration}</td>
                  <td><strong>${c.intake} Seats</strong></td>
                  <td style="max-width: 250px; font-size: 0.8125rem;">${c.eligibility}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderFacultyTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading faculty...</div>`;
    const res = await API.get('/api/v1/admin/faculty');
    const faculty = res.data || [];

    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <span class="admin-card-title">Faculty Directory (${faculty.length})</span>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name & Designation</th>
                <th>Dept</th>
                <th>Qualification & Experience</th>
                <th>Research Areas</th>
              </tr>
            </thead>
            <tbody>
              ${faculty.map(f => `
                <tr>
                  <td><img src="${f.imageUrl}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;"></td>
                  <td>
                    <strong>${f.name}</strong><br>
                    <span style="font-size: 0.75rem; color: #64748B;">${f.designation}</span>
                  </td>
                  <td><span class="badge badge-gold">${f.departmentCode}</span></td>
                  <td>${f.qualification} (${f.experienceYears} yrs)</td>
                  <td style="font-size: 0.8125rem;">${f.researchAreas || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderNewsTab(mount) {
    const res = await API.get('/api/v1/admin/news');
    const news = res.data || [];
    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <span class="admin-card-title">News Articles & Press Releases (${news.length})</span>
        </div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead><tr><th>Date</th><th>Headline</th><th>Category</th><th>Status</th></tr></thead>
            <tbody>
              ${news.map(n => `
                <tr>
                  <td><strong>${n.publishedDate}</strong></td>
                  <td><strong>${n.title}</strong></td>
                  <td><span class="badge badge-neutral">${n.category}</span></td>
                  <td><span class="badge badge-success">${n.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderAdmissionsTab(mount) {
    const res = await API.get('/api/v1/admin/admissions');
    const items = res.data || [];
    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header"><span class="admin-card-title">Admissions & Fee Charts (${items.length})</span></div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead><tr><th>Type</th><th>Step / Title</th><th>Deadline</th><th>Annual Fee</th></tr></thead>
            <tbody>
              ${items.map(a => `
                <tr>
                  <td><span class="badge badge-primary">${a.category}</span></td>
                  <td><strong>${a.title}</strong></td>
                  <td>${a.deadline || '-'}</td>
                  <td>${a.feeAnnual || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderPlacementsTab(mount) {
    const res = await API.get('/api/v1/admin/placements');
    const records = res.data || [];
    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header"><span class="admin-card-title">Annual Placement Statistics (${records.length})</span></div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead><tr><th>Year</th><th>Placement %</th><th>Highest Package</th><th>Avg Package</th><th>Placed Count</th></tr></thead>
            <tbody>
              ${records.map(p => `
                <tr>
                  <td><strong>${p.academicYear}</strong></td>
                  <td><span class="badge badge-success">${p.placementRate}%</span></td>
                  <td><strong>${p.highestPackage}</strong></td>
                  <td>${p.averagePackage}</td>
                  <td>${p.placedStudents} / ${p.totalStudents}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderRecruitersTab(mount) {
    const res = await API.get('/api/v1/admin/recruiters');
    const recruiters = res.data || [];
    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header"><span class="admin-card-title">Corporate Recruiters (${recruiters.length})</span></div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead><tr><th>Logo</th><th>Company Name</th><th>Tier</th><th>Highest Package</th></tr></thead>
            <tbody>
              ${recruiters.map(r => `
                <tr>
                  <td><img src="${r.logoUrl}" style="height: 32px; object-fit: contain;"></td>
                  <td><strong>${r.name}</strong></td>
                  <td><span class="badge badge-neutral">${r.tier}</span></td>
                  <td>${r.highestOffer || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderFacilitiesTab(mount) {
    const res = await API.get('/api/v1/admin/facilities');
    const facilities = res.data || [];
    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header"><span class="admin-card-title">Campus Facilities (${facilities.length})</span></div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead><tr><th>Photo</th><th>Facility Name</th><th>Category</th><th>Location</th></tr></thead>
            <tbody>
              ${facilities.map(f => `
                <tr>
                  <td><img src="${f.imageUrl}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                  <td><strong>${f.name}</strong></td>
                  <td><span class="badge badge-primary">${f.category}</span></td>
                  <td>${f.location || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderTestimonialsTab(mount) {
    const res = await API.get('/api/v1/admin/testimonials');
    const tests = res.data || [];
    mount.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header"><span class="admin-card-title">Testimonials (${tests.length})</span></div>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead><tr><th>Student</th><th>Graduation / Course</th><th>Company & Role</th><th>Quote</th></tr></thead>
            <tbody>
              ${tests.map(t => `
                <tr>
                  <td><strong>${t.studentName}</strong></td>
                  <td>${t.course} (${t.graduationYear})</td>
                  <td><strong>${t.company}</strong> • ${t.currentRole}</td>
                  <td style="max-width: 250px; font-size: 0.8125rem;">${t.quote}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ----------------------------------------------------
  // TAB 15: MEDIA & UPLOADS
  // ----------------------------------------------------
  async renderMediaTab(mount) {
    mount.innerHTML = `
      <div class="admin-card" style="padding: 1.5rem; margin-bottom: 2rem;">
        <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--color-primary);">Upload File or Image</h3>
        <p style="font-size: 0.875rem; color: #64748B; margin-bottom: 1.25rem;">
          Supported formats: JPG, PNG, WEBP, PDF, DOCX (Max 10MB). Uploaded files are immediately available for use across the site.
        </p>

        <div class="upload-dropzone" onclick="document.getElementById('admin-file-upload-input').click()">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 0.75rem auto; color: var(--color-secondary);"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <div style="font-weight: 600; color: var(--color-primary); margin-bottom: 0.25rem;">Click to select file to upload</div>
          <span style="font-size: 0.75rem; color: #94A3B8;">Files are stored securely in the institutional repository</span>
          <input type="file" id="admin-file-upload-input" style="display: none;" onchange="AdminApp.handleFileUpload(event)">
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header"><span class="admin-card-title">Media Library</span></div>
        <div style="padding: 1.5rem;" id="media-library-grid">
          <div style="text-align: center;"><div class="pulse-dot"></div> Loading files...</div>
        </div>
      </div>
    `;

    this.loadMediaLibraryGrid();
  },

  async handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    showToast('Uploading ' + file.name + '...', 'info');
    try {
      const res = await API.upload(file);
      showToast('File uploaded successfully!');
      this.loadMediaLibraryGrid();
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    }
  },

  async loadMediaLibraryGrid() {
    const el = document.getElementById('media-library-grid');
    if (!el) return;

    try {
      const res = await API.get('/api/v1/admin/media');
      const files = res.data || [];

      if (!files.length) {
        el.innerHTML = `<p style="color: #64748B; text-align: center;">No uploaded files yet.</p>`;
        return;
      }

      el.innerHTML = `
        <div class="grid-4">
          ${files.map(f => `
            <div class="card" style="padding: 0.75rem; text-align: center;">
              ${f.mimeType.startsWith('image/') 
                ? `<img src="${f.filePath}" style="height: 120px; width: 100%; object-fit: cover; border-radius: var(--radius-sm); margin-bottom: 0.5rem;">` 
                : `<div style="height: 120px; display: flex; align-items: center; justify-content: center; background: #F1F5F9; border-radius: var(--radius-sm); margin-bottom: 0.5rem;">📄 DOC</div>`}
              <div style="font-size: 0.75rem; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${f.originalName}</div>
              <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 0.5rem; font-size: 0.75rem;" onclick="navigator.clipboard.writeText('${f.filePath}'); showToast('URL copied to clipboard!');">Copy URL</button>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      el.innerHTML = `<p>Failed to load media.</p>`;
    }
  },

  // ----------------------------------------------------
  // TAB 16: AUDIT TRAIL
  // ----------------------------------------------------
  async renderAuditTab(mount) {
    mount.innerHTML = `<div style="padding: 2rem; text-align: center;"><div class="pulse-dot"></div> Loading audit trail...</div>`;

    try {
      const res = await API.get('/api/v1/admin/audit-logs');
      const logs = res.data || [];

      mount.innerHTML = `
        <div class="admin-card">
          <div class="admin-card-header">
            <span class="admin-card-title">System Audit Trail (${logs.length} entries)</span>
          </div>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                  <th>User / IP</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr>
                    <td><span style="font-size: 0.75rem;">${new Date(l.createdAt).toLocaleString()}</span></td>
                    <td><span class="badge badge-neutral">${l.action}</span></td>
                    <td><strong>${l.entityType}</strong> (${l.entityId || 'all'})</td>
                    <td style="font-size: 0.8125rem; max-width: 320px;">${l.details || ''}</td>
                    <td><span style="font-size: 0.75rem; color: #64748B;">${l.username} • ${l.ipAddress || '127.0.0.1'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (e) {
      mount.innerHTML = `<p>Failed to load audit logs.</p>`;
    }
  },

  // ----------------------------------------------------
  // LOGIN VIEW
  // ----------------------------------------------------
  renderLogin(container) {
    container.innerHTML = `
      <div class="admin-login-wrap">
        <div class="admin-login-card">
          <div class="login-header">
            <div class="login-crest">A</div>
            <h2>Institutional CMS Login</h2>
            <p>Access the unified administrator dashboard</p>
          </div>

          <form onsubmit="AdminApp.handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" id="admin-login-username" class="form-control" value="admin" required autocomplete="username">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="admin-login-password" class="form-control" value="Admin@123" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">
              Sign In as Administrator
            </button>
          </form>

          <div style="background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md); margin-top: 1.5rem; font-size: 0.8125rem; text-align: center; color: #64748B;">
            <strong>Demo Credentials Pre-filled:</strong><br>
            Username: <code>admin</code> | Password: <code>Admin@123</code>
          </div>

          <div style="text-align: center; margin-top: 1.5rem;">
            <a href="#home" style="font-size: 0.875rem;">← Return to Public Website</a>
          </div>
        </div>
      </div>
    `;
  },

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('admin-login-username').value;
    const password = document.getElementById('admin-login-password').value;

    try {
      const res = await API.post('/api/v1/auth/login', { username, password });
      if (res.success) {
        API.setAuth(res.token, res.admin);
        showToast('Welcome, Administrator!');
        this.render(document.getElementById('view-mount'));
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    }
  },

  logout() {
    API.clearAuth();
    showToast('Logged out of Admin CMS');
    this.renderLogin(document.getElementById('view-mount'));
  }
};
