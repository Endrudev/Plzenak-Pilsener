import { useEffect, useState } from 'react'
import { ArrowRight, SearchIcon } from '../../landing/icons.jsx'
import '../../events/EventsControls/EventsControls.css'
import './CategoryControls.css'

const KDY = [
    { value: 'vse', label: 'Kdykoli' },
    { value: 'dnes', label: 'Dnes' },
    { value: 'tyden', label: 'Týden' },
    { value: 'vikend', label: 'Víkend' },
]

// Ovládání na stránkách kategorií. Stejná deska a stejné chování jako na Akcích
// (EventsControls): období a typ se použijí hned jedním klepnutím, text až
// odesláním (Enter nebo „Hledat“). Stav žije v URL, ovládání si drží jen
// rozepsaný text.
//
// Kategorie je na těchto stránkách pevná (je to jejich téma), proto tu není
// výběr kategorie. Čipy „Typ“ se ukážou jen na stránkách, kde dává smysl zúžit
// výběr o další kategorii (TOP akce, Zbytek programu), `typeOptions` je prázdné
// jinde.
export default function CategoryControls({
    q,
    kdy,
    typ,
    typeOptions = [],
    searchPlaceholder,
    searchLabel,
    onQueryChange,
    onKdyChange,
    onTypChange,
}) {
    const [text, setText] = useState(q)

    // URL se může změnit zvenčí (tlačítko Zpět, Vymazat filtry).
    useEffect(() => { setText(q) }, [q])

    function handleSubmit(e) {
        e.preventDefault()
        onQueryChange(text.trim())
    }

    return (
        <form className="ec cc enter" style={{ '--i': 3 }} onSubmit={handleSubmit} role="search">
            <div className="ec-core">
                <div className="ec-row">
                    <label className="ec-input" htmlFor="cc-q">
                        <span className="visually-hidden">{searchLabel}</span>
                        <SearchIcon />
                        <input
                            id="cc-q"
                            type="search"
                            placeholder={searchPlaceholder}
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                    </label>
                    <button type="submit" className="lp-btn ec-submit">
                        Hledat
                        <span className="lp-btn-ic"><ArrowRight /></span>
                    </button>
                </div>

                <div className="cc-filters">
                    <div className="lp-chips" role="group" aria-label="Kdy">
                        {KDY.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                className="lp-chip"
                                aria-pressed={kdy === option.value}
                                onClick={() => onKdyChange(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {typeOptions.length > 0 && (
                        <div className="ec-chips" role="group" aria-label="Typ akce">
                            {typeOptions.map(option => {
                                const on = typ === option.value
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className="lp-chip ec-chip"
                                        aria-pressed={on}
                                        onClick={() => onTypChange(on ? '' : option.value)}
                                    >
                                        {option.label}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </form>
    )
}
