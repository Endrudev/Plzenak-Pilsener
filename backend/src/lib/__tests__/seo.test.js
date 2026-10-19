const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { escapeHtml, jsonLdScript, truncate } = require('../seo/html')
const { buildHead, injectIntoTemplate } = require('../seo/head')
const { eventLd, itemList } = require('../seo/jsonLd')
const { matchRoute, eventPath } = require('../seo/routes')
const { listPage, eventPage, eventTitle, eventDescription, notFoundPage } = require('../seo/pages')
const { createTemplateSource } = require('../seo/templateSource')

const TEMPLATE = '<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8" /><title>Plzeňák</title><script type="module" src="/assets/index-abc.js"></script></head><body><div id="root"></div></body></html>'

const EVENT = {
    id: 42,
    name: 'Knoflíková válka',
    slug: 'knoflikova-valka',
    date: '24.10.2026',
    startsOn: '2026-10-24',
    location: 'Divadlo J. K. Tyla',
    description: ['První odstavec.', 'Druhý odstavec.'],
    url: 'https://divadlo.example/knoflikova',
    imageUrl: 'https://img.example/42.jpg',
}

describe('escapeHtml', () => {
    it('escapuje znaky, které mění význam HTML', () => {
        assert.equal(escapeHtml(`<a href="x" onclick='y'>&</a>`), '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;')
    })

    it('null a undefined dá prázdný text', () => {
        assert.equal(escapeHtml(null), '')
        assert.equal(escapeHtml(undefined), '')
    })
})

describe('jsonLdScript', () => {
    it('text </script> v datech skript neukončí', () => {
        const html = jsonLdScript({ name: '</script><script>alert(1)</script>' })
        assert.equal(html.match(/<\/script>/g).length, 1, 'jen závěrečná značka')
        assert.ok(html.endsWith('</script>'))
    })

    it('po escapování zůstane platný JSON se stejnými daty', () => {
        const data = { name: 'A < B </script>', note: `řádek${String.fromCharCode(0x2028)}dál` }
        const json = jsonLdScript(data).replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')
        assert.deepEqual(JSON.parse(json), data)
        assert.equal(json.includes(String.fromCharCode(0x2028)), false)
    })
})

describe('truncate', () => {
    it('krátký text nechá, zbytečné mezery slije', () => {
        assert.equal(truncate('  a   b  '), 'a b')
    })

    it('dlouhý text zkrátí na celém slově s výpustkou a nepřekročí limit', () => {
        const result = truncate('slovo '.repeat(60), 50)
        assert.ok(result.length <= 50, result)
        assert.ok(result.endsWith('slovo…'), result)
    })
})

describe('buildHead', () => {
    it('escapuje titulek i hodnoty atributů', () => {
        const head = buildHead({ title: 'A "B" <C>', description: 'x"><script>', canonical: 'https://plzenak.eu/a' })
        assert.ok(head.includes('<title>A &quot;B&quot; &lt;C&gt;</title>'))
        assert.equal(head.includes('<script>'), false)
    })

    it('noindex jen na požádání, og:image jen s obrázkem', () => {
        assert.equal(buildHead({ title: 'T' }).includes('robots'), false)
        assert.ok(buildHead({ title: 'T', robots: 'noindex' }).includes('<meta name="robots" content="noindex">'))
        assert.equal(buildHead({ title: 'T' }).includes('og:image'), false)
        const withImage = buildHead({ title: 'T', image: 'https://img.example/a.jpg' })
        assert.ok(withImage.includes('og:image'))
        assert.ok(withImage.includes('summary_large_image'))
    })
})

