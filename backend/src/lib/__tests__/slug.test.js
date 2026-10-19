const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { slugify, MAX_LENGTH } = require('../slug')

describe('slugify', () => {
    it('odstraní diakritiku a převede na malá písmena', () => {
        assert.equal(slugify('Prohlídka Nového divadla'), 'prohlidka-noveho-divadla')
        assert.equal(slugify('ŽLUŤOUČKÝ KŮŇ ÚPĚL ĎÁBELSKÉ ÓDY'), 'zlutoucky-kun-upel-dabelske-ody')
    })

    it('závorky, plus, pomlčky a další znaky slije do jedné pomlčky', () => {
        assert.equal(slugify('Dead Bob (CA) + Už jsme doma (CZ)'), 'dead-bob-ca-uz-jsme-doma-cz')
        assert.equal(slugify('Koncert – DEPO2015 / 20:00!'), 'koncert-depo2015-20-00')
    })

    it('na krajích nenechá pomlčku', () => {
        assert.equal(slugify('  „Majáles“  '), 'majales')
        assert.equal(slugify('...TOP...'), 'top')
    })

    it('dlouhý název zkrátí na celém slově a nepřekročí limit', () => {
        const name = 'Velmi dlouhý název akce, který se do adresy celý nevejde a musí se zkrátit'
        const slug = slugify(name)
        assert.ok(slug.length <= MAX_LENGTH, slug)
        assert.ok(!slug.endsWith('-'))
        assert.ok(`${slugify(name.replace(/,/g, ''))}-`.startsWith(`${slug}-`), 'zkrácení je na hranici slova')
    })

    it('jedno dlouhé slovo bez mezer ořízne natvrdo', () => {
        assert.equal(slugify('a'.repeat(80)).length, MAX_LENGTH)
    })

    it('název bez písmen a číslic dá prázdný slug', () => {
        assert.equal(slugify('!!! ---'), '')
        assert.equal(slugify(''), '')
    })

    it('hodnota, která není text, dá prázdný slug', () => {
        for (const value of [null, undefined, 42, {}]) assert.equal(slugify(value), '')
    })
})
