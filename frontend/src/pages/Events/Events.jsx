import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EventsHero from '../../components/EventsHero/EventsHero.jsx'
import EventsControls from '../../components/events/EventsControls/EventsControls.jsx'
import EventPoster from '../../components/events/EventPoster/EventPoster.jsx'
import EventTicket from '../../components/events/EventTicket/EventTicket.jsx'
import EventsPager from '../../components/events/EventsPager/EventsPager.jsx'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import { CloseIcon } from '../../components/landing/icons.jsx'
import { getEvents, getEventLocations } from '../../lib/eventsApi.js'
import { SORT_OPTIONS } from '../../lib/filters/sortOptions.js'
import { eventCountLabel } from '../../lib/events/pluralize.js'
import { initMode } from '../../lib/landingTheme.js'
import '../../components/landing/landing.css'
import './Events.css'

// Stránka Akce, postavená od nuly 2026-10-04. Hero (EventsHero) byl 2026-10-05
// rozšířený o vrstvy, dominanty a kartu s nejbližší akcí. Všechno ostatní je nové a drží se stejného jazyka jako
// homepage: téma přes tokeny --lp-*, světlé výchozí, tmavé přepínačem v liště.
//
// Stav seznamu žije jen v URL (q, kategorie, misto, datum, top, razeni), takže
// jde odkaz sdílet a tlačítko Zpět funguje. Číslo stránky je stav v komponentě.
// Stránkuje backend (GET /api/events?page=&perPage=).
const PER_PAGE = 12

export default function Events() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [locations, setLocations] = useState([])
    const [view, setView] = useState('grid')
    const today = useMemo(() => new Date(), [])

    // Téma stránky je celostránkové, stejně jako na homepage (viz Home.jsx).
    useEffect(() => {
        document.documentElement.classList.add('theme-lp')
        initMode()
        return () => document.documentElement.classList.remove('theme-lp')
    }, [])

    const applied = {
        q: searchParams.get('q') || '',
        kategorie: searchParams.get('kategorie') || '',
        misto: searchParams.get('misto') || '',
        datum: searchParams.get('datum') || '',
        top: searchParams.get('top') === '1',
    }
    const razeni = searchParams.get('razeni') || 'konani'

    const hasAppliedFilters = Boolean(applied.q || applied.kategorie || applied.misto || applied.datum || applied.top)

    useEffect(() => {
        getEventLocations().then(setLocations).catch(console.error)
    }, [])

    useEffect(() => {
        setLoading(true)
        getEvents({
            q: applied.q,
            kategorie: applied.kategorie,
            misto: applied.misto,
            datum: applied.datum,
            top: applied.top ? '1' : '',
            razeni,
            page,
            perPage: PER_PAGE,
        })
            .then(data => { setItems(data.items); setTotal(data.total) })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [applied.q, applied.kategorie, applied.misto, applied.datum, applied.top, razeni, page])

    // Změní část filtru a ponechá zbytek. Prázdná hodnota a false parametr smažou.
    function update(patch) {
        const next = new URLSearchParams(searchParams)
        Object.entries(patch).forEach(([key, value]) => {
            if (value === '' || value === false || value == null) next.delete(key)
            else next.set(key, value === true ? '1' : value)
        })
        setSearchParams(next)
        setPage(1)
    }

    function clearFilters() {
        const next = new URLSearchParams()
        if (razeni !== 'konani') next.set('razeni', razeni)
        setSearchParams(next)
        setPage(1)
    }

    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

    // Tlačítko v hero odroluje k ovládání a dá fokus do hledání. Plynule, ledaže má
    // člověk zapnuté omezení pohybu.
    function focusSearch() {
        const input = document.getElementById('ec-q')
        if (!input) return
        const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        input.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
        input.focus({ preventScroll: true })
    }

    return (
        <div id="events-page" className="lp ev">
            <EventsHero onSearch={focusSearch} />

            <div className="lp-sheet">
            <div className="lp-wrap ev-controls lp-sheet-lift">
                <EventsControls applied={applied} locations={locations} loading={loading} onChange={update} />
            </div>

            <section className="lp-wrap ev-results" aria-labelledby="ev-count">
                <div className="ev-bar">
                    <div className="ev-count-block">
                        <h2 id="ev-count" className="ev-count" aria-live="polite">
                            {loading ? ' ' : eventCountLabel(total)}
                        </h2>
                        <span className="ev-count-note">od dneška</span>
                    </div>

                    <div className="ev-tools">
                        {hasAppliedFilters && (
                            <button type="button" className="ev-clear" onClick={clearFilters}>
                                <CloseIcon size={14} />
                                Vymazat filtry
                            </button>
                        )}
                        <div className="lp-fs ev-sort">
                            <FilterSelect
                                placeholder="Řazení"
                                value={razeni}
                                onChange={v => update({ razeni: v === 'konani' ? '' : v })}
                                options={SORT_OPTIONS}
                                clearable={false}
                                icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
                                    </svg>
                                }
                            />
                        </div>
                        <div className="lp-chips" role="group" aria-label="Zobrazení">
                            <button type="button" className="lp-chip" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                                Mřížka
                            </button>
                            <button type="button" className="lp-chip" aria-pressed={view === 'list'} onClick={() => setView('list')}>
                                Seznam
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={view === 'list' ? 'ev-list' : 'ev-grid'} role="status" aria-label="Načítání akcí">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className={`${view === 'list' ? 'et et--skeleton' : 'ep ep--skeleton'} skeleton`} aria-hidden="true" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="ev-empty">
                        <p>{hasAppliedFilters ? 'Žádné akce neodpovídají hledání.' : 'Zatím tu nejsou žádné nadcházející akce.'}</p>
                        {hasAppliedFilters && (
                            <button type="button" className="lp-btn" onClick={clearFilters}>
                                Vymazat filtry
                                <span className="lp-btn-ic"><CloseIcon size={16} /></span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={view === 'list' ? 'ev-list' : 'ev-grid'} key={`${view}-${page}-${total}`}>
                        {items.map((event, i) => view === 'list'
                            ? <EventTicket key={event.id} event={event} index={i} today={today} />
                            : <EventPoster key={event.id} event={event} index={i} today={today} />
                        )}
                    </div>
                )}

                <EventsPager page={page} totalPages={totalPages} onChange={setPage} />
            </section>
            </div>
        </div>
    )
}
