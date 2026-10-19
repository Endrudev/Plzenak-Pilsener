import { describe, it, expect } from 'vitest'
import { eventShareData } from '../events/shareEvent.js'

describe('eventShareData', () => {
    it('spojí název a místo do textu, přiloží url', () => {
        const data = eventShareData({ name: 'Jazz na Papírně', location: 'Papírna, Plzeň' }, 'https://plzenak.eu/akce/1')
        expect(data).toEqual({
            title: 'Jazz na Papírně',
            text: 'Jazz na Papírně — Papírna, Plzeň',
            url: 'https://plzenak.eu/akce/1',
        })
    })

    it('vynechá místo v textu, když chybí', () => {
        const data = eventShareData({ name: 'Akce bez místa' }, 'https://plzenak.eu/akce/2')
        expect(data.text).toBe('Akce bez místa')
    })
})
