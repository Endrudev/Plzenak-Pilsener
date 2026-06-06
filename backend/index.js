const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({origin: process.env.FRONTEND_URL}))
app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({status: 'ok'})
})

app.listen(PORT, () => console.log("vše ok"))