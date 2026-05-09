import React, { useState } from 'react'
import { events as allEvents } from '../../data/events.js'
import EventCard from '../../components/EventCard/EventCard.jsx'
import './Events.css'

const PER_PAGE = 5
const TOTAL_PAGES = Math.ceil(allEvents.length / PER_PAGE)

export default function Events() {
  const [page, setPage] = useState(1)

  const start = (page - 1) * PER_PAGE
  const visibleEvents = allEvents.slice(start, start + PER_PAGE)

  function getPaginationItems() {
    const items = []
    if (TOTAL_PAGES <= 6) {
      for (let i = 1; i <= TOTAL_PAGES; i++) items.push(i)
      return items
    }
    items.push(1, 2, 3, 4)
    items.push('...')
    items.push(TOTAL_PAGES)
    return items
  }

  return (
    <div id="events-page">

      <div id="events-search-section">
        <div id="events-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Hledat akce..." aria-label="Hledat akce" />
        </div>

        <div id="events-filters">
          <button className="filter-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Kategorie
          </button>
          <button className="filter-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Místo
          </button>
          <button className="filter-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Datum
          </button>
        </div>

        <button id="events-search-btn">Vyhledat</button>
      </div>

      <div id="events-list">
        {visibleEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <div id="pagination">
        {getPaginationItems().map((item, i) =>
          item === '...' ? (
            <span key={i} className="pagination-dots">…</span>
          ) : (
            <button
              key={item}
              className={`pagination-btn${page === item ? ' pagination-btn--active' : ''}`}
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