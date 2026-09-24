import { describe, it, expect } from 'vitest'
import { buildIcsFile } from './buildIcsFile.js'

const BASE_EVENT = {
    id: 42,
    name: 'Jazz na Papírně',
    date: '21.09.2026',
    location: 'Papírna, Plzeň',
    description: ['První odstavec.', 'Druhý odstavec.'],
    url: 'https://vstupenky.cz/jazz-na-papirne',
}

describe('buildIcsFile', () => {
    it('vygeneruje celodenní VEVENT s DTEND o den posunutým (exkluzivní konec)', () => {
        const result = buildIcsFile(BASE_EVENT)
        expect(result).not.toBeNull()
        expect(result.content).toContain('DTSTART;VALUE=DATE:20260921')
        expect(result.content).toContain('DTEND;VALUE=DATE:20260922')
        expect(result.content).toContain('BEGIN:VCALENDAR')
        expect(result.content).toContain('BEGIN:VEVENT')
        expect(result.content).toContain('END:VEVENT')
        expect(result.content).toContain('END:VCALENDAR')
    })

    it('zvládne přechod přes hranici roku', () => {
        const result = buildIcsFile({ ...BASE_EVENT, date: '31.12.2026' })
        expect(result.content).toContain('DTSTART;VALUE=DATE:20261231')
        expect(result.content).toContain('DTEND;VALUE=DATE:20270101')
    })

    it('obsahuje UID vázaný na id akce, název, místo, popis i odkaz', () => {
        const result = buildIcsFile(BASE_EVENT)
        expect(result.content).toContain('UID:event-42@plzenak.cz')
        expect(result.content).toContain('SUMMARY:Jazz na Papírně')
        expect(result.content).toContain('LOCATION:Papírna\\, Plzeň')
        expect(result.content).toContain('URL:https://vstupenky.cz/jazz-na-papirne')
        expect(result.content).toContain('První odstavec.')
    })

    it('escapuje čárky/středníky v textových polích podle RFC 5545', () => {
        const result = buildIcsFile({ ...BASE_EVENT, location: 'Sál A; křídlo B, 2. patro' })
        expect(result.content).toContain('LOCATION:Sál A\\; křídlo B\\, 2. patro')
    })

    it('spojuje odstavce popisu a escapuje konce řádků jako \\n', () => {
        const result = buildIcsFile(BASE_EVENT)
        expect(result.content).toMatch(/DESCRIPTION:První odstavec\.\\n\\nDruhý odstavec\./)
    })

    it('vynechá volitelná pole (místo/popis/odkaz), když v datech chybí', () => {
        const result = buildIcsFile({ id: 1, name: 'Bez detailů', date: '01.01.2027' })
        expect(result.content).not.toContain('LOCATION:')
        expect(result.content).not.toContain('DESCRIPTION:')
        expect(result.content).not.toContain('URL:')
    })

    it('vytvoří bezpečný název souboru bez diakritiky a mezer', () => {
        const result = buildIcsFile(BASE_EVENT)
        expect(result.filename).toBe('jazz-na-papirne.ics')
    })

    it('použije fallback název souboru, když z názvu akce nezbyde nic použitelného', () => {
        const result = buildIcsFile({ ...BASE_EVENT, name: '🎉🎉🎉' })
        expect(result.filename).toBe('akce.ics')
    })

    it('vrátí null pro chybějící nebo nerozparsovatelné datum', () => {
        expect(buildIcsFile({ ...BASE_EVENT, date: null })).toBeNull()
        expect(buildIcsFile({ ...BASE_EVENT, date: '' })).toBeNull()
        expect(buildIcsFile({ ...BASE_EVENT, date: '2026-09-21' })).toBeNull()
    })

    it('řádky nepřesahují 75 znaků (folding dlouhého popisu)', () => {
        const dlouhy = 'x'.repeat(200)
        const result = buildIcsFile({ ...BASE_EVENT, description: [dlouhy] })
        const lines = result.content.split('\r\n')
        for (const line of lines) {
            expect(line.length).toBeLessThanOrEqual(75)
        }
    })
})
