import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function Campus({ settings = {} }) {
  const profile = getInstitutionProfile(settings);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/v1/public/facilities');
        setFacilities(res.data || []);
      } catch (e) {
        console.error('Failed to load facilities', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0B1E36 0%, #153A6B 100%)', color: '#FFFFFF', padding: 'clamp(3rem, 6vw, 4.5rem) 0', borderBottom: '4px solid #D97706' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)' }}>
            {profile.campusLabel}
          </span>
          <h1 className="page-hero-title" style={{ marginTop: '0.75rem' }}>
            Campus and Facilities
          </h1>
          <p className="page-hero-subtitle" style={{ maxWidth: '720px', marginTop: '0.5rem' }}>
            Use this page for classrooms, labs, libraries, hostels, transport, and student services.
          </p>
        </div>
      </div>

      <div className="section container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading facilities...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {facilities.map(f => (
              <div key={f._id || f.id} className="academic-card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.75rem', alignItems: 'center' }}>
                  <div>
                    <img src={f.imageUrl} alt={f.name} style={{ width: '100%', height: 'auto', maxHeight: '260px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  </div>
                  <div>
                    <span className="pill-badge-blue">{f.category}</span>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{f.name}</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>{f.detailedDesc || f.shortDesc}</p>
                    <div style={{ background: 'var(--color-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                      <strong>Location:</strong> {f.location || 'Campus area'} | <strong>Hours:</strong> {f.timings || 'Full Day'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
