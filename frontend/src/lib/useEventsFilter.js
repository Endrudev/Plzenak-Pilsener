import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getEvents } from './eventsApi.js'

// Sdílená fetch/stránkování logika pro tři dedikované kategorijní stránky
// (TopAkce.jsx, Hudba.jsx, ZbytekProgramu.jsx) — každá má PEVNÝ filtr
// (top='1' / kategorie='Hudba' / vyjma='TOP akce,Hudba'), uživatel ho
// nemůže změnit, jen hledat textem a řadit. To je hlavní rozdíl oproti
// Events.jsx, který má editovatelný filtr bar s vlastním draft/applied
// stavem — tenhle hook je pro ten složitější případ záměrně nepoužívá,
// je jednodušší mít ho samostatně, než ho ohýbat na pevný filtr navíc.
//
// fixedParams — objekt parametrů, co se posílají VŽDY (např. { top: '1' }).
export function useEventsFilter(fixedParams, perPage = 12) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const q = searchParams.get('q') || ''
  const razeni = searchParams.get('razeni') || 'konani'
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1)

  useEffect(() => {
    setLoading(true)
    getEvents({ ...fixedParams, q, razeni, page, perPage })
      .then(data => { setItems(data.items); setTotal(data.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
    // fixedParams je nový objekt při každém renderu volajícího — porovnává
    // se přes JSON, ne referenci, jinak by fetch běžel v nekonečné smyčce.
  }, [JSON.stringify(fixedParams), q, razeni, page, perPage])

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

  function setPage(next) {
    const params = new URLSearchParams(searchParams)
    if (next > 1) params.set('page', String(next)); else params.delete('page')
    setSearchParams(params)
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return { items, total, totalPages, loading, q, razeni, page, setQuery, setSort, setPage }
}
