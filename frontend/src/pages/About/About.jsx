import { Link } from 'react-router-dom'
import './About.css'
import { useDocumentTitle } from '../../lib/useDocumentTitle.js'
import { TITLES } from '../../lib/pageTitle.js'

// Stránka O projektu (SEO fáze 5, 2026-10-19): kdo web provozuje, odkud jsou
// akce a jak se aktualizují. Vyhledávače i AI váží, jestli je zdroj
// dohledatelný a důvěryhodný, a tahle stránka jim to říká.
//
// Rozvržení je stejné jako u právních stránek (kopie Privacy.css s id about).
//
// Odstavce má stejně i serverový renderer (ABOUT_PARAGRAPHS v
// backend/src/lib/seo/site.js), aby text viděly i AI crawlery, které
// nespouští JavaScript. Test v backendu hlídá, že se texty shodují; při změně
// upravit obě místa.
const CONTACT = 'kontakt@plzenak.eu'

const PARAGRAPHS = [
    'Plzeňák je přehled kulturních a společenských akcí v Plzni na jednom místě: koncerty, divadlo, výstavy, přednášky, sport i program pro děti.',
    'Část akcí přidáváme ručně, část přebíráme z veřejného kalendáře města Plzně (akce.plzen.eu). Každou akci před zveřejněním zkontroluje a schválí člověk. Popisky převzatých akcí píšeme vlastními slovy s pomocí umělé inteligence, a to jen z faktů, které uvádí zdroj.',
    'Nové akce přibývají průběžně a proběhlé z výpisů samy mizí. U akcí je odkaz na web pořadatele, kde najdete aktuální podrobnosti a vstupenky.',
    'Plzeňák je nekomerční učební projekt Ondřeje Štindla. Není propojený s městem Plzní ani s pořadateli akcí a nemá z nich žádný zisk.',
    'Chybu v akci nebo tip na akci, která chybí, pošlete na kontakt@plzenak.eu.',
]

// E-mail v textu jako odkaz, zbytek odstavce beze změny.
function withContactLink(text) {
    const at = text.indexOf(CONTACT)
    if (at === -1) return text
    return (
        <>
            {text.slice(0, at)}
            <a className="legal-link" href={`mailto:${CONTACT}`}>{CONTACT}</a>
            {text.slice(at + CONTACT.length)}
        </>
    )
}

export default function About() {
    useDocumentTitle(TITLES.about)
    return (
        <div id="about-page">
            <div id="about-header-wrap">
                <div id="about-header">
                    <nav id="about-breadcrumb" aria-label="Drobečková navigace">
                        <Link to="/">Domů</Link>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                        <span aria-current="page">O projektu</span>
                    </nav>

                    <p id="about-eyebrow">Projekt</p>
                    <h1 id="about-title">O projektu Plzeňák</h1>
                    <p id="about-lede">
                        Kdo Plzeňák provozuje, odkud jsou akce a jak často se aktualizují.
                    </p>
                </div>
            </div>

            <div id="about-body">
                <div id="about-main">
                    <section className="legal-section">
                        {PARAGRAPHS.map(text => <p key={text}>{withContactLink(text)}</p>)}
                    </section>
                </div>
            </div>
        </div>
    )
}
