// Odkud renderer bere index.html (a manifest) z buildu frontendu (rozhodnuto
// 2026-10-19: backend si ho stáhne z Nginxu, image zůstanou nezávislé).
//
// Proč se soubor nepamatuje naslepo: `docker compose up` restartuje jen kontejnery,
// jejichž image se změnil. Když se změní jen frontend, backend běží dál a jeho kopie
// index.html by odkazovala na /assets/index-STARÝ.js, který v novém frontendu už
// není: bílá stránka. Původně se proto šablona stahovala znovu po 60 s, jenže to
// znamenalo až minutu rozbitých stránek po každém nasazení frontendu (zjištěno
// 2026-10-20 při testu, kdy se restartoval jen frontend).
//
// Teď se backend ptá při každém požadavku, ale podmíněně: pošle If-None-Match
// s ETagem posledního souboru a Nginx odpoví 304 bez obsahu, když se nic nezměnilo.
// Po vnitřní síti Dockeru je to zlomek milisekundy. `ttlMs` (krátké okno bez
// dotazu) jen brání tomu, aby každý požadavek při náporu dělal další.
//
// Když dotaz selže (frontend se zrovna restartuje), použije se poslední dobrá
// kopie. Bez ní chyba, routa pak vrátí 503 a Nginx statický index.html.
//
// fetchFn a now jdou podstrčit, aby šlo chování otestovat bez sítě a hodin.
function createTemplateSource({ url, ttlMs = 1_000, timeoutMs = 2_000, fetchFn = fetch, now = Date.now }) {
    let cached = null
    let etag = null
    let checkedAt = 0

    return async function getTemplate() {
        if (cached && now() - checkedAt < ttlMs) return cached
        try {
            const headers = cached && etag ? { 'If-None-Match': etag } : {}
            const res = await fetchFn(url, { headers, signal: AbortSignal.timeout(timeoutMs) })
            if (res.status === 304 && cached) {
                checkedAt = now()
                return cached
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            cached = await res.text()
            etag = res.headers?.get?.('etag') ?? null
            checkedAt = now()
        } catch (err) {
            if (!cached) throw new Error(`Šablonu ${url} nejde stáhnout: ${err.message}`)
            console.error(`Šablonu ${url} nejde stáhnout, používám starší kopii: ${err.message}`)
            checkedAt = now()
        }
        return cached
    }
}

module.exports = { createTemplateSource }
