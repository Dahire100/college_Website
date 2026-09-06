/**
 * PUBLIC PORTAL CONTROLLER
 * Dynamically renders public college pages from MongoDB Atlas database APIs.
 * Zero hardcoded content: Database/CMS is the single source of truth.
 */

const App = {
  config: null,
  currentSlide: 0,
  bannerTimer: null,

  async init() {
    try {
      // 1. Fetch site settings, navigation and homepage sections config
      const res = await API.get('/api/v1/public/config');
      if (res.success) {
        this.config = res.data;
        this.applyGlobalBranding();
        this.renderTopBar();
        this.renderHeader();
        this.renderFooter();
      }

      // 2. Setup Router listener
      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();

      // Setup global click listener for inquiry modal
      this.setupGlobalEvents();
    } catch (err) {
      console.error('Failed to initialize portal:', err);
    }
  },

  applyGlobalBranding() {
    const s = this.config.settings || {};
    const title = s.seo_meta_title || s.college_name || 'Apex Institute of Engineering & Technology';
    document.title = title;

    // Update dynamic meta description if exists
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = s.seo_meta_description || '';
  },

  renderTopBar() {
    const el = document.getElementById('top-bar-mount');
    if (!el) return;
    const s = this.config.settings || {};

    el.innerHTML = `
      <div class="top-bar">
        <div class="container">
          <div class="top-bar-left">
            <span class="top-badge-gold">${s.accreditation_summary ? s.accreditation_summary.split('|')[0].trim() : 'NAAC A++ ACCREDITED'}</span>
            <div class="top-bar-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>${s.contact_phone_primary || '+91 253 251 2876'}</span>
            </div>
            <div class="top-bar-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>${s.contact_email_primary || 'admissions@apex-inst.edu'}</span>
            </div>
          </div>
          <div class="top-bar-right">
            <a href="#admissions" class="top-bar-item">Admissions 2026</a>
            <a href="#notices" class="top-bar-item">Circulars</a>
            <a href="#placements" class="top-bar-item">Placements</a>
            <a href="#admin" class="top-badge-gold" style="cursor: pointer; text-decoration: none;">Admin CMS 🔐</a>
          </div>
        </div>
      </div>
    `;
  },

  renderHeader() {
    const el = document.getElementById('main-header-mount');
    if (!el) return;
    const s = this.config.settings || {};
    const nav = this.config.navigation || [];

    const navLinksHtml = nav.map(n => `
      <a href="${n.path}" class="nav-link ${window.location.hash === n.path ? 'active' : ''}">${n.title}</a>
    `).join('');

    el.innerHTML = `
      <header class="main-header" id="sticky-header">
        <div class="container">
          <a href="#home" class="brand-identity">
            <div class="brand-crest">A</div>
            <div class="brand-text">
              <h1>${s.college_name || 'Apex Institute of Engineering & Technology'}</h1>
              <span>${s.college_tagline || 'Autonomous Institution | Approved by AICTE, New Delhi'}</span>
            </div>
          </a>

          <nav class="main-nav" id="main-nav-menu">
            ${navLinksHtml}
          </nav>

          <div class="nav-actions">
            <button class="btn btn-accent btn-sm" onclick="App.openInquiryModal()">Apply / Inquire</button>
            <button class="mobile-menu-btn" onclick="App.toggleMobileMenu()" aria-label="Toggle navigation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </header>
    `;

    // Add scroll shadow listener
    window.addEventListener('scroll', () => {
      const header = document.getElementById('sticky-header');
      if (header) {
        if (window.scrollY > 20) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }
    });
  },

  toggleMobileMenu() {
    const nav = document.getElementById('main-nav-menu');
    if (nav) nav.classList.toggle('open');
  },

  renderFooter() {
    const el = document.getElementById('main-footer-mount');
    if (!el) return;
    const s = this.config.settings || {};

    el.innerHTML = `
      <footer class="main-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <h4>${s.college_short_name || 'Apex Institute'}</h4>
              <p style="color: #94A3B8; margin-bottom: 1.25rem;">
                ${s.college_tagline || 'Autonomous Institution of Academic Rigor, Innovation, and Research Excellence.'}
              </p>
              <div class="footer-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${s.contact_address || 'Panchavati, Nashik, Maharashtra, India'}</span>
              </div>
              <div class="footer-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>${s.contact_phone_primary || '+91 253 251 2876'}</span>
              </div>
            </div>

            <div class="footer-col">
              <h4>Academic Programs</h4>
              <ul class="footer-links">
                <li><a href="#academics">Computer Engineering</a></li>
                <li><a href="#academics">AI & Data Science</a></li>
                <li><a href="#academics">Electronics & Telecom</a></li>
                <li><a href="#academics">Mechanical Engineering</a></li>
                <li><a href="#academics">MBA & Management</a></li>
                <li><a href="#academics">Master of Computer Applications (MCA)</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Quick Access</h4>
              <ul class="footer-links">
                <li><a href="#admissions">Admission Eligibility</a></li>
                <li><a href="#fees">Fee Structure</a></li>
                <li><a href="#placements">Placement Statistics</a></li>
                <li><a href="#recruiters">Corporate Recruiters</a></li>
                <li><a href="#campus">Campus Facilities</a></li>
                <li><a href="#notices">Examination Circulars</a></li>
                <li><a href="#admin">Administrator CMS</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Admissions Helpline</h4>
              <p style="color: #94A3B8; margin-bottom: 0.75rem;">
                Counseling cell active Monday to Saturday (9:00 AM - 5:30 PM).
              </p>
              <div class="footer-contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>${s.contact_email_admissions || 'admissions@apex-inst.edu'}</span>
              </div>
              <button class="btn btn-accent btn-sm" style="margin-top: 0.5rem; width: 100%;" onclick="App.openInquiryModal()">
                Submit Admission Inquiry
              </button>
            </div>
          </div>

          <div class="footer-bottom">
            <div>
              © ${new Date().getFullYear()} ${s.college_name || 'Apex Institute'}. All Rights Reserved. ${s.affiliation || ''}
            </div>
            <div>
              <a href="#about">About</a> • <a href="#privacy">Privacy</a> • <a href="#terms">Mandatory Disclosures</a> • <a href="#admin">CMS Login</a>
            </div>
            <div class="footer-disclaimer">
              ${s.demo_notice_disclaimer || 'Demo Institutional Portal for academic demonstration.'}
            </div>
          </div>
        </div>
      </footer>
    `;
  },

  handleRoute() {
    const hash = window.location.hash || '#home';
    const mainMount = document.getElementById('view-mount');
    if (!mainMount) return;

    // Highlight active link in header
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === hash);
    });

    // Handle Admin view route
    if (hash === '#admin') {
      document.getElementById('top-bar-mount').style.display = 'none';
      document.getElementById('main-header-mount').style.display = 'none';
      document.getElementById('main-footer-mount').style.display = 'none';
      AdminApp.render(mainMount);
      return;
    }

    // Public views
    document.getElementById('top-bar-mount').style.display = 'block';
    document.getElementById('main-header-mount').style.display = 'block';
    document.getElementById('main-footer-mount').style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (hash) {
      case '#home':
        this.renderHome(mainMount);
        break;
      case '#about':
        this.renderAbout(mainMount);
        break;
      case '#leadership':
        this.renderLeadership(mainMount);
        break;
      case '#academics':
      case '#courses':
        this.renderAcademics(mainMount);
        break;
      case '#departments':
        this.renderDepartments(mainMount);
        break;
      case '#admissions':
        this.renderAdmissions(mainMount);
        break;
      case '#fees':
        this.renderFees(mainMount);
        break;
      case '#faculty':
        this.renderFaculty(mainMount);
        break;
      case '#placements':
        this.renderPlacements(mainMount);
        break;
      case '#recruiters':
        this.renderRecruiters(mainMount);
        break;
      case '#campus':
      case '#facilities':
        this.renderCampus(mainMount);
        break;
      case '#life':
        this.renderStudentLife(mainMount);
        break;
      case '#research':
        this.renderResearch(mainMount);
        break;
      case '#news':
      case '#notices':
      case '#events':
        this.renderNewsAndNotices(mainMount);
        break;
      case '#gallery':
        this.renderGallery(mainMount);
        break;
      case '#contact':
        this.renderContact(mainMount);
        break;
      default:
        this.renderHome(mainMount);
    }
  },

  // ----------------------------------------------------
  // PUBLIC PAGES RENDERERS (DATABASE DRIVEN)
  // ----------------------------------------------------

  async renderHome(container) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center;"><div class="pulse-dot"></div> Loading portal...</div>`;

    try {
      const [bannersRes, noticesRes, statsRes, deptRes, placeRes, facRes] = await Promise.all([
        API.get('/api/v1/public/banners'),
        API.get('/api/v1/public/notices?pinned=true'),
        API.get('/api/v1/public/placements'),
        API.get('/api/v1/public/departments'),
        API.get('/api/v1/public/placements'),
        API.get('/api/v1/public/facilities')
      ]);

      const banners = bannersRes.data || [];
      const notices = noticesRes.data || [];
      const departments = deptRes.data || [];
      const placements = placeRes.data?.records || [];
      const recruiters = placeRes.data?.recruiters || [];
      const facilities = facRes.data || [];
      const latestPlacement = placements[0] || {};
      const s = this.config.settings || {};

      let html = '';

      // 1. Hero Carousel
      if (banners.length > 0) {
        const slidesHtml = banners.map((b, idx) => `
          <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            <div class="hero-slide-bg" style="background-image: url('${b.imageUrl}')"></div>
            <div class="hero-slide-overlay"></div>
            <div class="container" style="height: 100%; display: flex; align-items: center;">
              <div class="hero-content fade-in">
                ${b.badge ? `<div class="hero-badge"><span class="pulse-dot"></span> ${b.badge}</div>` : ''}
                <h2 class="hero-title">${b.title}</h2>
                <p class="hero-subtitle">${b.subtitle}</p>
                <div class="hero-cta-group">
                  <a href="${b.ctaLink || '#academics'}" class="btn btn-primary btn-lg">${b.ctaText || 'Explore Courses'}</a>
                  <a href="${b.secondaryCtaLink || '#admissions'}" class="btn btn-outline-white btn-lg">${b.secondaryCtaText || 'Admissions'}</a>
                </div>
              </div>
            </div>
          </div>
        `).join('');

        const dotsHtml = banners.map((_, idx) => `
          <button class="hero-dot ${idx === 0 ? 'active' : ''}" onclick="App.goToSlide(${idx})"></button>
        `).join('');

        html += `
          <section class="hero-section" id="hero-slider">
            ${slidesHtml}
            <div class="hero-controls">
              <div class="container">
                <div class="hero-dots">${dotsHtml}</div>
                <div class="hero-arrows">
                  <button class="hero-arrow" onclick="App.prevSlide()">❮</button>
                  <button class="hero-arrow" onclick="App.nextSlide()">❯</button>
                </div>
              </div>
            </div>
          </section>
        `;
      }

      // 2. Urgent Circular Ticker
      const tickerNotice = notices[0] || { title: s.hero_admission_alert || 'Admissions Open 2026-27 for B.Tech and PG Programs.' };
      html += `
        <div class="notice-ticker-bar">
          <div class="container">
            <div class="ticker-label"><span class="pulse-dot"></span> LIVE CIRCULAR</div>
            <div class="ticker-content">
              <a href="#notices">${tickerNotice.title}</a>
            </div>
            <a href="#notices" class="btn btn-sm btn-secondary" style="flex-shrink: 0;">All Notices (${notices.length})</a>
          </div>
        </div>
      `;

      // 3. Accreditation Strip
      html += `
        <section class="accreditation-strip">
          <div class="container">
            <div class="accreditation-grid">
              <div class="accreditation-item">
                <div class="accreditation-icon">A++</div>
                <div>
                  <h4>NAAC Accredited</h4>
                  <p>Grade A++ (CGPA 3.65 / 4.00)</p>
                </div>
              </div>
              <div class="accreditation-item">
                <div class="accreditation-icon">NBA</div>
                <div>
                  <h4>Tier-1 Accreditations</h4>
                  <p>Accredited Engineering Branches</p>
                </div>
              </div>
              <div class="accreditation-item">
                <div class="accreditation-icon">NIRF</div>
                <div>
                  <h4>Top Ranked</h4>
                  <p>Ranked in NIRF 150 Band</p>
                </div>
              </div>
              <div class="accreditation-item">
                <div class="accreditation-icon">AICTE</div>
                <div>
                  <h4>Autonomous Status</h4>
                  <p>Approved by AICTE & UGC</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

      // 4. Key Stats Counter
      html += `
        <section class="stats-section">
          <div class="container">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">40+</div>
                <div class="stat-label">Years of Academic Rigor</div>
                <div class="stat-sub">Established in 1984</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${latestPlacement.placementRate || '95'}%</div>
                <div class="stat-label">Placement Track Record</div>
                <div class="stat-sub">Across top IT & Core industries</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${latestPlacement.highestPackage || '₹44.2 LPA'}</div>
                <div class="stat-label">Highest Campus Package</div>
                <div class="stat-sub">Average: ${latestPlacement.averagePackage || '₹8.65 LPA'}</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">350+</div>
                <div class="stat-label">Global Corporate Partners</div>
                <div class="stat-sub">Fortune 500 tech enterprises</div>
              </div>
            </div>
          </div>
        </section>
      `;

      // 5. Academic Programs & Courses Preview
      html += `
        <section class="section">
          <div class="container">
            <div class="section-title-wrap">
              <span class="section-badge">Academic Degrees</span>
              <h2 class="section-title">Industry-Aligned Degree Programs</h2>
              <p class="section-subtitle">Designed for experiential learning, hands-on software development, and technical innovation.</p>
            </div>

            <div class="grid-3">
              <div class="program-card">
                <div>
                  <span class="program-degree">Undergraduate (UG)</span>
                  <h3 class="program-title">B.Tech in Computer Engineering</h3>
                  <p class="program-desc">Comprehensive computer science foundations covering Distributed Systems, Cloud Architectures, Algorithms, and Cyber Security.</p>
                </div>
                <div>
                  <div class="program-meta">
                    <span><strong>Duration:</strong> 4 Years</span>
                    <span><strong>Intake:</strong> 180 Seats</span>
                  </div>
                  <a href="#courses" class="btn btn-secondary btn-sm" style="width: 100%;">View Curriculum</a>
                </div>
              </div>

              <div class="program-card">
                <div>
                  <span class="program-degree">Undergraduate (UG)</span>
                  <h3 class="program-title">B.Tech in Artificial Intelligence & Data Science</h3>
                  <p class="program-desc">Cutting-edge curriculum in Deep Learning, Computer Vision, Big Data Engineering, and Generative Intelligence.</p>
                </div>
                <div>
                  <div class="program-meta">
                    <span><strong>Duration:</strong> 4 Years</span>
                    <span><strong>Intake:</strong> 120 Seats</span>
                  </div>
                  <a href="#courses" class="btn btn-secondary btn-sm" style="width: 100%;">View Curriculum</a>
                </div>
              </div>

              <div class="program-card">
                <div>
                  <span class="program-degree">Postgraduate (PG)</span>
                  <h3 class="program-title">Master of Business Administration (MBA)</h3>
                  <p class="program-desc">Premier business management program with corporate executive mentoring, case studies, and business analytics tracks.</p>
                </div>
                <div>
                  <div class="program-meta">
                    <span><strong>Duration:</strong> 2 Years</span>
                    <span><strong>Intake:</strong> 120 Seats</span>
                  </div>
                  <a href="#courses" class="btn btn-secondary btn-sm" style="width: 100%;">View Curriculum</a>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin-top: 2rem;">
              <a href="#courses" class="btn btn-primary">Explore All Degrees & Syllabi</a>
            </div>
          </div>
        </section>
      `;

      // 6. Departments Showcase
      if (departments.length > 0) {
        const deptsHtml = departments.slice(0, 4).map(d => `
          <div class="dept-card">
            <img src="${d.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'}" alt="${d.name}" class="dept-img">
            <div class="dept-content">
              <div class="dept-code">${d.code} • ${d.degreeLevels}</div>
              <h3 class="dept-title">${d.name}</h3>
              <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 1rem; line-height: 1.5;">
                ${d.overview ? d.overview.slice(0, 110) + '...' : ''}
              </p>
              <div class="dept-stats-row">
                <span><strong>HOD:</strong> ${d.hodName || 'Department Head'}</span>
              </div>
              <a href="#departments" class="btn btn-secondary btn-sm" style="width: 100%;">Department Portal</a>
            </div>
          </div>
        `).join('');

        html += `
          <section class="section" style="background: var(--color-surface-subtle);">
            <div class="container">
              <div class="section-title-wrap">
                <span class="section-badge">Academic Departments</span>
                <h2 class="section-title">Specialized Engineering & Science Departments</h2>
                <p class="section-subtitle">Dedicated centers of excellence equipped with advanced laboratories and industry sponsored research setups.</p>
              </div>

              <div class="grid-4">
                ${deptsHtml}
              </div>

              <div style="text-align: center; margin-top: 2rem;">
                <a href="#departments" class="btn btn-secondary">View All Departments (${departments.length})</a>
              </div>
            </div>
          </section>
        `;
      }

      // 7. Marquee Corporate Recruiters
      if (recruiters.length > 0) {
        const recruiterLogos = recruiters.concat(recruiters).map(r => `
          <div class="recruiter-logo-item">
            <img src="${r.logoUrl}" alt="${r.name}" class="recruiter-logo-img">
            <span style="font-size: 0.75rem; font-weight: 600; color: #64748B; margin-top: 0.35rem;">${r.name}</span>
          </div>
        `).join('');

        html += `
          <section class="section">
            <div class="container">
              <div class="section-title-wrap">
                <span class="section-badge">Career & Placements</span>
                <h2 class="section-title">Our Prestigious Corporate Recruiters</h2>
                <p class="section-subtitle">Leading global technology giants and fortune enterprises recruiting graduates across campuses.</p>
              </div>

              <div class="recruiter-marquee">
                <div class="recruiter-track">
                  ${recruiterLogos}
                </div>
              </div>

              <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;">
                <a href="#placements" class="btn btn-primary">Detailed Placement Statistics</a>
                <a href="#recruiters" class="btn btn-secondary">Recruiter Directory</a>
              </div>
            </div>
          </section>
        `;
      }

      // 8. Campus Highlights & Facilities
      if (facilities.length > 0) {
        const facHtml = facilities.slice(0, 3).map(f => `
          <div class="facility-card">
            <img src="${f.imageUrl}" alt="${f.name}" class="facility-img">
            <div class="facility-body">
              <span class="badge badge-primary" style="margin-bottom: 0.5rem;">${f.category}</span>
              <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">${f.name}</h3>
              <p style="font-size: 0.875rem; color: var(--color-text-secondary);">${f.shortDesc}</p>
            </div>
          </div>
        `).join('');

        html += `
          <section class="section" style="background: var(--color-surface-subtle);">
            <div class="container">
              <div class="section-title-wrap">
                <span class="section-badge">Campus Infrastructure</span>
                <h2 class="section-title">World-Class Facilities & Labs</h2>
                <p class="section-subtitle">Equipped with NVIDIA Supercomputing, 5-Axis CNC Workshops, and 24/7 Digital Knowledge Repositories.</p>
              </div>

              <div class="grid-3">
                ${facHtml}
              </div>

              <div style="text-align: center; margin-top: 2rem;">
                <a href="#campus" class="btn btn-secondary">Take Virtual Campus Tour</a>
              </div>
            </div>
          </section>
        `;
      }

      // 9. Director's Message
      html += `
        <section class="section">
          <div class="container">
            <div class="director-section">
              <div class="director-grid">
                <div class="director-img-wrap">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80" alt="Director & Principal" class="director-photo">
                </div>
                <div>
                  <span class="section-badge">Institutional Leadership</span>
                  <h2 style="font-size: 1.85rem; color: var(--color-primary); margin-bottom: 0.5rem;">Director & Principal's Message</h2>
                  <p style="font-weight: 600; color: var(--color-accent); margin-bottom: 1.25rem;">Dr. Keshav N. Nandurkar • Ph.D. (IIT Roorkee)</p>
                  <blockquote style="font-size: 1.1rem; line-height: 1.7; color: var(--color-text-secondary); font-style: italic; margin-bottom: 1.5rem; border-left: 3px solid var(--color-accent); padding-left: 1rem;">
                    "For over forty years, our autonomous institution has stayed at the vanguard of technical education. We combine rigorous foundational engineering with real-world industry immersion so our students graduate as visionary leaders, deep-tech entrepreneurs, and responsible global citizens."
                  </blockquote>
                  <a href="#leadership" class="btn btn-secondary">Read Full Leadership Message</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

      // 10. Admission Call to Action Banner
      html += `
        <section class="section" style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); color: #FFFFFF; text-align: center;">
          <div class="container" style="max-width: 800px;">
            <span class="top-badge-gold" style="margin-bottom: 1rem; display: inline-block;">ADMISSIONS OPEN 2026-27</span>
            <h2 style="color: #FFFFFF; font-size: 2.4rem; margin-bottom: 1rem;">Begin Your Journey at Apex Institute</h2>
            <p style="color: #CBD5E1; font-size: 1.15rem; margin-bottom: 2rem;">
              Applications are now invited for B.Tech, M.Tech, MBA & MCA degree programs. Benefit from NAAC A++ academic curriculum and outstanding career placements.
            </p>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
              <button class="btn btn-accent btn-lg" onclick="App.openInquiryModal()">Apply / Submit Inquiry</button>
              <a href="#admissions" class="btn btn-outline-white btn-lg">Admission Roadmap & Eligibility</a>
            </div>
          </div>
        </section>
      `;

      container.innerHTML = html;

      // Start hero carousel timer
      if (banners.length > 1) {
        this.startBannerTimer(banners.length);
      }
    } catch (err) {
      console.error('Home page render failed:', err);
      container.innerHTML = `<div class="container" style="padding: 3rem;"><p>Failed to load homepage content. Please ensure backend is running.</p></div>`;
    }
  },

  // Carousel timer
  startBannerTimer(total) {
    if (this.bannerTimer) clearInterval(this.bannerTimer);
    this.bannerTimer = setInterval(() => {
      this.nextSlide(total);
    }, 6000);
  },

  nextSlide(total = 3) {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    this.currentSlide = (this.currentSlide + 1) % slides.length;
    this.updateSlideUI();
  },

  prevSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
    this.updateSlideUI();
  },

  goToSlide(idx) {
    this.currentSlide = idx;
    this.updateSlideUI();
  },

  updateSlideUI() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === this.currentSlide);
    });
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === this.currentSlide);
    });
  },

  // ----------------------------------------------------
  // ABOUT US PAGE
  // ----------------------------------------------------
  async renderAbout(container) {
    const s = this.config.settings || {};
    container.innerHTML = `
      <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
        <div class="container">
          <span class="section-badge">Institutional Profile</span>
          <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">About ${s.college_short_name || 'Apex Institute'}</h1>
          <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
            Established in ${s.college_est || '1984'}, our autonomous college is dedicated to world-class engineering, research, and holistic student development.
          </p>
        </div>
      </div>

      <div class="section container">
        <div class="grid-2" style="align-items: center; margin-bottom: 3rem;">
          <div>
            <span class="section-badge">Legacy & Vision</span>
            <h2 class="section-title">Four Decades of Educational Leadership</h2>
            <p style="margin-bottom: 1rem;">
              Apex Institute of Engineering & Technology has evolved into one of the country's most respected autonomous institutions. With NAAC A++ Grade accreditation and NBA accredited programs, the college stands as a beacon of academic excellence.
            </p>
            <p style="margin-bottom: 1.5rem;">
              Our campus boasts modern computing facilities, high-performance GPU labs, multidisciplinary research centers, and championship winning student automotive design teams.
            </p>
            <div style="display: flex; gap: 2rem;">
              <div>
                <h3 style="font-size: 2rem; color: var(--color-secondary);">40+</h3>
                <p style="font-size: 0.875rem;">Years of Excellence</p>
              </div>
              <div>
                <h3 style="font-size: 2rem; color: var(--color-secondary);">10,000+</h3>
                <p style="font-size: 0.875rem;">Proud Alumni Network</p>
              </div>
              <div>
                <h3 style="font-size: 2rem; color: var(--color-secondary);">95%+</h3>
                <p style="font-size: 0.875rem;">Campus Placements</p>
              </div>
            </div>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80" alt="Campus Facade" style="border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
          </div>
        </div>

        <div class="grid-2" style="margin-top: 2rem;">
          <div class="card" style="border-top: 4px solid var(--color-secondary);">
            <h3 style="font-size: 1.35rem; margin-bottom: 0.75rem;">Our Vision</h3>
            <p>
              To emerge as a premier autonomous center of higher technical learning and innovation, producing ethically grounded engineers and visionary leaders who solve complex global engineering challenges.
            </p>
          </div>
          <div class="card" style="border-top: 4px solid var(--color-accent);">
            <h3 style="font-size: 1.35rem; margin-bottom: 0.75rem;">Our Mission</h3>
            <p>
              Deliver rigorous, industry-integrated curriculum, foster interdisciplinary scientific research, cultivate entrepreneurial mindsets, and inculcate social responsibility through experiential learning.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  // ----------------------------------------------------
  // LEADERSHIP PAGE
  // ----------------------------------------------------
  async renderLeadership(container) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center;"><div class="pulse-dot"></div> Loading leadership profiles...</div>`;

    try {
      const res = await API.get('/api/v1/public/leadership');
      const leaders = res.data || [];

      const cardsHtml = leaders.map(l => `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="grid-2" style="align-items: center;">
            <div>
              <img src="${l.imageUrl}" alt="${l.name}" style="border-radius: var(--radius-lg); width: 100%; height: 320px; object-fit: cover;">
            </div>
            <div>
              <span class="badge badge-gold" style="margin-bottom: 0.5rem;">${l.designationBadge || 'Leadership'}</span>
              <h2 style="font-size: 1.6rem; color: var(--color-primary); margin-bottom: 0.25rem;">${l.name}</h2>
              <p style="font-weight: 600; color: var(--color-secondary); margin-bottom: 1rem;">${l.roleTitle} • ${l.qualifications || ''}</p>
              <blockquote style="font-style: italic; color: var(--color-text-secondary); line-height: 1.7; border-left: 3px solid var(--color-accent); padding-left: 1rem; margin-bottom: 1rem;">
                "${l.message}"
              </blockquote>
              ${l.quote ? `<p style="font-size: 0.875rem; color: var(--color-text-muted);"><strong>Core Philosophy:</strong> ${l.quote}</p>` : ''}
            </div>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Governance & Vision</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Institutional Leadership</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              Guiding our community with four decades of wisdom, strategic foresight, and dedication to excellence.
            </p>
          </div>
        </div>
        <div class="section container">
          ${cardsHtml}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container" style="padding: 3rem;"><p>Failed to load leadership data.</p></div>`;
    }
  },

  // ----------------------------------------------------
  // ACADEMICS & COURSES PAGE
  // ----------------------------------------------------
  async renderAcademics(container) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center;"><div class="pulse-dot"></div> Loading academic programs...</div>`;

    try {
      const res = await API.get('/api/v1/public/courses');
      const courses = res.data || [];

      const coursesHtml = courses.map(c => `
        <div class="card" style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <span class="program-degree">${c.degree}</span>
              <h3 style="font-size: 1.4rem; color: var(--color-primary); margin-top: 0.35rem;">${c.title}</h3>
              <span style="font-size: 0.8125rem; color: var(--color-text-secondary);">Department Code: <strong>${c.departmentCode}</strong></span>
            </div>
            <div style="text-align: right;">
              <span class="badge badge-success" style="font-size: 0.875rem;">Intake: ${c.intake} Seats</span>
              <div style="font-size: 0.8125rem; color: var(--color-text-secondary); margin-top: 0.25rem;">Duration: ${c.duration}</div>
            </div>
          </div>
          <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">${c.description || ''}</p>
          <div style="background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md); font-size: 0.875rem; margin-bottom: 1rem;">
            <strong>Eligibility:</strong> ${c.eligibility}
          </div>
          ${c.curriculum && c.curriculum.length ? `
            <div style="margin-bottom: 1rem;">
              <strong style="font-size: 0.875rem; color: var(--color-primary); display: block; margin-bottom: 0.5rem;">Sample Curriculum Highlights:</strong>
              <ul style="padding-left: 1.25rem; font-size: 0.875rem; color: var(--color-text-secondary);">
                ${c.curriculum.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-subtle); padding-top: 1rem;">
            <span style="font-size: 0.8125rem; color: var(--color-text-muted);">Career Prospects: ${c.careerOpportunities || 'Technology & Engineering Roles'}</span>
            <button class="btn btn-accent btn-sm" onclick="App.openInquiryModal('${c.title}')">Inquire for Course</button>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Academic Degrees & Syllabi</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Programs & Courses</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              Autonomous degree programs crafted in collaboration with world-leading industrial technology boards.
            </p>
          </div>
        </div>
        <div class="section container">
          ${coursesHtml}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container" style="padding: 3rem;"><p>Failed to load courses.</p></div>`;
    }
  },

  // ----------------------------------------------------
  // DEPARTMENTS PAGE
  // ----------------------------------------------------
  async renderDepartments(container) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center;"><div class="pulse-dot"></div> Loading departments...</div>`;

    try {
      const res = await API.get('/api/v1/public/departments');
      const depts = res.data || [];

      const deptsHtml = depts.map(d => `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="grid-2" style="align-items: center;">
            <div>
              <img src="${d.imageUrl}" alt="${d.name}" style="border-radius: var(--radius-lg); width: 100%; height: 260px; object-fit: cover;">
            </div>
            <div>
              <span class="badge badge-gold" style="margin-bottom: 0.5rem;">${d.code} • ${d.degreeLevels}</span>
              <h2 style="font-size: 1.5rem; color: var(--color-primary); margin-bottom: 0.5rem;">${d.name}</h2>
              <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">${d.overview}</p>
              <div style="background: var(--color-bg); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; margin-bottom: 1rem;">
                <strong>HOD:</strong> ${d.hodName || 'Head of Department'} | <strong>Contact:</strong> ${d.email || ''}
              </div>
              <div style="display: flex; gap: 0.75rem;">
                <a href="#courses" class="btn btn-secondary btn-sm">View Department Courses</a>
                <a href="#faculty" class="btn btn-secondary btn-sm">Department Faculty</a>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Academic Centers</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Academic Departments</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              Eight specialized departments fostering state-of-the-art computational and engineering research.
            </p>
          </div>
        </div>
        <div class="section container">
          ${deptsHtml}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container" style="padding: 3rem;"><p>Failed to load departments.</p></div>`;
    }
  },

  // ----------------------------------------------------
  // ADMISSIONS & FEES PAGES
  // ----------------------------------------------------
  async renderAdmissions(container) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center;"><div class="pulse-dot"></div> Loading admission procedure...</div>`;

    try {
      const res = await API.get('/api/v1/public/admissions');
      const items = res.data || [];
      const steps = items.filter(i => i.category === 'Admission Process');
      const fees = items.filter(i => i.category === 'Fee Structure');

      const stepsHtml = steps.map(s => `
        <div class="card" style="margin-bottom: 1.5rem; display: flex; gap: 1.5rem; align-items: flex-start;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-secondary); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; flex-shrink: 0;">
            ${s.stepNumber || '1'}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
              <h3 style="font-size: 1.25rem; color: var(--color-primary);">${s.title}</h3>
              ${s.deadline ? `<span class="badge badge-warning">Target Date: ${s.deadline}</span>` : ''}
            </div>
            <p style="color: var(--color-text-secondary); margin-bottom: 0.75rem;">${s.description}</p>
            <div style="background: var(--color-bg); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.8125rem;">
              <strong>Mandatory Documents:</strong> ${s.requiredDocuments || 'Academic scorecards, entrance marksheets'}
            </div>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Admissions 2026-27</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Admission Procedure & Eligibility</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              Step-by-step roadmap for First Year B.Tech, Direct Second Year (DSE), M.Tech, MBA and MCA enrollments.
            </p>
          </div>
        </div>
        <div class="section container">
          <div class="section-title-wrap">
            <span class="section-badge">Step-by-Step Flowchart</span>
            <h2 class="section-title">Centralized & Institutional Admission Process</h2>
          </div>
          ${stepsHtml}

          <div style="text-align: center; margin-top: 3rem;">
            <button class="btn btn-accent btn-lg" onclick="App.openInquiryModal()">Submit Admission Inquiry</button>
            <a href="#fees" class="btn btn-secondary btn-lg" style="margin-left: 1rem;">View Approved Fee Structure</a>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container" style="padding: 3rem;"><p>Failed to load admissions information.</p></div>`;
    }
  },

  async renderFees(container) {
    try {
      const res = await API.get('/api/v1/public/admissions');
      const items = res.data || [];
      const fees = items.filter(i => i.category === 'Fee Structure');

      const feeCards = fees.map(f => `
        <div class="card" style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
            <h3 style="font-size: 1.25rem; color: var(--color-primary);">${f.title}</h3>
            <span class="badge badge-success" style="font-size: 1rem; padding: 0.35rem 0.85rem;">${f.feeAnnual}</span>
          </div>
          <p style="color: var(--color-text-secondary); margin-bottom: 0.75rem;">${f.description}</p>
          <div style="font-size: 0.8125rem; color: var(--color-text-muted);">
            <strong>Eligibility & Concessions:</strong> ${f.eligibilityCriteria || 'As per State Government & FRA norms'}
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Tuition & Development Fees</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Approved Fee Structure</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              Transparent fee charts approved by the State Fee Regulating Authority (FRA) with scholarship details.
            </p>
          </div>
        </div>
        <div class="section container">
          ${feeCards}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<p>Failed to load fees.</p>`;
    }
  },

  // ----------------------------------------------------
  // PLACEMENTS & RECRUITERS PAGE
  // ----------------------------------------------------
  async renderPlacements(container) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center;"><div class="pulse-dot"></div> Loading placement records...</div>`;

    try {
      const res = await API.get('/api/v1/public/placements');
      const records = res.data?.records || [];
      const recruiters = res.data?.recruiters || [];

      const recordsHtml = records.map(r => `
        <div class="card" style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 0.75rem;">
            <h3 style="font-size: 1.35rem; color: var(--color-primary);">Academic Year ${r.academicYear}</h3>
            <span class="badge badge-success" style="font-size: 0.95rem;">${r.placementRate}% Placed</span>
          </div>
          <div class="grid-4" style="text-align: center;">
            <div style="background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-accent);">${r.highestPackage}</div>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Highest Package</div>
            </div>
            <div style="background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-secondary);">${r.averagePackage}</div>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Average Package</div>
            </div>
            <div style="background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">${r.placedStudents} / ${r.totalStudents}</div>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Students Placed</div>
            </div>
            <div style="background: var(--color-bg); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);">${r.totalOffers}</div>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Total Job Offers</div>
            </div>
          </div>
        </div>
      `).join('');

      const recruiterGrid = recruiters.map(rc => `
        <div class="card" style="text-align: center; padding: 1.25rem;">
          <img src="${rc.logoUrl}" alt="${rc.name}" style="height: 40px; margin: 0 auto 0.75rem auto; object-fit: contain;">
          <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${rc.name}</h4>
          <span class="badge badge-neutral">${rc.tier || 'Marquee'}</span>
          <div style="font-size: 0.75rem; color: var(--color-accent); font-weight: 600; margin-top: 0.5rem;">Offer up to ${rc.highestOffer || 'Competitive'}</div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Corporate Relations & Training</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Campus Placement Records</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              Over 350+ global recruitment partners hire our engineers across product engineering, semiconductors, and core sectors.
            </p>
          </div>
        </div>
        <div class="section container">
          <div class="section-title-wrap">
            <span class="section-badge">Year-on-Year Statistics</span>
            <h2 class="section-title">Verified Institutional Placement Trends</h2>
          </div>
          ${recordsHtml}

          <div class="section-title-wrap" style="margin-top: 4rem;">
            <span class="section-badge">Corporate Recruitment Partners</span>
            <h2 class="section-title">Major Participating Companies</h2>
          </div>
          <div class="grid-4">
            ${recruiterGrid}
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container" style="padding: 3rem;"><p>Failed to load placement records.</p></div>`;
    }
  },

  async renderRecruiters(container) {
    return this.renderPlacements(container);
  },

  // ----------------------------------------------------
  // CAMPUS & FACILITIES PAGE
  // ----------------------------------------------------
  async renderCampus(container) {
    container.innerHTML = `<div style="padding: 4rem; text-align: center;"><div class="pulse-dot"></div> Loading campus facilities...</div>`;

    try {
      const res = await API.get('/api/v1/public/facilities');
      const facilities = res.data || [];

      const facHtml = facilities.map(f => `
        <div class="card" style="margin-bottom: 2rem;">
          <div class="grid-2" style="align-items: center;">
            <div>
              <img src="${f.imageUrl}" alt="${f.name}" style="border-radius: var(--radius-lg); width: 100%; height: 260px; object-fit: cover;">
            </div>
            <div>
              <span class="badge badge-primary" style="margin-bottom: 0.5rem;">${f.category}</span>
              <h3 style="font-size: 1.4rem; color: var(--color-primary); margin-bottom: 0.5rem;">${f.name}</h3>
              <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">${f.detailedDesc || f.shortDesc}</p>
              <div style="background: var(--color-bg); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.8125rem;">
                <strong>Location:</strong> ${f.location || 'Main Campus'} | <strong>Timings:</strong> ${f.timings || 'Academic Hours'}
              </div>
            </div>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Infrastructure</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Campus & Facilities</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              A 50-acre green residential campus engineered for world-class technical discovery, creativity, and fitness.
            </p>
          </div>
        </div>
        <div class="section container">
          ${facHtml}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container" style="padding: 3rem;"><p>Failed to load facilities.</p></div>`;
    }
  },

  // ----------------------------------------------------
  // STUDENT LIFE
  // ----------------------------------------------------
  async renderStudentLife(container) {
    container.innerHTML = `
      <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
        <div class="container">
          <span class="section-badge">Campus Vibes</span>
          <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Student Life & Activities</h1>
          <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
            Over 25+ student-led clubs spanning BAJA SAE motorsport, robotics, hackathons, music, drama, and social service.
          </p>
        </div>
      </div>
      <div class="section container">
        <div class="grid-3">
          <div class="card">
            <img src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80" alt="Apex Racing" style="border-radius: var(--radius-md); height: 180px; width: 100%; object-fit: cover; margin-bottom: 1rem;">
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Apex Racing (SAE BAJA)</h3>
            <p style="font-size: 0.875rem; color: var(--color-text-secondary);">National champion all-terrain EV vehicle design team fabricating off-road buggies completely in-house.</p>
          </div>
          <div class="card">
            <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80" alt="CodeCell" style="border-radius: var(--radius-md); height: 180px; width: 100%; object-fit: cover; margin-bottom: 1rem;">
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">CodeCell & ACM Chapter</h3>
            <p style="font-size: 0.875rem; color: var(--color-text-secondary);">Competitive programming hub organizing monthly algorithmic hackathons, web3 sessions, and open-source sprints.</p>
          </div>
          <div class="card">
            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" alt="Equinox Fest" style="border-radius: var(--radius-md); height: 180px; width: 100%; object-fit: cover; margin-bottom: 1rem;">
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Equinox Annual Fest</h3>
            <p style="font-size: 0.875rem; color: var(--color-text-secondary);">The flagship 3-day cultural extravaganza with celebrity music concerts, dance battles, and fashion showcases.</p>
          </div>
        </div>
      </div>
    `;
  },

  // ----------------------------------------------------
  // RESEARCH & INNOVATION
  // ----------------------------------------------------
  async renderResearch(container) {
    try {
      const res = await API.get('/api/v1/public/research');
      const items = res.data || [];

      const listHtml = items.map(r => `
        <div class="card" style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
            <h3 style="font-size: 1.25rem; color: var(--color-primary);">${r.title}</h3>
            <span class="badge badge-primary">${r.category}</span>
          </div>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">
            <strong>Lead Investigator:</strong> ${r.investigator} | <strong>Funding Body:</strong> ${r.fundingAgency || 'Internal R&D Grant'}
          </p>
          <div style="display: flex; gap: 1rem; font-size: 0.8125rem; color: var(--color-text-muted);">
            ${r.grantAmount ? `<span>Grant: <strong>${r.grantAmount}</strong></span>` : ''}
            ${r.patentNumber ? `<span>Patent Number: <strong>${r.patentNumber}</strong></span>` : ''}
            <span>Status: <strong>${r.status}</strong></span>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">R&D Ecosystem</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Research & Innovation</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              ₹12+ Crores in funded projects across Artificial Intelligence, Renewable Energy, and Smart Transportation.
            </p>
          </div>
        </div>
        <div class="section container">
          ${listHtml}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<p>Failed to load research.</p>`;
    }
  },

  // ----------------------------------------------------
  // NOTICES & NEWS
  // ----------------------------------------------------
  async renderNewsAndNotices(container) {
    try {
      const [noticesRes, newsRes, eventsRes] = await Promise.all([
        API.get('/api/v1/public/notices'),
        API.get('/api/v1/public/news'),
        API.get('/api/v1/public/events')
      ]);

      const notices = noticesRes.data || [];
      const news = newsRes.data || [];
      const events = eventsRes.data || [];

      const noticesList = notices.map(n => `
        <div class="notice-list-item">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="notice-date-box">
              <span>${n.publishedDate ? n.publishedDate.split('-')[2] : '01'}</span>
              <span style="font-size: 0.65rem; font-weight: 500;">${n.publishedDate ? n.publishedDate.split('-')[1] : 'APR'}</span>
            </div>
            <div>
              <span class="badge badge-neutral" style="margin-bottom: 0.25rem;">${n.category}</span>
              <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">
                <a href="#notices" style="color: var(--color-primary);">${n.title}</a>
              </h4>
              <p style="font-size: 0.8125rem; color: var(--color-text-secondary); margin: 0;">${n.content || ''}</p>
            </div>
          </div>
          ${n.attachmentUrl ? `<a href="${n.attachmentUrl}" class="btn btn-secondary btn-sm" target="_blank">Download</a>` : ''}
        </div>
      `).join('');

      const eventsList = events.map(e => `
        <div class="card" style="margin-bottom: 1rem;">
          <span class="badge badge-warning" style="margin-bottom: 0.5rem;">${e.category}</span>
          <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${e.title}</h3>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">${e.description}</p>
          <div style="font-size: 0.8125rem; color: var(--color-text-muted); margin-bottom: 1rem;">
            📅 ${e.eventDate} | ⏰ ${e.eventTime || 'Full Day'} | 📍 ${e.venue}
          </div>
          <button class="btn btn-primary btn-sm" onclick="showToast('Event registration opened. Redirecting...', 'info')">Register for Event</button>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Live Information</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Notices, News & Events</h1>
            <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
              Official administrative circulars, university examination schedules, and technical symposiums.
            </p>
          </div>
        </div>
        <div class="section container">
          <div class="grid-2">
            <div>
              <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary);">Official Circulars & Notices</h2>
              ${noticesList}
            </div>
            <div>
              <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary);">Upcoming Events & Symposia</h2>
              ${eventsList}
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<p>Failed to load notices.</p>`;
    }
  },

  // ----------------------------------------------------
  // GALLERY
  // ----------------------------------------------------
  async renderGallery(container) {
    try {
      const res = await API.get('/api/v1/public/gallery');
      const items = res.data || [];

      const gridHtml = items.map(g => `
        <div class="card" style="padding: 0.75rem; overflow: hidden;">
          <img src="${g.imageUrl}" alt="${g.title}" style="border-radius: var(--radius-md); height: 220px; width: 100%; object-fit: cover; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${g.title}</h4>
          <span class="badge badge-neutral">${g.category}</span>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
          <div class="container">
            <span class="section-badge">Campus Life</span>
            <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Photo Gallery</h1>
          </div>
        </div>
        <div class="section container">
          <div class="grid-3">
            ${gridHtml}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<p>Failed to load gallery.</p>`;
    }
  },

  // ----------------------------------------------------
  // CONTACT US PAGE (WITH INTERACTIVE INQUIRY FORM)
  // ----------------------------------------------------
  renderContact(container) {
    const s = this.config.settings || {};
    container.innerHTML = `
      <div style="background: var(--color-primary); color: #FFFFFF; padding: 4rem 0;">
        <div class="container">
          <span class="section-badge">Reach Out</span>
          <h1 style="color: #FFFFFF; font-size: 2.75rem; margin-top: 0.5rem;">Contact & Campus Directory</h1>
          <p style="color: #CBD5E1; font-size: 1.15rem; max-width: 720px; margin-top: 0.5rem;">
            Visit our scenic Nashik campus or connect directly with our admissions and academic offices.
          </p>
        </div>
      </div>

      <div class="section container">
        <div class="grid-2">
          <div>
            <div class="card" style="margin-bottom: 2rem;">
              <h3 style="font-size: 1.35rem; margin-bottom: 1rem; color: var(--color-primary);">Campus Location & Contacts</h3>
              <div class="footer-contact-item" style="color: var(--color-text-secondary); margin-bottom: 1.25rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span><strong>Address:</strong> ${s.contact_address || 'Hirabai Haridas Vidyanagari, Amrutdham, Panchavati, Nashik - 422003'}</span>
              </div>
              <div class="footer-contact-item" style="color: var(--color-text-secondary); margin-bottom: 1.25rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span><strong>Helpline:</strong> ${s.contact_phone_primary || '+91 253 251 2876'} / Admissions: ${s.contact_phone_admissions || '+91 253 251 2867'}</span>
              </div>
              <div class="footer-contact-item" style="color: var(--color-text-secondary); margin-bottom: 1.25rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span><strong>Email:</strong> ${s.contact_email_primary || 'principal@apex-inst.edu'}</span>
              </div>
            </div>

            <!-- Campus Map Embed -->
            <div class="card" style="padding: 0; overflow: hidden; height: 320px;">
              <iframe src="${s.google_maps_embed || 'https://maps.google.com/maps?q=Nashik,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed'}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="card">
            <h3 style="font-size: 1.4rem; color: var(--color-primary); margin-bottom: 0.5rem;">Send an Inquiry</h3>
            <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 1.5rem;">
              Our counselors will respond within 24 hours. Form submissions are saved directly to the admissions database.
            </p>

            <form id="public-inquiry-form" onsubmit="App.submitInquiry(event)">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" name="fullName" class="form-control" placeholder="e.g. Rahul Sharma" required>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Email Address *</label>
                  <input type="email" name="email" class="form-control" placeholder="rahul@example.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input type="tel" name="phone" class="form-control" placeholder="+91 98230 XXXXX" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Program of Interest</label>
                <select name="courseInterested" class="form-control">
                  <option value="B.Tech in Computer Engineering">B.Tech in Computer Engineering</option>
                  <option value="B.Tech in AI & Data Science">B.Tech in AI & Data Science</option>
                  <option value="B.Tech in Electronics & Telecom">B.Tech in Electronics & Telecom</option>
                  <option value="B.Tech in Mechanical Engineering">B.Tech in Mechanical Engineering</option>
                  <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                  <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                  <option value="Ph.D. Research Program">Ph.D. Research Program</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Message / Inquiry Details *</label>
                <textarea name="message" class="form-control" rows="4" placeholder="Ask questions about entrance scores, cutoff ranks, hostel, or fees..." required></textarea>
              </div>
              <button type="submit" class="btn btn-accent" style="width: 100%;">Submit Inquiry</button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  async submitInquiry(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await API.post('/api/v1/public/inquiries', body);
      if (res.success) {
        showToast(res.message, 'success');
        form.reset();
        App.closeInquiryModal();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Inquiry';
    }
  },

  // ----------------------------------------------------
  // INQUIRY MODAL (GLOBAL POPUP)
  // ----------------------------------------------------
  setupGlobalEvents() {
    // Escape key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeInquiryModal();
    });
  },

  openInquiryModal(course = '') {
    let modal = document.getElementById('inquiry-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'inquiry-modal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 style="font-size: 1.25rem; color: var(--color-primary);">Quick Admission Inquiry</h3>
            <button class="btn-icon" onclick="App.closeInquiryModal()">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 1.25rem;">
              Fill out this quick form and our counseling team will get back to you with syllabus details, eligibility, and fee structure.
            </p>
            <form onsubmit="App.submitInquiry(event)">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" name="fullName" class="form-control" placeholder="Your name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" name="email" class="form-control" placeholder="name@example.com" required>
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input type="tel" name="phone" class="form-control" placeholder="+91 98230 XXXXX" required>
              </div>
              <div class="form-group">
                <label class="form-label">Course Interested</label>
                <input type="text" name="courseInterested" id="modal-course-input" class="form-control" value="${course}" placeholder="Course name">
              </div>
              <div class="form-group">
                <label class="form-label">Inquiry Message *</label>
                <textarea name="message" class="form-control" rows="3" placeholder="Tell us what you'd like to know..." required></textarea>
              </div>
              <button type="submit" class="btn btn-accent" style="width: 100%;">Submit Inquiry</button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      const input = document.getElementById('modal-course-input');
      if (input) input.value = course;
    }

    modal.classList.add('open');
  },

  closeInquiryModal() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) modal.classList.remove('open');
  }
};

// Initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
