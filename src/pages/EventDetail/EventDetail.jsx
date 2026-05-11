import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventById } from '../../lib/eventsApi.js'
import './EventDetail.css'

export default function EventDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getEventById(id)
            .then(data => setEvent(data))
            .catch(() => setEvent(null))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div id="event-detail-not-found">
            <p>Načítání…</p>
        </div>
    )

    if (!event) return (
        <div id="event-detail-not-found">
            <p>Akce nenalezena.</p>
            <button onClick={() => navigate('/events')}>Zpět na akce</button>
        </div>
    )

    return (
        <div id="event-detail">

            <div className={`event-detail-hero ${event.imgClass}`}>
                <div className="event-detail-hero-overlay">
                    <h1 className="event-detail-title">{event.name}</h1>
                    <div className="event-detail-meta">
                        {event.dateShort && <span>{event.dateShort}</span>}
                        {event.dateShort && event.location && <span className="meta-separator">|</span>}
                        {event.location && <span>{event.location}</span>}
                        <span className={`event-badge badge-${event.badgeType}`}>{event.badge}</span>
                    </div>
                </div>
            </div>

            {event.description.length > 0 && (
                <div className="event-detail-description">
                    {event.description.map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
                </div>
            )}

            <div className="event-detail-actions">
                <a
                    href={event.url ?? '#'}
                    className="event-buy-btn"
                    target="_blank"
                    rel="noreferrer"
                >
                    Koupit
                </a>
                {event.date && <p className="event-detail-date">{event.date}</p>}
                {event.url && (
                    <p className="event-detail-url">
                        URL: <a href={event.url} target="_blank" rel="noreferrer">{event.url}</a>
                    </p>
                )}
            </div>

            {event.mapSrc && (
                <div className="event-detail-map">
                    <iframe
                        src={event.mapSrc}
                        title="Mapa místa konání"
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
            )}

        </div>
    )
}
