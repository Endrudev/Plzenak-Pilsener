import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../../components/EventCard/EventCard.jsx'
import { getEvents } from '../../lib/eventsApi.js'
import './Home.css'

const CATEGORIES = [
  {
    name: 'Gastro', slug: 'gastro', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 8.5h8.5V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2z" /><path d="M14 11h2.5a2.75 2.75 0 0 1 0 5.5H14" /><path d="M5.5 8.5a2.2 2.2 0 0 1 2-2.2 2.6 2.6 0 0 1 4.5-1.5A2.3 2.3 0 0 1 14 8.5" />
      </svg>
    )
  },
  {
    name: 'Kultura', slug: 'kultura', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h7v5a3.5 3.5 0 0 1-7 0z" /><circle cx="6.2" cy="7.2" r=".6" fill="currentColor" stroke="none" /><circle cx="8.8" cy="7.2" r=".6" fill="currentColor" stroke="none" /><path d="M13 9h7v5a3.5 3.5 0 0 1-7 0z" /><circle cx="15.2" cy="11.2" r=".6" fill="currentColor" stroke="none" /><circle cx="17.8" cy="11.2" r=".6" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    name: 'Hudba', slug: 'hudba', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V6.2l10-2V16" /><circle cx="6.8" cy="18" r="2.2" /><circle cx="16.8" cy="16" r="2.2" />
      </svg>
    )
  },
  {
    name: 'Sport', slug: 'sport', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" /><path d="m12 8.8 3.04 2.21-1.16 3.58h-3.76l-1.16-3.58z" /><path d="M12 8.8V3.6M15.04 11.01 19.9 9.4M13.88 14.59 17 18.7M10.12 14.59 7 18.7M8.96 11.01 4.1 9.4" />
      </svg>
    )
  },
  {
    name: 'Památky', slug: 'pamatky', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3.5 9.5 8.5-5.5 8.5 5.5" /><path d="M3.5 19.5h17M4.8 9.5v10M9.6 9.5v10M14.4 9.5v10M19.2 9.5v10" />
      </svg>
    )
  },
  {
    name: 'Pro děti', slug: 'deti', icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15c2.8 0 5-2.5 5-5.6S14.8 4 12 4 7 6.4 7 9.4 9.2 15 12 15Z" /><path d="m11 15.2 1 1.3 1-1.3" /><path d="M12 16.5c0 1.2-1.5 1.2-1.5 2.4s1.5 1.2 1.5 2.4" />
      </svg>
    )
  },
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
                {heroEvent.url && (
                  <span className="hero-badge hero-badge--ticket">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v1.6a2 2 0 0 0 0 3.8v1.6A1.5 1.5 0 0 1 18.5 17h-13A1.5 1.5 0 0 1 4 15.5v-1.6a2 2 0 0 0 0-3.8z" /><path d="M14 7v10" strokeDasharray="2 2.4" />
                    </svg>
                    Koupit vstupenku
                  </span>
                )}
              </div>
              <h1 id="hero-title">{heroEvent.name}</h1>
              <div id="hero-meta">
                {heroEvent.date && (
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4.5" width="16" height="16.5" rx="2" /><path d="M4 9.5h16M8.5 3v3M15.5 3v3" />
                    </svg>
                    {heroEvent.date}
                  </span>
                )}
                {heroEvent.location && (
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" />
                    </svg>
                    {heroEvent.location}
                  </span>
                )}
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
                    {event.date && (
                      <span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="4.5" width="16" height="16.5" rx="2" /><path d="M4 9.5h16M8.5 3v3M15.5 3v3" />
                        </svg>
                        {event.date}
                      </span>
                    )}
                    {event.location && (
                      <span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" />
                        </svg>
                        {event.location}
                      </span>
                    )}
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
          <span className="promo-icon" style={{ color: 'var(--category-gastro)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 8.5h8.5V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2z" /><path d="M14 11h2.5a2.75 2.75 0 0 1 0 5.5H14" /><path d="M5.5 8.5a2.2 2.2 0 0 1 2-2.2 2.6 2.6 0 0 1 4.5-1.5A2.3 2.3 0 0 1 14 8.5" />
            </svg>
          </span>
          <div className="promo-text">
            <span className="promo-eyebrow">Gastro v Plzni</span>
            <h3>Objevuj gastro akce</h3>
            <p>Pivní speciály, food festivaly i degustace v plzeňských sklepech.</p>
          </div>
          <Link to="/events?kategorie=Gastro" className="promo-btn">Zobrazit gastro →</Link>
        </div>
        <div className="promo-card">
          <span className="promo-icon" style={{ color: 'var(--category-pamatky)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3.5 9.5 8.5-5.5 8.5 5.5" /><path d="M3.5 19.5h17M4.8 9.5v10M9.6 9.5v10M14.4 9.5v10M19.2 9.5v10" />
            </svg>
          </span>
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
            <Link to={`/events?kategorie=${cat.name}`} key={cat.name} className={`category-card category-card--${cat.slug}`}>
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
