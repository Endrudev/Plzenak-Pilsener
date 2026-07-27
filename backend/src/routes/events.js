const express =require('express')
const router = express.Router()
const {query} = require('../db/pool')

router.get('/', async(req, res) => {
    try{let result = await query(`SELECT * FROM events
            ORDER BY id;`)
        result = result.rows.map(event =>({
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
            createdAt: event.created_at
        }))
        res.json(result)
    }catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Akce nelze načíst. Zkuste to znovu.'})
    }
    })

module.exports = router