import { useEffect, useState } from 'react'

// True až po načtení stránky (událost load) a ve chvíli klidu prohlížeče
// (requestIdleCallback). Pro těžké dekorace, které nemají soutěžit s prvním
// vykreslením: živá scéna v dlaždici na telefonu, silueta města v patičce.
//
// Proč (změřeno 2026-10-20 na mobilu se zpomalením): živá scéna dlaždice Zbytek
// programu se na telefonu přimontovala hned při načtení a stavění jejích stovek
// animovaných SVG prvků posunulo LCP homepage ze 3,6 na 4,4 s. Pod ní přitom leží
// poster se stejným prvním snímkem, takže čekání není vidět.
//
// Stav je společný pro celou stránku (proměnná modulu): po prvním splnění už další
// komponenty nečekají, ani po přechodu na jinou stránku.
let settled = false
const listeners = new Set()

function settle() {
    if (settled) return
    settled = true
    for (const fn of listeners) fn(true)
    listeners.clear()
}

let scheduled = false
function schedule() {
    if (scheduled || typeof window === 'undefined') return
    scheduled = true
    const idle = () => ('requestIdleCallback' in window
        ? window.requestIdleCallback(settle, { timeout: 2000 })
        : window.setTimeout(settle, 300))
    if (document.readyState === 'complete') idle()
    else window.addEventListener('load', idle, { once: true })
    // Pojistka: událost load může čekat na pomalý obrázek níž na stránce.
    window.setTimeout(settle, 6000)
}

export function useAfterLoad() {
    const [ready, setReady] = useState(settled)

    useEffect(() => {
        if (settled) { setReady(true); return undefined }
        listeners.add(setReady)
        schedule()
        return () => listeners.delete(setReady)
    }, [])

    return ready
}
