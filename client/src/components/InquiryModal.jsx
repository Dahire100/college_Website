import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { api } from '../services/api';

export default function InquiryModal({ isOpen, onClose, defaultCourse = '', onToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    courseInterested: defaultCourse || 'B.Tech in Computer Engineering',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/v1/public/inquiries', formData);
      if (res.success) {
        onToast(res.message || 'Inquiry submitted successfully!', 'success');
        setFormData({ fullName: '', email: '', phone: '', courseInterested: '', message: '' });
        onClose();
      }
    } catch (err) {
      onToast(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>Admission Inquiry & Counseling</h3>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Submit your contact details and our admissions counseling team will assist you with eligibility norms, entrance cutoffs, and campus tour reservations.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Rahul Patil"
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
                  placeholder="rahul@example.com"
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
              <label className="input-label">Degree Program of Interest</label>
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
              <label className="input-label">Message / Specific Questions *</label>
              <textarea
                className="input-control"
                rows="3"
                placeholder="Ask about MHT-CET cutoff, hostel amenities, or fee installment options..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : <><Send size={16} /> Submit Admission Inquiry</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
