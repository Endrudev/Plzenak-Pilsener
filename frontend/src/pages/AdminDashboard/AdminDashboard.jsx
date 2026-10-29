import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getAdminEvents, deleteEvent } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
import { eventPath } from '../../lib/events/eventPath.js'
import { eventVisual } from '../../lib/events/eventVisual.js'
import { dayParts, daysFromToday } from '../../lib/events/dateRanges.js'
import { splitTags } from '../../lib/events/eventTags.js'
import { CATEGORIES } from '../../lib/filters/categories.jsx'
import { PERIODS, adminStats, filterAdminEvents } from '../../lib/admin/adminEvents.js'
import { rememberDashboard } from '../../lib/admin/dashboardReturn.js'
import { getPageItems } from '../../components/Pagination/getPageItems.js'
import AdminShell from '../../components/admin/AdminShell/AdminShell.jsx'
import AdminDialog from '../../components/admin/AdminDialog/AdminDialog.jsx'
import {
    AlertIcon, CalendarIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
    CloseIcon, ExternalIcon, PlusIcon, RefreshIcon, SearchIcon, TrashIcon,
} from '../../components/admin/adminIcons.jsx'
import './AdminDashboard.css'

const PER_PAGE = 20

// Filtry žijí v URL, ne ve stavu komponenty: po návratu z úpravy akce (nebo po
// obnovení stránky) je seznam ve stejném stavu, včetně stránky.
function readFilters(params) {
    const period = params.get('obdobi')
    return {
        q: params.get('q') ?? '',
        period: PERIODS.some(p => p.value === period) ? period : 'upcoming',
        category: params.get('kategorie') ?? '',
        page: Math.max(1, parseInt(params.get('strana'), 10) || 1),
    }
}

