import BuildingSkyline from '../NightSkyline/BuildingSkyline.jsx'
import './CategoryHero.css'

// Osmicípá hvězda — stejný tvar jako v TOP akce dlaždici / na Events.jsx.
const STAR_D = 'M0 -6L1.3 -1.3L6 0L1.3 1.3L0 6L-1.3 1.3L-6 0L-1.3 -1.3Z'

// Stejná sada 34 hvězd jako na Events.jsx (doslova ze zdroje, viz
// Events.jsx komentář) — sdílené i sem, ať tři nové stránky (TOP akce,
// Hudba, Zbytek programu) drží stejný noční jazyk jako zbytek appky.
const STARS = [
  { l: 474, t: 102, s: 8, q: '' }, { l: 268, t: 57, s: 5, q: 'q1' }, { l: 184, t: 43, s: 6, q: 'q2' },
  { l: 1047, t: 61, s: 8, q: 'q3' }, { l: 1324, t: 15, s: 8, q: '' }, { l: 1008, t: 124, s: 8, q: 'q1' },
  { l: 1023, t: 57, s: 8, q: 'q2' }, { l: 193, t: 132, s: 6, q: 'q3' }, { l: 50, t: 76, s: 10, q: '' },
  { l: 844, t: 129, s: 8, q: 'q1' }, { l: 242, t: 74, s: 5, q: 'q2' }, { l: 139, t: 106, s: 10, q: 'q3' },
  { l: 782, t: 35, s: 5, q: '' }, { l: 703, t: 68, s: 5, q: 'q1' }, { l: 1029, t: 140, s: 6, q: 'q2' },
  { l: 1200, t: 44, s: 10, q: 'q3' }, { l: 141, t: 146, s: 5, q: '' }, { l: 1010, t: 57, s: 6, q: 'q1' },
  { l: 1195, t: 124, s: 10, q: 'q2' }, { l: 921, t: 81, s: 10, q: 'q3' }, { l: 740, t: 117, s: 6, q: '' },
  { l: 334, t: 32, s: 10, q: 'q1' }, { l: 1423, t: 88, s: 7, q: 'q2' }, { l: 1328, t: 134, s: 10, q: 'q3' },
  { l: 1287, t: 58, s: 7, q: '' }, { l: 317, t: 99, s: 10, q: 'q1' }, { l: 592, t: 138, s: 5, q: 'q2' },
  { l: 1049, t: 147, s: 6, q: 'q3' }, { l: 714, t: 70, s: 5, q: '' }, { l: 615, t: 95, s: 6, q: 'q1' },
  { l: 556, t: 16, s: 8, q: 'q2' }, { l: 531, t: 104, s: 7, q: 'q3' }, { l: 863, t: 52, s: 8, q: '' },
  { l: 248, t: 50, s: 5, q: 'q1' },
]

// Tmavý noční hero pás pro dedikované kategorijní stránky (TOP akce,
// Hudba, Zbytek programu) — stejná stavební sada jako hero na Events.jsx
// (noční obloha + BuildingSkyline + přesah za sticky hlavičku), jen
// zabalená do jedné znovupoužitelné komponenty, ať se nekopíruje 3×.
//
// Handoff má pro tyhle tři stránky vlastní, obrovské ručně kreslené
// scény (708px vysoké, stovky SVG prvků každá) — stejná bilance jako u
// EventCard pozadí: jednorázová ilustrace pro konkrétní demo obsah,
// ne systém co jde použít na tři různé stránky se skutečnými daty.
// Tahle komponenta drží stejný vizuální jazyk (noční obloha, silueta
// budov, jantarový přechod), ne pixel kopii.
export default function CategoryHero({ eyebrow, title, lead, skylineSeeds = { back: 31, front: 7, win: 23 }, children }) {
  return (
    <>
      <div className="cat-hero-backdrop" aria-hidden="true" />
      <div className="cat-hero-skyline-wrap" aria-hidden="true">
        <span className="cat-hero-sky">
          {STARS.map((s, i) => (
            <span key={i} className={`st ${s.q}`} style={{ left: `${(s.l / 1440) * 100}%`, top: `${s.t}px`, width: `${s.s}px`, height: `${s.s}px` }}>
              <svg width="100%" height="100%" viewBox="-6 -6 12 12" fill="currentColor"><path d={STAR_D} /></svg>
            </span>
          ))}
          <span className="shoot s1" style={{ left: `${(520 / 1440) * 100}%`, top: '96px' }} />
          <span className="shoot s2" style={{ left: `${(1220 / 1440) * 100}%`, top: '118px' }} />
        </span>
        <svg className="cat-hero-moon" width="46" height="46" viewBox="0 0 46 46" style={{ left: `${(1180 / 1440) * 100}%`, top: '96px' }}>
          <path d="M40 36a22 22 0 1 1 -17 -34a17 17 0 1 0 17 34Z" fill="var(--color-top-moon)" />
        </svg>
        <span className="cat-hero-glow" />
        <BuildingSkyline className="cat-hero-buildings" backSeed={skylineSeeds.back} frontSeed={skylineSeeds.front} winSeed={skylineSeeds.win} />
      </div>

      <div className="cat-hero">
        <span className="cat-hero-eyebrow">{eyebrow}</span>
        <h1 className="cat-hero-title">{title}</h1>
        {lead && <p className="cat-hero-lead">{lead}</p>}
        {children}
      </div>
    </>
  )
}
