import { Link } from 'react-router-dom'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import { seeded, pediment, bellGable, steppedGable } from '../NightSkyline/cityscape.js'
import './Footer.css'
import { useConsent } from '../../lib/ConsentContext.jsx'

// Budova = obdélníkové tělo (kde bydlí mřížka oken, viz buildingWindows)
// + volitelná střecha nad ním (roofH počítá se zvlášť, do mřížky oken se
// nezapojuje). Různé tvary střech jsou to, co dělá siluetu rozeznatelnou
// — samotná náhodná šířka/výška pořád vypadá jako jeden typ baráku pořád
// dokola.
const VIEW_W = 1440
const BASE_Y = 90
const ROOFS = ['flat', 'flat', 'pediment', 'bell', 'stepped', 'parapet']

function buildSilhouette(seed) {
    const rand = seeded(seed)
    const buildings = []
    let x = -10
    while (x < VIEW_W + 10) {
        // Širší rozptyl šířky/výšky, ať se vedle sebe potkají nízké řadovky
        // i užší vyšší domy, ne jen jedna průměrná velikost pořád dokola.
        const w = 26 + rand() * 64
        const bodyH = 20 + rand() * 46
        const roof = ROOFS[Math.floor(rand() * ROOFS.length)]
        const roofH = roof === 'flat' || roof === 'parapet' ? 0 : 8 + rand() * 14
        buildings.push({ x, w, bodyH, roof, roofH, chimney: roof === 'flat' && rand() < 0.3 })

        // Mezery jsou schválně nepravidelné, ne jedna průměrná rozteč pořád
        // dokola: občas se budovy mírně překryjí (jedna stojí kousek před
        // druhou), jinde stojí těsně vedle sebe, jinde je mezi nimi vidět
        // širší kus oblohy — jak to na skutečné siluetě bývá.
        const gapRoll = rand()
        const gap = gapRoll < 0.2 ? -(4 + rand() * 10)   // mírný překryv
            : gapRoll < 0.55 ? rand() * 6                 // těsně vedle sebe
                : 8 + rand() * 26                              // širší mezera
        x += w + gap
    }
    return buildings
}

function roofPath(b) {
    const cx = b.x + b.w / 2
    const y = BASE_Y - b.bodyH
    if (b.roof === 'pediment') return pediment(cx, y, b.w / 2, b.roofH)
    if (b.roof === 'bell') return bellGable(cx, y, b.w / 2, b.roofH)
    if (b.roof === 'stepped') return steppedGable(cx, y, b.w / 2, 3, b.roofH / 3)
    return ''
}

// Okna jedné budovy: mřížka vycentrovaná uvnitř těla (ne střechy) s okrajem
// ze všech stran, pár namátkou nesvítí (`rand() < .3`), ať to nepůsobí
// jako děrovačka.
function buildingWindows(building, rand) {
    const marginX = 7
    const marginTop = 10
    const marginBottom = 6
    const winW = 4
    const winH = 6

    const innerW = building.w - marginX * 2
    const innerH = building.bodyH - marginTop - marginBottom
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
                y: BASE_Y - building.bodyH + marginTop + stepY * (r + 0.5) - winH / 2,
            })
        }
    }
    return rects
}

function FooterSkyline() {
    const buildings = buildSilhouette(7)
    const winRand = seeded(23)

    return (
        <svg className="footer-skyline" viewBox={`0 0 ${VIEW_W} ${BASE_Y}`} preserveAspectRatio="none" aria-hidden="true">
            {/* Každá budova (tělo + střecha + vlastní okna) se kreslí jako
                jeden celek v pořadí zleva doprava — díky tomu, když se dvě
                budovy mírně překryjí, ta pozdější (a tedy "bližší") správně
                zakryje i okna té za ní, ne jen její zeď. */}
            {buildings.map((b, i) => (
                <g key={i}>
                    <g className="footer-skyline-mass">
                        <rect x={b.x} y={BASE_Y - b.bodyH} width={b.w} height={b.bodyH} />
                        {b.roofH > 0 && <path d={roofPath(b)} />}
                        {b.roof === 'parapet' && (
                            <rect x={b.x - 1} y={BASE_Y - b.bodyH - 3} width={b.w + 2} height="3" />
                        )}
                        {b.chimney && (
                            <rect x={b.x + b.w * 0.68} y={BASE_Y - b.bodyH - 10} width="5" height="12" />
                        )}
                    </g>
                    <g className="footer-skyline-window">
                        {buildingWindows(b, winRand).map((w, wi) => (
                            <rect key={wi} x={w.x} y={w.y} width="4" height="6" />
                        ))}
                    </g>
                </g>
            ))}
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
