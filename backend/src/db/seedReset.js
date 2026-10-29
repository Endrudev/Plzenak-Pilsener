const dotenv = require('dotenv')
const path = require('path')
const bcrypt = require('bcrypt')

dotenv.config({path: path.join(__dirname, '../../.env')})

const {query} = require('./pool')

// Nastaví heslo účtu ADMIN_EMAIL na ADMIN_PASSWORD z .env (a účet založí, když chybí).
// Na rozdíl od `npm run seed`, který existující účet nechá být (ON CONFLICT DO NOTHING),
// tohle heslo PŘEPÍŠE. Je to pro vývoj: po změně hesla v .env se dřív musel ručně mazat
// řádek v `admins`. Spouští se jen vědomě (`npm run seed:reset`), nikde automaticky.
async function seedReset() {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    if (!email || !password) {
        console.error('Chybí ADMIN_EMAIL nebo ADMIN_PASSWORD v backend/.env.')
        process.exit(1)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const result = await query(
        `INSERT INTO admins(email, password_hash) VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
         RETURNING (xmax = 0) AS created`,
        [email, passwordHash]
    )

    // xmax = 0 u nově vloženého řádku, u přepsaného ne. Jen kvůli srozumitelné hlášce.
    const created = result.rows[0]?.created
    console.log(created ? `Účet založen: ${email}` : `Heslo nastaveno podle .env: ${email}`)
    process.exit(0)
}

seedReset().catch(err => {
    console.error('Chyba seed:reset:', err.message)
    process.exit(1)
})
