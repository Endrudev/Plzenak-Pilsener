import { Link } from 'react-router-dom'
import NightSkyline from '../NightSkyline/NightSkyline.jsx'
import './HeroTileTop.css'

// Na rozdíl od Hudba/Zbytek programu NENÍ celá dlaždice jeden <a href> —
// NightSkyline uvnitř má vlastní fokusovatelné "hit" prvky (role="button")
// na jednotlivých landmarcích pro hover/tap náhled. Vnořit je do jednoho
// velkého odkazu by porušilo přesně to pravidlo přístupnosti, co handoff
// sám předepisuje (žádné vnořené interaktivní prvky uvnitř <a>). Místo
// toho má dlaždice svůj vlastní, samostatný CTA šipkový odkaz.
//
// /events?top=1 je dnešní funkční cesta k TOP akcím (stejná, co používá
// hlavička/patička) — přepne se na /top-akce, až tahle routa vznikne.
export default function HeroTileTop({ events }) {
    return (
        <div className="hero-tile hero-tile--top">
            <NightSkyline events={events} className="hero-tile-scene" />

            <div className="hero-tile-overlay" aria-hidden="true">
                <span className="hero-tile-eyebrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.7 5.7 6.2.8-4.6 4.3 1.2 6.2L12 16.8l-5.5 3 1.2-6.2L3.1 9.3l6.2-.8z" /></svg>
                    Výběr Plzeňáku
                </span>
                <h2 className="hero-tile-title">TOP akce</h2>
                <p className="hero-tile-lead">To nejlepší, co se v Plzni chystá — vyber si svůj večer.</p>
            </div>

            <Link to="/events?top=1" className="hero-tile-arrow" aria-label="Zobrazit TOP akce">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </Link>
        </div>
    )
}
