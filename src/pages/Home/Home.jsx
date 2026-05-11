import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvents } from '../../lib/eventsApi.js'
import EventCard from '../../components/EventCard/EventCard.jsx'
import './Home.css'

const categories = [
  { id: 1, name: 'SPORT' },
  { id: 2, name: 'GASTRO' },
  { id: 3, name: 'TOP Akce' },
  { id: 4, name: 'KULTURA' },
]

const COUNTS = [3, 6, 9]

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const visibleEvents = events.slice(0, COUNTS[stage])

  function handleExpand() {
    if (stage < 2) setStage(stage + 1)
    else navigate('/events')
  }

  return (
    <div id="home">

      <div id="search-bar-wrapper">
        <div id="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Hledat akce..." aria-label="Hledat akce" />
        </div>
      </div>

      <div id="events-list">
        {loading
          ? <p style={{ textAlign: 'center', color: '#888', fontFamily: 'Montserrat' }}>Načítání…</p>
          : visibleEvents.map(event => <EventCard key={event.id} event={event} />)
        }
      </div>

      <div id="expand-separator">
        {stage === 0 ? (
          <button id="chevron-btn" onClick={handleExpand} aria-label="Zobrazit více">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        ) : (
          <button id="vice-btn" onClick={handleExpand}>Více</button>
        )}
      </div>

      <div id="categories-section">
        <div id="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-card">
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
