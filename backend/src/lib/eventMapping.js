// Mapování mezi sloupci v databázi (snake_case) a tvarem, který vidí API a
// frontend (camelCase). Čisté funkce bez volání databáze.

function mapEvent(event) {
    return {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        tags: event.tags,
        url: event.url,
        description: event.description,
        dateShort: event.date_short,
        imgClass: event.img_class,
        mapSrc: event.map_src,
        createdAt: event.created_at,
        imageUrl: event.image_url,
        startsOn: event.starts_on,
        updatedAt: event.updated_at
    }
}

function mapEventReverse(event) {
    return {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        tags: event.tags,
        url: event.url,
        description: event.description,
        date_short: event.dateShort,
        img_class: event.imgClass,
        map_src: event.mapSrc,
        created_at: event.createdAt,
        image_url: event.imageUrl,
        starts_on: event.startsOn,
        updated_at: event.updatedAt
    }
}

module.exports = { mapEvent, mapEventReverse }
