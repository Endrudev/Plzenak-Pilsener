import './CategoryHero.css'

// Textový obsah hero pásu na třech dedikovaných kategorijních stránkách
// (TOP akce, Hudba, Zbytek programu) — breadcrumb, "eyebrow" odznak,
// obří nadpis, popisek, volitelný řádek se statistikou. Doslova podle
// handoffu (stejná struktura na všech třech stránkách, jen jiná čísla/
// texty/barvy pozadí).
//
// Vizuální scénu (noční Plzeň, koncert, trh a park) NEDRŽÍ tahle komponenta,
// předává se přes `scene` prop, ať CategoryHero zůstává jen "rám" na text.
// Scény z balíčku vyplní rodiče (width/height 100 %) a kreslí se v běžném
// toku, proto jdou do vlastní absolutní vrstvy .cat-hero-scene — jinak by
// text spadl pod ně. Spodek scény (ulice, dav, zem) nesmí nic zakrývat, takže
// tady není žádný přechodový pruh.
//
// liftScene: karta s filtry překrývá spodních 48px hero. Když je na dně scény
// něco důležitého (tramvaj v CityScene), zvedne se scéna nad kartu a pruh pod
// ní vyplní `background`, který má mít barvu země ve scéně.
export default function CategoryHero({
    background,
    theme = 'dark',
    liftScene = false,
    scene,
    breadcrumbLabel,
    eyebrow,
    title,
    lead,
    stats,
    titleSize = '104px',
}) {
    return (
        <section className={`cat-hero${theme === 'light' ? ' cat-hero--light' : ''}${liftScene ? ' cat-hero--lift-scene' : ''}`} style={{ background }}>
            <div className="cat-hero-scene">{scene}</div>

            <div className="cat-hero-text">
                <nav className="cat-hero-crumbs" aria-label="Drobečková navigace">
                    <a href="/">Plzeňák</a> / <a href="/events">Akce</a> / <span>{breadcrumbLabel}</span>
                </nav>
                <span className="cat-hero-eyebrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.7 5.7 6.2.8-4.6 4.3 1.2 6.2L12 16.8l-5.5 3 1.2-6.2L3.1 9.3l6.2-.8z" /></svg>
                    {eyebrow}
                </span>
                <h1 className="cat-hero-title" style={{ fontSize: titleSize }}>{title}</h1>
                <p className="cat-hero-lead">{lead}</p>
                {stats && (
                    <div className="cat-hero-stats">
                        {stats.map((s, i) => (
                            <span key={i}>
                                {s.value && <strong>{s.value}</strong>} {s.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
