import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import HeroScene from './HeroScene.jsx'
import HeroVideo from './HeroVideo.jsx'
import { ArrowUpRight } from '../landing/icons.jsx'
import { useHoverActive } from '../../lib/useHoverActive.js'

// Společná kostra tří velkých dlaždic na homepage (TOP akce, Hudba, Zbytek programu).
// Dlaždice jí předávají buď smyčkové video (`video`, TOP akce a Hudba, viz HeroVideo.jsx),
// nebo živou scénu (`Live`, Zbytek programu, který je lehký a má JS střídání scén).
//
// Polish 2026-10-06: nadpis se při načtení odkrývá po slovech zdola (maska), šipka je šikmo
// nahoru jako na kartách jinde a při najetí se vysune. Světlo za kurzorem a paralaxa scény se
// pohybem myši se odebraly, pohyb při najetí teď dělá jen samotné video.
//
// Nadpis je pořád jeden h2 s plným textem, rozdělení na slova je jen pro animaci.
function Words({ text }) {
    const words = text.split(' ')
    return words.map((w, i) => (
        <Fragment key={i}>
            <span className="ht-w" style={{ '--w': i }}><span>{w}</span></span>
            {i < words.length - 1 ? ' ' : ''}
        </Fragment>
    ))
}

export default function HeroTile({ to, mod, index, poster, position, bleed, shade, Live, liveProps, video, title, titleMod }) {
    const { active, handlers } = useHoverActive()
    // Adresa s ?hero-live vynutí živou scénu i tam, kde je jinak video. Potřebuje ji skript, který
    // z živé scény videa renderuje (scripts/render-hero-videos.mjs). Návštěvníci ji nepoužívají.
    const forceLive = useMemo(() => new URLSearchParams(window.location.search).has('hero-live'), [])

    return (
        <Link
            to={to}
            className={`hero-tile hero-tile--${mod}`}
            style={{ '--i': index }}
            {...handlers}
        >
            <div className="hero-tile-scene">
                {video && !(forceLive && Live) ? (
                    <HeroVideo poster={poster} position={position} bleed={bleed} shade={shade} active={active} webm={video.webm} mp4={video.mp4} />
                ) : (
                    <HeroScene poster={poster} position={position} bleed={bleed} shade={shade} active={active} Live={Live} liveProps={liveProps} />
                )}
            </div>

            <div className="hero-tile-overlay">
                <h2 className={`hero-tile-title${titleMod ? ` hero-tile-title--${titleMod}` : ''}`}>
                    <Words text={title} />
                </h2>
            </div>

            <span className="hero-tile-arrow" aria-hidden="true">
                <ArrowUpRight size={20} />
            </span>
        </Link>
    )
}
