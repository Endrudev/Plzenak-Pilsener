// Sdílené věci kolem obrázků akcí: upload z administrace (routes/events.js) i stažení
// obrázku při schválení návrhu (routes/candidates.js) musí platit stejná pravidla.

// K ověřenému typu patří Content-Type, který se uloží do R2. Nebere se z hlavičky
// prohlížeče ani cizího serveru, aby soubor nešel do bucketu označený jinak, než jaký je.
const IMAGE_MIME = {
    jpg:  'image/jpeg',
    png:  'image/png',
    webp: 'image/webp',
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Skutečný typ souboru se pozná z prvních bajtů obsahu, ne z MIME typu ani přípony.
function detectImageType(buffer) {
    if (buffer.length < 12) return null
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'jpg'
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'png'
    if (buffer.subarray(0, 4).toString('ascii') === 'RIFF'
        && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp'
    return null
}

module.exports = { IMAGE_MIME, MAX_IMAGE_BYTES, detectImageType }
