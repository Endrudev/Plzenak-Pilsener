import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlzenakLogo from '../../components/PlzenakLogo/PlzenakLogo.jsx'
import './Admin.css'

export default function Admin() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
        if (!email || !password) { setError('Vyplňte e-mail a heslo.'); return }
        setLoading(true)
        setError('')
        const fetchResult = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password}),
        })
        const data = await fetchResult.json()
        setLoading(false)
        if(!fetchResult.ok) {
            setError(data.error)
            return
        }else{
            localStorage.setItem('token', data.token)
            navigate('/admin/dashboard')
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleLogin()
    }

    return (
        <div id="admin-page">
            <div id="admin-card">
                <PlzenakLogo variant="mark" size={40} style={{ alignSelf: 'center' }} />
                <h1 id="admin-title">Přihlášení</h1>
                <p id="admin-subtitle">Správa akcí Plzeňáku — jen pro adminy.</p>

                <div id="admin-form">
                    <label className="admin-label" htmlFor="admin-email">E-mail</label>
                    <div className="admin-input-wrapper">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                            <polyline points="22 6 12 13 2 6" />
                        </svg>
                        <input
                            id="admin-email"
                            type="email"
                            placeholder="vas@email.cz"
                            className="admin-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <label className="admin-label" htmlFor="admin-password">Heslo</label>
                    <div className="admin-input-wrapper">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                            id="admin-password"
                            type="password"
                            placeholder="••••••••"
                            className="admin-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        {/* TODO: vizuální placeholder, přepínání viditelnosti hesla zatím není propojené (chybí state) */}
                        <button type="button" className="admin-eye-btn" aria-label="Zobrazit heslo" tabIndex={-1}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>

                    {error && <p id="admin-error">{error}</p>}

                    <button id="admin-submit" onClick={handleLogin} disabled={loading}>
                        {loading ? 'Přihlašuji…' : 'Přihlásit'}
                    </button>

                    {/* TODO: vizuální placeholder, obnova hesla není implementovaná (žádný backend flow) */}
                    <a href="#" id="admin-forgot">Zapomenuté heslo?</a>

                    <hr id="admin-divider" />

                    <button id="admin-back-btn" onClick={() => navigate(-1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                        </svg>
                        Zpět na Plzeňák
                    </button>
                </div>
            </div>
        </div>
    )
}
