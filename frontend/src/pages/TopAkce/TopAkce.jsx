import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import { LazyCityScene } from '../../components/scenes/LazyScenes.jsx'
import CategoryFilterBar from '../../components/CategoryFilterBar/CategoryFilterBar.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import EventCardSkeleton from '../../components/EventCardSkeleton/EventCardSkeleton.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import OtherCategories from '../../components/OtherCategories/OtherCategories.jsx'
import { useEventsFilter } from '../../lib/filters/useEventsFilter.js'
import { SORT_OPTIONS } from '../../lib/filters/sortOptions.js'
import { CATEGORIES } from '../../lib/filters/categories.jsx'
import { eventCountLabel } from '../../lib/events/pluralize.js'
import '../../styles/categoryPage.css'

const FIXED = { top: '1' }
const PER_PAGE = 12

// "Typ akce" dropdown v CategoryFilterBar — doslova ze zdroje jde o
// Hudba/Divadlo/Film/Gastro/Památky/Děti, ale Divadlo/Film v naší DB
// neexistují jako kategorie (viz Rozhodnutí 1 v implementačním plánu —
// držíme se zavedených 6 kategorií, ne handoffových nekonzistentních
// tabulek), takže se použije CATEGORIES (jediný zdroj pravdy).
const TYPE_OPTIONS = CATEGORIES.map(c => ({ value: c.name, label: c.name }))

// Dedikovaná stránka pro TOP akce (Fáze 5) — pevný filtr (`top=1`),
// uživatel ho nemůže vypnout, jen hledat textem a řadit (viz
// lib/filters/useEventsFilter.js). Odkazy z hlavičky/patičky/HeroTileTop teď
// míří sem místo na /events?top=1.
export default function TopAkce() {
  const {
    items, total, totalPages, loading,
    q, razeni, typ, kdy, dirty, page,
    setQuery, setSort, setTyp, setKdy, resetFilters, setPage,
  } = useEventsFilter(FIXED, PER_PAGE)

  return (
    <div className="catpage">
      <CategoryHero
        background="#401909"
        liftScene
        scene={<LazyCityScene shade label="Noční Plzeň z papíru" />}
        breadcrumbLabel="TOP akce"
        eyebrow="Výběr Plzeňáku"
        title="TOP akce"
        titleSize="104px"
        lead="To nejlepší, co se v Plzni chystá. Každý týden ručně vybíráme akce, které stojí za to."
        stats={[
          { value: total || '…', label: 'akcí ve výběru' },
        ]}
      />

      <CategoryFilterBar
        q={q} onQueryChange={setQuery}
        searchPlaceholder="Hledat mezi TOP akcemi…" searchLabel="Hledat mezi TOP akcemi"
        typeOptions={TYPE_OPTIONS} typeValue={typ} onTypeChange={setTyp}
        sortValue={razeni} onSortChange={setSort} sortOptions={SORT_OPTIONS}
        kdy={kdy} onKdyChange={setKdy}
        count={eventCountLabel(total)} countLabel="TOP akcí"
        dirty={dirty} onReset={resetFilters}
      />

      <div className="catpage-grid">
        {loading
          ? <EventCardSkeleton />
          : items.length === 0
            ? <EmptyState title="Žádné TOP akce zatím nejsou vyhlášené." />
            : items.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                variant={i === 0 ? 'featured' : 'grid'}
                index={i}
                rank={(page - 1) * PER_PAGE + i + 1}
              />
            ))
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <OtherCategories exclude="top" />
    </div>
  )
}
