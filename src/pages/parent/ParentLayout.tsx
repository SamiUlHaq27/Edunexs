import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
  faUserTie,
  faChild,
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import { authService } from "../../services/auth.service";
import { parentService } from "../../services/parent.service";
import "../../styles/dashboard.css";
import "../../styles/parent.css";

export interface ParentOutletContext {
  selectedStudentProfileId: number | null;
  linkedStudents: Array<{
    studentProfileId: number;
    label: string;
    studentName?: string;
    studentUsername?: string;
    rollNo?: string;
  }>;
  setSelectedStudentProfileId: (studentProfileId: number) => void;
}

export default function ParentLayout(): React.JSX.Element {
  const [isMinimized, setIsMinimized] = useState(false);
  const [instProfile, setInstProfile] = useState({
    name: "My Institution",
    logo: ASSETS.logo,
  });
  const [selectedStudentProfileId, setSelectedStudentProfileIdState] = useState<
    number | null
  >(null);
  const [linkedStudents, setLinkedStudents] = useState<
    Array<{
      studentProfileId: number;
      label: string;
      studentName?: string;
      studentUsername?: string;
      rollNo?: string;
    }>
  >([]);

  const user = authService.getUser() as
    | ({
        name?: string;
        linkedStudentIds?: number[];
        studentProfileId?: number | null;
      } & Record<string, unknown>)
    | null;

  const linkedStudentIds =
    user?.linkedStudentIds && user.linkedStudentIds.length > 0
      ? user.linkedStudentIds
      : user?.studentProfileId
        ? [user.studentProfileId]
        : [];

  useEffect(() => {
    const loadLinkedStudents = async () => {
      try {
        const response = await parentService.getMyLinkedStudents();
        if (response.linkedStudents.length > 0) {
          setLinkedStudents(
            response.linkedStudents.map((student, index) => ({
              studentProfileId: student.studentProfileId,
              studentName: student.studentName,
              studentUsername: student.studentUsername,
              rollNo: student.rollNo,
              label:
                student.studentName || student.studentUsername
                  ? `${student.studentName || student.studentUsername} (${student.rollNo || `ID: ${student.studentProfileId}`})`
                  : `Student ${index + 1} (ID: ${student.studentProfileId})`,
            })),
          );
          return;
        }
      } catch {
        // fall back to auth payload if endpoint is unavailable
      }

      setLinkedStudents(
        linkedStudentIds.map((id, index) => ({
          studentProfileId: id,
          label: `Student ${index + 1} (ID: ${id})`,
        })),
      );
    };

    void loadLinkedStudents();
  }, [linkedStudentIds.join(",")]);

  useEffect(() => {
    const saved = localStorage.getItem("institution_profile");
    if (saved) {
      setInstProfile(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const fromStorage = localStorage.getItem(
      "parent_selected_student_profile_id",
    );
    const parsed = fromStorage ? Number(fromStorage) : null;

    if (
      parsed &&
      Number.isInteger(parsed) &&
      linkedStudents.some((student) => student.studentProfileId === parsed)
    ) {
      setSelectedStudentProfileIdState(parsed);
      return;
    }

    if (linkedStudents.length > 0) {
      setSelectedStudentProfileIdState(linkedStudents[0].studentProfileId);
      localStorage.setItem(
        "parent_selected_student_profile_id",
        String(linkedStudents[0].studentProfileId),
      );
    } else {
      setSelectedStudentProfileIdState(null);
      localStorage.removeItem("parent_selected_student_profile_id");
    }
  }, [linkedStudents.map((s) => s.studentProfileId).join(",")]);

  const setSelectedStudentProfileId = (studentProfileId: number) => {
    setSelectedStudentProfileIdState(studentProfileId);
    localStorage.setItem(
      "parent_selected_student_profile_id",
      String(studentProfileId),
    );
  };

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
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={instProfile.logo} alt="Logo" className="sidebar-logo" />
        </div>
        <div className="sidebar-title-div">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="toggle-btn"
          >
            <FontAwesomeIcon
              icon={isMinimized ? faChevronRight : faChevronLeft}
            />
          </button>
          <h1 className="dashboard-sidebar-title">Parent Portal</h1>
        </div>

        <div className="parent-sidebar-students">
          <div className="parent-sidebar-students-title">
            <FontAwesomeIcon icon={faChild} />
            {!isMinimized && <span>Linked Students</span>}
          </div>
          {!isMinimized && (
            <div className="parent-student-list">
              {linkedStudents.length === 0 ? (
                <div className="parent-student-empty">No linked students</div>
              ) : (
                linkedStudents.map((student) => (
                  <button
                    key={student.studentProfileId}
                    type="button"
                    className={`parent-student-item ${
                      selectedStudentProfileId === student.studentProfileId
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedStudentProfileId(student.studentProfileId)
                    }
                  >
                    {student.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <NavLink to="/logout" className="nav-item" onClick={handleNavClick}>
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
            <span className="nav-text">Logout</span>
          </NavLink>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
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
          <div className="header-greeting">
            <h2>{instProfile.name}</h2>
            <p>Parent Dashboard</p>
          </div>
          <div className="header-profile">
            <div className="user-info">
              <span className="user-name">{user?.name || "Parent"}</span>
              <span className="user-role">Parent</span>
            </div>
            <FontAwesomeIcon icon={faUserTie} className="user-avatar" />
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet
            context={{
              selectedStudentProfileId,
              linkedStudents,
              setSelectedStudentProfileId,
            }}
          />
        </div>
      </main>
    </div>
  );
}
