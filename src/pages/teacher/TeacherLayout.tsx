import React, { useEffect, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser,
  faBookOpen,
  faSignOutAlt,
  faBars,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import { authService, institutionService } from "../../services";
import type { Institution } from "../../types";
import "../../styles/dashboard.css";
import "../../styles/teacher.css";

export default function TeacherLayout() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [institutionInfo, setInstitutionInfo] = useState<{
    name: string;
    prefix?: string;
    logo: string;
  }>({
    name: "Edunexs",
    prefix: undefined,
    logo: "/dummy/institution-dummy-logo-picture.png",
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
              "/dummy/institution-dummy-logo-picture.png",
          });
        }
      } catch {
        // Keep default institution info if request is unavailable.
      }
    };

    void loadInstitutionInfo();
  }, []);

  return (
    <div
      className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}
    >
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img
            src={ASSETS.logo}
            alt="Logo"
            className="sidebar-logo"
            style={{ background: "#fff", borderRadius: "50%" }}
          />
        </div>

        <div className="sidebar-title-div">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="toggle-btn"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <h1 className="dashboard-sidebar-title">Teacher Portal</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/teacher/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faChalkboardUser} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink to="/teacher/courses" className="nav-item">
            <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
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
          <div className="header-greeting teacher-institution-brand">
            <img
              src={institutionInfo.logo}
              alt="Institution Logo"
              className="teacher-institution-logo"
            />
            <div className="teacher-institution-copy">
              <h2>{institutionInfo.name}</h2>
              <p>Welcome, {user?.name || "Professor"}</p>
            </div>
          </div>
          <div className="header-profile">
            <div className="user-info">
              <span className="user-name">{user?.name || "Teacher"}</span>
              <span className="user-role">{user?.role || "teacher"}</span>
            </div>
            {user?.profilePicture?.publicUrl ? (
              <img
                src={user.profilePicture.publicUrl}
                alt="Teacher"
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
