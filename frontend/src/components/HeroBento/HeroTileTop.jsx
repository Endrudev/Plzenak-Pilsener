import { Link } from 'react-router-dom'
import TopNightScene from './TopNightScene.jsx'
import './HeroTileTop.css'

// Bento dlaždice TOP akce — noční panorama je teď sdílené s hero pozadím
// na dedikované stránce /top-akce (viz TopNightScene.jsx, kam se
// vystěhovalo). Tady zůstává jen rám dlaždice (přechod pozadí, overlay
// text, CTA šipka) + samotná scéna animuje na hoveru/focusu (ne
// nepřetržitě jako na velké stránce — malá interaktivní dlaždice).
export default function HeroTileTop() {
    return (
        <div className="hero-tile hero-tile--top">
            <TopNightScene />

            <div className="hero-tile-overlay">
                <span className="hero-tile-eyebrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.7 5.7 6.2.8-4.6 4.3 1.2 6.2L12 16.8l-5.5 3 1.2-6.2L3.1 9.3l6.2-.8z" /></svg>
                    Výběr Plzeňáku
                </span>
                <h2 className="hero-tile-title">TOP akce</h2>
                <p className="hero-tile-lead">To nejlepší, co se v Plzni chystá — vyber si svůj večer.</p>
            </div>

            <Link to="/top-akce" className="hero-tile-arrow" aria-label="Zobrazit TOP akce">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </Link>
        </div>
    )
}
