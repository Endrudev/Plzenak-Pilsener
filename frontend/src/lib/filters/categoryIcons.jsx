// Ikony kategorií, nová sada 2026-10-05 (nahradila ikony ze starého návrhu).
//
// Jazyk sady: čára 2 na mřížce 24, zaoblené konce a spoje, žádná výplň kromě drobných
// teček, jeden zřetelný předmět na ikonu a uvnitř něj jeden detail navíc (mřížka mikrofonu,
// bublinky v pěně, hvězda mezi záclonami, ciferník, okno věže, střed větrníku). Jsou
// záměrně dost podrobné, aby vydržely i ve velké velikosti: na dlaždicích kategorií se
// zvětšují na stovky pixelů a tam se čára drží konstantní díky vector-effect (viz
// LandingCategories.css).
//
// Motivy jsou z Plzně a z toho, co se tu děje: mikrofon (koncerty), půllitr pilsneru
// (pivo a gastro), divadelní maska (divadlo a kultura), stopky (běh a sport), věž
// katedrály sv. Bartoloměje (památky, stejná jako v logu) a plyšový medvídek (děti).

function Icon({ size = 24, children }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    )
}

// Hudba: stojánkový mikrofon s mřížkou a objímkou.
export function HudbaIcon({ size }) {
    return (
        <Icon size={size}>
            <rect x="8.5" y="2.6" width="7" height="11.6" rx="3.5" />
            <path d="M8.5 7h7M8.5 10.2h7" />
            <path d="M5.2 10.6a6.8 6.8 0 0 0 13.6 0" />
            <path d="M12 17.4V21M8.6 21h6.8" />
        </Icon>
    )
}

// Gastro: sklenice pilsneru s korunou pěny a bublinkami.
export function GastroIcon({ size }) {
    return (
        <Icon size={size}>
            <path d="M7 7.4h10l-1.5 8.2a3.5 3.5 0 0 1-7 0z" />
            <path d="M7 7.4a2.2 2.2 0 0 1-.3-4.2 2.9 2.9 0 0 1 5.3-.7 2.9 2.9 0 0 1 5 1.6 2.3 2.3 0 0 1-.9 3.3" />
            <path d="M12 18.4V21M8.6 21h6.8" />
            <circle cx="10.8" cy="12" r=".6" fill="currentColor" stroke="none" />
            <circle cx="13.2" cy="10.4" r=".6" fill="currentColor" stroke="none" />
            <circle cx="12.6" cy="14" r=".6" fill="currentColor" stroke="none" />
        </Icon>
    )
}

// Kultura: divadelní maska s úsměvem a jiskra jako potlesk nad ní. Záclony se na 24 px
// četly jako okno, maska je rozpoznatelná i malá.
export function KulturaIcon({ size }) {
    return (
        <Icon size={size}>
            <path d="M4.6 5.6c2.3 1.1 4.7 1.7 7.4 1.7s5.1-.6 7.4-1.7v6.5c0 4.5-3.2 8.6-7.4 8.6s-7.4-4.1-7.4-8.6z" />
            <path d="M7.8 11.2q1.4-1.6 2.9 0M13.3 11.2q1.4-1.6 2.9 0" />
            <path d="M8.4 15c1 1.7 6.2 1.7 7.2 0" />
            <path d="M20 1.8l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" />
        </Icon>
    )
}

// Sport: stopky s ciferníkem, tlačítky a čárami rychlosti.
export function SportIcon({ size }) {
    return (
        <Icon size={size}>
            <circle cx="13" cy="13.6" r="7.2" />
            <path d="M10.6 2.8h4.8M13 2.8v3.6" />
            <path d="M18.2 8.4l1.4-1.4" />
            <path d="M13 13.6l2.8-2.8" />
            <path d="M13 8.8v.9M13 17.5v.9M8.2 13.6h.9M16.9 13.6h.9" />
            <path d="M2.4 10.6h2M1.8 13.8h2.6M2.8 17h2" />
        </Icon>
    )
}

// Památky: věž katedrály sv. Bartoloměje s jehlanem, oknem a nárožními věžičkami.
export function PamatkyIcon({ size }) {
    return (
        <Icon size={size}>
            <path d="M12 1.8l2.7 7.4H9.3z" />
            <path d="M10.2 9.2v2.8M13.8 9.2v2.8" />
            <path d="M9 12h6v9H9z" />
            <path d="M11 21v-3.2a1 1 0 0 1 2 0V21" />
            <path d="M9 21H6.4v-4.6l1.3-1.6 1.3 1.6M15 21h2.6v-4.6l-1.3-1.6-1.3 1.6" />
            <path d="M3 21h18" />
        </Icon>
    )
}

// Pro děti: hlava plyšového medvídka s oušky, čumáčkem a očima.
export function DetiIcon({ size }) {
    return (
        <Icon size={size}>
            <circle cx="12" cy="13.2" r="7.4" />
            <path d="M5.5 9.4a2.9 2.9 0 1 1 4.3-3.5" />
            <path d="M18.5 9.4a2.9 2.9 0 1 0-4.3-3.5" />
            <ellipse cx="12" cy="15.6" rx="3.1" ry="2.4" />
            <path d="M11 14.2h2l-1 1.2z" fill="currentColor" />
            <circle cx="9" cy="11.4" r=".75" fill="currentColor" stroke="none" />
            <circle cx="15" cy="11.4" r=".75" fill="currentColor" stroke="none" />
        </Icon>
    )
}
