import { describe, it, expect } from 'vitest'
import { imageBackground } from './imageBackground.js'

describe('imageBackground', () => {
    it('vrátí undefined, když akce nemá obrázek', () => {
        expect(imageBackground('')).toBeUndefined()
        expect(imageBackground(null)).toBeUndefined()
        expect(imageBackground(undefined)).toBeUndefined()
    })

    it('zabalí URL do uvozovek', () => {
        expect(imageBackground('https://cdn.example/a.jpg'))
            .toEqual({ backgroundImage: 'url("https://cdn.example/a.jpg")' })
    })

    it('zakóduje mezeru v názvu souboru', () => {
        const style = imageBackground('https://cdn.example/moje foto.jpg')
        expect(style.backgroundImage).toBe('url("https://cdn.example/moje%20foto.jpg")')
    })

    it('nezakóduje podruhé už zakódovanou URL', () => {
        const style = imageBackground('https://cdn.example/moje%20foto.jpg')
        expect(style.backgroundImage).toBe('url("https://cdn.example/moje%20foto.jpg")')
    })

    it('neplatnou adresu použije, jak je, místo aby spadl', () => {
        const style = imageBackground('tohle není url')
        expect(style.backgroundImage).toBe('url("tohle není url")')
    })
})
