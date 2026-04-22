import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser, faBookOpen, faSignOutAlt, faBars, faUserCircle, faChevronDown, faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/dashboard.css";
import "../../styles/teacher.css";

export default function TeacherLayout() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCourses, setShowCourses] = useState(false);

  const teacherCourses = [
    { id: "cs101", name: "Computer Science" },
    { id: "math202", name: "Mathematics" },
    { id: "eng301", name: "English" },
  ];

  return (
    <div className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={ASSETS.logo} alt="Logo" className="sidebar-logo" style={{ background: '#fff', borderRadius: '50%' }} />
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

          <div className="nav-item" onClick={() => setShowCourses(!showCourses)} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
            <span className="nav-text" style={{ flex: 1 }}>My Courses</span>
            {!isMinimized && <FontAwesomeIcon icon={showCourses ? faChevronUp : faChevronDown} style={{ fontSize: '0.8rem', opacity: 0.7 }} />}
          </div>

          {/* Submenu: Background box removed, Dot added before names */}
          {showCourses && !isMinimized && (
            <div className="sidebar-submenu" style={{ 
              paddingLeft: '2.8rem', 
              marginTop: '5px'
            }}>
              {teacherCourses.map(course => (
                <NavLink 
                  key={course.id} 
                  to={`/teacher/courses/${course.id}`} 
                  className="nav-item sub-item"
                  style={{ 
                    fontSize: '0.85rem', 
                    padding: '6px 0',
                    background: 'none', // Box remove karne ke liye
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>•</span>
                  <span className="nav-text">{course.name}</span>
                </NavLink>
              ))}
            </div>
          )}
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
            <h2>Edunexs</h2>
            <p>Welcome, Professor</p>
          </div>
          <div className="header-profile">
            <div className="user-info">
              <span className="user-name">Haider Ali</span>
              <span className="user-role">Senior Teacher</span>
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