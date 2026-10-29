import { describe, it, expect } from 'vitest'
import { filterAdminEvents, adminStats, fold } from '../admin/adminEvents.js'

const TODAY = new Date(2026, 9, 29) // čtvrtek 29. 10. 2026

const events = [
    { id: 1, name: 'Pilsner Fest', date: '3.10.2026', location: 'Pivovar', tags: ['Gastro'], imageUrl: 'x' },
    { id: 2, name: 'Jazz na náměstí', date: '30.10.2026', location: 'Náměstí Republiky', tags: ['Hudba', 'TOP akce'], imageUrl: null },
    { id: 3, name: 'Výstava skla', date: '29.10.2026', location: 'Západočeské muzeum', tags: ['Kultura'], imageUrl: 'y' },
    { id: 4, name: 'Adventní trhy', date: '28.11.2026', location: 'Plzeň centrum', tags: ['Kultura', 'Pro děti'], imageUrl: 'z' },
    { id: 5, name: 'Bez data', date: null, location: '', tags: [] },
]

const ids = list => list.map(event => event.id)

describe('fold', () => {
    it('srazí velikost písmen a diakritiku', () => {
        expect(fold('  Plzeň Náměstí ')).toBe('plzen namesti')
        expect(fold(null)).toBe('')
    })
})

describe('filterAdminEvents', () => {
    it('nadcházející od nejbližší, dnešek patří mezi ně, bez data na konci', () => {
        expect(ids(filterAdminEvents(events, { period: 'upcoming' }, TODAY))).toEqual([3, 2, 4, 5])
    })

    it('proběhlé od nejnovější', () => {
        expect(ids(filterAdminEvents(events, { period: 'past' }, TODAY))).toEqual([1])
    })

    it('vše od nejnovějšího data', () => {
        expect(ids(filterAdminEvents(events, { period: 'all' }, TODAY))).toEqual([4, 2, 3, 1, 5])
    })

    it('hledá v názvu i místě bez diakritiky', () => {
        expect(ids(filterAdminEvents(events, { q: 'namesti', period: 'all' }, TODAY))).toEqual([2])
        expect(ids(filterAdminEvents(events, { q: 'PLZEN', period: 'all' }, TODAY))).toEqual([4])
        expect(ids(filterAdminEvents(events, { q: 'muzeum' }, TODAY))).toEqual([3])
    })

    it('filtruje podle kategorie včetně vedlejší', () => {
        expect(ids(filterAdminEvents(events, { category: 'Pro děti', period: 'all' }, TODAY))).toEqual([4])
        expect(ids(filterAdminEvents(events, { category: 'Kultura' }, TODAY))).toEqual([3, 4])
    })

    it('nemění vstupní pole', () => {
        const copy = [...events]
        filterAdminEvents(events, { period: 'all' }, TODAY)
        expect(events).toEqual(copy)
    })
})

describe('adminStats', () => {
    it('počítá jen nadcházející akce', () => {
        expect(adminStats(events, TODAY)).toEqual({ upcoming: 3, week: 2, top: 1, noImage: 1 })
    })

    it('prázdný seznam', () => {
        expect(adminStats([], TODAY)).toEqual({ upcoming: 0, week: 0, top: 0, noImage: 0 })
    })
})
