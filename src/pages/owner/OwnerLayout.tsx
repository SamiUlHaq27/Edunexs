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
  faChevronLeft,
  faChevronRight,
  faBell,
  faFileInvoiceDollar,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import "../../styles/dashboard.css";
import "../../styles/owner.css";
import { institutionService } from "../../services/institution.service";
import { authService } from "../../services/auth.service";
import { Institution, UserRole } from "../../types";

interface OwnerLayoutProps {
  hideInstitutionTab?: boolean;
}

export default function OwnerLayout({
  hideInstitutionTab = false,
}: OwnerLayoutProps = {}): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const [instProfile, setInstProfile] = useState<{
    name: string;
    prefix?: string;
    logo: string;
  }>({
    name: "My Institution",
    prefix: undefined,
    logo: "/dummy/institution-dummy-logo-picture.png",
  });
  const [userProfile, setUserProfile] = useState<{
    name: string;
    role?: string;
    avatar?: string;
  } | null>(null);

  // Detect if current user is INSTITUTION_ADMIN to hide Institution tab
  const user = authService.getUser();
  const isInstitutionAdmin = user?.role === UserRole.INSTITUTION_ADMIN;
  const shouldHideInstitutionTab = hideInstitutionTab || isInstitutionAdmin;

  useEffect(() => {
    let mounted = true;

    const fetchInstitution = async () => {
      try {
        const inst: Institution | null =
          await institutionService.getMyInstitution();
        if (!mounted || !inst) return;

        setInstProfile({
          name: inst.name,
          prefix: inst.prefix,
          logo:
            inst.logoUrl ||
            inst.logo?.publicUrl ||
            "/dummy/institution-dummy-logo-picture.png",
        });
      } catch (error) {
        // If fetch fails, keep defaults; optionally could log
        if (!mounted) return;
      }
    };

    void fetchInstitution();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser) {
      const formatRole = (role: string) =>
        role
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

      setUserProfile({
        name: storedUser.name,
        role: formatRole(storedUser.role),
        avatar:
          storedUser.profilePicture?.publicUrl ||
          "/dummy/institution-owner-dummy-profile-picture.png",
      });
    }
  }, []);

  // Close sidebar on mobile when navigation occurs
  const handleNavClick = () => {
    // Only close sidebar on mobile (< 768px)
    if (window.matchMedia("(max-width: 767.98px)").matches) {
      setIsMinimized(true);
    }
  };

  return (
    <div
      className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}
    >
      {/* Sidebar overlay for mobile */}
      <div
        className="sidebar-overlay"
        onClick={() => setIsMinimized(true)}
        aria-hidden="true"
      />
      {/* --- Sidebar --- */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-title-div">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="toggle-btn"
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon
              icon={isMinimized ? faChevronRight : faChevronLeft}
              size="lg"
            />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/owner/dashboard"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          {!shouldHideInstitutionTab && (
            <NavLink
              to="/owner/institution"
              className="nav-item"
              onClick={handleNavClick}
            >
              <FontAwesomeIcon icon={faUniversity} className="nav-icon" />
              <span className="nav-text">Institution</span>
            </NavLink>
          )}

          {!shouldHideInstitutionTab && (
            <NavLink
              to="/owner/admins"
              className="nav-item"
              onClick={handleNavClick}
            >
              <FontAwesomeIcon icon={faUserShield} className="nav-icon" />
              <span className="nav-text">Inst. Admin</span>
            </NavLink>
          )}
          <NavLink
            to="/owner/teachers"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faChalkboardTeacher} className="nav-icon" />
            <span className="nav-text">Teachers</span>
          </NavLink>
          <NavLink
            to="/owner/students"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faUserGraduate} className="nav-icon" />
            <span className="nav-text">Students</span>
          </NavLink>
          <NavLink
            to="/owner/parents"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faUsers} className="nav-icon" />
            <span className="nav-text">Parents</span>
          </NavLink>

          <NavLink
            to="/owner/courses"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
            <span className="nav-text">Courses</span>
          </NavLink>
          <NavLink
            to="/owner/classes"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faChalkboard} className="nav-icon" />
            <span className="nav-text">Classes</span>
          </NavLink>

          {/* Replaced Reports with Fee Management */}
          <NavLink
            to="/owner/fees"
            className="nav-item"
            onClick={handleNavClick}
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="nav-icon" />
            <span className="nav-text">Fee Management</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/logout" className="nav-item" onClick={handleNavClick}>
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
            <span className="nav-text">Log-Out</span>
          </NavLink>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="dashboard-main">
        <header className="main-header">
          {/* Left Side: Logo & Institution Name (UPDATES DYNAMICALLY) */}
          <div className="header-left">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="dashboard-mobile-toggle"
              aria-label="Toggle sidebar"
              aria-expanded={isMinimized}
            >
              <FontAwesomeIcon
                icon={isMinimized ? faChevronRight : faChevronLeft}
              />
            </button>
            <img
              src={instProfile.logo}
              alt="Institution Logo"
              className="header-logo"
            />
            <div className="header-logo-text">
              <h2>{instProfile.name}</h2>
            </div>
          </div>

          {/* Right Side */}
          <div className="header-profile">
            <div className="header-notification">
              <FontAwesomeIcon icon={faBell} size="lg" />
              <span className="notification-badge" />
            </div>

            <div className="header-user">
              <div className="user-info">
                <span className="user-name">{userProfile?.name || "User"}</span>
                <span className="user-role">
                  {userProfile?.role || "Signed in"}
                </span>
              </div>
              <img
                src={
                  userProfile?.avatar ||
                  "/dummy/institution-owner-dummy-profile-picture.png"
                }
                alt="Profile"
              />
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
