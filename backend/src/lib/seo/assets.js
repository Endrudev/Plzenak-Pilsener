// Nápovědy pro prohlížeč, aby stáhl kód konkrétní stránky hned (2026-10-20).
//
// Frontend načítá stránky líně (React.lazy v App.jsx): hlavní balík obsahuje jen
// homepage a kód ostatních stránek se stahuje až podle adresy. Při přímém příchodu
// (z Googlu na detail akce nebo /dnes) by prohlížeč nejdřív stáhl a spustil hlavní
// balík a teprve pak zjistil, že potřebuje další soubor. Renderer adresu zná, a tak
// do <head> rovnou přidá <link rel="modulepreload"> pro kód stránky a
// <link rel="preload" as="style"> pro její CSS. Oboje se pak stahuje souběžně.
//
// Mapu „zdrojový soubor stránky → soubory v buildu“ dává manifest Vite
// (dist/.vite/manifest.json, build.manifest v frontend/vite.config.ts). Čistá funkce,
// manifest dodá routa.

const { escapeHtml } = require('./html')

// Zdrojový soubor stránky (klíč v manifestu) podle typu stránky z matchRoute. Musí
// odpovídat importům v PAGE_LOADERS ve frontend/src/App.jsx. Homepage tu není, je
// v hlavním balíku.
const PAGE_SOURCES = {
    '/akce': 'src/pages/Events/Events.jsx',
    '/top-akce': 'src/pages/TopAkce/TopAkce.jsx',
    '/hudba': 'src/pages/Hudba/Hudba.jsx',
    '/zbytek-programu': 'src/pages/ZbytekProgramu/ZbytekProgramu.jsx',
    '/dnes': 'src/pages/Dnes/Dnes.jsx',
    '/tento-vikend': 'src/pages/TentoVikend/TentoVikend.jsx',
    '/o-projektu': 'src/pages/About/About.jsx',
    '/zasady-ochrany-osobnich-udaju': 'src/pages/Privacy/Privacy.jsx',
    '/podminky-uziti': 'src/pages/Terms/Terms.jsx',
}
const EVENT_SOURCE = 'src/pages/EventDetail/EventDetail.jsx'
const NOT_FOUND_SOURCE = 'src/pages/NotFound/NotFound.jsx'

// Zdrojový soubor pro výsledek matchRoute, nebo null (homepage, administrace).
function pageSource(route) {
    if (route.type === 'page') return PAGE_SOURCES[route.path] ?? null
    if (route.type === 'event') return EVENT_SOURCE
    if (route.type === 'notfound') return NOT_FOUND_SOURCE
    return null
}

// Projde položku manifestu a vše, co importuje (sdílené části), a vrátí odkazy.
// Hlavní balík (index.html) se přeskočí, ten má šablona sama.
function preloadTags(manifest, source) {
    if (!manifest || !source || !manifest[source]) return ''
    const scripts = new Set()
    const styles = new Set()
    const seen = new Set()
    const visit = key => {
        if (seen.has(key) || key === 'index.html') return
        seen.add(key)
        const chunk = manifest[key]
        if (!chunk) return
        if (chunk.file?.endsWith('.js')) scripts.add(chunk.file)
        if (chunk.file?.endsWith('.css')) styles.add(chunk.file)
        for (const css of chunk.css ?? []) styles.add(css)
        for (const imp of chunk.imports ?? []) visit(imp)
    }
    visit(source)
    return [
        ...[...scripts].map(f => `<link rel="modulepreload" crossorigin href="/${escapeHtml(f)}">`),
        ...[...styles].map(f => `<link rel="preload" as="style" crossorigin href="/${escapeHtml(f)}">`),
    ].join('\n    ')
}

module.exports = { pageSource, preloadTags, PAGE_SOURCES }
