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

export function CloseIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} {...base}>
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
    )
}

export function CalendarIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} {...base}>
            <rect x="3" y="4.5" width="18" height="17" rx="3" />
            <line x1="16" y1="2.5" x2="16" y2="6.5" />
            <line x1="8" y1="2.5" x2="8" y2="6.5" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}

export function ShareIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} {...base}>
            <circle cx="18" cy="5" r="2.6" />
            <circle cx="6" cy="12" r="2.6" />
            <circle cx="18" cy="19" r="2.6" />
            <line x1="8.3" y1="10.8" x2="15.7" y2="6.2" />
            <line x1="8.3" y1="13.2" x2="15.7" y2="17.8" />
        </svg>
    )
}

export function TicketIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} {...base}>
            <path d="M3 9a3 3 0 0 0 0 6v2.5A1.5 1.5 0 0 0 4.5 19h15a1.5 1.5 0 0 0 1.5-1.5V15a3 3 0 0 1 0-6V6.5A1.5 1.5 0 0 0 19.5 5h-15A1.5 1.5 0 0 0 3 6.5z" />
            <line x1="14" y1="5.5" x2="14" y2="18.5" strokeDasharray="2 3" />
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
