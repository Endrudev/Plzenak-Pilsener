import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LazyCityScene } from '../scenes/LazyScenes.jsx'
import { ArrowRight, ArrowUpRight, PinIcon } from '../landing/icons.jsx'
import { getEvents } from '../../lib/eventsApi.js'
import { dayParts } from '../../lib/events/dateRanges.js'
import { eventBadge } from '../../lib/events/eventBadge.js'
import './EventsHero.css'

// Hero stránky Akce: noční Plzeň z papíru (CityScene z balíčku plzenak-scenes, tatáž
// scéna jako v dlaždici a na stránce TOP akce), text a karta s nejbližší akcí.
//
// Scéna sama kreslí hvězdy, padající hvězdy, katedrálu, synagogu, radnici, vodárnu,
// pivovar, rozsvěcující se okna, tramvaj a kouř z komínů, proto tu není žádná
// vlastní obloha ani silueta. Do 2026-10-05 měla stránka vlastní vrstvy (hvězdy,
// girlandy, lampiony, ohňostroj), nahradila je scéna, aby vypadala stejně jako TOP akce.
//
// Scéna je kreslená na 16:9 a vyplní šířku, takže se ořízne shora. Dole je pruh
// "země" v barvě země ve scéně, do kterého zajíždí ovládací deska.

// Karta s nejbližší akcí. Bez štítku nad ní: je to karta akce s datem, to stačí.
function NextEvent({ event }) {
    const parts = dayParts(event.date)
    const badge = eventBadge(event.date)

    return (
        <Link to={`/events/${event.id}`} className="eh-next enter" style={{ '--i': 4 }}>
            <span className="eh-next-core">
                {parts && (
                    <span className="eh-next-date" aria-hidden="true">
                        <b>{parts.day}</b>
                        <i>{parts.month}</i>
                    </span>
                )}
                <span className="eh-next-body">
                    <span className="eh-next-title">{event.name}</span>
                    <span className="eh-next-where"><PinIcon size={14} />{event.location}</span>
                </span>
                <span className="eh-next-go" aria-hidden="true"><ArrowUpRight size={20} /></span>
            </span>
            <span className="visually-hidden">Nejbližší akce, {badge ? `${badge.text}, ` : ''}{event.date}</span>
        </Link>
    )
}

export default function EventsHero({ onSearch }) {
    const [next, setNext] = useState(null)

    // Nejbližší nadcházející akce, nezávisle na filtrech seznamu. Selhání se
    // tiše přeskočí, hero funguje i bez karty.
    useEffect(() => {
        let cancelled = false
        getEvents({ razeni: 'konani', perPage: 1 })
            .then(data => { if (!cancelled) setNext(data.items?.[0] ?? null) })
            .catch(() => {})
        return () => { cancelled = true }
    }, [])

    return (
        <header className="eh">
            <div className="eh-scene">
                <div className="eh-scene-in">
                    <LazyCityScene shade label="Noční Plzeň z papíru" />
                </div>
            </div>

            <div className="lp-wrap eh-in">
                <div className="eh-text">
                    <nav className="eh-crumbs enter" style={{ '--i': 0 }} aria-label="Drobečková navigace">
                        <Link to="/">Plzeňák</Link> / <span>Akce</span>
                    </nav>
                    <h1 className="eh-title enter" style={{ '--i': 1 }}>
                        Akce v <em>Plzni</em>
                    </h1>
                    <p className="eh-lead enter" style={{ '--i': 2 }}>
                        Koncerty, divadlo, trhy i akce pro děti. Najdi, co tě dnes večer zajímá.
                    </p>
                    <button type="button" className="lp-btn eh-cta enter" style={{ '--i': 3 }} onClick={onSearch}>
                        Hledat
                        <span className="lp-btn-ic"><ArrowRight /></span>
                    </button>
                </div>

                {next && <NextEvent event={next} />}
            </div>
        </header>
    )
}
