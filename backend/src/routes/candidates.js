const express = require('express')
const router = express.Router()
const crypto = require('node:crypto')
const { query } = require('../db/pool')
const authMiddleware = require('../middleware/authMiddleware')
const { importerAuth, importerLimiter } = require('../middleware/importerAuth')
const { sendObject, deleteObject } = require('../lib/r2')
const { IMAGE_MIME } = require('../lib/images')
const { downloadImage, ImageError } = require('../lib/fetchImage')
const { toIsoDate } = require('../lib/eventDate')

// Fronta návrhů akcí (tabulka event_candidates, migrace 005). Návrhy posílá importér
// (úzký token IMPORTER_TOKEN), schvaluje je a zamítá přihlášený administrátor. Veřejné
// jsou až po schválení, kdy z nich vznikne řádek v `events`.

// Stejných šest kategorií jako na frontendu (lib/filters/categories.jsx). Štítek
// „TOP akce“ importér nastavit nesmí, ten je ruční výběr administrátora.
const CATEGORIES = ['Gastro', 'Kultura', 'Hudba', 'Sport', 'Památky', 'Pro děti']

const MAX_BATCH = 100
const MAX_APPROVE_BATCH = 50
const STATUSES = ['pending', 'approved', 'rejected']

// Barevný přechod, který se ukáže, když akce nemá obrázek. Stejná hodnota, jakou
// posílá formulář Nová akce.
const DEFAULT_IMG_CLASS = 'event-image--prazdroj'

function isHttpsUrl(value, maxLength) {
    if (typeof value !== 'string' || value.length > maxLength) return false
    try {
        return new URL(value).protocol === 'https:'
    } catch {
        return false
    }
}

// Datum se ukládá jako text DD.MM.YYYY (podle něj řadí TO_DATE v events.js), takže
// špatný zápis by akci tiše vyřadil ze všech seznamů. Kontroluje se i to, že den existuje.
function isValidDate(value) {
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value)
    if (!match) return false
    const [, d, m, y] = match.map(Number)
    const date = new Date(Date.UTC(y, m - 1, d))
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

function cleanString(value, maxLength) {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null
}

// Vrací { value } nebo { error }. Nic nepřebírá ze vstupu naslepo: každé pole se
// zkontroluje a znovu sestaví, takže do databáze nepřijde nic navíc.
function validateCandidate(input) {
    if (!input || typeof input !== 'object') return { error: 'Návrh musí být objekt.' }

    const name = cleanString(input.name, 200)
    if (!name) return { error: 'Chybí název (nejvýš 200 znaků).' }

    if (typeof input.date !== 'string' || !isValidDate(input.date)) {
        return { error: 'Datum musí mít tvar DD.MM.RRRR a existovat.' }
    }

    const location = cleanString(input.location, 200)
    if (!location) return { error: 'Chybí místo (nejvýš 200 znaků).' }

    if (!Array.isArray(input.tags) || input.tags.length < 1 || input.tags.length > 3
        || !input.tags.every(tag => CATEGORIES.includes(tag))) {
        return { error: `Štítky: 1 až 3 z ${CATEGORIES.join(', ')}.` }
    }
    const tags = [...new Set(input.tags)]

    if (!Array.isArray(input.description) || input.description.length < 1 || input.description.length > 10) {
        return { error: 'Popis musí mít 1 až 10 odstavců.' }
    }
    const description = input.description.map(p => cleanString(p, 2000))
    if (description.some(p => p === null)) {
        return { error: 'Každý odstavec popisu musí být neprázdný text (nejvýš 2000 znaků).' }
    }

    if (!isHttpsUrl(input.sourceUrl, 500)) return { error: 'Zdrojová adresa musí být HTTPS.' }

    let sourceImageUrl = null
    if (input.sourceImageUrl !== undefined && input.sourceImageUrl !== null) {
        if (!isHttpsUrl(input.sourceImageUrl, 500)) return { error: 'Adresa obrázku musí být HTTPS.' }
        sourceImageUrl = input.sourceImageUrl
    }

    // Surová data jen pro ladění. Příliš velká se zahodí, ať fronta nenabobtná.
    let raw = null
    if (input.raw !== undefined && input.raw !== null) {
        const serialized = JSON.stringify(input.raw)
        if (serialized && serialized.length <= 20_000) raw = serialized
    }

    return {
        value: {
            name,
            date: input.date,
            dateShort: input.date.slice(0, 5),
            location,
            tags,
            description,
            sourceUrl: input.sourceUrl,
            sourceImageUrl,
            raw,
        },
    }
}

