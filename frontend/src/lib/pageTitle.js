// Titulek stránky v záložce: "<část> | Plzeňák", homepage má vlastní.
//
// Stejné pravidlo a stejné texty má serverový renderer
// (backend/src/lib/seo/site.js a pages.js). Server nastaví titulek první
// stránce, kterou návštěvník otevře; po přechodu jinam (React, bez nového
// načtení) ho nastavuje useDocumentTitle. Při změně textu upravit obě strany.

export const SITE_NAME = 'Plzeňák'

export function pageTitle(part) {
    return part ? `${part} | ${SITE_NAME}` : `${SITE_NAME}: akce v Plzni na jednom místě`
}

// Detail akce: "Název – 24.10.2026 | Plzeňák" (backend: eventTitle v pages.js).
export function eventTitle(event) {
    return pageTitle(event.date ? `${event.name} – ${event.date}` : event.name)
}

export const TITLES = {
    home: pageTitle(null),
    events: pageTitle('Všechny akce v Plzni'),
    top: pageTitle('TOP akce v Plzni'),
    music: pageTitle('Koncerty a hudba v Plzni'),
    rest: pageTitle('Další akce v Plzni'),
    privacy: pageTitle('Zásady ochrany osobních údajů'),
    terms: pageTitle('Podmínky užití'),
    notFound: pageTitle('Stránka nenalezena'),
    admin: pageTitle('Administrace'),
}
