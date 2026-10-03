import { useState } from 'react'
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
export function useHoverActive() {
    const canHover = useMediaQuery('(hover: hover)')
    const [on, setOn] = useState(false)

    return {
        active: !canHover || on,
        handlers: {
            onPointerEnter: () => setOn(true),
            onPointerLeave: () => setOn(false),
            onFocus: (e) => { if (e.target.matches(':focus-visible')) setOn(true) },
            onBlur: () => setOn(false),
        },
    }
}
