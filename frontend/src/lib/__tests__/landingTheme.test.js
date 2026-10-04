import { describe, it, expect } from 'vitest'
import { resolveMode } from '../landingTheme.js'

describe('resolveMode', () => {
    it('uložená volba platí', () => {
        expect(resolveMode('light')).toBe('light')
        expect(resolveMode('dark')).toBe('dark')
    })

    it('bez uložené volby je výchozí světlé', () => {
        expect(resolveMode(null)).toBe('light')
        expect(resolveMode(undefined)).toBe('light')
    })

    it('neplatná uložená hodnota se ignoruje a vyjde světlé', () => {
        expect(resolveMode('modra')).toBe('light')
        expect(resolveMode('')).toBe('light')
    })

    it('systémové nastavení se nečte: druhý argument nic nemění', () => {
        expect(resolveMode(null, true)).toBe('light')
        expect(resolveMode(null, false)).toBe('light')
    })
})
