import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import HeroVideo from '../HeroBento/HeroVideo.jsx'
import './CategoryHero.css'

// Hero pás stránek TOP akce, Hudba a Zbytek programu a stránky 404. Zachovaná je jedna věc:
// scéna, která leží v celé ploše pásu (živá, nebo video, nebo jen obrázek). Text nad ní je
// bez štítku nad nadpisem, bez perexu a bez řádku se statistikou (počet akcí je u výsledků).
//
// `theme="light"` je denní scéna (Zbytek programu), text je tmavý. Ostatní jsou
// noční, text je krémový (--dk-*), ve světlém i tmavém tématu stránky stejně.
//
// `sceneShift`: scéna je o kousek vyšší než pás a spodek se ořízne, aby horní hrana
// desky s ovládáním ležela v rovině hlav lamp (jen CityScene u TOP akcí).
//
// Scéna se předává třemi způsoby, podle toho, co stránka potřebuje:
//   - `video` ({ webm, mp4, poster, position }): smyčkové video místo živého SVG (tisíce prvků,
//     stovky animací). `scene` zůstává jako zdroj, ze kterého se video renderuje: adresa
//     s ?hero-live vynutí živou scénu (scripts/render-hero-videos.mjs).
//   - `poster` (+ `posterPosition`): jen nehybný obrázek, bez stahování videa. Pro stránky,
//     kde by pět megabajtů videa nebylo adekvátní (404).
//   - `scene`: živá scéna.
//
// `crumbs` přepíše drobečkovou navigaci (výchozí je Plzeňák / Akce / breadcrumbLabel).
// `compact` pás nedrží pevnou výšku, ale přizpůsobí se obsahu, a `children` se vloží pod nadpis.
//
// Spodek pásu je rovný, zaoblené rohy dělá světlé pozadí stránky (.lp-sheet).
export default function CategoryHero({
    background,
    theme = 'dark',
    sceneShift = false,
    scene,
    video,
    poster,
    posterPosition = '50% 100%',
    crumbs,
    compact = false,
    breadcrumbLabel,
    title,
    children,
}) {
    const cls = [
        'cat-hero',
        theme === 'light' && 'cat-hero--light',
        sceneShift && 'cat-hero--shift',
        compact && 'cat-hero--compact',
    ].filter(Boolean).join(' ')

    const forceLive = useMemo(() => new URLSearchParams(window.location.search).has('hero-live'), [])

    const trail = crumbs ?? [
        { to: '/', label: 'Plzeňák' },
        { to: '/events', label: 'Akce' },
    ]

    let sceneNode = scene
    if (video && !(forceLive && scene)) {
        sceneNode = <HeroVideo autoplay poster={video.poster} position={video.position} webm={video.webm} mp4={video.mp4} />
    } else if (poster) {
        sceneNode = <img className="cat-hero-still" src={poster} alt="" aria-hidden="true" draggable={false} style={{ objectPosition: posterPosition }} />
    }

    return (
        <header className={cls} style={{ background }}>
            <div className="cat-hero-scene">{sceneNode}</div>

            <div className="lp-wrap cat-hero-in">
                <nav className="cat-hero-crumbs enter" style={{ '--i': 0 }} aria-label="Drobečková navigace">
                    {trail.map(item => (
                        <span key={item.to}><Link to={item.to}>{item.label}</Link> / </span>
                    ))}
                    <span>{breadcrumbLabel}</span>
                </nav>
                <h1 className="cat-hero-title enter" style={{ '--i': 1 }}>{title}</h1>
                {children}
            </div>
        </header>
    )
}
