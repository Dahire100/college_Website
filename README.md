# 🎓 Modern Institutional Web Portal & Multi-Tenant CMS (Enterprise Edition)

A turnkey, enterprise-grade college web portal and multi-tenant Content Management System (CMS). Built for modern universities, engineering institutes, multi-campus educational trusts, pharmacy colleges, and schools.

Featuring academic prestige styling, full mobile responsiveness, a powerful **College Admin CMS (`/admin`)**, and a **SuperAdmin Cloud Portal (`/superadmin`)**.

---

## 💎 Key Features & Selling Points

### 1. 🏛️ 9 Instant Institutional Profiles (1-Click Switcher)
Easily rebrand the entire platform for any education vertical in one click from the Admin Dashboard:
- ⚙️ **Engineering & Technology Institute** (B.Tech, M.Tech, Ph.D., NIRF/NBA accreditations)
- 💊 **Pharmacy College** (D.Pharm, B.Pharm, M.Pharm, PCI/AICTE compliance)
- 📐 **Polytechnic Institute** (Diplomas, technical trades, state board curriculum)
- 📊 **Management & Business School** (MBA, BBA, MCA, corporate placement links)
- ⚖️ **Law College** (BA LLB, LLM, moot courts, bar council compliance)
- 📚 **Arts, Science & Commerce College** (Multi-disciplinary undergraduate and postgraduate degrees)
- 🏛️ **Group of Institutions / University Trust** (Multi-college umbrella with sub-institution selector)
- 🎒 **School & Junior College** (K-12, state/CBSE boards, admissions roadmap)
- 🎓 **General Higher Education Portal**

### 2. ⚡ Dynamic Page & Subpage Studio (CMS)
- Full visual control over **custom pages and nested subpages**.
- Reorderable homepage sections (Hero banners, notices ticker, recruiter carousel, testimonials, facilities).
- High-priority **Top Header Announcement Marquee Bar (Tier 0 Ticker)**.
- Drag-and-drop / local file upload for banners, logos, faculty photos, and PDF circulars.

### 3. 📥 Student Inquiry CRM & Admissions Leads
- Dedicated floating and modal student inquiry forms.
- Admin inbox with real-time counters, status workflows (*New, Contacted, Enrolled, Closed*), and direct response tracking.

### 4. 🔍 Global Quick Command Palette (`Ctrl+K` / `Cmd+K`)
- Instant search indexing across all 16 CMS sections, leads, pages, departments, and course programs.

### 5. 🛡️ Enterprise Security & Multi-Tenant Isolation
- **Tenant Partitioning**: Isolated database scoping and media directory storage (`/uploads/:tenantId/`).
- **Cryptographic JWT Sessions**: Separate signing secrets for Tenant Admin and SuperAdmin.
- **Brute-Force Protection**: Rate limiting on login and contact forms.
- **Defense in Depth**: Helmet HTTP security headers (CSP, X-Content-Type-Options, Frameguard), NoSQL injection hardening, and file upload extension whitelisting.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Pure CSS (Zero third-party CSS bloat, fully customizable design system)
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB Atlas with local fallback engine
- **Security**: Bcrypt password hashing, JWT authentication, Express Rate Limit, Helmet

---

## 🚀 Quick Setup & Deployment

### 1. Clone & Install
```bash
git clone https://github.com/Dahire100/college_Website.git
cd college_Website
npm install
npm --prefix client install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Build & Run
```bash
npm --prefix client run build
npm start
```

### 4. Access Portals
- 🌐 **Public Website**: `http://localhost:3000/`
- ⚙️ **College Admin CMS**: `http://localhost:3000/admin` 
- 🛡️ **SuperAdmin Cloud Portal**: `http://localhost:3000/superadmin`

---

## 🧪 Testing & Verification
```bash
# Run comprehensive system verification tests
node test_suite.js
```

---

## 📄 License
Licensed under the MIT License — Commercial & Client Use Ready.
