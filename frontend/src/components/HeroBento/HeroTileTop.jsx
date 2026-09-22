import { Link } from 'react-router-dom'
import './HeroTileTop.css'

// Doslovná rekonstrukce dlaždice TOP akce z Claude Design handoffu — 12
// hvězd, 2 padající, hejno 5 ptáků, 4 vrstvy siluety (vzdálená/střední/
// blízká/přední, každá svůj odstín), přes 50 jednotlivě blikajících oken,
// vlajka, kouř z komína, lucerna, dvě "světla aut" jedoucí po ulici. Dřív
// tahle dlaždice obalovala samostatnou komponentu NightSkyline (funkčně
// bohatší — reálné památky napojené na data, blesk co sleduje kurzor), ale
// ta byla postavená jako široký panoramatický pás (1600:660) pro starou
// fullwidth hero sekci a do hranaté 4×2 dlaždice (850:640 v handoffu) se
// nehodila — nahoře zůstával prázdný pruh. Uživatel chtěl přesně handoff,
// tak je NightSkyline pryč a tohle je 1:1 podle zdroje (viewBox 0 0 850
// 640, stejné jako handoff).
//
// Animace (mrkání hvězd, padající hvězda, let ptáků, vlnění vlajky, kouř,
// blikání oken, jedoucí světla) běží jen na hoveru/focusu přes CSS
// `.hero-tile--top:hover`/`:focus-visible`, ne přes JS `.on` třídu jako ve
// zdroji — stejné zjednodušení jako u Hudba/Zbytek (zdroj to řeší kvůli
// tap-preview na dotyku).
//
// Dynamické seznamy `{{hwMid}}`/`{{hwFront}}` (extra okna rozsvícená blízko
// kurzoru) jsou ve zdroji vázané na JS runtime Claude Design nástroje —
// nejsou to statická data, není co doslovně zkopírovat, tak jsou vynechané.

const STAR_D = 'M0 -6L1.3 -1.3L6 0L1.3 1.3L0 6L-1.3 1.3L-6 0L-1.3 -1.3Z'
const BIRD_D = 'M0 4Q5 -1 10 5Q15 -1 20 4Q15 2 10 8Q5 2 0 4Z'

const STARS = [
    { l: 54.0, t: 64.5, s: 12.0, q: '' },
    { l: 145.7, t: 36.3, s: 8.4, q: 'q1' },
    { l: 255.0, t: 105.6, s: 9.6, q: 'q2' },
    { l: 326.1, t: 51.9, s: 7.2, q: 'q3' },
    { l: 514.2, t: 85.0, s: 10.8, q: '' },
    { l: 585.9, t: 36.9, s: 7.2, q: 'q1' },
    { l: 635.3, t: 146.2, s: 8.4, q: 'q2' },
    { l: 694.7, t: 65.7, s: 9.6, q: 'q3' },
    { l: 815.8, t: 176.8, s: 7.2, q: '' },
    { l: 696.5, t: 227.3, s: 6.0, q: 'q1' },
    { l: 86.3, t: 196.7, s: 7.2, q: 'q2' },
    { l: 556.6, t: 197.3, s: 6.0, q: 'q3' },
]

const BIRDS = [
    { l: 0, t: 0, w: 22, h: 11 },
    { l: 29, t: -14, w: 20, h: 10 },
    { l: 33, t: 12, w: 19, h: 9 },
    { l: 59, t: -25, w: 17, h: 9 },
    { l: 66, t: 20, w: 16, h: 8 },
]

