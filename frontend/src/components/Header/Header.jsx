import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import { CATEGORIES } from '../../lib/filters/categories.jsx'
import { setMode, useLandingMode } from '../../lib/landingTheme.js'
import './Header.css'

const FOCUSABLE = 'a[href], button:not([disabled])'

function ArrowRight({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
        </svg>
    )
}

function SunIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
        </svg>
    )
}

function MoonIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
    )
}

function StarIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m12 4 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />
        </svg>
    )
}

// Plovoucí skleněná lišta. Na tmavé homepage (`/`) se přebarví přes tokeny
// --nav-* (viz index.css), komponenta tedy jen vybere variantu loga.
//
// Na mobilu se menu otevírá přes celou obrazovku. Přes celou obrazovku je i
// proto, že lišta sama má backdrop-filter, který z ní dělá rodiče pro všechny
// `position: fixed` potomky, takže překryv musí stát vedle lišty, ne v ní.
function Header() {
    const { pathname } = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const headerRef = useRef(null)
    const sentinelRef = useRef(null)
    const overlayRef = useRef(null)
    const menuBtnRef = useRef(null)
    const wasOpen = useRef(false)

    // Přepínač tmavého a světlého tématu existuje jen na homepage, jinde je web
    // světlý a není co přepínat. Lišta i logo se barví podle zvoleného režimu.
    const onHome = pathname === '/'
    const mode = useLandingMode()
    const dark = onHome && mode === 'dark'

    // Zavřít menu při změně stránky (klik na odkaz uvnitř).
    useEffect(() => { setMenuOpen(false) }, [pathname])

    // Otevřené menu: Escape zavírá, Tab zůstává uvnitř (překryv + tlačítko),
    // stránka pod ním se neposouvá a fokus se po zavření vrací na tlačítko.
    useEffect(() => {
        if (!menuOpen) return undefined

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        function onKeyDown(e) {
            if (e.key === 'Escape') { setMenuOpen(false); return }
            if (e.key !== 'Tab') return
            const nodes = [...(overlayRef.current?.querySelectorAll(FOCUSABLE) ?? []), menuBtnRef.current].filter(Boolean)
            if (nodes.length === 0) return
            const first = nodes[0]
            const last = nodes[nodes.length - 1]
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
        }
        window.addEventListener('keydown', onKeyDown)
        overlayRef.current?.querySelector('a')?.focus()
        wasOpen.current = true

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = previousOverflow
        }
    }, [menuOpen])

    useEffect(() => {
        if (!menuOpen && wasOpen.current) {
            wasOpen.current = false
            menuBtnRef.current?.focus()
        }
    }, [menuOpen])

    // Lišta zhoustne, jakmile se stránka odroluje od vrcholu. Bez posluchače
    // scrollu: hlídá se neviditelná značka na samém vršku dokumentu.
    useEffect(() => {
        const el = sentinelRef.current
        if (!el || !('IntersectionObserver' in window)) return undefined
        const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
        io.observe(el)
        return () => io.disconnect()
    }, [])

    // Skutečná výška lišty včetně horního odstupu, zapsaná jako --header-h.
    // Hero sekce pod lištou „zajíždějí" (CategoryHero.css, Events.css) a
    // odhadnutá hodnota by se rozbila při každé změně lišty.
    useEffect(() => {
        const el = headerRef.current
        if (!el) return undefined
        const setVar = () => {
            const margin = parseFloat(getComputedStyle(el).marginTop) || 0
            document.documentElement.style.setProperty('--header-h', `${el.offsetHeight + margin}px`)
        }
        setVar()
        const ro = new ResizeObserver(setVar)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const linkClass = path => (pathname === path ? 'nav-link nav-link--active' : 'nav-link')

    return (
        <>
            <div id="header-sentinel" ref={sentinelRef} aria-hidden="true" />

            <header
                id="site-header"
                ref={headerRef}
                data-scrolled={scrolled || undefined}
                data-open={menuOpen || undefined}
            >
                <div id="header-inner">
                    <Link to="/" id="brand-lockup" aria-label="Plzeňák, domů">
                        <PlzenakLogo size={24} tone={dark ? 'inverseColor' : 'color'} />
                    </Link>

                    <nav id="header-nav" aria-label="Hlavní navigace">
                        <Link to="/" className={linkClass('/')}>Domů</Link>
                        <Link to="/events" className={linkClass('/events')}>Akce</Link>
                        <div id="nav-category-wrapper">
                            <button type="button" id="nav-category-trigger" className="nav-link" aria-haspopup="true">
                                Kategorie
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            <div id="nav-category-menu">
                                <Link to="/top-akce" id="nav-category-top">
                                    <span id="nav-category-top-icon"><StarIcon size={17} /></span>
                                    <span id="nav-category-top-text">
                                        <strong>TOP akce: to nejlepší z Plzně</strong>
                                        <span>Aktuální výběr</span>
                                    </span>
                                    <ArrowRight />
                                </Link>
                                <div id="nav-category-list-header">
                                    <span>Všechny kategorie</span>
                                </div>
                                <div id="nav-category-grid">
                                    {CATEGORIES.map(cat => (
                                        <Link key={cat.slug} to={`/events?kategorie=${encodeURIComponent(cat.name)}`} className="nav-category-item">
                                            <span className="nav-category-icon">{cat.icon(18)}</span>
                                            <span className="nav-category-label">{cat.name}</span>
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/events" id="nav-category-all">
                                    Všechny akce
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </nav>

                    <div id="header-actions">
                        {onHome && (
                            <button
                                type="button"
                                id="header-theme-btn"
                                aria-label={mode === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
                                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                            >
                                {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
                            </button>
                        )}

                        <Link to="/top-akce" id="header-cta">
                            TOP akce
                            <span id="header-cta-ic"><StarIcon size={16} /></span>
                        </Link>

                        <button
                            ref={menuBtnRef}
                            type="button"
                            id="header-menu-btn"
                            aria-label={menuOpen ? 'Zavřít menu' : 'Otevřít menu'}
                            aria-expanded={menuOpen}
                            aria-controls="header-overlay"
                            onClick={() => setMenuOpen(o => !o)}
                        >
                            <span className="header-bars" aria-hidden="true"><i /><i /></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobilní menu přes celou obrazovku. Je v DOM pořád, aby šla zavřít
                s animací; zavřené je `inert` (mimo tab pořadí i čtečku). */}
            <div
                id="header-overlay"
                ref={overlayRef}
                data-open={menuOpen || undefined}
                role="dialog"
                aria-modal="true"
                aria-label="Navigace"
                inert={menuOpen ? undefined : ''}
            >
                <nav id="header-overlay-nav" aria-label="Hlavní navigace">
                    <Link to="/" className={linkClass('/')} style={{ '--i': 0 }}>Domů</Link>
                    <Link to="/events" className={linkClass('/events')} style={{ '--i': 1 }}>Akce</Link>
                    <Link to="/top-akce" className={linkClass('/top-akce')} style={{ '--i': 2 }}>TOP akce</Link>
                </nav>

                <div id="header-overlay-cats">
                    <span id="header-overlay-cats-label" style={{ '--i': 3 }}>Kategorie</span>
                    <div id="header-overlay-grid">
                        {CATEGORIES.map((cat, i) => (
                            <Link
                                key={cat.slug}
                                to={`/events?kategorie=${encodeURIComponent(cat.name)}`}
                                className="header-overlay-cat"
                                style={{ '--i': 4 + i }}
                            >
                                <span className="header-overlay-cat-ic">{cat.icon(20)}</span>
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <Link to="/events" id="header-overlay-cta" style={{ '--i': 10 }}>
                    Všechny akce
                    <span id="header-overlay-cta-ic"><ArrowRight size={18} /></span>
                </Link>
            </div>
        </>
    )
}

export default Header
