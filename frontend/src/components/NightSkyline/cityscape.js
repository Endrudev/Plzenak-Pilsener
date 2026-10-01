export function seeded(seed) {
    let state = seed >>> 0
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0
        return state / 4294967296
    }
}

export function box(x, y, w, h) {
    return `M${r(x)} ${r(y)} V${r(y - h)} H${r(x + w)} V${r(y)} Z`
}

export function boxRev(x, y, w, h) {
    return `M${r(x)} ${r(y)} H${r(x + w)} V${r(y - h)} H${r(x)} V${r(y)} Z`
}

export function dormer(x, y, w, h) {
    return `${box(x, y, w, h)} ${pediment(x + w / 2, y - h, w / 2 + 1.5, h * 0.55)} ${boxRev(x + w * 0.25, y - h * 0.24, w * 0.5, h * 0.48)}`
}

export function oval(cx, cy, rx, ry) {
    return `M${r(cx - rx)} ${r(cy)} a${r(rx)} ${r(ry)} 0 1 0 ${r(rx * 2)} 0 a${r(rx)} ${r(ry)} 0 1 0 ${r(-rx * 2)} 0 Z`
}

export function hexagram(cx, cy, radius) {
    const tri = (rot) => {
        let d = ''
        for (let i = 0; i < 3; i++) {
            const a = rot + (i * 2 * Math.PI) / 3
            d += (i ? 'L' : 'M') + r(cx + Math.cos(a) * radius) + ' ' + r(cy + Math.sin(a) * radius) + ' '
        }
        return d + 'Z '
    }
    return tri(-Math.PI / 2) + tri(Math.PI / 2)
}

export function blobField({ seed, x, y, w, h, cols, rows, min, max }) {
    const rand = seeded(seed)
    const stepX = w / cols
    const stepY = h / rows
    let d = ''
    for (let c = 0; c < cols; c++) {
        for (let row = 0; row < rows; row++) {
            const rx = min + rand() * (max - min)
            const ry = Math.min(rx * (0.7 + rand() * 0.6), stepY * 0.42)
            const cx = x + stepX * (c + 0.5) + (rand() - 0.5) * stepX * 0.34
            const cy = y - stepY * (row + 0.5) + (rand() - 0.5) * stepY * 0.34
            d += oval(cx, cy, rx, ry) + ' '
        }
    }
    return d
}

export function gothic(x, y, w, h) {
    const shoulder = y - h + w / 2
    return `M${r(x)} ${r(y)} V${r(shoulder)} L${r(x + w / 2)} ${r(y - h)} L${r(x + w)} ${r(shoulder)} V${r(y)} Z`
}

export function arch(x, y, w, h) {
    const shoulder = y - h + w / 2
    return `M${r(x)} ${r(y)} V${r(shoulder)} A${r(w / 2)} ${r(w / 2)} 0 0 1 ${r(x + w)} ${r(shoulder)} V${r(y)} Z`
}

export function disc(cx, cy, radius) {
    return `M${r(cx - radius)} ${r(cy)} a${r(radius)} ${r(radius)} 0 1 0 ${r(radius * 2)} 0 a${r(radius)} ${r(radius)} 0 1 0 ${r(-radius * 2)} 0 Z`
}

export function ring(cx, cy, outer, inner) {
    return `M${r(cx - outer)} ${r(cy)} a${r(outer)} ${r(outer)} 0 1 0 ${r(outer * 2)} 0 a${r(outer)} ${r(outer)} 0 1 0 ${r(-outer * 2)} 0 Z`
        + `M${r(cx - inner)} ${r(cy)} a${r(inner)} ${r(inner)} 0 1 1 ${r(inner * 2)} 0 a${r(inner)} ${r(inner)} 0 1 1 ${r(-inner * 2)} 0 Z`
}

export function spokes(cx, cy, radius, count, width) {
    let d = ''
    for (let i = 0; i < count; i++) {
        const a = (Math.PI * i) / count
        const dx = Math.cos(a) * radius
        const dy = Math.sin(a) * radius
        const nx = (-Math.sin(a) * width) / 2
        const ny = (Math.cos(a) * width) / 2
        d += `M${r(cx - dx + nx)} ${r(cy - dy + ny)} L${r(cx + dx + nx)} ${r(cy + dy + ny)} `
            + `L${r(cx + dx - nx)} ${r(cy + dy - ny)} L${r(cx - dx - nx)} ${r(cy - dy - ny)} Z `
    }
    return d
}

export function star(cx, cy, size) {
    const a = size
    const b = size * 0.24
    return `M${r(cx)} ${r(cy - a)} L${r(cx + b)} ${r(cy - b)} L${r(cx + a)} ${r(cy)} L${r(cx + b)} ${r(cy + b)}`
        + ` L${r(cx)} ${r(cy + a)} L${r(cx - b)} ${r(cy + b)} L${r(cx - a)} ${r(cy)} L${r(cx - b)} ${r(cy - b)} Z`
}

export function crescent(cx, cy, radius, inner = 1.35) {
    const ir = radius * inner
    return `M${r(cx)} ${r(cy - radius)}`
        + ` A${r(radius)} ${r(radius)} 0 1 0 ${r(cx)} ${r(cy + radius)}`
        + ` A${r(ir)} ${r(ir)} 0 0 1 ${r(cx)} ${r(cy - radius)} Z`
}

export function grid({ x, y, w, h, cols, rows, gapX, gapY, shape = box }) {
    const cellW = (w - gapX * (cols - 1)) / cols
    const cellH = (h - gapY * (rows - 1)) / rows
    let d = ''
    for (let c = 0; c < cols; c++) {
        for (let row = 0; row < rows; row++) {
            d += shape(x + c * (cellW + gapX), y - row * (cellH + gapY), cellW, cellH) + ' '
        }
    }
    return d
}

