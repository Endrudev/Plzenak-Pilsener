import { describe, it, expect } from 'vitest'
import { validateEventForm, validateImageFile, MAX_IMAGE_BYTES } from '../admin/eventForm.js'

const valid = {
    title: 'Jazz na náměstí',
    date: new Date(2026, 10, 1),
    category: 'Hudba',
    description: 'Koncert pod širým nebem.',
    locationName: 'Náměstí Republiky',
    hasImage: true,
    url: '',
}

describe('validateEventForm', () => {
    it('vyplněný formulář projde', () => {
        expect(validateEventForm(valid)).toEqual({})
    })

    it('prázdná pole a mezery hlásí v pořadí formuláře', () => {
        const errors = validateEventForm({ title: '  ', date: null, category: '', description: '', locationName: '', hasImage: false })
        expect(Object.keys(errors)).toEqual(['title', 'date', 'category', 'description', 'locationName', 'image'])
    })

    it('odkaz je nepovinný, ale musí být adresa', () => {
        expect(validateEventForm({ ...valid, url: 'https://plzen.eu/akce' })).toEqual({})
        expect(validateEventForm({ ...valid, url: 'plzen.eu' })).toHaveProperty('url')
        expect(validateEventForm({ ...valid, url: 'https://' })).toHaveProperty('url')
    })
})

describe('validateImageFile', () => {
    it('povolí JPEG, PNG a WebP do 5 MB', () => {
        expect(validateImageFile({ type: 'image/webp', size: 1000 })).toBeNull()
        expect(validateImageFile({ type: 'image/jpeg', size: MAX_IMAGE_BYTES })).toBeNull()
    })

    it('odmítne jiný formát a větší soubor', () => {
        expect(validateImageFile({ type: 'image/gif', size: 1000 })).toMatch(/formáty/)
        expect(validateImageFile({ type: 'image/png', size: MAX_IMAGE_BYTES + 1 })).toMatch(/5 MB/)
    })

    it('bez souboru nic nehlásí', () => {
        expect(validateImageFile(null)).toBeNull()
    })
})
