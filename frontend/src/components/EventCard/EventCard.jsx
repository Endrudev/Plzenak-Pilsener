import { Link } from 'react-router-dom'
import './EventCard.css'
import { imageBackground } from '../../lib/imageBackground.js'
import { eventBadge } from '../../lib/eventBadge.js'

function LocationIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}

function EventMeta({ event }) {
    return (
        <div className="event-meta">
            {event.location && (
                <span className="event-location">
                    <LocationIcon />
                    {event.location}
                </span>
            )}
            {event.location && event.date && <span className="event-meta-dot">·</span>}
            {event.date && <span className="event-date">{event.date}</span>}
        </div>
    )
}

function EventTags({ tags }) {
    if (!tags || tags.length === 0) return null
    return (
        <div className="event-tags">
            {tags.map(tag => <span key={tag} className="event-tag">{tag}</span>)}
        </div>
    )
}

// variant:
//   'grid'     — výchozí, dnešní karta beze změny (Home.jsx, Events.jsx)
//   'list'     — řádek přes celou šířku, celý je odkaz (handoff: mobilní seznam akcí)
//   'featured' — velká karta se vstupem `why` ("Proč jít")
//   'ranked'   — jako featured, navíc badge #N pro žebříček (TOP akce)
// rank: pořadové číslo pro variant="ranked"
// why: krátký editorní důvod pro variant="featured" — appka to pole dnes nemá
//      v datech, zobrazí se jen když ho volající předá
export default function EventCard({ event, variant = 'grid', rank, why }) {
    // Plaketa se počítá z data, v databázi uložená není — viz lib/eventBadge.js
    const badge = eventBadge(event.date)

    const image = (
        <div
            className={`event-image ${event.imageUrl ? '' : event.imgClass}`}
            style={imageBackground(event.imageUrl)}
        >
            {badge && (
                <span className={`event-badge badge-${badge.type}`}>
                    {badge.text}
                </span>
            )}
            {variant === 'ranked' && typeof rank === 'number' && (
                <span className="event-rank">#{rank}</span>
            )}
        </div>
    )

    if (variant === 'list') {
        // Celý řádek je <a href> — žádné vnořené tlačítko uvnitř (handoff, přístupnost).
        return (
            <Link to={`/events/${event.id}`} className="event-card event-card--list">
                <div
                    className={`event-image ${event.imageUrl ? '' : event.imgClass}`}
                    style={imageBackground(event.imageUrl)}
                    aria-hidden="true"
                />
                <div className="event-info">
                    {event.tags?.[0] && <span className="event-tag">{event.tags[0]}</span>}
                    <h2 className="event-name">{event.name}</h2>
                    <EventMeta event={event} />
                </div>
                <span className="event-btn event-btn--list" aria-hidden="true">Zobrazit akci</span>
            </Link>
        )
    }

    if (variant === 'featured' || variant === 'ranked') {
        return (
            <div className={`event-card event-card--${variant}`}>
                {image}
                <div className="event-info">
                    <EventTags tags={event.tags} />
                    <h2 className="event-name">{event.name}</h2>
                    {variant === 'featured' && why && <p className="event-why">{why}</p>}
                    <EventMeta event={event} />
                    <Link to={`/events/${event.id}`} className="event-btn">Zobrazit akci</Link>
                </div>
            </div>
        )
    }

    // grid — výchozí, beze změny
    return (
        <div className="event-card">
            {image}
            <div className="event-info">
                <EventTags tags={event.tags} />
                <h2 className="event-name">{event.name}</h2>
                <EventMeta event={event} />
                <Link to={`/events/${event.id}`} className="event-btn">Zobrazit</Link>
            </div>
        </div>
    )
}
