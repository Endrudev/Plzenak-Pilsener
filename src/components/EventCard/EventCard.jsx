import { Link } from 'react-router-dom'
import './EventCard.css'

export default function EventCard({ event }) {
    return (
        <div className="event-card">
            <div className={`event-image ${event.imgClass}`}>
                <span className={`event-badge badge-${event.badgeType}`}>
                    {event.badge}
                </span>
            </div>
            <div className="event-info">
                <h2 className="event-name">{event.name}</h2>
                {event.tags && event.tags.length > 0 && (
                    <div className="event-tags">
                        {event.tags.map(tag => (
                            <span key={tag} className="event-tag">{tag}</span>
                        ))}
                    </div>
                )}
                {event.location && <p className="event-location">{event.location}</p>}
                {event.date && <p className="event-date">{event.date}</p>}
                <Link to={`/events/${event.id}`} className="event-btn">Zobrazit</Link>
            </div>
        </div>
    )
}