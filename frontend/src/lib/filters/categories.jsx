import { GastroIcon, HudbaIcon, KulturaIcon, SportIcon, PamatkyIcon, DetiIcon } from './categoryIcons.jsx'

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

export const CATEGORIES = [
  { name: 'Gastro', slug: 'gastro', icon: size => <GastroIcon size={size} /> },
  { name: 'Kultura', slug: 'kultura', icon: size => <KulturaIcon size={size} /> },
  { name: 'Hudba', slug: 'hudba', icon: size => <HudbaIcon size={size} /> },
  { name: 'Sport', slug: 'sport', icon: size => <SportIcon size={size} /> },
  { name: 'Památky', slug: 'pamatky', icon: size => <PamatkyIcon size={size} /> },
  { name: 'Pro děti', slug: 'deti', icon: size => <DetiIcon size={size} /> },
]
