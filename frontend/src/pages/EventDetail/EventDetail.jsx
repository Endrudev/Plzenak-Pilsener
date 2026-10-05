import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getEventById, getEvents } from '../../lib/eventsApi.js'
import { eventBadge } from '../../lib/events/eventBadge.js'
import { dayParts } from '../../lib/events/dateRanges.js'
import { eventVisual } from '../../lib/events/eventVisual.js'
import { CATEGORIES } from '../../lib/filters/categories.jsx'
import { initMode } from '../../lib/landingTheme.js'
import { useConsent } from '../../lib/consent/ConsentContext.jsx'
import { buildIcsFile } from '../../lib/events/buildIcsFile.js'
import { downloadTextFile } from '../../lib/downloadTextFile.js'
import { shareEvent } from '../../lib/events/shareEvent.js'
import MapConsent from '../../components/ConsentGate/MapConsent.jsx'
import EventDetailSkeleton from '../../components/EventDetailSkeleton/EventDetailSkeleton.jsx'
import EventPoster from '../../components/events/EventPoster/EventPoster.jsx'
import { ArrowRight, ArrowUpRight, CalendarIcon, PinIcon, ShareIcon, TicketIcon } from '../../components/landing/icons.jsx'
import '../../components/landing/landing.css'
import './EventDetail.css'

