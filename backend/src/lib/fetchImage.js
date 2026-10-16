const { MAX_IMAGE_BYTES, detectImageType } = require('./images')

// Stažení obrázku ze zdroje návrhu akce při schválení. Server tu stahuje adresu, kterou
// mu někdo poslal (importér), takže je to místo, kde hrozí SSRF: kdyby šlo zadat libovolnou
// adresu, dalo by se přes backend číst interní služby (databáze, metadata hostitele).
// Proto je tu přísný seznam povolených domén, jen HTTPS, žádná přesměrování a limity.
const ALLOWED_IMAGE_HOSTS = ['akce.plzen.eu']
const TIMEOUT_MS = 10_000

// Chyba, jejíž text je určený uživateli administrace. Cokoli jiného se ukáže jen obecně.
class ImageError extends Error {}

async function downloadImage(urlString) {
    let url
    try {
        url = new URL(urlString)
    } catch {
        throw new ImageError('Adresa obrázku není platná.')
    }
    if (url.protocol !== 'https:') {
        throw new ImageError('Obrázek musí být na adrese s HTTPS.')
    }
    if (!ALLOWED_IMAGE_HOSTS.includes(url.hostname) || (url.port && url.port !== '443')) {
        throw new ImageError('Obrázek je z nepovolené domény.')
    }
    if (url.username || url.password) {
        throw new ImageError('Adresa obrázku nesmí obsahovat přihlašovací údaje.')
    }

    // redirect: 'error' — přesměrování by mohlo vést na jinou, nepovolenou adresu
    let response
    try {
        response = await fetch(url, {
            redirect: 'error',
            signal: AbortSignal.timeout(TIMEOUT_MS),
            headers: { 'User-Agent': 'PlzenakBot/1.0 (+https://plzenak.eu; kontakt@plzenak.eu)' },
        })
    } catch {
        throw new ImageError('Obrázek se nepodařilo stáhnout (zdroj neodpovídá).')
    }
    if (!response.ok) {
        throw new ImageError(`Zdroj obrázku vrátil chybu ${response.status}.`)
    }
    const declared = Number(response.headers.get('content-length'))
    if (declared > MAX_IMAGE_BYTES) {
        throw new ImageError('Obrázek je větší než 5 MB.')
    }

    // Čtení po kouscích s počítadlem: hlavička Content-Length se dá zfalšovat nebo chybí
    const chunks = []
    let size = 0
    try {
        for await (const chunk of response.body) {
            size += chunk.length
            if (size > MAX_IMAGE_BYTES) {
                throw new ImageError('Obrázek je větší než 5 MB.')
            }
            chunks.push(chunk)
        }
    } catch (err) {
        if (err instanceof ImageError) throw err
        throw new ImageError('Obrázek se nepodařilo stáhnout celý.')
    }

    // Typ se pozná z obsahu, ne z hlavičky, kterou posílá cizí server
    const buffer = Buffer.concat(chunks)
    const type = detectImageType(buffer)
    if (!type) {
        throw new ImageError('Soubor není platný obrázek (JPEG, PNG nebo WebP).')
    }
    return { buffer, type }
}

module.exports = { downloadImage, ImageError, ALLOWED_IMAGE_HOSTS }
