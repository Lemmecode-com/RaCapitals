import { useState } from 'react'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const closeSidebar = () => setIsSidebarOpen(false)
  const toggleSidebar = () => setIsSidebarOpen((v) => !v)

  return (
    <div className="admin-layout">
      <AdminHeader
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="admin-layout-body">
        <AdminSidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} />
        {isSidebarOpen && (
          <div
            className="admin-sidebar-overlay"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
        <main className="admin-layout-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout