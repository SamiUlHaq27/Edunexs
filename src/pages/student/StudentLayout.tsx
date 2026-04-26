import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, faBookReader, faUserCircle, faSignOutAlt, faBars,
  faMoneyBillWave
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import { authService, institutionService } from "../../services";
import type { Institution } from "../../types";
import "../../styles/dashboard.css";
import "../../styles/student.css";
import "../../styles/teacher.css";

export default function StudentLayout(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const [institutionInfo, setInstitutionInfo] = useState<{
    name: string;
    prefix?: string;
    logo: string;
  }>({
    name: "My Institution",
    prefix: undefined,
    logo: ASSETS.logo,
  });

  const user = authService.getUser();

  useEffect(() => {
    const loadInstitutionInfo = async () => {
      try {
        const institution: Institution | null =
          await institutionService.getMyInstitution();

        if (institution) {
          setInstitutionInfo({
            name: institution.name,
            prefix: institution.prefix,
            logo:
              institution.logoUrl ||
              institution.logo?.publicUrl ||
              ASSETS.logo,
          });
        }
      } catch {
        // Keep default institution info if request is unavailable.
      }
    };

    void loadInstitutionInfo();
  }, []);

  return (
    <div className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}>
      <aside className="dashboard-sidebar" style={{ paddingTop: '1rem' }}>
        <div className="sidebar-header">
          <img src={institutionInfo.logo} alt="Logo" className="sidebar-logo" style={{ borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
        </div>
        <div className="sidebar-title-div">
          <button onClick={() => setIsMinimized(!isMinimized)} className="toggle-btn">
             <FontAwesomeIcon icon={faBars} />
          </button>
          {!isMinimized && <h1 className="dashboard-sidebar-title">Student Portal</h1>}
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

          <NavLink to="/student/fees" className="nav-item">
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
          <div className="header-greeting teacher-institution-brand">
            <img
              src={institutionInfo.logo}
              alt="Institution Logo"
              className="teacher-institution-logo"
            />
            <div className="teacher-institution-copy student-institution-copy">
              <h2>{institutionInfo.name}</h2>
              <p>Welcome, {user?.name || "Student"}</p>
            </div>
          </div>
          <div className="header-profile">
            <div className="user-info">
               <span className="user-name">{user?.name || "Student"}</span>
               <span className="user-role">{user?.role || "student"}</span>
            </div>
            {user?.profilePicture?.publicUrl ? (
              <img
                src={user.profilePicture.publicUrl}
                alt="Student"
                className="user-avatar"
              />
            ) : (
              <FontAwesomeIcon icon={faUserCircle} className="user-avatar" />
            )}
          </div>
        </header>
        <div className="dashboard-content">
           <Outlet />
        </div>
      </main>
    </div>
  );
}