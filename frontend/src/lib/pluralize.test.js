import { describe, it, expect } from 'vitest'
import { eventCountLabel } from './pluralize.js'

describe('eventCountLabel', () => {
    it('nula', () => {
        expect(eventCountLabel(0)).toBe('0 akcí')
    })

    it('jedna', () => {
        expect(eventCountLabel(1)).toBe('1 akce')
    })

    it('dvě až čtyři', () => {
        expect(eventCountLabel(2)).toBe('2 akce')
        expect(eventCountLabel(3)).toBe('3 akce')
        expect(eventCountLabel(4)).toBe('4 akce')
    })

    it('pět a víc', () => {
        expect(eventCountLabel(5)).toBe('5 akcí')
        expect(eventCountLabel(12)).toBe('12 akcí')
        expect(eventCountLabel(128)).toBe('128 akcí')
    })
})
