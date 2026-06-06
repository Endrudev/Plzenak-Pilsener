const dotenv = require('dotenv')
dotenv.config({ path: require('path').join(__dirname, '../../.env') })

const fs = require('fs')
const path = require('path')
const { query } = require('./pool')

const sql = fs.readFileSync(
    path.join(__dirname, '../../migrations/001_create_tables.sql'),
    'utf8'
)

query(sql)
    .then(() => {
        console.log('Migrace proběhla úspěšně')
        process.exit(0)
    })
    .catch(err => {
        console.error('Chyba migrace:', err.message)
        process.exit(1)
    })