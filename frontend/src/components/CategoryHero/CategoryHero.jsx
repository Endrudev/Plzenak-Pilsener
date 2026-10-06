import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import HeroVideo from '../HeroBento/HeroVideo.jsx'
import './CategoryHero.css'

// Hero pás stránek TOP akce, Hudba a Zbytek programu. Zachovaná je jedna věc:
// animovaná papírová scéna (CityScene, ConcertScene, ProgramScene), která se
// předává přes `scene` a leží v celé ploše pásu. Text nad ní je nový, bez
// štítku nad nadpisem a bez řádku se statistikou (počet akcí je u výsledků).
//
// `theme="light"` je denní scéna (Zbytek programu), text je tmavý. Ostatní jsou
// noční, text je krémový (--dk-*), ve světlém i tmavém tématu stránky stejně.
//
// `sceneShift`: scéna je o kousek vyšší než pás a spodek se ořízne, aby horní hrana
// desky s ovládáním ležela v rovině hlav lamp (jen CityScene u TOP akcí).
//
// `video` ({ webm, mp4, poster, position }): scéna se přehrává ze smyčkového videa místo
// živého SVG (tisíce prvků, stovky animací). `scene` zůstává jako zdroj, ze kterého se video
// renderuje: adresa s ?hero-live vynutí živou scénu (scripts/render-hero-videos.mjs).
//
// Spodek pásu je rovný, zaoblené rohy dělá světlé pozadí stránky (.lp-sheet).
export default function CategoryHero({
    background,
    theme = 'dark',
    sceneShift = false,
    scene,
    video,
    breadcrumbLabel,
    title,
    lead,
}) {
    const cls = `cat-hero${theme === 'light' ? ' cat-hero--light' : ''}${sceneShift ? ' cat-hero--shift' : ''}`

    const forceLive = useMemo(() => new URLSearchParams(window.location.search).has('hero-live'), [])

    return (
        <header className={cls} style={{ background }}>
            <div className="cat-hero-scene">
                {video && !(forceLive && scene)
                    ? <HeroVideo autoplay poster={video.poster} position={video.position} webm={video.webm} mp4={video.mp4} />
                    : scene}
            </div>

            <div className="lp-wrap cat-hero-in">
                <nav className="cat-hero-crumbs enter" style={{ '--i': 0 }} aria-label="Drobečková navigace">
                    <Link to="/">Plzeňák</Link> / <Link to="/events">Akce</Link> / <span>{breadcrumbLabel}</span>
                </nav>
                <h1 className="cat-hero-title enter" style={{ '--i': 1 }}>{title}</h1>
                <p className="cat-hero-lead enter" style={{ '--i': 2 }}>{lead}</p>
            </div>
        </header>
    )
}
