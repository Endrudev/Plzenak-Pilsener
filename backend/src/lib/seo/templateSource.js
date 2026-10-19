// Odkud renderer bere index.html z buildu frontendu (rozhodnuto 2026-10-19:
// backend si ho stáhne z Nginxu, image zůstanou nezávislé).
//
// Proč se šablona nepamatuje navždy: `docker compose up` restartuje jen
// kontejnery, jejichž image se změnil. Když se změní jen frontend, backend běží
// dál a jeho kopie index.html by odkazovala na /assets/index-STARÝ.js, který už
// neexistuje: bílá stránka. Proto se šablona po `ttlMs` stáhne znovu.
//
// Když stažení selže (frontend se zrovna restartuje), použije se poslední
// dobrá kopie. Bez ní chyba, a routa pak vrátí 503 a Nginx statický index.html.
//
// fetchFn a now jdou podstrčit, aby šlo chování otestovat bez sítě a hodin.
function createTemplateSource({ url, ttlMs = 60_000, timeoutMs = 2_000, fetchFn = fetch, now = Date.now }) {
    let cached = null
    let fetchedAt = 0

    return async function getTemplate() {
        if (cached && now() - fetchedAt < ttlMs) return cached
        try {
            const res = await fetchFn(url, { signal: AbortSignal.timeout(timeoutMs) })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            cached = await res.text()
            fetchedAt = now()
        } catch (err) {
            if (!cached) throw new Error(`Šablonu ${url} nejde stáhnout: ${err.message}`)
            console.error(`Šablonu ${url} nejde stáhnout, používám starší kopii: ${err.message}`)
            // Další pokus až po dalším ttlMs, ať se při výpadku nestahuje při každém požadavku.
            fetchedAt = now()
        }
        return cached
    }
}

module.exports = { createTemplateSource }
