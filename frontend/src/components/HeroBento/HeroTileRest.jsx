import { Link } from 'react-router-dom'
import './HeroTileRest.css'

// Malá papírová postavička — sdílený stavební prvek pro všechny tři výjevy,
// ať drží stejný jazyk jako dav/interpret v HeroTileMusic.
function Figure({ className = '' }) {
    return (
        <div className={`ht-figure ${className}`}>
            <div className="ht-figure-head" />
            <div className="ht-figure-body" />
        </div>
    )
}

// Tři výjevy z běžného večera v Plzni — pár u stánku, přípitek s partou,
// dítě s balónkem. Střídají se přes zaostření/rozmazání a mlhu (viz CSS,
// `ht-vignette` smyčka), stejně jako v handoff motion specu. Klidový stav
// ukazuje jen první výjev staticky, smyčka se pustí na hoveru/focusu.
export default function HeroTileRest({ categories = [] }) {
    return (
        <Link to="/events" className="hero-tile hero-tile--rest">
            <div className="ht-rest-scene" aria-hidden="true">
                <div className="ht-vignette ht-vignette--1">
                    <div className="ht-stall" />
                    <div className="ht-stall-top" />
                    <Figure className="ht-fig-a" />
                    <Figure className="ht-fig-b" />
                </div>

                <div className="ht-vignette ht-vignette--2">
                    <Figure className="ht-fig-c" />
                    <Figure className="ht-fig-d" />
                    <Figure className="ht-fig-e" />
                    <div className="ht-glass" />
                </div>

                <div className="ht-vignette ht-vignette--3">
                    <Figure className="ht-fig-f ht-fig--small" />
                    <div className="ht-balloon-string" />
                    <div className="ht-balloon" />
                </div>

                <div className="ht-fog" />
            </div>

            <div className="hero-tile-overlay">
                <h2 className="hero-tile-title hero-tile-title--sm">Zbytek programu</h2>
                <div className="ht-rest-cats">
                    {categories.slice(0, 5).map(cat => (
                        <span key={cat.name} className="ht-rest-cat">{cat.icon(13)}</span>
                    ))}
                </div>
            </div>

            <span className="hero-tile-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
            </span>
        </Link>
    )
}
