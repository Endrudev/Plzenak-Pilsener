import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import { CATEGORIES } from '../../lib/categories.jsx'
import './Header.css'

function MenuIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
        </svg>
    )
}

function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
        </svg>
    )
}

function Header() {
    const { pathname } = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const headerRef = useRef(null)

    // Zavřít drawer při změně stránky (klik na odkaz uvnitř) a na Escape.
    useEffect(() => { setMenuOpen(false) }, [pathname])
    useEffect(() => {
        if (!menuOpen) return
        function onKeyDown(e) { if (e.key === 'Escape') setMenuOpen(false) }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [menuOpen])

    // Skutečná výška lišty (padding + obsah, mění se podle breakpointu i
    // podle toho, jestli je vidět hamburger/desktop nav) — zapsaná jako CSS
    // proměnná na :root, ať ji můžou číst hero sekce, co pod ni mají
    // "zajíždět" (CategoryHero.css .cat-hero, Events.css #events-hero).
    // Natvrdo odhadnutá hodnota by se rozbila při každé změně layoutu
    // headeru — přesně tenhle druh chyby už se v tomhle redesignu stal
    // vícekrát (viz komentáře o "raw px on fixed 1440 canvas").
    useEffect(() => {
        const el = headerRef.current
        if (!el) return
        const setVar = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`)
        setVar()
        const ro = new ResizeObserver(setVar)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return (
        <header id="site-header" ref={headerRef}>
            <div id="header-inner">
                <Link to="/" id="brand-lockup">
                    <PlzenakLogo size={24} />
                </Link>

                <button
                    type="button"
                    id="header-menu-btn"
                    aria-label={menuOpen ? 'Zavřít menu' : 'Otevřít menu'}
                    aria-expanded={menuOpen}
                    aria-controls="header-drawer"
                    onClick={() => setMenuOpen(o => !o)}
                >
                    {menuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>

                <nav id="header-nav">
                    <Link to="/" className={pathname === '/' ? 'nav-link nav-link--active' : 'nav-link'}>Domů</Link>
                    <Link to="/events" className={pathname === '/events' ? 'nav-link nav-link--active' : 'nav-link'}>Akce</Link>
                    <div id="nav-category-wrapper">
                        <button type="button" id="nav-category-trigger" className="nav-link">
                            Kategorie
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        <div id="nav-category-menu">
                            <Link to="/top-akce" id="nav-category-top">
                                <span id="nav-category-top-icon">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m12 4 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />
                                    </svg>
                                </span>
                                <span id="nav-category-top-text">
                                    <strong>TOP akce — to nejlepší z Plzně</strong>
                                    <span>Aktuální výběr</span>
                                </span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                            <div id="nav-category-list-header">
                                <span>Všechny kategorie</span>
                            </div>
                            <div id="nav-category-grid">
                                {CATEGORIES.map(cat => (
                                    <Link key={cat.slug} to={`/events?kategorie=${cat.name}`} className="nav-category-item">
                                        <span className="nav-category-icon">{cat.icon(18)}</span>
                                        <span className="nav-category-label">{cat.name}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                            <Link to="/events" id="nav-category-all">
                                Všechny akce
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </nav>

                <Link to="/mapa" id="header-map-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    Mapa
                </Link>
            </div>

            {menuOpen && (
                <div id="header-drawer" role="dialog" aria-modal="true" aria-label="Navigace">
                    <nav id="header-drawer-nav">
                        <Link to="/" className={pathname === '/' ? 'nav-link nav-link--active' : 'nav-link'}>Domů</Link>
                        <Link to="/events" className={pathname === '/events' ? 'nav-link nav-link--active' : 'nav-link'}>Akce</Link>
                        <Link to="/top-akce" className="nav-link">TOP akce</Link>
                    </nav>
                    <div id="header-drawer-categories">
                        <span id="header-drawer-categories-label">Kategorie</span>
                        <div id="header-drawer-categories-grid">
                            {CATEGORIES.map(cat => (
                                <Link key={cat.slug} to={`/events?kategorie=${cat.name}`} className="nav-category-item">
                                    <span className="nav-category-icon">{cat.icon(18)}</span>
                                    <span className="nav-category-label">{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link to="/mapa" id="header-drawer-map">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        Mapa
                    </Link>
                </div>
            )}
        </header>
    )
}

export default Header
