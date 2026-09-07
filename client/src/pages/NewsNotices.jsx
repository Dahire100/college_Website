import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Search } from 'lucide-react';
import { api } from '../services/api';
import { getInstitutionProfile } from '../content/institutionProfile';

export default function NewsNotices({ settings = {} }) {
  const profile = getInstitutionProfile(settings);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [nRes, eRes] = await Promise.all([
          api.get('/api/v1/public/notices'),
          api.get('/api/v1/public/events')
        ]);
        setNotices(nRes.data || []);
        setEvents(eRes.data || []);
      } catch (e) {
        console.error('Failed to load notices', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredNotices = notices.filter(n => {
    const matchesCat = categoryFilter === 'All' || (n.category && n.category.toLowerCase() === categoryFilter.toLowerCase());
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.content && n.content.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      <div style={{ background: 'var(--color-primary)', color: '#FFFFFF', padding: '4.5rem 0' }}>
        <div className="container">
          <span className="pill-badge" style={{ background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', borderColor: 'rgba(217, 119, 6, 0.4)' }}>
            OFFICIAL UPDATES
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: '2.75rem', marginTop: '0.75rem' }}>
            Notices, Circulars, and Events
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.2rem', maxWidth: '720px', marginTop: '0.5rem' }}>
            Administrative notices, admissions alerts, and upcoming events for the current institution profile.
          </p>
        </div>
      </div>

      <div className="section container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>Official Notices</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', 'Admissions', 'Examinations', 'Events'].map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} className={`btn ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}>{cat}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <p>Loading notices...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredNotices.map(n => (
                  <div key={n._id || n.id} className="academic-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'var(--color-secondary-light)', color: 'var(--color-secondary)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', minWidth: '60px', fontWeight: 700 }}>
                      <div style={{ fontSize: '1.1rem', lineHeight: 1 }}>{n.publishedDate ? n.publishedDate.split('-')[2] : '10'}</div>
                      <div style={{ fontSize: '0.65rem' }}>{n.publishedDate ? n.publishedDate.split('-')[1] : 'APR'}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="pill-badge-blue" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', marginBottom: '0.35rem' }}>{n.category} {n.isPinned ? 'Pinned' : ''}</span>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', marginTop: '0.25rem', marginBottom: '0.35rem' }}>{n.title}</h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Upcoming Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {events.map(ev => (
                <div key={ev._id || ev.id} className="academic-card" style={{ padding: '1.5rem' }}>
                  <span className="pill-badge" style={{ marginBottom: '0.5rem' }}>{ev.category}</span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>{ev.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>{ev.description}</p>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>When: {ev.eventDate} | Where: {ev.venue}</div>
                  <button className="btn btn-primary btn-sm" onClick={() => alert('Event registration portal opened for ' + ev.title)}>
                    Register
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
