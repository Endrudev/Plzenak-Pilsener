import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { uploadEventImage, getEventById, updateEvent, deleteEvent } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
import './AdminEdit.css'

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

export default function AdminEdit() {
    const { id } = useParams()
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
    const [deleting, setDeleting] = useState(false)
    const [loadError, setLoadError] = useState(null)
    const [images, setImages] = useState([null, null])
    const [address, setAddress] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [mapSrc, setMapSrc] = useState('')
    const [geocoding, setGeocoding] = useState(false)
    const [imageUrl1, setImageUrl1] = useState(null)

    const calRef = useRef(null)
    const addressRef = useRef(null)

    useEffect(() => {
        async function insertEventData(){
            setLoadError(null)
            let event
            try {
                event = await getEventById(id)
            } catch (e) {
                // Bez tohohle skončila chyba jako unhandled rejection v konzoli a
                // admin viděl prázdný formulář, který vypadal jako nová akce —
                // uložení by pak přepsalo existující akci prázdnými hodnotami.
                console.error(e)
                setLoadError(e.message)
                return
            }

            // Sloupce v databázi jsou nullable, ale řízený <input> nesmí dostat
            // null ani undefined — React by ho přepnul na neřízený a od té chvíle
            // by ignoroval value. Proto se všechno textové sráží na prázdný řetězec.
            setTitle(event.name ?? '')
            setImages([event.imageUrl, null])
            setMapSrc(event.mapSrc ?? '')
            setLocationName(event.location ?? '')
            setDescription(event.description?.join('\n') ?? '')
            setCategory(event.tags?.[0] ?? '')
            setUrl(event.url ?? '')

            // Datum se do stavu pouští jen tehdy, když se ho podaří rozebrat.
            // Jinak zůstane výchozí dnešek — prázdné `value` u data by formulář
            // taky rozbilo a `null.split()` by shodilo celé načtení.
            if (event.date) {
                setInputVal(event.date)
                const [day, month, year] = event.date.split('.').map(Number)
                const parsedDate = new Date(year, month - 1, day)
                if (!Number.isNaN(parsedDate.getTime())) setSelected(parsedDate)
            }
        }
        insertEventData()
    }, [id])

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
        }if(!category.trim()) { alert('Vyplňte kategorii.'); return
        }if(!locationName.trim()) { alert('Vyplňte lokaci.'); return
        }if(!description.trim()) { alert('Vyplňte popis.'); return
        }if(!images[0]) { alert('Akce musí mít hlavní obrázek. Vyberte nový.'); return
        }
        setSaving(true)
        let response = null
        try {
            response = await updateEvent(id, {
                name:        title,
                date:        inputVal || null,
                dateShort:   inputVal ? inputVal.slice(0, inputVal.lastIndexOf('.')) : null,
                location:    locationName || null,
                tags:        category ? [category] : [],
                imgClass:    'event-image--prazdroj',
                url:         url || null,
                description: description ? description.split('\n').filter(Boolean) : [],
                mapSrc:      mapSrc || null,
            })
            if(imageUrl1 !== null){
                await uploadEventImage(response.id, imageUrl1)
            }
            navigate('/admin/dashboard')
        } catch (e) {
            alert('Chyba při ukládání: ' + e.message)
        } finally {
            setSaving(false)
        }
    }

    // Mazání je nevratné (backend smaže řádek i objekt v R2), proto potvrzovací
    // dialog se jménem akce — window.confirm je stejný postup jako v dashboardu,
    // vlastní modál sem přidáme, až budeme sjednocovat dialogy.
    async function handleDelete() {
        if (!window.confirm(`Opravdu smazat akci „${title}“? Tuhle akci nelze vrátit zpět.`)) return
        setDeleting(true)
        try {
            await deleteEvent(id)
            navigate('/admin/dashboard')
        } catch (e) {
            alert('Chyba při mazání: ' + e.message)
            setDeleting(false)
        }
        // Při úspěchu se setDeleting nevolá — komponenta je po navigaci odmountovaná
        // a zápis do stavu odmountované komponenty by byl zbytečný.
    }

    // Křížek jen vyprázdní slot ve formuláři — nic nemaže na serveru.
    // Obrázek je u akce povinný, takže "odebrat" znamená "vybrat jiný": teprve
    // nahrání nového obrázku při uložení přepíše ten dosavadní (a backend při tom
    // uklidí starý objekt z R2). Do té doby jde editaci zavřít bez následků.
    function handleRemoveImage(index) {
        const current = images[index]
        if (!current) return
        if (current.startsWith('blob:')) URL.revokeObjectURL(current)
        setImages(prev => prev.map((img, i) => i === index ? null : img))
        if (index === 0) setImageUrl1(null)
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

    // Když se akce nenačte, formulář se nevykreslí vůbec. Prázdná pole by totiž
    // vypadala jako rozpracovaná akce a uložení by přepsalo data v databázi.
    if (loadError) {
        return (
            <div id="ae-page">
                <div id="ae-card">
                    <div id="ae-load-error">
                        <h1>Akci se nepodařilo načíst</h1>
                        <p>{loadError}</p>
                        <button type="button" onClick={() => navigate('/admin/dashboard')}>
                            Zpět na přehled
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div id="ae-page">
            <div id="ae-card">

                {/* Header — název + zavřít (stejná akce jako dřívější "Zpět") */}
                <div id="ae-header">
                    <h1 id="ae-heading">Upravit akci</h1>
                    <button id="ae-close-btn" type="button" onClick={() => navigate(-1)} title="Zpět" aria-label="Zavřít">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div id="ae-body">

                    {/* Nadpis */}
                    <div className="ae-field">
                        <label className="ae-label" htmlFor="f-title">Nadpis</label>
                        <input id="f-title" className="ae-input" type="text" placeholder="Název akce" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    {/* Datum + Kategorie */}
                    <div className="ae-row-2">
                        <div className="ae-field">
                            <label className="ae-label">Datum</label>
                            <div id="ae-date-group" ref={calRef}>
                                <input
                                    id="ae-date-display"
                                    className="ae-input ae-input--plain"
                                    type="text"
                                    value={inputVal}
                                    readOnly
                                    placeholder="Vyber…"
                                    onClick={openCalendar}
                                />
                                <button id="ae-cal-btn" type="button" onClick={openCalendar} title="Vybrat datum" aria-label="Vybrat datum">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </button>

                                {showCal && (
                                    <div id="ae-cal-popup">
                                        <div id="ae-cal-header">
                                            <button type="button" className="ae-cal-nav" onClick={prevMonth}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                                            </button>
                                            <span id="ae-cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
                                            <button type="button" className="ae-cal-nav" onClick={nextMonth}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                                            </button>
                                        </div>
                                        <div id="ae-cal-grid">
                                            {DAYS.map(d => (
                                                <div key={d} className="ae-cal-day-name">{d}</div>
                                            ))}
                                            {cells.map((date, i) => (
                                                <div
                                                    key={i}
                                                    className={[
                                                        'ae-cal-day',
                                                        !date ? 'ae-cal-empty' : '',
                                                        date && isSameDay(date, selected) ? 'ae-cal-selected' : '',
                                                        date && isSameDay(date, today) ? 'ae-cal-today' : '',
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

                        <div className="ae-field">
                            <label className="ae-label" htmlFor="f-category">Kategorie</label>
                            <div className="ae-select-wrapper">
                                <select id="f-category" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="">Vyber…</option>
                                    <option>Kultura</option>
                                    <option>Sport</option>
                                    <option>Gastro</option>
                                    <option>TOP akce</option>
                                </select>
                                <svg className="ae-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Popis */}
                    <div className="ae-field">
                        <label className="ae-label" htmlFor="f-desc">Popis</label>
                        <textarea id="f-desc" className="ae-input" placeholder="Krátký popis akce…" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    {/* Název lokace + Adresa */}
                    <div className="ae-row-2">
                        <div className="ae-field">
                            <label className="ae-label" htmlFor="f-location">Název lokace</label>
                            <input id="f-location" className="ae-input" type="text" placeholder="Např. Plochá dráha Plzeň" value={locationName} onChange={e => setLocationName(e.target.value)} />
                        </div>

                        <div className="ae-field" ref={addressRef}>
                            <label className="ae-label" htmlFor="f-address">Adresa</label>
                            <div className="ae-input-icon-wrapper">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <input
                                    id="f-address"
                                    className="ae-input ae-input--plain"
                                    type="text"
                                    placeholder="Ulice a číslo, město"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    onKeyDown={e => e.key === 'Escape' && setShowSuggestions(false)}
                                    autoComplete="off"
                                />
                            </div>
                            {showSuggestions && (
                                <ul id="ae-address-suggestions">
                                    {suggestions.map((item, i) => (
                                        <li
                                            key={i}
                                            className="ae-address-suggestion"
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
                        <div id="ae-map-preview">
                            {geocoding
                                ? <div id="ae-map-loading">Hledám polohu…</div>
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
                    <div className="ae-field">
                        <label className="ae-label">Obrázky</label>
                        <div id="ae-images-row">
                            {['Hlavní obrázek', 'Další obrázek'].map((label, i) => (
                                <label key={i} className="ae-img-dropzone">
                                    {images[i]
                                        ? (
                                            <>
                                                <img src={images[i]} alt="" />
                                                <button
                                                    type="button"
                                                    className="ae-img-remove-btn"
                                                    title="Odebrat obrázek"
                                                    aria-label="Odebrat obrázek"
                                                    onClick={e => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleRemoveImage(i)
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            </>
                                        )
                                        : (
                                            <>
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                                <span className="ae-dropzone-label">{label}</span>
                                                <span className="ae-dropzone-sub">or <u>browse files</u></span>
                                            </>
                                        )
                                    }
                                    <input type="file" accept="image/*" hidden onChange={e => handleImage(i, e)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Oficiální URL */}
                    <div className="ae-field">
                        <label className="ae-label" htmlFor="f-url">Oficiální URL</label>
                        <div className="ae-input-icon-wrapper">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <input id="f-url" className="ae-input ae-input--plain" type="url" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} />
                        </div>
                    </div>

                </div>

                {/* Footer akce */}
                <div id="ae-footer">
                    <button id="ae-delete-btn" type="button" onClick={handleDelete} disabled={deleting || saving}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        {deleting ? 'Mažu…' : 'Smazat akci'}
                    </button>

                    <div id="ae-footer-main-actions">
                        <button id="ae-preview-btn" type="button" onClick={() => navigate('/events')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            Zobrazit
                        </button>
                        <button id="ae-save-btn" type="button" onClick={handleSave} disabled={saving}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {saving ? 'Ukládám…' : 'Uložit změny'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
