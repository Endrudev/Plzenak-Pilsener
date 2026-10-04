import { Link } from 'react-router-dom'
import { ArrowUpRight, PinIcon } from '../../landing/icons.jsx'
import { dayParts } from '../../../lib/events/dateRanges.js'
import { eventBadge } from '../../../lib/events/eventBadge.js'
import './EventTicket.css'

// Řádek akce v seznamu: velké datum vlevo, vpravo název, místo a štítky. Seznam
// je hustší než mřížka (víc akcí na obrazovce, bez fotek), určený pro člověka,
// který prochází termíny. Celý řádek je jeden odkaz.
export default function EventTicket({ event, index, today }) {
    const parts = dayParts(event.date)
    const badge = eventBadge(event.date, today)
    const tags = event.tags ?? []

    return (
        <Link to={`/events/${event.id}`} className="et enter" style={{ '--i': index }}>
            {parts && (
                <span className="et-date" aria-hidden="true">
                    <b>{parts.day}</b>
                    <i>{parts.month}</i>
                    <em>{parts.weekday}</em>
                </span>
            )}

            <span className="et-body">
                <span className="et-title">{event.name}</span>
                <span className="et-meta">
                    <span className="et-where"><PinIcon size={14} />{event.location}</span>
                    {badge && <span className="et-badge">{badge.text}</span>}
                </span>
                {tags.length > 0 && (
                    <span className="et-tags">
                        {tags.slice(0, 3).map(tag => <span key={tag} className="et-tag">{tag}</span>)}
                    </span>
                )}
            </span>

            <span className="et-go" aria-hidden="true"><ArrowUpRight /></span>
            <span className="visually-hidden">{event.date}</span>
        </Link>
    )
}
