// Strukturovaná data schema.org (JSON-LD). Každá funkce vrací obyčejný objekt,
// do HTML ho vloží jsonLdScript z html.js.
//
// Pravidla od Googlu (https://developers.google.com/search/docs/appearance/structured-data/event):
// Event patří jen na stránku jedné akce, ne na výpisy (tam je ItemList s odkazy).
// Povinné jsou name, startDate a location s adresou. Akce bez známého času má
// jen datum, žádnou vymyšlenou půlnoc.

const { SITE_URL, SITE_NAME } = require('./site')

const CONTEXT = 'https://schema.org'

function organization() {
    return {
        '@context': CONTEXT,
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/apple-touch-icon.png`,
    }
}

function website() {
    return {
        '@context': CONTEXT,
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: 'cs',
    }
}

// `event` je tvar z mapEvent (camelCase), `url` jeho kanonická adresa.
// Adresa místa je zatím jen město: akce mají místo jako text ("DEPO2015"), ulice
// přijde s místy jako samostatnou entitou (fáze 5 plánu SEO).
function eventLd(event, url) {
    const ld = {
        '@context': CONTEXT,
        '@type': 'Event',
        name: event.name,
        startDate: event.startsOn,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': 'Place',
            name: event.location,
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Plzeň',
                addressCountry: 'CZ',
            },
        },
        url,
    }
    const description = (event.description ?? []).join(' ').trim()
    if (description) ld.description = description
    if (event.imageUrl) ld.image = [event.imageUrl]
    return ld
}

// Výpis akcí jako seznam odkazů (Google: "summary page" se samotnými URL).
function itemList(urls) {
    return {
        '@context': CONTEXT,
        '@type': 'ItemList',
        itemListElement: urls.map((url, i) => ({ '@type': 'ListItem', position: i + 1, url })),
    }
}

// Drobečková navigace: [{ name, url }, …] od homepage po aktuální stránku.
function breadcrumbs(items) {
    return {
        '@context': CONTEXT,
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    }
}

module.exports = { organization, website, eventLd, itemList, breadcrumbs }
