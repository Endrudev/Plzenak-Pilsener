import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventById } from '../../lib/eventsApi.js'
import { eventBadge } from '../../lib/eventBadge.js'
import { useConsent } from '../../lib/ConsentContext.jsx'
import MapConsent from '../../components/ConsentGate/MapConsent.jsx'
import { buildIcsFile } from '../../lib/buildIcsFile.js'
import { downloadTextFile } from '../../lib/downloadTextFile.js'
import { shareEvent } from '../../lib/shareEvent.js'
import './EventDetail.css'
import { imageBackground } from '../../lib/imageBackground.js'

export default function EventDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const { consent, acceptAll } = useConsent()
    const [loading, setLoading] = useState(true)
    const [mapLoadedOnce, setMapLoadedOnce] = useState(false)
    // Krátká textová zpětná vazba na "Sdílet" tlačítkách (appka nemá
    // globální toast systém) — platí pro obě dvojice tlačítek najednou
    // (v hero i v postranním panelu), sdílejí jeden stav.
    const [shareFeedback, setShareFeedback] = useState(null)
    const shareFeedbackTimeout = useRef(null)

    useEffect(() => {
        setMapLoadedOnce(false)
        getEventById(id)
            .then(data => setEvent(data))
            .catch(() => setEvent(null))
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => () => clearTimeout(shareFeedbackTimeout.current), [])

    function handleAddToCalendar() {
        if (!event) return
        const ics = buildIcsFile(event)
        // event.date u nás vždycky sedí na 'DD.MM.YYYY' (backend to
        // vynucuje přes TO_DATE), takže tenhle guard je jen obrana proti
        // datům, co by tenhle tvar neměla — normálně nenastane.
        if (!ics) return
        downloadTextFile(ics.filename, ics.content, 'text/calendar;charset=utf-8')
    }

    async function handleShare() {
        if (!event) return
        const result = await shareEvent(event)
        if (result === 'cancelled') return
        setShareFeedback(result === 'copied' ? 'Odkaz zkopírován' : result === 'unsupported' ? 'Sdílení není podporováno' : null)
        if (result !== 'shared') {
            clearTimeout(shareFeedbackTimeout.current)
            shareFeedbackTimeout.current = setTimeout(() => setShareFeedback(null), 2500)
        }
    }

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

    // Až za guardem — do té chvíle je `event` null. Plaketa se počítá z data,
    // v databázi uložená není (viz lib/eventBadge.js).
    const badge = eventBadge(event.date)

    return (
        <div id="detail-page">

            <section
                id="detail-hero"
                className={event.imageUrl ? '' : 'detail-hero--fallback'}
                style={imageBackground(event.imageUrl)}
            >
                <div id="detail-hero-actions">
                    <button type="button" className="detail-hero-action-btn" onClick={handleAddToCalendar}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Do kalendáře
                    </button>
                    <button type="button" className="detail-hero-action-btn" onClick={handleShare}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
                        </svg>
                        {shareFeedback ?? 'Sdílet'}
                    </button>
                </div>

                <div id="detail-hero-content">
                    <div id="detail-hero-badges">
                        {badge && (
                            <span className={`event-badge badge-${badge.type}`}>{badge.text}</span>
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
                        {event.url ? (
                            <a
                                href={event.url}
                                id="detail-buy-btn"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                                </svg>
                                Koupit vstupenky
                            </a>
                        ) : (
                            // Bez event.url není kam odkázat — dřív tu byl
                            // no-op odkaz na "#", teď je tlačítko viditelně
                            // deaktivované s vysvětlením, ne tichá slepá cesta.
                            <span id="detail-buy-btn" className="detail-buy-btn--disabled" aria-disabled="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                                </svg>
                                Prodej zatím není online
                            </span>
                        )}
                        <div id="detail-sidebar-actions">
                            <button type="button" className="detail-sidebar-action-btn" onClick={handleAddToCalendar}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Kalendář
                            </button>
                            <button type="button" className="detail-sidebar-action-btn" onClick={handleShare}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                    <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
                                </svg>
                                {shareFeedback ?? 'Sdílet'}
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Sticky lišta na mobilu — handoff ji sám označuje jako
                doporučení, ne hotový návrh (viz implementační plán, Fáze 6),
                tohle je vlastní interpretace. Nad ní zůstává i karta v
                postranním panelu (na desktopu není sticky lišta vidět vůbec,
                viz media query), ať se chování na mobilu/desktopu nerozjíždí
                na dvě různé cesty k nákupu. */}
            <div id="detail-mobile-cta">
                <div id="detail-mobile-cta-text">
                    <strong>{event.name}</strong>
                    {event.date && <span>{event.date}</span>}
                </div>
                {event.url ? (
                    <a href={event.url} target="_blank" rel="noreferrer" id="detail-mobile-cta-btn">
                        Koupit vstupenky
                    </a>
                ) : (
                    <span id="detail-mobile-cta-btn" className="detail-mobile-cta-btn--disabled" aria-disabled="true">
                        Prodej zatím není online
                    </span>
                )}
            </div>

        </div>
    )
}
