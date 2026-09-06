# Modern Autonomous College Web Portal & CMS

An institutional-grade, full-stack college web portal and content management system (CMS) tailored for modern engineering and research institutions. Designed with academic heritage aesthetics (Oxford Navy `#002147` and Academic Gold accents), responsive layout, and a real-time admin management suite.

---

## 🏛️ Features

- **Institutional Identity Bar**: Official accreditation tags (UGC Autonomous, NAAC A++, NBA Tier-1), admissions helplines, dynamic college branding & logo uploads.
- **13 Core Academic Navigation Stages**:
  - Home, About Us, Academics, Departments, Programs, Admissions, Campus Infrastructure, Placements, Research & Patents, Student Life & Clubs, News & Events, Visual Gallery, and Contact Directory.
- **Page Studio & Modular CMS**:
  - Add and customize dynamic pages directly from the admin dashboard.
  - Modular subsections with split 50/50 layouts, full-width feature banners, metric grids, and checklists.
  - Drag-and-drop / computer file upload for banners, event posters, circulars, and recruiter logos.
- **Academic Departments & HOD Profiles**:
  - Complete engineering department profiles with HOD credentials, intake metrics, lab infrastructure, vision/mission, and syllabus outlines.
- **Interactive Admissions & Counseling Inquiries**:
  - Prospective student inquiries submitted directly to MongoDB Atlas with counselor tracking in the admin portal.
- **Centralized Global Settings**:
  - Single place to customize college name, address, contact helplines, Google Maps embed with live preview, social media profiles, and live broadcast strips.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Pure CSS (modular variables, responsive grids, academic typography)
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB Atlas with dual-layer fallback storage
- **Authentication**: JWT token authentication with bcrypt password hashing

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Dahire100/college_Website.git
cd college_Website
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```

### 3. Install Dependencies
Install server and client dependencies:
```bash
npm install
cd client && npm install && cd ..
```

### 4. Build Client
```bash
cd client
npm run build
cd ..
```

### 5. Start Server
```bash
npm start
```

Visit:
- **Public Portal**: `http://localhost:3000/`
- **Admin CMS**: `http://localhost:3000/#admin`
- **Default Admin Credentials**: `admin` / `Admin@123`

---

## 📄 License
This project is licensed under the MIT License.
