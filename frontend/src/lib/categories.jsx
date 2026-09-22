// Jediný zdroj pravdy pro kategorie akcí.
//
// Dřív existovaly tři nezávislé kopie (Home.jsx, Events.jsx, Header.jsx)
// s nekonzistentními hodnotami v URL parametru `kategorie` — někde `name`
// („Gastro“), někde `slug` („gastro“). Backend porovnává `kategorie`
// case-insensitive přes ILIKE proti řetězcům v `events.tags` — ILIKE
// sjednotí velikost písmen, ale ne diakritiku, takže slug bez háčků
// („pamatky“, „deti“) se s tagem („Památky“, „Pro děti“) nikdy neshodne.
// `name` je proto jediná bezpečná kanonická filtrovací hodnota.
//
// `slug` zůstává jen jako stabilní React `key`/URL segment pro budoucí
// vlastní kategorijní routy (/top-akce, /hudba, /zbytek-programu — viz
// implementační plán), nikdy se neposílá jako hodnota filtru `kategorie`.
//
// Ikony jsou funkce `(size) => JSX`, ne hotové elementy — každé dosavadní
// použité místo mělo svou vlastní velikost (26 px dlaždice na homepage,
// 18 px mega-menu v hlavičce, 16 px filtr na /events) a tahle konsolidace
// nemá měnit vzhled, jen sjednotit zdroj dat.

function gastroIcon(size = 24) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 8.5h8.5V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2z" /><path d="M14 11h2.5a2.75 2.75 0 0 1 0 5.5H14" /><path d="M5.5 8.5a2.2 2.2 0 0 1 2-2.2 2.6 2.6 0 0 1 4.5-1.5A2.3 2.3 0 0 1 14 8.5" />
    </svg>
  )
}

function kulturaIcon(size = 24) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h7v5a3.5 3.5 0 0 1-7 0z" /><circle cx="6.2" cy="7.2" r=".6" fill="currentColor" stroke="none" /><circle cx="8.8" cy="7.2" r=".6" fill="currentColor" stroke="none" /><path d="M13 9h7v5a3.5 3.5 0 0 1-7 0z" /><circle cx="15.2" cy="11.2" r=".6" fill="currentColor" stroke="none" /><circle cx="17.8" cy="11.2" r=".6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function hudbaIcon(size = 24) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V6.2l10-2V16" /><circle cx="6.8" cy="18" r="2.2" /><circle cx="16.8" cy="16" r="2.2" />
    </svg>
  )
}

function sportIcon(size = 24) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" /><path d="m12 8.8 3.04 2.21-1.16 3.58h-3.76l-1.16-3.58z" /><path d="M12 8.8V3.6M15.04 11.01 19.9 9.4M13.88 14.59 17 18.7M10.12 14.59 7 18.7M8.96 11.01 4.1 9.4" />
    </svg>
  )
}

function pamatkyIcon(size = 24) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3.5 9.5 8.5-5.5 8.5 5.5" /><path d="M3.5 19.5h17M4.8 9.5v10M9.6 9.5v10M14.4 9.5v10M19.2 9.5v10" />
    </svg>
  )
}

function detiIcon(size = 24) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15c2.8 0 5-2.5 5-5.6S14.8 4 12 4 7 6.4 7 9.4 9.2 15 12 15Z" /><path d="m11 15.2 1 1.3 1-1.3" /><path d="M12 16.5c0 1.2-1.5 1.2-1.5 2.4s1.5 1.2 1.5 2.4" />
    </svg>
  )
}

export const CATEGORIES = [
  { name: 'Gastro', slug: 'gastro', icon: gastroIcon },
  { name: 'Kultura', slug: 'kultura', icon: kulturaIcon },
  { name: 'Hudba', slug: 'hudba', icon: hudbaIcon },
  { name: 'Sport', slug: 'sport', icon: sportIcon },
  { name: 'Památky', slug: 'pamatky', icon: pamatkyIcon },
  { name: 'Pro děti', slug: 'deti', icon: detiIcon },
]
