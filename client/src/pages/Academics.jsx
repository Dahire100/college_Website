import React from 'react';
import { 
  BookOpen, Award, GraduationCap, CheckCircle2, ArrowRight, Layers, 
  Clock, ShieldCheck, Compass, FileText, Cpu, Briefcase 
} from 'lucide-react';

export default function Academics({ onNavigate, onOpenInquiry }) {
  const schools = [
    {
      name: 'School of Computer Science & Artificial Intelligence',
      departments: ['Computer Engineering', 'AI & Data Science', 'Computer Applications (MCA)'],
      dean: 'Dr. K. N. Nandurkar, Ph.D. (IITB)',
      thrust: 'Machine Learning, Distributed Cloud Systems, Cybersecurity, Full-Stack Software Engineering.',
      code: 'SCAI'
    },
    {
      name: 'School of Mechanical, Aerospace & Automation Engineering',
      departments: ['Mechanical Engineering', 'Robotics & Automation'],
      dean: 'Dr. M. V. Deshpande, Ph.D.',
      thrust: 'Autonomous Vehicles, EV Battery Design, Industry 4.0 Robotics, Additive Manufacturing.',
      code: 'SMAE'
    },
    {
      name: 'School of Electrical, Electronics & Communication',
      departments: ['Electronics & Telecommunication', 'Electrical Engineering'],
      dean: 'Dr. P. J. Kulkarni, Ph.D.',
      thrust: 'VLSI Chip Design, 5G Wireless Networks, Embedded IoT Systems, Power Electronics.',
      code: 'SEEC'
    },
    {
      name: 'School of Management Studies & Applied Sciences',
      departments: ['Management Studies (MBA)', 'Applied Sciences & Humanities'],
      dean: 'Dr. R. K. Sharma, Ph.D.',
      thrust: 'Technology Management, Operations Analytics, Financial Engineering, STEM Foundations.',
      code: 'SMAS'
    }
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Header Banner (COEP & MIT-WPU Inspired) */}
      <section style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #0F3860 100%)',
        color: '#FFFFFF',
        padding: '5rem 0 4.5rem 0',
        borderBottom: '4px solid var(--color-accent)',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{ maxWidth: '840px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(217, 119, 6, 0.22)',
              color: '#FCD34D',
              border: '1px solid rgba(217, 119, 6, 0.45)',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              <BookOpen size={15} /> Autonomous Academic Curriculum & Framework
            </div>
            <h1 style={{ fontSize: '2.85rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem 0', color: '#FFFFFF' }}>
              Autonomous Academic Excellence & NEP 2020 Architecture
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
              Our industry-tailored autonomous curriculum combines outcome-based learning, interdisciplinary minor degrees, and mandatory six-month industry capstones to nurture global problem solvers.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => onNavigate('programs')}>
                Explore Degree Programs <ArrowRight size={16} />
              </button>
              <button className="btn btn-secondary" onClick={() => onNavigate('departments')}>
                View Departments
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Academic Pillars */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
            Core Academic Pillars & Innovations
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748B' }}>
            Accredited by NAAC with A++ Grade (CGPA 3.65) and NBA Tier-1 Washington Accord benchmark.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Choice-Based Credit System</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Students customize up to 25% of their academic coursework through interdisciplinary professional electives, open university tracks, and online MOOCs (NPTEL/Swayam).
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Honors & Minor Specializations</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Earn specialized minors in Artificial Intelligence, Cybersecurity, Financial Technology, or Electric Vehicles alongside your primary B.Tech major degree.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Briefcase size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Semester-Long Industry Capstone</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Entire 8th semester dedicated to full-time corporate internships at leading multinational companies, R&D centers, or national defense laboratories with stipend support.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Schools of Study (COEP / MIT-WPU Structure) */}
      <div className="container" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Academic Schools of Study
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0.25rem 0 0' }}>
              Interdisciplinary faculties driving collaborative research and curriculum excellence.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('departments')}>
            View All 8 Departments <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
          {schools.map(school => (
            <div key={school.code} style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              padding: '1.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {school.code}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Dean: <strong>{school.dean}</strong></span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem', lineHeight: 1.35 }}>
                {school.name}
              </h3>

              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1rem' }}>
                <strong>Research Thrust:</strong> {school.thrust}
              </p>

              <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Constituent Departments:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {school.departments.map(dept => (
                    <span key={dept} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', color: '#1E293B', fontWeight: 500 }}>
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onNavigate('programs')}
              >
                View Academic Programs in this School
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Examination & Grading Framework (COEP Style) */}
      <div className="container" style={{ marginTop: '4rem' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ maxWidth: '800px' }}>
            <span className="pill-badge-blue" style={{ marginBottom: '0.75rem' }}>EVALUATION STANDARDS</span>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0 0.75rem' }}>
              Continuous Assessment & Relative Grading Framework
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Under autonomous ordinances, assessment is divided into 40% Continuous Internal Evaluation (CIE: quizzes, laboratory rubrics, mid-term examinations) and 60% Semester End Examination (SEE). Performance is mapped to a 10-point credit scale with relative grading benchmarks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <strong style={{ fontSize: '1.1rem', color: '#2563EB', display: 'block' }}>SGPA / CGPA</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>10-Point Absolute & Relative Scale</span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <strong style={{ fontSize: '1.1rem', color: '#059669', display: 'block' }}>160 Credits</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Total 4-Year B.Tech Degree Requirement</span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <strong style={{ fontSize: '1.1rem', color: '#D97706', display: 'block' }}>+20 Credits</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>For Honors / Minor Degree Path</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
