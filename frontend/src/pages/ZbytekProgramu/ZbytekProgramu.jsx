import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import { LazyProgramScene } from '../../components/scenes/LazyScenes.jsx'
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

// "Zbytek programu" = všechno KROMĚ TOP akce a Hudby (ty mají svoje
// vlastní stránky/dlaždice) — filtr vyloučením přes nový parametr
// `vyjma` na backendu (routes/events.js), ne kladný výběr kategorie
// jako TopAkce.jsx/Hudba.jsx. Viz TopAkce.jsx pro plně okomentovaný
// základní vzor.
const FIXED = { vyjma: 'TOP akce,Hudba' }
const PER_PAGE = 12

// "Typ akce" dropdown — zbylých 5 kategorií (bez Hudby, tu už tahle
// stránka sama vylučuje).
const TYPE_OPTIONS = CATEGORIES.filter(c => c.name !== 'Hudba').map(c => ({ value: c.name, label: c.name }))

export default function ZbytekProgramu() {
  const {
    items, total, totalPages, loading,
    q, razeni, typ, kdy, dirty, page,
    setQuery, setSort, setTyp, setKdy, resetFilters, setPage,
  } = useEventsFilter(FIXED, PER_PAGE)

  return (
    <div className="catpage">
      <CategoryHero
        background="#e2e8d7"
        theme="light"
        scene={<LazyProgramScene label="Trh, posezení a park z papíru" />}
        breadcrumbLabel="Zbytek programu"
        eyebrow="V klidu"
        title="Zbytek programu"
        titleSize="88px"
        lead="Trhy, kino, divadlo, prohlídky i akce pro děti. Nic tě nehoní, projdi si to v klidu."
        stats={[
          { value: total || '…', label: 'akcí tento měsíc' },
        ]}
      />

      <CategoryFilterBar
        q={q} onQueryChange={setQuery}
        searchPlaceholder="Hledat v programu…" searchLabel="Hledat v programu"
        typeOptions={TYPE_OPTIONS} typeValue={typ} onTypeChange={setTyp}
        sortValue={razeni} onSortChange={setSort} sortOptions={SORT_OPTIONS}
        kdy={kdy} onKdyChange={setKdy}
        count={eventCountLabel(total)} countLabel="v programu"
        dirty={dirty} onReset={resetFilters}
      />

      <div className="catpage-grid">
        {loading
          ? <EventCardSkeleton />
          : items.length === 0
            ? <EmptyState title="Žádné další akce zatím nejsou vyhlášené." />
            : items.map((event, i) => (
              <EventCard key={event.id} event={event} variant={i === 0 ? 'featured' : 'grid'} index={i} />
            ))
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <OtherCategories exclude="zbytek" />
    </div>
  )
}
