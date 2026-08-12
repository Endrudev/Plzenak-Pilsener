import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvents, deleteEvent } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
import PlzenakLogo from '../../components/PlzenakLogo/PlzenakLogo.jsx'
import './AdminDashboard.css'

const PER_PAGE = 10

export default function AdminDashboard() {
    const navigate = useNavigate()
    useAuthGuard()
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => { fetchEvents() }, [])

    async function handleSignOut() {
        navigate('/admin')
    }

    async function fetchEvents() {
        setLoading(true)
        try {
            const data = await getEvents()
            setEvents(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Opravdu smazat tuto akci?')) return
        try {
            await deleteEvent(id)
            setEvents(prev => prev.filter(e => e.id !== id))
        } catch (e) {
            alert('Chyba při mazání: ' + e.message)
        }
    }

    const filtered = events.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
    )
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const currentPage = Math.min(page, totalPages)
    const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

    function getPaginationItems() {
        if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
        return [1, 2, 3, 4, '...', totalPages]
    }

    function ActionButtons({ event }) {
        return (
            <div className="action-btns">
                <button className="action-btn action-view" title="Zobrazit" onClick={() => navigate(`/events/${event.id}`)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
                <button className="action-btn action-edit" title="Upravit" onClick={() => navigate(`/admin/edit/${event.id}`)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
                <button className="action-btn action-delete" title="Smazat" onClick={() => handleDelete(event.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" /><path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                </button>
            </div>
        )
    }

    return (
        <div id="dashboard-page">
            <header id="dashboard-topbar">
                <div id="dashboard-topbar-inner">
                    <div id="dashboard-brand">
                        <PlzenakLogo size={22} />
                        <span id="dashboard-admin-badge">Administrace</span>
                    </div>
                    <div id="dashboard-user">
                        {/* TODO: reálné jméno/e-mail admina se nikde neukládá (Admin.jsx si při loginu drží jen token) — zatím obecný placeholder */}
                        <span id="dashboard-user-name">Administrátor</span>
                        <span id="dashboard-avatar">A</span>
                        <button id="dashboard-logout-btn" onClick={handleSignOut} title="Odhlásit" aria-label="Odhlásit">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div id="dashboard-content">
                <div id="dashboard-toolbar">
                    <button id="create-btn" onClick={() => navigate('/admin/create')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Vytvořit akci
                    </button>
                    <div id="dash-search-wrapper">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            id="dash-search"
                            placeholder="Hledat v akcích..."
                            aria-label="Hledat v akcích"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                        />
                    </div>
                </div>

                {loading ? (
                    <p id="dashboard-loading">Načítání…</p>
                ) : filtered.length === 0 ? (
                    <div id="dashboard-empty">
                        <span id="dashboard-empty-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
                                <line x1="4" y1="20" x2="20" y2="5" />
                            </svg>
                        </span>
                        <h2>Zatím žádné akce</h2>
                        <p>Vytvoř první akci a objeví se tady i ve veřejném listingu.</p>
                        <button className="dashboard-empty-btn" onClick={() => navigate('/admin/create')}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Vytvořit akci
                        </button>
                    </div>
                ) : (
                    <>
                        <table id="events-table">
                            <thead>
                                <tr>
                                    <th className="col-id">ID</th>
                                    <th className="col-title">Nadpis</th>
                                    <th className="col-date">Datum</th>
                                    <th className="col-actions">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map(event => (
                                    <tr key={event.id}>
                                        <td className="col-id">{String(event.id).padStart(3, '0')}</td>
                                        <td className="col-title">{event.name}</td>
                                        <td className="col-date">{event.date ?? ''}</td>
                                        <td className="col-actions"><ActionButtons event={event} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div id="dashboard-cards">
                            {visible.map(event => (
                                <div className="dashboard-card" key={event.id}>
                                    <div className="dashboard-card-top">
                                        <span className="dashboard-card-id">{String(event.id).padStart(3, '0')}</span>
                                        <ActionButtons event={event} />
                                    </div>
                                    <div className="dashboard-card-title">{event.name}</div>
                                    <div className="dashboard-card-date">{event.date ?? ''}</div>
                                </div>
                            ))}
                        </div>

                        <div id="dashboard-pagination">
                            {getPaginationItems().map((item, i) =>
                                item === '...' ? (
                                    <span key={i} className="dashboard-pag-dots">…</span>
                                ) : (
                                    <button
                                        key={item}
                                        className={`dashboard-pag-btn${currentPage === item ? ' dashboard-pag-btn--active' : ''}`}
                                        onClick={() => setPage(item)}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
