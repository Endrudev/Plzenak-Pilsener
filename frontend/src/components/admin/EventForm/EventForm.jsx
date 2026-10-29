import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import EventPoster from '../../events/EventPoster/EventPoster.jsx'
import { MONTHS, DAYS, toCzech, isSameDay, buildCalendarDays } from '../../../lib/date.js'
import { CATEGORIES } from '../../../lib/filters/categories.jsx'
import { joinTags } from '../../../lib/events/eventTags.js'
import { validateEventForm, validateImageFile } from '../../../lib/admin/eventForm.js'
import { dashboardPath } from '../../../lib/admin/dashboardReturn.js'
import {
    AlertIcon, CalendarIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
    CloseIcon, ExternalIcon, ImageIcon, LinkIcon, PinIcon, StarIcon, TrashIcon,
} from '../adminIcons.jsx'
import './EventForm.css'

// Formulář akce pro vytvoření i úpravu. Do 2026-10-29 byly AdminCreate a AdminEdit dvě
// skoro shodné kopie (přes 2 000 řádků JSX a CSS), každá oprava se dělala dvakrát.
// Stránky teď jen načtou data a řeknou, co se má stát při uložení a smazání.
//
// Vpravo je živý náhled ze skutečné karty webu (EventPoster), takže admin vidí akci
// přesně tak, jak se ukáže v mřížce na /akce.
//
// Props:
//   mode       'create' | 'edit'
//   initial    počáteční hodnoty (viz emptyEvent)
//   viewHref   adresa akce na webu (jen úprava)
//   onSubmit   async ({ payload, imageFile }) => void, chyba = výjimka s message
//   onDelete   () => void (jen úprava), dialog řeší stránka

export function emptyEvent() {
    return {
        title: '',
        // Výchozí je dnešek — dřív tu bylo natvrdo 30.4.2026, takže nová akce
        // dostala loňské datum, pokud ho admin ručně nezměnil.
        date: new Date(),
        category: '',
        extraTags: [],
        top: false,
        description: '',
        locationName: '',
        mapSrc: '',
        url: '',
        imageUrl: null,
    }
}

function snapshot(v) {
    return JSON.stringify([v.title, toCzech(v.date), v.category, v.top, v.description, v.locationName, v.mapSrc, v.url, v.imagePreview])
}

const FIELD_IDS = {
    title: 'ef-title',
    date: 'ef-date',
    category: 'ef-category',
    description: 'ef-desc',
    locationName: 'ef-location',
    image: 'ef-image',
    url: 'ef-url',
}