describe('injectIntoTemplate', () => {
    it('nahradí titulek hlavičkou a vloží obsah do #root, zbytek šablony nechá', () => {
        const html = injectIntoTemplate(TEMPLATE, { head: '<title>Nový</title>', body: '<h1>Ahoj</h1>' })
        assert.ok(html.includes('<title>Nový</title>'))
        assert.equal(html.includes('<title>Plzeňák</title>'), false)
        assert.ok(html.includes('<div id="root"><h1>Ahoj</h1></div>'))
        assert.ok(html.includes('/assets/index-abc.js'))
    })

    it('znaky $& a $1 v obsahu nevyloží jako odkaz na shodu', () => {
        const html = injectIntoTemplate(TEMPLATE, { head: '<title>$& $1</title>', body: '$`' })
        assert.ok(html.includes('<title>$& $1</title>'))
        assert.ok(html.includes('<div id="root">$`</div>'))
    })

    it('šablona bez značek je chyba, ne tiché vrácení bez SEO', () => {
        assert.throws(() => injectIntoTemplate('<html></html>', { head: '', body: '' }))
    })
})

describe('eventLd', () => {
    it('má povinné vlastnosti Googlu a datum bez vymyšleného času', () => {
        const ld = eventLd(EVENT, 'https://plzenak.eu/akce/42-knoflikova-valka')
        assert.equal(ld['@type'], 'Event')
        assert.equal(ld.name, 'Knoflíková válka')
        assert.equal(ld.startDate, '2026-10-24')
        assert.equal(ld.location.name, 'Divadlo J. K. Tyla')
        assert.equal(ld.location.address.addressLocality, 'Plzeň')
        assert.deepEqual(ld.image, ['https://img.example/42.jpg'])
        assert.equal(ld.description, 'První odstavec. Druhý odstavec.')
    })

    it('prázdný popis a chybějící obrázek vynechá, nevyplní prázdnou hodnotou', () => {
        const ld = eventLd({ ...EVENT, description: [''], imageUrl: null }, 'u')
        assert.equal('description' in ld, false)
        assert.equal('image' in ld, false)
    })
})

describe('itemList', () => {
    it('čísluje pozice od jedné', () => {
        assert.deepEqual(itemList(['a', 'b']).itemListElement.map(i => i.position), [1, 2])
    })
})

describe('matchRoute', () => {
    it('statické stránky a výpisy', () => {
        for (const path of ['/', '/akce', '/top-akce', '/hudba', '/zbytek-programu', '/podminky-uziti']) {
            assert.deepEqual(matchRoute(path), { type: 'page', path }, path)
        }
    })

    it('detail akce: id na začátku, slug se nekontroluje', () => {
        assert.deepEqual(matchRoute('/akce/42-knoflikova-valka'), { type: 'event', id: '42', legacy: false })
        assert.deepEqual(matchRoute('/akce/42'), { type: 'event', id: '42', legacy: false })
        assert.deepEqual(matchRoute('/akce/42-stary-nazev'), { type: 'event', id: '42', legacy: false })
    })

    it('staré adresy /events', () => {
        assert.deepEqual(matchRoute('/events'), { type: 'redirect', to: '/akce' })
        assert.deepEqual(matchRoute('/events/42'), { type: 'event', id: '42', legacy: true })
    })

    it('lomítko na konci přesměruje na adresu bez něj', () => {
        assert.deepEqual(matchRoute('/akce/'), { type: 'redirect', to: '/akce' })
        assert.deepEqual(matchRoute('/akce/42-x/'), { type: 'redirect', to: '/akce/42-x' })
    })

    it('přesměrování nikdy nevede na jinou doménu', () => {
        for (const path of ['//evil.com/', '///evil.com//', '//evil.com/akce/']) {
            const route = matchRoute(path)
            assert.equal(route.type, 'redirect', path)
            assert.ok(route.to.startsWith('/') && !route.to.startsWith('//'), `${path} → ${route.to}`)
        }
    })

    it('administrace', () => {
        assert.deepEqual(matchRoute('/admin'), { type: 'admin' })
        assert.deepEqual(matchRoute('/admin/edit/3'), { type: 'admin' })
        assert.deepEqual(matchRoute('/administrace'), { type: 'notfound' })
    })

    it('cokoli jiného je 404', () => {
        for (const path of ['/neexistuje', '/akce/abc', '/akce/42/x', '/akcex', '//evil.com']) {
            assert.deepEqual(matchRoute(path), { type: 'notfound' }, path)
        }
    })
})

