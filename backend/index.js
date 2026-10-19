const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const path = require('path')

dotenv.config({path: path.join(__dirname, '.env')})
const authRouter = require('./src/routes/auth')
const events = require('./src/routes/events')
const candidates = require('./src/routes/candidates')
const render = require('./src/routes/render')

const app = express()
const PORT = process.env.PORT || 3001

// Před backendem stojí dvě proxy: Caddy (TLS) a za ním Nginx. Backend vidí jako zdrojovou
// adresu Nginx, ne návštěvníka. Číslo 2 říká "věř dvěma proxy": Caddy zapíše do
// X-Forwarded-For adresu návštěvníka, Nginx k ní připíše adresu Caddy, a req.ip je pak
// první adresa, které už nevěříme, tedy návštěvník. Počet skoků se musí rovnat počtu proxy
// před backendem: o jednu méně by všichni návštěvníci sdíleli adresu Caddy (a rate limit
// přihlášení by byl společný), o jednu víc by šel limiter obejít podvrženou hlavičkou.
// Hodnota true by věřila i adresám od klienta.
app.set('trust proxy', 2)

app.use(cors({origin: process.env.FRONTEND_URL}))

// Dávka návrhů akcí je větší než výchozích 100 kB, které pustí globální express.json níž.
// Tahle cesta si proto čte tělo sama a musí být PŘED ním, jinak by dávku odmítl dřív.
app.use('/api/candidates', express.json({limit: '1mb'}), candidates)

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/events', events)

app.get('/api/health', (req, res) => {
    res.json({status: 'ok'})
})

// Neznámá adresa pod /api dostane JSON 404 a nespadne do rendereru níž, který
// by na ni vrátil HTML stránku.
app.use('/api', (req, res) => {
    res.status(404).json({error: 'Neznámý endpoint.'})
})

// Serverový renderer HTML pro všechno ostatní (musí být poslední). Nginx sem
// posílá jen adresy, které nejsou statický soubor.
app.use(render)

app.listen(PORT, () => console.log("vše ok"))