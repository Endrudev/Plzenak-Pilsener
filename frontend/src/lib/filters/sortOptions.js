// Jediný zdroj pravdy pro řazení — hodnoty musí sedět s `SORTS` na
// backendu (backend/src/routes/events.js). Dřív jen v Events.jsx, teď i
// v TopAkce.jsx/Hudba.jsx/ZbytekProgramu.jsx — stejný důvod jako
// lib/categories.jsx a lib/dateFilters.js.
export const SORT_OPTIONS = [
  { value: 'konani', label: 'Nejdřív se koná' },
  { value: 'pridano', label: 'Naposledy přidané' },
]
