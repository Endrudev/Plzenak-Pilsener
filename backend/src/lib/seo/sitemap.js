// sitemap.xml: seznam adres pro vyhledávače (SEO fáze 4). Čisté funkce.
//
// Rozhodnutí:
// - jen nadcházející akce; proběhlá akce má stránku dál (odkazy na ni fungují),
//   ale v sitemap už nic nenabízí,
// - lastmod z updated_at (akce) a z nejnovější změny akce ve výpisu (výpisy),
// - bez changefreq a priority: Google je ignoruje, lastmod mu stačí.

const { SITE_URL, PAGES } = require('./site')
const { eventPath } = require('./routes')
const { escapeHtml } = require('./html')

// lastmod jako datum a čas v UTC (W3C formát, který sitemap protokol chce).
function toLastmod(value) {
    if (value === null || value === undefined) return null
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

// Nejnovější updated_at ze seznamu akcí, nebo null.
function newest(events) {
    let max = null
    for (const event of events) {
        const t = new Date(event.updatedAt).getTime()
        if (!Number.isNaN(t) && (max === null || t > max)) max = t
    }
    return max === null ? null : new Date(max)
}

// `events` jsou nadcházející akce (tvar z mapEvent). Výpisy dostanou lastmod
// nejnovější změny ze všech nadcházejících akcí. Přesně podle filtru stránky
// by to znamenalo zopakovat v JS filtry z SQL (buildWhere), a to za mírně
// přesnější datum nestojí. Právní texty lastmod nemají: nevíme, kdy se
// změnily, a vymyšlené datum je horší než žádné.
function sitemapEntries(events) {
    const listLastmod = toLastmod(newest(events))
    const entries = []
    for (const [path, page] of Object.entries(PAGES)) {
        entries.push({ loc: `${SITE_URL}${path}`, lastmod: page.list ? listLastmod : null })
    }
    for (const event of events) {
        entries.push({ loc: `${SITE_URL}${eventPath(event)}`, lastmod: toLastmod(event.updatedAt) })
    }
    return entries
}

function buildSitemap(entries) {
    const urls = entries.map(({ loc, lastmod }) =>
        `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    )
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

module.exports = { sitemapEntries, buildSitemap, toLastmod }
