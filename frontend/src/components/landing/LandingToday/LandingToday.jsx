import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../../Reveal/Reveal.jsx'
import { ArrowLeft, ArrowRight, ArrowUpRight, PinIcon } from '../icons.jsx'
import { RANGES, dayParts, inRange, upcoming } from '../../../lib/events/dateRanges.js'
import { eventBadge } from '../../../lib/events/eventBadge.js'
import { eventVisual } from '../../../lib/events/eventVisual.js'
import './LandingToday.css'

// Sekce hned pod hero dlaždicemi: co se děje dnes, o víkendu a během týdne.
// Odpovídá na první otázku návštěvníka („kam dnes večer?") dřív, než se
// zeptá, a bez hledání. Přepínač období filtruje v prohlížeči nad už
// načtenými akcemi, žádný další požadavek.
//
// Období, ve kterém nic není, se nepřednastaví: výchozí je první neprázdné
// (dnes, pak víkend, pak týden), ať člověk nevidí prázdno jako první dojem.
export default function LandingToday({ events, loading }) {
    const today = useMemo(() => new Date(), [])
    const future = useMemo(() => upcoming(events, today), [events, today])

    const counts = useMemo(() => Object.fromEntries(
        RANGES.map(r => [r.value, future.filter(e => inRange(e.date, r.value, today)).length])
    ), [future, today])

    const [picked, setPicked] = useState(null)
    const range = picked ?? (RANGES.find(r => counts[r.value] > 0)?.value ?? 'tyden')
    const items = useMemo(() => future.filter(e => inRange(e.date, range, today)), [future, range, today])

    const trackRef = useRef(null)
    function scrollByCard(direction) {
        const track = trackRef.current
        if (!track) return
        const card = track.querySelector('.lt-card')
        const step = card ? card.getBoundingClientRect().width + 16 : 300
        track.scrollBy({ left: direction * step * 2, behavior: 'smooth' })
    }

    return (
        <Reveal as="section" className="lp-section lt" aria-labelledby="lt-h">
            <div className="lp-wrap">
                <div className="lp-head enter" style={{ '--i': 0 }}>
                    <div>
                        <h2 id="lt-h" className="lp-h2">Kam dnes večer?</h2>
                        <p className="lp-lead">Co se děje dnes, o víkendu a v nejbližších dnech.</p>
                    </div>

                    <div className="lt-controls">
                        <div className="lp-chips" role="group" aria-label="Období">
                            {RANGES.map(r => (
                                <button
                                    key={r.value}
                                    type="button"
                                    className="lp-chip"
                                    aria-pressed={range === r.value}
                                    onClick={() => setPicked(r.value)}
                                >
                                    {r.label}
                                    <span className="lp-chip-n">{counts[r.value]}</span>
                                </button>
                            ))}
                        </div>
                        <div className="lt-arrows">
                            <button type="button" className="lt-arrow" onClick={() => scrollByCard(-1)} aria-label="Zpět">
                                <ArrowLeft />
                            </button>
                            <button type="button" className="lt-arrow" onClick={() => scrollByCard(1)} aria-label="Dál">
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lt-bleed">
                {loading ? (
                    <div className="lt-track" aria-hidden="true">
                        {[0, 1, 2, 3].map(i => <div key={i} className="lt-card lt-card--skeleton skeleton" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="lp-wrap">
                        <div className="lt-empty">
                            <p>V tomhle období zatím nic nemáme.</p>
                            <Link to="/events" className="lp-link">Všechny akce <ArrowRight /></Link>
                        </div>
                    </div>
                ) : (
                    <div className="lt-track" ref={trackRef} tabIndex={-1}>
                        {items.map((event, i) => {
                            const parts = dayParts(event.date)
                            const badge = eventBadge(event.date, today)
                            return (
                                <Link
                                    key={event.id}
                                    to={`/events/${event.id}`}
                                    className="lt-card enter"
                                    style={{ '--i': i + 1 }}
                                >
                                    <span className="lt-media" style={eventVisual(event)} aria-hidden="true" />
                                    <span className="lt-scrim" aria-hidden="true" />

                                    {parts && (
                                        <span className="lt-date" aria-hidden="true">
                                            <b>{parts.day}</b>
                                            <i>{parts.month}</i>
                                        </span>
                                    )}
                                    {badge && <span className="lt-flag">{badge.text}</span>}

                                    <span className="lt-body">
                                        <span className="lt-title">{event.name}</span>
                                        <span className="lt-where"><PinIcon size={14} />{event.location}</span>
                                    </span>
                                    <span className="lt-go" aria-hidden="true"><ArrowUpRight /></span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </Reveal>
    )
}