// Detail akce, postavený od nuly 2026-10-04 ve stejném jazyce jako homepage a
// Akce: téma přes tokeny --lp-* (světlé výchozí, tmavé přepínačem v liště),
// fotografie akce jako tmavý hero, vedle obsahu lepivá karta se vstupenkou.
//
// Obsah (popis, mapa se souhlasem, kalendář, sdílení, odkaz na vstupenky) je
// stejný jako dřív. Změnilo se rozvržení a vzhled, ne co stránka umí.
export default function EventDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [related, setRelated] = useState([])
    const { consent, acceptAll } = useConsent()
    const [mapLoadedOnce, setMapLoadedOnce] = useState(false)
    // Krátká textová zpětná vazba na tlačítku „Sdílet“ (appka nemá globální toast).
    const [shareFeedback, setShareFeedback] = useState(null)
    const shareFeedbackTimeout = useRef(null)
    // Spodní lišta na telefonu se skrývá, dokud je vidět hlavní tlačítko v kartě.
    const buyRef = useRef(null)
    const [buyVisible, setBuyVisible] = useState(true)
    const today = useRef(new Date()).current

    // Téma stránky je celostránkové, stejně jako na homepage a v Akcích.
    useEffect(() => {
        document.documentElement.classList.add('theme-lp')
        initMode()
        return () => document.documentElement.classList.remove('theme-lp')
    }, [])

    useEffect(() => {
        setLoading(true)
        setMapLoadedOnce(false)
        setRelated([])
        // Odkaz z „Podobných akcí“ vede na jiný detail ve stejné komponentě, router
        // sám scroll nevrací.
        window.scrollTo(0, 0)
        getEventById(id)
            .then(data => setEvent(data))
            .catch(() => setEvent(null))
            .finally(() => setLoading(false))
    }, [id])

    // Podobné akce: stejná kategorie jako tahle akce, bez ní samotné. Selhání se
    // tiše přeskočí, je to doplněk, ne obsah stránky.
    useEffect(() => {
        if (!event) return undefined
        const category = CATEGORIES.find(c => event.tags?.includes(c.name))
        let cancelled = false
        getEvents({ kategorie: category?.name ?? '', perPage: 4 })
            .then(data => {
                if (cancelled) return
                setRelated(data.items.filter(e => String(e.id) !== String(event.id)).slice(0, 3))
            })
            .catch(() => {})
        return () => { cancelled = true }
    }, [event])

    useEffect(() => () => clearTimeout(shareFeedbackTimeout.current), [])

    useEffect(() => {
        const el = buyRef.current
        if (!el || !('IntersectionObserver' in window)) return undefined
        const io = new IntersectionObserver(([entry]) => setBuyVisible(entry.isIntersecting))
        io.observe(el)
        return () => io.disconnect()
    }, [event, loading])

    function handleAddToCalendar() {
        if (!event) return
        const ics = buildIcsFile(event)
        // event.date vždycky sedí na 'DD.MM.YYYY' (backend to vynucuje přes
        // TO_DATE), takže tenhle guard je jen obrana proti jinému tvaru.
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

    if (loading) return <EventDetailSkeleton />

    if (!event) return (
        <div id="detail-page" className="lp ed ed--missing">
            <div className="lp-wrap ed-missing">
                <h1 className="ed-missing-title">Akce nenalezena</h1>
                <p className="ed-missing-text">Odkaz už neplatí, nebo akce proběhla a byla smazána.</p>
                <button type="button" className="lp-btn" onClick={() => navigate('/events')}>
                    Zpět na akce
                    <span className="lp-btn-ic"><ArrowRight size={18} /></span>
                </button>
            </div>
        </div>
    )

    // Až za guardem: do té chvíle je `event` null. Plaketa se počítá z data,
    // v databázi uložená není (viz lib/events/eventBadge.js).
    const badge = eventBadge(event.date, today)
    const parts = dayParts(event.date)
    const isTop = event.tags?.includes('TOP akce')
    const tags = (event.tags ?? []).filter(tag => tag !== 'TOP akce')
    const hasDescription = event.description?.length > 0

    const buyButton = event.url ? (
        <a href={event.url} className="lp-btn ed-buy" target="_blank" rel="noreferrer" ref={buyRef}>
            Koupit vstupenky
            <span className="lp-btn-ic"><ArrowUpRight size={18} /></span>
        </a>
    ) : (
        // Bez event.url není kam odkázat. Skutečný <button disabled>, ne <span
        // aria-disabled>: nativně vypadne z tab pořadí a čtečka ho ohlásí jako vypnuté.
        <button type="button" className="lp-btn ed-buy ed-buy--off" disabled ref={buyRef}>
            Prodej zatím není online
        </button>
    )

    return (
        <div id="detail-page" className="lp ed">

            <header className="ed-hero">
                <span className="ed-media" style={eventVisual(event)} aria-hidden="true" />
                <span className="ed-scrim" aria-hidden="true" />

                <div className="lp-wrap ed-hero-in">
                    <nav className="ed-crumbs enter" style={{ '--i': 0 }} aria-label="Drobečková navigace">
                        <Link to="/">Plzeňák</Link> / <Link to="/events">Akce</Link>
                    </nav>

                    <div className="ed-hero-main">
                        {(isTop || badge) && (
                            <div className="ed-flags enter" style={{ '--i': 1 }}>
                                {isTop && <span className="ed-flag">TOP akce</span>}
                                {badge && <span className="ed-flag ed-flag--soft">{badge.text}</span>}
                            </div>
                        )}
                        <h1 className="ed-title enter" style={{ '--i': 2 }}>{event.name}</h1>

                        <div className="ed-meta enter" style={{ '--i': 3 }}>
                            {parts && (
                                <span className="ed-date" aria-hidden="true">
                                    <b>{parts.day}</b>
                                    <i>{parts.month}</i>
                                </span>
                            )}
                            <span className="ed-meta-text">
                                {event.date && <span className="ed-meta-line"><CalendarIcon size={16} />{parts ? `${parts.weekday} ` : ''}{event.date}</span>}
                                {event.location && <span className="ed-meta-line"><PinIcon size={16} />{event.location}</span>}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="lp-sheet">
            <div className="lp-wrap ed-body">
                <div className="ed-main">
                    {hasDescription && (
                        <section className="ed-section enter" style={{ '--i': 4 }} aria-labelledby="ed-about">
                            <h2 id="ed-about" className="ed-h2">O akci</h2>
                            {event.description.map((para, i) => (
                                <p key={i} className="ed-p">{para}</p>
                            ))}
                        </section>
                    )}

                    {event.mapSrc && (
                        <section className="ed-section enter" style={{ '--i': 5 }} aria-labelledby="ed-where">
                            <h2 id="ed-where" className="ed-h2">Kde to je</h2>
                            {consent?.maps || mapLoadedOnce ? (
                                <iframe className="ed-map" src={event.mapSrc} title={`Mapa: ${event.location}`} loading="lazy" />
                            ) : (
                                <MapConsent
                                    variant="detail"
                                    onLoadOnce={() => setMapLoadedOnce(true)}
                                    onAlwaysLoad={acceptAll}
                                />
                            )}
                            {event.location && (
                                <p className="ed-place"><PinIcon size={16} />{event.location}</p>
                            )}
                        </section>
                    )}
                </div>

                <aside className="ed-aside enter" style={{ '--i': 4 }} aria-label="Vstupenky a informace">
                    <div className="ed-card">
                        <div className="ed-core">
                            {buyButton}

                            <dl className="ed-facts">
                                {event.date && (
                                    <div className="ed-fact">
                                        <dt><CalendarIcon size={16} />Kdy</dt>
                                        <dd>{parts ? `${parts.weekday} ` : ''}{event.date}</dd>
                                    </div>
                                )}
                                {event.location && (
                                    <div className="ed-fact">
                                        <dt><PinIcon size={16} />Kde</dt>
                                        <dd>{event.location}</dd>
                                    </div>
                                )}
                                {tags.length > 0 && (
                                    <div className="ed-fact">
                                        <dt><TicketIcon size={16} />Druh</dt>
                                        <dd className="ed-tags">
                                            {tags.map(tag => (
                                                <Link
                                                    key={tag}
                                                    to={`/events?kategorie=${encodeURIComponent(tag)}`}
                                                    className="ed-tag"
                                                >
                                                    {tag}
                                                </Link>
                                            ))}
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            <div className="ed-actions">
                                <button type="button" className="ed-act" onClick={handleAddToCalendar}>
                                    <CalendarIcon size={18} />
                                    Do kalendáře
                                </button>
                                <button type="button" className="ed-act" onClick={handleShare}>
                                    <ShareIcon size={18} />
                                    {shareFeedback ?? 'Sdílet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {related.length > 0 && (
                <section className="lp-wrap ed-related" aria-labelledby="ed-related-h">
                    <div className="lp-head">
                        <h2 id="ed-related-h" className="lp-h2">Podobné akce</h2>
                        <Link to="/events" className="lp-link">
                            Všechny akce
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="ed-related-grid">
                        {related.map((item, i) => (
                            <EventPoster key={item.id} event={item} index={i} today={today} />
                        ))}
                    </div>
                </section>
            )}
            </div>

            {/* Lišta s tlačítkem na telefonu a tabletu. Na desktopu stejnou roli
                má lepivá karta vedle obsahu. Skrytá, dokud je vidět tlačítko v kartě. */}
            <div className="ed-bar" data-hidden={buyVisible || undefined} inert={buyVisible ? '' : undefined}>
                <div className="ed-bar-text">
                    <strong>{event.name}</strong>
                    {event.date && <span>{event.date}</span>}
                </div>
                {event.url ? (
                    <a href={event.url} target="_blank" rel="noreferrer" className="ed-bar-btn">
                        Koupit vstupenky
                    </a>
                ) : (
                    <button type="button" className="ed-bar-btn ed-bar-btn--off" disabled>
                        Prodej zatím není online
                    </button>
                )}
            </div>
        </div>
    )
}
