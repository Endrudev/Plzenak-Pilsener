import { PIN_PATHS, PIN_RATIO, PIN_VIEWBOX } from './pinPaths.js'

// Logo: pin + slovo Plzeňák. Pin je od 2026-10-05 nový vektorový obrázek (pinPaths.js),
// dříve ho kreslily kruh, trojúhelník a elipsa. Od téhož dne je to varianta s věží a
// tlustým obrysem: obrys a věž jsou tahy (stroke), které se nepřebarvují, přebarvují se
// jen plochy.
//
// Tóny pinu:
//   color         původní oranžové odstíny (na světlém pozadí)
//   inverseColor  totéž, slovo je bílé (na tmavém pozadí)
//   inverse       černobílá varianta pro tmavé pozadí: hlavní plocha pinu bílá, boční
//                 stěna šedá, takže si pin drží plastický vzhled
//   mono          černobílá varianta pro světlé pozadí: hlavní plocha inkoustová, stěna
//                 o stupeň světlejší
const TONES = {
    color: { pin: 'color', text: 'var(--ink)' },
    mono: { pin: 'mono', text: 'var(--ink)' },
    inverse: { pin: 'inverse', text: '#FFFFFF' },
    inverseColor: { pin: 'color', text: '#FFFFFF' },
}

function luminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Jas jednotlivých ploch. Tahy (fill: none) se nepřebarvují a jas nemají.
const LUMS = PIN_PATHS.map(p => (p.fill === 'none' ? null : luminance(p.fill)))
const FILLED = LUMS.filter(l => l !== null)
const L_MIN = Math.min(...FILLED)
// Hlavní plocha pinu (první plocha, největší tvar) je referenční odstín: v inverzní
// variantě je bílá, v mono nejtmavší. Světlejší odlesky se useknou na stejnou hodnotu,
// tmavší boční stěna zůstane šedá, takže si pin drží plastický vzhled.
const L_REF = FILLED[0]

function gray(index, pin) {
    const n = Math.min(1, Math.max(0, (LUMS[index] - L_MIN) / (L_REF - L_MIN)))
    const v = pin === 'inverse' ? 0.45 + 0.55 * n : 0.1 + 0.32 * (1 - n)
    const c = Math.round(v * 255)
    return `rgb(${c}, ${c}, ${c})`
}

function fillFor(path, index, pin) {
    if (path.fill === 'none') return 'none'
    return pin === 'color' ? path.fill : gray(index, pin)
}

export default function PlzenakLogo({ variant = 'cs', tone = 'color', size = 38, style, title = 'Plzeňák' }) {
    const t = TONES[tone] || TONES.color
    const h = Number(size) || 38
    // Rámeček pinu zahrnuje i tlustý obrys, kresba uvnitř je proto menší, než odpovídá výšce.
    // Pin je o kousek vyšší než písmo, ať neupadne.
    const pinH = h * 1.3
    const mark = (
        <svg width={pinH * PIN_RATIO} height={pinH} viewBox={PIN_VIEWBOX} role="img" aria-label={title}>
            {PIN_PATHS.map((p, i) => (
                <path
                    key={i}
                    d={p.d}
                    transform={`translate(${p.t[0]},${p.t[1]})`}
                    fill={fillFor(p, i, t.pin)}
                    fillRule={p.evenodd ? 'evenodd' : undefined}
                    stroke={p.stroke || undefined}
                    strokeWidth={p.sw || undefined}
                    strokeLinejoin={p.stroke ? 'round' : undefined}
                />
            ))}
        </svg>
    )

    if (variant === 'mark') return <span style={{ display: 'inline-flex', ...style }}>{mark}</span>

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: `${Math.round(h * 0.3)}px`, ...style }}>
            {mark}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: 'var(--tracking-display)', lineHeight: 1, fontSize: `${Math.round(h * 1.16)}px`, color: t.text }}>
                {variant === 'en' ? 'Pilsener' : 'Plzeňák'}
            </span>
        </span>
    )
}
