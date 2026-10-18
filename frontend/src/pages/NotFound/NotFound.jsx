import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import EventPoster from '../../components/events/EventPoster/EventPoster.jsx'
import { ArrowRight, SearchIcon } from '../../components/landing/icons.jsx'
import { getEvents } from '../../lib/eventsApi.js'
import { initMode } from '../../lib/landingTheme.js'
import cityHeroPoster from '../../components/scenes/posters/city-hero.webp'
import cityHeroMp4 from '../../components/scenes/videos/city-hero.mp4'
import '../../components/landing/landing.css'
import './NotFound.css'

// Stránka 404 ve stejném jazyce jako stránky kategorií: noční Plzeň pod průhlednou lištou,
// pod ní list stránky v tématu (světlém nebo tmavém). Je to slepá ulička, takže místo
// omluvy nabízí cesty dál: hledání, rychlé odkazy a pár nejbližších akcí.
//
// Scéna je stejné video jako na stránce TOP akce (`city-hero`), jen vykadrované od oblohy:
// pás je nižší než na kategoriích a spodek stejně zakrývá list stránky, takže se ořízne
// ulice dole, ne měsíc a věže nahoře. Dokud video neběží (nebo když je omezení animací či
// úspora dat), je vidět první snímek.
//
// SPA nemůže vrátit stavový kód 404, proto stránka za běhu přidá <meta name="robots"
// content="noindex">, ať si ji vyhledávače nezapamatují jako obsah.

const LINKS = [
    { to: '/events?datum=dnes', label: 'Dnes v Plzni' },
    { to: '/events?datum=vikend', label: 'Tento víkend' },
    { to: '/top-akce', label: 'TOP akce' },
    { to: '/events', label: 'Všechny akce' },
]

export default function NotFound() {
    const navigate = useNavigate()
    const [q, setQ] = useState('')
    // null = načítá se, [] = nic k ukázání (prázdná databáze nebo chyba), jinak akce
    const [events, setEvents] = useState(null)
    const today = useMemo(() => new Date(), [])

    useEffect(() => {
        document.documentElement.classList.add('theme-lp')
        initMode()
        return () => document.documentElement.classList.remove('theme-lp')
    }, [])

    useEffect(() => {
        const meta = document.createElement('meta')
        meta.name = 'robots'
        meta.content = 'noindex'
        document.head.appendChild(meta)
        return () => meta.remove()
    }, [])

    // Nejbližší akce jsou jen doplněk. Když se nenačtou, sekce se tiše vynechá a stránka
    // pořád plní svůj účel (hledání a odkazy v hero).
    useEffect(() => {
        let cancelled = false
        getEvents({ razeni: 'konani', perPage: 3 })
            .then(data => { if (!cancelled) setEvents(data.items ?? []) })
            .catch(() => { if (!cancelled) setEvents([]) })
        return () => { cancelled = true }
    }, [])

    function handleSubmit(e) {
        e.preventDefault()
        const text = q.trim()
        navigate(text ? `/events?q=${encodeURIComponent(text)}` : '/events')
    }

    return (
        <div className="lp nf">
            <CategoryHero
                compact
                background="#140602"
                video={{ mp4: cityHeroMp4, poster: cityHeroPoster, position: '50% 0%' }}
                crumbs={[{ to: '/', label: 'Plzeňák' }]}
                breadcrumbLabel="Chyba 404"
                title="Tady nic není"
            >
                <p className="nf-lead enter" style={{ '--i': 2 }}>
                    Tuhle stránku jsme nenašli. Možná akce skončila, přesunula se jinam, nebo v odkazu chybí písmenko.
                </p>

                <div className="nf-tools">
                    <form className="nf-search enter" style={{ '--i': 3 }} onSubmit={handleSubmit} role="search">
                        <label className="nf-search-field" htmlFor="nf-q">
                            <span className="visually-hidden">Hledat akci</span>
                            <SearchIcon />
                            <input
                                id="nf-q"
                                type="search"
                                placeholder="Hledat akci, místo nebo interpreta"
                                value={q}
                                onChange={e => setQ(e.target.value)}
                            />
                        </label>
                        <button type="submit" className="lp-btn nf-search-btn">
                            Hledat
                            <span className="lp-btn-ic"><ArrowRight /></span>
                        </button>
                    </form>

                    <ul className="nf-links enter" style={{ '--i': 4 }}>
                        {LINKS.map(link => (
                            <li key={link.to}>
                                <Link to={link.to} className="nf-link">{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </CategoryHero>

            <div className="lp-sheet">
                <section className="lp-wrap nf-more" aria-labelledby="nf-more-h">
                    {events === null || events.length > 0 ? (
                        <>
                            <div className="lp-head">
                                <h2 id="nf-more-h" className="lp-h2">Co se děje v Plzni</h2>
                                <Link to="/events" className="lp-link">
                                    Všechny akce
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                            <div className="nf-grid">
                                {events === null
                                    ? Array.from({ length: 3 }, (_, i) => (
                                        <div key={i} className="ep ep--skeleton skeleton" aria-hidden="true" />
                                    ))
                                    : events.map((event, i) => (
                                        <EventPoster key={event.id} event={event} index={i} today={today} />
                                    ))}
                            </div>
                        </>
                    ) : (
                        <div className="nf-home">
                            <h2 id="nf-more-h" className="visually-hidden">Další cesty</h2>
                            <Link to="/" className="lp-btn">
                                Zpět na úvodní stránku
                                <span className="lp-btn-ic"><ArrowRight /></span>
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
