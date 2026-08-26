// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { readConsent, writeConsent, CONSENT_VERSION } from './consent.js'

beforeEach(() => {
    localStorage.clear()
})

describe('readConsent', () => {
    it('vrátí null, když nikdo nic nerozhodl', () => {
        expect(readConsent()).toBeNull()
    })

    it('vrátí null, když dostane poškozený/neúplný json', () => {
        localStorage.setItem('plzenak-consent', 'tohle není json')
        expect(readConsent()).toBeNull()
    })

    it('vrátí null, když dostane špatnou verzi consentu', () => {
        localStorage.setItem('plzenak-consent', '{"v":99, "maps":true}')
        expect(readConsent()).toBeNull()
    })

    it('vrátí null, když nedostane boolean v "maps"', () => {
        localStorage.setItem('plzenak-consent', '{"v":1, "maps":"ano"}')
        expect(readConsent()).toBeNull()
    })

    it('vrátí objekt, když dostane validní vstup', () => {
        localStorage.setItem('plzenak-consent', '{"v":1, "maps":true}')
        expect(readConsent()).toEqual({ v:1, maps: true})
    })
})

describe('writeConsent', () => {
    it('vrátí objekt, když bude správně sestaven', () => {
        expect(writeConsent({maps: true})).toEqual({ v: CONSENT_VERSION, maps: true, ts: expect.any(String) })
    })

    it('vrátí objekt, když si write a read rozumí', () => {
        writeConsent({maps:true})
        expect(readConsent()).toEqual({ v:1, maps: true, ts: expect.any(String)})
    })
})


