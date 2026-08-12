import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
    return (
        <div id="notfound-page">
            <div id="notfound-glow" />

            <div id="notfound-digits">
                <span>4</span>
                <svg id="notfound-pin" width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.72 11.2 7.01 11.45a1.5 1.5 0 0 0 1.98 0C13.28 21.2 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                </svg>
                <span>4</span>
            </div>

            <p id="notfound-eyebrow">Chyba 404</p>
            <h1 id="notfound-title">Tady nic není</h1>
            <p id="notfound-desc">
                Tuhle stránku jsme nenašli — možná už akce skončila, přesunula se jinam, nebo v odkazu chybí písmenko.
            </p>

            <div id="notfound-actions">
                <Link to="/" id="notfound-home-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9.5L12 3l9 6.5" /><path d="M5 9.5V21h14V9.5" />
                    </svg>
                    Zpět na domů
                </Link>
                <Link to="/events" id="notfound-events-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Procházet akce
                </Link>
            </div>

            {/* TODO: vizuální placeholder — hledání zatím nikde na webu skutečně nefiltruje, viz Home/Events */}
            <div id="notfound-search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="Hledat akce v Plzni…" aria-label="Hledat akce" />
                <button type="button">Hledat</button>
            </div>

            {/* TODO: "Mapa akcí" vede na /mapa, která zatím neexistuje jako route */}
            <div id="notfound-quicklinks">
                <Link to="/events">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" /><line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
                        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" /><line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
                    </svg>
                    Dnes v Plzni
                </Link>
                <Link to="/mapa">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    Mapa akcí
                </Link>
                <Link to="/events">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                    Kategorie
                </Link>
            </div>
        </div>
    )
}
