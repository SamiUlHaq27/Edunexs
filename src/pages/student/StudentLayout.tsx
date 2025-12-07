import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBookReader, faUserGraduate, faSignOutAlt, faBars } from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/dashboard.css";
import "../../styles/student.css";

export default function StudentLayout(): React.JSX.Element {
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
      <aside className="dashboard-sidebar" style={{ background: 'linear-gradient(159deg, #1e293b 0%, #0f172a 100%)' }}>
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
          <h1 className="dashboard-sidebar-title">Student Portal</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/student/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faHome} className="nav-icon" />
            <span className="nav-text">Overview</span>
          </NavLink>
          <NavLink to="/student/courses" className="nav-item">
            <FontAwesomeIcon icon={faBookReader} className="nav-icon" />
            <span className="nav-text">My Courses</span>
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
             <p>Welcome back, Student!</p>
          </div>
          <div className="header-profile">
            <div className="user-info">
               <span className="user-name">Ahmad Raza</span>
               <span className="user-role">Class 10-A</span>
            </div>
            <FontAwesomeIcon icon={faUserGraduate} className="user-avatar" />
          </div>
        </header>
        <div className="dashboard-content">
           <Outlet />
        </div>
      </main>
    </div>
  );
}