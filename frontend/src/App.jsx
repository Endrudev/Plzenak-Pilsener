import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './pages/Home/Home.jsx'
import Events from './pages/Events/Events.jsx'
import TopAkce from './pages/TopAkce/TopAkce.jsx'
import Hudba from './pages/Hudba/Hudba.jsx'
import ZbytekProgramu from './pages/ZbytekProgramu/ZbytekProgramu.jsx'
import Dnes from './pages/Dnes/Dnes.jsx'
import TentoVikend from './pages/TentoVikend/TentoVikend.jsx'
import About from './pages/About/About.jsx'
import EventDetail from './pages/EventDetail/EventDetail.jsx'
import Admin from './pages/Admin/Admin.jsx'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard.jsx'
import AdminCreate from './pages/AdminCreate/AdminCreate.jsx'
import AdminEdit from './pages/AdminEdit/AdminEdit.jsx'
import AdminCandidates from './pages/AdminCandidates/AdminCandidates.jsx'
import Privacy from './pages/Privacy/Privacy.jsx'
import Terms from './pages/Terms/Terms.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import { ConsentProvider, useConsent } from './lib/consent/ConsentContext.jsx'
import CookieBanner from './components/CookieBanner/CookieBanner.jsx'
import CookieSettings from './components/CookieSettings/CookieSettings.jsx'
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx'
import { useDocumentTitle } from './lib/useDocumentTitle.js'
import { TITLES } from './lib/pageTitle.js'


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