// Okna střední vrstvy — sedm z nich má místo obdélníku "cibulovitý" tvar
// (clip-path), zbytek jsou prosté obdélníky se zaoblením nahoře.
const MID_WINDOWS = [
    { l: 135.9, t: 318.3, w: 8.0, h: 26.0, r: '4px 4px 0 0' },
    { l: 127.9, t: 430.2, w: 12.0, h: 34.0, r: '6px 6px 0 0', state: 'off', dur: '18s', delay: '-17.3s' },
    { l: 257.8, t: 318.3, w: 8.0, h: 26.0, r: '4px 4px 0 0', state: 'lit', dur: '14s', delay: '-2.7s' },
    { l: 249.8, t: 430.2, w: 12.0, h: 34.0, r: '6px 6px 0 0' },
    { l: 187.9, t: 424.2, w: 12.0, h: 38.0, r: '6px 6px 0 0', state: 'off', dur: '25s', delay: '-8.2s' },
    { l: 415.7, t: 180.3, w: 7.0, h: 36.1, clip: 'M0 36.1V8.4Q0 2.1 3.5 0Q7.0 2.1 7.0 8.4V36.1Z' },
    { l: 426.7, t: 180.3, w: 7.0, h: 36.1, clip: 'M0 36.1V8.4Q0 2.1 3.5 0Q7.0 2.1 7.0 8.4V36.1Z', state: 'lit', dur: '17s', delay: '-12.0s' },
    { l: 415.7, t: 378.8, w: 18.0, h: 57.4, clip: 'M0 57.4V21.6Q0 5.4 9.0 0Q18.0 5.4 18.0 21.6V57.4Z', state: 'off', dur: '18s', delay: '-15.1s' },
    { l: 506.6, t: 410.0, w: 14.0, h: 62.2, clip: 'M0 62.2V16.8Q0 4.2 7.0 0Q14.0 4.2 14.0 16.8V62.2Z' },
    { l: 609.5, t: 386.2, w: 9.0, h: 16.0, r: '1px', state: 'lit', dur: '20s', delay: '-1.3s' },
    { l: 627.5, t: 386.2, w: 9.0, h: 16.0, r: '1px', state: 'off', dur: '25s', delay: '-10.0s' },
    { l: 645.5, t: 386.2, w: 9.0, h: 16.0, r: '1px' },
    { l: 663.5, t: 416.2, w: 9.0, h: 16.0, r: '1px', state: 'off', dur: '18s', delay: '-12.9s' },
    { l: 681.5, t: 416.2, w: 9.0, h: 16.0, r: '1px', state: 'lit', dur: '23s', delay: '-7.6s' },
    { l: 681.5, t: 446.2, w: 9.0, h: 16.0, r: '1px' },
    { l: 609.5, t: 476.1, w: 9.0, h: 16.0, r: '1px', state: 'off', dur: '25s', delay: '-11.8s' },
    { l: 663.5, t: 476.1, w: 9.0, h: 16.0, r: '1px', state: 'lit', dur: '26s', delay: '-13.9s' },
]

const FRONT_WINDOWS = [
    { l: 22.0, t: 489.9, w: 10.0, h: 12.0, r: '5px 5px 0 0' },
    { l: 22.5, t: 517.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '18s', delay: '-10.7s' },
    { l: 41.2, t: 547.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 3.7, t: 577.0, w: 9.0, h: 15.0, r: '1px', state: 'lit', dur: '15s', delay: '-11.2s' },
    { l: 41.2, t: 577.0, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '25s', delay: '-13.6s' },
    { l: 95.6, t: 549.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 130.6, t: 537.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '18s', delay: '-8.5s' },
    { l: 174.1, t: 537.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 209.8, t: 517.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '25s', delay: '-15.4s' },
    { l: 232.8, t: 517.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 209.8, t: 547.1, w: 9.0, h: 15.0, r: '1px', state: 'lit', dur: '21s', delay: '-11.8s' },
    { l: 284.8, t: 527.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '18s', delay: '-6.3s' },
    { l: 284.8, t: 557.1, w: 9.0, h: 15.0, r: '1px', state: 'lit', dur: '24s', delay: '-21.1s' },
    { l: 322.7, t: 557.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 368.7, t: 519.3, w: 10.0, h: 12.0, r: '5px 5px 0 0', state: 'off', dur: '25s', delay: '-17.2s' },
    { l: 438.3, t: 537.1, w: 8.8, h: 12.0, r: '1px' },
    { l: 417.4, t: 568.1, w: 9.0, h: 15.0, r: '1px', state: 'lit', dur: '13s', delay: '-11.4s' },
    { l: 438.2, t: 568.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '18s', delay: '-4.1s' },
    { l: 517.9, t: 559.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 578.0, t: 509.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '25s', delay: '-19.0s' },
    { l: 600.8, t: 509.1, w: 9.0, h: 15.0, r: '1px', state: 'lit', dur: '16s', delay: '-15.7s' },
    { l: 578.0, t: 539.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 600.8, t: 569.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '18s', delay: '-1.9s' },
    { l: 654.0, t: 545.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 673.7, t: 545.1, w: 9.0, h: 15.0, r: '1px', state: 'lit', dur: '19s', delay: '-6.0s' },
    { l: -83.9, t: 532.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '25s', delay: '-20.8s' },
    { l: -64.9, t: 532.1, w: 9.0, h: 15.0, r: '1px' },
    { l: -64.9, t: 592.0, w: 9.0, h: 15.0, r: '1px', state: 'lit', dur: '22s', delay: '-8.3s' },
    { l: -23.0, t: 528.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '18s', delay: '-17.7s' },
    { l: 878.3, t: 523.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 857.3, t: 553.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '25s', delay: '-22.6s' },
    { l: 928.3, t: 522.1, w: 9.0, h: 15.0, r: '1px' },
    { l: 928.3, t: 552.1, w: 9.0, h: 15.0, r: '1px', state: 'off', dur: '18s', delay: '-15.5s' },
    { l: 928.3, t: 582.0, w: 9.0, h: 15.0, r: '1px', state: 'lit', dur: '14s', delay: '-6.9s' },
    { l: 707.4, t: 532.1, w: 12.0, h: 12.0, r: '1px' },
]

