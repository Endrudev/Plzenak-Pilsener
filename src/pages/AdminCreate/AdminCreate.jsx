import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../../lib/eventsApi.js'
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
    return 
        a && b && 
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() && 
        a.getFullYear() === b.getFullYear()
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
    const [selected, setSelected] = useState(new Date(2026, 3, 30))
    const [inputVal, setInputVal] = useState('30.4.2026')
    const [showCal, setShowCal] = useState(false)
    const [viewYear, setViewYear] = useState(2026)
    const [viewMonth, setViewMonth] = useState(3)
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
        if (!title.trim()) { alert('Vyplňte nadpis.'); return }

        setSaving(true)
        try {
            await createEvent({
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
            navigate('/admin/dashboard')
        } catch (e) {
            alert('Chyba při ukládání: ' + e.message)
        } finally {
            setSaving(false)
        }
    }

    function handleImage(index, e) {
        const file = e.target.files[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setImages(prev => prev.map((img, i) => i === index ? url : img))
    }

    const today = new Date()
    const cells = buildCalendarDays(viewYear, viewMonth)

    return (
        <div id="create-page">
            <button className="back-btn" onClick={() => navigate(-1)}>Zpět</button>

            <div id="create-card">

                {/* Row 1 — title + date */}
                <div id="create-top-row">
                    <input className="create-input" id="create-title" type="text" placeholder="Nadpis" value={title} onChange={e => setTitle(e.target.value)} />
                    <div id="create-date-group" ref={calRef}>
                        <button id="create-cal-btn" type="button" onClick={openCalendar} title="Vybrat datum">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </button>
                        <input
                            id="create-date-display"
                            type="text"
                            value={inputVal}
                            readOnly
                            placeholder="d.m.rrrr"
                        />

                        {showCal && (

                            <div id="cal-popup">
                                <div id="cal-header">
                                    <button type="button" className="cal-nav" onClick={prevMonth}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                                    </button>
                                    <span id="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
                                    <button type="button" className="cal-nav" onClick={nextMonth}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                                    </button>
                                </div>
                                <div id="cal-grid">
                                    {DAYS.map(d => (
                                        <div key={d} className="cal-day-name">{d}</div>
                                    ))}
                                    {cells.map((date, i) => (
                                        <div
                                            key={i}
                                            className={[
                                                'cal-day',
                                                !date ? 'cal-empty' : '',
                                                date && isSameDay(date, selected) ? 'cal-selected' : '',
                                                date && isSameDay(date, today) ? 'cal-today' : '',
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
                    <button id="create-date-clear" type="button" onClick={() => navigate(-1)} title="Zpět">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Popis textarea */}
                <textarea className="create-input" id="create-desc" placeholder="Popis" value={description} onChange={e => setDescription(e.target.value)} />

                {/* URL */}
                <input className="create-input" type="url" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />

                {/* Kategorie + Název lokace */}
                <div className="create-two-col">
                    <div id="create-category-wrapper">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                        <select id="create-category" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="">Kategorie</option>
                            <option>Kultura</option>
                            <option>Sport</option>
                            <option>Gastro</option>
                            <option>TOP akce</option>
                        </select>
                    </div>
                    <input className="create-input" type="text" placeholder="Název lokace" value={locationName} onChange={e => setLocationName(e.target.value)} />
                </div>

                {/* Image button + Adresa */}
                <div className="create-two-col">
                    <label id="create-img-icon-btn" title="Přidat obrázek">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <input type="file" accept="image/*" hidden />
                    </label>
                    <div id="create-address-wrapper" ref={addressRef}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <input
                            className="create-input"
                            type="text"
                            placeholder="Adresa"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            onKeyDown={e => e.key === 'Escape' && setShowSuggestions(false)}
                            autoComplete="off"
                        />
                        {showSuggestions && (
                            <ul id="address-suggestions">
                                {suggestions.map((item, i) => (
                                    <li
                                        key={i}
                                        className="address-suggestion"
                                        onMouseDown={() => selectSuggestion(item)}
                                    >
                                        {item.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Map preview */}
                {(geocoding || mapSrc) && (
                    <div id="map-preview">
                        {geocoding
                            ? <div id="map-loading">Hledám polohu…</div>
                            : <iframe
                                src={mapSrc}
                                title="Náhled mapy"
                                width="100%"
                                height="220"
                                frameBorder="0"
                                loading="lazy"
                              />
                        }
                    </div>
                )}

                {/* Image upload boxes */}
                <div id="create-images-row">
                    {images.map((img, i) => (
                        <label key={i} className="create-img-box">
                            {img
                                ? <img src={img} alt="" />
                                : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                  </svg>
                            }
                            <input type="file" accept="image/*" hidden onChange={e => handleImage(i, e)} />
                        </label>
                    ))}
                </div>

                {/* Action buttons */}
                <div id="create-actions">
                    <button className="create-action-btn" onClick={() => navigate('/events')}>Zobrazit</button>
                    <button className="create-action-btn" id="save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? 'Ukládám…' : 'Uložit'}
                    </button>
                </div>

            </div>
        </div>
    )
}
