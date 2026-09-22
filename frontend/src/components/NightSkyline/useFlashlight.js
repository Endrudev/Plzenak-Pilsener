import { useEffect } from 'react'
const LERP = 0.14
const SETTLED = 0.5

export function useFlashlight(ref) {
    useEffect(() => {
        const root = ref.current
        if (!root) return
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

        let frame = 0
        let targetX = 0, targetY = 0
        let lightX = 0, lightY = 0
        let seeded = false

        function write() {
            root.style.setProperty('--ns-mx', `${lightX}px`)
            root.style.setProperty('--ns-my', `${lightY}px`)
        }

        function step() {
            const k = reduced.matches ? 1 : LERP
            lightX += (targetX - lightX) * k
            lightY += (targetY - lightY) * k
            write()

            const moving = Math.abs(targetX - lightX) > SETTLED || Math.abs(targetY - lightY) > SETTLED
            frame = moving ? requestAnimationFrame(step) : 0
        }

        function onMove(event) {
            const box = root.getBoundingClientRect()
            targetX = event.clientX - box.left
            targetY = event.clientY - box.top
            if (!seeded) {
                lightX = targetX
                lightY = targetY
                seeded = true
                write()
                root.classList.add('has-light')
            }

            if (!frame) frame = requestAnimationFrame(step)
        }

        function onLeave() {
            root.classList.remove('has-light')
            seeded = false
        }

        root.addEventListener('pointermove', onMove)
        root.addEventListener('pointerleave', onLeave)

        return () => {
            root.removeEventListener('pointermove', onMove)
            root.removeEventListener('pointerleave', onLeave)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [ref])
}
