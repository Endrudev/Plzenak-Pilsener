// Tři "klidné" večerní/denní výjevy (stánek s trhovcem, přípitek u živého
// plotu, dítě s balónkem v parku) — vytaženo z bývalé HeroTileRest.jsx
// (stejný vzor jako MusicScene.jsx/TopNightScene.jsx), aby je šlo použít
// jak v malé bento dlaždici (`.vig` — jeden "peephole", výjevy se
// prolínají přes mlhu/rozostření, viz HeroTileRest.jsx), tak vedle sebe
// ve velkém hero pásu na /zbytek-programu (`.zp-vig-live`, viz
// ZbytekProgramu.jsx — žádné prolínání, všechny tři vidět najednou).
//
// Sama o sobě komponenta nedrží žádnou animaci ani obal (`.vig`/`.scn`/
// mlha/girlanda pozice) — ten je specifický pro každé použití, dodává ho
// volající. Tady jsou jen SVG tvary + `Bulbs`/pozice žárovek, doslova ze
// zdroje.

// Šest "žárovek" girlandy nad výjevem 1/2 (výjev 3 — lampy v parku — girlandu
// nemá). Pozice i střídání b1/b2/b3 tříd (zpoždění blikání) doslova ze zdroje.
export const BULBS_V1 = [
    { l: 6.7, t: 13.2, cls: '' }, { l: 24.0, t: 15.6, cls: 'b1' }, { l: 41.3, t: 17.1, cls: 'b2' },
    { l: 58.7, t: 17.7, cls: 'b3' }, { l: 76.0, t: 17.3, cls: '' }, { l: 93.3, t: 16.0, cls: 'b1' },
]
export const BULBS_V2 = [
    { l: 6.7, t: 17.8, cls: '' }, { l: 24.0, t: 19.9, cls: 'b1' }, { l: 41.3, t: 20.5, cls: 'b2' },
    { l: 58.7, t: 19.6, cls: 'b3' }, { l: 76.0, t: 17.2, cls: '' }, { l: 93.3, t: 13.1, cls: 'b1' },
]

export function Bulbs({ list }) {
    return list.map((b, i) => (
        <span key={i} className={`bulb ${b.cls}`} style={{ left: `${b.l}%`, top: `${b.t}%` }} />
    ))
}

// Stín pod papírovými siluetami — každý výjev má vlastní filtr instanci
// (samostatné id kvůli víc <svg> na stránce), hodnoty doslova ze zdroje.
function ShadowDefs({ id }) {
    return (
        <defs>
            <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#1F3522" floodOpacity="0.35" />
            </filter>
        </defs>
    )
}

