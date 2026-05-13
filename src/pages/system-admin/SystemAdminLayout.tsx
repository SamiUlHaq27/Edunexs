import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUniversity,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../services/auth.service";
import "../../styles/dashboard.css";
import "../../styles/system-admin.css";

export default function SystemAdminLayout(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const adminName = authService.getUser()?.name || "System Administrator";
  const toggleSidebar = () => setIsMinimized((current) => !current);

  // Close sidebar on mobile when navigation occurs
  const handleNavClick = () => {
    // Only close sidebar on mobile (< 768px)
    if (window.matchMedia("(max-width: 767.98px)").matches) {
      setIsMinimized(true);
    }
  };

  return (
    <div
      className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}
    >
      {/* Sidebar overlay for mobile */}
      <div
        className="sidebar-overlay"
        onClick={() => setIsMinimized(true)}
        aria-hidden="true"
      />
      <aside className="dashboard-sidebar system-admin-sidebar">
        {/* Header containing ONLY the Hamburger Button */}
        <div className="sidebar-header">
          <button
            onClick={toggleSidebar}
            className="toggle-btn"
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon
              icon={isMinimized ? faChevronRight : faChevronLeft}
            />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <NavLink
            to="/system-admin/dashboard"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink
            to="/system-admin/institutions"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faUniversity} className="nav-icon" />
            <span className="nav-text">Institutions</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <NavLink to="/logout" className="nav-item" onClick={handleNavClick}>
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
            <span className="nav-text">Logout</span>
          </NavLink>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="dashboard-mobile-toggle"
            aria-label="Toggle sidebar"
            aria-expanded={isMinimized}
          >
            <FontAwesomeIcon
              icon={isMinimized ? faChevronRight : faChevronLeft}
            />
          </button>
          <div className="header-greeting">
            <h2>System Overview</h2>
            <p>Monitor platform performance and institutions.</p>
          </div>
          <div className="header-profile">
            <div className="user-info">
              <span className="user-name">{adminName}</span>
              <span className="user-role">Super User</span>
            </div>
            <FontAwesomeIcon icon={faUserShield} className="user-avatar" />
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
