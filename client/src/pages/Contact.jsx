import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Contact({ settings = {}, onToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    courseInterested: 'B.Tech in Computer Engineering',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/v1/public/inquiries', formData);
      if (res.success) {
        onToast(res.message || 'Inquiry submitted successfully!', 'success');
        setFormData({ fullName: '', email: '', phone: '', courseInterested: '', message: '' });
      }
    } catch (err) {
      onToast(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ background: 'var(--color-primary)', color: '#FFFFFF', padding: '4.5rem 0' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)' }}>
            REACH OUT
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.75rem', marginTop: '0.75rem' }}>
            Contact & Campus Directory
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.2rem', maxWidth: '720px', marginTop: '0.5rem' }}>
            Connect with our admissions helpline, visit the Nashik campus, or submit an admission counseling inquiry.
          </p>
        </div>
      </div>

      <div className="section container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          {/* Contact Details & Map */}
          <div>
            <div className="academic-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>Campus Information</h3>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                <MapPin size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <strong>Campus Address:</strong>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {settings.contact_address || 'Hirabai Haridas Vidyanagari, Amrutdham, Panchavati, Nashik - 422003, Maharashtra, India'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                <Phone size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <strong>Helpline Numbers:</strong>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {settings.contact_phone_primary || '+91 253 251 2876'} / Admissions: {settings.contact_phone_admissions || '+91 253 251 2867'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Mail size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <strong>Official Email:</strong>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {settings.contact_email_primary || 'principal@apex-inst.edu'}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="academic-card" style={{ padding: 0, overflow: 'hidden', height: '300px' }}>
              <iframe
                src={settings.google_maps_embed || 'https://maps.google.com/maps?q=Nashik,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed'}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Campus Location"
              />
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="academic-card">
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Direct Admission Inquiry</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Submissions are stored directly in the MongoDB Atlas admissions pipeline. Our counselors will reach out within 24 hours.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Student Full Name *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Anand Kulkarni"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Email Address *</label>
                  <input
                    type="email"
                    className="input-control"
                    placeholder="anand@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="input-control"
                    placeholder="+91 98230 XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Preferred Degree Program</label>
                <select
                  className="input-control"
                  value={formData.courseInterested}
                  onChange={(e) => setFormData({ ...formData, courseInterested: e.target.value })}
                >
                  <option value="B.Tech in Computer Engineering">B.Tech in Computer Engineering</option>
                  <option value="B.Tech in AI & Data Science">B.Tech in AI & Data Science</option>
                  <option value="B.Tech in Electronics & Telecom">B.Tech in Electronics & Telecom</option>
                  <option value="B.Tech in Mechanical Engineering">B.Tech in Mechanical Engineering</option>
                  <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                  <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                  <option value="Ph.D. Research Program">Ph.D. Research Program</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Inquiry Message *</label>
                <textarea
                  className="input-control"
                  rows="4"
                  placeholder="Ask questions regarding entrance cutoffs, hostel booking, or fee structure..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Submitting...' : <><Send size={16} /> Submit Online Inquiry</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
