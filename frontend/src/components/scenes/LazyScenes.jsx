import { lazy, Suspense } from 'react'
import './scenes.css'

// Líné načtení scén. Samotné soubory v téhle složce jsou beze změny převzaté
// z balíčku plzenak-scenes (redesign/) a nesmí se upravovat — tenhle soubor
// je jediný, který je vlastní. Kresba všech tří scén váží dohromady kolem
// 60 kB po kompresi, takže se stahuje až při prvním vykreslení, ne s hlavním
// balíkem. scenes.css se importuje hned nahoře: je malé a bez něj by se
// placeholder a hotová scéna vykreslily bez rozměrů.
const loadCity = () => import('./CityScene.jsx')
const loadConcert = () => import('./ConcertScene.jsx')
const loadProgram = () => import('./ProgramScene.jsx')
const CityScene = lazy(loadCity)
const ConcertScene = lazy(loadConcert)
const ProgramScene = lazy(loadProgram)

// Stáhne kód scén předem, v době, kdy je prohlížeč nečinný. Homepage ho volá
// po vykreslení, takže při prvním najetí na dlaždici už chunk čeká v cache a
// scéna se přimontuje bez čekání na síť. import() se deduplikuje, takže
// následné lazy() načtení použije stejný modul.
export function preloadScenes() {
    const run = () => { loadCity(); loadConcert(); loadProgram() }
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 })
    else setTimeout(run, 1500)
}

// Barva pozadí z ukázek balíčku (html/city.html, concert.html, program.html).
// Placeholder ji má stejnou jako hotová scéna, ať při načtení nebliká jiná.
const BG = { city: '#140602', concert: '#140602', program: '#e2e8d7' }

function Placeholder({ color }) {
    return <div aria-hidden="true" style={{ width: '100%', height: '100%', background: color }} />
}

export function LazyCityScene(props) {
    return (
        <Suspense fallback={<Placeholder color={BG.city} />}>
            <CityScene {...props} />
        </Suspense>
    )
}

export function LazyConcertScene(props) {
    return (
        <Suspense fallback={<Placeholder color={BG.concert} />}>
            <ConcertScene {...props} />
        </Suspense>
    )
}

export function LazyProgramScene(props) {
    return (
        <Suspense fallback={<Placeholder color={BG.program} />}>
            <ProgramScene {...props} />
        </Suspense>
    )
}
