import { useEffect, useMemo } from 'react'
import CategoryHero from '../../CategoryHero/CategoryHero.jsx'
import CategoryControls from '../CategoryControls/CategoryControls.jsx'
import EventPoster from '../../events/EventPoster/EventPoster.jsx'
import EventsPager from '../../events/EventsPager/EventsPager.jsx'
import OtherCategories from '../../OtherCategories/OtherCategories.jsx'
import FilterSelect from '../../FilterSelect/FilterSelect.jsx'
import { CloseIcon } from '../../landing/icons.jsx'
import { useEventsFilter } from '../../../lib/filters/useEventsFilter.js'
import { SORT_OPTIONS } from '../../../lib/filters/sortOptions.js'
import { eventCountLabel } from '../../../lib/events/pluralize.js'
import { initMode } from '../../../lib/landingTheme.js'
import '../../landing/landing.css'
import './CategoryPage.css'

const PER_PAGE = 12

// Šablona stránek TOP akce, Hudba a Zbytek programu, postavená od nuly
// 2026-10-04. Tři stránky se lišily jen pevným filtrem, texty a scénou, proto
// jsou teď tenké a tahle šablona drží všechno ostatní (dřív to bylo třikrát
// zkopírované).
//
// Zachovaná je jen animovaná papírová scéna v hero. Zbytek je ve stejném jazyce
// jako homepage a Akce: téma přes --lp-* (světlé výchozí, tmavé přepínačem v
// liště), deska s ovládáním zajíždějící do hera, mřížka karet EventPoster,
// stránkování, prázdný stav a skeleton.
//
// `fixed` je pevný filtr stránky (top, kategorie nebo vyjma), uživatel ho
// nemění, jen hledá, vybírá období a řadí. Stav (q, kdy, typ, razeni, page)
// žije v URL přes useEventsFilter.
export default function CategoryPage({
    fixed,
    hero,
    typeOptions,
    searchPlaceholder,
    searchLabel,
    countNote,
    emptyTitle,
    exclude,
    ranked = false,
}) {
    const {
        items, total, totalPages, loading,
        q, razeni, typ, kdy, dirty, page,
        setQuery, setSort, setTyp, setKdy, resetFilters, setPage,
    } = useEventsFilter(fixed, PER_PAGE)
    const today = useMemo(() => new Date(), [])

    // Téma stránky je celostránkové, stejně jako na homepage.
    useEffect(() => {
        document.documentElement.classList.add('theme-lp')
        initMode()
        return () => document.documentElement.classList.remove('theme-lp')
    }, [])

    return (
        <div className="lp cp">
            <CategoryHero {...hero} />

            <div className="lp-sheet">
            <div className="lp-wrap cp-controls lp-sheet-lift">
                <CategoryControls
                    q={q}
                    kdy={kdy}
                    typ={typ}
                    typeOptions={typeOptions}
                    searchPlaceholder={searchPlaceholder}
                    searchLabel={searchLabel}
                    onQueryChange={setQuery}
                    onKdyChange={setKdy}
                    onTypChange={setTyp}
                />
            </div>

            <section className="lp-wrap cp-results" aria-labelledby="cp-count">
                <div className="cp-bar">
                    <div className="cp-count-block">
                        <h2 id="cp-count" className="cp-count" aria-live="polite">
                            {loading ? ' ' : eventCountLabel(total)}
                        </h2>
                        <span className="cp-count-note">{countNote}</span>
                    </div>

                    <div className="cp-tools">
                        {dirty && (
                            <button type="button" className="cp-clear" onClick={resetFilters}>
                                <CloseIcon size={14} />
                                Vymazat filtry
                            </button>
                        )}
                        <div className="lp-fs cp-sort">
                            <FilterSelect
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
                </div>

                {loading ? (
                    <div className="cp-grid" role="status" aria-label="Načítání akcí">
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className="ep ep--skeleton skeleton" aria-hidden="true" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="cp-empty">
                        <p>{dirty ? 'Žádné akce neodpovídají hledání.' : emptyTitle}</p>
                        {dirty && (
                            <button type="button" className="lp-btn" onClick={resetFilters}>
                                Vymazat filtry
                                <span className="lp-btn-ic"><CloseIcon size={16} /></span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="cp-grid" key={`${page}-${total}`}>
                        {items.map((event, i) => (
                            <EventPoster
                                key={event.id}
                                event={event}
                                index={i}
                                today={today}
                                rank={ranked ? (page - 1) * PER_PAGE + i + 1 : undefined}
                            />
                        ))}
                    </div>
                )}

                <EventsPager page={page} totalPages={totalPages} onChange={setPage} />
            </section>

            <OtherCategories exclude={exclude} />
            </div>
        </div>
    )
}
