import { useState, useEffect } from 'react'
import EventCard from '../../components/EventCard/EventCard.jsx'
import { getEvents } from '../../lib/eventsApi.js'
import './Events.css'

const CATEGORIES = [
  { name: 'Kultura', icon: '🎭' },
  { name: 'Sport', icon: '⚽' },
  { name: 'Gastro', icon: '🍺' },
  { name: 'Hudba', icon: '🎵' },
  { name: 'Památky', icon: '⛪' },
  { name: 'Pro děti', icon: '🙂' },
]

const QUICK_FILTERS = [
  { name: 'Dnes', icon: '☀️' },
  { name: 'Tento týden', icon: '📅' },
  { name: 'Zdarma', icon: '🏷️' },
  { name: 'TOP akce', icon: '★' },
]

export default function Events() {
  const PER_PAGE = 5

  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getEvents()
      .then(data => setAllEvents(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredEvents = allEvents.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleEvents = filteredEvents.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  function getPaginationItems() {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    return [1, 2, 3, 4, '...', totalPages]
  }

  return (
    <div id="events-page">

      {/* Filter bar — TODO: vstupy zatím nejsou propojené na žádný stav/filtrování/řazení */}
      <div id="events-filter-card">
        <div id="events-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Hledat koncerty…" 
            aria-label="Hledat akce"
            value={search}
            onChange={e => {setSearch(e.target.value); setPage(1)}}
          />
        </div>

        <div id="events-filter-row">
          <div className="events-filter-select">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <select defaultValue="">
              <option value="" disabled>Kategorie</option>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <svg className="events-filter-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div className="events-filter-select">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <select defaultValue="">
              <option value="" disabled>Místo</option>
            </select>
            <svg className="events-filter-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div className="events-filter-select">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <select defaultValue="">
              <option value="" disabled>Datum</option>
            </select>
            <svg className="events-filter-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <button type="button" id="events-search-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Vyhledat
          </button>
        </div>

        <div className="events-filter-divider" />

        <div className="events-filter-group">
          <span className="events-filter-group-label">Kategorie</span>
          <div className="events-pill-row">
            {CATEGORIES.map(c => (
              <button type="button" key={c.name} className="events-pill">
                <span aria-hidden="true">{c.icon}</span> {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="events-filter-divider" />

        <div id="events-filter-group-row">
          <div className="events-filter-group">
            <span className="events-filter-group-label">Rychlý filtr</span>
            <div className="events-pill-row">
              {QUICK_FILTERS.map(f => (
                <button type="button" key={f.name} className="events-pill">
                  <span aria-hidden="true">{f.icon}</span> {f.name}
                </button>
              ))}
            </div>
          </div>

          <div id="events-view-toggle">
            <button type="button" className="events-view-toggle-btn events-view-toggle-btn--active">Seznam</button>
            <button type="button" className="events-view-toggle-btn">Mapa</button>
          </div>
        </div>
      </div>

      <div id="events-sort-row">
        <span id="events-sort-label">Řadit podle</span>
        <div id="events-sort-select">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="20" x2="6" y2="4" /><polyline points="2 8 6 4 10 8" /><line x1="18" y1="4" x2="18" y2="20" /><polyline points="14 16 18 20 22 16" />
          </svg>
          <select defaultValue="nearest">
            <option value="nearest">Nejbližší</option>
          </select>
        </div>
      </div>

      <div id="events-section-header">
        <h2>Všechny akce</h2>
        {!loading && (
          <span id="events-count">Zobrazeno {visibleEvents.length} z {filteredEvents.length} akcí</span>
        )}
      </div>

      <div id="events-list">
        {loading
          ? <p id="events-loading">Načítání…</p>
          : filteredEvents.length === 0
            ? <p id="events-loading">Žádné akce neodpovídají hledání.</p>
            : visibleEvents.map(event => <EventCard key={event.id} event={event} />)
        }
      </div>

      <div id="pagination">
        {getPaginationItems().map((item, i) =>
          item === '...' ? (
            <span key={i} className="pagination-dots">…</span>
          ) : (
            <button
              key={item}
              className={`pagination-btn${currentPage === item ? ' pagination-btn--active' : ''}`}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          )
        )}
      </div>

    </div>
  )
}
