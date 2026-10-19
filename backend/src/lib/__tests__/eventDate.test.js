const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { toIsoDate } = require('../eventDate')

describe('toIsoDate', () => {
    it('převede zápis s nulami (importér) na ISO', () => {
        assert.equal(toIsoDate('05.03.2026'), '2026-03-05')
    })

    it('převede zápis bez nul (admin formulář) na ISO s nulami', () => {
        assert.equal(toIsoDate('5.3.2026'), '2026-03-05')
    })

    it('ořízne mezery kolem', () => {
        assert.equal(toIsoDate(' 24.10.2026 '), '2026-10-24')
    })

    it('přijme přestupný den jen v přestupném roce', () => {
        assert.equal(toIsoDate('29.2.2028'), '2028-02-29')
        assert.equal(toIsoDate('29.2.2026'), null)
    })

    it('odmítne neexistující den, místo aby ho přelil do dalšího měsíce', () => {
        for (const value of ['31.2.2026', '32.1.2026', '0.1.2026', '1.13.2026', '1.0.2026']) {
            assert.equal(toIsoDate(value), null, value)
        }
    })

    it('odmítne jiný tvar zápisu', () => {
        for (const value of ['2026-03-05', '5.3.26', '5. 3. 2026', '5/3/2026', '5.3.', '', 'zítra']) {
            assert.equal(toIsoDate(value), null, value)
        }
    })

    it('odmítne hodnotu, která není text', () => {
        for (const value of [null, undefined, 20260305, {}, []]) {
            assert.equal(toIsoDate(value), null, String(value))
        }
    })
})
