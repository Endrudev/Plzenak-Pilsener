import { CATEGORIES } from '../filters/categories.jsx'
import { imageBackground } from './imageBackground.js'

// Pozadí karty akce: fotka akce, a když ji akce nemá, jantarový gradient první
// kategorie, do které akce patří. Akce bez fotky i bez kategorie dostane
// základní brandový gradient. Vrací objekt pro `style`.
//
// Fotka vždy přes imageBackground (normalizuje URL), nikdy ručně přes url().
export function eventVisual(event) {
    const photo = imageBackground(event.imageUrl)
    if (photo) return photo

    const category = CATEGORIES.find(c => event.tags?.includes(c.name))
    return { background: category ? `var(--category-${category.slug}-grad)` : 'var(--hero-gradient)' }
}
