// Šipky pro landing. Jedna rodina čar (stroke 2, kulaté konce), ať se šipky ve
// tlačítkách, kartách a karuselu tváří jako jedna sada.
const base = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
}

export function ArrowRight({ size = 18 }) {
    return (
        <svg width={size} height={size} {...base}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
        </svg>
    )
}

export function ArrowLeft({ size = 18 }) {
    return (
        <svg width={size} height={size} {...base}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11 6 5 12 11 18" />
        </svg>
    )
}

// Šipka šikmo nahoru: karta, která vede na jinou stránku.
export function ArrowUpRight({ size = 18 }) {
    return (
        <svg width={size} height={size} {...base}>
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="8 7 17 7 17 16" />
        </svg>
    )
}

export function PinIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} {...base}>
            <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z" />
            <circle cx="12" cy="10" r="2.4" />
        </svg>
    )
}

export function SearchIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} {...base}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
        </svg>
    )
}
