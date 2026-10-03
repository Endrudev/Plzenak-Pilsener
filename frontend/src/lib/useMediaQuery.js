import { useEffect, useState } from 'react'

// True, dokud platí media query, a překreslí se, když se to změní (otočení
// telefonu, změna velikosti okna). Zatím ho potřebuje jen Hudba.jsx: scéna
// koncertu má pódium vpravo a v úzkém hero ho při výchozím ořezu na střed
// není vidět, viz focus="right" v components/scenes.
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

    useEffect(() => {
        const mq = window.matchMedia(query)
        const update = () => setMatches(mq.matches)
        update()
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [query])

    return matches
}
