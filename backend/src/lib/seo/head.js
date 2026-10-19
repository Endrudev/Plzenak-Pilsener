// Sestavení značek do <head> a jejich vložení do index.html z buildu frontendu.
// Čisté funkce: vstupem jsou hodnoty a text šablony, výstupem text HTML.

const { escapeHtml, jsonLdScript } = require('./html')
const { SITE_NAME } = require('./site')

// `robots` je hodnota meta robots ('noindex'), jinak se značka nevkládá a platí
// výchozí indexování. `image` je absolutní adresa (obrázek akce v R2), bez něj
// se og:image vynechá.
function buildHead({ title, description, canonical, robots, ogType = 'website', image, jsonLd = [] }) {
    const tags = [`<title>${escapeHtml(title)}</title>`]
    if (description) tags.push(`<meta name="description" content="${escapeHtml(description)}">`)
    if (robots) tags.push(`<meta name="robots" content="${escapeHtml(robots)}">`)
    if (canonical) tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`)

    // Open Graph (Facebook, Messenger, WhatsApp, LinkedIn…) a Twitter/X karta.
    // Náhled odkazu sdíleného kamkoli jinam.
    tags.push(`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">`)
    tags.push('<meta property="og:locale" content="cs_CZ">')
    tags.push(`<meta property="og:type" content="${escapeHtml(ogType)}">`)
    tags.push(`<meta property="og:title" content="${escapeHtml(title)}">`)
    if (description) tags.push(`<meta property="og:description" content="${escapeHtml(description)}">`)
    if (canonical) tags.push(`<meta property="og:url" content="${escapeHtml(canonical)}">`)
    if (image) tags.push(`<meta property="og:image" content="${escapeHtml(image)}">`)
    tags.push(`<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`)

    for (const data of jsonLd) tags.push(jsonLdScript(data))
    return tags.join('\n    ')
}

const TITLE_RE = /<title>[\s\S]*?<\/title>/
const ROOT_RE = /<div id="root"><\/div>/

// Nahradí <title> sestavenou hlavičkou a do prázdného <div id="root"> vloží
// obsah stránky. Když šablona značky nemá (změnil se index.html), vyhodí
// chybu: tichý návrat šablony bez úprav by SEO rozbil nepozorovaně.
function injectIntoTemplate(template, { head, body = '' }) {
    if (!TITLE_RE.test(template) || !ROOT_RE.test(template)) {
        throw new Error('Šablona index.html nemá <title> nebo prázdný <div id="root">.')
    }
    // Funkce místo řetězce jako druhý argument replace: v řetězci by se znaky
    // $& nebo $1 z názvu akce vyložily jako odkaz na shodu.
    return template
        .replace(TITLE_RE, () => head)
        .replace(ROOT_RE, () => `<div id="root">${body}</div>`)
}

module.exports = { buildHead, injectIntoTemplate }
