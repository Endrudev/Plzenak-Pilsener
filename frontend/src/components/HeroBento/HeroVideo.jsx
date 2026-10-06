import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../lib/useMediaQuery.js'

// Ilustrace dlaždice jako smyčkové video (od 2026-10-06). Dřív se při najetí přimontovala živá
// SVG scéna se sedmi tisíci prvků a stovkami CSS animací, která pod kurzorem stála hlavní
// vlákno (změřeno: TOP akce 17 snímků za sekundu, Hudba 50). Video se dekóduje mimo hlavní
// vlákno, takže je plynulé na jakémkoli zařízení, a stojí jen stažení souboru.
//
// Chování:
//   - výchozí stav je poster (stejný obrázek jako dřív), video je pod ním neviditelné,
//   - najetí myší (nebo fokus z klávesnice) video spustí, po odjetí ho zastaví na aktuálním
//     snímku a nechá viditelné, při dalším najetí pokračuje tam, kde skončilo,
//   - video se prolne přes poster, až skutečně běží (událost playing), takže se nikdy neukáže
//     prázdný nebo černý snímek,
//   - zařízení bez hoveru (telefon) přehrávají video, dokud je dlaždice aspoň z poloviny vidět,
//   - s prefers-reduced-motion se nepřehrává nic, zůstává poster,
//   - soubor se stahuje až po vteřině nečinnosti po načtení stránky a ne při zapnuté úspoře dat.
//
// Video nese celý záběr scény v rozměru dlaždice (viz scripts/render-hero-videos.mjs), takže
// sedí na poster stejně jako dřív živá scéna. Ztmavení pod nadpisem (shade) zůstává zvlášť nad
// oběma, protože závisí na rozměru dlaždice.
export default function HeroVideo({ poster, position, bleed = false, shade, active, webm, mp4 }) {
    const ref = useRef(null)
    const wrapRef = useRef(null)
    const [shown, setShown] = useState(false)
    const [prefetch, setPrefetch] = useState(false)
    const [visible, setVisible] = useState(false)
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
    const canHover = useMediaQuery('(hover: hover)')

    // Stažení po nečinnosti: najetí hned po načtení nečeká na síť, ale video nesoutěží se stránkou.
    useEffect(() => {
        if (reduced || navigator.connection?.saveData) return undefined
        const run = () => setPrefetch(true)
        const id = 'requestIdleCallback' in window
            ? window.requestIdleCallback(run, { timeout: 4000 })
            : window.setTimeout(run, 2000)
        return () => {
            if ('cancelIdleCallback' in window) window.cancelIdleCallback(id)
            else window.clearTimeout(id)
        }
    }, [reduced])

    // Viditelnost jen pro zařízení bez hoveru.
    useEffect(() => {
        const el = wrapRef.current
        if (!el || canHover || !('IntersectionObserver' in window)) return undefined
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.5 })
        io.observe(el)
        return () => io.disconnect()
    }, [canHover])

    const wantsPlay = !reduced && (canHover ? active : visible)

    useEffect(() => {
        const v = ref.current
        if (!v) return
        if (wantsPlay) {
            // play() vrací slib, který odmítne, když ho přeruší pause() nebo prohlížeč zakáže
            // přehrávání. Obojí je v pořádku, jen se nesmí objevit jako neošetřená chyba.
            v.play()?.catch(() => {})
        } else {
            v.pause()
        }
    }, [wantsPlay])

    return (
        <div ref={wrapRef} className="hero-video-wrap">
            <img
                className={`hero-poster${bleed ? ' hero-poster--bleed' : ''}`}
                src={poster}
                alt=""
                aria-hidden="true"
                draggable={false}
                decoding="async"
                style={{ objectPosition: position }}
            />
            <video
                ref={ref}
                className={`hero-video${shown ? ' is-shown' : ''}`}
                muted
                loop
                playsInline
                disablePictureInPicture
                aria-hidden="true"
                tabIndex={-1}
                preload={!reduced && (prefetch || active) ? 'auto' : 'none'}
                onPlaying={() => setShown(true)}
                style={{ objectPosition: position }}
            >
                {/* MP4 první: při 60 snímcích je menší než VP9 WebM (koncert 2,0 proti 3,7 MB) a
                    všechny větší prohlížeče ho dekódují hardwarově. WebM je záloha pro
                    prohlížeče bez H.264 (některé instalace Firefoxu na Linuxu). */}
                {mp4 && <source src={mp4} type="video/mp4" />}
                {webm && <source src={webm} type="video/webm" />}
            </video>
            {shade && <div className={`hero-poster-shade hero-poster-shade--${shade}`} />}
        </div>
    )
}
