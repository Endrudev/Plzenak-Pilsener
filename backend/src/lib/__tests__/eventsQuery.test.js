const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { SORTS, TODAY, resolveOrderBy, buildWhere, parsePaging } = require('../eventsQuery')

const NOT_PAST = `starts_on >= ${TODAY}`

describe('buildWhere', () => {
    it('bez filtrů skryje jen proběhlé akce a nemá žádné hodnoty', () => {
        const { whereClause, values } = buildWhere({})
        assert.equal(whereClause, `WHERE ${NOT_PAST}`)
        assert.deepEqual(values, [])
    })

    it('zvládne i volání bez argumentu', () => {
        assert.deepEqual(buildWhere(), buildWhere({}))
    })

    it('proběhlé akce skrývá vždycky, i při jiných filtrech', () => {
        for (const params of [{ q: 'x' }, { datum: 'dnes' }, { top: '1' }, { vyjma: 'Hudba' }]) {
            assert.ok(buildWhere(params).whereClause.includes(NOT_PAST), JSON.stringify(params))
        }
    })

    it('hledání q dá do hodnot vzor s procenty a odkáže na $1', () => {
        const { whereClause, values } = buildWhere({ q: 'pivo' })
        assert.deepEqual(values, ['%pivo%'])
        assert.match(whereClause, /name ILIKE \$1/)
    })

    it('uživatelský text nikdy nevloží přímo do SQL', () => {
        const evil = `x'; DROP TABLE events; --`
        const { whereClause, values } = buildWhere({ q: evil, kategorie: evil, misto: evil })
        assert.equal(whereClause.includes('DROP'), false)
        assert.equal(whereClause.includes(evil), false)
        assert.equal(values.length, 3)
    })

    it('kategorie a místo dostanou každá svůj placeholder v pořadí, v jakém se hodnoty přidaly', () => {
        const { whereClause, values } = buildWhere({ q: 'a', kategorie: 'Hudba', misto: 'Náměstí' })
        assert.deepEqual(values, ['%a%', 'Hudba', 'Náměstí'])
        assert.match(whereClause, /name ILIKE \$1/)
        assert.match(whereClause, /t ILIKE \$2/)
        assert.match(whereClause, /location = \$3/)
    })

    it('top=1 filtruje na tag TOP akce', () => {
        const { whereClause, values } = buildWhere({ top: '1' })
        assert.deepEqual(values, ['TOP akce'])
        assert.match(whereClause, /t ILIKE \$1/)
    })

    it('top s jinou hodnotou než "1" se ignoruje', () => {
        for (const top of ['0', 'true', '', undefined]) {
            assert.deepEqual(buildWhere({ top }).values, [], String(top))
        }
    })

    it('vyjma rozdělí tagy po čárkách, ořízne mezery a vynechá prázdné', () => {
        const { whereClause, values } = buildWhere({ vyjma: ' TOP akce , Hudba ,, ' })
        assert.deepEqual(values, ['TOP akce', 'Hudba'])
        assert.match(whereClause, /NOT EXISTS .* \$1\)/)
        assert.match(whereClause, /NOT EXISTS .* \$2\)/)
    })

    it('vyjma s jediným tagem přidá jednu podmínku', () => {
        const { whereClause } = buildWhere({ vyjma: 'Hudba' })
        assert.equal(whereClause.match(/NOT EXISTS/g).length, 1)
    })

    it('vyjma složené jen z čárek a mezer nepřidá nic', () => {
        assert.deepEqual(buildWhere({ vyjma: ' , ,' }).values, [])
    })

    it('podmínky se spojují AND, ne OR', () => {
        const { whereClause } = buildWhere({ q: 'a', misto: 'b' })
        assert.equal(whereClause.includes(' OR '), false)
        assert.equal(whereClause.match(/ AND /g).length, 2)
    })

    it('počet placeholderů odpovídá počtu hodnot', () => {
        const params = { q: 'a', kategorie: 'b', misto: 'c', top: '1', vyjma: 'd,e' }
        const { whereClause, values } = buildWhere(params)
        const used = new Set(whereClause.match(/\$\d+/g))
        assert.equal(used.size, values.length)
        for (let i = 1; i <= values.length; i++) assert.ok(used.has(`$${i}`), `chybí $${i}`)
    })

    describe('datum', () => {
        it('dnes přidá rovnost s dnešním datem', () => {
            const { whereClause } = buildWhere({ datum: 'dnes' })
            assert.ok(whereClause.includes(`starts_on = ${TODAY}`))
        })

        it('dnes se počítá v pražském čase, ne v pásmu databáze', () => {
            assert.match(TODAY, /AT TIME ZONE 'Europe\/Prague'/)
            for (const datum of [undefined, 'dnes', 'vikend', '7dni', '30dni']) {
                assert.equal(buildWhere({ datum }).whereClause.includes('CURRENT_DATE'), false, String(datum))
            }
        })

        it('filtry i řazení jdou přes sloupec starts_on, ne přes převod textu', () => {
            for (const datum of [undefined, 'dnes', 'vikend', '7dni', '30dni']) {
                assert.equal(buildWhere({ datum }).whereClause.includes('TO_DATE'), false, String(datum))
            }
            assert.equal(SORTS.konani.includes('TO_DATE'), false)
        })

        it('vikend počítá posun od ISODOW a v neděli začíná dnes', () => {
            const { whereClause } = buildWhere({ datum: 'vikend' })
            assert.match(whereClause, /ISODOW/)
            assert.match(whereClause, /= 7 THEN 0/)
            assert.match(whereClause, /6 - EXTRACT\(ISODOW/)
            assert.match(whereClause, /7 - EXTRACT\(ISODOW/)
        })

        it('7dni a 30dni mají každé svůj interval', () => {
            assert.ok(buildWhere({ datum: '7dni' }).whereClause.endsWith(`${TODAY} + 7`))
            assert.ok(buildWhere({ datum: '30dni' }).whereClause.endsWith(`${TODAY} + 30`))
        })

        it('každý rychlý filtr si ponechá skrytí proběhlých akcí a přidá k němu vlastní podmínku', () => {
            const base = buildWhere({}).whereClause
            for (const datum of ['dnes', 'vikend', '7dni', '30dni']) {
                const { whereClause } = buildWhere({ datum })
                assert.ok(whereClause.startsWith(`${base} AND `), datum)
            }
        })

        it('různé rychlé filtry dávají různé SQL', () => {
            const clauses = ['dnes', 'vikend', '7dni', '30dni'].map(datum => buildWhere({ datum }).whereClause)
            assert.equal(new Set(clauses).size, 4)
        })

        it('neznámá hodnota se ignoruje', () => {
            assert.deepEqual(buildWhere({ datum: 'zitra' }), buildWhere({}))
        })

        it('filtry data nepřidávají žádné hodnoty (jsou celé v SQL)', () => {
            assert.deepEqual(buildWhere({ datum: 'vikend' }).values, [])
        })
    })
})