// Výjev 1 — stánek s trhovcem a zákazníkem (podávají si ruce), pruhovaná
// stříška, zboží na regálech.
export function Scene1({ shadowId = 'htr-s1d' }) {
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 180" aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'block', overflow: 'visible' }}>
            <ShadowDefs id={shadowId} />
            <g filter={`url(#${shadowId})`}>
                <path d="M-4 18Q100 36 204 24" stroke="var(--color-calm-line)" strokeWidth="1.2" fill="none" />
                <path d="M-6 180V170Q100 164 206 170V180Z" fill="var(--color-calm-ground)" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <path d="M40 60h4v108h-4ZM160 60h4v108h-4Z" fill="var(--color-calm-line)" />
                <path d="M34.0 56L100 30L56.7 56Z" fill="var(--color-calm-awning-a)" />
                <path d="M56.7 56L100 30L79.4 56Z" fill="var(--color-calm-awning-b)" />
                <path d="M79.4 56L100 30L102.1 56Z" fill="var(--color-calm-awning-a)" />
                <path d="M102.1 56L100 30L124.8 56Z" fill="var(--color-calm-awning-b)" />
                <path d="M124.8 56L100 30L147.5 56Z" fill="var(--color-calm-awning-a)" />
                <path d="M147.5 56L100 30L170.2 56Z" fill="var(--color-calm-awning-b)" />
                <path d="M34 55H170V62a11.33 5 0 0 1 -22.67 0a11.33 5 0 0 1 -22.67 0a11.33 5 0 0 1 -22.67 0a11.33 5 0 0 1 -22.67 0a11.33 5 0 0 1 -22.67 0a11.33 5 0 0 1 -22.67 0Z" fill="var(--color-calm-awning-trim)" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <g fill="var(--color-calm-figure)">
                    <circle cx="80" cy="77.0" r="7.0" />
                    <path d="M72.5 75.0C73.0 67.0 87.0 67.0 87.5 75.0H92.0V77.0H72.5Z" />
                    <path d="M77.5 82.0h5.0v6.0h-5.0Z" />
                    <path d="M69.0 126.0L70.0 97.0Q70.0 87.0 80.0 87.0Q90.0 87.0 90.0 97.0L91.0 126.0Z" />
                    <path d="M72.0 125.0H79.0V168H73.0ZM81.0 125.0H88.0L87.0 168H81.0Z" />
                </g>
                <path d="M88 93L104 110" stroke="var(--color-calm-figure)" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <path d="M50 116H150V168H50Z" fill="var(--color-calm-line)" />
                <path d="M48 112H152V118H48Z" fill="var(--color-calm-awning-trim)" />
                <path d="M56 102h22v10h-22ZM120 102h22v10h-22Z" fill="var(--color-calm-awning-trim)" />
                <circle cx="60" cy="101" r="3.4" fill="var(--color-calm-figure)" />
                <circle cx="66.5" cy="101" r="3.4" fill="var(--color-calm-figure)" />
                <circle cx="73" cy="101" r="3.4" fill="var(--color-calm-figure)" />
                <circle cx="124" cy="101" r="3.4" fill="var(--color-calm-figure)" />
                <circle cx="130.5" cy="101" r="3.4" fill="var(--color-calm-figure)" />
                <circle cx="137" cy="101" r="3.4" fill="var(--color-calm-figure)" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <g fill="var(--color-calm-figure-dk)">
                    <circle cx="132" cy="89.5" r="7.5" />
                    <circle cx="126.6" cy="84.2" r="3.4" />
                    <path d="M129.3 94.9h5.4v6.4h-5.4Z" />
                    <path d="M120.2 142.2L121.2 111.0Q121.2 100.3 132.0 100.3Q142.8 100.3 142.8 111.0L143.8 142.2Z" />
                    <path d="M123.4 141.1H130.9V168H124.5ZM133.1 141.1H140.6L139.5 168H133.1Z" />
                </g>
                <path d="M123 106L107 111" stroke="var(--color-calm-figure-dk)" strokeWidth="5" strokeLinecap="round" fill="none" />
                <circle cx="105.5" cy="110.5" r="3.6" fill="var(--color-calm-figure-dk)" />
                <path d="M141 118h11l-1 16h-9Z" fill="var(--color-calm-figure-dk)" />
                <path d="M143 118q3.5-6 7 0" stroke="var(--color-calm-figure-dk)" strokeWidth="1.6" fill="none" />
            </g>
        </svg>
    )
}

