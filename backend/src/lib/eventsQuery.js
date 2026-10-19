// Skládání SQL pro GET /api/events. Žádné volání databáze — vstupem jsou query
// parametry, výstupem text SQL a pole hodnot pro $1, $2… Díky tomu jde logika
// filtrů otestovat bez Postgresu.

// Povolené způsoby řazení. ORDER BY se nedá poslat přes $1 (placeholder umí jen
// hodnoty, ne názvy sloupců), takže uživatel posílá jen klíč do téhle tabulky a
// samotné SQL je vždycky napsané tady. Druhotné řazení podle id drží pořadí
// stabilní, když má víc akcí stejné datum.
const SORTS = {
    konani:  `starts_on ASC, id ASC`,
    pridano: `created_at DESC, id ASC`,
}

// Dnešní datum v Plzni. CURRENT_DATE by vrátilo datum v časovém pásmu
// databáze, a to je v Dockeru UTC: mezi půlnocí a druhou ráno (v zimě do
// jedné) by "dnes" byl pořád včerejšek. now() je okamžik, AT TIME ZONE ho
// převede na pražský místní čas a ::date z něj vezme den.
const TODAY = `(now() AT TIME ZONE 'Europe/Prague')::date`

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
    conditions.push(`starts_on >= ${TODAY}`)
    if (datum === 'dnes') {
        conditions.push(`starts_on = ${TODAY}`)
    }
    if (datum === 'vikend') {
        // Nejbližší sobota a neděle. Posun ode dneška je 6 - ISODOW (po=1 … so=6),
        // konec je o den dál. V neděli je oba posuny 0 — víkend je právě dnes,
        // protože sobota už byla.
        conditions.push(`starts_on BETWEEN
                ${TODAY} + (CASE WHEN EXTRACT(ISODOW FROM ${TODAY}) = 7 THEN 0
                                 ELSE (6 - EXTRACT(ISODOW FROM ${TODAY}))::int END)
                AND
                ${TODAY} + (CASE WHEN EXTRACT(ISODOW FROM ${TODAY}) = 7 THEN 0
                                 ELSE (7 - EXTRACT(ISODOW FROM ${TODAY}))::int END)`)
    }
    // date + celé číslo dá zase date. Dřívější + INTERVAL dával timestamp,
    // což u date sloupce fungovalo jen díky implicitnímu převodu.
    if (datum === '7dni') {
        conditions.push(`starts_on BETWEEN ${TODAY} AND ${TODAY} + 7`)
    }
    if (datum === '30dni') {
        conditions.push(`starts_on BETWEEN ${TODAY} AND ${TODAY} + 30`)
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

module.exports = { SORTS, TODAY, resolveOrderBy, buildWhere, parsePaging }
