import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
    return (
        <footer id="site-footer">
            <div id="footer-inner">
                <p id="footer-copy">© Plzeňák 2026</p>
                <nav id="footer-links">
                    <Link to="/zasady-ochrany-osobnich-udaju">Zásady ochrany osobních údajů</Link>
                    <Link to="/podminky-uziti">Podmínky užití</Link>
                    <button type="button" id="footer-cookie-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="9" cy="9" r="1" /><circle cx="14" cy="11" r="1" /><circle cx="10" cy="15" r="1" />
                        </svg>
                        Nastavení cookies
                    </button>
                    <a href="https://github.com/Endrudev/Plzenak-Pilsener" target="_blank" rel="noreferrer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
                        </svg>
                        GitHub
                    </a>
                    <a href="/admin">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Admin log in
                    </a>
                </nav>
            </div>
        </footer>
    )
}
