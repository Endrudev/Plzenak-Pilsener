import './CategoryHero.css'

// Textový obsah hero pásu na třech dedikovaných kategorijních stránkách
// (TOP akce, Hudba, Zbytek programu) — breadcrumb, "eyebrow" odznak,
// obří nadpis, popisek, volitelný řádek se statistikou. Doslova podle
// handoffu (stejná struktura na všech třech stránkách, jen jiná čísla/
// texty/barvy pozadí).
//
// Vizuální scénu (noční panorama, dav, večerní výjevy...) NEDRŽÍ tahle
// komponenta — každá stránka má svou vlastní (bento dlaždice měly
// stejné scény dřív, teď jsou to sdílené komponenty — TopNightScene.jsx,
// MusicScene.jsx, RestScene.jsx), předává se přes `scene` prop, ať
// CategoryHero zůstává jen "rám" na text, ne na vizuál konkrétní
// kategorie.
export default function CategoryHero({
    background,
    scene,
    breadcrumbLabel,
    eyebrow,
    title,
    lead,
    stats,
    titleSize = '104px',
}) {
    return (
        <section className="cat-hero" style={{ background }}>
            {scene}

            <div className="cat-hero-fade" />

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
