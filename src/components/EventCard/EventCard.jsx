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
                {event.date && <p className="event-date">{event.date}</p>}
                <Link to={`/events/${event.id}`} className="event-btn">Zobrazit</Link>
            </div>
        </div>
    )
}