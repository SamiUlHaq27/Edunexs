import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt, // Added this icon
  faUniversity,
  faUserShield,
  faChalkboardTeacher,
  faUserGraduate,
  faBookOpen,
  faChalkboard,
  faSignOutAlt,
  faBars,
  faUserCircle
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/dashboard.css";
import "../../styles/owner.css";

export default function OwnerLayout(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={ASSETS.logo} alt={ASSETS.alt} className="sidebar-logo" />
        </div>
        
        <div className="sidebar-title-div">
          <button onClick={() => setIsMinimized(!isMinimized)} className="toggle-btn">
            <FontAwesomeIcon icon={faBars} />
          </button>
          <h1 className="dashboard-sidebar-title">Owner Portal</h1>
        </div>

        <nav className="sidebar-nav">
          {/* New Dashboard Link */}
          <NavLink to="/owner/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink to="/owner/institution" className="nav-item">
            <FontAwesomeIcon icon={faUniversity} className="nav-icon" />
            <span className="nav-text">Institution</span>
          </NavLink>
          
          <div style={{ margin: '1rem 0 0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            <span className="nav-text">People</span>
          </div>
          
          <NavLink to="/owner/admins" className="nav-item">
            <FontAwesomeIcon icon={faUserShield} className="nav-icon" />
            <span className="nav-text">Inst. Admins</span>
          </NavLink>
          <NavLink to="/owner/teachers" className="nav-item">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="nav-icon" />
            <span className="nav-text">Teachers</span>
          </NavLink>
          <NavLink to="/owner/students" className="nav-item">
            <FontAwesomeIcon icon={faUserGraduate} className="nav-icon" />
            <span className="nav-text">Students</span>
          </NavLink>

          <div style={{ margin: '1rem 0 0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
             <span className="nav-text">Academics</span>
          </div>

          <NavLink to="/owner/courses" className="nav-item">
            <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
            <span className="nav-text">Courses</span>
          </NavLink>
          <NavLink to="/owner/classes" className="nav-item">
            <FontAwesomeIcon icon={faChalkboard} className="nav-icon" />
            <span className="nav-text">Classes</span>
          </NavLink>
        </nav>

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
            <h2>Institution Management</h2>
            <p>Overview</p>
          </div>
          <div className="header-profile">
            <div className="user-info">
              <span className="user-name">Owner Account</span>
              <span className="user-role">Super Admin</span>
            </div>
            <FontAwesomeIcon icon={faUserCircle} className="user-avatar" />
          </div>
        </header>
        
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}