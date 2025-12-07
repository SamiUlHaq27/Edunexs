import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faGraduationCap, faCalendarCheck, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function ParentCourses() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"grades" | "attendance">("grades");

  const courses = [
    { id: 1, name: "Mathematics 101", teacher: "Mr. Smith", grade: "A" },
    { id: 2, name: "Physics", teacher: "Dr. Ali", grade: "B+" },
    { id: 3, name: "English Literature", teacher: "Ms. Johnson", grade: "A-" }
  ];

  if (!selectedCourse) {
    return (
      <div>
        <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Select a Course</h3>
        <div className="card-grid">
           {courses.map(course => (
             <div key={course.id} className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{course.name}</h4>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>{course.teacher}</p>
                   </div>
                   <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {course.grade}
                   </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setSelectedCourse(course.name)}>
                   View Details <FontAwesomeIcon icon={faArrowRight} />
                </button>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn" onClick={() => setSelectedCourse(null)} style={{ marginBottom: '1rem' }}>
        ← Back to Courses
      </button>

      <div className="card settings-container">
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{selectedCourse}</h3>
            <div className="tabs" style={{ margin: 0 }}>
               <button className={`tab ${activeTab === 'grades' ? 'tab-active' : ''}`} onClick={() => setActiveTab('grades')}>
                  <FontAwesomeIcon icon={faGraduationCap} /> Grades
               </button>
               <button className={`tab ${activeTab === 'attendance' ? 'tab-active' : ''}`} onClick={() => setActiveTab('attendance')}>
                  <FontAwesomeIcon icon={faCalendarCheck} /> Attendance
               </button>
            </div>
         </div>

         {activeTab === 'grades' ? (
            <table className="data-table">
               <thead><tr><th>Assessment</th><th>Date</th><th>Score</th><th>Remarks</th></tr></thead>
               <tbody>
                  <tr><td>Mid-Term Exam</td><td>Oct 15, 2024</td><td><span style={{fontWeight:'bold', color:'#0066ff'}}>85/100</span></td><td>Good performance</td></tr>
                  <tr><td>Quiz 1</td><td>Nov 01, 2024</td><td><span style={{fontWeight:'bold', color:'#0066ff'}}>9/10</span></td><td>-</td></tr>
                  <tr><td>Assignment 3</td><td>Nov 10, 2024</td><td><span style={{fontWeight:'bold', color:'#0066ff'}}>18/20</span></td><td>Late submission</td></tr>
               </tbody>
            </table>
         ) : (
            <div>
               <div className="dashboard-grid-modern" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
                  <div className="stat-card" style={{ textAlign: 'center', background: '#ecfdf5', color: '#065f46' }}>
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>95%</div>
                     <div>Present</div>
                  </div>
                  <div className="stat-card" style={{ textAlign: 'center', background: '#fffbeb', color: '#92400e' }}>
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>2</div>
                     <div>Late</div>
                  </div>
                  <div className="stat-card" style={{ textAlign: 'center', background: '#fef2f2', color: '#991b1b' }}>
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1</div>
                     <div>Absent</div>
                  </div>
               </div>
               <table className="data-table">
                  <thead><tr><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                     <tr><td>Nov 28, 2024</td><td><span className="status-badge status-active">Present</span></td></tr>
                     <tr><td>Nov 27, 2024</td><td><span className="status-badge status-active">Present</span></td></tr>
                     <tr><td>Nov 26, 2024</td><td><span className="status-badge status-inactive">Absent</span></td></tr>
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
}