function Wl({ w }) {
    const style = {
        left: `${w.l}px`, top: `${w.t}px`, width: `${w.w}px`, height: `${w.h}px`,
        ...(w.r ? { borderRadius: w.r } : {}),
        ...(w.clip ? { clipPath: `path('${w.clip}')`, WebkitClipPath: `path('${w.clip}')` } : {}),
        ...(w.dur ? { animationDuration: w.dur, animationDelay: w.delay } : {}),
    }
    return <span className={`wl ${w.state ?? ''}`} style={style} />
}

export default function HeroTileTop() {
    return (
        <div className="hero-tile hero-tile--top">
            <span className="sky" aria-hidden="true">
                {STARS.map((s, i) => (
                    <span key={i} className={`st ${s.q}`} style={{ left: `${s.l}px`, top: `${s.t}px`, width: `${s.s}px`, height: `${s.s}px` }}>
                        <svg width="100%" height="100%" viewBox="-6 -6 12 12" fill="currentColor" aria-hidden="true"><path d={STAR_D} /></svg>
                    </span>
                ))}
                <span className="shoot s1" style={{ left: '449.6px', top: '40.5px' }} />
                <span className="shoot s2" style={{ left: '689.4px', top: '120.4px' }} />
            </span>

            <span className="flock-layer" aria-hidden="true">
                <span className="flock" style={{ left: '859px', top: '100px' }}>
                    {BIRDS.map((b, i) => (
                        <span key={i} className={`bd bd${i}`} style={{ left: `${b.l}px`, top: `${b.t}px`, width: `${b.w}px`, height: `${b.h}px` }}>
                            <svg width="100%" height="100%" viewBox="0 0 20 10" aria-hidden="true"><path d={BIRD_D} fill="var(--color-top-bird)" /></svg>
                        </span>
                    ))}
                </span>
            </span>

            {/* vzdálená vrstva — měsíc + nejhazovitější siluety */}
            <span className="top-layer" aria-hidden="true">
                <svg width="100%" height="100%" viewBox="0 0 850 640" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
                    <defs>
                        <filter id="ht-sh" x="-20%" y="-10%" width="140%" height="120%">
                            <feDropShadow dx="0" dy="-3" stdDeviation="5" floodColor="#160500" floodOpacity="0.55" />
                        </filter>
                        <linearGradient id="ht-haze-far" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="var(--color-top-bg-3)" stopOpacity="0" />
                            <stop offset="1" stopColor="var(--color-top-bg-3)" stopOpacity="0.55" />
                        </linearGradient>
                    </defs>
                    <path d="M612 112a28 28 0 1 1 -22 -44a22 22 0 1 0 22 44Z" fill="var(--color-top-moon)" />
                    <g filter="url(#ht-sh)">
                        <path d="M-10 600V401L17.0 391L44 401V600ZM41.0 600V432a9 9 0 0 1 18 0V600ZM47.25 600V432a12 12 0 0 1 24 0V600ZM56.5 600V432a12 12 0 0 1 24 0V600ZM68.75 600V432a9 9 0 0 1 18 0V600ZM77 600V397L101.5 387L126 397V600ZM124 600V428L142.5 418L161 428V600ZM159 600V410L180.0 392L201 410V600ZM199 600V398L221.5 378L244 398V600ZM242 600V428h38V600ZM255.0 428V394l6 -22l6 22V428ZM278 600V423L301.5 407L325 423V600ZM321.0 600V423a10 10 0 0 1 20 0V600ZM332.75 600V423a14 14 0 0 1 28 0V600ZM352.5 600V423a10 10 0 0 1 20 0V600ZM369.25 600V423a9 9 0 0 1 18 0V600ZM384 600V411L419.0 396L454 411V600ZM452 600V402L482.0 390L512 402V600ZM510 600V427L529.0 412L548 427V600ZM546 600V421h65V600ZM572.5 421V387l6 -22l6 22V421ZM609 600V409L628.5 389L648 409V600ZM646 600V428L672.5 411L699 428V600ZM697 600V421L714.5 402L732 421V600ZM730 600V400L756.0 384L782 400V600ZM780 600V417L811.0 405L842 417V600ZM840 600V414L870.0 398L900 414V600ZM-100 600V408L-77.0 394L-54 408V600ZM-56 600V415L-36.0 401L-16 415V600ZM-18 600V403L1.5 389L21 403V600ZM846 600V400L866.5 386L887 400V600ZM885 600V398L914.0 384L943 398V600ZM941 600V419L962.0 405L983 419V600Z" fill="var(--color-top-mass-far)" />
                    </g>
                    <path d="M-4.0 413.0h5.0v7.0h-5.0ZM10.0 413.0h5.0v7.0h-5.0ZM24.0 413.0h5.0v7.0h-5.0ZM97.0 409.0h5.0v7.0h-5.0ZM111.0 409.0h5.0v7.0h-5.0ZM144.0 440.0h5.0v7.0h-5.0ZM165.0 422.0h5.0v7.0h-5.0ZM179.0 422.0h5.0v7.0h-5.0ZM205.0 410.0h5.0v7.0h-5.0ZM219.0 410.0h5.0v7.0h-5.0ZM298.0 435.0h5.0v7.0h-5.0ZM404.0 423.0h5.0v7.0h-5.0ZM432.0 423.0h5.0v7.0h-5.0ZM472.0 414.0h5.0v7.0h-5.0ZM516.0 439.0h5.0v7.0h-5.0ZM530.0 439.0h5.0v7.0h-5.0ZM615.0 421.0h5.0v7.0h-5.0ZM652.0 440.0h5.0v7.0h-5.0ZM666.0 440.0h5.0v7.0h-5.0ZM703.0 433.0h5.0v7.0h-5.0ZM717.0 433.0h5.0v7.0h-5.0ZM736.0 412.0h5.0v7.0h-5.0ZM764.0 412.0h5.0v7.0h-5.0ZM814.0 429.0h5.0v7.0h-5.0ZM860.0 426.0h5.0v7.0h-5.0ZM874.0 426.0h5.0v7.0h-5.0Z" fill="var(--color-top-detail)" />
                    <rect x="-100" y="380" width="1050" height="220" fill="url(#ht-haze-far)" />
                </svg>
                <span className="glow far ltr g3" style={{ left: '-150px', top: '412px', width: '150px', height: '80px' }}><i /></span>
            </span>

            {/* střední vrstva — okna, vlajka, kouř, lucerna */}
            <span className="top-layer" aria-hidden="true">
                <svg width="100%" height="100%" viewBox="0 0 850 640" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
                    <g filter="url(#ht-sh)">
                        <path d="M150 560V352L195 322L240 352V560ZM118 560V300h32V560ZM116 302h36v-8h-36ZM118 294Q118 268 134 256Q150 268 150 294ZM132 258V236h4V258ZM128 240a6 6 0 0 1 12 0ZM240 560V300h32V560ZM238 302h36v-8h-36ZM240 294Q240 268 256 256Q272 268 272 294ZM254 258V236h4V258ZM250 240a6 6 0 0 1 12 0ZM356 560V414L378 372L400 414V560ZM398 560V232h54V560ZM394 236h62v-10h-62ZM394 226l4 -24l4 24ZM448 226l4 -24l4 24ZM408 228V168h34V228ZM405 170h40v-6h-40ZM408 166L425 38L442 166ZM423.5 40V24h3V40ZM403 168l3.5 -20l3.5 20ZM440 168l3.5 -20l3.5 20ZM452 560V400L466 346H576L588 400V560ZM462 560V398l5 -26l5 26V560ZM494 560V398l5 -26l5 26V560ZM526 560V398l5 -26l5 26V560ZM558 560V398l5 -26l5 26V560ZM600 560V372h8v-14h12v-14h14v-14h32v14h14v14h12v14h8V560ZM598 372l4 -14l4 14ZM618 358l4 -14l4 14ZM632 344l4 -14l4 14ZM678 344l4 -14l4 14ZM692 358l4 -14l4 14ZM704 372l4 -14l4 14ZM640 332V288h20V332ZM637 290h26l-13 -30ZM649 262V232h2V262ZM784 560V364h16V560ZM781 368h22v-8h-22Z" fill="var(--color-top-mass-mid)" />
                    </g>
                    <path d="M124.0 344.0V322.0A4.0 4.0 0 0 1 132.0 322.0V344.0ZM136.0 344.0V322.0A4.0 4.0 0 0 1 144.0 322.0V344.0ZM128.0 404.0V376.0A6.0 6.0 0 0 1 140.0 376.0V404.0ZM128.0 464.0V436.0A6.0 6.0 0 0 1 140.0 436.0V464.0ZM246.0 344.0V322.0A4.0 4.0 0 0 1 254.0 322.0V344.0ZM258.0 344.0V322.0A4.0 4.0 0 0 1 266.0 322.0V344.0ZM250.0 404.0V376.0A6.0 6.0 0 0 1 262.0 376.0V404.0ZM250.0 464.0V436.0A6.0 6.0 0 0 1 262.0 436.0V464.0ZM195 382m-17 0a17 17 0 1 0 34 0a17 17 0 1 0 -34 0ZM164.0 462.0V430.0A6.0 6.0 0 0 1 176.0 430.0V462.0ZM188.0 462.0V430.0A6.0 6.0 0 0 1 200.0 430.0V462.0ZM212.0 462.0V430.0A6.0 6.0 0 0 1 224.0 430.0V462.0ZM370.0 480.0V442.6Q370.0 430.0 377.0 425.8Q384.0 430.0 384.0 442.6V480.0ZM416.0 216.0V188.3Q416.0 182.0 419.5 179.9Q423.0 182.0 423.0 188.3V216.0ZM427.0 216.0V188.3Q427.0 182.0 430.5 179.9Q434.0 182.0 434.0 188.3V216.0ZM414.0 320.0V275.8Q414.0 256.0 425.0 249.4Q436.0 256.0 436.0 275.8V320.0ZM425 352m-11 0a11 11 0 1 0 22 0a11 11 0 1 0 -22 0ZM416.0 436.0V400.2Q416.0 384.0 425.0 378.6Q434.0 384.0 434.0 400.2V436.0ZM475.0 472.0V426.6Q475.0 414.0 482.0 409.8Q489.0 414.0 489.0 426.6V472.0ZM507.0 472.0V426.6Q507.0 414.0 514.0 409.8Q521.0 414.0 521.0 426.6V472.0ZM539.0 472.0V426.6Q539.0 414.0 546.0 409.8Q553.0 414.0 553.0 426.6V472.0ZM571.0 472.0V426.6Q571.0 414.0 578.0 409.8Q585.0 414.0 585.0 426.6V472.0ZM650 306m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0ZM610.0 386.0h9.0v16.0h-9.0ZM628.0 386.0h9.0v16.0h-9.0ZM646.0 386.0h9.0v16.0h-9.0ZM664.0 386.0h9.0v16.0h-9.0ZM682.0 386.0h9.0v16.0h-9.0ZM610.0 416.0h9.0v16.0h-9.0ZM628.0 416.0h9.0v16.0h-9.0ZM646.0 416.0h9.0v16.0h-9.0ZM664.0 416.0h9.0v16.0h-9.0ZM682.0 416.0h9.0v16.0h-9.0ZM610.0 446.0h9.0v16.0h-9.0ZM628.0 446.0h9.0v16.0h-9.0ZM646.0 446.0h9.0v16.0h-9.0ZM664.0 446.0h9.0v16.0h-9.0ZM682.0 446.0h9.0v16.0h-9.0ZM610.0 476.0h9.0v16.0h-9.0ZM628.0 476.0h9.0v16.0h-9.0ZM646.0 476.0h9.0v16.0h-9.0ZM664.0 476.0h9.0v16.0h-9.0ZM682.0 476.0h9.0v16.0h-9.0Z" fill="var(--color-top-detail)" />
                </svg>
                {MID_WINDOWS.map((w, i) => <Wl key={i} w={w} />)}
                <span className="flag" style={{ left: '650.5px', top: '232.3px', width: '18px', height: '12px' }} />
                <span className="puff" style={{ left: '785.4px', top: '344.2px', width: '12px', height: '12px' }} />
                <span className="puff p2" style={{ left: '785.4px', top: '344.2px', width: '12px', height: '12px' }} />
                <span className="puff p3" style={{ left: '785.4px', top: '344.2px', width: '12px', height: '12px' }} />
                <span className="lantern" style={{ left: '394.7px', top: '216.3px', width: '10px', height: '10px' }}><i /></span>
            </span>

            {/* blízká vrstva — nízké siluety + "světla aut" jedoucí po ulici */}
            <span className="top-layer" aria-hidden="true">
                <svg width="100%" height="100%" viewBox="0 0 850 640" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
                    <g filter="url(#ht-sh)">
                        <path d="M250 600V521a12 12 0 0 1 24 0V600ZM268 600V515a11 11 0 0 1 22 0V600ZM286 600V508a12 12 0 0 1 24 0V600ZM305 600V504a11 11 0 0 1 22 0V600ZM319 600V511a15 15 0 0 1 30 0V600ZM342 600V510a15 15 0 0 1 30 0V600ZM570 600V527a16 16 0 0 1 32 0V600ZM685 600V520a15 15 0 0 1 30 0V600ZM708 600V501a16 16 0 0 1 32 0V600ZM730 600V524a17 17 0 0 1 34 0V600ZM756 600V517a17 17 0 0 1 34 0V600ZM-114 600V512a14 14 0 0 1 28 0V600ZM-90 600V515a11 11 0 0 1 22 0V600ZM-73 600V501a14 14 0 0 1 28 0V600ZM-51 600V506a11 11 0 0 1 22 0V600ZM-34 600V503a12 12 0 0 1 24 0V600ZM-19 600V501a15 15 0 0 1 30 0V600ZM4 600V518a11 11 0 0 1 22 0V600ZM16 600V503a15 15 0 0 1 30 0V600ZM37 600V500a15 15 0 0 1 30 0V600ZM54 600V506a17 17 0 0 1 34 0V600ZM82 600V504a14 14 0 0 1 28 0V600ZM106 600V530a13 13 0 0 1 26 0V600ZM805 600V511a15 15 0 0 1 30 0V600ZM831 600V503a11 11 0 0 1 22 0V600ZM846 600V515a14 14 0 0 1 28 0V600ZM868 600V502a13 13 0 0 1 26 0V600ZM888 600V523a11 11 0 0 1 22 0V600ZM900 600V508a16 16 0 0 1 32 0V600ZM922 600V522a17 17 0 0 1 34 0V600Z" fill="var(--color-top-mass-near)" />
                    </g>
                </svg>
                <span className="glow ltr g1" style={{ left: '-210px', top: '468px', width: '210px', height: '130px' }}><i /></span>
                <span className="glow rtl g2" style={{ left: '-210px', top: '468px', width: '210px', height: '130px' }}><i /></span>
            </span>

            {/* přední vrstva — nejbližší, nejsvětlejší budovy + přízemní oblouky */}
            <span className="top-layer" aria-hidden="true">
                <svg width="100%" height="100%" viewBox="0 0 850 640" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
                    <g filter="url(#ht-sh)">
                        <path d="M-6 640V503L27.0 475L60 503V640ZM60 640V535H71.6V524H83.2V513H94.8V524H106.4V535H118V640ZM118 640V523Q132 523 138 507Q141 493 157 489Q173 493 176 507Q182 523 196 523V640ZM196 640V503L226.0 478L256 503V640ZM256 640V513L266 491H332L342 513V640ZM290 493v-12l9 -8l9 8v12ZM342 640V532L374.0 505L406 532V640ZM406 640V554H420.8V543H435.6V532H450.4V543H465.2V554H480V640ZM480 640V545Q491 545 496 529Q499 515 511 511Q523 515 526 529Q531 545 542 545V640ZM542 640V495L583.0 461L624 495V640ZM624 640V531L634 509H684L694 531V640ZM650 511v-12l9 -8l9 8v12ZM-92 640V518L-70.0 500L-48 518V640ZM-48 640V514L-27.0 496L-6 514V640ZM850 640V509L873.0 490L896 509V640ZM896 640V508L921.0 487L946 508V640ZM694 640V520h156V640ZM690 522h164v-10h-164ZM740 512V494h64V512ZM752 494L772 470L792 494ZM694 520V486h16V520ZM692 488h20l-10 -22ZM834 520V486h16V520ZM832 488h20l-10 -22Z" fill="var(--color-top-mass-front)" />
                    </g>
                    <path d="M22.0 501.8V494.8A5.0 5.0 0 0 1 32.0 494.8V501.8ZM3.8 517.0h9.0v15.0h-9.0ZM22.5 517.0h9.0v15.0h-9.0ZM41.2 517.0h9.0v15.0h-9.0ZM3.8 547.0h9.0v15.0h-9.0ZM22.5 547.0h9.0v15.0h-9.0ZM41.2 547.0h9.0v15.0h-9.0ZM3.8 577.0h9.0v15.0h-9.0ZM22.5 577.0h9.0v15.0h-9.0ZM41.2 577.0h9.0v15.0h-9.0ZM86.2 518.0h5.6v12.0h-5.6ZM73.3 549.0h9.0v15.0h-9.0ZM95.7 549.0h9.0v15.0h-9.0ZM73.3 579.0h9.0v15.0h-9.0ZM95.7 579.0h9.0v15.0h-9.0ZM152.0 513.0V504.0A5.0 5.0 0 0 1 162.0 504.0V513.0ZM130.8 537.0h9.0v15.0h-9.0ZM152.5 537.0h9.0v15.0h-9.0ZM174.2 537.0h9.0v15.0h-9.0ZM130.8 567.0h9.0v15.0h-9.0ZM152.5 567.0h9.0v15.0h-9.0ZM174.2 567.0h9.0v15.0h-9.0ZM221.0 503.0V496.0A5.0 5.0 0 0 1 231.0 496.0V503.0ZM210.0 517.0h9.0v15.0h-9.0ZM233.0 517.0h9.0v15.0h-9.0ZM210.0 547.0h9.0v15.0h-9.0ZM233.0 547.0h9.0v15.0h-9.0ZM210.0 577.0h9.0v15.0h-9.0ZM233.0 577.0h9.0v15.0h-9.0ZM266.0 527.0h9.0v15.0h-9.0ZM285.0 527.0h9.0v15.0h-9.0ZM304.0 527.0h9.0v15.0h-9.0ZM323.0 527.0h9.0v15.0h-9.0ZM266.0 557.0h9.0v15.0h-9.0ZM285.0 557.0h9.0v15.0h-9.0ZM304.0 557.0h9.0v15.0h-9.0ZM323.0 557.0h9.0v15.0h-9.0ZM369.0 531.2V524.2A5.0 5.0 0 0 1 379.0 524.2V531.2ZM357.3 546.0h9.0v15.0h-9.0ZM381.7 546.0h9.0v15.0h-9.0ZM357.3 576.0h9.0v15.0h-9.0ZM381.7 576.0h9.0v15.0h-9.0ZM438.6 537.0h8.8v12.0h-8.8ZM417.8 568.0h9.0v15.0h-9.0ZM438.5 568.0h9.0v15.0h-9.0ZM459.2 568.0h9.0v15.0h-9.0ZM506.0 535.0V526.0A5.0 5.0 0 0 1 516.0 526.0V535.0ZM494.7 559.0h9.0v15.0h-9.0ZM518.3 559.0h9.0v15.0h-9.0ZM578.0 490.6V483.6A5.0 5.0 0 0 1 588.0 483.6V490.6ZM555.8 509.0h9.0v15.0h-9.0ZM578.5 509.0h9.0v15.0h-9.0ZM601.2 509.0h9.0v15.0h-9.0ZM555.8 539.0h9.0v15.0h-9.0ZM578.5 539.0h9.0v15.0h-9.0ZM601.2 539.0h9.0v15.0h-9.0ZM555.8 569.0h9.0v15.0h-9.0ZM578.5 569.0h9.0v15.0h-9.0ZM601.2 569.0h9.0v15.0h-9.0ZM634.8 545.0h9.0v15.0h-9.0ZM654.5 545.0h9.0v15.0h-9.0ZM674.2 545.0h9.0v15.0h-9.0ZM634.8 575.0h9.0v15.0h-9.0ZM654.5 575.0h9.0v15.0h-9.0ZM674.2 575.0h9.0v15.0h-9.0ZM-84.0 532.0h9.0v15.0h-9.0ZM-65.0 532.0h9.0v15.0h-9.0ZM-84.0 562.0h9.0v15.0h-9.0ZM-65.0 562.0h9.0v15.0h-9.0ZM-84.0 592.0h9.0v15.0h-9.0ZM-65.0 592.0h9.0v15.0h-9.0ZM-40.0 528.0h9.0v15.0h-9.0ZM-23.0 528.0h9.0v15.0h-9.0ZM-40.0 558.0h9.0v15.0h-9.0ZM-23.0 558.0h9.0v15.0h-9.0ZM-40.0 588.0h9.0v15.0h-9.0ZM-23.0 588.0h9.0v15.0h-9.0ZM858.0 523.0h9.0v15.0h-9.0ZM879.0 523.0h9.0v15.0h-9.0ZM858.0 553.0h9.0v15.0h-9.0ZM879.0 553.0h9.0v15.0h-9.0ZM858.0 583.0h9.0v15.0h-9.0ZM879.0 583.0h9.0v15.0h-9.0ZM904.0 522.0h9.0v15.0h-9.0ZM929.0 522.0h9.0v15.0h-9.0ZM904.0 552.0h9.0v15.0h-9.0ZM929.0 552.0h9.0v15.0h-9.0ZM904.0 582.0h9.0v15.0h-9.0ZM929.0 582.0h9.0v15.0h-9.0ZM764.0 532.0h16.0v12.0h-16.0ZM708.0 532.0h12.0v12.0h-12.0ZM824.0 532.0h12.0v12.0h-12.0Z" fill="var(--color-top-detail)" />
                    <path d="M19.0 640.0V620.0A8.0 8.0 0 0 1 35.0 620.0V640.0ZM81.0 640.0V620.0A8.0 8.0 0 0 1 97.0 620.0V640.0ZM149.0 640.0V620.0A8.0 8.0 0 0 1 165.0 620.0V640.0ZM218.0 640.0V620.0A8.0 8.0 0 0 1 234.0 620.0V640.0ZM291.0 640.0V620.0A8.0 8.0 0 0 1 307.0 620.0V640.0ZM366.0 640.0V620.0A8.0 8.0 0 0 1 382.0 620.0V640.0ZM435.0 640.0V620.0A8.0 8.0 0 0 1 451.0 620.0V640.0ZM503.0 640.0V620.0A8.0 8.0 0 0 1 519.0 620.0V640.0ZM575.0 640.0V620.0A8.0 8.0 0 0 1 591.0 620.0V640.0ZM651.0 640.0V620.0A8.0 8.0 0 0 1 667.0 620.0V640.0ZM712 640V596a26 26 0 0 1 52 0V640ZM780 640V596a26 26 0 0 1 52 0V640Z" fill="var(--color-top-arch)" />
                </svg>
                {FRONT_WINDOWS.map((w, i) => <Wl key={i} w={w} />)}
            </span>

            <div className="hero-tile-overlay">
                <span className="hero-tile-eyebrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.7 5.7 6.2.8-4.6 4.3 1.2 6.2L12 16.8l-5.5 3 1.2-6.2L3.1 9.3l6.2-.8z" /></svg>
                    Výběr Plzeňáku
                </span>
                <h2 className="hero-tile-title">TOP akce</h2>
                <p className="hero-tile-lead">To nejlepší, co se v Plzni chystá — vyber si svůj večer.</p>
            </div>

            <Link to="/events?top=1" className="hero-tile-arrow" aria-label="Zobrazit TOP akce">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </Link>
        </div>
    )
}
