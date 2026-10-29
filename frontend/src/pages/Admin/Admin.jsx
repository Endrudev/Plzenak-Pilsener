import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PlzenakLogo from '../../components/PlzenakLogo/PlzenakLogo.jsx'
import DuskSkyline from '../../components/NightSkyline/DuskSkyline.jsx'
import { useAdminTheme } from '../../components/admin/useAdminTheme.js'
import { AlertIcon, ChevronLeftIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '../../components/admin/adminIcons.jsx'
import { currentSession, saveToken } from '../../lib/admin/session.js'
import { useLandingMode } from '../../lib/landingTheme.js'
import '../../components/admin/admin.css'
import './Admin.css'

export default function Admin() {
    useAdminTheme()
    const navigate = useNavigate()
    const mode = useLandingMode()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [capsLock, setCapsLock] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Kdo má platný token, na přihlášení nemá co dělat.
    useEffect(() => {
        if (currentSession()) navigate('/admin/dashboard', { replace: true })
    }, [])

    // Skutečný <form> se submitem: Enter funguje v obou polích bez vlastního
    // posluchače a správce hesel pozná přihlašovací formulář (autocomplete níž).
    async function handleSubmit(e) {
        e.preventDefault()
        if (loading) return
        if (!email.trim() || !password) { setError('Vyplňte e-mail a heslo.'); return }
        setLoading(true)
        setError('')
        try {
            const fetchResult = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim(), password }),
            })
            // Odpověď nemusí být JSON — rate limiter, proxy nebo pád serveru umí
            // vrátit HTML. Bez tohohle by .json() vyhodil výjimku a přihlášení by
            // skončilo tiše, jako by se nic nestalo.
            const data = await fetchResult.json().catch(() => ({}))
            if (!fetchResult.ok) {
                setError(data.error || `Přihlášení selhalo (HTTP ${fetchResult.status}).`)
                return
            }
            saveToken(data.token)
            navigate('/admin/dashboard', { replace: true })
        } catch (e) {
            // Sem spadne hlavně nedostupný backend. Dřív se výjimka nikam nezapsala,
            // setLoading(false) se neprovedl a tlačítko zůstalo v "Přihlašuji…"
            // navždy — bez chyby na stránce.
            console.error(e)
            setError('Server neodpovídá. Zkontrolujte, že backend běží, a zkuste to znovu.')
        } finally {
            setLoading(false)
        }
    }

    // Caps Lock se pozná jen z události klávesnice, proto se kontroluje při psaní hesla.
    function checkCaps(e) {
        if (typeof e.getModifierState === 'function') setCapsLock(e.getModifierState('CapsLock'))
    }

    return (
        <div id="adm-login">
            <main id="login-main">
                <Link to="/" id="login-back">
                    <ChevronLeftIcon size={16} />Zpět na web
                </Link>

                <div id="login-form-wrap">
                    <span className="login-logo"><PlzenakLogo size={28} tone={mode === 'dark' ? 'inverseColor' : 'color'} /></span>

                    <h1 id="login-title">Přihlášení</h1>
                    <p id="login-lead">Správa akcí Plzeňáku. Přístup mají jen administrátoři.</p>

                    <form id="login-form" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label className="adm-label" htmlFor="login-email">E-mail</label>
                            <div className="adm-input" data-invalid={(error && !email.trim()) || undefined}>
                                <MailIcon size={18} />
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    inputMode="email"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    placeholder="vas@email.cz"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    aria-describedby={error ? 'login-error' : undefined}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="adm-label" htmlFor="login-password">Heslo</label>
                            <div className="adm-input" data-invalid={(error && !password) || undefined}>
                                <LockIcon size={18} />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={checkCaps}
                                    onKeyUp={checkCaps}
                                    aria-describedby={[capsLock && 'login-caps', error && 'login-error'].filter(Boolean).join(' ') || undefined}
                                />
                                <button
                                    type="button"
                                    className="adm-icon-btn login-eye"
                                    aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword(v => !v)}
                                >
                                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                                </button>
                            </div>
                            {capsLock && <p id="login-caps" className="login-hint">Je zapnutý Caps Lock.</p>}
                        </div>

                        {error && (
                            <p id="login-error" className="adm-field-error" role="alert">
                                <AlertIcon size={16} />{error}
                            </p>
                        )}

                        <button type="submit" id="login-submit" className="adm-btn adm-btn--primary" disabled={loading}>
                            {loading ? 'Přihlašuji…' : 'Přihlásit se'}
                        </button>
                    </form>
                </div>

                <p id="login-foot">Plzeňák · akce v Plzni na jednom místě</p>
            </main>

            <aside id="login-art" aria-hidden="true">
                <div id="login-art-glow" />
                <div id="login-art-text">
                    <span id="login-art-eyebrow">Administrace</span>
                    <p id="login-art-title">Co se dnes večer v&nbsp;Plzni děje, rozhoduješ ty.</p>
                </div>
                <DuskSkyline className="login-skyline" />
            </aside>
        </div>
    )
}
