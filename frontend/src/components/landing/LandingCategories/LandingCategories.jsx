import { Link } from 'react-router-dom'
import Reveal from '../../Reveal/Reveal.jsx'
import { ArrowUpRight } from '../icons.jsx'
import { CATEGORIES } from '../../../lib/filters/categories.jsx'
import { eventCountLabel } from '../../../lib/events/pluralize.js'
import concertPoster from '../../scenes/posters/concert.webp'
import cityPoster from '../../scenes/posters/city.webp'
import './LandingCategories.css'

// Bento z šesti kategorií, přesně šest buněk na šest obsahů. Rozměry v mřížce
// 12 × 2: Hudba 4×2, Gastro 4×1, Kultura 4×1 (první řada s Hudbou vyjde na 12),
// Sport 3×1, Památky 3×1, Pro děti 2×1 (druhá řada 3+3+2 + sloupce Hudby = 12).
// Na telefonu je to mřížka o dvou sloupcích, kde Hudba a Pro děti zabírají celou
// šířku, takže ani tam nezůstane prázdná buňka.
//
// Hudba a Památky mají za sebou kresby scén z hero dlaždic (ten samý svět,
// žádné stockové fotky), zbytek jantarový gradient kategorie s velkou
// bledou ikonou.
const CELLS = [
    { name: 'Hudba', cls: 'lc-hudba', poster: concertPoster },
    { name: 'Gastro', cls: 'lc-gastro' },
    { name: 'Kultura', cls: 'lc-kultura' },
    { name: 'Sport', cls: 'lc-sport' },
    { name: 'Památky', cls: 'lc-pamatky', poster: cityPoster },
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
                            <Link
                                key={cell.name}
                                to={`/events?kategorie=${encodeURIComponent(cell.name)}`}
                                className={`lc-cell ${cell.cls} enter`}
                                style={{
                                    '--i': i + 1,
                                    '--lc-grad': `var(--category-${cat.slug}-grad)`,
                                }}
                            >
                                {cell.poster && (
                                    <span className="lc-poster" style={{ backgroundImage: `url("${cell.poster}")` }} aria-hidden="true" />
                                )}
                                <span className="lc-ghost" aria-hidden="true">{cat.icon(180)}</span>
                                <span className="lc-top">
                                    <span className="lc-icon" aria-hidden="true">{cat.icon(26)}</span>
                                    <span className="lc-go" aria-hidden="true"><ArrowUpRight /></span>
                                </span>
                                <span className="lc-label">
                                    <span className="lc-name">{cell.name}</span>
                                    <span className="lc-count">{eventCountLabel(count)}</span>
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </Reveal>
    )
}
