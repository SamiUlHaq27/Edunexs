import React from "react";
import { authService } from "../../services/auth.service";

/**
 * InstitutionAdminDashboard - Level 1: Overview and welcome
 * Phase 1: Display institution and quick stats
 * Phase 2: Add course management, student management, etc.
 */
export default function InstitutionAdminDashboard(): React.JSX.Element {
  const user = authService.getUser();

  return (
    <div>
      <h1
        style={{ fontSize: "2rem", marginBottom: "1.5rem", fontWeight: "bold" }}
      >
        Welcome, {user?.name}!
      </h1>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.5rem",
          padding: "2rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "1rem",
            fontWeight: "600",
          }}
        >
          Institution Admin Dashboard
        </h2>

        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          You are logged in as an Institution Admin. Use the menu to manage
          courses, students, and other operations.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {/* Placeholder Cards for Phase 2 */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              📚 Courses
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Manage courses and assignments
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              👥 Students
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              View and manage student accounts
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              ⚙️ Settings
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Configure institution settings
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#e0f2fe",
            borderRadius: "0.5rem",
            borderLeft: "4px solid #0284c7",
          }}
        >
          <p style={{ margin: 0, color: "#0c4a6e", fontSize: "0.9rem" }}>
            💡 <strong>Tip:</strong> Navigation and management features will be
            available in the next phase of development.
          </p>
        </div>
      </div>
    </div>
  );
}
