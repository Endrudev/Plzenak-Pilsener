// Popisky dne a víkendu pro stránky /dnes a /tento-vikend (serverový renderer).
//
// KOPIE frontend/src/lib/events/dayLabels.js: frontend nastavuje stejný text po
// přechodu mezi stránkami, server ho posílá první stránce. Backend image
// frontend neobsahuje, proto kopie. Test seo.test.js načte oba soubory a
// hlídá, že dávají stejný výsledek. Při změně upravit oba.

const ZONE = 'Europe/Prague'

// Kalendářní den v Praze jako { y, m, d, weekday } (weekday: 1 = pondělí … 7 = neděle).
function pragueDay(now = new Date()) {
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
function todayLabel(now = new Date()) {
    const day = pragueDay(now)
    return `${WEEKDAYS[day.weekday - 1]} ${day.d}. ${MONTHS[day.m - 1]} ${day.y}`
}

// Nejbližší víkend stejně jako filtr datum=vikend v SQL: od pondělí do soboty
// je to nadcházející (nebo dnešní) sobota a neděle, v neděli jen ta neděle.
//   "sobota 24. a neděle 25. října 2026"
//   "sobota 31. října a neděle 1. listopadu 2026"
//   "neděle 25. října 2026"
function weekendLabel(now = new Date()) {
    const today = pragueDay(now)
    if (today.weekday === 7) return todayLabel(now)
    const sat = shift(today, 6 - today.weekday)
    const sun = shift(sat, 1)
    const satPart = sat.m === sun.m ? `${sat.d}.` : `${sat.d}. ${MONTHS[sat.m - 1]}${sat.y === sun.y ? '' : ` ${sat.y}`}`
    return `sobota ${satPart} a neděle ${sun.d}. ${MONTHS[sun.m - 1]} ${sun.y}`
}

// Úvodní věta stránek /dnes a /tento-vikend (server ji dává i do meta description).
function todayIntro(now = new Date()) {
    return `Akce v Plzni dnes, ${todayLabel(now)}: koncerty, divadlo, výstavy a další program na jednom místě.`
}

function weekendIntro(now = new Date()) {
    return `Akce v Plzni o víkendu, ${weekendLabel(now)}: koncerty, divadlo, výstavy, akce pro děti a další program.`
}

module.exports = { pragueDay, todayLabel, weekendLabel, todayIntro, weekendIntro }
