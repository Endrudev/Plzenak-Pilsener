import { Link } from 'react-router-dom'
import './CookieBanner.css'

export default function CookieBanner({ onAccept, onReject, onOpenSettings }) {
    return (
        <div id="cookie-banner" role="region" aria-label="Souhlas s cookies">
            <div id="cookie-banner-inner">
                <div id="cookie-banner-content">
                    <div id="cookie-banner-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="9" cy="9" r="1" /><circle cx="14" cy="11" r="1" /><circle cx="10" cy="15" r="1" />
                        </svg>
                    </div>
                    <div id="cookie-banner-text">
                        <p id="cookie-banner-title">Používáme cookies</p>
                        <p id="cookie-banner-desc">
                            Nezbytné cookies drží web v provozu. Volitelné nám pomáhají načítat mapy a vložený
                            obsah. Rozhodni sám —{' '}
                            <Link to="/zasady-ochrany-osobnich-udaju#sluzby-tretich-stran">více v zásadách</Link>.
                        </p>
                    </div>
                </div>

                <div id="cookie-banner-actions">
                    <div id="cookie-banner-actions-row">
                        <button type="button" id="cookie-banner-reject" onClick={onReject}>
                            Odmítnout
                        </button>
                        <button type="button" id="cookie-banner-accept" onClick={onAccept}>
                            Přijmout
                        </button>
                    </div>
                    <button type="button" id="cookie-banner-settings" onClick={onOpenSettings}>
                        Nastavení
                    </button>
                </div>
            </div>
        </div>
    )
}
