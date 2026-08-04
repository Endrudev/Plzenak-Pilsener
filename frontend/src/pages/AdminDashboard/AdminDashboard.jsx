import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvents, deleteEvent } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
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
    const emptyRows = PER_PAGE - visible.length

    return (
        <div id="dashboard-page">
            <div id="dashboard-header">
                <button className="back-btn" onClick={() => navigate(-1)}>Zpět</button>
                <button id="signout-btn" onClick={handleSignOut}>Odhlásit</button>
            </div>

            <div id="dashboard-content">
                <div id="dashboard-toolbar">
                    <button id="create-btn" onClick={() => navigate('/admin/create')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create new
                    </button>
                    <div id="dash-search-wrapper">
                        <label htmlFor="dash-search">Search:</label>
                        <input
                            id="dash-search"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                        />
                    </div>
                </div>

                <table id="events-table">
                    <thead>
                        <tr>
                            <th className="col-id">ID</th>
                            <th className="col-title">Title</th>
                            <th className="col-date">Date</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', fontFamily: 'Montserrat' }}>Načítání…</td></tr>
                        ) : (
                            <>
                                {visible.map(event => (
                                    <tr key={event.id}>
                                        <td className="col-id">{event.id}</td>
                                        <td className="col-title">{event.name}</td>
                                        <td className="col-date">{event.date ?? ''}</td>
                                        <td className="col-actions">
                                            <div className="action-btns">
                                                <button
                                                    className="action-btn action-view"
                                                    title="View"
                                                    onClick={() => navigate(`/events/${event.id}`)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn action-edit"
                                                    title="Edit"
                                                    onClick={() => navigate(`/admin/edit/${event.id}`)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn action-delete"
                                                    title="Delete"
                                                    onClick={() => handleDelete(event.id)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                        <path d="M10 11v6"/><path d="M14 11v6"/>
                                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {Array.from({ length: emptyRows }).map((_, i) => (
                                    <tr key={`empty-${i}`} className="empty-row">
                                        <td className="col-id"></td>
                                        <td className="col-title"></td>
                                        <td className="col-date"></td>
                                        <td className="col-actions"></td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>

                <div id="dashboard-pagination">
                    <button className="pag-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                    <span id="pag-current">{currentPage}</span>
                    <button className="pag-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>
        </div>
    )
}
