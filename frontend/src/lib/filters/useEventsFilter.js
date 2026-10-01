import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getEvents } from '../eventsApi.js'

// Sdílená fetch/stránkování logika pro tři dedikované kategorijní stránky
// (TopAkce.jsx, Hudba.jsx, ZbytekProgramu.jsx) — každá má PEVNÝ filtr
// (top='1' / kategorie='Hudba' / vyjma='TOP akce,Hudba'), uživatel ho
// nemůže změnit, jen hledat textem a řadit. To je hlavní rozdíl oproti
// Events.jsx, který má editovatelný filtr bar s vlastním draft/applied
// stavem — tenhle hook je pro ten složitější případ záměrně nepoužívá,
// je jednodušší mít ho samostatně, než ho ohýbat na pevný filtr navíc.
//
// fixedParams — objekt parametrů, co se posílají VŽDY (např. { top: '1' }).
//
// Kromě pevného filtru má stránka dvě VOLITELNÉ, uživatelem ovladatelné
// položky navíc (doslova podle handoffu — "Typ akce" dropdown a "Kdy"
// přepínač nad výsledky):
//   - `typ` / setTyp    — doplňkové zúžení podle kategorie (posílá se jako
//     `kategorie` na backend, VEDLE pevného filtru, ne místo něj — obě
//     podmínky backend AND-uje, viz routes/events.js). Volající stránka
//     rozhoduje, jestli tenhle dropdown vůbec nabízí (viz CategoryFilterBar).
//   - `kdy` / setKdy     — 'vse'|'dnes'|'tyden'|'vikend', posílá se jako
//     `datum` (stejný param a stejné SQL, co už používá Events.jsx —
//     'tyden' tady mapuje na existující '7dni' hodnotu backendu).
export function useEventsFilter(fixedParams, perPage = 12) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const q = searchParams.get('q') || ''
  const razeni = searchParams.get('razeni') || 'konani'
  const typ = searchParams.get('typ') || ''
  const kdy = searchParams.get('kdy') || 'vse'
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1)

  const datum = kdy === 'tyden' ? '7dni' : kdy === 'vse' ? undefined : kdy

  useEffect(() => {
    setLoading(true)
    // `typ` se posílá jako `kategorie` VEDLE fixedParams — jen když je
    // vybraný, jinak by (na stránkách, co samy mají kategorie jako pevný
    // filtr, např. Hudba.jsx) přebil ten pevný na undefined a rozbil ho.
    const params = { ...fixedParams, q, razeni, datum, page, perPage }
    if (typ) params.kategorie = typ
    getEvents(params)
      .then(data => { setItems(data.items); setTotal(data.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
    // fixedParams je nový objekt při každém renderu volajícího — porovnává
    // se přes JSON, ne referenci, jinak by fetch běžel v nekonečné smyčce.
  }, [JSON.stringify(fixedParams), q, razeni, typ, datum, page, perPage])

  function setQuery(next) {
    const params = new URLSearchParams(searchParams)
    if (next.trim()) params.set('q', next.trim()); else params.delete('q')
    params.delete('page')
    setSearchParams(params)
  }

  function setSort(next) {
    const params = new URLSearchParams(searchParams)
    if (next && next !== 'konani') params.set('razeni', next); else params.delete('razeni')
    params.delete('page')
    setSearchParams(params)
  }

  function setTyp(next) {
    const params = new URLSearchParams(searchParams)
    if (next) params.set('typ', next); else params.delete('typ')
    params.delete('page')
    setSearchParams(params)
  }

  function setKdy(next) {
    const params = new URLSearchParams(searchParams)
    if (next && next !== 'vse') params.set('kdy', next); else params.delete('kdy')
    params.delete('page')
    setSearchParams(params)
  }

  function setPage(next) {
    const params = new URLSearchParams(searchParams)
    if (next > 1) params.set('page', String(next)); else params.delete('page')
    setSearchParams(params)
  }

  // "Zrušit filtry" — vrátí q/typ/kdy na výchozí, řazení a stránku nechává
  // (ta se řídí zvlášť, reset "vyhledávání" na ni nesahá ve zdroji taky).
  function resetFilters() {
    const params = new URLSearchParams(searchParams)
    params.delete('q'); params.delete('typ'); params.delete('kdy'); params.delete('page')
    setSearchParams(params)
  }

  const dirty = Boolean(q || typ || kdy !== 'vse')
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return { items, total, totalPages, loading, q, razeni, typ, kdy, dirty, page, setQuery, setSort, setTyp, setKdy, resetFilters, setPage }
}
