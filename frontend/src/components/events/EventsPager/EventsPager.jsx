import { getPageItems } from '../../Pagination/getPageItems.js'
import { ArrowLeft, ArrowRight } from '../../landing/icons.jsx'
import './EventsPager.css'

// Stránkování seznamu akcí. Rozložení řady (první, poslední, okolí, tři tečky)
// počítá sdílená getPageItems, tady je jen vzhled podle tématu stránky.
// Na telefonu je číselná řada nahrazená údajem „Stránka X z Y“ mezi šipkami.
export default function EventsPager({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null

    return (
        <nav className="epg" aria-label="Stránkování">
            <button
                type="button"
                className="epg-btn epg-arrow"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
                aria-label="Předchozí stránka"
            >
                <ArrowLeft />
            </button>

            <div className="epg-numbers">
                {getPageItems(page, totalPages).map((item, i) => (
                    item === '...' ? (
                        <span key={`gap-${i}`} className="epg-gap" aria-hidden="true">…</span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            className="epg-btn"
                            aria-current={item === page ? 'page' : undefined}
                            aria-label={`Stránka ${item}`}
                            onClick={() => onChange(item)}
                        >
                            {item}
                        </button>
                    )
                ))}
            </div>

            <span className="epg-status">Stránka {page} z {totalPages}</span>

            <button
                type="button"
                className="epg-btn epg-arrow"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
                aria-label="Další stránka"
            >
                <ArrowRight />
            </button>
        </nav>
    )
}