function mapCandidate(row) {
    return {
        id: row.id,
        status: row.status,
        name: row.name,
        date: row.date,
        dateShort: row.date_short,
        location: row.location,
        tags: row.tags,
        description: row.description,
        sourceUrl: row.source_url,
        sourceImageUrl: row.source_image_url,
        eventId: row.event_id,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
    }
}

function parseId(value) {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
}

// POST /api/candidates — dávka návrhů od importéru. Každý návrh se zpracuje zvlášť:
// jeden špatný dávku neshodí. Odpověď říká, co vzniklo, co už existovalo a co bylo chybné.
router.post('/', importerLimiter, importerAuth, async (req, res) => {
    try {
        const items = req.body && req.body.items
        if (!Array.isArray(items) || items.length === 0 || items.length > MAX_BATCH) {
            return res.status(400).json({ error: `Pole items musí obsahovat 1 až ${MAX_BATCH} návrhů.` })
        }
        const created = []
        const skipped = []
        const errors = []
        for (const [index, item] of items.entries()) {
            const checked = validateCandidate(item)
            if (checked.error) {
                errors.push({ index, error: checked.error })
                continue
            }
            const c = checked.value
            const result = await query(`
                INSERT INTO event_candidates
                    (source_url, name, date, date_short, location, tags, description, source_image_url, raw)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (source_url) DO NOTHING
                RETURNING id;
            `, [c.sourceUrl, c.name, c.date, c.dateShort, c.location, c.tags, c.description, c.sourceImageUrl, c.raw])
            if (result.rows.length > 0) {
                created.push({ index, id: result.rows[0].id })
            } else {
                skipped.push({ index, sourceUrl: c.sourceUrl })
            }
        }
        res.status(created.length > 0 ? 201 : 200).json({ created, skipped, errors })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: 'Návrhy se nepodařilo uložit. Zkuste to znovu.' })
    }
})

// GET /api/candidates?status=pending — seznam pro administraci
router.get('/', authMiddleware, async (req, res) => {
    try {
        const status = req.query.status || 'pending'
        if (!STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Neznámý stav návrhu.' })
        }
        const result = await query(`
            SELECT * FROM event_candidates
            WHERE status = $1
            ORDER BY TO_DATE(date, 'DD.MM.YYYY') ASC, id ASC
            LIMIT 500;
        `, [status])
        res.json({ items: result.rows.map(mapCandidate) })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: 'Návrhy se nepodařilo načíst. Zkuste to znovu.' })
    }
})

