import { describe, it, expect } from 'vitest'
import { shouldScrollToTop } from '../shouldScrollToTop.js'

describe('shouldScrollToTop', () => {
    it('nahoru při otevření nové stránky (PUSH)', () => {
        expect(shouldScrollToTop({ navigationType: 'PUSH', hash: '' })).toBe(true)
    })

    it('nahoru i při nahrazení adresy (REPLACE)', () => {
        expect(shouldScrollToTop({ navigationType: 'REPLACE', hash: '' })).toBe(true)
    })

    it('při kroku zpět a vpřed (POP) ne, pozici si pamatuje prohlížeč', () => {
        expect(shouldScrollToTop({ navigationType: 'POP', hash: '' })).toBe(false)
    })

    it('s kotvou v adrese ne, kotva má vlastní cíl', () => {
        expect(shouldScrollToTop({ navigationType: 'PUSH', hash: '#sekce' })).toBe(false)
    })
})
