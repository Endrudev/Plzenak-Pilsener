import { Link } from 'react-router-dom'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import { seeded } from '../NightSkyline/cityscape.js'
import './Footer.css'
import { useConsent } from '../../lib/ConsentContext.jsx'

// Siluety domů jako prosté obdélníky (x, šířka, výška od paty) — vědomě,
// ne ozdobné střechy z cityscape.js. Díky tomu jde spočítat mřížku oken
// přesně uvnitř KAŽDÉ budovy (ne bodově kamkoliv do scény), stejně
// pravidelně, jak okna na baráku doopravdy sedí — pár na šířku, pár
// na výšku, se stejnou mezerou mezi sebou.
const VIEW_W = 1440
const BASE_Y = 90

function buildSilhouette(seed) {
    const rand = seeded(seed)
    const buildings = []
    let x = -10
    while (x < VIEW_W + 10) {
        const w = 34 + rand() * 46
        const h = 28 + rand() * 46
        buildings.push({ x, w, h })
        x += w + 5 + rand() * 9
    }
    return buildings
}

// Okna jedné budovy: mřížka vycentrovaná uvnitř s okrajem ze všech stran,
// pár namátkou nesvítí (`rand() < .3`), ať to nepůsobí jako děrovačka.
function buildingWindows(building, rand) {
    const marginX = 7
    const marginTop = 10
    const marginBottom = 6
    const winW = 4
    const winH = 6

    const innerW = building.w - marginX * 2
    const innerH = building.h - marginTop - marginBottom
    if (innerW < winW || innerH < winH) return []

    const cols = Math.max(1, Math.round(innerW / 15))
    const rows = Math.max(1, Math.round(innerH / 17))
    const stepX = innerW / cols
    const stepY = innerH / rows

    const rects = []
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (rand() < 0.3) continue
            rects.push({
                x: building.x + marginX + stepX * (c + 0.5) - winW / 2,
                y: BASE_Y - building.h + marginTop + stepY * (r + 0.5) - winH / 2,
            })
        }
    }
    return rects
}

function FooterSkyline() {
    const buildings = buildSilhouette(7)
    const winRand = seeded(23)
    const windows = buildings.flatMap(b => buildingWindows(b, winRand))

    return (
        <svg className="footer-skyline" viewBox={`0 0 ${VIEW_W} ${BASE_Y}`} preserveAspectRatio="none" aria-hidden="true">
            <g className="footer-skyline-mass">
                {buildings.map((b, i) => (
                    <rect key={i} x={b.x} y={BASE_Y - b.h} width={b.w} height={b.h} />
                ))}
            </g>
            <g className="footer-skyline-window">
                {windows.map((w, i) => (
                    <rect key={i} x={w.x} y={w.y} width="4" height="6" />
                ))}
            </g>
        </svg>
    )
}

export default function Footer() {
    const { openSettings } = useConsent()
    return (
        <footer id="site-footer">
            <FooterSkyline />
            <div id="footer-inner">
                <div id="footer-brand">
                    <PlzenakLogo size={26} tone="inverse" />
                    <p id="footer-tagline">Všechno, co se děje v Plzni, na jednom místě.</p>
                </div>

                <nav id="footer-col-app" aria-label="Appka">
                    <span className="footer-col-label">Appka</span>
                    <Link to="/">Domů</Link>
                    <Link to="/events">Akce</Link>
                    <Link to="/events?top=1">TOP akce</Link>
                </nav>

                <nav id="footer-col-legal" aria-label="Právní informace">
                    <span className="footer-col-label">Právní informace</span>
                    <Link to="/zasady-ochrany-osobnich-udaju">Zásady ochrany osobních údajů</Link>
                    <Link to="/podminky-uziti">Podmínky užití</Link>
                    <button type="button" id="footer-cookie-btn" onClick={openSettings}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="9" cy="9" r="1" /><circle cx="14" cy="11" r="1" /><circle cx="10" cy="15" r="1" />
                        </svg>
                        Nastavení cookies
                    </button>
                </nav>

                <nav id="footer-col-project" aria-label="Projekt">
                    <span className="footer-col-label">Projekt</span>
                    <a href="https://github.com/Endrudev/Plzenak-Pilsener" target="_blank" rel="noreferrer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
                        </svg>
                        GitHub
                    </a>
                    <a href="/admin">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Admin log in
                    </a>
                </nav>

                <p id="footer-copy">© Plzeňák 2026</p>
            </div>
        </footer>
    )
}
