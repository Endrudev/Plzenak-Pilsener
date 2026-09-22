import HeroTileTop from './HeroTileTop.jsx'
import HeroTileMusic from './HeroTileMusic.jsx'
import HeroTileRest from './HeroTileRest.jsx'
import { CATEGORIES } from '../../lib/categories.jsx'
import './HeroBento.css'

// Tři vstupní cesty místo jednoho hero baneru: "ukaž mi to nejlepší"
// (TOP), "chci konkrétně hudbu" (Hudba), "ukaž mi zbytek, rozhodnu se
// sám" (Zbytek programu). Nahrazuje dřívější statický fotokarusel, co
// uměl zobrazit jen první akci a neměl fungující šipky/tečky.
export default function HeroBento({ events }) {
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
