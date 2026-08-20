import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import './MapConsent.css'

const TEXT = {
    detail: {
        title: 'Mapa se nenačetla',
        lines: [
            'Mapu poskytuje OpenStreetMap — při načtení odešle tvoji IP adresu a údaje o prohlížeči.',
            'Načteme ji, až nám to dovolíš.',
        ],
        primaryLabel: 'Zobrazit mapu (načíst OpenStreetMap)',
    },
    listing: {
        title: 'Mapa čeká na tvůj souhlas',
        lines: [
            'Podkladové dlaždice a mapové služby ukládají cookies třetích stran.',
            'Načteme je, až nám to dovolíš — akce si zatím můžeš projít v seznamu.',
        ],
        primaryLabel: 'Načíst mapu',
    },
}

export default function MapConsent({ variant = 'detail', onLoadOnce, onAlwaysLoad, onStayInList }) {
    const copy = TEXT[variant]

    return (
        <div className="map-consent">
            <svg className="map-consent-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l-5 2V6l5-2 6 2 5-2v14l-5 2-6-2z" /><line x1="9" y1="4" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="20" />
                <line x1="2" y1="2" x2="22" y2="22" />
            </svg>

            <p className="map-consent-title">{copy.title}</p>

            <p className="map-consent-text">
                {copy.lines.map((line, i) => (
                    <Fragment key={line}>
                        {line}
                        {i < copy.lines.length - 1 && <br />}
                    </Fragment>
                ))}
            </p>

            <div className="map-consent-actions">
                <button type="button" className="map-consent-btn map-consent-btn--primary" onClick={onLoadOnce}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {copy.primaryLabel}
                </button>

                {onStayInList && (
                    <button type="button" className="map-consent-btn map-consent-btn--secondary" onClick={onStayInList}>
                        Zůstat v seznamu
                    </button>
                )}
            </div>

            {onAlwaysLoad && (
                <button type="button" className="map-consent-always-btn" onClick={onAlwaysLoad}>
                    Vždy načítat mapy
                </button>
            )}

            <Link className="map-consent-link" to="/zasady-ochrany-osobnich-udaju#sluzby-tretich-stran">
                Jak pracujeme s cookies
            </Link>
        </div>
    )
}
