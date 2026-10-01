// Sestaví inline style pro pozadí z URL obrázku akce.
//
// Proč to není napsané inline na čtyřech místech: URL se musí normalizovat.
// Kdyby v ní zůstala mezera (a ta se tam dostane, když má nahraný soubor mezeru
// v názvu), je `url(...)` nevalidní CSS a prohlížeč **tiše zahodí celou
// deklaraci** — obrázek se nezobrazí a v konzoli není nic.
//
// Normalizuje se konstruktorem URL, ne encodeURI: encodeURI escapuje i znak `%`,
// takže by už zakódovanou adresu zakódoval podruhé (`%20` → `%2520`) a rozbil ji.
// URL konstruktor mezeru zakóduje a existující escape sekvence nechá být.
// Když adresa není platná (relativní cesta, nesmysl v DB), použije se, jak je —
// pořád je to lepší než spadnout.
export function imageBackground(url) {
    if (!url) return undefined

    let normalized = url
    try {
        normalized = new URL(url).href
    } catch {
        // ponecháme původní hodnotu
    }

    return { backgroundImage: `url("${normalized}")` }
}
