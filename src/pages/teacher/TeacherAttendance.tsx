import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faChartPie,
  faSearch,
  faArrowLeft,
  faSave,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  teacherAttendanceService,
  type AttendanceStatus,
} from "../../services/teacher-attendance.service";

interface TeacherAttendanceProps {
  offeringId?: number;
}

interface StudentAttendanceState {
  studentProfileId: number;
  studentName: string;
  rollNo: string;
  status: AttendanceStatus;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export default function TeacherAttendance({
  offeringId,
}: TeacherAttendanceProps) {
  const [view, setView] = useState<"mark" | "report">("mark");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [periodSlot, setPeriodSlot] = useState("Morning");
  const [students, setStudents] = useState<StudentAttendanceState[]>([]);

  const canUseApi = useMemo(() => Number.isFinite(offeringId), [offeringId]);

  const loadAttendanceReport = async () => {
    if (!offeringId) {
      setStudents([]);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const report = await teacherAttendanceService.getAttendanceReport({
        offeringId,
      });

      const mapped: StudentAttendanceState[] = (report.data || []).map(
        (row) => ({
          studentProfileId: row.studentProfileId,
          studentName: row.studentName || "Student",
          rollNo: row.rollNo || "N/A",
          status: "present",
          presentCount: row.presentCount,
          absentCount: row.absentCount,
          attendancePercentage: row.attendancePercentage,
        }),
      );

      setStudents(mapped);
    } catch (error) {
      console.error("Failed to load attendance report", error);
      setErrorMessage("Could not load attendance data.");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAttendanceReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringId]);

  const updateStatus = (id: number, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.studentProfileId === id
          ? { ...student, status: newStatus }
          : student,
      ),
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;

  const handleSaveAttendance = async () => {
    if (!offeringId) return;

    if (!attendanceDate || !periodSlot.trim()) {
      setErrorMessage("Please set attendance date and period slot.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await teacherAttendanceService.markAttendance({
        offeringId,
        attendanceDate,
        periodSlot: periodSlot.trim(),
        records: students.map((student) => ({
          studentProfileId: student.studentProfileId,
          status: student.status,
        })),
      });

      await loadAttendanceReport();
      setView("report");
    } catch (error) {
      console.error("Failed to save attendance", error);
      setErrorMessage("Failed to save attendance records.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canUseApi) {
    return (
      <div className="card settings-container" style={{ padding: "1.2rem" }}>
        <p style={{ marginTop: 0 }}>Select a course to manage attendance.</p>
        <Link
          to="/teacher/courses"
          style={{ color: "#1d4ed8", fontWeight: 700 }}
        >
          Open My Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      {errorMessage && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "0.7rem 0.9rem",
            marginBottom: "1rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      {view === "mark" ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Mark Attendance
              </h2>
              <p style={{ color: "#64748b", marginTop: "4px" }}>
                Mark and submit today&apos;s class attendance.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSaveAttendance}
              disabled={isSubmitting || isLoading}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FontAwesomeIcon icon={faSave} />{" "}
              {isSubmitting ? "Saving..." : "Save Attendance"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faSearch}
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Search student..."
                className="auth-input"
                style={{ paddingLeft: "45px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <input
              type="date"
              className="auth-input"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />

            <input
              type="text"
              className="auth-input"
              placeholder="Period (e.g. Morning)"
              value={periodSlot}
              onChange={(e) => setPeriodSlot(e.target.value)}
            />

            <button
              onClick={() => setView("report")}
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#64748b",
              }}
            >
              <FontAwesomeIcon
                icon={faChartPie}
                style={{ marginRight: "8px" }}
              />
              Reports
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div className="card" style={{ padding: "0.8rem 1rem" }}>
              Present:{" "}
              <strong style={{ color: "#059669" }}>{presentCount}</strong>
            </div>
            <div className="card" style={{ padding: "0.8rem 1rem" }}>
              Absent:{" "}
              <strong style={{ color: "#dc2626" }}>{absentCount}</strong>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}
          >
            {isLoading && <div>Loading students...</div>}
            {!isLoading &&
              filteredStudents.map((student) => (
                <div
                  key={student.studentProfileId}
                  style={{
                    background: "white",
                    padding: "0.9rem 1rem",
                    borderRadius: "12px",
                    border: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h4
                      style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}
                    >
                      {student.studentName}
                    </h4>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.8rem",
                        color: "#64748b",
                      }}
                    >
                      Roll: {student.rollNo}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() =>
                        updateStatus(student.studentProfileId, "present")
                      }
                      style={{
                        border: "none",
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background:
                          student.status === "present" ? "#10b981" : "#f1f5f9",
                        color:
                          student.status === "present" ? "white" : "#64748b",
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      onClick={() =>
                        updateStatus(student.studentProfileId, "absent")
                      }
                      style={{
                        border: "none",
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background:
                          student.status === "absent" ? "#ef4444" : "#f1f5f9",
                        color:
                          student.status === "absent" ? "white" : "#64748b",
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
              ))}

            {!isLoading && !filteredStudents.length && (
              <div className="card" style={{ padding: "1rem" }}>
                No students found for this offering.
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <button
              onClick={() => setView("mark")}
              style={{
                background: "none",
                color: "#3b82f6",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Marking
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FontAwesomeIcon icon={faCalendarAlt} color="#3b82f6" />
              <span style={{ fontWeight: 700 }}>{attendanceDate}</span>
            </div>
          </div>

          <div
            className="card"
            style={{ borderRadius: "12px", overflow: "hidden" }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px" }}>
                    Student
                  </th>
                  <th style={{ textAlign: "left", padding: "10px" }}>
                    Roll No
                  </th>
                  <th style={{ textAlign: "left", padding: "10px" }}>
                    Present
                  </th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Absent</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.studentProfileId}>
                    <td
                      style={{
                        padding: "10px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      {student.studentName}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      {student.rollNo}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      {student.presentCount}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      {student.absentCount}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      {student.attendancePercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
