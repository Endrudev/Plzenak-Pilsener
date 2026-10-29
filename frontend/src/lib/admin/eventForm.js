// Kontrola formuláře akce v administraci (vytvoření i úprava). Vrací objekt chyb podle
// pole: prázdný objekt = formulář jde uložit. Chyby se ukazují u polí, ne jako alert.
// Pořadí klíčů odpovídá pořadí polí ve formuláři, takže první klíč je pole, na které
// se po neúspěšném odeslání přesune fokus.

// Stejné limity jako backend (backend/src/lib/images.js). Kontrola tady jen šetří
// zbytečné nahrávání, rozhoduje pořád server.
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function validateImageFile(file) {
    if (!file) return null
    if (!IMAGE_TYPES.includes(file.type)) return 'Podporované formáty jsou JPEG, PNG a WebP.'
    if (file.size > MAX_IMAGE_BYTES) return 'Obrázek je větší než 5 MB.'
    return null
}

export function validateEventForm(values) {
    const errors = {}
    if (!values.title?.trim()) errors.title = 'Vyplňte název akce.'
    if (!values.date) errors.date = 'Vyberte datum.'
    if (!values.category?.trim()) errors.category = 'Vyberte kategorii.'
    if (!values.description?.trim()) errors.description = 'Napište krátký popis.'
    if (!values.locationName?.trim()) errors.locationName = 'Vyplňte místo konání.'
    if (!values.hasImage) errors.image = 'Akce musí mít hlavní obrázek.'
    if (values.url?.trim() && !/^https?:\/\/\S+\.\S+/i.test(values.url.trim())) {
        errors.url = 'Odkaz musí začínat https:// nebo http://.'
    }
    return errors
}
