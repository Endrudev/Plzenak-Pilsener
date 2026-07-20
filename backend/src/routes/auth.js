const express = require('express')
const router = express.Router()
const {query} = require('../db/pool')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body

        const result = await query(`SELECT * FROM admins WHERE email = $1`, [email])
        const errmessage = {error: 'Neplatné přihlašovací údaje.'}

        if(result.rows.length === 0){
            return res.status(401).json(errmessage)
        }

        const {password_hash, ...safeAdmin} = result.rows[0]

        if(await bcrypt.compare(password, password_hash)){
            const token = jwt.sign({id: safeAdmin.id, email: safeAdmin.email}, process.env.JWT_SECRET, {expiresIn: '8h'})
            res.json(
                {
                    admin: safeAdmin,
                    token: token
                })
        }else{
            res.status(401).json(errmessage)
        }
    }catch(err) {
        console.error(err.message)
        res.status(500).json({error: 'Něco se pokazilo.'})
    }
})

module.exports = router