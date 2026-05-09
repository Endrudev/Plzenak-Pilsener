import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
    const { pathname } = useLocation()
    const isHome = pathname === '/'
    const isDetail = /^\/events\/\d+/.test(pathname)

    return (
        <header className={isHome ? 'header--hero' : isDetail ? 'header--dark' : ''}>
            <div id='header-container-menu'>
                <Link to="/events" id='button-actions'>Akce</Link>
                <Link to="/" id='button-home'>Domů</Link>
                <Link to="/">
                    <img src='src/assets/logo_small.svg' id='logo-small-home' alt='Logo stránky Event Hub' />
                </Link>
            </div>
            {isHome && (
                <Link to="/" id='header-container-logo'>
                    <img src='src/assets/logo_big.svg' id='logo-big-home' alt='Logo stránky Event Hub' />
                </Link>
            )}
        </header>
    )
}

export default Header
