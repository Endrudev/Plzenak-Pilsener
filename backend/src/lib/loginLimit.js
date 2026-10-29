// Kolik pokusů o přihlášení pustí limiter za 15 minut z jedné adresy.
//
// Výchozí je 5 (produkce). Lokálně se dá zvednout proměnnou LOGIN_RATE_LIMIT_MAX,
// protože při vývoji stačí pár překlepů a admin je čtvrt hodiny zablokovaný.
// Cokoli jiného než kladné celé číslo (chybí, prázdné, "abc", 0, -3, 2.5) znamená
// výchozí hodnotu: překlep v proměnné nesmí limiter vypnout.
const DEFAULT_LOGIN_LIMIT = 5

function loginLimitMax(value) {
    if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return DEFAULT_LOGIN_LIMIT
    const parsed = Number(value.trim())
    return parsed > 0 ? parsed : DEFAULT_LOGIN_LIMIT
}

module.exports = { loginLimitMax, DEFAULT_LOGIN_LIMIT }
