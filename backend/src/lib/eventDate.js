// Převod data akce z českého zápisu na ISO pro sloupec starts_on (typ date).
// Čistá funkce bez databáze, ať jde otestovat.

// Admin formulář posílá datum bez nul na začátku (5.3.2026, viz toCzech ve
// frontend/src/lib/date.js), importér s nulami (05.03.2026). Obojí je platné.
// Vrací 'YYYY-MM-DD', nebo null, když zápis nesedí nebo den neexistuje
// (31.2.2026). Kontrola přes Date.UTC: neexistující den by se jinak tiše
// přelil do dalšího měsíce.
function toIsoDate(value) {
    if (typeof value !== 'string') return null
    const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim())
    if (!match) return null
    const [, d, m, y] = match.map(Number)
    const date = new Date(Date.UTC(y, m - 1, d))
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
        return null
    }
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

module.exports = { toIsoDate }
