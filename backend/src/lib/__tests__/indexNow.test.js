const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { createIndexNow, buildPayload, isValidKey } = require('../indexNow')

const KEY = '35546c0ab8fa477a32ccc879dfd5dbfe'

function fakeFetch(status) {
    const calls = []
    const fn = async (url, options) => {
        calls.push({ url, options })
        if (status instanceof Error) throw status
        return { status }
    }
    fn.calls = calls
    return fn
}

// Chyby IndexNow se logují; v testech by jen rušily výpis.
async function quietly(fn) {
    const original = console.error
    console.error = () => {}
    try { return await fn() } finally { console.error = original }
}

describe('isValidKey', () => {
    it('přijme 8 až 128 znaků z písmen, číslic a pomlčky', () => {
        assert.ok(isValidKey(KEY))
        assert.ok(isValidKey('abc-1234'))
    })

    it('odmítne krátký, dlouhý, s jinými znaky nebo chybějící klíč', () => {
        for (const key of ['abc', 'a'.repeat(129), 'klic s mezerou', 'klíč-é-12345', '', undefined, null]) {
            assert.equal(isValidKey(key), false, String(key))
        }
    })
})

describe('buildPayload', () => {
    it('má host, klíč a umístění souboru s klíčem na našem webu', () => {
        const p = buildPayload(KEY, ['https://plzenak.eu/akce/1-a'])
        assert.equal(p.host, 'plzenak.eu')
        assert.equal(p.key, KEY)
        assert.equal(p.keyLocation, `https://plzenak.eu/${KEY}.txt`)
        assert.deepEqual(p.urlList, ['https://plzenak.eu/akce/1-a'])
    })

    it('vyřadí duplicity a adresy z cizí domény (IndexNow by vrátil 422)', () => {
        const p = buildPayload(KEY, ['https://plzenak.eu/a', 'https://plzenak.eu/a', 'https://evil.example/x', 'https://www.plzenak.eu/b'])
        assert.deepEqual(p.urlList, ['https://plzenak.eu/a'])
    })
})

describe('notify', () => {
    it('bez klíče je vypnutý a nic neposílá', async () => {
        const fetchFn = fakeFetch(200)
        const { enabled, notify } = createIndexNow({ key: undefined, fetchFn })
        assert.equal(enabled, false)
        assert.equal(await notify(['https://plzenak.eu/a']), 'disabled')
        assert.equal(fetchFn.calls.length, 0)
    })

    it('pošle jeden POST s JSON tělem na api.indexnow.org', async () => {
        const fetchFn = fakeFetch(202)
        const { notify } = createIndexNow({ key: KEY, fetchFn })
        assert.equal(await notify(['https://plzenak.eu/a', 'https://plzenak.eu/b']), 'sent')
        assert.equal(fetchFn.calls.length, 1)
        const { url, options } = fetchFn.calls[0]
        assert.equal(url, 'https://api.indexnow.org/indexnow')
        assert.equal(options.method, 'POST')
        assert.deepEqual(JSON.parse(options.body).urlList, ['https://plzenak.eu/a', 'https://plzenak.eu/b'])
    })

    it('prázdný seznam adres nepošle', async () => {
        const fetchFn = fakeFetch(200)
        const { notify } = createIndexNow({ key: KEY, fetchFn })
        assert.equal(await notify([]), 'empty')
        assert.equal(fetchFn.calls.length, 0)
    })

    it('chybová odpověď ani výpadek sítě nevyhodí výjimku', async () => {
        for (const status of [400, 403, 422, 429, new Error('ECONNRESET')]) {
            const { notify } = createIndexNow({ key: KEY, fetchFn: fakeFetch(status) })
            assert.equal(await quietly(() => notify(['https://plzenak.eu/a'])), 'error', String(status))
        }
    })
})
