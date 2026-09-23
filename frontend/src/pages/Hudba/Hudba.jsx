import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import { useEventsFilter } from '../../lib/useEventsFilter.js'
import { SORT_OPTIONS } from '../../lib/sortOptions.js'
import { eventCountLabel } from '../../lib/pluralize.js'
import '../../styles/categoryPage.css'

const FIXED = { kategorie: 'Hudba' }

// Dedikovaná stránka pro kategorii Hudba (Fáze 5) — pevný filtr
// (`kategorie=Hudba`), viz TopAkce.jsx pro plně okomentovaný vzor,
// tahle stránka ho jen opakuje s jinými pevnými parametry/textem.
export default function Hudba() {
  const { items, total, totalPages, loading, q, razeni, page, setQuery, setSort, setPage } = useEventsFilter(FIXED, 12)

  return (
    <div className="catpage">
      <CategoryHero
        eyebrow="Kategorie"
        title="Hudba"
        lead="Koncerty, kluby a festivaly v Plzni — od jazzu po elektroniku."
        skylineSeeds={{ back: 41, front: 17, win: 9 }}
      />

      <div className="catpage-toolbar">
        <div className="catpage-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Hledat hudební akce…"
            aria-label="Hledat hudební akce"
            defaultValue={q}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="catpage-row">
          <span className="catpage-count" aria-live="polite">
            {!loading && `${eventCountLabel(total)} v kategorii Hudba`}
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
            ? <EmptyState title="Žádné hudební akce zatím nejsou vyhlášené." />
            : items.map(event => <EventCard key={event.id} event={event} />)
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
