const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { toIsoDate, toCzechDate, toTime, optionalTime, fromDbTime, pragueDateTime } = require('../eventDate')

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

describe('toCzechDate', () => {
    it('převede ISO datum na DD.MM.RRRR s nulami', () => {
        assert.equal(toCzechDate('2026-03-05'), '05.03.2026')
        assert.equal(toCzechDate('2026-10-24'), '24.10.2026')
    })

    it('je opakem toIsoDate', () => {
        for (const iso of ['2026-01-01', '2028-02-29', '2026-12-31']) {
            assert.equal(toIsoDate(toCzechDate(iso)), iso)
        }
    })

    it('na cokoli jiného než ISO text vrátí null', () => {
        for (const value of [null, undefined, '', '5.3.2026', '2026-3-5', new Date()]) {
            assert.equal(toCzechDate(value), null, String(value))
        }
    })
})

describe('toTime', () => {
    it('doplní nulu u jednociferné hodiny', () => {
        assert.equal(toTime('9:30'), '09:30')
        assert.equal(toTime('19:00'), '19:00')
        assert.equal(toTime(' 00:00 '), '00:00')
    })

    it('odmítne neexistující čas a jiný zápis', () => {
        for (const value of ['24:00', '19:60', '19', '19.00', '7:5', '', null, undefined, 1900]) {
            assert.equal(toTime(value), null, String(value))
        }
    })
})

describe('fromDbTime', () => {
    it('z textu pg vezme hodiny a minuty', () => {
        assert.equal(fromDbTime('19:00:00'), '19:00')
        assert.equal(fromDbTime('07:05:00'), '07:05')
    })

    it('bez času vrátí null', () => {
        assert.equal(fromDbTime(null), null)
        assert.equal(fromDbTime(undefined), null)
    })
})

describe('pragueDateTime', () => {
    it('v zimě připojí +01:00, v létě +02:00', () => {
        assert.equal(pragueDateTime('2026-11-05', '19:00'), '2026-11-05T19:00:00+01:00')
        assert.equal(pragueDateTime('2026-07-01', '19:00'), '2026-07-01T19:00:00+02:00')
    })

    it('posun podle místního času i v den změny času', () => {
        // 29. 3. 2026 se ve 2:00 posouvá na 3:00
        assert.equal(pragueDateTime('2026-03-29', '01:00'), '2026-03-29T01:00:00+01:00')
        assert.equal(pragueDateTime('2026-03-29', '20:00'), '2026-03-29T20:00:00+02:00')
        // 25. 10. 2026 se ve 3:00 vrací na 2:00
        assert.equal(pragueDateTime('2026-10-25', '00:30'), '2026-10-25T00:30:00+02:00')
        assert.equal(pragueDateTime('2026-10-25', '19:00'), '2026-10-25T19:00:00+01:00')
    })

    it('bez času vrátí jen datum', () => {
        assert.equal(pragueDateTime('2026-11-05', null), '2026-11-05')
    })
})

describe('optionalTime', () => {
    it('chybějící nebo prázdný čas je akce bez času', () => {
        for (const value of [undefined, null, '']) {
            assert.deepEqual(optionalTime(value), { value: null }, String(value))
        }
    })

    it('platný čas vrátí v jednotném tvaru', () => {
        assert.deepEqual(optionalTime('9:00'), { value: '09:00' })
    })

    it('vyplněný neplatný čas je chyba, ne tiché zahození', () => {
        assert.ok(optionalTime('25:00').error)
        assert.ok(optionalTime('večer').error)
    })
})
