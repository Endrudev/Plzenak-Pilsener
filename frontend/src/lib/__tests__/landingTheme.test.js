import { describe, it, expect } from 'vitest'
import { resolveMode, usesLandingTheme } from '../landingTheme.js'

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

describe('usesLandingTheme', () => {
    it('homepage, Akce a detail akce mají téma', () => {
        expect(usesLandingTheme('/')).toBe(true)
        expect(usesLandingTheme('/events')).toBe(true)
        expect(usesLandingTheme('/events/42')).toBe(true)
    })

    it('stránky kategorií mají téma', () => {
        expect(usesLandingTheme('/top-akce')).toBe(true)
        expect(usesLandingTheme('/hudba')).toBe(true)
        expect(usesLandingTheme('/zbytek-programu')).toBe(true)
    })

    it('ostatní stránky téma nemají', () => {
        expect(usesLandingTheme('/podminky-uziti')).toBe(false)
        expect(usesLandingTheme('/admin/dashboard')).toBe(false)
        expect(usesLandingTheme('/eventsx')).toBe(false)
    })
})
