import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile, getInquiryOptions } from '../content/institutionProfile';

export default function Contact({ settings = {}, onToast }) {
  const profile = getInstitutionProfile(settings);
  const inquiryOptions = getInquiryOptions([], profile);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    courseInterested: inquiryOptions[0] || 'General Inquiry',
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
        setFormData({ fullName: '', email: '', phone: '', courseInterested: inquiryOptions[0] || 'General Inquiry', message: '' });
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
            Contact and Campus Directory
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.2rem', maxWidth: '720px', marginTop: '0.5rem' }}>
            Connect with the admissions desk, campus office, or send a general inquiry.
          </p>
        </div>
      </div>

      <div className="section container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          <div>
            <div className="academic-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>Campus Information</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                <MapPin size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <strong>Campus Address:</strong>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {settings.contact_address || 'Campus address can be edited by the administrator.'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                <Phone size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <strong>Helpline Numbers:</strong>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {settings.contact_phone_primary || '+91 20 2420 2180'} / Admissions: {settings.contact_phone_admissions || '+91 20 2420 2115'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Mail size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <strong>Official Email:</strong>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {settings.contact_email_primary || 'principal@example.edu'}
                  </p>
                </div>
              </div>
            </div>

            <div className="academic-card" style={{ padding: 0, overflow: 'hidden', height: '300px' }}>
              <iframe
                src={settings.google_maps_embed || 'https://maps.google.com/maps?q=India&t=&z=4&ie=UTF8&iwloc=&output=embed'}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Campus Location"
              />
            </div>
          </div>

          <div className="academic-card">
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Direct Inquiry</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Submissions are stored in the admissions pipeline and routed to the campus team.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input type="text" className="input-control" placeholder="e.g. Anand Kulkarni" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Email Address *</label>
                  <input type="email" className="input-control" placeholder="anand@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number *</label>
                  <input type="tel" className="input-control" placeholder="+91 98230 XXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Inquiry Type</label>
                <select className="input-control" value={formData.courseInterested} onChange={(e) => setFormData({ ...formData, courseInterested: e.target.value })}>
                  {inquiryOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Inquiry Message *</label>
                <textarea className="input-control" rows="4" placeholder="Ask about admissions, program details, fees, hostel, or campus visit." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
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
