import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { shouldScrollToTop } from '../../lib/shouldScrollToTop.js'

// Při otevření nové stránky vrátí okno na začátek. BrowserRouter to sám
// neudělá (to umí jen ScrollRestoration u data routeru), takže po kliknutí na
// odkaz v patičce nebo po výběru akce by stránka zůstala tam, kde byl člověk.
//
// Závisí jen na `pathname`: hledání a filtry (?q=, ?kategorie=) mění jen dotaz,
// takže je stránka neposouvá. Rozhodnutí je v lib/shouldScrollToTop.js.
//
// `behavior: 'instant'` je nutné: index.css zapíná `scroll-behavior: smooth`
// a bez něj by se při přechodu stránka viditelně „rolovala“ z konce nahoru.
export default function ScrollToTop() {
    const { pathname, hash } = useLocation()
    const navigationType = useNavigationType()

    useEffect(() => {
        if (shouldScrollToTop({ navigationType, hash })) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        }
        // hash a navigationType se čtou jen v okamžiku změny stránky, nespouštějí efekt
    }, [pathname])

    return null
}
