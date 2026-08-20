import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import Home from './pages/Home/Home.jsx'
import Events from './pages/Events/Events.jsx'
import EventDetail from './pages/EventDetail/EventDetail.jsx'
import Admin from './pages/Admin/Admin.jsx'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard.jsx'
import AdminCreate from './pages/AdminCreate/AdminCreate.jsx'
import AdminEdit from './pages/AdminEdit/AdminEdit.jsx'
import Privacy from './pages/Privacy/Privacy.jsx'
import Terms from './pages/Terms/Terms.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import { ConsentProvider, useConsent } from './lib/ConsentContext.jsx'
import CookieBanner from './components/CookieBanner/CookieBanner.jsx'
import CookieSettings from './components/CookieSettings/CookieSettings.jsx'


function Layout() {
    const { pathname } = useLocation()
    const isAdmin = pathname.startsWith('/admin')
    const { consent, acceptAll, rejectAll, save, openSettings, closeSettings, isSettingsOpen } = useConsent()

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
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/create" element={<AdminCreate />} />
                    <Route path="/admin/edit/:id" element={<AdminEdit />} />
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
            <ConsentProvider>
                <Layout/>
            </ConsentProvider>
        </BrowserRouter>
    )
}

export default App