export default function EventForm({ mode, initial, viewHref, onSubmit, onDelete }) {
    const [title, setTitle] = useState(initial.title)
    const [selected, setSelected] = useState(initial.date)
    const [category, setCategory] = useState(initial.category)
    const [top, setTop] = useState(initial.top)
    const [description, setDescription] = useState(initial.description)
    const [locationName, setLocationName] = useState(initial.locationName)
    const [mapSrc, setMapSrc] = useState(initial.mapSrc)
    const [url, setUrl] = useState(initial.url)
    const [imagePreview, setImagePreview] = useState(initial.imageUrl)
    const [imageFile, setImageFile] = useState(null)
    const [errors, setErrors] = useState({})
    const [submitError, setSubmitError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Neuložené změny = otisk současných hodnot se liší od otisku počátečních. Pole,
    // ne objekt: pořadí je pevné, takže stejné hodnoty dají vždy stejný řetězec.
    const initialKey = useRef(snapshot({ ...initial, imagePreview: initial.imageUrl }))
    const dirty = !saved && snapshot({ title, date: selected, category, top, description, locationName, mapSrc, url, imagePreview }) !== initialKey.current

    // Rozdělaná akce se nesmí ztratit zavřením karty nebo obnovením stránky. Přechody
    // uvnitř aplikace to nepokryje (BrowserRouter neumí blokovat navigaci), ty mají
    // tlačítka Zpět a Zrušit.
    useEffect(() => {
        if (!dirty) return undefined
        function onBeforeUnload(e) {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', onBeforeUnload)
        return () => window.removeEventListener('beforeunload', onBeforeUnload)
    }, [dirty])

    // Po opravě pole jeho chyba zmizí hned, ne až při dalším odeslání.
    function clearError(field) {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    function handleImage(file) {
        const problem = validateImageFile(file)
        if (problem) {
            setErrors(prev => ({ ...prev, image: problem }))
            return
        }
        if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
        setImagePreview(URL.createObjectURL(file))
        setImageFile(file)
        clearError('image')
    }

    // Křížek jen vyprázdní slot ve formuláři — nic nemaže na serveru.
    // Obrázek je u akce povinný, takže "odebrat" znamená "vybrat jiný": teprve
    // nahrání nového obrázku při uložení přepíše ten dosavadní (a backend při tom
    // uklidí starý objekt z R2). Do té doby jde editaci zavřít bez následků.
    function removeImage() {
        if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
        setImageFile(null)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (saving) return
        const found = validateEventForm({ title, date: selected, category, description, locationName, url, hasImage: Boolean(imagePreview) })
        setErrors(found)
        const first = Object.keys(found)[0]
        if (first) {
            document.getElementById(FIELD_IDS[first])?.focus()
            return
        }
        setSaving(true)
        setSubmitError(null)
        try {
            await onSubmit({
                payload: {
                    name:        title.trim(),
                    date:        toCzech(selected),
                    location:    locationName.trim(),
                    tags:        joinTags({ category, extra: initial.extraTags, top }),
                    imgClass:    'event-image--prazdroj',
                    url:         url.trim() || null,
                    description: description.split('\n').map(line => line.trim()).filter(Boolean),
                    mapSrc:      mapSrc || null,
                },
                imageFile,
            })
            // Stránka po úspěchu odnaviguje. `saved` vypne varování při odchodu.
            setSaved(true)
        } catch (err) {
            setSubmitError(err.message || 'Uložení se nepodařilo.')
            setSaving(false)
        }
    }

    // Náhled: stejný tvar dat, jaký karta dostává z API. Prázdná pole mají zástupný text.
    const preview = useMemo(() => ({
        id: 0,
        name: title.trim() || 'Název akce',
        date: toCzech(selected),
        location: locationName.trim() || 'Místo konání',
        tags: joinTags({ category, extra: initial.extraTags, top }),
        imageUrl: imagePreview,
    }), [title, selected, locationName, category, top, imagePreview])

    const backTo = dashboardPath()

    return (
        <form id="ef" onSubmit={handleSubmit} noValidate>
            <div className="adm-head" id="ef-head">
                <div>
                    <Link to={backTo} id="ef-back"><ChevronLeftIcon size={16} />Akce</Link>
                    <h1 className="adm-title">{mode === 'edit' ? 'Upravit akci' : 'Nová akce'}</h1>
                </div>
                {mode === 'edit' && (
                    <div id="ef-head-actions">
                        {viewHref && (
                            <a href={viewHref} target="_blank" rel="noreferrer" className="adm-btn adm-btn--ghost adm-btn--sm">
                                <ExternalIcon size={16} />Na webu
                            </a>
                        )}
                        <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={onDelete}>
                            <TrashIcon size={16} />Smazat
                        </button>
                    </div>
                )}
            </div>

            <div id="ef-grid">
                <div id="ef-fields">
                    <Section title="Základ" index={0}>
                        <Field id="ef-title" label="Název" error={errors.title}>
                            <div className="adm-input" data-invalid={errors.title ? '' : undefined}>
                                <input
                                    id="ef-title"
                                    type="text"
                                    placeholder="Např. Jazz na náměstí"
                                    value={title}
                                    maxLength={200}
                                    aria-invalid={Boolean(errors.title)}
                                    aria-describedby={errors.title ? 'ef-title-error' : undefined}
                                    onChange={e => { setTitle(e.target.value); clearError('title') }}
                                />
                            </div>
                        </Field>

                        <div className="ef-row">
                            <Field id="ef-category" label="Kategorie" error={errors.category}>
                                <div className="adm-input" data-invalid={errors.category ? '' : undefined}>
                                    <select
                                        id="ef-category"
                                        value={category}
                                        aria-invalid={Boolean(errors.category)}
                                        aria-describedby={errors.category ? 'ef-category-error' : undefined}
                                        onChange={e => { setCategory(e.target.value); clearError('category') }}
                                    >
                                        <option value="" disabled>Vyber kategorii</option>
                                        {CATEGORIES.map(cat => <option key={cat.slug} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                    <span className="adm-input-chevron"><ChevronDownIcon size={16} /></span>
                                </div>
                            </Field>

                            <div className="ef-field">
                                <span className="adm-label" aria-hidden="true">Zvýraznění</span>
                                <label className="ef-switch">
                                    <input type="checkbox" role="switch" checked={top} onChange={e => setTop(e.target.checked)} />
                                    <span className="ef-switch-track" aria-hidden="true" />
                                    <span className="ef-switch-text">
                                        <StarIcon size={16} />TOP akce
                                    </span>
                                </label>
                            </div>
                        </div>

                        {initial.extraTags.length > 0 && (
                            <p className="ef-note">
                                Vedlejší štítky z importu ({initial.extraTags.join(', ')}) zůstanou zachované.
                            </p>
                        )}

                        <Field id="ef-desc" label="Popis" hint="každý odstavec na nový řádek" error={errors.description}>
                            <div className="adm-input adm-input--area" data-invalid={errors.description ? '' : undefined}>
                                <textarea
                                    id="ef-desc"
                                    placeholder="O čem akce je, pro koho, co čekat."
                                    value={description}
                                    aria-invalid={Boolean(errors.description)}
                                    aria-describedby={errors.description ? 'ef-desc-error' : undefined}
                                    onChange={e => { setDescription(e.target.value); clearError('description') }}
                                />
                            </div>
                        </Field>
                    </Section>

                    <Section title="Kdy a kde" index={1}>
                        <DateField
                            value={selected}
                            error={errors.date}
                            onChange={date => { setSelected(date); clearError('date') }}
                        />

                        <Field id="ef-location" label="Místo konání" error={errors.locationName}>
                            <div className="adm-input" data-invalid={errors.locationName ? '' : undefined}>
                                <PinIcon size={18} />
                                <input
                                    id="ef-location"
                                    type="text"
                                    placeholder="Např. Plochá dráha Plzeň"
                                    value={locationName}
                                    aria-invalid={Boolean(errors.locationName)}
                                    aria-describedby={errors.locationName ? 'ef-location-error' : undefined}
                                    onChange={e => { setLocationName(e.target.value); clearError('locationName') }}
                                />
                            </div>
                        </Field>

                        <AddressField mapSrc={mapSrc} onMap={setMapSrc} />
                    </Section>

                    <Section title="Obrázek" index={2}>
                        <ImageField
                            preview={imagePreview}
                            error={errors.image}
                            replacing={Boolean(imageFile) && mode === 'edit'}
                            onFile={handleImage}
                            onRemove={removeImage}
                        />
                    </Section>

                    <Section title="Odkaz" index={3}>
                        <Field id="ef-url" label="Oficiální stránka akce" hint="nepovinné" error={errors.url}>
                            <div className="adm-input" data-invalid={errors.url ? '' : undefined}>
                                <LinkIcon size={18} />
                                <input
                                    id="ef-url"
                                    type="url"
                                    inputMode="url"
                                    placeholder="https://…"
                                    value={url}
                                    aria-invalid={Boolean(errors.url)}
                                    aria-describedby={errors.url ? 'ef-url-error' : undefined}
                                    onChange={e => { setUrl(e.target.value); clearError('url') }}
                                />
                            </div>
                        </Field>
                    </Section>
                </div>

                <aside id="ef-preview" aria-label="Náhled karty na webu">
                    <p className="ef-preview-label">Náhled na webu</p>
                    {/* Karta je odkaz; v náhledu nikam nevede (inert: bez fokusu i kliku). */}
                    <div className="ef-preview-card" inert="">
                        <EventPoster event={preview} index={0} />
                    </div>
                    <p className="ef-note">Takhle se akce ukáže v mřížce na stránce Akce.</p>
                </aside>
            </div>

            <div id="ef-bar">
                <div id="ef-bar-inner">
                    {submitError ? (
                        <p id="ef-bar-status" className="ef-bar-status--error" role="alert"><AlertIcon size={16} />{submitError}</p>
                    ) : (
                        <p id="ef-bar-status" aria-live="polite">{dirty ? 'Neuložené změny' : mode === 'edit' ? 'Bez změn' : ''}</p>
                    )}
                    <Link to={backTo} className="adm-btn adm-btn--ghost">Zrušit</Link>
                    <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
                        <CheckIcon size={18} />{saving ? 'Ukládám…' : mode === 'edit' ? 'Uložit změny' : 'Vytvořit akci'}
                    </button>
                </div>
            </div>
        </form>
    )
}

function Section({ title, index, children }) {
    const id = `ef-sec-${index}`
    return (
        <section className="adm-panel ef-section adm-rise" style={{ '--i': index }} aria-labelledby={id}>
            <h2 id={id} className="ef-section-title">{title}</h2>
            {children}
        </section>
    )
}

function Field({ id, label, hint, error, children }) {
    return (
        <div className="ef-field">
            <label className="adm-label" htmlFor={id}>
                {label}{hint && <span className="adm-label-hint">({hint})</span>}
            </label>
            {children}
            {error && <p id={`${id}-error`} className="adm-field-error"><AlertIcon size={15} />{error}</p>}
        </div>
    )
}

// Datum: tlačítko, které otevře kalendář. Dny jsou tlačítka (klávesnice, čtečka),
// Escape a klik mimo kalendář zavřou.
function DateField({ value, error, onChange }) {
    const [open, setOpen] = useState(false)
    const [viewYear, setViewYear] = useState(() => value.getFullYear())
    const [viewMonth, setViewMonth] = useState(() => value.getMonth())
    const wrapRef = useRef(null)
    const btnRef = useRef(null)

    useEffect(() => {
        if (!open) return undefined
        function onDown(e) {
            if (!wrapRef.current?.contains(e.target)) setOpen(false)
        }
        function onKey(e) {
            if (e.key !== 'Escape') return
            setOpen(false)
            btnRef.current?.focus()
        }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        // fokus na vybraný den, a když ve zobrazeném měsíci není, na první
        const target = wrapRef.current?.querySelector('.ef-cal-day[aria-pressed="true"]') ?? wrapRef.current?.querySelector('.ef-cal-day')
        target?.focus()
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    function toggle() {
        setViewYear(value.getFullYear())
        setViewMonth(value.getMonth())
        setOpen(o => !o)
    }

    function shiftMonth(delta) {
        const next = new Date(viewYear, viewMonth + delta, 1)
        setViewYear(next.getFullYear())
        setViewMonth(next.getMonth())
    }

    function pick(date) {
        onChange(date)
        setOpen(false)
        btnRef.current?.focus()
    }

    const today = new Date()
    const label = value.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div className="ef-field" ref={wrapRef}>
            <span className="adm-label" id="ef-date-label">Datum</span>
            <div className="ef-date-wrap">
                <div className="adm-input" data-invalid={error ? '' : undefined}>
                    <CalendarIcon size={18} />
                    <button
                        ref={btnRef}
                        id="ef-date"
                        type="button"
                        className="adm-input-value ef-date-value"
                        aria-labelledby="ef-date-label ef-date"
                        aria-expanded={open}
                        onClick={toggle}
                    >
                        {label}
                    </button>
                </div>

                {open && (
                    <div id="ef-cal" role="group" aria-label="Kalendář">
                        <div id="ef-cal-head">
                            <button type="button" className="adm-icon-btn" aria-label="Předchozí měsíc" onClick={() => shiftMonth(-1)}>
                                <ChevronLeftIcon size={18} />
                            </button>
                            <span id="ef-cal-month" aria-live="polite">{MONTHS[viewMonth]} {viewYear}</span>
                            <button type="button" className="adm-icon-btn" aria-label="Další měsíc" onClick={() => shiftMonth(1)}>
                                <ChevronRightIcon size={18} />
                            </button>
                        </div>
                        <div id="ef-cal-grid">
                            {DAYS.map(d => <span key={d} className="ef-cal-dow" aria-hidden="true">{d}</span>)}
                            {buildCalendarDays(viewYear, viewMonth).map((date, i) => date ? (
                                <button
                                    key={i}
                                    type="button"
                                    className={`ef-cal-day${isSameDay(date, today) ? ' ef-cal-day--today' : ''}`}
                                    aria-pressed={Boolean(isSameDay(date, value))}
                                    aria-label={date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    onClick={() => pick(date)}
                                >
                                    {date.getDate()}
                                </button>
                            ) : <span key={i} />)}
                        </div>
                    </div>
                )}
            </div>
            {error && <p id="ef-date-error" className="adm-field-error"><AlertIcon size={15} />{error}</p>}
        </div>
    )
}

// Adresa jen pro mapu: našeptávač přes OpenStreetMap (Nominatim), vybraná adresa
// nastaví náhled mapy. Samotná adresa se neukládá, akce si drží jen mapSrc.
function AddressField({ mapSrc, onMap }) {
    const [address, setAddress] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [open, setOpen] = useState(false)
    const wrapRef = useRef(null)

    //Zavření okna po kliknutí mimo element
    useEffect(() => {
        function onOutside(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [])

    //Debounce + našeptávání adres přes OpenStreetMap API
    useEffect(() => {
        if (address.trim().length < 3) { setSuggestions([]); setOpen(false); return }
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
                setOpen(filtered.length > 0)
            } catch {
                setSuggestions([])
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [address])

    //Výběr adresy z našeptávače
    function select(item) {
        setAddress(item.display_name)
        setSuggestions([])
        setOpen(false)
        const lat = parseFloat(item.lat)
        const lon = parseFloat(item.lon)
        const bbox = `${lon - 0.008},${lat - 0.005},${lon + 0.008},${lat + 0.005}`
        onMap(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`)
    }

    return (
        <div className="ef-field" ref={wrapRef}>
            <label className="adm-label" htmlFor="ef-address">
                Adresa pro mapu<span className="adm-label-hint">({mapSrc ? 'mapa nastavená, novou adresou ji změníš' : 'nepovinné'})</span>
            </label>
            <div className="ef-suggest-wrap">
                <div className="adm-input">
                    <PinIcon size={18} />
                    <input
                        id="ef-address"
                        type="text"
                        placeholder="Ulice a číslo, Plzeň"
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls="ef-suggest"
                        aria-autocomplete="list"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}
                    />
                </div>
                {open && (
                    <ul id="ef-suggest" role="listbox">
                        {suggestions.map(item => (
                            <li key={item.place_id} role="option" aria-selected="false">
                                <button type="button" onClick={() => select(item)}>
                                    <PinIcon size={16} />
                                    <span>{item.display_name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {mapSrc && (
                <div id="ef-map">
                    <iframe src={mapSrc} title="Náhled mapy" loading="lazy" />
                    <button type="button" className="adm-btn adm-btn--sm" id="ef-map-clear" onClick={() => onMap('')}>
                        <CloseIcon size={14} />Odebrat mapu
                    </button>
                </div>
            )}
        </div>
    )
}

// Obrázek: přetažení souboru nebo výběr klepnutím. Po výběru náhled s tlačítky
// Vyměnit a Odebrat.
function ImageField({ preview, error, replacing, onFile, onRemove }) {
    const [over, setOver] = useState(false)
    const inputRef = useRef(null)

    function onDrop(e) {
        e.preventDefault()
        setOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) onFile(file)
    }

    function onChange(e) {
        const file = e.target.files?.[0]
        if (file) onFile(file)
        e.target.value = ''
    }

    return (
        <div className="ef-field">
            <input
                ref={inputRef}
                id="ef-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="visually-hidden"
                aria-label="Hlavní obrázek akce"
                aria-describedby={error ? 'ef-image-error' : 'ef-image-hint'}
                onChange={onChange}
            />
            {preview ? (
                <div className="ef-image">
                    <img src={preview} alt="Vybraný obrázek akce" />
                    <div className="ef-image-actions">
                        <button type="button" className="adm-btn adm-btn--sm" onClick={() => inputRef.current?.click()}>
                            <ImageIcon size={16} />Vyměnit
                        </button>
                        <button type="button" className="adm-btn adm-btn--sm" onClick={onRemove}>
                            <CloseIcon size={16} />Odebrat
                        </button>
                    </div>
                    {replacing && <span className="ef-image-flag">Nový, nahraje se při uložení</span>}
                </div>
            ) : (
                <label
                    htmlFor="ef-image"
                    className={`ef-drop${over ? ' ef-drop--over' : ''}${error ? ' ef-drop--invalid' : ''}`}
                    onDragOver={e => { e.preventDefault(); setOver(true) }}
                    onDragLeave={() => setOver(false)}
                    onDrop={onDrop}
                >
                    <span className="ef-drop-ic"><ImageIcon size={24} /></span>
                    <strong>Přetáhni sem obrázek</strong>
                    <span>nebo <u>vyber soubor</u></span>
                </label>
            )}
            {error
                ? <p id="ef-image-error" className="adm-field-error"><AlertIcon size={15} />{error}</p>
                : <p id="ef-image-hint" className="ef-note">JPEG, PNG nebo WebP do 5 MB. Ideálně na šířku, aspoň 1200 px.</p>}
        </div>
    )
}
