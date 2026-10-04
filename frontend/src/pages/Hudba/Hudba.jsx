import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import { LazyConcertScene } from '../../components/scenes/LazyScenes.jsx'
import CategoryFilterBar from '../../components/CategoryFilterBar/CategoryFilterBar.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import EventCardSkeleton from '../../components/EventCardSkeleton/EventCardSkeleton.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import OtherCategories from '../../components/OtherCategories/OtherCategories.jsx'
import { useEventsFilter } from '../../lib/filters/useEventsFilter.js'
import { useMediaQuery } from '../../lib/useMediaQuery.js'
import { SORT_OPTIONS } from '../../lib/filters/sortOptions.js'
import { eventCountLabel } from '../../lib/events/pluralize.js'
import '../../styles/categoryPage.css'

const FIXED = { kategorie: 'Hudba' }
const PER_PAGE = 12

// Dedikovaná stránka pro kategorii Hudba (Fáze 5) — pevný filtr
// (`kategorie=Hudba`), viz TopAkce.jsx pro plně okomentovaný vzor
// useEventsFilter/filter baru/gridu, tahle stránka ho jen opakuje s
// jinými pevnými parametry/textem. Vizuální scéna (ConcertScene z
// components/scenes/) je jediná věc, co se liší strukturálně.
//
// Bez `typeOptions` v CategoryFilterBar — zdroj (Hudba.dc.html) nabízí
// žánrový dropdown (Jazz/Rock/Klasika/Elektronika/Swing/Folk), ale žánry
// v naší DB nejsou žádný reálný tag/kategorie (viz Rozhodnutí 1 v
// implementačním plánu), takže by byl dropdown bez skutečné funkce —
// raději chybí, než aby předstíral filtr, co nic nedělá.
export default function Hudba() {
  const {
    items, total, totalPages, loading,
    q, razeni, kdy, dirty, page,
    setQuery, setSort, setKdy, resetFilters, setPage,
  } = useEventsFilter(FIXED, PER_PAGE)

  // Pódium je ve scéně vpravo. V úzkém hero (breakpoint jako .cat-hero v
  // CategoryHero.css) by ho výchozí ořez na střed odřízl, zůstal by jen dav.
  const narrow = useMediaQuery('(max-width: 767px)')

  return (
    <div className="catpage">
      <CategoryHero
        background="#140602"
        scene={<LazyConcertScene focus={narrow ? 'right' : 'center'} shade label="Koncert z papíru" />}
        breadcrumbLabel="Hudba"
        eyebrow="Kategorie"
        title="Hudba"
        titleSize="112px"
        lead="Koncerty, kluby a festivaly. Od komorního jazzu přes varhany v katedrále po noc s DJem."
        stats={[
          { value: total || '…', label: 'akcí tento měsíc' },
        ]}
      />

      <CategoryFilterBar
        q={q} onQueryChange={setQuery}
        searchPlaceholder="Hledat interpreta nebo koncert…" searchLabel="Hledat interpreta nebo koncert"
        sortValue={razeni} onSortChange={setSort} sortOptions={SORT_OPTIONS}
        kdy={kdy} onKdyChange={setKdy}
        count={eventCountLabel(total)} countLabel="v kategorii Hudba"
        dirty={dirty} onReset={resetFilters}
      />

      <div className="catpage-grid">
        {loading
          ? <EventCardSkeleton />
          : items.length === 0
            ? <EmptyState title="Žádné hudební akce zatím nejsou vyhlášené." />
            : items.map((event, i) => (
              <EventCard key={event.id} event={event} variant={i === 0 ? 'featured' : 'grid'} index={i} />
            ))
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <OtherCategories exclude="hudba" />
    </div>
  )
}
