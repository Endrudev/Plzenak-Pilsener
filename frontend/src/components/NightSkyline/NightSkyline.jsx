import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { LANDMARKS } from './landmarks.js'
import { useFlashlight } from './useFlashlight.js'
import { eventBadge, parseCzechDate } from '../../lib/eventBadge.js'
import { disc } from './cityscape.js'
import { VIEW, SKY, BACKDROP, LANDMARKS_ART, PAINT_ORDER, STREET, figure } from './skyline.js'
import './NightSkyline.css'

function pickEvent(landmark, events, today) {
    if (!landmark.locationMatch?.length) return null

    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const upcoming = events
        .filter(event => typeof event.location === 'string')
        .filter(event => landmark.locationMatch.some(
            needle => event.location.toLowerCase().includes(needle.toLowerCase())
        ))
        .map(event => ({ event, when: parseCzechDate(event.date) }))
        .filter(item => item.when && item.when >= midnight)
        .sort((a, b) => a.when - b.when)

    return upcoming.length ? upcoming[0].event : null
}

function describe(landmark, event) {
    if (!event) return `${landmark.name}. ${landmark.fact}`
    const where = landmark.approximate ? ' poblíž' : ''
    return `${landmark.name}. Akce${where}: ${event.name}, ${event.date}.`
}

function Extras({ id, art }) {
    if (id === 'katedrala') {
        return <path className="spark" d={disc(70, -470, 44)} />
    }
    if (id === 'synagoga') {
        return <path className="spark" d={disc(70, -326, 22)} />
    }
    if (id === 'nova-scena') {
        return <path className="breathe" d={disc(74, -90, 62)} />
    }
    if (id === 'techmania') {
        return (
            <g className="stars">
                {[[70, -86, 2.2], [92, -102, 1.8], [114, -86, 2.2], [82, -112, 1.6], [104, -72, 2], [126, -70, 1.7], [58, -72, 1.9]]
                    .map(([cx, cy, r], i) => (
                        <path key={i} d={disc(cx, cy, r)} style={{ '--i': i }} />
                    ))}
            </g>
        )
    }
    if (id === 'prazdroj') {
        return (
            <g className="steam">
                {[[3, -208, 9, 6], [3, -208, 7, 5], [3, -208, 11, 7]].map(([cx, cy, rx, ry], i) => (
                    <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} style={{ '--i': i }} />
                ))}
            </g>
        )
    }
    if (id === 'radnice') {
        return (
            <>
                {art.flags.map((flag, i) => (
                    <g key={i} transform={`translate(${flag.x} 0)`}>
                        <path d={flag.pole} />
                        <path className="flag" d={flag.d} style={{ '--flag-delay': `${i * -1.1}s` }} />
                    </g>
                ))}
                {art.walkers.map((walker, i) => (
                    <g key={`w${i}`} transform={`translate(${walker.x} 0)`}>
                        <g
                            className="figure"
                            style={{ '--walk': walker.walk, '--walk-dur': walker.dur, '--walk-delay': walker.delay }}
                        >
                            <path d={figure(walker.flip)} />
                        </g>
                    </g>
                ))}
            </>
        )
    }
    if (id === 'depo') {
        return (
            <g className="tram" transform={`translate(${art.tram.x} 0)`}>
                <path d={art.tram.mass} />
                <path className="cut" d={art.tram.cuts} />
            </g>
        )
    }
    return null
}

