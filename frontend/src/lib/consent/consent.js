export const CONSENT_VERSION = 1
const STORAGE_KEY = 'plzenak-consent'

export function readConsent(){
    const localStorageKey = localStorage.getItem(STORAGE_KEY)
    if (!localStorageKey){
        return null
    }
    let parsed
    try{
        parsed = JSON.parse(localStorageKey)
    }catch(err){
        return null
    }
    if ((typeof(parsed) === 'object') && parsed !== null && (typeof(parsed.maps) === 'boolean') && (parsed.v === CONSENT_VERSION)){
        return parsed
    }else{
        return null
    }
}

export function writeConsent(values){
    const constObj = {
        v: CONSENT_VERSION,
        ts: new Date().toISOString(),
        maps: values.maps
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(constObj))
    return constObj
}
