import { Link } from 'react-router-dom'
import { eventCountLabel } from '../../lib/pluralize.js'
import './HeroTileMusic.css'

// 9 postaviček davu s mírně rozhozeným časováním skoku (délka i zpoždění
// animace jsou schválně různé u každé — viz .ht-fan--0..8 v CSS), ať
// nepůsobí jako jeden objekt kopírovaný 9×. Klidový stav je statický,
// smyčka se pustí jen na hoveru/focusu (.on na kořeni dlaždice).
const FAN_COUNT = 9

export default function HeroTileMusic({ count = 0 }) {
    return (
        <Link to="/events?kategorie=Hudba" className="hero-tile hero-tile--music">
            <div className="ht-music-scene" aria-hidden="true">
                <div className="ht-crowd">
                    {Array.from({ length: FAN_COUNT }, (_, i) => (
                        <div key={i} className={`ht-fan ht-fan--${i}`} style={{ left: `${(i + 0.5) * (100 / FAN_COUNT)}%` }}>
                            <div className="ht-fan-head" />
                            <div className="ht-fan-body" />
                        </div>
                    ))}
                </div>
                <div className="ht-stage">
                    <div className="ht-performer">
                        <div className="ht-performer-head" />
                        <div className="ht-performer-body" />
                        <div className="ht-performer-arm" />
                    </div>
                    <div className="ht-note ht-note--1">♪</div>
                    <div className="ht-note ht-note--2">♫</div>
                </div>
            </div>

            <div className="hero-tile-overlay">
                <h2 className="hero-tile-title hero-tile-title--sm">Hudba</h2>
                <p className="hero-tile-lead">{eventCountLabel(count)} tento měsíc</p>
            </div>

            <span className="hero-tile-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </span>
        </Link>
    )
}
