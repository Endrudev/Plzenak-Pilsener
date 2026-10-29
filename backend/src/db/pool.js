const {Pool, types} = require('pg')
const fs = require('fs')
const path = require('path')
const { pendingMigrations } = require('../lib/pendingMigrations')

// Sloupec typu date (OID 1082) vracet jako text 'YYYY-MM-DD', ne jako Date.
// pg by z něj udělal půlnoc v časovém pásmu Node a JSON ho pak zapíše v UTC:
// v Praze by se z 24. 10. stalo '2026-10-23T22:00:00.000Z', tedy jiný den.
// Datum bez času žádné pásmo nemá, text je jeho přesný tvar.
types.setTypeParser(types.builtins.DATE, value => value)

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

// Jednorázová kontrola po startu serveru. Selhání server nezastaví (databáze se může
// rozběhnout později a pool se připojí sám), jen ho řekne nahlas. Dřív se špatné DB_*
// v .env projevilo až jako 500 při přihlášení, které vypadalo jako špatné heslo, a
// /api/health hlásil 200, protože databázi nekontroluje. Heslo se nevypisuje.
async function checkConnection() {
    try {
        await pool.query('SELECT 1')
        console.log(`Databáze připojená: ${process.env.DB_NAME} na ${process.env.DB_HOST}:${process.env.DB_PORT}`)
    } catch (err) {
        console.error(`Databáze NEDOSTUPNÁ (${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}): ${err.message}`)
        console.error('Zkontroluj DB_* v backend/.env a jestli běží kontejner s databází.')
        return
    }
    await checkMigrations()
}

// Schéma pozadu za kódem: databáze běží, ale chybí v ní novější migrace. Stalo se
// 2026-10-29 s vývojovým kontejnerem, kde chyběly 005 až 008 a vytvoření akce
// padalo na "column starts_on does not exist".
async function checkMigrations() {
    try {
        const files = fs.readdirSync(path.join(__dirname, '../../migrations'))
        let applied = []
        try {
            applied = (await pool.query('SELECT filename FROM schema_migrations')).rows.map(row => row.filename)
        } catch (err) {
            if (err.code !== '42P01') throw err   // 42P01 = tabulka neexistuje, žádná migrace neproběhla
        }
        const pending = pendingMigrations(files, applied)
        if (pending.length > 0) {
            console.error(`Databázi chybí migrace: ${pending.join(', ')}`)
            console.error('Spusť v backend/: npm run migrate')
        }
    } catch (err) {
        console.error('Kontrola migrací selhala:', err.message)
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    checkConnection,
}