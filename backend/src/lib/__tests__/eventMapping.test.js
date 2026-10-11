const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { mapEvent, mapEventReverse } = require('../eventMapping')

const ROW = {
    id: 7,
    name: 'Pivní slavnosti',
    date: '29.8.2026',
    location: 'Náměstí Republiky',
    tags: ['Hudba'],
    url: 'https://example.cz',
    description: ['Odstavec.'],
    date_short: '29.8.',
    img_class: 'event-image--prazdroj',
    map_src: 'https://osm.example/map',
    created_at: '2026-08-01T10:00:00.000Z',
    image_url: 'https://r2.example/events/7/a.jpg',
    image_key: 'events/7/a.jpg',
}

const API = {
    id: 7,
    name: 'Pivní slavnosti',
    date: '29.8.2026',
    location: 'Náměstí Republiky',
    tags: ['Hudba'],
    url: 'https://example.cz',
    description: ['Odstavec.'],
    dateShort: '29.8.',
    imgClass: 'event-image--prazdroj',
    mapSrc: 'https://osm.example/map',
    createdAt: '2026-08-01T10:00:00.000Z',
    imageUrl: 'https://r2.example/events/7/a.jpg',
}

describe('mapEvent', () => {
    it('převede snake_case sloupce na camelCase pole API', () => {
        assert.deepEqual(mapEvent(ROW), API)
    })

    it('nepustí do odpovědi interní sloupec image_key', () => {
        const result = mapEvent(ROW)
        assert.equal('image_key' in result, false)
        assert.equal('imageKey' in result, false)
    })

    it('chybějící hodnoty (null z databáze) nechá null, nevymýšlí výchozí', () => {
        const result = mapEvent({ ...ROW, url: null, map_src: null, image_url: null })
        assert.equal(result.url, null)
        assert.equal(result.mapSrc, null)
        assert.equal(result.imageUrl, null)
    })

    it('chybějící sloupce dají undefined, ne výjimku', () => {
        const result = mapEvent({ id: 1, name: 'X' })
        assert.equal(result.dateShort, undefined)
        assert.equal(result.imageUrl, undefined)
    })
})

describe('mapEventReverse', () => {
    it('převede camelCase pole z těla požadavku na sloupce databáze', () => {
        const result = mapEventReverse(API)
        assert.equal(result.date_short, '29.8.')
        assert.equal(result.img_class, 'event-image--prazdroj')
        assert.equal(result.map_src, 'https://osm.example/map')
        assert.equal(result.created_at, '2026-08-01T10:00:00.000Z')
        assert.equal(result.image_url, 'https://r2.example/events/7/a.jpg')
    })

    it('pole, která se jmenují stejně, přenese beze změny', () => {
        const result = mapEventReverse(API)
        assert.equal(result.name, 'Pivní slavnosti')
        assert.equal(result.location, 'Náměstí Republiky')
        assert.deepEqual(result.tags, ['Hudba'])
        assert.deepEqual(result.description, ['Odstavec.'])
    })

    it('žádný camelCase klíč nezůstane ve výstupu', () => {
        const keys = Object.keys(mapEventReverse(API))
        assert.deepEqual(keys.filter(k => /[A-Z]/.test(k)), [])
    })

    it('tvar, který putuje do INSERT/UPDATE, drží názvy sloupců, na které se SQL odkazuje', () => {
        // Hlídá překlep v názvu klíče: SQL v routes/events.js čte právě tyhle.
        const keys = Object.keys(mapEventReverse(API))
        for (const k of ['name', 'date', 'date_short', 'location', 'tags', 'img_class', 'url', 'description', 'map_src']) {
            assert.ok(keys.includes(k), `chybí klíč ${k}`)
        }
    })
})

describe('mapEvent a mapEventReverse dohromady', () => {
    it('jsou si navzájem inverzní', () => {
        assert.deepEqual(mapEvent(mapEventReverse(API)), API)
    })
})
