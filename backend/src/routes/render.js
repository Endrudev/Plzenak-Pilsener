// Serverový renderer (SEO fáze 3, varianta A, rozhodnuto 2026-10-19).
//
// Nginx sem posílá každý GET, který není statický soubor ani /api. Routa vezme
// index.html z buildu frontendu, doplní do něj <title>, meta, canonical, Open
// Graph, JSON-LD a jednoduché HTML obsahu a vrátí ho se správným stavovým
// kódem (200, 301, 404). React se pak načte jako dřív a obsah #root nahradí.
//
// Proč: AI crawlery (GPTBot, ClaudeBot…) JavaScript nespouštějí. Bez tohohle
// viděly na každé adrese jen prázdný <div id="root">.
//
// Jakákoli chyba (databáze, šablona) = 503. Nginx na 502/503/504 vrátí
// statický index.html, takže web funguje jako čistá SPA, jen bez SEO.

const express = require('express')
const router = express.Router()
const { query } = require('../db/pool')
const { mapEvent } = require('../lib/eventMapping')
const { buildWhere, resolveOrderBy } = require('../lib/eventsQuery')
const { matchRoute, eventPath } = require('../lib/seo/routes')
const { PAGES } = require('../lib/seo/site')
const { injectIntoTemplate } = require('../lib/seo/head')
const { createTemplateSource } = require('../lib/seo/templateSource')
const pages = require('../lib/seo/pages')
const { sitemapEntries, buildSitemap } = require('../lib/seo/sitemap')

const getTemplate = createTemplateSource({
    url: process.env.SITE_TEMPLATE_URL || 'http://frontend/index.html',
})

// Kolik akcí dostane výpis v HTML. Robotům stačí odkazy na nejbližší akce,
// úplný seznam bude v sitemap (fáze 4).
const LIST_LIMIT = 30

async function loadList(filters) {
    const { whereClause, values } = buildWhere(filters)
    const result = await query(
        `SELECT * FROM events ${whereClause} ORDER BY ${resolveOrderBy('konani')} LIMIT ${LIST_LIMIT};`,
        values
    )
    return result.rows.map(mapEvent)
}

async function loadEvent(id) {
    const result = await query('SELECT * FROM events WHERE id = $1;', [id])
    return result.rows.length ? mapEvent(result.rows[0]) : null
}

// sitemap.xml (SEO fáze 4). Musí být před '*'. Nadcházející akce stejným
// filtrem jako výpisy (buildWhere bez parametrů = od dneška), bez limitu:
// sitemap smí mít až 50 000 adres a akcí je řádově stovky.
//
// Chyba vrací 500, ne 503: na 503 by Nginx odpověděl statickým index.html
// s kódem 200 a vyhledávač by dostal HTML místo sitemap. 500 Nginx propustí.
router.get('/sitemap.xml', async (req, res) => {
    try {
        const { whereClause, values } = buildWhere({})
        const result = await query(
            `SELECT * FROM events ${whereClause} ORDER BY ${resolveOrderBy('konani')};`,
            values
        )
        const xml = buildSitemap(sitemapEntries(result.rows.map(mapEvent)))
        res.set('Cache-Control', 'no-cache').type('application/xml').send(xml)
    } catch (err) {
        console.error('Sitemap:', err.message)
        res.status(500).type('text').send('Sitemap teď nejde sestavit.')
    }
})

router.get('*', async (req, res) => {
    const route = matchRoute(req.path)
    // Parametry za otazníkem (filtry, utm…) přesměrování zachová.
    const queryStart = req.originalUrl.indexOf('?')
    const search = queryStart === -1 ? '' : req.originalUrl.slice(queryStart)

    try {
        if (route.type === 'redirect') return res.redirect(301, route.to + search)

        let page
        let status = 200
        if (route.type === 'page') {
            const def = PAGES[route.path]
            page = def.list
                ? pages.listPage(route.path, await loadList(def.list))
                : pages.staticPage(route.path)
        } else if (route.type === 'event') {
            const event = await loadEvent(route.id)
            if (!event) {
                status = 404
                page = pages.notFoundPage()
            } else {
                // Stará adresa /events/42, chybějící nebo zastaralý slug: jedno
                // přesměrování rovnou na správnou adresu.
                const canonicalPath = eventPath(event)
                if (req.path !== canonicalPath) return res.redirect(301, canonicalPath + search)
                page = pages.eventPage(event)
            }
        } else if (route.type === 'admin') {
            page = pages.adminPage()
        } else {
            status = 404
            page = pages.notFoundPage()
        }

        if (route.type === 'admin' || status === 404) res.set('X-Robots-Tag', 'noindex')

        const html = injectIntoTemplate(await getTemplate(), page)
        // HTML odkazuje na soubory s hashem v názvu, ty se cachují natrvalo.
        // Samotné HTML se musí ověřit pokaždé, jinak by po nasazení ukazovalo
        // na staré soubory.
        res.status(status).set('Cache-Control', 'no-cache').type('html').send(html)
    } catch (err) {
        console.error('Renderer:', err.message)
        res.status(503).type('text').send('Stránku teď nejde vykreslit.')
    }
})

module.exports = router
