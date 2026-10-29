import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import PlzenakLogo from '../../PlzenakLogo/PlzenakLogo.jsx'
import { getCandidates } from '../../../lib/eventsApi.js'
import { setMode, useLandingMode } from '../../../lib/landingTheme.js'
import { currentSession, signOut } from '../../../lib/admin/session.js'
import { useAdminTheme } from '../useAdminTheme.js'
import { ExternalIcon, InboxIcon, ListIcon, LogOutIcon, MoonIcon, PlusIcon, SunIcon } from '../adminIcons.jsx'
import '../admin.css'
import './AdminShell.css'

// Rám všech stránek administrace kromě přihlášení: skleněná lišta nahoře (stejný
// „ostrov“ jako veřejná hlavička, tokeny --nav-*), obsah a na telefonu spodní lišta
// se třemi cestami. Veřejná hlavička a patička se na /admin* nevykreslují (App.jsx).
//
// `pendingCount`: počet čekajících návrhů. Stránka Návrhy ho zná přesně a předá ho,
// ostatní stránky ne a lišta si ho načte sama. Když se nenačte, odznak se neukáže.
export default function AdminShell({ children, pendingCount }) {
    useAdminTheme()
    const navigate = useNavigate()
    const mode = useLandingMode()
    const [ownCount, setOwnCount] = useState(null)
    const [session] = useState(() => currentSession())
    const count = typeof pendingCount === 'number' ? pendingCount : ownCount

    useEffect(() => {
        if (typeof pendingCount === 'number') return
        getCandidates('pending')
            .then(data => setOwnCount(data.items.length))
            .catch(() => setOwnCount(null))
    }, [pendingCount])

    function handleSignOut() {
        signOut()
        navigate('/admin', { replace: true })
    }

    const badge = count > 0 && <span className="adm-nav-count" aria-label={`${count} čeká`}>{count}</span>
    const navClass = ({ isActive }) => (isActive ? 'adm-nav-link adm-nav-link--active' : 'adm-nav-link')

    return (
        <div id="adm">
            <a className="adm-skip" href="#adm-main">Přeskočit na obsah</a>

            <header id="adm-bar">
                <Link to="/admin/dashboard" id="adm-brand" aria-label="Administrace, přehled akcí">
                    <PlzenakLogo size={22} tone={mode === 'dark' ? 'inverseColor' : 'color'} />
                    <span id="adm-brand-tag">Administrace</span>
                </Link>

                <nav id="adm-nav" aria-label="Administrace">
                    <NavLink to="/admin/dashboard" className={navClass}>
                        <ListIcon size={17} />Akce
                    </NavLink>
                    <NavLink to="/admin/candidates" className={navClass}>
                        <InboxIcon size={17} />Návrhy{badge}
                    </NavLink>
                </nav>

                <div id="adm-bar-actions">
                    <button
                        type="button"
                        className="adm-icon-btn"
                        aria-label={mode === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
                        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                    >
                        {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>
                    <Link to="/admin/create" className="adm-btn adm-btn--primary adm-btn--sm" id="adm-create">
                        <PlusIcon size={16} />Nová akce
                    </Link>
                    <AccountMenu email={session?.email} onSignOut={handleSignOut} />
                </div>
            </header>

            <main id="adm-main" tabIndex={-1}>{children}</main>

            <nav id="adm-tabbar" aria-label="Administrace">
                <NavLink to="/admin/dashboard" className={navClass}>
                    <ListIcon size={20} /><span>Akce</span>
                </NavLink>
                <NavLink to="/admin/create" className="adm-nav-link adm-tab-create">
                    <span className="adm-tab-create-ic"><PlusIcon size={20} /></span><span>Nová</span>
                </NavLink>
                <NavLink to="/admin/candidates" className={navClass}>
                    <span className="adm-tab-ic"><InboxIcon size={20} />{badge}</span><span>Návrhy</span>
                </NavLink>
            </nav>
        </div>
    )
}

// Účet vpravo v liště: kulaté tlačítko s iniciálou, po klepnutí malá nabídka s e-mailem,
// odkazem na web a odhlášením. Escape a klik mimo ji zavřou, fokus se vrátí na tlačítko.
function AccountMenu({ email, onSignOut }) {
    const [open, setOpen] = useState(false)
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
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    const initial = (email?.trim()[0] ?? 'A').toUpperCase()

    return (
        <div id="adm-account" ref={wrapRef}>
            <button
                ref={btnRef}
                type="button"
                id="adm-account-btn"
                aria-expanded={open}
                aria-controls="adm-account-menu"
                aria-label={email ? `Účet ${email}` : 'Účet'}
                onClick={() => setOpen(o => !o)}
            >
                {initial}
            </button>
            {open && (
                <div id="adm-account-menu">
                    <div id="adm-account-who">
                        <span>Přihlášen jako</span>
                        <strong>{email ?? 'administrátor'}</strong>
                    </div>
                    <a href="/" target="_blank" rel="noreferrer" className="adm-menu-item">
                        <ExternalIcon size={17} />Zobrazit web
                    </a>
                    <button type="button" className="adm-menu-item" onClick={onSignOut}>
                        <LogOutIcon size={17} />Odhlásit
                    </button>
                </div>
            )}
        </div>
    )
}
