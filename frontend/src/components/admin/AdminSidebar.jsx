import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../services/api'

const AdminSidebar = ({ isOpen = false, onNavigate }) => {
  const base = 'admin-sidebar-item'

  const handleClick = () => {
    if (onNavigate) onNavigate()
  }

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <button 
        className="admin-sidebar-close" 
        onClick={handleClick} 
        aria-label="Close sidebar"
      >
        ×
      </button>
      <nav className="admin-sidebar-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `${base} ${isActive ? 'active' : ''}`}
          onClick={handleClick}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/listings"
          className={({ isActive }) => `${base} ${isActive ? 'active' : ''}`}
          onClick={handleClick}
        >
          Listings
        </NavLink>
        <NavLink
           to="/admin/contacts"
           className={({ isActive }) => `${base} ${isActive ? 'active' : ''}`}
           onClick={handleClick}
         >
           Contact Submissions
         </NavLink>
         <NavLink
           to="/admin/events"
           className={({ isActive }) => `${base} ${isActive ? 'active' : ''}`}
           onClick={handleClick}
         >
           Events
         </NavLink>
         <NavLink
           to="/admin/blogs"
           className={({ isActive }) => `${base} ${isActive ? 'active' : ''}`}
           onClick={handleClick}
         >
           Market Insights
         </NavLink>
      </nav>
    </aside>
  )
}

export default AdminSidebar
