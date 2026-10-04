import { seeded, pediment, bellGable, steppedGable } from './cityscape.js'

// Sdílená procedurální siluета budov — vytažená z patičky (Footer.jsx byl
// první, kdo tohle potřeboval), teď ji používá i sekce Hledání na Home.jsx.
// Barvy si každé použití nastavuje samo přes CSS (viz `className` — cílí
// na `.skyline-mass`/`.skyline-mass--back`/`.skyline-window` uvnitř), tvar
// a generování je ale doslova stejné na obou místech.

const VIEW_W = 1440
const BASE_Y = 90
const ROOFS = ['flat', 'flat', 'pediment', 'bell', 'stepped', 'parapet']

// dense = pozadí za hlavní řadou: menší rozptyl šířky, skoro žádné velké
// mezery, ať to za předním plánem čte jako plnější, hustší město.
//
// packed = budovy stojí těsně vedle sebe, každá se dotýká obou sousedů (bez
// mezery a bez překryvu, jen o půl pixelu přesah, aby mezi dvěma sousedními
// obdélníky nezůstala při antialiasingu světlá ryska).
const PACK_OVERLAP = 0.5

function buildSilhouette(seed, { minW = 26, maxW = 90, minH = 20, maxH = 66, dense = false, packed = false } = {}) {
    const rand = seeded(seed)
    const buildings = []
    let x = -10
    while (x < VIEW_W + 10) {
        // Širší rozptyl šířky/výšky, ať se vedle sebe potkají nízké řadovky
        // i užší vyšší domy, ne jen jedna průměrná velikost pořád dokola.
        const w = minW + rand() * (maxW - minW)
        const bodyH = minH + rand() * (maxH - minH)
        const roof = ROOFS[Math.floor(rand() * ROOFS.length)]
        const roofH = roof === 'flat' || roof === 'parapet' ? 0 : 8 + rand() * 14
        buildings.push({ x, w, bodyH, roof, roofH, chimney: roof === 'flat' && rand() < 0.3 })

        // Mezery jsou schválně nepravidelné, ne jedna průměrná rozteč pořád
        // dokola: občas se budovy mírně překryjí (jedna stojí kousek před
        // druhou), jinde stojí těsně vedle sebe, jinde je mezi nimi vidět
        // širší kus oblohy — jak to na skutečné siluetě bývá. Zadní (husté)
        // řadě se ty velké mezery vůbec nepovolí.
        const gapRoll = rand()
        const gap = packed
            ? -PACK_OVERLAP
            : dense
                ? (gapRoll < 0.4 ? -(2 + rand() * 6) : rand() * 4)
                : gapRoll < 0.2 ? -(4 + rand() * 10)   // mírný překryv
                    : gapRoll < 0.55 ? rand() * 6         // těsně vedle sebe
                        : 8 + rand() * 26                     // širší mezera
        x += w + gap
    }
    return buildings
}

function roofPath(b) {
    const cx = b.x + b.w / 2
    const y = BASE_Y - b.bodyH
    if (b.roof === 'pediment') return pediment(cx, y, b.w / 2, b.roofH)
    if (b.roof === 'bell') return bellGable(cx, y, b.w / 2, b.roofH)
    if (b.roof === 'stepped') return steppedGable(cx, y, b.w / 2, 3, b.roofH / 3)
    return ''
}

// Okna jedné budovy: mřížka vycentrovaná uvnitř těla (ne střechy) s okrajem
// ze všech stran, pár namátkou nesvítí (`rand() < .3`), ať to nepůsobí
// jako děrovačka.
function buildingWindows(building, rand) {
    const marginX = 7
    const marginTop = 10
    const marginBottom = 6
    const winW = 4
    const winH = 6

    const innerW = building.w - marginX * 2
    const innerH = building.bodyH - marginTop - marginBottom
    if (innerW < winW || innerH < winH) return []

    const cols = Math.max(1, Math.round(innerW / 15))
    const rows = Math.max(1, Math.round(innerH / 17))
    const stepX = innerW / cols
    const stepY = innerH / rows

    const rects = []
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (rand() < 0.3) continue
            rects.push({
                x: building.x + marginX + stepX * (c + 0.5) - winW / 2,
                y: BASE_Y - building.bodyH + marginTop + stepY * (r + 0.5) - winH / 2,
            })
        }
    }
    return rects
}

// Jedna budova (tělo + střecha + volitelně vlastní okna) jako jeden celek
// — když se dvě budovy mírně překryjí, ta pozdější (bližší, kreslená
// později) tak správně zakryje i okna té za ní, ne jen její zeď.
function Building({ b, massClass, windows }) {
    return (
        <g>
            <g className={massClass}>
                <rect x={b.x} y={BASE_Y - b.bodyH} width={b.w} height={b.bodyH} />
                {b.roofH > 0 && <path d={roofPath(b)} />}
                {b.roof === 'parapet' && (
                    <rect x={b.x - 1} y={BASE_Y - b.bodyH - 3} width={b.w + 2} height="3" />
                )}
                {b.chimney && (
                    <rect x={b.x + b.w * 0.68} y={BASE_Y - b.bodyH - 10} width="5" height="12" />
                )}
            </g>
            {windows && (
                <g className="skyline-window">
                    {windows.map((w, wi) => (
                        <rect key={wi} x={w.x} y={w.y} width="4" height="6" />
                    ))}
                </g>
            )}
        </g>
    )
}

// className jde na kořenové <svg> — barvy (.skyline-mass/--back/.skyline-window)
// si podle něj definuje CSS toho, kdo komponentu použije (viz Footer.css,
// Home.css). backSeed/frontSeed/winSeed drží dvě použití vizuálně odlišná
// (jiné rozestavění budov), i když je generují úplně stejné funkce.
//
// packed: obě řady jsou souvislé (budovy se dotýkají), zadní řada je jen plná
// silueta bez oken a v jiné barvě (.skyline-mass--back si barvu bere z CSS).
// Zadní řada je vyšší než přední (min. výška 34 proti 20), takže nad ní kouká
// a čte se jako druhý plán, ne jako zdvojení první.
export default function BuildingSkyline({ className = '', backSeed = 31, frontSeed = 7, winSeed = 23, packed = false }) {
    const backBuildings = packed
        ? buildSilhouette(backSeed, { minW: 22, maxW: 64, minH: 34, maxH: 66, packed: true })
        : buildSilhouette(backSeed, { minW: 16, maxW: 46, minH: 16, maxH: 58, dense: true })
    const frontBuildings = buildSilhouette(frontSeed, { packed })
    const winRand = seeded(winSeed)

    return (
        <svg className={className} viewBox={`0 0 ${VIEW_W} ${BASE_Y}`} preserveAspectRatio="none" aria-hidden="true">
            {backBuildings.map((b, i) => (
                <Building key={`back-${i}`} b={b} massClass="skyline-mass skyline-mass--back" />
            ))}
            {frontBuildings.map((b, i) => (
                <Building key={`front-${i}`} b={b} massClass="skyline-mass" windows={buildingWindows(b, winRand)} />
            ))}
        </svg>
    )
}
