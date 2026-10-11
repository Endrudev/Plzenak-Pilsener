// Skládání SQL pro GET /api/events. Žádné volání databáze — vstupem jsou query
// parametry, výstupem text SQL a pole hodnot pro $1, $2… Díky tomu jde logika
// filtrů otestovat bez Postgresu.

// Povolené způsoby řazení. ORDER BY se nedá poslat přes $1 (placeholder umí jen
// hodnoty, ne názvy sloupců), takže uživatel posílá jen klíč do téhle tabulky a
// samotné SQL je vždycky napsané tady. Druhotné řazení podle id drží pořadí
// stabilní, když má víc akcí stejné datum.
const SORTS = {
    konani:  `TO_DATE(date, 'DD.MM.YYYY') ASC, id ASC`,
    pridano: `created_at DESC, id ASC`,
}

// Neznámá nebo chybějící hodnota spadne na výchozí řazení podle data konání.
// `Object.hasOwn`, aby klíč jako `constructor` nebo `__proto__` nevrátil
// něco z prototypu Object.
function resolveOrderBy(razeni) {
    return Object.hasOwn(SORTS, razeni) ? SORTS[razeni] : SORTS.konani
}

// Vrací `{ whereClause, values }`. `whereClause` je buď prázdný řetězec, nebo
// začíná `WHERE`; `values` odpovídá placeholderům `$1…$n` v něm.
function buildWhere({ q, kategorie, misto, datum, top, vyjma } = {}) {
    const conditions = []
    const values = []
    conditions.push(`TO_DATE(date, 'DD.MM.YYYY') >= CURRENT_DATE`)
    if (datum === 'dnes') {
        conditions.push(`TO_DATE(date, 'DD.MM.YYYY') = CURRENT_DATE`)
    }
    if (datum === 'vikend') {
        // Nejbližší sobota a neděle. Posun ode dneška je 6 - ISODOW (po=1 … so=6),
        // konec je o den dál. V neděli je oba posuny 0 — víkend je právě dnes,
        // protože sobota už byla.
        conditions.push(`TO_DATE(date, 'DD.MM.YYYY') BETWEEN
                CURRENT_DATE + (CASE WHEN EXTRACT(ISODOW FROM CURRENT_DATE) = 7 THEN 0
                                     ELSE (6 - EXTRACT(ISODOW FROM CURRENT_DATE))::int END)
                AND
                CURRENT_DATE + (CASE WHEN EXTRACT(ISODOW FROM CURRENT_DATE) = 7 THEN 0
                                     ELSE (7 - EXTRACT(ISODOW FROM CURRENT_DATE))::int END)`)
    }
    if (datum === '7dni') {
        conditions.push(`TO_DATE(date, 'DD.MM.YYYY') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`)
    }
    if (datum === '30dni') {
        conditions.push(`TO_DATE(date, 'DD.MM.YYYY') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`)
    }
    if (q) {
        values.push(`%${q}%`)
        conditions.push(`name ILIKE $${values.length}`)
    }
    if (kategorie) {
        values.push(kategorie)
        conditions.push(`EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${values.length})`)
    }
    if (misto) {
        values.push(misto)
        conditions.push(`location = $${values.length}`)
    }
    if (top === '1') {
        values.push('TOP akce')
        conditions.push(`EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${values.length})`)
    }
    // Opak `kategorie`/`top` — akce, co NEMAJÍ žádný z vyjmenovaných tagů.
    // Zatím jediný spotřebitel je stránka /zbytek-programu (vše kromě
    // TOP akce a Hudba), ale je to obecný parametr, ne hardcoded pro ni.
    if (vyjma) {
        const tagy = vyjma.split(',').map(t => t.trim()).filter(Boolean)
        for (const tag of tagy) {
            values.push(tag)
            conditions.push(`NOT EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${values.length})`)
        }
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    return { whereClause, values }
}

// Stránkování — page/perPage jsou nepovinné. Volající, co je nepošle
// (Home.jsx, AdminDashboard.jsx), dostanou velkorysou první stránku
// (100), ne doslova všechno bez limitu — dotaz tak zůstává vždycky
// omezený, i když se dnešní objem dat (pár desítek akcí) chová stejně
// jako dřívější "vrať úplně všechno".
function parsePaging(page, perPage) {
    const perPageNum = Math.min(Math.max(parseInt(perPage, 10) || 100, 1), 100)
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    return { pageNum, perPageNum, offset: (pageNum - 1) * perPageNum }
}

module.exports = { SORTS, resolveOrderBy, buildWhere, parsePaging }
