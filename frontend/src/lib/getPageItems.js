// Vypočítá, co se má zobrazit v číselné řadě stránkování — vždy první,
// poslední, aktuální stránku a okolí kolem aktuální, mezery nahrazené '...'.
//
// Nahrazuje dřívější getPaginationItems() z Events.jsx, která nad 6 stránkami
// natvrdo vracela [1,2,3,4,'...',poslední] — na stránku 5+ se tak nikdy nedalo
// kliknout, protože se v řadě vůbec neobjevila.
export function getPageItems(page, totalPages, windowSize = 1) {
    if (totalPages <= 1) return [1]

    const current = Math.min(Math.max(1, page), totalPages)

    // Krátká řada (okraj + okno + druhý okraj a ještě trochu) se vždy vejde
    // celá bez '...' — sbalovat jedno jediné schované číslo nemá smysl,
    // '...' zabere stejně místa jako to číslo samo.
    if (totalPages <= 2 * windowSize + 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const keep = new Set([1, totalPages, current])
    for (let i = current - windowSize; i <= current + windowSize; i++) {
        if (i >= 1 && i <= totalPages) keep.add(i)
    }

    const sorted = [...keep].sort((a, b) => a - b)
    const items = []
    let prev = null
    for (const n of sorted) {
        if (prev !== null && n - prev > 1) items.push('...')
        items.push(n)
        prev = n
    }
    return items
}
