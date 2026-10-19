import { describe, it, expect } from 'vitest'
import { MONTHS, DAYS, toCzech, isSameDay, buildCalendarDays } from '../date.js'

describe('toCzech', () => {
    it('zapíše datum bez nul vpředu', () => {
        expect(toCzech(new Date(2026, 2, 5))).toBe('5.3.2026')
    })

    it('zapíše dvouciferný den i měsíc', () => {
        expect(toCzech(new Date(2026, 11, 31))).toBe('31.12.2026')
    })

    it('měsíc počítá od jedné, ne od nuly', () => {
        expect(toCzech(new Date(2026, 0, 1))).toBe('1.1.2026')
    })

    it('vrátí prázdný řetězec, když datum chybí', () => {
        expect(toCzech(null)).toBe('')
        expect(toCzech(undefined)).toBe('')
    })
})

describe('isSameDay', () => {
    it('pozná stejný den bez ohledu na čas', () => {
        expect(isSameDay(new Date(2026, 7, 29, 0, 0), new Date(2026, 7, 29, 23, 59))).toBe(true)
    })

    it('rozliší sousední dny', () => {
        expect(isSameDay(new Date(2026, 7, 29), new Date(2026, 7, 30))).toBe(false)
    })

    it('rozliší stejný den a měsíc v jiném roce', () => {
        expect(isSameDay(new Date(2025, 7, 29), new Date(2026, 7, 29))).toBe(false)
    })

    it('rozliší stejný den v jiném měsíci', () => {
        expect(isSameDay(new Date(2026, 6, 29), new Date(2026, 7, 29))).toBe(false)
    })

    it('vrátí vždy hodnotu, ne undefined, když jsou obě data platná', () => {
        // Hlídá past s `return` na samostatném řádku, kdy funkce tiše vrací undefined.
        expect(isSameDay(new Date(2026, 7, 29), new Date(2026, 7, 29))).toBe(true)
        expect(isSameDay(new Date(2026, 7, 29), new Date(2026, 7, 28))).toBe(false)
    })

    it('chybějící datum není shoda', () => {
        expect(isSameDay(null, new Date(2026, 7, 29))).toBeFalsy()
        expect(isSameDay(new Date(2026, 7, 29), undefined)).toBeFalsy()
        expect(isSameDay(null, null)).toBeFalsy()
    })
})

describe('buildCalendarDays', () => {
    it('začne prázdnými poli podle dne v týdnu prvního dne měsíce', () => {
        // 1. 9. 2026 je úterý → jedno prázdné pole před ním (pondělí)
        const cells = buildCalendarDays(2026, 8)
        expect(cells[0]).toBeNull()
        expect(isSameDay(cells[1], new Date(2026, 8, 1))).toBe(true)
    })

    it('měsíc začínající pondělím nemá žádná prázdná pole', () => {
        // 1. 6. 2026 je pondělí
        const cells = buildCalendarDays(2026, 5)
        expect(cells[0]).toEqual(new Date(2026, 5, 1))
    })

    it('měsíc začínající nedělí má šest prázdných polí', () => {
        // 1. 11. 2026 je neděle
        const cells = buildCalendarDays(2026, 10)
        expect(cells.slice(0, 6).every(c => c === null)).toBe(true)
        expect(isSameDay(cells[6], new Date(2026, 10, 1))).toBe(true)
    })

    it('obsahuje právě tolik dnů, kolik má měsíc', () => {
        const days = buildCalendarDays(2026, 8).filter(Boolean)
        expect(days).toHaveLength(30)
        expect(days[0].getDate()).toBe(1)
        expect(days[29].getDate()).toBe(30)
    })

    it('počítá s přestupným únorem', () => {
        expect(buildCalendarDays(2028, 1).filter(Boolean)).toHaveLength(29)
        expect(buildCalendarDays(2026, 1).filter(Boolean)).toHaveLength(28)
    })

    it('prosinec nepřeteče do dalšího roku', () => {
        const days = buildCalendarDays(2026, 11).filter(Boolean)
        expect(days).toHaveLength(31)
        expect(days.every(d => d.getFullYear() === 2026 && d.getMonth() === 11)).toBe(true)
    })

    it('dny jdou za sebou bez mezer', () => {
        const days = buildCalendarDays(2026, 7).filter(Boolean)
        days.forEach((d, i) => expect(d.getDate()).toBe(i + 1))
    })
})

describe('názvy měsíců a dnů', () => {
    it('má dvanáct měsíců a sedm dní, týden začíná pondělím', () => {
        expect(MONTHS).toHaveLength(12)
        expect(DAYS).toHaveLength(7)
        expect(DAYS[0]).toBe('Po')
    })
})
