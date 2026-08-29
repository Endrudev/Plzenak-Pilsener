const express =require('express')
const router = express.Router()
const {query} = require('../db/pool')
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer')
const crypto = require('node:crypto')

// Povolené typy obrázků a přípona, kterou k nim patří. Přípona se bere odsud,
// ne z názvu souboru — název přichází od uživatele a nemá co ovlivňovat klíč
// v bucketu (mezery, diakritika, uvozovky, ../).
const IMAGE_TYPES = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
}

// Opačný směr: k ověřenému typu MIME, které se uloží do R2 jako Content-Type.
// Nebere se z req.file.mimetype, aby soubor nešel do bucketu označený jinak,
// než jaký doopravdy je.
const IMAGE_MIME = {
    jpg:  'image/jpeg',
    png:  'image/png',
    webp: 'image/webp',
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Skutečný typ souboru se pozná z prvních bajtů obsahu, ne z MIME typu — ten
// posílá prohlížeč podle přípony, takže .pdf přejmenovaný na .png projde jako
// obrázek. Tohle je autoritativní kontrola, fileFilter níž je jen levné síto.
function detectImageType(buffer) {
    if (buffer.length < 12) return null
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'jpg'
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'png'
    if (buffer.subarray(0, 4).toString('ascii') === 'RIFF'
        && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp'
    return null
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    fileFilter: (req, file, cb) => {
        if (IMAGE_TYPES[file.mimetype]) return cb(null, true)
        cb(new Error('UNSUPPORTED_TYPE'))
    },
})

// multer hlásí chyby (překročený limit, zamítnutý typ) do callbacku. Bez tohohle
// obalu by probublaly do Express error handleru jako 500 — přitom je to chyba
// klienta, tedy 400.
function uploadImage(req, res, next) {
    upload.single('image')(req, res, err => {
        if (!err) return next()
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Obrázek je větší než 5 MB.' })
        }
        if (err.message === 'UNSUPPORTED_TYPE') {
            return res.status(400).json({ error: 'Podporované formáty jsou JPEG, PNG a WebP.' })
        }
        console.error(err.message)
        return res.status(400).json({ error: 'Obrázek se nepodařilo nahrát.' })
    })
}
const {sendObject, deleteObject} = require('../lib/r2')

// Povolené způsoby řazení. ORDER BY se nedá poslat přes $1 (placeholder umí jen
// hodnoty, ne názvy sloupců), takže uživatel posílá jen klíč do téhle tabulky a
// samotné SQL je vždycky napsané tady. Druhotné řazení podle id drží pořadí
// stabilní, když má víc akcí stejné datum.
const SORTS = {
    konani:  `TO_DATE(date, 'DD.MM.YYYY') ASC, id ASC`,
    pridano: `created_at DESC, id ASC`,
}

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
        imageUrl: event.image_url
    }
}

function mapEventReverse(event) {
    return{
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
        image_url: event.imageUrl
    }
}

router.get('/', async(req, res) => {
    try{
        const { q, kategorie, misto, datum, top, razeni } = req.query
        const conditions = []
        const values = []
        conditions.push(`TO_DATE(date, 'DD.MM.YYYY') >= CURRENT_DATE`)
        if (datum === 'dnes') {
            conditions.push(`TO_DATE(date, 'DD.MM.YYYY') = CURRENT_DATE`)
        }
        if (datum === 'vikend') {
            // Nejbližší sobota a neděle. Posun ode dneška je 6 - ISODOW (po=1 … so=6),
            // konec je o den dál. V neděli je oba posuny 0 — víkend je právě dnes,
            // protože sobota už byla.
            conditions.push(`TO_DATE(date, 'DD.MM.YYYY') BETWEEN
                CURRENT_DATE + (CASE WHEN EXTRACT(ISODOW FROM CURRENT_DATE) = 7 THEN 0
                                     ELSE (6 - EXTRACT(ISODOW FROM CURRENT_DATE))::int END)
                AND
                CURRENT_DATE + (CASE WHEN EXTRACT(ISODOW FROM CURRENT_DATE) = 7 THEN 0
                                     ELSE (7 - EXTRACT(ISODOW FROM CURRENT_DATE))::int END)`)
        }
        if (datum === '7dni') {
            conditions.push(`TO_DATE(date, 'DD.MM.YYYY') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`)
        }
        if (datum === '30dni') {
            conditions.push(`TO_DATE(date, 'DD.MM.YYYY') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`)
        }
        if (q) {
            values.push(`%${q}%`)
            conditions.push(`name ILIKE $${values.length}`)
        }
        if (kategorie) {
            values.push(kategorie)
            conditions.push(`EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${values.length})`)
        }
        if (misto) {
            values.push(misto)
            conditions.push(`location = $${values.length}`)
        }
        if (top === '1') {
            values.push('TOP akce')
            conditions.push(`EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${values.length})`)
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
        // Neznámá nebo chybějící hodnota spadne na výchozí řazení podle data konání
        const orderBy = SORTS[razeni] || SORTS.konani
        let result = await query(`SELECT * FROM events
            ${whereClause}
            ORDER BY ${orderBy};`, values)
        result = result.rows.map(mapEvent)
        res.json(result)
    }catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Akce nelze načíst. Zkuste to znovu.'})
    }
})

router.get('/locations', async(req, res) => {
    try{
        const result = await query('SELECT DISTINCT location FROM events ORDER BY location;')
        res.json(result.rows.map(row => row.location))
    }catch(err){
        console.error(err.message)
        res.status(500).json({error: 'Lokace nelze načíst. Zkuste to znovu.'})
    }
})

