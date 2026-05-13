import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBookReader,
  faCalendarAlt,
  faCheckCircle,
  faClock,
  faFileAlt,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
  studentDashboardService,
  type StudentDashboardSummaryResponse,
} from "../../services";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const maybeResponse = error as {
      response?: { data?: { message?: string | string[] } };
    };

    const message = maybeResponse.response?.data?.message;
    if (Array.isArray(message)) {
      return message[0] || "Something went wrong";
    }
    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

function formatLabel(value?: string | null): string {
  if (!value) return "N/A";
  return value;
}

export default function StudentDashboard(): React.JSX.Element {
  const navigate = useNavigate();
  const [summary, setSummary] =
    useState<StudentDashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await studentDashboardService.getSummary();
        setSummary(response);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSummary();
  }, []);

  const totals = useMemo(() => {
    if (!summary) {
      return {
        activeCourses: 0,
        previousCourses: 0,
        pendingAssignments: 0,
        pendingQuizzes: 0,
      };
    }

    return {
      activeCourses: summary.activeCourses.length,
      previousCourses: summary.previousCourses.length,
      pendingAssignments: summary.activeCourses.reduce(
        (count, course) => count + course.pendingAssignments,
        0,
      ),
      pendingQuizzes: summary.activeCourses.reduce(
        (count, course) => count + course.pendingQuizzes,
        0,
      ),
    };
  }, [summary]);

  if (isLoading) {
    return (
      <div className="card settings-container">
        <p style={{ margin: 0, color: "#475569" }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card settings-container">
        <p style={{ color: "#b91c1c", marginTop: 0 }}>{error}</p>
        <button
          className="btn"
          onClick={() => window.location.reload()}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="card settings-container">
        <p style={{ margin: 0, color: "#475569" }}>No dashboard data found.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section
        className="card"
        style={{
          padding: "1.5rem",
          border: "1px solid #dbeafe",
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(59,130,246,0.05) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#0f172a" }}>Overview</h2>
            <p style={{ margin: "0.4rem 0 0", color: "#475569" }}>
              Active courses, outstanding work, and previous courses at a
              glance.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
              gap: "0.75rem",
              minWidth: "280px",
            }}
          >
            <MetricPill
              icon={faBookReader}
              label="Active"
              value={totals.activeCourses}
            />
            <MetricPill
              icon={faLayerGroup}
              label="Previous"
              value={totals.previousCourses}
            />
            <MetricPill
              icon={faFileAlt}
              label="Assignments"
              value={totals.pendingAssignments}
            />
            <MetricPill
              icon={faClock}
              label="Quizzes"
              value={totals.pendingQuizzes}
            />
          </div>
        </div>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ margin: 0, color: "#0f172a" }}>Active Courses</h3>
          <span style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Summary only
          </span>
        </div>

        {summary.activeCourses.length === 0 ? (
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ margin: 0, color: "#64748b" }}>
              No active courses found.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {summary.activeCourses.map((course) => (
              <article
                key={course.id}
                className="card"
                style={{
                  padding: "1.25rem",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#2563eb",
                        fontWeight: 700,
                        marginBottom: "0.4rem",
                      }}
                    >
                      <FontAwesomeIcon icon={faBookReader} />
                      {formatLabel(course.courseTitle)}
                    </div>
                    <p style={{ margin: 0, color: "#64748b" }}>
                      {formatLabel(course.sectionName)}
                      {course.teacherName ? ` • ${course.teacherName}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      navigate("/student/courses", {
                        state: { offeringId: course.id },
                      })
                    }
                  >
                    Open Course <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <SummaryStat
                    icon={faFileAlt}
                    label="Pending assignments"
                    value={course.pendingAssignments}
                    tone="blue"
                  />
                  <SummaryStat
                    icon={faClock}
                    label="Pending quizzes"
                    value={course.pendingQuizzes}
                    tone="amber"
                  />
                  <SummaryStat
                    icon={faCalendarAlt}
                    label="Attendance"
                    value={`${course.attendancePercentage}%`}
                    tone="green"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "#0f172a" }}>Previous Courses</h3>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b" }}>
            Inactive or archived offerings.
          </p>
        </div>

        {summary.previousCourses.length === 0 ? (
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ margin: 0, color: "#64748b" }}>
              No previous courses found.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {summary.previousCourses.map((course) => (
              <div
                key={course.id}
                className="card"
                style={{
                  padding: "1rem 1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "center",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    <FontAwesomeIcon icon={faLayerGroup} />
                    {formatLabel(course.courseTitle)}
                  </div>
                  <p style={{ margin: "0.35rem 0 0", color: "#64748b" }}>
                    {formatLabel(course.sectionName)}
                    {course.teacherName ? ` • ${course.teacherName}` : ""}
                  </p>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "#475569",
                    fontSize: "0.95rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Archived
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricPill({
  icon,
  label,
  value,
}: {
  icon: typeof faBookReader;
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #dbeafe",
        borderRadius: "16px",
        padding: "0.9rem 1rem",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div>
          <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{label}</div>
          <div
            style={{ color: "#0f172a", fontSize: "1.3rem", fontWeight: 800 }}
          >
            {value}
          </div>
        </div>
        <FontAwesomeIcon icon={icon} style={{ color: "#2563eb" }} />
      </div>
    </div>
  );
}

function SummaryStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: typeof faFileAlt;
  label: string;
  value: string | number;
  tone: "blue" | "amber" | "green";
}) {
  const toneStyles = {
    blue: { background: "#eff6ff", color: "#1d4ed8" },
    amber: { background: "#fff7ed", color: "#c2410c" },
    green: { background: "#ecfdf5", color: "#047857" },
  }[tone];

  return (
    <div
      style={{
        borderRadius: "14px",
        padding: "1rem",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.35rem 0.6rem",
          borderRadius: "999px",
          ...toneStyles,
          fontSize: "0.85rem",
          fontWeight: 700,
        }}
      >
        <FontAwesomeIcon icon={icon} />
        {label}
      </div>
      <div
        style={{ marginTop: "0.85rem", fontSize: "1.4rem", fontWeight: 800 }}
      >
        {value}
      </div>
    </div>
  );
}
