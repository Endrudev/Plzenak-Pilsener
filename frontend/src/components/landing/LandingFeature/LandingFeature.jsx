import { Link } from 'react-router-dom'
import Reveal from '../../Reveal/Reveal.jsx'
import { ArrowRight, ArrowUpRight, PinIcon } from '../icons.jsx'
import { dayParts } from '../../../lib/events/dateRanges.js'
import { eventVisual } from '../../../lib/events/eventVisual.js'
import './LandingFeature.css'

// TOP akce jako jedna velká karta s fotkou, nad ostatními se drží druhá a třetí.
// Když je TOP akce jen jedna (běžný stav), karta se roztáhne přes celou šířku
// a nechává po sobě vodorovný layout, ne díru vedle sebe.
//
// Celá karta je odkaz. Tlačítko „Detail akce" uvnitř je jen vzhled (span),
// vnořený odkaz v odkazu by byla neplatná struktura.
function FeatureCard({ event, size, index }) {
    const parts = dayParts(event.date)
    const large = size === 'large'

    return (
        <Link
            to={`/events/${event.id}`}
            className={`lf-card lf-card--${size} enter`}
            style={{ '--i': index }}
        >
            <span className="lf-media" style={eventVisual(event)} aria-hidden="true" />
            <span className="lf-scrim" aria-hidden="true" />

            <span className="lf-flag">TOP akce</span>

            <span className="lf-body">
                <span className="lf-title">{event.name}</span>
                <span className="lf-meta">
                    {parts && <span className="lf-when">{parts.weekday} {parts.day}. {parts.month}</span>}
                    <span className="lf-where"><PinIcon size={15} />{event.location}</span>
                </span>
                {large ? (
                    <span className="lp-btn lf-cta" aria-hidden="true">
                        Detail akce
                        <span className="lp-btn-ic"><ArrowRight /></span>
                    </span>
                ) : (
                    <span className="lf-go" aria-hidden="true"><ArrowUpRight /></span>
                )}
            </span>
        </Link>
    )
}

export default function LandingFeature({ events }) {
    const top = events.filter(e => e.tags?.includes('TOP akce')).slice(0, 3)
    if (top.length === 0) return null

    const [main, ...rest] = top
    const solo = rest.length === 0

    return (
        <Reveal as="section" className="lp-section lf" aria-labelledby="lf-h">
            <div className="lp-wrap">
                <div className="lp-head enter" style={{ '--i': 0 }}>
                    <h2 id="lf-h" className="lp-h2">Tohle si nenech ujít</h2>
                </div>

                <div className={`lf-grid${solo ? ' lf-grid--solo' : ''}`}>
                    <FeatureCard event={main} size="large" index={1} />
                    {rest.length > 0 && (
                        <div className="lf-side">
                            {rest.map((event, i) => (
                                <FeatureCard key={event.id} event={event} size="small" index={i + 2} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Reveal>
    )
}