export default function NightSkyline({ events = [], className = '' }) {
    const rootRef = useRef(null)
    const [active, setActive] = useState(null)
    const pointerKind = useRef('mouse')

    useFlashlight(rootRef)

    const matched = useMemo(() => {
        const today = new Date()
        return LANDMARKS.map(landmark => ({
            landmark,
            event: pickEvent(landmark, events, today),
        }))
    }, [events])

    const byId = useMemo(
        () => Object.fromEntries(matched.map(entry => [entry.landmark.id, entry])),
        [matched]
    )

    const activate = useCallback((id, target) => {
        const root = rootRef.current
        if (!root || !target) return
        const shape = target.getBoundingClientRect()
        const host = root.getBoundingClientRect()
        setActive({
            id,
            x: shape.left - host.left + shape.width / 2,
            y: shape.top - host.top,
        })
    }, [])

    useEffect(() => {
        if (!active || pointerKind.current !== 'touch') return
        function onOutside(event) {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setActive(null)
            }
        }
        document.addEventListener('pointerdown', onOutside)
        return () => document.removeEventListener('pointerdown', onOutside)
    }, [active])

    const activeEntry = active ? byId[active.id] : null
    const badge = activeEntry?.event ? eventBadge(activeEntry.event.date) : null

    return (
        <div
            id="night-skyline"
            className={`${className}${active ? ' is-focused' : ''}`.trim()}
            ref={rootRef}
        >
            <div className="glow-layer" aria-hidden="true" />

            <svg
                className="scene"
                viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
                preserveAspectRatio="xMidYMax meet"
                role="group"
                aria-label="Interaktivní noční panorama Plzně — najetím na budovu se zobrazí její akce"
            >
                <g className="layer-sky" aria-hidden="true">
                    <path className="moon" d={SKY.moon} />
                    <path className="stars-field" d={SKY.stars} />
                </g>

                {['haze', 'far', 'mid'].map(plane => (
                    <g className={`layer-${plane}`} key={plane} aria-hidden="true">
                        <path className="edge" d={`${BACKDROP[plane].walls} ${BACKDROP[plane].roofs}`} />
                        <path d={BACKDROP[plane].walls} />
                        <path className="roof" d={BACKDROP[plane].roofs} />
                        <path className="cut" d={BACKDROP[plane].cuts} />
                    </g>
                ))}

                <g className="layer-landmarks">
                    {PAINT_ORDER.map(id => {
                        const art = LANDMARKS_ART[id]
                        const entry = byId[id]
                        if (!art || !entry) return null
                        return (
                            <g
                                key={id}
                                className={`landmark landmark--${art.depth}${active?.id === id ? ' is-active' : ''}`}
                                transform={`translate(${art.x} ${art.base})`}
                            >
                                <path className="edge" d={`${art.mass} ${art.roof ?? ''}`} />
                                <path className="mass" d={art.mass} />
                                {art.roof && <path className="roof" d={art.roof} />}
                                <path className="cut" d={art.cuts} />
                                <g className="detail" aria-hidden="true">
                                    {art.lit && <path className="lit" d={art.lit} />}
                                    {art.litGlass && <path className="lit lit--glass" d={art.litGlass} />}
                                    {art.litCool && <path className="lit lit--cool" d={art.litCool} />}
                                    <Extras id={id} art={art} />
                                </g>
                                {art.trim && <path className="trim" d={art.trim} />}
                                <path
                                    className="hit"
                                    d={`${art.mass} ${art.roof ?? ''}`}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={describe(entry.landmark, entry.event)}
                                    onPointerEnter={e => {
                                        pointerKind.current = e.pointerType
                                        if (e.pointerType !== 'touch') activate(id, e.currentTarget)
                                    }}
                                    onPointerLeave={e => {
                                        if (e.pointerType !== 'touch') setActive(null)
                                    }}
                                    onPointerDown={e => { pointerKind.current = e.pointerType }}
                                    onClick={e => {
                                        if (pointerKind.current !== 'touch') return
                                        if (active?.id === id) setActive(null)
                                        else activate(id, e.currentTarget)
                                    }}
                                    onFocus={e => activate(id, e.currentTarget)}
                                    onBlur={() => setActive(null)}
                                    onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur() }}
                                />
                            </g>
                        )
                    })}
                </g>

                <g className="layer-street" aria-hidden="true">
                    <path className="edge" d={STREET.curb} />
                    <path className="curb" d={STREET.curb} />
                    <path className="rails" d={STREET.rails} />
                    <path className="sleepers" d={STREET.sleepers} />
                    {STREET.props.map((prop, i) => (
                        <path className="prop" key={i} d={prop.d} transform={`translate(${prop.x} ${STREET.baseline})`} />
                    ))}
                    {STREET.walkers.map((walker, i) => (
                        <path key={`p${i}`} d={figure(walker.flip)} transform={`translate(${walker.x} 516)`} />
                    ))}
                </g>
            </svg>

            {activeEntry && (
                <div
                    className="tip"
                    aria-hidden="true"
                    style={{ '--tip-x': `${active.x}px`, '--tip-y': `${active.y}px` }}
                >
                    <span className="tip-name">{activeEntry.landmark.name}</span>
                    {activeEntry.event ? (
                        <span className="tip-event">
                            <span className="tip-line">
                                <span className="tip-date">
                                    {activeEntry.landmark.approximate && 'poblíž · '}
                                    {activeEntry.event.date}
                                </span>
                                {badge && (
                                    <span className={`tip-badge${badge.type === 'today' ? ' tip-badge--today' : ''}`}>
                                        {badge.text}
                                    </span>
                                )}
                            </span>
                            <span className="tip-title">{activeEntry.event.name}</span>
                        </span>
                    ) : (
                        <span className="tip-fact">{activeEntry.landmark.fact}</span>
                    )}
                </div>
            )}
        </div>
    )
}
