import { Link } from 'react-router-dom'
import './OtherCategories.css'

function GoArrow() {
    return (
        <span className="other-cats-go" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
            </svg>
        </span>
    )
}

// Tři "identity" karty přesně podle handoffu (stejné barvy/podnadpisy na
// všech třech stránkách, doslova ze zdroje — *.dc.html, sekce #dalsi-h
// "Nic tě nezaujalo? Zkus jinou cestu") — každá stránka zobrazí ty
// ZBÝVAJÍCÍ dvě, ne tu svoji. Odkazy vedou na naše dedikované routy
// (/top-akce, /hudba, /zbytek-programu), ne na zdrojové /events?...,
// stejná úprava jako u ostatních odkazů v redesignu (Header, Footer,
// HeroBento).
const CARDS = {
    top: {
        to: '/top-akce',
        title: 'TOP akce',
        subtitle: 'To nejlepší, co se v Plzni chystá',
        // Poslední zastávka gradientu doslova ze zdroje (#B9550A) neprošla
        // kontrolou kontrastu — podtitulek (#3A1604, 13px, tenký běžný
        // text) v nejtmavší části gradientu padal na 3.37:1, WCAG AA pro
        // běžný text vyžaduje 4.5:1 (viz Fáze 7, přístupnostní průchod).
        // #D07520 drží stejnou barevnou identitu (teplá oranžová), jen o
        // trochu světlejší — podtitulek 4.82:1, nadpis 5.35:1.
        background: 'linear-gradient(155deg, #F59A3A 0%, #E8720C 50%, #D07520 100%)',
        color: '#2A0F04',
        subtitleColor: '#3A1604',
    },
    hudba: {
        to: '/hudba',
        title: 'Hudba',
        subtitle: 'Koncerty, kluby a festivaly',
        background: 'linear-gradient(155deg, #7B3480 0%, #4A1D57 100%)',
        color: '#FFFFFF',
        subtitleColor: '#F1DDF2',
    },
    zbytek: {
        to: '/zbytek-programu',
        title: 'Zbytek programu',
        subtitle: 'Procházej všechno v klidu',
        background: '#E1E9D9',
        color: '#213A26',
        subtitleColor: '#34553A',
    },
}

// `exclude` — klíč vlastní stránky ('top'/'hudba'/'zbytek'), ať nabízí
// jen ty zbylé dvě. Umístění na stránce: ve zdroji sedí hned pod
// výsledkovou mřížkou (zdroj nemá skutečné stránkování, jen sc-if na
// pevných 10 položkách) — u nás je až pod Pagination, ať sekce "zkus
// jinam" nepřerušuje procházení stránek uprostřed výsledků.
export default function OtherCategories({ exclude }) {
    const cards = Object.entries(CARDS).filter(([key]) => key !== exclude).map(([, card]) => card)

    return (
        <section className="other-cats" aria-labelledby="dalsi-h">
            <h2 id="dalsi-h" className="other-cats-title">Nic tě nezaujalo? Zkus jinou cestu</h2>
            <div className="other-cats-grid">
                {cards.map(card => (
                    <Link
                        key={card.to}
                        to={card.to}
                        className="other-cats-card"
                        style={{ background: card.background, color: card.color }}
                    >
                        <span className="other-cats-text">
                            <span className="other-cats-card-title">{card.title}</span>
                            <span className="other-cats-card-subtitle" style={{ color: card.subtitleColor }}>{card.subtitle}</span>
                        </span>
                        <GoArrow />
                    </Link>
                ))}
            </div>
        </section>
    )
}
