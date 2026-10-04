import { Link } from 'react-router-dom'
import Reveal from '../../Reveal/Reveal.jsx'
import { ArrowRight } from '../icons.jsx'
import './LandingCta.css'

// Závěr stránky: jedna věta, jedno tlačítko, jeden význam. Stejný štítek
// „Všechny akce" jako v odkazu u nejbližších akcí, protože vede na totéž.
export default function LandingCta() {
    return (
        <Reveal as="section" className="lp-section lcta" aria-labelledby="lcta-h">
            <div className="lp-wrap">
                <div className="lcta-panel">
                    <h2 id="lcta-h" className="lcta-title enter" style={{ '--i': 0 }}>
                        Dnes večer máš na výběr.
                    </h2>
                    <Link to="/events" className="lp-btn lcta-btn enter" style={{ '--i': 1 }}>
                        Všechny akce
                        <span className="lp-btn-ic"><ArrowRight /></span>
                    </Link>
                </div>
            </div>
        </Reveal>
    )
}
