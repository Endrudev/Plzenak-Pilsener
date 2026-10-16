const crypto = require('node:crypto')
const rateLimit = require('express-rate-limit')

// Přihlášení importéru: samostatný token IMPORTER_TOKEN (Doppler), ne JWT administrátora.
// Smí jediné, odeslat návrhy akcí do fronty (POST /api/candidates). Nic nečte, nemění
// a nic nezveřejní, takže i kdyby unikl, nejhorší možnost jsou další návrhy ke schválení.
//
// Když proměnná není nastavená, brána je zavřená (503): lepší než nechat porovnávat
// proti prázdnému řetězci.
//
// Porovnání jde přes hash a timingSafeEqual, aby doba odpovědi neprozrazovala, kolik
// znaků tokenu sedí. Hash dělá oba řetězce stejně dlouhé, což timingSafeEqual vyžaduje.
function importerAuth(req, res, next) {
    const expected = process.env.IMPORTER_TOKEN
    if (!expected) {
        return res.status(503).json({ error: 'Import návrhů není zapnutý.' })
    }
    const header = req.get('Authorization')
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Chybí přihlášení importéru.' })
    }
    const provided = header.slice('Bearer '.length)
    const a = crypto.createHash('sha256').update(provided).digest()
    const b = crypto.createHash('sha256').update(expected).digest()
    if (!crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ error: 'Neplatný token importéru.' })
    }
    next()
}

// Brzda hádání tokenu. Legitimní importér pošle pár dávek za den, 30 požadavků za
// 15 minut z jedné adresy je pro něj bohatě.
const importerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: 'Příliš mnoho požadavků. Zkuste znovu později.' },
})

module.exports = { importerAuth, importerLimiter }
