// Pomocné funkce kalendáře v admin formulářích (vytvoření a úprava akce).
// Dřív je měl každý formulář zkopírované u sebe.

// Překlad měsíců a dnů pro kalendářový popup. Týden začíná pondělím.
export const MONTHS = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec']
export const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

// Převedení datumu na český formát (bez nul vpředu — 5.3.2026).
export function toCzech(date) {
    if (!date) return ''
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

// Porovnání Date objektů podle kalendářního dne, čas se ignoruje. Při chybějícím
// argumentu vrací falsy hodnotu (null/undefined), ne false — volající ji používá
// jen v podmínkách.
export function isSameDay(a, b) {
    return (
        a && b &&
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
    )
}

// Vytvoření pole Date objektů pro popup kalendář. Před prvním dnem měsíce je
// tolik `null`, aby první den spadl do správného sloupce (pondělí = 0).
export function buildCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const offset = (firstDay + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < offset; i++)
        cells.push(null)
    for (let d = 1; d <= daysInMonth; d++)
        cells.push(new Date(year, month, d))
    return cells
}
