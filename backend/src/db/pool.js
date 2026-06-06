const {Pool} = require('pg')

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.PORT,
    database: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

module.exports = {
    query: (text, params) => pool.query(text, params),
}