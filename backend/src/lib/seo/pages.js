// Obsah jednotlivých stránek pro serverový renderer: co přijde do <head> a co
// do <div id="root">. Čisté funkce; data (akce z mapEvent) dodá routa.
//
// HTML v #root je pro roboty a pro chvíli před startem Reactu. React ho po
// načtení celé nahradí, proto je jednoduché a sémantické (nadpis, seznam,
// odkazy), bez tříd a vzhledu.

const { SITE_URL, PAGES, pageTitle } = require('./site')
const { escapeHtml, truncate } = require('./html')
const { buildHead } = require('./head')
const { organization, website, eventLd, itemList, breadcrumbs } = require('./jsonLd')
const { eventPath } = require('./routes')

const HOME_CRUMB = { name: 'Plzeňák', url: `${SITE_URL}/` }
const EVENTS_CRUMB = { name: 'Akce', url: `${SITE_URL}/akce` }

function eventLine(event) {
    const meta = [event.date, event.location].filter(Boolean).map(escapeHtml).join(', ')
    return `<li><a href="${escapeHtml(eventPath(event))}">${escapeHtml(event.name)}</a>${meta ? ` (${meta})` : ''}</li>`
}

// Homepage, /akce a stránky kategorií. `events` je první stránka nadcházejících
// akcí s filtrem stránky. Kanonická adresa je vždy bez parametrů: /akce?q=…
// je jen jiný pohled na stejnou stránku.
function listPage(path, events) {
    const page = PAGES[path]
    const canonical = `${SITE_URL}${path === '/' ? '/' : path}`
    const jsonLd = []
    if (path === '/') jsonLd.push(organization(), website())
    if (events.length) jsonLd.push(itemList(events.map(e => `${SITE_URL}${eventPath(e)}`)))
    if (path !== '/') jsonLd.push(breadcrumbs([HOME_CRUMB, { name: page.heading, url: canonical }]))

    const list = events.length
        ? `<ul>${events.map(eventLine).join('')}</ul>`
        : '<p>Teď tu nejsou žádné nadcházející akce.</p>'
    return {
        head: buildHead({ title: page.title, description: page.description, canonical, jsonLd }),
        body: `<main><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.description)}</p>${list}<p><a href="/akce">Všechny akce</a></p></main>`,
    }
}

// Právní texty: jen titulek, popis a nadpis. Celý text vykreslí React.
function staticPage(path) {
    const page = PAGES[path]
    const canonical = `${SITE_URL}${path}`
    return {
        head: buildHead({
            title: page.title,
            description: page.description,
            canonical,
            jsonLd: [breadcrumbs([HOME_CRUMB, { name: page.heading, url: canonical }])],
        }),
        body: `<main><h1>${escapeHtml(page.heading)}</h1></main>`,
    }
}

// Titulek detailu akce. Stejné pravidlo má frontend (EventDetail), aby se
// titulek v záložce po přechodu shodoval.
function eventTitle(event) {
    return pageTitle(event.date ? `${event.name} – ${event.date}` : event.name)
}

// Popis začíná tím, na co se lidé i AI ptají nejdřív: kdy a kde. Pak začátek
// popisu akce.
function eventDescription(event) {
    const when = [event.date, event.location].filter(Boolean).join(', ')
    const text = (event.description ?? []).join(' ')
    return truncate(when ? `${when}. ${text}` : text)
}

function eventPage(event) {
    const canonical = `${SITE_URL}${eventPath(event)}`
    const paragraphs = (event.description ?? [])
        .filter(p => p && p.trim())
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('')
    const meta = [event.date, event.location].filter(Boolean).map(escapeHtml).join(', ')
    // Escapování nezabrání odkazu javascript:…, proto jen http(s).
    const link = /^https?:\/\//i.test(event.url ?? '')
        ? `<p><a href="${escapeHtml(event.url)}" rel="nofollow noopener">Web pořadatele a vstupenky</a></p>`
        : ''
    return {
        head: buildHead({
            title: eventTitle(event),
            description: eventDescription(event),
            canonical,
            ogType: 'article',
            image: event.imageUrl || undefined,
            jsonLd: [
                eventLd(event, canonical),
                breadcrumbs([HOME_CRUMB, EVENTS_CRUMB, { name: event.name, url: canonical }]),
            ],
        }),
        body: `<main><article><h1>${escapeHtml(event.name)}</h1>${meta ? `<p>${meta}</p>` : ''}${paragraphs}${link}</article><p><a href="/akce">Všechny akce v Plzni</a></p></main>`,
    }
}

function notFoundPage() {
    return {
        head: buildHead({ title: pageTitle('Stránka nenalezena'), robots: 'noindex' }),
        body: '<main><h1>Stránka nenalezena</h1><p><a href="/akce">Všechny akce v Plzni</a></p></main>',
    }
}

// Administrace: šablona beze změny obsahu, jen titulek a noindex. Ten jde
// i v hlavičce X-Robots-Tag (nastaví routa), meta je pojistka.
function adminPage() {
    return { head: buildHead({ title: pageTitle('Administrace'), robots: 'noindex' }), body: '' }
}

module.exports = { listPage, staticPage, eventPage, eventTitle, eventDescription, notFoundPage, adminPage }
