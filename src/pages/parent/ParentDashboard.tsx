import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChild,
  faChartLine,
  faExclamationCircle,
  faCheckCircle,
  faGraduationCap,
  faCalendarAlt,
  faMoneyBillWave,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { useOutletContext } from "react-router-dom";
import type { ParentOutletContext } from "./ParentLayout";
import { studentAssessmentService } from "../../services/student-assessment.service";
import { studentAttendanceService } from "../../services/student-attendance.service";
import { feeService, type FeeInvoice } from "../../services/fee.service";
import StripePaymentModal from "../../components/StripePaymentModal";

export default function ParentDashboard() {
  const { selectedStudentProfileId, linkedStudents } =
    useOutletContext<ParentOutletContext>();
  const [activeTab, setActiveTab] = React.useState<
    "grades" | "attendance" | "fees"
  >("grades");
  const [isLoading, setIsLoading] = React.useState(false);
  const [grades, setGrades] = React.useState<
    Array<{ assessment: string; score: string; date: string }>
  >([]);
  const [attendance, setAttendance] = React.useState<
    Array<{ date: string; status: string }>
  >([]);
  const [fees, setFees] = React.useState<FeeInvoice[]>([]);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = React.useState<
    FeeInvoice | null
  >(null);

  const selectedStudent = linkedStudents.find(
    (student) => student.studentProfileId === selectedStudentProfileId,
  );

  React.useEffect(() => {
    const loadDashboardData = async () => {
      if (!selectedStudentProfileId) return;

      setIsLoading(true);
      try {
        const [gradeRes, attendanceRes, feeRes] = await Promise.all([
          studentAssessmentService.getGradeReport({
            page: 1,
            size: 20,
            studentProfileId: selectedStudentProfileId,
          }),
          studentAttendanceService.listAttendance({
            page: 1,
            size: 30,
            studentProfileId: selectedStudentProfileId,
          }),
          feeService.getStudentFees({
            page: 1,
            size: 20,
            filters: { studentProfileId: selectedStudentProfileId },
          }),
        ]);

        setGrades(
          (gradeRes.data || []).map((row: any) => ({
            assessment: row.assessmentTitle || row.gradeType || "Assessment",
            score:
              row.score !== undefined && row.maxGrade !== undefined
                ? `${row.score}/${row.maxGrade}`
                : row.percentage !== undefined
                  ? `${row.percentage}%`
                  : String(row.score ?? "-"),
            date: row.gradedAt
              ? new Date(row.gradedAt).toLocaleDateString()
              : "-",
          })),
        );

        setAttendance(
          (attendanceRes.data || []).map((row) => ({
            date: row.attendanceDate,
            status:
              row.status?.toLowerCase() === "present" ? "Present" : "Absent",
          })),
        );

        setFees(feeRes.data || []);
      } catch {
        // If endpoint fails, keep graceful fallback data so dashboard stays usable.
        setGrades([]);
        setAttendance([]);
        setFees([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, [selectedStudentProfileId]);

  const handlePaymentSuccess = () => {
    setSelectedFeeForPayment(null);
    if (!selectedStudentProfileId) return;

    void feeService
      .getStudentFees({
        page: 1,
        size: 20,
        filters: { studentProfileId: selectedStudentProfileId },
      })
      .then((feeRes) => {
        setFees(feeRes.data || []);
      })
      .catch(() => {
        setFees([]);
      });
  };

  if (!selectedStudentProfileId || !selectedStudent) {
    return (
      <div className="parent-empty-state">
        <h3>No linked student selected</h3>
        <p>Select a student from the left sidebar to view details.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="parent-welcome-card">
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Welcome Parent</h2>
          <p style={{ opacity: 0.9, marginTop: "0.5rem" }}>
            Overview for {selectedStudent.label}
          </p>
        </div>
        <div className="child-selector">
          <FontAwesomeIcon icon={faChild} />
          <span>{selectedStudent.label}</span>
        </div>
      </div>

      <div className="dashboard-grid-modern">
        <div className="stat-card-modern stat-green">
          <div className="stat-content">
            <div className="stat-value">
              {attendance.length
                ? `${Math.round(
                    (attendance.filter((x) => x.status === "Present").length /
                      attendance.length) *
                      100,
                  )}%`
                : "--"}
            </div>
            <div className="stat-label">Overall Attendance</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        </div>
        <div className="stat-card-modern stat-blue">
          <div className="stat-content">
            <div className="stat-value">
              {grades.length ? `${grades.length}` : "--"}
            </div>
            <div className="stat-label">Average Grade</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
        </div>
        <div className="stat-card-modern stat-orange">
          <div className="stat-content">
            <div className="stat-value">
              {fees.find((f) => f.status !== "PAID")
                ? `Rs ${fees.find((f) => f.status !== "PAID")?.amount ?? 0}`
                : "Rs 0"}
            </div>
            <div className="stat-label">Current Fee Due</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faExclamationCircle} />
          </div>
        </div>
      </div>

      <div className="parent-main-tabs">
        <button
          type="button"
          className={`btn-tab-modern ${activeTab === "grades" ? "active" : ""}`}
          onClick={() => setActiveTab("grades")}
        >
          <FontAwesomeIcon icon={faGraduationCap} /> Grades
        </button>
        <button
          type="button"
          className={`btn-tab-modern ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <FontAwesomeIcon icon={faCalendarAlt} /> Attendance
        </button>
        <button
          type="button"
          className={`btn-tab-modern ${activeTab === "fees" ? "active" : ""}`}
          onClick={() => setActiveTab("fees")}
        >
          <FontAwesomeIcon icon={faMoneyBillWave} /> Fees
        </button>
      </div>

      <div className="chart-card parent-main-panel">
        {isLoading && <p>Loading data...</p>}
        {activeTab === "grades" && (
          <>
            <h3 className="chart-title">Recent Grades</h3>
            <table className="modern-grades-table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(grades.length
                  ? grades
                  : [{ assessment: "No records", score: "-", date: "-" }]
                ).map((row) => (
                  <tr key={`${row.assessment}-${row.date}`}>
                    <td>{row.assessment}</td>
                    <td>{row.score}</td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "attendance" && (
          <>
            <h3 className="chart-title">Attendance Timeline</h3>
            <div className="activity-list">
              {(attendance.length
                ? attendance
                : [{ date: "-", status: "No records" }]
              ).map((row) => (
                <div
                  className="activity-item"
                  key={`${row.date}-${row.status}`}
                >
                  <div className="activity-time">{row.date}</div>
                  <div className="activity-content">
                    <p>
                      <strong>Status:</strong> {row.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "fees" && (
          <>
            <h3 className="chart-title">Fee Details</h3>
            <table className="modern-grades-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td>-</td>
                    <td>Rs 0</td>
                    <td>No records</td>
                    <td>-</td>
                  </tr>
                ) : (
                  fees.map((fee) => (
                    <tr key={fee.id}>
                      <td>
                        {fee.dueDate
                          ? new Date(fee.dueDate).toLocaleDateString(undefined, {
                              month: "long",
                              year: "numeric",
                            })
                          : fee.title}
                      </td>
                      <td>{`Rs ${fee.amount}`}</td>
                      <td>{fee.status}</td>
                      <td>
                        {fee.status !== "PAID" ? (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              border: "none",
                            }}
                            onClick={() => setSelectedFeeForPayment(fee)}
                          >
                            <FontAwesomeIcon icon={faCreditCard} /> Pay
                          </button>
                        ) : (
                          <span style={{ color: "#16a34a", fontWeight: 600 }}>
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>

      {selectedFeeForPayment && (
        <StripePaymentModal
          isOpen={!!selectedFeeForPayment}
          feeId={selectedFeeForPayment.id}
          amount={selectedFeeForPayment.amount}
          invoiceNo={selectedFeeForPayment.invoiceNo}
          title={selectedFeeForPayment.title}
          onClose={() => setSelectedFeeForPayment(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
