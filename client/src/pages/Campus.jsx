import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Layers, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function Campus() {
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
      <div style={{ background: 'var(--color-primary)', color: '#FFFFFF', padding: '4.5rem 0' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)' }}>
            CAMPUS INFRASTRUCTURE
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.75rem', marginTop: '0.75rem' }}>
            Campus & World-Class Facilities
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.2rem', maxWidth: '720px', marginTop: '0.5rem' }}>
            A 50-acre green residential academic campus designed for computational rigor, advanced robotics, and holistic recreation.
          </p>
        </div>
      </div>

      <div className="section container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><span className="pulse-dot" /> Loading facilities...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {facilities.map(f => (
              <div key={f._id || f.id} className="academic-card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                  <div>
                    <img
                      src={f.imageUrl}
                      alt={f.name}
                      style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  <div>
                    <span className="pill-badge-blue">{f.category}</span>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{f.name}</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>{f.detailedDesc || f.shortDesc}</p>

                    <div style={{ background: 'var(--color-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                      <strong>Location:</strong> {f.location || 'Central Academic Complex'} | <strong>Hours:</strong> {f.timings || 'Full Day'}
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
