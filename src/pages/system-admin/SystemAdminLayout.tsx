import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUniversity,
  faSignOutAlt,
  faBars,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../services/auth.service";
import "../../styles/dashboard.css";
import "../../styles/system-admin.css";

export default function SystemAdminLayout(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const adminName = authService.getUser()?.name || "System Administrator";

  return (
    <div
      className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}
    >
      <aside className="dashboard-sidebar system-admin-sidebar">
        {/* Header containing ONLY the Hamburger Button */}
        <div
          className="sidebar-header"
          style={{
            justifyContent: "flex-start",
            borderBottom: "none",
            paddingLeft: "4px",
          }}
        >
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="toggle-btn"
            style={{ position: "static", fontSize: "1.2rem" }} // Override absolute positioning
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav" style={{ marginTop: "1rem" }}>
          <NavLink to="/system-admin/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink to="/system-admin/institutions" className="nav-item">
            <FontAwesomeIcon icon={faUniversity} className="nav-icon" />
            <span className="nav-text">Institutions</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <NavLink to="/logout" className="nav-item">
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
            <span className="nav-text">Logout</span>
          </NavLink>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
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
