import { useEffect, useState } from 'react'
import FilterSelect from '../../FilterSelect/FilterSelect.jsx'
import { ArrowRight, SearchIcon } from '../../landing/icons.jsx'
import { CATEGORIES } from '../../../lib/filters/categories.jsx'
import { DATE_OPTIONS } from '../../../lib/filters/dateFilters.js'
import './EventsControls.css'

// Ovládání seznamu akcí: hledání, Kdy, Kde, kategorie a TOP akce.
//
// Chování: **všechno kromě textu se použije hned**, jedním klepnutím. Text se
// použije až odesláním (Enter nebo „Hledat“), protože se při psaní nemá po
// každém písmenu měnit výsledek. Stav žije jen v URL (`applied` přijde zvenku),
// ovládání si drží jen rozepsaný text. Dřív byl celý panel formulář, který se
// odeslal najednou, takže klepnutí na kategorii nic neudělalo, dokud se
// nestisklo „Hledat“.
//
// Kategorie jsou jen jednou (jako čipy), ne ještě podruhé jako výběr: dva prvky
// pro jeden parametr by byly zbytečný šum. „Zdarma“ tu není, databáze nemá cenu.
const STAR_PATH = 'm12 4 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z'

export default function EventsControls({ applied, locations, loading, onChange }) {
    const [text, setText] = useState(applied.q)

    // URL se může změnit zvenčí (tlačítko Zpět, odkaz z menu kategorií v hlavičce).
    useEffect(() => { setText(applied.q) }, [applied.q])

    function handleSubmit(e) {
        e.preventDefault()
        onChange({ q: text.trim() })
    }

    return (
        <form className="ec lp-fs enter" style={{ '--i': 0 }} onSubmit={handleSubmit}>
            <div className="ec-core">
                <div className="ec-row">
                    <label className="ec-input" htmlFor="ec-q">
                        <span className="visually-hidden">Hledat akce, místa nebo interprety</span>
                        <SearchIcon />
                        <input
                            id="ec-q"
                            type="search"
                            placeholder="Interpret, místo nebo název akce"
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                    </label>
                    <button type="submit" className="lp-btn ec-submit" disabled={loading}>
                        {loading ? 'Hledám' : 'Hledat'}
                        <span className="lp-btn-ic"><ArrowRight /></span>
                    </button>
                </div>

                <div className="ec-selects">
                    <FilterSelect
                        label="Kdy"
                        placeholder="Kdykoli"
                        value={applied.datum}
                        onChange={v => onChange({ datum: v })}
                        options={DATE_OPTIONS}
                    />
                    <FilterSelect
                        label="Kde"
                        placeholder="Celá Plzeň"
                        value={applied.misto}
                        onChange={v => onChange({ misto: v })}
                        options={locations.map(loc => ({ value: loc, label: loc }))}
                    />
                </div>

                <div className="ec-chips" role="group" aria-label="Kategorie">
                    {CATEGORIES.map(c => {
                        const on = applied.kategorie.toLowerCase() === c.name.toLowerCase()
                        return (
                            <button
                                key={c.name}
                                type="button"
                                className="lp-chip ec-chip"
                                aria-pressed={on}
                                onClick={() => onChange({ kategorie: on ? '' : c.name })}
                            >
                                <span className="ec-chip-ic" aria-hidden="true">{c.icon(16)}</span>
                                {c.name}
                            </button>
                        )
                    })}
                    <button
                        type="button"
                        className="lp-chip ec-chip"
                        aria-pressed={applied.top}
                        onClick={() => onChange({ top: !applied.top })}
                    >
                        <svg className="ec-chip-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d={STAR_PATH} />
                        </svg>
                        TOP akce
                    </button>
                </div>
            </div>
        </form>
    )
}
