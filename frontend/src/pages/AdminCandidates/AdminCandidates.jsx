import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCandidates, approveCandidates, rejectCandidate } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
import PlzenakLogo from '../../components/PlzenakLogo/PlzenakLogo.jsx'
import '../AdminDashboard/AdminDashboard.css'
import './AdminCandidates.css'

// Návrhy akcí od importéru (fronta event_candidates, viz vault 03 Backend/API). Veřejné jsou
// až po schválení tady: schválení vytvoří akci a stáhne obrázek do R2. Texty návrhu se tu
// neupravují, opravy se dělají ve stávající stránce Upravit akce.

const TABS = [
    { value: 'pending', label: 'Čekající' },
    { value: 'approved', label: 'Schválené' },
    { value: 'rejected', label: 'Zamítnuté' },
]

export default function AdminCandidates() {
    const navigate = useNavigate()
    useAuthGuard()
    const [status, setStatus] = useState('pending')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [selected, setSelected] = useState(() => new Set())
    const [busy, setBusy] = useState(false)
    const [notice, setNotice] = useState(null)
    // Odpověď na starší požadavek nesmí přepsat novější (rychlé přepnutí záložek).
    const requestRef = useRef(0)

    useEffect(() => { load(status) }, [status])

    async function load(nextStatus) {
        const requestId = ++requestRef.current
        setLoading(true)
        setLoadError(null)
        try {
            const data = await getCandidates(nextStatus)
            if (requestId !== requestRef.current) return
            setItems(data.items)
            setSelected(new Set())
        } catch (e) {
            if (requestId !== requestRef.current) return
            console.error(e)
            setLoadError(e.message)
            setItems([])
        } finally {
            if (requestId === requestRef.current) setLoading(false)
        }
    }

    function changeTab(value) {
        if (value === status) return
        setNotice(null)
        setStatus(value)
    }

    function toggle(id) {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const allSelected = items.length > 0 && selected.size === items.length

    function toggleAll() {
        setSelected(allSelected ? new Set() : new Set(items.map(item => item.id)))
    }

    // Schválení po dávkách po 50 (limit backendu). Výsledek je za každý návrh zvlášť,
    // takže jedno selhání neshodí ostatní a stránka řekne přesně, co se povedlo.
    async function approve(ids) {
        if (ids.length === 0 || busy) return
        setBusy(true)
        setNotice(null)
        const results = []
        try {
            for (let i = 0; i < ids.length; i += 50) {
                const data = await approveCandidates(ids.slice(i, i + 50))
                results.push(...data.results)
            }
        } catch (e) {
            setNotice({ type: 'error', text: 'Schválení se nepodařilo: ' + e.message, details: [] })
            setBusy(false)
            await load(status)
            return
        }
        const done = results.filter(r => r.ok)
        const failed = results.filter(r => !r.ok)
        const noImage = done.filter(r => !r.imageSaved)
        const names = new Map(items.map(item => [item.id, item.name]))
        const details = [
            ...failed.map(r => `Nešlo schválit „${names.get(r.id) ?? r.id}“: ${r.error}`),
            ...noImage.map(r => `Bez obrázku „${names.get(r.id) ?? r.id}“: ${r.imageError ?? 'obrázek nebyl k dispozici.'}`),
        ]
        setNotice({
            type: failed.length > 0 ? 'error' : 'ok',
            text: `Schváleno ${done.length} z ${results.length}.` + (noImage.length > 0 ? ` Bez obrázku: ${noImage.length}.` : ''),
            details,
        })
        setBusy(false)
        await load(status)
    }

    async function reject(item) {
        if (busy) return
        if (!window.confirm(`Zamítnout návrh „${item.name}“? Znovu se už nenabídne.`)) return
        setBusy(true)
        setNotice(null)
        try {
            await rejectCandidate(item.id)
            setNotice({ type: 'ok', text: `Zamítnuto: ${item.name}`, details: [] })
        } catch (e) {
            setNotice({ type: 'error', text: 'Zamítnutí se nepodařilo: ' + e.message, details: [] })
        }
        setBusy(false)
        await load(status)
    }

    return (
        <div id="dashboard-page">
            <header id="dashboard-topbar">
                <div id="dashboard-topbar-inner">
                    <div id="dashboard-brand">
                        <PlzenakLogo size={22} />
                        <span id="dashboard-admin-badge">Administrace</span>
                    </div>
                    <button className="cand-back" onClick={() => navigate('/admin/dashboard')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Akce
                    </button>
                </div>
            </header>

            <div id="dashboard-content">
                <h1 className="cand-title">Návrhy akcí</h1>
                <p className="cand-lead">Akce z importu čekají na tvé schválení. Veřejné se stanou, až je tady schválíš.</p>

                <div className="cand-tabs" role="group" aria-label="Stav návrhů">
                    {TABS.map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            className="cand-tab"
                            aria-pressed={status === tab.value}
                            onClick={() => changeTab(tab.value)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {notice && (
                    <div className={`cand-notice cand-notice--${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
                        <strong>{notice.text}</strong>
                        {notice.details.length > 0 && (
                            <ul>
                                {notice.details.map((line, i) => <li key={i}>{line}</li>)}
                            </ul>
                        )}
                    </div>
                )}

                {status === 'pending' && items.length > 0 && !loading && (
                    <div className="cand-bulk">
                        <label className="cand-check">
                            <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={busy} />
                            <span>Vybrat vše ({items.length})</span>
                        </label>
                        <button
                            type="button"
                            className="cand-btn cand-btn--primary"
                            disabled={busy || selected.size === 0}
                            onClick={() => approve([...selected])}
                        >
                            {busy ? 'Schvaluji…' : `Schválit vybrané (${selected.size})`}
                        </button>
                    </div>
                )}

                {loading ? (
                    <div id="dashboard-loading" role="status" aria-label="Načítání návrhů">
                        {Array.from({ length: 4 }, (_, i) => <div key={i} className="cand-skel skeleton" />)}
                    </div>
                ) : loadError ? (
                    <div id="dashboard-empty" className="dashboard-empty--error">
                        <h2>Návrhy se nepodařilo načíst</h2>
                        <p>{loadError}</p>
                        <button className="dashboard-empty-btn" onClick={() => load(status)}>Zkusit znovu</button>
                    </div>
                ) : items.length === 0 ? (
                    <div id="dashboard-empty">
                        <h2>{status === 'pending' ? 'Nic nečeká na schválení' : 'Zatím tu nic není'}</h2>
                        <p>{status === 'pending' ? 'Až importér pošle další návrhy, objeví se tady.' : 'Návrhy v tomhle stavu zatím nejsou.'}</p>
                    </div>
                ) : (
                    <ul className="cand-list">
                        {items.map(item => (
                            <li key={item.id} className="cand-card">
                                {status === 'pending' && (
                                    <label className="cand-check cand-check--card">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(item.id)}
                                            onChange={() => toggle(item.id)}
                                            disabled={busy}
                                            aria-label={`Vybrat: ${item.name}`}
                                        />
                                    </label>
                                )}
                                {item.sourceImageUrl ? (
                                    <img
                                        className="cand-thumb"
                                        src={item.sourceImageUrl}
                                        alt=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="cand-thumb cand-thumb--empty" aria-hidden="true" />
                                )}
                                <div className="cand-body">
                                    <h2 className="cand-name">
                                        <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.name}</a>
                                    </h2>
                                    <p className="cand-meta">{item.date} · {item.location}</p>
                                    <p className="cand-tags">
                                        {item.tags.map(tag => <span key={tag} className="cand-tag">{tag}</span>)}
                                    </p>
                                    <p className="cand-desc">{item.description[0]}</p>
                                </div>
                                <div className="cand-actions">
                                    {status === 'pending' && (
                                        <>
                                            <button
                                                type="button"
                                                className="cand-btn cand-btn--primary"
                                                disabled={busy}
                                                onClick={() => approve([item.id])}
                                            >
                                                Schválit
                                            </button>
                                            <button
                                                type="button"
                                                className="cand-btn"
                                                disabled={busy}
                                                onClick={() => reject(item)}
                                            >
                                                Zamítnout
                                            </button>
                                        </>
                                    )}
                                    {status === 'approved' && item.eventId && (
                                        <button type="button" className="cand-btn" onClick={() => navigate(`/admin/edit/${item.eventId}`)}>
                                            Upravit akci
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
