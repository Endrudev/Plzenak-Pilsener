import { Link } from 'react-router-dom'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import './Footer.css'
import { useConsent } from '../../lib/ConsentContext.jsx'

// Silueta střech — přesná cesta ze zdrojového návrhu (Main.dc.html /
// Homepage.dc.html), ne procedurálně generovaná. Ta z cityscape.js
// (sdílená s NightSkyline) je stavěná pro velkou interaktivní scénu a v
// malém dekorativním pruhu dělala nečitelný nával oken a detailů — tohle
// je jednou nakreslený, řídce prosvětlený obrys, přesně jak ho má appka mít.
const ROOFLINE_PATH = 'M-10 90V36H-0V26H10V16H19V26H29V36H39V58H111V28H149V44H176V18l5 -12l5 12V44H213V58H231V32l5 -12l5 12V58H259V58H273V48H287V38H300V48H314V58H328V42H371V52H438V32L476 14L514 32V30H528V20H542V10H557V20H571V30H585V45H592V35H599V25H606V35H613V45H620V52H700V53H761V56H831V51L852 33L873 51V59L894 41L915 59V55H992V54H1014V28l5 -12l5 12V54H1045V50H1069V24l5 -12l5 12V50H1103V42H1163V29H1240V38H1312V34H1366V45L1390 27L1413 45V58H1451V90Z'

const WINDOWS = [
    [77, 54], [134, 56], [191, 65], [362, 71], [476, 70], [533, 60],
    [704, 54], [761, 69], [818, 58], [932, 60], [989, 53], [1103, 63], [1274, 66], [1388, 71],
]

function FooterSkyline() {
    return (
        <svg className="footer-skyline" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
            <path className="footer-skyline-mass" d={ROOFLINE_PATH} />
            {WINDOWS.map(([x, y]) => (
                <rect key={`${x}-${y}`} className="footer-skyline-window" x={x} y={y} width="5" height="7" />
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
