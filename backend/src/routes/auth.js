const express = require('express')
const router = express.Router()
const {query} = require('../db/pool')

router.post('/login', async (req, res) => {
    const {email, password} = req.body

    const result = await query(`SELECT * FROM admins WHERE email = $1`, [email])

    if(result.rows.length === 0){
        return res.status(401).json({error: 'neplatné přihlašovací údaje'})
    }

    res.json(
        {admin:result.rows[0]}

    )
})

module.exports = router