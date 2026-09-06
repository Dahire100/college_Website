import React, { useState, useEffect } from 'react';
import { 
  Microscope, Award, FileText, Cpu, Zap, Lightbulb, Rocket, 
  CheckCircle2, ExternalLink, ArrowRight, ShieldCheck, Download, Users 
} from 'lucide-react';
import { api } from '../services/api';

export default function Research({ onNavigate, onOpenInquiry }) {
  const [subsections, setSubsections] = useState([]);
  const [activeTab, setActiveTab] = useState('coe');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResearch() {
      try {
        const res = await api.get('/api/v1/public/subsections?pageSlug=research');
        setSubsections(res.data || []);
      } catch (err) {
        console.error('Failed to load research data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResearch();
  }, []);

  const coeList = [
    {
      title: 'Center of Excellence in AI & Cyber-Physical Systems',
      established: '2021',
      sponsor: 'NVIDIA & DST Supported',
      focus: 'Deep learning vision architectures, autonomous drone surveillance, edge computing, natural language processing for vernacular languages.',
      equipment: 'NVIDIA DGX GPU Supercomputing Station, 40 Workstations with RTX GPUs, ROS2 Robotics Testbed.',
      pi: 'Dr. S. R. Patil, Professor & Dean (R&D)'
    },
    {
      title: 'Center for Electric Mobility & Clean Energy Storage',
      established: '2022',
      sponsor: 'ARAI & Industry Consortium',
      focus: 'Lithium-ion battery thermal management, BMS firmware design, motor drive inverters, fast charging infrastructure.',
      equipment: 'Bi-directional DC Power Supplies, Battery Cell Cyclers, Thermal Imaging Chambers, Hardware-in-the-Loop Simulators.',
      pi: 'Dr. P. J. Kulkarni, Head of Electrical Engineering'
    },
    {
      title: 'Center for Robotics & Industrial Automation',
      established: '2019',
      sponsor: 'KUKA & Siemens MoUs',
      focus: '6-Axis articulated arm manipulation, collaborative cobots, computer vision for pick-and-place, automated guided vehicles (AGVs).',
      equipment: 'KUKA Industrial KR-6 Robot, Universal Robots UR3e Cobot, 3D Laser Scanners, PLC SCADA Training Racks.',
      pi: 'Dr. M. V. Deshpande, Professor of Mechanical Engg'
    },
    {
      title: 'Advanced Materials & Micro-Manufacturing Lab',
      established: '2020',
      sponsor: 'DST-SERB Core Grant',
      focus: 'Additive manufacturing of superalloys, composite characterization, micro-EDM, nanocoatings for wear resistance.',
      equipment: 'Direct Metal Laser Sintering (DMLS) 3D Printer, Scanning Electron Microscope (SEM), Optical Profilometer.',
      pi: 'Dr. A. B. Joshi, Associate Dean'
    }
  ];

  const patentsList = [
    {
      title: 'Adaptive Dual-Loop Thermal Control System for High-Rate EV Battery Packs',
      applicationNo: '202421048291 A',
      filedDate: '2024',
      status: 'Published (Commercialization Phase)',
      inventors: 'Dr. P. J. Kulkarni, R. V. Shinde'
    },
    {
      title: 'Intelligent Edge-Vision Sensor for Autonomous Agricultural Yield Prediction',
      applicationNo: '202321039102 B',
      filedDate: '2023',
      status: 'Patent Granted',
      inventors: 'Dr. S. R. Patil, Sneha Mahajan'
    },
    {
      title: 'High-Torque Low-Loss Planetary Gearbox for Industrial Cobots',
      applicationNo: '202321018449 A',
      filedDate: '2023',
      status: 'Patent Granted',
      inventors: 'Dr. M. V. Deshpande, Kunal Joshi'
    },
    {
      title: 'Multispectral Micro-Fluidic Sensor for Rapid Water Toxicity Detection',
      applicationNo: '202221088412 A',
      filedDate: '2022',
      status: 'Published & Licensed',
      inventors: 'Dr. A. B. Joshi, Team MicroTech'
    }
  ];

  const grantsList = [
    {
      project: 'Development of AI-Powered UAV Swarm for Disaster Relief & Terrain Mapping',
      agency: 'DRDO - Defense Research & Development Organisation',
      amount: '₹48.5 Lakhs',
      duration: '2024 - 2026',
      status: 'Ongoing'
    },
    {
      project: 'Cryogenic Fluid Dynamics & Heat Exchanger Modeling for Launch Vehicles',
      agency: 'ISRO - Indian Space Research Organisation (Respond)',
      amount: '₹36.0 Lakhs',
      duration: '2023 - 2025',
      status: 'Ongoing'
    },
    {
      project: 'IoT Microgrid Energy Management System with Solid-State Transformer',
      agency: 'DST - Department of Science & Technology, GoI',
      amount: '₹62.0 Lakhs',
      duration: '2022 - 2025',
      status: 'Ongoing'
    },
    {
      project: 'Industry 4.0 Smart Factory Testbed with Digital Twin Integration',
      agency: 'AICTE - Research Promotion Scheme (RPS)',
      amount: '₹24.0 Lakhs',
      duration: '2023 - 2025',
      status: 'Ongoing'
    }
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. Header Banner (COEP & MIT-WPU Inspired) */}
      <section style={{
        background: 'linear-gradient(135deg, #0B1E36 0%, #153A6B 100%)',
        color: '#FFFFFF',
        padding: '5rem 0 4.5rem 0',
        borderBottom: '4px solid #D97706',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{ maxWidth: '850px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(217, 119, 6, 0.25)',
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
              <Microscope size={15} /> Research, Innovation & Entrepreneurship
            </div>
            <h1 style={{ fontSize: '2.85rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem 0', color: '#FFFFFF' }}>
              Pioneering High-Impact Research & Technological Frontiers
            </h1>
            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
              Empowering faculty scholars, industry partners, and student inventors across 4 dedicated Centers of Excellence, funded national defense projects, and patents commercialization.
            </p>

            {/* Quick Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FCD34D' }}>₹12.5+ Cr</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Active Research Grants</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>45+</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Patents Published & Filed</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399' }}>180+</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Scopus / SCI Indexed Papers</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60A5FA' }}>18</div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Active Industry & Defense MoUs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Research Navigation Tabs */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #E2E8F0',
          paddingBottom: '0.5rem',
          marginBottom: '2.5rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'coe', label: 'Centers of Excellence (CoE)', icon: <Cpu size={16} /> },
            { id: 'patents', label: 'Patents & IPR Portfolio', icon: <Award size={16} /> },
            { id: 'grants', label: 'Sponsored Grants (DRDO / ISRO)', icon: <Zap size={16} /> },
            { id: 'incubator', label: 'Startup Incubation (IIC)', icon: <Rocket size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? '#2563EB' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: CENTERS OF EXCELLENCE */}
        {activeTab === 'coe' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
                Multidisciplinary Centers of Excellence
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
                State-of-the-art specialized research labs equipped with cutting-edge industrial hardware for doctoral and undergraduate scholars.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '1.5rem' }}>
              {coeList.map((coe, idx) => (
                <div key={idx} style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {coe.sponsor}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Estd. {coe.established}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.85rem', lineHeight: 1.3 }}>
                      {coe.title}
                    </h3>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Research Thrust:</div>
                      <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: '0.25rem 0 0' }}>{coe.focus}</p>
                    </div>

                    <div style={{ marginBottom: '1.25rem', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Key Equipment & Facilities:</div>
                      <div style={{ fontSize: '0.82rem', color: '#1E293B', marginTop: '0.2rem', lineHeight: 1.4 }}>{coe.equipment}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Lead Investigator: <strong style={{ color: '#0F172A' }}>{coe.pi}</strong></div>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenInquiry?.(`Research Collaboration: ${coe.title}`)}>Collaborate</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PATENTS & IPR PORTFOLIO */}
        {activeTab === 'patents' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
                Intellectual Property & Patents Portfolio
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
                Patents granted and published by institute faculty and student inventors through our dedicated IPR Cell.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {patentsList.map((pat, idx) => (
                <div key={idx} style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{
                        background: pat.status.includes('Granted') ? '#ECFDF5' : '#FEF3C7',
                        color: pat.status.includes('Granted') ? '#059669' : '#D97706',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {pat.status}
                      </span>
                      <code style={{ fontSize: '0.78rem', color: '#2563EB', background: '#EFF6FF', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        App. No: {pat.applicationNo}
                      </code>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>
                      {pat.title}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      Inventors: <strong style={{ color: '#334155' }}>{pat.inventors}</strong> • Year: {pat.filedDate}
                    </div>
                  </div>

                  <button className="btn btn-secondary btn-sm" onClick={() => onOpenInquiry?.(`Patent Licensing: ${pat.applicationNo}`)}>
                    Inquire Licensing
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPONSORED GRANTS */}
        {activeTab === 'grants' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
                Funded National Research Projects & Grants
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
                High-priority research initiatives sponsored by government agencies and premier defense research organizations.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {grantsList.map((grant, idx) => (
                <div key={idx} style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', marginBottom: '0.25rem' }}>
                      {grant.agency}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.4rem' }}>
                      {grant.project}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Sanctioned Duration: {grant.duration} • Status: <span style={{ color: '#059669', fontWeight: 600 }}>{grant.status}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '140px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Grant Sanctioned</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{grant.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INCUBATOR & IIC */}
        {activeTab === 'incubator' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
                Institution's Innovation Council & Startup Incubation Hub
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
                Fostering undergraduate student entrepreneurs with seed funding, intellectual property advisory, and maker-space fabrication facilities.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Rocket size={24} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Seed Funding & Angel Network</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Up to ₹5.0 Lakhs in proof-of-concept prototyping grants for top collegiate innovations evaluated by industry venture capitalists.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Lightbulb size={24} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Rapid Prototyping Maker Space</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Equipped with 3D printers, laser cutters, PCB prototyping milling machines, and IoT hardware developer boards accessible 24/7.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1.75rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>Legal & IP Filing Sponsorship</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  100% financial and attorney assistance for patent drafting, prior-art search, and copyright filing for campus students and faculty.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Dynamic CMS Subsections (Controlled from Admin) */}
      {subsections.length > 0 && (
        <div className="container" style={{ marginTop: '3rem' }}>
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
              Additional Research Initiatives
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {subsections.map(sub => (
                <div key={sub._id || sub.id} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>{sub.badge || 'RESEARCH'}</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{sub.title}</h4>
                  </div>
                  {sub.content && <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0.5rem 0' }}>{sub.content}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
