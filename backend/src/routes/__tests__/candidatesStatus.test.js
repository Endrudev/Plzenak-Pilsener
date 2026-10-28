const { describe, it, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const express = require('express')
const jwt = require('jsonwebtoken')

// Test routy přes HTTP: skutečný router, middleware i validace, jen databázi nahrazuje
// falešné `query`. Modul db/pool se podstrčí do require.cache dřív, než ho router
// načte, takže se nevytváří žádné spojení s Postgresem.

const IMPORTER_TOKEN = 'testovaci-token-importeru'
const JWT_SECRET = 'testovaci-tajemstvi'

const ROWS = [
    { source_url: 'https://akce.plzen.eu/a', status: 'pending', event_id: null, reviewed_at: null,
        name: 'Tajný název', description: ['Tajný popis'], raw: '{"x":1}', id: 1 },
    { source_url: 'https://akce.plzen.eu/b', status: 'approved', event_id: 123,
        reviewed_at: new Date('2026-10-27T10:00:00Z'), name: 'Jiný název', id: 2 },
    { source_url: 'https://akce.plzen.eu/c', status: 'rejected', event_id: null,
        reviewed_at: new Date('2026-10-28T08:30:00Z'), name: 'Třetí', id: 3 },
]

const calls = []
async function fakeQuery(text, params) {
    calls.push({ text, params })
    if (/source_url = ANY\(\$1\)/.test(text)) {
        // Vrací celé řádky schválně: odpověď musí vybrat jen povolené sloupce sama,
        // i kdyby někdo dotaz změnil na SELECT *.
        return { rows: ROWS.filter(row => params[0].includes(row.source_url)) }
    }
    return { rows: ROWS }
}

const poolPath = require.resolve('../../db/pool')
require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: { query: fakeQuery } }

const candidates = require('../candidates')

let server
let baseUrl

before(async () => {
    process.env.IMPORTER_TOKEN = IMPORTER_TOKEN
    process.env.JWT_SECRET = JWT_SECRET
    const app = express()
    app.use('/api/candidates', express.json({ limit: '1mb' }), candidates)
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve) })
    baseUrl = `http://127.0.0.1:${server.address().port}/api/candidates`
})

after(() => new Promise(resolve => server.close(resolve)))

beforeEach(() => {
    calls.length = 0
    process.env.IMPORTER_TOKEN = IMPORTER_TOKEN
})

function postStatus(body, token = IMPORTER_TOKEN) {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return fetch(`${baseUrl}/status`, { method: 'POST', headers, body: JSON.stringify(body) })
}

describe('POST /api/candidates/status — přihlášení', () => {
    it('bez tokenu vrátí 401 a na databázi nesáhne', async () => {
        const res = await postStatus({ sourceUrls: ['https://akce.plzen.eu/a'] }, null)
        assert.equal(res.status, 401)
        assert.equal(calls.length, 0)
    })

    it('se špatným tokenem vrátí 401', async () => {
        const res = await postStatus({ sourceUrls: ['https://akce.plzen.eu/a'] }, 'spatny-token')
        assert.equal(res.status, 401)
        assert.equal(calls.length, 0)
    })

    it('platný JWT administrátora tu neplatí (401), přestože na admin routě projde', async () => {
        const adminToken = jwt.sign({ id: 1, email: 'admin@example.com' }, JWT_SECRET, { expiresIn: '1h' })

        const adminRoute = await fetch(baseUrl, { headers: { Authorization: `Bearer ${adminToken}` } })
        assert.equal(adminRoute.status, 200, 'token musí být jinak platný')

        calls.length = 0
        const res = await postStatus({ sourceUrls: ['https://akce.plzen.eu/a'] }, adminToken)
        assert.equal(res.status, 401)
        assert.equal(calls.length, 0)
    })

    it('bez nastaveného IMPORTER_TOKEN je brána zavřená (503)', async () => {
        delete process.env.IMPORTER_TOKEN
        const res = await postStatus({ sourceUrls: ['https://akce.plzen.eu/a'] })
        assert.equal(res.status, 503)
        assert.equal(calls.length, 0)
    })
})