describe('stránky', () => {
    it('detail akce má kanonickou adresu se slugem, Event a odkaz jen přes http(s)', () => {
        const { head, body } = eventPage(EVENT)
        assert.ok(head.includes('<link rel="canonical" href="https://plzenak.eu/akce/42-knoflikova-valka">'))
        assert.ok(head.includes('"@type":"Event"'))
        assert.ok(body.includes('<h1>Knoflíková válka</h1>'))
        assert.ok(body.includes('href="https://divadlo.example/knoflikova"'))
        assert.equal(eventPage({ ...EVENT, url: 'javascript:alert(1)' }).body.includes('javascript:'), false)
    })

    it('název akce s HTML se v obsahu escapuje', () => {
        const { body } = eventPage({ ...EVENT, name: '<img src=x onerror=alert(1)>' })
        assert.equal(body.includes('<img'), false)
    })

    it('titulek a popis akce začínají tím, kdy a kde', () => {
        assert.equal(eventTitle(EVENT), 'Knoflíková válka – 24.10.2026 | Plzeňák')
        assert.ok(eventDescription(EVENT).startsWith('24.10.2026, Divadlo J. K. Tyla. První odstavec.'))
    })

    it('výpis odkazuje na akce přes eventPath a má ItemList, homepage i Organization', () => {
        const { head, body } = listPage('/', [EVENT])
        assert.ok(body.includes(`href="${eventPath(EVENT)}"`))
        assert.ok(head.includes('"@type":"ItemList"'))
        assert.ok(head.includes('"@type":"Organization"'))
        assert.equal(listPage('/hudba', []).head.includes('"@type":"Organization"'), false)
    })

    it('404 má noindex', () => {
        assert.ok(notFoundPage().head.includes('noindex'))
    })
})

describe('createTemplateSource', () => {
    function fakeFetch(responses) {
        let calls = 0
        const fn = async () => {
            const next = responses[Math.min(calls, responses.length - 1)]
            calls++
            if (next instanceof Error) throw next
            return { ok: next.status === 200, status: next.status, text: async () => next.body }
        }
        fn.calls = () => calls
        return fn
    }

    it('do vypršení ttl vrací zapamatovanou kopii, pak stáhne znovu', async () => {
        let t = 0
        const fetchFn = fakeFetch([{ status: 200, body: 'v1' }, { status: 200, body: 'v2' }])
        const get = createTemplateSource({ url: 'u', ttlMs: 1000, fetchFn, now: () => t })
        assert.equal(await get(), 'v1')
        t = 999
        assert.equal(await get(), 'v1')
        assert.equal(fetchFn.calls(), 1)
        t = 1000
        assert.equal(await get(), 'v2')
    })

    it('při chybě stažení použije poslední dobrou kopii', async () => {
        let t = 0
        const fetchFn = fakeFetch([{ status: 200, body: 'v1' }, new Error('ECONNREFUSED')])
        const get = createTemplateSource({ url: 'u', ttlMs: 10, fetchFn, now: () => t })
        await get()
        t = 50
        const original = console.error
        console.error = () => {}
        try {
            assert.equal(await get(), 'v1')
        } finally {
            console.error = original
        }
    })

    it('bez jakékoli kopie je chyba, i u odpovědi jiné než 200', async () => {
        const get = createTemplateSource({ url: 'u', fetchFn: fakeFetch([{ status: 502, body: '' }]) })
        await assert.rejects(get())
    })
})

