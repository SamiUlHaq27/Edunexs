import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faChalkboardTeacher,
  faUserShield,
  faBookOpen,
  faEllipsisH,
  faBell,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner-dashboard.css";
import { institutionService } from "../../services/institution.service";
import { courseService } from "../../services/course.service";
import { Institution } from "../../types";

// --- Bar Chart: Monthly Trends ---
const AttendanceChart = () => {
  const data = [65, 80, 45, 90, 60, 75, 50, 85, 95, 70];
  const max = 100;
  const steps = [0, 25, 50, 75, 100];
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
  ];

  return (
    <div style={{ width: "100%" }}>
      <div className="chart-wrapper">
        <div className="chart-y-axis">
          {steps.map((step) => (
            <span key={step}>{step}%</span>
          ))}
        </div>
        <div className="chart-content">
          <div className="chart-grid-lines">
            {steps.map((_, i) => (
              <div key={i} className="grid-line"></div>
            ))}
          </div>
          <div className="chart-bars-container">
            {data.map((value, index) => (
              <div key={index} className="chart-bar-group">
                <div
                  className="chart-bar"
                  style={{ height: `${(value / max) * 100}%` }}
                  title={`${value}%`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="chart-x-axis">
        {labels.map((label, index) => (
          <span key={index} className="x-axis-label">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Donut Chart: Breakdown ---
const AttendanceBreakdown = () => {
  return (
    <div className="donut-wrapper">
      <h4
        style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#6b7280" }}
      >
        Average Daily Status
      </h4>
      <div className="donut-chart">
        <div className="donut-inner">
          <span
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a8a" }}
          >
            92%
          </span>
          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>Present</span>
        </div>
      </div>
      <div className="donut-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "#1e3a8a" }}></div>
          <span>Present (75%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: "#ef4444" }}></div>
          <span>Absent (25%)</span>
        </div>
      </div>
    </div>
  );
};

const EventCalendar = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeDate = 9; // Updated active date

  return (
    <div>
      <div className="calendar-title-box">
        <span>DECEMBER</span>
        <span>2025</span>
      </div>
      <div className="calendar-grid">
        {days.map((day) => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}
        {/* Dec 1, 2025 is a Monday, so 1 empty slot for Sunday */}
        <div />
        {dates.map((date) => (
          <div
            key={date}
            className={`calendar-day ${date === activeDate ? "active" : ""}`}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function OwnerDashboard() {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [courseCount, setCourseCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        const [institutionData, coursesData] = await Promise.all([
          institutionService.getMyInstitution(),
          courseService.getCourses({ page: 1, size: 1, filters: {} }),
        ]);

        if (!mounted) return;
        setInstitution(institutionData);
        setCourseCount(coursesData.total ?? coursesData.data?.length ?? 0);
        // Do not fetch admins list here since institution admins cannot access it
        setAdminCount(0);
      } catch (_error) {
        if (!mounted) return;
        setInstitution(null);
        setAdminCount(0);
        setCourseCount(0);
      }
    };

    void fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="owner-dashboard-container">
      <div style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginBottom: "0.25rem", fontSize: "1.4rem" }}>
          {institution?.name || "Owner Dashboard"}
        </h2>
        <p style={{ color: "#6b7280", margin: 0 }}>
          {institution
            ? `${institution.city}, ${institution.country}`
            : "Connect your institution to see live metrics."}
        </p>
      </div>

      {/* 1. Summary Cards */}
      <div className="summary-cards-row">
        <div className="summary-card">
          <div>
            <p className="card-title">Total Students</p>
            <h3 className="card-value">1,500</h3>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "#dbeafe", color: "#2563eb" }}
          >
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
        </div>

        <div className="summary-card">
          <div>
            <p className="card-title">Total Courses</p>
            <h3 className="card-value">{courseCount}</h3>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "#fef3c7", color: "#d97706" }}
          >
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
        </div>

        <div className="summary-card">
          <div>
            <p className="card-title">Total Teachers</p>
            <h3 className="card-value">90</h3>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "#fce7f3", color: "#db2777" }}
          >
            <FontAwesomeIcon icon={faChalkboardTeacher} />
          </div>
        </div>

        <div className="summary-card">
          <div>
            <p className="card-title">Inst. Admins</p>
            <h3 className="card-value">{adminCount}</h3>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "#d1fae5", color: "#059669" }}
          >
            <FontAwesomeIcon icon={faUserShield} />
          </div>
        </div>
      </div>

      {/* 2. Attendance Section (Bar + Donut) */}
      <div className="attendance-section">
        <h3
          className="card-title"
          style={{
            marginBottom: "1.5rem",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          Monthly Student Attendance
        </h3>
        <div className="attendance-charts-split">
          <AttendanceChart />
          <div
            style={{ borderLeft: "1px solid #e5e7eb", paddingLeft: "1.5rem" }}
          >
            <AttendanceBreakdown />
          </div>
        </div>
      </div>

      {/* 3. Bottom Row */}
      <div className="bottom-row">
        {/* Recent Activities */}
        <div className="card" style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3
              className="card-title"
              style={{ marginBottom: 0, fontWeight: "bold" }}
            >
              Recent Activities
            </h3>
            <FontAwesomeIcon
              icon={faEllipsisH}
              color="var(--color-text-secondary)"
              cursor="pointer"
            />
          </div>

          <div className="activity-list">
            <div className="activity-item" style={{ alignItems: "center" }}>
              <div
                className="summary-icon-container"
                style={{
                  width: 40,
                  height: 40,
                  background: "#e0f2fe",
                  color: "#0284c7",
                  fontSize: "1rem",
                }}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div style={{ flex: 1, paddingLeft: "1rem" }}>
                <p style={{ fontWeight: "600", margin: 0 }}>
                  Attendance Marked
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                  }}
                >
                  Class 10-A • Physics
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                10 min ago
              </span>
            </div>

            <div className="activity-item" style={{ alignItems: "center" }}>
              <div
                className="summary-icon-container"
                style={{
                  width: 40,
                  height: 40,
                  background: "#dcfce7",
                  color: "#16a34a",
                  fontSize: "1rem",
                }}
              >
                <FontAwesomeIcon icon={faUserGraduate} />
              </div>
              <div style={{ flex: 1, paddingLeft: "1rem" }}>
                <p style={{ fontWeight: "600", margin: 0 }}>
                  New Student Enrolled
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                  }}
                >
                  Ali Khan • Class 9-B
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                1 hour ago
              </span>
            </div>

            <div className="activity-item" style={{ alignItems: "center" }}>
              <div
                className="summary-icon-container"
                style={{
                  width: 40,
                  height: 40,
                  background: "#fef3c7",
                  color: "#d97706",
                  fontSize: "1rem",
                }}
              >
                <FontAwesomeIcon icon={faBell} />
              </div>
              <div style={{ flex: 1, paddingLeft: "1rem" }}>
                <p style={{ fontWeight: "600", margin: 0 }}>
                  Exam Schedule Published
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                  }}
                >
                  Mid-Term Fall 2025
                </p>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Yesterday
              </span>
            </div>
          </div>
        </div>

        {/* Event Calendar */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <h3 className="card-title" style={{ marginBottom: 0 }}>
              Event Calendar
            </h3>
            <FontAwesomeIcon
              icon={faEllipsisH}
              color="var(--color-text-secondary)"
              cursor="pointer"
            />
          </div>
          <EventCalendar />
        </div>
      </div>
    </div>
  );
}
