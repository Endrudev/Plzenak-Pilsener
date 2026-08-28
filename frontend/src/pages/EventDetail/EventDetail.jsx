import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventById } from '../../lib/eventsApi.js'
import { useConsent } from '../../lib/ConsentContext.jsx'
import MapConsent from '../../components/ConsentGate/MapConsent.jsx'
import './EventDetail.css'
import { imageBackground } from '../../lib/imageBackground.js'

export default function EventDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const { consent, acceptAll } = useConsent()
    const [loading, setLoading] = useState(true)
    const [mapLoadedOnce, setMapLoadedOnce] = useState(false)

    useEffect(() => {
        setMapLoadedOnce(false)
        getEventById(id)
            .then(data => setEvent(data))
            .catch(() => setEvent(null))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div id="detail-not-found">
            <p>Načítání…</p>
        </div>
    )

    if (!event) return (
        <div id="detail-not-found">
            <p>Akce nenalezena.</p>
            <button onClick={() => navigate('/events')}>Zpět na akce</button>
        </div>
    )

    return (
        <div id="detail-page">

            <section
                id="detail-hero"
                className={event.imageUrl ? '' : 'detail-hero--fallback'}
                style={imageBackground(event.imageUrl)}
            >
                {/* TODO: vizuální placeholdery, export do kalendáře a Web Share API zatím nejsou zapojené */}
                <div id="detail-hero-actions">
                    <button type="button" className="detail-hero-action-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Do kalendáře
                    </button>
                    <button type="button" className="detail-hero-action-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
                        </svg>
                        Sdílet
                    </button>
                </div>

                <div id="detail-hero-content">
                    <div id="detail-hero-badges">
                        {event.badge && (
                            <span className={`event-badge badge-${event.badgeType}`}>{event.badge}</span>
                        )}
                        {event.tags?.[0] && <span className="event-tag">{event.tags[0]}</span>}
                    </div>
                    <h1 id="detail-title">{event.name}</h1>
                    <div id="detail-hero-meta">
                        {event.date && (
                            <span>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                {event.date}
                            </span>
                        )}
                        {event.location && (
                            <span>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                {event.location}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <div id="detail-body">
                <div id="detail-main">

                    {event.description?.length > 0 && (
                        <section className="detail-section">
                            <h2>O akci</h2>
                            {event.description.map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                            {event.url && (
                                <a href={event.url} target="_blank" rel="noreferrer" id="detail-website-link">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    {event.url}
                                </a>
                            )}
                        </section>
                    )}

                    {event.mapSrc && (
                        <section className="detail-section">
                            <h2>Kde to je</h2>
                            {consent?.maps || mapLoadedOnce ? (
                                <iframe id="detail-map-frame" src={event.mapSrc} title={`Mapa – ${event.location}`} loading="lazy" />
                            ) : (
                                <MapConsent
                                    variant="detail"
                                    onLoadOnce={() => setMapLoadedOnce(true)}
                                    onAlwaysLoad={acceptAll}
                                />
                            )}
                            {event.location && (
                                <p id="detail-location-line">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {event.location}
                                </p>
                            )}
                        </section>
                    )}

                </div>

                <aside id="detail-sidebar">
                    <div className="detail-card">
                        <span id="detail-ticket-label">Vstupenka</span>
                        <a
                            href={event.url ?? '#'}
                            id="detail-buy-btn"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                            </svg>
                            Koupit vstupenky
                        </a>
                        {/* TODO: vizuální placeholdery, export do kalendáře a Web Share API zatím nejsou zapojené */}
                        <div id="detail-sidebar-actions">
                            <button type="button" className="detail-sidebar-action-btn">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Kalendář
                            </button>
                            <button type="button" className="detail-sidebar-action-btn">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                    <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
                                </svg>
                                Sdílet
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    )
}
