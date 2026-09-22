import { getPageItems } from './getPageItems.js'
import './Pagination.css'

function ArrowIcon({ direction }) {
    const d = direction === 'prev' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    )
}

// variant:
//   'full'   — číslovaná řada s '...' (výchozí, desktop)
//   'simple' — jen Předchozí/Další + "Stránka X z Y" (handoff: mobil, šířka na čísla nestačí)
export default function Pagination({ page, totalPages, onChange, variant = 'full' }) {
    if (totalPages <= 1) return null

    const prevDisabled = page <= 1
    const nextDisabled = page >= totalPages

    const prevButton = (
        <button
            type="button"
            className="pagination-arrow"
            disabled={prevDisabled}
            onClick={() => onChange(page - 1)}
            aria-label="Předchozí stránka"
        >
            <ArrowIcon direction="prev" />
        </button>
    )

    const nextButton = (
        <button
            type="button"
            className="pagination-arrow"
            disabled={nextDisabled}
            onClick={() => onChange(page + 1)}
            aria-label="Další stránka"
        >
            <ArrowIcon direction="next" />
        </button>
    )

    if (variant === 'simple') {
        return (
            <nav className="pagination pagination--simple" aria-label="Stránkování">
                {prevButton}
                <span className="pagination-status">Stránka {page} z {totalPages}</span>
                {nextButton}
            </nav>
        )
    }

    return (
        <nav className="pagination" aria-label="Stránkování">
            {prevButton}
            {getPageItems(page, totalPages).map((item, i) =>
                item === '...' ? (
                    <span key={`gap-${i}`} className="pagination-dots" aria-hidden="true">…</span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        className={`pagination-btn${item === page ? ' pagination-btn--active' : ''}`}
                        aria-current={item === page ? 'page' : undefined}
                        onClick={() => onChange(item)}
                    >
                        {item}
                    </button>
                )
            )}
            {nextButton}
        </nav>
    )
}
