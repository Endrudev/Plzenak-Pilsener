import { describe, it, expect } from 'vitest'
import { eventBadge } from './eventBadge.js'

// Pevný „dnešek", ať testy nezávisí na tom, kdy běží. Odpoledne schválně —
// ověřuje se tím, že o výsledku nerozhoduje denní doba.
const TODAY = new Date(2026, 7, 29, 15, 30) // 29. 8. 2026

describe('eventBadge', () => {
    it('označí dnešní akci', () => {
        expect(eventBadge('29.8.2026', TODAY)).toEqual({ text: 'Dnes', type: 'today' })
    })

    it('označí zítřejší akci', () => {
        expect(eventBadge('30.8.2026', TODAY)).toEqual({ text: 'Zítra', type: 'later' })
    })

    it('nedává plaketu akci za dva a víc dní', () => {
        expect(eventBadge('31.8.2026', TODAY)).toBeNull()
        expect(eventBadge('15.12.2026', TODAY)).toBeNull()
    })

    it('nedává plaketu proběhlé akci', () => {
        expect(eventBadge('28.8.2026', TODAY)).toBeNull()
    })

    it('nerozhoduje podle denní doby, ale podle dne', () => {
        const rano = new Date(2026, 7, 29, 6, 0)
        const vecer = new Date(2026, 7, 29, 23, 59)
        expect(eventBadge('29.8.2026', rano)?.type).toBe('today')
        expect(eventBadge('29.8.2026', vecer)?.type).toBe('today')
    })

    it('zvládne přechod přes hranici měsíce', () => {
        const posledniSrpna = new Date(2026, 7, 31, 12, 0)
        expect(eventBadge('1.9.2026', posledniSrpna)).toEqual({ text: 'Zítra', type: 'later' })
    })

    it('přijme i dvouciferný zápis dne a měsíce', () => {
        expect(eventBadge('29.08.2026', TODAY)?.text).toBe('Dnes')
    })

    it('vrátí null pro chybějící nebo nesmyslné datum', () => {
        expect(eventBadge(null, TODAY)).toBeNull()
        expect(eventBadge('', TODAY)).toBeNull()
        expect(eventBadge('někdy v létě', TODAY)).toBeNull()
        expect(eventBadge('2026-08-29', TODAY)).toBeNull()
    })

    it('odmítne neexistující datum místo tichého přetečení', () => {
        // new Date(2026, 1, 30) sám o sobě vyrobí 2. března — to nesmí projít
        expect(eventBadge('30.2.2026', TODAY)).toBeNull()
    })
})
