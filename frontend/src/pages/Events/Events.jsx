import { useState, useEffect } from 'react'
import EventCard from '../../components/EventCard/EventCard.jsx'
import { getEvents, getEventLocations } from '../../lib/eventsApi.js'
import { useSearchParams } from 'react-router-dom'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import './Events.css'

const CATEGORIES = [
  {
    name: 'Kultura', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h7v5a3.5 3.5 0 0 1-7 0z" /><circle cx="6.2" cy="7.2" r=".6" fill="currentColor" stroke="none" /><circle cx="8.8" cy="7.2" r=".6" fill="currentColor" stroke="none" /><path d="M13 9h7v5a3.5 3.5 0 0 1-7 0z" /><circle cx="15.2" cy="11.2" r=".6" fill="currentColor" stroke="none" /><circle cx="17.8" cy="11.2" r=".6" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    name: 'Sport', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" /><path d="m12 8.8 3.04 2.21-1.16 3.58h-3.76l-1.16-3.58z" /><path d="M12 8.8V3.6M15.04 11.01 19.9 9.4M13.88 14.59 17 18.7M10.12 14.59 7 18.7M8.96 11.01 4.1 9.4" />
      </svg>
    )
  },
  {
    name: 'Gastro', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 8.5h8.5V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2z" /><path d="M14 11h2.5a2.75 2.75 0 0 1 0 5.5H14" /><path d="M5.5 8.5a2.2 2.2 0 0 1 2-2.2 2.6 2.6 0 0 1 4.5-1.5A2.3 2.3 0 0 1 14 8.5" />
      </svg>
    )
  },
  {
    name: 'Hudba', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V6.2l10-2V16" /><circle cx="6.8" cy="18" r="2.2" /><circle cx="16.8" cy="16" r="2.2" />
      </svg>
    )
  },
  {
    name: 'Památky', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3.5 9.5 8.5-5.5 8.5 5.5" /><path d="M3.5 19.5h17M4.8 9.5v10M9.6 9.5v10M14.4 9.5v10M19.2 9.5v10" />
      </svg>
    )
  },
  {
    name: 'Pro děti', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15c2.8 0 5-2.5 5-5.6S14.8 4 12 4 7 6.4 7 9.4 9.2 15 12 15Z" /><path d="m11 15.2 1 1.3 1-1.3" /><path d="M12 16.5c0 1.2-1.5 1.2-1.5 2.4s1.5 1.2 1.5 2.4" />
      </svg>
    )
  },
]

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

// Hodnoty musí sedět s tabulkou DATE_FILTERS na backendu (routes/events.js)
const DATE_OPTIONS = [
  { value: 'dnes', label: 'Dnes' },
  { value: 'vikend', label: 'Tento víkend' },
  { value: '7dni', label: 'Nejbližších 7 dní' },
  { value: '30dni', label: 'Nejbližších 30 dní' },
]

// Řazení, ne filtr — proto se použije hned, bez čekání na tlačítko
const SORT_OPTIONS = [
  { value: 'konani', label: 'Nejdřív se koná' },
  { value: 'pridano', label: 'Naposledy přidané' },
]

const EMPTY_FILTERS = { q: '', kategorie: '', misto: '', datum: '', top: false }

export default function Events() {
  const PER_PAGE = 5

  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const [locations, setLocations] = useState([])

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
    })
      .then(data => setAllEvents(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [applied.q, applied.kategorie, applied.misto, applied.datum, applied.top, razeni])

  // Kolik polí se liší od použitého stavu — pohání vzhled tlačítka
  const pendingCount = ['q', 'kategorie', 'misto', 'datum', 'top']
    .filter(key => (key === 'q' ? draft.q.trim() !== applied.q : draft[key] !== applied[key]))
    .length

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

  const totalPages = Math.max(1, Math.ceil(allEvents.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleEvents = allEvents.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  function getPaginationItems() {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    return [1, 2, 3, 4, '...', totalPages]
  }

  return (
    <div id="events-page">

      {/* Filter bar — hledání, Kategorie a Místo jsou napojené na URL params a server-side filtrování.
          TODO: select "Datum" a tlačítko "Vyhledat" zatím nic nedělají (řazení neexistuje vůbec). */}
      <form id="events-filter-card" onSubmit={handleSubmit}>
        <div id="events-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Hledat koncerty…" 
            aria-label="Hledat akce"
            value={draft.q}
            onChange={e => setField('q', e.target.value)}
          />
        </div>

        <div id="events-filter-row">
          <FilterSelect
            placeholder="Kategorie"
            value={draft.kategorie}
            onChange={v => setField('kategorie', v)}
            options={CATEGORIES.map(c => ({ value: c.name, label: c.name, icon: c.icon }))}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            }
          />
          <FilterSelect
            placeholder="Místo"
            value={draft.misto}
            onChange={v => setField('misto', v)}
            options={locations.map(loc => ({ value: loc, label: loc }))}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            }
          />
          <FilterSelect
            placeholder="Datum"
            value={draft.datum}
            onChange={v => setField('datum', v)}
            options={DATE_OPTIONS}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
          <button
            type="submit"
            id="events-search-btn"
            className={pendingCount > 0 ? 'events-search-btn--pending' : ''}
            disabled={loading}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {loading ? 'Hledám…' : pendingCount > 0 ? `Vyhledat (${pendingCount})` : 'Vyhledat'}
          </button>
        </div>

        <div className="events-filter-divider" />

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
              <span aria-hidden="true">{c.icon}</span> {c.name}
            </button>
            ))}
          </div>
        </div>

        <div className="events-filter-divider" />

        <div id="events-filter-group-row">
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

          <div id="events-view-toggle">
            <button type="button" className="events-view-toggle-btn events-view-toggle-btn--active">Seznam</button>
            <button type="button" className="events-view-toggle-btn">Mapa</button>
          </div>
        </div>
      </form>

      <div id="events-sort-row">
        {hasAppliedFilters && (
          <button type="button" id="events-clear-btn" onClick={clearFilters}>
            Vymazat filtry
          </button>
        )}
        <span id="events-sort-label">Řadit podle</span>
        <FilterSelect
          placeholder="Řazení"
          value={razeni}
          onChange={changeSort}
          options={SORT_OPTIONS}
          clearable={false}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="20" x2="6" y2="4" /><polyline points="2 8 6 4 10 8" /><line x1="18" y1="4" x2="18" y2="20" /><polyline points="14 16 18 20 22 16" />
            </svg>
          }
        />
      </div>

      <div id="events-section-header">
        <h2>Všechny akce</h2>
        <span id="events-count" aria-live="polite">
          {!loading && `Zobrazeno ${visibleEvents.length} z ${allEvents.length} akcí`}
        </span>
      </div>

      <div id="events-list">
        {loading
          ? <p id="events-loading">Načítání…</p>
          : allEvents.length === 0
            ? <p id="events-loading">Žádné akce neodpovídají hledání.</p>
            : visibleEvents.map(event => <EventCard key={event.id} event={event} />)
        }
      </div>

      <div id="pagination">
        {getPaginationItems().map((item, i) =>
          item === '...' ? (
            <span key={i} className="pagination-dots">…</span>
          ) : (
            <button
              key={item}
              className={`pagination-btn${currentPage === item ? ' pagination-btn--active' : ''}`}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          )
        )}
      </div>

    </div>
  )
}
