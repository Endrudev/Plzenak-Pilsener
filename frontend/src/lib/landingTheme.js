import { useSyncExternalStore } from 'react'

// Tmavé / světlé téma homepage. Volba se pamatuje v localStorage. Dokud žádná
// není, platí SVĚTLÉ téma, bez ohledu na systémové nastavení (rozhodnuto
// 2026-10-04: světlá je výchozí, tmavá je volitelná). Mimo homepage se téma
// neprojeví: tokeny --lp-* platí jen pod html.theme-lp (viz index.css).
//
// Atribut data-lp-mode na <html> je jediný zdroj pravdy pro CSS. React jen čte
// stejnou hodnotu, ať se ikona přepínače a logo v liště shodují se stránkou.

export const THEME_KEY = 'plzenak-theme'
const EVENT = 'plzenak-theme-change'

function isMode(value) {
    return value === 'light' || value === 'dark'
}

// Uložená volba, jinak světlé. Systémové nastavení se záměrně nečte, aby byla
// první návštěva vždy stejná a nezávisela na tom, jaké má člověk zařízení.
export function resolveMode(stored) {
    return isMode(stored) ? stored : 'light'
}

function readStored() {
    try {
        return localStorage.getItem(THEME_KEY)
    } catch {
        return null
    }
}

// Stránky, které mají tmavé i světlé téma a v liště přepínač: homepage, Akce,
// detail akce (/events/:id) a stránky kategorií. Ostatní stránky jsou světlé a
// téma nemají.
const THEMED_PATHS = ['/', '/events', '/top-akce', '/hudba', '/zbytek-programu']

export function usesLandingTheme(pathname) {
    return THEMED_PATHS.includes(pathname) || pathname.startsWith('/events/')
}

export function currentMode() {
    const attr = typeof document !== 'undefined' ? document.documentElement.dataset.lpMode : null
    return isMode(attr) ? attr : resolveMode(readStored())
}

// Zapíše režim na <html>. Volá se při vstupu na homepage a při přepnutí.
export function applyMode(mode) {
    document.documentElement.dataset.lpMode = mode
    window.dispatchEvent(new Event(EVENT))
}

export function initMode() {
    applyMode(resolveMode(readStored()))
}

export function setMode(mode) {
    try {
        localStorage.setItem(THEME_KEY, mode)
    } catch {
        // soukromé okno: volba platí do zavření stránky
    }
    applyMode(mode)
}

function subscribe(callback) {
    window.addEventListener(EVENT, callback)
    return () => window.removeEventListener(EVENT, callback)
}

export function useLandingMode() {
    return useSyncExternalStore(subscribe, currentMode, () => 'light')
}
