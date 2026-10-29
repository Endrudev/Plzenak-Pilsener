const {Pool, types} = require('pg')

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
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    checkConnection,
}