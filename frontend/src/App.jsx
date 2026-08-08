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
import NotFound from './pages/NotFound/NotFound.jsx'

function Layout() {
    const { pathname } = useLocation()
    const isAdmin = pathname.startsWith('/admin')

    return (
        <>
            {!isAdmin && <Header />}
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/create" element={<AdminCreate />} />
                    <Route path="/admin/edit/:id" element={<AdminEdit />} />
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
            <Layout />
        </BrowserRouter>
    )
}

export default App