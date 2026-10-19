// Konstanty webu pro serverový renderer (SEO fáze 3). Čisté hodnoty a funkce.

const SITE_URL = 'https://plzenak.eu'
const SITE_NAME = 'Plzeňák'

// Titulek stránky: "<část> | Plzeňák". Stejné pravidlo má frontend v
// frontend/src/lib/pageTitle.js, aby se titulek v záložce po přechodu mezi
// stránkami (React) shodoval s tím, co poslal server. Při změně upravit obojí.
function pageTitle(part) {
    return part ? `${part} | ${SITE_NAME}` : `${SITE_NAME}: akce v Plzni na jednom místě`
}

// Statické stránky a výpisy: titulek, popis a pro výpisy pevný filtr. Filtry
// odpovídají konstantám FIXED ve frontend/src/pages/<Stránka>/<Stránka>.jsx.
const PAGES = {
    '/': {
        title: pageTitle(null),
        description: 'Kulturní a společenské akce v Plzni na dnešek, víkend i další týdny. Koncerty, divadlo, výstavy, akce pro děti a další na jednom místě.',
        heading: 'Akce v Plzni',
        list: {},
    },
    '/akce': {
        title: pageTitle('Všechny akce v Plzni'),
        description: 'Kalendář nadcházejících akcí v Plzni. Hledání a filtry podle data, kategorie a místa.',
        heading: 'Všechny akce v Plzni',
        list: {},
    },
    '/top-akce': {
        title: pageTitle('TOP akce v Plzni'),
        description: 'Výběr nejzajímavějších akcí v Plzni na nejbližší dny a týdny.',
        heading: 'TOP akce v Plzni',
        list: { top: '1' },
    },
    '/hudba': {
        title: pageTitle('Koncerty a hudba v Plzni'),
        description: 'Nadcházející koncerty a hudební akce v Plzni.',
        heading: 'Koncerty a hudba v Plzni',
        list: { kategorie: 'Hudba' },
    },
    '/zbytek-programu': {
        title: pageTitle('Další akce v Plzni'),
        description: 'Divadlo, výstavy, přednášky, sport, akce pro děti a další program v Plzni.',
        heading: 'Další akce v Plzni',
        list: { vyjma: 'TOP akce,Hudba' },
    },
    '/zasady-ochrany-osobnich-udaju': {
        title: pageTitle('Zásady ochrany osobních údajů'),
        description: 'Jaké osobní údaje Plzeňák zpracovává, proč a jaká máte práva.',
        heading: 'Zásady ochrany osobních údajů',
    },
    '/podminky-uziti': {
        title: pageTitle('Podmínky užití'),
        description: 'Podmínky používání webu Plzeňák.',
        heading: 'Podmínky užití',
    },
}

module.exports = { SITE_URL, SITE_NAME, PAGES, pageTitle }
