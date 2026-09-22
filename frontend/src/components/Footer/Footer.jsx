import { Link } from 'react-router-dom'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import './Footer.css'
import { useConsent } from '../../lib/ConsentContext.jsx'

// Papírová silueta střech — stejný jazyk jako NightSkyline/EmptyState, jen
// jako tichý pruh nad patičkou. Skutečná SVG kresba, ne CSS gradient
// napodobenina (ta předtím vypadala jako svislé pruhy, ne jako domy).
function FooterSkyline() {
    return (
        <svg className="footer-skyline" viewBox="0 0 1200 64" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <g fill="var(--color-night-2)">
                <rect x="0" y="30" width="46" height="34" />
                <rect x="50" y="14" width="34" height="50" />
                <rect x="88" y="36" width="30" height="28" />
                <path d="M122 36 L140 18 L158 36 Z" /><rect x="122" y="36" width="36" height="28" />
                <rect x="162" y="22" width="34" height="42" />
                <rect x="200" y="40" width="26" height="24" />
                <rect x="230" y="12" width="30" height="52" />
                <rect x="264" y="32" width="40" height="32" />
                <path d="M308 32 L326 14 L344 32 Z" /><rect x="308" y="32" width="36" height="32" />
                <rect x="348" y="24" width="28" height="40" />
                <rect x="380" y="42" width="34" height="22" />
                <rect x="418" y="18" width="32" height="46" />
                <rect x="454" y="34" width="26" height="30" />
                <rect x="484" y="10" width="30" height="54" />
                <rect x="518" y="30" width="42" height="34" />
                <path d="M564 30 L582 12 L600 30 Z" /><rect x="564" y="30" width="36" height="34" />
                <rect x="604" y="22" width="30" height="42" />
                <rect x="638" y="40" width="28" height="24" />
                <rect x="670" y="14" width="32" height="50" />
                <rect x="706" y="34" width="38" height="30" />
                <rect x="748" y="24" width="28" height="40" />
                <path d="M780 24 L798 6 L816 24 Z" /><rect x="780" y="24" width="36" height="40" />
                <rect x="820" y="40" width="26" height="24" />
                <rect x="850" y="16" width="32" height="48" />
                <rect x="886" y="32" width="40" height="32" />
                <rect x="930" y="22" width="28" height="42" />
                <rect x="962" y="42" width="34" height="22" />
                <rect x="1000" y="12" width="30" height="52" />
                <path d="M1034 32 L1052 14 L1070 32 Z" /><rect x="1034" y="32" width="36" height="32" />
                <rect x="1074" y="24" width="28" height="40" />
                <rect x="1106" y="40" width="26" height="24" />
                <rect x="1136" y="18" width="32" height="46" />
                <rect x="1172" y="34" width="28" height="30" />
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
                    <p id="footer-tagline">Městské akce v Plzni na jednom místě.</p>
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
