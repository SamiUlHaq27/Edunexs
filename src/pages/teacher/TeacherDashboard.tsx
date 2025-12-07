import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser,
  faUserGraduate,
  faFileSignature,
  faClock,
  faCheckCircle,
  faEllipsisH
} from "@fortawesome/free-solid-svg-icons";

// Reusing the simple BarChart from OwnerDashboard but simplified for class attendance
const ClassAttendanceChart = () => {
  const data = [90, 85, 92, 88, 95]; // Mon-Fri
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const max = 100;

  return (
    <div style={{ width: "100%", height: "180px", display: "flex", alignItems: "flex-end", gap: "12px" }}>
      {data.map((value, idx) => (
        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "100%",
              height: `${(value / max) * 100}%`,
              backgroundColor: "#10b981", // Green for attendance
              borderRadius: "4px 4px 0 0",
              opacity: 0.8,
            }}
          />
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{labels[idx]}</span>
        </div>
      ))}
    </div>
  );
};

export default function TeacherDashboard() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
          Teacher Dashboard
        </h2>
        <p style={{ color: "#6b7280" }}>Good Morning, Mr. Teacher! You have 3 classes today.</p>
      </div>

      {/* 1. Stats Grid - Tailored for Teachers */}
      <div className="dashboard-grid-modern">
        <div className="stat-card-modern stat-blue">
          <div className="stat-content">
            <div className="stat-value">4</div>
            <div className="stat-label">My Classes</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faChalkboardUser} />
          </div>
        </div>

        <div className="stat-card-modern stat-green">
          <div className="stat-content">
            <div className="stat-value">120</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
        </div>

        <div className="stat-card-modern stat-orange">
          <div className="stat-content">
            <div className="stat-value">15</div>
            <div className="stat-label">Pending Grading</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faFileSignature} />
          </div>
        </div>

        <div className="stat-card-modern stat-purple">
          <div className="stat-content">
            <div className="stat-value">10:00</div>
            <div className="stat-label">Next Class</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faClock} />
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="charts-grid">
        
        {/* Left Column: Schedule & Attendance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          
          {/* Today's Schedule */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Today's Schedule</h3>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Nov 30, 2025</span>
            </div>
            <div className="activity-list">
              {/* Schedule Item 1 */}
              <div className="activity-item" style={{ alignItems: 'center' }}>
                <div style={{ minWidth: '80px', fontWeight: 'bold', color: '#111827' }}>09:00 AM</div>
                <div style={{ width: '4px', height: '40px', background: '#e5e7eb', borderRadius: '2px', marginRight: '1rem' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>Mathematics 101</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Class 10-A • Room 301</div>
                </div>
                <span className="status-badge status-active">Done</span>
              </div>

              {/* Schedule Item 2 */}
              <div className="activity-item" style={{ alignItems: 'center' }}>
                <div style={{ minWidth: '80px', fontWeight: 'bold', color: '#111827' }}>10:30 AM</div>
                <div style={{ width: '4px', height: '40px', background: '#0066ff', borderRadius: '2px', marginRight: '1rem' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>Algebra II</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Class 9-B • Room 302</div>
                </div>
                <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Start</button>
              </div>

              {/* Schedule Item 3 */}
              <div className="activity-item" style={{ alignItems: 'center' }}>
                <div style={{ minWidth: '80px', fontWeight: 'bold', color: '#111827' }}>01:00 PM</div>
                <div style={{ width: '4px', height: '40px', background: '#f59e0b', borderRadius: '2px', marginRight: '1rem' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>Geometry Basics</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Class 8-A • Room 104</div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Upcoming</span>
              </div>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="chart-card">
             <div className="chart-header">
              <h3 className="chart-title">Class Attendance Trends</h3>
            </div>
            <ClassAttendanceChart />
          </div>

        </div>

        {/* Right Column: Pending Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
           
           <div className="chart-card" style={{ flexGrow: 1 }}>
             <div className="chart-header">
               <h3 className="chart-title">Pending Tasks</h3>
               <FontAwesomeIcon icon={faEllipsisH} style={{ color: '#9ca3af', cursor: 'pointer' }} />
             </div>
             
             <div className="activity-list">
               <div className="activity-item">
                  <div className="stat-icon-wrapper" style={{ width: '36px', height: '36px', fontSize: '1rem', background: '#fee2e2', color: '#ef4444' }}>
                    <FontAwesomeIcon icon={faFileSignature} />
                  </div>
                  <div className="activity-content">
                    <p style={{ fontWeight: '600' }}>Grade "Mid-Term Math"</p>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>15 Submissions pending</p>
                  </div>
                  <button className="btn" style={{ padding: '4px 8px', height: 'fit-content' }}>Review</button>
               </div>

               <div className="activity-item">
                  <div className="stat-icon-wrapper" style={{ width: '36px', height: '36px', fontSize: '1rem', background: '#ffedd5', color: '#f97316' }}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <div className="activity-content">
                    <p style={{ fontWeight: '600' }}>Mark Attendance (9-B)</p>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>For today's class</p>
                  </div>
                  <button className="btn" style={{ padding: '4px 8px', height: 'fit-content' }}>Mark</button>
               </div>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
}