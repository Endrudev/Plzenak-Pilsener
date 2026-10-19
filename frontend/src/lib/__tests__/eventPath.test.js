import { describe, it, expect } from 'vitest'
import { eventPath, parseEventId } from '../events/eventPath.js'

describe('eventPath', () => {
    it('složí adresu z id a slugu', () => {
        expect(eventPath({ id: 42, slug: 'knoflikova-valka' })).toBe('/akce/42-knoflikova-valka')
    })

    it('bez slugu vrátí adresu jen s id', () => {
        expect(eventPath({ id: 42, slug: '' })).toBe('/akce/42')
        expect(eventPath({ id: 42 })).toBe('/akce/42')
    })
})

describe('parseEventId', () => {
    it('vezme id ze začátku parametru se slugem', () => {
        expect(parseEventId('42-knoflikova-valka')).toBe('42')
    })

    it('přijme samotné id i id se zastaralým slugem', () => {
        expect(parseEventId('42')).toBe('42')
        expect(parseEventId('42-uplne-jiny-nazev')).toBe('42')
    })

    it('id je i adresa vrácená z eventPath', () => {
        expect(parseEventId(eventPath({ id: 7, slug: 'a-b' }).split('/').pop())).toBe('7')
    })

    it('odmítne parametr, který nezačíná číslem', () => {
        for (const param of ['abc', 'knoflikova-42', '-42', '4a2', '', undefined, null]) {
            expect(parseEventId(param), String(param)).toBeNull()
        }
    })
})
