import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faCog,
  faSignOutAlt,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../services/auth.service";

/**
 * InstitutionAdminLayout - Navigation and layout for Institution Admin portal
 * Phase 1: Basic layout with logout
 * Phase 2: Add course management, student management, etc.
 */
export default function InstitutionAdminLayout(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const user = authService.getUser();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/institute-admin/dashboard",
      icon: faGauge,
    },
    { label: "Settings", path: "/institute-admin/settings", icon: faCog },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: isSidebarOpen ? "250px" : "0",
          backgroundColor: "#1f2937",
          color: "white",
          transition: "width 0.3s ease",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <nav style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              marginBottom: "2rem",
              fontWeight: "bold",
            }}
          >
            Institution Admin
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {menuItems.map((item) => (
              <li key={item.path} style={{ marginBottom: "0.5rem" }}>
                <Link
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    color: isActive(item.path) ? "#fff" : "#9ca3af",
                    backgroundColor: isActive(item.path)
                      ? "#374151"
                      : "transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = "#374151";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#9ca3af";
                    }
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} style={{ width: "1rem" }} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              marginTop: "2rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#dc2626",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "background-color 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#b91c1c")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc2626")
            }
          >
            <FontAwesomeIcon icon={faSignOutAlt} style={{ width: "1rem" }} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#1f2937",
            }}
          >
            <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {user && (
              <>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: "600", color: "#1f2937" }}>
                    {user.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}
                  >
                    {user.role}
                  </p>
                </div>
                {user.profilePicture?.publicUrl && (
                  <img
                    src={user.profilePicture.publicUrl}
                    alt={user.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <section style={{ flex: 1, padding: "2rem", overflow: "auto" }}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
