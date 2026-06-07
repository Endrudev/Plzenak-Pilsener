const dotenv = require('dotenv')
const path = require('path')
const bcrypt = require('bcrypt')

dotenv.config({path: path.join(__dirname, '../../.env')})

const {query} = require('./pool')

async function seed() {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    const passwordHash = await bcrypt.hash(password, 12)

    await query('INSERT INTO admins(email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
        [email, passwordHash]
    )

    console.log('Seed dokončen pro účet:', email)
    process.exit(0)
}

seed().catch(err => {
    console.error('Chyba seedu:', err.message)
    process.exit(1)
})