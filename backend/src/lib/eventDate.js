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

// Opačný směr pro pole `date` v API: '2026-03-05' → '05.03.2026'. Od migrace 007
// se textové datum v databázi neudržuje, frontend ho ale dál čte a zobrazuje.
// Vstup je text z pg (parser typu date v db/pool.js), nic jiného sem nechodí;
// cokoli jiného vrátí null.
function toCzechDate(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
    if (!match) return null
    const [, y, m, d] = match
    return `${d}.${m}.${y}`
}

// Čas začátku z formuláře nebo od importéru: 'H:MM' i 'HH:MM' → 'HH:MM'.
// Vrací null, když zápis nesedí nebo čas neexistuje (24:00, 19:60). Prázdnou
// hodnotu (akce bez času) rozlišuje routa sama, sem chodí jen vyplněná.
function toTime(value) {
    if (typeof value !== 'string') return null
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
    if (!match) return null
    const [h, m] = [Number(match[1]), Number(match[2])]
    if (h > 23 || m > 59) return null
    return `${String(h).padStart(2, '0')}:${match[2]}`
}

// Nepovinný čas z těla požadavku. Chybějící, null nebo prázdný řetězec = akce
// bez času ({ value: null }); cokoli jiného musí být platný čas, jinak { error }.
// Starý klient, který pole vůbec nezná, tak dál funguje.
function optionalTime(value) {
    if (value === undefined || value === null || value === '') return { value: null }
    const time = toTime(value)
    return time ? { value: time } : { error: 'Neplatný čas začátku, očekává se HH:MM.' }
}

// Sloupec typu time vrací pg jako text '19:00:00'. API posílá jen hodiny a minuty.
function fromDbTime(value) {
    const match = /^(\d{2}):(\d{2})/.exec(value ?? '')
    return match ? `${match[1]}:${match[2]}` : null
}

const PRAGUE_OFFSET = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Prague', timeZoneName: 'longOffset' })

// Posun Prahy proti UTC v daném okamžiku jako '+01:00' (zima) nebo '+02:00' (léto).
function offsetAt(instant) {
    const name = PRAGUE_OFFSET.formatToParts(instant).find(p => p.type === 'timeZoneName').value
    return name === 'GMT' ? '+00:00' : name.slice(3)
}

function offsetMinutes(offset) {
    const sign = offset.startsWith('-') ? -1 : 1
    return sign * (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(4, 6)))
}

// Datum a čas akce jako ISO 8601 s posunem, např. '2026-11-05T19:00:00+01:00'.
// Podle něj Google a kalendáře poznají skutečný okamžik začátku. Posun závisí
// na datu (letní čas), proto se nepíše natvrdo: nejdřív se místní čas zkusmo
// vezme jako UTC, zjistí se posun v tu chvíli a s ním se okamžik přepočítá
// a posun ověří ještě jednou (kvůli nocím, kdy se mění čas).
// Bez času vrací jen datum: JSON-LD akci bez známého času nepřidává půlnoc.
function pragueDateTime(isoDate, time) {
    if (!time) return isoDate
    const guess = new Date(`${isoDate}T${time}:00Z`)
    const first = offsetAt(guess)
    const offset = offsetAt(new Date(guess.getTime() - offsetMinutes(first) * 60_000))
    return `${isoDate}T${time}:00${offset}`
}

module.exports = { toIsoDate, toCzechDate, toTime, optionalTime, fromDbTime, pragueDateTime }
