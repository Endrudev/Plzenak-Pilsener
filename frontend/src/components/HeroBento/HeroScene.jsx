import { useEffect, useRef, useState } from 'react'
import './HeroScene.css'

// Jak dlouho zůstane živá scéna po odjetí myši v DOM. Krátké znovunajetí
// (přejetí přes okraj dlaždice) ji tak nemusí stavět znovu.
const GRACE_MS = 400

// Ilustrace dlaždice na homepage. Ve výchozím stavu je to jen obrázek (poster,
// předrenderovaný statický stav scény, všechna okna svítí). Živá scéna z
// components/scenes/ se přimontuje až při najetí myší a prolne se přes poster,
// teprve když je vykreslená. Důvod: scéna má tisíce SVG prvků a stovky animací,
// a když je tři najednou v DOM, stojí vykreslování i ve chvíli, kdy se nehýbou.
// Při přimontování zase vznikne jeden těžký snímek, který takhle schová poster,
// pod kterým se to děje.
//
// Poster se generuje z hotové stránky (viz 02 Frontend/Hero scény ve vaultu):
// celá kresba bez ztmavení a bez přesahu vrstev. Má poměr stran scény a
// object-fit: cover s ukotvením dole, stejně jako ořez preserveAspectRatio="…
// slice" ve scéně, takže poster a živá scéna sedí na sebe. Vrstvy města a
// koncertu mají ve scéně pevný přesah (-24px -48px, pro paralaxu), a protože je
// v pixelech, ve zmenšené dlaždici scénu znatelně přiblíží. Poster ho kvůli
// stejnému záběru opakuje (bleed). Ztmavení pod text je zvlášť (shade), protože
// závisí na rozměru dlaždice, ne na obrázku.
export default function HeroScene({ poster, position, active, Live, liveProps, bleed = false, shade }) {
    const [mounted, setMounted] = useState(false)
    const [ready, setReady] = useState(false)
    const liveRef = useRef(null)

    useEffect(() => {
        if (active) {
            setMounted(true)
            return undefined
        }
        setReady(false)
        const timer = setTimeout(() => setMounted(false), GRACE_MS)
        return () => clearTimeout(timer)
    }, [active])

    // Živá scéna je lazy: nejdřív v DOM stojí placeholder a skutečná scéna
    // přijde, až se dotáhne chunk. "Hotovo" znamená, že .pz-scene existuje a
    // uběhlo pár snímků, během kterých prohlížeč vykreslil první stav.
    useEffect(() => {
        if (!active || !mounted) return undefined
        let raf = 0
        let waited = 0
        let settle = 0
        const check = () => {
            if (liveRef.current?.querySelector('.pz-scene')) {
                if (++settle >= 3) { setReady(true); return }
            } else if (++waited > 600) {
                return
            }
            raf = requestAnimationFrame(check)
        }
        check()
        return () => cancelAnimationFrame(raf)
    }, [active, mounted])

    return (
        <>
            <img
                className={`hero-poster${bleed ? ' hero-poster--bleed' : ''}`}
                src={poster}
                alt=""
                aria-hidden="true"
                draggable={false}
                decoding="async"
                style={{ objectPosition: position }}
            />
            {shade && <div className={`hero-poster-shade hero-poster-shade--${shade}`} />}
            {mounted && (
                <div ref={liveRef} className={`hero-live${ready ? ' is-ready' : ''}`}>
                    <Live animate intro={false} {...liveProps} />
                </div>
            )}
        </>
    )
}
