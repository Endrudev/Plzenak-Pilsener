import { useEffect, useState } from 'react'
import HeroBento from '../../components/HeroBento/HeroBento.jsx'
import LandingToday from '../../components/landing/LandingToday/LandingToday.jsx'
import LandingSearch from '../../components/landing/LandingSearch/LandingSearch.jsx'
import LandingFeature from '../../components/landing/LandingFeature/LandingFeature.jsx'
import LandingCategories from '../../components/landing/LandingCategories/LandingCategories.jsx'
import LandingLedger from '../../components/landing/LandingLedger/LandingLedger.jsx'
import LandingManifesto from '../../components/landing/LandingManifesto/LandingManifesto.jsx'
import LandingCta from '../../components/landing/LandingCta/LandingCta.jsx'
import { getEvents, getEventLocations } from '../../lib/eventsApi.js'
import { initMode } from '../../lib/landingTheme.js'
import '../../components/landing/landing.css'
import './Home.css'

// Homepage, postavená od nuly 2026-10-04. Zachované jsou jen hero dlaždice
// (HeroBento), značka, font Bricolage a brandová oranžová. Všechno ostatní je
// nové a drží se jednoho tmavého tématu (tokeny --lp-* v index.css).
//
// Pořadí sekcí má logiku návštěvníka:
//   hero dlaždice   : kam to celé směřuje (kategorie jako tři cesty)
//   Kam dnes večer? : okamžitá odpověď bez hledání
//   Hledání         : když ví, co chce
//   TOP akce        : co stojí za to
//   Kategorie       : podle nálady
//   Nejbližší akce  : kalendář s velkým datem
//   Manifest + CTA  : uzavření a jeden jasný krok
//
// Data se načítají jednou tady a předávají sekcím. Hero dlaždice na datech
// nezávisí, takže se vykreslí hned a zbytek stránky nabíhá, až data přijdou
// (sekce mezitím ukazují kostru).
export default function Home() {
    const [events, setEvents] = useState([])
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)

    // Téma homepage je celostránkové: třída na <html> přepíše pozadí i za
    // plovoucí hlavičkou a atribut data-lp-mode vybere tmavé nebo světlé
    // hodnoty (viz lib/landingTheme.js). Při odchodu z homepage se třída vrací
    // (cleanup), ostatní stránky zůstávají ve svém světlém vzhledu.
    useEffect(() => {
        document.documentElement.classList.add('theme-lp')
        initMode()
        return () => document.documentElement.classList.remove('theme-lp')
    }, [])

    useEffect(() => {
        getEvents()
            .then(data => setEvents(data.items))
            .catch(console.error)
            .finally(() => setLoading(false))
        getEventLocations().then(setLocations).catch(console.error)
    }, [])

    return (
        <div id="home" className="lp">
            {/* Jediné h1 stránky. Hero dlaždice mají h2, sekce níž taky, takže bez
                tohohle by homepage neměla žádný hlavní nadpis (čtečka, SEO). */}
            <h1 className="visually-hidden">Plzeňák: všechno, co se děje v Plzni, na jednom místě</h1>

            <section id="hero" aria-label="Rozcestník kategorií">
                <HeroBento />
            </section>

            <LandingToday events={events} loading={loading} />
            <LandingSearch locations={locations} />
            <LandingFeature events={events} />
            <LandingCategories events={events} />
            <LandingLedger events={events} loading={loading} />
            <LandingManifesto />
            <LandingCta />
        </div>
    )
}
