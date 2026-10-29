import { daysFromToday } from '../events/dateRanges.js'
import { TOP_TAG } from '../events/eventTags.js'

// Filtrování, řazení a souhrn seznamu akcí v administraci. Seznam přichází celý
// (GET /api/events/admin, i proběhlé akce) a všechno ostatní se počítá tady, v prohlížeči.
// `today` je parametr, ať jdou funkce testovat bez ohledu na to, kdy testy běží.

export const PERIODS = [
    { value: 'upcoming', label: 'Nadcházející' },
    { value: 'past', label: 'Proběhlé' },
    { value: 'all', label: 'Vše' },
]

// Hledání bez ohledu na velikost písmen a diakritiku: „plzen“ najde „Plzeň“.
// NFD rozloží „ň“ na „n“ + háček a háček se pak smaže.
export function fold(text) {
    return String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function matchesPeriod(diff, period) {
    if (period === 'all') return true
    // Akce s nečitelným datem patří mezi nadcházející, aby se neztratila z výchozího pohledu.
    if (diff === null) return period === 'upcoming'
    return period === 'past' ? diff < 0 : diff >= 0
}

// Nadcházející od nejbližší, proběhlé i „Vše“ od nejnovějšího data. Bez data na konec.
function compare(period) {
    return (a, b) => {
        if (a.diff === null || b.diff === null) return (a.diff === null) - (b.diff === null)
        return period === 'upcoming' ? a.diff - b.diff : b.diff - a.diff
    }
}

export function filterAdminEvents(events, { q = '', period = 'upcoming', category = '' } = {}, today = new Date()) {
    const needle = fold(q)
    return events
        .map(event => ({ event, diff: daysFromToday(event.date, today) }))
        .filter(({ event, diff }) => {
            if (!matchesPeriod(diff, period)) return false
            if (category && !event.tags?.includes(category)) return false
            if (!needle) return true
            return fold(event.name).includes(needle) || fold(event.location).includes(needle)
        })
        .sort(compare(period))
        .map(({ event }) => event)
}

// Čísla nad seznamem. Všechna se týkají nadcházejících akcí, protože na nich se dá ještě
// něco změnit: kolik jich je, kolik je v nejbližších 7 dnech, kolik je TOP a kolika chybí
// fotka (importované akce bez obrázku mají jen gradient kategorie).
export function adminStats(events, today = new Date()) {
    const stats = { upcoming: 0, week: 0, top: 0, noImage: 0 }
    for (const event of events) {
        const diff = daysFromToday(event.date, today)
        if (diff === null || diff < 0) continue
        stats.upcoming++
        if (diff <= 6) stats.week++
        if (event.tags?.includes(TOP_TAG)) stats.top++
        if (!event.imageUrl) stats.noImage++
    }
    return stats
}
