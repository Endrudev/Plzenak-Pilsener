import { describe, it, expect } from 'vitest'
import { daysFromToday, inRange, upcoming, dayParts } from '../events/dateRanges.js'

// Pevný „dnešek": středa 7. 10. 2026, odpoledne (denní doba nesmí rozhodovat).
const TODAY = new Date(2026, 9, 7, 15, 30)

describe('daysFromToday', () => {
    it('spočítá dnešek, zítřek a včerejšek', () => {
        expect(daysFromToday('7.10.2026', TODAY)).toBe(0)
        expect(daysFromToday('8.10.2026', TODAY)).toBe(1)
        expect(daysFromToday('6.10.2026', TODAY)).toBe(-1)
    })

    it('vrátí null pro nečitelné datum', () => {
        expect(daysFromToday('brzy', TODAY)).toBeNull()
        expect(daysFromToday('31.2.2026', TODAY)).toBeNull()
    })
})

describe('inRange', () => {
    it('dnes bere jen dnešní akci', () => {
        expect(inRange('7.10.2026', 'dnes', TODAY)).toBe(true)
        expect(inRange('8.10.2026', 'dnes', TODAY)).toBe(false)
    })

    it('zítra bere jen zítřejší akci, ne dnešní ani pozítří', () => {
        expect(inRange('8.10.2026', 'zitra', TODAY)).toBe(true)
        expect(inRange('7.10.2026', 'zitra', TODAY)).toBe(false)
        expect(inRange('9.10.2026', 'zitra', TODAY)).toBe(false)
    })

    it('zítra a víkend se mohou překrývat (v pátek je zítra sobota)', () => {
        const friday = new Date(2026, 9, 9, 18, 0)
        expect(inRange('10.10.2026', 'zitra', friday)).toBe(true)
        expect(inRange('10.10.2026', 'vikend', friday)).toBe(true)
    })

    it('víkend bere sobotu a neděli v nejbližších sedmi dnech', () => {
        expect(inRange('10.10.2026', 'vikend', TODAY)).toBe(true)  // sobota
        expect(inRange('11.10.2026', 'vikend', TODAY)).toBe(true)  // neděle
        expect(inRange('9.10.2026', 'vikend', TODAY)).toBe(false)  // pátek
        expect(inRange('17.10.2026', 'vikend', TODAY)).toBe(false) // až za týden
    })

    it('neznámé období nevybere nic', () => {
        expect(inRange('7.10.2026', 'rok', TODAY)).toBe(false)
    })
})

describe('upcoming', () => {
    it('vyhodí proběhlé a nečitelné akce, pořadí nechá', () => {
        const events = [
            { id: 1, date: '5.10.2026' },
            { id: 2, date: '9.10.2026' },
            { id: 3, date: 'nikdy' },
            { id: 4, date: '7.10.2026' },
        ]
        expect(upcoming(events, TODAY).map(e => e.id)).toEqual([2, 4])
    })
})

describe('dayParts', () => {
    it('rozloží datum na den, měsíc a den v týdnu', () => {
        expect(dayParts('10.10.2026')).toEqual({ day: '10', month: 'říj', weekday: 'so' })
        expect(dayParts('1.12.2026')).toEqual({ day: '1', month: 'pro', weekday: 'út' })
    })

    it('vrátí null pro nečitelné datum', () => {
        expect(dayParts('?')).toBeNull()
    })
})
