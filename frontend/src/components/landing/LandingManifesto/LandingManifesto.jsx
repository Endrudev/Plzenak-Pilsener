import Reveal from '../../Reveal/Reveal.jsx'
import './LandingManifesto.css'

// Jedna věta jako výstup: slova se rozsvěcují postupně, jak sekce projíždí oknem, a
// uprostřed se v oranžové střídá druh akcí (koncerty, trhy, divadlo…). Pohyb má dva
// důvody: rozsvěcení vede oko po větě, střídání slova ukazuje, že Plzeň žije v mnoha
// podobách. Pilulky mezi slovy se 2026-10-05 odebraly, střídající se slovo je jejich
// náhrada (návrh 2). Bez podpory scroll-driven animací a s prefers-reduced-motion je
// celá věta vidět hned a střídající se slova stojí vedle sebe jako výčet.
const BEFORE = ['Plzeň', 'žije', 'celý', 'rok.', 'Na', 'jednom', 'místě', 'najdeš']

// Všechny tvary jsou čtvrtý pád (shodný s prvním), takže se hodí za „najdeš“. Střídající
// se slovo stojí na konci věty, aby za krátkým slovem nezůstávala mezera uprostřed.
export const KINDS = ['koncerty', 'trhy', 'divadlo', 'sport', 'památky', 'dobré jídlo', 'akce pro děti']

// Jedno slovo je vidět 2,6 s, celý cyklus je tedy KINDS.length * 2,6 s.
const STEP = 2.6

export default function LandingManifesto() {
    const cycle = KINDS.length * STEP

    return (
        <Reveal as="section" className="lp-section lm" aria-labelledby="lm-h">
            <div className="lp-wrap">
                {/* Čtečka dostane větu vcelku s výčtem, střídání slov je aria-hidden. */}
                <h2 id="lm-h" className="visually-hidden">
                    Plzeň žije celý rok. Na jednom místě najdeš koncerty, trhy, divadlo, sport, památky, dobré jídlo i akce pro děti.
                </h2>
                <p className="lm-text" aria-hidden="true">
                    {BEFORE.map((w, i) => (
                        <span key={w + i} className="lm-word" style={{ '--i': i }}>{w} </span>
                    ))}
                    {/* Všechna slova leží přes sebe v jedné buňce mřížky, takže obal má šířku
                        nejširšího a věta při střídání neposkakuje. */}
                    <span className="lm-word lm-rot" style={{ '--i': BEFORE.length, '--cycle': `${cycle}s` }}>
                        {KINDS.map((k, i) => (
                            <span key={k} className="lm-kind" style={{ '--d': `${i * STEP}s` }}>{k}</span>
                        ))}
                    </span>
                </p>
            </div>
        </Reveal>
    )
}
