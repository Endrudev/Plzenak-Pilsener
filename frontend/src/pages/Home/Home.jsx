import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../../components/EventCard/EventCard.jsx'
import { getEvents } from '../../lib/eventsApi.js'
import './Home.css'

const CATEGORIES = [
  { name: 'Gastro', icon: '🍺' },
  { name: 'Kultura', icon: '🎭' },
  { name: 'Hudba', icon: '🎵' },
  { name: 'Sport', icon: '⚽' },
  { name: 'Památky', icon: '⛪' },
  { name: 'Pro děti', icon: '🙂' },
]

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const heroEvent = events[0]
  const topEvents = events.filter(e => e.tags?.includes('TOP akce')).slice(0, 2)
  const nearestEvents = events.slice(0, 6)

  if (loading) {
    return <p id="home-loading">Načítání…</p>
  }

  return (
    <div id="home">

      {/* Hero — TODO: karusel je zatím statický (jen první akce), bez rotace/šipek/teček */}
      <section id="hero">
        {heroEvent && (
          <div id="hero-slide" className={heroEvent.imageUrl ? '' : 'hero-slide--fallback'} style={heroEvent.imageUrl ? { backgroundImage: `url(${heroEvent.imageUrl})` } : undefined}>
            <div id="hero-content">
              <div id="hero-card-badges">
                {heroEvent.tags?.[0] && <span className="hero-badge hero-badge--soft">{heroEvent.tags[0]}</span>}
                {heroEvent.url && <span className="hero-badge hero-badge--ticket">🎟 Koupit vstupenku</span>}
              </div>
              <h1 id="hero-title">{heroEvent.name}</h1>
              <div id="hero-meta">
                {heroEvent.date && <span>📅 {heroEvent.date}</span>}
                {heroEvent.location && <span>📍 {heroEvent.location}</span>}
              </div>
              <div id="hero-cta-row">
                <Link to={`/events/${heroEvent.id}`} id="hero-cta">Zobrazit →</Link>
                <span id="hero-counter">1 / 1</span>
              </div>
              <div id="hero-nav">
                <span id="hero-dots"><span className="hero-dot hero-dot--active" /></span>
                <button type="button" className="hero-arrow" aria-label="Předchozí">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button type="button" className="hero-arrow" aria-label="Další">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar — TODO: vstupy zatím nejsou propojené na žádný stav/filtrování */}
        <div id="filter-bar">
          <div id="filter-bar-row">
            <div id="filter-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Hledat akce v Plzni..." aria-label="Hledat akce" />
            </div>
            <div className="filter-select">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <select defaultValue="">
                <option value="" disabled>Kategorie</option>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <svg className="filter-select-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <div className="filter-select">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <select defaultValue="">
                <option value="" disabled>Místo</option>
              </select>
              <svg className="filter-select-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <div className="filter-select">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <select defaultValue="">
                <option value="" disabled>Datum</option>
              </select>
              <svg className="filter-select-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <button type="button" id="filter-search-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Vyhledat
            </button>
          </div>
          <div id="filter-bar-row-2">
            <div id="filter-chips">
              {['Kultura', 'Sport', 'Gastro', 'TOP akce'].map(c => (
                <button type="button" key={c} className="filter-chip">{c}</button>
              ))}
            </div>
            <div id="filter-view-toggle">
              <button type="button" className="view-toggle-btn view-toggle-btn--active">Seznam</button>
              <button type="button" className="view-toggle-btn">Mapa</button>
            </div>
          </div>
        </div>
      </section>

      {/* TOP akce */}
      {topEvents.length > 0 && (
        <section id="top-section">
          <div className="home-section-header">
            <h2>Nepřehlédni</h2>
            <button type="button" className="pill-toggle">★ Jen TOP akce</button>
          </div>
          <div id="top-grid">
            {topEvents.map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className="top-card">
                <div
                  className={`top-card-image ${event.imageUrl ? '' : 'top-card-image--empty'}`}
                  style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}
                >
                  <span className="top-card-badge">★ TOP akce</span>
                </div>
                <div className="top-card-body">
                  {event.tags?.[1] && <span className="event-tag">{event.tags[1]}</span>}
                  <h3>{event.name}</h3>
                  {event.description?.[0] && <p>{event.description[0]}</p>}
                  <div className="event-meta">
                    {event.date && <span>📅 {event.date}</span>}
                    {event.location && <span>📍 {event.location}</span>}
                  </div>
                  <span className="event-btn">Zobrazit →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nejbližší akce */}
      <section id="nearest-section">
        <div className="home-section-header">
          <h2>Nejbližší akce</h2>
          <Link to="/events" className="section-link">Zobrazit vše →</Link>
        </div>
        <div id="nearest-grid">
          {nearestEvents.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      </section>

      {/* Promo bannery — TODO: 3D ilustrace zatím chybí, čeká se na assety */}
      <section id="promo-section">
        <div className="promo-card">
          <span className="promo-icon">🍺</span>
          <div className="promo-text">
            <span className="promo-eyebrow">Gastro v Plzni</span>
            <h3>Objevuj gastro akce</h3>
            <p>Pivní speciály, food festivaly i degustace v plzeňských sklepech.</p>
          </div>
          <Link to="/events?kategorie=Gastro" className="promo-btn">Zobrazit gastro →</Link>
        </div>
        <div className="promo-card">
          <span className="promo-icon">⛪</span>
          <div className="promo-text">
            <span className="promo-eyebrow">Památky v Plzni</span>
            <h3>Projdi si památky města</h3>
            <p>Katedrála sv. Bartoloměje, synagoga i historické podzemí — včetně prohlídek s průvodcem.</p>
          </div>
          <Link to="/events?kategorie=Pamatky" className="promo-btn promo-btn--outline">Zobrazit památky →</Link>
        </div>
      </section>

      {/* Kategorie — TODO: Hudba/Památky/Pro děti zatím nejdou vybrat v AdminCreate, počty tedy budou 0 */}
      <section id="categories-section">
        <div className="home-section-header">
          <h2>Procházej podle kategorií</h2>
          <span id="categories-count">{CATEGORIES.length} témat · {events.length} akcí</span>
        </div>
        <div id="categories-grid">
          {CATEGORIES.map(cat => (
            <Link to={`/events?kategorie=${cat.name}`} key={cat.name} className="category-card">
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{events.filter(e => e.tags?.includes(cat.name)).length} akcí</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