describe('titulky frontendu a serveru', () => {
    // Titulky jsou na dvou místech: server (site.js) je posílá první stránce,
    // frontend (lib/pageTitle.js) je nastavuje po přechodu. Test hlídá, aby se
    // nerozešly. Frontend je ESM, takže se čte jako text.
    const fs = require('node:fs')
    const path = require('node:path')
    const { PAGES, pageTitle } = require('../seo/site')
    const frontend = fs.readFileSync(path.join(__dirname, '../../../../frontend/src/lib/pageTitle.js'), 'utf8')

    it('každý titulek stránky ze serveru má frontend taky', () => {
        for (const [route, page] of Object.entries(PAGES)) {
            if (route === '/') continue
            const part = page.title.replace(/ \| Plzeňák$/, '')
            assert.ok(frontend.includes(`pageTitle('${part}')`), `${route}: chybí pageTitle('${part}')`)
        }
    })

    it('titulek homepage a tvar "<část> | Plzeňák" jsou stejné', () => {
        assert.ok(frontend.includes(`\`\${SITE_NAME}: akce v Plzni na jednom místě\``))
        assert.ok(frontend.includes('`${part} | ${SITE_NAME}`'))
        assert.equal(pageTitle('X'), 'X | Plzeňák')
    })
})

describe('sitemap', () => {
    const { sitemapEntries, buildSitemap, toLastmod } = require('../seo/sitemap')
    const { PAGES } = require('../seo/site')
    const events = [
        { ...EVENT, updatedAt: new Date('2026-10-18T10:00:00Z') },
        { ...EVENT, id: 43, slug: 'jina-akce', updatedAt: new Date('2026-10-19T08:30:00Z') },
    ]

    it('obsahuje všechny stránky z PAGES a každou akci se slugem', () => {
        const locs = sitemapEntries(events).map(e => e.loc)
        for (const path of Object.keys(PAGES)) assert.ok(locs.includes(`https://plzenak.eu${path}`), path)
        assert.ok(locs.includes('https://plzenak.eu/akce/42-knoflikova-valka'))
        assert.ok(locs.includes('https://plzenak.eu/akce/43-jina-akce'))
        assert.equal(locs.length, Object.keys(PAGES).length + 2)
    })

    it('akce má lastmod z updatedAt, výpisy nejnovější změnu, právní texty žádný', () => {
        const byLoc = Object.fromEntries(sitemapEntries(events).map(e => [e.loc, e.lastmod]))
        assert.equal(byLoc['https://plzenak.eu/akce/42-knoflikova-valka'], '2026-10-18T10:00:00.000Z')
        assert.equal(byLoc['https://plzenak.eu/hudba'], '2026-10-19T08:30:00.000Z')
        assert.equal(byLoc['https://plzenak.eu/podminky-uziti'], null)
    })

    it('bez akcí mají výpisy lastmod null, ne vymyšlené datum', () => {
        assert.equal(sitemapEntries([]).find(e => e.loc === 'https://plzenak.eu/akce').lastmod, null)
    })

    it('XML má hlavičku, jmenný prostor, escapuje & a vynechá prázdný lastmod', () => {
        const xml = buildSitemap([{ loc: 'https://plzenak.eu/a?x=1&y=2', lastmod: null }, { loc: 'https://plzenak.eu/b', lastmod: '2026-10-19T00:00:00.000Z' }])
        assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
        assert.ok(xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'))
        assert.ok(xml.includes('<loc>https://plzenak.eu/a?x=1&amp;y=2</loc></url>'))
        assert.ok(xml.includes('<lastmod>2026-10-19T00:00:00.000Z</lastmod>'))
    })

    it('toLastmod nepustí neplatné datum', () => {
        assert.equal(toLastmod(null), null)
        assert.equal(toLastmod('nesmysl'), null)
    })
})

describe('stránky /dnes, /tento-vikend a O projektu', () => {
    const fs = require('node:fs')
    const path = require('node:path')
    const { pathToFileURL } = require('node:url')
    const backendLabels = require('../seo/dayLabels')
    const { ABOUT_PARAGRAPHS } = require('../seo/site')
    const { staticPage } = require('../seo/pages')
    const frontendFile = path.join(__dirname, '../../../../frontend/src/lib/events/dayLabels.js')

    // Pondělí, sobota, neděle, přelom měsíce, přelom roku, 00:30 v Praze (22:30 UTC předchozího dne).
    const DATES = ['2026-10-19T10:00:00Z', '2026-10-24T10:00:00Z', '2026-10-25T10:00:00Z',
        '2026-10-29T10:00:00Z', '2026-12-28T10:00:00Z', '2026-10-18T22:30:00Z', '2027-03-28T10:00:00Z']

    it('popisky dne a víkendu odpovídají pravidlům', () => {
        const at = iso => new Date(iso)
        assert.equal(backendLabels.todayLabel(at('2026-10-19T10:00:00Z')), 'pondělí 19. října 2026')
        assert.equal(backendLabels.todayLabel(at('2026-10-18T22:30:00Z')), 'pondělí 19. října 2026', 'pražský den, ne UTC')
        assert.equal(backendLabels.weekendLabel(at('2026-10-19T10:00:00Z')), 'sobota 24. a neděle 25. října 2026')
        assert.equal(backendLabels.weekendLabel(at('2026-10-24T10:00:00Z')), 'sobota 24. a neděle 25. října 2026')
        assert.equal(backendLabels.weekendLabel(at('2026-10-25T10:00:00Z')), 'neděle 25. října 2026', 'v neděli jen ta neděle')
        assert.equal(backendLabels.weekendLabel(at('2026-10-29T10:00:00Z')), 'sobota 31. října a neděle 1. listopadu 2026')
        assert.equal(backendLabels.weekendLabel(at('2026-12-28T10:00:00Z')), 'sobota 2. a neděle 3. ledna 2027')
    })

    it('serverová kopie dává stejné texty jako frontend', async () => {
        const frontendLabels = await import(pathToFileURL(frontendFile).href)
        for (const iso of DATES) {
            for (const fn of ['todayLabel', 'weekendLabel', 'todayIntro', 'weekendIntro']) {
                assert.equal(backendLabels[fn](new Date(iso)), frontendLabels[fn](new Date(iso)), `${fn} ${iso}`)
            }
        }
    })

    it('/dnes a /tento-vikend jsou výpisy s datem v popisu i v textu', () => {
        const now = new Date('2026-10-19T10:00:00Z')
        assert.deepEqual(matchRoute('/dnes'), { type: 'page', path: '/dnes' })
        const today = listPage('/dnes', [EVENT], now)
        assert.ok(today.head.includes('content="Akce v Plzni dnes, pondělí 19. října 2026:'))
        assert.ok(today.body.includes('<h1>Dnes v Plzni</h1><p>Akce v Plzni dnes, pondělí 19. října 2026:'))
        assert.ok(listPage('/tento-vikend', [], now).head.includes('sobota 24. a neděle 25. října 2026'))
    })

    it('O projektu má text v HTML pro roboty a frontend má stejné odstavce', () => {
        const { body } = staticPage('/o-projektu')
        for (const p of ABOUT_PARAGRAPHS) assert.ok(body.includes(`<p>${p}</p>`), p.slice(0, 40))
        const about = fs.readFileSync(path.join(__dirname, '../../../../frontend/src/pages/About/About.jsx'), 'utf8')
        for (const p of ABOUT_PARAGRAPHS) assert.ok(about.includes(`'${p}'`), `frontend: ${p.slice(0, 40)}`)
    })

    it('nové stránky jsou v sitemap', () => {
        const { sitemapEntries } = require('../seo/sitemap')
        const locs = sitemapEntries([]).map(e => e.loc)
        for (const p of ['/dnes', '/tento-vikend', '/o-projektu']) assert.ok(locs.includes(`https://plzenak.eu${p}`), p)
    })
})
