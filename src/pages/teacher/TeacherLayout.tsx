import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser, faClipboardUser, faBookOpen, 
  faFileSignature, faStar, faSignOutAlt, faBars, faUserCircle
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/dashboard.css";
import "../../styles/teacher.css";

export default function TeacherLayout(): React.JSX.Element {
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
      <aside className="dashboard-sidebar">
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
          <h1 className="dashboard-sidebar-title">Teacher Portal</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/teacher/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faChalkboardUser} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>
          <NavLink to="/teacher/attendance" className="nav-item">
            <FontAwesomeIcon icon={faClipboardUser} className="nav-icon" />
            <span className="nav-text">Attendance</span>
          </NavLink>
          <NavLink to="/teacher/assignments" className="nav-item">
            <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
            <span className="nav-text">Assignments</span>
          </NavLink>
          <NavLink to="/teacher/quizzes" className="nav-item">
            <FontAwesomeIcon icon={faFileSignature} className="nav-icon" />
            <span className="nav-text">Quizzes</span>
          </NavLink>
          <NavLink to="/teacher/grades" className="nav-item">
            <FontAwesomeIcon icon={faStar} className="nav-icon" />
            <span className="nav-text">Gradebook</span>
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
            <p>Teacher Panel</p>
          </div>
          <div className="header-profile">
             <div className="user-info">
               <span className="user-name">Mr. Teacher</span>
               <span className="user-role">Mathematics</span>
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