import { Link } from 'react-router-dom'
import { LazyProgramScene } from '../scenes/LazyScenes.jsx'
import HeroScene from './HeroScene.jsx'
import programPoster from '../scenes/posters/program.webp'
import { useHoverActive } from '../../lib/useHoverActive.js'
import './HeroTileRest.css'

// Bento dlaždice Zbytek programu: scéna ProgramScene z components/scenes/ sama
// střídá trh, posezení a park. Z textu zůstal jen nadpis, šipka vpravo nahoře je
// stejná jako u ostatních dvou dlaždic (zelená). Dlaždice je odkaz, takže bez
// ovládacích teček: tlačítko uvnitř odkazu by byla neplatná struktura. Scéna se
// animuje jen pod myší nebo s fokusem z klávesnice (viz useHoverActive), a protože
// je pak dlaždice pod myší pořád, střídání scén se nesmí pozastavovat najetím
// (pauseOnHover).
export default function HeroTileRest() {
    const { active, handlers } = useHoverActive()

    return (
        <Link to="/zbytek-programu" className="hero-tile hero-tile--rest" {...handlers}>
            <div className="hero-tile-scene">
                <HeroScene poster={programPoster} position="50% 100%" active={active} Live={LazyProgramScene} liveProps={{ pauseOnHover: false }} />
            </div>

            <div className="hero-tile-overlay">
                <h2 className="hero-tile-title hero-tile-title--sm">Zbytek programu</h2>
            </div>

            <span className="hero-tile-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </span>
        </Link>
    )
}
