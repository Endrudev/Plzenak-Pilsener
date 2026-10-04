import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../../components/EventCard/EventCard.jsx'
import EventCardSkeleton from '../../components/EventCardSkeleton/EventCardSkeleton.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import BuildingSkyline from '../../components/NightSkyline/BuildingSkyline.jsx'
import { getEvents, getEventLocations } from '../../lib/eventsApi.js'
import { useSearchParams } from 'react-router-dom'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import { CATEGORIES } from '../../lib/filters/categories.jsx'
import { DATE_OPTIONS } from '../../lib/filters/dateFilters.js'
import { SORT_OPTIONS } from '../../lib/filters/sortOptions.js'
import { eventCountLabel } from '../../lib/events/pluralize.js'
import './Events.css'

// Časové filtry patří do dropdownu Datum, ne mezi pilulky — jinak by dva prvky
// zapisovaly do stejného parametru a přebíjely se. Tady zůstávají jen značky.
const QUICK_FILTERS = [
  {
    name: 'Zdarma', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v1.6a2 2 0 0 0 0 3.8v1.6A1.5 1.5 0 0 1 18.5 17h-13A1.5 1.5 0 0 1 4 15.5v-1.6a2 2 0 0 0 0-3.8z" /><path d="M14 7v10" strokeDasharray="2 2.4" />
      </svg>
    )
  },
  {
    name: 'TOP akce', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 4 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />
      </svg>
    )
  },
]

const EMPTY_FILTERS = { q: '', kategorie: '', misto: '', datum: '', top: false }

// Osmicípá hvězda — stejný tvar jako v TOP akce dlaždici (HeroTileTop.jsx),
// tady zase samostatně, protože instance jsou dvě rozdílná místa appky.
const STAR_D = 'M0 -6L1.3 -1.3L6 0L1.3 1.3L0 6L-1.3 1.3L-6 0L-1.3 -1.3Z'

// 30 hvězd doslova ze zdroje (Events.dc.html, kontejner "t-top on" nad
// siluetou střech) — pozice/velikosti/q-třídy (rozhazují délku/zpoždění
// blikání, viz Events.css) 1:1 podle handoffu.
const EVENTS_STARS = [
  { l: 474, t: 102, s: 8, q: '' }, { l: 268, t: 57, s: 5, q: 'q1' }, { l: 184, t: 43, s: 6, q: 'q2' },
  { l: 1047, t: 61, s: 8, q: 'q3' }, { l: 1324, t: 15, s: 8, q: '' }, { l: 1008, t: 124, s: 8, q: 'q1' },
  { l: 1023, t: 57, s: 8, q: 'q2' }, { l: 193, t: 132, s: 6, q: 'q3' }, { l: 50, t: 76, s: 10, q: '' },
  { l: 844, t: 129, s: 8, q: 'q1' }, { l: 242, t: 74, s: 5, q: 'q2' }, { l: 139, t: 106, s: 10, q: 'q3' },
  { l: 782, t: 35, s: 5, q: '' }, { l: 703, t: 68, s: 5, q: 'q1' }, { l: 1029, t: 140, s: 6, q: 'q2' },
  { l: 1200, t: 44, s: 10, q: 'q3' }, { l: 141, t: 146, s: 5, q: '' }, { l: 1010, t: 57, s: 6, q: 'q1' },
  { l: 1195, t: 124, s: 10, q: 'q2' }, { l: 921, t: 81, s: 10, q: 'q3' }, { l: 740, t: 117, s: 6, q: '' },
  { l: 334, t: 32, s: 10, q: 'q1' }, { l: 1423, t: 88, s: 7, q: 'q2' }, { l: 1328, t: 134, s: 10, q: 'q3' },
  { l: 1287, t: 58, s: 7, q: '' }, { l: 317, t: 99, s: 10, q: 'q1' }, { l: 592, t: 138, s: 5, q: 'q2' },
  { l: 1049, t: 147, s: 6, q: 'q3' }, { l: 714, t: 70, s: 5, q: '' }, { l: 615, t: 95, s: 6, q: 'q1' },
  { l: 556, t: 16, s: 8, q: 'q2' }, { l: 531, t: 104, s: 7, q: 'q3' }, { l: 863, t: 52, s: 8, q: '' },
  { l: 248, t: 50, s: 5, q: 'q1' },
]

