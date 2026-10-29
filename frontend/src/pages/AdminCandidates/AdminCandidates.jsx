import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCandidates, approveCandidates, rejectCandidate } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
import AdminShell from '../../components/admin/AdminShell/AdminShell.jsx'
import AdminDialog from '../../components/admin/AdminDialog/AdminDialog.jsx'
import { AlertIcon, CheckIcon, CloseIcon, ExternalIcon, InboxIcon, PencilIcon, RefreshIcon } from '../../components/admin/adminIcons.jsx'
import './AdminCandidates.css'

// Návrhy akcí od importéru (fronta event_candidates, viz vault 03 Backend/API). Veřejné jsou
// až po schválení tady: schválení vytvoří akci a stáhne obrázek do R2. Texty návrhu se tu
// neupravují, opravy se dělají ve stávající stránce Upravit akce.

const BATCH = 10

const TABS = [
    { value: 'pending', label: 'Čekající' },
    { value: 'approved', label: 'Schválené' },
    { value: 'rejected', label: 'Zamítnuté' },
]

export default function AdminCandidates() {
    useAuthGuard()
    const [status, setStatus] = useState('pending')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [selected, setSelected] = useState(() => new Set())
    const [busy, setBusy] = useState(false)
    const [notice, setNotice] = useState(null)
    const [pendingReject, setPendingReject] = useState(null)
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

    // Schválení po dávkách po 10, ne po 50 (limit backendu). U každého návrhu se stahuje obrázek
    // ze zdroje a Nginx čeká na odpověď nejvýš 60 s: deset obrázků se do limitu vejde i při
    // pomalém zdroji, padesát ne. Výsledek je za každý návrh zvlášť, takže jedno selhání
    // neshodí ostatní a stránka řekne přesně, co se povedlo.
    async function approve(ids) {
        if (ids.length === 0 || busy) return
        setBusy(true)
        setNotice(null)
        const results = []
        try {
            for (let i = 0; i < ids.length; i += BATCH) {
                const data = await approveCandidates(ids.slice(i, i + BATCH))
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

    // Zamítnutí potvrzuje dialog (AdminDialog), ne window.confirm.
    async function confirmReject() {
        const item = pendingReject
        if (!item || busy) return
        setBusy(true)
        setNotice(null)
        try {
            await rejectCandidate(item.id)
            setNotice({ type: 'ok', text: `Zamítnuto: ${item.name}`, details: [] })
        } catch (e) {
            setNotice({ type: 'error', text: 'Zamítnutí se nepodařilo: ' + e.message, details: [] })
        }
        setBusy(false)
        setPendingReject(null)
        await load(status)
    }

    const pendingCount = status === 'pending' && !loading && !loadError ? items.length : undefined

    return (
        <AdminShell pendingCount={pendingCount}>
            <div className="adm-head">
                <div>
                    <p className="adm-eyebrow"><InboxIcon size={14} />Import</p>
                    <h1 className="adm-title">Návrhy akcí</h1>
                    <p className="adm-lead">Akce z importu čekají na tvé schválení. Na webu se ukážou, až je tady schválíš.</p>
                </div>

                <div className="adm-seg" role="group" aria-label="Stav návrhů">
                    {TABS.map(tab => (
                        <button key={tab.value} type="button" aria-pressed={status === tab.value} onClick={() => changeTab(tab.value)}>
                            {tab.label}
                            {tab.value === status && !loading && !loadError && <span className="adm-seg-count">{items.length}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {notice && (
                <div className={`adm-notice${notice.type === 'error' ? ' adm-notice--error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}>
                    {notice.type === 'error' ? <AlertIcon size={18} /> : <CheckIcon size={18} />}
                    <div>
                        <strong>{notice.text}</strong>
                        {notice.details.length > 0 && (
                            <ul>
                                {notice.details.map((line, i) => <li key={i}>{line}</li>)}
                            </ul>
                        )}
                    </div>
                    <button type="button" className="adm-icon-btn adm-notice-close" aria-label="Zavřít hlášku" onClick={() => setNotice(null)}>
                        <CloseIcon size={16} />
                    </button>
                </div>
            )}

            {loading ? (
                <div className="cand-list" role="status" aria-label="Načítání návrhů">
                    {Array.from({ length: 4 }, (_, i) => <div key={i} className="cand-skel adm-skel" />)}
                </div>
            ) : loadError ? (
                <div className="adm-panel adm-empty adm-empty--error">
                    <span className="adm-empty-ic"><AlertIcon size={24} /></span>
                    <h2>Návrhy se nepodařilo načíst</h2>
                    <p>{loadError}</p>
                    <button type="button" className="adm-btn adm-btn--primary" onClick={() => load(status)}>
                        <RefreshIcon size={16} />Zkusit znovu
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="adm-panel adm-empty">
                    <span className="adm-empty-ic"><InboxIcon size={24} /></span>
                    <h2>{status === 'pending' ? 'Nic nečeká na schválení' : 'Zatím tu nic není'}</h2>
                    <p>{status === 'pending' ? 'Až importér pošle další návrhy, objeví se tady.' : 'Návrhy v tomhle stavu zatím nejsou.'}</p>
                </div>
            ) : (
                <>
                    {status === 'pending' && (
                        <label className="cand-check cand-check--all">
                            <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={busy} />
                            <span>Vybrat vše ({items.length})</span>
                        </label>
                    )}

                    <ul className="cand-list">
                        {items.map((item, i) => (
                            <li
                                key={item.id}
                                className={`cand-card adm-rise${selected.has(item.id) ? ' cand-card--selected' : ''}`}
                                style={{ '--i': i }}
                            >
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
                                    <p className="cand-meta">{item.date} · {item.location}</p>
                                    <h2 className="cand-name">{item.name}</h2>
                                    <p className="cand-tags">
                                        {item.tags.map(tag => <span key={tag} className="adm-chip">{tag}</span>)}
                                    </p>
                                    {item.description[0] && <p className="cand-desc">{item.description[0]}</p>}
                                    <a className="cand-source" href={item.sourceUrl} target="_blank" rel="noreferrer">
                                        Zdroj<ExternalIcon size={14} />
                                    </a>
                                </div>
                                <div className="cand-actions">
                                    {status === 'pending' && (
                                        <>
                                            <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" disabled={busy} onClick={() => approve([item.id])}>
                                                <CheckIcon size={16} />Schválit
                                            </button>
                                            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={busy} onClick={() => setPendingReject(item)}>
                                                Zamítnout
                                            </button>
                                        </>
                                    )}
                                    {status === 'approved' && item.eventId && (
                                        <Link to={`/admin/edit/${item.eventId}`} className="adm-btn adm-btn--ghost adm-btn--sm">
                                            <PencilIcon size={16} />Upravit akci
                                        </Link>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* Hromadné schválení: lišta se přilepí ke spodku okna, jakmile je něco vybráno. */}
            {status === 'pending' && selected.size > 0 && (
                <div id="cand-bulk" role="region" aria-label="Hromadné schválení">
                    <span id="cand-bulk-count">Vybráno <b>{selected.size}</b></span>
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={busy} onClick={() => setSelected(new Set())}>
                        Zrušit výběr
                    </button>
                    <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" disabled={busy} onClick={() => approve([...selected])}>
                        <CheckIcon size={16} />{busy ? 'Schvaluji…' : `Schválit (${selected.size})`}
                    </button>
                </div>
            )}

            <AdminDialog
                open={pendingReject !== null}
                title={pendingReject ? `Zamítnout „${pendingReject.name}“?` : ''}
                confirmLabel={busy ? 'Zamítám…' : 'Zamítnout'}
                busy={busy}
                onConfirm={confirmReject}
                onClose={() => setPendingReject(null)}
            >
                <p>Importér tenhle návrh už znovu nenabídne.</p>
            </AdminDialog>
        </AdminShell>
    )
}
