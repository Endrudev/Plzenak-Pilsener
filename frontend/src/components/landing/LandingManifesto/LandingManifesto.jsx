import Reveal from '../../Reveal/Reveal.jsx'
import cityPoster from '../../scenes/posters/city.webp'
import concertPoster from '../../scenes/posters/concert.webp'
import programPoster from '../../scenes/posters/program.webp'
import './LandingManifesto.css'

// Jedna věta jako výstup: slova se rozsvěcují postupně, jak sekce projíždí oknem,
// a mezi nimi stojí kresby z hero dlaždic jako pilulky. Pohyb má jediný důvod,
// vést oko po větě (čte se tak, jak se odkrývá). Bez podpory scroll-driven
// animací (viz LandingManifesto.css) je celá věta vidět hned.
const WORDS = [
    { t: 'Plzeň' }, { t: 'žije' }, { t: 'celý' }, { t: 'rok.' },
    { pill: cityPoster },
    { t: 'Koncerty,' },
    { pill: concertPoster },
    { t: 'trhy' }, { t: 'a' },
    { pill: programPoster },
    { t: 'všechno' }, { t: 'mezi' }, { t: 'tím' }, { t: 'najdeš' }, { t: 'na' }, { t: 'jednom' }, { t: 'místě.' },
]

export default function LandingManifesto() {
    return (
        <Reveal as="section" className="lp-section lm" aria-labelledby="lm-h">
            <div className="lp-wrap">
                {/* Čtečka dostane větu vcelku, vizuální rozdělení na slova je aria-hidden. */}
                <h2 id="lm-h" className="visually-hidden">
                    Plzeň žije celý rok. Koncerty, trhy a všechno mezi tím najdeš na jednom místě.
                </h2>
                <p className="lm-text" aria-hidden="true">
                    {WORDS.map((w, i) => (
                        w.pill ? (
                            <span key={i} className="lm-pill" style={{ '--i': i, backgroundImage: `url("${w.pill}")` }} />
                        ) : (
                            <span key={i} className="lm-word" style={{ '--i': i }}>{w.t} </span>
                        )
                    ))}
                </p>
            </div>
        </Reveal>
    )
}
