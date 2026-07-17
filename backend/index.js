const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const path = require('path')

dotenv.config({path: path.join(__dirname, '.env')})
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({origin: process.env.FRONTEND_URL}))
app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({status: 'ok'})
})

app.listen(PORT, () => console.log("vše ok"))