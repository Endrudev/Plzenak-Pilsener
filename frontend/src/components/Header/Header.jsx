import { Link, useLocation } from 'react-router-dom'
import PlzenakLogo from '../PlzenakLogo/PlzenakLogo.jsx'
import './Header.css'

const CATEGORIES = [
    { slug: 'gastro', name: 'Gastro', icon: '🍺' },
    { slug: 'kultura', name: 'Kultura', icon: '🎭' },
    { slug: 'hudba', name: 'Hudba', icon: '🎵' },
    { slug: 'sport', name: 'Sport', icon: '⚽' },
    { slug: 'pamatky', name: 'Památky', icon: '⛪' },
    { slug: 'deti', name: 'Pro děti', icon: '🙂' },
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
                                <span id="nav-category-top-icon">★</span>
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