// Výjev 2 — čtyři přátelé u živého plotu, prostřední dvojice si přiťukává
// (zvednutá paže se sklenicí animovaná zvlášť jako .raise, mimo tenhle svg).
export function Scene2({ shadowId = 'htr-s2d' }) {
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 180" aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'block', overflow: 'visible' }}>
            <ShadowDefs id={shadowId} />
            <g filter={`url(#${shadowId})`}>
                <path d="M-4 26Q100 46 204 16" stroke="var(--color-calm-line)" strokeWidth="1.2" fill="none" />
                <path d="M4 168V118a22 22 0 0 1 10-40a20 20 0 0 1 32 4a18 18 0 0 1 6 34h-8v52Z" fill="var(--color-calm-awning-b)" />
                <path d="M-6 180V170Q100 164 206 170V180Z" fill="var(--color-calm-ground)" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <path d="M84 118h32v5H84ZM98.5 123h3v44h-3ZM90 166h20v2H90Z" fill="var(--color-calm-line)" />
                <path d="M88 108H96L94.5 114Q92 116 89.5 114ZM91.4 115h1.2v6h-1.2ZM89 121h6v1.2h-6Z" fill="var(--color-calm-line)" />
                <path d="M104 109H112L110.5 115Q108 117 105.5 115ZM107.4 116h1.2v6h-1.2ZM105 122h6v1.2h-6Z" fill="var(--color-calm-line)" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <g fill="var(--color-calm-figure)">
                    <circle cx="58" cy="91.0" r="7.0" />
                    <circle cx="53.0" cy="86.0" r="3.2" />
                    <path d="M55.5 96.0h5.0v6.0h-5.0Z" />
                    <path d="M47.0 140.0L48.0 111.0Q48.0 101.0 58.0 101.0Q68.0 101.0 68.0 111.0L69.0 140.0Z" />
                    <path d="M50.0 139.0H57.0V168H51.0ZM59.0 139.0H66.0L65.0 168H59.0Z" />
                </g>
                <path d="M65 108L76 114" stroke="var(--color-calm-figure)" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M74 106H82L80.5 112Q78 114 75.5 112ZM77.4 113h1.2v6h-1.2ZM75 119h6v1.2h-6Z" fill="var(--color-calm-figure)" />
                <g fill="var(--color-calm-figure)">
                    <circle cx="150" cy="92.8" r="6.8" />
                    <path d="M142.7 90.9C143.2 83.1 156.8 83.1 157.3 90.9H161.7V92.8H142.7Z" />
                    <path d="M147.6 97.7h4.9v5.8h-4.9Z" />
                    <path d="M139.3 140.6L140.2 112.3Q140.2 102.6 150.0 102.6Q159.8 102.6 159.8 112.3L160.7 140.6Z" />
                    <path d="M142.2 139.6H149.0V168H143.2ZM151.0 139.6H157.8L156.8 168H151.0Z" />
                </g>
                <path d="M143 110L133 114" stroke="var(--color-calm-figure)" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M127 106H135L133.5 112Q131 114 128.5 112ZM130.4 113h1.2v6h-1.2ZM128 119h6v1.2h-6Z" fill="var(--color-calm-figure)" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <g fill="var(--color-calm-figure-dk)">
                    <circle cx="34" cy="100.5" r="6.5" />
                    <path d="M31.7 105.1h4.6v5.6h-4.6Z" />
                    <path d="M23.8 145.8L24.8 119.0Q24.8 109.7 34.0 109.7Q43.2 109.7 43.2 119.0L44.2 145.8Z" />
                    <path d="M26.6 144.9H33.1V168H27.5ZM34.9 144.9H41.4L40.5 168H34.9Z" />
                </g>
                <path d="M41 116L50 120" stroke="var(--color-calm-figure-dk)" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M48 111H56L54.5 117Q52 119 49.5 117ZM51.4 118h1.2v6h-1.2ZM49 124h6v1.2h-6Z" fill="var(--color-calm-figure-dk)" />
                <g fill="var(--color-calm-figure-dk)">
                    <circle cx="122" cy="95.0" r="7.0" />
                    <path d="M119.5 100.0h5.0v6.0h-5.0Z" />
                    <path d="M111.0 144.0L112.0 115.0Q112.0 105.0 122.0 105.0Q132.0 105.0 132.0 115.0L133.0 144.0Z" />
                    <path d="M114.0 143.0H121.0V168H115.0ZM123.0 143.0H130.0L129.0 168H123.0Z" />
                </g>
            </g>
        </svg>
    )
}

