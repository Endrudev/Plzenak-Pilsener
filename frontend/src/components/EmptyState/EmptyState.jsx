import { Link } from 'react-router-dom'
import './EmptyState.css'

function RooftopIcon() {
    // Drobná siluetová střecha — stejný papírový jazyk jako NightSkyline,
    // jen zjednodušený na jeden tvar pro prázdný stav.
    return (
        <svg className="empty-state-icon" width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden="true">
            <path
                d="M4 78 8 78 8 46 26 32 44 46 44 78 48 78 48 40 66 24 84 40 84 78 88 78 88 50 104 36 116 46 116 78 120 78"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
            />
            <rect x="14" y="56" width="8" height="12" fill="currentColor" opacity="0.5" />
            <rect x="54" y="50" width="8" height="12" fill="currentColor" opacity="0.5" />
            <rect x="94" y="58" width="8" height="12" fill="currentColor" opacity="0.5" />
        </svg>
    )
}

// title      — hlavní hláška ("Žádné akce neodpovídají hledání.")
// onReset    — volitelné, zobrazí tlačítko "Zrušit filtry"
// resetLabel — popisek reset tlačítka
// secondaryHref/secondaryLabel — volitelný druhý, tichý odkaz ("Celý program")
export default function EmptyState({ title, onReset, resetLabel = 'Zrušit filtry', secondaryHref, secondaryLabel = 'Celý program' }) {
    return (
        <div className="empty-state">
            <RooftopIcon />
            <p className="empty-state-title">{title}</p>
            {(onReset || secondaryHref) && (
                <div className="empty-state-actions">
                    {onReset && (
                        <button type="button" className="empty-state-btn empty-state-btn--primary" onClick={onReset}>
                            {resetLabel}
                        </button>
                    )}
                    {secondaryHref && (
                        <Link to={secondaryHref} className="empty-state-btn empty-state-btn--secondary">
                            {secondaryLabel}
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
