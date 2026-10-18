import { describe, it, expect } from 'vitest'
import { splitTags, joinTags, TOP_TAG } from '../events/eventTags.js'

describe('splitTags', () => {
    it('jedna kategorie', () => {
        expect(splitTags(['Hudba'])).toEqual({ category: 'Hudba', extra: [], top: false })
    })

    it('víc kategorií: první je hlavní, ostatní vedlejší', () => {
        expect(splitTags(['Kultura', 'Hudba'])).toEqual({ category: 'Kultura', extra: ['Hudba'], top: false })
    })

    it('TOP akce vedle kategorie nezabere místo kategorie', () => {
        expect(splitTags(['Hudba', TOP_TAG])).toEqual({ category: 'Hudba', extra: [], top: true })
        expect(splitTags([TOP_TAG, 'Hudba'])).toEqual({ category: 'Hudba', extra: [], top: true })
    })

    it('stará akce jen s TOP akce má prázdnou kategorii', () => {
        expect(splitTags([TOP_TAG])).toEqual({ category: '', extra: [], top: true })
    })

    it('chybějící nebo špatná hodnota', () => {
        expect(splitTags(null)).toEqual({ category: '', extra: [], top: false })
        expect(splitTags(undefined)).toEqual({ category: '', extra: [], top: false })
        expect(splitTags([])).toEqual({ category: '', extra: [], top: false })
    })
})

describe('joinTags', () => {
    it('jen kategorie', () => {
        expect(joinTags({ category: 'Sport' })).toEqual(['Sport'])
    })

    it('kategorie a TOP akce, TOP je poslední', () => {
        expect(joinTags({ category: 'Hudba', top: true })).toEqual(['Hudba', TOP_TAG])
    })

    it('vedlejší štítky se zachovají', () => {
        expect(joinTags({ category: 'Kultura', extra: ['Hudba'], top: true })).toEqual(['Kultura', 'Hudba', TOP_TAG])
    })

    it('duplicity a TOP v extra se vyhodí', () => {
        expect(joinTags({ category: 'Hudba', extra: ['Hudba', TOP_TAG], top: false })).toEqual(['Hudba'])
        expect(joinTags({ category: 'Hudba', extra: ['Hudba', TOP_TAG], top: true })).toEqual(['Hudba', TOP_TAG])
    })

    it('prázdná kategorie dá prázdné pole (bez TOP)', () => {
        expect(joinTags({ category: '' })).toEqual([])
    })
})

describe('splitTags a joinTags dohromady', () => {
    it('načtení a uložení nic neztratí', () => {
        for (const tags of [['Hudba'], ['Kultura', 'Hudba'], ['Hudba', TOP_TAG], ['Kultura', 'Hudba', TOP_TAG]]) {
            expect(joinTags(splitTags(tags))).toEqual(tags)
        }
    })

    it('přepnutí TOP na akci s víc štítky zachová vedlejší kategorii', () => {
        const state = splitTags(['Kultura', 'Hudba'])
        expect(joinTags({ ...state, top: true })).toEqual(['Kultura', 'Hudba', TOP_TAG])
    })
})
