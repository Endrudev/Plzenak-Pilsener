import { useEffect } from 'react'
import HeroTileTop from './HeroTileTop.jsx'
import HeroTileMusic from './HeroTileMusic.jsx'
import HeroTileRest from './HeroTileRest.jsx'
import { preloadScenes } from '../scenes/LazyScenes.jsx'
import { CATEGORIES } from '../../lib/filters/categories.jsx'
import './HeroBento.css'

// Tři vstupní cesty místo jednoho hero baneru: "ukaž mi to nejlepší"
// (TOP), "chci konkrétně hudbu" (Hudba), "ukaž mi zbytek, rozhodnu se
// sám" (Zbytek programu). Nahrazuje dřívější statický fotokarusel, co
// uměl zobrazit jen první akci a neměl fungující šipky/tečky.
export default function HeroBento({ events }) {
    useEffect(() => { preloadScenes() }, [])

    const musicCount = events.filter(e => e.tags?.includes('Hudba')).length
    const restCategories = CATEGORIES.filter(c => c.name !== 'Hudba')

    return (
        <div className="hero-bento">
            <HeroTileTop />
            <HeroTileMusic count={musicCount} />
            <HeroTileRest categories={restCategories} />
        </div>
    )
}
