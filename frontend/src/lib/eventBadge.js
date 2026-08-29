// Spočítá plaketu akce („Dnes" / „Zítra") z data konání.
//
// Proč se to počítá a neukládá: plaketa není vlastnost akce, ale vztah mezi
// datem konání a dneškem. Dřív to byly sloupce `badge` a `badge_type` v tabulce
// events — uložená hodnota by ale platila jen v den zápisu a nikdo by ji druhý
// den nepřepsal. Sloupce zrušila migrace 004, rozhodnuto 2026-08-29.
//
// Vrací null, když plaketa být nemá — volající pak nevykreslí nic.

// Datum v databázi je text ve tvaru d.m.rrrr (sloupec je `text`, ne `date` —
// pozůstatek první verze, vedený jako dluh). Rozebírá se ručně, protože
// new Date('1.5.2026') je v JS závislé na prohlížeči a locale.
function parseCzechDate(value) {
    if (typeof value !== 'string') return null
    const parts = value.split('.')
    if (parts.length !== 3) return null

    const [day, month, year] = parts.map(Number)
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return null

    const date = new Date(year, month - 1, day)
    if (Number.isNaN(date.getTime())) return null

    // Kontrola přetečení: new Date(2026, 1, 30) tiše vyrobí 2. března, takže
    // nesmyslné datum by prošlo jako platné. Porovnáním složek se to odhalí.
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null

    return date
}

// Počet celých dní mezi dvěma daty. Obě se srovnají na půlnoc místního času —
// bez toho by o výsledku rozhodovala denní doba (akce „dnes večer" by ráno
// vycházela jako 0 dní, odpoledne jako -1).
function daysBetween(from, to) {
    const a = new Date(from.getFullYear(), from.getMonth(), from.getDate())
    const b = new Date(to.getFullYear(), to.getMonth(), to.getDate())
    return Math.round((b - a) / 86400000)
}

// `today` je parametr, ne new Date() uvnitř, aby šla funkce testovat bez
// závislosti na tom, kdy testy zrovna běží.
export function eventBadge(date, today = new Date()) {
    const parsed = parseCzechDate(date)
    if (!parsed) return null

    const diff = daysBetween(today, parsed)
    if (diff === 0) return { text: 'Dnes', type: 'today' }
    if (diff === 1) return { text: 'Zítra', type: 'later' }
    return null
}
