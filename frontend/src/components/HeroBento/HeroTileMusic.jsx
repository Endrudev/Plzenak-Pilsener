import { Link } from 'react-router-dom'
import { LazyConcertScene } from '../scenes/LazyScenes.jsx'
import HeroScene from './HeroScene.jsx'
import concertPoster from '../scenes/posters/concert.webp'
import { useHoverActive } from '../../lib/useHoverActive.js'
import './HeroTileMusic.css'

// Bento dlaždice Hudba: tenký obal kolem scény ConcertScene z components/scenes/.
// Pódium je ve scéně vpravo, proto focus="right" — v užší dlaždici se ořízne
// zleva a zpěvák zůstane vidět. Scéna se animuje jen pod myší nebo s fokusem
// z klávesnice, viz useHoverActive.
export default function HeroTileMusic() {
    const { active, handlers } = useHoverActive()

    return (
        <Link to="/hudba" className="hero-tile hero-tile--music" {...handlers}>
            <div className="hero-tile-scene">
                <HeroScene poster={concertPoster} position="100% 100%" bleed shade="concert" active={active} Live={LazyConcertScene} liveProps={{ focus: 'right', shade: true }} />
            </div>

            <div className="hero-tile-overlay">
                <h2 className="hero-tile-title hero-tile-title--md">Hudba</h2>
            </div>

            <span className="hero-tile-arrow hero-tile-arrow--ghost" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </span>
        </Link>
    )
}