export default function AdminDashboard() {
    useAuthGuard()
    const navigate = useNavigate()
    const location = useLocation()
    const [params, setParams] = useSearchParams()
    const filters = readFilters(params)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    // Hláška nahoře: po uložení ji sem pošle formulář (navigate state), po smazání ji nastaví tahle stránka.
    const [notice, setNotice] = useState(() => location.state?.notice ?? null)
    const [pendingDelete, setPendingDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const searchRef = useRef(null)

    useEffect(() => { fetchEvents() }, [])

    // Hláška z navigace se zobrazí jednou. Po obnovení stránky by jinak vyskočila znovu.
    useEffect(() => {
        if (location.state?.notice) navigate(location.pathname + location.search, { replace: true, state: null })
    }, [])

    useEffect(() => { rememberDashboard(location.search) }, [location.search])

    // „/“ skočí do hledání, pokud admin zrovna nepíše do jiného pole.
    useEffect(() => {
        function onKey(e) {
            if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
            if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
            e.preventDefault()
            searchRef.current?.focus()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    async function fetchEvents() {
        setLoading(true)
        setLoadError(null)
        try {
            const data = await getAdminEvents()
            setEvents(data.items)
        } catch (e) {
            // Chyba musí být vidět na stránce. Samotný console.error tady nestačil:
            // prázdná tabulka vypadala úplně stejně jako "zatím žádné akce", takže
            // výpadek backendu se tvářil jako prázdná databáze.
            console.error(e)
            setLoadError(e.message)
            setEvents([])
        } finally {
            setLoading(false)
        }
    }

    // Změna filtru vrací na první stránku. Prázdné hodnoty z URL mizí, ať zůstane čitelná.
    function update(changes) {
        const next = { ...filters, page: 1, ...changes }
        const out = new URLSearchParams()
        if (next.q) out.set('q', next.q)
        if (next.period !== 'upcoming') out.set('obdobi', next.period)
        if (next.category) out.set('kategorie', next.category)
        if (next.page > 1) out.set('strana', String(next.page))
        setParams(out, { replace: true })
    }

    async function confirmDelete() {
        const event = pendingDelete
        setDeleting(true)
        try {
            await deleteEvent(event.id)
            setEvents(prev => prev.filter(e => e.id !== event.id))
            setNotice({ type: 'ok', text: `Smazáno: ${event.name}` })
        } catch (e) {
            setNotice({ type: 'error', text: 'Smazání se nepodařilo: ' + e.message })
        } finally {
            setDeleting(false)
            setPendingDelete(null)
        }
    }

    const today = useMemo(() => new Date(), [])
    const stats = useMemo(() => adminStats(events, today), [events, today])
    const filtered = useMemo(
        () => filterAdminEvents(events, filters, today),
        [events, filters.q, filters.period, filters.category, today],
    )
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const currentPage = Math.min(filters.page, totalPages)
    const start = (currentPage - 1) * PER_PAGE
    const visible = filtered.slice(start, start + PER_PAGE)
    const hasFilter = Boolean(filters.q || filters.category)

    function goToPage(page) {
        update({ page })
        window.scrollTo({ top: 0 })
    }

    return (
        <AdminShell>
            <div className="adm-head">
                <div>
                    <p className="adm-eyebrow"><CalendarIcon size={14} />Přehled</p>
                    <h1 className="adm-title">Akce</h1>
                </div>
            </div>

            {notice && (
                <div className={`adm-notice${notice.type === 'error' ? ' adm-notice--error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}>
                    {notice.type === 'error' ? <AlertIcon size={18} /> : <CheckIcon size={18} />}
                    <strong>{notice.text}</strong>
                    <button type="button" className="adm-icon-btn adm-notice-close" aria-label="Zavřít hlášku" onClick={() => setNotice(null)}>
                        <CloseIcon size={16} />
                    </button>
                </div>
            )}

            <section id="dash-stats" className="adm-panel" aria-label="Souhrn nadcházejících akcí">
                <Stat value={stats.upcoming} label="nadcházejících" loading={loading} />
                <Stat value={stats.week} label="v příštích 7 dnech" loading={loading} />
                <Stat value={stats.top} label="TOP akcí" loading={loading} onClick={() => update({ q: '', category: 'TOP akce', period: 'upcoming' })} />
                <Stat value={stats.noImage} label="bez fotky" loading={loading} tone={stats.noImage > 0 ? 'warn' : undefined} />
            </section>

            <div id="dash-toolbar">
                <label className="adm-input" id="dash-search">
                    <SearchIcon size={18} />
                    <span className="visually-hidden">Hledat v akcích</span>
                    <input
                        ref={searchRef}
                        type="search"
                        placeholder="Hledat název nebo místo"
                        value={filters.q}
                        onChange={e => update({ q: e.target.value })}
                    />
                    <kbd id="dash-search-kbd" aria-hidden="true">/</kbd>
                </label>

                <div className="adm-seg" role="group" aria-label="Období">
                    {PERIODS.map(p => (
                        <button key={p.value} type="button" aria-pressed={filters.period === p.value} onClick={() => update({ period: p.value })}>
                            {p.label}
                        </button>
                    ))}
                </div>

                <label className="adm-input" id="dash-category">
                    <span className="visually-hidden">Kategorie</span>
                    <select value={filters.category} onChange={e => update({ category: e.target.value })}>
                        <option value="">Všechny kategorie</option>
                        {CATEGORIES.map(cat => <option key={cat.slug} value={cat.name}>{cat.name}</option>)}
                        <option value="TOP akce">TOP akce</option>
                    </select>
                    <span className="adm-input-chevron"><ChevronDownIcon size={16} /></span>
                </label>
            </div>

            {loading ? (
                <div className="adm-panel dash-list" role="status" aria-label="Načítání akcí">
                    {Array.from({ length: 6 }, (_, i) => <div key={i} className="dash-row dash-row--skel"><span className="adm-skel" /></div>)}
                </div>
            ) : loadError ? (
                <div className="adm-panel adm-empty adm-empty--error">
                    <span className="adm-empty-ic"><AlertIcon size={24} /></span>
                    <h2>Akce se nepodařilo načíst</h2>
                    <p>{loadError}</p>
                    <button type="button" className="adm-btn adm-btn--primary" onClick={fetchEvents}>
                        <RefreshIcon size={16} />Zkusit znovu
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState events={events} period={filters.period} hasFilter={hasFilter} onReset={() => update({ q: '', category: '' })} />
            ) : (
                <>
                    <p id="dash-count" aria-live="polite">
                        {filtered.length === 1 ? '1 akce' : `${start + 1}–${start + visible.length} z ${filtered.length} akcí`}
                    </p>

                    <ul className="adm-panel dash-list">
                        {visible.map((event, i) => (
                            <EventRow
                                key={event.id}
                                event={event}
                                index={i}
                                past={daysFromToday(event.date, today) < 0}
                                onDelete={() => setPendingDelete(event)}
                            />
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <nav id="dash-pager" aria-label="Stránkování">
                            <button type="button" className="adm-icon-btn" aria-label="Předchozí stránka" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                                <ChevronLeftIcon />
                            </button>
                            {getPageItems(currentPage, totalPages).map((item, i) =>
                                item === '...' ? (
                                    <span key={`gap-${i}`} className="dash-pager-gap" aria-hidden="true">…</span>
                                ) : (
                                    <button
                                        key={item}
                                        type="button"
                                        className="dash-pager-btn"
                                        aria-current={item === currentPage ? 'page' : undefined}
                                        aria-label={`Stránka ${item}`}
                                        onClick={() => goToPage(item)}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                            <button type="button" className="adm-icon-btn" aria-label="Další stránka" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                                <ChevronRightIcon />
                            </button>
                        </nav>
                    )}
                </>
            )}

            <AdminDialog
                open={pendingDelete !== null}
                title={pendingDelete ? `Smazat „${pendingDelete.name}“?` : ''}
                confirmLabel={deleting ? 'Mažu…' : 'Smazat akci'}
                busy={deleting}
                onConfirm={confirmDelete}
                onClose={() => setPendingDelete(null)}
            >
                <p>Akce zmizí z webu i s obrázkem. Vrátit to nejde.</p>
            </AdminDialog>
        </AdminShell>
    )
}

function Stat({ value, label, loading, tone, onClick }) {
    const content = (
        <>
            <span className="dash-stat-value">{loading ? '–' : value}</span>
            <span className="dash-stat-label">{label}</span>
        </>
    )
    const className = `dash-stat${tone ? ` dash-stat--${tone}` : ''}`
    if (onClick) {
        return <button type="button" className={`${className} dash-stat--link`} onClick={onClick}>{content}</button>
    }
    return <div className={className}>{content}</div>
}

// Řádek akce. Datum je první údaj (pravidlo č. 1 design systému). Celý řádek je cíl
// odkazu na úpravu: odkaz v názvu se přes ::after roztáhne po řádku (stejný vzor jako
// karta akce na webu), tlačítka Zobrazit a Smazat leží nad ním.
function EventRow({ event, index, past, onDelete }) {
    const parts = dayParts(event.date)
    const { category, extra, top } = splitTags(event.tags)
    const year = event.date?.split('.')[2]
    const thisYear = String(new Date().getFullYear())

    return (
        <li className={`dash-row adm-rise${past ? ' dash-row--past' : ''}`} style={{ '--i': index }}>
            <span className="dash-date" aria-hidden="true">
                {parts ? (
                    <>
                        <b>{parts.day}</b>
                        <i>{parts.month}{year && year !== thisYear ? ` ${year.slice(2)}` : ''}</i>
                    </>
                ) : <i>bez data</i>}
            </span>

            <span className="dash-thumb" style={eventVisual(event)} aria-hidden="true" />

            <div className="dash-main">
                <Link to={`/admin/edit/${event.id}`} className="dash-name">
                    {event.name}
                    <span className="visually-hidden">, {event.date ?? 'bez data'}, upravit</span>
                </Link>
                <div className="dash-meta">
                    {event.location && <span className="dash-where">{event.location}</span>}
                    {category && <span className="adm-chip">{category}</span>}
                    {extra.map(tag => <span key={tag} className="adm-chip">{tag}</span>)}
                    {top && <span className="adm-chip adm-chip--top">TOP</span>}
                    {past && <span className="adm-chip adm-chip--past">Proběhlo</span>}
                    {!event.imageUrl && <span className="adm-chip adm-chip--past">Bez fotky</span>}
                </div>
            </div>

            <div className="dash-actions">
                <a href={eventPath(event)} target="_blank" rel="noreferrer" className="adm-icon-btn" aria-label={`Zobrazit na webu: ${event.name}`} title="Zobrazit na webu">
                    <ExternalIcon size={18} />
                </a>
                <button type="button" className="adm-icon-btn adm-icon-btn--danger" aria-label={`Smazat: ${event.name}`} title="Smazat" onClick={onDelete}>
                    <TrashIcon size={18} />
                </button>
            </div>
        </li>
    )
}

function EmptyState({ events, period, hasFilter, onReset }) {
    if (events.length === 0) {
        return (
            <div className="adm-panel adm-empty">
                <span className="adm-empty-ic"><CalendarIcon size={24} /></span>
                <h2>Zatím žádné akce</h2>
                <p>Vytvoř první akci nebo schval návrhy z importu. Objeví se tady i na webu.</p>
                <Link to="/admin/create" className="adm-btn adm-btn--primary"><PlusIcon size={16} />Nová akce</Link>
            </div>
        )
    }
    if (hasFilter) {
        return (
            <div className="adm-panel adm-empty">
                <span className="adm-empty-ic"><SearchIcon size={24} /></span>
                <h2>Nic neodpovídá hledání</h2>
                <p>Zkus jiné slovo nebo zruš filtr kategorie.</p>
                <button type="button" className="adm-btn" onClick={onReset}>Zrušit filtry</button>
            </div>
        )
    }
    return (
        <div className="adm-panel adm-empty">
            <span className="adm-empty-ic"><CalendarIcon size={24} /></span>
            <h2>{period === 'past' ? 'Žádné proběhlé akce' : 'Žádné nadcházející akce'}</h2>
            <p>{period === 'past' ? 'Proběhlé akce se tu ukážou den po konání.' : 'Program je prázdný. Přidej akci nebo se podívej do návrhů.'}</p>
            {period !== 'past' && <Link to="/admin/create" className="adm-btn adm-btn--primary"><PlusIcon size={16} />Nová akce</Link>}
        </div>
    )
}
