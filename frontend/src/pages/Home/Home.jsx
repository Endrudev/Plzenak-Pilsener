import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EventCard from '../../components/EventCard/EventCard.jsx'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import HeroBento from '../../components/HeroBento/HeroBento.jsx'
import CategoryTile from '../../components/CategoryTile/CategoryTile.jsx'
import BuildingSkyline from '../../components/NightSkyline/BuildingSkyline.jsx'
import { getEvents, getEventLocations } from '../../lib/eventsApi.js'
import { CATEGORIES } from '../../lib/categories.jsx'
import { DATE_OPTIONS } from '../../lib/dateFilters.js'
import './Home.css'
import { imageBackground } from '../../lib/imageBackground.js'

export default function Home() {
  const [events, setEvents] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Homepage je rozcestník, ne nástroj — odeslání nefiltruje tady, jen
  // přesměruje na /events s parametry. Tři dropdowny (Kdy/Co/Kde) sedí na
  // stejné backendové filtry (datum/kategorie/misto), co používá i /events
  // sama — čtvrtý z handoffu (Cena) tu chybí záměrně, DB nemá sloupec na
  // cenu, tak by šlo o neaktivní/klamavý ovládací prvek.
  const [search, setSearch] = useState({ q: '', kategorie: '', misto: '', datum: '' })

  function handleSearchSubmit(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.q.trim()) params.set('q', search.q.trim())
    if (search.kategorie) params.set('kategorie', search.kategorie)
    if (search.misto) params.set('misto', search.misto)
    if (search.datum) params.set('datum', search.datum)
    const query = params.toString()
    navigate(query ? `/events?${query}` : '/events')
  }

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data.items))
      .catch(console.error)
      .finally(() => setLoading(false))
    getEventLocations().then(setLocations).catch(console.error)
  }, [])

  const topEvents = events.filter(e => e.tags?.includes('TOP akce')).slice(0, 2)
  const nearestEvents = events.slice(0, 6)

  if (loading) {
    return <p id="home-loading">Načítání…</p>
  }

  return (
    <div id="home">

      <section id="hero">
        <HeroBento events={events} />
      </section>

      {/* Přechod hero → tmavý pás Hledání — stejná procedurální silueta budov
          jako patička (BuildingSkyline, sdílená komponenta), ne ploché
          čáry ze zdroje. Jiné seedy než patička, ať nejde o vizuální kopii,
          jen o stejnou techniku/kvalitu. */}
      <div id="search-skyline-wrap" aria-hidden="true">
        <BuildingSkyline className="search-skyline" backSeed={41} frontSeed={17} winSeed={9} />
      </div>

      {/* Sekce Hledání — tmavý pás navazující na hero. Tři dropdowny
          (Kdy/Co/Kde) posílají skutečné parametry, které /events umí
          zpracovat (datum/kategorie/misto). */}
      <section id="search-band" aria-labelledby="search-h">
        {/* Jemný černý glow — vlastní vrstva uvnitř #search-band, ne
            filter:drop-shadow na siluetě budov nad ním. Stín z filteru
            potřebuje volný prostor kolem zdroje a končil oříznutý o hranu
            kontejneru (buď žádný gap = ořízlý, nebo gap = viditelná mezera
            před pásem) — tahle vrstva leží celá uvnitř tmavého pásu, nic ji
            neořízne ani nezakryje. */}
        <div id="search-band-glow" aria-hidden="true" />
        <div id="search-inner">
          <div id="search-heading-row">
            <div id="search-heading-col">
              <span id="search-eyebrow">Hledání</span>
              <h2 id="search-h">Najdi si svůj večer</h2>
            </div>
            <Link to="/events" id="search-more">
              Podrobné hledání
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          <form id="search-form" onSubmit={handleSearchSubmit}>
            <div id="search-bar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
              </svg>
              <label htmlFor="search-q" className="visually-hidden">Hledat akce, místa nebo interprety</label>
              <input
                id="search-q"
                type="search"
                placeholder="Hledej akce, místa nebo interprety…"
                value={search.q}
                onChange={e => setSearch(s => ({ ...s, q: e.target.value }))}
              />
              <button type="submit" id="search-bar-btn">
                Hledat
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            <div id="search-filters">
              <FilterSelect
                label="Kdy"
                placeholder="Kdykoli"
                value={search.datum}
                onChange={v => setSearch(s => ({ ...s, datum: v }))}
                options={DATE_OPTIONS}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" />
                  </svg>
                }
              />
              <FilterSelect
                label="Co"
                placeholder="Všechny kategorie"
                value={search.kategorie}
                onChange={v => setSearch(s => ({ ...s, kategorie: v }))}
                options={CATEGORIES.map(c => ({ value: c.name, label: c.name, icon: c.icon(16) }))}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12l-8 8-9-9V3h8Z" /><circle cx="7.5" cy="7.5" r="1.5" />
                  </svg>
                }
              />
              <FilterSelect
                label="Kde"
                placeholder="Celá Plzeň"
                value={search.misto}
                onChange={v => setSearch(s => ({ ...s, misto: v }))}
                options={locations.map(loc => ({ value: loc, label: loc }))}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z" /><circle cx="12" cy="10" r="2.4" />
                  </svg>
                }
              />
            </div>
          </form>
        </div>
      </section>

      {/* TOP akce */}
      {topEvents.length > 0 && (
        <section id="top-section">
          <div className="home-section-header">
            <h2>Nepřehlédni</h2>
            <button type="button" className="pill-toggle">★ Jen TOP akce</button>
          </div>
          <div id="top-grid">
            {topEvents.map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className="top-card">
                <div
                  className={`top-card-image ${event.imageUrl ? '' : 'top-card-image--empty'}`}
                  style={imageBackground(event.imageUrl)}
                >
                  <span className="top-card-badge">★ TOP akce</span>
                </div>
                <div className="top-card-body">
                  {event.tags?.[1] && <span className="event-tag">{event.tags[1]}</span>}
                  <h3>{event.name}</h3>
                  {event.description?.[0] && <p>{event.description[0]}</p>}
                  <div className="event-meta">
                    {event.date && (
                      <span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="4.5" width="16" height="16.5" rx="2" /><path d="M4 9.5h16M8.5 3v3M15.5 3v3" />
                        </svg>
                        {event.date}
                      </span>
                    )}
                    {event.location && (
                      <span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" />
                        </svg>
                        {event.location}
                      </span>
                    )}
                  </div>
                  <span className="event-btn">Zobrazit →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nejbližší akce */}
      <section id="nearest-section">
        <div className="home-section-header">
          <h2>Nejbližší akce</h2>
          <Link to="/events" className="section-link">Zobrazit vše →</Link>
        </div>
        <div id="nearest-grid">
          {nearestEvents.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      </section>

      {/* Kategorie — nahrazuje i dřívější samostatnou promo sekci (statické
          "Gastro v Plzni"/"Památky v Plzni" karty čekající na 3D assety,
          které nikdy nedorazily) — handoff řeší propagaci kategorií jen
          touhle jednou mřížkou všech šesti, žádná duplicitní sekce vedle
          ní. TODO: Hudba/Památky/Pro děti zatím nejdou vybrat v
          AdminCreate, počty tedy budou 0. */}
      <section id="categories-section">
        <div className="home-section-header">
          <h2>Procházej podle kategorií</h2>
          <span id="categories-count">{CATEGORIES.length} témat · {events.length} akcí</span>
        </div>
        <div id="categories-grid">
          {CATEGORIES.map(cat => (
            <CategoryTile key={cat.name} cat={cat} count={events.filter(e => e.tags?.includes(cat.name)).length} />
          ))}
        </div>
      </section>

    </div>
  )
}