// Schválení jednoho návrhu. Pořadí kroků je záměrné:
//  1. návrh se atomicky přepne z pending na approved (dvojí kliknutí nevytvoří dvě akce),
//  2. vloží se akce; když se to nepovede, návrh se vrátí na pending,
//  3. teprve potom se stahuje obrázek. Jeho selhání schválení neruší: akce vznikne
//     s barevným přechodem a obrázek jde doplnit v Upravit akci.
// Vrací { ok, ... }; chybu předává jako { ok: false, status, error }.
async function approveCandidate(id) {
    const claimed = await query(`
        UPDATE event_candidates
        SET status = 'approved', reviewed_at = now()
        WHERE id = $1 AND status = 'pending'
        RETURNING *;
    `, [id])
    if (claimed.rows.length === 0) {
        return { ok: false, status: 404, error: 'Návrh neexistuje nebo už byl vyřízen.' }
    }
    const c = claimed.rows[0]

    let event
    try {
        const inserted = await query(`
            INSERT INTO events (name, date, date_short, location, tags, img_class, url, description, map_src, starts_on)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9)
            RETURNING *;
        `, [c.name, c.date, c.date_short, c.location, c.tags, DEFAULT_IMG_CLASS, c.source_url, c.description, toIsoDate(c.date)])
        event = inserted.rows[0]
    } catch (err) {
        console.error(err.message)
        await query(`UPDATE event_candidates SET status = 'pending', reviewed_at = NULL WHERE id = $1;`, [id])
            .catch(e => console.error(e.message))
        return { ok: false, status: 500, error: 'Akci se nepodařilo vytvořit. Návrh zůstává ke schválení.' }
    }

    let imageSaved = false
    let imageError = null
    if (c.source_image_url) {
        try {
            const { buffer, type } = await downloadImage(c.source_image_url)
            const key = `events/${event.id}/${crypto.randomUUID()}.${type}`
            await sendObject(key, buffer, IMAGE_MIME[type])
            try {
                await query(`UPDATE events SET image_url = $1, image_key = $2, updated_at = now() WHERE id = $3;`,
                    [`${process.env.R2_PUBLIC_URL}/${key}`, key, event.id])
                imageSaved = true
            } catch (dbErr) {
                // objekt už je v bucketu, ale na akci nevisí: uklidit, ať nezůstane sirotek
                await deleteObject(key).catch(e => console.error(e.message))
                throw dbErr
            }
        } catch (err) {
            console.error(err.message)
            imageError = err instanceof ImageError ? err.message : 'Obrázek se nepodařilo uložit.'
        }
    }

    await query(`UPDATE event_candidates SET event_id = $1 WHERE id = $2;`, [event.id, id])
        .catch(e => console.error(e.message))
    return { ok: true, id, eventId: event.id, imageSaved, imageError }
}

// POST /api/candidates/approve — hromadné schválení, body: { ids: [1, 2, 3] }.
// Zpracovává se po jednom za sebou (stahování obrázků nemá smysl paralelizovat a šetří to
// zdroj), výsledek je zvlášť za každé id.
router.post('/approve', authMiddleware, async (req, res) => {
    try {
        const ids = req.body && req.body.ids
        if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_APPROVE_BATCH
            || !ids.every(id => parseId(id) !== null)) {
            return res.status(400).json({ error: `Pole ids musí obsahovat 1 až ${MAX_APPROVE_BATCH} platných id.` })
        }
        const results = []
        for (const id of ids) {
            const outcome = await approveCandidate(Number(id))
            results.push(outcome.ok ? outcome : { id: Number(id), ok: false, error: outcome.error })
        }
        res.json({ results })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: 'Schválení se nepodařilo. Zkuste to znovu.' })
    }
})

// POST /api/candidates/:id/approve — jeden návrh
router.post('/:id/approve', authMiddleware, async (req, res) => {
    try {
        const id = parseId(req.params.id)
        if (id === null) return res.status(400).json({ error: 'Neplatné id.' })
        const outcome = await approveCandidate(id)
        if (!outcome.ok) return res.status(outcome.status).json({ error: outcome.error })
        res.json(outcome)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: 'Schválení se nepodařilo. Zkuste to znovu.' })
    }
})

// POST /api/candidates/:id/reject — řádek zůstává, aby se stejný návrh nevrátil
router.post('/:id/reject', authMiddleware, async (req, res) => {
    try {
        const id = parseId(req.params.id)
        if (id === null) return res.status(400).json({ error: 'Neplatné id.' })
        const result = await query(`
            UPDATE event_candidates
            SET status = 'rejected', reviewed_at = now()
            WHERE id = $1 AND status = 'pending'
            RETURNING id;
        `, [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Návrh neexistuje nebo už byl vyřízen.' })
        }
        res.json({ id, status: 'rejected' })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: 'Zamítnutí se nepodařilo. Zkuste to znovu.' })
    }
})

module.exports = router
