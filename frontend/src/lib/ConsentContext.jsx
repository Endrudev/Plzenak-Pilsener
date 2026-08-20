import { createContext, useContext, useState } from 'react'
import { readConsent, writeConsent } from './consent.js'

const ConsentContext = createContext(null)

export function ConsentProvider({children}) {
    const [consent, setConsent] = useState(() => readConsent())
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    
    function save(values){
        const updated = writeConsent(values)
        setConsent(updated)
        setIsSettingsOpen(false)
    }
    function acceptAll() {
        save({ maps: true })
    }
    function rejectAll() {
        save({ maps: false })
    }
    function openSettings() {
        setIsSettingsOpen(true)
    }
    function closeSettings() {
        setIsSettingsOpen(false)
    }
    return (
        <ConsentContext.Provider value={{ consent, acceptAll, rejectAll, save, openSettings, closeSettings, isSettingsOpen }}>
            {children}
        </ConsentContext.Provider>
    )
}

export function useConsent() {
    return useContext(ConsentContext)
}
