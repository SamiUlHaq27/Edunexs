import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faClock, faUpload, faPlayCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function StudentCourses() {
  const [activeTab, setActiveTab] = useState<"assignments" | "quizzes" | "attendance" | "grades">("assignments");

  return (
    <div>
      <div className="toolbar">
        <h3>Mathematics 101</h3>
        <select className="auth-input" style={{ width: 'auto', minWidth: '200px' }}>
           <option>Mathematics 101</option>
           <option>Computer Science</option>
        </select>
      </div>

      <div className="tabs" style={{ maxWidth: '600px', margin: '0 0 1.5rem 0' }}>
        <button className={`tab ${activeTab === 'assignments' ? 'tab-active' : ''}`} onClick={() => setActiveTab("assignments")}>Assignments</button>
        <button className={`tab ${activeTab === 'quizzes' ? 'tab-active' : ''}`} onClick={() => setActiveTab("quizzes")}>Quizzes</button>
        <button className={`tab ${activeTab === 'attendance' ? 'tab-active' : ''}`} onClick={() => setActiveTab("attendance")}>Attendance</button>
        <button className={`tab ${activeTab === 'grades' ? 'tab-active' : ''}`} onClick={() => setActiveTab("grades")}>My Grades</button>
      </div>

      <div className="card settings-container">
        {activeTab === "assignments" && (
          <div>
            <h4 className="card-title">Pending Assignments</h4>
            <div className="activity-list">
              <div className="activity-item" style={{ alignItems: 'center' }}>
                <div style={{ marginRight: '1rem', color: '#f59e0b', fontSize: '1.2rem' }}><FontAwesomeIcon icon={faFileAlt} /></div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 'bold' }}>Algebra Chapter 3</div>
                   <div style={{ fontSize: '0.85rem', color: '#666' }}>Due: Tomorrow, 11:59 PM</div>
                </div>
                <Link to="/student/submit-assignment" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  <FontAwesomeIcon icon={faUpload} /> Submit
                </Link>
              </div>
            </div>
            {/* Completed section */}
          </div>
        )}

        {activeTab === "quizzes" && (
          <div>
            <h4 className="card-title">Available Quizzes</h4>
            <div className="activity-list">
              <div className="activity-item" style={{ alignItems: 'center' }}>
                <div style={{ marginRight: '1rem', color: '#6366f1', fontSize: '1.2rem' }}><FontAwesomeIcon icon={faClock} /></div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 'bold' }}>General Knowledge Quiz</div>
                   <div style={{ fontSize: '0.85rem', color: '#666' }}>3 Questions • 5 Mins</div>
                </div>
                <Link to="/student/attempt-quiz" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                   <FontAwesomeIcon icon={faPlayCircle} /> Start
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Attendance and Grades sections as previously defined */}
        {activeTab === "attendance" && (
           <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>Attendance Data Display</div>
        )}
        {activeTab === "grades" && (
           <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>Grades Data Display</div>
        )}
      </div>
    </div>
  );
}