import { Link, useLocation } from 'react-router-dom'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import './Header.css'

const CATEGORIES = [
    {
        slug: 'gastro', name: 'Gastro', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.5 8.5h8.5V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2z" /><path d="M14 11h2.5a2.75 2.75 0 0 1 0 5.5H14" /><path d="M5.5 8.5a2.2 2.2 0 0 1 2-2.2 2.6 2.6 0 0 1 4.5-1.5A2.3 2.3 0 0 1 14 8.5" />
            </svg>
        )
    },
    {
        slug: 'kultura', name: 'Kultura', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h7v5a3.5 3.5 0 0 1-7 0z" /><circle cx="6.2" cy="7.2" r=".6" fill="currentColor" stroke="none" /><circle cx="8.8" cy="7.2" r=".6" fill="currentColor" stroke="none" /><path d="M13 9h7v5a3.5 3.5 0 0 1-7 0z" /><circle cx="15.2" cy="11.2" r=".6" fill="currentColor" stroke="none" /><circle cx="17.8" cy="11.2" r=".6" fill="currentColor" stroke="none" />
            </svg>
        )
    },
    {
        slug: 'hudba', name: 'Hudba', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V6.2l10-2V16" /><circle cx="6.8" cy="18" r="2.2" /><circle cx="16.8" cy="16" r="2.2" />
            </svg>
        )
    },
    {
        slug: 'sport', name: 'Sport', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8.5" /><path d="m12 8.8 3.04 2.21-1.16 3.58h-3.76l-1.16-3.58z" /><path d="M12 8.8V3.6M15.04 11.01 19.9 9.4M13.88 14.59 17 18.7M10.12 14.59 7 18.7M8.96 11.01 4.1 9.4" />
            </svg>
        )
    },
    {
        slug: 'pamatky', name: 'Památky', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3.5 9.5 8.5-5.5 8.5 5.5" /><path d="M3.5 19.5h17M4.8 9.5v10M9.6 9.5v10M14.4 9.5v10M19.2 9.5v10" />
            </svg>
        )
    },
    {
        slug: 'deti', name: 'Pro děti', icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15c2.8 0 5-2.5 5-5.6S14.8 4 12 4 7 6.4 7 9.4 9.2 15 12 15Z" /><path d="m11 15.2 1 1.3 1-1.3" /><path d="M12 16.5c0 1.2-1.5 1.2-1.5 2.4s1.5 1.2 1.5 2.4" />
            </svg>
        )
    },
]

function Header() {
    const { pathname } = useLocation()

    return (
        <header id="site-header">
            <div id="header-inner">
                <Link to="/" id="brand-lockup">
                    <PlzenakLogo size={24} />
                </Link>

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
                            <Link to="/events?kategorie=top-akce" id="nav-category-top">
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
                                    <Link key={cat.slug} to={`/events?kategorie=${cat.slug}`} className="nav-category-item">
                                        <span className="nav-category-icon">{cat.icon}</span>
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
        </header>
    )
}

export default Header
