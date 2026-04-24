import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faClock,
  faUpload,
  faPlayCircle,
  faCheckCircle,
  faChalkboardTeacher,
  faCalendarAlt,
  faChartBar,
  faCommentDots,
  faArrowRight,
  faTimesCircle,
  faFileInvoiceDollar,
  faDownload,
  faBookReader,
} from "@fortawesome/free-solid-svg-icons";
import {
  studentAssignmentService,
  studentQuizService,
  studentAttendanceService,
  studentAssessmentService,
  studentOfferingService,
  type StudentOfferingSummary,
  type StudentAssignmentItem,
  type StudentQuizGradeItem,
  type StudentAttendanceItem,
} from "../../services";

type ActiveTab = "assignments" | "quizzes" | "attendance" | "grades";

interface StudentGradeItem {
  gradeId: number;
  gradeType: "assignment" | "quiz" | "custom";
  assessmentId: number | null;
  title: string | null;
  maxGrade: number | null;
  score: number;
  percentage: number | null;
  feedback: string | null;
  gradedAt: string;
  offering: {
    id: number | null;
    sectionName: string | null;
    courseName: string | null;
  };
}

const FEE_HISTORY = [
  { id: 1, month: "March 2026", amount: "5,000", dueDate: "10 Mar 2026", status: "Paid" },
  { id: 2, month: "February 2026", amount: "5,000", dueDate: "10 Feb 2026", status: "Paid" },
  { id: 3, month: "January 2026", amount: "5,000", dueDate: "10 Jan 2026", status: "Unpaid" },
];

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

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

