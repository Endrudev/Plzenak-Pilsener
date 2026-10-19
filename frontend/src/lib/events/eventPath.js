// Adresa detailu akce: /akce/<id>-<slug>, např. /akce/42-knoflikova-valka.
//
// Slug počítá backend (backend/src/lib/slug.js) a posílá ho v poli `slug`, takže
// pravidlo pro jeho tvar existuje jen na jednom místě. O akci rozhoduje id, slug je
// jen čitelná část pro lidi a vyhledávače.

// Bez slugu (prázdný název, starší odpověď API) zůstane jen id, adresa pořád funguje.
export function eventPath(event) {
    return event.slug ? `/akce/${event.id}-${event.slug}` : `/akce/${event.id}`
}

// Z parametru routy ('42-knoflikova-valka', '42') vytáhne id jako text, jinak null.
// Slug za pomlčkou se nekontroluje: špatný nebo zastaralý slug opraví EventDetail
// přesměrováním na eventPath(event).
export function parseEventId(param) {
    const match = /^(\d+)(?:-.*)?$/.exec(param ?? '')
    return match ? match[1] : null
}
