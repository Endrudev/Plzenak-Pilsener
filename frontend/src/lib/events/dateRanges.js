import { parseCzechDate } from './eventBadge.js'

// Pomocné funkce pro landing: rozdělení akcí na „dnes", „víkend" a „týden" a
// rozklad data na části pro velké číslo dne na kartě.
//
// Všechno bere `today` jako parametr, ne new Date() uvnitř, ze stejného
// důvodu jako eventBadge: ať jdou funkce testovat bez závislosti na tom, kdy
// testy zrovna běží.

const MONTHS = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro']
const WEEKDAYS = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so']

export const RANGES = [
    { value: 'dnes', label: 'Dnes' },
    { value: 'vikend', label: 'Víkend' },
    { value: 'tyden', label: 'Týden' },
]

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Počet dní od dneška do dne akce. Záporné číslo = akce už proběhla.
// Null, když datum nejde přečíst.
export function daysFromToday(value, today = new Date()) {
    const parsed = parseCzechDate(value)
    if (!parsed) return null
    return Math.round((startOfDay(parsed) - startOfDay(today)) / 86400000)
}

// „Víkend" = sobota nebo neděle v nejbližších sedmi dnech. Mimo víkend, v pátek
// večer nebo v pondělí, tak ukazuje ten nejbližší, ne ten, co už proběhl.
export function inRange(value, range, today = new Date()) {
    const diff = daysFromToday(value, today)
    if (diff === null || diff < 0) return false

    if (range === 'dnes') return diff === 0
    if (range === 'tyden') return diff <= 6
    if (range === 'vikend') {
        const weekday = parseCzechDate(value).getDay()
        return diff <= 6 && (weekday === 6 || weekday === 0)
    }
    return false
}

// Jen akce, které ještě neproběhly, v pořadí, v jakém je vrátilo API.
export function upcoming(events, today = new Date()) {
    return events.filter(event => {
        const diff = daysFromToday(event.date, today)
        return diff !== null && diff >= 0
    })
}

// { day: '4', month: 'říj', weekday: 'so' } pro dlaždici s datem.
export function dayParts(value) {
    const parsed = parseCzechDate(value)
    if (!parsed) return null
    return {
        day: String(parsed.getDate()),
        month: MONTHS[parsed.getMonth()],
        weekday: WEEKDAYS[parsed.getDay()],
    }
}
