// Slug akce pro adresu /akce/<id>-<slug>. Čistá funkce bez databáze.
//
// Slug se nikam neukládá, počítá se z názvu při každém čtení (mapEvent).
// O akci rozhoduje id, slug je jen čitelná část adresy. Přejmenování akce
// proto adresu změní, ale stará pořád funguje: frontend (a později server
// kódem 301) přesměruje na novou.

const MAX_LENGTH = 60

// 'Dead Bob (CA) + Už jsme doma (CZ)' → 'dead-bob-ca-uz-jsme-doma-cz'
//
// normalize('NFD') rozloží 'ž' na 'z' + samostatný háček (kombinační znak
// U+030C). Kombinační znaky leží v rozsahu U+0300–U+036F a ten se pak smaže.
// Všechno, co není písmeno a-z ani číslice, se stane pomlčkou, víc pomlček
// za sebou se slije a na krajích se ořízne.
function slugify(name) {
    if (typeof name !== 'string') return ''
    const slug = name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    if (slug.length <= MAX_LENGTH) return slug
    // Dlouhý název se zkrátí na celém slově, ne uprostřed.
    const cut = slug.slice(0, MAX_LENGTH + 1)
    const lastDash = cut.lastIndexOf('-')
    return (lastDash > 0 ? cut.slice(0, lastDash) : slug.slice(0, MAX_LENGTH)).replace(/-+$/, '')
}

module.exports = { slugify, MAX_LENGTH }
