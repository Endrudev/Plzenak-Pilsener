import { Link } from 'react-router-dom'
import { ArrowUpRight } from '../landing/icons.jsx'
import './OtherCategories.css'

// Odkazy na zbylé dvě kategorie na konci každé kategorijní stránky. Každá stránka
// ukáže ty druhé dvě, ne svou (`exclude` je její klíč). Odkazy vedou na
// dedikované routy, ne na /events?….
const CARDS = {
    top: { to: '/top-akce', title: 'TOP akce', subtitle: 'To nejlepší, co se v Plzni chystá' },
    hudba: { to: '/hudba', title: 'Hudba', subtitle: 'Koncerty, kluby a festivaly' },
    zbytek: { to: '/zbytek-programu', title: 'Zbytek programu', subtitle: 'Procházej všechno v klidu' },
}

export default function OtherCategories({ exclude }) {
    const cards = Object.entries(CARDS).filter(([key]) => key !== exclude).map(([, card]) => card)

    return (
        <section className="lp-wrap oc" aria-labelledby="oc-h">
            <h2 id="oc-h" className="lp-h2">Nic tě nezaujalo?</h2>
            <div className="oc-grid">
                {cards.map(card => (
                    <Link key={card.to} to={card.to} className="oc-card">
                        <span className="oc-text">
                            <span className="oc-title">{card.title}</span>
                            <span className="oc-sub">{card.subtitle}</span>
                        </span>
                        <span className="oc-go" aria-hidden="true"><ArrowUpRight size={22} /></span>
                    </Link>
                ))}
            </div>
        </section>
    )
}
