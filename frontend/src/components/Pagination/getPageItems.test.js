import { describe, it, expect } from 'vitest'
import { getPageItems } from './getPageItems.js'

describe('getPageItems', () => {
    it('vrátí jen [1] když je jedna nebo žádná stránka', () => {
        expect(getPageItems(1, 1)).toEqual([1])
        expect(getPageItems(1, 0)).toEqual([1])
    })

    it('ukáže všechny stránky, když se vejdou bez mezery', () => {
        expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5])
        expect(getPageItems(3, 5)).toEqual([1, 2, 3, 4, 5])
    })

    it('na začátku dlouhé řady ukáže okolí a mezeru ke konci', () => {
        expect(getPageItems(1, 10)).toEqual([1, 2, '...', 10])
    })

    it('na konci dlouhé řady ukáže mezeru od začátku a okolí', () => {
        expect(getPageItems(10, 10)).toEqual([1, '...', 9, 10])
    })

    // Tohle je přesně bug, co nahrazuje: stará getPaginationItems() by na
    // stránce 7 z 10 vrátila [1,2,3,4,'...',10] — číslo 7 by se v řadě
    // vůbec neobjevilo a nedalo by se na něj kliknout.
    it('uprostřed dlouhé řady drží aktuální stránku viditelnou s mezerami na obou stranách', () => {
        expect(getPageItems(7, 10)).toEqual([1, '...', 6, 7, 8, '...', 10])
    })

    it('nikdy nevrátí stránku mimo rozsah, i když je page mimo hranice', () => {
        expect(getPageItems(99, 20)).toEqual([1, '...', 19, 20])
        expect(getPageItems(0, 20)).toEqual([1, 2, '...', 20])
    })
})
