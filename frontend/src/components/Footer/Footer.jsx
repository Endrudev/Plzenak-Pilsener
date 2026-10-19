import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAfterLoad } from '../../lib/useAfterLoad.js'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import DuskSkyline from '../NightSkyline/DuskSkyline.jsx'
import './Footer.css'
import { useConsent } from '../../lib/consent/ConsentContext.jsx'

// Silueta města v patičce má stovky animovaných oken. Kreslí se, až je stránka
// načtená a patička se blíží k obrazovce (do 600 px), a pak už zůstane. Na úvodní
// obrazovce ji nikdo nevidí a jinak by soutěžila s prvním vykreslením stránky
// (od 2026-10-20). Pás .footer-sky má pevnou výšku, takže pozdější kresba nic
// neposune.
function useShowSkyline(ref) {
    const afterLoad = useAfterLoad()
    const [near, setNear] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (near || !el) return undefined
        if (!('IntersectionObserver' in window)) { setNear(true); return undefined }
        const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setNear(true) }, { rootMargin: '600px 0px' })
        io.observe(el)
        return () => io.disconnect()
    }, [ref, near])

    return afterLoad && near
}

export default function Footer() {
    const { openSettings } = useConsent()
    const skyRef = useRef(null)
    const showSkyline = useShowSkyline(skyRef)
    return (
        <footer id="site-footer">
            <div className="footer-sky" aria-hidden="true" ref={skyRef}>
                {showSkyline && <DuskSkyline className="footer-skyline footer-skyline--in" />}
            </div>
            <div id="footer-body">
            <div id="footer-inner">
                <div id="footer-brand">
                    <PlzenakLogo size={26} tone="inverse" />
                    <p id="footer-tagline">Všechno, co se děje v Plzni, na jednom místě.</p>
                </div>

                <nav id="footer-col-app" aria-label="Appka">
                    <span className="footer-col-label">Appka</span>
                    <Link to="/">Domů</Link>
                    <Link to="/akce">Akce</Link>
                    <Link to="/dnes">Dnes v Plzni</Link>
                    <Link to="/tento-vikend">Tento víkend</Link>
                    <Link to="/top-akce">TOP akce</Link>
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
                    <Link to="/o-projektu">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        O projektu
                    </Link>
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

                <p id="footer-copy">
                    © Plzeňák 2026 · Učební projekt juniorního vývojáře. Nekomerční, bez zisku a bez propagace.
                </p>
            </div>
            </div>
        </footer>
    )
}
