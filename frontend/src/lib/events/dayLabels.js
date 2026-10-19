// Popisky dne a víkendu pro stránky /dnes a /tento-vikend: "pondělí 19. října 2026",
// "sobotu 24. a neděli 25. října 2026". Datum je v textu záměrně: stránka tak
// rovnou odpovídá na otázku "co se děje v Plzni dnes" a vyhledávač i AI vidí,
// že je obsah čerstvý.
//
// Stejné funkce má serverový renderer (backend/src/lib/seo/dayLabels.js), test
// v backendu hlídá, že dávají stejný výsledek. Soubor proto nesmí nic importovat
// (backend ho načítá přes import()).
//
// Den se počítá v pražském čase, stejně jako filtry v databázi
// (backend/src/lib/eventsQuery.js, TODAY).

const ZONE = 'Europe/Prague'

// Kalendářní den v Praze jako { y, m, d, weekday } (weekday: 1 = pondělí … 7 = neděle).
export function pragueDay(now = new Date()) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', { timeZone: ZONE, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' })
            .formatToParts(now)
            .map(p => [p.type, p.value])
    )
    const weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday) + 1
    return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day), weekday }
}

// Den posunutý o `days` (počítá se v UTC, takže přechod na letní čas nevadí).
function shift({ y, m, d }, days) {
    const date = new Date(Date.UTC(y, m - 1, d + days))
    const weekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay()
    return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate(), weekday }
}

const MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince']
// 4. pád ("v pondělí", "na sobotu") se tu nepoužívá, věty jsou postavené na 1. pádu.
const WEEKDAYS = ['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota', 'neděle']

// "pondělí 19. října 2026"
export function todayLabel(now = new Date()) {
    const day = pragueDay(now)
    return `${WEEKDAYS[day.weekday - 1]} ${day.d}. ${MONTHS[day.m - 1]} ${day.y}`
}

// Nejbližší víkend stejně jako filtr datum=vikend v SQL: od pondělí do soboty
// je to nadcházející (nebo dnešní) sobota a neděle, v neděli jen ta neděle.
//   "sobota 24. a neděle 25. října 2026"
//   "sobota 31. října a neděle 1. listopadu 2026"
//   "neděle 25. října 2026"
export function weekendLabel(now = new Date()) {
    const today = pragueDay(now)
    if (today.weekday === 7) return todayLabel(now)
    const sat = shift(today, 6 - today.weekday)
    const sun = shift(sat, 1)
    const satPart = sat.m === sun.m ? `${sat.d}.` : `${sat.d}. ${MONTHS[sat.m - 1]}${sat.y === sun.y ? '' : ` ${sat.y}`}`
    return `sobota ${satPart} a neděle ${sun.d}. ${MONTHS[sun.m - 1]} ${sun.y}`
}

// Úvodní věta stránek /dnes a /tento-vikend (server ji dává i do meta description).
export function todayIntro(now = new Date()) {
    return `Akce v Plzni dnes, ${todayLabel(now)}: koncerty, divadlo, výstavy a další program na jednom místě.`
}

export function weekendIntro(now = new Date()) {
    return `Akce v Plzni o víkendu, ${weekendLabel(now)}: koncerty, divadlo, výstavy, akce pro děti a další program.`
}
