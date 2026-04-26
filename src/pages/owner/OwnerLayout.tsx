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

  return (
    <div
      className={`dashboard-layout ${isMinimized ? "sidebar-minimized" : ""}`}
    >
      {/* --- Sidebar --- */}
      <aside className="dashboard-sidebar" style={{ paddingTop: "1rem" }}>
        <div
          className="sidebar-title-div"
          style={{ justifyContent: "flex-start", margin: "0 0 20px 0" }}
        >
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="toggle-btn"
            style={{ position: "static" }}
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

          {!shouldHideInstitutionTab && (
            <NavLink to="/owner/institution" className="nav-item">
              <FontAwesomeIcon icon={faUniversity} className="nav-icon" />
              <span className="nav-text">Institution</span>
            </NavLink>
          )}

          {!shouldHideInstitutionTab && (
            <NavLink to="/owner/admins" className="nav-item">
              <FontAwesomeIcon icon={faUserShield} className="nav-icon" />
              <span className="nav-text">Inst. Admin</span>
            </NavLink>
          )}
          <NavLink to="/owner/teachers" className="nav-item">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="nav-icon" />
            <span className="nav-text">Teachers</span>
          </NavLink>
          <NavLink to="/owner/students" className="nav-item">
            <FontAwesomeIcon icon={faUserGraduate} className="nav-icon" />
            <span className="nav-text">Students</span>
          </NavLink>
          <NavLink to="/owner/parents" className="nav-item">
            <FontAwesomeIcon icon={faUsers} className="nav-icon" />
            <span className="nav-text">Parents</span>
          </NavLink>

          <NavLink to="/owner/courses" className="nav-item">
            <FontAwesomeIcon icon={faBookOpen} className="nav-icon" />
            <span className="nav-text">Courses</span>
          </NavLink>
          <NavLink to="/owner/classes" className="nav-item">
            <FontAwesomeIcon icon={faChalkboard} className="nav-icon" />
            <span className="nav-text">Classes</span>
          </NavLink>

          {/* Replaced Reports with Fee Management */}
          <NavLink to="/owner/fees" className="nav-item">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="nav-icon" />
            <span className="nav-text">Fee Management</span>
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
        <header
          className="main-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 0",
            borderBottom: "none",
          }}
        >
          {/* Left Side: Logo & Institution Name (UPDATES DYNAMICALLY) */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <img
              src={instProfile.logo}
              alt="Institution Logo"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid var(--color-border-muted)",
              }}
            />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "var(--color-text-primary)",
                }}
              >
                {instProfile.name}
              </h2>
            </div>
          </div>

          {/* Right Side */}
          <div className="header-profile" style={{ gap: "1.5rem" }}>
            <div
              style={{
                position: "relative",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
              }}
            >
              <FontAwesomeIcon icon={faBell} size="lg" />
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  width: "10px",
                  height: "10px",
                  background: "red",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              ></span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--color-border-muted)",
                }}
              />
            </div>
          </div>
        </header>

        <div className="dashboard-content" style={{ paddingTop: "1rem" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
