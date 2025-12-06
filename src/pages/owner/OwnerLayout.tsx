import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUniversity,
  faUserShield,
  faChalkboardTeacher,
  faUserGraduate,
  faBookOpen,
  faChalkboard,
  faSignOutAlt,
  faBars,
  faUserCircle,
  faBell,
  faFileAlt
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/dashboard.css";
import "../../styles/owner.css";

export default function OwnerLayout(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const [instProfile, setInstProfile] = useState({ name: "My Institution", logo: ASSETS.logo });

  const loadProfile = () => {
    const saved = localStorage.getItem("institution_profile");
    if (saved) {
      setInstProfile(JSON.parse(saved));
    }
  };

  useEffect(() => {
    // 1. Initial Load
    loadProfile();

    // 2. Listen for updates from InstitutionSettings page
    window.addEventListener("institution_profile_updated", loadProfile);

    // 3. Cleanup listener
    return () => {
      window.removeEventListener("institution_profile_updated", loadProfile);
    };
  }, []);

  return (
    <div className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}>
      {/* --- Sidebar --- */}
      <aside className="dashboard-sidebar" style={{ paddingTop: '1rem' }}>
        <div className="sidebar-title-div" style={{ justifyContent: 'flex-start', margin: '0 0 20px 0' }}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="toggle-btn" 
            style={{ position: 'static' }}
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/owner/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink to="/owner/institution" className="nav-item">
            <FontAwesomeIcon icon={faUniversity} className="nav-icon" />
            <span className="nav-text">Institution</span>
          </NavLink>
          
          <NavLink to="/owner/admins" className="nav-item">
            <FontAwesomeIcon icon={faUserShield} className="nav-icon" />
            <span className="nav-text">Inst. Admin</span>
          </NavLink>
          <NavLink to="/owner/teachers" className="nav-item">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="nav-icon" />
            <span className="nav-text">Teachers</span>
          </NavLink>
          <NavLink to="/owner/students" className="nav-item">
            <FontAwesomeIcon icon={faUserGraduate} className="nav-icon" />
            <span className="nav-text">Students</span>
          </NavLink>

          <NavLink to="/owner/courses" className="nav-item">
            <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
            <span className="nav-text">Courses</span>
          </NavLink>
          <NavLink to="/owner/classes" className="nav-item">
            <FontAwesomeIcon icon={faChalkboard} className="nav-icon" />
            <span className="nav-text">Classes</span>
          </NavLink>
          
          <NavLink to="/owner/reports" className="nav-item">
            <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
            <span className="nav-text">Reports</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/logout" className="nav-item">
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
            <span className="nav-text">Log-Out</span>
          </NavLink>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="dashboard-main">
        <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: 'none' }}>
          
          {/* Left Side: Logo & Institution Name (UPDATES DYNAMICALLY) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={instProfile.logo} 
              alt="Logo" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                {instProfile.name}
              </h2>
              
            </div>
          </div>

          {/* Center */}
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', position: 'relative', left: '15%', transform: 'translateX(-50%)' }}>
            Learning Management System
          </h1>

          {/* Right Side */}
          <div className="header-profile" style={{ gap: '1.5rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <FontAwesomeIcon icon={faBell} size="lg" />
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '10px', height: '10px', background: 'red', borderRadius: '50%', border: '2px solid white' }}></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="user-info">
                <span className="user-name">Dr. Ali Raza</span>
                <span className="user-role">Institution Owner</span>
              </div>
              <img 
                src="https://i.pravatar.cc/150?img=57" 
                alt="Profile"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border-muted)' }} 
              />
            </div>
          </div>
        </header>
        
        <div className="dashboard-content" style={{ paddingTop: '1rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}