import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
            <button id="admin-back-btn" onClick={() => navigate(-1)}>Zpět</button>

            <div id="admin-card">
                <h1 id="admin-title">Log in</h1>

                <div id="admin-form">
                    <input
                        type="email"
                        placeholder="E-mail"
                        className="admin-input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <input
                        type="password"
                        placeholder="Heslo"
                        className="admin-input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {error && <p id="admin-error">{error}</p>}
                    <button id="admin-submit" onClick={handleLogin} disabled={loading}>
                        {loading ? 'Přihlašuji…' : 'Přihlásit'}
                    </button>
                </div>
            </div>
        </div>
    )
}
