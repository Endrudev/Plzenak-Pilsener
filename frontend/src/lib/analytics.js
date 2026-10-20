// Vypnutí měření návštěvnosti (Umami) pro tento prohlížeč.
//
// Klíč umami.disabled čte přímo měřicí skript Umami (index.html) před každým
// odesláním: když v localStorage existuje, nic se nepošle. Hodnota je jedno,
// rozhoduje jen přítomnost, proto se při zapnutí klíč maže, ne přepisuje.
// localStorage může být zakázaný (soukromý režim, blokované úložiště), proto
// try/catch: stránka kvůli tomu nesmí spadnout.
export const OPT_OUT_KEY = 'umami.disabled'

function defaultStorage() {
    try {
        return window.localStorage
    } catch {
        return null
    }
}

export function isMeasurementDisabled(storage = defaultStorage()) {
    try {
        return storage?.getItem(OPT_OUT_KEY) != null
    } catch {
        return false
    }
}

// Vrací, jestli se změna podařila (false = úložiště nejde zapsat).
export function setMeasurementDisabled(disabled, storage = defaultStorage()) {
    try {
        if (!storage) return false
        if (disabled) storage.setItem(OPT_OUT_KEY, '1')
        else storage.removeItem(OPT_OUT_KEY)
        return true
    } catch {
        return false
    }
}
