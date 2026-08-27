const express =require('express')
const router = express.Router()
const {query} = require('../db/pool')
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
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
        badge: event.badge,
        url: event.url,
        description: event.description,
        dateShort: event.date_short,
        badgeType: event.badge_type,
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
        badge: event.badge,
        url: event.url,
        description: event.description,
        date_short: event.dateShort,
        badge_type: event.badgeType,
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
            INSERT INTO events (name, date, date_short, location, tags, badge, badge_type, img_class, url, description, map_src)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
            `, [result.name, result.date, result.date_short, result.location, result.tags, result.badge, result.badge_type, result.img_class, result.url, result.description, result.map_src]
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
            UPDATE events SET name = $1, date = $2, location = $3, tags = $4, badge = $5, url = $6, description = $7, date_short = $8, badge_type = $9, img_class = $10, map_src = $11 
            WHERE id = $12 
            RETURNING *;
            `, [result.name, result.date, result.location, result.tags, result.badge, result.url, result.description, result.date_short, result.badge_type, result.img_class, result.map_src, req.params.id]
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

router.post('/:id/image', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const key = `events/${req.params.id}-${Date.now()}-${req.file.originalname}`
        await sendObject(key, req.file.buffer, req.file.mimetype)
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
            res.status(200).json(mapEvent(updateResult.rows[0]))
        }
    }catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Akci nelze aktualizovat. Zkuste to znovu.'})
    }
})

module.exports = router