describe('POST /api/candidates/status — vstup', () => {
    const invalid = {
        'chybějící pole': {},
        'prázdné pole': { sourceUrls: [] },
        '101 adres': { sourceUrls: Array.from({ length: 101 }, (_, i) => `https://akce.plzen.eu/${i}`) },
        'pole není pole': { sourceUrls: 'https://akce.plzen.eu/a' },
        'prvek není text': { sourceUrls: ['https://akce.plzen.eu/a', 42] },
        'prázdný text': { sourceUrls: [''] },
    }
    for (const [label, body] of Object.entries(invalid)) {
        it(`${label} → 400 bez dotazu do databáze`, async () => {
            const res = await postStatus(body)
            assert.equal(res.status, 400)
            assert.equal(calls.length, 0)
        })
    }

    it('přesně 100 adres projde', async () => {
        const res = await postStatus({ sourceUrls: Array.from({ length: 100 }, (_, i) => `https://akce.plzen.eu/${i}`) })
        assert.equal(res.status, 200)
    })
})

describe('POST /api/candidates/status — odpověď', () => {
    const input = [
        'https://akce.plzen.eu/c',
        'https://akce.plzen.eu/a',
        'https://akce.plzen.eu/nezname',
        'https://akce.plzen.eu/b',
        'https://akce.plzen.eu/a',
    ]

    it('vrátí stav čekajícího, schváleného i zamítnutého návrhu a neznámou adresu', async () => {
        const res = await postStatus({ sourceUrls: input })
        assert.equal(res.status, 200)
        const body = await res.json()

        const byUrl = Object.fromEntries(body.items.map(item => [item.sourceUrl, item]))
        assert.deepEqual(byUrl['https://akce.plzen.eu/a'],
            { sourceUrl: 'https://akce.plzen.eu/a', status: 'pending', eventId: null, reviewedAt: null })
        assert.deepEqual(byUrl['https://akce.plzen.eu/b'],
            { sourceUrl: 'https://akce.plzen.eu/b', status: 'approved', eventId: 123, reviewedAt: '2026-10-27T10:00:00.000Z' })
        assert.deepEqual(byUrl['https://akce.plzen.eu/c'],
            { sourceUrl: 'https://akce.plzen.eu/c', status: 'rejected', eventId: null, reviewedAt: '2026-10-28T08:30:00.000Z' })
        assert.equal(body.items.length, 3)
        assert.deepEqual(body.unknown, ['https://akce.plzen.eu/nezname'])
    })

    it('obsahuje jen items a unknown a v položkách jen čtyři povolené klíče', async () => {
        const body = await (await postStatus({ sourceUrls: input })).json()
        assert.deepEqual(Object.keys(body).sort(), ['items', 'unknown'])
        for (const item of body.items) {
            assert.deepEqual(Object.keys(item).sort(), ['eventId', 'reviewedAt', 'sourceUrl', 'status'])
        }
        const text = JSON.stringify(body)
        for (const secret of ['Tajný', 'Jiný název', 'raw', '"id"']) {
            assert.ok(!text.includes(secret), secret)
        }
    })

    it('položí jediný dotaz s ANY a jen se čtyřmi sloupci, duplicitní adresy pošle jednou', async () => {
        await postStatus({ sourceUrls: input })
        assert.equal(calls.length, 1)
        const { text, params } = calls[0]
        assert.match(text, /SELECT source_url, status, event_id, reviewed_at\s+FROM event_candidates\s+WHERE source_url = ANY\(\$1\)/)
        assert.deepEqual(params, [[
            'https://akce.plzen.eu/c',
            'https://akce.plzen.eu/a',
            'https://akce.plzen.eu/nezname',
            'https://akce.plzen.eu/b',
        ]])
    })
})
