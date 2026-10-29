import { describe, it, expect } from 'vitest'
import { readTokenPayload, isSessionValid } from '../admin/session.js'

// Sestaví token se zadaným payloadem. Hlavička a podpis jsou smyšlené, frontend je nečte.
function tokenFor(payload) {
    const json = JSON.stringify(payload)
    const bytes = new TextEncoder().encode(json)
    const base64url = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return `eyJhbGciOiJIUzI1NiJ9.${base64url}.podpis`
}

describe('readTokenPayload', () => {
    it('přečte e-mail a exp', () => {
        expect(readTokenPayload(tokenFor({ id: 1, email: 'admin@plzenak.eu', exp: 100 })))
            .toEqual({ id: 1, email: 'admin@plzenak.eu', exp: 100 })
    })

    it('zvládne base64url znaky a diakritiku', () => {
        // „?>“ a „ů“ dají v base64 znaky + a /, které base64url nahrazuje - a _
        const payload = { email: 'šárka.růžičková@plzeň.cz', note: '???>>>' }
        expect(readTokenPayload(tokenFor(payload))).toEqual(payload)
    })

    it('nesmysl vrátí null', () => {
        expect(readTokenPayload(null)).toBeNull()
        expect(readTokenPayload('')).toBeNull()
        expect(readTokenPayload('bez-tecek')).toBeNull()
        expect(readTokenPayload('a.%%%.c')).toBeNull()
        expect(readTokenPayload(`a.${btoa('"jen text"')}.c`)).toBeNull()
    })
})

describe('isSessionValid', () => {
    it('platný do exp', () => {
        expect(isSessionValid({ exp: 200 }, 100)).toBe(true)
        expect(isSessionValid({ exp: 100 }, 100)).toBe(false)
        expect(isSessionValid({ exp: 50 }, 100)).toBe(false)
    })

    it('bez payloadu neplatný, bez exp platný', () => {
        expect(isSessionValid(null, 100)).toBe(false)
        expect(isSessionValid({ email: 'a@b.cz' }, 100)).toBe(true)
    })
})
