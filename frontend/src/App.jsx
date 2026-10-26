import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import CompanyDetail from './pages/CompanyDetail'
import Contact from './pages/Contact'
import About from './pages/About'
import AdminLogin from './pages/admin/AdminLogin'
import AdminOverview from './pages/admin/AdminOverview'
import AdminListings from './pages/admin/AdminListings'
import AdminCompanyDetail from './pages/admin/AdminCompanyDetail'
import AdminEvents from './pages/admin/AdminEvents'
import AdminContacts from './pages/admin/AdminContacts'
import AdminBlogs from './pages/admin/AdminBlogs'
import AdminBlogEditor from './pages/admin/AdminBlogEditor'
import AdminBlogDetail from './pages/admin/AdminBlogDetail'
import Disclaimer from './pages/legal/Disclaimer'
import Terms from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import DrhpFiled from './pages/DrhpFiled'
import Events from './pages/Events'
import Insights from './pages/Insights'
import InsightDetail from './pages/InsightDetail'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const adminContent = document.querySelector('.admin-layout-content')
    if (adminContent) {
      adminContent.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/company/:id" element={<CompanyDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/drhp-filed" element={<DrhpFiled />} />
        <Route path="/events" element={<Events />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/:slug" element={<InsightDetail />} />
        <Route path="/blog" element={<Navigate to="/insights" replace />} />
        <Route path="/blog/:slug" element={<InsightDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminOverview />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/listings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminListings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCompanyDetail />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contacts"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminContacts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminEvents />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminBlogs />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminBlogEditor />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs/edit/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminBlogEditor />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs/:id"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminBlogDetail />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
