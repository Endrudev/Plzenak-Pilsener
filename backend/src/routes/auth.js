const express = require('express')
const router = express.Router()
const {query} = require('../db/pool')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({path: path.join(__dirname, '../../.env')})

router.post('/login', async (req, res) => {
    const {email, password} = req.body

    const result = await query(`SELECT * FROM admins WHERE email = $1`, [email])

    if(result.rows.length === 0){
        return res.status(401).json({error: 'Neplatné přihlašovací údaje'})
    }

    const {password_hash, ...safeAdmin} = result.rows[0]

    if(await bcrypt.compare(password, password_hash)){
        const token = jwt.sign({id: safeAdmin.id, email: safeAdmin.email}, process.env.JWT_SECRET, {expiresIn: '8h'})
        res.json(
            {
                admin: safeAdmin,
                result: token
            })
    }else{
        res.status(401).json({error: 'Neplatné přihlašovací údaje.'})
    }
})

module.exports = router