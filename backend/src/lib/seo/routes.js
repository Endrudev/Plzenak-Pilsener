// Rozpoznání adresy pro serverový renderer. Čistá funkce: z cesty určí, o jakou
// stránku jde, nic nenačítá. Odpovídá routám ve frontend/src/App.jsx; nová
// veřejná stránka se musí přidat i sem (do PAGES v site.js), jinak dostane 404.

const { PAGES } = require('./site')

// Vrací jeden z tvarů:
//   { type: 'page', path }              statická stránka nebo výpis z PAGES
//   { type: 'event', id, legacy }       detail akce (legacy = stará adresa /events/:id)
//   { type: 'redirect', to }            trvalé přesměrování (301)
//   { type: 'admin' }                   administrace: jen šablona, noindex
//   { type: 'notfound' }
function matchRoute(pathname) {
    // Lomítko na konci (/akce/) je jiná adresa se stejným obsahem. Jedna
    // adresa = jeden obsah, takže se přesměruje na tvar bez lomítka.
    //
    // Cíl vždy začíná jediným lomítkem. "//evil.com/" by jinak skončilo jako
    // přesměrování na "//evil.com", a to prohlížeč čte jako jinou doménu
    // (otevřené přesměrování).
    if (pathname.length > 1 && pathname.endsWith('/')) {
        return { type: 'redirect', to: `/${pathname.replace(/^\/+|\/+$/g, '')}` }
    }
    if (Object.hasOwn(PAGES, pathname)) return { type: 'page', path: pathname }
    if (pathname === '/admin' || pathname.startsWith('/admin/')) return { type: 'admin' }
    if (pathname === '/events') return { type: 'redirect', to: '/akce' }

    const detail = /^\/(akce|events)\/([^/]+)$/.exec(pathname)
    if (detail) {
        const id = parseEventId(detail[2])
        if (id) return { type: 'event', id, legacy: detail[1] === 'events' }
    }
    return { type: 'notfound' }
}

// Stejné pravidlo jako parseEventId ve frontend/src/lib/events/eventPath.js:
// id je číslo na začátku, slug za pomlčkou se nekontroluje.
function parseEventId(param) {
    const match = /^(\d+)(?:-.*)?$/.exec(param ?? '')
    return match ? match[1] : null
}

function eventPath(event) {
    return event.slug ? `/akce/${event.id}-${event.slug}` : `/akce/${event.id}`
}

module.exports = { matchRoute, parseEventId, eventPath }
