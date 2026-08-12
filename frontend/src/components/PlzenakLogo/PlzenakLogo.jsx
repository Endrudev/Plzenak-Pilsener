const TONES = {
    color: { pin: 'var(--sun)', text: 'var(--ink)', shadow: 'rgba(31,27,22,0.18)' },
    mono: { pin: 'var(--ink)', text: 'var(--ink)', shadow: 'rgba(31,27,22,0.25)' },
    inverse: { pin: '#FFFFFF', text: '#FFFFFF', shadow: 'rgba(255,255,255,0.32)' },
    inverseColor: { pin: 'var(--sun)', text: '#FFFFFF', shadow: 'rgba(255,255,255,0.32)' },
}

export default function PlzenakLogo({ variant = 'cs', tone = 'color', size = 38, style, title = 'Plzeňák' }) {
    const t = TONES[tone] || TONES.color
    const h = Number(size) || 38
    const mark = (
        <svg width={(h * 24) / 38} height={h} viewBox="0 0 24 38" role="img" aria-label={title}>
            <circle cx="12" cy="12" r="12" fill={t.pin} />
            <polygon points="5,20 19,20 12,31" fill={t.pin} />
            <ellipse cx="12" cy="35.5" rx="6.5" ry="2" fill={t.shadow} />
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
