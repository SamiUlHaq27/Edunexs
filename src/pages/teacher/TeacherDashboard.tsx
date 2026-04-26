import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser,
  faUserGraduate,
  faFileSignature,
  faCheckCircle,
  faBookOpen,
  faClock,
  faArrowRight,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { authService, teacherDashboardService } from "../../services";
import type { TeacherOfferingSummary } from "../../services/teacher-dashboard.service";

const MetricCard = ({
  title,
  value,
  subtext,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: any;
  color: string;
}) => (
  <div
    style={{
      background: "#ffffff",
      padding: "1.25rem",
      borderRadius: "14px",
      boxShadow:
        "0 1px 3px rgba(0,0,0,0.02), 0 8px 24px rgba(149, 157, 165, 0.1)",
      display: "flex",
      flexDirection: "column",
      gap: "0.65rem",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.025em",
        }}
      >
        {title}
      </span>
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          background: `${color}15`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
    <div>
      <h3
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "#0f172a",
          margin: 0,
        }}
      >
        {value}
      </h3>
      <p
        style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0 0" }}
      >
        {subtext}
      </p>
    </div>
  </div>
);

export default function TeacherDashboard() {
  const [offerings, setOfferings] = useState<TeacherOfferingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<{
    attendancePercentage: number;
    totalStudents: number;
    pendingReviewCount: number;
    activeAssignments: number;
    activeQuizzes: number;
  } | null>(null);

  const user = authService.getUser();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const offeringsResponse = await teacherDashboardService.getMyOfferings({
          page: 1,
          size: 100,
          filters: { isActive: true },
        });

        const myOfferings = offeringsResponse.data || [];
        setOfferings(myOfferings);

        if (!myOfferings.length) {
          setSnapshot({
            attendancePercentage: 0,
            totalStudents: 0,
            pendingReviewCount: 0,
            activeAssignments: 0,
            activeQuizzes: 0,
          });
          return;
        }

        const snapshots = await Promise.all(
          myOfferings.map((offering) =>
            teacherDashboardService
              .getSnapshot({ offeringId: offering.id })
              .catch(() => null),
          ),
        );

        let attendanceSum = 0;
        let attendanceCount = 0;
        let assignmentTotal = 0;
        let quizTotal = 0;

        snapshots.forEach((item) => {
          if (!item) {
            return;
          }

          const report = item.attendanceReport as Record<string, unknown>;
          const attendance = Number(report?.attendancePercentage ?? 0);
          if (Number.isFinite(attendance) && attendance > 0) {
            attendanceSum += attendance;
            attendanceCount += 1;
          }

          assignmentTotal += Number(item.assignments.total || 0);
          quizTotal += Number(item.quizzes.total || 0);
        });

        const totalStudents = myOfferings.reduce(
          (sum, offering) => sum + (offering.studentProfileIds?.length || 0),
          0,
        );

        setSnapshot({
          attendancePercentage:
            attendanceCount > 0
              ? Number((attendanceSum / attendanceCount).toFixed(1))
              : 0,
          totalStudents,
          pendingReviewCount: assignmentTotal + quizTotal,
          activeAssignments: assignmentTotal,
          activeQuizzes: quizTotal,
        });
      } catch (error) {
        console.error("Failed to load teacher dashboard", error);
        setErrorMessage("Could not load dashboard insights right now.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const latestCourses = useMemo(() => offerings.slice(0, 4), [offerings]);

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100%",
        padding: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.8rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Teacher Dashboard
          </h1>
          <p
            style={{
              color: "#64748b",
              marginTop: "0.4rem",
              fontSize: "0.95rem",
            }}
          >
            Welcome back, {user?.name || "Teacher"}. Here is your live summary.
          </p>
        </div>
        <Link
          to="/teacher/courses"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: "#1d4ed8",
            fontWeight: 700,
          }}
        >
          Manage Courses
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>

      {errorMessage && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "0.9rem 1rem",
            marginBottom: "1.1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {errorMessage}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <MetricCard
          title="Active Courses"
          value={isLoading ? "..." : String(offerings.length)}
          subtext="Assigned section offerings"
          icon={faChalkboardUser}
          color="#3b82f6"
        />
        <MetricCard
          title="Total Students"
          value={isLoading ? "..." : String(snapshot?.totalStudents || 0)}
          subtext="Across all active classes"
          icon={faUserGraduate}
          color="#8b5cf6"
        />
        <MetricCard
          title="Pending Review"
          value={isLoading ? "..." : String(snapshot?.pendingReviewCount || 0)}
          subtext="Assignments + quizzes"
          icon={faFileSignature}
          color="#f59e0b"
        />
        <MetricCard
          title="Avg Attendance"
          value={isLoading ? "..." : `${snapshot?.attendancePercentage || 0}%`}
          subtext="Calculated from attendance reports"
          icon={faCheckCircle}
          color="#10b981"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1rem",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "1.2rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a" }}>
              My Active Courses
            </h3>
            <FontAwesomeIcon icon={faBookOpen} color="#3b82f6" />
          </div>

          {!latestCourses.length && !isLoading && (
            <p style={{ margin: 0, color: "#64748b" }}>
              No active courses assigned yet.
            </p>
          )}

          <div style={{ display: "grid", gap: "0.8rem" }}>
            {latestCourses.map((course) => (
              <Link
                key={course.id}
                to={`/teacher/courses/${course.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #f1f5f9",
                  borderRadius: "12px",
                  padding: "0.8rem",
                  display: "block",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.7rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e293b" }}>
                      {course.courseTitle ||
                        course.courseCode ||
                        `Course ${course.courseId}`}
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "#64748b",
                        marginTop: "0.25rem",
                      }}
                    >
                      Class: {course.sectionName || "N/A"} | Code:{" "}
                      {course.courseCode || "N/A"}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#0c4a6e",
                      background: "#e0f2fe",
                      borderRadius: "999px",
                      padding: "0.2rem 0.55rem",
                      fontWeight: 700,
                    }}
                  >
                    {course.studentProfileIds?.length || 0} students
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
              borderRadius: "14px",
              padding: "1rem",
              color: "white",
            }}
          >
            <FontAwesomeIcon
              icon={faClock}
              style={{ marginBottom: "0.6rem" }}
            />
            <h4 style={{ margin: 0, fontSize: "0.95rem", opacity: 0.9 }}>
              Active Workload
            </h4>
            <div
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                marginTop: "0.4rem",
              }}
            >
              {(snapshot?.activeAssignments || 0) +
                (snapshot?.activeQuizzes || 0)}{" "}
              items
            </div>
            <p
              style={{
                margin: "0.45rem 0 0",
                fontSize: "0.78rem",
                opacity: 0.85,
              }}
            >
              {snapshot?.activeAssignments || 0} assignments and{" "}
              {snapshot?.activeQuizzes || 0} quizzes
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "1rem",
              border: "1px dashed #cbd5e1",
            }}
          >
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "0.95rem" }}>
              Quick Access
            </h4>
            <div
              style={{ marginTop: "0.7rem", display: "grid", gap: "0.45rem" }}
            >
              <Link
                to="/teacher/courses"
                style={{
                  color: "#1d4ed8",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Open My Courses
              </Link>
              <Link
                to="/teacher/courses"
                style={{
                  color: "#1d4ed8",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Mark Attendance
              </Link>
              <Link
                to="/teacher/courses"
                style={{
                  color: "#1d4ed8",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Review Submissions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
