// Data pro Web Share API — čistá funkce, testovatelná odděleně od
// samotného volání navigator.share (to je vedlejší efekt, viz níž).
export function eventShareData(event, url) {
    return {
        title: event.name,
        text: [event.name, event.location].filter(Boolean).join(' — '),
        url,
    }
}

// "Sdílet" tlačítko na Detail akce: Web Share API tam, kde existuje
// (mobil/některé desktopy — otevře nativní sdílecí panel), jinak fallback
// na zkopírování odkazu do schránky. Vrací, co se doopravdy stalo, ať
// volající (EventDetail.jsx) může ukázat odpovídající zpětnou vazbu
// ("Zkopírováno!" apod.) — appka nemá globální toast systém, tenhle
// návratový stav je jednodušší.
export async function shareEvent(event, url = window.location.href) {
    const data = eventShareData(event, url)

    if (navigator.share) {
        try {
            await navigator.share(data)
            return 'shared'
        } catch (err) {
            // Uživatel sdílecí panel zavřel — to není chyba, prostě se nic
            // dalšího nestane (žádný fallback na schránku).
            if (err?.name === 'AbortError') return 'cancelled'
            // Jiná chyba (např. share nejde s danými daty) — zkusit schránku.
        }
    }

    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        return 'copied'
    }

    return 'unsupported'
}
