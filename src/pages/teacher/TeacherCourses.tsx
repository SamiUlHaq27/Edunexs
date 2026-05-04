import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faClock,
  faClipboardList,
  faStar,
  faUserTie,
  faLaptopCode,
  faArrowLeft,
  faArrowRight,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { teacherDashboardService } from "../../services";
import type { TeacherOfferingSummary } from "../../services/teacher-dashboard.service";
import TeacherAssignments from "./TeacherAssignments";
import TeacherQuizzes from "./TeacherQuizzes";
import TeacherAttendance from "./TeacherAttendance";
import TeacherGrades from "./TeacherGrades";

export default function TeacherCourses() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState<
    "assignments" | "quizzes" | "attendance" | "grades"
  >("assignments");
  const [offerings, setOfferings] = useState<TeacherOfferingSummary[]>([]);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        setIsLoadingOfferings(true);
        const response = await teacherDashboardService.getMyOfferings();
        setOfferings(response.data || []);
      } catch (error) {
        console.error("Failed to load teacher offerings", error);
        setOfferings([]);
      } finally {
        setIsLoadingOfferings(false);
      }
    };

    void loadOfferings();
  }, []);

  const selectedOffering = useMemo(() => {
    const offeringId = Number(courseId);
    if (!courseId || !Number.isFinite(offeringId) || offeringId <= 0) {
      return null;
    }

    return offerings.find((item) => item.id === offeringId) || null;
  }, [courseId, offerings]);

  if (!courseId) {
    return (
      <div className="teacher-courses">
        <div className="teacher-header-card">
          <div className="teacher-header-card-content">
            <span className="teacher-header-card-badge">
              Teaching Portfolio
            </span>
            <h2 className="teacher-header-card-title">My Courses</h2>
            <p className="teacher-header-card-subtitle">
              Select a course to manage assignments, quizzes, attendance, and
              grades.
            </p>
          </div>

          <FontAwesomeIcon
            icon={faBookOpen}
            className="teacher-header-card-graphic"
          />
        </div>

        {isLoadingOfferings && (
          <div
            className="card settings-container"
            style={{ padding: "1.5rem" }}
          >
            Loading assigned courses...
          </div>
        )}

        {!isLoadingOfferings && !offerings.length && (
          <div
            className="card settings-container"
            style={{ padding: "1.5rem" }}
          >
            No active courses are assigned yet.
          </div>
        )}

        {!isLoadingOfferings && offerings.length > 0 && (
          <div className="teacher-course-grid">
            {offerings.map((offering) => (
              <div
                key={offering.id}
                className="card settings-container teacher-course-card"
                style={{ display: "flex", flexDirection: "column", gap: 0 }}
              >
                <div className="teacher-course-card-accent" />

                <div className="teacher-course-card-body">
                  <div className="teacher-course-card-top-row">
                    <div
                      className="teacher-course-card-icon"
                      style={{
                        background: offering.isActive ? "#dbeafe" : "#f1f5f9",
                        color: offering.isActive ? "#1d4ed8" : "#475569",
                      }}
                    >
                      <FontAwesomeIcon icon={faLaptopCode} />
                    </div>

                    <span
                      className={`teacher-course-card-status ${offering.isActive ? "is-active" : "is-inactive"}`}
                    >
                      {offering.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div>
                    <h3 className="teacher-course-card-title">
                      {offering.courseTitle || `Course ${offering.courseId}`}
                    </h3>
                    <p className="teacher-course-card-subtitle">
                      {offering.teacherName || "Teacher"}
                    </p>
                  </div>

                  <div className="teacher-course-card-meta-grid">
                    <span className="teacher-course-card-meta-item">
                      <strong>Class</strong>
                      <span>{offering.sectionName || "N/A"}</span>
                    </span>
                    <span className="teacher-course-card-meta-item">
                      <strong>Code</strong>
                      <span>{offering.courseCode || "N/A"}</span>
                    </span>
                    <span className="teacher-course-card-meta-item">
                      <strong>Students</strong>
                      <span>{offering.studentProfileIds?.length || 0}</span>
                    </span>
                  </div>

                  <div className="teacher-course-card-footer-row">
                    <span className="teacher-course-card-footer-note">
                      Offering ID: {offering.id}
                    </span>

                    <Link
                      to={`/teacher/courses/${offering.id}`}
                      className="teacher-course-card-cta"
                    >
                      Open Course Workspace
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!isLoadingOfferings && !selectedOffering) {
    return (
      <div className="card settings-container" style={{ padding: "1.5rem" }}>
        <p style={{ marginTop: 0 }}>Course not found for this teacher.</p>
        <Link
          to="/teacher/courses"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to My Courses
        </Link>
      </div>
    );
  }

  const courseLabel =
    selectedOffering?.courseTitle ||
    selectedOffering?.courseCode ||
    `Course ${selectedOffering?.courseId || ""}`;

  return (
    <div className="teacher-courses">
      <div className="teacher-header-card teacher-header-card--detail">
        <div className="teacher-header-card-content">
          <Link to="/teacher/courses" className="teacher-header-card-backlink">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Courses
          </Link>
          <h2 className="teacher-header-card-title teacher-header-card-title--detail">
            {courseLabel}
          </h2>
          <p className="teacher-header-card-subtitle teacher-header-card-subtitle--detail">
            <FontAwesomeIcon icon={faUserTie} />
            <span>
              Instructor: {selectedOffering?.teacherName || "Lead Instructor"}
            </span>
          </p>
          <p className="teacher-header-card-meta">
            Class: {selectedOffering?.sectionName || "N/A"} | Course Code:{" "}
            {selectedOffering?.courseCode || "N/A"}
          </p>
        </div>

        <FontAwesomeIcon
          icon={faLaptopCode}
          className="teacher-header-card-graphic teacher-header-card-graphic--detail"
        />
      </div>

      <div
        className="course-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          onClick={() => setActiveTab("assignments")}
          style={movingCardStyle(activeTab === "assignments", "#f59e0b")}
        >
          <div
            className="stat-icon"
            style={{
              background: "#fef3c7",
              color: "#d97706",
              padding: "12px",
              borderRadius: "12px",
            }}
          >
            <FontAwesomeIcon icon={faFileAlt} size="lg" />
          </div>
          <div className="stat-info">
            <span className="stat-label" style={{ fontWeight: "700" }}>
              Assignment
            </span>
          </div>
        </div>
        <div
          onClick={() => setActiveTab("quizzes")}
          style={movingCardStyle(activeTab === "quizzes", "#6366f1")}
        >
          <div
            className="stat-icon"
            style={{
              background: "#e0e7ff",
              color: "#4338ca",
              padding: "12px",
              borderRadius: "12px",
            }}
          >
            <FontAwesomeIcon icon={faClock} size="lg" />
          </div>
          <div className="stat-info">
            <span className="stat-label" style={{ fontWeight: "700" }}>
              Quiz
            </span>
          </div>
        </div>
        <div
          onClick={() => setActiveTab("attendance")}
          style={movingCardStyle(activeTab === "attendance", "#10b981")}
        >
          <div
            className="stat-icon"
            style={{
              background: "#dcfce7",
              color: "#059669",
              padding: "12px",
              borderRadius: "12px",
            }}
          >
            <FontAwesomeIcon icon={faClipboardList} size="lg" />
          </div>
          <div className="stat-info">
            <span className="stat-label" style={{ fontWeight: "700" }}>
              Attendance
            </span>
          </div>
        </div>
        <div
          onClick={() => setActiveTab("grades")}
          style={movingCardStyle(activeTab === "grades", "#8b5cf6")}
        >
          <div
            className="stat-icon"
            style={{
              background: "#f3e8ff",
              color: "#7c3aed",
              padding: "12px",
              borderRadius: "12px",
            }}
          >
            <FontAwesomeIcon icon={faStar} size="lg" />
          </div>
          <div className="stat-info">
            <span className="stat-label" style={{ fontWeight: "700" }}>
              Gradebook
            </span>
          </div>
        </div>
      </div>

      <div
        className="card settings-container"
        style={{
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        {activeTab === "assignments" && (
          <TeacherAssignments offeringId={selectedOffering?.id} />
        )}
        {activeTab === "quizzes" && (
          <TeacherQuizzes offeringId={selectedOffering?.id} />
        )}
        {activeTab === "attendance" && (
          <TeacherAttendance offeringId={selectedOffering?.id} />
        )}
        {activeTab === "grades" && (
          <TeacherGrades offeringId={selectedOffering?.id} />
        )}
      </div>
    </div>
  );
}

const movingCardStyle = (isActive: boolean, color: string) => ({
  cursor: "pointer",
  padding: "1.5rem",
  background: "white",
  borderRadius: "16px",
  border: isActive ? `2px solid ${color}` : "1px solid #e5e7eb",
  boxShadow: isActive
    ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  transition: "all 0.3s ease",
  transform: isActive ? "translateY(-8px)" : "translateY(0)",
});
