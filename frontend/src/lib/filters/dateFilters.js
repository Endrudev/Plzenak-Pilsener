// Jediný zdroj pravdy pro filtr `datum` — hodnoty musí sedět s větvemi na
// backendu (backend/src/routes/events.js: dnes/vikend/7dni/30dni).
// Neznámou hodnotu backend tiše ignoruje, takže překlep se neprojeví chybou.
//
// Dřív žilo jen v Events.jsx; teď ho používá i sekce Hledání na Home.jsx —
// stejný důvod, proč existuje lib/categories.jsx (jeden zdroj namísto dvou
// nezávislých kopií, co se časem rozejdou).
export const DATE_OPTIONS = [
  { value: 'dnes', label: 'Dnes' },
  { value: 'vikend', label: 'Tento víkend' },
  { value: '7dni', label: 'Nejbližších 7 dní' },
  { value: '30dni', label: 'Nejbližších 30 dní' },
]
