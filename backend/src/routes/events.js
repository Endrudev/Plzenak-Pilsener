const express =require('express')
const router = express.Router()
const {query} = require('../db/pool')
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer')
const crypto = require('node:crypto')
const { IMAGE_MIME, MAX_IMAGE_BYTES, detectImageType } = require('../lib/images')

// Povolené typy obrázků a přípona, kterou k nim patří. Přípona se bere odsud,
// ne z názvu souboru — název přichází od uživatele a nemá co ovlivňovat klíč
// v bucketu (mezery, diakritika, uvozovky, ../).
const IMAGE_TYPES = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
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
const {mapEvent, mapEventReverse} = require('../lib/eventMapping')
const {resolveOrderBy, buildWhere, parsePaging} = require('../lib/eventsQuery')

router.get('/', async(req, res) => {
    try{
        const { razeni, page, perPage } = req.query
        const { whereClause, values } = buildWhere(req.query)
        const orderBy = resolveOrderBy(razeni)
        const { pageNum, perPageNum, offset } = parsePaging(page, perPage)

        const countResult = await query(`SELECT COUNT(*) FROM events ${whereClause};`, values)
        const total = parseInt(countResult.rows[0].count, 10)

        const limitParam = values.length + 1
        const offsetParam = values.length + 2
        const result = await query(`SELECT * FROM events
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT $${limitParam} OFFSET $${offsetParam};`, [...values, perPageNum, offset])

        res.json({
            items: result.rows.map(mapEvent),
            total,
            page: pageNum,
            perPage: perPageNum,
        })
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