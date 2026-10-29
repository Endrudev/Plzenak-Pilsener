// Přihlášení administrátora v prohlížeči. Token (JWT) vydává POST /api/auth/login a ukládá
// se do localStorage pod klíčem `token`. Tady se z něj jen ČTE, nikdy neověřuje: podpis
// kontroluje backend u každého chráněného požadavku. Frontend z tokenu potřebuje dvě věci,
// kdy vyprší (`exp`, ať admina pošle na login dřív, než mu selže uložení) a e-mail do lišty.

export const TOKEN_KEY = 'token'

// JWT má tři části oddělené tečkou, prostřední je JSON v base64url. To není totéž co
// base64, který čte atob(): místo `+` a `/` má `-` a `_` a chybí mu `=` na konci. Dřívější
// atob(parts[1]) proto u části tokenů selhal a admin byl odhlášen bez důvodu. TextDecoder
// kvůli diakritice: atob vrací bajty, ne znaky.
export function readTokenPayload(token) {
    if (typeof token !== 'string') return null
    const part = token.split('.')[1]
    if (!part) return null
    try {
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
        const bytes = Uint8Array.from(atob(base64), ch => ch.charCodeAt(0))
        const payload = JSON.parse(new TextDecoder().decode(bytes))
        return payload && typeof payload === 'object' ? payload : null
    } catch {
        return null
    }
}

// Platný = dá se přečíst a ještě nevypršel. `now` v sekundách, jako `exp` v JWT.
export function isSessionValid(payload, now = Date.now() / 1000) {
    if (!payload) return false
    if (typeof payload.exp !== 'number') return true
    return payload.exp > now
}

function readToken() {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

// Aktuální relace: { email } nebo null.
export function currentSession() {
    const payload = readTokenPayload(readToken())
    if (!isSessionValid(payload)) return null
    return { email: typeof payload.email === 'string' ? payload.email : null }
}

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
}

// Odhlášení = zahodit token. Do 2026-10-29 tlačítko Odhlásit jen přesměrovalo na login
// a token zůstal uložený, takže návrat na /admin/dashboard admina pustil zpátky.
export function signOut() {
    try {
        localStorage.removeItem(TOKEN_KEY)
    } catch {
        // soukromé okno bez úložiště: token tam ani nebyl
    }
}
