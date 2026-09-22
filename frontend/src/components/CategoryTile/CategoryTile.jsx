import { Link } from 'react-router-dom'
import { eventCountLabel } from '../../lib/pluralize.js'
import './CategoryTile.css'

// cat: jedna položka z lib/categories.jsx ({ name, slug, icon })
export default function CategoryTile({ cat, count }) {
    return (
        <Link to={`/events?kategorie=${cat.name}`} className={`category-tile category-tile--${cat.slug}`}>
            <span className="category-tile-icon">{cat.icon(28)}</span>
            <span className="category-tile-name">{cat.name}</span>
            <span className="category-tile-count">{eventCountLabel(count)}</span>
        </Link>
    )
}
