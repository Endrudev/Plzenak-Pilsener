import FilterSelect from '../FilterSelect/FilterSelect.jsx'
import './CategoryFilterBar.css'

function SearchIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
        </svg>
    )
}

function TypeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 12l-8 8-9-9V3h8Z" /><circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
    )
}

function SortIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
        </svg>
    )
}

const WHEN_TABS = [
    { value: 'vse', label: 'Kdykoli' },
    { value: 'dnes', label: 'Dnes' },
    { value: 'tyden', label: 'Tento týden' },
    { value: 'vikend', label: 'Víkend' },
]

// Plovoucí bílá karta s hledáním/filtry — doslova podle handoffu
// (*.dc.html na TOP akce/Hudba/Zbytek programu): `.paper-l` karta se
// záporným margin-top, co ji vytáhne přes spodní okraj tmavého hero
// pásu (viz CategoryFilterBar.css), pod ní segmentovaný přepínač "Kdy"
// + počet výsledků + "Zrušit filtry". Sdílené všemi třemi dedikovanými
// kategorijními stránkami, ať se nekopíruje 3×.
//
// `typeOptions` je nepovinné — Hudba.jsx ho nepředává (viz komentář
// tam: handoff nabízí žánrový filtr typu Jazz/Rock/Klasika, ale ty v
// naší DB nejsou žádná skutečná kategorie/tag, jen 6 zavedených podle
// Rozhodnutí 1 v implementačním plánu, takže by to byl dropdown bez
// reálné funkce).
export default function CategoryFilterBar({
    q, onQueryChange, searchPlaceholder, searchLabel,
    typeOptions, typeValue, onTypeChange,
    sortValue, onSortChange, sortOptions,
    kdy, onKdyChange,
    count, countLabel,
    dirty, onReset,
}) {
    return (
        <div className="catfilter-wrap">
            <div className="catfilter paper-l">
                <div className="catfilter-row1">
                    <label className="catfilter-search">
                        <span className="catfilter-search-icon"><SearchIcon /></span>
                        <span className="catfilter-sr-label">{searchLabel}</span>
                        <input
                            type="search"
                            placeholder={searchPlaceholder}
                            aria-label={searchLabel}
                            defaultValue={q}
                            onChange={e => onQueryChange(e.target.value)}
                        />
                    </label>

                    {typeOptions && (
                        <FilterSelect
                            label="Typ akce"
                            placeholder="Všechny typy"
                            value={typeValue}
                            onChange={onTypeChange}
                            options={typeOptions}
                            icon={<TypeIcon />}
                        />
                    )}

                    <FilterSelect
                        label="Řadit"
                        placeholder="Řazení"
                        value={sortValue}
                        onChange={onSortChange}
                        options={sortOptions}
                        clearable={false}
                        icon={<SortIcon />}
                    />
                </div>

                <div className="catfilter-row2">
                    <div role="group" aria-label="Kdy" className="catfilter-when">
                        {WHEN_TABS.map(w => (
                            <button
                                key={w.value}
                                type="button"
                                className={`catfilter-when-btn${kdy === w.value ? ' is-on' : ''}`}
                                aria-pressed={kdy === w.value}
                                onClick={() => onKdyChange(w.value)}
                            >
                                {w.label}
                            </button>
                        ))}
                    </div>

                    <div className="catfilter-status">
                        <span className="catfilter-count" aria-live="polite">
                            <strong>{count}</strong> {countLabel}
                        </span>
                        {dirty && (
                            <button type="button" className="catfilter-reset" onClick={onReset}>
                                Zrušit filtry
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
