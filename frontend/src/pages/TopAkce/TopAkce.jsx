import CategoryHero from '../../components/CategoryHero/CategoryHero.jsx'
import TopNightScene from '../../components/HeroBento/TopNightScene.jsx'
import EventCard from '../../components/EventCard/EventCard.jsx'
import Pagination from '../../components/Pagination/Pagination.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import FilterSelect from '../../components/FilterSelect/FilterSelect.jsx'
import { useEventsFilter } from '../../lib/useEventsFilter.js'
import { SORT_OPTIONS } from '../../lib/sortOptions.js'
import { eventCountLabel } from '../../lib/pluralize.js'
import './TopAkce.css'
import '../../styles/categoryPage.css'

const FIXED = { top: '1' }
const STAR_D = 'M0 -6L1.3 -1.3L6 0L1.3 1.3L0 6L-1.3 1.3L-6 0L-1.3 -1.3Z'

// 7 hvězd + 2 padající — doslova ze zdroje (TopAkce.dc.html), rozeseté
// přes celý 708px hero, ne jen přes samotné panorama vpravo (to má svých
// 12 hvězd, viz TopNightScene.jsx — dvě různé vrstvy hvězd na stejné
// stránce, přesně jak to má zdroj).
const BG_STARS = [
  { l: 90, t: 70, s: 10, b: 'b0' }, { l: 260, t: 40, s: 7, b: 'b1' }, { l: 420, t: 120, s: 9, b: 'b2' },
  { l: 560, t: 60, s: 8, b: 'b0' }, { l: 700, t: 30, s: 11, b: 'b1' }, { l: 180, t: 230, s: 7, b: 'b2' },
  { l: 470, t: 250, s: 6, b: 'b0' },
]

// Silueta budov vlevo, doplňující hlavní panorama vpravo — stejná
// barevná paleta jako TopNightScene (--color-top-mass-*), doslova ze
// zdroje (viz TopAkce.css .top-akce-tailfade pro masku, co ji nechá
// zprava doleva vyblednout do pozadí).
const TAILFADE_WINDOWS = [
  { x: 56, y: 282, lit: false }, { x: 112, y: 268, lit: false }, { x: 164, y: 269, lit: true },
  { x: 218, y: 262, lit: true }, { x: 274, y: 250, lit: false }, { x: 326, y: 244, lit: false },
  { x: 470, y: 237, lit: false }, { x: 634, y: 217, lit: true }, { x: 676, y: 194, lit: false },
  { x: 716, y: 201, lit: true }, { x: 764, y: 197, lit: false },
]

function TopAkceScene() {
  return (
    <>
      <span className="top-akce-bgstars" aria-hidden="true">
        {BG_STARS.map((s, i) => (
          <span key={i} className={`top-akce-bst ${s.b}`} style={{ left: `${s.l}px`, top: `${s.t}px`, width: `${s.s}px`, height: `${s.s}px` }}>
            <svg width="100%" height="100%" viewBox="-6 -6 12 12" fill="currentColor"><path d={STAR_D} /></svg>
          </span>
        ))}
        <span className="top-akce-shoot" style={{ left: '520px', top: '60px' }} />
        <span className="top-akce-shoot s2" style={{ left: '330px', top: '150px' }} />
      </span>

      <svg className="top-akce-tailfade" viewBox="0 0 760 300" aria-hidden="true">
        <defs>
          <filter id="ta-tailsh" x="-5%" y="-20%" width="110%" height="140%">
            <feDropShadow dx="0" dy="-3" stdDeviation="5" floodColor="#160500" floodOpacity="0.55" />
          </filter>
        </defs>
        <g filter="url(#ta-tailsh)">
          <path d="M-10 300V237H25V222H40V213H60V222H75V193H111V190H125V181H143V190H157V180L176 166L194 180V156L218 138L242 156V149H297V140L323 120L349 140V115H365V106H386V115H402V106H411V97H424V106H433V105H449V96H469V105H485V97L506 81L526 97V86L554 64L582 86V62L597 50L612 62V60L638 39L665 60V54H677V28l5 -14l5 14V54H699V45L722 28L744 45V37H757V11l5 -14l5 14V37H780V300Z" fill="var(--color-top-mass-far)" />
        </g>
        <g filter="url(#ta-tailsh)">
          <path d="M-10 300V247H45V250H55V241H67V250H77V234L100 217L124 234V220L141 207L158 220V217H170V208H187V217H199V208L219 193L239 208V214L254 203L269 214V196L295 176L321 196V186H331V177H343V186H353V190H367V181H385V190H399V173H439V178H450V152l5 -14l5 14V178H472V167H522V160H562V157L582 143L601 157V154H633V149H648V123l5 -14l5 14V149H674V132H725V127H762V117L780 104L797 117V300Z" fill="var(--color-top-mass-mid)" />
        </g>
        <g filter="url(#ta-tailsh)">
          <path d="M-10 300V265H2V256H19V265H31V270L60 248L89 270V256L116 236L143 256V257L168 237L194 257V250H211V241H234V250H251V238L278 218L304 238V232L330 212L357 232V237H412V219H425V210H442V219H455V225H467V216H482V225H494V212H504V186l5 -14l5 14V212H524V212H533V203H545V212H554V198L582 177L611 198V205L638 185L665 205V182L680 171L695 182V189L720 170L745 189V185H758V176H776V185H790V300Z" fill="var(--color-top-mass-front)" />
        </g>
        {TAILFADE_WINDOWS.map((w, i) => (
          <rect key={i} x={w.x} y={w.y} width="8" height="12" fill={w.lit ? 'var(--color-window)' : 'var(--color-top-detail)'} />
        ))}
      </svg>

      <div className="top-akce-scene-box">
        <TopNightScene alwaysOn />
      </div>
    </>
  )
}

// Dedikovaná stránka pro TOP akce (Fáze 5) — pevný filtr (`top=1`),
// uživatel ho nemůže vypnout, jen hledat textem a řadit (viz
// lib/useEventsFilter.js). Odkazy z hlavičky/patičky/HeroTileTop teď
// míří sem místo na /events?top=1.
export default function TopAkce() {
  const { items, total, totalPages, loading, q, razeni, page, setQuery, setSort, setPage } = useEventsFilter(FIXED, 12)

  return (
    <div className="catpage">
      <CategoryHero
        background="linear-gradient(to bottom, #240D04 0%, #5E2405 58%, #8E3A06 88%)"
        backdropColor="#240D04"
        scene={<TopAkceScene />}
        breadcrumbLabel="TOP akce"
        eyebrow="Výběr Plzeňáku"
        title="TOP akce"
        titleSize="104px"
        lead="To nejlepší, co se v Plzni chystá. Každý týden ručně vybíráme akce, které stojí za to."
        stats={[
          { value: total || '…', label: 'akcí ve výběru' },
        ]}
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
