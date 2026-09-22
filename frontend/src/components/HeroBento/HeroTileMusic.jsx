import { Link } from 'react-router-dom'
import { eventCountLabel } from '../../lib/pluralize.js'
import './HeroTileMusic.css'

// Pět siluet postaviček z davu (hlava + tělo + paže/pokrývka hlavy podle
// varianty), doslovně převzato ze zdrojového handoffu — ne zjednodušené
// kolečko+obdélník jako dřív. Všechny sdílí viewBox 0 0 30 50, mění se jen
// šířka/výška instance (škáluje se přes width/height na <svg>).
function FanBase() {
    return (
        <>
            <circle cx="15" cy="9" r="6.5" />
            <path d="M13 14h4v9h-4z" />
            <path d="M2 50C2 32 7 21 15 21S28 32 28 50Z" />
        </>
    )
}

function FanWaving() {
    return (
        <>
            <FanBase />
            <path d="M5 27L1.5 5l4-1L10 25ZM25 27l3.5-22-4-1L20 25Z" />
        </>
    )
}

function FanHatLeftArm() {
    return (
        <>
            <circle cx="15" cy="9" r="6.5" />
            <circle cx="15" cy="2" r="3.2" />
            <path d="M13 14h4v9h-4z" />
            <path d="M2 50C2 32 7 21 15 21S28 32 28 50Z" />
            <path d="M6 27L2 8l4-1 4 18Z" />
        </>
    )
}

function FanCapRightArm() {
    return (
        <>
            <FanBase />
            <path d="M24 27l5-22-4-1-6 21Z" />
            <path d="M24.5 2.5l4 .6-.6 4-4-.6Z" />
        </>
    )
}

function FanWideHat() {
    return (
        <>
            <circle cx="15" cy="10" r="6.5" />
            <path d="M8 6.5C8 2 22 2 22 6.5h5v2.5H8Z" />
            <path d="M13 15h4v8h-4z" />
            <path d="M2 50C2 32 7 21 15 21S28 32 28 50Z" />
        </>
    )
}

const FAN_SHAPES = {
    base: FanBase,
    waving: FanWaving,
    hatLeftArm: FanHatLeftArm,
    capRightArm: FanCapRightArm,
    wideHat: FanWideHat,
}

// Devět různých délek/zpoždění skoku (viz .fan-t0..t8 v CSS), ať dav skáče
// rozhozeně, ne v jednom rytmu — hodnoty doslova ze zdroje.
const BACK_FANS = [
    { left: 6, w: 25, h: 42, shape: 'base', timing: 't0' },
    { left: 34, w: 28, h: 46, shape: 'waving', timing: 't1' },
    { left: 62, w: 30, h: 50, shape: 'hatLeftArm', timing: 't2' },
    { left: 90, w: 26, h: 44, shape: 'capRightArm', timing: 't3' },
    { left: 118, w: 29, h: 48, shape: 'wideHat', timing: 't4' },
    { left: 146, w: 25, h: 42, shape: 'base', timing: 't5' },
    { left: 174, w: 28, h: 46, shape: 'waving', timing: 't6' },
    { left: 202, w: 30, h: 50, shape: 'capRightArm', timing: 't7' },
    { left: 230, w: 26, h: 44, shape: 'hatLeftArm', timing: 't8' },
    { left: 258, w: 29, h: 48, shape: 'base', timing: 't0' },
]

const FRONT_FANS = [
    { left: -4, w: 33, h: 54, shape: 'wideHat', timing: 't4' },
    { left: 34, w: 35, h: 59, shape: 'base', timing: 't5' },
    { left: 72, w: 38, h: 64, shape: 'waving', timing: 't6' },
    { left: 108, w: 34, h: 57, shape: 'capRightArm', timing: 't7' },
    { left: 146, w: 37, h: 61, shape: 'hatLeftArm', timing: 't8' },
    { left: 184, w: 33, h: 54, shape: 'base', timing: 't0' },
    { left: 220, w: 35, h: 59, shape: 'waving', timing: 't1' },
]

function Fan({ f, fill }) {
    const Shape = FAN_SHAPES[f.shape]
    return (
        <span className={`fan fan-${f.timing}`} style={{ left: `${f.left}px`, width: `${f.w}px`, height: `${f.h}px` }}>
            <svg width={f.w} height={f.h} viewBox="0 0 30 50" aria-hidden="true" fill={fill} style={{ display: 'block', overflow: 'visible' }}>
                <Shape />
            </svg>
        </span>
    )
}

