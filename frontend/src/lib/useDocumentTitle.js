import { useEffect } from 'react'

// Nastaví titulek v záložce, dokud je stránka zobrazená. Bez toho by po
// přechodu mezi stránkami zůstal titulek té první, kterou poslal server.
// Prázdná hodnota (detail akce, než se načte) titulek nemění.
export function useDocumentTitle(title) {
    useEffect(() => {
        if (title) document.title = title
    }, [title])
}
