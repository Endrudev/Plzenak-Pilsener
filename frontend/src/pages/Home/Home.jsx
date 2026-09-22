import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EventCard from '../../components/EventCard/EventCard.jsx'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import HeroBento from '../../components/HeroBento/HeroBento.jsx'
import { getEvents } from '../../lib/eventsApi.js'
import { CATEGORIES } from '../../lib/categories.jsx'
import './Home.css'
import { imageBackground } from '../../lib/imageBackground.js'

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Homepage je rozcestník, ne nástroj — stačí hledání a kategorie.
  // Odeslání nefiltruje tady, ale přesměruje na /events s parametry.
  const [draft, setDraft] = useState({ q: '', kategorie: '' })

  function handleSubmit(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (draft.q.trim()) params.set('q', draft.q.trim())
    if (draft.kategorie) params.set('kategorie', draft.kategorie)
    const query = params.toString()
    navigate(query ? `/events?${query}` : '/events')
  }

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const topEvents = events.filter(e => e.tags?.includes('TOP akce')).slice(0, 2)
  const nearestEvents = events.slice(0, 6)

  if (loading) {
    return <p id="home-loading">Načítání…</p>
  }

  return (
    <div id="home">

      <section id="hero">
        <HeroBento events={events} />

        {/* Vyhledávání je teď skutečně napojené — odeslání přesměruje na
            /events s parametry, dřív bar existoval jen vizuálně. */}
        <form id="filter-bar" onSubmit={handleSubmit}>
          <div id="filter-bar-row">
            <div id="filter-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Hledat akce v Plzni..."
                aria-label="Hledat akce"
                value={draft.q}
                onChange={e => setDraft(d => ({ ...d, q: e.target.value }))}
              />
            </div>
            <FilterSelect
              placeholder="Kategorie"
              value={draft.kategorie}
              onChange={v => setDraft(d => ({ ...d, kategorie: v }))}
              options={CATEGORIES.map(c => ({ value: c.name, label: c.name, icon: c.icon(26) }))}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              }
            />
            <button type="submit" id="filter-search-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Vyhledat
            </button>
          </div>
        </form>
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
                  style={imageBackground(event.imageUrl)}
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
              <span className="category-icon">{cat.icon(26)}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{events.filter(e => e.tags?.includes(cat.name)).length} akcí</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