export default function Events() {
  const PER_PAGE = 5

  const [allEvents, setAllEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const [locations, setLocations] = useState([])
  // Handoff přepíná Mřížka/Seznam (ne "Mapa", jak měl dřív náš UI stub —
  // opravdovou mapu appka nemá). Oba varianty EventCard už existují
  // (Fáze 2), takže tohle je jen přepínání view, žádná nová logika.
  const [view, setView] = useState('grid')

  // POUŽITÝ stav — co se skutečně filtruje. Jediným zdrojem pravdy je URL.
  const applied = {
    q: searchParams.get('q') || '',
    kategorie: searchParams.get('kategorie') || '',
    misto: searchParams.get('misto') || '',
    datum: searchParams.get('datum') || '',
    top: searchParams.get('top') === '1',
  }
  // Řazení stojí mimo filtr bar, takže se použije okamžitě a nečeká na tlačítko
  const razeni = searchParams.get('razeni') || 'konani'

  // ROZPRACOVANÝ stav — co má uživatel navolené, ale ještě neodeslal
  const [draft, setDraft] = useState(applied)

  // Když se URL změní zvenčí (tlačítko Zpět, odkaz z menu kategorií v hlavičce),
  // rozpracovaný stav se musí srovnat, jinak by bar ukazoval neplatné hodnoty.
  useEffect(() => {
    setDraft({
      q: searchParams.get('q') || '',
      kategorie: searchParams.get('kategorie') || '',
      misto: searchParams.get('misto') || '',
      datum: searchParams.get('datum') || '',
      top: searchParams.get('top') === '1',
    })
  }, [searchParams])

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
      .then(data => { setAllEvents(data.items); setTotal(data.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [applied.q, applied.kategorie, applied.misto, applied.datum, applied.top, razeni, page])

  // Je vůbec co mazat? Řazení se nepočítá, to není filtr.
  const hasAppliedFilters = Boolean(
    applied.q || applied.kategorie || applied.misto || applied.datum || applied.top
  )

  function setField(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  // Odeslání: rozpracovaný stav se najednou přepíše do URL a tím spustí fetch
  function handleSubmit(e) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (draft.q.trim()) next.set('q', draft.q.trim())
    if (draft.kategorie) next.set('kategorie', draft.kategorie)
    if (draft.misto) next.set('misto', draft.misto)
    if (draft.datum) next.set('datum', draft.datum)
    if (draft.top) next.set('top', '1')
    if (razeni !== 'konani') next.set('razeni', razeni)
    setSearchParams(next)
    setPage(1)
  }

  // Řazení mění URL rovnou, ostatní filtry nechává být
  function changeSort(value) {
    const next = new URLSearchParams(searchParams)
    if (value && value !== 'konani') next.set('razeni', value); else next.delete('razeni')
    setSearchParams(next)
    setPage(1)
  }

  function clearFilters() {
    setDraft(EMPTY_FILTERS)
    setSearchParams(new URLSearchParams())
    setPage(1)
  }

  // Stránkuje teď backend (GET /api/events?page=&perPage=) — allEvents je
  // rovnou jen viditelná stránka, žádné klientské .slice() navíc.
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div id="events-page">

      {/* Přechod header → tmavý pás. Zdroj (Events.dc.html) tuhle plochu
          nekreslí jen jako baráky — je to celá "noční obloha" o výšce 280px
          s vlastním 4stupňovým gradientem, 30 hvězdami, dvěma padajícími,
          měsícem a teplou zářivou skvrnou dole, teprve POD tím sedí
          silueta střech. Baráky samotné pořád BuildingSkyline (stejná
          technika jako Home.jsx/patička), zbytek doslova ze zdroje. */}
      <div id="events-hero-skyline-wrap" aria-hidden="true">
        {/* Doslovné px souřadnice ze zdroje (pevné 1440px plátno) — vodorovná
            pozice jako % (škáluje se s šířkou dlaždice), svislá pozice a
            velikost tvarů jako pevné px (výška pásu je vždycky přesně
            280px, a kulaté tvary — hvězdy, měsíc — by se v jednom
            neuniformně roztaženém <svg viewBox> (preserveAspectRatio=
            "none") zdeformovaly do elips podle toho, jak moc se skutečná
            šířka liší od 1440. Baráky pod tím to samé neuniformní
            roztažení mají dál (BuildingSkyline, stejně jako patička) —
            tam nevadí, je to jen silueta střech, ne kulaté tvary. */}
        <span id="events-sky">
          {EVENTS_STARS.map((s, i) => (
            <span key={i} className={`st ${s.q}`} style={{ left: `${(s.l / 1440) * 100}%`, top: `${s.t}px`, width: `${s.s}px`, height: `${s.s}px` }}>
              <svg width="100%" height="100%" viewBox="-6 -6 12 12" fill="currentColor"><path d={STAR_D} /></svg>
            </span>
          ))}
          <span className="shoot s1" style={{ left: `${(520 / 1440) * 100}%`, top: '96px' }} />
          <span className="shoot s2" style={{ left: `${(1220 / 1440) * 100}%`, top: '118px' }} />
        </span>
        <svg id="events-moon" width="46" height="46" viewBox="0 0 46 46" style={{ left: `${(1180 / 1440) * 100}%`, top: '96px' }}>
          <path d="M40 36a22 22 0 1 1 -17 -34a17 17 0 1 0 17 34Z" fill="var(--color-top-moon)" />
        </svg>
        <span id="events-sky-glow" />
        <BuildingSkyline className="events-hero-skyline" backSeed={53} frontSeed={29} winSeed={13} />
      </div>

      {/* Tmavý hero pás podle handoffu (Events.dc.html, sekce akce-h) —
          drobečková navigace, nadpis, podtitul, hledací pruh se třemi
          dropdowny (Kdy/Co/Kde). Čtvrtý z handoffu (Cena) chybí záměrně —
          stejný důvod jako v sekci Hledání na Home.jsx: DB nemá sloupec
          na cenu. */}
      <div id="events-hero">
        <nav id="events-breadcrumb" aria-label="Drobečková navigace">
          <Link to="/">Plzeňák</Link> / <span>Akce</span>
        </nav>
        <div id="events-hero-heading">
          <h1 id="events-h">Akce v Plzni</h1>
          <p>Koncerty, divadlo, trhy i akce pro děti. Vyhledej, vyfiltruj a vyber si, kam dnes vyrazíš.</p>
        </div>

        {/* Filtr bar — celý je <form>: hodnoty se drží v `draft` a do URL (a tím
            do fetche) se zapíšou až odesláním. Řazení stojí mimo a mění URL rovnou. */}
        <form id="events-search-form" onSubmit={handleSubmit}>
          <div id="events-search-bar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
            </svg>
            <label htmlFor="events-q" className="visually-hidden">Hledat akce, místa nebo interprety</label>
            <input
              id="events-q"
              type="search"
              placeholder="Hledej akce, místa nebo interprety…"
              value={draft.q}
              onChange={e => setField('q', e.target.value)}
            />
            <button type="submit" id="events-search-bar-btn" disabled={loading}>
              {loading ? 'Hledám…' : 'Hledat'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div id="events-search-filters">
            <FilterSelect
              label="Kdy"
              placeholder="Kdykoli"
              value={draft.datum}
              onChange={v => setField('datum', v)}
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
              value={draft.kategorie}
              onChange={v => setField('kategorie', v)}
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
              value={draft.misto}
              onChange={v => setField('misto', v)}
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

      {/* Doplňkové filtry (kategorijní pilulky, rychlý filtr TOP akce) —
          handoff je nemá jako samostatný řádek, ale funkčně se hodí a
          nekoliduje s ničím výš, tak zůstávají. */}
      <div id="events-extra-filters">
        <div className="events-filter-group">
          <span className="events-filter-group-label">Kategorie</span>
          <div className="events-pill-row">
            {CATEGORIES.map(c => (
              <button
                type="button"
                key={c.name}
                className={`events-pill${draft.kategorie.toLowerCase() === c.name.toLowerCase() ? ' events-pill--active' : ''}`}
                onClick={() => setField('kategorie', draft.kategorie === c.name ? '' : c.name)}
              >
                <span aria-hidden="true">{c.icon(16)}</span> {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="events-filter-group">
          <span className="events-filter-group-label">Rychlý filtr</span>
          <div className="events-pill-row">
            {QUICK_FILTERS.map(f => {
              // „Zdarma“ nemá v datech oporu (chybí údaj o ceně), zůstává vypnutá
              if (f.name !== 'TOP akce') {
                return (
                  <button type="button" key={f.name} className="events-pill" disabled>
                    <span aria-hidden="true">{f.icon}</span> {f.name}
                  </button>
                )
              }

              return (
                <button
                  type="button"
                  key={f.name}
                  className={`events-pill${draft.top ? ' events-pill--active' : ''}`}
                  aria-pressed={draft.top}
                  onClick={() => setField('top', !draft.top)}
                >
                  <span aria-hidden="true">{f.icon}</span> {f.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Počet výsledků + řazení + přepínač Mřížka/Seznam — podle handoffu
          (tam měl přepínač tahle dvě možnosti, ne "Seznam/Mapa" jako náš
          dřívější neaktivní stub; appka reálnou mapu nemá, ale OBĚ varianty
          karty (grid/list) už existují, takže tohle je teď skutečně funkční). */}
      <div id="events-sort-row">
        <div id="events-count-block">
          <span id="events-count" aria-live="polite">
            {!loading && eventCountLabel(total)}
          </span>
          <span id="events-count-label">v Plzni od dneška</span>
        </div>

        <div id="events-sort-row-controls">
          {hasAppliedFilters && (
            <button type="button" id="events-clear-btn" onClick={clearFilters}>
              Vymazat filtry
            </button>
          )}
          <FilterSelect
            label="Řadit"
            placeholder="Řazení"
            value={razeni}
            onChange={changeSort}
            options={SORT_OPTIONS}
            clearable={false}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
              </svg>
            }
          />
          <div id="events-view-toggle" role="group" aria-label="Zobrazení">
            <button
              type="button"
              className={`events-view-toggle-btn${view === 'grid' ? ' events-view-toggle-btn--active' : ''}`}
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" />
              </svg>
              Mřížka
            </button>
            <button
              type="button"
              className={`events-view-toggle-btn${view === 'list' ? ' events-view-toggle-btn--active' : ''}`}
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="5" width="16" height="5" rx="1.5" /><rect x="4" y="14" width="16" height="5" rx="1.5" />
              </svg>
              Seznam
            </button>
          </div>
        </div>
      </div>

      <div id="events-list" className={view === 'list' ? 'events-list--list' : 'events-list--grid'}>
        {loading
          ? <EventCardSkeleton />
          : allEvents.length === 0
            ? (
              <EmptyState
                title="Žádné akce neodpovídají hledání."
                onReset={hasAppliedFilters ? clearFilters : undefined}
              />
            )
            : allEvents.map((event, i) => <EventCard key={event.id} event={event} variant={view} index={i} />)
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

    </div>
  )
}
