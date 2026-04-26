import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBook, faUserCircle, faGraduationCap, 
  faFileDownload, faAngleRight, faCalendarAlt, faFileAlt, faArrowLeft,
  faCheckCircle, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

export default function ParentCourses() {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"grades" | "attendance">("grades");

  const courses = [
    { id: 1, name: "Mathematics 101", teacher: "Mr. Rizwan Khan", grade: "A", progress: 85, color: "#4338ca" },
    { id: 2, name: "Physics", teacher: "Dr. Ali Raza", grade: "B+", progress: 70, color: "#065f46" },
    { id: 3, name: "English Literature", teacher: "Ms. Sarah", grade: "A-", progress: 92, color: "#9333ea" },
    { id: 4, name: "Computer Science", teacher: "Mr. Kamran", grade: "A", progress: 88, color: "#2563eb" }
  ];

  const gradesData = [
    { assessment: "Mid-Term Exam", date: "Oct 15, 2024", score: "85/100", remarks: "Good performance", color: "#6366f1" },
    { assessment: "Quiz 1", date: "Nov 01, 2024", score: "9/10", remarks: "-", color: "#10b981" },
    { assessment: "Assignment 3", date: "Nov 10, 2024", score: "18/20", remarks: "Late submission", color: "#f59e0b" }
  ];

  if (selectedCourse) {
    return (
      <div className="admin-page-container parent-courses-view detail-view">
        <button 
          className="btn-back-modern" 
          onClick={() => { setSelectedCourse(null); setActiveTab("grades"); }} 
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#4338ca', fontWeight: 'bold' }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Courses
        </button>
        
        <div className="premium-grades-box">
          <div className="grades-header">
            <div className="header-subject">
               <div className="subject-icon" style={{ backgroundColor: `${selectedCourse.color}15`, color: selectedCourse.color, padding: '10px', borderRadius: '8px' }}>
                 <FontAwesomeIcon icon={faBook} />
               </div>
               <h3 style={{ margin: 0, marginLeft: '10px' }}>{selectedCourse.name} Details</h3>
            </div>
            <div className="action-buttons-group" style={{ display: 'flex', gap: '10px' }}>
              <button 
                className={`btn-tab-modern ${activeTab === 'grades' ? 'active' : ''}`}
                onClick={() => setActiveTab("grades")}
              >
                <FontAwesomeIcon icon={faGraduationCap} /> <span>Grades</span>
              </button>
              <button 
                className={`btn-tab-modern ${activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveTab("attendance")}
              >
                <FontAwesomeIcon icon={faCalendarAlt} /> <span>Attendance</span>
              </button>
            </div>
          </div>

          <div className="tab-content-area" style={{ marginTop: '20px' }}>
            {activeTab === "grades" ? (
              <div className="grades-table-wrapper">
                <table className="modern-grades-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px' }}><FontAwesomeIcon icon={faFileAlt} /> Assessment</th>
                      <th style={{ padding: '12px' }}><FontAwesomeIcon icon={faCalendarAlt} /> Date</th>
                      <th style={{ padding: '12px' }}><FontAwesomeIcon icon={faGraduationCap} /> Score</th>
                      <th style={{ padding: '12px' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradesData.map((grade, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{grade.assessment}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{grade.date}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: grade.color, fontWeight: 'bold' }}>{grade.score}</span>
                          <div style={{ height: '4px', width: '60px', background: '#eee', borderRadius: '2px', marginTop: '4px' }}>
                            <div style={{ height: '100%', width: '80%', background: grade.color, borderRadius: '2px' }}></div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: '#888', fontSize: '0.9rem' }}>{grade.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="attendance-record-view">
                <div className="att-stats-summary" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                   {/* Only Present and Absent Cards */}
                   <div style={{ flex: 1, padding: '15px', background: '#ecfdf5', borderRadius: '12px', textAlign: 'center' }}>
                      <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981', fontSize: '1.5rem' }} />
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#065f46', marginTop: '5px' }}>26</div>
                      <div style={{ fontSize: '0.8rem', color: '#059669' }}>Present</div>
                   </div>
                   <div style={{ flex: 1, padding: '15px', background: '#fef2f2', borderRadius: '12px', textAlign: 'center' }}>
                      <FontAwesomeIcon icon={faTimesCircle} style={{ color: '#ef4444', fontSize: '1.5rem' }} />
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#991b1b', marginTop: '5px' }}>01</div>
                      <div style={{ fontSize: '0.8rem', color: '#dc2626' }}>Absent</div>
                   </div>
                </div>
                
                <div className="att-history-list">
                   <h4 style={{ marginBottom: '10px' }}>Recent Attendance History</h4>
                   {[
                     { date: "March 27, 2026", status: "Present", color: "#10b981" },
                     { date: "March 26, 2026", status: "Present", color: "#10b981" },
                     { date: "March 25, 2026", status: "Present", color: "#10b981" }
                   ].map((item, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                        <span>{item.date}</span>
                        <span style={{ color: item.color, fontWeight: 'bold' }}>{item.status}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container parent-courses-view">
      <div className="courses-header-section">
        <div>
          <h3 className="card-title">Enrolled Courses & Grades</h3>
          <p className="sub-header-text">Track academic performance and subject progress.</p>
        </div>
        <button className="btn btn-primary download-report-btn">
          <FontAwesomeIcon icon={faFileDownload} /> <span>Download Full Report</span>
        </button>
      </div>

      <div className="modern-course-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card-enhanced">
            <div className="card-accent" style={{ backgroundColor: course.color }}></div>
            <div className="card-body-content">
              <div className="card-row-top">
                <div className="icon-circle" style={{ backgroundColor: `${course.color}15`, color: course.color }}>
                  <FontAwesomeIcon icon={faBook} />
                </div>
                <div className="grade-indicator">
                  <span className="label">Grade</span>
                  <span className="value">{course.grade}</span>
                </div>
              </div>
              <div className="course-main-info">
                <h4 className="course-name-title">{course.name}</h4>
                <div className="teacher-pill">
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>{course.teacher}</span>
                </div>
              </div>
              <div className="progress-mini-section">
                <div className="prog-text">
                  <span>Subject Mastery</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="prog-bar-bg">
                  <div className="prog-bar-fill" style={{ width: `${course.progress}%`, backgroundColor: course.color }}></div>
                </div>
              </div>
              <button className="view-detail-btn" onClick={() => setSelectedCourse(course)}>
                <span>View Full Details</span>
                <FontAwesomeIcon icon={faAngleRight} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}