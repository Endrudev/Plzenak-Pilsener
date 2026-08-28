import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent, uploadEventImage, deleteEvent } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
import './AdminCreate.css'

//Deklarace polí pro překlad měsíců a dnů pro kalendářový popup.
const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen',
    'Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const DAYS = ['Po','Út','St','Čt','Pá','So','Ne']

//Převedení datumu na český formát.
function toCzech(date) {
    if (!date) return ''
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

//Porovnání Date objektů
function isSameDay(a, b) {
    return(
        a && b &&
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
    )
}

//Vytvoření pole Date objektů pro popup kalendář
function buildCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const offset = (firstDay + 6) % 7 // Počet polí před prvním dnem v měsící
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < offset; i++)
        cells.push(null)
    for (let d = 1; d <= daysInMonth; d++)
        cells.push(new Date(year, month, d))
    return cells
}

export default function AdminCreate() {
    const navigate = useNavigate()
    useAuthGuard()
    // Výchozí je dnešek — dřív tu bylo natvrdo 30.4.2026, takže nová akce
    // dostala loňské datum, pokud ho admin ručně nezměnil.
    const [selected, setSelected] = useState(() => new Date())
    const [inputVal, setInputVal] = useState(() => toCzech(new Date()))
    const [showCal, setShowCal] = useState(false)
    const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
    const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [url, setUrl] = useState('')
    const [category, setCategory] = useState('')
    const [locationName, setLocationName] = useState('')
    const [saving, setSaving] = useState(false)
    const [images, setImages] = useState([null, null])
    const [address, setAddress] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [mapSrc, setMapSrc] = useState('')
    const [geocoding, setGeocoding] = useState(false)
    const [imageUrl1, setImageUrl1] = useState(null)

    const calRef = useRef(null)
    const addressRef = useRef(null)

    //Zavření okna po kliknutí mimo element
    useEffect(() => {
        function onOutside(e) {
            if (addressRef.current && !addressRef.current.contains(e.target))
                setShowSuggestions(false)
        }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [])

    //Debounce + našeptávání adres přes OpenStreetMap API
    useEffect(() => {
        if (address.trim().length < 3) { setSuggestions([]); setShowSuggestions(false); return }
        const timer = setTimeout(async () => {
            try {
                // viewbox = hranice Plzeňského kraje (W, N, E, S)
                const viewbox = '12.65,50.02,13.92,49.15'
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=cz&viewbox=${viewbox}&bounded=1`
                )
                const data = await res.json()
                // klientský filtr jako záloha
                const filtered = data.filter(item =>
                    item.display_name.toLowerCase().includes('plzeň') ||
                    item.display_name.toLowerCase().includes('plzen')
                )
                setSuggestions(filtered)
                setShowSuggestions(filtered.length > 0)
            } catch {
                setSuggestions([])
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [address])

    //Výběr adresy z našeptávače
    function selectSuggestion(item) {
        setAddress(item.display_name)
        setSuggestions([])
        setShowSuggestions(false)
        const lat = parseFloat(item.lat)
        const lon = parseFloat(item.lon)
        const bbox = `${lon - 0.008},${lat - 0.005},${lon + 0.008},${lat + 0.005}`
        setMapSrc(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`)
        setGeocoding(false)
    }

    //
    useEffect(() => {
        function onClickOutside(e) {
            if (calRef.current && !calRef.current.contains(e.target)) {
                setShowCal(false)
            }
        }
        if (showCal) document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [showCal])

    function openCalendar() {
        if (selected) { setViewYear(selected.getFullYear()); setViewMonth(selected.getMonth()) }
        setShowCal(v => !v)
    }

    function selectDay(date) {
        setSelected(date)
        setInputVal(toCzech(date))
        setShowCal(false)
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    async function handleSave() {
        if (!title.trim()) { alert('Vyplňte nadpis.'); return
        }if(imageUrl1 === null) { alert('Přidejte obrázek.'); return
        }if(!category.trim()) { alert('Vyplňte kategorii.'); return
        }if(!description.trim()) { alert('Vyplňte popis.'); return
        }if(!locationName.trim()) { alert('Vyplňte lokaci.'); return
        }
        setSaving(true)
        let response = null
        try {
            response = await createEvent({
                name:        title,
                date:        inputVal || null,
                dateShort:   inputVal ? inputVal.slice(0, inputVal.lastIndexOf('.')) : null,
                location:    locationName || null,
                tags:        category ? [category] : [],
                badge:       null,
                badgeType:   null,
                imgClass:    'event-image--prazdroj',
                url:         url || null,
                description: description ? description.split('\n').filter(Boolean) : [],
                mapSrc:      mapSrc || null,
            })
            await uploadEventImage(response.id, imageUrl1)
            navigate('/admin/dashboard')
        } catch (e) {
            alert('Chyba při ukládání: ' + e.message)
            try{
                if(response !== null){await deleteEvent(response.id)}
            }catch (err){
                console.error(err.message)
            }
        } finally {
            setSaving(false)
        }
    }

    function handleImage(index, e) {
        const file = e.target.files[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setImages(prev => prev.map((img, i) => i === index ? url : img))
        if(index === 0){
            setImageUrl1(file)
        }
    }

    const today = new Date()
    const cells = buildCalendarDays(viewYear, viewMonth)

    return (
        <div id="ac-page">
            <div id="ac-card">

                {/* Header — název + zavřít (stejná akce jako dřívější "Zpět") */}
                <div id="create-header">
                    <h1 id="create-heading">Vytvořit akci</h1>
                    <button id="create-close-btn" type="button" onClick={() => navigate(-1)} title="Zpět" aria-label="Zavřít">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div id="create-body">

                    {/* Nadpis */}
                    <div className="create-field">
                        <label className="create-label" htmlFor="f-title">Nadpis</label>
                        <input id="f-title" className="ac-input" type="text" placeholder="Název akce" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    {/* Datum + Kategorie */}
                    <div className="create-row-2">
                        <div className="create-field">
                            <label className="create-label">Datum</label>
                            <div id="ac-date-group" ref={calRef}>
                                <input
                                    id="ac-date-display"
                                    className="ac-input ac-input--plain"
                                    type="text"
                                    value={inputVal}
                                    readOnly
                                    placeholder="Vyber…"
                                    onClick={openCalendar}
                                />
                                <button id="ac-cal-btn" type="button" onClick={openCalendar} title="Vybrat datum" aria-label="Vybrat datum">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </button>

                                {showCal && (
                                    <div id="ac-cal-popup">
                                        <div id="ac-cal-header">
                                            <button type="button" className="ac-cal-nav" onClick={prevMonth}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                                            </button>
                                            <span id="ac-cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
                                            <button type="button" className="ac-cal-nav" onClick={nextMonth}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                                            </button>
                                        </div>
                                        <div id="ac-cal-grid">
                                            {DAYS.map(d => (
                                                <div key={d} className="ac-cal-day-name">{d}</div>
                                            ))}
                                            {cells.map((date, i) => (
                                                <div
                                                    key={i}
                                                    className={[
                                                        'ac-cal-day',
                                                        !date ? 'ac-cal-empty' : '',
                                                        date && isSameDay(date, selected) ? 'ac-cal-selected' : '',
                                                        date && isSameDay(date, today) ? 'ac-cal-today' : '',
                                                    ].join(' ')}
                                                    onClick={() => date && selectDay(date)}
                                                >
                                                    {date ? date.getDate() : ''}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="create-field">
                            <label className="create-label" htmlFor="f-category">Kategorie</label>
                            <div className="create-select-wrapper">
                                <select id="f-category" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="">Vyber…</option>
                                    <option>Kultura</option>
                                    <option>Sport</option>
                                    <option>Gastro</option>
                                    <option>TOP akce</option>
                                </select>
                                <svg className="create-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Popis */}
                    <div className="create-field">
                        <label className="create-label" htmlFor="f-desc">Popis</label>
                        <textarea id="f-desc" className="ac-input" placeholder="Krátký popis akce…" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    {/* Název lokace + Adresa */}
                    <div className="create-row-2">
                        <div className="create-field">
                            <label className="create-label" htmlFor="f-location">Název lokace</label>
                            <input id="f-location" className="ac-input" type="text" placeholder="Např. Plochá dráha Plzeň" value={locationName} onChange={e => setLocationName(e.target.value)} />
                        </div>

                        <div className="create-field" ref={addressRef}>
                            <label className="create-label" htmlFor="f-address">Adresa</label>
                            <div className="create-input-icon-wrapper">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <input
                                    id="f-address"
                                    className="ac-input ac-input--plain"
                                    type="text"
                                    placeholder="Ulice a číslo, město"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    onKeyDown={e => e.key === 'Escape' && setShowSuggestions(false)}
                                    autoComplete="off"
                                />
                            </div>
                            {showSuggestions && (
                                <ul id="ac-address-suggestions">
                                    {suggestions.map((item, i) => (
                                        <li
                                            key={i}
                                            className="ac-address-suggestion"
                                            onMouseDown={() => selectSuggestion(item)}
                                        >
                                            {item.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Náhled mapy */}
                    {(geocoding || mapSrc) && (
                        <div id="ac-map-preview">
                            {geocoding
                                ? <div id="ac-map-loading">Hledám polohu…</div>
                                : <iframe
                                    src={mapSrc}
                                    title="Náhled mapy"
                                    width="100%"
                                    height="200"
                                    frameBorder="0"
                                    loading="lazy"
                                />
                            }
                        </div>
                    )}

                    {/* Obrázky */}
                    <div className="create-field">
                        <label className="create-label">Obrázky</label>
                        <div id="ac-images-row">
                            {['Hlavní obrázek', 'Další obrázek'].map((label, i) => (
                                <label key={i} className="create-img-dropzone">
                                    {images[i]
                                        ? <img src={images[i]} alt="" />
                                        : (
                                            <>
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                                <span className="dropzone-label">{label}</span>
                                                <span className="dropzone-sub">or <u>browse files</u></span>
                                            </>
                                        )
                                    }
                                    <input type="file" accept="image/*" hidden onChange={e => handleImage(i, e)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Oficiální URL */}
                    <div className="create-field">
                        <label className="create-label" htmlFor="f-url">Oficiální URL</label>
                        <div className="create-input-icon-wrapper">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <input id="f-url" className="ac-input ac-input--plain" type="url" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} />
                        </div>
                    </div>

                </div>

                {/* Footer akce */}
                <div id="create-footer">
                    <button id="create-preview-btn" type="button" onClick={() => navigate('/events')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        Zobrazit
                    </button>
                    <button id="create-save-btn" type="button" onClick={handleSave} disabled={saving}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {saving ? 'Ukládám…' : 'Uložit'}
                    </button>
                </div>

            </div>
        </div>
    )
}
