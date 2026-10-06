import { useEffect } from 'react'
import HeroTileTop from './HeroTileTop.jsx'
import HeroTileMusic from './HeroTileMusic.jsx'
import HeroTileRest from './HeroTileRest.jsx'
import { preloadScenes } from '../scenes/LazyScenes.jsx'
import './HeroBento.css'

// Tři vstupní cesty místo jednoho hero baneru: "ukaž mi to nejlepší"
// (TOP), "chci konkrétně hudbu" (Hudba), "ukaž mi zbytek, rozhodnu se
// sám" (Zbytek programu). Nahrazuje dřívější statický fotokarusel, co
// uměl zobrazit jen první akci a neměl fungující šipky/tečky.
//
// Úvodní choreografie (tři dlaždice vyjedou za sebou, nadpisy se odkryjí po slovech, přeběhne
// lesk) běží při každém načtení homepage. Dřív běžela jen při první návštěvě v relaci, ale
// autor ji chce vidět pokaždé. Při prefers-reduced-motion se nespouští (viz HeroBento.css).
// Třída is-intro je proto trvalá, animace se spustí samy při vykreslení dlaždic.

export default function HeroBento() {
    // Město a koncert se přehrávají z videa, předem se stahuje jen živá scéna Zbytku programu.
    useEffect(() => { preloadScenes(['program']) }, [])

    return (
        <div className="hero-bento is-intro">
            <HeroTileTop />
            <HeroTileMusic />
            <HeroTileRest />
        </div>
    )
}
