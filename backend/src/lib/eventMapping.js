// Mapování mezi sloupci v databázi (snake_case) a tvarem, který vidí API a
// frontend (camelCase). Čisté funkce bez volání databáze.

const { slugify } = require('./slug')
const { toCzechDate } = require('./eventDate')

function mapEvent(event) {
    return {
        id: event.id,
        name: event.name,
        // Od migrace 007 jediný zdroj data je starts_on. `date` zůstává v API
        // pro zobrazení na frontendu a dopočítá se z něj (DD.MM.RRRR).
        date: toCzechDate(event.starts_on),
        location: event.location,
        tags: event.tags,
        url: event.url,
        description: event.description,
        imgClass: event.img_class,
        mapSrc: event.map_src,
        createdAt: event.created_at,
        imageUrl: event.image_url,
        startsOn: event.starts_on,
        updatedAt: event.updated_at,
        // Neukládá se, dopočítá se z názvu (viz lib/slug.js). Proto ho
        // mapEventReverse nemá: do databáze nemá kam jít.
        slug: slugify(event.name)
    }
}

// `date` z těla požadavku tu není: routa ho převede na starts_on přes
// toIsoDate a zkontroluje (nečitelné datum = 400).
function mapEventReverse(event) {
    return {
        id: event.id,
        name: event.name,
        location: event.location,
        tags: event.tags,
        url: event.url,
        description: event.description,
        img_class: event.imgClass,
        map_src: event.mapSrc,
        created_at: event.createdAt,
        image_url: event.imageUrl,
        starts_on: event.startsOn,
        updated_at: event.updatedAt
    }
}

module.exports = { mapEvent, mapEventReverse }
