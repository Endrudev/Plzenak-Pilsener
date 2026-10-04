import { Link } from 'react-router-dom'
import { LazyCityScene } from '../scenes/LazyScenes.jsx'
import HeroScene from './HeroScene.jsx'
import cityPoster from '../scenes/posters/city.webp'
import { useHoverActive } from '../../lib/useHoverActive.js'
import './HeroTileTop.css'

// Bento dlaždice TOP akce: celá dlaždice je odkaz (kurzor a klik platí na celou
// plochu, ne jen na šipku). Scéna CityScene z components/scenes/ se animuje jen
// pod myší nebo s fokusem z klávesnice, viz useHoverActive.
export default function HeroTileTop() {
    const { active, handlers } = useHoverActive()

    return (
        <Link to="/top-akce" className="hero-tile hero-tile--top" {...handlers}>
            <div className="hero-tile-scene">
                <HeroScene poster={cityPoster} position="50% 100%" bleed shade="city" active={active} Live={LazyCityScene} liveProps={{ shade: true }} />
            </div>

            <div className="hero-tile-overlay">
                <h2 className="hero-tile-title">TOP akce</h2>
            </div>

            <span className="hero-tile-arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </span>
        </Link>
    )
}
