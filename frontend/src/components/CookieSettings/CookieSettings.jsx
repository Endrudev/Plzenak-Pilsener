import { useCallback, useEffect, useRef, useState } from 'react'
import './CookieSettings.css'

// Zavření trvá o něco míň než otevření (--dur-fast vs --dur-base): odchod má být
// svižný, uživatel už rozhodl. Číslo musí odpovídat --dur-fast v index.css.
const EXIT_MS = 120

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Nastavení cookies, přestavěné 2026-10-05: tmavá karta s dvojitým rámem (vždy
// tmavá, stejně jako lišta), kategorie jako karty a nový přepínač. Chování
// (focus trap, Escape, klik na pozadí, odchod s animací) zůstalo.
export default function CookieSettings({ initialMaps, onSave, onRejectAll, onClose }) {
    const [mapsEnabled, setMapsEnabled] = useState(initialMaps)
    const [closing, setClosing] = useState(false)
    const closingRef = useRef(false)
    const dialogRef = useRef(null)
    const previouslyFocused = useRef(null)

    // Okno se nesmí odmontovat hned, jinak by zmizelo bez animace. Nejdřív se
    // přehraje odchod (třída --closing), a teprve potom se zavolá rodič, který
    // komponentu odebere. Ref hlídá dvojí zavření (Escape + klik).
    const leave = useCallback((action) => {
        if (closingRef.current) return
        closingRef.current = true
        setClosing(true)
        setTimeout(action, EXIT_MS)
    }, [])

    useEffect(() => {
        previouslyFocused.current = document.activeElement

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const focusables = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR)
        focusables?.[0]?.focus()

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                leave(onClose)
                return
            }
            if (e.key !== 'Tab') return

            const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR)
            if (!nodes || nodes.length === 0) return
            const first = nodes[0]
            const last = nodes[nodes.length - 1]

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousOverflow
            previouslyFocused.current?.focus?.()
        }
    }, [onClose, leave])

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) leave(onClose)
    }

    function handleSave() {
        leave(() => onSave({ maps: mapsEnabled }))
    }

    function handleRejectAll() {
        setMapsEnabled(false)
        leave(onRejectAll)
    }

    return (
        <div id="cookie-settings-overlay" className={closing ? 'cs-overlay cs-overlay--closing' : 'cs-overlay'} onClick={handleOverlayClick}>
            <div
                className="cs-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-settings-title"
                ref={dialogRef}
            >
                <div className="cs-core">
                    <div className="cs-header">
                        <div>
                            <h2 id="cookie-settings-title" className="cs-title">Nastavení cookies</h2>
                            <p className="cs-lede">Vyber, co smíme používat. Volbu můžeš kdykoli změnit odkazem v patičce.</p>
                        </div>
                        <button type="button" className="cs-close" onClick={() => leave(onClose)} aria-label="Zavřít">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="cs-list">
                        <div className="cs-row cs-row--locked">
                            <div className="cs-row-text">
                                <p className="cs-row-title">Nezbytné</p>
                                <p className="cs-row-desc">Přihlášení, bezpečnost, uložené filtry. Bez nich web nefunguje, proto nejdou vypnout.</p>
                            </div>
                            <span className="cs-always">Vždy zapnuto</span>
                        </div>

                        <div className="cs-row">
                            <div className="cs-row-text">
                                <p className="cs-row-title" id="cs-maps-label">Mapy a vložený obsah</p>
                                <p className="cs-row-desc">OpenStreetMap na detailu akce, videa a widgety pořadatelů.</p>
                            </div>
                            <button
                                type="button"
                                className={`cs-switch${mapsEnabled ? ' cs-switch--on' : ''}`}
                                role="switch"
                                aria-checked={mapsEnabled}
                                aria-labelledby="cs-maps-label"
                                onClick={() => setMapsEnabled(v => !v)}
                            >
                                <span className="cs-knob" />
                            </button>
                        </div>
                    </div>

                    <div className="cs-footer">
                        <button type="button" className="cs-btn cs-btn--ghost" onClick={handleRejectAll}>
                            Odmítnout vše
                        </button>
                        <button type="button" className="cs-btn cs-btn--accent" onClick={handleSave}>
                            Uložit volbu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
