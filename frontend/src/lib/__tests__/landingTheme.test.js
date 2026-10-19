import { describe, it, expect } from 'vitest'
import { isNotFoundPath, resolveMode, usesLandingTheme } from '../landingTheme.js'

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
        expect(usesLandingTheme('/akce')).toBe(true)
        expect(usesLandingTheme('/akce/42-knoflikova-valka')).toBe(true)
    })

    it('stránky kategorií mají téma', () => {
        expect(usesLandingTheme('/top-akce')).toBe(true)
        expect(usesLandingTheme('/hudba')).toBe(true)
        expect(usesLandingTheme('/zbytek-programu')).toBe(true)
    })

    it('ostatní stránky téma nemají', () => {
        expect(usesLandingTheme('/podminky-uziti')).toBe(false)
        expect(usesLandingTheme('/admin/dashboard')).toBe(false)
        expect(usesLandingTheme('/akcex')).toBe(false)
    })
})

describe('isNotFoundPath', () => {
    it('neexistující adresa je 404 a dostane téma', () => {
        expect(isNotFoundPath('/neexistuje')).toBe(true)
        expect(isNotFoundPath('/akcex')).toBe(true)
        expect(isNotFoundPath('/mapa')).toBe(true)
    })

    it('stránky s tématem a bez něj 404 nejsou', () => {
        expect(isNotFoundPath('/')).toBe(false)
        expect(isNotFoundPath('/akce')).toBe(false)
        expect(isNotFoundPath('/akce/42-knoflikova-valka')).toBe(false)
        expect(isNotFoundPath('/top-akce')).toBe(false)
        expect(isNotFoundPath('/podminky-uziti')).toBe(false)
        expect(isNotFoundPath('/zasady-ochrany-osobnich-udaju')).toBe(false)
    })

    it('administrace 404 není, lišta v ní není', () => {
        expect(isNotFoundPath('/admin')).toBe(false)
        expect(isNotFoundPath('/admin/candidates')).toBe(false)
        expect(isNotFoundPath('/admin/neco-jineho')).toBe(false)
    })
})
