const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { loginLimitMax, DEFAULT_LOGIN_LIMIT } = require('../loginLimit')

describe('loginLimitMax', () => {
    it('bez proměnné platí výchozích 5 (produkce)', () => {
        assert.equal(DEFAULT_LOGIN_LIMIT, 5)
        assert.equal(loginLimitMax(undefined), 5)
        assert.equal(loginLimitMax(''), 5)
    })

    it('kladné celé číslo se použije, i s mezerami okolo', () => {
        assert.equal(loginLimitMax('100'), 100)
        assert.equal(loginLimitMax(' 20 '), 20)
    })

    it('překlep limiter nevypne: nula, záporné, desetinné a text dají výchozí hodnotu', () => {
        for (const value of ['0', '-3', '2.5', 'abc', '10x', 'Infinity']) {
            assert.equal(loginLimitMax(value), 5, value)
        }
    })
})
