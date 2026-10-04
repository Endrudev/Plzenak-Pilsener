import { Link } from 'react-router-dom'
import './CategoryHero.css'

// Hero pás stránek TOP akce, Hudba a Zbytek programu. Zachovaná je jedna věc:
// animovaná papírová scéna (CityScene, ConcertScene, ProgramScene), která se
// předává přes `scene` a leží v celé ploše pásu. Text nad ní je nový, bez
// štítku nad nadpisem a bez řádku se statistikou (počet akcí je u výsledků).
//
// `theme="light"` je denní scéna (Zbytek programu), text je tmavý. Ostatní jsou
// noční, text je krémový (--dk-*), ve světlém i tmavém tématu stránky stejně.
//
// `liftScene`: karta s ovládáním zajíždí do spodních 48 px pásu. Když je na dně
// scény něco důležitého (tramvaj v CityScene), zvedne se scéna nad kartu a pruh
// pod ní vyplní `background`, který má mít barvu země ve scéně.
export default function CategoryHero({
    background,
    theme = 'dark',
    liftScene = false,
    scene,
    breadcrumbLabel,
    title,
    lead,
}) {
    const cls = `cat-hero${theme === 'light' ? ' cat-hero--light' : ''}${liftScene ? ' cat-hero--lift-scene' : ''}`

    return (
        <header className={cls} style={{ background }}>
            <div className="cat-hero-scene">{scene}</div>

            <div className="lp-wrap cat-hero-in">
                <nav className="cat-hero-crumbs enter" style={{ '--i': 0 }} aria-label="Drobečková navigace">
                    <Link to="/">Plzeňák</Link> / <Link to="/events">Akce</Link> / <span>{breadcrumbLabel}</span>
                </nav>
                <h1 className="cat-hero-title enter" style={{ '--i': 1 }}>{title}</h1>
                <p className="cat-hero-lead enter" style={{ '--i': 2 }}>{lead}</p>
            </div>
        </header>
    )
}
