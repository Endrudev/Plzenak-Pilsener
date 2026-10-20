import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { OPT_OUT_KEY, isMeasurementDisabled, setMeasurementDisabled } from '../analytics.js'

const INDEX_HTML = fileURLToPath(new URL('../../../index.html', import.meta.url))

function memoryStorage() {
    const data = new Map()
    return {
        getItem: k => (data.has(k) ? data.get(k) : null),
        setItem: (k, v) => data.set(k, String(v)),
        removeItem: k => data.delete(k),
    }
}

const broken = {
    getItem() { throw new Error('blokováno') },
    setItem() { throw new Error('blokováno') },
    removeItem() { throw new Error('blokováno') },
}

describe('vypnutí měření', () => {
    it('výchozí stav je zapnuté měření', () => {
        expect(isMeasurementDisabled(memoryStorage())).toBe(false)
    })

    it('vypnutí zapíše klíč, který čte skript Umami, zapnutí ho smaže', () => {
        const s = memoryStorage()
        expect(setMeasurementDisabled(true, s)).toBe(true)
        expect(s.getItem('umami.disabled')).not.toBeNull()
        expect(isMeasurementDisabled(s)).toBe(true)

        setMeasurementDisabled(false, s)
        expect(s.getItem(OPT_OUT_KEY)).toBeNull()
        expect(isMeasurementDisabled(s)).toBe(false)
    })

    it('zablokované úložiště stránku neshodí', () => {
        expect(isMeasurementDisabled(broken)).toBe(false)
        expect(setMeasurementDisabled(true, broken)).toBe(false)
        expect(setMeasurementDisabled(true, null)).toBe(false)
    })
})

// Skript je v index.html, kam se z JS nedá importovat. Test hlídá, že v něm
// zůstanou nastavení, na kterých stojí text Zásad (Do Not Track, jen naše
// doména, bez administrace) a že klíč pro vypnutí sedí s lib/analytics.js.
describe('měřicí skript v index.html', () => {
    const html = readFileSync(INDEX_HTML, 'utf8')
    const tag = html.match(/<script[^>]*stats\.plzenak\.eu\/script\.js[^>]*>/)?.[0] ?? ''

    it('je jen z vlastní subdomény a s odkladem', () => {
        expect(tag).toMatch(/src="https:\/\/stats\.plzenak\.eu\/script\.js"/)
        expect(tag).toMatch(/\bdefer\b/)
    })

    it('respektuje Do Not Track a měří jen plzenak.eu', () => {
        expect(tag).toMatch(/data-do-not-track="true"/)
        expect(tag).toMatch(/data-domains="plzenak\.eu"/)
        expect(tag).toMatch(/data-exclude-search="true"/)
    })

    it('vynechává administraci', () => {
        const fn = tag.match(/data-before-send="([^"]+)"/)?.[1]
        expect(fn).toBeTruthy()
        expect(html).toContain(`window.${fn} = function`)
        expect(html).toMatch(/indexOf\('\/admin'\) === 0\) return null/)
    })
})
