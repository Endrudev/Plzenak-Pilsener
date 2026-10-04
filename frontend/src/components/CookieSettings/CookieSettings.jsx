import { useCallback, useEffect, useRef, useState } from 'react'
import './CookieSettings.css'

// Zavření trvá o něco míň než otevření (--dur-fast vs --dur-base): odchod má být
// svižný, uživatel už rozhodl. Číslo musí odpovídat --dur-fast v index.css.
const EXIT_MS = 120

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

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
        <div id="cookie-settings-overlay" className={closing ? 'cookie-settings--closing' : undefined} onClick={handleOverlayClick}>
            <div
                id="cookie-settings-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-settings-title"
                ref={dialogRef}
            >
                <div id="cookie-settings-header">
                    <h2 id="cookie-settings-title">Nastavení cookies</h2>
                    <button type="button" id="cookie-settings-close" onClick={() => leave(onClose)} aria-label="Zavřít">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <p id="cookie-settings-lede">Vyber, co smíme používat. Volbu můžeš kdykoli změnit odkazem v patičce.</p>

                <div id="cookie-settings-list">
                    <div className="cookie-settings-row cookie-settings-row--locked">
                        <div className="cookie-settings-row-text">
                            <p className="cookie-settings-row-title">Nezbytné</p>
                            <p className="cookie-settings-row-desc">Přihlášení, bezpečnost, uložené filtry. Nelze vypnout.</p>
                        </div>
                        <div className="cookie-settings-toggle-wrap">
                            <span className="cookie-settings-locked-label">Vždy zapnuto</span>
                            <button
                                type="button"
                                className="cookie-settings-toggle cookie-settings-toggle--locked"
                                role="switch"
                                aria-checked="true"
                                disabled
                            >
                                <span className="cookie-settings-toggle-knob" />
                            </button>
                        </div>
                    </div>

                    <div className="cookie-settings-row">
                        <div className="cookie-settings-row-text">
                            <p className="cookie-settings-row-title">Mapy a vložený obsah</p>
                            <p className="cookie-settings-row-desc">OpenStreetMap na detailu akce, videa a widgety pořadatelů.</p>
                        </div>
                        <button
                            type="button"
                            className={`cookie-settings-toggle${mapsEnabled ? ' cookie-settings-toggle--on' : ''}`}
                            role="switch"
                            aria-checked={mapsEnabled}
                            onClick={() => setMapsEnabled(v => !v)}
                        >
                            <span className="cookie-settings-toggle-knob" />
                        </button>
                    </div>
                </div>

                <div id="cookie-settings-footer">
                    <button type="button" id="cookie-settings-reject" onClick={handleRejectAll}>
                        Odmítnout vše
                    </button>
                    <button type="button" id="cookie-settings-save" onClick={handleSave}>
                        Uložit volbu
                    </button>
                </div>
            </div>
        </div>
    )
}
