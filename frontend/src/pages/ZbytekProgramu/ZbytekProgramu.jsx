import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import { useEventsFilter } from '../../lib/useEventsFilter.js'
import { SORT_OPTIONS } from '../../lib/sortOptions.js'
import { eventCountLabel } from '../../lib/pluralize.js'
import '../../styles/categoryPage.css'

// "Zbytek programu" = všechno KROMĚ TOP akce a Hudby (ty mají svoje
// vlastní stránky/dlaždice) — filtr vyloučením přes nový parametr
// `vyjma` na backendu (routes/events.js), ne kladný výběr kategorie
// jako TopAkce.jsx/Hudba.jsx. Viz TopAkce.jsx pro plně okomentovaný
// základní vzor.
const FIXED = { vyjma: 'TOP akce,Hudba' }

export default function ZbytekProgramu() {
  const { items, total, totalPages, loading, q, razeni, page, setQuery, setSort, setPage } = useEventsFilter(FIXED, 12)

  return (
    <div className="catpage">
      <CategoryHero
        eyebrow="Kategorie"
        title="Zbytek programu"
        lead="Gastro, kultura, sport, památky i akce pro děti — všechno ostatní, co se v Plzni děje."
        skylineSeeds={{ back: 53, front: 29, win: 13 }}
      />

      <div className="catpage-toolbar">
        <div className="catpage-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Hledat v programu…"
            aria-label="Hledat v programu"
            defaultValue={q}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="catpage-row">
          <span className="catpage-count" aria-live="polite">
            {!loading && `${eventCountLabel(total)} v programu`}
          </span>
          <FilterSelect
            label="Řadit"
            placeholder="Řazení"
            value={razeni}
            onChange={setSort}
            options={SORT_OPTIONS}
            clearable={false}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
              </svg>
            }
          />
        </div>
      </div>

      <div className="catpage-grid">
        {loading
          ? <p className="catpage-loading">Načítání…</p>
          : items.length === 0
            ? <EmptyState title="Žádné další akce zatím nejsou vyhlášené." />
            : items.map(event => <EventCard key={event.id} event={event} />)
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
