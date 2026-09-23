import { Link } from 'react-router-dom'
import { eventCountLabel } from '../../lib/pluralize.js'
import MusicScene from './MusicScene.jsx'
import './HeroTileMusic.css'

// Dav + pódium teď žije v MusicScene.jsx (sdílené i s velkým hero pásem
// na /hudba, viz Hudba.jsx) — tahle komponenta je jen tenký obal s
// dlaždicovým pozadím/glow/overlay textem, stejný vzor jako HeroTileTop.jsx.
export default function HeroTileMusic({ count = 0 }) {
    return (
        <Link to="/hudba" className="hero-tile hero-tile--music">
            <span className="music-glow" aria-hidden="true" />
            <div className="ht-music-scene" aria-hidden="true">
                <MusicScene />
            </div>

            <div className="hero-tile-overlay">
                <h2 className="hero-tile-title hero-tile-title--md">Hudba</h2>
                <p className="hero-tile-lead">{eventCountLabel(count)} tento měsíc</p>
            </div>

            <span className="hero-tile-arrow hero-tile-arrow--ghost" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </span>
        </Link>
    )
}
