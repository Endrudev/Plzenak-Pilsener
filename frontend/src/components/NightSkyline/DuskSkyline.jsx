import { seeded, pediment, bellGable, steppedGable } from './cityscape.js'

// Tři řady střech pro patičku, odspodu od nejtmavší po nejsvětlejší: přední a
// nejnižší má barvu patičky (splývá s ní bez švu), prostřední je tmavě rezavá,
// zadní a nejvyšší je nejsvětlejší a nahoře se průhledností rozplývá do pozadí
// stránky, takže nevisí jako oddělený pás. Domy se v každé řadě
// dotýkají a střechy jsou převážně sedlové, doplněné štíty schodovitými a
// zvonovitými, komíny a vikýři. Kresba vychází z reference autora (2026-10-05).
//
// Kreslí se do pevného plátna VIEW_W x HEIGHT bez natahování: svg má skutečnou
// velikost v pixelech a rodič ho vystředí a ořízne, takže na telefonu je vidět
// prostřední výřez a na širokém monitoru se nic neroztáhne do šířky. Barvy řad a
// oken jsou tokeny, definuje je CSS (Footer.css), tvar generují seedy.

const VIEW_W = 2400
const HEIGHT = 200
const OVERLAP = 0.5

const ROOF_POOL = ['gable', 'gable', 'gable', 'gable', 'flat', 'stepped', 'bell', 'parapet']

function layer(seed, { minW, maxW, minH, maxH }) {
    const rand = seeded(seed)
    const out = []
    let x = -24
    while (x < VIEW_W + 24) {
        const w = minW + rand() * (maxW - minW)
        const h = minH + rand() * (maxH - minH)
        const roof = ROOF_POOL[Math.floor(rand() * ROOF_POOL.length)]
        const roofH = roof === 'gable' ? 10 + rand() * 18 : roof === 'flat' || roof === 'parapet' ? 0 : 9 + rand() * 12
        out.push({ x, w, h, roof, roofH, chimney: roof === 'gable' && rand() < 0.28, dormer: roof === 'gable' && w > 38 && rand() < 0.3 })
        x += w - OVERLAP
    }
    return out
}

function roofD(b) {
    const cx = b.x + b.w / 2
    const y = HEIGHT - b.h
    if (b.roof === 'gable') return pediment(cx, y, b.w / 2 + 1, b.roofH)
    if (b.roof === 'bell') return bellGable(cx, y, b.w / 2, b.roofH)
    if (b.roof === 'stepped') return steppedGable(cx, y, b.w / 2, 3, b.roofH / 3)
    return ''
}

function layerPath(buildings) {
    let d = ''
    buildings.forEach(b => {
        const top = HEIGHT - b.h
        d += `M${b.x.toFixed(1)} ${HEIGHT} V${top.toFixed(1)} H${(b.x + b.w).toFixed(1)} V${HEIGHT} Z `
        d += roofD(b) + ' '
        if (b.roof === 'parapet') d += `M${(b.x - 1).toFixed(1)} ${top.toFixed(1)} V${(top - 3).toFixed(1)} H${(b.x + b.w + 1).toFixed(1)} V${top.toFixed(1)} Z `
        if (b.chimney) d += `M${(b.x + b.w * 0.7).toFixed(1)} ${(top - b.roofH * 0.55).toFixed(1)} v-9 h5 v9 Z `
        if (b.dormer) {
            const dx = b.x + b.w / 2 - 5
            d += `M${dx.toFixed(1)} ${top.toFixed(1)} v-9 h10 v9 Z M${(dx - 1).toFixed(1)} ${(top - 9).toFixed(1)} l6 -5 l6 5 Z `
        }
    })
    return d
}

// Okna: mřížka uvnitř těla, část nesvítí. Zadní řada má jich málo a malá.
function windows(buildings, rand, { winW, winH, stepX, stepY, margin, lit }) {
    const rects = []
    buildings.forEach(b => {
        const innerW = b.w - margin * 2
        const innerH = b.h - margin - 7
        if (innerW < winW || innerH < winH) return
        const cols = Math.max(1, Math.floor(innerW / stepX))
        const rows = Math.max(1, Math.floor(innerH / stepY))
        const gapX = innerW / cols
        const gapY = innerH / rows
        for (let c = 0; c < cols; c += 1) {
            for (let r = 0; r < rows; r += 1) {
                if (rand() > lit) continue
                rects.push({
                    x: b.x + margin + gapX * (c + 0.5) - winW / 2,
                    y: HEIGHT - b.h + margin + gapY * (r + 0.5) - winH / 2,
                    w: winW,
                    h: winH,
                })
            }
        }
    })
    return rects
}

const BACK = layer(53, { minW: 30, maxW: 64, minH: 112, maxH: 168 })
const MID = layer(29, { minW: 34, maxW: 70, minH: 82, maxH: 134 })
const FRONT = layer(13, { minW: 38, maxW: 84, minH: 56, maxH: 100 })

const BACK_WIN = windows(BACK, seeded(7), { winW: 3, winH: 4.5, stepX: 14, stepY: 17, margin: 6, lit: 0.18 })
const MID_WIN = windows(MID, seeded(11), { winW: 4, winH: 6, stepX: 15, stepY: 18, margin: 7, lit: 0.34 })
const FRONT_WIN = windows(FRONT, seeded(17), { winW: 5, winH: 7, stepX: 16, stepY: 19, margin: 8, lit: 0.6 })

function Windows({ list, className }) {
    return (
        <g className={className}>
            {list.map((w, i) => <rect key={i} x={w.x.toFixed(1)} y={w.y.toFixed(1)} width={w.w} height={w.h} />)}
        </g>
    )
}

export default function DuskSkyline({ className = '' }) {
    return (
        <svg className={className} width={VIEW_W} height={HEIGHT} viewBox={`0 0 ${VIEW_W} ${HEIGHT}`} aria-hidden="true">
            <defs>
                <linearGradient id="dusk-back-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" style={{ stopColor: 'var(--dusk-back)', stopOpacity: 0 }} />
                    <stop offset="0.55" style={{ stopColor: 'var(--dusk-back)', stopOpacity: 0.8 }} />
                    <stop offset="1" style={{ stopColor: 'var(--dusk-back)', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <path className="dusk-back" d={layerPath(BACK)} fill="url(#dusk-back-fade)" />
            <Windows list={BACK_WIN} className="dusk-win dusk-win--back" />
            <path className="dusk-mid" d={layerPath(MID)} />
            <Windows list={MID_WIN} className="dusk-win dusk-win--mid" />
            <path className="dusk-front" d={layerPath(FRONT)} />
            <Windows list={FRONT_WIN} className="dusk-win dusk-win--front" />
        </svg>
    )
}
