import { useEffect, useRef, useState } from 'react'

// Obal sekce, která se rozjede, až se objeví v okně. Bez hooku v každé sekci:
//   <Reveal as="section" id="top-section"> ... </Reveal>
//
// Sám nic neanimuje. Přidá třídu .reveal--in, jakmile se sekce dostane do
// záběru, a děti s třídou .enter (nástup se zpožděním podle pořadí) do té doby
// stojí na začátku (viz index.css). Díky tomu se karty nerozjedou někde
// pod okrajem obrazovky, kde je nikdo nevidí.
//
// Bez IntersectionObserveru (starý prohlížeč) se zobrazí hned.
export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
    const ref = useRef(null)
    const [shown, setShown] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return undefined
        if (!('IntersectionObserver' in window)) {
            setShown(true)
            return undefined
        }
        // -10 % dole: sekce se spustí, až je kus vidět, ne ve chvíli, kdy se
        // její horní hrana dotkne spodku okna.
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShown(true)
                io.disconnect()
            }
        }, { rootMargin: '0px 0px -10% 0px' })
        io.observe(el)
        return () => io.disconnect()
    }, [])

    return (
        <Tag ref={ref} className={`reveal${shown ? ' reveal--in' : ''}${className ? ' ' + className : ''}`} {...rest}>
            {children}
        </Tag>
    )
}
