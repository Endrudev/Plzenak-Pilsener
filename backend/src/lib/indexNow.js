// IndexNow: oznámení vyhledávačům, že se stránka změnila (SEO fáze 4,
// rozhodnuto autorem 2026-10-19). Jeden POST na api.indexnow.org se rozešle
// všem zapojeným vyhledávačům (Bing, Seznam, Yandex, Naver…). Google IndexNow
// nepodporuje, ten jde podle sitemap.
//
// Jak vyhledávač pozná, že adresy posíláme my: v požadavku je klíč a na webu
// leží soubor https://plzenak.eu/<klíč>.txt se stejným klíčem (vrací ho
// routes/render.js). Klíč není tajemství, ten soubor je veřejný.
//
// Ven odcházejí jen veřejné adresy stránek, nic o návštěvnících.
//
// Ping nikdy nevyhodí výjimku a routy na něj nečekají: když IndexNow neodpoví,
// vyhledávač stránku najde později přes sitemap. Uložení akce kvůli tomu
// selhat nesmí.

const { SITE_URL } = require('./seo/site')

const ENDPOINT = 'https://api.indexnow.org/indexnow'

// Klíč: 8 až 128 znaků z a-z, A-Z, 0-9 a pomlčky (specifikace IndexNow).
function isValidKey(key) {
    return typeof key === 'string' && /^[a-zA-Z0-9-]{8,128}$/.test(key)
}

// Tělo požadavku podle specifikace. Adresy musí patřit hostu, jinak 422.
function buildPayload(key, urls) {
    const host = new URL(SITE_URL).host
    return {
        host,
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList: [...new Set(urls)].filter(url => new URL(url).host === host),
    }
}

// Bez platného klíče (lokální vývoj, testy) je IndexNow vypnutý a notify jen
// vrátí 'disabled'. fetchFn jde podstrčit kvůli testům.
function createIndexNow({ key, fetchFn = fetch, timeoutMs = 5_000 } = {}) {
    const enabled = isValidKey(key)

    async function notify(urls) {
        if (!enabled) return 'disabled'
        const payload = buildPayload(key, urls)
        if (payload.urlList.length === 0) return 'empty'
        try {
            const res = await fetchFn(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(timeoutMs),
            })
            // 200 a 202 jsou úspěch (202 = přijato, klíč se teprve ověří).
            if (res.status !== 200 && res.status !== 202) {
                console.error(`IndexNow: ${res.status} pro ${payload.urlList.length} adres`)
                return 'error'
            }
            return 'sent'
        } catch (err) {
            console.error(`IndexNow: ${err.message}`)
            return 'error'
        }
    }

    return { enabled, key, notify }
}

// Sdílená instance pro routy. Klíč z prostředí; v Compose ho nastavuje
// docker-compose.yml, lokálně chybí a IndexNow je vypnutý.
const indexNow = createIndexNow({ key: process.env.INDEXNOW_KEY })

// Absolutní adresa akce pro ping.
function eventUrl(path) {
    return `${SITE_URL}${path}`
}

module.exports = { createIndexNow, buildPayload, isValidKey, indexNow, eventUrl }
