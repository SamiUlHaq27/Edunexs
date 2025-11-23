import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faChalkboardTeacher,
  faBookOpen,
  faChalkboard,
  faArrowUp,
  faEllipsisH
} from "@fortawesome/free-solid-svg-icons";

// --- Custom Simple Chart Components (No external lib needed) ---

const BarChart = () => {
  // Mock Data: Weekly Attendance
  const data = [65, 59, 80, 81, 56, 90, 78];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const max = Math.max(...data);

  return (
    <div style={{ width: "100%", height: "200px", display: "flex", alignItems: "flex-end", gap: "12px" }}>
      {data.map((value, idx) => (
        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "100%",
              height: `${(value / max) * 100}%`,
              backgroundColor: "#0066ff",
              borderRadius: "4px 4px 0 0",
              opacity: 0.8,
              transition: "height 0.3s ease"
            }}
          />
          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{labels[idx]}</span>
        </div>
      ))}
    </div>
  );
};

const LineChart = () => {
  // Mock Data: Monthly Enrollment
  // Points logic: 100 wide viewbox, map data to y coordinates
  const data = [30, 45, 40, 60, 75, 70, 90];
  const max = 100;
  const points = data
    .map((val, idx) => `${idx * (100 / (data.length - 1))},${100 - val}`)
    .join(" ");

  return (
    <div style={{ width: "100%", height: "200px", position: "relative" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: 'visible' }}>
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />
        
        {/* The Graph Line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          points={points}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Dots */}
        {data.map((val, idx) => (
           <circle 
             key={idx}
             cx={idx * (100 / (data.length - 1))}
             cy={100 - val}
             r="1.5"
             fill="#fff"
             stroke="#10b981"
             strokeWidth="0.5"
             vectorEffect="non-scaling-stroke" // keeps dots round
           />
        ))}
      </svg>
      {/* X-Axis Labels positioned absolutely */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
         {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(m => (
            <span key={m} style={{fontSize: '0.7rem', color: '#9ca3af'}}>{m}</span>
         ))}
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

export default function OwnerDashboard(): React.JSX.Element {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
          Dashboard Overview
        </h2>
        <p style={{ color: "#6b7280" }}>Welcome back! Here's what's happening at your institution today.</p>
      </div>

      {/* 1. Stats Grid */}
      <div className="dashboard-grid-modern">
        <div className="stat-card-modern stat-blue">
          <div className="stat-content">
            <div className="stat-value">1,250</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
        </div>

        <div className="stat-card-modern stat-green">
          <div className="stat-content">
            <div className="stat-value">48</div>
            <div className="stat-label">Total Teachers</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
          </div>
        </div>

        <div className="stat-card-modern stat-purple">
          <div className="stat-content">
            <div className="stat-value">12</div>
            <div className="stat-label">Active Courses</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
        </div>

        <div className="stat-card-modern stat-orange">
          <div className="stat-content">
            <div className="stat-value">24</div>
            <div className="stat-label">Active Classes</div>
          </div>
          <div className="stat-icon-wrapper">
            <FontAwesomeIcon icon={faChalkboard} />
          </div>
        </div>
      </div>

      {/* 2. Charts & Activity Grid */}
      <div className="charts-grid">
        
        {/* Main Chart Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {/* Attendance Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Weekly Attendance</h3>
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>View Report</button>
            </div>
            <BarChart />
          </div>

           {/* Growth Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Student Enrollment Growth</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <FontAwesomeIcon icon={faArrowUp} /> 12% vs last month
              </div>
            </div>
            <LineChart />
          </div>
        </div>

        {/* Side Column: Activity & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          
          {/* Quick Stats / Gender Dist */}
          <div className="chart-card">
            <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Demographics</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', position: 'relative' }}>
              {/* Simple CSS Donut Chart */}
              <div style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: 'conic-gradient(#0066ff 0% 60%, #e5e7eb 60% 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: '100px', height: '100px', background: 'white', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>60%</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ width: 10, height: 10, background: '#0066ff', borderRadius: '50%' }}></span> Male
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                 <span style={{ width: 10, height: 10, background: '#e5e7eb', borderRadius: '50%' }}></span> Female
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="chart-card" style={{ flexGrow: 1 }}>
            <div className="chart-header">
               <h3 className="chart-title">Recent Activity</h3>
               <FontAwesomeIcon icon={faEllipsisH} style={{ color: '#9ca3af', cursor: 'pointer' }} />
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-time">2 mins ago</div>
                <div className="activity-content">
                  <p><strong>Ali Khan</strong> was added as a Teacher</p>
                  <span className="activity-sub">By Admin One</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-time">1 hour ago</div>
                <div className="activity-content">
                  <p>New Class <strong>CS101-A</strong> created</p>
                  <span className="activity-sub">Computer Science Dept</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-time">3 hours ago</div>
                <div className="activity-content">
                  <p><strong>15 Students</strong> added to Batch 2024</p>
                  <span className="activity-sub">Bulk Import</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}