export function sawtooth(x, y, w, h, teeth) {
    const step = w / teeth
    let d = `M${r(x)} ${r(y)}`
    for (let i = 0; i < teeth; i++) {
        d += ` L${r(x + i * step)} ${r(y - h)} L${r(x + (i + 1) * step)} ${r(y)}`
    }
    return d + ` H${r(x)} Z`
}

export function steppedGable(cx, y, halfWidth, steps, rise) {
    const run = halfWidth / steps
    let d = `M${r(cx - halfWidth)} ${r(y)}`
    for (let i = 1; i <= steps; i++) {
        d += ` V${r(y - i * rise)} H${r(cx - halfWidth + i * run)}`
    }
    for (let i = steps - 1; i >= 0; i--) {
        d += ` H${r(cx + halfWidth - i * run)} V${r(y - i * rise)}`
    }
    return d + ' Z'
}

export function bellGable(cx, y, halfWidth, height) {
    const k = halfWidth * 0.55
    return `M${r(cx - halfWidth)} ${r(y)}`
        + ` C${r(cx - halfWidth)} ${r(y - height * 0.45)} ${r(cx - k)} ${r(y - height * 0.52)} ${r(cx - k * 0.62)} ${r(y - height * 0.74)}`
        + ` C${r(cx - k * 0.3)} ${r(y - height)} ${r(cx + k * 0.3)} ${r(y - height)} ${r(cx + k * 0.62)} ${r(y - height * 0.74)}`
        + ` C${r(cx + k)} ${r(y - height * 0.52)} ${r(cx + halfWidth)} ${r(y - height * 0.45)} ${r(cx + halfWidth)} ${r(y)} Z`
}

export function pediment(cx, y, halfWidth, height) {
    return `M${r(cx - halfWidth)} ${r(y)} L${r(cx)} ${r(y - height)} L${r(cx + halfWidth)} ${r(y)} Z`
}

export function cityBlock({ seed, base, from, to, minW, maxW, minH, maxH, tight = 0.74, detail = true, floorStep = 15 }) {
    const rand = seeded(seed)
    const walls = []
    const roofs = []
    const cuts = []
    let x = from

    while (x < to) {
        const w = minW + rand() * (maxW - minW)
        const h = minH + rand() * (maxH - minH)
        const top = base - h
        const kind = rand()
        const roofH = kind < 0.6 ? Math.min(36, h * 0.26) : Math.min(22, h * 0.16)
        const eave = top + roofH

        walls.push(box(x, base, w, h - roofH))

        if (kind < 0.26) {
            roofs.push(pediment(x + w / 2, eave, w / 2 + 2, roofH))
            if (detail && w > 44) {
                const dx = x + w * (0.22 + rand() * 0.12)
                walls.push(box(dx, eave + 3, 11, 13))
                roofs.push(pediment(dx + 5.5, eave - 10, 8, 9))
                cuts.push(box(dx + 3, eave - 1, 5, 7))
                const dx2 = x + w * (0.62 + rand() * 0.12)
                walls.push(box(dx2, eave + 3, 11, 13))
                roofs.push(pediment(dx2 + 5.5, eave - 10, 8, 9))
                cuts.push(box(dx2 + 3, eave - 1, 5, 7))
            }
        } else if (kind < 0.44) {
            const inset = w * 0.26
            roofs.push(`M${x - 2} ${eave} L${x + inset} ${top} H${x + w - inset} L${x + w + 2} ${eave} Z`)
        } else if (kind < 0.6) {
            walls.push(steppedGable(x + w / 2, eave, w / 2, 3, roofH / 3))
            roofs.push(box(x - 1, eave, w + 2, 4))
        } else if (kind < 0.76) {
            walls.push(bellGable(x + w / 2, eave, w / 2, roofH))
            roofs.push(box(x - 1, eave, w + 2, 4))
        } else {
            roofs.push(box(x - 3, eave, w + 6, 6))
        }

        if (rand() < 0.55) {
            const cw = 4.5 + rand() * 4
            walls.push(box(x + w * (0.14 + rand() * 0.66), eave + 4, cw, roofH + 7 + rand() * 12))
        }

        if (detail && h - roofH > 34 && w > 22) {
            const cols = Math.max(2, Math.floor(w / 14))
            const floors = Math.max(2, Math.floor((h - roofH - 12) / floorStep))
            const pitch = (w - 11) / cols
            const winW = Math.min(5.5, pitch - 5)
            for (let c = 0; c < cols; c++) {
                for (let f = 0; f < floors; f++) {
                    if (rand() < 0.1) continue
                    cuts.push(box(x + 7 + c * pitch, base - 10 - f * floorStep, winW, floorStep * 0.55))
                }
            }
            if (detail && rand() < 0.5) {
                cuts.push(arch(x + w / 2 - 6, base, 12, 17))
            }
        }

        x += w * (tight + rand() * 0.2)
    }

    return { walls: walls.join(' '), roofs: roofs.join(' '), cuts: cuts.join(' ') }
}

export function starField({ seed, count, from, to, top, bottom, avoid = [] }) {
    const rand = seeded(seed)
    const out = []
    let guard = 0
    while (out.length < count && guard++ < count * 40) {
        const cx = from + rand() * (to - from)
        const cy = top + rand() * (bottom - top)
        if (avoid.some(a => cx > a[0] && cx < a[1] && cy > a[2])) continue
        out.push(star(cx, cy, 2.2 + rand() * 3.4))
    }
    return out.join(' ')
}

function r(value) {
    return Math.round(value * 10) / 10
}
