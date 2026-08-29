import { Link } from 'react-router-dom'
import './EventCard.css'
import { imageBackground } from '../../lib/imageBackground.js'

export default function EventCard({ event }) {
    return (
        <div className="event-card">
            <div
                className={`event-image ${event.imageUrl ? '' : event.imgClass}`}
                style={imageBackground(event.imageUrl)}
            >
                {event.badge && (
                    <span className={`event-badge badge-${event.badgeType}`}>
                        {event.badge}
                    </span>
                )}
            </div>
            <div className="event-info">
                {event.tags && event.tags.length > 0 && (
                    <div className="event-tags">
                        {event.tags.map(tag => (
                            <span key={tag} className="event-tag">{tag}</span>
                        ))}
                    </div>
                )}
                <h2 className="event-name">{event.name}</h2>
                <div className="event-meta">
                    {event.location && (
                        <span className="event-location">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            {event.location}
                        </span>
                    )}
                    {event.location && event.date && <span className="event-meta-dot">·</span>}
                    {event.date && <span className="event-date">{event.date}</span>}
                </div>
                <Link to={`/events/${event.id}`} className="event-btn">Zobrazit</Link>
            </div>
        </div>
    )
}
