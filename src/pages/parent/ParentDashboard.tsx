import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChild, faChartLine, faExclamationCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function ParentDashboard() {
  return (
    <div>
      <div className="parent-welcome-card">
        <div>
           <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Welcome, Mr. Rizwan</h2>
           <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Here is an overview of your child's progress.</p>
        </div>
        <button className="child-selector">
           <FontAwesomeIcon icon={faChild} />
           <span>Ahmad Raza (Class 10-A)</span>
        </button>
      </div>

      <div className="dashboard-grid-modern">
         <div className="stat-card-modern stat-green">
            <div className="stat-content">
               <div className="stat-value">92%</div>
               <div className="stat-label">Overall Attendance</div>
            </div>
            <div className="stat-icon-wrapper"><FontAwesomeIcon icon={faCheckCircle} /></div>
         </div>
         <div className="stat-card-modern stat-blue">
            <div className="stat-content">
               <div className="stat-value">A</div>
               <div className="stat-label">Avg. Grade</div>
            </div>
            <div className="stat-icon-wrapper"><FontAwesomeIcon icon={faChartLine} /></div>
         </div>
         <div className="stat-card-modern stat-orange">
            <div className="stat-content">
               <div className="stat-value">$500</div>
               <div className="stat-label">Fee Due</div>
            </div>
            <div className="stat-icon-wrapper"><FontAwesomeIcon icon={faExclamationCircle} /></div>
         </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
         <div className="chart-card">
            <h3 className="chart-title">Recent Updates</h3>
            <div className="activity-list">
               <div className="activity-item">
                  <div className="activity-time">Today</div>
                  <div className="activity-content">
                     <p><strong>Attendance:</strong> Ahmad was present today.</p>
                  </div>
               </div>
               <div className="activity-item">
                  <div className="activity-time">Yesterday</div>
                  <div className="activity-content">
                     <p><strong>Grade:</strong> Scored 18/20 in Algebra Quiz.</p>
                  </div>
               </div>
               <div className="activity-item">
                  <div className="activity-time">2 Days ago</div>
                  <div className="activity-content">
                     <p><strong>Fee:</strong> Monthly tuition invoice generated.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}