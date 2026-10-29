import { useLayoutEffect } from 'react'
import { initMode } from '../../lib/landingTheme.js'

// Administrace má stejné tmavé a světlé téma jako homepage: tokeny --lp-* platí pod
// html.theme-lp a data-lp-mode vybírá režim (lib/landingTheme.js). Volba se sdílí
// s webem přes stejný klíč v localStorage.
//
// useLayoutEffect, ne useEffect: třída se musí na <html> dostat před prvním
// vykreslením, jinak by na okamžik problikla krémová stránka bez tématu.
export function useAdminTheme() {
    useLayoutEffect(() => {
        const root = document.documentElement
        root.classList.add('theme-lp', 'theme-admin')
        initMode()
        return () => root.classList.remove('theme-lp', 'theme-admin')
    }, [])
}
