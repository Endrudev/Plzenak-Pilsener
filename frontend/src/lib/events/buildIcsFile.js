// Sestaví obsah .ics souboru (RFC 5545) pro tlačítko "Do kalendáře" na
// Detail akce. Čistá funkce bez vedlejších efektů (žádné stahování,
// žádný DOM) — to dělá volající (EventDetail.jsx), tahle jen vrací
// { filename, content } nebo null, když se datum nedá rozparsovat.
//
// event.date je 'DD.MM.YYYY', event.startTime 'HH:MM' nebo null (od
// migrace 009). Akce s časem je událost od té hodiny, zapsaná v UTC, aby ji
// kalendář umístil správně i v telefonu nastaveném na jiné pásmo. Konec
// akce neznáme, proto pevné 2 hodiny: bez konce by ji kalendáře ukázaly
// jako bod bez délky. Akce bez času zůstává celodenní (VALUE=DATE), žádný
// vymyšlený čas.

function pad(n) {
    return String(n).padStart(2, '0')
}

// Escapování textových polí podle RFC 5545 — zpětné lomítko, středník a
// čárka mají v .ics syntaktický význam, konec řádku se zapisuje jako
// doslovné "\n", ne skutečný nový řádek (ten by rozbil strukturu souboru).
function escapeIcsText(value) {
    return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r\n|\r|\n/g, '\\n')
}

// Řádky delší než 75 znaků se podle specifikace lomí — pokračovací řádek
// začíná mezerou. Dlouhý popis akce by se bez tohodle mohl v některých
// kalendářních aplikacích useknout nebo selhat při importu.
function foldLine(line) {
    const max = 75
    if (line.length <= max) return line
    const parts = []
    let rest = line
    while (rest.length > max) {
        parts.push(rest.slice(0, max))
        rest = ' ' + rest.slice(max)
    }
    parts.push(rest)
    return parts.join('\r\n')
}

function parseDate(dateStr) {
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateStr || '')
    if (!m) return null
    const [, d, mo, y] = m
    return { y: Number(y), mo: Number(mo), d: Number(d) }
}

// DTEND je podle specifikace EXKLUZIVNÍ — jednodenní událost 21.09. proto
// potřebuje DTEND 22.09., ne 21.09. Počítá se přes Date.UTC, ať se správně
// přenese přetečení měsíce/roku (31.12. + 1 den → 1.1. dalšího roku).
function nextDay({ y, mo, d }) {
    const dt = new Date(Date.UTC(y, mo - 1, d + 1))
    return { y: dt.getUTCFullYear(), mo: dt.getUTCMonth() + 1, d: dt.getUTCDate() }
}

function toDateStamp({ y, mo, d }) {
    return `${y}${pad(mo)}${pad(d)}`
}

// Okamžik začátku v UTC jako 'YYYYMMDDTHHMMSSZ'. Čas akce je pražský, posun
// proti UTC závisí na datu (letní čas): nejdřív se místní čas zkusmo vezme
// jako UTC, zjistí se posun Prahy v tu chvíli a s ním se okamžik přepočítá.
// Druhé měření posunu pokryje noci, kdy se mění čas. Stejný postup má
// backend pro JSON-LD (backend/src/lib/eventDate.js).
const PRAGUE = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Prague', timeZoneName: 'longOffset' })

function pragueOffsetMinutes(instant) {
    const name = PRAGUE.formatToParts(instant).find(p => p.type === 'timeZoneName').value
    const m = /^GMT([+-])(\d{2}):(\d{2})$/.exec(name)
    return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0
}

function pragueToUtc({ y, mo, d }, time) {
    const [h, mi] = time.split(':').map(Number)
    const guess = Date.UTC(y, mo - 1, d, h, mi)
    const first = pragueOffsetMinutes(new Date(guess))
    return new Date(guess - pragueOffsetMinutes(new Date(guess - first * 60_000)) * 60_000)
}

function toUtcStamp(date) {
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
        + `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
}

const TIMED_DURATION_MS = 2 * 60 * 60 * 1000

// Neháčkovaný, bezpečný název souboru z názvu akce (fallback "akce", když
// by po očištění nezbylo nic — např. název čistě v emoji).
function slugifyFilename(name) {
    const slug = String(name || '')
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
    return slug || 'akce'
}

export function buildIcsFile(event) {
    const start = parseDate(event?.date)
    if (!start) return null

    const stamp = toUtcStamp(new Date())

    let when
    if (/^\d{2}:\d{2}$/.test(event.startTime ?? '')) {
        const begin = pragueToUtc(start, event.startTime)
        when = [`DTSTART:${toUtcStamp(begin)}`, `DTEND:${toUtcStamp(new Date(begin.getTime() + TIMED_DURATION_MS))}`]
    } else {
        when = [`DTSTART;VALUE=DATE:${toDateStamp(start)}`, `DTEND;VALUE=DATE:${toDateStamp(nextDay(start))}`]
    }

    const descriptionText = Array.isArray(event.description) ? event.description.join('\n\n') : ''

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Plzenak//Event Hub//CS',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:event-${event.id}@plzenak.cz`,
        `DTSTAMP:${stamp}`,
        ...when,
        `SUMMARY:${escapeIcsText(event.name)}`,
    ]

    if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`)
    if (descriptionText) lines.push(`DESCRIPTION:${escapeIcsText(descriptionText)}`)
    if (event.url) lines.push(`URL:${escapeIcsText(event.url)}`)

    lines.push('END:VEVENT', 'END:VCALENDAR')

    const content = lines.map(foldLine).join('\r\n') + '\r\n'
    return { filename: `${slugifyFilename(event.name)}.ics`, content }
}
