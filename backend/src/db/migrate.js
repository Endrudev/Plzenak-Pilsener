const dotenv = require('dotenv')
dotenv.config({ path: require('path').join(__dirname, '../../.env') })

const fs = require('fs')
const path = require('path')
const { query } = require('./pool')

async function migrate() {
    await query(
    `CREATE TABLE IF NOT EXISTS schema_migrations(
    filename text PRIMARY KEY,
    applied_at timestamptz DEFAULT now());`
    )
    const result = await query(
        `SELECT filename FROM schema_migrations`
    )
    const applied = result.rows.map(row => row.filename)
    console.log(applied)

    const files = fs.readdirSync(path.join(__dirname, '../../migrations'))
    console.log(files)

    for (const file of files){
    if(!applied.includes(file)) {
        const result = fs.readFileSync(path.join(__dirname, '../../migrations/', file),'utf8')
        await query(result)
        await query(`
            INSERT INTO schema_migrations (filename) VALUES ($1)`, [file])
        }
    }
    
}

migrate().then(() => {
    console.log('Migrace schematu migrací proběhla.')
    process.exit(0)
}).catch( err => {
    console.error('Chyba migrace: ', err.message)
    process.exit(1)
})