import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from './useMediaQuery.js'

// Pro dlaždice s ilustrací na homepage: scéna se animuje jen pod myší nebo s
// fokusem z klávesnice. Tři scény najednou zahltí vykreslování (měřeno, viz
// 02 Frontend/Hero scény ve vaultu), takže se hýbe nejvýš jedna.
//
// Zařízení bez hoveru (telefon) animují pořád, jinak by se dlaždice nedala
// "probudit". Tam je v záběru nejvýš pár dlaždic a scény se mimo obrazovku
// pozastaví samy.
//
// Fokus se počítá jen z klávesnice (:focus-visible). Po kliknutí myší zůstane
// odkaz zaměřený i po odjetí kurzoru a dlaždice by se jinak nikdy neuklidnila.
//
// Posouvání stránky není najetí. Když se pod nehybnou myší posouvá obsah,
// prohlížeč dlaždici „opustí“ a „najede“ na ni, i když se kurzor nepohnul. Bez
// ošetření by se živá scéna při každém scrollu přes hero odmontovala a při
// návratu znovu postavila (těžký snímek, viditelné cukání). Proto se během
// scrollu se enter/leave jen zapamatuje a po jeho skončení se podle posledního
// z nich stav srovná (jen u dlaždice, která je v okně vidět). Čtení :hover samo
// o sobě nestačí: hned po scrollu ho prohlížeč ještě nemusí mít aktualizované a
// scéna by zbytečně zhasla a vzápětí se rozjela znovu.
const SCROLL_SETTLE_MS = 200

export function useHoverActive() {
    const canHover = useMediaQuery('(hover: hover)')
    const [on, setOn] = useState(false)
    const ref = useRef(null)
    const scrolling = useRef(false)
    const pending = useRef(null)   // 'enter' | 'leave' | null: co se stalo během scrollu

    useEffect(() => {
        let timer = 0
        function onScroll() {
            scrolling.current = true
            clearTimeout(timer)
            timer = setTimeout(() => {
                scrolling.current = false
                const el = ref.current
                if (!el) return
                // Dlaždice mimo okno se nesrovnává: kurzor je zrovna nad něčím
                // jiným a živá scéna by se zbytečně odmontovala, aby se po
                // návratu hned postavila znovu. Srovná se, až bude zase vidět.
                const r = el.getBoundingClientRect()
                if (r.bottom < 0 || r.top > window.innerHeight) return
                const last = pending.current
                pending.current = null
                if (last === 'enter') setOn(true)
                else if (last === 'leave') setOn(el.matches(':hover') || el.matches(':focus-visible'))
            }, SCROLL_SETTLE_MS)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            clearTimeout(timer)
        }
    }, [])

    return {
        active: !canHover || on,
        handlers: {
            ref,
            onPointerEnter: () => { if (scrolling.current) pending.current = 'enter'; else setOn(true) },
            onPointerLeave: () => { if (scrolling.current) pending.current = 'leave'; else setOn(false) },
            onFocus: (e) => { if (e.target.matches(':focus-visible')) setOn(true) },
            onBlur: () => setOn(false),
        },
    }
}