router.get('/:id', async(req, res) => {
    try{
        const result = await query(`
            SELECT * FROM events 
            WHERE id = $1;
            `, [req.params.id])
        if(result.rows.length === 0){
            res.status(404).json({error: 'Akce nebyla nalezena.'})
        }else{
            res.json(mapEvent(result.rows[0]))
        }
    }catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Konkrétní akci nelze načíst. Zkuste to znovu.'})
    }
})

router.post('/', authMiddleware, async(req, res) => {
    try{
        const result = mapEventReverse(req.body)
        if(!req.body.name || !req.body.date || !req.body.dateShort || !req.body.location || !req.body.description || req.body.description.length === 0 || !req.body.description.some(item => item.trim() !== '')){
            res.status(400).json({error: 'V požadavku chybí povinná data.'})
            return
        }
        const insertResult = await query(`
            INSERT INTO events (name, date, date_short, location, tags, img_class, url, description, map_src)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
            `, [result.name, result.date, result.date_short, result.location, result.tags, result.img_class, result.url, result.description, result.map_src]
        )
            res.status(201).json(mapEvent(insertResult.rows[0]))
        }
    catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Akci nelze vytvořit. Zkuste to znovu.'})
    }
})

router.put('/:id', authMiddleware, async(req, res) => {
    try{
        const result = mapEventReverse(req.body)
        if(!req.body.name || !req.body.date || !req.body.dateShort || !req.body.location || !req.body.description || req.body.description.length === 0 || !req.body.description.some(item => item.trim() !== '')){
            res.status(400).json({error: 'V požadavku chybí povinná data.'})
            return
        }
        const updateResult = await query(`
            UPDATE events SET name = $1, date = $2, location = $3, tags = $4, url = $5, description = $6, date_short = $7, img_class = $8, map_src = $9 
            WHERE id = $10 
            RETURNING *;
            `, [result.name, result.date, result.location, result.tags, result.url, result.description, result.date_short, result.img_class, result.map_src, req.params.id]
        )
        if(updateResult.rows.length === 0){
            res.status(404).json({error: 'Neplatné id akce. Zkuste to znovu.'})
        }else{
            res.status(200).json(mapEvent(updateResult.rows[0]))
        }
    }catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Akci nelze upravit. Zkuste to znovu.'})
    }
})

router.delete('/:id', authMiddleware, async(req, res) =>{
    try{
        const deleteResult = await query(`
            DELETE FROM events WHERE id = $1
            RETURNING *;
            `, [req.params.id]
        )
        if(deleteResult.rows.length === 0){
            res.status(404).json({error: 'Neplatné id akce. Zkuste to znovu.'})
        }else{
            const deletedEvent = deleteResult.rows[0]
            const key = deletedEvent.image_key
                || (deletedEvent.image_url ? deletedEvent.image_url.replace(`${process.env.R2_PUBLIC_URL}/`, '') : null) 
            
            if(key){
                try{
                    await deleteObject(key)
                }catch(r2err){
                    console.error('Nepodařilo se smazat obrázek z R2:', r2err.message)
                }
            }
            res.status(204).send()
        }
    }catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Akci nelze odstranit. Zkuste to znovu.'})
    }
})

router.post('/:id/image', authMiddleware, uploadImage, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'V požadavku chybí obrázek.' })
        }
        // Ověření podle obsahu, ne podle toho, co tvrdí prohlížeč
        const type = detectImageType(req.file.buffer)
        if (!type) {
            return res.status(400).json({ error: 'Soubor není platný obrázek (JPEG, PNG nebo WebP).' })
        }
        // Klíč skládá server: id akce kvůli orientaci v bucketu, náhodné UUID kvůli
        // jednoznačnosti a přípona podle skutečného typu. Název souboru od uživatele
        // se nepoužívá vůbec.
        const key = `events/${req.params.id}/${crypto.randomUUID()}.${type}`

        // Klíč dosavadního obrázku si přečteme předem — po UPDATE už bude přepsaný
        // a objekt by v bucketu zůstal navždy.
        const previous = await query(
            `SELECT image_key, image_url FROM events WHERE id = $1;`,
            [req.params.id]
        )
        const previousRow = previous.rows[0]

        await sendObject(key, req.file.buffer, IMAGE_MIME[type])
        const urlPath = `${process.env.R2_PUBLIC_URL}/${key}`
        const updateResult = await query(`
            UPDATE events
            SET image_url = $1, image_key = $2
            WHERE id = $3
            RETURNING *;
            `, [urlPath, key, req.params.id])
        if(updateResult.rows.length === 0){
            res.status(404).json({error: 'Neplatné id akce. Zkuste to znovu.'})
        }else{
            // Úklid starého objektu až po úspěšném zápisu — a best-effort, protože
            // sirotek v bucketu je provozní chyba, kdežto neúspěšný request kvůli
            // úklidu by byl chyba viditelná uživateli.
            const previousKey = previousRow && (
                previousRow.image_key
                || (previousRow.image_url ? previousRow.image_url.replace(`${process.env.R2_PUBLIC_URL}/`, '') : null)
            )
            if (previousKey && previousKey !== key) {
                try {
                    await deleteObject(previousKey)
                } catch (r2err) {
                    console.error('Nepodařilo se smazat předchozí obrázek z R2:', r2err.message)
                }
            }
            res.status(200).json(mapEvent(updateResult.rows[0]))
        }
    }catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Akci nelze aktualizovat. Zkuste to znovu.'})
    }
})

module.exports = router