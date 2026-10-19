import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './pages/Home/Home.jsx'
import { ConsentProvider, useConsent } from './lib/consent/ConsentContext.jsx'
import CookieBanner from './components/CookieBanner/CookieBanner.jsx'
import CookieSettings from './components/CookieSettings/CookieSettings.jsx'
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx'
import { useDocumentTitle } from './lib/useDocumentTitle.js'
import { TITLES } from './lib/pageTitle.js'

// Stránky kromě homepage se načítají až při návštěvě (React.lazy, od 2026-10-20). Dřív byla
// celá aplikace včetně administrace v jednom balíku a telefon musel před vykreslením
// homepage zpracovat všechen kód (PageSpeed: „Element render delay“ 2,3 s u LCP). Homepage
// zůstává v hlavním balíku, je to nejčastější vstup a nesmí čekat na další požadavek.
// Vite ke každé stránce vyrobí vlastní soubor JS (a CSS), PAGE_LOADERS je po načtení
// stáhne na pozadí, aby přechod na jinou stránku nečekal na síť.
const PAGE_LOADERS = {
    Events: () => import('./pages/Events/Events.jsx'),
    TopAkce: () => import('./pages/TopAkce/TopAkce.jsx'),
    Hudba: () => import('./pages/Hudba/Hudba.jsx'),
    ZbytekProgramu: () => import('./pages/ZbytekProgramu/ZbytekProgramu.jsx'),
    Dnes: () => import('./pages/Dnes/Dnes.jsx'),
    TentoVikend: () => import('./pages/TentoVikend/TentoVikend.jsx'),
    About: () => import('./pages/About/About.jsx'),
    EventDetail: () => import('./pages/EventDetail/EventDetail.jsx'),
    Admin: () => import('./pages/Admin/Admin.jsx'),
    AdminDashboard: () => import('./pages/AdminDashboard/AdminDashboard.jsx'),
    AdminCreate: () => import('./pages/AdminCreate/AdminCreate.jsx'),
    AdminEdit: () => import('./pages/AdminEdit/AdminEdit.jsx'),
    AdminCandidates: () => import('./pages/AdminCandidates/AdminCandidates.jsx'),
    Privacy: () => import('./pages/Privacy/Privacy.jsx'),
    Terms: () => import('./pages/Terms/Terms.jsx'),
    NotFound: () => import('./pages/NotFound/NotFound.jsx'),
}
const Events = lazy(PAGE_LOADERS.Events)
const TopAkce = lazy(PAGE_LOADERS.TopAkce)
const Hudba = lazy(PAGE_LOADERS.Hudba)
const ZbytekProgramu = lazy(PAGE_LOADERS.ZbytekProgramu)
const Dnes = lazy(PAGE_LOADERS.Dnes)
const TentoVikend = lazy(PAGE_LOADERS.TentoVikend)
const About = lazy(PAGE_LOADERS.About)
const EventDetail = lazy(PAGE_LOADERS.EventDetail)
const Admin = lazy(PAGE_LOADERS.Admin)
const AdminDashboard = lazy(PAGE_LOADERS.AdminDashboard)
const AdminCreate = lazy(PAGE_LOADERS.AdminCreate)
const AdminEdit = lazy(PAGE_LOADERS.AdminEdit)
const AdminCandidates = lazy(PAGE_LOADERS.AdminCandidates)
const Privacy = lazy(PAGE_LOADERS.Privacy)
const Terms = lazy(PAGE_LOADERS.Terms)
const NotFound = lazy(PAGE_LOADERS.NotFound)

// Po načtení a v klidu stáhnout ostatní stránky dopředu. lazy() pak použije už stažený
// modul (import() stejného souboru se stáhne jen jednou).
function usePrefetchPages() {
    useEffect(() => {
        // Administraci ne: běžný návštěvník ji nikdy neotevře, stahoval by ji zbytečně.
        const run = () => Object.entries(PAGE_LOADERS)
            .filter(([name]) => !name.startsWith('Admin'))
            .forEach(([, load]) => load().catch(() => {}))
        const id = 'requestIdleCallback' in window
            ? window.requestIdleCallback(run, { timeout: 5000 })
            : window.setTimeout(run, 3000)
        return () => {
            if ('cancelIdleCallback' in window) window.cancelIdleCallback(id)
            else window.clearTimeout(id)
        }
    }, [])
}


// Staré adresy z doby před 2026-10-19 (/events, /events/42) přesměrují na
// /akce a nechají parametry filtrů. `replace`, aby tlačítko Zpět nevedlo
// zpátky na přesměrování. Pro roboty jde o přesměrování jen v prohlížeči,
// skutečné 301 doplní serverový renderer (SEO fáze 3).
function LegacyEventsRedirect() {
    const { search } = useLocation()
    return <Navigate to={`/akce${search}`} replace />
}

// /events/42 → /akce/42; správný slug doplní EventDetail.
function LegacyEventRedirect() {
    const { id } = useParams()
    return <Navigate to={`/akce/${id}`} replace />
}


function Layout() {
    const { pathname } = useLocation()
    const isAdmin = pathname.startsWith('/admin')
    const { consent, acceptAll, rejectAll, save, openSettings, closeSettings, isSettingsOpen } = useConsent()
    // Všechny stránky administrace mají jeden titulek. Veřejné stránky si ho
    // nastavují samy (null tady titulek nemění).
    useDocumentTitle(isAdmin ? TITLES.admin : null)
    usePrefetchPages()

    return (
        <>
            {!isAdmin && <Header />}
            {!isAdmin && consent === null && (
                <CookieBanner
                    onAccept={acceptAll}
                    onReject={rejectAll}
                    onOpenSettings={openSettings}
                />
            )}
            {!isAdmin && isSettingsOpen && (
                <CookieSettings
                    initialMaps={consent?.maps ?? false}
                    onSave={save}
                    onRejectAll={rejectAll}
                    onClose={closeSettings}
                />
            )}
            <main>
                {/* Než se stáhne kód stránky (jen při přímém příchodu na jinou stránku než
                    homepage), drží místo prázdný blok na výšku okna. Bez něj by patička na
                    chvíli vyskočila nahoru a pak se posunula dolů (CLS). */}
                <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/akce" element={<Events />} />
                    <Route path="/top-akce" element={<TopAkce />} />
                    <Route path="/hudba" element={<Hudba />} />
                    <Route path="/zbytek-programu" element={<ZbytekProgramu />} />
                    <Route path="/dnes" element={<Dnes />} />
                    <Route path="/tento-vikend" element={<TentoVikend />} />
                    <Route path="/o-projektu" element={<About />} />
                    <Route path="/akce/:idSlug" element={<EventDetail />} />
                    <Route path="/events" element={<LegacyEventsRedirect />} />
                    <Route path="/events/:id" element={<LegacyEventRedirect />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/create" element={<AdminCreate />} />
                    <Route path="/admin/edit/:id" element={<AdminEdit />} />
                    <Route path="/admin/candidates" element={<AdminCandidates />} />
                    <Route path="/zasady-ochrany-osobnich-udaju" element={<Privacy />} />
                    <Route path="/podminky-uziti" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
            </main>
            {!isAdmin && <Footer />}
        </>
    )
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <ConsentProvider>
                <Layout/>
            </ConsentProvider>
        </BrowserRouter>
    )
}

export default App