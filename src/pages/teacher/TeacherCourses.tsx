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
  faUsers,
  faBookOpen,
  faLayerGroup,
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
      <div className="student-courses">
        <div
          className="student-header-card"
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
            minHeight: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
              }}
            >
              Teaching Portfolio
            </span>
            <h2
              style={{ margin: "10px 0", fontSize: "2rem", fontWeight: "800" }}
            >
              My Courses
            </h2>
            <p style={{ opacity: 0.9, fontSize: "1rem" }}>
              Select a course to manage assignments, quizzes, attendance, and
              grades.
            </p>
          </div>

          <FontAwesomeIcon
            icon={faBookOpen}
            style={{
              position: "absolute",
              right: "20px",
              bottom: "-20px",
              fontSize: "8rem",
              opacity: 0.15,
              transform: "rotate(-15deg)",
            }}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {offerings.map((offering) => (
              <div
                key={offering.id}
                className="card settings-container"
                style={{
                  borderRadius: "14px",
                  padding: "1.25rem",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.9rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        color: "#0f172a",
                      }}
                    >
                      {offering.courseTitle || `Course ${offering.courseId}`}
                    </h3>
                    <p
                      style={{
                        margin: "0.3rem 0 0",
                        color: "#64748b",
                        fontSize: "0.9rem",
                      }}
                    >
                      {offering.teacherName || "Teacher"}
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "0.55rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                      color: "#334155",
                    }}
                  >
                    <FontAwesomeIcon icon={faLayerGroup} />
                    <span>Class: {offering.sectionName || "N/A"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                      color: "#334155",
                    }}
                  >
                    <FontAwesomeIcon icon={faLaptopCode} />
                    <span>Course Code: {offering.courseCode || "N/A"}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                      color: "#334155",
                    }}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                    <span>
                      Students: {offering.studentProfileIds?.length || 0}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/teacher/courses/${offering.id}`}
                  style={{
                    marginTop: "0.25rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  Open Course Workspace
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
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
    <div className="student-courses">
      <div
        className="student-header-card"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
          minHeight: "170px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <Link
            to="/teacher/courses"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              color: "#cbd5e1",
              textDecoration: "none",
              fontSize: "0.9rem",
              marginBottom: "0.65rem",
              fontWeight: 600,
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Courses
          </Link>
          <h2
            style={{ margin: "6px 0", fontSize: "2.1rem", fontWeight: "800" }}
          >
            {courseLabel}
          </h2>
          <p
            style={{
              opacity: 0.9,
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FontAwesomeIcon icon={faUserTie} />
            Instructor: {selectedOffering?.teacherName || "Lead Instructor"}
          </p>
          <p
            style={{ opacity: 0.85, fontSize: "0.92rem", marginTop: "0.45rem" }}
          >
            Class: {selectedOffering?.sectionName || "N/A"} | Course Code:{" "}
            {selectedOffering?.courseCode || "N/A"}
          </p>
        </div>

        <FontAwesomeIcon
          icon={faLaptopCode}
          style={{
            position: "absolute",
            right: "20px",
            bottom: "-20px",
            fontSize: "10rem",
            opacity: 0.15,
            transform: "rotate(-15deg)",
          }}
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
