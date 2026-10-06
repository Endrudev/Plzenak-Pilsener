import { Link } from 'react-router-dom'
import Reveal from '../../Reveal/Reveal.jsx'
import { ArrowUpRight } from '../icons.jsx'
import { CATEGORIES } from '../../../lib/filters/categories.jsx'
import { eventCountLabel } from '../../../lib/events/pluralize.js'
import './LandingCategories.css'

// Šest kategorií v bentu, přesně šest buněk na šest obsahů. Rozměry v mřížce 12 × 2:
// Hudba 4×2, Gastro 4×1, Kultura 4×1 (první řada s Hudbou vyjde na 12), Sport 3×1,
// Památky 3×1, Pro děti 2×1 (druhá řada 3+3+2 + sloupce Hudby = 12). Na telefonu je to
// mřížka o dvou sloupcích, kde Hudba a Pro děti zabírají celou šířku, takže ani tam
// nezůstane prázdná buňka.
//
// Dlaždice jsou záměrně čisté (od 2026-10-06): jedna jantarová plocha, malá ikona
// kategorie a název. Pozadí je jen barva, žádné předměty ani symboly: několik měkkých
// barevných skvrn, které se pomalu přelévají (viz LandingCategories.css). Dřív tu byla karta
// nejbližší akce a velký obrys ikony, obojí autor odebral.
//
// Celá dlaždice je jeden odkaz do kategorie přes přetažený odkaz na názvu. Počet akcí
// kategorie zůstal jen pro čtečku (skrytý text za názvem).
const CELLS = [
    { name: 'Hudba', cls: 'lc-hudba' },
    { name: 'Gastro', cls: 'lc-gastro' },
    { name: 'Kultura', cls: 'lc-kultura' },
    { name: 'Sport', cls: 'lc-sport' },
    { name: 'Památky', cls: 'lc-pamatky' },
    { name: 'Pro děti', cls: 'lc-deti' },
]

export default function LandingCategories({ events }) {
    return (
        <Reveal as="section" className="lp-section lc" aria-labelledby="lc-h">
            <div className="lp-wrap">
                <div className="lp-head enter" style={{ '--i': 0 }}>
                    <h2 id="lc-h" className="lp-h2">Vyber si podle nálady</h2>
                </div>

                <div className="lc-grid">
                    {CELLS.map((cell, i) => {
                        const cat = CATEGORIES.find(c => c.name === cell.name)
                        const count = events.filter(e => e.tags?.includes(cell.name)).length
                        return (
                            <div key={cell.name} className={`lc-cell ${cell.cls} enter`} style={{ '--i': i + 1 }}>
                                <span className="lc-top">
                                    <span className="lc-icon" aria-hidden="true">{cat.icon(26)}</span>
                                    <span className="lc-go" aria-hidden="true"><ArrowUpRight /></span>
                                </span>
                                <span className="lc-label">
                                    <Link to={`/events?kategorie=${encodeURIComponent(cell.name)}`} className="lc-link">
                                        <span className="lc-name">{cell.name}</span>
                                        <span className="visually-hidden">, {eventCountLabel(count)}</span>
                                    </Link>
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Reveal>
    )
}
