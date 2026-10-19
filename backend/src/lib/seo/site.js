// Konstanty webu pro serverový renderer (SEO fáze 3). Čisté hodnoty a funkce.

const { todayIntro, weekendIntro } = require('./dayLabels')

const SITE_URL = 'https://plzenak.eu'
const SITE_NAME = 'Plzeňák'

// Titulek stránky: "<část> | Plzeňák". Stejné pravidlo má frontend v
// frontend/src/lib/pageTitle.js, aby se titulek v záložce po přechodu mezi
// stránkami (React) shodoval s tím, co poslal server. Při změně upravit obojí.
function pageTitle(part) {
    return part ? `${part} | ${SITE_NAME}` : `${SITE_NAME}: akce v Plzni dnes i o víkendu – koncerty, divadlo`
}

// Odstavce stránky O projektu (bez HTML, renderer je escapuje).
const ABOUT_PARAGRAPHS = [
    'Plzeňák je přehled kulturních a společenských akcí v Plzni na jednom místě: koncerty, divadlo, výstavy, přednášky, sport i program pro děti.',
    'Část akcí přidáváme ručně, část přebíráme z veřejného kalendáře města Plzně (akce.plzen.eu). Každou akci před zveřejněním zkontroluje a schválí člověk. Popisky převzatých akcí píšeme vlastními slovy s pomocí umělé inteligence, a to jen z faktů, které uvádí zdroj.',
    'Nové akce přibývají průběžně a proběhlé z výpisů samy mizí. U akcí je odkaz na web pořadatele, kde najdete aktuální podrobnosti a vstupenky.',
    'Plzeňák je nekomerční učební projekt Ondřeje Štindla. Není propojený s městem Plzní ani s pořadateli akcí a nemá z nich žádný zisk.',
    'Chybu v akci nebo tip na akci, která chybí, pošlete na kontakt@plzenak.eu.',
]

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
    // Stránky podle toho, na co se lidé (a AI) ptají nejčastěji (SEO fáze 5).
    // `describe(now)` dá popis s dnešním datem: první věta stránky tak rovnou
    // odpovídá na otázku a je z ní vidět, že obsah je čerstvý.
    '/dnes': {
        title: pageTitle('Co dělat v Plzni dnes'),
        heading: 'Dnes v Plzni',
        describe: todayIntro,
        list: { datum: 'dnes' },
    },
    '/tento-vikend': {
        title: pageTitle('Co dělat v Plzni o víkendu'),
        heading: 'Tento víkend v Plzni',
        describe: weekendIntro,
        list: { datum: 'vikend' },
    },
    '/o-projektu': {
        title: pageTitle('O projektu'),
        description: 'Kdo Plzeňák provozuje, odkud jsou akce a jak často se aktualizují.',
        heading: 'O projektu Plzeňák',
        // Text stránky pro roboty. Stejné odstavce má frontend
        // (frontend/src/pages/About/About.jsx), shodu hlídá test.
        paragraphs: ABOUT_PARAGRAPHS,
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

// Popis stránky: pevný, nebo s dnešním datem (describe).
function pageDescription(page, now = new Date()) {
    return page.describe ? page.describe(now) : page.description
}

module.exports = { SITE_URL, SITE_NAME, PAGES, ABOUT_PARAGRAPHS, pageTitle, pageDescription }
