import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import { Scene1, Scene2, Scene3, Bulbs, BULBS_V1, BULBS_V2, RaiseArm, BalloonIcon } from '../../components/HeroBento/RestScenes.jsx'
import CategoryFilterBar from '../../components/CategoryFilterBar/CategoryFilterBar.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import OtherCategories from '../../components/OtherCategories/OtherCategories.jsx'
import { useEventsFilter } from '../../lib/useEventsFilter.js'
import { SORT_OPTIONS } from '../../lib/sortOptions.js'
import { CATEGORIES } from '../../lib/categories.jsx'
import { eventCountLabel } from '../../lib/pluralize.js'
import './ZbytekProgramu.css'
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

// Na rozdíl od TOP akce/Hudba je tenhle hero DENNÍ scéna (zdroj:
// Zbytek.dc.html, pozadí #EEF3E8→#D3E0C9, ne noční fialová/oranžová) —
// tři výjevy z RestScenes.jsx (stejné jako v bento dlaždici) vedle sebe,
// BEZ prolínání/mlhy (to je jen trik malé dlaždice, co má místo na
// zobrazení jen jednoho výjevu najednou, viz komentář v RestScenes.jsx).
// Žádná hvězdná obloha/paprsky — denní obloha nemá co animovat navíc.
function ZbytekScene() {
  return (
    <div className="zp-vig-live" aria-hidden="true">
      <div className="zp-scn zp-scn--v1">
        <Scene1 shadowId="zp-s1d" />
        {BULBS_V1.map((b, i) => (
          <span key={i} className={`zp-bulb ${b.cls}`} style={{ left: `${b.l}%`, top: `${b.t}%` }} />
        ))}
      </div>

      <div className="zp-scn zp-scn--v2">
        <Scene2 shadowId="zp-s2d" />
        {BULBS_V2.map((b, i) => (
          <span key={i} className={`zp-bulb ${b.cls}`} style={{ left: `${b.l}%`, top: `${b.t}%` }} />
        ))}
        <span className="zp-raise">
          <RaiseArm />
        </span>
      </div>

      <div className="zp-scn zp-scn--v3">
        <Scene3 shadowId="zp-s3d" />
        <span className="zp-balloon">
          <BalloonIcon />
        </span>
      </div>
    </div>
  )
}

export default function ZbytekProgramu() {
  const {
    items, total, totalPages, loading,
    q, razeni, typ, kdy, dirty, page,
    setQuery, setSort, setTyp, setKdy, resetFilters, setPage,
  } = useEventsFilter(FIXED, PER_PAGE)

  return (
    <div className="catpage">
      <CategoryHero
        background="linear-gradient(to bottom, #EEF3E8 0%, #E1E9D9 60%, #D3E0C9 100%)"
        fadeColor="#B7CBA9"
        theme="light"
        scene={<ZbytekScene />}
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
          ? <p className="catpage-loading">Načítání…</p>
          : items.length === 0
            ? <EmptyState title="Žádné další akce zatím nejsou vyhlášené." />
            : items.map((event, i) => (
              <EventCard key={event.id} event={event} variant={i === 0 ? 'featured' : 'grid'} />
            ))
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <OtherCategories exclude="zbytek" />
    </div>
  )
}