// Výjev 3 — dítě s balónkem v parku, dvě lucerny, jedna postava na lavičce.
export function Scene3({ shadowId = 'htr-s3d' }) {
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 180" aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'block', overflow: 'visible' }}>
            <ShadowDefs id={shadowId} />
            <g filter={`url(#${shadowId})`}>
                <path d="M44 168V118h6v50Z" fill="var(--color-calm-line)" />
                <path d="M14 112a20 20 0 0 1 10-30a24 24 0 0 1 40-6a20 20 0 0 1 12 34a16 16 0 0 1-18 10H28a16 16 0 0 1-14-8Z" fill="var(--color-calm-awning-b)" />
                <path d="M176 168V70h3v98ZM170 70h15l-3-9h-9Z" fill="var(--color-calm-line)" />
                <circle cx="177.5" cy="74" r="4" fill="var(--color-calm-lamp-glow)" />
                <path d="M-6 180V170Q100 164 206 170V180Z" fill="var(--color-calm-ground)" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <path d="M112 138h52v4h-52ZM112 146h52v4h-52ZM116 150h3v18h-3ZM157 150h3v18h-3Z" fill="var(--color-calm-awning-trim)" />
            </g>
            <g filter={`url(#${shadowId})`}>
                <g fill="var(--color-calm-figure-dk)">
                    <circle cx="84" cy="126.4" r="4.4" />
                    <path d="M82.4 129.5h3.1v3.8h-3.1Z" />
                    <path d="M77.1 157.0L77.8 138.9Q77.8 132.6 84.0 132.6Q90.2 132.6 90.2 138.9L90.9 157.0Z" />
                    <path d="M79.0 156.4H83.4V168H79.6ZM84.6 156.4H89.0L88.4 168H84.6Z" />
                </g>
                <path d="M88 133L97 125" stroke="var(--color-calm-figure-dk)" strokeWidth="5" strokeLinecap="round" fill="none" />
                <g fill="var(--color-calm-figure-dk)">
                    <path d="M112 156q2-10 16-10h10q6 0 6 6v4q0 4-4 4h-26q-2 0-2-4Z" />
                    <path d="M140 146q0-8 7-9l4 1q5 1 5 5l-1 3q-2 2-5 1h-4v4Z" />
                    <path d="M146 138l-2-6 5 3Z" />
                    <path d="M116 158h4v10h-4ZM124 158h4v10h-4ZM132 158h4v10h-4ZM138 158h4v10h-4Z" />
                    <path d="M113 150q-8-2-9-10" stroke="var(--color-calm-figure-dk)" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
                <path d="M96 125Q108 140 113 150" stroke="var(--color-calm-figure-dk)" strokeWidth="1.2" fill="none" />
            </g>
        </svg>
    )
}

// Přípitek ve výjevu 2 — zvednutá paže se sklenicí, mimo hlavní <svg>
// (vlastní pozice/rotace osa, viz .raise v CSS).
export function RaiseArm() {
    return (
        <svg width="100%" height="100%" viewBox="128 54 28 56" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
            <path d="M130 107L146 68" stroke="var(--color-calm-figure-dk)" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M144 56H152L150.5 62Q148 64 145.5 62ZM147.4 63h1.2v6h-1.2ZM145 69h6v1.2h-6Z" fill="var(--color-calm-figure-dk)" />
        </svg>
    )
}

// Balónek ve výjevu 3 — mimo hlavní <svg>, jemně se pohupuje (viz .balloon
// v CSS).
export function BalloonIcon() {
    return (
        <svg width="100%" height="100%" viewBox="88 36 24 90" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
            <path d="M100 66Q96 96 97 125" stroke="var(--color-calm-figure-dk)" strokeWidth="1.1" fill="none" />
            <path d="M100 38c-8 0-12 7-12 13 0 8 7 14 12 15 5-1 12-7 12-15 0-6-4-13-12-13Z" fill="var(--color-calm-figure)" />
            <path d="M98 66h4l-2 3Z" fill="var(--color-calm-figure)" />
        </svg>
    )
}