// Pódium: dva sloupy reprobeden, papírový interpret s mikrofonem (paže se
// zvedá na hoveru), opona ve výřezu a tři noty stoupající do vzduchu.
function Stage() {
    return (
        <span className="stage" aria-hidden="true">
            <span className="stage-pillar stage-pillar--l" />
            <span className="stage-pillar stage-pillar--r" />
            <span className="perf">
                <svg width="64" height="100" viewBox="0 0 64 108" aria-hidden="true" fill="var(--color-music-figure)" style={{ display: 'block' }}>
                    <path d="M49 50h2.4v58H49z" />
                    <path d="M41 105h18v3H41z" />
                    <circle cx="28" cy="15" r="11" />
                    <path d="M20 10C20 1 36 1 37 9l-2 3C33 7 23 7 21 13Z" fill="var(--color-music-figure-alt)" />
                    <path d="M24 24h8v8h-8z" />
                    <path d="M12 108L15 52C15 38 20 30 28 30S41 38 41 52L44 108H31L28 70L25 108Z" />
                </svg>
                <span className="arm">
                    <svg width="26" height="34" viewBox="0 0 26 34" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
                        <path d="M4 30 L16 18" stroke="var(--color-music-figure)" strokeWidth="7" strokeLinecap="round" />
                        <rect x="12" y="5" width="8" height="13" rx="4" fill="var(--color-music-figure-alt)" transform="rotate(45 16 12)" />
                    </svg>
                </span>
            </span>
            <svg width="140" height="40" viewBox="0 0 140 40" aria-hidden="true" className="curtain" style={{ display: 'block' }}>
                <path d="M0 40V8Q0 6 2 6H138Q140 6 140 8V40Z" fill="var(--color-music-curtain)" />
                <path d="M0 6h140v7a11.67 6 0 0 1 -23.33 0a11.67 6 0 0 1 -23.33 0a11.67 6 0 0 1 -23.33 0a11.67 6 0 0 1 -23.33 0a11.67 6 0 0 1 -23.33 0a11.67 6 0 0 1 -23.33 0Z" fill="var(--color-music-curtain-lt)" />
            </svg>
            <span className="note note--n1">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
                    <path d="M6 2l9-2v13.5a3 3 0 1 1-2-2.8V4.3L8 5.4v10.1a3 3 0 1 1-2-2.8Z" />
                </svg>
            </span>
            <span className="note note--n2">
                <svg width="11" height="18" viewBox="0 0 11 18" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
                    <path d="M6 0h2c0 3 3 4 3 7-1-1-2-2-3-2v9.5a3 3 0 1 1-2-2.8Z" />
                </svg>
            </span>
            <span className="note note--n3">
                <svg width="11" height="18" viewBox="0 0 11 18" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
                    <path d="M6 0h2c0 3 3 4 3 7-1-1-2-2-3-2v9.5a3 3 0 1 1-2-2.8Z" />
                </svg>
            </span>
        </span>
    )
}

// Doslovná rekonstrukce Hudba dlaždice z Claude Design handoffu: dvě řady
// davu (zadní 10, přední 7 postaviček — pět opakujících se siluet), pódium
// s interpretem a oponou, tři noty. Klidový stav statický, smyčka (skoky,
// mávání mikrofonem, stoupající noty) se pustí na hoveru/focusu přes
// `.hero-tile--music:hover`/`:focus-visible` v CSS (žádný JS stav navíc —
// zdroj řeší totéž přes JS `.on` třídu kvůli tap-preview na dotykových
// zařízeních, což tady obětujeme za jednodušší čistě CSS řešení).
export default function HeroTileMusic({ count = 0 }) {
    return (
        <Link to="/events?kategorie=Hudba" className="hero-tile hero-tile--music">
            <span className="music-glow" aria-hidden="true" />
            <div className="ht-music-scene" aria-hidden="true">
                <span className="row row--back">
                    {BACK_FANS.map((f, i) => <Fan key={i} f={f} fill="var(--color-music-fan-back)" />)}
                </span>
                <Stage />
                <span className="row row--front">
                    {FRONT_FANS.map((f, i) => <Fan key={i} f={f} fill="var(--color-music-fan-front)" />)}
                </span>
            </div>

            <div className="hero-tile-overlay">
                <h2 className="hero-tile-title hero-tile-title--sm">Hudba</h2>
                <p className="hero-tile-lead">{eventCountLabel(count)} tento měsíc</p>
            </div>

            <span className="hero-tile-arrow hero-tile-arrow--ghost" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </span>
        </Link>
    )
}
