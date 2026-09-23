import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import { useEventsFilter } from '../../lib/useEventsFilter.js'
import { SORT_OPTIONS } from '../../lib/sortOptions.js'
import { eventCountLabel } from '../../lib/pluralize.js'
import '../../styles/categoryPage.css'

const FIXED = { top: '1' }

// Dedikovaná stránka pro TOP akce (Fáze 5) — pevný filtr (`top=1`),
// uživatel ho nemůže vypnout, jen hledat textem a řadit (viz
// lib/useEventsFilter.js). Odkazy z hlavičky/patičky/HeroTileTop teď
// míří sem místo na /events?top=1.
export default function TopAkce() {
  const { items, total, totalPages, loading, q, razeni, page, setQuery, setSort, setPage } = useEventsFilter(FIXED, 12)

  return (
    <div className="catpage">
      <CategoryHero
        eyebrow="Výběr Plzeňáku"
        title="TOP akce"
        lead="To nejlepší, co se v Plzni chystá — vyber si svůj večer."
        skylineSeeds={{ back: 31, front: 7, win: 23 }}
      />

      <div className="catpage-toolbar">
        <div className="catpage-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Hledat mezi TOP akcemi…"
            aria-label="Hledat mezi TOP akcemi"
            defaultValue={q}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="catpage-row">
          <span className="catpage-count" aria-live="polite">
            {!loading && `${eventCountLabel(total)} TOP akcí`}
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
            ? <EmptyState title="Žádné TOP akce zatím nejsou vyhlášené." />
            : items.map(event => <EventCard key={event.id} event={event} />)
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
