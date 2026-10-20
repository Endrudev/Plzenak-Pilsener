import { useState } from 'react'
import { isMeasurementDisabled, setMeasurementDisabled } from '../../lib/analytics.js'
import './MeasurementOptOut.css'

// Vypnutí a zapnutí měření návštěvnosti pro tento prohlížeč (Zásady, oddíl 2).
// Měření běží bez souhlasu na základě oprávněného zájmu, tohle je námitka
// proti němu. Účinek je okamžitý: skript Umami čte klíč před každým odesláním.
export default function MeasurementOptOut() {
    const [disabled, setDisabled] = useState(() => isMeasurementDisabled())
    const [failed, setFailed] = useState(false)

    function toggle() {
        const next = !disabled
        if (setMeasurementDisabled(next)) {
            setDisabled(next)
            setFailed(false)
        } else {
            setFailed(true)
        }
    }

    return (
        <div className="mo">
            <p className="mo-status" aria-live="polite">
                {failed
                    ? 'Volbu se nepodařilo uložit, prohlížeč nepovoluje zápis do úložiště webu.'
                    : disabled
                        ? 'V tomto prohlížeči je měření návštěvnosti vypnuté.'
                        : 'V tomto prohlížeči se návštěvnost měří.'}
            </p>
            <button type="button" className="mo-btn" onClick={toggle} aria-pressed={disabled}>
                {disabled ? 'Znovu zapnout měření' : 'Vypnout měření'}
            </button>
        </div>
    )
}
