const dotenv = require('dotenv')
const path = require('path')
const bcrypt = require('bcrypt')

dotenv.config({path: path.join(__dirname, '../../.env')})

const {query} = require('./pool')

async function seed() {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    const passwordHash = await bcrypt.hash(password, 12)

    // Existující účet se nemění (ON CONFLICT DO NOTHING), ani jeho heslo. Dřív to seed
    // neřekl a hlásil úspěch, i když heslo z .env nikam nezapsal.
    const result = await query('INSERT INTO admins(email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
        [email, passwordHash]
    )

    if (result.rowCount === 0) {
        console.log(`Účet ${email} už existuje, heslo zůstalo beze změny.`)
        console.log('Heslo podle .env nastaví: npm run seed:reset')
    } else {
        console.log('Seed dokončen pro účet:', email)
    }
    process.exit(0)
}

seed().catch(err => {
    console.error('Chyba seedu:', err.message)
    process.exit(1)
})