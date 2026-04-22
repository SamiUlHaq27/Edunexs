import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome, faBookOpen, faMoneyBillWave, faSignOutAlt, faBars, faUserTie
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/dashboard.css";
import "../../styles/parent.css";

export default function ParentLayout(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const [instProfile, setInstProfile] = useState({ name: "My Institution", logo: ASSETS.logo });

  useEffect(() => {
    const saved = localStorage.getItem("institution_profile");
    if (saved) {
      setInstProfile(JSON.parse(saved));
    }
  }, []);

  return (
    <div className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}>
      {/* Sidebar - Student portal jaisa color aur padding */}
      <aside className="dashboard-sidebar" style={{ paddingTop: '1rem' }}>
        <div className="sidebar-header">
           <img 
            src={instProfile.logo} 
            alt="Logo" 
            className="sidebar-logo"
            style={{ borderRadius: '50%', objectFit: 'cover', background: '#fff' }} 
          />
        </div>
        <div className="sidebar-title-div">
          <button onClick={() => setIsMinimized(!isMinimized)} className="toggle-btn">
             <FontAwesomeIcon icon={faBars} />
          </button>
          <h1 className="dashboard-sidebar-title">Parent Portal</h1>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/parent/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faHome} className="nav-icon" />
            <span className="nav-text">Home</span>
          </NavLink>
          <NavLink to="/parent/courses" className="nav-item">
            <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
            <span className="nav-text">Courses & Grades</span>
          </NavLink>
          <NavLink to="/parent/fees" className="nav-item">
            <FontAwesomeIcon icon={faMoneyBillWave} className="nav-icon" />
            <span className="nav-text">Fees</span>
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
             <h2>{instProfile.name}</h2>
             <p>Parent Dashboard</p>
          </div>
          <div className="header-profile">
            <div className="user-info">
               <span className="user-name">Mr. Rizwan</span>
               <span className="user-role">Parent</span>
            </div>
            <FontAwesomeIcon icon={faUserTie} className="user-avatar" />
          </div>
        </header>
        <div className="dashboard-content">
           <Outlet />
        </div>
      </main>
    </div>
  );
}