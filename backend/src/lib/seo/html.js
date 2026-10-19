// Bezpečné vkládání textu do HTML. Názvy a popisy akcí přicházejí od
// administrátora i z importu, takže se s nimi zachází jako s cizím vstupem.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

// Pro text mezi značkami i pro hodnotu atributu v uvozovkách. Escapuje i
// uvozovky, takže stejná funkce stačí na obojí.
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ESCAPES[ch])
}

// JSON-LD uvnitř <script>. HTML escapování tady nefunguje (prohlížeč obsah
// <script> neodescapuje, z &lt; by v JSON zůstalo &lt;). Nebezpečný je jen
// text "</script>", který by skript ukončil a zbytek by se četl jako HTML.
// Proto se každé "<" zapíše jako JSON escape \u003c: pro JSON je to stejný
// znak, pro HTML parser to není začátek značky. Totéž pro znaky U+2028 a
// U+2029, které JSON povoluje a starší JavaScript ne.
//
// Ty dva znaky se tu skládají přes kód, ne doslova: v regulárním výrazu ve
// zdrojovém kódu by se četly jako konec řádku.
const LINE_SEPARATOR = String.fromCharCode(0x2028)
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029)

function jsonLdScript(data) {
    const json = JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .split(LINE_SEPARATOR).join('\\u2028')
        .split(PARAGRAPH_SEPARATOR).join('\\u2029')
    return `<script type="application/ld+json">${json}</script>`
}

// Zkrácení textu pro meta description (vyhledávače ukazují asi 155 znaků).
// Řeže na celém slově a přidá výpustku.
function truncate(text, max = 155) {
    const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
    if (clean.length <= max) return clean
    const cut = clean.slice(0, max - 1)
    const lastSpace = cut.lastIndexOf(' ')
    return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`
}

module.exports = { escapeHtml, jsonLdScript, truncate }
