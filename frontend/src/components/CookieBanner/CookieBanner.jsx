import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './CookieBanner.css'

// Zavření trvá o něco míň než otevření: odchod má být svižný, člověk už rozhodl.
// Číslo musí odpovídat --dur-fast v index.css (stejně jako v CookieSettings).
const EXIT_MS = 120

// Souhlasová lišta, přestavěná 2026-10-05. Je to tmavá karta v rohu (na telefonu
// přes šířku u spodku), vždy tmavá bez ohledu na téma stránky, aby byla stejně
// čitelná na homepage, Akcích i právních stránkách, které téma nemají.
//
// Odmítnout a Přijmout mají stejnou velikost, tvar a váhu písma: souhlas se nemá
// vymáhat tím, že odmítnutí je schované nebo menší. Nastavení je třetí, tichá cesta.
//
// Rozhodnutí lištu odmontuje v App.jsx. Aby zmizela s animací, přehraje se nejdřív
// odchod a teprve potom se zavolá rodič. Ref hlídá dvojí klepnutí.
export default function CookieBanner({ onAccept, onReject, onOpenSettings }) {
    const [leaving, setLeaving] = useState(false)
    const leavingRef = useRef(false)

    function leave(action) {
        if (leavingRef.current) return
        leavingRef.current = true
        setLeaving(true)
        setTimeout(action, EXIT_MS)
    }

    return (
        <div id="cookie-banner" className={leaving ? 'ck-banner--leaving' : undefined} role="region" aria-label="Souhlas s cookies">
            <div className="ck-card">
                <div className="ck-core">
                    <div className="ck-head">
                        <span className="ck-icon" aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5z" />
                                <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
                                <circle cx="14" cy="15" r="1" fill="currentColor" stroke="none" />
                                <circle cx="8.5" cy="15" r="0.8" fill="currentColor" stroke="none" />
                            </svg>
                        </span>
                        <div className="ck-text">
                            <h2 className="ck-title">Používáme cookies</h2>
                            <p className="ck-desc">
                                Nezbytné drží web v provozu. Volitelné nám pomáhají načítat mapy a vložený obsah.
                                Rozhodni sám,{' '}
                                <Link to="/zasady-ochrany-osobnich-udaju#sluzby-tretich-stran">víc v zásadách</Link>.
                            </p>
                        </div>
                    </div>

                    <div className="ck-actions">
                        <button type="button" className="ck-btn ck-btn--ghost" onClick={() => leave(onReject)}>
                            Odmítnout
                        </button>
                        <button type="button" className="ck-btn ck-btn--accent" onClick={() => leave(onAccept)}>
                            Přijmout
                        </button>
                    </div>

                    <button type="button" className="ck-link" onClick={onOpenSettings}>
                        Nastavení
                    </button>
                </div>
            </div>
        </div>
    )
}
