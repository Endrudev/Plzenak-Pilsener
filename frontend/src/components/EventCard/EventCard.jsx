import { Link } from 'react-router-dom'
import './EventCard.css'
import { imageBackground } from '../../lib/events/imageBackground.js'
import { eventBadge } from '../../lib/events/eventBadge.js'

function ClockIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
        </svg>
    )
}

function LocationIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}

// Doslova podle handoffu: čas/datum a místo jsou dva samostatné řádky
// (vlastní ikona na každém), ne jeden řádek spojený tečkou jako dřív.
function EventMeta({ event }) {
    return (
        <div className="event-meta">
            {event.date && (
                <span className="event-meta-row">
                    <ClockIcon />
                    {event.date}
                </span>
            )}
            {event.location && (
                <span className="event-meta-row">
                    <LocationIcon />
                    {event.location}
                </span>
            )}
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

// Šipka co se na hoveru/focusu posune doprava — stejný "go" vzor jako
// všude jinde v redesignu (Header, HeroBento, Footer...).
function GoArrow() {
    return (
        <span className="event-btn-go" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
        </span>
    )
}

// variant:
//   'grid'     — výchozí, dnešní karta beze změny (Home.jsx, Events.jsx)
//   'list'     — řádek přes celou šířku, celý je odkaz (handoff: mobilní seznam akcí)
//   'featured' — velká karta na šířku (obrázek vlevo ~58 %), se vstupem
//                `why` ("Proč jít") — na TOP akce/Hudba/Zbytek programu
//                dostává první (nejvýše seřazená) karta v mřížce
//   'ranked'   — širší varianta se side-by-side obrázkem, badge #N
// rank: pořadové číslo — zobrazí se badge #N NEZÁVISLE na variantě (grid i
//       featured), použité jen na TOP akce (jediná ze tří dedikovaných
//       stránek, kde je pořadí smysluplné — žebříček)
// why: krátký editorní důvod pro variant="featured" — appka to pole dnes nemá
//      v datech, zobrazí se jen když ho volající předá
// index: pořadí karty v seznamu. Když je zadané, karta při načtení vyjede
//        s odstupem podle pořadí (třída .enter, viz index.css). Bez něj se
//        nehýbe, třeba karta mimo seznam.
export default function EventCard({ event, variant = 'grid', rank, why, index }) {
    const enter = index == null ? '' : ' enter'
    const enterStyle = index == null ? undefined : { '--i': index }
    // Plaketa se počítá z data, v databázi uložená není — viz lib/events/eventBadge.js
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
            {typeof rank === 'number' && (
                <span className="event-rank">#{rank}</span>
            )}
        </div>
    )

    if (variant === 'list') {
        // Celý řádek je <a href> — žádné vnořené tlačítko uvnitř (handoff, přístupnost).
        return (
            <Link to={`/events/${event.id}`} className={`event-card event-card--list${enter}`} style={enterStyle}>
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
                <span className="event-btn event-btn--list" aria-hidden="true">Zobrazit akci<GoArrow /></span>
            </Link>
        )
    }

    if (variant === 'featured' || variant === 'ranked') {
        return (
            <div className={`event-card event-card--${variant}${enter}`} style={enterStyle}>
                {image}
                <div className="event-info">
                    <EventTags tags={event.tags} />
                    <h2 className="event-name">{event.name}</h2>
                    {variant === 'featured' && why && <p className="event-why">{why}</p>}
                    <EventMeta event={event} />
                    <Link to={`/events/${event.id}`} className="event-btn" aria-label={`Zobrazit akci: ${event.name}`}>Zobrazit akci<GoArrow /></Link>
                </div>
            </div>
        )
    }

    // grid — výchozí, karta podle handoffu (.card.paper-l)
    return (
        <div className={`event-card${enter}`} style={enterStyle}>
            {image}
            <div className="event-info">
                <h2 className="event-name">{event.name}</h2>
                <EventMeta event={event} />
                <EventTags tags={event.tags} />
                <Link to={`/events/${event.id}`} className="event-btn" aria-label={`Zobrazit akci: ${event.name}`}>Zobrazit akci<GoArrow /></Link>
            </div>
        </div>
    )
}
