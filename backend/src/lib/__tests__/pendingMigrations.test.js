const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { pendingMigrations } = require('../pendingMigrations')

describe('pendingMigrations', () => {
    it('vrátí neaplikované migrace seřazené podle jména', () => {
        const files = ['006_b.sql', '001_a.sql', '005_c.sql', '002_d.sql']
        assert.deepEqual(pendingMigrations(files, ['001_a.sql', '002_d.sql']), ['005_c.sql', '006_b.sql'])
    })

    it('všechno aplikované = prázdné pole', () => {
        assert.deepEqual(pendingMigrations(['001_a.sql'], ['001_a.sql']), [])
    })

    it('jiné soubory než .sql ignoruje', () => {
        assert.deepEqual(pendingMigrations(['README.md', '.gitkeep', '001_a.sql'], []), ['001_a.sql'])
    })
})
