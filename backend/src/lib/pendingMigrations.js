// Které migrace ze složky migrations/ ještě nejsou v tabulce schema_migrations.
// Používá kontrola po startu serveru (db/pool.js): když kód čeká sloupec nebo
// tabulku z novější migrace, backend jinak jen hází "relation ... does not exist"
// u jednotlivých požadavků a nikde neřekne, že stačí `npm run migrate`.
// Bere jen .sql soubory, seřazené stejně jako je pouští migrate.js (podle jména).
function pendingMigrations(files, applied) {
    const done = new Set(applied)
    return files
        .filter(file => file.endsWith('.sql') && !done.has(file))
        .sort()
}

module.exports = { pendingMigrations }
