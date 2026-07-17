import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
    const { pathname } = useLocation()
    const isHome = pathname === '/'
    const isDetail = /^\/events\/\d+/.test(pathname)
    const isEvents = pathname === '/events'

    return (
        <header className={isHome ? 'header--hero' : isDetail ? 'header--dark' : isEvents ? 'header--plain' : ''}>
            <div id='header-container-menu'>
                <Link to="/events" id='button-actions'>Akce</Link>
                <Link to="/" id='button-home'>Domů</Link>
                <Link to="/" id='logo-small-wrapper'>
                    <img src='src/assets/logo_small.svg' id='logo-small-home' alt='Logo stránky Event Hub' />
                </Link>
                {isHome && (
                    <div id='header-search-pc'>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input type="text" placeholder="Hledat akce..." aria-label="Hledat akce" />
                    </div>
                )}
            </div>
            {isHome && (
                <Link to="/" id='header-container-logo'>
                    <img src='src/assets/logo_big.svg' id='logo-big-home' alt='Logo stránky Event Hub' />
                </Link>
            )}
            {isEvents && (
                <div id='header-events-hero'>
                    <div id='events-search-bar'>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input type="text" placeholder="Hledat akce..." aria-label="Hledat akce" />
                    </div>
                    <div id='events-filters'>
                        {['Kategorie', 'Místo', 'Datum'].map(f => (
                            <button key={f} className='filter-btn'>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                                {f}
                            </button>
                        ))}
                    </div>
                    <button id='events-search-btn'>Vyhledat</button>
                </div>
            )}
        </header>
    )
}

export default Header
