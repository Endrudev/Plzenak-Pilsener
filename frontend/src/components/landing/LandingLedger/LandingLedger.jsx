import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../../Reveal/Reveal.jsx'
import { ArrowRight, ArrowUpRight, PinIcon } from '../icons.jsx'
import { dayParts, upcoming } from '../../../lib/events/dateRanges.js'
import './LandingLedger.css'

// Nejbližších šest akcí jako lístky: vlevo velké datum (to je první, co se u
// akce hledá), vpravo název, místo a nejvýš dva štítky. Dva sloupce, ne tři
// stejné karty vedle sebe.
//
// Celý lístek je odkaz. Kategorií je v databázi víc, než se vejde, proto jen
// první dvě; zbytek je na detailu.
export default function LandingLedger({ events, loading }) {
    const today = useMemo(() => new Date(), [])
    const items = useMemo(() => upcoming(events, today).slice(0, 6), [events, today])

    return (
        <Reveal as="section" className="lp-section ll" aria-labelledby="ll-h">
            <div className="lp-wrap">
                <div className="lp-head enter" style={{ '--i': 0 }}>
                    <h2 id="ll-h" className="lp-h2">Nejbližší akce</h2>
                    <Link to="/events" className="lp-link">Všechny akce <ArrowRight /></Link>
                </div>

                {loading ? (
                    <div className="ll-grid" aria-hidden="true">
                        {[0, 1, 2, 3].map(i => <div key={i} className="ll-ticket ll-ticket--skeleton skeleton" />)}
                    </div>
                ) : items.length === 0 ? (
                    <p className="ll-empty">Zatím tu nejsou žádné nadcházející akce.</p>
                ) : (
                    <div className="ll-grid">
                        {items.map((event, i) => {
                            const parts = dayParts(event.date)
                            return (
                                <Link
                                    key={event.id}
                                    to={`/events/${event.id}`}
                                    className="ll-ticket enter"
                                    style={{ '--i': i + 1 }}
                                >
                                    {parts && (
                                        <span className="ll-date" aria-hidden="true">
                                            <b>{parts.day}</b>
                                            <i>{parts.month}</i>
                                            <em>{parts.weekday}</em>
                                        </span>
                                    )}
                                    <span className="ll-body">
                                        <span className="ll-title">{event.name}</span>
                                        <span className="ll-where"><PinIcon size={14} />{event.location}</span>
                                        {event.tags?.length > 0 && (
                                            <span className="ll-tags">
                                                {event.tags.slice(0, 2).map(tag => <span key={tag} className="ll-tag">{tag}</span>)}
                                            </span>
                                        )}
                                    </span>
                                    <span className="ll-go" aria-hidden="true"><ArrowUpRight /></span>
                                    <span className="visually-hidden">{event.date}</span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </Reveal>
    )
}
