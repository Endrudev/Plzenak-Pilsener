import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import MusicScene, { Fan } from '../../components/HeroBento/MusicScene.jsx'
import CategoryFilterBar from '../../components/CategoryFilterBar/CategoryFilterBar.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import OtherCategories from '../../components/OtherCategories/OtherCategories.jsx'
import { useEventsFilter } from '../../lib/useEventsFilter.js'
import { SORT_OPTIONS } from '../../lib/sortOptions.js'
import { eventCountLabel } from '../../lib/pluralize.js'
import './Hudba.css'
import '../../styles/categoryPage.css'

const FIXED = { kategorie: 'Hudba' }
const PER_PAGE = 12
const STAR_D = 'M0 -6L1.3 -1.3L6 0L1.3 1.3L0 6L-1.3 1.3L-6 0L-1.3 -1.3Z'

// 9 hvězd, doslova ze zdroje (Hudba.dc.html) — zdroj je na pevném plátně
// 1440px, `l` je tady přepočtené na % šíře (viz Hudba.css komentář).
const BG_STARS = [
  { l: 90, t: 70, s: 10, b: 'b0' }, { l: 300, t: 40, s: 7, b: 'b1' }, { l: 470, t: 120, s: 9, b: 'b2' },
  { l: 620, t: 60, s: 8, b: 'b0' }, { l: 760, t: 30, s: 11, b: 'b1' }, { l: 1000, t: 50, s: 9, b: 'b2' },
  { l: 1180, t: 90, s: 8, b: 'b0' }, { l: 1340, t: 60, s: 10, b: 'b1' }, { l: 880, t: 160, s: 6, b: 'b2' },
]
const CANVAS_W = 1440

// 3 diagonální paprsky světla za davem — doslova ze zdroje.
const BEAMS = [
  { l: 860, rot: 18 }, { l: 1060, rot: -8 }, { l: 1240, rot: -22 },
]

// Doplňkový dav vlevo (bez pódia) — stejných 5 siluet jako hlavní scéna,
// jen jiné seskupení/pozice, doslova ze zdroje (.tf-m uvnitř Hudba.dc.html).
const TAILFADE_BACK = [
  { left: 166, w: 24, h: 40, shape: 'capRightArm', timing: 't3' },
  { left: 193, w: 26, h: 43, shape: 'wideHat', timing: 't4' },
  { left: 247, w: 28, h: 46, shape: 'base', timing: 't5' },
  { left: 301, w: 25, h: 41, shape: 'waving', timing: 't6' },
  { left: 328, w: 27, h: 45, shape: 'capRightArm', timing: 't7' },
]

const TAILFADE_FRONT = [
  { left: 0, w: 30, h: 51, shape: 'capRightArm', timing: 't7' },
  { left: 108, w: 33, h: 55, shape: 'hatLeftArm', timing: 't8' },
  { left: 144, w: 36, h: 59, shape: 'base', timing: 't0' },
  { left: 180, w: 32, h: 53, shape: 'waving', timing: 't1' },
  { left: 252, w: 34, h: 57, shape: 'hatLeftArm', timing: 't8' },
  { left: 288, w: 30, h: 51, shape: 'capRightArm', timing: 't7' },
]

function HudbaScene() {
  return (
    <>
      <span className="hudba-bgstars" aria-hidden="true">
        {BG_STARS.map((s, i) => (
          <span key={i} className={`hudba-bst ${s.b}`} style={{ left: `${(s.l / CANVAS_W) * 100}%`, top: `${s.t}px`, width: `${s.s}px`, height: `${s.s}px` }}>
            <svg width="100%" height="100%" viewBox="-6 -6 12 12" fill="currentColor"><path d={STAR_D} /></svg>
          </span>
        ))}
        {BEAMS.map((b, i) => (
          <span key={i} className="hudba-beam" style={{ left: `${(b.l / CANVAS_W) * 100}%`, transform: `rotate(${b.rot}deg)`, transformOrigin: '50% 0' }} />
        ))}
      </span>

      <div className="hudba-tailfade" aria-hidden="true">
        <div className="music-scene">
          <span className="row row--back">
            {TAILFADE_BACK.map((f, i) => <Fan key={i} f={f} fill="var(--color-music-fan-back)" />)}
          </span>
          <span className="row row--front">
            {TAILFADE_FRONT.map((f, i) => <Fan key={i} f={f} fill="var(--color-music-fan-front)" />)}
          </span>
        </div>
      </div>

      <div className="hudba-scene-box">
        <MusicScene alwaysOn />
      </div>
    </>
  )
}

// Dedikovaná stránka pro kategorii Hudba (Fáze 5) — pevný filtr
// (`kategorie=Hudba`), viz TopAkce.jsx pro plně okomentovaný vzor
// useEventsFilter/filter baru/gridu, tahle stránka ho jen opakuje s
// jinými pevnými parametry/textem. Vizuální scéna (HudbaScene výš) je
// jediná věc, co se liší strukturálně — reuse MusicScene.jsx (stejná
// dlaždice jako na Home.jsx) + vlastní hvězdy/paprsky/doplňkový dav.
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

  return (
    <div className="catpage">
      <CategoryHero
        background="linear-gradient(to bottom, #1E0B22 0%, #3A1446 45%, #7B3480 100%)"
        scene={<HudbaScene />}
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
          ? <p className="catpage-loading">Načítání…</p>
          : items.length === 0
            ? <EmptyState title="Žádné hudební akce zatím nejsou vyhlášené." />
            : items.map((event, i) => (
              <EventCard key={event.id} event={event} variant={i === 0 ? 'featured' : 'grid'} />
            ))
        }
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <OtherCategories exclude="hudba" />
    </div>
  )
}
