import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, faBookReader, faUserGraduate, faSignOutAlt, faBars,
  faChevronDown, faChevronUp, faCircle, faMoneyBillWave
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/dashboard.css";
import "../../styles/student.css";

export default function StudentLayout(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);
  const [instProfile, setInstProfile] = useState({ name: "My Institution", logo: ASSETS.logo });

  const myCoursesList = [
    { id: 1, name: "Mathematics 101" },
    { id: 2, name: "Physics Fundamentals" },
    { id: 3, name: "Computer Science" }
  ];

  useEffect(() => {
    const saved = localStorage.getItem("institution_profile");
    if (saved) {
      setInstProfile(JSON.parse(saved));
    }
  }, []);

  return (
    <div className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}>
      <aside className="dashboard-sidebar" style={{ paddingTop: '1rem' }}>
        <div className="sidebar-header">
          <img src={instProfile.logo} alt="Logo" className="sidebar-logo" style={{ borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
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
          
          <div className="nav-group">
            <div 
              className="nav-item" 
              onClick={() => setIsCoursesExpanded(!isCoursesExpanded)} 
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <FontAwesomeIcon icon={faBookReader} className="nav-icon" />
                 <span className="nav-text">My Courses</span>
              </div>
              {!isMinimized && (
                 <FontAwesomeIcon icon={isCoursesExpanded ? faChevronUp : faChevronDown} style={{ fontSize: '0.8rem', opacity: 0.7, marginRight: '0.5rem' }} />
              )}
            </div>

            {/* Sub-menu (Courses List) - Gap Reduced Here */}
            {isCoursesExpanded && !isMinimized && (
               <div className="sub-menu" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.2rem' }}>
                 {myCoursesList.map(course => (
                    <NavLink 
                       key={course.id} 
                       to="/student/dashboard"
                       state={{ courseId: course.id }}
                       className="nav-item sub-nav-item"
                       style={({ isActive }) => ({ 
                          // Padding-left 3.2rem se kam karke 2.5rem kar di hai
                          padding: '0.5rem 1rem 0.5rem 2.5rem', 
                          fontSize: '0.85rem', 
                          minHeight: 'auto', 
                          opacity: isActive ? 1 : 0.8,
                          background: 'transparent',
                          boxShadow: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center'
                       })}
                    >
                       {/* Icon margin-right 0.6rem se kam karke 0.4rem kar di hai */}
                       <FontAwesomeIcon icon={faCircle} style={{ fontSize: '0.3rem', marginRight: '0.4rem' }} />
                       <span className="nav-text">{course.name}</span>
                    </NavLink>
                 ))}
               </div>
            )}
          </div>

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
          <div className="header-greeting">
             <h2>{instProfile.name}</h2>
             <p>Welcome back, Student!</p>
          </div>
          <div className="header-profile">
            <div className="user-info">
               <span className="user-name">Haider ali Hashmi</span>
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