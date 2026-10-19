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

module.exports = {
    query: (text, params) => pool.query(text, params),
}