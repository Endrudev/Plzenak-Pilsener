import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Reveal from '../../Reveal/Reveal.jsx'
import FilterSelect from '../../FilterSelect/FilterSelect.jsx'
import { ArrowRight, SearchIcon } from '../icons.jsx'
import { CATEGORIES } from '../../../lib/filters/categories.jsx'
import { DATE_OPTIONS } from '../../../lib/filters/dateFilters.js'
import './LandingSearch.css'

// Hledání je rozcestník, ne nástroj: odeslání nefiltruje tady, jen přesměruje
// na /events s parametry (q, datum, kategorie, misto). Tři výběry sedí na
// stejné backendové filtry, co používá /events sama. Cena tu chybí záměrně,
// databáze na ni nemá sloupec, takže by šlo o klamavý ovládací prvek.
export default function LandingSearch({ locations }) {
    const navigate = useNavigate()
    const [search, setSearch] = useState({ q: '', datum: '', kategorie: '', misto: '' })

    function handleSubmit(e) {
        e.preventDefault()
        const params = new URLSearchParams()
        if (search.q.trim()) params.set('q', search.q.trim())
        if (search.datum) params.set('datum', search.datum)
        if (search.kategorie) params.set('kategorie', search.kategorie)
        if (search.misto) params.set('misto', search.misto)
        const query = params.toString()
        navigate(query ? `/events?${query}` : '/events')
    }

    return (
        <Reveal as="section" className="lp-section ls lp-fs" aria-labelledby="ls-h">
            {/* Nadpis sekce je jen pro čtečku a pro strukturu stránky, vizuálně
                tu stojí samotný formulář uprostřed. */}
            <h2 id="ls-h" className="visually-hidden">Hledání akcí</h2>

            <div className="lp-wrap ls-wrap">
                {/* Dvojitý rám: vnější plocha jako podnos, vnitřní jádro jako deska,
                    která na něm leží. Vnitřní zaoblení je o odsazení menší, ať jsou
                    křivky soustředné. */}
                <form className="ls-bezel enter" style={{ '--i': 0 }} onSubmit={handleSubmit}>
                    <div className="ls-core">
                        <label className="ls-field" htmlFor="ls-q">
                            <span className="ls-label">Co hledáš</span>
                            <span className="ls-input">
                                <SearchIcon />
                                <input
                                    id="ls-q"
                                    type="search"
                                    placeholder="Interpret, místo nebo název akce"
                                    value={search.q}
                                    onChange={e => setSearch(s => ({ ...s, q: e.target.value }))}
                                />
                            </span>
                        </label>

                        <div className="ls-selects">
                            <FilterSelect
                                label="Kdy"
                                placeholder="Kdykoli"
                                value={search.datum}
                                onChange={v => setSearch(s => ({ ...s, datum: v }))}
                                options={DATE_OPTIONS}
                            />
                            <FilterSelect
                                label="Co"
                                placeholder="Všechny kategorie"
                                value={search.kategorie}
                                onChange={v => setSearch(s => ({ ...s, kategorie: v }))}
                                options={CATEGORIES.map(c => ({ value: c.name, label: c.name, icon: c.icon(16) }))}
                            />
                            <FilterSelect
                                label="Kde"
                                placeholder="Celá Plzeň"
                                value={search.misto}
                                onChange={v => setSearch(s => ({ ...s, misto: v }))}
                                options={locations.map(loc => ({ value: loc, label: loc }))}
                            />
                        </div>

                        <button type="submit" className="lp-btn ls-submit">
                            Hledat
                            <span className="lp-btn-ic"><ArrowRight /></span>
                        </button>
                    </div>
                </form>
            </div>
        </Reveal>
    )
}
