import { Link } from 'react-router-dom'
import { ArrowUpRight, PinIcon } from '../../landing/icons.jsx'
import { dayParts } from '../../../lib/events/dateRanges.js'
import { eventBadge } from '../../../lib/events/eventBadge.js'
import { eventVisual } from '../../../lib/events/eventVisual.js'
import './EventPoster.css'

// Karta akce v mřížce na stránce Akce: fotka (nebo gradient kategorie) přes celou
// plochu, datum nahoře, název a místo dole. Celá karta je jeden odkaz.
//
// Přirozeně je širší než vysoká (4:3), aby se v mřížce dalo skenovat očima:
// tři sloupce na desktopu, dva na tabletu, jeden na telefonu.
//
// `rank` (jen na stránce TOP akce) ukáže pořadí ve výběru jako štítek vpravo nahoře.
export default function EventPoster({ event, index, today, rank }) {
    const parts = dayParts(event.date)
    const badge = eventBadge(event.date, today)
    const isTop = event.tags?.includes('TOP akce')
    const tags = (event.tags ?? []).filter(tag => tag !== 'TOP akce').slice(0, 2)

    return (
        <Link to={`/events/${event.id}`} className="ep enter" style={{ '--i': index }}>
            <span className="ep-media" style={eventVisual(event)} aria-hidden="true" />
            <span className="ep-scrim" aria-hidden="true" />

            {parts && (
                <span className="ep-date" aria-hidden="true">
                    <b>{parts.day}</b>
                    <i>{parts.month}</i>
                </span>
            )}

            {(isTop || badge || rank) && (
                <span className="ep-flags">
                    {rank && <span className="ep-flag ep-flag--soft">#{rank}</span>}
                    {isTop && !rank && <span className="ep-flag">TOP akce</span>}
                    {badge && <span className="ep-flag ep-flag--soft">{badge.text}</span>}
                </span>
            )}

            <span className="ep-body">
                <span className="ep-title">{event.name}</span>
                <span className="ep-where"><PinIcon size={14} />{event.location}</span>
                {tags.length > 0 && (
                    <span className="ep-tags">
                        {tags.map(tag => <span key={tag} className="ep-tag">{tag}</span>)}
                    </span>
                )}
            </span>

            <span className="ep-go" aria-hidden="true"><ArrowUpRight /></span>
            <span className="visually-hidden">{event.date}</span>
        </Link>
    )
}
