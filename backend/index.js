const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const path = require('path')

dotenv.config({path: path.join(__dirname, '.env')})
const authRouter = require('./src/routes/auth')
const events = require('./src/routes/events')

const app = express()
const PORT = process.env.PORT || 3001

// Za Nginxem vidí backend jako zdrojovou adresu Nginx, ne návštěvníka. Číslo 1 říká
// "věř jedné proxy": req.ip je pak poslední adresa v X-Forwarded-For, kterou připsal
// Nginx. Víc proxy před backendem (např. TLS terminátor před Nginxem) = víc skoků.
// Hodnota true by věřila i adresám od klienta a limiter by šel obejít podvrženou hlavičkou.
app.set('trust proxy', 1)

app.use(cors({origin: process.env.FRONTEND_URL}))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/events', events)

app.get('/api/health', (req, res) => {
    res.json({status: 'ok'})
})

app.listen(PORT, () => console.log("vše ok"))