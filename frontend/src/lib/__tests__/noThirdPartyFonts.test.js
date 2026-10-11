import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

// Písma jsou self-hostovaná kvůli GDPR: kdyby se do HTML nebo CSS vrátil odkaz
// na Google Fonts, IP návštěvníka by zase odcházela třetí straně ještě před
// souhlasem — a nic by to nehlásilo, stránka by vypadala stejně.
const SRC = fileURLToPath(new URL('../..', import.meta.url))
const INDEX_HTML = fileURLToPath(new URL('../../../index.html', import.meta.url))
const FONT_HOSTS = /fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|fonts\.bunny\.net/

function stylesheets(dir) {
    return readdirSync(dir, { recursive: true })
        // Jen CSS: načítá se tam. Texty v JSX (Zásady ochrany údajů) o písmech jen píšou.
        .filter(f => /\.css$/.test(f))
        .map(f => join(dir, f))
}

describe('písma jsou jen z vlastní domény', () => {
    it('index.html nenačítá písma z cizí domény', () => {
        expect(readFileSync(INDEX_HTML, 'utf8')).not.toMatch(FONT_HOSTS)
    })

    it('žádné CSS neodkazuje na poskytovatele písem', () => {
        const offenders = stylesheets(SRC).filter(f => FONT_HOSTS.test(readFileSync(f, 'utf8')))
        expect(offenders).toEqual([])
    })

    it('@font-face míří jen na lokální soubory', () => {
        const css = readFileSync(join(SRC, 'assets/fonts/fonts.css'), 'utf8')
        const urls = [...css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map(m => m[1])
        expect(urls.length).toBeGreaterThan(0)
        for (const u of urls) expect(u.startsWith('./')).toBe(true)
    })
})
