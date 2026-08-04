import React, { useState, useEffect } from 'react'
import EventCard from '../../components/EventCard/EventCard.jsx'
import { getEvents } from '../../lib/eventsApi.js'
import './Events.css'

const PER_PAGE = 5

export default function Events() {
  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    getEvents()
      .then(data => setAllEvents(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalPages = Math.max(1, Math.ceil(allEvents.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleEvents = allEvents.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  function getPaginationItems() {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    return [1, 2, 3, 4, '...', totalPages]
  }

  return (
    <div id="events-page">

      <div id="events-list">
        {loading
          ? <p style={{ textAlign: 'center', color: '#888', fontFamily: 'Montserrat', padding: '40px 0' }}>Načítání…</p>
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