describe('resolveOrderBy', () => {
    it('konani vrátí řazení podle data konání', () => {
        assert.equal(resolveOrderBy('konani'), SORTS.konani)
    })

    it('pridano vrátí řazení podle data přidání, nejnovější první', () => {
        assert.equal(resolveOrderBy('pridano'), SORTS.pridano)
        assert.match(SORTS.pridano, /created_at DESC/)
    })

    it('chybějící nebo neznámá hodnota spadne na výchozí řazení', () => {
        assert.equal(resolveOrderBy(undefined), SORTS.konani)
        assert.equal(resolveOrderBy(''), SORTS.konani)
        assert.equal(resolveOrderBy('cokoli'), SORTS.konani)
    })

    it('klíče zděděné z prototypu Object nejsou řazení', () => {
        for (const key of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
            assert.equal(resolveOrderBy(key), SORTS.konani, key)
        }
    })

    it('do SQL se nikdy nedostane text od uživatele', () => {
        assert.ok(Object.values(SORTS).includes(resolveOrderBy('id; DROP TABLE events')))
    })

    it('obě řazení mají druhotný klíč id, aby bylo pořadí stabilní', () => {
        for (const sql of Object.values(SORTS)) assert.match(sql, /id ASC$/)
    })
})

describe('parsePaging', () => {
    it('bez parametrů je první stránka o 100 položkách', () => {
        assert.deepEqual(parsePaging(undefined, undefined), { pageNum: 1, perPageNum: 100, offset: 0 })
    })

    it('offset je (stránka − 1) × počet na stránku', () => {
        assert.deepEqual(parsePaging('3', '12'), { pageNum: 3, perPageNum: 12, offset: 24 })
    })

    it('perPage nad 100 se ořízne na 100', () => {
        assert.equal(parsePaging('1', '5000').perPageNum, 100)
    })

    it('perPage menší než 1 se zvedne na 1', () => {
        assert.equal(parsePaging('1', '-5').perPageNum, 1)
    })

    it('perPage=0 není "žádný limit", ale výchozích 100', () => {
        assert.equal(parsePaging('1', '0').perPageNum, 100)
    })

    it('stránka menší než 1 nebo nesmysl dá první stránku, nikdy záporný offset', () => {
        for (const page of ['0', '-3', 'abc', '', undefined]) {
            const { pageNum, offset } = parsePaging(page, '10')
            assert.equal(pageNum, 1, String(page))
            assert.equal(offset, 0, String(page))
        }
    })

    it('nesmyslný perPage spadne na výchozích 100', () => {
        assert.equal(parsePaging('1', 'abc').perPageNum, 100)
    })

    it('desetinné číslo se ořízne na celé', () => {
        assert.deepEqual(parsePaging('2.9', '10.7'), { pageNum: 2, perPageNum: 10, offset: 10 })
    })
})