export default function StudentCourses() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("assignments");
  const [offerings, setOfferings] = useState<StudentOfferingSummary[]>([]);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [offeringsError, setOfferingsError] = useState<string | null>(null);

  const [assignmentRows, setAssignmentRows] = useState<StudentAssignmentItem[]>([]);
  const [quizRows, setQuizRows] = useState<StudentQuizGradeItem[]>([]);
  const [attendanceRows, setAttendanceRows] = useState<StudentAttendanceItem[]>([]);
  const [gradeRows, setGradeRows] = useState<StudentGradeItem[]>([]);

  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isFeePage = location.pathname === "/student/fees";
  const maybeOfferingId = location.state?.offeringId;
  const selectedOfferingId =
    typeof maybeOfferingId === "number" && Number.isFinite(maybeOfferingId)
      ? maybeOfferingId
      : null;

  const selectedOffering = useMemo(
    () => offerings.find((item) => item.id === selectedOfferingId) || null,
    [offerings, selectedOfferingId],
  );

  useEffect(() => {
    if (isFeePage) {
      return;
    }

    const loadOfferings = async () => {
      try {
        setIsLoadingOfferings(true);
        setOfferingsError(null);
        const response = await studentOfferingService.getMyOfferings();
        setOfferings(response.data || []);
      } catch (error) {
        setOfferingsError(getErrorMessage(error));
        setOfferings([]);
      } finally {
        setIsLoadingOfferings(false);
      }
    };

    void loadOfferings();
  }, [isFeePage]);

  useEffect(() => {
    if (isFeePage || !selectedOfferingId) {
      return;
    }

    const loadCurrentTab = async () => {
      try {
        setTabLoading(true);
        setTabError(null);

        if (activeTab === "assignments") {
          const response = await studentAssignmentService.listAssignments({
            page: 1,
            size: 50,
            offeringId: selectedOfferingId,
            assessmentType: "assignment",
          });
          setAssignmentRows(response.data || []);
          return;
        }

        if (activeTab === "quizzes") {
          const response = await studentQuizService.listQuizGrades({
            page: 1,
            size: 50,
            offeringId: selectedOfferingId,
          });
          setQuizRows(response.data || []);
          return;
        }

        if (activeTab === "attendance") {
          const response = await studentAttendanceService.listAttendance({
            page: 1,
            size: 100,
            offeringId: selectedOfferingId,
          });
          setAttendanceRows(response.data || []);
          return;
        }

        const response = await studentAssessmentService.getGradeReport({
          page: 1,
          size: 50,
          offeringId: selectedOfferingId,
        });

        setGradeRows((response.data || []) as StudentGradeItem[]);
      } catch (error) {
        setTabError(getErrorMessage(error));
      } finally {
        setTabLoading(false);
      }
    };

    void loadCurrentTab();
  }, [activeTab, isFeePage, selectedOfferingId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, selectedOfferingId, isFeePage]);

  if (isFeePage) {
    return (
      <div className="student-course-page">
        <div className="student-hero-banner" style={{ background: "linear-gradient(135deg, #8365f0 0%, #8365f0 100%)" }}>
          <div className="hero-content">
            <h1 className="hero-title">Fee Management</h1>
            <p className="hero-subtitle">Check your payment history and pending dues.</p>
          </div>
          <div className="hero-progress-box" style={{ width: "auto" }}>
            <small style={{ color: "#6b7280" }}>Total Outstanding</small>
            <h2 style={{ margin: 0, color: "#ef4444" }}>Rs. 5,000</h2>
          </div>
        </div>

        <div className="tab-content-container" style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.8rem", color: "#111827" }}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} color="#059669" /> Fee History
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f3f4f6", color: "#6b7280", fontSize: "0.9rem" }}>
                  <th style={{ padding: "1rem" }}>Month</th>
                  <th style={{ padding: "1rem" }}>Amount</th>
                  <th style={{ padding: "1rem" }}>Due Date</th>
                  <th style={{ padding: "1rem" }}>Status</th>
                  <th style={{ padding: "1rem" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {FEE_HISTORY.map((fee) => (
                  <tr key={fee.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "1.2rem", fontWeight: "600", color: "#111827" }}>{fee.month}</td>
                    <td style={{ padding: "1.2rem" }}>Rs. {fee.amount}</td>
                    <td style={{ padding: "1.2rem", color: "#6b7280" }}>{fee.dueDate}</td>
                    <td style={{ padding: "1.2rem" }}>
                      <span className={`status-badge ${fee.status === "Paid" ? "badge-success" : "badge-danger"}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td style={{ padding: "1.2rem" }}>
                      {fee.status === "Paid" ? (
                        <button className="btn btn-sm" style={{ background: "#eff6ff", color: "#2563eb", border: "none" }}>
                          <FontAwesomeIcon icon={faDownload} /> Receipt
                        </button>
                      ) : (
                        <button className="btn btn-primary btn-sm">Pay Now</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedOfferingId) {
    return (
      <div className="student-course-page">
        <div
          className="student-header-card"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            marginBottom: "0.5rem",
            position: "relative",
            overflow: "hidden",
            minHeight: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="hero-content">
            <span className="badge badge-outline">Academic Workspace</span>
            <h1 className="hero-title" style={{ fontSize: "2rem", marginTop: "0.75rem" }}>My Courses</h1>
            <p className="hero-subtitle">Select a course to open assignments, quizzes, attendance, and grades.</p>
          </div>
          <FontAwesomeIcon
            icon={faBookReader}
            style={{
              position: "absolute",
              right: "18px",
              bottom: "-16px",
              fontSize: "7rem",
              opacity: 0.15,
              transform: "rotate(-12deg)",
            }}
          />
        </div>

        {isLoadingOfferings && <div className="card settings-container">Loading your enrolled offerings...</div>}
        {offeringsError && !isLoadingOfferings && (
          <div className="card settings-container" style={{ color: "#b91c1c" }}>
            {offeringsError}
          </div>
        )}
        {!isLoadingOfferings && !offeringsError && offerings.length === 0 && (
          <div className="card settings-container">No active offerings are assigned yet.</div>
        )}

        {!isLoadingOfferings && !offeringsError && offerings.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
                  gap: "0.95rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.8rem" }}>
                  <div className="task-icon" style={{ background: "#e0f2fe", color: "#0369a1", margin: 0 }}>
                    <FontAwesomeIcon icon={faChalkboardTeacher} />
                  </div>
                  <span className="status-badge" style={{ background: offering.isActive ? "#dcfce7" : "#fef2f2", color: offering.isActive ? "#166534" : "#b91c1c" }}>
                    {offering.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 0.45rem 0", fontSize: "1.15rem", color: "#111827" }}>
                    {offering.courseTitle || `Course ${offering.courseId}`}
                  </h4>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                    Instructor: {offering.teacherName || "Teacher"}
                  </p>
                </div>

                <div style={{ display: "grid", gap: "0.45rem", color: "#334155", fontSize: "0.9rem" }}>
                  <span>Section: {offering.sectionName || "N/A"}</span>
                  <span>Course Code: {offering.courseCode || "N/A"}</span>
                  <span>Offering ID: {offering.id}</span>
                </div>

                <button
                  type="button"
                  className="btn"
                  style={{
                    background: "#f8fafc",
                    color: "#1d4ed8",
                    border: "1px solid #dbeafe",
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "auto",
                    fontWeight: 700,
                  }}
                  onClick={() => navigate("/student/courses", { state: { offeringId: offering.id } })}
                >
                  Open Course
                  <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "0.5rem" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!selectedOffering) {
    return (
      <div className="card settings-container" style={{ padding: "1.5rem" }}>
        <p style={{ marginTop: 0, color: "#334155" }}>Selected offering was not found.</p>
        <button
          type="button"
          className="btn"
          onClick={() => navigate("/student/courses")}
          style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <div className="student-course-page">
      <div className="student-hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">{selectedOffering.courseTitle || "Course Workspace"}</h1>
          <p className="hero-subtitle">
            <FontAwesomeIcon icon={faChalkboardTeacher} style={{ marginRight: "8px" }} />
            {selectedOffering.teacherName || "Teacher"} • Section {selectedOffering.sectionName || "N/A"}
          </p>
        </div>
      </div>

      <div className="course-tabs">
        <button className={`course-tab ${activeTab === "assignments" ? "active" : ""}`} onClick={() => setActiveTab("assignments")}>
          <FontAwesomeIcon icon={faFileAlt} /> Assignments
        </button>
        <button className={`course-tab ${activeTab === "quizzes" ? "active" : ""}`} onClick={() => setActiveTab("quizzes")}>
          <FontAwesomeIcon icon={faClock} /> Quizzes
        </button>
        <button className={`course-tab ${activeTab === "attendance" ? "active" : ""}`} onClick={() => setActiveTab("attendance")}>
          <FontAwesomeIcon icon={faCalendarAlt} /> Attendance
        </button>
        <button className={`course-tab ${activeTab === "grades" ? "active" : ""}`} onClick={() => setActiveTab("grades")}>
          <FontAwesomeIcon icon={faChartBar} /> Grades
        </button>
      </div>

      <div className="tab-content-container">
        {tabLoading && <p style={{ color: "#64748b" }}>Loading {activeTab}...</p>}
        {tabError && !tabLoading && <p style={{ color: "#b91c1c" }}>{tabError}</p>}

        {!tabLoading && !tabError && activeTab === "assignments" && (
          <div>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#111827" }}>Assignments</h3>
            {assignmentRows.length === 0 ? <p style={{ color: "#6b7280" }}>No assignments found for this offering.</p> : (
              <div className="task-grid">
                {assignmentRows.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-icon bg-blue"><FontAwesomeIcon icon={faFileAlt} /></div>
                    <div className="task-details">
                      <h4>{task.title}</h4>
                      <p style={{ color: task.isOverdue ? "#ef4444" : "#6b7280", fontWeight: 500 }}>
                        Due: {formatDate(task.dueDate)} • {task.status.replace("_", " ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate("/student/submit-assignment", {
                          state: {
                            offeringId: selectedOffering.id,
                            assignmentId: task.id,
                            assignmentTitle: task.title,
                            dueDate: task.dueDate,
                            maxGrade: task.maxGrade,
                            instructions: task.description,
                          },
                        })
                      }
                    >
                      Upload <FontAwesomeIcon icon={faUpload} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!tabLoading && !tabError && activeTab === "quizzes" && (
          <div>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#111827" }}>Quizzes</h3>
            {quizRows.length === 0 ? <p style={{ color: "#6b7280" }}>No quizzes found for this offering.</p> : (
              <div className="task-grid">
                {quizRows.map((quiz) => (
                  <div key={quiz.quizId} className={`task-card ${quiz.bestScore !== null ? "completed" : ""}`}>
                    <div className={`task-icon ${quiz.bestScore !== null ? "bg-green" : "bg-purple"}`}>
                      <FontAwesomeIcon icon={quiz.bestScore !== null ? faCheckCircle : faClock} />
                    </div>
                    <div className="task-details">
                      <h4>{quiz.title}</h4>
                      <p style={{ color: "#6b7280", fontWeight: 500 }}>
                        Attempts: {quiz.attemptsUsed}/{quiz.maxAttempts} • Best: {quiz.bestScore ?? "-"}/{quiz.maxGrade}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate("/student/attempt-quiz", {
                          state: {
                            offeringId: selectedOffering.id,
                            quizId: quiz.quizId,
                            quizTitle: quiz.title,
                          },
                        })
                      }
                    >
                      Attempt <FontAwesomeIcon icon={faPlayCircle} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!tabLoading && !tabError && activeTab === "attendance" && (
          <div>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#111827" }}>Attendance</h3>
            {attendanceRows.length === 0 ? <p style={{ color: "#6b7280" }}>No attendance records found.</p> : (
              <div className="task-grid">
                {attendanceRows.map((att) => (
                  <div key={att.id} className="task-card" style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                      <div className={`task-icon ${att.status === "present" ? "bg-green" : "bg-red"}`} style={{ width: "45px", height: "45px", margin: 0 }}>
                        <FontAwesomeIcon icon={att.status === "present" ? faCheckCircle : faTimesCircle} />
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", color: "#111827" }}>{formatDate(att.attendanceDate)}</h4>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{att.periodSlot || "Class Slot"}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`status-badge ${att.status === "present" ? "badge-success" : "badge-danger"}`} style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
                        {att.status === "present" ? "Present" : "Absent"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!tabLoading && !tabError && activeTab === "grades" && (
          <div>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#111827" }}>Grades & Remarks</h3>
            {gradeRows.length === 0 ? <p style={{ color: "#6b7280" }}>No grades posted yet.</p> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
                {gradeRows.map((grade) => (
                  <div key={grade.gradeId} className="task-card" style={{ flexDirection: "column", alignItems: "flex-start", padding: "1.5rem", gap: "1rem", borderTop: "4px solid #8b5cf6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <span style={{ background: "#f5f3ff", color: "#8b5cf6", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", textTransform: "capitalize" }}>
                        {grade.gradeType}
                      </span>
                      <span style={{ color: "#10b981", fontSize: "1.25rem", fontWeight: 900 }}>
                        {grade.score}/{grade.maxGrade ?? 100}
                      </span>
                    </div>
                    <div style={{ width: "100%" }}>
                      <h4 style={{ margin: "0 0 0.8rem 0", color: "#111827", fontSize: "1.15rem" }}>{grade.title || "Assessment"}</h4>
                      <p style={{ margin: "0 0 0.8rem 0", color: "#6b7280", fontSize: "0.86rem" }}>
                        Graded: {formatDate(grade.gradedAt)}
                        {grade.percentage !== null ? ` • ${grade.percentage}%` : ""}
                      </p>
                      <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "8px", borderLeft: "3px solid #d1d5db", color: "#4b5563", fontSize: "0.9rem", width: "100%", boxSizing: "border-box" }}>
                        <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: "8px", color: "#9ca3af" }} />
                        <span style={{ fontStyle: "italic" }}>{grade.feedback || "No remarks provided."}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
